/**
	remaping用　アプリ別設定ファイル
*/

/*

*/
if(typeof config == 'undefined') var config = {};
if(! config.app) config.app = {};
if(! config.app.remaping) config.app.remaping = {};
/*
	UI panelTable
*/
config.app.remaping.panelTable = {
  "Ver": {
    "elementId": "optionPanelVer",
    "type": "modal",
    "note": "アバウト(汎)"
  },
  "NodeChart": {
    "elementId": "optionPanelNodeChart",
    "type": "modal",
    "note": "ノードチャート(汎)"
  },
  "Pref": {
    "elementId": "optionPanelPref",
    "type": "modal",
    "note": "環境設定(汎)"
  },
  "Rol": {
    "elementId": "optionPanelRol",
    "type": "modal",
    "note": "書込み制限警告(汎)"
  },
  "File": {
    "elementId": "optionPanelFile",
    "type": "modal",
    "note": "サーバ｜ローカル ドキュメントブラウザ(汎)"
  },
  "SCI": {
    "elementId": "optionPanelSCI",
    "type": "modal",
    "note": "Xpsインポートパネル Importer(汎)"
  },
  "Prog": {
    "elementId": "optionPanelProg",
    "type": "modal",
    "note": "プログレス表示（汎）"
  },
  "Scn": {
    "elementId": "optionPanelScn",
    "type": "modal",
    "note": "Xpsタイムシート情報"
  },
  "Item": {
    "elementId": "optionPanelInsertItem",
    "type": "modal",
    "note": "新規アイテム挿入"
  },
  "Paint": {
    "elementId": "optionPanelPaint",
    "uiOrder": -1,
    "type": "float",
    "note": "手書きメモ(汎)"
  },
  "Draw": {
    "elementId": "optionPanelDraw",
    "uiOrder": -1,
    "type": "float",
    "note": "手書きメモv(汎)"
  },
  "Stamp": {
    "elementId": "optionPanelStamp",
    "uiOrder": -1,
    "type": "float",
    "note": "スタンプ選択"
  },
  "Text": {
    "elementId": "optionPanelText",
    "uiOrder": -1,
    "type": "float",
    "note": "テキストパネル"
  },
  "Timer": {
    "elementId": "optionPanelTimer",
    "uiOrder": -1,
    "type": "fix",
    "note": "ストップウォッチ(汎)"
  },
  "Sign": {
    "elementId": "optionPanelSign",
    "uiOrder": -1,
    "type": "float",
    "note": "署名パネル(汎)"
  },
  "Snd": {
    "elementId": "optionPanelSnd",
    "uiOrder": -1,
    "type": "float",
    "note": "remaping Dialog|Snd"
  },
  "Ref": {
    "elementId": "optionPanelRef",
    "uiOrder": -1,
    "type": "float",
    "note": "remaping 参考画像パネル"
  },
  "DocFormat": {
    "elementId": "optionPanelDocFormat",
    "uiOrder": -1,
    "type": "float",
    "note": "書式編集パネル"
  },
  "ImgAdjust": {
    "elementId": "optionPanelImgAdjust",
    "uiOrder": -1,
    "type": "float",
    "note": "画像調整パネル"
  },
  "Cam": {
    "elementId": "optionPanelCam",
    "uiOrder": -1,
    "type": "float",
    "note": "remaping カメラワーク入力補助パネル"
  },
  "Stg": {
    "elementId": "optionPanelStg",
    "uiOrder": -1,
    "type": "float",
    "note": "remaping ステージワーク入力補助パネル"
  },
  "Sfx": {
    "elementId": "optionPanelSfx",
    "uiOrder": -1,
    "type": "float",
    "note": "remaping コンポジット入力補助パネル"
  },
  "Tbx": {
    "elementId": "optionPanelTbx",
    "uiOrder": -1,
    "type": "float",
    "note": "remaping ツールボックス"
  },
  "Memo": {
    "elementId": "optionPanelMemo",
    "uiOrder": -1,
    "type": "float",
    "note": "Xpsメモ編集(xpsedit)"
  },
  "Login": {
    "elementId": "optionPanelLogin",
    "uiOrder": -1,
    "type": "fix",
    "note": "サーバログイン(汎)"
  },
  "menu": {
    "elementId": "pMenu",
    "uiOrder": 3,
    "type": "fix",
    "note": "WEB pulldown menu(汎)"
  },
  "Dbg": {
    "elementId": "optionPanelDbg",
    "uiOrder": -1,
    "type": "fix",
    "note": "debug console(汎)"
  },
  "ibC": {
    "elementId": "toolbarPost",
    "uiOrder": 1,
    "type": "fix",
    "note": "iconButtonColumn(汎)"
  },
  "ToolBr": {
    "elementId": "toolbarHeader",
    "uiOrder": 3,
    "type": "fix",
    "note": "remaping ツールバー"
  },
  "Utl": {
    "elementId": "optionPanelUtl",
    "uiOrder": 3,
    "type": "fix",
    "note": "remaping ユーティリティツール"
  },
  "headerTool": {
    "elementId": "headerTool",
    "uiOrder": 1,
    "type": "fix",
    "note": "remaping シートヘッダツール(カウンタ等)"
  },
  "inputControl": {
    "elementId": "inputControl",
    "uiOrder": 1,
    "type": "fix",
    "note": "remaping 入力コントロール"
  },
  "account_box": {
    "elementId": "account_box",
    "uiOrder": 3,
    "type": "fix",
    "note": "remaping アカウント表示"
  },
  "pmui": {
    "elementId": "pmui",
    "uiOrder": 2,
    "type": "fix",
    "note": "remaping 作業管理バー(旧)"
  },
  "pmcui": {
    "elementId": "pmcui",
    "uiOrder": 1,
    "type": "fix",
    "note": "remaping 作業管理バーアイコン(新)"
  },
  "appHdBr": {
    "elementId": "applicationHeadbar",
    "uiOrder": 1,
    "type": "fix",
    "note": "uat アプリケーションヘッドバー"
  },
  "SheetHdr": {
    "elementId": "sheetHeaderTable",
    "uiOrder": -1,
    "type": "fix",
    "note": "remaping シートヘッダ"
  },
  "docHdUI": {
    "elementId": "documentHdUI",
    "uiOrder": 3,
    "type": "fix",
    "note": "ドキュメントヘッダUI(xpsedit)"
  },
  "docHdr": {
    "elementId": "xpsInfoTable",
    "uiOrder": -1,
    "type": "fix",
    "note": "ヘッダ情報テーブル(xpsedit)"
  },
  "extSig": {
    "elementId": "extSig",
    "uiOrder": -1,
    "type": "fix",
    "note": "ヘッダ拡張署名欄(xpsedit)"
  },
  "memoArea": {
    "elementId": "memoArea",
    "uiOrder": -1,
    "type": "fix",
    "note": "ヘッダXpsメモ欄(xpsedit)"
  },
  "Data": {
    "elementId": "optionPanelData",
    "uiOrder": -1,
    "type": "fix",
    "note": "remaping Import|Export(汎)"
  },
  "AEKey": {
    "elementId": "optionPanelAEK",
    "uiOrder": -1,
    "type": "fix",
    "note": "remaping AEKey"
  },
  "Search": {
    "elementId": "optionPanelSearch",
    "sync": "search",
    "uiOrder": 4,
    "type": "fix",
    "note": "reName検索(汎)"
  },
  "PreviewSize": {
    "elementId": "optionPanelPreviewSize",
    "sync": "preview",
    "uiOrder": 4,
    "type": "fix",
    "note": "reNameプレビュー指定UI"
  },
  "ThumbnailSize": {
    "elementId": "optionPanelThumbnailSize",
    "sync": "thumbnail",
    "uiOrder": 4,
    "type": "fix",
    "note": "reNameサムネイルサイズ｜表示UI"
  },
  "prefix": {
    "elementId": "prefixStrip",
    "sync": "prefix",
    "uiOrder": 4,
    "type": "fix",
    "note": "reNameプレフィクスUI"
  },
  "suffix": {
    "elementId": "suffixStrip",
    "sync": "suufix",
    "uiOrder": 4,
    "type": "fix",
    "note": "reNameサフィックスUI"
  },
  "rename_setting": {
    "elementId": "rename_setting",
    "sync": "rename_setting",
    "uiOrder": 4,
    "type": "fix",
    "note": "reName 操作設定"
  },
  "flip_control": {
    "elementId": "flip_control",
    "sync": "flipControl",
    "uiOrder": 4,
    "type": "fix",
    "note": "reName フリップコントローラ"
  },
  "flip_seekbar": {
    "elementId": "flip_seekbar",
    "sync": "flipSeekbar",
    "uiOrder": 4,
    "type": "fix",
    "note": "reName フリップ再生シークバー"
  },
  "lightBoxControl": {
    "elementId": "lightBoxControl",
    "sync": "lightBoxControl",
    "uiOrder": 4,
    "type": "fix",
    "note": "reName ライトボックススイッチ"
  },
  "lightBoxProp": {
    "elementId": "lightBoxProperty",
    "sync": "lightBoxProp",
    "uiOrder": 4,
    "type": "fix",
    "note": "reName ライトボックス設定"
  },
  "Zoom": {
    "elementId": "screenZoom",
    "uiOrder": 4,
    "type": "fix",
    "note": "ズーム設定"
  },
  "Appearance": {
    "elementId": "docImgAppearance",
    "uiOrder": 4,
    "type": "fix",
    "note": "アピアランス設定"
  },
  "_exclusive_items_": {
    "type": "exclusive_item_group",
    "remaping": [
      "Data",
      "AEKey",
      "Tbx",
      "Sfx",
      "Stg",
      "Cam",
      "ImgAdjust",
      "DocFormat",
      "Ref",
      "Sign",
      "Stamp",
      "Draw",
      "Paint",
      "Item",
      "Scn",
      "File",
      "Snd"
    ],
    "xpsedit": [
      "Memo",
      "Data",
      "AEKey"
    ],
    "pman_reName": []
  }
};
/*
    application UI sync table for remaping|xpsedit
    xUI.syncTable

    xUI.sync UI表示同期プロシジャ要素テーブル
    オンメモリの編集バッファとHTML上の表示を同期させる
    共通(標準)キーワードは以下の通り

    about_
    undo
    redo
    windowTitle

    renameDigits
    prefix
    suffix
    preview
    ThumbnailSize
    PreviewSize
    Search

    各アプリケーションごとのキーは個別にこのテーブルに追加または上書きする
    テーブルの値は、同期情報オブジェクト、関数、文字列
    同期情報オブジェクトは{type:<同期タイプ>,value:<表示を切り替える判定条件式|設定する値を得る式>,items:[要素名の配列]}
    タイプ menu-enable|menu-check|radio-check|menu-value|show-hide
    関数|文字列式の場合は、定形外の処理を行うために単純に実行
*/
config.app.remaping.syncTabel = {
	"scale":function(){
			document.getElementById('pageZoom').value = Math.round(xUI.viewScale * 100);//Xの値のみを参照する
			document.getElementById('pageZoomSlider').value = document.getElementById('pageZoom').value;//Xの値のみを参照する
	},
	"paintColor"   :function(){ xUI.canvasPaint.syncColors();},
	"paintPalette" :function(){ xUI.canvasPaint.syncTools();},
	"paintTool"	:function(){ xUI.canvasPaint.syncTools();},
	"imgAdjust":function(){},
	"docImgAppearance":function(){
		document.getElementById('ImgAppearanceSlider').value = Math.floor(xUI.XPS.timesheetImages.imageAppearance*100);
		document.getElementById('ImgAppearance').value = document.getElementById('ImgAppearanceSlider').value;
	},
	"server-info":function(){
		document.getElementById('headerRepository').innerHTML='<a onclick="serviceAgent.currentRepository.showInformation();" title="'+serviceAgent.currentRepository.owner.handle+'"><b>'+serviceAgent.currentRepository.name+'</b></a>';
	},
	"importControllers":function(){
//読み出しコントローラ抑制
		if(
			(serviceAgent.currentStatus=='online-single')&&
			(xUI.XPS.currentStatus.content.indexOf('Active')<0)
		){
			document.getElementById('updateSCiTarget').disabled = true;
			xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','disable')     ;//ファイルオープン
			xUI.pMenu('pMopenFSps','disable')   ;//Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled = true;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled  = true;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled  = true;   //ファイルインプット
		}else{
			document.getElementById('updateSCiTarget').disabled=false;
			xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','enable')     ;//ファイルオープン
			xUI.pMenu('pMopenFSps','enable')   ;//Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled = false ;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled  = false ;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled  = false ;   //ファイルインプット
		};
	},
	"recentUsers":function(){
//ダイアログ類から参照される最近のユーザリスト
		var rcuList = "";
		for (var i=0;i<xUI.recentUsers.length;i++){
			rcuList += '<option value="';
			rcuList += xUI.recentUsers[i].toString();
			rcuList += xUI.currentUser.sameAs(xUI.recentUsers[i])?'" selected=true >':'">';
		}
		if(document.getElementById('recentUsers')) document.getElementById('recentUsers').innerHTML = rcuList;
	},
	"editLabel":function(){
//XPS編集エリアのラベル更新
/*
タイトルテキストは
	IDFをすべて
ラベル表示
	jobName
*/
	var myIdf	 = Xps.getIdentifier(xUI.XPS);
	var editLabel = xUI.XPS.job.name;
	var editTitle = decodeURIComponent(myIdf);
// ラベルをすべて更新
	$("th").each(function(){
		if(this.id=='editArea'){
			this.innerHTML =(this.innerHTML == 'Animation')? editLabel:'Animation';
			this.title	 = editTitle;
		};
	});
	},
	"referenceLabel":function(){
//referenceXPSエリアのラベル更新
/*
	リファレンスが編集中のデータと同エントリーでステージ・ジョブ違いの場合はissueの差分表示を行う。
タイトル(ポップアップ)テキストは
	同ステージのジョブなら	jobID:jobName
	別ステージのジョブならば  stageID:stageName//jobID:jobName
	別ラインのジョブならば	lineID:lineName//stageID:stageName//jobID:jobName
	別カットならば  IDFをすべて
ラベル表示は上記の1単語省略形で
	同ステージのジョブなら	jobName
	別ステージのジョブならば  stageName
	別ラインのジョブならば	lineName
	別カットならば  cutIdf(Xps.getIdentifier(true))
*/
		var myIdf  =Xps.getIdentifier(xUI.XPS);
		var refIdf =Xps.getIdentifier(xUI.referenceXPS);
		var refDistance = Xps.compareIdentifier(myIdf,refIdf);
		if(refDistance < 1){
			var referenceLabel = "noReferenece";//xUI.referenceXPS.getIdentifier(true);
			var referenceTitle = decodeURIComponent(refIdf);
		}else if(refDistance == 1){
			var referenceLabel = xUI.referenceXPS.line.name;
			var referenceTitle = [
				xUI.referenceXPS.line.toString(true),
				xUI.referenceXPS.stage.toString(true),
				xUI.referenceXPS.job.toString(true)
			].join('//');
		}else if(refDistance == 2){
			var referenceLabel = xUI.referenceXPS.stage.name;
			var referenceTitle = [
				xUI.referenceXPS.stage.toString(true),
				xUI.referenceXPS.job.toString(true)
			].join('//');
		}else if(refDistance >= 3){
			var referenceLabel = xUI.referenceXPS.job.name;
			var referenceTitle = xUI.referenceXPS.job.toString(true);
		}
// ラベルをすべて更新
		$("th").each(function(){
			if(this.id=='rnArea'){
				this.innerHTML = (this.innerHTML == referenceLabel)? 'Referenece' : referenceLabel;
				this.title	 = referenceTitle;
			};
		});
	},
	"historySelector":function(){
		var currentIdentifier = (xUI.uiMode == 'production')? Xps.getIdentifier(xUI.referenceXPS):Xps.getIdentifier(xUI.XPS);
		var currentEntry = serviceAgent.currentRepository.entry(currentIdentifier);
		if(! currentEntry) return;
		var myContentsLine ='';
		var myContentsStage=''; var stid=-1;
		var myContentsJob  ='';
		for (var ix=currentEntry.issues.length-1;ix >= 0;ix--){
			var matchResult=Xps.compareIdentifier(currentEntry.issues[ix].identifier,currentIdentifier);
			if(decodeURIComponent(currentEntry.issues[ix][2]).split(":")[0] == 0){stid=ix-1}
			if((stid == ix)||(ix == (currentEntry.issues.length-1))){
				if(matchResult>4){
					myContentsStage += '<li><span id="'+currentEntry.issues[ix].identifier+'" ' ;
					myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
					myContentsStage += 'class="pM">*';
					myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
					myContentsStage += '</span></li>'
				}else{
					myContentsStage += '<li><a id="'+currentEntry.issues[ix].identifier+'" ' ;
					myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
					myContentsStage += 'href="javascript:void(0)" ';
					myContentsStage += 'onclick="serviceAgent.getEntry(this.id)"> ';
					myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
					myContentsStage += '</a></li>'
				};
			};
			if(matchResult>2){
				myContentsJob += '<option value="'+currentEntry.issues[ix].identifier+'"' ;
				myContentsJob += (matchResult>4)?
					'selected >':' >';
				myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"//"+currentEntry.issues[ix][3];
				myContentsJob += '</option>'
			};
		};
		document.getElementById('pMstageList').innerHTML=myContentsStage;
		document.getElementById('jobSelector').innerHTML=myContentsJob;
	},
	"productStatus":function(){
		document.getElementById('documentIdf').innerHTML  = decodeURIComponent(Xps.getIdentifier(xUI.XPS));
		document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.toString(true);
		document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.toString(true);
		document.getElementById('jobSelector').innerHTML ='<option value="'+Xps.getIdentifier(xUI.XPS)+'" selected >'+[xUI.XPS.job.toString(true),decodeURIComponent(xUI.XPS.currentStatus)].join('//') +'</option>';
//		document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus.toString();
		document.getElementById('headerInfoWritable').innerHTML= (xUI.viewOnly)?'[編集不可] ':' ';
		if (xUI.viewOnly){
			document.getElementById('pmcui_documentWritable').innerHTML= '[編集不可] ';
			$('#documentWritable').show();
		}else{
			document.getElementById('pmcui_documentWritable').innerHTML= ' ';
			$('#documentWritable').hide();
		};
		document.getElementById('headerInfoWritable').innerHTML += String(xUI.sessionRetrace);
		document.getElementById('pmcui_documentWritable').innerHTML += String(xUI.sessionRetrace);
		switch (xUI.uiMode){
		case 'production':
			document.getElementById('pmcui').style.backgroundColor = '#bbbbdd';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusEdit);
		break;
		case 'management':
			document.getElementById('pmcui').style.backgroundColor = '#ddbbbb';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusAdmin);
		break;
		case 'browsing':
			document.getElementById('pmcui').style.backgroundColor = '#bbddbb';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
		break;
		default:;// floating and other
			document.getElementById('pmcui').style.backgroundColor = '#dddddd';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
		};
