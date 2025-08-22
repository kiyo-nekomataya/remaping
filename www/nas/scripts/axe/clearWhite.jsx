/*	elimanateWhite.jsx
選択されたレイヤーの白成分を除去

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
/*
eliminateWhite 

元スクリプトから以下の部分を変更
関数化してUNDO可能に
白レイヤーの作成を省略
オリジナルのソースレイヤを削除してリザルトを
オリジナルと同名のレイヤーに変更
透明度とブレンドモードを復帰
RGBモードに動作範囲を限定
ターゲットレイヤーがピクセルを持たない場合にNOP
*/
function eliminateWhite(targetLayer){
    if (typeof targetLayer == 'undefined') targetLayer = app.activeDocument.activeLayer;
    if ((targetLayer.kind != LayerKind.NORMAL)||(targetLayer.isBackgroundLayer)||(app.activeDocument.mode != DocumentMode.RGB)) return false;
    var bacupProps={blendMode:targetLayer.blendMode,opacity:targetLayer.opacity,maskOpt:targetLayer.layerMaskDensity};

    app.activeDocument.quickMaskMode=false;


//    sourceLayer.blendMode = BlendMode.NORMAL;
//    sourceLayer.opacity   = 100;
//    sourceLayer.layerMaskDensity = 0;
    
    app.activeDocument.activeLayer = targetLayer;
    app.activeDocument.selection.selectAll();
    app.activeDocument.selection.copy();
    app.activeDocument.selection.deselect();
    app.activeDocument.paste();
    var sourceLayer = app.activeDocument.activeLayer;
    
//アクティブレイヤー全体を一度白でペイントしておく
    app.activeDocument.selection.selectAll();
    RGBColor = new SolidColor();
    RGBColor.red = 255;
    RGBColor.green = 255;
    RGBColor.blue = 255;
    app.activeDocument.selection.fill(RGBColor,ColorBlendMode.DARKEN, 100, false);

var rLayer=app.activeDocument.activeLayer.duplicate();

app.activeDocument.activeLayer=rLayer;

// =======================================================
var idChnM = charIDToTypeID( "ChnM" );
    var desc3 = new ActionDescriptor();
    var idpresetKind = stringIDToTypeID( "presetKind" );
    var idpresetKindType = stringIDToTypeID( "presetKindType" );
    var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
    desc3.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
    var idMnch = charIDToTypeID( "Mnch" );
    desc3.putBoolean( idMnch, true );
    var idGry = charIDToTypeID( "Gry " );
        var desc4 = new ActionDescriptor();
        var idRd = charIDToTypeID( "Rd  " );
        var idPrc = charIDToTypeID( "#Prc" );
        desc4.putUnitDouble( idRd, idPrc, 100.000000 );
    var idChMx = charIDToTypeID( "ChMx" );
    desc3.putObject( idGry, idChMx, desc4 );
executeAction( idChnM, desc3, DialogModes.NO );


app.activeDocument.activeLayer=sourceLayer;
var gLayer=app.activeDocument.activeLayer.duplicate();
app.activeDocument.activeLayer=gLayer;

// =======================================================
var idChnM = charIDToTypeID( "ChnM" );
    var desc29 = new ActionDescriptor();
    var idpresetKind = stringIDToTypeID( "presetKind" );
    var idpresetKindType = stringIDToTypeID( "presetKindType" );
    var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
    desc29.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
    var idMnch = charIDToTypeID( "Mnch" );
    desc29.putBoolean( idMnch, true );
    var idGry = charIDToTypeID( "Gry " );
        var desc30 = new ActionDescriptor();
        var idGrn = charIDToTypeID( "Grn " );
        var idPrc = charIDToTypeID( "#Prc" );
        desc30.putUnitDouble( idGrn, idPrc, 100.000000 );
    var idChMx = charIDToTypeID( "ChMx" );
    desc29.putObject( idGry, idChMx, desc30 );
executeAction( idChnM, desc29, DialogModes.NO );


app.activeDocument.activeLayer=sourceLayer;
var bLayer=app.activeDocument.activeLayer.duplicate();
app.activeDocument.activeLayer=bLayer;


// =======================================================
var idChnM = charIDToTypeID( "ChnM" );
    var desc33 = new ActionDescriptor();
    var idpresetKind = stringIDToTypeID( "presetKind" );
    var idpresetKindType = stringIDToTypeID( "presetKindType" );
    var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
    desc33.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
    var idMnch = charIDToTypeID( "Mnch" );
    desc33.putBoolean( idMnch, true );
    var idGry = charIDToTypeID( "Gry " );
        var desc34 = new ActionDescriptor();
        var idBl = charIDToTypeID( "Bl  " );
        var idPrc = charIDToTypeID( "#Prc" );
        desc34.putUnitDouble( idBl, idPrc, 100.000000 );
    var idChMx = charIDToTypeID( "ChMx" );
    desc33.putObject( idGry, idChMx, desc34 );
executeAction( idChnM, desc33, DialogModes.NO );


rLayer.blendMode = BlendMode.DARKEN;
gLayer.blendMode = BlendMode.DARKEN;
app.activeDocument.activeLayer=rLayer;
app.activeDocument.activeLayer=app.activeDocument.activeLayer.merge();
maskLayer=app.activeDocument.activeLayer.merge();



app.activeDocument.activeLayer=maskLayer;

app.activeDocument.selection.selectAll();
app.activeDocument.selection.copy();

maskLayer.remove();


app.activeDocument.activeLayer=sourceLayer;
var resultLayer=app.activeDocument.activeLayer.duplicate();
app.activeDocument.activeLayer=resultLayer;

app.activeDocument.quickMaskMode=true;
app.activeDocument.selection.selectAll();
app.activeDocument.paste(true);
app.activeDocument.quickMaskMode=false;
app.activeDocument.selection.clear();
app.activeDocument.selection.deselect();
// =======================================================
var idRmvW = charIDToTypeID( "RmvW" );
executeAction( idRmvW, undefined, DialogModes.NO );
//実行直後にマージしてソースレイヤーにまとめる
sourceLayer.opacity=0;
targetLayer.opacity=0;
app.activeDocument.activeLayer=app.activeDocument.activeLayer.merge();
app.activeDocument.activeLayer=app.activeDocument.activeLayer.merge();
/*白レイヤーは不要
var whiteLayer=app.activeDocument.activeLayer.duplicate();
app.activeDocument.activeLayer=whiteLayer;


app.activeDocument.selection.selectAll();
RGBColor = new SolidColor();
RGBColor.red = 255;
RGBColor.green = 255;
RGBColor.blue = 255;
app.activeDocument.selection.fill(RGBColor,ColorBlendMode.NORMAL, 100, false);
*/

app.activeDocument.selection.deselect();

targetLayer.blendMode = bacupProps.blendMode;//ブレンドモード復帰
targetLayer.opacity   = bacupProps.opacity;//不透明度復帰
//sourceLayer.layerMaskDensity   = bacupProps.maskOpt;//レイヤマスク濃度復帰
//他のプロパティ（レイヤー効果・レイヤーマスク等）も復帰させるか？
//いっそ元レイヤーのピクセルを入れ替えたほうが良いかも？
//ソースのピクセルをすべて不透明度0にした後にマージでいける

//app.activeDocument.activeLayer=resultLayer;
}

