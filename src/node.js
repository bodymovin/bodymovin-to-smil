 function createNodeWithAttributes(tagName, attributes, name) {
 	var node = createNode(tagName, name);
 	var i, len = attributes.length;
 	for(i = 0; i < len; i += 1) {
 		addAttribute(node, attributes[i].key, attributes[i].value);
 	}
 	return node;
 }

 function isArray(element) {
 	var what = Object.prototype.toString;
 	return what.call(element)  === '[object Array]';
 }

 function createNode(tagName, name) {
 	var node = {};
 	Object.defineProperty(node, tagName, {
	  value: { _attr: {} },
	  writable: true,
	  enumerable: true,
	  configurable: true
	});
 	if(name) {
 		addAttribute(node, 'id', name);
 	}
 	return node; 
 }

 function addAttribute(object, key, value) {
 	var tagName = getTagName(object);
 	var children = getChildren(object);
 	if(isArray(children)){
 		var i = 0, len = children.length;
	 	var attrsContainer;
	 	while(i < len) {
	 		if(children[i]._attr) {
	 			attrsContainer = children[i];
	 			break;
	 		}		
	 		i += 1;
	 	}
	 } else {
	 	attrsContainer = children;
	 }
 	
 	if (!attrsContainer) {
 		attrsContainer = {_attr:{}};
 		object[tagName] = attrsContainer;
 	}
 	attrsContainer._attr[key] = value;
 }

 function getTagName(nodeElem) {
 	var keys = Object.keys(nodeElem);
 	return keys[0];
 }

 function getAttribute(nodeElem, key) {
 	var children = getChildren(nodeElem);
 	if(isArray(children)){
	 	var i =0, len = children.length;
	 	while(i < len) {
	 		if(children[i]._attr && children[i]._attr[key]) {
	 			return children[i]._attr[key];
	 		}
	 		i += 1;
	 	}
	} else if(children._attr && children._attr[key]) {
		return children._attr[key];
	}
 	return '';
 }

function getChildren(nodeElem) {
 	var nodeTagName = getTagName(nodeElem);
 	var children = nodeElem[nodeTagName];
 	return children;
}

 function getChild(nodeElem, childName) {
 	var children = getChildren(nodeElem);
 	if(isArray(children)){
	 	var i =0, len = children.length, tagName;
	 	while(i < len) {
	 		tagName = getTagName(children[i]);
	 		if(tagName === childName) {
	 			return children[i];
	 		}
	 		i += 1;
	 	}
	}
	return '';
 }

 function nestChild(nodeElem, nested) {
 	if(!nested) {
 		return;
 	}
 	var tagName = getTagName(nodeElem);
 	if(!isArray(nodeElem[tagName])){
 		var attrs = nodeElem[tagName];
 		nodeElem[tagName] = [attrs];
 	}
 	nodeElem[tagName].push(nested);
 }

 function cloneNode(node, targets, suffix) {
 	var cloningNode = JSON.parse(JSON.stringify(node));
 	renameNode(cloningNode, targets, suffix);
 	return cloningNode;
 }

 function renameNode(nodeElem, targets, suffix) {
 	var children = getChildren(nodeElem);
 	if(children && isArray(children)) {
	 	var i, len = children.length;
	 	for( i = 0; i < len; i += 1) {
	 		renameNode(children[i], targets, suffix);
	 	}
 	}
 	var androidName = getAttribute(nodeElem, 'id');
 	if(androidName) {
 		duplicateTargets(targets, androidName, androidName + suffix);
 		addAttribute(nodeElem, 'id', androidName + suffix);
 	}
 }

 function duplicateTargets(targets, name, newName) {
 	var i, len = targets.length, newTarget;
 	for( i = 0 ; i < len; i += 1) {
 		if(targets[i].target[0]._attr['id'] === name) {
 			newTarget = JSON.parse(JSON.stringify(targets[i]));
 			newTarget.target[0]._attr['id'] = newName;
 			targets.push(newTarget);
 		}
 	}
 }

 function nestArray(array) {
 	var i, len = array.length;
 	for(i = 1; i < len; i += 1) {
 		nestChild(array[i],array[i - 1]);
 	}
 	return array[array.length - 1];
 }

 function getLastLeaves(node) {
 	var leaves = [];
 	var children = getChildren(node);
 	var hasChildren = false;
 	if(children && isArray(children)) {
 		var i, len = children.length, tagName;
 		for(i = 0; i < len; i += 1) {
 			tagName = getTagName(children[i]);
 			if (tagName !== '_attr') {
 				hasChildren = true;
 				leaves = leaves.concat(getLastLeaves(children[i]));
 			}
 		}
 	}
 	if(!hasChildren) {
 		leaves.push(node);
 	}
 	return leaves;
 }

 module.exports = {
 	createNode: createNode,
 	createNodeWithAttributes: createNodeWithAttributes,
 	addAttribute: addAttribute,
 	getTagName: getTagName,
 	getAttribute: getAttribute,
 	nestChild: nestChild,
 	nestArray: nestArray,
 	getChild: getChild,
 	getChildren: getChildren,
 	getLastLeaves: getLastLeaves,
 	cloneNode: cloneNode
 }