/**
 * @fileverview タイトル置換データベース
 * う　オブジェクト型メソッドは書いただけで置き換えていなかった…とほほ2010 10 16
 * その上入れ替えできるほど詰めてなかった
 */



/**
 * inputMediaDB
 * "名前",フレーム横幅(cm),フレーム縦横比(width/height),作画標準解像度(dpi),
 * フレームレート(fps),標準タップ位置([ローカル座標X(cm),ローカル座標Y(cm),ローテーション(度)])
 *
 * @type {*[]}
 */
var myInputMedias =[
        "tv225_24_144", 22.5, (4 / 3), (144 / 25.4), 24, [0, 3.0 + (.5 * 22.5 / (4 / 3)), 0],
        "tv240_24_150", 24, (4 / 3), (150 / 25.4), 24, [0, 3.0 + (.5 * 24 / (4 / 3)), 0],
        "hd265_24_144", 26.5, (16 / 9), (144 / 25.4), 24, [0, 3.0 + (.5 * 26.5 / (16 / 9)), 0],
        "hd8in_24_200", 20.3, (16 / 9), (200 / 25.4), 24, [0, 3.0 + (.5 * 20.3 / (16 / 9)), 0]
];

/**
 * outputDB "名前", *
 * @type {*[]}
 */
var myOutputMedias =[
        "VGA24",        480,    640,    1,  24,     false,
        "NTSC24",       480,    640,    1,  24,     false,
        "NTSCD1",       486,    720,    0.9,29.97,  true,
        "hd720_24p",    720,    1280,   1,  24,     false,
        "hd1080_24p",   1080,   1920,   1,  24,     false
    ];

/**
 * workTitle
 * @type {string[]}
 */
var myWorkTitles =
    ["りまぴん", "Remaping", "RMP",
        'nas.inputMedia["tv255_24_144"]', 'nas.ouputMedia["ntscDV"]'
        , "かちかちやま", "KachiKachi", "KTMT",
        'nas.inputMedia["hd265_24_144"]', 'nas.ouputMedia["hdDV"]'
        , "かちかち山Max", "KachiMax", "KTMX",
        'nas.inputMedia["hd265_24_144"]', 'nas.ouputMedia["hd1080_24p"]'
        , "ぽこぽこ", "poco", "PKPK",
        'nas.inputMedia["hd8i_24_200"]', 'nas.ouputMedia["hd720_24p"]'
    ];


/*
 inputMedias	inputMediaCollection
 inputMedia	作成メディアオブジェクト
 inputMedia.frameWidth	作画フレーム幅(float|cm)
 inputMedia.frameAspect	作画フレームアスペクト(float|width/height)
 inputMedia.frameRate	作画フレームレート(float|fps)
 inputMedia.paintResolution	基準仕上げ解像度(float|dpc)

 outputMedias	outputMediasCollection
 outputMedia	出力メディアオブジェクト
 ouputMedia.lines	出力メディアライン数(float|ln)
 ouputMedia.width	出力メディアラインあたりピクセル数(int|px)
 ouputMedia.pixAspect	出力メディアピクセルアスペクト(float|width/height)
 ouputMedia.frameRate	出力メディアフレームレート(float|fps)


 タイトル置換データ
 workTitles  workTitleCollection
 workTitle	作業作品別メディアデータ
 workTitle.name	タイトル(正式名称)(string)
 workTitle.filePrefix	ファイル作成時の前置用略称(string)
 workTitle.shortNema	略号(なるべく2～4バイト程度)(string)

 workTitle.inputMedia	作成メディア(inputMedia|object)

 workTitle.ouputMedia	出力メディア(outputMedia|object)


 タイトル書式
 [タイトル,[ファイル名],[略称]]
 */

/**
 * コンストラクタ
 * usage: new inputMedia([width[,aspect[,fps[,resolution[,frame]]]]])
 *
 * @constructor
 * @param width
 * @param aspect
 * @param fps
 * @param resolution
 * @param frame
 * @param peg
 */
function inputMedia(width, aspect, fps, resolution, frame, peg) {
    this.frameWidth = (!isNaN(width)) ? width : 24.50;//cm
    this.frameAspect = (!isNaN(aspect)) ? aspect : (16 / 9);//width/height
    this.frameRate = (!isNaN(fps)) ? fps : 24;//fps
    this.paintResolution = (!isNaN(resolution)) ? resolution : 144 / 2.54;//dpc
    this.baseFrame = (!isNaN(frame)) ? frame : 100;//撮影フレーム
    this.pegbarOffset = (!isNaN(peg)) ?
        peg : [0, 3.0 + (.5 * this.frameWidth / this.frameAspect), 0];
    // 標準タップ位置([ローカル座標X(cm),ローカル座標Y(cm),ローテーション(度)])
}
/**
 * usage: new outputMedia([width[,aspect[,fps[,resolution[,frame]]]]])
 *
 * @param lines
 * @param width
 * @param aspect
 * @param fps
 * @param interlace
 */
function outputMedia(lines, width, aspect, fps, interlace) {
    this.lines = (!isNaN(lines)) ? lines : 480;//lines/frame
    this.width = (!isNaN(width)) ? width : 640;//pix/line
    this.pixAspext = (!isNaN(aspect)) ? aspect : 1;//width/height
    this.frameRate = (!isNaN(fps)) ? fps : 24;//fps
    this.isInterlace = (interlace) ? true : false;//interlace
}
/**
 * usage: new workTitle(name,filePrefix,shortName,inputMedia,outputMedia)
 *
 * @param name
 * @param filePrefix
 * @param shortName
 * @param inputMedia
 * @param outputMedia
 */
function workTitle(name, filePrefix, shortName, inputMedia, outputMedia) {
    this.name = (name) ? name : "タイトル未定";//
    this.filePrefix = (filePrefix) ? filePrefix : "no_Title";//
    this.shortName = (shortName) ? shortName : "_NT_";//
    this.inputMedia = [];
    this.inputMedia[0] = (inputMedia) ? inputMedia : nas.inputMedia["default"];//
    this.outputMedia = [];
    this.outputMedia[0] = (outputMedia) ? outputMedia : nas.outputMedia["default"];//
}


/**
 * 作業用入出力DB設定
 * @type {Object}
 */
nas.inputMedia = {};
nas.inputMedia["default"] = new inputMedia();
for (n = 0; n < myInputMedias.length; n += 6) {
    nas.inputMedia[myInputMedias[n]] = eval("new inputMedia(" + myInputMedias.slice(n + 1, n + 5).toString() + ")");
}

nas.outputMedia = {};
nas.outputMedia["default"] = new outputMedia();
for (n = 0; n < myOutputMedias.length; n += 6) {
    nas.outputMedia[myOutputMedias[n]] = eval("new outputMedia(" + myOutputMedias.slice(n + 1, n + 5).toString() + ")");
}

nas.workTitle = {};
nas.workTitle["default"] = new workTitle();

for (n = 0; n < myWorkTitles.length; n += 5) {
    nas.workTitle[myWorkTitles[n]] = eval("new workTitle(" + myWorkTitles.slice(n, n + 5).toString() + ")");
}