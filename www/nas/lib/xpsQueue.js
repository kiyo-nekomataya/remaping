/**
 * @fileoverview xpsからPsキューフレーム列を生成する関数
 *
 * @desc QFrame は、フレームインデックス 表示状態 継続時間をもち
 * アニメーションフレームと1:1の関係を持つオブジェクトである
 * 表示状態は配列 要素は整数または整数の配列で下側からの順(オリジン=1)でトレーラ内のレイヤ及びレイヤセットの表示状態を表す
 *
 *  -1       負数 ArtLayer|LayerSetに関わらず操作を行わない
 *   0       ArtLayer|LayerSetに関わらず非表示
 *   1~      ArtLayerならば表示・LayerSetなら下から順の表示するレイヤ(オリジン=1)
 *           数値がセット内のレイヤ数を超える場合は操作をスキップしてレイヤセット全体を表示
 *
 *  配列      レイヤーセット内の表示配列 数値がセットのレイヤ数を超える場合は無視
 *
 *  キューの表示状態データを
 */

/**
 * @constructor キューフレームオブジェクトコンストラクタ
 *
 * @params {Number}    myIndex
 * @params {Array}     myBody
 * @params {Number}    myDuration
 */
QFrame = function (myIndex, myBody, myDuration) {
    if(! myBody){
        myBody = [];
    }else if(String(myBody).match(/^\[.+\]$/)){
        myBody = JSON.parse(myBody);
    };
    if (!(myBody instanceof Array)){
        myBody = String(myBody).split(",");
    };
    if (!myDuration) myDuration = 1;//最小１フレーム
// 入力をフィルタしておく
    this.index        = myIndex   ;//開始フレームindex整数
    this.orderingBody = myBody    ;//レイヤ並び配列
    this.duration     = myDuration;//継続時間（フレーム数）
}
/**
 *  @params {Object QFrame} myTarget
 * ターゲットオブジェクトとbody配列を比較するメンバ関数
 */
QFrame.prototype.isSame = function (myTarget) {
	if(
		(myTarget instanceof QFrame)&&
		(myTarget.orderingBody.length == this.orderingBody.length)
	){
		for(var ix = 0 ; ix < this.orderingBody.length ; ix++){
			if(
				(
					(this.orderingBody[ix] instanceof Array)&&
					(this.orderingBody[ix].join('') !=  myTarget.orderingBody[ix].join(''))
				)||(
					(!(this.orderingBody[ix] instanceof Array))&&
					(this.orderingBody[ix] != myTarget.orderingBody[ix])
				)
			) return false;
		};
		return true;//ループを最後まで抜けるとtrue
	}else{
		return null;//比較要件を満たしていないのでnullを返す
	};
};
/**
 * @desc 以下、QFrameオブジェクトで表示を制御するPs-Docuement|LayerSetの拡張メソッド
 * 
 * QFrame オブジェクトまたは表示引数を配列|QFratme|リスト文字列いずれかの引数で与える
 * QFrame の状態変数は、表示のための一次配列なのですべて整数の引数
 * レイヤラベルとタイムシートデータの対照比較とQFrameの作成はビルダが行いこの関数内では関与しない
 * "0,2,-1,3,3,0"
 *
 * @params {Array | Object QFrame | String} params
 * 
 */
