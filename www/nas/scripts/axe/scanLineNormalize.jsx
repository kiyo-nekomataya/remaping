/*
	Photoshopスクリプト
	スクリプトからフィルタを実行するテンプレート
	8BM~PBK フィルタを使用しないバージョン

鉛筆画をスキャンしたデータを後加工しやすい形に前処理
	画像を
	前景色と背景色の明度でクリッピング
	クリッピング範囲の彩度を０にする
	彩度持ち上げ
*/
if(app.documents.length){
	var scanLineNormalize	= function(){
/**/
	var fgc      = app.foregroundColor;//前景色
	var bgc      = app.backgroundColor;//背景色
//	var chroma   = true;//有彩色フラグ
	if((fgc.rgb.red == fgc.rgb.green)&&(fgc.rgb.red == fgc.rgb.blue)){
		chroma   = false;
	};//無彩色であった場合切り替え
	var opst     = app.activeDocument.activeLayer.opacity;//元レイヤーの不透明度を保存
	if(opst < 100) app.activeDocument.activeLayer.opacity = 100;
	var hasSelection = true; //選択範囲を判定
	try{if(app.activeDocument.selection.bounds[0])}catch(err){
		hasSelection = false;
	}

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
//
	var chR = app.activeDocument.channels[0];
	var chG = app.activeDocument.channels[1];
	var chB = app.activeDocument.channels[2];

	if(! hasSelection) app.activeDocument.selection.selectAll();//全選択

	app.activeDocument.activeChannels=[chB]; //明度チャンネル選択
	app.activeDocument.activeLayer.adjustLevels(Math.floor(fgc.lab.l*2.55),Math.floor(bgc.lab.l*2.55),0.5,0,255);//前景色と背景色の明度でクリップ
	//明度チャンネル複製
	var bgArea = chB.duplicate();
	bgArea.name = "__BG-AREA__";
	app.activeDocument.activeChannels=[bgArea]; //複製チャンネル選択
	app.activeDocument.activeLayer.threshold(255)//しきい値で確定背景エリア抽出
	app.activeDocument.activeLayer.invert();//反転
	app.activeDocument.activeChannels=[chG]; //彩度チャンネル選択

// =======================================================apply Image
//画像操作で白部分の彩度をクリップ
var idAppI = charIDToTypeID( "AppI" );
    var desc17 = new ActionDescriptor();
    var idWith = charIDToTypeID( "With" );
        var desc18 = new ActionDescriptor();
        var idT = charIDToTypeID( "T   " );
            var ref6 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            ref6.putName( idChnl, "__BG-AREA__" );
        desc18.putReference( idT, ref6 );
        var idClcl = charIDToTypeID( "Clcl" );
        var idClcn = charIDToTypeID( "Clcn" );
        var idDrkn = charIDToTypeID( "Drkn" );
        desc18.putEnumerated( idClcl, idClcn, idDrkn );
        var idPrsT = charIDToTypeID( "PrsT" );
        desc18.putBoolean( idPrsT, true );
    var idClcl = charIDToTypeID( "Clcl" );
    desc17.putObject( idWith, idClcl, desc18 );
executeAction( idAppI, desc17, DialogModes.NO );

	app.activeDocument.activeLayer.adjustLevels(0,255,2,0,255);//中間調の彩度を上げる
	bgArea.remove();//中間データ削除
	
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

// === opacity復帰
	if (opst < 100) app.activeDocument.activeLayer.opacity = opst;
}
var myAction = 'scanLineNormalize();';
var myUndo = 'scanLineNormalize';

var canStart = (app.activeDocument.mode==DocumentMode.RGB);
	if(canStart){

if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
	}else{
	alert(localize({en:"The document is not in RGB mode.",ja:"ドキュメントがRGBモードではありません。"}));
	}
}else{
    alert("this is no Document")
}