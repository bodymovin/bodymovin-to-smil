var node = require ('../../node');
var property = require ('../../property');
var targets = require ('../../targets/targets');
var createTransformGroup = require ('../../helpers/transform/createTransformGroup');
var rgbHex = require('../../helpers/rgbToHex');
var Matrix = require('transformatrix');
var createPathData = require('../../pathData');
var naming = require('../../naming');

var matrix = new Matrix();
var degToRads = Math.PI/180;
var roundCorner = 0.5519;

function convertEllipseToPath(ellipseData) {
	if(ellipseData.s.a !== 0 || ellipseData.p.a !== 0) {
		return null;
	}
	var p0 = ellipseData.p.k[0], p1 = ellipseData.p.k[1], s0 = ellipseData.s.k[0]/2, s1 = ellipseData.s.k[1]/2;
	var vPoints = [[0,0],[0,0],[0,0],[0,0]];
	var oPoints = [[0,0],[0,0],[0,0],[0,0]];
	var iPoints = [[0,0],[0,0],[0,0],[0,0]];
    if(ellipseData.d !== 3){
        vPoints[0][0] = p0;
        vPoints[0][1] = p1-s1;
        vPoints[1][0] = p0 + s0;
        vPoints[1][1] = p1;
        vPoints[2][0] = p0;
        vPoints[2][1] = p1+s1;
        vPoints[3][0] = p0 - s0;
        vPoints[3][1] = p1;
        iPoints[0][0] = p0 - s0*roundCorner - vPoints[0][0];
        iPoints[0][1] = p1 - s1 - vPoints[0][1];
        iPoints[1][0] = p0 + s0 - vPoints[1][0];
        iPoints[1][1] = p1 - s1*roundCorner - vPoints[1][1];
        iPoints[2][0] = p0 + s0*roundCorner - vPoints[2][0];
        iPoints[2][1] = p1 + s1 - vPoints[2][1];
        iPoints[3][0] = p0 - s0 - vPoints[3][0];
        iPoints[3][1] = p1 + s1*roundCorner - vPoints[3][1];
        oPoints[0][0] = p0 + s0*roundCorner - vPoints[0][0];
        oPoints[0][1] = p1 - s1 - vPoints[0][1];
        oPoints[1][0] = p0 + s0 - vPoints[1][0];
        oPoints[1][1] = p1 + s1*roundCorner - vPoints[1][1];
        oPoints[2][0] = p0 - s0*roundCorner - vPoints[2][0];
        oPoints[2][1] = p1 + s1 - vPoints[2][1];
        oPoints[3][0] = p0 - s0 - vPoints[3][0];
        oPoints[3][1] = p1 - s1*roundCorner - vPoints[3][1];
    }else{
        vPoints[0][0] = p0;
        vPoints[0][1] = p1-s1;
        vPoints[1][0] = p0 - s0;
        vPoints[1][1] = p1;
        vPoints[2][0] = p0;
        vPoints[2][1] = p1+s1;
        vPoints[3][0] = p0 + s0;
        vPoints[3][1] = p1;
        iPoints[0][0] = p0 + s0*cPoint - vPoints[0][0];
        iPoints[0][1] = p1 - s1 - vPoints[0][1];
        iPoints[1][0] = p0 - s0 - vPoints[1][0];
        iPoints[1][1] = p1 - s1*cPoint - vPoints[1][1];
        iPoints[2][0] = p0 - s0*cPoint - vPoints[2][0];
        iPoints[2][1] = p1 + s1 - vPoints[2][1];
        iPoints[3][0] = p0 + s0 - vPoints[3][0];
        iPoints[3][1] = p1 + s1*cPoint - vPoints[3][1];
        oPoints[0][0] = p0 - s0*cPoint - vPoints[0][0];
        oPoints[0][1] = p1 - s1 - vPoints[0][1];
        oPoints[1][0] = p0 - s0 - vPoints[1][0];
        oPoints[1][1] = p1 + s1*cPoint - vPoints[1][1];
        oPoints[2][0] = p0 + s0*cPoint - vPoints[2][0];
        oPoints[2][1] = p1 + s1 - vPoints[2][1];
        oPoints[3][0] = p0 + s0 - vPoints[3][0];
        oPoints[3][1] = p1 - s1*cPoint - vPoints[3][1];
    }
	var pathObject = {
		ks: {
			a:0,
			k: {
				i:iPoints,
				v:vPoints,
				o:oPoints,
				c: true
			}
		}
	}
	return pathObject;
}

