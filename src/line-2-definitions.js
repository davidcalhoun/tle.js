import { _TLE_DATA_TYPES } from "./constants";

/**
 * Two-Line Element Set (TLE) format definitions, Line 2
 * See https://en.wikipedia.org/wiki/Two-line_element_set and https://celestrak.com/columns/v04n03/
 */

/* TLE line number. Will always return 2 for valid TLEs. */
export const lineNumber2 = {
	start: 0,
	length: 1,
	type: _TLE_DATA_TYPES._INT
};

/**
 * NORAD satellite catalog number (Sputnik's rocket was 00001).  Should match the satellite
 * number on line 1.
 *
 * Range: 0 to 99999
 * Example: 25544
 */
export const catalogNumber2 = {
	start: 2,
	length: 5,
	type: _TLE_DATA_TYPES._INT
};

/**
 * Inclination relative to the Earth's equatorial plane in degrees. 0 to 90 degrees is a
 * prograde orbit and 90 to 180 degrees is a retrograde orbit.
 *
 * Units: degrees
 * Range: 0 to 180
 * Example: 51.6400
 */
export const inclination = {
	start: 8,
	length: 8,
	type: _TLE_DATA_TYPES._FLOAT
};

/**
 * Right ascension of the ascending node in degrees. Essentially, this is the angle of the
 * satellite as it crosses northward (ascending) across the Earth's equator (equatorial
 * plane).
 *
 * Units: degrees
 * Range: 0 to 359.9999
 * Example: 208.9163
 */
export const rightAscension = {
	start: 17,
	length: 8,
	type: _TLE_DATA_TYPES._FLOAT
};

/**
 * Orbital eccentricity, decimal point assumed. All artificial Earth satellites have an
 * eccentricity between 0 (perfect circle) and 1 (parabolic orbit).
 *
 * Range: 0 to 1
 * Example: 0.0006317 (`0006317` in the original TLE)
 */
export const eccentricity = {
	start: 26,
	length: 7,
	type: _TLE_DATA_TYPES._DECIMAL_ASSUMED
};

/**
 * Argument of perigee. See https://en.wikipedia.org/wiki/Argument_of_perigee
 * Units: degrees
 * Range: 0 to 359.9999
 * Example: 69.9862
 */
export const perigee = {
	start: 34,
	length: 8,
	type: _TLE_DATA_TYPES._FLOAT
};

/**
 * Mean anomaly. Indicates where the satellite was located within its orbit at the time of the
 * TLE epoch.
 * See https://en.wikipedia.org/wiki/Mean_Anomaly
 *
 * Units: degrees
 * Range: 0 to 359.9999
 * Example: 25.2906
 */
export const meanAnomaly = {
	start: 43,
	length: 8,
	type: _TLE_DATA_TYPES._FLOAT
};

/**
 * Revolutions around the Earth per day (mean motion).
 * See https://en.wikipedia.org/wiki/Mean_Motion
 *
 * Range: 0 to 17 (theoretically)
 * Example: 15.54225995
 */
export const meanMotion = {
	start: 52,
	length: 11,
	type: _TLE_DATA_TYPES._FLOAT
};

/**
 * Total satellite revolutions when this TLE was generated. This number rolls over
 * (e.g. 99999 -> 0).
 *
 * Range: 0 to 99999
 * Example: 6766
 */
export const revNumberAtEpoch = {
	start: 63,
	length: 5,
	type: _TLE_DATA_TYPES._INT
};

/*
 * TLE line 2 checksum (modulo 10), for verifying the integrity of this line of the TLE.
 *
 * Range: 0 to 9
 * Example: 0
 */
export const checksum2 = {
	start: 68,
	length: 1,
	type: _TLE_DATA_TYPES._INT
};
