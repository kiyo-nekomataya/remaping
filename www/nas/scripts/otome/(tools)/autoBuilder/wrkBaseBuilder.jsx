/*(オートビルダパネル)
<gear>
	wrkBaseBuilder.jsx:
	自動ビルダーが参照するワークベースフォルダを設定できます
	カットフォルダをかためておいてある場所を設定すると、次回作業から
	そこを中心にダイアログを開きますので便利です
	
	このパネルから自動ビルドを行なうことが可能です
 */
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: wrkBaseBuilder.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.5 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="wrkBaseBuilder";//識別用のモジュール名で置き換えてください。
if(false){
//二重初期化防止トラップ
try{
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)

//	nas[moduleName].show();
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
 */
	exFlag=true;//本来の初期化コマンドを無効にします。
}else{
//このスクリプトの識別モジュール名を登録します。
	nas[moduleName]=new Object();
}
		}catch(err){
//エラー時の処理をします。
	nas[moduleName]=new Object();
//		強制的に初期化(モジュール名登録)して。実行
//	alert("エラーです。モジュール登録に失敗しました");exFlag=false;
//		または終了
		}
	}
}catch(err){
//nas 環境自体がない(ライブラリがセットアップされていない)時の処理(終了)
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");	exFlag=false;
}
}else{	nas[moduleName]=new Object();}
//初期化およびGUI設定
if(exFlag){
// システム設定に置いたウィンドウのオフセット取得。
	myLeft=(nas.GUI.winOffset["wrkBaseBuilder"])?
	nas.GUI.winOffset["wrkBaseBuilder"][0] : nas.GUI.dafaultOffset[0];
	myTop=(nas.GUI.winOffset["wrkBaseBuilder"])?
	nas.GUI.winOffset["wrkBaseBuilder"][1] : nas.GUI.dafaultOffset[1];

// ///////////// GUI 設定 /////////////
/*	メッセージリソース（英語版はアトマワシ）
*/
if(false){
	var myMsgs=["ビルドパネル",
	"作業ベース / ターゲット　フォルダ",
	"追加 / 削除",
	"<no items>",
	"Build",
	"Cancel /Close",
	"Options",
	"連続処理　(　エントリーごとに確認メッセージを表示しない)",
	"インポート ( 指定フォルダを再帰検索してフッテージを読込 )",
	"環境構築 ( 自動ビルド環境を作成 )",
	"フッテージ振分 ( インポートしたフッテージを振分 )",
	"シート読込 ( 指定フォルダのタイムシートを検索して読込 )",
	"MAP構築 ( フッテージをシートに従って仮組 )",
	"ステージビルド ( 仮組した素材からステージ作成 )",
	"自動保存 ( 指定フォルダにプロジェクトを保存 )",
	"作業基点フォルダを変更します。",
	"フォルダを選択してください",
	" 個のフッテージをインポートしました。",
	"フッテージをインポート出来ませんでした。",
	" ：　を処理しますか？",
	"Build !",
	"Skip",
	"Abort",
	"ビルドしてみるです　なは　なは",
	"既存ファイルです",
	"対象コンポが無いようです。"
	]
}else{	var myMsgs=["Build Panel",
	"WorkBase / Target Folder",
	"add / remove",
	"<no items>",
	"Build",
	"Cancel /Close",
	"Options",
	"Continuous processing (without prompting for each entry)",
	"Import ( recursively find and load the footage specified folder )",
	"Construction ( create an automated build environment )",
	"divide footages (divice imported footage)",
	"read XPS (find and read XPS data from specified folder)",
	"build MAP ( build MAP)",
	"build Stage (  )",
	"save project( save the project in the specified folder )",
	"Change the WorkBaseFolder",
	"Please select a folder",
	" footages has been imported",
	" Could not import the footage.",
	" : proceed?",
	"Build !",
	"Skip",
	"Abort",
	"now trying to build",
	"existing file",
	"no target composition"
	]
}
// ウインドウ・オブジェクト初期化
	nas.wrkBaseBuilder=nas.GUI.newWindow("dialog",myMsgs[0],6,12,myLeft,myTop);
// プロパティ初期化・メソッド設定
		nas.wrkBaseBuilder.winBig=false;
		nas.wrkBaseBuilder.winResize=function(target)
		{
			newTop=this.bounds[0];
			newLeft=this.bounds[1];
			newRight=this.bounds[2];
			newBottom=this.bounds[3];
			if (! this.winBig){newBottom+=nas.GUI.lineUnit*10 ;this.winBig=true;}else{newBottom-=nas.GUI.lineUnit*10 ;this.winBig=false;}
			this.bounds=[newTop,newLeft,newRight,newBottom];
		}

	nas.wrkBaseBuilder.doAction="do";//連続実行フラグ
// ウィンドウにコントロールを配置
	nas.wrkBaseBuilder.locationLabel=nas.GUI.addStaticText(nas.wrkBaseBuilder,myMsgs[1],0,1,4,1);
	nas.wrkBaseBuilder.locationChg=nas.GUI.addButton(nas.wrkBaseBuilder,myMsgs[2],4,1,2,1);
	nas.wrkBaseBuilder.locationWell=nas.GUI.addButton(nas.wrkBaseBuilder,nas.GUI.workBase.current(),0,2,6,1);

//		nas.wrkBaseBuilder.locationWell.text=nas.wrkBaseBuilder.workBase.curennt();
	nas.wrkBaseBuilder.folderSelect=nas.GUI.addListBox(nas.wrkBaseBuilder,[myMsgs[3]],null,0,3,6,5,"multiselect")
//-------------------
/*
各オプションの依存関係を解決する共通メソッド
*/
_checkOpt=function(){
	if(this.value){
		for (idx in this.opt){
			var target=nas.wrkBaseBuilder["ck"+nas.Zf(this.opt[idx],2)];
			if (! target.value){target.value=true};
		}
	}else{
		for (idx in this.optA){
			var target=nas.wrkBaseBuilder["ck"+nas.Zf(this.optA[idx],2)];
			if (target.value){target.value=false};
		}
	}
}
//-------------------
	nas.wrkBaseBuilder.ck01=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[7],0,13,6,1,true);
		nas.wrkBaseBuilder.ck01.value=false;
		nas.wrkBaseBuilder.ck01.opt=[8];
		nas.wrkBaseBuilder.ck01.optA=[];
		nas.wrkBaseBuilder.ck01.onClick=_checkOpt;


	nas.wrkBaseBuilder.ck02=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[8],1,15,5,1);
		nas.wrkBaseBuilder.ck02.value=true;
		nas.wrkBaseBuilder.ck02.opt=[];
		nas.wrkBaseBuilder.ck02.optA=[3,4,5,6,7];
		nas.wrkBaseBuilder.ck02.onClick=_checkOpt;
	nas.wrkBaseBuilder.ck03=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[9],1,16,5,1);
		nas.wrkBaseBuilder.ck03.value=true;
		nas.wrkBaseBuilder.ck03.opt=[2];
		nas.wrkBaseBuilder.ck03.optA=[4,5,6,7];
		nas.wrkBaseBuilder.ck03.onClick=_checkOpt;
	nas.wrkBaseBuilder.ck04=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[10],1,17,5,1);
		nas.wrkBaseBuilder.ck04.value=true;
		nas.wrkBaseBuilder.ck04.opt=[2,3];
		nas.wrkBaseBuilder.ck04.optA=[5,6,7];
		nas.wrkBaseBuilder.ck04.onClick=_checkOpt;

	nas.wrkBaseBuilder.ck05=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[11],1,18,5,1);
		nas.wrkBaseBuilder.ck05.value=true;
		nas.wrkBaseBuilder.ck05.opt=[2,3,4];
		nas.wrkBaseBuilder.ck05.optA=[6,7];
		nas.wrkBaseBuilder.ck05.onClick=_checkOpt;
	nas.wrkBaseBuilder.ck06=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[12],1,19,5,1);
		nas.wrkBaseBuilder.ck06.value=true;
		nas.wrkBaseBuilder.ck06.opt=[2,3,4,5];
		nas.wrkBaseBuilder.ck06.optA=[7];
		nas.wrkBaseBuilder.ck06.onClick=_checkOpt;
	nas.wrkBaseBuilder.ck07=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[13],1,20,5,1);
		nas.wrkBaseBuilder.ck07.value=true;
		nas.wrkBaseBuilder.ck07.opt=[2,3,4,5,6];
		nas.wrkBaseBuilder.ck07.optA=[];
		nas.wrkBaseBuilder.ck07.onClick=_checkOpt;

	nas.wrkBaseBuilder.ck08=nas.GUI.addCheckBox(nas.wrkBaseBuilder,myMsgs[14],0,14,6,1);
		nas.wrkBaseBuilder.ck08.value=false;
		nas.wrkBaseBuilder.ck08.opt=[];
		nas.wrkBaseBuilder.ck08.optA=[];
		nas.wrkBaseBuilder.ck08.onClick=_checkOpt;
