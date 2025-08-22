/*(タイトル削除)
あやかしのタイトルレイヤを掘ってレイヤを調整する
とりあえず消しておく。
*/
			if(!( app.project)){
//	プロジェクトがないのでもう何もしません。
			}else{
		if(!(app.project.activeItem instanceof CompItem)){
			alert("アクティブコンポがありません。")	
		}else{
var targetComps=app.project.items.getByName("ay00_999");
if(! targetComps.length){
	var myName=app.project.file.name.split("\.")[0];
//	myCount=myName.split("_").length;
//	myName=myName.split("_");
//	myName.pop();
//	myName=myName.join("_");
	targetComps=app.project.items.getByName(myName);
}
if(targetComps.length){
	for(var idc=targetComps.length-1;idc>=0;idc--){
		targetLayer=targetComps[idc].layers.byName("妖奇士");
//		var newText=targetComps[idc].layers.addText(new TextDocument("妖奇士"));
		targetLayer.remove();
	}
}
		}
			}
//