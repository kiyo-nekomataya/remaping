/*	汎用レイヤソート関数
		アクティブレイヤの含まれるレイヤコレクションをレイヤ名でソートする。
		引数にfalseを与えると、逆順ソート（アニメのセルなら逆順が望ましい）
		同名のレイヤがある場合は、警告を出して処理は続行
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

layerSort= function(revFlag){
	if(! revFlag) revFlag=false;//
//	アクティブレイヤのトレーラーをターゲットにセットする
	var myTarget=activeDocument.activeLayer.parent.layers;
//	並び替え対称のレイヤが1つしかない場合は、並び替え不能なのでキャンセル
	if(myTarget.length<=1){return false;}
//	ソート用配列を作る
	var sortOrder=new Array();
	for (idx=0;idx<myTarget.length;idx++){
		if (myTarget[idx].isBackgroundLayer){
			continue;//レイヤが背景だったら無視
		}else{
			sortOrder.push(myTarget[idx].name);
		}
	}
		sortOrder.sort(	function(a,b){
		a=nas.RZf(a);b=nas.RZf(b);
    	if( a < b ) return -1;
        if( a > b ) return 1;
        return 0;
    });//逆順並び替え
	if (revFlag){
		sortOrder.reverse();//正順並び替え
	}
//並び替えた配列から同名レイヤのチェック
	for (idx=1;idx<sortOrder.length;idx++){
		if(sortOrder[idx-1]==sortOrder[idx]){
			alert(nas.localize(nas.uiMsg.dm015));//"同名のレイヤがあります。\n二つ目以降のレイヤは並び替えの対象になりません。"
			break;
		}
	}
	for (idx=0;idx<sortOrder.length;idx++){
		myTarget.getByName(sortOrder[idx]).move(myTarget[0],ElementPlacement.PLACEBEFORE);
	}
	return sortOrder;
}
//逆順でコール
layerSort(false).toString();

//+++++++++++++++++++++++++++++++++ここから共用
	}else{
		alert("必要なライブラリをロードできませんでした。")
	};