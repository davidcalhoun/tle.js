# tle.js
[![Build Status](https://travis-ci.org/davidcalhoun/tle.js.svg?branch=master)](https://travis-ci.org/davidcalhoun/tle.js)
[![Downloads][downloads-image]][npm-url]

Satellite TLE tools in JavaScript

## Introduction
A [TLE, or two-line element set](https://en.wikipedia.org/wiki/Two-line_element_set), is used by
[SGP4 propagators](https://en.wikipedia.org/wiki/Simplified_perturbations_models) to determine
spacecraft information.  Their origin goes back to the punchcard days!  `tle.js` is designed to
simplify TLE processing with a friendly interface.

Most users will probably want to simply get the latitude/longitude of a satellite (see
[getLatLon](#getlatlon)) or get the look angles from a ground position, which can be used to track
where in the sky a satellite is visible (see [getSatelliteInfo](#getsatelliteinfo)).  Users may
also want to plot orbit lines (see [getGroundTrackLatLng](#getgroundtracklatlng-current-time)).

Users may also be interested in grabbing specific values from a TLE.  In this case, you
can use one of the [TLE getters](#basic-tle-getters).

Note that TLEs should be update daily to avoid drift in calculations.  You can get them online at
[Celestrak](http://celestrak.com/NORAD/elements/).

## Shared code
Let's start out with some code to define some variables which we'll use in many examples below.

```js
const tlejs = require('tle.js');

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```

In addition to this three-line TLE string, you may also pass in a two-line TLE string, as well
as an array of two or three line TLEs.

```js
// Two-line array example.
const tleArr = [
  '1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993',
  '2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660'
];
```

## Satellite latitude and longitude

### getLatLon
Get the current latitude/longitude of a spacecraft.

```js
const latLonObj = tle.getLatLon(tleStr);
// {
//   lat: -35.120571636901786,
//   lng: -54.5473164683468
// }
```

### getLatLon specific time
Get the latitude/longitude of a spacecraft at a specific time.

Due to drift, the results become less accurate the farther away the time is from the time the TLE
was generated (the TLE's epoch).

```js
const timestampMS = 1502342329860;
const latLonObj = tle.getLatLon(tleStr, timestampMS);
// {
//   lat: -47.64247588153391,
//   lng: -29.992233800623634
// }
```

## Orbit lines (ground track)
### getGroundTrackLatLng (current time)
Returns an array of latitude, longitude pairs for drawing the ground track (satellite path) for
three orbits: one past orbit, one current orbit, and one future orbit.  Orbits start and stop at the international date line (antemeridian) because values passing over that line is commonly
problematic in mapping.

```js
const threeOrbitsArr = tle.getGroundTrackLatLng(tleStr);
/*
[
  // previous orbit
  [
    [ 45.85524291891481, -179.93297540317567 ],
    ...
  ],

  // current orbit
  [
    [ 51.26165992503701, -179.9398612198045 ],
    ...
  ],

  // next orbit
  [
    [ 51.0273714070371, -179.9190165549038 ],
    ...
  ]
]
*/
```

### getGroundTrackLatLng (specific time and controlling resolution)
```js
// Resolution: plot a new point in the ground track polygon every 1000 milliseconds.
const stepMS = 1000;

// Relative time to draw orbits from.  This will be used as the "middle"/current orbit.
const timestampMS = 1502342329860;

const threeOrbitsArr = tle.getGroundTrackLatLng(
  tleStr,
  stepMS,
  timestampMS
);
/*
[
  // previous orbit
  [
    [ 45.85524291891481, -179.93297540317567 ],
    ...
  ],

  // current orbit
  [
    [ 51.26165992503701, -179.9398612198045 ],
    ...
  ],

  // next orbit
  [
    [ 51.0273714070371, -179.9190165549038 ],
    ...
  ]
]
*/
```

## Observer look angles
### getSatelliteInfo
Get both look angles (for a ground observer) as well as a few more tidbits of satellite info.

```js
const timestampMS = 1501039265000;

// Observer details.
const observer = {
  lat: 34.243889,
  lon: -116.911389,
  height: 0
};

const satInfo = tle.getSatelliteInfo(
  tleStr, 
  timestampMS,     // Timestamp (ms)
  observer.lat,    // Observer latitude (degrees)
  observer.lon,    // Observer longitude (degrees)
  observer.height  // Observer elevation (km)
);

// {
//   // satellite compass heading from observer in degrees
//   azimuth:   294.5780478624994,
//   // satellite elevation from observer in degrees (90 is directly overhead)
//   elevation: 81.63903620330046,
//   // km distance from observer to spacecraft
//   range:     406.60211015810074,
//
//   // spacecraft altitude in km
//   height:   402.9082788620108,
//   // spacecraft latitude in degrees
//   lat:      34.45112876592785,
//   // spacecraft longitude in degrees
//   lng:      -117.46176597710809,
//   // spacecraft velocity in km/s
//   velocity: 7.675627442183371
// }

```


## Basic TLE getters
In addition to the powerful functions above, there are also helpful functions for getting
specific information from a TLE itself.

### Shared variables for below examples.
```js
const tlejs = require('tle.js');

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```

### getSatelliteName
Returns the name of the satellite.  Note that this defaults to 'Unknown' for 2-line TLEs that lack
the satellite name on the first line.
```js
tlejs.getSatelliteName(tleStr);
// ISS (ZARYA)
```

### getSatelliteNumber
Returns the [satellite catalog number](https://en.wikipedia.org/wiki/Satellite_Catalog_Number).

```js
tlejs.getSatelliteNumber(tleStr);
// 25544
```

### getClassification
Returns the classification ('U' means 'unclassified').

```js
tlejs.getClassification(tleStr);
// 'U'
```

### getIntDesignatorYear
Launch year (last two digits) ([international designator](https://en.wikipedia.org/wiki/International_Designator)).

```js
tlejs.getIntDesignatorYear(tleStr);
// 98
```

### getIntDesignatorLaunchNumber
Launch number of the year
([international designator](https://en.wikipedia.org/wiki/International_Designator)).

```js
tlejs.getIntDesignatorLaunchNumber(tleStr);
// 67
```

### getIntDesignatorPieceOfLaunch
Piece of the launch
([international designator](https://en.wikipedia.org/wiki/International_Designator)).

```js
tlejs.getIntDesignatorPieceOfLaunch(tleStr);
// A
```

### getEpochYear
TLE epoch year (last two digits) when the TLE was generated.

```js
tlejs.getEpochYear(tleStr);
// 17
```

### getEpochDay
TLE epoch day of the year (day of year with fractional portion of the day) when the TLE was
generated.

```js
tlejs.getEpochDay(tleStr);
// 206.18396726
```

You can convert this to a millisecond timestamp by using `dayOfYearToTimeStamp()`:
```js
const tleEpochYear = tlejs.getEpochYear(tleStr);
// 17
const tleEpochDay = tlejs.getEpochDay(tleStr);
// 206.18396726
const tleEpochTimestampMS = tle.dayOfYearToTimeStamp(tleEpochDay, tleEpochYear);
// 1500956694771
```


### getFirstTimeDerivative
First Time Derivative of the [Mean Motion](https://en.wikipedia.org/wiki/Mean_Motion) divided by
two.

```js
tlejs.getFirstTimeDerivative(tleStr);
// 0.00001961
```

### getSecondTimeDerivative
Second Time Derivative of [Mean Motion](https://en.wikipedia.org/wiki/Mean_Motion) divided by six
(decimal point assumed).

```js
tlejs.getSecondTimeDerivative(tleStr);
// 0
```

### getBstarDrag
[BSTAR](https://en.wikipedia.org/wiki/BSTAR) drag term (decimal point assumed).  Note that this
value in the original TLE is `36771-4`, which means 0.36771 * 10<sup>-4</sup>, or `3.67710`, which is
the value returned.

```js
tlejs.getBstarDrag(tleStr);
// 3.67710
```

### getTleSetNumber
TLE element set number.  Incremented for each new TLE generated.  (Note: 999 seems to mean the TLE
has maxxed out).

```js
tlejs.getTleSetNumber(tleStr);
// 999
```

### getChecksum1
TLE line 1 checksum (modulo 10).

```js
tlejs.getChecksum1(tleStr);
// 3
```

### getInclination
[Inclination](https://en.wikipedia.org/wiki/Orbital_inclination) in degrees.

```js
tlejs.getInclination(tleStr);
// 51.6400
```

### getRightAscension
[Right ascension of the ascending node](https://en.wikipedia.org/wiki/Right_ascension_of_the_ascending_node) in degrees.

```js
tlejs.getRightAscension(tleStr);
// 208.9163
```

### getEccentricity
[Orbital eccentricity](https://en.wikipedia.org/wiki/Orbital_eccentricity), decimal point assumed.
Note that this value in the original TLE is `0006317`, which means `0.0006317`, which is the value
returned.

```js
tlejs.getEccentricity(tleStr);
// 0.0006317
```

### getPerigee
[Argument of perigee](https://en.wikipedia.org/wiki/Argument_of_perigee) in degrees.

```js
tlejs.getPerigee(tleStr);
// 69.9862
```

### getMeanAnomaly
[Mean Anomaly](https://en.wikipedia.org/wiki/Mean_Anomaly) in degrees.

```js
tlejs.getMeanAnomaly(tleStr);
// 3
```

### getMeanMotion
Revolutions per day ([mean motion](https://en.wikipedia.org/wiki/Mean_Motion)).

```js
tlejs.getMeanMotion(tleStr);
// 25.2906
```

### getRevNumberAtEpoch
Total satellite revolutions when this TLE was generated.

```js
tlejs.getRevNumberAtEpoch(tleStr);
// 6766
```

### getChecksum2
TLE line 2 checksum (modulo 10).

```js
tlejs.getChecksum2(tleStr);
// 0
```


[downloads-image]: https://img.shields.io/npm/dm/tle.js.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/tle.js