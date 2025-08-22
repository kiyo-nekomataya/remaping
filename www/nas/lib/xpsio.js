/**
 * @fileoverview    nas.Xps(Animation Timesheet)ライブラリ
 * @author      nekomataya kiyo@nekomataya.info
 * @requires    nas_common nas.Pm.pmdb
 * 250717
 */
'use strict';
/*=======================================*/
// load order:8
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config  = require('./nas_common').config;
    var appHost = require('./nas_common').appHost;
    var nas     = require('./mapio').nas;
//    var xMap    = nas.xMap;
};
//if(typeof nas == 'undefined') var nas = {};
/*
 * 2007.04.03 エラーメッセージ分離
 * 2013.04.02 外部フォーマット解析部分分離
 * 2015.06.12 Xps及びMap関連オブジェクトをnas.配下に移動
 * 2016.04.15 psAxe系とりまぴん系のマージ
 * 2016.08.20 データ構造の変更nas.Xps.layersとnas.Xps.xpsBodyをnas.Xps.xpsTracksに統合
 * 2016.12.01 オブジェクトに Line/Stage/Jobのプロパティを増設パーサと出力も対応
 * 2021.03.15 作業サインの増設
 * Xpsオブジェクト初期化手順
 * Xpsオブジェクトの新規作成
 * コンストラクタ
 * eg.
 * myXPS=new Xps([layer count][,frame length]);//旧処理
 * myXPS=new nas.Xps([layer count][,frame length]);//こちらに移行予定
 *
 * Xpsクラスオブジェクトコンストラクタ
 *
 * 引数は、省略可能。
 * 省略時はレイヤ数4，フレーム数その時点のフレームレートで１秒分
 * セルの初期値は全て""(ヌルストリング)
 * マップの設定はなし(ダミーマップも参照していない)
 *
 * このオブジェクトはフレーム優先。
 * フレームレートを変えるとコマうちが変わるのではなく、カットの継続時間が変わる。
 * アニメーターの振ったコマ打ち優先
 *
 *
 * XPSオブジェクトの再初期化
 *
 * method    [object nas.Xps].init([int trackcount(layerCount)][,int frames])
 * 自分自身を再初期化する。
 * すべてのプロパティをリセット
 * 指定されたレイヤ数とフレーム長で空の値のテーブルを作成する。
 * 以前のデータは消去。new_XPSは、内部でこのメソッドを呼ぶ。
 *
 * 現在の継続時間を返す
 * method    [object nas.Xps].duration()
 * このメソッドは、プロパティに変更予定
 *
 * 現在のカット尺を返す
 * method    [object nas.Xps].time()
 * このメソッドは、プロパティに変更予定
 *
 * カット尺をフレーム数で返す
 * method    [object nas.Xps].getTC(フレーム数)
 * 暫定メソッド、消えそう
 *
 * テキスト形式データを読み込んでオブジェクトに反映
 * method    [object nas.Xps].readIN(テキストデータ)
 * parseXpsのラッパとして残置
 *
 * method    [object nas.Xps].parseXps(xpsStreamText)
 * 与えられたテキストストリームをパースしてオブジェクトを再初期化する
 * 現在のプロパティはすべて破棄
 * 戻値:取り込み成功時にtrue/失敗の際はfalse
 * テキスト形式で出力
 * method    [object nas.Xps].toString(セパレータ)
 * そのうち拡張
 * と思っていたが、コンバータは別立てにしてXpsオブジェクトの汎用性を高めるが吉
 *
 * method    [object nas.Xps].mkAEKey(レイヤID)
 * モードよっては不要ぽい
 * 同上
 *
 * オブジェクトメソッド一覧
 *
 * nas.Xps.newLayers= function(layerCount)://レイヤプロパティトレーラを作成して返す（削除されました）
 * nas.Xps.newTracks= function(TrackCount);//タイムシートの本体オブジェクトを作成して戻す
 */
/**
 * object nas.Xps(汎用アニメーションタイムシート)日本形式のタイムシート記述クラスを提供
 * @class 
 *   汎用アニメーションタイムシートクラス
 * 
 * @params {Number | Array | Object SheetLooks |Object TrackSpec|Object SheetLooks} Layers
 *  Number  タイムライントラックのうちデフォルトのダイアログ(1)を抜いた数 (旧コード互換)
 *  Array   スカラーを要素とする配列 [dialog,cell,camera,stage,composite] と解釈される
 *  Object  TrackSpec  trackSpec配列を要素とする配列 [[tracktypeString, trackCount, optiontext],...]
 *  Object  SheetLooks trackSpec配列データを含む書式オブジェクト
 *  無指定の場合は、標準のSheetLooksが補われる
 * @params {Number} Length
 *  無指定の場合は、タイムシート記述継続長（フレーム数）で初期化 ドキュメントフォーマットの書類一枚分（デフォルト6秒）
 * @params {Object nas.Framerate or Number} framerate
 *  framerate フレームレート  fps
 *  無指定の場合は、ドキュメントフォーマットの値
 * @params {Object xMap | String identifier} xmap
 *  リンクを作成するxMapまたはカット記述子文字列<省略可>
 * @params {String} nodepath
 *  タイムシートの所属するノードパス 指定する場合は上記のxMapのノードチャートに含まれる必要がある<省略可>
 *
 *     Xpsオブジェクトの初期化引数を拡張
 * 第一引数はかつて「レイヤ数」であったが、これを拡張して配列または指定オブジェクトを受け取れるようにする
 * 引数がスカラの場合は、従来互換として「リプレースメントトラック数」とする
 *
 * 各要素がスカラの配列であった場合は、要素数により以下の解決を行う
 * 
 * [リプレースメントトラック数]
 * [ダイアログトラック数,リプレースメントトラック数]
 * [ダイアログトラック数,リプレースメントトラック数,カメラワークトラック数]
 * 
 * 配列長が1の場合は、特例でリプレースメントトラック数とする
 * ダイアログトラック数は、1以上とする
 * これに1以下の値が与えられた際は1として初期化される。
 * 
 * 完全な指定を行う場合は、引数としてtrackspec配列またはtrackspec配列を配下に含むオブジェクトSheetLooksを渡す
 * 例:トラックスペック配列
 * {
 *  "trackSpec":[
 *     ["timecode"   ,1,"fix"],
 *     ["reference"  ,7,"fix"],
 *     ["dialog"     ,1,"fix"],
 *     ["still"      ,1,""],
 *     ["replacement",2,""],
 *     ["still"      ,1,""],
 *     ["replacement",2,""],
 *     ["camera"     ,1,""],
 *     ["replacement",2,""],
 *     ["effects"    ,1,""],
 *     ["stage"      ,2,""],
 *     ["comment"    ,1,"hide"]
 *  ]
 *}
 *  各トラックの出現順位置・回数は任意
 *  スクロール時の固定列は第２要素に"fix"を置く
 *  fixトラックがないのは許容されるが望ましくない
 *  timecode,referenceはシステム管理トラックでありXpsデータ内には、実際の対応するトラックがない
 *  冒頭は基本的にdialig|soundで1以上の値にすること。そうでない場合は["dialog",1,"fix"]が補われる。
 *  末尾プロパティはcommentで値1とすること
 *  末尾プロパティがcommentでない場合には["comment",1,""]が補われる
 *  コメントトラックは、レコードの終端フィールドにあたり、トラック数は1で固定される
 *
 *   xmap引数は、参照先のxmapオブジェクトまたはxmapをポイントした識別子を与える
 *   Title#
 *   オブジェクトの場合直接参照を行う
 *   識別子の場合は、現&&同リポジトリ内の識別子相当xmapを求める
 *   存在しない場合は識別子で初期化した新規xMapオブジェクトを使用する
 *   引数自体がない場合は、諸情報の無い初期状態のxMapを使用する
 * 
 *   xMapありのデータ初期化後は、Xps全体がxMapの持つpmuの管理下に入る
 *   保存時には、当該のxMapデータの一部としてリポジトリに対しての保存が行われる
 *   エクスポートの際は、旧来のプロパティを参照せずpmuの持つプロパティを複製して書き出しが行われる
 *        ＊＊＊ Xpsの単独データはManagementNode一つに対応する　ノードパスで特定可能
 *   xps 上でのpmu編集は、すべてxmapに対して行われ、xpsのプロパティに対する転記は保存時のみ発火する？
 *   
 *   nodepath引数はxmap上の新規ノードを作成するラインを指定する文字列
 *      "1-1:(美術３D)."
 *      "1."
 *   等 省略時は、本線新規ノード
 *   タイムシートトラックの編集はアセットエレメントの編集に相当する
 *   同期はトラックパースの際にマージの形で発生する
 *
 *  headMargin,tailMargin を実装
 *      両マージンは任意設定
 *      トランジションの半長は、head|tailMarginに含まれる
 *      トランジションが設定された場合のマージンは、超過分が自動でくりこまれる
 *  sheetImage noteImage を実装
 */
nas.Xps = function Xps(Layers, Length, Framerate, xmap, nodepath){
    this.XpsFormatVersion = 'nasTIME-SHEET 0.9w mobile extension test';//プロパティ化 2023 02
/*初期プロパティ*/
    this.id             = nas.uuid();//ユニークインデックス
    this.xMap           = null      ;//カットの所属するトレーラー
    this.pmu            = null      ;//カットの情報を保持するモジュール化オブジェクト
    this.management     = null      ;//管理ロックフラグ ロックの際は nas.UserInfoを配置
    this.timestamp      = 0         ;//タイムスタンプ Unix time値  初期値 0 読出・保存のタイミングで更新
    this.dataNode       = undefined ;//標準でundefined 登録時にリポジトリの所在を記録する xMapと同期が必要

/* 2022 12拡張
マスターデータとして画像を記録可能にする拡張に伴い Xpstデータに タイムシートの外見を記録するように変更
プロパティ名称は nas.Xps.sheetLooks
これはタイムシートの書類としての外見を保持するプロパティとなる
クラスを初期化の際は、オブジェクトの初期化手順を踏むこと
 */
    this.sheetLooks     = JSON.parse(JSON.stringify(nas.Xps.DocumentFormat)) ;//初期値
    this.documentMode   = 'pageImage';//pageImage|page(WordProp)|scroll(Compact)
//    this.parent;//親Xps参照用プロパティ初期値は undefined（参照無し）
/*
    XpsのstageオブジェクトはxMap共用のPm.Issueオブジェクトと置換する
    Issueオブジェクトの文字列化メソッドは標準でxMap記録文字列
    オプションでXps文字列・カット識別子文字列の切り替え
 */
/*
 * 以下 this.pmuと同期が必要 変更時は参照して再同期
 *
 */
    var currentFlow = nas.pmdb.pmWorkflows.entry('%default%');
    if(currentFlow){
        this.line  = new nas.Xps.XpsLine(
            '('+
            currentFlow.entry('%default%').line.toString()+
            '):0'
        );
        this.stage = new nas.Xps.XpsStage(
            currentFlow.entry('%default%').stages.entry('%default%').toString()+
            ':0'
        );
        
    }else{
        this.line  = new nas.Xps.XpsLine('(trunk):0');
        this.stage = new nas.Xps.XpsStage('startup:0');
    }
    this.job   = new nas.Xps.XpsJob('[init]:0');
    this.currentStatus = new nas.Xps.JobStatus();

    this.mapfile = "";//旧コード互換 削除予定

    this.opus      = '';//this.pmu.opus;
    this.title     = '';//this.pmu.title.toString();
    this.subtitle  = '';//this.pmu.subtitle;
    this.scene     = '';//this.pmu.scene;
    this.cut       = '';//this.pmu.cut;
    this.inherit   = '';//this.pmu.inherit(文字列化);
    this.trin      = new nas.ShotTransition('trin');
    this.trout     = new nas.ShotTransition('trout');
    this.headMargin   = 0;//カット開始前マージンフレーム Int frames
    this.tailMargin   = 0;//カット終了後マージンフレーム Int frames
//フレームレートはsheetLooksの値を優先で連動
    this.framerate = new nas.Framerate(this.sheetLooks.FrameRate);
    this.rate = this.framerate.toString(true); //互換維持のため残置 順次削除

    var Now = new Date();
    this.create_time = Now.toNASString();
    this.create_user = ((xUI)&&(xUI.currentUser))? xUI.currentUser:new nas.UserInfo(config.myName);
    this.update_time = Now.toNASString();
    this.update_user = ((xUI)&&(xUI.currentUser))? xUI.currentUser:new nas.UserInfo(config.myName);

//オブジェクトコレクション設定
//シグネチャトレーラー
    this.signatures  = new nas.UserSignatureCollection();
//タイムシートフォーマット
//    this.sheetLooks   = {};//new nas.Xps.SheetLooks();
//タイムシート画像
    this.timesheetImages  = new nas.NoteImageCollection();
    this.noteImages       = new nas.NoteImageCollection();
    this.noteImages.imageAppearance = 1;
//ドキュメント画像マスターセッション間フラグ if true image master data
//    this.imgMaster    = false;
//状態取得関数として実装 定数扱いにしない

// タイムライントラックコレクション配列初期化
// コレクションの初期化で同時にシートメモが空文字列で初期化される
console.log(this.sheetLooks);
    this.xpsTracks  = this.newTracks(
        this.sheetLooks.trackSpec,
        nas.FCT2Frm(this.sheetLooks.PageLength,new nas.Framerate(this.sheetLooks.FrameRate))
    );
//console.log('Object constractor XPS:')
//console.log(Array.from(this.xpsTracks,(e)=> e.option));
//if(dbg) console.log(this.xpsTracks);
    if(arguments.length) this.init(Layers, Length, Framerate, xmap, nodepath);

//編集可能プロパティリスト
    this.exList = {
"*"              :{ get:"toString", put:"parseXps"},
"id"             :{ get:"toString", put:"direct"},
"xMap"           :{ get:"toString", put:"parsexMap"},
"timestamp"      :{ get:"toString", put:"direct"},
"dataNode"       :{ get:"toString", put:"direct"},
"currentStatus"  :{ get:"toString", put:"parse"  ,},
"opus"           :{ get:"toString", put:"direct" ,sync:"this.syncPmuProps"},
"title"          :{ get:"toString", put:"direct" ,sync:"this.syncPmuProps"},
"subtitle"       :{ get:"toString", put:"direct" ,sync:"this.syncPmuProps"},
"inherit"        :{ get:"toString", put:"direct" ,sync:"this.syncPmuProps"},
"scene"          :{ get:"toString", put:"direct" ,sync:"this.syncPmuProps"},
"cut"            :{ get:"toString", put:"direct" ,sync:"this.syncPmuProps"},
"trin"           :{ get:"toString", put:"parse"  ,sync:"this.syncPmuProps"},
"trout"          :{ get:"toString", put:"parse"  ,sync:"this.syncPmuProps"},
"headMargin"     :{ get:"toString", put:"direct" },
"tailMargin"     :{ get:"toString", put:"direct" },
"signatures"     :{ get:"toString", put:"parse"},
"sheetLooks"     :{ get:"toString", put:"parse"  ,sync:"this.syncSheetLooks"},

"framerate"      :{ get:"toString", put:"parse"  ,sync:"this.syncSheetLooks"},

"rate"           :{ get:"toString", put:"direct"},
"mapfile"        :{ get:"toString", put:"direct"},

"timesheetImages":{ get:"toString", put:"parse"},
"noteImages"     :{ get:"toString", put:"parse"}

    };
/*
以下はputメソッドでの変更を禁止
"line"         :{ get:"toString", put:"parse"},
"stage"        :{ get:"toString", put:"parse"},
"job"          :{ get:"toString", put:"parse"},
"create_time"  :{ get:"toString", put:"direct"},
"create_user"  :{ get:"toString", put:"parse"},
"update_time"  :{ get:"toString", put:"direct"},
"update_user"  :{ get:"toString", put:"parse"},
 */
}
//==================== Object nas.Xps//

/*
Xpsをフルスペックに拡張するための基礎情報
区間パースに必要な予約語の設定
クラスプロパティに設定

dialog
    ダイアログセクション開ノード
    ダイアログセクション閉ノード
sound
    サウンドセクション開ノード
    サウンドセクション閉ノード
still
    静止画用トラック
cell
timing
replacement
    プロパティサイン原画、原画アタリ（参考）、中間値補間サイン、ブランクサイン
camera
camerawork
    抽象化された撮影指定トラック
    区間プロパティ 区間プレフィックス　区間ポストフィックス　抽象化（symbol）DB
geometry
stage
stagework
    セクション開ノード
    セクション閉ノード
    中間値補間サイン
effect
sfx
composite
    セクション開ノード
    セクション閉ノード
    中間値補間サイン
comment
    レコード終端予約トラック
reference
    リファレンストラックエリア予約キーワード
    自由記述テキストトラック
    １エリアのみ有効
    トラック数任意
tomecode
    タイムコード予約キーワード
    複数エリア有効
    １トラック限定
    他のエリアに依存
action
tracknote
    自由記述テキストトラック
*/

if((config)&&(config.SheetLooks)){
    nas.Xps.DocumentFormat = config.SheetLooks;
}else if(typeof SheetLooks == "object"){
    nas.Xps.DocumentFormat = SheetLooks;
}else{
    nas.Xps.DocumentFormat = {
    "FormatName"    :"remaping",
    "TemplateImage" :"/remaping/template/timeSheet_default.png",
    "WorkTitleLogo" :"",
    "HeaderMarginTop"   :36,
    "HeaderMarginLeft"  :50,
    "HeaderBoxHeight"   :65,
    "headerItemOrder"   :[
        ["title",350],
        ["ep",110],
        ["sci",160],
        ["time",160],
        ["user",130],
        ["page",120]
    ],
    "HeaderSign"    :[28,100,1000,140],
    "HeaderNote"    :[28,140,1000,256],
    "SheetTextColor":"#111111",
    "SheetBaseColor":"#ffffef",
    "AppBaseColor"  :"#ffffef",
    "SelectedColor" :"#9999ff",
    "RapidModeColor":"#ffff44",
    "FloatModeColor":"#88eeee",
    "SectionModeColor":"#ff44ff",
    "SelectionColor":"#f8f8dd",
    "FootStampColor":"#ffffff",
    "EditingColor"  :"#eebbbb",
    "SelectingColor":"#ccccaa",
    "Restriction"   :false,
    "ViewMode"      :"page",
    "PageLength"    :144,
    "FrameRate"     :"24fps(24)",
    "SheetColumn"   :2,
    "CellWidthUnit" :"px",
    "SheetHeadMargin"   :344,
    "SheetLeftMargin"   :57,
    "SheetCellHeight"   :17,
    "SheetColHeight"    :1224,
    "TimeGuideWidth"    :15,
    "ActionWidth"       :16,
    "DialogWidth"       :36,
    "SoundWidth"        :36,
    "SheetCellWidth"    :25,
    "SheetCellNarrow"   :4,
    "StillCellWidth"    :12,
    "GeometryCellWidth" :52,
    "SfxCellWidth"      :46,
    "CameraCellWidth"   :30,
    "CommentWidth"      :30,
    "TrackNoteWidth"    :30,
    "ColumnSeparatorWidth":19,
    "trackSpec":[
        ["reference"    ,7,"fix"],
        ["dialog"       ,1,"fix"],
        ["timecode"     ,1,"fix"],
        ["replacement"  ,7,""],
        ["camera"       ,3,""],
        ["comment"      ,1,""]
    ]
    };
};

nas.Xps.TrackProperties=[
    "dialog","sound",
    "cell","timing","replacement","still",
    "camerawork","camera","geometry","stage","stagework",
    "effect","sfx","composite",
    "comment","tracknote","reference","action","timecode"
];
nas.Xps.TrackPropRegex=new RegExp(nas.Xps.TrackProperties.join("|"),"i");

/*
 *	nas.Xps.sheetLooks.xpsTracksの配置とXps.sheetLooksからエリアを導く
 *エリアを形成するトラック
 *	reference,
 *	action,
 *	dialog,sound,
 *	cell,timig,replacement
 *	camera,cam,
 *	stagework,
 *	composite,
 *必ず単独でエリアを形成するトラック
 *	comment
 *単独ではエリアを作らないトラック
 *	tracknote
 *	timecode
 */
//トラック重ね順を支配するドキュメントタイプを確定
//ドキュメントタイプは、レイヤーの重ね順を規定する
nas.Xps.DocumentType = "jp";//"jp"|"us"

//トラックオプションからエリアタイプを得る対照テーブル
nas.Xps.AreaOptions = {
		"dialog"     :"dialog",
		"sound"      :"dialog",
		"cell"       :"replacement",
		"timing"     :"replacement",
		"replacement":"replacement",
		"still"      :"replacement",
		"cam"        :"camera",
		"camera"     :"camera",
		"stagework"  :"camera",
		"stage"      :"camera",
		"geometry"   :"camera",
		"sfx"        :"camera",
		"effect"     :"camera",
		"composite"  :"camera",
		"tracknote"  : false,
		"timecode"   : false,
		"reference"  :"reference",
		"action"     :"action",
		"comment"    :"comment"
	};

//トラックオプションとSheetLooks変数の対照テーブル
nas.Xps.TrackWidth = {
		"dialog"     :"DialogWidth",
		"sound"      :"SoundWidth",
		"cell"       :"SheetCellWidth",
		"timing"     :"SheetCellWidth",
		"replacement":"SheetCellWidth",
		"still"      :"StillCellWidth",
		"cam"        :"CameraCellWidth",
		"camera"     :"CameraCellWidth",
		"stagework"  :"GeometryCellWidth",
		"stage"      :"GeometryCellWidth",
		"geometry"   :"GeometryCellWidth",
		"sfx"        :"SfxCellWidth",
		"effect"     :"SfxCellWidth",
		"composite"  :"SfxCellWidth",
		"tracknote"  :"TrackNoteWidth",
		"timecode"   :"TimeGuideWidth",
		"reference"  :"ActionWidth",
		"action"     :"ActionWidth",
		"comment"    :"CommentWidth"
	};
//トラックオプションとシートセルCSSの対照テーブル
nas.Xps.TrackClass = {
		"dialog"     :"dialogSpan",
		"sound"      :"dialogSpan",
		"cell"       :"timingSpan",
		"timing"     :"timingSpan",
		"replacement":"timingSpan",
		"still"      :"stillSpan",
		"cam"        :"cameraSpan",
		"camera"     :"cameraSpan",
		"stagework"  :"geometrySpan",
		"stage"      :"geometrySpan",
		"geometry"   :"geometrySpan",
		"sfx"        :"sfxSpan",
		"effect"     :"sfxSpan",
		"composite"  :"sfxSpan",
		"tracknote"  :"timinSpan",
		"timecode"   :"tcSpan",
		"reference"  :"referenceSpan",
		"action"     :"referenceSpan",
		"comment"    :"framenoteSpan"
	};
//track option header Class  xpsio.jsとremaping.js二重登録なので解決が必要
                var trackHeaderClass = {
                    "action"     :"referenceSpan",
                    "tracknote"  :"tracknoteSpan",
                    "dialog"     :"dialogSpan",
                    "sound"      :"dialogSpan",
                    "still"      :"stillSpan",
                    "effect"     :"sfxSpan",
                    "composite"  :"sfxSpan",
                    "sfx"        :"sfxSpan",
                    "stage"      :"geometrySpan",
                    "stagework"  :"geometrySpan",
                    "geometry"   :"geometrySpan",
                    "camerawork" :"cameraSpan",
                    "camera"     :"cameraSpan",
                    "cell"       :"timingSpan",
                    "replacement":"timingSpan",
                    "timing"     :"timingSpan",
                    "reference"  :"referenceSpan",
                    "action"     :"referenceSpan",
                    "comment"    :"framenoteSpan"
                };
//track option labes class  xpsio.jsとremaping.js二重登録なので解決が必要
                var trackLabelClass = {
                    "timecode"   :"tclabel",
                    "tracknote"  :"tracknotelable",
                    "dialog"     :"dialoglabel",
                    "sound"      :"soundlabel",
                    "still"      :"stilllabel",
                    "effect"     :"sfxlabel",
                    "composite"  :"sfxSpan",
                    "sfx"        :"sfxSpan",
                    "stage"      :"geometryArea",
                    "stagework"  :"geometryArea",
                    "geometry"   :"geometryArea",
                    "camerawork" :"camArea",
                    "camera"     :"camArea",
                    "cell"       :"editArea",
                    "replacement":"editArea",
                    "timing"     :"editArea",
                    "reference"  :"rnArea",
                    "action"     :"rnArea",
                    "comment"    :"framenoteSpan"
                };

/**
 *    ドキュメントのマスターデータが画像か否かを返す
 *      トラックの入力が０でかつドキュメントイメージが存在する場合のみtrue
 *      引数なし
 *  この関数は、ほぼ意味がないので削除予定
 画像の編集状態は、アプリのUIの状態に帰する
 画像カウントは必要なので、コレクションの合計を返す関数を作成する
 */
/*
nas.Xps.prototype.imgCount = function (){
//return ((this.xpsTracks.countStr() == 0)&&(this.timesheetImages.members.length > 0))? true:false;
return (this.timesheetImages.members.length + this.noteImages.members.length);
};// */
nas.Xps.prototype.imgMaster = function (){ return ((this.xpsTracks.countStr() == 0)&&(this.timesheetImages.length))? true:false;};
/**
 * 新規タイムライントレーラを作成
 * 固定のダイアログタイムライン及びフレームコメントタイムラインがある。
 * この二つのタイムラインは、レコードの開始及び終了マーカーを兼ねるため削除できないので注意
 * @params {Array | Number} trackSpec
 *  trackSpec配列 または スカラ 未指定の場合は親オブジェクトのtrackSpec(標準値)で初期化
 * @params {Number} frameCount
 * @returns {Array} 
 * タイムライントラックトレーラはプロパティトレーラを兼ねる
 * 初期化時のみ利用
 * 初期化時にカメラトラックを作成しない
 *    timecodeトラックは画面上は存在するがxpsTracksメンバーには含まれない
 */
