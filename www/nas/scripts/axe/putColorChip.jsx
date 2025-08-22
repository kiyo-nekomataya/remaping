/*
カラーオーダーボックス
色指定用の枠を作るUIつきスクリプト
テキストで名前と入れると前景色でカラーチップを描いて上下にダミーチップをつける。
スーパー暫定版	2008/02/03

*/
	var exFlag=true;
//そもそもドキュメントがなければ終了
	if(app.documents.length==0){exFlag=false;}
if(exFlag){

// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop
//Photoshop用ライブラリ読み込み
if(typeof app.nas == "undefined"){
	var myLibLoader=new File(Folder.userData.fullName+"/nas/lib/Photoshop_Startup.jsx");
	if(!(myLibLoader.exists))
	myLibLoader=new File(new File($.fileName).parent.parent.parent.fullName + "/lib/Photoshop_Startup.jsx");
	if(myLibLoader.exists) $.evalFile(myLibLoader);
}else{
	nas = app.nas;
};
	if (typeof app.nas != "undefined"){
//+++++++++++++++++++++++++++++++++ここまで共用

//仮値なのですべてポイント指定
/*
	selection.select()はpoint指定のみなのでその前で換算が必要
	デフォルトを埋め込んで、UIでサイズのみ変更が吉
	2 x 1.5 cm(w/h) 位か?
	横並びに変更20201230
	サイズは height 1/2in(36pt) box一つの幅は  5/8in(45pt)
	
	Document.selection.select()メソッドはマニュアルにポイント指定だと書いてあるけど、
	実際はpxなので注意(CS2)
*/
var targetLayer	 =(app.activeDocument.activeLayer)?app.activeDocument.activeLayer.parent.layers[0]:app.activeDocument.layers[0];

var myDPM        = app.activeDocument.resolution/25.4;
var boxNum       = 3    ;// ボックス数3(ノーマル/1号/2号)
var hiBox        = true ;// ハイライトボックスフラグ
var boxWidth     = new UnitValue("7mm")    ;// 45pt = 5/8 in
var boxHeight    = new UnitValue("5mm")   ;// 36pt = 1/2 in
var boundsColor  = false ;// 背景カラー使用フラグ
var colorReverse = true ;// 仮色の反転フラグ

//初期位置はセレクションがあれば範囲中央 無い場合は、アクティブドキュメントの中央
//選択範囲の存在を確認する バウンズ取得を試みて失敗すれば範囲なし
function checkSelection(){
var flg = true;try {flg = (activeDocument.selection.bounds)? true:false;}catch(e){flg = false;};return flg;}
if (checkSelection()){
	var myPoint=[
		(app.activeDocument.selection.bounds[0].as("px") + app.activeDocument.selection.bounds[2].as("px"))/2,
		(app.activeDocument.selection.bounds[1].as("px") + app.activeDocument.selection.bounds[3].as("px"))/2
	];//選択範囲中央
	app.activeDocument.selection.deselect();//選択解除
}else{
	var myPoint=nas.div(
		[app.activeDocument.width.as("px"),app.activeDocument.height.as("px")],2
	);//画面中央
}
/*
 *  選択範囲があれば、その中央・なければ画面中央
 */
if(app.activeDocument.selection)
var centerColor=new Array();
centerColor[0]=app.foregroundColor.rgb.red;
centerColor[1]=app.foregroundColor.rgb.green;
centerColor[2]=app.foregroundColor.rgb.blue;

function drawColorBox(boxName,myPoint,boxWidth,boxHeight,hiBox,boxNum){
/*
	ドキュメントのバウンディングボックスを超えると数値の反転が発生しているっぽい
	UI操作ではおきないタイプの操作ではかなり信頼度(対応)が甘いカンジ
実操作の前に概略計算をおこなう
指定位置は描画範囲の中心にする
はみ出しにより安全な対応にする為には、別ドキュメントで書いてペーストした方が良さそう
2008/02/03
*/
	var fontSize=boxHeight*(0.6);
	var myMargin    = new UnitValue('3mm') ;
	var myHeight    = boxHeight + myMargin.as('px') + fontSize;
	if(hiBox) boxNum ++;
	var myWidth     = boxWidth * boxNum;
/*
ラインカラー設定条件
純色であること
マスターカラーをしきい値で判別して明暗を切り替え？
一つのドキュメント内で統一できたほうが良い？

バックカラー（作業色）設定条件
自動の場合はマスターカラーを純色化して明度を50~80に再マッピング

前景色と後景色の平均を取る＞代表色
反対色を作って純色化する
？
*/
var myLineColor = new SolidColor();
	myLineColor.rgb.red     =
	Math.floor((centerColor[0] + app.backgroundColor.rgb.red)/2);
	myLineColor.rgb.green   =
	Math.floor((centerColor[1] + app.backgroundColor.rgb.green)/2);
	myLineColor.rgb.blue    =
	Math.floor((centerColor[2] + app.backgroundColor.rgb.blue)/2);

	myLineColor.hsb.hue = (myLineColor.hsb.hue + 90) % 360;
	myLineColor.hsb.saturation = 100;
	myLineColor.hsb.brightness = 50;
/*
	app.backgroundColor.hsb.hue = (app.backgroundColor.hsb.hue + 180) % 360;
	app.backgroundColor.hsb.saturation = 100;
	app.backgroundColor.hsb.brightness = 100;
// */
//	文字を記入(テキストレイヤが良い・フォントは現在のフォントサイズのみ調整)
//	チップレイヤとリンクさせる事
	var myTextLayer=app.activeDocument.artLayers.add();
		myTextLayer.kind=LayerKind.TEXT;
		myTextLayer.textItem.contents="◆"+boxName;//テキスト挿入
		myTextLayer.textItem.font="Heisei Kaku Gothic Std W5";//フォント設定
	var myFontSize=Math.floor(72*(boxHeight/2)/app.activeDocument.resolution);
		myTextLayer.textItem.size=myFontSize;//フォントサイズ設定ポイント
	//バグが発生した場合指定ポイント数と異なるデータが返るのでそれを判定
if (Math.round(myTextLayer.textItem.size.as("point"))!=myFontSize){
	nas.PSCCFontSizeFix.setFontSizePoints( myTextLayer, myFontSize);//
};
		nas.PSCCFontSizeFix.setFontSizePoints(
			myTextLayer,
			Math.floor(
				72*(boxHeight/2)/app.activeDocument.resolution
			)
		);//フォントサイズ設定ポイント
		myTextLayer.textItem.justification=Justification.LEFT;//フォント配置設定 左
//テキストカラー設定
/*
	基本は黒,背景色が黒い場合にライトグレーに調整
*/
	var textColor = new SolidColor();
		textColor.hsb.brightness = 5;//黒を設定
	if(app.backgroundColor.hsb.brightness < 40)
		textColor.hsb.brightness = 90;//白を設定
		
		myTextLayer.textItem.color=textColor;
myTextLayer.textItem.position=[new UnitValue(Math.floor(myPoint[0] -(myWidth/2)),"px"),new UnitValue(Math.floor(myPoint[1] - myMargin.as('px')),"px")];//フォント位置設定

//カラーチップ作成
//新しいレイヤを空で作成して、名前を割りつける

	var newColorChips=app.activeDocument.artLayers.add();
		newColorChips.name=boxName;//?
if(boundsColor){
//チップ範囲の背景をペイント
//			セレクトを作成
		var leftop = sub(myPoint,[
			(myWidth/2)+myMargin.as('px'),
			fontSize+myMargin.as('px')
		]);
		app.activeDocument.selection.select(
			[
				leftop,
				add(leftop,[myWidth+myMargin.as('px')*2,0]),
				add(leftop,[myWidth+myMargin.as('px')*2,myHeight+myMargin.as('px')*2]),
				add(leftop,[0,myHeight+myMargin.as('px')*2])
			],
			SelectionType.REPLACE,
			0.0,
			false
		);
		var backColor=new SolidColor();
//alert(myColor.toString());

			backColor.rgb.red	= app.backgroundColor.rgb.red;
			backColor.rgb.green	= app.backgroundColor.rgb.green;
			backColor.rgb.blue	= app.backgroundColor.rgb.blue;

		app.activeDocument.selection.fill(
			backColor,
			ColorBlendMode.NORMAL,
			100,
			false
		);
}
//ボックス描画ループ
	for (var boxCount=0;boxCount<boxNum;boxCount++){

		var myPosition=sub(
			add(myPoint,[boxWidth*boxCount,0]),
			[(boxWidth*boxNum)/2,0]
		);
		var myRegion=[
			myPosition,
			add(myPosition,[boxWidth,0]),
			add(myPosition,[boxWidth,boxHeight]),
			add(myPosition,[0,boxHeight])
		];
//			セレクトを作成
		app.activeDocument.selection.select(
			myRegion,
			SelectionType.REPLACE,
			0.0,
			false
		);
//塗色は、描画色から計算した仮色で作る。あとで置き替えが必要
		var centerNo	=Math.ceil(boxNum/2)-1;
		var colorParam	=Math.abs(centerNo-boxCount);
		if(boxCount==centerNo){
			myColor=centerColor;

		}else{
			if(boxCount<centerNo){
				myColor=add(centerColor,mul(sub([255,255,255],centerColor),colorParam/(centerNo+1)));
			}else{
				myColor=nas.div(centerColor,Math.pow(1.2,colorParam));
			}
		};
//			fill
		var fillColor=new SolidColor();

			fillColor.rgb.red	=myColor[0];
			fillColor.rgb.green	=myColor[1];
			fillColor.rgb.blue	=myColor[2];
//マスターカラー以外は色変更
if((boxCount!=centerNo)&&(colorReverse)){
			fillColor.hsb.hue = (fillColor.hsb.hue + 120) % 360;
			if(fillColor.hsb.saturation < 15){
				fillColor.hsb.saturation = 100;
			}else{
				fillColor.hsb.saturation = (fillColor.hsb.saturation + 50) / 2;
			}
}
		app.activeDocument.selection.fill(
			fillColor,
			ColorBlendMode.NORMAL,
			100,
			false
		);
//ボックスストローク
		var backupColor=app.foregroundColor;

		app.activeDocument.selection.stroke(
			myLineColor,
			0.3 * myDPM,
			StrokeLocation.CENTER,
			ColorBlendMode.NORMAL,
			100,
			false
		);

//ハイライトボックスの割線を描画
		if((boxCount==0)&&(hiBox)){
//			セレクトを作成
			app.activeDocument.selection.select(
				[
					nas.div(add(myRegion[0],myRegion[3]),2),
					nas.div(add(myRegion[1],myRegion[2]),2),
					myRegion[2],
					myRegion[3]
				],
				SelectionType.REPLACE,
				0.0,
				false
			);
			app.activeDocument.selection.stroke(
				myLineColor,
				0.3 * myDPM,
				StrokeLocation.CENTER,
				ColorBlendMode.NORMAL,
				100,
				false
			);
		}
		app.foregroundColor=backupColor;//ストロークは前景色を書き換えるので復帰
	}
//カラーチップとラベルをリンク
		myTextLayer.link(newColorChips);//リンク作成
		;//
//ラベルをカラーチップの上へ移動
		myTextLayer.move(newColorChips,ElementPlacement.PLACEBEFORE);
//	selection解除
	app.activeDocument.selection.deselect();
//	できたレイヤは選択されていたレイヤの上に移動
		myTextLayer.move(targetLayer,ElementPlacement.PLACEBEFORE);
		newColorChips.move(myTextLayer,ElementPlacement.PLACEAFTER);

};//


//drawColorBox("お試し",myPoint,boxWidth*myDPM,boxHeight*myDPM,boxNum);
/*
	GUI初期化
ボタン/2ヶ
テキスト/4ヶ

*/
//入力を数値に限定
clipNum=function(){
	if(isNaN(this.text)){this.text=this.baseValue.toString()}else{
		this.text=(this.text*1).toString();
	}
};
//入力を整数に限定
clipInt=function(){
	if(isNaN(this.text)){this.text=this.baseValue.toString()}else{
		this.text=Math.floor(this.text*1).toString();
	}
};
//	Window
var w=nas.GUI.newWindow("dialog",nas.localize({en:"make color chip",ja:"色指定チップを作る"}),3,8);
//	TEXT
 w.tx1	=nas.GUI.addEditText(w,nas.localize({en:"(Untitled)",ja:"(名称未定)"}),0,6,3,1);

 w.lb1	=nas.GUI.addStaticText  (w ,"BOX" ,0 ,1 ,1.5 ,1).justify="right";
	w.tx2	=nas.GUI.addEditText(w,boxNum,1.5,1,1,1);
	w.lb1u	=nas.GUI.addStaticText  (w ,nas.localize({en:"boxes",ja:"個"}) ,2.4 ,1 ,0.75 ,1);
	w.tx2.baseValue=boxNum;w.tx2.onChange=clipInt;

 w.lb2	=nas.GUI.addStaticText  (w ,"width" ,0 ,2 ,1.5 ,1).justify="right";
	w.tx3	=nas.GUI.addEditText(w,boxWidth.as("mm"),1.5,2,1,1);
	w.lb2u	=nas.GUI.addStaticText  (w ,"mm" ,2.4 ,2 ,0.75 ,1);
	w.tx3.baseValue=boxWidth;w.tx3.onChange=clipNum;

 w.lb3	=nas.GUI.addStaticText  (w ,"height" ,0 ,3 ,1.5 ,1).justify="right";
	w.tx4	=nas.GUI.addEditText(w,boxHeight.as("mm"),1.5,3,1,1);
	w.lb3u	=nas.GUI.addStaticText  (w ,"mm" ,2.4 ,3 ,0.75 ,1);
	w.tx4.baseValue=boxHeight;w.tx4.onChange=clipNum;

 w.cb1 =nas.GUI.addCheckBox (w,nas.localize({en:"inverted temporarily color",ja:"仮色反転"}),1,4,2,1);
	w.cb1.value=colorReverse;
	w.cb1.onClick=function(){
		colorReverse=this.value;
	}
 w.cb2 =nas.GUI.addCheckBox (w,nas.localize({en:"hi-lite box",ja:"ハイライトボックス"}),0.5,0,3,1);
	w.cb2.value=hiBox;
	w.cb2.onClick=function(){
		hiBox = this.value;
	}
 w.cb3 =nas.GUI.addCheckBox (w,nas.localize({en:"bounds-color",ja:"背景色"}),1,5,3,1);
	w.cb3.value=boundsColor;
	w.cb3.onClick=function(){
		boundsColor = this.value;
	}
 w.bt1	=nas.GUI.addButton(w,"OK",0,7,3,1);

w.bt1.onClick=function(){
//UNDO設定
var myUndo = 'putColorChip';
var myAction = "drawColorBox(this.parent.tx1.text,myPoint,this.parent.tx3.text*myDPM,this.parent.tx4.text*myDPM,hiBox,this.parent.tx2.text*1);";

	if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{eval(myAction)}
this.parent.close();
}
w.tx1.active=true;
w.show();
}
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};