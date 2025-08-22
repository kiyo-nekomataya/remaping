//no launch
/*(レンダー乙女コントロールセンタ)

	アニメ撮影ライブラリ自動構築パネル
	および環境ブラウザです
*/	
/*
	主にパネル起動を想定して作成されていますが、ウインドウ起動も可能です。
	ただし2重起動は禁止されますのでどちらかを選択して起動してください。
*/
if(true){
//
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: NasOtome.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.39 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="otomeFEP";//モジュール名はパネルとウィンドウで共用　２重起動は禁止
var myWindowName="uiPanel";//
//
var isDockingPanel	=(this.type=="panel")?true:false;// AE7以前の環境でPanelオブジェクトがないのでinstanceofは使用不能だった
/*

*/
//二重初期化防止トラップ
try{
//
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
			if(nas[moduleName])
			{
				if(nas[moduleName].isDockingPanel)
				{
					if(isDockingPanel){
						exFlag=true
					}else{
				//２回目以降の起動でかつ１回目はドッキングパネルなので今回がドッキングパネルならフラグ立てて実行　ウィンドウなら全停止
						var msg="ドッキングパネルで起動されています。";
						msg+=nas.GUI.LineFeed;
						msg+="ウインドウ起動はできません";
						msg+=nas.GUI.LineFeed;
						msg+="パネルを閉じてから起動してください";
						alert(msg);
						exFlag=false;
					};
				}else{
					//１回目がウインドウなので今回ドッキングなら終了
					if(isDockingPanel){
						var msg="ウインドウモードで起動されています。";
						msg+=nas.GUI.LineFeed;
						msg+="パネル起動はできません";
						msg+=nas.GUI.LineFeed;
						msg+="ウィンドウとパネルを閉じてからもう一度起動してください";
						alert(msg);
						exFlag=false;
					}else{
						if(nas[moduleName][myWindowName].show){nas[moduleName][myWindowName].show();};//これは復帰時に注意
						exFlag=false;//１回目がウインドウだったので２回目は初期化しない
					}
				}
			}else{
				nas[moduleName]=new Object();
				nas[moduleName].isDockingPanel=isDockingPanel;
			}
		}catch(err){
			nas[moduleName]=new Object();
			nas[moduleName].isDockingPanel=isDockingPanel;
		}
	}
}catch(err){
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}


if(exFlag)
{
	var myDefaultLeft	=nas.GUI.dafaultOffset[0];//ウィンドウ位置初期値を設定したい場合は
	var myDefaultTop	=nas.GUI.dafaultOffset[1];//お好きな値で置き換えてください。

	myLeft=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][0] : myDefaultLeft;
	myTop=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][1] : myDefaultTop;

// ///////////// GUI 設定 /////////////
// ウインドウ初期化
	if((this)&&(this instanceof Panel)){
		nas[moduleName][myWindowName]=this;//パネルの参照
	}else{
		nas[moduleName][myWindowName]=nas.GUI.newWindow("palette","nas-Project",6,14,myLeft,myTop);
	}

