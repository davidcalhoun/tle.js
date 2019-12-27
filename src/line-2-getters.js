import { parseTLE } from "./parsing";
import {
	catalogNumber2,
	checksum2,
	eccentricity,
	inclination,
	lineNumber2,
	meanAnomaly,
	meanMotion,
	perigee,
	revNumberAtEpoch,
	rightAscension
} from "./line-2-definitions";
import { getFromTLE } from "./utils";

export function getFromLine2(rawTLE, definition) {
	return getFromTLE(parseTLE(rawTLE), 2, definition);
}

export function getLineNumber2(rawTLE) {
	return getFromLine2(rawTLE, lineNumber2);
}

export function getCatalogNumber2(rawTLE) {
	return getFromLine2(rawTLE, catalogNumber2);
}

export function getInclination(rawTLE) {
	return getFromLine2(rawTLE, inclination);
}

export function getRightAscension(rawTLE) {
	return getFromLine2(rawTLE, rightAscension);
}

export function getEccentricity(rawTLE) {
	return getFromLine2(rawTLE, eccentricity);
}

export function getPerigee(rawTLE) {
	return getFromLine2(rawTLE, perigee);
}

export function getMeanAnomaly(rawTLE) {
	return getFromLine2(rawTLE, meanAnomaly);
}

export function getMeanMotion(rawTLE) {
	return getFromLine2(rawTLE, meanMotion);
}

export function getRevNumberAtEpoch(rawTLE) {
	return getFromLine2(rawTLE, revNumberAtEpoch);
}

export function getChecksum2(rawTLE) {
	return getFromLine2(rawTLE, checksum2);
}
