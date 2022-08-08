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
import {
	getAverageOrbitTimeMins,
	getAverageOrbitTimeMS,
	getEpochTimestamp
} from "./sugar-getters";
import { _MS_IN_A_DAY, _MS_IN_A_MINUTE } from "./constants";
import {
	_degreesToRadians,
	_radiansToDegrees,
	_crossesAntemeridian,
	_getObjLength
} from "./utils";

const _SAT_REC_ERRORS = {
	_DEFAULT: "Problematic TLE with unknown error.",
	1: "Mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er",
	2: "Mean motion less than 0.0",
	3: "Pert elements, ecc < 0.0  or  ecc > 1.0",
	4: "Semi-latus rectum < 0.0",
	5: "Epoch elements are sub-orbital",
	6: "Satellite has decayed"
};

let cachedSatelliteInfo = {};
let cachedAntemeridianCrossings = {};
let cachedOrbitTracks = {};
let cachedGroundTrack = {};
const caches = [
	cachedSatelliteInfo,
	cachedAntemeridianCrossings,
	cachedOrbitTracks,
	cachedGroundTrack
];

/**
 * Returns the current size of SGP caches.
 */
export function getCacheSizes() {
	return caches.map(_getObjLength);
}

/**
 * Clears SGP caches to free up memory for long-running apps.
 */
export function clearCache() {
	caches.forEach((_cache, idx) => {
		caches[idx] = {};
	});
}

/**
 * Determines satellite position and look angles from an earth observer.
 *
 * Example:
 * const satInfo = getSatelliteInfo(
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
 * TODO: default to 0,0.
 * TODO: return error instead of throwing?
 */
