/*(09-レンダーキューに登録)

アクティブアイテムをレンダーキューに登録します
この機能はアクションフォルダの実行で行なわれます。
*/


if(app.project.activeItem instanceof CompItem)
{
	//定型処理実行
	var myAction=new Folder(Folder.scripts.path.toString()+"/Scripts/nas/(actions)/addRQueue");
	if(myAction.exists){app.project.activeItem.executeAction(myAction)};
}