nas.Xps.prototype.newTracks = function (trackSpec,trackDuration) {
    if(!(trackSpec)) trackSpec = Xps.DocumentFormat.trackSpec;
    var myTimelineTracks = new nas.Xps.XpsTrackCollection(this,this.job.id,trackDuration);//parent,index,duration
    var trackCount   = 0;
    var dialogIndex  = 1;
    var soundIndex   = 1;
    var stilIndex    = 1;
    var cellIndex    = 0;
    var cameraIndex  = 1;
    var stgIndex     = 1;
    var effectIndex  = 1;
    var noteIndex    = 1;
    var defaultNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
console.log(trackSpec)
    myTimelineTracks.initAreaOrder(trackSpec);//エリアを初期化
    var activeArea = myTimelineTracks.areaOrder[0];
    for(var pix=0;pix<trackSpec.length;pix++){
        switch (trackSpec[pix][0]){
            case "dialog":
//                if(trackCount==0) {trackSpec[pix][1] --;trackCount ++;};
//冒頭予約トラック分を廃止
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    var dialogLabel = (ix == 0)? "N":"N"+dialogIndex;
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack(dialogLabel, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    dialogIndex ++;
                };
            break;
            case "sound":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack("s"+soundIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    soundIndex ++;
                };
            break;
            case "cell":
            case "replacement":
            case "timing":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack(defaultNames.charAt(cellIndex % 26), trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    cellIndex ++;
                };
            break;
            case "still":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack(nas.Zf(trackCount,2), trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    stillIndex ++;
                };
            break;
            case "camera":
            case "camerawork":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack("cam"+cameraIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    cameraIndex ++;
                };
            break;
            case "geometry":
            case "stage":
            case "stagework":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack("stg"+stgIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    stgIndex ++;
                };
            break;
            case "sxf":
            case "effect":
            case "composite":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack("ex"+effectIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    effectIndex ++;
                };
            break;
            case "action":;//actionは暫定的にnote扱いで
            case "tracknote":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new nas.Xps.XpsTimelineTrack("nt"+noteIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    noteIndex ++;
                };
            break;
            default:
                continue;//リファレンス|コメント|タイムコード及び未知のトラックはスキップ
        }
        trackCount ++;
    }
    //トラックのインデックス更新正規化
    myTimelineTracks.assignAreaOrderMember();
    myTimelineTracks.renumber();
    return myTimelineTracks;
};
/**
 * @params {Number|String} idx
 *   指定IDはラベル文字列でも良い　ラベルの場合は先にマッチしたトラックが戻る
 * @returns {Object nas.Xps.XpsTimelineTrack}
 * xpsTracksのメンバーをタイムラインオブジェクトとしてアクセスする抽出メソッド
 *
 */
nas.Xps.prototype.timeline = function (idx) {
    if(isNaN(idx)){
      idx = String(idx);
      return this.xpsTracks.find(function(element){return (element.id == idx)});
    }else{
        return this.xpsTracks[idx];
    };
};
/**
 * Xps再初期化
 *
 *  @params {Array | Object trackspec | number}  Layers
 *      スカラ値またはスカラを要素に持つ配列
 *       trackSpec配列またはtrackSpec配列をプロパティに持つオブジェクト
 *  @params {Number|String} Length
 *       ドキュメントの継続フレーム数(Int) ... 144|シート長文字列(String) ... "(3+12)"
 *  @params {Object nas.Framerate | String}  Framerate
 *       ドキュメントのフレームレート '24FPS'
 *  @params {Object xMap | String}  xmap
 *          xMap オブジェクトまたはxMapを初期化可能なフルサイズの識別子
 *  @params {String}  nodepath
 *          制作管理ノードパス文字列
 */
nas.Xps.prototype.init = function (Layers, Length, Framerate, xmap, nodepath) {
//引数の省略値
// notepath
    if ((typeof nodepath == 'undefined')||(!(nodepath))) nodepath = '*.*.0.';//本線最終ステージ最終ノード
//xmap
    if (!( xmap instanceof xMap)) xmap = new xMap(xmap);
//Framerate
    if (typeof Framerate == 'undefined'){
        Framerate = false;// xmap.framerate;
    } else if (!(Framerate instanceof nas.Framerate)){
         Framerate = nas.newFramerate(String(Framerate));
    }
    if (! Framerate) Framerate = nas.newFramerate(this.sheetLooks.FrameRate);
//Length(==duration)
    if (isNaN(Length)) Length = nas.FCT2Frm(Length,Framerate);
//      現在のドキュメント1ページ分で初期化
    if (!Length) Length = nas.FCT2Frm(this.sheetLooks.PageLength,Framerate)
//Layers
    if(!(Layers)) Layers = this.sheetLooks;
//														xMap|pmu処理
    /**
     * Xps標準のプロパティ設定
     * @type {string}
     */
    this.xMap  = xmap ;//参照用xMapを設定
//console.log(this.xMap.getIdentifier()); 初期化引数で設定済み
//    this.pmu   = new nas.Pm.PmUnit(this,this.xMap.getIdentifier());
    this.pmu   = new nas.Pm.PmUnit(this,nas.Pm.getIdentifier(this.xMap,'full'));//状況により不正データの可能性あり
var setNode = this.xMap.pmu.nodeManager.getNode(nodepath);
if(setNode) {
//console.log(setNode);
    var line  = this.pmu.nodeManager.new_ManagementLine(setNode.stage.parentLine.toString(true));
    var stage = this.pmu.nodeManager.new_ManagementStage(setNode.stage.toString(true),line);
    var job   = this.pmu.nodeManager.new_Job(setNode.toString(true),stage);
    job.jobStatus = new nas.Pm.JobStatus(setNode.jobStatus.toString());
}else{
//console.log('look Xps')
    var line  = this.pmu.nodeManager.new_ManagementLine(this.line.toString(true));
    var stage = this.pmu.nodeManager.new_ManagementStage(this.stage.toString(true),line);
    var job   = this.pmu.nodeManager.new_Job(this.job.toString(true),stage);
    job.jobStatus = new nas.Pm.JobStatus(this.currentStatus.toString());
}
    this.pmu.currentNode = this.pmu.nodeManager.getNode();
	this.syncPmuProps();

//初期化引数 Layers を正規化
//sheetLooks オブジェクトを初期化引数として渡せるように変更 20230905
	if(
		(typeof Layers == 'object')&&
		(Layers.trackSpec)&&
		(Layers.trackSpec instanceof Array)
	){
//引数としてsheetLooksを受け取った場合、先行してオブジェクトプロパティとして設定する
//		this.sheetLooks = documentFormat.normalizeSheetlooks(Layers);
		this.sheetLooks = JSON.parse(JSON.stringify(Layers));
		Layers = Array.from(this.sheetLooks.trackSpec);//レイヤー引数をトラックスペックに設定する
	}else{
//それ以外はconfig.SheetLooksをデフォルトで設定
//		this.sheetLooks = documentFormat.normalizeSheetlooks(config.SheetLooks);
		this.sheetLooks = JSON.parse(JSON.stringify(config.SheetLooks));
	};
//Layers引数なし 標準的なA,B,C,D 4レイヤで初期化(旧仕様)
	if (typeof Layers == 'undefined') Layers = 4;
//引数が単独スカラ > 配列化
	if (!isNaN(Layers)) Layers = [Layers];
//配列引数をトラック配置用のオブジェクトに展開
	var trackSpec=[];
	if(! (Layers[0] instanceof Array)){
//スカラ要素の配列
		switch (Layers.length){
			case 0:trackSpec = Array.from(this.sheetLooks.trackSpec);
/*			[
				["timecode",1,"fix"],
				["reference",4,"fix"],
				["dialog",1,"fix"],
				["timing",4,""]
			];//*/
			break;
			case 1:trackSpec=[
				["timecode",1,"fix"],
				["reference",4,"fix"],
				["dialog",1,"fix"],
				["timing",Layers[0],""]
			];break;
			case 2:trackSpec=[
				["timecode",1,"fix"],
				["reference",4,"fix"],
				["dialog",Layers[0],"fix"],
				["timing",Layers[1],""]
			];break;
			case 3:trackSpec=[
				["timecode",1,"fix"],
				["reference",4,"fix"],
				["dialog",Layers[0],"fix"],
				["timing",Layers[1],""],
				["camera",Layers[2],""]
			];break;
			case 4:;
			case 5:;
			default:trackSpec=[
				["timecode",1,"fix"],
				["reference",4,"fix"],
				["dialog",Layers[0],"fix"],
				["timing",Layers[1],""],
				["camera",Layers[2],""],
				["geometry",Layers[3],""],
				["effect",Layers[4],""]
			];
		};
	}else{
//引数配列の第一要素が配列なのでtrackSpecデータとみなす
		for(var pix=0;pix<Layers.length;pix++){
			if(! String(Layers[pix][0]).match(Xps.TrackPropRegex)){
//不正引数が含まれているためデフォルト値に設定してブレーク
console.log('不正引数検出のためトラック仕様をデフォルト値にリセット');
				trackSpec = Array.from(this.sheetLooks.trackSpec);
//				trackSpec=[["timecode",1,"fix"],["reference",4,"fix"],["dialog",1,"fix"],["timing",4,""]];
				break;
			}else{
				trackSpec.push(Layers[pix]);
			};
		};
	};

//														xMap|pmu処理

// Xpstプロパティ設定
    if (Framerate) this.framerate = Framerate;//falseに判定される不正値が戻された場合は処理スキップ

    this.xMap = xmap;//参照用xMapを初期化
//    if (this.mapfile);//Xps初期化手順に注意・初期化時にxMapを与えるのが正道
    this.opus     = "";//myOpus;
    this.title    = "";//myTitle;
    this.subtitle = "";//mySubTitle;
    this.scene    = "";//myScene;
    this.cut      = "";//myCut;

    this.trin      = new nas.ShotTransition('trin');
    this.trout     = new nas.ShotTransition('trout');
    this.headMargin = 0;
    this.tailMargin = 0;
    this.rate  = this.framerate.name;
    var Now = new Date();
    this.create_time = Now.toNASString();
    this.create_user = ((xUI)&&(xUI.currentUser))? xUI.currentUser:new nas.UserInfo(config.myName);
    this.update_time = Now.toNASString();
    this.update_user = ((xUI)&&(xUI.currentUser))? xUI.currentUser:new nas.UserInfo(config.myName);

//    this.memo = "";
// タイムシート画像トレーラーを初期化
    this.timesheetImages.clearMember();
// ノート画像トレーラーを初期化
    this.timesheetImages.clearMember();
// タイムライントレーラー(トラックコレクション)作成
    this.xpsTracks = this.newTracks(trackSpec, Length);

// pmu拡張時処理
/*
  if(this.pmu){
	var startNode = this.pmu.nodeManager.getNodeByNodepath('0.0.0.');
	if(startNode){
        this.create_time = startNode.createDate.toNASString();
        this.create_user = (startNode.createUser)? startNode.createUser.toString():'';
    }
	var lastNode  = this.pmu.nodeManager.getLastNode();
    if(lastNode){
        this.update_time = lastNode.createDate.toNASString();
        this.update_user = (lastNode.createUser)? lastNode.createUser.toString():'';
    }
    if(this.pmu.currentNode){
//console.log(this.pmu.currentNode);
        this.line       = new nas.Xps.XpsLine (this.pmu.currentNode.stage.parentLine.toString(true));
        this.stage      = new nas.Xps.XpsStage(this.pmu.currentNode.stage.toString(true));
        this.job        = new nas.Xps.XpsJob(this.pmu.currentNode.toString(true));
        this.currentStatus = new nas.Xps.JobStatus(this.pmu.currentNode.jobStatus.toString());
    }
  }else{
      //逆同期 プロパティは限定　あまり使用機会はないはず
    this.pmu.opus  = nas.pmdb.products.entry(this.opus);
    this.pmu.title = nas.pmdb.workTitles.entry(this.title);
    this.pmu.subtitle = this.subtitle;
    if(this.pmu.inherit.length > 0){
        this.pmu.scene    = this.scene;
        this.pmu.cut      = this.cut;
        this.pmu.inherit[0] = nas.Pm.parseSCi(
            this.inherit+
            "("+this.trin.toString('xps')+")"+
            "("+this.trout.toString('xps')+")"
        );
    }
//各シートのフレームレートは独自設定が可能でエピソードやタイトルのフレームレートを上書きすることはない（不可逆）
//ノードの情報はタイムシート側からの書き換えを禁止する（タイムシートの書き換え自体を禁止）
//exListから外すことで対処
  };// */
};
/**
 *    pmuの内容とプロパティを同期する
 */
nas.Xps.prototype.syncPmuProps = function(){
    if(!(this.pmu)) return false;
//console.log(this.pmu);
    if (this.pmu.opus instanceof nas.Pm.Opus){
	    this.opus	    = this.pmu.opus.name;
	    this.subtitle	= this.pmu.opus.subtitle;
    }else{
	    this.opus	    = this.pmu.product.opus;
	    this.subtitle	= this.pmu.product.subtitle;
    };
	if (this.pmu.title instanceof nas.Pm.WorkTitle){
	    this.title	    = this.pmu.title.fullName;
	    this.framerate	= this.pmu.title.framerate;
	    this.rate       = this.pmu.title.framerate.name;
	}else{
	    this.title	    = this.pmu.product.title;
	    this.framerate	= new nas.Framerate();
	    this.rate       = this.framerate.name;
	};
	if(this.pmu.pmdb.medias){
	    var im = this.pmu.pmdb.medias.entry(this.pmu.title);
	    if(im){
	        this.standerdFrame  = im.animationField;
	        this.standerdPeg    = im.animationField.peg.toString();
	        this.baseResolution = im.baseResolution;
        };
    };
	this.scene	  = this.pmu.scene;
	this.cut	  = this.pmu.cut  ;
	this.inherit  = this.pmu.inherit;

	var startNode = this.pmu.nodeManager.getNodeByNodepath('0.0.0.');
	if(startNode){
        this.create_time = startNode.createDate;
        this.create_user = startNode.createUser;
    };
	var lastNode  = this.pmu.nodeManager.getLastNode();
    if(lastNode){
        this.update_time = lastNode.updateDate;
        this.update_user = lastNode.updateUser;
    };
    this.currentNode = this.pmu.currentNode;
	this.lines	=this.pmu.nodeManager.lines;
	this.stages	=this.pmu.nodeManager.stages;
	this.jobs	=this.pmu.nodeManager.nodes;
	this.lineIssues   =	this.pmu.issues;
console.log('sync pmu property');
console.log()
};
/* TEST
    
*/
/*
    getMAPメソッド自体が不要 XPS.getMapメソッド削除 20200115
 */
/**
 * カット識別子を返すオブジェクトメソッド
 * nas.Xps.getIdentifier(識別オプション,)
 * カット識別文字列を返す
 * カット識別子はタイトル、制作番号、シーン、カット番号の各情報をセパレータ"_"で結合した文字列
 * カット番号以外の情報はデフォルトの文字列と比較して一致した場合セパレータごと省略
 * オプションで要素の結合状態を編集して返す
 *
 セパレータ文字列は[(__)#\[]
 出力仕様をクラスメソッド互換に変更
 オブジェクトメソッドを利用する場合はURIEncodeを使用しないプレーン文字列でやり取りが行われるものとする
 旧:     TITLE_OPUS_SCENE_CUT
 新:     TITLE#OPUS[subtitle]__sSCENE-cCUT(time)

 基本的に’結合文字列をファイル名として使用できる’’ユーザ可読性がある’ことを前提にする
    プロダクションIDとSCiは"__(二連アンダーバー)"でセパレートする
    部分エンコーディング
    各要素は、自身の要素のセパレータを含む場合'%'を前置して部分的にURIエンコーディングを行う
    要素の文字列は識別子をファイル名等に利用する場合、ファイルシステムで使用できない文字が禁止されるが、この文字も併せて部分エンコードの対象となる。
    対象文字列は、Windowsの制限文字である¥\/:*?"<>| に加えて . 及びエンコード前置文字の %
    (これらは関数側で記述)
    
TITLE"#"が禁止される
OPUS    "#","[","__" が禁止される
subtitle "["."]","__"が禁止される
SCi     "__","("が禁止される
 options:
 'full' 全ての要素を含む識別文字列で返す
        TITLE#OPUS[subtitle]__sSCENE-cCUT(time)
 'episode'
        #OPUS[subtitle]
 'cut'
        #OPUS__sSCENE-cCUT
 'simple'
        TITLE#OPUS__sSCENE-cCUT
 'complex'
        TITLE#OPUS[subtitle]__sSCENE-cCUT
 * @params opt
 * @returns {string}
 */
nas.Xps.prototype.getIdentifier = function (opt) {
    var opusName = (this.opus.name)? this.opus.name:this.opus;
    var myResult=""
    switch (opt){
    case 'cut':
        myResult='#'+nas.IdfEncode(opusName,"#_\[")+'__'+nas.IdfEncode('s'+this.scene +'-c'+this.cut,"_");
    break;
    case 'simple':
        myResult=this.title+'#'+nas.IdfEncode(opusName,"#_\[")+'__'+nas.IdfEncode('s'+this.scene +'-c'+this.cut,"_");
    break;
    case 'complex':
        myResult=nas.IdfEncode(this.title,"#")+'#'+nas.IdfEncode(opusName,"#_\[")+'['+nas.IdfEncode(this.subtitle,"\[\]_")+']__'+ nas.IdfEncode('s'+this.scene +'-c'+this.cut,"_");
    break;
    case 'episode':
        myResult='#'+nas.IdfEncode(opusName,"#_\[");
        if(this.subtitle) myResult = myResult +'['+nas.IdfEncode(this.subtitle,"\[\]_")+']';
    break;   
    case 'full':
    default    :
        var timeString=(this.framerate.opt=="smpte")?
        ((this.framerate.rate < 45)?nas.Frm2FCT(this.time(),6):nas.Frm2FCT(this.time(),7)):
        nas.Frm2FCT(this.time(),3,0,this.framerate);
        myResult=this.title+'#'+opusName+'['+this.subtitle+']__s'+this.scene+'-c'+this.cut+'('+ timeString+')';
    }

    return myResult;
};

/** 識別子の情報でカットのプロパティを上書きする
    インポート時に必要な情報は識別子にすべて含まれるためそれで上書きを行う
    duration は
        元シートのデータを維持
        新シートに合わせる
    の二択となるので要注意
    新規作成時にライン〜ステータス情報が欠落するのでそれは判定して補う
    識別子に含まれる時間情報を同期させる場合は、引数withoutTimeにfalseを与える
    初期値はtrue(時間同期なし)
    関連付けられるxMapの情報も同期の必要があるので注意
    更新の必要を判断してから更新を行う
    または先行でxMapを同期(再初期化)して、そこを基準にXpsを同期
    2021 現在処理なし
*/
nas.Xps.prototype.syncIdentifier =function(myIdentifier,withoutTime){
    if(typeof withoutTime == 'undefined') withoutTime = true;
    var currentTime = nas.Frm2FCT(this.time(),5,0,this.framerate);
    if(this.xMap instanceof nas.xMap){
        if(nas.Pm.compareIdentifier(nas.Pm.getIdentifier(this.xMap),myIdentifier)){
            this.xMap.init(myIdentifier);
            this.xMap.pmu.setProduct(myIdentifier);
            this.xMap.syncPmuProps();
        }
    }
    if(! this.pmu) {
        this.pmu = new nas.Pm.PmUnit(this,myIdentifier);
        var parseData = nas.Pm.parseIdentifier(myIdentifier);
    }else{
        var parseData = this.pmu.setProduct(myIdentifier);
    }
    if(parseData.mNode){
        this.pmu.nodeManager.lines.add(parseData.line);
        this.pmu.nodeManager.stages.add(parseData.stage);
        this.pmu.nodeManager.nodes.add(parseData.job);
        this.pmu.currentNode = this.pmu.nodeManager.getNode();
    }
    this.syncPmuProps();
console.log(parseData)
    if ((! withoutTime)&&(parseData.sci.length)){
        var newTime = nas.FCT2Frm(parseData.sci[0].time)+
            Math.ceil((nas.FCT2Frm(this.trin.time) +
            nas.FCT2Frm(this.trout.time)) / 2);
        this.setDuration(newTime);
console.log('setDuration:' + newTime);
    }
return parseData;
}
/**
 * 継続時間をフレーム数で返す
 * ダイアログタイムラインの要素数で返す
 * 初期状態でボディの存在しないシートが存在しないように注意
 * 未記述でも空ボディのタイムラインが存在する。
 * エラー関連コードは排除
 *チェックが進んだら関数自体を廃してxpsTracks.durationの参照に切り替える
 * @returns {*}
 */
nas.Xps.prototype.duration = function () {
    if(this.xpsTracks.duration){
        return this.xpsTracks.duration;
    }else{
        return this.xpsTracks[0].length;
    }
};
nas.Xps.prototype.getDuration =function () { return this.xpsTracks.duration; }

/**
 * カット尺をフレーム数で返す
 * @returns {number}
 */
nas.Xps.prototype.time = function () {
    return (this.duration() - (this.headMargin + this.tailMargin));
//     - Math.ceil((nas.FCT2Frm(this.trin.time) + nas.FCT2Frm(this.trout.time)) / 2);
};
/**
 * フレーム数からTCを返す
 * @params mtd
 * @returns {string}
 */
nas.Xps.prototype.getTC = function (mtd) {
    return (nas) ? nas.Frm2FCT(mtd, 3, 0, this.framerate) : Math.floor(mtd / this.framerate) + "+" + mtd % this.framerate + ".";
};
/*
 *	タイムライントラックの前後マージンを自動調整
 *	マージン設定の際に呼び出す補助関数
 */
nas.Xps.prototype.adjustMargin = function adjustMargin(){
	if(this.headMargin < this.trin / 2)  this.headMargin = this.trin / 2;
	if(this.tailMargin < this.trout / 2) this.tailMargin = this.trout / 2;
}
/*TEST
	xUI.XPS.headMargin = 18;//18フレームを設定
	xUI.XPS.trin.setValue("from s-c124 (2+12)","in");//60フレームを設定
	xUI.XPS.adjustMargin();//30フレームに矯正
		
*/
/**
 *  
 */
nas.Xps.prototype.stringifySheetLooks = function () {
    return JSON.stringify(this.sheetLooks);
}
/**
 *  @params {String|Object}  sheetLooks
 *  sheetLooks情報を適用する
 *  トラックスペックの変更が検出された場合のみトラックエリアの再初期化が実行される
 *  アプリ画面の書換はこのメソッドでは呼び出されない
 *  必要ならば、画面の書き換えは別に呼び出す
 */
nas.Xps.prototype.parseSheetLooks = function (sheetLooks){
console.log(sheetLooks);
console.log(this);
    if ((typeof sheetLooks == 'string')&&(sheetLooks.match(/(\{[\s\S]*?\})/))){
//引数が文字列ならばオブジェクト化しておく
        sheetLooks = JSON.parse(RegExp.$1);
    };
    var changeTrack = (this.sheetLooks.trackSpec.join() == sheetLooks.trackSpec.join())? false:true;
    for (var prp in sheetLooks){
        if(this.sheetLooks[prp]){
            if(prp == 'trackSpec') console.log(this.sheetLooks[prp],sheetLooks[prp]);
            if(this.sheetLooks[prp].setValue instanceof Function){
                this.sheetLooks[prp].setValue(sheetLooks[prp]);
            }else if(this.sheetLooks[prp].parse instanceof Function){
                this.sheetLooks[prp].parse(sheetLooks[prp]);
            }else if(this.sheetLooks[prp] instanceof Array){
                this.sheetLooks[prp] = Array.from(sheetLooks[prp]);
            }else{
                this.sheetLooks[prp] = sheetLooks[prp];
            };
        };
    };
    if (changeTrack){
//エリアオーダーを更新してエリアを再アサイン
        this.xpsTracks.initAreaOrder(sheetLooks.trackSpec);
        this.xpsTracks.assignAreaOrderMember();
    };
}
/**
 * @todo 仮メソッドアトでキチンとカケ
 * 編集関連メソッド
 */


/**
 * Xpsにタイムラインを挿入
 データ構造変更により挿入・削除系操作はリニューアルが必要
 具体的には別オブジェクトの同期操作が不用になるので、単純化した操作系に変更するナリ
 引数はタイムラインオブジェクトを求める
 指定がない場合は、デフォルトの新規オブジェクトを作成して挿入するように変更
 * nas.Xps.insertTL(id,Timelines)
 * Timelines(複数可・配列渡し)
 * idの前方に引数のタイムラインを挿入
 * idが未指定・範囲外の場合、後方へ挿入
 * 0番タイムラインの前方へは挿入不能(固定のデフォルトタイムライン)
 * 現状ではデータを持ったままタイムラインを挿入することはできない。
 * 必ず空のタイムラインが挿入される。
 *
 * @params {Number} myId
 *  挿入点トラックid　指定idの前方に挿入される
 * @params {Araay of nas.Xps.XpsTimelineTrack} myTimelines
 *  挿入オブジェクトまたは配列
 * @returns {Array of Object XpsTimelineTrack}
 */
nas.Xps.prototype.insertTL = function (myId, myTimelines) {
    //引数が配列ではないまたは単独のタイムライントラックオブジェクトである場合配列化する
/*
 XpsTimelineTrackが配列ベースのため通常の配列をinstanceof XpsTimelineTrack で判定すると trueが戻るので
 プロパティで判定を行う
 obj.id(トラックラベル)があればタイムライントラック
 typeofobj.length== "undefined"ならば 配列以外
 */
    if ((myTimelines.id) || (typeof myTimelines.length == "undefined")){
        myTimelines = [myTimelines];
    }
    if ((!myId ) || (myId < 1) || ( myId > this.xpsTracks.length - 2)) {
        myId = this.xpsTracks.length - 1
    }
    for (var idx = 0; idx < myTimelines.length; idx++) {
/*
 * 挿入データの検査
 * 挿入データがタイムライントラック以外なら挿入データをラベルに持つtimingタイムラインを作成する
 */
        if (!(myTimelines[idx].id)) {
            if (myTimelines[idx]) {
                myTimelines[idx] = new nas.Xps.XpsTimelineTrack(myTimelines[idx], "timing",this.xpsTracks,this.duration());
            } else {
                myTimelines[idx] = new nas.Xps.XpsTimelineTrack(nas.Zf(idx + myId, 2), "timing",this.xpsTracks,this.duration());
            }
        };
    };
// 挿入データを揃えて挿入
    this.xpsTracks.insertTrack(myId,myTimelines);
    return myTimelines;
};
//test insertTL(挿入点id,挿入するタイムラインオブジェクト配列)
//var myNewTracks=new nas.Xps.XpsTimelineTrack("ins1","timing",XPS.xpsTracks,"")
// XPS.insertTL()
/**
 * nas.Xps.deleteTL([id])
 * 指定idのタイムラインを削除する。1～
 * デフォルトの音声タイムラインとフレームコメントの削除はできない
 * IDを単独又は配列渡しで
 * XpsLayerとxpsTracks はそのうちタイムラインとして統合すべきかと思う。
 *
 * @params {Array of Number} args
 * @returns {Object TimeLineTrack}
 */
nas.Xps.prototype.deleteTL = function (args) {
    return this.xpsTracks.removeTrack(args);
};
/**
 *	@params {String} direction
 *		head|from|tail|to|both
 *	@params {String} length
 *	シートデータにマージンを設定する
 *	方向性にbothを指定した場合両方のパラメータが同一になる
 *	マージン設定の際にショットトランジションが存在した場合
 *	トランジションに必要なマージン以下には設定できない
 *	マージンの変更値を計算して
 	lengthに許される値は 0以上のFCT文字列
 	0の場合は、マージンを削除
	現在のマージンに対する変更値を計算する
	加算分は空白セルを作成して挿入 減算分は削除する

 */
