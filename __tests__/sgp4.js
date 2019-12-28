import {
	clearCache,
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

const nsToMS = (nsArray) => {
	const [seconds, nanoseconds] = nsArray;
	return (seconds * MS_PER_SEC) + (nanoseconds / NS_PER_MSEC);
};

const getHRTimeDiffNS = diff => {
	return diff[0] * NS_PER_SEC + diff[1];
};

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.51418347  .00001345  00000-0  27503-4 0  9993
2 25544  51.6396 207.2711 0006223  72.3525  71.7719 15.54224686 67715`;

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
		expect(result.lat).toEqual(34.43928468167498);
		expect(result.lng).toEqual(-117.47561026844932);
		expect(parseFloat(result.azimuth.toFixed(7))).toEqual(292.8251393);
		expect(parseFloat(result.elevation.toFixed(7))).toEqual(81.5452178);
		expect(result.range).toEqual(406.8007926883391);
		expect(result.height).toEqual(403.0134527800419);
		expect(result.velocity).toEqual(7.675511980883446);
	});

	describe("memoization", () => {
		let firstRunTimeMS = 0;

		const fn = () => {
			const timestamp = 1501039268000;
			const bigBearLatLng = {
				lat: 34.243889,
				lng: -116.911389
			};
			getSatelliteInfo(tleStr, timestamp, bigBearLatLng.lat, bigBearLatLng.lng);
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

			expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS * 10);
		});
	});
});

describe("getLatLngObj", () => {
	test("Big Bear flyover", () => {
		const timestamp = 1501039265000;
		const result = getLatLngObj(tleStr, timestamp);
		const expectedResult = {
			lat: 34.43928468167498,
			lng: -117.47561026844932
		};
		expect(result).toEqual(expectedResult);
	});
});

describe("getOrbitTrack", () => {
	beforeEach(() => {
		clearCache();
	});

	test("memoizes", async () => {
		const timeStart1 = nsToMS(process.hrtime());
		const coords1 = await getOrbitTrack({ tle: tleArr, startTimeMS: 1501039265000 });
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart1;

		const timeStart2 = nsToMS(process.hrtime());
		const coords2 = await getOrbitTrack({ tle: tleArr, startTimeMS: 1501039265000 });
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart2;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", async () => {
		const coords = await getOrbitTrack({ tle: tleArr, startTimeMS: 1501039265000 });
		expect(coords.length).toEqual(4595);
	});
});

describe("getOrbitTrackSync", () => {
	beforeEach(() => {
		clearCache();
	});

	test("memoizes", async () => {
		const timeStart1 = nsToMS(process.hrtime());
		const coords1 = getOrbitTrackSync({ tle: tleArr, startTimeMS: 1501049265000 });
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart1;

		const timeStart2 = nsToMS(process.hrtime());
		const coords2 = getOrbitTrackSync({ tle: tleArr, startTimeMS: 1501049265000 });
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart2;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", () => {
		const coords = getOrbitTrackSync({ tle: tleArr, startTimeMS: 1501039265000 });
		expect(coords.length).toEqual(4595);
	});
});

describe("getGroundTracks", () => {
	beforeEach(() => {
		clearCache();
	});

	test("memoizes", async () => {
		const timeStart1 = nsToMS(process.hrtime());
		const coords1 = await getGroundTracks({ tle: tleArr, startTimeMS: 1501039265000 });
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart1;

		const timeStart2 = nsToMS(process.hrtime());
		const coords2 = await getGroundTracks({ tle: tleArr, startTimeMS: 1501039265000 });
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart2;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", async () => {
		const coords = await getGroundTracks({ tle: tleArr, startTimeMS: 1501039265000 });
		expect(coords.length).toEqual(3);
	});
});

describe("getGroundTracksSync", () => {
	beforeEach(() => {
		clearCache();
	});

	test("1", () => {
		const coords = getGroundTracksSync({ tle: tleArr, startTimeMS: 1501039265000 });
		expect(coords.length).toEqual(3);
	});
});

  describe('problematic TLES (geosync, decayed)', () => {
    const tleStr = `ABS-3
1 24901U 97042A   17279.07057876  .00000084  00000-0  00000+0 0  9995
2 24901   5.0867  62.6208 0007858 138.4124 258.4388  0.99995119 73683`;

    test('getLatLon', () => {
      const timestamp = 1501039265000;
      const result = getLatLngObj(tleStr, timestamp);
      const expectedResult = {
        lat: 4.353016018653351,
        lng: 129.632535483672
      };
      expect(result).toEqual(expectedResult);
    });

    test('getLastAntemeridianCrossingTimeMS not found', () => {
      const timestamp = 1501039265000;
      const result = getLastAntemeridianCrossingTimeMS(tleStr, timestamp);
      const expectedResult = -1;
      expect(result).toEqual(expectedResult);
    });

    test('getOrbitTrack', async () => {
      const timestamp = 1501039265000;
      const result = await getOrbitTrack({ tle: tleStr, startTimeMS: timestamp });
      expect(result.length).toEqual(6002);
    });

    test('getGroundTracks', async () => {
      const timestamp = 1501039265000;
      const result = await getGroundTracks({ tle: tleStr, startTimeMS: timestamp });
      expect(result.length).toEqual(1);
      expect(result[0].length).toEqual(362);
    });

    test('getOrbitTrack problematic 1', () => {
      const problemTLE = ['FLOCK 1B-28',
'1 40423U 98067FP  15219.24788283  .05567779  12028-4  14293-2 0  9997',
'2 40423  51.6133 170.3484 0007348 241.2767 118.7501 16.27910103 34192'];
      expect(() => getOrbitTrack(problemTLE, 1501039265000).to.throw());
    });

    test('getOrbitTrack problematic 2', () => {
      const problemTLE = ['MICROMAS',
'1 40457U 98067GA  15213.38588329  .08885032  12472-4  72013-3 0  9998',
'2 40457  51.6142 195.6182 0009646 310.7124  49.3640 16.38908268 33335'];
      expect(() => getOrbitTrack(problemTLE, 1501039265000).to.throw());
    });
  });

describe("getVisibleSatellites", () => {
	beforeEach(() => {
		clearCache();
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
		const allVisible = getVisibleSatellites(
			34.439283990227125,
			-117.47561122364522,
			0,
			uniqTLES,
			0,
			1570911182419
		);
		const firstRunTimeNS = nsToMS(process.hrtime()) - timeStart;

		timeStart = nsToMS(process.hrtime());
		const allVisibleSecondRun = getVisibleSatellites(
			34.439283990227125,
			-117.47561122364522,
			0,
			uniqTLES,
			0,
			1570911192419
		);
		const secondRunTimeNS = nsToMS(process.hrtime()) - timeStart;

		expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
	});

	test("1", () => {
		const allVisible = getVisibleSatellites(
			34.439283990227125,
			-117.47561122364522,
			0,
			uniqTLES,
			0,
			1570911182419
		);
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

		expect(allVisible.length).toEqual(369);
		expect(deg75to90.length).toEqual(2);
		expect(deg50to75.length).toEqual(38);
		expect(deg25to50.length).toEqual(156);
		expect(deg0to25.length).toEqual(173);

		const allVisibleSoonAfter = getVisibleSatellites(
			34.439283990227125,
			-117.47561122364522,
			0,
			uniqTLES,
			0,
			1570911199419
		);
		expect(allVisibleSoonAfter.length).toEqual(373);
	});

	test("with high elevation threshold", () => {
		const allVisible = getVisibleSatellites(
			34.439283990227125,
			-117.47561122364522,
			0,
			uniqTLES,
			75,
			1570911182419
		);
		expect(allVisible.length).toEqual(2);
	});
});
