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

$(document).ready(function(){
	

	$.getJSON("results.json", function(results) {
		var domains = Object.keys(results).sort();

		var table = document.createElement('table');
		table.setAttribute("id", "table");
		table.setAttribute("class", "tablesorter");
		table.setAttribute("cellspacing", "1");
		table.setAttribute("cellpadding", "0");
		table.setAttribute("border", "0");
		var codes = [];

		for (var key in results) {
			codes = _.union(codes,results[key]);
		}
		codes.sort();

		var tableHead =  document.createElement('tHead');

		var tr = document.createElement('tr');
		var td = document.createElement('th');
		td.setAttribute("class", "header");
		td.appendChild(document.createTextNode('Domain'));
		tr.appendChild(td);

		for (var i in codes) {
			td = document.createElement('th');
			td.setAttribute("class", "header");
			a = document.createElement('a');
			a.setAttribute('id', 'headerLink');
			a.href = urlForCode(codes[i]);
			a.innerHTML = codes[i];
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

			for (var idx in codes) {
				code = codes[idx];
				if (results[domain].indexOf(code) > -1) {
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

		

		var tablearea = document.getElementById('resultsTableArea');
		tablearea.appendChild(table);

		$("#table").tablesorter({widgets: ["zebra"]});
		$('a#headerLink').click(function(event){
			event.stopPropagation();
		});
	});
});