/*(スムースレイヤ)
	
	標準的なスムーシングレイヤをつける
*/
	var myComp=app.project.activeItem;
	if (myComp instanceof CompItem){
		var myAction=new Folder(Folder.nas.path+"/nas/(actions)/smooth");
		if(myAction.exists){myComp.executeAction(myAction)}else{alert("アクションがないかも～")}
	}else{alert("コンポがないかも～")}
if(false){
	if (myComp instanceof CompItem){
		//ソースソリッドがなければ作成
		if(
			(app.project.getItemByName("CELL-Smooth").length)&&
			(app.project.getItemByName("CELL-Smooth")[0].width==myComp.width)&&
			(app.project.getItemByName("CELL-Smooth")[0].height==myComp.height)
		){
			myLayer=myComp.layers.add(app.project.getItemByName("CELL-Smooth")[0]);
			myLayer.name="Cell-Smooth";
		}else{
			myLayer=myComp.layers.addSolid([1,1,1],"CELL-Smooth",myComp.width,myComp.height,myComp.pixelAspect);
		}
		myLayer.adjustmentLayer=true;
		var smoothEffect=myLayer.property("ADBE Effect Parade").addProperty("smooth");
	}
}
