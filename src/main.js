const SatelliteJS = require('satellite.js');
const {
  _crossesAntemeridian,
  _dayOfYearToTimeStamp,
  _decimalAssumedEToFloat,
  _degreesToRadians,
  _radiansToDegrees,
  _toCamelCase
} = require('./utils');
const tleLines = require('./line-defs');
const {
  _ACCEPTABLE_TLE_INPUT_TYPES,
  _DATA_TYPES,
  _LEADING_ZERO_ASSUMED_PREFIX,
  _MS_IN_A_DAY
} = require('./constants');

// TODO: fix this ugliness
const satellitejs = (SatelliteJS.twoline2satrec) ? SatelliteJS : SatelliteJS.satellite;

class TLEJS {
  constructor() {
    this.createAllTLEGetters(tleLines);

    // TODO: use Set to store cache vals.
    this.cache = {
      antemeridianCrossings: {}
    };
  }

  /**
   * Parses a TLE from a string or array input.  Both two and three-line variants are acceptable.
   */
  parseTLE(inputTLE) {
    const fnName = 'parseTLE';

    // Check if already an instance of a TLE object.
    if (typeof inputTLE === _ACCEPTABLE_TLE_INPUT_TYPES._OBJECT && inputTLE.arr) return inputTLE;
    const tleStrLong = (Array.isArray(inputTLE)) ? inputTLE.join('') : inputTLE;
    const tleStr = tleStrLong.substr && tleStrLong.substr(0, 30);
    const cacheKey = `${fnName}-${tleStr}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const outputObj = {};
    const tleType = (Array.isArray(inputTLE))
      ? _ACCEPTABLE_TLE_INPUT_TYPES._ARRAY
      : typeof inputTLE;
    let tleArr = [];

    switch (tleType) {
    case _ACCEPTABLE_TLE_INPUT_TYPES._ARRAY:
      // Make a copy.
      tleArr = inputTLE.concat();
      break;

    case _ACCEPTABLE_TLE_INPUT_TYPES._STRING:
      // Convert string to array.
      tleArr = inputTLE.split('\n');
      break;

    default:
      throw new Error('TLE input is invalid');
    }

    // Handle 2 and 3 line variants.
    if (tleArr.length > 2) {
      // 3-line TLE with satellite name as the first line.

      // Keep track of satellite name.
      outputObj.name = tleArr[0];

      // Remove name from array.
      tleArr.splice(0, 1);
    } else {
      // 2-line TLE with no satellite name.
      outputObj.name = 'Unknown';
    }

    // Trim spaces
    tleArr = tleArr.map(line => line.trim());

    outputObj.arr = tleArr;

    this.cache[cacheKey] = outputObj;

    return outputObj;
  }

  /**
   * Determines if a TLE is valid, checking for the presence of line numbers and making sure
   * the calculated checksum matches the expected checksum.
   */
  isValidTLE(tle) {
    const fnName = 'isValidTLE';

    const parsedTLE = this.parseTLE(tle);
    const tleStr = parsedTLE.arr.join('').substr(0, 30);
    const cacheKey = `${fnName}-${tleStr}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    let isValid = true;

    if (parsedTLE.arr.length !== 2) return false;

    // Check line numbers and checksums at the same time.
    parsedTLE.arr.forEach((line, index) => {
      // Noop if already invalid.
      if (!isValid) return;

      const lineNumber = index + 1;

      // Check line number.
      const parsedLineNumber = this[`getLineNumber${lineNumber}`](parsedTLE);
      const lineNumberIsValid = parsedLineNumber === lineNumber;

      // Checksum.
      const calculatedLineChecksum = this.tleLineChecksum(parsedTLE.arr[index]);
      const parsedChecksum = this[`getChecksum${lineNumber}`](parsedTLE);
      const checksumIsValid = parsedChecksum === calculatedLineChecksum;

      if (!lineNumberIsValid || !checksumIsValid) {
        isValid = false;
      }
    });

    this.cache[cacheKey] = isValid;

    return isValid;
  }

