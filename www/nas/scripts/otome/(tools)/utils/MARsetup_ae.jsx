/*(MARsetup)
	マルチアジマスラスタセットアップスクリプト
マルチアジマスラスタ用に保存されたPhotoshopデータをフッテージとして使用するプリコンポにセットアップするスクリプト
設定条件は、同一画像のマルチアジマスラスタである事
コンポの縦横比が１：１である事
マスターレイヤ以外は回転オフセット角度（整数）のレイヤ名である事
*/
//マスタレイヤ抽出
var masterLayerID=0;
for(var idx=app.project.activeItem.layers.length;idx>0;idx --){
	var myLayer=app.project.activeItem.layer(idx);
    alert(myLayer.name)
	if (myLayer.name.match(/^[^0-9]/)){masterLayerID=idx;alert(idx);break;}
}
//レイヤすべてをループして属性を設定
for(var idx=0;idx<app.project.activeItem.layers.length;idx ++){
	var myLayer=app.project.activeItem.layer(idx+1);
    alert(myLayer.name)
	if (myLayer.name.match(/^[0-9]+$/)){
		myLayer.rotation.expression="thisLayer.name*(-1);";//エクスプレッションでオフセットを設定
		myLayer.opacity.setValue(45);//不透明度設定
		myLayer.parent=app.project.activeItem.layer(masterLayerID);//親レイヤ設定
	}
}
