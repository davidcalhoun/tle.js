(function tle(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
  define(['satellite.js'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('satellite.js'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.satellite);
  }
}(this, function (SatelliteJS) {

const satellitejs = SatelliteJS.satellite;

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

const DATA_TYPES = {
  INT: 'INT',
  FLOAT: 'FLOAT',
  CHAR: 'CHAR',
  DECIMAL_ASSUMED: 'DECIMAL_ASSUMED',
  DECIMAL_ASSUMED_E: 'DECIMAL_ASSUMED_E'
};

// See https://en.wikipedia.org/wiki/Two-line_element_set.
const tleLines = {
  line1: {
    // TLE line number.
    lineNumber1: {
      start: 0,
      length: 1,
      type: DATA_TYPES.INT
    },

    // Satellite catalog number.
    satelliteNumber: {
      start: 2,
      length: 5,
      type: DATA_TYPES.INT
    },

    // Satellite classification (U is unclassified).
    classification: {
      start: 7,
      length: 1,
      type: DATA_TYPES.CHAR
    },

    // International Designator: Last 2 digits of launch year.
    intDesignatorYear: {
      start: 9,
      length: 2,
      type: DATA_TYPES.INT
    },

    // International Designator: Launch number of the year.
    intDesignatorLaunchNumber: {
      start: 11,
      length: 3,
      type: DATA_TYPES.INT
    },

    // International Designator: Piece of the launch.
    intDesignatorPieceOfLaunch: {
      start: 14,
      length: 3,
      type: DATA_TYPES.CHAR
    },

    // Last 2 digits of epoch year (when this TLE was generated).
    epochYear: {
      start: 18,
      length: 2,
      type: DATA_TYPES.INT
    },

    // Fractional day of the year of epoch (when this TLE was generated).
    epochDay: {
      start: 20,
      length: 12,
      type: DATA_TYPES.FLOAT
    },

    // First Time Derivative of the Mean Motion divided by two.
    firstTimeDerivative: {
      start: 33,
      length: 11,
      type: DATA_TYPES.FLOAT
    },

    // Second Time Derivative of Mean Motion divided by six (decimal point assumed).
    secondTimeDerivative: {
      start: 44,
      length: 8,
      type: DATA_TYPES.DECIMAL_ASSUMED_E
    },

    // BSTAR drag term (decimal point assumed).
    bstarDrag: {
      start: 53,
      length: 8,
      type: DATA_TYPES.DECIMAL_ASSUMED_E
    },

    // The number 0 (originally this should have been "Ephemeris type").
    numZero: {
      start: 62,
      length: 1,
      type: DATA_TYPES.INT
    },

    // TLE element set number.  Incremented for each new TLE generated.
    tleSetNumber: {
      start: 64,
      length: 4,
      type: DATA_TYPES.INT
    },

    // TLE line 1 checksum (modulo 10).
    checksum1: {
      start: 68,
      length: 1,
      type: DATA_TYPES.INT
    },
  },

  line2: {
    // TLE line number.
    lineNumber2: {
      start: 0,
      length: 1,
      type: DATA_TYPES.INT
    },

    // Satellite catalog number.
    satelliteNumber2: {
      start: 2,
      length: 5,
      type: DATA_TYPES.INT
    },

    // Inclination in degrees.
    inclination: {
      start: 8,
      length: 8,
      type: DATA_TYPES.FLOAT
    },

    // Right ascension of the ascending node in degrees.
    rightAscension: {
      start: 17,
      length: 8,
      type: DATA_TYPES.FLOAT
    },

    // Orbit eccentricity, decimal point assumed.
    eccentricity: {
      start: 26,
      length: 7,
      type: DATA_TYPES.DECIMAL_ASSUMED
    },

    // Argument of perigee in degrees.
    perigee: {
      start: 34,
      length: 8,
      type: DATA_TYPES.FLOAT
    },

    // Mean Anomaly in degrees.
    meanAnomaly: {
      start: 43,
      length: 8,
      type: DATA_TYPES.FLOAT
    },

    // Revolutions per day (mean motion).
    meanMotion: {
      start: 52,
      length: 11,
      type: DATA_TYPES.FLOAT
    },

    // Total satellite revolutions when this TLE was generated.
    revNumberAtEpoch: {
      start: 63,
      length: 5,
      type: DATA_TYPES.INT
    },

    // TLE line 2 checksum (modulo 10).
    checksum2: {
      start: 68,
      length: 1,
      type: DATA_TYPES.INT
    }
  }
}

var tle = {
  cache: {},

  init: function(){
    this.createTLEGetters();
  },

  parseTLE: function(inputTLE) {
    // Check if already parsed.
    if (typeof inputTLE === 'object' && inputTLE.arr) return inputTLE;

    const outputObj = {};
    const tleType = (Array.isArray(inputTLE)) ? 'array' : typeof inputTLE;
    let tleArr = [];

    switch (tleType) {
      case 'array':
        // Make a copy.
        tleArr = inputTLE.concat();
      break;

      case 'string':
        // Convert string to array.
        tleArr = inputTLE.split('\n');
      break;

      default:
        throw new Error(`TLE passed is invalid type ${tleType}`);
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

    return outputObj;
  },

  isInt: function (num) {
    return typeof num === 'number' && num % 1 === 0;
  },

  isValidTLE: function(tle) {
    let isValid = true;

    const isParsedTLE = typeof tle === 'object' && tle.arr;
    const parsedTLE = this.parseTLE(tle);

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

    return isValid;
  },

  /**
   * "The checksums for each line are calculated by adding all numerical digits on that line,
   * including the line number. One is added to the checksum for each negative sign (−) on that
   * line. All other non-digit characters are ignored."
   */
  tleLineChecksum: function(tleLine) {
    let charArr = tleLine.split('');

    // Remove trailing checksum.
    charArr.splice(charArr.length - 1, 1);

    if (charArr.length === 0) {
      throw new Error('Character array empty!', tleLine);
    }

    const checksum = charArr.reduce((sum, val) => {
      const parsedVal = parseInt(val);
      const parsedSum = parseInt(sum);

      if (Number.isInteger(parsedVal)) {
        return parsedSum + parsedVal;
      }
      if (val === '-') {
        return parsedSum + 1;
      }

      return parsedSum;
    });

    return checksum % 10;
  },

  /**
   * Creates simple getters for each part of a TLE.
   */
  createTLEGetters: function(){
    var self = this;

    // Create getters.
    Object.keys(tleLines).forEach((tleLine) => {
      Object.keys(tleLines[tleLine]).forEach((prop) => {
        self[self.toCamelCase('get-' + prop)] = (tle) => {
          // Parse TLE if needed.
          const isParsedTLE = typeof tle === 'object' && tle.arr;
          const parsedTLE = this.parseTLE(tle);

          const tleArr = parsedTLE.arr;
          const line = (tleLine === 'line1') ? tleArr[0] : tleArr[1];
          const start = tleLines[tleLine][prop].start;
          const length = tleLines[tleLine][prop].length;

          const substr = line.substr(start, length);

          let output;
          switch (tleLines[tleLine][prop].type) {
            case DATA_TYPES.INT:
              output = parseInt(substr);
            break;

            case DATA_TYPES.FLOAT:
              output = parseFloat(substr);
            break;

            case DATA_TYPES.DECIMAL_ASSUMED:
              output = parseFloat(`0.${substr}`);
            break;

            case DATA_TYPES.DECIMAL_ASSUMED_E:
              const num = substr.substr(0, substr.length - 2);
              const leadingDecimalPoints = substr.substr(substr.length - 2, 2);
              const float = num * Math.pow(10, parseInt(leadingDecimalPoints));
              output = float.toFixed(5);
            break;

            case DATA_TYPES.CHAR:
            default:
              output = substr.trim();
            break;
          }

          return output;
        }
      });
    });
  },

  toCamelCase: function(str, divider){
    divider = divider || '-';

    var bits = str.split(divider);

    var output = [];

    output.push(bits[0]);

    for(var i=1, len=bits.length; i<len; i++) {
      output.push(bits[i].substr(0, 1).toUpperCase() + bits[i].substr(1, bits[i].length - 1));
    }

    return output.join('');
  },

  getEpochTimestamp: function(tle) {
    var epochDay = this.getEpochDay(tle);
    var epochYear = this.getEpochYear(tle);

    return this.dayOfYearToTimeStamp(epochDay, epochYear);
  },

  getSatelliteName: function(tle) {
    const parsedTLE = this.parseTLE(tle);
    return parsedTLE.name;
  },

  // Use satellite.js.
  getSatelliteInfo: function(tle, timestamp, observerLat, observerLng, observerHeight) {
    const fnName = 'getSatelliteInfo';

    const timestampCopy = timestamp || Date.now();

    const tleArr = (this.parseTLE(tle)).arr;

    // Memoization
    const cacheKey = `${fnName}-${tleArr[0]}-${tleArr[1]}-${timestampCopy}-${observerLat}-${observerLng}-${observerHeight}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    const defaultObserverPosition = {
      lat: 36.9613422,
      lng: -122.0308,
      height: 0.370
    }

    const obsLat = observerLat || defaultObserverPosition.lat;
    const obsLng = observerLng || defaultObserverPosition.lng;
    const obsHeight = observerHeight || defaultObserverPosition.height;

    // Initialize a satellite record
    const satrec = satellitejs.twoline2satrec(tleArr[0], tleArr[1]);

    const time = new Date(timestampCopy);

    // Propagate SGP4.
    const positionAndVelocity = satellitejs.propagate(satrec, time);

    if (satellitejs.error) {
      throw new Error('Error: problematic TLE with unexpected eccentricity');
    }

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    // Set the observer position (in radians).
    const observerGd = {
      latitude: this.degreesToRadians(obsLat),
      longitude: this.degreesToRadians(obsLng),
      height: obsHeight
    };

    // Get GMST for some coordinate transforms.
    // http://en.wikipedia.org/wiki/Sidereal_time#Definition
    const gmst = satellitejs.gstimeFromDate(time);

    // Get ECF, Geodetic, Look Angles, and Doppler Factor.
    const positionEcf = satellitejs.eciToEcf(positionEci, gmst);
    const observerEcf = satellitejs.geodeticToEcf(observerGd);
    const positionGd = satellitejs.eciToGeodetic(positionEci, gmst);
    const lookAngles = satellitejs.ecfToLookAngles(observerGd, positionEcf);
    const dopplerFactor = satellitejs.dopplerFactor(observerEcf, positionEci, velocityEci);

    const velocityKmS = Math.sqrt(Math.pow(velocityEci.x, 2) + Math.pow(velocityEci.y, 2) + Math.pow(velocityEci.z, 2));

    // The coordinates are all stored in key-value pairs.
    // ECI and ECF are accessed by `x`, `y`, `z` properties.
    const satelliteX = positionEci.x;
    const satelliteY = positionEci.y;
    const satelliteZ = positionEci.z;

    // Azimuth: is simply the compass heading from the observer's position.
    const azimuth   = lookAngles.azimuth;

    // Geodetic coords are accessed via `longitude`, `latitude`, `height`.
    const longitude = positionGd.longitude;
    const latitude  = positionGd.latitude;
    const height    = positionGd.height;

    const output = {
      lng: satellitejs.degreesLong(longitude),    // degrees
      lat: satellitejs.degreesLat(latitude),      // degrees
      elevation: this.radiansToDegrees(lookAngles.elevation), // degrees (90 deg is directly overhead)
      azimuth: this.radiansToDegrees(azimuth),  // degrees (compass heading)
      range: lookAngles.rangeSat,   // km distance from ground to spacecraft
      height: positionGd.height,    // km altitude of spacecraft
      velocity: velocityKmS
    };

    this.cache[cacheKey] = output;

    return output;
  },

  getSatGroundSpeed: function(tle, timestamp) {
    const parsedTLE = this.parseTLE(tle);
    const timestampCopy = timestamp || Date.now();
    const timestampPlus = timestampCopy + 10000;
    const position1 = this.getSatelliteInfo(parsedTLE, timestampCopy);
    const position2 = this.getSatelliteInfo(parsedTLE, timestampPlus);

    const distance = this.getDistanceBetweenPointsGround(position1.lat, position1.lng, position2.lat, position2.lng);

    const kmPerSec = distance / 10;

    return kmPerSec;
  },

  getLatLon: function(tle, timestamp) {
    const tleObj = this.parseTLE(tle);

    // Validation.
    if (!this.isValidTLE(tleObj)) {
      throw new Error('TLE could not be parsed', tle);
    }

    var satInfo = this.getSatelliteInfo(tleObj.arr, timestamp);
    return {
      lat: satInfo.lat,
      lng: satInfo.lng
    }
  },

  getLatLonArr: function(tle, timestamp) {
    const ll = this.getLatLon(tle, timestamp);
    return [ ll.lat, ll.lng ];
  },

  getDistanceBetweenPointsGround: function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
            c(lat1 * p) * c(lat2 * p) *
            (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  },

  getLookAngles: function(tle, timestamp, lat, lng, height) {
    const satInfo = this.getSatelliteInfo(tle, timestamp);

    return {
      elevation: satInfo.elevation,
      azimuth: satInfo.azimuth,
      range: satInfo.range  // km?
    }
  },

  radiansToDegrees: function(radians) {
    return radians * (180 / Math.PI);
  },

  degreesToRadians: function(degrees) {
    return degrees * (Math.PI / 180);
  },

  getLatLonAtEpoch: function(tle) {
    return this.getLatLon(tle, this.getEpochTimestamp(tle));
  },

  getAverageOrbitLengthMins: function(tle) {
    return  (24 * 60) / this.getMeanMotion(tle);
  },

  dayOfYearToTimeStamp: function(dayOfYear, year) {
    year = year || (new Date()).getFullYear();
    var dayMS = 1000 * 60 * 60 * 24;
    var yearStart = new Date('1/1/' + year + ' 0:0:0 Z');

    yearStart = yearStart.getTime();

    return Math.floor(yearStart + ((dayOfYear - 1) * dayMS));
  },

  getTLEEpochTimestamp: function (tle) {
    const epochYear = this.getEpochYear(tle);
    const epochDayOfYear = this.getEpochDay(tle);
    const timestamp = this.dayOfYearToTimeStamp(epochDayOfYear, epochYear);

    return timestamp;
  },

  getLastAntemeridiamCrossingTimeMS(tle, timeMS) {
    const parsedTLE = this.parseTLE(tle);

    const time = timeMS || Date.now();

    let step = 1000 * 60 * 10;
    let curLatLon = [];
    let lastLatLon = [];
    let curTimeMS = time;
    let didCrossAntemeridian = false;
    while (step > 500) {
      curLatLon = this.getLatLonArr(parsedTLE.arr, curTimeMS);

      didCrossAntemeridian = this.crossesAntemeridian(lastLatLon[1], curLatLon[1]);
      if (didCrossAntemeridian) {
        // back up
        curTimeMS = curTimeMS + step;

        if (step > 20000) {
          step = 20000;
        } else {
          step /= 2;
        }
      } else {
        curTimeMS -= step;
        lastLatLon = curLatLon;
      }

    }
    return parseInt(curTimeMS);
  },

  getOrbitTimeMS: function(tle) {
    return parseInt(MS_IN_A_DAY / this.getMeanMotion(tle));
  },

  getGroundTrackLatLng: function (tle, stepMS, optionalTimeMS) {
    const timeMS = optionalTimeMS || Date.now();

    const parsedTLE = this.parseTLE(tle);

    const orbitTimeMS = this.getOrbitTimeMS(tle);
    const curOrbitStartMS = this.getLastAntemeridiamCrossingTimeMS(tle, timeMS);
    const lastOrbitStartMS = this.getLastAntemeridiamCrossingTimeMS(tle, curOrbitStartMS - 10000);
    const nextOrbitStartMS = this.getLastAntemeridiamCrossingTimeMS(tle, curOrbitStartMS + orbitTimeMS + 1000 * 60 * 30);

    const orbitStartTimes = [
      lastOrbitStartMS,
      curOrbitStartMS,
      nextOrbitStartMS
    ];

    const orbitLatLons = orbitStartTimes.map(orbitStartMS => this.getOrbitTrack(parsedTLE.arr, orbitStartMS, stepMS));

    return orbitLatLons;
  },

  getOrbitTrack(TLEArr, startTimeMS, stepMS) {
    if (!startTimeMS) return [];

    //  default to 1 minute intervals
    const defaultStepMS = 1000 * 60 * 1;
    let stepMSCopy = stepMS || defaultStepMS;

    const latLons = [];
    let curTimeMS = startTimeMS;
    let lastLatLon = [];
    let curLatLon = [];
    let isDone = false;
    let crossesAntemeridian = false;
    while (!isDone) {
      curLatLon = this.getLatLonArr(TLEArr, curTimeMS);

      crossesAntemeridian = this.crossesAntemeridian(lastLatLon[1], curLatLon[1]);

      if (crossesAntemeridian && stepMSCopy === 500) isDone = true;

      if (crossesAntemeridian) {
        // Go back a bit.
        curTimeMS -= stepMSCopy;
        stepMSCopy = 500;
      } else {
        latLons.push(curLatLon);
        curTimeMS += stepMSCopy;
        lastLatLon = curLatLon;
      }
    }

    return latLons;
  },

  getSatBearing(tle, customTimeMS) {
    const parsedTLE = this.parseTLE(tle);

    const timeMS = customTimeMS || Date.now();

    const latLon1 = this.getLatLonArr(parsedTLE.arr, timeMS);
    const latLon2 = this.getLatLonArr(parsedTLE.arr, timeMS + 10000);

    const crossesAntemeridian = this.crossesAntemeridian(latLon1[1], latLon2[1]);

    if (crossesAntemeridian) {
      // TODO: fix
      return {};
      // return this.getSatBearing(tle, customTimeMS + 10000);
    }

    const lat1 = this.degreesToRadians(latLon1[0]);
    const lat2 = this.degreesToRadians(latLon2[0]);
    const lon1 = this.degreesToRadians(latLon1[1]);
    const lon2 = this.degreesToRadians(latLon2[1]);

    const NS = (lat1 >= lat2) ? 'S' : 'N';
    const EW = (lon1 >= lon2) ? 'W' : 'E';

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const degrees = this.radiansToDegrees(Math.atan2(y, x));

    return {
      degrees,
      compass: `${NS}${EW}`
    };
  },

  isPositive: function(num) {
    return num >= 0;
  },

  crossesAntemeridian: function(longitude1, longitude2) {
    if (!longitude1 || !longitude2) return false;

    const isLong1Positive = this.isPositive(longitude1);
    const isLong2Positive = this.isPositive(longitude2);
    const haveSameSigns = isLong1Positive === isLong2Positive;

    if (haveSameSigns) return false;

    // Signs don't match, so check if we're reasonably near the antemeridian (just to be sure it's not the prime meridian).
    const isNearAntemeridian = Math.abs(longitude1) > 100;

    return isNearAntemeridian;
  },

  getGroundTrackLngLat: function (tle, stepMS) {
    const latLngArr = this.getGroundTrackLatLng(tle, stepMS);

    const lngLatArr = latLngArr.map(line => line.map(latLng => [latLng[1], latLng[0]]));

    return lngLatArr;
  }
};

tle.init();

return tle;
}));