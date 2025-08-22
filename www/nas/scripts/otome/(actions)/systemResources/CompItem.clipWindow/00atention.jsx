/*(カメラコンポ定型処理)
	プリリセットは単純に該当フォルダに置く
*/
//クリッピングエクスプレッション適用
	if(appHost.version<7){
		alert("カメラエクスプレッションの適用は手動でお願いするです。"+nas.GUI.LineFeed+"そろそろAE6 . 5以前のバージョンのサポートはオワリますのでよろよろしく")
	}else{nas.otome.writeConsole("カメラレイヤにアニメーションテンプレート適用します。")}
//	alert([compName,compWidth,compHeight,myMargin].join(" / "));//この辺でカメラコンポに対する操作を拡張予定
//	どうしてもAE65で使う必要がある場合は以下のようなスクリプトを書けばなんとかならないこともない…かも　まがんばってちょ
/*
//サンプルの超単純エクスプレッションと等価
	this.layer(1).position.expression="thisLayer.source.layer(1).anchorPoint";
	this.layer(1).anchorPoint.expression="thisLayer.source.layer(1).position";
	this.layer(1).scale.expression="[10000/thisLayer.source.layer(1).scale[0],10000/thisLayer.source.layer(1).scale[1]]";
	this.layer(1).rotation.expression="-thisLayer.source.layer(1).rotation";
*/
