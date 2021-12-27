# tle.js

[![npm downloads](https://img.shields.io/npm/dm/tle.js.svg)](https://www.npmjs.com/package/tle.js)

Satellite TLE tools in JavaScript

## Installation

`npm add tle.js` or `yarn add tle.js`

## Introduction

`tle.js` is designed to simplify satellite TLEs and SGP4 with a friendly interface, with [satellite.js](https://github.com/shashwatak/satellite-js) doing the heavy lifting behind the scenes.

The origin of TLEs goes back to the punchcard days! A [TLE, or two-line element set](https://en.wikipedia.org/wiki/Two-line_element_set), is used by [SGP4 propagators](https://en.wikipedia.org/wiki/Simplified_perturbations_models)
to determine spacecraft positioning information, taking into account gravity perturbations (the
moon, etc).

Most users will probably want to simply get the latitude/longitude of a satellite (see
[getLatLngObj](#getlatlngobjtle-optionaltimestampms)) or get the look angles from a ground position, which can be used to track
where in the sky a satellite is visible (see [getSatelliteInfo](#getsatelliteinfotle-optionaltimestamp-observerlat-observerlng-observerelevation)). Users may
also want to plot orbit lines (see [getGroundTracks](#getgroundtracksoptions)).

Users may also be interested in grabbing specific values from a TLE. In this case, you
can use one of the [TLE getters](#basic-tle-getters), for instance [getCOSPAR](#getcospartle).

Note that TLEs should be updated at least daily to avoid drift in calculations. You can get them online at
[Celestrak](http://celestrak.com/NORAD/elements/), where they are updated every few hours.

More info on TLEs:

-   [Two-line element set (Wikipedia)](https://en.wikipedia.org/wiki/Two-line_element_set)
-   [TLE details from CASTOR](http://castor2.ca/03_Mechanics/03_TLE/)

## Support for CommonJS (e.g. Node <=12)

If you are using an older version of Node or a package that doesn't yet have ES Module support (and are getting the error `ERR_REQUIRE_ESM`), you will need to point to the special CommonJS build target. Simply change the `import` format in the following examples to this `require` format:

```diff
-import { getLatLngObj } from "tle.js";
+const { getLatLngObj } = require("tle.js/dist/tlejs.cjs");
```

## Support for Node 9 and older

Please install `tle.js` version '3.x.x':

```bash
npm i tle.js@3
```

## Shared code

Let's start out with some code to define some variables which we'll use in many examples below.

```js
// Satellite TLE; should be updated at least once a day for best results.
// TLE source: http://celestrak.com/NORAD/elements/
const tle = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```

Two-line variants and an array of strings are also accepted.

## `getLatLngObj(tle, optionalTimestampMS)`

Computes the latitude/longitude of a spacecraft. Defaults to the current local time if `optionalTimestampMS` is not passed in.

Note: the greater the difference between this timestamp and the TLE epoch (when the TLE was generated) will result in inaccuracies or even errors.

```js
import { getLatLngObj } from "tle.js";
const optionalTimestampMS = 1502342329860;
const latLonObj = getLatLngObj(tle, optionalTimestampMS);
->
{
  lat: -47.64247588153391,
  lng: -29.992233800623634
}
```

## `getGroundTracks(options)`

Async function that returns a Promise that resolves with an array of longitude, latitude pairs for drawing the ground track (satellite path) for three orbits: one past orbit, one current orbit, and one future orbit.

Orbits start and stop at the international date line (antemeridian) because values passing over
that line is commonly problematic in mapping.

Note: the synchronous version of this function, `getGroundTracksSync`, has the same function signature (it accepts the same inputs).

```js
import { getGroundTracks } from 'tle.js';

const threeOrbitsArr = await getGroundTracks({
    tle: tleStr,

    // Relative time to draw orbits from.  This will be used as the "middle"/current orbit.
    startTimeMS: 1502342329860,

    // Resolution of plotted points.  Defaults to 1000 (plotting a point once for every second).
    stepMS: 1000,

    // Returns points in [lng, lat] order when true, and [lat, lng] order when false.
    isLngLatFormat: true,
});

// Alternatively, if your setup doesn't support async/await:
getGroundTracks({
    tle: tleStr,
    startTimeMS: 1502342329860,
    stepMS: 1000,
    isLngLatFormat: true,
}).then(function (threeOrbitsArr) {
    // Do stuff with three orbits array here.
});

// threeOrbitsArr contents
[
    // previous orbit
    [
        [-179.93297540317567, 45.85524291891481],
        // etc...
    ],

    // current orbit
    [
        [-179.9398612198045, 51.26165992503701],
        // etc...
    ],

    // next orbit
    [
        [-179.9190165549038, 51.0273714070371],
        // etc...
    ],
];
```

## `getSatelliteInfo(tle, optionalTimestamp, observerLat, observerLng, observerElevation)`

Get both look angles (for a ground observer) as well as a few more tidbits of satellite info.

```js
import { getSatelliteInfo } from "tle.js";
const satInfo = getSatelliteInfo(
  tleStr,         // Satellite TLE string or array.
  1501039265000,  // Timestamp (ms)
  34.243889,      // Observer latitude (degrees)
  -116.911389,    // Observer longitude (degrees)
  0               // Observer elevation (km)
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

  // spacecraft velocity (relative to observer) in km/s
  velocity: 7.675627442183371
}
```

## `getVisibleSatellites(options)`

Calculates satellites visible relative to an observer's position.

```js
import { getVisibleSatellites } from "tle.js";
const allVisible = getVisibleSatellites({
  observerLat: 34.439283990227125,
  observerLng: -117.47561122364522,
  observerHeight: 0,

  // Array of 3-line TLE arrays.
  tles: uniqTLES,

  // Filters satellites above a certain elevation (0 is horizon, 90 is directly overhead).
  // E.g. 75 will only return satellites 75 degrees or greater above the horizon.
  // Defaults to 0.
  elevationThreshold: 75,

  // Defaults to current time.
  timestampMS: 1570911182419
});
->
[
  {
    tleArr: [
      'COSMOS 2492 [GLONASS-M]',
      '1 39620U 14012A   19285.51719791 -.00000065  00000-0  10000-3 0  9999',
      '2 39620  65.6759  35.9755 0011670 324.9338 289.9534  2.13103291 43246'
    ],
    info: {
      lng: -124.83404516738146,
      lat: 32.070522714505586,
      elevation: 81.2241916805502,
      azimuth: 251.01601040118692,
      range: 19217.756476304672,
      height: 19161.979896618526,
      velocity: 3.9490073154305385
    }
  },
  {
    tleArr: [
      'GSAT0203 (GALILEO 7)',
      '1 40544U 15017A   19284.43409211 -.00000061  00000-0  00000+0 0  9996',
      '2 40544  56.2559  48.3427 0003736 223.0231 136.9337  1.70475323 28252'
    ],
    info: {
      lng: -117.86836105927033,
      lat: 29.08239877156373,
      elevation: 83.16839172166615,
      azimuth: 183.67559090645165,
      range: 23256.47316878015,
      height: 23221.387218003325,
      velocity: 3.6703580049175333
    }
  }
]
```

## Basic TLE getters

In addition to the powerful functions above, there are also helpful functions for getting
specific information from a TLE itself.

For further reading, see [Kelso's article](https://celestrak.com/columns/v04n03/).

### Shared TLE for below examples.

```js
const tle = `ISS (ZARYA)
1 25544U 98067A   17206.18396726  .00001961  00000-0  36771-4 0  9993
2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.54225995 67660`;
```

### `getSatelliteName(tle)`

Returns the name of the satellite. Note that this defaults to 'Unknown' for 2-line TLEs that lack
the satellite name on the first line.

```js
import { getSatelliteName } from "tle.js";
getSatelliteName(tle);
-> 'ISS (ZARYA)'
```

### `getCatalogNumber(tle)`

Returns the [NORAD satellite catalog number](https://en.wikipedia.org/wiki/Satellite_Catalog_Number).
Used since Sputnik was launched in 1957 (Sputnik's rocket was 00001, while Sputnik itself was
00002).

-   Range: 0 to 99999

```js
import { getCatalogNumber } from "tle.js";
getCatalogNumber(tle);
-> 25544
```

### `getCOSPAR(tle)`

Returns the COSPAR id string, aka [international designator](https://en.wikipedia.org/wiki/International_Designator).

```js
import { getCOSPAR } from "tle.js";
getCOSPAR(tle);
-> "1998-067A"
```

### `getClassification(tle)`

Returns the satellite classification.

-   'U' = unclassified
-   'C' = classified
-   'S' = secret

```js
import { getClassification } from "tle.js";
getClassification(tle);
-> 'U'
```

### `getIntDesignatorYear(tle)`

Launch year (last two digits) ([international designator](https://en.wikipedia.org/wiki/International_Designator)), which makes up part of the COSPAR id.

Note that a value between 57 and 99 means the launch year was in the 1900s, while a value between
00 and 56 means the launch year was in the 2000s.

-   Range: 00 to 99

```js
import { getIntDesignatorYear } from "tle.js";
getIntDesignatorYear(tle);
-> 98
```

### `getIntDesignatorLaunchNumber(tle)`

Launch number of the year
([international designator](https://en.wikipedia.org/wiki/International_Designator)), which makes up part of the COSPAR id.

-   Range: 1 to 999

```js
import { getIntDesignatorLaunchNumber } from "tle.js";
getIntDesignatorLaunchNumber(tle);
-> 67
```

### `getIntDesignatorPieceOfLaunch(tle)`

Piece of the launch
([international designator](https://en.wikipedia.org/wiki/International_Designator)), which makes up part of the COSPAR id.

-   Range: A to ZZZ

```js
import { getIntDesignatorPieceOfLaunch } from "tle.js";
getIntDesignatorPieceOfLaunch(tle);
-> 'A'
```

### `getEpochYear(tle)`

TLE epoch year (last two digits) when the TLE was generated.

-   Range: 00 to 99

```js
import { getEpochYear } from "tle.js";
getEpochYear(tle);
-> 17
```

### `getEpochDay(tle)`

TLE epoch day of the year (day of year with fractional portion of the day) when the TLE was
generated.

-   Range: 1 to 365.99999999

```js
import { getEpochDay } from "tle.js";
getEpochDay(tle);
-> 206.18396726
```

### `getEpochTimestamp(tle)`

Unix timestamp (in milliseconds) when the TLE was generated (the TLE epoch).

```js
import { getEpochTimestamp } from "tle.js";
getEpochTimestamp(tle);
-> 1500956694771
```

### `getFirstTimeDerivative(tle)`

First Time Derivative of the [Mean Motion](https://en.wikipedia.org/wiki/Mean_Motion) divided by
two, measured in orbits per day per day (orbits/day<sup>2</sup>). Defines how mean motion changes
from day to day, so TLE propagators can still be used to make reasonable guesses when distant
from the original TLE epoch.

-   Units: Orbits / day<sup>2</sup>

```js
import { getFirstTimeDerivative } from "tle.js";
getFirstTimeDerivative(tle);
-> 0.00001961
```

### `getSecondTimeDerivative(tle)`

Second Time Derivative of [Mean Motion](https://en.wikipedia.org/wiki/Mean_Motion) divided by six,
measured in orbits per day per day per day (orbits/day<sup>3</sup>). Similar to the first time
derivative, it measures rate of change in the [Mean Motion Dot](http://castor2.ca/03_Mechanics/03_TLE/Mean_Mot_Dot.html)
so software can make reasonable guesses when distant from the original TLE epoch.

Usually zero, unless the satellite is manuevering or in a decaying orbit.

-   Units: Orbits / day<sup>3</sup>

```js
import { getSecondTimeDerivative } from "tle.js";
getSecondTimeDerivative(tle);
-> 0
```

Note: the original value in TLE is `00000-0` (= `0.0 x 10`<sup>`0`</sup> = `0`).

### `getBstarDrag(tle)`

[BSTAR](https://en.wikipedia.org/wiki/BSTAR) drag term. This estimates the effects of atmospheric
drag on the satellite's motion.

-   Units: EarthRadii<sup>-1</sup>

```js
import { getBstarDrag } from "tle.js";
getBstarDrag(tle);
-> 0.000036771
```

Note: the original value in TLE is '36771-4' (= `0.36771 x 10`<sup>`-4`</sup> = `0.000036771`).

### `getOrbitModel(tle)`

Private value - used by the [United States Space Force](https://en.wikipedia.org/wiki/United_States_Space_Force) to reference the orbit model used to generate the
TLE. Will always be seen as zero externally (e.g. by "us", unless you are "them" - in which case,
hello!).

```js
import { getOrbitModel } from "tle.js";
getOrbitModel(tle);
-> 0
```

### `getTleSetNumber(tle)`

TLE element set number, incremented for each new TLE generated since launch. 999 seems to mean the
TLE has maxed out.

-   Range: Technically 1 to 9999, though in practice the maximum number seems to be 999.

```js
import { getTleSetNumber } from "tle.js";
getTleSetNumber(tle);
-> 999
```

### `getChecksum1(tle)`

TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.

-   Range: 0 to 9

```js
import { getChecksum1 } from "tle.js";
getChecksum1(tle);
-> 3
```

Note that this simply reads the checksum baked into the TLE string. Compare this with the computed checksum to ensure data integrity:

```js
import { getChecksum1, computeChecksum } from "tle.js";
const expectedChecksum = getChecksum1(tle);
-> 3
const computedChecksum = computeChecksum(tle[1]);
-> 3
expectedChecksum === computedChecksum;
-> true
```

### `getInclination(tle)`

[Inclination](https://en.wikipedia.org/wiki/Orbital_inclination) relative to the Earth's
equatorial plane in degrees. 0 to 90 degrees is a prograde orbit and 90 to 180 degrees is a
retrograde orbit.

-   Units: degrees
-   Range: 0 to 180

```js
import { getInclination } from "tle.js";
getInclination(tle);
-> 51.6400
```

### `getRightAscension(tle)`

[Right ascension of the ascending node](https://en.wikipedia.org/wiki/Right_ascension_of_the_ascending_node)
in degrees. Essentially, this is the angle of the satellite as it crosses northward (ascending)
across the Earth's equator (equatorial plane).

-   Units: degrees
-   Range: 0 to 359.9999

```js
import { getRightAscension } from "tle.js";
getRightAscension(tle);
-> 208.9163
```

### `getEccentricity(tle)`

[Orbital eccentricity](https://en.wikipedia.org/wiki/Orbital_eccentricity), decimal point assumed.
All artificial Earth satellites have an eccentricity between 0 (perfect circle) and 1 (parabolic
orbit).

-   Range: 0 to 1

```js
import { getEccentricity } from "tle.js";
getEccentricity(tle);
-> 0.0006317
```

Note that the value in the original TLE is `0006317`, with the preceding decimal point assumed
(= `0.0006317`).

### `getPerigee(tle)`

[Argument of perigee](https://en.wikipedia.org/wiki/Argument_of_perigee).

-   Units: degrees
-   Range: 0 to 359.9999

```js
import { getPerigee } from "tle.js";
getPerigee(tle);
-> 69.9862
```

### `getMeanAnomaly(tle)`

[Mean Anomaly](https://en.wikipedia.org/wiki/Mean_Anomaly). Indicates where the satellite was
located within its orbit at the time of the TLE epoch.

-   Units: degrees
-   Range: 0 to 359.9999

```js
import { getMeanAnomaly } from "tle.js";
getMeanAnomaly(tle);
-> 25.2906
```

### `getMeanMotion(tle)`

Revolutions around the Earth per day ([mean motion](https://en.wikipedia.org/wiki/Mean_Motion)).

-   Units: revs per day
-   Range: 0 to 17 (theoretically)

```js
import { getMeanMotion } from "tle.js";
getMeanMotion(tle);
-> 15.54225995
```

### `getRevNumberAtEpoch(tle)`

Total satellite revolutions when this TLE was generated. This number seems to roll over (e.g.
99999 -> 0).

-   Units: revs
-   Range: 0 to 99999

```js
import { getRevNumberAtEpoch } from "tle.js";
getRevNumberAtEpoch(tle);
-> 6766
```

### `getChecksum2(tle)`

TLE line 2 checksum (modulo 10) for verifying the integrity of this line of the TLE.

-   Range: 0 to 9

```js
import { getChecksum2 } from "tle.js";
getChecksum2(tle);
-> 0
```

Note that this simply reads the checksum baked into the TLE string. Compare this with the computed checksum to ensure data integrity:

```js
import { getChecksum2, computeChecksum } from "tle.js";
const expectedChecksum = getChecksum2(tle);
-> 0
const computedChecksum = computeChecksum(tle[2]);
-> 0
expectedChecksum === computedChecksum;
-> true
```
