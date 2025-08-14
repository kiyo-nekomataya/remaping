/**
	@fileoverview
	@author kiyo@nekomataya.info (ねこまたや)
	Mmaping本体スクリプト
	XPSオブジェクトとMAPオブジェクトについては、
	以下のドキュメントを参照のこと
		http://www.nekomataya.info/remaping/teck.html

CEP・AIR・WEB-APP・UATサーバ上クライアント　兼用

mapエディタの為のデザイン参考　2016.04.05

*/
/*
xUI
	UIコントロールオブジェクト

*/
//----------------------------------- UIコントロールオブジェクトを作成、初期化
function new_xUI(){
	var	xUI={};

if (true){
	xUI.errorCode	=	0;
	xUI.errorMsg=[
"000:最終処理にエラーはありません",
"001:データ長が0です。読み込みに失敗したかもしれません",
"002:どうもすみません。このデータは読めないみたいダ",
"003:読み取るデータがないのです。",
"004:変換すべきデータがありません。\n処理を中断します。",
"005:MAPデータがありません",
"006:ユーザキャンセル",
"007:範囲外の指定はできません",
"008:",
"009:想定外エラー"
];
}

//------- UIオブジェクト初期化前の未定義参照エラーを回避するためのダミーメソッド
	xUI.Mouse=function(evt){return true;};
	//初期化前にバックアップデータの処理が発生するので暫定的に初期化しておく
	xUI.backupStore	="12345";	//作業バックアップ

//	初期化メソッド
// 編集対象となるバッファオブジェクトを与えて初期化する。
xUI.init	=function(XMap){
//	this.<prop> = <propertyValue>	;//プロパティ値の初期化
//-------------
	this.XMap=XMap;//XMapを参照するオブジェクト(将来の拡張用)

	this.viewMode	=ViewMode;	//表示モード Compact/WordProp

	this._checkProp=function(){
//バッファを確認してxUIのビュープロパティを更新
/*
		this.<viewProp>=<initValue>;
		if(XMap.<prop>){
			this.<viewProp>=<Function>(XMap.<prop>);
		}
*/
	}

	this._checkProp();//
	
//yank関連
	this.yankBuf={body:"",selection:""};	//ヤンクバッファは、comma、改行区切りのデータストリームで
	  this.yankBuf.valueOf=function(){return this.body;}
//undo関連
	this.flushUndoBuf();

//保存ポインタ関連

//シート入力関連
	this.eddt="";		//編集バッファ
	this.edchg=false;	//編集フラグ
	this.activeInput=null;//アクティブ入力エレメントを保持
//	アクセス頻度の高いDOMオブジェクトの参照保持用プロパティ
//	this["data_well"]=document.getElementById("data_well");//データウェル

//以下インターフェースカラー設定


//----------------------------------------------------------------------初期状態設定

};

//	xUIオブジェクト初期化終了 以下メソッド
//
/* ============================================================================ */



/**
引数:
	編集フラグ 切り替えと同時に表示を調整
	クラス変更したほうが良い
*/
xUI.edChg=function(status){

	this.edchg=status;
	document.getElementById("edchg").style.backgroundColor=
	(this.edchg)?
	"gray":"red";//表示
};
//
/**
引数:
	myModes	モードを数値または文字列で指定　数値で格納
	opt	オプション引数
	編集モードを変更してカラーをアップデートする
	リフレッシュつき
*/
xUI.mdChg=function(myModes,opt){
			//編集操作モード　0:通常入力　1:ブロック移動　2:区間編集
	if(typeof myModes == "undefined") myModes="normal";
//モード遷移にあわせてUIカラーの変更
	switch(myModes){
	case "section":
	case 2:
	break;
	case "block":	//フロートモードに遷移
	case "float":	//前モードがsectionだった場合は編集を解決
	case 1:		//前モードがノーマルだった場合はNOP
	break;
	case "normal":	//ノーマルモードに復帰
	case 0:		//前モードに従って終了処理をここで行う
	default :	//
	}
	//var bkRange=this.Selection.slice();
	return this.edmode;
}


/*	undoバッファ初期化
		undoバッファをクリアして初期化
			undoStackのデータ構造
		[セレクト座標,セレクション,入力データストリーム,[セレクト座標,セレクション]]
	または	[セレクト座標,セレクション,Xpsオブジェクト]

	座標と選択範囲は配列で、入力データはcomma、改行区切りで2次元のstream
	第３要素がXpsオブジェクトであった場合は、ドキュメント全体の更新が行われた場合である
	その際は、処理系を切り替えて以下の操作を行う
	従来、UNDOバッファをフラッシュしていた操作が行われた場合
	現状のXMapデータを、オブジェクト化してUndoバッファに積みundoポインタを加算する。
	オブジェクト化の際は参照が発生しないように新規のXpsオブジェクトを作成のこと

	セッション内で明示的にundoバッファをクリアする際はこのメソッドをコールする

clear	:	セッション開始/ユーザ指定時
NOP	:	新規作成/保存/ダウンロード

 */
xUI.flushUndoBuf=function(){
	this.inputFlag="nomal";//入力フラグ["nomal","undo","redo"]
	this.undoStack=new Array();//アンドウスタック
		this.undoStack.push([[0,1],[0,0],'']);
	this.undoPt=0;	//アンドウポインタ初期化
	this.storePt=0;	//保存ポインタ初期化
/* フラッシュのタイミングが変わるのでここでこれらは不要
	this.Backupdata=new Array();//編集バックアップトレーラ
	this.activeInput=null;//アクティブ入力ポインタ
*/
};

/*
	保存ポインタを参照してドキュメントが保存されているか否かを返す関数
	保存状態の変更とリセットも可能

 */
xUI.isStored=function(){return (this.undoPt==this.storePt)};//このリザルトが保存状態を表す
xUI.setStored=function(myPt){
	switch(myPt){
	case "current":this.storePt=this.undoPt;
	break;
	case "zero":this.storePt=0;
	break;
	case "force":this.storePt=-1;//常にfalseになる値
	break;
	default:
		if(myPt>=0){
			this.storePt=Math.floor(myPt);//正の数値ならその数値を整数でセット
		}
	}
	return (this.undoPt==this.storePt);//セット後の状態を戻す
};
/*
	作業用バックアップオブジェクト
	ユーザによる保存指定可能
	明示的に破棄することが可能
	実行環境の違いによる動作の違いはメソッド内で吸収する。

	xUI.setBackup();現在の作業バックアップをストアする
	xUI.getBackup();現状のバックアップデータを返す　バックアップデータがない場合はfalse
	xUI.clearBackup();現在のバックアップデータを廃棄する。
*/
xUI.setBackup=function(){
/*
	保存・レストア・削除を一つのメソッドに統一して処理する。
	プラットフォーム別の処理分岐はメソッド側で処置
*/

//html5対応 localStorageに対して保存する。AIRはWebStorageが無い
	if(localStorage){
		localStorage.setItem("info.nekomataya.remaping.backupData",XMap.toString());
		if(false){alert("バックアップ領域に現在のデータを退避しました。")};//表示は設定で抑制可能にする
		xUI.setStored("current");
	}else{
		//localStorageのないブラウザならサーバストア・CGIダウンロード　どちらもダメなら別ウインドウに書き出し
//CGIダウンロード時にはリスタートが実行されるのでその部分の排除コードが必要
//↑==callEcho時点で先行で保存フラグを立てれば自動的に回避可能
		//AIRならsaveAs tempSave モーダル保存があった方がよいかも
if(fileBox.saveFile){fileBox.saveFile();}else{writeXMap(XMap);}
//		alert("バックアップ保存処理はまだ実装されていません");
	}
//==================================== ここまでをシステムバックアップメソッドに移行
};

xUI.getBackup =function(){
//
	var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
	if(myBackup!==null){
	  if(confirm("バックアップデータをシートに読み込みます。\n現在のデータは失われます。\nよろしいですか？")){
	    document.getElementById("data_well").value=myBackup;
	    if(XMap.readIN(xUI.data_well.value)){xUI.init(XMap);nas_xMPB_Init();}
	  }
	}else{
	  alert("現在、バックアップ領域にデータがありません。")
	}
}
xUI.clearBackup =function(){
	var myBackup=localStorage.removeItem("info.nekomataya.remaping.backupData");
	alert("バックアップ領域をクリアしました。");
}
/*	未保存時の処理をまとめるメソッド
未保存か否かを判別してケースごとのメッセージを出す
ユーザ判断を促して処理続行か否かをリザルトする
*/
xUI.checkStored=function(mode){
if(!mode){mode=null;}
	if(xUI.isStored()){return (true)};//保存済みなら即 true
if(fileBox.saveFile){
var	msg ="ドキュメントが保存されていません 保存しますか？";
//ドキュメントの保存・保存しないで更新・処理をキャンセルの３分岐に変更 2013.03.18
	msg+="\nOK:保存する /Cancel:保存せずに続行\n";
//	msg+="\nYes:保存する /No:保存しないで更新 /Cancel:処理をキャンセル\n";
//	nas.showModalDialog("confirm2",msg,"ドキュメント更新",0,
/*
	function(){
	switch (this.status){
case 0:;//yes 保存処理　後でテンポラリファイルを実装しておくこと		
			fileBox.openMode=mode;//ファイル保存に続行処理モードが必要　デフォルトは保存のみ
			fileBox.saveFile();
break;
case 1:;
break;
case 2:;
break;
	}
);
*/
	var myAction=confirm(msg);
	if(myAction){
		//保存処理　後でテンポラリファイルを実装しておくこと		
			fileBox.openMode=mode;//ファイル保存に続行処理モードが必要　デフォルトは保存のみ
			fileBox.saveFile();
			return false;
	}else{
		xUI.setStored("current");return true;// キャンセルの場合は保存しないで続行
	}
}else{
var	msg ="ドキュメントが保存されていません 書き出しますか？";
	msg+="\nOK:保存する /Cancel:保存せずに続行\n";
	var myAction=confirm(msg);
	if(myAction){
		//保存処理　後でテンポラリファイルを実装しておくこと		
			writeXMap(XMap);xUI.setStored("current");
			return true
//HTMLモードの保存は頻繁だと作業性が低下するので一考
			if(ServiceUrl){callEcho()};//CGIエコー

	}else{
		//破棄して続行
		xUI.setStored("current");return true;
	}
}
}

/*	画面サイズの変更時等にシートボディのスクロールスペーサーを調整する
	固定ヘッダとフッタの高さをスクロールスペーサーと一致させる
	引数なし
	画面デザインに合わせて要調整
 */
xUI.adjustSpacer=function(){
// ////////////alert("start adjust : "+$("#app_status").offset().top +":"+document.getElementById("fixedHeader").clientHeight );
    var headHeight=(this.viewMode=="Compact")? $("#app_status").offset().top-$("#pMenu").offset().top:document.getElementById("fixedHeader").clientHeight;
//　ケースによりでっかい値を返してるのはこれ？？
//    var headHeight=document.getElementById("fixedHeader").clientHeight;
//	var headHeight=document.getElementById("fixedHeader").clientHeight;
//	var footHeight=document.getElementById("fixedFooter").clientHeight;
//	document.getElementById("scrollSpaceHd").style.height=headHeight+"px";
//	document.getElementById("scrollSpaceFt").style.height=footHeight+"px";
//	document.getElementById("scrollSpaceHd").style.height=(footHeight+headHeight)+"px";
 var myOffset=(this.viewMode=="Compact")? $("#app_status").offset().top-headHeight:0;
// ////////// alert("viewMode :"+this.viewMode +"\n adjust myOffset :"+myOffset+"\n headHeight :"+headHeight);
//	document.getElementById("scrollSpaceHd").style.height=myOffset+"px";
	document.getElementById("scrollSpaceHd").style.height=(headHeight-myOffset)+"px";

	document.getElementById("UIheaderScrollH").style.top=(headHeight+$("#app_status").height())+"px";
	document.getElementById("UIheaderFix").style.top=(headHeight+$("#app_status").height())+"px";
	document.getElementById("UIheaderScrollV").style.top=(headHeight+$("#app_status").height())+"px";

	document.getElementById("scrollSpaceFt").style.height="1 px";

}
/*		xUI.reInitBody(newTimelines,newDuration);
引数:
	newTimelines	Number 新規トラック数
	newDuration	Number 新規継続時間　フレーム数
戻値:
	なし

	指定された大きさにシートを書き直す。
	元データは可能な限り維持

	undoの構造上編集単位が切り替わるときはundoバッファを初期化する。

 */
xUI.reInitBody=function(){
	var newXMap=new xMap();
	newXMap.readIN(XMap.toString());//別オブジェクトとして複製を作る
//変更してputメソッドに渡す
	newXMap.reInitBody();
	this.put(newXMap);
};
/*	ステージ切り替えは不要*/
xUI.switchStage=function(){
	alert("どうもすみません。\nこの機能はまだ実装されていません。");
};

//////

/*	テーブル表示用文字列置換
		xUI.trTd(Str);
	タグ等htmlで表示不能な文字を置き換え
	戻り値は変換後の文字列
*/
xUI.trTd=function(Str){
if(Str){
	Str=Str.toString().replace( />/ig, "&gt;").replace(/</ig,"&lt;");//<>
	if(this.Select[0]>0 && this.Select[0]<(this.SheetWidth-1)) Str=Str.toString().replace(/[\|｜]/ig,'<img src="./images/ui/verticalline.png" class=v_wave >');
	if(Str.match(/^[:：]$/)) return '<img src="./images/ui/waveline.png" class=v_wave >';
	if(Str.match(/[-_─━~]{2,}?/)) return "<hr>";
return Str;
}else{
return "";
}
};
//

/*	複写
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避
 */
xUI.copy	=function(){	this.yank();};

/*	切り取り
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避して、範囲内を空データで埋める
選択範囲があれば解除してフォーカスを左上にセット

 */
xUI.cut	=function()
{
	this.yank();
//選択範囲を取得して全部空のストリームに作って流し込む。
	var actionRange=this.actionRange();
	var Columns=actionRange[1][0]-actionRange[0][0];//幅
	var Frames=actionRange[1][1]-actionRange[0][1];//継続時間
	var bulk_c='';
	var bulk= '';
	for (f=0;f<=Frames;f++) {bulk_c+=(f!=Frames)? ","	:"";};
	for (c=0;c<=Columns;c++) {bulk+=(c!=Columns)? bulk_c+"\n":bulk_c;};
	this.inputFlag="cut";
	this.put(bulk);
	this.selectCell(actionRange[0]);//
};

/*	貼り付け
引数:なし
戻値:なし
現在の操作対象範囲左上を基点にヤンクバッファ内容をペースト
操作対象範囲左上をフォーカスして書き換え範囲を選択範囲にする

 */
xUI.paste	=function(){
	var bkPos=this.Select.slice();
	this.inputFlag="cut";
	this.put(this.yankBuf.body);

		this.selectCell(bkPos);
};
/*	やり直し	*/
xUI.undo	=function (){
	if(this.undoPt==0) {
		if(dbg) {dbgPut("UNDOバッファが空")};
		return;
	};
	//UNDOバッファが空
if(dbg) {dbgPut("undoPt:"+this.undoPt+":\n"+this.undoStack[this.undoPt].join("\n"))};
	this.inputFlag="undo";
	var putResult=this.put();
	if(putResult){
if(dbg) {dbgPut("putResult:\n"+putResult)};
	}
};

/*	やり直しのやり直し	*/
xUI.redo	=function(){
	if((this.undoPt+1)>=this.undoStack.length) {
		if(dbg){dbgPut("REDOバッファが空")};
		return;
	};
		//REDOバッファが空
if(dbg) {dbgPut("undoPt:"+this.undoPt+"\n:"+this.undoStack[this.undoPt].join("\n"))};
	this.inputFlag="redo";
	var putResult=this.put();
	if(putResult){
if(dbg) {dbgPut("putResult:\n"+putResult)};
	}
};

/*	ヤンクバッファに選択範囲の方向と値を退避	*/
xUI.yank=function(){
	this.yankBuf.direction=xUI.Selection.slice();
	this.yankBuf.body=this.getRange();
};
/**	xUI.put(dataChank)
引数
	dataChank
	入力データチャンク　単一の文字列　またはXpsオブジェクト または　配列　省略可

	シートに値を流し込むメソッド
	UNDOバッファは基本的にこのメソッドを経由して利用のこと
*/
xUI.put	=function(datastream,direction){
	return ;
}

/*
UI関数群
	これも、xUIのメソッドに

*/
/*=====================================*/

//メッセージをアプリケーションステータスに出力する。 引数なしでクリア
xUI.printStatus	=function(msg,prompt){
	if(! msg){msg="<br />"};
	if(! prompt){prompt=""};
	var bodyText=(prompt+msg);
	document.getElementById("app_status").innerHTML=bodyText.replace(/\n/g,"<br>");
}
//キーダウンでキー入力をサバく
//IEがプレスだとカーソルが拾えないようなのでキーダウン
xUI.keyDown	=function(e){
	if(this.Mouse.action){return false};//マウス動作優先中
//フォーカスされたテーブル上の入力ボックスのキーダウンを検出
	key = getKEYCODE(e);//キーコードを取得
	this.eddt = document.getElementById("iNputbOx").value;
alert(this.eddt);
	switch(key) {
case	25	:if(! Safari) break;
case	9	:	;//tab
	break;
case	13	:	;//Enter 標準/次スピン・シフト/前スピン
	break;
case	27	:	;//esc
	break;
case	32	:	;//space
break;
case	38	:	;//カーソル上・下
case	40	:	;//シフト時はセレクション(+スピン)の調整
break;
case	39	:		;//右
break;
case	37	:		;//左?
break;
case	33:		;//ページアップ
break;
case	34:	;//ページダウン
break;
case	35 :;//[END]
break;
case	36 :;//[HOME]
break;
case	65 :		;	//[ctrl]+[A]/selectAll
break;
case	67 :		;	//[ctrl]+[C]/copy
break;
case	79 :		;	//[ctrl]+[O]/ Open Document
break;
case	83 :	alert("SSS");	//[ctrl]+[S]/ Save or Store document
break;
case	86 :		;	//[ctrl]+[V]/paste
break;
case	88 :		;	//[ctrl]+[X]/cut
break;
case	89 :		;	//[ctrl]+[Y]/redo
break;
case	90 :		;	//[ctrl]+[Z]/undo
break;
/* 保留
case	 :		;	//[ctrl]+[]/
case	8	:	this.spin("bs");	break;	//bs NOP
case	46	:	this.spin("del");	break;	//del 
case  :	window.status="[]";	break;	//
*/
default :	return true;
	};
return false;
};

xUI.keyPress	=function(e){
//フォーカスされたテーブル上の入力ボックスのキープレスを検出して
//動作コントロールのために戻り値を調整
	key = getKEYCODE(e);//キーコードを取得
	switch(key) {
case	27	: return false		;//esc
case	25	:if(! Safari) break;
case	0	:
case	9	:			;//またはTAB および ctr-I
break;//ctrls
case	13	:			;//Enter
	return false;break;
case	65	:			;//a
case	67	:			;//c
case	79	:			;//v
case	83	:			;//v
case	86	:			;//v
case	88	:			;//x
case	89	:			;//y
case	90	:			;//z
case	97	:			;//A
case	99	:			;//C
case	118	:			;//V
case	120	:			;//X
case	121	:			;//Y
case	122	:			;//Z
	if (chkCtrl(e))	{return false}else{return true};
		break;
//case		: return false;break	;//
//	if (this.edchg)
//	{return true} else {return false};
//	;break
// なんか、イロイロ間違い。キープレスでは、ほとんどのコントロール関連の
//キーコードが拾えないので、あまり気にする必要ないみたい。
//気にするのは、ほぼ改行(enter/return)のみ。
//case 	:	return false;break;//
default :	return true;
	};
return true;
};
//
//キーアップもキャプチャする。UI制御に必要 今のところは使ってない?
xUI.keyUp=function(e){

	key = getKEYCODE(e);//キーコードを取得
	switch(key) {
case 9	:	;	//tab はシステムで使うのでUPは注意
case 13	:	;	//Enter
case 27	:	;	//esc
case 32	:	;	//space
case 38	:	;	//上カーソル
case 40	:	;	//下
case 39	:	;	//右
case 37	:	;	//左
case  33:	;	//ページアップ
case  34:	;	//ページダウン
case  16:	;	//シフト
case  17:	;	//コントロール
case  18:	;	//ALT
case  45:	;	//ins
case  46:	;	//del
case  144:	;	//clear(NumLock)
break;
//case  :	window.status="[]";	break;	//
case	65	:			;//[a]
case	67	:			;//[c]
case	79	:			;//[v]
case	83	:			;//[v]
case	86	:			;//[v]
case	88	:			;//[x]
case	89	:			;//[y]
case	90	:			;//[z]
	if (chkCtrl(e))	{
		return true;
	};
		break;
//case 99 :	;	//[C]copy	このあたりは横取り
//case 118 :	;	//[V]paste
//case 120 :	;	//[X]cut	しないほうが良い?
case 8	:	;	//bs NOP
default :
	return true;
	};
return false;
};
//
/*	xUI.Mouse(e)
引数:	e	マウスイベント
戻値:		UI制御用
	マウス動作
マウス処理を集中的にコントロールするファンクション
 */
xUI.Mouse=function(e){
		var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
//IDの無いエレメントは処理スキップ
	if(! TargeT.id){return false;}
/*
	基本動作:
*/
switch (e.type){
case	"dblclick"	:
case	"mousedown"	:
case	"click"	:
case	"mouseup"	://終了位置で解決
//[ctrl]同時押しで複製処理
	  this.mdChg(0,(chkCtrl(e)));
	  this.floatTextHi();
break;
case	"mouseover"	://可能な限り現在位置で変数を更新
break;
default	:	return true;
};
return false;	

};

//ドキュメントを開く
xUI.openDocument=function(){
	if(fileBox.openFileDB){fileBox.openFileDB();}else{sWitchPanel("Data");}
}

//ドキュメントを保存
xUI.storeDocument=function(mode){
	if(fileBox.saveFile){
		if(mode){fileBox.saveAs()}else{fileBox.saveFile()}
	}else{sWitchPanel("Data")}
}
//ダミーメソッド
xUI.onScroll=function(){return};

return xUI;
}
/*
xMPB UIスタートアップ

	スタートアップを他の位置へまとめる必要があるかも
*/
//	オブジェクト初期化用ダミーマップ
	var MAP=new xMap();
