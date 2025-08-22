/**************************************************************************
 *    ////// UATアプリケーション個別設定ファイル //////
 *   各設定は、共用の設定データを上書きする
 *
 *  設定内容の一部はcookieで保存され、バックアップ情報としてlocalStorageに同内容が保持される
 */
'use strict';
//  設定トレーラーが存在しない場合は再設定
if(typeof config == 'undefined')     var config = {};
if(typeof config.app == 'undefined') config.app = {};
	config.appIdf = 'remaping'     ;//アプリケーション識別キーワードを設定する(既存データがあっても上書き)
	config.app[config.appIdf] = {} ;
/** @desc
 *    開始メッセージ
 *    お好きなメッセージに入れ替えできます。
 *    開始メッセージが抑制されている場合は表示されません。
 *      ＊＊＊アプリ別設定＊＊＊?
 * @type {string}
 */
    config.welcomeMsg  = "Remaping animation timesheet editor 20250726";
    config.windowTitle = "1.9.5";//window.titleとしての役割は終了 統合バージョン定数
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
    config.headerLogo_url        = "https://docs.google.com/document/d/14XIjRraSci35fLcZdCtrwIJ7G1Z13Wku5e1hzu1QOCc/edit?tab=t.0";
    config.headerLogo_urlComment = "UATimesheet簡易マニュアル";

config.app[config.appIdf].DocumentColor = "#f2f2f2";
//	タイムシートドキュメント書式 書式の詳細情報は別掲載
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
config.DocumentColor  = "#efffef"    ;//ドキュメントのの地色 (状況により上書きあり)SheetBaseColor
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
config.NameCheck     = true;

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
      コンパクト    Scroll(旧Compat)
      シートワープロ PageImage(旧WordProp)
//config.ViewMode="Scroll"    ;
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
	xUI.panelTableに依存
	プロパティがない場合は、デフォルトの値で表示される
