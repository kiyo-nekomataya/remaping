/**************************************************************************
 *    ////// UATアプリケーショングループ共用設定ファイル //////
 *
 *  アプリ共用設定ファイルとしてデフォルト設定を内容をここでまとめて記述する
 *  設定内容はcookieで保存され、バックアップ情報としてlocalStorageに同内容が保持される
 *  nasライブラリをインストールしているユーザaccountの環境では、重複する情報はnas側の設定が優先される
 *  (nas.configuration >) localStorage > cookie > config.js
 * ライブラリの設定利用は nas_preferrence.jsのロードが必要
 * 一部の設定はこのファイルでしか行えない
 * グローバルの定数群から nas.configへ移行
 *  アプリケーションごとの設定は config.app[app-keyword]配下へ移動
 *  データファイルは config/<appplicationname>.js へ配置
 */
'use strict';
/**
 *  設定トレーラー
 */
    var config = {};
/**
 * デバッグモード
 * @type {boolean}
 */
    config.dbg = true;
/**
 * モジュール処理フラグモード
 * @type {boolean}
 */
    config.on_cjs = false;
/**
 *  アプリケーション別設定トレーラー
 *  @type {Object}
 *  blank object
 */
    config.app = {};
/** @desc
 *    開始メッセージ
 *    お好きなメッセージに入れ替えできます。
 *    開始メッセージが抑制されている場合は表示されません。
 *      ＊＊＊アプリ別設定＊＊＊?
 * @type {string}
 */
    config.welcomeMsg  = "UATools application test version:2025.07";
    config.windowTitle = "1.0.0";//window.titleとしての役割は終了 統合バージョン定数
/* Electron用の設定を読み出して共有
    cordova|Electron Projectのルートフォルダが、アプリケーションの更に上層に変更されたためこの取得は不能
    取得条件を変更してマスタープロセスへのリクエストに変更のこと
    ２０２５０７０２
if(typeof jQuery == 'function'){
    $.get(
        './package.json',
        function(result){
            config.package = result;
console.log('loaded : package.json');
        }
    );
};
*/
/**************************************************************************
 *  タイムシート等ドキュメントのヘッダに表示するロゴタイプ 共用設定
 *      ページロゴを設定して各会社のサインや作品タイトルとして使用することが可能
 *      ヘッダロゴを使用しない場合は、useHeaderLogo をfalseに
 *      HTMLタグ記述も可　画像使用の場合はタグ記述が必須
 *      ロゴにリンク先をもたせない場合は空白を使用する
 *      ＊＊＊アプリ別設定＊＊＊
 *      例：
 *    config.headerLogo = "<b>りまぴん</b>";
 *    config.headerLogo = "<img src='images/logo/black.gif' alt='Nekomataya' width=150 height=30 border=0 />";
 *    config.headerLogo = "<img src='//www.nekomataya.info/cgi-bin/garden.cgi?SET=test-logo' alt='Nekomataya' width=150 height=24 border=0 />";
 *      ロゴに与えるリンク先
 *    config.headerLogo_url = "./help/index.html";試験中
 *    config.headerLogo_url = "http://www.nekomataya.info/remaping/";
 *      ロゴのコメント(title)
 *    config.headerLogo_urlComment    ="UATimesheet簡易マニュアル";
 */
    config.useHeaderLogo         = true;
    config.headerLogo            = "<img src='/images/logo/UATimesheet.png' alt='UATimesheet' width=141 height=24 border=0 />";
    config.headerLogo_url        = "https://docs.google.com/document/d/1A7vo-pw1Vgs7tRagJpOSKwoQnsYcvvFejxq_OIewYdk/edit?usp=sharing";
    config.headerLogo_urlComment = "UAToolbox-beta簡易操作ガイド";