//
//	nas.wrkBaseBuilder.label02=nas.GUI.addEditText(nas.wrkBaseBuilder,"---",0,11,6,1);
//------------------------------------------------------------オプションチェック
	nas.wrkBaseBuilder.goButton=nas.GUI.addButton(nas.wrkBaseBuilder,myMsgs[4],1,9,4,1.5);
	nas.wrkBaseBuilder.optButton=nas.GUI.addButton(nas.wrkBaseBuilder,myMsgs[6],0,11,2,1);
	nas.wrkBaseBuilder.cancelButton=nas.GUI.addButton(nas.wrkBaseBuilder,myMsgs[5],4,11,2,1);

	nas.wrkBaseBuilder.optButton.onClick=function(){this.parent.winResize();};
	nas.wrkBaseBuilder.cancelButton.onClick=function(){this.parent.close();};

// コントロール初期化
	function baseLocationChange(myTargetFolder)
	{
		if(! myTargetFolder){return};
		if(myTargetFolder.exists){
//パスをワークベースに追加戻り値を表示
			nas.wrkBaseBuilder.locationWell.text=nas.GUI.workBase.insert(myTargetFolder);


// ターゲット候補ディレクトリリストアップ
	var items=Folder(nas.GUI.workBase.current()).getFiles();
	var targetNames=new Array();
	nas.wrkBaseBuilder.targetFolders=new Array();
	for (id in items)
	{
		if (items[id] instanceof Folder)
		{
			targetNames.push(decodeURI(items[id].name));
			nas.wrkBaseBuilder.targetFolders.push(items[id]);
		};
	}
			nas.wrkBaseBuilder.folderSelect.setOptions(targetNames,0);
		}
	};
