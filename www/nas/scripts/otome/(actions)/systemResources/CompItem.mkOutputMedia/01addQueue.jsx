/*(レンダーキューに追加)

actionFolder 専用スクリプト

コンポをレンダーキューに追加する
コンポを選択した状態でアクションとして実行するとそのコンポをレンダーキューに登録します。
登録時にテンプレートの選択と名前の変更が可能

*/
//現状を取得　復帰時のバックアップを兼ねる
	var myRQitem=app.project.renderQueue.items.add(this);
	var myTPLIndex=app.preferences.getPrefAsString("Render Settings Preference Section v6","Default RS Index");//最後の設定内容を取得
switch(app.version.split('.').slice(0,2).join('.')){
  case	"11.0"	:	var outputModulePreferenceSection="Output Module Preference Section v24";break;
  default	:	var outputModulePreferenceSection="Output Module Preference Section v28";
}
	var myOPMIndex=app.preferences.getPrefAsString(outputModulePreferenceSection,"Default OM Index");

	var myTemplateName=myRQitem.templates[myTPLIndex];//AEの標準テンプレートを参照する場合はこれ
//		var myTemplateName="最良設定";//きめうち指定の場合は直接名前を指定
	var myOMName=myRQitem.outputModule(1).templates[myOPMIndex];//AEの標準テンプレートを参照する場合はこれ
//		var myOMName="QT-Animation";//きめうち設定の場合は直接名前を指定
	
	var gsName=[nas.workTitles.selectedRecord[2],XPS.scene,XPS.cut,"t1"].join("_");//nasタイトルDBから作成(超暫定版)

	var myStoreFile=myRQitem.outputModule(1).file;//この行を生かせば規定値が取得されます。
//		var myStoreFile=new File("C:\\Documents and Settings\\kiyo\\My Documents\\Render\\"+gsName);//こういう風に自前のフォルダを設定しちゃう
//		var myStoreFile=new File(Folder.current.fsName+"\\"+this.name+"_[###]");//出力先をファイルオブジェクトで指定
//=======================================================このブロックでいったん有無を言わせずにレンダーキューを設定しちゃう
//設定した内容をデフォルトとして打ち込む
	myRQitem.applyTemplate(myTemplateName);//レンダリングテンプレート適用
	myRQitem.outputModule(1).applyTemplate(myOMName);//第一出力モジュールにテンプレート適用
	myRQitem.outputModule(1).file=myStoreFile;//第一出力モジュールの保存先設定
/*
	レンダリングテンプレートおよび出力モジュールはサイトや作品ごとに
	異なるデータなので各自でセットアップしてください。
	指定をスキップした場合はAEのデフォルトの機能で
	最後に設定した内容が複製されます。
	
	この下の実行スイッチを切り替えると現在のDBから値を取得してセレクタを使うこともできます。
*/

if(false)
{
//=======================================================このブロックはＵＩで選択
//	現状のモジュールセットからインデックスを取り出す　(ない場合があるのでそこは注意だ)
//	該当なしの場合は初期値を使用
	for (var tpIdx=0;tpIdx<myRQitem.templates.length;tpIdx++)
	{
		if(myTemplateName==myRQitem.templates[tpIdx]){myTPLIndex=tpIdx;break;}
	}
	for (var omIdx=0;omIdx<myRQitem.outputModule(1).templates.length;omIdx++)
	{
		//nas.otome.writeConsole(myOMName+" ; "+myRQitem.outputModule(1).templates[omIdx]+"///"+(myOMName==myRQitem.outputModule(1).templates[omIdx]))
		if(myOMName==myRQitem.outputModule(1).templates[omIdx]){myOPMIndex=omIdx;break;}
	}
//	以下ＵＩで編集
/*
	現状のコードではふたつ目以降の出力モジュールは編集できないが、それはサンプルなのでご勘弁
	通常使用でふたつ以上の出力モジュールが必要な場合は各自コードを書き足してください
	このブロックの判定をfalseにして実行をスキップしたほうが自動運用上は動作が切れずに快適です
	　2010.01.14
*/
var w=nas.GUI.newWindow("dialog","レンダーキューを編集 :"+(app.project.renderQueue.items.length),6,5);
		w.lbl1=nas.GUI.addStaticText(w,"テンプレート",0,0,2,1);
			w.sellectTPL=nas.GUI.addSelectButton(w,myRQitem.templates,myTPLIndex,2,0,4,1);
		w.lbl2=nas.GUI.addStaticText(w,"出力モジュール",0,1,2,1);
			w.sellectOPM=nas.GUI.addSelectButton(w,myRQitem.outputModule(1).templates,myOPMIndex,2,1,4,1);
		w.lbl3=nas.GUI.addStaticText(w,"保存先",0,2,2,1);
		w.btn0=nas.GUI.addButton(w,"変更",0,3,1.5,1);
			w.savePath=nas.GUI.addStaticText(w,decodeURI(myRQitem.outputModule(1).file.path.toString()+"/"),2,2,4,1);
			w.saveName=nas.GUI.addEditText(w,decodeURI(myRQitem.outputModule(1).file.name),2,3,4,1);

		w.Reset=nas.GUI.addButton(w,"Reset",0,4,2,1);
		w.cancel=nas.GUI.addButton(w,"Cancel (=remove)",2,4,2,1);
		w.OK=nas.GUI.addButton(w,"OK (=close)",4,4,2,1);

//コントロールメソッド
	w.sellectTPL.onChange=function()
	{
		myRQitem.applyTemplate(this.text);
					w.saveName.text=decodeURI(myRQitem.outputModule(1).file.name);

	}
	w.sellectOPM.onChange=function()
	{
		myRQitem.outputModule(1).applyTemplate(this.text);
					w.saveName.text=decodeURI(myRQitem.outputModule(1).file.name);
	}
	w.btn0.onClick=function()
	{
		var myFile=myRQitem.outputModule(1).file.saveDlg("保存ファイルを指定","*.*");
		if(myFile){
			Folder.current=myFile.parent;
			myRQitem.outputModule(1).file=myFile;
				w.savePath.text=decodeURI(myRQitem.outputModule(1).file.path.toString()+"/");
				w.saveName.text=decodeURI(myRQitem.outputModule(1).file.name);
		}		
	}
	w.saveName.onChange=function()
	{
		var myFile=new File(myRQitem.outputModule(1).file.path.toString()+"/"+encodeURI(this.text));
		if(myFile){
			myRQitem.outputModule(1).file=myFile;
				w.savePath.text=decodeURI(myRQitem.outputModule(1).file.path.toString()+"/");
				w.saveName.text=decodeURI(myRQitem.outputModule(1).file.name);
		}
	}
//リセットボタンで全復帰
	w.Reset.onClick=function()
	{
		myRQitem.outputModule(1).file=myStoreFile;
		w.sellectTPL.select(myTPLIndex);w.sellectTPL.onChange();
		w.sellectOPM.select(myOPMIndex);w.sellectOPM.onChange();
		
				w.savePath.text=decodeURI(myRQitem.outputModule(1).file.path.toString()+"/");
				w.saveName.text=decodeURI(myRQitem.outputModule(1).file.name);
	}
//きゃんせるボタンはこのキューを削除してウインドウを閉じる（継続不能）
	w.cancel.onClick=function()
	{
		myRQitem.remove();
		this.parent.close();
	}

//OKボタンはこの場合はクローズと同意
	w.OK.onClick=function(){this.parent.close();}
	
	w.show();
}