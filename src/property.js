var node = require('./node');
var createPathData = require('./pathData');
var rgbHex = require('./helpers/rgbToHex');
var Matrix = require('transformatrix');
var timing = require('./helpers/timing');

var _matrix = new Matrix();
var frameRate = 0;
var timeCap = Number.MAX_SAFE_INTEGER;

function createAnimatedPropertyFromStaticValue(targetName, propertyType, property, timeOffset) {
	var keyframes = [
		{
			s: property,
			e: property,
			t: 0,
			o:{
			},
			i:{
			}
		},
		{
			t: timeCap
		}
	]
	keyframes[0].o.x = propertyType === 'scale' ? [0,0] : 0
	keyframes[0].o.y = propertyType === 'scale' ? [0,0] : 0
	keyframes[0].i.x = propertyType === 'scale' ? [1,1] : 1
	keyframes[0].i.y = propertyType === 'scale' ? [1,1] : 1
	return createAnimatedProperty(targetName, propertyType, keyframes, timeOffset);
}

function createAnimatedProperty(targetName, propertyType, keyframes, timeOffset) {
	if(keyframes[0].t > 0) {
		var extraKeyframe = JSON.parse(JSON.stringify(keyframes[0]));
		extraKeyframe.e = extraKeyframe.s;
		extraKeyframe.t = 0;
		if(extraKeyframe.to){
			extraKeyframe.to = [0,0];
			extraKeyframe.ti = [0,0];
		}
		keyframes.splice(0,0,extraKeyframe);
	}
	var objectAnimator, multiplier;
	var index, multiplier, interpolationType, propertyName;
	if(propertyType === 'position' || propertyType === '-position') {
		if (keyframes[0].to && propertyType === 'position') {
			objectAnimator = createAnimatorObject(keyframes, 'translate', {type:'combined', interpolationType:'unidimensional', timeOffset: timeOffset}, targetName);
		} else {
			multiplier = propertyType === '-position' ? -0.5 : 1;
			interpolationType = propertyType === '-position' ? 'multidimensional' : 'multidimensional';
			objectAnimator = createAnimatorObject(keyframes, 'translate', {type:'multidimensional', interpolationType: interpolationType, multiplier:multiplier, timeOffset: timeOffset}, targetName);
			//objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', timeOffset: timeOffset});
			//objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset});
		}
		
	} else if(propertyType === 'positionX' || propertyType === 'positionY') {
		propertyName = propertyType === 'positionX' ? 'translateX' : 'translateY';
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyName, {type:'unidimensional', interpolationType:'unidimensional', timeOffset: timeOffset});
		
	} else if(propertyType === '-anchor' || propertyType === 'anchor') {
		multiplier = propertyType === '-anchor' ? -1 : 1;
		objectAnimator = createAnimatorObject(keyframes, 'translate', {type:'multidimensional', interpolationType:'unidimensional', multiplier:multiplier, timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'scale') {
		objectAnimator = createAnimatorObject(keyframes, 'scale', {type:'multidimensional', interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'scaleX' || propertyType === 'scaleY') {
		index = propertyType === 'scaleX' ? 0 : 1;
		objectAnimator = createAnimatorObject(keyframes, propertyType, {type:'multidimensional', index:index, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset});
	} else if(propertyType === 'rotate' || propertyType === 'strokeWidth') {
		objectAnimator = createAnimatorObject(keyframes, propertyType, {type:'unidimensional', interpolationType:'unidimensional', timeOffset: timeOffset}, targetName);
	}else if(propertyType === 'fillColor' || propertyType === 'strokeColor') {
		objectAnimator = createAnimatorObject(keyframes, propertyType, {type:'color', interpolationType:'unidimensional', timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'strokeAlpha' || propertyType === 'fillAlpha' || propertyType === 'trimPathEnd' || propertyType === 'trimPathStart' || propertyType === 'trimPathOffset' || propertyType === 'opacity' || propertyType === 'rx' || propertyType === 'ry') {
		switch(propertyType) {
			case 'trimPathOffset':
				multiplier = 1/360;
				break;
			case 'rx':
			case 'ry':
				multiplier = 1;
				break;
			default:
				multiplier = 0.01;
				break;
		}
		objectAnimator = createAnimatorObject(keyframes, propertyType, {type:'unidimensional', interpolationType:'unidimensional', multiplier:multiplier, timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'rectPositionX' || propertyType === 'ellipsePositionX') {
		propertyName = propertyType === 'rectPositionX' ? 'x' : 'cx';
		objectAnimator = createAnimatorObject(keyframes, propertyName, {type:'unidimensional', interpolationType:'unidimensional', timeOffset: timeOffset, index:0}, targetName);
	} else if(propertyType === 'rectPositionY' || propertyType === 'ellipsePositionY') {
		propertyName = propertyType === 'rectPositionY' ? 'y' : 'cy';
		objectAnimator = createAnimatorObject(keyframes, propertyName, {type:'unidimensional', interpolationType:'unidimensional', timeOffset: timeOffset, index:1}, targetName);
	} else if(propertyType === 'rectWidth' || propertyType === 'ellipseWidth') {
		propertyName = propertyType === 'rectWidth' ? 'width' : 'rx';
		objectAnimator = createAnimatorObject(keyframes, propertyName, {type:'unidimensional', interpolationType:'multidimensional', timeOffset: timeOffset, index:0}, targetName);
	} else if(propertyType === 'rectHeight' || propertyType === 'ellipseHeight') {
		propertyName = propertyType === 'rectHeight' ? 'height' : 'ry';
		objectAnimator = createAnimatorObject(keyframes, propertyName, {type:'unidimensional', interpolationType:'multidimensional', timeOffset: timeOffset, index:1}, targetName);
	}
	return objectAnimator;
}

function createAnimatedPathData(targetName, keyframes, matrix, staticPath, timeOffset) {
	var objectAnimator = createAnimatorObject(keyframes, 'd', {type:'path', interpolationType:'unidimensional', timeOffset: timeOffset, matrix: matrix, staticPath: staticPath}, targetName);
	return objectAnimator;
}

function createSetNode() {
	var attributes = [{
		key: 'android:ordering',
		value: 'together'
	}];
	return node.createNodeWithAttributes('set', attributes, '');
}

function createAAPTAnimation() {
	var attributes = [{
		key: 'name',
		value: 'android:animation'
	}];
	return node.createNodeWithAttributes('aapt:attr', attributes, '');
}

function createTargetNode(nodeName) {
 	var attributes = [{
 		key: 'id',
 		value: nodeName
 	}];
 	return node.createNodeWithAttributes('target', attributes, '');
}

function resetMotionPath(keyframe) {
	keyframe.to = [0,0];
	keyframe.ti = [0,0];
}

function createControlPoints(keyframe, interpolationType) {
	if(interpolationType === 'multidimensional') {
		keyframe.o = {
			x:[0,0],
			y:[0,0]
		}
		keyframe.i = {
			x:[0,0],
			y:[0,0]
		}
	} else {
		keyframe.o = {
			x:0,
			y:0
		}
		keyframe.i = {
			x:0,
			y:0
		}
	}
}

function formatKeyframes(keyframes, options) {
	var animationDurationInFrames = timing.getDuration('frames');
	if(options.timeOffset) {
		var i, len = keyframes.length;
		for(i=0;i<len;i+=1){
			keyframes[i].t += options.timeOffset;
		}
	}
	var initialValue = keyframes[0];
	var hasMotionPath = !!keyframes[0].to;
	var finalValue, beforeLastFinalValue;
	//Removing keyframes previous to the zero value.
	//Check if it's better to set a negative begin time.
	while(initialValue && initialValue.t < 0){
		if((keyframes[1] && keyframes[1].t > 0) || keyframes.length === 2) {
			initialValue.t = 0;
			break;
		} else {
			keyframes.shift();
			initialValue = keyframes[0];
		}
	}
	if(!keyframes.length) {
		return keyframes;
	}
	//Correcting animations that have all keyframes before start of the animation
	i = keyframes.length - 1;
	while (i >= 0) {
		if (i > 0 && keyframes[i].t < keyframes[i - 1].t) {
			keyframes[i].t = keyframes[i - 1].t
		}
		i -= 1;
	}

	//Adding a keyframe at zero position.
	if(initialValue.t > 0) {
		var zeroKeyframe = JSON.parse(JSON.stringify(initialValue));
		zeroKeyframe.t = 0;
		if(hasMotionPath) {
			resetMotionPath(zeroKeyframe);
		}
		keyframes.splice(0,0,zeroKeyframe);
	}
	var totalKeyframes = keyframes.length;
	finalValue = keyframes[totalKeyframes - 1];
	while(finalValue.t > animationDurationInFrames) {
		keyframes.pop();
		totalKeyframes -= 1;
		finalValue = keyframes[totalKeyframes - 1];
	}
	beforeLastFinalValue = keyframes[totalKeyframes - 2];
	finalValue.s = beforeLastFinalValue.h === 1 ? beforeLastFinalValue.s : beforeLastFinalValue.e;
	finalValue.e = finalValue.s;
	if(hasMotionPath) {
		resetMotionPath(finalValue);
	}
	createControlPoints(finalValue, options.interpolationType)
	if(finalValue.t < animationDurationInFrames) {
 		var newKeyframe = JSON.parse(JSON.stringify(finalValue));
 		newKeyframe.t = animationDurationInFrames;
 		keyframes.push(newKeyframe);
 	}
	return keyframes;
}

 function createAnimatorObject(keyframes, propertyName, options, targetName) {
 	var animationDurationInFrames = timing.getDuration('frames');

 	options.multiplier = options.multiplier || 1;
 	options.timeOffset = options.timeOffset || 0;
 	options.matrix = options.matrix || _matrix.reset();
 	options.staticPath = options.staticPath || '';
 	keyframes = formatKeyframes(keyframes, options);
 	if(!keyframes.length) {
 		return {};
 	}
 	var totalKeyframes = keyframes.length;
 	var initialValue = keyframes[0];
 	var beforeLastFinalValue = keyframes[totalKeyframes - 2];
 	var finalValue = keyframes[totalKeyframes - 1];
 	var duration = finalValue.t - initialValue.t;


 	var startOffset = initialValue.t + options.timeOffset;
 	var hasMotionPath = keyframes[0].to && options.type === 'combined';
 	var attributeName = '';
 	switch(propertyName) {
 		case 'translate':
 		case 'rotate':
 		case 'scale':
 			attributeName = 'transform'
 			break
 		case 'fillColor':
 			attributeName = 'fill'
 			break
 		case 'fillAlpha':
 			attributeName = 'fill-opacity'
 			break
 		case 'strokeColor':
 			attributeName = 'stroke'
 			break
 		case 'strokeAlpha':
 			attributeName = 'stroke-opacity'
 			break
 		case 'strokeWidth':
 			attributeName = 'stroke-width'
 			break
 		default:
 			attributeName = propertyName
 			break

 	}
 	var attributes = [
 	{
 		key: 'repeatCount',
 		value: 'indefinite'
 	},
 	{
 		key: 'dur',
 		value: animationDurationInFrames / frameRate + 's'
 	},
 	{
 		key: 'begin',
 		value: '0s'
 	},
 	{
 		key: 'xlink:href',
 		value: '#' + targetName
 	},
 	{
 		key: 'fill',
 		value: 'freeze'
 	}];
 	if(!hasMotionPath) {
		attributes.push({
	 		key: 'attributeName',
	 		value: attributeName
	 	})
 	}
 	if (attributeName === 'd' || attributeName === 'width' || attributeName === 'height') {
		attributes.push({
	 		key: 'attributeType',
	 		value: 'XML'
	 	})
 	}

 	if(hasMotionPath) {

 	} else if (options.type === 'multidimensional') {
 		attributes.push({
 			key: 'from',
 			value: initialValue.s[0] * options.multiplier + ' ' + initialValue.s[1] * options.multiplier
 		})

 		if(beforeLastFinalValue.h === 1) {
	 		attributes.push({
	 			key: 'to',
	 			value: beforeLastFinalValue.s[0] * options.multiplier + ' ' + beforeLastFinalValue.s[1] * options.multiplier
	 		})
 		} else {
	 		attributes.push({
	 			key: 'to',
	 			value: beforeLastFinalValue.e[0] * options.multiplier + ' ' + beforeLastFinalValue.e[1] * options.multiplier
	 		})
 		}
 	} else if (options.type === 'unidimensional') {
 		if(options.index !== undefined) {
			attributes.push({
	 			key: 'from',
	 			value: initialValue.s[options.index] * options.multiplier
	 		})
 		} else {
 			attributes.push({
	 			key: 'from',
	 			value: initialValue.s * options.multiplier
	 		})
 		}
 		
 		if(options.index !== undefined) {
 			if(beforeLastFinalValue.h === 1) {
				attributes.push({
		 			key: 'to',
		 			value: beforeLastFinalValue.s[options.index] * options.multiplier
		 		})
			} else {
				attributes.push({
		 			key: 'to',
		 			value: beforeLastFinalValue.e[options.index] * options.multiplier
		 		})
			}
 		} else {
 			if(initialValue.h === 1) {
		 		attributes.push({
		 			key: 'to',
		 			value: beforeLastFinalValue.s * options.multiplier
		 		})
	 		} else {
		 		attributes.push({
		 			key: 'to',
		 			value: beforeLastFinalValue.e * options.multiplier
		 		})
	 		}
 		}
 		
 	} else if (options.type === 'path') {
 		attributes.push({
 			key: 'from',
 			value: options.staticPath + createPathData(initialValue.s[0], options.matrix)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'to',
	 			value: options.staticPath + createPathData(beforeLastFinalValue.s[0], options.matrix)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'to',
	 			value: options.staticPath + createPathData(beforeLastFinalValue.e[0], options.matrix)
	 		})
 		}
 	} else if (options.type === 'color') {
 		attributes.push({
 			key: 'from',
 			value: rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'to',
	 			value: rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'to',
	 			value: rgbHex(initialValue.e[0]*255, initialValue.e[1]*255, initialValue.e[2]*255)
	 		})
 		}
 	} else if (options.type === 'combined') {
 		attributes.push({
 			key: 'from',
 			value: initialValue.s[0] + ' ' + initialValue.s[1]
 		})
 		attributes.push({
 			key: 'to',
 			value: keyframes[totalKeyframes - 2].e[0] + ' ' + keyframes[totalKeyframes - 2].e[1]
 		})
 		/*var pathValue = 'M ' + initialValue.s[0] + ',' + initialValue.s[1];
 		pathValue += 'C ' + (initialValue.s[0] + initialValue.to[0]) + ',' + (initialValue.s[1]  + initialValue.to[1]);
 		pathValue += ' ' + (initialValue.e[0] + initialValue.ti[0]) + ',' + (initialValue.e[1]  + initialValue.ti[1]);
 		pathValue += ' ' + (initialValue.e[0]) + ',' + (initialValue.e[1]);
 		attributes.push({
 			key: 'android:pathData',
 			value: pathValue
 		})*/
 	}

 	if(!hasMotionPath && (propertyName === 'scale' || propertyName === 'translate' || propertyName === 'rotate')) {
 		attributes.push({
 			key: 'type',
 			value: propertyName
 		})
		attributes.push({
			key: 'additive',
			value: 'sum'
		})
 	}
 	var keyTimes = buildKeyTimes(keyframes);
	attributes.push({
		key: 'keyTimes',
		value: keyTimes
	})
	if(hasMotionPath) {
	 	var pathData = buildPath(keyframes);
		attributes.push({
			key: 'path',
			value: createPathData(pathData)
		})
	 	var keyPoints = buildKeyPoints(keyframes, pathData);
		attributes.push({
			key: 'keyPoints',
			value: keyPoints
		})
	} else {
	 	var keyValues = buildKeyValues(keyframes, options);
		attributes.push({
			key: 'values',
			value: keyValues
		})
	}

 	var keySplines = buildKeySplines(keyframes, options);
	attributes.push({
		key: 'keySplines',
		value: keySplines
	})
	attributes.push({
		key: 'calcMode',
		value: 'spline'
	})
 	var objectAnimatorNodeName = '';
 	switch(propertyName) {
 		case 'translate':
 		case 'scale':
 		case 'rotate':
 			objectAnimatorNodeName = hasMotionPath ? 'animateMotion' : 'animateTransform';
 			break;
 		default:
 			objectAnimatorNodeName = 'animate';
 			break;
 	}
 	var objectAnimator = node.createNodeWithAttributes(objectAnimatorNodeName, attributes, '');
 	return objectAnimator;
 }

 function buildPath(keyframes) {
 	var i, len = keyframes.length;
 	var pathDataArr = {
 		i:[],
 		v:[],
 		o:[],
 		c: false
 	}
 	for(i = 0;i < len - 1;i += 1) {
 		pathDataArr.v[i] = [keyframes[i].s[0],keyframes[i].s[1]];
 		pathDataArr.v[i+1] = [keyframes[i].e[0],keyframes[i].e[1]];
 		pathDataArr.o[i] = [keyframes[i].to[0],keyframes[i].to[1]];
 		pathDataArr.i[i+1] = [keyframes[i].ti[0],keyframes[i].ti[1]];
 	}
	pathDataArr.o[keyframes.length-1] = [0,0];
	pathDataArr.i[0] = [0,0];

 	return pathDataArr;

 }

 function buildKeyPoints(keyframes, pathData) {
 	var totalLength = 0;
 	var lengths = [];
 	var i, len = keyframes.length;
 	var totalLength = 0;
 	var pathLength;
 	for(i = 0; i < len - 1; i += 1) {
 		pathLength = getCurveLength(pathData.v[i], pathData.v[i+1], pathData.o[i], pathData.i[i + 1]);
 		lengths.push(pathLength)
 		totalLength += pathLength;
 	}
 	var keyPoints = '0', len = lengths.length;
 	var accumulatedLength = 0;
 	for(i = 0; i < len - 1; i += 1) {
 		accumulatedLength += lengths[i];
 		keyPoints += ';';
 		keyPoints += Math.round(100*accumulatedLength/totalLength)/100;
 	}
 	keyPoints += ';1';
 	return keyPoints; 
 }

 function getCurveLength(initPos, endPos, outBezier, inBezier) {
    var k, curveSegments = 200, point, lastPoint = null, ptDistance, absToCoord, absTiCoord, triCoord1, triCoord2, triCoord3, liCoord1, liCoord2, ptCoord, perc, addedLength = 0, i, len;
    for (k = 0; k < curveSegments; k += 1) {
        point = [];
        perc = k / (curveSegments - 1);
        ptDistance = 0;
        absToCoord = [];
        absTiCoord = [];
        len = outBezier.length;
        for (i = 0; i < len; i += 1) {
            if (absToCoord[i] === null || absToCoord[i] === undefined) {
                absToCoord[i] = initPos[i] + outBezier[i];
                absTiCoord[i] = endPos[i] + inBezier[i];
            }
            triCoord1 = initPos[i] + (absToCoord[i] - initPos[i]) * perc;
            triCoord2 = absToCoord[i] + (absTiCoord[i] - absToCoord[i]) * perc;
            triCoord3 = absTiCoord[i] + (endPos[i] - absTiCoord[i]) * perc;
            liCoord1 = triCoord1 + (triCoord2 - triCoord1) * perc;
            liCoord2 = triCoord2 + (triCoord3 - triCoord2) * perc;
            ptCoord = liCoord1 + (liCoord2 - liCoord1) * perc;
            point.push(ptCoord);
            if (lastPoint !== null) {
                ptDistance += Math.pow(point[i] - lastPoint[i], 2);
            }
        }
        ptDistance = Math.sqrt(ptDistance);
        addedLength += ptDistance;
        lastPoint = point;
    }
    return addedLength;
}

 function buildKeyValues(keyframes, options) {
 	var multiplier = options.multiplier
 	var dimensions = options.type
	var i, len = keyframes.length;
	var keyValues = '';
	for( i = 0; i < len; i += 1) {
		keyValues += keyValues === '' ? '':';'
		if(dimensions === 'multidimensional' || dimensions === 'combined') {
			keyValues += (i === len - 1) ? keyframes[i-1].e[0] * multiplier + ' ' + keyframes[i-1].e[1] * multiplier : keyframes[i].s[0] * multiplier + ' ' + keyframes[i].s[1] * multiplier
		} else if (dimensions === 'path') {
			var staticPath = options.staticPath
			var matrix = options.matrix
			keyValues += staticPath
			keyValues += (i === len - 1 && keyframes[i-1].h !== 1) ? createPathData(keyframes[i-1].e[0], matrix) : createPathData(keyframes[i].s[0], matrix)
		} else if (dimensions === 'color') {
			keyValues += (i === len - 1) ? rgbHex(keyframes[i-1].e[0]*255, keyframes[i-1].e[1]*255, keyframes[i-1].e[2]*255) : rgbHex(keyframes[i].s[0]*255, keyframes[i].s[1]*255, keyframes[i].s[2]*255)
		} else {
			if(options.index !== undefined) {
				keyValues += (i === len - 1) ? keyframes[i-1].e[options.index] * multiplier : keyframes[i].s[options.index] * multiplier
			} else {
				keyValues += (i === len - 1) ? keyframes[i-1].e * multiplier : keyframes[i].s * multiplier
			}
		}
	}
	return keyValues;
 }

 function buildKeyTimes(keyframes) {
	var i, len = keyframes.length;
	var keyTimes = '';
	var duration = keyframes[len - 1].t - keyframes[0].t; 
	for( i = 0; i < len; i += 1) {
		keyTimes += keyTimes === '' ? '':';'
		keyTimes += Math.round(10000000*(keyframes[i].t - keyframes[0].t)/duration)/10000000;
	}
	return keyTimes;
 }

 function buildKeySplines(keyframes, options) {
 	var i, len = keyframes.length;
	var keySplines = '';
 	var interpolationType = options.interpolationType;
	for( i = 0; i < len - 1; i += 1) {
		keySplines += keySplines === '' ? '':';'
		if(keyframes[i].h === 1) {
			keySplines += '0 0 1 1';
		} else if(interpolationType === 'multidimensional') {
			keySplines += keyframes[i].o.x[0] + ' ';
			keySplines += keyframes[i].o.y[0] + ' ';
			keySplines += keyframes[i].i.x[0] + ' ';
			keySplines += keyframes[i].i.y[0];
		} else {
			keySplines += keyframes[i].o.x + ' ';
			keySplines += keyframes[i].o.y + ' ';
			keySplines += keyframes[i].i.x + ' ';
			keySplines += keyframes[i].i.y;
		}
	}
 	return keySplines;
 }

function setFrameRate(_frameRate) {
	frameRate = _frameRate;
}

function setTimeCap(_timeCap) {
	timeCap = _timeCap;
}

function getTimeCap() {
	return timeCap;
}

 module.exports = {
 	createAnimatedProperty: createAnimatedProperty,
 	createAnimatedPropertyFromStaticValue: createAnimatedPropertyFromStaticValue,
 	createAnimatedPathData: createAnimatedPathData,
 	createAnimatorObject: createAnimatorObject,
 	createAAPTAnimation: createAAPTAnimation,
 	createTargetNode: createTargetNode,
 	createSetNode: createSetNode,
 	setFrameRate: setFrameRate,
 	setTimeCap: setTimeCap,
 	getTimeCap: getTimeCap
 }