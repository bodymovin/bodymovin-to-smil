var node = require('./node');
var createPathData = require('./pathData');
var rgbHex = require('./helpers/rgbToHex');
var Matrix = require('transformatrix');

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
				x:0,
				y:0
			},
			i:{
				x:1,
				y:1
			}
		},
		{
			t: timeCap
		}
	]
	return createAnimatedProperty(targetName, propertyType, keyframes, timeOffset);
}

function createAnimatedProperty(targetName, propertyType, keyframes, timeOffset) {
	if(keyframes[0].t > 0) {
		var extraKeyframe = JSON.parse(JSON.stringify(keyframes[0]));
		extraKeyframe.e = extraKeyframe.s;
		extraKeyframe.t = 0;
		keyframes.splice(0,0,extraKeyframe);
	}
	var objectAnimator, multiplier;
	var index;
	if(propertyType === 'position') {
		if (keyframes[0].to) {
			objectAnimator = createAnimatorObject(keyframes, 'translate', {type:'combined', interpolationType:'unidimensional', timeOffset: timeOffset}, targetName);
		} else {
			objectAnimator = createAnimatorObject(keyframes, 'translate', {type:'multidimensional', interpolationType:'multidimensional', timeOffset: timeOffset}, targetName);
			//objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateX', {type:'multidimensional', index:0, interpolationType:'unidimensional', timeOffset: timeOffset});
			//objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'translateY', {type:'multidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset});
		}
		
	} else if(propertyType === 'positionX' || propertyType === 'positionY') {
		var propertyName = propertyType === 'positionX' ? 'translateX' : 'translateY';
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyName, {type:'unidimensional', interpolationType:'unidimensional', timeOffset: timeOffset});
		
	} else if(propertyType === '-anchor' || propertyType === 'anchor') {
		var multiplier = propertyType === '-anchor' ? -1 : 1
		objectAnimator = createAnimatorObject(keyframes, 'translate', {type:'multidimensional', interpolationType:'unidimensional', multiplier:multiplier, timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'scale') {
		objectAnimator = createAnimatorObject(keyframes, 'scale', {type:'multidimensional', interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'scaleX' || propertyType === 'scaleY') {
		index = propertyType === 'scaleX' ? 0 : 1;
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'multidimensional', index:index, interpolationType:'multidimensional', multiplier:0.01, timeOffset: timeOffset});
	} else if(propertyType === 'rotate' || propertyType === 'strokeWidth') {
		objectAnimator = createAnimatorObject(keyframes, propertyType, {type:'unidimensional', index:1, interpolationType:'unidimensional', timeOffset: timeOffset}, targetName);
	} else if(propertyType === 'pathData') {
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], 'pathData', {type:'path', interpolationType:'unidimensional', timeOffset: timeOffset});
	} else if(propertyType === 'fillColor' || propertyType === 'strokeColor') {
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'color', interpolationType:'unidimensional', timeOffset: timeOffset});
	} else if(propertyType === 'strokeAlpha' || propertyType === 'fillAlpha' || propertyType === 'trimPathEnd' || propertyType === 'trimPathStart' || propertyType === 'trimPathOffset') {
		multiplier = propertyType === 'trimPathOffset' ? 1/360 : 0.01;
		objectAnimator = createAnimatorObject(keyframes[i - 1], keyframes[i], propertyType, {type:'unidimensional', interpolationType:'unidimensional', multiplier:multiplier, timeOffset: timeOffset});
	}
	return objectAnimator;
}

