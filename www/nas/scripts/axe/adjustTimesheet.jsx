/*
	テスト版 スキャンしたタイムシート画像をpsAxeのタイムシートに合わせてリサイズして読みやすくする
	AセルのからFセルまで１秒分選択してこのスクリプトを実行
*/
var adjustTimesheet = function(tracks){
	var trackHeight = new UnitValue("320.5mm");//決め打ち
	var trackWidth  = new UnitValue("6.625mm");//
	var targetHight ;var targetWidth;var hotPoint;
	if(! tracks) tracks = 6;
	if(app.activeDocument.selection.bounds){
		targetWidth  = app.activeDocument.selection.bounds[2]-app.activeDocument.selection.bounds[0];
		targetHeight = app.activeDocument.selection.bounds[3]-app.activeDocument.selection.bounds[1];
		hotPoint = [app.activeDocument.selection.bounds[0],app.activeDocument.selection.bounds[1]];
	}
	if(targetHeight){
		trackWidth = trackWidth * tracks;
		if (targetHeight < (trackHeight/2)) targetHeight = targetHeight * 3;
		var scaleH = 100*(trackHeight/targetHeight);
		var scaleW = 100*(trackWidth /targetWidth );
		app.activeDocument.selection.deselect();
//左上で変形
		app.activeDocument.activeLayer.resize(scaleW,scaleH,AnchorPosition.TOPLEFT);
//selection.bound左上をアンカーポイント位置にして 位置[63.1mm,91.5mm]へ移動（決め打ち）
//移動幅を計算 ホットポイントにスケールをかけて 
		var left = new UnitValue("63.1mm") - hotPoint[0]*(scaleW/100);
		var top  = new UnitValue("91.5mm") - hotPoint[1]*(scaleH/100);
		app.activeDocument.activeLayer.translate(left,top);
//比較暗モード 濃度65%に決め打ち
		app.activeDocument.activeLayer.blendMode = BlendMode.DARKEN;
		app.activeDocument.activeLayer.opacity = 65;
	}
}
adjustTimesheet();