/*
	nas remaping専用
	画像データを保持するNotoImageオブジェクトに画像編集機能をアドオンする拡張スクリプト
	canvasプロパティにcanvasエレメントを置く（キャッシュ）
	
	編集時以外は、.img要素を表示バッファとして使用する
	
	編集キャッシュは canvasStreamプロパティを使う（SVG化も検討）
	
	perPixelTargetFind
	Objectのプロパティ　ピクセルのある部分だけを選択対象にする
	ストロークに関してはこれが望ましい
	
	イベント設定
	
 */
	
/*
 * fabricライブラリ・カスタマイズ for nas.canvas_addon 
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
//	var A=new pman.ReNameItem(document.createElement('canvas'),false);
	var A = new nas.NoteImage(null,'description');
	A.name = 'description';//toolbox 名前を設定
	A.text = A.name;//for toolbox 編集テキストを設定
	A.canvas.width  = 640;
	A.canvas.height = 480;

	var ctx = A.canvas.getContext('2d');
	ctx.fillRect(250, 250, 350, 350);
pman.reName.setItem(A);
pman.reName.items[0].setImage();


	A.canvas.width  = 640;
	A.canvas.height = 480;
	A.canvas.
	var ctx = A.canvas.getContext('2d');
	ctx.fillRect(250, 250, 350, 350);
	
	pmanreName.setItem(A);
	pmanreName.items[0].setImage();
// */
/**
 *	@params {String} link
 *	nas.NoteImage アイテムのアドレスを変更する
 *	アドレス変更が可能なアイテムは type:cell のみ
 *	それ以外はこのメソッドは機能しない
 *	引数はリンクアドレス(cell_id)
 *
 */
	nas.NoteImage.prototype.setAddress = function setAddress(link){
		if(this.type != 'cell') return false;
		if(link instanceof Array)link = link.join('_');
		this.link = link;
		this.parent.members.add(this);
		this.replaceImage()
	}
/**
 *	上書き画像用のアイテムの描画環境を再初期化する
 *	既存の編集データが存在する場合は、そのデータに従った画像を再構築する
 *	ストリームの最終画像をsvgキャッシュに対して描画する
 *	現在の編集中のSVGキャッシュは廃棄されるので呼び出しに注意
 */
	nas.NoteImage.prototype.initCanvas = function initCanvas(callback){
//あらかじめimgが設定されている必要がある?| noteImageは必ずimgプロパティを持つので判定は不要
//imgがnullで初期化されるケースがあるので対応
//	if(!(this.img)||(this.img.width==0)) return false;

//		var imgsrc = ( this.img.width*this.img.height != 0)? this.img.src :'';//現在の画像のsrcを控える

//オブジェクトのcanvas関連プロパティを初期化する 96ppiで初期化
//		if(!(this.svg)) this.svg = document.createElement('svg');
		var svgcontent = String(this.svg);
console.log(svgcontent);
//		if(this.svg instanceof HTMLElement) ;
		this.svg = document.createElement('svg');
		this.svg.style.width  = this.size.x.as('px')+'px';
		this.svg.style.height = this.size.y.as('px')+'px';
// id: pageCanvasBuffer-1... noteCanvasBuffer-0_0... descriptionCanvasBuffer-
		this.svg.id = this.type+["CanvasBuffer",this.link].join('-');
		this.svg.className = "documentOverlayCanvas";
/*var src = {
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
				"src":,imgsrc
				"crossOrigin":null,
				"filters":[]
			}
		]
	};//*/
//fablicCanvas用初期状態
//nas.NotoImage上では、canvas描画はすべてオーバーレイ表示として扱うため初期状態で以下の画像コピーは不要
/*
				{
					"type":"image",
					"version":"5.1.0",
					"originX":"left",
					"originY":"top",
					"left":0,
					"top":0,
					"width":this.size.x.as('px'),
					"height":this.size.y.as('px'),
					"src":imgsrc,
					"selectable":false,
					"crossOrigin":null
				}
*/
		if(this.canvasStream.length > 0){
			this.svg.innerHTML = svgcontent;
			console.log(this.svg);
		}else{
//空配列でスタート
			var src = {
				"version":"5.1.0",
				"objects":[]
			};
			this.canvasStream        = [JSON.stringify(src)];
			this.canvasUndoPt        = -1;
		};
		var parentId = 'memo_image';//通常のノート画像トレーラー
		if(this.type == 'page'){
			parentId = 'sheetImage-' + (parseInt(this.link) - 1);//タイムシート画像
		}else if(this.type == 'cell'){
//スクロールモードでは、表示レイヤ（エレメント）をqdr3|qdr4で振り分ける
			var qdr3 = xUI.XPS.xpsTracks.getAreaOrder(this.link).fix ;
			parentId = (qdr3)?'areaFixImageField':'noteImageField';
//		}else if(this.type == 'description'){
//			parentId = 'memo_image';
		};
console.log(document.getElementById(parentId));
		
		if(document.getElementById(parentId)){
//画像の親ノードがすでにある場合はエレメントを追加
			if(this.img) document.getElementById(parentId).appendChild(this.img);
			if(this.svg) document.getElementById(parentId).appendChild(this.svg);
//画像の位置を調整?
			this.replaceImage();
		};
		if(callback instanceof Function) callback(this);
		return this;
	}
/**
		@params  {Object nas.Offset|String}
	アイテムの画像類をドキュメント上の指定のオフセットに配置する
*/
	nas.NoteImage.prototype.replaceImage = function replaceImage(){
		var itemOrigin = new nas.Point('0mm,0mm,0mm');
		if(this.type == 'cell'){
			itemOrigin.setValue([
				(document.getElementById(this.link).offsetLeft / nas.RESOLUTION)+'in',
				(document.getElementById(this.link).offsetTop  / nas.RESOLUTION)+'in'
			]);
		};
		if(this.img){
			this.img.style.left  = itemOrigin.x.as('px')+this.offset.x.as('px')+'px';
			this.img.style.top   = itemOrigin.y.as('px')+this.offset.y.as('px')+'px';
			this.img.style.transformOrigin = this.offset.x.as('px')+"px "+this.offset.y.as('px')+"px";
			this.img.style.transform = "rotation ("+this.offset.r.as('degrees')+"deg ) scale ("+this.scale.toString()+")";
		};
		if(this.svg){
			this.svg.style.left  = itemOrigin.x.as('px')+this.offset.x.as('px')+'px';
			this.svg.style.top   = itemOrigin.y.as('px')+this.offset.y.as('px')+'px';
			this.svg.style.transformOrigin = this.offset.x.as('px')+"px "+this.offset.y.as('px')+"px";
			this.svg.style.transform = "rotation ("+this.offset.r.as('degrees')+"deg ) scale ("+this.scale.toString()+")";
		};
	}
