/*(フォルダ監視エージェント-win)
<chr_w>

Windows用のフォルダ監視エージェントを起動します。
	二重起動の制限は行なっていませんので、ご注意ください。
複数のエージェントを起動すると　変更検出のたびにエージェントの数だけ呼び出しが発生するので、
そおことによって問題が発生する場合があります。
エージェントの管理は各自で行なってください。

Macをご利用の方は、システムのフォルダ監視機能を　nas.otome.systemWatcher.watchFolder　に対して設定することで同様の機能を実現できます。

終了はアプリケーションのメニューから終了を選択してください
*/
// 監視エージェント起動前にシステム監視のステータスを確認する。stop状態だった場合はsleepに切り替えて、起動直後に終了するのを防いでおく
if(nas.otome.systemWatcher()=="stop"){nas.otome.systemWatcher("sleep")};
// 監視エージェント起動
if(isWindows){
	var myAgent=File([Folder.scripts.path,"Scripts/nas/(temp)/ccX.exe"].join("/"));
	var watchFolder=nas.otome.systemWatcher.watchFolder;//Folder object
	if(! sendMsg){
	var sendMsg="nas.otome.systemWatcher.notice('%myBuffer%')";
	}

	try{
//	ここではステータスの変更とステータスフラグの作成更新のみを行なう
//	エージェントの起動はエージェントを固定することになるので行なわない
//	alert(["cmd start \"systemWatcher\" \"" ,nas.otome.systemWatcher.agent.fsName,"\" \"",startupStatus,"\" \"",watchFolder.fsName,"\" \"",sendMsg,"\""].join(""));
//	result=system.callSystem([nas.otome.systemWatcher.agent.fsName,"\" \"",startupStatus,"\" \"",watchFolder.fsName,"\" \"",sendMsg,"\""].join(""));
//alert(result)
//Macは別の起動が必要　&で
//バックグラウンド起動してもcallSystemは戻り値を待つのでこの場合は使用不能
//	system.callSystem([nas.otome.systemWatcher.agent.fsName,startupStatus,watchFolder.fsName,sendMsg,"&"].join(" "))
	prevFolderCurrent=Folder.current
	Folder.current=watchFolder;
	nas.otome.systemOpen(myAgent)
	Folder.current=prevFolderCurrent;
	}catch(er){nas.otome.writeConsole(er+" : エージェント起動に失敗")}
}else{
	var msg=[
	"これは、Windows専用の監視エージェントです。",
	"Windows環境でご利用ください。",
	"Macをご利用の方は、システムのフォルダ監視機能を",
	"  nas.otome.systemWatcher.watchFolder　",
	"に対して設定することで同様の機能を実現できます。"
	].join(nas.GUI.LineFeed);
	alert(msg);
}
