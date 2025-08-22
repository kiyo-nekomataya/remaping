/*
	remaping xpsedit共用 UI同期テーブル

panelTabel 及び syncTable

syncTableマージ手続き
	xUI.syncTableMergeItems(syncTable)

panelTableマージ手続き
	xUI.panelTableMergeItems(panelTable)
*/
'use strict';
// synctable//
/*
xmap|xpst Editor UI sync tabel

fct    ;//フレームカウンタ
lvl    ;//キー変換ボタン
spinS    ;//スピンセレクタ
ipMode   ://入力モードセレクタ
title    ;//タイトル
subtitle    ;//サブタイトル
opus    ;//制作番号
create_time    ;//作成時間
update_time    ;//更新時間?これは要らない
create_user    ;//作成ユーザ
update_user    ;//更新(作業)ユーザ
scene    ;//シーン番号
cut    ;//カット番号
framerate    ;//フレームレート
undo    ;//アンドゥボタン
redo    ;//リドゥボタン
time    ;//時間
trin    ;//トランジション時間1
trout    ;//トランジション時間2
memo    ;//メモ欄
tag     ;//タイムラインタグ
lbl        ;//タイムラインラベル
info_    ;//セット変更 シート上書き
tool_    ;//セット変更 ツールボックス
pref_    ;//セット変更 設定パネル
scene_    ;//セット変更 ドキュメントパネル
about_    ;//セット変更 りまぴんについて
data_    ;//
dbg    ;//
winTitle;//ウィンドウタイトル文字列
productStatus    ;//制作ステータス 
server-info     ;//
historySelector ;//ヒストリセレクタ
referenceLabel  ;//リファレンスエリアのラベル
importControllers    ;//インポートリードアウトコントロール
*/
var syncTable_remaping = {
"server-info":function(){
	document.getElementById('headerRepository').innerHTML='<a onclick="serviceAgent.currentRepository.showInformation();" title="'+serviceAgent.currentRepository.owner.handle+'"><b>'+serviceAgent.currentRepository.name+'</b></a>';
},
"importControllers":function(){
//読み出しコントローラ抑制
	if(
		(serviceAgent.currentStatus=='online-single')&&
		(xUI.XPS.currentStatus.content.indexOf('Active')<0)
	){
		document.getElementById('updateSCiTarget').disabled=true;
		xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
		xUI.pMenu('pMopenFS','disable');        //ファイルオープン
		xUI.pMenu('pMopenFSps','disable');      //Photoshop用ファイルオープン
		document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
		document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
		document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
	}else{
		document.getElementById('updateSCiTarget').disabled=false;
		xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
		xUI.pMenu('pMopenFS','enable');        //ファイルオープン
		xUI.pMenu('pMopenFSps','enable');      //Photoshop用ファイルオープン
		document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
		document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
		document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
	}
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
	var myIdf  =Xps.getIdentifier(xUI.XPS);
	var editLabel = xUI.XPS.job.name;
	var editTitle = decodeURIComponent(myIdf);
// ラベルをすべて更新
	$("th").each(function(){
		if(this.id=='editArea'){
		    this.innerHTML =(this.innerHTML == 'Animation')? editLabel:'Animation';
		    this.title     = editTitle;
		};
	});
},
"referenceLabel":function(){

//referenceXPSエリアのラベル更新
/*
	リファレンスが編集中のデータと同エントリーでステージ・ジョブ違いの場合はissueの差分表示を行う。
タイトルテキストは
	同ステージのジョブなら    jobID:jobName
	別ステージのジョブならば  stageID:stageName//jobID:jobName
	別ラインのジョブならば    lineID:lineName//stageID:stageName//jobID:jobName
	別カットならば  IDFをすべて
ラベル表示は上記の1単語省略形で
	同ステージのジョブなら    jobName
	別ステージのジョブならば  stageName
	別ラインのジョブならば    lineName
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
		    this.title     = referenceTitle;
		};
	});
},
"historySelector":function(){
  ;//NOP
/* 一旦停止中
	var currentIdentifier = (xUI.uiMode == 'production')? Xps.getIdentifier(xUI.referenceXPS):Xps.getIdentifier(xUI.XPS);
	var currentEntry = serviceAgent.currentRepository.entry(currentIdentifier);
	if(! currentEntry) break;
	var myContentsLine ='';
	var myContentsStage='';var stid=-1;
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
		        }
		    }
		    if(matchResult>2){
		        myContentsJob += '<option value="'+currentEntry.issues[ix].identifier+'"' ;
		        myContentsJob += (matchResult>4)?
		            'selected >':' >';
		        myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"//"+currentEntry.issues[ix][3];
		        myContentsJob += '</option>'
		    }
		    
		}
		document.getElementById('pMstageList').innerHTML=myContentsStage;
		document.getElementById('jobSelector').innerHTML=myContentsJob;
;// */
},
"productStatus":function(){
//制作ステータスを画面同期
	if(xUI.activeDocumentId < 0 ) return;
	var targetData = xUI.activeDocument.content;
//書込制限フラグ設定
	xUI.viewOnly = ((targetData.pmu.currentNode)&&(targetData.pmu.currentNode.jobStatus.content == 'Active'))? false:true;
	if ((xUI.uiMode == 'management')||(xUI.sessionRetrace <= 0)){
		xUI.viewOnly = false;//管理モードとセッション追跡係数０以下のケースは解除
	};
//xMap画面上表示
	if(document.getElementById('documentDataNodexMap')){
		document.getElementById('documentDataNodexMap').innerHTML = (targetData.dataNode)?targetData.dataNode:'[未登録]//';
	};
//Xpst画面上表示(headerInfo)
		document.getElementById('documentIdf').innerHTML = ((targetData.dataNode)?targetData.dataNode:'[未登録]//') + decodeURIComponent(nas.Pm.getIdentifier(xUI.XPS));
		document.getElementById('headerInfoWritable').innerHTML  = (xUI.viewOnly)?'[編集不可] ':'[!]';
		document.getElementById('headerInfoWritable').innerHTML += String(xUI.sessionRetrace);//for debug
//Xpst画面上表示(headerInfoAlt)
	document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.toString(true);
	document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.toString(true);
	document.getElementById('jobSelector').innerHTML =
		'<option value="'+Xps.getIdentifier(xUI.XPS)+'" selected >'+[xUI.XPS.job.toString(true),decodeURIComponent(xUI.XPS.currentStatus)].join('//') +'</option>';
	if (xUI.viewOnly){
		document.getElementById('pmcui_documentWritable').innerHTML= '[編集不可] ';
		$('#documentWritable').show();
	}else{
		document.getElementById('pmcui_documentWritable').innerHTML= ' ';
		$('#documentWritable').hide();
	};
	document.getElementById('pmcui_documentWritable').innerHTML += String(xUI.sessionRetrace);//for debug
//ドキュメント共用ヘッダメニュー
	if(targetData.dataNode){
		$('#pmfui').hide();
/*    switch (xUI.uiMode){
	case 'production':
		document.getElementById('pmcui').style.backgroundColor = '#bbbbdd';//css切り替えに換装予定
		document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusEdit);
	break;
	case 'management':
		document.getElementById('pmcui').style.backgroundColor = '#ddbbbb';//css切り替えに換装予定
		document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusAdmin);
	break;
	case 'browsing':
		document.getElementById('pmcui').style.backgroundColor = '#bbddbb';//css切り替えに換装予定
		document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
	break;
	default:;// floating and other
		document.getElementById('pmcui').style.backgroundColor = '#dddddd';//css切り替えに換装予定
		document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
	};// */
	}else{
		$('#pmfui').show();
//        document.getElementById('pmcui').style.backgroundColor = '#dddddd';//css切り替えに換装予定
	};

//読み出しコントローラ抑制
	if(
		(serviceAgent.currentStatus=='online-single')&&
		(xUI.XPS.currentStatus.content.indexOf('Active')<0)
	){
		document.getElementById('updateSCiTarget').disabled=true ;
		xUI.pMenu('pMimportDatas','desable')                     ;//プルダウンメニュー  
		xUI.pMenu('pMopenFS','disable')                          ;//ファイルオープン
		xUI.pMenu('pMopenFSps','disable')                        ;//Photoshop用ファイルオープン
		document.getElementById('ibMimportDatas').disabled=true  ;//アイコンボタンインポート（オープン）
		document.getElementById('dataLoaderGet').disabled=true   ;//変換パネルの取り込みボタン
		document.getElementById('myCurrentFile').disabled=true   ;//ファイルインプット
	}else{
		document.getElementById('updateSCiTarget').disabled=false;
		xUI.pMenu('pMimportDatas','enable')                      ;//プルダウンメニュー  
		xUI.pMenu('pMopenFS','enable')                           ;//ファイルオープン
		xUI.pMenu('pMopenFSps','enable')                         ;//Photoshop用ファイルオープン
		document.getElementById('ibMimportDatas').disabled=false ;//アイコンボタンインポート（オープン）
		document.getElementById('dataLoaderGet').disabled=false  ;//変換パネルの取り込みボタン
		document.getElementById('myCurrentFile').disabled=false  ;//ファイルインプット
	};
//ドキュメント管理メニュー切り替えメソッドを呼び出し
	xUI.uiModeMenuUpdate();
},
"fct":function(){
    ;
//フレームの移動があったらカウンタを更新
	document.getElementById("fct0").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1],0,xUI.XPS.framerate);
	document.getElementById("fct1").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1],0,xUI.XPS.framerate);
},
"lvl":function(){
    ;
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
	//フォーカスのあるトラックの情報を取得
	if (xUI.Select[0]>0 && xUI.Select[0]<xUI.XPS.xpsTracks.length){
		var label=xUI.XPS.xpsTracks[xUI.Select[0]]["id"];
		var bmtd=xUI.XPS.xpsTracks[xUI.Select[0]]["blmtd"];
		var bpos=xUI.XPS.xpsTracks[xUI.Select[0]]["blpos"];
		var stat=(xUI.XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))?
		false:true;
	}else{
		var label=(xUI.Select[0]==0)? "台詞":"メモ";//
		var bmtd=xUI.blmtd;
		var bpos=xUI.blpos;
		var stat=true;
	}

	document.getElementById("activeLvl").value=label;
	document.getElementById("activeLvl").disabled=stat;
	//現在タイムリマップトラック以外はdisable  将来的には各トラックごとの処理あり
	document.getElementById("blmtd").value=bmtd;
	document.getElementById("blpos").value=bpos;
	document.getElementById("blmtd").disabled=stat;
	document.getElementById("blpos").disabled=stat;
	if(! document.getElementById("blpos").disabled) chkPostat();
},
"spinS":function(){
	document.getElementById("spinCk").checked       = xUI.spinSelect;
	document.getElementById('spinSlider').innerText = (xUI.spinSelect)? '連動' : '';
},
"ipMode":function(){
 ;//表示
	document.getElementById("iptChange").value     = xUI.ipMode;
	$("#iptChange").css('background-color',["#eee","#ddd","#ccc"][xUI.ipMode]);
	document.getElementById('iptSlider').innerText = ['','動画','原画'][xUI.ipMode];
	$('#iptSlider').css('left',["1px","22px","44px"][xUI.ipMode]);
},
"title":function(){
	var titleStyle=0;
		if(config.useworkTitle && workTitle[xUI.XPS["title"]]){
	if(workTitle[xUI.XPS["title"]].linkURL){
		var linkURL=workTitle[xUI.XPS["title"]].linkURL;
		var titleText=(workTitle[xUI.XPS["title"]].titleText)?workTitle[xUI.XPS["title"]].titleText:workTitle[xUI.XPS["title"]].linkURL;
		titleStyle += 1;
	}
	if(workTitle[xUI.XPS["title"]].imgSrc){
		var imgSrc=workTitle[xUI.XPS["title"]].imgSrc;
		var ALTText=(workTitle[xUI.XPS["title"]].ALTtext)?
		workTitle[xUI.XPS["title"]].ALTtext:workTitle[xUI.XPS["title"]].imgSrc;
		titleStyle += 10;
	}

	switch(titleStyle){
	case 11:    ;//画像ありリンクあり
		var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\"  target=_new><img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0></a>";
		break;
	case 10:    ;//画像のみ
		var titleString="<img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0>";
		break;
	case 1:        ;//画像なしリンクあり
		var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\" target=_new>"+xUI.XPS["title"]+" </a>";
		break;
	default:
		var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
	};

		}else{
			var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
		}
//
		if(document.getElementById("title")) document.getElementById("title").innerHTML=titleString;
	if((xUI.viewMode != "Compact")&&(xUI.activeDocument)&&(xUI.activeDocument.id > 0)){
		for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
			document.getElementById("title"+pg).innerHTML=titleString+"/"+xUI.XPS.subtitle;
	}
		}
		document.getElementById("XpsIdentifier").innerHTML=decodeURIComponent(Xps.getIdentifier(xUI.XPS,'cut'));
},
"opus":function(){
	if(document.getElementById('opus'))
	document.getElementById('opus').innerHTML =
	(xUI.XPS.opus)? xUI.XPS.opus : "";
	xUI.sync("title");
    ;
},
"subtitle":function(){
	if(document.getElementById('subtitle'))
	document.getElementById('subtitle').innerHTML =
	(xUI.XPS.subtitle)? xUI.XPS.subtitle : "";
	xUI.sync("title");
},
"create_time":function(){
},
"update_time":function(){
    ;//?これは要らない
	document.getElementById("update_time").innerHTML=(xUI.XPS.update_time)? xUI.XPS.update_time : "<br />";
	if(xUI.viewMode != "Compact"){
		for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
			document.getElementById("update_time"+pg).innerHTML=(xUI.XPS.update_time)? xUI.XPS.update_time : "<br />";
		}
	}
},
"update_user":function(){
	document.getElementById("update_user").innerHTML=
	(xUI.XPS.update_user)? (xUI.XPS.update_user.toString()).split(':')[0] : "<br />";
if((xUI.viewMode != "Compact")&&(xUI.activeDocument.id > 0)){
	for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		document.getElementById("update_user"+pg).innerHTML=(xUI.XPS.update_user)? (xUI.XPS.update_user.toString()).split(':')[0] : "<br />";
}
	}
},
"create_user":function(){
},
"current_user":function(){
	document.getElementById("current_user_id").value=xUI.currentUser.email;
},
"scene":function(){
},
"cut":function(){
	var scn= xUI.XPS["scene"]    ; 
	var cut= xUI.XPS["cut"]    ;
	
	var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  scn +" "+ cut :"<br />";

	document.getElementById("scene_cut").innerHTML=myValue;
if((xUI.viewMode != "Compact")&&(xUI.activeDocument.id > 0)){
	for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
}
	}
},
"winTitle":function(){
    ;
},
"framerate":function(){
    ;//break;
},
"time":function(){
//時間取得
	var timestr=nas.Frm2FCT(xUI.XPS.time(),3,0,xUI.XPS.framerate);
	document.getElementById("time").innerHTML=timestr;
	if((xUI.viewMode != "Compact")&&(xUI.activeDocument)&&(xUI.activeDocument.id > 0)){
		for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
			document.getElementById("time"+pg).innerHTML=(timestr)? timestr : "<br />";
		}
	}
},
"trin":function (){
//	xUI.sync("trin");
},
"trout":function(){
	var timestr=xUI.XPS.trout.time;
	var transit=xUI.XPS.trout.name;

	document.getElementById("trout").innerHTML= xUI.XPS.trout.toString();
	document.getElementById("transit_data").innerHTML = xUI.XPS.getNoteText();
},
"memo":function(){

	var memoText=xUI.XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
	document.getElementById("memo").innerHTML=memoText;
	if(document.getElementById("memo_prt")){document.getElementById("memo_prt").innerHTML=memoText;}
},
"tag":function(){
    ;
},
"lbl":function(){
    ;
//ラベルとタグは　UNDOの対処だが…
	xUI.resetSheet(); 
},
"info_":function(){
    ;//セット変更
	setTimeout(function(){xUI.sync('historySelector')},10);
	var syncset=
["opus","title","subtitle","time","trin","trout","scene","update_user","productStatus"];
	for(var n=0;n<syncset.length;n++){xUI.sync(syncset[n])};
},
"tool_":function(){
    ;//セット変更
	var syncset=["fct","lvl","undo","redo","spinS"];
	for(var n=0;n<syncset.length;n++){xUI.sync(syncset[n])};
},
"pref_":function(){
    ;//セット変更    
},
"scene_":function(){
    ;//セット変更
},
"data_":function(){
   ;
},
"dbg_":function(){
    ;
},
//sync呼び出しに際して無条件で実行
// windowTitle及び保存処理系
"_common":function(){
	if(xUI.activeDocument){
		var winTitle=decodeURIComponent(xUI.XPS.getIdentifier('cut'));// ウィンドウタイトル用のデータは
		if((appHost.platform == "AIR") && (fileBox.currentFile)){winTitle = fileBox.currentFile.name}
		//winTitle +=(xUI.isStored())?"":" *";
		if(! xUI.isStored()) winTitle = "*"+winTitle;
		if(document.title!=winTitle){document.title=winTitle};//違ってるときのみ書き直す
	  if(document.getElementById('pmcui')){
		if(! xUI.isStored()){
		    if(document.getElementById('pmcui-update').disabled == true) document.getElementById('pmcui-update').disabled = false;
		    xUI.pMenu('pMsave','enable');            
		}else{
		    if(document.getElementById('pmcui-update').disabled == false) document.getElementById('pmcui-update').disabled = true;
		    xUI.pMenu('pMsave','false');
	   }
	  }
	}else{
console.log('xUI は初期化前: yet init xUI');
	}
}
};//-----------syncTable_remaping//
/* TEST
    var conflictItem = [];
    for( var f in syncTable_remaping ){
        if(xUI.syncTable[f]){
            conflictItem.push(f);
        }else{
            xUI.syncTable[f] = syncTable_remaping[f];
        }
    };
if(conflictItem.length) console.log(conflictItem);
*/

// synctable//