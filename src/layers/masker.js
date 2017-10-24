var naming = require ('../naming');
var node = require ('../node');
var targets = require ('../targets/targets');
var property = require ('../property');
var createPathData = require ('../pathData');

function masker(state) {
	var masks = [];
	var maskCount = 0;
	var currentMaskData = {
		type:'',
		currentPaths: []
	};
	var clipName;
	var rootMasks = [];

	function buildMask(path, clipName, pathName, clipPathNode) {
		if(!clipPathNode) {
			clipPathNode = node.createNode('clipPath', clipName);
			node.addAttribute(clipPathNode,'id', clipName);
		}
		var pathNode = node.createNode('path', pathName);
		node.addAttribute(pathNode,'fill-rule','nonzero');
		node.nestChild(clipPathNode, pathNode);
		if(path) {
			node.addAttribute(pathNode,'d', path);
		}

		return clipPathNode;

	}

	function buildPreviousMaskGroup(){
		if(!currentMaskData.type){
			return;
		}
		var paths = currentMaskData.currentPaths;
		var i, len = paths.length, j, jLen;
		var clipName;
		var animatedProp, prevNode, maskNode;
		var pathName = clipName + naming.PATH_NAME;
		var clipPath;
		var clipPathString = '';
		for (i = 0; i < len; i+= 1) {
			if(i === 0) {
				clipName = paths[i].name;
			}
			pathName = clipName + naming.PATH_NAME + '_' + i;
			if (paths[i].pt.a === 1) {
				animatedProp = property.createAnimatedPathData(pathName, paths[i].pt.k, null, clipPathString, state.timeOffset);
				targets.addTarget(animatedProp);
			} else {
				clipPathString = createPathData(paths[i].pt.k, null);
			}
			clipPath = buildMask(clipPathString, clipName, pathName, clipPath);
			clipPathString = '';
		}
		targets.addTarget(clipPath);
		currentMaskData.currentPaths.length = 0;
		return clipPath;
	}

	function getMasks(name) {
		maskCount = 0;
		var previousClip = null;
		var masksProperties = state.layerData.masksProperties;
		var maskName = '';
		if(masksProperties) {
			var i, len = masksProperties.length, maskProp;
			for (i = 0; i < len; i += 1) {
				maskProp = masksProperties[i];
				maskName = name + naming.CLIP_NAME + '_' + maskCount;
				if (!maskProp.inv) {
					if (maskProp.mode === 'a') {
						if(currentMaskData.type !== 'a') {
							rootMasks.push(maskName);
							currentMaskData.type = 'a';
						}
						currentMaskData.currentPaths.push({pt:maskProp.pt, type:'a', name: maskName});
					} else if (maskProp.mode === 'i') {
						if(currentMaskData.type === 'a') {
							previousClip = buildPreviousMaskGroup();
						} else if(currentMaskData.type === '') {
							rootMasks.push(maskName);
						}
						currentMaskData.type = 'i';

						if(previousClip) {
							node.addAttribute(previousClip, 'clip-path','url(#' + maskName + ')')
						}
						currentMaskData.currentPaths.push({pt:maskProp.pt, type:'i', name: maskName});
						previousClip = buildPreviousMaskGroup(maskName);
					}
					maskCount += 1;
				}
			}
			if(currentMaskData.type === 'a') {
				buildPreviousMaskGroup();
			}
		}
		return rootMasks;
	}

	return {
		getMasks: getMasks
	}
}

module.exports = masker;