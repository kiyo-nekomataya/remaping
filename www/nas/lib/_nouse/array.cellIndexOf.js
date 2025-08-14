/*
    cellIndexOf(検索要素、開始アドレス)
    配列内に同じセル要素がすでに存在するか否かを判定してindexを返す拡張メソッド
    配列の要素が文字列またはセル記述オブジェクトであること

    セルの評価は　nas.compareCellIdf　関数を用いる
        空白記述で無いこと
        カラで無いこと
        有効記述であること
        中間値生成キーのうち特定の有効値を持つものであること
    が要求される
    
    戻り値はArray.indexOfに準拠
        最初にヒットしたインデックス(フレーム番号)を返す
        セルが存在しない場合は-1を返す
        開始インデックスの指定を行った場合はそのインデックスから検索を開始する、

何者ともマッチしない（= たとえ同じ記述であってもマッチしない）
    セル記述が空白である場合
    セル記述が未指定の中間値補間記号の場合

    修飾記号を削除する
    アルファベット・数字・記号をアスキーコードに変換する
    
nas.compareCellIdef(target,destination)
2017.10.16
*/
  _cellIndexOf = function (description /*, fromIndex */) {
    "use strict";

    if (this == null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = 0;

    if (arguments.length > 0) {
      n = Number(arguments[1]);//第ニ引数-検索開始インデックス

      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;// NaNならば０開始
      } else if (n != 0 && n != Infinity && n != -Infinity) {//ゼロ　無限大　マイナス無限大以外　すなわち実数範囲　の場合負数を全て-1 それ以外を整数化
         n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
//要素数をオーバーしたら検索失敗
    if (n >= len) {
      return -1;
    }

    var k = (n >= 0)? n : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && (t[k].isSame(description) > 1)) {
        return k;
      }
    }
    return -1;
  }