  /**
   * Determines the checksum for a single line of a TLE.
   *
   * Checksum = modulo 10 of sum of all numbers (including line number) + 1 for each negative
   * sign (-).  Everything else is ignored.
   */
  tleLineChecksum(tleLineStr) {
    const charArr = tleLineStr.split('');

    // Remove trailing checksum.
    charArr.splice(charArr.length - 1, 1);

    if (charArr.length === 0) {
      throw new Error('Character array empty!', tleLineStr);
    }

    const checksum = charArr.reduce((sum, val) => {
      const parsedVal = parseInt(val, 10);
      const parsedSum = parseInt(sum, 10);

      if (Number.isInteger(parsedVal)) {
        return parsedSum + parsedVal;
      } else if (val === '-') {
        return parsedSum + 1;
      }

      return parsedSum;
    });

    return checksum % 10;
  }

  /**
   * Creates simple getters for each line of a TLE.
   */
  createAllTLEGetters(lines) {
    const boundCreateTLELineGetters = this.createTLELineGetters.bind(this, lines);
    Object.keys(lines).forEach(boundCreateTLELineGetters);
  }

  /**
   * Creates simple getters for all values on a single line of a TLE.
   */
  createTLELineGetters(lines, line) {
    const boundCreateTLEValGetter = this.createTLEValGetter.bind(this, line);
    Object.keys(lines[line]).forEach(boundCreateTLEValGetter);
  }

  /**
   * Creates a simple getter for a single TLE value.
   *
   * TODO: proper ES6 getters?
   */
  createTLEValGetter(tleLine, prop) {
    this[_toCamelCase(`get-${prop}`)] = (tle) => {
      const parsedTLE = this.parseTLE(tle);

      const tleArr = parsedTLE.arr;
      const line = (tleLine === 'line1') ? tleArr[0] : tleArr[1];
      const start = tleLines[tleLine][prop].start;
      const length = tleLines[tleLine][prop].length;

      const substr = line.substr(start, length);

      let output;
      switch (tleLines[tleLine][prop].type) {
      case _DATA_TYPES._INT:
        output = parseInt(substr, 10);
        break;

      case _DATA_TYPES._FLOAT:
        output = parseFloat(substr);
        break;

      case _DATA_TYPES._DECIMAL_ASSUMED:
        output = parseFloat(`${_LEADING_ZERO_ASSUMED_PREFIX}${substr}`);
        break;

      case _DATA_TYPES._DECIMAL_ASSUMED_E:
        output = _decimalAssumedEToFloat(substr);
        break;

      case _DATA_TYPES._CHAR:
      default:
        output = substr.trim();
        break;
      }

      return output;
    };
  }

  /**
   * Determines the Unix timestamp (in ms) of a TLE epoch (the time a TLE was generated).
   *
   * Example:
   * getEpochTimestamp(tleStr);
   * -> 1500956694771
   */
  getEpochTimestamp(tle) {
    const epochDay = this.getEpochDay(tle);
    const epochYear = this.getEpochYear(tle);
    return _dayOfYearToTimeStamp(epochDay, epochYear);
  }

  /**
   * Determines the name of a satellite, if present in the first line of a 3-line TLE.  If not
   * present, 'Unknown' is returned.
   *
   * Example:
   * getSatelliteName(tleStr);
   * -> 'ISS (ZARYA)'
   */
  getSatelliteName(tle) {
    const parsedTLE = this.parseTLE(tle);
    return parsedTLE.name;
  }