//始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
var    xUI= {};
        xUI.Mouse=function(){return};
        xUI.onScroll=function(){return};
/* Startup */
function nas_xMPB_Startup(){

	XMap=new xMap("titleString","S-C_description");//XMapを実際のXpsオブジェクトとして再初期化する

/*
	XMapオブジェクトのreadINメソッドをオーバーライド
	元のreadINメソッドから切り離した、データ判定ルーチン部分
	内部でparseメソッドを呼んでリザルトを返す
*/

//	UI初期化
	xUI=new_xUI();

	nas_xMPB_Init();

};

/*
タイムシートのUIをリセットする手続き
タイムシートの変更があった場合はxUI.init(XMap)を先にコールしてxUIのアップデートを行うこと
*/
function nas_xMPB_Init(){

//jquery関連　パネル類の初期化
//	initPanels();

//ヘッドラインの初期化
//	initToolbox();

//AIRを認識した場合cgiUIとairUIを切り換え
switch (appHost.platform){
case	"AIR":
//tableメニュー表記
		$("tr#cgiMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
		$("#airMenu").show();//="inline";
		$("#psMenu").hide();//
		$("#cgiMenu").hide();//="none";
//		document.getElementById("airMenu").style.display="inline";
//		document.getElementById("cgiMenu").style.display="none";
//サンプル取得部
//		document.getElementById("cgiSample").style.display="none";
//ドロップダウンメニュー用表記切り替え
		$("li").each(function(){
				switch(this.id){
				case "dMair":$(this).show();break;
				case "dMps":$(this).hide();break;
				case "dMcgi":$(this).hide();break;
				}
			});
//ブラウザ用ドロップダウンメニュー表示
		$("#pMenu").show();
//ドロップダウンメニューの初期化
		$("#pMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
//osがwindowsでかつAIR環境だった場合のみドロップダウンメニューを隠す
//		if((window.navigator.platform).indexOf("Win")>=0){$("#pMenu").hide()};
break;
case "CEP":
//	window.parent.psHtmlDispatch();
case	"CSX":
//tableメニュー表記
		$("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
		$("#airMenu").hide();//
		$("#psMenu").show();//
		$("#cgiMenu").hide();//
//サンプル取得部
//		document.getElementById("cgiSample").style.display="none";
//ドロップダウンメニュー用表記切り替え
		$("li").each(function(){
				switch(this.id){
				case "dMair":$(this).hide();break;
				case "dMps":$(this).show();break;
				case "dMcgi":$(this).hide();break;
				}
			});
//ブラウザ用ドロップダウンメニュー表示
		$("#pMenu").show();
//ドロップダウンメニューの初期化
		$("#pMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
break;
default:
//標準的なブラウザ
		$("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
		$("#airMenu").hide();//
		$("#psMenu").hide();//
		$("#cgiMenu").show();//
//ドロップダウンメニュー用表記切り替え
		$("li").each(function(){
				switch(this.id){
				case "dMair":$(this).hide();break;
				case "dMps":$(this).hide();break;
				case "dMcgi":$(this).show();break;
				}
			});
//ブラウザ用ドロップダウンメニュー表示
		$("div#pMenu").show();
//ドロップダウンメニューの初期化
		$("#pMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
}

//ロゴ
	$("#logoTable").show();
	

//window.FileReader オブジェクトがある場合のみローカルファイル用のセレクタを表示する
//読み込み機能自体は封鎖してないので注意
	if(window.FileReader){
		$("#localFileLoader").show();
		$("#localFileLoaderSelect").show();
	}else{
		$("#localFileLoader").hide();
		$("#localFileLoaderSelect").hide();
	}

//暫定　プラットホームを判定して保存関連のボタンを無効化したほうが良い　後でする
/* mapEditの為の表示調整*/
	$("#toolbarHeader").hide();
	$("#headerTool").hide();
	$("#optionPanelUtl").hide();
	$("#sheetHeaderTable").hide();
//	$("#optionPanelDbg").hide();

//開発用表示
if(dbg){
//	$("#optionPanelDbg").show();//
//	if(dbg){xUI.openSW("dbg_")};
//	$("#optionPanelDbg").show();
//	$("#optionPanelUtl").show();
//	$("#optionPanelTrackLabel").show();
//	$("#optionPanelEfxTrack").show();
//	$("#optionPanelTrsTrack").show();
}
/* ヘッダ高さの初期調整*/
xUI.adjustSpacer();
};


function nas_xMPB_reStart(evt){
/*
	オープン判定は xUI.storePt と xUI.undoPtの比較で行う
storePtはオープン時および保存時に現状のundoPtを複製するので、
内容変化があれば (xUI.storePt != xUI.undoPt) となる
*/
	if(! xUI.isStored()){
	evt = event || window.event;
	return evt.returnValue="ドキュメントの変更が保存されていません！";
		//xUI.setBackup();
//		var msg="このページから移動します(移動のキャンセルはできません)\nドキュメントが保存されていませんが、保存しますか？";
//		if(confirm(msg)){xUI.setBackup()};
		//nas.showModalDialogに置換えは意味が無かった　本物のモーダルパネルではないのでウィンドウのリロードは止まらない
//nas.showModalDialog("confirm",msg,"ファイル未保存",function(){if(this.status==0){xUI.setBackup();}})
		//保存処理
	};

//if(confirm("TEST")){return }else {return false};
//	クッキーを使用する設定なら、
//	現在のウィンドウサイズを取得してクッキーかき出し
if (useCookie[0]) {writeCk(buildCk());};
//	サブウィンドウが開いていたら閉じる?
	xUI.closeSW();
//
};

/*
メモ

アンドゥスタックの使用

通常入力
アンドゥポインタと配列の長さを比較
配列をアンドゥポインタの長さに揃える(切り取る)
アンドゥ要素(位置・セレクション・保存データストリーム)を
アンドゥ配列に積む・ポインタ1加算

タイムシート構成変更
現在のタイムシートをオブジェクト化してUNDOスタックに積む
UNDO/REDOともに準拠操作

アンドゥ操作
ポインタ位置のデータを使用して本体配列の書き換え
アンドゥデータとリドゥデータの入れ換え(位置とセレクションはそのまま)
ポインタだけを1減算

リドゥ操作
ポインタ1加算
ポインタ位置のデータを使用して本体配列の書き換え
アンドゥデータにデータを置き換え

操作フラグ必要


HTML上のシート取り込み手順
index(または相当の)ファイルのbodyに textarea でXMapデータを書き込む
startup内でXMapデータを認識したら。フレームセットのプロパティにXMapデータをescapeして書き込む
シート初期化の際に parent.document.body.innerHTML から切り分けで読み出す
読み出しに成功した場合だけ、そのXMapを使用してシートを初期化する。



2015 01 10
メモ　シートの秒数を減らす際にスクロールスペーサーのサイズ計算が間違っている
計算違いではなく　ステータス表示エレメントの位置がズレて、その値から計算しているのでおおきくなる
エラー検出が必要かも
全尺が大きい時に顕著？

尺が大きい時に自動スクロールの位置計算に狂いが出ているので要チェック

2015 07 04
ペースト内容の挿入を実装
	指定位置からシート末尾までの範囲（不定スパン）を一次バッファにとる
	ヤンクまたは挿入範囲と一次バッファで新規の上書き用データを作る
	上書きデータをputする
	＝undo一回分となる
指定範囲移動を実装する
実際に
ヤンク>クリア>ペースト（上書き移動）
ヤンク>

*/
