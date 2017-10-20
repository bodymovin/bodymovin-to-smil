var node = require ('../../node');
var naming = require ('../../naming');
var layer = require ('../layer');

function solid(layerData) {

	var state = {
		layerData: layerData
	}

	function createNodeInstance(grouper, groupName) {
		var layerData = state.layerData;
		var attributes = [
			{
				key: 'fill',
				value: state.layerData.sc
			},
			{
				key: 'width',
				value: layerData.sw
			},
			{
				key: 'height',
				value: layerData.sh
			}
		];
		var path = node.createNodeWithAttributes('rect', attributes, groupName + naming.SOLID_NAME);
		if(!(layerData.ks && layerData.ks.o && layerData.ks.o.a === 0 && layerData.ks.o.k === 0)) {
			node.nestChild(grouper, path);
		}
	}

	function processData() {}

	var factoryInstance = {
		createNodeInstance: createNodeInstance,
		processData: processData
	};

	Object.assign(factoryInstance, layer(state)); 

	return factoryInstance;
}

module.exports = solid;