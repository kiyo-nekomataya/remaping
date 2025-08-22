/**
 *	@description キーフレームを有効化する
 *	アニメーション　ビデオタイムラインモードで動作
 *	プロパティアニメーショントラックはスクリプトからキーを作成すると
 *	有効になっていない状態でキーが作成されるのでそれを有効化する
 */
//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   $.evalFile(new File(Folder.userData.fullName+'/nas/lib/Photoshop_Startup.jsx'));
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
	if(nas.axeCMC.getSelectedItemId().length==1){
		nas.axeVTC.switchKeyTrack("enable");
	}