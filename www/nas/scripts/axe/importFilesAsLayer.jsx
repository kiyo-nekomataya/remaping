/*	nas.axe.getLayers(targetFolder)
 */
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
	var bootFlag=false;
	var nasLibFolderPath =Folder.nas.fullName+ "/lib/";
//+++++++++++++++++++++++++++++++++ここまで共用

	var	myImportCount=0;
	var	importFileList=new Array();
//検索深度制限トラップ用変数
//現在の深度は関数外で管理制限数は固定値
	var	currentDepth=0;//初期値０
    //以下はUIに出しても良い
	var	controllingDepth=5;//テスト様に2段　運用は5段くらいにする　
	var	maxHandle=300;//テスト用に30 運用は300くらい で
	var	maxFolders=30;//フォルダハンドル制限　一般的には15レイヤ程度が人間が感覚で管理できる上限
	var forceResolution=false;//解像度を指定するか？
//	var myResolution=(nas.RESOLUTION*2.54)+" dpi";//指定時の解像度dpi
	var myResolution= new nas.UnitResolution("200 dpi");//指定時の解像度dpi 文字列で
//	var asTVPcsv=false;//TVPaint-出力フォルダとして読むか（自動判別あり）
//nas.axeAFC.importFilesAsLayer = function(targetFolder,option){
//	if (! targetFolder) {	return false;}

//	nas.GUI.currentFolder=targetFolder;
//	Folder.current = nas.GUI.prevCurrentFolder;
/*
	うっかり浅いレベルのディレクトリを指定した時のために中断機能を付ける

	シフトキーで中断　プログレスも欲しい
*/

// プロジェクトがなければ、ファイルを登録するプロジェクトを新規作成する。 [23839]
//ファイルを取り込むドキュメントを作成する。寸法は最終指定で固定か　最小・最大・平均を(optionで)選択
//　lat,min,max.ave ファイルに既存のファイルを使用するように調整　かつ　オプションは事前に処理しておくこと　サイズの調整は最後
//	var myDocument=app.documents.add(maxWidth+" px",maxHeight+" px",maxResolution+" dpi" ,myDocName);

//	if (!app.project) {	app.newProject();}

//	ファイル処理　引数のファイルをフィルタ処理してインポートリストに追加作成する。　リストは後でユーザが編集できるように
//	引数のファイルをインポートする(トライでエラートラップをかけて処理が止まらないようにしているみたいだ。)
	function processFile (theFile) {
//ファイル名を名を判定　タイムシート（と思われる画像）を排除
//		if ( theFile.name.match(/xps|sheet|timesheet/i) ) return;
//トライだけだと(開発中)危ないので、ここで制限を一度かける
		if(theFile.name.match(nas.importFilter)){
			importFileList.push(theFile);
			if(
				(theFile.name.match(/\.(tga|targe)$/i))&&
				(! w.rmWhite.value)
			) w.rmWhite.value=true;
		}else{
			return;
		}
	};
//	フォルダ処理
	function processFolder(theFolder,myDepth){
		if(myDepth > currentDepth) currentDepth = myDepth ;//カレントを更新
		if(currentDepth > controllingDepth){
		  if(confirm(nas.localize({
	en:"=== over depth : %1 / %2 / %3 \n process this directory abort? ",
	ja:"=== 想定深度超過 : %1 / %2 / %3 \n このフォルダの検索を中断しますか？"
		  },decodeURI(theFolder.name),currentDepth,controllingDepth))){
		    return;//
//		  }else{
//		    return;
		  }
		};
//
//個別ファイル名と別にフォルダ名を判定 LO以外の合成親、プール　等のセル外素材を読み込まない
//ただし (myDepth <= 1) 第一階層として直接指定された場合は除く
		if ( (myDepth > 1)&&(theFolder.name.match(/^_(?!lo).*/i)) ) return;
//フォルダ名を判定　^\d+\[[!\]]+\] バックアップフォルダを排除
		if ( decodeURI(theFolder.name).match(/^[0-9]+\[.+\]$/) ) return;
//強制的に中断でOK　制限解除は変数で
		var files = theFolder.getFiles(); //対象フォルダのファイル(オブジェクト)を配列にとる
		//ファイルとしてインポートまたは再帰処理
		//otherwise, import the files and recurse
		
		for (index in files) {
//Go through the array and set each element to singleFile, then run the following
			if (files[index] instanceof File) {
					processFile (files[index]); //calls the processFile function above
			}
			if (files[index] instanceof Folder) {
				  processFolder (files[index],myDepth+1); // recursion	
			}
		}
	}
	
