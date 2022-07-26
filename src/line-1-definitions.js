import { _TLE_DATA_TYPES } from "./constants";

/**
 * Two-Line Element Set (TLE) format definitions, Line 1
 * See https://en.wikipedia.org/wiki/Two-line_element_set and https://celestrak.com/columns/v04n03/
 */

/* TLE line number. Will always return 1 for valid TLEs. */
export const lineNumber1 = {
	start: 0,
	length: 1,
	type: _TLE_DATA_TYPES._INT
};

/**
 * NORAD satellite catalog number (e.g. Sputnik's rocket was number 00001).
 * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
 * 
 * NOTE: This will not handle Alpha-5 satellites.
 * See https://www.space-track.org/documentation#tle-alpha5
 *
 * Range: 0 to 99999
 * Example: 25544
 */
export const catalogNumber1 = {
	start: 2,
	length: 5,
	type: _TLE_DATA_TYPES._INT
};

/**
 * Satellite classification.
 * 'U' = unclassified
 * 'C' = confidential
 * 'S' = secret
 *
 * Example: 'U'
 */
export const classification = {
	start: 7,
	length: 1,
	type: _TLE_DATA_TYPES._CHAR
};

/**
 * International Designator (COSPAR ID): Last 2 digits of launch year.
 * 57 to 99 = 1900s, 00-56 = 2000s
 * See https://en.wikipedia.org/wiki/International_Designator
 *
 * Range: 00 to 99
 * Example: 98
 */
export const intDesignatorYear = {
	start: 9,
	length: 2,
	type: _TLE_DATA_TYPES._INT
};

/**
 * International Designator (COSPAR ID): Launch number of the year.
 * See https://en.wikipedia.org/wiki/International_Designator
 *
 * Range: 1 to 999
 * Example: 67
 */
export const intDesignatorLaunchNumber = {
	start: 11,
	length: 3,
	type: _TLE_DATA_TYPES._INT
};

/**
 * International Designator  (COSPAR ID): Piece of the launch.
 * See https://en.wikipedia.org/wiki/International_Designator
 *
 * Range: A to ZZZ
 * Example: 'A'
 */
export const intDesignatorPieceOfLaunch = {
	start: 14,
	length: 3,
	type: _TLE_DATA_TYPES._CHAR
};

/**
 * Year when the TLE was generated (TLE epoch), last two digits.
 * 
 * 57 to 99 = 1900s, 00-56 = 2000s
 *
 * Range: 00 to 99
 * Example: 17
 */
export const epochYear = {
	start: 18,
	length: 2,
	type: _TLE_DATA_TYPES._INT
};

/**
 * Fractional day of the year when the TLE was generated (TLE epoch).
 *
 * Range: 1 to 365.99999999
 * Example: 206.18396726
 */
export const epochDay = {
	start: 20,
	length: 12,
	type: _TLE_DATA_TYPES._FLOAT
};

/**
 * First Time Derivative of the Mean Motion divided by two.  Defines how mean motion changes
 * from day to day, so TLE propagators can still be used to make reasonable guesses when
 * times are distant from the original TLE epoch.
 *
 * Units: Orbits / day ^ 2
 * Example: 0.00001961
 */
export const firstTimeDerivative = {
	start: 33,
	length: 11,
	type: _TLE_DATA_TYPES._FLOAT
};

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
export const secondTimeDerivative = {
	start: 44,
	length: 8,
	type: _TLE_DATA_TYPES._DECIMAL_ASSUMED_E
};

/**
 * BSTAR drag term (decimal point assumed).  Estimates the effects of
 * atmospheric drag on the satellite's motion.
 *
 * Units: EarthRadii ^ -1
 * Example: 0.000036771 ('36771-4' in the original TLE [= 0.36771 * 10 ^ -4])
 */
export const bstarDrag = {
	start: 53,
	length: 8,
	type: _TLE_DATA_TYPES._DECIMAL_ASSUMED_E
};

/**
 * Private value - used by United States Space Force to reference the orbit model used to
 * generate the TLE.  Will always be seen as zero externally (e.g. by "us", unless you are
 * "them" - in which case, hello!).
 *
 * Example: 0
 */
export const orbitModel = {
	start: 62,
	length: 1,
	type: _TLE_DATA_TYPES._INT
};

/**
 * TLE element set number, incremented for each new TLE generated. 999 seems to mean the TLE
 * has maxed out.
 *
 * Range: Technically 1 to 9999, though in practice the maximum number seems to be 999.
 * Example: 999
 */
export const tleSetNumber = {
	start: 64,
	length: 4,
	type: _TLE_DATA_TYPES._INT
};

/*
 * TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE.
 *
 * Range: 0 to 9
 * Example: 3
 */
export const checksum1 = {
	start: 68,
	length: 1,
	type: _TLE_DATA_TYPES._INT
};
