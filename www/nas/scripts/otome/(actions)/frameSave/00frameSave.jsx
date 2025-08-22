/*(フレームで保存)
<camera>
actionFolder 専用スクリプト

コンポの現在のフレームをレンダーキューに追加する

コンポを選択した状態でアクションとして実行するとそのコンポをレンダーキューに登録します。
登録時にテンプレートの選択と名前の変更が可能

*/
//現状を取得　復帰時のバックアップを兼ねる
	var myRQitem=app.project.renderQueue.items.add(this);
	var myTPLIndex=app.preferences.getPrefAsString("Render Settings Preference Section v5","Default RS Index");//最後の設定内容を取得 6.5-9.0 同名プロパティ
/*
switch(app.version.split('.').slice(0,2).join('.')){
case	"11.0":	var outputModulePreferenceSection="Output Module Preference Section v24";break;
case	"10.0":	var outputModulePreferenceSection="Output Module Preference Section v24";break;
case	"9.0":	var outputModulePreferenceSection="Output Module Preference Section v10";break;
case	"8.0":	var outputModulePreferenceSection="Output Module Preference Section v9";break;
case	"7.0":	var outputModulePreferenceSection="Output Module Preference Section v8";break;
default	:	var outputModulePreferenceSection="Output Module Preference Section v7";
}
*/
switch(app.version.split('.').slice(0,2).join('.')){
  case	"11.0"	:	var outputModulePreferenceSection="Output Module Preference Section v24";break;
  default	:	var outputModulePreferenceSection="Output Module Preference Section v28";
}

	var myOPMIndex=app.preferences.getPrefAsString(outputModulePreferenceSection,"Default OM Index");
//最後の設定内容を取得 6.5:v7	7.0:v8	8.0:v9	9.0:v10

//========================================以下の部分は必要にしたがって編集してご使用ください。変更UIはつけません
//	レンダリング設定	//
	var myTemplateName="最良設定";//きめうち指定の場合は直接テンプレート名を指定できます
//		var myTemplateName=myRQitem.templates[myTPLIndex]　;//AEの標準テンプレートを参照する場合はこの行を生かしてください
//	出力モジュール	//
	var myOMName="JPEG-Snap";//きめうち設定
//		var myOMName="Photoshop";//きめうち設定
//		var myOMName=myRQitem.outputModule(1).templates[myOPMIndex];//AEの標準テンプレートを参照する場合はこれ
//	出力ファイル名	//
//		var myStoreFile=new File(myRQitem.outputModule(1).file.parent.fsName+"\\[compName]_[startTimecode]");//出力先をファイルオブジェクトで指定 
		var myStoreFile=new File(myRQitem.outputModule(1).file.parent.fsName+"\\[compName]");//出力先をファイルオブジェクトで指定 

//	var myStoreFile=new File(":\\pocoApoco\\audio\\Icon\\[compName]");//こういう風に自前のファイルを設定しちゃう
//		var myStoreFile=myRQitem.outputModule(1).file;//この行を生かせば規定値が取得されます。
//		var myStoreFile=new File(myRQitem.outputModule(1).file.parent.fsName+"\\"+this.name+"_[###]");//出力先をファイルオブジェクトで指定 _%5B###%5D
/*
	出力ファイル名はマクロ展開が行なわれているようです。以下のマクロワードをファイル名に含めるとその部分は当該の文字列と置換が行なわれるようです。
	[projectName]
	[compName]
	[renderSettingsName]
	[outputModuleName]
	[fileExtension]
	[width]
	[height]
	[frameRate]
	[startFrame]
	[endFrame]
	[durationFrames]
	[#####]
	[startTimecode]
	[endTimecode]
	[durationTimecode]
	[channels]
	[projectColorDepth]
	[compressor]
	[fieldOrder]
	[pulldownPhase]
	そのほかの文字列は原則そのままでファイル名になるようです。
	＊注意＊
	静止画ファイルをレンダリングしたばあい 通常はシーケンスであるとみなされてフレームナンバーが付加されます。
	これを避けるには使用する出力モジュールテンプレートの設定で「コンポのフレーム番号を使用する」チェックをはずす必要があるようです。
	ただし、このチェックを外してレンダリングした場合　ファイル名"A.jpg"のレンダリングに対して"A.jpg00000"等のファイルがレンダリングされる
	ケースがあることを確認しております。
	この版のプログラムは、このケースに限り最後の数字をとったファイル名に置換を試みるようにコーディングしてあります。
*/
//=======================================================このブロックでいったん有無を言わせずにレンダーキューを設定しちゃう
//設定した内容をデフォルトとして打ち込む
	myRQitem.applyTemplate(myTemplateName);//レンダリングテンプレート適用
	myRQitem.outputModule(1).applyTemplate(myOMName);//第一出力モジュールにテンプレート適用
	myRQitem.outputModule(1).file=myStoreFile;//第一出力モジュールの保存先設定
