/*addFav.jsx
	お気に入りのレイヤに設定
*/
//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   $.evalFile(new File(Folder.userData.fullName+'/nas/lib/Photoshop_Startup.jsx'));
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
nas.axeCMC.execWithReference("timelineShowSetFavoriteLayers");
