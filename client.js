

var Client = require('node-xmpp-client');
var accounts = require('./secrets.json');
var lookup = require('./xepLookup.json');
var _ = require('underscore');
var Create = require('./create.js');

var NS_XMPP_DISCO = 'http://jabber.org/protocol/disco#info';

var results = {};
var clients = [];

var finished = 0;

for (var index in accounts) {
	var account = accounts[index];
	getCapabilities(account.username,account.password);
}

function getCapabilities(jid, password) {
	var client = new Client({
		jid: jid,
		password: password
	});

	clients.push(client);

	client.on('online', function(dict) {
		console.log('online ' + dict.jid);
		//Check Stream Features
		handleStreamFeatures(client.streamFeatures,dict.jid);

		//Send discovery request
		client.send( new Client.Stanza.Element('iq',{type: 'get',to : dict.jid.domain, from : dict.jid, id : 'disco1'}).c('query', { xmlns: NS_XMPP_DISCO }));
	});

	client.on('stanza', function(stanza){
		if(stanza.attrs['id'] == 'disco1') {
			var discoElement = stanza.getChild('query', NS_XMPP_DISCO);
			var features = discoElement.getChildren('feature');
			handleDiscoFeatures(features, client.jid);
			finished += 1;
			if (finished == accounts.length) {
				console.log(results);
				Create.createPage(results);
				disconnectAllClients();

			}
		}
	});

}

function disconnectAllClients()
{
	for(var index in clients) {
		client = clients[index];
		//client.disconnect();
	}
}

function foundFeatureCode(featureCode, domain) {
	if (featureCode && domain) {
		if (results[domain]) {
			if (results[domain].indexOf(featureCode) < 0) {
				results[domain].push(featureCode);
			}
			
		}
		else {
			results[domain] = [featureCode];
		}
	}
}


function handleStreamFeatures(streamFeatures, jid) {
	for(var index in streamFeatures.children) {
		var feature = streamFeatures.children[index];
		var featureName = feature.attrs.xmlns;
		var code = lookupFeature(featureName);
		if (!code){
			console.log("Cannot find: ",featureName);
		}
		else {
			foundFeatureCode(code,jid.domain);
		}
	}
}

function handleDiscoFeatures (features, jid) {
	
	for(var index in features) {
		var feature = features[index];
		var featureName = feature.attrs.var;
		var code = lookupFeature(featureName);

		if (!code) {
			console.log("Cannot find: "+featureName);
		}
		else {
			foundFeatureCode(code,jid.domain);
		}
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



