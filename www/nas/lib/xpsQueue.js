/**
 * @fileoverview xpsからPsキューフレーム列を生成する関数
 *
 * @desc QFrame は、フレームインデックス 表示状態 継続時間をもち
 * アニメーションフレームと1:1の関係を持つオブジェクトである
 * 表示状態はリストで、下側から順にルートトレーラー内のレイヤまたはレイヤセットの表示状態を整数値で持つ
 * 0    非表示
 * 正の数値    レイヤなら表示・レイヤセットならば下から順の表示すべきレイヤ(1オリジン)
 * 数値がレイヤセット内のレイヤ数を超える場合は操作のスキップ
 * 負数は、操作のスキップを表す
 */

/**
 * @constructor キューフレームオブジェクトコンストラクタ
 *
 * @param myIndex
 * @param myBody
 * @param myDuration
 */
QFrame = function (myIndex, myBody, myDuration) {
    /**
     * body を配列でなくリストにするとどうか
     */
    // if(!(myBody instanceof Array)){myBody=[];}
    if (myBody instanceof Array) {
        myBody = myBody.join(",")
    }
    if (!myDuration) {
        myDuration = 1;
    }

    /**
     * 入力をフィルタしておく
     */
    this.index = myIndex;//開始フレームindex
    this.orderingBody = myBody;//並び配列(リストで)
    this.duration = myDuration;//継続時間（フレーム数）
    this.isSame = function (myTarget) {
        if (myTarget.orderingBody == this.orderingBody) {
            return true
        } else {
            return false
        }
        /**
         * ターゲットオブジェクトとbody配列を比較するメンバ関数
         */
        if (
            (myTarget instanceof QFrame) &&
            (myTarget.orderingBody.length == this.orderingBody.length)
        ) {
            if (myTarget.orderingBody.toString() == this.orderingBody.toString()) {
                return true
            } else {
                return false
            }
        } else {
            /**
             * 比較要件を満たしていないのでnullを返す
             */
            return null;
        }
    }
};

/**
 * @desc 以下、QFrameオブジェクトで表示を制御する拡張メソッド
 * 
 * ドキュメントのメソッドとして実装
 * QFrame オブジェクトまたは表示配列を引数で与える
 * このルーチンだとレイヤ名に関わらずレイヤの重ね順で解決しているので、あまり好ましくない
 * レイヤラベルの参照とそれぞれの指定が可能なつくりにすること。
 * "0,2,-1,3,3,0"
 * シートからQフレームを作成するときに指定を反映させる方が適当そうである
 *
 * @param params
 * @private
 */
function _setView(params) {

    /**
     * パラメータがQframeだったらorderingBody
     */
    if (params instanceof QFrame) {
        params = params.orderingBody;
    }

    /**
     * 操作配列を作成
     */
    if (!(params instanceof Array)) {
        params = params.split(",");
    }

    /**
     * ルートトレーラーのエレメント数取得
     * @type {Number}
     */
    var mx = this.layers.length;
    if (!this.viewBuf) {
        //alert("build viewBuf")

        /**
         * ビューバッファを新規にドキュメントに作成
         * @type {Array}
         */
        this.viewBuf = new Array(mx);
        for (var ix = 0; ix < mx; ix++) {
            if (this.layers[ix].typename == "LayerSet") {
                var mxc = this.layers[ix].layers.length;
                this.viewBuf[ix] = new Array(mxc);
                for (var sx = 0; sx < mxc; sx++) {
                    this.viewBuf[ix][sx] = (this.layers[ix].layers[sx].visible) ? true : false;
                }
            } else {
                this.viewBuf[ix] = null;
            }
        }
    }
    /**
     * シート適用前にはsetView()をコールする直前に
     * viewBufの初期化を行うことそうでないと以前の結果が残って動作が不定になるので注意
     * 適用ループは表示参照をバッファに対して行うこと　設定不要時はすべての動作をスキップ
     */
    for (var ix = 0; ix < mx; ix++) {
        /**
         * ixに相当するレイヤを選択(昇降反転)
         * @type {*|Layer}
         */
        var elX = this.layers[mx - ix - 1];
        /**
         * 参照バッファは this.viewBuf[mx-ix-1]
         * @type {number}
         */
        var qX = (ix < mx) ? params[ix] : -1;
        qX = (qX == "blank") ? 0 : (qX == "") ? -1 : parseInt(qX);
        /**
         * qXが負数の場合処理をスキップすること
         */
        if (qX == 0) {
            /**
             * セット全体でカラ処理
             */
            if (elX.visible) {
                elX.visible = false;
            }
            // if(elX.layers){for(var qix=0;qix<elX.layers.length;qix++){if(elX.layers[qix].visible){elX.layers[qix].visible=false}}}
            if (this.viewBuf[mx - ix - 1][qix]) {
                elX.layers[qix].visible = false;
                this.viewBuf[mx - ix - 1][qix] = false;
            }
        } else {
            /**
             * 負数パラメータをスキップ処理に配置
             */
            if (qX < 0) {
                continue;
            }
            if (!(elX.visible)) {
                elX.visible = true;
            }

            //&&(elX.layers.length <= qX)
            if ((elX.layers) && (elX.layers.length > 0)) {
                var qmx = elX.layers.length;
                for (var qix = 0; qix < qmx; qix++) {
                    var lidx = qmx - qix - 1;
                    if ((qix + 1) == qX) {
                        if (!this.viewBuf[mx - ix - 1][lidx]) {
                            elX.layers[lidx].visible = true;
                            this.viewBuf[mx - ix - 1][lidx] = true;
                        }
                        //表示指定があれば表示
                        //if(!(elX.layers[lidx].visible)){elX.layers[lidx].visible=true}
                    } else {
                        if (this.viewBuf[mx - ix - 1][lidx]) {
                            elX.layers[lidx].visible = false;
                            this.viewBuf[mx - ix - 1][lidx] = false;
                        }
                        //表示指定があれば表示
                        //if(elX.layers[lidx].visible){elX.layers[lidx].visible=false}
                    }
                }
            }
        }
    }
}

