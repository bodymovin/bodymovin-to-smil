var compositionFactory = require ('../layers/composition');
var node = require ('../node');
var naming = require ('../naming');
var property = require ('../property');
var targets = require ('../targets/targets');
var fonts = require('../helpers/fonts');
var timing = require('../helpers/timing');

function svg(_animationData) {

	var attributes = [{
		key: 'xmlns',
		value: 'http://www.w3.org/2000/svg'
	},
	{
		key: 'xmlns:xlink',
		value: 'http://www.w3.org/1999/xlink'
	}];

	var _composition, animationData;

	function createTimeRangeObject() {
		var name = 'time_group';
		var timeNode = node.createNode('g',name);
		var attributes = [{
			key: 'attributeType',
			value: 'XML'
		},
		{
			key: 'attributeName',
			value: 'opacity'
		},
		{
			key: 'dur',
			value: Math.round((animationData.op - animationData.ip)/animationData.fr) + 's'
		},
		{
			key: 'from',
			value: '0'
		},
		{
			key: 'to',
			value: '1'
		},
		{
			key: 'xlink:href',
			value: '#' + name
		}];
 		var objectAnimator = node.createNodeWithAttributes('animate', attributes, '');
		targets.addTarget(objectAnimator);
		return timeNode;
	}
	
	function addSizeAttributes(width, height) {
		var sizeAttributes = [
			{
				key: 'preserveAspectRatio',
				value: 'xMidYMid meet'
			},
			{
				key: 'width',
				value: width
			},
			{
				key: 'height',
				value: height
			},
			{
				key: 'viewBox',
				value: '0 0 ' + width + ' ' + height
			},
			{
				key: 'style',
				value: 'width:100%;height:100%'
			}
		]
		return sizeAttributes;
	}

	function exportNode() {
		var promise = new Promise(function(resolve, reject){
			targets.resetTargets();
			var svgAttributes = attributes.concat(addSizeAttributes(animationData.w, animationData.h));
			var svgElem = node.createNodeWithAttributes('svg', svgAttributes);
			node.nestChild(svgElem, _composition.exportNode(naming.ROOT_NAME));
			node.nestChild(svgElem, createTimeRangeObject())
			targets.buildTargets(svgElem);
			resolve(svgElem);
		})
		return promise;
	}

	function createTargets() {
		var targets = [];
		_composition.createTargets(targets);
	}

	function processAnimation(_animationData) {
		var promise = new Promise(function(resolve, reject){
			animationData = _animationData;
			if(animationData.fonts) {
				fonts.addFonts(animationData.fonts.list);
			}
			timing.setTime(animationData.ip, animationData.op, animationData.fr)
			property.setFrameRate(animationData.fr);
			property.setTimeCap(animationData.op);
			_composition = compositionFactory(_animationData, _animationData.assets)
			.setTimeOffset(-_animationData.ip)
			.setWorkAreaOffset(_animationData.ip)
			.processData();
			resolve();
		})
		return promise;
	}

	return  {
		exportNode: exportNode,
		createTargets: createTargets,
		processAnimation: processAnimation
	}
}

module.exports = svg;