/**
 *	@params	{object xUI}   xUI
 *	ここからxUI(UAT拡張UI)に対する拡張機能、xUIの初期化後に遅延実行する必要あり
 *	xUI.noteFocus ;//noteTextArea active
 *	xUI.viewMode  ;//page|scrolle
 *	xUI.Select    ;//sheet focus
 *	xUI.Selection ;//sheet selection
 *
 *
 *	xUI.canvasPaint.active
 *					画像編集アクティブフラグ・アクティブ状態がデフォルト？
 *					特定のオブジェクトの状態を表すインジケータではなくマスターの制御フラグ
 *					ユーザが切り替える
 *					不活性状態では画像編集が抑制される（表示は行われる）
 *	xUI.canvasPaint.keyassign
 *					画像編集時のキーアサインフラグ・'canvas'|'xpst'
 *
 *	xUI.onCanvasEdit	画像編集フラグ・いずれかのNoteImageaアイテムが編集状況下にある
 *					任意にON|OFF可能
 *
 *	xUI.canvas		編集中のバッファオブジェクト 同時に一つだけ維持できる
 *					存在しない場合がある その場合onCanvasEditは必ずfalse
 *					描画関連のイベントは、このオブジェクトが受け取る
 *					フォーカスの遷移に対して切り替えが必要だが、
 *					動作の安定のためにギリギリまで遅延が望まれる
 * faunction
 *    editStart
 *    
 */
	nas.CanvasAddon = function(xUI){
/**
 *	xUI canvas addon に伴う 拡張コード
 */
//canvas拡張にともなうフラグ・変数
    xUI.onCanvasedit = false;
    xUI.canvas       = null;
//    xUI.canvasActive = 

/**
 *    アプリの操作状態から編集対象の画像アドレスを得る
 *    @returns {String}
 */
xUI.getTargetImageAddress = function(){
	var targetAddress = '';
	if(xUI.noteFocus){
//noteText on focus
		var targetAddress = 'description:';
	}else if(xUI.viewMode == 'Scroll'){
//noteText off focus mode scroll (compatible TDTS)
		var targetAddress = 'cell:'+xUI.Select.join('_');
	}else{
//noteText off focus mode page (document Image)
		var targetAddress = 'page:'+(Math.floor(xUI.Select[1]/xUI.PageLength) + 1);
	};
	return targetAddress;
}


/*
	ペイントユーティリティー
	ペンツール
	直線ツール（縁ーハンドツールに組み込みたい）
	画面クリア　背景色のリセットも可能
	カラーは文字列または配列
	*/
	xUI.canvasPaint = {
		active:false,
		keyassign:'canvas',
		pencilColorF:"black",
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
		tools : ["select","selectRect","pen","pencil","addText","stamp","hand","eraser","rect","circle","canvasMove","canvasResize"],
		toolProps:{downPoint:{x:0,y:0},upPoint:{x:0,y:0},lineDrawId:-1},
		previousTool: "select",
		currentTool : "pen",
		pencilWitdh : 1,
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
	xUI.canvasPaint.addedHandler = function(evt){
//	主にpencilToolの直線描画の際の終了点削除(lineDrawId >= 0)
		if(
			(xUI.canvasPaint.toolProps.lineDrawId >= 0)&&
			(xUI.canvasPaint.toolProps.lineDrawId < (xUI.canvas._objects.length - 1))
		){
			xUI.canvas.remove(evt.target);
			xUI.canvasPaint.toolProps.lineDrawId = -1;
		}else{
			xUI.canvasPaint.historyHandler(evt);
		};
	}
/**
 *	@params	{Object FabricEvenet} evt
 * オブジェクト変更イベントハンドラ
 */
	xUI.canvasPaint.modifiedHandler = function(evt){
	console.log('modifiedHandler');
		xUI.canvasPaint.historyHandler(evt);
	}
/**
 *	@params	{Object FabricEvenet} evt
 * 操作historyハンドラ
 * 他のイベントハンドラから呼ばれる
 */
	xUI.canvasPaint.historyHandler = function(evt){
		if(!(xUI.canvasPaint.suspend)){
			xUI.canvas.undoPt ++ ;
			if(xUI.canvas.undoPt < xUI.canvas.undoStack.length)
				xUI.canvas.undoStack.length = xUI.canvas.undoPt;
			xUI.canvas.undoStack.push(xUI.canvas.toDatalessJSON());//pushはNG
			xUI.canvasPaint.pushContent();
		};
	}
/**
 *	@params	{Object FabricEvenet} evt
 * オブジェクト選択イベントハンドラ
 */
	xUI.canvasPaint.seletedHandler = function(){
	console.log(xUI.canvas.getActiveObjects().length);
		if(
			((xUI.canvasPaint.currentTool != 'select')&&(xUI.canvasPaint.currentTool != 'selectRect'))&&
			(xUI.canvas.getActiveObjects().length)
		){
			xUI.canvas.discardActiveObject();
			xUI.canvas.renderAll();
			xUI.canvasPaint.syncCommand();
			return false;
		};
		if(
			(xUI.canvas.getActiveObjects().length == 1)&&
			(xUI.canvas.getActiveObjects()[0].text)&&
			($("#optionPanelText").isVisible())
		){
			document.getElementById('textToolEditBox').value = xUI.canvas.getActiveObjects()[0].text;
		};
		xUI.canvasPaint.syncCommand();
	}
/*
 *
 */
	xUI.canvasPaint.undo = function(){
		if(xUI.canvas.undoPt > 0){
			xUI.canvasPaint.suspend = true;
			xUI.canvas.undoPt --;
			xUI.canvas.loadFromJSON(xUI.canvas.undoStack[xUI.canvas.undoPt]).renderAll();
			xUI.canvasPaint.pushContent();
			xUI.canvasPaint.suspend = false;
		}else{
			console.log('no undostack!')
		};
		xUI.canvasPaint.syncCommand();
	}
/*
 *
 */
	xUI.canvasPaint.redo = function(){
		if(xUI.canvas.undoPt < (xUI.canvas.undoStack.length-1)){
			xUI.canvasPaint.suspend = true;
			xUI.canvas.undoPt ++;
			xUI.canvas.loadFromJSON(xUI.canvas.undoStack[xUI.canvas.undoPt]).renderAll();
			xUI.canvasPaint.pushContent();
			xUI.canvasPaint.suspend = false;
		}else{
			console.log('empty redostack!');
		};
		xUI.canvasPaint.syncCommand();
	}
/**
 *	現在編集中のアイテム編集を保存して解除
 *	xUI.canvasを設定解除して通常モードへ戻る
 */
	xUI.canvasPaint.unset = function(){
		if(!(xUI.canvas)) return;//編集中ではない
console.log([xUI.canvas.undoPt,xUI.canvas.undoStack.length]);
//canvasの内容を表示バッファへ反映
		xUI.canvasPaint.targetItem.svg.innerHTML = xUI.canvas.toSVG();
//イベントリスナアンバインド
		xUI.canvas.off("object:added"   ,xUI.canvasPaint.addedHandler);
		xUI.canvas.off("object:modified",xUI.canvasPaint.modifiedHandler);
		xUI.canvas.off("selection:created",xUI.canvasPaint.seletedHandler);
//	xUI.canvas.off("object:removed" ,xUI.canvasPaint.historyHandler);
		xUI.canvas.off("mouse:move"    ,xUI.canvasPaint.ptHandler);
		xUI.canvas.off("mouse:down"    ,xUI.canvasPaint.ptHandler);
		xUI.canvas.off("mouse:up"      ,xUI.canvasPaint.ptHandler);
//undoバッファ解除
		xUI.canvas.undoStack = [];
		xUI.canvas.undoPt = -1;
//非表示になっていた画像エレメントを再表示
		xUI.canvasPaint.targetItem.svg.style.opacity = 1;
		xUI.canvasPaint.targetItem.svg.style.display = 'inline-block';
//編集用のエレメントをクリア
		xUI.canvas.clear() ;//編集エリアのクリア
		xUI.canvas.lowerCanvasEl.parentNode.remove();//
		xUI.canvas.remove();//エレメント削除
		delete xUI.canvas  ;//参照を削除
		xUI.canvasPaint.canvasWrap.remove();//
		xUI.canvasPaint.canvasWrap   = null;//
		xUI.canvasPaint.wrapParent   = null;// canvasトレーラー削除
		xUI.onCanvasedit = false;//編集モード終了
//
		if(!(nas.HTML.mousedragscrollable.movecancel)){
			nas.HTML.mousedragscrollable.movecancel = true;
		};//スクロールロック
//編集ポインタを解除
		xUI.canvasPaint.targetItem = null;
		xUI.canvasPaint.targetElm  = null;
//インジケータを解除
		document.getElementById('note_item').innerHTML = xUI.getTargetImageAddress();
		nas.HTML.removeClass(document.getElementById('note_item'),'note_item_edit');
		nas.HTML.addClass(document.getElementById('note_item'),'note_item_focus');
//表示を更新
		xUI.sync('paintTool');
//		xUI.sWitchPanel('Paint','close');
//処理開始時のズームを復帰
	}
/**
 *	@params {Object nas.NoteImage|String itemAddress} itm
 *  canvas編集を設定する
 *		xUI.canvasに編集するitemをセットする
 *		itm 編集対象の nas.NoteImage 
 *		itm のリンク状態に従って、リンク先にフォーカスを変更して編集モードを起動する
 *		引数がアイテムアドレスの場合は、そのアイテムを検索して使用
 		eg. xUI.canvasPaint.set('pageImage-1')
 *		アイテムが存在せず、作成可能な場合は作成まで行うか？または別に設定するか？
 */
	xUI.canvasPaint.set = function(itm,wrap){
	console.log(itm);
		if(xUI.canvas){
//すでに編集中 パネルツールを開く動作のみ行う
			xUI.sWitchPanel('Paint','show');
			return false;
		};
		if(typeof itm == 'string'){
//アイテムを作成|取得
			if(itm.indexOf('description:') == 0){
				itm = xUI.appendDescriptionImage();
			}else if(itm.indexOf('page:') == 0 ){
				itm = xUI.appendPageImage(itm);
			}else if(itm.indexOf('cell:') == 0 ){
				itm = xUI.appendCellImage(itm);
			};
		};
		if(
			(!(itm))||
			(!(itm instanceof nas.NoteImage))||
			(!(itm.parent))||
			((itm.parent.members.indexOf(itm) < 0))
		){
// 引数がない・引数が対象オブジェクトでない 対象アイテムが有効なコレクション上にない
			alert('x有効なアイテムが指定されていません');
			return false;//
		};
		if(!(itm.svg)){
//canvas編集未設定アイテム
			itm.initCanvas(xUI.canvasPaint.set);
//初期化を起動して設定自体は失敗終了させる
			return false;
		};
/*
//ケース判別
		item.type   == 'page';
		item.parent === xUI.XPS.timesheetImages;
	タイムシートデータ画像データ
	セッション内で加筆編集可能
	明示的なベイクが可能
	ベイクせずにセッションを終了した場合データは、UNDOデータを含めて保存される
	ベイクは jpeg|png|svg

		itm.type == 'cell';
		item.parent === xUI.XPS.noteImages;
	可変範囲の画像データをもつタイムシート上の注釈画像アイテム

		itm.type == 'description';
		itm.type == 'memo';
		item.parent === xUI.XPS.noteImages;
	ドキュメントに対して１点のみ登録される注釈画像

	複数登録の対応をどうするか？
	合成するか置き換えするか？

//ドキュメント画像の基本配置(ページモード)
	<div id="printPg1" class="printPage">
		<div id='pg1Header' class='headerArea'></div>
		<span class=pageNm>( p 001 )</span>
		<div class=sheetArea></div>
		<div class=overlayDocumentImage id=sheetImage-0 >
			<img id=pageImage-1 class=></img>
			<canvas id=pageCanvas-1 class=></canvas>
		</div>
	</div>
	<div id="printPg2" class="printPage"></div>
	<div id="printPg3" class="printPage"></div>
	<div id="printPg3" class="printPage"></div>
		<img
			id=imgUnderlay_#//0,1,2...↑
		>
		<img
			id="imgPreview"
			src=<BLOB>
			width="785"
			style="top: 0px; left: 0px; opacity: 0; mix-blend-mode: normal;"
		>
		<img
			id=imgOverlay_#//0,1,2...↓
		>
		<img
		>...
		<div
			id="canvasWrap"
			class="canvasWrap"
		> canvasWrapの役目を変更してトレーラーにする イベントは素通しに
			<div
				class="canvas-container"
				style="width: 785.672px; height: 556px; position: relative; user-select: none;"
			>
				<canvas
					id="imgEditableOverlay"
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
	処理拡張で通常アセットが編集可能なcanvasをアイテム内部保持可能になる
	カンバスアセットは、キャッシュ画像を持つが本体画像を持たない
	カンバスアセットをオーバーレイアイテムとして持つアセットは事後の編集をおこなってはならないが、編集可能canvasを持つことは可能なので
	運用的な制限が必要
	ここでは内部的にオーバーレイアイテムを持つか否かを判定しない
	運用上のオーバーレイモードでは、最上位のオーバーレイアイテムを選択
	ノーマルモードでは、自身が編集可能canvasを持つか否かで判断される
*/
			var tgtItm     = itm;//nas.NoteImage
//naturalSize をピクセル値であらかじめ計算しておく（ベイク時に必要だが、ここではスクリーン解像度で統一）
//			var sourceSize = [Math.round(itm.size.x.as('in')*itm.resolution.as('ppi')),Math.round(itm.size.y.as('in')*itm.resolution.as('ppi'))];
//	console.log(tgtItm);
//最終条件判定
			if(
				(tgtItm)&&
				((nas.NoteImageCash.indexOf(tgtItm) < 0 )||(!(tgtItm.svg)))
			){
console.log(tgtItm,nas.NoteImageCash.indexOf(tgtItm),tgtItm.svg);
//引数アイテムにフォーカスがない・アイテムがsvgを持たない
				alert('有効なアイテムが指定されていませんx');
console.log(itm);
				return false;
			};

			xUI.canvasPaint.targetItem = tgtItm ;//ターゲットアイテムを確定（nas.NoteImage）

// nas.NoteImageの持っている画像を背景イメージとして設定する持っていない場合(null)
// 設定不要に
			if(tgtItm.img){
//復帰時に必要となるのでフラグ兼任のオブジェクトプロパティとして設定する 
				xUI.canvasPaint.backdropImage     = true;
//				xUI.canvasPaint.backdropImage     = document.createElement('img');
//				xUI.canvasPaint.backdropImage.src = tgtItm.img.src;
			}else{
				xUI.canvasPaint.backdropImage     = false;
			};
//編集ロック
		xUI.onCanvasedit = true               ;//編集モードセット
		nas.HTML.mousedragscrollable.movecancel = true;//ドラグスクロールロック remapingではロック不要　使っていない
// 表示設定値をバックアップ preview:表示スケール point:表示位置 スクロールオフセット
		var bkup = {
			preview:xUI.viewScale,
			point:[window.scrollX,window.scrollY]
		};
	console.log(bkup);
//canvasサイズを画像と一致させるためビューを一旦画像のピクセル1:1に設定
console.log('--- chgView image size pixel 1:1')
console.log(tgtItm.resolution/nas.RESOLUTION);
		xUI.adjustScale(tgtItm.resolution/nas.RESOLUTION);
//編集アイテムのターゲット・フィールドを特定
// page: #sheetImage-[idx]	ページいっぱいのサイズで image*1 canvas*1
// cell: #noteImageField アイテムごとの位置とサイズで不定数 
// description: #memo_image 領域いっぱいのサイズで image*1 canvas*1 初期状態では image==null
		var parentId = 'memo_image';//通常のノート画像トレーラー
		if(tgtItm.type == 'page'){
			parentId = 'sheetImage-' + (parseInt(tgtItm.link) - 1);//タイムシート画像
		}else if(tgtItm.type == 'cell'){
			parentId = (xUI.XPS.xpsTracks.getAreaOrder(tgtItm.link).fix)?'areaFixImageField':'noteImageField';
//		}else if(tgtItm.type == 'description'){
//			parentId = 'memo_image';
		};
console.log(tgtItm);
console.log(parentId);

		xUI.canvasPaint.wrapParent = document.getElementById(parentId);
//		xUI.canvasPaint.baseImage  = xUI.canvasPaint.targetItem.img;//ベース画像を設定これは編集中常に固定
//		xUI.canvasPaint.targetElm  = xUI.canvasPaint.targetItem.svg;//編集対象canvas;
//
//編集用canvas初期化
			xUI.canvasPaint.canvasWrap = document.createElement('div');
			xUI.canvasPaint.wrapParent.appendChild(xUI.canvasPaint.canvasWrap);
			xUI.canvasPaint.canvasWrap.id        = 'canvasWrap';
			xUI.canvasPaint.canvasWrap.className = 'canvasWrap';

			var targetCanvas  = document.createElement('canvas');
			xUI.canvasPaint.canvasWrap.appendChild(targetCanvas);
			targetCanvas.id        = 'imgEditableOverlay';
			targetCanvas.className = 'imgEditableOverlay';

			targetCanvas.width     = tgtItm.size.x.as('px');//96ppi
			targetCanvas.height    = tgtItm.size.y.as('px');//screen resolution

if(tgtItm.type == 'cell'){
				var linkElement = document.getElementById(tgtItm.link);
console.log(linkElement);
				xUI.canvasPaint.canvasWrap.style.left  = (linkElement.offsetLeft + tgtItm.offset.x.as('px')) + 'px';
				xUI.canvasPaint.canvasWrap.style.top   = (linkElement.offsetTop  + tgtItm.offset.y.as('px')) + 'px';
};
			console.log(targetCanvas);

/*参考コード
//ドキュメント上の要素を作成
	var canv_1 = document.createElement('canvas');
	var canv_2 = document.createElement('canvas');
	var canv_3 = document.createElement('canvas');
	var canvE_1 = document.getElementById('noteImageField').appendChild(canv_1);
	var canvE_2 = document.getElementById('noteImageField').appendChild(canv_2);
	var canvE_3 = document.getElementById('noteImageField').appendChild(canv_3);
	canv_1.id = 'canv_1';
	canv_2.id = 'canv_2';
	canv_3.id = 'canv_3';
	canv_1.className = 'overlayDocmentImage';
	canv_2.className = 'overlayDocmentImage';
	canv_3.className = 'overlayDocmentImage';
	canv_1.style.top = '0px';
	canv_2.style.top = '200px';
	canv_3.style.top = '400px';

//htmlで作ったcanvas要素をidで指定して、canvasオブジェクトを生成。
	const canvas = new fabric.Canvas("canv_1");
	const canvas = new fabric.Canvas("drawingOverlay");
//サイズを設定。後から変更できる
	canvas.setWidth(800);
	canvas.setHeight(400);
	
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
	canvas.freeDrawingBrush.width = 2; // 描画する線の太さ
// 全消し
//canvas.clear();
//バックグラウンドも消えるので、
//再度canvas.setBackgroundColorする必要がある*/
//targetCanvasをチューニング編集するcanvasの内容を複製（元画像のコピーは保存時点で処理）

		xUI.canvas = new fabric.Canvas(targetCanvas.id);
//		xUI.canvas.width  = sourceSize[0];//tgtItm.img.naturalWidth;
//		xUI.canvas.height = sourceSize[1];//tgtItm.img.naturalHeight;
	
		xUI.canvas.undoStack = xUI.canvasPaint.targetItem.canvasStream;
		xUI.canvas.undoPt    = xUI.canvasPaint.targetItem.canvasUndoPt;
	
		xUI.canvas.on("object:added"     ,xUI.canvasPaint.addedHandler);
		xUI.canvas.on("object:modified"  ,xUI.canvasPaint.modifiedHandler);
		xUI.canvas.on("selection:created",xUI.canvasPaint.seletedHandler);
//	xUI.canvas.on("object:removed"   ,xUI.canvasPaint.historyHandler);
		
		xUI.canvas.on("mouse:move"    ,xUI.canvasPaint.ptHandler);
		xUI.canvas.on("mouse:down"    ,xUI.canvasPaint.ptHandler);
		xUI.canvas.on("mouse:up"      ,xUI.canvasPaint.ptHandler);
	
	
//	xUI.canvas.setWidth(itm.img.naturalWidth);
//	xUI.canvas.setHeight(itm.img.naturalHeight);
//console.log([targetCanvas.width,targetCanvas.height]);
//console.log([xUI.canvas.width,xUI.canvas.height]);
	
	
//*overlay scale & position match
/*canvas全体のスケーリングと位置合わせをcssで行う*/
/*canvas全体のスケーリングと位置合わせをfablicで行う*/
//	var scale = 96 / xUI.canvasPaint.targetItem.resolution;
//	xUI.canvasPaint.canvasWrap.style.transform = 'scale('+[scale,scale].join(',')+');';
//	xUI.canvasPaint.canvasWrap.style.transformOrigin = 'left top;';

//	editField.getContext('2d').drawImage(targetItem.canvas,0,0);//現在の内容を描画
//	xUI.canvas.getContext('2d').drawImage(targetItem.canvas,0,0);//現在の内容を描画
	
//xUI.canvas._originalCanvasStyle.top  = baseImage.style.top;
//xUI.canvas._originalCanvasStyle.left = baseImage.style.left;
	
//	editField.style.top  = baseImage.style.top;
//	editField.style.left = baseImage.style.left;
//	xUI.canvas.absolutePan(
//		new fabric.Point(baseImage.style.left,baseImage.style.top)
//	);
//	xUI.canvas._originalCanvasStyle.transformOrigin = '0 0'; //scale from top left
//	editField.style.transform = 'scale(' + scale + ')';
//	xUI.canvas.setZoom(scale);
//	xUI.canvas.initialize(targetCanvas);//,{isDrawingMode: true}
//
	
		if(xUI.canvas.undoPt < 0){
	console.log('new edit area clear edit canvas');
//			xUI.canvas.setBackgroundColor(xUI.canvasPaint.parseColor(xUI.canvasPaint.backdropColor));
			xUI.canvas.renderAll();
			xUI.canvas.undoStack.push(xUI.canvas.toDatalessJSON());//JSON.stringify(xUI.canvas);
			xUI.canvas.undoPt = 0;
	
	console.log([xUI.canvas.width,xUI.canvas.height]);
	
		}else{
	console.log('load edit area from element canvasStream');
			xUI.canvas.loadFromJSON(
				xUI.canvas.undoStack[xUI.canvas.undoPt],
				function(){
					xUI.canvas.renderAll();
//				if(xUI.canvasPaint.backdropImage){
//					xUI.canvas._objects[0].selectable = false;
//					};
				}
			);
		};
//透明度設定（これは、基本不要に）
		xUI.canvasPaint.canvasWrap.style.opacity = tgtItm.svg.style.opacity;
		tgtItm.svg.style.opacity  = '0';//(表示バッファ)を非表示化して入れ替え
//初期化前の状態にビューを復帰
	console.log([xUI.canvas.width,xUI.canvas.height]);
	console.log('--- chgView 0 B')
	console.log('--- chgView 0 C')
//初期化前の状態にビューを復帰
		xUI.adjustScale(bkup.preview);//resetSheetが含まれるので要注意　通常は、なくても良い…はず
		window.scrollTo(bkup.point);
//		pmanreName.changeView(null,bkup.preview);
//編集中アイテムインジケータを点灯
		document.getElementById('note_switch').innerHTML = 'UNSET';
		nas.HTML.removeClass(document.getElementById('note_item'),'note_item_focus');
		nas.HTML.addClass(document.getElementById('note_item'),'note_item_edit');
		document.getElementById('note_item').innerHTML = "! "+xUI.getTargetImageAddress();

//再読み込みの際にツールを再セットする必要がある
		xUI.canvasPaint.setTool('reset');
		xUI.sync('paintColor');
		xUI.sync('paintTool');
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
	xUI.canvasPaint.init = function(){
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
	xUI.canvasPaint.kbHandle = function(evt){
		if(xUI.canvasPaint.active == false) return;
		if(evt.target.id == 'textToolEditBox') return true;
		if(evt.target.id == 'iNputbOx') return true;
console.log(evt.keyCode);
		if(
			((evt.keyCode >= 48)&&(evt.keyCode < 58))
		){
			return true;
			document.getElementById('iNputbOx').value += String.fromCharCode(evt.keyCode);
			document.getElementById('iNputbOx').focus();
		};
//			document.getElementById('iNputbOx').onChange();
		if(xUI.canvas){};
			switch(evt.keyCode){
			case  8:  ;//BackSpace
			case  46: ;//Delete
//remove selection
				xUI.canvasPaint.removeSelection();return false;
			break;
			case  9:  ;//Tab
//item select rotation
				if(evt.type == 'keydown'){
					var currentObjects   = xUI.canvas.getObjects();
					if(xUI.canvasPaint.targetItem.type.match(/-asset-|-xpst-/))
						currentObjects = currentObjects.slice(1);
					var currentSelection = xUI.canvas.getActiveObjects();
					var currentSelect    = currentObjects.indexOf(currentSelection[0]);
					if(currentSelection.length >= 0){
						var offset = (evt.shiftKey)? -1:1;
						var nextSelect = currentObjects[(currentSelect + currentObjects.length + offset) % currentObjects.length];
					}else if((xUI.canvasPaint.targetItem.type.match(/-asset-|-xpst-/))&&(currentObjects.length == 0)){
//セレクト可能なアイテムが存在しないケース
						return false;
					}else{
//セレクトがない場合は一番最後のオブジェクトにフォーカスする
						var nextSelect = currentObjects[currentObjects.length-1];
					};
					if(nextSelect){
						xUI.canvas.setActiveObject(nextSelect);
						xUI.canvas.renderAll();
					};
					return false;
				};
			break;
			case 32:  ;//[Spacebar]
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('hand');
//				xUI.canvas.isDrawingMode = false;
//				nas.HTML.mousedragscrollable.movecancel = false;
				}else if(evt.type == 'keyup'){
					xUI.canvasPaint.setTool(xUI.canvasPaint.previousTool);
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
					xUI.canvasPaint.setColor(xUI.canvasPaint.penColors[(evt.keyCode - 49)]);
					return false;
				};
			break;
			case 54:  ;//[6]
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setColor(xUI.canvasPaint.backdropColor);
					return false;
				};
			break;
			case 65:  ;//[a] selectall
				if(evt.type == 'keydown'){
					if((evt.metaKey)||(evt.ctrlKey)){
						xUI.canvasPaint.selectObject('all');
						return false;
					};
				};
			break;
			case 66:  ;//[b] penTool
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('pen');return false;
				};
			break;
			case 67:  ;//[c] circleTool|cut
				if(evt.type == 'keydown'){
					if((evt.metaKey)||(evt.ctrlKey)){
						xUI.canvasPaint.copy();
						return false;
					};
					xUI.canvasPaint.setTool('circle');return false;
				};
			break;
			case 68:  ;//[d] deselectAll | resetColor
				if((evt.metaKey)||(evt.ctrlKey)){
					xUI.canvas.discardActiveObject();
					xUI.canvas.renderAll();
					return false;
				}else if(evt.type == 'keydown'){
					xUI.canvasPaint.resetColor();return false;
				};
			break;
			case 69:  ;//[e] eraserTool
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('eraser');return false;
				};
			break;
			case 72:  ;//[h] handTool
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('hand');return false;
				};
			break;
			case 77:  ;//[m] selectRect
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('selectRect');return false;
				};
			break;
			case 82:  ;//[r] rectTool
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('rect');return false;
				};
			break;
			case 83:  ;//[s] stampTool
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('stamp');return false;
				};
			break;
			case 84:  ;//[t] textTool
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setTool('addText');return false;
				};
			break;
			case 86:  ;//[v] selectTool|paste
				if(evt.type == 'keydown'){
					if((evt.metaKey)||(evt.ctrlKey)){
						xUI.canvasPaint.paste();
						return false;
					};
					xUI.canvasPaint.setTool('select');return false;
				};
			break;
			case 88:  ;//[x] swapColor|cut
				if(evt.type == 'keydown'){
					if((evt.metaKey)||(evt.ctrlKey)){
						xUI.canvasPaint.cut();
						return false;
					};
					xUI.canvasPaint.swapColor();return false;
				};
			break;
			case 89:  ;//[y] redo
				if((evt.metaKey)||(evt.ctrlKey)){
				if(evt.type == 'keydown'){
					xUI.canvasPaint.redo();return false;
				}};
			break;
			case 90:  ;//[z] undo|redo
				if(evt.type == 'keydown'){
					if((evt.metaKey)||(evt.ctrlKey)){
						if(evt.shiftKey){
							xUI.canvasPaint.redo();return false;
						}else{
							xUI.canvasPaint.undo();return false;
						};
					}else if(evt.altKey){
						xUI.canvasPaint.redo();return false;
					};
				};
			break;
			case 187:  ;//[+] plus keydown
			case 189:  ;//[-] plus keydown
				if((evt.type == 'keydown')&&((evt.ctrlKey)||(evt.metaKey))){
					let sizeOffset = 188 - evt.keyCode;// 187:1 | 189:-1
					xUI.zoomSwitch(sizeOffset);
					return false;
				};
				break;
			case 219:  ;//[[] bracket open
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setPenWidth('thin');return false;
				};
			break;
			case 221:  ;//[]] bracket close
				if(evt.type == 'keydown'){
					xUI.canvasPaint.setPenWidth('bold');return false;
				};
			break;
	
