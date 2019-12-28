import { parseTLE } from "./parsing";
import {
	catalogNumber2,
	checksum2,
	eccentricity,
	inclination,
	lineNumber2,
	meanAnomaly,
	meanMotion,
	perigee,
	revNumberAtEpoch,
	rightAscension
} from "./line-2-definitions";
import { getFromTLE } from "./utils";

/**
 * General helper to get a piece of data from the second line of a TLE.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Object} definition From `line-1-definitions.js`
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getFromLine2(tle, definition, isTLEParsed = false) {
	const parsedTLE = isTLEParsed ? tle : parseTLE(tle);

	return getFromTLE(parsedTLE, 2, definition);
}

/**
 * Returns the line number from line 2.  Should always return "2" for valid TLEs.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getLineNumber2(tle, isTLEParsed) {
	return getFromLine2(tle, lineNumber2, isTLEParsed);
}

/**
 * Returns the line number from line 1.  Should always return "1" for valid TLEs.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getCatalogNumber2(tle, isTLEParsed) {
	return getFromLine2(tle, catalogNumber2, isTLEParsed);
}

/**
 * Returns the inclination relative to the Earth's equatorial plane in degrees. 0 to 90 degrees is a
 * prograde orbit and 90 to 180 degrees is a retrograde orbit.
 * See https://en.wikipedia.org/wiki/Orbital_inclination
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getInclination(tle, isTLEParsed) {
	return getFromLine2(tle, inclination, isTLEParsed);
}

/**
 * Returns the right ascension of the ascending node in degrees. Essentially, this is the angle of
 * the satellite as it crosses northward (ascending) across the Earth's equator (equatorial plane).
 * See https://en.wikipedia.org/wiki/Right_ascension_of_the_ascending_node
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getRightAscension(tle, isTLEParsed) {
	return getFromLine2(tle, rightAscension, isTLEParsed);
}

/**
 * Returns the orbital eccentricity. All artificial Earth satellites have an eccentricity between 0
 * (perfect circle) and 1 (parabolic orbit).
 * See https://en.wikipedia.org/wiki/Orbital_eccentricity
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getEccentricity(tle, isTLEParsed) {
	return getFromLine2(tle, eccentricity, isTLEParsed);
}

/**
 * Returns the argument of perigee.
 * See https://en.wikipedia.org/wiki/Argument_of_perigee
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getPerigee(tle, isTLEParsed) {
	return getFromLine2(tle, perigee, isTLEParsed);
}

/**
 * Returns the Mean Anomaly. Indicates where the satellite was located within its orbit at the time
 * of the TLE epoch.
 * See https://en.wikipedia.org/wiki/Mean_Anomaly
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getMeanAnomaly(tle, isTLEParsed) {
	return getFromLine2(tle, meanAnomaly, isTLEParsed);
}

/**
 * Returns the revolutions around the Earth per day (mean motion).
 * See https://en.wikipedia.org/wiki/Mean_Motion
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getMeanMotion(tle, isTLEParsed) {
	return getFromLine2(tle, meanMotion, isTLEParsed);
}

/**
 * Returns the total satellite revolutions when this TLE was generated. This number seems to roll
 * over (e.g. 99999 -> 0).
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getRevNumberAtEpoch(tle, isTLEParsed) {
	return getFromLine2(tle, revNumberAtEpoch, isTLEParsed);
}

/**
 * TLE line 2 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that
 * letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getChecksum2(tle, isTLEParsed) {
	return getFromLine2(tle, checksum2, isTLEParsed);
}
