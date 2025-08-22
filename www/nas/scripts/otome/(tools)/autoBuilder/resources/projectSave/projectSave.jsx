//projectStore
/*
		自動ビルドの途中でプロジェクト保存を促すスクリプト
カレントフォルダから初期ファイル名を生成するのでカレントを切り替えておくことが必要

１．読み込みを行なった時点で自動保存を行なう

カットフォルダ名からプロジェクトファイル名を自動作成して保存を促すUI
保存が行なわれた場合カレントを移動しておくこと？　指定時点で移動したほうが良いかも

２．ステージを組んだ時点で自動保存を促す
保存ファイルが存在する場合は保存を自動で行なう。ない場合は1.に順ずる手順でプロジェクト名を生成して
保存を促す

*/
var myProjectFile = new File(targetFolder.name);//ターゲットフォルダ名をそのままデフォルト値にする
if(app.project.file){
	var targetFolder=app.project.file.parentr;//保存ファイルの親フォルダをターゲットにする
	var myProjectFile = app.project.file;
}else{
	var targetFolder=Folder.current;//カレントフォルダをターゲットにする　(任意)
	var myProjectFile = new File(targetFolder.name+".aep");
}
var msg="プロジェクトを保存します"+nas.GUI.LineFeed+" fileName : "+myProjectFile.fsName+nas.GUI.LineFeed+"よろしいですか？"
var w=nas.GUI.newWindow("dialog","プロジェクトを保存します",8,4);
w.tx1=nas.GUI.addStaticText(w,msg,0,0,8,3);
w.bt1=nas.GUI.addButton(w,"別名を指定",1,3,2,1);
w.bt2=nas.GUI.addButton(w,"Skip",3,3,2,1);
w.bt3=nas.GUI.addButton(w,"OK",5,3,2,1);
//
w.bt1.onClick=function()
{
	var newFile=myProjectFile.saveDlg("保存先を選択","*.aep");
	if(newFile){myProjectFile=newFile};
	msg="プロジェクトを保存します"+nas.GUI.LineFeed+" fileName : "+myProjectFile.fsName+nas.GUI.LineFeed+"よろしいですか？"
	this.parent.tx1.text=msg;
}
w.bt2.onClick=function(){this.parent.close()}
w.bt3.onClick=function()
{
	var myResult=app.project.save(myProjectFile)
	if(! myResult){alert("ファイル保存に失敗しました");}
	this.parent.close();
}
w.show();