//
	baseLocationChange(Folder(nas.GUI.workBase.change()));
	
//ワークベースヒストリにアクセスする機能を設定。ローカルファンクションにした方が良さそう
//	nas.wrkBaseBuilder.locationWell.onClick=function(){baseLocationChange(Folder(nas.GUI.workBase.change()));};
	nas.wrkBaseBuilder.locationWell.onClick=function(){
		var myLocation = nas.GUI.screenLocation(this);
		baseLocationChange(
			Folder(nas.GUI.workBase[
				nas.GUI.selectOptions(nas.GUI.workBase,nas.GUI.workBase.selected,this)
			])
		);
	};


	nas.wrkBaseBuilder.locationChg.onClick= function(){baseLocationChange(Folder.selectDialog(myMsgs[15]));}//変更ボタン

//	確認パネル
nas.wrkBaseBuilder.confirmAction=function(targetName)
{
	if(!(nas.wrkBaseBuilder.cfmDialog))
	{
		nas.wrkBaseBuilder.cfmDialog=nas.GUI.newWindow("dialog","--",7,4,320,240);
		nas.wrkBaseBuilder.cfmDialog.msgText=nas.GUI.addStaticText(nas.wrkBaseBuilder.cfmDialog,"",1,0,5,2);
		nas.wrkBaseBuilder.cfmDialog.btOK=nas.GUI.addButton(nas.wrkBaseBuilder.cfmDialog,myMsgs[20],0,3,2,1);
		nas.wrkBaseBuilder.cfmDialog.btSKIP=nas.GUI.addButton(nas.wrkBaseBuilder.cfmDialog,myMsgs[21],2,3,2,1);
		nas.wrkBaseBuilder.cfmDialog.btABORT=nas.GUI.addButton(nas.wrkBaseBuilder.cfmDialog,myMsgs[22],5,3,2,1);
	
		nas.wrkBaseBuilder.cfmDialog.btOK.onClick=function(){nas.wrkBaseBuilder.doAction="do";this.parent.close();};
		nas.wrkBaseBuilder.cfmDialog.btSKIP.onClick=function(){nas.wrkBaseBuilder.doAction="skip";this.parent.close();};
		nas.wrkBaseBuilder.cfmDialog.btABORT.onClick=function(){nas.wrkBaseBuilder.doAction="abort";this.parent.close();};
	}
	nas.wrkBaseBuilder.cfmDialog.text=targetName;
	nas.wrkBaseBuilder.cfmDialog.msgText.text=targetName+myMsgs[19];
	nas.wrkBaseBuilder.cfmDialog.show();
	
}

