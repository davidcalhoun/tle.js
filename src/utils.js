import { _MS_IN_A_DAY, _TLE_DATA_TYPES, _DATA_TYPES } from "./constants";

/**
 * General helper that provides more useful info than JavaScript's built-in "typeof" operator.
 *
 * Example:
 * getType([]);
 * -> 'array'
 */
export function getType(input) {
	const type = typeof input;

	if (Array.isArray(input)) {
		return _DATA_TYPES._ARRAY;
	}

	if (input instanceof Date) {
		return _DATA_TYPES._DATE;
	}

	if (Number.isNaN(input)) {
		return _DATA_TYPES._NAN;
	}

	return type;
}

/**
 * Determines if a number is positive.
 */
export const _isPositive = num => num >= 0;

/**
 * Determines the amount of digits in a number.  Used for converting a TLE's "leading decimal
 * assumed" notation.
 *
 * Example:
 * getDigitCount(12345);
 * -> 5
 */
export const _getDigitCount = num => {
	const absVal = Math.abs(num);
	return absVal.toString().length;
};

/**
 * Converts a TLE's "leading decimal assumed" notation to a float representation.
 *
 * Example:
 * toLeadingDecimal(12345);
 * -> 0.12345
 */
export const _toLeadingDecimal = num => {
	const numDigits = _getDigitCount(num);
	const zeroes = "0".repeat(numDigits - 1);
	return parseFloat(num * `0.${zeroes}1`);
};

/**
 * Converts a TLE's "leading decimal assumed" notation with leading zeroes to a float
 * representation.
 *
 * Example:
 * decimalAssumedEToFloat('12345-4');
 * -> 0.000012345
 */
export const _decimalAssumedEToFloat = str => {
	const numWithAssumedLeadingDecimal = str.substr(0, str.length - 2);
	const num = _toLeadingDecimal(numWithAssumedLeadingDecimal);
	const leadingDecimalPoints = parseInt(str.substr(str.length - 2, 2), 10);
	const float = num * Math.pow(10, leadingDecimalPoints);
	return parseFloat(float.toPrecision(5));
};

/**
 * Converts a fractional day of the year to a timestamp.  Used for parsing the TLE epoch.
 */
export const _dayOfYearToTimeStamp = (
	dayOfYear,
	year = new Date().getFullYear()
) => {
	const yearStart = new Date(`1/1/${year} 0:0:0 Z`);

	const yearStartMS = yearStart.getTime();

	return Math.floor(yearStartMS + (dayOfYear - 1) * _MS_IN_A_DAY);
};

/**
 * Converts radians (0 to 2π) to degrees (0 to 360).
 */
export const _radiansToDegrees = radians => radians * (180 / Math.PI);

/**
 * Converts degrees (0 to 360) to radians (0 to 2π).
 */
export const _degreesToRadians = degrees => degrees * (Math.PI / 180);

/**
 * Determines if a pair of longitude points crosses over the antemeridian, which is a
 * pain point for mapping software.
 */
export const _crossesAntemeridian = (longitude1, longitude2) => {
	if (!longitude1 || !longitude2) return false;

	const isLong1Positive = _isPositive(longitude1);
	const isLong2Positive = _isPositive(longitude2);
	const haveSameSigns = isLong1Positive === isLong2Positive;

	if (haveSameSigns) return false;

	// Signs don't match, so check if we're reasonably near the antemeridian (just to be sure it's
	// not the prime meridian).
	const isNearAntemeridian = Math.abs(longitude1) > 100;

	return isNearAntemeridian;
};

/**
 * Note: TLEs have a year 2000 style problem in 2057, because they only represent years in 2
 * characters.  This function doesn't account for that problem.
 *
 * Example:
 * _getFullYear(98);
 * -> 1998
 *
 * @param {Number} twoDigitYear
 */
export function _getFullYear(twoDigitYear) {
	const twoDigitYearInt = parseInt(twoDigitYear, 10);

	return twoDigitYearInt < 100 && twoDigitYearInt > 56
		? twoDigitYearInt + 1900
		: twoDigitYearInt + 2000;
}

/**
 * Gets a piece of data directly from a TLE line string, and attempts to parse it based on
 * data format.
 *
 * @param {Object} parsedTLE
 * @param {(1|2)} lineNumber TLE line number.
 * @param {Object} definition From line-1-definitions or line-2-definitions.
 */
export function getFromTLE(parsedTLE, lineNumber, definition) {
	const { tle } = parsedTLE;

	const line = lineNumber === 1 ? tle[0] : tle[1];
	const { start, length, type } = definition;

	const val = line.substr(start, length);

	let output;
	switch (type) {
		case _TLE_DATA_TYPES._INT:
			output = parseInt(val, 10);
			break;

		case _TLE_DATA_TYPES._FLOAT:
			output = parseFloat(val);
			break;

		case _TLE_DATA_TYPES._DECIMAL_ASSUMED:
			output = parseFloat(`0.${val}`);
			break;

		case _TLE_DATA_TYPES._DECIMAL_ASSUMED_E:
			output = _decimalAssumedEToFloat(val);
			break;

		case _TLE_DATA_TYPES._CHAR:
		default:
			output = val.trim();
			break;
	}

	return output;
}

/**
 * Returns the length of the keys in an object, ignoring the size of the values.
 *
 * @param {Object} obj
 */
export const _getObjLength = obj => Object.keys(obj).length;
