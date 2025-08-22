/*

csvsimple.js  (C)2011 AZI
This library is free.

Example:
var c = csvSimple;
a = c.parse('AAA,"BBB",CCC');                  // -> [['AAA', 'BBB', 'CCC']]
a = c.parse('"A,A","B""B","C\nC"');            // -> [['A,A', 'B"B', 'C\nC']]
a = c.parse('AAA,BBB\nCCC,DDD,');              // -> [['AAA', 'BBB'], ['CCC', 'DDD', '']]
a = c.parse('AAA,B"B,CCC');                    // -> [['AAA', 'B', 'Parse error: ...']]
s = c.toCSV('AAA');                            // -> 'AAA'
s = c.toCSV(['AAA', 'B"B' ,'CCC']);            // -> 'AAA,"B""B",CCC'
s = c.toCSV(['AAA', 'B"B' ,'CCC'], true);      // -> '"AAA","B""B","CCC"'
s = c.toCSV([['AAA', 'BBB'], ['CCC', 'DDD']]); // -> 'AAA,BBB\nCCC,DDD'

Note:
- You can change text of error message.

add 'use strict' by kiyo@nekomataya.info 2019.09.10
 exports 2021 02 20
*/
'use strict';

var csvSimple = {
	
	/* Error messages */
	MSG_PARSE_ERROR: 'Parse error: Unable to read values after here.',
	MSG_TYPE_ERROR:  'Input error: The given argument is not string.',
	
	/* To convert CSV string to 2d-array */
	parse: function(csvstr) {
		var vals = [[]];
		if (typeof csvstr == 'string') {
			var csv = csvstr.replace(/,$/, ',""');
			var re = /^(?:"((?:[^"]|"")*)"|([^,"\n]*))/;
			for (var cnt = 0; csv !== ''; ) {
				csv = csv.replace(re, '');
				vals[cnt].push((RegExp.$1 !== '') ? RegExp.$1.replace(/""/g, '"') : ((RegExp.$2 !== '') ? RegExp.$2 : ''));
				csv = csv.replace(/^([,\n]?)/, '');
				if (RegExp.$1 == '\n') {
					vals[++cnt] = [];
				} else if (RegExp.$1 === '') {
					if (csv !== '') {
						vals[cnt].push(this.MSG_PARSE_ERROR);
						csv = '';
					}
				}
			}
		} else {
			vals[0][0] = this.MSG_TYPE_ERROR;
		}
		return vals;
	},
	
	/* To convert 2d-array to CSV string */
	toCSV: function(csvarr, qall) {
		var csv = '', arr;
		if (csvarr == null) {
			arr = [[]];
		} else if (typeof csvarr != 'object') {
			arr = [[csvarr]];
		} else if (typeof csvarr[0] != 'object') {
			arr = [csvarr];
		} else {
			arr = csvarr;
		}
		for (var i = 0; arr.length > i; i++) {
			var str = '';
			for (var j = 0; arr[i].length > j; j++) {
				var val = arr[i][j] + '';
				str += (val.match(/[,"\n]/)) ? ',"' + val.replace(/"/g, '""') + '"' : ',' + (qall ? '"' + val + '"' : val);
			}
			csv += '\n' + str.substring(1);
		}
		return csv.substring(1);
	}
	
};
//
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined'))
	exports.csvSimple = csvSimple;