if(! nas[moduleName].isDockingPanel){
//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas[moduleName].onMove=function(){
nas.GUI.winOffset[myWindowName] =[nas[moduleName][myWindowName].bounds[0],nas[moduleName][myWindowName].bounds[1]];
	}
}
//
if(nas[moduleName].isDockingPanel){
	var myUIOffset=0;
	nas.otomeFEP.uiPanel.onClose=function(){delete nas.otomeFEP ;};//ウィンドウ終了時にオブジェクト削除　これはドッキングパネルの場合のみ標準処理にする
}else{
	var myUIOffset=0.5;
}
//ウィンドウコントロール配置
var w=nas[moduleName][myWindowName];
//タイトル（ラベルは省略）して opus/title/subtitle/Resolution/FrameRate
nas[moduleName][myWindowName].bt00=nas.GUI.addIconButton(w,"reflesh",0,0.2+myUIOffset,1,2,"default");
nas[moduleName][myWindowName].bt00.icon=nas.GUI.systemIcons["info"];
nas[moduleName][myWindowName].titleSummary=nas.GUI.addStaticText(w,"",1,0.3+myUIOffset,5,0.6);
nas[moduleName][myWindowName].xpsSummary=nas.GUI.addStaticText(w,"",1.3,0.9+myUIOffset,5,0.6);
nas[moduleName][myWindowName].mapSummary=nas.GUI.addStaticText(w,"",1.3,1.5+myUIOffset,5,0.6);
//タイムシートセレクタ
//nas[moduleName][myWindowName].stBrouse=nas.GUI.addListBox(w,[1,2,3,4,5,6,7,8],null,0,2+myUIOffset,6,3);
nas[moduleName][myWindowName].stBrouse=nas.GUI.addListBox(w,[1,2,3,4,5,6,7,8],null,0,2+myUIOffset,6,3,"multiselect");
//
nas[moduleName][myWindowName].bt01=nas.GUI.addButton(w,"自動処理",0,5.6+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt01.helpTip="フォルダを自動処理";
	nas[moduleName][myWindowName].bt01.onClick=function(){
		var myFilePath=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/autoBuilder/wrkBaseBuilder.jsx";
		nas.otome.doScript(myFilePath);
	}
nas[moduleName][myWindowName].bt02=nas.GUI.addButton(w,"新規ステージ",2,5.6+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt02.helpTip="選択したシートをビルド";
	nas[moduleName][myWindowName].bt02.onClick=function(){
/*
	ステージビルドは、以下のように動作すべき
	同名のシグネチャをもったセットがない場合はステージビルド＋後処理
	同名のシグネチャをもったセットが存在する場合　＞新規ビルド または　従前のセットを複製して　ステージ複製してクリップとopmは複製してステージ入れ替え　take++
	複数シートを選択の場合はマルチステージの出力セットを組む

イロイロ未実装2010/12/04　いまはXPSのビルドのみ
*/
		if(nas.XPSStore.select()){
			var stgName=[XPS.scene,XPS.cut].join("_");//ステージコンポ名暫定　ライブラリと同じルーチン　nas.itmFootStamps.stage[0]　参照
			var stgLength=XPS.duration;//フレーム数
			var stgResolution=nas.Dpi();
			var stgWidth="";
			var stgHeight="";
			var myOptions="";
			var msg=XPS.getIdentifiew +"　をビルドします。";
			//新規ステージのパネルが欲しい
			var myStage=XPS.mkStage(stgName,stgLength,stgResolution,stgWidth,stgHeight,myOptions);
		}else{
			alert("no XPS selected");
		}
	}
/*
	タイムシートの再適用
	選択されたタイムシートに関連付けられたステージにタイムシートを再度適用する。
	シートに変更がない場合は、その旨を警告してスキップする。
	タイミング変更を行なった場合の再適用
*/
nas[moduleName][myWindowName].bt03=nas.GUI.addButton(w,"シート適用",4,5.6+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt03.helpTip="シートを適用（現在のステージ）";
	nas[moduleName][myWindowName].bt03.onClick=function(){
		if(nas.XPSStore.selected){
			//プロジェクトを検索して現在選択中のシートに関連付けされているステージを全て更新する
/*
	リストアップして更新するステージセットを選択できるように作る?＞現状で選択されてるシートを使う
*/
//プロジェクトからコンポを抽出　プレフィックスでフィルタ
			for(var idx=1;idx<=app.project.items.length;idx++){
				if((app.project.item(idx) instanceof CompItem)&&(app.project.item(idx).name.indexOf(nas.itmFootStamps.stage[0])!=-1)){
					var myRootXPSidf=Xps.getIdentifier(app.project.item(idx).getRootXps());
					var myXPSidf	=Xps.getIdentifier(XPS);
					if(Xps.compareIdentifier(myXPSiff,myRootXPSidf) > 0){
						nas.otome.writeConsole("apply XPS toStage :"+app.project.item(idx).name);
						app.project.item(idx).applyXPS(XPS);
					};
				}
			}
		}else{
			alert("no XPS selected")
		}
	}

//nas[moduleName][myWindowName].bt04=nas.GUI.addButton(w,"reflesh",6,5.1+myUIOffset,1.5,1);
//	nas[moduleName][myWindowName].bt04.helpTip="";

nas[moduleName][myWindowName].bt11=nas.GUI.addButton(w,"ステージ削除",0,6.75+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt11.helpTip="選択したシートのステージセットを削除";
	nas[moduleName][myWindowName].bt11.onClick=function(){
/*
	削除はタイムシートの削除ではなくステージセットの削除
*/
		if(this.parent.stBrouse.selected instanceof Array)
		{
			var mySelection=this.parent.stBrouse.selected;
		}else{
			var mySelection=[this.parent.stBrouse.selected];
		}
		var myRemoval=new Array();
		for(var ix=0;ix<mySelection.length;ix++){
			var myIdentifier=nas.XPSStore.get(mySelection[ix]+1).getIdentifier();//チェックするシートの識別を取得
			//アイテム総当り
			for(var idx=1;idx<=app.project.items.length;idx++){
	
				if((app.project.item(idx) instanceof CompItem)){
					var myXps=app.project.item(idx).getRootXps();//コンポからXPS取得
					if(myXps){
						var myRootXPSidf=myXps.getIdentifier();//Xpsがあれば比較
						if(XPS.getIdentifier()==myRootXPSidf){
							myRemoval.push(app.project.item(idx));
						};
					}
				}
			}
		}
		if(myRemoval.length){
			if(confirm("選択したタイムシートからビルドした "+myRemoval.length+"個のコンポを削除します。よろしいですか？")){
				for(var idx=0;idx<myRemoval.length;idx++){
					myRemoval[idx].remove();
					nas.otome.writeConsole("removed :"+myRemoval[idx].name);
				}
				delete myRemoval;
			}
		}else{
			alert("no composition for selected XPS");
		}
	}
nas[moduleName][myWindowName].bt12=nas.GUI.addButton(w,"<監視エージェント起動>",2,6.75+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt12.helpTip="windows用監視エージェント起動";
	nas[moduleName][myWindowName].bt12.onClick=function(){
		var myFilePath=Folder.scripts.path.toString()+"/Scripts/nas/(sys)/rounchAgent_windows.jsx";
		nas.otome.doScript(myFilePath);
	}
nas[moduleName][myWindowName].bt13=nas.GUI.addButton(w,"シート削除",4,6.75+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt13.helpTip="タイムシートを削除";
	nas[moduleName][myWindowName].bt13.onClick=function(){
/*
	現在選択しているタイムシートを削除する
	ステージセットを同時に削除する事も可能
*/
		if(this.parent.stBrouse.selected instanceof Array)
		{
			var mySelection=this.parent.stBrouse.selected;
		}else{
			var mySelection=[this.parent.stBrouse.selected];
		}
		if(mySelection.length==0){return}
		if(confirm("選択された "+mySelection.length+" 個のタイムシートを削除します。タイムシートに関連付けられたコンポはそのまま残ります。よろしいですか？")){
				//nas.otome.beginUndoGroup("remove TimeSheet");
			for(var idx=mySelection.length-1;idx>=0;idx--){
				//alert(mySelection[idx]+1)
				var myRes=nas.XPSStore.remove(mySelection[idx]+1);//IDの大きい順に削除
//				if(myRes instanceof TextLayer){alert("current Sheet is :"+myRes.name)};
			}
				//nas.otome.endUndoGroup("remove TimeSheet");
		this.parent.reloadInfo();
//		nas.otomeFEP.uiPanel.reloadInfo
		}
	}
//nas[moduleName][myWindowName].bt14=nas.GUI.addButton(w,"reflesh",6,6.65+myUIOffset,2,1);
//	nas[moduleName][myWindowName].bt14.helpTip="";

nas[moduleName][myWindowName].bt21=nas.GUI.addButton(w,"簡易XPSリンカ",0,7.7+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt21.helpTip="旧インターフェース";
	nas[moduleName][myWindowName].bt21.onClick=function(){
		var myFilePath=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/autoBuilder/easyXPSLink.jsx";
		nas.otome.doScript(myFilePath);
	}
nas[moduleName][myWindowName].bt22=nas.GUI.addButton(w,"外部アプリ",2,7.7+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt22.helpTip="外部アプリでシートを編集";
	nas[moduleName][myWindowName].bt22.onClick=function(){
/*
	セレクタで選択されているシートを外部ファイルで編集する
	外部にあるファイルが保存されている場合は、そのファイルを編集してターゲットとして自動読み込み
	外部ファイルが無い場合は一時ファイルに書き出して編集する。
	同時にシートトレーラのレイヤの自動更新関数を監視フォルダに登録する。
	エージェントの起動は行なわない（アプリケーションが通知に対応していれば不要なので）
	シートトレーラーにタイムシートが無い場合は新規シート作成して使用すること
	このルーチンはインテリジェンスが低すぎて使いづらいので修正が必要
	シートに登録されたファイル位置が存在する場合はそのファイルを編集対象にすること（保存不要）
	新規シートの場合は保存パスを要求してそれを編集対象にする。
	一時フォルダはデータの更新でなく"notice.cmd"のやり取りを中心に構成すること 2011 0207
*/
		if(! nas.XPSStore.getLength()){
			//シートが無いのでXPSStoreを初期化してシートを作成
			nas.XPSStore.initBody();
			nas.XPSStore.add();
		};
		var myInfo=nas.XPSStore.getInfo();
		if((myInfo)&&(myInfo.url.length)){
		  var myFilePath=myInfo.url;
		  var myOpenFile=new File(myFilePath);
		}else{
		  var myFilePath=Folder.userData.fullName + "/"+ localize("$$$/nas=nas/")+"(temp)/"+XPS.getIdentifier()+".xps";
		  var myOpenFile=new File(myFilePath);
		}

		var mySelect=this.parent.stBrouse.selected;
//シートをひとつだけ選択
		if(mySelect instanceof Array){mySelect=this.parent.stBrouse.selected[0]}



		if(! isNaN(mySelect)){mySelect++};//0排除
		nas.otome.writeConsole("Selected index is "+mySelect);
		if(mySelect){
			var myCommand=function(){
					//コマンド内でthisがコマンドオブジェクトを示すのはデフォルト？
							alert(this.watchFile.exists);
					if(this.watchFile.exists){
						var myXps=new Xps();
						this.watchFile.open("r");
						myXps.readIN(this.watchFile.read());
						this.watchFile.close();
						if(this.targetCommand.index){
							nas.XPSStore.set(this.targetCommand.index,myXps);
							nas.XPSStore.update(this.targetCommand.index);
						}else{
							alert("noEffects")
						}
					}else{
						delete this;
					}
				};
//				myCommand.tempSheet=myOpenFile;
				myCommand.index=mySelect;
				nas.otome.writeConsole("added queue entory no."+nas.otome.systemWatcher.addCommand("all",myOpenFile,true,myCommand))
			}else{
				alert("no selected XPS");
			}
		alert(myOpenFile.fullName)
		if(! myOpenFile.exists){
		  var canWrite=myOpenFile.open("w");
		  if(canWrite){
			nas.otome.writeConsole("write tempfile :"+myOpenFile.fsName);
			myOpenFile.encoding="UTF-8";
			myOpenFile.write(XPS.toString());
			myOpenFile.close();
		  }else{
			nas.otome.writeConsole(myOpenFile.fullName+": これなんか書けないカンジ")
		  };//ファイルが既存かとか調べない　うほほ
		}
		if(myOpenFile.exists){nas.otome.systemOpen(myFilePath);}

		
	}
nas[moduleName][myWindowName].bt23=nas.GUI.addButton(w,"<<更新>>",4,7.7+myUIOffset,2.1,1);
	nas[moduleName][myWindowName].bt23.helpTip="システム監視の手動更新";
	nas[moduleName][myWindowName].bt23.onClick=function(){
/*
	システム監視オブジェクトの"notice"メソッドを実行します。
*/
		nas.otome.systemWatcher.notice();
//		var myFilePath=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/autoBuilder/boldEdit.jsx";
//		nas.otome.doScript(myFilePath);
	}
//nas[moduleName][myWindowName].bt24=nas.GUI.addButton(w,"reflesh",6,7.7+myUIOffset,2,1);
//	nas[moduleName][myWindowName].bt24.helpTip="";
/*
nas[moduleName][myWindowName].bt01=nas.GUI.addIconButton(w,"reflesh",0,5.7+myUIOffset,1,2,"");
	nas[moduleName][myWindowName].bt01.icon=nas.GUI.systemIcons["jsx_01"];
nas[moduleName][myWindowName].bt02=nas.GUI.addIconButton(w,"reflesh",1,5.7+myUIOffset,1,2,"jsx_02");
	nas[moduleName][myWindowName].bt02.icon=nas.GUI.systemIcons["jsx_02"];
nas[moduleName][myWindowName].bt03=nas.GUI.addIconButton(w,"reflesh",2,5.7+myUIOffset,1,2,"jsx_03");
	nas[moduleName][myWindowName].bt03.icon=nas.GUI.systemIcons["jsx_03"];
nas[moduleName][myWindowName].bt04=nas.GUI.addIconButton(w,"reflesh",3,5.7+myUIOffset,1,2,"jsx_04");
	nas[moduleName][myWindowName].bt04.icon=nas.GUI.systemIcons["jsx_04"];
nas[moduleName][myWindowName].bt05=nas.GUI.addIconButton(w,"reflesh",4,5.7+myUIOffset,1,2,"jsx_05");
	nas[moduleName][myWindowName].bt05.icon=nas.GUI.systemIcons["jsx_05"];

nas[moduleName][myWindowName].bt11=nas.GUI.addIconButton(w,"reflesh",0,7.2+myUIOffset,1,2,"jsx_06");
	nas[moduleName][myWindowName].bt11.icon=nas.GUI.systemIcons["jsx_06"];
nas[moduleName][myWindowName].bt12=nas.GUI.addIconButton(w,"reflesh",1,7.2+myUIOffset,1,2,"jsx_07");
	nas[moduleName][myWindowName].bt12.icon=nas.GUI.systemIcons["jsx_07"];
nas[moduleName][myWindowName].bt13=nas.GUI.addIconButton(w,"reflesh",2,7.2+myUIOffset,1,2,"jsx_08");
	nas[moduleName][myWindowName].bt13.icon=nas.GUI.systemIcons["jsx_08"];
nas[moduleName][myWindowName].bt14=nas.GUI.addIconButton(w,"reflesh",3,7.2+myUIOffset,1,2,"cat");
	nas[moduleName][myWindowName].bt14.icon=nas.GUI.systemIcons["jsx_09"];
nas[moduleName][myWindowName].bt15=nas.GUI.addIconButton(w,"reflesh",4,7.2+myUIOffset,1,2,"jsx_0A");
	nas[moduleName][myWindowName].bt15.icon=nas.GUI.systemIcons["jsx_0A"];
*/
//nas[moduleName][myWindowName].mapBrouse=nas.GUI.addListBox(w,[1,2,3,4,5,6,7,8],null,0,7.3+myUIOffset,6,6);
nas[moduleName][myWindowName].mapBrouse=w.add("treeview",nas.GUI.Grid(0.1,8.8+myUIOffset,6,5,w));
//nas[moduleName][myWindowName].mapBrouse.add("node","12345")
//nas[moduleName][myWindowName].mapBrouse.items[4].add("node","12345")
}
//	シートブラウザ初期化
{
	nas[moduleName][myWindowName].stBrouse.init=function()
	{
		var myOptions=new Array();
		if(true){
			for(var idx=1;idx<=nas.XPSStore.getLength();idx++){
				var myXps=nas.XPSStore.get(idx);
				myOptions.push("[ "+idx+" ] "+myXps.getIdentifier()+" ( "+nas.Frm2FCT(myXps.time(),3)+")");
			}
		}
		if(myOptions.length==0){
			myOptions.push("<<　------------ no  xpsSheets ------------　>>");//
		}
		this.options=myOptions;
		if(nas.XPSStore.selected){this.select(nas.XPSStore.selected.index-1);}else{this.select(0);}
	}
//シートブラウザ変更　カレントシートを切り替え
nas[moduleName][myWindowName].stBrouse.onChange=function()
	{
		nas.XPSStore.pop(this.selected+1);
	//	updateControl();
	 if(nas.XPSStore.length){
		this.parent.xpsSummary.text="[ "+nas.XPSStore.selected.index+" ] "+XPS.getIdentifier()+" ( "+nas.Frm2FCT(XPS.time(),3)+")";
	 }else{
		this.parent.xpsSummary.text="[ ---- ] "+XPS.getIdentifier()+" ( "+nas.Frm2FCT(XPS.time(),3)+")";
	 }
	}
}


//	マップブラウザ初期化
/*
	超暫定コーディング
	マップオブジェクトが実装されたらマップオブジェクトから取得するように書き換えること2010/11/10
	エレメント・ノードを選択した際の動作は相当するプロジェクトアイテムのセレクト…オープンはできた？
*/

	nas[moduleName][myWindowName].mapBrouse.init=function()
	{
		this.removeAll();//初期化
		var myMapFolder=app.project.items.getByName("[MAP]");
//		Map相当データが存在するか判定
		if(myMapFolder){
//	カテゴリ表示（これは表示上の仮ツリーなので注意　実際のグループはフラット構造で記録される　カテゴリは各グループのプロパティである）	
			for(var idx=1;idx<=myMapFolder.numItems;idx++){
				var myCat=myMapFolder.item(idx);
				this.add("node","[ "+idx+" ] "+myCat.name +" /"+myCat.numItems);//ノード加算
				if(myCat.numItems){
					//　ここでグループをリストアップする
					for(var gIdx=1;gIdx<=myCat.numItems;gIdx++){
						var myGroup=myCat.item(gIdx);
						var myLength=Math.floor(myGroup.duration/myGroup.frameDuration);//グループエレメントのエントリ数
						this.items[idx-1].add("node"," [ "+gIdx+" ] "+myGroup.name +" / "+myLength);
						//グループが存在する場合は最低でも１エントリ以上のエレメントが存在する（はず）
						for(var eIdx=1;eIdx<=myLength;eIdx++){
							this.items[idx-1].items[gIdx-1].add("item",myGroup.name+"-"+nas.Zf(eIdx,3));
						}
					}
				}
			}
		}else{
			this.add("item","<<　------------ no  MapData ------------　>>");
		}
	}
	nas[moduleName][myWindowName].mapBrouse.onChange=function()
	{
//		updateControl();
	}


nas.otomeFEP.uiPanel.bt00.onClick=function(){this.parent.reloadInfo()};
nas.otomeFEP.uiPanel.reloadInfo=function(){
	nas.otome.writeConsole("拡張情報再取得");
	this.titleSummary.text=nas.workTitles.selectedRecord[0]+" ( "+nas.inputMedias.selectedRecord[0]+" ) "+nas.outputMedias.selectedRecord[0];
	this.xpsSummary.text="";
	this.mapSummary.text="";
//自動ビルド環境がセットアップ済ならばタイムシートをスキャンしてデータを取得する
	this.stBrouse.init();
	this.mapBrouse.init();
}



//スタートアップ
if(! nas.otomeFEP.isDockingPanel){
	nas.otomeFEP.uiPanel.onClose=function(){delete nas.otomeFEP ;};//ウィンドウ終了時にオブジェクト削除　これはドッキングパネルの場合のみ標準処理にする
	nas[moduleName][myWindowName].show()};//パレットのときのみ初期化
}
	nas[moduleName][myWindowName].titleSummary.text=nas.workTitles.selectedRecord[0]+" ( "+nas.inputMedias.selectedRecord[0]+" ) "+nas.outputMedias.selectedRecord[0];
//	this.parent.xpsSummary.text="";
//	this.parent.mapSummary.text="";
	nas[moduleName][myWindowName].stBrouse.init();
	nas[moduleName][myWindowName].mapBrouse.init();
