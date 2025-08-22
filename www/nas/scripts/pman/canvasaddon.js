/*
	nas canvas拡張
canvasプロパティにcanvasエレメントを置く（キャッシュ）

編集時以外は素のcanvasで画像扱い？
imgは合ってもなくても良い？
統一的に扱うためにimg プロパティを画像キャッシュとして扱うのが良い
編集キャッシュは canvasStreamプロパティを使う（SVG化も検討）
canvasプロパティの廃止を検討

perPixelTargetFind
Objectのプロパティ　ピクセルのある部分だけを選択対象にする
ストロークに関してはこれが望ましい

イベント設定

type:'-canvasasset-',//新規設定 
mime:false,
path:'null',
file            : null,  //File Object
entry           : null,  //FileEntry|DirectoryEntry
url             : null,  //Object URL
stat:{
	
},
*/
/*
 * fabricライブラリ・カスタマイズ
 */
fabric.Object.prototype.set({
	  borderColor        : "rgb(178,204,0)",      //選択枠の色
	  borderScaleFactor  : 2,                     //選択枠の太さ
	  cornerSize         : 10,                    //コーナーハンドルのサイズ
	  cornerColor        : "rgba(0, 0, 0, 0.5)",  //コーナーハンドルの色
	  transparentCorners : true,                  //コーナーハンドルを透明にするか（trueだと枠線だけになる）
	  cornerStrokeColor  : "rgba(191, 24, 24, 1)",//コーナーハンドルの輪郭の色
	  cornerStyle        : "rect",                //コーナーハンドルの形（circle or rect）
	  perPixelTargetFind : true,                  //ピクセルレベルで選択(バウンディングボックスで選択する際はfalse)
	  strokeUniform      : true,                  //線幅固定（拡縮しても一定）
	  preserveObjectStacking : true               //表示順位を固定
});
/*
pmdb
{
	"ovlBgColor":2,
	"ovlBgColors":[
		"claer":[1,1,1,0],透明
		"white":[1,1,1,1],白
		"yellow":[1,1,0.8,1],黄色（クリーム）
		"pink":[1,0.9,0.9,1],ピンク
		"blue":[0.9,0.9,1,1],あさぎ
		"green":[0.9,1,0.9,1]わかくさ
	]
}
*/
/*for Test
var A=new pman.ReNameItem(document.createElement('canvas'),false);
A.name = 'testCanvas';
A.text = A.name;
A.canvas.width  = 640;
A.canvas.height = 480;
A.canvas.
var ctx = A.canvas.getContext('2d');
ctx.fillRect(250, 250, 350, 350);
pman.reName.setItem(A);
pman.reName.items[0].setImage();
// */
/**
 *	上書き用のcanvasを再初期化する
 *	現在の編集中のcanvasは廃棄されるので呼び出しに注意
 *	アイテムが通常アセットで、かつすでにオーバーレイを持っている場合
 *	初期化は行われず、エラーを返す
 */
pman.ReNameItem.prototype.initCanvas = function(callback){
//すでにオーバーレイを持っているアセットアイテムは初期化されない（canvasの有無は問わない）
	if((this.type == '-asset-')&&(this.hasOvl())) return false;
//あらかじめimgが設定されている必要がある
	if(!(this.img)||(this.img.width==0)) return false;
	this.imgsrc  = this.img.src;//現在のsrcを控える
	this.baseimg = this.img.cloneNode();//現在の画像を複製して控える

//	this.backupImg = new Image(this.img.naturalWidth,this.img.naturalHeight);//ブロブ保持用のバックアップ画像を設定する
//	this.backupImg.src = this.imgsrc;
//	this.backupImg.className = "test";
//	this.getHTMLElement().append(this.backupImg);
//console.log(this.getHTMLElement());

	this.canvas = document.createElement('canvas');
	this.canvas.width  = this.img.naturalWidth;
	this.canvas.height = this.img.naturalHeight;
/*
var src = {
	"version":"5.1.0",
	"objects":[
		{
			"type":"image",
			"version":"5.1.0",
			"originX":"left",
			"originY":"top",
			"left":0,
			"top":0,
			"width":this.img.naturalWidth;,
			"height":this.img.naturalHeight;,
			"fill":"rgb(0,0,0)",
			"stroke":null,
			"strokeWidth":0,
			"strokeDashArray":null,
			"strokeLineCap":"butt",
			"strokeDashOffset":0,
			"strokeLineJoin":"miter",
			"strokeUniform":true,
			"strokeMiterLimit":4,
			"scaleX":1,
			"scaleY":1,
			"angle":0,
			"flipX":false,
			"flipY":false,
			"opacity":1,
			"shadow":null,
			"visible":true,
			"backgroundColor":"",
			"fillRule":"nonzero",
			"paintFirst":"fill",
			"globalCompositeOperation":"source-over",
			"skewX":0,
			"skewY":0,
			"cropX":0,
			"cropY":0,
			"src":,this.imgsrc
			"crossOrigin":null,
			"filters":[]
		}
	]
};//*/
	var src = {
		"version":"5.1.0",
		"objects":[
			{
				"type":"image",
				"version":"5.1.0",
				"originX":"left",
				"originY":"top",
				"left":0,
				"top":0,
				"width":this.baseimg.naturalWidth,
				"height":this.baseimg.naturalHeight,
//				"src":this.baseimg.src,
				"selectable":false,
				"crossOrigin":null
			}
		]
	};
//	this.canvasStream        = [JSON.stringify(src)];
	this.canvasStream        = [src];
	this.canvasUndoPt        = -1;
	if(callback instanceof Function) callback(this)
}
/**
	@params  {Object pman.ReNameItem} tagItem
	指定アイテムのcanvasを初期化する
	二重初期化は行わない
 */
