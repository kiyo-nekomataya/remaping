/**************************************************************************
 *	////// りまぴん ユーザ設定ファイル //////
 *	新規作成時の標準値になります。
 *	説明を読んでお好きな値に書き換えて下さい。
 *	一部の情報は、クッキーで保存可能(予定)です。
 *		2005/04/06
 *		2005/04/28	デバッグフラグ追加(そのうちなくなるかもね)
 *		2005/08/09	クッキー調整
 *		2005/08/25	cssに合わせて背景色を追加
 *		2005/09/01	クッキー内容追加
 *		2005/09/04	クッキー内容追加/修正
 *		2005/10/17	タイトル装飾追加
 *		2005/12/11	読み込み時データシフトスイッチの動作を変更
 *		2006/02/03	暫定的にサービスURLを設定
 *		2006/04/09	ラピッドモードを増設
 *		2007/06/14	フレームインターフェース廃止
 *		2007/06/16	トランクにブランチのバグフィックスを反映
 *		2007/07/04	仮モードとしてStageを増設
 *		2007/10/12	Stageを一旦削除
 *		2007/10/15	Ver 1.2 用に内容を調整
 *		2007/11/06	メモ編集用単語を登録
 *		2010/09/13	AIR対応版
 *		2013/02/18	試験中
 *		2013/04/08	jquery導入  他アプリケーションのデータ読み書きをソース分離
 *		2013/04/25	カメラワーク及びSFX用記述欄の拡張開始
 *		2014/12/	CEP拡張を開始  コンパクト表示モード作成
 *		2015/04/	IG関連で開発用リソース
 *		2015/10/17	クッキーの記録内容に編集モードを追加
 *		2016/01/27  クッキーの記録内容にUIツールの表示状態を追加
 *      2016/08/12  WEBサービス開始のための改装
 *      2017/03/03  画像部品キャッシュ・書き換えの高速化
 *      2017/05/06  高速化＋デバッグ　バックグラウンド更新の準備
 *      2017/06/15  スタートアップ時のバグを修正
 *      2020/03/14  ラピッドモード調整　STS互換キーセット試験
 *      2020/10/03  ラピッドキーに "a,s}を追加(add,sub) exitコマンドを追加して"q"にマップ
 *                  エスケープキーでモード解除
 *      2022/09/29  UI設定機能を新機能に更新
 *      2025/06/02  XPSフォーマット改訂画像サポート正式版（ベータ）
 * $Id: config.js,v2.0 2022/09/29  $
 */
	var dbg=false	;	//デバッグモード
	var config = {}
/** @desc
 *	開始メッセージ
 *		お好きなメッセージに入れ替えできます。
 *		ただし開始メッセージが抑制されている場合は表示されません。
 */

	var welcomeMsg="画像編集機能調整版- 20250603";
	var windowTitle="ver. 1.9.4";//WindowTitleとしての役割は終了 統合バージョンです

/**************************************************************************
 *	ロゴ等
 *		ページのロゴは各会社のロゴや作品タイトルと入れ換えることが
 *		できます。
 *		その方が作業していて気分がよいですよね。
 *		タグもかけます。画像の場合は、タグ必須
 */

/*
	var headerLogo="<b>りまぴん</b>";
	var headerLogo="<img src='images/logo/black.gif' alt='Nekomataya' width=150 height=30 border=0 />";
	var headerLogo="<img src='//www.nekomataya.info/cgi-bin/garden.cgi?SET=test-logo' alt='Nekomataya' width=150 height=24 border=0 />";
 */
	var headerLogo="<img src='/images/logo/UATimesheet.png' alt='UATimesheet' width=141 height=24 border=0 />";

/*
	var headerLogo_url	="./help/index.html";試験中
    ロゴをクリックするとこちらのurlをひらきます。
 */
//	var headerLogo_url	="http://www.nekomataya.info/remaping/";
	var headerLogo_url	="https://docs.google.com/document/d/14XIjRraSci35fLcZdCtrwIJ7G1Z13Wku5e1hzu1QOCc/edit?usp=sharing";
	var headerLogo_urlComment	="UATimesheet簡易マニュアル";//ロゴのコメントです
