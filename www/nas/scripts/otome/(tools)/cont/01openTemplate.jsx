/*(テンプレート開く)
<jsx_01>
	コンテ分解スクリプト試験版
テンプレートプロジェクトを開きます。(開発およびカスタマイズ用)
上書き保存すると、テンプレートが上書きされます。
自己サイト用の保存はそれぞれのユーザの判断で行ってください。
2007.03.09
予備バージョンアップ 0.1c>0.1d
オープン時にパネルを自動で開くように設定
*/
var aeVer = app.version.split(".")[0];
if(false){
//	テンプレートファイルを読み込み(開発用)
	if(aeVer > 14){
	 myTemplateFileLocation=Folder.nas.toString()+"/scripts/otome/(tools)/cont/resources/stab_ae"+aeVer+".aep";
	}else{
	 myTemplateFileLocation=Folder.nas.toString()+"/scripts/otome/(tools)/cont/resources/stab_ae11.aep";
	}
	myTemplateFile= new File(myTemplateFileLocation);
	app.open(myTemplateFile);
}else{
//新規プロジェクトを立ち上げてテンプレートを読み込む(本番用)
//バージョンチェックしてAE8以上ならテンプレートをtemplate8.aepを使用
	if(aeVer > 14){
	 myTemplateFileLocation=decodeURI(Folder.nas)+"/scripts/otome/(tools)/cont/resources/template_ae"+aeVer+".aep";
	}else{
	 myTemplateFileLocation=decodeURI(Folder.nas)+"/scripts/otome/(tools)/cont/resources/template_11.aep";
	}
	myTemplateItem	=	new ImportOptions();
	myTemplateItem.file	=	new File(myTemplateFileLocation);
	myTemplateItem.importAs	=	ImportAsType.PROJECT;

	app.newProject();
	app.project.importFile(myTemplateItem);
	app.project.item(1).name="=絵コンテ解析=";
	app.project.item(1).comment="nas_stroryboard ver0.2d";//バージョン埋め込み
}
function doScript(myFile){

	var prevCurrentFolder=Folder.current;
	Folder.current = new Folder(myFile.path);
	var scriptFile = new File(myFile.fsName);
	scriptFile.open();
	result=eval(scriptFile.read());
	scriptFile.close();
	Folder.current = prevCurrentFolder;
	return result;
}


//対象オブジェクトがなければ何もしない
	if(!(nas["eStoryBoard"])){
//	プロジェクトが無い
	doScript(new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/cont/010storyBoard.jsx"));
}else{
//オブジェクトがあるのでクローズ/再読み込みで 初期化
	nas["eStoryBoard"].nameDialog.close();
	doScript(new File(Folder.scripts.path.toString()+"/Scripts/nas/(tools)/cont/010storyBoard.jsx"));
}
