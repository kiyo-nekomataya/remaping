/*
	絵コンテプレイヤ
ベースは、ストップウオッチだが、考えてみたら時間計測処理のルーチンが
ほとんど転用可能なので即席にやっつけてみる。
仕事遅れちゃうよ!

2008/04/04 着手
2008/04/07 動いた
2008/04/08 プレイヤ部分の体裁が整ったのでひと休みしたいカモね

2008/04/16 いろいろ
ねこらエディタのページ行数 画面アスペクト を反映する仕様に変更
キュー構造を複数トラック登録可能に変更
カット番号とト書きをプレイヤ画面に表示可能に(セリフはまた今度)
動作を部分調整
絵コンテのページ表示とプレイヤをマージ
なんかもう コンバータというよりも「プレイヤ」がどんどん主体に

しかし・古いコードを多用したのでスタイルがバラバラですごく見苦しい感じ


このプログラムの著作権は「ねこまたや」にあります。

あなたは、このプログラムのこの著作権表示を改変しないかぎり
自由にプログラムの使用・複製・再配布などを行うことができます。

あなたは、このプログラムを自己の目的にしたがって改造することができます。
その場合、このプログラムを改造したものであることを明記して、この著作権表示を
添付するように努めてください。

このプログラムを使うも使わないもあなたの自由なのです。

ただし、作者はこのプログラムを使用したことによって起きたいかなる
不利益に対しても責任を負いません。
あなたは、あなたの判断と責任においてこのプログラムを使用するのです。

なんか、困ったことがあったら以下で連絡してもらえると何とかなるかもしれません。
http://www.nekomataya.info/
mailto:support@nekomataya.info

そんな感じです。
*/
//	変数初期化
var VER="Type04 based storyBoardPlayer ver20150121";//
var upDate = "$Date: 2015/01/21 $;"
//	画面の設定 は、javascriptに移植した時点で、呼び出す側のhtml自身のスタイルシートや
//	デザインにゆだねることにしたので、ここではなし。
//	**ダッシュボード対応のため以下の変数を設定のこと。
	var LapColor="#777777";
	var LapColorStrong="#444444";

//	初期状態の設定
// 初期状態は、呼び出し側に記述された値で上書きするのでこちらを特に変更する必要はなさそう。
//	時計の設定
/*	不要になった設定群


*/
var queueBox=[];//キューコレクション
var loopPlay=true;//ループフラグ
var ccrate = 1000 ;//最少計測単位(javascriptではミリ秒固定)

// Status は 変更 stop/run のみ
var STATUS = "stop" ;

//	フレームレートセット	ここの並びでループする　100fps 24FPS 30NDF 30DF 25FPS 
RATEs = ["RT","24FPS","30NDF","30DF","25FPS"];
var RATE = "24FPS" ;
var frate = 24. ;
var skipFrame=0;	//キュー再生レート 外部参照用変数フレームスキップ数
var playRate=Math.floor(Math.abs(skipFrame))+1;//
//	マウスクリックでアクションするかどうかのフラグ
var m_action= false ; 

//	ログ配列を初期化
Log = new Array() ;
function nas_Push_Log(str) {Log = Log.concat([str])}
//	ログ 初期化してみる
nas_Push_Log( "Program Started " + VER);
nas_Push_Log( Date() );
nas_Push_Log( "     FrameRate" + frate + "(" + RATE + ")");

//nas_Push_Log( "     Start Mode      [" + MODE + "]" );

//ラップの最大保持数をここに記入
/*
	ラップ領域はタイムマーカーとして使用する
	挿入インターフェースは、ストップウオッチと同じく
	ただしステータスの切り替えはしない
*/
MaxLap = 8;
//	ラップ用のメモリを初期化

function nas_Clear_LAP() {
var checkMX=MaxLap;
	LAP = new Array(MaxLap);
	COL = new Array(MaxLap)
	LapName = new Array(MaxLap);
		for(var i = 0; i < MaxLap; i++){
LapName[i] = "lapView" + i;
LAP[i] = nas_FR2TC(0)[1] ;
COL[i] = LapColor;
// ラップ表示欄は、きちんとラップメモリの数だけ作ってね。
// でないとラップを減らしちゃうよ。
try {
	document.getElementById(LapName[ i ]).innerHTML = LAP[i];
	document.getElementById(LapName[ i ]).style.color = COL[i];
	var VoiD = document.getElementById(LapName[i]).innerHTML;
} catch(eRR) {
	checkMX= i + 1 ;	
	nas_Push_Log("\tcheck " + LapName[i] + eRR);
	nas_Push_Log(VoiD);
}
			} 
	MaxLap = checkMX;
	nas_Push_Log("\tLap memory clear");
 }
//	nas_Clear_LAP(MaxLap);
//	時間関連オブジェクトの初期化
ClockClicks = new Date();

var Start = 0;
var Stop = 0;

var nas_display = "";

