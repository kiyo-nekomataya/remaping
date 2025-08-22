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
//ドキュメントに署名欄をインポートする
//現在のアクティブレイヤーの上　左右センタリング　上辺から１インチ

var myTargetSet=app.activeDocument.activeLayer.parent;

var currentUnitBase=app.preferences.rulerUnits;//控える
var currentActiveLayer=app.activeDocument.activeLayer ;//控える
app.preferences.rulerUnits=Units.MM;

//署名欄
  var mySigFile=new File(Folder.nas.fullName+"/lib/resource/timeSheet6sA3-signature.svg");
  var mySigLayer=nas.axeAFC.placeEps(mySigFile);//この関数が曲者
  mySigLayer.name="signature";//上記の関数の実行後に最初にDOM操作したオブジェクトは取り消しを受けている
// リネームをしなかった場合はレイヤの読み込み自体がUNDOされて読み込んだはずのレイヤが喪失してエラーが発生する
  mySigLayer.translate("0 mm",-1*mySigLayer.bounds[1]+28);//上辺へはっつけ

  if(!bootFlag){
    mySigLayer.name="signature";
  }
//ルーラーユニット
app.preferences.rulerUnits=currentUnitBase;//復帰
//アクティブレイヤ
app.activeDocument.activeLayer=currentActiveLayer;//復帰

//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};