  /**
   * Determines satellite position and look angles from an earth observer.
   *
   * Example:
   * const timestampMS = 1501039265000;
   * const observer = {
   *   lat: 34.243889,
   *   lng: -116.911389,
   *   height: 0
   * };
   * const satInfo = tle.getSatelliteInfo(
   *   tleStr,          // Satellite TLE string or array.
   *   timestampMS,     // Timestamp (ms)
   *   observer.lat,    // Observer latitude (degrees)
   *   observer.lng,    // Observer longitude (degrees)
   *   observer.height  // Observer elevation (km)
   * );
   *
   * ->
   * {
   *   // satellite compass heading from observer in degrees (0 = north, 180 = south)
   *   azimuth: 294.5780478624994,
   *
   *   // satellite elevation from observer in degrees (90 is directly overhead)
   *   elevation: 81.63903620330046,
   *
   *   // km distance from observer to spacecraft
   *   range: 406.60211015810074,
   *
   *   // spacecraft altitude in km
   *   height: 402.9082788620108,

   *   // spacecraft latitude in degrees
   *   lat: 34.45112876592785,

   *   // spacecraft longitude in degrees
   *   lng: -117.46176597710809,
   *
   *   // spacecraft velocity in km/s
   *   velocity: 7.675627442183371
   * }
   */
  getSatelliteInfo(tle, timestamp, observerLat, observerLng, observerHeight) {
    const fnName = 'getSatelliteInfo';

    const timestampCopy = timestamp || Date.now();

    const tleArr = (this.parseTLE(tle)).arr;
    const tleStrShort = tleArr.join('').substr(0, 30);

    const defaultObserverPosition = {
      lat: 36.9613422,
      lng: -122.0308,
      height: 0.370
    };

    const obsLat = observerLat || defaultObserverPosition.lat;
    const obsLng = observerLng || defaultObserverPosition.lng;
    const obsHeight = observerHeight || defaultObserverPosition.height;

    // Memoization
    const cacheKey = `${fnName}-${tleStrShort}-${timestampCopy}-${observerLat}-${observerLng}
-${observerHeight}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    // Sanity check
    if (!satellitejs) {
      throw new Error('satellite.js not found');
    }

    // Initialize a satellite record
    const satrec = satellitejs.twoline2satrec(tleArr[0], tleArr[1]);

    const time = new Date(timestampCopy);

    // Propagate SGP4.
    const positionAndVelocity = satellitejs.propagate(satrec, time);

   if (satrec.error) {
      const errorMessages = {
        1: 'mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er',
        2: 'mean motion less than 0.0',
        3: 'pert elements, ecc < 0.0  or  ecc > 1.0',
        4: 'semi-latus rectum < 0.0',
        5: 'epoch elements are sub-orbital',
        6: 'satellite has decayed'
      }
      throw new Error(errorMessages[satrec.error] || 'Error: problematic TLE with unexpected eccentricity')
    }
    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    // Set the observer position (in radians).
    const observerGd = {
      latitude: _degreesToRadians(obsLat),
      longitude: _degreesToRadians(obsLng),
      height: obsHeight
    };

    // Get GMST for some coordinate transforms.
    // http://en.wikipedia.org/wiki/Sidereal_time#Definition
    const gmst = satellitejs.gstime(time);

    // Get ECF, Geodetic, Look Angles, and Doppler Factor.
    const positionEcf = satellitejs.eciToEcf(positionEci, gmst);
    const positionGd = satellitejs.eciToGeodetic(positionEci, gmst);
    const lookAngles = satellitejs.ecfToLookAngles(observerGd, positionEcf);

    const velocityKmS =
      Math.sqrt(Math.pow(velocityEci.x, 2) +
      Math.pow(velocityEci.y, 2) +
      Math.pow(velocityEci.z, 2));

    // Azimuth: is simply the compass heading from the observer's position.
    const azimuth = lookAngles.azimuth;

    // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
    const longitude = positionGd.longitude;
    const latitude = positionGd.latitude;
    const height = positionGd.height;

    const output = {
      lng: satellitejs.degreesLong(longitude),
      lat: satellitejs.degreesLat(latitude),
      elevation: _radiansToDegrees(lookAngles.elevation),
      azimuth: _radiansToDegrees(azimuth),
      range: lookAngles.rangeSat,
      height,
      velocity: velocityKmS
    };

    this.cache[cacheKey] = output;

    return output;
  }

  /**
   * Determines current satellite position, or position at optional timestamp if passed in.
   */
  getLatLon(tle, optionalTimestamp = Date.now()) {
    const tleObj = this.parseTLE(tle);

    // Validation.
    if (!this.isValidTLE(tleObj)) {
      throw new Error('TLE could not be parsed:', tle);
    }

    const satInfo = this.getSatelliteInfo(tleObj.arr, optionalTimestamp);
    return {
      lat: satInfo.lat,
      lng: satInfo.lng
    };
  }

  /**
   * Determines current satellite position, or position at optional timestamp if passed in.
   */
  getLatLonArr(tle, optionalTimestamp = Date.now()) {
    const ll = this.getLatLon(tle, optionalTimestamp);
    return [ll.lat, ll.lng];
  }

  /**
   * Determines the position of the satellite at the time the TLE was generated.
   */
  getLatLonAtEpoch(tle) {
    return this.getLatLon(tle, this.getEpochTimestamp(tle));
  }

  /**
   * Determines the average orbit length of the satellite in minutes.
   */
  getAverageOrbitLengthMins(tle) {
    const fnName = 'getAverageOrbitLengthMins';

    const tleStr = tle.join('').substr(0, 30);
    const cacheKey = `${fnName}-${tleStr}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const meanMotionSeconds = (24 * 60) / this.getMeanMotion(tle);

    this.cache[cacheKey] = meanMotionSeconds;

    return meanMotionSeconds;
  }

