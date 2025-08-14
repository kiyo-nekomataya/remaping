﻿/**
 * @file nas_Otome_config.js
 * @overview オートビルド機能のためにＸＰＳ関連の初期化を行なう
 *
 * この設定ファイルは実行コードの一部です。
 * 編集時は十分にご注意ください
 * 2009.10.24
 * @author Nekomataya/kiyo
 */


/**
 * デフォルトのXPSオブジェクト作成
 * @type {number}
 */
var myLayers = 4;//４レイヤ
var myLength = Math.ceil(nas.FRATE * 3);//3秒
XPS = new Xps(myLayers, myLength);

/**
 * @desc オートビルダ用振り分けシステム変数
 *
 * プロジェクト内のファイルフッテ‐ジを検索して条件にマッチしたフッテージをフォルダに分類する
 *
 * システム変数nas.ftgFoldersはアイテム振り分け用の変数です
 * リストにあるフォルダ名のフォルダにあるフッテージは自動で振り分けが行なわれます。
 * ユーザごとにこの変数を追加変更することでサイトごとのチューニングが可能
 *
 * フッテージアイテムフォルダの名称
 * システム予約名である
 * 重複時は先にマッチしたフォルダが処理対象
 * ユーザ変更は可能　ただし各フォルダ名のリストにある先頭の名前がプロジェクト内でのフォルダ名になるので注意
 *    ftgBase    [footages]     フッテージ分類フォルダを格納するフォルダ名。ファイルシステムにこの名前のフォルダがある必要はない。
 *    bg        |- _bg    背景フォルダ "_bg/(BGフォルダ)" 配下にあれば自動登録
 *    etc        |- _etc    各種素材フォルダ。タイムシートはこのフォルダに
 *    frame        |- _frame    フレーム設定フォルダ
 *    lo        |- _lo    レイアウト格納フォルダ　"_lo/(レイアウトフォルダ)"配下にあれば自動登録
 *    paint        |- _paint    セル格納フォルダ　"_paint/(セルフォルダ)"配下にあれば自動登録
 *    sound        |- _sound    (予約)
 *    system        |- _system    (予約)
 *    rough        |- _rough    (予約)ラフ原用
 *    key            |- _key　    (予約)原画用
 *    draw        |- _drawing    (予約)動画用
 *
 * @type {{ftgBase: string[], bg: string[], etc: string[], frame: string[], lo: string[], paint: string[], sound: string[], rough: string[], key: string[], drawing: string[], unknown: string[]}}
 */
nas.ftgFolders = {
    "ftgBase": ["[footages]"]
    , "bg": ["_bg", "_背景", "BG"]
    , "etc": ["_etc", "_timesheet"]
    , "frame": ["_frame", "_フレーム"]
    , "lo": ["_lo", "_レイアウト", "Layout"]
    , "paint": ["_paint", "_セル", "CELL"]
    , "sound": ["_sound"]
    , "rough": ["_rough"]
    , "key": ["_key", "Key\ Animation"]
    , "drawing": ["_drawing", "_draw", "Inbetween"]
    , "unknown": ["_other"]
};

/**
 * @desc ftgFolderを初期化する
 * 順次以前のコードを修正すること
 */
nas.ftgFolders.init = function () {
    this.length = -1;//ftgBaseを除外するために-1から開始
    this.cpRx = [];//比較配列を作る
    this.names = [];//比較現状のフォルダ名配列
    for (var prp in this) {
        if (!( prp.match(/(init|length|cpRx|names)/) )) {
            //各プロパティの正規表現を先に組んでおく
            var myRegStr = this[prp].join("|");
            this.cpRx.push(new RegExp("\(" + myRegStr + "\)", "i"));//正規表現を要素にする
            this.names.push(this[prp][0]);//アイテム名をリストしておく
            this.length++;
        }
    }
};

nas.ftgFolders.init();

/**
 * タイムシート保持用コンポの識別名称
 * @type {string}
 */
nas.sheetBinder = "[timeSheetBinder]";
/**
 * アイテム識別用マーカー
 * @type {{stage: string[], clipWindow: string[], outputMedia: string[]}}
 */
nas.itmFootStamps = {
    "stage": ["(stg)", "//nas-mkStage;"]
    , "clipWindow": ["(clp)", "##nas-mkClipWndow"]
    , "outputMedia": ["(opm)", "##nas-mkOutputMedia"]
};


