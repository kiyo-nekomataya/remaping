/**
 * @fileoverview nas ユーザ設定ファイル
 * 新規作成時の標準値になります。
 * 説明を読んでお好きな値に書き換えて下さい。
 * 一部の情報は、クッキーで保存可能(予定)です。
 *
 * 2005/04/06
 * 2005/04/28    デバッグフラグ追加(そのうちなくなるかもね)
 * 2005/08/09    クッキー調整
 * 2005/08/25    cssに合わせて背景色を追加
 * 2005/09/01    クッキー内容追加
 * 2005/09/04    クッキー内容追加/修正
 * 2005/10/17    タイトル装飾追加
 * 2005/12/11    読み込み時データシフトスイッチの動作を変更
 * レンダー乙女用に別ファイルを作成 2006/01/07
 * HTML依存部分・クッキー関連部分等は削除
 */

/**
 * デバッグモード
 * @type {boolean}
 */
var dbg = true;

/**
 * 開始メッセージ
 * お好きなメッセージに入れ替えできます。
 * ただし開始メッセージが抑制されている場合は表示されません。
 * @type {string}
 */
var welcomeMsg = "ライブラリ統合中　−−注意ーー　!";


/**
 * 作業オプション 主にデフォルト値
 */


/**
 * タイトル 現行の作品名を入れておくとラクです
 * @type {string}
 */
var myTitle = "タイトル未定";

/**
 * サブタイトル 同上
 * @type {string}
 */
var mySubTitle = "サブタイトル未定";
/**
 * 制作話数等
 * @type {string}
 */
var myOpus = "第  話";
/**
 * 初期フレームレートを置いてください。フレーム毎秒
 * @type {number}
 */
var myFrameRate = 29.97;
/**
 * カット尺初期値
 * @type {string}
 */
var Sheet = "6+0";

/**
 * レイヤ数初期値
 * @type {number}
 */
var SheetLayers = 5;

/**
 * A.Bパート等。空白でも良いでしょう。
 * @type {string}
 */
var myScene = "";

/**
 * カット番号
 * @type {string}
 */
var myCut = "C# ";


/**
 * 作業ユーザ名は環境確認で設定切り替え    *cookie[2]
 */
if (typeof app != "undefined") {
    var myName = "unNameed";
} else {
    var myName = (function () {
        var myName = (Folder.desktop.parent.fsName).replace(/[\/\\]/g, ",").split(",");
        myName = myName[myName.length - 1];
        return myName
    })();
}

/**
 * NameCheckを有効にすると起動時に名前を入力するプロンプトがでます。
 * 名前は保存できます。
 * @type {boolean}
 */
var NameCheck = true;


//////////////////////////////////////////////
/**
 * キー変換オプション    *cookie[3]
 */


/**
 * カラセル方式デフォルト値
 * "file",        カラセルファイル
 * "opacity",    不透明度で処理
 * "wipe",        ワイプで処理
 * "expression1"    エクスプレッションで処理
 * "expression2"    エクスプレッションで処理
 * @type {string}
 */
var BlankMethod = "opacity";

/**
 * カラセル位置デフォルト値
 *    "build",    自動生成(現在無効)
 *    "first",    最初
 *    "end",        最後
 *    "none"        カラセルなし
 *
 * @type {string}
 */
var BlankPosition = "end";


/**
 * AEバージョン 4.0 5.0
 * 現在 6.0 / 6.5 は非対応 こっそり対応開始
 * AE に下位互換性があるので5.0をつかってください
 * @type {string}
 */
var AEVersion = "8.0";

/**
 * AEキータイプ
 *    "min"    キーの数が最少
 * (自分で停止にする必要がある)
 * "opt"    最適化
 * (変化点の前後にキーをつける)
 * "max"    最大
 * (すべてのフレームにキーをつける)
 * @type {string}
 */
var KEYMethod = "min";

/**
 * AEキー取り込みの際0.5フレームのオフセットを自動でつける
 * true    つける(標準)
 * false    つけない
 * @type {boolean}
 */
var TimeShift = true;

/**
 * フッテージのフレームレート
 * "auto"    コンポのフレームレートに合わせる
 * 数値    指定の数値にする
 * @type {string}
 */
var FootageFramerate = "auto";

/**
 * コンポサイズが指定されていない場合の標準値
 * "横,縦,アスペクト"
 * UIオプション(乙女用)
 * @type {string}
 */
var defaultSIZE = "640,480,1";

/**
 * カウンタタイプ
 * @type {number[]}
 */
var Counter0 = [4, 0];

