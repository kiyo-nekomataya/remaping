// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop
/*
 * ps canvas resize to A4 landscape even pixels
 * 
 *	width  :UnitValue("296.672mm") 2336px/200ppi
 *	height :UnitValue("209.296mm")1648px/200ppi
 *	JPEG最適化のため8の倍数で切り揃えてある
 *	縦横いずれかのサイズがオーダーサイズ(A4)以下の画像は、A4サイズに拡張される
 *	A4サイズを越える画像は、画像の内側の８ピクセルの倍数に切りそろえられる
 */
var order ={
	width  :UnitValue("296.672mm"),
	height :UnitValue("209.296mm")
};
var target = app.activeDocument;
if((target.width.as('mm')/order.width.as('mm')) > 1.1)   order.width  = target.width;
if((target.height.as('mm')/order.height.as('mm')) > 1.1) order.height = target.height;
	var widthPx  = Math.floor(order.width.as('in')  * target.resolution);
	widthPx = Math.floor(widthPx / 8) * 8;
	var heightPx = Math.floor(order.height.as('in') * target.resolution);
	heightPx = Math.floor(heightPx / 8) * 8;
	target.resizeCanvas(
		new UnitValue(widthPx  +'px'),
		new UnitValue(heightPx +'px'),
		AnchorPosition.TOPLEFT
	);
//