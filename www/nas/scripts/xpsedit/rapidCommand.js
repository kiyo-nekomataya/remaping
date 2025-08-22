/**
 *	XpsEdit ラピッドモード設定ファイル
 */
'use strict';
//サンプル全機能セット
/*
xUI.rapidMode=[
	"+","incrSpin",
	"-","decrSpin",
	"/","nop",
	"*","loop",
	".","back",
	"i","incr",
	"d","decr",
	"a","spinAdd",
	"s","spinSub",
	"k","pgUp",
	"j","pgDn",
	"o","ok",
	"n","ng",
	"y","redo",
	"z","undo",
	"m","fwd",
	"h","home",
	"e","end",
	"p","paren",
	"b","brac",
"end"];// */

//おすすめセットのようによく使いそうな機能を選んで絞った方が動作が軽快になります。
//設定は可能ですが、数字をショートカットにはしない方が良いでしょう…当たり前ですけど
//おすすめセットのコメント記号をはずして各自で書き換えてご使用ください。

//	おすすめ1号セット
/*
xUI.rapidMode=[
	"+","incr",
	"-","decr",
	"/","nop",
	"*","loop",
	".","undo",
"end"];//*/

//	おすすめ2号セット
/*
xUI.rapidMode=[
	"+","incrSpin",
	"-","decrSpin",
	"/","spinAdd",
	"*","spinSub",
	".","back",
"end"];//*/
//	STS互換+モード

xUI.rapidMode=[
	"n","nop",
	"+","incrSpin",
	"-","decrSpin",
	"/","spinSub",
	"*","spinAdd",
	"x","spinSub",
	"z","spinAdd",
	"s","spinSub",
	"a","spinAdd",
	".","back",
	"q","exit",
"end"];//*/
/**************************************************************************
 *	機能名は以下のリストから選択。
 *	他の機能案があれば「ねこまたや」へどうぞ。
 *
 *	nop         //何もしない (モードに入るだけ)
 *	incr        //増
 *	decr        //減
 *	incrSpin    //増+スピン
 *	decrSpin    //減+スピン
 *	fwd         //スピン
 *	back        //バックスピン
 *	loop        //スピン値ループ
 *	spinAdd     //スピン値増
 *	spinSub     //スピン値減
 *	undo        //アンドウ
 *	redo        //リドウ
 *	ok          //[enter]と同じ あまり使い道無いです
 *	ng          //[esc]と同じ 上に同じ
 *	home        //[home] シート先頭へ移動
 *	end         //[end]シート末尾へ移動
 *	pgUp        //[page-up]	1秒戻る
 *	pgDn        //[page-dpwn]	1秒進む
 *	paren       //数字エントリを括弧で囲む
 *	brac        //エントリを角括弧で囲む
 */
//ラピッドコマンドテーブル
//	登録機能は固定
xUI.rapidMode.command=new Object();
xUI.rapidMode.command["nop"]      = function(){syncInput("");}	        ;//何もしない (モードに入るだけ)
xUI.rapidMode.command["incr"]     = function(){xUI.dialogSpin("incr");} ;//増
xUI.rapidMode.command["decr"]     = function(){xUI.dialogSpin("decr");} ;//減
xUI.rapidMode.command["incrSpin"] = function(){xUI.dialogSpin("incrS");};//増+スピン
xUI.rapidMode.command["decrSpin"] = function(){xUI.dialogSpin("decrS");};//減+スピン
xUI.rapidMode.command["fwd"]      = function(){xUI.spin("fwd");}        ;//スピン
xUI.rapidMode.command["back"]     = function(){xUI.spin("back");}       ;//バックスピン
xUI.rapidMode.command["loop"]     = function(){xUI.spin("v_loop");}     ;//スピン値ループ
xUI.rapidMode.command["spinAdd"]  = function(){xUI.spin("v_up");}       ;//スピン値増
xUI.rapidMode.command["spinSub"]  = function(){xUI.spin("v_dn");}       ;//スピン値減
xUI.rapidMode.command["undo"]     = function(){xUI.undo();}             ;//アンドウ
xUI.rapidMode.command["redo"]     = function(){xUI.redo();}             ;//リドウ
xUI.rapidMode.command["ok"]       = function(){
	if (xUI.edchg) xUI.shhetPut(xUI.eddt);//更新
	xUI.spin("fwd");
}	;//確定
xUI.rapidMode.command["ng"]       = function(){
	if(xUI.edchg) xUI.edChg(false);
	syncInput(xUI.bkup());
}	;//取り消し
xUI.rapidMode.command["home"]     = function(){xUI.selectCell(xUI.Select[0]+"_0");}	;//
xUI.rapidMode.command["end"]      = function(){xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());}	;//
xUI.rapidMode.command["pgUp"]     = function(){xUI.spin("pgup");}	;//
xUI.rapidMode.command["pgDn"]     = function(){xUI.spin("pgdn");}	;//
xUI.rapidMode.command["paren"]    = function(){
	var EXword="(#)";
//# を、現在の値の数値部分と置換
		if(xUI.bkup().toString().match(/(\D*)([0-9]+)(.*)/)){
			var prefix=RegExp.$1;var num=RegExp.$2;var postfix=RegExp.$3;
			EXword=EXword.replace(/\#/,num);
			EXword=prefix+EXword+postfix;
		}
	syncInput(EXword);
	;}	;//
xUI.rapidMode.command["brac"]     = function(){
	var EXword="[*]";
//* を、現在の値と置換
	EXword=EXword.replace(/\*/,xUI.bkup().toString());
	syncInput(EXword);
;}	;//
//モード解除
xUI.rapidMode.command["exit"]     = function(){
		xUI.eXMode=0;	xUI.eXCode=0;
		xUI.selectedColor=xUI.inputModeColor.NORMAL;
		xUI.spinAreaColor=xUI.inputModeColor.NORMALspin;
		xUI.spinAreaColorSelect=xUI.inputModeColor.NORMALselection;
		xUI.spinHi();
		return true;
}
