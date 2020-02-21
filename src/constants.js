export const _MS_IN_A_DAY = 86400000;
export const _MS_IN_A_SECOND = 1000;
export const _MS_IN_A_MINUTE = 60000;

// Data formats for TLE orbital elements.
export const _TLE_DATA_TYPES = {
  _INT: Symbol(),
  _FLOAT: Symbol(),
  _CHAR: Symbol(),
  _DECIMAL_ASSUMED: Symbol(), // 12345 -> 0.12345
  _DECIMAL_ASSUMED_E: Symbol() // 12345-2 -> 0.0012345
};

export const _DATA_TYPES = {
  _ARRAY: "array",
  _STRING: "string",
  _OBJECT: "object",
  _DATE: "date",
  _NAN: "NaN"
};

export const _ACCEPTABLE_TLE_INPUT_TYPES = {
  _STRING: _DATA_TYPES._STRING,
  _ARRAY: _DATA_TYPES._ARRAY,
  _OBJECT: _DATA_TYPES._OBJECT
};
