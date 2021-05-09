var node = require ('../node');
var _targets = [];

function resetTargets(){
	_targets.length = 0;
}

function addTarget(target){
	var firstLeave = node.getLastLeaves(target)[0];
	if (node.getTagName(firstLeave) === 'set') {
		return;
	}
	_targets.push(target);
}

function getTargetByNameAndProperty(name, property) {
	var i = 0, len = _targets.length;
	while(i < len) {
		if(node.getAttribute(_targets[i], 'id') === name) {
			var aapt_attr = node.getChild(_targets[i], 'aapt:attr');
			var set = node.getChild(aapt_attr, 'set');
			var objectAnimator = node.getChild(set, 'objectAnimator');
			if(node.getAttribute(objectAnimator, 'android:propertyName') === property) {
				return _targets[i];
			}
		}
		i += 1;
	}
	return null;
}

function buildTargets(defs) {
	var target;
	var i, len = _targets.length;
	for(i = 0; i < len; i += 1) {
		target = _targets[i];
		node.nestChild(defs, target);
	} 
}

module.exports = {
	resetTargets: resetTargets,
	addTarget: addTarget,
	getTargetByNameAndProperty: getTargetByNameAndProperty,
	buildTargets: buildTargets,
};