*/
config.ToolView = 'default';
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
    "remaping":{
        applicationMenu:'template/menu/remaping_applicationMenu.text',
        contextMenu    :'template/menu/remaping_contextMenu.text',
        iconBarMenu    :'template/menu/remaping_iconBarMenu.text'
    },
    "xpsedit":{
        applicationMenu:'template/menu/xpsedit_applicationMenu.text',
        contextMenu    :'template/menu/xpsedit_contextMenu.text',
        iconBarMenu    :'template/menu/xpsedit_iconBarMenu.text'
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
};
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
//*********  syncTable  ********//
config.app[config.appIdf].syncTable = {
	"scale":function(){
			document.getElementById('pageZoom').value = Math.round(xUI.viewScale * 100);//Xの値のみを参照する
			document.getElementById('pageZoomSlider').value = document.getElementById('pageZoom').value;//Xの値のみを参照する
	},
	"paintColor":function(){ xUI.canvasPaint.syncColors();},
	"paintPalette":function(){ xUI.canvasPaint.syncTools();},
	"paintTool":function(){ xUI.canvasPaint.syncTools();},
	"imgAdjust":function(){},
	"docImgAppearance":function(){
		document.getElementById('ImgAppearanceSlider').value = Math.floor(xUI.XPS.timesheetImages.imageAppearance*100);
		document.getElementById('ImgAppearance').value = document.getElementById('ImgAppearanceSlider').value;
	},
//common
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
		for(var i=0;i<xUI.recentUsers.length;i++){
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
		for(var ix=currentEntry.issues.length-1;ix >= 0;ix--){
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
		document.getElementById("fct0").value = nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1],0,xUI.XPS.framerate);
		document.getElementById("fct1").value = nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1],0,xUI.XPS.framerate);
	},
	"lvl":function(){
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
//フォーカスのあるトラックの情報を取得
        var stat;
		if (xUI.Select[0]>0 && xUI.Select[0]< xUI.XPS.xpsTracks.length){
			var label= xUI.XPS.xpsTracks[xUI.Select[0]]["id"];
			var bmtd= xUI.XPS.xpsTracks[xUI.Select[0]]["blmtd"];
			var bpos= xUI.XPS.xpsTracks[xUI.Select[0]]["blpos"];
			stat = ( xUI.XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))? false:true;
		}else{
			var label=(xUI.Select[0]==0)? "台詞":"メモ";//
			var bmtd=xUI.blmtd;
			var bpos=xUI.blpos;
			stat = true;
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
		if(xUI.viewMode != "Scroll"){
			for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("title"+pg).innerHTML=titleString+"/"+ xUI.XPS.subtitle;
			};
		};
		document.getElementById("XpsIdentifier").innerHTML=decodeURIComponent(Xps.getIdentifier(xUI.XPS,'cut'));
	},
	"opus":function(){
		if(document.getElementById("opus")) document.getElementById("opus").innerHTML=(XPS["opus"])? XPS["opus"] : "";
		xUI.sync("title");
	},
	"subtitle":function(){
		if(document.getElementById("opus")) document.getElementById("opus").innerHTML=(XPS["opus"])? XPS["opus"] : "";
		xUI.sync("title");
	},
	"create_time":function(){
		document.getElementById("create_time").innerHTML = (xUI.XPS["create_time"])? xUI.XPS["create_time"] : "<br />";
		if(xUI.viewMode != "Scroll"){
			for(var pg=1;pg<=Math.ceil( xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("create_time"+pg).innerHTML=(xUI.XPS["create_time"])? xUI.XPS["create_time"] : "<br />";
			};
		};
	},
	"update_time":function(){
		document.getElementById("update_time").innerHTML = (xUI.XPS["update_time"])? xUI.XPS["update_time"] : "<br />";
		if(xUI.viewMode != "Scroll"){
			for(var pg=1;pg<=Math.ceil( xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("update_time"+pg).innerHTML=(xUI.XPS["update_time"])? xUI.XPS["update_time"] : "<br />";
			};
		};
	},
	"update_user":function(){
		document.getElementById("update_user").innerHTML = (XPS["update_user"])? (XPS.update_user.toString()).split(':')[0] : "<br />";
		if(xUI.viewMode != "Scroll"){
			for(var pg=1;pg<=Math.ceil( xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("update_user"+pg).innerHTML=(XPS["update_user"])? (XPS["update_user"].toString()).split(':')[0] : "<br />";
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
		if(xUI.viewMode !="Scroll"){
			for(var pg=1;pg<=Math.ceil( xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
			};
		};
	},
	"cut":function(){
		var scn= xUI.XPS["scene"]	; 
		var cut= xUI.XPS["cut"]	;
		var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
		document.getElementById("scene_cut").innerHTML=myValue;
		if(xUI.viewMode !="Scroll"){
			for(var pg=1;pg<=Math.ceil( xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
			};
		};
	},
	"windowTitle":async function(){
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
		}else{document.title = config.appIdf};
	},
	"framerate":function(){},
	"undo":function(){
//undoバッファの状態を見てボタンラベルを更新
		var stat=(xUI.activeDocument.undoBuffer.undoPt==0)? true:false ;
		$("#ibMundo").attr("disabled",stat);
	},
	"redo":function(){
//redoバッファの状態を見てボタンラベルを更新
		var stat=((xUI.activeDocument.undoBuffer.undoPt+1)>=xUI.activeDocument.undoBuffer.undoStack.length)? true:false ;
		$("#ibMredo").attr("disabled",stat);
	},
	"time":function(){
//時間取得
		var timestr=nas.Frm2FCT( xUI.XPS.time(),3,0, xUI.XPS.framerate);
		document.getElementById("time").innerHTML=timestr;
		if(xUI.viewMode !="Scroll"){
			for(var pg=1;pg<=Math.ceil( xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("time"+pg).innerHTML=(timestr)? timestr : "<br />";
			};
		};
	},
	"trin":function(){
	    xUI.sync('transit');
	},
	"trout":function(){
	    xUI.sync('transit');
	},
	"trout":function(){
		var timestrIN = nas.Frm2FCT(XPS.trin[0],3,0, xUI.XPS.framerate);
		var transitIN = xUI.XPS.trin[1];
		document.getElementById("trin").innerHTML=(xUI.XPS.trin[0]==0)? "-<br/>" : " ("+timestrIN+")";
		var timestrOUT = nas.Frm2FCT(XPS.trout[0],3,0, xUI.XPS.framerate);
		var transitOUT = xUI.XPS.trout[1];
		document.getElementById("trout").innerHTML=(xUI.XPS.trout[0]==0)? "-<br/>" : " ("+timestrOUT+")";
		var myTransit="";
		if( xUI.XPS.trin[0]>0){
			myTransit+="△ "+ xUI.XPS.trin[1]+'('+nas.Frm2FCT( xUI.XPS.trin[0],3,0, xUI.XPS.framerate)+')';
		};
		if(( xUI.XPS.trin[0]>0)&&( xUI.XPS.trout[0]>0)){	myTransit+=' / ';}
		if( xUI.XPS.trout[0]>0){
			myTransit+="▼ "+ xUI.XPS.trout[1]+'('+nas.Frm2FCT( xUI.XPS.trout[0],3,0, xUI.XPS.framerate)+')';
		};
		document.getElementById("transit_data").innerHTML=myTransit;
	},
	"memo":function(){xUI.sync('noteText')},
	"noteText":function(){
		var memoText= xUI.XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
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
};
//*********  panelTable  ********//
config.app[config.appIdf].panelTable = {
//======== MODAL
// common modal-dialog
//commonを上書き可
    'Login'    :{elementId:"optionPanelLogin"    ,type:'fix',uiOrder:-1,note:"サーバログイン(汎)"},

// timesheet|xpst(xmap包括) uaf|xmap modal
    'Scn'      :{elementId:"optionPanelScn"      ,type:'modal',note:"Xpst|xMapタイムシート情報"},
    'File'     :{elementId:"optionPanelFile"     ,type:'modal',note:"サーバ｜ローカル ドキュメントセレクタ(汎)"},
    'SCI'      :{elementId:"optionPanelSCI"      ,type:'modal',note:"Xpsインポートパネル Importer(汎)"},
    'NodeChart':{elementId:"optionPanelNodeChart",type:'modal',note:"ノードチャート(汎)"},

// uatb modal
    'Item'     :{elementId:"optionPanelInsertItem" ,type:'modal',note:"新規アイテム挿入"},
//======== Floating Panel モバイル環境ではfloatしない　半画面固定ドロワ
    'Paint'    :{elementId:"optionPanelPaint" ,uiOrder: -1,type:'float',note:"手書きメモ(汎)",func(elm,status){
// uatb remaping用は同エントリが微妙に異なるが呼び出し手順は揃える
        var currentStatus = $("#optionPanelPaint").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
//show
                $("#optionPanelPaint").show();
                xUI.canvasPaint.active = true;
                if((xUI.viewMode == 'PageImage')&&(xUI.XPS.timesheetImages.imageAppearance == 0)){
                    xUI.setAppearance(1,true);
                };
                xUI.canvasPaint.syncTools();
            }else{
//hide
                if(xUI.canvas) xUI.canvasPaint.unset();
                xUI.canvasPaint.active = false;
                $("#optionPanelPaint").hide();
            };
            if(appHost.touchDevice){
                document.getElementById('fixedPanels').style.display = (opt)? 'none':'';
                xUI.adjustSpacer();
            };
        };
    }},
//予備 uaf xpsedit
    'Draw'     :{elementId:"optionPanelDraw"  ,uiOrder:-1,type:'float',note:"手書きメモv(汎)"},
    'Stamp'    :{elementId:"optionPanelStamp" ,uiOrder:-1,type:'float',note:"スタンプ選択"},
    'Text'     :{elementId:"optionPanelText"  ,uiOrder:-1,type:'float',note:"テキストパネル(汎用)"},
    'Sign'     :{elementId:"optionPanelSign"  ,uiOrder:-1,type:'float',note:"署名パネル(汎)"},
    'Snd'      :{elementId:"optionPanelSnd"   ,uiOrder:-1,type:'float',note:"remaping Dialog|Snd"},
    'Ref'      :{elementId:"optionPanelRef"   ,uiOrder:-1,type:'float',note:"remaping 参考画像パネル"},
//Stopwatch
    'Timer'    :{elementId:"optionPanelTimer" ,uiOrder:-1,type:'fix'  ,note:"ストップウォッチ(汎)アプリごとに差異あり"},

//xpst専用
    'DocFormat':{elementId:"optionPanelDocFormat",uiOrder:-1,type:'float',note:"書式編集パネル",func:function(elm,status){
//パネル立ち上げと同時に現在のドキュメントのsheetLooksを渡す
        var currentStatus = $("#optionPanelDocFormat").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(xUI.viewMode == 'Scroll') opt = false;
        if(opt != currentStatus){
            if(opt){
//show
                if((xUI.XPS.timesheetImages.imageAppearance == 0)||(xUI.XPS.timesheetImages.imageAppearance == 1)) xUI.setAppearance(0.5,true);
                documentFormat.startup(JSON.stringify(xUI.XPS.sheetLooks));//現仕様でxUI.XPSは必ず sheetLooksを持つのでそれを渡す
                $("#optionPanelDocFormat").show();
                documentFormat.expand(false);//true|false
            }else{
//hide
                documentFormat.close(true);//消去ボタンで消すとデータを終了後にデータ更新を行う（保存終了）
                $("#optionPanelDocFormat").hide();
            };
            if(appHost.touchDevice){
                document.getElementById('fixedPanels').style.display = (opt)? 'none':'';
                xUI.adjustSpacer();
            };
        };
    }},
    'ImgAdjust':{elementId:"optionPanelImgAdjust",uiOrder:-1,type:'float',note:"画像調整パネル",func:function(elm,status){
//パネル立ち上げ時に現在のタイムシートの画像を取得
        var pgid = Math.floor(xUI.Select[1]/nas.FCT2Frm(xUI.XPS.sheetLooks.PageLength,new nas.Framerate(xUI.XPS.sheetLooks.FrameRate).rate));
        var currentImg = (xUI.XPS.timesheetImages.members[pgid])? xUI.XPS.timesheetImages.members[pgid]:null;
        if(! currentImg){alert('noimage');return;};
        var currentStatus = $("#optionPanelImgAdjust").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
//show
                if((xUI.XPS.timesheetImages.imageAppearance == 0)||(xUI.XPS.timesheetImages.imageAppearance == 1)) xUI.setAppearance(0.5);
                xUI.imgAdjust.startup(pgid);
                $("#optionPanelImgAdjust").show();
                xUI.imgAdjust.expand(false);
            }else{
//hide
                xUI.imgAdjust.close();
                $("#optionPanelImgAdjust").hide();
            };
//            xUI.setAppearance();
        };
    }},
    'Cam'      :{elementId:"optionPanelCam"   ,uiOrder:-1,type:'float',note:"remaping カメラワーク入力補助パネル"},
    'Stg'      :{elementId:"optionPanelStg"   ,uiOrder:-1,type:'float',note:"remaping ステージワーク入力補助パネル"},
    'Sfx'      :{elementId:"optionPanelSfx"   ,uiOrder:-1,type:'float',note:"remaping コンポジット入力補助パネル"},
    'Tbx'      :{elementId:"optionPanelTbx"   ,uiOrder:-1,type:'float',note:"remaping ツールボックス"},
    'Memo'     :{elementId:"optionPanelMemo"  ,uiOrder:-1,type:'float',note:"Xpsメモ編集(xpsedit)",func:function(elm,status){
        var currentStatus = $("#optionPanelMemo").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
//show
//パネル立ち上げ時に編集ボタンテーブルの内容を更新    
                if((document.getElementById("myWords").innerHTML=="word table")&&(myWords)){
                    document.getElementById("myWords").innerHTML=putMyWords();
                };
                document.getElementById("rEsult").value = xUI.XPS.xpsTracks.noteText;
                $("#optionPanelMemo").show();
            }else{
//hide
                xUI.XPS.xpsTracks.noteText = document.getElementById("rEsult").value;
                $("#optionPanelMemo").hide();
            };
        };
    }},
//inplace-UI-panel common
//uat-common
    'menu'          :{elementId:'pMenu'                   ,uiOrder: 3,type:'fix', note:"WEB pulldown menu(汎)"},
    'appHdBr'       :{elementId:'applicationHeadbar'      ,uiOrder: 1,type:'fix', note:"uat アプリケーションヘッドバー"},
    'Dbg'           :{elementId:'optionPanelDbg'          ,uiOrder:-1,type:'fix', note:"debug console(汎)"},
    'ibC'           :{elementId:'toolbarPost'             ,uiOrder: 1,type:'fix', note:"iconButtonColumn(汎)"},

//remaping tool ribbon
    'ToolBr'        :{elementId:'toolbarHeader'           ,uiOrder: 3,type:'fix', note:"remaping ツールバー"},
    'Utl'           :{elementId:'optionPanelUtl'          ,uiOrder: 3,type:'fix', note:"remaping ユーティリティツール"},
//timesheet document UI
    'SheetHdr'      :{elementId:'sheetHeaderTable'        ,uiOrder: 3,type:'fix', note:"remaping シートヘッダ"},
    'headerTool'    :{elementId:'headerTool'              ,uiOrder: 2,type:'fix', note:"remaping シートヘッダツール(カウンタ等)"},
    'inputControl'  :{elementId:'inputControl'            ,uiOrder: 2,type:'fix', note:"remaping 入力コントロール",
    func:function(elm,status){
        var currentStatus = (elm.getAttribute('class').indexOf('inputControl-show') >= 0)? true:false;
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
                elm.setAttribute('class','inputControl inputControl-show');
            }else{
                elm.setAttribute('class','inputControl inputControl-hide');
            };
            xUI.adjustSpacer();
        };
    }},
    'account_box'   :{elementId:'account_box'             ,uiOrder: 3,type:'fix', note:"remaping アカウント表示"},
    'pmui'          :{elementId:'pmui'                    ,uiOrder:-1,type:'fix', note:"remaping 作業管理バー(旧)"},
    'pmcui'         :{elementId:'pmcui'                   ,uiOrder: 1,type:'fix', note:"remaping 作業管理バーアイコン(新)"},

    'extSign'       :{elementId:"extSig"                  ,uiOrder: 3,type:'fix', note:"拡張署名欄(汎)"},