pman.reName.activateAssetCanvas = function (tagItem){
	if(tagItem.canvas) return tagItem.canvas;
	tagItem.initCanvas();
	return tagItem.canvas;
}
/*
	@params  {Object pman.ReNameItem} refItem
	@params  {String}  nameText
	@params  {String}  paperCol
	@params  {Boolean} asOvl
	@returns {Object pman.ReNameItem|undefined} 

	canvasassetItemは作成時にリファレンスとなるアイテムを要求する
	new pman.ReNameItem は、ローレベル関数として使用するが、直接の呼び出しでcanvasassetアイテムを作成するのは非推奨
	一旦作成したアイテムにリファレンスとの関連は特に無い。関連性はtextの解析と並び順が優先される
*/
pman.reName.insertCanvasAsset = function (refItem,nameText,paperCol,asOvl){
console.log(arguments);
	if(arguments.length == 0){
//引数無しで呼ばれた場合、条件チェックして呼び出し可能ならダイアログを表示して終了（ダイアログで引数を編集して再度呼ばれる）
		if(
			(pman.reName.focus >= 0)&&
			(pman.reName.selection[0].type == '-asset-')
			
		){
//syncItemDlg(アイテム名,用紙色,修正フラグ)
			pman.reName.canvasPaint.guessItemName(asOvl);
//			var itmName = pman.reName.guessOverlayName(pman.reName.selection[0])
//			pman.reName.canvasPaint.syncItemDlg(itemName);
			xUI.sWitchPanel('Item','open');
		}else{
			alert('選択されたアイテムがないか、有効なアセットではありません')
		};
		return;
	};
//pman.reName.insertCanvasAsset(pman.reName.canvasPaint.currentReference.item);
	if(
		(!(refItem instanceof pman.ReNameItem))||
		(refItem.type != '-asset-')||
		(!(refItem.img))
	){
//参照アイテム引数の検査
		return false;
	};
	if(typeof nameText == 'undefined') nameText = pman.reName.canvasPaint.currentReference.name;
	if(typeof paperCol == 'undefined') paperCol = pman.reName.canvasPaint.currentReference.backdropColor;
	if(typeof asOvl == 'undefined')    asOvl    = pman.reName.canvasPaint.currentReference.asOvl;
  if(asOvl){
//既存原稿の修正として初期化
	if(refItem.isOvl()) refItem = refItem.getOvlParent();
	var ovls = pman.reName.getOverlay(refItem);
//すでに編集中のアイテムが存在する場合はリジェクト
	if((ovls.length)&&(ovls[ovls.length-1].canvas)){
		alert("すでにオーバーレイ原稿が存在します")
		return false;
	};
	if(!nameText){
		if(ovls.length){
			var rfcd = nas.CellDescription.parse(ovls.reverse()[0].text);
		}else{
			var rfcd = nas.CellDescription.parse(refItem.text);
		};
		let suffix = "+";
		if(rfcd.postfix.match(/\+([2-9]\d*)+$/)){
			suffix = nas.incrStr(rfcd.postfix);
		}else if(rfcd.postfix.match(/\+$/)){
			suffix = rfcd.postfix + '2';
		};
		nameText = [
			rfcd.prefix,
			nas.RZf(rfcd.body,pman.reName.renameDigits),
			suffix
		].join('-');
	};
	if(typeof paperCol == 'undefined'){
		paperCol = pman.reName.canvasPaint.backdropColor;
	}else if (paperCol instanceof Array){
		paperCol = nas.colorAry2Str(paperCol);
	};
  }else{
//新規アイテムとして初期化
	ovls = [];
//名前が指定されないケースは、不可
//このコードは閉鎖
//リファレンスと同じグループの最終番号に置くためにプレフィックスのみの名前を
	if(! nameText) nameText = nas.CellDescription.parse(refItem.text).prefix;
	if(typeof paperCol == 'undefined') paperCol = 'white';
  };

/*
console.log(
	JSON.stringify({
		refItem:refItem.text,
		wxh:[refItem.img.width,refItem.height].join(' x '),
		nameText:nameText,
		paperCol:paperCol,
		asOvl:asOvl
	})
);// */

//canvasアセット用の非表示エレメントを作成してアイテムを初期化
	pman.reName.canvasPaint.backdropColor = paperCol;
	var canvas = document.createElement('canvas');
	canvas.name   = nameText;
	canvas.width  = refItem.img.naturalWidth;
	canvas.height = refItem.img.naturalHeight;
	var ctx = canvas.getContext("2d");
	//背景を描く
	ctx.fillStyle = pman.reName.canvasPaint.parseColor(paperCol);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	var insertItem = new pman.ReNameItem(canvas,false);
	var result = pman.reName.setItem(
		[insertItem],
		function(r){
			r.forEach(e =>{
				e.setImage().then(j => {
					j.move(refItem,(pman.numOrderUp)?'PLACEBEFORE':'PLACEAFTER');
					j.canvasStream = [
						JSON.stringify({
							version: '5.1.0',
							objects: [],
							background: pman.reName.canvasPaint.parseColor(paperCol)
						})
					];
					j.canvasUndoPt = -1;
					pman.reName.itemAlignment();//整列が必要
					if(! asOvl) setTimeout(function(){pman.reName.select(j)},75);
				});
			});
		}
	)//.then(function(i){console.log(i);if(! asOvl) pman.reName.select(i[0]);});
console.log(result);

//情報キャッシュを更新
	pman.reName.canvasPaint.currentReference.item          = refItem;
	pman.reName.canvasPaint.currentReference.name          = nameText;
	pman.reName.canvasPaint.currentReference.backdropColor = paperCol;
	pman.reName.canvasPaint.currentReference.asOvl         = asOvl;
	xUI.sWitchPanel("Item","close"); //ここで閉じる 仮に閉じた状態でも副作用はない
	return insertItem;
}
/*
	@params  {Object pman.ReNameItem} item
	@params  {String}  paperCol
	@returns {Object pman.ReNameItem|undefined} 

	引数既存アイテムのcanvasを編集可能な状態に再初期化する
	すでに編集中のcanvasを持っている場合は警告を行う
	ユーザ選択で初期化の中止が可能
*/
pman.reName.setAssetCanvas = function(item,paperCol){
	if(! item)		return;
	if(
		(!(item instanceof pman.ReNameItem))||
		((item.type == '-asset-')||(item.type == '-xpst-'))||
		(!(item.img))
	){
//参照アイテム引数の検査
		return false;
	};
	var doAct = true;
	if(item.canvas instanceof(HTMLCanvasElement)){
		var msg = 'このアイテムは現在編集中です\n現在の編集をすべて破棄して新しい編集を開始しますか？';
		doAct = confirm(msg);
	};
	if(doAct){
//既存アイテムのcanvasを再初期化
		item.initCanves(paperCol);
//情報キャッシュを更新
		pman.reName.canvasPaint.currentReference.item          = null;
		pman.reName.canvasPaint.currentReference.name          = "";
		xUI.sWitchPanel("Item","close"); //ここで閉じる 仮に閉じた状態でも副作用はない
		return item;
	};
	return;
}
/**
 *	pman_reNamer canvas addonTEST
 */
/*
ペイントユーティリティー
ペンツール
直線ツール（縁ーハンドツールに組み込みたい）
画面クリア　背景色のリセットも可能
カラーは文字列または配列
*/
pman.reName.canvasPaint = {
	pencilColorF:"red",
	pencilColorB:"b-cyan",
	backdropImage:null,
	backdropColor:"b-cyan",
	penColors:["black","white","red","green","blue"],
	bColors:["b-cyan","b-blue","b-pink","b-green","b-yellow","b-cream","b-orange","b-skin","b-light"],
	colors:{
		"black" : [.1,.1,.1,1],
		"white" : [1,1,1,1],
		"red"   : [.8,.1,.1,1],
		"green" : [.1,.4,.1,1],
		"blue"  : [.1,.1,.9,1],
		"b-cyan"  : [.9,1,1,1],
		"b-blue"  : [.9,.9,1,1],
		"b-pink"   : [1,.9,.9,1],
		"b-green" : [.9,1,.9,1],
		"b-yellow": [1,1,.5,1],
		"b-cream" : [1,1,.9,1],
		"b-orange": [1,.8,.4,1],
		"b-skin"  : [1,.9,.8,1],
		"b-light" : [.9,.9,.9,1],
	},
	tools : ["select","selectRect","pen","pencil","addText","stamp","hand","eraser","rect","circle"],
	toolProps:{downPoint:{x:0,y:0},upPoint:{x:0,y:0},lineDrawId:-1},
	previousTool: "pen",
	currentTool : "select",
	pencilWitdh : 3,
	canvasScale : 1,
	targetItem  :null,
	targetOvl   :null,
	suspend     :false,
	shapeDrawing:false,
	currentReference:{
		item:null,
		name:"",
		asOvl:true,
		backdropColor:"b-cyan"
	},
	yankBuffer  :[]
}
/**
 *	@params	{Object FabricEvenet} evt
 * オブジェクト追加イベントハンドラ
 */
pman.reName.canvasPaint.addedHandler = function(evt){
//	主にpencilToolの直線描画の際の終了点削除(lineDrawId >= 0)
	if(
		(pman.reName.canvasPaint.toolProps.lineDrawId >= 0)&&
		(pman.reName.canvasPaint.toolProps.lineDrawId < (pman.reName.canvas._objects.length - 1))
	){
		pman.reName.canvas.remove(evt.target);
		pman.reName.canvasPaint.toolProps.lineDrawId = -1;
	}else{
		pman.reName.canvasPaint.historyHandler(evt);
	};
}
/**
 *	@params	{Object FabricEvenet} evt
 * オブジェクト変更イベントハンドラ
 */
pman.reName.canvasPaint.modifiedHandler = function(evt){
console.log('modifiedHandler');
	pman.reName.canvasPaint.historyHandler(evt);
}
/**
 *	@params	{Object FabricEvenet} evt
 * 操作historyハンドラ
 * 他のイベントハンドラから呼ばれる
 */
pman.reName.canvasPaint.historyHandler = function(evt){
	if(!(pman.reName.canvasPaint.suspend)){
		pman.reName.canvas.undoPt ++ ;
		if(pman.reName.canvas.undoPt < pman.reName.canvas.undoStack.length)
			pman.reName.canvas.undoStack.length = pman.reName.canvas.undoPt;
		pman.reName.canvas.undoStack.push(pman.reName.canvas.toDatalessJSON());//pushはNG
		pman.reName.canvasPaint.pushContent();
	};
}
/**
 *	@params	{Object FabricEvenet} evt
 * オブジェクト選択イベントハンドラ
 */
pman.reName.canvasPaint.selectHandler = function(){
console.log(pman.reName.canvas.getActiveObjects().length);
	if(
		((pman.reName.canvasPaint.currentTool != 'select')&&(pman.reName.canvasPaint.currentTool != 'selectRect'))&&
		(pman.reName.canvas.getActiveObjects().length)
	){
		pman.reName.canvas.discardActiveObject();
		pman.reName.canvas.renderAll();
		return false;
	};
	if(
		(pman.reName.canvas.getActiveObjects().length == 1)&&
		(pman.reName.canvas.getActiveObjects()[0].text)&&
		($("#optionPanelText").isVisible())
	){
		document.getElementById('textToolEditBox').value = pman.reName.canvas.getActiveObjects()[0].text;
	};
}
/**
 *	@params {Number Int} id
	指定IDのスタックを描画して画面を更新
	スタックの0番は固定のバックドロップなので指定されない
*/
pman.reName.canvasPaint.drawStack = function(id){
	if((0 <= id)&&(id < pman.reName.canvas.undoStack.length)){
		pman.reName.canvasPaint.suspend = true;
		pman.reName.canvas.loadFromJSON(pman.reName.canvas.undoStack[id]).renderAll();
		pman.reName.canvasPaint.pushContent();
		pman.reName.canvasPaint.suspend = false;
	};
}
/*
 *
 */
pman.reName.canvasPaint.undo = function(){
	if(pman.reName.canvas.undoPt > 0){
		pman.reName.canvas.undoPt --;
		pman.reName.canvasPaint.drawStack(pman.reName.canvas.undoPt);
	}else{
		console.log('no undostack!')
	};
}
/*
 *
 */
pman.reName.canvasPaint.redo = function(){
	if(pman.reName.canvas.undoPt < (pman.reName.canvas.undoStack.length-1)){
		pman.reName.canvas.undoPt ++;
		pman.reName.canvasPaint.drawStack(pman.reName.canvas.undoPt);
	}else{
		console.log('empty redostack!');
	};
}
/*
 * セッション開始時点まで履歴を遡る
 */
