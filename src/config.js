var long_config = {
	naming: 'long',
	xml_formatted: true
}

var short_config = {
	naming: 'short',
	xml_formatted: false
}

var config;
if(process.env.ENVIRONMENT === 'DEV') {
	config = long_config;
} else {
	config = short_config;
}

module.exports = config