nas.Xps.prototype.setMargin = function setMargin(direction,length){
	var target = [];
	length = nas.FCT2Frm(length);//フレーム数に変換
	if(length == false) return false;
	if(direction == 'head'){
		target.push('headMargin');
	}else if(direction == 'tail'){
		target.push('tailMargin');
	}else if(direction == 'both'){
		target=['tailMargin','headMargin'];
	}else{
		return false;
	};
	for(var ix = 0 ; ix < target.length ; ix ++ ){
		var prp  = target[ix];
		var current = this[prp];//現在の値 整数
		var keep = (prp == 'headMargin')? trin / 2:trout / 2;//
		var change = (keep >= length)? keep:length - current;// 12にたいして1+0を設定する場合 +12
		
		this[prp] = length;
	};
}
/**
    @params {Number Int} myDuration
    @returns {Number}
    
     Xpsの継続時間を変更する
     引数：int フレーム数
     現在の値と同じ場合は何もしない
     継続時間が減少する場合はシート後方から削除
     増加の場合は""で初期化
     0は処理失敗
     トランジション・マージンの値は操作しないので
     それらに変更がある場合は別途変更処理が必要
*/
nas.Xps.prototype.setDuration =function(myDuration){
    if(! myDuration) return false;
    if(myDuration != this.xpsTracks.duration){
        var currentDuration = this.xpsTracks.duration;
        for(var tid = 0 ; tid < this.xpsTracks.length ; tid ++){
            this.xpsTracks[tid].length = myDuration;
            if(myDuration > currentDuration){
                for (var fid=currentDuration;fid<myDuration;fid++){
                    this.xpsTracks[tid][fid]="";
                }
            }
        }
        this.xpsTracks.duration = myDuration;
    }
    return this.xpsTracks.duration;
}
/**
 * nas.Xps.reInitBody(newTimelines:int,newDuration:int)
 *
 * Xps本体データのサイズを変更する。
 * 元あったデータ内容は可能な限り保存
 * 切り捨て分はなくなる。
 * 新たに出来たレコードは、ヌルストリングデータで埋める。
 * セクションキャッシュはすべて無効
 トラック引数の値はコメントトラックの値を含めたトラック全数
 トラック状態を[dialog,timing,comment]にするためには３を与える
 レイヤー数にあらず 
 * @params newTimelines
 * @params newDuration
 * @returns {boolean}
  引数にsheetLooks|trackSpecを与えられるように改修
 */
nas.Xps.prototype.reInitBody = function (newTimelines, newDuration) {
if(
    (typeof newTimelines == 'object')&&
    (newTimelines)
){
    
}
    var oldWidth = (this.xpsTracks.length);
    if (!newTimelines) newTimelines = oldWidth;
    var oldDuration = this.duration();//this.xpsTracks.duration;
    if (!newDuration) newDuration = oldDuration;
    if (newTimelines < 1 || newDuration <= 0) return false;

    var widthUp    = (newTimelines > oldWidth)   ? 1 : (newTimelines == oldWidth)   ? 0 : -1 ;

    var durationUp = (newDuration > oldDuration) ? 1 : (newDuration == oldDuration) ? 0 : -1 ;

//  トラック数を先に編集 トラック数が増えた場合は空白ラベルで挿入 減っている場合は削除メソッドを発行
    if(widthUp > 0){
//トラック増加
        var newTracks=[];
        var widthUpCount = newTimelines-oldWidth;
                        alert("add new "+widthUpCount+ ' tracks!');
        for (var tid = 0 ; tid < widthUpCount ; tid ++){
            newTracks.push(new XpsTimelineTrack('','timing',this.xpsTracks,this.duration()));
        };
        this.xpsTracks.insertTrack(0,newTracks);
    }else if(widthUp < 0){
//トラック減少 コメントを残し後方のとタックを順次削除
        for (var tid = (this.xpsTracks.length-2);tid >= (newTimelines-1);tid --){
            this.xpsTracks[tid].remove();
        };
    };
//  トラック長を変更する
    if(durationUp != 0){
        this.setDuration(newDuration);
    };
     return true;
if(this.xpsTracks.duration){
    // NOP
}else{
    this.xpsTracks.length = newTimelines;//配列長(タイムライン数)の設定 メソッドに置きかえ予定

// 延長したらカラデータで埋める
// この部分はxpsTracksへの変更にともなって更新が必要
    if (widthUp) {
        for (var i = 0; i < oldWidth; i++) {
            this.xpsTracks[i].length = newDuration;
            if (durationUp) {
                for (var f = oldDuration; f < newDuration; f++) {
                    this.xpsTracks[i][f] = '';
                };
            };
        };
        for (var i = oldWidth; i < newTimelines; i++) {
            this.xpsTracks[i] = new XpsTimelineTrack(i,option,this.xpsTracks,newDuration,i);
            for (var f = 0; f < newDuration; f++) {
                this.xpsTracks[i][f] = '';
            };
        };
    } else {
        for (var i = 0; i < newTimelines; i++) {
            this.xpsTracks[i].length = newDuration;
            if (durationUp) {
                for (var f = oldDuration; f < newDuration; f++) {
                    this.xpsTracks[i][f] = '';
                };
            };
        };
    };

// タイムラインが増えた場合は、再描画前にグループ情報の追加が必要
// 空データを自動生成してやる必要あり

// 現在はラベル名以外は直前タイムラインの複製
	this.xpsTracks.length = newTimelines;
    if (widthUp) {
        for (var i = oldWidth - 2; i < (newTimelines - 2); i++) {
            this.xpsTracks[i] = new nas.Xps.XpsTimelineTrack(i,"timing",this.xpsTracks,newDuration);//myLabel, myType, myParent, myLength
            this.xpsTracks[i]["id"] = ("00" + i).slice(-2);
            this.xpsTracks[i]["sizeX"] = this.xpsTracks[oldWidth - 3]["sizeX"];
            this.xpsTracks[i]["sizeY"] = this.xpsTracks[oldWidth - 3]["sizeY"];
            this.xpsTracks[i]["aspect"] = this.xpsTracks[oldWidth - 3]["aspect"];
            this.xpsTracks[i]["lot"] = this.xpsTracks[oldWidth - 3]["lot"];
            this.xpsTracks[i]["blmtd"] = this.xpsTracks[oldWidth - 3]["blmtd"];
            this.xpsTracks[i]["blpos"] = this.xpsTracks[oldWidth - 3]["blpos"];
            this.xpsTracks[i]["option"] = this.xpsTracks[oldWidth - 3]["option"];
            this.xpsTracks[i]["link"] = this.xpsTracks[oldWidth - 3]["link"];
            this.xpsTracks[i]["parent"] = this.xpsTracks[oldWidth - 3]["parent"];
        };
    };
};
    
    return true;
};
/**
 *   @params {Array of Array} Range
 *   @returns {Array}
 *
 *    xUI.getRange(Range:[[startColumn,startFrame],[endColumn,endFrame]])
 * nas.Xps.getRange(Range:[[startC,startF],[endC,endF]])
 * 範囲内のデータをストリームで返す
 * xpsのメソッドに移行 2013.02.23
 * 範囲外のデータは、ヌルストリングを返す2015.09.18
 * 負のアドレスを許容150919
 * 全てシートの範囲外を指定された場合は、範囲のサイズの空ストリームを返す
 * チェックはない（不要）空ストリームを得る場合に使用可能
 * 開始と終了のアドレスが一致している場合は、該当セルの値を返す
 * 第一象限と第三象限の指定は無効
 *
 */
nas.Xps.prototype.getRange = function (Range) {
    if (typeof Range == "undefined") {
        Range = [[0, 0], [this.xpsTracks.length - 1, this.xpsTracks[0].length - 1]]
    }//指定がなければ全体をストリーム変換
    var StartAddress = Range[0];
    var EndAddress   = Range[1];
//	if(StartAddress==EndAddress){return xpsTracks[StartAddress[0]][StartAddress[1]]}
    var xBUF = [];
    var yBUF = [];
    var zBUF = [];
    /**
     * ループして拾い出す
     */
    for (var r = StartAddress[0]; r <= EndAddress[0]; r++) {
        if (r < this.xpsTracks.length && r >= 0) {
            for (var f = StartAddress[1]; f <= EndAddress[1]; f++)
                xBUF.push((f < this.xpsTracks[r].length && f >= 0) ? this.xpsTracks[r][f] : "");
            yBUF.push(xBUF.join(","));
            xBUF.length = 0;
        } else {
            yBUF.push(new Array(EndAddress[1] - StartAddress[1] + 1).join(","));
        }
    }
    zBUF = yBUF.join("\n");
// ストリームで返す
    return zBUF;
};

/*
    pmu         直接アクセス禁止    pmuのメソッドに渡す
    xpsTracks   同上              xpsTracksのメソッドに渡す
*/
/**<pre>
 * nas.Xps.put(書込開始アドレス:[startC,startF],データストリーム)
 * nas.Xps.put(入力単位オブジェクト)
 * 第一引数がアドレス指定配列ではない場合入力オブジェクトが渡されたものと判断する
 * 入力ユニットのオブジェクト種別は問われないが、オブジェクトがaddress,valueの各プロパティを持っているものとする
 * 引数としての入力オブジェクトの配列は受け付けない
 * 複数レンジの書き込みはこのメソッドに渡す前に展開を行うこと
 * 書込開始アドレスを起点にストリームでタイムライントラックデータを置き換え
 * 第一引数がXpsで、かつ本体オブジェクトと異なる場合は内容を複製する？
 * Xpsオブジェクトメソッド
 * undo/redo等はUIレベルの実装なのでここでは関知しない
 * 書込開始アドレスに負の数を与えると有効範囲外の書込アドレス発生する
 * 有効レンジ外データは無視される
 * このメソッドでは本体データとしてセパレータの",""\n"を与えることはできない（禁則事項）
 * リザルトとして　書き込みに成功したベクトル（左上、右下）、書き換え前のデータストリーム、書き込みに成功したデータ
 * を返す </pre>
 *
 * @params {Array of Array | String}    input
 * @params {String|Array}               content
 * @returns [Array]
 *  [書き込みプロパティアドレス,書き込み前の値,書き込み後の値]
 */
/*
nas.Xps.prototype.put = function (input, content) {
//従来指定をオブジェクト化
	var inputUnit = input;
	if(arguments.length > 1) inputUnit = {address:input,value:content};
	if(
		(inputUnit.address instanceof Array)||
		(inputUnit.address.match(/\d+_\d+/))
	) return this.xpsTracks.put(inputUnit)   ;//アドレス配列ならxpsTracksへ渡す

	if(! inputUnit.address) return false     ;//ターゲットがない場合は失敗
	if(inputUnit.address.indexOf('pmu')==0) return this.pmu.put(inputUnit);//pmuへ渡す
//編集可能プロパティリスト
var exLst = {
"*"            :{ get:"toString", put:"parseXps"},
"id"           :{ get:"toString", put:"direct"},
"xMap"         :{ get:"toString", put:"parsexMap"},
"timestamp"    :{ get:"toString", put:"direct"},
"dataNode"     :{ get:"toString", put:"direct"},
"line"         :{ get:"toString", put:"parse"},
"stage"        :{ get:"toString", put:"parse"},
"job"          :{ get:"toString", put:"parse"},
"currentStatus":{ get:"toString", put:"parse"},
"opus"         :{ get:"toString", put:"direct"},
"title"        :{ get:"toString", put:"direct"},
"subtitle"     :{ get:"toString", put:"direct"},
"scene"        :{ get:"toString", put:"direct"},
"cut"          :{ get:"toString", put:"direct"},
"inherit"      :{ get:"toString", put:"direct"},
"trin"         :{ get:"toString", put:"parse"},
"trout"        :{ get:"toString", put:"parse"},
"framerate"    :{ get:"toString", put:"parse"},
"rate"         :{ get:"toString", put:"direct"},
"create_time"  :{ get:"toString", put:"direct"},
"create_user"  :{ get:"toString", put:"parse"},
"update_time"  :{ get:"toString", put:"direct"},
"update_user"  :{ get:"toString", put:"parse"},
"mapfile"      :{ get:"toString", put:"direct"}
};
//変換テーブルに値のないプロパティは、書き込み不能なので失敗
	if(! exLst[inputUnit.address]) return false;
//アドレスから現データを取得
	var targetProp   = this[inputUnit.address];
	if(inputUnit.address == "*") targetProp = this;//特例
	var currentValue = (targetProp)? targetProp[exLst[inputUnit.address].get]():targetProp;//シャローコピーを取得
	var putMethod = exLst[inputUnit.address].put;
	if(putMethod == 'direct'){
//console.log('direct change :'+currentValue +' :to: '+ inputUnit.value);
		this[inputUnit.address] = inputUnit.value;//直接代入
	}else{
//console.log('changevalue with method :'+putMethod +' :: '+ inputUnit.value);
		this[inputUnit.address][putMethod](inputUnit.value);//メソッドで書き込み
	}
//戻り値は、書き込みに成功したレンジ
//console.log(xUI.XPS === this);
    return [inputUnit.address, currentValue, this[inputUnit.address]];
};//*/
nas.Xps.prototype.get = nas.Pm.valueGet;
nas.Xps.prototype.put = nas.Pm.valuePut;
/*
 * nas.Xps.put(書込開始アドレス:[startC,startF],データストリーム)
 * 書込開始アドレスを起点にストリームでデータ置き換え
 * Xpsオブジェクトメソッド
 * undo/redo等はUIレベルの実装なのでここでは関知しない
 * 書込開始アドレスに負の数を与えると、書込アドレスが負の場合レンジ外となる
 * レンジ外データは無視される
 * このメソッドでは本体データとしてセパレータの",""\n"を与えることはできない（禁則事項）
 * リザルトとして書き込みに成功したベクトル（左上、右下）、書き換え前のデータストリーム、書き込みに成功したデータを返す
 *
 * @params {Array of sheetcell address} myAddress
 * @params myStream
 * @returns {*}

nas.Xps.prototype.put = function (myAddress, myStream) {
//指定がなければ操作失敗
    if ((!myAddress) || (typeof myStream == "undefined")) {
        return false
    }//指定がなければ操作失敗

// データストリームが空文字列の場合は要素数１の配列に展開する     * データストリームを配列に展開
    var srcData = new Array(myStream.toString().split("\n").length);
    for (var n = 0; n < srcData.length; n++) {
        srcData[n] = myStream.toString().split("\n")[n].split(",");
    }
//指定アドレスから書き込み可能な範囲をクリップする
    var writeRange = [myAddress.slice(), add(myAddress, [srcData.length - 1, srcData[0].length - 1])];
    if (writeRange[0][0] < 0) writeRange[0][0] = 0;
    if (writeRange[0][0] >= this.xpsTracks.length)    writeRange[0][1] = this.xpsTracks.length - 1;
    if (writeRange[0][1] < 0) writeRange[0][1] = 0;
    if (writeRange[0][1] >= this.xpsTracks[0].length) writeRange[1][1] = this.xpsTracks[0].length - 1;
    if (writeRange[1][0] < writeRange[0][0]) writeRange[1][0] = writeRange[0][0];
    if (writeRange[1][0] >= this.xpsTracks.length)    writeRange[1][0] = this.xpsTracks.length - 1;
    if (writeRange[1][1] < writeRange[0][1]) writeRange[1][1] = writeRange[0][1];
    if (writeRange[1][1] >= this.xpsTracks[0].length) writeRange[1][1] = this.xpsTracks[0].length - 1;
//書き込み範囲をバックアップ
    var currentData = this.getRange(writeRange);
//ループして置き換え
    for (var c = 0; c < srcData.length; c++) {
        var writeColumn = c + myAddress[0];
        this.xpsTracks[writeColumn].sectionTrust=false;
        for (var f = 0; f < srcData[0].length; f++) {
            var writeFrame = f + myAddress[1];
            if (
                (writeColumn >= 0) && (writeColumn < this.xpsTracks.length) &&
                (writeFrame >= 0) && (writeFrame < this.xpsTracks[0].length)
            ) {
                this.xpsTracks[writeColumn][writeFrame] = srcData[c][f];
            };
        };
    };
//戻り値は、書き込みに成功したレンジ
    return [writeRange, this.getRange(writeRange), currentData];
}; //
 
 */

/**
 * 読み込みメソッド
 * ラッパとして残置されるが、内部には他フォーマットの判定部分を置かない。
 * インポーターとして使用する場合は、更にこの外側にデータ前処理部分をおくか、
 * このメソッドをオーバーライドして使用すること。
 * 戻り値として、parseXps の戻り値を返すこと。2013.04.06
 *
 * @params {String} datastream
 * @returns {Boolean}
 */
nas.Xps.prototype.readIN = function (datastream) {
    if (datastream instanceof Boolean) {
        return datastream
    };
    return this.parseXps(datastream);
};

/**
 * 読み込みメソッドのXpsパーサを分離
 * 元の読み込みメソッドは、このパーサのラッパとして残置
 * 他フォーマットのデータパーサはライブラリに分離される。
 * このメソッドはXpsのパース専用になる
 * (将来の拡張用として必須)2013.04.06
 * パース成功時はオブジェクト自身を返す。
 * @params {String} datastream
 * @returns {boolean}
 * パーサにフラグを与えて、フレームレートが確定するまでフレーム計算を行わないように修正
 */