//
//	clock clicks の値からモード別に表示値を生成
function nas_cc2dp(cc) {
		frms = nas_cc2FR( cc - Start );
		TC = nas_FR2TC( frms );
		f = TC[0][3];
	return TC[1] ;
}
//	end proc
//	TC値からフレーム値を算出
function nas_TC2FR(TC) {
//TCのフォーマットは [h,m,s,f] 配列にする
	h = TC[0]; m = TC[1]; s = TC[2]; f = TC[3];
switch(RATE) {
case "RT":
	FR = h * 360000 + m * 6000 + s * 100 + f ; break;
case "24FPS":
	FR = h * 86400 + m * 1440 + s * 24 + f ; break;
case "30NDF":
	FR = h * 108000 + m * 1800 + s * 30 + f ; break;
case "30DF":
	FR = h * 107892 + (m / 10) * 17982  ;
	if((m % 10) != 0) {FR = FR + s * 30 + f} else {
		if(s) {
FR = FR + (m % 10) * 1800 - ((m % 10) - 1) * 2 + s * 28 + (s - 1) * 2 + f ;
		} else {
if(f <= 1) {f = f + 2 }
FR = FR + (m % 10) * 1800 - ((m % 10) - 1) * 2 + f - 2;
		}
	}
	break;
default :
	FR = h * RATE * 3600 + m * RATE * 60 + s * RATE + f
}
return FR }
//	end proc
//	FR値からTC値を算出
function nas_FR2TC(FR) {
if (FR<0){FR=nas_TC2FR([24,00,00,00])+FR;};
	switch (RATE) {
case "RT":
	h = Math.floor(FR / 360000) % 100;
	m = Math.floor(FR / 6000) % 60;
	s = Math.floor(FR / 100) % 60;
	f = Math.floor(FR) % 100;
TCs = nas_Zfill(h%24,2)+":"+nas_Zfill(m,2)+":"+nas_Zfill(s,2)+"."+nas_Zfill(f,2);
	break;
case "24FPS":
	h = Math.floor(FR / 86400) % 100;
	m = Math.floor(FR / 1440) % 60;
	s = Math.floor(FR / 24) % 60;
	f = Math.floor(FR) % 24;
TCs = nas_Zfill(h%24,2)+":"+nas_Zfill(m,2)+":"+nas_Zfill(s,2)+"+"+nas_Zfill(f,2);
	break;
case "30NDF":
	h =Math.floor(FR / 108000) % 100;
	m =Math.floor(FR / 1800) % 60;
	s =Math.floor(FR / 30) % 60;
	f =Math.floor(FR) % 30;
TCs = nas_Zfill(h%24,2)+":"+nas_Zfill(m,2)+":"+nas_Zfill(s,2)+":"+nas_Zfill(f,2);
	break;
case "30DF":
	h =Math.floor((FR / 107892) % 100);
	if(FR % 17982 < 1800) {
	m =Math.floor(((FR / 17982) % 6) * 10  + ((FR % 17982) / 1800))
	} else {
	m =Math.floor(((FR / 17982) % 6) * 10  + (((FR % 17982 ) - 2) / 1798))
	}
	s = Math.floor((((m % 10) * 2 + (FR / 17982) * 18 + FR) / 30) % 60);
	if ((m % 10) != 0) {
	f = Math.floor(((m % 10) * 2 + (FR / 17982 ) * 18 + FR) % 30)
	} else {
	if (s != 0) {
	f = Math.floor((((FR / 17982 ) * 18 + FR) % 30) + 2)
	} else {
	f = Math.floor(((m % 10) * 2 + (FR / 17982 ) * 18 + FR) % 30)
	}
	}
TCs = nas_Zfill(h%24,2)+":"+nas_Zfill(m,2)+":"+nas_Zfill(s,2)+";"+nas_Zfill(f,2);
	break;
default :
	h = Math.floor(FR / (frate * 3600)) % 100;
	m = Math.floor(FR / (frate * 60)) % 60;
	s = Math.floor(FR / frate) % 60;
	f = Math.floor(FR) % Math.floor(frate);
TCs = nas_Zfill(h%24,2)+":"+nas_Zfill(m,2)+":"+nas_Zfill(s,2)+"-"+nas_Zfill(f,2)
}
TC = [h,m,s,f];
	return [TC,TCs]
}
//	end proc

//	cc値からFR値
function nas_cc2FR(cc) {
//global ccrate frate
	FR = Math.floor((frate * cc) / ccrate)
	return FR
}
//	end proc
//	FR値からcc値
function nas_FR2cc(FR) {return Math.floor((FR / frate) * ccrate)}
//	end proc
//	ゼロ埋め
function nas_Zfill(n,s) {if(n < Math.pow(10,(s - 1))) {
	rt = Math.pow(10,s) + n + "";
//document.getElementById("status").value = rt;
return rt.substr(1,rt.length-1)
} else {
return "" + n}}
//	終了
//	tclsh 互換リスト操作サブプロシージャ
//	lsearch(配列,検索値)
function nas_Alsearch(arr,ser) {for(n=0; n<arr.length; n++){if( arr[n] == ser ){ return n; break;}}}
//	フレームレート変更
function chgfps(pint){nas_ChangeRATE(pint)}
function nas_ChangeRATE(newrate) {
	ClockClicks = new Date();

//キャンセル用に変更前の値を退避
	cancel_Action = "ChangeRATE";oldrate = RATE;

switch(newrate) {
case "next":
newrate = RATEs[ nas_Alsearch(["25FPS","RT","24FPS","30NDF","30DF"],pastrate) ];break;
case "24FPS":
case "25FPS":
case "RT":
case "30NDF":
case "30DF":	newrate=newrate;break;
default:
A = isNaN(newrate);
if(A == true) {newrate = "RT"} else {
if(newrate <=0) {newrate = "RT"} else {if(newrate >= 101) {newrate = "RT"} else {newrate = newrate}}}
}
	switch(newrate) {
case "RT":	frate = 100.	; RATE = newrate; pastrate = RATE; break;
case "24FPS":	frate = 24.	; RATE = newrate; pastrate = RATE; break;
case "30NDF":	frate = 30.	; RATE = newrate; pastrate = RATE; break;
case "30DF":	frate = 29.97	; RATE = newrate; pastrate = RATE; break;
case "25FPS":	frate = 25.	; RATE = newrate; pastrate = RATE; break;
default:	frate = newrate ; RATE = newrate + "fps";
	}
	switch(STATUS) {
case "stop":
 document.getElementById("nas_display").value = nas_FR2TC(nas_cc2FR(Stop - Start))[1];
 break;
case "run":
 document.getElementById("nas_display").value = nas_cc2dp(ClockClicks.getTime()) ;
 break;
default :
	}
//alert(RATE+" : "+frate)
	document.getElementById("nas_RATE").innerHTML = RATE.toString();
	nas_Push_Log("Change RATE\t"+ newrate )
	nas_Push_Log("Change frate\t"+ frate )
}
//	end proc
// U.I タイムスライダ
/*
	タイムスライダクラス
*/
var timeSlider=new TimeSlider();
function TimeSlider(){
	this.workStart=0;//ワークエリア開始オフセット
	this.workEnd=1;//終了オフセット
	this.currentTime=0;//変更時のタイム位置バッファ
	this.slideTime=0;//変更後の値バッファ
	this.slmax=1;//初期値とかなんでも良い
	this.slmin=0;

	this.useWorkArea=true;

	this.offsetLeft=0;//start
	this.runSpan=100;
	this.onMove=false;
}
TimeSlider.prototype.init=function(){
	this.slmin=0;
	this.slmax=mySB.duration;
	this.offsetLeft=nas.decodeUnit(document.getElementById("leftmark").style.left,"px")+nas.decodeUnit(document.getElementById("leftmark").style.width,"px");//start 左マーク＋左マーク幅:右側
	this.runSpan=nas.decodeUnit(document.getElementById("rightmark").style.left,"px")-nas.decodeUnit(document.getElementById("timeMarker").style.width,"px")-this.offsetLeft;
	this.workStart=0;//右マーク位置-カーソル幅
	this.workEnd=mySB.duration-1;//Maxで
//ワークエリア再描画
	this.redrawWorkArea();
}
TimeSlider.prototype.setTime=function(currentFrame)
{
	if(this.onMove){return;};//移動指定中は更新なし
	var markerPos = this.offsetLeft+Math.floor(this.runSpan*(currentFrame/(mySB.duration-1)));
	if(nas.decodeUnit(document.getElementById("timeMarker").style.left,"px")!=markerPos){document.getElementById("timeMarker").style.left=markerPos+"px";};
}
TimeSlider.prototype.redrawWorkArea=function(inPoint,outPoint)
{
/*
	1よりも上に指定されたポイントはフレーム数
	1以下の指定は比率としてフレームに換算する
*/
	if(isNaN(inPoint)){inPoint=this.workStart};
	if(isNaN(outPoint)){outPoint=this.workEnd};
	
	if(inPoint<1){
		inPoint=inPoint*(mySB.duration-1);
	}
	if(outPoint<1){
		outPoint=(outPoint)?outPoint*(mySB.duration-1-inPoint):(mySB.duration-1);
	}

	this.workStart	=Math.floor(inPoint);
	this.workEnd	=Math.floor(outPoint);

//	showMsg(inPoint+":"+outPoint)
	showMsg("setWorkArea >"+this.workStart+":"+this.workEnd)

	var myLeft=this.offsetLeft+((this.runSpan+nas.decodeUnit(document.getElementById("timeMarker").style.width,"px"))*(this.workStart/(mySB.duration-1)));
	var myWidth=((this.workEnd-this.workStart)/(mySB.duration-1))*(this.runSpan+nas.decodeUnit(document.getElementById("timeMarker").style.width,"px"));

	document.getElementById("workArea").style.left=myLeft+"px"
	document.getElementById("workArea").style.width=myWidth+"px";

/*	if(this.useWorkArea){
		var currentTime=nas_currentTime();
		if(currentTime<this.workStart){nas_throwTime(this.workStart);};
		if(currentTime>this.workEnd){nas_throwTime(this.workEnd);};
	}*/
}
//ワーク(再生)エリアを設定する
TimeSlider.prototype.setWorkArea=function(evt,mySide)
{
	var clickFrame=Math.floor(nas_currentTime()%mySB.duration);
	if(! evt.ctrlKey){
//セットする
		switch(mySide){
case	"left":
	if(clickFrame<this.workEnd){
		this.redrawWorkArea(clickFrame,"left");
	}
break;
case	"right":
	if(clickFrame>this.workStart){
		this.redrawWorkArea("right",clickFrame);
	}
break;
case	"center":
default:
		}
	}else{
//リセットする
		switch(mySide){
case	"left":
		this.redrawWorkArea(0,"left");
break;	
case	"right":
		this.redrawWorkArea("right",0);
break;	
case	"center":
default:
	var leftSpan=Math.abs(this.workStart-clickFrame);
	var rightSpan=Math.abs(this.workEnd-clickFrame);
	if(leftSpan<rightSpan){
		this.redrawWorkArea(clickFrame,"left");
	}else{
		this.redrawWorkArea("right",clickFrame);
	}
		}
	}
}

