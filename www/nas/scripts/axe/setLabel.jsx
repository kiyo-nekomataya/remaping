/*(レイヤ名ラベル部分を変更)
引数がない場合は何もせずに終了
ドキュメントがない、アクティブレイヤがないなどのケースもなにもせずに復帰
指定文字列が現在のレイヤ名と一致している場合は処理をスキップする
*/
//arguments=[];
//arguments.push("DDD",true);
//alert (arguments.length);
if(app.documents.length)
{
/* 最初に引数を取得　引数はarguments配列の内容を確認*/
var myLabel;		//undefで初期化
var myLabelOpt=false;	//falseで初期化

try{
myLabel=arguments[0];
myLabelOpt=arguments[1];
}catch(er){}
if(myLabel !== void(0)){

/*
 *	Photoshop 拡張スクリプト用
 *	ライブラリに依存しない形で現在選択されているレイヤーの配列を返す
 *	レイヤセット、レイヤーを問わず選択中のアイテムを返す
 *	実行時にもとの選択状態を維持する
 *	返り値の配列はレイヤーが下から順になっているので注意
 */

function getSelectedLayers (){
	var layersIndexes = [];//ID配列
	var result = [];//レイヤー配列

	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
	var desc = executeActionGet(ref);
	if ( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
		desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
		var c = desc.count;
		for(var i=0;i<c;i++){ 
			try{
				activeDocument.backgroundLayer;
				layersIndexes.push(  desc.getReference( i ).getIndex() );
			}catch(e){
				layersIndexes.push(  desc.getReference( i ).getIndex()+1 );
			};
		};
	}else{
		var ref = new ActionReference();
		ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" ));
		ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
		try{
			activeDocument.backgroundLayer; 
			layersIndexes.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1); 
		}catch(e){ 
			layersIndexes.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))); 
		};

		var vis = app.activeDocument.activeLayer.visible;
		if (vis == true) app.activeDocument.activeLayer.visible = false;
		var descE = new ActionDescriptor();

		var listE = new ActionList();
		var refE = new ActionReference();

		refE.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
		listE.putReference( refE );
		descE.putList( charIDToTypeID('null'), listE );

		executeAction( charIDToTypeID('Shw '), descE, DialogModes.NO );

		if(app.activeDocument.activeLayer.visible == false) layersIndexes.shift();
		app.activeDocument.activeLayer.visible = vis;
	};
//取得したID配列からレイヤを追加選択してアクティブアイテムを控える
//IDはレイヤの（表示プライオリティ）下層から順に並んでいるので選択するごとに最上位のレイヤーがアクティブになる
	for( var i = 0; i < layersIndexes.length; i++ ){
		var desc = new ActionDescriptor();
		var ref = new ActionReference();
		ref.putIndex(charIDToTypeID( "Lyr " ), layersIndexes[i])
		desc.putReference( charIDToTypeID( "null" ), ref );
		if ( i > 0 ) {
			var idselectionModifier     = stringIDToTypeID( "selectionModifier" );
			var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
			var idaddToSelection        = stringIDToTypeID( "addToSelection" );
			desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
		};
//desc.putBoolean( charIDToTypeID( "MkVs" ), visible );
		executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
		result.push(app.activeDocument.activeLayer);
	};
	return result;
}
/*
汎用的にすべてのレイヤをフラットモデルで返す関数の方がベンリそうである。なにかと
と。いうわけで書く
ドキュメントというよりトレーラ単位

	getAllLayers(trailer)
	引数	:レイヤコレクション Document.layers または LayerSets.layers
	戻り値	:そのトレーラ配下のレイヤをフラットな配列で

トレーラ自身は含まない
レイヤトレーラを引数に再帰的に
この方式だと配列のインデックスが反転するので注意
上から０番

インデックスはどうも意味がなくなったようでござんす　2014/11/03
*/
function getAllLayers(myTrailer){
	var myResult=new Array();//戻り値ローカルに
	for(var layerId=0;layerId < myTrailer.length;layerId++){
		//	レイヤをリザルトに積む
		myResult.push(myTrailer[layerId]);
		//	さらにレイヤがトレーラだった場合 再帰呼び出しをかけてリザルトを結合
		//　cs4ではLayerSetのインスタンス比較できないtypenameを比較
		if((myTrailer[layerId].typename=="LayerSet")&&(myTrailer[layerId].layers.length)){
//            alert("detect no empty LayerSet " + myTrailer[layerId].name);
			myResult=myResult.concat(getAllLayers(myTrailer[layerId].layers));
		}
	}
//	各要素に現状の反転IDをのっける(後で使える)
	for(var idx=0;idx<myResult.length;idx++){
        myResult[idx].index=(myResult.length-idx-1);
        };
//	フラットなレイヤトレーラ配列を返す
	return myResult;
}

