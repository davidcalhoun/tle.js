import { parseTLE } from "./parsing";
import {
	bstarDrag,
	catalogNumber1,
	checksum1,
	classification,
	epochDay,
	epochYear,
	firstTimeDerivative,
	intDesignatorLaunchNumber,
	intDesignatorPieceOfLaunch,
	intDesignatorYear,
	lineNumber1,
	orbitModel,
	secondTimeDerivative,
	tleSetNumber
} from "./line-1-definitions";
import { getFromTLE } from "./utils";

export function getFromLine1(tle, definition, isTLEParsed = false) {
	const parsedTLE = isTLEParsed ? tle : parseTLE(tle);

	return getFromTLE(parsedTLE, 1, definition);
}

export function getLineNumber1(rawTLE) {
	return getFromLine1(rawTLE, lineNumber1);
}

export function getCatalogNumber1(rawTLE) {
	return getFromLine1(rawTLE, catalogNumber1);
}

export function getClassification(rawTLE) {
	return getFromLine1(rawTLE, classification);
}

export function getIntDesignatorYear(tle, isTLEParsed) {
	return getFromLine1(tle, intDesignatorYear, isTLEParsed);
}

export function getIntDesignatorLaunchNumber(tle, isTLEParsed) {
	return getFromLine1(tle, intDesignatorLaunchNumber, isTLEParsed);
}

export function getIntDesignatorPieceOfLaunch(tle, isTLEParsed) {
	return getFromLine1(tle, intDesignatorPieceOfLaunch, isTLEParsed);
}

export function getEpochYear(rawTLE) {
	return getFromLine1(rawTLE, epochYear);
}

export function getEpochDay(rawTLE) {
	return getFromLine1(rawTLE, epochDay);
}

export function getFirstTimeDerivative(rawTLE) {
	return getFromLine1(rawTLE, firstTimeDerivative);
}

export function getSecondTimeDerivative(rawTLE) {
	return getFromLine1(rawTLE, secondTimeDerivative);
}

export function getBstarDrag(rawTLE) {
	return getFromLine1(rawTLE, bstarDrag);
}

export function getOrbitModel(rawTLE) {
	return getFromLine1(rawTLE, orbitModel);
}

export function getTleSetNumber(rawTLE) {
	return getFromLine1(rawTLE, tleSetNumber);
}

export function getChecksum1(rawTLE) {
	return getFromLine1(rawTLE, checksum1);
}