/*
	タイムスライダ
	以前に書いた不可視スライダの流用
	あとで汎用スライダクラスを書く

	ガンマ補正は不要で戻り値はマッピング生成に変更
	データチャンクは不要
	timeSlider.slideVALUE(event);
*/
timeSlider.slideValue =function(evt)
{
 if((evt.clientX<this.offsetLeft)||(evt.clientX>(this.runSpan+this.offsetLeft+nas.decodeUnit(document.getElementById("timeMarker").style.width,"px")))){return}
// if (STATUS=="run"){return;};
//走行時は無効? 
/*
	たぶんあとでワークエリア拡張(拡大)をすることになると思うので
	固定コーディングにしないで ここで再初期化する
*/
	this.slmax = mySB.duration-1;//終了フレーム
	this.slmin = 0;//開始フレーム
	this.slideTime=Math.floor(this.slmin+((evt.clientX-this.offsetLeft)/this.runSpan)*(this.slmax-this.slmin));
	nas_throwTime("0+"+this.slideTime);
	this.onMove=true;
	this.currentTime=nas_currentTime();//バッファに現在時を取得
//この前にイベントがあれば控えて置いた方が汎用性があるが専用なのでパス?
switch (navigator.appName) {
case "Opera":
case "Microsoft Internet Explorer":
	document.body.onmousemove = this.MVSlider_IE;break;
case "Netscape":
	document.body.onmousemove = this.MVSlider_NS;break;
default:	;
}
	document.body.onmouseup = this.sliderOFF;
}

timeSlider.sliderOFF=function()
{
	timeSlider.onMove=false;
if (timeSlider.currentTime != timeSlider.slideTime)
	{
		nas_throwTime("0+"+timeSlider.slideTime);
	}
//イベントバッファを作った方が良い
	document.body.onmousemove = null;
	document.body.onmouseup = null;
	return;
}

TimeSlider.prototype.MVSlider_NS=function(event){
//スライダの位置を算出
	var myValue=(event.clientX-timeSlider.offsetLeft)/timeSlider.runSpan;//スライダの位置から全体の比例値へ
//上限下限でおさえる
	if (myValue > 1) {myValue = 1} {
		if (myValue < 0) {myValue = 0}
	}
//指定範囲(フレーム)にマップ
	var myFrame=timeSlider.slmin+myValue*(timeSlider.slmax-timeSlider.slmin);//浮動少数
	timeSlider.slideTime = Math.floor(myFrame);//切り捨て値でプロパティを変更
//直接スライダの位置を変更
	document.getElementById("timeMarker").style.left=Math.floor((myValue*timeSlider.runSpan)+timeSlider.offsetLeft)+"px";
//タイマセット
	nas_throwTime("0+"+timeSlider.slideTime);
}


TimeSlider.prototype.MVSlider_IE =function(){
//スライダの位置を算出
	var myValue=(event.clientX-timeSlider.offsetLeft)/timeSlider.runSpan;//スライダの位置から全体の比例値へ
//上限下限でおさえる
	if (myValue > 1) {myValue = 1} {
		if (myValue < 0) {myValue = 0}
	}
//指定範囲(フレーム)にマップ
	var myFrame=timeSlider.slmin+myValue*(timeSlider.slmax-timeSlider.slmin);//浮動少数
	timeSlider.slideTime = Math.floor(myFrame);//切り捨て値でプロパティを変更
//直接スライダの位置を変更
	document.getElementById("timeMarker").style.left=Math.floor((myValue*timeSlider.runSpan)+timeSlider.offsetLeft)+"px";
//タイマセット
	nas_throwTime("0+"+timeSlider.slideTime);
}
//スライダ関連終了

