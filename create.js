var fs = require('fs');
var _ = require('underscore');

module.exports = {
		createPage: function (results) {
			var fileName = './result.html';
			var stream = fs.createWriteStream(fileName);

			stream.once('open', function(fd) {
				var html = buildHtml(results);
				stream.end(html);
			});
		}
	};

function buildHtml(results) {
	var header = '';
	var body = '';

	body += '<table style="width:100%" border="1">';

	var domains = Object.keys(results).sort();
	var codes = [];

	for (var key in results) {
		codes = _.union(codes,results[key]);
	}

	body += '\n<tr>';
	body += '<td></td>';
	for (var index in codes) {
		code = codes[index];
		body += '<td>'+code+'</td>';
	}
	body += '</tr>';

	for (var i in domains){
		body += '\n<tr>';
		var domain = domains[i];
		body += '<td>' + domain + '</td>';
		for (var idx in codes) {
			code = codes[idx];
			body += '<td ';
			if (results[domain].indexOf(code) > -1) {
				body += 'bgcolor="#47D147"> Yes';
			}
			else {
				body += 'bgcolor="#CC0000"> No';
			}

			body += '</td>';
		}


		body += '</tr>';
	}

	body += '</table>';


	return '<!DOCTYPE html>' + '<html><header>' + header + '</header><body>' + body + '</body></html>';

}