/**************************************************************************
 *	作品タイトルロゴ
 *		タイトル置換機能を使う場合は、useworkTitleの値を"true"にして、
 *		下のリストを編集してください。使わない場合は"false"に
 *		リストの書式は以下。
 *		角括弧内は省略可能です。コンマは省略できません。
 *
 *  タイトル,[画像ファイル(URL)],[ALTテキスト],[リンクURL],[コメントテキスト]
 *  こちらのタイトルは運用後にタイトルDBと換装の予定なのでデータ構造を調整すること
タイトルDBはこちらを使用しないように変更中
タイトルDBは別のオブジェクトに移行予定　2017 02 03
 */
	var useworkTitle=false;

	var workTitles=[
"タイトル","","title","//www.example.com","commentText",
"かちかちやま",'',"かちかちやま","./help/katikati.html","公式サイト(のつもり)",
"かちかち山Max",'',"ALTTxt","linkURI","commentText"
];

/**************************************************************************
 *	ユーザインターフェースカラー
 *
 *	このエリアを編集してタイムシートのカラーを変更できます。
 *	お好きな色合いに変更してください。
 *	リクエストがある様なら編集インターフェースがつくかもしれません。

//タイムシート背景色(どれか選択または「お好きな値」に)
//	SheetBaseColor	="#ffdffe"	;//アカムラサキ
//	SheetBaseColor	="#fdeefd"	;//ドドメイロ
	SheetBaseColor	="#efffef"	;//わかくさ
//	SheetBaseColor	="#ffffef"	;//びわ
//	SheetBaseColor	="#edd3a1"	;//浅黄
//	SheetBaseColor	="#b68d4c"	;//きつるばみ
//	SheetBaseColor	="#fef4f4"	;//さくら
//	SheetBaseColor	="#f5b199"  ;//一斤染
//	SheetBaseColor	="#cfcfd6"	;//銀鼠
//	SheetBaseColor	="#efefef"	;//白鼠
//	SheetBaseColor	="#f8f8f8"	;//白練

//選択セルの背景色(通常)
	SelectedColor	="#ccccff"	;//青
//選択セルの背景色(拡張入力モード)
	RapidModeColor	="#ffccbb"	;//あか
//選択セルの背景色(ブロック移動モード)
	FloatModeColor	="#88eeee"	;//シアン
//選択セルの背景色(セクション編集モード)
	SectionModeColor="#ccffcc"	;//ミドリ
//区間色自体は背景色との演算で変化する
//スピン領域色??
	SpinAreaColor	="red"	;// これ参照してない スピンエリアは背景色と選択色の中間値を計算する
//選択領域の背景色
	SelectionColor	="#f8f8dd"	;//
//フットスタンプ/diff の色
	FootStampColor	="#fff8f8"	;//足跡機能を使用しない場合は無効

	EditingColor	="#eebbbb"	;//セル編集中のインジケータ
	SelectingColor	="#ccccaa"	;//セル選択中のインジケータ

//編集用区間ノード色
//	SectionNodeColor ="#ccffcc"	;//上に移行して削除


//スタイルシートで使用する単位を指定してください em,px,pt,...etc
	CellWidthUnit	="px";
//インターフェースのサイズ

	TimeGuideWidth	    =36; //時間表示
	ActionWidth         =20; //アクションシートの幅
	DialogWidth	        =36; //台詞欄の幅
	SheetCellWidth	    =42; //通常のセルの表示幅
	SheetCellNarrow	    =4;  //折りたたみ時のセルの表示幅
	StillCellWidth	    =12; //静止画欄の幅
    GeometryCellWidth   =52; //ジオメトリトラック幅
	SfxCellWidth	    =46; //効果指定欄の幅
	CameraCellWidth     =72; //カメラワーク指定欄の幅
	CommentWidth        =120;//コメント欄の幅
	ColumnSeparatorWidth=4;  //カラムセパレータの幅
*/
// ルック設定のオブジェクト化中
// 後からルックを変更する手続は　xUI.setSheetLook(SheetLooks);xUI.footstampPaint();
// 後方のペイント更新が重要
SheetLooks = {
  "FormatName"           : "remaping-old",
  "TemplateImage"        : "/remaping/documentFormat/timesheet/default.png",
  "ExportResolution"     : "200ppi",
  "DocumentSize"         : "A3",
  "HeaderMarginTop"    : 36,
  "HeaderMarginLeft"   : 50,
  "HeaderBoxHeight"    : 65,
  "headerItemOrder" :[
        ["title" , 350],
        ["ep"    , 110],
        ["sci"   , 160],
        ["time"  , 160],
        ["user"  , 130],
        ["page"  , 120]
  ],
  "HeaderSign"         : [28,100,1000,140],
  "HeaderNote"         : [28,140,1000,256],
  "WorkTitleLogo"        : "",
  "SheetTextColor"       : "#111111",
  "SheetBaseColor"       : "#faf2f2",
  "AppBaseColor"         : "#ffffef",
  "SelectedColor"        : "#9999ff",
  "RapidModeColor"       : "#ffff44",
  "FloatModeColor"       : "#88eeee",
  "SectionModeColor"     : "#ff44ff",
  "SelectionColor"       : "#f8f8dd",
  "FootStampColor"       : "#ffffff",
  "EditingColor"         : "#eebbbb",
  "SelectingColor"       : "#ccccaa",
  "Restriction"          : false,
  "ViewMode"             : "page",
  "PageLength"           : "6+0",
  "FrameRate"            : "24fps(24)",
  "SheetColumn"          : 2,
  "CellWidthUnit"        : "px",
  "SheetHeadMargin"      : 383,
  "SheetLeftMargin"      : 30,
  "SheetLabelHeight"    : 16,
  "SheetCellHeight"      : 14.04,
  "SheetColHeight"       : 1095.64,
  "TimeGuideWidth"       : 55,
  "ActionWidth"          : 19.8,
  "DialogWidth"          : 43,
  "SoundWidth"           : 36,
  "SheetCellWidth"       : 42.4,
  "SheetCellNarrow"      : 4,
  "StillCellWidth"       : 12,
  "GeometryCellWidth"    : 52,
  "SfxCellWidth"         : 46,
  "CameraCellWidth"      : 32,
  "CommentWidth"         : 112,
  "TrackNoteWidth"       : 30,
  "ColumnSeparatorWidth" : 13.42,
  "trackSpec": [
        ["timecode"   ,1,"fix"],
        ["reference"  ,5,"fix"],
        ["dialog"     ,1,"fix"],
        ["replacement",5,""],
        ["comment"    ,1,""]
  ]
};
//メモ編集時の単語一覧