//読み出しコントローラ抑制
		if(
			(serviceAgent.currentStatus=='online-single')&&
			(xUI.XPS.currentStatus.content.indexOf('Active')<0)
		){
			document.getElementById('updateSCiTarget').disabled=true;
			xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','disable');		//ファイルオープン
			xUI.pMenu('pMopenFSps','disable');	  //Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
		}else{
			document.getElementById('updateSCiTarget').disabled=false;
			xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','enable');		//ファイルオープン
			xUI.pMenu('pMopenFSps','enable');	  //Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
		};
	},
	"fct":function(){
//フレームの移動があったらカウンタを更新
		document.getElementById("fct0").value = nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1],0,this.XPS.framerate);
		document.getElementById("fct1").value = nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1],0,this.XPS.framerate);
	},
	"lvl":function(){
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
//フォーカスのあるトラックの情報を取得
		if (xUI.Select[0]>0 && xUI.Select[0]<XPS.xpsTracks.length){
			var label=XPS.xpsTracks[xUI.Select[0]]["id"];
			var bmtd=XPS.xpsTracks[xUI.Select[0]]["blmtd"];
			var bpos=XPS.xpsTracks[xUI.Select[0]]["blpos"];
			stat=(XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))? false:true;
		}else{
			var label=(xUI.Select[0]==0)? "台詞":"メモ";//
			var bmtd=xUI.blmtd;
			var bpos=xUI.blpos;
			stat=true;
		};
		document.getElementById("activeLvl").value=label;
		document.getElementById("activeLvl").disabled=stat;
		if(document.getElementById('tBtrackSelect').link){
			document.getElementById('tBtrackSelect').link.select(xUI.Select[0]);
			document.getElementById('tBtrackSelect').onchange();
		};
