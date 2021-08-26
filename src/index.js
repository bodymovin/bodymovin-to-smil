'use strict';

var xml = require('xml');
var fs = require('fs');
var node = require('./node');
var svgFactory = require('./svg/svg');
var config = require('./config');

function convert(animation) {
 	return new Promise(function(resolve, reject){
	 	//
	 	var _svg = svgFactory();
	 	_svg.processAnimation(animation)
	 	.then(_svg.exportNode)
	 	.then(function(svgNode){
	 		var format = config.xml_formatted ? '   ' : '';
 			var xmlString = xml(svgNode, format);
 			resolve(xmlString);

	 	}).catch(function(err){
	 		reject(err.stack);
	 	});
	 	//
	 })
 };
 convert.version = '1.0.10'

 module.exports = convert