/*
//ボックスセレクト
		xUI.canvas.selection = true;
//セレクタ
		xUI.canvas.selection = false;
//ハンドツール
		nas.HTML.mousedragscrollable.movecancel = false|true;
//ペンシルツール
		xUI.canvas.isDrawingMode = true;
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
/*
	@params {Object} evt
canvas編集中のマウス・タッチイベントハンドラ トラップした際にはfalseを戻す
		tools : [
			"select":,
			"selectRect":,
			"pen":,
			"pencil":,
			"addText":ptHandle,
			"stamp":ptHandle,
			"hand":ptHandle,
			"eraser":,
			"rect":ptHandle,
			"circle":ptHandle
		],
 */
	xUI.canvasPaint.ptHandler = function(evt){
		if(xUI.canvasPaint.active == false){xUI.canvasPaint.suspend = true; return false;}

		if((evt.e.type == 'mousedown')||(evt.e.type == 'touchstart')){
			if(xUI.canvasPaint.currentTool != 'hand'){
console.log('NOHAND')
//マウスドラッグスクロールの停止
				nas.HTML.mousedragscrollable.movecancel = true;
//タッチスクロール・ホイルスクロールの停止
				document.addEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
				document.addEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });
/*
			if(
				((xUI.canvasPaint.currentTool != 'select')&&(xUI.canvasPaint.currentTool != 'selectRect'))&&
				(xUI.canvas.getActiveObjects().length)
			){
				xUI.canvas.discardActiveObject();
				xUI.canvas.renderAll();
			};// */
//			if(xUI.canvasPaint.currentTool != 'hand'){};;
				xUI.canvasPaint.toolProps.downPoint = evt.absolutePointer;

				if((xUI.canvasPaint.currentTool == 'pen')&&(evt.e.shiftKey)){
					xUI.canvasPaint.toolProps.lineDrawId = xUI.canvas._objects.length;//直線描画時にこれから描画するオブジェクトのIDでフラグを立てる
			//（フラグの回収はチェンジイベント側で行う）
				var lineOffset = xUI.canvasPaint.pencilWitdh/2;
					xUI.canvas.add(new fabric.Line([
						xUI.canvasPaint.toolProps.upPoint.x   - lineOffset,
						xUI.canvasPaint.toolProps.upPoint.y   - lineOffset,
						xUI.canvasPaint.toolProps.downPoint.x - lineOffset,
						xUI.canvasPaint.toolProps.downPoint.y - lineOffset
					],{
						strokeWidth  : xUI.canvasPaint.pencilWitdh,
						strokeLineCap: "round",
						stroke       : xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorF),
						angle        : 0
					}));
					xUI.canvas.renderAll();
				}else if(
					(!(xUI.canvasPaint.toolProps.suspend))&&
					((xUI.canvasPaint.currentTool == 'circle')||(xUI.canvasPaint.currentTool == 'rect'))
				){
	console.log('shape drawing start');
					xUI.canvasPaint.suspend = true;
				};
