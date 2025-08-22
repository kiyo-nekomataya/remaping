/*
前景色を削除
	レイヤーから前景色を色相の範囲で抽出して背景色に置換する
	パラメータはアプリケーションの前景色背景色を参照
	前景色が無彩色の場合色相範囲判定ではなく彩度判定に切り替える
	
*/
if(app.documents.length){
	var removeFGC	= function(){
/**/
	var fgc      = app.foregroundColor;//前景色を獲得
	var chroma   = true;//有彩色フラグ
	if((fgc.rgb.red == fgc.rgb.green)&&(fgc.rgb.red == fgc.rgb.blue)){
		chroma   = false;
	};//無彩色であった場合切り替え
	var opst     = app.activeDocument.activeLayer.opacity;//元レイヤーの不透明度を保存
	if(opst < 100) app.activeDocument.activeLayer.opacity = 100;
	var hasSelection = true; //選択範囲を判定
	try{if(app.activeDocument.selection.bounds[0])}catch(err){
		hasSelection = false;
	}
	var hRange    = 6;
	var sRange    = 5;
if(chroma){
/*複製前にターゲットを色変換*/
// =======================================================色相と彩度
var idHStr = charIDToTypeID( "HStr" );
    var decHStr = new ActionDescriptor();
    var idpresetKind = stringIDToTypeID( "presetKind" );
    var idpresetKindType = stringIDToTypeID( "presetKindType" );
    var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
    decHStr.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
    var idClrz = charIDToTypeID( "Clrz" );
    decHStr.putBoolean( idClrz, false );
    var idAdjs = charIDToTypeID( "Adjs" );
        var list1 = new ActionList();
            var decParms = new ActionDescriptor();
            var idH = charIDToTypeID( "H   " );
            decParms.putInteger( idH, -(((fgc.hsb.hue +180 + (hRange/2) )%360)-180));
            var idStrt = charIDToTypeID( "Strt" );
            decParms.putInteger( idStrt, 0 );
            var idLght = charIDToTypeID( "Lght" );
            decParms.putInteger( idLght, 0 );
        var idHsttwo = charIDToTypeID( "Hst2" );
        list1.putObject( idHsttwo, decParms );
    decHStr.putList( idAdjs, list1 );
executeAction( idHStr, decHStr, DialogModes.NO );
}else{
/*複製前に無彩色レンジを拡張*/
// =======================================================チャンネルコンバート(RGB2HSL)
	var idHsbP = charIDToTypeID( "HsbP" );
    	var descHsbP = new ActionDescriptor();
    	var idInpt = charIDToTypeID( "Inpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idRGBC = charIDToTypeID( "RGBC" );
    	descHsbP.putEnumerated( idInpt, idClrS, idRGBC );
    	var idOtpt = charIDToTypeID( "Otpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idHSLC = charIDToTypeID( "HSLC" );
    	descHsbP.putEnumerated( idOtpt, idClrS, idHSLC );
	executeAction( idHsbP, descHsbP, DialogModes.NO );
// -------- 無彩色範囲拡張
	var chR = app.activeDocument.channels[0];
	var chG = app.activeDocument.channels[1];
	var chB = app.activeDocument.channels[2];
	app.activeDocument.activeChannels=[chG]; //chG選択
	if(! hasSelection) app.activeDocument.selection.selectAll();//全選択
	app.activeDocument.activeLayer.adjustLevels(sRange,255,1,0,255);     //拡張
	if(! hasSelection) app.activeDocument.selection.deselect(); //選択解除
	app.activeDocument.activeChannels=[chR,chG,chB]; //chRGB選択
// =======================================================チャンネルコンバート(HSL2RGB)
	var idHsbP = charIDToTypeID( "HsbP" );
    	var descHsbP = new ActionDescriptor();
    	var idInpt = charIDToTypeID( "Inpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idHSLC = charIDToTypeID( "HSLC" );
    	descHsbP.putEnumerated( idInpt, idClrS, idHSLC );
    	var idOtpt = charIDToTypeID( "Otpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idRGBC = charIDToTypeID( "RGBC" );
    	descHsbP.putEnumerated( idOtpt, idClrS, idRGBC );
	executeAction( idHsbP, descHsbP, DialogModes.NO );
}
	var duplicated = app.activeDocument.activeLayer.duplicate();//duplicate
	var baseLayer  = app.activeDocument.activeLayer.duplicate();//duplicate
//	duplicated.name = '__duplicated__';//rename
	app.activeDocument.activeLayer = duplicated;//activate
	duplicated.blendMode = BlendMode.LIGHTEN;//mode lighten
// =======================================================チャンネルコンバート(RGB2HSL)
	var idHsbP = charIDToTypeID( "HsbP" );
    	var descHsbP = new ActionDescriptor();
    	var idInpt = charIDToTypeID( "Inpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idRGBC = charIDToTypeID( "RGBC" );
    	descHsbP.putEnumerated( idInpt, idClrS, idRGBC );
    	var idOtpt = charIDToTypeID( "Otpt" );
    	var idClrS = charIDToTypeID( "ClrS" );
    	var idHSLC = charIDToTypeID( "HSLC" );
    	descHsbP.putEnumerated( idOtpt, idClrS, idHSLC );
	executeAction( idHsbP, descHsbP, DialogModes.NO );
//R > (hue)        色相チャンネル
//G > (saturation) 彩度チャンネル
//B > (luminance)  明度チャンネル
	if(chroma){
// -------- カラー範囲の場合色相チャンネルでマップを作成
		var chR = app.activeDocument.channels[0];
		var chG = app.activeDocument.channels[1];
		var chB = app.activeDocument.channels[2];
		app.activeDocument.activeChannels=[chR]; //chR選択
		if(! hasSelection) app.activeDocument.selection.selectAll();//全選択
		app.activeDocument.selection.copy();     //複製
		app.activeDocument.activeChannels=[chG]; //chG選択
		app.activeDocument.paste(true);          //ペースト
		app.activeDocument.activeChannels=[chB]; //chB選択
		app.activeDocument.paste(true);          //ペースト
		if(! hasSelection) app.activeDocument.selection.deselect(); //選択解除
		app.activeDocument.activeChannels=[chR,chG,chB]; //chRGB選択
// 有彩色であればここでレイヤーの階調を反転
		app.activeDocument.activeLayer.adjustLevels(0,255,1,255,0);
	}
// =======================================================モノクロ化しきい値 64/256 154/256
	app.activeDocument.activeLayer.threshold((chroma)?15:64);
// ===　下のレイヤと結合(レイヤーマージ)
	app.activeDocument.activeLayer.merge();//マージ
	app.activeDocument.activeLayer.invert();//反転
	app.activeDocument.activeLayer.threshold(0);//モノクロ化
    app.activeDocument.activeLayer.blendMode = BlendMode.LIGHTEN;//比較明合成
	app.activeDocument.activeLayer.merge();//再マージ
	if(chroma){
// =======================================================色相と彩度復帰(有彩色のみ)
var idHStr = charIDToTypeID( "HStr" );
    	var decHStr = new ActionDescriptor();
    	var idpresetKind = stringIDToTypeID( "presetKind" );
    	var idpresetKindType = stringIDToTypeID( "presetKindType" );
    	var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
    	decHStr.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
    	var idClrz = charIDToTypeID( "Clrz" );
    	decHStr.putBoolean( idClrz, false );
    	var idAdjs = charIDToTypeID( "Adjs" );
        var list1 = new ActionList();
            var decParms = new ActionDescriptor();
            var idH = charIDToTypeID( "H   " );
            decParms.putInteger( idH, ((((fgc.hsb.hue + (hRange/2) )+ 180 ) % 360)-180));
            var idStrt = charIDToTypeID( "Strt" );
            decParms.putInteger( idStrt, 0 );
            var idLght = charIDToTypeID( "Lght" );
            decParms.putInteger( idLght, 0 );
        var idHsttwo = charIDToTypeID( "Hst2" );
        list1.putObject( idHsttwo, decParms );
    	decHStr.putList( idAdjs, list1 );
	executeAction( idHStr, decHStr, DialogModes.NO );
// 前景色で塗りつぶし
//		app.activeDocument.selection.fill(fgc,ColorBlendMode.LIGHTEN,100);
	}
	
// === opacity
//	if (opst < 100) app.activeDocument.activeLayer.opacity = opst;
}
var myAction = 'removeFGC();';
var myUndo = 'removeFGC';

var canStart = (app.activeDocument.mode==DocumentMode.RGB);
	if(canStart){

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(localize({en:"The document is not in RGB mode.",ja:"ドキュメントがRGBモードではありません。"}));
	}
}else{
    alert("this is no Document")
}