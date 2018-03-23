var naming = require('../naming');
var node = require ('../node');
var masker = require ('./masker');
var property = require ('../property');
var targets = require ('../targets/targets');
var transformer = require ('./transformer');
var createTransformGroup = require ('../helpers/transform/createTransformGroup');

function layer(state) {

	state.timeOffset = 0;
	state.workAreaOffset = 0;

	function setTimeOffset(_timeOffset) {
		state.timeOffset = _timeOffset;
		return this;
	}

	function setWorkAreaOffset(_workAreaOffset) {
		state.workAreaOffset = _workAreaOffset;
		return this;
	}

	function exportNode(name, parentWorkAreaOffset) {
		var groupName = name + naming.GROUP_NAME;
		var rootMasks = factoryInstance.getMasks(name);
		var gr = node.createNode('g', groupName);
		var subGr;
		if(rootMasks.length) {
			var i, len = rootMasks.length;
			for(i = 0; i < len; i += 1) {
				subGr = node.createNode('g');
				node.addAttribute(subGr, 'clip-path','url(#' + rootMasks[i] + ')')
				node.nestChild(gr, subGr)
				this.createNodeInstance(subGr, groupName + naming.GROUP_NAME + '_' + i);
			}
		} else {
			gr = node.createNode('g', groupName);
			this.createNodeInstance(gr, groupName);
		}
		var parentNode = gr;
		if(state.layerData.ks){

			if (state.layerData.ks.o.a === 1) {
				animatedProperty = property.createAnimatedProperty(groupName, 'opacity', state.layerData.ks.o.k, state.timeOffset);
				targets.addTarget(animatedProperty);
			} else if(state.layerData.ks.o.k !== 100) {
				node.addAttribute(gr,'opacity', state.layerData.ks.o.k*0.01);
			}

			var transformArray = createTransformGroup(groupName, JSON.parse(JSON.stringify(state.layerData.ks)), state.timeOffset, parentNode);
			parentNode = node.nestArray(transformArray);
			var canReuse = false; //Todo find out if parent has not animated properties to reuse
			parentNode = factoryInstance.buildParenting(state.layerData.parent, parentNode, groupName, canReuse);
			parentNode = clipTimeLimits(parentNode, node.getAttribute(parentNode, 'id'), parentWorkAreaOffset);	
			if(state.layerData.cl){
				node.addAttribute(gr,'class',state.layerData.cl)
			}
		}
		return parentNode;
	}

	function clipTimeLimits(group, name, parentWorkAreaOffset) {
		var inPoint = state.globalInPoint;
		var outPoint = state.globalOutPoint + state.timeOffset;
		var layerData = state.layerData;
		var animatedProp;
		var timeCap = property.getTimeCap();
		if(layerData.ip + state.timeOffset > 0 || layerData.op + state.timeOffset + parentWorkAreaOffset < timeCap) {
				name += naming.TIME_NAME;
				var timeGroup = node.createNode('g', name);
				node.nestChild(timeGroup, group);
				group = timeGroup;
				var limits = [];
			if(layerData.ip + state.timeOffset > 0) {
				limits.push({s:[0],e:[0],t:0,o:{x:0,y:0},i:{x:0,y:0}},{s:[0],e:[100],o:{x:0,y:0},i:{x:0,y:0},t:layerData.ip},{s:[100], e:[100],o:{x:0,y:0},i:{x:0,y:0}, t:layerData.ip + 0.0001});
			} else {
				limits.push({s:[100],e:[100],t:0,o:{x:0,y:0},i:{x:0,y:0}});
			}
			if(layerData.op + state.timeOffset + parentWorkAreaOffset < timeCap) {
				limits.push({s:[100],t:layerData.op + parentWorkAreaOffset ,o:{x:0,y:0},i:{x:0,y:0}, e:[0]},{s:[0],e:[0],o:{x:0,y:0},i:{x:0,y:0},t:layerData.op + parentWorkAreaOffset + 0.000001});
			}
			/*if(layerData.op + state.timeOffset + parentWorkAreaOffset < timeCap) {
				limits.push({s:[0],e:[100],t:0},{s:[100], e:[100], t:layerData.ip + state.timeOffset});
			}*/
			//layerData.op + state.timeOffset + parentWorkAreaOffset
			//animatedProp = property.createAnimatedProperty(name, 'opacity', limits, layerData.op + state.timeOffset + parentWorkAreaOffset);
			animatedProp = property.createAnimatedProperty(name, 'opacity', limits, state.timeOffset);
			targets.addTarget(animatedProp);
		}
		return group;
	}

	var factoryInstance = {
		setTimeOffset: setTimeOffset,
		setWorkAreaOffset: setWorkAreaOffset,
		exportNode: exportNode
	}
	return Object.assign(factoryInstance, masker(state), transformer(state));
}

module.exports = layer;