nas.Xps.prototype.parseXps = function (datastream) {
//マルチステージ拡張を行うため以前のコードに存在したエラーハンドリングは全廃
    if ((! datastream)||(!(datastream.match))) {
//console.log('bad datestream:') ;console.log(datastream);
//console.log(datastream instanceof String);
        return false;
    };
// ラインで分割して配列に取り込み
    var SrcData = [];
    if (datastream.match(/\r/)) datastream = datastream.replace(/\r\n?/g, ("\n"))
    SrcData = datastream.split("\n");
    SrcData.startLine    = -1;//データ開始行
    SrcData.layerHeader  = 0 ;//レイヤヘッダ開始行
    SrcData.layerProps   = 0 ;//レイヤプロパティエントリ数
    SrcData.trackCount   = 0 ;//トラック数
    SrcData.layers       = [];//レイヤ情報トレーラー
    SrcData.layerBodyEnd = 0 ;//レイヤ情報終了行
    SrcData.frameCount   = 0 ;//読み取りフレーム数
    SrcData.headMargin   = 0 ;//開始オフセットフレーム数
    SrcData.tailMargin   = 0 ;//終了オフセットフレーム数
    SrcData.framerate    = this.framerate ;//フレームレート（現ドキュメントの値）
    SrcData.xMap         = null;
/*
 * 第一パス
 * データ冒頭の空白行を無視して、データ開始行を取得
 * 識別行の確認
 * 冒頭ラインが識別コードまたは空行でなかった場合は、さようなら御免ね
 * IEのデータの検証もここでやっといたほうが良い?
 * 第一パスで xMap| フレームレート の取得を行う
 * xMapの取得に失敗した場合は、nullを設定して最終的に解決
 * パースデータにフレームレートが指定されていない場合は、現在の値を維持
 */
    for (var l = 0; l < SrcData.length; l++) {
        if((typeof SrcData[l] == 'undefined')||(SrcData[l].match(/^\s*$/))) continue;
/*
 *  データ処理中に含まれていた他フォーマットの解析部分は、別ライブラリで吸収
 *  バージョンは 0.5 まで拡張
 * 現バージョンは 0.9x （デバッグ処理バージョン）
 */
        if (SrcData[l].match(/^nasTIME-SHEET\ 0\.[1-9].*$/)) {
            SrcData.startLine = l;//データ開始行
        } else if((SrcData.startLine >= 0)&&(SrcData[l].match(/^##MAP_FILE=(.*)$/))){
            SrcData.xMap = RegExp.$1;
        } else if((SrcData.startLine >= 0)&&(SrcData[l].match(/^##FRAME_RATE=(.*)$/))){
            SrcData.framerate= nas.newFramerate(RegExp.$1);
        }
    }
/*
 * 第一パス終了
 * データ識別行がなければ処理中断
 * データ行が無かったらサヨナラ
 * "読み取るデータがないのです。";
 */
if(SrcData.startLine < 0) return false;
/*
 * 変数名とプロパティ名の対照テーブル
 */
    var varNames = [
        "MAPPING_FILE",
"REPOSITORY",
"TIMESTAMP",
"ID",
        "TITLE",
        "SUB_TITLE",
        "OPUS",
        "SCENE",
        "CUT",
        "TIME",
        "TRIN",
        "TROUT",
        "HEAD_MARGIN",
        "TAIL_MARGIN",
        "FRAME_RATE",
        "CREATE_USER",
        "UPDATE_USER",
        "CREATE_TIME",
        "UPDATE_TIME",
        "EXTENSION_DATA",
        "Line",
        "LineStatus",
        "Stage",
        "StageStatus",
        "Job",
        "JobStatus",
        "CurrentStatus",
        "JobAssign",
        "Messages"
    ];
    /**
     * @type {string[]}
     */
    var propNames = [
        "mapfile",
"dataNode",
"timestamp",
"id",
        "title",
        "subtitle",
        "opus",
        "scene",
        "cut",
        "time",
        "trin",
        "trout",
        "headMargin",
        "tailMargin",
        "framerate",
        "create_user",
        "update_user",
        "create_time",
        "update_time",
        "extension_data",
        "line",
        "lineStatus",
        "stage",
        "stageStatus",
        "job",
        "jobStatus",
        "currentStatus",
        "jobAssign",
        "messages"
    ];
    var props = new Array(varNames.length);
    for (var i = 0; i < varNames.length; i++) {
        props[varNames[i]] = propNames[i];
    }
/*
 * データ走査第二パス
 * 時間プロパティ欠落時のために初期値設定
 */
//console.log(SrcData);
    var readMultiline = false;
    var readMessage   = false;
    var readExtension = false;
    SrcData.trin   = new nas.ShotTransition('trin');
    SrcData.trout  = new nas.ShotTransition('trout');
    SrcData.headMargin = 0;
    SrcData.tailMargin = 0;

    for (var line = SrcData.startLine; line < SrcData.length; line++) {
        if((typeof SrcData[line] == 'undefined')||(SrcData[line].match(/^\s*$/))) continue;
/*
 * 前置部分を読み込みつつ、本体情報の確認
 */
/*
 * 申し送り取得フラグが立っていればコメントと他の有効記述以外をメッセージに加算
 * 終了サインまたは他の有効記述で取得終了
 */
        if((readMultiline)||(readMessage)||(readExtension)){
            if((readMultiline)&&(SrcData[line].match(/^#\[|^\#\#[A-Z].*=.*|^\#\#\<[A-Z].*\>\/$/i ))){
//##<nAme>/ readMultiline close
                readMultiline = false;nAme = ''; vAlue = '';
            }else if(SrcData[line].match(/^#\[|^\[[A-Z].*|^\#\#[A-Z].*=.*|^\#\#\<[A-Z].*\>\s*$/i )){
                readMessage=false;readExtension=false;
            }else{
                if(! (SrcData[line].match(/^\#.*|^\s*$/i))){
                    if(readMessage) {
                        SrcData.currentStatus.message +="\n"+SrcData[line];
                    }else if(readExtension){
                        SrcData.extension_data +="\n"+SrcData[line];
                    }else{
                        SrcData[nAme] += "\n"+SrcData[line];
                    };
                };
            };
            continue;
        };
        if (SrcData[line].match(/^\#\#\<([A-Z].*)\>$/i)){
//##<nAme> readMultiline 
            nAme = RegExp.$1;
            SrcData[nAme] = "";
            readMultiline = true;
            continue;
        }else if (SrcData[line].match(/^\#\#([A-Z].*)=(.*)$/i)) {
// シートプロパティにマッチ 
            var nAme = RegExp.$1;
            var vAlue = RegExp.$2;
/* 時間関連プロパティを先行して評価。
 * 読み取ったフレーム数と指定時間の長いほうでシートを初期化する
 * 指定時間の計算は time+(trin+trout)/2)+ startOffset + endOffset
 */
            switch (nAme) {
                case    "FRAME_RATE": //フレームレートは第一パスで取得済
                break;
                case    "TRIN":
                case    "TROUT":
// トランジションオブジェクトとしてパースする
                    var trst = new nas.ShotTransition(vAlue);
                    trst.direction = (nAme == 'TROUT')? 'out':'in';
                    SrcData[props[nAme]] = trst;
                break;
                case    "TIME":
                case    "HEAD_MARGIN":
                case    "TAIL_MARGIN":
// カット尺 前後記述マージン いずれもFCT表記可 (内部ではフレーム数で持つ)
                    var tm = nas.FCT2Frm(vAlue,SrcData.framerate.rate);
                    if (isNaN(tm)) tm = 0;
                    SrcData[props[nAme]] = tm;
                break;
// user_info 
                case  "CREATE_USER":
                case  "UPDATE_USER":
                   SrcData[props[nAme]] = new nas.UserInfo(vAlue);
                break;
// 管理情報シングルステージドキュメント
                case   "Line":;
                   SrcData[props[nAme]] = (vAlue)?
                       new nas.Xps.XpsLine(vAlue):new nas.Xps.XpsLine("0:"+nas.pmdb.pmWorkflows.entry('%default%').members[0].line);
//                       new nas.Xps.XpsLine(vAlue):new nas.Xps.XpsLine("0:"+nas.pmdb.pmTemplates.members[0].line);
                break;
                case   "Stage":;
                   SrcData[props[nAme]] = (vAlue)?
                       new nas.Xps.XpsStage(vAlue):new nas.Xps.XpsStage("0:"+nas.pmdb.pmWorkflows.entry('%default%').members[0].stages.members[0]);
//                       new nas.Xps.XpsStage(vAlue):new nas.Xps.XpsStage("0:"+nas.pmdb.pmTemplates.members[0].stages.members[0]);
                break;
                case   "Job":;
                   SrcData[props[nAme]] = (vAlue)?
                       new nas.Xps.XpsJob(vAlue):new nas.Xps.XpsJob("0:"+nas.Pm.jobNames[0]);
                break;
                  /* ステータス関連
                   *    指名情報及び申し送りはステータスのサブプロパティとして扱う
                   *    ステータスがない場合は無視する
                   */
                case   "CurrentStatus":;
                   SrcData.currentStatus = new nas.Xps.JobStatus(vAlue);
                  break;
                case   "JobAssign":;
                   if(SrcData.currentStatus) SrcData.currentStatus.assign = vAlue;
                  break;
                case   "Message":;
                //messageは複数行にわたるので読み出しルーチンが必要
                   if(SrcData.currentStatus) SrcData.currentStatus.message = vAlue;
                                //申し送りメッセージ取得フラグを立てて次のループに入る
                     readMessage=true;continue;
                break;
                case    "EXTENSION_DATA":;
//console.log(vAlue);
                    SrcData.extension_data = vAlue;
                                //申し送りメッセージ取得フラグを立てて次のループに入る
                    readExtension=true;continue;
                break;
                default:
// 時間関連以外
                    SrcData[props[nAme]] = vAlue;
// 判定した値をプロパティで控える
            };
        };
        /* タイムラインプロパティまたは終了識別にマッチ */
        if (SrcData[line].match(/^\[(([a-zA-Z]+)\t?.*)\]$/)) {
            /* シート終わっていたらメモを取り込んで終了 */
            if (SrcData[line].match(/\[END\]/)) {
                /* シートボディ終了ライン控え */
                SrcData.layerBodyEnd = line;
                SrcData["memo"] = '';
                for (var li = line + 1; li < SrcData.length; li++) {
                    SrcData["memo"] += SrcData[li];
                    if ((li + 1) < SrcData.length) {
                        SrcData["memo"] += "\n"
                    }
                    /* 最終行以外は改行を追加 */
                }
                break;
            } else {
                /* 各レイヤの情報を取得
                 * レイヤヘッダの開始行を記録
                 */
                if (SrcData.layerHeader == 0) SrcData.layerHeader = line;
                /* ロットを記録(最大の行を採る) */
                var trackCount = SrcData[line].split("\t").length - 1;
                SrcData.trackCount = (SrcData.trackCount < trackCount) ?
                    trackCount : SrcData.trackCount;
                /* エントリ数を記録 */
                SrcData.layerProps++;
            }
        } else {
            /* シートデータ本体の行数を加算 // 読み取りフレーム数*/
            if (!SrcData[line].match(/^\#.*$/)) SrcData.frameCount++;
        }
    }
//idf欠落が発生しないようにソースを調整(存在しない場合は初期化)
if(! SrcData.title)    SrcData.title    = this.title;
if(! SrcData.opus)     SrcData.opus     = this.opus;
if(! SrcData.subtitle) SrcData.subtitle = this.subtitle;
if(! SrcData.scene)    SrcData.scene    = this.scene;
if(! SrcData.cut)      SrcData.cut      = this.cut;
if(! SrcData.time)     SrcData.time     = this.time();
if(! SrcData.line)     SrcData.line  = new nas.Xps.XpsLine("0:"+nas.pmdb.pmWorkflows.entry("%default%").members[0].line);
if(! SrcData.stage)    SrcData.stage = new nas.Xps.XpsStage("0:"+nas.pmdb.pmWorkflows.entry("%default%").members[0].stages.members[0]);
//if(! SrcData.line)     SrcData.line  = new nas.Xps.XpsLine("0:"+nas.pmdb.pmTemplates.members[0].line);
//if(! SrcData.stage)    SrcData.stage = new nas.Xps.XpsStage("0:"+nas.pmdb.pmTemplates.members[0].stages.members[0]);
if(! SrcData.job)      SrcData.job   = new nas.Xps.XpsJob("0:"+nas.Pm.jobNames[0]);
if(! SrcData.currentStatus ) SrcData.currentStatus = (SrcData.job.id == 0)? new nas.Xps.JobStatus('Startup'):new nas.Xps.JobStatus('Fixed');
// 第二パス終了・読み取った情報でXPSオブジェクトを再初期化(共通)
//console.log(SrcData);
// 継続時間確定に先行してマージンを算出
    if (SrcData.headMargin < SrcData.trin.frames(SrcData.framerate) / 2)
        SrcData.headMargin = Math.ceil(SrcData.trin.frames(SrcData.framerate) / 2);
    if (SrcData.tailMargin < SrcData.trout.frames(SrcData.framerate) / 2)
        SrcData.tailMargin = Math.ceil(SrcData.trout.frames(SrcData.framerate) / 2);
//表記上の継続時間を取得
    SrcData.duration = Math.ceil( SrcData.time + SrcData.headMargin + SrcData.tailMargin);
//実データと記載を比較して長い方を実際の継続時間にする
    var SheetDuration = (SrcData.duration > (SrcData.frameCount - 1)) ?
        SrcData.duration : (SrcData.frameCount - 1);//大きいほうで
//確定した継続時間からマージンを再計算
    var sheetHeadMargin = SrcData.headMargin;
    var sheetTailMargin = SheetDuration - sheetHeadMargin;

//pmu設定のため進捗ステータスを組み上げる
var xmapidf = nas.Pm.stringifyIdf([
    SrcData.title,
    SrcData.opus,
    SrcData.subtitle,
    SrcData.scene,
    SrcData.cut,
    SrcData.time,
    SrcData.line.toString(true),
    SrcData.stage.toString(true),
    SrcData.job.toString(true),
    SrcData.currentStatus.toString(true)
]);
//Xps再初期化
    this.init(SrcData.trackCount, SheetDuration,SrcData.framerate,xmapidf);
//ノードマネージャー内の対応ノードの日付を設定
    var currentNode = this.pmu.nodeManager.nodes[0];
    currentNode.createDate = new Date(SrcData.create_time);
    currentNode.updateDate = new Date(SrcData.update_time);
    currentNode.createUser = new nas.UserInfo(SrcData.create_user);
    currentNode.updateUser = new nas.UserInfo(SrcData.update_user);
    currentNode.sessionIdf = SrcData.sessionIdf;
    currentNode.clientIdf  = SrcData.clientIdf;

    if(SrcData.job.toString(true) == this.pmu.nodeManager.nodes[0].toString(true)){
//console.log('OK-match');
    }else{
//console.log('NOGOOD :' +SrcData.job.toString(true) +' : '+ this.pmu.nodeManager.nodes[0].toString(true));
    };
//新フォーマットのデータにはsheetLooksが含まれる
/*
    sheetLooksは必ずしも実際のトラック数と一致はしないので注意が必要
    現在の使用では sheetLooksを維持したままトラックの増減が行われる
    トラックスペックに対して保持されるのはエリアオーダーでありエリアオーダー内のトラック数はトラックスペックと必ずしも一致しない
*/
    if( SrcData.sheetLooks ){
console.log('srcdata has sheetLooks');
console.log( SrcData.sheetLooks );
//        this.sheetLooks = JSON.parse(SrcData.sheetLooks);
        this.parseSheetLooks(JSON.parse(SrcData.sheetLooks));
        if(SrcData.documentMode) this.documentMode = String(SrcData.documentMode).trim();
    }else{
//旧データにはsheetLooksが存在しないため 一旦標準的なデータを複製して、TrackSpecの整合をとる
console.log('srcdata has no sheetLooks');
        var options = SrcData.find(function(e){return (e.indexOf('[option\t') == 0)})
        var soundCount   = 0;
        var cellCount    = 0;
        var cameraCount  = 0;
        if(options){
console.log(options);
            var trackOptions = options.split('\t');
console.log(trackOptions);
            trackOptions.reverse().forEach(function(e){
                var dtct = false;
                if((nas.Xps.AreaOptions[e] == 'camera')||(nas.Xps.AreaOptions[e] == false)){
                    if (!dtct) cameraCount ++ ;
                }else if((typeof nas.Xps.AreaOptions[e] != 'undefined')||(nas.Xps.AreaOptions[e] != 'camera')){
                    dtct = true;
                };
            });
            trackOptions.forEach(function(e){
                var dtct = false;
                if((nas.Xps.AreaOptions[e] == 'sound')||(nas.Xps.AreaOptions[e] == false)){
                    if (cellCount == 0) soundCount ++ ;
                }else if((typeof nas.Xps.AreaOptions[e] != 'undefined')||(nas.Xps.AreaOptions[e] == 'sound')){
                    dtct = true;
                };
            });
            cellCount = (trackOptions.length - soundCount - cameraCount - 2)
        };
//        this.sheetLooks = JSON.parse(JSON.stringify(xUI.sheetLooks));
//旧来データのトラックスペック
/*        this.sheetLooks.trackSpec = [
            ['timecode',1,'fix'],
            ['reference',cellCount,'fix'],
            ['sound',soundCount,'fix'],
            ['replacement',cellCount,''],
            ['camera',cameraCount,''],
            ['comment',1,'']
        ];// */
console.log( this.sheetLooks.trackSpec );
        this.documentMode = 'Page';
    };
/*
//	///////////////////////フォーマット拡張
    if(Object.keys(this.sheetLooks).length > 0){
console.log('INIT TRACKSPEC')
        this.init(this.sheetLooks.trackSpec, SheetDuration,SrcData.framerate);//再初期化
    }else{
    };// */
//console.log('INIT TRACKCOUNT')
//    this.init(SrcData.trackCount-2, SheetDuration,SrcData.framerate);//再初期化
//    if( SrcData.sheetLooks ){
//        this.parseSheetLooks(SrcData.sheetLooks);//再初期化
//    };
// 第二パスで読み取ったプロパティをXPSに転記
// time/currentStatus/extension_data 以外はそのまま転記
    for (var id = 0; id < propNames.length; id++) {
        var prpName = propNames[id];
//        if (SrcData[prpName] && prpName != "time") this[prpName] = SrcData[prpName];
        if (SrcData[prpName] && prpName != "time") {
            if((this[prpName].setValue)&&(this[prpName].setValue instanceof Function)){
                this[prpName].setValue(SrcData[prpName]);
            }else if((this[prpName].parse)&&(this[prpName].parse instanceof Function)){
                this[prpName].parse(SrcData[prpName]);
            }else{
                this[prpName] = SrcData[prpName];
            };
        };
    };
// 読み取りデータを調べて得たキーメソッドとブランク位置を転記
    for (var lyr = 0; lyr < SrcData.layers.length; lyr++) {
        this.xpsTracks[lyr].blmtd = SrcData.layers[lyr].blmtd;
        this.xpsTracks[lyr].blpos = SrcData.layers[lyr].blpos;
        this.xpsTracks[lyr].lot = SrcData.layers[lyr].lot;
    }
//memo(noteText)があれば転記
    if (SrcData["memo"]) this.xpsTracks.noteText = SrcData["memo"];//後ほどメモパーサを作って入れ替え？
//拡張データ処理
    if( SrcData.signatures ) this.signatures.parse(SrcData.signatures);
    if( SrcData.sheetLooks ) this.sheetLooks = JSON.parse(SrcData.sheetLooks);
//画像データ
    this.timesheetImages.clearMember();
    if( SrcData.timesheetImages ) this.timesheetImages.parse(SrcData.timesheetImages);
    this.noteImages.clearMember();
    if( SrcData.noteImages )      this.noteImages.parse(SrcData.noteImages);
// 各エントリのトラックプロパティとシート本体情報を取得(第三パス)
    var frame_id = 0;//読み取りフレーム初期化
//pmu 同期
//    this.syncPmuProps();

    for (var line = SrcData.layerHeader; line < SrcData.layerBodyEnd; line++) {
// 角括弧で開始するデータはタイムライントラックプロパティ
        if (SrcData[line].match(/^\[(([a-zA-Z]+)\t.*)\]$/)) {
            var layerProps = RegExp.$1.split("\t");
            var layerPropName = RegExp.$2;
// "CELL"のみシート表記とプロパティ名が一致していないので置換 一致が少ない場合はテーブルが必要になる
            if (layerPropName == "CELL") {
                layerPropName = "id";//cahanged "name" to "id" 20160818
            };
// レイヤプロパティが空白の場合があるので適切なデータで置き換える?  読み込みで例外処理を作るべきか？
            for (var c = 0; c < SrcData.trackCount; c++) {
            	if(layerProps[c + 1]==""){
            		if (layerPropName=="option"){
            			layerProps[c + 1]=(c==0)?"dialog":"comment";
            		};
            	};
                this.xpsTracks[c][layerPropName] = layerProps[c + 1];
            }
        } else {
// ほかコメント以外はすべてシートデータ
            if (!SrcData[line].match(/^\#.*$/)) {
                var myLineAry = (SrcData[line].match(/\t/)) ? SrcData[line].split("\t") : SrcData[line].replace(/[\;\:\,]/g, "\t").split("\t");
                for (var col = 1; col <= (SrcData.trackCount); col++) {
// シート本体データの取得
                    this.xpsTracks[col - 1][frame_id] = (myLineAry[col] != undefined) ?
                        myLineAry[col].replace(/(^\s*|\s*$)/, "") : "";
                };
                frame_id++;
            };
        };
    };
//読み出しデータからPmUnitを初期化
//nas.Pm.SCi = function SCi(cutName,cutProduct,cutTime,cutTRin,cutTRout,cutRate,cutFrate,cutId)
//nas.Pm.PmUnit=function(parentData,productIdentifier)
/*	var mySCi = new nas.Pm.SCi(
		this.cut,
		this.opus,
		this.time(),
		this.trin,
		this.trout,
		this.rate,
		this.framerate
	);
    this.pmu.setProduct(this.title+'#'+((this.opus.name)?this.opus.name:this.opus)+'//'+mySCi.toString('full'));
    this.pmu.nodeManager.reset();
    var ln  = this.pmu.nodeManager.new_ManagementLine(this.line.toString(true));
    var stg = this.pmu.nodeManager.new_ManagementStage(this.stage.toString(true),ln);
    var nd  = this.pmu.nodeManager.new_Job(this.job.toString(true),stg);
 */
// 転記後にareaOrderの再初期化
    this.xpsTracks.initAreaOrder(this.sheetLooks.trackSpec);
    this.xpsTracks.assignAreaOrderMember();

//console.log(JSON.stringify(this.pmu.nodeManager.getChart()));
/* データ読込終了時一括処理 checkdata
 *
 * 読み取ったデータを検査する(データ検査は別のメソッドにしろ!??)
 * マップファイルは、現在サポート無し
 * サポート開始時期未定
 * この情報は、他の情報以前に判定して、マップオブジェクトの生成が必要。
 * マップ未設定状態では、代用マップを作成して使用。
 * 代用マップは、デフォルトで存在。
 * 現在は、代用MAPオブジェクトを先行して作成してあるが、
 * 本来のマップが確定するのはこのタイミングなので、注意!
 */
//console.log(this.toString());
//   仮設　ｘMap初期化　2018.12
if (! (this.xMap.currentJob)) this.xMap.syncProperties(this); 
    return this;
};

/**
 * 書きだしメソッド
 *  @params {Boolean} exprt
 *      エクスポートオプション 未指定の場合は true
 *      exprtに明示的にfalseを設定することで内部コンバート用の出力となる
 *      パーサにはオプションはない
 *  @returns {string}
 *
 */
nas.Xps.prototype.toString = function (exprt){
    if(typeof exprt == 'undefined') exprt = true;
    var Now = new Date();//toStringの用途が保存時のみでなくなったので自動更新手法を変更
    if(! this.id)        this.id        = nas.uuid();
    if(! this.timestamp) this.timestamp = Now.getTime();
    /**
     * セパレータ文字列調整
     * @type {string}
     */
    var bold_sep = '\n#';
    for (var n = this.xpsTracks.length ; n > 0; n--) bold_sep += '========';
    var thin_sep = '\n#';
    for (var n = this.xpsTracks.length ; n > 0; n--) thin_sep += '--------';
    /**
     * ヘッダで初期化
     * @type {string}
     */
//    var result = 'nasTIME-SHEET 0.4';//出力変数初期化(旧バージョン)
//    var result = 'nasTIME-SHEET 0.5';//出力変数初期化
//    var result = 'nasTIME-SHEET 0.5a';//以降はプロパティ化

    var result = this.XpsFormatVersion ;
    /**
     * 共通プロパティ変数設定
     * @type {string}
     */
    result += '\n##MAPPING_FILE=' + this.mapfile;
    
    if(this.dataNode) result += '\n##REPOSITORY='   + this.dataNode;
    if(this.timestamp)      result += '\n##TIMESTANP='    + this.timestamp;
    if(this.id)             result += '\n##ID='           + this.id;

    result += '\n##TITLE='        + this.title;
    result += '\n##SUB_TITLE='    + this.subtitle;
    result += '\n##OPUS='         + this.opus;
    result += '\n##SCENE='        + this.scene;
    result += '\n##CUT='          + this.cut;
    result += '\n##TIME='         + nas.Frm2FCT(this.time(), 3, 0, this.framerate);
    result += '\n##TRIN='         + this.trin.toString('xps');
    result += '\n##TROUT='        + this.trout.toString('xps');
// あれば記入
    if(this.headMargin) result += '\n##HEAD_MARGIN=' + this.headMargin.toString();
    if(this.tailMargin) result += '\n##TAIL_MARGIN=' + this.tailMargin.toString();
    result += '\n##CREATE_USER='  + this.create_user;
    result += '\n##UPDATE_USER='  + this.update_user;
    result += '\n##CREATE_TIME='  + this.create_time;
    result += '\n##UPDATE_TIME='  + ((this.update_time)? this.update_time:Now.toNASString());
    result += '\n##FRAME_RATE='   + this.framerate.toString();
    result += '\n##Line='         +this.line.toString();
    result += '\n##Stage='        +this.stage.toString();
    result += '\n##Job='          +this.job.toString();
    result += '\n##CurrentStatus='+this.currentStatus.toString();
if((this.currentStatus.assign)&&(this.currentStatus.assign.length))
    result += '\n##JobAssign='    +this.currentStatus.assign;
if((this.currentStatus.message)&&(this.currentStatus.message.length))
    result += '\n##Message='      +this.currentStatus.message;
//result+='\n##FOCUS='	+11//
//result+='\n##SPIN='	+S3//
//result+='\n##BLANK_SWITCH='	+File//
    result += '\n#';
//拡張署名
    if((this.signatures)&&(this.signatures.members.length)){
        result += '\n##<signatures>\n';
        result += this.signatures.dump('text');
        result += '\n##<signatures>/';
    };
//書類レイアウト・表示モード
        result += '\n##<sheetLooks>\n';
        result += JSON.stringify(this.xpsTracks.getSheetLooks(),null,2).replace(/\n\s{6}/g,'').replace(/\n\s{4}\]/g,'\]');
        result += '\n##<sheetLooks>/';
        result += '\n##<documentMode>\n';
        result += this.documentMode;
        result += '\n##<documentMode>/';//画像データ
    if(Object.keys(this.timesheetImages).length > 0){
        result += '\n##<timesheetImages>\n';
        result += this.timesheetImages.dump(exprt);
        result += '\n##<timesheetImages>/';
    };
    if(Object.keys(this.noteImages).length > 0){
        result += '\n##<noteImages>\n';
        result += this.noteImages.dump(exprt);
        result += '\n##<noteImages>/';
    };
    result += '\n#';
//以下トラックプロパティ
    result += bold_sep;//セパレータ####################################
    /**
     * レイヤ別プロパティをストリームに追加
     * @type {string[]}
     */
    var Lprops = ["sizeX", "sizeY", "aspect", "lot", "blmtd", "blpos", "option", "link", "tag", "id", "value"];
//	var Lprops=["sizeX","sizeY","aspect","lot","blmtd","blpos","option","link","CELL"];
    for (var prop = 0; prop < Lprops.length; prop++) {
        var propName = Lprops[prop];
        var lineHeader = (propName == "id") ?
            '\n[CELL' : '\n[' + propName;
        result += lineHeader;
        for (var id = 0; id < this.xpsTracks.length; id++) {
            result += "\t" + this.xpsTracks[id][propName];
        }
        result += ']';//
    }
    /**
     * セパレータ
     * @type {string}
     */
    result += bold_sep;//セパレータ####################################
    /**
     * シートボディ
     */
    for (var line = 0; line < this.duration(); line++) {
        result += '\n.';//改行＋ラインヘッダ
        for (var column = 0; column < (this.xpsTracks.length); column++) {
            var address = column + '_' + line;
            result += '\t' + this.xpsTracks[column][line];
        }
        /**
         * 1/4秒おきにサブセパレータ/秒セパレータを出力
         */
        if ((line + 1) % Math.round(this.framerate / 4) == 0) {
            if ((line + 1) % Math.round(this.framerate) == 0) {
                result += bold_sep;
            } else {
                result += thin_sep;
            }
        }
    }
    /**
     * ボディ終了セパレータ
     * @type {string}
     */
    result += bold_sep;//セパレータ####################################
    /**
     * ENDマーク
     * @type {string}
     */
    result += '\n[END]\n';
    /**
     * メモ
     * @type {string|*}
     */
//    result += this.memo;
    result += this.xpsTracks.noteText;

    /**
     *  返す(とりあえず)
     */

    /**
     * 引数を認識していくつかの形式で返すように拡張予定
     * セパレータを空白に変換したものは必要
     * 変更前(開始時点)のバックアップを返すモード必要/ゼロスクラッチの場合は、カラシートを返す。
     */
    return result;
};

/**
 * nas.Xps.isSame(targetXps)
 * 引数    比較するXpsオブジェクト
 * シート内容比較メソッド 相互の値が同じか否か比較する関数
 * ユーザ名・時間等は比較しないでシート内容のみ比較する
 * コメント類は連続する空白をひとつにまとめて比較する
 * フレームレートを比較するオプションのデフォルト値はfalse
 * @params targetXps
 * @params compareFramerate bool
 * @returns {boolean}
 */
nas.Xps.prototype.isSame = function (targetXps,compareFramerate) {
    if(typeof compareFramerate == 'undefined') compareFramerate = false;

    if( (compareFramerate) &&
        ((this.framarate.rate != targetXps.framerate.rate) ||
         (this.framarate.opt != targetXps.framerate.opt))
    ){ return false }
    var rejectRegEx = new RegExp("framerate|errorCode|errorMsg|mapfile|xMap|pmu|create_time|create_user|update_time|update_user|layers|trin|trout|xpsTracks|memo|line|stage|job|currentStatus|JobAssign|Message|id|timestamp|dataNode");
    /**
     * プロパティリスト
     */
//id,xMap,pmu,timestamp,dataNode,line,stage,job,currentStatus,opus,title,subtitle,scene,cut,inherit,trin,trout,framerate,rate,create_time,create_user,update_time,update_user,xpsTracks,mapfile,init,syncPmuProps,newTracks,timeline,getIdentifier,syncIdentifier,duration,getDuration,time,getTC,insertTL,deleteTL,setDuration,reInitBody,getRange,put,readIN,parseXps,toString,isSame,getNormarizedStream,getNoteText";
/**
    フレームレートを比較するオプションのデフォルト値はfalse
*/
    for (var myProp in this) {
        if ((myProp.match(rejectRegEx)) || (this[myProp] instanceof Function)) {
            continue
        }
        /**
         *  ここでは比較しないものをリジェクト
         */
        if ((this[myProp] instanceof Array)) {
            continue
        }
        /**
         * 配列プロパティをスキップしているので注意 後で配列比較を書く
         */
        if ((this[myProp] == targetXps[myProp])) {
            continue
        }
        /**
         * プロパティがあれば比較してマッチしていればスキップ(targetXps[myProp])&&
         */
//		return [this[myProp],targetXps[myProp]].join(" != ");//抜けたデータがあればNG判定で終了
//console.log('no match :'+myProp);
        return false;//
    }
//opus,title,subtitle,scene,cut,trin,trout,framerate,
//nas.otome.writeConsole(this.xpsTracks.length);

    if (this.xpsTracks.length != targetXps.xpsTracks.length) {
        return false
    }

    /**
     * TimelineTracksのサブプロパティ比較
     */
    for (var lIdx = 0; lIdx < this.xpsTracks.length; lIdx++) {
        for (var myProp in this.xpsTracks[lIdx]) {
            if (this.xpsTracks[lIdx][myProp] instanceof Object) continue;
            if ((this.xpsTracks[lIdx][myProp] == targetXps.xpsTracks[lIdx][myProp])) {
                continue
            }
            //(targetXps.layers[lIdx][myProp])&&
//console.log('no match track prop :'+myProp);
            return false;
        }
    }

    /**
     * メモ比較
     */
    if (this.xpsTracks.noteText.replace(/¥s+/g, " ").replace(/¥n/g, "") != targetXps.xpsTracks.noteText.replace(/¥s+/g, " ").replace(/¥n/g, "")) {
//console.log('no match memo :');
        return false
    }
    /**
     * ボディ比較
     */
    if (this.xpsTracks.length != targetXps.xpsTracks.length) {
        return false
    }
    if (this.xpsTracks[0].length != targetXps.xpsTracks[0].length) {
//console.log('no match TimelinTrackDuration :');
        return false
    }
    for (var L = 0; L < this.xpsTracks.length; L++) {
        for (var F = 0; F < this.xpsTracks[0].length; F++) {
            if (this.xpsTracks[L][F] == targetXps.xpsTracks[L][F]) {
                continue
            }
//console.log('no match timeline :' + [L,F].join());
            return false;
        }
    }
    /**
     * 比較順序は後で見直しが必要多分
     */
    return true;
};
/** =====================================機能分割 20130221
 * レイヤストリームを正規化する
 * 内部処理用
 * レイヤのデータ並びと同じ要素数の有効データで埋まった配列を返す
 *
 * キー作成に必要な機能だが、汎用性があるので分離してXpsのメソッドに
 * キー作成はXPSのメソッドとして独立させる
 * 中間値補間サインはオプションでその挙動を制御する？
 *
 * タイムラインの種別によってデータが変化するのでその仕組みを組み込む
 * 正規化されたストリーム形成は、同時にセクションの解析でもあるので、
 * このルーチンに組み込むか否か判断が必要
 *
 * 取扱タイムライン種別が"timing"限定でなくなるので、他種別の処置を設定
 * 引数の種別を最初に判定する
 * 引数範囲をシフトする
 *
 * 以下の正規化ストリーム取得関数はセクションが実装されたら不要
 
 2016 08 の改修でセクションオブジェクトを実装するので
 （少なくともタイミング向けに実装）この正規化メソッドの修正はしない
 *
 * @params layer_id
 * @returns {Array}
 */
nas.Xps.prototype.getNormarizedStream = function (layer_id) {
    var layerDataArray = this.xpsTracks[layer_id + 1];
    layerDataArray.label = (layer_id < 0) ? "N" : this.xpsTracks[layer_id].id;
    if (layer_id < 0) {
        var blank_pos = "end";
        var key_max_lot = 0;
    } else {
        var blank_pos = this.xpsTracks[layer_id].blpos;
        var key_max_lot = (isNaN(this.xpsTracks[layer_id].lot)) ?
            0 : this.xpsTracks[layer_id].lot;
    }
    /**
     * ブランク処理フラグ
     * @type {boolean}
     */
    var bflag = (blank_pos) ? false : true;
    /**
     * レイヤロット変数の初期化
     * @type {number}
     */
    var layer_max_lot = 0;
    /**
     * シートのタイムラインからフルフレーム有効データの配列を作る
     * 全フレーム分のバッファ配列を作る
     * @type {Array}
     */
    var bufDataArray = new Array(layerDataArray.length);
    /**
     * 第一フレーム評価・エントリが無効な場合空フレームを設定
     * @type {*}
     */
    var currentValue = dataCheck(layerDataArray[0], layerDataArray.label, bflag);
    if (currentValue == "interp") currentValue = false;
    bufDataArray[0] = (currentValue) ? currentValue : "blank";

/*
 * 2>>ラストフレーム ループ
 */
    for (var f = 1; f < layerDataArray.length; f++) {
 /*
 * 有効データを判定して無効データエントリを直前のコピーで埋める
 */
        currentValue = dataCheck(layerDataArray[f], layerDataArray.label, bflag);
        if (currentValue == "interp") currentValue = false;//キー変換 && timing 限定
        bufDataArray[f] = (currentValue) ? currentValue : bufDataArray[f - 1];

        if ((bufDataArray[f] != "blank") && (bufDataArray[f] != "interp")) {
            layer_max_lot = (layer_max_lot > bufDataArray[f]) ?
                layer_max_lot : bufDataArray[f];
        }
    }
    var max_lot = (layer_max_lot > key_max_lot) ?
        layer_max_lot : key_max_lot;
/*
 * あらかじめ与えられた最大ロット変数と有効データ中の最大の値を比較して
 * 大きいほうをとる
 * ここで、layer_max_lot が 0 であった場合変換すべきデータが無いので処理中断
 *  >全部ブランクであってもリザルトは返すように変更
 */
    return bufDataArray;
};

/**
    Xpstノートテキストを返す
    行頭が"_※ "のエントリーは、システムがシートから拾い上げて追加するエントリー
*/
nas.Xps.prototype.getNoteText = function(){
    var result = [];
//トランジションが存在すればそれを記載
    var transitText = "";
    transitText += this.trin.toString();
    if (transitText.length) transitText += ' / ';
    transitText += this.trout.toString();
	if (transitText.length) result.push("]X[" + transitText);
//カメラワークオブジェクトを記載
    for (var tix = 0;tix < this.xpsTracks.length;tix++){
        if(this.xpsTracks[tix].option =='camera'){
            var sections = this.xpsTracks[tix].parseTimelineTrack();
            for (var six = 0;six < sections.length ; six ++){
                if(sections[six].value) result.push(sections[six].value.toString());
            }
        }
    }
//ユーザ文字列を追加
    if(this.xpsTracks.noteText) result.push(this.xpsTracks.noteText);

    return result.join("\n");
}

//xUI.XPS.getNoteText();
/* Class Method */
/**
    グループ記述の有る文字列を分解して要素名とグループ名を分離するXpsクラスメソッド
    引数の文字列を評価してそのラベルとエントリ文字列に分解して返す
    Reaplacmentトラック用

引数:セルエントリ文字列
戻値:配列[エントリ文字列,グループラベル]

グループラベルが存在しない文字列の戻値は要素数１の配列
 */
nas.Xps.sliceReplacementLabel = function (myStr){
    let myLabel ;let myName ;
    if(myStr.match(/^(.+)[\s\-_]([^\s\-_].*)$/)){
        myLabel = RegExp.$1;
        myName  = RegExp.$2;
    } else if (myStr.match(/^([A-Z])(\(?.+\)?|\[?.+\]?|<?.+>?)$/)){
        myLabel = RegExp.$1;
        myName  = RegExp.$2;
    } else {
        return [myStr];
    }
    return [myName,myLabel];
}
// test
/*
   var myResult="";
   var testStrings=[
    "123","A123","A(123)","A<_=123>","A[123x]","A下-123","A--(123x)",A[◯]
   ];
    for(var idx=0;idx<testStrings.length;idx++){
        myResult += testStrings[idx]+" : "+nas.Xps.sliceReplacementLabel(testStrings[idx])+"\n";
    }
//if(dbg) console.log(myResult);
*/
/**
     Xpsオブジェクトから識別子を作成するクラスメソッド
     名前を変更するか又はオブジェクトメソッドに統合
     このメソッドは同名別機能のオブジェクトメソッドが存在するので厳重注意
     クラスメソッドはURIencodingを行い、オブジェクトメソッドは'%'エスケープを行う

*** 識別子のフレームレート拡張（予定）
    (括弧)でくくられた時間情報は、カット尺であり素材継続時間ではない。
    フレームレートを追加情報として補うことが可能とする
    その際は以下のルールに従う
    (FCT/FPS)
    単独のカットに対して設定されたフレームレートは、そのカットのみで有効
    基本的には、タイトルのプロパティからフレームレートを取得してそれを適用する。
    識別子には、基本的にフレームレートを含める必要性はない。
    タイトルのフレームレートと異なる場合のみ、識別子にフレームレートを埋め込む。

    このコーディングは、pmdb実装後に行われる。2018.07.16

引数  opt
"title"#"opus"//"s-c"("time")//"line"//"stage"//"job"//"status"
'episode'(or 'product')//'cut'//'statsu'

デフォルトでは制作管理情報が付加されたフルフォーマットの識別子が戻る

*/
nas.Xps.getIdentifier = function(myXps,opt){
//この識別子作成は実験コードです2016.11.14
    if(typeof opt=='undefined') opt ='status';
    var myIdentifier=[
            encodeURIComponent(myXps.title)+
        "#"+encodeURIComponent(myXps.opus.toString('name'))+
        ((String(myXps.subtitle).length > 0)? "["+encodeURIComponent(myXps.subtitle)+"]":''),
            encodeURIComponent(
                "s" + ((myXps.scene)? myXps.scene : "-" )+
                "c" + myXps.cut) +
                "(" + myXps.time() +")",
            encodeURIComponent(myXps.line.toString(true)),
            encodeURIComponent(myXps.stage.toString(true)),
            encodeURIComponent(myXps.job.toString(true)),
            myXps.currentStatus.toString(true)
        ];// */
/*    var myIdentifier=[
            encodeURIComponent(myXps.pmu.title)+
        "#"+encodeURIComponent(myXps.pmu.opus.toString('name'))+
        ((String(myXps.pmu.subtitle).length > 0)? "["+encodeURIComponent(myXps.pmu.subtitle)+"]":''),
            encodeURIComponent(
                "s" + ((myXps.pmu.scene)? myXps.pmu.scene : "-" )+
                "c" + myXps.pmu.cut) +
                "(" + myXps.time() +")"];
        if(myXps.pmu.currentNode){
            myIdentifier.splice(myIdentifier.length,0,
                encodeURIComponent(myXps.pmu.currentNode.stage.parentLine.toString(true)),
                encodeURIComponent(myXps.pmu.currentNode.stage.toString(true)),
                encodeURIComponent(myXps.pmu.currentNode.toString(true)),
                myXps.pmu.currentNode.jobStatus.toString(true)
            );
        };// */
    var order = 2;     
    switch(opt){
    case 'title':
    case 'opus':
    case 'episode':
    case 'product':
        order = 1;break;
    case 'cut':
        order = 2;break;
    case 'line':
        order = 3;break;
    case 'stage':
        order = 4;break;
    case 'job':
        order = 5;break;
    case 'status':
    case 'full':
    default:
        order = 6;break;
    }
//識別子をネットワークリポジトリに送信後正常に追加・更新ができた場合は（コールバックで）ローカルリストの更新を行うこと
    return myIdentifier.slice(0,order).join("//");;
}


/*
    仮の比較関数
    SCiオブジェクトに統合予定
    一致推測は未実装
    戻値:数値  -2   :no match
               -1   :title match
                0   :product match
                1   :product + cut match
                2   :line match
                3   :stage match
                4   :job match
                5   :status match

ステータス情報のうちassign/messageの比較は行わないステータス自体の比較もほぼ利用されないので省略を検討
*/
nas.Xps.compareIdentifier = function (target,destination){
    var tgtInfo  = nas.Xps.parseIdentifier(target);
    var destInfo = nas.Xps.parseIdentifier(destination);
    //title
        if(tgtInfo.title != destInfo.title) { return -2;}
    //title+opus
        if( tgtInfo.opus != destInfo.opus ) { return -1;}
    //Scene,Cut
        var tgtSC = tgtInfo.cut;
        var dstSC = destInfo.cut;
        if((! tgtSC)||(! dstSC)) return 0;
        if(tgtSC != dstSC){return 0;}
        var result = 1;
    //version status
        if (((tgtInfo.line)&&(destInfo.line))&&(tgtInfo.line.id.join() == destInfo.line.id.join() )){
            result = 2;}else{return result;}
        if (((tgtInfo.stage)&&(destInfo.stage))&&(tgtInfo.stage.id == destInfo.stage.id )){
            result = 3;}else{return result;}
        if (((tgtInfo.job)&&(destInfo.job))&&(tgtInfo.job.id  == destInfo.job.id )){
            result = 4;}else{return result;}
        if ((tgtInfo.currentStatus)&&(destInfo.currentStatus)&&(tgtInfo.currentStatus.content == destInfo.currentStatus.content)) result = 5;
        return result;
}
/*  TEST
var A =[
    "うなぎ",0,"ニョロ",
    "","12","2+0",
    "0:(本線)","1:原画","2:演出チェック","Startup:kiyo@nekomataya.info:TEST"
    ];
var B =[
    "うなぎ",0,"ニョロ",
    "","12","2+0",
    "0:(本線)","1:原画","2:演出チェック","Startup"
    ];
nas.Xps.compareIdentifier("35%E5%B0%8F%E9%9A%8A_PC#RBE//04d",'35%E5%B0%8F%E9%9A%8A_PC#RBE[ベルセルク・エンチャント演出]')
//console.log(nas.Xps.compareIdentifier(nas.Xps.stringifyIdf(A),nas.Xps.stringifyIdf(B)))
*/
/**
    識別子をパースする関数
    SCiオブジェクトで戻す？
    Identifier の持ちうる情報は以下

    title
        .name
    opus
        .name
        .subtitle
    [sci]
        .name
        .times
    
    [issues]
        Line
            .id
            .name
        Stage
            .id
            .name
        Job
            .id
            .name
    status
        JobStatus
            .content
            .assign
            .message
*/
/**
    プロダクト識別子をパースして返す
    サブタイトルは一致比較時に比較対象から外す
    引数がまたは第一要素がカラの場合はfalse
*/
nas.Xps.parseProduct = function(productString){
    var dataArray = String(productString).replace( /[\[\]\/]/g ,'#').split('#');
    return {
        title     :   ((typeof dataArray[0]=='undfined')||(String(dataArray[0])=='undefined'))? "":decodeURIComponent(dataArray[0]),
        opus      :   ((typeof dataArray[1]=='undfined')||(String(dataArray[1])=='undefined'))? "":decodeURIComponent(dataArray[1]),
        subtitle  :   ((typeof dataArray[2]=='undfined')||(String(dataArray[2])=='undefined'))? "":decodeURIComponent(dataArray[2])
    };
}
/** test
//if(dbg) console.log (nas.Xps.parseProduct('%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB%E6%9C%AA%E5%AE%9A#%E7%AC%AC%20%20%E8%A9%B1[TEST]//s-c123(144)//'));
*/
/**
    sci識別子をパースして返す
    識別子に付属する時間情報はトランジション／継続時間ではなくカット尺のみ
    補助情報は持たせない。かつ対比時に比較対象とならないものとする
    カット番号情報は、ここではscene-cutの分離を行わない
    比較の必要がある場合に始めて比較を行う方針でコーディングする
    sciString末尾の（括弧内）は時間情報部分
    (括弧)による記述が2つ以上ある場合は最初の開き括弧の前がカット識別子で、時間情報は最後の（括弧）内の情報を用いる
    
    書式は(TC//framareteString) or (TC) フレームレートの指定のない場合はデフォルトの値で補われる
    (1+12),(1+12//24FPS),(1:12//30),(01:12//30DF),(00:00:01:12//59.94)等
    デフォルト値は、タイトルから取得
    sciStringに時間情報が含まれないケースあり
    time指定の存在しない識別子の場合"6:0"を補う

    引数が与えられない場合は''とする
*/
nas.Xps.parseSCi = function(sciString){
    if(typeof sciString == 'undefined') sciString = '';
    var dataArray = String(sciString).split('/');
//    if((dataArray.length==0)||(String(dataArray[0]).length==0)){return false};
    var result = [];
    for (var ix=0;ix < dataArray.length ;ix ++){
        var currentEntry=dataArray[ix].split('(');
        result.push({
        'cut'   :   decodeURIComponent(currentEntry[0]),
        'time'  :   (currentEntry.length ==1 )? "6:0":decodeURIComponent(currentEntry[currentEntry.length-1]).replace(/[\(\)]/g,'')
        });
    }
    return result;
}
/** test
    console.log (nas.Xps.parseSCi('s-cC%23%20(16)/s-c96(13)'));
    console.log (nas.Xps.parseSCi('s-cC%23%20(16)(18)'));
*/
/**
セル記述を整形して比較評価用に正規化された文字列を返すクラスメソッド
戻り値は、<グループ名>-<セル番号>[-<ポストフィックス>]

A_(001)_ovl  A-1-ovl
*/
nas.Xps.normalizeCell = function(myString){
    return nas.normalizeStr(myString.replace( /[-_ー＿\s]/g ,"-")).replace( /([^\d.])0+/g ,"$1");
}
//test
//nas.Xps.normalizeCell("A_００１２ー上");
//nas.Xps.normalizeCell("");
//nas.Xps.normalizeCell("");
//nas.Xps.normalizeCell("");
//nas.Xps.normalizeCell("");
//nas.Xps.normalizeCell("");
//nas.Xps.normalizeCell("");
/**
SCiデータ上のカット名をセパレータで分離するクラスメソッド
この場合のカット名には時間情報・ステータス等を含まないものとする
パースされたカット名は、カット、シーンの順の配列で戻す有効最大２要素

    [cut,scene,<void>,~];//第三要素以降は分離しても使用されないことに注意
    [cut,scene]
    [cut]

要素数が識別子に含まれる情報の深度を示す
*/
nas.Xps.parseCutIF = function(myIdentifier){
    var result = String(myIdentifier).replace(/[\ _\-]+/g,"_").split("_").reverse();
    for (var ix=0;ix<result.length;ix++){
        if(ix==0){result[ix]=result[ix].replace(/^[CcＣｃ]/,"");};//cut
        if(ix==1){result[ix]=result[ix].replace(/^[SsＳｓ]/,"");};//scene
//        if(ix==2){result[ix]=result[ix].replace(/^[OoＯｏ#＃]/,"");};//opus
        result[ix]=result[ix].replace(/^[#＃№]|^(No.)/,"");//ナンバーサインを削除
    };
    return result;
}
//test
//if(dbg) console.log(nas.Xps.parseCutIF("00123#31[124]__s-c123"));
//
/**
パース済みのカット識別子を比較してマッチ情報を返す
シーンカットともに一致した場合のみtrueそれ以外は false
引数に秒表記部が含まれないよう調整が必要
この関数はブール値を返す　廃止予定　２０１９０６２０
*/
nas.Xps.compareCutIdf=function(tgt,dst){
    if(tgt.match(/\(.+\)/)){tgt = nas.Xps.parseSCi(tgt)[0].cut};
    if(dst.match(/\(.+\)/)){dst = nas.Xps.parseSCi(dst)[0].cut};
    var tgtArray = nas.Xps.parseCutIF("-"+tgt);
    var dstArray = nas.Xps.parseCutIF("-"+dst);
    if (
    (((tgtArray[1]=="")&&(dstArray[1]==""))||
    (nas.RZf(nas.normalizeStr(tgtArray[1]),12)==nas.RZf(nas.normalizeStr(dstArray[1]),12)))&&
    (nas.RZf(nas.normalizeStr(tgtArray[0]),12)==nas.RZf(nas.normalizeStr(dstArray[0]),12))
    ) return true ;
    return false ;
}
/*TEST
nas.Xps.compareCutIdf("C12","s-c012");
nas.Xps.compareCutIdf("0012","title_opus_s-c012");
nas.Xps.compareCutIdf("C００１２","s-c012");
nas.Xps.compareCutIdf("S#1-32","s01-c0３２");
*/
/**
    @params {Object nas.Xps} targetXps
    @params {Boolean} exprt
    オブジェクト複製クラスメソッド
    引数のXpsを複製して独立したオブジェクトとして戻す
*/
nas.Xps.duplicate = function duplicate(targetXps,exprt){
    if(!(targetXps instanceof nas.Xps)) return;
    if(! exprt) exprt = (exprt)?true:false;
    var result = new nas.Xps();
    result.parseXps(targetXps.toString(exprt));
    return result;
}
/*TEST
var X = nas.Xps.duplicate(xUI.XPS,true);
console.log(X.toString());
*/
/**
    配列指定で識別子をビルドするテスト用関数
引数: [title,opus,subtitle,scene,cut,time,line,stage,job,status]
*/
nas.Xps.stringifyIdf = function(myData){
///myDataはlength==10の配列であること
//この識別子作成は実験コードです2016.11.14
    var myIdentifier=[
            encodeURIComponent(String(myData[0]))+
        "#"+encodeURIComponent(String(myData[1]))+
        ((String(myData[2]).length > 0)? "["+encodeURIComponent(myData[2])+"]":''),
            encodeURIComponent(
                "s" + ((myData[3])? myData[3] : "" )+'-'+
                "c" + ((myData[4])?myData[4]:'00')) +
                "(" + ((myData[5])?myData[5]:Sheet) +")",
            encodeURIComponent(myData[6]),
            encodeURIComponent(myData[7]),
            encodeURIComponent(myData[8]),
            myData[9]
    ].join("//");
    return myIdentifier;
}
//TEST
/*
nas.Xps.stringifyIdf([
    "たぬき",
    "12",
    "ポンポコリン",
    "",
    123,
    "1+12",
    "0:(本線)",
    "1:原画",
    "2:演出チェック",
    "Startup:kiyo@nekomataya.info"
]);
*/
/**
     データ識別子をパースして無名オブジェクトで戻す
     データ判定を兼ねる
     分割要素がカット番号を含まない（データ識別子でない）場合はfalseを戻す
     SCi/listEntryオブジェクトとの兼ね合いを要調整20170104
     
     asign/
     オブジェクトメソッドの識別子も解釈可能にする
    
    '//（二連スラッシュ）'を認識できなかったケースに限り'__（二連アンダーバー）'をセパレータとして認識するように変更
    **"_(アンダーバー単独)"はセパレータ以外で使用するケースがあるため要注意
*/
nas.Xps.parseIdentifier = function(myIdentifier){
    if(! myIdentifier) return false;
    if(myIdentifier.indexOf( '//' )<0 ){ myIdentifier=myIdentifier.replace(/__/g,'//'); }
    var dataArray = myIdentifier.split('//');
    var result={};
    result.product  = nas.Xps.parseProduct(dataArray[0]);
    result.sci      = nas.Xps.parseSCi(dataArray[1]);
    result.title    = result.product.title;
    result.opus     = result.product.opus;
    result.subtitle = result.product.subtitle;
    var sep = nas.Xps.parseCutIF(result.sci[0].cut);
    result.scene    = (sep.length > 1)? sep[1]:'';
    result.cut      = sep[0];
    result.time     = result.sci[0].time;
    if(dataArray.length == 6){
        result.line     = new nas.Xps.XpsLine(decodeURIComponent(dataArray[2]));
        result.stage    = new nas.Xps.XpsStage(decodeURIComponent(dataArray[3]));
        result.job      = new nas.Xps.XpsJob(decodeURIComponent(dataArray[4]));
        result.currentStatus   = new nas.Xps.JobStatus(dataArray[5]);
        //ステータスはデコード不用(オブジェクト自体がデコードする)
    }
    /*ここでは初期化しないundefined で戻す
    {
        result.line     = new nas.Xps.XpsLine(nas.pm.pmTemplate[0].line);
        result.stage    = new nas.Xps.XpsStage(nas.pm.pmTemplate[0].stages[0]);
        result.job      = new nas.Xps.XpsJob(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        result.currentStatus   = "Startup";        
    }*/
//if(dbg) console.log(result);
    return result;
}
/** test 
//if(dbg) console.log(nas.Xps.parseIdentifier('%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97//s-c10(72)//0%3A(%E6%9C%AC%E7%B7%9A)//0%3Alayout//0%3Ainit//Startup'));
{
  "product": {
    "title": "かちかち山Max",
    "opus": "おためし",
    "subtitle": ""
  },
  "sci": [
    {
      "cut": "s-c10",
      "time": "72"
    }
  ],
  "title": "かちかち山Max",
  "opus": "おためし",
  "subtitle": "",
  "scene": "",
  "cut": "10",
  "time": "72",
  "line": {
    "id": [
      "0"
    ],
    "name": "本線"
  },
  "stage": {
    "id": "0",
    "name": "layout"
  },
  "job": {
    "id": "0",
    "name": "init"
  },
  "currentStatus": {
    "content": "Startup",
    "assign": "",
    "message": ""
  }
}

*/
/**
 *    Xpsオブジェクトから、xMapオブジェクトを引き出すクラスメソッド
 *   @params    {Onject Xps}    targetXps
 *   @returns   {Object xMap}
 */
nas.Xps.getxMap = function(targetXps){
    if( ! (targetXps instanceof nas.Xps)) return null;
    var idf = nas.Pm.getIdentifier(targetXps,'status');
//console.log(idf);
    var resultxMap = new nas.xMap(idf);
    resultxMap.pmu.reset();
    resultxMap.pmu.setProduct(idf);

/*  xMapの基本プロパティをターゲットに同期させる
 *  ノードマネージャが持っているデータをいったん破棄して入れ替え
 */
    var parseData = nas.Pm.parseIdentifier(idf);
    var jobProps = [
        '##['+parseData.mNode.job+']',
        '##status='  +targetXps.currentStatus.content+';',
        '##assign='  +targetXps.currentStatus.assign+';',
        '##message=' +targetXps.currentStatus.message+';',
        '##created=' +targetXps.create_time+'/'+targetXps.create_user+';',
        '##updated=' +targetXps.update_time+'/'+targetXps.update_user+';'
    ];
    if(targetXps.worker)     jobProps.push('##worker='  +targetXps.worker+';');
    if(targetXps.manager)    jobProps.push('##manager=' +targetXps.manager+';');
    if(targetXps.clientIdf)  jobProps.push('##clientIdf=' +targetXps.clientIdf+';');
    if(targetXps.sessionIdf) jobProps.push('##sessionIdf='+targetXps.sessionIdf+';');
    if(targetXps.slipNumber) jobProps.push('##slipNumber='+targetXps.slipNumber+';');

    var myJob = resultxMap.pmu.nodeManager.getNode();
    myJob.parse(jobProps.join('\n'));
    resultxMap.pmu.currentNode = resultxMap.pmu.nodeManager.getNode();
    resultxMap.syncPmuProps();
    resultxMap.create_user = new nas.UserInfo(targetXps.create_user);
    resultxMap.create_time = new Date(targetXps.create_time);
//issuesに従って、ステージを取得　ステージのターゲットアセットを　resultxMapに登録
    var targetNode  = resultxMap.pmu.currentNode;
    var targetAsset = targetNode.stage.asset;
    if(! targetAsset){
        var msg = '未定義アセットが指定されました。作品の管理者に相談してください。';
        msg += 'assetName : '+targetNode.stage.stage.output;
alert(msg);
        return resultxMap;
    }
    var currentAsset = new nas.xMap.xMapAsset(
        targetXps.stage.name,
        targetAsset,
        targetNode.stage
    );
//xpsを登録
    var xpsGroup = resultxMap.new_xMapElement(
        'timesheet',
        'xps',
        targetNode,
        "[timesheet\txps]"
    );
    resultxMap.new_xMapElement(
    targetXps.cut,
    xpsGroup,
    targetNode,
    targetXps.getIdentifier('full')
    );

//トラックをパースして、トラック種別ごとにエレメントを登録する
registElement:
    for(var trix = 0 ; trix < targetXps.xpsTracks.length ; trix ++){
        var targetTrack = targetXps.xpsTracks[trix];
        if (targetTrack.option=='comment') continue;//コメントトラックはスキップ
        var sections = targetTrack.parseTimelineTrack();
//*** group setting
        var currentGroup = resultxMap.new_xMapElement(
            targetTrack.id,
            targetTrack.option,
            targetNode,
            "["+[targetTrack.id,targetTrack.option].join('\t')+"]"
        );
        var skipProcess = false;
        for(var six = 0; six < sections.length ;six ++){
            if (sections[six]==null) continue;//ブランクセクションをスキップ
//still|timing|dialog|sound|camera|camerawork|geometry|effect|composit|comment
            switch (targetTrack.option){
            //NOP
            case "dialog":
            case "camera":
            case "camerawork":
                if (sections[six].value === null){
                    skipProcess=true;
                }else{
//console.log(sections[six].value);
                    var myName = sections[six].value.name;//名前
                    var contentSource = sections[six].value.toString();
//console.log(sections[six].value.toString());
                }
            break;
            case "geometry":
            case "stage":
            case "stagework":
            case "composite":
            case "effect":
            case "sfx":
            case "sound":
                var myName = sections[six].getContent()[0];//名前
                var contentSource = [targetTrack.id,sections[six].getContent()[0]].join('\t');
            break;
            case "cell":
            case "replacement":
            case "still":
            case "timing":
            default:
                if(sections[six].value === null) skipProcess = true;
                var myName = [targetTrack.id,sections[six].getContent()[0]].join('-');//名前
                var contentSource = [targetTrack.id,myName].join('\t');
            }
            if(skipProcess){
                skipProcess = false ;
//console.log('skip process for:'+myName)
//console.log(sections[six])
                continue registElement; 
            }
//***** setting elements
            resultxMap.new_xMapElement(
                myName,
                currentGroup,
                targetNode,
                contentSource
            );
        }
        
        var groupSource = "["+targetTrack.id +"\t"+ targetTrack.id+"]\n";
//トラックごとにグループを登録
    }
    return resultxMap;
}
/*TEST
x=nas.Xps.getxMap(xUI.XPS);
x.toString();
*/
/**
 *    Xpsに単独記録する制作管理オブジェクト nas.Xps.XpsLine
 *    ライン記述を与えてオブジェクトを初期化する
 *  @params {String}  lineDescription
 *  ライン記述<br />
 *  @example
 * var A= new nas.Xps.XpsLine('(本線):0');
 * var A= new nas.Xps.XpsLine( 1:(背景));
 * var A= new nas.Xps.XpsLine('(背景3D-build):1:1');
 * var A= new nas.Xps.XpsLine('1-1:(背景3D-build)');
 * 等
 *     識別名の(括弧)は払って比較
 *     前置型式、後置型式どちらでも解釈
 *     引数記述が数値のみ指定は許されない（初期化に失敗させる）
 *    
 *     ライン・ステージ・ジョブの三点を初期化後にXpsがリンクするxMapと対照を行い
 *     当該のObjectに対するリンクを記録する？　⇒　常に検索が可能なので記録しない
 *     
 *     (当該ライン・ステージ・ジョブがxMapに存在しない場合は、xMapドキュメントを初期化の際に同期)
 *     当該のライン・ステージ・ジョブがpmdbに存在しない場合は、標準でxMap(==SCi)にエントリを追加
 */
nas.Xps.XpsLine = function XpsLine(lineDescription){
	this.id	=	[0];//
	this.name ='本線';//又は'trunk'
    if(lineDescription) this.parse(lineDescription);
}
/**
 * ライン記述をプロパティにパースする
 *  @params {String} lineDescription
 */
nas.Xps.XpsLine.prototype.parse = function(lineDescription){
    if(typeof lineDescription == undefined) return this;
    lineDescription=String(lineDescription);
    if(lineDescription.match(/^[0-9]+$/)){lineDescription+=':-'}
    var prpArray=lineDescription.split(':');
    if(prpArray.length > 2){
//要素数3以上ならば必ずID後置
        this.name = prpArray[0].replace(/^\(|\)$/g,"");
        this.id = prpArray.slice(1);
    } else if(lineDescription.length > 0){
        if(prpArray[0].match(/^[\d\-]+$/)){prpArray.reverse();}
        if (prpArray[1]) this.id = prpArray[1].split('-');
        this.name = prpArray[0].replace(/^\(|\)$/g,"");
    }
    return this;
}

/**
 *  @params {bool} opt
 * 整数id部 前置・後置切り替えオプション
 */
nas.Xps.XpsLine.prototype.toString = function(opt){
    if(opt)     return [this.id.join('-'),'(' + this.name +')'].join(':');
    return ['(' + this.name +')',this.id.join(':')].join(':');
}

/**
 *  ステージ情報を保持するオブジェクト
 *  @params {String} stageDescription
 *  ステージを表す記述
 *  @example
 *  var A= new nas.Xps.XpsStage("1:原画");
 *  var A= new nas.Xps.XpsStage("原画:1");
 *  整数id部は前置・後置どちらの型式でも良い
 *   ':' は省略不可  Xpsへの記録時は後方型式を推奨
 */
nas.Xps.XpsStage = function XpsStage(stageDescription){
    this.id     = 0 ;
    this.name   = 'init';
    if(stageDescription) this.parse(stageDescription);
}
/**
 * ステージ記述をプロパティにパースする
 *  @params {String} stageDescription
 */
nas.Xps.XpsStage.prototype.parse = function(stageDescription){
    if (typeof stageDescription =='undefined') return this;
    stageDescription=String(stageDescription);
    var prpArray=stageDescription.split(':');
    if(prpArray.length){
        if(prpArray[0].match(/^\d+$/)){prpArray.reverse();}
        this.id=(String(prpArray[1]).match(/^\d$/))? prpArray[1]:0;
        this.name=prpArray[0];
    }
    return this;
}
/** 文字列化して返す
 *  @params {bool} opt
 * 整数id部前置・後置切り替えオプション
 */
nas.Xps.XpsStage.prototype.toString = function(opt){
    if(opt)     return [this.id,this.name].join(':');
    return [this.name,this.id].join(':');
}
/**
 *  @params {String} myString　次ステージ名
 * 整数id部を、次ステージのために繰り上げる
 * 次ステージ名が与えられない場合は、IDのゼロ埋め３桁の数値に置き換える
 */
nas.Xps.XpsStage.prototype.increment = function(myString){
    this.id   = nas.incrStr(String(this.id));
    this.name = (myString)? myString:nas.Zf(this.id,3);
    return this;
}
/**
 * ステージをリセットして整数id部を０にする。次ラインのための機能であったが　このメソッドは削除予定
 * 使用禁止
 *  @params {String} myString　次ステージ名
 */
nas.Xps.XpsStage.prototype.reset = function(myString){
    this.id   = 0;
    this.name = (myString)? myString:'init';
    return this;
}

/**
 *  ジョブ情報を保持するオブジェクト
 *  @params {String} jobString
 *  jobを表す記述
 *  @example
 *  var A= new nas.Xps.XpsJob("1:[原画]");//id前置
 *  var A= new nas.Xps.XpsJob("[原画]:1");//id後置
 *  整数id部は前置・後置どちらの型式でも良い
 *   ':' は省略不可  Xpsへの記録時は後置形式を推奨
 */
nas.Xps.XpsJob = function XpsJob(jobString){
    this.id   = 0 ;
    this.name = '';
    if(jobString) this.parse(jobString);
}
/**
 *  @params {String | Object nas.Xps.XpsJob} jobDescription
 *  @returns {Object} this
 * ジョブ記述｜オブジェクトをプロパティにパースする
 */
nas.Xps.XpsJob.prototype.parse = function(jobDescription){
    if(typeof jobDescription == 'undefined') return this;
    if(jobDescription instanceof nas.Xps.XpsJob) jobDescription = jobDescription.toString();
    var prpArray= jobDescription.split(':');
    if(prpArray.length){
        if(prpArray[0].match(/^\d+$/)) prpArray.reverse();
        this.id = prpArray[1];
        this.name = prpArray[0].replace(/^\[|\]$/g,"");
    };
    return this;
}
/** 文字列化して返す
 *  @params {bool} opt
 *  @returns {String}
 * 整数id部前置・後置切り替えオプション true:前置 / false:後置
 */
nas.Xps.XpsJob.prototype.toString=function(opt){
   if(opt)     return [this.id,'['+this.name+']'].join(':');
    return ['['+this.name+']',this.id].join(':');
}
/**
 *  @params {String} myString　次ステージ名
 *  @returns {Object} this
 * 整数id部を、次ステージのために繰り上げる
 * 次ステージ名が与えられない場合は、ユーザハンドルに置き換えられる
 */
nas.Xps.XpsJob.prototype.increment = function(myString){
    this.id   = nas.incrStr(String(this.id));
    this.name = (myString)? myString:nas.CURRENTUSER;
    return this;
}
/**
 * ステージをリセットして整数id部を０にする。次作業のための機能
 * 原則使用禁止
 *  @params {String} myString　次ステージ名
 */
nas.Xps.XpsJob.prototype.reset = function(myString){
    this.id   = 0;
    this.name = (myString)? myString:'init';
    return this;
}

/*
    nas.Xps.JobStatus
    Jobの状況（＝カットの作業状態）
    content:作業状態を示すキーワードStartup/Active/Hold/Fixed/Aborted/Compleated/
初期値は"Startup(未着手)"
Floatingはドキュメントプロパティとして存在するがJobStatusとしては廃止
    assign:アクティブまたは中断状態でない作業が持つ次作業者の指名UIDまたは文字列（特にチェックはない）
初期値は長さ0の文字列
    アサインメント情報として予約値'stageCompleted'を持つことができる。これは当該ステージの終了フラグとして機能する
    
    message:次の作業に対する申し送りフリーテキスト
初期値は長さ0の文字列

    stageComleted:工程の終了フラグ ブーリアン
どのユーザでも立てることができるが、このフラグ自体は工程の完了を直接意味しない。
このフラグが立ったカットを、適切な管理者がチェックして実際の完了処理を行う。
完了処理は次のステージを開くことで行われるので注意が必要
初期値 false

初期化引数はステータス識別子または 配列[content,assign,message]いずれか
assin/messageが存在する場合は出力が以下の形式の文字列となる
"content:assign:message"
アサイン、メッセージ情報は、ステータスがFixed,Satartupの際は、次作業へのアサインメントとなる
Aborted.Floatingはアサインメントメッセージを持たない

Active,Hold はサーバからエクスポートされた
現在のユーザ情報をもつ
*/
/**
 *  @constractor
 *   @params {Arry|String} statusArg
    初期値は "Startup"から"Floating"に変更Startupステータスはリポジトリ登録成功時に割り当てら  れるステータスとする
    暫定的なスタータスとしてのFloatingは消滅　元来のStartupへ戻る
    Floatingはジョブのステータスでなく　ドキュメントのdataNodeプロパティを参照対象に変更する
 */
nas.Xps.JobStatus = function(statusArg){
    this.content = "Startup";
    this.assign  = "";
    this.message = "";
    if(statusArg) this.parse(statusArg);
}
/**
 * ステータス記述をプロパティにパースする
 *  @params {String} statusArg
 */
nas.Xps.JobStatus.prototype.parse = function(statusArg){
    if (statusArg instanceof Array){
        var prpArray = statusArg;
        if(prpArray.length){
          this.content =prpArray[0];
          this.assign  =(prpArray.length > 1)? (prpArray[1]):"";
          this.message =(prpArray.length > 2)? (prpArray.splice(2).join(':')):"";
        }
    }else if(statusArg){
        var prpArray = String(statusArg).split(':');
        if(prpArray.length){
          this.content =prpArray[0];
          this.assign  =(prpArray.length > 1)? decodeURIComponent(prpArray[1]):"";
          this.message =(prpArray.length > 2)? decodeURIComponent(prpArray.splice(2).join(':')):"";
        }
    }
    return this;
}
/** 文字列化して返す
 *  @params {bool} opt
 * 整数id部前置・後置切り替えオプション
 */
nas.Xps.JobStatus.prototype.toString=function(opt){
    if(
        (opt)&&
        ((this.content=="Fixed")||(this.content=="Startup"))&&
        ((this.assign!="")||(this.message!=""))
      ){
     return [this.content,encodeURIComponent(this.assign),encodeURIComponent(this.message)].join(':');
    }else{
     return this.content;   
    }
}

/**
 * タイムライントラックの標準値を取得するメソッド
 *  タイムラインラベルが指定するグループがあらかじめ存在する場合は、そのグループオブジェクトが保持する値
 *  存在しない場合は、新規にグループを作成する。その際にトラックの種別ごとのValueオブジェクトを初期値として登録するのでその値を使用
 *  nas.Xps.XpsTimelineTrack.getDefeultValue()側で調整
 *  Replacementの場合、基本ブランクだが必ずしもブランクとは限らないので要注意
 *  トラック上で明示的なブランクが指定された場合は、値にfalse/null/"blank"を与える。

 
 
 * @params myOption
 * @returns {*}
 */
nas.Xps._getMapDefault = function(myOption) {
    var myGroup=this.xParent.parentXps.xMap.getElementByName(this.id);
    if((typeof myGroup == "undefined")||(! myGroup)){
//console.log("no group detect. new grou setup");
/*
//console.log([
        this.id,
        this.option,
        this.xParent.parentXps.xMap,
        ""
        ]);
*/
        myGroup=this.xParent.parentXps.xMap.new_xMapElement(
        this.id,
        this.option,
        this.xParent.parentXps.xMap.currentJob,
        ""
        );
    }
    if (myOption == undefined) {
        return myGroup.content;
        myOption = myGroup.type;
    }
    switch (myOption) {
        case "dialog":
            return new nas.AnimationDialog(null,"");
            break;
        case "sound":
            return new nas.AnimationSound(null,"");
            break;
        case "camera":
        case "camerawork":
            return new nas.AnimationCamerawork(null,"");
            break;
        case "geometry":
        case "stage":
        case "stagework":
            return new nas.AnimationGeometry(null,"");
            break;
        case "composite":
        case "effect":
        case "sfx":
            return new nas.AnimationComposit(null,"normal");
            break;
        case "cell":
        case "replacement":
        case "timing":
        case "still":
        default:
            return new nas.AnimationReplacement(null,"blank-cell");
    }
}

/**
 * @description セクション（区間）の実装について
 *
 * タイムラインはセクションの連続として表現される
 *
 * セクションに関して
 * 他のアプリケーションではクリップという名前で実装されている場合もある
 *
 * セクションはフレーム単位の継続時間とその区間の値を持つ
 * 一般的にセクションが継続している間はその値は変化しない
 *
 * 区間値を持たないセクションがある
 *
 * ブランクセクションは単純に値を持たない
 * 空セル・無音状態等のタイムラインが特定の値を必要としない状態を表現するために使用される。
 *
 * 確定した値を持たない特殊なセクションがある
 *
 * 中間値補間セクションは、特定の値を持たず前後のセクションの中間値を自動で生成する。
 * 日本のアニメーション業界的には「中割区間」とも呼ばれる
 *
 * 中間値補間セクションは、その区間値としてセクションコレクションを持ち複数のサブセクションを保持する
 * 実際に値を持つのはサブセクションである
 *
 * フォーマット上はID:0のルートセクションが存在するが、これはトラック全体を継続時間として持つルートセクションとして実装する
 * ルートセクションは、規定値となるそのセクションの値と、セクションを保持するセクショントレーラを持つ？
 *
 * セクショントレーラーは、そのトラックを構成するセクションを格納するトレーラーとして機能するオブジェクト
 *
 * 中間値生成セクションは、値としてセクショントレーラーを持ち、サブセクションの配列を持つ。
 *
 * 配列INDEXは、セクションインデックスと１番ずれるので要注意
 *
 *
 * エレメントは値に名前を与えて、名前を利用したアクセスを可能にする
 *
 * セクションの値はMAPエレメント
 * MAPエレメントは、オブジェクトとして値を持つ
 *
 * MAPエレメントのvalueOfは自身の値オブジェクトを返す？
 *
 * セクション
 * .toString    >    Xps用ストリーム
 * .valueOf    >    Xps用配列戻し
 * MAPエレメント
 * .toString    >    xMapデータ用テキストエンコーダモードつき
 * 値
 * .toString    >    xMapデータ用テキストエンコーダ
 * .valueOf    >    必要にしたがって各種演算数値又は自身のオブジェクト（オーバーライド不要）
 */
/**
 *  params {String} type
 * xpsTrackAre Object
 *
 * XpsTimelineTrackを格納する書式上のエリアテーブル
 * 各テーブルは先頭,末尾 またはその両方にタイムコードエリアトラックを置くことが可能
 * 
 *
 */
nas.Xps.XpsTrackArea = function XpsTrackArea(type){
	this.type     = (type)? type:"cell" ;// reference|action|sound|replacement|camera|geometry|composite
	this.timecode = "none"              ;// none|both|head|tail
	this.tracks   = 1                   ;// members.length に同期しない 初期化時点の基準値として働く
	this.members  = []                  ;// 編集用参照配列
	this.fix      = false               ;// init
	this.hide     = false               ;// init
}

/*
 * xpsTracks Object
 * Array based Class
 * 親のXpsが保持しているのでトラックコレクション内部にカット情報を保存する必要なし
 * jobへの参照のみをプロパティとして持つ固定プロパティ
 * 上流の工程情報はJobに内包・管理情報（user/date）はこのオブジェクトが保持する
 * 別のプロパティを保持する必要はない
 * 管理情報DBを利用しない場合もデフォルトのJobオブジェクトはユーザ及び日付情報を持つ
 * このオブジェクトに記録される情報はJob本体ではなく参照情報Job-ID(Int)
 * コレクションの初期化は、ライン、ステージ、ジョブの新規発行の際にシステムにより行なわれる
 * リファレンスエリアの一時バッファとして、リファレンスステージを設定する
 * このステージにはJobが１つだけしか存在しない常にデータの最終状態のリファレンスエリアの内容を維持する
 * 個人作業用としてはリファレンスバックアップと同一だが、クライアント環境をまたいで使用することが可能
 * JobID=-1

 IDは初期化時に外部情報で指定
 DB接続の無いケースでは、
 ドキュメント記載のIDを与える
 初期化時にセッション限定のユニークIDを作成して与える
 等のケースとなる

 オブジェクト初期化時は、デフォルトの音声トラック＋コメントトラックのみを初期化する
 必要に従って呼び出し側でオブジェクトメソッドを用いてトラック編集を行う
 
 トラックコレクションデータに独立したショット継続時間を実装する
 トラックのデータフィールドに表示ウインドウを設定できるように
 表示開始オフセットと表示フレーム数を設定する
 duration は従来どおりコレクション内部のトラックの長さを規定する　これはカット尺とは関係なくトラックの全フレーム数を表す
 Xps.headMarginがショット開始オフセットを正の整数で、Xps.tailMarginはショット終了後の余剰フレーム数を記録する
表示オプションはUIが記録


 startOffsetは、表示開始オフセットを正の整数で、viewRandeが表示ウインドウのフレーム数を記録する
 表示オプションはUIが記録

areas // areaCollection プロパティを増設
eg.
    var TRs = new XpsTrackCollection(parentXps,"0",144,{offset:24,})
 */
/**
    @constractor
    @params  {Object}    parent
    @params  {String}    index
    @params  {Number}    duration
    @params  {Object}    scope
 */
nas.Xps.XpsTrackCollection = function XpsTrackCollection(parent,index,duration,scope){
	this.parentXps  = parent    ;//固定情報親Xps
	this.jobIndex   = index     ;//固定情報JobID
	this.duration   = duration  ;//タイムライン継続時間（ショットのタイムではない）
	this.scope = (scope)? scope :{offset:0,range:-1};//スコープ　初期値は　開始オフセット ゼロ ,範囲指定は正数値　負数はデフォルト値(duration-offset)に展開
	this.noteText    = ""           ;//property dopesheet note-text
	this.areaOrder   = []           ;//トラックをメンバーごとに配置するためのエイリアス
	this.length      = 1            ;//メンバーを要素数１(undefined)で初期化
//	this[0] = new nas.Xps.XpsTimelineTrack("N","dialog",this,this.duration); //初期要素としてダイアログフィールド
//	this[1] = new nas.Xps.XpsTimelineTrack("","comment",this,this.duration); //初期要素としてレコード終端フィールド
	this[0] = new nas.Xps.XpsTimelineTrack("","comment",this,this.duration); //初期要素としてレコード終端フィールド
//以下はオブジェクトメソッド（配列ベースなのでArrayオブジェクトのメソッド書き換えを防ぐためこの表記に統一）
//オブジェクトメソッド群
/**
    @params {Object nas.Xps.XpsTimelineTrack | String | Number}    trk
    @returns    {Boolean}
    指定のトラックが含まれるareaOrderグループを返す
    セルIDが指定された場合はそのIDを含むトラックを判定する
    数値はトラックIDとして
 */
    this.getAreaOrder = function(trk){
        if((typeof trk == 'string')&&(trk.match(/\d+\_\d+/))) trk = trk.split('_')[0];
        if(!(trk instanceof nas.Xps.XpsTimelineTrack)) trk = this[parseInt(trk)];
        return this.areaOrder.find(function(e){return (e.members.indexOf(trk) >= 0);});
    };//getAreaOrder
 
/**
    現在のareaOrderからtrackSpecを作成して得る
    引数なし
    リファレンスのトラック数は基礎情報のままで扱う
    返り値のトラック数は現在のトラック数でなく最初に設定された値を反映する
 */
    this.getTrackSpec = function(){
        var trackSpec = [];
        this.areaOrder.forEach(function(e){
            if((e.timecode == 'both')||(e.timecode == 'head')) trackSpec.push(["timecode",1,(e.fix)?"fix":""]);
                trackSpec.push([e.type,e.tracks,(e.hide )?"hide":((e.fix)?"fix":"")]);
            if((e.timecode == 'both')||(e.timecode == 'tail')) trackSpec.push(["timecode",1,(e.fix)?"fix":""]);
        });
        return trackSpec;
    };//getTrackSpec
/**
    @params {Object Array TrackSpec} trackSpec
    
    現在のXpsTrackCollectionに指定のtrackSpecを設定
    
    指定のトラックスペックでエリアオーダーを再初期化する
    (=トラックスペックに一致するエリアオーダーを得る)
    エリアオーダーメンバ配列を使用してトラックをエリアタイプ別に分類する
    (sound|replacement|camera|action に分類)
    現在のトラックメンバーから順次抜き出しを行いエリアオーダーメンバに移動
    仕分け終了時で残ったトラックは削除
    エリアトラックの不足メンバーを追加しながら新しいトラックメンバーに入れ替える
    
    既存のドキュメントトラックスペックを変更（更新）する
    削除されるトラックの内容は特に保持されないので編集セッション中は特に注意が必要
    
 */
    this.setTrackSpec = function(trackSpec){
        if((! trackSpec)&&(this.parentXps)) trackSpec = this.parentXps.sheetLooks.trackSpec;
        if(trackSpec instanceof Array){
            if(this.parentXps.sheetLooks.trackSpec !== trackSpec)
            this.parentXps.sheetLooks.trackSpec = trackSpec;//チェックして複製のほうが良い
            this.initAreaOrder(trackSpec);//エリアオーダーを再初期化
            this.areaOrder.forEach(function(e){
                var trk = this.find(function(elm){return (nas.Xps.AreaOptions[elm.option]==e.type);});
                while(trk){
                    if(trk){
                        if(e.members.length < e.tracks) e.members.push(trk);//orderArea側に参照を残す
                        this.splice(this.indexOf(trk),1);//直接削除
                    };
                    trk = this.find(function(elm){return (nas.Xps.AreaOptions[elm.option]==e.type);});
                };
            },this);
            this.areaOrder.forEach(function(e){
                if((e.type != 'reference')&&(e.members.length < e.tracks)){
                    while(e.members.length < e.tracks){
                        var tracklabel = (e.type == 'replacement')?
                            ('ABCDEFGHIJKLMNOPQRSTUVWXWZ').slice(e.members.length,e.members.length+1):
                            (e.type).slice(0,3)+(e.members.length + 1);
                        e.members.push(new nas.Xps.XpsTimelineTrack(tracklabel,e.type, this, this.duration));
                    };
                };
                e.members.forEach(function(mtrk){this.push(mtrk);},this);
            },this);
            this.renumber();
        };
        return;
    };//setTrackSpec
/*TEST 
    xUI.XPS.xpsTracks.setTrackSpec();
    xUI.referenceXPS.xpsTracks.setTrackSpec();
    resetSheet();
*/
//
/**
 * XpsTrackCollection.getSheetLooks()
 * 初期化指定用のSheetLooksオブジェクトを戻す
 * オブジェクトは配列であり、特にメソッドは持たない
 * @returns {Object}
 *      sheetLooks
*/
    this.getSheetLooks = function(){
console.log(this.parentXps);
        if (Object.keys(this.parentXps.sheetLooks).length > 0){
            var sheetLooks = JSON.parse(JSON.stringify(this.parentXps.sheetLooks));
        }else{
            var sheetLooks = JSON.parse(JSON.stringify(config.SheetLooks));
        }
            sheetLooks.trackSpec = this.getTrackSpec();
            return sheetLooks;
    };//getSheetLooks

/*
    トラックコレクションエリア配置テーブルをトラックスペックから作成
    trackCountは標準値であり、初期状態以外では必ずしも実際のトラックと合致しない
    初期化のタイミングではタイムライントラックが出揃っていない場合があるため
    実際のアサインは、トラックが確定したあとに遅延処理で行う（assignAreaOrderMember）
    property tracksは、初期化時点のtrackSpecの値を保持して、トラック増減の編集時も変動はない
    実際のトラック数を参照する場合は、メンバコレクションの要素数を参照すること
 */
    this.initAreaOrder = function(trackSpec){
console.log('init area order');
		if(!trackSpec) trackSpec = (this.parentXps.sheetLooks.trackSpec)? this.parentXps.sheetLooks.trackSpec:config.SheetLooks.trackSpec;
		this.areaOrder.length = 0;//clear table
/*
	trackSpecをスキャンしてエリアを確定する
	隣接する同タイプのエリアは統合
	timecodeは、トラックエリアに付随の補助プロパティとして格納される
 */
		var currentArea = null;
		var tc          = false;
		for(var ix = 0;ix < trackSpec.length ;ix ++){
			var tracktype   = trackSpec[ix][0];
			var trackCount  = trackSpec[ix][1];
			var trackOption = trackSpec[ix][2];
			var areatype    = nas.Xps.AreaOptions[tracktype];
			if(areatype){
				if((currentArea)&&(currentArea.type == areatype)){
					currentArea.tracks += trackCount;
				}else{
					currentArea = new nas.Xps.XpsTrackArea(areatype);
					this.areaOrder.push(currentArea);
					currentArea.tracks = trackCount;//初期化時の定数
					currentArea.fix  = (trackOption == 'fix')?  true:false;
					currentArea.hide = (trackOption == 'hide')? true:false;
					if(tc){
						currentArea.timecode = 'head';
						tc = false;
					};
				};
			}else{
				if(tracktype == 'tracknote'){
					currentArea.tracks += trackCount;
				}else if(tracktype == 'timecode'){
					if(currentArea){
						currentArea.timecode = (currentArea.timecode == 'head')? 'both':'tail';
						tc = false;
					}else{
						tc = true;//フラグのみ立てる
					};
				};
			};
		};
//trackspec上のコメントトラックを無視して最後に加える
		if(currentArea.type != 'comment') this.areaOrder.push(new nas.Xps.XpsTrackArea('comment'));
//membersテーブルをアサインしない
		return this.areaOrder;
	}
/**
 * areaOrderのメンバーが初期状態から増減されているか否かを返すメソッド
 * @returns {Boolean}
 *
 */
    this.isModifiedTracks = function isModifiedTracks(){
        var result = false
        this.areaOrder.forEach(function(e){
            if((e.type != 'reference')&&(e.tracks != e.members.length)) result = true;
        });
        return result;
    }
/*
    トラックエリアのオフセットを返すメソッド
    @params  {Number}    areaId
    @returns {Number}
        trackOffset
 */
    this.getTrackOffset = function getTrackOffset(areaId){
        if(! areaId) areaId = 0;
        if(areaId > this.areaOrder.length) areaId = this.areaOrder.length;
        var trackOffset = 0;
        for (var ix = 0;ix < areaId;ix ++){
            trackOffset += (this.areaOrder[ix].type == 'reference')? 0: this.areaOrder[ix].members.length;
        };
        return trackOffset;
    }
/*
    カウントを参照してエリアオーダーのメンバーテーブルを更新
    エリアオーダーはトラックスペックによるが、書き換え時に実際のトラックと不整合が発生するケースがあるのでここで調整を組み込む(230812)
    エリアカウント数０は許容
    トラックカウントいっぱいまでメンバーをアサインして次のエリアに移るので取り違えの可能性が残るので注意

    割付の仕様
    referenceを除く冒頭エリアは必ずサウンドトラックエリア、トラック数は1以上
    以降は、最終エリア以外では次エリアタイプのトラックが連続で現れた場合に強制的に割付を次エリアに変更
    エリアカウントは定数扱いで、実際のトラック数は増減OK
    オプションにより、エリアカウントいっぱいまで空トラックを作成する
    オプションにより、エリアカウントをオーバーしたトラックを削除する
 */
    this.assignAreaOrderMember = function(){
        var currentAreaId = 0;
        for(var i = 0 ; i < this.length ;i++){
//現存トラックを順次処理
            if(this[i].option == 'comment') break;//終端レコード検出
            if(this.areaOrder[currentAreaId].type == 'comment')   break;//終端エリアは別処理
            if(
                (this.areaOrder[currentAreaId].type == 'reference')||(
                    (nas.Xps.AreaOptions[this[i].option]==this.areaOrder[currentAreaId+1].type)&&
                    (nas.Xps.AreaOptions[this[i+1].option]!=this.areaOrder[currentAreaId].type)
                )
            ) currentAreaId++;
            this.areaOrder[currentAreaId].members.push(this[i]);
        };
//エリア割付終了処理
        this.areaOrder[this.areaOrder.length - 1].members.length = 0;
        this.areaOrder[this.areaOrder.length - 1].members.push(this[this.length - 1]);
        return this;
    }
/**
 * タイムラインを挿入
 * nas.Xps.XpsTrackCollection.insertTrack(id,nas.Xps.XpsTimelineTrack)
 * Timeline(nas.Xps.XpsTimelineTrack object オブジェクト渡し)
 * idの前方に引数のタイムラインを挿入
 * idが未指定・範囲外の場合、後方へ挿入
 * 0番タイムラインの前方へ挿入可
 * @params myId
 * @params {Array of nas.Xps.XpsTimelineTrack } myTrack
 */
    this.insertTrack = function(myId,myTrack){
        var insertCount=0;
        if (!(myTrack instanceof Array)) { myTrack=[myTrack] };
//挿入位置を確定
        if ((!myId ) || (myId < 0) || ( myId >= this.length - 2)) myId = this.length - 1;
//挿入エリアを抽出
        var targetTrack  = this[myId];
        var targetAreaId = this.areaOrder.findIndex(function(e){
            return (e.members.findIndex(function(ex){
                return (ex === targetTrack)
            }) >= 0 );
        });
        
        var targetArea  = this.areaOrder[targetAreaId];
        var trackOffset = this.getTrackOffset(targetAreaId);
//挿入
        for(var tc = 0 ; tc < myTrack.length ; tc++){
            if(myTrack[tc] instanceof nas.Xps.XpsTimelineTrack) {
                targetArea.members.splice(myId-trackOffset+tc , 0, myTrack[tc]);
                this.splice(myId+tc, 0, myTrack[tc]);
                insertCount++;
            };
        };
        this.renumber();
//        this.assignAreaOrderMember();
        return insertCount;
    };
/**
 * nas.Xps.XpsTrackCollection.removeTrack([id])
 * 指定idのタイムラインを削除する
 * デフォルトの音声トラックとフレームコメントトラック及び最後のタイミングトラックの削除はできない
 * IDを単独又は配列渡しで
 * @params {Array of Number} args
 */
    this.removeTrack = function(args){
        var removeCount=0;
        if (!(args instanceof Array)) args = [args];
        args.sort().reverse();//ソートして反転後方から順次削除しないと不整合が起きる
        for (var idx = 0; idx < args.length; idx++) {
//操作範囲外の値は無視
            var targetIndex  = args[idx];
            if (isNaN(targetIndex)) {
                continue;
            };
//
            if ((targetIndex > 0) && (targetIndex < this.length - 1)&&(this.length > 3)) {
//先行でareaOrderを同期
                var removeItem   = this[targetIndex];
                var targetAreaId = this.areaOrder.findIndex(function(e){
                    return (e.members.findIndex(function(ex){
                        return (ex === removeItem)
                    }) >= 0);
                });
/*
xUI.XPS.xpsTracks.areaOrder.findIndex(function(e){
                    return (e.members.findIndex(function(ex){
                        return (ex === xUI.XPS.xpsTracks[3])
                    }) >= 0);
                });
*/
                var trackOffset = this.getTrackOffset(targetAreaId);
                this.areaOrder[targetAreaId].members.splice(targetIndex-trackOffset,1);
//本テーブルのエントリを削除
                this.splice(targetIndex, 1);
                removeCount ++;
            };
        };
        if(removeCount){this.renumber();}
        return removeCount;//削除カウントを返す
    };
/*
 * トラックコレクションのindexをチェックして揃える
 * タイムライントラックのindexは親配列のindexそのもの
 */
	this.renumber = function(args){
		for (var idx=0;idx<this.length;idx++){
			if(this[idx].xParent !== this) { this[idx].xParent=this; }
			if(this[idx].index != idx)     { this[idx].index  =idx ; }
		};
        return this;
	}
/*
 *    置き換えトラックの集計コマンドを順次コールしてその値を集計して返す
 *  @params {Boolean}    totalOnly
 */
    this.countMember = function(totalOnly){
        var count = [{name:'[total]',count:0}];
        var total = 0;
        for (var t = 0 ;t < this.length ; t++){
            if(this[t].option!="timing") continue;
            var trackCount = this[t].countMember();
            if(trackCount == null) continue;
            count.push({name:this[t].id,count:trackCount});
            total += trackCount;
        }
            count[0].count = total;
        if(totalOnly) return total;
        return count;
    }
/**
 *    タイムラインの入力文字数をカウントして返す関数
 *    引数なし 
 *      @returns {Number}
 */
    this.countStr = function(){
        var ipct = 0
        this.forEach(function (e){ipct += e.join('').length;});
        return ipct;
    }
/**
 * nas.Xps.XpsTrackCollection.getRange(Range:[[startC,startF],[endC,endF]])
 * 範囲内のデータをストリームで返す
 * xpsのメソッドに移行 2013.02.23
 * 範囲外のデータは、ヌルストリングを返す2015.09.18
 * 負のアドレスを許容150919
 * nas.Xps.XpsTrackCollectionのメソッドに移行　もとのメソッドはラッパで残置　2020.05.16
 * 全てシートの範囲外を指定された場合は、範囲のサイズの空ストリームを返す
 * チェックはない（不要）空ストリームを得る場合に使用可能
 * 開始と終了のアドレスが一致している場合は、該当セルの値を返す
 * 第一象限と第三象限の指定は無効
 *
 * @params {Array of Array} Range
 * @returns {Array}
 */
	this.getRange = function (Range) {
    	if (typeof Range == "undefined") {
        	Range = [[0, 0], [this.length - 1, this[0].length - 1]]
	    }//指定がなければ全体をストリーム変換
    	var StartAddress = Range[0];
	    var EndAddress   = Range[1];
	    var xBUF = [];
    	var yBUF = [];
    	var zBUF = [];
// ループして拾い出す
	    for (var r = StartAddress[0]; r <= EndAddress[0]; r++) {
    	    if (r < this.length && r >= 0) {
        	    for (var f = StartAddress[1]; f <= EndAddress[1]; f++)
            	    xBUF.push((f < this[r].length && f >= 0) ? this[r][f] : "");
            	yBUF.push(xBUF.join(","));
           		xBUF.length = 0;
        	} else {
            	yBUF.push(new Array(EndAddress[1] - StartAddress[1] + 1).join(","));
        	}
    	}
    	zBUF = yBUF.join("\n");
// ストリームで返す
    	return zBUF;
	};//getRange
    this.get = function(output){
        return this.getRange(output)
    }
/**
 * nas.Xps.XpsTrackCollection.put(inputUnit)
 * nas.Xps.XpsTrackCollection.put(inputAddress,inputContent)
 * 指定アドレスにデータを書き込む
 * 入力ユニットのオブジェクト種別は問われないが、オブジェクトがaddress,valueの各プロパティを持っているものする
 * 引数としての入力オブジェクトの配列は受け付けない
 * 複数レンジの書き込みはこのメソッドに渡す前に展開を行うこと
 * リザルトとして　書き込みに成功したベクトル（左上、右下）、書き換え前のデータストリーム、書き込みに成功したデータ
 * を返す </pre>
 * 第二引数が存在する場合、第二形式
 * @params {Object} input
 * @returns {Array}
 *      [<Array:writeRange>, <String:currentDataStream>,<String:oldDataStream>]
 */
	this.put = function(input,content){
		if(arguments.length == 1){
			var inputUnit = input;
		}else{
			var inputUnit = {address:input,value:content};
		}
		if(! inputUnit.address) return false;
//アドレスが文字列の場合、数値配列に変換
        if(typeof inputUnit.address == 'string'){
            inputUnit.address = inputUnit.address.split('_');
            inputUnit.address[0] = parseInt(inputUnit.address[0]); 
            inputUnit.address[1] = parseInt(inputUnit.address[1]); 
        }
//データストリームを配列に展開
//データストリームが空文字列の場合は要素数１の配列に展開する
    var srcData = new Array(inputUnit.value.toString().split("\n").length);
    for (var n = 0; n < srcData.length; n++) {
        srcData[n] = inputUnit.value.toString().split("\n")[n].split(",");
    }
//指定アドレスから書き込み可能な範囲をクリップする
    var writeRange = [inputUnit.address.slice(), add(inputUnit.address, [srcData.length - 1, srcData[0].length - 1])];
    if (writeRange[0][0] < 0) writeRange[0][0] = 0;
    if (writeRange[0][0] >= this.length)    writeRange[0][1] = this.length - 1;
    if (writeRange[0][1] < 0) writeRange[0][1] = 0;
    if (writeRange[0][1] >= this[0].length) writeRange[1][1] = this[0].length - 1;
    if (writeRange[1][0] < writeRange[0][0]) writeRange[1][0] = writeRange[0][0];
    if (writeRange[1][0] >= this.length)    writeRange[1][0] = this.length - 1;
    if (writeRange[1][1] < writeRange[0][1]) writeRange[1][1] = writeRange[0][1];
    if (writeRange[1][1] >= this[0].length) writeRange[1][1] = this[0].length - 1;
//書き込み範囲をバックアップ
        var currentData = this.getRange(writeRange);
//ループして置き換え
        for (var c = 0; c < srcData.length; c++) {
            var writeColumn = c + inputUnit.address[0];
            if(this[writeColumn]) this[writeColumn].sectionTrust=false;
            for (var f = 0; f < srcData[0].length; f++) {
                var writeFrame = f + inputUnit.address[1];
                if(
                    (writeColumn >= 0) && (writeColumn < this.length) &&
                    (writeFrame >= 0) && (writeFrame < this[0].length)
                ){
                    this[writeColumn][writeFrame] = srcData[c][f];
                }
            }
        }
//戻り値は、[書き込みに成功したレンジ,書き込み成功後データ,書き換え前のストリーム]
//        return [writeRange, this.getRange(writeRange), currentData];

//新戻り値は[書き込み先頭アドレス,書き込み成功後データ,書き換え前のストリーム,書き込みに成功したレンジ]
        return [writeRange[0], this.getRange(writeRange), currentData, writeRange];
        
    };//put
}
nas.Xps.XpsTrackCollection.prototype = Array.prototype;
/**
 * @constructor nas.Xps.XpsTimelineTrackオブジェクトコンストラクタ
 *
 * タイムラインのトラックとなるオブジェクト
 * 配列ベースで、xpsTracks(トラックコレクション)のメンバーとなる
 * タイムライントラックのプロパティ及びコンテンツを保持する
 * contentStreamを要求された場合は、配列のメソッドでコンテントストリームを生成して返す（obj.join(",")）
 * contentSectionsを要求された場合は、同様にセクションコレクションを生成して戻す（オブジェクトメソッド）
 * トラックは、セクションで構成されるものとして扱うことができる
 * ラベル、トラック種別、継続フレーム数 を与えて初期化する
 * ジオメトリを持たないオブジェクトもある
 * タイムライントラックを抽象化するためのレイヤーとして機能する
 * 旧来のXPSLayerの代替となるのである程度の互換を考慮すること
 * xpsBodyとnas.Xps.layersを統合するデータ構造である
 *
 * @params myLabel
 * @params myType
 * @params myParent 
 * @params myLength	
 * @params myIndex
 タイムライントラックは、内部処理のため自身を外部からアクセスする際のidを内部にプロパティとして持つ
 親のXpsにアクセスする必要があるので、トラックの属するトラックコレクションへのポインタを持たせる。
 トラックコレクションが実質上のタイムシート本体である
 マルチステージ拡張のために必須

 トラックのデフォルト（暗黙）値としてvalueプロパティを新設
 カット頭にセリフオブジェクトを置く場合などに対応 2020.0827
 
トラックコレクションにheadMargin tailMargin値を増設

トラック種別に (timecode)(reference) tracknote を増設
 (timecode)(reference) は、トラックに値を持たない位置指定オブジェクトで配列の内容は必ず""
 ラベル等のプロパティも持たない
 実際に画面に表示される値は、実装に依存する

 tracknoteは、commentに似た、任意の数登録可能なコンポジットに影響しないノートテキスト用のトラックとする
  */
nas.Xps.XpsTimelineTrack = function XpsTimelineTrack(myLabel, myType, myParent, myLength) {
	
	this.index;//indexは自動制御生成時点ではundefinedタイムラインコレクションへの組み込み時点で設定される
	this.xParent=myParent;//親オブジェクトへの参照（トラックコレクションxpsTracksへの参照）
	this.length=myLength;//配列メンバーを空文字列に設定する
		for(var ix=0;ix<this.length;ix++){this[ix]="";}
    this.duration=this.length;
    this.id = myLabel;//識別用タイムラインid(文字列)タイムライン|グループ名
    this.option = (typeof myType == "undefined") ? "timing" : myType;//(timecode)|(reference)|still|timing|replacement|dialog|sound|camera|camerawork|effect|composit|tracknote|commentのいずれか
    this.value = '';//デフォルトのフィールド(シートセル)値
    this.sizeX = "640";//デフォルト幅 point
    this.sizeY = "480";//デフォルト高 point
    this.aspect = "1";//デフォルトのpixelAspect
    this.lot = "=AUTO=";//旧オブジェクト互換
    this.blmtd = "file";//旧オブジェクト互換
    this.blpos = "end";//旧オブジェクト互換
    this.tag =(this.option=='still')? this.id:'';
    this.link = ".";
    this.parent = ".";//
    this.sections = new nas.Xps.XpsTimelineSectionCollection(this);
    this.sectionTrust = false;//セクションコレクションが最新の場合のみtrueとなるインジケータ変数

//以下はオブジェクトメソッド（配列ベースなのでArrayオブジェクトのメソッド書き換えを防ぐためこの表記に統一）
//オブジェクトメソッド群
/**
 * 削除メソッドをトラックオブジェクトに実装する	
 * nas.Xps.XpsTimelineTrack.remove()
 * 削除の派生機能としてトラックオブジェクト側にremoveメソッドを作る
 * =自分自身の削除命令を親コレクションに対して発行する
 */
    this.remove=function(){
        return this.xParent.removeTrack(this.index);
    }
/**
 * 複製メソッド
 * 自分自身を複製して返す。
 * 複製のindex/xParentを含めて複製するので注意
 実質使いドコロが無さそう？
 */
    this.duplicate=function(){
        var newOne = Object.create(this);
        return newOne;
    }
/**
 *    @desc トラックのセルエントリの識別文字列を作成する
 *    @params {String}    myStr
 *   ??
 */
    this.getCellIdentifier=function(myStr){
        if(this.option!="timing"){return null;}
        this.LabelRegex=new RegExp("^"+this.id.replace(/[\\\-\+\[\]\(\)\.\^\$]/g,"\\$&") + "[\s\-_]?(.*)$");
        if(myStr.match(LableRegex)){
            var myName  = RegExp.$1;
            myLabel = this.id;
        }else{
            var myName = myStr;
        };
    };
/**
 * @desc タイムラインの中間処理メソッド
 * タイムラインをパースして有効データで埋まった１次元配列を返す
 これは、汎用セクションパーサが稼働すれば不要になるメソッドなので扱いに注意
 * Tm(開始フレーム,取得フレーム数)
 *
 * @params myStart
 * @params myLength
 * @returns {*}
 */
    this.parseTm = function (myStart, myLength) {
        if ((!myStart) || (myStart > this.length) || (myStart < 0)) {
            myStart = 0
        }
        if ((!myLength) || (myLength > (this.length - myStart))) {
            myLength = (this.length - myStart)
        }

    /**
     * @todo: 将来、データツリー構造が拡張される場合は、機能開始時点でツリーの仮構築必須
     */
        if (this.option !== "timing") { return false;}
    /**
     * 現在は、timing専用タイミングタイムライン以外の要求にはfalseを戻す
     * タイミングタイムラインの内部処理に必要な環境を作成
     * @type {String}
     */
        var myLabel = this.id;
        var blank_pos = this.blpos;
        var bflag = (blank_pos == "none") ? false : true;//ブランク処理フラグ

    /**
     * 前処理 シート配列からキー変換前にフルフレーム有効データの配列を作る
     * var bufDataArray = new Array(myStart + myLength);
     * @type {Array}
     */
        var bufDataArray = new Array(myStart + myLength);
    /**
     * 第一フレーム評価・エントリが無効な場合空フレームを設定
     * @type {*}
     */
        var myData = dataCheck(this[0], myLabel, bflag);
        if (myData == "interp") myData = false;
        bufDataArray[0] = (myData) ? myData : bufDataArray[f - 1];//有効データ以外は直前のデータを使用
    /**
     * 2--ラストフレームループ
     */
        for (var f = 1; f < bufDataArray.length; f++) {
        /**
         * 有効データを判定して無効データエントリを直前のコピーで埋める
         * @type {*}
         */
            var myData = dataCheck(this[f], myLabel, bflag);
            if (myData == "interp") myData = false;
            bufDataArray[f] = (myData) ? myData : bufDataArray[f - 1];//有効データ以外は直前のデータを使用
        }
        return bufDataArray.slice(myStart, bufDataArray.length);
    }
/**
    タイムライントラックを走査してプライマリセクションの切れ目を探してそこまでのカウントを返す
    内部処理用関数
*/
    this.countSectionLength=function(startFrame){
        if (typeof startFrame == "undefined" ) startFrame = 0;
        var mySections=this.parseTimelineTrack();
        var mySectionId = 0;
        for(var idx=0; idx < mySections.length ; idx ++){
            var startOffset = mySections[idx].startOffset();
            if (( startOffset<= startFrame)&&((mySections[idx].duration+startOffset)>startFrame) ){
                return mySections[idx].duration;
                break;
            }
        }
        return false;
    }
    
//汎用関数設定
    this.getDefaultValue = nas.Xps._getMapDefault;//

    this.parseSoundTrack		=nas._parseSoundTrack;
    this.parseDialogTrack		=nas._parseDialogTrack;
    this.parseReplacementTrack	=nas._parseReplacementTrack;
    this.parseCameraworkTrack	=nas._parseCameraworkTrack;
    this.parseGeometryTrack		=nas._parseGeometryTrack;
    this.parseCompositeTrack	=nas._parseCompositeTrack;
    this.parseTimelineTrack = nas.Xps.XpsTimelineTrack.parseTimelineTrack;
    this.getSectionByFrame  = nas.Xps.XpsTimelineTrack.getSectionByFrame;
    this.pushEntry          = nas.Xps.XpsTimelineTrack.pushEntry;
    this.countMember        = nas.Xps.XpsTimelineTrack.countMember;
    this.findCell           = nas.Xps.XpsTimelineTrack.findCell;
}
/**/
nas.Xps.XpsTimelineTrack.prototype = Array.prototype;
//test
//
/**
 * セクション追加メソッド超暫定版
 * 第一トラックのダイアログのみしか処理しません
 * 
 * @params myValue
 * @returns {nas.Xps.XpsTimelineSection}
 * セクションの追加メソッドはセクションコレクションに移動・このメソッドの新規利用は不可
 * 暫定コードを潰し終えたら削除
 *
nas.Xps.XpsTimelineTrack.prototype.addSection = function (myValue) {
    var newSection = new nas.Xps.XpsTimelineSection(this, 0);//親Collection、継続時間
    newSection.value = myValue;
    this.sections.push(newSection);
    return newSection;
};
 */
 
/*test
    XPS.xpsTracks[5].countSectionLength(1); 
*/

/**
 * @constructor nas.Xps.XpsTimelineSectionCollection
 *
 * トラック・セクションオブジェクトのプロパティとなるセクショントレーラー配列
 * セクションオブジェクトは、内包サブセクションを持つことができる
 * @params myParent as nas.Xps.XpsTimelineTrack
 */
nas.Xps.XpsTimelineSectionCollection = function(myParent) {
    this.parent = myParent;// Object nas.Xps.XpsTimelineTrack
//以下はオブジェクトメソッド（配列ベースなのでArrayオブジェクトのメソッド書き換えを防ぐためこの表記に統一）
//オブジェクトメソッド群
/**<pre>
 * セクション追加メソッド
 * 
 * セクション追加の際の引数はタイムラインに必要な値オブジェクト
 * 値オブジェクトは、直接AnimationValueを持つオブジェクト又はxMapElementとして与える
 * 値のみが与えられた場合はエレメントなしで登録する。
 * キャリアセクションを初期化する場合 キーワード"sectionCareer"を引数として与える
 * キャリアセクションは値としてキーワード"sectionCareer"を持ちサブセクションに値オブジェクトを保持する
 * 中間値補間セクションを初期化する場合 キーワード"interpolation"を引数として与える
 * 中間値補間サブセクションを初期化する場合指定されたValueを無視して新規にValueInterpolator Objectを作成して初期化する
 * エレメント新規作成が必要な場合はあらかじめ事前にエレメント新規作成を行って引数とする</pre>
 * @params {Object AnimationValue | String} myValue
 *      値オブジェクト|"interpolation"|"sectionCareer"
 * @returns {nas.Xps.XpsTimelineSection}
 */
    this.addSection = function (myValue) {
        var newSection ;// 新規セクションnew nas.Xps.XpsTimelineSection(this, 0, true|false);
        if(myValue == "sectionCareer"){
    //セクション保持用セクション(サウンドトラック用)
            newSection = new nas.Xps.XpsTimelineSection(this, 0, true);
            //newSection.subSections=new nas.Xps.XpsTimelineSectionCollection(newSection);
            newSection.mapElement;//エレメントは登録されない
            newSection.value="sectionCareer";//キーワードを保持;   
        } else if(this.parent.subSections){
    //親が中間値補間セクションまたはキャリアセクションであった場合無条件でサブセクションを登録
            newSection = new nas.Xps.XpsTimelineSection(this, 0 );
            newSection.mapElement;//エレメントは登録されない
            newSection.value = (this.parent.value=="sectionCareer")?
                myValue:
                new nas.ValueInterpolator(newSection);
        } else if(myValue instanceof nas.xMap.xMapElement){
    //引数がxMapエレメントなのでそのまま有値セクション初期化
            newSection = new nas.Xps.XpsTimelineSection(this, 0 );
            newSection.mapElement = myValue;
            newSection.value = newSection.mapElement.content;
        } else if(myValue == "interpolation"){
    //プライマリ中間値補間セクション
            newSection = new nas.Xps.XpsTimelineSection(this, 0, true);
            newSection.subSections=new nas.Xps.XpsTimelineSectionCollection(newSection);
            newSection.mapElement;
            newSection.value=null;//new nas.ValueInterpolator();   
        } else {
    //中間値補間サブセクション以外の
            newSection = new nas.Xps.XpsTimelineSection(this, 0 );
            newSection.mapElement;//エレメントは登録されない
            newSection.value = myValue;
        }
//        if(newSection.value) newSection.value.parseContent();
        this.push(newSection);
        return newSection;
    };

/* nas.Xps.XpsTimelineSectionCollection.getDuration()メソッドは、セクションのdurationを合計するメソッド
 * 
 */
    this.getDuration = function () {
        var myDuration = 0;
        for (var ix = 0; ix < this.length; ix++) {
            myDuration += this[ix].duration;
        }
        return myDuration;
    };
/*  セクション編集メソッド
 *      insertSection(id,newSection)
 *  指定idの前方にセクションを挿入する
 *  後方のセクションは、継続時間を維持したままさらに後方へ再配置される
 *  カットの時間範囲を越えたセクションは消去または後方をカットされる（配列データとして後方へ「ブロックインサート」してフレーム単位で削除その後再パース）

 *      removeSection(id)
 *  指定されたidのセクションを消去、前後のセクションの値が同じ場合は結合　異なる場合は別のセクションとして残置（相当部分の配列要素を削除して前方へ詰める「ブロックデリート」のほうが良いかも…）

 *      editSection(id,startOffset,duration)
 *      manipulateSection(id,startOffset,duration)
 *  指定idのセクションを指定の開始時間+継続時間で再配置する。
 *  前後のセクションは以下のルールで自動的に再配置される

    新規の開始位置は、前方セクション群の最小フレーム数または、０フレームよりも小さくなることが許されない
    新規の終了位置は、後方セクション群の最小フレーム数をカットの継続時間から引いたものまたは最終フレームを超えることが許されない

    開始端が移動した場合、前方区間は、オプションにより以下の３種の選択処理となる
        1.すべてのセクションの継続時間は原則としてオリジナル通りで、はみ出したセクションがカットされる
        2.編集対象セクションに近い側から順次伸縮される、各セクションの最終継続長以下になった場合そこで伸縮が止まり、次に遠いセクションが短縮される
        3.編集対象セクションに遠い側から順次伸縮される、各セクションの最終継続長以下になった場合そこで伸縮が止まり、次に遠いセクションが短縮される
             
    終了端が移動する場合も開始端の変更に準ずる。

    値の再配置は値の種別ごとに処理が異なるので要注意

戻り値は、セクションを加工したトラック全体のストリーム（xUI.put nas.Xps.putメソッドの引数として使用可能なストリーム）
+ フォーカス位置のオフセット(0~)
例：['1,,,3,,,4,,,7,,,8,,,9,,,0,,',0]

対編集対象トラックを以下の区間に分類して処理を行う

    [前方区間外新規セクション]
編集対象が第一区間である場合のみ発生　このエリアが発生した場合は新規セクションが追加され既存区間のIDがインクリメントする
    [前方残置レンジ]
現行のトラック内容をそのまま引き継ぐ範囲 (0)~(id-2) までのセクションが含まれる可能性がある
    [前方影響セクション]
ストリームを再構築する必要のあるセクション　操作オプションとオーダ範囲に寄り対象が変わりる　単一とは限らない

    [編集対象セクション]
フォーカスの存在するセクション

    [後方影響セクション]
ストリームを再構築する必要のあるセクション　操作オプションとオーダ範囲に寄り対象が変わりる　単一とは限らない
    [後方残置レンジ]
現行のトラック内容をそのまま引き継ぐ範囲 (id+2)~(sections.length) までのセクションが含まれる可能性がある
    [後方方区間外新規セクション]
特定条件で発生　編集対象が最終セクションである場合のみ発生する　既存区間のIDに変更はないが新規セクションが追加される。

編集中に編集対象セクションが入れ替わる現象は、仕様変更により特例処理となるので本メソッド内で処理20181227

呼び出し側で発生するので要デバッグ　201802

トラックにvalueプロパティを作成して各トラックの開始フレームを0に設定できるように拡張
2020 0828
*/
/**
    @params {Number} id
        編集対象の区間ID target section id
    @params {Number} headOffset
        編集対象区間の新規開始点
    @params {Number} tailOffset
        開始点からの編集対象区間の終了点オブセット（= duration - 1）
    @params {Number|String} manipulateOption
        編集オプション 整数　"near"/"far"
*/
    this.manipulateSection = function (id,headOffset,tailOffset,manipulateOption){
        if (! manipulateOption) manipulateOption = "near";
        if(headOffset < 0) headOffset = 0 ;
        var targetSection  = this[id];
        var myResult = [];//Collectionの編集を行わず、直接トラックのセル値を組み上げる=区間のメソッドは最低限で使う
        var startFrame = (tailOffset < 0)? headOffset + tailOffset  : headOffset;//逆転時に頭尾入替
        var endOffset  = Math.abs(tailOffset);

//console.log(["startFrame : ",startFrame,"/ endOffset :",endOffset].join(''))

//トラック内のセクション最短継続長を取得       
/*
dialog 区間は「コンテンツの文字数」それ以外は 1 にコメント数を加えたもの。
空白区間の最低長は前後のコンテンツによる。＝ headMargin tailMarginの被侵入合算サイズ
＊＊負数になるケースがあるので注意
空白区間にコメントは許可されない（値無しでコメントのみの区間が発生するため）

ユーザ入力を失わないためコメントはフレームを一つ消費する。
移動時にコメントのフレーム位置は保証されない
*/
        var newDurations = 0;
        var minimumDurations = [];//区間最小値配列
        var headLimit = 0;
        var tailLimit = 0;
        for (var six = 0 ; six < this.length ; six ++){
            var minimumContentLength = 1;

            if(this[six].value){
                    if((this.parent.option == 'dialog')&&(this[six].value.bodyText)) minimumContentLength = this[six].value.bodyText.length;
                    if((this[six].value.comments)&&(this[six].value.comments.length)) minimumContentLength += this[six].value.comments.length;
            }else{
                minimumContentLength = -(this[six].headMargin + this[six].tailMargin);
                if((this.parent.option.match(/^(camera|camerawork)$/))&&(minimumContentLength > 1)){
                    var currentContent = this[six].getContent();
                    if(currentContent[0] == currentContent[currentContent.length-1]) minimumContentLength -- ;
                }
           }
            if(six < id) headLimit += minimumContentLength  ;//先行区間最小値を集計
            if(six > id) tailLimit += minimumContentLength  ;//後方区間最小値を集計
            minimumDurations.push(minimumContentLength)     ;//最小区間継続長配列
        }
//console.log(minimumDurations);
//console.log(["headLimit:",headLimit," / tailLimit",tailLimit].join(''));
//指定範囲補正　入力保護のため指定位置の補正を強制的に行う
        if(endOffset < minimumDurations[id]){
            endOffset = minimumDurations[id]-1;
        }
        if(startFrame < headLimit){
            startFrame =  headLimit;
        }
        if((this.parent.length-(startFrame+endOffset)) < tailLimit){
            startFrame -= tailLimit;
        }
//console.log(["targetSection.startOffset : ",targetSection.startOffset(),"/ Offset :",targetSection.duration - 1].join(''))
//console.log(["startFrame : ",startFrame,"/ endOffset :",endOffset].join(''))
//補正確定後に以前の状態と前後位置が等しい場合は処理スキップ
/*
    区間長は同じだが、内容が変化するケースがあるので、ここに内容判別が必要
    sectionTrustを参照して現在のセクション内容がは信頼可能な場合のみスキップする
    セクション内容を改める外部プロシジャはこのあらかじめこのフラグを下ろす必要がある。
*/
        if((this.parent.sectionTrust)&&(startFrame==targetSection.startOffset())&&(endOffset==targetSection.duration - 1)) return [this.parent.join(),startFrame,endOffset];
        //暫定的に元データで返す 呼び出し側で無変更をトラップするか、または戻り値の判定が必要
//前方に新規挿入セクションが発生する場合その部分をあらかじめカラ要素で埋めておく
        if ((id == 0)&&(startFrame > 0)) {
            myResult = new Array(startFrame);
//console.log('前方処理既存区間なし　空白セルを補充 frames: '+(startFrame-targetSection.headMargin));
        }
/*　==========================前方区間処理　*/
        if((startFrame > 0)&&(id > 0)){
            var changeLength = startFrame - targetSection.startOffset();
//console.log('前方区間伸縮パラメタ' + changeLength);
            if(changeLength == 0){
//変更なし現在のタイムラインをコピー
                myResult = myResult.concat(this.parent.slice(0,startFrame-targetSection.headMargin));
//console.log('前方区間複製' + myResult.toString());
            }else{
                var restMargin = startFrame - headLimit;
                var newDurations = [];
                for (var ix = 0 ; ix < id ;ix ++){
                    var tix = (manipulateOption=='near')? ix : id - ix - 1;
                    if(changeLength > 0){
//延長時対象端区間で差分を吸収
                        if(
                            ((manipulateOption =='far')  && (tix == 0))||
                            ((manipulateOption =='near') && (tix == (id-1)))
                        ){
                            newDurations.push(this[tix].duration+changeLength);
                        }else{
                            newDurations.push(this[tix].duration);
                        }
                    }else{        
//短縮時前方空白区間と最短区間合算を比較して一致するまで区間長をスタックする
                        if(restMargin == 0){
                            newDurations.push(minimumDurations[tix]);
                        }else if((restMargin + minimumDurations[tix]) >= this[tix].duration){
                            newDurations.push(this[tix].duration);
                            restMargin -= (this[tix].duration - minimumDurations[tix]);
                        } else if(restMargin > 0){
                            newDurations.push(restMargin + minimumDurations[tix]);
                            restMargin = 0;
                        }
                    }
                }
                if (manipulateOption == 'far') newDurations.reverse();
//console.log(newDurations);
                for (var ix = 0 ; ix < id ;ix ++){
                        myResult = myResult.concat(this[ix].getStream(newDurations[ix]));
                    if((newDurations[ix]+this[ix].headMargin+this[ix].tailMargin) < 0){
//console.log(newDurations[ix]+this[ix].headMargin+this[ix].tailMargin);
                        myResult.splice(newDurations[ix]+this[ix].headMargin+this[ix].tailMargin);
                    }
                }
            }
}
//==========================ターゲット区間
//console.log(id);
    myResult = myResult.concat(targetSection.getStream (endOffset+1));
/*==========================後続区間処理　*/
    var endFrame = startFrame+endOffset;
if(((endFrame) < (this.parent.length-1))&&(id < (this.length-1))){
    changeLength = (targetSection.startOffset()+targetSection.duration-1)-(startFrame+endOffset);
//console.log('後続区間伸縮パラメタ' + changeLength);
    if(changeLength==0){
//変更なしなので現在のタイムラインをコピーして終了
        myResult = myResult.concat(this.parent.slice(startFrame+endOffset+1+targetSection.tailMargin));
//console.log('後続区間複製' + this.parent.slice(startFrame+endOffset+1+targetSection.tailMargin));
    }else{
//後続空白区間と最短区間合算を比較して一致するまで区間を拡張する
        var restMargin = this.parent.length - 1 - endFrame - tailLimit;
        var newDurations = [];
        for (var ix = id+1 ; ix < this.length ;ix ++){
            var tix = (manipulateOption=='near')? this.length - (ix-id) : ix;
            if(changeLength > 0){
//延長時対象端区間で差分を吸収
                if(
                    ((manipulateOption =='far')  && (tix == (this.length-1)))||
                    ((manipulateOption =='near') && (tix == (id+1)))
                ){
                    newDurations.push(this[tix].duration+changeLength);
                }else{
                    newDurations.push(this[tix].duration);
                }
            }else{
//短縮時後続空白区間と最短区間合算を比較して一致するまで区間長をスタックする
                if(restMargin == 0){
                    newDurations.push(minimumDurations[tix]);
                }else if((restMargin + minimumDurations[tix]) >= this[tix].duration){
                    newDurations.push(this[tix].duration);
                    restMargin -= (this[tix].duration - minimumDurations[tix]);
                } else if(restMargin > 0){
                    newDurations.push(restMargin + minimumDurations[tix]);
                    restMargin = 0;
                }
            }
        }
        if (manipulateOption == 'near') newDurations.reverse();
//alert(newDurations.join());
        for (var ix = 0 ; ix < newDurations.length ;ix ++){
            myResult = myResult.concat(this[id+1+ix].getStream(newDurations[ix]));
//console.log([newDurations[ix],this[id+1+ix].headMargin,this[id+1+ix].tailMargin]);
            if((newDurations[ix]+this[id+1+ix].headMargin+this[id+1+ix].tailMargin) < 0){
                myResult.splice(newDurations[ix]+this[id+1+ix].headMargin+this[id+1+ix].tailMargin);
            }
        }
    }
}
//リザルトがトラック長に満たない場合はカラ要素で埋める
    if(myResult.length < this.parent.length){
//console.log('fill empty :' +( this.parent.length-myResult.length));
        myResult = myResult.concat(new Array(this.parent.length-myResult.length));
    }
//リターン
//console.log([myResult.join(),startFrame,endOffset]);
    return [myResult.join(),startFrame,endOffset];
}


}
nas.Xps.XpsTimelineSectionCollection.prototype = Array.prototype;
/*
    ターゲットセクションの値種別が範囲外記述を含む場合
    かつ
    ターゲット前方区間の合計継続時間がターゲットセクションの前方範囲外記述(topFlow)の数を下回る場合
     (* この時点でmyResult.length=0)
     前方範囲外記述分のオフセットが必要になる
*/

/**
 * @constructor nas.Xps.XpsTimelineSection
 *
 * セクションオブジェクト
 * りまぴんではセクション編集時に都度生成される
 * セクションはトラックの要素でありセクションコレクションに格納される
 * 中間値生成セクションはそのプロパティとしてCollectionを持ち中間値生成サブセクションを内包する
 * parentにトラックオブジェクトを与えて初期化すると標準セクションセクションオブジェクトを与えると中間値補間サブセクションとして機能する
  * 継続時間は調整可能
 * 値は後から設定する初期値はundefined
 * 区間は必ずしも値をもたない
 値なし(undefined)のケースは、
 	-デフォルト値を継承 
 	-前後のセクションが値を持ち、サブセクションが値を得るための情報を持つ
 の2ケースがあるので注意
 
 セクションを中間値生成セクションとして初期化するためには、引数isInterpをtrueにする
 subSectionsが初期化されデフォルトのサブセクションが登録される

 * @params {Object nas.Xps.XpsTimelineSectionCollection} myParent
 * @params {Number} myDuration
 * @params {boolean} isInterp
 */
nas.Xps._getSectionId = function(){
    for (var idx = 0; idx < this.parent.length; idx++) {
        if (this.parent[idx] === this) return idx;
    };
};
nas.Xps._getSectionStartOffset = function(){
    var myOffset = 0;
    for (var idx = 0; idx < this.parent.length; idx++) {
        if (this.parent[idx] === this) {
            return myOffset;
        } else {
            myOffset += this.parent[idx].duration;
        };
    };
};

/**
 * タイムラインセクション
 *<pre>
 *  使用の都度初期化される一時オブジェクト
 * セクションコレクションにトラックごとに変更フラグを設けて、変更がない限りは再ビルドを避ける
 * セクションオブジェクトはparentプロパティにそのコレクションを含むオブジェクトへの参照を持つ
 *  nas.Xps.XpsTimelineTrack || nas.Xps.XpsTimelineSection
 *
 *  @params {Object nas.Xps.XpsTimelineSectionCollection} parent
 *      親となるnas.Xps.XpsTimelineSectionCollection
 *  @params {Number} duration
 *      セクションの長さ 通常０で初期化されてパーサにより更新される
 *  @params {boolean} isInterp
 *      初期化時に中間値補完サブセクションとして初期化が可能
 *
 *  parentがXpsTimelineSelectionCollection の場合は、基礎セクション(有値セクション及び中間値補間セクション)となる
 *    有値セクションは、セクションのvalueとしてnas.xMap.xMapElementのcontentプロパティを指し かつsectionsプロパティがundefinedとなる。
 *      中間値補間セクションは、valueを持たない(undefined)かつsectionsプロパティにメンバーを持つ
 *   parentがnas.Xps.XpsTimelineSectionの場合は、サブセクション（中間値補間サブセクション）となる
 *       中間値補間サブセクションは valueプロパティとしてValueInterpolatorオブジェクトを持ちmapElementを持たない
 *</pre>
 */
nas.Xps.XpsTimelineSection = function(parent, duration, isInterp) {
    this.parent   = parent      ;
    this.duration = duration    ;
    this.headMargin = 0;
    this.tailMargin = 0;
    if(this.parent instanceof nas.Xps.XpsTimelineSection){
        this.mapElement;//this.parent.parent.xParent.parentXps.xMap.getElementByName(this.value.)
        this.value=new nas.ValueInterpolator(this);
        this.subSections;//サブセクションコレクションを持たない
    }else{
        this.mapElement;//mapElementはxMapElementへの参照  undefinedで初期化してパーサが値を設定する
        this.value;//valueは this.mapElement.contentへの参照又はundefined  undefinedで初期化してパーサが値を設定する
        this.subSections =(isInterp)? new nas.Xps.XpsTimelineSectionCollection(this):undefined;
    }
    /**
     *   @method
     *   @params {boolean} opt
     *    出力切り替えオプション　セクションが値を持つか否かによっても出力が変わるので注意
     */
    this.toString = function (opt) {
        if(opt){
            if(this.value){
                return this.value.getStream(this.duration).join(',');
                //　値によって戻り値がdurationと異なる場合があるので要注意
            }else{
                return new Array(this.duration).join(',');
            }
        }else{
            return this.duration + ":" + this.value;
        }
    }
}
/** セクションの範囲のセルの値を配列で返す
 *　引数: なし
 *  @returns {Array}
 *      区間内のセルの配列
 */
nas.Xps.XpsTimelineSection.prototype.getContent = function(){
        var startframe = this.startOffset();
        var timeline   = this.parent.parent;
    if(this.parent.parent instanceof nas.Xps.XpsTimelineSection){
    //サブセクション　親セクションのオフセットを追加する
        startframe += this.parent.parent.startOffset();
        timeline = this.parent.parent.parent.parent;
    }
    return timeline.slice(startframe,startframe+this.duration);
}
/**
 * セクションの内容を配列に指定の長さに再展開して返す
 *<pre>
 *指定長がコンテンツの最小長を割る場合は、value自身が（ユーザ入力を失わないために）指定を無視して最小の長さのストリームを返す。
 *そのため　リザルトが引数の値と一致しない場合がある。
 * セクションがサブセクションを持つ場合は、現在のサブセクションの構造を保って伸縮するように試みる。
 * 指定された継続長が現在よりも短ければ内容をカット
 * 指定よリも長い場合は最初のサブセクションを繰り返す
 * 負数が指定された場合は空配列を戻す（duration==0）
 *  特殊条件
 *((frameCount ==  1)&&(headMargin == -1)&&(tailMargin == -1))
 *(this.getContent)
 *
 * トラックの種別が dialog/cameraworkの場合のみ、value.getStreamを呼ぶ。
 * それ以外の場合はストリームの内容がvalue.nameのみであるため、このメソッドが出力を作成するほうが効率的。
 *</pre>
 *
 * @params {Number} frameCount
 * @returns {Array of timesheetinput} 
 *  xUI.put メソッドに入力可能なシート内容の配列
 *
 * @example
 * xUI.Select([2,0]);
 * xUI.put(xUI.XPS.xpsTracks[2].sections[0].getStream(32));
 *
 */
nas.Xps.XpsTimelineSection.prototype.getStream = function(frameCount){
    if( frameCount < 0 ) return [];//NOP
    if(! frameCount ) frameCount = this.duration;
    if(this.parent.parent.option=='sound'){
//サウンドセクションの場合
/*
入力したタイミングが情報本体でありそれぞれのエレメントは特に重要でない
消失・増加はあって良い
    エレメントの間隔を保持して移動
    短縮した際は消滅
    延長した際は全体のくりかえしが適切
    起点は開始点
戻しデータ長はframeCountとマッチさせる
*/
/*本体セクションは値のないキャリア　サブセクションの値を集めてリザルトを作る*/
        var newContent = this.getContent();//オリジナルを展開        
        if (frameCount == newContent.length){
            return newContent;//同内容
        }else{
            var endSign = newContent[newContent.length-1];//endサインバックアップ
            newContent[newContent.length-1]='';//エンドサイン消去
/*延長時はくりかえしで増加*/
            var ix = 0;
            while(newContent.length < frameCount){
                    newContent=newContent.concat(this.subSections[ix].getStream());
                    ix = (ix+1)%this.subSections.length;
            }
            newContent.splice(frameCount);
//console.log(newContent);
            newContent[newContent.length-1]=endSign;//endサイン復帰
            return newContent;
        }
    } else
    if(this.subSections){
//値補完区間（interprate|geometry|composite）の場合
        var nodeSymbol = false;
        var nodeSymbols ={
            geometry :["|","▼","▲"],
            stage    :["|","▼","▲"],
            stagework:["|","▼","▲"],
            sfx      :["┃","┳","┻"],
            effect   :["┃","┳","┻"],
            composite:["┃","┳","┻"]
        }
        if(this.parent.parent.option.match(/geometry|stage|stagework|sfx|effect|composite/)){
            nodeSymbol = nodeSymbols[this.parent.parent.option];
        }
        var newContent = this.getContent();//オリジナルを展開
//console.log(newContent.toString());
        if (frameCount == this.dutarion){
            return newContent;
        }else{
            var seedSection = this.subSections[0].getContent();
            if((nodeSymbol)&&(seedSection[0]!=nodeSymbol[0])) seedSection[0]=nodeSymbol[0];
            if((nodeSymbol)) newContent[newContent.length-1]=nodeSymbol[0];
//console.log(seedSection);
//console.log(newContent.toString());
            while (newContent.length < frameCount){
               newContent = newContent.concat(seedSection);
                if (newContent.length > frameCount) break;
            }
            newContent = newContent.slice(0,frameCount);
            if(nodeSymbol){
                if(frameCount > 1) newContent[0]=nodeSymbol[1];
                if(frameCount > 2) newContent[newContent.length-1]=nodeSymbol[2];
            }
//console.log(newContent);
            return newContent;
        }
    }else{
/* サブセクションなし　値なし|値あり　*/
        if(!(this.value)) frameCount = frameCount + this.headMargin + this.tailMargin;
        if(frameCount < 0) frameCount = 0;
        var myResult = new Array(frameCount);
//console.log(frameCount +':'+this.getContent[0]+':'+this.parent.parent.option);
        var currentSectionId = this.id();
        switch(this.parent.parent.option){
        case "camera":;
        case "camerawork":;
        case "dialog":;
            if (this.value) myResult= this.value.getStream(frameCount);
        break;
        case "stage":;
        case "stagework":;
        case "geometry":;
        /*  */
          if(frameCount>0){
            if((this.parent[currentSectionId+1])&&(this.parent[currentSectionId+1]).subSections){
                if(this.value) myResult[myResult.length-1] = this.value.name;
            }else{
                if(this.value) myResult[0] = this.value.name;
            }
          }
        break;
        case "sfx":;
        case "effect":;
        case "composite":;
        case "sfx":;
          if(frameCount>0){
            if((this.parent[currentSectionId+1])&&(this.parent[currentSectionId+1]).subSections){
                if (this.value) myResult[myResult.length-1] =  this.value.name;
            }else{
                if (this.value) myResult[0] = this.value.name;
            }
          }
        break;
        default:
            myResult[0] = this.getContent()[0];
        }
        return myResult;
    }
}

/** セクションのID（=コレクション内の位置）を返す　@returns {Number} */
nas.Xps.XpsTimelineSection.prototype.id = nas.Xps._getSectionId;
/** セクションの開始点フレームを返す　@returns {Number} */
nas.Xps.XpsTimelineSection.prototype.startOffset = nas.Xps._getSectionStartOffset;


/**
 * @constructor nas.Xps.XpsTimelineSubSection
 *   中間値生成サブセクション
 *   セクション内のサブセクション
 *   動画中割及びジオメトリ、コンポジットタイムラインの中間値を生成するオブジェクト
 *   区間内インデックスをもち
 *   親タイムライン上の先行するセクションの値と後方セクションの間の値を生成して返す
 *   valueプロパティはnas.ValueInterpolator Object
 * parentにはセクションオブジェクトを与えて初期化する
 *  サブセクションはセクションオブジェクトを兼用？？＞＞兼用する
 *   
 *
nas.Xps.XpsTimelineSubSection = function(myParent, myDuration) {
    this.parent = myParent;
    this.duration = myDuration;
    this.value=new nas.ValueInterpolator(this);//valueはnas.ValueInterpolator
    this.toString = function () {
        return this.duration + ":" + this.value;
    }
}
nas.Xps.XpsTimelineSubSection.prototype.id = nas.Xps._getSectionId;
nas.Xps.XpsTimelineSubSection.prototype.strtOffset = nas.Xps._getSectionStartOffset;
 */
/*
        タイムラインをダイアログパースする
    タイムライントラックのメソッド
    引数なし
    音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
    今回は省略
    開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
    後から仕様に合わせて再調整
    判定内容は
    /^[-_]{3,4}$/    開始・終了マーカー
    /^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/    インラインコメント
    その他は
    ブランク中ならばラベル
    音響Object区間ならばコンテントテキストに積む空白は無視する
    ⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
    オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
    
    トラックの内容をパースしてセクションコレクションを構築する機能はトラック自身に持たせる
    その際、トラックの種別毎に別のパーサを呼び出すことが必要なのでその調整を行う
    
        タイムライントラックのメソッドにする
        ストリームはトラックの内容を使う
        新規にセクションコレクションを作り、正常な処理終了後に先にあるセクションコレクションを上書きする
        ＊作成中に、同じ内容のセクションはキャッシュとして使用する？
        戻り値はビルドに成功したセクション数(最低で１セクション)
        値として無音区間の音響オブジェクト（値）を作るか又は現状のままfalse(null)等で処理するかは一考
*/

/*test
nas.Xps.XpsTimelineTrack.prototype.parseSoundTrack=nas._parseSoundTrack;
XPS.xpsTracks[0].parseSoundTrack();
XPS.xpsTracks[0].sections[1].toString();

XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
//XpsTimelineTrack.prototype.parseDialogTrack=_sectionTrack;

//XpsTimelineTrack.prototype.parseKeyAnimationTrack=_parsekeyAnimationTrack;
//XpsTimelineTrack.prototype.parseAnimationTrack=_parseAnimationTrack;
XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;

XpsTimelineTrack.prototype.parseCameraWorkTrack=_parseCameraworkTrack;

XpsTimelineTrack.prototype.parseCompositeTrack=_parseCompositeTrack;//コンポジット

//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
*/

/**
 以下は、別ソースでセットアップしたメソッドを導入するテストコード
*/
/*
XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
XpsTimelineTrack.prototype.parseDialogTrack=_parseDialogTrack;

XpsTimelineTrack.prototype.parseKeyAnimationTrack=_parsekeyAnimationTrack;
XpsTimelineTrack.prototype.parseAnimationTrack=_parseAnimationTrack;
XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;

XpsTimelineTrack.prototype.parseCameraworkTrack=_parseCameraworkTrack;

XpsTimelineTrack.prototype.parseGeometryTrack=_parseGeometryTrack;
XpsTimelineTrack.prototype.parseCompositeTrack=_parseCompositeTrack;//コンポジット

XpsTimelineTrack.prototype.parseTrack=_parseTrack;
XpsTimelineTrack.prototype.parseTrack=_parseTrack;
*/

/** <pre>
 *	タイミング（置き換え）タイムライントラックの要素をカウントする
 *	現状では動作確認用の仮値として区間数を返す
 *	timingトラックの場合は予想動画枚数を返す　他のトラックの場合 null (枚数をカウントできない)
 *	値は0~
 *	セクションパースを行う
 *		くりかえし区間を判定して展開する 明示指定と暗黙指定の両方
 *		くりかえし区間の冒頭データがキーデータとなる
 *		タイムラインをさかのぼって最初にキーデータが出現するまでの区間をくりかえし区間とする
 *		またはくりかえし区間を設定する書式を作成する
 *	中間値補完セクションのサブセクションに仮のIDを与える
 *  </pre>
 *  @params {String}    countOption
 *      動画記号のカウント方法を指定するテキストオプション　
 */
nas.Xps.XpsTimelineTrack.countMember = function(countOption){
	if (this.option.match(/cell|timing|still|replacement/)){
		var count = [];
		var sections = this.parseReplacementTrack();
		for (var cx = 0 ;cx < sections.length;cx ++){
//		    if((sections[cx].value == false )||(sections[cx].value == null )) continue;
		    var targetStr = sections[cx].getContent()[0];
			if((targetStr.match(nas.CellDescription.blankRegex))||(targetStr.match(/^\s*$/))) continue;
			count.add(targetStr);
		}
//console.log(count)
		return count.length;
	}
	return null;
}

/**
 *<pre>
 *    タイムラインをパースしてセクション及びその値を求めるメソッド
 *    タイムライン種別ごとにパースするオブジェクトが異なるので
 *    各オブジェクトに特化したパーサが必要
 *    別々のパーサを作ってセクションパーサから呼び出して使用する
 *    Sound
 *        parseSoundTrack
 *        *parseDialogTrack
 *    Replacement
 *        parseKyeDrawind(補間区間あり)
 *        parseAnimationCell(確定タイムライン)
 *    Camerawork
 *        parseCameraworkTrack
 *    Geometry
 *        parseGeometryTrack
 *    Composite
 *        parseCompositeTrack
 *    各々のパーサは、データ配列を入力としてセクションコレクションを返す
 *    各コレクションの要素はタイムラインセクションオブジェクト
 *    値はタイムライン種別ごとに異なるがセクション自体は共通オブジェクトとなる
 *
 *    セクションパースは、非同期で実行される場合がありそうなので、重複リクエストを排除するためにキュー列を作って運用する必要ありそう
 *    その場合は、このルーチンがコントロールとなる?1105memo
 *    もう一つ外側（トラックコレクション又はXps側）に必要かも
 *    </pre>
 *  @returns    {Object nas.Xps.XpsTimelineSectionCollection}
 */
nas.Xps.XpsTimelineTrack.parseTimelineTrack = function(){
    var myResult = false;
    var defaultElementGroup = this.xParent.parentXps.xMap.getElementByName(this.id);
    if(! defaultElementGroup) defaultElementGroup=this.xParent.parentXps.xMap.new_xMapElement(this.id,this.option,this.xParent.parentXps.xMap.currentJob);
//    console.log(defaultElementGroup);
    switch(this.option){
        case "dialog":;
            myResult =  this.parseDialogTrack();
        break;
        case "sound":;
            myResult =  this.parseSoundTrack();
        break;
        case "camerawork":;
        case "camera":;
            myResult =  this.parseCameraworkTrack();
        break;
        case "geometry":;
        case "stage":;
        case "stagework":;
            myResult =  this.parseGeometryTrack();
        break;
        case "effect":;
        case "sfx":;
        case "composit":;
            myResult =  this.parseCompositeTrack();
        break;
        case "cell":;
        case "timing":;
        case "still":;
        case "replacement":;
        default:
            myResult =  this.parseReplacementTrack();
    }
    if (myResult){this.sectionTrust=true;}
    return myResult;
}
/** <pre>
 * フレームを指定してタイムライントラック上のセクションを返す
 * セクションバッファが最新でない場合は、セクションパースを実施する
 * 当該のセクションが存在しない場合はnullを戻す </pre>
 *  @params {Number}    myFrame
 *      ショット先頭からのフレーム数
 *  $returns    {Object nas.Xps.XpsTimelineSection | null}
 *      フレームを含むタイムラインセクション　または null
 */
nas.Xps.XpsTimelineTrack.getSectionByFrame = function(myFrame){
    if((typeof myFrame == "undefined") ||(myFrame < 0)) return null;
    var myResult = null;
    var mySections = this.sections;
    if(!(this.sectionTrust)) mySections = this.parseTimelineTrack();
    //ここは非同期実行不可
    if(mySections){
        for (var ix=0;ix<mySections.length;ix ++){
            if(myFrame < (mySections[ix].startOffset()+mySections[ix].duration)){
            myResult = this.sections[ix];
            break;
            }
        }
    }
    return myResult;
}
/** <pre>
 * xMap getElementByName/new_xMapElementをラップするタイムライントラックのメソッド
 * 既存のエレメントを指定した場合は、当該エレメントを返し
 * 存在しないエレメントを指定した場合は、エレメントを作成して返す
 * 同一の手続きが多いため補助関数を作成
 * </pre>
 *  @params {String}    elementName
 *      エレメント名
 *  @params {String}    groupName
 *      グループ名
 */
nas.Xps.XpsTimelineTrack.pushEntry = function (elementName,groupName){
    var myGroup   = this.xParent.parentXps.xMap.getElementByName(groupName);
    var myElement = this.xParent.parentXps.xMap.getElementByName([groupName,elementName].join("-"));//請求するターゲットジョブ処理は保留
    if(!myElement){
        if(!myGroup){;
            myGroup = this.xParent.parentXps.xMap.new_xMapElement(groupName,this.option,this.xParent.parentXps.xMap.currentJob);
        }
        myElement = this.xParent.parentXps.xMap.new_xMapElement(elementName,myGroup,this.xParent.parentXps.xMap.currentJob,[groupName,elementName].join('\t'));
    }
    return myElement;
}
/**
 *	タイムライントラックから最初にヒットしたセル記述を返す
 *  戻り値にはヒットしたフレームidを加える
 *	@params {String} cell
 *	@returns	{Object nas.CellDescription|null}
 */
    nas.Xps.XpsTimelineTrack.findCell = function (cell){
	    for(var f=0; f<this.length;f++){
		    var pcl = new nas.CellDescription(this[f],this.id);
		    if(pcl.type != "normal") continue;
		    if(pcl.compare(cell) > 0) {
		        pcl.frame = f;
		        return pcl;
		    }
		};return null;
	};
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas  = nas;
}else{
    var Xps = nas.Xps;
};