/**
 * アクティブドキュメントに対して拡張するための関数オブジェクト
 * ドキュメントに対してタイムシートオブジェクトと
 * タイムラインパラメータを与えてキュー列を生成する関数オブジェクト
 *
 * @param myXps
 * @param tlOrder
 * @param FFO
 * @returns {Array}
 * @private
 */
function _buildPsQueue(myXps, tlOrder, FFO) {

    /**
     * Full Frames Option
     */
    if (!FFO) {
        FFO = false;
    }
    /**
     * 指定なければカレントシート
     */
    if (!myXps) {
        myXps = XPS;
    }
    if (!tlOrder) {
        tlOrder = new Array(this.layers.length);
        for (var tix = 0; tix < this.layers.length; tix++) {
            tlOrder[tix] = -1
        }
    }
    /**
     *
     * @desc tlOrderはTimeLineOrderパラメータ配列
     * 
     * [-1,0,1,2,3,4,1,2]
     * 数値の意味は,[処理スキップ,カラ,A,B,C,D,A,B]
     * 負数　対応タイムラインなし（スキップ）
     * 0 対応タイムラインなし（カラ処理）(特例処理)
     * 正数 下から順にタイムラインに対応　重複可　（通常のカラ処理はここでシート転記で行う）
     *
     * 特に指定がなければ対象ドキュメントのレイヤに対するタイムラインはなし（全て０）
     */

    /**
     * 配列コレクション
     * @type {Array}
     */
    var qFrames = [];
    /**
     * XPSからパース済みデータ列をレイヤの数だけ取得
     * XPSをパースする前処理として第一フレームに記述のないタイムラインを抽出してスキップする仕様に
     */
    var tempArray = [];
//	alert(tlOrder);
//	alert(myXps.toString());
    for (var lix = 0; lix < myXps.xpsTracks.length-2; lix++) {
        /**
         * 空配列で代用あとですっ飛ばす予定なのでnullなどでも良いか?
         */
        if (myXps.xpsTracks[lix+1][0] == "") {
            tempArray[lix] = new Array(myXps.length);
            /**
             * パースする(コレが重い…)
             */
        } else {
            tempArray[lix] = myXps.timeline(lix + 1).parseTm();
        }
    }

    /**
     * XPSのフレームを順次検査してユニークなキューフレーム配列を形成する
     * @type {Array}
     */
    var myQueue = [];
    myQueue.toString = function () {
        var myResult = "";
        for (var ix = 0; ix < this.length; ix++) {
            myResult += "[" + ix + "]" + this[ix].index + "\t:" + this[ix].orderingBody.join(",") + ":(" + this[ix].duration + ")\n";
        }
        return myResult;
    };
    var currentQF = null;
    /**
     * bodyがnullなので必ず判定に失敗する比較オブジェクト
     * @type {QFrame}
     */
    var previewQF = new QFrame(-1, null, 1);

    /**
     * タイムシートをフレームでループ
     */
    for (var fidx = 0; fidx < myXps.duration(); fidx++) {
        /**
         * 当該フレームの並び配列を生成
         * @type {Array}
         */
        var myOrderingArray = [];

//	for(var lix=0;lix<myXps.layers.length;lix++){myOrderingArray.push(tempArray[lix][fidx])};//最初の実験コードなのでドキュメントとシートのレイヤ数が１：１になっている　これはドキュメント側にあわせること

        for (var lix = 0; lix < this.layers.length; lix++) {
            var timelineOrder = tlOrder[lix];
            if (timelineOrder <= 0) {
                myOrderingArray.push(timelineOrder);
            } else {
                myOrderingArray.push(tempArray[timelineOrder - 1][fidx]);
            }
        }
        currentQF = new QFrame(fidx, myOrderingArray.join(","), 1);
        // full frames
//	alert(previewQF.isSame(currentQF))
        if ((previewQF.isSame(currentQF)) && (!FFO)) {
            //同内容のエントリなので継続時間だけを加算して次へ
            myQueue[myQueue.length - 1].duration++;
        } else {
            //新しいエントリなので時間を積算してキューに加える
//		alert(currentQF.orderingBody);
            myQueue.push(currentQF);
            previewQF = currentQF;//比較用に保存
        }
    }
    /**
     * @todo うーむ　「やっつけ」っぽい　2011 03 06
     */
    return myQueue;
}

/**
 * @test 以下試験コード
 *
 * //app.activeDocument.setView=_setView;
 * //app.activeDocument.buildPsQueue=_buildPsQueue;
 * //myTest1=app.activeDocument.buildPsQueue;
 * function myTest2(){
 * var myQF=new QFrame(0,[1,2,3],1);
 * app.activeDocument.setView(myQF);
 * }
 */
