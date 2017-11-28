var _inPoint = 0, _outPoint = 0, _frameRate = 1

function setTime(inPoint, outPoint, frameRate){
	_inPoint = _inPoint;
	_outPoint = outPoint;
	_frameRate = frameRate;

}

function getDuration(unit){
	switch(unit){
		case 'frames':
		return _outPoint - _inPoint;
		case 's':
		return (_outPoint - _inPoint) / _frameRate;
		case 'ms':
		return 1000 * (_outPoint - _inPoint) / _frameRate;
	}
}

module.exports = {
	setTime: setTime,
	getDuration: getDuration
}