/**
 * @desc ユーザ変更時は上のテーブルに値を加えてください
 *
 * プロパティ名はそれぞれの素材を分類するこのライブラリ上の識別名です。
 * ｆｔｇFolder    プロジェクト内でフッテージを格納するフォルダアイテム名称（変更非推奨）最後に設定したデータのみ有効
 * 上記以外はそれぞれの素材を格納するファイルシステム上の識別用フォルダ名　ソースファイルの上位フォルダの名前がこの設定と一致していた場合
 * それぞれの素材種別として認識する
 * ｂｇ=背景
 * etc=タイムシート等の画像外リソース
 * frame=撮影指定フレーム
 * lo=レイアウト
 * paint=彩色済みセル（通常フッテージ）
 * sound=音響ファイル（または字幕ファイル？）
 * rough=ラフ原画等モーションスケッチ
 * key=原画
 * drawing=動画
 * フォルダによる分類に失敗したフッテージは彩色済みセルとして扱います
 * プロジェクト内部では配列のもっとも左の名称でフッテージ格納用フォルダアイテムが作成されます。
 */

/**
 * @desc MAPフォルダアイテムの名称
 * システム予約名である
 * プロジェクト内に同名のフォルダか複数ある時は先にマッチしたフォルダが処理対象
 * ユーザ変更は（設定は可能ですが）非推奨
 *        [MAP]
 *            |- [CAMERAWORK]    カメラワークフォルダ（将来の拡張用）
 *            |- [CELL]    セルグループフォルダ
 *            |- [EFFECT]    撮影効果フォルダ（将来の拡張用）
 *            |- [SOUND]    サウンドフォルダ（将来の拡張用）
 *            |- [SYSTEM]    タイムシート（将来の拡張用）
 *
 * @desc システムフォルダデータベース
 * @type {{mapBase: string, cameraWork: string, cell: string, effect: string, sound: string, system: string}}
 */
nas.mapFolders = {
    "mapBase": "[MAP]"
    , "cameraWork": "[CAMERAWORK]"
    , "cell": "[CELL]"
    , "effect": "[EFFECT]"
    , "sound": "[SOUND]"
    , "system": "[SYSTEM]"
};

/**
 * @desc データマッピングを抽象化してnasシステムと整合化するために
 * プリコンポを作成してMapデータを実装するための格納用フォルダ名です。
 * 可能な限り変更は避けてください。
 */

/**
 * インポートフィルタ
 * @type {RegExp}
 */
nas.importFilter = new RegExp(".*\.(mov|mpg|avi|tiff?|tga|psd|png|jpe?g|gif|sgi|eps)$", "i");
/**
 * タイムシート判別フィルタ
 * @type {RegExp}
 */
nas.xpSheetRegex = new RegExp(".*\.(xps|ard|tsh|sts)$", "i");
/**
 * セルシーケンス判定(レイヤソース名に対して適用。
 * $1 がセルラベルになる)これはレイヤ名に対するフィルタ(またはシーケンス名)
 * @type {RegExp}
 */
nas.cellRegex = new RegExp("[\-_\/\s0-9]?([^\-_\/\s\[]*)[\-_\/]?\[[0-9]+\-[0-9]+\]\.(tga|tiff?|png|gif|jpe?g|eps|sgi|bmp)$", "i");
/**
 * 背景・下絵判定
 * @type {RegExp}
 */
nas.bgRegex = new RegExp("(bg|back|背景?|下絵?)", "i");
/**
 * レイアウト、参照画
 * @type {RegExp}
 */
nas.mgRegex = new RegExp("book|fg|mid|mg|fore|fg|[前中]景?|[中上]絵", "i");
nas.loRegex = new RegExp("lo|cf|z\.[io]|t\.?[ub]|sl(ide)?|cam(era)?|fr(ame)?|pan|mill?|(キャ|カ)メラ|フレーム|引き|ヒキ|スライド|組|クミ|くみ", "i");

/**
 * @desc 作画フレームDB
 */

/**
 * PegBarDB(ダミー)
 * "識別名",[[配置座標],テンプレート画像パス,ポイント数,]
 * 作画用紙DB
 */

nas.paperSizes = new nTable();
nas.paperSizes.onChange = function () {
};


