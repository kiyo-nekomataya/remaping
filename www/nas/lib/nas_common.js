/**
 * @fileOverview
 * nas_common.js
 * 共用可能スクリプト部分
 * アニメーション一般ライブラリ
 * AE等のAdobe Script 環境で使用可能な機能を提供します
 * モジュール使用可能バージョン
 * 2025/07/22
 */
'use strict';
/*=======================================*/
// load order:1 環境判定でなくindex_uat.jsから呼ばれた場合のみ実行するように調整
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var csvSimple = require( './csvsimple-mod' ).csvSimple;
    var ecl       = require( './ecl-mod' ).ecl;
    var config    = require( './etc/config.json' );
};
/* --- おことわり
 *
 * このプログラムの著作権は「ねこまたや」にあります。
 *
 * あなたは、このプログラムのこの著作権表示を改変しないかぎり
 * 自由にプログラムの使用・複製・再配布などを行うことができます。
 *
 * あなたは、このプログラムを自己の目的にしたがって改造することができます。
 * その場合、このプログラムを改造したものであることを明記して、この著作権表示を
 * 添付するように努めてください。
 *
 * このプログラムを使うも使わないもあなたの自由なのです。
 *
 * 作者はこのプログラムを使用したことによって起きたいかなる
 * 不利益に対しても責任を負いません。
 * あなたは、あなたの判断と責任においてこのプログラムを使用するのです。
 *
 * なんか、困ったことがあったら以下で連絡してもらえると何とかなるかもしれません。
 * http://www.nekomataya.info/
 * mailto:kiyo@nekomataya.info
 *
 * そんな感じです。
 *
 * 追伸
 * このプログラムは、汎用のモジュール群です。
 * 組み込みでつかえるかどうかは作者の作業時間とセンスに左右されます。
 * nas汎用オブジェクトとメソッドで構成することに決定。
 * 呼び出しかたが変わるのでこのバージョン以降互換性無し。
 *
 * 2015 07-11
 * 基礎オブジェクトの大幅変更
 * 以降のライブラリは基本的に後方互換性を失うので注意
 *
 * 2016 01-29
 * 懸案だったベクトル関連の演算ライブラリを少し整理してこのモジュールに組み込む
 * 関連の関数は全てnas.配下に組み入れるので、使用の際はコードの置きかえまたはエイリアスからのアクセスが必要
 * 移行した関数
 * preformvector add sub mul div clamp dot cross length normalize
 * degreesToRadians radiansToDegrees
 *
 * =======    現在のメソッド一覧 ======= 2016/01/29
 *
 * nas.dt2sc(z距離)
 * z軸距離(ピクセル)からスケールを求める
 *
 * nas.sc2dt(スケール)
 * スケールからz軸距離を求める。
 *
 * nas.fl2fr(撮影フレーム)
 * 撮影フレームからレタス撮影フレームを求める。
 *
 * nas.fr2fl(レタス撮影フレーム)
 * レタスフレームから撮影フレームを求める。
 *
 * nas.fl2sc(撮影フレーム)
 * 撮影フレームからスケールを求める。
 * nas.fr2sc(レタス撮影フレーム)
 * レタス撮影フレームからスケールを求める。
 * nas.sc2fl(スケール)
 * スケールから撮影フレームを求める。
 * nas.sc2fr(スケール)
 * スケールからレタス撮影フレームを求める。
 * nas.kac(開始寸法,終了寸法,助変数)
 * 開始寸法・終了寸法と助変数を与えて、対応する寸法を求める。
 * nas.cak(開始寸法,終了寸法,拡大率)
 * 開始寸法・終了寸法と任意寸法を与えて、寸法に対応する助変数を求める。
 *
 * nas.Zf(数値,桁数)
 * 数値を指定桁数のゼロで埋める。
 *
 * nas.ms2fr(ミリ秒数)
 * ミリ秒数から、フレーム数を求める。
 * nas.fr2ms(フレーム数)
 * フレーム数から、ミリ秒数を求める。
 * nas.ms2FCT(ミリ秒数,カウンタタイプ,オリジネーション[,フレームレート])
 * ミリ秒数から、カウンタ文字列への変換。
 * カウンタータイプ・オリジネーション・フレームレートを指定
 * nas.FCT2ms(カウンタ文字列)
 * カウンタ文字列から、ミリ秒数への変換。
 * nas.Frm2FCT(フレーム数,カウンタタイプ,オリジネーション[,フレームレート])
 * フレーム数(0オリジン)から、カウンタ文字列への変換
 * カウンタータイプ・オリジネーション・フレームレートを指定
 * nas.FCT2Frm(カウンタ文字列[,フレームレート])
 * カウンタ文字列から、フレーム数(0オリジン)への変換
 * フレームレート省略可能
 * nas.docodeUnit(入力値,変換単位)
 * 入力値の単位を変換した数値を戻す(mm,cm,px,pt,in)
 *
 * ==== 色彩関連(web用)
 * nas.colorStr2Ary(カラー文字列)
 * WEB色指定用の文字列を3次元の配列にして返す
 * nas.colorAry2Str([配列])
 * 配列で与えられたRGB値を16進文字列で返す。
 * ==== ベクトル関連
 * nas.vec2azi(ベクトル,[フォーマット])
 * 与えられたベクトルの方位角を返す。文字フォーマットも可
 * ==== 行列計算
 * 行列演算関数の行列は配列の組み合わせでなく、要素のストリーム文字列である。
 *
 * nas.showMatrix(ラベル,行列文字列,行数,列数)
 * 与えられた行列文字列に改行を加えて文字列で返す。
 * nas.mDeterminant(行列文字列)
 * 行列式(和)を返す。
 * nas.multiMatrix(行列文字列1,行列文字列2)
 * 行列積を求める。
 * nas.mInverse(行列文字列)
 * 逆行列を求める。
 * nas.transMatrix(行列文字列)
 * 行列を転置する。
 *
 * ==== 文字列操作(Stringクラスにオーバーライドするかも知れないので暫定)
 * nas.biteCount(文字列)
 * 文字列のバイト数を返す。
 * nas.biteClip(文字列,制限バイト数)
 * 文字列を指定バイト数以下にクリップ
 * nas.incrStr(文字列,step)
 * 文字列の末尾の番号部分を１くり上げて返す
 * nas.normalizeStr(文字列)
 * 文字列を半角数値で比較できるようにフォーマットして返す
 * ==== プロパティ操作
 * nas.propCount(オブジェクト,リストスイッチ)
 * オブジェクトのプロパティをカウントする
 * リストスイッチでプロパティ名の配列を返す
 * ==== 単位換算
 * nas.decodeUnit(入力値,変換単位)
 * 単位つきの文字列値を数値にして返すメソッド
 * 単位は mm cm in pt px
 *
 * ========    既存オブジェクトにオーバーライドするメソッド
 * "yy/mm/dd hh:mm:ss" 形式を拡張
 * Date.prototype.toNASString()
 * ;returns String
 * Date.prototype.setNASString("yy/mm/dd hh:mm:ss")
 * ; returns object
 * 古い環境でtrimメソッドがない場合のみ設定
 * String.prototype.trim()
 * ; returns String
 *
 */
/** @constant {String} filename*/
var myFilename = ('nas_common.js');
/** @constant {String} fileversion*/
var myFilerevision = ('2.2');


/*   事前に基礎環境を整備   */
//============= console
if(! console){
    var console = {
        data:[],
        log:function(arg){this.data.push(arg);},
    };
};
//============= String
/*   String.trim
 *   Stringクラスに trimメソッドがない場合に設定
 */
if(! String.prototype.trim){
    String.prototype.trim = function trim(){
        return this.replace(/^\s*/,'').replace(/\s*$/,'');
    }
}
/* String.camelize
 * @returns {string}
 */
String.prototype.camelize = function () {
    return this.replace(/(?:[-_])(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : '';
    });
};
//============= Array
/*   Array.indexOf
 *   配列オブジェクトにindexOfメソッドがない場合
 */
// https://tc39.es/ecma262/#sec-array.prototype.indexof
if (!Array.prototype.indexOf)
  Array.prototype.indexOf = (function(Object, max, min) {
    "use strict"
    return function indexOf(member, fromIndex) {
      if (this === null || this === undefined)
        throw TypeError("Array.prototype.indexOf called on null or undefined")

      var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
      if (i < 0) i = max(0, Len + i)
      else if (i >= Len) return -1

      if (member === void 0) {        // undefined
        for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i
      } else if (member !== member) { // NaN
        return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
      } else                          // all else
        for (; i !== Len; ++i) if (that[i] === member) return i 

      return -1 // if the value was not found, then return -1
    }
  })(Object, Math.max, Math.min)

/*  Array.find
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.find

if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;
      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw TypeError('predicate must be a function');
      }
      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];
      // 5. Let k be 0.
      var k = 0;
      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }
      // 7. Return undefined.
      return undefined;
    }
}

/*  Array.prototype.findIndex
 */
// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;
      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];
      // 5. Let k be 0.
      var k = 0;
      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }
      // 7. Return -1.
      return -1;
    };
}
/* Array.prototype.forEach
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
*/
if (!Array.prototype['forEach']) {

  Array.prototype.forEach = function(callback, thisArg) {

    if (this == null) { throw new TypeError('Array.prototype.forEach called on null or undefined'); }

    var T, k;
    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") { throw new TypeError(callback + ' is not a function'); }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) { T = thisArg; }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
/*  Array.from for Adobe ESTK
 */
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (! Array.from) {
    Array.from = (function () {
        var symbolIterator = 'Symbol(Symbol.iterator)';
//MDNの記法ではAEでエラーとしてキャプチャされて実行が止まるのtypeof判定に変更
        if((typeof Symbol != 'undefined' )&&(Symbol.iterator)) symbolIterator = Symbol.iterator;
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return (
                typeof fn === 'function' ||
                toStr.call(fn) === '[object Function]'
            );
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) return 0;
            if (number === 0 || !isFinite(number)) return number;
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        var setGetItemHandler = function setGetItemHandler(isIterator, items) {
            var iterator = isIterator && items[symbolIterator]();
            return function getItem(k) {
                return isIterator ? iterator.next() : items[k];
            };
        };

        var getArray = function getArray(
            T,
            A,
            len,
            getItem,
            isIterator,
            mapFn
        ) {
            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… or while iterator is done (also steps a - h)
            while (k < len || isIterator) {
                var item = getItem(k);
                var kValue = isIterator ? item.value : item;
                if (isIterator && item.done) {
                    return A;
                } else {
                    if (mapFn) {
                        A[k] =
                            typeof T === 'undefined'
                                ? mapFn(kValue, k)
                                : mapFn.call(T, kValue, k);
                    } else {
                        A[k] = kValue;
                    }
                }
                k += 1;
            }
            if (isIterator) {
                throw new TypeError(
                    'Array.from: provided arrayLike or iterator has length more then 2 ** 52 - 1'
                );
            } else {
                A.length = len;
            }
            return A;
        };
        // The length property of the from method is 1.
        return function from(arrayLikeOrIterator /*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLikeOrIterator).
            var items = Object(arrayLikeOrIterator);
            var isIterator = isCallable(items[symbolIterator]);

            // 3. ReturnIfAbrupt(items).
            if (arrayLikeOrIterator == null && !isIterator) {
                throw new TypeError(
                    'Array.from requires an array-like object or iterator - not null or undefined'
                );
            }
            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError(
                        'Array.from: when provided, the second argument must be a function'
                    );
                }
                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }
            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);
            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            return getArray(
                T,
                A,
                len,
                setGetItemHandler(isIterator, items),
                isIterator,
                mapFn
            );
        };
    })();
}
/**
 * 配列オブジェクト拡張メソッド<br />
 * <br />
 *  配列要素を検索して同値の要素が存在すればその要素idを、
 *  存在しない場合は引数を配列に追加してそのidを返す。<br />
 *  戻り値は当該のアイテムid<br />
 *  先入れ後出しにするため、リスト登録は配列の逆順登録にする
 *  引数に比較関数cmpfxを与えることが出来る
 *  cmpfx(tgt,dst)で、一致が発生した場合配列へのメンバ追加は行われない
 *  cmpfxがない場合はindexOfで検索を行う<br />
 * 
 * @params {any} itm
 * @params {Function} cmpfx
 * @returns {Number} element id of Array
 */
Array.prototype.add=function(itm,cmpfx){
    if(cmpfx instanceof Function){
    var idx = -1;
        for (var ix=0;ix<this.length;ix++){
            if(cmpfx(itm,this[ix])){idx = ix;break;}
        }
    }else{
        idx = this.indexOf(itm);
    }
    if(idx<0){
        this.push(itm);idx = this.length-1;
    }
    return idx;
}
/* TEST
    var A = ["A","B","C","D","E","F","G","H"];
    console.log(A.add("A"));
    console.log(A.add("J"));
    console.log(A);
    var B = [{name:"A",id:1},{name:"B",id:2},{name:"C",id:3}];
    console.log(B.add({name:"F",id:1},function(tgt,dst){return tgt.id==dst.id}));
    console.log(B.add({name:"D",id:0},function(tgt,dst){return tgt.id==dst.id}));
    console.log(B);
    

*/
/**
 * DateオブジェクトにtoNASString形式処理を乗せる
 *  @params {String} form
    yyyy
 *  @returns {string}
 */
Date.prototype.toNASString = function (form) {
    if(! form) form = "yy/mm/dd h:m:s";
    var h    = this.getHours();
    var m    = this.getMinutes();
    var s    = this.getSeconds();
    var yy   = this.getFullYear();
    var mm   = nas.Zf(this.getMonth() + 1 , 2 );
    var dd   = nas.Zf(this.getDate() , 2 );
        var Result = form.replace(/yy/ ,yy).replace(/mm/ ,mm).replace(/dd/ ,dd).replace(/h/ ,h).replace(/m/ ,m).replace(/s/ ,s);
    return Result;
};
// Date
/**
 * @params {String} nasString
 * @returns {Date}
    NAS形式の時刻表現をオブジェクトに設定する
    yy/mm/dd h:m:s
    yy/mm/dd
    mm/dd
    dd
    一部が省略された入力を受けた場合、一定のポリシーで現在の値で補完する
    未来の時間を設定することが管理上ふさわしくないのでその場合固定で１年間巻き戻る
    補完の値はメソッドを呼び出した時刻
 */
Date.prototype.setNASString = function (nasString) {
    var input = String(nasString).split("\ ");
    var day   = input[0].split("/");
    var current = new Date();
    if(day.length == 1){
//年と月が欠落
        day = [current.getFullYear(),current.getMonth(),day[0]];
    }else if(day.length == 2){
//年が欠落
        day = [current.getFullYear(),day[0],day[1]];
    }else{
        day = [day[0],day[1],day[2]];
    };
//time記述は部分欠落は許されない ALL || NOT
//不足時は、関数を呼び出した時刻で補われる
    var time = (input.length > 1)? input[1].split(":"):[];
    if (time.length != 3) time = [current.getHours(),current.getMinutes(),current.getSeconds()];
//不足の時間は現在時で補う
    var yy = day[0];
    var mm = day[1] - 1;
    var dd = day[2];
    var h = time[0];
    var m = time[1];
    var s = time[2];
    this.setFullYear(yy);
    this.setMonth(mm);
    this.setDate(dd);
    this.setHours(h);
    this.setMinutes(m);
    this.setSeconds(s);
//未来の時間を設定した場合は固定で１年間巻き戻る
    if (this.getTime() > (current.getTime()+1000)) this.setFullYear(yy-1);
    return this;
};

/*
 * @description 実行環境の判定
 *	isAIR nas.isAIR等を参照していた部分を全面的に環境プロパティ appHostで書きなおす
 *  appHost はオブジェクトで作成してプラットフォーム及びバージョンを識別できる情報を与える HTML関連コードからこちらへ移動済み
 */
/** 環境保持クラス
 *  @class AppHost
 *
 *  @property  {boolean} Nodejs
 *      Node.js 環境下であるか否かのフラグ
 *      Electron上ではMainプロセス｜Browserプロセスがこれに当たる サンドボックスはフラグを判定する
 *  @property  {String} Cordova
 *      false|iPad|iPhone|Android...
 *      Cordova環境変数 
 *      devicereadyイベントの判定は別口に置く
 *  @property  {String} Electron
 *      none|browser|(sandbox)|renderer
 *      Electron環境の使用状況
 *      electronIpcが存在しない（使用不能）な場合もあることに注意
 *      
 *  @property  {boolean} ESTK
 *      Adobe ESTS環境下であるか否かのフラグ
 *  @property  {String} platform
 *      UI稼働環境指示変数 AIR|UXP|CEP|CSX|Electron|Cordova(iPhone|iPad|Android)|Chrome|Safari|Opera|MSIE|Edg|Mozilla|NN|unknown
 *      Codova判定の場合は appHost.Cordova(iPhone|iPad|Android)
 *      Electron 判定の場合は preload|hub|spokeの3環境があるので要注意
 *  @property  {String} version
 *      稼働環境バージョン変数 各環境ごとに意味が異なるので注意
 *  @property  {String} os
 *      稼働OS変数  iOS|Android|Mac(Derwin)|Win|Linux|Other
        monaca(cordova)導入でiOSとAndroidが追加(Cordova変数等の併用で判定)
 *  @property  {boolean} localfs
 *      ローカルファイルアクセスが可能か否かのフラグ
*/
function AppHost(){
    this.Nodejs  ;//node-js bool
    this.ESTK    ;//Adobe Extend Script bool
    this.Cordova ;//Cordova bool
    this.Electron;// none|browser|(sandbox)|renderer  *sandboxh判定は不要
	this.platform;//AIR|UXP|CEP|CSX|Electron|Coldova(iPhone|iPad|Android)|Chrome|Safari|Opera|MSIE|Edg|Mozilla|NN
	this.version;
	this.os = 'unknown';//iOS|Android|Mac(Derwin)|Win|Linux|Other
	this.fileAccess  = false;
	this.userLibrary = false;
	this.userLibraryVersion ;
	this.touchDevice = false;
	this.tablet = false;
}

AppHost.prototype.init=function(){
//Node.js環境判定
    this.Nodejs = ((typeof process != "undefined")&&( process.versions.node))? true : false;
//    if(! (this.Nodejs))this.Nodejs = (typeof electronIpc != 'undefined')? true:false;
//Cordova環境判定(grobalのObject cordovaを判定)
    this.Cordova = ((typeof cordova != "undefined"))? true : false;
//AdobeESTK判定
/*Object appをmonaca projectと兼用するため判定方法を変更 20250702 */
    this.ESTK   = ((typeof app != "undefined")&&(app.toString().indexOf('Adobe') >= 0))? true:false;
//globalのappオブジェクトを確認してAdobeScript環境を判定
    if (this.ESTK) {
        try {
            if (app.isProfessionalVersion) {
//AEは、app.nameプロパティがないのでここでアタッチしておく
                app.name = "Adobe AfterEffects";
            }
        } catch (ERR) {
        }
    }

//OSチェック初期値
	this.os = "Other";//初期値として設定
//判定カテゴリは、Mac|Win|iOS|Android|Other で
    if(typeof navigator != "undefined"){
//navigatorオブジェクトが存在するので必ずHTMLが使用できる
        var uaName = navigator.userAgent;
        var uaVer;
        if(uaName.indexOf('Electron/') > -1){
            if(typeof electronIpc != 'undefined'){
                this.platform = 'Electron';
                this.version=uaName.match(/(Electron\/)([0-9\.]*)/)[2];
                if(typeof process == 'undefined'){
                    this.Electron = 'browser';//sandbox
                }else{
//Electron sandbox内部では nas library自体ロード不能になったのでこの判定は無意味
//                this.Electron = (process.sandboxed)? 'sandbox':'renderer';
                    this.Electron = 'renderer';
                };
            }else if(this.Cordova){
                this.platform = cordova.platformId;//ios|android|electron
                this.version=uaName.match(/(\sChrome\/)([0-9\.]*)/)[2];
            }else{
                this.platform = '';
                this.version  = '';
            };
        }else if(window.__adobe_cep__){
//windowオブジェクトも存在する
	//CEP
		    this.platform="CEP";
		    this.version=uaName.match(/(\sChrome\/)([0-9\.]*)/)[2];
		}else if(uaName.indexOf("Adobe UXP Runtime") == 0){
	//UXP
		    this.platform = "UXP";
		    this.ESTK     = false;//trueで判断される可能性があるのでここで強制
			this.uxp_host = require('uxp').host;
			this.version  = (uaName == "Adobe UXP Runtime")? "----":(uaName.match(/(uxp\-)([\S]+)/)[2]);
	    }else if(uaName.indexOf("AdobeAIR") > -1){
	//AIR(フラッシュ)系
	        if (window.runtime){
		        this.platform="AIR";
		        this.version=uaName.match(/(AdobeAIR\/)([0-9\.]*)/)[2];
	        }else {
	//CEP以前のCSX形式
		        this.platform="CSX";
		        this.version=uaName.match(/(AdobeAIR\/)([0-9\.]*)/)[2];
	        };
	    } else if(uaName.match(/(iPhon|iPad|iPod)\;\sCPU\s(iPhone\s)?OS\s([0-9].+)/)) {
	//iOS系デバイス 'CPU iPhone OS 13_2_3''CPU OS 13_3'
		    this.version = parseInt(RegExp.$3.split("\.")[0]);
		    this.platform = RegExp.$1;//iPhone|iOS	
			this.touchDevice = true;
			if(uaName.indexOf('iPad') >= 0) this.tablet = true;
			this.os = 'iOS';
	    } else if(uaName.match(/Android\s([0-9].+)\;/)) {
	//Android系デバイス
		    this.version = parseInt(RegExp.$1.split("\.")[0]);
		    this.platform = "Android";//Android系
			this.touchDevice = true;
			if(uaName.indexOf('Mobile') < 0) this.tablet = true;
			this.os = 'Android';
	    } else if(uaName.indexOf("Chrome") > -1) {
	//その他普通のブラウザ
		    uaVer = uaName.match(/(Chrome\/)([0-9\.]*)/)[2];
		    this.version = (uaVer.split("\.")[0]*1);
		    this.platform = "Chrome";//chromeらしい
	    } else if(uaName.indexOf("Safari") > -1) {
		    uaVer = uaName.match(/(Safari\/)([0-9\.]*)/)[2];
		    this.version = (uaVer.split("\.")[0]*1)+(uaVer.split("\.")[1]/10);
		    this.platform = "Safari";//サファリらしい
	    }else if(uaName.indexOf("Opera") > -1) {
		    this.version = uaName.match(/(Opera[\ \/])([0-9\.]*)/)[2];
		    this.platform = "Opera";//オペラである
	    }else if(uaName.indexOf("MSIE") > -1) {
		    this.version = uaName.match(/(MSIE[\ \/])([0-9\.]*)/)[2];
		    this.platform = 'MSIE';
	    }else if(uaName.indexOf("Netscape") > -1) {
		    uaVer = uaName.match(/(Netscape6?[\ \/])([0-9\.]*)/)[2];
		    this.version = (uaVer.split("\.")[0]*1)+(uaVer.split("\.")[1]/10);
		    this.platform = "NN";//NSにしてみる。
	    }else if(uaName.indexOf("Mozilla") > -1) {
		    this.version = uaName.match(/(Mozilla[\ \/])([0-9\.]*)/)[2];
		    this.platform = "Mozilla";//NSでないMozillaにしてみる。
		}else{
		    this.version = 'unKnown';
		    this.platform = uaName;//知らないブラウザである。
	    };
	    if(this.os == 'Other'){
	    	if (((window.navigator.platform).indexOf("Mac") > -1)||((window.navigator.platform).indexOf("darwin") > -1)){
	        this.os = "Mac";//Mac OS X
	    	}else if ((window.navigator.platform).indexOf("Win") > -1){
		    	this.os = "Win";//Windows
				if(uaName.indexOf('Tablet') >= 0){
					this.touchDevice = true;
					this.tablet      = true;
				};
	    	}else if ((window.navigator.platform).indexOf("linux") > -1){
		    	this.os = "linux";//linux
	    	};
	    };
    }else if(this.ESTK){
        uaName = app.name;//applicationName
		this.version = parseFloat(app.version);
		this.platform = ({"Adobe Photoshop":"PHXS","Adobe AfterEffects":"AEFT"})[uaName];//ブラウザではないESTK環境
		if(($)&&($.os)){
		    if($.os.indexOf("Mac")>=0){
		        this.os = 'Mac'
		    }else if($.os.indexOf("Win")>=0){
		        this.os = 'Win'
		    };
		};
    }else{
		this.version = 'unKnown';
		this.platform = 'console';//GUIがないconsoleのみの環境
		if(this.Nodejs){
		    if(process.platform=='darwin'){
		        this.os = 'Mac';
		    }else if(process.platform=='win32'){
		        this.os = 'Win';
		    }else if(process.platform=='darwin'){
		        this.os = 'Other';//未検証・要調整
            };
        };
    };
/*
	ローカルファイルシステムへのアクセス可否を最初にチェックしてフラグをたてる
	Node.js|ESTK|AIR環境があればローカルファイルシステムのアクセス可能
	Electronの場合は'browser'以外は直接ファイルシステム参照可能
*/
	this.fileAccess = ((this.Nodejs)||(this.ESTK)||(this.platform == 'AIR'))? true:false;
/*
    初期状態では appHost.userLibrary は false
    baseLocationの初期化に利用するので
    初期化の際に一度ライブラリチェックを行う必要がある
    ここでやったほうが良いか？
*/
    this.userLibrary = false;
}
/**
 *  
 *  以下の順で初期化が行われる
 *  先行のオブジェクトが参照される
 *  
 *  appHost.userLibrary
 *  	nas.baseLocation
 *  		Folder(ESTK|AIR|CSX|CEP|NODE|other)
 *      appHost.userLibrary 基礎プロパティを再初期化
 *      baseLocatonは、nas-libの格納ディレクトリ
 *      WEB環境ではスタータhtmlのロケーション直下の'nas/'フォルダを指す
 *      各環境ごとに再初期化が必要 （この判定では AIRはサポート対象外）
 *      チェック実行は nas.File|fs|uat 初期化後である必要がある
 *  
Windows
	<USERPROFILE>\AppData\Roaming\nas\
Mac
	<HOME>/Library/Application Support/nas/
other-Unix type OS
	<HOME>/etc/nas/

UXP環境では、外部のデータアクセスに制限がかかるため同期を行う外部プロセスを作成してそれを利用する予定
 *  
 */
/**
 *  ユーザ環境Libraryをパスを取得
 */
AppHost.prototype.checkUserlibrary=function(){
    this.userLibrary = false;
    this.userLibraryVersion = '';
    var libPath      = '';
    var libVersion   = '';
    var pthExists    = false;
    if(appHost.platform == 'UXP'){
//UXP環境では暫定的にfalseのまま ESの判定コードをのちほど実装インストール先のnasフォルダを指す
;// NOP ;        libPath = false;
//         fs.getDataFolder().then(function(f){f.})
    }else if(appHost.platform == 'CEP'){
//CEP
        libPath = new CSInterface().getSystemPath(SystemPath.USER_DATA) + "/nas";
//ファイルの読み出しはESへ依頼する
        var tgObj = this;
        new CSInterface().evalScript('var pthExists = (Folder(Folder.userData.fullName + "/nas/lib/etc").exists)?true:false;var libVersion = "";if(pthExists){var verfile = new File(Folder.userData.fullName + "/nas/version");if(verfile.exists){verfile.encoding="UTF8";verfile.open("r");libVersion = verfile.read().trim();if(libVersion.length==0){alert("Zero Length!");};verfile.close();};};([(pthExists)?"true":"false",libVersion].join(","));',function(res){
            var result = res.split(",");
            if(result[0]=='true'){
                tgObj.userLibrary = libPath;
                tgObj.userLibraryVersion = result[1].trim();
            }else{
                tgObj.userLibrary = false;
                tgObj.userLibraryVersion = '';
            };
        });
        return ;
    }else if(this.ESTK){
//インストール先を確認・バージョンを取得
        pthExists = (Folder(Folder.userData.fullName + "/nas/lib/etc").exists);
        if(pthExists){
            libPath = new Folder(Folder.userData.fullName + "/nas").fullName;
            var verfile = new File(Folder.userData.fullName + "/nas/version");
            if(verfile.exists){
                verfile.encoding="UTF8";
                verfile.open("r");
                libVersion = verfile.read().trim();
                if(libVersion.length==0){alert("Zero Length!");}
                verfile.close();
            };
        };
    }else if(this.Electron == 'browser'){
// browserモジュールではインストール状態を保留して残置
// userLibraryの値に関わらずアクセスが必要な場合はその都度
// hubを経由してリクエストを解決する
/* eg
        uat.MH.parentModule.window.postMessage({
            channel:"callback",
            form:{name:xUI.app,id:uat.MH.objectIdf},
            to:{name:'hub',id:uat.MH.parentModuleIdf},
            command:'return electronIpc.checkUserlibrary()',
            content:[],
            callback:"appHost.userLibrary = arguments[0]"
        });
*/
        if(typeof uat != 'undefined'){
            uat.MH.parentModule.window.postMessage({
                channel:"callback",
                form:{name:xUI.app,id:uat.MH.objectIdf},
                to:{name:'hub',id:uat.MH.parentModuleIdf},
                command:'return electronIpc.checkUserlibrary()',
                content:[],
                callback:"console.log(arguments[0]);"
            });
        }else if(typeof electronIpc != 'undefined'){
console.log(electronIpc);
            this.userLibrary = electronIpc.checkUserlibrary();//
        };
    }else if((this.Nodejs)||((this.Electron)&&(this.Electron != 'browser'))){
/*
    main.js|CEP環境でcjsロードする際に
    path.join|nas.File.join 両方の使えないタイミングがあるため一旦文字列で生成
 */
        var ckPath;
        if(this.os == "Win"){
            ckPath = process.env.USERPROFILE+'\\AppData\\Roaming\\nas\\lib\\etc';
        }else if(this.os == "Mac"){
            ckPath = process.env.HOME+'/Library/Application\ Support/nas/lib/etc' ;
        }else{
            ckPath = process.env.HOME+'etc/nas/lib/etc';//unix|Linux|Other ?
        };
//パスの存在をチェックしてインストールを確認 存在しない場合はフォールバック
//初回実行時にfsが初期化前！
        if((fs)&&(!(fs.existsSync(ckPath)))){
            pthExists = false;
        }else{
            pthExists = true;
            if(this.os == "Win"){
                libPath = process.env.USERPROFILE+'\\AppData\\Roaming\\nas';
                if(fs.existsSync(libPath+"\\version"))
                    libVersion = fs.readFileSync(libPath+"\\version");
            }else if(this.os == "Mac"){
                libPath = process.env.HOME+'/Library/Application\ Support/nas' ;
                if(fs.existsSync(libPath+"/version"))
                    libVersion = fs.readFileSync(libPath+"/version");
            }else{
                libPath = process.env.HOME+'etc/nas';//unix|Linux|Other ?
                if(fs.existsSync(libPath+"/version"))
                    libVersion = fs.readFileSync(libPath+"/version");
            };
        };
    };
    if(pthExists){
console.log('＊＊＊＊＊＊＊ 既設 nas lib を確認');
        this.userLibrary        = libPath;
        this.userLibraryVersion = libVersion;
    }else{
//存在しない場合は、オブジェクトメソッドでディレクトリを作成する（ここでは書込は行われない）
console.log('＊＊＊＊＊＊＊ nas/lib/etc が存在しないのでディレクトリ作成をトライ');
        return this.initUserLib(libPath);
    };
    return this.userLibrary;
}
/**
 *  @parmas {String}    pth
 *      指定のローカルパス上にuserLibraryの保存先を作成
 *      ライブラリ環境の初期化
 *	ユーザ環境保存ディレクトリを作成するメソッド
 *	基礎ディレクトリ作成
 *	nas/lib/etc/
 *		このディレクトリのみを作成する
 *		以下の個別ディレクトリはこの場では作成しない
 *	nas/lib/etc/_pmdb_/
 *	nas/lib/etc/_stbd_/
 *	nas/lib
 *	nas/ext-lib
 *	nas/version
 *
 *		これらのファイル|ディレクトリは別途インストーラーが作成するので注意
 *		すでに存在するディレクトリを指定すると作成メソッドがエラーを返すのでトラップを付ける
 *  
 */
AppHost.prototype.initUserLib = function(pth){
	if(! pth) return pth;
	this.userLibrary = pth;//pthで一旦初期化
	if(appHost.platform == 'UXP'){
/*	UXP環境では、PahotoshopのESに作成を依頼する
 *	PhotoshopのESは定期的にフォルダをサーチしてタイムスタンプから更新を検知
 *	UXPは定期的にそのフォルダをサーチして内容をオブジェクトに反映させる（未実装）
 */
    
		this.userLibrary = false;
/*		var content ='var targetDir= new Folder("%1");if(! targetDir.exists){try{targetDir.create();}catch(err){console.log(mkdir+":"+pth+\n"+err);return false;};}else{console.log(pth+":allready exists \n");return pth;};';
		content = content.replace(/\%1/,this.userLibrary);
;// */
	}else if(this.ESTK){
		var targetDir = new Folder(pth+'/lib/etc');
		if(! targetDir.exists){
//ESのFolder.createは基本的にリカーシブでフォルダを作成する
			try{targetDir.create();}catch(err){console.log(mkdir+":"+pth+":\n"+err);this.userLibrary = false;return false;};
		}else{
			console.log(pth+":allready exists \n");
			return pth;
		};
	}else if(this.Electron == 'browser'){
		;//NOP
	}else if((this.Nodejs)||((this.Electron)&&(this.Electron != 'browser'))){
//node.jsのfa.mkdirはリカーシブオプションが必要
		if(fs.existsSync(pth+'/lib/etc')){
			this.userLibrary = pth;
		}else{
			var res = fs.mkdirSync(pth+'/lib/etc',{ recursive: true });
			if(res){
				this.userLibrary = pth;
			}else{
				this.userLibrary = false;
			};
		};
	};
	return this.userLibrary;
}
//インスタンスを作成して初期化
var appHost=new AppHost();
console.log('init appHost');
	appHost.init();
//初期化&&(appHost.platform != 'Electron')
if((appHost.platform == 'UXP')){
	console.log("platform uxp");
	var uxp           = require('uxp');
	var fs            = require('uxp').storage.localFileSystem;
	var app           = require('photoshop').app;
	var action        = require('photoshop').action;
}else if(
	(! appHost.Nodejs)||
	((appHost.platform=='Electron')&&(appHost.Electron=='browser'))
){
	var fs            = false;
	var path          = false;
	var child_process = false;
	var iconv         = false;
	var mime          = false;
	var exec          = false;
	var execSync      = false;
	console.log("no node and electron");
}else{
//has Node.js main
	console.log("init nodeUI")
	var fs            = require('fs-extra');
	var path          = require('path');
	var child_process = require('child_process');
	var iconv         = require("iconv-lite");
	var mime          = require("mime-types");
	var exec          = require('child_process');
	var execSync      = require('child_process');
	console.log('setup for Node.js with electron');
};
//チェックにfsを使用するので初回実行タイミングはこちら
	appHost.checkUserlibrary();
console.log(appHost.userLibrary);
/*
 * namespace として Class nasを設定
 */
if (typeof nas == 'undefined') {
/** @namespace */
    var nas = {};
}
/**
 * xUIオブジェクトはHTMLライブラリにおけるUI管理オブジェクトなのでHTML環境外ではfalseで初期化して判定する
 * HTML環境下であっても依存機能が初期化完了前にアクセスすることを抑制するためにfalseであらかじめ初期化するのを標準メソッドとする
 * すなわちnasライブラリ稼働時は、つねにxUIオブジェクトが存在するものとする
 * @type {boolean}
 */
var xUI = false;
/**
 *  @fileoverview	nas配下に基礎オブジェクト拡張
 *
 *基礎オブジェクト群は、基底プロパティの記述に使用するので最終的には従来のnas_common.jsよりも先にロードする必要がある。
 *又は基礎オブジェクトとしてnas_common.jsに編入
 *
 *現在はnas_common.jsよりも後にロードされている
 *
 *デバッグ終了後は、ロード順位が入れ替わるので注意
 *相互依存を考慮してマージ
 *または、基底プロパティをオブジェクト化しないメソッドを考慮すること 24-06 2016
 *
 *単位付きカプセル化オブジェクトでは、演算の際に期待する値を確実に得るためには Object.as(Unit)で明示的に単位を指定すること
 *
 */
/**
 *  列挙型リストオブジェクトから、数値をキーにキーワードを返すメソッド
 *<pre>
 *  適用可能なオブジェクトは、以下
 *  nas.BlendingMode
 *  nas.PegForm
 *</pre>
 *  @params {Number} targetNumber
 *      列挙子の値
 *  @params {String} targetName
 *      列挙子のプレフィックス
 *  @returns    {String}
 *      列挙子のプレフィックスにキーワードを加えたもの
 *  @example
 *  nas.getEnumulatedNameByNumber(3620,'BlendingMode');//>> BelndingMode.NORMAL
 *  値が配列|Objectのケースを考慮のこと
 */
nas.getEnumulatedNameByNumber =function getEnumulatedNameByNumber(targetNumber,targetName){
    if((!nas[targetName])||(! nas[targetName].propertyIsEnumerable)) return '';
    var resultArry=[targetName];
        for(var prp in nas[targetName]){
            if (nas[targetName][prp] == targetNumber){resultArry.push(prp); break;}
        }
return resultArry.join('.');
};
/**
    特定文字のエスケープとアンエスケープ
引数の指定された文字にエスケープ文字を前置して返す関数
エスケープ文字自体は必ず二重エスケープされるので
strings にエスケープ文字を含んではならない。
含まれている場合は、多重処理防止の為エラー終了とする

nas.IdfEscape(sourceString,strings,escapeChar);
nas.IdfEscape("ABCDE%FG",'ABC','%');
result:"%A%B%CDE%%FG"
逆関数あり  逆関数は対象文字列の指定は不要
*/
nas.IdfEscape = function(sourceString,strings,escapeChar){
    if ((String(sourceString).length == 0)||(strings.length < 1)) return sourceString;
    if(! escapeChar) escapeChar = '\\';
    if(sourceString.indexOf('\\') >= 0){sourceString = sourceString.replace(/\\/,'\\\\')};
    if(strings.indexOf(escapeChar) >= 0){
        return String(sourceString).replace(new RegExp('['+strings+']','g'),escapeChar+'$&');
    } else {
        return String(sourceString).replace(new RegExp('['+strings+ '\\' +escapeChar+']','g'),escapeChar+'$&');
    }
}
/**
    逆関数
エスケープ文字を渡す際に直接正規表現オブジェクトにわたされるので、メタ文字は\エスケープの要あり
NG:nas.IdfUnEscape("a23^^DCg",'^');
OK:nas.IdfUnEscape("a23^^DCg",'\\^');

*/
nas.IdfUnEscape = function(sourceString,escapeChar){
    if (String(sourceString).length == 0) return sourceString;
    if(! escapeChar) escapeChar = '\\';
    return String(sourceString).replace(new RegExp("\\"+escapeChar+'(.)','g'),'$1');
}
//TEST
/*
nas.IdfEscape('ASBCDEF\\G','AXC\\','%');//"%ASB%CDEF%\%\G"
nas.IdfEscape('ASSDFGERtyusadhjgalll','AS','&');//"&A&S&SDFGERtyusadhjgalll"

nas.IdfUnEscape('%%A%BCDE%FG','%');//"%ABCDEFG"
*/
/**
 *     特定文字の%エンコーダ
 * 引数文字列の指定された文字を部分的にURIエンコード(%文字コード)して返す関数
 * 第一引数が与えられない場合は、空文字列として扱う（空文字列を返す）
 * 第二引数が与えられない場合は、encodeURIComponentの値を返す
 * 
 *     要素の文字列は識別子をファイル名等に利用する場合、ファイルシステムで使用できない文字が禁止されるが、この文字も併せて部分エンコードの対象となる。
 *     対象文字列は、Windowsの制限文字である  ¥\/:*?"<>| に加えて . 及びエンコード前置文字の %
 * 
 * nas.IdfEncode(sourceString,strings);
 * nas.IdfEncode("ABCDE%FG",'ABC');
 *	@params	{String}	sourceString
 *		エンコード前文字列
 *	@params	{String}	strings
 *		置き換え対象文字列
 *	@returns {String}
 *		エンコード済文字列
 * 逆関数なし
 * デコードはdecodeURIもしくはdecodeURIComponent関数を使用
 */
nas.IdfEncode = function(sourceString,strings){
    if(typeof sourceString == 'undefined'){return ""};
    if(typeof strings == 'undefined'){return encodeURIComponent(sourceString)};
    strings = strings + "\¥\\\\\\\/:\\\*\\\?\"<>|\\\.%";
    if ((String(sourceString).length == 0)||(strings.length < 1)) return encodeURIComponent(sourceString);
    if(String(sourceString).indexOf('\\') >= 0){sourceString = sourceString.replace(/\\/,'\\\\')};
        return String(sourceString).replace(new RegExp('['+strings+']','g'),function(match, p1, p2, p3, offset, string){
            var myCode = (match).charCodeAt();
            if(myCode <= 255 ){
                return "%"+ myCode.toString(16);
            }else{
                return encodeURIComponent(match);
            }
        });
}
//TEST
/*
nas.IdfEncode('ASBCDEF\\G','AXC\\');
decodeURIComponent(nas.IdfEncode('%%A%BCDE%FG','%'));
nas.IdfEncode('ASSDFGERtyusadhjgalll','AS');

*/
/**
 *  uuid文字列を返す
 *   @returns {String}
 *       UUID(v4)
 */
nas.uuid = function uuid() {
  var uuid = "", i, random;
  for (var i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i == 8 || i == 12 || i == 16 || i == 20) { uuid += "-" }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}
//test
//console.log nas.uuid();

/*
セパレータでパスの種別を選り分ける
"title#ep[subtitle]//"この用法にするとすべての識別子を下の判定で抽出できる
"title.pmdb"        :NG
"title//.pmdb"      :OK
'//'を含む ＞識別子
含まない　　＞ファイルパス

ファイルパスセパレータ 
'\ ' 含む(windows path)
    '.'で開始　相対パス
    ドライブレターを含む
'/ ' 含む(unix path)
    '.'で開始　相対パス
    '/'で開始　絶対パス
    スキームで開始 URL
    それ以外で開始　相対パス
いずれも含まない　単独ファイル名（相対パス）
関数としては判定結果のみを返す
判定結果で処理を分岐する際に必要
*/
/**
    引数文字列がデータ識別子かファイルパスであるかを判定する関数
    判定精度は上げる必要がある 2019.06.04
*/
nas.checkDataPath = function(dataString){
    if(String(dataString).indexOf('//') > 0)  return 'idf' ;
    if(String(dataString).indexOf('\\') >= 0) return 'win' ;
    if(String(dataString).indexOf('/') >= 0)  return 'unix';
    return false;
}
/*test
nas.checkDataPath("A#01[subtitle]//1/2/3//0//2//1//startup.xmap");
nas.checkDataPath("c:\\temp\\temp.txt");
nas.checkDataPath("/home/name/text.txt");
*/
/**
 *	括弧で囲まれたテキストをインデントする
 *	params	{String}	input
 *	returns	{String}
 *		括弧の深度に従ってインデントを加える
 */
nas.tabIndentCode = function tabIndentCode(input){
//	var lines = input.replace( /\{|\[|,/g , "$&\n").replace( /\}|\]/g , "\n$&").split('\n');
	var lines = input.split('\n');
	var indent = '';
	for (var l = 0 ; l < lines.length ; l ++){
		if(lines[l].match(/\}|\]|\)/)) indent = indent.slice(1);
		lines[l] = indent + lines[l];
		if(lines[l].match(/\{|\[|\(/)) indent += '\t';
	}
	return lines.join('\n');
}
/*TEST
	var test =`
{
123(
ABC
DEF
)
}
`
	nas.tabIndentCode(test);
*/
/**<基底オブジェクト>
 * @class @constractor
 *    ユーザ情報オブジェクト
 *    表示名(ニックネーム／ハンドル)と識別用メールアドレス(id)を持つ
 * @params {String} nameDescription
 *  ユーザ記述文字列
 * @params {Object} addisionalProp
 *  追加プロパティ（任意）
 *    ユーザ記述のドキュメント上の記録形式は以下<br />
 *    handleName:uid@domain<br />
 * @example
var currentUser = new nas.UserInfo("handle:user@example.co.jp")
var currentUser = new nas.UserInfo("handle")
var currentUser = new nas.UserInfo("user@example.co.jp")
var currentUser = new nas.UserInfo("ねこまたや:user@example.com")
var currentUser = new nas.UserInfo({"handle":"ねこまたや","email":"user@example.com"})
var currentUser = new nas.UserInfo('{"handle":"ねこまたや","email":"user@example.com"}')
 *<pre>
 *初期化引数に':'が含まれない場合は、引数がメールアドレスか否かを判定して
 *メールアドレスなら uid部をハンドルとして使用
 *それ以外の場合は、全体をハンドルにしてメールアドレスをnullで初期化する
 *メールアドレス整合性のチェックは特になし
 *一致比較は、メールアドレス側で行う  null,空白は いずれの場合も一致なし
 *空白で初期化したデフォルトの値はシステムで利用しないように注意する</pre>
 */
nas.UserInfo = function UserInfo(nameDescription,addisionalProp){
    this.id     = '';
    this.handle = null;
    this.email  = null;
    if(arguments.length) this.setValue(nameDescription,addisionalProp);
}
/** ユーザ情報のパーサ
 *    @params {String} nameDescription
 *    @params {Object} addisionalProp
 */
nas.UserInfo.prototype.setValue = function (nameDescription,addisionalProp){
//追加プロパティを引数として与える場合は、第二引数をオブエジェクトで {props:value}
//パーサが受け取ったプロパティは、コンストラクターに渡す前に分離して引数で与えること
    if((arguments.length>1)&&(arguments[1] instanceof Object)){
        for(var prop in arguments[1]) this[prop] = arguments[1][prop];
    };
    if((typeof nameDescription == 'undefined')||(! nameDescription)){
    	nameDescription = '';
    }else if(nameDescription instanceof nas.UserInfo){
		for(var prp in nameDescription){if(this.hasOwnProperty(prp)) this[prp] = nameDescription[prp];};
        return this;//複製
    }else if(typeof nameDescription != 'string'){
		if(nameDescription instanceof Array){
    		nameDescription = nameDescription.join(":");
    	}else{
    		nameDescription = JSON.stringify(nameDescription);
    	};
    };//文字列化
	if(nameDescription.match(/^\s*\{.*\}\s*$/)){
		var props = nameDescription = JSON.parse(nameDescription);
		for(var prp in props){if(this.hasOwnProperty(prp)) this[prp] = props[prp];};
		return this;//複製
	}else if(nameDescription.match(/^\s*\[.*\]\s*$/)){
		nameDescription = JSON.parse(nameDescription).join(":");
	};
    if(String(nameDescription).match(/^\s*$|^:$/)){
        this.handle = null;
        this.email  = null;
    }else if (nameDescription.indexOf(':') < 0){
//セパレータなし
        if(nameDescription.indexOf('@') < 1){
            this.handle = nameDescription;//メールアドレスでないと思われるので引数全体をハンドルにする
            this.email  = null;
        }else{
            this.handle = nameDescription.split('@')[0];//メールアドレスっぽいので＠から前をハンドルにする
            this.email  = nameDescription;
        };
    }else{
//セパレータあり
        var infoArray  = nameDescription.split(':');
        this.handle     = infoArray[0];
        this.email      = infoArray[1];
    }
    if(String(this.email).match(/\s/)) this.email.replace(/\s/g,'');
    if(! this.id) this.id = nas.uuid();
	return this;
}
nas.UserInfo.prototype.parse = nas.UserInfo.prototype.setValue;
/*TEST
var A = new nas.UserInfo("handle:user@example.co.jp");
var B = new nas.UserInfo("handle");
var C = new nas.UserInfo("user@example.co.jp");
var D = new nas.UserInfo("ねこまたや:user@example.com");
var E = new nas.UserInfo({"handle":"ねこまたや","email":"user@example.com"});
var F = new nas.UserInfo('{"handle":"ねこまたや","email":"user@example.com"}');
var G = new nas.UserInfo(["ねこまたや","user@example.com"]);
var H = new nas.UserInfo('["ねこまたや","user@example.com"]');
var I = new nas.UserInfo(A);
console.log([A,B,C,D,E,F,G,J,I]);
*/
/**
 * @params {String} opt
 *    出力フォーマット指定オプション<br />
 * キーワード"JSON"|"text"|"dump" または  プロパティ名"handle"|"email"|(追加された任意のプロパティ)
 * opt未指定の場合は、標準のユーザ記述文字列(handle)を戻す
 *  @returns {String}
 JSON   {}
 text   handle:uid:{additional property}
 dump   [handle,uid,{additional property}]
 */
nas.UserInfo.prototype.toString = function(opt){
    if(! opt) opt = 'handle';
    switch (opt){
    case 'JSON':
        return JSON.stringify(this);
    break;
    case 'full':
    case 'full-dump':
    case 'dump':
        var form='dump';
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
    case '':
        var form='text';
    break;
    default:
        if(this[opt]) return this[opt];
    };
    var additionalOpt={};
    var additionalCount=0;
    for (var prp in this){
        if((prp=='handle')||(prp=='email')||(this[prp] instanceof Function)) continue;
        additionalOpt[prp]=this[prp];
        additionalCount++;
    };
    if(form == 'dump'){
        if(additionalCount) return JSON.stringify([this.handle,this.email,additionalOpt]);
        return JSON.stringify([this.handle,this.email]);
    }else if(form == 'text'){
        if(additionalCount) return [this.handle,this.email,nas.IdfEncode(JSON.stringify(additionalOpt))].join(':');
        return [this.handle,this.email].join(':');        
    }else{
        var result = ((this.handle)? this.handle:"");
        if(this.email) result += ':' + ((this.email)? this.email:"");
        return result;
    };
};
/**
 *    ユーザ情報の同値判定
 *  @params {Object nas.UserInfo|String} myName
 *  比較用のユーザオブジェクト　または　ユーザ記述文字列
 *    e-mailがある場合はハンドルが異なっていても同じアカウントとする
 *    e-mailのない場合はハンドルのみで同値判断をする
 *  @returns {boolean}
 */
nas.UserInfo.prototype.sameAs = function(myName){
    if(!(myName instanceof nas.UserInfo)){ myName = new nas.UserInfo(myName)};
    if(! this.handle) return false;
    return (
        (((this.email)&&(myName.email))&&(this.email==myName.email))||
        (((!(this.email))||(!(myName.email)))&&(this.handle==myName.handle))
    )? true:false;
}
/*test
    A=new nas.UserInfo("123:");
    B=new nas.UserInfo("123:123@99123.com");
    A.sameAs(B);
*/
/**
 *    nas.UserInfo　オブジェクトコレクション
 *  @constractor
 *  @class
 *    コレクションする要素は、nas.UserInfoオブジェクト
 *    引数にオブジェクトまたはユーザ記述文字列の配列を与えて初期化可能
 *    直接操作する場合は必ずオブジェクトで与えること
 *    不正メンバーはコレクション対象外
 *    空コレクションをつくる際は引数で空配列を渡すこと
 *  @params {Array of nas.UserInfo} users
 *  @params {Object nas.Pm.PmDomain} parent
 */
nas.UserInfoCollection = function (users,parent){
    this.members   = [];
    this.timestamp = new Date().getTime();
    this.parent    = parent;//optional
    this.unique    = {global:["id","email","token"]};
    if(users instanceof Array){
        for (var j = 0;j<users.length;j++){
            if (!(users[j] instanceof nas.UserInfo)){
                users[j]= new nas.UserInfo(String(users[j]));
            }
            if(users[j].handle) this.members.push(users[j]);
        }
    }
    if((this.parent )&&(this.parent instanceof nas.Pm.PmDomain)) this.parent.contents.add('users');
}
    /**
     *    コレクションメンバーをユーザ記述文字列の配列に変換
     *  @returns　{Array of String}
     */
    nas.UserInfoCollection.prototype.convertStringArray = function(){
        var resultArray =[];
        for (var i = 0;i<this.members.length;i++){ resultArray.push(this.members[i].toString());}
        return resultArray;
    }
    /**
     *   コレクションメンバーを検索してインデックスを返す
     *   発見できなかった場合は -1
     *   引数がハンドルのみであった場合もハンドルの一致でインデックスを返す
     *   その場合先に一致したハンドルが返されるので希望のデータではない可能性があるので注意
     *  @params {Object nas.UserInfo|String} searchUser
     */
    nas.UserInfoCollection.prototype.userIndexOf = function(searchUser){
        if (this.members.length == 0) return -1;
        for (var i = 0;i<this.members.length;i++){
            if(this.members[i].sameAs(searchUser)) return i;
        }
        return -1;
    }
    /**
     *   コレクションメンバーを検索してその値を返す
     *   発見できなかった場合は null
     *   引数がハンドルのみであった場合もハンドルの一致でインデックスを返す
     *   その場合先に一致したハンドルが返されるので希望のデータではない可能性があるので注意
     *  @params {Object nas.UserInfo|String} searchUser
     */
    nas.UserInfoCollection.prototype.entry = function(keyword,region){
        if(keyword=='%default%'){
            if(this.active){
                return this.members[this.active];
            }else{
                return this.members[0];
            }
        }
    //メンバー総当たり
//return this.members.find(function(elm){elm.sameAs(keyword)});
        for (var mix = 0 ; mix < this.members.length ; mix ++){
            if(this.members[mix].sameAs(keyword)) return this.members[mix];
        }
        return null;
    }

    /**
     *   コレクションにメンバーを追加する。既存のメンバーは追加されない。戻り値はメンバーのインデックス
     *   配列引数渡しNG
     *   不正メンバーは追加されない。その場合の戻り値は -1
     *  @params {Object nas.UserInfo|String} newMember
     */
    nas.UserInfoCollection.prototype.addMember = function(newMember){
        if (!(newMember instanceof nas.UserInfo)){
//console.log(typeof newMember);
            if(newMember.match(/^(.+)\:(\{[^\{\}]+\}$)/)){
                var additionalOpt=JSON.parse(RegExp.$2);
                newMember = new nas.UserInfo(RegExp.$1,additionalOpt);
            }else{
                newMember = new nas.UserInfo(newMember);
            }
        }
        if (! newMember.handle) return -1;
        var iX = this.userIndexOf(newMember);
        if ( iX < 0 ) {this.members.push(newMember);return (this.members.length-1);}else{return iX;}
    }
    /**
     *   userストリームをtext出力
     *   @params {String} form
     *   出力形式指定文字列 "full"|"dump"|"plain"|"text"|"JSON"
     *   引数無しでカンマ区切りリスト("csv")
     *   @returns {String} 
     */
    nas.UserInfoCollection.prototype.dump=function(form){
        switch(form){
        case    'JSON':
            return JSON.stringify(this.members);break;
        case    'full-dump':
        case    'full':
        case    'dump':
                var resultArray=[];
            for (var ix=0 ; ix < this.members.length ;ix ++){ resultArray.push(this.members[ix].toString(form)) };
            return resultArray.join('\n');break;
        case    'plain-text':
        case    'plain':
        case    'text':
                var resultArray=[];
            for (var ix=0 ; ix < this.members.length ;ix ++){ resultArray.push(this.members[ix].toString(form)) };
            return resultArray.join('\n');break;
        default:
            return this.members.toString();
        }
    }
    /**
     *   userストリームを引数にしてCollectionの内容をすべて入れ替える
     *   ストリームの形式は "plain-text" または "full-dump" または  "JSON"を自動判別
     *   引数が空の場合は、何も操作せずに戻る
     *  @params {String} dataStream
     */
    nas.UserInfoCollection.prototype.parseConfig=function(dataStream){
console.log(dataStream);
        if(dataStream.length==0) return false;
        this.members.length = 0;
        if((this.parent)&&(this.parent instanceof nas.Pm.PmDomain)) this.parent.contents.add('users');
        var form = 'plain-text';
        if(dataStream.match(/^\s*\[\s*\{/)){
            form = 'JSON';
        }else if(dataStream.match(/\[[^\[\]]+\]/)){
            form = 'full-dump';
        };
        switch (form){
            case 'JSON':
                var tempData = JSON.parse(dataStream);
                for(var ix = 0;ix<tempData.length;ix++){
                    if(tempData[ix].timestamp){
                        this.timestamp = tempData[ix].timestamp ;
                        continue ;
                    }
                    var optProp ={};var hasOpt=false;
                    for(var prp in tempData[ix]){
                        if((prp == 'handle')||(prp == 'email')) continue;
                        hasOpt=true;
                        optProp[prp] = tempData[ix][prp];
                    }
                    if(hasOpt){
                        this.addMember(new nas.UserInfo([tempData[ix].handle,tempData[ix].email].join(':'),optProp));
                    }else{
                        this.addMember(new nas.UserInfo(tempData[ix].handle+':'+tempData[ix].email));
                    }
                }
            break;
            case 'full-dump':
                var tempData = dataStream.split('\n');
                for(var ix = 0;ix<tempData.length;ix++){
                    if(tempData[ix].length==0) continue;//空行スキップ
                    var newEntry = JSON.parse(tempData[ix]);
                    if(newEntry.length > 2){
                        this.addMember(new nas.UserInfo([newEntry[0],newEntry[1]].join(':'),newEntry[2]));
                    }else{
                        this.addMember(new nas.UserInfo([newEntry[0],newEntry[1]].join(':')));
                    }
                }
            break;
            case 'plain-text':
            default:
                var tempData = dataStream.split('\n');
                for(var ix = 0;ix<tempData.length;ix++){
                    if((tempData[ix].indexOf("#")==0)||(tempData[ix].length==0)) continue;//コメント/空行スキップ
                    this.addMember(tempData[ix]);
                }
            break;
        }        
    }

/*test
A = new nas.UserInfo("A123:123@23456");
B = new nas.UserInfo("B123@4567");
C = new nas.UserInfo("C123");
D = new nas.UserInfo("D123:123@23456");
E = new nas.UserInfoCollection([A,B,C,"kiyo@nekomataya.info"]);

E.addMember(D);
console.log(E.addMember(D));
console.log(E.addMember(new nas.UserInfo()));

console.log(E);
*/
/**
 * @class @constractor
 *    署名情報オブジェクト
 *      node 署名が配されるオブジェクトの識別情報・ラインID//ステージ名:ID//ジョブ記述
 *      自由表示テキストを指定可能
 *      ユーザ情報(ハンドル、メールアドレス、またはフルフォーマットのUserInfo文字列)
 *      追加情報(スタンプ等に利用 JSON)
 *   eg. 
 * @params {String|Object nas.UserSignature} sigDescription
 *         ノード記述文字列 署名をグループ化するためのキー 省略不可 またはシグネチャ記述・シグネチャオブジェクト
 * @params {String} signatureString
 *         署名テキスト(省略可　省略時はユーザハンドルで代用)
 * @params {Object} additionalProperty
 *         追加プロパティ プロパティ名を与えてJSON文字列で指定
 *         スタンプに利用
 *  第一引数にシグネチャ記述文字列　または参照オブジェクトでも良い
 eg.
 	new nas.UserSignature(
 		"原画:2",
 		"[UP 2023.12.14 kiyo]",
 		{
 			stamp:'http://www.nekomataya.info/images/stamp.jpg'
 		}
 	);
 	new nas.UserSignature(
 		"原画:2 [UP 2023.12.14 kiyo@nekomataya.info {}]",
 		'第一引数に全情報がある場合は第二引数は無効',
 		{
 			stamp:"http://www.nekomataya.info/images/stamp.png",
 			id:'ae475a53-a8c6-4414-9232-115c44900e61'
 		}
 	);
 	new nas.UserSignature("原画:2 [UP 2023.12.14 kiyo]");
 	new nas.UserSignature("原画:2 <OK 2023.12.14 kiyo>");
 	new nas.UserSignature("原画:2 >NG 2023.12.14 kiyo<");
 	new nas.UserSignature("原画:2 (SC 2023.12.14 kiyo)");

 */
nas.UserSignature = function UserSignature(sigDescription,signatureString,additionalProperty){
    this.id     = nas.uuid()       ;//unique id
    this.parent = null             ;//prent collection
    this.node   = ''               ;//String nodeDescription|name of stage
    this.text   = ''               ;//signature text
    this.date   = new Date()       ;//date of shign
    this.user   = nas.CURRENTUSER  ;//signed user | userstring
    this.status = 'up'             ;//up|ok|ng|sc 4kind 0,1,2,3
    this.stamp  = null             ;//stamp image optional URL

    if(arguments.length) this.setValue(sigDescription,signatureString,additionalProperty);
};
/** 署名情報パーサ
 * @params {String|Object nas.UserSignature} sigDescription
 *         ステージ文字列 署名をグループ化するためのキー 省略不可 またはシグネチャ記述・シグネチャオブジェクト
 * @params {String} signatureString
 *         署名テキスト(省略可　省略時はユーザハンドルで代用)
 * @params {Object} additionalProperty
 *         追加プロパティ プロパティ名を与えてJSON文字列で指定
 *         スタンプに利用
 * @returns {Object}
 *        署名オブジェクトを返す
 */
nas.UserSignature.prototype.setValue = function(sigDescription,signatureString,additionalProperty){
console.log(arguments)
    if(
    	(sigDescription instanceof nas.UserSignature)||
    	((typeof sigDescription == 'object')&&(Object.keys(sigDescription).length > 0))
    ){
//引数としてシグネチャ|参照オブジェクトが与えられた場合は、id,job,日付 以外を複製する
		for (var prp in sigDescription){
//			if(prp.match(/id|node|date/)) continue;
			if((this[prp])&&(typeof this[prp].setValue == 'function')){
				this[prp].setValue(sigDescription[prp]);
			}else{
				this[prp] = sigDescription[prp];
			};
		};
		return this;
	}else if(typeof sigDescription == 'string'){
//第一引数がテキスト記述
		if(sigDescription.match(/^\s*\{.*\}\s*$/)){
//JSON 日付含めてすべて適用する
			var props = JSON.parse(sigDescription);
			for ( var prp in props){
				if((this[prp])&&(typeof this[prp].setValue == 'function')){
					this[prp].setValue(props[prp]);
				}else if(prp == 'date'){
					this[prp] = new Date(props[prp]);
				}else{
					this[prp] = props[prp];
				};
			};
			return this;
		}else if(sigDescription.match(/^(.+\:.+)\s*(\[.+\]|\(.+\)|\<.+\>|\>.+\<)$/)){
console.log('全記述')
//第１引数に全記述がある場合は分離して再パース 第２引数は無視
console.log(RegExp.$1,RegExp.$2,additionalProperty);
			return this.setValue(RegExp.$1,RegExp.$2,additionalProperty);
		}else if((typeof signatureString == 'string')&&(signatureString.match(/^\s*(\[.+\]|\(.+\)|\<.+\>|\>.+\<)\s*$/))){
console.log('分離記述')
//分離記述
			var sigDescriptions = signatureString.trim().replace(/[\[\]\(\)\<\>]/g,"").replace(/\s+/g," ").split(" ");
			var statusId = ['[','<','>','('].indexOf(signatureString.trim()[0]);
console.log(statusId);
			if( statusId >= 0)this.status = ['up','ok','ng','sc'][statusId];
//			sigDescriptions = RegExp.$1.split(':');
			this.node  = sigDescription;
			this.text  = (sigDescriptions[0])? sigDescriptions[0]:"";
			this.date  = new Date(sigDescriptions[1])               ;//記録データをパースする場合のみ上書き
			this.user  = new nas.UserInfo(sigDescriptions[2])       ;
			if((sigDescriptions[3])&&(sigDescriptions[3].match(/^\{.*\}$/))){
				var props = JSON.parse(sigDescriptions[3]);
				if(props.stamp) this.stamp = props.stamp;
				if(props.id)    this.id    = props.id;
			};
		};
	};
	if(typeof additionalProperty == 'object'){
		for(var prp in additionalProperty) this[prp] = additionalProperty[prp];
	};
	return this;
};
nas.UserSignature.prototype.parse = nas.UserSignature.prototype.setValue;
/**
 *  JSON出力用フィルタ
 */
nas.UserSignature.prototype.toJSON = function(opt){
        return {
        	"node" :this.node,
        	"text" :this.text,
        	"date" :this.date.toNASString(),
        	"user" :this.user.toString('name'),
        	"stamp":(this.stamp)?JSON.parse(this.stamp.toString('JSON')):null,
            "status":this.status
        };
}
/**
 * @params {String} opt
 *    出力フォーマット指定オプション<br />
 * キーワード"JSON"|"text"|"dump"
 *  @returns {String}
 JSON   {}
 text   handle:uid:{additional property}
 dump   [handle,uid,{additional property}]
 */
nas.UserSignature.prototype.toString = function(opt){
    if(! opt) opt = 'dump';
    var prefix  = {"up":"[","ok":"<","ng":">","sc":"("};//
    var postfix = {"up":"]","ok":">","ng":"<","sc":")"};//
    switch (opt){
    case 'JSON':
//データ交換形式
        return JSON.stringify({
        	"node"  :this.node,
        	"text"  :this.text,
        	"date"  :this.date.toNASString(),
        	"user"  :this.user.toString('name'),
        	"stamp" :(this.stamp)?JSON.parse(this.stamp.toString('JSON')):null,
            "status":this.status
        });
    break;
    case 'full':
    case 'full-dump':
    case 'dump':
//タイムシートデータの記録欄で使用する形式
        return prefix[this.status] + [
        	this.text,
        	this.date.toNASString(),
        	this.user.toString('name'),
        	(this.stamp)? this.stamp.toString('JSON'):""
        	].join("\t")+postfix[this.status];
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
    default:
//タイムシートのメモ欄に流し込む参照形式（サブセット）
        return prefix[this.status] + [
        	this.text,
        	this.date.toNASString('yy/mm/dd'),
        	this.user.toString('name'),
        	].join("\t")+postfix[this.status];
    };
};
/*
	作業チェックアウト
ライン	0:	(本線)
ステージ	2:	原画
ジョブ	2:	原画演出検査


作業終了の署名をして「原画演出検査」を終了しますか？

[取消] [サイン][カスタムスタンプ]
	┌───┐	
	│ICN│	
	└───┘	
	kiyo	
CT: 09/10	
					」
チェックアウト後は他のスタッフが作業を開始できるようになります
*/
/**
 *  @params {String} stage
 *  @params {String} template
 *  @returns {String}
 *	nas.UserSigunatureをHTMLに変換する追加メソッド
 *	標準外のテンプレートを使用する場合は、文字列引数として渡す
 */
nas.UserSignature.prototype.toHTML = function(stage,template){
	if(! template) template = "\t<span class='signbox' id='sig_%1' onclick='xUI.showSignatueInfo(%1)'>\n\t\t<span class = signlabel>%2 </span>\n\t\t<span class = 'signature %3 ' title = '%6'>\n\t\t%4 <br>%7<span class=signdate>%5 </span>\n\t\t</span>\n\t</span>\n";

	var HTML_TEMPLATE = "\t<span class='signbox' id='sig_%1' onclick='xUI.showSignatueInfo(%1)'>\n\t\t<span class = signlabel>%2 </span>\n\t\t<span class = 'signature %3 ' title = '%6'>\n\t\t%4 <br>%7<span class=signdate>%5 </span>\n\t\t</span>\n\t</span>\n";

	var status = this.status;
	var stamp  = "";
	if(this.stamp){
		status = 'box';
		stamp  = '<img class=sigunature-stamp src ="'+this.stamp+'">'
	};
	return (nas.localize(template,
		(this.parent)? String(this.parent.members.indexOf(this)):this.id,
		(stage)? this.node.split(':')[0]:".",
		'signature-'+status,
		(this.text)?(this.text.slice(0,3)):this.user.handle,
		this.date.toNASString('mm/dd'),
		this.toString('full'),
		stamp
	));//
/* 
	nas.localize(template,
		%1:"INDEX" signature index Number Int,
		%2:"STAGE" stage name|index ,
		%3:"CLASS" className,
		%4:"TEXT"  sigunature note (or user handle),
		%5:"DATE"  date of sign,
		%6:"TITLE" description (if exists),
		%7:"STAMP" stamp image url (if exists)
	);// */
};
/*test
    var A = new nas.UserSignature("123:[OK	2022.01.01	kiyo@nekomataya.info]");
    var B = new nas.UserSignature("123","[OK	2022.01.01	kiyo@nekomataya.info]");
*/
/**
	@params {Number} id
 シグネチャボックスの情報をモーダル表示
テスト用関数を後付で拡張
 */
nas.UserSignature.prototype.showSignatueInfo = function showSignatueInfo(id){
	if(this.parent){
		var infoMsg = JSON.stringify(this,0,2);
		var dialogTitle = localize({ja:'署名詳細',us:'Signature Details'});
		nas.HTML.showModalDialog('alert',infoMsg,dialogTitle);
	};
};
/*TEST
var stream = `
CT:0
	[	2022.01.23	kiyo:kiyo@nekomataya.info]
	(composite	2022.01.24	たぬき:tanuki@animal.example.com)
LO:1
	[-済-	2022.01.24	kiyo:kiyo@nekomataya.info]
	<監督OK	2022.01.25	鮒:funa@animal.example.com>
	<演出	2022.01.25	亀:kame@animal.example.com>
	(演出	2022.01.25	亀:kame@animal.example.com)
`;
xUI.XPS.signatures.parse(stream);

document.getElementById('signbox').innerHTML = xUI.XPS.signatures.toHTML();
//xUI.showSignatueInfo(1)
*/
/**
 *    nas.UserSignature　オブジェクトコレクション
 *  @constractor
 *  @class
 *    コレクションする要素は、nas.UserSignatureオブジェクト
 *    引数にオブジェクトまたはシグネチャ形式文字列の配列を与えて初期化可能
 *    直接操作する場合は必ずオブジェクトで与えること
 *    不正メンバーはコレクション対象外
 *    空コレクションをつくる際は引数で空配列を渡すこと
 *  @params {Array of nas.UserSignature|String} signature
 *  @params {Object nas.Xpst|nas.xMap|nas.StoryBoard} parent
 */
nas.UserSignatureCollection = function (signature,parent){
    this.members = [];
    this.parent  = parent;//optional parent document
    if(signature instanceof Array){
       signature.forEach(function(e){
           this.members.push(new nas.UserSignature(e));
       });
    };
}
    /**
     *    コレクションメンバーをステージ・日付でソート
     *  @returns　{Array of String}
     */
    nas.UserSignatureCollection.prototype.sort = function(){
        this.members.sort(function(a,b){return a.date - b.date;});
        this.members.sort(function(a,b){return a.stage - b.stage;});
        return this.members
    }

    /**
     *   コレクション最後尾にメンバーを追加する
     *   既存のメンバーは追加されない 戻り値はメンバーのインデックス
     *   追加の際にparentプロパティを設定
     *   配列引数渡しNG
     *   nas.UserSignature以外の不正メンバーは追加されない。その場合の戻り値は -1
     *  @params {Object nas.UserSignature|String} newMember
     */
    nas.UserSignatureCollection.prototype.push = function(newMember){
        if (newMember instanceof nas.UserSignature){
                newMember = new nas.UserSignature(newMember);
        };
        if (! newMember) return -1;
        this.members.push(newMember);
        newMember.parent = this;
        return this.members.length - 1;
    }
    /**
     *   JSON出力フィルタ
     *   @returns {Object} 
     */
    nas.UserSignatureCollection.prototype.toJSON=function(){
        return this.members;
    }
    /**
     *   signatureストリームをtext出力
     *   @params {String} form
     *   出力形式指定文字列 "full"|"dump"|"plain"|"text"|"JSON"
     *   引数無しでカンマ区切りリスト("csv")
     *   @returns {String} 
     */
    nas.UserSignatureCollection.prototype.dump=function(form){
        switch(form){
        case    'JSON':
            return JSON.stringify(this.members);break;
        case    'full-dump':
        case    'full':
        case    'dump':
        case    'plain-text':
        case    'plain':
        case    'text':
                var resultArray  = [];
                var currentStage = this.members[0].node.toString();
                resultArray.push(currentStage);
            for (var ix=0 ; ix < this.members.length ;ix ++){
                if(currentStage != this.members[ix].node.toString()){
                    currentStage = this.members[ix].node.toString();
                    resultArray.push(currentStage);
                };
                resultArray.push("\t" + this.members[ix].toString(form));
            };
            return resultArray.join('\n');
        break;
        default:
            return this.members.toString();
        };
    }
    /**
     *   signatureストリームを引数にしてCollectionの内容をすべて入れ替える
     *   ストリームの形式は "plain-text" または "full-dump" または  "JSON"を自動判別
     *   引数が空の場合は、何も操作せずに戻る
     *  @params {String} dataStream
     */
    nas.UserSignatureCollection.prototype.parse=function(dataStream){
console.log(dataStream)
        if(dataStream.length==0) return false;
        this.members.length = 0;
        var form = 'plain-text';
        if(dataStream.match(/^\s*\[\s*\{/)){
            form = 'JSON';
        };
        switch (form){
        case 'JSON':
            var tempData = JSON.parse(dataStream);
            var currentStage = tempData[0].stage;
            for(var ix = 0;ix<tempData.length;ix++){
                this.push(new nas.UserSignature(tempData[ix]));
            };
        break;
        default:
            var tempData = dataStream.split('\n');
            var currentStage = "";//ステージ（ノード）初期値はpmdbから取る
            for(var ix = 0;ix<tempData.length;ix++){
                if(tempData[ix].length == 0) continue;//空行スキップ
                if(tempData[ix].trim().match(/^[^\[\]\(\)\<\>]+\:/)){
                    currentStage = tempData[ix];
                    if((nas.Pm)&&(nas.Pm.ManagementStage)){
                        currentStage = new nas.Pm.ManagementStage(tempData[ix]);
                    }else if((nas.Xps)&&(nas.Xps.XpsStage)){
                        currentStage = new nas.Xps.XpsStage(tempData[ix]);
                    }else if(XpsStage){
                        currentStage = new XpsStage(tempData[ix]);
                    };
console.log(currentStage);
                }else if(tempData[ix].match(/^\s*(\[.*\]|\(.+\)|\<.+\>|\>.+\<)\s*$/)){
console.log(currentStage.toString(),tempData[ix].trim());
                    this.push(new nas.UserSignature(currentStage.toString(),tempData[ix].trim()));
                };
            };
        };
    }
/**
	シグネチャコレクションをスタンプパレードに展開する
	末尾に空白のチェックイン｜アウト+スタンプ登録UIの呼び出しを設定する
 */
nas.UserSignatureCollection.prototype.toHTML = function(){
	var result       = "";
	var currentStage = "";
	this.members.forEach(function(e){
		if(e.node != currentStage){
			result += e.toHTML(true);
			currentStage = e.node;
		}else{
			result += e.toHTML(false);
		};
	});
/*スタンプパレード最後尾のエントリは,
    作業の開始｜中断｜終了 いずれかの操作に展開される
 */
	result +='\t<span class = signbox onclick=alert(123)>\n\t\t<span class = signlabel>.</span>\n\t\t<span class = signature></span>\n\t</span>';
	return result;
}
/*test
コレクションメソッド
remove
addMember(append)

var stream = `
CT:0
	[-済-	2022.01.23	kiyo:kiyo@nekomataya.info]
	[composite	2022.01.24	たぬき:tanuki@animal.example.com]
LO:1
	[-済-	2022.01.24	kiyo:kiyo@nekomataya.info]
	[監督OK	2022.01.25	鮒:funa@animal.example.com]
	[演出	2022.01.25	亀:kame@animal.example.com]
	[演出	2022.01.25	亀:kame@animal.example.com]
`;
var sig = new nas.UserSignatureCollection();
sig.parse(stream);
console.log(sig.toString('dump'));
*/


//UnitValuで利用可能な単位 px/pixels を与えるとその時点での基底解像度で処理してpointに換算、pxとしての保存は行わない
nas.UNITRegex=new RegExp('^(in|inches|mm|millimeters|cm|centimeters|pt|picas|points|mp|millipoints)$','i');

/*=============================================================================================再利用メソッド*/
//不正単位系の処理を追加  07-04 2016
/**
 * 単位つきの文字列値を数値にして返すメソッド
 * 単位デコーダ
 * nas.decodeUnit(入力値,変換単位)
 *
 * 解釈できる単位は millimeters mm centimeters cm points picas pt pixels px inches in
 * 戻し値の単位も同じく
 * デフォルトの単位は入りも戻しも pt
 * 不明な単位は ptとして扱う
 *
 * @params {String} myValue
 * @params {String} resultUnit
 * @params {String} resolution (px出力時のみ有効な解像度指定)
 * @returns {Number}
 */
nas.decodeUnit = function (myValue, resultUnit,resolution) {
    if ((myValue != undefined) && (myValue.match(/^([\+\-\.0-9]+)\s?(millimeters|mm|centimeters|cm|points|picas|pt|pixels|px|inches|in)?$/i))) {
        var baseValue = parseFloat(myValue);
        var myUnit = RegExp.$2;
    } else {
        return false;
    }
    var myResult;var reusltUnit;
//console.log(resultUnit);
    if((typeof resultUnit == 'undefined')||(!(String(resultUnit).match(/^(millimeters|mm|centimeters|cm|points|picas|pt|pixels|px|inches|in)?$/i)))) {
        resultUnit = "pt";
    }
    if (myUnit == resultUnit) {
        return baseValue
    }
    /**
     * 入出力単位が一致した場合はコンバート不要
     * すべてptに変換 (ここに誤差が乗る原因あり)
     */
    switch (myUnit) {
        case    "inches":
        case    "in":
            myValue = 72. * baseValue;
            break;
        case    "pixels":
        case    "px":
            myValue = 72. * baseValue / this.Dpi();
            break;
        case    "centimeters":
        case    "cm":
            myValue = 72. * baseValue / 2.54;
            break;
        case    "millimeters":
        case    "mm":
            myValue = 72. * baseValue / 25.4;
            break;
        case    "millipoints":
        case    "mp":
            myValue = baseValue / 1000.;
            break;
        case    "points":
        case    "paicas":
        case    "pt":
        default    :
            myValue = baseValue;
    }
    switch (resultUnit) {
        case    "inches":
        case    "in":
            myResult = myValue / 72.;
            break;
        case    "pixels":
        case    "px":
            var myResolution;
            if(resolution instanceof nas.UnitResolution){
                myResolution = resolution.as('ppi');
            }else{
                myResolution = (parseFloat(resolution))? parseFloat(resolution):this.Dpi();
            };
            myResult = myResolution * myValue / 72.;
            break;
        case    "centimeters":
        case    "cm":
            myResult = 2.54 * (myValue / 72.);
            break;
        case    "millimeters":
        case    "mm":
            myResult = 25.4 * (myValue / 72.);
            break;
        case    "millipoints":
        case    "mp":
            myResult = myValue * 1000.;
            break;
        case    "points":
        case    "paicas":
        case    "pt":
        default    :
            myResult = myValue;
    }
    return myResult;
};
/**
	common method
*/
nas.UNITString  = function(){return ([this.value,this.type]).join(' ');};
nas.UNITValue   = function(){return this.value;};
nas.UNITAs      = function(myUnit,resolution){return nas.decodeUnit(this.toString(),myUnit,resolution)};
nas.UNITConvert = function(myUnit){this.value=nas.decodeUnit(this.toString(),myUnit);this.type=myUnit;return this;};

nas.ANGLEAs	= function(myUnit){
		var targetUnit=(myUnit.match( /^(r|rad|radians)$/i ))?"radians":"degrees";
		if(targetUnit==this.type){
			return this.value
		}else{
			return (targetUnit=="degrees")? radiansToDegrees(this.value):degreesToRadians(this.value);
		}
	};
nas.ANGLEConvert=function(myUnit){
		var targetUnit=(myUnit.match( /^(r|rad|radians)$/i ))?"radians":"degrees";
		this.value=(targetUnit=="degrees")? radiansToDegrees(this.value):degreesToRadians(this.value);
		this.type=targetUnit;
		return this;
	};
nas.RESOLUTIONAs	=function(myUnit){
		var targetUnit=(myUnit.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))? RegExp.$1:'dpi';
		if(targetUnit.slice(1)==this.type.slice(1)){
			return this.value
		}else{
			return (targetUnit.indexOf('pc')<0)? this.value*2.540:this.value/2.540;
		}
	};
nas.RESOLUTIONConvert=function(myUnit){
		var targetUnit=(myUnit.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))? RegExp.$1:'dpi';
		this.value=(targetUnit.indexOf('pc')<0)? this.value*2.540:this.value/2.540;
		this.type=targetUnit;
		return this;
	};
nas._LISTString=function(myUnit){
		if(typeof myUnit == "undefined") myUnit = this.type;
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){
			if(this[this.props[myDim]]){
				if(this[this.props[myDim]].as instanceof Function){
					myResult.push(this[this.props[myDim]].as(myUnit) + myUnit);
				}else{
					myResult.push(this[this.props[myDim]].toString());
				};
			};
		};
		return myResult.join();//リスト文字列で
	};
nas._ARRAYValue	=function(myUnit){
		if(typeof myUnit == "undefined"){myUnit=this.type;}
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){
			if(this[this.props[myDim]]){
				if(this[this.props[myDim]].as instanceof Function){
					myResult.push(this[this.props[myDim]].as(myUnit))
				}else{
					myResult.push(this[this.props[myDim]].value)
				};
			};
		};
		return myResult;//配列で返す
	};
nas._JSONValue	=function(myUnit){
		if(typeof myUnit == "undefined"){myUnit=this.type;}
		var myResult={};
		for(var myDim=0;myDim<this.length;myDim++){
			if (this[this.props[myDim]]){
				if(this[this.props[myDim]].as instanceof Function){
					myResult[this.props[myDim]] = (this[this.props[myDim]].as(myUnit))+myUnit;
				}else{
					myResult[this.props[myDim]] = this[this.props[myDim]].toString();
				};
			};
		};
		return myResult;//Objectで返す
	};
/**
 *	@summary
 *  単位つきの長さを統一的に扱うクラス　単位間のコンバート機能を内包している<br />
 * Adobe ESTK 互換<br />
 *
 * @class
 *	@description
 * Adobe Extend Script の UnitValue クラスとメソッド互換の単位つき長さオブジェクト<br />
 * 第二引数で単位が指定されない場合は第一引数の単位を使用する<br />
 * 引数間で単位が異なる場合は第一引数の指定値を第二引数の単位へ変換してオブジェクト化する<br />
 * どちらも無効な場合は、第一引数の数値部分をpointで換算<br />
 * 未知の単位が与えられた場合は単位系を無効のまま数値のみで初期化して要求はptで代用する＜estk互換＞<br />
 * 無効な値で初期化された場合は値を0に設定する。＜estk互換＞<br />
 * 有効な単位は	in,inches,mm,millimeters,cm,centimeters,pt,picas,points,mp,millipoints
 *
 * 	@params {Number or String} numberString
 *  数値、単位つき数値文字列 or 数値文字列
 * 	@params {String} unitString
 *  単位 String 単位を文字列で  省略可
 * 
 * @example
 	A = new nas.UnitValue("123","mm")    ;//
 	B = new nas.UnitValue("-72pt","in")  ;//
 	C = new nas.UnitValue(25.4,"cm")     ;//
 	D = new nas.UnitValue("うさぎ",'カメ') ;// {value: 0, type: "pt"}
 	E = new nas.UnitValue('125 degree')  ;// {value: 0, type: "pt"}
 	F = new nas.UnitValue(A)             ;// {value: 123, type: "mm"}
 * 
 */
nas.UnitValue = function(numberString,unitString){
    this.value ;
    this.type  ;
//
    this.setValue(numberString,unitString);
}
/**
 * 引数をパースしてUnitValueのプロパティを設定するメソッド<br />
 * 初期化の際にもコールされる<br />
 * 	@params {Number or String | Object nas.UnitValue} myNumberString 数値、単位つき数値文字列 or 数値文字列
 * 	@params {String} myUnitString 単位 String 単位を文字列で  省略可
 *  @returns {nas.UnitValue} 値をセットされた nas.UnitValue 本体
 */
nas.UnitValue.prototype.setValue=function(myNumberString,myUnitString){
    if(myNumberString instanceof nas.UnitValue){
        this.value = myNumberString.value;
        this.type  = myNumberString.type;
        return this;
    };
    if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\+\-\.\s0-9]/g,'');
	}else{
		var myNumberUnit='';//第一引数が文字列以外単位なし
	};
	myNumberString = String(parseFloat(myNumberString));//単位を払って数値化
//例外処理 px,pixel 指定の場合は、現在の基準解像度でptに変換
    if(myNumberUnit.match(/^(px|pixels?)$/i)){
        this.value = nas.decodeUnit(myNumberString + 'px','pt');
        this.type  = 'pt';
        return this.convert(myUnitString);
    };
	if(typeof myUnitString == 'undefined') myUnitString = (myNumberUnit)? myNumberUnit:'pt';//指定単位がない場合は引数から得た単位を使用
	if((myUnitString) && !(myUnitString.match(nas.UNITRegex))) myUnitString = "pt";// 特定できない単位は pt とみなす
	this.value=(myNumberUnit=='')? parseFloat(myNumberString):nas.decodeUnit(myNumberString+myNumberUnit,myUnitString);
	if((! this.value)||(isNaN(this.value))){this.value=0.000000;}
	this.type=myUnitString;
	return this;
}
nas.UnitValue.prototype.parse = nas.UnitValue.prototype.setValue;
/**
 *  指定された単位文字列に変換した数値を返す
 *
 *  @params {String} 単位文字列
 *  @returns {Number} 指定単位系における値
 */
nas.UnitValue.prototype.as	= nas.UNITAs;
/**
 *  指定された単位文字列にオブジェクトを変換する
 * 
 *  @params {String} 単位文字列
 *  @returns {String} 変換後の単位付き数値文字列
 */
nas.UnitValue.prototype.convert	= nas.UNITConvert;
/**
 *  現在の単位文字列を付記した数値文字列を返す
 * 
 *  @params {String} 単位文字列
 *  @returns {String} 単位付き数値文字列
 */
nas.UnitValue.prototype.toString = nas.UNITString;
nas.UnitValue.prototype.toJSON   = nas.UNITString;
/**
 *  現在の単位系の値を返す　Object.valueに同じ
 *  
 *  @returns {Number} 値
 */
nas.UnitValue.prototype.valueOf = nas.UNITValue;

/*	test
	A=new nas.UnitValue("125","mm");//2引数初期化
	B=new nas.UnitValue("125mm","cm");//2引数初期化
	C=new nas.UnitValue("5in");//1引数初期化
	D=new nas.UnitValue(-123,"mm");//数値初期化
	E=new nas.UnitValue("たぬきさん","mm");//不正値初期化
	console.log(A);
	console.log(B);
	console.log(C);
	console.log(D);
	console.log(E);
	console.log("A+B = ",A+B);
	//これは誤った答えが戻る。が、使い方を誤っているのでそれで正常
	console.log(A.as("mm")+B.as("mm"));
	//確実な値が必要な場合は .as(単位)で値を求める
	//直接演算でUnitValeが戻ることは無い
	
 */
/**	nas.UnitAngle
コンストラクタ	nas.UnitAngle("値"[,"単位"])
引数:
	値	Number or String 単位付き数値または数値
	単位	 String 単位文字列省略可能

使用可能な値は  /^(d|degrees|°|度|r|rad|radians)$/)
指定値以外または単位なしで初期化された場合は degrees
単位変換機能付き
例:	A=new nas.UnitAngle("180 degrees","radians");//	180度相当の値がラディアンで格納される
	A=new nas.UnitAngle(1);//1 deg
	A=new nas.UnitAngle("27.4 d");//27.4 degrees  として格納

オブジェクトメソッド:
nas.UnitAngle.as("単位文字列")	指定された単位文字列に変換した数値を返す
nas.UnitAngle.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す
*/
nas.UnitAngle = function(numberString,unitString){
	this.type  = 'degrees';
	this.value = 0 ;
	this.setValue(numberString,unitString);
}
/** 角度オブジェクトの値を更新
	@params {String+Number|Object nas.UnitAngle} myNumberString
	@params {String}	myUnitString
 */
nas.UnitAngle.prototype.setValue = function(myNumberString,myUnitString){
	if(myNumberString instanceof nas.UnitAngle) myNumberString = myNumberString.toString();
	var myNumberUnit = '';
	if(! myUnitString) myUnitString='';
	if((myNumberString)&&(String(myNumberString).match(/(d|deg|degrees|°|度)|(r|rad|radians)/i))){
		myNumberUnit = (RegExp.$2)? "radians":"degrees";
	};
	if((myUnitString)&&(String(myUnitString).match(/(d|deg|degrees|°|度)|(r|rad|radians)/i))){
	    myUnitString = (RegExp.$2)? "radians":"degrees";
	};
	if (myUnitString == '' ){
	    myUnitString = ( myNumberUnit == '' )? 'degrees':myNumberUnit;
	};
	if ( myNumberUnit == '' ) myNumberUnit = myUnitString;
	this.type  = myUnitString;
	this.value = (myUnitString == myNumberUnit)? parseFloat(myNumberString):(
	    (myUnitString=="degrees")?
	        nas.radiansToDegrees(parseFloat(myNumberString)):
	        nas.degreesToRadians(parseFloat(myNumberString))
	    )
	if(isNaN(this.value)){this.value=0.000000;}
}
nas.UnitAngle.prototype.parse    = nas.UnitAngle.prototype.setValue;
nas.UnitAngle.prototype.as       = nas.ANGLEAs;
nas.UnitAngle.prototype.convert  = nas.ANGLEConvert
nas.UnitAngle.prototype.toString = nas.UNITString;
nas.UnitAngle.prototype.valueOf  = nas.UNITValue;
/*
	nas.UnitResolution Object
コンストラクタ  単位付き解像度オブジェクト
	new nas.UnitResolution("解像度"[,"単位"])

引数:	解像度  String or Number 単位付き文字列または数値
	単位	String	単位を文字列で
	双方が異なっていれば指定単位に換算
	指定可能な単位は (/dpi|ppi|lpi|dpc|ppc|lpc/i)  実質は2種  デフォルトは dpc
	無効値で初期化された場合は  72dpi相当の密度に設定する(nas標準値か？)
	値0はどの単位系でも発散が起きるのでダメ  これも値を矯正する

例:	new Resolution('120dpi','dpc');
	new Resolution( 50,'dpc');
	new Resolution('200 dpi');

オブジェクトメソッド:
nas.UnitResolution.as("単位文字列")	指定された単位文字列に変換した数値を返す
nas.UnitResolution.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す

*/
nas.UnitResolution=function(numberString,unitString){
    this.value = 96    ;//Number Float
    this.type  = 'ppi' ;//String dpi|dpc|lpi|lpc|ppi|ppc
//
    if(arguments.length) this.setValue(numberString,unitString);
};
nas.UnitResolution.prototype.setValue = function(myNumberString,myUnitString){
	if(myNumberString instanceof nas.UnitResolution) myNumberString = myNumberString.toString();
	var myNumberUnit='';
	if((myNumberString)&&(String(myNumberString).match(/([dpl]p[ci])/i))){
		myNumberUnit=RegExp.$1;
	};
	if((myUnitString)&&(String(myUnitString).match(/([dpl]p[ci])/i))){
	    myUnitString = RegExp.$1;
	}else{
	    myUnitString = '';
	}
	if (myUnitString == '' ){
	    myUnitString = ( myNumberUnit == '' )? 'dpc':myNumberUnit;
	}
	if ( myNumberUnit == '' ) myNumberUnit = myUnitString;
	this.type  = myUnitString;
	this.value = (myUnitString==myNumberUnit)?
	    parseFloat(myNumberString):(	    
	    (myUnitString.indexOf('pc')< 0)?
	        parseFloat(myNumberString)*2.540:
	        parseFloat(myNumberString)/2.540
	    );
	if((isNaN(this.value))||(this.value<=0)){
//	    this.value=(myUnitString.indexOf('pc')<0)?nas.RESOLUTION.as()*2.540:nas.RESOLUTION;
        if((nas.RESOLUTION)&&(nas.RESOLUTION instanceof nas.UnitResolution)){
	        this.value = nas.RESOLUTION.as(myUnitString);
	    }else{
	        this.value = (myUnitString.indexOf('pc')< 0)? 96 :96/2.540;
	    };
	};
}
nas.UnitResolution.prototype.parse      = nas.UnitResolution.prototype.setValue;
nas.UnitResolution.prototype.as         = nas.RESOLUTIONAs;
nas.UnitResolution.prototype.convert    = nas.RESOLUTIONConvert;
nas.UnitResolution.prototype.toString   = nas.UNITString;
nas.UnitResolution.prototype.valueOf    = nas.UNITValue;
/*================================  以下は単位付き数値オブジェクトを要素に持つ複合オブジェクト===============*/
/** 解像度トレーラ
３次元までの解像度を保持する解像度オブジェクト
コンストラクタ
	new nas.Resolution(x[,y[,z]])
引数は
	UnitResolution	/	x,y,z-resolution


	TimingCurve	/	timing	
引数がない場合は単位"ppc"で 72ppi相当の 1次元のオブジェクトを初期化

コンストラクタでタイミングカーブを初期化する必要は無い
また、タイミングカーブを扱う局面は少ない。

Resolution オブジェクトはUnitResolutionを中核データとしたデータ密度を扱うオブジェクト
単一の値で初期化された場合はすべてのプロパティを同じ値で初期化する
lunegthの値に従って文字列、配列の出力は変化するが
個別プロパティを請求した場合は、x,y,zのそれぞれで値を得ることができる


Resolution
	.x(x-resolution)
	.y(y-resolution)
	.z(z-resolution)
Resolution Object出力書式
form1:
    dim1
        144ppi
    dim1
        144ppi,144dpi
    dim1
        144ppi,144dpi,144dpi
form2:
    dim1
        resolution = 144ppi
    dim2
        resolution.X = 144ppi
        resolution.Y = 144ppi
    dim3
        resolution.X = 144ppi
        resolution.Y = 144ppi
        resolution.Z = 144ppi
*/
nas.Resolution=function(){
/*
	this.props = ['x','y','z',];
	this.x = new nas.UnitResolution('72ppi');
	this.y = new nas.UnitResolution('72ppi');
	this.z;
	this.length = 1;
	this.type="dpc";
*/
//---------------------------------------------------------------
	if(arguments.length==0){
		var args = [new nas.UnitResolution("72 ppi","dpc")];
	    this.length = 1;
	}else{
        var args = Array.prototype.slice.call(arguments)
	    this.length=arguments.length;//DimensionLength 1~3
	}
	this.props=["x","y","z"];
	this.x  =new nas.UnitResolution(args[0]);

    this.type = this.x.type;//第一引数の単位で統一

	this.y  =(args[1])? new nas.UnitResolution(args[1],this.type):this.x;
	this.z  =(args[2])? new nas.UnitResolution(args[2],this.type):this.x;

	this.toString=function(opt){
    		var myResult=[];
	    if(! opt){
	        if(this.length==1) return this.x.toString();
	    	for(var myDim=0;myDim<this.length;myDim++){
		        myResult.push(this[this.props[myDim]].toString())
		    }
		    return myResult.join(",");
		}else{
		    if(this.length==1) return "\tresolution = "+this.x.toString();
	    	for(var myDim=0;myDim<this.length;myDim++){
		        myResult.push("\tresolution."+this.props[myDim] +" = "+this[this.props[myDim]].toString());
		    }
		    return myResult.join("\n");
		}
	};
	this.valueOf=function(asUnit){
		if(typeof asUnit == 'undefined') asUnit=this.type;
		if(this.length==1) return this.x.as(asUnit);
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){myResult.push(this[this.props[myDim]].as(asUnit))}
		return myResult;
	};
}
/*
	座標オブジェクト
コンストラクタ:
	new nas.Point(x[,y[,z]])
1次元、2次元、3次元の値が初期化可能
引数は UnitValueまたは文字列で

第一引数の持つ単位を、代表単位として保存するが、オブジェクトの生成後に他の単位を設定することが可能

または
	new nas.Point(nas.Point)
第一引数がnas.Point  オブジェクトだった場合は、そのオブジェクトの複製を初期化する

または
	new nas.Point(値リスト/配列[,単位])
値リストでの初期化も可能  多くの実装で配列形式の座標を扱うので互換をもたせるものとする
  myPoint=new nas.Point([myX,myY]);
  myPoint=new nas.Point([0,128,255],"pt");

Point.length  で次数が取得できる

プロパティはUnitValue または　文字列で初期化
引数が数値ならばptとして初期化する
与えられない次数の値を0として扱うことが可能
引数なしの場合は2次元 ["0pt","0pt"] で初期化される

	プロパティ
nas.Point.length	Int  整数  保持している値の次数
nas.Point.x	UnitValue x座標値
nas.Point.y	UnitValue y座標値
nas.Point.z	UnitValue z座標値
nas.Point.type String 単位

数値で値を得る場合は各プロパティのas()メソッドを使用のこと

例： [myPoint.x.as('pt'),myPoint.y.as('pt')]

オブジェクトメソッド:
nas.Point.toString([指定単位])	;指定単位に揃えてリストで返す
nas.Point.valueOf([指定単位])	;指定単位にそろえて配列を戻す
単位指定がない場合は、登録された単位で返す

nas.Position は古いので  nas.Pointを使えやゴルァ
コンストラクタと初期化クラスメソッドを割ったほうが良いかも？

*/
/**
    二項または三項のnas.UnitValueをまとめて、座標点として扱う
    
    @params {UnitValue or String} x
    @params {UnitValue or String} y
    @params {UnitValue or String} z
    @example
     var A = new nas.Point(new nas.UnitValue('12.356 mm'),new nas.UnitValue('0.0 mm'));
     var B = new nas.Point("12.356mm, 0.0mm");
     var C = new nas.Point("12.356mm","0.0mm");
     var D = new nas.Point(A);
 */
nas.Point=function(x,y,z){
	this.props = ['x','y','z'];
	this.x = new nas.UnitValue('0 pt');
	this.y = new nas.UnitValue('0 pt');
	this.z = new nas.UnitValue('0 pt');
	this.length = 2;
	this.type='pt';
// 引数をパーサで処理する
	if(arguments.length > 0) this.setValue(x,y,z);
}
nas.Point.prototype.toString = nas._LISTString;
nas.Point.prototype.valueOf  = nas._ARRAYValue;
nas.Point.prototype.toJSON   = nas._JSONValue;
/**
 *	表記方法のゆらぎを吸収してポイントオブジェクトを設定する自己初期化メソッド
 *	@params {Array|Object nas.Point|Object JSON|String csv} argumants
 */
nas.Point.prototype.setValue = function(a,b,c){
	if(arguments.length == 0) return this;
	//引数が存在しない場合は、NOP
	var myParams = [];
	if(a instanceof nas.Point){
	//第一引数がポイントオブジェクトであれば、値を複製
		this.x.setValue(a.x);
		this.y.setValue(a.y);
		this.z.setValue(a.z);
		this.length = a.length;
		this.type   = a.type;
	}else{
	  if(typeof a == 'string'){
		if(a.match(/^\s*\{.*\}\s*$/)){
//JSON object
			var arg = JSON.parse(a);
			myParams = [arg.x,arg.y,arg.z];
		}else if(a.match(/^\s*\[.*\]\s*$/)){
//JSON array
			myParams = JSON.parse(a);
		}else if(a.match(/,/)){
//コンマ分離可能文字列
			myParams=a.split(',');
		}else{
//引数をコピー
			myParams=Array.from(arguments,function(e){return String(e).trim();});
		};
	  }else{
		if(a instanceof Array){
//第一引数が配列の場合は、操作対象を当該の配列に設定
			myParams = Array.from(a,function(e){return String(e).trim();});
		}else if((a instanceof Object)&&(a.x)){
//文字列でなく配列でも無いオブジェクト
			myParams.push(a.x);
			myParams.push((a.y)? a.y:new nas.UnitValue(0));
			myParams.push((a.z)? a.z:new nas.UnitValue(0));
		}else{
//引数をコピー
			myParams=Array.from(arguments);
		};
	  };
	//引数が配列で要素が２に満たない場合のみ"0pt"を一つ補う。
		if(myParams.length == 1) myParams.push("0 pt");
// 以下引数の初期化処理
		this.x = new nas.UnitValue(myParams[0]);
		this.y = new nas.UnitValue(myParams[1]);
		if(myParams[2]) this.z = new nas.UnitValue(myParams[2]);
		this.length = (myParams.length >= 3)? 3:2;
		this.type = this.x.type;
	};
	return this;
}
nas.Point.prototype.parse = nas.Point.prototype.setValue;
/* test

	myX= new nas.UnitValue("12mm")  ;
	myY= new nas.UnitValue("25.4mm");
	myZ= new nas.UnitValue("-36mm") ;
	
	A= new nas.Point()                    ;//原点初期化
	B= new nas.Point(A)                   ;//オブジェクトで初期化
	C= new nas.Point(myX,myY,myZ)         ;//３次元引数
	D= new nas.Point([myX,myY,myZ])       ;//３次元配列
	E= new nas.Point({"x":myX,"y":myY,"z":myZ}) ;//無名オブジェクトで初期化
	F= new nas.Point([myX,myY],'in');     ;//二次元配列初期化
	G= new nas.Point('12cm','2.54cm','30mm')                 ;//文字列
	H= new nas.Point("'12cm','2.54cm','30mm'")               ;//単独文字列文字列（記述ミス 0ptになる）
	I= new nas.Point("12cm , 2.54cm , 30mm")                 ;//単独文字列文字列（正常処理）
	J= new nas.Point('["12cm","2.54cm","30mm"]')             ;//配列JSON文字列
	K= new nas.Point('{"x":"12cm","y":"2.54cm","z":"30mm"}') ;//JSONオブジェクト
	L= new nas.Point(['12cm','2.54cm','30mm'])     ;//文字要素の配列で初期化
	M= new nas.Point(['12cm','2.54cm','30mm'],'in');//指定単位は反映されない
	N= new nas.Point(['12cm']);//

    ([A,B,C,D,E,F,G,H,I,J,K,L,M,N]).forEach((e)=>{
//	    console.log (e.toString());
//	    console.log (e.valueOf());
	    console.log (e.toJSON());
    });
 */
/*
 * 	位置オブジェクト
 * 	
 * 位置オブジェクトは、座標オブジェクトを主たるデータとして位置プロパティを保持する複合オブジェクト
 * 
 * コンストラクタ:
 * 	new nas.Position(x,y[,z])
 * 2次元、3次元の値が初期化可能
 * 引数は UnitValueまたは文字列、Pointオブジェクトの初期化に準ずる
 * Pointオブジェクトを与えて初期化することも可能？
 * 
 * Position.point.length  で次数が取得できる
 * 
 * プロパティはUnitValue
 * 引数が数値ならばptとして初期化する
 * 与えられない次数のプロパティは0として扱うことが可能
 * 引数なしの場合は2次元["0pt","0pt"]で初期化される
 * 
 * 	プロパティ
 * nas.Position.point	Object nas.Point  保持している座標の値
 * nas.Position.x	UnitValue   x座標値 this.point.x
 * nas.Position.y	UnitValue   y座標値 this.point.y
 * nas.Position.z	UnitValue   z座標値 this.point.z
 * nas.Position.c	arcCurve    初期値 undefined 
 * nas.Position.t	timingCurve 初期値 undefined
 * 
 * プロパティc,tは 各座標のプロパティとして付帯することも可能
 * 
 * nas.Position.toString([指定単位])  ;指定単位に揃えてリストで返す
 * nas.Position.valueOf([指定単位])   ;指定単位にそろえて配列を戻す
 * 単位指定がない場合は、登録された単位で返す
 * 
 * 引数なしの初期化を廃して、コードを整理したほうが良いかも？
 * 
 */
/*
nas.Position=function(x,y,z){
	if(arguments.length==0){
		x=new nas.UnitValue('0 pt');
		y=new nas.UnitValue('0 pt');
	}
	this.point=new nas.Point(arguments);
    this.length=this.point.length;
	this.props=['x','y','z'];
	this.x=this.point.x;
	this.y=this.point.y;
	this.z=this.point.z;
	this.type=this.point.type;
};// */
/**
@params {string} unit
リスト戻し  カンマ区切り 123mm,234mm
値単独指定
全プロパティ
    x=123mm
    y=234mm
    
*/
/*
nas.Position.prototype.toString=function(){
    var unit=(arguments.length)?arguments[0]:undefined;
    this.point.toString(unit)
}
nas.Position.prototype.listString = nas._LISTString;
nas.Position.prototype.valueOf    = nas._ARRAYValue;
nas.Position.prototype.toJSON     = nas._JSONValue;
// */
nas.Position = nas.Point;
//nas.Position objectはPointオブジェクトに換装 これは使用を推奨されない

/*
	 オフセットオブジェクト
オフセットを利用するための複合オブジェクト
positionとorientationを組み合わせたもの
初期化の引数は、リスト文字列・配列・Offsetオブジェクト またはダンプ文字列
標準的な初期化引数は、x,y,r | x,y,z,rx,ry,rz
3パラメータまでは二次元 それ以上は三次元
引数なしの場合は  0,0,0 で初期化
*/
nas.Offset=function(){
	this.position    = new nas.Point();
	this.orientation = new nas.Orientation();
	this.dimension = 2;
	this.length = 2;
	this.x = this.position.x;
	this.y = this.position.y;
	this.z = this.position.z;
	this.r = this.orientation.z;
	this.rx = this.orientation.x;
	this.ry = this.orientation.y;
	this.rz = this.orientation.z;

	if(arguments.length) this.setValue(Array.from(arguments));
}
/*
setValue
引数
	@params {Object nas.Point|String|Arrayof params} myPos
	@params {Object nas.Orientation} myOrt
	
nas.Offset.setValue("10mm,12mm,0.12degrees")       ;//コンマ区切り文字列
nas.Offset.setValue("10mm","12mm","0.12degrees")   ;//個別文字列
nas.Offset.setValue(["10mm","12mm","0.12degrees"]) ;//配列
nas.Offset.setValue({x:"10mm",y:"12mm",r:"0.12degrees"});//パラメータオブジェクト
nas.Offset.setValue(Offset);//nas.Offsetオブジェクト
nas.Offset.setValue(`
	offset.x = 10mm
	offset.y = 12mm
	offset.r = -0.34d
`);//ダンプアウト文字列のパースも必要

	offset.x  = 10mm
	offset.y  = -12mm
	offset.z  = 0.25mm
	offset.rx = 0d
	offset.ry = -4d
	offset.rz = 128d
*/
/**
 *	表記方法のゆらぎを吸収してオフセット複合オブジェクトを設定する自己初期化パーサ
 *   @params {Array|Object nas.Offset|Object JSON|String csv} argumants
 */
nas.Offset.prototype.setValue = function(a){
	if(arguments.length == 0) return this;
	//引数が存在しない場合は、NOP
	var myParams = [];
	if(a instanceof nas.Offset){
	//第一引数がオフセットオブジェクトであれば、値を複製して終了
		this.position.setValue(a.positon);
		this.orientation.setValue(a.orientation);
		this.dimension = a.dimension;//number
	}else{
	  if(typeof a == 'string'){
//as String
		if(a.match(/\s*offset\.[xyzr].*\s*=/)){
//ダンプアウト文字列
			var obj={};
			a.split("\n").forEach(function(lin){
				var line = lin.trim().split('=');
				if(line[0]) obj[line[0].trim().split(".")[1]] = line[1].trim();
				if(line[0].match(/offset\.(z|rx|ry)/)) obj.length = 3;
			},this);
			return this.setValue(obj);
		}else if(a.match(/^\s*\{.*\}\s*$/)){
//Object JSON
			return this.parse(JSON.parse(a));
		}else if(a.match(/^\s*\[.*\]\s*$/)){
//Array JSON
			myParams = JSON.parse(a);
		}else if(a.match(/,/)){
//コンマ分離可能文字列
			myParams=a.split(',');
		}else{
			myParams = Array.from(arguments);
			console.log(myParams);
		};
	  }else{
//as Object
		if(a instanceof Array){
//第一引数が配列の場合は、操作対象を当該の配列に設定
			myParams = a;
		}else if((a instanceof Object)&&(a.x)){
//文字列でなく配列でも無い参照オブジェクト
			["length","x","y","z","r","rx","ry","rz"].forEach(function(prp){
				if(a[prp]){
					if(prp == "length"){
						this.dimension = a.dimension;
						this.position.length = a.length;
						this.orientation.dimension = a.dimension;
					}else if(this[prp].setValue instanceof Function){
						this[prp].setValue(a[prp]);
					};
				};
			},this);
			return this;
		}else{
			myParams = Array.from(arguments);
		};
	};
	//引数が配列で要素が規定数に満たない場合のみ補う。
		if(myParams.length < 4){
			this.dimension = 2;
			if(myParams.length < 3){
				myParams = myParams.concat([0,0,0]);
				myParams.splice(3);
			};
			var prps = ["x","y","r"];
		}else{
			this.dimension = 3;
			if(myParams.length < 6){
				myParams = myParams.concat([0,0,0,0,0,0]);
				myParams.splice(6);
			};
			var prps = ["x","y","z","rx","ry","rz"];
		};
		prps.forEach(function(prp){
			this[prp].setValue(myParams[prps.indexOf(prp)]);
		},this);
	};
	return this;
}
nas.Offset.prototype.parse = nas.Offset.prototype.setValue;
/*TEST
var ofst = new nas.Offset(10,10,10);
console.log(new nas.Offset("10mm,12mm,0.12degrees"));       ;//コンマ区切り文字列
console.log(new nas.Offset("10mm","12mm","0.12degrees"))   ;//個別文字列
console.log(new nas.Offset(["10mm","12mm","0.12degrees"])) ;//配列
console.log(new nas.Offset({x:"10mm",y:"12mm",r:"0.12degrees"}));//パラメータオブジェクト
console.log(new nas.Offset(ofst));//nas.Offsetオブジェクト
console.log(new nas.Offset(`
	offset.x = 10mm
	offset.y = 12mm
	offset.r = -0.34d
`));//ダンプアウト文字列のパースも必要

console.log(new nas.Offset(`
	offset.x  = 10mm
	offset.y  = -12mm
	offset.z  = 0.25mm
	offset.rx = 0d
	offset.ry = -4d
	offset.rz = 128d
`));
*/
/**/
nas.Offset.prototype.toJSON = function(){
	var result = {
		"dimension":this.dimension,
		"x": this.x.toString(),
		"y": this.y.toString(),
		"r": this.r.toString()
	};
	if(this.dimension > 2){
		result.z = this.z.toString();
		result.rx = this.rx.toString();
		result.ry = this.ry.toString();
		result.rz = this.rz.toString();
	};
	return result;
}
/*
文字列化メソッド
引数trueでダンプ文字列を返す
 dump|JSON|(none)
*/
nas.Offset.prototype.toString = function(opt){
    var myResult=[];
	if(! opt){
        myResult.push(this.position.toString());
        myResult.push(this.orientation.toString());
		return myResult.join(",");
	}else if(opt == 'JSON'){
//JSON
		return JSON.stringify(this);
	}else{
//dump
        myResult.push("\toffset.x = "+this.position.x.toString());
        myResult.push("\toffset.y = "+this.position.y.toString());
        myResult.push("\toffset.r = "+this.orientation.z.toString("degrees"));
    	return myResult.join("\n");
	};
};
/*
基本的には不要なメソッド
必要時はOffsetでなく Offset.position | Offset.orientation 等の内部値が演算対象となる
引数渡しも無意味
*/
nas.Offset.prototype.valueOf=function(){
	var myResult=[];
	return myResult;
};
/*test
A= new nas.Offset();
B= new nas.Offset(new nas.Point("12mm","10mm"),new nas.Orientation("0d"));//この初期化は廃止

*/
/*
	ベクトルオブジェクト
コンストラクタ:
	new nas.Vector(終点[,始点][,単位])
1次元、2次元、3次元の値が初期化可能
引数
	終点・始点  /nas.Point
	単位文字列

引数の次元のうち次数の高い方に合わせたVectorを初期化する
Vector.dimension  で次数が取得できる
単位文字列が指定されなかった場合は、第一引数の単位を使用する

プロパティは  nas.Point
与えられない次数のプロパティは0として扱う

引数なしの場合はデフォルトの単位値で原点を始点とする２次元の単位ベクトルを戻す

	プロパティ

nas.Vector.dimension	Int  整数  保持している値の次数1～3
nas.Vector.origin	Point 始点座標
nas.Vector.value	Point ベクトル値(=終点座標-始点座標)
nas.Vector.type	String  単位文字列

始点を省略した場合は、原点を始点に置く
オブジェクトメソッド:
nas.Vector.toString([指定単位])	;指定単位に揃えて数値をコンマ区切りリストで返す
nas.Vector.valueOf([指定単位])	;指定単位にそろえて数値配列を戻す

*/
nas.Vector=function(endPoint,startPoint,myUnit){
	this.dimension = 2;
	this.length    = 2;
	this.props     = ['origin','value'];
	this.origin    = new nas.Point('0 pt','0 pt');
	this.value     = new nas.Point('1 pt','1 pt');
	this.type      = "pt";
	if(arguments.length) this.setValue(endPoint,startPoint,myUnit);
}
nas.Vector.prototype.setValue = function(endPoint,startPoint,myUnit){
	if(endPoint instanceof nas.Vector){
		for (var prp in endPoint){
			if(prp == 'props'){
				continue;
			}else if(this[prp].setValue instanceof Function){
				this[prp].setValue(endPoint[prp]);
			}else{
				this[prp] = endPoint[prp];
			};
		};
	}else if(arguments.length==0){
		this.dimension=2;
		this.origin=new nas.Point('0 pt','0 pt');
		this.value=new nas.Point('1 pt','1 pt');
		this.type="pt";
	}else{
		this.type=(arguments.length>2)? myUnit:endPoint.type;
		if(arguments.length>1){
			this.dimension=(startPoint.dimension>endPoint.dimension)?startPoint.dimension:endPoint.dimension;
		}else{
			this.dimension=endPoint.dimension;
			startPoint=new nas.Point(([0,0,0,0]).slice(0,this.dimension),this.type);
		};
		if(this.dimension>startPoint.dimension){
			this.origin=new nas.Point((startPoint.toString(this.type)+',0,0').split(',').slice(0,this.dimension),this.type);
		}else{
			this.origin=new nas.Point(startPoint.valueOf(this.type),this.type);
		};
		this.value=new nas.Point(nas.sub(endPoint.valueOf(this.type),this.origin.valueOf(this.type)),this.type);

	};
	return this;
}
nas.Vector.prototype.parse     = nas.Vector.prototype.setValue;
nas.Vector.prototype.toString  = nas._LISTString;
nas.Vector.prototype.valueOf   = nas._ARRAYValue;
nas.Vector.prototype.toJSON    = nas._JSONValue;
/**
	回転オブジェクト
	次元数を保存する
	引数が正負の数値のみ、またはbool値で指定された場合は、一次元(true,false,-1,1,0  等  0は負方向)
	引数がなし、または  一つの角度文字列またはUnitAngleで初期化された場合は、二次元でｚ軸指定  （"10d"等）
	それ以外の場合は三次元（3軸指定）となる
	三次元回転の解決順は z-y-x
コンストラクタ
	new nas.Rotation(bool)
	new nas.Rotation([x,y,] z)
引数は、bool,UnitAngleまたは文字列

*/
nas.Rotation=function(x,y,z){
	this.name  ='rotation';
	this.props =["w","x","y","z"];
	this.length = 3;
	this.dimension = 2;
	this.w = 1;
	this.z = new nas.UnitAngle();
	this.y = new nas.UnitAngle();
	this.x = new nas.UnitAngle();
	if(arguments.length) this.setValue(x,y,z);
}
nas.Rotation.prototype.setValue = function(x,y,z){
	if(x instanceof nas.Rotation){
		for(var prp in x){
			if((prp == 'props')||(prp == 'name')){
				continue;
			}else if(typeof this[prp].setValue == 'function'){
				this[prp].setValue(x[prp]);
			}else{
				this[prp] = x[prp];
			};
		};
	}else{
		this.dimension=(arguments.length == 0)? 2 : 
		(arguments.length > 1)? 3 :
		((! arguments[0] instanceof nas.UnitAngle)||isFinite(arguments[0]))? 1 : 2 ;
		this.length = this.dimansion + 1
		switch(this.dimension){
		case 1:
			this.w = (arguments[0] < 0 )? -1:1;
		break;
		case 2:
			this.z=(arguments[0] instanceof nas.UnitAngle)? arguments[0]:new nas.UnitAngle(arguments[0]);
			this.y=new nas.UnitAngle('0 degrees');
			this.x=new nas.UnitAngle('0 degrees');
		break;
		case 3:
			this.x=(arguments[0] instanceof nas.UnitAngle)? arguments[0]:new nas.UnitAngle(arguments[0]);
			this.y=(arguments[1] instanceof nas.UnitAngle)? arguments[1]:new nas.UnitAngle(arguments[1]);
			this.z=(arguments[2] instanceof nas.UnitAngle)? arguments[2]:new nas.UnitAngle(arguments[2]);
		};
	};
}
nas.Rotation.prototype.parse = nas.Rotation.prototype.setValue;
nas.Rotation.prototype.toString = function(exportForm){
	if(!exportForm) return this.listString('degrees');
	var myResult=[];
	var myUnit = 'degrees';
	switch (this.dimension){
	case 1:
		myResult.push("\t"+this.name+".w = "+this.w);
	break;
	case 2:
		myResult.push("\t"+this.name+" = "+this.z.as(myUnit));
	break;
	case 3:
	default:
		myResult.push("\t"+this.name+".x = "+this.x.as(myUnit));
		myResult.push("\t"+this.name+".y = "+this.y.as(myUnit));
		myResult.push("\t"+this.name+".z = "+this.z.as(myUnit));
	};
	return myResult.join('\n');//リスト文字列で
}
nas.Rotation.prototype.listString   = function(myUnit){
	if(typeof myUnit == "undefined") myUnit = false;
	var myResult=[];
	switch (this.dimension){
	case 1:
		myResult.push(this.w);
	break;
	case 2:
		myResult.push(this.z.as(myUnit));
	break;
	case 3:
	default:
		myResult.push(this.x.as(myUnit));
		myResult.push(this.y.as(myUnit));
		myResult.push(this.z.as(myUnit));
	}
	return myResult.join(',');//リスト文字列で
}
nas.Rotation.prototype.valueOf   = nas._ARRAYValue;
nas.Rotation.prototype.toJSON    = nas._JSONValue;

/*
	方向オブジェクト
	次元数を保存する
	引数が正負の数値のみで指定された場合は、一次元
	引数がなし、または  一つの角度文字列またはUnitAngleで初期化された場合は、二次元でｚ軸指定
	それ以外の場合は三次元（3軸指定）となる
	三次元回転の解決順は z-y-x
コンストラクタ
	new nas.Orientation(bool)
	new nas.Orientation([x,y,] z)
引数は、bool,UnitAngleまたは文字列

*/
nas.Orientation=function(r,w){
    this.name='orientation';
	this.props =["w","x","y","z",];
	this.dimension = 2;
	this.w = 1;
	this.z = new nas.UnitAngle();
	this.y = new nas.UnitAngle();
	this.x = new nas.UnitAngle();
	if(arguments.length) this.setValue(r,w);
}
/*
nas.Orientation.prototype.setValue=function(r,w){
	this.dimension=(arguments.length == 0)? 2 : 
	(arguments.length > 1)? 3 :
	((! arguments[0] instanceof nas.UnitAngle)||isFinite(arguments[0]))? 1 : 2 ;	 
	switch(this.dimension){
	case 1:
		this.w = (arguments[0] < 0 )? -1:1;
	break;
	case 2:
		this.z=(arguments[0] instanceof nas.UnitAngle)? arguments[0]:new nas.UnitAngle(arguments[0]);
		this.y=new nas.UnitAngle('0 degrees');
		this.x=new nas.UnitAngle('0 degrees');
	break;
	case 3:
		this.x=(arguments[0] instanceof nas.UnitAngle)? arguments[0]:new nas.UnitAngle(arguments[0]);
		this.y=(arguments[1] instanceof nas.UnitAngle)? arguments[1]:new nas.UnitAngle(arguments[1]);
		this.z=(arguments[2] instanceof nas.UnitAngle)? arguments[2]:new nas.UnitAngle(arguments[2]);
	}
};//*/
nas.Orientation.prototype = nas.Rotation.prototype;

/** レートオブジェクト　倍数比率を単位係数無しで保持するオブジェクト
.value  倍数
.rate   係数
	係数はtoString表示の際のデフォルトの値（指定変更可能）
*/
nas.Rate=function(myRate){
	this.value = 1;
	this.rate  = 100;//100%
	if(arguments.length) this.setValue(myRate);
}

nas.Rate.prototype.setValue = function(rateString){
	if(rateString instanceof nas.Rate) rateString = rateString.toString();
	var myRate=1;
	var myRateUnit=String(rateString).replace(/[\+\-\d\.\s]/g,'');
	var myValue=parseFloat(rateString);
	if(isNaN(myValue)) myValue=1;
	switch(myRateUnit){
	case "分":
	case "割":
		myRate = 10;
	break;
	case  "percent":
	case  "%":
	case "％":
		myRate = 100;
	break;
	case "permill":
	case "‰":
		myRate = 1000;
	break;
	}
	this.value = myValue/myRate;
	this.rate  = myRate;
	return this;
}
nas.Rate.prototype.parse = nas.Rate.prototype.setValue
nas.Rate.prototype.valueOf = function(){return this.value;}
nas.Rate.prototype.as = function(rate){
	var myRate;
	switch(rate){
	case "分":
	case "割":
		myRate = 10;
	break;
	case  "%":
	case "％":
	case "percent":
		myRate = 100;
	break;
	case "‰":
	case "permill":
		myRate = 1000;
	break;
	default:
		myRate = parseFloat(rate);
	};
	if(isNaN(myRate )) myRate = 1;
	return(myRate*this.value)
}
nas.Rate.prototype.toString=function(){
	return String(this.value*this.rate)+["",null,"%","‰"][Math.log10(this.rate)];
}
nas.Rate.prototype.toJSON = nas.Rate.prototype.toString;
/*  TEST
A = new nas.Rate("1");
B = new nas.Rate("96%");
C = new nas.Rate("1234‰");
D = new nas.Rate("1％");
D = new nas.Rate("1％");
*/
/*	フレームレートオブジェクト
コンストラクタ
	nas.newFramerate(rateString[,rate])?
引数:
	rateString String フレームレート文字列
	rate Number 省略可能  実フレームレート
	フレームレート文字列は任意
	引数が  24FPS 25fps等の  /\dFPS/i の場合はその数値を利用
	第一引数が  SMPTE,NTSC,DF を含む場合は、第二引数にかかわらず 30/1.001 で初期化する
	その際引数に数値  60または59.94が含まれる場合 60/1.001 に更新する
	その場合ドロップフレーム処理が行われる
	
	第一引数が  PAL,SECAM  を含む場合は、第二引数にかかわらず 25  で初期化を行う
	その際引数に数値  50 が含まれる場合 50 に更新する

    第一引数が rateString(rate)  形式の場合は  括弧の中身を実フレームレートとして処理する

	実時間とTCのズレが蓄積して広がるNDFはサポートしない。	
	
	フレームレート文字列に数値が含まれているかまたはキーワードの場合は、第二引数を省略可能（無視する）
	不正な引数で初期化された場合は、クラスプロパティを使用する

初期化メソッドは、以下の動作に変更
	単一引数の場合
引数文字列を数値パースしてフレームレートを取得して、文字列自体をnameに設定

二つ以上の場合は、第一引数がname,第二引数がフレームレート
第一引数が数値のみの場合は"FPS”を補うが、それ以外の場合は文字列全体をnameとする
	
名称とフレームレートに不整合があっても許容する
名称にフレームレートの数値が含まれない場合は名称に"(数値)"を補って出力する
*/
//nas.Framerate={name:"24FPS",rate:24,opt:null};

nas.Framerate=function(initString,rate){
	this.name = "24FPS";
	this.rate = 24;
    this.opt  = null;
    if(arguments.length) this.setValue(initString,rate);
};

nas.Framerate.prototype.toString = function(form){return (form)? this.name:this.name+"("+this.rate+")";}
nas.Framerate.prototype.valueOf=function(){return this.rate;}

/**
    フレームレートオブジェクト初期化メソッド
    空引数で呼ばれた場合はデフォルト値のフレームレートを返す
*/
nas.Framerate.prototype.setValue = function(rateString,rate){

	if(arguments.length){
	  //第一引数がカッコつきでフレームレート指定された文字列ならば第二引数は無効(捨てる)
	  if(String(rateString).match(/(.*)\(([0-9]+(\.[0-9]*)?)\)/)){
	    this.name = RegExp.$1;
	    this.rate = parseFloat(RegExp.$2);
	  } else if(arguments.length>1){
	//引数が2つ設定されている
	    this.name = String(rateString);
	    this.rate = parseFloat(rate);
	  }else if(String(rateString).length){
	//引数が一つのみ
	    this.name = String(rateString);
	    this.rate = parseFloat(String(rateString).replace(/^[^-\d]+/,""));//文字列先頭の数値以外のデータを捨てて数値化
	  }else{
	    return this;
	  }
	}else{
	//引数がない場合は、デフォルト値を返す
	    return this;
	}
	//名前に特定の強制キーワードを含む
	if(this.name.match(/PAL|SECAM/i)){
	    if(!(this.rate)) this.rate = 25;
	    this.rate = ( this.rate < 37.5 ) ? 25.0: 50.0 ;
	}else if(this.name.match(/SMPTE|NTSC|[^N]DF/i)){
        this.opt = 'smpte';
	    if(! isFinite(this.rate)) this.rate = 30;
	    this.rate = (this.rate > 45 )? 59.94 : 29.97 ;
	}
	if(! isFinite(this.rate)){
//  console.log (this.rate);
	    this.name = nas.FRATE.name;this.rate=nas.FRATE.rate;this.opt=nas.FRATE.opt;
	}
//最終的に名前がなくなった場合はフレームレート＋"fps"を文字列としてもたせる
	if(String(this.name).length==0) {this.name = this.rate+'fps'};

	return this;
}
nas.Framerate.prototype.parse = nas.Framerate.prototype.setValue;
/**
    同値判定メソッド
    フレームレートと、ドロップの有無を比較して同じフレームレートか否かを返す
*/
nas.Framerate.prototype.sameAs=function(compareTarget){
    if(! compareTarget instanceof nas.Framerate) return false;
    return ((this.rate==compareTarget.rate)||(this.opt==compareTarget.opt));
}
/**
    新規フレームレート作成メソッド
    空引数で呼ばれた場合はデフォルト値のフレームレートを返す
*/
nas.newFramerate=function(rateString,rate){
	var newOne=new nas.Framerate();
	if(arguments.length){
//第一引数がカッコつきでフレームレート指定された文字列ならば第二引数は無効(捨てる)
	  if(String(rateString).match(/(.*)\(([0-9]+(\.[0-9]*)?)\)/)){
	    newOne.name = RegExp.$1;
	    newOne.rate = parseFloat(RegExp.$2);
	  } else if(arguments.length>1){
//引数が2つ設定されている
	    newOne.name=rateString;
	    newOne.rate=parseFloat(rate);
	  }else if(String(rateString).length){
//引数が一つのみ 文字列先頭の数値以外のデータを捨てて数値化
	    newOne.name=String(rateString);
	    newOne.rate=parseFloat(String(rateString).replace(/^[^-\d]+/,""));
	  }else{
	    return newOne;
	  }
	}else{
	//引数がない場合は、デフォルト値を返す
	    return newOne;
	}
	//名前に特定の強制キーワードを含む
	if(newOne.name.match(/PAL|SECAM/i)){
	    if(!(newOne.rate)) newOne.rate = 25;
	    newOne.rate=( newOne.rate < 37.5 ) ? 25.0: 50.0 ;
	}else if(newOne.name.match(/SMPTE|NTSC|[^N]DF/i)){
        newOne.opt='smpte';
	    if(!(newOne.rate)) newOne.rate = 30;
	    newOne.rate=(newOne.rate > 45 )? 59.94 : 29.97 ;
	}
	if(!(newOne.rate)){
//  console.log (newOne.rate);
	    newOne.name=nas.FRATE.name;newOne.rate=nas.FRATE.rate;newOne.opt=nas.FRATE.opt;
	}
//最終的に名前がなくなった場合はフレームレート＋"fps"を文字列としてもたせる
	if(String(newOne.name).length==0) {newOne.name = newOne.rate+'fps'};

	return newOne;
}
/*TEST
nas.newFramerate("smpte60(59.4)").toString();
nas.newFramerate("PAL(50)").toString(true);
nas.newFramerate("SECAM",48);
nas.newFramerate("NDF30");
nas.newFramerate("FILM",24);
nas.newFramerate("IMAX",48);

var myRate=nas.newFramerate("SMPTE",60);
myRate*2;

*/
/**
    @params {String}    trDescription
        トランジション記述 xps型と一般型を双方解釈する
    @params {String|Boolean}    direction
        トランジション方向 指定により上書きが可能
        省略可: 省略時は記述を解釈する

    トランジションオブジェクト
    this.name       = '--';//{string} name
        トランジションの名称
    this.time       = "0" ;//{String} nasFCT
        トランジション時間　nas.FCT
    this.direction  = ''  ;//{string} in|out from|to false|true
        トランジション方向　in|out デフォルトはin
    トランジション方向は、オブジェクトの使用されたプロパティに従って動的に変化するので注意
    尺集計のためのマージンを出力する機能
    ショット間のトランジションの場合　奇数フレームのトランジションで0.5フレームの集計を避けるために
    in側で繰り上げ　out側で繰り下げの処置を行う
    マージンの取得は ShotTransition.getMargin メソッドに実装
*/
nas.ShotTransition = function(trDescription,direction){
    this.name       = '--';//{string} name
    this.time       = "0" ;//{String} nasFCT
    this.direction  = 'in';//{string} in|out
    if(trDescription) this.parse(trDescription);
    if(direction){
        this.direction = (String(direction).match(/^to\b|out\b/i))? 'out':'in';
    }else{
        if(this.name.match(/^to\b|out\b/i)) this.direction = 'out';
    }
}
/**
    トランジション記述のパース
    "1+12 , trout" 等のコンマ区切り（xps形式）と"trout(1+12)"等の（括弧）表記を自動認識
*/
nas.ShotTransition.prototype.setValue = function(trDescription){
    if(trDescription instanceof nas.ShotTransition){
//duplicate
        this.name       = trDescription.name     ;//{string} name
        this.time       = trDescription.time     ;//{String} nasFCT
        this.direction  = trDescription.direction;//{string} in|out
    }else{
        if(trDescription.indexOf(',') >= 0){
// time前置 120,wipe
            var dataArray = trDescription.split(',');
            this.name = dataArray[1].trim();
            this.time = (dataArray[0])? dataArray[0].trim():'0';
        }else{
//パーレン型 wipe(1+12)
            var timeGet = trDescription.match(/^([^\(]*)(\(([^\)]+)\))?/);
            this.name = timeGet[1].trim();
            this.time = (timeGet[2])? timeGet[3]:'0';
        }
    }
}
/*TEST
	var trOut = new nas.ShotTransition("1+18 , wipe","out");
	var trIn  = new nas.ShotTransition("OL(3+12)","in");
*/
nas.ShotTransition.prototype.parse = nas.ShotTransition.prototype.setValue;
/**
    引数で出力形式を選択
    @params {String} form
        出力フォーマット xps|<others>
    @returns {String}
        'xps' 記録形式出力フォーマット time値が0でも出力あり
        通常は時間値がない場合''を出力
        その他の場合 <name>(<time>)
*/
nas.ShotTransition.prototype.toString = function(form){
    if(form == 'xps'){
        return [this.time,this.name].join(',');
    }else{
        if(nas.FCT2Frm(this.time) == 0) return '';
        return this.name + '('+this.time+')';
    }
}
/**
    集計用に整数フレームのマージンを返す
    in側で繰り上げ out側では繰り下げ
*/
nas.ShotTransition.prototype.getMargin = function(){
    return (this.direction == 'in')? Math.ceil(this.frames() / 2):Math.floor(this.frames() / 2);
}
/**
    トランジション長をフレーム数で返す
*/
nas.ShotTransition.prototype.frames = function(frate){
    if(! frate) frate = nas.FRATE;
    return nas.FCT2Frm(this.time,frate);
}
nas.ShotTransition.prototype.valueOf = nas.ShotTransition.prototype.frames;
/*TEST
    new nas.ShotTransition('trin');
    new nas.ShotTransition('trout');
    new nas.ShotTransition('trin (1+12)');
    new nas.ShotTransition('trout(3+0//24)','in');
    new nas.ShotTransition(false,'from');
    new nas.ShotTransition('wipe(3+18)','to');
*/
/**
	サイズオブジェクト
コンストラクタ
	new nas.Size(width,height[,depth])
引数は
	UnitValue|width,height,depth


	TimingCurve	/	timing	
引数がない場合は単位"pt"でサイズ 72x72  二次元のオブジェクトを初期化

コンストラクタでタイミングカーブを初期化する必要は無い
Size オブジェクトはPointを中核データとしたサイズを扱うオブジェクト

Size
	.x(width)
	.y(height)
	.z(depth)
size Object出力書式
form1:
    125mm,254mm
form2:
    size.X = 125mm
    size.Y = 254mm
*/
nas.Size=function(a,b,c){
	this.props = ['x','y','z'];
	this.x = new nas.UnitValue('72 pt');
	this.y = new nas.UnitValue('72 pt');
//	this.z;
	this.length = 2;
	this.type='pt';
// 引数がひとつで文字列だった場合、クラスメソッドで展開する
	var presets = {
		"A3":"297mm,420mm","A4":"210mm,297mm",
		"A3L":"420mm,297mm","A4L":"297mm,210mm"
	};
// 引数をパーサで処理する
	if(
		(arguments.length == 1)&&
		(typeof arguments[0] == 'string')&&
		(presets[arguments[0]])
	){
		this.setValue(presets[arguments[0]]);
	}else{
		this.setValue(a,b,c);
	}
}
nas.Size.prototype = nas.Point.prototype;
/**
 *    スケールオブジェクト
 *Scale.x
 *Scale.y
 *Scale.z
 *Scale.type='percent'
 */
nas.Scale = function(x,y,z){
	this.length;
	this.props = ["x","y","z"];
	this.rate  = 1
	this.setValue(x,y,z);
/*
	this.valueOf=function(asRate){
		if(typeof asRate == 'undefined') asRate="";
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){myResult.push(this[this.props[myDim]].as(asRate))}
		return myResult;
	};//*/
}
nas.Scale.prototype.setValue = function setValue(x,y,z){
	if(x instanceof nas.Scale) x = x.toString();
	if(arguments.length == 0){
		var args = ["100%"];
		this.length = 1;
	}else if((typeof x == 'string')&&(arguments.length == 1)){
		var args = x.split(',');
		this.length = args.length;
	}else{
		var args = Array.prototype.slice.call(arguments)
		this.length = args.length;
	};
	if(length > 3) length = 3;
	for(var myDim=0 ; myDim < this.length ; myDim++){
		this[this.props[myDim]] = new nas.Rate(args[myDim]);
	};
	this.rate = this.x.rate;
}
nas.Scale.prototype.toString=function(opt){
	var myResult=[];
	var rateString=['','割','%','‰'][Math.log10(this.rate)];
    if(! opt){
    	for(var myDim=0;myDim<this.length;myDim++){
	        myResult.push(this[this.props[myDim]].as(rateString)+rateString)
	    }
	    return myResult.join(",");
	}else{
	    if(this.length==1){
	            myResult.push("\tscale = "+this.x.toString());
	    }else{
    	    for(var myDim=0;myDim<this.length;myDim++){
	            myResult.push("\tscale."+this.props[myDim] +" = "+this[this.props[myDim]].as(rateString)+rateString);
	        }
	    }
	    return myResult.join("\n");
	};
}

nas.Scale.prototype.as = function(rate){
	if(this.length == 1){
		return this.x.as(rate);
	}else if(this.length == 2){
		return [this.x.as(rate),this.y.as(rate)];
	}else if(this.length == 3){
		return [this.x.as(rate),this.y.as(rate),this.z.as(rate)];
	};
	return false
}
nas.Scale.prototype.valueOf = nas._ARRAYValue;
nas.Scale.prototype.toJSON  = nas._JSONValue;
/* 
Position（座標）クラス
Vectorオブジェクト


1次元のVevtorはbool / 2次元のVectorは 1次元のOrientation（Z）/ 3次元のVeltorは 3次元のOrientation (XYZ)を持つ
プロパティで持たせるか、またはラムダ関数で導くか？  アクセス頻度？

*/
/*
Curve  Object
new nas.Curve(point1,point2,isAbs)
アークを指定するための複合Object
座標系のObjectに持たせるcurveプロパティの値
自分自身の座標を始点としてベジェの第一制御点と第二制御点を相対座標で持たせる
終点はタイムシート上に次に出現する値
したがって次の区間に値が存在しない場合は、指定自体が意味を失う
指定が絶対座標であった場合は、 親オブジェクト側で座標系の変換を行い相対座標にして格納する
カーブデータを必要とする区間は、直前の区間のカーブ値と直後の区間の値を参照する。
値を持っていてもカーブプロパティを持たないエントリがあっても良い
その場合は、標準値で補う
C=new Curve( new Point(0,0),new Point(1,1))
*/
nas.Curve=function(){
	this.parent;
	this.ctlrpt1;
	this.ctlrpt2;
}
/*
  TimingCurve  Object
  タイミング指定をするための配列ベースのObject
値を持つObjectに全て持たせることが可能
値は二次元に限定 / 値範囲は0-1に限定
始点を[0,0] 終点を[1,1]と置いて第一制御点と第二制御点を少数値で与える

キーワード文字列で初期化された場合、ライブラリ内にキーワードに対応する値が存在するならテキストを値として実際の値はクラスライブラリを参照する。
タイミングを解決するのは、値を持ったObjectの直後の中間値補間区間

T=new TimingCurve("linear"); //	戻値[[0,0],[1,1]]
nas.TimingCurve=function(){
	this.
}
.parent タイミングカーブが適用されるプロパティを与える
.ctlrPtは自身の配列要素を使用

*/
nas.TimingCurve = function(){
	this.parent;
	this.name;
	this.push([0,0]);this.push([1,1]);//デフォルトのlinearタイミング
}
nas.TimingCurve.prototype = Array.prototype;
/*
	enum 逆引き
*/
nas.reversemap = function reversemap(idx){
	for(var prp in this) if(this[prp]==idx) return prp;
	return null;
}

/**
 *  @enum {array}
 *デフォルトタイミングライブラリ
 *
 *  リニアタイミング（均等）       0   0   1   1
 *  イーズ（両詰め）              .5  0   .5  1
 *  イーズアウト（前詰め）         .5  0   1   .5
 *  イーズイン（後詰め）           0   .5  .5  1
 *  クイック（極端な両詰め）       1   0   0   1
 *  クイックアウト（極端な前詰め）  1   0   1   0
 *  クイックイン（極端な後詰め）    0   1   0   1
 *  ステイ（中詰め）              0   .5  1   .5
 *  ステイストロング(極端な中詰め)  0   1   1   0
*/
nas.Timing={
	"linear"    :[[  0,  0],[  1,  1]],
	"ease"      :[[0.5,  0],[0.5,  1]],
	"easeOut"   :[[0.5,  0],[  1,0.5]],
	"easeIn"    :[[  0,0.5],[0.5,  1]],
	"quick"     :[[  1,  0],[  0,  1]],
	"quickOut"  :[[  1,  0],[  1,  0]],
	"quickIn"   :[[  0,  1],[  0,  1]],
	"stay"      :[[  0,0.5],[  1,0.5]],
	"stayStrong":[[  0,  1],[  1,  0]]
};
/**
 *  @enum {Number}
 *    合成モードオブジェクト
 *
 *nas.BlendingMode.ADD
 *nas.BlendingMode.ALPHA_ADD
 *nas.BlendingMode.CLASSIC_COLOR_BURN
 *nas.BlendingMode.CLASSIC_COLOR_DODGE
 *nas.BlendingMode.CLASSIC_DIFFERENCE
 *nas.BlendingMode.COLOR
 *nas.BlendingMode.COLOR_BURN
 *nas.BlendingMode.COLOR_DODGE
 *nas.BlendingMode.DANCING_DISSOLVE
 *nas.BlendingMode.DARKEN
 *nas.BlendingMode.DIFFERENCE
 *nas.BlendingMode.DISSOLVE
 *nas.BlendingMode.EXCLUSION
 *nas.BlendingMode.HARD_LIGHT
 *nas.BlendingMode.HARD_MIX
 *nas.BlendingMode.HUE
 *nas.BlendingMode.LIGHTEN
 *nas.BlendingMode.LINEAR_BURN
 *nas.BlendingMode.LINEAR_DODGE
 *nas.BlendingMode.LINEAR_LIGHT
 *nas.BlendingMode.LUMINESCENT_PREMUL
 *nas.BlendingMode.LUMINOSITY
 *nas.BlendingMode.MULTIPLY
 *nas.BlendingMode.NORMAL
 *nas.BlendingMode.OVERLAY
 *nas.BlendingMode.PIN_LIGHT
 *nas.BlendingMode.SATURATION
 *nas.BlendingMode.SCREEN
 *nas.BlendingMode.SILHOUETE_ALPHA
 *nas.BlendingMode.SILHOUETTE_LUMA
 *nas.BlendingMode.SOFT_LIGHT
 *nas.BlendingMode.STENCIL_ALPHA
 *nas.BlendingMode.STENCIL_LUMA
 *nas.BlendingMode.VIVID_LIGHT
 *
 *現在の実装では実際の値は問題にならない
 *列挙値として仮にAE互換の整数値を与えておく　
 *
 *これは将来合成数式のキャリアとして再設定される…かも
*/

nas.BlendingMode ={
	ADD:3620,
	ALPHA_ADD:3644,
	CLASSIC_COLOR_BURN:3619,
	CLASSIC_COLOR_DODGE:3625,
	CLASSIC_DIFFERENCE:3634,
	COLOR:3638,
	COLOR_BURN:3618,
	COLOR_DODGE:3624,
	DANCING_DISSOLVE:3614,
	DARKEN:3615,
	DIFFERENCE:3633,
	DISSOLVE:3613,
	EXCLUSION:3635,
	HARD_LIGHT:3628,
	HARD_MIX:3632,
	HUE:3636,
	LIGHTEN:3621,
	LINEAR_BURN:3617,
	LINEAR_DODGE:3623,
	LINEAR_LIGHT:3629,
	LUMINESCENT_PREMUL:3645,
	LUMINOSITY:3639,
	MULTIPLY:3616,
	NORMAL:3612,
	OVERLAY:3626,
	PIN_LIGHT:3631,
	SATURATION:3637,
	SCREEN:3622,
	SILHOUETE_ALPHA:3642,
	SILHOUETTE_LUMA:3643,
	SOFT_LIGHT:3627,
	STENCIL_ALPHA:3640,
	STENCIL_LUMA:3641,
	VIVID_LIGHT:3630
}
nas.BlendingMode.reversemap = nas.reversemap;
/*
nas.AnimationPeg Object
nasペグシステムでサポートするペグオブジェクト

以下のペグをサポートする
0:表示のないペグ  角合せ及び中央合せ	中央合わせがデフォルト値
	0:中央合せ
	1:左下合せ(ステージ第一象限)
	2:左上合せ(ステージ第二象限)
	3:右上合せ(ステージ第三象限)
	4:右下合せ(ステージ第四象限)
	5:他任意の位置
	プリセットで色々作る
  各ポイントは、ペグ（レジストレーション点）として扱う
	可視、不可視の属性を持ち、外見プロパティを持たせることができる。
	外見プロパティの登録がない場合簡易表示として、レジストリシンボルを使う
  エレメントグループ内部のみで角合わせを行うとレジストレーション点が画面中央で初期化されたりするが通常の動作である
  必要に従って、新たなタップを作成（ステージにタップ＝カメラワークフレームを設定＝設置）して其処にジオメトリネットワークを構築する
  実物線画台と異なり同じ位置に別のタップが置ける  干渉は無い

外見プロパティは以下から選択できるように設定
0:不可視、表示の際はシンボルで
1:ACME	ACME があれば問題ないと思う
2:丸あな2穴	穴径及び間隔は別に設定  またはシンボル
3:丸あな3穴	タイプはASAのみ用意する  ほかはいらん

ペグ（レジストレーション）システムとして考えた場合  角合せも中央整列もペグの位置指定と同じ
フレームからのレジストレーション点オフセットのデータ書式は同じ  →  ケースわけしない
レジストレーション代表点は、ペグの場合各ペグの中心（ACMEならセンターホール中心）、０番系列はポイントそのもの
向きはエレメントグループ内で揃っていれば同じ
データ上のオフセットは、レジストリ点のローカル座標とローテーション
pegオフセットは、フレーム中心からのペグ（レジストレーション点）のオフセットとローテーション

したがってフレーム中心のローカル座標は  sub(offset,pegOffset)となる。

基本構成は同じだが、AnimationPegはオブジェクトでなく  AnimationFrameオブジェクトのプロパティとして実装してそのプロパティの一部としてPegFormを設定する。
これがペグの外形を保持するように実装

オフセットプロパティ群の関連は以下のリスト

nas.Offset  オブジェクト  基底クラスオブジェクト
 位置オフセット+回転（オリエンテーション）値で成立する  回転に際して正規化が発生する

offset
	セルエレメントのローカル座標内のペグ位置オフセット
pegOffset
	プロパティとしては親座標系内のペグ位置
	デフォルトで使う限りは親がステージなのでワールド座標系での位置になる
	ネットワーク構築時のネスト時の親に注意
	乗り換え操作の際は、一旦ステージまでさかのぼってコンバートする方針で実装
frameOffset
	ペグ位置に対するフレームのオフセット
	エレメント（ローカル）座標系で記録する
*/
/** 列挙子はつかわないことに
 *  @enum {Number}
 *      ペグ形式(形状)DB
	"INVISIBLE":0  不可視 角合せ
	"ACME"     :1  ACMEタイプ
	"JIS2HALES":2  
	"US3HALES" :3  
//
nas.PegForm={
	"INVISIBLE" :0,
	"ACME"      :1,
	"OXBERRY"   :2,
	"DISNEY"    :3,
	"JIS2HALES" :4,
	"LIGHTFOOT" :5
}
nas.PegForm.reversemap = nas.reversemap;
 */
/*
 *    レジスタコレクション
 *  ACME以外は、歴史的なアーカイブのための設定
 *  このリストは形式のみの設定で、実際の標準描画面に対する関係は別にIMで設定される
 *  width/height  バウンディングボックスのサイズを表す　画像が欠損した場合に参照される
 *                サイズのないアイテムはクロス等で表示する
 *  image         画像url SGV推奨
 *  align         レジスタの位置原点｜ホットポイント
 *  description   簡単な説明
 */
nas.PegForm = {
	"INVISIBLE":{
		width : 0,
		height: 0,
		image : null,
		align : "left,bottom",
		description:"角合わせ左下"
	},
	"ACME":{
		width : "8.5in",
		height: "0.25in",
		image : "lib/resource/Pegs/ACME.svg",
		align : "center,middle",
		description:"peg type ACME"
	},
	"OXBERRY":{
		width : "8.5in",
		height: "0.25in",
		image : "lib/resource/Pegs/OXBERRY.svg",
		align : "center,middle",
		description:"peg type OXBERRY"
	},
	"JIS2HALES":{
		width : "86mm",
		height: "6mm",
		image : "lib/resource/Pegs/JIS2HALES.svg",
		align : "center,middle",
		description:"peg type JIS Binder"
	},
	"LIGHTFOOT":{
		width : "8.625in",
		height: "0.125in",
		image : "lib/resource/Pegs/US3HALES.svg",
		align : "center,middle",
		description:"peg type US RingBinder"
	}
}
/** @constractor
 *  @params {String}    name
 *  @params {Object}    form
 *  @params {String}    img
 *  @params {String}    desc
 *      myPeg =new nas.AnimationPegForm("ACME",nas.PegForm.INVISIBLE)
 *  
 */
nas.AnimationPegForm=function(name,form,img,desc){
	this.name        = name                                     ;//peg name / unique
	this.formFactor  = (form)? form:nas.PegForm.ACME            ;//オブジェクト渡しで
	this.image       = (img)?  img :this.formFactor.image       ;//参照画像url
	this.description = (desc)? desc:this.formFactor.description ;//説明
//	this.offset      = (giom)? giom:new nas.Offset()            ;//原点オフセットフォームはジオメトリを持たない
	//スタンダードフレーム中心からのオフセットジオメトリ
}
nas.AnimationPegForm.prototype.toString=function(){return this.name;}
nas.AnimationPegForm.prototype.valueOf=function(){return nas.PegForm[this.name];}

nas.AnimationPegForms = {};
for (var pegForm in nas.PegForm){
    nas.AnimationPegForms[pegForm] = new nas.AnimationPegForm(pegForm,nas.PegForm[pegForm]);
};

/**
 *  @enum {Number}
 *      フレームDB
代表的な画郭を登録提供する
実サイズはメディア・フィールドでマッピングする
4/3,22/16,185/100
 */
nas.FrameAspect={
	"STD"    :22/16,
	"SDTV"   :4/3,
	"HDTV"   :16/9,
	"A-VISTA":185/100,
	"E-VISTA":166/100,
	"SCOPE"  :12/5
}
/**nas.AnimationField Object

作画アニメーションフレームを保持するオブジェクト
クリッピングフレーム（カメラワークオブジェクト）の基底クラス

10インチ標準フレームは、
	new nas.AnimationField(
		name        = "10inSTD",
		baseWidth   = new nas.UnitValue("720 pt"),
		frameAspect = 16/9,
		frameScale  = 1.0,
		frameOfset  = [0,0], 配列も許容？
		scale       = "100Fld",
		offset      = nas.Offset(new nas.Position("0mm","0mm"),new nas.Orientation()),
		peg         = new nas.AnimationPegForms("ACME"),
		pegOffset   = nas.Offset(new nas.Position("0mm","105mm"),new nas.Orientation()),
		type        = "trad"
	);

    フィールドタイプ：trad|retas|inch-field|5000center|none

    ムービーフィルムのフィールドを記述する場合はメディアの実寸を記述する
    ピクセル数のみを持つムービーデータのフィールドは1ピクセルを1ポイントで換算して記述するものとする
    ムービーの画郭を表現する場合は scale = 1 , type = "none"で記述のこと
["FL35mm"	,  "22/16"	, "35ミリフルサイズ"]
["AC"		,  "22/16"	, "アカデミーフレーム"]
["SDTV"		,  "4/3"	, "SD-TV|4:3Std"]
["HDTV"		,  "16/9"	, "HDTV"]
["A-VISTA"	,  "185/100", "AmericanVista"]
["E-VISTA"	,  "166/100", "EuropianVista"]
["SCOPE"	,  "12/5"	, "scopeSize"]
    ペグは、フィールドに登録された状態ではじめて画面に対するジオメトリ（オフセット）を持つ
    （ペグとフレームの関係性はフィールドの定義ではじめて成り立つ）
    フレームの原点はフレーム中央
    アンカーポイントはフレームオフセットの形で持つ
    アンカーポイントとペグオフセットはそれぞれ独立したプロパティ
new nas.AnimationField(value,opt);
幅が未指定のフィールドは10inで初期化する

ビデオ系のライン数指定のフィールドは,10innで初期化されるので、メディア作成の際に以下の式でライン数と一致する解像度を出す
 resolution = Math.round(lines / height=(baseWidth.as('in')/frameAspect))

データ構造の調整が必要
    @params  {String}  myName
    @params  {Object UnitValue}  baseWidth
    @params  {Number}  frameAspect
    @params  {Number}  frameSale
    @params  {Object Offset}  frameOffset
    @params  {Object PegForm}  peg
    @params  {Object Offset}  pegOffset
    @params  {String}  fieldType
*/
nas.AnimationField=function(myName,baseWidth,frameAspect,frameScale,frameOffset,peg,pegOffset,fieldType){
	this.name        = (myName)? myName:"10in-HDTV";
	this.baseWidth   = (baseWidth)? baseWidth:new nas.UnitValue("254mm");//未指定のフィールドは10インチで初期化する
	this.frameAspect = (frameAspect)? frameAspect:nas.FrameAspect.HDTV;
	this.frameScale  = (frameScale)? frameScale:1.0;
	this.frameOffset = (frameOffset)? frameOffset:new nas.Offset(new nas.Position("0mm","0mm"),new nas.Orientation());
	this.peg         = (peg)? peg:nas.AnimationPegForms.ACME;
	this.pegOffset   = (pegOffset)? pegOffset:new nas.Offset(new nas.Position("0mm","104.775mm"),new nas.Orientation());
	this.type = (fieldType)? fieldType:"trad";
}
/**パーサが必要 */
nas.AnimationField.prototype.toString=function(exportForm){
    if(! exportForm){
      var resultData= ([
        '"'+this.name+'"'
      ]);
    }else{
      var resultData= ([
        '"'+this.name+'"',
	    this.baseWidth,
	    this.frameAspect,
	    this.frameScale,
	    this.peg,
	    this.pegOffset,
	    this.type
	  ]);
	};
    return resultData.join(',');
}
//フレーム標準DBを初期化　後ほどパーサを作成
var baseFields = {
	"000":{
		name:"STD12in",
		baseWidth:new nas.UnitValue("12in"),
		frameAspect:nas.FrameAspect.HDTV,
		scale:"100Fld",
		peg:nas.AnimationPegForms.ACME,
		pegOffset:new nas.Offset(new nas.Position("0mm","120mm"),new nas.Orientation()),
		type:"trad"
	},
	"001":{
		name:"STD10in",
		baseWidth:new nas.UnitValue("720 pt"),
		frameAspect:nas.FrameAspect.HDTV,
		scale:"100Fld",
		peg:nas.AnimationPegForms.ACME,
		pegOffset:new nas.Offset(new nas.Position("0mm","105mm"),new nas.Orientation()),
		type:"trad"
	},
	"002":{
		name:"AJA-Fr01",
		baseWidth:new nas.UnitValue("10in"),
		frameAspect:nas.FrameAspect.HDTV,
		scale:"100Fld",
		peg:nas.AnimationPegForms.ACME,
		pegOffset:new nas.Offset(new nas.Position("0in","4.125in"),new nas.Orientation()),
		type:"trad"
	},
	"005":{
		name:"STD260mm",
		baseWidth:new nas.UnitValue("260mm"),
		frameAspect:nas.FrameAspect.HDTV,
		scale:"100Fld",
		peg:nas.AnimationPegForms.ACME,
		pegOffset:new nas.Offset(new nas.Position("0mm","105mm"),new nas.Orientation()),
		type:"trad"
	},
	"006":{
		name:"STD265mm",
		baseWidth:new nas.UnitValue("265mm"),
		frameAspect:nas.FrameAspect.HDTV,
		scale:"100Fld",
		peg:nas.AnimationPegForms.ACME,
		pegOffset:new nas.Offset(new nas.Position("0mm","120mm"),new nas.Orientation()),
		type:"trad"
	},
};
/*後ほどコレクションを追加 pmdbにエントリする*/
nas.StandardAnimationFields = {};
    for (var prp in baseFields){
        nas.StandardAnimationFields[baseFields[prp].name] = new nas.AnimationField(
            baseFields[prp].name,
            baseFields[prp].baseWidth,
            baseFields[prp].frameAspect,
            baseFields[prp].scale,
            new nas.Offset(),
            baseFields[prp].peg,
            baseFields[prp].pegOffset,
            baseFields[prp].type
        );
    };
/**
 * nas.AnimationElementSource Object
 * 各エレメントのソースデータを統合して扱うオブジェクト
 * 初期化引数:ターゲット記述テキスト
 * .file ソースファイル object/File 又はパス文字列  初期値 null
 * .file.additionalLocation ソースファイルのサブロケーション  文字列  結合可能
 * .framerate ソースフレームレート 主に静止画、ムービーの際に利用  object / nas.Framerate
 * .duration ソース継続時間 主に静止画の際に利用  int/frames
 * .startOffset ソース継続時間に対するオフセット  int/frames
 * .type     ソースに与えられた役割を表す型式文字列
 
type属性は、静止画/動画/音声/Xpst/Comp と　ソース/プロキシ/リファレンス　の組み合わせ12種類
に加えて作業伝票としてのXPstを扱うことができる (2019現在未使用プロパティ)
comp|xpst|still|movie|sound[-src|prox|ref]

type　comp-src　のみ実体データを指さない
compは同xMap内部のエレメントをエレメント名で指定する合成指定となる（xpstの代わりに単純な記述を許す）

"= Ago-あ + A-1^ + A-1^^"　のように 時間情報を持たずにエレメント同士の合成を指定できる「合成式」文字列とする
合成要素は、アクセス可能なxMapエレメント名
合成演算子は以下　(ベース（白)=0 | ストローク(黒)=1の空間で数値演算を行う)
画像のチャンネル深度に関わらず　0-1にマッピングを行って、その色空間を用いる

'=' イコール - 合成式の開始宣言
'+' プラス - 演算子・ノーマル合成(加算)
'*' スター - 演算子・画像クリップを行う　先置の要素に後置の要素を乗算してクリップする
'-' マイナス - 演算子・後ろに続く要素の画素を反転させる
'('')'括弧 - 合成のグループ化を行う(演算優先度をコントロールする)
'@['']'合成要素のアルファを使用する場合は   要素を]で囲む アルファを反転する場合は   - を前置する
'!{''}'合成要素のルミナンスを使用する場合は 要素を!{}で囲む ルミナンスを反転する場合は - を前置する
';'セミコロン - 合成式を終了する（省略可）

要素と合成演算子の間にはスペースを置く

単純な線合成
= Aあ + A1^ ;
事前にルミナンスマスク化されているMセルでクリッッピング
= ( Aあ + A1^ ) * M3 ;
ルミナンスを抽出してLセルでクリップ
= A5 * !{ L8 } ;

反転アルファを抽出したLセルでクリップ
= A5 * - !{ L8 } ;

eg.

B-12 = B-(あ) + B-12' ;
B-13 = B-(あ) + B-13' ;
B-14 = B-(あ) + B-14' ;

 */
nas.AnimationElementSource=function(targetDescription){
    this.contentText=targetDescription;
    this.file=null;
    this.subLocations=[];
	this.framerate=(nas.pmdb.activeProduct)?nas.pmdb.activeProduct.title.framerate:nas.FRATE;
    this.duration;
    this.stratOffset;
    this.type="still-src";

    this.parseContent();
}
/*
    ソースの書式は以下
    ["<file.url>[///<source-subLoacation>[,<source-subLoacation>]...///<propertyName>=<propertyValue>[,<propertyName>=<propertyValue>]...]]
    urlは必須　サブロケーションがある場合は、ファイル記述規則に従って///三連スラッシュでurlに連続して記述
    urlがカラで他のプロパティを登録する場合は"(空文字列)"を使用して　以降のプロパティを記述する
    すべて単一の文字列で
    例
"./sample/KD/B001.png///ping///pong"
*/
nas.AnimationElementSource.prototype.parseContent = function(srcString){
    if(typeof srcString == 'undefined') srcString = this.contentText;
    var srcData=String(srcString).split('///'); 
    this.file=(srcData[0])?srcData[0]:null;
    this.subLocations=((srcData[0])&&(srcData[1]))? srcData[1].split(','):[];
    if(srcData[2]){
        var props=srcData[2].split(',');
        for (var pidx=0 ;pidx<props.length;pidx++){
            var prop = props[pidx].split('=');
            this[prop[0]]=prop[1];
        }
    }
    this.contentText = this.toString();
    return this.contentText;
}
nas.AnimationElementSource.prototype.toString=function(exportForm){
    if (! exportForm) {
        return this.contentText;
    }else{
        var myResult=[];
        myResult.push(this.file);
        if(
            (this.subLocations.length)||
            (
                (this.duration)||
                (this.startOffset)||
//                (! this.framerate.sameAs(nas.pmdb.activeProduct.framerate))||
                (! this.framerate.sameAs(nas.FRATE))||
                (this.type!="still-src")
            )
        ){
            if (this.subLocations.length) {
                myResult.push(this.subLocations.join(','));
            }else{
                myResult.push('');
            }
            var props=[];
            if(this.duration)           props.push("dutation="+this.duration);
            if(this.startOffset)        props.push("startOffset="+this.startOffset);
//            if(! this.framerate.sameAs(nas.pmdb.activeProduct.framerate))
            if(! this.framerate.sameAs(nas.FRATE))
                                        props.push("framerate="+this.framerate.toString());
            if(this.type!="still-src")  props.push("type="+this.type);
            myResult.push(props.join(','));
        }
        return myResult.join('///');
    }    
}
/*TEST
var testString='./test/Folder/kachi#00[pilot]__s-c004_s-c012/KD/kachi#00[pilot]__s-c004_s-c012///KD/A/001///'
A= new nas.AnimationElementSource(testString);
A
*/

//区間要素群のtoString()	メソッドの仕様

/*
	Obj.toString() 又は  Obj.toString(0 or false)
	代表値を保存形式出力で
	Obj.toString(出力キーワード) 又は  Obj.toString(1 or true)
	先頭 \t フィールドデリミタ \n でフルスペック出力

	Obj.toString([プロパティ名配列])
	指定プロパティを先頭 \t フィールドデリミタ \n で列挙
        
	
実際の使用時は以下の例のように利用
	xMapElement.content.toString("all");
	xMapElement.toString() //内部的にcontent.toString()にアクセス
	
メモ:
関数仕様
エレメント又はその値のtoString()で xMap の出力を得る

toString():引数なし	標準型
toString("all"):true ? 全プロパティ出力
toString(propName):プロパティ名  単独プロパティ
toString([propNames]):プロパティ名配列  指定プロパティを改行で区切って連続で与える


例(セル):
AnimationRreplacement.toString();

戻値
'A	A-1	"c:\myWorkshop\dataStore\work01\c001\A\0001.png",120 mm,360 mm '

AnimationRreplacement.toString(["size.x","size.y","size.t"]);

戻値
'	size.x=120 mm
	size.y=360 mm
	size.t=linear
'

xMapElement.toString("all");
戻値
'A	A-1	"c:\myWorkshop\dataStore\work01\c001\A\0001.png"
	size.x=120 mm
	size.y=360 mm
	size.t=linear
'

例:
AnimationReplacement.toString()
戻値
B	B-1	"c:\\\\Users\\Me\\Desktop\\Datas\\B_00001.png",640pt,480pt,

これらの値がグループの場合と要素の場合で共通に使える仕様とすること

値に名前（ラベル）を与えるのは上位オブジェクトの役目なので上位オブジェクト側で、これらの値をラップした出力を得る
	group
[A cell]
//最低限、名前  + 値タイプ  （これが最も多い）
[A	cell	720,405]
//標準形式、[label type basicProp comment]
//これ以上の情報が継承以外で保持されている場合geometryの追加情報を個別型式で出力

セルグループのプロパティ
	セッションユニークID
	名前
	値	アニメーションフィールド

	セッションユニークID
	所属グループ
	名前
	値	アニメーションリプレースメントエレメント  ファイル実体とアニメーションフィールドを持つ複合オブジェクト

[A	CELL	254mm,142.875mm,]



*/
/*
	区間の値としてのオブジェクトとxMapElementの値を同一オブジェクトとする

	作成するオブジェクトのリスト＞＞トラックの種類だけ必要
nas.CameraworkDescription   単記述オブジェクト　下記を含むマルチパーパスオブジェクト
nas.AnimationDialog	        音響
nas.AnimationReaplacement   置きかえ（画像ーセル＊静止画と動画を双方含む）
nas.AnimationGeometry	    ジオメトリ（カメララーク）
nas.AnimationComposite	    合成（撮影効果）

システムグループのエントリは各オブジェクトをすべて含む可能性がある == システムのみグループのタイプと値のタイプが異なる
XPSグループのエントリは時間属性を持ったリプレースメントオブジェクトとして扱う

TEXTグループは、タイムシート上には配置されず区間の値となることは無い…と思う
字幕等 の  AnimationDialogに準ずるAnimationTextオブジェクトは、そのうち必要かも  

これでOK？

*/

/**

    Xps
        .stage  *
        .map    *
        .opus
        .title
        .subtitle
        .create_time
        .create_user
        .cut
        .framerate
        .memo
        .rate
        .scene
        .trin
        .trout
        .update_time
        .update_user
        .xpsTracks(XpsTrackCollection)

        .duration()
        .deleteTL()
        .getIdentifier()
        .getMap()
        .getNormarizedStream()
        .getRange()
        .getTC()
        .init()
        .insertTL()
        .isSame()
        .newTracks()
        .parseXps()
        .put()
        .reInitBody()
        .readIN()
        .time()
        .timeLine()
        .toString()

    nas.Xps.XpsTrackCollection
        .parentXps
        .jobIndex
        .length
        .duration
        .noteText

        .addSection()
        .duplicate()
        .getDuration()
        .insertTrack()
        .parseSoundTrack()?間違いなので削除
        .renumber()
        
    nas.Xps.XpsTimelineTrack (track-collection member)
        .index
        .xParent
        .length
        .duration
        .id
        .option
        .sizeX
        .sizeY
        .aspect
        .lot
        .blmtd
        .blpos
        .link
        .parent
        .sections   (XpsTimelineSectionCollection)

        .getDefaultValue()
        .duplicate()
        .parseTm()          test
        .parseSoudTrack()   test

    nas.Xps.XpsTimelineSectionCollection    セクションキャリア(配列ベース)
        .parent 親セクション又はトラック

        .addSection()   値を置いてセクションを追加する
        .getDuration()  セクションの値を合計して継続時間をフレーム数で戻す
        
    nas.Xps.XpsTimelineSction   セクションメンバ
        .id             セクションの現行index  ==parent.sections[id]
        .parent         タイムライントラック  
        .duration       継続時間（フレーム数）
        .value          .this.mapElement.value  または同等の値オブジェクト
        .mapElement     nas.xMap.xMapElement  値へは.value経由でアクセスする
        .subSections    


    nas.xMap.xMapElemnet
        .id uniq-index/int
        .parent xMapGroup
        .link   PmJob
        .type   parent.type / erement-type
        .name   element label
        .content    タイプごとの値オブジェクト
        .comment    申し送りコメント

 */

/**
	複合形式記述群をパース
	各値は、順不同ですべて基本的に単位ポストフィックス付きの文字列（推奨｜優先）とする
	単位ポストフィックスなしの数値はUnitValue（pt）として扱う
長さ
	10mm,123.5cm,in,pt,q,ft....
角度
	1.13rad,176d
解像度
	144dpi,38dpc
強度
	120%
フレーム指定
	120F,96fr
フィールド指定
	12FLD3N1S12C
	
unitValueは値の出現順に width,height,offset.X,offset.Y として解釈される
	V
		width	
	V,V
		width,height
	V,V,V
		width,height,X
	V,V,V,V
		width,height,X,Y
Replacement
	source,[size.x,size.y,offset.x,offset.y,offset.r,resolution(X=Y)]
Geometry
	source,[size.x,size.y,offset.x,offset.y,offset.r,scaleField||scale]
	source,inchField
	ジオメトリにインチフィールドが指定された場合は、他の指定は無視される
Composite
	source,strength
	コンポジットの指定はstrengthのみが有効 最初のnumeric|percentを使用
*/
nas.parseDataChank =function(dataChank){
	if((typeof dataChank=='undefined')||(String(dataChank).length==0)) return [];
	dataChank=csvSimple.parse(dataChank)[0];
//console.log(dataChank);
	var dataForms=[];
	for(var dix=0;dix<dataChank.length;dix++){
		var dataType  ='source';
		var target =String(dataChank[dix]).trim();
		if(target.match( /^[+-]?\d+\.?\d*$/ )){
			dataType='numeric';
			dataChank[dix] = parseFloat(target);
		}else if (nas.BlendingMode[target]){
			dataType='blendingMode';
		}else if(target.match(/^(\d+\.?\d*FLD)(\d+[NS])?(\d+[EW])?(\d+\.?\d*[CA]?)?$/i)){
			dataType='inchField';
			dataChank[dix] = target;
		}else if(target.match(/^(\d+\.?\d*)(FR?L?)$/i)){
			dataType='scaleField';
			dataChank[dix] = target;
		}else if(target.match(/^[+-]?\d+\.?\d*(\D+)$/)){
			var unitString = RegExp.$1;
			if(unitString.match(nas.UNITRegex)) dataType='unitValue';
			else if (unitString.match(/rad|d|degrees|°/i)) dataType='unitAngle';
			else if (unitString.match(/dpi|dpc|ppi|ppc|lpi|lpc/i )) dataType='unitResolutions';
			else if (unitString == '%') dataType='percent';
			dataChank[dix] = target;
		}
		dataForms.push({type:dataType,value:dataChank[dix]});
	}
	return(dataForms);
}
/*TEST
nas.parseDataChank('"files",12FLD2S3W12C,120dpi');
*/

nas.parseField=function parseField(FieldString){
	if(FieldString.match(/^(\d+\.?\d*FLD)(\d+[NS])?(\d+[EW])?(\d+\.?\d*[CA]?)?$/i)){
		return ({
			FRM:	RegExp.$1,
			LEF:	RegExp.$2,
			TOP:	RegExp.$3,
			ROT:	RegExp.$4
		});
	}else{
		return false;
	}
}
/*TEST
nas.parseField('12FLD3n12');
nas.parseField('120F');

*/
nas.parseFrame=function parseFrame(FrameString){
	if(FrameString.match(/^(\d+\.?\d*)(FR?L?)$/i)){
		return ({
			TYP:	(String(RegExp.$2).toUpperCase()=='FR')? "fr":"fl",
			VLU:	parseFloat(RegExp.$1),
		});
	}else{
		return false;
	}
}
/*TEST
nas.parseFrame('12FLD3n12');
nas.parseFrame('120F');

*/



/**
 *    @desc nas Object base property
 */
/**
 * カレントユーザ文字列
 * ここで参照して、以降はグローバルを使用しないようにする2011/08/17
 * クッキーに保存したので　クッキー読み取り時に更新
 */
nas.CURRENTUSER = new nas.UserInfo(config.myName);
console.log("common:")
console.log(nas.CURRENTUSER)
/**
 * 時間関連設定
 * @type {Number}
 */
nas.ccrate = 1000;	//最少計測単位(javascriptではミリ秒固定)
nas.MODE = "clock";	//表示の初期モード(時計) ストップウオッチ用共用変数
nas.ClockOption = 12;	//時計の初期モード (12時制) ストップウオッチ用共用変数
nas.STATUS = "stop";	// ウオッチ用共用変数
/**
 * フレームレート    ここの並びでループする 100fps 24FPS 30NDF 30DF 25FPS
 * @type {string[]}
 */
nas.RATEs = ['100fps', '24FPS', '23.976FPS', '30NDF', '30DF', '25FPS', '48FPS'];
nas.RATE = '24FPS';

//基準変数
//名前付け規則は、以下に準ずる
//スクリプト上の変数名は、大文字のみ
//フォーム上の同名のエレメントは 小文字で綴り初めて 大文字で綴り終わる記法で
//複合単語は、前置語を小文字、後置語を大文字

/**
 * サンプル基準値
 * サンプルフレームレート(フレーム継続時間に置き換えるか一考)
 * @type {Object | nas.Framerate}
 */
// nas.FRATE = 24;
nas.FRATE = nas.newFramerate(nas.RATE);
/**
 * サンプル解像度ppc(dpc)
 * @type {Number}
 */
//nas.RESOLUTION = 144. / 2.540;//dpc
nas.RESOLUTION = new nas.UnitResolution("96ppi",'dpc');//nas関数が変動ユニットに未対応なので現在は'dpc'を指定のこと2019.01
/**
 * サンプル基準寸法(mm)
 * @type {Number}
 */
nas.LENGTH = 225.;//nas.LENGTH = new nas.UnitValue("254mm") ;//フレーム基準寸法(横幅)
/**
 * フレームアスペクト（参考値 横／縦）
 * @type {Number}
 */
nas.ASPECT = 16 / 9;
/**
 * ピクセルアスペクト（参考値 横／縦）
 * @type {Number}
 */
nas.PIXELASPECT = 1;
/**
 * サンプル基準フレーム(fl)
 * @type {Number}
 */
nas.FRAME_L = 100;

/**
 * カット番号連番
 * @type {Boolean}
 */
nas.ShotNumberUnique = true;

/**
 * シーン番号表示
 * @type {Boolean}
 */
nas.SceneUse = false;

/**
 * FCTインターフェース関連
 *  @type {Number}
 * タイムシート継続時間 秒/枚
 */
nas.SheetLength = ((config)&&(config.SheetLength))? config.SheetLength:SheetLength;

/**
 * @desc FCTインターフェースをドロップフレーム対応とする
 *
 * 基本的なドロップメソッドはカウント母数を Math.ceil(nas.FRATE)として
 * 誤差が蓄積次第秒の末尾フレームをドロップカウントする事で行う。
 * nas.SheetLengthは実際の消化フレームととらえると枚数ごとの不定値となるので
 * 秒数で置いて一定値を得ることにする(仕様変更)
 */


/**
 * fl : Fields アニメーション撮影フレーム(traditional)
 * 基準値は計算レタスフレームを基準にしたほうが計算回数がいくらか減りそう?
 * @type {Number}
 */
nas.SCALE = 1;//サンプル拡大比率(実数)

/**
 * @desc for AEkey
 */

/**
 * @desc コンポ情報
 * 計算に必要な情報は、コンポを切り換えるタイミングで再初期化する?
 * または、手動で初期化トリガを打つか?
 */

/**
 * コンポジション３Ｄカメラ情報 > オブジェクト化すること
 * @type {Number}
 */
nas.FOCUS_D = 50; //レンズ焦点距離 (mm)
nas.FILM_W = 36;//FILM Width (mm)
nas.FILM_H = 24;//FILM Height(mm)
/**
 * イメージサークル直径(mm)
 * @returns {Number}
 * @constructor
 */
nas.IMAGE_CR = function () {
    return Math.sqrt(Math.pow(this.FILM_W, 2) + Math.pow(this.FILM_H, 2))
};


/**
 * コンポジション設定 > オブジェクト化すること
 * @type {Number}
 */
nas.COMP_W = 720;//comp Width (px);
nas.COMP_H = 486;//comp Height(px);
nas.COMP_A = 0.9;//comp Aspect(W/H);

/**
 * @returns {Number}
 */
nas.COMP_D = function () {
    return Math.sqrt(Math.pow(this.COMP_W * this.COMP_A, 2) + Math.pow(this.COMP_H, 2));
};

/**
 * @returns {Number}
 */
nas.CAMERA_D = function () {
    return (this.COMP_D() * this.FOCUS_D) / this.IMAGE_CR();
};


/**
 * レイヤ・フッテージ設定
 * 今のところキーに添付するだけの値(変換には無関係)
 * @type {Number}
 */
nas.SRC_W = 720;//source Width (px);
nas.SRC_H = 486;//source Height(px);
nas.SRC_A = 0.9;//source Aspect(W/H);
/**
 * AE-Key data 出力関連の変数(初期値)
 * @type {string}
 */
nas.AE_Ver = "8.0";// 4.0/5.0/6.0/6.5/7.0/8.0 AE CS3
nas.KEY_STYLE = "withTime";//or "valueOnly"
nas.KEY_TYPE = "Scale";// or "Position"

/**
 * @desc 子変数 親変数から導かれる表示データ(または派生データ)
 * 変数名は、大文字ではじまり 後ろは小文字のみ
 * フォーム上の同名のinputは極力大文字のみで表記
 */

/**
 * Resolution objectを作成してそちらへ移行
 *
 * nas.Resolution
 * nas.Resolution.dpc
 * nas.Resolution.dpi
 */

/**
 * RESOLUTION 派生変数 ラムダ関数試験
 * @returns {Number}
 */
	nas.Dpi = function(){return this.RESOLUTION.as('dpi');} ;
/**
 *
 * @returns {number|*}
 * @constructor
 */
	nas.Dpc = function(){return this.RESOLUTION.as('dpc');} ;
/**
 * nas.ClipingFrame objectを作成してそちらへ移行
 * nas.ClipingFrame.size    :nas.Geometry
 * nas.ClipingFrame.height
 * nas.ClipingFrame.scale
 * nas.ClipingFrame.offset
 * nas.ClipingFrame.rotation
 * nas.ClipingFrame.traditionalFrames
 * nas.ClipingFrame.retasFrames
 * nas.ProductSpeckに統合？
 */

/**
 * FRAME_L 派生変数
 * nas.FRAMEl = function () {
 *            this.FRAME_L;
 *        };
 * nas.FRAMEr = function () {
 *            this.fl2fr(this.FRAME_L);
 *        };
 * ここまではプロパティ
 */
/**
	@params	{Array|String} strg
	文字列先頭の共通部分を抽出する汎用関数
	引数は、配列を含む文字列の集合
	引数が単独文字列の場合は文字列全体を返す
*/
nas.detectCommonPrefix = function(strg){
	if (typeof strg == 'string' ) strg = [strg];
	if (arguments.length > 1){
		for (var a = 1;a < arguments.length; a ++) strg = strg.concat(arguments[a]);
	};
	var result = strg[0];
	for (var i = 1 ;i < strg.length ; i ++){
		for (var k = result.length ; k > 0 ; k --){
			if(strg[i].startsWith(result.substring(0,k))){
				result = result.substring(0,k);break;
			};
		};
		result = strg[i].slice(0,k);
	};
	return result;
};
/*TEST
var list = ["ABC-1234","ABC-1235","ABC-1236","ABC-1236a"];
var prfx = nas.detectCommonPrefix(list);

	Array.from(list,function(elm){
	    if((typeof elm == 'string')&&(elm.indexOf(prfx)==0)){
		    return elm.slice(prfx.length);
	    }else{
		    return elm;
	    };
	});
*/
/**
 * z距離>比率換算<br />
 * <br/>
 * 比率1(100%)を距離0に置いた場合の 任意のレイヤプロパティｚ軸値(AE互換)から比率
 * を求める関数
 *  nas.CAMARA_Dプロパティに依存
 *
 * @params  {Number} dt 距離(pixel)
 * @returns {Number} z軸位置に相当する拡縮比率
 */
nas.dt2sc = function (dt) {
    return (this.CAMERA_D() / ((1 * dt) + this.CAMERA_D()))
};
/**
 * 比率>z距離換算<br />
 * <br />
 * 比率1(100%)を距離0に置いた場合の 任意の比率となるレイヤプロパティｚ軸値
 * （AE互換）を求める関数
 *  nas.CAMARA_Dプロパティに依存
 * @params {Number} sc 拡縮比率
 * @returns {Number} 比率に相当するAEのZ軸位置(pixel)
 */
nas.sc2dt = function (sc) {
    return ((this.CAMERA_D() / (1 * sc)) - this.CAMERA_D())
};

/**
 * @desc フレーム関連換算関数
 * 一々書いても間違えそうなのでまとめておく。
 *
 * fl は、旧来のアニメーション撮影フレーム（field）・スタンダード値100：比例値
 * fr は、レタス撮影フレーム(要検証)・同スタンダード値100：比例値
 * sc は、倍率
 * FRAME_Lは、基礎情報として基準フレーム数をfl値で与えること
 *
 * @params  {Number} fl
 * @returns {Number}
 */
nas.fl2fr = function (fl) {
    return ((fl * 1 + 60) / 1.60)
};
/**
 * @params  {Number} fr
 * @returns {Number}
 */
nas.fr2fl = function (fr) {
    return ((fr * 1.60) - 60)
};

/**
 * @params  {Number} fl
 * @returns {Number}
 */
nas.fl2sc = function (fl) {
    return ((160 * ((this.FRAME_L * 1) + 60)) / (160 * ((fl * 1) + 60)))
};
/**
 * @params  {Number} fr
 * @returns {Number}
 */
nas.fr2sc = function (fr) {
    return (this.fl2sc(this.fr2fl(fr)))
};
/**
 * @params  {Number} sc
 * @returns {Number}
 */
nas.sc2fl = function (sc) {
    return ((((160 * (this.FRAME_L + 60)) / (sc * 1)) / 160) - 60)
};
/**
 * @params  {Number} sc
 * @returns {Number}
 */
nas.sc2fr = function (sc) {
    return (this.fl2fr(this.sc2fl(sc)))
};

/**
 * 拡大率変換関数
 * kac(基準量,目標量,助変数)
 * 戻り値は Stratを0 Endを1 に置いた助変数に対応する寸法
 *
 * @params  {Number} StartSize
 * @params  {Number} EndSize
 * @params  {Number} timingValue
 * @returns {Number}
 *      助変数に対応する値
 */
nas.kac = function (StartSize, EndSize, timingValue) {
    if (timingValue == 0 || timingValue == 1) {
        if (timingValue == 0) {
            var resultS = StartSize
        }
        if (timingValue == 1) {
            var resultS = EndSize
        }
    } else {
/**
 * 求める寸法は
 *
 * まず開始寸法を1として終了寸法の開始寸法に対する比率を求める
 * EndSize/StartSize
 * 距離評価係数として 比の逆数を開始点と終了点で求める。
 * 開始点距離評価係数 1/1 = 1
 * 終了点距離評価係数 1/(EndSize/StartSize) = StartSize/EndSize
 *
 * 与えられた助変数に対応する距離評価係数を求める。
 * ((終了点距離評価係数 - 開始点距離評価係数) * 序変数) + 開始点距離評価係数
 * = (((StartSize/EndSize) - 1) * timingValue) + 1
 * 評価係数の逆数をとって比率を得る
 * 比率を開始寸法に掛ける
 * 開始寸法 * 距離評価係数
 * = StartSize / ((((Startsize/EndSize) - 1) * timingValue) + 1)
 */
        resultS = StartSize / ((((StartSize / EndSize) - 1) * timingValue) + 1);
    };
    return (resultS);
};

/**
 * kacの逆関数
 * cak(基準量,目標量,任意寸法)
 * 戻り値は助変数を最大精度で
 *
 * @params  {Number} StartSize
 * @params  {Number} EndSize
 * @params  {Number} TargetSize
 * @returns {Number}
 */
nas.cak = function (StartSize, EndSize, TargetSize) {
    /*
     まだ書いてないよ('o')
     */
    var resultT = 0;
    if (TargetSize == StartSize) {
        resultT = 0
    } else {
        if (TargetSize == EndSize) {
            resultT = 1
        } else {
            resultT = (((1 / TargetSize) - (1 / StartSize)) / ((1 / EndSize) - (1 / StartSize)))
        }
    }
    return (resultT);
};


/**
 * ゼロ埋め ZERROfilling
 * @params  {String}   N
 * @params  {Number}   f
 * @returns {String}
 *<pre>
 * 数値を指定桁数の０で埋めて桁合わせして戻す
 * 数値以外の文字が後置されていた場合、後置部は捨てられる
 * 指定桁数がない場合は引数をそのまま戻す
 * 指定桁数が引数の桁よりも少ない場合は何も操作されない
 * 数値が小数部を含む場合は、整数部を指定桁数に揃える
 * 数字以外の文字が前置されていた場合はNaNを戻す
 * 今回の修正で以下の変更が行われるため要注意  2017.10.18
 * 引数 旧戻値  新戻値
 * ("0123",0) "0123" "123"
 * ("0123A",0) "0123A" "123"
 * </pre>
 */
nas.Zf = function (N, f) {
    var prefix  = "";
    var postfix = "";
    var decimalPart = 0;

    N = parseFloat(N);
    if(isNaN(N)) return N;
    if (N < 0) {
        N = Math.abs(N);
        prefix = "-"
    }
    if(N != Math.floor(N)){
        postfix = String(N).replace(/^\d+\./,'\.');
        N = Math.floor(N);
    }
    
    if (String(N).length < f) {
        return prefix + ('000000000000000000000000000000000000000000000000' + String(N)).slice(String(N).length + 48 - f, String(N).length + 48) + postfix;
    } else {
        return prefix + String(N) + postfix;
    }
};
/*test
console.log(nas.Zf("123",4));//0123

*/
/**
 * 前後文字列つきゼロ埋め(動画番号等の正規化)
 *
 * @params {String} myName
 * @params {Array of Number|Number} num
 * @returns {String}
 * 
 文字列内の（少数以下を含む）数値部をすべて処理する仕様に変更
 ナンバー引数を配列に変更
 配列要素数が処理部の数を下回る場合は、残り引数は0（桁わせの削除）とする
 引数が配列でなく数値一つの場合は、すべての処理要素に同じ値を適用する
 引数:'A123-3456Bx33.2',4
 旧リザルト  :A0123-56Bx33.2
 新リザルト  :A0123-0056Bx0033.2

 引数:'A123-3456Bx33.2',[4,3]
 旧リザルト  :A0123-56Bx33.2
 新リザルト  :A0123-056Bx033.2

 引数:'A123-3456Bx33.2',[4];//旧リザルト互換
 旧リザルト  :A0123-56Bx33.2
 */
nas.RZf = function (myName, num) {
    if(myName == '') return '';
    if (typeof num == "undefined") num = 0;
    var opStrings = String(myName).match(/[^\d]*(\d+\.?\d*)|[^\d]+$/g);
    if (!(num instanceof Array)){
        var numArray = [];
        for (var i =0 ; i < opStrings.length; i ++) numArray.push(num);
    }else{
        var numArray = num;
    }
    var resultArray = [];
    for (var op = 0 ; op < opStrings.length ; op ++){
        if (String(opStrings[op]).match(/([^\d\.]*)(\d+\.?\d*)/)) {
            if(numArray[op]){
                resultArray.push(RegExp.$1 + nas.Zf(RegExp.$2,numArray[op]));
            }else{
                resultArray.push(RegExp.$1 + nas.Zf(RegExp.$2, 0));
            }
        }else{
            resultArray.push(opStrings[op]);
        }
    }
        return resultArray.join('');
};
/* //test
    console.log (nas.RZf('A123,012.0123xBB034HYjr',4));
    console.log (nas.RZf('A123q012.0123xBB034HYjr',[4]));
    console.log (nas.RZf('A123,012.0123xBB034HYjr',[4,6,7]));
*/
/**
 * 時間フレーム変換
 * @params  {Number} ms
 * @params  {Number} fpsC
 * @returns {Number}
 */
nas.ms2fr = function (ms,fpsC) {
    if(! fpsC) fpsC = this.FRATE.rate;
    if(fpsC instanceof nas.Framerate) fpsC = fpsC.valueOf()
    return (Math.floor(fpsC * (ms / 1000)));
};//ミリ秒からフレーム数 実時間切捨て整数フレーム
/**
 * @params  {Number Int} frm
 * @params  {Number} fpsC
 * @returns {Number}
 */
nas.fr2ms = function (frm,fpsC) {
    if(! fpsC) fpsC = this.FRATE.rate;
    if(fpsC instanceof nas.Framerate) fpsC = fpsC.valueOf()
    return (Math.floor(1000 * frm / fpsC));
};//フレームからミリ秒 浮動少数

/**
 * @params {Number} ms
 * @params {Number} type
 *		0-8
 * @params {Boolean|Number} ostF
 * @params {Number|Object nas.Framerate} fpsC
 */
nas.ms2FCT = function (ms, type, ostF, fpsC) {
    if (!type) type = 0;
    if (!ostF) ostF = 0;
    if(! fpsC) fpsC = this.FRATE.rate;
    if(fpsC instanceof nas.Framerate) fpsC = fpsC.valueOf();
    if ((type > 5)&&(type < 8)) {
// type 6 7 フレームレート強制
        fpsC = 29.97 * (type - 5);
    };
    var myFrms = Math.floor((ms * fpsC) / 1000);
    return this.Frm2FCT(myFrms, type, ostF, fpsC);
};

/**
 * @params  {String} fct
 * @params  {Number} fpsC
 * @returns {Number}
 */
nas.FCT2ms = function (fct,fpsC) {
    if(! fpsC) fpsC = this.FRATE.rate;
    if(fpsC instanceof nas.Framerate) fpsC = fpsC.valueOf();
    return 1000 * (this.FCT2Frm(fct,fpsC)) / fpsC;
};
/**
 * カウンタ文字列生成
 * ドロップ対応版 2010/11/04
 * SMPTE ドロップ30対応 2010/11/05
 * モード指定 type6
 * 30DF 60DF のみをサポートの予定 どちらのモードも0オリジン
 * 指定モードとしてtype6(30df)/7(60df)を与える
 * type7は30DF互換なので30DFと同じタイミングで4フレームドロップカウントする
 * type8を増設 電卓のTC互換でオリジネーション0固定
 *  最後のセパレーターが変化する
 *  24fps  "+"
 *  25fps  "-"
 *  10|100fps "."(小数点)
 *  1000fps   ","(仏語の小数点)
 *  その他 ":"(デフォルト)
 * 小数部のあるフレームレートの場合は、ナチュラルドロップ
 * @params {Number|String} frames
 *       Int /time value
 * @params {Number} type
 *       Int 0 - 8/TC type
 * @params {Boolean|Number} ostF
 *       Int or bool/count origination(offsetFrames)
 * @params {Number|Object nas.Framerate}  fpsC Number or Object nas.Framerate/ framerate of value
 * @returns {*}
 * @constructor
 */
nas.Frm2FCT = function (frames, type, ostF, fpsC) {
    frames = parseInt(frames);
    if(isNaN(frames)) frames ='0';
    if (!type) type = 0;
    if(! fpsC) fpsC = this.FRATE.rate;
    if(fpsC instanceof nas.Framerate) fpsC = fpsC.valueOf()
    if ((type == 6) || (type == 7)) {
        /*	SMPTE 30DF/type6 60DF/type7*/
        var dF = 2589408;
        var hF = 107892;
        var dmF = 17982;
        var lmFd = 1798;
        var lmFc = 1800;
        var sF = 30;
        var dropF = 2;
        if (type == 7) {
            dF = dF * 2;
            hF = hF * 2;
            dmF = dmF * 2;
            lmFd = lmFd * 2;
            lmFc = lmFc * 2;
            sF = sF * 2;
            dropF = dropF * 2;
        }
// 負数は24hの補数化して解決
        var FR = (frames < 0) ? dF + (frames % dF) : frames;
        var h = 0;
        var m = 0;
        var s = 0;
        var f = 0;
        h = Math.floor((FR / hF) % 24);//SMPTE TCは24時ループ
// mを10分単位でクリップすると計算が単純化される
        var fRh = FR % hF;//未処理フレーム
        var md = Math.floor(fRh / dmF);//10分単位
        var mu = ((fRh % dmF) < lmFc) ? 0 : Math.floor(((fRh % dmF) - lmFc) / lmFd) + 1;//10分以下の分数
        m = (md * 10) + mu;//加算して分数
        var fRm = fRh - (dmF * md) - (lmFd * mu);//
        fRm -= (mu == 0) ? 0 : dropF;//正分まで処理を終えた残フレーム
        s = (mu == 0) ? Math.floor(fRm / sF) : Math.floor((fRm + dropF) / sF);//秒数・例外を除きドロップ2フレ補償
        var fRs = ((mu == 0) || (s == 0)) ? fRm - (s * sF) : fRm - (s * sF) + dropF;
        f = ((mu == 0) || (s != 0)) ? fRs : fRs + dropF;
        return nas.Zf((h % 24), 2) + ":" + nas.Zf(m, 2) + ":" + nas.Zf(s, 2) + ";" + nas.Zf(f, 2);
    } else if(type == 8){
        /*	SMPTE 風 hh:mm:ss:ff */
        var dF   = fpsC * 86400;//dayFrames
        var hF   = fpsC * 3600 ;//hourFrames
// 負数は24hの補数化して解決
        var FR = (frames < 0) ? dF + (frames % dF) : frames;
        var h = Math.floor((FR / hF) % 24);//SMPTE TCは24時ループ
        var m = Math.floor( FR / (fpsC * 60)) % 60;//
        var s = Math.floor( FR / fpsC) % 60;
        var f = Math.floor( FR % fpsC);
        var keySeparator = ":";
        var frdig = 2;
        if(fpsC == 24){
            keySeparator = '+';
        }else if (fpsC == 25){
            keySeparator = '-';
        }else if (fpsC == 100){
            keySeparator = '.';
        }else if (fpsC == 1000){
            keySeparator = ',';
            frdig = 3;
        };
        return nas.Zf((h % 24), 2) + ":" + nas.Zf(m, 2) + ":" + nas.Zf(s, 2) + keySeparator + nas.Zf(f, frdig)+'.';
    }else{
        /**
         *  通常のTCを作成
         */
        var PostFix;var negative_flag;
        var negative_flag = false;
        if (frames < 0) {
            frames = Math.abs(frames);
            negative_flag = true;
        }
        if (ostF == 1) {
            PostFix = ' _';
        } else {
            ostF = 0;
            PostFix = '';//' .'
        }
//
//	default	00000
//	type 2	0:00:00
//	type 3	000 + 00
//	type 4	p 0 / 0 + 00
//	type 5	p 0 / + 000
//		type 6	00:00:00;00
//		type 7	00:00:00;00
//  type 8  00:00:00[:-+.]00
//
        var m = Math.floor((frames + ostF) / (fpsC * 60));
        var s = Math.floor((frames + ostF) / fpsC);
        var SrM = s % 60;
        var p = Math.floor(s / this.SheetLength) + 1;//SheetLength秒数で計算
        var FrS = Math.floor(frames - (s * fpsC)) + ostF;//秒単位端数フレーム
        var FrP = Math.floor(frames - (((p - 1) * this.SheetLength) * fpsC)) + ostF;//ページ
        var SrP = s - ((p - 1) * this.SheetLength);//ページ単位端数 秒
        var Counter;
        switch (type) {
            case 5:
                Counter = 'p ' + this.Zf(p, 1) + ' / +' + this.Zf(FrP, 3) + PostFix;
                break;
            case 4:
                Counter = 'p ' + this.Zf(p, 1) + ' / ' + SrP + ' + ' + this.Zf(FrS, 2) + PostFix;
                break;
            case 3:
                Counter = this.Zf(s, 1) + '+' + this.Zf(FrS, 2) + PostFix;
                break;
            case 2:
                Counter = this.Zf(m, 1) + ':' + this.Zf(SrM, 2) + ':' + this.Zf(FrS, 2) + PostFix;
                break;
            default:
                Counter = this.Zf(frames + ostF, 4) + PostFix;
        }
        if (negative_flag) {
            Counter = "-( " + Counter + " )"
        }
        return Counter;
    }
};
/*TEST
    type 8
    nas.Frm2FCT(nas.FCT2Frm('01:23:32+01',24),8,"",24);
*/
/**
 * nas.FCT2Frm(Fct,fpsC,check)
 * 引数 :タイムカウンタ文字列[,カウンタフレームレート][,タイプ判定オプション]
 * 戻値 :フレーム数  または  TCタイプ判別オブジェクト プロパティを下げたNumberオブジェクトで
 *
 * カウンタ文字から0スタートのフレーム値を返す
 * カウンタ文字列と認識できなかった場合は'元の文字列'を返す[仕様変更]
 * ドロップフレームが指定された場合はフレームを戻さず上記に準ずる
 *
 * タイムカウンタ文字列はFrm2FCT()の文字列を全て認識して解決する
 * 負数対応
 * フレームレートの指定が可能なように拡張(2010/11/06)
 * 指定がない場合 nas.FRATE を参照する

 * カウンタ文字列にページ指定がある場合は nas.SheetLength を参照する
 * この変数の一時指定はできないので、システムプロパティを直接書き直す必要がある
 *
 * SMPTEドロップを拡張(2010.11.05)
 * 最終セパレータが";"であるか否か
 * 文字列末尾のオリジネーション指定はあってもよいが無効（全て0オリジン）
 * フレームレートは30DF 60DFでは強制指定が行われたものとする。
 * 中間の45fpsを閾値としてnas.FRATEがそれ以下の場合は30DF
 * それ以上の場合は60DFのフレーム数を返す
 * 本来60DFはSMPTEの規格外なので扱いに注意すること
 * 
 * 近来  23.8 (ドロップ互換24fps)が広範に利用されているのでそろそろ考慮必要？
 * TCタイプを判定する関数が必要だが、このメソッドを拡張するのが良さそう
 * 23.89fps は、SMPTEドロップの規定を使用しない方向で運用されているので、ナチュラルドロップカウントを適用
 * 
 * TC文字列判定機能増設 キーは第三引数に何かあれば  判定オブジェクトを返す
 * 判定オブジェクトは  Number にして計算可能  プロパティが付加される
 *    Number.type     TCタイプ
 *    Number.offset   オリジネーション
 * @params {String} Fct
 * @params {Number} fpsC
 * @returns {Number}
 *          フレーム数
 */
nas.FCT2Frm = function (Fct, fpsC) {
    if (typeof Fct == 'undefined') return false;
    if(! fpsC) fpsC = this.FRATE.rate;
    if(fpsC instanceof nas.Framerate) fpsC = fpsC.valueOf();
    var fct = String(Fct);
    var negative_flag = 1;
    var myFrames;//
    var ostF;
    var PostFix;
    var TCtype;
    var tmpTC;
// 負数表示がある場合ネガティブモードに遷移
    if (fct.match(/^\-\(([^\(\)]*)\)$/)) {
        fct = RegExp.$1;
        negative_flag = -1;
    }
// 空白を全削除
    fct = fct.replace(/\s/g, '');
// 文字列の最期の文字を評価してオリジネーションを取得
    ostF = (fct.charAt(fct.length - 1) == '_')? 1 : 0 ;
    PostFix = ['.','_'][ostF];
// 文字列の最期の文字がポストフィックスなら切り捨て
    if (fct.charAt(fct.length - 1) == PostFix) {fct = fct.slice(0, -1)};
// 初期判定で SMPTE-DFを分離 TCtype 6 or 7
    if (fct.match(/^([0-9]+:){0,2}[0-9]+;[0-9]+$/)) {
// SMPTE hh:mm:ss;ff
// ポストフィックス判定を一旦破棄して  ostF = 0; にセットする  
        fct = fct.replace(/;/g, ":");//セミコロンを置換
        fpsC = (fpsC < 45) ? 29.97 : 59.94;//SMPTEドロップが指定されたので強制的にフレームレート調整
        ostF = 0;
        PostFix = "";
        TCtype = (fpsC < 45)?  6 : 7;
// 一時係数設定
        var dF = 2589408;
        var hF = 107892;
        var dmF = 17982;
        var lmFd = 1798;
        var lmFc = 1800;
        var sF = 30;
        var dropF = 2;
        if (fpsC >= 45) {
            dF = dF * 2;
            hF = hF * 2;
            dmF = dmF * 2;
            lmFd = lmFd * 2;
            lmFc = lmFc * 2;
            sF = sF * 2;
            dropF = 4;
        }
// 60DF
// TCをスプリットして配列に入れる
        tmpTC = [];
        tmpTC = fct.split(":");
        var h = 0;
        var m = 0;
        var s = 0;
        var f = 0;

        switch (tmpTC.length) {
            case 4:
                h = tmpTC[tmpTC.length - 4] * 1;
            case 3:
                m = tmpTC[tmpTC.length - 3] * 1;
            case 2:
                s = tmpTC[tmpTC.length - 2] * 1;
            case 1:
                f = tmpTC[tmpTC.length - 1] * 1;
        }
// フレームドロップ判定
        if (((m % 10) > 0) && (s == 0) && (f < dropF)) {
 console.log('SMPTEドロップフレーム不正 : '+ fct);
           return null
        }
// ドロップフレームはヌル戻し
        var FR = h * hF;//時
        FR += Math.floor(m / 10) * dmF;//＋10分単位で加算
        FR += (m % 10) * lmFd;//ひとけた分乗算
        FR += ((m % 10) > 0) ? dropF : 0;//1分以上なら読み飛ばさなかったフレームを加算
        FR += s * sF;//秒数乗算
        FR -= (((m % 10) > 0) && (s > 0)) ? dropF : 0;//00 10 20 30 40 50 分の例外フレームを減算して解決
        FR += f;//フレームを加算
        FR -= (((m % 10) > 0) && (s == 0) && (f >= dropF)) ? dropF : 0;//例外ドロップフレームを減算
//ここで存在しないはずの ドロップされたフレームは減算対象外にして後ろに送る
        myFrames = FR * negative_flag;
    } else {
// 標準処理(ドロップ含む)
//	if (fct.match(/[0-9\:\p\/\+]/)) {return fct}
// ローカル変数初期化
        var p = 1;
        var h = 0;
        var m = 0;
        var s = 0;
        var k = 0;
// type 1    00000 ドロップは存在しない FR
        if (fct.match(/^[0-9]+$/)) {
            k = fct;
            TCtype = 1;
        } else {
// type 2    0:00:00 少数フレームレートの際にドロップ発生  TC
// type 8    00:00:00([:-+.]00|\,000)少数フレームレートの際にドロップ発生  TC
            if (fct.match(/^([0-9]+[:\-\+\.\,]){1,3}[0-9]+$/)) {
                if(fct.match(/[\-\+\.\,]/)){
                    fct    = fct.replace(/[\-\+\.\,]/g,':');
                    ostF   = 0 ;
                    TCtype = 8;
                }else{
                    TCtype = 2;
                }
// TCなのでスプリットして配列に入れる
                tmpTC = [];
                tmpTC = fct.split(":");
                switch (tmpTC.length) {
                    case 4:
                        h = tmpTC[tmpTC.length - 4];
                    case 3:
                        m = tmpTC[tmpTC.length - 3];
                    case 2:
                        s = tmpTC[tmpTC.length - 2];
                    case 1:
                        k = tmpTC[tmpTC.length - 1];
                }
            } else {
// type 3    000 + 00   trad-JA
                if (fct.match(/^[0-9]+\+[0-9]+$/)) {
                    s = fct.substring(0, fct.search(/\+/));
                    k = fct.substr(fct.search(/\+/) + 1);
                    TCtype = 3;
                } else {
                    /**
                     * type 4    p 0 / 0 + 00 page-SK
                     */
                    if (fct.match(/^p[0-9]+\/[0-9]+\+[0-9]+$/)) {
                        p = fct.slice(1, fct.search(/\x2F/));
                        s = fct.substring(fct.search(/\x2F/) + 1, fct.search(/\+/));
                        k = fct.substr(fct.search(/\+/) + 1);
                        TCtype = 4;
                    } else {
// type 5    p 0 / + 000 page-K
                        if (fct.match(/^p[0-9]+\/\+[0-9]+$/)) {
                            p = fct.slice(1, fct.search(/\x2F/));
                            k = fct.substr(fct.search(/\+/) + 1);
                            TCtype = 5;
                        } else {
// ダメダメ
                            TCtype = false;
                            return false;
                        };
                    };
                };
            };
        };
// 数値化して全加算
        p = parseInt(p, 10);
        h = parseInt(h, 10);
        m = parseInt(m, 10);
        s = parseInt(s, 10);
        k = parseInt(k, 10);
/*
 * 指定フレームがフレームレートを超える場合場合にかぎり桁上りを行って
 * 不規TCを正規化する
 */
         if (k > Math.ceil(fpsC)){
            s += Math.floor(k / fpsC);
            k =  k % Math.ceil(fpsC);
         } 
/*
 * タイムコード的にはすべて整数であることが必須
 * フレームレートが少数点以下の値を含む場合はすべて切り上げてフレームを得る
 *   (1+10.5)は(1+11)にあたる
 */
        var Seconds = (p - 1) * this.SheetLength + h * (60 * 60) + m * (60) + s;
        var Frames = Math.ceil(( Seconds * fpsC ) + k) - ostF;

/*
 * ナチュラルドロップフレームの判定 フレーム継続時間の末尾が秒境界をまたがった場合をドロップカウントする
 * 連続してフレームがドロップすることはありえないのでこのように判定
 * 整数フレームレート時に実行されていたので、トラップする 2012 0205
 * TCtype==1の際(フレームドロップが存在しないケース)に実行されていたので修正  20180718
 */
        if ((TCtype > 1)&&((fpsC % 1) != 0) && (Math.floor(Frames / fpsC) != (Seconds))) {
console.log('TC不正 : ' + fct);
            return null
        }
// この判定のため電卓の計算式に使用するときのトラップが発生するので注意(2010/11/06)
            myFrames = Frames * negative_flag;
    }
        if(arguments[2]){
            var myResult = new Number(myFrames);
            myResult.type=TCtype;
            myResult.origin=ostF;
            return myResult
        }else{
            return myFrames;
        }
};
/*  TEST
console.log(nas.FCT2Frm("timecode",24,true));
console.log(nas.FCT2Frm("000 .",24,true));
console.log(nas.FCT2Frm("1+12 _",12,true));
console.log(nas.FCT2Frm("01:01:01;01.",24,true));
console.log(nas.FCT2Frm("p12/3+0",24,true));
console.log(nas.FCT2Frm("00:01:00;00"));
console.log(nas.FCT2Frm("00:01:04:9",10.2));
console.log(nas.FCT2Frm("00:01:04:10",10.2));
console.log(nas.FCT2Frm("00:01:04:11",10.2));

*/
/**
 * @params  {String} myValue
 * @params  {Number} max
 * @params  {Number} min
 * @params  {Number} TCtype

 * nas.clipTC(myValue,max,min,TCtype)
 * TCで与えられた値を上限下限でクリップして返す
 * 上限値、下限値はフレーム数
 * TCタイプは指定がない場合は入力値と同じ
 * 最大値の指定がない場合は無限大
 * 最小値の値がない場合はマイナス無限大で
 */
nas.clipTC = function(myValue,max,min,TCtype){
    var f = nas.FCT2Frm(myValue,nas.FRAET,true);
    if( typeof TCtype == 'undfined') TCtype=f.type;
    var ostF = f.offset;
    if (f < min) f= min;
    if (f > max) f= max;
    return nas.Frm2FCT(f,TCtype,ostF,nas.FRATE);
}
/*
 * お道具箱汎用データ操作関数群
 * お道具箱汎用データ操作関数群オワリ
 */

/*
 * ベクトル演算関数群
 */
/**
 * @params {Array} vec1
 *          ベクトル配列1
 * @params {Array} vec2
 *          ベクトル配列2
 * @returns {Array}
 *          次数の揃ったベクトル（配列）２つ + 次数
 * nas.preformvector(vec1,vec2)
 * 引数:    ベクトル（配列）２つ
 * 戻値:    次数の揃ったベクトル（配列）２つ
 * ベクトル演算事前処理
 * 与えられたベクトルの次数を多いものに揃えて不足分に0を加えて返す
 * 内部使用なのでエイリアスは不要
 */
nas.preformvector = function (vec1, vec2) {
// 単項スカラだった場合、要素数1の配列に変換しておく。
    if (typeof(vec1) == "number") {
        vec1 = [vec1];
    }
    if (typeof(vec2) == "number") {
        vec2 = [vec2];
    }
// ベクトルの次数を求める 二次元か三次元か四次元か
    var difD = (vec1.length - vec2.length);
    var vecD = (vec1.length > vec2.length) ? vec1.length : vec2.length;
// 要素数の多い方をとって不足する要素は0で補う
    if (difD > 0) {
        for (var idx = 0; idx < difD; idx++) {
            vec2 = vec2.concat([0])
        };
    } else {
        if (difD < 0) {
            for (var idx = 0; idx > difD; idx--) {
                vec1 = vec1.concat([0])
            };
        };
    };
    return [vec1, vec2, vecD];
}
/**
 * @params {Array} vec1
 *          ベクトル配列1 
 * @params {Array} vec2
 *          ベクトル配列2
 * @returns {Array}
 *          各項を加算したベクトル配列
 * nas.add(vec1,vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:各項を加算したベクトル
 * ベクトル和を返す。
 */
nas.add = function (vec1, vec2) {
    var preformedVec = nas.preformvector(vec1, vec2);
    var vec3 = new Array(preformedVec[2]);
// 和を求めて返す。
    for (var idx = 0; idx < vec3.length; idx++) {
        vec3[idx] = preformedVec[0][idx] + preformedVec[1][idx]
    };
    return vec3;
}
/**
 * @params  {Array} vec1
 * @params  {Array} vec2
 * @returns {Array}
 *
 * nas.sub(vec1,vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:各項を減算したベクトル配列
 * ベクトル差を返す
 */
nas.sub = function (vec1, vec2) {
    var preformedVec = nas.preformvector(vec1, vec2);
    var vec3 = new Array(preformedVec[2]);
// 差を求めて返す。
    for (var idx = 0; idx < vec3.length; idx++) {
        vec3[idx] = preformedVec[0][idx] - preformedVec[1][idx]
    };
    return vec3;
}
/**
 * @params {Array} vec
 *          ベクトル配列
 * @params {Number} amount
 *          乗数
 * @returns {Array}
 *          各項に乗数を積算したベクトル配列
 * nas.mul(vec,amount)
 * 引数:ベクトル配列 乗数
 * 戻値:各項に乗数を積算したベクトル
 * ベクトル積を返す
 */
nas.mul = function (vec, amount) {
    if (typeof(vec) == "number") vec = [vec];
// ベクトルの次数を求める 二次元か三次元か四次元か
    var vecD = (vec.length);
    var vecNew = new Array(vecD);
// 積を求めて返す。
    for (var idx = 0; idx < vecD; idx++) {
        vecNew[idx] = vec[idx] * amount
    };
    return vecNew;
}
/**
 * @params  {Array} vec
 * @params  {Array} amount
 * @returns {Array}
 *
 * nas.div(vec,amount)
 * 引数:ベクトル配列 商数
 * 戻値:各項を商数で割ったベクトル配列
 * ベクトル商を返す
 */
nas.div = function (vec, amount) {
    if (typeof(vec) == "number") {
        vec = [vec];
    };
// ベクトルの次数を求める 二次元か三次元か四次元か
    var vecD = (vec.length);
    var vecNew = new Array(vecD);
// 商を求めて返す。
    for (var idx = 0; idx < vecD; idx++) {
        vecNew[idx] = vec[idx] / amount
    };
    return vecNew;
}
/**
 * @params {Array|Number} vec
 *          ベクトル配列
 * @params {Number} limit1
 *          制限値１
 * @params {Number} limit2
 *          制限値２
 * @returns {Array}
 *          制限値の範囲内にクランプされたベクトル配列
 * ベクトルを制限値でクランプする
 * nas.clamp(vec, limit1, limit2)
 * 引数:ベクトル配列 制限値１ 制限値２
 * 戻値:制限値の範囲内にクランプされたベクトル
 * ベクトルを制限値でクランプする
 */
nas.clamp = function (vec, limit1, limit2) {
    var max = limit1;
    var min = limit2;
    if (limit1 < limit2) {
        max = limit2;
        min = limit1
    };
    if (typeof(vec) == "number") {
        vec = [vec];
    };
// ベクトルの次数を求める 二次元か三次元か四次元か
    var vecD = (vec.length);
    var vecNew = new Array(vecD);
// 要素ごとに値をクランプして返す。
    for (var idx = 0; idx < vecD; idx++) {
        if (vec[idx] >= min && vec[idx] <= max) {
            vecNew[idx] = vec[idx];
        } else {
            vecNew = (vec[idx] >= min ) ? vecNew.concat([max]) : vecNew = vecNew.concat([min]);
        };
    };
    return vecNew;
}
/**
 * nas.dot(vec1,vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:ベクトル要素の内積
 * ベクトル内積
 * @params {Array} vec1
 *      ベクトル配列1
 * @params {Array} vec2
 *      ベクトル配列2
 * @returns {Number}
 *      ベクトル要素の内積
 */
nas.dot = function (vec1, vec2) {
    var preformedVec = nas.preformvector(vec1, vec2);
    var Result = 0;
//要素ごとに積算。
    for (var idx = 0; idx < preformedVec[2].length; idx++) {
        Result += (preformedVec[0][idx] * preformedVec[1][idx])
    }
    return Result;
};

/**
 * nas.cross(vec1, vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:ベクトル要素の外積
 * AEの仕様に合わせて2次元と3次元の値のみを計算する
 * @params {Array} vec1
 *      ベクトル配列1
 * @params {Array} vec2
 *      ベクトル配列2
 * @returns {Array}
 *      ベクトル要素の外積
 */
nas.cross = function (vec1, vec2) {
    var preformedVec = nas.preformvector(vec1, vec2);
    vec1 = preformedVec[0];
    vec2 = preformedVec[1];
    var vecD = preformedVec[2];
    var Result = 0;
//2次元か3次元で分岐
    switch (vecD) {
        case 2:
//2次元の時は外積を求めるためz座標値に0を補ってやる。(breakなし)
            vec1 = vec1.concat([0]);
            vec2 = vec2.concat([0]);
        case 3:
            Result = [vec1[1] * vec2[2] - vec1[2] * vec2[1],
                vec1[2] * vec2[0] - vec1[0] * vec2[2],
                vec1[0] * vec2[1] - vec1[1] * vec2[0]];
            break;
        default:
            Result = "2次元か3次元の値である必要があります。";
    }
    return Result;
};

/**
 * nas.length(vec)
 * 引数:ベクトル配列
 * 戻値:ベクトル長
 * ベクトルの長さを求める
 * @params vec
 * @returns {*}
 *      ベクトル長
 */
nas.length = function (vec) {
//引数がいくつかを求める
    if (arguments.length == 2) {
        if (typeof(arguments[0]) == "number" &&
            typeof(arguments[1]) == "number"
        ) {
            vec = [arguments[0], argments[1]];
        } else {
            if (typeof(arguments[0][0]) == "number" &&
                typeof(arguments[0][1]) == "number" &&
                typeof(arguments[1][0]) == "number" &&
                typeof(arguments[1][1]) == "number"
            ) {
                vec = nas.sub(arguments[0], arguments[1]);
            } else {
                return "配列を入力しましょう";
            }
        }
    }
//ベクトルの次数を求める 二次元か三次元か四次元か
    var vecD = (vec.length);
    if (isNaN(vecD)) {
        return
    }
    var Length;
//長さを求める
    switch (vecD) {
        case 1:
            Length = vec[0];
            break;
        case 2:
        case 3:
            Length = Math.pow(Math.pow(vec[0], 2) + Math.pow(vec[1], 2), .5);
            if (vecD > 2) {
                for (var idx = 2; idx < vecD; idx++) {
                    Length = Math.pow(Math.pow(Length, 2) + Math.pow(vec[idx], 2), .5)
                }
            }
            break;
        default:
            return "2次元または3次元の値を入力しましょう";
    }
    return Length;
};

/**
 * nas.normalize(vec)
 * 引数:ベクトル配列
 * 戻値:単位長ベクトル
 * 方向が同じで長さ１のベクトル
 * @params {Array} vec
 * @returns {Array}
 */
nas.normalize = function (vec) {
    return nas.div(vec, nas.length(vec))
};
//ベクトル演算関数おしまい

/**
 * AE ExpressionOtherMath 互換 角度<>ラジアン変換関数
 * 桁切らないほうが良いかも、運用してみて判断しましょう 2006/06/23
 * @params {Number} degrees
 * @returns {Number}
 */
nas.degreesToRadians = function (degrees) {
    return Math.floor((degrees / 180.) * Math.PI * 100000000) / 100000000;
};
/** ラディアンから度数を得る AE Expression互換
 * @params {Number} radians
 * @returns {Number}
 */
nas.radiansToDegrees = function (radians) {
    return Math.floor(180. * (radians / Math.PI) * 100000) / 100000;
};

/**
 * @desc 互換のためエイリアスを設定する
 */
if (typeof (preformvector) == "undefined") var preformvector = nas.preformvector;
if (typeof (add) == "undefined") var add = nas.add;
if (typeof (sub) == "undefined") var sub = nas.sub;
if (typeof (mul) == "undefined") var mul = nas.mul;
if (typeof (div) == "undefined") var div = nas.div;
if (typeof (clamp) == "undefined") var clamp = nas.clamp;
if (typeof (dot) == "undefined") var dot = nas.dot;
if (typeof (cross) == "undefined") var cross = nas.cross;
if (typeof (length) == "undefined") var length = nas.length;
if (typeof (normalize) == "undefined") var normalize = nas.normalize;
if (typeof (degreesToRadians) == "undefined") var degreesToRadians = nas.degreesToRadians;
if (typeof (radiansToDegrees) == "undefined") var radiansToDegrees = nas.radiansToDegrees;
/*
 * 以前のコードを洗ってエイリアスが不要なら削除のこと AEエクスプレッション準互換ベクター/数学関数
    他にfakeAE のオブエクトを利用する
*/

/**
 * ベジェの一次式
 * corveto関連の関数
 * なんかまだつらそうだがとりあえず設定しておく
 *
 * @params {Number} SP
 *  開始点
 * @params {Number} CP1
 *  制御点1
 * @params {Number} CP2
 *  制御点2
 * @params {Number} EP
 *  終了点
 * @params {Number} T
 *  作用助変数
 * @returns {Number}
 * この式はベジェの定義どおりの式 単項の値を戻す
 */
nas.bezier = function (SP, CP1, CP2, EP, T) {
    var Ax = EP - SP - (3 * (CP2 - CP1));
    var Bx = 3 * (CP2 - (2 * CP1) + SP);
    var Cx = 3 * (CP1 - SP);
    return (Ax * Math.pow(T, 3)) + (Bx * Math.pow(T, 2)) + (Cx * T) + SP;
};

/**
 * 一次ベジェの逆関数 係数と値から助変数tをもとめる
 * この関数は範囲を限定してタイミングを求める関数の一部として生かし
 * SP=0 , EP=1 に固定
 *
 * @params {Number} CP1
 *  制御点1
 * @params {Number} CP2
 *  制御点2
 * @params {Number} Vl
 *  助変数探索を行う値
 * @returns {Number}
 * 制御点の範囲を0-1に限定して値の増加傾向を維持することで、値に対する助変数を決定する関数
 * 一般値を求める関数ではない
 */
nas.bezierA = function (CP1, CP2, Vl) {
    if (Vl > 1 || CP1 > 1 || CP2 > 1 || Vl < 0 || CP1 < 0 || CP2 < 0) {
        return "rangeover";
    }
    var Ck = 0;
    if (Vl == 0) {
        var t = 0
    } else {
        if (Vl == 1) {
            var t = 1
        } else {
            /*
             * 初期化
             * 助変数の初期値を値にとる
             * テスト用仮値
             */
            t = Vl;
            /*
             * 求めた助変数でテスト値をとる
             * 助変数が
             */
            var TESTv = this.bezier(0, CP1, CP2, 1, t);//初期テスト値
            /*
             * 上限値
             */
            var UPv = 1;
            /*
             * 下限値
             */
            var DOWNv = 0;
            do {
                if (TESTv < Vl) {
                    DOWNv = t
                } else {
                    UPv = t
                }
                /*
                 * テスト値によって上限または下限を入れ換え
                 */
                t = (DOWNv + UPv) / 2;
                /*
                 * チェック回数(デバック用)
                 */
                Ck = Ck + 1;
                TESTv = this.bezier(0, CP1, CP2, 1, t);
            } while (TESTv / Vl < 0.999999999 || TESTv / Vl > 1.0000000001);
            /*
             * テスト値が目標値にたいして十分な精度になるまでループ(精度調整待ち 05/01)
             */
        }
    }
    t = Math.round(t * 100000000) / 100000000;

    if (dbg) dbg_info.notice = "loop-count is " + Ct;
//デバッグメモにカウンタの値を入れる 助変数
    var Result = t;
    return Result;
};

/**
 * 一般式ベジェの弧の長さを求める
 * <br />
 * bezierL(開始値,制御点1,制御点2,終了値[[,開始助変数,終了助変数],分割数])
 * 分割数が省略された場合は    10
 * 開始・終了助変数が省略された場合は    0-1
 *
 * @params {Number or Array} SP
 *  開始点
 * @params {Number or Array} CP1
 *  制御点1
 * @params {Number or Array} CP2
 *  制御点2
 * @params {Number or Array} EP
 *  終了点
 * @params {Number} sT
 *  開始助変数
 * @params {Number} eT
 *  終了助変数
 * @params {Number} Slice
 *  分割数
 * @returns {Number}
 *  戻値の精度は分割数に依存するので注意
 */
nas.bezierL = function (SP, CP1, CP2, EP, sT, eT, Slice) {
    if (!SP)    SP = 0;
    if (!EP)    EP = 1;
    if (!CP1)    CP1 = 0;
    if (!CP2)    CP2 = 1;

    if (!Slice)    Slice = 10;
    if (!sT)    sT = 0;
    if (!eT)    eT = 1;

    /*
     * AEの仕様に合わせて 単項、2次元3次元のみを扱う
     * 引数の次元を取得
     * nas.Point Position等を与える場合は valueOfで配列化すること
     */
    var Dim = (typeof(SP) == "number") ? 1 : SP.length;
//分割長テーブルを作る
    var Ltable = new Array(Slice);
    for (var i = 0; i < Slice; i++) {
        switch (Dim) {
            case    1:
                Ltable[i] = Math.abs(
                    this.bezier(SP, CP1, CP2, EP, sT + (eT - sT) * (i / Slice)) -
                    this.bezier(SP, CP1, CP2, EP, sT + (eT - sT) * ((i + 1) / Slice))
                );
                break;
            case    2:
                var p1x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * (i / Slice));
                var p1y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * (i / Slice));

                var p2x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * ((i + 1) / Slice));
                var p2y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * ((i + 1) / Slice));
// alert([p1x,p1y],[p2x,p2y]);

                Ltable[i] = this.length(this.sub([p1x, p1y], [p2x, p2y]));
                break;
            case    3:
                var p1x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * (i / Slice));
                var p1y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * (i / Slice));
                var p1z = this.bezier(SP[2], CP1[2], CP2[2], EP[2], sT + (eT - sT) * (i / Slice));

                var p2x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * ((i + 1) / Slice));
                var p2y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * ((i + 1) / Slice));
                var p2z = this.bezier(SP[2], CP1[2], CP2[2], EP[2], sT + (eT - sT) * ((i + 1) / Slice));
                Ltable[i] = this.length(this.sub([p1x, p1y, p1z], [p2x, p2y, p2z]));
                break;
            default    :
                return false;
        }
    }
    var T = 0;
    for (var n in Ltable) {
        T += Ltable[n]
    }

    return T;
};

/**
 * 暫定色彩関連関数
 * WEB色指定用の文字列を3次元の配列にして返す
 * 戻値の範囲は 0~1.0
 * @params {String} colorString
 * @returns {Array}
 */
nas.colorStr2Ary = function(colorString) {
    var Cr = .5;
    var Cg = .5;
    var Cb = .5;
    if (colorString.match(/^\#[0-9abcdef]+/i)) {
        Cr = eval("0x" + colorString.substr(1, 2) + " /255");
        Cg = eval("0x" + colorString.substr(3, 2) + " /255");
        Cb = eval("0x" + colorString.substr(5, 2) + " /255");
        return [Cr, Cg, Cb];
    }
    if (colorString.match(/^rgb\([\d]*\%?[\s\,]+[\d]*\%?[\s\,]+[\d]*\%?\)$/)) {
        var myColor = eval(
            colorString.replace(/rgb\(/, "\[").replace(/\)/ig, "\]").replace(/\%/g, "\*2.55")
        );
        return this.div(myColor, 255);
    }
    return [Cr, Cg, Cb];
};

/**
 * 3次元の配列をWEB色指定用の文字列にして返す
 * 配列形式のカラーデータを16進文字列で返す
 * @params {Array} colorArray
 * @returns {String}
 */
nas.colorAry2Str = function (colorArray) {
    var Sr = ((colorArray[0] * 255) >= 16) ?
        Math.round(colorArray[0] * 255).toString(16) :
    "0" + Math.round(colorArray[0] * 255).toString(16);
    var Sg = ((colorArray[1] * 255) >= 16) ?
        Math.round(colorArray[1] * 255).toString(16) :
    "0" + Math.round(colorArray[1] * 255).toString(16);
    var Sb = ((colorArray[2] * 255) >= 16) ?
        Math.round(colorArray[2] * 255).toString(16) :
    "0" + Math.round(colorArray[2] * 255).toString(16);
    return "#" + Sr + Sg + Sb;
};


/**
 * 配列形式のカラーデータを16進文字列で返す
 */

/**
 * 行列計算関数群
 * 原型となったtcl 処理系との互換のため引数はリスト文字列または1次元の配列で与える必要があるので注意
 */

/**
 * 行列表示(特設デバッグ表示)
 * @params {String} Name
 * @params {String|Array} Matrix
 * @params {Number} L
 * @params {Number} C
 */
nas.showMatrix = function (Name, Matrix, L, C) {
    if ((Matrix instanceof Array)) Matrix = Matrix.toString();
    Matrix = Matrix.split(',');
//表示名 行列リスト 行数 列数
    var Result = Name + ":\n";

    for (var i = 0; i < L; i++) {
        for (var j = 0; j < C; j++) {
            Result += "\t " + Matrix[i * C + j];
        }
        Result += "\n";
    }
    alert(Result);

};//行列表示

/**
 * 行列式計算(2または3,4 の正方行列のみ)
 * @params {String|Array} myMatrix
 * @returns {Array}
 */
nas.mDeterminant = function (myMatrix) {
    if ((myMatrix instanceof Array)) {
        myMatrix = myMatrix.toString().split(',');
    } else {
        myMatrix = myMatrix.split(',');
    }
    if (myMatrix.length != 4 && myMatrix.length != 9 && myMatrix.length != 16) {
        return null;
    };//ひとまずヌル返す？
    if (myMatrix.length == 4) {
//2×2の正方行列式
        var Result = myMatrix[0] * myMatrix[3] - myMatrix[1] * myMatrix[2];
    } else {
        if (myMatrix.length == 9) {
//3×3の正方行列
            var Result = 0;
            Result += (1 * myMatrix[0]) * (1 * myMatrix[4]) * (1 * myMatrix[8]);
            Result += (1 * myMatrix[1]) * (1 * myMatrix[5]) * (1 * myMatrix[6]);
            Result += (1 * myMatrix[2]) * (1 * myMatrix[3]) * (1 * myMatrix[7]);
            Result -= (1 * myMatrix[0]) * (1 * myMatrix[5]) * (1 * myMatrix[7]);
            Result -= (1 * myMatrix[1]) * (1 * myMatrix[3]) * (1 * myMatrix[8]);
            Result -= (1 * myMatrix[2]) * (1 * myMatrix[4]) * (1 * myMatrix[6]);
        } else {
//正方行列 4x4
            myMatrix = [myMatrix.slice(0, 4), myMatrix.slice(4, 8), myMatrix.slice(8, 12), myMatrix.slice(12)];
            var Result = 1.0;
            var buf;
            var n = 4;  //配列の次数
//三角行列を作成
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    if (i < j) {
                        var buf = myMatrix[j][i] / myMatrix[i][i];
                        for (var k = 0; k < n; k++) {
                            myMatrix[j][k] -= myMatrix[i][k] * buf;
                        }
                    }
                }
            }
//対角部分の積
            for (var i = 0; i < n; i++) {
                Result *= myMatrix[i][i]
            }
        }
    }
    return Result;
};//行列式

/**
 * 行列の積算
 * @params {String|Array} M1
 * @params {String|Array} M2
 * @returns {Array}
 */
nas.multiMatrix = function (M1, M2) {
    if (M1 instanceof Array) {
        M1 = M1.toString().split(',')
    } else {
        M1 = M1.split(",");
    }
    if (M2 instanceof Array) {
        M2 = M2.toString().split(',')
    } else {
        M2 = M2.split(",");
    }
//M1 は、3×3の行列 M2は、3×? の行列でなくてはならない
//それ以外の場合は、3×3 の単位行列を返す
    if (M1.length != 9 || M2.length % 3 != 0) {
        return "1,0,0,0,1,0,0,0,1";
    }
//応答行列初期化
    var multiprideMatrix = [];
//行列の次数を設定
    var D1C = 3;
    var D1L = 3;
    var D2C = Math.floor(M2.length / D1L);
    var D2L = D1C;
    for (var Mi = 0; Mi < D1L; Mi++) {
        for (var Mj = 0; Mj < D2C; Mj++) {
            var X = 0;
            for (var count = 0; count < D1C; count++) {
                X = X + M1[Mi * D1C + count] * M2[Mj % D2C + D2C * count];
            }
            multiprideMatrix.push(X);
        }
    }
    return multiprideMatrix.toString();
};
//行列積算

/**
 * 逆行列生成
 * 入力は2次または3次/4次の正方行列
 * @params {String|Araay} Matrix
 * @returns {Array}
 */
nas.mInverse = function (Matrix) {
    if (Matrix instanceof Array) {
        Matrix = Matrix.toString().split(',')
    } else {
        Matrix = Matrix.split(',')
    }
    if (Matrix.length != 4 && Matrix.length != 9 && Matrix.length != 16) {
        return null;
    }
//逆行列初期化
    var InversedMatrix = [];
//行列の次数を取得
    var D = Math.sqrt(Matrix.length);// expr int(sqrt ([llength ${Matrix}]))]
//余因数生成
    for (var j = 0; j < D; j++) {
        for (var i = 0; i < D; i++) {
            var Cm = [];
            for (var Cj = 0; Cj < D; Cj++) {
                for (var Ci = 0; Ci < D; Ci++) {
                    if ((Cj - j) == 0) {

                    } else {
                        if ((Ci - i) == 0) {

                        } else {
                            Cm.push(Matrix[Cj * D + Ci]);
                        }
                    }
                }
            }
            var Mx = this.mDeterminant(Matrix);
            InversedMatrix.push(this.mDeterminant(Cm) * Math.pow(-1, i + j) / Mx)
        }
    }
    return this.transMatrix(InversedMatrix).toString();
};//逆行列生成終わり


/**
 * 行列の転置
 * @params {String|Array} Matrix
 * @returns {Array}
 
    引数は以下の型式を受け入れる
    '1,0,0,1','1,0,0,0,1,0,0,0,1' ,'1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1'
コンマ区切り文字列リストただしコンマ区切りの要素数が4,9,16(それぞれ2,3,4次の正方行列)のみ
    ['1,0','0,1'],['1,0,0','0,1,0','0,0,1'],['1,0,0,0','0,1,0,0','0,0,1,0','0,0,0,1']
コンマ区切りリスト文字列を要素とする１次配列  同上それぞれ2,3,4次の正方行列のみ
    [[1,2,3],[4,5,6],[7,8,9],[10,11,12]]
２次元配列  要素数は自由  引数配列の要素すべてが配列でなければならない  次数は自由
内包要素の次数はすべて揃っている必要がある。
戻り値は配列に変更

*/
nas.transMatrix = function (Matrix) {
    var dx = 0;var dy = 0;
    if (Matrix instanceof Array) {
        if(Matrix[0] instanceof Array){
            dy=Matrix.length;
            dx=Matrix[0].length;
            //２次元配列なら要素数を検査して不整合があればリジェクト
            for (var idx=0;idx<dy;idx++){
                if(Matrix[idx].length != dx){return false;}
            }
        }
        Matrix = Matrix.toString().split(',');
    } else {
        Matrix = Matrix.split(',')
    }
    if ((dx == 0) && (dy == 0) &&
    (Matrix.length != 4 && Matrix.length != 9 && Matrix.length != 16)
    ) {
        return null;
    } else {
//行列の次数を取得
        dx = Math.sqrt(Matrix.length);
        dy = dx;
    }
//転置配列の初期化
    var tranposedMatrix = [];
//転置
    for (var j = 0; j < dx; j++) {
        for (var i = 0; i < dy; i++) {
            tranposedMatrix.push(Matrix[i * dx + j]);
        }
    }
    return tranposedMatrix;
};
//行列の転置終わり
/*TEST
 nas.transMatrix([[1,2,3],[4,5,6],[7,8,9]]);
 */
//行列関数群終わり

/**
 * 回転角関連
 * azimuth（アジマス）は地図・海図等で使用する方位角。
 * ここでは時計の12時方向(北=N)を0度として時計回り方向に 1周360°の単位系とします。
 * 方位角の概念は AEには存在しない
 * @params {Number} degrees
 * @returns {Number}
 */
nas.deg2azi = function (degrees) {//傾斜角から方位へ
    return (-1 * degrees + 90);
};
/** 方位角から度数を得る
 * @params {Number} azimuth
 * @returns {Number}
 */
nas.azi2deg = function (azimuth) {//方位から傾斜角へ
    return (-1 * (azimuth - 90))
};

/**
 * 2次元のベクトルを与えて方位角を求める。長さを加えるべきか？
 * 引数formは戻し値の形式を指定。デフォルトは方位角
 * @params {Array} Vector
 * @params {String} form
 *       radians|degrees|azimuth
 * @returns {Number}
 */
function vec2deg(Vector, form) {
    if (Vector.length != 2) {
        return false
    }
    if (!form) {
        form = "degrees"
    }
    var x = Vector[0];
    var y = Vector[1];
    var myRadians = (y == 0) ? 0 : Math.atan(y / x);
    if (x < 0) {
        myRadians += Math.PI
    }
    switch (form) {
        case        "redians":
            var result = myRadians;
            break;
        case        "degrees":
            var result = Math.floor(180. * (myRadians / Math.PI) * 10000) / 10000;//degrees;
            break;
        case        "azimuth":
        default    :
            var result = nas.deg2azi(radiansToDegrees(myRadians));
            break;
    }
    return result;
}
/**
 * 暫定文字列操作メソッド
 * バイト数を返す。
 * 実装によっては内部コードが違うのでマルチバイト部分のバイト数は同じとは限らない。
 * @params {String} myString
 * @returns {Number}
 */
nas.biteCount = function (myString) {
    if (!myString) {
        myString = "";
    }
    var btCount = 0;
    for (var cid = 0; cid < myString.length; cid++) {
        cXV = myString.charCodeAt(cid);
        while (cXV > 0) {
            btCount++;
            cXV = Math.floor(cXV / 256);
        }
    }
    return btCount;
};


/**
 * 文字列のバイト数を勘定して、指定バイト以下の文字列に区切って返す。
 * AEのラベル31バイト制限用なので、デフォルトは 31
 * @params {String} myString
 * @params {Number} count
 * @returns {String}
 */
nas.biteClip = function (myString, count) {
    if (!myString) {
        myString = "";
    }
    if (!count) {
        count = 31
    }
    var btCount = 0;
    for (var cid = 0; cid < myString.length; cid++) {
        cXV = myString.charCodeAt(cid);
        while (cXV > 0) {
            btCount++;
            cXV = Math.floor(cXV / 256);
        }
        if (btCount > count) {
            return myString.slice(0, cid);
        }
    }
    return myString;//抜けたら全部返す
};

/**
 * 前後の空白を払う(trimのエイリアス)
 * @params {String} myString
 * @returns {String}
    return myString.replace(/^\s+/, "").replace(/\s+$/, "");
 */
nas.chopString = function(myString){ return myString.trim(); }

/**
 * nas.parseName(string,lt)
 *
 *	@params {String} string
 *		パースする対象の文字列
 *	@params {String} lt
 *		基準として使用する文字セット
 *	@return {Number}
 *		対象文字列を整数化した値
 *
 *	与えられた基準文字セットを数字として解釈して、引数を数値化して返す
 *	parseIntに似た動作をするが、基数の制限がない
 *	扱う数値は負数及び0を含まない正の整数のみとなる
 *	基準文字セット内にない値をパースすると0を戻す
 *		parseInt("123",10); // 123
 *		parseName("123","123456789A"); // 123
 *		parseName("ABC","ABCDEFGHIJ"); // 123
 *	このコードは同じ値を返す
 *  引数に空文字列を与えた場合は 0 を返す
 */
nas.parseName = function(string,lt){
	if(typeof lt != 'string') lt = 'ABCDEFGHIJELMNOPQRSTUVWXYZ';
	var radix = lt.length;//基数
	var num   = 0;//
	for(var c = 0;c < string.length ; c ++){
//一文字ずつ後方から加算して数値化
		var cc = lt.indexOf(string.charAt(string.length - c - 1));
		if(cc < 0) break ; //比較文字がセットに含まれない場合はブレイク
		num += (cc + 1) * Math.pow(radix,c);
	};
	return num;
}
/**
 * nas.stringifyName(num,lt)
 *
 *	@params {Number} num
 *		文字列化する値 正の整数
 *	@params {String} lt
 *		基準として使用する文字セット
 *	@return {String}
 *		引数値を文字列可したもの
 *
 *	
 *	与えられた基準文字セットを数字として解釈して、引数を文字列化して返す
 *	Number.toString(radix)に似た動作をするが、基数の制限がない
 *	扱う数値は負数及び0を含まない正の整数のみとなる
 *		(123).toString(10) // "123"
 *		stringifyName(123,"123456789A") // 123
 *		stringifyName(123,"ABCDEFGHIJ") // "ABC"
 *      0及び負数を与えた場合は''空文字列を返す
 */
nas.stringifyName = function(num,lt){
	if(typeof lt == 'undefined') lt = 'ABCDEFGHIJELMNOPQRSTUVWXYZ';
	var radix  = lt.length;//基数
	num = parseInt(num);
	if(num <= 0) return '';
	var result = [lt.charAt((num - 1) % radix)];
	var tmp    = Math.floor((num - 1) / radix);
	while(tmp > 0){
		result.push(lt.charAt((tmp - 1) % radix));
		tmp      = Math.floor((tmp - 1) / radix);
	}
	return result.reverse().join('');
}
/* TEST
nas.parseName("ABSDE","ABCDEFGHIJELMNOPQRSTUVWXYZ");
nas.stringifyName(parseName("ABSDa"));
*/
/*
    バージョン管理のためのプラスルール
    LO LO修 LO修修 LO修修修 ...
    LO LO演 LO演監 LO演監作 LO演監作総 ...
    LO LO+ LO++ LO+++ ...
    上記のように、文字列末尾に連続するキー文字をおいて、その数で状況（バージョン）を識別する手法
    LO LO+ LO+2 LO+3 LO+4 ...
    文字列全体を短縮するために最後尾に数字を置いて加算されたバージョン数を代用することができる
    バージョン表示のためのキー文字は、複数の任意の文字を指定可能だが、統一化とデータ交換のために
    標準では "+(プラス)"を利用するものとする
 */
/**
 *	@params {String} str
 *	@params {String} keychar
 *	文字列のプラスルールをパースして無名オブジェクトで返す
 */
nas.plParse = function parsePlusRule(str,keychar){
	if(typeof str == 'undefined') return null;
	if(typeof keychar == 'undefined') keychar = '+';
	var count = 0;
	var name  = str;
	var prefix = ((/[\^\$\\\/\?\*\+\[\]\(\)\{\}]/).test(keychar))? "\\":"";
	if( String(str).match(new RegExp("(.*?)(["+keychar.replace(/[\^\$\&\\\/\?\*\+\[\]\(\)\{\}]/g , "\\$&")+"]+)(\\d*)$"))){
//	if( String(str).match(new RegExp("(.*?)("+prefix+keychar+"+)(\\d*)$"))){}
		name  = RegExp.$1;
		count = RegExp.$2.length;
		if(RegExp.$3) count += (parseInt(RegExp.$3) - 1);
	}
	return {"name":name,"key":keychar,"count":count};
}
/*TEST
 *  nas.plParse("LO+")   ;//{name:"LO",key:"+",count:1}
 *  nas.plParse("原画修修修3"."修")   ;//{name:"原画",key:"修",count:5}
*/
/**
 *	@params {String} str
 *	@params {Number} count
 *	@params {String} keychar
 *	文字列のプラスルールに従ってエンコードした文字列を返す
 *  負の数は受け入れず０として扱う
 */
nas.plEncode = function encodePlusRule(str,count,keychar){
    if((! count)||(count < 0)) count = 0;
	if(typeof str == 'undefined') return '';
	if(typeof keychar == 'undefined') keychar = '+';
    return str+((count > 0)?keychar+((count>1)?count:""):"");
}
/**
 *	@params {String} str
 *	@params {String} keychar
 *	文字列プラスルールのカウント数のみを返す
 *  plCount("LO+")   ;// 1
 *  plCount("原画")   ;// 0
 */
nas.plCount = function countPlusRule(str,keychar){
	var result = nas.plParse(str,keychar);
	if(result) return result.count;
	return result;
}
/*TEST
console.log(nas.plCount('LO+++'));
console.log(nas.plCount('LO+2','+'));
console.log(nas.plCount('LO修2','修'));
console.log(nas.plCount('LO修修3','修'));
*/
/**
 *	@params {String} str
 *	@params {Number} count
 *	@params {String} keychar
 *	文字列後尾のプラスルール部分を増減する
 *  戻しのkeycharは一文字に限定で引数のさいごの文字を使用
    オリジン 0
 ABCDE+
 123456
 *  nas.plIncr("LO+",1)        ;//LO+2
 *  nas.plIncr("原画+2",-1)     ;//原画+
 *  nas.plIncr("原画+2",1,"修") ;//原画+
 */
nas.plIncr = function plusIncrement(str,count,keychar){
	var pl = nas.plParse(str,keychar);
	if(! pl) return str;
	var result = pl.name;
	return nas.plEncode(pl.name,pl.count+count,keychar);
}
/*TEST
console.log(nas.plIncr('LO+++',-2));
console.log(nas.plIncr('LO+2',1,'+'));
console.log(nas.plIncr('LO修2',1,'修'));
console.log(nas.plIncr('LO修修3',-4,'修'));
*/
/**
 *	@params {String} string
 *		操作対象文字列
 *	@params {Number} step
 *		繰り上げ数、負数も可 ただし結果が１より小さくなる場合は戻り値は''
 *	@params {String} lts
 *		並びの文字セット・指定のない場合は自動判別
 *
 *	文字列を指定文字セットに従った数値として評価して繰り上げ、繰り下げを行う
 *	文字セットの指定がない場合は自動判別
 *	第一引数が''の場合は'a'が戻る
 */
nas.incrName = function(string,step,lts){
	if(! string) string = '';
	if(typeof step == 'undefined') step = 1;
	step = parseInt(step);
	if(typeof lts == 'undefined'){
		for(var ix=0;ix<nas.incrName.ltSet.length;ix++){
			lts = nas.incrName.ltSet[ix];
			var ltRgx = new RegExp("["+lts+"]+");
			if((string).match(ltRgx)) break;
		};//マッチがない場合は最終セットが選択されるので注意
	};
	var result = 0;
	result = nas.parseName(string,lts);
	result += step;
	if(result <= 0) result = 0;
	return nas.stringifyName(result,lts);
}
//初期リスト 基本想定がタイムラインラベルなので大文字のアルファベットを優先セットとする
nas.incrName.ltSet = [
	"あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん",
	"アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン",
	"ABCDEFGHIJELMNOPQRSTUVWXYZ",
	"abcdefghijklmnopqrstuvwxyz"
];
/*TEST
nas.incrName("ABC");
*/
/**
 * nas.incrStr(myString,Step,keepPostfix)
 * 引数  任意文字列
 * 戻値	文字列内最初にでてくる数値部分の末尾の番号部分をステップ数くり上げて返す
 * ステップに負の数を与えると減算 戻り値が 0|負数 の場合は元の文字列を戻す
 * 本番号として１０進数値のみをサポート
 * サブナンバオプションが与えられた場合は本番号を固定してサブナンバを増減
 * サブナンバオプションがない場合は数字の末尾にサブナンバーとして[a-z]の
 * postfixがあってもそれを切り捨てて評価する
 * 番号がなければそのまま戻す
 * オプションでpostfix保持して戻す
 *
 * @params {String}  string
 *      主引数・数値部分を含む文字列
 * @params {Number}  step
 *      増減値
 * @params {Boolean} keepPostfix
 *      後置部分保存オプション
 * @params {Boolean} subNum
 *      サブナンバー増減オプション
 * @params {String}  ltSet
 *      サブナンバーに使用する文字セット省略時はアルファベット小文字
 * @returns {String}
 */
nas.incrStr = function (string, step, keepPostfix,subNum,ltSet) {
    if (typeof keepPostfix == "undefined") keepPostfix = false;
//if true with postFix
    if (isNaN(step)) step = 1;
    var nameRegex = new RegExp(/^(.*[^\d])?(\d+)([^0-9]*)(.*)$/i);
    if (subNum){
        if (typeof ltSet != 'string') ltSet = 'abcdefghijklmnopqrstuvwxyz';
        nameRegex = new RegExp("^(.*[^\\d])?(\\d+)(["+ltSet+"]*)(.*)","i");
    };
    if (string.match(nameRegex)){
        var prefix       = RegExp.$1;
        var targetNumber = RegExp.$2;
        var subNumber    = (subNum)? RegExp.$3 :'';
        var postfix      = (keepPostfix) ?((subNum)? RegExp.$4:RegExp.$3+RegExp.$4): "";
        if(subNum){
            return prefix + targetNumber + nas.incrName(subNumber,step,ltSet) + postfix;
        }else{
            var newNum       = ((parseInt(targetNumber, 10) + step) >= 0) ?
            nas.Zf(parseInt(targetNumber, 10) + step, targetNumber.length) :
            targetNumber;
            return prefix + newNum + postfix;
        };
    };
    return string;
};
/*TEST
    nas.incrStr('A-1')        ;// A-2
    nas.incrStr('A-1',2)      ;// A-3
    nas.incrStr(A-1-ovl,3,false);// A-4
    nas.incrStr(A-1-ovl,3,true) ;// A-4-ovl
    nas.incrStr('A-1',1,false,true);// A-1a
    nas.incrStr('A-1乙',1,false,true,'甲乙丙丁');// A-1丙
*/
/**
 * nas.propCount(myObject,option)
 * 引数:	任意のオブジェクト,リストスイッチ
 * 戻値	オブジェクトのもつプロパティの数
 *
 * 単純にオブジェクトの総数を返す
 * 削除されたが参照が残っているために無効になったオブジェクトを検査するために作成
 * ただしそれ以外の用途で使用できないわけではない
 * リストスイッチを入れるとプロパティを配列で返す
 *
 * @params {Object} myObject
 * @params {Boolean} myOption
 * @returns {Number}
 */
nas.propCount = function (myObject, myOption) {
    if (!myObject) {
        return false;
    }
    if (myOption) {
        var resultArray = [];
    }
    var myResult = 0;
    for (var prp in myObject) {
        myResult++;
        if (myOption) {
            resultArray.push(prp)
        }
    }
    if (myOption) {
        return resultArray;
    } else {
        return myResult;
    }
};

/**
 * nas.labelNormalization(myString,mySep)
 * 引数：ラベル文字列 ,新規セパレータ
 * 戻値:正規化されたラベル文字列
 * ラベル文字列を正規化する
 * セパレータを払って プレフィックス,12桁あわせ整数,ポストフィックス を指定セパレータで結合したものを返す
 * セパレータが指定されない場合は"-(ハイフンマイナス)"
 * 主にAE上でのファイル/レイヤー/アイテムの並べ替え関数で使用
 * 文字列の数字に先行する部分をラベル(=prefix)
 * 最初に現れる数値連続部分を整数値
 * 残りを後置情報とする。
 * この関数はラベル、後置文字列の意味は問わない  
 * @params {String} myString
 * @params {String} mySep
 * @returns {String}
 *   正規化されたラベル文字列
 */
nas.labelNormalization = function (myString, mySep) {
    if (typeof myString == "undefined") {
        return false
    }
    if (typeof mySep == "undefined") {
        mySep = "-"
    }
    /*
    var myCell=(myString instanceof nas.CellDescription )? myString :new nas.CellDescription(myString);
    return [myCell.prefix,nas.Zf(nas.parseNumber(myCell.body),12),myCell.postfix].join(mySep);
    */
    myString=nas.normalizeStr(myString);
    if (String(myString).match(/([^\s\._\-0-9]*)[\s\._\-]?([0-9]+[\s\._\-]?)([^0-9]?.*)/)) {
        return [RegExp.$1, nas.Zf(parseInt(RegExp.$2,10), 12), RegExp.$3].join(mySep);
    } else {
        return myString.toString();
    }

    if (String(myString).match(/([^\s\._\-0-9]*)[\s\._\-]?([0-9]+)[\s\._\-]?([^0-9]?.*)/)) {
        var myPrefix = RegExp.$1;
        var myBodyNum = parseInt(RegExp.$2);
        var myPostfix = RegExp.$3;
        return [myPrefix, nas.Zf(myBodyNum, 12), myPostfix].join(mySep);
    } else {
        return myString.toString();
    }
};

/*test
console.log(nas.labelNormalization("a 012a下"));
console.log(nas.labelNormalization("01223 Ax",""));
console.log(nas.labelNormalization("A01223","_"));
console.log(nas.labelNormalization("B-01223雨森Ax","."));
console.log(nas.labelNormalization("たぬき3"));
*/
//比較補助関数
/** nas.normalizeStr(str)
 *  @params {String}    str
 *       元文字列 ''
 *  @params {Number}   zeroCount
 *       数値部分を桁合わせする数 -1の場合桁合わせは行わない
 *       
 *  myString.normalizeメソッドが存在すればnormalize("NFKC")をもどす
 */

nas.normalizeStr = function(str,zeroCount){
    if(typeof zeroCount == 'undefined') zeroCount = -1;
    if(str.normalize){
        str = str.normalize("NFKC");
  // normalize("NFKC")で対応できない文字の変換
  str = str.replace(/”/g, "\"")
    .replace(/[ー‐―−➖━ーｰ]/g, "-")
    .replace(/’/g, "'")
    .replace(/‘/g, "`")
    .replace(/￥/g, "\\")
    .replace(/  /g, " ")
    .replace(/〜/g, "~");
    }else{
// ノーマライズが無い時は半角化のみ実行

    str=str.replace(/[！-～]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);//char-code shift
    });
  // 文字コードシフトで対応できない文字の変換
  str = str.replace(/”/g, "\"")
    .replace(/[ー‐―−➖━ーｰ]/g, "-")
    .replace(/’/g, "'")
    .replace(/‘/g, "`")
    .replace(/￥/g, "\\")
    .replace(/  /g, " ")
    .replace(/〜/g, "~");
 };
 if(zeroCount > -1){
     str = nas.RZf(str,zeroCount);
 };
 return str;
}


/*test
console.log (nas.normalizeStr("安全ｶｸﾆﾝＢＡＮＤ（12３④５）"));
console.log (nas.normalizeStr("安全ｶｸﾆﾝＢＡＮＤ（12３④５）",7));
*/

/**
 * 文字列中に最初に現れる数値部分を整数化して返す関数
 * 正規化フィルタを通し
 * 最初の数値の前の数字以外の文字を払い１０進で整数化して返す
 * 数値部分が含まれない場合は NaN が戻る
 * この関数は  
 *   先行する数字以外をラベル
 *   数字の連続部分を数字部
 *   それ以降を後置部
 * と定義する
 * ＞小数点以下は後置部となるので注意
 *   @params {String} str
 *   @returns {Number}
 */
nas.parseNumber=function(str){
    if(typeof str == 'undefined') str = '';
	if(! str.replace){str=str.toString();}
	return parseInt((this.normalizeStr(str)).replace(/^[^0-9]*/,""),10) 
}
/*
nas.parseNumber("A-125.3");
nas.parseNumber("１２３９３２");
nas.parseNumber("Final-A 123-under");
*/

/**
 *  タイムシートのセル記述を比較して同じセルの記述か否かを返す関数
 *
 *  空白はいずれのセル記述ともマッチしない
 *  カラセル記号、省略記号、等の機能記述記号はいずれのセル記述ともマッチしない
 *  原画記述の特定のセルを表さない中間値補間記号はいずれのセルともマッチしない
 *  記述はノーマライズして比較される
 *  同一トラック内の記述比較のみ正しい判定を行う(xMapエレメントの比較ではない )
 * 引数は、記述文字列または記述オブジェクト
 * 実際の判定はセル記述オブジェクトのメソッドを利用するので、
 * 比較するどちらかの要素がセル記述オブジェクトであることが明確なケースでは
 * この関数を使う必要は無い obj.compare(desc) を利用するように推奨
 */
nas.compareCellIdf=function(tgt,dst){
    if((! tgt) || (! dst)) return false;
    if(tgt instanceof nas.CellDescription){
        var target=tgt;
    }else{
        var target=new nas.CellDescription(tgt);
    }
    return(target.compare(dst));
}

/*TEST
console.log(nas.compareCellIdf(""," "));
console.log(nas.compareCellIdf("12","(12)"));
console.log(nas.compareCellIdf("１２","12-1"));
console.log(nas.compareCellIdf("X","X"));
console.log(nas.compareCellIdf("|","X"));

console.log(nas.compareCellIdf("A-12","A-(12)-a"));
console.log(nas.compareCellIdf("A0012","A-(12)"));



*/
/**
 *  @class
 *<pre>
 * nas.CellDescription([cellPrefix,cellBody,cellPostfix,cellModifier])
 * nas.CellDescription(cellDescription,cellPrefix)
 * コンストラクタ基本形式
 * 狭義のセル（動画セル）を記述するオブジェクト
 * セル記述を与えて初期化するか、または必要な情報を配列で与えて初期化する。
 * 
 * cellDescription      主記述・シートに記述する基本的なテキスト
 *     プレフィックス、ポストフィックス、モデファイヤを含んでいても良い
 *     特殊記述は内容で判別
 * 
 *     ブランク記述 カラセルを表す予約語
 *         配列nas.CellDescription.blankSignsに登録された文字列が単独で記述されたもの
 *     中間値補間記述  補間（動画）記号用予約語
 *         配列nas.CellDescription.interpolationSignsに登録された文字列が単独で記述されたもの
 *     省略記述 記述されたセルが直前のセルの値を継承する事を示す予約語
 *         配列nas.CellDescription.ellipsisSignsに登録された文字列で始まる記述、空文字列及び空白文字
 * 
 *     一般記述  上記の特殊記述以外の記述        
 *         記述が値を持つ場合は、システム上関連付けられた値を示す。
 *         値を持たない場合は省略記述と同様に直前のセルの値を継承する
 *         
 * cellPrefix    プレフィックス部
 *     通常はタイムライントラックラベル(セルグループラベル)
 *     主記述に指定のある場合はそちらを優先する
 * cellPostfix
 *     以下の文字列によるオーバレイまたはアンダーレイの指定を一種のみ
 *     +,修正,修,上,下,カブセ,u|under,o|over,overlay
 *     文字を重ねるかまたは直後に重ね数を付加して使用する
 *     例  "+","++","+3"
 *     主記述に指定のある場合はそちらを優先する
 *     ブランク記述の場合は意味を持たないが、記述規則上ポストフィックスが記述されることは無い
 *     ポストフィックスが与えられた場合、特殊記述でなく一般記述となる
 * cellModifier
 *     丸囲い、三角囲い、四角囲い等の記述修飾を与える  
 *     "none","circle","triangle","brackets","red"
 *     主記述に指定のある場合はそちらを優先する
 *     特殊記述にはモデファイヤが付かない
 * cellType
 *     記述のタイプを示すプロパティ
 *     "nullstring"|"space"|"blank"|"interpolation"|"ellipsis"|"cell"
 *     それぞれ
 *     "ヌルストリング","空白","カラセル","中間値補間指定子","省略子"or"通常エントリ"
 *     を示す。
 *     マップの状況により同じ記述が必ずしも同じタイプとはならない
 *</pre>
 */
nas.CellDescription = function(cellDescription,cellPrefix){
    this.prefix   = "";//セルグループラベル
    this.body     = "";//セル記述 通常は番号 副番号記述を認める
    this.postfix  = "";//セルの後置記述　修正、注釈等
    this.modifier = "none";//記述修飾子
    this.content  = null;//nullで初期化  ここに値があればtoStringで返す  キャッシュ扱い
    this.type     = "inherit";
  if(cellDescription instanceof Array){
    this.prefix   = cellDescription[0];
    this.body     = cellDescription[1];
    this.postfix  = cellDescription[2];
    this.modifier = cellDescription[3];
    this.type     = nas.CellDescription.type(this.body);
  }else{
    this.parseContent(cellDescription,cellPrefix);
  };
}
/* TEST
    
 */
/*
 *セル記述クラスにクラスプロパティ（マスターデータ）としてとして
 *カラセル記号と省略記号等のデータをアタッチする
 */
/*    EllipsisSign
 *    省略記号
 *　replacement トラックのみで使用される記述省略記号
 *　これらの記号はすべてセルの値が「未入力」として扱われる
 *　（タイムライントラックでは、未入力セルが記述省略＝最終記入値の複製であるため）
 */
nas.CellDescription.ellipsisSigns   = ["\|",":",";","｜","：","；","‖","↓","↑","⇓","⇑"];
nas.CellDescription.ellipsisRegex   = new RegExp("^["+nas.CellDescription.ellipsisSigns.join("")+"]$");
/*    blankSign
 *    カラセル記号
 *　replacement トラックのみで使用されるカラセル記号
 *　これらの記号はすべてセルの値が「カラ(blank-cell)」として扱われる
 *　セクションパースの際にdissAppearance区間の開始を導く
 */
nas.CellDescription.blankSigns		= ["×","0","X","x","✕","〆","✖","☓","✗","✘"];
nas.CellDescription.blankRegex      = new RegExp("^["+nas.CellDescription.blankSigns.join("")+"]$");
/*    interpolationSign
 *    中間値生成記号
 *　replacement トラックのみで使用される中間補完値生成記号
 *　これらの記号はすべてセルの値が「未生成のセル画像」として扱われる
 *　セクションパースの際に中間値補完区間の開始を導く
 *			//中間値生成予約（中割・動画）記号
 *			//前後に他の文字列データを含まない場合のみ機能を果たす
 *			//この他に<.+>も補間記号として働く
 *		    //	詳細別紙
 */
nas.CellDescription.interpolationSigns  = ["-","=","\*","·","・","○","●","▫","▪","▴","▵","▾","▿","◈","◉","◦"];// "-","·","・","○"
nas.CellDescription.interpRegex         = new RegExp("^["+nas.CellDescription.interpolationSigns.join("")+"]$");

/*
    丸囲い、三角囲み等のブラケット修飾されている要素を判定する正規表現
 */
nas.CellDescription.modifiedRegex = new RegExp( "^\\(.+\\)$|^\\[.+\\]$|^\\<.+\\>$|^\\s*$|^["+nas.CellDescription.interpolationSigns.join("")+"]$");

/* TEST
console.log(new nas.CellDescription())     ;//
console.log(new nas.CellDescription(["A","12","修","triangle"]))   ;//triangle|修 |A|12
console.log(new nas.CellDescription(["A","12-1","修","triangle"])) ;//triangle|修 |A|12-1
console.log(new nas.CellDescription("(1)"))     ;//circle|""|""|1
console.log(new nas.CellDescription("2"))     ;//none|""|""|2
console.log(new nas.CellDescription("<A12>修"))     ;//triangle|修 |A|12
console.log(new nas.CellDescription("A-(12)+","B"))     ;//circle  |+  |B|A-12
console.log(new nas.CellDescription("A[12]修"))     ;//brackets|修 |A|12
console.log(new nas.CellDescription("B001"))        ;// none   |"" |B|1
console.log(new nas.CellDescription("B-01"))        ;// none   |"" |B|1
console.log(new nas.CellDescription("C-(1)++3"))    ;//circle  |++3|C|1
console.log(new nas.CellDescription("C-①","A"))     ;//circle  |"" |A|C1
console.log(new nas.CellDescription("<あ>修","A")) ;//triangle|修 |A|あ
console.log(new nas.CellDescription("(1イ)修","A")) ;//circle|修 |A|1イ
console.log(new nas.CellDescription("B-ex修","b")) ;//none|修 |b|ex
console.log(new nas.CellDescription("C8-修q","b")) ;//none|"" |C|8-修q
console.log(new nas.CellDescription("BOM","c")) ;///none|""|c|BOM　通常単語系
/**
 *  @function
 *     セル記述のタイプをセットするメソッド
 *     引数がなければ現在のタイプを返す
 * @params {String} myType
 *  オブジェクトに設定するtypeString
 * "normal"        一般記述
 * "inherit"       空文字列、空白、省略記号  等の先行の値を継承する記述
 * "blank"         カラ記述
 * "interpolation" 中間値補間記号
 *  @returns {String}
 *      処理後の　typeString
 */
nas.CellDescription.prototype.setType=function(myType){
    if((typeof myType == "undefined")&&(! (this.type))){
        nas.CellDescription.type(this);
    }else{
        this.type = myType;
    }
    return this.type;
}
/*test

*/
/**
 *     @function
 *  @params {String}  type
 *      文字列化タイプ  "origin"|"normal"|"full"|"complete"|"asset"|"asset-body"
 *<pre>
 *     "origin" ユーザ記述のままを返す    content
 *         contentに値がない場合は"normal"の値をcontentに設定して返す デフォルト
 *     "body"             bodyのみを文字列化して返す String(body)
 *     "normal"           正規化済の文字列で返す    [body,postfix].join("")
 *     "complete|full"    完全な修飾子付きで返す  [prefix,body,postfix].join("-")
 *     "asset|asset-body" アセット名として番号修飾を廃した文字列を返す 桁合わせはサポート外 A-1+
 * </pre>
 *  @returns {String}
 */
nas.CellDescription.prototype.toString=function(type){
    if(typeof type == "undefined") type= 'origin';
    if((type=='origin')&&(this.content)){return this.content;}
    var myResult = this.body;
    var brackets=([["",""],["(",")"],["<",">"],["[","]"]])[["none","circle","triangle","brackets"].indexOf(this.modifier)];
    switch(type){
    case "body":
//本体のみを文字列で返す //1
        myResult =String(this.body);
    break;
    case "complete":
    case "full":
//完全修飾状態の記述を返す //A-(1)-修 || A-(1)+ プラスルールではセパレータ省略
        myResult = [];
          if(this.prefix) myResult.push(this.prefix);
          myResult.push([brackets[0],this.body,brackets[1]].join(""));
        myResult = myResult.join("-");
          if(this.postfix) myResult += (this.postfix.indexOf("+") == 0)?"":"-" + this.postfix;
    break;
    case "asset":
    case "asset-body":
//アセット名として番号修飾を廃した文字列を返す 桁合わせはサポート外なのでリザルトを加工する必要あり
        myResult = [];
        if(this.prefix) myResult.push(this.prefix);
        myResult.push(this.body);
        myResult = myResult.join("-");
        if((type=='asset')&&(this.postfix))  myResult += (this.postfix.indexOf("+") == 0)?"":"-" + this.postfix;
    break;
    case "origin":
        if(this.content) return this.content;
    case "normal":
    default:
//前置・後置無しのXPS記述を返す //(1)
        myResult = [brackets[0],this.body,brackets[1],this.postfix].join("");
        if((type == "origin")&&(! this.content)) this.content = myResult;
    };
    return myResult;
}
/* test
var A=new nas.CellDescription(["A","12","修","triangle"]);
console.log(A.toString("complete"));
console.log(A.toString("normal"));
console.log(A.toString("origin"));
*/
/**
 * @function nas.CellDescription.prototype.parseContent(,)
 *  @params {String} description
 *   シートセル記述
 *  @params {String} prefixStr
 *   トラックラベル（プレフィックス）
 * <pre>
 *  記述パーサ
 * セル記述を与えて記述オブジェクトを再定義する
 * 
 * シート記述:[前置部[セパレータ]]主記述[[セパレータ]後置部]
 * ラベル:トラックラベルを与える
 * 
 * トラックラベルはプレフィックスのデフォルト値として扱う
 * トラックラベルが指定されない場合は、かつ記述にラベルが含まれない場合無ラベルのセルを初期化する
 * 
 * 値を持たないセルの扱い
 * セル記述が値を持つか否かはxMapとのリンクと記述条件によるので、ここでは解決を行わない。
 * 解決は必要時に都度行われる
 * 
 * セパレータは /[_\-\s]?/
 * 前置部は。セルの所属するグループラベルとして機能する
 * シート記述に前置部を置かない場合はセパレータも省略するものとする。
 * 前置部に値のない場合セパレータは認識されず主記述の一部となる。
 * 前置部がない場合はセパレータが必須
 * 前置部分のない記述（これが通常）は、トラックラベルがプレフィックスとなる
 * 
 * 主記述と前置部を強調修飾することが可能
 * 強調修飾は
 *     (.+)  丸囲い
 *     <.+>  三角囲い
 *     [.+]  四角囲い
 * の三種
 * いずれも前置部と主記述
 * または主記述のみを囲うことで表現できる  両者は同じ要素として扱う
 * 
 * 主記述は基本的に動画番号または原画番号である
 * 一般に正の整数値であるが、文字列も原画番号として許容される
 * 主記述の数値部分は、最初に現れる連続した数字部が整数として正規化される。
 * 文字列を用いる場合は、セパレータ以外の文字列を推奨
 * 幾つかの文字は機能文字として予約されているので使用時に注意が必要となる。
 * 
 * 
 *   後置部分は、同じセル記述に対するオーバレイ/アンダーレイを表す。
 *   予約語とその重なりで同一セル関連のオーバーレイを示す
 *   現在の予約語は以下
 *      +           :  オーバーレイ(簡略表記)
 *      o/overlay   :  オーバーレイ
 *      u/underlay  :  アンダーレイ
 *      修/修正     :  修正オーバーレイ
 *      カ/カブセ   :  日本語でオーバーレイの慣用表現
 *      上          :  漢字オーバーレイ
 *      下          :  漢字アンダーレイ
 * 
 *   後置部分の異なる同一名のセルは別々のセルではあるが強力な関連性を持つ
 *   ただしこの関連性は、同一ステージ内に限定される
 *   ステージが異なる場合の同名記述は基本的にごく弱い関連性しか持たない点に注意
 *   主記述とポストフィックス間のセパレータはあってもなくても良い
 * 
 *   例
 *   A-1
 *   A-1-修正
 *   A-1修
 *   
 *   この2つは異なるセルだが、A-1修は、A-1に関連付けられたオーバレイとして働く
 *   修正レベルによっては前バージョンの絵が残らない場合もある。
 *   
 *   修正オーバーレイは、必要に従って何層でも重ねることが可能であるその際は後置文字を重ねるか、またはオーバーレイの層数を数値でおく
 *   例
 *   +,++,+++,+4 等
 *   
 * "A-1_B-3_C123b"等の非分離複合型の記述に関しては、別に取り分けて判定する
 * 
 * 
 * パーサは与えられた記述をパースしてセル記述オブジェクトを返す
 * オブジェクトは以下のプロパティを持つ
 * 
 * .content    与えられた文字列をそのまま
 * .prefix     前置部文字列 セパレータは含まない または前置オブジェクト
 * .body       正規化された記述部本体文字列 または オブジェクト
 * .postfix    後置部文字列 セパレータは含まない またはオブジェクト
 * .modifier   記述修飾子  "none","circle","triangle","brackets"
 * .type       記述タイプ  "normal","inherit","blank","interpolation"
 * 
 * パーサに値が与えられなかった場合、既存のプロパティからdescription-contentの更新を行う
 * 丸数字は失われ標準表記の(丸括弧)に置換される  
 *
 * ファイル名を評価する際は、あらかじめファイル拡張子を除いておく必要がある     </pre>
 */
nas.CellDescription.prototype.parseContent=function(description,prefixStr){
//第一引数事前処理
    if ((typeof description == "undefined")||(description == null)){
        if (this.body.length>0){
          this.content = this.toString(true);
          return;
        }else{
          description = "";
        };
    };
    description  = String(description).trim();
//最低限のクリンアップで内容を保全する
    this.content = description;
//限定条件で アルファベット一文字+数字のみで構成された文字列の場合セパレータを補う
//A1end A下1-3end これらも解釈したい
    if(description.match(/^[A-Z]\d+$/i)) description = description.replace(/^([A-Z])(\d+)$/,"$1-$2");
//第二引数事前処理
    if(typeof prefixStr == "undefined") prefixStr = "";
    prefixStr = String(prefixStr).trim();
//プレフィックスが存在してかつ指定のプレフィックスと引数が一致している場合はプレフィックスを設定
    if((prefixStr.length > 0)&&(description.indexOf(prefixStr) == 0)){
        this.prefix = prefixStr;
//引数とプレフィックスが完全に一致する場合、番号1の記述として返す
        if(description == prefixStr){
            this.body   = String(1);
            return;
        };
    };
//丸数字を一つだけ（）で囲む（正規化前に行う）
    description = description.replace(/[①-⑳㉑㉒-㉛㉜-㉟㊱-㊿]/,"($&)");
//正規化  丸数字は通常の数字に展開されて失われる
    description = nas.normalizeStr(description);
//モデファイヤを判別して記述から削除(モデファイヤは一括して削除の方向で処理)
    if(description.match(/([^(]*)\(([^\(]+)\)(.*)/)) {
        this.modifier = "circle";
        description   = description.replace(/\(([^(]+)\)/g,"$1");
	}else if(description.match(/([^<]*)\<([^<]+)\>(.*)/)){
        this.modifier = "triangle";
        description   = description.replace(/<([^<]+)>/g,"$1");
	}else if(description.match(/([^\[]*)\[([^[]+)\](.*)/)){
        this.modifier = "brackets";
        description   = description.replace(/\[([^\[]+)\]/g,"$1");
    }else{
        this.modifier = "none";
    };
//ポストフィックスを判定して消去 推奨表記は"+" ここはユーザ設定可能に変更予定
    if(description.match(/([\-_\s]?(\++\d*)$)/)){
//プラスルール分離 ポストフィックスのうちセパレータを必要としないケースをここで処理
        this.postfix  = RegExp.$2;
        description   = description.slice(0,-(RegExp.$1.length));
    }else if(description.match(/([\-_\s]?((\+|修正?|カブセ|o|overlay|u|under|上|下)+(\d*)))$/)){
//別途指定される文字列が後置される場合それをポストフィックスとみなして分離
        this.postfix  = RegExp.$2;
        description   = description.slice(0,-(RegExp.$1.length));
    }else if(description.replace(/[\-_\s]/g,"_").split('_').length > 2){
//上記を抜けたコンテンツはセパレーターが必ず存在するものとして処理
        var arrayContent = description.replace(/[\-_\s]/g,"_").split('_');
        //["A","123","修正","大阪"]
//末尾要素が、ポストフィックス条件にマッチしていた場合に限りポストフィックスを設定する
/*
    ポストフィックス条件
    プラスルールを含む予約文字列
    A-1-3-カブセ-修ノ修ノ修
*/
        var pidx = arrayContent[0].length+arrayContent[1].length + 1;
        this.postfix = description.slice(pidx + 1);//第三要素以降の文字列
        description = description.slice(0,pidx);//第一、第二要素の文字列を抽出
	} else {
        this.postfix = "";
	};
//前置部分を分離
    if(description.match(new RegExp(/^([A-Z][^\-_\s]*)[\-_\s]?(.+)$/i))){
        this.prefix  = ((RegExp.$1).length)? RegExp.$1:prefixStr;
        this.body    = nas.normalizeStr(RegExp.$2);
    }else if(
        (prefixStr != "")&&
        (description.match(new RegExp("^("+prefixStr+")[\\-_\\s]?(.+)$","i")))
    ){
        this.prefix  = ((RegExp.$1).length)? RegExp.$1:prefixStr;
        this.body    = nas.normalizeStr(RegExp.$);
    }else{
        this.prefix  = prefixStr;
        this.body    = nas.normalizeStr(description);
    };
        if(this.body.match(/([^\d]*)(\d+)(.*)/)){
            this.body=RegExp.$1+parseInt(RegExp.$2,10)+RegExp.$3;
        };
//記述のタイプを判定
    this.type = nas.CellDescription.type(this.body);
}
/*test
var A = new nas.CellDescription("");
A.parseContent("A-(12)-修");
A.parseContent("A[12]修");
console.log(A);

new nas.CellDescription("B","B").toString() ;//B-1
new nas.CellDescription("").toString();//""
*/
/**   nas.CellDescription.prototype.compare(description,lbl)
オブジェクトメソッド
与えられた記述または記述オブジェクトと自身を対比して同じ記述か否かを判定
 引数:
    description  記述オブジェクト  または  記述文字列 ラベルを付加しても良い
 戻値:
    一致状況で返す  バイナリ
    00000
    11111
    0:no match
      1. +1: 1  prefix match  プレフィックス一致（プレフィックス空白は一致）1
      2. +2: 3  prefix + body match  基礎記述内容が一致（空白でない）
      3. +4: 7  prefix + body + postfix match  ポストフィックス一致（ポストフィックス空白は一致）
      4. +8: 15 and modifier match
      基本的にモデファイヤが異なっても同じ記述となるので、4.はあまり意味が無いが一応

以下の条件に当てはまる場合はマッチが発生しない。（先に判定して抜ける）
    記述が  空文字列、空白、ブランク記号、中間値補間記号  または  省略記号
    等価条件  .type != "normal"
*/
nas.CellDescription.prototype.compare=function(desc,lbl){
    if ( this.type != "normal") return 0;
    if (!(desc instanceof nas.CellDescription)){ desc = nas.CellDescription.parse(desc,lbl);}
    if ( desc.type != "normal") return 0;
    var myResult  =  0;
//prefix(group)判定
    if(
        ((this.prefix.length == 0)&&(desc.prefix.length == 0))||
        (nas.normalizeStr(this.prefix).toUpperCase() == nas.normalizeStr(desc.prefix).toUpperCase())
    ){ myResult += 1 }else{ return myResult };
//body判定
    if(
        (nas.normalizeStr(this.body,0).toUpperCase() == nas.normalizeStr(desc.body,0).toUpperCase())
    ){ myResult += 2 }else{ return myResult };
    if (
        ((this.postfix.length == 0)&&(desc.postfix.length == 0))||
        (this.postfix == desc.postfix)
    ) { myResult += 4 }else{ return myResult };
//プラスルールをここで実装のこと
    if (
        (this.modifier!='none') && (this.modifier == desc.modifier)
    ){ myResult += 8 }else{ return myResult };
    return myResult;
}
/*  test
A= new nas.CellDescription("");
A.parseContent("12");
console.log(A.compare("(12)"))
console.log(A)
*/
/**
 *	@params {Object nas.CellDescription|String} desc
 *	@params {lbl}  lbl
 *	@params {Object nas.xMap} targetMap
 *	@returns {String}
 *
 *    nas.CellDescription.type(desc,lbl,targetMap)
 *    セル記述のタイプを判定するクラスメソッド
 *    記述または、記述オブジェクトを渡す
 *    xMAPに該当するグループがあればそのエントリからタイプを得る
 *    なければ引数を判定してタイプの推測値を返す
 * "normal"        一般記述
 * "inherit"       空文字列、空白、省略記号  等の先行の値を継承する記述
 * "blank"         カラ記述
 * "interpolation" 中間値補間記号
 */
nas.CellDescription.type = function(desc,lbl,targetMap){
    if(desc instanceof nas.CellDescription){
        var label       = desc.prefix;
        var description = desc.body;
    }else{
        var label       = lbl;
        var description = desc;
    }
    var type = "normal";
if(targetMap){
      // xMapが指定された場合の処理はここに
/*
    記述内容からの判定とxMap参照の差異は
    "normal"判定された記述のうちｘMapエントリの存在しないものが"inherit"になる点
    フォーマット上は、ｘMapエントリとして予約語を登録可能なので他種の記述が"normal"になる場合もあり  これは  タイプとして判断すべき内容か？
    xMapに問い合わせを行い  結果でtypeを設定する
*/    
}else{
 	if (
 	     (description.match(/^\s*$/)) ||
 	     (description.match(nas.CellDescription.ellipsisRegex))
 	){
 	   type="inherit";//空白,ヌルストリングまたは明示された継承記述
 	} else if (description.match(nas.CellDescription.interpRegex)){
 	   type="interpolation";//中間値補間記号

 	} else if (description.match(nas.CellDescription.blankRegex)) {
 	   type="blank";//カラセル
 	}
}
//記述オブジェクトだった場合  オブジェクトのプロパティを更新する
    if(desc instanceof nas.CellDescription){ desc.type = type; }
 	return type;
}
/** nas.CellDescription.parse(description,label)
記述をパースしてセル記述オブジェクトを返すクラスメソッド
オブジェクトのラッパ関数
引数:
    description     セル記述
    label           トラックラベル(省略可)

        または配列
    [trackID,frameID]  トラックIDとフレームIDの配列 ?
    これは良くない  クラスメソッドが別のオブジェクトに縛られることになるので却下
    逆にxUIのオブジェクトなら可
*/
nas.CellDescription.parse=function(desc,lbl){
    return new nas.CellDescription(desc,lbl);
}
/**
	@params {String} str
 postfix文字列の数値展開を行い評価パラメータを返すクラスメソッド
    修3 > 修2 > 修
    修2 == 修修
*/
nas.CellDescription.parsePostfix=function(str){
    var parsed = nas.normalizeStr(str).toUpperCase();
    var numCount = parsed.match(/\d+/g);
    if(numCount){
        var replaced = parsed;
        numCount.forEach(function(n){
            replaced = replaced.slice(0,replaced.indexOf(n)-1);
            replaced += parsed.charAt(parsed.indexOf(n)-1).repeat(n);
            replaced += parsed.slice(parsed.indexOf(n)+n.length);
        });
        return replaced;
    };
    return parsed;
}
/*TEST
	nas.CellDescription.parsePostfix('A-1-修2') ;//A-1-修修
	nas.CellDescription.parsePostfix('A-1+4')   ;// A-1++++
*/
/**
 *	@params  {String} nameText
 *	@params  {String} prefix
 *	@returns {Array of nas.CellDescription}
 *	複合アセット名を合成要素名（CellDescription）のcollection配列として返す
 *	先行要素のプレフィックスを引き継ぐので A-1,A-3等の記述を A-1,3と省略できる

A-1-修_B-1-修

これは手書きの場合は

A-1_B-1-修

と省略するのが普通なのでそのように解釈する
補助記述が一つだけ最後についているケースは
そのグループ全体に同じ記述（ポストフィックス）を与える

表記はどちらでも良い

修 演 監 作 などの日本語でも解釈するが海外発注や転送を考慮するとアルファベット一文字またはプラスルールを推奨

A_B-1

A_B-1-修

これも許す
body,postfixが省略された場合　後置のアイテムの値を代入するようにする


A-1.5 これは副番号として A-1-5 と解釈する
この場合の第三要素の 5は副番号であり、ポストフィックスはない
番号 1-5 と解釈する
A-1-a-3 などの副番号の多重化を認める
1単位のエントリに２つ以上の要素がある場合は、以前は第三要素以降を連結してポストフィックスに解釈していたが、これを改める
最終エントリを判定してポストフィックスとして認められた場合のみポストフィックスの登録を行い、それ以外は番号部分に繰り込む
ポストフィックス判定ルーチンが必要10/31

"a1b1c1d1"等のセパレータ欠落型の記述を解釈するためのフィルタを実装
if(match(/([a-z]\d+){2,}/i))  replace(/(\d)([a-z])/ig,"$1_$2")

 */
nas.parseAssetIdf = function(assetName,prefix){
	var result = [];
	if(typeof prefix == 'undefined') prefix = nas.guessAssetPrefix(assetName);
	if(String(assetName).match(/([a-z]\d+){2,}/i)){
		assetName = String(assetName).replace(/(\d)([a-z])/ig,"$1,$2");
	};//
	(assetName.replace(/[\s\_\,\/]/g,',').split(',')).forEach(function(e){
		var cd = (nas.CellDescription.parse(e,prefix));
		result.push(cd);
		prefix = cd.prefix;
	});
	if(result[result.length-1].postfix){
		var postfix = result[result.length-1].postfix;
		result.forEach(function(e){
			e.postfix = postfix;
			e.content = e.toString('asset-body') +'-'+ postfix;
		});// 末尾アセットにポストフィックスがあれば"A-1-x_B-1-x"の様に統一される
	};
	return result;
}
/* TEST
	
 */
/**
 *	@params  {String} nameText
 *	@returns {String}
 *	アイテム名からグループプレフィックスを推測する
 *	複合アイテム名の場合は最初のセパレータの前方文字列が返されるのでこれを第一要素のプレフィックスとみなす
 *	例外処理：得られたプレフィックスが、一文字アルファベットを"_|/"で接続したものである場合は、セパレータで分離して最初の値を返す
 *  例外処理：引数に数値・セパレータが含まれない場合　引数全体をprefixとみなす
 *  シーケンス命名規則的なものを分離して別処理
 */
nas.guessAssetPrefix = function guessAssetPrefix(nameText){
	if(nameText.match(/^[^\d\-_\s]+$/)) return nameText.trim();
	if(nameText.match(/^([^\d_\-\s]+)[_\-\s]?\d+$/)) return RegExp.$1;
	if(nameText.match(/^([A-Z])([\_\/\s][A-Z])+.*/)) return RegExp.$1;
	if(nameText.match(/^[\_\-]?\d+$/)) return "";// 0001,_0012,-1234...
	if(nameText.match(/(^\_|^\d+)(.+)/)) return pman.guessAssetPrefix(RegExp.$2);//_BG _layout
	return nameText.trim().replace(/\s|\-|__|\//g,',').split(",")[0];
}
/*TEST
    nas.guessAssetPrefix("A-1"); // A
    nas.guessAssetPrefix("A-0001")
    nas.guessAssetPrefix("A0001+")
    nas.guessAssetPrefix("_BG");//BG

*/
/**
	@params {String}	name
	@params {String}	template

	ラフ原画・原画番号を正規化

	a_0001_b-12 > A-1_B-12
	等の表記揺れを統一する関数

	セパレーターは、UAF方式に固定
	ラベルセパレータ   "-"
	アセットセパレータ "_"
	テンプレート記述は "A0001"のような文字列で与えるが通常は不要
	第一文字目を判別してupper|lower
	含まれる数字の桁数を取得して正規化の桁数とする
*/
nas.assetIdfNormalize = function(name,template){
	var stringCase  = 'igunore';//'upper'|'lower'
	var nameDigits  = 0;
	var resultPrefix = '';
	if(template){
//テンプレート第一文字めが小文字|大文字範囲に該当する場合そのケースで統一とする
// 65-90 97-122
		var cCode = nas.normalizeStr(template).charCodeAt(0);
		if((cCode >= 65)&&(cCode <= 90)){
			stringCase = 'upper';
		}else if((cCode >= 97)&&(cCode <= 122)){
			stringCase = 'lower';
		};
//テンプレートの数字部分の桁数を取得する
		if(String(template).match(/(\d+)/)){
			nameDigits = RegExp.$1.length;
		};
	};
//入力の第一文字がセパレータであった場合は削除する
	name = name.replace(/^[\-_\s]+/,'');
//入力の第一要素が[A-Z]一文字以外であった場合はprefixを設定
	if(name.match(/^[a-z][a-z]/i)) resultPrefix = '_';//
	var names = nas.parseAssetIdf(name,'');
	var result = [];
	names.forEach (function(e){result.push(nas.RZf(e.toString('asset'),nameDigits));} )
	if(stringCase == 'upper'){
		return resultPrefix + result.join('_').toUpperCase();
	}else if(stringCase == 'lower'){
		return resultPrefix + result.join('_').toLowerCase();
	}else{
		return resultPrefix + result.join('_');
	};
}
/* TEST
nas.assetIdfNormalize('a1');//a-1
nas.assetIdfNormalize('a1 b1');//a-1_b-1

nas.assetIdfNormalize('a1 b1',"B");//A-1_B-1
nas.assetIdfNormalize('a1',"B-0000");//A-0001
nas.assetIdfNormalize('a1_b1_c3',"B");//A-1_B-1_C-3
*/


/*
このシステムでは、キーフレームの概念を使用しない

それにかわる「セクション」の概念で処理が行われる。

    セクション

タイムライントラックはセクションによって分割される

セクションは、値を持つ「有値セクション」及び　有値セクション同士の間をつなぐ「中間値補完セクション」に分類される。

中間値補完セクション自身は値を持たず、前方に位置する有値セクションに付属して後方のセクションへの中間値を導く役割をはたす。

中間値補完セクションは、更にその区間内に更にサブセクションを持つ。

有値セクションは、セクションの値として各タイムライントラックの種別ごとに固有のオブジェクトを値として持つ

有値セクションの継続長が１フレームだけの場合、一般的なコンポジットソフトで実装されるキーフレームと同様のふるまいをするので相互の変換は可能である
*/

/*  
    中間値補完セクション開始記述

システムにより予め定義されたセクションの値を発生する記述及びタイムシートにリンクされたxMapデータ内で定義される記述以外の記述は、全て中間値発生シンボルとして機能する。
すなわち「タイムシートになにか書いてあるフレームは基本的に何らかの値を持つフレームとなる。」


未記入、空白の記述は、セクションを維持する
中間値発生記述は、有値区間を終了させて中間値補完区間を開始する
中間値補完区間内では、中間値発生記述は先行するサブセクション終了して次のサブセクションを開始する
値指定記述、または中間値終了シンボルが記述された場合、中間値補完区間が終了して値区間が開始される
中間値終了シンボルで中間値補完区間が終了した場合　後続区間の値は保留される
遅延解決が行われるまでは後続区間は中間値補完区間に先行する値区間の値をもっているものと解釈される

遅延解決が行われた場合、その区間の値は新しく記述されたものとなる


グラフィックシンボル発生記述　画面表示のレイヤーで解釈されるシンボル発生記述を設ける

シンボルが、演出上の仮想のカメラに対するものかまたはステージ上のオペレーションに対するものかを識別する情報が必要
ただし（本来必須だが、これを曖昧にしたまま使用するユーザが多いので厳密にすると動作に以上をきたす可能性が高いため）必須ではない

    imaginalyCamera 想定カメラ
演出上の想定キャメラを指す
ステージ上の素材収録用のカメラ及びクリッピング情報でなく、演出的に想定されるカメラに対する指示指定類にはこのフラグが付与される
FI,FO,PAN,TILT,TrackIn等のカメラワークはこれを含むことが可能
slide,


*/
/**

例：
var A = new nas.CameraworkDescription()

*/

nas.CameraworkDescription = function(name,type,aliases,nodeSigns,noteText){
    this.name          = name       ;//識別キーワード
    this.type          = type       ;//タイプ文字列　symbol,composite,transition,geometry,effect,modefier,zigzag?
    this.aliases       = aliases    ;//別名配列
    this.nodeSigns     = nodeSigns ;//[fillSymbol[,OpenNode[,CloseNode]]];//シート表記上の記号
    this.description   = noteText   ;//オプション　簡易的な説明
}
/**
引数:
    form 
*/
nas.CameraworkDescription.prototype.toString = function (form){
    var myResult = "";
    switch(form){
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.type,
            this.aliases,
            this.nodeSigns,
            this.description
        ]);
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=[
            this.name,
            "\tname:"+this.name,
            "\ttype:"+JSON.stringify(this.type),
            "\taliases:"+JSON.stringify(this.aliases),
            "\tnodeSigns:"+JSON.stringify(this.nodeSigns),
            "\tdescription:"+this.description
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify(this);
    break;
    default:
        if(this[form]){
          return this[form]
        }else{
            return this.name;
        }
    }
}

/**
    与えられたキーワードに自身が合致するか否かを返すメソッド
引数:
    nameString  必須 キーネーム及び別名を検索して一致した情報があった場合true
    typeString  オプション　指定がない場合は任意のタイプとマッチ　検索順序は　symbol/composite/geometry/effect
    imaginary   オプション  指定がない場合はすべての情報を検索
*/
nas.CameraworkDescription.prototype.isMatch = function (nameString,typeString){
//console.log(this);
//console.log(String(nameString),typeString);
    if((typeString)&&(this.type != typeString)) return false;
    if(nameString == this.name) return true;
    var myRegex = new RegExp('^(' +this.name +'|'+ this.aliases.join("|").replace(/([\]\[\.])/g,'\\$1') +')$','i');
//    var myRegex = new RegExp('^' + this.aliases.join("|")+'$','i');
    if(String(nameString).match(myRegex)) return true;

    return false;    
}

/*
DBで解釈した文字列は

自由文字列の場合は<矢括弧>でシンボル記述とする

FI  ⇒   <FI> ;//コンポジット系
SL  ⇒   <SL> ;//ステージワーク系

丸かっこをコメントエスケープにするか？

　[start] != (start)


nodeSigns配列には、以下の情報が格納される

第一要素    String.fillSymbol   :中間値補完区間を埋めるシンボルの既定値　他の文字列を使用することも可能だが指定のない限りこの文字列を使用する
第二要素    String.openNode     :中間値補完区間を開くシンボルの既定値　オプション　この文字列が存在しない場合は、第一要素が優先で使用される
第三要素    String.closeNode    :中間値補完区間を閉じるシンボルの既定値　オプション　この文字列が存在しない場合は、第二要素が使用される


カメラワークディスクリプションとしての解決を行う場合
トランジション系のエフェクトを除いて、値区間単体または先行する値区間と中間値補完区間のセットで解決が行われる
中間値補完区間に後続する区間は、解決に使用されない。
*/

/*  参照用カメラワーク記述コレクション
*/
nas.cameraworkDescriptions = {
    members:{},
    singleRegex:new RegExp('‖'),
    barRegex   :new RegExp('|')
};
nas.cameraworkDescriptions.toString =function(){
    return JSON.stringify(this.members);
}

nas.cameraworkDescriptions.add = function(member){
    if(member instanceof nas.CameraworkDescription){
        this.members[member.name]=member;//上書き
        return this.members[member.name];
    }
    return false;
}

/**
 * 指定された条件のカメラワークオブジェクトを返す
 * 検索に失敗したらnull
 */
nas.cameraworkDescriptions.get = function(keyword,type){
//    if(keyword.match(/^<([^\>]+)>$/)) keyword = RegExp.$1;
    for (var prp in this.members){
        if(this.members[prp].isMatch(keyword,type)) return this.members[prp];
    }
    return null;
}

/**
 * テキストダンプ
 * 引数:
        form ;"JSON"/"palin-text"/"full-dump"
 */
nas.cameraworkDescriptions.dump = function(form){
    switch (form){
    case "JSON":
        return JSON.stringify(this.members);
        break;
    case "full-dump":
    case "full":
    case "dump":
        var result="";
            for (var prp in this.members){
                result += '["'+prp+'",';
                result += (this.members[prp].dump)? this.members[prp].dump('full') : this.members[prp].toString('full');
                result += ']\n';
            }
        return result;
        break;
    case 'plain-text':
    case 'plain':
    case 'text':
    default:
        var result = new Array;
            for (var prp in this.members){
                result.push((this.members[prp].dump)? this.members[prp].dump(form) : this.members[prp].toString(form));
            }
        return result.join((form)? '\n':',');
    }
}
/*設定パーサ
*/
nas.cameraworkDescriptions.parseConfig = function(dataStream,form){
    if(! dataStream) return false;
    var myMembers ={};
    var barSigns    = [];
    var singleNodes = [];
    var compSigns   = [];
    var geomSigns   = [];
    var doubleNodes = {};
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
        form = 'plain-text';
        if(dataStream.match(/\{[^\}]+\}/)){
            form = 'JSON';
        } else if(dataStream.match(/\[.+\,\[.+\]\]/)){
            form = 'full-dump';
        }
    }
    switch(form){
    case    'JSON':
         var tempObjects = JSON.parse(dataStream);
         for (var prp in tempObjects){
            myMembers[prp] = new nas.CameraworkDescription(
                tempObjects[prp].name,
                tempObjects[prp].type,
                tempObjects[prp].aliases,
                tempObjects[prp].nodeSigns,
                tempObjects[prp].description
            );
            if(tempObjects[prp].nodeSigns.length==1){
                singleNodes.add(tempObjects[prp].nodeSigns[0]);
            }else{
                barSigns.add(tempObjects[prp].nodeSigns[0]);
                switch(tempObjects[prp].type){
                case 'composite': compSigns.add(tempObjects[prp].nodeSigns[1]);
                break;
                case 'geometry' : geomSigns.add(tempObjects[prp].nodeSigns[1]);
                break;
                }
            }
         }
    break;
    case    'full-dump':	
    case    'full':	
    case    'dump':	
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.CameraworkDescription(
                currentRecord[1][0],
                 currentRecord[1][1],
                 currentRecord[1][2],
                 currentRecord[1][3],
                 currentRecord[1][4]
            );
            if (currentMember) myMembers[currentRecord[0]]=currentMember;
            if(currentRecord[1][3].length==1){
                singleNodes.add(currentRecord[1][3][0]);
            } else {
                barSigns.add(currentRecord[1][3][0]);
                switch(currentRecord[1][1]){
                case 'composite': compSigns.add(currentRecord[1][3][1]);
                break;
                case 'geometry' : geomSigns.add(currentRecord[1][3][1]);
                break;
                }
            }
        }
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
        if((currentMember)&&(currentField.match( /^\t([a-z]+)\:(.+)$/i ))){
            if((RegExp.$1=='aliases')||(RegExp.$1=='nodeSigns')){
                currentMember[RegExp.$1]=JSON.parse(RegExp.$2);
            }else{
        	    currentMember[RegExp.$1]=RegExp.$2;//追加プロパティ用
        	}
        } else if(currentField.match( /^\S+$/i )) {
        	myMembers[currentField] = new nas.CameraworkDescription(currentField,"symbol",[],[],"");
            currentMember=myMembers[currentField];
        }
        if (currentMember.nodeSigns.length == 1 ) {
            singleNodes.add(currentMember.nodeSigns[0]);
        }else {
            barSigns.add(currentMember.nodeSigns[0]);
            switch(currentMember.type){
            case 'composite': compSigns.add(currentMember.nodeSigns[1]);
            break;
            case 'geometry' : geomSigns.add(currentMember.nodeSigns[1]);
            break;
            }
        }
      }
    }
    this.members = myMembers;
//alert(singleNodes);
    this.singleRegex    = new RegExp("^("+singleNodes.join("|").replace(/[\[\]]/g,'\\$&')+")$");
    this.barRegex       = new RegExp("^["+barSigns.join("").replace(/[\|\.-]]/g,'\\$&')+"]$");
//composite/geometry signs
    this.compositeRegex = new RegExp("^("+compSigns.join("|").replace(/[\|\.-]]/g,'\\$&')+")$");
    this.geometryRegex  = new RegExp("^("+geomSigns.join("|").replace(/[\|\.-]]/g,'\\$&')+")$");

    return this.members;
}
/* test
var A = new nas.CameraworkDescription(
    "fadeIn",
    "composite",
    ["FI","F.I","フェード・イン","フェードイン","fade-in","▲","溶明"],
    ["|","▲"],
    "暗転状態から徐々に明るくなる演出手法"
)
nas.cameraworkDescriptions.add(A);
nas.cameraworkDescriptions.dump();
JSON.Stringify(nas.cameraworkDescriptions.members);
*/
/**
 * nas.File
 * ファイルハンドルオブジェクト
 * ファイルハンドルはプラットフォーム毎に実装されるファイルオブジェクトのエージェントとして機能する
 * AIR/Adobe 拡張スクリプト/html5 File/Node.js/
 * 今回はファイル名から拡張子切り分け（=最後の'.'で文字列をセパレート）のみの実装で済ませる
 * ファイル名本体に空文字列を認めていない
 * .git 等は　ファイル名　".git"   拡張子　なし　となる
 * 拡張子なしのドットファイルの扱いに注意
 *    これは保留　今回はHTML5のFileオブジェクトを直接扱う　AIRは保留
 */
/** @class 
 *	nas.File
 *	File|URLハンドリング用オブジェクト
 *	パスを配列で持つ
 *	標準的にはURI形式で返す
 *	各種形式変換メソッドあり
 *	初期化の際に与えられた引数が相対パスだった場合は、コンストラクタのカレントで補う
 *	
 *	[0-9a-z\-\+]+://
 *	MS-DOS形式のパスを扱う際は他のファイルシステムで空白となるルートエントリにドライブレターを置くように変更
 *  ファイルスキームとドライブレターの扱いに注意
 */
nas.File = function(myURI,baseURI,blob,stat){
    this.scheme      = "file:";
    this.user        = "";
    this.password    = "";
    this.hostname    = "";
    this.port        = "";
    this.search      = "";
    this.hash        = "";

	this.baseURI     = "";
	this.currentDir  = "";//指定のない場合は "" ディレクトリ時に末尾のセパレータは付けない
	this.body        = [];//
	this.fullName    = "";//this.currentDir+this.body.join("/");
	this.fsName      = "";//(appHost.os=="Win")? this.fullName.replace(/\//g,"\\"):this.fullName;
	this.name        = "";
//	this.body[this.body.length-1] ;
	this.blob        = ((blob)&&(typeof Blob == 'function'))? new Blob(blob,options) : null ;
    this.stat        = (stat)? stat : null ;
    this.pathtype    = 'unix';//unix|win|(mac|UNC|URL)予約
    if(arguments.length)
        this.parse(arguments[0],arguments[1],arguments[2],arguments[3]);
};
/*
    bodyのアイテム数が１ ファイル名だけで初期化された場合
    
*/
nas.File.prototype.parse = function(uri,baseUri,blob,stat){
    if(uri instanceof nas.File){
//第一引数がinstanceならばデッドコピーする
		this.scheme     = uri.scheme;
		this.user       = uri.user;
		this.password   = uri.password;
		this.hostname   = uri.hostname;
		this.port       = uri.port;
		this.search     = uri.search;
		this.hash       = uri.hash;
		this.baseURI    = uri.baseURI;
		this.currentDir = uri.currentDir;
		this.body       = Array.from(uri.body);
		this.fullName   = uri.fullName;
		this.fsName     = uri.fsName;
		this.name       = uri.name;
		this.blob       = uri.blob;
		this.stat       = uri.stat;
		this.pathtype   = uri.pathtype;
	}else{
        if(typeof baseUri == 'undefined') baseUri = "";
        this.baseURI = baseUri;
        if((! uri)||(typeof uri == 'undefined')) uri="/";
//uri形式のスキーム部分を分離する file|http|https|ftp|sftp だけを扱う
        if(uri.match(/^(file\:|https?\:|s?ftp\:)\/\/(.+)$/i)){
            this.scheme = RegExp.$1;
            uri         = RegExp.$2;
//URL(http://|https://)形式の末尾の search,hashを分離する
            if((this.scheme == "http:")||(this.scheme == "https:")){
                if(uri.match(/(\#(.+))$/)){
                    this.hash = RegExp.$2;
                    uri = uri.slice(0,-RegExp.$1.length);
                };
                if(uri.match(/(\?(.+))$/)){
                    this.search = RegExp.$2;
                    uri = uri.slice(0,-RegExp.$1.length);
                };
                if(uri.match(/\%[0-9A-F][0-9A-F]/)){
                    uri = decodeComoponent(uri);
                };
            };
            var domainString = uri.split('/')[0];
            uri = uri.slice(domainString.length);
            if(domainString.match(/^((([^\:]+)\:)?([^\@\:]+)\@)?([^\#\?\:]+)(\:([0-9]*))?/)){
                this.password = RegExp.$3;
                this.username = RegExp.$4;
                this.hostname = RegExp.$5;
                this.port     = RegExp.$7;
            }else{
                this.hostname = domainString;
            };
        }else{
            this.scheme  = "file:";
        };
//ユーザ・パスワード・ドメイン・ポートの分離は未処理（boby第一要素に入る）
        if(uri.match(/\\/)){
            uri = uri.replace(/\\/g,'/');//windowsパスでも初期化可能に
            this.pathtype = 'win';
        };
        this.body        = Array.from(uri.trim().split('/'));
        if((this.pathtype=='win')&&(this.body[1].match(/^[a-zA-Z]\:/))) this.body = this.body.slice(1);
//      if(this.body[0]=="") this.body = this.body.slice(1);
        this.fullName    = String(this.currentDir).split('/').slice(1).concat(this.body).join('/');//内部的にはunixタイプデリミタで保持
        this.fsName      = (this.pathtype == "win")? this.fullName.replace(/\//g ,"\\"):this.fullName;
        this.name        = this.body[this.body.length-1] ;
    };
};
/*TEST
[
    "http://ABC.example.com/index.html",
    "ftp://pass:kiyo@ABC.example.com/users/BBB.123.jpg",
    "https://ABC.example.com:1234/WWW/test.png",
    "sftp://pass:kiyo@ABC.example.com:8000/12/nop.txt",
    "http://kiyo@ABC.example.com/root/branch/leaf.file",
    "https://kiyo@ABC.example.com:8600/ABC/CDE.f",
    "/folder/file.ext",
    "C:\\FOLDER\\FILE.ext",
    ""
].forEach(e=> console.log(new nas.File(e)));
*/

/*
    URLを組み直して返す
    nas.Fileで扱うものは　file,http,https,ftp.sftpに限定する
*/
nas.File.prototype.getURL = function(type){
    var result = this.scheme + '//';
    if(this.scheme != 'file:'){
        if(this.username) result += this.username +((this.password)? (':'+this.password):"") + "@"
        if(this.hostname) result += this.hostname;
        if(this.port)     result += ":" +this.port;
        result += '/';
    }
    if(this.pathtype == 'win'){
        result += '/'+encodeURI(this.fullName);
    }else{
        result += Array.from(this.body,function(e){return encodeURIComponent(e)}).join('/');
    };
    if(this.search) result += "\?"+this.search;
    if(this.hash)   result += "\#"+this.hash;
    return result;
}
/*
    mimeType DB
 */
nas.File.mimeTypes = JSON.parse('[["3G2","video/3gpp2"],["3GP","video/3gpp"],["AAC","audio/x-aac"],["AEP","application/vnd.adobe.aftereffects"],["AFM","application/x-font-type1"],["AI","application/postscript"],["AIFF","audio/x-aiff"],["AVI","video/x-msvideo"],["BMP","image/bmp"],["CSS","text/css"],["DOC","application/msword"],["EPS","application/postscript"],["EPS","application/eps"],["EPS","application/x-eps"],["EPS","image/eps"],["EPS","image/x-eps"],["F4V","video/x-f4v"],["FLA","application/x-shockwave-flash"],["FLV","video/x-flv"],["FPX","image/vnd.fpx"],["GIF","image/gif"],["ICC","application/vnd.iccprofile"],["ICM","application/vnd.iccprofile"],["INDD","application/x-indesign"],["JSON","application/json"],["JPEG","image/jpeg"],["JPG","image/jpeg"],["JFIF","image/jpeg"],["J2C","image/jp2"],["J2K","image/jp2"],["JP2","image/jp2"],["JPC","image/jp2"],["JPF","image/jp2"],["JPX","image/jp2"],["PJPEG","image/jpeg"],["PJE","image/jpeg"],["M2V","video/mpeg"],["M4V","video/x-m4v"],["MOV","video/quicktime"],["MP3","audio/mpeg"],["MP4","video/mp4"],["MPEG","video/mpeg"],["MPG","video/mpeg"],["MTS","model/vnd.mts"],["OGV","video/ogg"],["OTF","application/x-font-otf"],["PDF","application/pdf","pdfprocess=Rasterize&resolution=150"],["PFB","application/x-font-type1"],["PFM","application/x-font-type1"],["PICT","image/x-pict"],["PNG","image/png"],["PPT","application/vnd.ms-powerpoint"],["PS","application/postscript","psprocess=Rasterize&psresolution=150"],["PSD","image/vnd.adobe.photoshop","process=None&layerNaming=Layername"],["RTF","application/rtf"],["SVG","image/svg+xml"],["SVGZ","image/svg+xml"],["SWF","application/x-shockwave-flash"],["TAR","application/x-tar"],["TGA","image/x-tga"],["TXT","text/plain"],["TEXT","text/plain"],["TIF","image/tiff"],["TIFF","image/tiff"],["TTC","application/x-font-ttf"],["TTF","application/x-font-ttf"],["VOB","video/dvd"],["VTT","text/vtt"],["WAV","audio/x-wav"],["WEBM","video/webm"],["WMA","audio/x-ms-wma"],["WMV","video/x-ms-wmv"],["APNG","image/vnd.mozilla.apng"],["AVIF","image/avif"],["XLS","application/vnd.ms-excel"],["ZIP","application/zip"],["CLIP","image/clip"],["TVPP","image/tvpp"],["XPS","text/xpst"],["XPST","text/xpst"],["XMAP","text/xmap"],["STBD","text/stbd"],["PMDB","text/pmdb"],["STS","application/sts"],["TSH","application/tsh"],["ARD","application/ard"],["ARDJ","application/ardj"],["TDTS","application/tdts"],["XDTS","application/xdts"],["GDOC","application/vnd.google-apps.document"],["GDRAW","application/vnd.google-apps.drawing"],["GFORM","application/vnd.google-apps.form"],["GJAM","application/vnd.google-apps.jam"],["GMAP","application/vnd.google-apps.map"],["GSLIDES","application/vnd.google-apps.presentation"],["GSCRIPT","application/vnd.google-apps.script"],["GSITE","application/vnd.google-apps.site"],["GSHEET","application/vnd.google-apps.spreadsheet"],["ODT","application/vnd.oasis.opendocument.text"],["ODS","application/vnd.oasis.opendocument.spreadsheet"],["ODP","application/vnd.oasis.opendocument.presentation"],["ODG","application/vnd.oasis.opendocument.graphics"],["ODB","application/vnd.oasis.opendocument.database"],["ODF","application/vnd.oasis.opendocument.formula"]]');
/*
nas.File.mimeTypes = csvSimple.parse(`3G2,video/3gpp2
3GP,video/3gpp
AAC,audio/x-aac
AEP,application/vnd.adobe.aftereffects
AFM,application/x-font-type1
AI,application/postscript
AIFF,audio/x-aiff
AVI,video/x-msvideo
BMP,image/bmp
CSS,text/css
DOC,application/msword
EPS,application/postscript
EPS,application/eps
EPS,application/x-eps
EPS,image/eps
EPS,image/x-eps
F4V,video/x-f4v
FLA,application/x-shockwave-flash
FLV,video/x-flv
FPX,image/vnd.fpx
GIF,image/gif
ICC,application/vnd.iccprofile
ICM,application/vnd.iccprofile
INDD,application/x-indesign
JSON,application/json
JPEG,image/jpeg
JPG,image/jpeg
JFIF,image/jpeg
J2C,image/jp2
J2K,image/jp2
JP2,image/jp2
JPC,image/jp2
JPF,image/jp2
JPX,image/jp2
PJPEG,image/jpeg
PJE,image/jpeg
M2V,video/mpeg
M4V,video/x-m4v
MOV,video/quicktime
MP3,audio/mpeg
MP4,video/mp4
MPEG,video/mpeg
MPG,video/mpeg
MTS,model/vnd.mts
OGV,video/ogg
OTF,application/x-font-otf
PDF,application/pdf,pdfprocess=Rasterize&resolution=150
PFB,application/x-font-type1
PFM,application/x-font-type1
PICT,image/x-pict
PNG,image/png
PPT,application/vnd.ms-powerpoint
PS,application/postscript,psprocess=Rasterize&psresolution=150
PSD,image/vnd.adobe.photoshop,process=None&layerNaming=Layername
RTF,application/rtf
SVG,image/svg+xml
SVGZ,image/svg+xml
SWF,application/x-shockwave-flash
TAR,application/x-tar
TGA,image/x-tga
TXT,text/plain
TEXT,text/plain
TIF,image/tiff
TIFF,image/tiff
TTC,application/x-font-ttf
TTF,application/x-font-ttf
VOB,video/dvd
VTT,text/vtt
WAV,audio/x-wav
WEBM,video/webm
WMA,audio/x-ms-wma
WMV,video/x-ms-wmv
APNG,image/vnd.mozilla.apng
AVIF,image/avif
XLS,application/vnd.ms-excel
ZIP,application/zip
CLIP,image/clip
TVPP,image/tvpp
XPS,text/xpst
XPST,text/xpst
XMAP,text/xmap
STBD,text/stbd
PMDB,text/pmdb
STS,application/sts
TSH,application/tsh
ARD,application/ard
ARDJ,application/ardj
TDTS,application/tdts
XDTS,application/xdts
GDOC,application/vnd.google-apps.document
GDRAW,application/vnd.google-apps.drawing
GFORM,application/vnd.google-apps.form
GJAM,application/vnd.google-apps.jam
GMAP,application/vnd.google-apps.map
GSLIDES,application/vnd.google-apps.presentation
GSCRIPT,application/vnd.google-apps.script
GSITE,application/vnd.google-apps.site
SGEET,application/vnd.google-apps.spreadsheet
ODT,application/vnd.oasis.opendocument.text
ODS,application/vnd.oasis.opendocument.spreadsheet
ODP,application/vnd.oasis.opendocument.presentation
ODG,application/vnd.oasis.opendocument.graphics
ODB,application/vnd.oasis.opendocument.database
ODF,application/vnd.oasis.opendocument.formula`);
google-api v3 mimetypes
    	application/vnd.google-apps.audio	
GDOC	application/vnd.google-apps.document	Google Docs
    	application/vnd.google-apps.drive-sdk	3rd party shortcut
GDRAW	application/vnd.google-apps.drawing	Google Drawing
    	application/vnd.google-apps.file	Google Drive file
    	application/vnd.google-apps.folder	Google Drive folder
GFORM	application/vnd.google-apps.form	Google Forms
(終了)	application/vnd.google-apps.fusiontable	Google Fusion Tables
GJAM	application/vnd.google-apps.jam	Google Jamboard
GMAP	application/vnd.google-apps.map	Google My Maps
		application/vnd.google-apps.photo	
GSLIDES	application/vnd.google-apps.presentation	Google Slides
GSCRIPT	application/vnd.google-apps.script	Google Apps Scripts
    	application/vnd.google-apps.shortcut	Shortcut
GSITE	application/vnd.google-apps.site	Google Sites
GSHEET	application/vnd.google-apps.spreadsheet	Google Sheets
    	application/vnd.google-apps.unknown	
    	application/vnd.google-apps.video	
OpenDocument mym-type
ODT, ‐ 文書ドキュメント [application/vnd.oasis.opendocument.text]
ODS, ‐ 表計算ドキュメント [application/vnd.oasis.opendocument.spreadsheet]
ODP, ‐ プレゼンテーション [application/vnd.oasis.opendocument.presentation]
ODG, ‐ 図形描画 [application/vnd.oasis.opendocument.graphics]
ODB, ‐ データベース [application/vnd.oasis.opendocument.database]
ODF, ‐ 数式 [application/vnd.oasis.opendocument.formula]// */

/** ユーティリティー関数
 * nas.File.divideExtension(filename)
 *  @params {String} filename
 *          文字列 拡張子付きファイル名
 *  @returns {Array}
 *      戻値:配列[拡張子,ファイル名本体]
 *      [file-extension,name-body]
 */
nas.File.divideExtension = function(filename){
    filename=String(filename);
        var nameBody=filename;
        var nameExtension ='';
    if(filename.match(/^(.+)\.([^\.]*)$/)){
        nameExtension   =RegExp.$2;
        nameBody        =RegExp.$1;
    };
    return [nameExtension,nameBody];
};
/** ユーティリティー関数
 * nas.File.extname(filepath)
 *  @params {String} filepath
 *          文字列 拡張子付きファイル名
 *  @returns {Stirng}
 *      パスの最後の'.'の後方文字列を'.'含めて戻す
 */
nas.File.extname = function(filepath){
    if((typeof path != 'undefined')&&(path.extname instanceof Function)) return path.extname(filepath);
    var file = new nas.File(filepath);
    var ext = "";
    if(filepath.match(/(\.[^\.]*)$/)) ext = RegExp.$1;
    return ext;
};
/** ユーティリティー関数
 * nas.File.basename(filename)
 *  @params {String} filename
 *          文字列 拡張子付きファイル名
 *  @returns {Stirng}
 *      パス階層を一つ上がった上位のディレクトリのパスを戻す
 */
nas.File.basename = function(filepath,ext){
    if((typeof path != 'undefined')&&(path.basename instanceof Function)) return path.basename(filepath,ext);
    var file = new nas.File(filepath);
    return ((ext)?file.name.replace(new RegExp(ext+'$'),''):file.name);
};
/** ユーティリティー関数
 * nas.File.dirname(filename)
 *  @params {String} filename
 *          文字列 拡張子付きファイル名
 *  @returns {Stirng}
 *      パス階層を一つ上がった上位のディレクトリのパスを戻す
 */
nas.File.dirname = function(filename){
    if((typeof path != 'undefined')&&(path.dirname instanceof Function)) return path.dirname(filename);
    filename = new nas.File(filename);
    if(filename.pathtype != 'win'){
        return filename.body.slice(0,-1).join('/');
    }else{
        return filename.body.slice(0,-1).join('\\');
    };
};
/**
 * nas.File.relative(from,to)
 *  @params {String} from
 *          起点パス
 *  @params {String} to
 *          相対パスを得る目的パス
 *  @returns {Stirng}
 *      起点から見た相対パス
 */
nas.File.relative = function(from,to){
    if((typeof path != 'undefined')&&(path.relative instanceof Function)) return path.relative(from,to);
    from = new nas.File(nas.File.resolve(from)).fullName.replace(/(\/|\\)$/,'').split('/');
    var toFile = new nas.File(nas.File.resolve(to));
    to = toFile.fullName.split('/');
    var sep = (toFile.pathtype != 'win')? '/':'\\';
    var result = [];
    var match = 0;
    var sim   = true;
    for (var i = 0; i < from.length ; i ++){
        if(i < to.length){
            if((sim)&&(from[i] == to[i])){
                match ++;
                continue;
            }else{
                sim = false;
            };
        };
        if(!sim) result.push('..');
    };
    return result.concat(to.slice(match)).join(sep);
};
/**
 * nas.File.resolve(...args)
 *  @params  {String} arg
 *  @returns {Stirng}
 *
 *      引数を連結したパスを返す
 *  ルートを含まないパスのみを指定すると可能な限り現在のパスで補う
 *  現在のパスが得られない環境では現在のパスをルートとして扱う
 *  空文字列のみ及びパスとして利用できない文字を含む引数は、無視
\	　円記号
/	　スラッシュ

:	　コロン
*	　アスタリスク
?	　クエスチョンマーク、疑問符
"	　ダブルクォーテーション
<>	　不等号
|	　縦棒
(/\\|\/|\*|\?|\"|\<|\>|\:|\|/)
 */
nas.File.resolve = function(){
    if((typeof path != 'undefined')&&(path.resolv instanceof Function)) return path.resolve.apply(this,arguments);
    var result = (typeof Folder == 'function')? Folder.current.fullName.split('/'):[""];//
    var sep = '/';
    for (var i = 0;i < arguments.length; i++){
        var arg = String(arguments[i]);
        if ((arg.length == 0)||(arg.match(/(\*|\?|\"|\<|\>|\:|\|)/))) continue;
        if (arg.match(/^(\\|\/)+$/)){result = [""]; continue;};
        var elm  = new nas.File(arg);
        if(elm.pathtype == 'win') sep = '\\';
        var tgt  = elm.fullName.split('/');
        if((tgt.length >= 2)&&(tgt[0] == "")){
//パスがルートからの記載なので入れ替え
            result = tgt;
            continue;
        };
        for (var n = 0; n < tgt.length;n ++){
            if(tgt[n] == '..'){
                result.splice(-1,1);
                continue;
            }else if((tgt[n] == '.')||(tgt[n] == '')){
                continue;
            }else{
                result.push(tgt[n]);
            };
        };
    };
    if(result.length == 1) result.push("");
    return result.join(sep);
}
/* test
    console.log(nas.File.resolve());                    // '/'
    console.log(nas.File.resolve('///','/abc'));        // '/abc'
    console.log(nas.File.resolve('/','/ab?c','abc'));   // '/abc'
    console.log(nas.File.resolve('/','abc')) ;          // '/abc'
    console.log(nas.File.resolve('','abc'))  ;          // '/abc'
    console.log(nas.File.resolve('/','/abc','/bcd'));   // '/bcd'
    console.log(nas.File.resolve('abc','bcd'));         // '/abc/bcd'
*/
/** ユーティリティー関数
 * nas.File.contentType(path)
 *  @params {String} arg
 *          文字列 拡張子付きファイル名
 *  @returns   {Array}
 *  mimetypeを含む配列 
 */
nas.File.contentType = function(path){
//    if(mime) return mime.contentType(path);
    var ext = this.extname(path).replace(/^\./,'').toUpperCase();
    var result = [];
    for(var i = 0;i<this.mimeTypes.length ; i ++ ){
        if(this.mimeTypes[i][0] == ext) result.push(this.mimeTypes[i][1]);
    };
    if(result.length) return result[0];
    return false;
}
/** ユーティリティー関数
 * nas.File.join(...args)
 *  @params {String} arg
 *          文字列 拡張子付きファイル名
 *          node.jsの path.joinと仕様を合わせる? 2021/07/20
 */
nas.File.join = function(){
    if((typeof path != 'undefined')&&(path.join instanceof Function)) return path.join.apply(this,arguments);
    var result = [];
    var sep    = '/';
    for (var i = 0 ; i < arguments.length ; i ++){
        var elm = new nas.File(arguments[i]);
        if(elm.pathtype == 'win') sep = '\\';
        var pth = elm.fullName.split('/');
        for (var j = 0 ;j < pth.length ; j ++){
            if(
                (pth[j]=='.')||
                ((pth[j]=='')&&(result.length))
            ) continue;
            if(pth[j]=='..'){result.splice(-1,1);continue;}
            result.push(pth[j]);
        };
    }
    return result.join(sep);
};
/*
    Adobeライブラリ互換のため基礎プロパティを初期化
    baseLocationは、nas-libの格納ディレクトリ
    WEB環境ではスタータhtmlのロケーション直下の'nas/'フォルダを指す
    appHostの値を参照する
    ESTK環境下では Folder それ以外では nas.File を設定する
*/
    if(appHost.pletform == 'UXP'){
        if (appHost.userLibraryVersion){
            nas.baseLocation = new nas.File(appHost.userLibrary);
        }else{
            fs.getPluginFolder().then(function(f){nas.baseLocation = new nas.File(nas.File.join(f.nativePath,nas))});
        };
    }else if(appHost.ESTK){
        nas.baseLocation = (appHost.userLibraryVersion)?
            new Folder(appHost.userLibrary):
            new Folder(new File($.fileName).parent.parent.fullName);
    }else if(appHost.platform == 'CEP'){
        nas.baseLocation = (appHost.userLibraryVersion)?
            new nas.File(appHost.userLibrary):
            new nas.File(new CSInterface().getSystemPath(SystemPath.EXTENSION) + "/nas");
    }else{
        nas.baseLocation = new nas.File(appHost.userLibrary);
    };
//nas.nTable
/**
 * @constractor
 * 配列2つをたばねて操作するオブジェクト セレクトボタン等で結構使うけど…
 * なんかもっと良い方法が有りそうな気もする。が、とりあえず。コンストラクタにしておく
 *  データ構造は [[index,[array]],[名前,[配列]]...]
 */
nas.nTable = function(){
    this.bodys          = []  ;//テーブル本体
    this.length         = 0   ;//
    this.selected       = 0   ;//index
    this.selectedName   = ""  ;//第一フィールド
    this.selectedRecord = null;
}
/**
 * @params {Number} idx
 * @returns {*}
 *  名前付きテーブルのエントリを選択して選択メンバーを返す
 */
nas.nTable.prototype.select = function (idx) {
    if (!isNaN(idx)) {
        idx = idx.valueOf();
		try{
        	this.selected = Math.floor((idx + this.bodys.length) % this.bodys.length);
		} catch(err){
			alert(err);
			alert(idx);
		};
    }else{
        switch(idx){
            case "next":
                this.selected++;
                this.selected = this.selected % this.bodys.length;
                break;
            case "prev":
                this.selected--;
                this.selected = (this.selected + this.bodys.length) % this.bodys.length;
                break;
            default :
                this.selected = this.selected % this.bodys.length;
        };
    };
    this.selectedRecord = this.bodys[this.selected];
    this.selectedName = this.bodys[this.selected][0];
    if (this.onChange) {
        this.onChange()
    }
    return this.bodys[this.selected];
};
/**
 * @params {Number} id
 * @returns {Array}
 *  名前付きテーブルの指定IDの値リストを返す
 *  引数がない場合はindexリスト
 */
nas.nTable.prototype.names = function (id) {
    if (!id)id = 0;
    myNames = [];
    if (isNaN(id)) {
        for (ix = 0; ix < this.bodys.length; ix++) {
            myNames.push(this.bodys[ix].join("/"));
        }
    } else {
        for (ix = 0; ix < this.bodys.length; ix++) {
            myNames.push(this.bodys[ix][id]);
        }
    }
    return myNames;
};
/**
 * @params {String} nAme
 * @params {Array}  bOdy
 *  名前付きテーブルにエントリを加える
 */
nas.nTable.prototype.push = function (nAme, bOdy) {
    if (!(bOdy instanceof Array)) bOdy = [bOdy];
    this.bodys.push([nAme].concat(bOdy));
    this.length = this.bodys.length;
    this.select(-1);
};
/**
 * @params {Array}  bOdy
 *  名前付きテーブルをポップ
 */
nas.nTable.prototype.pop = function () {
    this.bodys.pop();
    this.length = this.bodys.length;
//		this.select(this.selected % this.length);
};
/**
 * @params {Number} idx
 * @returns {Boolean}
 *  指定エントリを削除
 *  最後の1エントリは削除できない
 */
nas.nTable.prototype.del = function (idx) {
    if (this.bodys.length <= 1) return false;
    if (idx != (this.length - 1)) {
        for (ix = idx; ix < (this.bodys.length - 1); ix++) {
            this.bodys[ix] = this.bodys[ix + 1];
        };
    };
    this.bodys.pop();
    this.length = this.bodys.length;
    this.select();
};
/**
 * @params {String}   nAme
 * @params {Array}    bOdy
 * @params {Number}   idx
 *  エントリを更新して選択する
 */
nas.nTable.prototype.change = function (nAme, bOdy, idx) {
    if (!(bOdy instanceof Array)) bOdy = [bOdy];
    idx = idx % this.length;
    this.bodys[idx] = [nAme].concat(bOdy);
    this.select(idx);
};
/**
 * onChangeが存在すればコールするように設定
 */
nas.nTable.prototype.onChange = function () {

};
//alias
var nTable = nas.nTable;

/**
 * 	WebStorage代用オブジェクト
 *	localStorage,sessionStarge の代用オブジェクト
 *	HTML5のlocalStorage,sessionStorageとある程度の互換性あり
 *	AIR|CSX|ES|node-console 等のlocalStorage|sessionStorageのない環境に
 *	localStorage|sessionStroageを実装
 *	AIRまたはCSX CEP環境
 *	ファイルオブジェクトを利用して可能ならローカルディスク上に保存を行う
 *	Electron環境
 *	本来一時データとなるElecctron|UXP上のLocalStorageをローカルファイルシステムへのストアで永続性をもたせる
 	sessionStorageは、オリジナルをそのまま使用
 *	現在のコードでは、Web Storageで許可されている直接プロパティの設定は禁止される
 *	操作メソッド互換
 *	setItem/getItemメソッド経由のみで正常な動作となる
 *
 *	値の保存は内容変更の都度、可能ならばローカルファイルへの保存で行なわれる
 *	ファイルシステムの利用ができない場合は、セッションストレージと同様の動作を行う。
 *	
 *	既にローカルストレージが実装されている環境では代用インスタンスは生成されない
 *	ローカル保存用クラスオブジェクトは既存のStorageを引数としても動作可能
 *
 *	ObjectProperty
 *	.length			保存されているデータの数を返す
 *	.name			localStorage|sessionStorage|任意のストレージ名
 *	ObjectMethod
 *	.key(n)			保存されているn番目のkeyを返す
 *	.getItem(key)	keyに対応するvalueを取得する
 *	.setItem(key, value)	keyとvalueのペアでデータを保存する
 *	.removeItem(key)	keyに対応するvalueを削除する
 *	.clear()			データをすべてクリアする
 *	ClassMethod
 *	.store(storage)			ストレージの内容を保存
 *	.restore(storage)		保存済みのストレージを復帰
 */
nas.WebStorage = function nasStorage(storageName){
	if(typeof storageName == 'undefined') storageName = 'sessionStorage'
	this.length = 0;
	this.name   = String(storageName);
	this.isLocalStorage = (this.name == 'localStorage')? true:false;
	this.timestamp = new Date().getTime();
	this.members = [];
	this.members.set=function(myKey){
		for (var ix=0;ix<this.length;ix++){if(this[ix]==myKey){return ix;}};
		this.push(myKey);return this.length;
	}
}
/** @params {Number} key
 *	@returns {String}
 *	整数キーに従ってキー文字列を返す
 */
nas.WebStorage.prototype.key = function(key){return this.members[key]}
/**
 *	@params {String}	keyName
 *	@params {String}	keyValue
 *	@returns {undefined}
 *	アイテム設定
 */
nas.WebStorage.prototype.setItem=function(keyName,keyValue){
	var ix=this.members.set(keyName);
	this[keyName] = keyValue;
	this.length=this.members.length;
//値のセットに成功したらディスクに保存 戻り値は不明
	if(this.isLocalStorage){
		this.isLocalStorage=false;
		nas.WebStorage.store(this);
		this.isLocalStorage=true;
	};
	return;
}
/**
 *	@params  {String}	keyName
 *	@returns {undefined}
 *	メンバー削除
 */
nas.WebStorage.prototype.removeItem=function(keyName){
	for(var ix=0;ix<this.members.length;ix++){
		if(this.members[ix]==keyName){
			this.members.splice(ix,1);
			this.length=this.members.length;
			delete this[keyName];
//値の削除に成功したらディスクに上書き保存
			if(this.isLocalStorage){
				this.isLocalStorage=false;
				nas.WebStorage.store(this);
				this.isLocalStorage=true;
			}
			return;
		};
	};
	return;
};
/**
 *	@params  {String}	keyName
 *	@returns {String}
 *	メンバー取得
 */
nas.WebStorage.prototype.getItem = function(keyName){return this[keyName]};
/** アイテムの全クリア */
nas.WebStorage.prototype.clear=function(){
	for(var ix=0;ix<this.members.length;ix++){
		delete(this[this.members[ix]]);
	}
	this.members.splice(0,this.length);this.length=0;
//値の削除に成功したらローカルディスク上のデータもクリア
	if(this.isLocalStorage){
		this.isLocalStorage=false;
		nas.WebStorage.store(this);
		this.isLocalStorage=true;
	};
	return true;
}
/** nasLibrary共用 localStorage|sessionstorage他任意のWebStorageの内容を保存
	内容を保全するクラスメソッド
	短時間に連続して非同期／同期IOを呼び出す可能性があるのでこのメソッドを呼ぶ前にisLocalStorageプロパティを一時的にfalseにすること
	データ名称は
	nas/lib/etc/storageStore/<storage-name>.json
	プラットフォーム別の保存は廃止
	WEB環境では保存はできないが、ローカルファイルアクセスの可能な環境下ではストレージ内容を共有する
	起動時に初期化が必要
*/
nas.WebStorage.store =function store(storage){
	var storageName = (storage === localStorage)? 'localStorage':'sessionStorage';
	if(storage instanceof nas.WebStorage) storageName = storage.name;
	if((storage instanceof nasWebStorage)||(typeof storage == 'object')){
		if(fileBox){
			var myContent=[];
			for (var ix=0;ix<storage.members.length;ix++){myContent.push('"'+storage.members[ix]+'":"'+encodeURI(storage.getItem(storage.members[ix]))+'"');};
			myContent="{"+myContent.join(",")+"}";
			var contentBackup=fileBox.contentText;var fileBackup=fileBox.currentFile;
			if(appHost.platform=="AIR"){
//AIRの場合はair.Fileオブジェクト
				fileBox.currentFile=new air.File(Folder.nas.url+"/lib/etc/storageStore/"+storageName+".json");
			}else if((appHost.platform=="CSX")||(appHost.platform=="CSX")){
//CSX,CEP環境の場合はフルパス(url)を文字列で与える
				fileBox.currentFile=Folder.nas+"/lib/etc/storageStore/"+storageName+".json";
			};
			fileBox.contentText=myContent;
			var myResult=fileBox.saveContent();
			fileBox.contentText=contentBackup;fileBox.currentFile=fileBackup;
			return myResult;
		}else if(appHost.platform=="UXP"){
		
		};
	};
		return false;
}
/**
	ローカルディスク上からストレージデータを読みだして復帰する
*/
nas.WebStorage.restore = function restore(storage){
	var storageName = (storage === localStorage)? 'localStorage':'sessionStorage';
	if(storage instanceof nas.WebStorage) storageName = storage.name;
	if((storage instanceof nas.webStorage)||(typeof storage == 'object')){
		if(typeof fileBox != 'undefined'){
			var contentBackup=fileBox.contentText;var fileBackup=fileBox.currentFile;
//fileBox.contentText="";
			if(appHost.platform=="AIR"){
				fileBox.currentFile=new air.File(Folder.nas.url+"/lib/etc/storageStore/"+storageName+".json");
			}else{
				fileBox.currentFile=Folder.nas+"/lib/etc/storageStore/"+storageName+".json";
			}
			var myContent=fileBox.readContent();
			fileBox.contentText=contentBackup;fileBox.currentFile=fileBackup;
			if(myContent){
//現在の内容をクリア
				if(storage.length){for(var ix=0;ix<storage.members.length;ix++){delete(this[storage.members[ix]])}};
				var myObj=JSON.parse(myContent);
				storage.isLocalStorage=false;
				for(var prp in myObj){
					storage.setItem(prp,decodeURI(myObj[prp]))
				};
				storage.isLocalStorage=true;
			}
			return true;
		}else if(appHost.platform=="UXP"){
		
		}else{
		return false;
		};
	};
}
/* 
 *  ネイティブのsessionStorage|localStorageが存在する環境下では代用ストレージを初期化しない
 */
if(typeof localStorage == 'undefined'){
	const sessionStorage = new nas.WebStorage('sessionStorage');
	const localStorage   = new nas.WebStorage('localStorage');
	//localStorage.isLocalStorage=true;
};

/* 以下の初期化コードは、fileBoxアクセス環境が整ってから発火のこと
	nas.WebStorage.restore(localStorage);
*/

/*test
Ax=new nas.webStorage();
set Ax(){alert(123)}'
Ax.length;
Ax["V"]="1234";
*/
/*=======================================*/
if((typeof config == 'object')&&(config.on_cjs)){
    exports.config  = config;
    exports.appHost = appHost;
    exports.nas     = nas;
};