export function getSatelliteInfo(
	rawTLE,
	rawTimestamp,
	observerLat,
	observerLng,
	observerHeight
) {
	const timestamp = rawTimestamp || Date.now();

	const { tle, error: parseError } = parseTLE(rawTLE);

	if (parseError) {
		throw new Error(parseError);
	}

	const defaultObserverPosition = {
		lat: 36.9613422,
		lng: -122.0308,
		height: 0.37
	};

	const obsLat = observerLat || defaultObserverPosition.lat;
	const obsLng = observerLng || defaultObserverPosition.lng;
	const obsHeight = observerHeight || defaultObserverPosition.height;

	// Memoization
	const cacheKey = `${tle[0]}-${timestamp}-${observerLat}-${observerLng}
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
export function getLastAntemeridianCrossingTimeMS(tle, timeMS) {
	const parsedTLE = parseTLE(tle);
	const { tle: tleArr } = parsedTLE;

	const cachedVal = getCachedLastAntemeridianCrossingTimeMS(
		parsedTLE,
		timeMS
	);
	if (cachedVal) {
		return cachedVal;
	}

	const time = timeMS || Date.now();

	let step = 1000 * 60 * 3;
	let curLngLat = [];
	let lastLngLat = [];
	let curTimeMS = time;
	let didCrossAntemeridian = false;
	let tries = 0;
	let isDone = false;
	const maxTries = 1000;
	while (!isDone) {
		curLngLat = getLngLat(tleArr, curTimeMS);
		const [curLng] = curLngLat;

		didCrossAntemeridian = _crossesAntemeridian(lastLngLat[0], curLng);
		if (didCrossAntemeridian) {
			// Back up to before we crossed the line.
			curTimeMS += step;

			// Keep narrowing by halving increments.
			step = step / 2;
		} else {
			// Didn't cross yet, so keep incrementing.
			curTimeMS -= step;
			lastLngLat = curLngLat;
		}

		isDone = step < 500 || tries >= maxTries;

		tries++;
	}

	const couldNotFindCrossing = tries - 1 === maxTries;
	const crossingTime = couldNotFindCrossing ? -1 : parseInt(curTimeMS, 10);

	const tleStr = tleArr[0];
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
 *
 * @param {Array|String} tle
 * @param {Number} optionalTimestamp Unix timestamp in milliseconds.
 */
export function getLatLngObj(tle, optionalTimestamp = Date.now()) {
	const { lat, lng } = getSatelliteInfo(tle, optionalTimestamp);
	return { lat, lng };
}

/**
 * Determines current satellite position, or position at time of timestamp (optional).
 *
 * @param {Array|String} tle
 * @param {Number} optionalTimestamp Unix timestamp in milliseconds.
 */
export function getLatLng(tle, optionalTimestamp = Date.now()) {
	const { lat, lng } = getSatelliteInfo(tle, optionalTimestamp);
	return [lat, lng];
}

/**
 * Determines current satellite position, or position at time of timestamp (optional).
 *
 * @param {Array|String} tle
 * @param {Number} optionalTimestamp Unix timestamp in milliseconds.
 */
export function getLngLat(tle, optionalTimestamp = Date.now()) {
	const { lat, lng } = getSatelliteInfo(tle, optionalTimestamp);
	return [lng, lat];
}

/**
 * Determines the position of the satellite at the time the TLE was generated.
 *
 * @param {Array|String} tle
 */
export function getLngLatAtEpoch(tle) {
	return getLngLat(tle, getEpochTimestamp(tle));
}

// TODO: cache geosync and erroring satellites and don't recompute on next pass.
export function getVisibleSatellites({
	observerLat,
	observerLng,
	observerHeight = 0,
	tles = [],
	elevationThreshold = 0,
	timestampMS = Date.now()
}) {
	return tles.reduce((visibleSats, tleArr) => {
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

		return elevation >= elevationThreshold
			? visibleSats.concat({ tleArr, info })
			: visibleSats;
	}, []);
}

export function* getNextPosition(tleArr, startTimeMS, stepMS) {
	let curTimeMS = startTimeMS - stepMS;

	while (true) {
		curTimeMS += stepMS;
		yield {
			curTimeMS,
			lngLat: getLngLat(tleArr, curTimeMS)
		};
	}
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates an array of lng/lat pairs representing a ground track (orbit track), starting
 * from startTimeMS and continuing until just before crossing the antemeridian, which is considered the end
 * of the orbit for convenience.
 *
 * Consider pairing this with getLastAntemeridianCrossingTimeMS() to create a full orbit path (see usage
 * in getGroundTracks()).
 */
export async function getOrbitTrack({
	tle,
	startTimeMS = Date.now(),
	stepMS = 1000,
	sleepMS = 0,
	jobChunkSize = 1000,
	maxTimeMS = 6000000,
	isLngLatFormat = true
}) {
	const { tle: tleArr } = parseTLE(tle);

	const startS = (startTimeMS / 1000).toFixed();
	const cacheKey = `${tleArr[0]}-${startS}-${stepMS}-${isLngLatFormat}`;
	if (cachedOrbitTracks[cacheKey]) {
		return cachedOrbitTracks[cacheKey];
	}

	const generator = getNextPosition(
		tleArr,
		startTimeMS,
		stepMS,
		isLngLatFormat
	);

	let step = 0;
	let isDone = false;
	let coords = [];
	let lastLng;
	while (!isDone) {
		const { curTimeMS, lngLat } = generator.next().value;
		const [curLng, curLat] = lngLat;

		const doesCrossAntemeridian = _crossesAntemeridian(lastLng, curLng);
		const doesExceedTime = maxTimeMS && curTimeMS - startTimeMS > maxTimeMS;
		isDone = doesCrossAntemeridian || doesExceedTime;

		if (isDone) break;

		if (isLngLatFormat) {
			coords.push(lngLat);
		} else {
			coords.push([curLat, curLng]);
		}

		if (sleepMS && step % jobChunkSize === 0) {
			// Chunk is processed, so cool off a bit.
			await sleep(sleepMS);
		}

		lastLng = curLng;
		step++;
	}

	cachedOrbitTracks[cacheKey] = coords;

	return coords;
}

/**
 *
 */
export function getOrbitTrackSync({
	tle,
	startTimeMS = Date.now(),
	stepMS = 1000,
	maxTimeMS = 6000000,
	isLngLatFormat = true
}) {
	const { tle: tleArr } = parseTLE(tle);

	const startS = (startTimeMS / 1000).toFixed();
	const cacheKey = `${tleArr[0]}-${startS}-${stepMS}-${isLngLatFormat}`;
	if (cachedOrbitTracks[cacheKey]) {
		return cachedOrbitTracks[cacheKey];
	}

	let isDone = false;
	let coords = [];
	let lastLng;
	let curTimeMS = startTimeMS;
	while (!isDone) {
		const curLngLat = getLngLat(tleArr, curTimeMS);
		const [curLng, curLat] = curLngLat;

		const doesCrossAntemeridian = _crossesAntemeridian(lastLng, curLng);
		const doesExceedTime = maxTimeMS && curTimeMS - startTimeMS > maxTimeMS;
		isDone = doesCrossAntemeridian || doesExceedTime;

		if (isDone) break;

		if (isLngLatFormat) {
			coords.push(curLngLat);
		} else {
			coords.push([curLat, curLng]);
		}

		lastLng = curLng;
		curTimeMS += stepMS;
	}

	cachedOrbitTracks[cacheKey] = coords;

	return coords;
}

/**
 * Calculates three orbit arrays of latitude/longitude pairs.
 * TODO: just calculate future orbits
 *
 * @param {Array|String} options.tle
 * @param {Number} startTimeMS Unix timestamp in milliseconds.
 * @param {Number} stepMS Time in milliseconds between points on the ground track.
 * @param {Boolean} isLngLatFormat Whether coords are in [lng, lat] format.
 *
 *
 * Example:
 * const threeOrbitsArr = await getGroundTracks({ tle: tleStr });
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
export function getGroundTracks({
	tle,
	startTimeMS = Date.now(),
	stepMS = 1000,
	isLngLatFormat = true
}) {
	const parsedTLE = parseTLE(tle);
	const orbitTimeMS = getAverageOrbitTimeMS(parsedTLE);
	const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
		parsedTLE,
		startTimeMS
	);

	const foundCrossing = curOrbitStartMS !== -1;
	if (!foundCrossing) {
		// Geosync or unusual orbit, so just return a Promise for a partial orbit track.

		return Promise.all([
			getOrbitTrack({
				tle: parsedTLE,
				startTimeMS,
				stepMS: _MS_IN_A_MINUTE,
				maxTimeMS: _MS_IN_A_DAY / 4,
				isLngLatFormat
			})
		]);
	}

	/**
	 * Buffer time that will be sure to place us well within the previous or next orbit.
	 */
	const bufferMS = orbitTimeMS / 5;

	const lastOrbitStartMS = getLastAntemeridianCrossingTimeMS(
		parsedTLE,
		curOrbitStartMS - bufferMS
	);

	const nextOrbitStartMS = getLastAntemeridianCrossingTimeMS(
		parsedTLE,
		curOrbitStartMS + orbitTimeMS + bufferMS
	);

	const groundTrackPromises = [
		getOrbitTrack({
			tle: parsedTLE,
			startTimeMS: lastOrbitStartMS,
			stepMS,
			isLngLatFormat
		}),
		getOrbitTrack({
			tle: parsedTLE,
			startTimeMS: curOrbitStartMS,
			stepMS,
			isLngLatFormat
		}),
		getOrbitTrack({
			tle: parsedTLE,
			startTimeMS: nextOrbitStartMS,
			stepMS,
			isLngLatFormat
		})
	];

	return Promise.all(groundTrackPromises);
}

/**
 * Calculates three orbit arrays of latitude/longitude pairs.
 *
 * Example:
 * const threeOrbitsArr = getGroundTrackSync({ tle: tleStr });
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
export function getGroundTracksSync({
	tle,
	stepMS = 1000,
	optionalTimeMS = Date.now(), // TODO: change to startTimeMS for consistency
	isLngLatFormat = true
}) {
	const parsedTLE = parseTLE(tle);
	const { tle: tleArr } = parsedTLE;

	const orbitTimeMS = getAverageOrbitTimeMS(tleArr);
	const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
		parsedTLE,
		optionalTimeMS
	);

	const foundCrossing = curOrbitStartMS !== -1;
	if (!foundCrossing) {
		// Geosync or unusual orbit, so just return a partial orbit track.

		const partialGroundTrack = getOrbitTrackSync({
			tle: parsedTLE,
			startTimeMS: optionalTimeMS,
			stepMS: _MS_IN_A_MINUTE,
			maxTimeMS: _MS_IN_A_DAY / 4
		});

		return partialGroundTrack;
	}

	/**
	 * Buffer time that will be sure to place us well within the previous or next orbit.
	 */
	const bufferMS = orbitTimeMS / 5;

	const lastOrbitStartMS = getLastAntemeridianCrossingTimeMS(
		parsedTLE,
		curOrbitStartMS - bufferMS
	);
	const nextOrbitStartMS = getLastAntemeridianCrossingTimeMS(
		parsedTLE,
		curOrbitStartMS + orbitTimeMS + bufferMS
	);

	const orbitStartTimes = [
		lastOrbitStartMS,
		curOrbitStartMS,
		nextOrbitStartMS
	];

	const orbitLatLons = orbitStartTimes.map(orbitStartMS => {
		return getOrbitTrackSync({
			tle: parsedTLE,
			startTimeMS: orbitStartMS,
			stepMS,
			isLngLatFormat
		});
	});

	return orbitLatLons;
}

/**
 * Determines the compass bearing from the perspective of the satellite.  Useful for 3D / pitched
 * map perspectives.
 *
 * TODO: a bit buggy at extreme parts of orbits, where latitude hardly changes.
 */
export function getSatBearing(tle, timeMS = Date.now()) {
	const parsedTLE = this.parseTLE(tle);

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

	const NS = lat1 >= lat2 ? "S" : "N";
	const EW = lon1 >= lon2 ? "W" : "E";

	const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
	const x =
		Math.cos(lat1) * Math.sin(lat2) -
		Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
	const degrees = _radiansToDegrees(Math.atan2(y, x));

	return {
		degrees,
		compass: `${NS}${EW}`
	};
}
