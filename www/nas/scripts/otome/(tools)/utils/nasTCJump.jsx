/*(タイムコードジャンプ)

 *	nas_TC-Jump:
 *	タイムコードでジャンプします。
 */
//オブジェクト識別文字列生成 
	var myFilename=("$RCSfile: nasTCJump.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.1 $").split(":")[1].split("$")[0];

var exFlag=true;
var moduleName="TCJ";//識別用のモジュール名で置き換えてください。

//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンを登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=false;//本来の初期化コマンドを無効にします。
//	nas[moduleName].show();
}else{
//このスクリプトの識別モジュール名を登録します。
	nas[moduleName]=new Object();
}
		}catch(err){
//エラー時の処理をします。
//	nas[moduleName]=new Object();
//		強制的に初期化(モジュール名登録)して。実行
	alert("エラーです。モジュール登録に失敗しました");exFlag=false;
//		または終了
		}
	}
}catch(err){
//nas 環境自体がない(ライブラリがセットアップされていない)時の処理(終了)
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}
if (app.project){
//初期化およびGUI設定

// システム設定に置いたウィンドウのオフセットが必要な場合はこれで取得します。
// ウインドウを使用しない場合は削除してください。
	myLeft=(nas.GUI.winOffset["TCJ"])?
	nas.GUI.winOffset["TCJ"][0] : 100;
	myTop=(nas.GUI.winOffset["TCJ"])?
	nas.GUI.winOffset["TCJ"][1] : 240;

//初回起動時以外はパスする部分
if(exFlag){
// ///////////// GUI 設定 /////////////
// ウインドウ/オブジェクト 初期化
	nas[moduleName]=nas.GUI.newWindow("dialog","時間設定",4,4,myLeft,myTop);

//	各種プロパティ・メソッド等を初期化
	nas[moduleName].myMsg=nas.GUI.LineFeed+" =========== "+nas.GUI.LineFeed +"-+-- ./ -- fps";
	if(app.project.activeItem){
		nas[moduleName].undoValue=(app.project.activeItem instanceof CompItem)?
		app.project.activeItem.time:0;
	}else{
	nas[moduleName].undoValue=0;
	}
	nas[moduleName].nextValue=nas[moduleName].undoValue;

//	nas.TCJ.goTimeAt=function(FCT)
//	{
//		app.project.activeItem.time=nas.FCT2ms(FCT)/1000;this.close();
//	};
//
// ウィンドウにコントロールを配置
	nas[moduleName].FCTChg	=nas.GUI.addPanel(nas[moduleName],"",0,0,4,3);
	nas[moduleName].FCTChg.FCTInput	=nas.GUI.addEditText(nas[moduleName].FCTChg,"",0,0.5,2,1);
	nas[moduleName].FCTChg.FCTInput.justify	="center";
	nas[moduleName].FCTChg.FCTLabel	=nas.GUI.addStaticText(nas[moduleName].FCTChg,"",2,0.5,2,2);
	nas[moduleName].FCTChg.FCTLabel.justify	="center";

//	nas[moduleName].

if( system.osName.match(/Windows/)){
	nas[moduleName].OK	=nas.GUI.addButton(nas[moduleName],"OK",0,3,2,1);
	nas[moduleName].Cancel	=nas.GUI.addButton(nas[moduleName],"Cancel",2,3,2,1);
}else{
	nas[moduleName].OK	=nas.GUI.addButton(nas[moduleName],"OK",2,3,2,1);
	nas[moduleName].Cancel	=nas.GUI.addButton(nas[moduleName],"Cancel",0,3,2,1);
}

// コントロールのイベント設定
//	ウィンドウ再初期化
	nas[moduleName].onShow=function()
	{
		if(app.project.activeItem instanceof CompItem){
	this.undoValue=app.project.activeItem.time;
	this.nextValue=this.undoValue;

	this.myMsg=nas.GUI.LineFeed+"  =========== "+nas.GUI.LineFeed+(nas.Frm2FCT(nas.SheetLength,3,0))+"/ "+(1/app.project.activeItem.frameDuration)+" fps";
// ウインドウ初期化
		this.text="";
		this.text="時間設定";
		this.bounds=[
	this.bounds[0],
	this.bounds[1],
	this.bounds[0]+4*nas.GUI.colUnit+nas.GUI.leftMargin+nas.GUI.rightMargin,
	this.bounds[1]+4*nas.GUI.lineUnit+nas.GUI.topMargin+nas.GUI.bottomMargin
		];
// ウィンドウにコントロールラベル再設定
		this.FCTChg.FCTInput.text="";
		this.FCTChg.FCTInput.text=nas.ms2FCT(this.undoValue*1000,Counter0[0],Counter0[1],1/app.project.activeItem.frameDuration);
		this.FCTChg.FCTInput.justify="";
		this.FCTChg.FCTInput.justify="center";
		this.FCTChg.FCTLabel.text="";
		this.FCTChg.FCTLabel.text=this.FCTChg.FCTInput.text+this.myMsg;
		this.FCTChg.FCTLabel.justify="";
		this.FCTChg.FCTLabel.justify="center";

		this.OK.text	="";
		this.OK.text	="OK";
		this.Cancel.text="";
		this.Cancel.text="Cancel";
		}else{this.close();}
	}

	nas[moduleName].FCTChg.FCTInput.onChange=function()
	{
		this.parent.parent.nextValue=nas.FCT2ms(nas.TCJ.FCTChg.FCTInput.text)/1000;
		if(isNaN(this.parent.parent.nextValue))
		{
			this.parent.parent.nextValue=this.parent.parent.undoValue;
		}
//		this.text=nas.ms2FCT(this.nextValue*1000,4,0,1/app.project.activeItem.frameDuration);
		nas.TCJ.FCTChg.FCTLabel.text=nas.ms2FCT(this.parent.parent.nextValue*1000,Counter0[0],Counter0[1],1/app.project.activeItem.frameDuration)+this.parent.parent.myMsg;
//		app.project.activeItem.time=this.nextValue;
	};

//	nas[moduleName].FCTLabel.onChange=function()
//	{
//		if(this.text.match())
//	}
	nas[moduleName].OK.onClick=function()
	{
	//	alert(nas.TCJ.FCTChg.FCTInput.nextValue);
		app.project.activeItem.time=nas.TCJ.nextValue;
		this.parent.hide();

//		if(this.nextValue<0 || this.nextValue>app.project.activeItem.duration)
//		{
//			this.nextValue=(this.nextValue<0)? 0 : app.project.activeItem.duration;
//		}
	};
	nas[moduleName].Cancel.onClick=function()
	{
		app.project.activeItem.time=nas.TCJ.undoValue;
		this.parent.hide();
	};

//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas.TCJ.onMove=function(){
nas.GUI.winOffset["TCJ"] =[nas.TCJ.bounds[0],nas.TCJ.bounds[1]];
	}
};
// ///////////// GUI 設定 終り ウィンドウ表示 /////////////
if(app.project.activeItem instanceof CompItem){	nas["TCJ"].show();};


	/*---- この下には初期化の必要ないコマンドを書くことが出来ます。----*/
//スクリプト終了
}