//ハンドツールを除く全てのツールの処理
			}else{
//ハンドツール
console.log('HAND');
				
			};
		}else if((evt.e.type == 'mouseup')||(evt.e.type == 'touchend')){
			if(xUI.canvasPaint.currentTool != 'hand'){
				xUI.canvasPaint.toolProps.upPoint = evt.absolutePointer;
				if(
					(xUI.canvasPaint.suspend)&&
					
					((xUI.canvasPaint.currentTool == 'circle')||(xUI.canvasPaint.currentTool == 'rect'))
				){
//フラグを下げて図形の描画
console.log('shape drawing end');
					xUI.canvasPaint.suspend = false;
					xUI.canvasPaint.setShape	(((evt.e.metaKey)||(evt.e.ctrlKey)),(evt.e.shiftKey));
				};
//マウスドラッグスクロール再開
				nas.HTML.mousedragscrollable.movecancel = (xUI.canvasPaint.currentTool == 'hand')? false:true;
//タッチスクロール・ホイルスクロール再開
				document.removeEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
				document.removeEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });
			};
		}else if((evt.e.type == 'mousemove')||(evt.e.type == 'touchmove')){
			if(
				(xUI.canvasPaint.suspend)&&
				((xUI.canvasPaint.currentTool == 'circle')||(xUI.canvasPaint.currentTool == 'rect'))
			){
//図形の仮描画
				xUI.canvasPaint.toolProps.upPoint = evt.absolutePointer;
				xUI.canvasPaint.setShape	(false,(evt.e.shiftKey));
				return false
			};
		};
	}

