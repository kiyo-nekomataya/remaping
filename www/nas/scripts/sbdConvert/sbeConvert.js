/*(絵コンテをHTMLに)
	ねこら絵コンテエディタから納品可能なHTMLに変換するスクリプト
	このスクリプトは、ブラウザのjavascriptです

	ブラウザ用に改修 3/23
外部ライブラリが必要です

sbdConvert.html　からコールします。
ライブラリはホストのHTML側でロード
	機能追加修正判 20080403


*/
'use strict';

var queueBox=false;//プレイヤで使用するキュー
var nas_Input=function(){ return ;};//キー受信ダミーファンクション

var mySB = {};//グローバルで使用するStoryBoardバッファ
//プレイヤモジュールをロードすると改めて初期化される。未ロード状態の判定用変数

//nekora絵コンテクラス
/*
	nekoraSB兼用
 */
function StoryBoard(){
//urlまたはデータパス
	this.url          = '';
//
	this.title        = "noTitle";//
	this.author       = "";//
	this.framerate    = 30;//FPS初期値30で
	this.docid        = "";//ドキュメントID参照画像
	this.size         = "middle";
	this.wide         = "wide";
	this.cur_x        = "";
	this.cur_y        = "";
	this.linelock     = "";
	this.linesparpage = 5;//ページあたりの絵コンテの段数初期値5で

// ねこらエディタとは互換の無いコレクション
	this.duration     = 0;//絵コンテの総尺を保存する為のプロパティ

	this.cuts         = new Array();//カットコレクション配列 要素はCut
	this.getCutByTime = function(myFrames){
		//フレームを指定してカットを取得
		if(myFrames>this.duration){return null;}
		var myResult=null;
		for(var idx=this.cuts.length;idx>0;idx--){
			if(this.cuts[idx-1].inPoint<=myFrames){myResult=this.cuts[idx-1];break;}
		}
		return myResult;
	}
	this.casts       = new Array();//キャストオブジェクトトレーラ
	this.cameraworks = new Array();//カメラワークオブジェクト
	this.effects     = new Array();//エフェクトオブジェクト
	this.dialogs     = new Array();//セリフオブジェクトトレーラ
	this.msks        = new Array();//音楽オブジェクトトレーラ
	this.sefs        = new Array();//効果音オブジェクトトレーラ

// ねこらエディタ互換コレクション
	this.table       = new Array();//カラムコレクション配列として初期化 要素はColumnNkrオブジェクト
	this.bookmarks   = new Array();//ブックマークコレクション配列 要素はBookmarkNkrオブジェクト

		this.bookmarks.toString=function(Mode){
				var myResult="";
			if(this.length){
	switch(Mode){
	case "sbd":
				myResult +='<bookmarks>';
				for(var idx=0;idx<this.length;idx++){
					myResult+=this[idx].toString("sbd");
				}
				myResult+="</bookmarks>";
	break;
	case "html":				myResult +='<hr/>bookmark<br/><hr/><select style="width:64px;" onChange="keyJump(this.value)">';
				for(var idx=0;idx<this.length;idx++){
					myResult+=this[idx].toString("html")
				}
				myResult+="</select>";
	break;
	case	"csv":
	default:
				for(var idx=0;idx<this.length;idx++){
					myResult+=this[idx].toString("csv")
				}
	}
				return myResult;
			}else{	return "";
			}
		}
//以下はコンバート用オブジェクト
//	this.frameAspect =(this.wide=="wide")? 16/9 : 4/3 ;//(ヨコ/タテ)仮初期化 あとでスタイルシート値で置き替え

	this.convert={};//コンバータ用オブジェクト(ポイント計算)

		this.convert.isLocal=(document.location.toString().match(/^file:\/\/.+/))?true:false;
/*	この設定は現在保留中
		this.convert.pageWidth=(156*96/25.4);	//"156mm";//画像最大幅(幅モノ全加算)
		this.convert.pageHeight=(250*96/25.4);	//"250mm";//画像最大高さ カラム高×5
		this.convert.columnHeight=(50*96/25.4);	//"50mm";//カラム高さ
		this.convert.columnWidth=(88*96/25.4);	//"88mm";//カラム幅(本体幅)
		this.convert.contentsWidth=(33*96/25.4);//"33mm";//ト書き幅(本体幅＋マージン)
		this.convert.dialogWidth=(35*96/25.4);	//"35mm";//セリフ幅(本体幅＋マージン)
*/
/*
	スタイルシートのセレクタの内容を読んで変数を設定するのでスタイルシートでサイズ設定してください
	設定単位は mm px pt の3種のみ

*/
//カラム高さ
		this.convert.columnHeight = nas.decodeUnit($(".columnLabel").css("height"),"px");
console.log(nas.decodeUnit(this.convert.columnHeight+'px','mm'));
//カラム幅
		this.convert.columnWidth =	nas.decodeUnit($(".pictureArea").css("width"),"px");
console.log(nas.decodeUnit(this.convert.columnWidth+'px','mm'));
//ト書き幅
		this.convert.contentsWidth =	nas.decodeUnit($(".contentText").css("width"),"px")+
						nas.decodeUnit($(".contentText").css("padding-left"),"px")+
						nas.decodeUnit($(".contentText").css("padding-right"),"px");
console.log(nas.decodeUnit(this.convert.contentsWidth+'px','mm'));
//セリフ幅
		this.convert.dialogWidth	= nas.decodeUnit($(".dialogText").css("width"),"px")+
						nas.decodeUnit($(".dialogText").css("padding-left"),"px")+
						nas.decodeUnit($(".dialogText").css("padding-right"),"px");
console.log(nas.decodeUnit(this.convert.dialogWidth+'px','mm'));
//ページ描画幅(カット番号幅とタイムテクスト幅は除外した数値)= 画像最大幅(幅モノ全加算)
		this.convert.pageWidth=this.convert.columnWidth+this.convert.contentsWidth+this.convert.dialogWidth;

//取得した値からフレームアスペクトを出す
		this.convert.frameAspect=this.convert.columnWidth/this.convert.columnHeight;

/*	スタイルシートから取得した値をもとに絵コンテの設定でパラメータを変更する	*/

//画像高さから指定のページに何段入るかを計算する。>スタイルシートで指定
//画像最大高さ カラム高×カラム段数
//		this.convert.pageHeight=(this.convert.columnHeight*Math.floor(nas.decodeUnit($(".stbd").css("height"),"px")/this.convert.columnHeight));
		this.convert.pageHeight=nas.decodeUnit('270mm','px');
console.log(nas.decodeUnit(this.convert.pageHeight+'px','mm'))
/*
	絵コンテ画面のアスペクトが変更された場合は、現在のページ段(ねこらエディタのライン=行)を保持して画像の横幅を調整
	カット番号欄 および 秒数欄の幅を維持して残った描画幅を現在の ト書き幅:セリフ幅で割りつける。
	別メソッドにする
*/
	this.changeAspect=function(myAspect){
		var newPicWidth=myAspect*this.convert.columnHeight;
		var newContentWidth=(this.convert.pageWidth-newPicWidth)*(this.convert.contentsWidth/(this.convert.contentsWidth+this.convert.dialogWidth));
			this.convert.frameAspect	=myAspect;
			this.convert.columnWidth	=newPicWidth;
			this.convert.contentsWidth	=newContentWidth;
			this.convert.dialogWidth	=this.convert.pageWidth-newPicWidth-newContentWidth;
//css更新
//			nas.addCssRule(".pictureArea","width:"+(25.4*newPicWidth/96)+"mm;",2);
			$(".pictureArea").css("width",(25.4*newPicWidth/96)+"mm");
//			nas.addCssRule(".contentText","width:"+(25.4*this.convert.contentsWidth/96)+"mm;",2);
			$(".contentText").css("width",(25.4*this.convert.contentsWidth/96)+"mm");
//			nas.addCssRule(".dialogText","width:"+(25.4*this.convert.dialogWidth/96)+"mm;",2);
			$(".dialogText").css("width",(25.4*this.convert.dialogWidth/96)+"mm");
//プレイヤが存在する場合はプレイヤのクリッピング範囲を調整
		if(queueBox){
			document.getElementById("clipFrame").style.height=Math.floor(nas.decodeUnit(document.getElementById("clipFrame").style.width,"px")/myAspect)+"px";
		}
	}


		this.convert.drawWidthPx   = baseDrawingWidth;//描画基準幅 これを絵コンテの枠幅に合わせる
		this.convert.pictureMargin = baseDrawingMargin;//占有率 罫線付き用紙に印刷しないなら100%でもOK
//		this.convert.dummyResolution=Math.floor(96*640/(this.convert.columnWidth*0.95));//強制的にこの解像度で画像を処理 640pxを描画フレームの95%で処理
//		this.convert.maxColumns    = Math.floor(this.convert.pageHeight/this.convert.columnHeight);
		this.convert.maxColumns        = this.linesparpage;
		this.convert.currentPage       = 0;//処理中のページ番号
		this.convert.currentPgDuration = 0;//処理中のページのサブトータル
		this.convert.currentSubTotal   = 0;//処理中のページの通算尺
//		this.convert.currentColumn     = 0;//処理中のカラムID(通し番号 0 orig)
		this.convert.currentSCID       = 0;//処理中のサブカラムID
		this.convert.scnColumn         = true;//シーン柱出力フラグ
		this.convert.hasSwitch         = false;//出力HTMLにスイッチを付加するか否か
		this.convert.imageFolderName   = "images";
		this.convert.imageCount        = 0;//画像カウント　テーブル内の画像の総数（要キャッシュ総数）

		this.convert.isFileSave        = false;//toString()メソッドの動作スイッチ


		this.convert.cssFileA = './sbdConvert/styleSheets/sbe_nas.css';
		this.convert.cssFileB = './sbdConvert/styleSheets/sbe_prt_nas.css';
//		this.convert.cssFileC = './sbdConvert/styleSheets/paperDesign.css';
		this.convert.config   = './sbdConvert/config.js';
		this.convert.libFileA = './sbdConvert/nas_common.js';
		this.convert.libFileB = './sbdConvert/nas_common_HTML.js';
		this.convert.jsFile   = './sbdConvert/viewUtil.js';

/*
//この下は一応不要だけど宣言文は残しておく
	this.frameWidth	=8*96;//(pt)

	this.subTitle	="";//

	this.pages	=new PageCollection();//ページコレクション
	this.cuts	=new CutCollection();//カットコレクション
*/
};
/*
	ブラウザ用画像キャッシュ取得待ちメソッド
画像サイズ計算を行う為に画像がすべてメモリにキャッシュされている必要がある。
このメソッドの取得待ちが終わってからコンバート可能

StoryBoard.prototype.viewCashStatus = function(){
    var count = 0;
    var msg   = "";

    for(var idx = 0; idx < this.table.length; idx++){
//      if(( this.table[idx].img.image instanceof HtmlImage )&&(this.table[idx].img.image.complete)) {count++;};
      if((this.table[idx].img.image)&&(this.table[idx].img.image.complete)) {count++;};
    }
    msg += this.convert.imageCount + "件中" + count + "件完了";
   if(count == this.convert.imageCount){
    msg += ":画像キャッシュがすべて完了しました。コンバート可能です。";
    }
    showMsg(msg);
    if(count < this.convert.imageCount){
     setTimeout(viewCashStatus, 1000);
    }

};
*/
/*
	CSVデータのパース
	オリジナル　http://liosk.blog103.fc2.com/blog-entry-75.html
	デリミタはデフォルトで","
	改行をバックスラッシュでエスケープする実装には未対応 20100508
*/
function parseCSV(text, delim) {
    if (!delim) delim = ',';
    var tokenizer = new RegExp(delim + '|\r?\n|[^' + delim + '"\r\n][^' + delim + '\r\n]*|"(?:[^"]|"")*"', 'g');

    var record = 0, field = 0, data = [['']], qq = /""/g;
    text.replace(/\r?\n$/, '').replace(tokenizer, function(token) {
        switch (token) {
            case delim: 
                data[record][++field] = '';
                break;
            case '\n': case '\r\n':
                data[++record] = [''];
                field = 0;
                break;
            default:
                data[record][field] = (token.charAt(0) != '"') ? token : token.slice(1, -1).replace(qq, '"');
        }
    });

    return data;
}

