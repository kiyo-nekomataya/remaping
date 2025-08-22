/*	fillWhite.jsx
	選択レイヤの透明部分を白で潰す（R,G,B[1,1,1]を比較暗で全面ペイント）
*/
if(app.documents.length){
	var myTarget=app.activeDocument;
/*
 *	Photoshop 拡張スクリプト用
 *	ライブラリに依存しない形で現在選択されているレイヤーの配列を返す
 *	レイヤセット、レイヤーを問わず選択中のアイテムを返す
 *	実行時にもとの選択状態を維持する
 *	返り値の配列はレイヤーが下から順になっているので注意
 */

function getSelectedLayers (){
	var layersIndexes = [];//ID配列
	var result = [];//レイヤー配列

	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
	var desc = executeActionGet(ref);
	if ( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
		desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
		var c = desc.count;
		for(var i=0;i<c;i++){ 
			try{
				activeDocument.backgroundLayer;
				layersIndexes.push(  desc.getReference( i ).getIndex() );
			}catch(e){
				layersIndexes.push(  desc.getReference( i ).getIndex()+1 );
			};
		};
	}else{
		var ref = new ActionReference();
		ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" ));
		ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
		try{
			activeDocument.backgroundLayer; 
			layersIndexes.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1); 
		}catch(e){ 
			layersIndexes.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))); 
		};

		var vis = app.activeDocument.activeLayer.visible;
		if (vis == true) app.activeDocument.activeLayer.visible = false;
		var descE = new ActionDescriptor();

		var listE = new ActionList();
		var refE = new ActionReference();

		refE.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
		listE.putReference( refE );
		descE.putList( charIDToTypeID('null'), listE );

		executeAction( charIDToTypeID('Shw '), descE, DialogModes.NO );

		if(app.activeDocument.activeLayer.visible == false) layersIndexes.shift();
		app.activeDocument.activeLayer.visible = vis;
	};
//取得したID配列からレイヤを追加選択してアクティブアイテムを控える
//IDはレイヤの（表示プライオリティ）下層から順に並んでいるので選択するごとに最上位のレイヤーがアクティブになる
	for( var i = 0; i < layersIndexes.length; i++ ){
		var desc = new ActionDescriptor();
		var ref = new ActionReference();
		ref.putIndex(charIDToTypeID( "Lyr " ), layersIndexes[i])
		desc.putReference( charIDToTypeID( "null" ), ref );
		if ( i > 0 ) {
			var idselectionModifier     = stringIDToTypeID( "selectionModifier" );
			var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
			var idaddToSelection        = stringIDToTypeID( "addToSelection" );
			desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
		};
//desc.putBoolean( charIDToTypeID( "MkVs" ), visible );
		executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
		result.push(app.activeDocument.activeLayer);
	};
	return result;
}
/*
    初期化
*/

//テンプレートの取得
//初期化終了
var canStart = (! app.activeDocument.activeLayer.isBackgroundLayer);
	if(canStart){
		//選択レイヤ取得
		//
		var myLayers=getSelectedLayers(true);

        var myUndo="fillWhite";var myAction="";
//白つぶし
//アクティブレイヤー全体を白でペイント 
myAction='for(var ix=0;ix<myLayers.length;ix ++){if(myLayers[ix].kind==LayerKind.NORMAL){app.activeDocument.activeLayer=myLayers[ix];app.activeDocument.selection.selectAll();RGBColor = new SolidColor();RGBColor.red = 255;RGBColor.green = 255;RGBColor.blue = 255;app.activeDocument.selection.fill(RGBColor,ColorBlendMode.DARKEN, 100, false);}}';//

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(nas.localize({en:"the background layer is selected.",ja:"背景レイヤーが選択されています。"}));
	}
}else{
    alert("no Documents")
}