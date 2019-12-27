import {
	propagate,
	twoline2satrec,
	gstime,
	eciToEcf,
	eciToGeodetic,
	ecfToLookAngles,
	degreesLong,
	degreesLat
} from "satellite.js";
import { parseTLE } from "./parsing";
import { getAverageOrbitTimeMins, getEpochTimestamp } from "./sugar-getters";

import {
	_degreesToRadians,
	_radiansToDegrees,
	_crossesAntemeridian,
	_getObjLength
} from "./utils";

const _SAT_REC_ERRORS = {
	_DEFAULT: "Problematic TLE with unknown error.",
	1: "mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er",
	2: "mean motion less than 0.0",
	3: "pert elements, ecc < 0.0  or  ecc > 1.0",
	4: "semi-latus rectum < 0.0",
	5: "epoch elements are sub-orbital",
	6: "satellite has decayed"
};

let cachedSatelliteInfo = {};
let cachedAntemeridianCrossings = {};
let cachedOrbitTracks = {};
let cachedVisibleSatellites = {
	slowMoving: {}
};
const caches = [
	cachedSatelliteInfo,
	cachedAntemeridianCrossings,
	cachedOrbitTracks,
	cachedVisibleSatellites
];

export function getCacheSizes() {
	return caches.map(cache => getObjLength);
}

/**
 * Provides a way to clear up memory for long-running apps.
 */
export function clearCache() {
	caches.forEach(cache => (cache = {}));

	cachedVisibleSatellites.slowMoving = [];
}

/**
	 * Determines satellite position and look angles from an earth observer.
	 *
	 * Example:
	 * const satInfo = tle.getSatelliteInfo(
	 *   tleStr,          // Satellite TLE string or array (2 or 3 line variants).
	 *   1501039265000,   // Unix timestamp (ms)
	 *   34.243889,       // Observer latitude (degrees)
	 *   -116.911389,     // Observer longitude (degrees)
	 *   0                // Observer elevation (km)
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
export function getSatelliteInfo(
	rawTLE,
	rawTimestamp,
	observerLat,
	observerLng,
	observerHeight
) {
	const timestamp = rawTimestamp || Date.now();

	const { tle } = parseTLE(rawTLE);

	const defaultObserverPosition = {
		lat: 36.9613422,
		lng: -122.0308,
		height: 0.37
	};

	const obsLat = observerLat || defaultObserverPosition.lat;
	const obsLng = observerLng || defaultObserverPosition.lng;
	const obsHeight = observerHeight || defaultObserverPosition.height;

	// Memoization
	const tleStrShort = tle[0].substr(0, 30);
	const cacheKey = `${tleStrShort}-${timestamp}-${observerLat}-${observerLng}
-${observerHeight}`;
	if (cachedSatelliteInfo[cacheKey]) {
		return cachedSatelliteInfo[cacheKey];
	}

	// Initialize a satellite record
	const satrec = twoline2satrec(tle[0], tle[1]);
	if (satrec.error) {
		throw new Error(
			_SAT_REC_ERRORS[satrec.error] || _SAT_REC_ERRORS._DEFAULT
		);
	}

	const dateObj = new Date(timestamp);

	// Propagate SGP4.
	const positionAndVelocity = propagate(satrec, dateObj);

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
	const gmst = gstime(dateObj);

	// Get ECF, Geodetic, Look Angles, and Doppler Factor.
	const positionEcf = eciToEcf(positionEci, gmst);
	const positionGd = eciToGeodetic(positionEci, gmst);
	const lookAngles = ecfToLookAngles(observerGd, positionEcf);

	const velocityKmS = Math.sqrt(
		Math.pow(velocityEci.x, 2) +
			Math.pow(velocityEci.y, 2) +
			Math.pow(velocityEci.z, 2)
	);

	// Azimuth: is simply the compass heading from the observer's position.
	const { azimuth, elevation, rangeSat } = lookAngles;

	// Geodetic coords are accessed via `longitude`, `latitude`, `height`.
	const { longitude, latitude, height } = positionGd;

	const output = {
		lng: degreesLong(longitude),
		lat: degreesLat(latitude),
		elevation: _radiansToDegrees(elevation),
		azimuth: _radiansToDegrees(azimuth),
		range: rangeSat,
		height,
		velocity: velocityKmS
	};

	// Memoization
	cachedSatelliteInfo[cacheKey] = output;

	return output;
}

/**
 * Determines if the last antemeridian crossing has been cached.  If it has, the time (in ms)
 * is returned, otherwise it returns false.
 */
