/*(プロジェクト初期化)
<jsx_05>

	コンテ分解スクリプト試験版
現在の解析プロジェクトを初期化します。
カラムコレクションのキーを全削除して。
初期状態のキーを作成
ページ番号およびインデックスが初期化されます。
スタビライズ設定されたソース画像のスタビライズは、このアプリケーションでは感知しないので、ユーザが自己判断で行なうこと。
支援機能はある程度サポートする。

保存は特に行なわない
それぞれのユーザの判断で行ってください。
2007.03.09
20110220
*/
//対象オブジェクトがなければ何もしない
if(!(nas["eStoryBoard"])){
//	プロジェクトが無い
alert("絵コンテ分解プロジェクトはスタートしていません。\nカット番号入力パネルを一度開いてから初期化を実行してください。")
}else{
//	ターゲットプロパティのキーをすべて削除

nas.otome.beginUndoGroup("カラムコレクション初期化");

	if(nas["eStoryBoard"].targetCC.time!=0){nas["eStoryBoard"].targetCC.time=0};//カラムコレクションのカーソルを開始フレームへ

var targetProps=[
	"pageIndex","columnPosition","columnScale","timeText","cutNumber","scaleFit","contentText","soundText"
];
//
for(idx=0;idx<targetProps.length;idx++){
	var targetProp=targetProps[idx];var defValue=nas["eStoryBoard"][targetProp].value;
	if(nas["eStoryBoard"][targetProp].numKeys){
		for(kidx=nas["eStoryBoard"][targetProp].numKeys;kidx>0;kidx--){
			nas["eStoryBoard"][targetProp].removeKey(kidx);
		}
	}
}
//	タイトルを初期化
nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.setValueAtTime(0,"noTitle");
var myTitle=prompt("プロジェクトタイトルを指定してください",nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.value.text);
if(myTitle){nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.setValueAtTime(0,myTitle)};

nas.otome.endUndoGroup();

nas["eStoryBoard"].keyInit();
nas["eStoryBoard"].reDisplay();
}
