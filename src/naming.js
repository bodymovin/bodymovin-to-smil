var config = require('./config')

var long_naming = {
	GROUP_NAME: '_GROUP',
	TRANSFORM_NAME: '_TRANSFORM',
	LAYER_NAME: '_LAYER',
	DRAWABLE_NAME: '_DRAWABLE',
	PATH_NAME: '_PATH',
	ROOT_NAME: '_ROOT',
	PARENT_NAME: '_PARENT',
	CLIP_NAME: '_CLIP',
	SOLID_NAME: '_SOLID',
	TIME_NAME: '_TIME',
	TEXT_NAME: '_TEXT',
	TEXT_SPAN_NAME: '_TEXT_SPAN'
}
var short_naming = {
	GROUP_NAME: '_G',
	TRANSFORM_NAME: '_T',
	LAYER_NAME: '_L',
	DRAWABLE_NAME: '_D',
	PATH_NAME: '_P',
	ROOT_NAME: '_R',
	PARENT_NAME: '_N',
	CLIP_NAME: '_C',
	SOLID_NAME: '_S',
	TIME_NAME: '_M',
	TEXT_NAME: '_X',
	TEXT_SPAN_NAME: '_A'
}

var naming = config.naming === 'short' ? short_naming : long_naming

module.exports = naming