//	processFolder(targetFolder);
//Recursively examine that folder フォルダを再帰で掘るヨ
//取得したリストを表示

//undoブロック終了
//return;
//}
//ListBoxUI
var w=nas.GUI.newWindow("dialog",nas.localize({
	en:"import files as layers",
	ja:"ファイルをレイヤとして読込"
}),6,14);

w.msgBox=nas.GUI.addStaticText(w,nas.localize({
	en:"folder recursively search to read the files as  layers.",
	ja:"フォルダを検索してファイルをレイヤとして読み込みます。"
}) ,0,0,6,1)

w.fileTargetName=nas.GUI.addEditText(w,"",0,1,6,1);

w.fileList=nas.GUI.addListBoxO(w,[],null,0,2,4,7,{multiselect:true});
//チェックコントロール
w.mkWS=nas.GUI.addCheckBox(w,nas.localize({
	en:"Create a layer set for each folder",
	ja:"フォルダごとにレイヤセットを作成"
}),0,9,4,1);
	w.mkWS.value=true;
w.rmOpt=nas.GUI.addCheckBox(w,nas.localize({
	en:"read the same file only once",
	ja:"重複したファイルを読まない"
}),0,10,4,1);
	w.rmOpt.value=true;
w.mxSize=nas.GUI.addCheckBox(w,nas.localize({
	en:"Create a document in the maximum size of the image",
	ja:"ファイルの最大サイズで読み込み"
}),0,11,4,1);
	w.mxSize.value=true;
w.rmWhite=nas.GUI.addCheckBox(w,nas.localize({
	en:"clip out white",
	ja:"白部分を削除"
}),0,12,4,1);
	w.rmWhite.value=false;
//------
w.asTVP=nas.GUI.addCheckBox(w,nas.localize({
	en:"import as TVPaint ExportData",
	ja:"TVPaint出力ファイルとして読む"
}),0,13,4,1);
	w.asTVP.value=false;




//------

w.rdRegistor=nas.GUI.addCheckBox(w,"AddFrames",4,7,2,1);
	w.rdRegistor.value=true;

w.adLvl=nas.GUI.addCheckBox(w,nas.localize({
	en:"Levels",
	ja:"レベル補正"
}),4,8,2,1);
	w.adLvl.value=false;

w.spRsl=nas.GUI.addCheckBox(w,nas.localize({
	en:"Resolution",
	ja:"解像度指定"
}),4,9,2,1);
	w.spRsl.value=false;
	
w.resolution = nas.GUI.addEditText(w,myResolution.toString(),4,10,2,1);
w.resolution.enabled = false;
/* 指定解像度が変更された場合
	指定された値を変数 myResolution に設定する
	数値のみ > ppi として扱う
	単位付き それぞれの値で扱う
	判別不能・不正値　myResolutionにロールバックする
*/
w.resolution.onChange = function(){
	myResolution.setValue(this.text);
	this.text = myResolution.toString();
};

w.doRenumber=nas.GUI.addCheckBox(w,nas.localize({
	en:"Renumber",
	ja:"リナンバー"
}),4,11,2,1);
	w.doRenumber.value=false;


//ボタンコントロール
w.FdBt=nas.GUI.addButton(w,"addFolder",4,2,2,1);
w.FlBt=nas.GUI.addButton(w,"addFile",4,3,2,1);
w.rmBt=nas.GUI.addButton(w,"remove",4,4,2,1);
w.rstBt=nas.GUI.addButton(w,"clear",4,5,2,1);