//テンプレートの取得
//初期化終了
var canStart = ((app.activeDocument.mode==DocumentMode.RGB)&&(! app.activeDocument.activeLayer.isBackgroundLayer));
	if(canStart){
		//選択レイヤ取得
		//
		var myLayers=getSelectedLayers(true);

        var myUndo="ClearWhite";var myAction="";
			//ノーマルレイヤ時のみ処理 不透明度１００％リセットしてeliminateWhite アクションを実行
//myAction='for(var ix=0;ix<myLayers.length;ix ++){if(myLayers[ix].kind==LayerKind.NORMAL){app.activeDocument.activeLayer=myLayers[ix];if (myLayers[ix].opacity<100){myLayers[ix].opacity=100.0;};var idPly=charIDToTypeID("Ply ");var descAct=new ActionDescriptor();var idnull=charIDToTypeID("null");var refAct=new ActionReference();var idActn=charIDToTypeID("Actn");refAct.putName(idActn, "eliminateWhite");var idASet=charIDToTypeID("ASet");refAct.putName(idASet,"psAxe");descAct.putReference(idnull,refAct);executeAction(idPly,descAct, DialogModes.NO);}};';
//関数版
var myAction='for(var ix=0;ix<myLayers.length;ix ++){if(myLayers[ix].kind==LayerKind.NORMAL){app.activeDocument.activeLayer=myLayers[ix];if (myLayers[ix].opacity<100){myLayers[ix].opacity=100.0;};eliminateWhite(myLayers[ix]);}}';//

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(localize({en:"The document is not in RGB mode, or the background layer is selected.",ja:"ドキュメントがRGBモードではないか、または背景レイヤーが選択されています。"}));
	}
}else{
    alert("this is no Document")
}