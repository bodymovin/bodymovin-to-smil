'use strict';

var xml = require('xml');
var fs = require('fs');
var node = require('./node');
var svgFactory = require('./svg/svg');
var config = require('./config');

 module.exports = function(animation) {
 	return new Promise(function(resolve, reject){
 		var targets = [];
	 	//
	 	var _svg = svgFactory();
	 	_svg.processAnimation(animation)
	 	.then(_svg.exportNode)
	 	.then(function(svgNode){
	 		var format = config.xml_formatted ? '   ' : '';
 			var xmlString = xml(svgNode, format);
 			resolve(xmlString);

	 	}).catch(function(err){
	 		console.log(err.stack)
	 		reject(err.stack);
	 	});
	 	//
	 })
 };