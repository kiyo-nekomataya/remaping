/**
 *	指定座標のアクティブレイヤの色をSolidColorで返す関数
 *	指定座標にピクセルがない場合はnullを返す
 *	@params {Object Document}  doc
 *	@params {Array} pos
 *		[x,y] as px
 *	@returns {Object SolidColor | null}
 *	2021 03 17 kiyo@nekomataya.info
 */
function getColorAt(doc, pos) {
	function selectBounds(doc, b) {
      doc.selection.select([[ b[0], b[1] ],
                           [ b[2], b[1] ],
                           [ b[2], b[3] ],
                           [ b[0], b[3] ]]);
    }
    function findPV(h) {
      
      for (var i = 0; i <= 255; i++ ) {
        if (h[i]) { return i; }
      }
      return 0;
    }
	var x=pos[0];
	var y=pos[1];
	var orgLyr = doc.activeLayer;
	selectBounds(doc, [x, y, x+1, y+1]);
	var pxTip;
	try{
		doc.selection.copy();//コピー
	}catch(er){
		return null;//ピクセルがない
	};
	var topLyr = doc.artLayers.add();//最上位にレイヤーを作る
	doc.paste();//ペースト・ここで選択解除される
	selectBounds(doc, [x, y, x+1, y+1]);//再選択
	var pColor = new SolidColor();
	pColor.rgb.red   = findPV(doc.channels[0].histogram);
	pColor.rgb.green = findPV(doc.channels[1].histogram);
	pColor.rgb.blue  = findPV(doc.channels[2].histogram);
	doc.selection.deselect(); //選択解除
	topLyr.remove();//一時レイヤ削除
	doc.activeLayer = orgLyr; //アクティブレイヤ復帰
	return pColor;
};
//TEST
/*
var colorvalue =  getColorAt(activeDocument,[0,0]);
var result = (colorvalue instanceof SolidColor)? [
	colorvalue.rgb.red,
	colorvalue.rgb.green,
	colorvalue.rgb.blue
	] : "no pixel";
	alert(result);
// */