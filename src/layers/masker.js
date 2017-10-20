var naming = require ('../naming');
var node = require ('../node');
var targets = require ('../targets/targets');
var property = require ('../property');
var createPathData = require ('../pathData');

function masker(state) {
	var masks = [];
	var maskCount = 0, nestCount = 0;
	var hasAnimatedProp = false;
	var currentMaskData = {
		type:'',
		currentPaths: []
	};
	var clipName,containerGroup,animatedProp;
	var clipPathString = '';
	var masksList = [];

	function buildMask(path) {
		if(!path) {
			return;
		}
		var clipPath = node.createNode('clipPath', clipName);
		node.addAttribute(clipPath,'id', clipName);
		var pathNode = node.createNode('path');
		node.nestChild(clipPath, pathNode);
		node.addAttribute(pathNode,'d', path);
		targets.addTarget(clipPath);
		if (currentMaskData.type === 'i') {
			var i, len = masksList.length;
			for (i = 0; i < len; i += 1) {
				node.nestChild(clipPath, masksList[i]);
			}
			masksList.length = 0;
		} else if (currentMaskData.type === 'a') {
			if(masksList.length) {
				var grouperContainer = node.createNode('g', clipName + naming.GROUP_NAME + maskCount);
				node.nestChild(grouperContainer, masksList[masksList.length - 1]);
				masksList[masksList.length - 1] = grouperContainer;
			}
		}
		masksList.push(clipPath);

		animatedProp = null;
		nestCount = 0;
		clipPathString = '';

		return clipPath;

	}

	function buildPreviousMaskGroup(name){
		if(!currentMaskData.type){
			return;
		}
		if(!containerGroup){
			containerGroup = node.createNode('g', name + naming.GROUP_NAME);
		}
		var paths = currentMaskData.currentPaths;
		var i, len = paths.length, j, jLen;
		var currentClipPathString = '';
		var animatedProp, prevNode, maskNode;
		clipName = name + naming.CLIP_NAME + '_' + maskCount;
		for (i = 0; i < len; i+= 1) {
			if (paths[i].type === 'i') {
				if (paths[i].pt.a === 1) {
					animatedProp = property.createAnimatedPathData(clipName, paths[i].pt.k, null, clipPathString, state.timeOffset);
					targets.addTarget(animatedProp);
					clipPathString += ' ' + createPathData(paths[i].pt.k[0].s[0], null);
				} else {
					clipPathString += ' ' + createPathData(paths[i].pt.k, null);
				}
			} else if (paths[i].type === 'a') {
				if (paths[i].pt.a === 1) {
					animatedProp = property.createAnimatedPathData(clipName, paths[i].pt.k, null, clipPathString, state.timeOffset);
					targets.addTarget(animatedProp);
					clipPathString += ' ' + createPathData(paths[i].pt.k[0].s[0], null);
				} else {
					currentClipPathString = createPathData(paths[i].pt.k, null);
					if(animatedProp) {
						var aaptAttr = node.getChild(animatedProp,'aapt:attr');
						var setProp = node.getChild(aaptAttr,'set');
						var setChildren = node.getChildren(setProp);
						jLen = setChildren.length;
						var objectAnimator, value;
						for(j = 0; j < jLen; j += 1) {
							value = node.getAttribute(setChildren[j],'android:valueFrom');
							if(value) { 
								node.addAttribute(setChildren[j],'android:valueFrom', value + currentClipPathString);
								value = node.getAttribute(setChildren[j],'android:valueTo');
								node.addAttribute(setChildren[j],'android:valueTo', value + currentClipPathString);
							}
						}
					}
					clipPathString += ' ' + currentClipPathString;
				}
			}
		}
		buildMask(clipPathString);
		/*maskNode = buildMask(clipPathString);
		if(maskNode) {
			if(prevNode) {
				node.nestChild(maskNode, prevNode);
			}
			prevNode = maskNode;
		}*/
		//var grouperContainer = node.createNode('group', name + naming.GROUP_NAME + maskCount);
		//node.nestChild(grouperContainer, prevNode);
		//node.nestChild(containerGroup, grouperContainer);
		currentMaskData.type = '';
		currentMaskData.currentPaths.length = 0;
		hasAnimatedProp = false;
		maskCount += 1;
	}

	function getMasks(name) {
		maskCount = 0
		var totalMasks = [];
		var masksProperties = state.layerData.masksProperties;
		if(masksProperties) {
			var i, len = masksProperties.length, maskProp;
			for (i = 0; i < len; i += 1) {
				maskProp = masksProperties[i];
				if (!maskProp.inv) {
					if (maskProp.mode === 'a') {
						if(currentMaskData.type !== 'a' && currentMaskData.type !== '' || (maskProp.pt.a === 1 && hasAnimatedProp)){
							buildPreviousMaskGroup(name);
						}
						currentMaskData.type = 'a';
						if (maskProp.pt.a === 1) {
							hasAnimatedProp = true;
						}
						currentMaskData.currentPaths.push({pt:maskProp.pt, type:'a'});
					} else if (maskProp.mode === 'i') {
						if(currentMaskData.type !== ''){
							buildPreviousMaskGroup(name);
						}
						currentMaskData.type = 'i';
						currentMaskData.currentPaths.push({pt:maskProp.pt, type:'i'});
					}
				}
			}
			buildPreviousMaskGroup(name);
			if(masksList.length) {
				len = masksList.length;
				for (i = 0; i < len; i += 1) {
					node.nestChild(containerGroup, masksList[i]);
				}
			}
		}
		return maskCount;
	}

	return {
		getMasks: getMasks
	}
}

module.exports = masker;