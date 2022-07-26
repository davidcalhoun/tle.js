import {
	getCacheSizes,
	clearCache,
	clearTLEParseCache,
	getGroundTracks,
	getGroundTracksSync,
	getLatLngObj,
	getOrbitTrack,
	getOrbitTrackSync,
	getSatelliteInfo,
	getVisibleSatellites,
	getLastAntemeridianCrossingTimeMS
} from "../src";
import fs from "fs";
import R from "ramda";

const NS_PER_SEC = 1e9;
const NS_PER_MSEC = 1e6;
const MS_PER_SEC = 1000;

const nsToMS = nsArray => {
	const [seconds, nanoseconds] = nsArray;
	return seconds * MS_PER_SEC + nanoseconds / NS_PER_MSEC;
};

const getHRTimeDiffNS = diff => {
	return diff[0] * NS_PER_SEC + diff[1];
};

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.51418347  .00001345  00000-0  27503-4 0  9993
2 25544  51.6396 207.2711 0006223  72.3525  71.7719 15.54224686 67715`;

const proxima2 = `PROXIMA II              
1 43696U 18088G   21129.25183023  .00001100  00000-0  45012-4 0  9990
2 43696  85.0353 221.2351 0019671 158.2001 202.0083 15.22857070138409`;

const tleArr = tleStr.split("\n");

describe("getSatelliteInfo", () => {
	test("Big Bear flyover", () => {
		const timestamp = 1501039265000;
		const bigBearLatLng = {
			lat: 34.243889,
			lng: -116.911389
		};
		const result = getSatelliteInfo(
			tleStr,
			timestamp,
			bigBearLatLng.lat,
			bigBearLatLng.lng
		);
		expect(result.lat).toBeCloseTo(34.43928468167498, 4);
		expect(result.lng).toBeCloseTo(-117.47561026844932, 4);
		expect(result.azimuth).toBeCloseTo(292.8250329, 4);
		expect(result.elevation).toBeCloseTo(81.54520744236196, 4);
		expect(result.range).toBeCloseTo(406.80066121261547, 4);
		expect(result.height).toBeCloseTo(403.01331234690133, 4);
		expect(result.velocity).toBeCloseTo(7.675512139515791, 4);
	});

	describe("memoization", () => {
		const fn = () => {
			const timestamp = 1501039268000;
			const bigBearLatLng = {
				lat: 34.243889,
				lng: -116.911389
			};
			getSatelliteInfo(
				tleStr,
				timestamp,
				bigBearLatLng.lat,
				bigBearLatLng.lng
			);
		};

		test("1", () => {
			let timeStart = process.hrtime();
			fn();
			const firstDiff = process.hrtime(timeStart);
			const firstRunTimeNS = getHRTimeDiffNS(firstDiff);

			timeStart = process.hrtime();
			fn();
			const secondDiff = process.hrtime(timeStart);
			const secondRunTimeNS = getHRTimeDiffNS(secondDiff);

			expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS * 2);
		});
	});

	test("broken TLE", () => {
		// Incomplete TLE example, missing the second line.
		const incompleteTLE = `INMARSAT 3-F5
		1 25153U 98006B   21168.18180503 -.00000283  00000-0  00000+0 0  9996`;
		const observerLat = -21.1709;
		const observerLng = -47.8213;
		const observerAlt = 0.543;

		expect(() => getSatelliteInfo(incompleteTLE, null, observerLat, observerLng, observerAlt).to.throw());
	});
});

describe("getLatLngObj", () => {
	test("Big Bear flyover", () => {
		const timestamp = 1501039265000;
		const result = getLatLngObj(tleStr, timestamp);
		expect(result.lat).toBeCloseTo(34.439283990227125, 4);
		expect(result.lng).toBeCloseTo(-117.4756112236452, 4);
	});
});

describe('clearCache', () => {
	test('clears the cache', () => {
		const timestamp = 1501039268000;
		const bigBearLatLng = {
			lat: 34.243889,
			lng: -116.911389
		};
		getSatelliteInfo(
			tleStr,
			timestamp,
			bigBearLatLng.lat,
			bigBearLatLng.lng
		);
		expect(getCacheSizes()).toEqual([3,0,0,0]);
		clearCache();
		expect(getCacheSizes()).toEqual([0,0,0,0]);
	});
});

describe("getOrbitTrack", () => {
	beforeEach(() => {
		clearCache();
		clearTLEParseCache();
	});

	test("memoizes", async () => {
		const timeStart1 = nsToMS(process.hrtime());
		await getOrbitTrack({
			tle: tleArr,
			startTimeMS: 1501039265000
		});
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart1;

		const timeStart2 = nsToMS(process.hrtime());
		await getOrbitTrack({
			tle: tleArr,
			startTimeMS: 1501039265000
		});
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart2;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", async () => {
		const coords = await getOrbitTrack({
			tle: tleArr,
			startTimeMS: 1501039265000
		});
		expect(coords.length).toEqual(4594);
	});
});

describe("getOrbitTrackSync", () => {
	beforeEach(() => {
		clearCache();
		clearTLEParseCache();
	});

	test("memoizes", async () => {
		const timeStart1 = nsToMS(process.hrtime());
		getOrbitTrackSync({
			tle: tleArr,
			startTimeMS: 1501049265000
		});
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart1;

		const timeStart2 = nsToMS(process.hrtime());
		getOrbitTrackSync({
			tle: tleArr,
			startTimeMS: 1501049265000
		});
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart2;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", () => {
		const coords = getOrbitTrackSync({
			tle: tleArr,
			startTimeMS: 1501039265000
		});
		expect(coords.length).toEqual(4594);
	});
});

describe("getGroundTracks", () => {
	beforeEach(() => {
		clearCache();
		clearTLEParseCache();
	});

	test("memoizes", async () => {
		const timeStart1 = nsToMS(process.hrtime());
		await getGroundTracks({
			tle: tleArr,
			startTimeMS: 1501039265000
		});
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart1;

		const timeStart2 = nsToMS(process.hrtime());
		await getGroundTracks({
			tle: tleArr,
			startTimeMS: 1501039265000
		});
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart2;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", async () => {
		const coords = await getGroundTracks({
			tle: tleArr,
			startTimeMS: 1501039265000
		});

		expect(coords.length).toBe(3);
		const firstLng = coords[0][0][0];
		const lastLng = coords[0][coords[0].length - 1][0];

		expect(firstLng).toBe(-179.9996305056871);
		expect(lastLng).toBe(179.9939688862288);
	});

	test("2", async () => {
		const timestamp = 1620583838732;
		const result = await getGroundTracks({
			tle: proxima2,
			startTimeMS: timestamp
		});
		expect(result[0][0][0]).toBeCloseTo(-179.65354);
		expect(result[0][0][1]).toBeCloseTo(84.57353);
		expect(result[1][0][0]).toBeCloseTo(-179.68200);
		expect(result[1][0][1]).toBeCloseTo(85.06215);
		expect(result[2][0][0]).toBeCloseTo(-179.89417);
		expect(result[2][0][1]).toBeCloseTo(84.63849);
	});
});

describe("getGroundTracksSync", () => {
	beforeEach(() => {
		clearCache();
		clearTLEParseCache();
	});

	test("1", () => {
		const coords = getGroundTracksSync({
			tle: tleArr,
			optionalTimeMS: 1501039265000
		});
		expect(coords.length).toBe(3);

		const firstLng = coords[0][0][0];
		const lastLng = coords[0][coords[0].length - 1][0];
		expect(firstLng).toBe(-179.9996305056871);
		expect(lastLng).toBe(179.9939688862288);
	});

	test("2", async () => {
		const timestamp = 1620583838732;
		const result = await getGroundTracksSync({
			tle: proxima2,
			optionalTimeMS: timestamp
		});
		expect(result[0][0][0]).toBeCloseTo(-179.65354);
		expect(result[0][0][1]).toBeCloseTo(84.57353);
		expect(result[1][0][0]).toBeCloseTo(-179.68200);
		expect(result[1][0][1]).toBeCloseTo(85.06215);
		expect(result[2][0][0]).toBeCloseTo(-179.89417);
		expect(result[2][0][1]).toBeCloseTo(84.63849);
	});
});

describe("problematic TLES (geosync, decayed)", () => {
	const tleStr = `ABS-3