function _setView(params) {
// パラメータがQFrameであればorderingBodyを取得
    if (params instanceof QFrame) {
        params = params.orderingBody;
    }else if(String(params).match(/^\[.+\]$/)){
        params = JSON.parse(params);
    };
// 操作配列を作成
    if (!(params instanceof Array)) {
        params = params.split(",");
    };
// トレーラのエレメント数取得
    var mx = this.layers.length;
/*
alert("build viewBuf");
// ビューバッファ配列を新規に目的トレーラに作成(なんかもうつかってない)
    this.viewBuf = new Array(mx);
// 目的トレーラのレイヤ配列(レイヤセット含む)の表示状態を取得
    for (var ix = 0; ix < mx; ix++) {
        if (this.layers[ix].typename == "LayerSet") {
            var mxc = this.layers[ix].layers.length;
            this.viewBuf[ix] = new Array(mxc);
            for (var sx = 0; sx < mxc; sx++) {
                this.viewBuf[ix][sx] = (this.layers[ix].layers[sx].visible)? true : false;
            }
        } else {
            this.viewBuf[ix] = null;
        }
    };// */

    for (var ix = 0; ix < mx; ix++) {
// ixに相当するターゲットレイヤを選択(昇降反転)
        var elX = this.layers[mx - ix - 1];


// 参照データは this.viewBuf[mx-ix-1]
        var qX = (ix < mx) ? params[ix] : -1;

        qX = (qX == "blank") ? 0 : ((qX == "") ? -1 : parseInt(qX));

        if(qX < 0){
// qXが負数の場合処理をスキップ
            continue;
        }else if (qX == 0) {
// カラ処理
            if (elX.visible) {
                elX.visible = false;
            };

/*            if (this.viewBuf[mx - ix - 1][qix]) {
                elX.layers[qix].visible = false;
                this.viewBuf[mx - ix - 1][qix] = false;
            };// */
        }else if(
            (qX instanceof Array)&&(elX instanceof LayerSet)&&(qX.length == elX.layers.length)
        ){
//配列とレイヤセットの組み合わせ
            for(var lx = 0 ; lx < elx.layers.length ;lx ++){
                var vprm = qX[qX.length - lx -1];
                if (vprm < 0) continue;
                elx.layers[lx].visivle = (vprm == 0)? false:true;
            }
        }else if(!(qX instanceof Array)){
//正の整数または配列
            if (!(elX.visible)) elX.visible = true;
//elxがレイヤセットでかつ引数がレイヤセットの内包要素の値をオーバーしている場合はレイヤー扱いで処理継続
            if(
                (elx.typename != 'LayerSet')||
                ((elX.typename == 'LayerSet') && (qX > elX.layers.length))
            ) continue;
            for (var qix = 0; qix < elX.layers.length; qix++) {
                var lidx = elX.layers.length - qix - 1;
                elX.layers[lidx].visible = ((qix + 1) == qX)? true : false ;
/*
                if ((qix + 1) == qX) {
                    if (!this.viewBuf[mx - ix - 1][lidx]) {
                        elX.layers[lidx].visible = true;
                        this.viewBuf[mx - ix - 1][lidx] = true;
                    }
//表示指定があれば表示//if(!(elX.layers[lidx].visible)){elX.layers[lidx].visible=true}
                } else {
                    if (this.viewBuf[mx - ix - 1][lidx]) {
                        elX.layers[lidx].visible = false;
                        this.viewBuf[mx - ix - 1][lidx] = false;
                    }
                };// */
            };
        };
    };
}

/**
 * document|LayerSetに対して拡張する関数
 * ドキュメントに対してタイムシートオブジェクトと
 * タイムラインパラメータを与えてキュー列を生成する
 *
 * @params  {Object Xps} myXps
 * @params  {} tlOrder
 * @params  {Boolean}    FFO
 * @returns {Array}
 * @private
 */
function _buildPsQueue(myXps, tlOrder, FFO) {
// Full Frames Option
    if (!FFO) {
        FFO = false;
    }
// 指定なければカレントシート
    if (!myXps) {
        myXps = XPS;
    }
//タイムライン指定がなければすべて操作スキップ
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
     * [-2,-1,1,2,3,4,1,3]
     * 数値の意味は,[処理スキップ,カラ（非表示）,A,B,C,D,A,C]
     * -2     対応タイムラインなし（スキップ）
     * -1     対応タイムラインなし（カラ処理）(特例処理)
     * 0~     下から順にxpsTracksに対応 重複可 （通常のカラ処理はここでシート転記で行う）
     * (XpsTimelinTrack.index) 
     * 特に指定がなければ対象ドキュメントのレイヤに対するタイムラインはなし（全て-1）
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
     * @todo うーむ　「やっつけ」っぽい2011 03 06
     */
    return myQueue;
}

/*TEST

 //app.activeDocument.setView=_setView;
 //app.activeDocument.buildPsQueue=_buildPsQueue;
 //myTest1=app.activeDocument.buildPsQueue;
 function myTest2(){
 var myQF=new QFrame(0,[1,2,3],1);
 app.activeDocument.setView(myQF);
 }
 myTest2() 
 */
