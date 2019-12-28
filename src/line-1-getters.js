import { parseTLE } from "./parsing";
import {
	bstarDrag,
	catalogNumber1,
	checksum1,
	classification,
	epochDay,
	epochYear,
	firstTimeDerivative,
	intDesignatorLaunchNumber,
	intDesignatorPieceOfLaunch,
	intDesignatorYear,
	lineNumber1,
	orbitModel,
	secondTimeDerivative,
	tleSetNumber
} from "./line-1-definitions";
import { getFromTLE } from "./utils";

/**
 * General helper to get a piece of data from the first line of a TLE.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Object} definition From `line-1-definitions.js`
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getFromLine1(tle, definition, isTLEParsed = false) {
	const parsedTLE = isTLEParsed ? tle : parseTLE(tle);

	return getFromTLE(parsedTLE, 1, definition);
}

/**
 * Returns the line number from line 1.  Should always return "1" for valid TLEs.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getLineNumber1(tle, isTLEParsed) {
	return getFromLine1(tle, lineNumber1, isTLEParsed);
}

/**
 * Returns the Space Catalog Number (aka NORAD Catalog Number).
 * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getCatalogNumber1(tle, isTLEParsed) {
	return getFromLine1(tle, catalogNumber1, isTLEParsed);
}

/**
 * Returns the satellite classification.  For example, an unclassified satellite will return `U`.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getClassification(tle, isTLEParsed) {
	return getFromLine1(tle, classification, isTLEParsed);
}

/**
 * Returns the launch year (last two digits), which makes up part of the COSPAR id
 * (international designator).  For example, a satellite launched in 1999 will return "99".
 * See https://en.wikipedia.org/wiki/International_Designator
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getIntDesignatorYear(tle, isTLEParsed) {
	return getFromLine1(tle, intDesignatorYear, isTLEParsed);
}

/**
 * Returns the launch number of the year, which makes up part of the COSPAR id
 * (international designator).  For example, the 50th launch of the year will return "50".
 * See https://en.wikipedia.org/wiki/International_Designator
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getIntDesignatorLaunchNumber(tle, isTLEParsed) {
	return getFromLine1(tle, intDesignatorLaunchNumber, isTLEParsed);
}

/**
 * Returns the piece of the launch, which makes up part of the COSPAR id (international designator).
 * For example, the first piece of the launch will return "A".
 * See https://en.wikipedia.org/wiki/International_Designator
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getIntDesignatorPieceOfLaunch(tle, isTLEParsed) {
	return getFromLine1(tle, intDesignatorPieceOfLaunch, isTLEParsed);
}

/**
 * Returns the TLE epoch year (last two digits) when the TLE was generated.  For example, a TLE
 * generated in 2022 will return `22`.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getEpochYear(tle, isTLEParsed) {
	return getFromLine1(tle, epochYear, isTLEParsed);
}

/**
 * Returns the TLE epoch day of the year (day of year with fractional portion of the day) when the
 * TLE was generated.  For example, a TLE generated on January 1 will return something like
 * `1.18396726`.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getEpochDay(tle, isTLEParsed) {
	return getFromLine1(tle, epochDay, isTLEParsed);
}

/**
 * First Time Derivative of the Mean Motion divided by two, measured in orbits per day per day
 * (orbits/day2). Defines how mean motion changes from day to day, so TLE propagators can still be
 * used to make reasonable guesses when distant from the original TLE epoch.
 * See https://en.wikipedia.org/wiki/Mean_Motion
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getFirstTimeDerivative(tle, isTLEParsed) {
	return getFromLine1(tle, firstTimeDerivative, isTLEParsed);
}

/**
 * Second Time Derivative of Mean Motion divided by six, measured in orbits per day per day per day
 * (orbits/day3). Similar to the first time derivative, it measures rate of change in the Mean
 * Motion Dot so software can make reasonable guesses when distant from the original TLE epoch.
 * See https://en.wikipedia.org/wiki/Mean_Motion and http://castor2.ca/03_Mechanics/03_TLE/Mean_Mot_Dot.html
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getSecondTimeDerivative(tle, isTLEParsed) {
	return getFromLine1(tle, secondTimeDerivative, isTLEParsed);
}

/**
 * BSTAR drag term. This estimates the effects of atmospheric drag on the satellite's motion.
 * See https://en.wikipedia.org/wiki/BSTAR
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getBstarDrag(tle, isTLEParsed) {
	return getFromLine1(tle, bstarDrag, isTLEParsed);
}

/**
 * Private value - used by Air Force Space Command to reference the orbit model used to generate the
 * TLE (e.g. SGP, SGP4).  Distributed TLES will always return `0` for this value.  Note that all
 * distributed TLEs are generated with SGP4/SDP4.
 * See https://celestrak.com/columns/v04n03/
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getOrbitModel(tle, isTLEParsed) {
	return getFromLine1(tle, orbitModel, isTLEParsed);
}

/**
 * TLE element set number, incremented for each new TLE generated since launch. 999 seems to mean
 * the TLE has maxed out.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getTleSetNumber(tle, isTLEParsed) {
	return getFromLine1(tle, tleSetNumber, isTLEParsed);
}

/**
 * TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that
 * letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.
 *
 * @param {String|Array} tle Two or three line TLE
 * @param {Boolean} isTLEParsed Skips TLE parsing when true.
 */
export function getChecksum1(tle, isTLEParsed) {
	return getFromLine1(tle, checksum1, isTLEParsed);
}