//現在の編集内容を保存更新 UNDO操作の一部になる
	xUI.canvasPaint.pushContent =function(){
		if(xUI.canvas){
//スケール 1:1
			var scale = xUI.viewScale;//スカラ
			var point = [window.scrollLeft,window.scrollTop];//
//			if(scale != 1) xUI.adjustScale(1);//resetSheet
			if(point.join('_') != '0_0') window.scrollTo([0,0]);
//			xUI.canvasPaint.targetItem.canvas = xUI.canvas.toCanvasElement(1.0);//canvs置換
			xUI.canvasPaint.targetItem.svg.innerHTML = xUI.canvas.toSVG();//キャッシュ更新
			xUI.canvasPaint.targetItem.canvasUndoPt = xUI.canvas.undoPt;//undoポインタ保存
//			xUI.canvasPaint.targetElm.src = xUI.canvas.toDataURL();
//			xUI.canvasPaint.targetItem.setImage();//キャッシュ更新
console.log(scale)
		};
	}
//現在の編集内容を編集canvasへレストア undoの実装により不要
	xUI.canvasPaint.popContent =function(){
		if(xUI.canvas){
//スケール 1:1
			var scale = xUI.viewScale;//スカラ
//			if(scale != 1) xUI.adjustScale(1);
//キャッシュ側からデータを得る
			if(xUI.canvas.undoPt > 0){
				xUI.canvas.loadFromJSON(xUI.canvas.undoStack[xUI.canvas.undoPt]).renderAll();;
			};
//			if(scale != 1) xUI.adjustScale(scale);
		};
	}
/*テキスト設定
 *	選択されたオブジェクトが存在して、かつテキストプロパティがあれば内容を変更する
 *	存在しない場合は新規のテキストオブジェクトを作成して現座標に配置
 */
	xUI.canvasPaint.putText = function (content){
console.log([window.scrollX,window.scrollY,xUI.viewScale]);

		if((typeof content != 'string')||(content.length == 0)) return false;
		if(
			(xUI.canvas.getActiveObjects().length == 1)&&
			(xUI.canvas.getActiveObjects()[0].text)
		){
			xUI.canvas.getActiveObjects()[0].text = content;
			xUI.canvas.renderAll();
		}else{
			var leftPos = (xUI.canvasPaint.targetItem.type == 'page')? Math.floor(window.scrollX/xUI.viewScale) + 96:8;
			var TopPos  = (xUI.canvasPaint.targetItem.type == 'page')? Math.floor(window.scrollY/xUI.viewScale) + 96:8;
			var fColor = xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorF);
			xUI.canvas.add(new fabric.Text(content,{left:leftPos,top :TopPos,fill:fColor,stroke:fColor}));
			xUI.canvas.setActiveObject(xUI.canvas._objects[xUI.canvas._objects.length-1]);
			xUI.canvas.renderAll();
		};
	}
/*矩形・楕円の描画*/
	xUI.canvasPaint.setShape = function (opt,shift){
		var shapeleft = (xUI.canvasPaint.toolProps.downPoint.x < xUI.canvasPaint.toolProps.upPoint.x)?
			xUI.canvasPaint.toolProps.downPoint.x : xUI.canvasPaint.toolProps.upPoint.x;
		var shapetop  = (xUI.canvasPaint.toolProps.downPoint.y < xUI.canvasPaint.toolProps.upPoint.y)?
			xUI.canvasPaint.toolProps.downPoint.y : xUI.canvasPaint.toolProps.upPoint.y;
		shapewidth  = Math.abs(xUI.canvasPaint.toolProps.downPoint.x - xUI.canvasPaint.toolProps.upPoint.x);
		shapeheight = Math.abs(xUI.canvasPaint.toolProps.downPoint.y - xUI.canvasPaint.toolProps.upPoint.y);
		if(shift){
//shiftキー押し下げのケースでは正円｜正方形を強制する 縦横小さい方の値で
			if (shapewidth < shapeheight){
				shapewidth = shapeheight;
			}else{
				shapeheight = shapewidth;
			};
		}
//直前図形を消して描画
		if(xUI.canvasPaint.suspend) {
			if(xUI.canvasPaint.shapeDrawing) {
				xUI.canvas.remove(xUI.canvas.getObjects().slice(-1)[0]);
			}else{
				xUI.canvasPaint.shapeDrawing = true;
			}
		}else{
			xUI.canvasPaint.shapeDrawing = false;
			if((shapewidth == 0)&&(shapeheight==0)) return;//指定図形のサイズが0になる場合はフラグのみ解除してリターン
			xUI.canvas.remove(xUI.canvas.getObjects().slice(-1)[0]);
		};
		if(xUI.canvasPaint.currentTool == 'rect'){
			xUI.canvas.add(new fabric.Rect({
				top    : shapetop,
				left   : shapeleft,
				width  : shapewidth,
				height : shapeheight,
				strokeWidth : xUI.canvasPaint.pencilWitdh,
				stroke      : xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorF),
				fill        : (opt)? xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorB):'transparent'
			}));
		}else if(xUI.canvasPaint.currentTool == 'circle'){
			xUI.canvas.add(new fabric.Ellipse({
				top    : shapetop,
				left   : shapeleft,
				rx     : shapewidth /2,
				ry     : shapeheight/2,
				strokeWidth : xUI.canvasPaint.pencilWitdh,
				stroke      : xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorF),
				fill        : (opt)? xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorB):'transparent'
			}));
		}
		xUI.canvas.requestRenderAll();
	}
	
/*
 *	全画面クリア
 * 対象が-asset-|-xpst-の場合はバックドロップアイテムを保護する
 */
	xUI.canvasPaint.clearContent = function(){
		xUI.canvas.loadFromJSON(xUI.canvas.undoStack[0]).renderAll();
/*
		xUI.canvas.clear();
		if(xUI.canvasPaint.targetItem.type.match(/-asset-|-xpst-/)){
//		xUI.canvasPaint.backdropImage  = document.createElement('img');
//		xUI.canvasPaint.backdropImage.src = xUI.canvasPaint.targetItem.imgsrc;
			xUI.canvas.add(new fabric.Image(xUI.canvasPaint.backdropImage));
		}else{
			xUI.canvas.setBackgroundColor(xUI.canvasPaint.parseColor(xUI.canvasPaint.backdropColor));
		}
		xUI.canvas.renderAll();//*/
	}
/*
 *	選択範囲をグループ化する
 */
	xUI.canvasPaint.groupingSelection = function(){
		if(! xUI.canvas.getActiveObject()) {
			  return;
			}
			if( xUI.canvas.getActiveObject().type !== 'activeSelection') {
			  return;
			}
			xUI.canvas.getActiveObject().toGroup();
			xUI.canvas.requestRenderAll();
	}
/*
 *	選択グループを解除する
 */
	xUI.canvasPaint.ungroupingSelection = function(){
		if(! xUI.canvas.getActiveObject()) {
			  return;
			}
			if (xUI.canvas.getActiveObject().type !== 'group') {
			  return;
			}
			xUI.canvas.getActiveObject().toActiveSelection();
			xUI.canvas.requestRenderAll();
	}
