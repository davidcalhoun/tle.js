const expect = require('expect');
const tle = require('../tle.js');

const NS_PER_SEC = 1e9;

const getHRTimeDiffNS = (diff) => {
  return diff[0] * NS_PER_SEC + diff[1];
}

describe('tle.js', function(){
  const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

  const tleArr = tleStr.split('\n');

  describe('parseTLE', () => {
    it('errors on invalid type', () => {
      expect(() => {
        tle.parseTLE(new Date());
      }).toThrow('TLE passed is invalid type object');
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

  // describe('getSatGroundSpeed', () => {
  //   it('1', () => {
  //     const result = tle.getSatGroundSpeed(tleStr, 1501052618772);
  //     const expectedResult = 6.943747800497668;
  //     expect(result).toEqual(expectedResult);
  //   });
  // });

  describe('getDistanceBetweenPoints', () => {
    it('1', () => {
      const result = tle.getDistanceBetweenPointsGround(34.267411, -116.947186, 34.243889, -116.911389);
      const expectedResult = 4.202964410817332;
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
      expect(result).toEqual(expectedResult);
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

        expect(firstRunTimeNS - 100000).toBeGreaterThan(secondRunTimeNS);
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
        lat: 34.439283990227125,
        lng: -117.47561122364522
      };
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getLookAngles', () => {
    const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.51418347  .00001345  00000-0  27503-4 0  9993
2 25544  51.6396 207.2711 0006223  72.3525  71.7719 15.54224686 67715`;

    it('Big Bear flyover', () => {
      const timestamp = 1501039265000;
      const bigBearLatLng = {
        lat: 34.243889,
        lng: -116.911389
      }
      const result = tle.getLookAngles(tleStr, timestamp, bigBearLatLng.lat, bigBearLatLng.lng);
      const expectedResult = {
        azimuth: 122.82844783685059,
        elevation: 35.825753735867735,
        range: 652.5738693731333
      };
      expect(result).toEqual(expectedResult);
    });
  });
});