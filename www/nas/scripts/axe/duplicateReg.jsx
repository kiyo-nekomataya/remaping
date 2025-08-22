/*	duplicateReg.jsx
	レジスタマークを選択レイヤに貼り付けるスクリプト
	レジスタの画像はドキュメント内にあらかじめレイヤとして読み込んでおく必要がある
	基本は、///frame/peg この名前以外の場合はリストから選択する
	レジスタレイヤを選択された各レイヤの上に複製して統合。モード、透明度には手をつけない
	
	読み込みは別のスクリプトまたは手作業
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
//テンプレートの取得
 	var myTempalte=false;
	for (var ix=0;ix<myTarget.layers.length;ix ++){
		if(
		 (myTarget.layers[ix].name=="peg")&&(
		  (myTarget.layers[ix].kind==LayerKind.NORMAL)||
		  (myTarget.layers[ix].kind==LayerKind.SMARTOBJECT)
		 )
		){
		//ドキュメント第一階層のノーマル（スマートオブジェクト）レイヤで名前が"peg"
			myTempalte=myTarget.layers[ix];break;
		}
		if(myTarget.layers[ix].name.match(/(frames?|フレーム)/i)){
		//ドキュメント第二階層の"peg"レイヤでノーマル（スマートオブジェクト）レイヤ
		try{myTempalte=myTarget.layers[ix].layers.getByName("peg");}catch(err){myTempalte=false;}
		if(
		 (myTempalte)&&(
		  (myTempalte.kind==LayerKind.NORMAL)||
		  (myTempalte.kind==LayerKind.SMARTOBJECT)
		 )
		){break;}

		}
	}
	if(myTempalte){
		//選択レイヤ取得
		var myLayers=getSelectedLayers();
        var myUndo="タップ貼付";var myAction="";
			//ノーマルレイヤ時のみ処理 ペグレイヤ自体ならスキップ
myAction="for (var ix=0;ix<myLayers.length;ix ++){if((myLayers[ix].kind==LayerKind.NORMAL)&&(myLayers[ix]!==myTempalte)){var myLayerOpc=myLayers[ix].opacity;if (myLayerOpc<100){myLayers[ix].opacity=100.0;};var myPegLayer=myTempalte.duplicate(myLayers[ix],ElementPlacement.PLACEBEFORE);var newLayer=myPegLayer.merge();newLayer.opacity=myLayerOpc;}};"
if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(nas.localize({en:"no peg(register) layer found!",ja:"タップ（トンボ）レイヤを取得できませんでした"}));
	}
}else{
    alert("no Documents")
}