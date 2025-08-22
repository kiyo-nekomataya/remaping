/*(ボールドライン描画)

*/

	var  boldColor=[0.8,0.8,0.8];
	var targetComp=app.project.activeItem;//仮

//ボールドコンポにコンポサイズの平面を作る
//MASKシェイプで図形を描く
var boldBaseLayer=targetComp.layers.addSolid(boldColor,"boldBase",targetComp.width,targetComp.height,targetComp.pixelAspect);
//指定比率でボックスを描く
var myBoxOrder=90;//%指定
var myMargin=(100-myBoxOrder)/2;
var myWidth=boldBaseLayer.width;
var myHeight=boldBaseLayer.height;
	// Add Shape
	var myBox    = boldBaseLayer.mask.addProperty("ADBE Mask Atom");
	var boxShape = new Shape();
	boxShape.vertices =[
	[myWidth*myMargin/100,myHeight*myMargin/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*myMargin/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*(myBoxOrder+myMargin)/100],
	[myWidth*myMargin/100,myHeight*(myBoxOrder+myMargin)/100]
	];
	myBox.maskShape.setValue(boxShape);
	myBox.name="box";
	myBox.maskMode=MaskMode.NONE;
//ケイ線を引く1
	var myLine	=	boldBaseLayer.mask.addProperty("ADBE Mask Atom");
	var lineShape	= new Shape();
	lineShape.vertices =[
	[myWidth*myMargin/100,myHeight*(myMargin+myBoxOrder*(1/3))/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*(myMargin+myBoxOrder*(1/3))/100]
	];
	myLine.maskShape.setValue(lineShape);
	myLine.name="line0";
	myLine.maskMode=MaskMode.NONE;
//ケイ線を引く2
	myLine	=	boldBaseLayer.mask.addProperty("ADBE Mask Atom");
	lineShape	= new Shape();
	lineShape.vertices =[
	[myWidth*myMargin/100,myHeight*(myMargin+myBoxOrder*(2/3))/100],
	[myWidth*(myBoxOrder+myMargin)/100,myHeight*(myMargin+myBoxOrder*(2/3))/100]
	];
	myLine.maskShape.setValue(lineShape);
	myLine.name="line1";
	myLine.maskMode=MaskMode.NONE;