//スチル設定なのでレンダリングモジュールの開始時間を現在のtime 継続時間を1フレーム分にする
	myRQitem.timeSpanStart=this.time;
	myRQitem.timeSpanDuration=this.frameDuration;
/*
	レンダリングテンプレートおよび出力モジュールはサイトや作品ごとに
	異なるデータなので各自でセットアップしてください。
	指定をスキップした場合はAEのデフォルトの機能で
	最後に設定した内容が複製されます。
	
	この下の実行スイッチを切り替えると現在のDBから値を取得してセレクタを使うこともできます。(true/false)
*/

if(true)
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
var w=nas.GUI.newWindow("dialog","レンダーキューを編集 :"+(app.project.renderQueue.items.length),6,6);
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
		w.Render=nas.GUI.addButton(w,"Render",0,5,6,1);

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
//Renderボタンを押すとレンダリングしてアイテム削除 もし必要そうならファイルをリネーム
	w.Render.onClick=function(){
	//現在のアイテムがレンダリング待ち以外の場合はアラートして復帰
	if(myRQitem.status != RQItemStatus.QUEUED)
	{
		alert("アイテムはレンダリング済か　または他の理由でレンダリングができない状態です");
		return;
	}
			//RQ総当りで現在のアイテム以外をオフにしてレンダリングを実行
	var RQbkup=new Array();
	for (var idx =0 ;idx<app.project.renderQueue.items.length;idx++)
	{	if(
			(app.project.renderQueue.item(idx+1).status==RQItemStatus.QUEUED)&&
			(myRQitem !== app.project.renderQueue.item(idx+1))
		){
//ターゲットアイテムと一致せずかつスタンバイしているアイテムをキューからはずして控える
//レンダリング後はアイテムのステータスが自動で変わるので控えておいたアイテムのみ復帰する
				RQbkup.push(idx);
				app.project.renderQueue.item(idx+1).render=false;
		}
	}
//レンダリングの際にファイル名が既存の場合はレンダリング名自体を変更して重複を回避する。
//(パーレン)でセパレートしたナンバリングファイル名(重複回避なのでこれで決め打ち)
var targetFile=new File(myRQitem.outputModule(1).file.fsName);
			nas.otome.writeConsole(targetFile.fsName)
if(targetFile.exists){
	var myNumber=1;
	var existsFiles=new Folder(myRQitem.outputModule(1).file.parent.fsName).getFiles(decodeURI(targetFile.name).replace(/\.[^\.]*$/,"\*\.\*"));
			nas.otome.writeConsole(decodeURI(targetFile.name).replace(/\.[^\.]*$/,"\*\.\*"));
			nas.otome.writeConsole(existsFiles.length);
	for(var fid=0;fid<existsFiles.length;fid++)
	{
		if(decodeURI(existsFiles[fid].name).match(/\(([0-9]+)\)\.[^\.]+$/)){
			var myCount=RegExp.$1*1;
			myNumber=(myCount >= myNumber)? myCount+1 : myNumber;
			nas.otome.writeConsole(existsFiles[fid].name+"  : "+myCount);
		};//拡張子の無いファイルは対象外
	}
	var myTargetName=targetFile.name.replace(/(\.[^\.]*$)/,"\("+nas.Zf(myNumber,3)+"\)$1");//番号つきファイル名作成
	myRQitem.outputModule(1).file=new File(targetFile.path+"/"+myTargetName);//更新
}
//レンダリング実行
	app.project.renderQueue.render();//レンダーしちゃう
			var targetName=decodeURI( myRQitem.outputModule(1).file.name) ;
//(拡張子を含んだ)ファイル名の後ろに何がしかの文字のあるファイルを検索してリネーム(なければレンダリング成功)
			var myFiles=new Folder(myRQitem.outputModule(1).file.parent.fsName).getFiles(targetName+"*");
			if(myFiles.length){	myFiles[0].rename(targetName)};
//控えたアイテムが待機状態であることを確認して復帰
for(var idx=0;idx<RQbkup.length;idx++)
{
	if(app.project.renderQueue.item(RQbkup[idx]+1).status==RQItemStatus.UNQUEUED)
	{app.project.renderQueue.item(RQbkup[idx]+1).render=true;}
}
		//ここを使えばレンダリング後にアイテム削除
		myRQitem.remove();
		//レンダリングしたらドロン
		this.parent.close();
		}
	//	UI表示
	w.show();
}