/**************************************************************************
 *    ユーザインターフェースカラー 共用設定
 *
 *  Adobe ESTK,UXP,node等のHTMLUIを持たない環境のための設定を優先して共通環境にするため
 *  基本的に個別アプリ設定に移行予定

 *  SheetLooksとは別にDocumentColorを設定して使用 共用設定 アプリ別上書き可能？

 *    このエリアを編集してタイムシートのカラーを変更できます。
 *    お好きな色合いに変更してください。
 *    リクエストがある様なら編集インターフェースがつくかもしれません。
        テキスト色
    SheetTextColor    = "#111111"    ;//濃いグレー
        タイムシート背景色
    SheetBaseColor    = "#ffdffe"    ;//アカムラサキ
    SheetBaseColor    = "#fdeefd"    ;//ドドメイロ
    SheetBaseColor    = "#efffef"    ;//わかくさ
    SheetBaseColor    = "#ffffef"    ;//びわ
    SheetBaseColor    = "#edd3a1"    ;//浅黄
    SheetBaseColor    = "#b68d4c"    ;//きつるばみ
    SheetBaseColor    = "#fef4f4"    ;//さくら
    SheetBaseColor    = "#f5b199"    ;//一斤染
    SheetBaseColor    = "#cfcfd6"    ;//銀鼠
    SheetBaseColor    = "#efefef"    ;//白鼠
    SheetBaseColor    = "#f8f8f8"    ;//白練
        選択セルの背景色(通常)
    SelectedColor    ="#ccccff"    ;//青
        選択セルの背景色(拡張入力モード)
    RapidModeColor    ="#ffccbb"    ;//あか
        選択セルの背景色(ブロック移動モード)
    FloatModeColor    ="#88eeee"    ;//シアン
        選択セルの背景色(セクション編集モード)
    SectionModeColor="#ccffcc"    ;//ミドリ
        区間色自体は背景色との演算で変化する
        選択領域の背景色
    SelectionColor    ="#f8f8dd"    ;//
        フットスタンプ/diff の色(足跡機能を使用しない場合は無効)
    FootStampColor    ="#fff8f8"    ;//
        セル編集中のインジケータ
    EditingColor    ="#eebbbb"    ;//
        セル選択中のインジケータ
    SelectingColor    ="#ccccaa"    ;//
    
        UI上のドキュメントデザインを記録するため以下をこのオブジェクト内に記録する
        config内の情報と重複しないようにこちらに移動
        個別ドキュメントの情報を優先する
        page|scroll|restriction
	Restriction  ="true"     ;//true|false
	ViewMode     ="page"     ;//page|scroll
	PageLength   ="6+0"      ;//タイムシート1枚の記述時間 FCT記述
	FrameRate    ="24fps(24)";//フレームレート
	SheetColumn  =2          ;//ドキュメントのカラム数

        スタイルシートで使用する単位を指定 em,px,pt,...etc
        WEBスタイルなので pxは96ppiの指定に相当することに注意
        スタイルシートで使用する単位 em,px,pt,...etc
    CellWidthUnit    ="px";
        インターフェースのサイズ
    TimeGuideWidth       = 36; //時間表示
    ActionWidth          = 20; //アクションシートの幅
    DialogWidth          = 36; //台詞欄の幅
    SoundWidth           = 42; //サウンド欄の幅
    SheetCellWidth       = 42; //通常のセルの表示幅
    SheetCellNarrow      = 4 ; //折りたたみ時のセルの表示幅
    StillCellWidth       = 12; //静止画欄の幅
    GeometryCellWidth    = 52; //ジオメトリトラック幅
    SfxCellWidth         = 46; //効果指定欄の幅
    CameraCellWidth      = 72; //カメラワーク指定欄の幅
    CommentWidth         = 120;//コメント欄の幅
    ColumnSeparatorWidth = 4;  //カラムセパレータの幅
基本は、シート基準色のみを設定するように変更
基準色はシートカラーとしてドキュメントごとに指定可能に2022 0217
指定がない場合はデフォルト値が与えられる
ShetLooksオブジェクトはドキュメントテンプレートの一部として機能する
 */
