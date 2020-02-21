import { _MS_IN_A_DAY, _MS_IN_A_MINUTE, _MS_IN_A_SECOND } from "./constants";
import { _dayOfYearToTimeStamp, _getFullYear } from "./utils";
import {
	getEpochDay,
	getEpochYear,
	getIntDesignatorLaunchNumber,
	getIntDesignatorPieceOfLaunch,
	getIntDesignatorYear
} from "./line-1-getters";
import { getMeanMotion } from "./line-2-getters";
import { parseTLE } from "./parsing";

/**
 * Determines COSPAR ID.
 * See https://en.wikipedia.org/wiki/International_Designator
 */
export function getCOSPAR(tle, tleIsParsed) {
	const partialYear = getIntDesignatorYear(tle, tleIsParsed);
	const fullYear = _getFullYear(partialYear);
	const launchNum = getIntDesignatorLaunchNumber(tle, tleIsParsed);
	const launchNumWithPadding = launchNum.toString().padStart(3, 0);
	const launchPiece = getIntDesignatorPieceOfLaunch(tle, tleIsParsed);

	return `${fullYear}-${launchNumWithPadding}${launchPiece}`;
}

/**
 * Determines the name of a satellite, if present in the first line of a 3-line TLE.  If not found,
 * returns "Unknown" by default, or the COSPAR id when fallbackToCOSPAR is true.
 *
 * Example:
 * getSatelliteName(tleStr);
 * -> 'ISS (ZARYA)'
 *
 * @param {String|Array} rawTLE Input TLE.
 * @param {Boolean} fallbackToCOSPAR Returns COSPAR id when satellite name isn't found.
 */
export function getSatelliteName(rawTLE, fallbackToCOSPAR = false) {
	const parsedTLE = parseTLE(rawTLE);
	const { name } = parsedTLE;

	if (fallbackToCOSPAR) {
		return name || getCOSPAR(parsedTLE, true);
	} else {
		return name || "Unknown";
	}
}

/**
 * Determines the Unix timestamp (in ms) of a TLE epoch (the time a TLE was generated).
 *
 * Example:
 * getEpochTimestamp(tleStr);
 * -> 1500956694771
 */
export function getEpochTimestamp(rawTLE) {
	const epochDay = getEpochDay(rawTLE);
	const epochYear = getEpochYear(rawTLE);
	return _dayOfYearToTimeStamp(epochDay, epochYear);
}

/**
 * Determines the average amount of milliseconds in one orbit.
 */
export function getAverageOrbitTimeMS(tle) {
	return parseInt(_MS_IN_A_DAY / getMeanMotion(tle), 10);
}

/**
 * Determines the average amount of minutes in one orbit.
 */
export function getAverageOrbitTimeMins(tle) {
	return getAverageOrbitTimeMS(tle) / _MS_IN_A_MINUTE;
}

/**
 * Determines the average amount of seconds in one orbit.
 */
export function getAverageOrbitTimeS(tle) {
	return getAverageOrbitTimeMS(tle) / _MS_IN_A_SECOND;
}
