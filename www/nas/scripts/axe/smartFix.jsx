/* smartFix.jsx
	スマートオブジェクトをラスタライス
*/
// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop
//Photoshop用ライブラリ読み込み
if(typeof app.nas == "undefined"){
	var myLibLoader=new File(Folder.userData.fullName+"/nas/lib/Photoshop_Startup.jsx");
	if(!(myLibLoader.exists))
	myLibLoader=new File(new File($.fileName).parent.parent.parent.fullName + "/lib/Photoshop_Startup.jsx");
	if(myLibLoader.exists) $.evalFile(myLibLoader);
}else{
	nas = app.nas;
};
//app.activeDocument.activeLayer.merge();//レイヤセット
ErrStrs = {}; ErrStrs.USER_CANCELLED=localize("$$$/ScriptingSupport/Error/UserCancelled=User cancelled the operation"); try {
if(app.activeDocument.activeLayer.kind == LayerKind.SMARTOBJECT){
//=======================================rasterizePlaced
 var id631 = charIDToTypeID( "slct" );
 var desc125 = new ActionDescriptor();
 var id632 = charIDToTypeID( "null" );
 var ref83 = new ActionReference();
 var id633 = charIDToTypeID( "Mn  " );
 var id634 = charIDToTypeID( "MnIt" );
 var id635 = stringIDToTypeID( "rasterizePlaced" );
 ref83.putEnumerated( id633, id634, id635 );
 desc125.putReference( id632, ref83 );
 executeAction( id631, desc125, DialogModes.NO );
}
} catch(e){if (e.toString().indexOf(ErrStrs.USER_CANCELLED)!=-1) {;} else{alert(localize("$$$/ScriptingSupport/Error/CommandNotAvailable=The command is currently not available"));}}