//使用したい単語を1列分ずつ配列で登録
//数値は文字列として扱われます
//一列八段までを推奨
var myWords	=[
    ["↖","←","↙","⇄",""],
    ["↑","◯","↓","⇅",""],
    ["↗","→","↘","〜",""],
	["◎","＊","○","●","□","■","◇","◆"],
	["△","▲","▽","▼","☆","★"],
	["パン ","チルト ","トラック ","クレーン ","アップ ","ダウン ","イン ","アウト "],
	["PAN ","Follow ","Slide ","mm/k","]X[","ゴンドラ","ブレ","画面動"],
	["つけPAN","TU","TB","中OL","FI","FO","ZOOM-IN","ZOOM-OUT"],
	["[A]","[B]","[C]","[D]","[E]","[F]","[G]","[]"],
	["(1)","(2)","(3)","(4)","(5)","(6)","(7)","()"],
	["兼用","透過光"," / ","回転","ローリング","特効","BOOK","BG"],
	["3D-CGI","撮影処理","ステージ","台","露出","パラ","",""],
	["%stage%:[%user% %date%]","[%user% %date%]","(%user% %date%)","<%user% %date%>","---<済 %user% %date%>---"]
];


//---ページ属性	*cookie[0]
//    SheetBaseColor ="#dfefef";
	SheetBaseColor	="#efffff"	;//test
//    PageProintSize ="";
/*	sheetAllWidth	="*"	;//
	sheetAllHeight	="*"	;//
	sheetHeadHeight	=64	;//
	sheetInfoWidth	=208	;//
*/

//---作業オプション	*cookie[1]
/*
    データハンドリングをサーバアクセス主体に変更になるので
    以下の初期プロパティは修正
    クッキーの保存も終了
*/
var myTitle=""	;
			//タイトル 現行の作品名を入れておくとラクです
