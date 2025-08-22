/*
	レイヤトレーラー内のレイヤを逆順(下から順)でソート
	sortLayersByName.jsx
	並べ替え仕様を変更して同名のレイヤーはレイヤー順を維持してソートの対象とする2020

	ソート対象のトレーラーがルートの場合の特例を設定（予定）
		Frames _<フォルダ> [<ブラケット>] #<ナンバー開始>等の各レイヤーは別枠でソート

		/frames?/i (Frames frames frame 等)は最上位 他にあればエントリする
		/^\d+(\-\d+)?\(.+\)/ (0-0(composite)|1(BGArt)等)ラインフォルダ
		/^0(__|\/\/)\d+/ (ステージフォルダ)
		/^\d+\[.+\]/	（ジョブフォルダ）
		/^_[^_]+/ (アンダーバーフォルダ)
以上を取り分けて上部位置に配置する
上部範囲を切り分けて挿入位置を記録して
		その他　フォルダ・レイヤ問わずすべてを従来のルールで配置し直す
		正順ソート時も丈夫エリアは固定
*/
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
ErrStrs = {};ErrStrs.USER_CANCELLED=localize("$$$/ScriptingSupport/Error/UserCancelled=User cancelled the operation");try {
var myTarget=activeDocument.activeLayer.parent.layers;
if(myTarget.length>1){
	var sortOrderFrames = new Array();
	var sortOrderLines  = new Array();
	var sortOrderStages = new Array();
	var sortOrderJobs   = new Array();
	var sortOrderUbars  = new Array();
	var sortOrder       = new Array();
	for (idx=0;idx<myTarget.length;idx++){
		if (myTarget[idx].isBackgroundLayer){
			continue;//レイヤが背景であった場合はソート対象から外す
		}else if(myTarget[idx].name.match(/^\d/)){
			if(myTarget[idx].name.match(/^\d+(\-\d+)?\(.+\)/)){
				sortOrderLines.push(myTarget[idx]);
			}else if(myTarget[idx].name.match(/^0(__|\/\/)\d+/)){
				sortOrdeStages.push(myTarget[idx]);
			}else{
//				 if(myTarget[idx].name.match(/^\d+\[.+\]/))
				sortOrderJobs.push(myTarget[idx]);
			};
		}else if(myTarget[idx].name.match(/^_[^_]+/)){
			sortOrderUbars.push(myTarget[idx]);
		}else{
			sortOrder.push(myTarget[idx]);//名前でなくレイヤ参照
		};
	};
	if(sortOrderFrames.length>1){
		sortOrderFrames.sort();
	};
	if(sortOrderLines.length>1){
		sortOrderLines.sort();
	};
	if(sortOrderStages.length>1){
		sortOrderStages.sort();
	};
	if(sortOrderJobs.length>1){
		sortOrderJobs.sort();
	};
	if(sortOrder.length>1){
		sortOrder.sort(	function(a,b){
			a=nas.RZf(a.name,4);b=nas.RZf(b.name,4);
    		if( a < b ) return -1;
        	if( a > b ) return 1;
        	return 0;
    	});
    };
//連結
	sortOrder = sortOrderFrames.concat(sortOrderLines.concat(sortOrderStages.concat(sortOrderJobs.concat(sortOrderUbars.concat(sortOrder)))));

	for (idx=0;idx<sortOrder.length;idx++){
		sortOrder[idx].move(myTarget[0],ElementPlacement.PLACEBEFORE);
	}
 for(var idx=0;idx<myTarget.length;idx++){if(myTarget[idx].visible){app.activeDocument.activeLayer=myTarget[idx];break;}};
}
} catch(e){ if (e.toString().indexOf(ErrStrs.USER_CANCELLED)!=-1) {;} else{alert(localize("$$$/ScriptingSupport/Error/CommandNotAvailable=The command is currently not available"));}};

//sortLayersByName.jsx
//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};