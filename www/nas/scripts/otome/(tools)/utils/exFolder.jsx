/*(フォルダ適用)
<bomb>
*/
var targetComp=app.project.activeItem;
if(targetComp instanceof CompItem){
	var tgtFolder=Folder.selectDialog("コンポ ["+ targetComp.name +"]に適用するフォルダを指定してケロケロ",Folder.current)
	if((tgtFolder)&&(tgtFolder.exists))
	{
		Folder.current=tgtFolder;
		var msg=targetComp.executeAction(tgtFolder);
		nas.otome.writeConsole(msg+":");
	}
}