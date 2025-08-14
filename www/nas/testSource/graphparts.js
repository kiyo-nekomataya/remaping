/**
 *	@desc グラフィック部品のための試験コード
 *	最終的にはxUIの配下に入れてxUIのプロパティを参照すること
 *	引数:配置するグラフィックの種別と開始フレーム、継続時間
 *	戻値:グラフィックパーツオブジェクト
 */
/*
グラフィックパーツオブジェクトは、自身に可変数のcanvasオブジェクトへの参照を持って、自律的に自分自身の再描画を行う
リフレッシュ、又はリドローメソッドを装備して自分自身で呼び出す
リフレッシュの際は、開始フレームから継続時間に従って自分自身を何パーツに分解するかを決定して再描画を行う
既存のエレメントはなるべく再利用する。

オブジェクト管理が複雑になるので、以上の方式の実装は見送り

代案として、以下の方式で実装
クラフィックパーツは、必ず各フレーム（シートセル）毎に分割して描画する
丸・三角・矢印・直線・波線　等々キャッシュ可能な図形はキャッシュして流用
トランジション系は再利用性が低いので都度描画

グラフィックレイヤー管理用にトレーラーオブジェクトを設ける
その配下にID（オブジェクト名）で管理するHTMLCanvasオブジェクトを置く
xUI.Cgl	;//CellGraphicsLayer
xUI.Cgl("0_1")等でアクセスする
各セルの描画はCglオブジェクトのオブジェクトメソッドにする
トレーラー内のオブジェクト毎に　show,hide,remove,duplicate のオブジェクトメソッドを実装するか？
>トレーラーのメソッドにする
トレーラーに管理機能を持たせる
トレーラーを増やせば多重のGraphicも可能…多分その必要は無いと思う…


xUI.Cgl
メソッド
　.show(ID)
　.hide(ID)
　.clear(ID) =remove
　.hilite(ID)
　.draw(ID,options)
　下位オブジェクトに同名のメソッドを置かない
　下位オブジェクトはHTMLcanvas
　作成毎にプロパティでオブジェクトの参照を配置する
*/
	if(true){

xUI.Cgl = new Object();

xUI.Cgl.body={};

xUI.Cgl.show=function(myId){
	if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
	if(this.body[myId]){$("#cgl"+myId).show();}else{delete this.body[myId];}
}
xUI.Cgl.hide=function(myId){
	if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
	if(this.body[myId]){$("#cgl"+myId).hide();}else{delete this.body[myId];}
}
xUI.Cgl.remove=function(myId){
	if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
	if(this.body[myId]){$("#cgl"+myId).remove();delete this.body[myId];}
}
/**
	描画コマンド

*/
xUI.Cgl.draw=function addGraphElement(myId,myForm) {
		if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
		if( this.body[myId] ){
			$("#cgl"+myId).remove();delete this.body[myId];
		//二重描画防止の為すでにエレメントがあればクリアして描画
		}
	    var objTarget = document.getElementById(myId);//ターゲットシートセルを取得 
		if((xUI.viewMode=="Compact")&&((myId.indexOf("r")==0)||(myId.split("_")[0]==0))){
		    var targetParent = document.getElementById("UIheaderScrollV");//親は、表示モードで変更されるので注意
		}else{
		    var targetParent = document.getElementById("sheet_body");//親は、表示モードで変更されるので注意
		}
	    var targetRect=objTarget.getBoundingClientRect();
	    var parentRect=targetParent.getBoundingClientRect();
var myTop=targetRect.top-parentRect.top;
var myLeft=targetRect.left-parentRect.left;

	    var element = document.createElement('canvas'); 
	    element.id = "cgl" + myId; 
element.style.position="absolute";
element.style.top=myTop+"px";
element.style.left=myLeft+"px";

	    element.width=targetRect.width;
	    element.height=targetRect.height;
	    var ctx = element.getContext("2d");
switch(myForm){
case "line":	    //vertical-line
		var lineWidth  =3;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		ctx.lineTo(element.width*0.5, element.height);
	    ctx.stroke();
//		ctx.moveTo(element.width*0.5, 0);
//	    ctx.fillStyle="rgba(0,0,0,1)";
//	    ctx.fillRect(Math.floor(targetRect.width*0.5 - 1),0, 2, targetRect.height);
break;
case "wave":;			//wave-line	 
		var waveSpan  =5;		var lineWidth  =3;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		if(parseInt(myId.split("_")[1]) % 2){	
	ctx.bezierCurveTo(element.width*0.5-waveSpan, element.height*0.5,element.width*0.5-waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}else{
	ctx.bezierCurveTo(element.width*0.5+waveSpan, element.height*0.5,element.width*0.5+waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}
	    ctx.stroke();
break;
case "fi":;		//fade-in
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo((1-startValue)*element.width*0.5, 0);
		ctx.lineTo(element.width-(1-startValue)*element.width*0.5,0);
		ctx.lineTo(element.width-(1-endValue)*element.width*0.5,element.height);
		ctx.lineTo((1-endValue)*element.width*0.5,element.height);
		ctx.fill();
break;
case "fo":;		//fade-out
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(startValue*element.width*0.5, 0);
		ctx.lineTo(element.width-startValue*element.width*0.5,0);
		ctx.lineTo(element.width-endValue*element.width*0.5,element.height);
		ctx.lineTo(endValue*element.width*0.5,element.height);
		ctx.fill();
break;
case "transition":;		//transition
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(startValue*element.width, 0);//
		ctx.lineTo(element.width-startValue*element.width,0);
		ctx.lineTo(element.width-endValue*element.width,element.height);
		ctx.lineTo(endValue*element.width,element.height);
		ctx.fill();
break;
case "circle":;		//circle
		var phi  = .9;		var lineWidth  =3;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.arc(element.width * 0.5, element.height * 0.5, element.height*phi*0.5, 0, Math.PI*2, true);
//context . arc(x, y, radius, startAngle, endAngle, anticlockwise)		ctx.lineTo(element.width*0.5, element.height);
	    ctx.stroke();
break;
case "triangle":;		//triangle
		var lineWidth  =4;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, -1);
		ctx.lineTo(element.width*0.5 + (element.height-2)/Math.sqrt(3), element.height-2);
		ctx.lineTo(element.width*0.5 - (element.height-2)/Math.sqrt(3), element.height-2);
		ctx.closePath();
	    ctx.stroke();
break;
case "section-open":;		//section-open
	var formFill = arguments[2];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(element.width * 0.5 - element.height/Math.sqrt(3), 0);
		ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), 0);
		ctx.lineTo(element.width * 0.5 , element.height);
		ctx.closePath();
		if(formFill) {ctx.fill();}else{ctx.stroke();}
break;
case "section-close":;		//section-close
	var formFill = arguments[2];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(element.width * 0.5, 0);
		ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), element.height);
		ctx.lineTo(element.width * 0.5 - element.height/Math.sqrt(3), element.height);
		ctx.closePath();
		if(formFill) {ctx.fill();}else{ctx.stroke();}