//表示用インターバルプロシージャ
/*
表示マネージャ
	ここが一番変わる部分
ステータスは stop/run の2パターンに整理

run 時は 現在時間とキューをみて必要な画像の入れ替えを行う
*/
function nas_update_View() {

	var currentTime=nas_currentTime();
	var frms=Math.floor(currentTime);
	frms=frms%mySB.duration;

	TC = nas_FR2TC(frms);
	f = TC[0][3];
		nas_display = TC[1];
		if(nas_display != document.getElementById("nas_display").value) {
			document.getElementById("nas_display").value = nas_display;
		}
	if(STATUS=="run")
	{
		if(currentTime>timeSlider.workEnd){
			var now=new Date().getTime();Start=now-(ccrate*timeSlider.workStart/frate);Stop=now;
			if(! loopPlay){
				nas_Start_Stop();nas_throwTime("0+"+timeSlider.workEnd);
			};
		}
	}
//タイムスライダ更新
	if(! timeSlider.onMove){
		timeSlider.setTime(frms);
	};

//pictureSwap
/*
	実際に絵を入れ替えているのがここ。なるべく軽くなるよう調整
*/
	myStepedFrame=Math.floor(currentTime/playRate)*playRate;
	var myQueues=queueBox.getQueue(myStepedFrame);

	if(myQueues.length){
//キューが存在しなければ不要(現仕様では必ずあるが、それはそれ)
		//取得したキュー配列を順次処理
		for(var qIdx=0;qIdx<myQueues.length;qIdx++){
			if(queueBox.inPool(myQueues[qIdx].index)){continue;};//表示プールに値があれば処理スキップ
			//プール内に存在しないqueueをプールに投入
			queueBox.queuePool.push(myQueues[qIdx].index);//順不同になるがそれは問題ないはず
		}
			//キュープール内のエントリを評価
		queueBox.checkQP(currentTime);

if(false){
		var newQueuePool=new Array();//新規queuePool
		for(var qpid=0;qpid<queueBox.queuePool.length;qpid++){
			if(queueBox.checkQP(qpid,currentTime)){newQueuePool.push(qpid);};//キュープール内で表示寿命の残っているモノだけ収集
		}
		queueBox.queuePool=newQueuePool;//新規内容でプール置き替え
}
//
//		place(myQueues[1].column.index,myQueue[1].geometry);//暫定処理決め打ち反対
	}
}
//	end proc

function nas_push_LAP(cc) {
//	TCの場合 
	for(var n = MaxLap - 1 ;n > 0 ;n-- ) {
		LAP[n] = LAP[n - 1];
		COL[n]=COL[n - 1];
	};
	LAP[0] = nas_FR2TC(nas_cc2FR(cc - Start))[1];
	COL[0] = LapColorStrong;

	document.getElementById("nas_display").value = LAP[0];
	for(var n = 0 ; n < MaxLap ;n++) {
		document.getElementById("lapView"+ n).innerHTML=LAP[n];
		document.getElementById("lapView"+ n).style.color=COL[n];
	}
//	LOG
	switch(STATUS) {
case "stop":    PreFix ="Stop"; break;
case "run":     ;
default :       PreFix =""
	}
	nas_Push_Log(PreFix + "\t" + LAP[0])
}
//	end proc
//	スタートとストップ引数なし
function nas_Start_Stop() {
//呼出元にしたがって 基準時刻の選択 ダメならとりあえず現在時刻をとる
switch (nas_capt) {
case "Key"	:now = ct_K; break;
case "Object"	:now = ct_O; break;
case "Mouse"	:now = ct_M; break;
default:
ClockClicks = new Date(); now =ClockClicks.getTime()
}

	switch(STATUS) {
case "stop":    Start = now - (Stop - Start);
//		if(Stop != 0) {nas_push_LAP(now)} else {nas_Push_Log("Start")}
		STATUS ="run"; break;
case "run":     nas_cc2dp(now);
		Stop = now;
		STATUS = "stop"; break;
	}

document.getElementById("status").innerHTML = STATUS
document.getElementById("playSwitch").innerHTML=(STATUS=="run")?"<img src=./images/sbd-ui/pause.png>":"<img src=./images/sbd-ui/play.png>";
}
//	end proc
/*
	タイムマーカーを移動する
	nas_throwTime(キーワードまたはTC)
	TCは ss+kk
*/
//	現在のタイムマーカー位置を返す
function nas_currentTime(){
	return (STATUS=="stop")?frate*(Stop-Start)/ccrate:frate*((new Date().getTime())-Start)/ccrate;
}