  /**
   * Determines the Unix timestamp (in ms) of the the TLE epoch (when the TLE was generated).
   */
  getTLEEpochTimestamp(tle) {
    const epochYear = this.getEpochYear(tle);
    const epochDayOfYear = this.getEpochDay(tle);
    const timestamp = _dayOfYearToTimeStamp(epochDayOfYear, epochYear);

    return timestamp;
  }

  /**
   * Determines if the last antemeridian crossing has been cached.  If it has, the time (in ms)
   * is returned, otherwise it returns false.
   */
  getCachedLastAntemeridianCrossingTimeMS(tle, timeMS) {
    const orbitLengthMS = this.getAverageOrbitLengthMins(tle.arr) * 60 * 1000;

    const tleStr = tle.arr.join('').substr(0, 30);

    const cachedCrossingTimes = this.cache.antemeridianCrossings[tleStr];
    if (!cachedCrossingTimes) return false;

    if (cachedCrossingTimes === -1) return cachedCrossingTimes;

    const cachedTime = cachedCrossingTimes.filter(val => {
      if (typeof val === 'object' && val.tle === tle) return -1;

      const diff = timeMS - val;
      const isDiffPositive = diff > 0;
      const isWithinOrbit = isDiffPositive && diff < orbitLengthMS;
      return isWithinOrbit;
    });

    return cachedTime[0] || false;
  }