pman.reName.canvasPaint.discardChange = function(){
	if(pman.reName.canvas.undoPt == pman.reName.canvas.sessionStartPt) return ;
console.log(pman.reName.canvasPaint);
console.log('restore Session Start Point');
	pman.reName.canvas.undoPt = pman.reName.canvas.sessionStartPt;
	pman.reName.canvasPaint.drawStack(pman.reName.canvas.undoPt);
}
/*
 *
 */
pman.reName.canvasPaint.unset = function(){
// pman.reName.canvasを設定解除して通常モードへ戻る
	if(!(pman.reName.canvas)) return;//編集中ではない
//canvasの内容をキャッシュイメージへ反映
//console.log([pman.reName.canvas.undoPt,pman.reName.canvas.undoStack.length]);
	var scale = pman.reName.preview;
	pman.reName.canvasPaint.pushContent();
//イベントクリア
	pman.reName.canvas.off("object:added"   ,pman.reName.canvasPaint.addedHandler);
	pman.reName.canvas.off("object:modified",pman.reName.canvasPaint.modifiedHandler);
	pman.reName.canvas.off("selection:created",pman.reName.canvasPaint.selectHandler);
//	pman.reName.canvas.off("object:removed" ,pman.reName.canvasPaint.historyHandler);

	pman.reName.canvas.off("mouse:move"    ,pman.reName.canvasPaint.ptHandler);
	pman.reName.canvas.off("mouse:down"    ,pman.reName.canvasPaint.ptHandler);
	pman.reName.canvas.off("mouse:up"      ,pman.reName.canvasPaint.ptHandler);
//undoバッファ解除
	pman.reName.canvas.undoStack      = [];
	pman.reName.canvas.undoPt         = -1;
	pman.reName.canvas.sessionStartPt = -1;

//ビューを一旦ピクセル1:1に設定
	pman.reName.lockView(false);//画面サイズアンロック
	pman.reName.changeView(null,0);
	pman.reName.canvasPaint.targetElm.style.opacity = (pman.reName.lightBox.disabled)? 1 : pman.reName.lightBox.opacity;
	pman.reName.canvasPaint.targetElm.style.mixBlendMode = (pman.reName.lightBox.disabled)? 'normal' : pman.reName.lightBox.blendingMode;
	pman.reName.canvasPaint.targetElm.src = pman.reName.canvasPaint.targetItem.img.src;//変更されたはずのソースを更新
//編集用のエレメントをクリア
	pman.reName.canvas.clear() ;//編集エリアのクリア
	pman.reName.canvas.lowerCanvasEl.parentNode.remove()
	pman.reName.canvas.remove();//エレメント削除
	delete pman.reName.canvas  ;//参照を削除
	if(document.getElementById('imgPreviewOverlay'))
		document.getElementById('imgPreviewOverlay').remove();//編集用の一時canvas削除
	if(document.getElementById('canvasBackdrop'))
		document.getElementById('canvasBackdrop').parentNode.removeChild(document.getElementById('canvasBackdrop'));
//		document.getElementById('canvasBackdrop').remove();
	if(document.getElementById('canvasWrap'))
		document.getElementById('canvasWrap').remove();//canvasトレーラー削除
	pman.reName.onCanvasedit = false;//編集モード終了
	if(nas.HTML.mousedragscrollable.movecancel){
		nas.HTML.mousedragscrollable.movecancel = false;
	};//スクロールロック解除

//編集ポインタを解除
	pman.reName.canvasPaint.targetItem = null;
	pman.reName.canvasPaint.targetElm  = null;
//表示を更新
	xUI.sync('paintTool');
	xUI.sWitchPanel('Paint','close');
	pman.reName.changeView(null,scale,undefined,true);
}
/**
 *	@params {Object pman.ReNameItem} itm
 *  canvas編集を設定する
 *  itm 編集対象のcanvasの有効な -canvasasset-|-xpst-|-asset- である必要がある
-canvasxpst-は廃止
	-asset-|-xpst- にcanvasを追加する機能を増設
	
 *	itmの系列に編集対象アイテムがあった場合はそのアイテムにフォーカスを変更して編集モードを起動する
 *	編集モードに入る条件として オーバーレイアイテム||透過台のオンオフ を外す
 *	＊編集モードに入る際にプレビューが画像以外の場合エラーが発生するのでエラー原因を排除
全画像アイテムが編集対象となる可能性を持つように使用が変更されたため
編集対象アイテムの自動選別機能は削除
与えられたアイテムのみを編集対象としてチェックする
起動時に透過状態が崩れるケースがあるので修正が必要 220621
 */
