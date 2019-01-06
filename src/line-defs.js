const { _DATA_TYPES } = require('./constants');

const line1 = {
  /* TLE line number. Will always return 1 for valid TLEs. */
  lineNumber1: {
    start: 0,
    length: 1,
    type: _DATA_TYPES._INT
  },

  /**
   * NORAD satellite catalog number (Sputnik's rocket was 00001).
   *
   * Range: 0 to 99999
   * Example: 25544
   */
  satelliteNumber: {
    start: 2,
    length: 5,
    type: _DATA_TYPES._INT
  },

  /**
   * Satellite classification.
   * 'U' = unclassified
   * 'C' = classified
   * 'S' = secret)
   *
   * Example: 'U'
   */
  classification: {
    start: 7,
    length: 1,
    type: _DATA_TYPES._CHAR
  },

  /**
   * International Designator: Last 2 digits of launch year. 57 to 99 = 1900s, 00-56 = 2000s.
   * See https://en.wikipedia.org/wiki/International_Designator
   *
   * Range: 00 to 99
   * Example: 98
   */
  intDesignatorYear: {
    start: 9,
    length: 2,
    type: _DATA_TYPES._INT
  },

  /**
   * International Designator: Launch number of the year.
   * See https://en.wikipedia.org/wiki/International_Designator
   *
   * Range: 1 to 999
   * Example: 67
   */
  intDesignatorLaunchNumber: {
    start: 11,
    length: 3,
    type: _DATA_TYPES._INT
  },

  /**
   * International Designator: Piece of the launch.
   * See https://en.wikipedia.org/wiki/International_Designator
   *
   * Range: A to ZZZ
   * Example: 'A'
   */
  intDesignatorPieceOfLaunch: {
    start: 14,
    length: 3,
    type: _DATA_TYPES._CHAR
  },

  /**
   * Year when the TLE was generated (TLE epoch), last two digits.
   *
   * Range: 00 to 99
   * Example: 17
   */
  epochYear: {
    start: 18,
    length: 2,
    type: _DATA_TYPES._INT
  },

  /**
   * Fractional day of the year when the TLE was generated (TLE epoch).
   *
   * Range: 1 to 365.99999999
   * Example: 206.18396726
   */
  epochDay: {
    start: 20,
    length: 12,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * First Time Derivative of the Mean Motion divided by two.  Defines how mean motion changes
   * from day to day, so TLE propagators can still be used to make reasonable guesses when
   * times are distant from the original TLE epoch.
   *
   * Units: Orbits / day ^ 2
   * Example: 0.00001961
   */
  firstTimeDerivative: {
    start: 33,
    length: 11,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * Second Time Derivative of Mean Motion divided by six (decimal point assumed). Measures rate
   * of change in the Mean Motion Dot so software can make reasonable guesses when times are
   * distant from the original TLE epoch.
   *
   * Usually zero, unless the satellite is manuevering or in a decaying orbit.
   *
   * Units: Orbits / day ^ 3.
   * Example: 0 ('00000-0' in the original TLE [= 0.00000 * 10 ^ 0])
   */
  secondTimeDerivative: {
    start: 44,
    length: 8,
    type: _DATA_TYPES._DECIMAL_ASSUMED_E
  },

  /**
   * BSTAR drag term (decimal point assumed).  Estimates the effects of
   * atmospheric drag on the satellite's motion.
   *
   * Units: EarthRadii ^ -1
   * Example: 0.000036771 ('36771-4' in the original TLE [= 0.36771 * 10 ^ -4])
   */
  bstarDrag: {
    start: 53,
    length: 8,
    type: _DATA_TYPES._DECIMAL_ASSUMED_E
  },

  /**
   * Private value - used by Air Force Space Command to reference the orbit model used to
   * generate the TLE.  Will always be seen as zero externally (e.g. by "us", unless you are
   * "them" - in which case, hello!).
   *
   * Example: 0
   */
  orbitModel: {
    start: 62,
    length: 1,
    type: _DATA_TYPES._INT
  },

  /**
   * TLE element set number, incremented for each new TLE generated. 999 seems to mean the TLE
   * has maxed out.
   *
   * Range: Technically 1 to 9999, though in practice the maximum number seems to be 999.
   * Example: 999
   */
  tleSetNumber: {
    start: 64,
    length: 4,
    type: _DATA_TYPES._INT
  },

  /*
   * TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE.
   *
   * Range: 0 to 9
   * Example: 3
   */
  checksum1: {
    start: 68,
    length: 1,
    type: _DATA_TYPES._INT
  }
};

const line2 = {
  /* TLE line number. Will always return 2 for valid TLEs. */
  lineNumber2: {
    start: 0,
    length: 1,
    type: _DATA_TYPES._INT
  },

  /**
   * NORAD satellite catalog number (Sputnik's rocket was 00001).  Should match the satellite
   * number on line 1.
   *
   * Range: 0 to 99999
   * Example: 25544
   */
  satelliteNumber2: {
    start: 2,
    length: 5,
    type: _DATA_TYPES._INT
  },

  /**
   * Inclination relative to the Earth's equatorial plane in degrees. 0 to 90 degrees is a
   * prograde orbit and 90 to 180 degrees is a retrograde orbit.
   *
   * Units: degrees
   * Range: 0 to 180
   * Example: 51.6400
   */
  inclination: {
    start: 8,
    length: 8,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * Right ascension of the ascending node in degrees. Essentially, this is the angle of the
   * satellite as it crosses northward (ascending) across the Earth's equator (equatorial
   * plane).
   *
   * Units: degrees
   * Range: 0 to 359.9999
   * Example: 208.9163
   */
  rightAscension: {
    start: 17,
    length: 8,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * Orbital eccentricity, decimal point assumed. All artifical Earth satellites have an
   * eccentricity between 0 (perfect circle) and 1 (parabolic orbit).
   *
   * Range: 0 to 1
   * Example: 0.0006317 (`0006317` in the original TLE)
   */
  eccentricity: {
    start: 26,
    length: 7,
    type: _DATA_TYPES._DECIMAL_ASSUMED
  },

  /**
   * Argument of perigee. See https://en.wikipedia.org/wiki/Argument_of_perigee
   * Units: degrees
   * Range: 0 to 359.9999
   * Example: 69.9862
   */
  perigee: {
    start: 34,
    length: 8,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * Mean anomaly. Indicates where the satellite was located within its orbit at the time of the
   * TLE epoch.
   * See https://en.wikipedia.org/wiki/Mean_Anomaly
   *
   * Units: degrees
   * Range: 0 to 359.9999
   * Example: 25.2906
   */
  meanAnomaly: {
    start: 43,
    length: 8,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * Revolutions around the Earth per day (mean motion).
   * See https://en.wikipedia.org/wiki/Mean_Motion
   *
   * Range: 0 to 17 (theoretically)
   * Example: 15.54225995
   */
  meanMotion: {
    start: 52,
    length: 11,
    type: _DATA_TYPES._FLOAT
  },

  /**
   * Total satellite revolutions when this TLE was generated. This number seems to roll over
   * (e.g. 99999 -> 0).
   *
   * Range: 0 to 99999
   * Example: 6766
   */
  revNumberAtEpoch: {
    start: 63,
    length: 5,
    type: _DATA_TYPES._INT
  },

  /*
   * TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE.
   *
   * Range: 0 to 9
   * Example: 0
   */
  checksum2: {
    start: 68,
    length: 1,
    type: _DATA_TYPES._INT
  }
};

/**
 * Fixed locations of orbital element value strings as they have appeared going back to the
 * punchcard days.
 * See https://en.wikipedia.org/wiki/Two-line_element_set.
 */
module.exports = {
  line1,
  line2
}
