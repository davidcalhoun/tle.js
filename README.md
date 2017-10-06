# tle.js
[![Build Status](https://travis-ci.org/davidcalhoun/tle.js.svg?branch=master)](https://travis-ci.org/davidcalhoun/tle.js)
[![Downloads][downloads-image]][npm-url]

Satellite TLE tools in JavaScript

## Introduction
`tle.js` is designed to simplify satellite TLEs and SGP4 with a friendly interface.

The origin of TLEs goes back to the punchcard days!  A [TLE, or two-line element set](https://en.wikipedia.org/wiki/Two-line_element_set), is used by [SGP4 propagators](https://en.wikipedia.org/wiki/Simplified_perturbations_models)
to determine spacecraft positioning information, taking into account gravity perturbations (the
moon, etc).

Most users will probably want to simply get the latitude/longitude of a satellite (see
[getLatLon](#getlatlon)) or get the look angles from a ground position, which can be used to track
where in the sky a satellite is visible (see [getSatelliteInfo](#getsatelliteinfo)).  Users may
also want to plot orbit lines (see [getGroundTrackLatLng](#getgroundtracklatlng-current-time)).

Users may also be interested in grabbing specific values from a TLE.  In this case, you
can use one of the [TLE getters](#basic-tle-getters).

Note that TLEs should be update daily to avoid drift in calculations.  You can get them online at
[Celestrak](http://celestrak.com/NORAD/elements/).

More info on TLEs:
* [Two-line element set (Wikipedia)](https://en.wikipedia.org/wiki/Two-line_element_set)
* [TLE details from CASTOR](http://castor2.ca/03_Mechanics/03_TLE/)

## Shared code
Let's start out with some code to define some variables which we'll use in many examples below.

```js
const TLEJS = require('tle.js');
const tlejs = new TLEJS();

// Satellite TLE; should be updated daily.
// TLE source: http://celestrak.com/NORAD/elements/
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

->
{
  lat: -35.120571636901786,
  lng: -54.5473164683468
}
```

### getLatLon specific time
Get the latitude/longitude of a spacecraft at a specific time.

Due to drift, the results become less accurate the farther away the time is from the time the TLE
was generated (the TLE's epoch).

```js
const timestampMS = 1502342329860;
const latLonObj = tle.getLatLon(tleStr, timestampMS);

->
{
  lat: -47.64247588153391,
  lng: -29.992233800623634
}
```

## Orbit lines (ground track)
### getGroundTrackLatLng (current time)
Returns an array of latitude, longitude pairs for drawing the ground track (satellite path) for
three orbits: one past orbit, one current orbit, and one future orbit.

Orbits start and stop at the international date line (antemeridian) because values passing over
that line is commonly problematic in mapping.

Note: if you need the points in reverse order (longitude, latitude), e.g. for GeoJSON points, you
can use the function `getGroundTrackLngLat` instead.

```js
const threeOrbitsArr = tle.getGroundTrackLatLng(tleStr);

->
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

->
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
```

## Observer look angles
### getSatelliteInfo
Get both look angles (for a ground observer) as well as a few more tidbits of satellite info.

```js
const timestampMS = 1501039265000;
const observer = {
  lat: 34.243889,
  lng: -116.911389,
  height: 0
};
const satInfo = tle.getSatelliteInfo(
  tleStr,          // Satellite TLE string or array.
  timestampMS,     // Timestamp (ms)
  observer.lat,    // Observer latitude (degrees)
  observer.lng,    // Observer longitude (degrees)
  observer.height  // Observer elevation (km)
);

->
{
  // satellite compass heading from observer in degrees (0 = north, 180 = south)
  azimuth: 294.5780478624994,
  
  // satellite elevation from observer in degrees (90 is directly overhead)
  elevation: 81.63903620330046,
  
  // km distance from observer to spacecraft
  range: 406.60211015810074,

  // spacecraft altitude in km
  height: 402.9082788620108,

  // spacecraft latitude in degrees
  lat: 34.45112876592785,

  // spacecraft longitude in degrees
  lng: -117.46176597710809,
  
  // spacecraft velocity in km/s
  velocity: 7.675627442183371
}
```


## Basic TLE getters
In addition to the powerful functions above, there are also helpful functions for getting
specific information from a TLE itself.

### Shared variables for below examples.
```js
const tlejs = require('tle.js');
const tlejs = new TLEJS();

const tleStr = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```

### getSatelliteName
Returns the name of the satellite.  Note that this defaults to 'Unknown' for 2-line TLEs that lack
the satellite name on the first line.
```js
tlejs.getSatelliteName(tleStr);
-> 'ISS (ZARYA)'
```

### getSatelliteNumber
Returns the [NORAD satellite catalog number](https://en.wikipedia.org/wiki/Satellite_Catalog_Number).
Used since Sputnik was launched in 1957 (Sputnik's rocket was 00001, while Sputnik itself was
00002).

* Range: 0 to 99999

```js
tlejs.getSatelliteNumber(tleStr);
-> 25544
```

### getClassification
Returns the satellite classification.

* 'U' = unclassified
* 'C' = classified
* 'S' = secret

```js
tlejs.getClassification(tleStr);
-> 'U'
```

### getIntDesignatorYear
Launch year (last two digits) ([international designator](https://en.wikipedia.org/wiki/International_Designator)).

Note that a value between 57 and 99 means the launch year was in the 1900s, while a value between
00 and 56 means the launch year was in the 2000s.

* Range: 00 to 99

```js
tlejs.getIntDesignatorYear(tleStr);
-> 98
```

### getIntDesignatorLaunchNumber
Launch number of the year
([international designator](https://en.wikipedia.org/wiki/International_Designator)).

* Range: 1 to 999

```js
tlejs.getIntDesignatorLaunchNumber(tleStr);
-> 67
```

### getIntDesignatorPieceOfLaunch
Piece of the launch
([international designator](https://en.wikipedia.org/wiki/International_Designator)).

* Range: A to ZZZ

```js
tlejs.getIntDesignatorPieceOfLaunch(tleStr);
-> 'A'
```

### getEpochYear
TLE epoch year (last two digits) when the TLE was generated.

* Range: 00 to 99

```js
tlejs.getEpochYear(tleStr);
-> 17
```

### getEpochDay
TLE epoch day of the year (day of year with fractional portion of the day) when the TLE was
generated.

* Range: 1 to 365.99999999

```js
tlejs.getEpochDay(tleStr);
-> 206.18396726
```

### getEpochTimestamp
Unix timestamp (in milliseconds) when the TLE was generated (the TLE epoch).

```js
tle.getEpochTimestamp(tleStr);
-> 1500956694771
```

### getFirstTimeDerivative
First Time Derivative of the [Mean Motion](https://en.wikipedia.org/wiki/Mean_Motion) divided by
two, measured in orbits per day per day (orbits/day<sup>2</sup>).  Defines how mean motion changes
from day to day, so TLE propagators can still be used to make reasonable guesses when distant
from the original TLE epoch.

* Units: Orbits / day<sup>2</sup>

```js
tlejs.getFirstTimeDerivative(tleStr);
-> 0.00001961
```

### getSecondTimeDerivative
Second Time Derivative of [Mean Motion](https://en.wikipedia.org/wiki/Mean_Motion) divided by six,
measured in orbits per day per day per day (orbits/day<sup>3</sup>).  Similar to the first time
derivative, it measures rate of change in the [Mean Motion Dot](http://castor2.ca/03_Mechanics/03_TLE/Mean_Mot_Dot.html)
so software can make reasonable guesses when distant from the original TLE epoch.

Usually zero, unless the satellite is manuevering or in a decaying orbit.

* Units: Orbits / day ^ 3.

```js
tlejs.getSecondTimeDerivative(tleStr);
-> 0
```

Note: the original value in TLE is '00000-0' (= `0.0 x 10`<sup>`0`</sup> = 0).

### getBstarDrag
[BSTAR](https://en.wikipedia.org/wiki/BSTAR) drag term.  This estimates the effects of atmospheric
drag on the satellite's motion.

* Units: EarthRadii<sup>-1</sup>

```js
tlejs.getBstarDrag(tleStr);
-> 0.000036771
```

Note: the original value in TLE is '36771-4' (= `0.36771 x 10`<sup>`-4`</sup> = `0.000036771`).

### getOrbitModel
Private value - used by Air Force Space Command to reference the orbit model used to generate the
TLE.  Will always be seen as zero externally (e.g. by "us", unless you are "them" - in which case,
hello!).

```js
tlejs.getOrbitModel(tleStr);
-> 0
```

### getTleSetNumber
TLE element set number, incremented for each new TLE generated since launch.  999 seems to mean the
TLE has maxed out.

* Range: Technically 1 to 9999, though in practice the maximum number seems to be 999.

```js
tlejs.getTleSetNumber(tleStr);
-> 999
```

### getChecksum1
TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE.

* Range: 0 to 9

```js
tlejs.getChecksum1(tleStr);
-> 3
```

You can compare this number to the calculated checksum by using `tleLineChecksum()`:

```js
const expectedChecksum = tlejs.getChecksum1(tleArr);
-> 3
const calculatedChecksum = tlejs.tleLineChecksum(tleArr[0]);
-> 3
```


### getInclination
[Inclination](https://en.wikipedia.org/wiki/Orbital_inclination) relative to the Earth's
equatorial plane in degrees. 0 to 90 degrees is a prograde orbit and 90 to 180 degrees is a
retrograde orbit.

* Units: degrees
* Range: 0 to 180

```js
tlejs.getInclination(tleStr);
-> 51.6400
```

### getRightAscension
[Right ascension of the ascending node](https://en.wikipedia.org/wiki/Right_ascension_of_the_ascending_node)
in degrees.  Essentially, this is the angle of the satellite as it crosses northward (ascending)
across the Earth's equator (equatorial plane).

* Units: degrees
* Range: 0 to 359.9999

```js
tlejs.getRightAscension(tleStr);
-> 208.9163
```

### getEccentricity
[Orbital eccentricity](https://en.wikipedia.org/wiki/Orbital_eccentricity), decimal point assumed.
All artifical Earth satellites have an eccentricity between 0 (perfect circle) and 1 (parabolic
orbit).

* Range: 0 to 1

```js
tlejs.getEccentricity(tleStr);
-> 0.0006317
```

Note that the value in the original TLE is `0006317`, with the preceding decimal point assumed
(= `0.0006317`).

### getPerigee
[Argument of perigee](https://en.wikipedia.org/wiki/Argument_of_perigee).

* Units: degrees
* Range: 0 to 359.9999

```js
tlejs.getPerigee(tleStr);
-> 69.9862
```

### getMeanAnomaly
[Mean Anomaly](https://en.wikipedia.org/wiki/Mean_Anomaly). Indicates where the satellite was
located within its orbit at the time of the TLE epoch.

* Units: degrees
* Range: 0 to 359.9999

```js
tlejs.getMeanAnomaly(tleStr);
-> 25.2906
```

### getMeanMotion
Revolutions around the Earth per day ([mean motion](https://en.wikipedia.org/wiki/Mean_Motion)).

* Range: 0 to 17 (theoretically)

```js
tlejs.getMeanMotion(tleStr);
-> 15.54225995
```

### getRevNumberAtEpoch
Total satellite revolutions when this TLE was generated.  This number seems to roll over (e.g.
99999 -> 0).

* Range: 0 to 99999

```js
tlejs.getRevNumberAtEpoch(tleStr);
-> 6766
```

### getChecksum2
TLE line 2 checksum (modulo 10), for verifying the integrity of this line of the TLE.

* Range: 0 to 9

```js
tlejs.getChecksum2(tleStr);
-> 0
```

You can compare this number to the calculated checksum by using `tleLineChecksum()`:

```js
const expectedChecksum = tlejs.getChecksum2(tleArr);
-> 0
const calculatedChecksum = tlejs.tleLineChecksum(tleArr[1]);
-> 0
```


[downloads-image]: https://img.shields.io/npm/dm/tle.js.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/tle.js