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
		for(var i=0 ; i < desc.count ; i++){ 
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
// TEST
getSelectedLayers();

/**
 *	選択されているレイヤーに対してcallback関数を実行する
 *	コールバックには引数としてレイヤーが与えられるが、
 *	各レイヤーはコールバックの実行直前にactiveLayerとして設定されるのでそちらを参照しても問題はない
 *	選択状態のレイヤは、レイヤー種別を問わないので、ArtLayerのみを処理する場合は、コールバック内での判定が必要
 *	callbackの有無を問わず、選択状態のレイヤーの配列を返す
 * @params {Function}	callback
 *	@returns {Array of Layers}
 *	元スクリプトは以下のアドレスを参照
 *	https://qiita.com/k-wth/items/0268a106de993e777c24
 *	背景レイヤーも取得可能
 *	選択がない状態ではコールバックは実行されず、空配列を返す
 *	callback関数は下のレイヤーから順に適用
 *	戻値の配列は、上のレイヤーから順に格納されている
 */
function executeSelectLayersAction (callback){
	var indexes = [];
	var result  = [];
// 元のactiveLayer位置を覚えておく
	var active_layer = app.activeDocument.activeLayer;
	var is_visible   = active_layer.visible;
	var doc_ref = new ActionReference();
	doc_ref.putEnumerated(charIDToTypeID("Dcmn"),charIDToTypeID("Ordn"),charIDToTypeID("Trgt"));
	var target_layers = executeActionGet(doc_ref).getList(stringIDToTypeID('targetLayersIndexes'));
//選択しているレイヤーのIDを取得しておく
	for(var i = 0; i < target_layers.count ; i++){
		try{
			activeDocument.backgroundLayer;
			indexes.push(target_layers.getReference(i).getIndex());
		}catch(err){
			indexes.push(target_layers.getReference(i).getIndex() + 1);
		};
	};
	for(var i = 0; i < indexes.length ; i++){
//	レイヤーを選択状態にする
		var desc = new ActionDescriptor();
		var ref = new ActionReference();
		ref.putIndex(charIDToTypeID( "Lyr " ), indexes[i]);
		desc.putReference(charIDToTypeID( "null" ), ref );
//	desc.putBoolean(charIDToTypeID( "MkVs" ), false );
		if ( i > 0 ){
			var idselectionModifier     = stringIDToTypeID( "selectionModifier" );
			var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
			var idaddToSelection        = stringIDToTypeID( "addToSelection" );
			desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
		};
		executeAction(charIDToTypeID( "slct" ), desc, DialogModes.NO );
		var select_layer = app.activeDocument.activeLayer;
		result.push(select_layer);
		if(callback instanceof Function) callback(select_layer);
	};
	app.activeDocument.activeLayer = active_layer;
	app.activeDocument.activeLayer.visible = is_visible;
	return result.reverse();
}

// TEST
executeSelectLayersAction()