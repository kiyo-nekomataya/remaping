/**
 * @fileoverview
 * AEキーフレームからXPSオブジェクトに対する変換ライブラリ
 * XPS2AEKは特に重要
 *
 * @desc AEK2XDS(dataStream)
 * AEキーフレームデータを挿入可能なデータストリームに変換する。
 * AEのキーフレームテキストを、複数連ねたデータを受け入れる。
 * その場合最初のデータから順にA,B,C,…の順に積む
 * コンバートに失敗した場合は""ヌルストリングを返す。
 *
 * @desc XPS2AEK(myXps,myOptions)
 * XPSオブジェクト又はソースストリームからAEのキーフレームテキストに変換する。
 * オプションは、オブジェクト
 * 変換するレイヤの指定　（単独又は全て）
 * エクスプレッションの有無
 * 操作スクリプトの有無などを指定可能…にしたいね
 *
 *
 * @desc XPS ファイルから オブジェクトの初期化
 * AEKeyデータ読み込み
 * メソッドか?それとも関数か?
 * 2005/03/20
 *
 * AE 7.0 8.0 対応　2015.04.25
 * 結局は、XPSのメソッドがよかろうと思うのであったよ。
 * でも、出力部分は分けないと汎用性が下がりそうだよね、と
 * AEKey 読み取り部分追加何とか動く 05/04/26
 * AEKey イロイロ補正 おおかた大丈夫そう? 12/11 次は6.5対応だけどー…
 * AEKey bTimeLine 参照違い バグ修正 1/31
 * AERemap/T-Sheet読み込み部分コーディング でも 泥縄 5/12
 * readIN メソッドはメッセージ分離してXpsオブジェクトのメソッドに移送済み
 * ssUnit と ckBlank も引越先を考慮中 (7/7/9)
 *
 * Xps.readINメソッドは、フォーマットをXpsに限定
 * 判定部分はXPSの同名オブジェクトでラップ
 * AEKey関連関数は、lib_AEK.js　として分離　2013.04.06
 */
'use strict';
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    var nas = require('./xpsio');
};
/**
 * AEの動作を模倣するために設定する偽オブジェクトの定義
 * 定義に使用する関数
 * クラスプロトタイプの複製 この関数で
 * 引き継ぎたいプロトタイププロパティを取得
 * @param subClass
 * @param superClass
 */
// function inherit(subClass, superClass) {
//     for (var prop in superClass.prototype) {
//         subClass.prototype[prop] = superClass.prototype[prop];
//     }
// }

var AEKey = {};
/**
 * 合成キャリアオブジェクト設定
 * キャリアオブジェクト単体は使用しないが、
 * 座標系オブジェクトの基礎オブジェクトになる。
 * 座標系の基本メソッドはここから取得する。
 * 合成バッファのたぐいは、コレ!
 * @constructor
 */
AEKey.Carrier = function Carrier() {
//this.prototype.contructor=Array;
    this.width = 0;
    this.height = 0;
    this.pixelAspect = 1;
    this.frameRate = 1;
    this.duration = 0;
}

/**
 * プロトタイプメソッド
 * new AEKey.Carrier();
 * AEKey.Carrier.prototype.constructor = Array;
 *
 * @param rate
 * @returns {*}
 */
AEKey.Carrier.prototype.setFrameRate = function (rate) {
        if (!rate) {
            rate = this.frameRate;
        } else {
            this.frameRate = rate;
        }
        this.frameDuration = 1 / rate;
        return rate;
    };
/**
 *
 * @param duration
 * @returns {*}
 */
AEKey.Carrier.prototype.setFrameDuration = function (duration) {
        if (!duration) {
            duration = this.frameDuration;
        } else {
            this.frameDuration = duration;
        }
        this.frameRate = 1 / duration;
        return duration;
    };
/**
 *
 * @param w
 * @param h
 * @param a
 */
AEKey.Carrier.prototype.setGeometry = function (w, h, a) {
        if (w) {
            this.width = w;
        }
        if (h) {
            this.height = h;
        }
        if (a) {
            this.pixelAspect = a;
        }
        return [w, h, a];
    };


/**
 * キーフレーム設定
 * キーフレームの次元を与えて初期化する。
 * 一つのキーフレームは、以下のプロパティを持つ
 * 時間,        //積算フレーム数で
 * [値],        //タイムラインのプロパティにしたがって多次元
 * [[値の制御変数1],[2]],//値と同次元で、二つ一組
 * [[タイミングの制御変数1],[2]],//二次元、二つ一組
 * キーアトリビュート,//AE用キー補完フラグ
 *
 * @param f
 * @param v
 * @param vCp
 * @param tCp
 * @param kAtrib
 * @constructor
 */
AEKey.KeyFrame = function KeyFrame(f, v, vCp, tCp, kAtrib) {
    if (!f) {
        f = 0
    }
    this.frame = f;
    if (!v) {
        v = null
    }
    this.value = v;
    if (!vCp) {
        vCp = [1 / 3, 2 / 3]
    }
    this.valueCp = vCp;
    if (!tCp) {
        tCp = [[1 / 3, 2 / 3], [1 / 3, 2 / 3]]
    }
    this.timingCp = tCp;//AE互換なら1次元で
    if (!kAtrib) {
        kAtrib = ["stop", "linear", "time_fix"]
    }
    this.keyAtrib = kAtrib;
    /*
     キーアトリビュートは、現在はAE互換を標榜しておく。後で再考
     [タイミング補完,値補完,値の時間補完(ロービング)]
     */

}
//	new AEKey.KeyFrame();

/**
 * タイムライン設定
 * @param atrib
 * @constructor
 */
AEKey.TimeLine = function TimeLine(atrib) {
    this.name = atrib
}
//	new AEKey.TimeLine();
AEKey.TimeLine.prototype = [];
AEKey.TimeLine.prototype.constructor = AEKey.TimeLine;

/**
 * タイムラインはAEの場合だとタイムラインデータのトレーラと言う観点でPropertyに相当するオブジェクト
 * ひとつのタイムラインはそれぞれの属性とともにアニメーション可能なプロパティを保持する。
 * ただし、そこには画像は存在しない　画像の配下のプロパティとしてではなく画像の上位に位置するネットワークの
 * ボードとしてとらえるべきであることだよ
 */


/**
 * AEKey.TimeLine.setKeyFrame(myKeyFrame)
 * 引数    キーフレームオブジェクト
 * 戻値    登録したキーのインデックス
 *
 * タイムラインのメソッド
 * キーフレームをタイムラインに登録する。
 * すでに登録されているキーフレームのうち、同じframe値を持つものがあれば上書きする
 * それ以外は新規登録する。このままだと順不同になるので後で書き換え要
 * プリミティブな登録方式としてはTimeLine.push(KeyFrame)を使用しても良い
 * ただし重複の検査ができないので新規に一括で登録する際のみ推奨
 * この辺はもっと洗練しないと危ないね　２００９
 *
 * @param myKeyFrame
 * @returns {number}
 */
