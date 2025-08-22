/*(コンポリサイズ)
		選択したレイヤのサイズにコンポをリサイズする。
		レイヤのスケールを考慮
		現在のフレームのスケールになるので注意
*/
if (app.project.activeItem.selectedLayers.length){
app.beginUndoGroup("コンポリサイズ");
	var targetComp	=app.project.activeItem;
	var targetLayer	=app.project.activeItem.selectedLayers[0];

	targetComp.width=
	Math.ceil(targetLayer.width *targetLayer.property("scale").value[0]/100);
	targetComp.height=
	Math.ceil(targetLayer.height*targetLayer.property("scale").value[1]/100);
app.endUndoGroup();
}
