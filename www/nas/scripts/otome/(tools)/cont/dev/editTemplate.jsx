/*(テンプレート編集)
	コンテ分解スクリプト試験版
テンプレートプロジェクトを開きます。(開発およびカスタマイズ用)
上書き保存すると、テンプレートが上書きされます。
自己サイト用の保存はそれぞれのユーザの判断で行ってください。
2007.03.09
*/
if(true){
//	テンプレートファイルを読み込み(開発用)
myTemplateFileLocation=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/cont/resources/stab.aep"
myTemplateFile= new File(myTemplateFileLocation);
//app.openFast(myTemplateFile);
app.open(myTemplateFile);
//app.openTemplate(myTemplateFile);
}else{
//新規プロジェクトを立ち上げてテンプレートを読み込む(本番用)
myTemplateFileLocation=Folder.scripts.path.toString()+"/Scripts/nas/(tools)/cont/resources/template.aep"
myTemplateItem	=	new ImportOptions();
myTemplateItem.file	=	new File(myTemplateFileLocation);
myTemplateItem.importAs	=	ImportAsType.PROJECT;


app.newProject();
app.project.importFile(myTemplateItem);
app.project.item(1).name="=絵コンテ解析=";
app.project.item(1).comment="nas_stroryboard ver0.1c";//バージョン埋め込み
}