w.okBt=nas.GUI.addButton(w,"OK" ,4,12,2,1);
w.cnBt=nas.GUI.addButton(w,"cancel" ,4,13,2,1);

//
w.fileList.update=function(){
	this.removeAll();
	var guessTVP=false;
		if(	(decodeURI(importFileList[0].parent.name).match(/^Layer\s\d\d\d$|^\[\d+\].+$/))&&
			(decodeURI(importFileList[0].name).match(/^\d\+_.+_\d+\.png$|^\[\d+\]\[\d+\].+\.png$/i))
		) guessTVP=true;
	w.asTVP.value=guessTVP;//推定TVPExport これでたぶんハズレは無いと思う。誤認識はあり得る
	if(w.asTVP.value){
		w.spRsl.value = true;
		forceResolution = true;
		w.resolution.enabled = true;
		w.doRenumber.value = true
	}
	for(var ix=0;ix<importFileList.length;ix++){
		this.add("item","["+decodeURI(importFileList[ix].parent.name)+"] "+decodeURI(importFileList[ix].name));
	}
}
//チェックボックスコントロール
w.spRsl.onClick=function(){
	forceResolution=this.value;
	w.resolution.enabled=(forceResolution)?true:false;
}

//w.asTVP.onClick=function(){	asTVPcsv=this.value;}

//ボタンコントロール
w.FdBt.onClick=function(){
//var myCurrentFolder=Folder.current;
 var myFolder=Folder.current.selectDlg (nas.localize({
 	en:"specify the folder to read",
 	ja:"読み込むフォルダを指定してください"
 }));
 if(myFolder){
	Folder.current=myFolder;
	//第一階層のフォルダ数が多すぎる場合警告する
	var files = myFolder.getFiles();
	var currentFolders=0;
	//指定ディレクトリのフォルダ数を数える
	for (var i = 0 ; i <files.length ; i++){if (files[i] instanceof Folder) {currentFolders++;}};
	var checkStartFolder=true;
if(!(myFolder.parent instanceof Folder)||(currentFolders >= maxFolders)){
        checkStartFolder=confirm (nas.localize({
        	en:"Whether the route is specified, the number of folders read directory exceeds the specified value \n number of folders:%1 \n folder:%2 : %3 \n Do you want to continue processing?",
	ja:"ルートが指定されたか、読み込みディレクトリのフォルダ数が規定値を超えています\nフォルダ数: %1 \nフォルダ: %2 : %3 \n処理を続行しますか？"
        },currentFolders,(myFolder.parent instanceof Folder),myFolder.fullName),
	"no", nas.localize({en:"!! caution !!",ja:"!! 注意 !!"})
        );
    }
if(importFileList.length>=maxHandle){
        checkFileCount=confirm (nas.localize({
        	en:"Reading list the total number exceeds the specified value %1 \nmh: %2 / %1 \n Do you want to continue processing?",
	ja:"読込リスト総数が規定値の%1 を超えています\nmh:%2 / %1 \n処理を続行しますか？"
          },maxHandle, importFileList.length),
          "no", nas.localize({en:"!! caution !!",ja:"!! 注意 !!"})
        );
}
    if(checkStartFolder){
      currentDepth=0;//親呼び出しごとにカレントをリセット
	 processFolder(myFolder,1);w.fileList.update();
	 this.parent.fileTargetName.text=decodeURI(myFolder.name);
	 if(this.parent.asTVP.value){this.parent.fileTargetName.text=this.parent.fileTargetName.text.replace(/\.layers$/,"");}
//指定フォルダ名に".layers"が付いている可能性が高いので払う
	}
 };
// alert(importFileList.length);
}
w.FlBt.onClick=function(){
 var myFiles=File.openDialog(nas.localize({en:"specify the file for import",ja:"読み込むファイルを指定してください"}),"allFiles:*.*" ,true);
//CS2のopenDialogにマルチセレクトがないので配列でなくFileが帰ってくる可能性があるので注意
 if(myFiles){
	if(!(myFiles instanceof Array)){myFiles=[myFiles]}
	for(var ix=0;ix<myFiles.length;ix++){
		processFile(myFiles[ix]);
	}
  w.fileList.update();
 };
// alert(importFileList.length);		
	}