break;
case "sound-section-open":;		//section-open
	var lineWidth = 3;
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(0, element.height-lineWidth);
		ctx.lineTo(element.width, element.height-lineWidth);
		ctx.stroke();
break;
case "sound-section-close":;		//section-close
	var lineWidth = 3;
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(0, lineWidth);
		ctx.lineTo(element.width, lineWidth);
		ctx.stroke();
break;
case "area-fill":;	//fill sheet cell
		ctx.moveTo(0, 0);
	    ctx.fillStyle="rgba(0,0,0,1)";
	    ctx.fillRect(0, 0, targetRect.width, targetRect.height);
break;
}
	    element=targetParent.appendChild(element); 
//	    element.style.zIndex=1;//シートに合わせて設定
		element.style.pointerEvents='none';//イベントは全キャンセル
		element.style.brendMode="multiply";//乗算
		element.style.opacity="0.3";//30%
this.body[myId]=element;
this.body[myId].formProp=myForm;

	
return element;
}

	}
//test
/**
xUI.Cgl.draw (xUI.Select.join("_"),"sound-section-close",false);
xUI.Cgl.draw ("r_"+xUI.Select.join("_"),"triangle",false);
A=new Array();
for (prp in xUI.Cgl.body){A.push(prp)};
A;
*/
/**
追加したcanvas要素が、クリックイベントを横取りしてシートのイベントが発火しない
これは、
	オーバレイ側がイベントを受け取って不発になる
	追加したHTML要素のイベント発火に問題がある
の二点に問題があるらしい
正常にイベント発火が起きるように設定することは可能
その状態で
	アンダーレイにしてイベントが発火するようにする
		または
	　canvasのイベントを受け取ってクリックされたセルを計算する
いずれかの処置が必要

ただしpointerEventsプロパティで要素自体のイベントを全キャンセル可能
今回の処理では、テキストの代用なのでこちらで処理
置換えテキストは、ヌルストリングではなくスペースにしたほうが良いか？
→現状でテキスト選択自体ができないので無意味


*/
/*
	部分パーツ
	描画範囲:
		offset:開始フレーム左上
		width :トラック幅
		height:フレームいっぱい=開始フレーム上端〜終了フレーム下端
開始フレームと終了フレームは親オブジェクトから計算して分割
*/
//=========== 矢印付き区間表示線
/**
△▽▼▲
｜｜｜｜
｜｜｜｜
▽△▲▼
対応型開閉ノード

*/


