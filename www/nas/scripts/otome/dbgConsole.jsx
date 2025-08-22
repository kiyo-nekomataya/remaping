/*(乙女コンソール)
//	Nekomataya/kiyo	2005.11.07
//	改行コード調整追加	11.08
//	ファイル読み込み追加	11.09
//	mac上での表示の改善・簡易GUIライブラリ試験　11.17
//	調整　11.23  これでおわりかな
//	保存対応することにした。一応
//	ついでにPhotoshop対応 inDesignとか他のCS組はもってないのでワカリマセン。12/21
//	乙女用デバッグコンソールとして整備することにしました。2009/11/08

	このコンソールは、下段のテキストボックスの内容ををeval()で実行して、
	上段のテキストボックスに戻値を表示する簡易コンソールです。
	nasオブジェクトの配下でコンソールメッセージを受信するので、nas環境のみで動作可能です。
	コードの試験やビルドのデバッグ時にご利用ください。

	下段コマンドの読み込みと 上下段別々の保存が可能です。
	AE CS3以降のパネル起動に対応しておりますので、パネル使用をおすすめします。
 */
try{if(app.isProfessionalVersion)
	{
		app.name="Adobe AfterEffects";
		var isWindows=(system.osName.match(/Windows/))?true:false;
		var doAction=true;
	}else{
		var isWindows=false;
		var doAction=false;
	};
	if(isWindows){var LineFeed="\x0d\x0a"}else{var LineFeed="\x0d"};
}catch(ERR){
	isWindows =true;
}
//二重起動防止トラップ
if(nas.otome.dbgConsole){
	if(confirm("すでに起動されています。\nコンソール出力を受信するので二重起動は禁止されています\nリセットしますか"))
	{
		if(nas.otome.dbgConsole.isDoc)
		{
			nas.otome.dbgConsole.resultBox.visible=false;
			nas.otome.dbgConsole.commandBox.visible=false;
			nas.otome.dbgConsole.actButton.visible =false;
			nas.otome.dbgConsole.cluButton.visible =false;
			nas.otome.dbgConsole.clbButton.visible =false;
			nas.otome.dbgConsole.loadButton.visible =false;
			nas.otome.dbgConsole.saveButton.visible =false;
			nas.otome.dbgConsole.writeButton.visible =false;
			alert("パネルを閉じて再起動してください")
			doAction=false;
		}else{
			nas.otome.dbgConsole.close();
			doAction=true
		}
		delete nas.otome.dbgConsole;
	}else{
		doAction=false;
	}
}

