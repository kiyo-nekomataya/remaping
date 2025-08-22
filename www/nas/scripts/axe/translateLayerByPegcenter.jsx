// EPS Open Options:
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
		var pegMarker    = nas.axeCMC.getAllItems(false).find(function(e){return (e.name == 'pegmarker');});
//ターゲットマーカーは必ず必要 ない場合はマーカーターゲットをインポートしてスクリプトを終了
		if(pegMarker){
			var moveTarget   = app.activeDocument.activeLayer;
//peg中心の取得
			var pegTemplate  = nas.axeCMC.getAllItems(false).find(function(e){return (e.name == 'peg')})

//moveTargetがpegTempalateまたはpegTargetと一致していた場合は、Framesセット以外の最上位レイヤーへ変更
			if((pegTemplate === moveTarget)||(pegMarker === moveTarget)){
				for (var ix=0 ; ix < activeDocument.layers.length ;ix ++){
					if(activeDocument.layers[ix].name.match(/frames?/i)) continue;
					if(
						(activeDocument.layers[ix] instanceof LayerSet)&&
						(activeDocument.layers[ix].layers.length > 0)
					){
//Frames以外のレイヤセットにアクティブレイヤを移し表示している最上位のレイヤをフォーカス
						app.activeDocument.activeLayer = activeDocument.layers[ix].layers[0];
						moveTarget = app.activeDocument.activeLayer;
						break;
					};
				};
			};
/*
	実行前チェック 移動ターゲットレイヤ・ペグ用参照レイヤ及びペグターゲットマーカーは必須
	いずれかがない場合は実行中止
// */
	if(
		((pegTemplate)&&(
			(pegTemplate.kind==LayerKind.NORMAL)||
			(pegTemplate.kind==LayerKind.SMARTOBJECT)
		))&&
		((pegMarker)&&(
			(pegMarker.kind==LayerKind.NORMAL)||
			(pegMarker.kind==LayerKind.SMARTOBJECT)
		))&&
		((moveTarget)&&(
			(moveTarget.kind==LayerKind.NORMAL)||
			(moveTarget.kind==LayerKind.SMARTOBJECT)
		))
	){
		var px = (pegTemplate.bounds[0].as('px') + pegTemplate.bounds[2].as('px'))/2;
		var py = (pegTemplate.bounds[1].as('px') + pegTemplate.bounds[3].as('px'))/2;
		var mx = (pegMarker.bounds[0].as('px') + pegMarker.bounds[2].as('px'))/2;
		var my = (pegMarker.bounds[1].as('px') + pegMarker.bounds[3].as('px'))/2;
// ============================================自由変形で差分移動
    var idTrnf      = charIDToTypeID( "Trnf" );
    var descCommand = new ActionDescriptor();
    var idnull      = charIDToTypeID( "null" );
        var refTarget = new ActionReference();
        var idLyr     = charIDToTypeID( "Lyr " );
        var idOrdn    = charIDToTypeID( "Ordn" );
        var idTrgt    = charIDToTypeID( "Trgt" );
        refTarget.putEnumerated( idLyr, idOrdn, idTrgt );
    descCommand.putReference( idnull, refTarget );
    var idFTcs = charIDToTypeID( "FTcs" );
    var idQCSt = charIDToTypeID( "QCSt" );
    var idQcsa = charIDToTypeID( "Qcsa" );
    descCommand.putEnumerated( idFTcs, idQCSt, idQcsa );
    var idOfst = charIDToTypeID( "Ofst" );
        var descOffset = new ActionDescriptor();
        var idHrzn     = charIDToTypeID( "Hrzn" );
        var idPxl      = charIDToTypeID( "#Pxl" );
        descOffset.putUnitDouble( idHrzn, idPxl, px - mx );//オフセットX座標
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idPxl  = charIDToTypeID( "#Pxl" );
        descOffset.putUnitDouble( idVrtc, idPxl, py - my );//オフセットY座標
    var idOfst = charIDToTypeID( "Ofst" );
    descCommand.putObject( idOfst, idOfst, descOffset );
    var idLnkd = charIDToTypeID( "Lnkd" );
    descCommand.putBoolean( idLnkd, true );
    var idIntr = charIDToTypeID( "Intr" );
    var idIntp = charIDToTypeID( "Intp" );
    var idBcbc = charIDToTypeID( "Bcbc" );
    descCommand.putEnumerated( idIntr, idIntp, idBcbc );
executeAction( idTrnf, descCommand, DialogModes.NO );
//ターゲットレイヤをレイヤセットのボトムへ移動
			moveTarget.move(moveTarget.parent,ElementPlacement.PLACEATEND);
//マーカーに再フォーカス
			app.activeDocument.activeLayer = pegMarker;//nas.axeCMC.getAllItems(false).find(function(e){return (e.name == 'marker');});
			};
		}else{
//ドキュメントに角度ターゲットマーカーを新規にインポートする
			var myTargetSet=app.activeDocument.activeLayer.parent;

			var currentUnitBase=app.preferences.rulerUnits;//控える
			var currentActiveLayer=app.activeDocument.activeLayer ;//控える

			app.preferences.rulerUnits=Units.MM;

//角度指定ターゲットマーカー
			var targetFile  = new File(Folder.nas.fullName+"/lib/resource/target.svg");
			var markerLayer = nas.axeCMC.placeEps(targetFile);//この関数が曲者
			markerLayer.name='pegmarker';//上記の関数の実行後に最初にDOM操作したオブジェクトは取り消しを受けている
// リネームをしなかった場合はレイヤの読み込み自体がUNDOされて読み込んだはずのレイヤが喪失してエラーが発生する
			markerLayer.translate(
				0,
				-1 * markerLayer.bounds[1] + 13
			);//右スロットの近辺へ移動

			if(!bootFlag){
				markerLayer.name="pegmarker";
			};
//ルーラーユニット
			app.preferences.rulerUnits=currentUnitBase;//復帰
//アクティブレイヤ
//			app.activeDocument.activeLayer=currentActiveLayer;//復帰

		};
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};