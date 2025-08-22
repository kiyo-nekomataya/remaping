/*(簡易コンソール)
<console>
 *	JSXコマンドコンソール:nas.Console
 *		Nekomataya/kiyo	2005.11.07
 *		改行コード調整追加	11.08
 *		ファイル読み込み追加	11.09
 *		nasGUIライブラリ対応	11.21
 *		window位置保存対応	01.15
 *	$Id: nasConsole.jsx,v 1.1.2.1 2006/09/03 20:15:25 kiyo Exp $
 */
//オブジェクト識別文字列生成 
var myFilename=("$RCSfile: nasConsole.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.1 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="Console";//モジュール名で置き換えてください。
//二重初期化防止トラップ 12/22
try{
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
if(nas[moduleName]){nas[moduleName].show();exFlag=false;}
		}catch(err){
nas[moduleName]=new Object();}
	}
}catch(err){
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}
if(exFlag){
	var myLeft=(nas.GUI.winOffset["Console"])?
		nas.GUI.winOffset["Console"][0]:nas.GUI.dafaultOffset[0];
	var myTop=(nas.GUI.winOffset["Console"])?
		nas.GUI.winOffset["Console"][1]:nas.GUI.dafaultOffset[1];


nas.Console= nas.GUI.newWindow("palette","nasコンソール nas(u) tools (Nekomataya/2005)",8,18,myLeft,myTop);


nas.Console.getScript=function()
{
if(system.osName.match(/Windows/)){
	var myFile = File.openDialog("読み込むスクリプトを選んでください","JSX-Script(*.jsx;*.js):*.JSX;*.JS");
}else{
	var myFile = File.openDialog("読み込むスクリプトを選んでください");
};
if (myFile && myFile.name.match(/^[a-z_\-\#0-9]+\.jsx?$/i)){
	var myOpenfile = new File(myFile.fsName);
	myOpenfile.open("r");
	myContent = myOpenfile.read();
	myOpenfile.close();
	return myContent.replace(/(\r\n?|\n)/g,nas.GUI.LineFeed);
}else {return false;};
}
nas.Console.saveText=function()
{
if (! nas.Console.commandBox.text){alert("保存するデータがありません");return false;}
if(isWindows)
{
	var mySavefile = File.saveDialog("書き出しのファイル名を指定してください","nasXPSheet(*.js *.jsx *.txt):*.JS;*.JSX;*.TXT");
}else{
	var mySavefile = File.saveDialog("書き出しのファイル名を指定してください","");
}
if(! mySavefile){return};
if(mySavefile.exists)
{
if(! confirm("同名のファイルがすでにあります.\n上書きしてよろしいですか?")){return false;};
}

if (mySavefile && mySavefile.name.match(/^[a-z_\-\#0-9]+\.(jsx?|txt)$/i)){
var myOpenfile = new File(mySavefile.fsName);
	myOpenfile.open("w");
	myOpenfile.write(nas.Console.commandBox.text);
	myOpenfile.close();
}else {
	alert("拡張子は js/jsx/txt を指定してください。")
	return false;
};
}
/*
	GUIセットアップ
 */

nas.Console.resultBox=nas.GUI.addEditText(nas.Console,"...init",0,1,8,7);
	nas.Console.resultBox.multiline=true;
//	nas.Console.resultBox.addBuf=nas.GUI.addBuf_;
	nas.Console.resultBox.text="このパネルは簡易コンソールです。"+nas.GUI.LineFeed;
nas.Console.resultBox.text+="----------------------------------------"+nas.GUI.LineFeed;
nas.Console.resultBox.text+="下側のボックスにスクリプトコマンドを入力して実行ボタンをクリックすると、"+nas.GUI.LineFeed;
nas.Console.resultBox.text+="このボックスにリザルトまたはエラーメッセージが戻ります。"+nas.GUI.LineFeed;
nas.Console.resultBox.text+=""+nas.GUI.LineFeed;
nas.Console.resultBox.text+="スクリプトファイルを読み込んだり、保存することもできます。"+nas.GUI.LineFeed;
nas.Console.resultBox.text+="スクリプトのデバッグ等にご使用ください"+nas.GUI.LineFeed;
nas.Console.resultBox.text+=""+nas.GUI.LineFeed;
nas.Console.resultBox.text+="----------------------------------------"+nas.GUI.LineFeed;


nas.Console.commandBox=nas.GUI.addEditText(nas.Console,"...init",0,10,8,8);
	nas.Console.commandBox.multiline=true;
	nas.Console.commandBox.addBuf=nas.GUI.addBuf_;

nas.Console.commandBox.text="/*  こちらのボックスに スクリプトコマンドを入力してください。*/"+nas.GUI.LineFeed;

nas.Console.actButton=nas.GUI.addButton(nas.Console,"コマンド実行",0,8,8,1);

nas.Console.cluButton=nas.GUI.addButton(nas.Console,"上消去",0,9,2,1);
nas.Console.clbButton=nas.GUI.addButton(nas.Console,"下消去",2,9,2,1);
nas.Console.loadButton=nas.GUI.addButton(nas.Console,"読み込み",4,9,2,1);
nas.Console.saveButton=nas.GUI.addButton(nas.Console,"保存",6,9,2,1);


//		nas.Console.actButton.onClick = function (){this.parent.resultBox.text += eval(nas.Console.commandBox.text)+nas.GUI.LineFeed;};
		nas.Console.actButton.onClick = function (){try{this.parent.resultBox.text += eval(this.parent.commandBox.text)+nas.GUI.LineFeed;}catch(err){this.parent.resultBox.text +=err.toString()+nas.GUI.LineFeed;}};

		nas.Console.cluButton.onClick = function (){this.parent.resultBox.text ="";};
		nas.Console.clbButton.onClick = function (){this.parent.commandBox.text ="";};
		nas.Console.loadButton.onClick = function (){var newContents=nas.Console.getScript();if(newContents){this.parent.commandBox.text=newContents;}};
		nas.Console.saveButton.onClick = function (){nas.Console.saveText();};

	nas.Console.onMove=function(){
nas.GUI.winOffset["Console"] =
[ nas["Console"].bounds[0],nas["Console"].bounds[1]];
	}

		nas.Console.show();

//		nas.Console.resultBox.addBuf(20);
		nas.Console.commandBox.addBuf(10);

		nas.Console.commandBox.text="/*\tこのボックスにコードを書き込んでください\t*/"+nas.GUI.LineFeed;
//理由はわからないが初期状態だと256bでペーストが打ち止めになるのでスクリプト側からedittextの拡張をかけてやる。
//
}