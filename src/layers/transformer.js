var node = require ('../node');
var naming = require ('../naming');
var createTransformGroup = require ('../helpers/transform/createTransformGroup');

function transformer(state) {
	var transforms = [];

	function transform(transformData) {
		transforms.push(transformData);
	}

	function setSiblings(_siblings) {
		state.siblings = _siblings;
	}

	function getLayerDataByIndex(index) {
		var siblings = state.siblings;
		var i = 0, len = siblings.length;
		while( i < len) {
			if(siblings[i].ind === index) {
				return siblings[i];
			}
			i += 1;
		}
	}

	function buildParenting(parent, group, name, useContainerFlag) {
		if(parent !== undefined) {
			name = name + naming.PARENT_NAME + '_' + parent;
			//var parentGroup = node.createNode('group', name);

			var parentData = getLayerDataByIndex(parent);
			var nestedArray;
			if (useContainerFlag) {
				nestedArray = createTransformGroup(name, JSON.parse(JSON.stringify(parentData.ks)), state.timeOffset, state.frameRate, group);
			} else {
				nestedArray = [group].concat(createTransformGroup(name, JSON.parse(JSON.stringify(parentData.ks)), state.timeOffset, state.frameRate, null));
			}
			var containerParentGroup = node.nestArray(nestedArray);
			containerParentGroup = buildParenting(parentData.parent, containerParentGroup, name, false);

			return containerParentGroup;
		}
		return group;
	}

	return {
		transform: transform,
		buildParenting: buildParenting,
		setSiblings: setSiblings
	}
}

module.exports = transformer;