var satellite = require('satellite.js');
var tle = require('tle');

describe('tle.js', function(){
	var tleStr = 'SKYSAT-1\n1 39418U 13066C   15315.88761506  .00001284  00000-0  11388-3 0  9996\n2 39418  97.7465  34.0691 0022914  81.1424 279.2394 14.97768562107746';
	var tleArr = tle.split('\n');

	beforeEach(function(){

	});

	describe('getEccentricity', function(){
		console.log(typeof tle)
	});
});