//=========== スポッティング記号
/**
☓	ドラム
^	スネア
♪♫♬	音符
=	連続音
*/
//=========== 原画囲い強調　丸　三角　四角
//=========== 縦線
/*
	波線は、開始フレームの高さと同一幅で２フレームあたりの繰り返し素材をあらかじめ作成
繰り返し素材形状
始点 		(-振幅*0.5 ,0)
第一制御点	(-振幅*0.5 ,サイクル高さ*0.25)
第二制御点	( 振幅*0.5 ,サイクル高さ*0.25)
終点		( 振幅*0.5 ,サイクル高さ*0.5)

始点 		前終点
第一制御点	( 振幅*0.5　,サイクル高さ*0.75)
第二制御点	(-振幅*0.5  ,サイクル高さ*0.75)
終点		(-振幅*0.5  ,サイクル高さ)
*/
//=========== 波線
/*
	波線部品（１サイクル分）を出力する関数
	　引数:
	　	span	振幅(px)	セル高さ÷2
	　	cycle	サイクル高さ(px) タイムシートセルハイト
	　	offset	スタートオフセットfloat（0-1）default 0.5
	　戻り値:
	　	１cycle分の　HTML-Canvas　エレメント
	　	始点を(0,0)に置いた画像を返す
	　	クリッピングは受け取り側のCanvasで行うこと
	　	
*/

	    var objTarget = document.getElementById(xUI.Select.join("_")); 
	    var targetParent =document.getElementById("sheet_body"); 
	    var targetRect=objTarget.getBoundingClientRect();
	    var parentRect=targetParent.getBoundingClientRect();

var myTop=targetRect.top-parentRect.top;
var myLeft=targetRect.left-parentRect.left;
	var unitWidth =targetRect.width;
	var unitHeight=targetRect.height;
	var waveSpan  =10;

//=========波線パターンブロック生成（＋描画キャッシュ）
/**
	1サイクル2フレーム分描画してある
	使用時は奇数フレーム(fid evn)ではオフセットなし　偶数フレーム(fid odd)で1フレーム高さ(unitHeight)のオフセットを加える
	
*/
if(document.getElementById("waveUnit")){
	var waveUnit=document.getElementById('waveUnit');
}else{	
	var waveUnit=document.createElement('canvas');
	waveUnit.ctx=waveUnit.getContext('2d');
	waveUnit.ctx.strokeStyle="rgb(0,0,0)";
	waveUnit.ctx.strokeWidth=2;
    waveUnit.width=waveSpan+2;
    waveUnit.height=unitHeight*2;
	waveUnit.ctx.moveTo(waveSpan+1, 0);
	waveUnit.ctx.bezierCurveTo(waveSpan+1, unitHeight*0.5, 1 , unitHeight*0.5,  1 , unitHeight);
	waveUnit.ctx.bezierCurveTo(1 , unitHeight*1.5, waveSpan+1, unitHeight*1.5, waveSpan+1, unitHeight*2);
	waveUnit.ctx.stroke();
	
//	var myView=document.getElementById("sheet_body");
	var myView=document.getElementById("sheet_view");
	waveUnit=myView.appendChild(waveUnit);
	waveUnit.id = "waveUnit"; 
    waveUnit.style.zIndex=1;//シートに合わせて設定
	waveUnit.style.pointerEvents='none';//イベントは全キャンセル
	waveUnit.style.position="absolute";
	waveUnit.style.top=0+"px";
	waveUnit.style.left=0+"px";
}
//=========線引きパターンブロック生成（＋描画キャッシュ）
if(document.getElementById("sectionLineUnit")){
	var sectionLineUnit=document.getElementById('sectionLineUnit');
}else{	
	var sectionLineUnit=document.createElement('canvas');
	sectionLineUnit.ctx=sectionLineUnit.getContext('2d');
	sectionLineUnit.ctx.strokeStyle="rgb(0,0,0)";
	sectionLineUnit.ctx.strokeWidth=2;
    sectionLineUnit.width=2;
    sectionLineUnit.height=unitHeight;
	sectionLineUnit.ctx.moveTo(0, 0);
	sectionLineUnit.ctx.lineTo(0, unitHeight);
	sectionLineUnit.ctx.stroke();
	
	var myView=document.getElementById("sheet_view");
	sectionLineUnit=myView.appendChild(sectionLineUnit);
	sectionLineUnit.id = "sectionLineUnit"; 
    sectionLineUnit.style.zIndex=1;//シートに合わせて設定
	sectionLineUnit.style.pointerEvents='none';//イベントは全キャンセル
	sectionLineUnit.style.position="absolute";
	sectionLineUnit.style.top=0+"px";
	sectionLineUnit.style.left=0+"px";
}
//=========トランジションパターンブロック生成（＋描画キャッシュ）