/*
	csvデータ取り込みメソッド
	引数はcsvテキスト
このあたりの拡張は作業優先で固定コーディングしてあるので後で見直しが必要 20100508
さらにやっつけで AEからの出力に対応　2015.03.27
取り込んだテーブルからカットを抽出する処理が必要
*/
StoryBoard.prototype.readCSV=function(bodyText){
//与えられたデータを一時配列に展開
	var myCSDB=parseCSV(bodyText);
//	新規テーブル配列
	var myNewTable=new Array();
	var myNewShotTable=new Array();
//読み込みカウンタリセット
	var readCount=0;
	var cutCount =0;
	this.convert.imageCount = 0;
//		ループしてオブジェクト読み込み
//console.log(bodyText);
//console.log(myCSDB);
/*
	20150327版
	絵コンテ分解AEプロジェクトの出力対応

フィールド並びは
[ ] "index"				//データ通しインデック -不使用

[0] "pageIndex"			//ページインデックス（名前にあらず）-不使用
[1] "pageColumnIndex"	//ページ内カラムインデックス-不使用
[2]	"sceneIndex"	//{Number Int}シーンインデックス
[3] "cutIndex"		//カットインデックス-不使用
[4] "cutNo."		//カット番号（名称）
[5] "pictureIndex"	//画像ファイルURL|ファイル名body
[6] "contentText"	//ト書き部分　URIencoded
[7] "dialogText"	//セリフ・音声部分　URIencoded
[8] "timeText"		//尺数　TC
[9] "inherit"		//{String}兼用データ
[10]"uuid"			//uuid

カラムには以下の特殊カラムが存在する

	カットインデックスを持たないシーン柱に相当するカラム
カットインデックスはどこにも所属していないことをあらわす -1
シーンインデックスのみを持つ
インデックステキストにはシーン番号が記載される「◯」であることも多い
シーンに対する記述（シーン名）はcontentTextに記載される
画像はブランクになる確率が高いが登録しても良い
timeTextは必ず空白

	シーンインデックス、カットインデックスを持たないコメントに相当するカラム
シーン・カットインデックスにはどこにも所属していないことをあらわす -1 を入れる
扉や、カットに対する説明のための絵や文章をカラムとして挿入できる

☆ノートイメージの扱い
ノートイメージはデータフィールドを持たないオプション画像とする。
contentTextまたはdialogTextの一部としてHTMLImageタグに準拠したタグを書き込む
これを解釈するシステムでは、表示が行われるかまたは画像に対するリンクを作成して閲覧可能にすること	

contentText及びdialogTextの書式は別紙詳解

*/
var currentCutNo = "";
var currentScene = -1;
var currentCut = -1;
var previewCut = new blankCut();
console.log(myCSDB)
var scnIndex		= myCSDB[0][2];
var cutIndex		= myCSDB[0][3];
var cutNo			= myCSDB[0][4];
var pictureIndex	= myCSDB[0][5];
var contentText		= myCSDB[0][6];
var dialogText		= myCSDB[0][7];
var timeText		= myCSDB[0][8];
var uuid			= myCSDB[0][10];


var newShotEntry	= false;

	for(var idx=0;idx<myCSDB.length-1;idx++){

		var myColumn=myCSDB[idx];
		var myCutIndex;
/* 不使用
			var mySerialIndex = idx ;//元データはスキップしてSerialナンバーを入れる（事前ソート？）
			var myPageIndex = (myColumn[1])? myColumn[1]:pageIndex;
			var myPageColumnIndex = (myColumn[2])? myColumn[2]:pageColumnIndex++;
*/
			if(myColumn[3]!=previewCut.index){
				myCutIndex=myColumn[4];currentCutNo=myColumn[4].toString();
//ここでカットの初期化フラグを立てる
				newShotEntry = true;
			}else{
				myCutIndex="";
			}
			if(myColumn[5].length){
				var myPictureLink=(myColumn[5].match(/\.(jpeg|jpg|gif|png)$/))?
				myColumn[5]:("./img/"+myColumn[5]+".png");
				this.convert.imageCount++;
			}else{
				var myPictureLink='';
			}
			var myContentText=decodeURI(myColumn[6]);
			var myDialogText=decodeURI(myColumn[7]);
			var myTimeText=myColumn[8];

		var newColumn=new ColumnNkr(this,idx);//新規カラム作成
			newColumn.scene = ((myColumn[3]==-1)&&(myColumn[2]>=0))? true:false;
			newColumn.cut=myCutIndex;
			newColumn.img=new Picture([],myPictureLink);
			newColumn.desc=myContentText;
			newColumn.words=myDialogText;
		if(myTimeText){
			//var myDatas=myTimeText.split("\n");
			//	for(lIdx=0;lIdx<myDatas.length;lIdx++){}
				if((myTimeText.match(/^[0-9]+\+[0-9]+$/))){
					newColumn.sec=myTimeText;
				}else{
					newColumn.words+="\n"+myTimeText;
					newColumn.sec="";
				}
		}
			newColumn.key=myColumn[5];//ユニークキー
		if(newShotEntry){
			currentCut = new Cut(parseInt(myColumn[3]),this,newColumn,previewCut.inPoint+previewCut.length);
			myNewShotTable.push(currentCut);
			newShotEntry = false;
		}else{
			currentCut.addColumn(newColumn);
		}
		readCount=myNewTable.push(newColumn);
		previewCut=currentCut;
	}

	if(readCount){
		this.table = myNewTable;
		this.cuts  = myNewShotTable;
		this.duration = currentCut.inPoint + currentCut.duration
	};
	return readCount;
}

/*
	SBDコンバータ用取り込みメソッド
	nekora SBD専用
	StoryBoardクラスのメソッドとして実行する
引数 ファイルから取り込んだXML本文テキスト パースは自前

戻り値 処理したカラム数・ コンバート中止時は false

ブラウザに環境移行したので汎用XMLパーサをつかえば良さそうな物だが…Adobeスクリプトの流用なのでこのまま
*/