pman.reName.canvasPaint.set = function(itm){
console.log(itm);
	if(pman.reName.canvas){
/*すでに編集中 パネルツールを開く動作のみ行う*/
		xUI.sWitchPanel('Paint','show');
		return false;
	};
	if(
		(!(document.getElementById('imgPreview')))||
		(document.getElementById('imgPreview').width == 0)||
		(document.getElementById('imgPreview').height == 0)
	){
//itmに画像がない可能性がある/一旦排除
		return false;
	};
	if(
		(!(itm))||
		(!(itm instanceof pman.ReNameItem))||
		(!(itm.getHTMLElement()))
	){
/*引数がない・引数がアイテムでない・引数アイテムが表示可能でない*/
		alert('有効なアイテムが指定されていません');
		 return false;//
	};
	if(!(itm.canvas)){
		var msg = "";
		if((itm.type == '-asset-')&&(pman.reName.getOverlay(itm).length))
			msg += "すでにオーバーレイのあるアセットを編集することは推奨できません\n";
		msg += "このアイテムは現在編集可能ではありません\n書き込み可能に変更しますか？";
		nas.HTML.showModalDialog(
			'confirm',
			msg,
			'アイテムの編集許可',
			null,
			function(result){
				if(result){
					itm.initCanvas(pman.reName.canvasPaint.set);
				};
			}
		);
//初期化を起動して設定自体は失敗終了させる
		return false;
	};
/*
 *		アイテムの画像にアタッチされたcanvas (-xpst-|-asset-)
 *	アイテム内部のcanvasを編集対象にする
 *
 *		アイテムデータがcanvas(-canvasasset-)
 *	指定アイテムのオーバーレイとして認識されるcanvasasset
 *		ケース判別
 *
 *		-xpst-
 *			タイムシートデータ
 *	画像タイムシートはcanvasプロパティを持つことができる
 *	セッション内でのみ編集可能
 *	セッション終了時にベイクが必要でベイクせずにセッションを終了した場合データは失われる
 *	ベイクは jpeg|png|svg
 *
 *		-asset-
 *			サポート範囲の形式の画像ファイルを持つアイテム
 *	テキストアセットを含まない svgの扱いを調整
 *	通常アセットは、本体画像と同時にcanvasプロパティを持つ可能性がある
 *	通常アセットが、canvasを持っていない場合setメソッドは、
 *	① オーバーレイを持っているか否かを検出
 *		検出された場合、そのアセットのcanvasは編集禁止
 *	② 編集可能なオーバーレイを探す
 *		オーバーレイが複数あれば最も順位の高いものを編集対象として初期化する
 *
 *		-canvasasset-
 *			canvasを画像データ本体として持つアセット
 *	canvasプロパティを持つ
 *	セッション内でのみ編集可能
 *	セッション終了時にベイクが必要でベイクせずにセッションを終了した場合データは失われる
 *	ベイクは jpeg|png|svg
 *	手続き的には-xpst-に準ずる
 *	
 *		canvasassetオーバーレイを持つアセット
 *	自分自身のcanvasにデータを持っているもの
 *	
 *	プレビューウインドウの基本構造は以下

<div id="previewWindow">
	<img
		id=imgUnderlay_#//0,1,2...↑ //員数可変
	>
	<img
		id="imgPreview" //プレビュー画像本体
		src=<BLOB>
		width="785"
		style="top: 0px; left: 0px; opacity: 0; mix-blend-mode: normal;"
	>
	<img
		id=imgOverlay_#//0,1,2...↓ //員数可変
	>
	<img
		id=imgOverlay_#
	>...
	<img id="canvasBackdrop" width="785" height="556" src="original-source">
	<div
		id="canvasWrap"	//編集用の要素トレーラー 内部要素はFablicCanvasの管理下
		class="canvasWrap"
	>canvasWrapの役目を変更してトレーラーにする イベントは素通しに
		<div
			class="canvas-container"
			style="width: 785.672px; height: 556px; position: relative; user-select: none;"
		>
			<canvas
				id="imgPreviewOverlay"
				class="imgEditableOverlay lower-canvas"
				width="785" height="556"
				style="position: absolute; width: 785.672px; height: 556px; left: 0px; top: 0px; touch-action: none; user-select: none; opacity: 1;"
			></canvas>
			<canvas
				class="upper-canvas imgEditableOverlay"
				width="785" height="556"
				style="position: absolute; width: 785.672px; height: 556px; left: 0px; top: 0px; touch-action: none; user-select: none; cursor: crosshair;"
				></canvas>
		</div>
	</div>
</div>

 *	
 *	処理拡張で通常アセットが編集可能なcanvasをアイテム内部保持可能になる
 *	カンバスアセットは、キャッシュ画像を持つが本体画像を持たない
 *	カンバスアセットをオーバーレイアイテムとして持つアセットは事後の編集をおこなってはならないが、編集可能canvasを持つことは可能なので
 *	運用的な制限が必要
 *	ここでは内部的にオーバーレイアイテムを持つか否かを判定しない
 *	運用上のオーバーレイモードでは、最上位のオーバーレイアイテムを選択
 *	ノーマルモードでは、自身が編集可能canvasを持つか否かで判断される
 */
/* この設定はtgtItem確定後に
	if((itm.type.match(/-asset-|-xpst-/))&&(itm.canvas)){
//復帰時に必要となるのでフラグ兼任のオブジェクトプロパティとして設定する
		pman.reName.canvasPaint.backdropImage     = document.createElement('img');
		pman.reName.canvasPaint.backdropImage.src = itm.img.src;
	}else{
		pman.reName.canvasPaint.backdropImage     = null;
	};//*/

//console.log('--- setPreView');
//		pman.reName.setPreview(itm,true);

		var ovlParent  = itm.getOvlParent();//オーバレイ対象を取得
		var ovlEs      = pman.reName.getOverlay(itm);//オーバーレイコレクション配列を取得
		var tgtItm     = itm;
		var sourceSize = [itm.img.naturalWidth,itm.img.naturalHeight];

		if((pman.reName.lightBox.overlay)&&(itm.hasOvl())){
//overlay-mode ON オーバーレイ判定を行う
//オーバーレイをもつアイテムが指定されていた場合、編集対象候補をオーバーレイ最上位に設定
//			if(itm.hasOvl()) ovlParent = itm;
			if(ovlParent) ovlEs = pman.reName.getOverlay(ovlParent);
			tgtItm = ovlEs[ovlEs.length-1];
		}else{
			if(itm.canvas){
//編集対象のcanvasassetが直接指定されているケース
				if(ovlParent) ovlEs = pman.reName.getOverlay(ovlParent);
				tgtItm = itm;
			};
		};// */

console.log(tgtItm);

//最終条件判定
		if(
			(tgtItm)&&
			((pman.reName.items.indexOf(itm) != pman.reName.focus)||(!(tgtItm.canvas)))
		){
//引数アイテムにフォーカスがない・編集対象アイテムがcanvasを持たない
			alert('有効なアイテムが指定されていません');
//console.log(itm);
			return false;
		};
//tgtItmが表示されていない可能性があれば透過台を設定
		if(pman.reName.items.indexOf(tgtItm) != pman.reName.focus){
//この処理が加わったのでオーバーレイが設定前であるケースが発生-要対処
			if(pman.reName.lightBox.disabled)   pman.reName.lightBox.disabled = false;
			if(!(pman.reName.lightBox.overlay)) pman.reName.lightBox.overlay  = true;
			xUI.sync('lightBox');
		};// */
		pman.reName.canvasPaint.targetItem = tgtItm ;//ターゲットアイテムを確定（canvas）
console.log(pman.reName.canvasPaint.targetItem)
//		pman.reName.select(tgtItm)                  ;//フォーカスセット


	if((tgtItm.type.match(/-asset-|-xpst-/))&&(tgtItm.canvas)){
//復帰時に必要となるのでフラグ兼任のオブジェクトプロパティとして設定する
//		pman.reName.canvasPaint.backdropImage     = document.createElement('img');
//		pman.reName.canvasPaint.backdropImage.src = tgtItm.img.src;
		pman.reName.canvasPaint.backdropImage     = true;
	}else{
		pman.reName.canvasPaint.backdropImage     = false;
	};

//編集ロック
	pman.reName.onCanvasedit = true               ;//編集モードセット
	nas.HTML.mousedragscrollable.movecancel = true;//ドラグスクロールロック
// 表示設定値をバックアップ
	var bkup = {
		preview:pman.reName.preview,
		point:Array.from(pman.reName.previewPoint)
	};
console.log(bkup)
//ビューを一旦ピクセル1:1に設定
console.log('--- chgView 0 A')
	pman.reName.changeView(null,0);
	var previewWindow = document.getElementById("previewWindow");
	var baseImage     = document.getElementById("imgPreview");
//ターゲットエレメントを設定
	pman.reName.canvasPaint.targetElm = document.getElementById("imgPreview");
//ターゲットがオーバーレイを持ち、オーバーレイに編集対象が含まれていればターゲットエレメントを遷移
	if((ovlEs.length)&&(ovlEs.indexOf(pman.reName.canvasPaint.targetItem)>=0))
	pman.reName.canvasPaint.targetElm = document.getElementById("imgOverlay_"+ovlEs.indexOf(pman.reName.canvasPaint.targetItem));

//console.log(targetCanvas.width);
	var canvasWrap = document.createElement('div');
	previewWindow.appendChild(canvasWrap);
	canvasWrap.id        = 'canvasWrap';
	canvasWrap.className = 'canvasWrap';

	if(tgtItm.baseimg){
//		var backdropImage = tgtItm.baseimg.cloneNode();
		var backdropImage = tgtItm.baseimg;
//		backdropImage.width      = sourceSize[0]
//		backdropImage.height     = sourceSize[1];
		backdropImage.id         = 'canvasBackdrop';
//		backdropImage.src        = tgtItm.baseimg.src;
		backdropImage.className  = 'canvasBackdrop';
		previewWindow.appendChild(backdropImage);
	};

	var targetCanvas  = document.createElement('canvas');
	canvasWrap.appendChild(targetCanvas);
	targetCanvas.id        = 'imgPreviewOverlay';
	targetCanvas.className = 'imgEditableOverlay';
//console.log(itm.img);
	targetCanvas.width     = sourceSize[0];//itm.img.naturalWidth;
	targetCanvas.height    = sourceSize[1];//itm.img.naturalHeight;

// */
//	var targetCanvas  = ovlEs.canvas.cloneNode(false);
/*参考コード
//htmlで作ったcanvas要素をidで指定して、canvasオブジェクトを生成。
const canvas = new fabric.Canvas("canvas_in_html");
//サイズを設定。後から変更できる
canvas.setWidth(300);
canvas.setHeight(200);

//フリードローイングを可能にする（不要）
canvas.isDrawingMode = true;

//背景色を設定。4つ目はアルファ（不透明度）。PNGでDLするときも有効
canvas.setBackgroundColor(
  "rgba(255, 255, 200, 1)",
  canvas.renderAll.bind(canvas)
);
//描画色の設定。RGB+不透明度。"rgb(255,50,40)"と書くとアルファを省略できる
canvas.freeDrawingBrush.color = "rgba(255,50,40,0.5)"; // 描画する線の色 rgba
//ペンサイズの設定
canvas.freeDrawingBrush.width = 10; // 描画する線の太さ
// 全消し
//canvas.clear();
//バックグラウンドも消えるので、
//再度canvas.setBackgroundColorする必要がある*/
//targetCanvasをチューニング編集するcanvasの内容を複製（元画像のコピーは保存時点で処理）

	pman.reName.canvas = new fabric.Canvas('imgPreviewOverlay');
	pman.reName.canvas.width  = sourceSize[0];//tgtItm.img.naturalWidth;
	pman.reName.canvas.height = sourceSize[1];//tgtItm.img.naturalHeight;

	pman.reName.canvas.undoStack = pman.reName.canvasPaint.targetItem.canvasStream;
	pman.reName.canvas.undoPt    = pman.reName.canvasPaint.targetItem.canvasUndoPt;

	pman.reName.canvas.sessionStartPt = pman.reName.canvas.undoPt;

	pman.reName.canvas.on("object:added"     ,pman.reName.canvasPaint.addedHandler);
	pman.reName.canvas.on("object:modified"  ,pman.reName.canvasPaint.modifiedHandler);
	pman.reName.canvas.on("selection:created",pman.reName.canvasPaint.selectHandler);
//	pman.reName.canvas.on("object:removed"   ,pman.reName.canvasPaint.historyHandler);
	
	pman.reName.canvas.on("mouse:move"    ,pman.reName.canvasPaint.ptHandler);
	pman.reName.canvas.on("mouse:down"    ,pman.reName.canvasPaint.ptHandler);
	pman.reName.canvas.on("mouse:up"      ,pman.reName.canvasPaint.ptHandler);


//	pman.reName.canvas.setWidth(itm.img.naturalWidth);
//	pman.reName.canvas.setHeight(itm.img.naturalHeight);
//console.log([targetCanvas.width,targetCanvas.height]);
//console.log([pman.reName.canvas.width,pman.reName.canvas.height]);


//*overlay scale & position match
/*canvas全体のスケーリングと位置合わせをcssで行う*/
/*canvas全体のスケーリングと位置合わせをfablicで行う*/
//	var scale = baseImage.width / baseImage.naturalWidth;
//	editField.getContext('2d').drawImage(targetItem.canvas,0,0);//現在の内容を描画
//	pman.reName.canvas.getContext('2d').drawImage(targetItem.canvas,0,0);//現在の内容を描画

//pman.reName.canvas._originalCanvasStyle.top  = baseImage.style.top;
//pman.reName.canvas._originalCanvasStyle.left = baseImage.style.left;

//	editField.style.top  = baseImage.style.top;
//	editField.style.left = baseImage.style.left;
//	pman.reName.canvas.absolutePan(
//		new fabric.Point(baseImage.style.left,baseImage.style.top)
//	);
//	pman.reName.canvas._originalCanvasStyle.transformOrigin = '0 0'; //scale from top left
//	editField.style.transform = 'scale(' + scale + ')';
//	pman.reName.canvas.setZoom(scale);
//	pman.reName.canvas.initialize(targetCanvas);//,{isDrawingMode: true}
//

	if(pman.reName.canvas.undoPt < 0){
console.log('new edit area clear edit canvas');
//		pman.reName.canvas.setBackgroundColor(pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.backdropColor));
//		pman.reName.canvas.renderAll();
//		pman.reName.canvas.undoStack.push(pman.reName.canvas.toDatalessJSON());//JSON.stringify(pman.reName.canvas);
		pman.reName.canvas.undoPt = 0;
		pman.reName.canvas.sessionStartPt = 0;

console.log([pman.reName.canvas.width,pman.reName.canvas.height]);

	};
console.log('load edit area from element canvasStream');
	pman.reName.canvas.loadFromJSON(
		pman.reName.canvas.undoStack[pman.reName.canvas.undoPt],
		function(){
			pman.reName.canvas.renderAll();
			if(pman.reName.canvasPaint.backdropImage){
				pman.reName.canvas._objects[0].selectable = false;
			};
		}
	);
//透明度設定
	document.getElementById('canvasWrap').style.opacity = pman.reName.canvasPaint.targetElm.style.opacity;
	pman.reName.canvasPaint.targetElm.style.opacity = '0';//オリジナル(表示バッファ)を非表示化して入れ替え
//ビューを復帰
console.log([pman.reName.canvas.width,pman.reName.canvas.height]);
console.log('--- chgView 0 B')
	pman.reName.changeView(null,1);//スケールフィット
	pman.reName.lockView(true);//画面サイズロック
console.log('--- chgView 0 C')
	pman.reName.changeView(null,bkup.preview);

//編集中アイテムインジケータを点灯 	;//syncCommandで統合する アイコンツールバーとメニューの制御も行う

		document.getElementById('note_switch').innerHTML = 'UNSET';
		nas.HTML.removeClass(document.getElementById('note_item'),'note_item_focus');
		nas.HTML.addClass(document.getElementById('note_item'),'note_item_edit');
		document.getElementById('note_item').innerHTML = "! "+ pman.reName.canvasPaint.targetItem.text;

//再読み込みの際にツールを再セットする必要がある
	pman.reName.canvasPaint.setTool('reset');

xUI.sync('paintColor');
xUI.sync('paintTool');
xUI.sync('paintCommand');
xUI.sWitchPanel('Paint','show');
//	return editField;
}