AEKey.TimeLine.prototype.setKeyFrame = function (myKeyFrame) {
    for (var id = 0; id < this.length; id++) {
        nas.otome.writeConsole(myKeyFrame.frame + "<>" + this[id].frame);
        if (myKeyFrame.frame == this[id].frame) {
            this[id] = myKeyFrame;
            return id;
        }
    }
    this.push(KeyFrame);
    return this.length - 1
};
//valueAtTime()
/**
 * AE互換?かもしれない?ここでは互換なし! t はフレーム数で与えること
 * @param t
 * @returns {*}
 * @private
 */
AEKey.valueAtTime_ = function valueAtTime_(t) {
    if (t <= this[0].frame) {
        return this[0].value
    }
    if (t >= this[this.length - 1].frame) {
        return this[this.length - 1].value
    }
    for (var id = 1; id < this.length; id++) {
        if (t == this[id].frame) {
            return this[id].value
        }
        /**
         * 所属キーフレームが判明したので計算して返す
         */
        if (t < this[id].frame) {

            if (this[id].keyAtrib[0] == "stop") {
                //キー補完が停止の時は、補完計算なし。前方キーの値で返す。
                return this[id - 1].value;
            } else {
                var Vstart = this[id - 1].value;
                var Vcp1 = this[id - 1].valueCp[0];
                var Vcp2 = this[id - 1].valueCp[1];
                var Vend = this[id].value;

                var Tstart = this[id - 1].frame;
                var Tcp1 = this[id - 1].timingCp[0];
                var Tcp2 = this[id - 1].timingCp[1];
                var Tend = this[id].frame;

                /**
                 * 値が描くアークの全長を求める
                 */
                var HallArk = nas.bezierL(Vstart, Vcp1, Vcp2, Vend);
                /**
                 * 指定時間からタイミング係数を求める
                 * @type {number}
                 */
                var Now = (t - Tstart) / (Tend - Tstart);
                /**
                 * 時間から 2次元(時間・比率)助変数を求める。
                 */
                var Tvt = nas.bezierA(Tcp1[0], Tcp1[1], Now);
                /**
                 * 求めた助変数でタイミング係数を出す
                 */
                var Tvv = nas.bezierA(0, Tcp2[0], Tcp2[1], 1, Tvt);
                /**
                 * 係数から値を求める。
                 */
                Tt = Tvv;//仮助変数(初期値)
                Tmax = 1;
                Tmin = 0;
                var preLength = 0;//始点からのアーク長
                var postLength = 0;//終点までのアーク長
                var TtT = 0;//テストで得られる比率

                do {
                    preLength = nas.bezierL(Vstart, Vcp1, Vcp2, Vend, 0, Tt);
                    postLength = nas.bezierL(Vstart, Vcp1, Vcp2, Vend, Tt, 1);
                    TtT = preLength / (preLength + postLength);
                    if (Tvv < preLength / (preLength + postLength)) {
                        Tmin = Tt;//下限値を現在値に
                        Tt = (Tmax + Tt) / 2;//新テスト値を設定
                    } else {
                        Tmax = Tt;//上限値を現在値に
                        Tt = (Tmin + Tt) / 2;//新テスト値を設定
                    }
                } while (TtT / Tvv > 0.9999999 && TtT / Tvv < 1.0000001);//精度確認
                //その得られた助変数を使って値を返す。値の次元数でループ
                var Result = new Array(Vstart.length);
                for (var i = 0; i < Vstart.length; i++) {
                    Result[i] = nas.bezier(Vstart[i], Vcp1[i], Vcp2[i], Vend[i], Tt)
                }
                return Result;
            }
        }
    }

}

/**
 * レイヤ設定
 * レイヤのメンバはタイムライン
 * デフォルトで以下のタイムラインがある。
 * タイムリマップ**
 * アンカーポイント
 * 位置
 * 回転
 * 不透明度
 * カラセル**
 * ワイプ
 * エクスプレッション
 * **印は、りまぴんのみ
 *
 * @constructor
 */
AEKey.FakeLayer = function FakeLayer() {

    this.width = 640;
    this.height = 480;
    this.pixelAspect = 1;
    this.frameRate = 24;
    this.duration = 0;
    this.activeFrame = 0;

    this.inPoint = 0;
    this.outPoint = this.duration;
    /**
     * タイムラインプロパティなので後から初期化?りまぴんでは特に初期化しない。
     */
    this.init = function () {

        this.timeRemap = new AEKey.TimeLine("timeRemap");
        this.timeRemap.push(new AEKey.KeyFrame(0, "blank"));
        this.anchorPoint = new AEKey.TimeLine("anchorPoint");
        this.anchorPoint.push(new AEKey.KeyFrame(0, [this.width / 2, this.height / 2, 0]));
        this.position = new AEKey.TimeLine("position");
        this.positiont.push(new AEKey.KeyFrame(0, [thisComp.width / 2, thisComp.heigth / 2, 0]));
        this.rotation = new AEKey.TimeLine("rotation");
        this.rotation.push(new AEKey.KeyFrame(0, [0, 0, 0]));
        this.opacity = new AEKey.TimeLine("opacity");
        this.opacity.push(new KayFrame(0, 100));
    }
}
//	new AEKey.FakeLayer();
AEKey.FakeLayer.prototype = new AEKey.Carrier();
AEKey.FakeLayer.prototype.constructor = AEKey.FakeLayer;
//inherit(FakeLayer,AEKey.Carrier);//AEKey.Carrierのメソッドを取得

/**
 *
 * @param ip
 * @param op
 */
AEKey.FakeLayer.prototype.setClip = function (ip, op) {
    if (ip && ip >= 0 && ip <= duration) this.inPoint = ip;
    if (op && op >= 0 && op <= duration) this.outPoint = op;
    return [ip, op];
};
/*
 AEKey.FakeLayer.prototype.=function(){
 };
 AEKey.FakeLayer.prototype.=function(){
 };
 AEKey.FakeLayer.prototype.=function(){
 };
 */

/**
 * コンポジション設定
 * コンポジションコンストラクタ
 * @constructor
 */
// function FakeComposition() {
//     this.width = 640;
//     this.height = 480;
//     this.pixelAspect = 1;
//     this.frameRate = 24;
//     this.duration = 0;
// }

/**
 *
 * @param w
 * @param h
 * @param a
 * @param l
 * @param f
 * @constructor
 */
AEKey.FakeComposition = function FakeComposition(w, h, a, l, f) {
    this.layers = [];
    if (!w)    w = 640;
    if (!h)    h = 480;
    if (!a)    a = 1;
    if (!l)    l = 6;
    if (!f)    f = 24;
    this.width = w;//幅(バッファ幅・px)
    this.height = h;//高さ(バッファ高さ・px)
    this.pixelAspect = a;//ピクセル縦横比
    this.duration = l;//長さ(継続時間・秒)
    this.framerate = f;//フレームレート(fps)
}