function createAnimatedPathData(targetName, keyframes, matrix, staticPath, timeOffset) {
	/*
	<animate xlink:href="#p1"
    attributeName="d"
    attributeType="XML"
    from="M 100 100 A 200 400 30 1 0 600 200 a 300 100 45 0 1 -300 200"
        to="M 300 600 A 300 400 -20 1 0 400 200 a 200 600 -50 0 1 100 400"
    dur="10s"
    fill="freeze" />
    */
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

 function createAnimatorObject(keyframes, propertyName, options, targetName) {
 	options.multiplier = options.multiplier || 1;
 	options.timeOffset = options.timeOffset || 0;
 	options.matrix = options.matrix || _matrix.reset();
 	options.staticPath = options.staticPath || '';
 	var totalKeyframes = keyframes.length;
 	var initialValue = keyframes[0];
 	var beforeLastFinalValue = keyframes[totalKeyframes - 2];
 	var finalValue = keyframes[totalKeyframes - 1];
 	var duration = finalValue.t - initialValue.t;
 	var startOffset = initialValue.t + options.timeOffset;
 	if (options.timeOffset + finalValue.t > timeCap || startOffset < 0) {
 		return null;
 	}
 	var attributeName = '';
 	switch(propertyName) {
 		case 'translate':
 		case 'rotate':
 		case 'scale':
 			attributeName = 'transform'
 			break
 		default:
 			attributeName = propertyName
 			break

 	}
 	var attributes = [{
 		key: 'attributeName',
 		value: attributeName
 	},
 	{
 		key: 'dur',
 		value: duration / frameRate + 's'
 	},
 	{
 		key: 'begin',
 		value: startOffset / frameRate  + 's'
 	},
 	{
 		key: 'xlink:href',
 		value: '#' + targetName
 	},
 	{
 		key: 'fill',
 		value: 'freeze'
 	}];
 	if (attributeName === 'd') {
		attributes.push({
	 		key: 'attributeType',
	 		value: 'XML'
	 	})
 	}
 	if (options.type === 'multidimensional') {
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
 		attributes.push({
 			key: 'from',
 			value: initialValue.s * options.multiplier
 		})
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
 	} else if (options.type === 'path') {
 		attributes.push({
 			key: 'from',
 			value: options.staticPath + createPathData(initialValue.s[0], options.matrix)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'to',
	 			value: options.staticPath + createPathData(initialValue.s[0], options.matrix)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'to',
	 			value: options.staticPath + createPathData(initialValue.e[0], options.matrix)
	 		})
 		}
 	} else if (options.type === 'color') {
 		attributes.push({
 			key: 'android:valueFrom',
 			value: rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
 		})
 		if(initialValue.h === 1) {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: rgbHex(initialValue.s[0]*255, initialValue.s[1]*255, initialValue.s[2]*255)
	 		})
 		} else {
	 		attributes.push({
	 			key: 'android:valueTo',
	 			value: rgbHex(initialValue.e[0]*255, initialValue.e[1]*255, initialValue.e[2]*255)
	 		})
 		}
 		attributes.push({
 			key: 'android:valueType',
 			value: 'colorType'
 		})
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
 	if(propertyName === 'scale' || propertyName === 'translate' || propertyName === 'rotate') {
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
 	var keyValues = buildKeyValues(keyframes, options);
	attributes.push({
		key: 'values',
		value: keyValues
	})

 	var keySplines = buildKeySplines(keyframes);
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
 			objectAnimatorNodeName = 'animateTransform';
 			break;
 		default:
 			objectAnimatorNodeName = 'animate';
 			break;
 	}
 	var objectAnimator = node.createNodeWithAttributes(objectAnimatorNodeName, attributes, '');
 	/*if(initialValue.h !== 1) {
	 	var interpolator = buildInterpolator(initialValue, finalValue, options);
	 	node.nestChild(objectAnimator, interpolator);
 	}*/
 	return objectAnimator;
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
			keyValues += (i === len - 1) ? createPathData(keyframes[i-1].e[0], matrix) : createPathData(keyframes[i].s[0], matrix)
		} else {
			keyValues += (i === len - 1) ? keyframes[i-1].e * multiplier : keyframes[i].s * multiplier
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
		keyTimes += (keyframes[i].t - keyframes[0].t)/duration
	}
	return keyTimes;
 }

 function buildKeySplines(keyframes) {
 	var i, len = keyframes.length;
	var keySplines = '';
	var duration = keyframes[len - 1].t - keyframes[0].t; 
	for( i = 0; i < len - 1; i += 1) {
		keySplines += keySplines === '' ? '':';'
		keySplines += keyframes[i].o.x + ' ';
		keySplines += keyframes[i].o.y + ' ';
		keySplines += keyframes[i].i.x + ' ';
		keySplines += keyframes[i].i.y;
	}
 	return keySplines;
 }

function buildInterpolator(initialValue, finalValue, options) {
	if(!initialValue.o){
		return null;
	}
	var attributes = [{
		key: 'name',
		value: 'android:interpolator'
	}];
	var aaptInterpolator =  node.createNodeWithAttributes('aapt:attr', attributes, '');
	var interpolationValue = 'M 0.0,0.0';
	var ox,oy,ix,iy;
	if(options.interpolationType === 'unidimensional') {
		ox = initialValue.o.x;
		oy = initialValue.o.y;
		ix = initialValue.i.x;
		iy = initialValue.i.y;
	} else if(options.interpolationType === 'multidimensional') {
		ox = initialValue.o.x[options.index];
		oy = initialValue.o.y[options.index];
		ix = initialValue.i.x[options.index];
		iy = initialValue.i.y[options.index];

	}
	interpolationValue += ' c' + ox + ',' + oy;
	interpolationValue += ' ' + ix + ',' + iy;
	interpolationValue += ' 1.0,1.0';
	var pathAttributes = [{
		key: 'android:pathData',
		value: interpolationValue
	}]
	var pathInterpolator = node.createNodeWithAttributes('pathInterpolator', pathAttributes, '');
	node.nestChild(aaptInterpolator, pathInterpolator);
	return aaptInterpolator;
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