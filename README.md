# tle.js
Satellite TLE tools in JavaScript

## Introduction
`tle.js` is designed to simplify TLE processing with a friendly interface.  It can be used simply,
to get information about a TLE, or in a more complex way, to get a satellite's GPS coordinates at
a given time.  It can also be used to compute look angles at a given time (used to find the angle
and compass direction of a satellite from an observer's position on the ground).


## Satellite location and look angles
```js
const tlejs = require('tle.js');

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```

### getLatLon
Simple usage: get the current latitude/longitude of a spacecraft.

```js
const latLonObj = tle.getLatLon(tleStr);
// {
//   lat: -35.120571636901786,
//   lng: -54.5473164683468
// }
```

Note that you can also pass in the 2-line TLE variant:

```js
const tleStrTwoLine = `1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```
const latLonObj = tle.getLatLon(tleStr);
// {
//   lat: -35.120571636901786,
//   lng: -54.5473164683468
// }
```

You can also pass in the TLE as an array (both 2 and 3 line TLE variants are acceptable).

```js
const tleArr = ['ISS (ZARYA)',
'1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993',
'2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660']

const latLonObj = tle.getLatLon(tleArr);
// {
//   lat: -35.120571636901786,
//   lng: -54.5473164683468
// }
```

### getLatLon specific time
Get the latitude/longitude of a spacecraft at a specific time.  Note that due to drift, the results
become less accurate the farther away the time is from the time the TLE was generated (the TLE's
epoch).

```js
const timestampMS = 1502342329860;
const latLonObj = tle.getLatLon(tleStr, timestampMS);
// {
//   lat: -47.64247588153391,
//   lng: -29.992233800623634
// }
```

### getGroundTrackLatLng
Returns an array of latitude, longitude pairs for drawing the ground track (satellite path) for
three orbits: one past orbit, one current orbit, and one future orbit.  Orbits start and stop at the international date line (antemeridian) because that's a common problematic area for mapping.

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

You can also pass in parameters for controlling ground track resolution and time:

```js
// Plot a new point in the ground track polygon every 1000 milliseconds.
const stepMS = 1000;

// Relative time to draw orbits from.  This will be used as the "middle"/current orbit.
const timestampMS = 1502342329860;

const threeOrbitsArr = tle.getGroundTrackLatLng(tleStr, stepMS, timestampMS);
```


### getSatelliteInfo
A very powerful function to get both look angles (for a ground observer) as well as a few more
tidbits of satellite info.

```js
// Timestamp can be in past, present, or future.
const timestampMS = 1501039265000;

// GPS coordinates, in degrees, of an observer on the ground ([latitude, longitude] array).
const observerLatLonArr = [34.243889, -116.911389];
const observerHeight = 0;

const satInfo = tle.getSatelliteInfo(tle1, timestampMS, observerLatLonArr[0], observerLatLonArr[1], observerHeight);
// {
//   // observer-to-spacecraft info
//   azimuth: 294.5780478624994,    // degrees (compass heading)
//   elevation: 81.63903620330046,  // degrees (90 deg is directly overhead)
//   range: 406.60211015810074,     // km (distance from observer to spacecraft)
//
//   // spacecraft info
//   height: 402.9082788620108,     // km (altitude of spacecraft)
//   lat: 34.45112876592785,        // degrees (latitude of spacecraft)
//   lng: -117.46176597710809,      // degrees (longitude of spacecraft)
//   velocity: 7.675627442183371    // km/s (satellite velocity)
// }

```


## Basic TLE getters
In addition to the powerful functions above, there are also helpful functions for getting
specific information from a TLE itself.

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

You can convert this to a millisecond timestamp by using dayOfYearToTimeStamp():
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
value in the original TLE is `36771-4`, which means `0.36771 * 10 ^ -4`, or `3.67710`, which is
the value returned.

```js
tlejs.getBstarDrag(tleStr);
// 3.67710
```

### getTleSetNumber
TLE element set number.  Incremented for each new TLE generated.

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
TLE Checksum (modulo 10).

```js
tlejs.getChecksum2(tleStr);
// 0
```