// コントロールのイベント設定
if(nas.wrkBaseBuilder.goButton){
nas.wrkBaseBuilder.goButton.onClick= function(){

//フォルダが無効な場合　選択を促す
	if(nas.wrkBaseBuilder.folderSelect.selected==null){alert(myMsgs[16]);return;};

nas.otome.writeConsole(nas.wrkBaseBuilder.folderSelect.selected.toString());
	for (var targetId=0;targetId<nas.wrkBaseBuilder.folderSelect.selected.length;targetId++)
	{
//どのケースでもターゲットは取得する
	targetFolder=new Folder(nas.wrkBaseBuilder.targetFolders[nas.wrkBaseBuilder.folderSelect.selected[targetId]].fsName);
//連続実行チェックが外れている場合は確認パネルを出力する

	if(!(this.parent.ck01.value))
	{
			this.parent.confirmAction(targetFolder.name);//
			if(nas.wrkBaseBuilder.doAction=="abort"){return;};//ループブレーク
			if(nas.wrkBaseBuilder.doAction=="skip"){continue;};//１アイテムスキップ
	}

//第一ステージ　インポート
//		インポートオプションがあればインポート実行
	if(this.parent.ck02.value)
	{
//プロジェクトが既存ならいったん閉じて新規作成
		if(app.project){app.project.close(CloseOptions.PROMPT_TO_SAVE_CHANGES);app.newProject();}
//指定フォルダの配下を自動登録
		myFootageCounts=nas.otome.getFootage(targetFolder);
		if(myFootageCounts)
		{
//インポートした直後にインポートしたファイルを検査する
//コンポとして読み込んだ静止画フッテージのフレームレートと継続時間を調整しておく(レート一致/継続時間1フレーム（秒？）に)
 for(var ix=0;ix<app.project.items.length;ix++){
		if((app.project.items[ix+1].selected)&&(app.project.items[ix+1] instanceof CompItem)){
			app.project.items[ix+1].frameRate=nas.FRATE.rate;
			app.project.items[ix+1].duration=1/nas.FRATE.rate;
		}
 }
			nas.otome.writeConsole(myFootageCounts +myMsgs[17]);
		}else{
			nas.otome.writeConsole(myMsgs[18]);
		}
	}
//第二ステージ 環境構築
if(this.parent.ck03.value){
	nas.otome.mkWorkFolders();//プロジェクト内にフォルダを構成する　タイムシートストアの初期化はこのとき自動で実行される
}
//第三ステージ フッテージ振り分け
if(this.parent.ck04.value){
	nas.otome.divideFootageItems();//フッテージ振り分け
}
//第四ステージタイムシートの読み込み
if(this.parent.ck05.value){
	var sheetCount=nas.otome.getXPSheets(targetFolder);
	if(sheetCount <= 0){
		XPS=new Xps(4);//4レイヤのカラＸＰＳで初期化する　良いのかどうだか不明なので注意
	}else{
		nas.XPSStore.pop(1);
	}
}
//第五ステージ‘マップ構築
if(this.parent.ck06.value){
//全アイテム選択解除;
		for(var idx=1;idx<=app.project.items.length;idx++){app.project.items[idx].selected=false;}
	//自動処理時点ではMap環境構築が終了しているのでファイルの選択を解除する必要がある
	//選択ファイルの解除を行なわないといったん振り分けたファイルを再振り分けで除外してしまう可能性があるため
	
		nas.otome.buildMAP();
}
//第六ステージ　タイムシートの数だけステージをビルドする
if(this.parent.ck07.value){
	if(app.project.items.length > myFootageCounts){
	nas.otome.writeConsole(myMsgs[23]);
		for(var idx=0;idx<nas.XPSStore.getLength();idx++)
		{
			var stgIndex=nas.XPSStore.select(idx+1);//セレクトしてバッファ転送
			var myStage=XPS.mkStage();
/*
				アクションフォルダ実行メソッドの実装によりビルド時の追加処理は全てアクションフォルダに切り替え済み
				標準（インストール）状態では以下の動作を行なう。ユーザによるカスタマイズは可能
//			myStage.applyXPS(XPS);//タイムシートを適用する
//			var myCameraLayer= myStage.addClipTarget();//ステージにカメラ（クリップターゲット）を登録する
//			if(myCameraLayer){var myClip=myStage.mkClipWindow()};//ステージをカメラコンポ（クリッピングコンポジション）に登録
//			var myOPM=myClip.mkOutputMedia();//クリッピングコンポを出力コンポに登録　ボールド（スレート）を作成
*/
		}
}
//第七ステージ　ウインドウをクローズする前にプロジェクトを保存する
if(this.parent.ck08.value){
	if(app.project.file){
		var myProjectFile=app.project.file;//すでに有るファイルを取得	
	}else{
		var myProjectFile=new File(targetFolder.fsName+"\\"+targetFolder.name+".aep");//新規作成
	}
		//ファイルが既存か否か確認して上書きまたは保存
	if(myProjectFile.exists)
	{
		myProjectFile=myProjectFile.saveDlg(myMsgs[24],"*.aep");
	}
		//キャンセルした場合は保存しないで次のステップに進む
	if((myProjectFile)&&(myProjectFile.parent.exists)&&(! myProjectFile.parent.readonly))
	{
		app.project.save(myProjectFile);//保存
	}
	this.parent.close();
	}else{
	clearOutput();
writeLn(myMsgs[25])
	}
}

}
	if(nas.wrkBaseBuilder.folderSelect.selected.length>0){this.parent.close()};
	}
}
//	終了処理
	nas.wrkBaseBuilder.onClose=function(){
//情報パネルが開いていたら更新する
		if(nas.otomeFEP){nas.otomeFEP.uiPanel.reloadInfo();}
//========================================================
	}
//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas.wrkBaseBuilder.onMove=function(){
nas.GUI.winOffset["wrkBaseBuilder"] =[nas.wrkBaseBuilder.bounds[0],nas.wrkBaseBuilder.bounds[1]];
	}
// ///////////// GUI 設定 終り ウィンドウ表示 /////////////
	nas["wrkBaseBuilder"].show();
};
	/*---- この下に初期化の必要ないコマンドを書くことが出来ます。----*/

//スクリプト終了
