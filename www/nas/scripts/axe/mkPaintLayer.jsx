/*	makePaintLayer.jsx

現在の選択状態の
RGB各チャンネルを比較暗合成して前景色で塗りつぶした新しいレイヤーを作成する
彩色用（色トレス>黒）線画作成

makePaintLayer create　neLayer based on the minimum luminance of the RGB each channels

デバッグ中　動作不良あり　注意 2018 10124

*/



function mkPaintLayer(){
// =======================================================Select Channel Red
var currentChannels =app.activeDocument.activeChannels;
    app.activeDocument.activeChannels=[currentChannels[0]];
// =======================================================チャンネル演算　赤/緑 比較暗
var idMk = charIDToTypeID( "Mk  " );
    var descNewCh = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
    var idChnl = charIDToTypeID( "Chnl" );
    descNewCh.putClass( idNw, idChnl );
    var idUsng = charIDToTypeID( "Usng" );
        var descChCl = new ActionDescriptor();
        var idT = charIDToTypeID( "T   " );
            var refMrgd = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            refMrgd.putEnumerated( idChnl, idOrdn, idTrgt );
            var idLyr = charIDToTypeID( "Lyr " );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idMrgd = charIDToTypeID( "Mrgd" );
            refMrgd.putEnumerated( idLyr, idOrdn, idMrgd );
        descChCl.putReference( idT, refMrgd );
        var idClcl = charIDToTypeID( "Clcl" );
        var idClcn = charIDToTypeID( "Clcn" );
        var idDrkn = charIDToTypeID( "Drkn" );
        descChCl.putEnumerated( idClcl, idClcn, idDrkn );
        var idSrctwo = charIDToTypeID( "Src2" );
            var ref8 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idChnl = charIDToTypeID( "Chnl" );
            var idGrn = charIDToTypeID( "Grn " );
            ref8.putEnumerated( idChnl, idChnl, idGrn );
        descChCl.putReference( idSrctwo, ref8 );
    var idClcl = charIDToTypeID( "Clcl" );
    descNewCh.putObject( idUsng, idClcl, descChCl );
executeAction( idMk, descNewCh, DialogModes.NO );
// ========= 新規チャンネル取得
var newChannel=app.activeDocument.activeChannels[0];
// =======================================================画像操作　アルファ/青 比較暗
var idAppI = charIDToTypeID( "AppI" );
    var descChCl = new ActionDescriptor();
    var idWith = charIDToTypeID( "With" );
        var descMrgd = new ActionDescriptor();
        var idT = charIDToTypeID( "T   " );
            var refMrgd = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idChnl = charIDToTypeID( "Chnl" );
            var idBl = charIDToTypeID( "Bl  " );
            refMrgd.putEnumerated( idChnl, idChnl, idBl );
            var idLyr = charIDToTypeID( "Lyr " );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idMrgd = charIDToTypeID( "Mrgd" );
            refMrgd.putEnumerated( idLyr, idOrdn, idMrgd );
        descMrgd.putReference( idT, refMrgd );
        var idClcl = charIDToTypeID( "Clcl" );
        var idClcn = charIDToTypeID( "Clcn" );
        var idDrkn = charIDToTypeID( "Drkn" );
        descMrgd.putEnumerated( idClcl, idClcn, idDrkn );
        var idPrsT = charIDToTypeID( "PrsT" );
        descMrgd.putBoolean( idPrsT, true );
    var idClcl = charIDToTypeID( "Clcl" );
    descChCl.putObject( idWith, idClcl, descMrgd );
executeAction( idAppI, descChCl, DialogModes.NO );
// =======================================================RGBチャンネル再セレクト
    app.activeDocument.activeChannels = currentChannels;
    var myName = app.activeDocument.activeLayer.name;
    app.activeDocument.artLayers.add();
        app.activeDocument.activeLayer.name=myName;
    app.activeDocument.selection.fill(app.foregroundColor);
    app.activeDocument.selection.load(newChannel);
    app.activeDocument.selection.clear();
    app.activeDocument.selection.deselect();
    newChannel.remove();
}

mkPaintLayer()