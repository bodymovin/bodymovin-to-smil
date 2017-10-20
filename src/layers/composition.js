var layer = require ('./layer');
var node = require ('../node');
var shapeFactory = require ('../layers/shape/shape');
var solidFactory = require ('../layers/solid/solid');
var naming = require('../naming');

function composition(compositionData, assets) {

	var compLayersData = compositionData.layers ||  getCompositionLayers(compositionData.refId, assets);

	var state = {
		inPoint: compositionData.ip || 0,
		outPoint: compositionData.op || 0,
		startPoint: compositionData.st || 0,
		layerData: compositionData,
		layers: []
	}

	function getCompositionLayers(compId, assets, layers) {
		var i = 0, len = assets.length;
		while (i < len) {
			if(assets[i].id === compId) {
				return assets[i].layers;
			}
			i += 1;
		}
		return [];
	}

	function createNodeInstance(grouper, groupName){
		var layers = state.layers;
		var i, len = layers.length;
		for (i = len - 1; i >= 0; i -= 1) {
			node.nestChild(grouper, layers[i].exportNode(groupName + naming.LAYER_NAME + '_' + i, state.workAreaOffset));
		}
	}

	function processData() {
		var i, len = compLayersData.length;
		var layer;
		for(i = 0; i < len; i += 1) {
			if(compLayersData[i].ty === 4) {
				layer = shapeFactory(compLayersData[i]);
			} else if(compLayersData[i].ty === 0) {
				layer = composition(compLayersData[i], assets);
			} else if(compLayersData[i].ty === 1) {
				layer = solidFactory(compLayersData[i]);
			} else {
				layer = null;
			}
			if(layer){
				layer.setTimeOffset(state.timeOffset + state.startPoint);
				layer.setSiblings(compLayersData);
				layer.processData();
				state.layers.push(layer);
			}
		}
		return factoryInstance;
	}

	var factoryInstance = {
		createNodeInstance: createNodeInstance,
		processData: processData
	};
	Object.assign(factoryInstance, layer(state)); 

	return factoryInstance;
}

module.exports = composition;