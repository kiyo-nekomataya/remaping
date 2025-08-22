/*(タイムシート適用)
	Xps SheetデータをPSDフレームアニメーションに適用
    undo 設定を行わない。
    この機能はチューニングの余地が多すぎるのでまだ最適化しないで置いておく 2011/09/25
*/

//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   $.evalFile(new File(Folder.userData.fullName+'/nas/lib/Photoshop_Startup.jsx'));
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
//	アニメーションモード判定を行ってフレームアニメーションモードでのみ動作
	var animationMode=nas.axeCMC.getAnimationMode();
if(animationMode!="frameAnimation"){
	alert(localize({en:"only use frameAnimationMode",ja:"フレームアニメーションモードのみで動作します"}));
}else{
       $.evalFile(new File(Folder.userData.fullName+'/nas/lib/newXps.jsx'));

//======制御オブジェクト/言語リソース
	var aplXps=new Object;
	aplXps.uiMsg={};
//動作抑制オブジェクト
	var XPS=new Xps();
//	nas.XPSStore=new XpsStore();

//動作チェック用タイムカウントオブジェクト
	var myTimeCount = new Object();
	myTimeCount.start   = new Date().getTime();
	myTimeCount.current = 0;
	myTimeCount.datas   = new Array();
	myTimeCount.datas.push(["started",0])
	myTimeCount.check   = function(myLabel){
		var now = new Date().getTime();
		this.datas.push([myLabel,now-this.start-this.current]);
		this.current=now-this.start;
	}

	if((app.documents.length)&&(app.activeDocument.name.match(/.*\.psd$/i))){
		myTimeCount.check("loadLib");
// 暫定処置用関数　後ほどライブラリへ移動予定
/*
	XPS用簡易ダイアログ他音声トラックパーサ

	音声系トラックのパースを行いセクションコレクションを戻すアルゴリズム
	単純
	データ列を順次チェック
	MAPへの問い合わせは基本的に無し
*/
/*
簡易オブジェクトで実装
エレメントのラップもしない

nas.AnimationSound Object
　同名のオブジェクトとの互換はあまり考えない
　名前が同じだけと思うが吉
　タイムシートサウンドトラックの値となる
　外部ファイルリンクはこの際割愛
bodyStream();	タイムシート内のストリームをテキストで取り出す（メソッド）
contentText;	String	内容テキスト原文
name;	String	ラベルとなる名称
bodyText;	String	
attributes;	Array	オブジェクト属性配列
comments;	Array	ノートコメントコレクション配列


*/
	nas.AnimationSound = function(myContent){
//	this.source;
//	this.duration;
//	this.startOffset;
	this.contentText=myContent;
	this.name="";
	this.bodyText="";
	this.attributes=[];
	this.comments=[];
}
//
/*
	初期化時の内容テキスト（シナリオ型式）をパースしてオブジェクト化するメソッド
	本来は自動実行だが、今回は必要に従ってコールする
*/
nas.AnimationSound.prototype.parseContent=function(){
	if(this.contentText.length){
		if(this.contentText.match(/^([^"'「]*)["'「]([^"'」]*)["'」]?$/)){ ;//"
			this.name=RegExp.$1;
			this.bodyText=RegExp.$2;
		}else{
			this.name="";
			this.bodyText=this.contentText;
		}
		var myAttributes=this.name.match(/\([^)]+\)/g)
		if(myAttributes){
			this.attributes=myAttributes;
			this.name=this.name.replace(/\([^)]+\)/g,"");
		}
		var myComments=this.bodyText.match(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g);
		if(myComments){
			this.comments=[];//newArray
			var myString=this.bodyText;
			for (var cix=0;cix<myComments.length;cix++){
				if(cix==0){
					var prevIndex=0;
				}else{
					var prevIndex=parseInt(this.comments[this.comments.length-1][0]);					
				}
				this.comments.push([prevIndex+myString.indexOf(myComments[cix]),myComments[cix]]);
				myString=this.bodyText.slice(prevIndex+this.comments[this.comments.length-1][0]+this.comments[this.comments.length-1][1].length);
			}
			this.bodyText=this.bodyText.replace(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g,"");
		}
		return this.toString();
	}else{return false;}	
}
/*
プロパティを組み上げてシナリオ型式のテキストを返す
*/
nas.AnimationSound.prototype.toString=function(){
	var myResult=this.name;
	myResult+=this.attributes.join("");
	myResult+="「";
	var startPt=0;
	if(this.comments.length){var endPt=this.comments[0][0]}else{var endPt=0};
for(var cix=0;cix<this.comments.length;cix++){
	myResult+=this.bodyText.slice(startPt,endPt)+this.comments[cix][1];
	startPt=endPt;
	if(cix<this.comments.length-1){endPt=this.comments[cix+1][0]};
}
if(startPt<this.bodyText.length){myResult+=this.bodyText.slice(startPt)};
	myResult+="」";
 return myResult;
}

//タイムラインをダイアログパースする
/*
	引数は、ストリーム文字列又は配列
	配列は１次のみ
	音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
	今回は省略
	開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
	後から仕様に合わせて再実装
	判定内容は
	/^[-_]{3,4}$/	開始・終了マーカー
	/^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/	インラインコメント
	その他は
	ブランク中ならばラベル
	音響Object区間ならばコンテントテキストに積む　空白は無視する
	⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
	オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
	
*/
parseSoundTrack =function(myStream){
	if(!(myStream instanceof Array)){myStream=myStream.split(",")};
	var myResultTL=new XpsTimelineTrack("temp","dialog");
	//この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
	//継続時間０で先に作成 同時にカラのサウンドObjectを生成
	var currentSection=myResultTL.addSection(false);
	var currentSound=new nas.AnimationSound("");//コンテンツはカラで初期化も保留
	for (var fix=0;fix<myStream.length;fix++){
		currentSection.duration ++;//currentセクションの継続長を加算
		//未記入データ　これが一番多いので最初に処理しておく
		if(myStream[fix]==""){
			continue;
		}
		//括弧でエスケープされたコメント又は属性
		if(myStream[fix].match(/^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/)){
			if(currentSection.value){
				currentSound.comments.push([currentSound.bodyText.length,RegExp.$1]);
			}else{
				currentSound.attributes.push(RegExp.$1);
			}
			continue;
		}
		//セクションセパレータ　少ない
		if(myStream[fix].match(/^[-_]{3,4}$/)){
			if(currentSection.value){
				currentSection.duration --;//加算した継続長をキャンセル
				currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
				currentSection=myResultTL.addSection(false);//新規のカラセクションを作る
				currentSection.duration ++;//キャンセル分を後方区間に加算
				currentSound=new nas.AnimationSound("");//サウンドを新規作成
			}else{
				currentSection=myResultTL.addSection(currentSound);//新規有値セクション作成
			}
			continue;
		}
//判定を全て抜けたデータは本文又はラベル　ラベルは上書きで更新
		if(currentSection.value){
			if(myStream[fix]=="|") myStream[fix]="ー";
			currentSound.bodyText+=myStream[fix];
		}else{
			currentSound.name=myStream[fix];
		}
	}
	return myResultTL;
}

//	 ダイアログタイムラインからから置きかえタイムラインへ変換したストリームを返すメソッド
/*
	 この置換えタイムラインの扱いを簡略化するために、タイムラインの統合は行なわない
	 台詞ボールドは必ず、トラックごとにレイヤセットを設けること
	 
	 Xpsに台詞用置きかえタイムラインを挿入するのは望ましくないので
	 まず行わない
	 望ましくは、psAxeではダイアログタイムラインのまま台詞ボールドを扱う
	 TVPaint用としては"[layerID][frameNo] _dialog#_-#"レイヤ名を与える
	 このルーチンは内部処理用で外部からコールすることはない（使うと弊害ありそう）
*/

XpsTimelineTrack.prototype.convertReplacement=function(){
	var myResult="";var currentIdx=1;
	for(var ix=0;ix<this.sections.length;ix++){
		currentSectionArray= new Array(this.sections[ix].duration);
		if(this.sections[ix].value){
			currentSectionArray[0]=currentIdx;
			currentIdx++;
		}else{
			currentSectionArray[0]="X";
		}
		myResult+=currentSectionArray.join(",");
	}
	return myResult;
}

//===========暫定ファンクションここまで

var myTarget=app.activeDocument;
myTarget.buildPsQueue=_buildPsQueue;
myTarget.setView=_setView;
if(myTarget.viewBuf){delete myTarget.viewBuf};//暫定的にviewBufクリア
var myXpsFile=new File([myTarget.fullName.path,myTarget.fullName.name.replace(/\.psd/,".xps")].join("/"));
//alert(myXpsFile);
 if(myXpsFile.exists){
	//ファイルが存在するので読み込み
		var myOpenfile = new File(myXpsFile.fsName);
		myOpenfile.encoding="UTF-8";
		myOpenfile.open("r");
		var myContent = myOpenfile.read();
		if(myContent.length==0){alert("Zero Length!");}
		myOpenfile.close();
		XPS.readIN(myContent);
		myTimeCount.check("readIN");
//=============
//ドキュメントにダイアログ変換によるテキストレイヤがあった場合は、テキストレイヤーに適合するタイムラインを挿入する
//番号部は"",2,3,4...
if(app.activeDocument.layerSets[0].name.match(/_dialog(\d*)_/)){
	var dialogTrackCount=(RegExp.$1.length)? RegExp.$1:1;
	var TLNames=[];
	for (var dtx=0;dtx<dialogTrackCount;dtx++){
		var dtCount=(dtx)? dtx+1:"";
		TLNames.push("_dialog"+dtCount+"_");
	}
		XPS.insertTL(-1,TLNames);
//ここで挿入されるタイムラインは全て"timing"一時タイムラインなので保存はされない。
		var currentType="dialog";var trackId=0;
	for (var tx=0;tx<(XPS.xpsTracks.length-dialogTrackCount-1);tx++){
		if(tx>0){currentType=XPS.xpsTracks[tx-1].option};
		if(currentType=="dialog"){
			var myTrack=parseSoundTrack(XPS.xpsTracks[tx]);
			XPS.put([XPS.xpsTracks.length-dialogTrackCount-trackId-1,0],myTrack.convertReplacement());
			trackId++;
		}
	}
}
//=============


//後処理に便利なのでシート参照配列を作成する。
	var myTargetOrder=0;//0はシート全体、そのほかは下から順に
if(myTarget.activeLayer.parent.typename!="Document"){
	for (var tlIx=0;tlIx<myTarget.layers.length;tlIx++){
		if(myTarget.layers[tlIx]==myTarget.activeLayer.parent){var myTargetOrder=(myTarget.layers.length-tlIx);break;}
	}
}
//ドキュメントの適用対象レイヤ数とシートのタイムライン数のうち小さい方をとってキュー配列をビルドする
//タイムシート上第一フレームが(カラでなく)未記入の場合は、スキップコードを埋める
var myTRs=new Array();
myTrCounts=(XPS.xpsTracks.length<myTarget.layers.length)? XPS.xpsTracks.length:myTarget.layers.length;
for(var idx=0;idx<myTrCounts;idx++){
	if(XPS.xpsTracks[idx+1][0]==""){
		myTRs.push(-1);
	}else{
		if((myTargetOrder==0)||((idx+1)==myTargetOrder)){myTRs.push(idx+1)}else{myTRs.push(-1)}
	}
}
//alert(myTRs.toString());//確認用
/*
	ドキュメントの選択状態をスイッチとして動作を切り替えるべき
	第一階層のLayerSetまたはArtLayerを選択していた場合はシート全体の適用
	第二階層のLayerSetまたはArtLayerを選択していた場合は当該タイムラインの適用を行う
	シートがない場合の動作は同じ。
	myTRsを再構成することで実装?
	制御パネルを表示してユーザ設定を促すように変更　2015/06/06
	同じスクリプトでタイムラインモード対応の処理をする
*/


		var myQueue=myTarget.buildPsQueue(XPS,myTRs);
		myTimeCount.check("buildQueue");
		//取得したQueue列をアニメーションフレームへ転換
		//表示初期化
		//アニメーションテーブル初期化
//くみ上げたキューが多数の場合は時間がかかるのでこの場で警告して処理スキップできるようにする
	var doApply=true;
// alert("queue= "+ myQueue.length +": "+ myTimeCount.datas[3][1]);
	if((myQueue.length>50)||(myTimeCount.datas[3][1]>20000)){doApply=confirm("(警告！)適用に1分以上かかるかもしれません。続行しますか？");}

	if(doApply){
		//アニメウィンドウを初期化する＞要するに全て消す
        nas.axeAFC.initFrames();
		myTimeCount.check("clearFrames");
//==============================================================
		//第一（キー）フレームを設定
		var myIndex=myQueue[0].index;
		var myDuration=myQueue[0].duration/XPS.framerate;//継続フレームを時間に変換
		myTarget.setView(myQueue[0]);
		nas.axeAFC.setDly(myDuration);
		//第二フレーム以降をループ設定
		for(var idx=1;idx<myQueue.length;idx++){
		 nas.axeAFC.duplicateFrame();//作る（フォーカス移動）
		 myDuration=myQueue[idx].duration/XPS.framerate;//継続フレームを時間に変換
		 myTarget.setView(myQueue[idx]);
		 nas.axeAFC.setDly(myDuration);
		}
	}else{alert(nas.localize(nas.uiMsg.aborted))};//処理中断

 }else{
/*
	ターゲットのXPSが存在しないので、現状のドキュメントに従う（と思われる）XPSをカラで生成して保存する
	可能ならその場で編集ユニットをコールする
	Framesレイヤセットがあれば内部をチェックして、タイトル・話数・時間を取得する
*/
	var myDuration = 72;//frames
	var titleString = nas.workTitles.select()[0]
	var opusString  = "";
	var sName = "";
	var cName = "";
	var frameSet   = myTarget.layers.getByName('Frames');
	if(! frameSet)  frameSet = myTarget.layers.getByName('_frames');//
	if(frameSet){
		for (var i = 0 ; i < frameSet.layers.length ; i ++ ){
			if(frameSet.layers[i].kind == LayerKind.TEXT){
				if(frameSet.layers[i].textItem.contents.match(/^\((.+)\)$/)){
					myDuration = nas.FCT2Frm(RegExp.$1);
				}else if(frameSet.layers[i].textItem.contents.match(/^s(.*)\-c(.+)$/)){
					sName = RegExp.$1; cName = RegExp.$2;
				}else if(frameSet.layers[i].textItem.contents.match(/^(.+)#(.+)$/)){
					titleString = RegExp.$1;opusString = RegExp.$2;
				};
			}else{
				if(frameSet.layers[i].name.match(/^\((.+)\)$/)){
					myDuration = nas.FCT2Frm(RegExp.$1);
				}else if(frameSet.layers[i].name.match(/^s(.*)\-c(.+)$/)){
					sName = RegExp.$1; cName = RegExp.$2;
				}else if(frameSet.layers[i].name.match(/^(.+)#(.+)$/)){
					titleString = RegExp.$1;opusString = RegExp.$2;
				};
			};
		};
	};
	var myFps=nas.FRATE.rate;
	var sheetLayers = [];//レイヤを選ぶ
	for ( var l = 0 ; l < myTarget.layers.length; l ++){
		if (myTarget.layers[l].name.match(/frames?|^_.+/i)) continue;
		sheetLayers.push(myTarget.layers[l]);
	};
	sheetLayers.reverse();
var layerCount = (sheetLayers.length + 2);
//暫定・Frames等無視するレイヤーセットを排除してトラック数をカウントに移行予定
	XPS.init(layerCount,myDuration);
	XPS.framerate = myFps;
	XPS.mapfile   = myTarget.fullName.fsName;
	XPS.title = titleString;
	XPS.opus  = opusString;
	XPS.scene = sName;
	XPS.cut   = cName;

	for(var lix = 0;lix < sheetLayers.length ; lix++){
		XPS.xpsTracks[lix+1].id  =(sheetLayers[lix].name.trim().replace(/\s/g,"%20"));
		XPS.xpsTracks[lix].sizeX =sheetLayers[lix].bounds[2].as("px")-sheetLayers[lix].bounds[0].as("px");
		XPS.xpsTracks[lix].sizeY =sheetLayers[lix].bounds[3].as("px")-sheetLayers[lix].bounds[1].as("px");
		XPS.xpsTracks[lix].lot   =(sheetLayers[lix].layers)?sheetLayers[lix].layers.length:1;
	}
//"タイムシートがありません。新規に作成して編集しますか？"
	if(confirm(nas.localize({en:"There is no exposure sheet. Are you sure you want to edit it to create a new?",ja:"タイムシートがありません。新規に作成して編集しますか？"}))){
	var fileSaveResult = editXpsProp(XPS);
//	alert(fileSaveResult);
		if((fileSaveResult)&&(myXpsFile.exists)){myXpsFile.execute()};
//保存してドキュメントを呼び出す
    if(false){
		myXpsFile.encoding="utf8"
		myXpsFile.open("w");
		myXpsFile.write(XPS.toString());
		myXpsFile.close();
		myXpsFile.execute();
    }
	}
 }
		myTimeCount.check("applyXPS");
		if (dbg){alert(myTimeCount.datas.toSource())};
 }else{
	alert (nas.localize(nas.uiMsg.savePsdPlease));//ドキュメントをpsd形式で保存してください。 
 }
//alert(XPS.toString())
}
