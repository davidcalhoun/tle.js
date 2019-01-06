const expect = require('expect');
const TLEJS = require('../src/main');

const NS_PER_SEC = 1e9;

const getHRTimeDiffNS = (diff) => {
  return diff[0] * NS_PER_SEC + diff[1];
}

describe('getters', function(){
  let tle;
  beforeEach(() => {
    tle = new TLEJS();
  });

  const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;

  const tleStr2 = `TIANZHOU 1
1 42684U 17021A   17221.56595738 -.00000599  00000-0 -29896-5 0  9990
2 42684  42.7845  37.8962 0002841 275.1472 140.9012 15.57909698 17345`;

  describe('name', () => {
    it('getSatelliteName', () => {
      expect(tle.getSatelliteName(tleStr)).toEqual('ISS (ZARYA)');
    });

    it('getSatelliteName 2', () => {
      expect(tle.getSatelliteName(tleStr2)).toEqual('TIANZHOU 1');
    });
  });

  describe('line 1', () => {
    it('getLineNumber1', () => {
      const result = tle.getLineNumber1(tleStr);
      const expectedResult = 1;
      expect(result).toEqual(expectedResult);
    });

    it('getSatelliteNumber', () => {
      expect(tle.getSatelliteNumber(tleStr)).toEqual(25544);
    });

    it('getClassification', () => {
      expect(tle.getClassification(tleStr)).toEqual('U');
    });

    it('getIntDesignatorYear', () => {
      expect(tle.getIntDesignatorYear(tleStr)).toEqual(98);
    });

    it('getIntDesignatorLaunchNumber', () => {
      expect(tle.getIntDesignatorLaunchNumber(tleStr)).toEqual(67);
    });

    it('getIntDesignatorPieceOfLaunch', () => {
      expect(tle.getIntDesignatorPieceOfLaunch(tleStr)).toEqual('A');
    });

    it('getEpochYear', () => {
      expect(tle.getEpochYear(tleStr)).toEqual(17);
    });

    it('getEpochDay', () => {
      expect(tle.getEpochDay(tleStr)).toEqual(206.18396726);
    });

    it('getEpochTimestamp', () => {
      expect(tle.getEpochTimestamp(tleStr)).toEqual(1500956694771);
    });

    it('getFirstTimeDerivative', () => {
      expect(tle.getFirstTimeDerivative(tleStr)).toEqual(0.00001961);
    });

    it('getSecondTimeDerivative', () => {
      expect(tle.getSecondTimeDerivative(tleStr)).toEqual(0);
    });

    it('getSecondTimeDerivative 2', () => {
      expect(tle.getSecondTimeDerivative(tleStr2)).toEqual(0);
    });

    it('getBstarDrag', () => {
      expect(tle.getBstarDrag(tleStr)).toEqual(0.000036771);
    });

    it('getBstarDrag 2', () => {
      expect(tle.getBstarDrag(tleStr2)).toEqual(-0.0000029896);
    });

    it('getOrbitModel', () => {
      expect(tle.getOrbitModel(tleStr)).toEqual(0);
    });

    it('getTleSetNumber', () => {
      expect(tle.getTleSetNumber(tleStr)).toEqual(999);
    });

    it('getChecksum1', () => {
      expect(tle.getChecksum1(tleStr)).toEqual(3);
    });
  });


  describe('line 2', () => {
    it('getLineNumber2', () => {
      expect(tle.getLineNumber2(tleStr)).toEqual(2);
    });

    it('getSatelliteNumber2', () => {
      expect(tle.getSatelliteNumber2(tleStr)).toEqual(25544);
    });

    it('getInclination', () => {
      expect(tle.getInclination(tleStr)).toEqual(51.6400);
    });

    it('getRightAscension', () => {
      expect(tle.getRightAscension(tleStr)).toEqual(208.9163);
    });

    it('getEccentricity', () => {
      expect(tle.getEccentricity(tleStr)).toEqual(0.0006317);
    });

    it('getEccentricity 2', () => {
      expect(tle.getEccentricity(tleStr2)).toEqual(0.0002841);
    });

    it('getPerigee', () => {
      expect(tle.getPerigee(tleStr)).toEqual(69.9862);
    });

    it('getMeanAnomaly', () => {
      expect(tle.getMeanAnomaly(tleStr)).toEqual(25.2906);
    });

    it('getMeanMotion', () => {
      expect(tle.getMeanMotion(tleStr)).toEqual(15.54225995);
    });

    it('getRevNumberAtEpoch', () => {
      expect(tle.getRevNumberAtEpoch(tleStr)).toEqual(6766);
    });

    it('getChecksum2', () => {
      expect(tle.getChecksum2(tleStr)).toEqual(0);
    });
  });
});