/*
var mySubTitle=""	;
			//サブタイトル 同上
var myOpus=""	;
			//制作話数等
var myFrameRate="24fps";
			//初期フレームレートを置いてください。フレーム毎秒
var Sheet="6+0"	;
			//カット尺初期値初期タイムシートの長さをタイムコードで
var SoundColumns=1;
			//セリフ欄の数 初期値を整数で(必要に従って増やせる。最低で1つはルック維持のため予約)
var SheetLayers=8;
			//セル重ねの数 初期値を整数で A~D　ならば　4
var CameraworkColumns=3;
			//カメラワーク欄の数 初期値を整数で
var StageworkColumns=0;
			//ステージワーク欄の数 初期値を整数で
var SfxColumns=0;
			//カメラワーク欄の数 初期値を整数で
//--- */

var myScene=""	;
			//A.Bパート等  空白でも良い
var myCut=""	;
			//カット番号

var myFileName= "$TITLE#$OPUS[$SUBTITLE]_s$SCENE-c$CUT($TC)";
/*	デフォルトのファイル名 以下のワードはそれぞれのカットの値と置換されます
	$TITLE $OPUS $SUBTITLE $SCENE $CUT $TIME $TC

例  "$TITLE-$OPUS_$SCENE-$CUT($TC)" >"タイトル-10_APART-000(6 + 00 .)"
長すぎるファイル名は一部のシステムで不具合の原因となりますのでご注意ください。

*/

var myName = ""	;//---作業ユーザ名	*cookie[2]　ヌルストリングで初期化
var myNames = [myName]	;//---作業ユーザリスト	*cookie[2]　ユーザ名配列 

var NameCheck=true	;
/*
	// NameCheckを有効にすると起動時に名前を入力するプロンプトがでます。
	// 名前はクッキーで保存可能
    // データ形式は (ハンドル):(メールアドレス)
    // 例　ねこまたや:nekomataya@nekomataya.info
myNameプロパティをmyNames配列に変更、
この設定ファイルのパラメーターはデバッグ後に変更

*/
//////////////////////////////////////////////
//---キー変換オプション	*cookie[3]
var BlankMethod	="file";
			//カラセル方式デフォルト値
			//	"file",		カラセルファイル
			//	"opacity",	不透明度で処理
			//	"wipe",		ワイプで処理
			//	"expression1"	エクスプレッションで処理
			//	"expression2"	エクスプレッションで処理
			//	"expression3"	エクスプレッションで処理
			//
var BlankPosition	="end";
			//カラセル位置デフォルト値
			//	"build",	自動生成(現在無効)
			//	"first",	最初
			//	"end",		最後
			//	"none"		カラセルなし
var AEVersion	="8.0";
			//AEバージョン 4.0 5.0 6.5 7.0 8.0
	// AE に下位互換性があるので5.0をつかってください
var KEYMethod	="min";
			//AEキータイプ
			//	"min"	キーの数が最少
			//		(自分で停止にする必要がある)
			//	"opt"	最適化
			//		(変化点の前後にキーをつける)
			//	"max"	最大
			//		(すべてのフレームにキーをつける)
var TimeShift	=true	;
			//AEキー取り込みの際0.5フレームのオフセットを自動でつける
			//	 true	つける(標準)
			//	false	つけない
var FootageFramerate	="auto";
			//フッテージのフレームレート
			//	"auto"	コンポのフレームレートに合わせる
			//	数値	指定の数値にする

var defaultSIZE	="1280,720,1";
			//コンポサイズが指定されていない場合の標準値
			//"横,縦,アスペクト"
//---

//---シートオプション	*cookie[4]
var SpinValue	=3;
			//スピン量初期値
var SpinSelect	=false;
			//選択範囲指定でスピン量の指定を行うか

var SheetLength   = 6 ;
			//タイムシート1枚の秒数
			//	どう転んでも普通６秒シート。でも一応可変。
			//	2列シートを使う時は偶数の秒数がおすすめ。
var SheetPageCols = 2 ;
			//シートの列数。
			//	シート秒数を割り切れる数を置いて下さい。
			//	実際問題としては１または２以外は
			//	使いづらくてダメだと思うよ。
var FootMark	=true;
			//差分機能
			// 使う=true / 使わない=false
var TabSpin	=true
			//TABキーで確定
			// する=true / しない=false