1 24901U 97042A   17279.07057876  .00000084  00000-0  00000+0 0  9995
2 24901   5.0867  62.6208 0007858 138.4124 258.4388  0.99995119 73683`;

	test("getLatLon", () => {
		const timestamp = 1501039265000;
		const result = getLatLngObj(tleStr, timestamp);
		const expectedResult = {
			lat: 4.353016018653351,
			lng: 129.632535483672
		};
		expect(result).toEqual(expectedResult);
	});

	test("getLastAntemeridianCrossingTimeMS not found", () => {
		const timestamp = 1501039265000;
		const result = getLastAntemeridianCrossingTimeMS(tleStr, timestamp);
		const expectedResult = -1;
		expect(result).toEqual(expectedResult);
	});

	test("getLastAntemeridianCrossingTimeMS 2", () => {
		const timestamp = 1620579956208;
		const result = getLastAntemeridianCrossingTimeMS(proxima2, timestamp);
		const expectedResult = -1;
		expect((timestamp - result) / 1000 / 60).toBeCloseTo(72.50);
	});

	test("getLastAntemeridianCrossingTimeMS 3", () => {
		const timestamp = 1620581856788;
		const result = getLastAntemeridianCrossingTimeMS(proxima2, timestamp);
		const expectedResult = -1;
		expect((timestamp - result) / 1000 / 60).toBeCloseTo(8.976);
	});

	test("getOrbitTrack", async () => {
		const timestamp = 1501039265000;
		const result = await getOrbitTrack({
			tle: tleStr,
			startTimeMS: timestamp
		});
		expect(result.length).toEqual(6001);
	});

	test("getGroundTracks", async () => {
		const timestamp = 1501039265000;
		const result = await getGroundTracks({
			tle: tleStr,
			startTimeMS: timestamp
		});
		expect(result.length).toEqual(1);
		expect(result[0].length).toEqual(361);
	});

	test("getOrbitTrack problematic 1", () => {
		const problemTLE = [
			"FLOCK 1B-28",
			"1 40423U 98067FP  15219.24788283  .05567779  12028-4  14293-2 0  9997",
			"2 40423  51.6133 170.3484 0007348 241.2767 118.7501 16.27910103 34192"
		];
		expect(() => getOrbitTrack(problemTLE, 1501039265000).to.throw());
	});

	test("getOrbitTrack problematic 2", () => {
		const problemTLE = [
			"MICROMAS",
			"1 40457U 98067GA  15213.38588329  .08885032  12472-4  72013-3 0  9998",
			"2 40457  51.6142 195.6182 0009646 310.7124  49.3640 16.38908268 33335"
		];
		expect(() => getOrbitTrack(problemTLE, 1501039265000).to.throw());
	});
});

describe("getVisibleSatellites", () => {
	beforeEach(() => {
		clearCache();
		clearTLEParseCache();
	});

	let tleText;
	try {
		tleText = fs.readFileSync(`${__dirname}/tles.txt`, "utf8");
	} catch (e) {
		console.log(e.stack);
	}

	const arr = tleText.split("\n");
	const tles = R.splitEvery(3, arr);

	const getTLEComparator = threeLineTLE => threeLineTLE[1];
	const uniqTLES = R.uniqBy(getTLEComparator, tles);

	test("memoizes", () => {
		let timeStart = nsToMS(process.hrtime());
		getVisibleSatellites({
			observerLat: 34.439283990227125,
			observerLng: -117.47561122364522,
			observerHeight: 0,
			tles: uniqTLES,
			elevationThreshold: 0,
			timestampMS: 1570911182419
		});
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart;

		timeStart = nsToMS(process.hrtime());
		getVisibleSatellites({
			observerLat: 34.439283990227125,
			observerLng: -117.47561122364522,
			observerHeight: 0,
			tles: uniqTLES,
			elevationThreshold: 0,
			timestampMS: 1570911182419
		});
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", () => {
		const allVisible = getVisibleSatellites({
			observerLat: 34.439283990227125,
			observerLng: -117.47561122364522,
			observerHeight: 0,
			tles: uniqTLES,
			elevationThreshold: 0,
			timestampMS: 1570911182419
		});
		const deg75to90 = allVisible.filter(sat => sat.info.elevation >= 75);
		const deg50to75 = allVisible.filter(
			sat => sat.info.elevation >= 50 && sat.info.elevation < 75
		);
		const deg25to50 = allVisible.filter(
			sat => sat.info.elevation >= 25 && sat.info.elevation < 50
		);
		const deg0to25 = allVisible.filter(
			sat => sat.info.elevation >= 0 && sat.info.elevation < 25
		);

		expect(allVisible.length).toEqual(8);
		expect(deg75to90.length).toEqual(2);
		expect(deg50to75.length).toEqual(2);
		expect(deg25to50.length).toEqual(2);
		expect(deg0to25.length).toEqual(2);
	});

	test("with high elevation threshold", () => {
		const allVisible = getVisibleSatellites({
			observerLat: 34.439283990227125,
			observerLng: -117.47561122364522,
			observerHeight: 0,
			tles: uniqTLES,
			elevationThreshold: 75,
			timestampMS: 1570911182419
		});
		expect(allVisible.length).toEqual(2);
	});

	test("ISS over turkey", () => {
		const tles = [
			[
				"ISS (ZARYA)             ",
				"1 25544U 98067A   20029.69572272  .00004768  00000-0  94250-4 0  9992",
				"2 25544  51.6452 318.6562 0005196 207.4446 220.3378 15.49124691210396"
			]
		];

		const allVisible = getVisibleSatellites({
			observerLat: 37.61474,
			observerLng: 34.533634,
			observerHeight: 0,
			tles,
			elevationThreshold: 0,
			timestampMS: 1580388303650
		});

		expect(allVisible.length).toEqual(1);
	});

	test("Skysat C12 over turkey", () => {
		const tles = [
			[
				"SKYSAT-C12              ",
				"1 43797U 18099AR  20028.80634152  .00000360  00000-0  17971-4 0  9996",
				"2 43797  97.3806 102.3540 0003424 184.8709 175.2495 15.23558338 63645"
			]
		];

		const allVisible = getVisibleSatellites({
			observerLat: 37.61474,
			observerLng: 34.533634,
			observerHeight: 0,
			tles,
			elevationThreshold: 0,
			timestampMS: 1580372100000
		});

		expect(allVisible.length).toEqual(1);
	});

	test("Skysat C12 over turkey 2", () => {
		const tles = [
			[
				"0 SKYSAT C12",
				"1 43797U 18099AR  20029.52879878 +.00000391 +00000-0 +19261-4 0  9990",
				"2 43797 097.3805 103.0646 0003500 182.3187 177.8034 15.23559221063758"
			]
		];

		const allVisible = getVisibleSatellites({
			observerLat: 37.61474,
			observerLng: 34.533634,
			observerHeight: 0,
			tles,
			elevationThreshold: 0,
			timestampMS: 1580372100000
		});

		expect(allVisible.length).toEqual(1);
	});
});
