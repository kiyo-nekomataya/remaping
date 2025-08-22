/*(レイヤー位置合わせ)
LayerAdjust2Peg.jsx

現在のレイヤー選択範囲の中央とペグレイヤーの中央部をマッチさせる
レイヤー位置合わせ操作

*/

var targetBounds = app.activeDocument.selection.bounds;//スクリプト実行時の選択範囲を記録
var targetLayer  = app.activeDocument.activeLayer;//アクティブレイヤをターゲットにする
/**
	@params {String|RegExp}	regex
	@params {Layers}	collection
	レイヤを正規表現で名前検索する関数
	検索時に最初にヒットしたアートレイヤを返す
	レイヤーセットは検索対象外
	コレクション未指定のときはドキュメント全体を検索
*/
	function LayerFindByName(regex,collection){
		if(! (regex instanceof RegExp)){
			if(typeof regex == 'string'){
				regex = new RegExp(regex);
			}else{
				regex = new RegExp(/peg|ペグ|tap|タップ/i);
			};
		};
		if(!(collection)) collection = app.activeDocument.layers;
		var result = null;
		for(var ix = 0;ix < collection.length; ix ++){
			if(
				(collection[ix] instanceof ArtLayer)&&
				(String(collection[ix].name).match(regex))
			){
				result = collection[ix];
			}else if(
				(collection[ix].layers)&&
				(collection[ix].layers.length)
			){
				result = LayerFindByName(regex,collection[ix].layers);
			};
			if(result) return result;
		};
		return result;
	};
/*TEST
	LayerFindByName()
	LayerFindByName('s-c')
	LayerFindByName(/frame/i)
*/
var pegLayer = LayerFindByName();
//ターゲットレイヤが発見されない場合は動作を中断
if((targetBounds)&&(!(targetLayer.isbackgroundlayer))&&(pegLayer)){
	var pegBounds = pegLayer.bounds;
	app.activeDocument.selection.deselect();//解除
	targetLayer.translate(
		((pegBounds[0]+pegBounds[2]) / 2)-((targetBounds[0]+targetBounds[2]) / 2),
		((pegBounds[1]+pegBounds[3]) / 2)-((targetBounds[1]+targetBounds[3]) / 2)
	);
//	activeDocument.selection.select(targetBounds);//復帰
};
/*
	依存Libraryなし　単独実行可能　Adobe Photoshop専用
*/