w.rmBt.onClick=function(){
	for(var ix=importFileList.length;ix>0;ix--){
		if(this.parent.fileList.items[ix-1].selected){
//			alert(ix-1)
			importFileList.splice(ix-1,1);
			this.parent.fileList.remove(ix-1);
		}
	}
}
w.rstBt.onClick=function(){
	importFileList=new Array();
	this.parent.fileList.removeAll();
}

/*
書出しの際にレイヤセットフォルダ内の登録順IDをレイヤ名に割りつける機能を増設
TVPaint書出しファイル用拡張 2016 30-04
CSV 1.0 1.1　自動判定
TVPaintのCSVを処理する場合はレイヤ名をファイル名でなく出現順フォルダ内の処理順IDに置き換える(動画番号の推測)
*/
// 下の関数内で参照する
w.okBt.onClick=function(){

//処理順にフォルダオブジェクトを格納する
var exportFolders=new Array();

	exportFolders.addEntry=function(myFile){
			var myFolder=myFile.parent;
		for(var ix=0;ix<this.length;ix++){
			if(myFolder.fsName==this[ix].fsName){
				this[ix].picCount++;
				return this[ix].picCount;
			};
 		}

		this.push(myFolder);
		var currentFolder=this[this.length-1];
		currentFolder.picCount=1;
		return currentFolder.picCount;
	}

	if(importFileList.length<1){return;}
//	if(w.asTVP.value){importFileList.reverse();}

	if(this.parent.fileTargetName.text.length<1){this.parent.fileTargetName.text=decodeURI(importFileList[0].parent.name)};
	if(w.rmOpt.value){var importedList=new Array();};
	var firstDoc=app.open(importFileList[0]);//最初のファイルを開く
		
	var maxWidth=firstDoc.width.as("px" );
	var maxHeight=firstDoc.height.as("px" );
	var maxResolution=firstDoc.resolution;
	var myDocument=app.documents.add(
		firstDoc.width,firstDoc.height,firstDoc.resolution,this.parent.fileTargetName.text,
		NewDocumentMode.RGB,DocumentFill.TRANSPARENT,
		1,BitsPerChannelType.EIGHT
	);//第一ドキュメントのコピーで空ファイルを作成
	var voidLayer=myDocument.layers[0];//最後に捨てる空レイヤ
	//内容を複製
	
for (ix=0;ix<importFileList.length;ix++){
if(w.rmOpt.value){
	var ex=false;
	for(var fx=0;fx<importedList.length;fx++){if(importedList[fx].fsName==importFileList[ix].fsName){ex=true;break;}};
	if(ex){continue};
}
	 var sourceDoc=(ix)? app.open(importFileList[ix]):firstDoc;
 if(sourceDoc){
// データを控える
		var currentWidth=sourceDoc.width.as("px");
		var currentHeight=sourceDoc.height.as("px");
		var currentResolution=sourceDoc.Reslution;
		maxWidth=(maxWidth>currentWidth)?maxWidth:currentWidth;
		maxHeight=(maxHeight>currentHeight)?maxHeight:currentHeight;
		maxResolution=(maxResolution>currentResolution)?maxResolution:currentResolution;
// ソースドキュメントをアクティブに
	app.activeDocument=sourceDoc;
	var myLayerName=app.activeDocument.name;//
// FAX系スキャナのデータは0.5固定のことが多い(FAX系TIFF)
	if(app.activeDocument.pixelAspectRatio!=1)
	{
		app.activeDocument.pixelAspectRatio=1;
	}
// ドキュメントが2値だったらグレースケールに変換(FAX系TIFF)
	if(app.activeDocument.mode==DocumentMode.BITMAP)
	{
		app.activeDocument.changeMode(ChangeMode.GRAYSCALE);
	}

//	if(app.activeDocument.layers.length>1).activeDocument.flatten();//複数レイヤかもしれないのでいったん統合
	var targetDoc=app.activeDocument;
	var tempDoc=targetDoc.duplicate(tempDoc,true);//複製を使ってマージ
//	app.activeDocument.mergeVisibleLayers();//なぜか正常に動作しないのでコメントアウト

try{
		app.activeDocument.artLayers[0].copy();
}catch(er){
//	alert(er+": どうやらエラー"):
	app.activeDocument.selection.fill(app.backgroundColor,ColorBlendMode.NORMAL,100);
	app.activeDocument.artLayers[0].copy()
	}
/*
    Captchaの際にデータが存在しないケースを判定して空のレイヤーを作成する必要あり
*/

 var orgBounds=app.activeDocument.artLayers[0].bounds;
 var TL=[orgBounds[0].as("px"),orgBounds[1].as("px" )];
 var BR=[orgBounds[2].as("px"),orgBounds[3].as("px" )];
 var OC=[targetDoc.width.as("px")/2,targetDoc.height.as("px")/2];
 var DC=[myDocument.width.as("px")/2,myDocument.height.as("px")/2];
 var newTL=add(DC,sub(TL,OC));
 var newBR=add(DC,sub(BR,OC));
var mySelectRegion=[
	newTL,
	[newBR[0],newTL[1]],
	newBR,
	[newTL[0],newBR[1]]
];
/*
var mySelectRegion=[
	[orgBounds[0].as("px"),orgBounds[1].as("px")],
	[orgBounds[2].as("px"),orgBounds[1].as("px")],
	[orgBounds[2].as("px"),orgBounds[3].as("px")],
	[orgBounds[0].as("px"),orgBounds[3].as("px")]
];

*/
/*	 レイヤの名前を整形するタイミングでフォルダエントリを行ってカウントをとる	*/
	var fileCount=exportFolders.addEntry(importFileList[ix]);
		if(myLayerName.match(/^(.*)\.[^.]+?$/i))
		{
			myLayerName=RegExp.$1;//拡張子を払う
	/* 最後のドットよりも前の文字列の取得 */
		}
//asTVPチェックがあれば、レイヤ名を整形
/*	先行で1.1の判定を行い　マッチしなかった場合1.0として処理	*/
	if(w.asTVP.value){
		if(myLayerName.match(/^\[(\d+)\]\[(\d+)\](.*)*/)){
			tvpLayerName=decodeURI(importFileList[ix].parent.name).split("]")[1];
			myLayerName=(RegExp.$3 != tvpLayerName)? RegExp.$3.replace(/^\s/,""):RegExp.$2;//フレームナンバーまたはインスタンス名
			if(w.doRenumber.value){myLayerName=myLayerName.replace(/\d+$/,nas.Zf(fileCount,4));}
//			myLayerName=(RegExp.$3 != tvpLayerName)? RegExp.$3.replace(/^\s/,""):(w.doRenumber.value==true)? nas.Zf(fileCount,4):RegExp.$2;//フレームナンバーまたはインスタンス名
//alert(myLayerName);
		}else{
			myLayerName=(w.doRenumber.value)?nas.Zf(fileCount,4):myLayerName.split("_").reverse()[0];//フレームナンバー
		}
	}else{

		if(w.doRenumber.value){myLayerName=myLayerName.replace(/\d+$/,nas.Zf(fileCount,4));}
//		if(true){myLayerName=myLayerName.replace(/\d+$/,nas.Zf(fileCount,4));}
	}
//確認
//		myLayerName=prompt("レイヤ名を確認",myLayerName);

//	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	tempDoc.close(SaveOptions.DONOTSAVECHANGES);
	targetDoc.close(SaveOptions.DONOTSAVECHANGES);
	if(w.rmOpt.value){importedList.push(importFileList[ix]);}
	app.activeDocument=myDocument;//複写先をアクティブに
	app.activeDocument.selection.select(mySelectRegion,SelectionType.REPLACE);//リジョンを選択　ドキュメント単位で左端がマッチ
//	app.activeDocument.selection.selectAll();//リジョンを選択　ドキュメント全体
	app.activeDocument.paste(true);//リジョンにペースト
// =======================================================レイヤマスク削除
var id42 = charIDToTypeID( "Dlt " );
    var desc9 = new ActionDescriptor();
    var id43 = charIDToTypeID( "null" );
        var ref6 = new ActionReference();
        var id44 = charIDToTypeID( "Chnl" );
        var id45 = charIDToTypeID( "Chnl" );
        var id46 = charIDToTypeID( "Msk " );
        ref6.putEnumerated( id44, id45, id46 );
    desc9.putReference( id43, ref6 );
executeAction( id42, desc9, DialogModes.NO );
//レイヤマスクができるのでそれを削除
// =======================================================オプションスイッチがあれば白抜き
if(w.rmWhite.value){
/*
	アニメセル用　Whiteパンチアウト
	レタス仕様でアルファチャンネルのない画像データから
	白([r,g,b]==[1.,1.,1.])部分を選択して削除するスクリプト
	色域選択でL==100.　の部分を選択して　削除後に選択領域を解除している。
	サスペンドヒストリが可能な場合は行う
*/

// =======================================================select color White
var descSelect = new ActionDescriptor();
var idFzns = charIDToTypeID( "Fzns" );
descSelect.putInteger( idFzns, 0 );
var idMnm = charIDToTypeID( "Mnm " );
var desc9 = new ActionDescriptor();
var idLmnc = charIDToTypeID( "Lmnc" );
desc9.putDouble( idLmnc, 100.000000 );
var idA = charIDToTypeID( "A   " );
desc9.putDouble( idA, 0.000000 );
var idB = charIDToTypeID( "B   " );
desc9.putDouble( idB, 0.000000 );
var idLbCl = charIDToTypeID( "LbCl" );
descSelect.putObject( idMnm, idLbCl, desc9 );
var idMxm = charIDToTypeID( "Mxm " );
var desc10 = new ActionDescriptor();
var idLmnc = charIDToTypeID( "Lmnc" );
desc10.putDouble( idLmnc, 100.000000 );
var idA = charIDToTypeID( "A   " );
desc10.putDouble( idA, 0.000000 );
var idB = charIDToTypeID( "B   " );
desc10.putDouble( idB, 0.000000 );
var idLbCl = charIDToTypeID( "LbCl" );
descSelect.putObject( idMxm, idLbCl, desc10 );
var idcolorModel = stringIDToTypeID( "colorModel" );
descSelect.putInteger( idcolorModel, 0 );
executeAction( charIDToTypeID( "ClrR" ), descSelect, DialogModes.NO );
//==============　selection clear and deselect
//ケースによっては選択範囲がない場合があるので、その場合は何もしない
var mySelectionBounds=false;
try{mySelectionBounds=app.activeDocument.selection.bounds;}catch(err){};
if(mySelectionBounds){
	app.activeDocument.selection.clear();
	app.activeDocument.selection.deselect();
}
}

	app.activeDocument.activeLayer.name=myLayerName;//レイヤにファイル名で名前を設定

	if(w.mkWS.value){
		var currentLayer=app.activeDocument.activeLayer;
		var myFolderName=decodeURI(importFileList[ix].parent.name);
		if(w.asTVP.value){
			if(myFolderName.match(/\[(\d+)\]\s(.+)/)){
				myFolderName=RegExp.$2;
			}else{
				var myDataArray=importFileList[ix].name.split("_");
				myFolderName=decodeURI(myDataArray.slice(1,myDataArray.length-1).join("_"));
			}
		}
		var destSet=false;
		try{	destSet=app.activeDocument.layerSets.getByName(myFolderName);
		}catch(err){
			destSet=app.activeDocument.layerSets.add();
			destSet.name=myFolderName;
		}
		currentLayer.move(destSet,ElementPlacement.PLACEATBEGINNING);//上積み
	}
 }
}
//解像度強制オプションがあれば、指定解像度に強制
if(forceResolution){
//alert(new nas.UnitResolution(myResolution).toString());
	var myDpi=new nas.UnitResolution(myResolution).as("dpi");//UnitResolution設置後に置きかえ
//	var myDpi=(myResolution.match("dpc"))?parseFloat(myResolution)*2.54:parseFloat(myResolution);
	app.activeDocument.resizeImage(undefined,undefined,myDpi,ResampleMethod.NONE)
}
//レジスタ読み込み前にレイヤセットのソートを行う
if(w.asTVP.value){
	var sortOrder=new Array();
	for (idx=0;idx<app.activeDocument.layers.length;idx++) sortOrder.push(app.activeDocument.layers[idx]);
	for (idx=0;idx<sortOrder.length;idx++) sortOrder[idx].move(app.activeDocument.layers[0],ElementPlacement.PLACEBEFORE);
}
//オプションがあれば、レジスタの読み込みを行う
if(w.rdRegistor.value){
//フレームセットにレジスタ画像とフレームを読み込み(フレームセットがない場合は作成)

var myTargetSet=app.activeDocument;

try{myTargetSet=app.activeDocument.layerSets["Frames"];}catch(err){
  //レジスタ格納用フレームセットを作る
  myTargetSet=app.activeDocument.layerSets.add();myTargetSet.name="Frames";
};
var currentUnitBase=app.preferences.rulerUnits;//控える
app.preferences.rulerUnits=Units.MM;

//レジスタ
  var myPegFile=new File(nasLibFolderPath+"resource/Pegs/"+nas.registerMarks.selectedRecord[1]);
  var myPegLayer=nas.axeAFC.placeEps(myPegFile);//この関数が曲者
  myPegLayer.name="peg";//上記の関数の実行後に最初にDOM操作したオブジェクトは取り消しを受けている
/*リネームをしなかった場合はレイヤの読み込み自体がUNDOされて読み込んだはずのレイヤが喪失してエラーが発生する*/
  myPegLayer.translate("0 mm",-1*myPegLayer.bounds[1]);//上辺へはっつけ
//100フレーム枠を読み込み
  var myFrameFile=new File(nasLibFolderPath+"resource/Frames/"
	+nas.inputMedias.selectedRecord[1]+"mm"
	+nas.inputMedias.selectedRecord[2].replace(/\//,"x")
	+".svg"
  );
  var  myFrameLayer=nas.axeAFC.placeEps(myFrameFile);//ポイント
//フレーム配置　今日はセンタリングのみで左右はパス 20110820
  var myOffset=(((myFrameLayer.bounds[3]-myFrameLayer.bounds[1])/2)+myFrameLayer.bounds[1]).as("mm")-nas.inputMedias.selectedRecord[7];
  myFrameLayer.name="frame";//この操作が取り消し対象ダミー
  myFrameLayer.translate(new UnitValue("0 mm"),new UnitValue(((myPegLayer.bounds[3]/2).as("mm")-myOffset)+" mm"));//タップからの距離を
  //フレーム格納レイヤセットがある場合のみそちらへ移動
if(myTargetSet){
    myFrameLayer.move(myTargetSet,ElementPlacement.PLACEATBEGINNING);
    myPegLayer.move(myTargetSet,ElementPlacement.PLACEATBEGINNING);
}
  if(!bootFlag){
    myPegLayer.name="peg";
    myPegLayer.blendMode=BlendMode.DIFFERENCE;
    myFrameLayer.name="frame";
    myFrameLayer.opacity=20;
  }
//ルーラーユニット復帰
app.preferences.rulerUnits=currentUnitBase;//復帰
}
//調整レイヤを作成
if(w.adLvl.value){
// ======================================================= 調整レイヤ作成
var idMk = charIDToTypeID( "Mk  " );
    var desc1 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idAdjL = charIDToTypeID( "AdjL" );
        ref1.putClass( idAdjL );
    desc1.putReference( idnull, ref1 );
    var idUsng = charIDToTypeID( "Usng" );
        var desc2 = new ActionDescriptor();
        var idNm = charIDToTypeID( "Nm  " );
        desc2.putString( idNm, "レベル補正" );
        var idType = charIDToTypeID( "Type" );
            var desc3 = new ActionDescriptor();
            var idpresetKind = stringIDToTypeID( "presetKind" );
            var idpresetKindType = stringIDToTypeID( "presetKindType" );
            var idpresetKindDefault = stringIDToTypeID( "presetKindDefault" );
            desc3.putEnumerated( idpresetKind, idpresetKindType, idpresetKindDefault );
        var idLvls = charIDToTypeID( "Lvls" );
        desc2.putObject( idType, idLvls, desc3 );
    var idAdjL = charIDToTypeID( "AdjL" );
    desc1.putObject( idUsng, idAdjL, desc2 );
executeAction( idMk, desc1, DialogModes.NO );

// ======================================================= チャンネル出力を137-255
//(フルレンジ画像をトレス用のダイナミックレンジに)
var idsetd = charIDToTypeID( "setd" );
    var desc4 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref2 = new ActionReference();
        var idAdjL = charIDToTypeID( "AdjL" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref2.putEnumerated( idAdjL, idOrdn, idTrgt );
    desc4.putReference( idnull, ref2 );
    var idT = charIDToTypeID( "T   " );
        var desc5 = new ActionDescriptor();
        var idpresetKind = stringIDToTypeID( "presetKind" );
        var idpresetKindType = stringIDToTypeID( "presetKindType" );
        var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
        desc5.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
        var idAdjs = charIDToTypeID( "Adjs" );
            var list1 = new ActionList();
                var desc6 = new ActionDescriptor();
                var idChnl = charIDToTypeID( "Chnl" );
                    var ref3 = new ActionReference();
                    var idChnl = charIDToTypeID( "Chnl" );
                    var idChnl = charIDToTypeID( "Chnl" );
                    var idCmps = charIDToTypeID( "Cmps" );
                    ref3.putEnumerated( idChnl, idChnl, idCmps );
                desc6.putReference( idChnl, ref3 );
                var idOtpt = charIDToTypeID( "Otpt" );
                    var list2 = new ActionList();
                    list2.putInteger( 137 );
                    list2.putInteger( 255 );
                desc6.putList( idOtpt, list2 );
            var idLvlA = charIDToTypeID( "LvlA" );
            list1.putObject( idLvlA, desc6 );
        desc5.putList( idAdjs, list1 );
    var idLvls = charIDToTypeID( "Lvls" );
    desc4.putObject( idT, idLvls, desc5 );
executeAction( idsetd, desc4, DialogModes.NO );
}
//最初のレイヤまたは背景レイヤを捨てる
	voidLayer.remove();//空の第一レイヤに対してペーストするとレイヤ自体が置換されるのでこれ不要
//最大オプションが付いていたら、最後に最大サイズに拡大する
if(w.mxSize){
	app.activeDocument.resizeCanvas(
		new UnitValue(maxWidth+" px"),
		new UnitValue(maxHeight+" px"),
		AnchorPosition.TOPCENTER
	)
	app.activeDocument.resolution=maxResolution;//＜これはあまり意味ないけど印刷サイズが最小になる
}
if(false){
//	ドキュメントが144dpi以外だったら144dpiにリサンプル
	if(app.activeDocument.resolution.toString()!="144 dpi")
	{
		app.activeDocument.resizeImage(this.width,this.height,144);
	}
}
	
	this.parent.close();
}
//w.cnBt.onClick=function(){}

w.show();
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};