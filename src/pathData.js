var Matrix = require('transformatrix');

var _matrix = new Matrix();

function createPathData(data, matrix) {
	if(!matrix) {
		matrix = _matrix;
	}
	var i, len = data.v.length;
	var pathValue = '';
	var pt;
	for( i = 0; i < len - 1; i += 1) {
		if(i === 0) {
			pt = matrix.transformPoint(data.v[0][0], data.v[0][1]);
			pathValue += 'M' + roundValue(pt[0]) + ' ' + roundValue(pt[1]);
		}
		pt = matrix.transformPoint(data.o[i][0] + data.v[i][0], data.o[i][1] + data.v[i][1]);
		pathValue += ' C' + roundValue(pt[0]) + ',' + roundValue(pt[1]);
		pt = matrix.transformPoint(data.i[i + 1][0] + data.v[i + 1][0], data.i[i + 1][1] + data.v[i + 1][1]);
		pathValue += ' ' + roundValue(pt[0]) + ',' + roundValue(pt[1]);
		pt = matrix.transformPoint(data.v[i + 1][0], data.v[i + 1][1]);
		pathValue += ' ' + roundValue(pt[0]) + ',' + roundValue(pt[1]);
	}
	if(data.c) {
		pt = matrix.transformPoint(data.o[i][0] + data.v[i][0], data.o[i][1] + data.v[i][1]);
		pathValue += ' C' + roundValue(pt[0]) + ',' + roundValue(pt[1]);
		pt = matrix.transformPoint(data.i[0][0] + data.v[0][0], data.i[0][1] + data.v[0][1]);
		pathValue += ' ' + roundValue(pt[0]) + ',' + roundValue(pt[1]);
		pt = matrix.transformPoint(data.v[0][0], data.v[0][1]);
		pathValue += ' ' + roundValue(pt[0]) + ',' + roundValue(pt[1]);
		pathValue += 'z';
	}
	pathValue += ' ';
	return pathValue;
}

function roundValue(val) {
	return Math.round(val*100)/100;
}

module.exports = createPathData;