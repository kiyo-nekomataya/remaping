/*
	アクティブドキュメントに対応するXPSファイルを探して編集する
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
//==================================================================main

if(true){
//動作抑制オブジェクト
	var XPS=new Xps();
//	nas.XPSStore=new XpsStore();
}
if((app.documents.length)){
//
var myTarget=app.activeDocument;
if(myTarget.name.match(/.*\.psd$/i)){
	var myXpsFile=new File([myTarget.fullName.path,myTarget.fullName.name.replace(/\.psd/,".xps")].join("/"));

if(myXpsFile.exists){
	//ファイルが存在するので編集ソフトに渡して終了
		var myOpenfile = new File(myXpsFile.fsName);
		myOpenfile.execute();
}else{
	//ターゲットのXPSが存在しないので、
	//現状のドキュメントに従う（と思われる）XPSをカラで生成して保存する
	//可能ならその場で編集ユニットをコースする
	var myDuration=nas.FRATE.rate*3;//frames初期値３秒
	var myFps=nas.FRATE.rate;
//	(Framesフォルダをシートに入れるか否かを参照すること)
	var myTimelineCount=((true)&&(myTarget.layers[0].name=="Frames")&&(myTarget.layers[0].typename == "LayerSet"))?
		myTarget.layers.length-1:myTarget.layers.length;
	XPS.init(myTimelineCount,myDuration);
	XPS.mapFile="./"+myTarget.fullName.name;
	XPS.title=nas.workTitles.select()[0];
	XPS.create_user=nas.CURRENTUSER;
	XPS.update_user=nas.CURRENTUSER;
	XPS.framerate=myFps;
	XPS.cut=myTarget.name.replace(/\.psd/i,"");
	var mx=myTimelineCount;
	for(var lix=0;lix<mx;lix++){
		var psLayerId=(myTarget.layers.length!=mx)? mx-lix:mx-lix-1;
		XPS.layers[lix].name=(myTarget.layers[psLayerId].name.replace(/\s/g,""));//name設定時にencoding設定してレイヤ名から空白をエスケープすること
		XPS.layers[lix].sizeX=myTarget.layers[psLayerId].bounds[2].as("px")-myTarget.layers[psLayerId].bounds[0].as("px");
		XPS.layers[lix].sizeY=myTarget.layers[psLayerId].bounds[3].as("px")-myTarget.layers[psLayerId].bounds[1].as("px");
//lot が取得可能なのはレイヤセット（layersプロパテイがある）のみそれ以外は１で固定
		XPS.layers[lix].lot=(myTarget.layers[psLayerId].layers)?myTarget.layers[psLayerId].layers.length:1;
	}
	if(confirm(nas.localize({en:"There is no exposure sheet. Are you sure you want to edit it to create a new?",ja:"タイムシートがありません。新規に作成して編集しますか？"}))){
	var fileSaveResult=editXpsProp(XPS);
//	alert(fileSaveResult);
		if((fileSaveResult)&&(myXpsFile.exists)){myXpsFile.execute()};
if(false){
//保存して　ドキュメントを呼び出す
		myXpsFile.encoding="utf8";
		myXpsFile.open("w");
		myXpsFile.write(XPS.toString());
		myXpsFile.close();

		myXpsFile.execute();
}
	}
}
}else{
    alert(nas.localize({
	en:"If the file has not been saved as a psd, you can not create a sheet",
	ja:"ファイルがpsdとして保存されていない場合は、シートを作成できません"
    }));
}

}
//alert(XPS.toString())
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};