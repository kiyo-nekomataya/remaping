/*
 *	nas_common
 */
//	array.add
var ar = [1,2,3,4,5,6,7,8,9];
var count = ar.length;
	console.log(ar.toString());
ar.add(0);
	console.log(ar.toString());
	console.log("---- " + ((ar.length > count)? "OK":"NG"));
count = ar.length;
ar.add(3);
	console.log(ar.toString());
	console.log("---- " + ((ar.length == count)? "OK":"NG"));
count = ar.length;
ar.add(311,function(tgt,dst){return (tgt>dst);});
	console.log(ar.toString());
	console.log("---- " + ((ar.length > count)? "NG":"OK"));
count = ar.length;
ar.add(311,function(tgt,dst){return (tgt < dst);});
	console.log(ar.toString());
	console.log("---- " + ((ar.length > count)? "OK":"NG"));
// appHost
	console.log(appHost);

//nas.IdfEscape(sourceString,strings,escapeChar);
	console.log('nas.IdfEscape("ABCDE%FG","ABC","%");//result:"%A%B%CDE%%FG"');
var result = "%A%B%CDE%%FG";
	console.log( nas.IdfEscape("ABCDE%FG",'ABC','%'));
	console.log("---- " + ((nas.IdfEscape("ABCDE%FG",'ABC','%')==result)?'OK':'NG'));
/*
	console.log("---- " +((nas.IdfEscape('ASBCDEF\\G','AXC\\','%')=="%ASB%CDEF%\\%\\G")? 'OK':'NG'));
	console.log("---- " +((nas.IdfEscape('ASSDFGERtyusadhjgalll','AS','&')=="&A&S&SDFGERtyusadhjgalll")? 'OK':'NG'));
*/
//nas.IdfUnEscape(sourceString,escapeChar)
	console.log("nas.IdfUnEscape('%%A%BCDE%FG','%');//'%ABCDEFG'");
	console.log("---- " +((nas.IdfUnEscape('%%A%BCDE%FG','%')=="%ABCDEFG")? 'OK':'NG'));

