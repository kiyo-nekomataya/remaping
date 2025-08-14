/**
 * @overview MAPping配列の初期化() りまぴん用仮オブジェクト
 *
 * var MAP= new_MAP(SheetLayers);
 * var MAP= new Array(SheetLayers+2);//0番・レイヤ最大番号+1 はシステム予約
 */


/**
 * xMapオブジェクトは、ProductionTitel/ProductionUnit　の配下に入り基礎データの継承を行う
 *
 * 実装上の継承はプロトタイプチェーンではなく、プロパティの複製で処理する
 *
 * これは、xMapの配下に入りプロダクション中及びプロダクション後のリソース流用に対してデータの独立性を保つための処置である
 *
 * 製作期間中は、タイトル・管理単位の間では同じプロパティを共有
 *
 * xMapを初期化する手順（2015 12 19）
 *
 * コンストラクタでxMapオブジェクトを初期化
 * new xMap([リプレースメントセルグループ数])
 * 戻り値は空のマップオブジェクト
 *
 * 引数は、セルのグループ数。省略可能。省略時は、グループ数1で初期化?
 * (0でも良さそう)
 *
 * 実際のデータの初期化は、マップオブジェクト自身の初期化メソッドを
 * コールして行う。
 * 初期化は、実装により異なるかもしれない。それで良いのだ。
 *
 * マップは基本的には、マップエントリグループとその配下のマップエントリを格納するトレーラです。
 *
 * エントリグループ毎に実際のセル・撮影指定等がエントリされます。
 *
 * エントリグループは、セルグループに加えて4種類(計5種)のグループがあります。
 *
 * グループ[ID.timig]/[ID.replacement]は、
 * セル置きかえを記述するグループ　実際の画像エントリ（カラエントリ。未成画像エントリはOK）を記述
 *
 * グループ[ID.camerawork]/[ID.camera]は、
 * 撮影情報に対して名前をつけて管理する(実体のファイルが存在しない)エントリが
 * 属するグループ。
 *
 * グループ[ID.dialog]/[ID.sound]は、音響効果指定
 *
 * グループ[ID.effect]/[ID.compsit]は、合成効果指定
 *
 * グループ[ID.system]は、
 * システムによって生成された(ユーザが管理しない)画像・要素が属するグループ
 * (カラセル等・今回の実装では配列の添字は0)
 *
 *
 * それぞれのエントリグループは任意の数を設定できるが、デフォルトで以下のグループが作成されます。
 * camerawork    /0
 * cell    /1(初期化時点で設定可能)
 * dialog    /1
 * effect    /0
 * system    /1
 *
 * したがってマップ配列の要素数は、作成時点でセルグループ数+2 となる。
 *
 * AEの場合のMAPに望まれる機能
 * 名前で指定されたXPSのエントリーを適切なタイムリマップ値に変換すること
 * XPS側からは タイムラインラベルおよびエントリ文字列を与える
 * MAPサイドでは、
 * ラベルからエントリグループ(コンポジション)を特定
 * エントリ文字列からグループ内のエントリ(タイムリマップ値)を特定して戻す
 *
 * コンポ内でブランク対応している場合(ファイルモード)は、ブランクに相当するタイムリマップ値を返す
 * それ以外の場合は、特定のキーワード"blank"を返す。
 * エントリに該当しない場合は、nullを返す。
 * this.trailer=targetFolder;//ターゲットフォルダアイテムを指定して初期化
 *
 * (元設計)
 * xMap.getElementByName("ラベル","エントリ")    戻り値：Number(整数)or "blank" or null
 *
 * (拡張新設計)
 * 以前の置きかえタイミングのみのサポートでなく全種のトラックに対応するために拡張を行う。
 * xMapに対してのエントリ要求は、同名のメソッドで行われる。
 * xMap.getElementByName(name,group[,[job]][,stage])    戻り値：Object or Null
 *
 * 要求されたエントリが、リプレースメントの場合は当該のオブジェクトまたはNull
 * 要求されたエントリが、カメラワークの場合は当該のオブジェクトまたはNull
 * 要求されたエントリが、コンポジットの場合は当該のオブジェクトまたはNull
 * 要求されたエントリが、サウンドの場合は当該のオブジェクトまたはNull
 *
 * 前設計では置きかえタイミングで存在しないエントリが要求された場合はブランクが戻るが、今設計ではNullとなる
 * ブランクの置き換えはxMapへの問い合わせでなくタイムシートを制御する側で行われるように
 *
 * トラックの基底データとして持つオブジェクトをシステムオブジェクトでxMap内に持つことは従来のまま
 *
 * *****ステージ拡張
 * 制作進捗状況の把握管理のためにステージとステージ内のジョブを拡張実装する
 * 各エレメントグループのエントリは必ずいずれかのステージに属するものとする
 *
 * グループの上位構造ではなく、エレメントごとのプロパティとして実装？
 * 　＞記述上はグループの上位構造に見えるが、グループ記述を一か所にまとめる必要はなく、複数の重複したエントリが認められる。
 * 記述順で後から指定されたものが優先であるが、ステージ・ジョブレベルが異なる場合は別のエントリとなる。
 * 各エントリの識別子は同一ステージ内で一意性を要求されるが、　ステージが異なる場合はその限りでない。
 * 同一ステージ内の同名の複数のエントリは、タイムシート上の同名のエントリを示す。
 *
 * また、ステージ内でジョブレベルが異なれば、フルネームで指定されないかぎりジョブの並びにしたがって最後にエントリされたモノが有効となる。
 *
 * 要素のフルネームは StageID.JobID.GroupID.Name となるが、特にフルネームで指定されないかぎりは Name のみで指定される。
 * その際に戻されるエレメントは (最後尾ステージ).(最終ジョブ).(アクティブタイムライントラックのグループ).Name である。
 * ステージの指定のみが行われると、当該ステージの最終ジョブの値が戻る。
 * ジョブのみの指定が行われれば、カレントのステージで当該ジョブに対応する値を返す。
 *
 * そういう仕様で設計するが、要求側で同設計のもとフルネームをビルドして要素を指定するものとしたほうが良い
 * 要求された要素が存在しない場合は、
 * xMap側で「要求された要素」＞「要求された要素に近い代替要素」＞「前ステージにさかのぼって推定される同名の要素」＞Null　
 * と戻り値をフォールダウンさせることができるように作りたい
 */

