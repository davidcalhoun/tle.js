import { _DATA_TYPES } from "./constants";
import { getType } from "./utils";

const _ERRORS = {
	_TYPE: (context = "", expected = [], got = "") =>
		`${context} must be of type [${expected.join(", ")}], but got ${got}.`,
	_NOT_PARSED_OBJECT: `Input object is malformed (should have name and tle properties).`
};

export function isTLEObj(obj) {
	return (
		typeof obj === _DATA_TYPES._OBJECT &&
		obj.tle &&
		getType(obj.tle) === _DATA_TYPES._ARRAY &&
		obj.tle.length === 2
	);
}

const getTLECacheKey = (type, sourceTLE) => {
	if (type === _DATA_TYPES._ARRAY) {
		// Use TLE line 1 in 2 and 3-line TLE variants.
		return (sourceTLE.length === 3)
			? sourceTLE[1]
			: sourceTLE[0]
	}

	// Use the entire string as a key.
	return sourceTLE;
}

// For TLE parsing memoization.
let tleCache = {};

export const clearTLEParseCache = () => tleCache = {};

/**
 * Converts string and array TLE formats into a "parsed" TLE in a consistent object format.
 * Accepts 2 and 3-line (with satellite name) TLE variants in string (\n-delimited) and array
 * forms.
 *
 * Example:
 * parseTLE(`ISS (ZARYA)
 * 1 25544U 98067A   19285.67257269  .00001247  00000-0  29690-4 0  9993
 * 2 25544  51.6439 138.6866 0007415 141.2524 326.3533 15.50194187193485`);
 * ->
 * {
 *   name: 'ISS (ZARYA)',
 *   tle: [
 *     '1 25544U 98067A   19285.67257269  .00001247  00000-0  29690-4 0  9993',
 *     '2 25544  51.6439 138.6866 0007415 141.2524 326.3533 15.50194187193485'
 *   ]
 * }
 */
const acceptedTLETypes = [
	_DATA_TYPES._ARRAY,
	_DATA_TYPES._STRING,
	_DATA_TYPES._OBJECT
];
export function parseTLE(sourceTLE, fastParse = true) {
	const type = getType(sourceTLE);
	const output = {};
	let tleArray = [];

	const alreadyParsed = isTLEObj(sourceTLE);
	if (alreadyParsed) {
		// This TLE has already been parsed, so there's nothing left to do.
		return sourceTLE;
	}

	const isUnexpectedObject = !alreadyParsed && type === _DATA_TYPES._OBJECT;
	if (isUnexpectedObject) {
		throw new Error(_ERRORS._NOT_PARSED_OBJECT);
	}

	// Note: only strings and arrays will make it past this point.

	// Check if the TLE exists in the cache.
	const cacheKey = getTLECacheKey(type, sourceTLE);
	if (tleCache[cacheKey]) {
		return tleCache[cacheKey];
	}

	if (!acceptedTLETypes.includes(type)) {
		throw new Error(_ERRORS._TYPE("Source TLE", acceptedTLETypes, type));
	}

	// Convert to array.
	if (type === _DATA_TYPES._STRING) {
		tleArray = sourceTLE.split("\n");
	} else if (type === _DATA_TYPES._ARRAY) {
		// Already an array, so make a copy so we don't mutate the input.
		tleArray = Array.from(sourceTLE);
	}

	// 3-line variant: remove name from array for consistency.
	if (tleArray.length === 3) {
		let name = tleArray[0].trim();
		tleArray = tleArray.slice(1);

		// Strip off line number, if present.
		if (name.startsWith('0 ')) {
			name = name.substr(2);
		}

		// Preserve original name string for use in the getSatelliteName() getter.
		output.name = name;
	}

	output.tle = tleArray.map(line => line.trim());

	// Check TLE validity.
	if (!fastParse) {
		const isValid = isValidTLE(output.tle);
		if (!isValid) {
			output.error = "TLE parse error: bad TLE";
		}
	}

	// Update cache.
	tleCache[cacheKey] = output;

	return output;
}

/**
 * Determines the checksum for a single line of a TLE.
 *
 * Checksum = modulo 10 of sum of all numbers (including line number) + 1 for each negative
 * sign (-).  Everything else is ignored.
 */
export function computeChecksum(tleLineStr) {
	const charArr = tleLineStr.split("");

	// Remove trailing checksum.
	charArr.splice(charArr.length - 1, 1);

	if (charArr.length === 0) {
		throw new Error("Character array empty!", tleLineStr);
	}

	const checksum = charArr.reduce((sum, val) => {
		const parsedVal = parseInt(val, 10);
		const parsedSum = parseInt(sum, 10);

		if (Number.isInteger(parsedVal)) {
			return parsedSum + parsedVal;
		}

		if (val === "-") {
			return parsedSum + 1;
		}

		return parsedSum;
	}, 0);

	return checksum % 10;
}

export function lineNumberIsValid(tleObj, lineNumber) {
	const { tle } = tleObj;
	return lineNumber === parseInt(tle[lineNumber - 1][0], 10);
}

export function checksumIsValid(tleObj, lineNumber) {
	const { tle } = tleObj;
	const tleLine = tle[lineNumber - 1];
	const checksumInTLE = parseInt(tleLine[tleLine.length - 1], 10);
	const computedChecksum = computeChecksum(tle[lineNumber - 1]);
	return computedChecksum === checksumInTLE;
}

/**
 * Determines if a TLE is structurally valid.
 */
export function isValidTLE(rawTLE) {
	let tleObj;

	try {
		tleObj = parseTLE(rawTLE);
	} catch (e) {
		return false;
	}

	// Fast line number checks.
	const line1NumberIsValid = lineNumberIsValid(tleObj, 1);
	const line2NumberIsValid = lineNumberIsValid(tleObj, 2);
	if (!line1NumberIsValid || !line2NumberIsValid) {
		return false;
	}

	// Checksum checks.
	const line1ChecksumIsValid = checksumIsValid(tleObj, 1);
	const line2ChecksumIsValid = checksumIsValid(tleObj, 2);
	if (!line1ChecksumIsValid || !line2ChecksumIsValid) {
		return false;
	}

	return true;
}
