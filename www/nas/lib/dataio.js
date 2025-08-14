/**
 * @fileoverview XPS ファイルから オブジェクトの初期化
 *    AEKeyデータ読み込み
 * メソッドか?それとも関数か?
 * 2005/03/20
 */

/**
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

/**
 * ssUnit(UpS)
 * サブユニット長を自動設定して戻す
 * 引数 UpS は、Units Per Second・秒あたりのフレーム数 または キーワード
 * 戻り値は、フレームレートにしたがって自動設定されるサブユニットの長さ
 * サブセパレータの値とは別。
 * @param UpS
 * @returns {*}
 */
function ssUnit(UpS) {
    if (isNaN(UpS)) {
        switch (UpS) {
            case "NTSC":
                return 6;
                break;
            case "PAL":
                return 5;
                break;
            case "drop":
                return 6;
                break;
            default:
                return UpS;
        }
    } else {
        /**
         * ドロップフレーム系の処置・どのみち整数でないとイヤだけど、暫定で
         * @type {number}
         */
        UpS = Math.round(UpS);
        for (ssu = 4; ssu > 1; ssu--) {
            if (UpS % ssu == 0)return UpS / ssu;
        }
        return UpS;
    }
    /**
     * @desc 4から1へ順に約数をあたる。マッチした時点で返す。
     * すべて失敗した場合は、元の数値を返す。 
     */
}

/**
 * ckBlank(timeLine)
 * 制御レイヤ(現在カラセル制御のみ)の判定
 * 判定するtimelineオブジェクトを与える。
 * すべての値が 0 || 100    ならばカラセルレイヤであると判定
 *
 * 現在はブーリアンで返しているが、要調整か?
 * @param timeLine
 * @returns {boolean}
 */
function ckBlank(timeLine) {
    for (xid = 0; xid < timeLine.length; xid++) {
        if (timeLine[xid].value[0] % 100 != 0) {
            return false
        }
    }
    return true;
}


var thisComp = null;
var thisLayer = null;
var thisTimeLine = null;