/**
 * @param myParent
 * @param cellCount
 * @constructor
 */
function xMap(myParent, cellCount) {
    if (!cellCount) cellCount = 1;//引数無ければ 1
    cellCount = parseInt(cellCount);//数値にしておく
    /**
     * 基本要素設定
     * システム配列要素を2つ追加する。ダイアログとシステム
     * @type {Array}
     */
    this.mapBody = new Array(cellCount + 2);

    /**
     * @desc プロパティを標準値で設定
     */

    /**
     *
     * 標準値は、現在の実装ではconfig.jsから読み込んでいるが
     * これはProductionParams等の親オブジェクトから継承する形にできるようにしておく
     * 具体的には、参照用のプロパティを置いてそこから取得する？
     * xMapの親プロパティSubTitel.Title.Production
     *
     * @type {Window}
     */
    this.productinUnit = parent;	//ProductionUnit
    this.cut = myCut;//
    this.scene = myScene;//
    this.subtitle = mySubTitle;//object SubTitle
    this.opus = myOpus;//
    this.title = myTitle;//
    var Now = new Date();
    this.create_time = Now.toNASString();//
    this.create_user = myName;//
    this.update_time = "";//
    this.update_user = myName;//
    this.standerd_frame = [22.5, 4 / 3.144 / 2.54];//width(cm),aspect(w/h),Resolution(dpc)//Frameに置き換え予定
    this.standerd_peg = ["3P", 0, 19.875, 0];//type,x,y,0];//pegType,posX,posY,rotation//Pegに置き換え予定
    this.resolution = nas.RESOLUTION;//(dpc)

    /**
     * @desc グループ情報の設定
     * グループの持つジオメトリ情報は、各エントリのジオメトリと独立している。
     * これは、グループ内のセルの持つ情報の省略値ではなく、グループ全体の持つ
     * トリミング情報となる。要するにタップとフレームだ。
     *
     * @type {Array}
     */
    this.groups = new Array(cellCount + 2);
    /**初期値
     * @type {string}
     */
    var name = "";
    var geometry = "640,480,72/2.54,1,0,300,0";
    //デフォルト値としては妥当な気がする?
    //"X,Y,dpc,par,offsetX,offsetY,rotation"
    var comment = "";//未設定

    this.groups[0] = ["system", geometry, comment];//0番要素はシステム固定
    /**
     * ループしてデフォルト値を設定
     */
    for (id = 1; id < (cellCount + 1); id++) {
        name = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(id - 1);
        //geometry	="640,480,72,1,0,300,0";
        //comment	="";
        this.groups[id] = [name, geometry, comment];
    }

    this.groups[cellCount + 1] = ["camera", geometry, comment];//最終要素はシステム予約(1番でも良いかもその方が計算が減る?)
    /**
     * エントリ情報の設定
     */
    for (id = 0; id < SheetLayers + 2; id++) {
        this.mapBody[id] = "=AUTO=";
    }
}
/**
 * 各メソッド
 * @returns {string}
 */
