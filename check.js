

var results   = require('./results.json');
var xepLookup = require('./xepLookup.json');
var xepName   = require('./xepName.json');


for (var domain in results) {
  var allStreamFeatures = results[domain]["streamFeatures"];
	var features = allStreamFeatures.concat(results[domain]["capabilityFeatures"]);

  features.map(function(item){
    var result = lookupFeature(item,xepLookup);
    if (result) {
      if (result.indexOf("XEP") > -1) {
        var prettyName = xepName[result]
        if (!prettyName) {
          console.log("Could not find name: "+ result);
        }
      }
    } else {
      console.log("Could not find: " + item);
    }

  })

}

function lookupFeature (feature, lookupDict) {
	if (feature) {
		var featureCode = lookupDict[feature];
		if (featureCode) {
			return featureCode;
		} else {
			//Remove # if exists
			varHashIndex = feature.indexOf('#');
			if (varHashIndex > -1) {
				return lookupFeature(feature.substring(0,varHashIndex),lookupDict);
			}
			//remvoe version numbers ex urn:xmpp:sm:2 → urn:xmpp:sm
			else {
				return lookupFeature(feature.split(':',feature.split(':').length - 1).join(':'),lookupDict);
			}
		}
	}
}