  /**
   * Determines the last time the satellite crossed the antemeridian.  For mapping convenience
   * and to avoid headaches, we want to avoid plotting ground tracks that cross the antemeridian.
   */
  getLastAntemeridianCrossingTimeMS(tle, timeMS) {
    const parsedTLE = this.parseTLE(tle);

    const cachedVal = this.getCachedLastAntemeridianCrossingTimeMS(parsedTLE, timeMS);
    if (cachedVal) return cachedVal;

    const time = timeMS || Date.now();

    let step = 1000 * 60 * 10;
    let curLatLon = [];
    let lastLatLon = [];
    let curTimeMS = time;
    let didCrossAntemeridian = false;
    let tries = 0;
    let isDone = false;
    const maxTries = 1000;
    while (!isDone) {
      curLatLon = this.getLatLonArr(parsedTLE.arr, curTimeMS);

      didCrossAntemeridian = _crossesAntemeridian(lastLatLon[1], curLatLon[1]);
      if (didCrossAntemeridian) {
        // back up
        curTimeMS += step;
        step = (step > 20000) ? 20000 : step / 2;
      } else {
        curTimeMS -= step;
        lastLatLon = curLatLon;
      }

      isDone = step < 500 || tries >= maxTries;

      tries++;
    }

    const couldNotFindCrossing = tries - 1 === maxTries;
    const crossingTime = (couldNotFindCrossing) ? -1 : parseInt(curTimeMS, 10);

    const tleStr = parsedTLE.arr.join('').substr(0, 30);
    if (!this.cache.antemeridianCrossings[tleStr]) this.cache.antemeridianCrossings[tleStr] = [];

    if (couldNotFindCrossing) {
      this.cache.antemeridianCrossings[tleStr] = -1;
    } else {
      this.cache.antemeridianCrossings[tleStr].push(crossingTime);
    }

    return crossingTime;
  }

  /**
   * Determines the average amount of milliseconds in one orbit.
   */
  getOrbitTimeMS(tle) {
    return parseInt(_MS_IN_A_DAY / this.getMeanMotion(tle), 10);
  }

  /**
   * Calculates three orbit arrays of latitude/longitude pairs.
   *
   * Example:
   * const threeOrbitsArr = tle.getGroundTrackLatLng(tleStr);
   * ->
   * [
   *   // previous orbit
   *   [
   *     [ 45.85524291891481, -179.93297540317567 ],
   *     ...
   *   ],
   *
   *   // current orbit
   *   [
   *     [ 51.26165992503701, -179.9398612198045 ],
   *     ...
   *   ],
   *
   *   // next orbit
   *   [
   *     [ 51.0273714070371, -179.9190165549038 ],
   *     ...
   *   ]
   * ]
   */
  getGroundTrackLatLng(tle, stepMS, optionalTimeMS) {
    const fnName = 'getGroundTrackLatLng';

    const timeMS = optionalTimeMS || Date.now();
    const timeS = (timeMS / 1000).toFixed();

    const parsedTLE = this.parseTLE(tle);
    const tleStrTrimmed = parsedTLE.arr[1].substr(0, 30);

    const orbitTimeMS = this.getOrbitTimeMS(tle);
    const curOrbitStartMS = this.getLastAntemeridianCrossingTimeMS(parsedTLE, timeMS);

    const foundCrossing = curOrbitStartMS !== -1;

    let cacheKey;
    if (foundCrossing) {
      const curOrbitStartS = (curOrbitStartMS / 1000).toFixed();

      // Check for memoized values.
      cacheKey = `${fnName}-${tleStrTrimmed}-${stepMS}-${curOrbitStartS}`;
      if (this.cache[cacheKey]) return this.cache[cacheKey];
    } else {
      // Geosync or unusual orbit.

      cacheKey = `${fnName}-${tleStrTrimmed}-${stepMS}-${timeS}`;
      if (this.cache[cacheKey]) return this.cache[cacheKey];

      this.cache[cacheKey] = [
        this.getOrbitTrack(parsedTLE.arr, timeMS, 600000, 86400000)
      ];

      return this.cache[cacheKey];
    }

    const lastOrbitStartMS = this.getLastAntemeridianCrossingTimeMS(tle, curOrbitStartMS - 10000);
    const nextOrbitStartMS = this.getLastAntemeridianCrossingTimeMS(
        tle, curOrbitStartMS + orbitTimeMS + (1000 * 60 * 30));

    const orbitStartTimes = [
      lastOrbitStartMS,
      curOrbitStartMS,
      nextOrbitStartMS
    ];

    const orbitLatLons = orbitStartTimes.map(
      orbitStartMS => this.getOrbitTrack(parsedTLE.arr, orbitStartMS, stepMS, false)
    );

    this.cache[cacheKey] = orbitLatLons;

    return orbitLatLons;
  }