function nas_throwTime(action){
if(STATUS=="stop"){
//	var currentTime=frate*(Stop-Start)/ccrate;
	var currentTime=nas_currentTime();

	switch(action){
	case	"start":
		Start=Stop-(ccrate*mySB.cuts[(mySB.getCutByTime(currentTime).index-1+mySB.cuts.length)%mySB.cuts.length].inPoint/frate);
//		Start=Stop-(ccrate*(mySB.getCutByTime(currentTime).inPoint)/frate);
//		Start=0;Stop=0;
break;
	case	"bwd":
		Stop=(Start<Stop)?(Stop-ccrate*1/frate):Start;
break;
	case	"fwd":
		Stop=(Stop>=(Start+ccrate*((mySB.duration-1)/frate)))?(Start+ccrate*((mySB.duration-1)/frate)):(Stop+ccrate*1/frate);
break;
	case	"end":
		Start=Stop-(ccrate*mySB.cuts[(mySB.getCutByTime(currentTime).index+1)%mySB.cuts.length].inPoint/frate);
//		Stop=(Start+ccrate*((mySB.duration-1)/frate));
break;
	default:;//数値のみが指定された場合は"秒"指定(ねこらSB互換)なのでコーディング注意 フレームベースに戻すか?
		var myTc=(action.toString().match( /^([0-9]+)?(\.([0-9]+))?(\+([0-9]+)?)?$/ )) ? RegExp.$1*frate+RegExp.$3*1+RegExp.$5*1:action;
		var myFr=nas.FCT2Frm(myTc);
		if((action==myFr)&&(isNaN(myFr))){ return;}else{Start=0;Stop=myFr*1000/frate;};
	}
}else{
	ClockClicks = new Date(); now =ClockClicks.getTime();
	var currentTime=frate*(now-Start)/ccrate;
	switch(action){
	case	"start":
		Start=now;
break;
	case	"bwd":
		Start=now-(ccrate*mySB.cuts[(mySB.getCutByTime(currentTime).index-1+mySB.cuts.length)%mySB.cuts.length].inPoint/frate);
//		Start=now-(ccrate*queueBox[queueBox.getQueue(currentTime)[1].index-1].inPoint/frate);
//		Start+=ccrate*1/frate;//前のカット
break;
	case	"fwd":
		Start=now-(ccrate*mySB.cuts[(mySB.getCutByTime(currentTime).index+1)%mySB.cuts.length].inPoint/frate);
//		Start=now-(ccrate*queueBox[queueBox.getQueue(currentTime)[1].index+1].inPoint/frate);
//		Start-=ccrate*1/frate;//次のカット
break;
	case	"end":
		if(!loopPlay){nas_Start_Stop();Stop=(Start+ccrate*(mySB.duration/frate)-1)}else{Start=now-(ccrate/frate)};

break;
	default:;//数値のみが指定された場合は"秒"指定(ねこらSB互換)なのでコーディング注意 フレームベースに戻すか?
	var myTc=(action.toString().match( /^([0-9]+)?(\.([0-9]+))?(\+([0-9]+)?)?$/ )) ? RegExp.$1*frate+RegExp.$3*1+RegExp.$5*1:action;
	var myFr=nas.FCT2Frm(myTc);
		if((action==myFr)&&(isNaN(myFr))){ return;}else{Start=now-(ccrate*myFr/frate);};

	}
}}
function nas_Lap_Reset() {

//呼出元にしたがって 基準時刻の選択 ダメならとりあえず現在時刻をとる
switch (nas_capt) {
case "Key"	:now = ct_K; break;
case "Object"	:now = ct_O; break;
case "Mouse"	:now = ct_M; break;
default:
ClockClicks = new Date(); now =ClockClicks.getTime()
}
	switch(STATUS) {
case "stop":    nas_cc2dp(Start);
		if(Stop != 0) {nas_push_LAP(Stop)}
//		Start = 0 ; Stop = 0 ; nas_Push_Log("\treset\n");
		break;
case "run":     nas_push_LAP(now);
		break;
	}
}
//	end proc
function nas_Input(key) {
//モード判定してプレイヤー表示の時以外は、キーを拾わない
if(document.getElementById("sbdBody").style.display=="block"){
	return true;
}else{
ClockClicks = new Date();ct_K = ClockClicks.getTime();nas_capt = "Key";
//alert(key);
	switch(key) {
case 13 :       nas_Lap_Reset(); break;//enter
case 27 :       nas_Clear_LAP(); break;//esc
case 32 :       nas_Start_Stop(); break;//space
case 49 :       nas_ChangeRATE("RT"); break;//1
case 50 :       nas_ChangeRATE("24FPS"); break;//2
case 51 :       nas_ChangeRATE("30NDF"); break;//3
case 52 :       nas_ChangeRATE("30DF"); break;//4
case 53 :       nas_ChangeRATE("25FPS"); break;//5
case 65 :       about_nas(); break;//a
case 76 :       nas_write_Log(); break;//l
//	case 84 :       nas_ChangeMODE(); break;//T
default :       return false
	}
//
return false;
}
}
//	end proc
function nas_Mouse(Bt,Ob) {
ClockClicks = new Date();ct_M = ClockClicks.getTime();nas_capt = "Mouse"
//IEのとき event.button event.srcElement と入れ換える
if( navigator.appName == "Microsoft Internet Explorer" ) { Ob = event.srcElement ;Bt = event.button ;
// for IE
switch(Ob.type) {
case "text":	;
case "":	;
case "button":	m_action = false ;break ;
default:	
if (Ob.id=="baseBody"){m_action = true;}else{m_action = false;};
}
 } else {
// for NN
if( Ob == "[object HTMLFormElement]" || Ob.id == "baseBody" ) {m_action = true} else {m_action = false}
}

if( m_action) {
	switch(Bt) {
case 4: ;
case 2: ;
case 3:	nas_Lap_Reset(); break;
default:nas_Start_Stop()
	}
} else {
if (true){
	switch(Ob.id){
case "start":nas_Start_Stop();break;
case "lap":nas_Lap_Reset();break;
	}
}
return false }
}
//	end proc
/*	汎用のアクションキャプチャ
 呼び出しタイムラグを最少にする必要のある場合は、以下の書式でこの関数を呼び出します。
	nas_Capt("機能名称") 
 必要な引数は、受け渡し用の変数を別に立てて あらかじめ値を入力する必要あり。
 (ただし今のところべつになし)
 ここにある時間関連コマンド以外の関数は、直接呼び出す。
*/
function nas_Capt(Action_Name){
ClockClicks = new Date();ct_O = ClockClicks.getTime();nas_capt = "Object";
CaptureAction = Action_Name ;

	switch(Action_Name) {
case "Lap_Reset"	: nas_Lap_Reset(); break;
case "Clear_LAP"	: nas_Clear_LAP(); break;
case "Start_Stop"	: nas_Start_Stop(); break;
default	: return false
	} 
}
// end function

//ログの表示　別ウィンドウを開いて書き出す。
function nas_write_Log(){
	LW1=window.open("","LW","width=320");
	LW1.document.open();
	LW1.document.write("<HTML><HEAD><TITLE>StopWatch-Log</TITLE></HEAD><BODY>");
	LW1.document.write("<PRE>");
	for(var l=0; l<Log.length;l ++){LW1.document.write(Log[l]+"\n")}
	LW1.document.write("</PRE>");
	LW1.document.write("</BODY></HTML>");
//LW1.document.write();
//LW1.document.write();
LW1.document.close();
}

//	end proc
//############### ABOUT Display
function about_nas(){
alert("Nekomataya Animation System \(Unsupported\) \nStopWatch "+ VER + "\n"+ upDate +"\n http://www.nekomataya.info/")
}
/*
ストップウオッチフォームが読み込まれた直後に呼び出されて、
ストップウオッチを最終的に開始させる関数。
フォーム上のカスタム変数の読み込み(オーバーライド)および
表示インターバルの開始
明示的な終了手続きは特になし。
*/
function nas_Action_Startup() {

		document.getElementById("status").innerHTML = "startup";

//	if( navigator.appName == "Netscape" ) {document.captureEvents( Event.MOUSEDOUN )}
//フォーム上のカスタム変数を読み取る

		pastrate = RATE; 	//新レートを設定する前に元のレートを退避
		nas_ChangeRATE( document.getElementById("frameRATE").value);
	MaxLap = document.getElementById("MaxLap").value;

//	MODE=document.getElementById("MODE").value;
//	nas_ChangeMODE();

//	再初期化終了・動作開始
	nas_cc2dp();
	nas_Clear_LAP();
	document.getElementById("status").innerHTML = "stop";
	m_action = true;
	CaptureAction = "";
//	表示インターバル開始
		Action = setInterval("nas_update_View()",10);
document.getElementById("nas_display").blur();

//	お後がよろしいようで
}
// プログラムおしまい　とっぴんぱらりのぷぅ
/*

*/
var flipShown = false;