//選択オブジェクトの削除
//画面のクリア＋初期化（再初期化を含む）
//アイテム画像の更新（保存）
//編集の中断
//ベイクして編集を終了
//ツールの切り替え
//カラーの変更
//	var currentBounds = document.getElementById("previewBox").getBoundingClientRect();
//	width = document.body.clientWidth - currentBounds.left
//	height = document.body.clientHeight - currentBounds.top
pman.reName.canvasPaint.init = function(){
	this.currentReference={
		item:null,
		name:"",
		asOvl:true,
		backdropColor:"b-cyan"
	};
console.log(itm);
}
/*canvas編集中のキーボードイベントハンドラ トラップした際にはfalseを戻す
 */
pman.reName.canvasPaint.kbHandle = function(evt){
	if(evt.target.id == 'textToolEditBox') return true;
	if(pman.reName.canvas){};
		switch(evt.keyCode){
		case  8:  ;//BackSpace
		case  46: ;//Delete
//remove selection
			pman.reName.canvasPaint.removeSelection();return false;
		break;
		case  9:  ;//Tab
//item select rotation
			if(evt.type == 'keydown'){
				var currentObjects   = pman.reName.canvas.getObjects();
				if(pman.reName.canvasPaint.targetItem.type.match(/-asset-|-xpst-/))
					currentObjects = currentObjects.slice(1);
				var currentSelection = pman.reName.canvas.getActiveObjects();
				var currentSelect    = currentObjects.indexOf(currentSelection[0]);
				if(currentSelection.length >= 0){
					var offset = (evt.shiftKey)? -1:1;
					var nextSelect = currentObjects[(currentSelect + currentObjects.length + offset) % currentObjects.length];
				}else if((pman.reName.canvasPaint.targetItem.type.match(/-asset-|-xpst-/))&&(currentObjects.length == 0)){
//セレクト可能なアイテムが存在しないケース
					return false;
				}else{
//セレクトがない場合は一番最後のオブジェクトにフォーカスする
					var nextSelect = currentObjects[currentObjects.length-1];
				};
				if(nextSelect){
					pman.reName.canvas.setActiveObject(nextSelect);
					pman.reName.canvas.renderAll();
				};
				return false;
			};
		break;
		case 32:  ;//[Spacebar]
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('hand');
//				pman.reName.canvas.isDrawingMode = false;
//				nas.HTML.mousedragscrollable.movecancel = false;
			}else if(evt.type == 'keyup'){
				pman.reName.canvasPaint.setTool(pman.reName.canvasPaint.previousTool);
//				nas.HTML.mousedragscrollable.movecancel = true;
			};
				return false;
		break;
		case 49:  ;//[1]
		case 50:  ;//[2]
		case 51:  ;//[3]
		case 52:  ;//[4]
		case 53:  ;//[5]
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setColor(pman.reName.canvasPaint.penColors[(evt.keyCode - 49)]);
				return false;
			};
		break;
		case 54:  ;//[6]
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setColor(pman.reName.canvasPaint.backdropColor);
				return false;
			};
		break;
		case 65:  ;//[a] selectall
			if(evt.type == 'keydown'){
				if((evt.metaKey)||(evt.ctrlKey)){
					pman.reName.canvasPaint.selectObject('all');
					return false;
				};
			};
		break;
		case 66:  ;//[b] penTool
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('pen');return false;
			};
		break;
		case 67:  ;//[c] circleTool|cut
			if(evt.type == 'keydown'){
				if((evt.metaKey)||(evt.ctrlKey)){
					pman.reName.canvasPaint.copy();
					return false;
				};
				pman.reName.canvasPaint.setTool('circle');return false;
			};
		break;
		case 68:  ;//[d] deselectAll | resetColor
			if((evt.metaKey)||(evt.ctrlKey)){
				pman.reName.canvas.discardActiveObject();
				pman.reName.canvas.renderAll();
				return false;
			}else if(evt.type == 'keydown'){
				pman.reName.canvasPaint.resetColor();return false;
			};
		break;
		case 69:  ;//[e] eraserTool
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('eraser');return false;
			};
		break;
		case 72:  ;//[h] handTool
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('hand');return false;
			};
		break;
		case 77:  ;//[m] selectRect
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('selectRect');return false;
			};
		break;
		case 82:  ;//[r] rectTool
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('rect');return false;
			};
		break;
		case 83:  ;//[s] stampTool
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('stamp');return false;
			};
		break;
		case 84:  ;//[t] textTool
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setTool('addText');return false;
			};
		break;
		case 86:  ;//[v] selectTool|paste
			if(evt.type == 'keydown'){
				if((evt.metaKey)||(evt.ctrlKey)){
					pman.reName.canvasPaint.paste();
					return false;
				};
				pman.reName.canvasPaint.setTool('select');return false;
			};
		break;
		case 88:  ;//[x] swapColor|cut
			if(evt.type == 'keydown'){
				if((evt.metaKey)||(evt.ctrlKey)){
					pman.reName.canvasPaint.cut();
					return false;
				};
				pman.reName.canvasPaint.swapColor();return false;
			};
		break;
		case 89:  ;//[y] redo
			if((evt.metaKey)||(evt.ctrlKey)){
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.redo();return false;
			}};
		break;
		case 90:  ;//[z] undo|redo
			if(evt.type == 'keydown'){
				if((evt.metaKey)||(evt.ctrlKey)){
					if(evt.shiftKey){
						pman.reName.canvasPaint.redo();return false;
					}else{
						pman.reName.canvasPaint.undo();return false;
					};
				}else if(evt.altKey){
					pman.reName.canvasPaint.redo();return false;
				};
			};
		break;
		case 187:  ;//[+] plus keydown
		case 189:  ;//[-] plus keydown
			if((evt.type == 'keydown')&&((evt.ctrlKey)||(evt.metaKey))){
				let sizeOffset = 188 - evt.keyCode;
				let size = (pman.reName.preview + sizeOffset);
				if(size > 8){size = 8;} else if(size < 1){size = 1;}
				if(size != pman.reName.preview) pman.reName.changeView('',size);
				return false;
			};
			break;
		case 219:  ;//[[] bracket open
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setPenWidth('thin');return false;
			};
		break;
		case 221:  ;//[]] bracket close
			if(evt.type == 'keydown'){
				pman.reName.canvasPaint.setPenWidth('bold');return false;
			};
		break;