/*
config.SheetLooks = {
	WorkTitleLogo        :"",
	SheetTextColor    :"#111111",
	SheetBaseColor    :"#ffffef",
	AppBaseColor      :"#ffffef",
	SelectedColor     :"#9999ff",
	RapidModeColor    :"#ffff44",
	FloatModeColor    :"#88eeee",
	SectionModeColor  :"#ff44ff",
	SelectionColor    :"#f8f8dd",
	FootStampColor    :"#ffffff",
	EditingColor      :"#eebbbb",
	SelectingColor    :"#ccccaa",
	Restriction          :false,
	ViewMode             :"page",
	PageLength           :"6+0",
	FrameRate            :"24fps(24)",
	SheetColumn          :2,
	CellWidthUnit       :"px",
	SheetHeadMargin     :0,
	SheetLeftMargin     :0,
	TimeGuideWidth	    :48,
	ActionWidth         :18,
	DialogWidth	        :42,
	SoundWidth          :42,
	SheetCellWidth	    :24,
	SheetCellNarrow	    :4,
	StillCellWidth	    :12,
	GeometryCellWidth   :52,
	SfxCellWidth	    :46,
	CameraCellWidth     :34,
	CommentWidth        :64,
	ColumnSeparatorWidth:8,
	trackSpec :[
		["dialog"     ,   1],
		["replacement",   8],
		["camera"     ,   3],
		["comment"    ,   1]
	]
};//*/
config.app.remaping.DocumentColor = "#f2f2f2";
config.SheetLooks = {
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

/**************************************************************************
 *  ストーリーボードドキュメントカラー
 */
config.app.sbdEditor.DocumentColor    ="#efefff";
/**************************************************************************
 *  UAFドキュメントカラー
 */
config.app.uaf.DocumentColor    ="#efefff";
/**************************************************************************
 *  pmanドキュメントカラー
 */
config.app.pman.DocumentColor    ="#efefff";
/**************************************************************************
 * メモ編集時の単語一覧 xpseditor
 *
 *  使用したい単語を1列分ずつ配列で登録
 *  数値は文字列として扱われる
 *  %<keyword>% は、キーワードに合わせて置換
 *    title     タイトル
 *    episode   エピソード
 *    scene     シーン
 *    cut       カット
 *    s-c       シーン-カット
 *    time      タイム
 *    line      ライン
 *    stage     ステージ
 *    job       作業（）
 *    user      ユーザ名
 *    date      現在の日付
 */
config.myWords    =[
    ["↖","←","↙","⇄",""],
    ["↑","◯","↓","⇅",""],
    ["↗","→","↘","〜",""],
    ["◎","＊","○","●","□","■","◇","◆"],
    ["△","▲","▽","▼","☆","★"],
    ["PAN ","Follow ","Slide ","mm/k","]X[","ゴンドラ","ブレ","画面動"],
    ["つけPAN","TU","TB","中OL","FI","FO","ZOOM IN","ZOOM OUT"],
    ["[A]","[B]","[C]","[D]","[E]","[F]","[G]","[]"],
    ["(1)","(2)","(3)","(4)","(5)","(6)","(7)","()"],
    ["兼用","透過光"," / ","回転","ローリング","特効","",""],
    ["BG","MG","FG","OVL","BOOK","","",""],
	["%stage%:[%user% %date%]","[%user% %date%]","(%user% %date%)","<%user% %date%>","---<済 %user% %date%>---"]
];
/**************************************************************************
 * サービスエージェントが保持するクライアント識別情報 common
 * 同一ホスト同一ブラウザのアプリケーション間で共有
 */
config.ApplicationIdf  = "";
//============= 以下cookie関連 ================//
/**************************************************************************
 *  ドキュメントプロパティ    *cookie[0]
 *  各アプリケーションごとのドキュメントプロパティ
 *  内容はアプリケーションごとに異なる この情報を持たないアプリケーションも存在する
 */
config.SheetBaseColor  = "#efffef"    ;//アプリケーションUIの地色 (状況により上書きあり)
/**************************************************************************
 * 作業オプション    *cookie[1]
 */
/*
    データハンドリングがサーバアクセス主体に変更になるので
    以下の初期プロパティは修正 common 旧コード互換
    クッキーの保存も終了
*/
config.myTitle           = ""    ;
    //タイトル 現行の作品名を入れておくとラクです
config.mySubTitle        = ""    ;
    //サブタイトル 同上
config.myOpus            = ""    ;
    //制作話数等
//nas.Pm.productに統合する

config.myFrameRate       = "24fps";
    //初期フレームレートを置いてください。フレーム毎秒
//nas.FRATEに統合

config.Sheet             = "3+0"    ;
    //カット尺初期値初期タイムシートの長さをタイムコードで(ページ長ではない)
config.DialogColumns     = 1;
    //セリフ欄の数 初期値を整数で(必要に従って増やせる。最低で1つはルック維持のため予約)
config.SoundColumns      = 0;
    //音響欄の数 初期値を整数で(必要に従って増やせる)
config.SheetLayers       = 8;
    //セル重ねの数 初期値を整数で A~D　ならば　4　
config.CameraworkColumns = 0;
    //カメラワーク欄の数 初期値を整数で
config.StageworkColumns  = 0;
    //ステージワーク欄の数 初期値を整数で
config.SfxColumns        = 0;
    //コンポジット欄の数 初期値を整数で
//---

config.myScene = "" ;
    //A.Bパート等  空白でも良い
config.myCut   = "";
    //カット番号

config.myFileName= "$TITLE#$OPUS[$SUBTITLE]__s$SCENE-c$CUT($TC)";
/*    デフォルトのファイル名 以下のワードはそれぞれのカットの値と置換されます
    $TITLE $OPUS $SUBTITLE $SCENE $CUT $TIME $TC
例  "$TITLE-$OPUS_$SCENE-$CUT($TC)" >"タイトル-10_APART-000(6 + 00 .)"
長すぎるファイル名は一部のシステムで不具合の原因となりますのでご注意ください。

*/
/**************************************************************************
 *---ユーザ情報    *cookie[2]
 * NameCheckを有効にすると起動時に名前を入力するプロンプトがでます。
 * 名前はクッキーで保存可能
 * データ形式は (ハンドル):(メールアドレス)
 * 例　ねこまたや:nekomataya@nekomataya.info
 *myNameプロパティをmyNames配列に変更、
 *この設定ファイルのパラメーターはデバッグ後に変更
 *
 */

config.myName        = ""             ;//作業ユーザ名    ヌルストリングで初期化
config.myNames       = [config.myName];//作業ユーザリスト ユーザ名配列 
config.NameCheck     = false;

/**************************************************************************
 *---AEキー変換オプション    *cookie[3]
 */
config.BlankMethod    ="file";
    //カラセル方式デフォルト値
    //    "file",    カラセルファイル
    //    "opacity",    不透明度で処理
    //    "wipe",    ワイプで処理
    //    "expression1"    エクスプレッションで処理
    //    "expression2"    エクスプレッションで処理
    //    "expression3"    エクスプレッションで処理
    //
config.BlankPosition    ="end";
    //カラセル位置デフォルト値
    //    "build",    自動生成(現在無効)
    //    "first",    最初
    //    "end",    最後
    //    "none"    カラセルなし
config.AEVersion    ="8.0";
    //AEバージョン 4.0 5.0 6.5 7.0 8.0
    // 2022時点ですでにバージョン変化はなくなっているので8.0に固定で良い
config.KEYMethod    ="min";
    //AEキータイプ
    //    "min"    キーの数が最少
    //    (自分で停止にする必要がある)
    //    "opt"    最適化
    //    (変化点の前後にキーをつける)
    //    "max"    最大
    //    (すべてのフレームにキーをつける)
config.TimeShift    =true    ;
    //AEキー取り込みの際0.5フレームのオフセットを自動でつける
    //     true    つける(標準)
    //    false    つけない
config.FootageFramerate    ="auto";
    //フッテージのフレームレート
    //    "auto"    コンポのフレームレートに合わせる
    //    数値    指定の数値にする
config.defaultSIZE    ="1280,720,1";
    //コンポサイズが指定されていない場合の標準値
    //"横,縦,アスペクト"
//---

/**************************************************************************
 *---xpsedit UI操作系オプション    xpseditor *cookie[4]
 */
config.SpinValue    =3;
    //スピン量初期値
config.SpinSelect    =false;
    //選択範囲指定でスピン量の指定を行うか

config.SheetLength   = 6 ;
    //タイムシート1枚の秒数
    //    日本の標準量は６秒  可変だが、用紙との混在がなければデフォルトで
    //    2列シートを使う時は偶数の秒数がおすすめ。
config.SheetPageCols = 2 ;
    //シートの列数。
    //    シート秒数を割り切れる数を置いて下さい。
    //    実際問題としては１または２以外は
    //    使いづらくてダメだと思うよ。
config.FootMark    =true;
    //差分機能
    // 使う=true / 使わない=false
config.TabSpin    =true
    //TABキーで確定
    // する=true / しない=false
config.NoSync    =false
    //キー入力の同期をとらない。
    //trueにするとキー入力のリアルタイム書き換えを抑制します。
    //ほんの少し動作が早くなります。(クッキーに記録してません。)
//---

/**************************************************************************
 *---カウンタタイプ    *cookie[5] アプリ間共用 
 */
config.Counter0    =[3,0];//主カウンタ
config.Counter1    =[5,1];//副カウンタ
/*
    //カウンタのタイプ
    //[表示形式,開始番号]
    //
    //カウンタのタイプは、5種類。いずれかを数字で
    //    type 1    00000    フレーム数
    //    type 2    0:00:00    TC簡易型
    //    type 3    000 + 00    sec + fr
    //    type 4    p 0 / 0 + 00    page/ sec + fr
    //    type 5    p 0 / + 000     page/ + fr
    //    type 6    00:00:00:00     TC SMPTE(DF 30)
    //    type 7    00:00:00:00     TC SMPTE(DF 60)
    //開始番号は、0 または 1    
*/
//--

//---ユーザインターフェースオプション  xpseditor  xps*cookie[6]
config.SLoop    = false;
config.CLoop    = true;
/*スピンループ・カーソルループ for xpst
    する  = true
    しない = false
 */
config.AutoScroll    =true;
/*自動スクロール
    する  = true
    しない = false
 */
 //---    
config.TSXEx    =true;
    //TSX互換機能を使うか
//config.TMSEx    =false;
    //TMS互換機能を使うか?この機能はまだありません
    //TMS については、//www.nekora.main.jp/ あたりを参照

//---ウインドウモード    Ver1.5以降
config.ViewMode="PageImage"    ;
/*UIモード for xpst
      コンパクト    Compat
      シートワープロ WordProp
//config.ViewMode="Compact"    ;
 */

//---(工程)入力モード
config.InputMode = 1;
/*編集モード変数 for xpst
    0:未加工
    1:動画補完
    2:原画補完
 */

/**************************************************************************
    Cookie[7]
    UIpanel/ツール類の表示状態を保存 HTML-UI-common

    ツール類の表示状態を記録する　ドキュメントファイルに記録するのでなく環境として記録
    ブール値を連結した文字列
    キーとなる文字列のリスト
    最初から順に
        === アプリケーション共用分 ===
    "pMenu"             WEBドロップダウンメニュー<2020改修 削除予定 非表示化>
    "account_box"       ユーザアカウント切り替え
        "optionPanelLogin"  認証パネル(ダイアログ化したのでここから排除)
    "toolbarHeader"     ツールバー<2020改修 削除予定 非表示化>
    "optionPanelUtl"    コマンドバー<2020改修 削除予定 非表示化>

    "pmcui"             作業メニュー<2020改修 常時表示メニューに移動>

    "headerTool"        ヘッダー入力コントロールバー
    "inputControl"      入力コントロール
    "sheetHeaderTable"  タイムシートヘッダ
    "optionPanelTbx"    ソフトウェアキーボード
    "optionPanelDbg"    デバッグコンソール
    "memoArea"          メモ表示域
    "toolbarPost"       アイコンボタンポストメニューバー
        === pman.reName ===
    "prefixStrip"       
    "suffixStrip"       
    "optionPanelSearch" 
    "optionPanelThumbnailSize"
    "optionPanelPreviewSize"
    "rename_setting"
    ""
    "flip_"
    一般表示メニューの順と一致　メニューが変わると変更あり
var list =[];
for (var prp in xUI.panelTable){
    if(xUI.panelTable[prp].type == 'fix')
    list.push([prp,xUI.panelTable[prp].elementId,($(xUI.panelTable[prp].elementId).isVisible())?1:0]);
};
console.log(list.join('\n'));
    ツールバーポストは、表示の性格上一番最後に解決するのが望ましい
*/
/*
Login,optionPanelLogin,0
Ver,optionPanelVer,0
NodeChart,optionPanelNodeChart,0
Pref,optionPanelPref,0
Rol,optionPanelRol,0
File,optionPanelFile,0
SCI,optionPanelSCI,0
Prog,optionPanelProg,0
Scn,optionPanelScn,0
Item,optionPanelInsertItem,0
Paint,optionPanelPaint,0
Draw,optionPanelDraw,0
Timer,optionPanelTimer,0
Sign,optionPanelSign,0
Snd,optionPanelSnd,0
Ref,optionPanelRef,0
Cam,optionPanelCam,0
Stg,optionPanelStg,0
Sfx,optionPanelSfx,0
Tbx,optionPanelTbx,0
menu,pMenu,1
ibC,toolbarPost,1
ToolBr,toolbarHeader,0
Utl,optionPanelUtl,0
SheetHdr,sheetHeaderTable,0
headerTool,headerTool,0
inputControl,inputControl,0
account_box,account_box,0
pmui,pmui,0
pmcui,pmcui,1
appHdBr,applicationHeadbar,1
Memo,optionPanelMemo,0
memoArea,memoArea,0
Data,optionPanelData,0
AEKey,optionPanelAEK,0
Search,optionPanelSearch,1
PreviewSize,optionPanelPreviewSize,0
ThumbnailSize,optionPanelThumbnailSize,0
prefix,prefixStrip,1
suffix,suffixStrip,0
rename_setting,rename_setting,1
flip_control,flip_control,0
flip_seekbar,flip_seekbar,0
lightBoxControl,lightBoxControl,0
lightBoxProp,lightBoxProperty,0
_exclusive_items_,,0
// */

config.ToolView = 'default';//デフォルト設定 full|minimum ||
//                '000000000000000000000011111111111101000000000000000';
//                '0000000000000100000000111111111111010000000000000';
//                '00000000000001000000001001111111100000000000000000';
//                '000000000000000000111110000001011000000000000000'
//                '0000000000000000001111000101111000001000110000';
//                '0000000000000000001111000101111000001000110000'
//                '000000000000000000000010000001011000000000000000'
config.ToolViewIbCs = '0';//アイコンバー選択状態

/*****************************************************************************
 *
 *    ファイルハンドリングCGIアドレス 暫定版
 *    同梱のrmpEcho.cgiをローカルマシンのWeb共有や
 *    LAN内のサーバに置くとレスポンスが向上します。
 *    このCGIはBlobを使うものに書き換えるので不要になる予定
 */

//config.ServiceUrl="//192.168.188.2/cgi-bin/rmpEcho.cgi?";
config.ServiceUrl="http://www.nekomataya.info/cgi-bin/remaping/rmpEcho.cgi?";
config.HttpsServiceUrl="//nekomataya.sakura.ne.jp/cgi-bin/remaping/rmpEcho.cgi?";
// config.ServiceUrl="//localhost/~<your address>/rmpEcho.cgi?";//参考1
// config.ServiceUrl="//localhost/cgi-bin/rmpEcho.cgi?";//参考2

////////////


config.SheetSubSeparator    =6;
    //サブセパレータの間隔 xpseditor

config.FavoriteWords =["X","-","・","","カラ","△","▽","▲","▼","▫","▪","▴","▵","▾","▿","◈","◉","◦","◦","·","→","←","移動","↑","|","↓","⇑","‖","⇓","?","___","----","[#]","(#)","<#>","[*]","(*)","<*>"];
    //ツールボックスの「よく使う文字」のエントリ
    // xpseditor NoteText(MEMO)
    // * は、現在の内容
    // # は、現在の数値 と置き換えられます。
    //  このエントリは予約語とは無関係
/*    以下のエントリは予約語として処理    
config.EllipsisSigns   =["|",":",";","｜","：","；","‖","↓","↑","⇓","⇑"];
config.BlankSigns    =["×","0","X","x","✕","〆","✖","☓","✗","✘"];
//config.InterpolationSigns =["-","=","<*>","·","・","*","▫","▪","▴","▵","▾","▿","◈","◉","◦","◦"];
config.InterpolationSigns    =["-","=","*","・","○","●"];
    //中間値生成予約（中割・動画）記号
    //前後に他の文字列データを含まない場合のみ機能を果たす
    //この他に<.+>も補間記号として働く
        //    詳細別紙
*/
/*
    区間開始・終了ノードの予約語
    これはコーディングしちゃったほうが良さそう
    開始ノードを定義して終了ノードは対で使用ただし省略は可能
    データ構造は、[開始シンボル,終了シンボル]の配列
    終了シンボルは開始シンボル再利用固定、対応シンボル固定、またはフリー
    常に終了シンボルは省略可能
    フォーマットで規定してしまったほうが良さそうなのであった
    
config.CamNodeSigns    =[["▽","△"],["▼","▲"],["┳","┻"],["┬","┴"],["↑","↓"],["⇑","⇓"]];//["◎"],["＊"],["○"],["●"],["□"],["■"],["◇"],["◆"],["☆"],["★"]
//カメラノードサインは、配列で登録する  要素数１の配列は開始と終了を同じサインで行う
config.TrnNodeSigns    =["].+[","]><[","]X[","]⋈["];
//トランジションノードサインは、開始サインと終了サインを一致させる。継続長２フレーム以下の場合は開始サインのみでOK
config.FxNodeSigns    =[").+(","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
//効果ノードサインは、開始サインと終了サインを一致させる。トランジションタイプの効果はトランジションサインを使用する
config.NodeSigns =[").+(","]X[","]⋈[","[.+]","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
    //範囲ノード予約記述  インターポレーションサインの機能も併せ持つ  詳細別紙
config.DialogSigns=["(*)","____","----","⁀⁀⁀⁀","‿‿‿‿"];
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
    アプリケーションメニュー類を設定
*/
config.menuset = {
    "app_template":{
        applicationMenu:'template/menu/app_template_applicationMenu.text',
        contextMenu    :'template/menu/app_template_contextMenu.text',
        iconBarMenu    :'template/menu/app_template_iconBarMenu.text'
    },
    "console":{
        applicationMenu:'template/menu/console_applicationMenu.text',
        contextMenu    :'template/menu/console_contextMenu.text',
        iconBarMenu    :'template/menu/console_iconBarMenu.text'
    },
    "uat":{
        applicationMenu:'template/menu/uat_applicationMenu.text',
        contextMenu    :'template/menu/pman_contextMenu.text',
        iconBarMenu    :'template/menu/pman_iconBarMenu.text'
    },
    "remaping":{
        applicationMenu:'template/menu/remaping_applicationMenu.text',
        contextMenu    :'template/menu/remaping_contextMenu.text',
        iconBarMenu    :'template/menu/remaping_iconBarMenu.text'
    },
    "pman_reName":{
        applicationMenu:'template/menu/pman_reName_applicationMenu.text',
        contextMenu    :'template/menu/pman_contextMenu.text',
        iconBarMenu    :'template/menu/pman_iconBarMenu.text'
    },
    "pman":{
        applicationMenu:'template/menu/pman_applicationMenu.text',
        contextMenu    :'template/menu/pman_contextMenu.text',
        iconBarMenu    :'template/menu/pman_iconBarMenu.text'
    },
    "xpsedit":{
        applicationMenu:'template/menu/xpsedit_applicationMenu.text',
        contextMenu    :'template/menu/xpsedit_contextMenu.text',
        iconBarMenu    :'template/menu/xpsedit_iconBarMenu.text'
    },
    "sbde":{
        applicationMenu:'template/menu/sbde_applicationMenu.text',
        contextMenu    :'template/menu/sbde_contextMenu.text',
        iconBarMenu    :'template/menu/sbde_iconBarMenu.text'
    }
};
/**
    外部ツールDB extApps
{
	name:"pahotoshop",
	type:["psd","psb","tga","tiff","png"],
	platform:["mac","win"],
	applicationpath:{
        "mac":"",
        "win":""
    }
},
 */
config.extApps = {
    members :{
        "sys":{
            name:"system",
            type:["*"],
            platform:["Mac","Win"],
            descrption:"アイテムをシステム標準のアプリで開く"
        },

        "ae":{
            name:"AfterEffects",
            type:["aep"],
            platform:["Mac","Win"],
            applicationpath:{
                "Mac":"/Applications/Adobe\ After\ Effects\ 2022/Adobe\ After\ Effects\ 2022.app",
                "Win":"C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files\\AfterFX.exe"
            }
        },
        "ot":{
            name:"OpenToonz",
            type:["aep"],
            platform:["Mac","Win","Unix"],
            applicationpath:{
                "Mac":"/Applications/Adobe\ After\ Effects\ 2022/Adobe\ After\ Effects\ 2022.app",
                "Win":"C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files\\AfterFX.exe"
            }
        },
        "photoshop":{
            name:"photoshop",
            type:["psd","psb","tga","tiff","png"],
            platform:["Mac","Win"],
            applicationpath:{
                "Mac":"/Applications/Adobe Photoshop\ 2022/Adobe\ Photoshop\ 2022.app",
                "Win":"C:\\Program Files\\Adobe\\Adobe Photoshop 2022\\Photoshop.exe"
            }
        },
        "clip":{
            name:"クリップスタジオ",
            type:["clip","psd","psb","tga","tiff","png"],
            platform:["Mac","Win"],
            applicationpath:{
                "Mac":"/Applications/CLIP\ STUDIO\ 1.5/App/CLIP\ STUDIO\ PAINT.app",
                "Win":"C:\\Program Files\\CELSYS\\CLIP STUDIO 1.5\\CLIP STUDIO PAINT\\CLIPStudioPaint.exe"
            }
        },
        "tvp":{
            name:"tvPaint",
            type:["tvpp","psd","psb","tga","tiff","png"],
            platform:["Mac","Win"],
            applicationpath:{
                "Mac":"/Applications/TVPaint\ Animation\ 11\ Pro.app",
                "Win":"C:\\Program Files\\TVPaint Developpement\\TVPaint Animation 11 Pro (64bits)\\TVPaint Animation 11 Pro (64bits).exe"
            }
        }
    },
}

/*
    pman.startupItems
    app pman_reName の初期アイテムリスト
    url|相対パスで指定
    不要の場合は空配列を置く
*/
config.pman_startupItems = [

  "./sample/master-sample/KT%2300__s-c004/_backyard/KT%2300__s-c004__xps.psd",
  "./sample/_10in-std-Frame/data_format_10in.png",
  "./sample/_10in-std-Frame/drawing_10in_200ppi.png",
  "./sample/_10in-std-Frame/paint_10in_144ppi.png",
  "./sample/_10in-std-Frame/paint_10in_150ppi.png",
  "./sample/master-sample/KT%2300__s-c004/__[PT+]C.status.txt",
  "./sample/master-sample/KT%2300__s-c004/_backyard/KT%2300__s-c004__xps.psd",
  "./sample/master-sample/KT%2300__s-c004/00_CT/KT%2300__s-c004__xps.png",
  "./sample/master-sample/KT%2300__s-c004/00_CT/kt%2300__s-c004__CT.psd",
  "./sample/master-sample/KT%2300__s-c004/02_LO/KT%2304__s-c004__xps.png",
  "./sample/master-sample/KT%2300__s-c004/02_LO/BG-1.png",
  "./sample/master-sample/KT%2300__s-c004/02_LO/CAM-1.png",
  "./sample/master-sample/KT%2300__s-c004/02_LO/CELL-1.png",
  "./sample/master-sample/KT%2300__s-c004/02_LO/CELL-1-+.png",
  "./sample/master-sample/KT%2300__s-c004/02_LO/LO-1.png",
  "./sample/master-sample/KT%2300__s-c004/02_LO/ML-1.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/KT%2300__s-c004__xps.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/A-1.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/B-1.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/B-1-+.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/B-1a.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/B-2.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/B-2-+.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/B-2a.png",
  "./sample/master-sample/KT%2300__s-c004/03_GE/C-1.png",
  "./sample/master-sample/KT%2300__s-c004/04_DO/KT%2300__s-c004__xps.png",
  "./sample/master-sample/KT%2300__s-c004/06_PT/KT%2300__s-c004__xps.png",
  "./sample/master-sample/KT%2300__s-c004/10_(BG)/kt00c004BG.png",
  "./sample/master-sample/KT%2300__s-c004/20_(color)/A001.psd",
  "./sample/master-sample/KT%2300__s-c004/20_(color)/B001.psd",
  "./sample/master-sample/KT%2300__s-c004/20_(color)/%E8%89%B2%E6%8C%87%E5%AE%9A%E3%83%8F%E3%82%A4%E3%82%B3%E3%83%B3.png"

/*
  "./sample/mom%2301__s-c123/00_CT/mom%2301__s-c123__CT_xps.jpg",
  "./sample/mom%2301__s-c123/00_CT/CT-1.png",
  "./sample/mom%2301__s-c123/00_CT/CT-2.png",
  "./sample/mom%2301__s-c123/02_LO/BG.png",
  "./sample/mom%2301__s-c123/02_LO/BOOK.png",
  "./sample/mom%2301__s-c123/02_LO/LO-1.png",
  "./sample/mom%2301__s-c123/02_LO/LO-1-e.png",
  "./sample/mom%2301__s-c123/02_LO/LO-2.png",
  "./sample/mom%2301__s-c123/03_GE/mom%2301__s-c123__GEN_xps.png",
  "./sample/mom%2301__s-c123/03_GE/A-1_B-1_C-3.png",
  "./sample/mom%2301__s-c123/03_GE/B-1a_C-2.png",
  "./sample/mom%2301__s-c123/03_GE/B-2_C-1.png",
  "./sample/mom%2301__s-c123/mom%2301__s-c123.xmap",
  "./sample/mom%2301__s-c123/mom%2301__s-c123.xps",
  "./sample/mom%2301__s-c123/mom%2301__s-c123.xdts",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0001.png",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0002.png",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0003.png",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0004.png",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0005.png",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0006.png",
  "./sample/scan-sample/kt%2300__s-c004__1LO/img-0007.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00001.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00002.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00003.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00004.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00005.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00006.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00007.png",
  "./sample/scan-sample/kt%2300__s-c004__2GEN/img-00008.png",
*/
/*
  "./sample/scan-sample/img0001.png",
  "./sample/scan-sample/img0002.png",
  "./sample/scan-sample/img0003.png",
  "./sample/scan-sample/img0004.png",
  "./sample/scan-sample/img0005.png",
  "./sample/scan-sample/img0006.png",
  "./sample/scan-sample/img0007.png",
  "./sample/scan-sample/img0008.png",
  "./sample/scan-sample/img0009.png",
  "./sample/scan-sample/img0010.png",
  "./sample/scan-sample/img0011.png",
  "./sample/scan-sample/img0012.png",
  "./sample/scan-sample/img0013.png",
  "./sample/scan-sample/img0014.png",
  "./sample/scan-sample/img0015.png",
  "./sample/scan-sample/img0016.png",
  "./sample/scan-sample/img0017.png",
  "./sample/scan-sample/img0018.png",
  "./sample/scan-sample/img0019.png",
  "./sample/scan-sample/img0020.png",

  "./sample/1_Open-Folder.png",
  "./sample/2_Check-Item.png",
  "./sample/3_Select-Item.png",
  "./sample/4_Flip-Item.png",
  "./sample/5_Numbering-Item.png",
  "./sample/6_Rename-File.png",
  "./sample/7_Make-ItemList(workslip).png"
  "../remaping.js/sample/usage/frontpage.png"
// */
];
/*
    クッキーで保存する情報
    true の情報を保存
    保存したくない情報は、false に
    情報の種類にしたがってクッキーで保存する情報と保存したくない情報を選択
    記録しなかった情報はconfigファイルの設定に従う
    どの情報も使用中に切り替え可能です。
    アプリごとの設定で上書き可能
*/
/*
    config.useCookie    {Array of Boolean}

*/
    config.useCookie    = [true];//クッキーを使う場合は"true"にしてください。
//if(navigator.userAgent.match(/AdobeAIR/)){alert("AdobeAIR");config.useCookie    =[false];}
//クッキーの期限 
//    0    ゼロ > そのセッション限り
//    日数    数値を与えると、最後に使った日からその日数の間有効
    config.useCookie.expiers       = 31    ;
//[0]    ドキュメントプロパティ
    config.useCookie.DocumentProp     = true    ;
//[1]    最後に編集したシートの尺数。レイヤ数などを記録するかどうか?
     config.useCookie.XPSAttrib    = true    ;
//[2]    最後に作業したユーザ名
     config.useCookie.UserName     = true    ;
//[3]    AEキー変換オプション
     config.useCookie.KeyOptions   = true    ;
//[4]    xpsedit UI操作系オプション
     config.useCookie.SheetOptions = true    ;
//[5]    カウンタ種別
     config.useCookie.CounterType  = true    ;
//[6]    ユーザインターフェース
     config.useCookie.UIOptions    = true    ;
//[7]  UIPanel表示状態
        config.useCookie.UIView    = true;

// この設定ファイルは、Javascriptのソースです。書き換えるときはご注意を
// エラーが出た時のためにバックアップをお忘れ無く。