var animation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, element:null, timer:null};

function mouseDown(event, id) {
if( navigator.appName != "Microsoft Internet Explorer" )
	{
	event.target.src = "images/"+id+"_down.png";
	}else{
	event.srcElement.src = "images/"+id+"_down.gif";
	}
//	event.stopPropagation();
//	event.preventDefault();
}

function mouseUp (event, id) {
//	if (hiliteOp)
//		setOpHilite();
//	else
if( navigator.appName != "Microsoft Internet Explorer" )
	{
		event.target.src = "images/"+id+".png";
	}else{
		event.srcElement.src = "images/"+id+".gif";
	}
}

function mouseOut (event, id) {
//	if (!hiliteOp)
//		event.target.src = "images/"+id+".png";
}

//  Returns val if min < val < max
//  Returns min if val <= min
//  Returns max if val >= max

function limit_3 (val, min, max)
{
    return val < min ? min : (val > max ? max : val);
}

function computeNextFloat (from, to, ease)
{
    return from + (to - from) * ease;
}


function animate()
{
	var T;
	var ease;
	var time = (new Date).getTime();
		
	
	T = limit_3(time-animation.starttime, 0, animation.duration);
	
	if (T >= animation.duration)
	{
		clearInterval (animation.timer);
		animation.timer = null;
		animation.now = animation.to;
	}
	else
	{
		ease = 0.5 - (0.5 * Math.cos(Math.PI * T / animation.duration));
		animation.now = computeNextFloat (animation.from, animation.to, ease);
	}
	
	animation.element.style.opacity = animation.now;
}

function mousemove (event)
{
	if (!flipShown)
	{
		// fade in the flip widget
		if (animation.timer != null)
		{
			clearInterval (animation.timer);
			animation.timer  = null;
		}
		
		var starttime = (new Date).getTime() - 13; // set it back one frame
		
		animation.duration = 500;
		animation.starttime = starttime;
		animation.element = document.getElementById ('flip');
		animation.timer = setInterval ("animate();", 13);
		animation.from = animation.now;
		animation.to = 1.0;
		animate();
		flipShown = true;
	}
}

function mouseexit (event)
{
	if (flipShown)
	{
		// fade in the flip widget
		if (animation.timer != null)
		{
			clearInterval (animation.timer);
			animation.timer  = null;
		}
		
		var starttime = (new Date).getTime() - 13; // set it back one frame
		
		animation.duration = 500;
		animation.starttime = starttime;
		animation.element = document.getElementById ('flip');
		animation.timer = setInterval ("animate();", 13);
		animation.from = animation.now;
		animation.to = 0.0;
		animate();
		flipShown = false;
	}
}
function onshow () {
//	if (timerInterval == null) {startSecondHandTimer();}
//	updateTime(false);
//flipShown=true;mouseexit
//document.getElementById("flip").style.display="none";
}

function onhide () {
exitflip();
//	if (timerInterval != null) { we were hidden clear the hands
//		clearHands();
		
		// clear the timer
//		clearInterval(timerInterval);
//		timerInterval = null;
//	}
}
function showbackside(event)
{
	var front = document.getElementById("front");
	var back = document.getElementById("behind");
	
	if (window.widget)
		widget.prepareForTransition("ToBack");
	onhide();
	
	front.style.display="none";
	back.style.display="block";
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);	


	document.getElementById('fliprollie').style.display = 'none';
}


function doneClicked() {
        var front = document.getElementById("front");
        var back = document.getElementById("behind");

        if (window.widget)
                widget.prepareForTransition("ToFront");


        front.style.display="block";
        back.style.display="none";

        setTimeout ('flipitback();', 0);
        onshow();

}


function flipitback()
{
//	updateTime(false);
	if (window.widget)
		setTimeout("widget.performTransition();", 0);
}


if (window.widget) {
	data = widget.preferenceForKey("locale");
	widget.onhide = onhide;
	widget.onshow = onshow;
}


function enterflip(event)
{
//	document.getElementById('fliprollie').style.display = 'block';
	document.getElementById('flip').style.background = 'url(images/flip.gif) no-repeat top left';
}

function exitflip(event)
{
//	document.getElementById('fliprollie').style.display = 'none';
	document.getElementById('flip').style.background = 'url(images/white_i.gif) no-repeat top left';
}



