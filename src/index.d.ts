declare module 'tle.js' {
    /**
     * Clears SGP caches to free up memory for long-running apps.
     */
    export function clearCache(): undefined;

    /**
     * Returns the current size of SGP caches.
     */
    export function getCacheSizes(): Array<number>;

    export interface getGroundTracksInput {
        /** Satellite TLE. */
        tle: TLE,
        /**
         * Unix timestamp in milliseconds.
         * @default Current time.
         * */
        startTimeMS?: number,
        /**
         * Time in milliseconds between points in the ground track.
         * @default 1000
         */
        stepMS?: number,
        /**
         * Whether coords are in [lng, lat] format.
         * @default true
         * */
        isLngLatFormat?: boolean
    }

    export type LatitudeDegrees = number;

    export type LongitudeDegrees = number;

    /**
     * Longitude, latitude pair.
     */
    export interface LngLat {
        [index: number]: LatitudeDegrees | LongitudeDegrees;
    }

    /**
     * Longitude, latitude pair in Object format.
     */
    export interface LngLatObject {
        /** Latitude. */
        lat: LatitudeDegrees,
        /** Longitude. */
        lng: LongitudeDegrees
    }

    /**
     * Unix timestamp in milliseconds.
     */
    export type Timestamp = number;

    /**
     * Output of parseTLE().  TLE normalized into a predictable format for fast lookups.
     */
    export interface ParsedTLE {
        /** Satellite name (only extracted from 3-line TLE inputs). */
        name?: string,
        /** Two-line TLE. */
        tle: string[]
    }

    /**
     * TLE input, to be parsed by parseTLE().
     */
    export type TLE = string | string[] | ParsedTLE;

    /**
     * Three ground track arrays (last, current, and next orbit).
     */
    export type ThreeGroundTracks = [LngLat[], LngLat[], LngLat[]];

    /**
     * (Async) Calculates three orbit tracks.
     */
    export function getGroundTracks(input: getGroundTracksInput): Promise<ThreeGroundTracks>;

    /**
     * (Sync) Calculates three orbit tracks.
     */
    export function getGroundTracksSync(input: getGroundTracksInput): ThreeGroundTracks;

    /**
     * Determines the last time the satellite crossed the antemeridian.
     * @param parsedTLE TLE parsed by parseTLE().
     * @param startTime Relative time to determine last crossing.
     */
    export function getLastAntemeridianCrossingTimeMS(parsedTLE: ParsedTLE, startTime: Timestamp): Timestamp;

    /**
     * 
     * @param tle TLE input.
     * @param timestamp Timestamp to get position for.
     */
    export function getLatLngObj(tle: TLE, timestamp?: Timestamp): LngLatObject;

    /**
     * Determines the satellite's position at the time of the TLE epoch (when the TLE was generated).
     * @param tle TLE input.
     */
    export function getLngLatAtEpoch(tle: TLE): LngLat;

    /**
     * Determines the ground track for one orbit, starting at the position of the satellite at startTimeMS and
     * stopping at the antemeridian.
     */
    export interface getOrbitTrackInput {
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
        maxTimeMS?: number,
        /**
         * Whether to output in [lng, lat] format.
         * @default true
         */
        isLngLatFormat?: boolean
    }

    export interface getOrbitTrackInputAsync extends getOrbitTrackInput {
        /**
         * (Experimental) Time to "cool off" between processing chunks.
         * @default 0
         */
        sleepMS?: number,
        /**
         * (Experimental) Satellite positions to calculate in one "chunk" before cooling off.
         * @default 1000
         */
        jobChunkSize?: number
    }

    /**
     * (Async) Generates an array of lng/lat pairs representing a ground track (orbit track), starting
     * from startTimeMS and continuing until just before crossing the antemeridian, which is considered the end
     * of the orbit for convenience.
     *
     * Consider pairing this with getLastAntemeridianCrossingTimeMS() to create a full orbit path (see usage
     * in getGroundTracks()).
     */
    export function getOrbitTrack(input: getOrbitTrackInputAsync): Promise<LngLat[]>;

    /**
     * (Sync) Generates an array of lng/lat pairs representing a ground track (orbit track), starting
     * from startTimeMS and continuing until just before crossing the antemeridian, which is considered the end
     * of the orbit for convenience.
     *
     * Consider pairing this with getLastAntemeridianCrossingTimeMS() to create a full orbit path (see usage
     * in getGroundTracksSync()).
     */
    export function getOrbitTrackSync(input: getOrbitTrackInput): LngLat[];


    export interface getSatBearingOutput {
        degrees: number,
        compass: string
    }

    /**
     * (Experimental) Determines the compass bearing from the perspective of the satellite.
     * Useful for 3D / pitched map perspectives.
     */
    export function getSatBearing(tle: TLE, timeMS?: Timestamp): getSatBearingOutput;

    export interface getSatelliteInfoOutput {
        /** (degrees) Satellite compass heading from observer (0 = north, 180 = south). */
        azimuth: number,
        /** (degrees) Satellite elevation from observer (90 is directly overhead). */
        elevation: number,
        /** (km) Distance from observer to spacecraft. */
        range: number,
        /** (km) Spacecraft altitude. */
        height: number,
        /** (degrees) Spacecraft latitude. */
        lat: LatitudeDegrees,
        /** (degrees) Spacecraft longitude. */
        lng: LongitudeDegrees,
        /** (km/s) Spacecraft velocity. */
        velocity: number
    }

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
         * (km) Ground observer elevation.  Only needed for azimuth, elevation, and range.
         * @default 0.37
         */
        observerHeight?: number): getSatelliteInfoOutput;

    export interface getVisibleSatellitesInput {
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
        observerHeight: number,
        /**
         * Full list of known TLEs.
         * @default []
         */
        tles: TLE[],
        /**
         * (degrees) Filters out satellites that are below this degree threshold (0 is horizon, 90 is straight up).
         * @default 0
         */
        elevationThreshold: number,
        /**
         * Full list of known TLEs.
         * @default Current time.
         */
        timestampMS: Timestamp
    }

    /**
     * Determines which satellites are currently visible, assuming a completely flat horizon.
     */
    export function getVisibleSatellites(input: getVisibleSatellitesInput): getSatelliteInfoOutput[];

    /**
     * BSTAR drag term. This estimates the effects of atmospheric drag on the satellite's motion.
     * See https://en.wikipedia.org/wiki/BSTAR
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getBstarDrag(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Space Catalog Number (aka NORAD Catalog Number).
     * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getCatalogNumber(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Space Catalog Number (aka NORAD Catalog Number) from the first line of the TLE.
     * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getCatalogNumber1(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * TLE line 1 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that
     * letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getChecksum1(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the satellite classification.  For example, an unclassified satellite will return `U`.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getClassification(tle: TLE, isTLEParsed?: boolean): string;

    /**
     * Returns the TLE epoch day of the year (day of year with fractional portion of the day) when the
     * TLE was generated.  For example, a TLE generated on January 1 will return something like
     * `1.18396726`.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getEpochDay(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the TLE epoch year (last two digits) when the TLE was generated.  For example, a TLE
     * generated in 2022 will return `22`.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getEpochYear(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * First Time Derivative of the Mean Motion divided by two, measured in orbits per day per day
     * (orbits/day2). Defines how mean motion changes from day to day, so TLE propagators can still be
     * used to make reasonable guesses when distant from the original TLE epoch.
     * See https://en.wikipedia.org/wiki/Mean_Motion
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getFirstTimeDerivative(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the launch number of the year, which makes up part of the COSPAR id
     * (international designator).  For example, the 50th launch of the year will return "50".
     * See https://en.wikipedia.org/wiki/International_Designator
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getIntDesignatorLaunchNumber(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the piece of the launch, which makes up part of the COSPAR id (international designator).
     * For example, the first piece of the launch will return "A".
     * See https://en.wikipedia.org/wiki/International_Designator
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getIntDesignatorPieceOfLaunch(tle: TLE, isTLEParsed?: boolean): string;

    /**
     * Returns the launch year (last two digits), which makes up part of the COSPAR id
     * (international designator).  For example, a satellite launched in 1999 will return "99".
     * See https://en.wikipedia.org/wiki/International_Designator
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getIntDesignatorYear(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the line number from line 1.  Should always return "1" for valid TLEs.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getLineNumber1(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Private value - used by Air Force Space Command to reference the orbit model used to generate the
     * TLE (e.g. SGP, SGP4).  Distributed TLES will always return 0 for this value.  Note that all
     * distributed TLEs are generated with SGP4/SDP4.
     * See https://celestrak.com/columns/v04n03/
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getOrbitModel(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Second Time Derivative of Mean Motion divided by six, measured in orbits per day per day per day
     * (orbits/day3). Similar to the first time derivative, it measures rate of change in the Mean
     * Motion Dot so software can make reasonable guesses when distant from the original TLE epoch.
     * See https://en.wikipedia.org/wiki/Mean_Motion and http://castor2.ca/03_Mechanics/03_TLE/Mean_Mot_Dot.html
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getSecondTimeDerivative(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * TLE element set number, incremented for each new TLE generated since launch. 999 seems to mean
     * the TLE has maxed out.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getTleSetNumber(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Space Catalog Number (aka NORAD Catalog Number) from the second line of the TLE.
     * See https://en.wikipedia.org/wiki/Satellite_Catalog_Number
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getCatalogNumber2(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * TLE line 2 checksum (modulo 10), for verifying the integrity of this line of the TLE. Note that
     * letters, blanks, periods, and plus signs are counted as 0, while minus signs are counted as 1.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getChecksum2(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the orbital eccentricity. All artificial Earth satellites have an eccentricity between 0
     * (perfect circle) and 1 (parabolic orbit).
     * See https://en.wikipedia.org/wiki/Orbital_eccentricity
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getEccentricity(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the inclination relative to the Earth's equatorial plane in degrees. 0 to 90 degrees is a
     * prograde orbit and 90 to 180 degrees is a retrograde orbit.
     * See https://en.wikipedia.org/wiki/Orbital_inclination
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getInclination(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the line number from line 2.  Should always return "2" for valid TLEs.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getLineNumber2(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the Mean Anomaly. Indicates where the satellite was located within its orbit at the time
     * of the TLE epoch.
     * See https://en.wikipedia.org/wiki/Mean_Anomaly
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getMeanAnomaly(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the revolutions around the Earth per day (mean motion).
     * See https://en.wikipedia.org/wiki/Mean_Motion
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getMeanMotion(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the argument of perigee.
     * See https://en.wikipedia.org/wiki/Argument_of_perigee
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getPerigee(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the total satellite revolutions when this TLE was generated. This number seems to roll
     * over (e.g. 99999 -> 0).
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getRevNumberAtEpoch(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Returns the right ascension of the ascending node in degrees. Essentially, this is the angle of
     * the satellite as it crosses northward (ascending) across the Earth's equator (equatorial plane).
     * See https://en.wikipedia.org/wiki/Right_ascension_of_the_ascending_node
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getRightAscension(tle: TLE, isTLEParsed?: boolean): number;

    /**
     * Determines COSPAR ID (International Designator).
     * See https://en.wikipedia.org/wiki/International_Designator
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getCOSPAR(tle: TLE, isTLEParsed: boolean): string;

    /**
     * Determines the name of a satellite, if present in the first line of a 3-line TLE.  If not found,
     * returns "Unknown" by default, or the COSPAR id when fallbackToCOSPAR is true.
     *
     * @param tle Input TLE.
     * @param fallbackToCOSPAR Returns COSPAR id when satellite name isn't found. @default false
     * @example
     * getSatelliteName('1 25544U 98067A   17206.51418 ...');
     * -> 'ISS (ZARYA)'
     */
    export function getSatelliteName(tle: TLE, fallbackToCOSPAR?: boolean): string;

    /**
     * Determines the timestamp of a TLE epoch (the time a TLE was generated).
     *
     * @param tle Input TLE.
     * @example
     * getEpochTimestamp('1 25544U 98067A   17206.51418 ...');
     * -> 1500956694771
     */
    export function getEpochTimestamp(): Timestamp;

    /**
     * Determines the average amount of milliseconds in one orbit.
     * @param tle Input TLE.
     */
    export function getAverageOrbitTimeMS(tle: TLE): number;

    /**
     * Determines the average amount of minutes in one orbit.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getAverageOrbitTimeMins(tle: TLE): number;

    /**
     * Determines the average amount of seconds in one orbit.
     * @param tle Input TLE.
     * @param isTLEParsed Bypasses TLE parsing when true.
     */
    export function getAverageOrbitTimeS(tle: TLE): number;







    /**
     * Converts string and array TLE formats into a parsed TLE in a consistent object format.
     * Accepts 2 and 3-line (with satellite name) TLE variants in string (\n-delimited) and array
     * variants.
     * @param tle Input TLE.
     */
    export function parseTLE(tle: TLE): ParsedTLE;

    /**
     * Determines if a TLE is structurally valid.
     * @param tle Input TLE.
     */
    export function isValidTLE(tle: TLE): boolean;

    /**
     * Determines the checksum for a single line of a TLE.
     *
     * Checksum = modulo 10 of sum of all numbers (including line number) + 1 for each negative
     * sign (-).  Everything else is ignored.
     * @param tleLine Single line of a TLE.
     */
    export function computeChecksum(tleLin: string): number;

    /**
     * Clears the TLE parse cache, which may be useful for long-running app.s
     */
    export function clearTLEParseCache(): undefined;
}


