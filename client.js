

var Client = require('node-xmpp-client');
var accounts = require('./secrets.json');
var lookup = require('./xepLookup.json');
var _ = require('underscore');
var Create = require('./create.js');
var fs = require('fs');

var streamFeaturesKey = 'streamFeatures';
var discoFeaturesKey = 'capabilityFeatures';
var softwareNameKey = 'softwareName';
var softwareVersionKey = 'softwareVersion';

var NS_XMPP_DISCO = 'http://jabber.org/protocol/disco#info';
var NS_XMPP_VERSION = 'jabber:iq:version';

var results = {};
var clients = [];

var timeoutObject;

for (var index in accounts) {
	var account = accounts[index];
	getCapabilities(account.username,account.password);
}

function getCapabilities(jid, password) {
	console.log("Starting: "+jid)
	var client = new Client({
		jid: jid,
		password: password
	});

	clients.push(client);

	client.on('error',function(error) {
		console.error(error)
	})

	client.connection.socket.on('error', function(error) {
		console.log(client.jid.domain)
    	console.error(error)
	})

	client.on('online', function(dict) {
		console.log('online ' + dict.jid);
		//Check Stream Features
		handleStreamFeatures(client.streamFeatures,dict.jid);

		//Send discovery request
		client.send( new Client.Stanza.Element('iq',{type: 'get',to : dict.jid.domain, from : dict.jid, id : 'disco1'}).c('query', { xmlns: NS_XMPP_DISCO }));
		client.send( new Client.Stanza.Element('iq',{type: 'get',to : dict.jid.domain, from : dict.jid, id : 'version1'}).c('query', { xmlns: NS_XMPP_VERSION }));
	});

	client.on('stanza', function(stanza) {

		if(stanza.attrs['id'] == 'disco1') {
			var discoElement = stanza.getChild('query', NS_XMPP_DISCO);
			var features = discoElement.getChildren('feature');
			handleDiscoFeatures(features, client.jid);
		}
		if(stanza.attrs['id'] == 'version1') {
			var queryStanza = stanza.getChild('query', NS_XMPP_VERSION);
			if (queryStanza) {
				var nameStanza = queryStanza.getChild('name');
				var versionStanza = queryStanza.getChild('version');
				var name;
				var version;
				if (nameStanza) {
					name = nameStanza.getText();
				}
				if (versionStanza) {
					version = versionStanza.getText();
				}

				handleSoftwareVersion(name, version, client.jid.domain);
			}
		}


		//If we don't revieve a timeout for 5 seconds we're finished
		if (timeoutObject) {
			clearTimeout(timeoutObject);
		}
		
		timeoutObject = setTimeout(function() {
			writeJsonToFile(results,'./results.json', function(error){
					disconnectAllClients();
				});
		}, 10000);

	});

}

function writeJsonToFile(json, filePath,callback) {
	fs.writeFile(filePath, JSON.stringify(json, null, 4), callback);
}

function disconnectAllClients()
{
	for(var index in clients) {
		client = clients[index];
		//client.disconnect();
		process.exit(1);
	}
}

function handleStreamFeatures(streamFeatures, jid) {
	for(var index in streamFeatures.children) {
		var feature = streamFeatures.children[index];
		var featureName = feature.attrs.xmlns;

		foundStreamFeature(featureName,jid.domain);
	}
}

function foundStreamFeature(feature, domain) {
	if (!results[domain]) {
			results[domain] = {};
		}

	if (feature && domain) {
		if (results[domain][streamFeaturesKey]) {
			if (results[domain][streamFeaturesKey].indexOf(feature) < 0) {
				results[domain][streamFeaturesKey].push(feature);
			}
		}
		else {
			results[domain][streamFeaturesKey] = [feature];
		}
	}
}

function handleDiscoFeatures (features, jid) {
	
	for(var index in features) {
		var feature = features[index];
		var featureName = feature.attrs.var;
		
		foundDicoFeature(featureName,jid.domain);
	}
}

function foundDicoFeature(feature, domain) {
	if (feature && domain) {
		if (!results[domain]) {
			results[domain] = {};
		}

		if (results[domain][discoFeaturesKey]) {
			if (results[domain][discoFeaturesKey].indexOf(feature) < 0) {
				results[domain][discoFeaturesKey].push(feature);
			}
		}
		else {
			results[domain][discoFeaturesKey] = [feature];
		}
	}
}

function handleSoftwareVersion (name, version, domain) {
	if (!results[domain]) {
			results[domain] = {};
		}


	if (name) {
		results[domain][softwareNameKey] = name;
	}

	if (version) {
		results[domain][softwareVersionKey] = version;
	}
}

function lookupFeature (feature) {
	if (feature.length > 0) {
		var featureCode = lookup[feature];
		if (featureCode) {
			return featureCode;
		} else{

			//Remove # if exists
			varHashIndex = feature.indexOf('#');
			if (varHashIndex > -1) {
				return lookupFeature(feature.substring(0,varHashIndex));
			}
			//remvoe version numbers ex urn:xmpp:sm:2 → urn:xmpp:sm
			else {
				return lookupFeature(feature.split(':',feature.split(':').length - 1).join(':'));
			}
		}
	}
}



