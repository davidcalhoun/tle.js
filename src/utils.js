const { _MS_IN_A_DAY, _LEADING_ZERO_ASSUMED_PREFIX } = require('./constants');

/**
 * Determines if a number is positive.
 */
const _isPositive = num => num >= 0;

/**
 * Determines the amount of digits in a number.  Used for converting a TLE's "leading decimal
 * assumed" notation.
 *
 * Example:
 * getDigitCount(12345);
 * -> 5
 */
const _getDigitCount = (num) => {
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
const _toLeadingDecimal = (num) => {
  const numDigits = _getDigitCount(num);
  const zeroes = '0'.repeat(numDigits - 1);
  return parseFloat(num * `${_LEADING_ZERO_ASSUMED_PREFIX}${zeroes}1`);
};

/**
 * Converts a TLE's "leading decimal assumed" notation with leading zeroes to a float
 * representation.
 *
 * Example:
 * decimalAssumedEToFloat('12345-4');
 * -> 0.000012345
 */
const _decimalAssumedEToFloat = (str) => {
  const numWithAssumedLeadingDecimal = str.substr(0, str.length - 2);
  const num = _toLeadingDecimal(numWithAssumedLeadingDecimal);
  const leadingDecimalPoints = parseInt(str.substr(str.length - 2, 2), 10);
  const float = num * Math.pow(10, leadingDecimalPoints);
  return float.toPrecision(5);
};

/**
 * Converts a fractional day of the year to a timestamp.  Used for parsing the TLE epoch.
 */
const _dayOfYearToTimeStamp = (dayOfYear, year = (new Date()).getFullYear()) => {
  const yearStart = new Date(`1/1/${year} 0:0:0 Z`);

  const yearStartMS = yearStart.getTime();

  return Math.floor(yearStartMS + ((dayOfYear - 1) * _MS_IN_A_DAY));
};

/**
 * Converts a string divided by spacer characters to camelCase representation.
 *
 * Examples:
 * toCamelCase('foo-bar');
 * -> 'fooBar'
 * toCamelCase('foo bar', ' ');
 * -> 'fooBar'
 */
const _toCamelCase = (str, divider = '-') => {
  const bits = str.split(divider);

  const output = [];

  output.push(bits[0]);

  for (let i = 1, len = bits.length; i < len; i++) {
    output.push(bits[i].substr(0, 1).toUpperCase() + bits[i].substr(1, bits[i].length - 1));
  }

  return output.join('');
};

/**
 * Converts radians (0 to 2π) to degrees (0 to 360).
 */
const _radiansToDegrees = radians => radians * (180 / Math.PI);

/**
 * Converts degrees (0 to 360) to radians (0 to 2π).
 */
const _degreesToRadians = degrees => degrees * (Math.PI / 180);

/**
 * Determines if a pair of longitude points crosses over the antemeridian, which is a
 * pain point for mapping software.
 */
const _crossesAntemeridian = (longitude1, longitude2) => {
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

module.exports = {
  _isPositive,
  _getDigitCount,
  _toLeadingDecimal,
  _decimalAssumedEToFloat,
  _dayOfYearToTimeStamp,
  _toCamelCase,
  _radiansToDegrees,
  _degreesToRadians,
  _crossesAntemeridian
};