xMap.prototype.init = function () {
    return "ここで初期化するぞー!(してないけど)";
};

/**
 * @param id
 * @param prop
 * @returns {*}
 */
xMap.prototype.getgeometry = function (id, prop) {
    if (!id) id = 0;
    if (!prop) prop = "all";
    switch (prop) {
        case "sizeX":
            return (( this["groups"][id][1].split(",")[0] / 72 ) *
            this["groups"][id][1].split(",")[2] );
            break;
        case "sizeY":
            return (( this["groups"][id][1].split(",")[1] / 72 ) *
            (this["groups"][id][1].split(",")[2] / this["groups"][id][1].split(",")[3]));
            break;
        case "resX":
            return this["groups"][id][1].split(",")[2];
            break;
        case "aspect":
            return this["groups"][id][1].split(",")[3];
            break;
        case "resY"    :
            return (this["groups"][id][1].split(",")[2] / this[id][1].split(",")[3]);
            break;
        case "offsetX"    :
            return this["groups"][id][1].split(",")[4];
            break;
        case "offsetY"    :
            return this["groups"][id][1].split(",")[5];
            break;
        case "rotation"    :
            return this["groups"][id][1].split(",")[6];
            break;
        default    :
            return this["groups"][id][1].split(",");
    }
};

/**
 * @param id
 * @returns {*}
 */
xMap.prototype.getmaxlot = function (id) {
    if (this.mapBody[id] == "=AUTO=") {
        return "=AUTO="
    } else {
        return this.mapBody[id].length;
    }
};

/**
 * @desc xMapコンストラクタ終了
 */

/**
 * @returns {string}
 */
function initMAP() {
    /**
     * マップオブジェクトの初期化は、ファイルを指定するか、または 導入済のFolderItemを指定して行う
     * ファイルが指定された場合は、AEの環境下では、マップのファイルをインポートしてフォルダアイテムに展開し
     * さらにそのフォルダアイテム自身を登録して行うこと。
     *
     * Photoshop環境下では、アクティブドキュメントをMAP展開して利用する
     * または、指定ファイルをドキュメントとして読み込み展開する
     * アイテムのサイズは、ドキュメント内で不定
     *
     * XPSエディタ(りまぴん)側では、読み込んでデータテーブルを配置するだけでおしまい。
     *  すなわち、動作仕様が変わるので注意
     *
     * MAPファイルを指定されればインポートおよび環境形成（未実装）
     * それ以外は導入済みデータを使用してエージェントの初期化を行う
     * AE以外の環境はあとまわし
     */


    /**
     * MAP各プロパティ
     */
    /*
     var cellCount=app.project.items.getByName(nas.otome.mapFolders.mapBase).items.getByName(nas.otome.mapFolders.cell).length;//グループアイテムフォルダのエントリ数をみる
     ////////////////////// 基本要素設定
     this.mapBody = new Array(cellCount+2);//システム配列要素を2つ追加する。ダイアログとシステム

     //	プロパティを空で設定
     this.opus	=	myOpus;//
     this.title	=	myTitle;//
     this.subtitle	=	mySubTitle;//
     this.scene	=	myScene;//
     this.cut	=	myCut;//
     var Now =new Date();
     this.create_time	=	Now.toNASString();//
     this.create_user	=	myName;//
     this.update_time	=	"";//
     this.update_user	=	myName;//
     */

    return "代用マップデータの初期化をしました";
}

