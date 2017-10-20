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
		currentName = name + naming.TRANSFORM_NAME + '_' + + nodes.length;
		container = node.createNode('g', currentName);
	}
	nodes.push(container);

	function addToTransform( value) {
		transformChain =  value + ' ' + transformChain;
		//transformChain =  transformChain + ' ' + value;
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
				animatedProperty = property.createAnimatedProperty(currentName, 'position', transform.p.k, timeOffset);
				targets.addTarget(animatedProperty);
		} else {
			addToTransform('translate(' + transform.p.k[0] + ', ' + transform.p.k[1] + ')');
		}
	}
	if (hasAnimation) {
		if (transform.r.a === 1) {
			animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
		targets.addTarget(animatedProperty);
		} else if(transform.r.k !== [0]){
			animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, 'rotate', transform.r.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
	} else if (transform.r.a === 1) {
		hasAnimation = true;
		animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
		targets.addTarget(animatedProperty);
	} else {
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
	} else {
		addToTransform('scale(' + transform.s.k[0]/100 + ', ' + transform.s.k[1]/100 + ')');
	}

	if (needsTransform) {
		if (hasAnimation) {
			if (transform.a.a === 1) {
				animatedProperty = property.createAnimatedProperty(currentName, '-anchor', transform.a.k, timeOffset);
			} else {
				animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, '-anchor', transform.a.k, timeOffset);
			}
			targets.addTarget(animatedProperty);
		} else if (transform.a.a === 1) {
				hasAnimation = true;
				animatedProperty = property.createAnimatedProperty(currentName, '-anchor', transform.a.k, timeOffset);
				targets.addTarget(animatedProperty);
		} else {
			addToTransform('translate(' + -transform.a.k[0] + ', ' + -transform.a.k[1] + ')');
		}
	}

	/*var hasAnchorAnimated = transform.a.a === 1
	if (hasAnchorAnimated) {
		animatedProperty = property.createAnimatedProperty(currentName, '-anchor', transform.a.k, timeOffset);
		targets.addTarget(animatedProperty);
	} else {
		addToTransform('translate(' + -transform.a.k[0] + ', ' + -transform.a.k[1] + ')');
	}
	if (hasAnchorAnimated) {
		if (transform.s.a === 1) {
			animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
		} else {
			animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, 'scale', transform.s.k, timeOffset);
		}
		targets.addTarget(animatedProperty);
		if (transform.r.a === 1) {
			animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
		} else {
			animatedProperty = property.createAnimatedPropertyFromStaticValue(currentName, 'rotate', transform.r.k, timeOffset);
		}
		targets.addTarget(animatedProperty);
		animatedProperty = property.createAnimatedProperty(currentName, 'anchor', transform.a.k, timeOffset);
		targets.addTarget(animatedProperty);
	}*/
	/* if(!isPositionAnimated(transform.p) && transform.a.a === 0) {
		positionX = getPositionX(transform.p);
		positionY = getPositionY(transform.p);
		if(transform.r.a === 1 || transform.r.k !== 0 || transform.s.a === 1 || transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
			if(transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
				addToTransform('translate(' + -transform.a.k[0] + ', ' + -transform.a.k[1] + ')');
				//node.addAttribute(container,'android:pivotX', transform.a.k[0]);
			}
			if(transform.s.a === 1 || transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
				if(transform.s.a === 0) {
					if(transform.s.k[0] !== 100 || transform.s.k[1] !== 100) {
						//node.addAttribute(container,'android:scaleX', transform.s.k[0]/100);
						addToTransform('scale(' + transform.s.k[0]/100 + ', ' + transform.s.k[1]/100 + ')');
					}
				}else {
					//node.addAttribute(container,'android:scaleX', transform.s.k[0].s[0]/100);
					//node.addAttribute(container,'android:scaleY', transform.s.k[0].s[1]/100);
					addToTransform('scale(' + transform.s.k[0].s[0]/100 + ', ' + transform.s.k[0].s[1]/100 + ')');
					animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
					targets.addTarget(animatedProperty);
				}
			}
			if(transform.r.a === 1 || transform.r.k !== 0) {
				if(transform.r.a === 0) {
					if(transform.r.k !== 0) {
						addToTransform('rotate(' + transform.r.k + ')');
						//node.addAttribute(container,'android:rotation', transform.r.k);
					}
				} else {
					addToTransform('rotate(' + transform.r.k[0].s + ')');
					//node.addAttribute(container,'android:rotation', transform.r.k[0].s);
					animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
					targets.addTarget(animatedProperty);
				}
			}
			if(transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
				addToTransform('translate(' + transform.a.k[0] + ', ' + transform.a.k[1] + ')');
				//node.addAttribute(container,'android:pivotX', transform.a.k[0]);
			}
		}
		if(positionX - transform.a.k[0] !== 0 || positionY - transform.a.k[1] !== 0) {
			addToTransform('translate(' + (positionX - transform.a.k[0]) + ', ' + (positionY - transform.a.k[1]) + ')');
		}
	} else {
		if(transform.a.a !== 0 || transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
			if (transform.a.a === 1) {
				animatedProperty = property.createAnimatedProperty(currentName, 'anchor', transform.a.k, timeOffset);
				targets.addTarget(animatedProperty);
				//node.addAttribute(container,'android:translateX', -transform.a.k[0].s[0]);
				//node.addAttribute(container,'android:translateY', -transform.a.k[0].s[1]);
				addToTransform('translate(' + -transform.a.k[0].s[0] + ', ' + -transform.a.k[0].s[1] + ')');
			} else if(transform.a.k[0] !== 0 || transform.a.k[1] !== 0) {
				if(transform.a.k[0] !== 0) {
					addToTransform('translate(' + -transform.a.k[0] + ', ' + -transform.a.k[1] + ')');
				}
			}
			//var anchorGroupName = name + '_pivot';
			container = null;
			//var anchorContainer = node.createNode('group', anchorGroupName);
			//node.nestChild(anchorContainer, container);
			//container = anchorContainer;
			//name = anchorGroupName;
		}
		if(transform.p){
			var positionXAnimatedFlag = isPositionXAnimated(transform.p);
			var positionYAnimatedFlag = isPositionYAnimated(transform.p);
			if(!positionXAnimatedFlag && !positionYAnimatedFlag) {
				positionX = getPositionX(transform.p);
				positionY = getPositionY(transform.p);
				if(positionX !== 0 || positionY !== 0) {
					addToTransform('translate(' + positionX + ', ' + positionY + ')');
				}
			} else if(!transform.p.s){
				//addToTransform('translate(' + transform.p.k[0].s[0] + ', ' + transform.p.k[0].s[1] + ')');
				animatedProperty = property.createAnimatedProperty(currentName, 'position', transform.p.k, timeOffset);
				targets.addTarget(animatedProperty);
			} else {
				if (!positionXAnimatedFlag) {
					positionX = getPositionX(transform.p);
					if(positionX !== 0) {
						addAttributeToContainer('android:translateX', positionX);
					}
				} else {
					addAttributeToContainer('android:translateX', transform.p.x.k[0].s);
					animatedProperty = property.createAnimatedProperty(currentName, 'positionX', transform.p.x.k, timeOffset);
					targets.addTarget(animatedProperty);
				}
				if (!positionYAnimatedFlag) {
					positionY = getPositionY(transform.p);
					if(positionY !== 0) {
						addAttributeToContainer('android:translateY', positionY);
					}
				} else {
					addAttributeToContainer('android:translateY', transform.p.y.k[0].s);
					animatedProperty = property.createAnimatedProperty(currentName, 'positionY', transform.p.y.k, timeOffset);
					targets.addTarget(animatedProperty);
				}
			}
			
		}
		if(transform.s.a === 0) {
			if(transform.s.k[0] !== 100) {
				//node.addAttribute(container,'android:scaleX', transform.s.k[0]/100);
				addAttributeToContainer('android:scaleX', transform.s.k[0]/100);
			}
			if(transform.s.k[1] !== 100) {
				//node.addAttribute(container,'android:scaleY', transform.s.k[1]/100);
				addAttributeToContainer('android:scaleY', transform.s.k[1]/100);
			}
		}else {
			//node.addAttribute(container,'android:scaleX', transform.s.k[0].s[0]/100);
			//node.addAttribute(container,'android:scaleY', transform.s.k[0].s[1]/100);
			addAttributeToContainer('android:scaleX', transform.s.k[0].s[0]/100);
			addAttributeToContainer('android:scaleY', transform.s.k[0].s[1]/100);
			animatedProperty = property.createAnimatedProperty(currentName, 'scale', transform.s.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
		if(transform.r.a === 0) {
			if(transform.r.k !== 0) {
				//node.addAttribute(container,'android:rotation', transform.r.k);
				addToTransform('rotate(' + transform.r.k + ')');
			}
		} else {
			//node.addAttribute(container,'android:rotation', transform.r.k[0].s);
			addAttributeToContainer('android:rotation', transform.r.k[0].s);
			animatedProperty = property.createAnimatedProperty(currentName, 'rotate', transform.r.k, timeOffset);
			targets.addTarget(animatedProperty);
		}
	} */
	return nodes;
}

module.exports = createTransformGroup;