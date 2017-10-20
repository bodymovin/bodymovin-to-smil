var compositionFactory = require ('../layers/composition');
var node = require ('../node');
var naming = require ('../naming');
var property = require ('../property');
var targets = require ('../targets/targets');

function avd(_animationData) {

	var attributes = [{
		key: 'xmlns:android',
		value: 'http://schemas.android.com/apk/res/android'
	},{
		key: 'xmlns:aapt',
		value: 'http://schemas.android.com/aapt'
	}];

	var _composition, animationData;

	function createVectorDrawable(width, height) {
		var attributes = [{
			key: 'android:height',
			value: height + 'dp'
		},{
			key: 'android:width',
			value: width + 'dp'
		},{
			key: 'android:viewportHeight',
			value: height
		},{
			key: 'android:viewportWidth',
			value: width
		}];
		var nodeElement = node.createNodeWithAttributes('vector', attributes, '');
		return nodeElement;
	}

	function createAAPTVectorDrawable() {
		var attributes = [{
			key: 'name',
			value: 'android:drawable'
		}];
		var nodeElement = node.createNodeWithAttributes('aapt:attr', attributes, '');
		return nodeElement;
		//<aapt:attr name="android:drawable">
	}

	function createTimeRangeObject() {
		var name = 'time_group';
		var timeNode = node.createNode('group',name);
		var attributes = [{
			key: 'android:propertyName',
			value: 'translateX'
		},
		{
			key: 'android:duration',
			value: Math.round((animationData.op - animationData.ip)/animationData.fr*1000)
		},
		{
			key: 'android:startOffset',
			value: '0'
		},
		{
			key: 'android:valueFrom',
			value: '0'
		},
		{
			key: 'android:valueTo',
			value: '1'
		},
		{
			key: 'android:valueType',
			value: 'floatType'
		}];
 		var objectAnimator = node.createNodeWithAttributes('objectAnimator', attributes, '');
 		var target = property.createTargetNode(name);
		var aapt = property.createAAPTAnimation();
		node.nestChild(target, aapt);
		var set = property.createSetNode();
		node.nestChild(aapt, set);
		node.nestChild(set, objectAnimator);
		targets.addTarget(target);
		return timeNode;
	}
	

	function exportNode() {
		var promise = new Promise(function(resolve, reject){
			targets.resetTargets();
			var avdElem = node.createNodeWithAttributes('animated-vector', attributes);
			var aaptVectorElem = createAAPTVectorDrawable();
			var vectorElem = createVectorDrawable(animationData.w, animationData.h);
			node.nestChild(aaptVectorElem, vectorElem);
			node.nestChild(avdElem, aaptVectorElem);
			node.nestChild(vectorElem, _composition.exportNode(naming.ROOT_NAME));
			node.nestChild(vectorElem, createTimeRangeObject())
			targets.buildTargets(avdElem);
			resolve(avdElem);
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

module.exports = avd;