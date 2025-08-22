/*(nas_psAxeLib_UXP.js)
 *	
 *	nas_psAxeLib の UXP拡張部分
 *	新規の書式を同じソース内に配置するとExtendScriptで読み込まれた際にエラーとなるのでソースを分離 220625
 *	
 *	
 *	開発中
 */

//	nas.axeAFC = new Object;//アニメウインドウ操作関数
/*
	nas.axeAFC.setDly(myTime)
		フレームにディレイを設定する 継続時間とほぼ同一だが最短時間は保証されない
	nas.axeAFC.duplicateFrame()
		カレントフレームを複製する
	nas.axeAFC.selectFrame(index)
		フレームを選択する Indexは整数（1オリジン）単独選択でカレントが移動
	nas.axeAFC.selectFramesAll()
		全フレーム選択
	nas.axeAFC.removeSlection()
		選択フレームを削除 ただし全削除を行なっても仕様上フレームカウントが0にはならない。必ずフレームID-0が残る
	nas.axeAFC.activateFrame(kwd)
		カレントフレームを移動する kwd = Nxt ,Prvs,Frst (各4bite)
	nas.axeAFC.goFrame(kwd)
		アニメーションフレームを移動 kwd = n,p,f,e　フォーカス移動あり。
	nas.axeAFC.countFrames()
		アニメーフレームの現在の数をカウントする。ひどく裏技だけどまあ、使えるからヨシ
*/
// ======================================================= 選択フレームの遅延を設定
nas.axeAFC.setDly=function(myTime){
	action.batchPlay([
		{
			"_obj":"set",
			"_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}],
			"to":{
				"_obj":"animationFrameClass","animationFrameDelay":myTime
			}
		}
	],{});
};
// =======================================================選択フレーム複製
nas.axeAFC.duplicateFrame=function(){
	action.batchPlay([
		{
			"_obj":"duplicate",
			"_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}]
		}
	],{});
};
// =======================================================フレーム選択
nas.axeAFC.selectFrame=function(idx){
	action.batchPlay([
		{
			"_obj":"select",
			"_target":[{"_index":idx,"_ref":"animationFrameClass"}]
		}
	],{});
/*
{"_obj":"select","_target":[{"_index":3,"_ref":"animationFrameClass"}]},
{"_obj":"select","_target":[{"_index":5,"_ref":"animationFrameClass"}]},
{"_obj":"select","_target":[{"_index":7,"_ref":"animationFrameClass"}]},
{"_obj":"select","_target":[{"_index":1,"_ref":"animationFrameClass"}]},
{"_obj":"animationFrameExtendSelection","animationFramesContiguous":true,"animationToFrame":2},
{"_obj":"animationFrameExtendSelection","animationFramesContiguous":false,"animationToFrame":4},
{"_obj":"animationFrameExtendSelection","animationFramesContiguous":false,"animationToFrame":6}
]

	[
		{
			"_obj":"select",
			"_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}]
		}
*/
};
// =======================================================フレーム全選択
nas.axeAFC.selectFramesAll=function(){
	action.batchPlay([{"_obj":"animationSelectAll"}],{});
};
// =======================================================選択フレーム削除
nas.axeAFC.removeSelection=function(){
	action.batchPlay([
		{"_obj":"delete","_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}]}
	],{});
};
// =======================================================アニメーションフレーム順反転
nas.axeAFC.reverseAnimationFrames=function(){
	action.batchPlay([
		{"_obj":"reverse","_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}]}
	],{});
};
//===================== 操作関数 アニメフレーム移動(フォーカス移動なし)
// =======================================================アニメーションフレームをアクティブに
//（正逆順送り）セレクトとアクティブが別概念のようなので注意'End 'はバージョンによる？
nas.axeAFC.activateFrame=function(kwd){
//kwd = Nxt ,End ,Prvs,Frst(各４バイト)
;
	action.batchPlay([
		{"_obj":"animationFrameActivate","_target":[
			{
				"_enum":"ordinal",
				"_ref":"animationFrameClass",
				"_value":{'Nxt ':"next",'End ':"last",'Prvs':"previous",'Frst':"first"}[kwd]
			}
		]},
	],{});
/*
{"_obj":"animationFrameActivate","_target":[{"_enum":"ordinal","_ref":"animationFrameClass","_value":"first"}]},
{"_obj":"animationFrameActivate","_target":[{"_enum":"ordinal","_ref":"animationFrameClass","_value":"next"}]},
{"_obj":"animationFrameActivate","_target":[{"_enum":"ordinal","_ref":"animationFrameClass","_value":"previous"}]},
{"_obj":"animationFrameActivate","_target":[{"_enum":"ordinal","_ref":"animationFrameClass","_value":"last"}]}
*/
};
// =======================================================フレームをレイヤに変換
nas.axeAFC.convertFrs2Lyrs=function(){
	action.batchPlay([
		{"_obj":"animationFramesToLayers"}
	],{});
};

// ======================================================= アニメフレームの数をカウントする

nas.axeAFC.countFrames=function(){
//================== rootトレーラーのレイヤ数を控える
var currentLayerCounts=app.activeDocument.layers.length;
//アニメーションフレームをレイヤーに変換（アニメーションフレーム分のレイヤーが増える）
	action.batchPlay([
		{"_obj":"animationFramesToLayers"}
	],{});
//差分を取得してフレーム数を取得
var myFrameCounts = app.activeDocument.layers.length-currentLayerCounts;
// =================== ヒストリを1段削除して復帰
	action.batchPlay([
		{"_obj":"delete","_target":[{"_property":"currentHistoryState","_ref":"historyState"}]}
	],{});
return myFrameCounts;
};
//======================================アニメーションフレームをクリア（初期化）
nas.axeAFC.initFrames=function(){
	action.batchPlay([
		{"_obj":"move","_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}],"to":{"_index":1,"_ref":"animationFrameClass"}},
		{"_obj":"animationSelectAll"},
		{"_obj":"delete","_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}]}
	],{"historyStateInfo":{
		"name":'reset animationframes',
		"target":{
			"_ref": 'document',
			"_enum": 'ordinal',
			"_value": 'targetEnum'
		}
	}});
};
//===================================animationNewLayerPerFrame
//新規フレームごとに新規レイヤーを作成チェック CC2021 ~ 無効
nas.axeAFC.chgModeNLPF=function(){
//	action.batchPlay([
//	],{});
// var desc = new ActionDescriptor();
//   var ref = new ActionReference();
//    ref.putEnumerated( charIDToTypeID( "Mn  " ), charIDToTypeID( "MnIt" ), stringIDToTypeID( "animationNewLayerPerFrame" ) );
//   desc.putReference( charIDToTypeID( "null" ), ref );
// executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );

};
//====================== goFrame(kwd) 移動ラッパー 引数は "f","p","n","e" いずれか
//レイヤフォーカス移動つき
nas.axeAFC.goFrame=function(kwd){
 switch (kwd){
 case	"f":this.activateFrame("Frst");break;
 case	"p":this.activateFrame("Prvs");break;
 case	"n":this.activateFrame("Nxt ");break;
 case	"e":this.activateFrame("Frst");this.activateFrame("Prvs");break;
 };
 if(nas.axe.focusMove){this.focusTop();};
};
//====

//axeCMC CommonManipulatorClass　Photoshopの操作系全般を格納するオブジェクト
//	nas.axeCMC=new Object();
/*
: nas.axeCMC.execWithReference(commandStringID:String) 抽象化コマンドを実行
: nas.axeCMC.execNoReference(commandStringID:String) 抽象化コマンドを実行
: nas.axeCMC.execNoDescriptor(commandStringID:String) 抽象化コマンドを実行
: nas.axeCMC.getAnimationMode() アニメーションモード取得
: nas.axeCMC.getSelectedItemId() 選択されているアイテムをIDの配列で取得
: nas.axeCMC.getItemById(idx) アイテムIDを指定してオブジェクトを取得
: nas.axeCMC.getItemsById(idx) アイテムIDを指定してオブジェクト配列を取得
: nas.axeCMC.getItemByLid(idx,myTrailer) レイヤIDを指定してオブジェクトを指定
: nas.axeCMC.getAllItems(myTrailer) トレーラー配下の全アイテムを配列で取得
: nas.axeCMC.selectItemsById(idie:Array) アイテムIDを指定して選択
: nas.axeCMC.undo(undoCount) undo回数を指定してUNDO
: nas.axeCMC.evalA(undoString,codeChip) undoグループでコード片を実行
: nas.axeCMC._isBlocked() レイヤが操作可能か判定
: nas.axeCMC._isVideoGroup() ビデオグループ判定
: nas.axeCMC.focusTop() アクティブなレイヤセット内で最も表示順位の高いレイヤをアクティブにする
: nas.axeCMC.placeEps() ファイルを指定してスマートオブジェクトとして配置する
*/
/*
nas.axeCMC.execWithReference(commandStringID:String)
引数:StringIDで抽象化されたコマンドを実行する
戻値:アクションディスクリプタ/null　またはエラーイベント

実行可能コマンドは以下のとおり(多分以降増加あり)
//タイムラインアニメーション
timelineGoToFirstFrame	最初のフレームへ
timelineGoToLastFrame	最後のフレームへ
timelineGoToPreviousFrame	前のフレームへ
timelineGoToNextFrame	次のフレームへ
timelineGoToTime	時間指定パネル
timelineSetStartOfWorkArea	ワークエリアの開始点に設定
timelineSetEndOfWorkArea	ワークエリアの終点に設定
timelineGoToWorkAreaStart	ワークエリアの開始点へ移動
timelineGoToWorkAreaEnd	ワークエリアの終点へ移動
timelineLiftWorkArea	ワークエリアをリフト
timelineExtractWorkArea	ワークエリアを抽出（すっこ抜くとか引っこ抜くとか削除の方が適切）
timelineTrimLayerStart	開始点にトリミング
timelineTrimLayerEnd	終了点にトリミング
timelineMoveLayerInPoint	IN点に移動
timelineMoveLayerEndPoint	OUT点に移動
timelineSplitLayer	レイヤ分割
timelineShowAllLayers	全レイヤを表示
timelineShowFavoriteLayers	お気に入りのレイヤのみ表示
timelineShowSetFavoriteLayers	お気に入りのレイヤに設定
timelineOnionSkinSettings	オニオンスキン設定
timelineEnableOnionSkins	オニオンスキン表示
timelinePaletteOptions	パネルオプション
timelineEnableShortcutKeys	タイムラインショートカットキーを使う
timelineDocumentSettings	タイムラインのフレームレートを設定

//フレームアニメーション
animationShowNewLayersInFrames	全てのフレームで新規レイヤを表示
animationNewLayerPerFrame	新規フレームごとにレイヤを作成
animationGoToFirstFrame	最初のフレームへ
animationGoToLastFrame	最後のフレームへ
animationGoToPreviousFrame	前のフレームへ
animationGoToNextFrame	次のフレームへ
convertAnimation	タイムラインへコンバート
animationPanelOptions	パネルオプション
animationSelectAll	全てのフレームを選択
*/
nas.axeCMC.execSingleCommand=function(commandString){
	action.batchPlay([
		{'_obj':commandString}
	],{});
};

nas.axeCMC.execWithReference=nas.axeCMC.execSingleCommand;
/*nas.axeCMC.execWithDescriptor(myStringID)
引数:抽象化コマンド
戻値:ディスクリプタ

//レイヤ操作系
ungroupLayersEvent	レイヤグループ解除

*/
nas.axeCMC.execWithDescriptor=nas.axeCMC.execSingleCommand;
/*nas.axeCMC.execNoReference(myStringID)
引数:コマンド文字列
戻値:ディスクリプタ

//タイムラインアニメーション
splitVideoLayer	再生ヘッドで分割
moveInTime	再生ヘッドを開始点としてトリミング
moveOutTime	再生ヘッドを終了点としてトリミング
makeFramesFromLayers	クリップからフレームを作成（ヘッド位置で１フレームにする）
makeLayersFromFrames	フレームをクリップに統合（）
convertTimeline	フレームアニメーションに変換
extractWorkArea	ワークエリアを抽出
liftWorkArea	ワークエリアをリフト
copyKeyframes	キーフレーム複製
pasteKeyframes	キーフレームペースト
splitVideoLayer	レイヤをスプリット
sharpenEdges	シャープ（輪郭のみ）
findEdges	輪郭検出
mergeLayersNew	下のレイヤと結合
copyEvent	セレクションコピー
copyMerged	結合部分をコピー
delete	消去
desaturate	彩度を下げる
invert	反転
flattenImage	画像統合

makeFrameAnimation	フレームアニメーション作成
makeTimeline	タイムライン作成
convertTimeline	フレームアニメーションへ変換
*/
nas.axeCMC.execNoReference = nas.axeCMC.execSingleCommand;

/*nas.axeCMC.execNoDescriptor(myStringID)
引数:コマンド文字列
戻値:
この関数は古いタイプのものなのでUXPでは使用されない
//charID
ShrE	シャープ（輪郭のみ）
FndE	輪郭検出
Mrg2	下のレイヤと結合
copy	セレクションコピー
CpyM	結合部分をコピー
Cls 	閉じる（要保存）
Dlt 	消去
Dstt	彩度を下げる
save	上書き保存
Invr	反転
FltI	画像統合
//StirngID
makeFrameAnimation	フレームアニメーション作成
makeTimeline	タイムライン作成
*/
nas.axeCMC.execNoDescriptor=function(myID){
//4文字コードを変換して実行
	if(myID.length == 4){
		action.batchPlay([
			{'_obj':{
				"ShrE":"sharpenEdges",
				"FndE":"findEdges",
				"Mrg2":"mergeLayersNew",
				"copy":"copyEvent",
				"CpyM":"copyMerged",
				"Cls ":"close",
				"Dlt ":"delete",
				"Dstt":"desaturate",
				"save":"save",
				"Invr":"invert",
				"FltI":"flattenImage"
			}[myID]
			}
		],{}).catch(console.log);
	}else{
		nas.axeCMC.execSingleCommand(myID);
	};
};
//-------------------nas.axeCMC.doInSelectedItems(myFunction,undoString)
/*nas.axeCMC.doInSelectedItems(myFunction,undoString)

processAbortを組んだほうが良さそうグローバルじゃなくて　nas配下

*/
nas.axeCMC.doInSelectedItems = function(myFunction){
	var currentFrame=nas.axeVTC.getCurrentFrame();//?
	var selectedItems = this.getSelectedItemId();

	if(selectedItems.length){
		for(var ix=0;ix<selectedItems.length;ix++){
			this.getItemById(selectedItems[ix]);
			(myFunction)();
		};
	  this.selectItemsById(selectedItems);//復旧
	};
};

//=================================================アニメーションモード取得
/*nas.axeCMC.getAnimationMode()
引数:なし
戻値:String　//"frameAnimation","timelineAnimation","timelineAnimationNI","NI"

アニメーションモードを検査する関数
状態の遷移を以下のようにする
アニメーション初期化前	NI
フレームアニメーションモード	frameAnimation
タイムラインアニメーションモード	timelineAnimation timelineAnimationNI
さらに
タイムラインアニメーションモードにはサブモードとしてタイムライン初期化前・後 がある
識別するモードは以上4種

CS6以降のアニメーションモードはアニメーション初期化前がデフォルト

確認の手順
背景レイヤのみのドキュメントは、タイムラインの初期化が行われていないので除外
AMコードでタイムラインのdurationを取得
初期化済みのタイムラインモードでは必ず1フレーム以上継続時間があるので判定
フレームアニメ用移動を行う　次＞前
エラーが無ければフレームアニメーションモード
エラーが発生した場合は初期化前のビデオタイムラインモードまたはアニメーション初期化前である
この時点で　総レイヤ数が1以上

*/
nas.axeCMC.getAnimationMode = async function(){
var myResult="timelineAnimation";
var flatOne=((app.activeDocument.layers.length==1)&&(app.activeDocument.backgroundLayer))? true:false ;
	if(! flatOne){
		var duration = await nas.axeVTC.getDuration();
		if(duration) return myResult;//取得できたので長さのあるビデオタイムライン
//継続時間があれば必ずタイムラインモードなので以降のチェックをスキップ
	};
	var res = await action.batchPlay([
		{"_obj":"copyEvent","_target":[{"_enum":"ordinal","_ref":"animationFrameClass"}]}
	],{});
	if(res[0].result== -25920){
//フレームアニメーションのエラーを受けた場合は基本的にタイムラインモード 未初期化状態を確認
		if(flatOne){
			action.batchPlay([{
				"_obj":"set",
				"_target":[{"_property":"background","_ref":"layer"}],
				"layerID":app.activeDocument.layers[0]._id,
				"to":{
					"_obj":"layer",
					"mode":{"_enum":"blendMode","_value":"normal"},
					"opacity":{"_unit":"percentUnit","_value":100.0}
				}
			}],{});//アクティブレイヤーは背景を変換した"layer０"
//			app.activeDocument.activeLayers[0]
		}
//改めて継続時間を取得
		myResult=(await nas.axeVTC.getDuration() == 0)? "NI":"timelineAnimationNI";
		if(flatOne)nas.axeCMC.undo(1);
	}else{
		myResult="frameAnimation";
	};

 return myResult;
};
//=======================　セレクト状態のレイヤ配列を取得
/**
 *	現在選択されているレイヤーの配列を返す
 *	@params {Boolean}	expandOption
 * オプションが有効な場合はArtLayerのみの配列を返す
 */
nas.axeCMC.getSelectedLayers = function(expandOption){
	if(expandOption) return app.activeDocument.activeLayers.filter(function(e){return (e.kind == 1)});
	return Array.from(app.activeDocument.activeLayers);
}
//=======================　セレクト状態のアイテムID取得
/*nas.axeCMC.getSelectedItemId()
引数:なし
戻値:現在アクティブなアイテムIDの配列

アイテムIDは、内部アイテムID レイヤコレクションのindexではない
DOMのレイヤーオブジェクトのidプロパティと互換あり
UXPはレイヤプロパティ ._idとしてこのIDを持っている
返り値の並び順は下から
*/
nas.axeCMC.getSelectedItemId=function(){
	return Array.from(app.activeDocument.activeLayers,(e)=> e._id);
};
//======================= IDでアイテムを取得
/* nas.axeCMC.getItemById(idx)
引数:idx アイテムindex
戻値:layerItemObject (レイヤセット・ビデオグループ・調整レイヤ等のアイテムを含むLayer)
参考スクリプトは背景レイヤを除外してあったが、背景レイヤもハンドリングする
アイテムをアクティベートしてアクティブアイテムで戻すので、必ず選択操作が伴う
*/
nas.axeCMC.getItemById =function(idx){
	var itm = app.activeDocument.layers.find((e) => e._id == idx);
	if(itm){
		itm.selected = true;
		return itm;
	}else{
		return null;
	};
};
//======================= IDでアイテムを取得
/* nas.axeCMC.getItemsById([idx])
引数:idx アイテムindex配列
戻値:layerItemObject (レイヤセット・ビデオグループ・調整レイヤ等のアイテムを含むLayer)配列
*/
nas.axeCMC.getItemsById =function(idx){
	if(!(idx instanceof Array)) idx = [idx];
	var result = [];
	Array.from(app.activeDocument.layers).forEach((e) =>{if(idx.indexOf(e["_id"]) >= 0) result.push(e);});
	return result;
};
//======================= IDでアイテムを取得DOM版
/* nas.axeCMC.getItemByLidD(idx)
引数:idx レイヤindex
戻値:layerItemObject (レイヤセット・ビデオグループ・調整レイヤ等のアイテムを含むLayer)
マッチIDがない場合は null
ダメでした　Layer.idはアクションマネージャのidと互換性無い　セッションユニークidだった
よって基本的に意味なし
全アイテム取得のほうが使い道あり？
*/
nas.axeCMC.getItemByLid =function(idx,myTrailer){
	if(! idx){idx=0;};//指定なければ0で数値化
	if(! myTrailer){myTrailer=app.activeDocument.layers;};//指定がない場合はアクティブドキュメントのルートトレーラー
	for(
		var layerId=0;
		layerId < myTrailer.length;
		layerId++
	){
//			IDがマッチしたらレイヤを返す
		if(myTrailer[layerId].id==idx){return myTrailer[layerId]};
		//	レイヤがトレーラーであっても無くても戻す
		//	さらにレイヤがトレーラであってアイテムを内包する場合 再帰呼び出しをかけて
		if((myTrailer[layerId].typename =="LayerSet")&&(myTrailer[layerId].layers.length)){
			var myReturn=this.getItemByIdD(idx,myTrailer[layerId].layers);
			if(myReturn){return myReturn;};//戻り値がnull以外ならそこで終了
		};
	};
//	マッチしないのでnull
	return null;
};
//======================= 全アイテム（隠しアイテム除外）取得
/* nas.axeCMC.getAllItems(myTrailer)
 *	@params  {Object LayerSet | LayerSet.layers} myTrailer
引数:取得するレイヤセットまたはレイヤセットのレイヤトレーラー
戻値:指定トレーラーの配下のレイヤアイテム全て
全アイテム取得
*/
nas.axeCMC.getAllItems =function(myTrailer){
	if(! myTrailer){myTrailer = app.activeDocument.layerTree;};//指定がない場合はアクティブドキュメントのルートトレーラー
	if(myTrailer.isGrouLayer) myTrailer = myTrailer.children;
	if(! myTrailer.length) return null;

	var myResult= [];//戻り値
	for( var layerId=0 ; layerId < myTrailer.length; layerId++){
		//	レイヤをリザルトに積む
		myResult.push(myTrailer[layerId]);
		//	さらにレイヤがトレーラであってアイテムを内包する場合 再帰呼び出しをかけてリザルトを積む
		if((myTrailer[layerId].isGrouLayer)&&(myTrailer[layerId].children.length)){
			var myResult=myResult.concat(this.getAllItems(myTrailer[layerId].children));
		};
	};
//	フラットなレイヤトレーラ配列を返す
	return myResult;
};

//=======================ID配列を与えてアイテムを選択状態にする
/*nas.axeCMC.selectItemsById(idx:Array)
引数:選択状態にするアイテムID配列
戻値:処理成功時は、選択状態にしたアイテム数　エラー終了時は -1
単独で指定をかけることもできるが、戻り値はアイテム自身ではない

*/
nas.axeCMC.selectItemsById=function(idx){
	if (!( idx instanceof Array )) idx = [ idx ];
	var result  = [];
	for(var ix = 0;ix < idx.length ; ix++){
		result.push(app.activeDocument.layers.find((e)=>e._id == idx[ix]));
	};
	var context = [
		{"_obj":"selectNoLayers","_target":[{"_enum":"ordinal","_ref":"layer"}]}
	];
//全解除
	if(idx.length > 0) context.push({
		"_obj":"select",
		"_target":[{"_name":result[i].name,"_ref":"layer"}],
		"layerID":[idx[0]],
		"makeVisible":false
	});
//第一要素選択
	if(idx.length > 1){
		for( var i = 1; i < idx.length; i++ ){
			context.push({
				"_obj":"select","_target":[{"_name":result[i].name,"_ref":"layer"}],
				"layerID":idx.slice(0,i+1),
				"makeVisible":false,
				"selectionModifier":{"_enum":"selectionModifierType","_value":"addToSelection"}
			});
		};//存在すれば第２要素以降を追加選択
	};

	action.batchPlay(context,{});

	return result.length;
//戻り値は以前と同仕様 レイヤ配列が必要な場合は activeLayersを参照
};
// =================== UNDOバッファを使用して復帰
/*　nas.axeCMC.undo(undoCount)
引数: undoCount undoする回数
戻値:成功したundo回数
	指定回数のundo実行　指定のない場合は1回のみ
	これよりはヒストリをさかのぼって消去の方が良いか？
	ヒストリの総数チェックは保留
*/
nas.axeCMC.undo=function(undoCount){

	if(typeof undoCount=="undefined"){undoCount=1;}
	action.batchPlay([
		{"_obj":"select","_target":[{"_offset":-undoCount,"_ref":"historyState"}]},
	],{});
	return undoCount;
};
//=======================　undo保留を判定してコードを実行　CMCへ
/*nas.axeCMC.evalA(undoString,codeChip)
引数:undoString : コード片
戻値:なし
*/
nas.axeCMC.evalA=function(undoString,codeChip){
 if((app.documents.length)&&(app.activeDocument.suspendHistory)){
     app.activeDocument.suspendHistory(Function(codeChip),undoString);
 }else{
     Function(codeChip)();
 };

//suspendHistory(callback,<histrylabel>)
};

//==================アクティブレイヤがヘッド位置か否かを返す 可能な限り高速な判定が望ましい
//キャッシュを打つ？
/*nas.axeCMC._isBlocked()
引数:なし
戻値:ブール　true:編集ブロック状態/false:編集可能状態
	エラー検出で対象レイヤが現在編集可能か否かをチェックする関数
	編集可能なアートレイヤであるか否か・背景レイヤであるか否かも判定が必要
*/
nas.axeCMC._isBlocked= async function(myLayer){

//     app.displayDialogs = DialogModes.NO
	var currentLyr = app.activeDocument.activeLayers[0];
	if(!myLayer){myLayer = currentLyr};
	if(myLayer ===app.activeDocument.backgroundLayer) return false ;//背景レイヤならばfalseを返す
	if(myLayer.isGroupLayer) return true ;//レイヤセットならばtrueを返す
	var res = await action.batchPlay([
		{
			"_obj":"fill",
			"mode":{"_enum":"blendMode","_value":"darken"},
			"opacity":{"_unit":"percentUnit","_value":100.0},
			"using":{"_enum":"fillContents","_value":"white"}}
	],{});
	if(res[0].result == -25920){
			//復帰は必要か？
			return false;
	}else{
		action.batchPlay([
			{"_obj":"select","_target":[{"_enum":"ordinal","_ref":"historyState","_value":"previous"}]}
		],{});
		return true;
	};
};
//========================================ビデオグループ判定
/*nas.axeCMC._isVideoGroup()
引数:なし
戻値:ブール
ビデオグループの判定

レイヤセット内のアートレイヤを選択した状態で
プレイヘッドをタイム０へ移動してスタートトリミングする

エラーが出たらビデオグループ　他のエレメントではエラーが発生しない…はず
タイムラインモードであることが判定条件なので　アニメーションモード時はいったんモード変更する必要あり

*/
nas.axeCMC._isVideoGroup=function(){
	
	var myTarget=app.activeDocument.activeLayers[0];
	if(! myTarget) return null;
	if(!(myTarget.isGroupLayer)){return false};//レイヤセットでないことを確認
	var AM=nas.axeCMC.getAnimationMode();//アニメーションモード取得
	var byDummy=false;//ダミーアイテムを作ったか否か
	//レイヤセットのメンバーがあるか否かをチェック　レイヤセットのメンバーがない場合は、ダミーレイヤを作成する
	var currentArtLayerLength=myTarget.children.length;

	var myEx="";
	myEx+='switch(AM){';
	myEx+='case "frameAnimation":nas.axeCMC.execWithReference("convertAnimation");break;';
	myEx+='case "NI":nas.axeCMC.execNoDescriptor("makeTimeline");break;';
	myEx+='}';
	myEx+='if(currentArtLayerLength==0){';
	myEx+='	var myTestLayer=myTarget.artLayers.add();';
	myEx+='	byDummy=true;';
	myEx+='}';
	myEx+='var myTestLayer=myTarget.artLayers[0];';
	myEx+='app.activeDocument.activeLayer=myTestLayer;';//アクティブレイヤセット
	myEx+='app.activeDocument.activeLayer.name=app.activeDocument.activeLayer.name;';//捨て操作

//	プレイヘッドをタイム0へ
	nas.axeCMC.execWithReference("timelineGoToFirstFrame");
//	スタートトリミング
	app.activeDocument.suspendHistory("----",myEx);
//	eval(myEx);
	try{
   var desc = new ActionDescriptor();
   var ref  = new ActionReference();                 
    ref.putEnumerated( charIDToTypeID( 'Mn  ' ), charIDToTypeID( 'MnIt' ), stringIDToTypeID("timelineTrimLayerStart") );     
    desc.putReference( charIDToTypeID( 'null' ), ref ); 
    executeAction( charIDToTypeID( 'slct' ), desc, DialogModes.NO );
//	コード片を実行してエラーが出ればビデオグループである
//	それ以外は通常のレイヤセットなのでfalseを返す
	}catch(er){
	//処理のための操作を復帰
//	if(byDummy){myTestLayer.remove();};
	if((AM).indexOf("timeline")==-1){nas.axeCMC.undo();}
	app.activeDocument.activeLayer=myTarget;//アクティブレイヤセット
		return true;
	};
// ===================成功時のみ UNDOバッファを使用して復帰
    var desc = new ActionDescriptor();
    var ref  = new ActionReference();
        ref.putEnumerated( charIDToTypeID( "HstS" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Prvs" ) );
        desc.putReference( charIDToTypeID( "null" ), ref );
executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );

//	if(byDummy){myTestLayer.remove();};
//	if((AM).indexOf("timeline")==-1){nas.axeCMC.undo();}
	app.activeDocument.activeLayer=myTarget;//アクティブレイヤセット
		return false;
};
//=========================eps|aiファイルを配置
/*nas.axeCMC.placeEps(filePath)
引数:文字列/ファイルパス
戻値:新規に追加されたレイヤオブジェクト
	ファイルを指定してスマートオブジェクトとして配置する
timeSheet6sA3
*/

nas.axeCMC.placeEps=function(myFile){
	fs.getPluginFolder().then((f)=>{
		f.getEntry(
			nas.File.resolve("nas/lib/resource/",(myFile+".ai")).replace(/^\//,'')
		).then(fs.createSessionToken).then(
			(t)=>{
				action.batchPlay(
					[
						{
							"ID":4,
							"_obj":"placeEvent",
							"antiAlias":true,
							"as":{
								"_obj":"PDFGenericFormat",
								"antiAlias":true,
								"clippingPath":true,
								"crop":{
									"_enum":"cropTo",
									"_value":"boundingBox"
								},
								"pageNumber":1,
								"selection":{
									"_enum":"pdfSelection",
									"_value":"page"
								},
								"suppressWarnings":false
							},
							"freeTransformCenterState":{
								"_enum":"quadCenterState",
								"_value":"QCSAverage"
							},
							"null":{
								"_kind":"local",
								"_path":t
							},
							"offset":{
								"_obj":"offset",
								"horizontal":{
									"_unit":"distanceUnit",
									"_value":0.0
								},
								"vertical":{
									"_unit":"distanceUnit",
									"_value":0.0
								}
							}
						}
					],{}
				)
			}
		)
	}).catch(console.log);
	return app.activeDocument.activeLayers[0];
};

//========== アクティブなレイヤのあるレイヤセット内で最も表示順位の高いレイヤをアクティブにする
/*nas.axeCMC.focusTop()
引数: なし
戻値: アクティベートしたレイヤ

*/
nas.axeCMC.focusTop=function(){
	var kwd="Bckw";
	if(app.activeDocument.activeLayers[0].parent == null){
		var group = app.activeDocument.layerTree;
	}else{
		var group = app.activeDocument.activeLayers[0].parent.children;
	};
	var context = [{
		"_obj":"select",
		"_target":[{"_name":group[0].name,"_ref":"layer"}],
		"layerID":[group[0]._id],
		"makeVisible":false
	}];
	if(!(group[0].visible)) context.push({
			"_obj":"select",
			"_target":[{"_enum":"ordinal","_ref":"layer","_value":'backwardEnum'}]
		});
console.log(JSON.stringify(context,0,2));
	action.batchPlay( context ,{});//historyStateInfo:{name:"focusTop",target:app.activeDocument._id}
	return app.activeDocument.activeLayers[0];
};
// =======================レイヤフォーカス移動
/*nas.axeCMC.moveFocus(kwd)
引数:移動キーワード Frwr で前面へ Bckw で後面へ　
戻値:移動後のアクティブレイヤ
		これはデフォルトのショートカットと動作が同じ
表示（可視）状態のレイヤ間でのみ移動が発生するのでフレームアニメーションモードでは十分注意されたし
*/
nas.axeCMC.moveFocus = function(myFocusWord){
	if((myFocusWord=='Bckw')||(myFocusWord=='Frwr'))
	myFocusWord = {'Bckw':'backwardEnum','Frwr':'forwardEnum'}[myFocusWord];
	action.batchPlay([
		{
			"_obj":"select",
			"_target":[{"_enum":"ordinal","_ref":"layer","_value":myFocusWord}]
		}
	],{});
};

// ==================================レイヤフォーカスをループ移動
/*nas.axeCMC.loopFocus(kwd)
引数: 移動方向キーワード Frwr,Bckw
戻値:アクティブレイヤ
	標準の動作をラップしてループ移動をさせる
	移動後にアクティブレイヤのトレーラーを以前と比較して異なっていたら
	前面移動時はトレーラーの底（最後面）へ
	後面移動時はトレーラーの表（最前面）へ移動…
	ループ先が非表示の場合は、表示されちゃうのでご注意
*/
nas.axeCMC.loopFocus = function(myFocusWord){
	if((myFocusWord=='Bckw')||(myFocusWord=='Frwr'))
	myFocusWord = {'Bckw':'backwardEnum','Frwr':'forwardEnum'}[myFocusWord];
	var myParent = app.activeDocument.activeLayers[0].parent;//親Trailerを記録
	if (!myParent) myParent = app.activeDocument;
	if(myParent === app.activeDocument){
		var myLoopTarget=(myFocusWord=="backwardEnum")? 
		app.activeDocument.layerTree[0]:app.activeDocument.layerTree[app.activeDocument.layerTree.length-1];
	}else{
		var myLoopTarget=(myFocusWord=="backwardEnum")? 
			myParent.children[0]:myParent.children[myParent.children.length-1];
	};
	this.moveFocus(myFocusWord);
//移動後にレイヤトレーラーを判定
	var newParent = app.activeDocument.activeLayers[0].parent;
	if(! newParent) newParent = app.activeDocument
	if(
		(myParent._id != newParent._id)
//		(myParent === newParent)
	){
		action.batchPlay([
			{
				"_obj":"select",
				"_target":[{"_name":myLoopTarget.name,"_ref":"layer"}],
				"layerID":[myLoopTarget._id],
				"makeVisible":true
			}
		],{});
	};
	return app.activeDocument.activeLayers[0];
};
//========ラベルカラーを設定
/*
引数:カラーコード
					"Rd  ":"red",
					"Orng":"orange",
					"Ylw ":"yellowColor",
					"Grn ":"grain",
					"Bl  ":"blue",
					"Vlt ":"violet",
					"Gry ":"gray",
					"None":"none"
戻値:ディスクリプタ

*/
nas.axeCMC.applyLabelColored =function(_color){
	var labelColorCode = {
		"Rd  ":"red",
		"Orng":"orange",
		"Ylw ":"yellowColor",
		"Grn ":"grain",
		"Bl  ":"blue",
		"Vlt ":"violet",
		"Gry ":"gray",
		"None":"none"
	};
	if(Object.keys(labelColorCode).indexOf(_color) >= 0) _color = labelColorCode[_color];
	action.batchPlay([
		{
			"_obj":"set",
			"_target":[
				{"_enum":"ordinal","_ref":"layer"}
			],
			"to":{
				"_obj":"layer",
				"color":{"_enum":"color","_value":_color}
			}
		}
	],{});
};


//axeVTC VideoTimelineClass　PhotoshopのVideoTimeline系操作を格納するオブジェクト

/*
: nas.axeVTC.getCurrentFrame() 再生ヘッドの現在位置を取得
: nas.axeVTC.getFrameRate() ビデオタイムラインのフレームレートを取得
: nas.axeVTC.setFrameRate(myValue,myOption) ビデオタイムラインのフレームレートを設定
: nas.axeVTC.getTimelineDuration(resultForm) コンポ継続時間を取得　指定形式
: nas.axeVTC.getDuration(resultForm)　コンポ継続時間を取得　形式指定
: nas.axeVTC.moveInPoint(myOffset)	オフセット指定してレイヤーのIN点を移動
: nas.axeVTC.moveOutPoint(myOffset)	オフセット指定してレイヤーのOUT点を移動
: nas.axeVTC.playheadMoveTo(dest)　フレーム指定で再生ヘッドを移動
: nas.axeVTC.playheadMoveToOpcityKey(myWord) 不透明度キーフレームを使ったヘッド移動
: nas.axeVTC.setDuration(myLength)　レイヤーの継続時間を設定
: nas.axeVTC.getInPoint()　レイヤーのIN点を取得(未完成)
*/
/*
[
{"_obj":"select","_target":[{"_name":"レイヤー 0","_ref":"layer"}],"layerID":[2],"makeVisible":false},
{"_obj":"hide","null":[{"_enum":"ordinal","_ref":"layer"}]},
{"_obj":"show","null":[{"_enum":"ordinal","_ref":"layer"}]},
{"_obj":"convertAnimation"},
{"_obj":"set","_target":[{"_property":"time","_ref":"property"},{"_ref":"timeline"}],"to":{"_obj":"timecode","frame":22,"frameRate":29.97,"seconds":1}},
{"_obj":"set","_target":[{"_property":"time","_ref":"property"},{"_ref":"timeline"}],"to":{"_obj":"timecode","frame":22,"frameRate":29.97,"seconds":1}},
{"_obj":"set","_target":[{"_property":"time","_ref":"property"},{"_ref":"timeline"}],"to":{"_obj":"timecode","frame":0,"frameRate":29.97,"seconds":1}},
{"_obj":"set","_target":[{"_property":"documentTimelineSettings","_ref":"property"},{"_ref":"timeline"}],"frameRate":24.0},
{"_obj":"convertTimeline"}
]
*/

//	nas.axeVTC=new Object();

//=======================================================カレントフレーム取得
/*
ビデオタイムラインが初期化されていない場合はfalseが戻る　が
判定が重いと操作が混乱するタイプの取得ルーチンなので判定は一考の余地あり
*/
nas.axeVTC.getCurrentFrame= async function() {
/*このコマンドの問題点　2015.03.15
背景レイヤのみのドキュメントではアニメーションモードにかかわらずエラー発生（nullを戻す）
上記以外の場合フレームアニメーションモードでは、必ず０が戻るっぽい
よってタイムラインアニメーションでかつタイムラインの初期化が終了している場合以外は、戻り値がアテにならない
使いドコロ要注意　代わりにモード判定に使える
*/
	var frm = await action.batchPlay([
		{"_obj":"get","_target":[{"_property":"currentFrame","_ref":"property"},{"_ref":"timeline"}]}
	],{});
	if(frm) return frm[0].currentFrame;
	return null;
};
//======================================================フレームレート取得
/*nas.axeVTC.getFrameRate()
	@returns {Number}
引数:なし
戻値:フレームレート
	タイムライン初期化前では戻り値がnull
*/
nas.axeVTC.getFrameRate = async function(){  
	var dat = await action.batchPlay([
		{
			"_obj":"get",
			"_target":[
				{"_property":"documentTimelineSettings","_ref":"property"},
				{"_ref":"timeline"}
			]
		}
	],{});
	if(dat) return dat[0].frameRate;
	return null;
};
//==========================タイムラインのフレームレートを設定
/*nas.axeVTC.setFrameRate(myValue,force)
引数:設定するフレームレート数値 fps 0以下は不正値　小数値指定はOK:強制オプション　ブール
戻値:設定されている値nas.FRATEとの同期をとるために同じ値をnas.FRATEにセットする
	引数が省略された場合は、現在のnas.FRATEをドキュメントに対して設定する
	オプションtrueで単独設定可
nas.axeVTC.setFrameRate()	←nas.FRATEの値をドキュメントにセット
nas.axeVTC.setFrameRate(24)	←nas.FRATEへ同時に24を代入する
nas.axeVTC.setFrameRate(30,true)←ドキュメントのみ30fpsにする(nas.FRATEは手を付けず)
*/
nas.axeVTC.setFrameRate=function(myValue,myOption){
	if((!myValue)||(myValue<=0)) myValue = nas.FRATE.rate;
	if(!myOption) myOption = false;

	action.batchPlay([
		{
			"_obj":"set",
			"_target":[
				{"_property":"documentTimelineSettings","_ref":"property"},
				{"_ref":"timeline"}
			],
			"frameRate":myValue
		}
	],{});
	return nas.axeVTC.getFrameRate();
};
//==================================== ドキュメントの継続時間をTCで取得
/* nas.axeVTC.getTimelineDuration()
	@paramas {Number}	resultForm
	@returns {Number|String}
 引数:戻値の指定形式　0:TC文字列 1:TC配列 2:フレーム数
 戻値:フレーム数　または　TC配列　または　TC文字列 または null
ビデオタイムラインモード以外ではnull
*/
nas.axeVTC.getTimelineDuration = async function(resultForm){  
  try{
	var myResult=null
	var dat = await action.batchPlay([
		{
			"_obj":"get",
			"_target":[
				{"_property":"documentTimelineSettings","_ref":"property"},
				{"_ref":"timeline"}
			]
		}
	],{});
	var H=(dat[0].duration.hours)?  dat[0].duration.hours:0;
	var M=(dat[0].duration.minutes)?dat[0].duration.minutes:0;
	var S=(dat[0].duration.seconds)?dat[0].duration.seconds:0;
	var F=(dat[0].duration.frame)?  dat[0].duration.frame:0;
	var FR=dat[0].frameRate;
	var myTC=[nas.Zf(H,2),nas.Zf(M,2),nas.Zf(S,2),nas.Zf(F,2)].join(":");

	switch(resultForm){
	  case 2:;//frames
		myResult=nas.FCT2Frm(myTC,FR);//迂遠だけどこの方が良い
	  break;
	  case 1:;//nasCalc互換TC配列+FR
		myResult=[[H,M,S,F],FR]
	  break;
	  default:
		myResult=myTC;
	};
  }catch(e){ return e; };
	return myResult;
};
//===========================================ドキュメントの継続時間を取得
/* nas.axeVTC.getDuration(resultForm)
	@params {Number} resultForm
	@returns {Number|String}

 引数:戻値の指定形式　0:TC文字列 1:TC配列 2:フレーム数
 戻値:フレーム数　または　TC配列　または　TC文字列
この関数は初期化前のビデオタイムラインまたはフレームアニメーションに関して
背景レイヤのみのドキュメントに対してはエラーが出るのでトラップしてnullを返し
その他の場合は常に0をリザルトする
デフォルトの戻り値はフレーム数
*/
nas.axeVTC.getDuration = async function(resultForm){
	var myResult=null
	var dat = await action.batchPlay([
		{
			"_obj":"get",
			"_target":[
				{"_property":"frameCount","_ref":"property"},
				{"_ref":"timeline"}
			]
		}
	],{});
	var myFC = dat[0].frameCount;
	switch(resultForm){
	  case 0:;//文字列TC
		myResult=nas.Frm2FCT(myFC,8,0).replace( /[\;\+\-]/g ,":");
	  break;
	  case 1:;//nasCalc互換TC配列
		myResult=Array.from(nas.Frm2FCT(myFC,8,0).replace( /\.$/ ,"").replace( /[\;\+\-]/g ,":").split(':'),e => parseInt(e));//迂遠だけどこの方が良い
	  break;
	  default:;//frames
		myResult=myFC;
	};
	return myResult;
};
//タイムラインのIN/OUT点を設定
/*
	オブジェクトメソッドにしたい　すごく　でもコンストラクタもプロトタイプも出てないからちょっとムリ
	アクティブアイテムをラッピングするエージェントを作る？んーん なるべく単純なライブラリにする
	引数はオフセット nasFCTまたはフレーム数　
nas.axeVTC.moveInPoint(myOffset)
nas.axeVTC.moveOutPoint(myOffset)

	@params {String TC|Number} myOffset

引数:オフセット量 nasFCT または フレーム数
戻値:なし

引数が0指定の場合はタイムライン端点をカレントフレームへ移動するようにトライする

*/
nas.axeVTC.moveInPoint=function(myOffset){

	if(! myOffset){myOffset=0};
	var mvTL=(myOffset)?false:true;//未指定または0の場合移動フラグを立てる
	if(isNaN(myOffset)){myOffset = nas.FCT2Frm(myOffset);};
	var idtimeOffset =(mvTL)?"time":"timeOffset";
	action.batchPlay([{
		"_obj":"moveInTime",
		idtimeOffset:{
			"_obj":"timecode",
			"hours":0,
			"minutes":0,
			"seconds":0,
			"frame":myOffset,
			"frameRate":nas.FRATE.rate
		}
	}],{});
};
nas.axeVTC.moveOutPoint=function(myOffset){
	if(! myOffset){myOffset=0};
	var mvTL=(myOffset)?false:true;//未指定または0の場合移動フラグを立てる
	if(isNaN(myOffset)){myOffset = nas.FCT2Frm(myOffset);};
	var idtimeOffset =(mvTL)?"time":"timeOffset";
	action.batchPlay([{
		"_obj":"moveOutTime",
		idtimeOffset:{
			"_obj":"timecode",
			"hours":0,
			"minutes":0,
			"seconds":0,
			"frame":myOffset,
			"frameRate":nas.FRATE.rate
		}
	}],{});
};
// ======================プレイヘッド移動
/* nas.axeVTC.playheadMoveTo(dest)
	@params	{String TC|Number frames}	dest

 引数:　行き先フレーム　nasFCT または フレーム数で
 戻値:　なし
*/
nas.axeVTC.playheadMoveTo=function(dest){
  if(!dest){dest=0};
    if(isNaN(dest)){nas.FCT2Frm(dest);};
	action.batchPlay([
		{
			"_obj":"set",
			"_target":[
				{"_property":"time","_ref":"property"},
				{"_ref":"timeline"}],
				"to":{"_obj":"timecode","frame":dest,"frameRate":nas.FRATE.rate}}
	],{});
};

//============================不透明度キーフレームを使ったヘッド移動
/*nas.axeVTC.playheadMoveToOpacityKey(kwd)
引数:移動方向　"previousKeyframe" "nextKeyframe"
戻値:移動成功時にカレントフレーム 失敗時に false
保留2022.03.01（使わないから）
*/
nas.axeVTC.playheadMoveToOpacityKey=function(kwd){
	var startFrame=nas.axeVTC.getCurrentFrame();
/*
	var idmoveKeyframe = stringIDToTypeID( kwd );
	var desc = new ActionDescriptor();
	var descOpc = new ActionDescriptor();

	descOpc.putEnumerated( stringIDToTypeID( "trackID" ), stringIDToTypeID( "stdTrackID" ), stringIDToTypeID( "opacityTrack" ) );
  desc.putObject( stringIDToTypeID( "trackID" ), stringIDToTypeID( "animationTrack" ), descOpc );
executeAction( idmoveKeyframe, desc, DialogModes.NO );
	var endFrame=nas.axeVTC.getCurrentFrame();
if(startFrame==endFrame){return false;}else{return endFrame;}
*/
};


//==================アクティブレイヤに継続時間をセット
/*nas.axeVTC.setDuration(myLength)
	@params	{Number|String FTC}
引数:整数　または　nasFCT
戻値:なし
	out点をタイムライン継続時間分前方オフセットする＝必ず1フレーム長になる
	(指定フレーム数-1)後方オフセットして指定長のレイヤにする
	nas.FRATEを参照するので、実行前にnas.FRATEがタイムラインのフレームレートと一致している必要あり
*/
nas.axeVTC.setDuration = function(myLength){
	if(app.activeDocument.activeLayers[0].isGroupLayer){return false}
	if(isNaN(myLength)) myLength=nas.FCT2Frm(myLength);
    if(myLength >= 1){
        this.moveOutPoint(this.getDuration() * -1);
        if(myLength > 1) this.moveOutPoint(myLength-1);
    };
};

//====================アクティブレイヤのIN点を取得
/*
	タイムラインのIN点を取得　実験コード　あとでヒストリ操作
間違い　durationの取得ができないのでIN点の取得も不能　後ほど調整
しょうがないのでアレで書く…チェックがもう少し早けりゃ　フレーム移動してるからダメか

*/

nas.axeVTC.getInPoint=function(){
/*
アクティブアイテムを判別
	背景レイヤ→inPoint=0;return inPoint;
	レイヤセットならば取得はスキップ
	アートレイヤーのみ取得する
	０からスキャン
*/
	var myTarget=app.activeDocument.activeLayers[0];
	if (myTarget.isGroupLayer){return false;}
	if (myTarget === app.actibeDocument.backgroundLayer){return 0;}
var currentDuration=this.getDuration();var currentFrame=this.getCurrentFrame();
var inPoint=0;
for (var inPoint=0;inPoint<currentDuration;inPoint++){this.playheadMoveTo(inPoint);if(!(nas.axeCMC._isBlocked())){this.playheadMoveTo(currentFrame);return inPoint;}}
/*	durationが取得可能ならこの方が早い…かも知れない
	var currentHeadPosition=nas.axeVTC.getCurrentFrame();//ヘッド位置を取得
	  if(currentHeadPosition!=0){nas.axeVTC.playheadMoveTo(0);}//移動の必要があればヘッドを0フレームへ
	var timelineDuration=nas.axeVTC.getTimelineDuration(2);//タイムラインの長さをフレームで取得
	  nas.axeVTC.moveInPoint(0);//引数0でIN点を0フレームへ移動
	var offsetDuration=nas.axeVTC.getTimelineDuration(2);//タイムラインの長さをフレームで取得
// alert(timelineDuration+":"+offsetDuration) ;//<前後で尺の差はない
	var myInpoint=offsetDuration-timelineDuration;//durationの前後差を使って先のタイムラインの開始位置を取得
	  nas.axeVTC.moveInPoint(myInpoint);//差分を使ってタイムラインを復帰
	  if(currentHeadPosition!=0){nas.axeVTC.playheadMoveTo(currentHeadPosition)};//ヘッド位置を復帰
	return myInpoint;//フレームで戻す
*/
};

//=====================再生ヘッド移動抽象化ラッパー
/*nas.axeVTC.goFrame(kwd)
引数:キーワード f,p,n,e いずれか
戻値:カレントフレーム 移動失敗時はfalse

以下の判定動作を行う
オプションがあれば、アクティブレイヤが第二階層レイヤまたは第三階層レイヤで親トレーラが第二階層でかつ第一階層と同名であった場合
指定方向に対して第一階層レイヤセットの不透明度キーに対してキーフレーム移動を試みる
失敗した場合は、ループを行う
またはそれ以外の場合は指定フレーム分移動する　移動に失敗した場合（タイムラインの両端）ループ

オプション指定が存在する場合、移動の結果アクティブレイヤが編集不能状態になった場合　移動方向に合わせてレイヤのフォーカスをループ移動する

*/
nas.axeVTC.goFrame=function(kwd){
	var currentHeadPos=this.getCurrentFrame();
	var destHeadPos;
	var currentDuration=this.getDuration();
	var currentLyr=app.activeDocument.activeLayer;
	var keyHolder=currentLyr;//
	if ((keyHolder.parent.typename =="LayerSet")&&(keyHolder.parent.parent === app.activeDocument )){keyHolder=currentLyr.parent;};//第一階層フォルダなら移行
	if ((keyHolder.parent.name == keyHolder.parent.parent.name )&&(keyHolder.parent.parent !== app.activeDocument )){keyHolder=keyHolder.parent.parent;};//同名フォルダなら親へ移行
 switch (kwd){
  case "f":;
  case "start":;
	this.playheadMoveTo(0);
	destHeadPos=this.getCurrentFrame();
	break;
  case "e":;
  case "end":;
	this.playheadMoveTo(currentDuration);
	destHeadPos=this.getCurrentFrame();
	break;
  case "n":
  case "next":
	if(nas.axe.useOptKey){
		app.activeDocument.activeLayer=keyHolder;
	destHeadPos=this.playheadMoveToOpacityKey("nextKeyframe");
	 if(destHeadPos===false){
		this.playheadMoveTo(0);
		destHeadPos=0;
	 };
	 	app.activeDocument.activeLayer=currentLyr	;
	}else{
		this.playheadMoveTo((currentHeadPos+nas.axe.skipFrames)%currentDuration);
		destHeadPos=this.getCurrentFrame();
	};
	break;
  case "p":
  case "previous":
	if(nas.axe.useOptKey){
		app.activeDocument.activeLayer=keyHolder;
	destHeadPos=this.playheadMoveToOpacityKey("previousKeyframe");
	 if(destHeadPos===false){
		this.playheadMoveTo(currentDuration);
		destHeadPos=this.playheadMoveToOpacityKey("previousKeyframe");
	 };
	 	app.activeDocument.activeLayer=currentLyr	;
	}else{
		this.playheadMoveTo((currentHeadPos-nas.axe.skipFrames+currentDuration)%currentDuration);
		destHeadPos=this.getCurrentFrame();
	};
 	break;
 };
//移動後にアクティブレイヤが編集可能か否かを判定
 if(nas.axe.focusMove){
  if(nas.axeCMC._isBlocked()){
	var myTrailer=app.activeDocument.activeLayer.parent;
	var myLayerCount =app.activeDocument.activeLayer.parent.layers.length;
    switch(kwd){
     case "s":;
     case "start":;
	app.activeDocument.activeLayer=myTrailer.layers[myLayerCount-1];
	break;
     case "e":;
     case "end":;
	app.activeDocument.activeLayer=myTrailer.layers[0];
	break;
     case "n":;
     case "next":;
	nas.axeCMC.loopFocus("Frwr");
	break;
     case "p":;
     case "previous":;
	nas.axeCMC.loopFocus("Bckw");
	break;
    };
  };
 };
};
// ==========================================キートラックを有効・無効
/*nas.axeVTC.switchKeyTrack(kwd)
引数:キーワード　"enable" "disable"
戻値:
*/
nas.axeVTC.switchKeyTrack = function(kwd){
var idSwitch = stringIDToTypeID( kwd );
    var descSwitch = new ActionDescriptor();
        var refSwitch = new ActionReference();
        var idTrack = stringIDToTypeID( "opacityTrack" );//opacityTrack,sheetPositionTrack,styleTrack
        refSwitch.putEnumerated( stringIDToTypeID( "animationTrack" ), stringIDToTypeID( "stdTrackID" ), idTrack );
    descSwitch.putReference( charIDToTypeID( "null" ), refSwitch );
return executeAction( idSwitch, descSwitch, DialogModes.NO );
};
// =================================アニメーションキーフレーム追加・削除
/*nas.axeVTC.switchKeyFrame (kwd)
引数:キーワード　"Mk  " "Dlt "
戻値:
*/
nas.axeVTC.switchKeyFrame = function(kwd){
var idSwitch = charIDToTypeID( kwd );
    var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass( stringIDToTypeID( "animationKey" ) );
        var idTrack = stringIDToTypeID( "opacityTrack" );//opacityTrack,sheetPositionTrack,styleTrack
        ref.putEnumerated( stringIDToTypeID( "animationTrack" ), stringIDToTypeID( "stdTrackID" ), idTrack );
    desc.putReference( charIDToTypeID( "null" ), ref );
return executeAction( idSwitch, desc, DialogModes.NO );
};
// =======================================キー補間法の設定
/*nas.axeVTC.switchKeyInterp(kwd)
引数:キーワード　"hold" "Lnr "
戻値:
キーが選択状態である必要性あり ヘッド位置である必要は無い
*/
nas.axeVTC.switchKeyInterp = function(kwd){
    var desc = new ActionDescriptor();
        var ref = new ActionReference();
         ref.putProperty( charIDToTypeID( "Prpr" ), stringIDToTypeID( "animInterpStyle" ) );
        ref.putEnumerated( stringIDToTypeID( "animationKey" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
    desc.putReference( charIDToTypeID( "null" ), ref );
    var idInterp = (kwd=="Lnr ")?charIDToTypeID("Lnr "):stringIDToTypeID("hold");
    desc.putEnumerated( charIDToTypeID( "T   " ), stringIDToTypeID( "animInterpStyle" ), idInterp );
return executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO );
};
// ===============================アクティブレイヤ指定時間位置のキーを選択
/*nas.axeVTC.selectAnimationKeyAtPlayhead(selectionAdd,frame,keyKind)
引数:selectionAdd/bool 追加フラグ frame/Int  指定フレーム　keyKind/String　キー種別
戻値:
指定がない場合は、追加なし　カレント位置　不透明度キーを操作
後ほど複数選択等の操作を記録すること
このメソッドは時間位置が完全に一致しない限り選択できないのでフレームレート変換直後は無効なケースが多々ある
*/
nas.axeVTC.selectAnimationKeyAt= function(selectionAdd,atFrame,keyKind){
	if(! selectionAdd){selectionAdd=false;};
	if(typeof atFrame == "undefined"){atFrame=this.getCurrentFrame();}
	if(typeof keyKind == "undefined"){keyKind="opacityTrack";}
    var desc = new ActionDescriptor();
            var ref = new ActionReference();
        ref.putClass( stringIDToTypeID( "animationKey" ) );
        var idKeyKind = stringIDToTypeID( keyKind );//"sheetPositionTrack","opacityTrack","styleTrack"
        ref.putEnumerated( stringIDToTypeID( "animationTrack" ), stringIDToTypeID( "stdTrackID" ), idKeyKind );
    desc.putReference( charIDToTypeID( "null" ), ref );
if(selectionAdd){
    desc.putEnumerated( stringIDToTypeID( "selectionModifier" ), stringIDToTypeID( "selectionModifierType" ), stringIDToTypeID( "addToSelection" ) );
};
        var descTC = new ActionDescriptor();
        descTC.putInteger( stringIDToTypeID( "frame" ), atFrame );
        descTC.putDouble( stringIDToTypeID( "frameRate" ), this.getFrameRate() );
    desc.putObject( charIDToTypeID( "At  " ), stringIDToTypeID( "timecode" ), descTC );
return executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
};
/*
旧コード用ラッパ関数
*/
//========== アクティブなレイヤセット内で最も表示順位の高いレイヤをアクティブにする(AFC外)
nas.axeAFC.focusTop=nas.axeCMC.focusTop;
//=================================================placeEps()
nas.axeAFC.placeEps=nas.axeCMC.placeEps;
//======================================checkAnimationMode()
nas.axeAFC.checkAnimationMode=nas.axeCMC.getAnimationMode;
//================================test code

serchActiveLayer=function(){
	//後方移動のみでまずテスト
	nas.axeCMC.execWithReference("timelineGoToNextFrame");//次のフレームへ
	if(nas.axeCMC._isBlocked()){serchActiveLayer()};
};


/* for TEST */
//nas.axeVTC.getCurrentFrame();
//nas.axeCMC.getAnimationMode();
//nas.axeCMC.execWithReference("timelineGoToPreviousFrame");
//nas.axeCMC.getSelectedItemId().join(":")
//nas.axeCMC.getItemById(0);
//nas.axeCMC.selectItemsById();
//nas.axeCMC.getItemById(12);
//nas.axeCMC.getItemByIdD(12);
//nas.axeCMC._isBlocked()
//nas.axeCMC._isVideoGroup();

//nas.axeVTC.getTimelineDuration();
//nas.axeVTC.getDuration(0);
//nas.axeVTC.timelineGoTo(frames);
//nas.axeVTC.getFrameRate()
//nas.axeVTC.setDuration(12); 
//nas.axeVTC.setFrameRate(24);
//nas.axeVTC.getInPoint()


//serchActiveLayer();