nas.paperSizes.push("A4横(297x210)", [297, 210]);
nas.paperSizes.push("A3横(420x297)", [420, 297]);
nas.paperSizes.push("A3縦(297x420)", [297, 420]);
nas.paperSizes.push("B4横(353x250)", [353, 250]);
nas.paperSizes.push("B3横(500x353)", [500, 353]);
nas.paperSizes.push("OLD-STD(268x244)", [268, 244]);
nas.paperSizes.push("OLD-横x2(536x244)", [536, 244]);
nas.paperSizes.push("OLD-縦x2(268x488)", [268, 488]);

/**
 * @desc 作画用レジスターマークDB
 * 実際の描画はテンプレート画像を配置して行うので、対照に注意　テンプレート画像の配置は現在システム固定で lib/resource/Pegs/
 * 各レジスタの原点は画像中央なのでテンプレート画像を作成する場合はその点に注意
 */
nas.registerMarks = new nTable();
nas.registerMarks.onChange = function () {
};

nas.registerMarks.push("3穴トンボ", ["peg3p1.eps"]);//0
nas.registerMarks.push("3穴白抜き", ["peg3p2.eps"]);//1
nas.registerMarks.push("3穴ベタ", ["peg3p3.eps"]);//2
nas.registerMarks.push("2穴トンボ", ["peg2p1.eps"]);//3
nas.registerMarks.push("2穴白抜き", ["peg2p2.eps"]);//4
nas.registerMarks.push("2穴ベタ", ["peg2p3.eps"]);//5


/**
 * @desc 入力メディアDBの本質は作画情報
 *
 * 作画(ソース)データの標準フレーム
 * "識別名",[横幅(mm),フレーム縦横比(文字列),基準解像度(dpi),フレームレート]
 * 何センチのフレームに対してどのくらいの解像度で処理を行なうかが情報のポイント
 * ピクセルアスペクトは入力ファイルごとにことなる可能性があるのでDB上では標準値を1と置き、
 * フッテージに記録のない場合のみ仮の値として使用する
 */

nas.inputMedias = new nTable();
nas.inputMedias.onChange = function () {
    /**
     * メディアがセレクトされたらシステムの解像度とフレームレートを変更する
     */
    if (nas.LENGTH != this.selectedRecord[1]) {
        nas.LENGTH = this.selectedRecord[1]
    }
    if (nas.ASPECT != this.selectedRecord[2]) {
        nas.ASPECT = this.selectedRecord[2]
    }
    var myDPC = this.selectedRecord[3] / 2.540;//解像度をDPCに変換
    if (nas.RESOLUTION != myDPC) {
        nas.RESOLUTION = myDPC
    }
    if (nas.FRATE.rate != this.selectedRecord[4]) {
        nas.FRATE = nas.newFramerate("",this.selectedRecord[4]);
    }

    nas.registerMarks.select(this.selectedRecord[5]);
};

nas.inputMedias.push("254mm/16:9/200dpi", [254, "16/9", 200, 24, 2, 0, 105, 0]);//(AJA)index=0
nas.inputMedias.push("225mm/4:3/144dpi", [225, "4/3", 144, 24, 2, 0, 115, 0]);//(NA) index 1 以下順に増加
nas.inputMedias.push("240mm/4:3/150dpi", [240, "4/3", 150, 24, 2, 0, 120, 0]);//(I.G)
nas.inputMedias.push("265mm/16:9/144dpi", [265, "16/9", 144, 24, 2, 0, 105, 0]);//max
nas.inputMedias.push("240mm/16:9/150dpi", [240, "16/9", 150, 34, 2, 0, 105, 0]);//
nas.inputMedias.push("203mm/16:9/200dpi", [203, "16/9", 200, 24, 2, 0, 105, 0]);//pocopoco
nas.inputMedias.push("260mm/16:9/200dpi", [260, "16/9", 200, 24, 2, 0, 105, 0]);//
nas.inputMedias.push("263mm/16:9/200dpi", [263, "16/9", 200, 24, 2, 0, 104, 0]);//A-1/BONES
nas.inputMedias.push("260mm/16:9/150dpi", [260, "16/9", 150, 24, 2, 0, 105, 0]);//


/**
 * @desc 出力メディアDBの本質はムービー情報
 *
 * 出力メディアDB(ダミー)
 * "識別名",[横幅(px),ライン数,ピクセルアスペクト,フレームレート]
 * どのメディアに対して処理を行なうかが情報のポイント
 * ピクセルアスペクトはメディア限定なので標準値を指定する
 * 逆に線密度には意味がなくなるので記載がない
 */