function place(index,geom){
//表示用解像度を算出 基本画像幅(px)をクリッピングエリアの幅(in)で割って(ppi)を出す
	var dummyResolution	= Math.floor(
		96 * mySB.convert.drawWidthPx /
		nas.decodeUnit(
			document.getElementById("clipFrame").style.width,
			"px"
		)
	);
//表示基準値
	mySB.convert.drawHeightPx = Math.round(mySB.convert.drawWidthPx / mySB.convert.frameAspect);

//
	if(! geom){geom=new Geometry();}
	if((! mySB.table[index])||(! mySB.table[index].img.image)) return index;
/*
//各サイズをインチで得る(正比率・基準密度)
	var myWidth  = ((geom.scale[0]*mySB.table[index].img.image.width) /dummyResolution);
	var myHeight = ((geom.scale[1]*mySB.table[index].img.image.height)/dummyResolution);
	var myLeftMargin =(geom.scale[0]*(-geom.offset[0]+geom.position[0])+(nas.decodeUnit(document.getElementById("clipFrame").style.width ,"px")/2)-(myWidth *48))+"pt";
	var myTopMargin  =(geom.scale[1]*( geom.offset[1]-geom.position[1])+(nas.decodeUnit(document.getElementById("clipFrame").style.height,"px")/2)-(myHeight*48))+"pt";

	var myLeftMargin =(geom.scale[0]*(-geom.offset[0]+geom.position[0])+(nas.decodeUnit(document.getElementById("clipFrame").style.width ,"px")/2)-(myWidth *48))+"pt";
	var myTopMargin  =(geom.scale[1]*( geom.offset[1]-geom.position[1])+(nas.decodeUnit(document.getElementById("clipFrame").style.height,"px")/2)-(myHeight*48))+"pt";
	if(document.getElementById("mainScreen").src != mySB.table[index].img.image.src){
		document.getElementById("mainScreen").src=mySB.table[index].img.image.src;
	}
	if(document.getElementById("mainScreen").style.width!=(myWidth+"in")){
		document.getElementById("mainScreen").style.width=(myWidth+"in");
	}
	if(document.getElementById("mainScreen").style.height!=(myHeight+"in")){
		document.getElementById("mainScreen").style.height=(myHeight+"in");
	}
	if(document.getElementById("mainScreen").style.marginLeft!=myLeftMargin){
		document.getElementById("mainScreen").style.marginLeft=myLeftMargin;
	}
	if(document.getElementById("mainScreen").style.marginTop!=myTopMargin){
		document.getElementById("mainScreen").style.marginTop=myTopMargin;
	}
// */
	if((mySB.table[index].img.image.width/mySB.table[index].img.image.height) >= mySB.convert.frameAspect){
//横長(=横マッチ)
		var myWidth  =  mySB.convert.drawWidthPx / dummyResolution;// as in
		
		var myHeight = mySB.convert.drawWidthPx * (
			mySB.table[index].img.image.height / mySB.table[index].img.image.width
		)/ dummyResolution;// as in
//		var myLeftMargin = 0;
//		var myTopMargin  = (mySB.convert.drawHeightPx - myHeight) /2 ;
	}else{
//縦長(=縦マッチ)
		var myHeight = mySB.convert.drawHeightPx / dummyResolution;// as in
		var myWidth  = (
			mySB.convert.drawHeightPx * mySB.table[index].img.image.width
		)/mySB.table[index].img.image.height / dummyResolution;// as in
//		var myLeftMargin = (mySB.convert.drawWidthPx - myWidth) /2 ;
//		var myTopMargin  = 0;
	};
//センタリング
	var myLeftMargin =(geom.scale[0]*(-geom.offset[0]+geom.position[0])+(nas.decodeUnit(document.getElementById("clipFrame").style.width ,"px")/2)-(myWidth *48))+"px";
	var myTopMargin  =(geom.scale[1]*( geom.offset[1]-geom.position[1])+(nas.decodeUnit(document.getElementById("clipFrame").style.height,"px")/2)-(myHeight*48))+"px";

	if(document.getElementById("mainScreen").src != mySB.table[index].img.image.src){
		document.getElementById("mainScreen").src=mySB.table[index].img.image.src;
	}
	if(document.getElementById("mainScreen").style.width!=(myWidth+"in")){
		document.getElementById("mainScreen").style.width=(myWidth+"in");
	}
	if(document.getElementById("mainScreen").style.height!=(myHeight+"in")){
		document.getElementById("mainScreen").style.height=(myHeight+"in");
	}
	if(document.getElementById("mainScreen").style.marginLeft!=myLeftMargin){
		document.getElementById("mainScreen").style.marginLeft=myLeftMargin;
	}
	if(document.getElementById("mainScreen").style.marginTop!=myTopMargin){
		document.getElementById("mainScreen").style.marginTop=myTopMargin;
	}

if(document.getElementById("contentField").style.display!="none"){
		var myContentBody=replaceStr(mySB.table[index].desc).replace(/&lt;break&gt;/g,"");//あとで置換関数を調整
		if(document.getElementById("contentField").innerHTML!=myContentBody){document.getElementById("contentField").innerHTML=myContentBody;};
	}

if(document.getElementById("dialogField").style.display!="none"){
		var myContentBody=replaceStr(mySB.table[index].words).replace(/&lt;break&gt;/g,"");//あとで置換関数を調整
		if(document.getElementById("dialogField").innerHTML!=myContentBody){document.getElementById("dialogField").innerHTML=myContentBody;};
	}
return index;
}
/*
	タイマーはキュー列を処理する
	キュー列は キューオブジェクトのコレクションである。
	キューオブジェクトは、
		キューするカラムオブジェクト
		キュージオメトリオブジェクト
		キュー継続時間
	をもつ
	タイマーは、キューオブジェクトを表示して開始フレームに継続フレームを加えた終了フレームをセットする
	タイマーは、終了フレームを待つ
	経過時間が終了フレームを超過したら次のキューをキュー列に要求する
	キュー列は投入時間の関数の戻り値としてキューオブジェクトを返す
	処理時間が超過した場合は、キューが投入されないこともあり得るが、経過時間優先で処理する。
*/
function CutQueueColection(myParent,myInPoint,myDuration,myName)
{
	this.parent=myParent;
	this.inPoint=myInPoint;
	this.duration=myDuration;
	this.name=myName;

	this.casts=new Array();//カラムを入れる
	this.cameraworks=new Array();//カラムから抽出したカメラワークを格納

	this.dialogs=new Array();
	this.soundEffects=new Array();
	this.musics=new Array();
}
/*
	やはりあとのことを考えて階層化しておく
	あとで階層化をするのはたぶん愚の骨頂
*/
function PictureQueue(myParent,myInPoint,myDuration,myColumn,myGeometry)
{
	this.parent	=myParent;//親queueコレクション(一般にはCUT)
	this.duration	=myDuration;//継続時間(フレーム数)
	this.inPoint	=myInPoint;//in点

	this.column	=myColumn;//カラムオブジェクト
	this.geometry	=myGeometry;//配置情報(ジオメトリオブジェクト)
//画像トラック専用キューのコンストラクタ
}