var NoSync	=false
			//キー入力の同期をとらない。
			//trueにするとキー入力のリアルタイム書き換えを抑制します。
			//ほんの少し動作が早くなります。(クッキーに記録してません。)
//---

//---カウンタタイプ	*cookie[5]
var Counter0	=[3,0];
var Counter1	=[5,1];
			//カウンタのタイプ
			//[表示形式,開始番号]
			//
			//カウンタのタイプは、5種類。いずれかを数字で
			//	type 1	00000		
			//	type 2	0:00:00		
			//	type 3	000 + 00	
			//	type 4	p 0 / 0 + 00	
			//	type 5	p 0 / + 000	
			//開始番号は、0 または 1	

//--

//---ユーザインターフェースオプション	*cookie[6]
var SLoop	=false;
var CLoop	=true;
			//スピンループ・カーソルループ
			//する=true / しない=false
var AutoScroll	=true;
			//自動スクロール
			//する=true / しない=false
//---	
var TSXEx	=false;
			//TSX互換機能を使うか
//var TMSEx	=false;
		//TMS互換機能を使うか?この機能はまだありません
		//TMS については、//www.nekora.main.jp/ あたりを参照

//---ウインドウモード	Ver1.5以降
var ViewMode = "PageImage"	;	//UIモード  スクロールScroll/ ページ表示 PageImage
//var ViewMode="Compact"	;

//---(工程)入力モード
var InputMode = 1           ;  //編集モード変数 0:正規化のみ 1:動画補完 2:原画補完


/*
    Cookie[7]
    ツール類の表示状態を保存
    ツール類の表示状態を記録する　ドキュメントファイルに記録するのでなく環境として記録
    ブール値を連結した文字列
    configでは空文字列を与えてpanelTableの初期値を導く
 */