/*
 *	ヤンクバッファへオブジェクト化した選択内容を格納
 */
	xUI.canvasPaint.yank = function(){
		xUI.canvasPaint.yankBuffer = Array.from(xUI.canvas.getActiveObjects(),e => e.toObject());//toDatalessObject ?
		xUI.canvasPaint.syncCommand();
	}
	xUI.canvasPaint.copy = xUI.canvasPaint.yank;//コピーは現在yankと等価
/*
 *	選択範囲をヤンクバッファにコピーして削除
 */
	xUI.canvasPaint.cut = function(){
		xUI.canvasPaint.yank();
		if(xUI.canvasPaint.yankBuffer.length)
		xUI.canvasPaint.removeSelection();
		xUI.canvasPaint.syncCommand();
	}
/*
 *	ヤンクバッファの内容をペースト
 */
	xUI.canvasPaint.paste = function(){
		if(xUI.canvasPaint.yankBuffer.length){
			var insertObjects = [];
			fabric.util.enlivenObjects(xUI.canvasPaint.yankBuffer, function(objects) {
				objects.forEach(function(o) {
					xUI.canvas.add(o);
					insertObjects.push(o);
				});
			});
			xUI.canvasPaint.selectObject(insertObjects);
			xUI.canvas.renderAll();
		};
		xUI.canvasPaint.syncCommand();
	}
/*
 *	引数オブジェクトを選択・引数が空または文字列の場合は全部のすべてのオブジェクトを選択
 *	対象アイテムが -asset-|-xpst-の場合最背面のオブジェクトは対象外
 */
	xUI.canvasPaint.selectObject = function(objects){
		if((! objects)||(objects == 'all')) objects = xUI.canvas.getObjects();
		if(xUI.canvasPaint.targetItem.type.match(/-asset-|-xpst-/))
			objects = objects.slice(1);//第一要素を除く
		xUI.canvas.discardActiveObject();
		if(objects.length == 1){
			xUI.canvas.setActiveObject(objects[0]);
			xUI.canvas.renderAll();
		}else if(objects.length > 1){
			var sel = new fabric.ActiveSelection(objects, {
				canvas: xUI.canvas,
			});
			xUI.canvas.setActiveObject(sel);
			xUI.canvas.requestRenderAll();
		};
		xUI.canvasPaint.syncCommand();
	}
//xUI.canvasPaint.selectObject();
//
/*
 *	選択範囲のオブジェクトを削除
 */
	xUI.canvasPaint.removeSelection = function(){
		var member = xUI.canvas.getActiveObjects();
		if(member.length) member.forEach(e => xUI.canvas.remove(e));
		xUI.canvasPaint.historyHandler('removed');
	}
/**
 *	@params {String} tl
 *	ツールキーワードを指定してツールモードを設定する
 *	キーワードは、ツールパレットのエレメントIDと一致
 *	
 */
	xUI.canvasPaint.setTool = function(tl){

console.log([tl,xUI.canvasPaint.currentTool,xUI.canvasPaint.previousTool]);

		if(xUI.canvasPaint.active == false)   return;//inactive
		if(xUI.canvasPaint.currentTool == tl) return;//same
		if((tl.match(/canvas(Move|Resize)/))&&(xUI.viewMode == 'PageImage')) return;

		if(tl == 'reset') tl = xUI.canvasPaint.currentTool;
		if(xUI.canvasPaint.currentTool != tl) xUI.canvasPaint.previousTool = xUI.canvasPaint.currentTool;
		xUI.canvasPaint.currentTool = tl;
		if(!(tl.match(/addText|stamp/))){
			document.getElementById(xUI.canvasPaint.previousTool).disabled = false;
			nas.HTML.removeClass(document.getElementById(xUI.canvasPaint.previousTool),'iconButton-selected');
			document.getElementById(xUI.canvasPaint.currentTool).disabled  = true;
			nas.HTML.addClass(document.getElementById(xUI.canvasPaint.currentTool),'iconButton-selected');
		};
// */

//		xUI.canvasPaint.tools.forEach((t)=>{if(document.getElementById(t))document.getElementById(t).disabled = (t == tl)? true:false;});
//select,selectRect,addText,stamp,pen,eraser,rect,circle,hand,canvasMove,canvasResize
		if(xUI.canvas){
			xUI.canvas.isDrawingMode = ((tl == 'pen')||(tl == 'pencil'))? true:false;
//		if((tl == 'select')||(tl == 'selectRect'))
			xUI.canvas.selection = (tl == "selectRect")? true:false;

			nas.HTML.mousedragscrollable.movecancel = (tl == 'hand')?false:true;
			if(tl == 'addText'){xUI.sWitchPanel('Text' ,'show');xUI.canvasPaint.setTool('select');};
			if(tl == 'stamp'  ){xUI.sWitchPanel('Stamp','show');xUI.canvasPaint.setTool('select');};
		};
	}
/**
 *	@params	{Number|String}	wdth
 *	ペンのサイズを設定する
 *	値はpixelで範囲外の値は 1,2,3に正規化
 *	またはキーワード thin|bold
 */
	xUI.canvasPaint.setPenWidth = function(wdth){
		if(typeof wdth == 'undefined') wdth = xUI.canvasPaint.pencilWitdh;
		let min = 1 ;let max = 3 ;
		if(wdth == 'thin'){
			wdth = Math.floor(xUI.canvasPaint.pencilWitdh - 1);
			if(wdth < min) wdth = min;
		}else if(wdth == 'bold'){
			wdth = Math.floor(xUI.canvasPaint.pencilWitdh + 1);
			if(wdth > max) wdth = max;
		};
		xUI.canvasPaint.pencilWitdh = wdth;
		xUI.sync('paintTool');//syncに委ねる
	}
/**
 *	@params	{Object|String}	col
 *	ペンのカラーを設定
 *	値は規定文字列またはcssに設定可能な文字列
 */
	
	xUI.canvasPaint.setColor = function(col){
		if(col == 'backdrop') col = xUI.canvasPaint.backdropColor;
		xUI.canvasPaint.pencilColorF = col;
		xUI.sync('paintColor');//syncに委ねる
	}
/*
 *	前景色と予備色を交換
 */
	xUI.canvasPaint.swapColor = function(){
		let col = xUI.canvasPaint.pencilColorF;
		xUI.canvasPaint.pencilColorF = xUI.canvasPaint.pencilColorB;
		xUI.canvasPaint.pencilColorB = col;
		xUI.sync('paintColor');//syncに委ねる
	}
/*
 *	前景色と予備色を初期値にリセット
 */
	xUI.canvasPaint.resetColor = function(){
		xUI.canvasPaint.setColor('red');
		xUI.canvasPaint.pencilColorB = xUI.canvasPaint.backdropColor;
		xUI.sync('paintColor');//syncに委ねる
	}
/*
 *	キーワードの色指定をhex文字列にパース
 */
	xUI.canvasPaint.parseColor = function(col){
		if(xUI.canvasPaint.colors[col]){
			col = nas.colorAry2Str(xUI.canvasPaint.colors[col]);
		}
		return col;
	}
/*
 *	syncに呼ばれるカラーパレット同期ハンドラ xUI.sync("paintColor");
 */
	xUI.canvasPaint.syncColors = function(){
		if(!(document.getElementById('optionPanelPaint'))) return;//NOP
		document.getElementById('colorSelectFG').style.backgroundColor = xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorF);
		if(xUI.canvas){
			xUI.canvas.freeDrawingBrush.color = document.getElementById('colorSelectFG').style.backgroundColor;
		}
		document.getElementById('colorSelectBG').style.backgroundColor = xUI.canvasPaint.parseColor(xUI.canvasPaint.pencilColorB);

		document.getElementById('backdrop').style.backgroundColor = xUI.canvasPaint.parseColor(xUI.canvasPaint.backdropColor);
	}
/*
 *	syncに呼ばれるツールパレット同期ハンドラ xUI.sync("paintTool");
 */
	xUI.canvasPaint.syncTools = function(){
		if(!(document.getElementById('optionPanelPaint'))) return;//NOP
//カラーパレットの背景色を更新
		document.getElementById('backdrop').style.backgroundColor = xUI.canvasPaint.parseColor(xUI.canvasPaint.backdropColor);
		if((xUI.viewOnly)){
			Array.from(document.getElementsByClassName('paintTool')   ).forEach(e=> e.disabled = true);
			Array.from(document.getElementsByClassName('paintCommand')).forEach(e=> e.disabled = true);
			Array.from(document.getElementsByClassName('itemCommand') ).forEach(e=> e.disabled = true);
		}else{
			if(
				(xUI.onCanvasedit)
			){
				xUI.canvasPaint.setTool(xUI.canvasPaint.currentTool);
				xUI.canvas.freeDrawingBrush.width = xUI.canvasPaint.pencilWitdh;
				Array.from(document.getElementsByClassName('paintTool')).forEach(function(e){
					if((xUI.viewMode == 'PageImage')&&(e.id.match(/canvas(Move|Resize)/))){
						e.disabled = true;
						nas.HTML.removeClass(e,'iconButton-selected');
					}else if(xUI.canvasPaint.currentTool == e.id){
						e.disabled = true;
						nas.HTML.addClass(e,'iconButton-selected');
					}else{
						e.disabled = false;
						nas.HTML.removeClass(e,'iconButton-selected');
					};
				});
				Array.from(document.getElementsByClassName('paintCommand')).forEach(e=> e.disabled = false);
//				Array.from(document.getElementsByClassName('itemCommand') ).forEach(e=> e.disabled = true);
			}else{
				Array.from(document.getElementsByClassName('paintTool')   ).forEach(e=> e.disabled = true);
				Array.from(document.getElementsByClassName('paintCommand')).forEach(e=> e.disabled = true);
//				Array.from(document.getElementsByClassName('itemCommand') ).forEach(e=> e.disabled = false);
			};
//ペンの太さを更新
			var currentId = ({"1":"dot1","2":"dot2","3":"dot3"})[xUI.canvasPaint.pencilWitdh];
			["dot1","dot2","dot3"].forEach(e=>document.getElementById(e).disabled = (e ==currentId)? true:false);
		};
	};
