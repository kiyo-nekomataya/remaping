//手描き画像登録に必要なプロパティ
'use strict';
if((typeof window == 'undefined')&&(typeof app == 'undefined')) var nas = {};

/**
 *  @params {String} parent  アタッチするXps要素　セル、フレーム、トラック　または　メモ
 *  @params {Array}   size    イメージサイズ配列 [幅,高さ]　
 *         値が数値の場合は、ターゲット要素に対する比率
 *         値が文字列の場合は、その寸法　UnitValueで換算するが、この場合のみpxも受け付ける
 *         タイムシートのピクセル密度は、css pixel 96dpiとする (css準拠)
 *     image   Object HTMLImage
 */

nas.NoteImage=function(){
    this.parent ;
    this.image  ;//Object HTMLImage
    this.size   ;
    this.url    ;
/*
    this.style = {
	    color      : Number backgroundColorID,
	    imageData  : "String BASE64 encoded PNG Image",
	    offsetX    : Number image Offset X,
	    offsetY    : Number image Offset Y
    }
*/
}

/*
	color      : Number backgroundColorID,
	imageData  : "String BASE64 encoded PNG Image",
	offsetX    : Number image Offset X,
	offsetY    : Number image Offset Y


ノート画像オブジェクトは
ノート画像コレクションのメンバーとなる
ノート画像コレクションは一組のタイムシートにつき一組だけもたせる？
トラックごとに持たせないと編集が面倒

トラックの付帯物
またはメモオブジェクトの付帯物
 */