/*
//ボックスセレクト
	pman.reName.canvas.selection = true;
//セレクタ
	pman.reName.canvas.selection = false;
//ハンドツール
	nas.HTML.mousedragscrollable.movecancel = false|true;
//ペンシルツール
	pman.reName.canvas.isDrawingMode = true;
//スタンプツール
	
//テキストツール
	
//rect\長方形ツール
	
//circle\楕円ツール
//カット[ctrl|meta]+[x]
//コピー[ctrl|meta]+[c]
//ペースト[ctrl|meta]+[v]
//コンテンツプッシュ[ctrl|meta]+[s]
//編集終了[ctrl|meta]+[SHIFT]+[s]

画像貼り込みはペーストのみでよいか？
;// */
		};
console.log(evt);
	
	return true;
}
/*canvas編集中のマウスイベントハンドラ トラップした際にはfalseを戻す

	tools : [
		"select":,
		"selectRect":,
		"pen":,
		"pencil":,
		"addText":ptHandle,
		"stamp":ptHandle,
		"hand":,
		"eraser":,
		"rect":ptHandle,
		"circle":ptHandle
	],
 */
pman.reName.canvasPaint.ptHandler = function(evt){
	if(evt.e.type == 'mousedown'){
/*
		if(
			((pman.reName.canvasPaint.currentTool != 'select')&&(pman.reName.canvasPaint.currentTool != 'selectRect'))&&
			(pman.reName.canvas.getActiveObjects().length)
		){
			pman.reName.canvas.discardActiveObject();
			pman.reName.canvas.renderAll();
		};// */

		if(pman.reName.canvasPaint.currentTool != 'hand') pman.reName.canvasPaint.toolProps.downPoint = evt.absolutePointer;
//
		if((pman.reName.canvasPaint.currentTool == 'pen')&&(evt.e.shiftKey)){
			pman.reName.canvasPaint.toolProps.lineDrawId = pman.reName.canvas._objects.length;//直線描画時にこれから描画するオブジェクトのIDでフラグを立てる
		//（フラグの回収はチェンジイベント側で行う）
		var lineOffset = pman.reName.canvasPaint.pencilWitdh/2;
			pman.reName.canvas.add(new fabric.Line([
				pman.reName.canvasPaint.toolProps.upPoint.x  -lineOffset,
				pman.reName.canvasPaint.toolProps.upPoint.y  -lineOffset,
				pman.reName.canvasPaint.toolProps.downPoint.x-lineOffset,
				pman.reName.canvasPaint.toolProps.downPoint.y-lineOffset
			],{
				strokeWidth  : pman.reName.canvasPaint.pencilWitdh,
				strokeLineCap: "round",
				stroke       : pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorF),
				angle        : 0
			}));
			pman.reName.canvas.renderAll();
		}else if(
			(!(pman.reName.canvasPaint.toolProps.suspend))&&
			((pman.reName.canvasPaint.currentTool == 'circle')||(pman.reName.canvasPaint.currentTool == 'rect'))
		){
console.log('shape drawing start');
			pman.reName.canvasPaint.suspend = true;
		};
	}else if(evt.e.type == 'mouseup'){
		if(pman.reName.canvasPaint.currentTool != 'hand') pman.reName.canvasPaint.toolProps.upPoint = evt.absolutePointer;
		if(
			(pman.reName.canvasPaint.suspend)&&
			((pman.reName.canvasPaint.currentTool == 'circle')||(pman.reName.canvasPaint.currentTool == 'rect'))
		){
//フラグを下げて図形の描画
console.log('shape drawing end');
			pman.reName.canvasPaint.suspend = false;
			pman.reName.canvasPaint.setShape	(((evt.e.metaKey)||(evt.e.ctrlKey)),(evt.e.shiftKey));
		};
	}else if((evt.e.type == 'mousemove')){
		if(
			(pman.reName.canvasPaint.suspend)&&
			((pman.reName.canvasPaint.currentTool == 'circle')||(pman.reName.canvasPaint.currentTool == 'rect'))
		){
//図形の仮描画
			pman.reName.canvasPaint.toolProps.upPoint = evt.absolutePointer;
			pman.reName.canvasPaint.setShape	(false,(evt.e.shiftKey));
			return false
		};
	};
//	if(pman.reName.canvasPaint.currentTool.match(/select|selectRect|pen|pencil|hand|eraser/)) return;
//console.log(evt)
//	return false;
}

//現在の編集内容を保存更新 UNDO操作の一部になる
pman.reName.canvasPaint.pushContent = function(){
	if(pman.reName.canvas){
//現在のビューを保存
		var scale = pman.reName.preview;
		var point = [document.getElementById('previewWindow').scrollLeft,document.getElementById('previewWindow').scrollTop];
//スケール 1:1
		pman.reName.changeView(null,0,undefined,true);

		pman.reName.canvasPaint.targetItem.canvas = pman.reName.canvas.toCanvasElement(1.0);//canvs置換
		pman.reName.canvasPaint.targetItem.canvasUndoPt = pman.reName.canvas.undoPt;//undoポインタ保存
/*
//バックドロップ画像を合成して書き出す 合成をsetImageに委ねる 変更を検出したらプレビュー画像は更新する
		if(pman.reName.canvasPaint.targetItem.baseimg){
			var compCanvas = document.createElement('canvas');
			compCanvas.width  = pman.reName.canvasPaint.targetItem.img.naturalWidth ;
			compCanvas.height = pman.reName.canvasPaint.targetItem.img.naturalHeight ;
			const ctx = compCanvas.getContext("2d");
			ctx.drawImage(pman.reName.canvasPaint.targetItem.baseimg, 0, 0);
			ctx.drawImage(pman.reName.canvasPaint.targetItem.canvas,0,0);
			pman.reName.canvasPaint.targetElm.src = compCanvas.toDataURL();
		}else{
			pman.reName.canvasPaint.targetElm.src = pman.reName.canvas.toDataURL();
		};
 */
		pman.reName.canvasPaint.targetItem.setImage(pman.reName.canvasPaint.targetElm,true);//キャッシュ更新
		pman.reName.changeView(null,scale,undefined,true);
	};
}
//現在の編集内容を編集canvasへレストア undoの実装により不要　消去予定
pman.reName.canvasPaint.popContent =function(){
	if(pman.reName.canvas){
//スケール 1:1
		var scale = pman.reName.preview;
		pman.reName.changeView(null,0,undefined,true);
//キャッシュ側からデータを得る
		if(pman.reName.canvas.undoPt > 0){
			pman.reName.canvas.loadFromJSON(pman.reName.canvas.undoStack[pman.reName.canvas.undoPt]).renderAll();;
		};
		pman.reName.changeView(null,scale,undefined,true);
	};
}
/*テキスト設定
選択されたオブジェクトが存在して、かつテキストプロパティがあれば内容を変更する
存在しない場合は新規のテキストオブジェクトを作成して現座標に配置
*/
pman.reName.canvasPaint.putText = function (content){
	if((typeof content != 'string')||(content.length == 0)) return false;
	if(
		(pman.reName.canvas.getActiveObjects().length == 1)&&
		(pman.reName.canvas.getActiveObjects()[0].text)
	){
		pman.reName.canvas.getActiveObjects()[0].text = content;
		pman.reName.canvas.renderAll();
	}else{
		var fColor = pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorF);
		pman.reName.canvas.add(new fabric.Text(content,{left:96,top:96,fill:fColor,stroke:fColor}));
		pman.reName.canvas.setActiveObject(pman.reName.canvas._objects[pman.reName.canvas._objects.length-1]);
		pman.reName.canvas.renderAll();
	};
}
/*矩形・楕円の描画*/
pman.reName.canvasPaint.setShape = function (opt,shift){
	var shapeleft = (pman.reName.canvasPaint.toolProps.downPoint.x < pman.reName.canvasPaint.toolProps.upPoint.x)?
		pman.reName.canvasPaint.toolProps.downPoint.x : pman.reName.canvasPaint.toolProps.upPoint.x;
	var shapetop  = (pman.reName.canvasPaint.toolProps.downPoint.y < pman.reName.canvasPaint.toolProps.upPoint.y)?
		pman.reName.canvasPaint.toolProps.downPoint.y : pman.reName.canvasPaint.toolProps.upPoint.y;
	shapewidth  = Math.abs(pman.reName.canvasPaint.toolProps.downPoint.x - pman.reName.canvasPaint.toolProps.upPoint.x);
	shapeheight = Math.abs(pman.reName.canvasPaint.toolProps.downPoint.y - pman.reName.canvasPaint.toolProps.upPoint.y);
	if(shift){
//shiftキー押し下げのケースでは正円｜正方形を強制する 縦横小さい方の値で
		if (shapewidth < shapeheight){
			shapewidth = shapeheight;
		}else{
			shapeheight = shapewidth;
		};
	}
//直前図形を消して描画
	if(pman.reName.canvasPaint.suspend) {
		if(pman.reName.canvasPaint.shapeDrawing) {
			pman.reName.canvas.remove(pman.reName.canvas.getObjects().slice(-1)[0]);
		}else{
			pman.reName.canvasPaint.shapeDrawing = true;
		}
	}else{
		pman.reName.canvasPaint.shapeDrawing = false;
		if((shapewidth == 0)&&(shapeheight==0)) return;//指定図形のサイズが0になる場合はフラグのみ解除してリターン
		pman.reName.canvas.remove(pman.reName.canvas.getObjects().slice(-1)[0]);
	};
	if(pman.reName.canvasPaint.currentTool == 'rect'){
		pman.reName.canvas.add(new fabric.Rect({
			top    : shapetop,
			left   : shapeleft,
			width  : shapewidth,
			height : shapeheight,
			strokeWidth : pman.reName.canvasPaint.pencilWitdh,
			stroke      : pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorF),
			fill        : (opt)? pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorB):'transparent'
		}));
	}else if(pman.reName.canvasPaint.currentTool == 'circle'){
		pman.reName.canvas.add(new fabric.Ellipse({
			top    : shapetop,
			left   : shapeleft,
			rx     : shapewidth /2,
			ry     : shapeheight/2,
			strokeWidth : pman.reName.canvasPaint.pencilWitdh,
			stroke      : pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorF),
			fill        : (opt)? pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorB):'transparent'
		}));
	}
	pman.reName.canvas.requestRenderAll();
}

