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
					key: 'stroke',
					value: hexColor
				})
			} else {
				hexColor = rgbHex(color.k[0].s[0]*255,color.k[0].s[1]*255,color.k[0].s[2]*255)
				attributes.push({
					key: 'stroke',
					value: hexColor
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeColor', color.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			attributes.push({
				key: 'stroke-linecap',
				value: 'round'
			})
			attributes.push({
				key: 'stroke-linejoin',
				value: 'round'
			})
			attributes.push({
				key: 'fill',
				value: 'none'
			})
			
			if(drawableData.w.a === 0) {
				attributes.push({
					key: 'stroke-width',
					value: drawableData.w.k
				})
			} else {
				attributes.push({
					key: 'stroke-width',
					value: drawableData.w.k[0].s
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeWidth', drawableData.w.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			if(drawableData.o.a === 0) {
				attributes.push({
					key: 'stroke-opacity',
					value: drawableData.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'stroke-opacity',
					value: drawableData.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'strokeAlpha', drawableData.o.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			
		} else if(drawableData.ty === 'fl') {
			if (color.a === 0) {
				hexColor = rgbHex(color.k[0]*255,color.k[1]*255,color.k[2]*255)
				attributes.push({
					key: 'fill',
					value: hexColor
				})
			} else {
				hexColor = rgbHex(color.k[0].s[0]*255,color.k[0].s[1]*255,color.k[0].s[2]*255)
				attributes.push({
					key: 'fill',
					value: hexColor
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillColor', color.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			if(drawableData.o.a === 0) {
				attributes.push({
					key: 'fill-opacity',
					value: drawableData.o.k * 0.01
				})
			} else {
				attributes.push({
					key: 'fill-opacity',
					value: drawableData.o.k[0].s * 0.01
				})
				animatedProp = property.createAnimatedProperty(pathName, 'fillAlpha', drawableData.o.k, timeOffset);
				targets.addTarget(animatedProp);
			}
			attributes.push({
				key: 'fill-rule',
				value: drawableData.r === 1 ? 'nonzero' : 'evenodd'
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
		if(transform.o && transform.o.a === 1 || transform.o.k !== 100) {
			return true;
		}
		return false;
	}
	
	function addPath(path, transforms, level, trimPath) {
		if (closed) {
			return;
		}
		paths.push({type: 'path', path: path, transforms: transforms, level: level, trimPath: trimPath});
	}
	
	function addEllipse(shapeData, transforms, level, trimPath) {
		if (closed) {
			return;
		}
		if(shapeData.s.a === 0 && shapeData.p.a === 0) {
			var pathConverted = convertEllipseToPath(shapeData);
			if(pathConverted) {
				paths.push({type: 'path', path: pathConverted, transforms: transforms, level: level, trimPath: trimPath});
			}
		} else {
			paths.push({type:'ellipse', s: shapeData.s, p: shapeData.p, transforms: transforms, level: level, trimPath: trimPath});
		}
	}
	
	function addRectangle(shapeData, transforms, level, trimPath) {
		if (closed) {
			return;
		}
		if(shapeData.r.a === 0 && shapeData.s.a === 0 && shapeData.p.a === 0) {
			var pathConverted = convertRectangleToPath(shapeData);
			if(pathConverted) {
				paths.push({type:'path', path: pathConverted, transforms: transforms, level: level, trimPath: trimPath});
			}
		} else {
			paths.push({type:'rect', r: shapeData.r, s: shapeData.s, p: shapeData.p, transforms: transforms, level: level, trimPath: trimPath});
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

	function buildNewEllipse(pathData, pathName) {
		var pathAttributes = [].concat(getDrawingAttributes(pathName));
		if(pathData.s.a === 0) {
			pathAttributes.push({
				key: 'cx',
				value: pathData.s.k[0]
			})
			pathAttributes.push({
				key: 'cy',
				value: pathData.s.k[1]
			})
			pathAttributes.push({
				key: 'transform',
				value: 'translate(' + -pathData.s.k[0]/2 + ' ' + -pathData.s.k[1]/2 + ')'
			})
		} else {
			animatedProp = property.createAnimatedProperty(pathName, 'ellipseWidth', pathData.s.k, timeOffset);
			targets.addTarget(animatedProp);
			animatedProp = property.createAnimatedProperty(pathName, 'ellipseHeight', pathData.s.k, timeOffset);
			targets.addTarget(animatedProp);
		}
		if(pathData.p.a === 0) {
			pathAttributes.push({
				key: 'cx',
				value: pathData.p.k[0]
			})
			pathAttributes.push({
				key: 'cy',
				value: pathData.p.k[1]
			})
		} else {
			animatedProp = property.createAnimatedProperty(pathName, 'ellipsePositionX', pathData.p.k, timeOffset);
			targets.addTarget(animatedProp);
			animatedProp = property.createAnimatedProperty(pathName, 'ellipsePositionY', pathData.p.k, timeOffset);
			targets.addTarget(animatedProp);
		}

		var pathNode = node.createNodeWithAttributes('ellipse', pathAttributes, pathName);
		var finalNode = pathNode;

		var transforms = pathData.transforms;
		var j, jLen = pathData.level;

		if(!canFlattenPath(transforms, jLen)){
			for(j = jLen - 1; j >= 0; j -= 1) {
				if (transforms[j].o.a === 1) {
					const animatedProperty = property.createAnimatedProperty(pathName, 'opacity', transforms[j].o.k, timeOffset);
					targets.addTarget(animatedProperty);
				} else if(transforms[j].o.k !== 100) {
					node.addAttribute(finalNode,'opacity', transforms[j].o.k*0.01);
				}
				nestedArray = [finalNode].concat(createTransformGroup(pathName + naming.GROUP_NAME +'_' + j, JSON.parse(JSON.stringify(transforms[j])), timeOffset));
				finalNode = node.nestArray(nestedArray);
			}
		}

		return finalNode;
	}

	function buildNewRect(pathData, pathName) {
		var pathAttributes = [].concat(getDrawingAttributes(pathName));
		if(pathData.s.a === 0) {
			pathAttributes.push({
				key: 'width',
				value: pathData.s.k[0]
			})
			pathAttributes.push({
				key: 'height',
				value: pathData.s.k[1]
			})
			pathAttributes.push({
				key: 'transform',
				value: 'translate(' + -pathData.s.k[0]/2 + ' ' + -pathData.s.k[1]/2 + ')'
			})
		} else {
			animatedProp = property.createAnimatedProperty(pathName, 'rectWidth', pathData.s.k, timeOffset);
			targets.addTarget(animatedProp);
			animatedProp = property.createAnimatedProperty(pathName, 'rectHeight', pathData.s.k, timeOffset);
			targets.addTarget(animatedProp);
			animatedProp = property.createAnimatedProperty(pathName, '-position', pathData.s.k, timeOffset);
			targets.addTarget(animatedProp);
		}
		if(pathData.p.a === 0) {
			pathAttributes.push({
				key: 'x',
				value: pathData.p.k[0]
			})
			pathAttributes.push({
				key: 'y',
				value: pathData.p.k[1]
			})
		} else {
			animatedProp = property.createAnimatedProperty(pathName, 'rectPositionX', pathData.p.k, timeOffset);
			targets.addTarget(animatedProp);
			animatedProp = property.createAnimatedProperty(pathName, 'rectPositionY', pathData.p.k, timeOffset);
			targets.addTarget(animatedProp);
		}
		if(pathData.r.a === 0) {
			if(pathData.r.k !== 0) {
				pathAttributes.push({
					key: 'rx',
					value: pathData.r.k
				})
				pathAttributes.push({
					key: 'ry',
					value: pathData.r.k
				})
			}
		} else {
			animatedProp = property.createAnimatedProperty(pathName, 'rx', pathData.r.k, timeOffset);
			targets.addTarget(animatedProp);
			animatedProp = property.createAnimatedProperty(pathName, 'ry', pathData.r.k, timeOffset);
			targets.addTarget(animatedProp);
		}
		var pathNode = node.createNodeWithAttributes('rect', pathAttributes, pathName);
		var finalNode = pathNode;

		var transforms = pathData.transforms;
		var j, jLen = pathData.level;

		if(!canFlattenPath(transforms, jLen)){
			for(j = jLen - 1; j >= 0; j -= 1) {
				if (transforms[j].o.a === 1) {
					const animatedProperty = property.createAnimatedProperty(pathName, 'opacity', transforms[j].o.k, timeOffset);
					targets.addTarget(animatedProperty);
				} else if(transforms[j].o.k !== 100) {
					node.addAttribute(finalNode,'opacity', transforms[j].o.k*0.01);
				}
				nestedArray = [finalNode].concat(createTransformGroup(pathName + naming.GROUP_NAME +'_' + j, JSON.parse(JSON.stringify(transforms[j])), timeOffset));
				finalNode = node.nestArray(nestedArray);
			}
		}

		return finalNode;
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
					if (transforms[j].o.a === 1) {
						const animatedProperty = property.createAnimatedProperty(pathName, 'opacity', transforms[j].o.k, timeOffset);
						targets.addTarget(animatedProperty);
					} else if(transforms[j].o.k !== 100) {
						node.addAttribute(finalNode,'opacity', transforms[j].o.k*0.01);
					}
					nestedArray = [finalNode].concat(createTransformGroup(pathName + naming.GROUP_NAME +'_' + j, JSON.parse(JSON.stringify(transforms[j])), timeOffset));
					finalNode = node.nestArray(nestedArray);
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
					//var fromValue = node.getAttribute(animatedProp,'from') + ';' + currentPath;
					//var toValue = node.getAttribute(animatedProp,'to') + ';' + currentPath;
					var valuesList = node.getAttribute(animatedProp,'values').split(';');
					jLen = valuesList.length;
					var valuesValue = '';
					for(j = 0; j < jLen; j += 1) {
						valuesValue += valuesValue ? ';':'';
						valuesValue += valuesList[j] + currentPath;
					}
					//node.addAttribute(animatedProp,'from', fromValue);
					//node.addAttribute(animatedProp,'to', toValue);
					node.addAttribute(animatedProp,'values', valuesValue);
				}
			} else {
				if(animatedProp) {
					var tempAnimatedProp = property.createAnimatedPathData(pathName, pathData.path.ks.k, matrix, '', timeOffset);
					//var fromValue = node.getAttribute(animatedProp,'from') + ';' + currentPath;
					//var toValue = node.getAttribute(animatedProp,'to') + ';' + currentPath;
					var valuesList = node.getAttribute(animatedProp,'values').split(';');
					var tempValuesList = node.getAttribute(tempAnimatedProp,'values').split(';');
					var firstKeyframe = pathData.path.ks.k[0];
					var lastKeyframe = pathData.path.ks.k[pathData.path.ks.k.length - 2];
					jLen = valuesList.length;
					var valuesValue = '';
					for(j = 0; j < jLen; j += 1) {
						valuesValue += valuesValue ? ';':'';
						valuesValue += valuesList[j] + ' ' + tempValuesList[j];
					}
					//node.addAttribute(animatedProp,'from', fromValue);
					//node.addAttribute(animatedProp,'to', toValue);
					node.addAttribute(animatedProp,'values', valuesValue);
				} else {
					animatedProp = property.createAnimatedPathData(pathName, pathData.path.ks.k, matrix, finalPathData, timeOffset);
					currentPath = ' ' + createPathData(pathData.path.ks.k[0].s[0], matrix);
					finalPathData += currentPath;
					targets.addTarget(animatedProp);
				}
			}

			/*
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
				node.addAttribute(pathNode,'stroke-dashoffset', offsetValue);
			}
			*/
		}
		node.addAttribute(pathNode,'d', finalPathData);

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

	function areTransformsEqual(pathList, transforms) {
		var listTransforms = pathList[0].transforms;
		if(listTransforms.length !== transforms.length) {
			return false;
		}
		var i = 0, len = listTransforms.length;
		while(i < len) {
			if(listTransforms[i] !== transforms[i]){
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
			if(pathData.type === 'rect') {
				if(currentPathList.length) {
					pathName = name + naming.PATH_NAME + '_' + pathCount;
					nodeElem = buildNewPath(currentPathList, pathName);
					drawableNodes.push(nodeElem);
					currentPathList.length = 0;
					hasAnimatedPath = false;
					pathCount += 1;
				}
				pathName = name + naming.PATH_NAME + '_' + pathCount;
				nodeElem = buildNewRect(pathData, pathName);
				drawableNodes.push(nodeElem);
				pathCount += 1;
			} else if(pathData.type === 'ellipse') {
				if(currentPathList.length) {
					pathName = name + naming.PATH_NAME + '_' + pathCount;
					nodeElem = buildNewPath(currentPathList, pathName);
					drawableNodes.push(nodeElem);
					currentPathList.length = 0;
					hasAnimatedPath = false;
					pathCount += 1;
				}
				pathName = name + naming.PATH_NAME + '_' + pathCount;
				nodeElem = buildNewEllipse(pathData, pathName);
				drawableNodes.push(nodeElem);
				pathCount += 1;
			} else if(!currentPathList.length 
				|| (((!hasAnimatedPath && pathData.path.ks.a === 1) || pathData.path.ks.a === 0 || (pathData.path.ks.a === 1 && keyframesAreEqual(lastAnimatedPath.k, pathData.path.ks.k)))) /* && canFlattenPath(pathData.transforms, pathData.level) */ && areTransformsEqual(currentPathList, pathData.transforms) && !pathData.trimPath) {
				if(pathData.path.ks.a === 1) {
					lastAnimatedPath = pathData.path.ks;
					hasAnimatedPath = true;
				}
				currentPathList.push(pathData);
			} else {
				pathName = name + naming.PATH_NAME + '_' + pathCount;
				nodeElem = buildNewPath(currentPathList, pathName);
				drawableNodes.push(nodeElem);
				currentPathList.length = 0;
				hasAnimatedPath = false;
				pathCount += 1;
				currentPathList.push(pathData);
			}
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