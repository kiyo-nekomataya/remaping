//no launch
/*(シャットダウン)
 *	レンダー乙女シャットダウンprocess
 *	nasShutdown.jsx v 3.0 2022/02/04 kiyo@nekomataya.info
 */
//シャットダウンプロセス
//システム監視ステータスが立っていたら終了する
	if((nas)&&(nas.otome)&&(nas.otome.systemWatcher)&&(nas.otome.systemWatcher.status!="stop")){
		nas.otome.systemWatcher("stop");
	};
//TCJが立ち上がっていたらインターバルを止める
	if((nas)&&(nas.TCJ)&&(nas.TCJ.fct.taskID)){
		nas.TCJ.fct.refresh.onClick();
	};
//	設定群を保存
	if((nas)&&(nas.GUI)){
		nas.GUI.shutdown();
		nas.writePreference();
	};
/*
	このファイルは、特にまだなくても平気ですが、
	ここでウィンドウの位置と最後のアクセスフォルダを記録しています。
	このファイルを
	～/Scripts/Shutdown/
	以下にコピーすると終了時に自動で記録できます。
*/