if(doAction){
/*
	edittextに初期状態で256バイトでペーストや手入力が打ち止めになる現象がある。
	スクリプトでのデータ追加を行うと動的にメモリが確保されているようなので、
	これは、edittextに無理やり空白を追加してフラッシュするメソッド。
	このバグが解消したら不要。	引数はループ回数。1回アタリ1kb

	AE7.0 256バイトではなくなったが同バグ依然有り。さらに削除操作後にキー入力不全追加
	ただし、コンソール機能はオリジナルのスクリプトエディタがあるので、このツール自体は
	お役御免状態なのでアップデートはしない

	AE8(CS3) あいかわらずバグだらけ。
	手がるなのでこのコンソールもあいかわらず現役
	今度は、キーボードから改行が入力できない模様?うーん
	
	改行の入力は以下のキー入力で
		[ctlr]+[Enter]	/Win
		[ctlr]+[M]	/Mac
*/
function getScript()
{
if(isWindows){
	var scriptfile = File.openDialog("読み込むスクリプトを選んでください","JSX-Script(*.jsx *.js):*.JSX;*.JS");
}else{
	var scriptfile = File.openDialog("読み込むスクリプトを選んでください");
}
if (scriptfile && scriptfile.name.match(/^[a-z_\-\#0-9]+\.jsx?$/i)){
	var myOpenfile = new File(scriptfile.fsName);
	myOpenfile.open("r");
	myContent = myOpenfile.read();
	return myContent.replace(/(\r\n?|\n)/g,LineFeed);
}else {return false;};
}
function addBuf_(KB)
{
	var xStr="";
	for(m=0;m<KB;m++){for(n=0;n<1024;n++) xStr+=" "};
	this.text +=xStr;
	this.text ="";
	return this.text;
};


function saveText(myText)
{
if (! myText.length){alert("保存するデータがありません");return false;}
if(isWindows)
{
	var mySavefile = File.saveDialog("書き出しのファイル名を指定してください","File (*.js *.jsx *.txt):*.JS;*.JSX;*.TXT");
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
	myOpenfile.write(myText);
	myOpenfile.close();
}else {
	alert("拡張子は js/jsx/txt を指定してください。")
	return false;
};
}
// GUI Setup
	var myWinsize=[512,480];	var myWinOffset=[239,40];
	
	//すごく簡易GUIライブラリ
	var leftMargin=12;
	var rightMargin=24;
	var topMargin=2;
	var bottomMargin=24;
	var leftPadding=8;
	var rightPadding=8;
	var topPadding=2;
	var bottomPadding=2;
	var colUnit=96;
	var lineUnit=24;
	var quartsOffset=(isWindows)? 0:4;
//パネル用 nasGrid(Unit,Unit.pixel,pixel)
function nasGrid(col,line,width,height){
	left=(col*colUnit)+leftMargin+leftPadding;
	top=(line*lineUnit)+topMargin+topPadding;
	right=left+width-rightPadding;
	bottom=(height <= lineUnit)?top+height-bottomPadding-quartsOffset:top+height-bottomPadding;
		return [left,top,right,bottom];
}


if (app.name=="Adobe AfterEffects"){
if((app.version.split(".")[0]>7)&&(this instanceof Panel))
{
	nas.otome.dbgConsole= this;
	nas.otome.dbgConsole.isDoc= true;
}else{
	nas.otome.dbgConsole= new Window("palette","dbgConsole",[myWinOffset[0],myWinOffset[1],myWinsize[0]+myWinOffset[0],myWinsize[1]+myWinOffset[1]]);
	nas.otome.dbgConsole.isDoc= false;
}
//var nas.otome.dbgConsole= new Window("window","nas-Console",[myWinOffset[0],myWinOffset[1],myWinsize[0]+myWinOffset[0],myWinsize[1]+myWinOffset[1]]);
// new Window("window","nas-Console",[myWinOffset[0],myWinOffset[1],myWinsize[0]+myWinOffset[0],myWinsize[1]+myWinOffset[1]]);
}else{
nas.otome.dbgConsole= new Window("dialog","dbgConsole",[myWinOffset[0],myWinOffset[1],myWinsize[0]+myWinOffset[0],myWinsize[1]+myWinOffset[1]]);
}

/*	ウィンドウにGUIパーツを配置	*/
nas.otome.dbgConsole.titleLabel=nas.otome.dbgConsole.add("statictext",nasGrid(0,0,480,24),"乙女コンソール nas(u) tools (Nekomataya/2009)",{multiline:false});nas.otome.dbgConsole.titleLabel.justify="right";

nas.otome.dbgConsole.resultBox=nas.otome.dbgConsole.add("edittext",nasGrid(0,1,480,192),"",{multiline:true});
	if(app.name=="Adobe AfterEffects"){nas.otome.dbgConsole.resultBox.addBuf=addBuf_;}

nas.otome.dbgConsole.commandBox=nas.otome.dbgConsole.add("edittext",nasGrid(0,10,480,192),"",{multiline:true});
	if(app.name=="Adobe AfterEffects"){nas.otome.dbgConsole.commandBox.addBuf=addBuf_;}

nas.otome.dbgConsole.cluButton=nas.otome.dbgConsole.add("button",nasGrid(0,9,96,24),"clearResult");
nas.otome.dbgConsole.actButton=nas.otome.dbgConsole.add("button",nasGrid(1,9,384,24),"evalCommand");
nas.otome.dbgConsole.writeButton=nas.otome.dbgConsole.add("button",nasGrid(4,9,96,24),"write");

nas.otome.dbgConsole.clbButton=nas.otome.dbgConsole.add("button",nasGrid(0,10,96,24),"clearCommand");
nas.otome.dbgConsole.loadButton=nas.otome.dbgConsole.add("button",nasGrid(3,10,96,24),"load");
nas.otome.dbgConsole.saveButton=nas.otome.dbgConsole.add("button",nasGrid(4,10,96,24),"save");

nas.otome.dbgConsole.btn00=nas.otome.dbgConsole.add("button",nasGrid(1,10,96,24),"app~");
nas.otome.dbgConsole.btn01=nas.otome.dbgConsole.add("button",nasGrid(2,10,96,24),"nas~");
//nas.otome.dbgConsole.btn02=nas.otome.dbgConsole.add("button",nasGrid(3,10,96,24),"app~");


	nas.otome.dbgConsole.actButton.onClick = function (){try{nas.otome.dbgConsole.resultBox.text += eval(nas.otome.dbgConsole.commandBox.text)+LineFeed;}catch(err){nas.otome.dbgConsole.resultBox.text +=err.toString()+LineFeed;}};
	nas.otome.dbgConsole.cluButton.onClick = function (){nas.otome.dbgConsole.resultBox.text ="";};
	nas.otome.dbgConsole.clbButton.onClick = function (){nas.otome.dbgConsole.commandBox.text ="";};
	nas.otome.dbgConsole.loadButton.onClick = function (){newContents=getScript();if(newContents){nas.otome.dbgConsole.commandBox.text=newContents;}};
	nas.otome.dbgConsole.saveButton.onClick = function (){saveText(this.parent.commandBox.text);};
	nas.otome.dbgConsole.writeButton.onClick = function (){saveText(this.parent.resultBox.text);};

	nas.otome.dbgConsole.btn00.onClick = function (){nas.otome.dbgConsole.commandBox.text+="app.project.activeItem."};
	nas.otome.dbgConsole.btn01.onClick = function (){nas.otome.dbgConsole.commandBox.text+="nas.otome."};
//	nas.otome.dbgConsole.closeButton.onClick = function (){this.parent.close();};

/*	GUIパーツを再配置	*/
nas.otome.dbgConsole.onResize=function(){
	if((nas.otome.dbgConsole.bounds.width<320)&&(nas.otome.dbgConsole.bounds.width<320)){return false}
var myWidth=(nas.otome.dbgConsole.bounds.width>320)?(nas.otome.dbgConsole.bounds.width-leftMargin-rightMargin)/colUnit:(320-leftMargin-rightMargin)/colUnit;
var myHeight=(nas.otome.dbgConsole.bounds.height>320)?(nas.otome.dbgConsole.bounds.height-topMargin-bottomMargin)/lineUnit:(320-topMargin-bottomMargin)/lineUnit;
var resultBottom=(myHeight/2);//ユニットで
//alert(resultBottom);
nas.otome.dbgConsole.titleLabel.bounds=nasGrid(0,0,myHeight*lineUnit,24);
nas.otome.dbgConsole.resultBox.bounds=nasGrid(0,1,myWidth*colUnit,resultBottom*lineUnit-24);
nas.otome.dbgConsole.commandBox.bounds=nasGrid(0,resultBottom+2,myWidth*colUnit,((myHeight-3)*lineUnit/2));

nas.otome.dbgConsole.commandBox.onChange=function(){
//	writeLn("onChange!");
	if(this.backupText) {this.backupText=this.text}
	if(this.backupText!=this.text){this.text+=LineFeed;}else{return false;};
	this.backupText=this.text;
	return false;
}

nas.otome.dbgConsole.cluButton.bounds	=nasGrid((myWidth/5)*0,resultBottom,myWidth*colUnit/5,24);
nas.otome.dbgConsole.actButton.bounds	=nasGrid((myWidth/5)*1,resultBottom,3*myWidth*colUnit/5,24);
nas.otome.dbgConsole.writeButton.bounds	=nasGrid((myWidth/5)*4,resultBottom,myWidth*colUnit/5,24);

nas.otome.dbgConsole.clbButton.bounds	=nasGrid((myWidth/5)*0,resultBottom+1,myWidth*colUnit/5,24);
nas.otome.dbgConsole.loadButton.bounds	=nasGrid((myWidth/5)*3,resultBottom+1,myWidth*colUnit/5,24);
nas.otome.dbgConsole.saveButton.bounds	=nasGrid((myWidth/5)*4,resultBottom+1,myWidth*colUnit/5,24);

nas.otome.dbgConsole.btn00.bounds	=nasGrid((myWidth/5)*1,resultBottom+1,myWidth*colUnit/5,24);
nas.otome.dbgConsole.btn01.bounds	=nasGrid((myWidth/5)*2,resultBottom+1,myWidth*colUnit/5,24);
//nas.otome.dbgConsole.btn02.bounds	=nasGrid((myWidth/5)*3,10,myWidth*colUnit/5,24);

}


nas.otome.dbgConsole.onClose=function(){
	delete nas.otome.dbgConsole;
}
if(nas.otome.dbgConsole.isDoc){
	nas.otome.dbgConsole.onResize();
}else{
	nas.otome.dbgConsole.show();
}
if(app.name=="Adobe AfterEffects")
{		nas.otome.dbgConsole.resultBox.addBuf(20);
		nas.otome.dbgConsole.commandBox.addBuf(10);
}
		nas.otome.dbgConsole.commandBox.text="/*\tこのボックスにコードを書き込んでください\t"+LineFeed+"\t改行の入力は以下のキー入力で"+LineFeed+"\t[ctlr]+[Enter]\t/Win\t;\t[ctlr]+[M]\t/Mac"+LineFeed+" */"+LineFeed;
//理由はわからないが初期状態だと256bでペーストが打ち止めになるのでスクリプト側からedittextの拡張をかけてやる。
}