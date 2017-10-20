var layer = require ('../layer');
var drawableFactory = require ('./drawable');
var node = require ('../../node');
var naming = require('../../naming');

function shape(layerData, _level) {

	var drawables = [];
	var transforms = [];
	var level = _level || 0;
	var trimPath;

	var state = {
		shapes: layerData.shapes || layerData.it,
		layerData: layerData
	}

	function createNodeInstance(grouper, groupName){
		var drawableNodes;
		var i, len = drawables.length;
		var j, jLen;
		for(i = 0; i < len; i += 1) {
			drawableNodes = drawables[i].exportDrawables(groupName + naming.DRAWABLE_NAME + '_' + i, state.timeOffset);
			jLen = drawableNodes.length;
			for(j = 0; j < jLen; j += 1) {
				node.nestChild(grouper, drawableNodes[j]);
			}
		}
	}

	function addPathToDrawables(path) {
		var i, len = drawables.length;
		for(i = 0; i < len; i += 1) {
			drawables[i].addPath(path, transforms, level, trimPath);
		}
	}

	function addEllipseToDrawables(shapeData) {
		var i, len = drawables.length;
		for(i = 0; i < len; i += 1) {
			drawables[i].addEllipse(shapeData, transforms, level, trimPath);
		}
	}

	function addRectToDrawables(shapeData) {
		var i, len = drawables.length;
		for(i = 0; i < len; i += 1) {
			drawables[i].addRectangle(shapeData, transforms, level, trimPath);
		}
	}

	function processData() {
		var i,  len = state.shapes.length;
		var shapeGroup, drawable;
		var localDrawables = [];
		for (i = len - 1; i >= 0; i -= 1) {
			if(state.shapes[i].ty === 'gr') {
				shapeGroup = shape(state.shapes[i], level + 1);
				shapeGroup.setTimeOffset(state.timeOffset)
				.setDrawables(drawables)
				.setTransforms(transforms)
				.setTrimPath(trimPath)
				.processData();
			} else if(state.shapes[i].ty === 'fl' || state.shapes[i].ty === 'st') {
				drawable = drawableFactory(state.shapes[i], level, state.timeOffset);
				drawables.push(drawable);
				localDrawables.push(drawable);
			} else if(state.shapes[i].ty === 'tr') {
				transforms.push(state.shapes[i]);
			} else if(state.shapes[i].ty === 'sh') {
				addPathToDrawables(state.shapes[i]);
			} else if(state.shapes[i].ty === 'el') {
				addEllipseToDrawables(state.shapes[i]);
			} else if(state.shapes[i].ty === 'rc') {
				addRectToDrawables(state.shapes[i]);
			} else if(state.shapes[i].ty === 'tm') {
				trimPath = state.shapes[i];
			} else {
				//console.log(state.shapes[i].ty)
			}
		}

		len = localDrawables.length;
		for(i = 0; i < len; i += 1) {
			drawable = localDrawables[i];
			drawable.close();
		}
		return factoryInstance;
	}

	function setTrimPath(_trimPath) {
		trimPath = _trimPath;
		return factoryInstance;
	}

	function setDrawables(_drawables) {
		drawables = _drawables;
		return factoryInstance;
	}

	function setTransforms(_transforms) {
		var i, len = _transforms.length;
		for(i = 0; i < len; i += 1) {
			transforms.push(_transforms[i]);
		}
		return factoryInstance;
	}

	var factoryInstance = {
		setDrawables: setDrawables,
		setTransforms: setTransforms,
		setTrimPath: setTrimPath,
		processData: processData,
		createNodeInstance: createNodeInstance
	};
	Object.assign(factoryInstance, layer(state)); 
	
	return factoryInstance;
}

module.exports = shape;