//現在タイムリマップトラック以外はdisable  将来的には各トラックごとの処理あり
		document.getElementById("blmtd").value=bmtd;
		document.getElementById("blpos").value=bpos;
		document.getElementById("blmtd").disabled=stat;
		document.getElementById("blpos").disabled=stat;
		if(! document.getElementById("blpos").disabled) chkPostat();
	},
	"spinS":function(){
		document.getElementById("spinCk").checked	   = xUI.spinSelect;
		document.getElementById('spinSlider').innerText = (xUI.spinSelect)? '連動' : '';
	},
	"ipMode":function(){
//表示
		document.getElementById("iptChange").value	 = xUI.ipMode;
		$("#iptChange").css('background-color',["#eee","#ddd","#ccc"][xUI.ipMode]);
		document.getElementById('iptSlider').innerText = ['','動画','原画'][xUI.ipMode];
		$('#iptSlider').css('left',["1px","22px","44px"][xUI.ipMode]);
	},
	"title":function(){
		var titleStyle=0;
		if(useworkTitle && workTitle[XPS["title"]]){
			if(workTitle[XPS["title"]].linkURL){
				var linkURL=workTitle[XPS["title"]].linkURL;
				var titleText=(workTitle[XPS["title"]].titleText)?workTitle[XPS["title"]].titleText:workTitle[XPS["title"]].linkURL;
				titleStyle += 1;
			};
			if(workTitle[XPS["title"]].imgSrc){
				var imgSrc=workTitle[XPS["title"]].imgSrc;
				var ALTText=(workTitle[XPS["title"]].ALTtext)?
				workTitle[XPS["title"]].ALTtext:workTitle[XPS["title"]].imgSrc;
				titleStyle += 10;
			};
			switch(titleStyle){
			case 11:	;//画像ありリンクあり
				var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\"  target=_new><img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0></a>";
			break;
			case 10:	;//画像のみ
				var titleString="<img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0>";
			break;
			case 1:		;//画像なしリンクあり
				var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\" target=_new>"+XPS["title"]+" </a>";
			break;
			default:
				var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
			};

		}else{
			var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
		};
		if(document.getElementById("title")) document.getElementById("title").innerHTML=titleString;
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=titleString+"/"+XPS.subtitle;
			};
		};
		document.getElementById("XpsIdentifier").innerHTML=decodeURIComponent(Xps.getIdentifier(xUI.XPS,'cut'));
	},
	"opus":function(){
		if(document.getElementById(prop)) document.getElementById(prop).innerHTML=(XPS[prop])? XPS[prop] : "";
		xUI.sync("title");
	},
	"subtitle":function(){
		if(document.getElementById(prop)) document.getElementById(prop).innerHTML=(XPS[prop])? XPS[prop] : "";
		xUI.sync("title");
	},
	"create_time":function(){
		document.getElementById(prop).innerHTML = (xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
			};
		};
	},
	"update_time":function(){
		document.getElementById(prop).innerHTML = (xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
			};
		};
	},
	"update_user":function(){
		document.getElementById(prop).innerHTML = (XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
			};
		};
	},
	"create_user":function(){
		document.getElementById("current_user_id").value=xUI.currentUser.email;
	},
	"current_user":function(){
		document.getElementById("current_user_id").value=xUI.currentUser.email;
	},
	"scene":function(){
		var scn= xUI.XPS["scene"]; 
		var cut= xUI.XPS["cut"];
		var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
		document.getElementById("scene_cut").innerHTML=myValue;
		if(xUI.viewMode !="Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
			};
		};
	},
	"cut":function(){
		var scn= xUI.XPS["scene"]	; 
		var cut= xUI.XPS["cut"]	;
		var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
		document.getElementById("scene_cut").innerHTML=myValue;
		if(xUI.viewMode !="Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
			};
		};
	},
	"winTitle":function(){},
	"framerate":function(){},
	"undo":function(){
//undoバッファの状態を見てボタンラベルを更新
		stat=(xUI.activeDocument.undoBuffer.undoPt==0)? true:false ;
		$("#ibMundo").attr("disabled",stat);
	},
	"redo":function(){
//redoバッファの状態を見てボタンラベルを更新
		stat=((xUI.activeDocument.undoBuffer.undoPt+1)>=xUI.activeDocument.undoBuffer.undoStack.length)? true:false ;
		$("#ibMredo").attr("disabled",stat);
	},
	"time":function(){
//時間取得
		var timestr=nas.Frm2FCT(XPS.time(),3,0,XPS.framerate);
		document.getElementById(prop).innerHTML=timestr;
		if(xUI.viewMode !="Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(timestr)? timestr : "<br />";
			};
		};
	},
	"trin":function(){xUI.sync('trout');},
	"trout":function(){
		var timestr=nas.Frm2FCT(XPS[prop][0],3,0,XPS.framerate);
		var transit=XPS[prop][1];
		document.getElementById(prop).innerHTML=(XPS[prop][0]==0)? "-<br/>" : " ("+timestr+")";
		var myTransit="";
		if(XPS.trin[0]>0){
			myTransit+="△ "+XPS.trin[1]+'('+nas.Frm2FCT(XPS.trin[0],3,0,XPS.framerate)+')';
		};
		if((XPS.trin[0]>0)&&(XPS.trout[0]>0)){	myTransit+=' / ';}
		if(XPS.trout[0]>0){
			myTransit+="▼ "+XPS.trout[1]+'('+nas.Frm2FCT(XPS.trout[0],3,0,XPS.framerate)+')';
		};
		document.getElementById("transit_data").innerHTML=myTransit;
	},
	"memo":function(){xUI.sync('noteText')},
	"noteText":function(){
		var memoText=XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
		if(document.getElementById("memo")) document.getElementById("memo").innerHTML = memoText;//screen画面表示
		if(document.getElementById("memo_prt")){
			document.getElementById("memo_prt").innerHTML = memoText;//printout表示
		};
		var memoImage = xUI.XPS.noteImages.getByLinkAddress('description:');
		if(memoImage){
			document.getElementById('memo_image').style.top = document.getElementById('memo').offsetTop+'px'
//			document.getElementById("memo_image").src = memoImage.img.src;
//			document.getElementById("memo_image_prt").src = memoImage.img.src;
		};
	},
	"tag":function(){xUI.resetSheet()},
	"lbl":function(){xUI.resetSheet()},
	"info_":function(){
//セット変更
		setTimeout(function(){xUI.sync('historySelector')},10);
		var syncset=["opus","title","subtitle","time","trin","trout","scene","update_user","productStatus"];
//		["opus","title","subtitle","time","trin","trout","scene","update_user","memo"];
		for(var n=0;n<syncset.length;n++){xUI.sync(syncset[n])};
	},
	"tool_":function(){
//セット変更
		var syncset=["fct","lvl","undo","redo","spinS","scale"];
		for(var n=0;n<syncset.length;n++){xUI.sync(syncset[n])};
	},
	"pref_":function(){
//セット変更	
	},
	"scene_":function(){
//セット変更
	},
	"about_":function(){
//セット変更
		for(var N=0;N<2;N++){
			if(document.getElementById("myVer"+N)){document.getElementById("myVer"+N).innerHTML= windowTitle};
			if(document.getElementById("myServer"+N)){
				document.getElementById("myServer"+N).innerHTML=(xUI.onSite)? xUI.onSite:"[no server]";
			};
		};
	},
	"data_":function(){},
	"dbg_":function(){},
	"NOP_":function(){}
}

