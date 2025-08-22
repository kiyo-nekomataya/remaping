/*(06-カメラ設置)

クリップターゲット（カメラレイヤ）配置
	CompItem.addClipTarget()メソッドをコールすると
	クリップターゲット（カメラ）レイヤを最上段に追加します。
	プロジェクト内に流用可能な平面があれば、それを使用します。
	カメラのサイズは引数または、入力メディアDBから取得します。
	ターゲットを作成した際に同時にターゲットを参照するコンポ(通称「カメラコンポ」)を作成しています。

入力メディアDBは　nas.inputMedias　オブジェクトです。
	選択を切り替えるにはnasPref.jsxスクリプトを使用するか、
	またはnas/lib/nas_Otome_config.jsx　を直接書き換えてください。

*/
var exFlag=false;
try{
	if(nas.Version)
	{	exFlag=true; }
	}catch(err){
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
}
//===========================ライブラリチェック
if(exFlag){
//セレクトされたコンポがなければ終了
	var myComp="";
	if(! myComp){myComp=app.project.activeItem};
	if(!(myComp instanceof CompItem)) 
	{
		alert("コンポを指定してください")
	}else{
		myComp.addClipTarget();//カメラ設置
		// myComp.mkClipWindow();//カメラ参照コンポを同時に生成
	}
}