'use strict';

var xml = require('xml');
var fs = require('fs');
var node = require('./node');
var avdFactory = require('./avd/avd');
var svgFactory = require('./svg/svg');
var config = require('./config');

function addTargetsToAVD(targets, avd) {
	var target;
	var i, len = targets.length;
	for(i = 0; i < len; i += 1) {
		target = targets[i];
		node.nestChild(avd, target);
	} 
}

function createAnimatedVectorObject() {
	var attributes = [{
		key: 'xmlns:android',
		value: 'http://schemas.android.com/apk/res/android'
	},{
		key: 'xmlns:aapt',
		value: 'http://schemas.android.com/aapt'
	}]
	var nodeElem = node.createNodeWithAttributes('animated-vector', attributes);
	return nodeElem;
}

function createAAPTVectorDrawable(animation, targets) {
	var aapt = node.createNodeWithAttributes('aapt:attr',[{key:'name', value:'android:drawable'}]);
	var vectorDrawable = createVectorDrawable(animation.w, animation.h);
	layer.addLayers(vectorDrawable, animation.layers, animation, targets, 'root_', 0);
	node.nestChild(aapt, vectorDrawable);
	return aapt;
}

function correctTargetsTimes(targets, framerate) {
	var i, len = targets.length;
	var j, jLen;
	var target, aapt_attr, set, setChildren, animator;
	var duration, startOffset;
	for(i = 0; i < len; i += 1) {
		target = targets[i];
		aapt_attr = node.getChild(target, 'aapt:attr');
		set = node.getChild(aapt_attr, 'set');
		setChildren = node.getChildren(set);
		jLen = setChildren.length;
		for(j = 1; j < jLen; j += 1) {
			animator = setChildren[j];
			duration = node.getAttribute(animator, 'android:duration');
			startOffset = node.getAttribute(animator, 'android:startOffset');
			if(duration) {
				node.addAttribute(animator, 'android:duration', Math.round(duration/framerate*1000));
			}
			if(startOffset) {
				node.addAttribute(animator, 'android:startOffset', Math.round(startOffset/framerate*1000));
			}
		}
	} 
}

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

 module.exports = function(animation) {
 	return new Promise(function(resolve, reject){
 		var targets = [];
	 	//
	 	var _avd = svgFactory();
	 	_avd.processAnimation(animation)
	 	.then(_avd.exportNode)
	 	.then(function(avdNode){
	 		var format = config.xml_formatted ? '   ' : '';
 			var xmlString = xml(avdNode, format);
 			resolve(xmlString);

	 	}).catch(function(err){
	 		console.log(err.stack)
	 		reject(err.stack);
	 	});
	 	//
	 })
 };