if(document.getElementById("transitionUnit")){
	var transitionUnit=document.getElementById('transitionUnit');
}else{	
	var transitionUnit=document.createElement('canvas');
	transitionUnit.ctx=transitionUnit.getContext('2d');
	transitionUnit.ctx.strokeStyle="rgb(0,0,0)";
	transitionUnit.ctx.strokeWidth=1;
    transitionUnit.width=unitWidth;
    transitionUnit.height=unitHeight*12;//暫定12フレーム
	transitionUnit.ctx.moveTo(0, 0);
	transitionUnit.ctx.lineTo(unitWidth, unitHeight*12);
	transitionUnit.ctx.lineTo(0, unitHeight*12);
	transitionUnit.ctx.lineTo(unitWidth, 0);
	transitionUnit.ctx.fill();
	
	var myView=document.getElementById("sheet_view");
	transitionUnit=myView.appendChild(transitionUnit);
	transitionUnit.id = "transitionUnit"; 
    transitionUnit.style.zIndex=1;//シートに合わせて設定
	transitionUnit.style.pointerEvents='none';//イベントは全キャンセル
	transitionUnit.style.position="absolute";
	transitionUnit.style.top=0+"px";
	transitionUnit.style.left=0+"px";
}
//=========ここまでパターン生成 ストックヤードへ

//drawing TEST
	var waveline=document.createElement('canvas');
	var cellWidth =targetRect.width;
	var cellHeight=targetRect.height*24;

	waveline.ctx=waveline.getContext('2d');
//	var wavePtn=waveline.ctx.createPattern(document.getElementById("waveUnit"),"repeat-y");
//	var wavePtn=waveline.ctx.createPattern(transitionUnit,"repeat-y");//縦リピート
	var wavePtn=waveline.ctx.createPattern(transitionUnit,"no-repeat");//リピートなし
	waveline.ctx.scale(1,2);//縦二倍
	var startOffset=0;
    waveline.width=cellWidth;
    waveline.height=cellHeight+unitHeight*startOffset;
//	waveline.ctx.fillStyle=wavePtn;
	waveline.ctx.strokeStyle=wavePtn;
//	waveline.ctx.lineWidth=waveSpan+2;
//	waveline.ctx.moveTo(waveSpan/2,unitHeight*startOffset);
//	waveline.ctx.lineTo(waveSpan/2 ,cellHeight+unitHeight*startOffset);

	waveline.ctx.lineWidth=cellWidth;
	waveline.ctx.moveTo(cellWidth/2,unitHeight*startOffset);
	waveline.ctx.lineTo(cellWidth/2 ,cellHeight+unitHeight*startOffset);
	waveline.ctx.stroke();