/**
	ペイントコマンドの同期
*/
	xUI.canvasPaint.syncCommand = function(){
		if(
			(!(document.getElementById('optionPanelPaint')))
		) return;// NOP
//ノート編集(アイテムコマンド)ボタンのアイコン更新
//scroll(TDTS互換)モード 任意のアイテムがシートセルに登録されるので、フォーカスしているアイテムのNoteImageが登録されている場合は編集ボタン、それ以外は追加ボタン
//pageモード ページ毎に１点のアイテムが登録されるので随時編集ボタン
//双方のモードでnoteForcusがある場合は、ノート領域に対する編集ボタン
		var hasItem = false;
		var itemAddress = xUI.getTargetImageAddress();

		if(itemAddress.indexOf('page:') == 0){
			hasItem = xUI.XPS.timesheetImages.getByLinkAddress(itemAddress);
		}else{
			hasItem = xUI.XPS.noteImages.getByLinkAddress(itemAddress);
		};
if(dbg) console.log(hasItem);
		if(xUI.canvasPaint.active == false){
			document.getElementById('note_switch').disabled = true;
		}else{
			document.getElementById('note_switch').disabled = false;
		};
		if((itemAddress == 'description:')||(itemAddress.indexOf('page:') == 0)){
			document.getElementById('note_switch').innerHTML = 'EDIT';
		};
//編集開始｜アイテム追加ボタンのアイコン
		if((xUI.viewMode == 'Scroll')){
			if(hasItem){
//				nas.HTML.removeClass(document.getElementById('note_edit'),'iconButton-addItem');
//				nas.HTML.addClass(document.getElementById('note_edit'),'iconButton-editItem');
				document.getElementById('note_switch').innerHTML = 'EDIT';
			}else{
//				nas.HTML.removeClass(document.getElementById('note_edit'),'iconButton-editItem');
//				nas.HTML.addClass(document.getElementById('note_edit'),'iconButton-addItem');
				document.getElementById('note_switch').innerHTML = 'APPEND+EDIT';
			};
		};
//保存ボタン
		if(xUI.canvas){
			document.getElementById('note_switch').innerHTML = 'UNSET';
		}else{
			document.getElementById('note_item').innerHTML = itemAddress;
		};
//削除ボタン
		if((hasItem)&&(!(xUI.canvas))&&(xUI.canvasPaint.active == true)){
			document.getElementById('note_discard').disabled = false;
		}else{
			document.getElementById('note_discard').disabled = true;
		};
//copy|cut|paste 設定
		if(
			(xUI.canvasPaint.active == true)&&
			(xUI.canvas)&&
			(xUI.canvasPaint.yankBuffer.length)
		){
			document.getElementById('note_paste').disabled = false;
		}else{
			document.getElementById('note_paste').disabled = true;
		};
		if(
			(xUI.canvasPaint.active == true)&&
			(xUI.canvas)&&
			(xUI.canvas.getActiveObjects().length)
		){
			document.getElementById('note_copy').disabled = false;
			document.getElementById('note_cut').disabled = false;
		}else{
			document.getElementById('note_copy').disabled = true;
			document.getElementById('note_cut').disabled = true;
		};
//undo|redo
		if(
			(xUI.canvasPaint.active == true)&&
			(xUI.canvas)
		){
			var stat=(xUI.canvas.undoPt == 0)? true:false ;
			document.getElementById('note_undo').disabled = stat;
			var r_stat=((xUI.canvas.undoPt+1)>=xUI.canvas.undoStack.length)? true:false ;
			document.getElementById('note_redo').disabled = r_stat;
		}else{
			document.getElementById('note_undo').disabled = true;
			document.getElementById('note_redo').disabled = true;
		};
//ショートカットキー設定
/*		if(xUI.canvasPaint.keyassign == 'canvas'){
			document.getElementById('setSCpaint').disabled = false;
			document.getElementById('setSCinput').disabled = true;
		}else{
			document.getElementById('setSCpaint').disabled = true;
			document.getElementById('setSCinput').disabled = false;
		};// */
//zoom|アピアランスコントロール 不要
	}
/**
 *	@params	{Boolean}	asOvl
 *	推測名をオブジェクトに加えてダイアログを更新する（更新のみ）
 */
	xUI.canvasPaint.guessItemName = function(asOvl){
		if(typeof asOvl == 'undefined') asOvl = xUI.canvasPaint.currentReference.asOvl;
		xUI.canvasPaint.currentReference.item = pmanreName.selection[0];
		var itemName = xUI.canvasPaint.currentReference.name;
		if((xUI.canvasPaint.currentReference.item)&&(asOvl)){
			itemName = pmanreName.guessOverlayName(xUI.canvasPaint.currentReference.item);
		}else{
			itemName = pmanreName.guessNextItemName(xUI.canvasPaint.currentReference.item);
		};
		xUI.canvasPaint.syncItemDlg(itemName,false,asOvl);
	}
