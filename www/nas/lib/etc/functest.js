/**
 * @fileoverview functionTEST
 */

/**
 * @type {number}
 */
var tID = 1;

switch (tID) {
    case 1:
        var result = nas.dt2sc(0);
        break;
//	z軸距離(ピクセル)からスケールを求める

    case 2:
        var result = nas.sc2dt(1);
        break;
//	スケールからz軸距離を求める。

    case 3:
        var result = nas.fl2fr(20);
        break;
//	撮影フレームからレタス撮影フレームを求める。

    case 4:
        var result = nas.fr2fl(50);
        break;
//	レタスフレームから撮影フレームを求める。

    case 5:
        var result = nas.fl2sc(20);
        break;
//	撮影フレームからスケールを求める。
    case 6:
        var result = nas.fr2sc(50);
        break;
//	レタス撮影フレームからスケールを求める。
    case 7:
        var result = nas.sc2fl(2);
        break;
//	スケールから撮影フレームを求める。
    case 8:
        var result = nas.sc2fr(2);
        break;
//	スケールからレタス撮影フレームを求める。
    case 9:
        var result = nas.kac(50, 100, 0.5);
        break;
//	開始寸法・終了寸法と助変数を与えて、対応する寸法を求める。
    case 10:
        var result = nas.cak(50, 100, 75);
        break;
//	開始寸法・終了寸法と任意寸法を与えて、寸法に対応する助変数を求める。

    case 11:
        var result = nas.Zf(12, 3);
        break;
//	数値を指定桁数のゼロで埋める。

    case 12:
        var result = nas.ms2fr(1000);
        break;
//	ミリ秒数から、フレーム数を求める。
    case 13:
        var result = nas.fr2ms(24);
        break;
//	フレーム数から、ミリ秒数を求める。
    case 14:
        var result = nas.ms2FCT(1000, 3, 0, 30);
        break;
//	ミリ秒数から、カウンタ文字列への変換。
//	カウンタータイプ・オリジネーション・フレームレートを指定
    case 15:
        var result = nas.FCT2ms("1+12");
        break;
//	カウンタ文字列から、ミリ秒数への変換。
    case 16:
        var result = nas.Frm2FCT(36, 3, 0, 24);
        break;
//	フレーム数(0オリジン)から、カウンタ文字列への変換
//	カウンタータイプ・オリジネーション・フレームレートを指定
    case 17:
        var result = nas.FCT2Frm("1+12");
        break;
//	カウンタ文字列から、フレーム数(0オリジン)への変換


//==== 色彩関連(web用)
    case 18:
        var result = nas.colorStr2Ary("#AABBCC");
        break;
//	WEB色指定用の文字列を3次元の配列にして返す
    case 19:
        var result = nas.colorAry2Str([127, 127, 127]);
        break;
//	配列で与えられたRGB値を16進文字列で返す。

//==== 行列計算
//行列演算関数の行列は配列の組み合わせでなく、要素のストリーム文字列である。

    case 20:
        var result = nas.showMatrix("TEST", "1,2,3,4,5,6,7,8,9", 3, 3);
        break;
//	与えられた行列文字列に改行を加えて文字列で返す。
    case 21:
        var result = nas.mDeterminant("1,0,0,0,1,0,0,0,1");
        break;
//	行列式(和)を返す。
    case 22:
        var result = nas.multiMatrix("1,2,3,4,5,6,7,8,9", "1,0,0,0,1,0,0,0,1");
        break;
//	行列積を求める。
    case 23:
        var result = nas.mInverse("1,2,3,4,5,6,7,8,9");
        break;
//	逆行列を求める。
    case 24:
        var result = nas.transMatrix("1,2,3,4,5,6,7,8,9");
        break;
//	行列を転置する。
    default:
        var result = "NO TEST";
}
result;
