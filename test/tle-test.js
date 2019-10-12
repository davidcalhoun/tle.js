const expect = require('expect');
const TLEJS = require('../src/main');
const fs = require('fs');
const R = require('ramda');

const NS_PER_SEC = 1e9;

const getHRTimeDiffNS = (diff) => {
  return diff[0] * NS_PER_SEC + diff[1];
}

describe('tle.js', function(){
  let tle;
  beforeEach(() => {
    tle = new TLEJS();
  });

  const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

  const tleArr = tleStr.split('\n');

  describe('parseTLE', () => {
    it('errors on invalid type', () => {
      expect(() => {
        tle.parseTLE(new Date());
      }).toThrow('TLE input is invalid');
    });

    describe('string', () => {
      it('parses with name', () => {
        const result = tle.parseTLE(tleStr);
        const expectedResult = {
          name: tleArr[0],
          arr: tleArr.slice(1, 3)
        };
        expect(result).toEqual(expectedResult);
      });

      it('parses without name', () => {
        const tleStr2 = `1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
        const result = tle.parseTLE(tleStr2);
        const expectedResult = {
          name: 'Unknown',
          arr: tleArr.slice(1, 3)
        };

        expect(result).toEqual(expectedResult);
      });

      it('with extra spaces', () => {
        const tleStr3 = `  1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
               2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660     `;
        const result = tle.parseTLE(tleStr3);
        const expectedResult = {
          name: 'Unknown',
          arr: tleArr.slice(1, 3)
        };

        expect(result).toEqual(expectedResult);
      });
    });
  });


  describe('getTLEEpochTimestamp', () => {
    it('1', () => {
      const result = tle.getTLEEpochTimestamp(tleStr);
      const expectedResult = 1500956694771;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getVisibleSatellites', () => {
    let tleText;
    try {
        tleText = fs.readFileSync(`${ __dirname }/tles.txt`, 'utf8');
    } catch (e) {
        console.log(e.stack);
    }

    const arr = tleText.split('\n');
    const tles = R.splitEvery(3, arr);

    it('1', () => {
      const allVisible = tle.getVisibleSatellites(34.439283990227125, -117.47561122364522, 0, tles, 0, 1570911182419);
      const deg75to90 = allVisible.filter(sat => sat.info.elevation >= 75);
      const deg50to75 = allVisible.filter(sat => sat.info.elevation > 50 && sat.info.elevation < 75);
      const deg25to50 = allVisible.filter(sat => sat.info.elevation > 25 && sat.info.elevation < 50);
      const deg0to25 = allVisible.filter(sat => sat.info.elevation > 0 && sat.info.elevation < 25);

      expect(allVisible.length).toEqual(760);
      expect(deg75to90.length).toEqual(5);
      expect(deg50to75.length).toEqual(66);
      expect(deg25to50.length).toEqual(361);
      expect(deg0to25.length).toEqual(328);
    });

    it('with elevation threshold', () => {
      const allVisible = tle.getVisibleSatellites(34.439283990227125, -117.47561122364522, 0, tles, 75, 1570911182419);
      expect(allVisible.length).toEqual(5);
    });
  });

  describe('getters (auto-generated)', () => {
    it('getLineNumber1', () => {
      const result = tle.getLineNumber1(tleStr);
      const expectedResult = 1;
      expect(result).toEqual(expectedResult);
    });

    it('getLineNumber2', () => {
      const result = tle.getLineNumber2(tleStr);
      const expectedResult = 2;
      expect(result).toEqual(expectedResult);
    });

    it('getChecksum1', () => {
      const result = tle.getChecksum1(tleStr);
      const expectedResult = 3;
      expect(result).toEqual(expectedResult);
    });

    it('getChecksum2', () => {
      const result = tle.getChecksum2(tleStr);
      const expectedResult = 0;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('isValidTLE', () => {
    it('validates', () => {
      const result = tle.isValidTLE(tleStr);
      const expectedResult = true;
      expect(result).toEqual(expectedResult);
    });

    it('fails to validate when checksum is bad', () => {
      const str = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9999
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
      const result = tle.isValidTLE(str);
      const expectedResult = false;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('tleLineChecksum', () => {
    it('1', () => {
      const str = '1 37820U 11053A   17206.57682878  .00025514  00000-0  13004-3 0  9995';
      const result = tle.tleLineChecksum(str);
      const expectedResult = 5;
      expect(result).toEqual(expectedResult);
    });

    it('2', () => {
      const str = '2 37820  42.7593 324.6017 0020085 348.1948  81.3822 15.80564343334044';
      const result = tle.tleLineChecksum(str);
      const expectedResult = 4;
      expect(result).toEqual(expectedResult);
    });

    it('3', () => {
      const result = tle.tleLineChecksum(tleArr[1]);
      const expectedResult = 3;
      expect(result).toEqual(expectedResult);
    });

    it('4', () => {
      const result = tle.tleLineChecksum(tleArr[2]);
      const expectedResult = 0;
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSatelliteInfo', () => {
    const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.51418347  .00001345  00000-0  27503-4 0  9993
2 25544  51.6396 207.2711 0006223  72.3525  71.7719 15.54224686 67715`;

    it('Big Bear flyover', () => {
      const timestamp = 1501039265000;
      const bigBearLatLng = {
        lat: 34.243889,
        lng: -116.911389
      }
      const result = tle.getSatelliteInfo(tleStr, timestamp, bigBearLatLng.lat, bigBearLatLng.lng);
      const expectedResult = {
        lat: 34.439283990227125,
        lng: -117.47561122364522,
        azimuth: 292.8250329147109,
        elevation: 81.54520744236196,
        range: 406.80066121261547,
        height: 403.01331234690133,
        velocity: 7.675512139515791
      };
      expect(result.lat).toEqual(34.43928468167498);
      expect(result.lng).toEqual(-117.47561026844932);
      expect(result.azimuth.toFixed(7)).toEqual(292.8251393);
      expect(result.elevation.toFixed(7)).toEqual(81.5452178);
      expect(result.range).toEqual(406.8007926883391);
      expect(result.height).toEqual(403.0134527800419);
      expect(result.velocity).toEqual(7.675511980883446);
    });

    describe('memoization', () => {
      let firstRunTimeMS = 0;

      const fn = () => {
        const timestamp = 1501039268000;
        const bigBearLatLng = {
          lat: 34.243889,
          lng: -116.911389
        }
        tle.getSatelliteInfo(tleStr, timestamp, bigBearLatLng.lat, bigBearLatLng.lng);
      };

      it('1', () => {
        let timeStart = process.hrtime();
        fn();
        const firstDiff = process.hrtime(timeStart);
        const firstRunTimeNS = getHRTimeDiffNS(firstDiff);

        timeStart = process.hrtime();
        fn();
        const secondDiff = process.hrtime(timeStart)
        const secondRunTimeNS = getHRTimeDiffNS(secondDiff);

        expect(firstRunTimeNS).toBeGreaterThan(secondRunTimeNS);
      })
    });
  });

  describe('getLatLon', () => {
    const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.51418347  .00001345  00000-0  27503-4 0  9993
2 25544  51.6396 207.2711 0006223  72.3525  71.7719 15.54224686 67715`;

    it('Big Bear flyover', () => {
      const timestamp = 1501039265000;
      const result = tle.getLatLon(tleStr, timestamp);
      const expectedResult = {
        lat: 34.43928468167498,
        lng: -117.47561026844932
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getOrbitTrackAsync', () => {
    it('1', async () => {
      const timestamp = 1501039265000;
      const latLons = await tle.getOrbitTrackAsync(tleArr, timestamp);
      expect(latLons.length).toEqual(4594);
    });
  });

  describe('geosynchronous orbit', () => {
    const tleStr = `ABS-3
1 24901U 97042A   17279.07057876  .00000084  00000-0  00000+0 0  9995
2 24901   5.0867  62.6208 0007858 138.4124 258.4388  0.99995119 73683`;

    it('getLatLon', () => {
      const timestamp = 1501039265000;
      const result = tle.getLatLon(tleStr, timestamp);
      const expectedResult = {
        lat: 4.353016018653351,
        lng: 129.632535483672
      };
      expect(result).toEqual(expectedResult);
    });

    it('getLastAntemeridianCrossingTimeMS', () => {
      const timestamp = 1501039265000;
      const result = tle.getLastAntemeridianCrossingTimeMS(tleStr, timestamp);
      const expectedResult = -1;
      expect(result).toEqual(expectedResult);
    });

    it('getOrbitTrack', () => {
      const timestamp = 1501039265000;
      const result = tle.getOrbitTrack(tleStr.split('\n'), timestamp, 1000);
      const expectedResult = 6001;
      expect(result.length).toEqual(expectedResult);
    });

    it('getGroundTrackLatLng', () => {
      const timestamp = 1501039265000;
      const result = tle.getGroundTrackLatLng(tleStr, 1000, timestamp);
      expect(result.length).toEqual(1);
      expect(result[0].length).toEqual(145);
    });

    it('getOrbitTrack problematic 1', () => {
      const problemTLE = ['FLOCK 1B-28',
'1 40423U 98067FP  15219.24788283  .05567779  12028-4  14293-2 0  9997',
'2 40423  51.6133 170.3484 0007348 241.2767 118.7501 16.27910103 34192'];
      expect(() => tle.getOrbitTrack(problemTLE, 1501039265000).to.throw());
    });

    it('getOrbitTrack problematic 2', () => {
      const problemTLE = ['MICROMAS',
'1 40457U 98067GA  15213.38588329  .08885032  12472-4  72013-3 0  9998',
'2 40457  51.6142 195.6182 0009646 310.7124  49.3640 16.38908268 33335'];
      expect(() => tle.getOrbitTrack(problemTLE, 1501039265000).to.throw());
    });
  });

});