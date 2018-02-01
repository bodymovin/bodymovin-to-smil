# bodymovin-to-smil
Bodymovin to SMIL converter

## First version of bodymovin to SMIL
It supports basic animations:
- masks (additive and intersect)
- shapes
- solids
- texts
- precomps
- transforms
- opacity

### Usage
````javascript
var smil_converter = require('bodymovin-to-smil');
var fs = require('fs');

fs.readFile("./data.json",  "utf8",  function(error, data){
	if(data) {
		smil_converter(JSON.parse(data))
		.then(function(xml){
			fs.writeFile("./animation.svg", xml, function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			}); 
		}).catch(function(err){
		 		console.log(err);
	 	});
	}
})

````

### Keep in mind that not all browsers support SMIL
