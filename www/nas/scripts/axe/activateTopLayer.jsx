//トレーラ内の最も上の表示レイヤをアクティブにする
if(app.documents.length){
//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   $.evalFile(new File(Folder.userData.fullName+'/nas/lib/Photoshop_Startup.jsx'));
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
//	上位レイヤをアクティブ;
  var myUndo=nas.localize(nas.uiMsg["activateUpperLayer"]);
  var myAction="";
	myAction+="nas.axeCMC.focusTop()";
  if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
}
