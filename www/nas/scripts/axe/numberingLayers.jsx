/*
	選択レイヤのトレーラー内をナンバリングする;
	1桁番号に調整 2022 0326
	ハイフン付きに修正 2020
	プレフィックスはレイヤーフォルダの名前を使用
	A-0001...
*/
var myLayers=app.activeDocument.activeLayer;
if(myLayers.typename =="ArtLayer"){myLayers=myLayers.parent};
var currentNumber=1;
for(var ix=myLayers.layers.length-1;ix>=0;ix--){
//	myLayers.layers[ix].name=myLayers.name+("-00000").slice(0,5-currentNumber.toString().length)+currentNumber.toString();
	myLayers.layers[ix].name=[
		myLayers.name,
		currentNumber.toString()
	].join('-');
	currentNumber++;
}
