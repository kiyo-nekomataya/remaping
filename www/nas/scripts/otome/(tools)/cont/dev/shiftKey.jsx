/*
	properyクラスにキー移動メソッドを増設
	ターゲットキーを時間指定で移動する

		property.moveKey(index integer,time float)

	引数は ターゲットのキーIndexと 移動先の時間指定 時間指定省略は不可
	戻り値は移動後の新しいキーのIndex

	移動先が同じ時間ならば処理全体をパス(UNDOも積まない)
	移動先にキーが存在する場合はAEの仕様上「上書き」
	同じ時間上にキー複数は(当然)認められないようです
*/
Property.prototype.moveKey=function(myIndex,myTime)
{
//プロパティタイプがPROPERTYの際のみ実行
	if(this.propertyType!=PropertyType.PROPERTY){return false}
//不正引数を判別
	if((! myIndex)||(this.numKeys<myIndex)||isNaN(myTime)){return false;}
//移動先が同じなら処理自体をパス
	if(this.keyTime(myIndex)==myTime){return myIndex};
//元キーの属性をバッファ
	var mySelected	=this.keySelected(myIndex);//選択?

if(this.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER))
{
	var myInInterpolationType	=this.keyInInterpolationType(myIndex)
	var myOutInterpolationType	=this.keyOutInterpolationType(myIndex);//補間タイプのコピー
	var myTemporalEaseIn	=this.keyInTemporalEase(myIndex);
	var myTemporalEaseOut	=this.keyOutTemporalEase(myIndex);
}
if(this.isSpatial){
	var myRoving	=this.keyRoving(myIndex);//ロービング
	var mySpatialAutoBezier	=this.keySpatialAutoBezier(myIndex);
	var mySpatialContinuous	=this.keySpatialContinuous(myIndex);
	var mySpatialInTangents	=this.keyInSpatialTangent(myIndex)
	var mySpatialOutTangents	=this.keyOutSpatialTangent(myIndex);//タンゼントのコピー
	var myTemporalAutoBezier	=this.keyTemporalAutoBezier(myIndex);
	var myTemporalContinuous	=this.keyTemporalContinuous(myIndex);
}
//ここからUndoGroup
	app.beginUndoGroup("キーフレーム移動");
//新しいキーを作成
	var oldKeyLength=this.numKeys;
	var newKeyIndex = this.addKey(myTime);
//古いキー
	var oldKeyIndex = myIndex;
	if((newKeyIndex<=myIndex)&&(this.numKeys>oldKeyLength)){ oldKeyIndex++}
//値の複写
	this.setValueAtKey(newKeyIndex,this.keyValue(oldKeyIndex));
//元キー消す
	this.removeKey(oldKeyIndex);
	if(oldKeyIndex<newKeyIndex){newKeyIndex--};//キー削除でインデックス変更
//値のコピーは、新キーを作成する前にバッファにとらないとキー作成の影響で変化するのでダメ
if(this.isSpatial){
	this.setTemporalContinuousAtKey(newKeyIndex,myTemporalContinuous);
	this.setTemporalAutoBezierAtKey(newKeyIndex,myTemporalAutoBezier);
	this.setSpatialTangentsAtKey(newKeyIndex,mySpatialInTangents,mySpatialOutTangents);//タンゼント
	this.setSpatialContinuousAtKey(newKeyIndex,mySpatialContinuous);
	this.setSpatialAutoBezierAtKey(newKeyIndex,mySpatialAutoBezier);
	this.setRovingAtKey(newKeyIndex,myRoving);//ロービング
}
if(this.isInterpolationTypeValid(KeyframeInterpolationType.BEZIER))
{
	this.setTemporalEaseAtKey(newKeyIndex,myTemporalEaseIn,myTemporalEaseOut);
	this.setInterpolationTypeAtKey(newKeyIndex,myInInterpolationType,myOutInterpolationType);//補間タイプ

}
	this.setSelectedAtKey(newKeyIndex,mySelected);//選択?
//グループ閉じる
	app.endUndoGroup();
//(移動後に変化する可能性があるので)新しいキーのIndexを返す
	return newKeyIndex;
}
/*
	上のメソッドをコールするヤドカリメソッド
	指定時間が相対時間になっている
	property.shiftKey(インデックス,ずらし時間)

 */
Property.prototype.shiftKey=function(myIndex,myShift)
{
//プロパティタイプがPROPERTYの際のみ実行(ほかにはキーがない)
	if(this.propertyType!=PropertyType.PROPERTY){return false}
//不正引数を判別
	if((! myIndex)||(this.numKeys<myIndex)||isNaN(myShift)){return false;}
//移動先が同じなら処理自体をパス
	if(! myShift){return myIndex};
	return this.moveKey(myIndex,this.keyTime(myIndex)+myShift);
}


//Test 試験コードなので捨ててチョーダイ

//app.project.activeItem.layer(1).position.moveKey(2,1);
app.project.activeItem.layer(1).position.shiftKey(2,-0.5);