function SoundQueue(myParent,myInPoint,myDuration,myLabel,myText,myGeometry)
{
	this.parent	=myParent;//親queueコレクション
	this.duration	=myDuration;//継続時間(フレーム数)
	this.inPoint	=myInPoint;//in点

	this.label	="SOUND";//ラベルテキスト
		this.label.geometry	=new Geometry();//ラベルテキスト配置

	this.text	=myColumn;//contentText
//このキューは音声トラック専用キュー 音声トラックは断続トラックである
}
function EffectQueue(myParent,myInPoint,myDuration,myLabel,myText,myGeometry)
{
	this.parent	=myParent;//親queueコレクション
	this.duration	=myDuration;//継続時間(フレーム数)
	this.inPoint	=myInPoint;//in点

	this.label	=ラベルテキスト
		this.label.geometry	=new Geometry();//ラベルテキスト配置

	this.content	="normal";//エフェクトオブジェクトを配置(予定)
//このキューはエフェクトトラック専用キュー エフェクトトラックは連続トラックである
//指定のないエフェクトは[Normal]として処理される。
}
/*
	このアプリケーションの手法として
	ねこらSBオブジェクトではなく　重乗する形で同オブジェクトにカットコレクションを加えて
	SBパース時点でカラムに追加情報を乗せるべき
*/
function makeQueue(myStoryBoard)
{
//キュートレーラ配列を作成
	var queueBox=new Array();
//		queueBox.sourceSB=myStoryBoard;
		queueBox.duration=0;//0で初期化
		queueBox.queueRate=8;//キュー処理速度fpsストーリーボードの速度とは別
		queueBox.queuePool=new Array();//表示プール(idの配列)
		queueBox.inPool=function(myIndex){
		//これはqueuePoolに指定のIndexが存在するか否かの判定メソッド
			if(this.queuePool.length==0){return false;}
			var myResult=false;
			for(var qpid=(this.queuePool.length-1);qpid>=0;qpid--){
				if(myIndex==this.queuePool[qpid]){myResult=true;break;}
			};
			return myResult;
		}
		queueBox.checkQP=function(currentTime){
			var nextQP=new Array();
			for(var qpIdx=0;qpIdx<this.queuePool.length;qpIdx++){
				var myQueue=this[this.queuePool[qpIdx]];
				if((myQueue.inPoint+myQueue.duration)<=currentTime){
//表示終了処理
					continue;
				}
			//	if(myQueue.option=="column"){;};//仮メソッド
				switch(myQueue.option){
case	"column":
	place(myQueue.column.index,myQueue.geometry);
break;
case	"cut":
if(document.getElementById(myQueue.Element).style.display!="none"){
	var myContent="C# "+nas.Zf(myQueue.column.cut,3)+"( "+nas.Frm2FCT(myQueue.duration,3)+")";
	if(document.getElementById(myQueue.Element).innerHTML!=myContent){document.getElementById(myQueue.Element).innerHTML=myContent};
}
break;
case	"effect":;
break;
case	"dialog":;
break;
				}
				nextQP.push(this.queuePool[qpIdx]);
			}
			this.queuePool=nextQP;
		}
		queueBox.getQueue=function(myFrames){
			var myResult=new Array();
			for(var idx=0;idx<this.length;idx++){
				var currentOutPoint=this[idx].inPoint+this[idx].duration;//チェックエントリのoutPoint
/*	イン点・アウト点を検査して対象外エントリをスキップ	*/
				if(currentOutPoint<=myFrames){continue;};//エントリ不要
				if(this[idx].inPoint>myFrames){break;};//これ以降はチェック不要(まだキューしない)
				myResult.push(this[idx]);
			}
			return myResult;//キュー列から複数の当該キュー
		}
//sbdからキューへ変換

/*
	カラム内に記述可能なエフェクトおよびカメラワーク
	トランジション
最大で 前+後=2 (うち後方トランジションは保留して次カットと照合するので実質 1)
ライカ上では、タグを表示する形で反映
	エフェクト
最低 1 上限値 なし エフェクトオブジェクトを作ってエフェクトトレーラで対応 カットに対して発行する。
ライカ上では、タグを表示する形で反映
	カメラワーク
最低 1 上限値 なし カメラワークオブジェクトを作って カメラワークトレーラで対応する
	ダイアログ・サウンド
最低 0 上限値 なし サウンドオブジェクトを作成して サウンドトレーラーで対応する キューに対して発行する。

実際の表示にマッチさせる為にキュートラックはレイヤ数分だけ準備する

 画像(ピクチャ)レイヤ (カメラワークはここに影響)
	画像補助レイヤ(TAG用 回転等対応出来ないカメラワークをタグ表示する為)キューはひとつで対応
 エフェクトレイヤ (TAG表示)	<span>
 サウンドレイヤ (TAG表示)	<span>
 トランジションレイヤ? (別queueにする為に作成)

以上 キューライン X4 で各キューラインには内部トラックを設定可能にしておく

キューするエレメント(セル)のデータクラスは最低限以下のプロパティをもつ

	キュータイミング(親トレーラの基点からのオフセットフレーム数で 正負・整数) 初期値 0
	継続時間(フレーム数で 切り上げ 正の整数) 初期化時のデフォルト値は初期化時点での1秒
	ラベル 最低限の表示能力しか持たないプラットフォームのためのラベル

	コンテンツは、画像・音声・エフェクト等なんでも

*/

//カットオブジェクトは ストーリーボードパース時に作成済
//カットコレクションごとにキューを取得

	for(var cIdx=0;cIdx<myStoryBoard.cuts.length;cIdx++){
//カット番号とカット尺を取得(カットキュー)
		queueBox.push(new Queue(	queueBox,
						"cut",
						myStoryBoard.cuts[cIdx].columns[0],
						myStoryBoard.cuts[cIdx].length,
						new Geometry(),
						myStoryBoard.cuts[cIdx].inPoint));
		queueBox[(queueBox.length-1)].Element="playCutNo";
//カラムキュー(画像およびcontentsText)
		for(var coIdx=0;coIdx<myStoryBoard.cuts[cIdx].columns.length;coIdx++){
			var myColumn=myStoryBoard.cuts[cIdx].columns[coIdx];
			var myDuration=myStoryBoard.cuts[cIdx].length/myStoryBoard.cuts[cIdx].columns.length;
			var myGeometry=new Geometry();//暫定中央ジオメトリの必要なオブジェクトは自己生成?
//			var myInPoint=myStoryBoard.cuts[cIdx].inPoint+
			var myInPoint=queueBox.duration;
//カラム本体をキューへ追加
			queueBox.push(new Queue(	queueBox,
							"column",
							myColumn,
							myDuration,
							myGeometry,
							myInPoint));
			queueBox.duration+=myDuration;
//カラム内のオブジェクトを解析してキューへ追加

		}
//ループ終了
	}
	return queueBox;
}

//キューオブジェクトコンストラクタ(簡易再生用仮オブジェクト)
function Queue(myParent,myOption,myColumn,myDuration,myGeometry,myInPoint){
	this.index=myParent.length;
	this.parent=myParent;
	this.option=myOption;//キュー種別指定オプション
	this.column=myColumn;//カットの場合は先頭カラム
	this.duration=myDuration;
	this.geometry=myGeometry;
	this.inPoint=myInPoint;
	this.outPoint=myInPoint+myDuration;
/*
	キュー種別は整数値で列挙値を使用?
	Cut.Name
	Cut.Time
	Cut.columuns

		Column.Picture
		Column.ContentText
		Column.Time

		Column.dialogs.
			Dialog.label
			Dialog.contentText
			Dialog.Body
			Dialig.inPoint
			Dialog.duration
			Dialog.keys
		Column.effects.
			Effect.label
			Effect.contentText
			Effect.Body
			Effect.inPoint
			Effect.duration
			Effect.keys
		Column.camerawork
			Camerawork.label
			Camerawork.contentText
			Camerawork.Body
			Camerawork.inPoint
			Camerawork.duration
			Camerawork.keys
*/
//	親キューに表示プールを作成してそこにキューを流し込む
	this.displayIndex=null;//表示プール配列ID これは不要か?
	this.Element=null;//表示用HTML-ElementID
}

