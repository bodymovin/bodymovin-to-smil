var fontFamilies = []

function addFont(fontData) {
	fontFamilies.push(fontData);
}

function addFonts(fontList) {
    var i, len = fontList.length;
    for(i = 0; i < len; i += 1) {
    	addFont(fontList[i]);
    }
}

function getFontDataByName(name) {
	var i = 0, len = fontFamilies.length;
	while(i < len) {
		if(fontFamilies[i].fName === name) {
			return fontFamilies[i];
		}
	}
	return {
		fFamily: '',
		fStyle: ''
	}
}

function getFontFamily(name) {
	var fontData = getFontDataByName(name);
	return fontData.fFamily;
}

function getFontWeight(name) {
	var fontData = getFontDataByName(name);
	return fontData.fStyle;
}

module.exports = {
	addFonts: addFonts,
	addFont: addFont,
	getFontFamily: getFontFamily,
	getFontWeight: getFontWeight
}