export function getCachedLastAntemeridianCrossingTimeMS(tleObj, timeMS) {
	const { tle } = tleObj;

	const orbitLengthMS = getAverageOrbitTimeMins(tle) * 60 * 1000;

	const tleStr = tle[0].substr(0, 30);

	const cachedCrossingTimes = cachedAntemeridianCrossings[tleStr];
	if (!cachedCrossingTimes) return false;

	if (cachedCrossingTimes === -1) return cachedCrossingTimes;

	const cachedTime = cachedCrossingTimes.filter(val => {
		if (typeof val === "object" && val.tle === tle) return -1;

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
export function getLastAntemeridianCrossingTimeMS(tleObj, timeMS) {
	const cachedVal = getCachedLastAntemeridianCrossingTimeMS(tleObj, timeMS);
	if (cachedVal) return cachedVal;

	const { tle } = tleObj;

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
		curLatLon = getLatLon(tle, curTimeMS);

		didCrossAntemeridian = _crossesAntemeridian(
			lastLatLon[1],
			curLatLon[1]
		);
		if (didCrossAntemeridian) {
			// back up
			curTimeMS += step;
			step = step > 20000 ? 20000 : step / 2;
		} else {
			curTimeMS -= step;
			lastLatLon = curLatLon;
		}

		isDone = step < 500 || tries >= maxTries;

		tries++;
	}

	const couldNotFindCrossing = tries - 1 === maxTries;
	const crossingTime = couldNotFindCrossing ? -1 : parseInt(curTimeMS, 10);

	const tleStr = tle[0].substr(0, 30);
	if (!cachedAntemeridianCrossings[tleStr]) {
		cachedAntemeridianCrossings[tleStr] = [];
	}

	if (couldNotFindCrossing) {
		cachedAntemeridianCrossings[tleStr] = -1;
	} else {
		cachedAntemeridianCrossings[tleStr].push(crossingTime);
	}

	return crossingTime;
}

/**
 * Determines current satellite position, or position at time of timestamp (optional).
 */
export function getLatLngObj(tle, optionalTimestamp = Date.now()) {
	const { lat, lng } = getSatelliteInfo(tle, optionalTimestamp);
	return { lat, lng };
}

/**
 * Determines current satellite position, or position at time of timestamp (optional).
 */
export function getLatLng(tle, optionalTimestamp = Date.now()) {
	const { lat, lng } = getLatLngObj(tle, optionalTimestamp);
	return [lat, lng];
}

/**
 * Determines current satellite position, or position at time of timestamp (optional).
 */
export function getLngLat(tle, optionalTimestamp = Date.now()) {
	const { lat, lng } = getLatLngObj(tle, optionalTimestamp);
	return [lng, lat];
}

/**
 * Determines the position of the satellite at the time the TLE was generated.
 */
export function getLatLonAtEpoch(tle) {
	return getLatLon(tle, getEpochTimestamp(tle));
}

/**
 * Generates an array of lat/lng pairs representing a ground track (orbit track), starting
 * from startTimeMS and continuing until crossing the antemeridian, which is considered the end
 * of the orbit for convenience.
 */
export function getOrbitTrack(
	TLEArr,
	startTimeMS = Date.now(),
	rawStepMS = 1000,
	maxTimeMS = 6000000
) {
	const latLons = [];
	let curTimeMS = startTimeMS;
	let lastLngLat = [];
	let curLngLat = [];
	let isDone = false;
	let doesCrossAntemeridian = false;
	let stepMS = rawStepMS;

	// Memoization.
	const tleStr = TLEArr.join("");
	const tleStrTrimmed = tleStr.substr(0, 30);
	const startTime = (startTimeMS / 10000).toFixed();
	const cacheKey = `${tleStrTrimmed}-${startTime}-${stepMS}`;
	if (cachedOrbitTracks[cacheKey]) return cachedOrbitTracks[cacheKey];

	while (!isDone) {
		curLngLat = getLngLat(TLEArr, curTimeMS);

		doesCrossAntemeridian = _crossesAntemeridian(
			lastLngLat[0],
			curLngLat[0]
		);
		if (doesCrossAntemeridian) {
			if (stepMS === 500) isDone = true;

			// Go back a bit.
			curTimeMS -= stepMS;
			stepMS = 500;
		} else {
			latLons.push(curLngLat);
			curTimeMS += stepMS;
			lastLngLat = curLngLat;
		}

		if (maxTimeMS && curTimeMS - startTimeMS > maxTimeMS) isDone = true;
	}

	cachedOrbitTracks[cacheKey] = latLons;

	return latLons;
}

export function getOrbitTrackAsync(
	TLEArr,
	startTimeMS = Date.now(),
	stepMS = 1000,
	sleepMS = 0,
	jobSize = 1000
) {
	return new Promise(async (resolve, reject) => {
		const generator = getNextPosition(TLEArr, startTimeMS, stepMS);

		let step = 0;
		let isDone = false;
		let lngLats = [];
		while (!isDone) {
			const curVal = generator.next().value;

			const lastLng = lngLats.length && lngLats[lngLats.length - 1][0];
			const curLng = curVal[0];
			if (_crossesAntemeridian(lastLng, curLng)) {
				isDone = true;
			}

			lngLats.push(curVal);

			if (sleepMS && step % jobSize === 0) {
				await sleep(sleepMS);
			}

			step++;
		}

		resolve(lngLats);
	});
}

export function* getNextPosition(TLEArr, startTimeMS, stepMS) {
	let curTimeMS = startTimeMS;

	while (true) {
		curTimeMS += stepMS;
		yield getLngLat(TLEArr, curTimeMS);
	}
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO: cache geosync and erroring satellites and don't recompute on next pass.
export function getVisibleSatellites(
	observerLat,
	observerLng,
	observerHeight,
	tles = [],
	elevationThreshold = 0,
	timestampMS = Date.now()
) {
	return tles.reduce((visibleSats, tleArr, index) => {
		// Don't waste time reprocessing geosync.
		const cacheKey = tleArr[1];
		const cachedVal = cachedVisibleSatellites.slowMoving[cacheKey];
		if (cachedVal) {
			const { info } = cachedVal;
			const { elevation: cachedElevation } = info;
			return cachedElevation >= elevationThreshold
				? visibleSats.concat(cachedVal)
				: visibleSats;
		}

		let info;
		try {
			info = getSatelliteInfo(
				tleArr,
				timestampMS,
				observerLat,
				observerLng,
				observerHeight
			);
		} catch (e) {
			// Don't worry about decayed sats, just move on.
			// TODO cache error

			return visibleSats;
		}

		const { elevation, velocity, range } = info;

		const isSlowMoving = (velocity / range) < 0.001;
		if (isSlowMoving) {
			cachedVisibleSatellites.slowMoving[cacheKey] = { tleArr, info };
		}

		return elevation >= elevationThreshold
			? visibleSats.concat({ tleArr, info })
			: visibleSats;
	}, []);
}