//var ToolView = '0000000001011000100000101111111111010011111111111'
var ToolView = 'default';
//--
/*
ラピッドモードコマンド
*/
//サンプル全機能セット
/*
rapidMode=[
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
"end"];//*/
//おすすめセットのようによく使いそうな機能を選んで絞った方が動作が軽快になります。
//設定は可能ですが、数字をショートカットにはしない方が良いでしょう…当たり前ですけど
//おすすめセットのコメント記号をはずして各自で書き換えてご使用ください。
//	おすすめ1号セット
/*
rapidMode=[
	"+","incr",
	"-","decr",
	"/","nop",
	"*","loop",
	".","undo",
"end"];
*/
//	おすすめ2号セット
/*
rapidMode=[
	"+","incrSpin",
	"-","decrSpin",
	"/","spinAdd",
	"*","spinSub",
	".","back",
"end"];
*/
//	STS互換+モード
var rapidMode=[
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
 *	nop	//何もしない (モードに入るだけ)
 *	incr	//増
 *	decr	//減
 *	incrSpin	//増+スピン
 *	decrSpin	//減+スピン
 *	fwd	//スピン
 *	back	//バックスピン
 *	loop	//スピン値ループ
 *	spinAdd	//スピン値増
 *	spinSub	//スピン値減
 *	undo	//アンドウ
 *	redo	//リドウ
 *	ok	//[enter]と同じ あまり使い道無いです
 *	ng	//[esc]と同じ	上に同じ
 *	home	//[home]	シート先頭へ移動
 *	end	//[end]		シート末尾へ移動
 *	pgUp	//[page-up]	1秒戻る
 *	pgDn	//[page-dpwn]	1秒進む
 *	paren	//数字エントリを括弧で囲む
 *	brac	//エントリを角括弧で囲む
 *	exit	//ラピッドモードを抜ける
 */
//ラピッドコマンドテーブル
//	登録機能は固定
rapidMode.command=new Object();
rapidMode.command["nop"]=	function(){syncInput("");}	;//何もしない (モードに入るだけ)
rapidMode.command["incr"]=	function(){xUI.dialogSpin("incr");}	;//増
rapidMode.command["decr"]=	function(){xUI.dialogSpin("decr");}	;//減
rapidMode.command["incrSpin"]=	function(){xUI.dialogSpin("incrS");}	;//増+スピン
rapidMode.command["decrSpin"]=	function(){xUI.dialogSpin("decrS");}	;//減+スピン
rapidMode.command["fwd"]=	function(){xUI.spin("fwd");}	;//スピン
rapidMode.command["back"]=	function(){xUI.spin("back");}	;//バックスピン
rapidMode.command["loop"]=	function(){xUI.spin("v_loop");}	;//スピン値ループ
rapidMode.command["spinAdd"]=	function(){xUI.spin("v_up");}	;//スピン値増
rapidMode.command["spinSub"]=	function(){xUI.spin("v_dn");}	;//スピン値減
rapidMode.command["undo"]=	function(){xUI.undo();}	;//アンドウ
rapidMode.command["redo"]=	function(){xUI.redo();}	;//リドウ
rapidMode.command["ok"]=	function()
{
	if (xUI.edchg){xUI.put(xUI.eddt);}//更新
	xUI.spin("fwd");
}	;//確定
rapidMode.command["ng"]=function()
{
	if(xUI.edchg){xUI.edChg(false);}
	syncInput(xUI.bkup());
}	;//取り消し
rapidMode.command["home"]=function(){	xUI.selectCell(xUI.Select[0]+"_0");}	;//
rapidMode.command["end"]=function(){	xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());}	;//
rapidMode.command["pgUp"]=function(){	xUI.spin("pgup");}	;//
rapidMode.command["pgDn"]=function(){	xUI.spin("pgdn");}	;//
rapidMode.command["paren"]=function(){
	var EXword="(#)";
//# を、現在の値の数値部分と置換
		if(xUI.bkup().toString().match(/(\D*)([0-9]+)(.*)/)){
			var prefix=RegExp.$1;var num=RegExp.$2;var postfix=RegExp.$3;
			EXword=EXword.replace(/\#/,num);
			EXword=prefix+EXword+postfix;
		}
	syncInput(EXword);
	;}	;//
rapidMode.command["brac"]=function(){
	var EXword="[*]";
//* を、現在の値と置換
	EXword=EXword.replace(/\*/,xUI.bkup().toString());
	syncInput(EXword);
;}	;//
rapidMode.command["exit"]=function(){
		xUI.eXMode=0;	xUI.eXCode=0;
		xUI.selectedColor=xUI.inputModeColor.NORMAL;
		xUI.spinAreaColor=xUI.inputModeColor.NORMALspin;
		xUI.spinAreaColorSelect=xUI.inputModeColor.NORMALselection;
		xUI.spinHi();
		return true;
}
/*****************************************************************************
 *
 *		ファイルハンドリングCGIアドレス 暫定版
 *		同梱のrmpEcho.cgiをローカルマシンのWeb共有や
 *		LAN内のサーバに置くとレスポンスが向上します。
 *
 */

//var ServiceUrl="//192.168.188.2/cgi-bin/rmpEcho.cgi?";
var ServiceUrl="//www.nekomataya.info/cgi-bin/remaping/rmpEcho.cgi?";
var HttpsServiceUrl="//nekomataya.sakura.ne.jp/cgi-bin/remaping/rmpEcho.cgi?";
// var ServiceUrl="//localhost/~<your address>/rmpEcho.cgi?";//参考1
// var ServiceUrl="//localhost/cgi-bin/rmpEcho.cgi?";//参考2

////////////
var SheetSubSeparator	=6;
			//サブセパレータの間隔
var FavoriteWords =["X","カラ","[*]","(*)","<*>","-","・","○","●","→","←","移動","↑","|","↓","⇑","‖","⇓","?"];
			//ツールボックスの「よく使う文字」のエントリ
			// * は、現在の内容
			// # は、現在の数値 と置き換えられます。
			//  このエントリは予約語とは無関係
/*	以下のエントリは予約語として処理	
var EllipsisSigns   =["|",":",";","｜","：","；","‖","↓","↑","⇓","⇑"];
var BlankSigns		=["×","0","X","x","✕","〆","✖","☓","✗","✘"];
//var InterpolationSigns =["-","=","<*>","·","・","*","▫","▪","▴","▵","▾","▿","◈","◉","◦"];
var InterpolationSigns	=["-","=","*","・","○","●"];
			//中間値生成予約（中割・動画）記号
			//前後に他の文字列データを含まない場合のみ機能を果たす
			//この他に<.+>も補間記号として働く
		    //	詳細別紙
*/
/*
    区間開始・終了ノードの予約語
    これはコーディングしちゃったほうが良さそう
    開始ノードを定義して終了ノードは対で使用ただし省略は可能
    データ構造は、[開始シンボル,終了シンボル]の配列
    終了シンボルは開始シンボル再利用固定、対応シンボル固定、またはフリー
    常に終了シンボルは省略可能
    フォーマットで規定してしまったほうが良さそうなのであった
    
var CamNodeSigns	=[["▽","△"],["▼","▲"],["┳","┻"],["┬","┴"],["↑","↓"],["⇑","⇓"]];//["◎"],["＊"],["○"],["●"],["□"],["■"],["◇"],["◆"],["☆"],["★"]
//カメラノードサインは、配列で登録する  要素数１の配列は開始と終了を同じサインで行う
var TrnNodeSigns	=["].+[","]><[","]X[","]⋈["];
//トランジションノードサインは、開始サインと終了サインを一致させる。継続長２フレーム以下の場合は開始サインのみでOK
var FxNodeSigns	=[").+(","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
//効果ノードサインは、開始サインと終了サインを一致させる。トランジションタイプの効果はトランジションサインを使用する
var NodeSigns =[").+(","]X[","]⋈[","[.+]","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
			//範囲ノード予約記述  インターポレーションサインの機能も併せ持つ  詳細別紙
var DialogSigns=["(*)","____","----","⁀⁀⁀⁀","‿‿‿‿"];
			//ダイアログ（サウンド）タイムライン専用のセパレーター  詳細別紙
*/
/*
	４連スコアは、ダイアログのみ予約なので注意
	4連で無く単独使用でもセパレータとして扱うほうが良いか否か検討
	セパレーターは基本的に一組で機能する。
	開始セパレータは開始ノードに文字を書き込む必要があるため所属フレームではなくその後のフレームを開始ノードにする。
	終了セパレータが現れるか、他のノードが開始されるまでの間をセクション（オブジェクト）にする。
	終了セパレータは、その前のフレームを終了ノードにする。
	ラベルを伴ったセパレータは開始セパレータになる。
	開始セパレータの次に現れたセパレータは、開始セパレータに連続して現れるか、又はセクションラベルを伴わない限り
	終了セパレータとなり、セパレータの前フレームでセクションを閉じる。
	セパレータが連続した場合セクションの長さ(duration)が例外的に0になるので注意
	この場合開始セパレータごと無効にしてオブジェクトを生成しない
	（＝無効記述として扱う。そのまま記述を放置すると整形時に捨てられることにしておく。）

	第一フレームは先行するフレームが無い
	これを開始ノードにするために先行フレームに開始セパレータを記述することは出来ない
	第二フレームを開始ノードとするか、または終了セパレータのみでセクションを作ること
*/
/*
	クッキーで保存する情報
	true の情報を保存します。保存したくない情報は、false にしてください。
	情報の種類にしたがってクッキーで保存する情報と保存したくない情報を
	選んでください。
	記録しなかった情報はこのファイルの設定に従います。
	どの情報も使用中に切り替え可能です。

*/
var	useCookie	=[true];//クッキーを使う場合は"true"にしてください。
//if(navigator.userAgent.match(/AdobeAIR/)){alert("AdobeAIR");useCookie	=[false];}
//クッキーの期限 
//	0		ゼロ > そのセッション限り
//	日数	数値を与えると、最後に使った日からその日数の間有効
	useCookie.expiers	= 31	;
//[0]	 シートカラーと印字サイズ
	useCookie.SheetProp	= true	;
//[1]	最後に編集したシートの尺数。レイヤ数などを記録するかどうか?
 	useCookie.XPSAttrib	= true	;
//[2]	最後に作業したユーザ名
 	useCookie.UserName	= true	;
//[3]	キー変換オプション
 	useCookie.KeyOptions	= true	;
//[4]	シートオプション
 	useCookie.SheetOptions	= true	;
//[5]	カウンタ種別
 	useCookie.CounterType	= true	;
//[6]	ユーザインターフェース
 	useCookie.UIOptions	= true	;
//[7]  UI表示状態
        useCookie.UIView = true;
// この設定ファイルは、Javascriptのソースです。書き換えるときはご注意を
// エラーが出た時のためにバックアップをお忘れ無く。