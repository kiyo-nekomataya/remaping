/**
 * @fileoverview 色変換ライブラリ nasCCM.js
 * 色空間等の変換ライブラリです。
 * v 1.2.4.1 2021/02/09
 *   モジュール化のためのソース変更
 */
/*=======================================*/
if(typeof nas == 'undefined') var nas = {};
//旧システム互換コード　移植終了後に撤去
myFilename = ("$RCSfile: nas_CCM.js,v $").split(":")[1].split(",")[0];
myFilerevision = ("$Revision: 1.2.4.1 $").split(":")[1].split("$")[0];
try {
    nas.Version["CCM-lib"] = "CCM-lib:" + myFilename + " :" + myFilerevision;
} catch (err) {
    nas = {};
    nas.Version["CCM-lib"] = "CCM-lib:" + myFilename + " :" + myFilerevision;
}
//旧コード//
nas.CCM = {};
// 
//  色変換に必要な基礎情報(初期値)パラメータセットがあれば上書き(予定)
// 	 とりあえずまるごとJavaScriptにコンバートする
//　コンバートにあたって、元構造を保存するために、入出力配列を「配列リスト」（文字列）で扱う。
//　○PSデータ等との親和性が高い。判定が容易。移植が早い。のがその理由。オーバヘッドがあるので注意
// ## 入力デバイス情報 ###################################################
//  デバイス白色点名称および色度座標
nas.CCM.iWc_Name = "D65";//
nas.CCM.iWc = [0.3127, 0.3290];//配列で
//  拡散黒色点XYZ座標(1で正規化 非負・デフォルトは{0 0 0})
nas.CCM.iBp = [0, 0, 0];//
//  RGB 三原色点色度座標 (関係無いカラースペースの場合は無視します)
//  {Rx Gx Bx Ry Gy By} (残りは計算して補完)
nas.CCM.iRGB_Name = "sRGB";//
nas.CCM.iRGB = [0.64, 0.3, 0.15, 0.33, 0.6, 0.06];//
//  入力デバイスγ値 (関係無いカラースペースの場合は無視します)
nas.CCM.iGAMMA = 2.2;

// ## 出力デバイス情報 ###################################################
//  デバイス白色点名称および色度座標
nas.CCM.oWc_Name = "D65";
nas.CCM.oWc = [0.3127, 0.3290];
//  拡散黒色点XYZ座標(1で正規化 非負・デフォルトは{0 0 0})
nas.CCM.oBp = [0, 0, 0];
//  RGB 三原色点色度座標 (関係無いカラースペースの場合は無視します)
//  {Rx Gx Bx Ry Gy By} (残りは計算して補完)
nas.CCM.oRGB_Name = "sRGB";
nas.CCM.oRGB = [0.64, 0.3, 0.15, 0.33, 0.6, 0.06];
//  入力デバイスγ値 (関係無いカラースペースの場合は無視します)
nas.CCM.oGAMMA = 2.2;

//変換関数の移植はまだ、行列関連はcommonライブラリに移動 2005/11/25

/*=======================================*/
if(typeof module != 'undefined') module.exports = nas.CCM;