StoryBoard.prototype.parseSBD=function(bodyText){
//与えられたデータを一時配列に展開
//事前データチェック
/*
	/<[^<>]+>/g のマッチ数と /</g />/g 単独のマッチ数を比較してすべて同数だった場合は"<>"の対比整合がとれていると見なす?
*/
var tagCount=bodyText.match(/<[^<>]+>/g);
var openCount=bodyText.match(/</g);
var closeCount=bodyText.match(/>/g);
if((tagCount.length!=openCount.length)||(openCount.length!=closeCount.length)){
	//タグが合ってない
	alert("NoNo :"+tagCount.length + ":" + openCount.length +" : "+ closeCount.length);
	return false;
}else{
//カウンタリセット
this.convert.imageCount=0;
//一時配列に分解
	var mySBDB=bodyText.replace(/<\//g,"><\/").split(">");
for(var idx=0;idx<mySBDB.length;idx++){mySBDB[idx]=mySBDB[idx].replace(/^\s*/,"");};

//alert(mySBDB.toString());alert(mySBDB.length);

//ループしてオブジェクト読み込み
var columnCount=0;//カラムカウント変数セット
var bookmarkCount=0;//しおりカウント変数セット
var myStage="";//初期ステージ
var targetProp="";//現在処理中のプロパティ名

	for(var idx=0;idx<mySBDB.length-1;idx++){


		if(mySBDB[idx].match(/^<\//)){
//		閉じタグなので処理をスキップ
//alert("skip CloseTag "+mySBDB[idx]);
			continue;
		}else{
			if (mySBDB[idx].match(/^<.*[^\/]$/))  {
//alert("get openTag : "+idx+" : " +mySBDB[idx]);
//		開きタグなのでオブジェクトを判定して取り込みモードをセット
// 特に取り込むアトリビュートは今のところ無い 汎用パーサなら許されないが別に構わない

		var myNodeAttrib=mySBDB[idx].replace(/(^<\s*|\s*$)/g,"").split(" ");//前後のスペースとタグを払って分解
//alert("myNodeAttrib :"+myNodeAttrib.toString());
				var nodeName=myNodeAttrib[0];//必ず一個はエレメントがある　なかったら嫌だ
//alert(nodeName + "+++++++++++++++");
				switch(nodeName){
case	"storyboard":	;//肝心の識別タグだターゲットと違っていたら処理中止
	if(myNodeAttrib[1] !='xmlns="http://www.mapletown.net/~nekora/sbedit"'){return false;}
break;
case	"table":	;//カラムテーブルモード移行
case	"bookmarks":	;//ブックマークモードに移行
	myStage=nodeName;
//	alert("switch Stage to "+nodeName);
break	;
case	"tr"	:	;//カラムオブジェクトを作成して、カラムを進める
	this.table[columnCount]=new ColumnNkr(this,columnCount);//(親ストーリーボード,ID)で初期化
	columnCount ++;
break;
case	"mark":	;//しおりを作成してカウントする
	this.bookmarks[bookmarkCount]=new BookmarkNkr(this,bookmarkCount);//(親ストーリーボード,ID)で初期化
	bookmarkCount ++;
break;
case	"?xml":	;//xml宣言だ捨てておこう 何もしない
break;
default	:	;//それ以外はノード名に対応したプロパティの取り込みなのでターゲットをセット
	targetProp=nodeName;

				}
/*
alert("targetNode: \n"+ targetNode.join("."));
alert("nodeName :"+nodeName);
alert(":カラファンクションを期待::" + eval(targetNode.join(".")+".toString()"))
 */
			}else{
				if (mySBDB[idx].match(/\/$/)){
					//alert("skip CloseTag "+mySBDB[idx]);
					 continue;
//		末尾が/ならば開いて閉じるタグなので値がないので次へ
				}
//alert(myStage+" : "+mySBDB[idx]);
//				通常のコンテンツデータなので、現在のステージに沿って値を取り込む
if (targetProp){
	switch(myStage){
case	"table":	;
	if(targetProp=="img"){
if(mySBDB[idx]!=""){
//エントリに値があれば
		this.table[columnCount-1][targetProp]=new Picture(
			this.table[columnCount-1],
			mySBDB[idx].replace(/\\/g,"/")
		);
		this.convert.imageCount++;
}else{
		this.table[columnCount-1][targetProp]="";//ヌルでフラグにする？
}

	}else{
		this.table[columnCount-1][targetProp]=mySBDB[idx];
	}
break;
case	"bookmarks":	;//しおり登録中
	switch(targetProp){
	case	"name":;
		this.bookmarks[bookmarkCount-1].name=mySBDB[idx];
	break	;
	case	"point":;
		this.bookmarks[bookmarkCount-1].key=mySBDB[idx];
	break	;
	}
break;
default	:
	this[targetProp]=mySBDB[idx];
	}
	targetProp="";
}
			}
		}

	}
}
/*
	すべて取り込み終えたので、解析してカットテーブルを作る
	独立処理
*/
//すっかり失念していたがSBDのフレームレートをライブラリ変数へ設定
	if(this.framerate!=nas.FRATE){nas.FRATE=this.framerate}
	var cutCount=0;//処理済みのカットカウンタ
	var previewCut=new blankCut();//直前に処理したカラムのカット(未所属カラムはnull)初期化用dummyオブジェクト

for(var idx=0;idx<this.table.length;idx++){
	if((! this.table[idx].cut)&&(previewCut.index==null)){continue;};//このカラムはカットに未所属なのでスキップ
/*
カット記述開始前の無名カラムはデータ上は記録するがカットコレクションには属さない
もっぱらコンテ記述前の表紙や説明データとして使用される。
絵コンテ記述中の無名指定カットも同様に扱う　＞テーブルインデックスは存在するが、カットコレクションに属さないデータ
*/
	if(this.table[idx].cut){	;//カット番号あり
		if(this.table[idx].cut.match(/^[\s_\-]/)){continue;};//キーワードマッチで処理スキップ
		if((previewCut.index)&&(this.table[idx].cut==previewCut.name)){
			previewCut.addColumn(this.table[idx]);//先行カットと番号が一致した場合は、同カットに編入
			continue;
		}else{
			this.duration+=previewCut.length;
			this.cuts.push(new Cut(cutCount,this,this.table[idx],previewCut.inPoint+previewCut.length));
			previewCut=this.cuts[cutCount];
			cutCount++;
			continue;
		}
		
	}else{
		//カット番号なし
		//カラムのコンテントがすべてカラなら当該カラムはスキップ
		if(	(! this.table[idx].img)&&
			(! this.table[idx].desc)&&
			(! this.table[idx].words)&&
			(! this.table[idx].sec)
		){	continue;	};
		//まだ実装していないが、キーワード処理でカラムをカットからはずすことも可能にする (キーワードマッチで実装↑　2010/10/06)

		previewCut.addColumn(this.table[idx]);//先行カットに追加
		continue;
	}
}
			this.duration+=previewCut.length;//最後のカットの尺を追加して終了
//パース終了したので 取り込んだパラメータとCSSのデータの突き合わせを行う
//スタイルシートの指定と絵コンテの記録が異なっていたら絵コンテ指定に高さを変更
		if(this.convert.maxColumns!=this.linesparpage){
			this.convert.maxColumns=this.linesparpage;
		};//最大カラムをコンテのデータで置き替え
		if(this.convert.pageHeight!=(this.convert.columnHeight*this.linesparpage)){
			this.convert.columnHeight=this.convert.pageHeight/this.linesparpage;
			this.changeAspect(this.convert.frameAspect);
			//this.convert.maxColumns=this.linesparpage;
			//css変更
//			nas.addCssRule(".columnLabel","height:"+Math.round(this.convert.columnHeight)+"pt;","2");
			$(".columnLabel").css('height',Math.round(this.convert.columnHeight)+'px')
		};

//比率が絵コンテデータとスタイルシートで異なっていたら以下の判断で変更
/*
	this.wideの値がnormalならば 3:4 が期待されているのでそのように変更
	それ以外は、スタイルシートの指定による値を優先
*/
// alert("aspect /"+this.convert.frameAspect+"::"+((4/3)/this.convert.frameAspect))
		if((this.wide=="nomal")&&(Math.round(100*this.convert.frameAspect/(4/3))!=100))
		{
			this.changeAspect(4/3);
		}

//	alert(cutCount);
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
	return columnCount;
}
/*
	エディタとして機能させるためには単純なコンバートではなく編集しやすいデータ構造と操作バッファが必要
	データ構造に関してはStoryBoard.tableでも良いが、操作を総合的に記録するフォーマットが必要
	画像のundoはしない
	Editor　オブジェクトを作成してEditor.storyBoardを付ける形が望ましい
	UIはEditor配下を操作
操作一覧
レコード単位の操作とカラム単位の操作を同列で扱う必要あり
アドレスで操作
操作（[値(text)],開始アドレス[,終了アドレス]）
del()
copy
paste
add
cut
move
*/
/**
 *	ストーリーボード全体をテキストで返す
 *	@params {String} outputMode
 *	引数は出力モード "sbd"|"html"|"ARSC"|"script"|"storyBoader"|"csv" デフォルトは csv
 *	sbd     nekora sbd 書き戻し用
 *	html    
 */

StoryBoard.prototype.toString=function(outputMode){
	var myResult="";
	switch(outputMode){
case	"screenplay":  ;//シナリオ形式  nas.MOVIESCRIPT
case	"storyboard":  ;//絵コンテ形式  nas.MOVIESCRIPT
case	"AR":          ;//録音台本形式  nas.MOVIESCRIPT
case	"full":        ;//全出力       nas.MOVIESCRIPT
	return this.getSTBD().toString(outputMode);
break;
case	"sbd":	;//sbd(書き戻し用)
	myResult+='<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
	myResult+='<storyboard xmlns="http://www.mapletown.net/~nekora/sbedit">';
	var prop=["title","docid","author","framerate","size","wide","cur_x","cur_y","linelock","linesparpage"];
	for(var idx=0;idx<prop.length;idx++){
		myResult+='<'+prop[idx]+'>'+this[prop[idx]]+'</'+prop[idx]+'>';
	};
	myResult+='<table>';

	for (var idx=0;idx<this.table.length;idx++){
		myResult+=this.table[idx].toString("sbd");
	}


	myResult+='</table><bookmarks>';
if(this.bookmarks.length){
	for (var idx=0;idx<this.bookmarks.length;idx++){
		myResult+=this.bookmarks[idx].toString("sbd");
	}
}
	myResult+='</bookmarks></storyboard>';
break;
case	"ARSC":	;//AR台本モード
	myResult+='<HTML>';
	myResult+='<table border=1>';
	myResult +="<tr><th width='40 pt'></th><td width='96 pt'></td><td></td></tr>";
//カットごとに内容をキャッシュして1カット分ずつテーブルにする
var myCUTNo="";var myContents="";var myDialog="";//全てデータなしで初期化

	for (var idx=0;idx<this.table.length;idx++){
		if(((this.table[idx].cut)&&(this.table[idx].cut!=myCUTNo))||(idx==(this.table.length-1)))
		{
			myResult+="<tr><th>"+myCUTNo+"</th><td>"+myContents+"</td><td>"+myDialog+"</td></tr>"+"\n";
//次のカウンタ認識するかデータが終わったらリザルトを積んでバッファクリアして次へ
			var myContents="";var myDialog="";
			myCUTNo=this.table[idx].cut;//カット番号等を初期化
		}
			myContents+=this.table[idx].desc+"<br />";
			myDialog  +=this.table[idx].words+"<br />";
		//myResult+=this.table[idx].toString("ARSC");
	}


	myResult+='</table>';
	myResult+='</HTML>';
break;
case	"html":	;//HTMLモード ブラウザに使用する場合はヘッダ回りは不要　
/*
	スイッチを付けて保存用のHTMLを書き出す時には添付する
*/
if(this.convert.isFileSave){
	myResult+='<html><head><META http-equiv="Content-Type" content="text/html; charset=UTF-8">\n';
	myResult+='<title>'+this.title+'</title>\n';
	myResult+='<link rel="stylesheet" type="text/css" href="'+this.convert.cssFileA+'" media="screen,tv">\n';
	myResult+='<link rel="stylesheet" type="text/css" href="'+this.convert.cssFileB+'" media="print">\n';
//	myResult+='<link rel="stylesheet" type="text/css" href="'+this.convert.cssFileC+'" media="all">\n';
	myResult+='<style type="text/css">\n * {\n margin: 0; padding: 0;\n }\n #fixed {\n position: fixed;\n }\n #sheet_view {\n margin:0;\n }\n</style> \n<!--[if lt IE 7]> \n<style type="text/css">\n html {\n overflow: hidden;\n }\n body {\n height: 100%;\n overflow: auto;\n }\n #fixed {\n position: absolute;\n margin:0px 0px 0px -96px;\n }\n</style>\n<![endif]-->';

	if(this.convert.hasSwitch){
		myResult+='<script src="'+this.convert.config+'"></script>\n';
		myResult+='<script src="'+this.convert.libFileA+'"></script>\n';
		myResult+='<script src="'+this.convert.libFileB+'"></script>\n';
		myResult+='<script src="'+this.convert.jsFile+'"></script>\n';
	}
	myResult+='</head><body>';

	myResult+='<div class="indexBar" id=fixed><input type="text" style="width:48px;" value="000" align="center" id="pgCounter" onChange="pageJump(this.value,7);" ></input><br/><a href="javascript:pageJump(0,0)" title="最初のページへ" >[start]</a><br/><a href="javascript:pageJump(0,1)" title="-10ページ">[ -10 ]</a><br/><a href="javascript:pageJump(0,2)" title="前へ">[ △ ]</a><br/><a href="javascript:pageJump(0,4)" title="次へ">[ ▽ ]</a><br/><a href="javascript:pageJump(0,5)" title="10ページ">[ +10 ]</a><br/><a href="javascript:pageJump(0,6)" title="最後のページへ">[ end ]</a><br/><div class=bookmarks id=bookmarks>';
myResult+=this.bookmarks.toString("html");
myResult+='</div></div>';

};//ヘッダ回りは、ファイル保存スイッチが入っている時のみ処理

/*	
カラムIDで順次処理
カラムにサブカラムIDを与えてゆきページ内のカラムを消費したら次のページへ移る
強制改行があれば、サブカラムIDをリセットして、空カラムを出力して次のページを開始
シーンカラムはサブカラムを消費しない仕様に変更
*/

//ドキュメントヘッダ出力 > 固定UI側へ移動予定
	{
		myResult+='<div class="titleHeader">:<h1>'+this.title+'</h1><hr></div>\n\n';
	};
//カラム計算初期化
	this.convert.currentPage       = 0;
	this.convert.currentPgDuration = 0;
	this.convert.currentSubTotal   = 0;
	this.convert.currentSCID       = 0;
	var isBreak=false;
	for (var idx=0;idx<this.table.length;idx++){
/*カラムID順にカラムの toString()を実行
toString()は、最後に処理したサブカラムIDを this.convert.currentSCIDにインクリメントセットする(親コンバータのポインタが更新される)ので、
必要にしたがってページヘッダを出力する。ループの最後に次の処理ポインタをセットすること。
 */
		if((this.convert.currentSCID==0)&&(! this.convert.pageHdr)){
//前周回処理の際にブレイクフラグが立っていたら、それは二重改ページになるのでここで削除
			if(isBreak){isBreak=false;}

//ページヘッダ出力(ナビゲーションスイッチ)
if(this.convert.hasSwitch){
	var myPageID=nas.Zf(this.convert.currentPage,3);
	myResult+='<hr><a id="'+myPageID+'" name="'+myPageID+'"> </a><div class="titleHeader">( p.'+myPageID+' ) / <';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',0)" title="最初のページへ" >start</button><';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',1)" title="-10ページ">-10</button><';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',2)" title="前へ">prev</button><';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',3)" title="このページ">===</button><';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',4)" title="次へ">next</button><';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',5)" title="10ページ">+10</button><';
	myResult+='button class=navButton onClick="pageJump(\''+myPageID+'\',6)" title="最後のページへ">end</button></div>';
	myResult+='<div class="logoHeader">';
	//myResult+= config.headerLogo;
	myResult+='</div>';
//myResult+='<br>';console.log(JSON.stringify(this.convert,null,2));
};
// ページヘッダ出力(ナビゲーションスイッチ)//
//ページヘッダーライン
	myResult += '\n<table class="stbd">\n\t<tr class="pageHeader headline"><th class="cutNumber">cut</th><th class="pictureArea">picture</th><th class="contentText">contents</th><th class="dialogText">dialog</th><th class="timeText">time</th></tr>\n';
//ヘッダ出力フラグたてる
	this.convert.pageHdr = true;
		};
//コンテント(ト書き)内に改ページ命令があればそのカラム終了でページの残りを空のカラムで埋めて改ページ
//		フラグたてる
		if(this.table[idx].desc.match(/&lt;break&gt;/)){
			isBreak=true;
		};
		myResult += this.table[idx].toString("html");//ColumnNkr.toStringで取得
//出力がシーン柱の場合はここでcontinueする
		if(this.convert.scnColumn){this.convert.scnColumn = false ; continue;};
//ブレイクフラグがある かつ 残りカラムあり または 全エントリ処理終了で残カラムあり
		if(((isBreak)||((this.table.length-1)==idx))&&(this.convert.currentSCID<this.convert.maxColumns)){
			for(var scidx=this.convert.currentSCID;scidx<this.convert.maxColumns;scidx++){
				myResult+='\n\t<tr class=headline><td class="columnLabel"><br/></td><td class="pictureArea"><br/></td><td class="contents"><br/></td><td class="dialog"><br/></td><td class="timeText"><br/></td></tr>\n';
			}
			this.convert.currentSCID=this.convert.maxColumns;//空のカラムを追加してサブカラムIDを更新
			isBreak=false;
		};
/*
ねこらエディタを使用する場合、規定外の位置のカラムは認められないので
1ページ内のカラムはかならず規定数内に納まる。
*/
//myResult+='<!-- '+this.convert.currentPage+"//"+this.convert.currentSCID+"/"+this.convert.maxColumns+'>\n\n'
		if(this.convert.currentSCID >= this.convert.maxColumns){
			//ページフッタ出力してリセット
			this.convert.currentSubTotal+=(this.convert.currentPgDuration)*1;
//		myResult +='<tr><td colspan=5></td></tr></table>';
		myResult +='</table>';
		myResult +='\n\t<div class="pageFooter">';
		myResult +='p'+nas.Zf(this.convert.currentPage,3);
		myResult +=' / '+nas.Frm2FCT(this.convert.currentSubTotal,2);
		myResult +=' ( '+nas.Frm2FCT((this.convert.currentPgDuration)*1,3);
		myResult +=')</div>\n<div class="pageDivider"></div>';
			this.convert.currentPage++;
			this.convert.currentPgDuration = 0;
			this.convert.currentSCID       = 0;
			this.convert.pageHdr           = false;

		}else{
			//インクリメントはしない
			//this.convert.currentSCID++;
		}
	}
if(this.convert.hasSwitch){
	myResult+='<div class="titleHeader">'
	myResult+='<span id="pageCount">'+this.convert.currentPage+'</span>//';
	myResult+='<span id="columnCount">'+this.table.length+'</span>';
	myResult+='</div>'
};
	
if(this.convert.isFileSave){
	myResult+='</body></html>';
};//ファイル保存時のみ処理

break;
case	"csv":	;//
default:	;//
		myResult+='';
		for (var idx=0;idx<this.table.length;idx++){
			myResult += '"'+idx+'",';//通番ID[0]
			myResult += '"","","'+((this.table[idx].parentCut.index)?this.table[idx].parentCut.index:"")+'",';//[1][2][3]
			myResult += this.table[idx].toString("csv");
//console.log(this.table[idx].toString("csv"));
//			myResult += '\n';
		}
	}
	return myResult;//
};
/*
	編集エージェントオブジェクト
	StoryBoard.eA
表示更新のメソッドが編集エージェントでも本体オブジェクトでもどちらでも良いので必要
編集エージェントは、編集操作を受けとって本体データおよび表示を更新する。
同時に操作を記録して逆戻りを実装する。

undoスタックには、逆操作オブジェクトを積む
dataIndex(2次元),action(index),値(配列)
undoポインタ変数をもつ

*/
/*
StoryBoard.prototype.eA=new Ofject();
{
	StoryBoard.eA.parent=StoryBoard;
	StoryBoard.eA.undoStack=new Array();//Undoスタック
	StoryBoard.eA.undoStack.current=0;//Undoスタックポインタ int
	StoryBoard.eA.doAction=function(dataIdx,actionIdx,values){
		
	}
	
}
*/
//カットオブジェクト
function blankCut(){
//blankCut は、カット初期化用のダミーオブジェクト。
	this.parent	=null;//ストーリーボード
	this.index	=null;//コレクション内でのIndex 重複不可セッション中は固定
	this.name	=null;//カット番号編集OK 重複可能
	this.length	=0;//カット尺フレーム数
	this.duration	=0;//継続時間(トランジション時間を加えたもの)
	this.inPoint	=0;//
	this.columns	=[];//カラムコレクション配列
}

function Cut(myIndex,myParent,initColumn,myInPoint){
//Cut は、カラムのトレーラーであり、映画のカッティング単位です。
//イニシャルカラムで初期化するのはどうか？

	this.parent	=myParent;//ストーリーボード
	this.index	=myIndex;//コレクション内でのIndex 重複不可セッション中は固定
	this.name	=initColumn.cut;//カット番号編集OK 重複可能
	this.length	=(initColumn.sec2Fr())?initColumn.sec2Fr():0;//カット尺フレーム数
	this.duration	=0;//継続時間(トランジション時間を加えたもの)
	this.inPoint	=myInPoint;//
	this.columns	=new Array();//カラムコレクション配列
		initColumn.parentCut=this;
		this.columns.push(initColumn);
}
/*	カットオブジェクトのメソッド	*/
Cut.prototype.column=function(columnID){
	return this.columns[columnID];
	//カラム取得
}

Cut.prototype.addColumn=function(myColumn){
//他のカットに付属しているカラムを受け入れる時の処理を決めないと危ないので注意
	this.columns.push(myColumn);
	myColumn.parentCut=this;
	this.length+=(myColumn.sec2Fr())?myColumn.sec2Fr():0;
	//カラム追加メソッド
}
//このあたりのオブジェクトは不要　とか思っていたが復活

/*
function PageCollection(){
	this.width	=;//用紙バウンディングボックス横(pt)
	this.height	=;//用紙バウンディングボックス縦(pt)
};

function Page(){
//Pageは、カラムのトレーラーです
	this.index	=;//コレクション内でのIndex重複不可
	this.name	=;//ノンブルにつける番号編集OK 重複可能
	this.columns	=new ColumnsCollection();//カラムコレクション
	this.column=function(columnID){
		return this.columns[columnID];
	}
}

function Column(idx){
	this.index	=idx;//カラムID (通しID重複不可)
	this.subColumnId	=;//サブカラムID(ページ内ID ページ内重複不可)
	this.name	=;//カット番号(編集可 重複可能)
	this.parentPage	=;//親ページID オブジェクトの参照の方がよい?
	this.parent	=;//親カットID
	this.position	=[left,top];//カラムのページ内配置

	this.picture	=new Picture();//画像
	this.picture.path	=;//画像文字列
	this.picture.scale	=1;//xy固定スケール
	this.picture.size	=[width,height];//画像サイズ
	this.dialogText	="";//
	this.contentText	="";//
	this.timeText	="";//
//カラムは継続時間を持たない
//カットが、メンバーカラム内のタイムテキストを集計して時間をもつ
}


*/

//絵コンテコンバート用ピクチャークラス
/*
このクラスはFileクラスオブジェクトをHTML用にImageクラスで置き替え

*/
var Picture = function(myParent,myPath){
//Windowsローカルパスだったら補正(ブラウザで読む為の第一補正) Unixタイプのパスは無視してそのまま保持
	if(myPath.match(/^[a-z]\:/i)){myPath="file:///"+myPath;};

//ドキュメントロケーションが "file:"でない場合は、
//"file:"または"//server/"で、ローカル画像を読みに行ってしまうのを防ぐ為に標準的なパスの場合(/.*\/img\/[^\.]\.png/i)のみ
//想定される相対パスに変換 (imgの前を "./"で置換) それ以外は、ブランクイメージと置き替え
	if((! mySB.convert.isLocal)&&(myPath.match(/^(file:\/\/.+|^\/\/.+)/))){
		if(myPath.match(/^[^\.].+(\/(images|image|img|img_png)\/[^\.]+\.(png|jpg|gif))$/i)){
			myPath="."+RegExp.$1;
		}else{
			myPath="./img/blank.gif";
		}
	}
//ファイル名を分離して、同ファイル名のデータがユーザ指定イメージに存在したらそちらとパスを入れ替える
/*先にユーザ画像の指定を行う必要がある スタックがカラの場合は処理自体をスキップする　*/
		var imageStack = document.getElementById("imageSelect").files;
	if(imageStack.length){
		var pathArray = myPath.split('/').reverse();
		var imageId = -1;
		for (var f=0;f<imageStack.length;f++){
			if(imageStack[f].name == pathArray[0]){imageId = f ; break;} 
		}

		if(imageId >= 0 ){
			myPath = window.URL.createObjectURL(imageStack[imageId]);//blob URLを作って与える
		}
	};
/*
 *  画像パスを与えて初期化する
 *	値がなければカラでobjectを返す。
 *
 *  this.file=new File(myPath);//アドビスクリプトファイルクラスで画像ファイルをセットする
 *  カラでもセット可能
 *  一般のブラウザ用にトレーラを作る
 */
	this.file=myPath;//ブラウザ用に文字列で記録
	this.parent=myParent;//カラムオブジェクト
//ピクチャクラスにイメージオブジェクトをプロパティで付ける
	this.image=new Image();
	this.image.src=myPath;
};

/*スタックイメージの更新時にテーブル上の画像をサーチしてスタックの画像と入れ替える

*/

StoryBoard.prototype.setStackImage = function (){
		var imageStack = document.getElementById("imageSelect").files;
	if(imageStack.length == 0) return false;
	for ( var r= 0 ; r < this.table.length ; r++){
		if(! this.table[r].img.file) continue;
		var pathArray = this.table[r].img.file.split('/').reverse();
		var imageId = -1;
		for (var f=0;f<imageStack.length;f++){if(imageStack[f].name == pathArray[0]){imageId = f ; break;};};
		if(imageId >= 0 ){
			if(imageStack[imageId].path){
				console.log(imageStack[imageId].path);
				this.table[r].img.image.src = imageStack[imageId].path;
			}else{
				var myPath = window.URL.createObjectURL(imageStack[imageId]);//blob URLを作って与える
				this.table[r].img.image.src = myPath ;
			}
		}
	}
	convertData();
}
//ねこらSBクラス しおりオブジェクト 単純に
function BookmarkNkr(myParent,idx)
{
	this.parent	=myParent;//ストーリーボードオブジェクトを設定
	this.index	=idx;//ID (通しID重複不可)
	this.name	="";//しおりの名前(編集可 重複可能)
	this.key	="";//キー値
	
}
BookmarkNkr.prototype.parentColumn=function(){
	for(var idx=0;idx<this.parent.table.length;idx++){
		if(this.key==this.parent.table[idx].key){return this.parent.table[idx];}
;//キーをサーチして相当するカラムオブジェクトを返す
	}
	return null;//検索不成功
}
//ブックマーク書き出しメソッド
BookmarkNkr.prototype.toString =function(Mode)
{
	var myResult="";
	switch(Mode){
case	"sbd":;
	myResult	+="<mark>";
	myResult	+="<name>"+this.name+"</name>";
	myResult	+="<point>"+this.key+"</point>";
	myResult	+="</mark>";
break;
case	"html":;
		myResult+='<option value="'+this.key+'"';
		myResult+='>'+this.name+'</a><br/>';
break;
case	"csv":;
		myResult+='"'+this.name+'","'+this.key+'"'+"\n";
default	:
	}
	return myResult;
}

//カラムを束ねてカットを記述するクラス
/*すでにあるコンストラクタを書き直すこと*/
//ねこらSBクラスのカラムオブジェクト
/*
	必要以上のプロパティは持たない
*/

function ColumnNkr(myParent,idx){
	this.parentCut = [];//空カットで初期化(所属カットが無い)
	this.parent	   = myParent;//.paretn;//ストーリーボードオブジェクトを設定
	this.index     = idx;//カラムID (通しID重複不可)
	this.cut       = "";//カット番号(編集可 重複可能)
	this.img       = new Picture([],"");//画像オブジェクト
	this.desc      = "";//
	this.words     = "";//
	this.sec       = "";
	this.total     = "";//いらない? …とりあえず
	this.key       = "";//キー値

//この下は変換用の一時プロパティとして…いらないかも

	this.subColumnId = 0;//サブカラムID(ページ内ID ページ内重複不可)
	this.scene	     = false;//シーン　切り替えカラムフラグ
//	this.position	=[left,top];//カラムのページ内配置
/*
	this.contentText	=this.desc;//互換があるので放置しても良さそう。
	this.dialogText	=this.words;//
	this.timeText	=this.sec;//
*/
}

//
/*
	ねこらSBの秒記述をnas互換のTCまたはフレームで出力するメソッド
	sec2Tc(テキスト)	TC(3番固定)に変換
	sec2Fr(テキスト)	フレーム数で返す
*/
ColumnNkr.prototype.sec2Tc=function(){
	if(
		(this.sec.match(/^([0-9]+)?(\.([0-9]+))?(\+([0-9]+)?)?$/))
	)
	{
		var myFrames=(RegExp.$1*this.parent.framerate)+(RegExp.$3*this.parent.framerate/10)+(RegExp.$5*1)
		return (myFrames)? Math.floor(myFrames/this.parent.framerate)+"+"+myFrames%this.parent.framerate:"";
	}else{	return "";}
}
ColumnNkr.prototype.sec2Fr=function (body){
	if(this.sec.match(/^([0-9]+)?(\.([0-9]+))?(\+([0-9]+)?)?$/))
	{
		var myFrames=(RegExp.$1*this.parent.framerate)+(RegExp.$3*this.parent.framerate/10)+(RegExp.$5*1)
		return Math.floor(myFrames);
	}else{	return 0;}
}
/**
 *	@params {string} outputMode
 *	カラムを各種形式で書き出すメソッド
   sbd|html|ARSC
 *
 *
 *
 */
ColumnNkr.prototype.toString=function(outputMode)
{
	var myResult="";
	switch(outputMode){
case	"sbd":	;//nekoraSBDモード 要するに書き戻し時につかう 値が無い場合を処理シナハレ
myResult +="<tr>";
myResult +="<cut>"+this.cut+"</cut>";
myResult +="<img>"+this.img.file+"</img>";
//myResult +="<img>"+this.picuture+"</img>";
myResult +="<desc>"+this.desc+"</desc>";
myResult +="<words>"+this.words+"</words>";
myResult +="<sec>"+this.sec+"</sec>";
myResult +="<total/>";
myResult +="<key>"+this.key+"</key>";
myResult +="</tr>";
break;

case	"html":	;//HTMLモード 納品用HTML
/*
	このモードがHTMLコンバータなのであとで成形する
	AEでフッテージとして読み込んだ画像ファイルのサイズを取得して
	画像の表示サイズを決定して必要に応じて複数のテーブルレコードを出力する。
	現在のカラム消費をオリジナルのオブジェクトに記録するか?
	それとも制限値を引数にして書き出しをかけるか?

	とりあえず一時プロパティに開始カラムをセットして表示をかけることにする
	contentsプロパティ内部に擬似コマンド(改ページタグ=<break>)を埋め込んで強制改ページ可能にする。


	標準サイズ外の画像の場合は、以下の表示規則で表示
	テキストと画像は画像優先で、テキストにヨコナガ画像がかぶったら、テキストを押し出して表示するのではなく
	テキストをけす。(隠れそうならユーザが次のカラムにテキストを移す。)
	カラムが縦に拡張された場合は、カラムのサイズを整数倍で拡張して画像を表示(次のカラムに影響しない)。
	画像の脇のテキストは通常のテキストよりも表示範囲が増える。(横罫線は、用紙に印字した以外はなくなる。)
	テーブルrowは消費(カット番号とタイム欄は切る) SBカラムは消費。
 */
//画像は 1レコード内におさまるか? 単位はすべてポイント(dtp-point)
	var hasContents	=(this.desc!="")?	true:false;
	var hasDialog	=(this.words!="")?	true:false;
	var maxWidth	= this.parent.convert.pageWidth;
	var maxHeight	=(this.parent.convert.maxColumns-this.parent.convert.currentSCID)*this.parent.convert.columnHeight;//現在使用可能な最大高さdtp-point
	var unitWidth	= this.parent.convert.columnWidth;//単位幅はテキストの有無で変化
	var dummyResolution	= Math.floor(96*this.parent.convert.drawWidthPx/(this.parent.convert.columnWidth*this.parent.convert.pictureMargin));

console.log([hasContents,hasDialog,maxWidth,maxHeight,unitWidth,dummyResolution]);
//カラムがシーン柱に相当するケースではシーン柱を出力する
//シーン柱はページ内カラムを基本消費しない
if(this.scene){
	myResult +='\n<tr class=sceneHeader>';
	myResult +='<th colspan= 5>'+replaceStr(this.desc).replace(/&lt;break&gt;/g,"")+'</th>';
	myResult +='\n</tr>';

this.parent.convert.scnColumn = true;break;
}


//内容テキストがない場合は単位幅を増やす
		if(! hasContents){
			unitWidth+=this.parent.convert.contentsWidth;
			if(! hasDialog){ unitWidth += this.parent.convert.dialogWidth;};
		};
	var unitHeight	=this.parent.convert.columnHeight;
//imgオブジェクトがカラの場合は固定処理で空テーブルデータを挿入
	if(! (this.img.image)){
//has no image
		var myWidth = this.parent.convert.columnWidth ; var myHeight = this.parent.convert.columnHeight;
		var myImgColspan=1;
		var myImgRowspan=1;
		var myImgPath="";
	}else{
//has image
		if(
			((this.img.image.width*96/dummyResolution) <= unitWidth) &&
			((this.img.image.height*96/dummyResolution) <= unitHeight)
		){
//ヒトコマモノなので問題ない
			var myWidth = this.img.image.width*96/dummyResolution ; var myHeight = this.img.image.height*96/dummyResolution;
			if(myWidth<=0) {myWidth  = this.parent.convert.columnWidth };//サイズを0にしない
			if(myHeight<=0){myHeight = this.parent.convert.columnHeight};
		}else{
//コマまたぎなので占有率を計算
//規定解像度で納まるか?
			var isResize	=(((this.img.image.width*96/dummyResolution)>maxWidth)||((this.img.image.height*96/dummyResolution)>maxHeight))? true:false;
//規定解像度以上の場合は最大幅に納まるように縮小する
//ここで表示用の width heightプロパティを決定
			if(isResize){
				var myScaleW=(((this.img.image.width*96/dummyResolution)/maxWidth)>1)? maxWidth/(this.img.image.width*96/dummyResolution):1;	//横オーバー時のスケール
				var myScaleH=(((this.img.image.height*96/dummyResolution)/maxHeight)>1)?maxHeight/(this.img.image.height*96/dummyResolution):1;	//縦オーバー時のスケール
				var myScale=(myScaleH < myScaleW)?myScaleH:myScaleW;	//採用スケール
				var myWidth =myScale*this.img.image.width *96/dummyResolution;var myHeight=myScale*this.img.image.height*96/dummyResolution;
			}else{
				var myWidth=this.img.image.width*96/dummyResolution;var myHeight=this.img.image.height*96/dummyResolution;//リサイズなしなら標準値
			};
		};
//画像の消費面積を消費 colspan/rowspan に換算
		var myImgColspan=1;
		if(myWidth>this.parent.convert.columnWidth){
			myImgColspan=(myWidth<=this.parent.convert.columnWidth+this.parent.convert.contentsWidth)?2:3;
		};
		var myImgRowspan=Math.ceil(myHeight/unitHeight);//最少1 最大 5

		if(this.img.file){
			var myImgPath=this.img.file;
			var myImgSrc=this.img.image.src;
		}else{
			var myImgPath=this.img.file;
			var myImgSrc=this.img.image.src;
		}
//alert("SCID :"+this.parent.convert.currentSCID)
	};//has image || no image
//メモ コメント抑制中
//	myResult +='\n\n<!-- '+this.parent.convert.currentSCID+" :: "+myWidth +"/ "+this.parent.convert.columnWidth+' :colspan: '+myImgColspan+'>\n';
/*
	画像を表示するアルゴリズム
	画像の解像度は標準か?否か
		縦 または 横のサイズが標準解像度の10%(+-5%)誤差以下ならば標準解像度と見なす。
		その場合は、単純に横長・縦長を判定して標準解像度から計算した width および height プロパティを
		つけた img タグでおくり出す。
	標準解像度外の画像は、大サイズは大判扱い 少サイズは拡大表示(標準) で処理
		大判、縦長、横長の画像は、現在の表示位置から計算した最大表示範囲にたいして
		標準解像度で納まるサイズか否かがまず評価される。
		表示可能なかぎり標準解像度で表示して、 納まらない場合は表示範囲内にリサイズされる。

	画像は縦長か?横長か? ( this.width/this.height< this.parent.frameAspect )? タテナガ : ヨコナガ
	(この式はピクセルアスペクトが考慮されてないので正方ピクセルのみで適用)

	暫定的に画像を192dpiとして扱う(2008/02/24)今回の印刷用
*/

//rowspan(sbdデータの1レコード)分だけtable行を出力

	for(var outputR=0;outputR<myImgRowspan;outputR++){
		myResult +='\n\t<tr>';
//最初の1ループのみ画像を出力
		if(outputR==0){
/* 各カラムのidを識別情報で埋める　ページ番号_カラムインデックス_カラム識別子
	レコードインデックスは、カットラベルのアトリビュートとして埋め込む。
*/
//	var myIdprefix=nas.Zf(this.index,5)+'_'+nas.Zf(this.parent.convert.currentPage,3)+'_'+this.parent.convert.currentSCID.toString();
			var myIdprefix=nas.Zf(this.parent.convert.currentPage,3)+'_'+this.parent.convert.currentSCID.toString();
			var myTc=this.sec2Tc();
			var myFrames=this.sec2Fr()//

			myResult +='\t\t<td class="columnLabel"';
			myResult +=' id="'+myIdprefix+'_cl"';
			myResult +=' rcidx="'+nas.Zf(this.index,5)+'"';//コンバート元データの配列id
			myResult +=' key="'+ this.key+'"';

			myResult +=' frames="'+ myFrames +'" ';
			if(this.cut==""){
//	カット番号がないのでカラ改行
				myResult +='>/<br/></td>';
			}else{
//	デバッグ用としてインデックス表示をカット番号表示に加えてあるので注意
				myResult +='>';
//				myResult +='('+this.index+')<br/>';
				myResult +='<span class="cutNm">'+this.cut+'</span><br/></td>';
//				myResult +='>('+this.index+')<br/><span class="cutNm">'+this.cut+'</span><br/></td>';
//				myResult +='><span class="cutNm">'+this.cut+'</span><br/></td>';
			}
			var RSPN =(myImgRowspan>1)?'rowspan="'+myImgRowspan+'" ':'';//行スパンをコメントプロパティ文字列に

			myResult +='\n\t\t<td class="pictureArea" '
			if(this.img.file){
				myResult += RSPN+'>';
/*現在画像リンクは保留中*/
//				myResult += '<a href="'+myImgPath+'" target="sbd_picture">';
				myResult += '<img border="0" width="'+Math.round(myWidth*96/96)+'"';
				myResult += ' id="'+myIdprefix+'_img"';
				myResult += ' height="'+Math.round(myHeight*96/96)+'"';
				if(mySB.convert.isFileSave){
					myResult += ' src="'+ myImgPath +'" />';
				}else{
					myResult += ' src="'+ myImgSrc  +'" />';
				}
//				myResult += '</a>';
				myResult += '</td>';
			}else{
/*画像が無い*/
				myResult += RSPN+'><br/></td>';
			}

//表示可能ならcontents/dialogを表示//あとで成形サブルーチンを通しても良いかも？
			myResult +='\n\t\t<td class="contents" '+RSPN;
			myResult +=' id="'+myIdprefix+'_ctt"';
			myResult +=' cidx="'+this.index+'"';
			myResult +='>'+replaceStr(this.desc).replace(/&lt;break&gt;/g,"")+'<br/></td>';
			myResult +='\n\t\t<td class="dialog"  '+RSPN;
			myResult +=' id="'+myIdprefix+'_wrd"';
			myResult +=' cidx="'+this.index+'\"';
			myResult +='>'+replaceStr(this.words)+'<br/></td>';
			myResult +='\n\t\t<td class="timeText" '+RSPN;
			myResult +=' id="'+myIdprefix+'_tc"';
			myResult +=' cidx="'+this.index+'"';
			myResult +='><br/>'+myTc+'</td>';
			this.parent.convert.currentPgDuration+=myFrames;//カット尺表示時にサブトータル加算
		}else{
//画像の無いカラム（カット番号は表示なし）
//myResult +='\t\t<td class="columnLabel" id="'+nas.Zf(this.parent.convert.currentPage,3)+'_'+(this.parent.convert.currentSCID+outputR).toString()
			myResult +='\t\t<td class="columnLabel"';
			myResult +=' id="'+myIdprefix+'_cl"';
//			myResult +=' cidx="'+this.index+'"';
//			myResult +='" key="">('+this.index+')<br/>/<br/></td>';
			myResult +='" key=""><br/>/<br/></td>';
//			myResult +='\n\t\t<td class="columnLabel">/<br/></td>';		
		}
		myResult +='\n</tr>';
//	消費したカラムを更新
		this.parent.convert.currentSCID += myImgRowspan;
	};
break;

case	"ARSC":	;//AR台本モード
myResult +="<tr>";
myResult +="<th>"+this.cut+"</th>";
myResult +="<td>"+this.desc+"</td>";
myResult +="<td>"+this.words+"</td>";
//myResult +="<sec>"+this.sec+"</sec>";
myResult +="</tr>";
break;

case	"csv":	;//csvモード
default	:	;//デフォルトはcsvモードで(htmlかも…)
myResult += '"'+this.cut+'","'

if(this.img.file) myResult += this.img.file;
//if(this.picuture) myResult += this.picture;
myResult +='","'+encodeURI(decodeStr(this.desc))+'","'+encodeURI(decodeStr(this.words))+'","'+this.sec2Tc()+'","","'+this.key+'"\n';
	}
	return myResult;
}
/**
	実体参照をデコード
*/
function decodeStr(str){
	return str.replace(/\&amp\;/g,'&').replace(/\&gt\;/g,'>').replace(/\&lt\;/g,'<');
}
/*
	引数文字列内の特定記法の文字列を置換
[[wikiタイプか]] または
	
*/
function replaceStr(myString){
	var myResult=myString;
//後で調整の余地あり 縦書き欲しいかも?
	myResult=myResult.replace(/\[\[((http|ftp|mailto):[^\[\]\ ]+)\]\]/g,"<a href=\"$1\">$1</a>");
	myResult=myResult.replace(/\&amp\;link\(([^\,]+),((http|ftp|mailto):.+)\)/g,"<a href=\"$2\">$1</a>");
	myResult=myResult.replace(/\&amp\;font\(([^\,]+),([1-7])\)/g,"<font size=\"$2\">$1</font>");
	myResult=myResult.replace(/\&amp\;strong\((.+)\)/g,"<strong>$1</strong>");
//これは最後に
	myResult=myResult.replace(/\n/g,"<br/>");//改行を<br/>に
	return myResult;
}
/*
	主な機能
*/

function loadData(){
	return jQuery.ajax({
		type    :"GET",
		 url    : url ,
		dataType:"text",
		success : parseData
	});
}
/**
	絵コンテデータをパースする
 *	@params  {String}  myContent
 	データストリーム　nekora-sbd|nas-moviescript|storyborder|csv|JSON
 */
function parseData(myContent){
/*
	各種フォーマットをここでコンバートする
	サポート予定のフォーマット
	nekoraSBD(xml)
	nasMOVIE-SCRIPT(plain-text)
	nasMOVIE-SCRIPT_exchange(JSON)
	storyboader file(JSON)
	AE-csv
*/
	mySB=new StoryBoard();
console.log(JSON.stringify(mySB.convert,0,2));
	if(myContent.indexOf('<?xml version="1.0" encoding="UTF-8" standalone="no"?><storyboard xmlns="http://www.mapletown.net/~nekora/sbedit">') == 0){
//nekora sbd
		var columnCount = mySB.parseSBD(myContent);
	}else if(myContent.match(/^nasMOVIE-SCRIPT\s*\d\.\d/)){
//nasMOVIE-SCRIPT text 親オブジェクトをたててそちらから読み込む
		var newSB = new nas.StoryBoard();
		newSB.parseScript(myContent);
		mySB.author = newSB.author;
		mySB.title = newSB.product;
		mySB.framerate = newSB.framerate;
		mySB.wide = true;//暫定というかtrue/falseしか無いのはちと困る　後で拡張
		mySB.casts = newSB.characters;
console.log(newSB);
		mySB.readCSV(newSB.exportTable('csv'));
		var columnCount = mySB.table.length;
	}else if(myContent.match(/^\{/)){
//JSON-data nasMOVIE-SCRIPT-exchange|storyboarder (JSON)
		var parsedContent = JSON.parse(myContent);
		if((parsedContent.data_type)&&(parsedContent.data_type=="nasMOVIE-SCRIPT-exchange")){
// nasMOVIE-SCRIPT-exchange
			var newSB = new nas.StoryBoard();
			newSB.import(myContent);
			mySB.author    = newSB.author;
			mySB.title     = newSB.product;
			mySB.framerate = newSB.framerate;
			mySB.wide      = true;//暫定というかtrue/falseしか無いのはちと困る　後で拡張
			mySB.casts     = newSB.characters;
			mySB.readCSV(newSB.exportTable('csv'));
//新ストーリボード系は新しい方のオブジェクトに読ませて処理する（新規の処理系を使う）
		}else if(
			( parsedContent.version )&&
			( parsedContent.boards  )&&
			( parsedContent.boards instanceof Array)
		){
//storyboarder (JSON)
//暫定的にこの形式にしてあるが、後ほど新規の処理系へ移行予定
console.log(parsedContent);
			mySB.framerate = parsedContent.fps;
			mySB.wide = (parseFloat(parsedContent.aspectRatio) > 1.50)? true :false;
			mySB.convert.drawWidthPx = 1600;
			var table = [];
			var shotId = 0;//カット順の整数ID origin 0
			var shotNumber = 1;//カット番号　ストーリーボーダーデータの場合ABをはらう
			var currentBoard = null;
			var previewBoard = null;
			for (var b = 0 ;b < parsedContent.boards.length; b ++){
				currentBoard = parsedContent.boards[b];
				var boardDuration = (currentBoard.duration)?currentBoard.duration:parsedContent.defaultBoardTiming;
				shotId = parseInt(currentBoard.shot);
				shotNumber = ((previewBoard)&&(parseInt(previewBoard.shot)==shotId))?
					'':String(shotId);
				table.push([
					b,
					0,
					b,
					shotId,
					shotNumber,
					encodeURI("./img/"+currentBoard.url.replace(/\.png$/,"-posterframe.jpg")),
					((currentBoard.action)? encodeURI(currentBoard.action):''),
					((currentBoard.dialogue)? encodeURI(currentBoard.dialogue):''),
					nas.Frm2FCT(nas.ms2fr(boardDuration),3),
					shotNumber,
					currentBoard.uid
				]);
				previewBoard = currentBoard;
			};
//console.log(csvSimple.toCSV(table,true));
			mySB.readCSV(csvSimple.toCSV(table,true));
		}
	}else if(myContent.match(/^([^,]+,)+/)){
		//nas.csv
		mySB.readCSV(myContent);
	}


document.title=mySB.title;
//	mySB.viewCashStatus();
	viewCashStatus(mySB);
	return columnCount;
}
/*
	ブラウザ用画像キャッシュ取得待ちメソッド
画像サイズ計算を行う為に画像がすべてメモリにキャッシュされている必要がある。
このメソッドの取得待ちが終わってからコンバート可能
オートロードの設定を試験
*/

//function viewCashStatus(){mySB.viewCashStatus()};

function viewCashStatus(myStoryBoard){
    var count = 0;
    var msg   = "";
	if((myStoryBoard==undefined)||(! myStoryBoard.table)){myStoryBoard=mySB;};
console.log(myStoryBoard.convert.imageCount);

    for(var idx = 0; idx < myStoryBoard.table.length; idx++){
//      if(( myStoryBoard.table[idx].img.image instanceof HtmlImage )&&(myStoryBoard.table[idx].img.image.complete)) {count++;};
      if((myStoryBoard.table[idx].img.image)&&(myStoryBoard.table[idx].img.image.complete)) {count++;};
    }
    msg += myStoryBoard.convert.imageCount + "件中" + count + "件完了";
   if(count == myStoryBoard.convert.imageCount){
    msg += ":画像キャッシュがすべて完了しました。コンバートします";
//loadData();
try{convertData()}catch(err){document.getElementById('msg_well').value+=err;};
try{startupQueue()}catch(err){document.getElementById('msg_well').value+=err;};

    }
    showMsg(msg);
//    document.getElementById('sbdBody').innerHTML+="＊";
//    xUI.printStatus("＊",'append')
    if(count < myStoryBoard.convert.imageCount){
     setTimeout(viewCashStatus, 1000);
    }
}

/*	convertData()
	コンバートの実行
*/ 
function convertData(){
	if(!document.getElementById("sbdBody")){return false;}
	document.getElementById("sbdBody").innerHTML="";
	document.getElementById("sbdBody").innerHTML=mySB.toString("html");
	if(! mySB.convert.isFileSave){
		if(document.getElementById("bookmarks")) document.getElementById("bookmarks").innerHTML=mySB.bookmarks.toString("html");
		return true;
	};//ファイルモードの時は実行しない
	return false;
}
function startupQueue(callback){
		//プレイヤオブジェクトがあれば キューを構成する
	if(queueBox){
		queueBox=makeQueue(mySB);
		timeSlider.init();
		if(mySB.convert.frameAspect!=(nas.decodeUnit(document.getElementById("clipFrame").style.width,"px")/nas.decodeUnit(document.getElementById("clipFrame").style.height,"px"))){
			document.getElementById("clipFrame").style.height=Math.floor(nas.decodeUnit(document.getElementById("clipFrame").style.width,"px")/mySB.convert.frameAspect)+"px";
		}
		nas_Action_Startup();
//		try{convertData()}catch(err){document.getElementById('msg_well').value+=err;};
//		try{startupQueue()}catch(err){document.getElementById('msg_well').value+=err;};
	      return true;
	}else{return "no Queue!";}
}

function reloadCurrent(){
if(true){
	
}else{
		myAjax =new Ajax.Request(
			url, 
		{
			method: 'get', 
			onComplete: updateSB
		});
}
}

if(true){
function updateSB(myContent){
//	parseData(myContent);
//	convertData();
	
}

}else{
function updateSB(){convertData(parseData(myAjax));}
}
function printBorder(stat){
if(!stat){stat="visible"};
	switch (stat){
case	"hide":;
	nas.addCssRule("table","border-style:none;border-width:0pt","print");//テーブルの罫線を消す
	nas.addCssRule("tr","border-style:none","print");//tr
	nas.addCssRule("th","border-style:none","print");//th
	nas.addCssRule("td","border-style:none","print");//td
	nas.addCssRule("tr.pageHeader","display:none","print");//ページヘッダ
	nas.addCssRule(".cutNm","display:none","print");//カット番号
//	nas.addCssRule();//
break;
default	:;
	nas.addCssRule("table","border-width:3pt;border-style:solid","print");//テーブルの罫線を消す
	nas.addCssRule("tr","border-style:solid","print");//tr
	nas.addCssRule("th","border-style:solid","print");//th
	nas.addCssRule("td","border-style:solid","print");//td
	nas.addCssRule("tr.pageHeader","display:inline","print");//ページヘッダ
	nas.addCssRule(".cutNm","display:block","print");//カット番号

	}
}
/*	暫定版データエコーCGI 呼び出し
	簡易CGIをコールしてファイルを保存
	拡張子をキーに与えてそれでデータ種別を切り換えている
 */

function callEcho(myExt)
{
	if(! ServiceUrl){ServiceUrl="http://hpcgi2.nifty.com/Nekomata/remaping/rmpEcho.cgi?";}
	if(! myExt){myExt="txt";};
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	mySB.convert.isFileSave=true;//関連するのはhtml時のみ
	document.saveXps.XPSBody.value=encodeURI(mySB.toString(myExt));
	mySB.convert.isFileSave=false;//関連するのはhtml時のみ
	document.saveXps.XPSFilename.value=encodeURI(mySB.title.toString())+'\.'+myExt;
	document.saveXps.submit();
}
/**
	プレイヤ画面と絵コンテビューの切り替え（暫定）
	排他にしないほうが良いので後で一考
	引数でコントロール
	引数がない場合は、現状の変更
	
*/
function switchScreen(myTarget){
	if(! myTarget) myTarget = (document.getElementById('sbdBody').style.display=='none')?'s-board':'player';
	if(myTarget != 'player') myTarget='s-board';
	
	if(myTarget=='s-board'){
		if(STATUS=='run'){
			nas_Capt('Start_Stop');
		};
		document.getElementById('playerArea').style.display='none';
		document.getElementById('sbdBody').style.display='block'
	}else{
		document.getElementById('playerArea').style.display='block';
		document.getElementById('sbdBody').style.display='none';
	};
	document.getElementById('hideSB').value=(document.getElementById('sbdBody').style.display=='none')?'▲':'▼';
}


/*	setURL()
	データファイルのURLを取得してデータを読み込む
	
*/
var setURL = function setURL(documentfile){
	if(documentfile.path){
console.log(documentfile);
//		mySB=new StoryBoard();
		fileBox.openFile(documentfile.path,parseData);
		mySB.url = documentfile.path;
	}else{
//　URLを設定ファイルから取り込んで画面に表示 
//	var urls = (targetURL instanceof Array)? targetURL:[targetURL];
//console.log(urls);
//		urls.isHold=function(myTarget){
//			var myResult=false;
//			for(var idx=0;idx<this.length;idx++){if(this[idx]==myTarget){myResult=true;break;};};
//			return myResult;//配列内に指定値があればtrue
//		}
//	var url  = urls[0];//第一要素を初期値に
		var url  = (documentfile instanceof File)? window.URL.createObjectURL(documentfile):documentfile;
//		mySB=new StoryBoard();
console.log(url)
console.log($('.columnLabel'))
		var myAjax=new Object();
console.log(autoSwitch);
  	if(autoSwitch){
		myAjax= jQuery.ajax({
			type    :"GET",
			url    : url ,
			dataType:"text",
			success : function(res){parseData(res);}
		});
	}
  }
/*
	AIR 及び Photoshopモードでは、prototypeのAJAXでなく、ローカルファイルから直接読み込みを行うように変更する
	AJAX経由だと、ロケーション制限が発生する
*/
}
/**
	StoryBoard から nas.StoryBoardを得る
	
 */
StoryBoard.prototype.getSTBD = function(){
	if(! nas.StoryBoard) return null;
	var result = new nas.StoryBoard(this.title);
	result.importTable(this.toString('csv'));
	return result;
}
//インポート用ファイルドラッガ初期化
 $(function() {
        var localFileLoader = $("#data_well");
        // File API が使用できない場合は諦め
        if(!window.FileReader) {
        console.log("File API がサポートされていません。:"+new Date());
          return false;
        }
        // イベントをキャンセルするハンドラ
        var cancelEvent = function(event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        // dragenter, dragover イベントのデフォルト処理をキャンセル
        localFileLoader.bind("dragenter", cancelEvent);
        localFileLoader.bind("dragover", cancelEvent);
        // ドロップ時のイベントハンドラを設定
        var handleDroppedFile = function(event) {
          // ドロップされたファイル配列を取得してファイルセレクタへ 同時にonChangeを打つ
          document.getElementById('fileSelect').files = event.originalEvent.dataTransfer.files;
          // デフォルトの処理をキャンセル
          cancelEvent(event);
          return false;
        }
        // ドロップ時のイベントハンドラを設定
        localFileLoader.bind("drop", handleDroppedFile);
});
