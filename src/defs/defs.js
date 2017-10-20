var node = require ('../node');
var _definitions = [];

function resetDefinitions(){
	_definitions.length = 0;
}

function addDefinition(def){
	_definitions.push(def);
}

function buildDefinitions(avd) {
	var target;
	var i, len = _targets.length;
	for(i = 0; i < len; i += 1) {
		target = _targets[i];
		node.nestChild(avd, target);
	} 
}

module.exports = {
	resetDefinitions: resetDefinitions,
	addDefinition: addDefinition,
	buildDefinitions: buildDefinitions
};