//	ダミー初期化
//	new AEKey.FakeComposition();
AEKey.FakeComposition.prototype = new AEKey.Carrier();
AEKey.FakeComposition.prototype.constructor = AEKey.FakeComposition;

//		inherit(AEKey.FakeComposition,AEKey.Carrier);//AEKey.Carrierのメソッドを取得
//		inherit(AEKey.FakeComposition,Array);//配列としてのメソッドを取得

/**
 * メソッド設定
 * @returns {number}
 * @private
 */
AEKey.frame_duration_ = function frame_duration_() {
    return 1 / this.framerate;
}

AEKey.FakeComposition.prototype.frameDuration = AEKey.frame_duration_;
AEKey.FakeComposition.prototype.frame_duration = AEKey.frame_duration_;


/**
 * ssUnit(UpS)
 * サブユニット長を自動設定して戻す
 * 引数 UpS は、Units Per Second・秒あたりのフレーム数 または キーワード
 * 戻り値は、フレームレートにしたがって自動設定されるサブユニットの長さ
 * サブセパレータの値とは別。
 * @param UpS
 * @returns {*}
 */
AEKey.ssUnit = function ssUnit(UpS) {
    if (isNaN(UpS)) {
        switch (UpS) {
            case "NTSC"    :
                return 6;
                break;
            case "PAL"    :
                return 5;
                break;
            case "drop"    :
                return 6;
                break;
            default    :
                return UpS;
        }
    } else {
        UpS = Math.round(UpS);//	ドロップフレーム系の処置・どのみち整数でないとイヤだけど、暫定で
        for (var ssu = 4; ssu > 1; ssu--) {
            if (UpS % ssu == 0)return UpS / ssu;
        }
        return UpS;
    }
//	4から1へ順に約数をあたる。マッチした時点で返す。
//	すべて失敗した場合は、元の数値を返す。
}

/**
 * AEKey.ckBlank(timeLine)
 * 制御レイヤ(現在カラセル制御のみ)の判定
 * 判定するtimelineオブジェクトを与える。
 * すべての値が 0 || 100    ならばカラセルレイヤであると判定
 * 現在はブーリアンで返しているが、要調整か?
 *
 * @param timeLine
 * @returns {boolean}
 */
AEKey.ckBlank = function ckBlank(timeLine) {
    for (var xid = 0; xid < timeLine.length; xid++) {
        if (timeLine[xid].value[0] % 100 != 0) {
            return false
        }
    }
    return true;
}

var thisComp = null;
var thisLayer = null;
var thisTimeLine = null;

