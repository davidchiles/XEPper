var googleURL = {
	"Google Archive" : "http://xmpp.org/extensions/xep-0136.html",
	"Google Gmail Notifications" : "https://developers.google.com/talk/jep_extensions/gmail",
	"Google Jingle Info" : "https://developers.google.com/talk/jep_extensions/jingleinfo",
	"Google Off the Record" : "https://developers.google.com/talk/jep_extensions/otr",
	//"Google Presence Queue" : "",
	"Google Roster" : "https://developers.google.com/talk/jep_extensions/roster_attributes",
	"Google Settings" : "https://developers.google.com/talk/jep_extensions/usersettings",
	"Google Shared Status" : "https://developers.google.com/talk/jep_extensions/shared_status"
};

var streamFeaturesKey = 'streamFeatures';
var discoFeaturesKey = 'capabilityFeatures';
var softwareNameKey = 'softwareName';
var softwareVersionKey = 'softwareVersion';

function urlForCode(code) {
		var url = 'https://www.google.com/search?q='+encodeURIComponent("\""+code+"\"");
		if (code.substring(0,3) == 'XEP') {
				url = 'http://xmpp.org/extensions/'+code.toLowerCase()+'.html';
		}
		else if(code.substring(0,3) == 'RFC') {
			url = 'https://tools.ietf.org/html/'+code.toLowerCase().replace('-','');
		}
		else if(googleURL[code]) {
			url = googleURL[code];
		}
		return url;
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

function LookupXEPName (xep, lookupDict) {
	var name = lookupDict[xep];
	if (!name) {
		name = xep;
	}
	return name;
}

function allCodes (features ,lookupDict) {
	var codes = [];
	for(var index in features) {
		codes.push(lookupFeature(features[index],lookupDict));
	}
	codes = _.uniq(codes);
	return codes;
}

function createTable(domains, headers, resultsKey, results, tableId, lookupDict) {
	var table = document.createElement('table');
	table.setAttribute("id", tableId);
	table.setAttribute("class", "tablesorter");
	table.setAttribute("cellspacing", "1");
	table.setAttribute("cellpadding", "0");
	table.setAttribute("border", "0");

	//Headers
	var tableHead =  document.createElement('tHead');

	//Domain Header
	var tr = document.createElement('tr');
	var td = document.createElement('th');
	td.setAttribute("class", "header");
	td.appendChild(document.createTextNode('Domain'));
	tr.appendChild(td);

	//other Headers
	for (var i in headers) {
		td = document.createElement('th');
		td.setAttribute("class", "header");
		a = document.createElement('a');
		a.setAttribute('id', 'headerLink');
		a.href = urlForCode(headers[i]);
		a.innerHTML = LookupXEPName(headers[i],lookupDict);
		td.appendChild(a);
		tr.appendChild(td);
	}
	tableHead.appendChild(tr);
	table.appendChild(tableHead);

	var tableBody = document.createElement('tbody');

	for(var index in domains) {
		var domain = domains[index];
		tr = document.createElement('tr');

		td = document.createElement('td');
		td.appendChild(document.createTextNode(domain));
		td.setAttribute('class', 'domainCell');
		tr.appendChild(td);

		for (var idx in headers) {
			code = headers[idx];
			if (results[domain][resultsKey].indexOf(code) > -1) {
				td = document.createElement('td');
				td.setAttribute('class', 'yesCell');
				td.appendChild(document.createTextNode('Yes'));
				tr.appendChild(td);
			} else {
				td = document.createElement('td');
				td.setAttribute('class', 'noCell');
				td.appendChild(document.createTextNode('No'));
				tr.appendChild(td);
			}
		}
		tableBody.appendChild(tr);
	}

	table.appendChild(tableBody);

	return table;
}

function createVersionTable(domains, results, tableId) {
	var table = document.createElement('table');
	table.setAttribute("id", tableId);
	table.setAttribute("class", "tablesorter");
	table.setAttribute("cellspacing", "1");
	table.setAttribute("cellpadding", "0");
	table.setAttribute("border", "0");

	//Headers
	var tableHead =  document.createElement('tHead');

	//Domain Header
	var tr = document.createElement('tr');
	var td = document.createElement('th');
	td.setAttribute("class", "header");
	td.appendChild(document.createTextNode('Domain'));
	tr.appendChild(td);

	td = document.createElement('th');
	td.setAttribute("class", "header");
	td.appendChild(document.createTextNode('Software'));
	tr.appendChild(td);

	td = document.createElement('th');
	td.setAttribute("class", "header");
	td.appendChild(document.createTextNode('Version'));
	tr.appendChild(td);

	tableHead.appendChild(tr);
	table.appendChild(tableHead);

	var tableBody = document.createElement('tbody');
	for (var domain in results) {
		var name = results[domain][softwareNameKey];
		var version = results[domain][softwareVersionKey];
		tr = document.createElement('tr');

		td = document.createElement('td');
		td.appendChild(document.createTextNode(domain));
		td.setAttribute('class', 'domainCell');
		tr.appendChild(td);

		td = document.createElement('td');
		td.appendChild(document.createTextNode(name));
		td.setAttribute('class', 'nameCell');
		tr.appendChild(td);

		td = document.createElement('td');
		td.appendChild(document.createTextNode(version));
		td.setAttribute('class', 'versionCell');
		tr.appendChild(td);

		tableBody.appendChild(tr);
	}

	table.appendChild(tableBody);
	return table;

}

$(document).ready(function() {
	
	$.getJSON("results.json", function(results) {
		$.getJSON("xepLookup.json", function(lookupDict) {
			$.getJSON('xepName.json', function(xepName){


				var domains = Object.keys(results).sort();

				var streamCodes = [];
				var featureCodes = [];

				for (var key in results) {
					var allStreamFeatures = results[key][streamFeaturesKey];
					var allCapabilityFeatures = results[key][discoFeaturesKey];
					var domainStreamFeatureCodes = allCodes(allStreamFeatures, lookupDict);
					var domainCapabilitiyCodes = allCodes(allCapabilityFeatures, lookupDict);

					//Insert proper formatted and unique codes
					results[key][streamFeaturesKey] = domainStreamFeatureCodes;
					results[key][discoFeaturesKey] = domainCapabilitiyCodes;

					streamCodes = _.union(streamCodes, domainStreamFeatureCodes);
					featureCodes = _.union(featureCodes, domainCapabilitiyCodes);
				}
				streamCodes.sort();
				featureCodes.sort();

				featureCodes = featureCodes.filter(function(element){
					try {
						var result element.indexOf("Google") < 0;
					} catch(e) {
						console.log(e)
					}
					
				});

				var streamTable = createTable(domains, streamCodes, streamFeaturesKey, results, "table1",xepName);
				var discoTable = createTable(domains, featureCodes, discoFeaturesKey, results, "table2", xepName);

				var versionTable = createVersionTable(domains, results, "versionTable");
				

				var tablearea1 = document.getElementById('streamResultsTableArea');
				var tablearea2 = document.getElementById('discoResultsTableArea');
				var tablearea3 = document.getElementById('versionResultsTableArea');
				tablearea1.appendChild(streamTable);
				tablearea2.appendChild(discoTable);
				tablearea3.appendChild(versionTable);

				$("#table1").tablesorter({widgets: ["zebra"]});
				$('#table2').tablesorter({widgets: ["zebra"]});
				$('#versionTable').tablesorter({widgets: ["zebra"]});
				$('a#headerLink').click(function(event){
					event.stopPropagation();
				});
			});
		});
	});
});