function addSelect(lyNm)
{
//名前指定に変更　どうもIDは使わないほうが良さそう
//追加選択(Shit+Ctrl+Click)
//これ違う　Ctrl+Click　が必要
//Indexは数値下から順に0からレイヤ数-1　まで
//Ｉｎｄｅｘは整数下から順で1からレイヤ数まで（CS4 CS3と５は未確認） 
//if(app.version.split(".")[0]>10){TslIndex++;};
    var idSlct = charIDToTypeID( "slct" );
    var slctDescriptor = new ActionDescriptor();
    var idNull = charIDToTypeID( "null" );
    var LyrRef = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " );
//    	LyrRef.putIndex( idLyr, TslIndex );
   	LyrRef.putName( idLyr, lyNm );
    	slctDescriptor.putReference( idNull, LyrRef );
    var siMod = stringIDToTypeID( "selectionModifier" );
    var siModType = stringIDToTypeID( "selectionModifierType" );
//    var idAddSlct = stringIDToTypeID( "addToSelectionContinuous" );
    var idAddSlct = stringIDToTypeID( "addToSelection" );
    	slctDescriptor.putEnumerated( siMod, siModType, idAddSlct );
    var idMkVs = charIDToTypeID( "MkVs" );
    	slctDescriptor.putBoolean( idMkVs, false );
    executeAction( idSlct, slctDescriptor, DialogModes.NO );
}

//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   var myLibLoader=new File(Folder.userData.fullName+"/nas/lib/Photoshop_Startup.jsx");
   $.evalFile(myLibLoader);
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用


// var allLayers=getAllLayers(app.activeDocument.layers);
//復帰用インデックスを振るために空で実行する意味が消失したようです　IDがレイヤ構成の見た目と一致せずに不定になっているのでアウト

//第二引数オプションがtrueの場合のみ以下を実行（選択レイヤを処理）
/*
    分岐　オプションtrue/false
	アクティブレイヤが第一階層のレイヤセットだった場合は、レイヤセットのラベルを可能なら変更して　レイヤセット内のレイヤ名のラベル部分を更新　２ステップ複数ファイル
	アクティブレイヤが第一階層のアートレイヤだった場合は、そのレイヤのラベル部分のみを更新　１ステップ
	それ以外の場合は、親レイヤトレーラーのラベルを更新してその内包するレイヤ名を更新　２ステップ複数ファイル
	オプションありの場合とターゲットの取得方法が異なる
	引数の末尾が数値の場合はハイフンを追加する
	ターゲットの選定が異なるが、処理は同じなので処理部分を抽出して調整
 */
switch(myLabelOpt){
case "selection":
//var myTargetLayers=getSelectedLayers();//現在の選択レイヤを取得　ただし同一トレーラー内のレイヤのみが取得可能
try{
var myTargetLayers=nas.axeCMC.getItemsById(nas.axeCMC.getSelectedItemId());
//新ライブラリによる取得。背景・レイヤセットも取れる背景のみの場合はやはり失敗
}catch(er){
var myTargetLayers=[];
}
break;
case "auto":
var myTargetLayers=[];
	  if(app.activeDocument.activeLayer.parent.typename == "Document"){
		//第一階層
		if ((app.activeDocument.activeLayer.typename == "LayerSet")&&(app.activeDocument.activeLayer.layers.length)){
			//第一階層のレイヤセットで内包レイヤがある
		  for(var idx=0;idx<app.activeDocument.activeLayer.layers.length;idx++){
			myTargetLayers.push(app.activeDocument.activeLayer.layers[idx]);
			}
 	            myTargetLayers.push(app.activeDocument.activeLayer);
		}
	  }else{
		//第二階層以下なので親とその内包レイヤをターゲットにセット
		  for(var idx=0;idx<app.activeDocument.activeLayer.parent.layers.length;idx++){
			myTargetLayers.push(app.activeDocument.activeLayer.parent.layers[idx]);
			}
		     myTargetLayers.push(app.activeDocument.activeLayer.parent);
	　}
break;
case "swap":
 var myTargetLayers=[];
		     myTargetLayers.push(app.activeDocument.activeLayer);

  }

if(myTargetLayers.length){

//実処理
   for (var ix=0;ix<myTargetLayers.length;ix++){
if ((myTargetLayers[ix].typename=="LayerSet")&&(myTargetLayers[ix].parent.typename == "Document")){
        if(myTargetLayers[ix].name!=myLabel){myTargetLayers[ix].name=myLabel};
}else{
       var spLt=(myLabel.match(/\d$/))?"-":"";
       if(myTargetLayers[ix].name.match(/^(.*[^\d])?(\d+)([^0-9]?.*)$/)){
           if(myTargetLayers[ix].name!=(myLabel+spLt+RegExp.$2+RegExp.$3)){myTargetLayers[ix].name=myLabel+spLt+RegExp.$2+RegExp.$3} ;
       }else{
           if(myTargetLayers[ix].name!=myLabel){myTargetLayers[ix].name=myLabel };
       };     
}
   }
		if(false){
	for (var ix=0;ix<myTargetLayers.length;ix++){
//addSelect(myTargetLayers[ix].name);
	}
		}
}
}
 }