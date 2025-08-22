//no launch
/*(シャットダウン)
 *	レンダー乙女シャットダウンprocess
 *	$Id: nasShutdown.jsx,v 1.1.4.2 2011/08/30 14:46:24 kiyo Exp $
 */
//シャットダウンプロセス
//システム監視ステータスが立っていたら終了する
if((nas.otome.systemWatcher)&&(nas.otome.systemWatcher.status!="stop")){
	nas.otome.systemWatcher("stop");
}
//TCJが立ち上がっていたらインターバルを止める
if((nas.TCJ)&&(nas.TCJ.fct.taskID)){
	nas.TCJ.fct.refresh.onClick();
}

//	設定群を保存
	nas.GUI.shutdown();
/*
	このファイルは、特にまだなくても平気ですが、
	ここでウィンドウの位置と最後のアクセスフォルダを記録しています。
	このファイルを
	～/Scripts/Shutdown/
	以下にコピーすると終了時に自動で記録できます。
*/