//inplace-UI-panel xpst editor <app>
    'SheetHdr'     :{elementId:'sheetHeaderTable'        ,uiOrder: -1,type:'fix', note:"remaping シートヘッダ"},
    'docHdUI'      :{elementId:"documentHdUI"            ,uiOrder:  3,type:'fix', note:"ドキュメントヘッダUI(xpsedit)"},
    'docHdr'       :{elementId:"xpsInfoTable"            ,uiOrder: -1,type:'fix', note:"ヘッダ情報テーブル(xpsedit)"},
    'extSig'       :{elementId:"extSig"                  ,uiOrder: -1,type:'fix', note:"ヘッダ拡張署名欄(xpsedit)"},
    'memoArea'     :{elementId:"memoArea"                ,uiOrder: -1,type:'fix', note:"ヘッダXpsメモ欄(xpsedit)"},

    'Data'          :{elementId:"optionPanelData"         ,uiOrder:-1,type:'fix', note:"remaping Import|Export(汎)"},
    'AEKey'         :{elementId:"optionPanelAEK"          ,uiOrder:-1,type:'fix', note:"remaping AEKey"},

//inplace-UI-panel pman|reName|xmap browser  <app>
    'Search'         :{elementId:"optionPanelSearch"       ,sync:"search"         ,uiOrder: 4,type:'fix', note:"reName検索(汎)"},
    'PreviewSize'    :{elementId:"optionPanelPreviewSize"  ,sync:"preview"        ,uiOrder: 4,type:'fix', note:"reNameプレビュー指定UI"},
    'ThumbnailSize'  :{elementId:"optionPanelThumbnailSize",sync:"thumbnail"      ,uiOrder: 4,type:'fix', note:"reNameサムネイルサイズ｜表示UI"},
    'prefix'         :{elementId:"prefixStrip"             ,sync:"prefix"         ,uiOrder: 4,type:'fix', note:"reNameプレフィクスUI"},
    'suffix'         :{elementId:"suffixStrip"             ,sync:"suffix"         ,uiOrder: 4,type:'fix', note:"reNameサフィックスUI"},
    'rename_setting' :{elementId:'rename_setting'          ,sync:"rename_setting" ,uiOrder: 4,type:'fix', note:"reName 操作設定"},
    'flip_control'   :{elementId:'flip_control'            ,sync:"flipControl"    ,uiOrder: 4,type:'fix', note:"reName フリップコントローラ"},
    'flip_seekbar'   :{elementId:'flip_seekbar'            ,sync:"flipSeekbar"    ,uiOrder: 4,type:'fix', note:"reName フリップ再生シークバー"},
    'lightBoxControl':{elementId:'lightBoxControl'         ,sync:"lightBoxControl",uiOrder: 4,type:'fix', note:"reName ライトボックススイッチ"},
    'lightBoxProp'   :{elementId:'lightBoxProperty'        ,sync:"lightBoxProp"   ,uiOrder: 4,type:'fix', note:"reName ライトボックス設定"},
    'UBFilter'       :{elementId:'uafBundleFilter'         ,sync:"UBFilter"       ,uiOrder: 4,type:'fix', note:"reName バンドルフィルタ設定-1"},
    'FNFilter'       :{elementId:'optionPanelFilter'       ,sync:"FNFilter"       ,uiOrder: 4,type:'fix', note:"reName 関数フィルタ設定"},
    'Zoom'           :{elementId:'screenZoom'              ,                       uiOrder: 4,type:'fix', note:"ズーム設定"},
    'Appearance'     :{elementId:'docImgAppearance'        ,                       uiOrder: 4,type:'fix', note:"アピアランス設定"},