/**
 * xMap用各種メソッド
 * @returns {string}
 */
xMap.prototype.toString = function () {
    /**
     * xMapデータを保存形式で
     * @type {Date}
     */
    var Now = new Date();
    /**
     * セパレータ文字列調整
     * @type {string}
     */
    var bold_sep = '\n#';
    for (n = this.layers.length + 2; n > 0; n--) bold_sep += '========';
    var thin_sep = '\n#';
    for (n = this.layers.length + 2; n > 0; n--) thin_sep += '--------';
    /**
     * ヘッダで初期化
     * @type {string}
     */
    var result = 'nasMAP-FILE 2.0';//出力変数初期化
    /**
     * ##共通プロパティ変数設定
     * @type {string}
     */
    result += '\n##CREATE_USER=' + this.create_user;
    result += '\n##UPDATE_USER=' + this.update_user;
    result += '\n##CREATE_TIME=' + this.create_time;
    result += '\n##UPDATE_TIME=' + Now.toNASString();

    result += '\n##TITLE=' + this.title;
    result += '\n##SUB_TITLE=' + this.subtitle;
    result += '\n##OPUS=' + this.opus;
    result += '\n##SCENE=' + this.scene;
    result += '\n##CUT=' + this.cut;

//result+='\n##TIME='	+ nas.Frm2FCT(this.time(),3,0)	;
//result+='\n##TRIN='	+nas.Frm2FCT(this.trin[0],3,0)+","+ this.trin[1];
//result+='\n##TROUT='	+nas.Frm2FCT(this.trout[0],3,0)+","+ this.trout[1];
//result+='\n##FRAME_RATE='	+ this.framerate	;
//result+='\n##FOCUS='	+11//
//result+='\n##SPIN='	+S3//
//result+='\n##BLANK_SWITCH='	+File//
    result += '\n#';
    result += bold_sep;//セパレータ####################################
    /**
     * レイヤ別プロパティをストリームに追加
     * @type {string[]}
     */
    var Lprops = ["sizeX", "sizeY", "aspect", "lot", "blmtd", "blpos", "option", "link", "name"];
//	var Lprops=["sizeX","sizeY","aspect","lot","blmtd","blpos","option","link","CELL"];
    for (var prop = 0; prop < Lprops.length; prop++) {
        var propName = Lprops[prop];
        var lineHeader = (propName == "name") ?
            '\n[CELL\tN' : '\n[' + propName + '\t';
        result += lineHeader;
        for (id = 0; id < this.layers.length; id++) {
            result += "\t" + this["layers"][id][propName];
        }
        result += '\t]';//
    }
    /**
     * セパレータ
     * @type {string}
     */
    result += bold_sep;//セパレータ####################################
    /**
     * シートボディ
     */
    for (line = 0; line < this.duration(); line++) {
        result += '\n.';//改行＋ラインヘッダ
        for (column = 0; column < (this.layers.length + 2); column++) {
            address = column + '_' + line;
//			if(! Separator){}else{};

            result += '\t' + this.xpsBody[column][line];
//				result+=Separator+this.xpsBody[column][line];

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
     */
    result += this.memo;

// // // // //返す(とりあえず)

    /**
     * 引数を認識していくつかの形式で返すように拡張予定
     * セパレータを空白に変換したものは必要
     * 変更前(開始時点)のバックアップを返すモード必要/ゼロスクラッチの場合は、カラシートを返す。
     */
    if (xUI.errorCode) {
        xUI.errorCode = 0
    }
    return result;
    return result;
};

// var MAP= new_MAP(SheetLayers);
//if (dbg) {alert(initMAP())};	//マップダミー初期化

/**
 * まだ腐っているけどmap関連一応分離 2005.03.22
 */

/**
=============== 以下は、古いスタイルのデータパーサのための後方互換関数　新規の使用は禁止
                　古いスタイルのパーサが無くなったら削除予定 2016 - 12.24

 * NAS(U) りまぴん専用データチェック関数
 * マップ処理ができるようになったら汎用関数に
 * マップオブジェクトのメソッドに切り換え予定
 * 2005/12/19 mapサイドに移動
 *
 * 2015/10/05 判定対象を拡張
 * timing        :null/"blank"/"interp"/Number Init
 * effect        :null/"fixed"/"interp"/Label String
 * camerawork    :null/"fixed"/"interp"/Label String
 * dialog        :null/"blank"/"sound"/"nodeOpen"/"nodeClose"/Label String
 * still        :null/"blank"/("interp")/Number Init
 *
 * 各トークンの意味
 * timing
 * null    不定記述基本的に先行値の複製＝変化なしのサイン
 * blank    カラ
 * interp    補間サイン　前後の値を持つキーから計算されるためこれ自身は直接値を持たない
 *
 * effect
 * fixed
 * null    不定記述 基本的に先行値の複製＝変化なしのサイン
 * blank    カラ
 * interp    補間サイン　前後の値を持つキーから計算されるためこれ自身は直接値を持たない
 * dataCheck = function (str,label,bflag)
 *
 * @param str
 * @param label
 * @param bflag
 * @returns {*}
 */
function dataCheck(str, label, bflag) {

    /**
     * 準備的にPSのみで動作するデータチェック部分を追加
     */

//	if(str.length){alert([str,label,bflag].join()+":"+[label,str].join("-")+":"+_getIdx([label,str].join("-")))};

    /**
     * 与えられたトークンを有効データか否か検査して有効な場合に数値もしくは、
     * キーワード"blank"/"interp"/"fixed" を返す。それ以外はnullを返す。
     * 今のところりまぴん専用05/03/05
     *    すっかり忘れていた、
     *    ブランクメソッドがファイルでかつカラセルなしの場合は、
     *    ブランク自体が無効データになるように修正 05/05/02
     * 汎用関数になる場合は、有効データに対して
     * 「MAP上の正しいエントリに対応するエントリID」で返すこと。
     *
     * エントリIDよりも、オブジェクトを返すのが望ましい。
     * このシステム内ではオブジェクトは大きなデータにはならない
     * 大容量のデータを必要とする素材は全て外部へのリンク情報である
     *
     * オブジェクトが自律的に自身のリンク解決ができる方が良いか？
     * この関数を利用しているポイント自体を xMap.getElementByName()に置き換える方向で
     */
    if (!label) {
        label = null
    }
    /**
     * ラベルなしの場合、ヌルで
     */
    if (xUI) {
        if (!bflag) {
            bflag = (xUI.blpos == "none") ? false : true
        }
    } else {
        if (!bflag) {
            Blank = (BlankPosition == "none") ? false : true
        }
    }
    /**
     * カラセルフラグなしの場合はデフォルト位置から取得
     */
    if (!str) {
        return null
    }
    /**
     * ブランクキーワードならば、ブランクを返す。
     * @type {RegExp}
     */
    var blankRegex = new RegExp("^(" + label + ")?\[?[\-_\]?[(\<]?\s?[ｘＸxX×〆0０]{1}\s?[\)\>]?\]?$");
    if (str.toString().match(blankRegex)) {
        if (bflag) {
            return "blank"
        } else {
            return null
        }
    }
    /**
     * 中間値生成記号の場合"interp"を返す.
     * @type {RegExp}
     */
    var interpRegex = new RegExp("^[\-\+=○●*・]$");
    if (str.toString().match(interpRegex)) {
        return "interp"
    }
    /**
     * 全角英数字記号類を半角に変換
     */
    str = nas.normalizeStr(str);
    /**
     * 数値のみの場合は、数値化して返す。ゼロ捨てなくても良いみたい?
     * @todo 記述指定による有効記述はXPS側での解釈に変更する　このルーチンは近い将来　配置を移動してこのメソッドからは消失させる　20160101
     */
    if (!isNaN(str)) {

        /**
         * ホストアプリケーションがPSでかつLayerSetにgetIdxが拡張されている場合のみ数値を更に確認
         * エラーが出たらヌル扱い
         */
        if (appHost.ESTK){
        if (app.name.indexOf("Photoshop") > 0) {
            str = _getIdx([label, str].join("-"));
            if (!str) return null;
        }
        }
        return parseInt(str);
    } else {
        /**
         * レベルを判別してラベル文字列を取得。ラベル付き数値ならば、数値化して返す。
         * @type {RegExp}
         */
        var labelRegex = new RegExp("^(" + label + ")?[\-_\]?\[?[\(\<]?\s?([0-9]+)\s?[\)\>]?$");
        //↑ラベル付きおよび付いてないセル名にヒットする正規表現
        //…のつもりだけど大丈夫かしら?
        if (str.toString().match(labelRegex)) {
            str = RegExp.$2 * 1; //部分ヒットを数値化
            /**
             * ホストアプリケーションがPSでかつLayerSetにgetIdxが拡張されている場合のみ数値を更に確認
             * エラーが出たらヌル扱い
             */
             
        if (appHost.ESTK){
            if ((app) && (app.name.indexOf("Photoshop") > 0)) {
                str = _getIdx([label, str].join("-"));
                if (!str) return null;
            }
        }
            return str;
        }
    }
    /**
     * あとは無効データなのでヌルを返す。
     */
    return null;
}

/**
 * 一時利用メソッドPS環境のみで実行
 * レイヤ名／トレーラーを引数にその名前のレイヤーのレイヤセット内での順位（タイミング）を戻す
 * @param Lname
 * @param targetTrailer
 * @returns {*}
 * @private
 トレーラーは
 ps > activeDocumentのレイヤセット　未指定の場合はrootならapp.activeDocument.layers
 ae > 
 */
_getIdx = function (Lname, targetTrailer) {
    /**
     * レイヤ全あたりでチェック
     */
    if (typeof targetTrailer == "undefined") targetTrailer = app.activeDocument.layers;
    for (var lix = targetTrailer.length - 1; lix >= 0; lix--) {
        if (targetTrailer[lix].name == Lname)  return (targetTrailer.length - lix);
    }
    /**
     * 該当レイヤがないのでサブレイヤを掘る
     */
    var result;
    for (var lix = targetTrailer.length - 1; lix >= 0; lix--) {
        if (targetTrailer[lix] instanceof LayerSet) result = _getIdx(Lname, targetTrailer[lix].layers);
        if (result) return result;
    }
    return null
};

//以下は 上のエントリの置換え用関数

/**
 * xMap.dataCheck(myStr,tlLabel[,blFlag])
 *
 * 引数    : セルエントリ,タイムラインラベル,ブランクフラグ
 * 戻り値    : 有効エントリID　/"blank"/ null
 *
 * セルエントリを　文字列　タイムラインラベル　[カラセルフラグ]で与えて有効エントリの検査を行う
 * MAP内部を走査して有効エントリにマッチした場合は有効エントリを示す固有のIDを返す
 * （AE版では　グループ相当のコンポオブジェクトおよびフレームIDで返す）
 * カラセルフラグが与えられた場合は、本来のカラセルメソッドを上書きして強制的にカラセルメソッドを切り替える
 * AE版の旧版タイムシートリンカとの互換機能
 
 この関数は後方互換のために存在するので新規の利用は禁止
 
 調整的には、dataChaeck関数はこのまま残置してxMapに順次移行
 xMap.dataChaeck は設定しない（他のスタイルで実装）
 
 */