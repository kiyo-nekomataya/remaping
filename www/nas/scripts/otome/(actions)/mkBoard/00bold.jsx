/*(ボールド作成)
リソースのバージョン確認
リソースが読み込まれていなければ、新規に読み込み
選択されたレイヤがあれば、そのレイヤにパースガイドの情報を参照するプリセットを適用して
テンプレートプロジェクトを開きます。(開発およびカスタマイズ用)
上書き保存すると、テンプレートが上書きされます。
*/

//ユーザ設定
	var boldLength=6;//フレーム数で指定



//======================================================================ここまで
	var doAction=false;
	var doRead=false;
	var isScale=false;//
//コンポのメソッドとして実行されているときはターゲットをそのコンポにする
	if((this)&&(this instanceof CompItem))
	{
		var targetComp=this;
//		var targetLayer=targetComp.selectedLayers[0];
		if(this.layers.length)
		doAction=true;
	}else{
//処理するオブジェクトがあればアクションフラグをあげる
if(
	(app.project.activeItem)
){
	var targetComp=app.project.activeItem;
	doAction=true;
}else{
	doAction=false;
	alert("no selected Item");
}
	}

if(true){
//プロジェクト内にテンプレートがあるか否か確認
	if(doAction){
/*
アイテムに"_etc"フォルダが存在して
かつテンプレートがない場合のみテンプレートを読み込む
テンプレートがすでにあればそれを利用
読み込みに失敗してテンプレートがなければ終了
*/
var myBoldFolder=app.project.items.getByName("=boldTemplate=");//まず取得してみる
//var myBldVersion="##nas_boldBuilder1.0"
	if(! myBoldFolder){
//テンプレートがないのでプロジェクトにテンプレートを読み込む
	myTemplateItem	=	new ImportOptions();
	myTemplateItem.file	=	new File("boldTemplate.aep");
	myTemplateItem.importAs	=	ImportAsType.PROJECT;
			doRead=true;
	}else{
//リソースが読み込まれていないので動作フラグセット
		doRead=false;
	}
	
	if((doRead)&&(myTemplateItem.file.exists)){
//undoセット
if(! (this instanceof CompItem)){nas.otome.beginUndoGroup("load boldTemplate")};
			myBoldFolder=app.project.importFile(myTemplateItem);
			myBoldFolder.name="=boldTemplate=";
	//		myBoldFolder.comment=myBldVersion;//バージョン埋め込み
			myBoldFolder.selected=false;//選択解除
		if(
			(app.project.items.getByName(nas.ftgFolders.ftgBase[0]))&&
			(app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]))
		){		
			myBoldFolder.parentFolder=app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]);//etcの下へ
		}
if(! (this instanceof CompItem)){nas.otome.endUndoGroup()};
	}
	}
}
//
//動作フラグがあれば、選択アイテムにコントローラを設定する
if(doAction){


//ターゲットコンポを遡って親のXpsを取得
	var myXps=targetComp.getRootXps();
//ルートXpsがなければ新規に作成
	if(! myXps)
	{
		myXps=new Xps()
		myXps.init(myXps.layers.length,nas.ms2fr(targetComp.duration*1000));
//ルートXpsがなかったのでボールド用のデータをここで作る　
		myXps.mapfile="";//カラ
		myXps.title=nas.workTitles.selectedName;//タイトルDBから取得
		myXps.subtitle="";//
		myXps.opus="";//
		myXps.scene="";//
		myXps.cut=targetComp.name;//
//		myXps.time=nas.ms2FCT(targetComp.duration*1000,2,1);//オプションは通例としては3,1かも
//この下はデフォルト値なのでわざわざ上書きしなくともよいかかか
		myXps.trin=[0,"trin"];//
		myXps.trout=[0,"trout"];//
		myXps.create_user=system.userName;//
		myXps.update_user=system.userName;//
		myXps.create_time=(new Date()).toNASString();//
		myXps.update_time=myXps.create_time;//
		myXps.framerate=nas.newFramerate();//
	};

	if(! (this instanceof CompItem)){nas.otome.beginUndoGroup("addBold")};
//テンプレートを複製して情報を書き換え
var myBldComp=myBoldFolder.items.getByName("boldBase").duplicate();

//ボールドコンポのフレームレートをチェックする。親コンポと違っていたらここで調整しておく
if(myBldComp.frameRate!=this.frameRate){myBldComp.frameRate=this.frameRate};

myBldComp.name=nas.biteClip(targetComp.name,26)+"_bold";

/*
	レイヤ名　置換テキスト
*/
var boldTexts=[
	["##TAKE","---"],
	["##MAPPING_FILE",myXps.mapfile],
	["##TITLE",myXps.title],
	["##SUB_TITLE",myXps.subtitle],
	["##OPUS",myXps.opus],
	["##SCENE",myXps.scene],
	["##CUT",myXps.cut],
	["##TIME","("+nas.Frm2FCT(myXps.duration(),3,0)+")"],
	["##TRIN",myXps.trin[1]+" ("+nas.Frm2FCT(myXps.trin[1],3,0)+")"],
	["##TROUT",myXps.trout[1]+" ("+nas.Frm2FCT(myXps.trout[1],3,0)+")"],
	["##CREATE_USER",myXps.create_user.toString(true)],
	["##UPDATE_USER",myXps.update_user.toString(true)],
	["##DATE",myXps.create_time],
	["##CREATE_TIME",myXps.create_time],
	["##UPDATE_TIME",myXps.update_time],
	["##FRAME_RATE",myXps.framerate.rate],
	["##FPS",myXps.framerate.rate+"fps"],
	["##MEMO",myXps.memo]
];
for(var idx=0;idx<boldTexts.length;idx++)
{
	var layerName	=boldTexts[idx][0];
	var altText	=boldTexts[idx][1];
//	var act	=Math.round(boldTexts[idx][2]);
//	if(act==0){continue};//スキップ
//SWAP TEXT
//alert(layerName+" : "+altText)
if(myBldComp.layer(layerName)){
	var tgLy=myBldComp.layer(layerName)
	tgLy.sourceText.setValue(altText);
	if(tgLy.name!=layerName){tgLy.name=layerName};//名前変わっていたら元に戻す
}
}
//タイムシートを取得してテキストを置換する
//ターゲットコンポの継続時間を指定長延長して、現存のレイヤをシフトする
	targetComp.setFrames(Math.round(targetComp.duration/targetComp.frameDuration)+boldLength);
	for(var lIdx=0;lIdx<targetComp.layers.length;lIdx++)
	{	targetComp.layers[lIdx+1].startTime=boldLength*targetComp.frameDuration	}

//ボールドコンポをターゲットに加えて尺を調整
	var myBldLayer=targetComp.layers.add(myBldComp);
	myBldLayer.startTime=0;
	myBldLayer.inPoint=0;
	if(myBldComp.duration>boldLength*targetComp.frameDuration)myBldLayer.outPoint=boldLength*targetComp.frameDuration;
	if((myBldComp.width!=targetComp.width)||(myBldComp.height!=targetComp.height))
	{	myBldLayer.scale.setValue([100*targetComp.width/myBldComp.width,100*targetComp.height/myBldComp.height])}
		if(! (this instanceof CompItem)){nas.otome.endUndoGroup()};

};
//////////////////////
