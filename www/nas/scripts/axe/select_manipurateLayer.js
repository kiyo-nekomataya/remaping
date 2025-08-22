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
/*
	activateByItemIndex(2);
*/