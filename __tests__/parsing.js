import { parseTLE, isValidTLE, computeChecksum, clearTLEParseCache } from "../src";

const tleStr = `ISS (ZARYA)                     
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

const tleArr = tleStr.split("\n");

describe("parseTLE", () => {
	beforeEach(clearTLEParseCache);

	describe("invalid types", () => {
		test("errors on invalid type number", () => {
			expect(() => {
				parseTLE(2);
			}).toThrow();
		});

		test("errors on invalid object", () => {
			expect(() => {
				parseTLE({ foo: 2 });
			}).toThrow();
		});
	});

	describe("string", () => {
		test("parses", () => {
			const result = parseTLE(tleStr);
			expect(result.name).toBe(tleArr[0].trim());
			expect(result.tle).toEqual(tleArr.slice(1));
		});

		test("parses with no name", () => {
			const tleStrNoName = `1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
			const result = parseTLE(tleStrNoName);
			expect(typeof result.name).toBe("undefined");
			expect(result.tle).toEqual(tleStrNoName.split("\n"));
		});

		test("parses with extra spaces", () => {
			const tleStrNoName = `     1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993    
   2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660    `;
			const result = parseTLE(tleStrNoName);
			expect(typeof result.name).toBe("undefined");
			expect(result.tle).toEqual(tleArr.slice(1));
		});
	});

	describe("array", () => {
		test("parses", () => {
			const result = parseTLE(tleArr);
			expect(result.name).toBe(tleArr[0].trim());
			expect(result.tle).toEqual(tleArr.slice(1));
		});

		test("parses with no name", () => {
			const tleArrNoName = [
				"1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993",
				"2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660"
			];
			const result = parseTLE(tleArrNoName);
			expect(typeof result.name).toBe("undefined");
			expect(result.tle).toEqual(tleArrNoName);
		});

		test("parses with extra spaces", () => {
			const tleArrNoName = [
				"     1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993    ",
				"2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660    "
			];
			const result = parseTLE(tleArrNoName);
			expect(typeof result.name).toBe("undefined");
			expect(result.tle).toEqual(tleArrNoName.map(line => line.trim()));
		});
	});

	describe("parsed object", () => {
		test("returns exact original input ref (not a copy)", () => {
			const input = {
				name: "ISS (ZARYA)",
				tle: [
					"1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993",
					"2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660"
				]
			};

			const result = parseTLE(input);

			expect(result).toBe(input);
		});
	});
});

describe("isValidTLE", () => {
	test("true on formatted TLE object", () => {
		const input = {
			name: "ISS (ZARYA)",
			tle: [
				"1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993",
				"2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660"
			]
		};

		expect(isValidTLE(input)).toBe(true);
	});

	test("false on array length 3", () => {
		const input = {
			name: "ISS (ZARYA)",
			tle: [
				"foo",
				"1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993",
				"2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660"
			]
		};

		expect(isValidTLE(input)).toBe(false);
	});

	test("false on bad checksum on line 1", () => {
		const str = `ISS (ZARYA)
	1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9999
	2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
		const result = isValidTLE(str);
		const expectedResult = false;
		expect(result).toEqual(expectedResult);
	});

	test("false on bad checksum on line 2", () => {
		const str = `ISS (ZARYA)
	1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
	2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67661`;
		const result = isValidTLE(str);
		const expectedResult = false;
		expect(result).toEqual(expectedResult);
	});

	test("false on bad line number on line 1", () => {
		const str = `ISS (ZARYA)
	3 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
	2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
		const result = isValidTLE(str);
		const expectedResult = false;
		expect(result).toEqual(expectedResult);
	});

	test("false on bad line number on line 2", () => {
		const str = `ISS (ZARYA)
	1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
	4 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
		const result = isValidTLE(str);
		const expectedResult = false;
		expect(result).toEqual(expectedResult);
	});

	test("true on alt TLE format", () => {
		const str = `0 SKYSAT C12
1 43797U 18099AR  20029.52879878 +.00000391 +00000-0 +19261-4 0  9990
2 43797 097.3805 103.0646 0003500 182.3187 177.8034 15.23559221063758`;
		const result = isValidTLE(str);
		const expectedResult = true;
		expect(result).toEqual(expectedResult);
	});
});

describe("computeChecksum", () => {
	test("1", () => {
		const str =
			"1 37820U 11053A   17206.57682878  .00025514  00000-0  13004-3 0  9995";
		const result = computeChecksum(str);
		const expectedResult = 5;
		expect(result).toEqual(expectedResult);
	});

	test("2", () => {
		const str =
			"2 37820  42.7593 324.6017 0020085 348.1948  81.3822 15.80564343334044";
		const result = computeChecksum(str);
		const expectedResult = 4;
		expect(result).toEqual(expectedResult);
	});

	test("3", () => {
		const result = computeChecksum(tleArr[1]);
		const expectedResult = 3;
		expect(result).toEqual(expectedResult);
	});

	test("4", () => {
		const result = computeChecksum(tleArr[2]);
		const expectedResult = 0;
		expect(result).toEqual(expectedResult);
	});
});