/*
 *	全画面クリア
 * 対象が-asset-|-xpst-の場合はバックドロップアイテムを保護する
 */
pman.reName.canvasPaint.clearContent = function(){
	pman.reName.canvas.loadFromJSON(pman.reName.canvas.undoStack[0]).renderAll();
/*
	pman.reName.canvas.clear();
	if(pman.reName.canvasPaint.targetItem.type.match(/-asset-|-xpst-/)){
//		pman.reName.canvasPaint.backdropImage  = document.createElement('img');
//		pman.reName.canvasPaint.backdropImage.src = pman.reName.canvasPaint.targetItem.imgsrc;
		pman.reName.canvas.add(new fabric.Image(pman.reName.canvasPaint.backdropImage));
	}else{
		pman.reName.canvas.setBackgroundColor(pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.backdropColor));
	}
	pman.reName.canvas.renderAll();//*/
}
/*
 *	選択範囲をグループ化する
 */
pman.reName.canvasPaint.groupingSelection = function(){
	if(! pman.reName.canvas.getActiveObject()) {
		  return;
		}
		if( pman.reName.canvas.getActiveObject().type !== 'activeSelection') {
		  return;
		}
		pman.reName.canvas.getActiveObject().toGroup();
		pman.reName.canvas.requestRenderAll();
}
/*
 *	選択グループを解除する
 */
pman.reName.canvasPaint.ungroupingSelection = function(){
	if(! pman.reName.canvas.getActiveObject()) {
		  return;
		}
		if (pman.reName.canvas.getActiveObject().type !== 'group') {
		  return;
		}
		pman.reName.canvas.getActiveObject().toActiveSelection();
		pman.reName.canvas.requestRenderAll();
}
/*
 *	ヤンクバッファへオブジェクト化した選択内容を格納
 */
pman.reName.canvasPaint.yank = function(){
	pman.reName.canvasPaint.yankBuffer = Array.from(pman.reName.canvas.getActiveObjects(),e => e.toObject());//toDatalessObject ?
}
pman.reName.canvasPaint.copy = pman.reName.canvasPaint.yank;//コピーは現在yankと等価
/*
 *	選択範囲をヤンクバッファにコピーして削除
 */
pman.reName.canvasPaint.cut = function(){
	pman.reName.canvasPaint.yank();
	if(pman.reName.canvasPaint.yankBuffer.length)
	pman.reName.canvasPaint.removeSelection();
}
/*
 *	ヤンクバッファの内容をペースト
 */
pman.reName.canvasPaint.paste = function(){
	if(pman.reName.canvasPaint.yankBuffer.length){
		var insertObjects = [];
		fabric.util.enlivenObjects(pman.reName.canvasPaint.yankBuffer, function(objects) {
			objects.forEach(function(o) {
				pman.reName.canvas.add(o);
				insertObjects.push(o);
			});
		});
		pman.reName.canvasPaint.selectObject(insertObjects);
		pman.reName.canvas.renderAll();
	}
}
/*
 *	引数オブジェクトを選択・引数が空または文字列の場合は全部のすべてのオブジェクトを選択
 *	対象アイテムが -asset-|-xpst-の場合最背面のオブジェクトは対象外
 */
pman.reName.canvasPaint.selectObject = function(objects){
	if((! objects)||(objects == 'all')) objects = pman.reName.canvas.getObjects();
	if(pman.reName.canvasPaint.targetItem.type.match(/-asset-|-xpst-/))
		objects = objects.slice(1);//第一要素を除く
		pman.reName.canvas.discardActiveObject();
		if(objects.length == 1){
			pman.reName.canvas.setActiveObject(objects[0]);
			pman.reName.canvas.renderAll();
		}else if(objects.length > 1){
			var sel = new fabric.ActiveSelection(objects, {
				canvas: pman.reName.canvas,
			});
			pman.reName.canvas.setActiveObject(sel);
			pman.reName.canvas.requestRenderAll();
		};
}
//pman.reName.canvasPaint.selectObject();
//
/*
 *	選択範囲のオブジェクトを削除
 */
pman.reName.canvasPaint.removeSelection = function(){
	var member = pman.reName.canvas.getActiveObjects();
	if(member.length) member.forEach(e => pman.reName.canvas.remove(e));
	pman.reName.canvasPaint.historyHandler('removed');
}
/**
 *	@params {String} tl
 *	ツールキーワードを指定してツールモードを設定する
 *	
 *	
 */
pman.reName.canvasPaint.setTool = function(tl){
	if(pman.reName.canvasPaint.currentTool == tl) return;
	if(tl == 'reset') tl = pman.reName.canvasPaint.currentTool;
	if(pman.reName.canvasPaint.previousTool != tl) pman.reName.canvasPaint.previousTool = pman.reName.canvasPaint.currentTool;
	pman.reName.canvasPaint.currentTool = tl;
	pman.reName.canvasPaint.tools.forEach((t)=>{
		if(document.getElementById(t))document.getElementById(t).disabled = (t == tl)? true:false;
	});
//select,selectRect,addText,stamp,pen,eraser,rect,circle,hand
	if(pman.reName.canvas){
		pman.reName.canvas.isDrawingMode = ((tl == 'pen')||(tl == 'pencil'))? true:false;
//		if((tl == 'select')||(tl == 'selectRect'))
		pman.reName.canvas.selection = (tl == "selectRect")? true:false;
		nas.HTML.mousedragscrollable.movecancel = (tl == 'hand')?false:true;
		if(tl == 'addText'){xUI.sWitchPanel('Text','show');pman.reName.canvasPaint.setTool('select');};
		if(tl == 'stamp'){pman.reName.canvasPaint.setTool('select');};
	};
}
/**
 *	@params	{Number|String}	wdth
 *	ペンのサイズを設定する
 *	値はpixelで範囲外の値は 1,3,6に正規化
 *	またはキーワード thin|bold
 */
pman.reName.canvasPaint.setPenWidth = function(wdth){
	if(typeof wdth == 'undefined') wdth = pman.reName.canvasPaint.pencilWitdh;
	if(wdth == 'thin'){
		wdth = Math.floor(pman.reName.canvasPaint.pencilWitdh / 2);
		if(wdth < 1) wdth = 1;
	}else if(wdth == 'bold'){
		wdth = Math.floor(pman.reName.canvasPaint.pencilWitdh * 3);
		if(wdth > 3) wdth = 6;
	};
	pman.reName.canvasPaint.pencilWitdh = wdth;
	xUI.sync('paintTool');//syncに委ねる
}
/**
 *	@params	{Object|String}	col
 *	ペンのカラーを設定
 *	値は規定文字列またはcssに設定可能な文字列
 */

pman.reName.canvasPaint.setColor = function(col){
	if(col == 'backdrop') col = pman.reName.canvasPaint.backdropColor;
	pman.reName.canvasPaint.pencilColorF = col;
	xUI.sync('paintColor');//syncに委ねる
}
/*
 *	前景色と予備色を交換
 */
pman.reName.canvasPaint.swapColor = function(){
	let col = pman.reName.canvasPaint.pencilColorF;
	pman.reName.canvasPaint.pencilColorF = pman.reName.canvasPaint.pencilColorB;
	pman.reName.canvasPaint.pencilColorB = col;
	xUI.sync('paintColor');//syncに委ねる
}
/*
 *	前景色と予備色を初期値にリセット
 */
pman.reName.canvasPaint.resetColor = function(){
	pman.reName.canvasPaint.setColor('red');
	pman.reName.canvasPaint.pencilColorB = pman.reName.canvasPaint.backdropColor;
	xUI.sync('paintColor');//syncに委ねる
}
/*
 *	キーワードの色指定をhex文字列にパース
 */
