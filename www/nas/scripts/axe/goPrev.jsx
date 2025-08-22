/*(goPrev)
	アニメフレームを 前へ進める
	オプションでフォーカスも移動
タイムラインモード対応　移動をヒストリに置かない仕様に変更　2015.05
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
var myExcute="";
//=============== コード
if(nas.axeVTC.getDuration()){
	myExcute+='nas.axeVTC.goFrame("p");';	
}else{
	myExcute+='nas.axeAFC.goFrame("p");';
}
eval(myExcute)
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};