/*
	Window.title 更新予約関数トレーラー
	xUI.syncWindowTitle[appName]
	引数なしの関数を設定する
	eg.xUI.syncWindowTitle.remaping = function(){...}
	
*/
//xUI.syncWindowTitle = {};
config.app.remaping.syncWindowTitle = async function (){
//xUI.syncWindowTitle.remaping = async function (){}
//windowTitle及び保存処理系は無条件で変更
	if(xUI.init){
// ウィンドウタイトル
		var winTitle=decodeURIComponent(xUI.XPS.getIdentifier('cut'));
		if((appHost.platform == "AIR") && (fileBox.currentFile)){
			winTitle = fileBox.currentFile.name;
		};
		if(! xUI.isStored()) winTitle = "*"+winTitle;//未保存
		if(document.title != winTitle) document.title = winTitle ;//異なる場合のみ書き直す
		if(document.getElementById('pmcui')){
			if(! xUI.isStored()){
				if(document.getElementById('pmcui-update').disabled == true) document.getElementById('pmcui-update').disabled = false;
				xUI.pMenu('pMsave','enable');
			}else{
				if(document.getElementById('pmcui-update').disabled == false) document.getElementById('pmcui-update').disabled = true;
				xUI.pMenu('pMsave','false');
			};
		};
		if(xUI.canvasPaint.active) xUI.canvasPaint.syncCommand();
	};
}

/*
	このファイルはconfig.jsのアプリ別拡張データ
	config.jsよりもあと　なるべく早いタイミングで実行のこと
*/