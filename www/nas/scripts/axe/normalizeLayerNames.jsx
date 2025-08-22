/*(レイヤ名をアニメーション業務用に正規化)
 */
/*
var myTargetLayer=(app.documents.length)?app.activeDocument.activeLayer:false;

if(myTargetLayer){
	nas=app.nas;
myTargetLayer.name=nas.incrStr(myTargetLayer.name,-1,true)
};// */
//=======
/*
	現在のレイヤー名を正規化する
	選択レイヤーすべて
	実行後もとの選択レイヤーをすべて選択
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
	if (typeof app.nas != "undefined"){
//+++++++++++++++++++++++++++++++++ここまで共用

if(app.documents.length){
	var myTarget=app.activeDocument;

/**
 *    itemIndexを指定してレイヤーの選択｜解除を行う
 *    Layer.itemIndexを指定して無条件で追加　すでに追加されているレイヤーはそのまま 
 *    @params {Number Int} itemIndex
 *		@params {String}	act
 *		keyword of manipuration add|shift|remove 
 */
function manipulateByItemIndex(itmIndex,act){
// =======================================================
	var idslct = charIDToTypeID( "slct" );
    var descr = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var refe = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " );
        refe.putIndex( idLyr, itmIndex );
        descr.putReference( idnull, refe );
    var idselectionModifier     = stringIDToTypeID( "selectionModifier" );
    var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
	if (act == "shift"){
    	var idmanipToSelection = stringIDToTypeID( "addToSelectionContinuous" );//シフト選択
	}else if (act == 'remove'){
    	var idmanipToSelection = stringIDToTypeID( "removeFromSelection" );//削除
	}else if (act == "add"){
    	var idmanipToSelection = stringIDToTypeID( "addToSelection" );//追加
	}
    descr.putEnumerated( idselectionModifier, idselectionModifierType, idmanipToSelection );
    var idMkVs = charIDToTypeID( "MkVs" );
    descr.putBoolean( idMkVs, false );
executeAction( idslct, descr, DialogModes.NO );
};

/**
 *	単純選択
 *	クリック選択に相当
 *
 */
function activateByItemIndex(itmIndex){
// =======================================================
var idslct = charIDToTypeID( "slct" );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        ref1.putIndex( idLyr, itmIndex );
    desc1.putReference( idnull, ref1 );
    var idMkVs = charIDToTypeID( "MkVs" );
    desc1.putBoolean( idMkVs, false );
executeAction( idslct, desc1, DialogModes.NO );
}

//テンプレートの取得
//初期化終了
var canStart = ((app.activeDocument.mode==DocumentMode.RGB)&&(! app.activeDocument.activeLayer.isBackgroundLayer));
	if(canStart){
		//選択レイヤ取得
		//
		var myLayers=nas.axeCMC.getSelectedLayers();

		var myOpc=(myLayers[0].opacity >= 100)?nas.axe.onsOpc*100:100;

        var myUndo="normlizeLayerNames";
//関数版
var myAction='for(var ix=0;ix<myLayers.length;ix ++){myLayers[ix].name=nas.assetIdfNormalize(myLayers[ix].name,"Ab");};activateByItemIndex(myLayers[0].itemIndex);if(myLayers.length>1){for(var ix=1;ix<myLayers.length;ix ++){manipulateByItemIndex(myLayers[ix].itemIndex,"add");};};';

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
//選択復帰

	}else{
	alert(localize({en:"The document is not in RGB mode, or the background layer is selected.",ja:"ドキュメントがRGBモードではないか、または背景レイヤーが選択されています。"}));
	}

}else{
    alert("this is no Document")
}
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};