function convertRectangleToPath(rectangleData) {
	if(rectangleData.s.a !== 0 || rectangleData.p.a !== 0 || rectangleData.r.a !== 0) {
		return null;
	}


	/*var p0 = this.p.v[0], p1 = this.p.v[1], v0 = this.s.v[0]/2, v1 = this.s.v[1]/2;
    var round = bm_min(v0,v1,this.r.v);
    var cPoint = round*(1-roundCorner);
    this.v._length = 0;

    if(this.d === 2 || this.d === 1) {
        this.v.setTripleAt(p0+v0, p1-v1+round,p0+v0, p1-v1+round,p0+v0,p1-v1+cPoint,0, true);
        this.v.setTripleAt(p0+v0, p1+v1-round,p0+v0, p1+v1-cPoint,p0+v0, p1+v1-round,1, true);
        if(round!== 0){
            this.v.setTripleAt(p0+v0-round, p1+v1,p0+v0-round,p1+v1,p0+v0-cPoint,p1+v1,2, true);
            this.v.setTripleAt(p0-v0+round,p1+v1,p0-v0+cPoint,p1+v1,p0-v0+round,p1+v1,3, true);
            this.v.setTripleAt(p0-v0,p1+v1-round,p0-v0,p1+v1-round,p0-v0,p1+v1-cPoint,4, true);
            this.v.setTripleAt(p0-v0,p1-v1+round,p0-v0,p1-v1+cPoint,p0-v0,p1-v1+round,5, true);
            this.v.setTripleAt(p0-v0+round,p1-v1,p0-v0+round,p1-v1,p0-v0+cPoint,p1-v1,6, true);
            this.v.setTripleAt(p0+v0-round,p1-v1,p0+v0-cPoint,p1-v1,p0+v0-round,p1-v1,7, true);
        } else {
            this.v.setTripleAt(p0-v0,p1+v1,p0-v0+cPoint,p1+v1,p0-v0,p1+v1,2);
            this.v.setTripleAt(p0-v0,p1-v1,p0-v0,p1-v1+cPoint,p0-v0,p1-v1,3);
        }
    }else{
        this.v.setTripleAt(p0+v0,p1-v1+round,p0+v0,p1-v1+cPoint,p0+v0,p1-v1+round,0, true);
        if(round!== 0){
            this.v.setTripleAt(p0+v0-round,p1-v1,p0+v0-round,p1-v1,p0+v0-cPoint,p1-v1,1, true);
            this.v.setTripleAt(p0-v0+round,p1-v1,p0-v0+cPoint,p1-v1,p0-v0+round,p1-v1,2, true);
            this.v.setTripleAt(p0-v0,p1-v1+round,p0-v0,p1-v1+round,p0-v0,p1-v1+cPoint,3, true);
            this.v.setTripleAt(p0-v0,p1+v1-round,p0-v0,p1+v1-cPoint,p0-v0,p1+v1-round,4, true);
            this.v.setTripleAt(p0-v0+round,p1+v1,p0-v0+round,p1+v1,p0-v0+cPoint,p1+v1,5, true);
            this.v.setTripleAt(p0+v0-round,p1+v1,p0+v0-cPoint,p1+v1,p0+v0-round,p1+v1,6, true);
            this.v.setTripleAt(p0+v0,p1+v1-round,p0+v0,p1+v1-round,p0+v0,p1+v1-cPoint,7, true);
        } else {
            this.v.setTripleAt(p0-v0,p1-v1,p0-v0+cPoint,p1-v1,p0-v0,p1-v1,1, true);
            this.v.setTripleAt(p0-v0,p1+v1,p0-v0,p1+v1-cPoint,p0-v0,p1+v1,2, true);
            this.v.setTripleAt(p0+v0,p1+v1,p0+v0-cPoint,p1+v1,p0+v0,p1+v1,3, true);

        }
    }*/



	var p0 = rectangleData.p.k[0], p1 = rectangleData.p.k[1], v0 = rectangleData.s.k[0]/2, v1 = rectangleData.s.k[1]/2; 
    var round = Math.min(v0,v1,rectangleData.r.k);
    var cPoint = round*(1-roundCorner);
	var vPoints = [];
	var oPoints = [];
	var iPoints = [];
	if(rectangleData.d === 2 || rectangleData.d === 1) {
		vPoints[0] = [p0+v0, p1-v1+round];
		oPoints[0] = [p0+v0 - vPoints[0][0], p1-v1+round - vPoints[0][1]];
		iPoints[0] = [p0+v0 - vPoints[0][0], p1-v1+cPoint - vPoints[0][1]];
		vPoints[1] = [p0+v0, p1+v1-round];
		oPoints[1] = [p0+v0 - vPoints[1][0], p1+v1-cPoint - vPoints[1][1]];
		iPoints[1] = [p0+v0 - vPoints[1][0], p1+v1-round - vPoints[1][1]];

        if(round!== 0){
			vPoints[2] = [p0+v0-round, p1+v1];
			oPoints[2] = [p0+v0-round - vPoints[2][0], p1+v1 - vPoints[2][1]];
			iPoints[2] = [p0+v0-cPoint - vPoints[2][0], p1+v1 - vPoints[2][1]];
			vPoints[3] = [p0-v0+round, p1+v1];
			oPoints[3] = [p0-v0+cPoint - vPoints[3][0], p1+v1 - vPoints[3][1]];
			iPoints[3] = [p0-v0+round - vPoints[3][0], p1+v1 - vPoints[3][1]];
			vPoints[4] = [p0-v0, p1+v1-round];
			oPoints[4] = [p0-v0 - vPoints[4][0], p1+v1-round - vPoints[4][1]];
			iPoints[4] = [p0-v0 - vPoints[4][0], p1+v1-cPoint - vPoints[4][1]];
			vPoints[5] = [p0-v0, p1-v1+round];
			oPoints[5] = [p0-v0 - vPoints[5][0], p1-v1+cPoint - vPoints[5][1]];
			iPoints[5] = [p0-v0 - vPoints[5][0], p1-v1+round - vPoints[5][1]];
			vPoints[6] = [p0-v0+round, p1-v1];
			oPoints[6] = [p0-v0+round - vPoints[6][0], p1-v1 - vPoints[6][1]];
			iPoints[6] = [p0-v0+cPoint - vPoints[6][0], p1-v1 - vPoints[6][1]];
			vPoints[7] = [p0+v0-round, p1-v1];
			oPoints[7] = [p0+v0-cPoint - vPoints[7][0], p1-v1 - vPoints[7][1]];
			iPoints[7] = [p0+v0-round - vPoints[7][0], p1-v1 - vPoints[7][1]];
        } else {
			vPoints[2] = [p0-v0, p1+v1];
			oPoints[2] = [p0-v0+cPoint - vPoints[2][0], p1+v1 - vPoints[2][1]];
			iPoints[2] = [p0-v0 - vPoints[2][0], p1+v1 - vPoints[2][1]];
			vPoints[3] = [p0-v0, p1-v1];
			oPoints[3] = [p0-v0 - vPoints[3][0], p1-v1+cPoint - vPoints[3][1]];
			iPoints[3] = [p0-v0 - vPoints[3][0], p1-v1 - vPoints[3][1]];
        }
    } else {
		vPoints[0] = [p0+v0, p1-v1+round];
		oPoints[0] = [p0+v0 - vPoints[0][0], p1-v1+cPoint - vPoints[0][1]];
		iPoints[0] = [p0+v0 - vPoints[0][0], p1-v1+round - vPoints[0][1]];

        if(round!== 0){
			vPoints[1] = [p0+v0-round, p1-v1];
			oPoints[1] = [p0+v0-round - vPoints[1][0], p1-v1 - vPoints[1][1]];
			iPoints[1] = [p0+v0-cPoint - vPoints[1][0], p1-v1 - vPoints[1][1]];
			vPoints[2] = [p0-v0+round, p1-v1];
			oPoints[2] = [p0-v0+cPoint - vPoints[2][0], p1-v1 - vPoints[2][1]];
			iPoints[2] = [p0-v0+round - vPoints[2][0], p1-v1 - vPoints[2][1]];
			vPoints[3] = [p0-v0, p1-v1+round];
			oPoints[3] = [p0-v0 - vPoints[3][0], p1-v1+round - vPoints[3][1]];
			iPoints[3] = [p0-v0 - vPoints[3][0], p1-v1+cPoint - vPoints[3][1]];
			vPoints[4] = [p0-v0, p1+v1-round];
			oPoints[4] = [p0-v0 - vPoints[4][0], p1+v1-cPoint - vPoints[4][1]];
			iPoints[4] = [p0-v0 - vPoints[4][0], p1+v1-round - vPoints[4][1]];
			vPoints[5] = [p0-v0+round, p1+v1];
			oPoints[5] = [p0-v0+round - vPoints[5][0], p1+v1 - vPoints[5][1]];
			iPoints[5] = [p0-v0+cPoint - vPoints[5][0], p1+v1 - vPoints[5][1]];
			vPoints[6] = [p0+v0-round, p1+v1];
			oPoints[6] = [p0+v0-cPoint - vPoints[6][0], p1+v1 - vPoints[6][1]];
			iPoints[6] = [p0+v0-round - vPoints[6][0], p1+v1 - vPoints[6][1]];
			vPoints[7] = [p0+v0, p1+v1-round];
			oPoints[7] = [p0+v0 - vPoints[7][0], p1+v1-round - vPoints[7][1]];
			iPoints[7] = [p0+v0 - vPoints[7][0], p1+v1-cPoint - vPoints[7][1]];
        } else {
			vPoints[1] = [p0-v0, p1-v1];
			oPoints[1] = [p0-v0+cPoint - vPoints[1][0], p1-v1 - vPoints[1][1]];
			iPoints[1] = [p0-v0 - vPoints[1][0], p1-v1 - vPoints[1][1]];
			vPoints[2] = [p0-v0, p1+v1];
			oPoints[2] = [p0-v0 - vPoints[2][0], p1+v1-cPoint - vPoints[2][1]];
			iPoints[2] = [p0-v0 - vPoints[2][0], p1+v1 - vPoints[2][1]];
			vPoints[3] = [p0+v0, p1+v1];
			oPoints[3] = [p0+v0-cPoint - vPoints[3][0], p1+v1 - vPoints[3][1]];
			iPoints[3] = [p0+v0 - vPoints[3][0], p1+v1 - vPoints[3][1]];

        }
    }
	var pathObject = {
		ks: {
			a:0,
			k: {
				i:iPoints,
				v:vPoints,
				o:oPoints,
				c: true
			}
		}
	}
	return pathObject;
}