var SheetLength = 6;
//タイムシート1枚の秒数
//	どう転んでも普通６秒シート。でも一応可変。
//	2列シートを使う時は偶数の秒数がおすすめ。

/**
 * 現在は　"en""ja"のみ　有効
 * @type {string}
 */
var uiLocale = "en";

if (false) {
    /**
     * シートオプション    *cookie[4]
     */

    /**
     * スピン量初期値
     * @type {number}
     */
    var SpinValue = 3;

    /**
     * 選択範囲指定でスピン量の指定を行うか
     * @type {boolean}
     */
    var SpinSelect = true;

    /**
     * シートの列数。
     * シート秒数を割り切れる数を置いて下さい。
     * 実際問題としては１または２以外は
     * 使いづらくてダメだと思うよ。
     * @type {number}
     */
    var SheetPageCols = 2;

    /**
     * 足跡機能
     * 使う=true / 使わない=false
     * @type {boolean}
     */
    var FootMark = true;

//---

    /**
     * カウンタタイプ    *cookie[5]
     * @type {number[]}
     */
    var Counter0 = [3, 0];

    /**
     * カウンタのタイプ
     * [表示形式,開始番号]
     * @type {number[]}
     */
    var Counter1 = [5, 1];

    //カウンタのタイプは、5種類。いずれかを数字で
    //	type 1	00000
    //	type 2	0:00:00
    //	type 3	000 + 00
    //	type 4	p 0 / 0 + 00
    //	type 5	p 0 / + 000
    //開始番号は、0 または 1

//--

//---ユーザインターフェースオプション	*cookie[6]


    /**
     * スピンループ・カーソルループ
     * する=true / しない=false
     * @type {boolean}
     */
    var SLoop = false;
    var CLoop = true;

    /**自動スクロール
     * する=true / しない=false
     * @type {boolean}
     */
    var AutoScroll = true;

    /**
     * TSX互換機能を使うか
     * @type {boolean}
     */
    var TSXEx = false;

    /**
     * TMS互換機能を使うか?この機能はまだありません
     * @see http://www.nekora.main.jp/
     * @type {boolean}
     */
    //var TMSEx    =false;

    /**
     * ブラウザの互換変数
     */
    if (navigator == undefined) {
        var MSIE = false;
    }
////////////
    /**
     * サブセパレータの間隔
     * @type {number}
     */
    var SheetSubSeparator = 6;

    /**
     * ツールボックスの「よく使う文字」のエントリ
     * * は、現在の内容(現在無効)
     * # は、現在の数値 と置き換えられます。(現在無効)
     * @type {string[]}
     */
    var FavoriteWords = ["X", "", "カラ", "→", "←", "移動", "↑", "｜", "↓", "∥", "___", "----", "[#]", "(#)", "<#>", "[*]", "(*)", "<*>"];
}


/**
 * クッキーで保存する情報
 * true の情報を保存します。保存したくない情報は、false にしてください。
 * 情報の種類にしたがってクッキーで保存する情報と保存したくない情報を
 * 選んでください。
 * 記録しなかった情報はこのファイルの設定に従います。
 * どの情報も使用中に切り替え可能です。
 */
if (false) {
    /**
     * クッキーを使う場合は"true"にしてください。
     * @type {boolean[]}
     */
    var useCookie = [true];
    /**
     * クッキーの期限
     * 0        ゼロ > そのセッション限り
     * 日数    数値を与えると、最後に使った日からその日数の間有効
     * @type {number}
     */
    useCookie.expiers = 3;
    /**
     * [0]    ウィンドウサイズの記録と復帰
     * @type {boolean}
     */
    useCookie.WinSize = true;
    /**
     * [1]    最後に編集したシートの尺数。レイヤ数などを記録するかどうか?
     * @type {boolean}
     */
    useCookie.XPSAttrib = true;
    /**
     * [2]    最後に作業したユーザ名
     * @type {boolean}
     */
    useCookie.UserName = true;
    /**
     * [3]    キー変換オプション
     * @type {boolean}
     */
    useCookie.KeyOptions = true;
    /**
     * [4]    シートオプション
     * @type {boolean}
     */
    useCookie.SheetOptions = true;
    /**
     * [5]    カウンタ種別
     * @type {boolean}
     */
    useCookie.CounterType = true;
    /**
     * [6]    ユーザインターフェース
     * @type {boolean}
     */
    useCookie.UIOptions = true;
}
/**
 * この設定ファイルは、Javascriptのソースです。書き換えるときはご注意を
 * エラーが出た時のためにバックアップをお忘れ無く。
 */