nas.outputMedias = new nTable();
nas.outputMedias.onChange = function () {

    if (nas.COMP_W != this.selectedRecord[1]) {
        nas.COMP_W = this.selectedRecord[1]
    }
    if (nas.COMP_H != this.selectedRecord[2]) {
        nas.COMP_H = this.selectedRecord[2]
    }
    if (nas.COMP_A != this.selectedRecord[3]) {
        nas.COMP_A = this.selectedRecord[3]
    }
    // if(nas.FRATE!=this.selectedRecord[4]){nas.FRATE=this.selectedRecord[4]};//出力は一般系を切り替えない
};

nas.outputMedias.push("wideSD/24p", [950, 540, 1, 24]);
nas.outputMedias.push("DV", [720, 480, 0.9, 29.97]);
nas.outputMedias.push("DV(wide)", [720, 480, 1.2, 29.97]);
nas.outputMedias.push("HD720/24p", [1280, 720, 1, 24]);
nas.outputMedias.push("HD1080/24p", [1920, 1080, 1, 24]);
nas.outputMedias.push("SD486/24p", [720, 486, 0.9, 24]);
nas.outputMedias.push("SD540/24p", [720, 540, 1, 24]);
nas.outputMedias.push("SD486", [720, 486, 0.9, 29.97]);
nas.outputMedias.push("SD540", [720, 540, 1, 29.97]);
nas.outputMedias.push("VGA/24p", [640, 480, 1, 24]);
nas.outputMedias.push("VGA/30p", [640, 480, 1, 30]);


/**
 * とりあえず暫定
 * 作業タイトルDB(ダミー)
 * @type {nTable}
 */
nas.workTitles = new nTable();

nas.workTitles.push("testTitle", ["test", "tt", 0, 0]);
nas.workTitles.push("ぽこあぽこられんたんど", ["poco a poco rallentando", "PP", 5, 3]);
nas.workTitles.push("かちかち山", ["KachiKachi", "KT", 1, 4]);
nas.workTitles.push("かちかち山Max", ["KachiMax", "ktM", 2, 5]);

nas.workTitles.onChange = function () {
    nas.inputMedias.select(this.selectedRecord[3]);
    nas.outputMedias.select(this.selectedRecord[4]);
};

nas.workTitles.select(0);
//			nas.inputMedias.select(nas.workTitles.selectedRecord[3]);
//			nas.outputMedias.select(nas.workTitles.selectedRecord[4]);

/**
 * @desc セレクトメソッドで選択
 *
 * 上記のDBは最後に登録したものがカレントになっています。
 * 自分の必要なものを追加してご使用ください
 */

/**
 * 振り分けフラグ　スイッチがオンのときは不明フッテージを不明フォルダに仕分ける
 * @type {boolean}
 */
nas.dividerOptionUnknown = true;
/**
 * レイアウトの表示方法
 * @type {Object}
 */
nas.viewLayout = {};//あとで配置を考えるこのオブジェクトは仮
nas.viewLayout.MODE = BlendingMode.MULTIPLY;//列挙子を記入
nas.viewLayout.RATIO = 75;// (%)
nas.viewLayout.visible = false;//
nas.viewLayout.guideLayer = true;//

/**
 * セルの自動処理オプション
 * @type {boolean}
 */
nas.goClip = true;
nas.killAlpha = false;
nas.goSmooth = false;
nas.smoothClip = false;

nas.cellOptions = new nTable();
nas.cellOptions.push("OLM-smoother", ["OLM Smoother", ["Use Color Key", "\/\/\-\-otome\ cellClip\-\-\n1;", "Color Key", "\/\/\-\-otome\ cellClip\-\-\nthis.value;"]]);
nas.cellOptions.push("kp-smooth", ["smooth", ["range", "\/\/\-\-otome\ cellClip\-\-\n1.0;", "white option", "\/\/\-\-otome\ cellClip\-\-\n1;"]]);
nas.cellOptions.push("kp-antiAlias", ["KP AntiAliasing", ["Range", "\/\/\-\-otome\ cellClip\-\-\n20;"]]);

nas.cellOptions.select(0);//初期値

//=============================================================以上オートビルダのための変数ユーザ編集可能