  /**
   * Generates an array of lat/lng pairs representing a ground track (orbit track), starting
   * from startTimeMS and continuing until crossing the antemeridian, which is considered the end
   * of the orbit for convenience.
   */
  getOrbitTrack(TLEArr, startTimeMS, stepMS, maxTimeMS = 6000000) {
    const fnName = 'getOrbitTrack';

    if (!startTimeMS) return [];

    // Memoization.
    const tleStr = TLEArr.join('');
    const tleStrTrimmed = tleStr.substr(0, 30);
    const startTime = (startTimeMS / 10000).toFixed();
    const cacheKey = `${fnName}-${tleStrTrimmed}-${startTime}-${stepMS}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    // default to 1 minute intervals
    const defaultStepMS = 1000 * 60 * 1;
    let stepMSCopy = stepMS || defaultStepMS;

    const latLons = [];
    let curTimeMS = startTimeMS;
    let lastLatLon = [];
    let curLatLon = [];
    let isDone = false;
    let doesCrossAntemeridian = false;
    while (!isDone) {
      curLatLon = this.getLatLonArr(TLEArr, curTimeMS);

      doesCrossAntemeridian = _crossesAntemeridian(lastLatLon[1], curLatLon[1]);
      if (doesCrossAntemeridian) {
        if (stepMSCopy === 500) isDone = true;

        // Go back a bit.
        curTimeMS -= stepMSCopy;
        stepMSCopy = 500;
      } else {
        latLons.push(curLatLon);
        curTimeMS += stepMSCopy;
        lastLatLon = curLatLon;
      }

      if (maxTimeMS && (curTimeMS - startTimeMS > maxTimeMS)) isDone = true;
    }

    this.cache[cacheKey] = latLons;

    return latLons;
  }

  /**
   * Determes the compass bearing from the perspective of the satellite.  Useful for 3D / pitched
   * map perspectives.
   *
   * TODO: a bit buggy at extreme parts of orbits, where latitude hardly changes.
   */
  getSatBearing(tle, customTimeMS) {
    const parsedTLE = this.parseTLE(tle);

    const timeMS = customTimeMS || Date.now();

    const latLon1 = this.getLatLonArr(parsedTLE.arr, timeMS);
    const latLon2 = this.getLatLonArr(parsedTLE.arr, timeMS + 10000);

    const doesCrossAntemeridian = _crossesAntemeridian(latLon1[1], latLon2[1]);

    if (doesCrossAntemeridian) {
      // TODO: fix
      return {};
      // return this.getSatBearing(tle, customTimeMS + 10000);
    }

    const lat1 = _degreesToRadians(latLon1[0]);
    const lat2 = _degreesToRadians(latLon2[0]);
    const lon1 = _degreesToRadians(latLon1[1]);
    const lon2 = _degreesToRadians(latLon2[1]);

    const NS = (lat1 >= lat2) ? 'S' : 'N';
    const EW = (lon1 >= lon2) ? 'W' : 'E';

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = (Math.cos(lat1) * Math.sin(lat2)) -
              (Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
    const degrees = _radiansToDegrees(Math.atan2(y, x));

    return {
      degrees,
      compass: `${NS}${EW}`
    };
  }

  /**
   * Determines a set of three orbit ground tracks.  Similar to getGroundTrackLatLng, except
   * points are returned in reversed order ([longitude, latitude]), which is handy for GeoJSON.
   */
  getGroundTrackLngLat(tle, stepMS, optionalTimeMS) {
    const latLngArr = this.getGroundTrackLatLng(tle, stepMS, optionalTimeMS);
    const lngLatArr = latLngArr.map(line => line.map(latLng => [latLng[1], latLng[0]]));

    return lngLatArr;
  }
}

module.exports = TLEJS;