/**
 * @param datastream
 * @returns {string}
 * @constructor
 */
 function AEK2XDS(datastream) {
    /**
     * AE-Key data encoder
     * AEキーの挿入は外部でストリームを組み立ててputする方式に変更する
     * データ冒頭の空白文字を削除
     */
    datastream = datastream.replace(/^\s*/, "");
    if ((!datastream.toString().length ) ||
        ( false )
    ) {
        return ""
    }
    /**
     * 不正データ時処理
     * ラインで分割して配列に取り込み
     * @type {Array}
     */
//alert(datastream);
    var SrcData = [];
    if (datastream.match(/\r/)) {
        datastream = datastream.replace(/\r\n?/g, ("\n"));
    }
    SrcData = datastream.split("\n");

    /**
     * ソースデータのプロパティ
     * @type {number}
     */
//	SrcData.layerHeader	=0;//レイヤヘッダ開始行
//	SrcData.layerProps	=0;//レイヤプロパティエントリ数
    SrcData.layerCount = 0;//レイヤ数
    SrcData.layers = [];//レイヤ情報トレーラー
//	SrcData.layerBodyEnd	=0;//レイヤ情報終了行
    SrcData.frameCount = 0;//読み取りフレーム数

    /**
     * 仮にデータを取得するコンポを初期化
     * @type {AEKey.FakeComposition}
     */
    thisComp = new AEKey.FakeComposition();
    thisComp.maxFrame = 0;//キーの最大時間を取得するプロパティを初期化
    ly_id = 0;//レイヤID初期化
    tl_id = 0;//タイムラインID初期化
    kf_id = 0;//キーフレームID初期化 いらないか?

    /**
     * 第一パス開始
     * データをスキャンしてコンポ(オブジェクト)に格納
     */
    for (var line = 0; line < SrcData.length; line++) {
        /**
         * キーデータに含まれるレイヤ情報の取得
         */
        if (appHost.platform == 'MSIE') {
            var choped = SrcData[line].charCodeAt(SrcData[line].length - 1);
            if (choped <= 32) SrcData[line] = SrcData[line].slice(0, -1);
        }
        //データ前処理・なぜだかナゾ、なぜに一文字多いのか?

        /**
         * 空白行のスキップ
         */
        if (SrcData[line] == '') continue;

        /**
         * 一番エントリの多いデータ行を最初に処理
         */
        if (SrcData[line].match(/^\t.*/)) {
//if(dbg) dbgPut("\tDATALINEs\nLayer No."+ly_id+" TimeLineID :"+tl_id+ " "+line+":"+SrcData[line]);
            var SrcLine = SrcData[line].split("\t");

            if (SrcLine[1] == "Frame") continue;//フィールドタイトル行スキップ

            if (tl_id == 0) { //レイヤ内で一度もタイムラインを処理していない。
//if(dbg) dbgPut(SrcLine);

                /**
                 * レイヤヘッダなのでレイヤのプロパティを検証してオブジェクトに登録
                 */
                switch (SrcLine[1]) {
                    case    "Units\ Per\ Second"    :
                        /**
                         * コンポフレームレート
                         */
                        thisComp.frameRate = SrcLine[2];
                        break;
                    /**
                     * この部分をこのまま放置するとコンポのフレームレートが、最後のレイヤで決定されるので注意。
                     */

                    case    "Source\ Width"    :
                        /**
                         * レイヤソース幅
                         */
                        thisLayer.width = SrcLine[2];
                        break;
                    case    "Source\ Height"    :
                        /**
                         * レイヤソース高さ
                         */
                        thisLayer.height = SrcLine[2];
                        break;
                    case    "Source\ Pixel\ Aspect\ Ratio"    :
                        /**
                         * ソースの縦横比
                         */
                        thisLayer.pixelAspect = SrcLine[2];
                        break;
                    case    "Comp\ Pixel\ Aspect\ Ratio"    :
                        /**
                         * コンポの縦横比
                         */
                        thisComp.pixelAspect = SrcLine[2];
                        break;
                    default:
                        /**
                         * 時間関連以外
                         */
                        thisLayer[SrcLine[1]] = SrcLine[2];
                        break;
                    /**
                     *  判定した値をレイヤのプロパティに控える。
                     */
                }
            } else {
                /**
                 * タイムラインデータなのでアクティブなタイムラインに登録
                 * @type {number}
                 */
//if(dbg) dbgPut("timelinedata line No."+line+":"+SrcData[line]);
                frame = SrcLine[1] * 1;
                if (frame > thisComp.maxFrame) thisComp.maxFrame = frame;
                /**
                 * キーフレームの最大時間を記録
                 * @type {Array.<*>}
                 */
                value = SrcLine.slice(2, SrcLine.length - 1);
//	value=SrcLine.slice(2);

//	タイムラインの最大値を控える 999999 は予約値なのでパス
//	実際問題ここで控えた方が良いのかこれは?
//	if (thisTimeLine.maxValue<value && value < 999999)
//	thisTimeLine.maxValue=value;

//result=thisTimeLine.push(new AEKey.KeyFrame(frame,value));
//thisComp.layers[ly_id][tl_id][kf_id] = new AEKey.KeyFrame(frame,value);
//kf_id ++;
//result=thisComp.layers[ly_id][tl_id].setKeyFrame(new AEKey.KeyFrame(frame,value));

                thisComp.layers[ly_id][tl_id].push(new AEKey.KeyFrame(frame, value));
                result = thisComp.layers[ly_id][tl_id].length;

//	if(dbg) dbgPut(">>set "+thisComp.layers[ly_id][tl_id].name+
//	" frame:"+frame+"  to value:"+value+"<<"+result+
//	"::and maxFrame is :" + thisComp.maxFrame);

//if(dbg) dbgPut(">>> "+ thisComp.layers[ly_id][tl_id][kf_id].frame +"<<<");
            }

            continue;//次の判定は、当然パスして次の行を処理
        }
        /**
         * レイヤ開始判定
         */
        if (SrcData[line].match(/^Adobe\ After\ Effects\x20([456]\.[015])\ Keyframe\ Data$/)) {
//if(dbg) dbgPut("\n\nNew Layer INIT "+l+":"+SrcData[line]);
            /**
             * レイヤ作成
             * @type {AEKey.FakeLayer}
             */
            thisComp.layers[ly_id] = new AEKey.FakeLayer();
//		thisComp.layers[ly_id].init();
            thisLayer = thisComp.layers[ly_id];//ポインタ設定

            continue;
        }
        /**
         * タイムライン開始判定または、レイヤ終了
         */
        if (SrcData[line].match(/^[\S]/)) {
//　タイムライン終了処理があればここに
// レイヤ終了処理
//if(dbg)	dbgPut(line+" : "+SrcData[line]);
            if (SrcData[line].match(/^End\ of\ Keyframe\ Data/)) {
//			thisComp.setFrameDuration()
                ly_id++;
                tl_id = 0;
                kf_id = 0;
                //レイヤIDインクリメント・タイムラインID初期化
            } else {

//	最上位階層はデータブロックのセパレータなので読み取り対象を切り換え	//	タイムラインを判定して作成


//	if(! SrcData[line].match(/^\s*$/)){}

                /**
                 * 新規タイムライン設定
                 * @type {Array}
                 */

                SrcLine = SrcData[line].split("\t");

                switch (SrcLine[0]) {
                    case    "Time\ Remap":
                        tl_id = "timeRemap";
                        break;
                    case    "Anchor\ Point":
                        tl_id = "anchorPoint";
                        break;
                    case    "Position":
                        tl_id = "position";
                        break;
                    case    "Scale":
                        tl_id = "scale";
                        break;
                    case    "Rotation":
                        tl_id = "rotation";
                        break;
                    case    "Opacity":
                        tl_id = "opacity";
                        break;
                    case    "変換終了":
                        tl_id = "wipe";//AE 4.0-5.5 wipe/トランジション
                        break;
                    case "スライダ":
                        tl_id = "slider";//AE 4.0-5.5 スライダ制御
                        break;
                    case    "Effects":	//AE 6.5 (6.0? 要確認) エフェクトヘッダサブ判定が必要
                        switch (SrcLine[1].slice("\ ")[0]) {
                            case "変換終了":
                                tl_id = "wipe";
                                break;
                            case "スライダ制御":
                                tl_id = "slider";
                                break;
//	case "":	tl_id="";break;
//	case "":	tl_id="";break;
//	case "":	tl_id="";break;
                                tlid = SrcLine[1];
                        }
                        break;
                    default:
                        tlid = SrcLine[0];
                }

//	if(! thisComp.layers[ly_id][tl_id]){thisComp.layers[ly_id][tl_id]= new AEKey.TimeLine(tl_id)}else{if(dbg) dbgPut(tl_id)}

                if (!thisComp.layers[ly_id][tl_id]) {
                    thisComp.layers[ly_id][tl_id] = [];
                    thisComp.layers[ly_id][tl_id].name = [tl_id];
                    thisComp.layers[ly_id][tl_id].maxValue = 0;
                    thisComp.layers[ly_id][tl_id].valueAtTime = AEKey.valueAtTime_;
                }
                //else{	if(dbg) dbgPut(tl_id + " is exist")	}
//			なければ作る＝すでにあるタイムラインならスキップ
                thisTimeLine = thisComp.layers[ly_id][tl_id];
//		if(dbg) dbgPut("set TIMELINE :"+ly_id+":"+tl_id);
                continue;
            };
        };
    };
//		all_AEfake();
    /**
     * キーの読み込みが終わったのでキーデータを解析
     * キーの最後のフレームをみて、カットの継続時間を割り出す。
     * @type {number}
     */
    thisComp.duration =
        nas.FCT2ms(
            AEKey.ssUnit(thisComp.frameRate) *
            Math.ceil(thisComp.maxFrame / AEKey.ssUnit(thisComp.frameRate))
        ) / 1000;//最小単位はキリの良いところで設定


    /**
     * タイムラインをチェックしてタイミング情報を抽出
     * レイヤでループ
     */
    for (var lyr = 0; lyr < thisComp.layers.length; lyr++) {

        /**
         * コンポジションのレイヤ情報を読んで、変換のパラメータを判定する
         * 現在認識して読み取るタイムライン
         * timeRemap    タイミング情報有り
         * slider    タイミング情報の可能性有り
         * opacity    タイミング情報の可能性有り
         * wipe    タイミング情報の可能性有り
         * **カメラワーク判定は、現在なし 常にfalse
         */

        /**
         * ソースデータ用情報トレーラ
         * @type {{}}
         */
        SrcData.layers[lyr] = {};
        /**
         * 初期化
         * @type {boolean}
         */
        SrcData.layers[lyr].haveTimingData = false;
        SrcData.layers[lyr].haveCameraWork = false;

        /**
         * メソッド・位置をデフォルトに設定
         */
        SrcData.layers[lyr].blmtd = xUI.blmtd;
        SrcData.layers[lyr].blpos = xUI.blpos;
        SrcData.layers[lyr].blmtd = "wipe";
        SrcData.layers[lyr].blpos = "first";
        SrcData.layers[lyr].lot = "=AUTO=";
        /**
         * 仮のブランクレイヤ
         * @type {boolean}
         */
        SrcData.layers[lyr].bTimeLine = false;
        SrcData.layers[lyr].tBlank = false;
        /**
         * リマップはある?
         */
        if (thisComp.layers[lyr].timeRemap) {
            SrcData.layers[lyr].haveTimingData = true;

            /**
             * カラセル制御レイヤはあるか
             */
            if (thisComp.layers[lyr].opacity) {
                if (AEKey.ckBlank(thisComp.layers[lyr].opacity)) {
                    SrcData.layers[lyr].blmtd = "opacity";
                    SrcData.layers[lyr].blpos = "end";
                    //仮のブランクレイヤ
                    SrcData.layers[lyr].bTimeLine = thisComp.layers[lyr].opacity;
                    SrcData.layers[lyr].tBlank = 0;
//alert("hasBlankOpacity");
                }
            } else {
                if (thisComp.layers[lyr].wipe) {
                    if (AEKey.ckBlank(thisComp.layers[lyr].wipe)) {
                        SrcData.layers[lyr].blmtd = "wipe";
                        SrcData.layers[lyr].blpos = "end";
                        //仮のブランクレイヤ
                        SrcData.layers[lyr].bTimeLine = thisComp.layers[lyr].wipe;
                        SrcData.layers[lyr].tBlank = 100;
//alert("hasBlankWipe");
                    }
                }
            }
            /**
             * キーを全数検査
             * @type {boolean}
             */
            var isExpression = false;//エクスプレッションフラグ
            var MaxValue = 0;//最大値を控える変数
            var blAP = false;//カラセル出現フラグ
            var tmpBlank = (SrcData.layers[lyr].blmtd == "opacity") ? 0 : 100;//仮のブランク値
            for (var kid = 0; kid < thisComp.layers[lyr].timeRemap.length; kid++) {
                if (thisComp.layers[lyr].timeRemap[kid].value[0] >= 999999) {
                    isExpression = true;
                    blAP = true;
                }
                //これが最優先(最後に判定して上書き)
                /**
                 * 最大値を取得
                 */
                if (MaxValue < 1 * thisComp.layers[lyr].timeRemap[kid].value[0] &&
                    1 * thisComp.layers[lyr].timeRemap[kid].value[0] < 999999) {
                    MaxValue = 1 * thisComp.layers[lyr].timeRemap[kid].value[0];

                    /**
                     * 最大値が更新されたらキーに対応するカラセル制御をチェック
                     */
                    if (SrcData.layers[lyr].bTimeLine) {

                        /**
                         * 制御ラインあるか
                         * キーフレームの位置にブランク指定があれば、そこをブランク値に設定
                         */
                        if (SrcData.layers[lyr].bTimeLine.valueAtTime(thisComp.layers[lyr].timeRemap[kid].frame) == SrcData.layers[lyr].tBlank) {
                            blAP = true;//カラセル出現
                        }
                    }
                }
            }
            if (isExpression) {
                SrcData.layers[lyr].blmtd = "expression2";
                SrcData.layers[lyr].blpos = "end";
            }

            SrcData.layers[lyr].maxValue = MaxValue;

            /**
             * フレームレート取り出し
             */
            var FrameDuration = (thisComp.layers[lyr].frameDuration) ?
                thisComp.layers[lyr].frameDuration :
                thisComp.frameDuration();
            /**
             * セル枚数推定
             */
            switch (SrcData.layers[lyr].blpos) {
                case "end":
                    SrcData.layers[lyr].lot = (blAP) ?
                        Math.floor(MaxValue / FrameDuration) :
                    Math.floor(MaxValue / FrameDuration) + 1;//end
                    if (isExpression && blAP)    SrcData.layers[lyr].lot++;
//		SrcData.layers[lyr].hasBlank=blAP;
                    break;
                case "first":
                    SrcData.layers[lyr].lot =
                        Math.floor(MaxValue / FrameDuration);//first
                    break;
                case "none":
                default:
//	SrcData.layers[lyr].lot="=AUTO=";//end && MaxValue==0
            }
        } else {
            /**
             * スライダ制御はある?
             */
            if (thisComp.layers[lyr].slider) {
                /**
                 * スライダ=エクスプレッションの可能性有り
                 * エクスプレッションだとするとexpression1なので、
                 * 同一レイヤにタイムラインが二つ以上あってはならないものとする。
                 * が、二つ目以降のスライダは、現在正常に読めない。混ざる
                 *
                 * そのうち何とかする
                 */

                /**
                 * キーを全検査する。
                 * @type {number}
                 */
                var MaxValue = 0;
                var isTiming = true;
                for (var kid = 0; kid < thisComp.layers[lyr].slider.length; kid++) {
                    /**
                     * 整数か
                     */
                    if (thisComp.layers[lyr].slider[kid].value[0] % 1 != 0) {
                        isTiming = false;
                        break;
                    }

                    /**
                     * 最大値を取得
                     */
                    if (MaxValue < 1 * thisComp.layers[lyr].slider[kid].value[0]) {
                        MaxValue = thisComp.layers[lyr].slider[kid].value[0]
                    }
                }
                /**
                 * すべて整数値ならば一応エクスプレッションによるタイミングと認識
                 */
                if (isTiming) {
                    SrcData.layers[lyr].haveTimingData = true;
                    SrcData.layers[lyr].blmtd = "expression1";
                    SrcData.layers[lyr].blpos = "first";
                    SrcData.layers[lyr].lot = MaxValue;
                    SrcData.layers[lyr].maxValue = MaxValue;
                }
            }
        }
        /**
         * 両方の判定を抜けたならタイミング情報がないのでこのレイヤはただの空レイヤ
         */

        /**
         タイミングだと思われる場合はフラグ立てる。
         case    "slider":
         case    "timeRemap":    ;break;
         キーを全数検査する。
         制御レイヤが付属していたらそちらを優先させる。
         制御レイヤの値とリマップの値を比較してカラセルメソッドとポジションを出す

         //タイムリマップとスライダの時のみの判定
         //値の最大量を控える
         if(SrcData.layers[ly_id].maxValue<value) SrcData.layers[ly_id].maxValue= value;

         //スライダかつ整数以外の値があるときは削除フラグを立てる
         if(tl_id=="slider" && value%1 != 0) SrcData.layers[ly_id].isExpression=false;

         //タイムリマップでかつ値に"999999"がある場合はメソッドをexp2に
         if(tlid=="timeRemap" && value==999999) SrcData.leyers[ly_id].blmtd="exp2";

         */

    }
    /**
     * 解析したプロパティの転記
     * @type {string}
     */
// alert(thisComp.layers.length+" : "+thisComp.duration*thisComp.frameRate)
//var myXps=new Xps(thisComp.layers.length,thisComp.duration*thisComp.frameRate);

    SrcData.mapfile = "(no file)";
    SrcData.title = "";
    SrcData.subtitle = "";
    SrcData.opus = "";
    SrcData.scene = "";
    SrcData.cut = "";
    SrcData.create_user = "";
    SrcData.update_user = "";
    SrcData.create_time = "";
    SrcData.update_time = "";
    SrcData.framerate = thisComp.frameRate;
    SrcData.layerCount = thisComp.layers.length;
    SrcData.memo = "";
    SrcData.time = thisComp.duration * thisComp.frameRate;//読み取り
    SrcData.trin = [0, "trin"];
    SrcData.trout = [0, "trout"];//キーフレームからは読まない(ユーザが後で指定)

//	SrcData.frameCount	=;
//	SrcData.	="";
//	SrcData.	="";
//	SrcData.	="";	
//	SrcData.	="";


    /**
     * タイムリマップとスライダ制御の両方がない場合は、
     * レイヤは「camerawork」(保留)
     * スライダ制御があって、かつデータエントリーがすべて整数の場合は、
     * exp1 それ以外はスライダ制御を破棄
     * スライダ制御とタイムリマップが両方ある場合はタイムリマップ優先
     */


    /**
     * 読み出したAEオブジェクトから情報を再構成する
     * @type {string}
     */
    var preValue = '';//直前の値を控えておく変数
    if (true) {
//	var AETransStream=new String();//リザルト文字列の初期化
        var AETransStream = "";//リザルト文字列の初期化
        var AETransArray = new Array(SrcData.layerCount);//
        for (var layer = 0; layer < SrcData.layerCount; layer++) {
            AETransArray[layer] = [];
        }
    }

    for (var layer = 0; layer < SrcData.layerCount; layer++) {
        /**
         * レイヤ数回す
         * @type {string}
         */

        timingTL = (SrcData.layers[layer].blmtd == "expression1") ? "slider" : "timeRemap";//	タイミング保持タイムラインをblmtdで変更


        BlankValue = (SrcData.layers[layer].blpos == "first") ?
            0 : (SrcData.layers[layer].lot + 1);
        /**
         * レイヤごとのブランク値を出す。999999は、パス
         */

        for (var kid = 0; kid < thisComp.layers[layer][timingTL].length; kid++) {
            /**
             * タイミング保持タイムラインのキー数で転送
             */
            if (preValue != thisComp.layers[layer][timingTL][kid].value[0]) {
                frame = thisComp.layers[layer][timingTL][kid].frame;

                /**
                 * キーフレームの存在するコマのみ時間値からセル番号を取り出して転送
                 */

                if (xUI.timeShift) {
                    var diffStep = (Math.abs(thisComp.layers[layer][timingTL][kid].value[0] % thisComp.frameDuration())) / thisComp.frameDuration();
                    timeShift = (diffStep < 0.1) ? thisComp.frameDuration() * 0.5 : 0;
                } else {
                    timeShift = 0;
                }
                blank_offset = (SrcData.layers[layer].blpos == "first") ? 0 : 1;

                /**
                 * あらかじめセル番号を計算
                 */
                cellNo = (timingTL == "timeRemap") ?
                Math.floor((thisComp.layers[layer][timingTL][kid].value[0] * 1 + timeShift) / thisComp.frameDuration()) + blank_offset :
                    thisComp.layers[layer][timingTL][kid].value[0];
                if (SrcData.layers[layer].blpos == "first") {
                    if (cellNo == BlankValue) {
                        cellNo = "X"
                    }
                } else {
                    if (cellNo >= BlankValue) {
                        cellNo = "X"
                    }
                }

                /**
                 *  無条件ブランク
                 */
                if (
                    thisComp.layers[layer][timingTL][kid].value[0] == 999999 ||
                    thisComp.layers[layer][timingTL][kid].value[0] < 0
                ) {
                    cellNo = "X"
                }
                if (SrcData.layers[layer].bTimeLine) {
                    if (SrcData.layers[layer].bTimeLine.valueAtTime(frame) == SrcData.layers[layer].tBlank) {
                        cellNo = "X"
                    }
                }
//if(dbg) dbgPut(thisComp.layers[layer][timingTL][kid].value);

                if (false) {
                    myXps.xpsBody[layer + 1][frame] = cellNo;
                } else {
                    AETransArray[layer].push(cellNo.toString());
                    if (kid < thisComp.layers[layer][timingTL].length - 1) {
                        var currentframe = thisComp.layers[layer][timingTL][kid].frame;
                        var nextframe = thisComp.layers[layer][timingTL][kid + 1].frame;
                        for (var fr = currentframe + 1; fr < nextframe; fr++) {
                            AETransArray[layer].push("");
                        }
                    }
                }
            } else {
                AETransArray[layer].push("");
            }
            preValue = thisComp.layers[layer][timingTL][kid].value[0];
        }
        preValue = '';//1レイヤ終わったら再度初期化
    }
//=================この関数内でput処理はしない　データストリームを作って戻すだけに留める

    /**
     * リザルト配列の要素数を比較して最も大きなものに合わせる
     * ブロックデータに加工
     *
     * @type {number}
     */
    var MaxLength = 0;
    for (var layer = 0; layer < SrcData.layerCount; layer++) {
        MaxLength = (MaxLength < AETransArray[layer].length) ?
            AETransArray[layer].length : MaxLength;
    }
    for (var layer = 0; layer < SrcData.layerCount; layer++) {
        AETransArray[layer].length = MaxLength;
        AETransStream += AETransArray[layer].join(",");
        if (layer < SrcData.layerCount - 1)AETransStream += "\n";
    }
//	xUI.Select=[1,0];
//	xUI.put(AETransStream);

    return AETransStream
}
//=================================================================

