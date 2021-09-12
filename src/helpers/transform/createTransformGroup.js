var node = require('../../node');
var property = require('../../property');
var targets = require('../../targets/targets');
var naming = require('../../naming');

function isPositionAnimated(positionProperty) {
	return isPositionXAnimated(positionProperty) || isPositionYAnimated(positionProperty);
}

function isPositionXAnimated(positionProperty) {
	if(positionProperty.s && positionProperty.x.a === 0) {
		return false;
	} else if(!positionProperty.s && positionProperty.a === 0) {
		return false;
	}
	return true;
}

function isPositionYAnimated(positionProperty) {
	if(positionProperty.s && positionProperty.y.a === 0) {
		return false;
	} else if(!positionProperty.s && positionProperty.a === 0) {
		return false;
	}
	return true;
}

function getPositionX(positionProperty) {
	if(positionProperty.s) {
		return positionProperty.x.k;	
	} else {
		return positionProperty.k[0];
	}
}

function getPositionY(positionProperty) {
	if(positionProperty.s) {
		return positionProperty.y.k;	
	} else {
		return positionProperty.k[1];
	}
}

function createTransformGroup(name, transform, timeOffset, _container) {
	var changed = false;
	var nodes =[];
	var currentName = name;
	var container, transformChain = '';
	var positionX, positionY;
	var animatedProperty;

	if(_container) {
		container = _container;
	} else {
		currentName = name + naming.TRANSFORM_NAME + '_' + nodes.length;
		container = node.createNode('g', currentName);
	}
	nodes.push(container);

	function addToTransform( value) {
		transformChain +=  ' ' + value;
		node.addAttribute(container,'transform', transformChain);
		return container;
	}
	var hasAnimation = false;
	var needsTransform = true;

	if (!isPositionAnimated(transform.p) && transform.a.a === 0 && transform.r.a === 0 && transform.s.a === 0) {
		positionX = getPositionX(transform.p);
		positionY = getPositionY(transform.p);
		if(positionX - transform.a.k[0] === 0 && positionY - transform.a.k[1] === 0) {
			needsTransform = false;
		}
	}
	
	if (needsTransform) {
		if (isPositionAnimated(transform.p)) {
				hasAnimation = true;
				// If transform has separate dimensions
				if (transform.p.s) {
					if (transform.p.x.a === 0 || transform.p.y.a === 0) {
						if (transform.p.x.a === 1) {
							animatedProperty = property.createAnimatedProperty(currentName, 'positionX', transform.p.x.k, timeOffset, {coord: transform.p.y.k});
							targets.addTarget(animatedProperty);
						} else {
							animatedProperty = property.createAnimatedProperty(currentName, 'positionY', transform.p.y.k, timeOffset, {coord: transform.p.x.k});
							targets.addTarget(animatedProperty);
						}
					} else {
						animatedProperty = property.createAnimatedProperty(currentName, 'positionX', transform.p.x.k, timeOffset);
						targets.addTarget(animatedProperty);
						var innerName = name + naming.TRANSFORM_NAME + '_' + nodes.length;
						var innerContainer = node.createNode('g', innerName);
						nodes.push(innerContainer);
						container = innerContainer;
						animatedProperty = property.createAnimatedProperty(innerName, 'positionY', transform.p.y.k, timeOffset);
						targets.addTarget(animatedProperty);
					}
				} else {

					animatedProperty = property.createAnimatedProperty(currentName, 'position', transform.p.k, timeOffset);
					targets.addTarget(animatedProperty);
				}
		} else {
			if(transform.p.s) {
				addToTransform('translate(' + transform.p.x.k + ', ' + transform.p.y.k + ')');
			} else {
				addToTransform('translate(' + transform.p.k[0] + ', ' + transform.p.k[1] + ')');
			}
		}
	}
	if (hasAnimation) {
		if (transform.r.a === 1) {
			animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
		targets.addTarget(animatedProperty);
		} else if(transform.r.k !== 0){
			animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, 'rotate', transform.r.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
	} else if (transform.r.a === 1) {
		hasAnimation = true;
		animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
		targets.addTarget(animatedProperty);
	} else if(transform.r.k !== 0){
		addToTransform('rotate(' + transform.r.k + ')');
	}

	if (hasAnimation) {
		if (transform.s.a === 1) {
			animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
			targets.addTarget(animatedProperty);
		} else if (transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
			animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, 'scale', transform.s.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
	} else if (transform.s.a === 1) {
		hasAnimation = true;
		animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
		targets.addTarget(animatedProperty);
	} else if(transform.s.k[0] !== 100 || transform.s.k[1] !== 100){
		addToTransform('scale(' + transform.s.k[0]/100 + ', ' + transform.s.k[1]/100 + ')');
	}

	if (needsTransform) {
		if (hasAnimation) {
			if (transform.a.a === 1) {
				animatedProperty = property.createAnimatedProperty(currentName, '-anchor', transform.a.k, timeOffset);
				targets.addTarget(animatedProperty);
			} else if(transform.a.k[0] !== 0 || transform.a.k[1] !== 0){
				animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, '-anchor', transform.a.k, timeOffset);
				targets.addTarget(animatedProperty);
			}
		} else if (transform.a.a === 1) {
				hasAnimation = true;
				animatedProperty = property.createAnimatedProperty(currentName, '-anchor', transform.a.k, timeOffset);
				targets.addTarget(animatedProperty);
		} else {
			addToTransform('translate(' + -transform.a.k[0] + ', ' + -transform.a.k[1] + ')');
		}
	}

	return nodes;
}

module.exports = createTransformGroup;