//	waveline.ctx.beginPath();
//	waveline.ctx.fillRect(0,-12,waveSpan+2,cellHeight+12);
//	waveline.ctx.fill();
	
    waveline.id = "waveLine"; 

    waveline=targetParent.appendChild(waveline); 
    waveline.style.zIndex=1;//シートに合わせて設定
	waveline.style.pointerEvents='none';//イベントは全キャンセル
	waveline.style.position="absolute";
	waveline.style.top=myTop-unitHeight*startOffset+"px";
//	waveline.style.left=myLeft+(cellWidth/2)-(waveSpan/2)+"px";//波線
	waveline.style.left=myLeft+"px";//transition
	waveline.style.brendMode="multiply";
	waveline.style.opacity="0.2";
//waveline.style.backgroundBlendMode="lighten";

/*
	始点からカーブ繰り返し
*/
//=========== クロスディソルブ
/**
▼	クロスディゾルブのシンボル
▲
	XPSテキストでの表現は
]X[,|,↓,↑,|,]X[
	または
]X[,|,*,+,]X[

drawClossDissolve(unitHeight,unitWidth,startValue,endValue)
　クロスディゾルブの部分図形を描画する
引数:
  unitWidth		必要な図形の幅
  unitHeight	必要な図形の高さ
  startValue	開始値 0~1
  endValue		終了値 0~1
戻値:
  canvasオブジェクト
  
クロスディゾルブの開始点は０　終了点は１
完全なクロスディゾルブの図形を得るには
　
*/
	
//=========== フェードイン
/**
▲	フェードインのシンボル
*/

//=========== フェードアウト
/**
▼	フェードアウトのシンボル
*/
/*
ミッドレベルでは、以下のファンクションが必要
引数:図形、開始フレーム、継続フレーム
戻値:HTMLCanvas(Image/Svg等)オブジェクトへの参照を一つだけ持ったグラフィックサブセクションエレメント
無名オブジェクトで、セクショングラフィックスのメンバー識別のためのIDは持たせる？エレメントIDは割りつけるー＞連番
*/
/*
xUI.GraphElement=function(){
	this.element;
	this.form;
	this.start;
	this.duration;
}
*/
/*
	XPSフォーマット自体がテキストベースなので、テキスト代替グラフィックパーツの位置づけとなる
	ただし、ユーザの感覚的には線、エフェクト等の区間を持ったデータは区間ごとに１つのエレメントとして認識されることに加え、描画上も個々の区間を１エレメントとして扱うほうがパフォーマンスが高い
	
	テキスト代替エレメントと区間エレメントの両方で扱うことが可能なように作成されるのが好ましい
	置きかえルーチンでは、画像オブジェクトに置きかえられる表示を選出して
	""(ヌルストリング)に置きかえ
	セクション内の図形代用表示以外は（基本的にコメントなので）すべて残す
	セクショングラフィック表示をコメント部分で分割するか否かはペンディング
	路線は「分割しない」方向だが　分割のクチは残す
	セクションパースとは混ぜない
	パースされたデータからセクションを作成して　セクション内の独立オブジェクトとして実装する
*/
/**
 *	ローレベルでは以下の機能が必要
引数:テンプレート図形オブジェクト,表示座標,クリッピングウインドウ
戻値:新規に作成されたHTMLCnavasObject

セクションオブジェクトの配下に置くメソッド
テンプレートの画像をクリップした画像エレメントを作成して返す

ページ・カラム単位で内部的に複数の画像エレメントとして描画する
画像全体を部品ストアにストックする(非表示)

以下はセル単位でリプレース可能
ただしセクション単位のリプレースが望ましい？
	直線　強調度合いで2〜3種欲しいかも
	波線

以下は必ずセル単位でリプレース
	丸囲い	原画
	角囲い	
	三角囲い	アタリ
	三角ノード	開始・終了ノードが組
	丸ノード	開始・終了が同一

以下は必ずセクション単位でリプレース
	トランジション
	フェードイン
	フェードアウト
と、思ったが　フレーム単位に分割して都度生成使用に方針変更
その分判定とセクションパースの回数が減るのでメモリで効率を買う

表示用のレイヤ（操作ID）として　cellGraphicLayerを作成する
elementID　cgl(trackID)_(frameID)
例:
 <canvas id=cgl12_144></canvas>
 

セクションパーサに開始フレームを指定して1セクションけパースする機能を付けたほうが良いか？一考

 */