function drawable(_drawableData, _level, _timeOffset) {
	var paths = [];
	var level = _level;
	var drawableData = _drawableData;
	var closed = false;
	var timeOffset = _timeOffset;

	function getDrawingAttributes(pathName) {
		var attributes = [];
		var hexColor;
		var color = drawableData.c;
		var animatedProp;
		if(drawableData.ty === 'st') {
			if (color.a === 0) {
				hexColor = rgbHex(color.k[0]*255,color.k[1]*255,color.k[2]*255);
				attributes.push({
					key: 'android:strokeColor',
					value: hexColor
				})
			} else {
				hexColor = rgbHex(color.k[0].s[0]*255,color.k[0].s[1]*255,color.k[0].s[2]*255)
				attributes.push({
					key: 'android:strokeColor',
					value: hexColor
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeColor', color.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			attributes.push({
				key: 'android:strokeLineCap',
				value: 'round'
			})
			attributes.push({
				key: 'android:strokeLineJoin',
				value: 'round'
			})
			
			if(drawableData.w.a === 0) {
				attributes.push({
					key: 'android:strokeWidth',
					value: drawableData.w.k
				})
			} else {
				attributes.push({
					key: 'android:strokeWidth',
					value: drawableData.w.k[0].s
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeWidth', drawableData.w.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			if(drawableData.o.a === 0) {
				attributes.push({
					key: 'android:strokeAlpha',
					value: drawableData.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'android:strokeAlpha',
					value: drawableData.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeAlpha', drawableData.o.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			
		} else if(drawableData.ty === 'fl') {
			if (color.a === 0) {
				hexColor = rgbHex(color.k[0]*255,color.k[1]*255,color.k[2]*255)
				attributes.push({
					key: 'android:fillColor',
					value: hexColor
				})
			} else {
				hexColor = rgbHex(color.k[0].s[0]*255,color.k[0].s[1]*255,color.k[0].s[2]*255)
				attributes.push({
					key: 'android:fillColor',
					value: hexColor
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillColor', color.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			if(drawableData.o.a === 0) {
				attributes.push({
					key: 'android:fillAlpha',
					value: drawableData.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'android:fillAlpha',
					value: drawableData.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillAlpha', drawableData.o.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			attributes.push({
				key: 'android:fillType',
				value: drawableData.r === 1 ? 'nonZero' : 'evenOdd'
			})
		}
		return attributes;
	}

	function isTransformAnimated(transform) {
		if(transform.p && transform.p.a === 1) {
			return true;
		}
		if(transform.a && transform.a.a === 1) {
			return true;
		}
		if(transform.s && transform.s.a === 1) {
			return true;
		}
		if(transform.r && transform.r.a === 1) {
			return true;
		}
		return false;
	}
	
	function addPath(path, transforms, level, trimPath) {
		if (closed) {
			return;
		}
		paths.push({path: path, transforms: transforms, level: level, trimPath: trimPath});
	}
	
	function addEllipse(shapeData, transforms, level, trimPath) {
		if (closed) {
			return;
		}
		var pathConverted = convertEllipseToPath(shapeData);
		if(pathConverted) {
			paths.push({path: pathConverted, transforms: transforms, level: level, trimPath: trimPath});
		}
	}
	
	function addRectangle(shapeData, transforms, level, trimPath) {
		if (closed) {
			return;
		}
		var pathConverted = convertRectangleToPath(shapeData);
		if(pathConverted) {
			paths.push({path: pathConverted, transforms: transforms, level: level, trimPath: trimPath});
		}
	}

	function canFlattenPath(transforms, level) {
		var i = 0;
		while (i < level) {
			if(isTransformAnimated(transforms[i])){
				return false;
			}
			i += 1;
		}
		return true;
	}

	function buildNewPath(pathList, pathName) {
		var pathAttributes = [].concat(getDrawingAttributes(pathName));
		var pathNode = node.createNodeWithAttributes('path', pathAttributes, pathName);
		var finalNode = pathNode;
		var groupNode, nestedGroupNode, nestedArray;
		var i, len = pathList.length;
		var j, jLen;
		matrix.reset();
		var transforms;
		var finalPathData = '';
		var animatedProp, currentAnimatedProp;
		var currentPath, pathData;
		for(i = 0; i < len; i += 1){
			pathData = pathList[i];
			transforms = pathData.transforms;
			jLen = pathData.level;
			matrix.reset();

			if(!canFlattenPath(transforms, jLen)){
				for(j = jLen - 1; j >= 0; j -= 1) {
					nestedArray = [finalNode].concat(createTransformGroup(pathName + naming.GROUP_NAME +'_' + j, transforms[j], timeOffset));
					finalNode = node.nestArray(nestedArray);
					var name = node.getAttribute(finalNode, 'id');

					//parentGroupNode = node.createNode('group', pathName + '_gr_' + j);
					//groupNode = createTransformGroup(parentGroupNode, transforms[j], timeOffset);
					//node.nestChild(parentGroupNode, finalNode);
					//finalNode = groupNode;
				}
			} else {
				for(j = 0; j < jLen; j += 1) {
					matrix.translate(transforms[j].p.k[0], transforms[j].p.k[1]);
					matrix.scale(transforms[j].s.k[0]/100, transforms[j].s.k[1]/100);
					matrix.rotate(transforms[j].r.k*degToRads);
					matrix.translate(-transforms[j].a.k[0], -transforms[j].a.k[1]);
				}
			}

			if(pathData.path.ks.a === 0) {
				currentPath = ' ' + createPathData(pathData.path.ks.k, matrix);
				finalPathData += currentPath;
				if(animatedProp) {
					var aaptAttr = node.getChild(animatedProp,'aapt:attr');
					var setProp = node.getChild(aaptAttr,'set');
					var setChildren = node.getChildren(setProp);
					jLen = setChildren.length;
					var objectAnimator, value;
					for(j = 0; j < jLen; j += 1) {
						value = node.getAttribute(setChildren[j],'android:valueFrom');
						if(value) { 
							node.addAttribute(setChildren[j],'android:valueFrom', value + currentPath);
							value = node.getAttribute(setChildren[j],'android:valueTo');
							node.addAttribute(setChildren[j],'android:valueTo', value + currentPath);
						}
					}
				}
			} else {
				if(animatedProp) {
					if(pathData.path.ks.k[0].t > 0) {
						var extraKeyframe = JSON.parse(JSON.stringify(pathData.path.ks.k[0]));
						extraKeyframe.e = extraKeyframe.s;
						extraKeyframe.t = 0;
						pathData.path.ks.k.splice(0,0,extraKeyframe);
					}
					var aaptAttr = node.getChild(animatedProp,'aapt:attr');
					var setProp = node.getChild(aaptAttr,'set');
					var setChildren = node.getChildren(setProp);
					jLen = setChildren.length;
					var objectAnimator, value;
					for(j = 0; j < jLen; j += 1) {
						value = node.getAttribute(setChildren[j],'android:valueFrom');
						if(value) { 
							node.addAttribute(setChildren[j],'android:valueFrom', value + createPathData(pathData.path.ks.k[j - 1].s[0], matrix));
							value = node.getAttribute(setChildren[j],'android:valueTo');
							node.addAttribute(setChildren[j],'android:valueTo', value + createPathData(pathData.path.ks.k[j - 1].e[0], matrix));
						}
					}
				} else {
					animatedProp = property.createAnimatedPathData(pathName, pathData.path.ks.k, matrix, finalPathData, timeOffset);
					currentPath = ' ' + createPathData(pathData.path.ks.k[0].s[0], matrix);
					finalPathData += currentPath;
					targets.addTarget(animatedProp);
				}
			}

			if(pathData.trimPath) {
				var trimPathData = pathData.trimPath;
				var startValue, endValue, offsetValue;
				if (trimPathData.s.a === 0) {
					startValue = trimPathData.s.k * 0.01;
				} else {
					startValue = trimPathData.s.k[0].s * 0.01;
					animatedProp = property.createAnimatedProperty(pathName, 'trimPathStart', trimPathData.s.k, timeOffset);
					targets.addTarget(animatedProp);
				}
				if (trimPathData.e.a === 0) {
					endValue = trimPathData.e.k * 0.01;
				} else {
					endValue = trimPathData.e.k[0].s * 0.01;
					animatedProp = property.createAnimatedProperty(pathName, 'trimPathEnd', trimPathData.e.k, timeOffset);
					targets.addTarget(animatedProp);
				}
				if (trimPathData.o.a === 0) {
					offsetValue = trimPathData.o.k * 1/360;
				} else {
					offsetValue = trimPathData.o.k[0].s * 1/360;
					animatedProp = property.createAnimatedProperty(pathName, 'trimPathOffset', trimPathData.o.k, timeOffset);
					targets.addTarget(animatedProp);
				}
				node.addAttribute(pathNode,'android:trimPathStart', startValue);
				node.addAttribute(pathNode,'android:trimPathEnd', endValue);
				node.addAttribute(pathNode,'android:trimPathOffset', offsetValue);
			}
		}
		node.addAttribute(pathNode,'android:pathData', finalPathData);

		return finalNode;
	}

	function keyframesAreEqual(keyframes1, keyframes2) {
		if(keyframes1.length !== keyframes2.length) {
			return false;
		}
		var i = 0, len = keyframes1.length;
		while (i<len) {
			if(keyframes1[i].t !== keyframes2[i].t || keyframes1[i].n !== keyframes2[i].n){
				return false;
			}
			i += 1;
		}
		return true;
	}

	function exportDrawables(name, _timeOffset) {
		timeOffset = _timeOffset;
		var drawableNodes = [];
		var i, len = paths.length, nodeElem;
		var pathName, pathOpen = false, pathCount = 0, pathAttributes;
		var currentPathList = [];
		var pathData, hasAnimatedPath = false;
		var lastAnimatedPath;
		for(i = 0; i < len; i += 1) {
			pathData = paths[i];
			if(!currentPathList.length 
				|| (((!hasAnimatedPath && pathData.path.ks.a === 1) || pathData.path.ks.a === 0 || (pathData.path.ks.a === 1 && keyframesAreEqual(lastAnimatedPath.k, pathData.path.ks.k))) && canFlattenPath(pathData.transforms, pathData.level)) && !pathData.trimPath) {
				if(pathData.path.ks.a === 1) {
					lastAnimatedPath = pathData.path.ks;
					hasAnimatedPath = true;
				}
			} else {
				pathName = name + naming.PATH_NAME + '_' + pathCount;
				nodeElem = buildNewPath(currentPathList, pathName);
				drawableNodes.push(nodeElem);
				currentPathList.length = 0;
				hasAnimatedPath = false;
				pathCount += 1;
			}
			currentPathList.push(pathData);
		}
		if (currentPathList.length) {
			pathName = name + naming.PATH_NAME + '_' + pathCount;
			nodeElem = buildNewPath(currentPathList, pathName);
			drawableNodes.push(nodeElem);
		}
		return drawableNodes;
	}

	function close() {
		closed = true;
	}

	var factoryInstance = {
		addPath: addPath,
		addEllipse: addEllipse,
		addRectangle: addRectangle,
		exportDrawables: exportDrawables,
		close: close
	}

	return factoryInstance;
}

module.exports = drawable;