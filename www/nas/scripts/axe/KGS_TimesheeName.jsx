// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop

var pgNum = 1;
var Lname = app.activeDocument.activeLayer.name.replace(/KGS_([0-9][0-9])_/i,"KGS#$1__s-c").replace(/[_\-\s](sheet|xps|xpst|dope|ts|st|sht)[_\-\s]*(\d*)$/i,'_xps');
pgNum = parseInt(RegExp.$2);
app.activeDocument.activeLayer.name = [Lname,pgNum].join('-');