//===============
    '_exclusive_items_':{
        type:'exclusive_item_group',
        'remaping'   :['Data','AEKey','Tbx','Sfx','Stg','Cam','ImgAdjust','DocFormat','Ref','Sign','Stamp','Draw','Paint','Item','Scn','File','Snd'],
        'xpsedit'    :["Memo","Data","AEKey"],
        'pman_reName':[]
    }
};
/* {
	"SCI":{"elementId": "optionPanelSCI","type": "modal","note": "Xpsインポートパネル Importer(汎)"},
	"Prog":{"elementId": "optionPanelProg","type": "modal","note": "プログレス表示（汎）"},
	"Scn": {"elementId": "optionPanelScn","type": "modal","note": "Xpsタイムシート情報"},
	"Paint": {"elementId": "optionPanelPaint","uiOrder": -1,"type": "float","note": "手書きメモ(汎)"},
	"Stamp": {"elementId": "optionPanelStamp","uiOrder": -1,"type": "float","note": "スタンプ選択"},
	"Timer": {"elementId": "optionPanelTimer","uiOrder": -1,"type": "fix","note": "ストップウォッチ(汎)"},
	"Sign": {"elementId": "optionPanelSign","uiOrder": -1,"type": "float","note": "署名パネル(汎)"},
	"Snd": {"elementId": "optionPanelSnd","uiOrder": -1,"type": "float","note": "remaping Dialog|Snd"},
	"Ref": {"elementId": "optionPanelRef","uiOrder": -1,"type": "float","note": "remaping 参考画像パネル"},
	"DocFormat": {"elementId": "optionPanelDocFormat","uiOrder": -1,"type": "float","note": "書式編集パネル"},
	"ImgAdjust": {"elementId": "optionPanelImgAdjust","uiOrder": -1,"type": "float","note": "画像調整パネル"},
	"Cam": {"elementId": "optionPanelCam","uiOrder": -1,"type": "float","note": "remaping カメラワーク入力補助パネル"},
	"Stg": {"elementId": "optionPanelStg","uiOrder": -1,"type": "float","note": "remaping ステージワーク入力補助パネル"},
	"Sfx": {"elementId": "optionPanelSfx","uiOrder": -1,"type": "float","note": "remaping コンポジット入力補助パネル"},
	"Tbx": {"elementId": "optionPanelTbx","uiOrder": -1,"type": "float","note": "remaping ツールボックス"},
	"Memo": {"elementId": "optionPanelMemo","uiOrder": -1,"type": "float","note": "Xpsメモ編集(xpsedit)"},
	"ToolBr": {"elementId": "toolbarHeader","uiOrder": 3,"type": "fix","note": "remaping ツールバー"},
	"Utl": {"elementId": "optionPanelUtl","uiOrder": 3,"type": "fix","note": "remaping ユーティリティツール"},
	"headerTool": {"elementId": "headerTool","uiOrder": 1,"type": "fix","note": "remaping シートヘッダツール(カウンタ等)"},
	"inputControl": {"elementId": "inputControl","uiOrder": 1,"type": "fix","note": "remaping 入力コントロール"},
	"account_box": {"elementId": "account_box","uiOrder": 3,"type": "fix","note": "remaping アカウント表示"},
	"pmui": {"elementId": "pmui","uiOrder": 2,"type": "fix","note": "remaping 作業管理バー(旧)"},
	"pmcui": {"elementId": "pmcui","uiOrder": 1,"type": "fix","note": "remaping 作業管理バーアイコン(新)"},
	"appHdBr": {"elementId": "applicationHeadbar","uiOrder": 1,"type": "fix","note": "uat アプリケーションヘッドバー"},
	"SheetHdr": {"elementId": "sheetHeaderTable","uiOrder": -1,"type": "fix","note": "remaping シートヘッダ"},
	"docHdUI": {"elementId": "documentHdUI","uiOrder": 3,"type": "fix","note": "ドキュメントヘッダUI(xpsedit)"},
	"docHdr": {"elementId": "xpsInfoTable","uiOrder": -1,"type": "fix","note": "ヘッダ情報テーブル(xpsedit)"},
	"extSig": {"elementId": "extSig","uiOrder": -1,"type": "fix","note": "ヘッダ拡張署名欄(xpsedit)"},
	"memoArea": {"elementId": "memoArea","uiOrder": -1,"type": "fix","note": "ヘッダXpsメモ欄(xpsedit)"},
	"Data": {"elementId": "optionPanelData","uiOrder": -1,"type": "fix","note": "remaping Import|Export(汎)"},
	"AEKey": {"elementId": "optionPanelAEK","uiOrder": -1,"type": "fix","note": "remaping AEKey"},
	"Appearance": {"elementId": "docImgAppearance","uiOrder": 4,"type": "fix","note": "アピアランス設定"},
	"_exclusive_items_": {
		"type": "exclusive_item_group",
		"remaping": ["Data","AEKey","Tbx","Sfx","Stg","Cam","ImgAdjust","DocFormat","Ref","Sign","Stamp","Draw","Paint","Item","Scn","File","Snd"]
	}
};// */


/*
	このファイルはconfig.jsのアプリ別拡張データ
	config.jsよりもあと　なるべく早いタイミングで実行のこと
*/