/**
		@params	{Stirng}	itemName
		@params	{Stirng}	backdropColor
		@params	{Boolean}	asOvl
	
		xUI.syncに呼ばれるダイアログ同期ハンドラ xUI.sync("newItemDialg");
		新規アイテム作成は操作を記録して再現する機能を付加するために記録用のオブジェクトを加える
		xUI.canvasPaintの配下にrecentItemCollectionを置き配列化して保存
		必要ならば個人情報として保存可能にする（予定）
		この関数内でのデータ操作は禁止
		ハンドリング用のオブジェクト管理のみをここで行う
 */
	xUI.canvasPaint.syncItemDlg = function(itemName,backdropCol,asOvl){
		if(! itemName           ) itemName    = xUI.canvasPaint.currentReference.name;
		if(! backdropCol        ) backdropCol = xUI.canvasPaint.currentReference.backdropColor;
		if(typeof asOvl == 'undefined') asOvl = xUI.canvasPaint.currentReference.asOvl;
// アイテム名をテキストボックスに設定
		document.getElementById('newItemText').value = itemName;
// 背景色パレットを描画
		if(document.getElementById('bColorSelector').innerHTML.length==0){
			var content=""
			xUI.canvasPaint.bColors.forEach( c =>{
				content += "<button class ='graphicColorChip graphicColorChip-large' style='background-color:";
				content += nas.colorAry2Str(xUI.canvasPaint.parseColor(xUI.canvasPaint.colors[c]));
				if(c == backdropCol){
					content += ";' disabled=true id='papCol_";
				}else{
					content += ";' id='papCol_";
				};
				content += c;
				content += "' value = '";
				content += c;
				content += "' onclick='xUI.canvasPaint.syncItemDlg(false,this.value);pmanreName.insertCanvasAsset(xUI.canvasPaint.currentReference.item);'></button>";
			});
			content +="<br><input id=paperColorSelect type=range min=0 max="+(xUI.canvasPaint.bColors.length - 1)+" value="+xUI.canvasPaint.bColors.indexOf(xUI.canvasPaint.currentReference.backdropColor)+" step=1 onchange='xUI.canvasPaint.syncItemDlg(false,xUI.canvasPaint.bColors[this.value]);'>";
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
		xUI.canvasPaint.currentReference.name          = itemName;
		xUI.canvasPaint.currentReference.backdropColor = backdropCol;
		xUI.canvasPaint.currentReference.asOvl         = asOvl;
	};
/**
 *	編集状態の切り替え
 */
	xUI.canvasPaint.switch = function(){
		if(xUI.canvas){
			xUI.canvasPaint.unset();
		}else{
			xUI.canvasPaint.set(xUI.getTargetImageAddress());
		};
		xUI.canvasPaint.syncTools();
	}
/**
	画像イメージをハイライトする
	引数のない場合はハイライトをクリア
 */
xUI.hilightImage = function(address){
	var type = address.split(':')[0];
	var collection = (type == 'page')? xUI.XPS.timesheetImages:xUI.XPS.noteImages;
	var itm = collection.getByLinkAddress(address);
//	if(itm)
	collection.members.forEach(function(e){
		if(e === itm){
			nas.HTML.addClass(e.svg,'documentOverlayCanvas-hover');
		}else{
			nas.HTML.removeClass(e.svg,'documentOverlayCanvas-hover');
		};
	});
}
/**
 *	@returns {Object nas.NoteImage|null}
 * 空のデスクリプション画像をコレクションに加える
 * すでに画像登録のある場合新たな登録はできない・既存の画像を返す
 *
 * サイズは、画面優先
 */
xUI.appendDescriptionImage = function(){
	var result = xUI.XPS.noteImages.getByLinkAddress('description:');
	if(result) return result;//既存ならそれを戻す
	result = new nas.NoteImage(
		null,
		'description:',
		(document.getElementById('memo').clientWidth /96)+"in,"+
		(document.getElementById('memo').clientHeight/96)+"in",
		xUI.XPS.noteImages
	);
	return result;
}
/**
 *	@params {Number} pgNo
 *	@returns {Object nas.NoteImage|null}
 * 空のドキュメント画像をコレクションに加える
 * すでに画像登録のあるページには新たな登録はできない・既存のページ画像を返す
 *
 * サイズは、A3固定
 */

xUI.appendPageImage = function(pgNo){
	if(xUI.viewMode == 'Scrolle') return false;
	if(typeof pgNo == 'undefined') pgNo = Math.ceil(xUI.Select[1]/xUI.PageLength);
	pgNo = nas.parseNumber(pgNo)
	if(((! pgNo))||(pgNo < 0)||(pgNo > Math.ceil(xUI.XPS.duration/xUI.PageLength)))return false;
	var result = xUI.XPS.timesheetImages.getByLinkAddress('page:'+pgNo);
	if(result) return result;//既存なら戻す
	return new nas.NoteImage(
		null,
		'page:'+pgNo,
		'297mm,420mm',
		xUI.XPS.timesheetImages
	);
}
/**
 *	@params {Array|String} select
 *	@params {Array} range
 *	@returns {Object nas.NoteImage|null}
 * TDTS互換のノート画像をコレクションに加える
 * すでに画像登録のあるアイテムには新たな登録はできない・既存のノート画像を返す
 *
 * サイズを計算 不正範囲指定は自動補正される
 * トラックタイプによりサイズ計算が異なる
 * TDTS互換部分としてレンジ設定が１秒に満たない場合は定サイズの画像に拡張が行われる
 * 基点はターゲット要素の左上
 * レンジが負数になった場合オフセット量にくりこむ
 * 指定のトラックがfixエリアに入る場合は、カメラワークトラックに準ずるトラック固定領域を生成する
 * フレームレンジはカメラワークでなく他のトラックに準ずる
 */
xUI.appendCellImage = function(select,range){
	if(xUI.viewMode == 'PageImage') return false;
	if(! select) select = Array.from(xUI.Select);
	if(! range)  range  = Array.from(xUI.Selection);
	if((typeof select == 'string')&&(select.indexOf('cell:')==0)){
		select = Array.from(select.split(':')[1].split('_'),(e)=> parseInt(e));
	};
//指定アドレスが許容範囲外かどうかを確認
	if(
		(select[0] < 0)||(select[0] >= xUI.XPS.xpsTracks.length)||
		(select[1] < 0)||(select[1] >= xUI.XPS.duration())
	) return false;
console.log(select,range);
	var result = xUI.XPS.noteImages.getByLinkAddress('cell:'+select.join('_'));
	if(result) return result;//既存ならそれを戻す
console.log(result);
	var trackType = Xps.AreaOptions[xUI.XPS.xpsTracks[select[0]].option];
	var area = xUI.XPS.xpsTracks.areaOrder.find(function(e){return (e.members.indexOf(xUI.XPS.xpsTracks[select[0]])>=0)});
	var trackWidth  = range[0] + 1;//
	var frameHeight = range[1] + 1;
	if((trackType == 'camera')||((area)&&(area.fix))){
		trackWidth  = 1;
//		if(frameHeight == 1) frameHeight = xUI.XPS.framerate.rate + 1 ;//１秒１コマ
		if(frameHeight <= xUI.XPS.framerate.rate) frameHeight = xUI.XPS.duration() - select[1] ;//開始フレームからシート末尾
	}else{
		if(frameHeight <= (xUI.XPS.framerate.rate+1)){
			frameHeight = xUI.XPS.framerate.rate + 1 ;//１秒１コマ
		};
		if(
			(frameHeight <= (xUI.XPS.framerate.rate+1))&&
			(trackWidth < 4)
		){
			trackWidth  = 'default';
		}else if(
			(frameHeight > (xUI.XPS.framerate.rate+1))&&
			(trackWidth == 1)
		){
			trackWidth  = 'harf';
		};
	};
	result = new nas.NoteImage(
		null,
		'cell:'+select.join('_'),
		new nas.Size(),
		xUI.XPS.noteImages
	)
console.log(select,range);
	var tgt1 = document.getElementById(select.join('_'));//範囲左上
	var tgt2 = document.getElementById(nas.add(select,range).join('_'));//範囲右下
console.log(tgt1,tgt2);
//サイズ設定
	if(typeof trackWidth == 'string'){
		result.size.x.setValue(((trackWidth == 'harf')? '1.1in':'2.2in'),'mm');
	}else{
		var pixWidth = (range[0] < 0)?
			tgt2.offsetLeft - tgt1.offsetLeft + tgt1.offsetWidth:
			tgt1.offsetLeft - tgt2.offsetLeft + tgt2.offsetWidth;
		result.size.x.setValue(pixWidth/96 + 'in','mm');
	};

//	result.size.y.setValue(((xUI.XPS.sheetLooks.SheetCellHeight * frameHeight) / 96)+'in','mm');
	result.size.y.setValue(((document.getElementById('0_0').offsetHeight * frameHeight) / 96)+'in','mm');
//配置設定
	if(range[0] < 0){
		result.offset.x.setValue(((tgt2.offsetLeft-tgt1.offsetLeft)/96)+'in','mm');
	};
	if(range[1] < 0){
		result.offset.y.setValue(((tgt2.offsetTop-tgt1.offsetTop)/96)+'in','mm');
	};
console.log(result);
//	xUI.selectCell(select);//
//	xUI.range(nas.add(select,range));//
	return result;
}

/*
		NoteImage挿入用ラップ関数
		
		@params  {String} refItem link
			リンクアドレス page:1,cell:1_3,description: 等の:分離形式
		@params  {Array}  nameText range
			
		@params  {String}  paperCol bgColor不要　常にトランスペアレント　または darker
		@params  {Boolean} asOvl 常に ovl
		@returns {Object nas.NoteImage|undefined} 
	
		nas NoteImageは、使用するドキュメントごとに挙動が異なるので注意
		作成時にリンク対象のアイテムを要求する
		アイテムのリンク先は、アイテム表示位置及びスケールの基礎となるので必要
		new nas.NotoImage は、ローレベル関数として使用するが、直接の呼び出しでNoteImageアイテムを作成するのは非推奨
		指定のアドレスからサイズを割り出して xUIにputするフロントエンドメソッド
	*/
	xUI.insertNoteImage = function(link,nameText,paperCol,asOvl){
console.log(arguments);
		if(arguments.length == 0){
//引数無しで呼ばれた場合、条件チェックして呼び出し可能ならダイアログを表示して終了（ダイアログで引数を編集して再度呼ばれる）
			if(
				(pmanreName.focus >= 0)&&
				(pmanreName.selection[0].type == '-asset-')
				
			){
//syncItemDlg(アイテム名,用紙色,修正フラグ)
				xUI.canvasPaint.guessItemName(asOvl);
//			var itmName = pmanreName.guessOverlayName(pmanreName.selection[0])
//			xUI.canvasPaint.syncItemDlg(itemName);
				xUI.sWitchPanel('Item','open');
			}else{
				alert('選択されたアイテムがないか、有効なアセットではありません')
			};
			return;
		};
//pmanreName.insertCanvasAsset(xUI.canvasPaint.currentReference.item);
		if(
			(!(refItem instanceof pmanreNameItem))||
			(refItem.type != '-asset-')||
			(!(refItem.img))
		){
//参照アイテム引数の検査
			return false;
		};
		if(typeof nameText == 'undefined') nameText = xUI.canvasPaint.currentReference.name;
		if(typeof paperCol == 'undefined') paperCol = xUI.canvasPaint.currentReference.backdropColor;
		if(typeof asOvl == 'undefined')    asOvl    = xUI.canvasPaint.currentReference.asOvl;
	  if(asOvl){
//既存原稿の修正として初期化
		if(refItem.isOvl()) refItem = refItem.getOvlParent();
		var ovls = pmanreName.getOverlay(refItem);
//すでに編集中のアイテムが存在する場合はリジェクト
		if((ovls.length)&&(ovls[ovls.length-1].svg)){
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
				nas.RZf(rfcd.body,pmanreName.renameDigits),
				suffix
			].join('-');
		};
		if(typeof paperCol == 'undefined'){
			paperCol = xUI.canvasPaint.backdropColor;
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
		xUI.canvasPaint.backdropColor = paperCol;
		var canvas = document.createElement('canvas');
		canvas.name   = nameText;
		canvas.width  = refItem.img.naturalWidth;
		canvas.height = refItem.img.naturalHeight;
		var ctx = canvas.getContext("2d");
		//背景を描く
		ctx.fillStyle = xUI.canvasPaint.parseColor(paperCol);
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		var insertItem = new pmanreNameItem(canvas,false);
		var result = pmanreName.setItem(
			[insertItem],
			function(r){
				r.forEach(e =>{
					e.setImage().then(j => {
						j.move(refItem,(pman.numOrderUp)?'PLACEBEFORE':'PLACEAFTER');
						j.canvasStream = [
							JSON.stringify({
								version: '5.1.0',
								objects: [],
								background: xUI.canvasPaint.parseColor(paperCol)
							})
						];
						j.canvasUndoPt = -1;
						pmanreName.itemAlignment();//整列が必要
						if(! asOvl) setTimeout(function(){pmanreName.select(j)},75);
					});
				});
			}
		)//.then(function(i){console.log(i);if(! asOvl) pmanreName.select(i[0]);});
	console.log(result);
	
//情報キャッシュを更新
		xUI.canvasPaint.currentReference.item          = refItem;
		xUI.canvasPaint.currentReference.name          = nameText;
		xUI.canvasPaint.currentReference.backdropColor = paperCol;
		xUI.canvasPaint.currentReference.asOvl         = asOvl;
		xUI.sWitchPanel("Item","close"); //ここで閉じる 仮に閉じた状態でも副作用はない
		return insertItem;
	}

	return xUI;
};

//xUI.canvasPaint addon init