pman.reName.canvasPaint.parseColor = function(col){
	if(pman.reName.canvasPaint.colors[col]){
		col = nas.colorAry2Str(pman.reName.canvasPaint.colors[col]);
	}
	return col;
}
/*
 *	syncに呼ばれるカラーパレット同期ハンドラ xUI.sync("paintColor");
 */
pman.reName.canvasPaint.syncColors = function(){
	document.getElementById('colorSelectFG').style.backgroundColor = pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorF);
	if(pman.reName.canvas){
		pman.reName.canvas.freeDrawingBrush.color = document.getElementById('colorSelectFG').style.backgroundColor;
	}
	document.getElementById('colorSelectBG').style.backgroundColor = pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.pencilColorB);
}
/*
 *	syncに呼ばれるツールパレット同期ハンドラ xUI.sync("paintColor");
 */
pman.reName.canvasPaint.syncTools = function(){
//カラーパレットの背景色を更新
	document.getElementById('backdrop').style.backgroundColor = pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.backdropColor);
	if(pman.reName.onCanvasedit){
		pman.reName.canvasPaint.setTool(pman.reName.canvasPaint.currentTool);
		pman.reName.canvas.freeDrawingBrush.width = pman.reName.canvasPaint.pencilWitdh;
		Array.from(document.getElementsByClassName('paintTool')).forEach(e=> e.disabled =(pman.reName.canvasPaint.currentTool == e.id)? true:false);
		Array.from(document.getElementsByClassName('paintCommand')).forEach(e=> e.disabled = false);
	}else{
		Array.from(document.getElementsByClassName('paintTool')).forEach(e=> e.disabled = true);
		Array.from(document.getElementsByClassName('paintCommand')).forEach(e=> e.disabled = true);
	}
//ペンの太さを更新
	var currentId = ({"1":"dot1","3":"dot2","6":"dot3"})[pman.reName.canvasPaint.pencilWitdh];
	["dot1","dot2","dot3"].forEach(e=>document.getElementById(e).disabled = (e ==currentId)? true:false);
};

/**
	ペイントコマンドの同期
*/
pman.reName.canvasPaint.syncCommand = function(){
		if(
			(!(document.getElementById('optionPanelPaint')))
		) return;// NOP

//	編集(アイテムコマンド)ボタンのアイコン状態更新
// フォーカスアイテムとして
//編集可能（初期化済み）アセットアイテムが選択されている場合は、編集開始 - SET
//通常の画像アセットアイテムの場合は、初期化ボタン - EDIT(INIT?)
//編集中では 編集状態の解除 - UNAET
//それ以外のアイテムでは、インジケータオフ（disabled）

		var targetItem = pman.reName.getItem(pman.reName.focus);
		if(targetItem === pman.reName) targetItem = null;
		if((pman.reName.focus >= 0)&&(targetItem.img)){
//処理可能なターゲットアイテムが存在
			document.getElementById('note_switch').disabled  = false;
			document.getElementById('note_item').innerHTML   = ((pman.reName.canvas)? "! ":"") +targetItem.text;

			if(targetItem.canvas instanceof(HTMLCanvasElement)){
//編集可能なcanvasプロパティを持っている
				document.getElementById('note_switch').innerHTML = (pman.reName.canvas)? 'UNSET':'SET';
			}else if(targetItem.img){
//編集状態に移行可能なimgプロパティを持っている
				document.getElementById('note_switch').innerHTML = 'EDIT';
			};
		}else{
			document.getElementById('note_switch').disabled  = true;
			document.getElementById('note_item').innerHTML   = '...';
			document.getElementById('note_switch').innerHTML = '( ---- )';
		};

//削除ボタン
		if((pman.reName.canvas)&&(pman.reName.canvas.sessionStartPoint != pman.reName.canvas.undoPt)){
			document.getElementById('note_discard').disabled = false;
		}else{
			document.getElementById('note_discard').disabled = true;
		};
//copy|cut|paste 設定
		if(
			(pman.reName.canvas)&&
			(pman.reName.canvasPaint.yankBuffer.length)
		){
			document.getElementById('note_paste').disabled = false;
		}else{
			document.getElementById('note_paste').disabled = true;
		};
		if(
			(pman.reName.canvas)&&
			(pman.reName.canvas.getActiveObjects().length)
		){
			document.getElementById('note_copy').disabled = false;
			document.getElementById('note_cut').disabled = false;
		}else{
			document.getElementById('note_copy').disabled = true;
			document.getElementById('note_cut').disabled = true;
		};
//undo|redo
		if(
			(pman.reName.canvas)
		){
			var stat=(pman.reName.canvas.undoPt == 0)? true:false ;
			document.getElementById('note_undo').disabled = stat;
			var r_stat=((pman.reName.canvas.undoPt+1) >= pman.reName.canvas.undoStack.length)? true:false ;
			document.getElementById('note_redo').disabled = r_stat;
		}else{
			document.getElementById('note_undo').disabled = true;
			document.getElementById('note_redo').disabled = true;
		};
}
/**
 *	@params	{Boolean}	asOvl
 *	推測名をオブジェクトに加えてダイアログを更新する（更新のみ）
 */
pman.reName.canvasPaint.guessItemName = function(asOvl){
	if(typeof asOvl == 'undefined') asOvl = pman.reName.canvasPaint.currentReference.asOvl;
	pman.reName.canvasPaint.currentReference.item = pman.reName.selection[0];
	var itemName = pman.reName.canvasPaint.currentReference.name;
	if((pman.reName.canvasPaint.currentReference.item)&&(asOvl)){
		itemName = pman.reName.guessOverlayName(pman.reName.canvasPaint.currentReference.item);
	}else{
		itemName = pman.reName.guessNextItemName(pman.reName.canvasPaint.currentReference.item);
	};
	pman.reName.canvasPaint.syncItemDlg(itemName,false,asOvl);
}
/**
	@params	{Stirng}	itemName
	@params	{Stirng}	backdropColor
	@params	{Boolean}	asOvl

	xUI.syncに呼ばれるダイアログ同期ハンドラ xUI.sync("newItemDialg");
	新規アイテム作成は操作を記録して再現する機能を付加するために記録用のオブジェクトを加える
	pman.reName.canvasPaintの配下にrecentItemCollectionを置き配列化して保存
	必要ならば個人情報として保存可能にする（予定）
	この関数内でのデータ操作は禁止
	ハンドリング用のオブジェクト管理のみをここで行う
 */
pman.reName.canvasPaint.syncItemDlg = function(itemName,backdropCol,asOvl){
	if(! itemName           ) itemName    = pman.reName.canvasPaint.currentReference.name;
	if(! backdropCol        ) backdropCol = pman.reName.canvasPaint.currentReference.backdropColor;
	if(typeof asOvl == 'undefined') asOvl = pman.reName.canvasPaint.currentReference.asOvl;
// アイテム名をテキストボックスに設定
	document.getElementById('newItemText').value = itemName;
// 背景色パレットを描画
	if(document.getElementById('bColorSelector').innerHTML.length==0){
		var content=""
		pman.reName.canvasPaint.bColors.forEach( c =>{
			content += "<button class ='graphicColorChip graphicColorChip-large' style='background-color:";
			content += nas.colorAry2Str(pman.reName.canvasPaint.parseColor(pman.reName.canvasPaint.colors[c]));
			if(c == backdropCol){
				content += ";' disabled=true id='papCol_";
			}else{
				content += ";' id='papCol_";
			};
			content += c;
			content += "' value = '";
			content += c;
			content += "' onclick='pman.reName.canvasPaint.syncItemDlg(false,this.value);pman.reName.insertCanvasAsset(pman.reName.canvasPaint.currentReference.item);'></button>";
		});
		content +="<br><input id=paperColorSelect type=range min=0 max="+(pman.reName.canvasPaint.bColors.length - 1)+" value="+pman.reName.canvasPaint.bColors.indexOf(pman.reName.canvasPaint.currentReference.backdropColor)+" step=1 onchange='pman.reName.canvasPaint.syncItemDlg(false,pman.reName.canvasPaint.bColors[this.value]);'>";
		document.getElementById('bColorSelector').innerHTML = content;
	}else{
		Array.from(document.getElementsByClassName('graphicColorChip-large')).forEach( e =>{
			if(e.value == backdropCol){
				e.disabled = true;
			}else{
				e.disabled = false;
			};
		});
	};
//タイプ更新
	document.getElementById('newCanvasItemOvl').disabled = (asOvl)? true:false;
	document.getElementById('newCanvasItem').disabled    = (asOvl)? false:true;
//情報キャッシュを更新
	pman.reName.canvasPaint.currentReference.name          = itemName;
	pman.reName.canvasPaint.currentReference.backdropColor = backdropCol;
	pman.reName.canvasPaint.currentReference.asOvl         = asOvl;
};
/**
 *	編集状態の切り替え
 */
	pman.reName.canvasPaint.switch = function(){
		if(pman.reName.canvas){
			pman.reName.canvasPaint.unset();
		}else{
			pman.reName.canvasPaint.set(pman.reName.getItem(pman.reName.focus));
		};
		pman.reName.canvasPaint.syncTools();
	}
	
