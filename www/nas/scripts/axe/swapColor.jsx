/* swapColor.jsx
    Photoshop アニメーション作業スクリプト
    背景色部分を前景色で塗る
    領域化された単独レイヤーのみ有効
    バッチ処理用 複数レイヤを順次処理
    レイヤ調整レイヤ等はスキップ
    仕様上背景レイヤーが選択されている場合はエラーが発生する
    通常の作業時は単領域を彩色したほうがはやいぞ
    2021.03.17 kiyo@nekomataya.info
*/
if(app.documents.length){
	var myTarget = app.activeDocument;
	var FGC = app.foregroundColor;
	var BGC = app.backgroundColor;
    var White = new SolidColor();
    White.rgb.red   = 255;
    White.rgb.green = 255;
    White.rgb.blue  = 255;
//選択状態の取得
    var selected = null;
    try{
        selected = app.activeDocument.selection.bounds;
        try {
            app.activeDocument.selection.invert();
        }catch(er){
            selected = false;
        }
    }catch(err){
        selected = false;
    }
    app.activeDocument.selection.deselect();

/**
 *	指定座標のアクティブレイヤの色をSolidColorで返す関数
 *	指定座標にピクセルがない場合はnullを返す
 *	@params {Object Document}  doc
 *	@params {Array} pos
 *		[x,y] as px
 *	@returns {Object SolidColor | null}
 *	2021 03 17 kiyo@nekomataya.info
 */
function getColorAt(doc, pos) {
	function selectBounds(doc, b) {
      doc.selection.select([[ b[0], b[1] ],
                           [ b[2], b[1] ],
                           [ b[2], b[3] ],
                           [ b[0], b[3] ]]);
    }
    function findPV(h) {
      for (var i = 0; i <= 255; i++ ) {
        if (h[i]) { return i; }
      }
      return 0;
    }
	var x=pos[0];
	var y=pos[1];
	var orgLyr = doc.activeLayer;
	selectBounds(doc, [x, y, x+1, y+1]);
	doc.selection.fill(White,ColorBlendMode.DARKEN);
	doc.selection.copy();//コピー
	var topLyr = doc.artLayers.add();//最上位にレイヤーを作る
	doc.paste();//ペースト・ここで選択解除される
	selectBounds(doc, [x, y, x+1, y+1]);//再選択
	var pColor = new SolidColor();
	pColor.rgb.red   = findPV(doc.channels[0].histogram);
	pColor.rgb.green = findPV(doc.channels[1].histogram);
	pColor.rgb.blue  = findPV(doc.channels[2].histogram);
	doc.selection.deselect(); //選択解除
	topLyr.remove();//一時レイヤ削除
	doc.activeLayer = orgLyr; //アクティブレイヤ復帰
	return pColor;
};
function swapColor(){
//座標点[0,0]のピクセルをSolidColor|nullでバックアップ
    var cBack = getColorAt(myTarget,[0,0]);
//座標点[0,0]をターゲット色でペイント-解除
    myTarget.selection.select([[0,0],[1,0],[1,1],[0,1]]);
    myTarget.selection.fill(BGC,ColorBlendMode.NORMAL);
    myTarget.selection.deselect();
//選択状態復帰
    if(selected){
        activeDocument.selection.select([
            [selected[0].as('px'),selected[1].as('px')],
            [selected[2].as('px'),selected[1].as('px')],
            [selected[2].as('px'),selected[3].as('px')],
            [selected[0].as('px'),selected[3].as('px')]
        ]);
    };
// =======================================================通常フィル
var idFl = charIDToTypeID( "Fl  " );
    var desc42 = new ActionDescriptor();
    var idFrom = charIDToTypeID( "From" );
        var desc43 = new ActionDescriptor();
        var idHrzn = charIDToTypeID( "Hrzn" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc43.putUnitDouble( idHrzn, idRlt, 0.000000 );
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc43.putUnitDouble( idVrtc, idRlt, 0.000000 );
    var idPnt = charIDToTypeID( "Pnt " );
    desc42.putObject( idFrom, idPnt, desc43 );
    var idTlrn = charIDToTypeID( "Tlrn" );
    desc42.putInteger( idTlrn, 0 );
    var idUsng = charIDToTypeID( "Usng" );
    var idFlCn = charIDToTypeID( "FlCn" );
    var idFrgC = charIDToTypeID( "FrgC" );
    desc42.putEnumerated( idUsng, idFlCn, idFrgC );
    var idCntg = charIDToTypeID( "Cntg" );
    desc42.putBoolean( idCntg, false );
executeAction( idFl, desc42, DialogModes.NO );
//元ピクセルが BGC 以外なら復帰する
    if( (cBack.rgb.red   != BGC.rgb.red  )||
        (cBack.rgb.green != BGC.rgb.green)||
        (cBack.rgb.blue  != BGC.rgb.blue )
    ){
        myTarget.selection.select([[0,0],[1,0],[1,1],[0,1]]);
        myTarget.selection.fill(cBack,ColorBlendMode.NORMAL);
        myTarget.selection.deselect();
    }
}
//実行
//UNDO設定
    var myLayers = nas.axeCMC.getSelectedLayers();
    var myUndo   = localize({en:"swapPaint",ja:"背景色を前景色"});
    var myAction = "if(myLayers.length > 1)myTarget.activeLayer=myLayers[myLayers.length-1];for(var ix=0;ix<myLayers.length;ix ++){var vs=myLayers[ix].visible;if(myLayers[ix].kind==LayerKind.NORMAL){if(!vs) myLayers[ix].visible=true;activeDocument.activeLayer=myLayers[ix];swapColor();};if(!vs) myLayers[ix].visible=false;};";
	if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{eval(myAction)};

//選択状態復帰
    if(selected){
        activeDocument.selection.select([
            [selected[0].as('px'),selected[1].as('px')],
            [selected[2].as('px'),selected[1].as('px')],
            [selected[2].as('px'),selected[3].as('px')],
            [selected[0].as('px'),selected[3].as('px')]
        ]);
    };
}else{
    alert("no Documents")
}
