var layer = require ('../layer');
var node = require ('../../node');
var naming = require('../../naming');
var rgbHex = require('../../helpers/rgbToHex');
var fonts = require('../../helpers/fonts');

function shape(layerData) {


	var state = {
		shapes: layerData.shapes || layerData.it,
		layerData: layerData
	}

	function getTextAnchor(alignment) {
		switch(alignment) {
			case 0:
				return 'start'
			case 1:
				return 'end'
			case 2:
			default:
				return 'middle'
		}
	}

	function createNodeInstance(grouper, groupName){
		var textData = state.layerData.t.d.k[0].s;
		var attributes = [
			{
				key: 'font-size',
				value: textData.s + 'px'
			},
			{
				key: 'font-family',
				value: fonts.getFontFamily(textData.f)
			},
			{
				key: 'font-weight',
				value: fonts.getFontWeight(textData.f)
			},
			{
				key: 'fill',
				value: rgbHex(textData.fc[0]*255,textData.fc[1]*255,textData.fc[2]*255)
			},
			{
				key: 'text-anchor',
				value: getTextAnchor(textData.j) 
			},
			{
				key: 'letter-spacing',
				value: textData.tr/1000*textData.s
			}
		];
		var textName = groupName + naming.TEXT_NAME;
		var text = node.createNodeWithAttributes('text', attributes, textName);
		var textLines = textData.t.split('\r');
		var i, len = textLines.length;
		var tSpanAttributes;
		for (i = 0; i < len; i += 1) {
			tSpanAttributes = [
				{
					key: 'x',
					value: '0'
				},
				{
					key: 'dy',
					value: i === 0 ? '0' : textData.lh
				}
			]
			var textSpan = node.createNodeWithAttributes('tspan', tSpanAttributes, textName + naming.TEXT_SPAN_NAME + '_' + i);
			node.nestChild(textSpan, textLines[i]);
			node.nestChild(text, textSpan);
		}
		node.nestChild(grouper, text);
	}

	function processData() {
	}

	var factoryInstance = {
		processData: processData,
		createNodeInstance: createNodeInstance
	};
	Object.assign(factoryInstance, layer(state)); 
	
	return factoryInstance;
}

module.exports = shape;