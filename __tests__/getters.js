import {
	getAverageOrbitTimeMins,
	getAverageOrbitTimeMS,
	getAverageOrbitTimeS,
	getBstarDrag,
	getCatalogNumber,
	getCatalogNumber1,
	getCatalogNumber2,
	getChecksum1,
	getChecksum2,
	getClassification,
	getEccentricity,
	getEpochDay,
	getEpochTimestamp,
	getEpochYear,
	getFirstTimeDerivative,
	getInclination,
	getIntDesignatorLaunchNumber,
	getIntDesignatorPieceOfLaunch,
	getIntDesignatorYear,
	getLineNumber1,
	getLineNumber2,
	getMeanAnomaly,
	getMeanMotion,
	getOrbitModel,
	getPerigee,
	getRevNumberAtEpoch,
	getRightAscension,
	getSatelliteName,
	getSecondTimeDerivative,
	getTleSetNumber,
	getCOSPAR,
} from "../src";

describe("getters", () => {
	const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

	const tleStr2 = `TIANZHOU 1
1 42684U 17021A   17221.56595738 -.00000599  00000-0 -29896-5 0  9990
2 42684  42.7845  37.8962 0002841 275.1472 140.9012 15.57909698 17345`;

	const tleStr3 = `1 42684U 17021A   17221.56595738 -.00000599  00000-0 -29896-5 0  9990
2 42684  42.7845  37.8962 0002841 275.1472 140.9012 15.57909698 17345`;

	const tleStr4 = `0 ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

	const issDebris1 = [
		"ISS DEB",
		"1 44303U 98067QA  20168.11979959  .00002872  00000-0  50277-4 0  9995",
		"2 44303  51.6421 345.5785 0004933 328.2807  31.7886 15.54325834 59558",
	];

	const issDebris2 = [
		"ISS DEB",
		"1 44304U 98067QB  20168.07956297  .00014700  00000-0  17368-3 0  9997",
		"2 44304  51.6395 337.0565 0003893 303.8223  56.2400 15.61553656 59676",
	];

	describe("line 1", () => {
		test("getLineNumber1", () => {
			const result = getLineNumber1(tleStr);
			const expectedResult = 1;
			expect(result).toEqual(expectedResult);
		});

		test("getCatalogNumber1", () => {
			expect(getCatalogNumber1(tleStr)).toEqual(25544);
		});

		// test("getCatalogNumber1 with fast parse", () => {
		// 	const foo1Tle = `NAVSTAR 36 (USA 100)
		// 	1 23027U 94016A   19285.20755132 -.00000086  00000-0  00000+0 0  9998
		// 	2 23027  54.9322   0.6920 0146060  38.6267  29.7804  2.00563499187506`

		// 	const foo2Tle = `CALSPHERE 2
		// 	1 00902U 64063E   19284.79850769  .00000028  00000-0  27716-4 0  9992
		// 	2 00902  90.1650  26.9325 0020194 109.7527  15.5497 13.52676491526332`

		// 	let slowParse;
		// 	let fastParse;
		// 	let slowTimeMS = Date.now();

		// 	slowParse = getCatalogNumber1(foo1Tle, false);
		// 	slowTimeMS = Date.now() - slowTimeMS;

		// 	let fastTimeMS = Date.now();
		// 	fastParse = getCatalogNumber1(foo2Tle, false, true);
		// 	fastTimeMS = Date.now() - fastTimeMS;

		// 	expect(slowParse).toEqual(23027);
		// 	expect(fastParse).toEqual(902);
		// 	expect(slowTimeMS > fastTimeMS).toBe(true);
		// });

		test("getClassification", () => {
			expect(getClassification(tleStr)).toEqual("U");
		});

		test("getIntDesignatorYear", () => {
			expect(getIntDesignatorYear(tleStr)).toEqual(98);
		});

		test("getIntDesignatorLaunchNumber", () => {
			expect(getIntDesignatorLaunchNumber(tleStr)).toEqual(67);
		});

		test("getIntDesignatorPieceOfLaunch", () => {
			expect(getIntDesignatorPieceOfLaunch(tleStr)).toEqual("A");
		});

		test("getEpochYear", () => {
			expect(getEpochYear(tleStr)).toEqual(17);
		});

		test("getEpochDay", () => {
			expect(getEpochDay(tleStr)).toEqual(206.18396726);
		});

		test("getFirstTimeDerivative", () => {
			expect(getFirstTimeDerivative(tleStr)).toEqual(0.00001961);
		});

		test("getSecondTimeDerivative", () => {
			expect(getSecondTimeDerivative(tleStr)).toEqual(0);
		});

		test("getSecondTimeDerivative 2", () => {
			expect(getSecondTimeDerivative(tleStr2)).toEqual(0);
		});

		test("getBstarDrag", () => {
			expect(getBstarDrag(tleStr)).toEqual(0.000036771);
		});

		test("getBstarDrag 2", () => {
			expect(getBstarDrag(tleStr2)).toEqual(-0.0000029896);
		});

		test("getOrbitModel", () => {
			expect(getOrbitModel(tleStr)).toEqual(0);
		});

		test("getTleSetNumber", () => {
			expect(getTleSetNumber(tleStr)).toEqual(999);
		});

		test("getChecksum1", () => {
			expect(getChecksum1(tleStr)).toEqual(3);
		});
	});

	describe("line 2", () => {
		test("getLineNumber2", () => {
			expect(getLineNumber2(tleStr)).toEqual(2);
		});

		test("getCatalogNumber2", () => {
			expect(getCatalogNumber2(tleStr)).toEqual(25544);
		});

		test("getInclination", () => {
			expect(getInclination(tleStr)).toEqual(51.64);
		});

		test("getRightAscension", () => {
			expect(getRightAscension(tleStr)).toEqual(208.9163);
		});

		test("getEccentricity", () => {
			expect(getEccentricity(tleStr)).toEqual(0.0006317);
		});

		test("getEccentricity 2", () => {
			expect(getEccentricity(tleStr2)).toEqual(0.0002841);
		});

		test("getPerigee", () => {
			expect(getPerigee(tleStr)).toEqual(69.9862);
		});

		test("getMeanAnomaly", () => {
			expect(getMeanAnomaly(tleStr)).toEqual(25.2906);
		});

		test("getMeanMotion", () => {
			expect(getMeanMotion(tleStr)).toEqual(15.54225995);
		});

		test("getRevNumberAtEpoch", () => {
			expect(getRevNumberAtEpoch(tleStr)).toEqual(6766);
		});

		test("getChecksum2", () => {
			expect(getChecksum2(tleStr)).toEqual(0);
		});
	});

	describe("sugar fn getters", () => {
		describe("getSatelliteName", () => {
			test("ISS", () => {
				expect(getSatelliteName(tleStr)).toEqual("ISS (ZARYA)");
			});

			test("0 prefix", () => {
				expect(getSatelliteName(tleStr4)).toEqual("ISS (ZARYA)");
			});

			test("TIANZHOU", () => {
				expect(getSatelliteName(tleStr2)).toEqual("TIANZHOU 1");
			});

			test("Unknown", () => {
				expect(getSatelliteName(tleStr3)).toEqual("Unknown");
			});

			test("Unknown", () => {
				expect(getSatelliteName(tleStr3, true)).toEqual("2017-021A");
			});
		});

		test("getCatalogNumber", () => {
			expect(getCatalogNumber(tleStr)).toEqual(25544);
		});

		test("getCOSPAR", () => {
			expect(getCOSPAR(tleStr)).toEqual("1998-067A");
		});

		test("getEpochTimestamp", () => {
			expect(getEpochTimestamp(tleStr)).toEqual(1500956694771);
		});

		test("getEpochTimestamp 2 with untrimmed spaces", () => {
			const tle = `ISS (ZARYA)
		                 1 25544U 98067A   22005.58472471  .00003968  00000+0  77828-4 0  9998  
		                 2 25544  51.6440  61.8159 0005338   6.5542 157.7978 15.49868185319960  `;
			expect(getEpochTimestamp(tle)).toEqual(1641391320214);
		});

		test("getAverageOrbitTimeMins", () => {
			expect(getAverageOrbitTimeMins(tleStr)).toEqual(92.65061666666666);
		});

		test("getAverageOrbitTimeS", () => {
			expect(getAverageOrbitTimeS(tleStr)).toEqual(5559.037);
		});

		test("getAverageOrbitTimeMS", () => {
			expect(getAverageOrbitTimeMS(tleStr)).toEqual(5559037);
		});
	});

	describe('issues', () => {
		describe('issue 14: bad cache key (dupe sat names)', () => {
			test("getCatalogNumber", () => {
				expect(getCatalogNumber(issDebris1)).toEqual(44303);
				expect(getCatalogNumber(issDebris2)).toEqual(44304);
			});
		});
	});
});
