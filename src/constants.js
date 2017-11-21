export const _MS_IN_A_DAY = 1000 * 60 * 60 * 24;

// Data formats for TLE orbital elements.
export const _DATA_TYPES = {
  _INT: Symbol(),
  _FLOAT: Symbol(),
  _CHAR: Symbol(),
  _DECIMAL_ASSUMED: Symbol(),    // 12345   -> 0.12345
  _DECIMAL_ASSUMED_E: Symbol()   // 12345-2 -> 0.0012345
};

export const _ACCEPTABLE_TLE_INPUT_TYPES = {
  _STRING: 'string',
  _ARRAY: 'array',
  _OBJECT: 'object'
};

export const _LEADING_ZERO_ASSUMED_PREFIX = '0.';
