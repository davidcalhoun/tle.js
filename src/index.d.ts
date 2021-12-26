declare module 'tle.js' {
    /**
     * Generic degrees.  Generally 0 to 360 degrees unless otherwise noted.
     */
    export type Degrees = number;

    export type Meters = number;

    export type Kilometers = number;

    export type KilometersPerSecond = number;

    /**
     * Latitude in degrees.
     * Range: from -90 to 90.
     */
    export type LatitudeDegrees = number;

    /**
     * Longitude in degrees.
     * Range: from -180 to 180.
     */
    export type LongitudeDegrees = number;

    /**
     * Unix timestamp in milliseconds.
     */
    export type Timestamp = number;

    export type Minutes = number;

    export type Seconds = number;

    export type Milliseconds = number;

    /**
     * TLE in unknown format, to be normalized by parseTLE().
     */
    export type TLE = string | [string, TLELine, TLELine] | [TLELine, TLELine] | ParsedTLE;

    export type TLELine = string;

    /**
     * Three ground track arrays (last, current, and next orbit).
     */
    export type ThreeGroundTracks = [LngLat[], LngLat[], LngLat[]];

    /**
     * Output of getBstarDrag() in EarthRadii ^ -1 units.
     */
    export type BSTARDragOutput = number;

    /**
     * Output of getFirstTimeDerivative() in orbits / day ^ 2 units.
     */
    export type FirstTimeDerivativeOutput = number;

    /**
     * Output of getSecondTimeDerivative() in orbits / day ^ 3 units.
     */
    export type SecondTimeDerivativeOutput = number;

    export enum SatelliteClassification {
        Unclassified = "U",
        Classified = "C",
        Secret = "S"
    }

    /**
     * Input for getGroundTracks() and getGroundTracksSync().
     */
    export interface GroundTracksInput {
        /** Satellite TLE. */
        tle: TLE,
        /**
         * Unix timestamp in milliseconds.
         * @default Current time.
         */
        startTimeMS?: Timestamp,
        /**
         * Time in milliseconds between points in the ground track.
         * @default 1000
         */
        stepMS?: Milliseconds,
        /**
         * Whether coords are in [lng, lat] format.
         * @default true
         */
        isLngLatFormat?: boolean
    }

    /**
     * Longitude, latitude pair in Array format.  Note that this format is reversed from the more familiar
     * lat/lng format in order to be easily used for GeoJSON, which formats points as [lng, lat].
     * @example [-117.918976, 33.812511]
     */
    export interface LngLat {
        [0]: LongitudeDegrees;
        [1]: LatitudeDegrees
    }

    /**
     * Latitude, longitude pair in Object format.
     * @example { lat: 33.812511, lng: -117.918976 }
     */
    export interface LatLngObject {
        lat: LatitudeDegrees,
        lng: LongitudeDegrees
    }

    /**
     * Output of parseTLE().  TLE normalized into a predictable format for fast lookups.
     */
    export interface ParsedTLE {
        /**
         * Satellite name (only extracted from 3-line TLE inputs).
         * @default "Unknown"
         */
        name?: string,
        /** Two-line TLE. */
        tle: [TLELine, TLELine]
    }

    /**
     * Input for getOrbitTrackSync().  Note that getOrbitTrack() uses OrbitTrackInput instead.
     */
    export interface OrbitTrackSyncInput {
        /**
         * TLE input.
         */
        tle: TLE,
        /**
         * Time to begin drawing the orbit track from.
         * @default Current time.
         */
        startTimeMS?: Timestamp,
        /**
         * Time to begin drawing the orbit track from.
         * @default 1000
         */
        stepMS?: Timestamp,
        /**
         * Maximum milliseconds to process before returning.  This is needed for geosynchronous satellites,
         * because they never cross the antemeridian.
         * @default 6000000
         */
        maxTimeMS?: Milliseconds,
        /**
         * Whether to output in [lng, lat] format.
         * @default true
         */
        isLngLatFormat?: boolean
    }

    /**
     * Input for getOrbitTrack().  Note that getOrbitTrackSync() uses OrbitTrackInputSync instead.
     */
    export interface OrbitTrackInput extends OrbitTrackSyncInput {
        /**
         * (Experimental) Time to "cool off" between processing chunks.
         * @default 0
         */
        sleepMS?: Milliseconds,
        /**
         * (Experimental) Satellite positions to calculate in one "chunk" before cooling off.
         * @default 1000
         */
        jobChunkSize?: number
    }

    /**
     * Output for getSatBearing().
     */
    export interface SatBearingOutput {
        degrees: Degrees,
        compass: string
    }

    /**
     * Output for getSatelliteInfo().
     */
    export interface SatelliteInfoOutput {
        /** (degrees) Satellite compass heading from observer (0 = north, 180 = south). */
        azimuth: Degrees,
        /** (degrees) Satellite elevation from observer (90 is directly overhead). */
        elevation: Degrees,
        /** (km) Distance from observer to spacecraft. */
        range: Kilometers,
        /** (km) Spacecraft altitude. */
        height: Kilometers,
        /** (degrees) Spacecraft latitude. */
        lat: LatitudeDegrees,
        /** (degrees) Spacecraft longitude. */
        lng: LongitudeDegrees,
        /** (km/s) Spacecraft velocity. */
        velocity: KilometersPerSecond
    }

    /**
     * Input for getVisibleSatellites().
     */
    export interface VisibleSatellitesInput {
        /**
         * (degrees) Ground observer latitude.
         */
        observerLat: LatitudeDegrees,
        /**
         * (degrees) Ground observer longitude.
         */
        observerLng: LongitudeDegrees,
        /**
         * (km) Ground observer elevation.
         * @default 0
         */
        observerHeight: Kilometers,
        /**
         * Full list of known TLEs.
         * @default []
         */
        tles: TLE[],
        /**
         * (degrees) Filters out satellites that are below this degree threshold (0 is horizon, 90 is straight up,
         * negative numbers are below the horizon).
         * @default 0
         */
        elevationThreshold: Degrees,
        /**
         * Full list of known TLEs.
         * @default Current time.
         */
        timestampMS: Timestamp
    }

    /**
     * Clears SGP caches to free up memory for long-running apps.
     */
    export function clearCache(): undefined;

    /**
     * Returns the current sizes of SGP caches.
     */
    export function getCacheSizes(): number[];

    /**
     * (Async) Calculates three orbit tracks for a TLE (previous, current, and next orbits).
     */
    export function getGroundTracks(input: GroundTracksInput): Promise<ThreeGroundTracks>;

    /**
     * (Sync) Calculates three orbit tracks for a TLE  (previous, current, and next orbits).
     */
    export function getGroundTracksSync(input: GroundTracksInput): ThreeGroundTracks;

    /**
     * Determines the last time the satellite crossed the antemeridian.  Returns -1 if not found
     * (e.g. for geosynchronous satellites).
     * 
     * @param parsedTLE TLE parsed by parseTLE().
     * @param startTime Relative time to determine the previous antemeridian crossing time.
     */
    export function getLastAntemeridianCrossingTimeMS(parsedTLE: ParsedTLE, startTime: Timestamp): Timestamp | -1;

    /**
     * Determines satellite position for the given time.
     * 
     * @param tle TLE input.
     * @param timestamp Timestamp to get position for.
     */
    export function getLatLngObj(tle: TLE, timestamp?: Timestamp): LatLngObject;

    /**
     * Determines the satellite's position at the time of the TLE epoch (when the TLE was generated).
     * 
     * @param tle TLE input.
     */
    export function getLngLatAtEpoch(tle: TLE): LngLat;

    /**
     * (Async) Generates an array of lng/lat pairs representing a ground track (orbit track), starting
     * from startTimeMS and continuing until just before crossing the antemeridian, which is considered the end
     * of the orbit for convenience.
     *
     * Consider pairing this with getLastAntemeridianCrossingTimeMS() to create a full orbit path (see usage
     * in getGroundTracks()).
     */
    export function getOrbitTrack(input: OrbitTrackInput): Promise<LngLat[]>;

    /**
     * (Sync) Generates an array of lng/lat pairs representing a ground track (orbit track), starting
     * from startTimeMS and continuing until just before crossing the antemeridian, which is considered the end
     * of the orbit for convenience.
     *
     * Consider pairing this with getLastAntemeridianCrossingTimeMS() to create a full orbit path (see usage
     * in getGroundTracksSync()).
     */
    export function getOrbitTrackSync(input: OrbitTrackSyncInput): LngLat[];

    /**
     * (Experimental) Determines the compass bearing from the perspective of the satellite.
     * Useful for 3D / pitched map perspectives.
     */
    export function getSatBearing(tle: TLE, timeMS?: Timestamp): SatBearingOutput;

    /**
     * Determines satellite position and look angles from an earth observer.
     * Note that observer input arguments are only needed if you are interested in observer-relative
     * outputs (azimuth, elevation, and range).
     */
    export function getSatelliteInfo(
        /** TLE input. */
        tle: TLE,
        /** Timestamp to get satellite position for. */
        timestamp: Timestamp,
        /**
         * (degrees) Ground observer latitude.  Only needed for azimuth, elevation, and range.
         * @default 36.9613422
         */
        observerLat?: LatitudeDegrees,
        /**
         * (degrees) Ground observer longitude.  Only needed for azimuth, elevation, and range.
         * @default -122.0308
         */
        observerLng?: LongitudeDegrees,
        /**
         * (m) Ground observer meters above the ellipsoid.  Only needed for azimuth, elevation, and range.
         * @default 0.37
         */
        observerHeight?: Meters): SatelliteInfoOutput;

    /**
     * Determines which satellites are currently visible, assuming a completely flat horizon.
     */
    export function getVisibleSatellites(input: VisibleSatellitesInput): SatelliteInfoOutput[];

    /**
     * BSTAR drag term. This estimates the effects of atmospheric drag on the satellite's motion.
     * See https://en.wikipedia.org/wiki/BSTAR, https://celestrak.com/columns/v04n03, and
     * http://www.castor2.ca/03_Mechanics/03_TLE/B_Star.html
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getBstarDrag('1 25544U 98067A   17206.18396726 ...');
     * 0.000036771
     */
    export function getBstarDrag(tle: TLE, isTLEParsed?: boolean): BSTARDragOutput;

    /**
     * Returns the Space Catalog Number (aka NORAD Catalog Number).
     * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
     * Output range: 0 to 99999
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getCatalogNumber('1 25544U 98067A   17206.18396726 ...');
     * 25544
     */
    export function getCatalogNumber(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Space Catalog Number (aka NORAD Catalog Number) from the first line of the TLE.
     * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
     * Output range: 0 to 99999
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getCatalogNumber1('1 25544U 98067A   17206.18396726 ...');
     * 25544
     */
    export function getCatalogNumber1(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that
     * letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.
     * Output range: 0 to 9
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getChecksum1('1 25544U 98067A   17206.18396726 ...');
     * 3
     */
    export function getChecksum1(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the satellite classification.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getClassification('1 25544U 98067A   17206.18396726 ...');
     * 'U' // = unclassified
     */
    export function getClassification(tle: TLE, isTLEParsed?: boolean): SatelliteClassification;

    /**
     * Returns the TLE epoch day of the year (day of year with fractional portion of the day) when the
     * TLE was generated.  For example, a TLE generated on January 1 will return something like
     * `1.18396726`.
     * Output range: 1 to 365.99999999
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getEpochDay('1 25544U 98067A   17206.18396726 ...');
     * 206.18396726
     */
    export function getEpochDay(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the TLE epoch year (last two digits) when the TLE was generated.  For example, a TLE
     * generated in 2022 will return `22`.
     * Output range: 00 to 99.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getEpochYear('1 25544U 98067A   17206.18396726 ...');
     * 17
     */
    export function getEpochYear(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * First Time Derivative of the Mean Motion divided by two, measured in orbits per day per day
     * (orbits/day ^ 2). Defines how mean motion changes from day to day, so TLE propagators can still be
     * used to make reasonable guesses when distant from the original TLE epoch.  Can be a negative
     * or positive number.
     * Aka mean motion dot.
     * See https://en.wikipedia.org/wiki/Mean_Motion
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getFirstTimeDerivative('1 25544U 98067A   17206.18396726 ...');
     * 0.00001961
     */
    export function getFirstTimeDerivative(tle: TLE, isTLEParsed?: boolean): FirstTimeDerivativeOutput;

    /**
     * Returns the launch number of the year, which makes up part of the COSPAR id
     * (international designator).  For example, the 50th launch of the year will return 50.
     * See https://en.wikipedia.org/wiki/International_Designator
     * Output range: 1 to 999
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getIntDesignatorLaunchNumber('1 25544U 98067A   17206.18396726 ...');
     * 67
     */
    export function getIntDesignatorLaunchNumber(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the piece of the launch, which makes up part of the COSPAR id (international designator).
     * For example, "A" represents the primary payload, followed by secondary payloads, rockets involved
     * in the launch, and any subsequent debris.
     * See https://en.wikipedia.org/wiki/International_Designator
     * Output range: A to ZZZ
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getIntDesignatorPieceOfLaunch('1 25544U 98067A   17206.18396726 ...');
     * "A"
     */
    export function getIntDesignatorPieceOfLaunch(tle: TLE, isTLEParsed?: boolean): string;

    /**
     * Returns the launch year (last two digits), which makes up part of the COSPAR id
     * (international designator).  For example, a satellite launched in 1999 will return "99".
     * See https://en.wikipedia.org/wiki/International_Designator
     * Output range: 00 to 99
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getIntDesignatorYear('1 25544U 98067A   17206.18396726 ...');
     * 98
     */
    export function getIntDesignatorYear(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the line number from line 1.  Should always return "1" for valid TLEs.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getLineNumber1('1 25544U 98067A   17206.18396726 ...');
     * 1
     */
    export function getLineNumber1(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Private value - used by Air Force Space Command to reference the orbit model used to generate the
     * TLE (e.g. SGP, SGP4).  Distributed TLES will always return 0 for this value.  Note that all
     * distributed TLEs are generated with SGP4/SDP4.
     * See https://celestrak.com/columns/v04n03/
     * Output range: 0 to 9
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getOrbitModel('1 25544U 98067A   17206.18396726 ...');
     * 0
     */
    export function getOrbitModel(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Second Time Derivative of Mean Motion divided by six, measured in orbits per day per day per day
     * (orbits/day ^ 3). Similar to the first time derivative, it measures rate of change in the Mean
     * Motion Dot so software can make reasonable guesses when distant from the original TLE epoch.  Normally
     * zero unless the satellite is manuevering or has a decaying orbit.
     * See https://en.wikipedia.org/wiki/Mean_Motion and http://castor2.ca/03_Mechanics/03_TLE/Mean_Mot_Dot.html
     * Aka mean motion double dot.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getSecondTimeDerivative('1 25544U 98067A   17206.18396726 ...');
     * 0
     */
    export function getSecondTimeDerivative(tle: TLE, isTLEParsed?: boolean): SecondTimeDerivativeOutput;

    /**
     * TLE element set number, incremented for each new TLE generated since launch. 999 seems to mean
     * the TLE has maxed out.
     * Output range: technically 1 to 9999, though in practice the maximum number seems to be 999.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getTleSetNumber('1 25544U 98067A   17206.18396726 ...');
     * 999
     */
    export function getTleSetNumber(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Space Catalog Number (aka NORAD Catalog Number) from the second line of the TLE.
     * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
     * Output range: 0 to 99999
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getCatalogNumber2('1 25544U 98067A   17206.18396726 ...');
     * 25544
     */
    export function getCatalogNumber2(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * TLE line 2 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that
     * letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.
     * Output range: 0 to 9
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getChecksum2('1 25544U 98067A   17206.18396726 ...');
     * 0
     */
    export function getChecksum2(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the orbital eccentricity. All artificial Earth satellites have an eccentricity between 0
     * (perfect circle) and 1 (parabolic orbit).
     * See https://en.wikipedia.org/wiki/Orbital_eccentricity
     * Output range: 0 to 1
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getEccentricity('1 25544U 98067A   17206.18396726 ...');
     * 0.0006317
     */
    export function getEccentricity(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the inclination relative to the Earth's equatorial plane in degrees (0 to 180 degrees).
     * 0 to 90 degrees is a prograde orbit and 90 to 180 degrees is a retrograde orbit.
     * See https://en.wikipedia.org/wiki/Orbital_inclination
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getInclination('1 25544U 98067A   17206.18396726 ...');
     * 51.6400
     */
    export function getInclination(tle: TLE, isTLEParsed?: boolean): Degrees;

    /**
     * Returns the line number from line 2.  Should always return "2" for valid TLEs.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getLineNumber2('1 25544U 98067A   17206.18396726 ...');
     * 2
     */
    export function getLineNumber2(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Mean Anomaly. Indicates where the satellite was located within its orbit at the
     * time of the TLE epoch.
     * See https://en.wikipedia.org/wiki/Mean_Anomaly
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getMeanAnomaly('1 25544U 98067A   17206.18396726 ...');
     * 25.2906
     */
    export function getMeanAnomaly(tle: TLE, isTLEParsed?: boolean): Degrees;

    /**
     * Returns the revolutions around the Earth per day (mean motion).  Theoretically can be a value
     * between 0 to 17.
     * See https://en.wikipedia.org/wiki/Mean_Motion
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getMeanMotion('1 25544U 98067A   17206.18396726 ...');
     * 15.54225995
     */
    export function getMeanMotion(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the argument of perigee.
     * See https://en.wikipedia.org/wiki/Argument_of_perigee
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getPerigee('1 25544U 98067A   17206.18396726 ...');
     * 69.9862
     */
    export function getPerigee(tle: TLE, isTLEParsed?: boolean): Degrees;

    /**
     * Returns the total satellite revolutions when this TLE was generated (0 to 99999). This number
     * seems to roll over (e.g. 99999 -> 0).
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getRevNumberAtEpoch('1 25544U 98067A   17206.18396726 ...');
     * 6766
     */
    export function getRevNumberAtEpoch(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the right ascension of the ascending node in degrees. Essentially, this is the angle of
     * the satellite as it crosses northward (ascending) across the Earth's equator (equatorial plane).
     * See https://en.wikipedia.org/wiki/Right_ascension_of_the_ascending_node
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getRightAscension('1 25544U 98067A   17206.18396726 ...');
     * 208.9163
     */
    export function getRightAscension(tle: TLE, isTLEParsed?: boolean): Degrees;

    /**
     * Determines COSPAR ID (International Designator).
     * See https://en.wikipedia.org/wiki/International_Designator
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getCOSPAR('1 25544U 98067A   17206.18396726 ...');
     * "1998-067A"
     */
    export function getCOSPAR(tle: TLE, isTLEParsed: boolean): string;

    /**
     * Determines the name of a satellite, if present in the first line of a 3-line TLE.  If not found,
     * returns "Unknown" by default (or the COSPAR ID when fallbackToCOSPAR is true).
     *
     * @param tle Input TLE.
     * @param fallbackToCOSPAR If satellite name isn't found, returns COSPAR ID instead of "Unknown".
     * 
     * @example
     * getSatelliteName('1 25544U 98067A   17206.51418 ...');
     * "ISS (ZARYA)"
     */
    export function getSatelliteName(tle: TLE, fallbackToCOSPAR?: boolean): string;

    /**
     * Determines the timestamp of a TLE epoch (the time a TLE was generated).
     *
     * @param tle Input TLE.
     * 
     * @example
     * getEpochTimestamp('1 25544U 98067A   17206.51418 ...');
     * 1500956694771
     */
    export function getEpochTimestamp(tle: TLE): Timestamp;

    /**
     * Determines the average amount of milliseconds in one orbit.
     * 
     * @param tle Input TLE.
     * 
     * @example
     * getAverageOrbitTimeMS('1 25544U 98067A   17206.51418 ...');
     * 5559037
     */
    export function getAverageOrbitTimeMS(tle: TLE): Milliseconds;

    /**
     * Determines the average amount of minutes in one orbit.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getAverageOrbitTimeMins('1 25544U 98067A   17206.51418 ...');
     * 92.65061666666666
     */
    export function getAverageOrbitTimeMins(tle: TLE): Minutes;

    /**
     * Determines the average amount of seconds in one orbit.
     * 
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     * 
     * @example
     * getAverageOrbitTimeS('1 25544U 98067A   17206.51418 ...');
     * 5559.037
     */
    export function getAverageOrbitTimeS(tle: TLE): Seconds;

    /**
     * Converts string and array TLE formats into a parsed TLE in a consistent object format.
     * Accepts 2 and 3-line (with satellite name) TLE variants in string (\n-delimited) and array
     * variants.
     * 
     * @param tle Input TLE.
     */
    export function parseTLE(tle: TLE): ParsedTLE;

    /**
     * Determines if a TLE is structurally valid.
     * 
     * @param tle Input TLE.
     */
    export function isValidTLE(tle: TLE): boolean;

    /**
     * Determines the checksum for a single line of a TLE.
     * Checksum = modulo 10 of sum of all numbers (including line number) + 1 for each negative
     * sign (-).  Everything else is ignored.
     * 
     * @param singleTLELine One line of a TLE.
     * 
     * @example
     * computeChecksum('1 25544U 98067A   17206.51418 ...');
     * 3
     */
    export function computeChecksum(singleTLELine: string): number;

    /**
     * Clears the TLE parse cache, which may be useful for long-running app.s
     */
    export function clearTLEParseCache(): undefined;
}


