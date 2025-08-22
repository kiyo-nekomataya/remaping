/*	AVLayer.expandComp()
	expandComp (by dA-tools  Feb.26 / 2009)のLayerメソッド移植

	UIはなし
*/
AVLayer.prototype.expandComp=function()
{
//AE7以降の環境のみ
	if((appHost.version>=7)&&(this.source instanceof CompItem))
	{
	var mainComp=this.containingComp;
	var preComp=this.source;
	var isPre=true;//プリコンポの位置でコピー固定
	var resp=[true,true,true];//このレスポンスも固定
//==================
function parentNull(preComp){
		baseIndex=mainComp.layer(preComp.name).index;
		pNull=mainComp.layers.addNull();
		mainComp.layer(1).name=preComp.name+"_null";
		for (var j=baseIndex ; j>(baseIndex-preComp.numLayers) ; j--){//nullにparent
			mainComp.layer(j).parent=pNull; 
			}
	}
//==================
	for (var i=1 ; i<=preComp.numLayers ; i++){//コピーだけ
		var orgLayer=preComp.layer(i);
		orgLayer.copyToComp(mainComp);
	}
	if (!isPre &&resp[2]){//parent null
		parentNull(preComp);
		}
	if (isPre) { //preCompの場合
		parentNull(preComp);//parent null
		//nullにmainCompのtranceformを渡す
		var basePosiComp=mainComp.layer(preComp.name);
		pNull.position.setValue(basePosiComp.position.value);
		pNull.scale.setValue(basePosiComp.scale.value);
		pNull.rotation.setValue(basePosiComp.rotation.value);
		if (!resp[2]){
			for (var k=baseIndex ; k>(baseIndex-preComp.numLayers) ; k--){//parent解除
				mainComp.layer(k).parent=null;
			}
			mainComp.layer(1).remove();
		}
	}
	mainComp.layer(preComp.name).enabled = false;
//==============
	}else{return}
}