//これはAEだと不要か？
//Xps.prototype.mkAEKey=function(layer_id){};
/**
 * キーフレーム変換メソッド
 *
 * キー変換部分はりまぴん的にはヘソだけど、汎用的にはNG
 * この部分は、コンバータとして置き換えが必要
 * xUI又は別LIBに引っ越すべき　2013.04.05
 *
 * 引越し前に陳腐化したので内容整理する　2015.04.26
 * AE4-7をサポート外に
 * AE CS3-4/CS5-CC2104　でスライダー問題対応
 * expression2 タイプは、仕様変更により意味をなくしたので廃止（多分応用可能なのは6.5のみ）
 * expression1　は「動画番号トラック」に改名
 * エクスプレッション張り込みは、サポート内の全バージョンで可能なので切り分けは不要
 * チャンネルシフトエフェクトのカラセル方式を追加(キー固定は不要)
 * キー配置タイプは全廃　最少キーのみ(UI修正)
 *
 * 動画（中割）記号＝中間値補間サイン　増設による変更開始　2015.10.13
 * @param myXps
 * @param layer_id
 * @returns {string}
 * @constructor
 */
 function XPS2AEK(myXps, layer_id) {

    /**
     * @desc 将来、データツリー構造が拡張された場合、機能開始時点でツリーの仮構築必須
     * 現在は、決め打ち
     * 内部処理に必要な環境を作成
     */

    /**
     * オプション群はりまぴんUI上の値を参照する
     * UI上で変更があった場合はUIオブジェクト側でxUIのデフォルト値を変更せず、XPSのプロパティを変更する仕様
     * プリファレンス上の変更は新規ファイル作成時のデフォルト
     * キー変換パネル上の編集はXPS上のプロパティの編集である
     */
//    var layerDataArray = myXps.xpsBody[layer_id + 1];
    var layerDataArray = myXps.xpsTracks[layer_id];
    layerDataArray.label = myXps.xpsTracks[layer_id].id;

//var	blank_method	=myXps.xpsTracks[layer_id].blmtd;
    var blank_method = xUI.blmtd;

//var	blank_pos	=myXps.xpsTracks[layer_id].blpos;
    var blank_pos = xUI.blpos;

    var key_method = "min";// minimum 固定
    var key_max_lot = (isNaN(myXps.xpsTracks[layer_id].lot)) ?
        0 : myXps.xpsTracks[layer_id].lot;

    var bflag = (blank_pos) ? false : true;//ブランク処理フラグ

    var AE_version = xUI.aeVersion;
    var compFramerate = (myXps.framerate.rate)? myXps.framerate.rate:myXps.framerate;
    var footageFramerate = xUI.fpsF;
    if (isNaN(footageFramerate)) {
        footageFramerate = compFramerate
    }
    var sizeX = myXps.xpsTracks[layer_id].sizeX;
    var sizeY = myXps.xpsTracks[layer_id].sizeY;
    var aspect = myXps.xpsTracks[layer_id].aspect;
//alert("カラセル方式は :"+blank_method+"\n フーテージのフレームレートは :"+footageFramerate);

    var layer_max_lot = 0;//レイヤロット変数の初期化

    /**
     * 前処理 シート配列からキー変換前にフルフレーム有効データの配列を作る
     * 全フレーム分のバッファ配列を作る
     */
    var bufDataArray = myXps.getNormarizedStream(layer_id);
    if (false) {
        /**
         * 第一フレーム評価・エントリが無効な場合空フレームを設定
         * @type {string}
         */
        bufDataArray[0] = (dataCheck(layerDataArray[0], layerDataArray.label, bflag)) ?
            dataCheck(layerDataArray[0], layerDataArray.label, bflag) : "blank";

        /**
         * 2?ラストフレームループ
         */
        for (var f = 1; f < layerDataArray.length; f++) {
            /**
             * 有効データを判定して無効データエントリを直前のコピーで埋める
             */
            bufDataArray[f] = (dataCheck(layerDataArray[f], layerDataArray.label, bflag)) ?
                dataCheck(layerDataArray[f], layerDataArray.label, bflag) : bufDataArray[f - 1];

            if (bufDataArray[f] != "blank") {
                layer_max_lot = (layer_max_lot > bufDataArray[f]) ?
                    layer_max_lot : bufDataArray[f];
            }
        }
        var max_lot = (layer_max_lot > key_max_lot) ?
            layer_max_lot : key_max_lot;

        /**
         * あらかじめ与えられた最大ロット変数と有効データ中の最大の値を比較して
         * 大きいほうをとる
         * ここで、layer_max_lot が 0 であった場合変換すべきデータが無いので処理中断
         */
        if (layer_max_lot == 0) {
            xUI.errorCode = 4;
            return;
// "変換すべきデータがありません。\n処理を中断します。";
        }
    }

    /**
     * @note AEのキーとして変換する際は、動画の補間予約（まだ描かれていない絵）は
     * 「現在の値を継続」とするのが最も妥当
     * ただしモーションプレビューのスタイルとして「カラ扱い」というメソッドもあることに注意
     */

    /**
     * 前処理第二 (配列には、キーを作成するフレームを積む)
     * キースタック配列を宣言
     * @type {Array}
     */
    var keyStackArray = [];//キースタックは可変長
    keyStackArray["remap"] = [];
    keyStackArray["blank"] = [];
    //ふたつ リマップキー/ブランクキー 用
    keyStackArray["remap"].push(0);
    keyStackArray["blank"].push(0);//最初のフレームには無条件でキーを作成

    /**
     * 有効データで埋まった配列を再評価(2?ラスト)
     */
    for (var f = 1; f < bufDataArray.length; f++) {
        /**
         * キーオプションにしたがって以下の評価でキー配列にスタック(フレームのみ)
         */
        switch (key_method) {
            case    "opt"    :	//	最適化キー(変化点の前後にキー)
                //	○前データと同じで、かつ後ろのデータと
                //	同一のエントリをスキップ
                if (bufDataArray[f] != bufDataArray[f - 1] || bufDataArray[f] != bufDataArray[f + 1]) {
                    keyStackArray["remap"].push(f)
                }
                break;
            case    "min"    :	//	最少キー(変化点にキー)
                //	○前データと同じエントリをスキップ
                if (bufDataArray[f] != bufDataArray[f - 1]) {
                    keyStackArray["remap"].push(f)
                }
                break;
            case    "max"    :	//	全フレームキー(スキップ無し)
            default:
                keyStackArray["remap"].push(f);
        }
        /**
         * ブランクメソッドにしたがってブランクキーをスタック(フレームのみ)
         * @type {string}
         */
        var prevalue = (bufDataArray[f - 1] == "blank") ? "blank" : "cell";
        var currentvalue = (bufDataArray[f] == "blank") ? "blank" : "cell";
        var postvalue = (bufDataArray[f + 1] == "blank") ? "blank" : "cell";
        switch (key_method) {
            case    "opt"    :	//	最適化キー(変化点の前後にキー)
                if (currentvalue != prevalue || currentvalue != postvalue) {
                    keyStackArray["blank"].push(f)
                }
                break;
            case    "min"    :	//	最少キー(変化点にキー)
                if (currentvalue != prevalue) {
                    keyStackArray["blank"].push(f)
                }
                break;
            case    "max"    :	//	全フレームキー(スキップ無し)
            default:
                keyStackArray["blank"].push(f);
        }
    }

    /**
     * キー文字列を作成
     * blankoffsetは、カラセル挿入によるタイミングの遷移量・冒頭挿入以外は基本的に0
     */
    switch (blank_pos) {
        case    "first"    :
            var blankoffset = 1;
            break;
        case    "end"    :
            var blankoffset = 0;
            break;
        case    "none"    :
            var blankoffset = 0;
            break;
        default    :
            var blankoffset = 0;
    }
    var footage_frame_duration = (1 / footageFramerate);
    /**
     * リマップキーを作成
     * @type {string}
     */
    var remapBody =
        'Time Remap\n\tFrame\tseconds\t\n';
    for (var n = 0; n < keyStackArray["remap"].length; n++) {
        if (bufDataArray[keyStackArray["remap"][n]] == "blank") {
            var seedValue = (blank_pos == "first") ? 1 : max_lot + 1;
        } else {
            var seedValue = bufDataArray[keyStackArray["remap"][n]] * 1 + blankoffset;
        }
        remapBody += "\t";
        remapBody += keyStackArray["remap"][n].toString(10);
        remapBody += "\t";
        if (blank_method == "expression2" &&
            bufDataArray[keyStackArray["remap"][n]] == "blank") {
            remapBody += 999999;//エクスプレッション2のカラ
        } else {
            remapBody += (seedValue - 0.5) * footage_frame_duration;//通常処理
        }
        remapBody += "\t\n";
    }

    /**
     * エクスプレッション型
     * @type {string}
     */
    var expBody = (AE_version < 6.0) ?
        'スライダ\tスライダ制御\tEffect\ Parameter\ #1\t\n\tFrame\t\t\n' :
        'Effects\tスライダ制御\tスライダ\n\tFrame\t\t\n';

    for (var n = 0; n < keyStackArray["remap"].length; n++) {
        expBody += "\t";
        expBody += keyStackArray["remap"][n].toString(10);
        expBody += "\t";
        if (bufDataArray[keyStackArray["remap"][n]] == "blank") {
            expBody += ("0");

        } else {
            expBody += (bufDataArray[keyStackArray["remap"][n]]);
        }
        expBody += "\t\n";
    }

    /**
     * ブランクキーを作成
     * エクスプレッション型/ブランクセル無し の場合は不要
     */
    switch (blank_method) {
        case "opacity":
            /**
             * 不透明度
             * @type {string}
             */
            var blankBody = 'Opacity\n\tFrame\tpercent\t\n';
            var blank_ = '0';
            var cell_ = '100';
            break;
        case "wipe":
            /**
             * ワイプ
             * @type {string}
             */
            var blankBody = 'Effects\tリニアワイプ\t変換終了\n\tFrame\tpercent\t\n';
            var blank_ = '100';
            var cell_ = '0';
            break;
        case "channelShift":
            /**
             * チャンネルシフトエフェクト
             * @type {string}
             */
            var blankBody = 'Effects\tチャンネルシフト #1\tアルファを取り込む #2\n';
            var blank_ = '10';//アルファを全てオフ
            var cell_ = '1';//現在のアルファを維持
            break;
    }

    for (var n = 0; n < keyStackArray["blank"].length; n++) {
        blankBody += "\t";
        blankBody += keyStackArray["blank"][n].toString(10);
        blankBody += "\t";
        if (bufDataArray[keyStackArray["blank"][n]] == "blank") {
            blankBody += blank_
        } else {
            blankBody += cell_
        }
        blankBody += "\t\n";
    }

    /**
     * AE6.5以降のエクスプレッションペースト可能な際のエクスプレッション
     * サポート範囲で全てキーペースト可能なので判定ナシ
     */
//if(AE_version>=6.5){}
    if (true) {
        /**
         * 前方キー参照
         * @type {string}
         */
        var keepPreviewKeyValue = 'Expression Data\n';
        keepPreviewKeyValue += 'if(numKeys){if(nearestKey(time).time<=time){ix=nearestKey(time).index;}else{';
        keepPreviewKeyValue += 'ix=(nearestKey(time).index==1)?1:nearestKey(time).index-1;};key(ix).value;}else{valueAtTime(time)};';
        keepPreviewKeyValue += '\n';
        keepPreviewKeyValue += 'End of Expression Data\n';
        /**
         * TimeRemap処理 No.1-T(スライダ参照)
         * @type {string}
         */
        var trExpression = 'Time Remap\n';
        trExpression += '\tFrame\tseconds\t\n';
        trExpression += '\t0\t0\t\n\n';
        trExpression += 'Expression Data\n';
        trExpression += (AE_version > 9.0) ?
            '(effect("スライダー制御")("スライダー")-1)*thisComp.frameDuration;\n' :
            '(effect("スライダ制御")("スライダ")-1)*thisComp.frameDuration;\n';
        trExpression += 'End of Expression Data\n';
        /**
         * blank処理 No.1-B(スライダ参照)
         * @type {string}
         */
        var blankExpression1 = 'Effects\tチャンネルシフト #2\tアルファを取り込む #2\n';
        blankExpression1 += '\tFrame\t\t\n';
        blankExpression1 += '\t\t0\t\n\n';
        blankExpression1 += 'Expression Data\n';
        blankExpression1 += (AE_version > 9.0) ?
            'if(effect("スライダー制御")("スライダー").value){1}else{10};\n' :
            'if(effect("スライダ制御")("スライダ").value){1}else{10};\n';
        blankExpression1 += 'End of Expression Data\n';

        /**
         * blank処理 No.2(タイムリマップ直接参照) expression2 は廃止なので不要
         */
        /*
         var blankExpression2='Effects\tチャンネルシフト #1\tアルファを取り込む #2\n';
         blankExpression2+='\tFrame\t\t\n';
         blankExpression2+='\t\t0\t\n\n';
         blankExpression2+='Expression Data\n';
         blankExpression2+='if(timeRemap.value>=999999){10}else{1};\n';
         blankExpression2+='End of Expression Data\n';
         */
    }

    /**
     * 出力 サポートバージョン以降全てキーフレームバージョンは"8.0"
     * @type {string}
     */
    var Result = 'Adobe After Effects 8.0 Keyframe Data\n';
    Result += '\n\tUnits Per Second\t';
    Result += compFramerate.toString();
    Result += '\n\tSource Width\t';
    Result += sizeX.toString();
    Result += '\n\tSource Height\t';
    Result += sizeY.toString();
    Result += '\n\tSource Pixel Aspect Ratio\t1';
    Result += '\n\tComp Pixel Aspect Ratio\t1';
    Result += '\n';
    if (blank_method != "expression1") {

        if (blank_method == "opacity") {
            /**
             * ブランク
             * @type {string}
             */
            Result += '\n';
            Result += blankBody;
            Result += keepPreviewKeyValue + "\n";
        }
        /**
         * リマップ
         * @type {string}
         */
        Result += '\n';
        Result += remapBody;
        Result += keepPreviewKeyValue + "\n";

        if (blank_method == "wipe") {
            /**
             * ブランク
             * @type {string}
             */
            Result += '\n';
            Result += blankBody;
            Result += keepPreviewKeyValue + "\n";
        }
        if (blank_method == "channelShift") {
            /**
             * ブランク
             * @type {string}
             */
            Result += '\n';
            Result += blankBody;
        }
    } else {
        /**
         * エクスプレッション1　動画番号トラックを作る方式
         * @type {string}
         */
        Result += '\n';
        /**
         * タイムリマップのエクスプレッションを貼り付け
         * @type {string}
         */
        Result += trExpression + "\n";
        /**
         * スライダボディ
         * @type {string}
         */
        Result += expBody + "\n";
        /**
         * キープエクスプレッション貼り付け
         * @type {string}
         */
        Result += keepPreviewKeyValue + "\n";
        /**
         * AE 6.5以上ならカラセルエクスプレッション貼り付け
         * @type {string}
         */
        Result += blankExpression1 + "\n";
    }

    Result += '\n';
    Result += 'End of Keyframe Data';

    if (xUI.errorCode) {
        xUI.errorCode = 0
    }
    return Result;
};

/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    exports.AEK2XDS = AEK2XDS;
    exports.XPS2AEK = XPS2AEK;
}
/*  eg. for import
    const { AEK2XDS , XPS2AEK } = require('./lib_AEK.js');

*/