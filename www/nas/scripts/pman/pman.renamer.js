/**
 *	@fileoverview
 *	ファイルリネームツール
 *	第1バージョン用
 *	アプリケーションで編集対象になった画像ファイル名をリストで編集
 *	編集したリストをもとに一括してファイル名の変更を行う
 *	オプションで、変更後のファイル名を元にグループごとのフォルダ振り分けも行う
 *	標準動作は元ファイルのリネーム
 *	振り分けの際に 元ファイルをコピーして新規作成｜元ファイルの移動 をオプションで選択可能
 *	処理対象は jpg|png|svg|gif|tga|tiff|psd
 *	clip,sgi等はファイルの表示を行わないがリネームUIとしては使用可能
 *
 *	アプリケーションコード:	pmanの一部として作成
 *	
 *
 */
'use strict';
//
/* reName.items	編集バッファ
 * 
	xmap       :編集用プロダクト|ショット情報(xMapを転用)
	isUAF      :現在のセッションが UAFolder（カット袋相当）であるか否かのフラグ
	items      :編集対象アイテムバッファ
	noteImages :画像編集用noteImageコレクション
	members    :ルートディレクトリのアイテムメンバーコレクション配列
	removedItems: ゴミ箱・削除アイテムコレクション
	ignorePath :削除等で照合を無視するパスリスト
	rewrite    :画面更新要求フラグ  < sort等画面更新が必要な場合外部のプロセスが順次立てる ソート済み配列であるケースがある
	pending    :更新保留養成フラグ  < オブジェクト初期化等で一定期間の更新抑制が必要な場合に立てる
	focus      :フォーカスアイテムID配列[group,item] フォーカスのない場合｜アイテムのない場合は -1
	prefix     :グループラベルキーワードスタック
	postfix    :グループラベルキーワードスタック
	baseFolder :編集対象ディレクトリ パス WEBの場合は ベースディレクトリの名前のみ ローカルfsの場合はフルパス
		baseFolder.content:フォーカスのあるフォルダ内のサブフォルダ配列　階層化が可能
		UAF対応のフォルダが認識されている場合は、ステージごとの状態が選択できる
		
	note       :伝票へのユーザ入力
	preview    :0 原寸,1 基準サイズ,2 基準サイズx2,3 基準サイズx3、X 基準に対する倍率
	undoBuffer :操作UNODバッファ (DocumentObject側で初期化されるのでここでは不要)
	sortAuto   :true リネーム等の際に逐次並べ替えを行うか否か（読込の際は必ず行う）
	imageLoadingStatus :
		count:   登録全アイテム数(group含む)
		loaded:  画像読込数
		error:   エラーカウント
		loading: 読込中の一時カウント
	nameExt    :名称拡張フラグ アイテム名の複合アセットを認識 フラグがない場合は単一文字列として扱う
 */
/*
	isUAFフラグが立った場合は、xmapはカット内容を示すメタデータコレクションとなる
	現状にxmapファイルがあれば読み込みが行われ、データ内容と照合の上内容のマージが行われる
	不整合があればユーザに警告を行う

確認の手順
	ルートに以下のいずれかのメタファイルが存在する場合、またはユーザの指定があった場合フラグを立てる
	^__.*\.status\.(txt|text|json)$
	./*.xmap
	./etc/*.xmap


 */
/*
	（ファイル|フォルダ）アイテムの削除の手順
	アイテムリムーブメソッドでは、従来の操作に加えて被削除アイテムをスタックするバッファが必要
	バッファに格納されたアイテムはファイル書込の際にゴミ箱への移動が行われる
	（ファイル書込はアイテムに対応する全ファイルのパス変更解決に位置づけを変更する）
	ゴミ箱からの復帰を実装する
	削除リストは、ゴミ箱の中に保存？ pman.reName.removedItems オブジェクトに格納する
	構造はフラット配列配置先はすべて <baseFolder>/__temp__/ テンポラリフォルダとして一時ファイルと共用
	ファイル名はuuidを使用
*/
/*
	UndoBufferの設計
	xUI.put経由でpman.reName.putメソッドを使用する
	アプリケーションごとに引き渡しを設計
	pman.reNameではreName.putメソッドを作って接続する
	フォルダを開く｜閉じるタイミングでUndoBufferを初期化
	put(input,target)

	nas.InputUnit:{address:[focus-id,[selecction-array]],value:[string,string...]}
	リネーム時
		address:[フォーカス値,[selectedItemID]]
		content:[名称の配列]
	アイテム移動時
		address:[フォーカス値,[selectedItemsID]]
		content:[exportedContents]
	アイテム追加|削除
		address:[フォーカス値,[selectedItemsID]]
		content:[exportedContents]
	フィルタ操作時 隠蔽｜再表示
		address:[フォーカス値,[selectedItemsID]]
		content:[exportedContents]
 */
/*
 	RenameItem を拡張してドキュメントに再帰登録可能な論理構造を与える
 	RenameItem = {
 		rootpath:"<path or itemname>",
 		name:<current basename>,
 		text:<item text>
 		members:[],
 		selection:[],
 		type:"org|title|episode(== product)|uaf(==xmap)|stage|job|any"
 	}
rootpath

 */
pman.reName = {
	appMode     : '',
	xmap        : new xMap(),
	isUAF       : false,
	bundleInf   : null,
	bundleList  : ["uaf"],
	items       : [],
	noteImages  : new nas.NoteImageCollection(),
	members     : [],
	removedItems : {
		type   :'-removed-',
		parent :pman.reName,
		members:[]
	},
	rewrite     : false,
	pending     : false,
	focus       : -1,
	history     :{
		pt     : -1,
		members: []
	},
	selection   : [],
	selectionOffset    : 0,
	maxItemCount: 500,
	loadCtrl    : '',
	onCanvasedit: false,
	loadQueue   : [],
	imageLoadingStatus : {count:0,loaded:0,error:0,loading:0},
	flip        : {mode:0,loop:-1,rate:500,play:0,head:-1,count:0,start:0,offset:0,member:[]},
	lightBox    : {disabled:true,overlay:false,underlay:0,blendingMode:'normal',opacity:0.65},
	prefix      : {
		"LO"	: ["","_CT","_LO","_BG","_MG","_FG","_OVL","_OL","_BOOK","_ML","_note","_CAM","_img"],
		"原画"	: ["","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"],
		"動画"	: ["","_gou","a","b","c","d","e","f","g","h","i","i","k","l","m","n","o","p","q"],
		"CELL"	: ["","%wxp","%w","%ovl","%o","%udl","%u","%tfl","%t"]
	},
	postfix:{
		"check" : ["","_ok","_R"],
		"PLUS"   : ["","+","++","+3","+4","+5","+6"],
		"checkA" : ["","k","d","e","s","g","m","f","a","c","z"],
		"other"  : ["","var#","v#","ptn#","p#"]
	},
	rejectRegex  : new RegExp(/\.(exe|com|bat|app|sh|command|pl|js|jsx)$|Thumbs\.db$|DS_Store$/i),
	imageRegex   : new RegExp(/\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pje|png|svg|svgz|webp|tga|targa|tiff?|psd|psb)$/i),
	allow_Folders: new RegExp(/backyard|etc|bg|book|gou|lo|pool|backup|temp|tmp/i),
	baseFolder   : "",
	note         : "",
	preview      : 1,
	previewLock  : false,
	previewPoint : [.5,.5],
//	undoBuffer   : {},
	saveSlipsAuto: false,
	sortAuto     : false,
	nameExt      : false,
	thumbnailStat: 'inline-block',
	thumbnailSize: 128,
	renameDigits : 1,
	exList : {
"xmap"         :{ get:"toString", put:"parsexMap"},
"prefix"       :{ get:"toString", put:"JSON"},
"postfix"      :{ get:"toString", put:"JSON"},
"rejectRegex"  :{ get:"toString", put:""},
"allow_Folders":{ get:"toString", put:""},
"baseFolder"   :{ get:"toString", put:""},
"note"         :{ get:"toString", put:""},
"preview"      :{ get:"toString", put:""},
"saveSlipsAuto":{ get:"toString", put:"direct"},
"sortAuto"     :{ get:"toString", put:"direct"},
"nameExt"      :{ get:"toString", put:"direct"},
"thumbnailStat":{ get:"toString", put:"direct"},
"thumbnailSize":{ get:"toString", put:"direct"},
"renameDigits" :{ get:"toString", put:"direct"},
"hidden"       :{ get:"toString", put:"direct"},
"name"         :{ get:"toString", put:"direct"},
"order"        :{ get:"toString", put:"direct"},
"append"       :{ get:"toString", put:"direct"},
"remove"       :{ get:"toString", put:"direct"}
	}
};
//		"check":["監","演","作","総","メ","エ","動","セ","撮",""],
/*バンドルアイテム関連*/
/*
	クラスメソッド
	
BundleInformationオブジェクトがハブになって多種のバンドルの差異を吸収する
…予定 現在はuafのみ
 */
pman.reName.initBundle = function(type,idf){
//このメソッドは、pman.ReNameItem のオブジェクトメソッドを兼ねるので注意
//オブジェクト本体がバンドル対象でない場合は、操作失敗
	if((this instanceof pman.ReNameItem)&&(this.type !='-bundle-')) return false;
	if(! type) type = 'uaf';//現在UAF一種 
	if(!idf) idf = (this == pman.reName)? nas.File.basename(pman.reName.baseFolder):this.text;
	this.bundleInf = new pman.BundleInformation(type,idf);//ベースフォルダの名称またはテキストで初期化

console.log("initBundle : "+ this.members.join());

/*
	読み込みデータの特定を行う
	members内のステータスアイテムでタイプが'-status-'であるものを優先
	最初にヒットしたアイテムを読み込む
	
	メンバーアイテムを総当りで検査
	xmapが存在すれば、カット番号をチェックしてxmap
	ない場合はステータスアイテム
	ステータスアイテムが複数ある場合は、登録されたカットが一致して最も新しいデータを利用
	マージするか？
*/
	var statusItem = this.members.find(function(e){return (e.type == '-status-')});
	if(statusItem){
		var currentStatus = new pman.UAFBundleStatusRecord(statusItem.text.split('.')[0].replace(/^__/,""));
		if(statusItem.file){
//FileReaderから読み出し
			var reader  = new FileReader();
			reader.addEventListener('load',()=>{
console.log(reader.result);
				this.bundleInf.parse(reader.result);
			},false,);
			reader.readAsText(statusItem.file);
		}else if(statusItem.entry){
			var itm = this
			statusItem.entry.file(function(result){
				statusItem.file = result;
				itm.initBundle();
			});
		}else if(statusItem.path){
//ajaxで読み出し
			var url = new nas.File(statusItem.path).fullName.replace(/#/g,'%23');
//			var url = nas.Pm.encodeIdf(new nas.File(statusItem.path).fullName);
			var itm = this;
			$.ajax({
				url:url,
				dataType: 'text',
				success: function(result){
					console.log(result);
					itm.bundleInf.parse(result);
				}
			});//
		};
	}else{
console.log('error!!!!! no statusItem')
	};
}
//pman.reName.initBundle //
/** バンドルアイテムを条件フィルタして隠蔽する
 *	@params {String}	value
 *		判定条件値
 *

このUIでは　バンドルアイテムのみが持つ以下の条件で簡便な指定をするためのUI

(欠番)	statsu == '(aborted)'
CT	stage == CT
3DLO
LO     
原画    
動画     
スキャン  
彩色    

未着手	startup
	作業中 A
あがり	F|''
チェック中	ステップ 2 以上
	1
	2
	3
	4
指定パラメータがない場合はすべての現在のフィルタリストを再適用する
関数uafBundleFilterは、リストの設定を行い、syncUBFListを呼び出す形式とする
引数は
 */
pman.reName.uafBundleFilter = function(value){
	if(pman.reName.UBFprop[value]){
//		var prp = pman.reName.UBFprop[value];
//		if(prp){
console.log(prp,value);
			pman.reName.uafBundleFilterList[value] = !(pman.reName.uafBundleFilterList[value]);//値を反転
//			var stat = (pman.reName.uafBundleFilterList[value])? false:true;
//			pman.reName.filter(function(e){return((e.bundleInf)&&(e.bundleInf.bundleData[prp] == value));},stat);//フィルタ実行
//		};
		pman.reName.syncUBFList();
	};
}
//pman.reName.uafBundleFilterList['aborted']
pman.reName.UBFprop = {
	'aborted'  :'status',
	'A'        :'status',
	'H'        :'status',
	'R'        :'status',
	'F'        :'status',
	'C'        :'status',
	'step0'    :'step',
	'step1'    :'step',
	'step2'    :'step',
	'step3'    :'step',
	'step4'    :'step',
	'CT'       :'stage',
	'3DLO'     :'stage',
	'LO'       :'stage',
	'GE'       :'stage',
	'DO'       :'stage',
	'PT'       :'stage'
};
//UI用パラメータ保持オブジェクト
pman.reName.uafBundleFilterList = {
	'aborted'  :true,
	'A'        :false,
	'H'        :false,
	'R'        :false,
	'F'        :false,
	'C'        :false,
	'step0'    :false,
	'step1'    :false,
	'step2'    :false,
	'step3'    :false,
	'step4+'   :false,
	'CT'       :false,
	'3DLO'     :false,
	'LO'       :false,
	'GE'       :false,
	'DO'       :false,
	'PT'       :false
}
//リスト内容を判別してそれぞれのアイテムが隠蔽対象となるか否かを判別する関数
//引数アイテム自身
pman.reName.checkUBF = function(itm){
	if(itm.type != '-bundle-') return false;
//正条件のエントリを抽出
	var trueList = [];
//正条件抽出
	for (var t in pman.reName.uafBundleFilterList) if(pman.reName.uafBundleFilterList[t]) trueList.push(t);
//console.log(trueList);
//抽出条件からアイテムを判定 一つでもマッチすればtrue (全OR)
	for (var p = 0 ;p < trueList.length ; p++){
		var value = String(trueList[p]);
		var opt = 'eq';
		if(value=='aborted') value = '(aborted)';
		if(value.indexOf('step')== 0){
			if (value.indexOf('+')>=0) opt = 'lt';
			if (value.indexOf('-')>=0) opt = 'gt';
			value = nas.parseNumber(value);
			if(opt == 'gt')
				if(itm.bundleInf.bundleData[String(pman.reName.UBFprop[trueList[p]])] <= value) return true;
			if(opt == 'lt')
				if(itm.bundleInf.bundleData[String(pman.reName.UBFprop[trueList[p]])] >= value) return true;
		};
		if(itm.bundleInf.bundleData[String(pman.reName.UBFprop[trueList[p]])]==value) return true;
	}
	return false;
}
//リスト内容をUIスイッチに対して同期後にフィルタ実行
pman.reName.syncUBFList = function (target){
	for(var c in  pman.reName.UBFprop){
		var ix = 'UBF_' + c ;
		var prp = String(pman.reName.UBFprop[c]);
		if(pman.reName.uafBundleFilterList[c]){
			nas.HTML.addClass(document.getElementById(ix),"tool-inline-button-selected");
		}else{
			nas.HTML.removeClass(document.getElementById(ix),"tool-inline-button-selected");
		};
	};
	pman.reName.filter(null);//フィルタ解除
	pman.reName.filter(pman.reName.checkUBF);//フィルタ再実行
}
/*
historyスタック
pt       参照されるhistory.membersのid
members  history配列 内容はReNameItemまたはルートフォルダを表すpman.reName
historyは、単純な配列で　フォーカスされたアイテムの参照をスタックする
	history.append
アイテムをhistoryに配置してヒストリポインタを-1に設定する
キー操作、ボタン・操作でhistoryをたどる場合はフォーカスが移動する
簡易再生をhistoryに切り換えるのは可能
簡易再生中はフォーカスが動かない
スタックを独立でクリア可能

	history.remove
削除 ポインタのある要素を削除 / ポインタは移動しない

	history.select
選択 指定されたポインタへ移動 / フォーカスを指定アイテムへ

	history.set
設定ポインタ位置へ要素を挿入

	history.init
ヒストリ全体を初期化

ヒストリ指定動作

アイテムに対する参照を表示順にヒストリスタックに積む
スタック上の隣接するヒストリは同じアイテムの場合統合される

1,2,3,4,5,6,6
	↓
1,2,3,4,5,6

ヒストリポインタは、ヒストリを参照していない時 -1
参照時はヒストリスタックのID

-1,0,1,2,3...

ポインタの最大値は (members.length -1) に一致する

ヒストリ参照中はポインタをスタック上のアイテムに置く

ポインタの移動操作が発行された場合
ポインタが示すアイテムを表示する
この際、フォーカスを移動するがヒストリの追加は行われない
ヒストリスタックの両端ではループ動作を行いリングバッファのように働く

1,2,3,4,5,6,7,8,9
        ^
1,2,3,4,5,6,7,8,9
^
1,2,3,4,5,6,7,8,9
                ^

ポインタ操作でなく、アイテム切替｜選択操作を行った場合は、
ヒストリにアイテムを加え、ポインタを-1に設定する
*/
/**
 *	@params itm
 *	history.append 追加 現在の表示アイテムをヒストリにpush ポインタを末尾に設定
 */
pman.reName.history.append = function(itm){
	if((!itm)&&(pman.reName.history.pt >= 0)) return;
	if(! itm) itm = pman.reName.items[pman.reName.focus];;
	if(! itm) itm = -1;
//	pman.reName.history.members.splice(pman.reName.history.pt+1,pman.reName.history.length,itm);
	if(itm !== pman.reName.history.members[pman.reName.history.members.length - 1]){
		pman.reName.history.members.push(itm);
	}
	pman.reName.history.pt = -1;
}
/**
 *	history.select ヒストリポインタ移動してポイントされたアイテムを選択・表示状態にする
 */
pman.reName.history.select = function(idx){
	if(typeof idx == 'string'){
		var offset = (idx == 'bwd')? -1:1;
		pman.reName.history.pt = (pman.reName.history.pt + pman.reName.history.members.length + offset ) % (pman.reName.history.members.length);
	}else{
		pman.reName.history.pt = (parseInt(idx) + pman.reName.history.members.length) % (pman.reName.history.members.length);
	};
	if(pman.reName.history.pt >= 0){
		pman.reName.select(pman.reName.history.members[pman.reName.history.pt],false,false,true);
	};
	return pman.reName.history.pt;
}
/**
 *	history.init ヒストリスタックを空・ポインタを -1 にリセット
 */
pman.reName.history.init = function(){
	pman.reName.history.members.length = 0;
	pman.reName.history.pt = -1;
}

/**
 *	history.remove ポインタの指すアイテムを削除
 *	ポインタ移動はなし
 */
pman.reName.history.remove = function(){
	if(pman.reName.history.pt < pman.reName.history.members.length)
	pman.reName.history.members.splice(pman.reName.history.pt,1);
//	if(pman.reName.history.pt ==  pman.reName.history.members.length) pman.reName.history.pt --;
//	if (pman.reName.history.pt >= 0) pman.reName.history.select(pman.reName.history.pt);
}
/**
 *	history.set ヒストリスタックのポインタ位置にアイテムを挿入(前方挿入)
 *	ポインタ移動はなし 最後尾にポインタがあれば動作はappend(push)とおなじになる
 */
pman.reName.history.set = function(itm){
	var itmId = pman.reName.items.indexOf(itm);
	if(itmId < 0) itm = -1;
console.log(itm)
//	pman.reName.history.members.splice(pman.reName.history.pt,pman.reName.history.length,itm);
	pman.reName.history.members.splice(pman.reName.history.pt,0,itm);
}
/**
 *	ヒストリスタックをラベルテキストとヒストリidの無名オブジェクトの配列でダンプ
 */
pman.reName.history.dump = function(){
	var result = [];var idx = 0;
	pman.reName.history.members.forEach((e)=>{
		result.push({
			"text" :(e.text)?e.text:nas.File.basename(pman.reName.baseFolder),
			"value":idx,
			"selected":(pman.reName.history.pt == idx)? true:false
		});
		idx++;
	});
	return result;
}
/**
 *	ヒストリ周辺のUI同期
 *	プルダウンメニューのヒストリ
 */
pman.reName.history.syncUI = function(){
	console.log('history syncUI');
	return ;
}
/**
	フリップ簡易再生
	セレクションのアイテムを順次表示するパラパラ再生機能

flip（パラパラ）機能用変数
.flip.mode
	再生モード 0:順行,1:逆行,2:バウンス
.flip.loop
	ループスイッチ -1:無限,0:再生しない,1~:ループ回数
.filp.rate
	Number 1アイテムの表示時間ミリ秒
.flip.play
	再生中変数 Number Init 0で停止 再生カウントを入力すると再生
	無限再生中は マイナス
	再生中は停止以外の操作をブロックする
	停止操作はこの変数をゼロにリセットする
	再生開始操作は、この変数に任意の値をセットする
	1ループ再生ごとにplay変数をデクリメントしてゼロに到達したら再生を自動で終了
.flip.head
	Number Int flip再生ヘッド位置・抽象化された再生アイテムトラックのヘッド位置 0 ~ (pman.reName.flip.member.length - 1)
.flip.count
	Number Int スタートから現在までの積算表示カウント
.flip.start
	現再生開始時刻
	現時との差が切り替え時刻に達したら画面の切り替えまたは停止手続きを行う
.flip.offset
	再生開始フレームオフセット
.flip.member
	フリップ再生に使用されるアイテムコレクション配列
 */
/**
 *	フリップ再生
 */
pman.reName.flipPlay = async function(){
	if(
		(pman.reName.onCanvasedit)||
		(pman.reName.flip.play == 0)||
		(pman.reName.flip.loop == 0)||
		(pman.reName.flip.member.length <= 1)||
		(!(pman.reName.lightBox.disabled))
	){
		if(pman.reName.flip.play != 0) pman.reName.flipStop();
		return;//NOP
	};
	let now = new Date().getTime();
	if((now - pman.reName.flip.start) > (pman.reName.flip.rate * pman.reName.flip.count)){
		let nxId;//(抽象化ヘッド位置)
		pman.reName.flip.count++;
		if(pman.reName.flip.mode == 0){
			nxId = (pman.reName.flip.offset + pman.reName.flip.count) % pman.reName.flip.member.length;//正順
		}else if (pman.reName.flip.mode == 1){
			nxId = Math.abs((((pman.reName.flip.member.length * 3 - 1) - pman.reName.flip.offset + pman.reName.flip.count ) % pman.reName.flip.member.length)- pman.reName.flip.member.length) - 1;//逆順
		}else{
			nxId = Math.abs(((pman.reName.flip.offset + pman.reName.flip.count + pman.reName.flip.member.length - 1) % (pman.reName.flip.member.length * 2 - 2))-(pman.reName.flip.member.length - 1));//バウンス
		};
		pman.reName.flip.head = nxId;
		let flipIx = (pman.numOrderUp)? (pman.reName.flip.member.length - nxId) - 1 : nxId;//再生オーダーで反転
		pman.reName.setPreview(pman.reName.flip.member[flipIx],null,'flip');//再生中はセレクトを変更しない
		if((pman.reName.flip.loop > 0)&&(pman.reName.flip.count >= pman.reName.flip.play)) pman.reName.flipStop();//フリップカウント満了なので終了処理
	};
}
/**
 *	フリップ動作の開始
 */
pman.reName.flipStart = async function(){
	if (!(pman.reName.lightBox.disabled)){
		alert('ライトボックス使用中は再生機能は動きません');
		return;
	};
	if(pman.reName.flip.play != 0){
		pman.reName.flipStop();
	}else{
		if(pman.reName.flip.member.length <= 1) return ;
		pman.reName.flip.play = (pman.reName.flip.mode <= 1 )?
			pman.reName.flip.loop * pman.reName.flip.member.length:
			pman.reName.flip.loop * (pman.reName.flip.member.length * 2 - 2);
		if (pman.reName.play == 0) return;
		if(pman.reName.focus >= 0) pman.reName.flip.offset = pman.reName.flip.member.indexOf(pman.reName.items[pman.reName.focus]);
		if(pman.numOrderUp) pman.reName.flip.offset = pman.reName.flip.member.length - pman.reName.flip.offset - 1;//反転
		pman.reName.flip.count = 0;
		pman.reName.flip.start = new Date().getTime();
		xUI.sync('flipSwitch');xUI.sync('flip');
	};
}
/**
 *	フリップ動作の停止
 */
pman.reName.flipStop   = async function(){
	pman.reName.flip.play   = 0;
	pman.reName.flip.start  = 0;
	pman.reName.flipSelect();
	pman.reName.flip.head   = -1;
	pman.reName.flip.count  = 0;
	pman.reName.flip.offset = 0;
	xUI.sync('flipSwitch');	xUI.sync('flip');
}
/**
 *	現在のセレクションから再生メンバーを抽出する
 */
pman.reName.flipMemberSet   = async function(){
	if(pman.reName.flip.play != 0) pman.reName.flipStop();
	if (pman.reName.lightBox.overlay){
		pman.reName.flip.member = pman.reName.selection.filter(e => !(e.isOvl()));
	}else{
		pman.reName.flip.member = Array.from(pman.reName.selection);
	}
	xUI.sync('flipSwitch');	xUI.sync('flip');
}
/**
 *	@params {Number} hearIdx
 *	ヘッド位置を指定してflip.memberのアイテムを選択状態にする
 */
pman.reName.flipSelect = async function(headIdx){
	if(typeof headIdx == 'undefined') headIdx = pman.reName.flip.head;
	let idx = (pman.numOrderUp)? (pman.reName.flip.member.length - headIdx -1) : headIdx;
	pman.reName.select(pman.reName.flip.member[idx],true,true);
}
/**
 *	@params {string}	status
 *			'inline-block'|'none'
 *	アイテムサムネイルの表示状態（SIZE|ON|OFF）を切り替える
 *	引数がない場合は現在の状態を反転する
 */
pman.reName.switchThumbnail = function(status){
//set show|hide flag
	if(typeof status == 'undefined'){
		pman.reName.thumbnailStat = (pman.reName.thumbnailStat == 'none')? 'inline-block':'none';
	}else{
		pman.reName.thumbnailStat = (status == 'none')? 'none':'inline-block';
	};
//change UI
	if(pman.reName.thumbnailStat != $('div.thumbnailBox').css('display')){
		$('div.thumbnailBox').css('display',pman.reName.thumbnailStat);
	};
//	xUI.sync('showThumbnail');
	return pman.reName.thumbnailStat;
}
/**
	デバック用アイテムダンプ
*/
pman.reName.itemDump = function(list){
	if(! list) list = pman.reName.items;
	var result=Array.from(list,function(e){return e.getPath(true);})
	return result.join('\n');
}
/**
 *	@params {Number}	width
 *	@returns {Number}
 *		thumbnailSize
 *	アイテムサムネイルの表示サイズを切り替える
 *	引数がない場合は現在の状態を再反映
 *	拡張子オーバーレイ表示を追加
 */
pman.reName.setThumbnailSize = function thumbnailSize(width){
	if(!(width)) width = pman.reName.thumbnailSize;
	width = (Math.floor(width / 8) * 8);
	var fontSize = Math.floor(width / 4);
	pman.reName.thumbnailSize = width;
	$('img.elementThumbnail').css("width",pman.reName.thumbnailSize);
//	$('img.elementThumbnailPreview').css("width",pman.reName.thumbnailSize);
	$('p.elementThumbnailText').css('font-size',fontSize+"px");
	xUI.sync('thumbnailSize');//UI同期
	return pman.reName.thumbnailSize;
}
/**
 *	@params {Array of pman.ReNameItem}
 *		アイテムの並び順の写像オブジェクト配列
 *	@returns undefined
 *	input操作等、情報保存のための写像オブジェクトの内容を本体に同期させる関数
 *	同期はオブジェクトメソッドで行う
 *	undo|redoの際のアイテム数変動型操作に対する
 *	同期機能
 *	主にundoBufferの内容をpman.reNmae.itemsに対して適用
 *	アイテム配列を比較して、不要アイテムを削除、不足のアイテムを追加、ipプロパティを同期
 *	最後にリオーダーしてHTMLステータスを同期する
 *	この関数はundo|redo共用で使用可能
 */
pman.reName.syncItems = function syncItems(body){
console.log(body)
	pman.reName.pending = true;
//引数リスト側に存在しないアイテムを削除
	pman.reName.items.filter(e => (body.findIndex(f => (e.id == f.id)) < 0)).forEach(g => g.remove());
//引数リストに対して同期
// 本体側に存在しないアイテムを追加
	body.forEach(e => {
		let x = pman.reName.items.find(f => (e.id == f.id));
		if(x){
//既存・同期
			x.sync(e);
		}else{
//写像を追加
//先行アイテムを確定する
//			let refTraget = body[body.indexOf(e)-1];
				pman.reName.appendItems([e.duplicate()],body.indexOf(e),"PLACEBEFORE");
		};
	});
	pman.reName.reorderWithIP(function(){
		pman.reName.refreshItemlist(true);
	});
//	pman.reName.pending = false;
}

/**
 *	@params {Object File|Object FileEntry|Object URL|String pathname|String name} 
 *		File|Entry|URL|pathname or groupname
 *	@params {Boolean}	asGrp
 *			グループまたはアイテムバンドルとして初期化する
 *	@params {String}	type
 *			アイテムタイプ指定文字列-なくとも良い 自動判定を上書きする

 *	リネームツールアイテムオブジェクト
 *	ファイル|ディレクトリに相当
 *	ファイルオブジェクトまたはパスまたは名前文字列で初期化する
 *	グループメンバ配列には、直接アイテム参照を置く
 *	アイテムグループもリネームの対象とする
 *	アイテムグループに対応するディレクトリファイルはあってもよいが必ずしも必要ではない
 *	type 属性はアイテムタイプを表す グループ｜UAF指定されたアイテムはルートになることができる
 *		-group-       アイテムグループ ファイルシステムのディレクトリに準ずる
 *			グループアイテムは編集｜書込セッション管理情報を保持
 *			uatアプリ上ではフォルダに配置されるステータスファイルの管理と同期がとられる
 *			事故のない限りセッション終了時にステータスをファルダ上のステータスファイルに書き出す
 *			-note-アセットはステータスファイルに記述される
 *		-bundle-        バンドルグループフォルダ システムの認識するバンドルアイテムトレーラー
 *			バンドル情報を別途管理する
 *			stag|xmapを直下に持つフォルダをuafと認識する アイテムバンドル
 *			配下のアイテムは.xmap .status.txt|json のみが許される
 *			
 *			このアイテムはルートになる場合以外は、配下の画像を読み込まないようにする

 *		-status-        制作管理ドキュメント ステータスタグファイル
 *			UAFシステムの認識する状況タグファイル
 *		-xmap-        制作管理ドキュメント
 *		-xpst-        タイムシート・ドープシートドキュメント
 *		-asset-       制作アセット 管理対象アイテム
 *		-pmdb-        制作管理DB
 *		-stbd-        ストーリーボード|カット表
 *		-workslip-    作業納品伝票
 *		-canvasasset- 作成中の一時アセット
 *		-note-        アプリ上で挿入されるtextその他の注釈を記述する準アセットアイテム 画像であっても良い
 *		-other-       その他 直接管理対象外アイテム
 *	mimeはドキュメントタイプを表す MIME-typeに同じ
 *	imgプロパティに画像全体をキャッシュする
 *	imgsrcプロパティには、アイテム画像のsrcが保存される imgプロパティと重複するが、canvasが有効なケースで必要
 *	thumbnailプロパティに縮小サムネイルを置く
 *	新規にオーバーレイ注釈アイテムを作成することが可能
 オーバーレイアイテムは、
 テキスト,画像,図形(svg)等を複合したHTMLアイテム、一般画像アイテム（図形アイテム含む）、編集可能なcanvasアイテムに分かれる
 HTMLアイテムは、原稿に対する厳密な位置合わせができないので使用は要注意 
 canvasアイテム以外は一般の画像アセットとして扱う
 canvasアイテムは新規オーバーレイとして挿入可能
 編集中はパス|File|url等を持たない一時アイテムとして扱う
 parentプロパティはアイテムがエントリされる親オブジェエクトを指す
 削除されたアイテムにはnullが設定され　これが削除エントリのフラグとして働く
 データの寿命はセッション限り　複数のアイテムを同時編集可能

ip(itemPath)配列
個別のアイテムごとの配置状態を記録する配列
配列要素はアイテムごとに割り当てられるuuidを自身から親アイテムをたどってルートまでのパスで一時記録する
ルート(pman.reNme)にはuuidが存在しないため空文字列が与えられる
ip配列の最終要素は必ず空文字列

 */
pman.ReNameItem = function(file,asGrp,type){
	this.id              = nas.uuid()      ;//初期化時に与えるユニークID
	this.ip              = [this.id,""]           ;//itemPath
	this.name            = (asGrp)? file:'';// file|item name
	this.parent          = pman.reName     ;//アイテムツリーの親オブジェクト|null 削除されたアイテムはnullが設定される
	this.members         = (asGrp)?[]:null ;//group|other アイテムバンドルはグループの一種
	this.selection       = []              ;//
	this.relativePath    = ''              ;//Electron利用時にwindowsタイプのパスが入るケースがある
	this.text            = (asGrp)? file:''        ;//編集中のテキスト
	this.type            = (String(type).match(/^-.+-$/))? type:((asGrp)?'-group-':'-other-');//item data type
	// -group-|-bundle-|-pmdb-|-stbd-|-status-|-xmap-|-xpst-|-asset-|-wrokdocument-|-other-|-canvasasset-
	this.idf             = ""              ;//product identifier ? pmdb から得るまたはパスから取得
	// org|title|episode=product|uaf=xmap|line|stg|job
	this.label           = 0               ;//アイテム分類ラベルInt red,blue,green,cyan,magenta,yellow
	this.mime            = false           ;//mime type default false
	this.path            = null            ;//Electron利用時に使用するローカルパス windowsパスのケースがある
	this.file            = null            ;//File Object
	this.entry           = null            ;//FileEntry|DirectoryEntry
	this.url             = null            ;//Object URL not string
	this.stat            = null            ;//file stat cash
	this.lastModified    = 0               ;//初期化前フラグとして0
	this.content         = null            ;//内容参照用プロパティ img|xpst|canvas|...

	this.bundleInf       = null            ;//バンドル情報プロパティ 初期化前はnull

	this.img             = null            ;//アイテム画像キャッシュ 
	this.imgsrc          = null            ;//アイテム画像src
	this.imgLastModified = 0               ;//画像更新日時
	this.thumbnail       = null            ;//アイテムサムネイル画像キャッシュ（null|HTMLImage）タイプアイコンではない
	this.thmLastModified = 0               ;//サムネイル更新日時
	this.tga             = false           ;//一時データ
	this.selected        = false           ;//選択状態フラグ
	this.hidden          = false           ;//隠蔽状態フラグ
	this.close           = true            ;//groupとしての表示状態

	this.noteImage       = null             ;//画像編集用 noteImage 画像編集用オブジェクト

	this.xpst                = null        ;//新規編集用 xpstオブジェクト

	this.canvas              = null        ;//新規編集用 Element canvas 画像レンダリング用の表示されないcanvas
	;//画像タイムシートの場合はアイテムのcanvasをアクティベートして使う（共用アトリビュート）
	this.canvasStream        = []          ;//fabricCanvasシリアライズjson|SVGデータ（編集データの本体）|historyStack兼用
	this.canvasUndoPt        = null        ;//history管理UndoPointer

	this.worksession         = false       ;//作業セッション情報{Object pman.WorkSessionStatus}

	if(file) this.parse(file,asGrp,type);
}
/**
 *	pman.reName.initBundleをそのまま使用して
 *	バンドル処理メソッドを登録する
 */
pman.ReNameItem.prototype.initBundle = pman.reName.initBundle;
/**
	写像オブジェクトの作成
	クラスメソッド
	ユニークIDが複製されることに注意
*/
pman.ReNameItem.duplicate = function(source){
	if(!(source instanceof pman.ReNameItem)) return null;
	var copy = new pman.ReNameItem();

	copy.id              = source.id                 ;//id複製(写像)
	copy.ip              = Array.from(source.ip)     ;//{Array of String} アイテムパスは複製
	copy.name            = source.name               ;//{String}
	copy.parent          = source.parent             ;//{Object}
	copy.members         = (source.members)?   Array.from(source.members):null  ;//{Array|null}
	copy.selection       = Array.from(source.selection);//{Array}
	copy.relativePath    = source.relativePath       ;//{String}
	copy.text            = source.text               ;//{String}
	copy.type            = source.type               ;//{String}
	copy.idf             = source.idf                ;//{String}
	copy.mime            = source.mime               ;//{String}
	copy.path            = source.path               ;//{String}
	copy.file            = source.file               ;//{Object} 参照保存
	copy.entry           = source.entry              ;//{Object} 参照保存
	copy.url             = source.url                ;//{Object} 参照保存
	copy.stat            = source.stat               ;//{Object} 参照保存
	copy.lastModified    = source.lastModified       ;//{String}
	copy.img             = source.img                ;//{Object} 参照保存
	copy.imgsrc          = source.imgsrc             ;//{String|Object} 参照保存
	copy.imgLastModified = source.imgLastModified    ;//{String}
	copy.thumbnail       = source.thumbnail          ;//{Object} 参照保存
	copy.thmLastModified = source.thmLastModified    ;//{String}
	copy.tga             = source.tga                ;//{Object} 参照保存
	copy.selected        = source.selected           ;//{Boolean}
	copy.hidden          = source.hidden             ;//{Boolean}
	copy.close           = source.close              ;//{Boolean}
	copy.canvas              = source.canvas         ;//{Object} 参照保存
	copy.canvasStream        = source.canvasStream   ;//{Array}
	copy.canvasUndoPt        = source.canvasUndoPt   ;//{Number}

	return copy;
}
pman.ReNameItem.prototype.duplicate = function(){
	return pman.ReNameItem.duplicate(this);
}
/**
	写像オブジェクトからの同期
	オブジェクトメソッド
	ユニークIDが異なる場合は処理を破棄
*/
pman.ReNameItem.prototype.sync = function(source){
	if(!(source instanceof pman.ReNameItem)) return false;
	if(source.id != this.id) return false;
	this.ip              = Array.from(source.ip)     ;//{Array of String} アイテムパスは複製
	this.name            = source.name               ;//{String}
	this.parent          = source.parent             ;//{Object|null}
	this.members         = (source.members)?   Array.from(source.members):null  ;//{Array|null}
	this.selection       = Array.from(source.selection);//{Array}
	this.relativePath    = source.relativePath       ;//{String}
	this.text            = source.text               ;//{String}
	this.type            = source.type               ;//{String}
	this.idf             = source.idf                ;//{String}
	this.mime            = source.mime               ;//{String}
	this.path            = source.path               ;//{String}
	this.file            = source.file               ;//{Object} 参照共有
	this.entry           = source.entry              ;//{Object} 参照共有
	this.url             = source.url                ;//{Object} 参照共有
	this.stat            = source.stat               ;//{Object} 参照共有
	this.lastModified    = source.lastModified       ;//{String}
	this.img             = source.img                ;//{Object} 参照共有
	this.imgsrc          = source.imgsrc             ;//{String|Object} 参照共有
	this.imgLastModified = source.imgLastModified    ;//{String}
	this.thumbnail       = source.thumbnail          ;//{Object} 参照共有
	this.thmLastModified = source.thmLastModified    ;//{String}
	this.tga             = source.tga                ;//{Object} 参照共有
	this.selected        = source.selected           ;//{Boolean}
	this.hidden          = source.hidden             ;//{Boolean}
	this.close           = source.close              ;//{Boolean}
	this.canvas              = source.canvas         ;//{Object} 参照共有
	this.canvasStream        = source.canvasStream   ;//{Array}
	this.canvasUndoPt        = source.canvasUndoPt   ;//{Number}
	return this;
}
/**
 *	@params {Boolean}	withText
 *		戻値としてアイテムテキストのパスを返す
 *	@returns {array}
 *	ipを更新して返す
 *	ip の構造は pman.reName.items.indexOf(this)を自分自身からはじめてルートに向けて連結したIDの配列
 *	ルートのpman.reNameはIDを持たないので''(nullstring)を与える
 *	[<現在のitemIndex>,<親アイテムのitemIndex>...,<pman.reName == ''>]
 *	削除されたアイテムのipはlength == 1で親を持たないかまたはpman.reName.removedItemsを親として持つ（双方を許容する）
 *	[<現在のitemIndex>]
 *	
 */
pman.ReNameItem.prototype.getPath = function getPath(withText){
	this.ip = [this.id];
	if((this.parent)&&(this.parent !== pman.reName.removedItems)){
		if(this.parent === pman.reName){
			this.ip.push('');
		}else{
			this.ip = this.ip.concat(this.parent.getPath());
		};
	};
	if(withText){
		var result = [];
		for (var d = 0 ; d < this.ip.length ; d ++)
			result.push(((pman.reName.getItem(this.ip[d]))? pman.reName.getItem(this.ip[d]).text:nas.File.basename(pman.reName.baseFolder)));
		return result.reverse().join('/');
	}else{
		return this.ip;
	};
}
/**
 *	@params {array}	ipp
 *		アイテムに設定するitem parent path
 *	@returns {array}
 *	ipを設定更新して返す
 *	ip の構造は pman.reName.items.indexOf(this)を自分自身からはじめてルートに向けて連結したIDの配列
 *	再帰的に配下のアイテムを設定する
 */
pman.ReNameItem.prototype.setParentPath = function setParentPath(ipp){
	this.ip = [this.id].concat(ipp);
	if((this.type == '-group-')&&(this.members.length)) this.members.forEach(e = e.setParentPath(this.ip));
	return this.ip;
}
/**
 *  @returns {Array}
 *	現在のアセットのネームテキストを正規化の上配列に分解して返すメソッド
 *	引数なし
 *	戻り値は文字列を要素とする配列
 *	[Prefix-Number(-Postfix)...]
 *	アセット以外はテキストをそのまま返す
 */
pman.ReNameItem.prototype.getNormalizedNames = function(){
	if(this.type == '-asset-'){
		return this.text.replace(/([a-z][^_\-\s\d]*)(\d+)/gi,"$1-$2").replace(/([a-z][^_\-\s]*)[_\-\s]?(\d[^_\-\s\+]*)([_\-\s][^_\-\s]+|\++\d*)?/gi,"$1-$2$3").replace(/\s+/g,'_').split('_');
	};
	return [this.text];
}
/**
 *	@params  {string} form
 *			情報フォーマット text(|json|dump|html 将来の拡張)
 *	@returns {String}
 *	状態表示のための内容テキストを返す
 *	アイテムがグループの場合は、配下のアイテムリストを返す
 */
pman.ReNameItem.prototype.getInfo = function(form){
	var result = [];

//	var filestat = this.checkItemStatus(); 

	if(typeof form == 'undefined'){
		if(this.type == '-group-'){
			result.push('   group name : '+this.text);
			result.push('');
		}else{
			result.push(this.text + ' : '+ this.relativePath+ ' ;');
		}
		if((this.type == '-group-')&&(this.members.length))
			for(var i = 0 ; i < this.members.length ; i ++ ){result = result.concat([this.members[i].getInfo()])};
		return result.join('\n');
	}else{
		if(this.type == '-group-'){
			result.push('   group name : ' + this.text);
			result.push('    item path : ' + this.getPath(true));
			result.push('    data type : ' + this.type);
			result.push('         path : ' + this.path);
			result.push('relative path : ' + this.relativePath);
			result.push('          url : ' + ((appHost.platform == 'Electron')&&(this.path))? this.path:this.relativePath);
			result.push('      members : ' + this.members.length);
			result.push('last modified : ' + new Date(this.lastModified).toNASString());
			return result.join('\n');
			
		}else if(this.type == '-bundle-'){
			if((this.bundleInf)&&(this.bundleInf.type=='uaf')){
//				var props = this.bundleInf.bundleData;
//				result.push(this.bundleInf.toString());
				var props = nas.Pm.parseIdentifier(this.name)
				result.push( props.uniquekey );
				result.push('      product : ' + props.product);
				result.push('          cut : ' + props.inherit[0]);
				result.push('      inherit : ' + props.inherit.toString());
				result.push('       status : ' + this.getStatusString());
				result.push('    item path : ' + this.getPath(true));
				result.push('    data type : ' + this.type);
				result.push('         path : ' + this.path);
				result.push('relative path : ' + this.relativePath);
				result.push('          url : ' + ((appHost.platform == 'Electron')&&(this.path))? this.path:this.relativePath);
				result.push('last modified : ' + new Date(this.lastModified).toNASString());
				return result.join('\n');
			};
		}else{
			result.push('    item name : ' + this.text);
			result.push('    item path : ' + this.getPath(true));
			result.push('    data type : ' + this.type);
			result.push('    file name : ' + this.name);
			result.push('         path : ' + this.path);
			result.push('relative path : ' + this.relativePath);
			result.push('       format : ' + this.mime);
			result.push('         size : ' + this.stat.size);
		if((this.img)&&(this.img.width > 0)){
			result.push('        w x h : ' + [this.img.naturalWidth,this.img.naturalHeight]);
		};
			result.push('last modified : ' + new Date(this.lastModified).toNASString());
			return result.join('\n');
		};
	}
}
/*
	アイテムのステータステキストを返す
	バンドルアイテムは、それぞれのバンドルの定義による
	ファイルアイテムの場合は、基本的に拡張子
 */
pman.ReNameItem.prototype.getStatusString = function getStatus(){
	if(this.type == '-bundle-'){
		if((this.bundleInf)&&(this.bundleInf.type=='uaf')){
//console.log(this);
			if(this.bundleInf.bundleData.mNode){
				if (this.bundleInf.bundleData.status.content=="Aborted") return nas.localize('=欠番=');
				return (nas.localize("[%1]%2",this.bundleInf.bundleData.mNode.name,this.bundleInf.bundleData.status.toString()));
//ココはもうちょっと整理が必要 20240507

			}else if (this.members[0]){
//第一エントリのファイル名をパース
//				var status = this.members[0].name.replace(/\..+$/,'').replace(/^_+/,'');
				var status = new pman.UAFBundle.parseStatus(this.members[0].name);
				return nas.localize(status.status.content);
//				if(String(status).match( /abort/i )) status = nas.localize('=欠番=');
//				return status;
			}else{
				return '???';
			};
		};
	};
	var result = "";
	result += nas.File.extname(this.name);
//	if(this.img){
//		if((this.img.width % 2 == 1)||(this.img.height % 2 == 1)) result +='*';
//	};
	return result
}
/*アイテムリストを整形して戻す*/
pman.ReNameItem.prototype.getContentList = function(){
	if((this.type == '-group-')&&(this.members.length > 0)){
		return Array.flom(this.members,function(elm){elm.toHTMLContent('box');});
	}else{
		return [];
	}
}
/**
 *	@returns {String}
 *	assetプロパティを返す
 *
 */
pman.ReNameItem.prototype.getAssetProperties = function(){
	var result = "";
		if(this.type == '-group-'){
			
		}else if(this.type == '-asset-'){

		}
		result = [result];
	if((this.type == '-group-')&&(this.members.length))
		for(var i = 0 ; i < this.members.length ; i ++ ){result = result.concat(this.members[i].getInfo())};
	return result.join('\n');
}

/**
 *	@returns {Number}
 *	
 *	グループアイテムの自分自身を含まない配下のmemberアイテムの総数をカウントして返す
 *	グループも１アイテムとなる
 *	通常アイテムは 必ず 0 を返す
 */
pman.ReNameItem.prototype.countMemberItems = function(){
	if(this.type == '-group-'){
		var count = 0;
		for (var m = 0 ; m < this.members.length ; m ++){
			count ++;
			if (this.members[m].type == '-group-')
				count += this.members[m].countMemberItems();
		};
		return count;
	}else{
		 return 0;
	};
}
/**
 *	@params	{String|Boolean}	prop
 *	
 *	アイテムグループの表示を切り替える
 *	引数がない場合は現状を返す
 *	通常アイテムでは常時 null を返す
 */
pman.ReNameItem.prototype.sWitchClose = function(prop){
	if(this.type != '-group-') return null;
//group
	if(typeof prop == 'undefined') return this.close;
	if((prop == 'open')||(! prop)) {this.close = false;}else{this.close = true;}
	var idx = pman.reName.items.indexOf(this);

	if(idx < 0) return  this.close;
	this.setHTMLStatus();
	this.getHTMLElement().children[0].open = (this.close)? false:true;

	if(this.close){
		nas.HTML.removeClass(document.getElementById('icon_ovl_rename_item_'+idx),'elementContainerGroupIcon-open');
		nas.HTML.addClass(document.getElementById('icon_ovl_rename_item_'+idx),'elementContainerGroupIcon-close');
	}else{
		nas.HTML.removeClass(document.getElementById('icon_ovl_rename_item_'+idx),'elementContainerGroupIcon-close');
		nas.HTML.addClass(document.getElementById('icon_ovl_rename_item_'+idx),'elementContainerGroupIcon-open');
	};
	for (var i = 0 ; i < this.members.length ; i ++){
		this.members[i].setHTMLStatus();
	};
}

/**
 *	@params  {Array of Object}	members
 *	@params  {Number}	insertPt
 *	@returns {Array}
 *	
 *	memberアイテムまたはアイテムの配列をグループメンバーに挿入する
 *	itemストアに存在しないアイテムを挿入した場合は同時にアイテムストアへの挿入を行う
 *	挿入に成功したアイテム配列を返す
 */
pman.ReNameItem.prototype.insert = function(members,insertPt){
	if(this.type != '-group-') return false;
//group
	if(!(members instanceof Array)) members = [members];
	if(! insertPt ) insertPt = 0;//挿入点は、デフォルトで先頭
	var result = [];
	for (var m = 0 ; m < members.length ; m ++){
		if(members[m] instanceof pman.ReNameItem){
			if (members[m] === this) continue;//自分自身を排除
			if (pman.reName.items.indexOf(members[m]) < 0){
				result = result.concat(pman.reName.appendItems(members[m],this,'PLACEATBEGINNING'));
			}else{
				if(members[m].move(this,'INSIDE')) result.push(members[m]);
			};
		};
	};
	if((result.length)&&(!pman.reName.rewrite)) pman.reName.rewrite = true;
	return result;
}

/**
 *	@returns {Array}
 *	グループmembersアイテムの内容を連結して返す
 *	バンドルエントリのメンバーは展開しない
 */
pman.ReNameItem.prototype.expandMembers = function(ips){
	if(this.type != '-group-') return [];
//group
	var result = [];
	if (this.members instanceof Array) this.members.forEach(e =>{
		result.push(e);
		if(e.type == '-group-') result = result.concat(e.expandMembers());
	});
	return result;
}

/**
 *	@params  {Array of Object}	members
 *		挿入するアイテムまたはアイテムの配列
 *	@params  {Object pman.ReNameItem}	insertTargetItem
 *		挿入起点アイテムまたはアイテムを指定する文字列 id|整数ID|path|名前
 *		削除されたアイテムが指定された場合は未指定の扱いとなる
 *		挿入点未指定の場合はフォーカスを参照 -1(=フォーカスなし)の場合は、末尾に挿入
 *	@params  {String}	placement
 		挿入位置指定文字列 PLACEBEFORE|PLACEAFTER|INSIDE|PLACEATEND|PLACEATBEGINNING
 *	@returns {Array}
 *	
 *	memberアイテムまたはアイテムの配列をアイテムストアに挿入する appendItems
 *	新規挿入に成功したアイテム配列を返す
 *	挿入基準アイテムは、IDで指定された場合必ずしも期待通りのオブジェクトをしめさない場合があるので注意
 */
//undoシステム組込前
pman.reName.appendItems = function(members,insTargetItem,placement){
console.log(insTargetItem);
	if(!(members instanceof Array)) members = [members];
	if(typeof insTargetItem =='undefined') insTargetItem = pman.reName.focus;//挿入点ID、デフォルトでフォーカス位置
	insTargetItem = pman.reName.getItem(insTargetItem);//本体とゴミ箱が含まれるので判定が必要
	if(insTargetItem instanceof pman.ReNameItem){
console.log(insTargetItem.getPath(true)+' : '+insTargetItem.name);
		if(insTargetItem.ip.length < 2) insTargetItem = null;//削除されたアイテム
	}else if((insTargetItem === pman.reName)||(insTargetItem === pman.reName.removedItems)){
		insTargetItem = null;
	};
	if(! placement ) placement = 'PLACEBEFORE';
	var insertParent = pman.reName ;
//オブジェクトとして保存
	if((placement == 'PLACEAFTER')||(placement == 'PLACEBEFORE')){
		if (insTargetItem) insertParent = insTargetItem.parent;
	}else if((placement == 'INSIDE')||(placement == 'PLACEATEND')||(placement == 'PLACEATBEGINNING')){
		if (insTargetItem) insertParent = ((insTargetItem.type == '-group-')||(insTargetItem.type == '-bundle-'))? insTargetItem:insTargetItem.parent;
	};
console.log(insertParent)

	var result = [];
	for (var m = 0 ; m < members.length ; m ++){
//未登録のアイテムのみを扱う 既存のアイテムは無視
//アイテムのユニーク判定としてファイルのパスも併用する
		if(
			(members[m] instanceof pman.ReNameItem)&&
			(insertParent.members.indexOf(members[m]) < 0)&&
			(pman.reName.items.indexOf(members[m]) < 0)&&
			(pman.reName.items.findIndex(function (e){return ((e.file)&&(e.file === members[m].file))}) < 0)
		){
			members[m].parent = insertParent;
			var insPt = members[m].parent.members.indexOf(insTargetItem);
			if(insPt < 0) insPt = 0;
			var insOffset = 0;
			if(placement == 'INSEIDE'){
				insPt = 0;//0強制
			}else if(placement == 'PLACEAFTER'){
				insOffset = 1;
			}else if(placement == 'PLACEATEND'){
				insPt = members[m].parent.members.length;
			}else if(placement == 'PLACEATBEGINNING'){
				insPt = 0;//0
			};
			var im = members[m].parent.members.indexOf(members[m]);
			if(im < 0){
				members[m].parent.members.splice(insPt+insOffset,0,members[m]);
				result.push(members[m]);
			};
			var ix = pman.reName.items.indexOf(members[m]);
			if(ix < 0){
//新規挿入・指定メンバーが現在のリストにない
				if(insTargetItem){
					pman.reName.items.splice(pman.reName.items.indexOf(insTargetItem)+insOffset,0,members[m]);
				}else{
					pman.reName.items.push(members[m]);
				};
				members[m].getPath();//挿入・追加されたアイテムはパスを更新
			};
		};
	};
	if ((result.length)&&(! pman.reName.rewrite)) pman.reName.rewrite = true;
	return result;
}
/*
 *  @params  {String|File|FileEntry|URL} fl
 *  @params  {Boolean}	asGrp
	アイテム初期化
	引数として有効なものは
		HTMLCanvasElement
		String
		URL
		File
		FileSystemFileEntry(node|web)


*/
pman.ReNameItem.prototype.parse = async function(fl,asGrp,type){
console.log(arguments);
	if(fl instanceof HTMLCanvasElement){
//HTMLCanvasElementが与えられると、-canvasasset-|-canvasxpst- となる
//アイテムタイプは強制的に上書きされる
			this.canvas       = fl;
			this.name         = (fl.name)? fl.name:String(new Date().getTime());
			this.text         = this.name;
			this.type         = (this.name.match(/xpst?|xdts|tdts|sheet|dope/i))? '-canvasxpst-':'-canvasasset-';//アセットタイプ
//canvasStrem管理は pman.reName.canvasPaint が行う ここでは初期化されない
//lastModifiedは、取得可能なもの以外は0で初期化してバックグラウンドで更新する仕様に変更（非同期処理）
	}else if(
			(asGrp)||
			((typeof fl == 'string')&&((String(fl).trim()).match( /\/$|\\\\$/ )))||
			((fl.filesystem)&&(fl.isDirectory))
	){
//グループ処理を先行で分離
//文字列引数が"/"|"\\"で終了する場合はフラグの有無に関わらずグループアイテムとして扱う
//統一してディレクトリ名の後方のデリミタを省略するポリシーとは一致しないがその指定を許すものとする
//グループ名は、文字列引数の場合とエントリで分岐せずにフルパス文字列で置き換える
//2025仕様変更に伴い 各アイテムの.path の値は必ず '/'で開始される文字列となる
console.log('asGRP');
//タイプ未指定の場合(デフォルト値として)'-group-'
		if(typeof type == 'undefined') type = '-group-';
//引数がファイルシステムディレクトリエントリの場合
		if(fl.filesystem){
			let itm = this;
			this.entry = fl;
			this.entry.file(f => itm.file = f);
//			if(appHost.platform == 'Electron'){}
// Electron環境の場合は、fileにpath拡張があるのでそれを利用する それ以外はentryのフルパス文字列で置き換え
			fl = (this.file.path)? this.file.path : this.entry.fullPath;
		};
//URIエンコーディングされている場合はデコード
		if(fl.match(/%[0-9A-Fa-f]{2}/g)) fl = decodeURIComponent(fl);
//fl引数をパスとして分解 相対パス|絶対パス
		fl = new nas.File(fl);
//console.log(this.members.join());
//console.log(this.members.length);
if(this.members.length > 0) throw new Error('member has elements!');
		this.members = [];//メンバ初期化
		this.name         = fl.name   ;//nas.File.basename(fl.replace(/\/$|\\\\$/,''));//末尾のデリミタを払う
		this.text         = this.name ;
		this.type = (String(type).match(/^-.*-$/))? type:'-group-';//
//グループパス 旧来はnullを設定されていたがフォルダのパスを設定するように変更
		if((fl.body[0]=='')||(fl.body[0].match(/^[a-z]:$/i))){
//引数がフルパスのときは、baseFolderを基準に相対パスを出す
			this.path = fl.fsName;
		}else if(fl.body.length == 1){
//フォルダ名のみで初期化された場合は外部からの調整が必要
			this.path = nas.File.resolve('/',pman.reName.baseFolder,fl.name);
		}else{
			this.path = nas.File.resolve('/',pman.reName.baseFolder,fl.fsName);
		};
		this.relativePath = nas.File.relative(nas.File.resolve('/',pman.reName.baseFolder),this.path);
//console.log([fl,this.relativePath,this.path]);
		this.lastModified = new Date().getTime();
	}else if(typeof fl == 'string'){
//console.log(fl)
		if(fl.match(/%[0-9A-Fa-f]{2}/g)) fl = decodeURIComponent(fl);
//文字列引数はパスとして扱う
//フルパスとベースディレクトリからの相対パスのケースあり
//パスで指定されたケースを優先(= electron環境下でファイルを持っていても使用しない)
console.log('asAsset');
//ローカルファイルからフルパスを引数にして渡す
/*
	オブジェクトのパスは、FilesystemEntryのパスに準拠する
	.path /.../filename.ext
	.relativePath .../filename.ext
	このパスにはbaseFolder(=セッションのルート)文字列は含まれない
*/
		fl = new nas.File(fl)//多くのケースでflは相対パス|絶対パス
console.log(fl);
		this.name         = fl.name;
		this.path         = fl.fsName;
		this.relativePath = nas.File.relative(nas.File.resolve('/',pman.reName.baseFolder),this.path);
		this.text         = this.name.replace(/\.[^\.]+$/,'');
			this.text         = this.text.replace(/^KGS_([a-z]\d{2}_)\d{3}_\d{2}_/,"$1:");//鬼人幻燈抄専用フィルタ
		this.type         = pman.guessItemType(this.name);//アセットタイプ
		this.mime         = nas.File.contentType(this.name);
		this.file         = null;
		this.url          = null;

		this.lastModified = (this.stat)? this.stat.mtimeMs:0;
//lastModifiedは、取得可能なもの以外は0で初期化してバックグラウンドで更新する仕様に変更（非同期処理）
	}else if(fl instanceof URL){
console.log('parse URL');
//FileAPI | node拡張の場合もあるので注意 グループが与えられるケースあり
		var pathName = decodeURIComponent(fl.pathname);
		this.name         = nas.File.basename(pathName);
		this.path         = fl.pathname;
		this.relativePath = decodeURIComponent(nas.File.relative(
				nas.File.dirname(document.location.pathname),
				nas.File.resolve(
					nas.File.dirname(document.location.pathname),
					fl.pathname
				)
			));
		this.text         = this.name.replace(/\.[^\.]+$/,'');
			this.text         = this.text.replace(/^KGS_([a-z]\d{2}_)\d{3}_\d{2}_/,"$1:");
		this.type         = pman.guessItemType(this.name);//アセットタイプ groupはURLを持たないので判定不要
		this.mime         = nas.File.contentType(this.name);
		this.url          = fl;//Object URL not string
		let itm = this;
		fetch(this.url.href+"?"+new Date().getTime())
			.then(response => response.blob())
			.then(b => new File([b], itm.name))
			.then(f => itm.parse(f))
			.catch(e => {console.log(e);itm.parse(itm.name,true);});
	}else if(fl instanceof File){
console.log('parse File Object');
console.log(fl);
//FileAPI | node拡張の場合もあるので注意 
		this.name  = fl.name;
		this.path  = "";
		if(fl.path){
//node拡張でFileがpathを持っているケース
			this.path = fl.path;
			this.relativePath = nas.File.relative(nas.File.resolve('/',pman.reName.baseFolder),this.path);
		}else if(fl.webkitRelativePath){
//webkitRelativePathがある
			this.relativePath = nas.File.relative(pman.reName.baseFolder,fl.webkitRelativePath);
			this.path         = nas.File.resolve('/',pman.reName.baseFolder,this.relativePath );
		}else{
			this.relativePath = fl.name;
			this.path         = nas.File.resolve('/',pman.reName.baseFolder,this.relativePath );
		};
		this.text         = fl.name.replace(/\.[^\.]+$/,'');
			this.text         = this.text.replace(/^KGS_([a-z]\d{2}_)\d{3}_\d{2}_/,"$1:");
		this.type         = pman.guessItemType(fl);//アセットタイプ groupはfileを持たないので判定不要
		this.mime         = nas.File.contentType(fl.name);
		this.file         = fl;
		this.lastModified = this.file.lastModified;
	}else if(fl.filesystem){
//FileSystemエントリを持っている FileSystemFileEntry
//ディレクトリであるケースがある
		if(fl.isFile){
			this.entry        = fl;
console.log(nas.File.resolve('/',pman.reName.baseFolder),nas.File.resolve('/',this.entry.fullPath));
			this.name         = fl.name;
			this.path         = nas.File.resolve('/',this.entry.fullPath);
			this.relativePath = nas.File.relative(nas.File.resolve(pman.reName.baseFolder),this.path);
			this.text         = fl.name.replace(/\.[^\.]+$/,'');
				this.text         = this.text.replace(/^KGS_([a-z]\d{2}_)\d{3}_\d{2}_/,"$1:");
			this.type         = pman.guessItemType(fl);
			this.mime         = nas.File.contentType(fl.name);
			this.lastModified = (fl.isDirectory)? new Date().getTime():((this.stat)?this.stat.mtimeMs:0);
//パース時にエントリからFileを取得して設定する・以降はファイルオブジェクトを使う
			let itm = this;
			this.entry.file(f => {
				console.log(f);
				itm.file = f
				itm.lastModified = f.lastModified;
				if(f.path){
					itm.path = f.path;
					itm.relativePath = nas.File.relative(nas.File.resolve('/',pman.reName.baseFolder),this.path);
				};
			});
		};//File 以外のエントリは基本的にないはずだがそれらが引き渡された場合はNOP
	};
//パース時点ではimg|statプロパティを直接設定しない 遅延解決される
//statを得る際にリソース制限が行われる
//Electron環境下　または statがnullのケースでステータスの取得を行う
	if((appHost.platform == 'Electron')||(!(this.status))) this.checkItemStatus();
}
/*
	var grp = new pman.ReNameItem("home/1234/",true);
	console.log(grp);
*/
/*
	読込ステータスを更新してプログレス表示を更新する
	@params {string}	sts
		entry|hold|done|abort
*/
var statuslog=[];
pman.reName.loadStatus = async function loadStatus(sts,itm){
statuslog.push(sts +':'+ itm);
	if(sts == 'entry'){
		pman.reName.imageLoadingStatus.loading ++;
	}else if(sts == 'done'){
		pman.reName.imageLoadingStatus.loading --;
		pman.reName.imageLoadingStatus.loaded ++;
	}else if(sts == 'abort'){
		pman.reName.imageLoadingStatus.loading --;
		pman.reName.imageLoadingStatus.error ++;
	};
//	xUI.printStatus(JSON.stringify(pman.reName.imageLoadingStatus));

	if(
		pman.reName.imageLoadingStatus.count >(
			pman.reName.imageLoadingStatus.loaded+pman.reName.imageLoadingStatus.error
		)
	){
		xUI.printStatus('loaded / count :'+[
		pman.reName.imageLoadingStatus.loaded+pman.reName.imageLoadingStatus.error,
		pman.reName.imageLoadingStatus.count
		].join(' / '));
	};// */
}
/**
	@params	{Entry|URL|File|String}	fl
	@params	{Boolean}	force
	ReNameItemに画像データを設定する
	引数flがない場合は、fileプロパティの値を使用する
	fileプロパティが存在しない場合pathを確認する
	引数が以前のデータと異なる場合は再パースを行う
	file|path|relativePathプロパティが画像を指していない場合はNOP
	stat.size 0||undefinedの場合はスキップ
*/
pman.ReNameItem.prototype.setImage = async function(fl,force,callback){
console.log('//===================== setImage : '+ this.name);
console.log(fl,force);
	if((this.type == '-canvasasset-')||(this.canvas)){
		var itm = this;
		var compCanvas = null;
		if(!(itm.img instanceof HTMLImageElement)) itm.img = document.createElement('img');
		if(this.baseimg){
			compCanvas = document.createElement('canvas');
			compCanvas.width  = this.baseimg.naturalWidth ;
			compCanvas.height = this.baseimg.naturalHeight ;
			const ctx = compCanvas.getContext("2d");
			ctx.drawImage(this.baseimg, 0, 0);
			ctx.drawImage(this.canvas,0,0);
		}else{
			compCanvas = this.canvas;
		};
		compCanvas.toBlob(function(blob) {
			if(itm.img.src) URL.revokeObjectURL(itm.img.src);
			itm.img.src = URL.createObjectURL(blob);
			pman.reName.loadStatus('done',itm.name);
			itm.img.addEventListener('load',()=>{
//				if(pman.reName.canvasPaint.targetElm) pman.reName.canvasPaint.targetElm.src = itm.img.src;
				itm.setThumbnail(true),{once:true}
			});
			itm.imgLastModified = itm.lastModified;
			itm.thmLastModified = itm.imgLastModified;
		}, 'image/png');
		return this;
	};
console.log(this);
	if(
		(this.name.match(pman.reName.imageRegex))&&
		(this.type.match(/\-(asset|other|xpst)\-/))&&
		((this.lastModified == 0)||(this.lastModified != this.imgLastModified)||(force))
	){
//引数は this.file|this.url|this.path|this.relativePath いずれかと一致する
		if(!(fl))	fl = (this.file)? this.file:((this.url)?this.url:(((appHost.platform == 'Electron')&&(this.path))?this.path:this.relativePath));
console.log(fl);
//相対パスの起点は nas.File.join(window.location.pathname,fl)
//新規ならば再パース
		if((fl)&&((this.file != fl)&&(this.url != fl)&&(this.path != fl)&&(this.relativePath != fl))){
console.log('re-parse');
console.log(fl);//
			this.parse(fl,(this.members)?true:false,this.type);
		};
//存在しない場合は作成
		if(! this.img) this.img = document.createElement('img');
//ゼロサイズ保留エントリ 読み込んだものとして扱う
		if((this.file)&&(this.stat)&&(!(this.stat.size))){
//console.log(fl)
//console.log(this.stat)
console.log('skip 0 size entry : '+ this.name );
			pman.reName.loadStatus('done',this.name);
			this.imgLastModified = 0;
		}else if(this.name.match(/\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pje|png|svg|svgz|webp)$/i)){
console.log(this.path);
//ブラウザが直接読めるはず→キャッシュを得る→サムネイル登録
			this.imgsrc = (this.url)? this.url.href:((this.file)? URL.createObjectURL(this.file):((this.path)? nas.Pm.encodeIdf(this.path):""));
			this.img.src = this.imgsrc;
			var itm = this;
			pman.reName.loadStatus('done',itm.name);
			itm.imgLastModified = itm.lastModified;
			itm.img.addEventListener('load',()=>{
				if(callback instanceof Function) callback(itm);
				itm.setThumbnail(true)
			},{once:true});
		}else if((TgaLoader)&&(this.name.match(/\.(tga|targa)$/i))){
//TGA
			const itm       = this;
			if(itm.url){
console.log('load TGA form URL')
//URL指定
				let tga = new TgaLoader();
				tga.load(this.url.href);
				itm.imgsrc  = tga.getDataURL('image/png');
				itm.img.src = itm.imgsrc;
				pman.reName.loadStatus('done',itm.name);
				itm.imgLastModified = itm.lastModified;
				itm.img.addEventListener('load',()=>{
					if(callback instanceof Function) callback(itm);
					itm.setThumbnail(true)
				},{once:true});
			}else if(itm.file instanceof File){
//HTMLFileあり
				itm.file.arrayBuffer().then(function(result){
					let tga = new TgaLoader();
					tga.load(new Uint8Array(result));
					itm.imgsrc  = tga.getDataURL('image/png');
					itm.img.src = itm.imgsrc;
					pman.reName.loadStatus('done',itm.name);
					itm.imgLastModified = itm.lastModified;
					itm.img.addEventListener('load',()=>{
						if(callback instanceof Function) callback(itm);
						itm.setThumbnail(true)
					},{once:true});
				}).catch(function(err){
					pman.reName.loadStatus('abort',itm.name);
					console.log(err);
				});
			}else if(itm.path){
//			}else if((appHost.platform == 'Electron')&&(itm.path)){
//node > v8
			  if(appHost.platform == 'Electron'){
					let tga = new TgaLoader();
					tga.open( nas.Pm.encodeIdf(itm.path) , function(){
						itm.imgsrc  = tga.getDataURL('image/png');
						itm.img.src = itm.imgsrc;
						pman.reName.loadStatus('done',itm.name);
						itm.imgLastModified = itm.lastModified;
						itm.img.addEventListener('load',()=>{
							if(callback instanceof Function) callback(itm);
							itm.setThumbnail(true)
						},{once:true});
					});
			  }else{
//electron <= v8系
				try {
					let tga = new TgaLoader();
TgaLoader.prototype.open = function(e,a,b){var t=this,r=new XMLHttpRequest;r.responseType="arraybuffer",r.open("GET",e,!0),r.onload=function(){200===r.status&&(t.load(new Uint8Array(r.response)),a&&a())},r.onerror=function(){if(b)b()},r.send(null)};
					tga.open(this.path.replace(/\#/g,'%23'),function(){
						itm.imgsrc  = tga.getDataURL('image/png');
						itm.img.src = itm.imgsrc;
						pman.reName.loadStatus('done',itm.name);
						itm.imgLastModified = itm.lastModified;
						itm.img.addEventListener('load',()=>{
							if(callback instanceof Function) callback(itm);
							itm.setThumbnail(true);
						},{once:true});
					},function(err){
						pman.reName.loadStatus('abort',itm.name);
						console.log(err);
					});
				} catch(err) {
					console.log(err);
				};
			  };
			}else{
//読めない・失敗扱い
					pman.reName.loadStatus('abort',itm.name);
			};
		}else if((this.name.match(/\.(tiff?)$/i))){
//sharp使用は保留 Tiff.jsに乗り換え
//TIFF with Tiff.js
			const itm       = this;
			if(itm.file instanceof File){
//HTMLFileあり
				itm.file.arrayBuffer().then(function(result){
					let tiff = new Tiff({buffer:new Uint8Array(result)});
					itm.imgsrc  = tiff.toDataURL('image/png');
					itm.img.src = itm.imgsrc;
					pman.reName.loadStatus('done',itm.name);
					itm.imgLastModified = itm.lastModified;
					itm.img.addEventListener('load',()=>{
						if(callback instanceof Function) callback(itm);
						itm.setThumbnail(true);
					},{once:true});
				}).catch(function(err){
					pman.reName.loadStatus('abort',itm.name);
					console.log(err);
				});
			}else if((itm.url)||(itm.path)){
//			if((itm.url)||((appHost.platform == 'Electron')&&(itm.path))){
console.log('load Tiff from URL')
// load from URL||path {String}指定
			var imgurl = (itm.url)? itm.url.href:itm.path.replace(/\#/g,'%23');
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'arraybuffer';
				xhr.open('GET', imgurl);
				xhr.onload = function (e) {
					var tiff = new Tiff({buffer: xhr.response});
					itm.imgsrc  = tiff.toDataURL('image/png');
					itm.img.src = itm.imgsrc;
					pman.reName.loadStatus('done',itm.name);
					itm.imgLastModified = itm.lastModified;
					itm.img.addEventListener('load',()=>{
						if(callback instanceof Function) callback(itm);
						itm.setThumbnail(true)
					},{once:true});
				};
				xhr.send();
			}else{
//読めない・失敗扱い
					pman.reName.loadStatus('abort',itm.name);
			};
		}else if((PSD)&&(this.name.match(/\.(psd|psb)$/i))){
			var itm = this;

			if(this.file instanceof File){
// load from File
//console.log('get psd fromFile:'+this.file.name);
				this.file.arrayBuffer().then(function(result){
					var psd = new PSD(new Uint8Array(result));
					psd.parse();
					itm.img = psd.image.toPng();
					itm.imgsrc = itm.img.src;
					pman.reName.loadStatus('done',itm.name);
					itm.imgLastModified = itm.lastModified;
					itm.img.addEventListener('load',()=>{
						if(callback instanceof Function) callback(itm);
						itm.setThumbnail(true);
					},{once:true});
				},function(err){
					pman.reName.loadStatus('abort',itm.name);
					console.log(err);
				}).catch(function(err){
					pman.reName.loadStatus('abort',itm.name);
					console.log(err);
				});
			}else if((itm.url)||(itm.path)){
//			}else if((itm.url)||((appHost.platform == 'Electron')&&(itm.path))){
// load from URL
			var imgurl = (itm.url)? itm.url.href:itm.path.replace(/\#/g,'%23');
console.log('get psd fromURL:'+imgurl);
			try{
				if(PSD.fromURL){
					PSD.fromURL(imgurl).then(function(psd) {
						itm.img = psd.image.toPng();
						itm.imgsrc = itm.img.src;
						pman.reName.loadStatus('done',itm.name);
						itm.imgLastModified = itm.lastModified;
					}).catch(function(err){
						console.log(err);
					});
				}else{
					var psd = PSD.fromFile(imgurl);
					if(psd){
						itm.img = psd.image.toPng();
						itm.imgsrc = itm.img.src;
						pman.reName.loadStatus('done',itm.name);
						itm.imgLastModified = itm.lastModified;
					};
				};
				itm.img.addEventListener('load',()=>{
					if(callback instanceof Function) callback(itm);
					itm.setThumbnail(true)
				},{once:true});
			}catch (err){
				console.log(err);
				pman.reName.loadStatus('abort',this.name);
			}
			};
		}else{
//ファイル名から解釈できないアイテム エラー扱いでエントリを減らす
			pman.reName.loadStatus('abort',this.name);
		};
		if(pman.reName.items.indexOf(this) == pman.reName.focus){
			setTimeout(function(){pman.reName.setPreview(pman.reName.focus,null,'setImage')},100);
		};
//ロード開始処理 ローディングステータスカウント加算
		pman.reName.loadStatus('entry',this.name);
	};
//キューエントリ削除(あれば)
	var qix = pman.reName.loadQueue.indexOf(this);
	if(qix >= 0) pman.reName.loadQueue.splice(qix,1);
//自分自身を返す
	return this;
};
/**
 *	params {Object}	iamgeData
 *	Raw画像データを受け取りimgプロパティを設定する
 *
 *	内部メソッド: うけとる画像データのプロパティはsharpの返すmetadataにRawImageをアタッチしたもの
 *	以下はTIFFの場合のサンプル
 *	フォーマットにより内容は変化する channel,height,width,space は必須
 *	{
 *		channels        : {Number} 画像チャンネル数
 *		density         : {Number} 画像解像度
 *		depth           : {String} "uchar"
 *		format          : {String}  画像フォーマット"tiff"
 *		hasAlpha        : {Boolean} Alphaチャンネルの有無 true
 *		hasProfile      : {Boolean} 画像プロファイルの有無 true
 *		height          : {Number}  画像高px 595
 *		icc             : {Uint8Array} icc プロファイル内容
 *		iptc            : {Uint8Array} iptc メタ情報
 *		isProgressive   : {Boolean} プログレッシブデータかfalse
 *		orientation     : {Number} 画像格納方向 1
 *		pages           : {Number} ページ数 1
 *		rawdata         : {Uint8Array} raw画像データ(拡張部分)
 *		space           : {String} カラースペース "srgb"
 *		subifds         : {Number} サブイメージ
 *		tifftagPhotoshop: {Uint8Array} Photoshopタグ
 *		width           : {Number} 画像幅px 842
 *		xmp             : {Uint8Array} XMP	
 *	}
 */
pman.ReNameItem.prototype.setRawImage = function setRawImage(imageData){
	var itm = this;
	if(imageData){
		let canvas = document.createElement('canvas');
		canvas.width  = imageData.width;
		canvas.height = imageData.height;
		let context = canvas.getContext('2d');
		let cavasImg = context.createImageData(imageData.width, imageData.height);
		var pix = imageData.width * imageData.height;
		for(var i = 0 ; i < pix ; i ++){
			var d = i*4 ;
			var p = i*imageData.channels;
			cavasImg.data[d]   = imageData.rawdata[p];//R
			cavasImg.data[d+1] = imageData.rawdata[p+1];//G
			cavasImg.data[d+2] = imageData.rawdata[p+2];//B
			cavasImg.data[d+3] = (imageData.channels == 4)? imageData.rawdata[p+3] : 255;//A
		};
// 取得データをカンバスに描画
		context.putImageData(cavasImg, 0, 0);
		canvas.toBlob(function(blob) {
			if(itm.img.src) URL.revokeObjectURL(itm.img.src);
			itm.img.src = URL.createObjectURL(blob);
			pman.reName.loadStatus('done',itm.name);
			itm.img.addEventListener('load',()=> itm.setThumbnail(true),{once:true});
			itm.imgLastModified = itm.lastModified;
			itm.thmLastModified = itm.imgLastModified;
		}, 'image/png');
	}else{
		pman.reName.loadStatus('abort',itm.name);
	};
}
/*
 *	@params {Boolean} force
 *	lastModifiedの比較を無視して強制的にサムネイルを更新するフラグ
 *
 *	現在のimgプロパティからサムネイルを設定する
 *	画像タイムシート|imgが無い場合｜サムネイルがimgと一致している場合はNOP
 *	画面上にすでにサムネイルがある場合は更新時を比較して更新
 *	更新の強制フラグを与えることも可能
 *	基本的にこのメソッドはバックエンドで呼ばれる
*/
pman.ReNameItem.prototype.setThumbnail = function setThumbnail(force){
if(force) console.log(this.text);
	var img = this.img;
	if(this.type == '-bundle-'){
		;//NOP
	}else if(
		(this.type != '-xpst-')&&
		(this.type != '-group-')&&
		((img)&&(img.width))&&
		((this.imgLastModified > this.thmLastModified)||(force))
	){
		if(! this.thumbnail) this.thumbnail = document.createElement('img');
//imgをcanvasへ幅256pxで描画 
		let canvas   = document.createElement('canvas');
		let sc       = 256/img.width;
		let scHeight = Math.floor(img.height*sc);
//console.log([sc,scHeight]);
		canvas.width  = 256;
		canvas.height = (this.img.width > 256)? scHeight:this.img.height;
		let context = canvas.getContext('2d');
// 元画像が幅256px以上なら縮小画像を配置||それ以下は原寸センタ配置
		if(this.img.width > 256){
			context.drawImage(img, 0, 0, 256, scHeight);
		}else{
			context.drawImage(img,Math.floor((256-img.width)/2),0);
		};
		var itm = this;
// toBlob は非同期操作
		canvas.toBlob(function(blob) {
			if(itm.thumbnail.src) URL.revokeObjectURL(itm.thumbnail.src);
			itm.thumbnail.src = URL.createObjectURL(blob);
//console.log(itm);
			var elm = itm.getHTMLElement();
			if((elm)&&(elm.children.length)&&(elm.children[0].children[0].src)) elm.children[0].children[0].src = itm.thumbnail.src;
			if(!pman.reName.rewrite) pman.reName.rewrite = true;
//			pman.reName.checkPixelEven(itm);//?
		}, 'image/png');
/*ここではsharpを使用しない> パスが優先されるためフォーマットによって扱いにくい */
		this.thmLastModified = this.imgLastModified;
	}else{
console.log('NOP :');
console.log([this.type,img,img.width,this.imgLastModified,this.thmLastModified]);
//		var elm = itm.getHTMLElement();
//		if((elm)&&(elm.children.length)&&(elm.children[0].src)) elm.children[0].src = itm.thumbnail.src;
//		if(!pman.reName.rewrite) pman.reName.rewrite = true;	
	};
	pman.reName.checkPixelEven(this);
}
pman.reName.checkPixelEven = async function checkPixelEven(itm){
	if((itm.img)&&(itm.type=='-asset-')){
		var elm = itm.getHTMLElement();
		if((elm)&&(elm.children.length)&&(elm.children[0].children[0].src)){ 
			if(itm.img.width % 2 != 0){
				nas.HTML.addClass(elm.children[0].children[0],"elementThumbnailWidthOdd");
			}else{
				nas.HTML.removeClass(elm.children[0].children[0],"elementThumbnailWidthOdd");
			};
			if(itm.img.height % 2 != 0){
				nas.HTML.addClass(elm.children[0].children[0],"elementThumbnailHeightOdd");
			}else{
				nas.HTML.removeClass(elm.children[0].children[0],"elementThumbnailHeightOdd");
			};
		};
	};
}
/**
 *  画像の強制更新 対象は選択中のアイテム
 *  サムネイルが無い場合に優先して画像を読み出しサムネイルを更新
 *  選択されたアイテムがない場合は、コンテキストメニューのイベントソースをチェックしてフォーカスを移動
 *  スイッチで、全アイテムの更新
 */
pman.reName.updateImages = async function updateImages(all){
	let tgtItems = (all)? pman.reName.items:pman.reName.selection;
	if(tgtItems.length == 0){
		let tgtID = pman.reName.parseId(xUI.contextMenu.eventSourceElement.id);
		if(isNaN(tgtID)) tgtID = pman.reName.focus;
		if((tgtID != pman.reName.focus)&&(tgtID >= 0)) pman.reName.select(tgtID);
		tgtItems = [pman.reName.items[tgtID]];
	};
	tgtItems.forEach(e =>{
		if((e.img)&&(e.img.width)){
			e.setThumbnail(true);
		}else{
			e.setImage(undefined,true);
		};
	});
}

/**
 *	@params  {String|Object File}
 *	最新のファイルステータスを取得して それを引数にupdateを呼び出す
 *  updateは現在のステータスと比較して更新の必要があれば更新処理を行う
 *	ステータスはアトリビュート名がelectron互換で、そのまま使用可能
 *	サイズと時間(size,mtime,mtimeMs)のみを更新判定対象として使用するのでサブセットでも良い
Stats {
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
> size: 527,
  blksize: 4096,
  blocks: 8,
> atimeMs: 1318289051000.1,
> mtimeMs: 1318289051000.1,
> ctimeMs: 1318289051000.1,
> birthtimeMs: 1318289051000.1,
> atime: Mon, 10 Oct 2011 23:24:11 GMT,
> mtime: Mon, 10 Oct 2011 23:24:11 GMT,
> ctime: Mon, 10 Oct 2011 23:24:11 GMT,
> birthtime: Mon, 10 Oct 2011 23:24:11 GMT }

	Electron環境でない場合はFileプロパティがあるのでsizeとtime関連のデータを抜き出して使用する
	ステータスが更新または設定された場合は Object.update を呼び出す
 *	
 */
pman.ReNameItem.prototype.checkItemStatus = async function checkItemStatus(fl){
console.log('checkItemStatus for : '+this.path);
console.log(this.stat);
	if((typeof fl == 'undefined')&&(appHost.platform != 'Electron')&&(this.stat)){console.log('skip :'); return ;}//WEB版では１回目のみステータスを形成する
//console.log('checkItemStatus for : '+this.text);
	if(typeof fl == 'undefined') fl = ((appHost.platform == 'Electron')&&(this.path))? this.path:((this.entry)?this.entry:this.file);
var caseNo = 0;//init for debug
	if(this.type.match(/-bundle-|-group-/)){
//バンドル|グループは対応するファイルシステムエントリを持たないのでステータスチェックは行われない
//構成の変更によりバンドル|グループもパスを持つ可能性あり パスを持っている場合に限りステータス比較を行う
console.log('skip status check for : '+this.text);
	}else if((fs)&&(this.path)) {
caseNo = 1 ;//node@8 + electron 実質上使用されないので放置でOK 2022 01 18
		fs.stat(fl,(stat) =>{this.update(stat);} );
	}else if((electronIpc)&&(this.path)){
caseNo = 2;//node>@8 hub && spoke:
		var ix = pman.reName.items.indexOf(this);
		if(ix >= 0){
			if(this.path != fl) this.path = fl;
			uat.MH.parentModule.window.postMessage({
				channel:'callback',
				from:{name:xUI.app,id:uat.MH.objectIdf},
				to:{name:'hub',id:uat.MH.parentModuleIdf},
				command:'return electronIpc.statSync(...arguments)',
				content:[this.path],
				callback:"pman.reName.items["+ix+"].update(arguments[0]);"
			});
		}else{
console.log(this);
		};
	} else if(this.entry){
caseNo = 3 ;// has FileSystemEntry electron|WEB問わず ステータスをEntryのfileメソッドで処理
		let itm = this;
		this.entry.file( f =>{
			itm.file = f;
			var stat = {
				size        : f.size,
				atime       : f.lastModifiedDate,
				ctime       : f.lastModifiedDate,
				mtime       : f.lastModifiedDate,
				birthtime   : f.lastModifiedDate,
				atimeMs     : f.lastModified,
				ctimeMs     : f.lastModified,
				mtimeMs     : f.lastModified,
				birthtimeMs : f.lastModified
			};
			itm.update(stat);
		});
	}else if((this.file)&&(fl instanceof File)){
caseNo = 4 ;
// has HTML-File electron|WEB問わず ステータスをFileのアトリビュートから作成 これを先行処理してはならない
		if((this.file.name != fl.name)||(this.file.lastModified != fl.lastModified)||(this.file.size != fl.size)) this.file = fl;
		var stat = {
			size        : this.file.size,
			atime       : this.file.lastModifiedDate,
			ctime       : this.file.lastModifiedDate,
			mtime       : this.file.lastModifiedDate,
			birthtime   : this.file.lastModifiedDate,
			atimeMs     : this.file.lastModified,
			ctimeMs     : this.file.lastModified,
			mtimeMs     : this.file.lastModified,
			birthtimeMs : this.file.lastModified
		};
		this.update(stat);
	}else{
caseNo = 5;//キーとなるデータから取得できないケース
// 主に-group-|-canvasasset-|-canvasxpst- | WEB環境でパスのみで設定されたデータの初回アクセス
// 現在時で仮の値を返す;
//	if(fl instanceof HTMLCanvasElement){新設 canvasasset Item};//
		var now = new Date();
		var stat = (this.stat)?this.stat:{
			size        : null,
			atime       : now,
			ctime       : now,
			mtime       : now,
			birthtime   : now,
			atimeMs     : now.getTime(),
			ctimeMs     : now.getTime(),
			mtimeMs     : now.getTime(),
			birthtimeMs : now.getTime()
		};// */
		this.update(stat);
	};
console.log('case : '+ caseNo);
}
/**
 *	@params {Function}	fn
 *	@params {Boolean}	neg
 *	イテレータ関数によりtrueとなるアイテムをフィルタして隠蔽｜表示する
 *  falseとなるアイテムに対してはNOP
 *  フィルタ関数の引数はアイテム自身
 *  通常は隠蔽 反転オプション neg が与えられた場合は 表示動作となる
 例 function(i){return ((i.type == '-bundle-')&&(i.bundleInf.bundleData.status.content == 'Aborted'))? true:false;}

 引数 fn が与えられない場合は、フィルタを解除して全表示とする
 	「選択アイテムを隠す」(i)=>(i.selected)
 	「選択アイテム以外を隠す」(i)=>!(i.selected)
 	被選択アイテム無しで選択アイテムを隠す動作を指定した場合は、NOP
 	全アイテム表示は //(function (i){return i.hidden},true)を与える
    undo 対応
 */
pman.reName.filter = function filter(fn,neg){
	if(!(fn instanceof Function)){
//引数なし 全表示
		fn  = function(i){return (i.hidden);};
		neg = true;
	};
	neg = (neg)? true:false;
	var members = [];
//フィルタ検出されたアイテムが目的状態でない場合は操作メンバーに加える
	pman.reName.items.filter(fn).forEach(function(i){console.log(i);if(i.hidden == neg) members.push(i);});
//undo対応メソッドへ投げる
console.log(members);
	if(members.length > 0) pman.reName.hide(members,undefined,((neg)?'show':'hide'));

return;

	if(neg){
		pman.reName.items.filter(fn).forEach((i)=> i.show());
	}else{
		pman.reName.items.filter(fn).forEach((i)=> i.hide());
	};



	for(var n = 0 ; n < pman.reName.items.length; n++){
		let filt = fn(pman.reName.items[n]);//true|false
		if(filt){
			if(neg){
				if(pman.reName.items[n].hidden){
					pman.reName.items[n].show();
				};
			}else{
				if(!(pman.reName.items[n].hidden)){
					pman.reName.items[n].hide();
				};
			};
		};
	};

}
/*test
pman.reName.filter((i)=> i.type == '-bundle-')
*/
/**
	UI上の値を関数としてフィルタを実行する
*/
pman.reName.filterUX = function(){
	var FX = "pman.reName.filter(function(itm){" + 
		document.getElementById("filter_func").value +
		"},"+
		String((document.getElementById("filterNeg").checked)?true:false)+
		");";
console.log(FX);
	Function(FX)();
} 
/**
 *	アイテムを再表示する
 *	アイテムのパスに非表示アイテムが含まれていると表示
 *	できないのでヒエラルキをたどって表示を行う
 *  削除済みアイテム等、HTMLエレメントを特定できないケースがあるので注意
 */
pman.ReNameItem.prototype.show = function (){
	this.hidden = false;
//	if(this.ip.length > 2) for(var i = 1 ; i < (this.ip.length-1); i++){if(pman.reName.getItem(this.ip[i]).hidden) pman.reName.getItem(this.ip[i]).show();};
	let elm = this.getHTMLElement();
	if((elm)&&(elm.style.display != 'block')) elm.style.display = 'block';
//プレビュー画面にアイテムが表示されているケースではそちらも制御する
	let pElm = document.getElementById('listItem_'+pman.reName.items.indexOf(this));
	if((pElm)&&(pElm.style.display == 'none')) pElm.style.display = '';
}
/**
 *	アイテムを隠蔽する
 *	現在の状態を返す
 *	フォーカスがあれば抜く、セレクションは解除
 *  開いているフォルダアイテムを閉じることはないがその配下のアイテムを非表示にする
 */
pman.ReNameItem.prototype.hide = function (){
	this.hidden   = true;
	this.selected = false;
	if(pman.reName.items.indexOf(this) == pman.reName.focus) pman.reName.select();

	let elm = this.getHTMLElement();
	if((elm)&&(elm.style.display != 'none')) elm.style.display = 'none';
//プレビュー画面にアイテムが表示されているケースではそちらも制御する
	let pElm = document.getElementById('listItem_'+pman.reName.items.indexOf(this));
	if((pElm)&&(pElm.style.display != 'none')) pElm.style.display = 'none';
}
/**
 *	@params {Object} stat
 *	登録アイテムの表示更新メソッド
 *	 基本的にcheckItemStatusから呼ばれる
 *	引数は stat 現在のステータスと比較更新が行われる
 */
pman.ReNameItem.prototype.update = async function (stat){
	var updated = false;
	if(!(this.stat)){ this.stat = stat; updated = true;};//初回のみ無条件で設定
	if((this.stat.ctimeMs < stat.ctimeMs)){
		updated = true;
//console.log( this.text + ' : item status updated');
		this.stat = stat;
		this.lastModified = this.stat.ctimeMs;
		if((this.path)&&(this.name != nas.File.basename(this.path))){
			this.name = nas.File.basename(this.path);
			this.relativePath = nas.File.join(nas.File.basename(pman.reName.baseFolder),this.name);
//			this.relativePath = nas.File.relative(pman.reName.baseFolder,this.path);
		};
	};
	if(this.type == '-canvasasset-'){
			if((pman.reName.items[pman.reName.focus] === this)&&(!(document.getElementById('imgPreview'))))
				pman.reName.setPreview(this,true);
	}else if(this.type == '-group-'){
if(this.members){
		if(this.members.length){
			for (var i = 0 ; i < this.members.length ; i ++) this.members[i].checkItemStatus();
		};
} else {
console.log(this);//forDeBuG
};
	}else{
		if(updated){
console.log( this.text + ' : item-reparse');
//アイテムの最終更新よりも新しいアイテム内容の更新がある ファイル名変更を含む
// アイテム更新の仕組みを再考　グループが再初期化される際に障害あり2024 09 16 パースを一時停止
			if((appHost.platform == 'Electron')&&(this.path)){
				//this.parse(this.path,(this.members)?true:false,this.type);
			}else if(this.file){
				//this.parse(this.file,(this.members)?true:false,this.type);
			}else if(this.entry){
				//this.parse(this.entry,(this.members)?true:false,this.type)
			};
			if (! pman.reName.rewrite) pman.reName.rewrite = true;
//			pman.reName.pending = false;
//			pman.reName.refreshItemlist(true);
		};
		if(
			(this.name.match(pman.reName.imageRegex))&&
			((!this.img)||(this.imgLastModified != this.lastModified))&&
			((this.ip.length >= 2)&&(this.ip[0]==this.id))
		){
//console.log('item-setImage');//画像が未設定||アイテムが更新されている
//アイテムを遅延読出しキューに登録
			pman.reName.loadStatus('addQueue',this.name);
			pman.reName.loadQueue.add(this);//保留 20220215
		}else if(
			(this.img)&&
			(this.img instanceof HTMLImageElement)&&
			(this.img.width != 0)&&
			(this.type.match(/asset|other/))&&
			(this.thmLastModified != this.imgLastModified)
		){
//console.log('item-Thumbnail');//更新対象の有効なimgが存在&&サムネイルが必要なアイテムタイプ
//			this.setThumbnail(true);
//		}else{
//console.log('!!!!! NOP:skip loading :' + this.name);
		};
	};
}
/**
 *	@returns {String}
 *	
 *  ソートのために名前textを返す
 *  フォーマット指定を拡張
 name:拡張子付きファイル名
 list:
 workslip:伝票用テキストストリーム
 */
pman.ReNameItem.prototype.toString = function(form){
	switch(form){
	case "workslip":
		var result=[];
		if(this.type == '-group-'){
			result.push(this.text+'/');
			result = result.concat(Array.from(this.members,e => "\t" + e.toString('workslip')))
		}else{
			result.push(this.name);
		}
		return result.join('\n');;
	break;
	case "info":return this.getInfo();
	break;
	default:
		if(this[form]){
			return this[form];
		}else{
			return this.text;
		};
	}
}
/**
 *	@params  {String} form
 *		JSON|text|dump
 *	@returns {String}
 *	
 *	アイテムの状態を記録するための情報をダンプする
 */
pman.ReNameItem.prototype.exportContent = function(form){
	var result = {
		"item_path":this.getPath().join('_'),
		"type"     :this.type,
		"text"     :this.text,
		"name"     :this.name,
		"file"     :((this.file)?this.file:null),
		"image"    :((this.img )?this.img :null),
		"url"      :(((appHost.platform == 'Electron')&&(this.path))?this.path:""),
		"selected" :this.selected,
		"hidden"   :this.hidden,
		"closed"   :this.close
	};
	if(form == 'dump'){
	return JSON.stringify([
		result.item_path,
		result.type,
		result.text,
		result.name,
		result.url,
		result.selected,
		result.hidden,
		result.closed
	]);
	}else if(form == 'JSON'){
		return JSON.stringify(result,false,2)
	}else if(form == 'dump'){
	return [
		result.item_path,
		"\t" + result.type,
		"\t" + result.text,
		"\t" + result.name,
		"\t" + result.url,
		"\t" + result.selected,
		"\t" + result.hidden,
		"\t" + result.closed,
		""
	].join('\n');
	}else{
		return result;
	};
}
/**
 *	@params  {Object|String} dataBlock
 *	
 *	@returns {String}
 *	
 *	アイテムの状態をダンプ情報から再生する
 */
pman.ReNameItem.prototype.importContent = function(dataBlock){
	if(typeof dataBlock == 'undefined') return false;
	var contentObject = {};
	if(dataBlock instanceof Array){
		
	}else if(dataBlock instanceof Object){
		contentObject = dataBlock;
	}else if(typeof dataBlock == 'string'){
//配列JSON
		if (dataBlock.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)){
			dataBlock = JSON.stringify(dataBlock);
		}else if (dataBlock.match(/(\n|^)\[.+\]($|\n)/)){
//dump;
			var dataArray = JSON.stringify(dataBlock);
			contentObject = {
				"item_path":dataArray[0],
				"type"     :dataArray[1],
				"text"     :dataArray[2],
				"name"     :dataArray[3],
				"url"      :dataArray[4],
				"selected" :dataArray[5],
				"closed"   :dataArray[6]
			}
		}else{
//text;
			var dataStream = dataBlock.split('\n');
			for(var l = 0 ; l < dataStream.length ; l ++){
				if(dataStream[l].match(/^\s*$/)) continue;
				currentField=dataStream[l];
				if(currentField.match( /^\t([a-z]+)\:(.+)$/i )){
					contentObject[RegExp.$1]=RegExp.$2;
				} else if(currentField.match( /^.+$/i )) {
					contentObject['item_path'] = currentField;
				};
			};
		};
	}else{
		return false;
	};
	var setContent = false ;var setStatus = false;
	if(contentObject.item_path){
//ipの更新は更新のみでは完結しない
console.log(contentObject.item_path)
		this.ip = contentObject.item_path.split('_');
	};
//最初にパスを判定してアイテムを再パースする
	if(contentObject.url){
		var asGrp = ((contentObject.type)&&(contentObject.type.match( /^(-group-|-bundle-)$/ )))? true:false;
		if(contentObject.url != this.path){
			this.parse(contentObject.url,asGrp,contentObject.type);
			setContent = true;
		};
	};
	if(contentObject.type){
		if(contentObject.type != this.type){
			this.type = contentObject.type;
			setContent = true;
		};
	};
	if(contentObject.text){
		if(contentObject.text != this.text) this.text = contentObject.text;
	};
	if(contentObject.name){
		if(contentObject.name != this.name){
			this.name = contentObject.name;
			setContent = true;
		};
	};
	if(contentObject.file){
		if(contentObject.file !== this.file){
			this.file = contentObject.file;
			setContent = true;
		};
	};
	if(contentObject.image){
		if(contentObject.image !== this.img){
			this.img = contentObject.image;
			setContent = true;
		};
	};
	if(contentObject.selected){
		if(contentObject.selected != this.selected){
			this.selected = contentObject.selected;
			setStatus = true;
		};
	};
	if(contentObject.hidden){
		if(contentObject.hidden != this.hidden){
			this.hidden = contentObject.hidden;
			setStatus = true;
		};
	};
	if(contentObject.closed){
		if(contentObject.closed != this.close){
			this.close = contentObject.closed;
			setStatus = true;
		};
	};
	if(setContent) this.setHTMLElementContent();
	if(setStatus)  this.setHTMLStatus();
	return this;
};

/**
 *	リストアイテムのHTMLソースを戻す
 *	@params	{String} type
 *	左ペイン用とpreviewウィンドウ用のコンテンツでID|css等の変更あり
 *		アイテム配列のシリアルIDはアイテム自身から算出
 *	表示される画像はこの時点では一律にキャシュ内のタイプ別アイコンを表示する
 *	必要なサムネイルはバックグラウンドで遅延表示される
 */
pman.ReNameItem.prototype.toHTMLContent = function(type){
	type = (type != 'window')? 'tree':'window';
	var idx = pman.reName.items.indexOf(this);
	if(idx < 0) return "";
	var className = '';
	switch(this.type){
	case "-group-": className = "group";break;
	case "-bundle-":
console.log(this);
//		className = this.bundleInf.type;break;
		className = "uaf";break;
	default : className = 'item';
	};
	var itemID = ['rename_item',nas.parseNumber(idx)].join("_");
	var content = '';
//コンテナ
	if(className == 'group'){
//グループコンテナ内容
		content += '<img id="icon_ovl_'+itemID;
		content += '" class="elementContainerGroupIcon elementContainerGroupIcon-' + ((this.close)?'close':'open');
		content += '" src="./css/images/pman-ui/blank.png">'
		content += '<br><input id="ipt_'+itemID+'" type=text class="assetName assetGroupName" size=25 value="'+this.text
		content += '" onchange="pman.reName.applyInputText('+idx+')" onfocus="pman.reName.focuscheck(event)" >';
		content += '<input type="checkbox" id="ckb_'+itemID+'" disabled  class="assetCheck">';
		content += '<span class="assetPath" id="'+itemID+'">';
	}else if (className == 'uaf'){
//バンドルコンテナ内容
		content += '<img id="icon_ovl_'+itemID;
		content += '" class="elementContainerUAFIcon';
		content += '" src="./css/images/pman-ui/documenticons/uaf.png" width=32 height=32>'
		content += '<br><input id="ipt_'+itemID+'" type=text class="assetName assetGroupName" size=25 value="'+this.text
		content += '" onchange="pman.reName.applyInputText('+idx+')" onfocus="pman.reName.focuscheck(event)" >';
		content += '<input type="checkbox" id="ckb_'+itemID+'" disabled  class="assetCheck">';
		content += '<p class="uafStatusText">';
		content += this.getStatusString();
		content += '</p>';
		content += '<span class="assetPath" id="'+itemID+'">';
	}else{
//個別アイテムコンテナ内容
		var iconSrc = '';
//		if(className == 'uaf'){
//			iconSrc = "./css/images/pman-ui/documenticons/uaf.png";
//		}else{
			iconSrc = nas.HTML.getTypeIcon(
				nas.File.contentType(this.name),
				(this.type == '-xpst-')
			);
//		};
		content += '<div class=thumbnailBox >';
		content += '<img id="thumbnail_' + itemID +'" draggable=false src="';
		if(this.thumbnail){
//既存サムネイル画像あり
			content += this.thumbnail.src;
			content += '" class="elementThumbnail assetThumbnail';
		}else if(this.type == '-canvasasset-'){
//canvasAsset
			content += nas.HTML.getTypeIcon('default');
			content += '" class="elementThumbnail assetThumbnail';
		}else{
//上記以外
			content += iconSrc;
			content += '" class="elementThumbnail';
		};
		if((this.img)&&(this.type == '-asset-')){
			if(this.img.width  % 2 != 0) content += ' elementThumbnailWidthOdd';
			if(this.img.height % 2 != 0) content += ' elementThumbnailHeightOdd';
		};
		content += '"';
		content += ' alt="';
		content += this.name;
		content += '" title="';
		content += (this.path)? this.path:this.name;
		content += '">';

		
		content += '<p class="elementThumbnailText">';
		content += this.getStatusString();
		content += '</p>';

		content += '</div>';
		content += '<input id="ipt_'+itemID+'" type=text class=assetName size=32 value="'+this.text+'" onchange="pman.reName.applyInputText('+idx+')" onfocus="pman.reName.focuscheck(event)" ><br>'
		content += '<input type="checkbox" id="ckb_'+itemID+'" disabled class="assetCheck">';
		content += '<span class="assetPath" id="'+itemID+'">';
	};
	content += this.name;
	content += '</span>';
//	content += '<div class=groupEndSign></div>'
	return content;
};
/** （ツリー表示対応版）
 *	リストアイテムのHTMLソースを戻す
 *		アイテム配列のシリアルID
 *	表示される画像はこの時点では一律にキャシュ内のタイプ別アイコンを表示する
 *	必要なサムネイルはバックグラウンドで遅延表示される
 *	グループアイテムは配下のアイテムを再帰的に呼び出す
 */
pman.ReNameItem.prototype.toHTMLContent_ = function(){
	var idx = pman.reName.items.indexOf(this);
	if(idx < 0) return "";
	var className = '';
	switch(this.type){
	case "-group-": className = "group";break;
	case "-bundle-": className = this.bundleInf.type  ;break;
	default : className = 'item';
	};
	var itemID = ['rename_item',nas.parseNumber(idx)].join("_");
	var content = '';
	content += '<li id="cnt_'+itemID+'" draggable=true class="elementContainer">';
//コンテナ
	if(className == 'group'){
//グループコンテナ内容
		content += (this.close)? '<details>':'<details open>';
		content += '<summary id="summary_'+ itemID +'">';

		content += '<img id="icon_ovl_'+itemID;
		content += '" class="elementContainerGroupIcon elementContainerGroupIcon-' + ((this.close)?'close':'open');
		content += '" src="./css/images/pman-ui/blank.png">'
		content += '<br><input id="ipt_'+itemID+'" type=text class="assetName assetGroupName" size=25 value="'+this.text
		content += '" onchange="pman.reName.applyInputText('+idx+')" onfocus="pman.reName.focuscheck(event)" >';
		content += '<input type="checkbox" id="ckb_'+itemID+'" disabled  class="assetCheck">';
		content += '<span class="assetPath" id="'+itemID+'">';
		content += '</summary>';
//グループメンバーを展開
		content += '<ul>'
		for(var i = 0; i < this.members.length ; i ++) content += this.members[i].toHTMLContent_();
		content += '</ul>'
		content += '</details>'
	}else if (className == 'uaf'){
		content += '<img id="icon_ovl_'+itemID;
		content += '" class="elementContainerUAFIcon elementContainerUAFIcon-' + ((this.close)?'active':'');//未着手｜作業中｜作業アップ(チェック中)|R作業中｜aborted
		content += '" src="./css/images/pman-ui/documenticons/uaf.png">'
		content += '<br><input id="ipt_'+itemID+'" type=text class="assetName assetGroupName" size=25 value="'+this.text
		content += '" onchange="pman.reName.applyInputText('+idx+')" onfocus="pman.reName.focuscheck(event)" >';
		content += '<input type="checkbox" id="ckb_'+itemID+'" disabled  class="assetCheck">';

		content += '<p class="uafStatusText">';
		content += this.getStatusString();
		content += '</p>';

		content += '<span class="assetPath" id="'+itemID+'">';
//バンドルコンテナ内容
	}else{
//個別アイテムコンテナ内容
		var iconSrc = '';
		if(className == 'uaf'){
			iconSrc = "./css/images/pman-ui/documenticons/uaf.png";
		}else{
			iconSrc = nas.HTML.getTypeIcon(
				nas.File.contentType(this.name),
				(this.type == '-xpst-')
			);
		};
		content += '<div class=thumbnailBox >';
		content += '<img id="thumbnail_' + itemID +'" draggable=false src="';
		if(this.thumbnail){
//既存サムネイル画像あり
			content += this.thumbnail.src;
			content += '" class="elementThumbnail assetThumbnail';
		}else if(this.type == '-canvasasset-'){
//canvasAsset
			content += nas.HTML.getTypeIcon('default');
			content += '" class="elementThumbnail assetThumbnail';
		}else{
//上記以外
			content += iconSrc;
			content += '" class="elementThumbnail';
		};
		if((this.img)&&(this.type == '-asset-')){
			if(this.img.width  % 2 != 0) content += ' elementThumbnailWidthOdd';
			if(this.img.height % 2 != 0) content += ' elementThumbnailHeightOdd';
		};
		content += '"';
		content += ' alt="';
		content += this.name;
		content += '" title="';
		content += (this.path)? this.path:this.name;
		content += '">';

		
		content += '<p class="elementThumbnailText">';
		content += this.getStatusString();
		content += '</p>';

		content += '</div>';
		content += '<input id="ipt_'+itemID+'" type=text class=assetName size=32 value="'+this.text+'" onchange="pman.reName.applyInputText('+idx+')" onfocus="pman.reName.focuscheck(event)" ><br>'
		content += '<input type="checkbox" id="ckb_'+itemID+'" disabled class="assetCheck">';
		content += '<span class="assetPath" id="'+itemID+'">';
		content += this.name;
		content += '</span>';
	};
	content += '</li>';
	return content;
};
/*
	アイテム自身の現在の表示用HTMLエレメントを返す
	ツリーリストのアイテムのみを返す
	ツリーアイテムに表示されないアイテムは nullが戻る

*/
pman.ReNameItem.prototype.getHTMLElement  = function(){
	var idx = pman.reName.items.indexOf(this);
	if((idx < 0)||(this.ip.length < 2)) return null;
	return document.getElementById('cnt_rename_item_'+idx);
}
/*
	アイテム自身の表示用HTMLエレメント
	コンテナの内容を書き換える
	本体のHTMLアセットコンテナがレンダリング済に限り使用可能
*/
pman.ReNameItem.prototype.setHTMLElementContent = function(idx){
	if(typeof idx == 'undefined') idx = pman.reName.items.indexOf(this);
	if(idx < 0) return null;
	var container = document.getElementById('cnt_rename_item_'+idx);
	if(container){
		container.innerHTML = this.toHTMLContent();
		if(this.type == '-group-'){
			nas.HTML.addClass(container,'elementContainerGroup');
		}else{
			nas.HTML.removeClass(container,'elementContainerGroup');
		};
	};
}
/**
 *	@params {Number} idx
 *		表示エレメント番号
 *	アイテム自身の表示用HTMLエレメント
 *	ステータスの更新を行う
 *	グループの場合は配下のエレメントの更新をコールする
ゴミ箱機能実装時は、ゴミ箱表示のための出力が必要 220607
 */
pman.ReNameItem.prototype.setHTMLStatus = function(){
//	if(typeof idx == 'undefined') idx = pman.reName.items.indexOf(this);
	if(this.ip.length < 2) return ''; 
	var idx = pman.reName.items.indexOf(this);
	if(idx < 0) return null;
	var container = document.getElementById('cnt_rename_item_'+idx);
	if(! container){console.log('no element :' +'cnt_rename_item_'+idx);return false;}
	[
		'elementContainerGroup',
		'elementContainerGroup-empty',
		'elementContainerGroup-close',
		'elementContainerGroup-blank',
		'elementContainerGroup-open',
		'elementContainerGroup-overlay',
		'elementContainerGroup-underlay'
	].forEach(function(e){nas.HTML.removeClass(container,e);});
//	var dpMargin = this.getDepth() - 1;
//表示状態を設定・表示設定状態を主体にして・アイテムパスをルートからたどってひとつでも閉じていたら非表示に
//アイテムパスをたどって上位のアイテムが非表示ならば非表示
//open｜closeを新方式に移行後はここを書き換え
	var isDisp = (this.hidden)? false:true ;

/* このルーチンが閉じたグループ配下のアイテムを隠す*/
	for(var i = (this.ip.length - 2) ;i > 0 ;i --){
		let e = pman.reName.getItem(this.ip[i]);
		if(( e instanceof pman.ReNameItem)&&(e.type == '-group-')&&((e.close)||(e.hidden))){
			isDisp = false; break;
		};
	};
//
//表示|非表示
/*	if(isDisp){
		container.style.display = 'block';
	}else{
		container.style.display = 'none';
	}; // */

	if(this.parent.members[this.parent.members.length-1] === this){
//アイテムがグループの終端であった場合は、終端マークを表示
//
	};
	if((this.members instanceof Array)&&(this.type == '-group-')){
//グループアイテム
		var s = (this.close)? 0 : 2;//blank:empty
		if(this.members.length) s ++;// 1:3 close:open
		nas.HTML.addClass(container,	'elementContainerGroup');
		nas.HTML.addClass(container,	[
			'elementContainerGroup-empty',
			'elementContainerGroup-close',
			'elementContainerGroup-blank',
			'elementContainerGroup-open'
		][s]);
//基準位置がリスト親になるので計算不要
//		this.getHTMLElement().style.marginLeft = (this.ip.length - 2)* 16 + 'px';
//配下のエレメントを更新
		this.members.forEach(e => e.setHTMLStatus());
	}else{
//通常アイテム(depth無制限に変更)
//基準位置がリスト親になるので計算不要
//		var s = (this.ip.length - 2)//stage(depth) root(0)からのオフセット値
//		this.getHTMLElement().style.marginLeft = s * 16 + 'px';

//認識有効スイッチがONならオーバーレイ属性を検出して判定
		if(!(pman.reName.lightBox.disabled)){
			var cd = new nas.CellDescription(this.text);
			var mbix = this.parent.members.indexOf(this);
			if(
				(pman.reName.lightBox.overlay)&&
				(cd.postfix)&&
				(mbix > 0) &&
				(cd.compare(this.parent.members[mbix -1].text) > 4)
			){
				nas.HTML.addClass(container,'elementContainer-overlay');
			}else{
				nas.HTML.removeClass(container,'elementContainer-overlay');
			};
			if(this.isUdl()){
				nas.HTML.addClass(container,'elementContainer-underlay');
			}else{
				nas.HTML.removeClass(container,'elementContainer-underlay');
			};
		};
//アイコンサムネイル表示同期
		if(document.getElementById(["thumbnail_rename_item",idx].join('_')))
		document.getElementById(["thumbnail_rename_item",idx].join('_')).style.display = pman.reName.thumbnailStat;
	};
	let ckbx = document.getElementById(['ckb_rename_item',idx].join('_'));
	if(ckbx) ckbx.checked = (this.selected)? true:false;
//	document.getElementById(["ckb_rename_item",idx].join('_')).checked = (this.selected)? true:false;
//表示テキスト同期
	var textInput = document.getElementById('ipt_rename_item_'+idx);
	if( textInput.value != this.text) textInput.value  = this.text;
	if(nas.File.divideExtension(this.name)[1] != this.text){
			nas.HTML.addClass(textInput,'assetName-edited');
		}else{
			nas.HTML.removeClass(textInput,'assetName-edited');
		};// */
};

/**	アイテムを削除する
	@params {Boolean}	withMembers
		内包メンバを同時に削除(グループのみ有効)
	@returns {Object|false}
	削除したオブジェクト本体
	グループのリムーブは、指定がなければ内包オブジェクトのペアレントを切り替えて本体のみを削除する
	バンドルエントリーは、所属メタ情報ごと削除（ゴミ箱行き）
	別プロセスで削除済のアイテムのリムーブメソッドが呼ばれるケースがあるので判定

	アイテムのリムーブフラグをたてて、ゴミ箱配列へ移動itemsから削除
*/
pman.ReNameItem.prototype.remove = function(withMembers){
	if(pman.reName.items.indexOf(this) < 0){
//itemsに所属しないItemsでも読み出しQueueに存在する可能性があるのでそれは削除
		var qix = pman.reName.loadQueue.indexOf(this);
		if(qix >= 0) pman.reName.loadQueue.splice(qix,1);
		return null;
	};
console.log(['remove ',(this.text,(withMembers)?' with members':'')].join(''));
//現在バンドル判定で(type == '-bundle-')&&(uaf)のみを判定しているので要注意 240512
	if((this.type != '-group-')||((this.members instanceof Array)&&(this.members.length == 0))){
//削除可能
		this.move(-2);
	}else if(withMembers){
// メンバアイテムを再帰的にリムーブ
		this.members.forEach(e => e.remove(withMembers));
	}else{
//失敗を返す
		return false;
	};
	 return this;


	var px = this.parent.members.indexOf(this);
	if(px < 0) return false ;

//先行で内包オブジェクトメンバーを処理
	if((this.type == '-group-')&&(this.members.length)){
		var iList = Array.from(this.members)
		if(withMembers){
//remove
			for (var m = 0 ; m < iList.length ;m ++) iList[m].remove(true);
		}else{
//グループメンバーを親のメンバーに移動
//親を書き換えて親メンバ配列の自身の後方に挿入
			for (var m = 0 ; m < iList.length ;m ++){
				iList[m].parent = this.parent;
				this.parent.members.splice(px,0,iList[m]);
			};
		};
	};
	this.parent.members.splice(px,1);

//itemsから抜く
	var ix = pman.reName.items.indexOf(this);
	if(ix < 0) return false;
//自分自身を親メンバから削除
	this.parent = pman.reName.removedItems;
	if(ix >= 0){
		if( pman.reName.focus == ix){
			pman.reName.focus = -1;
			pman.reName.setPreview('blank');
		};
	this.getPath();
//削除リストへ追加（ここでないほうが良いかも？）
		pman.reName.removedItems.members.add(this);
//編集バッファから削除
//		pman.reName.items.splice(ix,1);//後ほどこれが不要となる
		pman.reName.itemAlignment();
		return this;
	};
	return null;
}
/*
	アイテムのルートからの深度を得る
	getPathの要素数を数えたほうがはやいので後ほど修正 07/19
 */
pman.ReNameItem.prototype.getDepth = function(){
	var depth = 1 ;
	if( this.parent.type == '-group-' ) depth += this.parent.getDepth();
	return depth ;
}
/**
 *	アイテムがオーバーレイ属性を持つかどうかを判定
 *	被オーバーレイ位置の近接アイテムを判定
 *	アイテムの並び順により動的に変化する
 *	オーバーレイスイッチが入っていない場合は必ずfalseを返す
 */
pman.ReNameItem.prototype.isOvl = function(){
	if(!(pman.reName.lightBox.overlay)) return false;
	if(this.getHTMLElement()){
		let descriptions = nas.parseAssetIdf(this.text);
		let ix = this.parent.members.indexOf(this);
		let ct = (pman.numOrderUp)? this.parent.members[ix+1]:this.parent.members[ix-1];
		if((descriptions[0].postfix)&&(ct)&&(ct.text)){
			let cx = nas.parseAssetIdf(ct.text);
			for (var n = 0;n < cx.length ;n ++){
				let ovlitm = descriptions.find(d =>(d.compare(cx[n]) >= 3));
				if(ovlitm) return true;
			};
		};
	};
	return false ;
}
/**
 *	アイテムが現在アンダーレイ属性を持つかどうかを判定
 *	アイテムの並び順により動的に変化する
 */
pman.ReNameItem.prototype.isUdl = function(){
	if(this.isOvl()) return false;
	let fi = pman.reName.items[pman.reName.focus];
	if ((fi)&&(fi.isOvl())) fi = fi.getOvlParent();
	if(! fi) return false;
	if(
		(this.type.match(/asset/))&&
		(this.img)&&(this.img.width)&&
		(!(pman.reName.lightBox.disabled))&&
		(pman.reName.lightBox.underlay > 0)&&
		(this.getHTMLElement())&&
		(fi !== this)&&
		(this.parent.members.indexOf(fi) >= 0)
	){
		let it = this.parent.members.indexOf(fi);
		var itm = this;
		if(pman.numOrderUp){
			var itms = itm.parent.members.slice(it+1);
		}else{
			var itms = itm.parent.members.slice(0,it).reverse();
		};
//console.log(itms)
		var udlCount = 0;
		for(var i = 0;i < itms.length ; i ++){
			if(itms[i].isOvl()) continue;
			if(itms[i] === itm) return true;
			udlCount ++;
			if(udlCount >= pman.reName.lightBox.underlay) break;
		};
	};
	return false ;
}
/**
 *	@params {Object pman.ReNameItem} itm
 *	@returns {Array of pman.ReNameItem}
 *	引数アイテムに対するアンダーレイアイテムの配列を返す
 *	必ずしも一定数のアイテムが返るわけではないので注意
 */
pman.reName.getUnderlay = function(itm){
	if(pman.reName.lightBox.underlay == 0) return [];
	if(
		(itm)&&
		((itm.img)&&(itm.img.width))&&
		(itm.getHTMLElement())
	){
		if((pman.reName.lightBox.overlay)&&(itm.isOvl())) return [];

		var ix = itm.parent.members.indexOf(itm);
		if(pman.numOrderUp){
			var itms = itm.parent.members.slice(ix+1);
		}else{
			var itms = itm.parent.members.slice(0,ix).reverse();
		};
		var itmCount  = 0;
		var result = [];
		for(var r = 0 ; r < itms.length ;r ++){
			if((itms[r].img)&&(itms[r].img.width)&&(itms[r].type.match(/asset/))){
				result.push(itms[r]);
				if(itms[r].isOvl()){
					continue;
				}else{
					itmCount++;
				};
			};
			if(itmCount >= pman.reName.lightBox.underlay) break;
		};
		return result;
	};
	return [];
};
/**
 *	returns {Boolean}
 *	アイテムが被オーバーレイ属性を持つ(オーバーレイアイテムを持つ)かどうかを判定
 *	アイテムの並び順により動的に変化する
 *	近接アイテムのisOvlメソッドで判定
 *	グループ内の親アイテムのみでなく、一番上以外の素材でtrueが返る
 *	オーバーレイスイッチの入っていない場合は属性を持たない
 */
pman.ReNameItem.prototype.hasOvl = function(){
	if(!(pman.reName.lightBox.overlay)) return false;
	let ix = this.parent.members.indexOf(this);
	let ct = (pman.numOrderUp)? this.parent.members[ix-1]:this.parent.members[ix+1];
	if(
		(ix >= 0)&&(this.img)&&
		(ct)&&(ct.img)&&
		(this.getHTMLElement())
	){
		return (ct.isOvl());
	};
	return false ;
}
/**
 *	returns {Object pman.ReNameItem | null}
 *	アイテムがオーバーレイ属性を持つ場合、親となるアイテムを返す
 *	オーバーレイスイッチの入っていない場合はnullを返す
 */
pman.ReNameItem.prototype.getOvlParent = function(){
	if(!(pman.reName.lightBox.overlay)) return null;
	let ix = this.parent.members.indexOf(this);
	if(!(this.isOvl())) return null;
	if(
		(ix >= 0)&&(this.img)&&
		(this.getHTMLElement())
	){
		let ct = (pman.numOrderUp)? this.parent.members[ix-1]:this.parent.members[ix+1];
		if(pman.numOrderUp){
			var targetRange = this.parent.members.slice(ix+1);
		}else{
			var targetRange = this.parent.members.slice(0,ix).reverse();
		}
		for(var i = 0 ; i < targetRange.length ; i++){
			if(targetRange[i].isOvl()) continue;
			if(targetRange[i].img) return targetRange[i];
		};
	};
	return null;
}
/**
 *	@params  {Object pman.ReNameItem} itm
 *	@returns {Array of pman.ReNameItem}
 *	引数アイテムの親コレクション内のオーバーレイ要素を配列で取得する
 *	フィルタ処理からアイテムのisOvlメソッドで近接分のみを取得する仕様に変更
 *	オーバーレイスイッチの入っていない場合は空配列を戻す
 */
pman.reName.getOverlay = function(itm){
	if(!(pman.reName.lightBox.overlay)) return [];
	var itp = itm.parent.members.indexOf(itm);
	if(pman.numOrderUp){
		var targetRange = itm.parent.members.slice(0,itp).reverse();
	}else{
		var targetRange = itm.parent.members.slice(itp+1);
	}
	var result = [];
	for(var i = 0 ; i < targetRange.length ; i++){
		if(targetRange[i].isOvl()){
			result.push(targetRange[i]);
		}else{
			break;
		};
	};
	return result;
//	var cd = new nas.CellDescription(itm.text);
//	if((itm)&&(itm.getHTMLElement())&&(cd.postfix == '')){
//		var result = itm.parent.members.filter(e => (cd.compare(e.text) == 3));
//		if(pman.numOrderUp) result.reverse();
//		return result;
//	};
//	return [] ;
}
/**	アイテム配置を移動する
	@params {Object|Number}	target
	移動目標オブジェクト 自分自身も指定により有効
	@params {String}	placement
	移動先配置 ターゲットの 前方|後方|内部|先頭|末尾
	ターゲットが-1で指定された場合は、pman.reName本体がtargetになり
	pman.reName.membersに対しての移動となる
	-1以下の場合はゴミ箱への移動（削除）となる
	@params {Boolean}	suspend
	移動後の画面更新を保留
	画面更新に関してはこのメソッドのオプションは取り払う
	呼び出す側で更新をコントロールするものとする

	@returns {Object|false} 移動成功時は自分自身 失敗時はfalse

ElementPlacement.PLACEBEFORE		基点アイテムの前方(default)
ElementPlacement.PLACEAFTER			基点アイテムの後方 グループに対しては全グループメンバーの後方
ElementPlacement.INSIDE				グループの中（先頭）
ElementPlacement.PLACEATBEGINNING	ターゲットの含まれるグループの先頭 グループに対してはその先頭
ElementPlacement.PLACEATEND			ターゲットの含まれるグループの末尾 グループに対してはその末尾
Photoshopと動作は違うけど知らん！


	ゴミ箱アイテムを追加実装
	ゴミ箱への移動は target == -2
	ルートへの移動は target == -1
	親はnull
2022 02 15 グループの深度を4段階に拡張
2024 05 12 バンドルエントリの削除を実装
*/
pman.ReNameItem.prototype.move = function(target,placement){
//console.log([target,placement])
//不登録アイテムは移動できない INSERTした後で移動を行うこと　バンドルエントリのメンバも同様
	if(pman.reName.items.indexOf(this) < 0) return false;
//ターゲットアイテムを特定（自分自身||undefinedも可）
	target = pman.reName.getItem(target);//削除済を含む全アイテム及びrootトレーラーとゴミ箱を含む バンドルエントリのプロパティは含まない
//console.log(target);
//指定がない placement=PLACEBEFOR
	if(!(placement)) placement = 'PLACEBEFORE';
//移動前の親オブジェクト
	var currentParent      = this.parent;
//移動先の親として一時的にターゲットの親を設定する
	var destinationParent  = this.parent;
	var moveOffset = (placement == 'PLACEAFTER')? 1:0;
//移動後の親を確定
	if((placement == 'PLACEAFTER')||(placement == 'PLACEBEFORE')){
		if (target instanceof pman.ReNameItem) destinationParent = target.parent;
	}else{
//case (placement == 'INSIDE'|'PLACEATEND'|'PLACEATBEGINNING')
		if (target instanceof pman.ReNameItem) destinationParent = (target.type == '-group-')? target:target.parent;
	};
	if(target === pman.reName){
//root指定
		destinationParent = pman.reName;
	}else if(target === pman.reName.removedItems){
//削除
		destinationParent = pman.reName.removedItems;
	};//*/
//事前処理
	if(destinationParent == pman.reName.removedItems){
//case 削除
//メンバーを持つグループは削除禁止　あらかじめメンバーを解除する必要がある
		if((this.type == '-group-')&&(this.members.length)) return false;
		placement = 'PLACEATEND';//必ず末尾に追加
		this.selected = false;//セレクトを抜く
	};
	if(currentParent == pman.reName.removedItems){
//case 復帰
		this.selected = true;//復帰時にセレクトを入れる
	};
//移動先の親が自分自身であった場合移動不能（指定事故による循環防止トラップ）
	if(this === destinationParent) return false;
//移動先のmembers配列上のIDを得る
	var destinationID = destinationParent.members.indexOf(target);
	if(destinationID < 0) destinationID = (placement == 'PLACEATEND')? destinationParent.members.length:0;
//移動先グループが現在と一致して移動先IDが自分自身とマッチしていた場合処理不要
if((this.parent === destinationParent)&&(this.parent.members.indexOf(this)==(destinationID+moveOffset))) return this;
//必要ならペアレントの置き換えを行う
	if(this.parent !== destinationParent){
//現在のペアレントグループから自身を削除
		var ix = currentParent.members.indexOf(this);
		if(ix >= 0) currentParent.members.splice(ix,1);
//親を設定
//		this.parent = (destinationParent == pman.reName.removedItems)? null : destinationParent;//?
		this.parent = destinationParent;
//自身を移動先メンバに加える
		destinationID = this.parent.members.indexOf(target);//配置IDを再計算
		if(destinationID < 0) destinationID = (placement == 'PLACEATEND')? this.parent.members.length :0;
		this.parent.members.splice(destinationID+moveOffset,0,this);
	}else{
		pman.arrayElementMove(this.parent.members,[this.parent.members.indexOf(this)],destinationID,moveOffset);
	};
	this.getPath();
//必要に従って事後処理
	if((this.type == '-group-')&&(this.members.length)){
//自身がグループであった場合は内包オブジェクトごと移動
//グループメンバーをsetParentPath(関数が再帰的に配下のアイテムを処理する)
		this.members.forEach(e => e.setParentPath(this.ip));
	}
	return this;
}
/*TEST
	pman.reName.items[0].move()
 */
/*
メソッド一覧
.apply		編集リストを適用する
			オプションで適用方法が変わる
			実際のファイル操作は node|estkで分岐
			適用スクリプトの出力も可能
.toString	UI-htmlの出力 左ペインの編集UIを書き出す form optionで

.put(command,targetItems,content)
コマンド文字列
	insert		編集リストにターゲットアイテムを挿入
				挿入点指定がない|負数の場合末尾に追加
				target はアイテムオブジェクト

		ReNamer.put("insert",[item1,iten2...],12);

	remove		編集リストのアイテムを削除する
				contentパラメータ無効

		ReNamer.put("remove",[0,3...]);

	restore		名前を編集前のファイル名に戻す
				targetItemsの指定がない場合はすべてのアイテムをリセット
				contentパラメータ無効

		ReNamer.put("restore",[0,"1-3"...]);
		ReNamer.put("restore");

	reverse		指定アイテムを逆順に並べ直す
				targetItemsの指定がない場合はすべてのアイテムをリセット
				contentパラメータ無効

		ReNamer.put("reverse",[0,"1-3"...]);
		ReNamer.put("reverse");

	moveto		指定アイテムをまとめて指定位置へ移動

		ReNamer.put("moveto",[0,"1-3"...],insertPoint);

	renumber	指定アイテムを含むグループの番号をつけ直す
				contentは指定オブジェクト{startNumber:,step}

		ReNamer.put("renumber",[0,"1-3"...]);

	shift		指定アイテムの番号を変更する
			重複番号が発生する場合は以下の処置を行う
			同グループ内の先行位置に重複する場合は、その番号に挿入・重複分を後方へ順送り
			同グループ内の後行位置に重複する場合は、その番号位置に挿入・

ターゲット配列|リスト（アイテムID|現在のファイル名）を指定してアイテムを編集
	挿入指定に対しては、指定番号の前に挿入 先頭IDは 0
				id : 0 ~ (length-1)|currentFileName
				range : st-ed
					ファイル名はIDに展開
					範囲指定もID配列に展開して処理
				content:	コマンド引数コンテンツ
					command_array		編集パラメータ配列[コマンド{,コマンド引数}] 
					文字列
					group_name		末尾に"-"のついた文字列 グループ名として評価
					full_content	
ターゲットアイテムは htmlの FileObjectに newNameプロパティをアタッチしたもの
*/
/*    アイテムリストの選択範囲を移動
pman.reName.move(members,moveTarget,placement)
    @params {Array}    members
        移動先アドレス[-1,destinationId]
		必ずIDの前方挿入
    @returns    {Boolean}
        移動成功時 true 失敗時は false

xUI.move(dest,dup);
    @params {Array}    dest
        移動量ベクトル[deltaColumn,deltaLine]
    @params {Boolean}   dup
        複製フラグ trueで移動先に複製を配置
        pman.reNameはpman準拠なので複製フラグは無効

        コピーペーストの、成功時は移動扱いに転換

    @returns    {Boolean}
        移動成功時 true 失敗時は false

reNameのcut(xUI.cut)は、アイテムを削除する
	削除の操作は copy+del
	ヤンクバッファにRenameItemを複製した後アイテムリストからリムーブする
	ヤンクバッファの内容がかわる際にはシステムクリップボードへデータを転送する
	画像｜データパス　ファイルオブジェクト…はむりか

カットとペーストに相当する入力を
自動で行う


移動先が編集範囲外のデータは消去
移動が発生しなかった場合は移動失敗
移動指定時に、フォーカスが範囲外に出るケースは、失敗とする
このルーチン内で計算値を得てxUI.putメソッドに送る（undoバッファの更新はxUI.putが行う）

移動メソッドのケースは、UNDOデータの構造が以下のように拡張される
[書換基点,(ダミーの選択範囲),書換データ,[復帰用のフォーカス,選択範囲]]
UNDOデータが第４要素を保つ場合のみ、そのデータをもとにカーソル位置の復帰が行われる
*/

/*	ダウンロード出力
 *	アイテムファイルを編集後の名前ですべてダウンロードする
 *	ダウンロード先を指定する場合はユーザ側のブラウザ上で設定が必要
 *	WEB/Node環境を問わず動作する
 * ダウンロード先は１ファイルごとまたはブラウザ設定によるダウンロードフォルダ
 *	フォルダ分類に関する拡張 未処理 22.01.25
画像に関しては編集中の画像アイテムに現在のtextを名前としてダウンロード保存する（オリジナルのファイルではない）
 */
pman.reName.downloadItems = async function(){
	for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if(pman.reName.items[i].ip.length == 1) continue;//削除済アイテムをスキップ
		if(pman.reName.items[i].type == '-group-') continue;//グループをスキップ
		var fileExtension = nas.File.extname(pman.reName.items[i].name);//拡張子が"."つきで戻る
/*console.log ('download item :'+ pman.reName.items[i].name + ' : as : '+pman.reName.items[i].text + fileExtension );
		if(pman.reName.items[i].path){
			nas.HTML.handleDownload(
				pman.reName.items[i].path,
				pman.reName.items[i].text + fileExtension
			);
		}else :// */

		var url = '';//空文字列で初期化
		if(items[i].canvas){
//画像編集中ならばキャッシュ画像からアイテムの画像ファイルを作成する(WEB|Electron共通)
			url = window.URL.createObjectURL(pman.reName.items[i].img)
			fileExtension = '.png'
		}else if(pman.reName.items[i].file){
//Object has file(WEB version)
			url = window.URL.createObjectURL(pman.reName.items[i].file)
		}else if(pman.reName.items[i].path){
//Item has no file but path(Electron version)
			url = window.URL.createObjectURL(pman.reName.items[i].path);
		};
//得られたurlを逐次ダウンロードしているが、アイテムが複数の場合はzipに変更予定
console.log(url+':'+pman.reName.items[i].text + fileExtension);
		nas.HTML.handleDownload(url,pman.reName.items[i].text + fileExtension);
	};
}
/*	ダウンロード
 *	@params {string}	doenloadURL
 *	@params {String}	doenloadName
 *	アイテムを編集後の名前ですべてダウンロードする
 *	ダウンロード先の指定はユーザ側のブラウザ上の設定が必要
 *	WEB/Node環境を問わず動作する
 */
nas.HTML.handleDownload = function(doenloadURL,downloadName){
    var a = document.createElement('a');
    a.download = downloadName;
    a.href     = doenloadURL;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/*	スクリプト出力
 *	アイテムをリネームするためのスクリプトを生成する
 *	ダウンロード先の指定はユーザ側のブラウザ上の設定が必要
 *	WEB/Node環境を問わず動作する
 *	@params	{String}	os
 *		"Win" | "Mac" | "Unix"
 *	MSコマンドラインまたはシェルスクリプトを出力
 */
pman.reName.getRenameScript = function(os){
	var result = "";
	
	if(! os) os = appHost.os;
	result += (os == 'Win')? 'REM \n':'#!/bin/sh\n';
	result += (os == 'Win')? 'REM test version 2021.05.04\n':'# test vaersion 2021.05.04\n';
	result += (os == 'Win')? 'REM pman.renamer script\n':'# pman.renamer script\n';
	for (var ix = 0 ; ix < pman.reName.items.length ; ix ++){
		if(pman.reName.items[ix].ip.length == 1) continue;//削除済アイテムをスキップ
		if(pman.reName.items[ix].type == '-group-') continue;//グループスキップ
		var targetDir     = "";
		if(pman.reName.items[ix].path){
			nas.File.dirname(pman.reName.items[ix].path);
		}else if(pman.reName.items[ix].relativePath){
			nas.File.dirname(pman.reName.items[ix].relativePath);
		}
//処理ディレクトリの一覧を取得
		var targetName    = pman.reName.items[ix].name;
		var fileExtension = targetName.slice(targetName.replace(/\.[^\.]+$/,'').length);
		var destName      = pman.reName.items[ix].text+fileExtension;
		if(targetName == destName) continue; //skip
		var targetPath    = (targetDir)? nas.File.join(targetDir,targetName):targetName;
		var destPath      = (targetDir)? nas.File.join(targetDir,destName)  :destName;
		if(os == 'Win'){
//		result += 'rename "' + new nas.File(targetPath).name +'" "'+ new nas.File(destPath).name + '" \n';
			result += 'rename "' + targetPath +'" "'+ destPath + '" \n';
		}else{
			result += 'mv "'     + targetPath +'" "'+ destPath + '" \n';
		};
	};
//クリップボード転送機能は nas.HTMLへ移動済 220622
	return result;
}
pman.reName.exportScript = function(){
//miniTextEditorへ構成変更
	nas.HTML.miniTextEdit.init(
		pman.reName.getRenameScript(),
		'リネーム用のコマンドです. ターミナルから実行します\nコピーまたは保存してご利用ください',
		'リネームコマンド',
		nas.File.join(pman.reName.baseFolder,"__rename"+{Win:".cmd",Mac:".command",Other:".sh"}[appHost.os]),
		nas.HTML.sendText2Clipboard
	);
}
/**
	@params {String}	idf
	@returns {Number} 
	HTML-IDから _で区切られた末尾の整数を得る
	値のない引数に対しては存在しないIDとして NaN が戻る
*/
pman.reName.parseId = function(idf){
	return parseInt(String(idf).split('_').slice(-1)[0]);
}
/*
	グループを除いたアイテム総数をカウントする もう使用しないかも
*/
pman.reName.countItems = function(){
	var count = 0;//pman.reName.items.length;
	for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if ((pman.reName.items[i].type == '-group-')||(pman.reName.items[i].type == '-removed-')) continue;
		count ++;
	};
	return count;
}

/**アイテム配列をソートする
	グループを配置してグループ配下のアイテムはそのしたへ集める
	グループソートは名前 正・逆順
	グループ内アイテムソートは、番号順 正・逆順
	ソート発生時はシステム再描画フラグを立てる
*/
pman.reNameItemTextSort = function(a,b){
//アセット要素パスをパースする "[repository//title＃episode//sci//Stage//]Group-Number-Postfix"で構成される
//先頭から順に比較され、0以外の値を得たところでブレークしてリザルトを返す
	a = nas.RZf(a.text,7);b = nas.RZf(b.text,7);
	if( a < b ){ return -1;}
	if( a > b ){ return 1;}
	return 0;
}
/**
 *	ソート用アイテム比較関数
 *  タイプが異なる場合は、membersプロパティを持っている方が上位(-1)
 * 特定範囲のグループをソート上位へ
 */
pman.sortRegex = new RegExp("^"+pman.reName.prefix.LO.slice(1).join('|'),'i');
pman.typeOrder = {'-group-':0,'-bundle-':0,'-pmdb-':1,'-stbd-':2,'-xmap-':3,'-xpst-':4,'-canvasxpst-':4,'-asset-':5,'-canvasasset-':5,'-wrokdocument-':6,'-other-':7};
pman.itemCompare = function (tgt,dst){
	if(pman.typeOrder[tgt.type] != pman.typeOrder[dst.type]){
//アイテムタイプが異なる場合はグループ>タイムシート>アセット>その他 の順位で解決する
		return (pman.typeOrder[tgt.type] - pman.typeOrder[dst.type]);
	}else if(pman.typeOrder[tgt.type] == 5){
//アセットはセル記述子として比較する
		var a = new nas.CellDescription(tgt.text);
		var b = new nas.CellDescription(dst.text);
//役割のあるプレフィックスの優先順位を上げておく
			if(a.content.match(pman.sortRegex)) a.content = '_' + a.content ;
			if(b.content.match(pman.sortRegex)) b.content = '_' + b.content ;
		var c = a.compare(b);
/*
	CelDescription.compare の戻値
    一致状況で返す  バイナリ
    00000
    11111
    0:no match
      1. +1: 1  prefix match  プレフィックス一致（プレフィックス空白は一致）1
      2. +2: 3  prefix + body match  基礎記述内容が一致（空白でない）
      3. +4: 7  prefix + body + postfix match  ポストフィックス一致（ポストフィックス空白は一致）
      4. +8: 15 and modifier match
      基本的にモデファイヤが異なっても同じ記述となるので、4.はあまり意味が無いが一応

以下の条件に当てはまる場合はマッチが発生しない。（先に判定して抜ける）
    記述が  空文字列、空白、ブランク記号、中間値補間記号  または  省略記号
    等価条件  .type != "normal"
*/
		if(c >= 7){
//full match (システム上あってはならないが順位は同列)
			return 0;
		}else if(c >= 3){
//group & number match (同セルのオーバーレイ ポストフィックスで比較)
//ポストフィックスの比較は数字展開をかけて文字長で比較する方式に変更
			if(pman.numOrderUp){
				return nas.CellDescription.parsePostfix(b.postfix).length - nas.CellDescription.parsePostfix(a.postfix).length;
//				nas.normalizeStr(b.postfix,7).toUpperCase().localeCompare(nas.normalizeStr(a.postfix,7).toUpperCase(),nas.locale)
			}else{
				return nas.CellDescription.parsePostfix(a.postfix).length - nas.CellDescription.parsePostfix(b.postfix).length;
//				nas.normalizeStr(a.postfix,7).toUpperCase().localeCompare(nas.normalizeStr(b.postfix,7).toUpperCase(),nas.locale)
			};
		}else if(c >= 1){
//group match (セル番号で比較)
			if(pman.numOrderUp){
				return nas.normalizeStr(b.body,7).toUpperCase().localeCompare(nas.normalizeStr(a.body,7).toUpperCase(),nas.locale)
//				return nas.parseNumber(b.body) - nas.parseNumber(a.body);
			}else{
				return nas.normalizeStr(a.body,7).toUpperCase().localeCompare(nas.normalizeStr(b.body,7).toUpperCase(),nas.locale)
//				return nas.parseNumber(a.body) - nas.parseNumber(b.body);
			};
		}else if((a.prefix)||(b.prefix)){
//no match has prefix(group名で比較)
			if(pman.numOrderUp){
				return nas.normalizeStr(b.prefix,7).toUpperCase().localeCompare(nas.normalizeStr(a.prefix,7).toUpperCase(),nas.locale)
			}else{
				return nas.normalizeStr(a.prefix,7).toUpperCase().localeCompare(nas.normalizeStr(b.prefix,7).toUpperCase(),nas.locale)
			};
		}else{
//例外処理
			if(pman.numOrderUp){
				return b.content.localeCompare(a.content,nas.locale);
			}else{
				return a.content.localeCompare(b.content,nas.locale);
			};
		};
	}else{
// それ以外は名前で比較
			return tgt.text.localeCompare(dst.text,nas.locale);
	};
}
/**
 *   @returns {Number Int|null}
 *  現時点のアイテムパスに基づく配列index値を返す
 *  自身の親アイテムメンバー内のindexに上位のアイテムのメンバーカウントを加算したもの
 *  実際のindexと異なる場合があるので注意
 *  アイテム本体が pman.reName.itemsに含まれていない場合は null を返す
 *  配列の整合性チェックは行われていない
 */
/*
pman.ReNameItem.prototype.getIndex = function(){
	if(pman.reName.items.indexOf(this) < 0) return null;
	var ix = this.parent.members.indexOf(this);//初期値
	var result = 0;
	for(var i = 0 ; i < ix; i ++){
		result ++;
		if (this.parent.members[i].type == '-group-')
		result += this.parent.members[i].countMemberItems();
	};
	return result;
};//*/

/*
	アイテムをip順に配置を更新
	最終的に aitemAlignmentと同じ機能になるのでこちらは消滅で良い
*/
/*
pman.reName.sortWithIP = async function(callback){
	var focusedItem = pman.reName.getItem(pman.reName.focus);
	pman.reName.rewrite = Array.from(pman.reName.items);
	pman.reName.rewrite.sort((a,b)=> a.getIndex()-b.getIndex());
	pman.reName.focus = pman.reName.rewrite.indexOf(focusedItem);

	if(callback instanceof Function) callback();
}:// */
/**
 *  現時点の一時ipを基準にメンバーを再構成する
 *  undo|redo からコールされる
 * 動作はルート判定されたものは reName.menbersへ繰り入れ
 * それ以外は、移動が発生するなら現在のペアレントから削除して、ipの示すペアレントを登録 新規ペアレントのmembersへ繰り入れ
 */
pman.reName.reorderWithIP = async function(callback){
	pman.reName.members = [];
console.log('REORDER!!!!');
	for (var id = 0 ; id < pman.reName.items.length ; id ++){
		let e = pman.reName.items[id];
		if((e.ip.length == 2)&&(e.id == e.ip[0])){
			pman.reName.members.push(e);
		}else if(e.ip.length > 2){
			let ipParent = pman.reName.getItem(e.ip[1]);
console.log([e,ipParent]);
			if(e.parent !== ipParent){
				if (e.parent.members.indexOf(e) >= 0) e.parent.members.splice(e.parent.members.indexOf(e),1);
				e.parent = ipParent;
				e.parent.members.add(e);
			};
		}else{
console.log(this);//error
		};
	};
console.log('REORDER!!!!');
	pman.reName.itemAlignment(callback);
};
/*
 * アイテムのメンバー順を保持してグループ下に配置
 * 現在のitemsの並びは破棄されてmembersの並びで再整列される
 * 削除済アイテムは後方へまとめて再配置される
 * バンドルエントリへ対応
 */
pman.reName.itemAlignment = async function(callback){
	var focusedItem = pman.reName.getItem(pman.reName.focus);
	pman.reName.rewrite = [];//sortバッファクリア
	for (var m = 0;m < pman.reName.members.length; m ++){
		pman.reName.rewrite.push(pman.reName.members[m]);
		if(
			(pman.reName.members[m].type == '-group-')&&
//			(pman.reName.members[m].members)&&
			(pman.reName.members[m].members.length)
		)
			pman.reName.rewrite = pman.reName.rewrite.concat(pman.reName.members[m].expandMembers());
//再帰展開して加える
	};
//ゴミ箱の内容を追加（フラット配列）
	pman.reName.rewrite = pman.reName.rewrite.concat(pman.reName.removedItems.members);
//フォーカス復帰
	pman.reName.focus = pman.reName.rewrite.indexOf(focusedItem);
console.log(pman.reName.rewrite);
	if(callback instanceof Function) callback();

	return ;
}
//TEST pman.reName.itemAlignment(function(){pman.reName.refreshItemlist(true);});
/**
 *	@params	{Boolean}	rev
 *		逆順ソートフラグ
 *	逆順フラグが立っている場合は、ソート後に反転して逆順にする
 *	@params	{Array of String}	order
 *	並べ替え優先キーワード item-type,asset-type, (廃止 2022 03 16)
 *		ソート後の画面更新フラグは廃止　ソート実行後はUNDOを積んで必ず画面更新が実行される
 */
pman.reName.itemSort = function(rev){
//リバースフラグ
	if(! rev) rev = false;
//並べ替えキーワード(処理保留) 
//	if(typeof order == 'undefined') order = ['type'];
//現状の保存
	var focusedItem = pman.reName.items[pman.reName.focus];
	var bacupOrder = Array.from(pman.reName.items,function(e){return e.exportContent();});
//ルートトレーラーのmembersを再取得してソート
	pman.reName.members = pman.reName.items.filter(function(e){return (e.parent === pman.reName);});
	pman.reName.members.sort(pman.itemCompare);
		if(rev) pman.reName.members.reverse();
//グループメンバーをソート
	pman.reName.items.forEach(function(e){
		if((e.type == '-group-')&&(e.members)&&(e.members.length)){
			 e.members.sort(pman.itemCompare);
			if(rev) e.members.reverse();
		};
	});
	pman.reName.rewrite = [];//バッファクリア
	for (var m = 0;m < pman.reName.members.length; m ++){
		pman.reName.rewrite.push(pman.reName.members[m]);
		if(
			(pman.reName.members[m].type == '-group-')&&
			(pman.reName.members[m].members)&&
			(pman.reName.members[m].members.length)
		)
			pman.reName.rewrite = pman.reName.rewrite.concat(pman.reName.members[m].expandMembers());
	};
	pman.reName.rewrite = pman.reName.rewrite.concat(pman.reName.removedItems.members);//ゴミ箱の内容を追加（フラット配列）
	pman.reName.focus = pman.reName.rewrite.indexOf(focusedItem);
	pman.reName.refreshItemlist(true,
		function(){
//undo処理
			xUI.put([new xUI.InputUnit(
				[pman.reName.focus,pman.reName.getSelected(true)],
				Array.from(pman.reName.items,function(e){return e.exportContent();}),
				{
					target   :xUI.activeDocument.content,
					command  :"order",
					backup   :bacupOrder,
					selection:pman.reName.getSelected(true)
				}
			)],false,true);
		});
	return;
}
/**
 *	@params {String}	name
 *	@params {String}	kind
 *	@returns {Object pman.ReNameItem}
 *	アイテムリストから名前(部分一致)でアイテムを取得する
 *	最初にヒットしたアイテムを返す
 *	kind	uaf|group|item|none
*/
pman.reName.itemGetByName = function(name,kind){
	switch(kind){
	case 'uaf' :	return pman.reName.items.find(function(elm){return ((elm.name.indexOf(name) >= 0)&&(elm.type == '-bundle-'));});
	case 'group' :	return pman.reName.items.find(function(elm){return ((elm.name.indexOf(name) >= 0)&&(elm.type == '-group-'));});
	case 'item'  :	return pman.reName.items.find(function(elm){return ((elm.name.indexOf(name) >= 0)&&(! elm.members));});
	default      :	return pman.reName.items.find(function(elm){return (elm.name.indexOf(name) >= 0);});
	}
}
pman.ReNameItem.prototype.getByName = function(name,kind){
	if((this.members)&&(this.members.length)){
		switch(kind){
		case 'uaf' :	return this.members.find(function(elm){return ((elm.name.indexOf(name) >= 0)&&(elm.type == '-bundle-'));});
		case 'group' :	return this.members.find(function(elm){return ((elm.name.indexOf(name) >= 0)&&(elm.type == '-group-'));});
		case 'item'  :	return this.members.find(function(elm){return ((elm.name.indexOf(name) >= 0)&&(! elm.members));});
		default      :	return this.members.find(function(elm){return (elm.name.indexOf(name) >= 0);});
		};
	};
	return ;
}

/**
 * アイテムリストからテキストでアイテムを取得する（最初にヒットしたアイテム）
 *	アイテムリストからテキスト(部分一致)でアイテムを取得する
 *	最初にヒットしたアイテムを返す
*/
pman.reName.itemGetByText = function(text,kind){
	switch(kind){
	case 'uaf' :	return pman.reName.items.find(function(elm){return ((elm.text.indexOf(text) >= 0)&&(elm.type == '-bundle-'));});
	case 'group' :	return pman.reName.items.find(function(elm){return ((elm.text.indexOf(text) >= 0)&&(elm.type == '-group-'));});
	case 'item'  :	return pman.reName.items.find(function(elm){return ((elm.text.indexOf(text) >= 0)&&(! elm.members));});
	default      :	return pman.reName.items.find(function(elm){return (elm.text.indexOf(text) >= 0);});
	}
}
pman.ReNameItem.prototype.getByText = function(text,kind){
	if((this.members)&&(this.members.length)){
		switch(kind){
		case 'uaf' :	return this.members.find(function(elm){return ((elm.text.indexOf(text) >= 0)&&(elm.type == '-bundle-'));});
		case 'group' :	return this.members.find(function(elm){return ((elm.text.indexOf(text) >= 0)&&(elm.type == '-group-'));});
		case 'item'  :	return this.members.find(function(elm){return ((elm.text.indexOf(text) >= 0)&&(! elm.members));});
		default      :	return this.members.find(function(elm){return (elm.text.indexOf(text) >= 0);});
		};
	};
	return;
}
/**アイテムリストから相対パスでアイテムを取得する（UNIQUE）
*/
pman.reName.itemGetByRelativePath = function(pth,kind){
	switch(kind){
	case 'uaf' :	return pman.reName.items.find(function(elm){return ((elm.relativePath == pth)&&(elm.type == '-bundle-'));});
	case 'group' :	return pman.reName.items.find(function(elm){return ((elm.relativePath == pth)&&(elm.type == '-group-'));});
	case 'item'  :	return pman.reName.items.find(function(elm){return ((elm.relativePath == pth)&&(! (elm.type.match(/-group-|-bundle-/))));});
	default      :	return pman.reName.items.find(function(elm){return (elm.relativePath == pth);});
	}
}
/**
 *	@params {Object pman.ReNameItem} itm
 *
 *	バンドルフォルダにメンバーを設定する
 *	ステータス及びxmapエントリーは、パースして属性を取得する
 *	アセットは特定条件でメンバーに取り込む
 *	通常はポスター画として１枚だけを取り込んでキャッシュ
 *	マージンが許す状況ならば最新ステージの最新稿をすべてキャッシュ

UAFバンドルポスター画像
優先順位
02_LO
	_LO,LO複数あれば最初のヒット
	上記がなければ02_LOのタイムシート以外の最初のヒット
LOなければ工程を遡り、上記の探索を繰り返す

 */
pman.ReNameItem.prototype.setBundleMember = async function(itm){
	if(this.type != '-bundle-') return;
//	if(itm.type != '-asset-') return;
	if(itm.relativePath.indexOf(this.relativePath) != 0) return;
//仮条件・ここは実際は設定状況にしたがって必要なアイテムだけをバンドルメンバーに加える
//console.log(itm)
// 最新ステージを自動選択? LOまでに制限したほうが良いかも 加えてUAFルートのグループ外アイテム
	var targetStage = this.bundleInf.bundleData.stage;//CT|3DLO|LO|GEN...
console.log(targetStage);
console.log(itm);

	var stgKwd = ["00_CT","00_CT","01_3DLO","02_LO","LO","02_LO","02_LO"][['startup','CT','3DLO','LO','GEN','DOU','PT'].indexOf(targetStage)];
	if(! stgKwd) stgKwd = '00_CT';
	var targetRegex = new RegExp(stgKwd+"$","i");
	var relativeParent = itm.relativePath.split('/').slice(0,-1).join('/');
console.log(relativeParent);
	if(
		(relativeParent.match(/_LO$/i))||
		(relativeParent.match(targetRegex))||
		(this.relativePath == relativeParent)
//		(itm.relativePath.split('/').slice(0,-1).join('/') == this.relativePath+'/02_LO')
	){
console.log(itm);
		pman.reName.appendItems(itm,this,'PLACEATEND');//バンドル末尾に挿入
//		itm.parent = this;
//		this.members.add(itm);
console.log(this.members.indexOf(itm));
console.log(pman.reName.items.indexOf(itm));
//画像キャッシュキューに追加
		if((itm.type == '-asset-')||((itm.type == '-xpst-')&&(!(itm.name.match( /\.(xps|xpst|tsh|ard|ardj|txt|text|csv|json|xdts|tdts)$/i ))))){
			pman.reName.loadQueue.add(itm);
			pman.reName.imageLoadingStatus.count ++;//新規に初期化されたアイテム
			pman.reName.loadStatus('add count',itm.name);
		};
		if(itm.type == '-status-'){
			itm.hidden = true;
		};
//ポスターイメージの登録がなく、レイアウトデータと判定される場合アイテムをポスターリストへ設定
		if((this.bundleInf.posterImages.length == 0)&&(itm.type == '-asset-')&&(relativeParent.match(/_LO$/i))&&(itm.name.match(/LO|レイアウト|layout/i))){
console.log(itm.name);
			this.bundleInf.bundleData.posterImages.push(itm);//単純なpushでなく登録メソッドが必要
		};
		
	};
}
/**
 *	uafバンドルの内容サマリを返す
	アイテム名(相対パス フルパスはない場合がある あればフルパス)
	カット番号(idf または text)
	兼用情報 兼用番号(time)
	ポスター画像(複数可　LOがある限り)
タイムシート含むか？
	進捗　ラインごとの先端ステージ+ジョブ
	master/KGS_01_123_234
	KGS#01__s-c123_234
	s-c123(3+12),s-c234(3+18)
	master/KGS_01_123_234/02_LO/LO-1.png,master/KGS_01_123_234/02_LO/LO-2.png
	0:(trunk)//2:LO//3:[LO+3]//(aborted)|standby|
 */
pman.ReNameItem.prototype.getBundleSummary = function(form){
	if(this.type != '-bundle-') return '';
	switch(form){
	case 'JSON': 
		var result = JSON.stringify(this.bundleInf.bundleData);
	break;
	case 'html':
		var result = '<pre id=itemSummary>' +this.bundleInf.toString() + '<hr></pre>';
	break;
	case 'text':
	default:
		var result = this.bundleInf.toString();
	}
	return result;
}
/**	アイテム分類グループ|バンドルをアイテムリストに加える
 	同名(同相対パス)のグループを初期化することはできない
	グループの挿入位置はフォーカスアイテムの直上で
	グループメンバーの指定があればペアレントを継承する

	@params	{String}	groupname
		作成する groupName|relativePath|fullPath
			引数指定がない場合のグループ名は、
		フォーカスアイテムのプレフィックス部
		フォーカスアイテムがない場合は A,B,C...の順にアルファベット一文字
			いずれもコンフリクトはなるべく避ける
	@params	{Array of pman.ReNameItem} members
		メンバー指定があればアイテムをメンバーに加える
		グループ名はpath|entry|Fileでも良い?
		true が与えられた場合は、選択中のアイテムをメンバーにする
	@params	{String} type
		タイプ文字列 -group-|-bundle-

	@params	{Boolean} suspend
		アイテムの一括操作のために画面更新をサスペンドする

	@returns	{Object pman.ReNameItem | null}
		pman.ReNameItem
 */
pman.reName.addGroup = function(groupname,members,type){
	if((groupname == 'undefined')||(groupname == '')) return false;
//	groupname = pman.reName.guessGroupPrefix(groupname);//推測は一時停止 20211218
console.log('add group : '+ groupname);
	var parentFolder = (pman.reName.focus >= 0)? pman.reName.items[pman.reName.focus].parent:pman.reName;
	var namepath = new nas.File(groupname);
console.log(namepath)
	var grouppath = "test?";//group_relativepath
console.log(grouppath);
	if((namepath.body[0] == '')||(namepath.body[0].match(/^[a-z]:$/i))){
//絶対パスの場合は pman.reName.baseFolder との比較を行う
//現在の pman.reName.baseFolder が、指定のパスと一致しない場合は、単独名と同様にpman.reName.baseFolder 直下にフォルダを作成する
		if(namepath.fullName.indexOf(pman.reName.baseFolder) == 0){
			grouppath = nas.File.relative(pman.reName.baseFolder,namepath.fsName);
			parentFolder = pman.reName.itemGetByRelativePath(
				nas.File.relative(pman.reName.baseFolder,nas.File.dirname(namepath.fsName))
			);
		}else{
			grouppath = namepath.name;
		};
console.log(grouppath);
	}else if(namepath.body.length == 1){
//フォルダー名のみで追加指定をする場合は、現在の選択アイテムに依存
//選択アイテムの親フォルダーが追加の対象
//選択アイテムが存在しない場合は pman.reName.baseFolder を指定したものとみなす
		grouppath = (parentFolder.relativePath)?
			nas.File.join(parentFolder.relativePath,namepath.name):
			namepath.name;
console.log(grouppath);
	}else{
//相対パスの場合は pman.reName.baseFolder からの相対パスとする
console.log(pman.reName.baseFolder)
console.log(namepath.fullName);

//		grouppath = nas.File.relative(pman.reName.baseFolder,namepath.fullName);
		grouppath = namepath.fullName;
console.log(grouppath);
	};
console.log(grouppath);
//	if(grouppath.length > 1) groupname = grouppath.slice(-1)[0];
	var ix = pman.reName.itemGetByRelativePath(grouppath);
//同名グループが既存（既存メンバーにフォーカスを移動してメンバを返す）
	if (ix){
console.log (nas.localize('group %1 is allready exists!',grouppath))
console.log (ix)
		return ix;
	};
//同名のグループがないので新規に追加する
	var insPt     = 0;

//	var insParent = pman.reName;
console.log(grouppath);
	var group     = new pman.ReNameItem(grouppath,true,type);
	var addmember = pman.reName.appendItems(group,parentFolder,'INSIDE');
/*
	if(grouppath.length > 1){
		group.relativePath = grouppath.join('/');
		if(grouppath.length > 2){
// <baseFolder>,<group>,<<group>>,... ３要素以上でサブグループに所属のグループとなる
			var parentGroup = pman.reName.itemGetByRelativePath(grouppath.slice(0,-1).join('/'),'group');
			if(parentGroup) insParent = parentGroup;
		};
	};

	var addmember = pman.reName.appendItems(group,insParent,'INSIDE');
 */
	if(addmember.length){
//グループ追加に成功
		if(members){
			if(! (members instanceof Array)) members = [members];
			if(members.length) group.insert(members);
		};
		if(! pman.reName.rewrite) pman.reName.rewrite = true;
		return group;
	};
	return null;
}
/* グループアイテムカウント互換メソッド */
pman.reName.countMemberItems = function(){ return this.items.length;}
/**
 *	@params {Boolean} all
 *	allフラグが立っている場合は、選択状態に関わらずすべてのアイテムを対象にする
 *	それ以外は選択状態のアイテムのみをリネーム 被選択アイテムがない場合は処理自体もなし
 *
 *	params {Boolean} ctrl

 *	＊＊パス変更を操作範囲に加えるので基本的に選択アイテムのみのリネームは不可となる
 *	変更対象はすべてのアイテムでallフラグは廃止
 *	グループリネーム ファイルリネーム
 *	path変更はリネームのみでなく移動を含む
 *	変更がグループの場合は、配下のアイテムの相対パスの変更・パスの変更を含む
 * 220608現在　グループ変更は未実装なので　操作をブロックする
 実装まではグループ(フォルダ)のリネームは不可
 *	リネーム操作前にリストを作成してユーザの確認を行う
 *	確認ダイアログの構成に注意　操作系はダイアログ上方へ　メッセージは処理アイテム数　リスト表示機能あり
 *	リネーム操作後にファイルの存在を確認、表示更新（チェック｜サムネイルソース｜name)

 */
pman.reName.renameItem = function(all){
	if((appHost.Nodejs)||(appHost.platform == 'Electron')){
//セッション状態を確認する
//書込セッションをが有効でない場合は、ワークセッションの立ち上げとチェックインをうながす
//if(pman.reName.worksession)
		var targetItems = pman.reName.items;
//リネーム候補取得
		var renameList = [];
		for (var i = 0 ; i < targetItems.length ; i ++){
			if(targetItems[i].type == '-group-') continue;
			if(
				((targetItems[i].getPath(true) + nas.File.extname(targetItems[i].name)) != nas.File.join(nas.File.basename(pman.reName.baseFolder),targetItems[i].relativePath))
			)	renameList.push(targetItems[i]);
/*
var targetItem = pman.reName.getItem(pman.reName.focus)
(targetItem.getPath(true) + nas.File.extname(targetItem.name))
			if((targetItems[i].getPath(true) + nas.File.extname(targetItems[i].name)) != targetItems[i].relativePath) renameList.push([
				targetItems[i].id,
				targetItems[i].relativePath,
				targetItems[i].getPath(true)
			]);// */
//			if(targetItems[i].name != targetItems[i].text+nas.File.extname(targetItems[i].name)) renameList.push(targetItems[i]); //
		};
//		renameList.sort((a,b)=> (a[2].localeCompare(B[2])));相対パスで比較 文字列比較でパスの浅い順位並ぶ
//候補の処理順位付けを行う
/*
	非同期並列変更は不可（キューを作って順次変更）
アイテムの相対パスを取得して変更のあるものをキューに加える
	[[ユニークID,現相対パス,新相対パス]...]
キューにあるアイテムを新相対パスが浅いものの順にソートしておく
一時フォルダ（ゴミ箱兼用）を作成してキューを保存
キューを処理
	uuidでアイテムリストを検索してファイルを一時フォルダに一括して移動(uuidをファイル名として使う)
	<baseFolder>/<uuid> 
	一時フォルダから新規パスへ向かって移動 その際にアイテムのrelativePathプロパティを更新(ipは事前に解決済み=ipに同期させる)

アイテムから新規の相対パスを
	アイテムパスが浅い側から順に処理
	アイテムパスから自身の新パスを作成して変更
	グループアイテムのリネームの場合は、実パス配下のアイテムの相対パス記述を変更 アイテムパスを保持(対象はメンバーアイテムではない)
	アイテムの並べ替え（パス変更）を先行して解決する？（同時処理）
動作原則
エントリ外のファイルは所属するフォルダとともに移動
意図的にエントリ外にしたアイテムを削除するオプションをつける（with [Ctrl]）
システム的に除外するファイルは削除されない

(1)削除マークの入ったアイテムを削除する（確認付き）
	操作対象のルートにゴミ箱を作成してソコへ移動（undo可能に）
(2)ファイル名を保持したまま移動を先行して所属パスを解決する
	名前を固定することで操作が単純化される
(3)パスの解決後にアイテム名の解決（変更）を行う
	一括変更処理を行う（非同期）

(3)ステップ目は非同期処理可能
3段階に分けてUNDOバッファにコマンドを流す
逆順で処理のやり直しを実装

	removeFiles(items);//array
	alignmentPath()
*/

//confirm && 
		if(renameList.length){
console.log(renameList);
		var msg = [];
		msg.push(renameList.length + ": 点のファイルをリネームします。\nよろしいですか？\n<br>");
		msg.push("<div>" +(Array.from(renameList,e => e.name +' → '+e.text+ nas.File.extname(e.name))).join('\n')+"</div>");
		// renameList.forEach(e => msg += e.name + ' >> '+ e.text + nas.File.extname(e.name)+ '\n');
console.log(msg)
		nas.HTML.showModalDialog('confirm',msg,'ファイルリネーム',null,function(result){
			if(result){
				var renameItemset = Array.from(renameList , function(e){ return {idx:pman.reName.items.indexOf(e),target:e.path,destination:nas.File.join(nas.File.dirname(e.path),(e.text+nas.File.extname(e.name)))}});//{idx:<index>,target:<old-path>,destination:<new-path>}
console.log(renameItemset);
				uat.MH.parentModule.window.postMessage({
					channel:'callback',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					to:{name:'hub',id:uat.MH.parentModuleIdf},
					command:'return electronIpc.renameItems(arguments[0]);',
					content:[renameItemset],
					callback:'pman.reName.checkItemset(arguments[0]);'
				});
			};
		},false);
/*
		if(confirm(msg)){
			Array.from(renameList,(e)=> [nas.File.dirname(e.path),e.name,e.text+nas.File.extname(e.name)]);
			for (var ix = 0 ; ix < renameList.length ; ix ++){
				var targetDir     = nas.File.dirname(renameList[ix].path);
//処理ディレクトリの一覧を取得
				var targetName    = renameList[ix].name;
				var fileExtension = nas.File.extname(targetName);
				var destName      = renameList[ix].text+fileExtension;
				var destPath      = nas.File.join(targetDir,destName);

				var existsDestPath = (fs)?fs.existsSync(destPath):electronIpc.existsSync(destPath);
				if(existsDestPath){
					alert('既存ファイル名 : '+destPath);
					continue;//暫定skip
				}
*/
//同期リネーム リネーム更新の専用メソッドを作る
/* Electron環境で、
*/
/*
				if(fs){
					fs.renameSync(renameList[ix].path,destPath);
				}else{
					uat.MH.parentModule.window.postMessage({
						chennel:'callback',
						from:{name:xUI.app,id:uat.MH.objectIdf},
						to:{name:'hub',id:uat.MH.parentModuleIdf},
						command:'electronIpc.renameItem(...arguments)',
						content:renameList,
						callback:'pman.reName.setItem("renamed");'
					});//ipcElectron.renameSync(renameList[ix].path,destPath);
				}
//リネームの確認
				var existsOldPath = (fs)?fs.existsSync(renameList[ix].path):electronIpc.existsSync(renameList[ix].path);
				existsDestPath = (fs)?fs.existsSync(destPath):electronIpc.existsSync(destPath);

				if((!(existsOldPath))&&(existsDestPath)){
//console.log('リネーム成功');

// 操作終了後にアイテムのpath,nameを更新(チェック状態は保存)
					renameList[ix].path = destPath;//path
					renameList[ix].name = destName;//name
					renameList[ix].relativePath = nas.File.join(pman.reName.baseFolder,destName).replace(/\\/g,'/');

//リネームに成功したあたらしいファイルを読み出してFileを作りitem.imgを更新する
					var im = document.createElement('img');
					im.src = renameList[ix].path.replace(/#/g,'%23');
					renameList[ix].img = im; 
				}else{
					var msg = "リネームに失敗しました\nファイルを確認してください"
					alert(msg);
				};
			};
//ループでリネームリストを作成して通信を一回に収める


//伝票の出力はcallback関数へ移動
			this.exportWorkSlip(document.getElementById('slip_auto').checked);
		};// */
		}else{
//リネーム可能なアイテムがない
console.log(renameList);
			alert('リネームできるアイテムがありません');
		};
	}else{
		var msg = "テストバージョンです\nWEB上で実行している場合はリネーム機能は使えません。"
		alert(msg);
	};
}
/**
	@params {Array} idList
	引数リストを更新する [{idx:<itemId>,target:<oldItemPath>,destination:<itemPath>},...]
*/
pman.reName.checkItemset = function(idList){
//console.log(idList);
	if(!(idList instanceof Array)) idList = [idList];
	idList.forEach( e => pman.reName.items[e.idx].checkItemStatus(e.destination));
}
/*
 指定されたurl|pathを開く
 urlは
 	データリストのJSON
 	ローカルのターゲットパスを含むJSON
 	データであった場合は、
 */
pman.reName.openURL = function openURL(url){
//	NOP
	return;
}

/*
	与えられたファイルエントリーを先行でpman.ReNameItemとして初期化したあとエントリに加える
	グループを作成する場合は、文字列で初期化を行いsetItemにわたすことでundoシステムに組み込む
	
*/
/**
 * @params {String} target
 * @params {String} type "folder"|"file"
 * @params {} resultTarget
 * 編集対象フォルダを設定する
 *	Filesを組み上げる？

OPEN Folder
	フォルダのアイテムを使用してセッションを初期化
[CTRL]|[META] + OPEN Folder
	フォルダのアイテムをセッションに追加

OPEN File
	指定のアイテムをセッションに追加
[CTRL]|[META] + OPEN File
	指定のアイテムを使用してセッションを初期化

openメニューの操作
UIとメニューのイベント発火時に判定

[ctlr]or[cmd]
	オープンモード切り替え
	フォルダは標準　初期化|追加
	ファイルは標準　追加|初期化
	ただし、アイテム数が0の場合は、強制的に初期化モードに入る
ショートカット操作時は、オープンモードを変更できない？
	[shift]キーを[ctrl]と等価とみなす
	pman.reName.loadCtrl 変数を腕木信号として扱うものとする

[alt]
	オープン対象切り替え
	標準は　フォルダ|ファイル
	

 */
pman.reName.openFolder = function(target,type){
	if(pman.reName.onCanvasedit){
		return ;
	};
console.log(arguments);
console.log(event);
	if(typeof type == 'undefined') type = 'folder';
	if((event)&&(event.altKey)) type = (type == 'folder')? 'file':'folder';
//default mode  folder:init | file:append
	pman.reName.loadCtrl = (type == 'folder') ? 'init':'append';
//key controle
	if(event){
		if(type == 'folder'){
			if(event.shiftKey){
				pman.reName.loadCtrl = 'append';//シフト優先で取得
			} else if((event.ctrlKey)||(event.metaKey)){
				pman.reName.loadCtrl = 'append';//シフト優先で取得
			};
		}else{
			if(event.shiftKey){
				pman.reName.loadCtrl = 'init';//シフト優先で取得
			} else if((event.ctrlKey)||(event.metaKey)){
				pman.reName.loadCtrl = 'init';//シフト優先で取得
			};
		};
	};
	if(appHost.platform == 'Electron'){
		if(! target) target = false;//指定がない場合はfalseに正規化 これでダイアログが開く
console.log([target,type]);
		if(uat){
//node > V8@
//hub&&spoke:メッセージ通信でコマンドを投げてリザルトを得る
//getEntryFileList:(target,isUAF,depth,locale)
//読み込み時の最大カウントでの制限は廃止　カウントパラメータ自体は現存

			let cmd = (type != 'folder')?
				'return electronIpc.getFiles(...arguments)':'return electronIpc.getEntryFileList(...arguments)';
			uat.MH.parentModule.window.postMessage({
				channel:'callback',
				from:{name:xUI.app,id:uat.MH.objectIdf},
				to:{name:'hub',id:uat.MH.parentModuleIdf},
				command:cmd,
				content:[target,pman.reName.isUAF,3,nas.locale],
				callback:"pman.reName.openItems(...arguments)"
			});
		}else{
			if(type != 'folder'){
				document.getElementById('openFile').click();
			}else{
				document.getElementById('openFolder').click();
			};
		};
	}else{
		if(type != 'folder'){
			document.getElementById('openFile').click();
		}else{
			document.getElementById('openFolder').click();
		};
	};
}
//pman.reName.openFolder//
/**
	WEB版では動作しない
	現在のフォルダの内容を初期化せずに読み直す
	リムーブされたファイルは、無視
	現在のアイテムはステータスを取り直す
	未設定のファイルはアイテムエントリー
	
 */
pman.reName.reloadSession = async function(){

}
//pman.reName.reloadSession//
/**
	@params {Object pman.ReNameItem|String} item
	引数がカラの場合は選択されたアイテムを設定する
	引数アイテムを新規ウインドウで開く
	バンドルを含むフォルダ系グループは新規のツールボックスウインドウ
	(WEB版では、新しいウィンドウを開くだけの動作にとどまる)
	アセットアイテムは新規に設定するプレビューツール（未作成）
 */
pman.reName.openNewWindow = async function(item){
	if(!(item instanceof pman.ReNameItem)) item = pman.reName.getItem(item);
	if(!(item instanceof pman.ReNameItem)) item = pman.reName.selection[0];
	if(!(item instanceof pman.ReNameItem)) {
//指定がないのでカラのウインドウを開く
		if(appHost.platform == 'Electron'){
			electronIpc.openURLmain({
				url:"index.html",
				asFile:true,
				width:window.outerWidth,
				height:window.outerHeight,
				webPreferences: {preload:'preload.js'}
			});
		}else{
			var adrs = "./index.html";
			var browser = window.open(adrs,'_blank');
		};
	};
	if((item.type == '-group-')||(item.type == '-bundle-')){
//フォルダを指定して開く
		if(appHost.platform == 'Electron'){
			electronIpc.openURLmain({
				url:"index.html",
				query:{"load":encodeURIComponent(item.path)},
				asFile:true,
				width:window.outerWidth,
				height:window.outerHeight,
				webPreferences: {preload:'preload.js'}
			});
		}else{
			var adrs = "./index.html?load=-openFolder-"+encodeURIComponent(item.text);
			var browser = window.open(adrs,'_blank');
		};
	};
}
//pman.reName.openNewWindow//
/**
 * @params {Array of File|Entry|String} items
 * @params {String}      baseFolder
 * @returns {Array of pmasn.ReNameItem}
 * 与えられたアイテムソースからブラウジングアイテムの配列を作成して返す前処理関数
 *	アイテム類は種別に関わらずこのメソッドに渡し、オブジェクト化して処理を行う
 *	webkitRelativePathを確認して、baseFolder pathを補いpathとして記録する
 *	パスの中間ディレクトリをグループとして作成する
 *	setItem は、アイテムの追加を受け付ける
ex.
 	baseFolder  : "A#12__s-c12345";
 	item.webkitRelativePath : 01_CT/123.tif
	> path : A#12__s-c12345/01_CT/123.tif
	> group : 01_CTを作成
隠しファイル｜特定の名称のアイテムは 処理スキップ
 */
pman.reName.preformatItems = function(itms,baseFolder){
	if(typeof itms == 'undefined') itms = [];
	if(! itms.sort)                itms = Array.from(itms);
	if(!(itms instanceof Array))   itms = [itms];
	if(! baseFolder) baseFolder = String(pman.reName.baseFolder);
//baseFolderが"(空文字列)"の場合は、ルートアイテムとして初期化される
	if(itms.length == 0) return [];//リザルト空配列
	var result = [];//アイテムのコレクション配列
	for(var i = 0 ; i < itms.length ; i ++){
//オブジェクト化
		let e  = new pman.ReNameItem(itms[i]);
//アイテム名条件判定
		if(
			(e.name.indexOf('.') == 0)||
			(e.name.match(pman.reName.rejectRegex))
		) continue;
//アイテムがFileEntryのケースのみデータ調整を行う?  必要なし
//		if(itms[i].filesystem){};
//baseFolderパスを反映 基本はオブジェクトパーサで行う
		if(e.path.indexOf(baseFolder) == 0){
//冒頭で一致しているので削除
			e.relativePath = nas.File.relative(baseFolder,e.path)
//			e.path = nas.File.join('/',this.relativePath);
		};
/*
		if(e.entry){
			e.relativePath = (e.entry.fullPath)?
			nas.File.relative(nas.File.relative('/',e.entry.fullPath)):
			nas.File.resolve(e.name);
		}else if(e.file){
			e.relativePath = (e.file.webkitRelativePath)?
			nas.File.relative(nas.File.resolve(baseFolder,e.file.webkitRelativePath)):
			nas.File.relative(nas.File.resolve(baseFolder,e.name));
		};// */
//リザルトに登録
		let ln = result.length;
		let ix = result.add(e,function(tgt,dst){
			return (
				((e.path)&&(tgt.path == dst.path))||
				(
					(tgt.file)&&(dst.file)&&
					(tgt.file.lastModified == dst.file.lastModified)&&
					(tgt.file.name == dst.file.name)&&
					(tgt.file.size == dst.file.size)
				)
			)? true:false;
		});
		if(ln == ix){
//追加登録発生、相対パス上の親ディレクトリ抽出
			let pt = new nas.File(e.relativePath);
// A/B/C/d.efg
// pt = {
// body : ["A","B","C","d.efg"]};// length:4
console.log(pt);
			if(pt.body.length > 1){
				let cObj = e;
				for (var xi = pt.body.length - 1; xi > 0 ;xi --){
					let itmPath = pt.body.slice(0,xi).join('/');
					if(itmPath.match(/\s|\.+/)) continue;
					let itmIx = result.add(new pman.ReNameItem(itmPath,true,'-group-'),function(tgt,dst){return(tgt.relativePath == dst.relativePath)});
					if(result[itmIx].members) result[itmIx].members.add(cObj);
					cObj.parent = result[itmIx];
					cObj = result[itmIx];
				};
			};
		};
	};
console.log(result);
	return result;
};
//pman.reName.preformatItems
/*TEST
pman.reName.preformatItems(["/1.txt","/2.txt","/3.txt","/4.txt"],"TEST")
*/
/**	引数で指定されたファイルアイテムを開く
 * @params {Array of (FileEntry|String|File|URL|Object pman.ReNameItem)} items
 * @params {String}      baseFolder
 * @params {Boolean}     update
 * @params {Events}      evt
 * @params {Object pman.ReNameItem}	insTargetItem
 *		挿入起点アイテムまたはアイテムを指定する文字列 id|整数ID|path|名前
 *		削除されたアイテムが指定された場合は未指定の扱いとなる
 *		挿入点未指定の場合はフォーカスを参照 -1(=フォーカスなし)の場合は、末尾に挿入
 * @params {String}	placement
 		挿入位置指定文字列 PLACEBEFORE|PLACEAFTER|INSIDE|PLACEATEND|PLACEATBEGINNING

 *
 *	アイテム未登録状態 | [Ctrl]|[Cmd] 同時押しの場合、初期化を同時に行いアイテムをルート登録する
 *	それ以外の場合 | [Shift] 同時押しは、実行中のセッションに対してアイテムを追加登録する

 *	追加登録の際、挿入点と挿入位置を指定可能
 *	指定のない場合は
 *	アクティブなフォルダアイテムの後方へ挿入
 *	アクティブアイテムの後方へ挿入
 *	アクティブアイテムがない場合はルートの後方
insTargetItem,placement
 */
pman.reName.openItems = function(itms,baseFolder,update,evt,insTargetItem,placement){
console.log(arguments);
console.log(event);
	if((typeof itms == 'undefined')||(pman.reName.onCanvasedit)) return ;
//loadCtrl判定
	if(
		(pman.reName.items.length == 0)||(pman.reName.loadCtrl == 'init')
	){
//アイテムが未登録 | 初期化フラグあり
		if(evt){
			pman.reName.initItems(itms,baseFolder,((evt.metaKey)||(evt.ctrlKey)));
		}else{
			pman.reName.initItems(itms,baseFolder);
		};
	}else{
//アイテム追加
		if(! insTargetItem){
			insTargetItem = pman.reName.focus;//idで設定
		}
//挿入配置
		if(! placement) placement = 'PLACEAFTER';
//挿入点引数を処理
		if(!((itms instanceof FileList)||(itms instanceof Array))) itms = [itms];
console.log(itms);
//		var items = Array.from(itms,function(e){return new pman.ReNameItem(e);});
		var items = pman.reName.preformatItems(itms,baseFolder);

		console.log(pman.reName.setItem(items,function(result){
			pman.reName.move(result,insTargetItem,placement);
		}));
//		pman.reName.appendItems(items,insTargetItem,placement);
	};
	pman.reName.loadCtrl = '';//初期化コントロール リセット
}
/**
 * @params {Array of File|Entry|String} items
 * @params {String}      baseFolder
 * @params {Boolean}     update
 * 編集バッファのクリアと初期化を行う
 *	アイテム類は種別に関わらずこのメソッドに渡す
 *	setItem は、このメソッドを呼ばずアイテムの追加のみを受け付ける
 	var baseFolder = "A#12__s-c12345";
	console.log(baseFolder.match(/([^#]+#[^#_]+__s.*\-c.+)/i))
 * ベースフォルダの設定はxmapの初期化含む
 *  	xmapは基礎的なUAFの管理のみでなくextraアセットの作成管理を含む 初期状態で汎用ExtraAssetを定義する
 *setItemによるアイテムの設定は、xmapに対するアセットエントリを包括

 * 2024 5拡張
 ブラウジングルートがxmap以外の一般リポジトリを想定するケースを追加
 引数がフルパス文字列のケースでは通常baseFolder引数が起点パスとなるので、深度差分を得ること
 フルパス文字列・baseFolderの内容は Windowsタイプのパスの可能性があるので注意
 
 */
pman.reName.initItems = function(itms,baseFolder,update){
console.log(arguments);
	if((typeof itms == 'undefined')||(pman.reName.onCanvasedit)) return ;
// 読込決定なので環境を初期化
	pman.reName.setPreview('clear');//プレビュークリア
console.log(' ======================== clear preview screen');
//
	pman.reName.xmap         = new xMap();
	pman.reName.isUAF        = false;
	pman.reName.items                = [];
	pman.reName.members              = [];
	pman.reName.removedItems.members = [];
	pman.reName.baseFolder    = "";
	pman.reName.note          = "";
	pman.reName.focus         = -1;
	pman.reName.selection     = [];
	pman.reName.loadQueue     = [];
	pman.reName.imageLoadingStatus.loading = 0;
	pman.reName.imageLoadingStatus = {count:0,loaded:0,error:0,loading:0},

	pman.reName.rewrite      = false;
//	pman.reName.pending      = false;
//	pman.reName.undoBuffer = new xUI.UndoBuffer();
//console.log(baseFolder)
	if(! baseFolder) baseFolder = "";
//ブラウザ環境でファイルアイテムのみで初期化すると相対パスが存在しないためbaseFolderが"(空文字列)"で初期化される
//これは正常動作であるものとする20241124
	var startupItem = '';
//画面同期を優先して1回書き直し(＝クリア)
	console.log(pman.reName.refreshItemlist(true));
console.log(' ======================== item list clear');
	if(itms.length == 0) return ;
// ウインドウ類を書き直して読込終了までの待機状態に入る
	pman.reName.pending      = true;
console.log(' ============= start loading items !')
	if(! itms.sort) itms = Array.from(itms);
//console.log(itms);
//先行でバンドル判定 現在はUAFのみ
//baseFolderの名称が"_"で開始される場合は
		for(var i = 0 ; i < itms.length ; i ++){
			let e  = itms[i];
console.log(e);
/*
File       旧来のHTML input type=file で得られる Fileオブジェクト > webkitRelativePath
           ファイル単独で指定される場合 webkitRelativePathが""であることに注意
           その場合 "/filename.ext"で置き換えられる
FileEntry  ドラグドロップ等で得られる FileSystemEntry > path > fullPath 
URL        Object URL > pathname
String     文字列で与えられるフルパス|URL
*/
			let pt = ((e.path)&&(electronIpc))? e.path:((e.fullPath)?e.fullPath:((e.pathname)?decodeURI(e.pathname):((e instanceof File)? ((e.webkitRelativePath)?e.webkitRelativePath:"/"+e.name):e)));
console.log(pt);
			let f = new nas.File(pt);
console.log(new nas.File(baseFolder));
console.log(f);

			if(
				(f.body.length >= 2)&&
				(f.body[f.body.length-2].indexOf('_') != 0)&&
				(f.name.match(/^(__.*\.status(\.(te?xt|json))?|.+\.xmap)$/i))
			){
/*
オブジェクトの場合ケースにより以下の3パターンが存在する いずれでもbundle UAF判定
webkitRelativePath : (keyFile)
(basefolder)/(keyFile)
FileEntry && /(basefolder)/(keyFile) 
また
文字列によるフルパス|URL指定の場合は、以下の判定を用いる baseFolderも文字列によるフルパスである必要がある
/..../(basefolder)
/..../(basefolder)/(keyFile)
引数文字列がURIEncodeされた文字列であるケースが有るので判別が必要
*/
				if(
					(f.body.length <= 2)||
					((e.fullPath)&&(f.body.length == 3))||
					((typeof e == 'string')&&(f.body.length == (new nas.File(baseFolder).body.length + 1)))
				){
					pman.reName.isUAF = true;
					pman.reName.initBundle('uaf',nas.File.basename(nas.File.dirname(f.fullName)));
					var statusKey = f.name;
//					var statusKey = new pman.ReNameItem(e);
//					pman.reName.appendItems(statusKey,pman.reName,'PLACEATBEGINNING');
//console.log(statusKey)
//					pman.reName.initBundle();
					break;
				};
			};
		};
//アイテムを事前にフィルタ
//深度限界を設定 baseFolderがフルパス|URLの場合は、通常items引数もフルパスなので起点設定が必要　起点分の深度を追加する
		var depthRimit = ((pman.reName.isUAF)? 5:8) + new nas.File(baseFolder).body.length;
		itms = itms.filter(function(e,ix,arr){
			let pt = (e.path)? e.path:((e.fullPath)?e.fullPath:((e.pathname)?decodeURI(e.pathname):((e instanceof File)? ((e.webkitRelativePath)?e.webkitRelativePath:"/"+e.name):e)));
			let fl = new nas.File(pt);
//ドットファイル（隠しファイル）アイテムをスキップ
			if(fl.name.indexOf('.') == 0) return false;
//特定ファイル名のアイテムをスキップ
			if(fl.name.match(pman.reName.rejectRegex)) return false;
//階層制限で大深度アイテムをスキップ
			if(fl.body.length > depthRimit) return false
			return true;
		},this);
console.log(itms);
//フィルタしたアイテムをソート
		itms.sort((a,b)=>{
			let tgt = (a.path)? a.path:((a.fullPath)?a.fullPath:((a.pathname)?decodeURI(a.pathname):((a instanceof File)? ((a.webkitRelativePath)?a.webkitRelativePath:"/"+a.name):a)));
			let dst = (b.path)? b.path:((b.fullPath)?b.fullPath:((b.pathname)?decodeURI(b.pathname):((b instanceof File)? ((b.webkitRelativePath)?b.webkitRelativePath:"/"+b.name):b)));
			return String(tgt).localeCompare(dst,nas.locale);
		});
//エントリ数による警告
		if(itms.length > pman.reName.maxItemCount){
			var msg = nas.localize("%1 :登録アイテムが制限の %2 を超過するおそれがあります\n超過分はスキップされます",itms.length,pman.reName.maxItemCount);
			alert(msg);
		};
//予備処理 候補に残った引数から（相対または絶対）パスの集合を取得
//console.log(itms,itms.length);
	if((itms)&&(itms.length)){
		var dirNames = Array.from(itms, e =>{
			if (e instanceof URL){
				return new nas.File(decodeURI(e.pathname)).body;
			}else if(e.path){
				return new nas.File(e.path).body;
			}else if(e.fullPath){
				return new nas.File(e.fullPath).body;
			}else if(e.webkitRelativePath){
				return new nas.File(e.webkitRelativePath).body;
			}else if(e instanceof File){
				return ['',e.name];//下と等価
//				return new nas.File("/" + e.name).body;
			}else if((typeof e == 'string')&&(e.match(/%[A-F\d]{2}/i))){
				return new nas.File(decodeURIComponent(e)).body;
			}else if(typeof e == 'string'){
				return new nas.File(e).body;
			}else{
				return '';//すべて失敗した場合は空白を返す
			};
		});
	}else{
		var dirNames = [];
	};
console.log(dirNames);

//=== pman.reName.isUAF 判定 ===//
//第一階層の xmap または 作業ステータスタグファイルを検索する
	var xmap  = dirNames.find(function(e){return String(e[1]).match(/.+\.xmap$/i)});
	var jstag = dirNames.find(function(e){return String(e[1]).match(/^__.*\.status\.(te?xt|json)$/i)});
	if((xmap)||(jstag)){
//console.log('bundledata detect : ');
//バンドル判定はある程度行うが、ここではisUAFフラグ操作は行わない
//		 pman.reName.isUAF = true;//フラグ立てる
//console.log(xmap,jstag)
	};
//=== pman.reName.isUAF 判定 ===//
//baseFolder指定のない場合・引数配列の要素から推測してbaseFolderパスを設定
//指定が存在する場合はその文字列を使用
	if((! baseFolder)&&(dirNames.length)){
		var baseArray = dirNames[0];
//console.log(baseArray);
		if(baseArray instanceof Array){
console.log(dirNames)
			if(dirNames.length == 1){
//例外:エントリが一つだけの場合パス共通部を取り出せないので、エントリの親をbaseFolderに登録する
				baseFolder = baseArray.slice(0,-1).join('/');
			}else if(dirNames.length > 1){
//全アイテムパスを走査
				for (var i = 1 ; i < dirNames.length ; i++){
//パス共通分を取り出してbaseFolderを設定
					baseArray = ((a,b)=>{
						var minct = (a.length < b.length)? a.length:b.length;
						for(var j = 0; j < minct ;j++) if(a[j] != b[j]) break;
						return a.slice(0,j);
					})(baseArray,dirNames[i]);
				};
				baseFolder = baseArray.join('/');
			}else{
				baseFolder = 'null';//想定外エラーケース initItemsをコールする前に対処が必要
			};
		};
	};
	if(baseFolder){
		pman.reName.baseFolder = baseFolder;
	};
// にデータを渡す前に、itemsを整理する
/*
	ルートがuafではない場合のみ
	アイテムがuafであった場合配下のアイテムを登録対象外にする（単純に削除）
	uafの判定は、dirNames配列を利用する
*/
	if(!(pman.reName.isUAF)){
		var uafKeyEntries = dirNames.filter((e)=>(
				((e.length >= 2)&&(String(e[e.length-2]).indexOf("_") != 0))&&
				(String(e[e.length-1]).match(/^(.+\.xmap|__.*\.status\.(te?xt|json))$/i))
			)
		);
console.log(uafKeyEntries);
//キーエントリからuafエントリを抽出
		var uafEntries = [];
		uafKeyEntries.forEach((k)=> uafEntries.add(k.slice(0,-1)),);
console.log(uafEntries);
/*
バンドルアイテムが存在した場合
ここで先行してバンドル関連のグループとバンドルエントリを登録する
-bundle-タイプのエントリはバンドルグループとして扱う
このケースの場合は、必ず文字列引数で初期化を行うことになる
Electron環境の場合にパスを補正する必要がある
*/
		if(uafEntries.length){
			uafEntries.forEach(function (itemPath){
//フォルダエントリをのみを設定するので簡易ループ
				var group = false; var itm   = false;var type = '';
				var startCount = 1;
// ベースフォルダがフルパスの場合開始カウントを設定
				var startCount = new nas.File(pman.reName.baseFolder).body.length;
//				if(pman.reName.baseFolder.indexOf("/") == 0) startCount = pman.reName.baseFolder.split('/').length;

				for(var p = startCount ;p < itemPath.length ;p ++){
					type = (p == (itemPath.length - 1))? '-bundle-':'-group-';
//パス終端はバンドルアイテムほかはグループアイテムとして初期化
console.log('append : '+ itemPath.slice(startCount,p+1).join('/'))
					itm = pman.reName.addGroup(
						itemPath.slice(startCount,p+1).join('/'),
						//itemPath.join('/'),
						[],type
					);
console.log(itm)
console.log(pman.reName.items.indexOf(itm));
					if(group) group.insert(itm);
/*
					if(group){
						pman.reName.appendItems(
							[itm],
							pman.reName.items.indexOf(group),
							'PLACEATBEGINNING'
						);
					};
*/
					group = itm;
				};
			});
		};
	};
	if(pman.reName.baseFolder) pman.reName.setSCi(nas.File.basename(pman.reName.baseFolder));
	if(itms){
console.log(itms);
		pman.reName.setItem(itms,function(){
			pman.reName.itemSort();
			pman.reName.itemAlignment();
			pman.reName.checkItemSource();
//			if(pman.reName.isUAF) pman.reName.initBundle('uaf',nas.File.basename(pman.reName.baseFolder));
		});
	};
	if(update){
		if(! pman.reName.rewrite) pman.reName.rewrite = true;
//		if(pman.reName.pending) pman.reName.pending = false;
//		pman.reName.refreshItemlist(true);
	};
//表示履歴をクリア
	pman.reName.history.init();
//ベースフォルダでドキュメントタイトルとカット番号を設定
	var currentLocation = nas.File.basename(pman.reName.baseFolder);
	if(document.title != currentLocation){
		document.title = currentLocation;
	}
	var guessedSCI = pman.guessSCI(currentLocation);
	if(guessedSCI) pman.reName.setSCi(guessedSCI);
//undoバッファをフラッシュする
	xUI.flushUndoBuf();
//初期化セットがUAFを含むバンドルであった場合、バンドルごとの初期状態設定を行う
	if(pman.reName.isUAF){
		pman.reName.initBundle();

console.log(pman.reName.bundleInf.bundleData);
//		var startupInf = new pman.UAFBundleStatusRecord(statusKey.name.replace(/^[^\[]*/,"").split('.')[0]);
		var startupInf = new pman.UAFBundleStatusRecord(statusKey.replace(/^[^\[]*/,"").split('.')[0]);
console.log(startupInf);

		let headStageFolder = false;
		if(pman.reName.members.toReversed){
			headStageFolder = pman.reName.members.toReversed().find(function(elm){return ((elm.name.indexOf(startupInf.stage) >= 0)&&(elm.type == '-group-'));});
		}else{
			headStageFolder = Array.from(pman.reName.members).reverse().find(function(elm){return ((elm.name.indexOf(startupInf.stage) >= 0)&&(elm.type == '-group-'));});
		}
console.log(headStageFolder)
		if(headStageFolder) pman.reName.select(headStageFolder);
	};
}
// pman.reName.initItems //

/**
 *	UNDO処理対応 統合編集メソッド
 *	アドレス,内容を受けてアイテムを編集　反編集コマンドをリザルト
 	リザルト[書き込みプロパティアドレス,書き込み前の値,書き込み後の値]
 */
//pman.reName.put = function put(){
//	console.log(arguments);
//}
pman.reName.get = nas.Pm.valueGet;
pman.reName.put = nas.Pm.valuePut;
/*
	アイテム編集配列の指定選択内容テキストを返す
	選択範囲が未指定の場合は編集配列全体のシャローコピーを返す
 */
pman.reName.itemGet = function itemGet(selection,prp){
	var getResult = [];
	if(! prp){
		if(! selection ) return Array.from(pman.reName.items);
		for(var s = 0;s < selection.length ; s++) getResult.push(pman.reName.items[selection[s]]);
	}else{
		if(! selection ) return Array.from(pman.reName.items,function(elm){return elm[prp]});
		for(var s = 0;s < selection.length ; s++) getResult.push(pman.reName.items[selection[s]][prp]);
	}
	return getResult;
}
/*
	アイテム編集配列の指定選択内容テキストを返す
	選択範囲が未指定の場合は空配列を返す
 */
pman.reName.textGet = function textGet(selection){
	if(! selection ) return [];
	var getResult = [];
	for(var s = 0;s < selection.length ; s++) getResult.push(pman.reName.items[selection[s]].text);
	return getResult;
}

/**
 *	@params {Object xUI.InputUnit}	input
 *	@params {Boolean}	undo


 * pman.reName.itemPut(inputUnit) 第一形式
 * pman.reName.itemPut(inputUnit,undoFlag) 第一形式+undo操作フラグ
 * pman.reName.itemPut(inputAddress,inputContent) 第二形式
 *
 * 指定アイテムにデータを書き込む
 * またはアイテムの追加｜削除を行う
 * 入力ユニットのオブジェクト種別は問われないが、オブジェクトがaddress,valueの各プロパティを持っているものとする
 * アドレスの形式は address:[[g-id,i-id],[selections]]
 * ただしこのアドレスは基本的に操作上の意味を持たない
 * 値の形式は以下に準ずる
 	value:{
 		command:{String}commandStr "name",
 		focus:{Number Int} focusID,
 		selected:[array of selection ID],
 		names:[array of nameText],
 		items:[array of group|item|item-index ]
 	}
 * 編集コマンド類の体系化 移動系のコマンドは配置として置き換える値はアイテム参照を直接使う
 パスで指定されたコマンドも最終的にこの系列に置き換えて itemPutメソッドへ渡す
 itemPutの戻りがundoStackに蓄積される
	アドレスは [focus,sellection] 入出力値は [itemContents...]または[nameText...]

 	ADDRESS VALUE
	address items 
 	address

 inputUnitのproperty.command の値によりアイテムの個数のかわる編集と変わらない編集を切り分ける
 	名前の設定に対しては               "name"
 	隠蔽：表示                       "hide","show"
 	移動、ソート、アライメント等は総じて  "order"
 	追加、削除はそれぞれ               "append","remove"
 	として分岐する
 例
 	xUI.InputUnit(
 		[pman.reName.focus,pman.reName.getSelected(true)],
 		[names....]
 		{backup:pman.reName.selection}
 	);

 	new xUI.InputUnit(
 		[[-1,-1]],[[-1,2],[-1,3],[-1,4]],{
 			command:"name"
 			focus:-1,
 			selected:[2,3,4],
 			value:["A-1","A-2","A-3"],
 			backup:["B-0001","B-00002","B-0003"]
 		}
 	)
 	 
 * 引数は入力オブジェクト 配列は受け付けない
 * 複数範囲の書き込みはこのメソッドに渡す前に展開を行う
 * リザルト	書き込みに成功したID配列、書き換え前のデータ配列、書き込みに成功したデータ配列
 * を返す

 * 第二引数が存在する場合、第二形式
 * @params {Object xUI.InputUnit} input
 * @params {Boolean} undo
 * @returns {Array|false}
 *      [<Array:writeRange>, <String:currentDataStream>,<String:oldDataStream>,<Array:selected>]
command
	name|order|append|remove|hide|show

エントリーアイテムの数が変動する操作のケースで、バックアップバッファにアイテムが格納される場合オリジナルの配列の参照が残ると副作用が発生するので
アイテム全体をコピーに置き換える
コピーは <item>.duplicate() メソッドを使用
具体的には 
Array.from(pman.reName.selection,e => e.duplicate());
と、置き換えるのが良い

 */
pman.reName.itemPut = function itemPut(input,undo){
console.log(input);
	var putResult = [[input.focus,input.selected],[],[]];
	if(input.command == 'name'){
//text nameput
/*
	xUI.inputFlag
	[focus,[selected]],[names],[old-names]
*/
		if(undo){
			input.selection.forEach(function(e){
				var i = input.selection.indexOf(e);
				if(i < input.backup.length){
					pman.reName.items[e].text = input.backup[i];
					pman.reName.items[e].setHTMLStatus();
				}
			;});
			if(! pman.reName.rewrite) pman.reName.rewrite = true;
			return;
		}else{
			var backupValue = [];
			input.selection.forEach(function(e){
				var i = input.selection.indexOf(e);
				if(i < input.value.length){
					backupValue.push(pman.reName.items[e].text);
					pman.reName.items[e].text = input.value[i];
					pman.reName.items[e].setHTMLStatus();
				}
			;});
//			for (var i = 0; i < input.selection.length; i ++){
//				if(i < input.value.length){
//					backupValue.push(pman.reName.items[input.selection[i]].text);
//					pman.reName.items[input.selection[i]].text = input.value[i];
//				}
//			};
			return [
				[input.focus,input.selection],
				input.value,
				backupValue,
				input.selection
			];
		}
	}else if((input.command == 'hide')||(input.command == 'show')){
//隠蔽｜表示
/*
	pman.reName.itemPut({
		selection:[0,1],
		command:"hide"
	})
*/
//操作対象にグループアイテムが含まれている場合フラグを立てる
		var refreshStatus = false;
		if(undo){
//UNDO
			input.selection.forEach(function(e){
				var itm = pman.reName.getItem(e);
				if(itm instanceof pman.ReNameItem){
					if(itm.type == '-group-') refreshStatus = true;
					if(input.command == "hide"){
						itm.show();
					}else{
						itm.hide();
					};
				};
			;});
			if(refreshStatus) pman.reName.items.forEach(i=>i.setHTMLStatus());
			return;
		}else{
//DO
			input.selection.forEach(function(e){
				var itm = pman.reName.getItem(e);
				if(itm instanceof pman.ReNameItem){
					//backupValue.push(itm.hidden);
					if(itm.type == '-group-') refreshStatus = true;
					if(input.command == "hide"){
						itm.hide();
					}else{
						itm.show();
					};
				};
			;});
			if(refreshStatus) pman.reName.items.forEach(i=>i.setHTMLStatus());
			return [
				[input.focus,input.selection],
				null,
				null,
				input.selection
			];
		}
	}else if(input.command == 'order'){
console.log('order:');
//command:order はその時点の全てのアイテムの並びを与える selectionは考慮しない
		if(undo){
console.log('order:undo');
			pman.reName.rewrite = Array.from(input.backup,function(e){
				var ip  = e.item_path.split('_');
				var tgt = pman.reName.getItem(ip[0]);
				if(tgt){
					tgt.ip = ip;
					return tgt;
				}else{
					return {};//本来これは戻らない はず 
				};
			});
			pman.reName.items = Array.from(pman.reName.rewrite);
/*
			pman.reName.rewrite = [];
			input.backup.forEach(function(e){
				let ip  = e.item_path.split('_');
				var tgt = pman.reName.getItem(ip[0]);
				if(tgt){
					pman.reName.rewrite.push(tgt);
					tgt.ip = ip;
				};
			});// */
			pman.reName.reorderWithIP(function(){
				pman.reName.refreshItemlist(true);
			});
			return ;
		}else{
			var backupValue = Array.from(pman.reName.items,e => e.exportContent());
			pman.reName.rewrite = Array.from(input.value,function(e){
				var ip  = e.item_path.split('_');
				var tgt = pman.reName.getItem(ip[0]);
				if(tgt){
					tgt.ip = ip;
					return tgt;
				}else{
					return {};//本来これは戻らない はず 
				};
			});
			pman.reName.items = Array.from(pman.reName.rewrite);
			pman.reName.reorderWithIP(function(){
				pman.reName.refreshItemlist(true);
			});
			return [
				[input.focus,input.selection],
				input.value,
				backupValue,
				input.selection
			];
		};
	}else if((input.command == 'append')||(input.command == 'remove')){
//append|removeに際してはvalue配列の値はRenameItem の写像オブジェクトを使用
		if(undo){
			pman.reName.syncItems(input.backup);
			return;
		}else{
			var backupItems = Array.from(pman.reName.items);
//ここではredoのみを処理する 初回のappend|removeはそれぞれ別のメソッドが受け持ち、xUI.put経由でundoバッファの更新を行う
			pman.reName.syncItems(input.value);
//redoの際は戻り値を設定する
			return [
				[input.focus,input.selection],
				Array.from(pman.reName.items,pman.ReNameItem.duplicate),
				backupItems,
				input.selection
			];
		};
	}else if(input.command == 'remove'){
		if(undo){
			pman.reName.syncItems(input.backup);
			return;
		}else{
/*
	リムーブの引数は、アイテム(Object)|ID(String)|配列ID(Number)
*/
//{selection:[1,2,3]}
			var backupValue = Array.from(pman.reName.items, e => e.duplicate());//
			input.selection.forEach(function(e){
				let itm = pman.reName.getItem(e);
				if(itm) itm.remove();
			});
		};
//		if(! pman.reName.rewrite) pman.reName.rewrite = true;
//		if(pman.reName.pending) pman.reName.pending = false;
//		pman.reName.refreshItemlist(true);
		return [
			[input.focus,input.selection],
			Array.from(pman.reName.items, pman.ReNameItem.duplicate),
			backupValue,
			input.selection
		];
	};
//	if(! pman.reName.rewrite) pman.reName.rewrite = true;
//	if(pman.reName.pending) pman.reName.pending = false;
	pman.reName.refreshItemlist(true);
	return putResult;
}
/**
 *	@parame	{Array of pman.ReanemItem | Array of Number} members
 *	@params	{Boolean}	neg
 *	@params	{String}	command
 *	@returns undefined
 *	UNDO処理つきshow|hideメソッド
 *	members引数が与えられない場合はselectionを使用
 *	negオプションが与えられた場合はmembersのみを残して他を隠蔽｜隠蔽解除する(対象アイテムを反転)
 *	このメソッドでの unhide|shoe は隠蔽解除であり単独のアイテムに対する操作でなく　そのアイテムを含むツリーのパスに対する操作となる
 *	command文字列で "unhide"|"show" が与えられた場合表示操作となる pman.reName.show メソッドは無い
 *	フィルタメソッドは加算的にアイテムを隠蔽|表示するが、こちらはトグル動作的に 隠蔽｜解除 を行う
 *  構造的に非表示状態のアイテムを指定可能なので全数判定が必要

 *  hide 状態になったフォルダアイテム以下のアイテムをヒエラルキー的に隠す機能は、表示側で実装する

 *  フォルダアイテムの表示が切り替えられた場合は、配下の表示を更新のためrefreshItemlist(true)を呼ぶようにitemPutを調整
 コールするのは、refreshItemlistではなく 各アイテムの setHTMLStatusメソッドに変更
 */
pman.reName.hide = function hide(members,neg,action){
	if(typeof members == 'undefined') members = Array.from(pman.reName.selection);
	if(typeof action  == 'undefined') action  = 'hide';
	if(!(members instanceof Array)) members = [members];
//引数がIDのケースを想定してアイテムで再取得する
	members = Array.from(members,function(e){return pman.reName.getItem(e);});

	if((action != 'hide')||((action == 'hide')&&(neg))){
//parents メンバーのipをたどって上位のアイテムをすべてメンバーピックアップする
		var parents = [];
		for (var ix = 0 ; ix < members.length;ix ++){
			if(
				(members[ix].ip.length > 2)
			){
				for(var i = 1;i < (members[ix].ip.length - 1); i ++){
					parents.add(pman.reName.getItem(members[ix].ip[i]));
				};
			};
		};

//children 全メンバーを検査して下位のアイテムをすべてメンバーピックアップする
		var children = [];
		for (var ix = 0 ; ix < pman.reName.items.length;ix ++){
			if(
				(pman.reName.items[ix].ip.length != 1)&&
				(!(pman.reName.items[ix].hidden))&&
				(members.indexOf(pman.reName.items[ix]) < 0)
			){
				for(var i = 1;i < pman.reName.items[ix].ip.length ; i ++){
					if (members.indexOf(pman.reName.getItem(pman.reName.items[ix].ip[i])) >= 0){
						children.add(pman.reName.items[ix]);break;
					};
				};
			};
		};//
		parents.forEach(function(e){members.add(e)});
		children.forEach(function(e){members.add(e)});
	};
//選択を反転(ほかを隠す・ほかを表示) 
	if(neg)	members = pman.reName.items.filter(function(e){
			return ((e.ip.length > 1)&&(!(e.ip.hidden))&&(members.indexOf(e) < 0));
		});
	xUI.put({
		selection:members,
		command:((action == 'show')? 'show':'hide')
	});
}
/*TEST
	pman.reName.hide();//選択アイテムを隠す
	pman.reName.hide(undefined,true);//選択アイテム以外を隠す
	pman.reName.hide([],true,'unhide');//全アイテムを表示 
	pman.rename.hide(pman.reName.items,false,'show');//全アイテムを表示
隠れているアイテムを表示するにはfilterコマンドのほうが扱いやすい
	pman.reName.filter(function(e){return (e.hidden)},true);
*/
/**
 *	@parame	{Array of pman.ReanemItem | Array of Number} members
 *	@params	{Object pman.ReanemItem | Number}	moveTarget
 *	@params {String}	placement
 *	@returns undefined
 *	UNDO処理つきMOVEメソッド
 * オブジェクトメソッドをローレベルファンクションとしてこちらがそのラッパーとして機能する
 */
pman.reName.move = function move(members,moveTarget,placement){
//
console.log([members,moveTarget,placement]);
	if(!(members instanceof Array)) members = [members];
	members = Array.from(members,function(e){return pman.reName.getItem(e);});
	moveTarget = pman.reName.getItem(moveTarget);
	if(! moveTarget) moveTarget = -1;//戻値のケースが増えているので無効判定だけで良い
	if(! placement ) placement = 'PLACEBEFORE';
	var backupOrder = Array.from(pman.reName.items,function(e){return e.exportContent();});
	if(moveTarget == pman.reName.removedItems){
		if(members.indexOf(pman.reName.items[pman.reName.focus]) >= 0){
			pman.reName.focus = -1;//削除アイテム内にフォーカスある場合フォーカスクリア
		};
	};
	members.forEach(function(e){
		if(e instanceof pman.ReNameItem) e.move(moveTarget,placement);
	});
	pman.reName.itemAlignment(function(){
		xUI.put([new xUI.InputUnit(
			[pman.reName.focus,pman.reName.getSelected(true)],
			Array.from(pman.reName.rewrite,function(e){return e.exportContent();}),
			{
				target:xUI.activeDocument.content,
				dgb:"move-by-pman.reName.move",
				command:'order',
				focus:pman.reName.focus,
				selection:pman.reName.getSelected(true),
				backup:backupOrder
			}
		)],false,true);
		pman.reName.refreshItemlist(true);
	});
}
/**
	@params {Onject | String | Number} idf
	@returns {Object | undefined}
	アイテムまたは識別ID|アイテムオブジェクト本体を与えて該当のアイテムを返す
	アイテムの存在確認を兼ねるが、itemsは削除済みのアイテムを含むコレクションなので処理注意
	戻り値は Object pman.ReNameItem|pman.reName|pman.reName.removedItems
*/
pman.reName.getItem = function(idf,includeRemoved){
	if ((pman.reName.items.indexOf(idf) >= 0)||(idf === pman.reName)||(idf === pman.reName.removedItems)) return idf;//case pman.ReNameItem origin

	if (typeof idf == 'string') return pman.reName.items.find( e => e.id == idf );//case uniqe Id
	if(idf == -1) return pman.reName;//
	if(idf < -1)  return pman.reName.removedItems;//
	let result = pman.reName.items[idf];//case number as array index  pman.ReNameItem | undefined
	if(includeRemoved){
		return result;
	}else{
		if((result instanceof pman.ReNameItem)&&(result.ip.length > 1)) return result;
	};
	return undefined;
}
/**	エントリ｜ファイル｜パス｜URL|アイテム の配列を与えて登録
 *	@params {Array of (FileEntry|String|File|URL|Object pman.ReNameItem)} items
 *	@params {Function} callback
 *	@returns {Number}
 *			append count 追加に成功したアイテム数
 *	@returns {Array}
 *			array of new items 追加に成功したアイテムの配列
 *	ファイルオブジェクトに名前バッファ|選択フラグを追加
 *	すでに登録済みのアイテムまたは同じファイルを持ったアイテムは登録できない
 * 登録順でグループの取り違えが発生するバグあり 20220215
 * isUAFフラグ新規実装
 * 表示セッション全体がUAFか否かのフラグ
 * pman.reName.isUAF==true  の場合は、従来通りの動作
 * pman.reName.isUAF==false の場合は、UAFと判定されるフォルダをtype:-bundle-として登録する
 * type:-bundle- は、バンドルアセットで現在唯一のtype 'uaf'が実装されている　UAフォルダ配下のアイテムをひとまとめにして扱う
 UAFバンドルを取り扱い可能なアプリケーションは 今後実装

	引数アイテムの内、フォルダに相当するアイテムはグループとして初期化する
	アイテム第一パスで、グループアイテムをあらかじめ初期化-先行分のグループ再初期化を含む
		この時点で引数内のディレクトリ・エントリは排除
	ファイル・エントリをコレクションに追加する
 */
pman.reName.setItem = async function(items,callback){
console.log(items);
	if(! items) return 0;
//事前に現状のアイテム配列を保存
	var backupValue     = Array.from(pman.reName.items,e => e.duplicate());
	var backupSelection = [pman.reName.focus,pman.reName.getSelected(true)];
	var itemCount       = pman.reName.items.length;//現在のアイテム数を控え
//
	if((!(items instanceof FileList))&&(!(items instanceof Array))) items = [items];
	var newItems  = [];//挿入成功アイテムリスト
//引数アイテムを逐次処理
procItems:	{
	for (var i = 0 ; i < items.length ; i ++){
console.log(items[i]);
		if(items[i] instanceof pman.ReNameItem){
//オブジェクト化済アイテム
//アイテムが新規のバンドル・グループを持っている場合 登録
			if(!(pman.reName.getItem(items[i].parent))){
				newItems = newItems.concat(
					pman.reName.appendItems([items[i].patent],-1,'PLACEBEFORE')
				);//登録不正の場合は空配列が戻る
			};
//既存アイテムをスキップ
			if(pman.reName.getItem(items[i])) continue;
//UAFフラグが立っていない&&UAF配下のアイテムの場合処理をスキップして登録を行わない ?? 要再考
			if((!(pman.reName.isUAF))&&(items[i].ip.length>2)&&(items[i].parent.type=='-bundle-')){
				 continue;
			};
//これらは登録を行わないため画像読み込み自体が発生しない
			pman.reName.appendItems([items[i]],-1,'PLACEBEFORE');
			newItems.push(items[i]);
//画像読み出しキューに送る
			if((items[i].type == '-asset-')||((items[i].type == '-xpst-')&&(!(items[i].name.match( /\.(xps|xpst|tsh|ard|ardj|txt|text|csv|json|xdts|tdts)$/i ))))){
				pman.reName.imageLoadingStatus.count ++;//オブジェクト化済の全アイテム グループを含まない
				pman.reName.loadStatus('add count',items[i].name);
			};
		}else if(
			(items[i] instanceof File)||(items[i] instanceof URL)||(typeof items[i] == 'string')||(items[i].fullPath)
		){
//未オブジェクト化アイテム オブジェクト化して追加
//一旦アイテム化
			var item = new pman.ReNameItem(items[i],false);
console.log(item);
			item.parent = pman.reName;//一時参照 ルート
//無名アイテム・ドットファイル(隠しファイル)|拡張子（ドット）のないアイテムをスキップ グループ｜バンドルの対象エントリの多くはここで一旦排除され、後でパスから再登録される
//エントリのうち、拡張子状のドットを含む名をもつディレクトリは'-other-'エントリとして初期化されるので判別次第 group化するほうが良い
//initItemsを経て登録される場合のみ事前処理でバンドルコンテナが存在する
			if((! item.name)||(item.name.indexOf('.') <= 0)) continue;
//特定ファイル名のアイテムをスキップ
			if((item.path)&&(item.path.match(pman.reName.rejectRegex))) continue;
//処理アイテムの相対パスを確定
			if((item.path)&&(!item.relativePath)){
//				item.relativePath = nas.File.join(nas.File.basename(nas.File.dirname(item.path)),item.name).replace(/\\/g,'/');
				item.relativePath = nas.File.relative(pman.reName.baseFolder,item.path);//.replace(/\\/g,'/');
			};
console.log(item);
			let refPath = item.relativePath
			if(
				(item.path.indexOf(pman.reName.baseFolder) == 0)||(item.relativePath.indexOf(pman.reName.baseFolder) == 0)
			){
//この判定はbaseFolder直下に同名のフォルダがあるばあいに問題が発生する
//これを避けるためには　baseFolderを"/"+baseFoledeとして扱う必要がある
				refPath = nas.File.relative(pman.reName.baseFolder,item.path);
			};// */
console.log(item);
			var relative = new nas.File(refPath);//オブジェクト化する
/* //特定以深のアイテムをスキップ(排除)
	(isUAF) ベースから第３階層までを取得
	(!(isUAF)) 第７階層まで拡張（バンドルアイテムは、設定されたアイテム以外の配下のアイテムをitemsに入れない）
 */
			if(relative.body.length > ((pman.reName.isUAF)? 3:7)) continue;
			var group = false;
procGroups:		{
/*
得られた相対パスから、あらかじめグループ・バンドルを初期化
(=アイテムの相対パスをたどって空のグループツリーを作成)
事前に作成されたパスをスキップするために作成前に親を検索する

中間グループのうち "_(アンダーバー)"で開始するフォルダは基本的にその配下の読み込みをスキップする
_backyard _etc _pool ...  等のエントリー認可されたフォルダ以外、その配下のエントリはメンバーとして保持するが画像キャッシュ対象から外れる
また、指定のない限りフォルダの表示はされない

UAFバンドル下のグループは、最新ステージ配下のみをエントリーして、代表画像アイテムのみを画像キャッシュ
 */
			var currentParent = pman.reName;//初期状態(-1 == root)
			for(var p = 0;p < relative.body.length ;p ++){
				if(p == (relative.body.length - 1)){
//パス終端 バンドル判定
/*
	判定アイテムが存在するディレクトリはバンドル判定される
	バンドルでないフォルダにこれらのファイルを置いた際に問題が出るが、それは仕様上のものとする
	アンダーバーで開始されるフォルダ、ファイルは、判定対象外とする
	その他のアイテムは NOP
*/
					if((group)&&(group.name.match(/^[^_]/))){
						switch(item.type){
						case '-status-':
						case '-xmap-':
//console.log('detect UAF information');
							if((group) && (group.type=='-group-')){
//console.log(group);
								group.type = '-bundle-';
								group.initBundle('uaf',group.name);
								if(pman.reName.checkUBF(group)) group.hidden = true;
//								group.job   = item.name.replace(/(^__\[|\]\.*$)/g,"");
//								group.stage = group.job.split('+')[0];
							};
						break;
						};
						continue;
					};
				}else{
//終端到達前の途中グループが何らかの既存バンドルになる場合は、アイテムグループ処理を中断
					if((group)&&(group.type != '-group-')) break procGroups;//バンドル検出ブレーク
//中間層アイテムグループ登録
//	group = pman.reName.itemGetByRelativePath(relative.body.slice(0,p+1).join('/'));//type unix
//	group = pman.reName.itemGetByRelativePath(relative.body.slice(0,p+1).join('\\'));//type windows
					var relativePath =(relative.pathtype == 'win')?
						relative.body.slice(0,p+1).join('\\'):
						relative.body.slice(0,p+1).join('/');
					group = pman.reName.itemGetByRelativePath(relativePath);
					if(! group){
console.log('append new group for item : ' + relativePath);
						group = pman.reName.addGroup(relativePath,[],'-group-');
//グループが既存バンドルであった場合は、アイテム作成処理中断
						if(group.type != '-group-') break procGroups;
//node環境下ならここでpathを設定
						if((appHost.platform == 'Electron')&&(item.path)){
							var pathType = new nas.File(item.path).pathtype;
							group.path =(pathType != 'win')?
								item.path.split('/').slice(0,p+1-relative.body.length).join('/'):
								item.path.split('\\').slice(0,p+1-relative.body.length).join('\\');
						};
console.log(group);
console.log(currentParent);
						newItems.add(group);//既存アイテムは追加されない
						if(currentParent instanceof pman.ReNameItem) currentParent.insert(group);
/* ここのappendItemsは意味を持たない
						pman.reName.appendItems(
							[group],
							currentParent,
							'PLACEATBEGINNING'
						);
*/
//						group.parent = currentParent;
					}else{
console.log('group exists :' + group.path);
					};
				};
//終端到達前の途中グループが何らかの既存バンドルであった場合は、アイテムグループ処理を中断
				if(group.type != '-group-') break procGroups;
				currentParent = group;
			};
		};// procGroups
//第２階層以深のアイテムは、第１階層から順次グループを作成して登録トライ
/*
length == 4
	0:     1:     2:        3:
	s-c012/0__0CT/_backyard/s-c012.psd
	0:ROOT アイテムは作成しない
	1:~
	さらに下層が存在すればグループアイテム作成をトライ
	最下層の場合はアイテムとして登録
	アイテムが -status-||-xmap- のケースではグループはいったんtype:-bundle-としてエントリする
	既存グループならば -bundle-に再イニシャライズする
 */
console.log('has parent items:'+item.relativePath);
console.log('item type:'+item.type);
console.log('isUAF type:'+pman.reName.isUAF);
//			var parentName = String(relativePath.slice(0,-1).reverse()[0]);//?使わないでOK

			if((!(pman.reName.isUAF))&&((item.type == '-xmap-')||(item.type == '-status-'))){
//			if((!(pman.reName.isUAF))&&((item.type != '-group-')||(item.type != '-bundle-'))){}
//uaf判定アイテム
//判定アイテムをアイテムストアとuafバンドルのメンバに追加される
//判定アイテム自体はアイテムストアに追加されないが、uafバンドルのメンバには追加される
/*
	判定アイテム status.txt|.xmap が存在するディレクトリはUAF判定される
*/
console.log('append UAF metadata item continue');
				if((group)&&(group.type == '-bundle-')){
//					item.parent = group;
//					group.members.add(item);
					pman.reName.appendItems(
						[item],
						group,
						'PLACEATBEGINNING'
					);
//					group.setBundleMember(item);
					if(group.bundleInf == null){
						group.initBundle();
					};
					continue;
				};
			}else{
				if(group){
console.log(group);
					if(group.type != '-group-'){
						if(group.type == '-bundle-'){
/*
// UAFバンドルの場合は、ステータスを確認して最終ステージのアイテムのみを読み込む
// アイテムに以下の情報が必要
	line,stage,job
	ステージ情報・ジョブ情報はステータスファイルから読む
	ステータスオブジェクトの構造は
	status:{
		line:"0.(trunk)",
		stage:"2.LO",
		job:"0(trunk)",
	}
	グループの本線ステージをあらかじめ取得
	対応するステージフォルダの配下のアイテムだけをmembersへ加え それ以外はスキップ
	バンドルアイテム処理用 オブジェクトメソッドを設定してアイテムを順次リレーする
*/
							group.setBundleMember(item);
						};
						continue ;
					};
//中間グループの終端アイテム
					pman.reName.appendItems(
						[item],
						group,
						'PLACEATBEGINNING'
					);
				}else{
//rootグループのアイテム
					pman.reName.appendItems(
						[item],
						-1,
						'PLACEATBEGINNING'
					);
				};
//
				newItems.push(item);//
//画像キャッシュキューに追加
				if((item.type == '-asset-')||((item.type == '-xpst-')&&(!(item.name.match( /\.(xps|xpst|tsh|ard|ardj|txt|text|csv|json|xdts|tdts)$/i ))))){
					pman.reName.imageLoadingStatus.count ++;//新規に初期化されたアイテム
					pman.reName.loadStatus('add count',item.name);
				};
			};
		};
	};//アイテム逐次処理
};//procItems
//console.log(newItems);
//アイテム変動（追加）があれば画面更新
	if((itemCount != pman.reName.items.length)&&(true)){
//undo処理
//バックアップは現行全アイテムの複製リスト
		pman.reName.refreshItemlist(true,function(){
			xUI.put([new xUI.InputUnit(
				backupSelection,
				Array.from(pman.reName.items,pman.ReNameItem.duplicate),
				{
					target    :xUI.activeDocument.content,
					command   :"append",
					backup    :backupValue,
					selection :pman.reName.getSelected(true)
				}
			)],false,true);
		});
//自動ソート
//		if(pman.reName.sortAuto) pman.reName.itemSort(true,false);
		pman.reName.itemSort();
	};
	if(callback instanceof Function){callback(newItems)};
	return newItems;
}
/* TEST
	pman.reName.setItem()
*/
// pman.reName.setItem //

/*
 *	アイテムパス再構築
 *	ipが初期設定と異なる構造になったためこの関数は不要 220420
0_
1_0_
2_0_
3_
4_3_
5_3_
 */
/*
pman.reName.rebuildIP = function(){
	pman.reName.items.sort(pman.reName.sortWithIP);
	var insPt = -1
	for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if(pman.reName.items[i].ip.length == 3){insPt++;}else{insPt = -1;}
		if(
			(pman.reName.items[i].ip[1] ==  pman.reName.items.indexOf(pman.reName.items[i].parent))||
			((pman.reName.items[i].ip[1] == '')&&(pman.reName.items[i].parent === pman.reName))
		) continue;
		var parentGroup = (pman.reName.items[i].ip[1] == '')? pman.reName : pman.reName.items[pman.reName.items[i].ip[1]];
		pman.reName.items[i].parent.members.splice(pman.reName.items[i].parent.members.indexOf(pman.reName.items[i]),1);
		pman.reName.items[i].parent = parentGroup;
		parentGroup.members.add(pman.reName.items[i]);
	}
	pman.reName.members.forEach(function(e){if(e.type == '-group-') e.members.sort(pman.reName.sortWithIP)});
}// */
/*
 *	アイテムに登録されたデータファイルの更新を逐次確認する
 *	
 */
pman.reName.checkItemSource = function (){
//	if(! pman.reName.pending) pman.reName.pending = true;
	for (var i = 0 ; i < pman.reName.members.length ; i ++){
//		pman.reName.members[i].update();
		pman.reName.members[i].checkItemStatus();
	};
//	pman.reName.pending = false;
}
/*	
 *	アイテムを引数に画像読み込みキューを処理する
 */
pman.reName.loadQueueImage = function(){
	var maxCount = 5;//最大同時読み込みプロセス数
	if(
		(pman.reName.loadQueue.length)&&
		(pman.reName.imageLoadingStatus.loading < maxCount)
	){
		if(pman.reName.loadQueue[0].name.match(pman.reName.imageRegex)){
console.log('loading :' + pman.reName.loadQueue[0].name);
console.log(pman.reName.loadQueue[0]);
			pman.reName.loadQueue[0].setImage(undefined,true,function(i){i.setThumbnail(true);});
		}else{
			pman.reName.loadQueue.shift();
		};
	};
}
/**
 *	@params  {Boolean} enforcement
 *		保留条件に関わらず強制的に更新を実行
 *	@params  {Function} callback
 *		更新時に実行
 *
 *	アイテムリスト表示更新
 *	itemID "rename_item_#g[_#i]"
 *  自動ソートを別メソッドに分離(済)
 *	ステータスのみ 	status
 *	並べ替え			order
 *	追加、削除
 削除済アイテムがコレクション内に混在するので要注意
  バンドルアイテム導入のため再表示アルゴリズムに修正
 */
pman.reName._refreshItemlist = function(enforcement,callback){
	pman.reName.loadQueueImage();
//表示可能アイテムでキャッシュ未処理のものがある場合プログレス表示を行う
	var statusText = "";
	if(
		(pman.reName.imageLoadingStatus.count)&&
		(pman.reName.imageLoadingStatus.count <= (
			pman.reName.imageLoadingStatus.loaded+pman.reName.imageLoadingStatus.error
		))
	){
		pman.reName.imageLoadingStatus.count = 0;//カウンタリセット
		xUI.printStatus('');
		pman.reName.pending = false;
		pman.reName.setPreview(pman.reName.focus);
		enforcement = true;
	};
//pending状態を確認 して処理分岐 pendingはrewriteに優先する
	if((! enforcement)&&(pman.reName.pending)) return true;
//UI上のサムネイルの表示指定を確認して異なっていれば更新する
	pman.reName.switchThumbnail(pman.reName.thumbnailStat);
	pman.reName.setThumbnailSize();
//復帰のためのバッファ
	var selectedItems = pman.reName.selection;
	var focusedItem   = pman.reName.items[pman.reName.focus];
//必要があればアイテム表示HTMLエレメント描画
/*
 *	pman.reName.rewrite 配列		ソート後のアイテムが配置されている
 *	pman.reName.rewrite == true	書き直しフラグ
 */
	if((pman.reName.rewrite instanceof Array)&&(pman.reName.rewrite.length == pman.reName.items.length)){
//console.log(pman.reName.rewrite);
		for (var i = 0 ; i < pman.reName.rewrite.length ; i ++){
			if(pman.reName.rewrite[i] === pman.reName.items[i]) continue; //同オブジェクトの参照なのでスキップ
			pman.reName.items[i] = pman.reName.rewrite[i];                //変更アイテムへ置き換え
			pman.reName.items[i].setHTMLElementContent(i);                //htmlコンテントの書き直し
			pman.reName.items[i].setHTMLStatus(i);                        //スターテス更新
		};//削除アイテムが後方へまとめられていないケースでも動作するように調整が必要？
		
		pman.reName.rewrite = false;
	}else if(pman.reName.rewrite){
//console.log((pman.reName.rewrite instanceof Array)?pman.reName.rewrite.join().split(','):pman.reName.rewrite);
//console.log(pman.reName.items.join().split(','));
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
			if(pman.reName.items[i].ip.length == 1) continue;//削除済アイテムをスキップ
			var itmThumbnail = document.getElementById('thumbnail_rename_item_'+i);
			if(!(itmThumbnail)) continue;
			pman.reName.items[i].setHTMLElementContent(i);              //htmlコンテントの書き直し
			pman.reName.items[i].setHTMLStatus(i);                      //スターテス更新
		};
		pman.reName.rewrite = false;
	};
//	pman.reName.items.forEach(e => e.getPath());//
	if(enforcement){
//console.log('content enforcement rewrite');
		var content = "";
//アイテムリストコンテナを作成
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
console.log('items-idx:'+i);
			if(
				(pman.reName.items[i].ip.length == 1)||
				(pman.reName.items[i].parent.type == '-bundle-')
			) continue;//削除済アイテム||UAF内包アイテムをスキップ

			content += '<div id="cnt_rename_item_'+i+'" draggable=true class="elementContainer';
			if(pman.reName.items[i].members instanceof Array){
//console.log(pman.reName.items[i].type);
//console.log(pman.reName.items[i]);
				if(pman.reName.items[i].type == '-group-'){
					content += ' elementContainerGroup';
					if(pman.reName.items[i].close){
						content += (pman.reName.items[i].members.length)?
						' elementContainerGroup-close':' elementContainerGroup-empty';
					}else{
						content += (pman.reName.items[i].members.length)?
						' elementContainerGroup-open':' elementContainerGroup-blank';
					};
				}else if(pman.reName.items[i].type == '-bundle-'){
					content += ' elementContainerUAF';
				};
//			}else{
//Normal ItemNOP
			};
			content += '">';
			content += pman.reName.items[i].toHTMLContent();
			content += '<hr></div>';
		}
		content += '<div class=endSign>end</div>';
		document.getElementById('itemList').innerHTML = content;	
//
		document.getElementById('basefolder').title   = pman.reName.baseFolder;
		document.getElementById('basefolder').innerHTML = ' [ '+((pman.reName.baseFolder)?nas.File.basename(pman.reName.baseFolder):"--------")+' ] ';
//
		document.getElementById('basefolder_reName_status').innerHTML =  'select '+selectedItems.length+' / '+pman.reName.items.length+' items : ';
//-----------------------------//エレメント用イベントリスナを更新
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
			if(
				(pman.reName.items[i].ip.length == 1)||
				(pman.reName.items[i].parent.type == '-bundle-')
			) continue;//削除済アイテムをスキップ
			var itmTrailer = document.getElementById(["cnt_rename_item",i].join('_'));
console.log(itmTrailer);
if(itmTrailer){
}else{
	console.log(pman.reName.items[i]);
};

//drag start
			itmTrailer.addEventListener('dragstart',function () {
				event.dataTransfer.setData('text/plain', event.target.id);
				var itm = pman.reName.items[pman.reName.parseId(event.target.id)];
				if(!(itm.selected)) pman.reName.check(event);
			},false);
//drag over
			itmTrailer.addEventListener('dragover',function () {
				event.preventDefault();
				if (pman.reName.items[pman.reName.parseId(this.id)].type == '-group-'){
					if (event.offsetX < 52){
						this.style.border = '3px solid white';
					}else{
						if(event.layerY < (event.target.clientHeight/2)){
							this.style.borderWidth = '3px 0 0 0';
							this.style.borderTop = '3px solid #4444FF';
						}else{
							this.style.borderWidth = '0 0 3px 0';
							this.style.borderBottom = '3px solid #4444FF';
						};
					};
				}else{
					if(event.layerY < (event.target.clientHeight/2)){
						this.style.borderWidth  = '3px 0 0 0';
						this.style.borderTop    = '3px solid #4444FF';
					}else{
						this.style.borderWidth  = '0 0 3px 0';
						this.style.borderBottom = '3px solid #4444FF';
					};
				};
			},false);
//drag leave
			itmTrailer.addEventListener('dragleave',function () {
				if (pman.reName.items[pman.reName.parseId(this.id)].type == '-group-'){
					this.style.border = '';
				}else{
					this.style.borderWidth  = '';
					this.style.borderTop    = '';
					this.style.borderBottom = '';
				};
			},false);
//drop
			itmTrailer.addEventListener('drop',function (e) {
console.log(e);
console.log('droped to : ' + event.target.id);
				event.stopPropagation();event.preventDefault();
				document.body.style.background = '';
				let tgtID = (event.target.id)? pman.reName.parseId(event.target.id):pman.reName.parseId(event.composedPath()[1].id);
				let id = pman.reName.parseId(event.dataTransfer.getData('text/plain'));

//console.log([pman.reName.items[id].text,pman.reName.items[tgtID].text]);
//var backupOrder = Array.from(pman.reName.items,function(e){return e.exportContent();});
//var moveCount = 0;
				let selectedItems = pman.reName.selection;
				let targetItem    = pman.reName.getItem(tgtID);
				let placement     = ((targetItem.type == '-group-')&&(event.offsetX < 52))?'INSIDE':(
					(event.layerY < (event.target.clientHeight/2))? 'PLACEBEFORE':'PLACEAFTER'
				);
				if(selectedItems.length > 1){
//console.log([selectedItems,targetItem,placement]);
					pman.reName.move(selectedItems,targetItem,placement);
					//selectedItems.forEach(function(elm){
					//	if(elm.move(targetItem,placement)) moveCount++;
					//});
				}else if(tgtID != id){
					 pman.reName.move([id],targetItem,placement);
					//if(pman.reName.items[id].move(targetItem,placement)) moveCount ++;
				};
/*
//アイテム変動があれば画面更新
				if(moveCount){
//undo用のinputUnitを初期化する
					var undoInfo = new xUI.InputUnit(
						[pman.reName.focus,pman.reName.getSelected(true)],
						Array.from(pman.reName.items,function(e){return e.exportContent();}),
						{
							dbg:'drag-move-input',
							command:"order",
							backup:backupOrder,
							selection:pman.reName.getSelected(true)
						}
					);
//undopush
					xUI.activeDocument.undoBuffer.undoPt++;
					xUI.undoGc=0;
					xUI.activeDocument.undoBuffer.undoStack[xUI.activeDocument.undoBuffer.undoPt] = [undoInfo];
//list refresh
					pman.reName.pending = false;//ドラグ移動終了で保留解除
					pman.reName.refreshItemlist(true);
				};// */
//				pman.reName.pending = false;//ドラグ移動終了で保留解除
				if (pman.reName.items[pman.reName.parseId(this.id)].type == '-group-'){
					this.style.border = '';
				}else{
					this.style.borderTop = '';
					this.style.borderBottom = '';
				};
			},false);
//入力リスナ
			document.getElementById(["ipt_rename_item",i].join('_')).addEventListener('input',pman.reName.updatePreviewText,false);
			pman.reName.items[i].setHTMLStatus();
		};
//-----------------------------エレメント用イベントリスナを更新//
//		pman.reName.rewrite = false;
	};

//画面描画のあとステータスを更新
/*	for (var i = 0 ; i < pman.reName.items.length ; i ++){
		var currentItem = pman.reName.items[i];
		currentItem.setHTMLStatus();
	};//*/
	pman.reName.focus = pman.reName.items.indexOf(focusedItem);
//アイテムプロパティ更新 HTMLリライト直後は不要
	if(pman.reName.rewrite){
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if(
			(pman.reName.items[i].ip.length == 1)||
			(pman.reName.items[i].parent.type == '-bundle-')
		) continue;//削除済アイテムをスキップ
			var currentItem = pman.reName.items[i];
			var itemID      = ["rename_item",i].join('_');
//グループ｜アイテム共通
			if(document.getElementById(itemID).innerText != nas.File.basename(currentItem.path))
				document.getElementById(itemID).innerText  = nas.File.basename(currentItem.path);//ファイル名更新
			document.getElementById("ckb_"+itemID).checked = (currentItem.selected)? true:false;//チェック同期
			if(document.getElementById("ipt_"+itemID).value != currentItem.text)
				document.getElementById("ipt_"+itemID).value  = currentItem.text;//インプットのリセット・同期
			if(currentItem.type == '-group-'){
//グループ
				currentItem.sWitchClose(currentItem.close);
			}else{
//アイテム
				var thumbnail   = document.getElementById('thumbnail_' + itemID);
				if(thumbnail.src != currentItem.img.src) thumbnail.src = currentItem.img.src;
				thumbnail.title = (currentItem.path)? currentItem.path:currentItem.name;
			};
		};
	};
//サムネイルの表示状態更新する
	pman.reName.switchThumbnail(pman.reName.thumbnailStat);
	pman.reName.setThumbnailSize();
	for (var i = 0; i < pman.reName.items.length ; i++){
		if(
			(pman.reName.items[i].ip.length == 1)||
			(pman.reName.items[i].parent.type == '-bundle-')
		) continue;//削除済アイテム・バンドルアイテムをスキップ
//選択状態を復帰
		let isOvl = (pman.reName.items[i].isOvl());
		let isUdl = (pman.reName.items[i].isUdl());
		if(pman.reName.items[i].selected){
			if((pman.reName.lightBox.overlay)&&(isOvl)){
				nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay-selected');
			}else{
				nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-selected');
			};
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-selected');
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay-selected');
		};
//フォーカス状態を復帰
		if(pman.reName.focus == i){
			nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-focus');
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-focus');
		};
//オーバレイ状態を復帰
		if((pman.reName.lightBox.overlay)&&(isOvl)){
			nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay');
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay');
		};
//アンダーレイ状態を復帰
		if((isUdl)){
			nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-underlay');
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-underlay');
		};
	};
//全体ステータス更新
	document.getElementById('basefolder_reName_status').innerText = nas.localize(' select %1 / %2 items :', selectedItems.length , pman.reName.items.length);
	pman.reName.rewrite = false;//更新フラグを下げる
//	pman.reName.pending = false;//保留フラグは自動で下げない　プロセスが下げる
// exec callback if exists
	if(callback instanceof Function) callback();
}



/** (ツリー表示対応版)
 *	@params  {Boolean} enforcement
 *		保留条件に関わらず強制的に更新を実行
 *	@params  {Function} callback
 *		更新時に実行
 *
 *	アイテムリスト表示更新
 *	itemID "rename_item_#g[_#i]"
 *  自動ソートを別メソッドに分離(済)
 *	ステータスのみ 	status
 *	並べ替え			order
 *	追加、削除
 削除済アイテムがコレクション内に混在するので要注意
  バンドルアイテム導入のため再表示アルゴリズムに修正
 */
pman.reName.refreshItemlist = function(enforcement,callback){
	pman.reName.loadQueueImage();
//表示可能アイテムでキャッシュ未処理のものがある場合プログレス表示を行う
	var statusText = "";
	if(
		(pman.reName.imageLoadingStatus.count)&&
		(pman.reName.imageLoadingStatus.count <= (
			pman.reName.imageLoadingStatus.loaded+pman.reName.imageLoadingStatus.error
		))
	){
		pman.reName.imageLoadingStatus.count = 0;//カウンタリセット
		xUI.printStatus('');
		pman.reName.pending = false;
		pman.reName.setPreview(pman.reName.focus);
		enforcement = true;
	};
//pending状態を確認して処理分岐 pendingはrewriteに優先する
	if((! enforcement)&&(pman.reName.pending)) return true;
//UI上のサムネイルの表示指定を確認して異なっていれば更新する
	pman.reName.switchThumbnail(pman.reName.thumbnailStat);
	pman.reName.setThumbnailSize();
//復帰のためのバッファ
	var selectedItems = pman.reName.selection;
	var focusedItem  = pman.reName.items[pman.reName.focus];

//必要があればアイテム表示HTMLエレメント描画
/*
 *	pman.reName.rewrite 配列		ソート後のアイテムが配置されている
 *	pman.reName.rewrite == true	書き直しフラグ
 */
	if((pman.reName.rewrite instanceof Array)&&(pman.reName.rewrite.length == pman.reName.items.length)){
//console.log(pman.reName.rewrite);
		for (var i = 0 ; i < pman.reName.rewrite.length ; i ++){
			if(pman.reName.rewrite[i] === pman.reName.items[i]) continue; //同オブジェクトの参照なのでスキップ
			pman.reName.items[i] = pman.reName.rewrite[i];                //変更アイテムへ置き換え
			pman.reName.items[i].setHTMLElementContent(i);                //htmlコンテントの書き直し
			pman.reName.items[i].setHTMLStatus(i);                        //スターテス更新
		};//削除アイテムが後方へまとめられていないケースでも動作するように調整が必要？
		
		pman.reName.rewrite = false;
	}else if(pman.reName.rewrite){
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
			if(
				(pman.reName.items[i].ip.length == 1)||
				(pman.reName.items[i].parent.type == '-bundle-')
			) continue;//削除済アイテムをスキップ
			var itmThumbnail = document.getElementById('thumbnail_rename_item_'+i);
			if(!(itmThumbnail)) continue;
			pman.reName.items[i].setHTMLElementContent(i);              //htmlコンテントの書き直し
			pman.reName.items[i].setHTMLStatus(i);                      //スターテス更新
		};
		pman.reName.rewrite = false;
	};
	if(enforcement){
//console.log('content enforcement rewrite');
		var content = '<ul class="tree">';
//アイテムリストコンテナを作成
		for (var i = 0 ; i < pman.reName.members.length ; i ++){
			var currentItem = pman.reName.members[i];
			content += currentItem.toHTMLContent_();//ツリー表示対応版再起呼び出し型メソッド
		};
		content += '</ul>'

		content += '<div class=endSign>end</div>';
		document.getElementById('itemList').innerHTML = content;	
//
		document.getElementById('basefolder').title   = pman.reName.baseFolder;
		document.getElementById('basefolder').innerHTML = ' [ '+((pman.reName.baseFolder)?nas.File.basename(pman.reName.baseFolder):"--------")+' ] ';
//
		document.getElementById('basefolder_reName_status').innerHTML =  'select '+selectedItems.length+' / '+pman.reName.items.length+' items : ';
//-----------------------------//エレメント用イベントリスナを更新
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
			if(
				(pman.reName.items[i].ip.length == 1)||
				(pman.reName.items[i].parent.type == '-bundle-')
			) continue;//削除済アイテムをスキップ hiddenアイテムはエレメント更新

			var itmTrailer = document.getElementById(["cnt_rename_item",i].join('_'));
console.log(pman.reName.items[i]);
if(itmTrailer){
//drag start
			itmTrailer.addEventListener('dragstart',function () {
				event.dataTransfer.setData('text/plain', event.target.id);
				var itm = pman.reName.items[pman.reName.parseId(event.target.id)];
				if(!(itm.selected)) pman.reName.check(event);
			},false);
//drag over
			itmTrailer.addEventListener('dragover',function () {
				event.preventDefault();
				if (pman.reName.items[pman.reName.parseId(this.id)].type == '-group-'){
					if (event.offsetX < 52){
						this.style.border = '3px solid white';
					}else{
						if(event.layerY < (event.target.clientHeight/2)){
							this.style.borderWidth = '3px 0 0 0';
							this.style.borderTop = '3px solid #4444FF';
						}else{
							this.style.borderWidth = '0 0 3px 0';
							this.style.borderBottom = '3px solid #4444FF';
						};
					};
				}else{
					if(event.layerY < (event.target.clientHeight/2)){
						this.style.borderWidth  = '3px 0 0 0';
						this.style.borderTop    = '3px solid #4444FF';
					}else{
						this.style.borderWidth  = '0 0 3px 0';
						this.style.borderBottom = '3px solid #4444FF';
					};
				};
			},false);
//drag leave
			itmTrailer.addEventListener('dragleave',function () {
				if (pman.reName.items[pman.reName.parseId(this.id)].type == '-group-'){
					this.style.border = '';
				}else{
					this.style.borderWidth  = '';
					this.style.borderTop    = '';
					this.style.borderBottom = '';
				};
			},false);
//drop
//トレーラーアイテムに対するドロップにファイルアイテムを加える必要あり アイテムの後方に新規のアイテムを作成して挿入
			itmTrailer.addEventListener('drop',function (e) {

return;
				event.stopPropagation();event.preventDefault();
				document.body.style.background = '';

console.log('droped to itmTrailer');
console.log(event);
//イベントターゲット
				let tgtID = (event.target.id)? pman.reName.parseId(event.target.id):pman.reName.parseId(event.composedPath()[1].id);
//ドラグされたアイテムidをdataTransferから取得
				let id = pman.reName.parseId(event.dataTransfer.getData('text/plain'));
//複数選択アイテム
				let selectedItems = pman.reName.selection;
//ドロップターゲットアイテムを確定
				let targetItem    = pman.reName.getItem(tgtID);
//配置を取得
				let placement     = ((targetItem.type == '-group-')&&(event.offsetX < 52))?'INSIDE':(
					(event.layerY < (event.target.clientHeight/2))? 'PLACEBEFORE':'PLACEAFTER'
				);
//アイテム移動
				if(selectedItems.length > 1){
					pman.reName.move(selectedItems,targetItem,placement);
				}else if(tgtID != id){
					 pman.reName.move([id],targetItem,placement);
				};
//ホット表示をクリア
				if (pman.reName.items[pman.reName.parseId(this.id)].type == '-group-'){
					this.style.border = '';
				}else{
					this.style.borderTop = '';
					this.style.borderBottom = '';
				};
			},false);
//click
//
			itmTrailer.addEventListener('click',function (e){
//				alert('click : '+this.children[0].open);
			},false);
//入力リスナ
			document.getElementById(["ipt_rename_item",i].join('_')).addEventListener('input',pman.reName.updatePreviewText,false);
			pman.reName.items[i].setHTMLStatus();
		};
};//トレーラーがある場合のみ更新
//-----------------------------エレメント用イベントリスナを更新//
	};
	pman.reName.focus = pman.reName.items.indexOf(focusedItem);
//アイテムプロパティ更新 HTMLリライト直後は不要
	if(pman.reName.rewrite){
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if(
			(pman.reName.items[i].ip.length == 1)||
			(pman.reName.items[i].parent.type == '-bundle-')
		) continue;//削除済アイテムをスキップ
			var currentItem = pman.reName.items[i];
			var itemID      = ["rename_item",i].join('_');
//グループ｜アイテム共通
			if(document.getElementById(itemID).innerText != nas.File.basename(currentItem.path))
				document.getElementById(itemID).innerText  = nas.File.basename(currentItem.path);//ファイル名更新
			document.getElementById("ckb_"+itemID).checked = (currentItem.selected)? true:false;//チェック同期
			if(document.getElementById("ipt_"+itemID).value != currentItem.text)
				document.getElementById("ipt_"+itemID).value  = currentItem.text;//インプットのリセット・同期
			if(currentItem.type == '-group-'){
//グループ
				currentItem.sWitchClose(currentItem.close);
			}else{
//アイテム
				var thumbnail   = document.getElementById('thumbnail_' + itemID);
				if(thumbnail.src != currentItem.img.src) thumbnail.src = currentItem.img.src;
				thumbnail.title = (currentItem.path)? currentItem.path:currentItem.name;
			};
		};
	};
//サムネイルの表示状態更新する
	pman.reName.switchThumbnail(pman.reName.thumbnailStat);
	pman.reName.setThumbnailSize();
	for (var i = 0; i < pman.reName.items.length ; i++){
		if(
			(pman.reName.items[i].ip.length == 1)||
			(pman.reName.items[i].parent.type == '-bundle-')
		) continue;//削除済アイテムをスキップ
//選択状態を復帰
		let isOvl = (pman.reName.items[i].isOvl());
		let isUdl = (pman.reName.items[i].isUdl());
		if(pman.reName.items[i].selected){
			if((pman.reName.lightBox.overlay)&&(isOvl)){
				nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay-selected');
			}else{
				nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-selected');
			};
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-selected');
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay-selected');
		};
//フォーカス状態を復帰
		if(pman.reName.focus == i){
			nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-focus');
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-focus');
		};
//オーバレイ状態を復帰
		if((pman.reName.lightBox.overlay)&&(isOvl)){
			nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay');
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-overlay');
		};
//アンダーレイ状態を復帰
		if((isUdl)){
			nas.HTML.addClass(   document.getElementById('cnt_rename_item_'+i),'elementContainer-underlay');
		}else{
			nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-underlay');
		};
	};
//全体ステータス更新
	document.getElementById('basefolder_reName_status').innerText = nas.localize(' select %1 / %2 items :', selectedItems.length , pman.reName.items.length);
	pman.reName.rewrite = false;//更新フラグを下げる
// exec callback if exists
	if(callback instanceof Function) callback();
}

// ======== pman.reName.refreshItemlist//
/**
 *  @params {Event} evt
 *       プレビューエリア用アイテムテキストボックス更新
 */
pman.reName.updatePreviewText = function updatePreviewText(evt){
    var idx = pman.reName.parseId(evt.target.id);
    if(idx != pman.reName.focus) return;
    document.getElementById("previewheader_reName_text").value = evt.target.value;
}
/**
 *   @params {String} stage
 *	設定データのステージグループキーワード
 *   プレフィクス連番ボタンスイッチを描画
 */
pman.reName.drawPrefix = function(stage){
	if(! stage) stage = 'LO';
	var buttonList = pman.reName.prefix[stage];
	if(! buttonList) buttonList = pman.reName.prefix['LO'];
	var result = "";
//prefix button
	for (var i = 0 ; i < buttonList.length ; i ++){
		var currentItem = buttonList[i];
		if(buttonList[i].length == 0){
			result += "<button class='fileRenamer-button' onclick='pman.reName.setName(false)'";
			result += "><span style='color:#aaaaaa'>(reset)</span></button>";
		}else{
			result += "<button class='fileRenamer-button' onclick='pman.reName.setName(this.innerText)'";
			result += ">"+ buttonList[i] +"</button>";
		}
	};
	document.getElementById('rename_prefix_column').innerHTML = result;
	return stage;
}

/**
 *   @params {String} set
 *	設定データセットキーワード
 *   ポストフィックス編集ボタンスイッチを描画
 */
pman.reName.drawPostfix = function(set){
	if(! set) set = 'check';
	var buttonList = pman.reName.postfix[set];
	if(! buttonList) buttonList = pman.reName.postfix['check'];
	var result = "";
//postfix button
	for (var i = 0 ; i < buttonList.length ; i ++){
		var currentItem = buttonList[i];
		if(buttonList[i].length == 0){
			result += "<button class='fileRenamer-button fileRenamer-button-suffix' onclick='pman.reName.setName(false,true)'";
			result += "><span style='color:#aaaaaa'>(reset)</span></button>";
		}else{
			result += "<button class='fileRenamer-button fileRenamer-button-suffix' onclick='pman.reName.setName(this.innerText,true)'";
			result += ">"+ buttonList[i] +"</button>";
		}
	};
	document.getElementById('rename_postfix_column').innerHTML = result;
	return set;
}
/**
 *	pman.reName.selection の値と関連する画面表示を更新
 *	@retuens	{pman.reName.selection}
 *	アイテムリストの状態を確認して選択アイテムリスト pman.reName.selection を更新
 *	pman.reName.selectionプロパティを返す
 */
pman.reName.syncSelection = function(){
	if(pman.reName.items.length == 0) return [];
	pman.reName.selection = pman.reName.items.filter(function(e){
//隠しアイテムと削除済みアイテムを除外
		return ((e.ip.length > 1)&&(!(e.hidden))&&(e.selected));
	});
	document.getElementById('basefolder_reName_status').innerText = nas.localize(' select %1 / %2 items :', pman.reName.selection.length , pman.reName.items.length);
	return pman.reName.seletion;
};//
/**
 *	@params	{Boolean}	byInt
 *		アイテムでなく整数IDの配列を要求するフラグ
 *	@retuens	{Array}
 *	アイテムリストの状態を確認して選択アイテムリスト selection を更新して返す
 *	byIntフラグがあればチェック済みアイテムのIDを配列で戻す
 */
pman.reName.getSelected = function(byInt){
	pman.reName.syncSelection();
	if(byInt){
		return Array.from(pman.reName.selection,function(e){return pman.reName.items.indexOf(e)});
	};
	return Array.from(pman.reName.selection);
}
/**
 *	@params {Array of pman.ReNameItem|String|Number} removeList
 *	@params {Boolean}	withMembers
 * アイテムリストから指定のアイテムを削除する
 *	undo処理つき
 *	引数が未指定の場合は、現在選択されているアイテムを削除
 *	引数リストはアイテムの配列|アイテム整数IDの配列|IDリスト表現文字列
 *		削除後のアイテムの写像リストを作成して、それを入力としてpman.reName.itemPutに渡す
 *	moveメソッドが削除に対応済み
 *	このメソッドはmoveメソッドのラッパとして残置される
 *	オプションwithMembersで、アイテム配下のメンバーアイテムを同時に削除するか否かを指定可能
 */
pman.reName.remove = function(removeList,withMembers){
	if(pman.reName.items.length == 0)    return;

//console.log(removeList,withMembers)
//if(! widthMembers)

//現状の保存
//	var selectedItem = [pman.reName.focus,pman.reName.getSelected(true)];
//	var backupItems   = Array.from(pman.reName.items,pman.ReNameItem.duplicate);

	if(typeof removeList == 'undefined') removeList = pman.reName.selection;
	if(!(removeList instanceof Array))   removeList = [removeList];

	return pman.reName.move(removeList,pman.reName.removedItems,'PLACEATEND');


//	pman.reName.select(null);//いったんセレクトを外す
//	var currentCount = pman.reName.items.length;
/*
	xUI.put([new xUI.InputUnit(
		[pman.reName.focus,pman.reName.getSelected(true)],
		removeList.filter(e =>{return (pman.reName.getItem(e) instanceof pman.ReNameItem)}),
		{
			command:"remove",
			backup :backupItems,
			selection:selectedItem
		}
	)],false,true);//*/
/*
	removeList.forEach(e =>{
		let itm = pman.reName.getItem(e);
		if(itm) itm.remove(withMembers);
	});
	pman.reName.refreshItemlist(true,
		function(){
//undo処理
			xUI.put([new xUI.InputUnit(
				[pman.reName.focus,pman.reName.getSelected(true)],
				Array.from(pman.reName.items,pman.ReNameItem.duplicate),
				{
					target:xUI.activeDocument.content,
					command:"remove",
					backup :backupItems,
					selection:selectedItem
				}
			)],false,true);
			pman.reName.select(selectedItem[0]);
		});
	return;
*/
};
/*	ファイル名｜アイテムID 配列のリスト展開
ファイル名のID展開は後日にペンディング
再帰展開は不要
 */
pman.reName.expdList = function expdList(itemList){
// 引数は配列または文字列　単独文字列ならばいったん配列に変換
	if(!(itemList instanceof Array)) itemList = [itemList];
// 結合再分離で単一配列化する
	itemList = itemList.join(',').split(',');
// 配列内の整数ID以外をID化する（ペンディング）
//引数をトークンに分解処理その後ソートしてユニーク化
	var result = [];
	for (var ix = 0 ;ix < itemList.length ; ix ++){
		var tcn = itemList[ix];
// トークンが展開可能なら展開して生成データに積む
		if (tcn.match(/^([1-9]{1}[0-9]*)\-([1-9]{1}[0-9]*)$/)){
			var stV=Math.round(RegExp.$1*1) ;var edV=Math.round(RegExp.$2*1);
			if (stV<=edV){
				for(var tcv=stV;tcv<=edV;tcv++){result.add(tcv);}
			}else{
				for(var tcv=stV;tcv>=edV;tcv--){result.add(tcv);}
			};
		}else{
			result.add(parseInt(tcn));
		};
	};
	return result.sort(function(a,b){return (a-b)});
};
/*TEST
	console.log(pman.reName.expdList("1,2,3,4,5,6-10"));

 */

/*
	アイテムセレクトのアクション
mousedown
	最後にマウスダウンしたアイテムにフォーカスが移る
	セレクトはチェックボックスで表示クリックごとにトグル（ノーアイテムチェックがあり得る）
[ctrl]|[meta] + mousedown
	フォーカスが移動しないでセレクトが追加|削除される
	フォーカスセルの場合も同様にトグル動作
[shift] + mousedown
	フォーカス移動なしで
	フォーカス位置からクリックしたアイテム間の全アイテムをチェック（一方通行）
	
イベントのエレメントパスにテキストボックスがあってセレクト前ならセレクト操作のみでテキストボックスはブラー
*/
pman.reName.focuscheck = function(evt){
		console.log(evt)
		var targetItem = pman.reName.getItem(pman.reName.parseId(evt.target.id));
		if((! targetItem.selected)&&(evt.target instanceof HTMLInputElement)) evt.target.blur();
}
pman.reName.check = function(evt){
console.log(evt);
//itemList|Group
	if(evt.target.id.indexOf("rename_item_")>=0){
		var itemID     = pman.reName.parseId(evt.target.id);//get item number;
		var targetItem = pman.reName.getItem(itemID);
		if((! targetItem.selected)&&(evt.target instanceof HTMLInputElement)) evt.preventDefault();
		if(evt.target.id.indexOf("icon_ovl_rename_item_")>=0){
//グループ表示操作ではフォーカス移動なし
console.log('sWitchClose :'+(targetItem.close));
				targetItem.sWitchClose((!targetItem.close));
				return;
		};
		pman.reName.select(itemID,((evt.metaKey)||(evt.ctrlKey)),(evt.shiftKey));
	}else if(evt.target.id.indexOf("basefolder")>=0){
console.log('openFolder :'+(pman.reName.baseFolder));
		pman.reName.openFolder(pman.reName.baseFolder);
	};
}
/**
 *	テキストボックスの内容を直接アイテムテキストに反映させる
 *	衝突検知とロールバックあり 空白は不可
 *	@params	{Number}	idx
 *	@returns {string}
 *	itemText
 */
pman.reName.applyInputText = function(idx){
	if(typeof idx == 'undefined') idx = -1;
	var itm = pman.reName.items[idx];
	if(! itm){
//console.log(idx);
		if((idx)&&(idx==-1)) document.getElementById('previewheader_reName_text').value = "";
		return false;
	}
	var textInput = document.getElementById('ipt_rename_item_'+idx);
	var txt = textInput.value;
	var tix = itm.parent.members.findIndex(function(elm){return (elm.text == txt);});
	if((txt.length == 0)||(tix >= 0)){
//空白またはグループ内衝突によるロールバック
		textInput.value = itm.text;
	}else{
//			itm.text = txt;
//undo付きでアイテムのプロパティを更新
		xUI.put(new xUI.InputUnit(
			[idx,[idx]],
			[txt],
			{
				command:'name',
				focus:idx,
				selection:[idx]
			}
		));
	};
//	pman.reName.pending = false;
	return itm.text;
}
/*
 *	@params	{String}	targetString
 *	@params	{String}	destString
 *	@params	{Boolean}	useRegex
 *	名前text検索・置換
 *	選択アイテムの名前を、ターゲット文字列で検索して、目的文字列に置換する
 *	置換に成功したアイテムを選択状態にして他を非選択とする
 *	検索文字列には、オプションで正規表現を使用可能
 *	正規表現検索時は、部分文字列を置換文字列として使用可能(JavascriptのString.replaceにそのまま引き渡す)
 *  アイテム複数選択時は、選択アイテムを対象
 *  選択（チェック）アイテムが単数または0のケースでは、全アイテムを対象にする
 *	destStringが空白の場合は検索文字列の削除
 *	destStringが文字列以外場合は、置換動作を行わずに検索動作のみを行う（false|true|null等）
 */
pman.reName.replaceName = function(targetString,destString,useRegex){

	if(typeof targetString != 'string'){
		if(targetString instanceof RegExp){
			useRegex = true;
		}else{
			return false;
		};
	}else if(targetString.length == 0){
		return false;
	}else if(targetString.match(/^\/.+\/[gimsuy]*$/)){
//正規表現リテラルとして解釈
		targetString = Function('"use strict";return ('+targetString+');')();
		useRegex = true;
	}
//ソートオプションを確認
	var sortList = pman.reName.sortAuto;
//置換文字列検査不要
	var replaceName = true;
	if(typeof destString   != 'string') replaceName = false;
//正規表現オプションを確認
	if(typeof useRegex == 'undefined') useRegex = document.getElementById('replace_regex').checked;
	if(useRegex){
		var nameRegex = new RegExp(targetString);
	}else{
		var nameRegex = new RegExp(targetString.replace(/([\^\$\-\+\*\?\.\:\!\|\(\)\{\}\[\]\\])/g,"\\$1"));
	};
//検索対象配列を作成
	var searchItems = pman.reName.selection;
	if(searchItems.length <= 1) searchItems = Array.from(pman.reName.items);
console.log(searchItems);
	var newNames = [];
	var backupNames = [];
	for (var i = 0 ; i < searchItems.length ; i ++){
		if(searchItems[i].text.match(nameRegex)){
			if(replaceName){
				var newName = searchItems[i].text.replace(nameRegex,destString);
				if(searchItems.findIndex(function(elm){return (elm.text == newName);}) < 0){
					newNames.push(newName);
					backupNames.push(searchItems[i].text);
				}else{
					var msg = nas.localize("すでに %1 があるので、変更できません",newName);
					alert(msg);
					console.log(msg);
				};
			};
			searchItems[i].selected = true;
		}else{
			searchItems[i].selected = false;
		};
	};
console.log(searchItems);
//undo付きで処理
	if(replaceName){
		xUI.put([new xUI.InputUnit(
			[pman.reName.focus,pman.reName.getSelected(true)],
			newNames,
			{
				command:"name",
				focus:pman.reName.focus,
				selection:pman.reName.getSelected(true),
				backup:backupNames
			}
		)]);
		if(sortList){
//		document.getElementById('sortSW').checked = sortList;
			pman.reName.itemSort();
//		pman.reName.pending = false;
		}else{
			pman.reName.itemAlignment();
		};
	}
	this.syncSelection();
	pman.reName.refreshItemlist(true);
	pman.reName.setPreview(pman.reName.focus,null,'replaceName');
}
/**

*/
pman.reName.searchAndSelect = function(targetString,useRegex){
	pman.reName.replaceName(targetString,false,useRegex);
}

/**
 *	@parems {Boolean}	rmv
 *		削除フラグ
 *	アイテム名の後方にアイテムセパレータを、付加・削除する
 */
pman.reName.setGroup = function(rmv){
	var newNames = [];
	var backupNames = [];
	if(typeof rmv == 'undefined') rmv = false;
	rmv = (rmv)? true : false;
	if (event.altKey) rmv = !(rmv);
// [alt]キーで動作を反転
	for (var i = 0 ; i < pman.reName.selection.length ; i ++){
//		if((pman.reName.selection[i].ip.length == 1)||(pman.reName.items[i].hidden)) continue;//隠蔽・削除済アイテムをスキップ

		var names   = pman.reName.selection[i].text.replace(/_/g,'/').split('/');
//		var names   = pman.reName.selection[i].getNormalizedNames();

		if(rmv){
			if(names.length > 1) names.splice(-1,1);
		}else{
			if(names[names.length-1]) names.push("");
		};
		var newName = names.join('_');
//		var tix = pman.reName.selection[i].parent.members.findIndex(function(elm){return (elm.text == newName);});
			newNames.push(newName);
			backupNames.push(pman.reName.selection[i].text);
//		if( tix >= 0){
//			var msg = nas.localize("%2:すでに %1 があります、名前が重複します",newName,tix);
//			alert(msg);
//		};
	};
//undo付きで処理
	xUI.put([new xUI.InputUnit(
		[pman.reName.focus,pman.reName.getSelected(true)],
		newNames,
		{
			command:"name",
			focus:pman.reName.focus,
			selection:pman.reName.getSelected(true),
			backup:backupNames
		}
	)]);
}

/**
 *  @params {Number}	step
 *      コマンド文字列
 *  @params {Boolean}	postfix
 *      ポストフィックスオプション
 *	@params {Boolean}	subNum
 *		副番号オプション
 *  アイテム名番号設定
 *  コマンド文字列の指定で選択アイテムの番号部分を増減操作
 *  与えられるナンバーはを除く正負の整数 省略時は増加ステップ１
 *  引数に0与えられた場合 NOP
 *  番号操作の際、基本的にアイテム名重複は検知しない
 *  ポストフィックスオプションがあればポストフィックス部分の番号操作を行う
 *  副番号オプションがある場合、枝番号を操作 A-1 <> A-1a <> A-1b ....
 *  ポストフィックスに枝番号は認められないので、ポストフィックス操作時に副番号オプションは無効
 *  [alt]       キー併用    postfix オプションを反転する
 *  [shift]     キー併用    subNum  オプションを反転する 
 *  [ctrl|meta] キー併用    マルチネーム操作と終端シングルネーム操作を切替
 */
pman.reName.incrName = function(step,postfix,subNum){
//操作パラメータ確定
//
	if(typeof step == 'undefined') step = 1;
//[shift]キー併用でsubNum変数を反転
	if((event)&&(event.shiftKey)) subNum = (subNum)? false:true;
//[alt]キー併用でpostfix変数を反転
	if((event)&&(event.altKey)) postfix = (postfix)? false:true;
//postfix操作時はNusubを強制的に切る
	if(postfix) subNum = false;


}
/**
 *  @params {String}	nameString
 *      コマンド文字列
 *  @params {Boolean}	postfix
 *      ポストフィックスオプション
 *	@params {Boolean}	subNum
 *		副番号オプション	

 *  アイテム名text設定
 *
 *  コマンド文字列の指定で選択アイテムのもつtextプロパティを操作する
 *  標準機能は引数文字列をグループプリフィックスとして連番化した名称へ変更する
 *  アイテムが複合名の場合は、最終位置のアイテム名に対して操作を行うが、キーボード併用で切り替え可能

	複合名称（原画番号のマルチアセット）判定が必要
	パーサを通して分解された配列データを得る

	A-1_B-3_C-1
	A1_B3_C1

	以下は単独名称として処理したほうが良いが最後のナンバーに関しては連番操作対象となる
	マルチアセット分解時に最終アイテムのみ操作することで同等の効果となる（はず）
	img_0001
	ABC#01__s-c123
	ABC_01_123

 *  選択されたアイテムの親グループ内で名称がユニークにならない場合は、操作をリジェクトする
 *  連番化で与えられるナンバーは正の整数に限定 増加ステップは１固定 ゼロは空文字列に置き換えられる
 *  既存名のグループがコレクション内に存在すれば、次点の番号を補完する（[2,3,5]に対して 6,7...を補完する 空き番号の1,4は補わない）

 *  引数の%は既存名と置換 すなわち "abc" に対して "A%BC"を引数として与えた場合 "AabcBC"がプリフィクスとなる
 *  いくつかの特殊な引数が存在する
 *  ++ 選択アイテムの一括増番
 *  -- 選択アイテムの一括減番
 *  ##... 桁あわせ　番号の変更はない
 *  引数に空白|undefined 等のネガティブが与えられた場合 .text を .name にリセットする

 *  ポストフィックスオプションがあれば引数をポストフィックスに対して操作を行う

 *  引数がセパレータ"_(アンダーバー)"で開始する場合は、ポストフィックスオプションが指定されたものとみなす

 *  副番号オプションがある場合、枝番号を操作 A-1 > A-1a > A-1b ....
 *  ポストフィックスに枝番号は認められないので、ポストフィックス操作時に副番号オプションは無効
 *併用キー
 *  [alt]キー併用で自由入力ボタンがクリックされた場合のみ、自由入力ボタンUIのテキストを編集する(イレギュラー操作) 
 *
 *  [alt]                  マルチネーム操作と終端シングルネーム操作を反転（）
 *  [shift]                subNum オプションを反転する

 *  [ctrl|meta]            prefix時に複合名を追加
 *  [shift]+[ctrl|meta]    prefix時に終端の複合名を削除してから処理
 */
pman.reName.setName = function(nameString,postfix,subNum){
//[alt]キー併用でフリーボタンを編集（イレギュラー）
	if((event)&&(event.altKey)&&(event.target.id.indexOf("_bt_free") > 0)){
		$("#"+event.target.id).hide();
		$("#"+event.target.id+"_text").show();
		document.getElementById(event.target.id+"_text").select();
		return;
	};

//パラメータ前処理・確定
//[shift]キー押し下げ時はsubNum変数を反転
	if((event)&&(event.shiftKey)) subNum = (subNum)? false:true;
//
	if(! nameString) nameString = '';
	var sortList = pman.reName.sortAuto;//並べ替え動作変数
	var sep      = '-'                 ;//標準セパレータを設定
//主引数がセパレータで開始するケースはポストフィックスを強制
	if(nameString.match(/^([_\-])([^_\-].*)$/)){
		var sep    = RegExp.$1;
		nameString = RegExp.$2;
		postfix    = true;
	};
//postfix操作時はsubNumを強制的に切る
	if(postfix) subNum = false;
// 名前設定処理分岐
	if(nameString.match(/^\s*$/)){
// 復帰処理 引数が空白及び空文字列のケースでは アイテムテキストを元のアイテム名にリセット
		var valueNames  = Array.from(pman.reName.selection, e => e.name.replace(/\.[^\.]+$/,''));
		var backupNames = Array.from(pman.reName.selection, e => e.text);
		xUI.put([new xUI.InputUnit(
			[pman.reName.focus,pman.reName.getSelected(true)],
			valueNames, 
			{
				command:"name",
				focus:pman.reName.focus,
				selection:pman.reName.getSelected(true),
				backup:backupNames
			}
		)]);
	}else{
// 操作対象の非選択アイテムを現在のツリーに基づいてグルーピング
		if(pman.reName.selection.length == 0) return ;//NOP
		var renameGroup = [];//親アイテムリスト
		var targetItems = [];//親ごとのリスト配列
		pman.reName.selection.forEach(e=>renameGroup.add(e.parent));//グループリスト
		renameGroup.forEach(p => targetItems.push(pman.reName.selection.filter(e => e.parent === p)));
//////===========
		var valueNames  = [];
		var backupNames = Array.from(pman.reName.selection, e => e.text);
		var renameGroupPostfixCount = false;
		var renameGroupCount = false;
//処理内容別に処理用リネームファンクションを設定
// operateの引数は、当該処理アイテム
		if((! postfix)&&((nameString == '++')||(nameString == '--'))){
// ++|--
// 名前数値部分の増減 チェックアイテムの番号増減を行う。重複時チェックは行わない
// チェックはリネームの際に行い、警告して処理失敗
// 副番号オプションがある場合は、原稿番号を固定して副番号の増減を行う
// アイテム内のラベルが複数ある場合は、[ctrl]キーで最終の一つ｜全部 を切替
			var operate = function(elm){
				if((event.metaKey)||(event.ctrlKey)){
					var names   = elm.getNormalizedNames();
					names.forEach(function(e,i){names[i] = nas.incrStr(e,((nameString == '++')? 1:-1),true,((subNum)?true:false))});
					var newName = names.join('_');
				}else{
					var newName = nas.incrStr(elm.text,((nameString == '++')? 1:-1),true,((subNum)?true:false));
				};
				return newName;
			};
		}else if((! postfix)&&(nameString.match(/^#+/))) {
// 引数が####のみ
// ボディ連番部桁あわせ postfix,subNum オプションは無効
			var operate = function(elm){
				var digits = pman.reName.renameDigits;
				if(nameString.length > 1) digits = nameString.length;
				return nas.RZf(elm.text,digits);
			};
		}else if(postfix){
// has param postfix
// ポストフィックス処理 ポストフィックスを追加｜交換する
// マルチネーム対応等は考慮せず、全体の文字列に対してポストフィックスを操作する

// カウント数の判定は、ポストフィックのみではできないので、初期値として1を与え後ほど解決
			var postfixHeader = nameString.replace(/#/g,'');

			if(nameString.match(/#/)){
//既存グループアイテムからグループごとにポストフィックススタートナンバーを取得
				var postfixRegex = new RegExp("[\\-_]"+postfixHeader+"([0-9]+)$");//文字列末尾比較正規表現

				renameGroupPostfixCount = [];//配列で初期化初期化
				for(var h = 0 ; h < renameGroup.length ; h ++ ){
					renameGroupPostfixCount[h] = 0;//count:0 
					for(var i = 0 ; i < renameGroup[h].members.length ; i ++){
						if(
							(! renameGroup[h].members[i].selected)&&
							(renameGroup[h].members[i].text.match(postfixRegex))
						){
							var num = nas.parseNumber(RegExp.$1);
							if (renameGroupPostfixCount[h] < num) renameGroupPostfixCount[h] = num;
						};
					};
				};
			};//  count を取得
//countの値はoperateの外側で初期化する

			var operate = function(elm){
				if (nameString.indexOf('#') >= 0){
					count = 0;
					nameString = elm.text + sep + postfixHeader;
					elm.parent.members.forEach(function(c){
						if((c!==elm)&&(c.text.indexOf(nameString) == 0)){
							var num = nas.parseNumber(c.text.slice(-nameString.length));
							if (count < num) count = num;
						};
					});
					nameString += String(count+1);
					return nameString;
				}else if(nameString.indexOf("+") == 0){
//プラスルール表記の場合のみポストフィックスセパレータを省略
					return [elm.text.replace(/\++\d*$/,""),nameString].join('');
				}else{
console.log(postfixRegex);
					return [elm.text.replace(new RegExp("[\\-_]"+postfixHeader+".*$"),""),nameString].join(sep);
				}
			};
console.log(operate);
		}else{
//一般処理
//グループプリフィックス連番
//複合エレメントをサポート
//副番号をサポート
//nameString引数が _|/ で終了している場合は前方を固定文字列として扱う
			var digits = pman.reName.renameDigits;
			if(nameString.match(/^(.+)([\-_])$/)){
				nameString = RegExp.$1;
				sep        = RegExp.$2;
			};
			var nameRegex = new RegExp("^"+nameString+"[\\-\\s]?([0-9]+)");//親番号比較正規表現・副番号表現を含む
//既存アイテムからグループごとのスタートナンバーを取得
			renameGroupCount = [];
			for(var h = 0 ; h < renameGroup.length ; h ++ ){
				renameGroupCount[h] = 0;
				for(var i = 0 ; i < renameGroup[h].members.length ; i ++){
					if(! renameGroup[h].members[i].selected){
//複合アイテムを含むグループ内全てのナンバーを検索して最大値を得る
						var subitems = renameGroup[h].members[i].getNormalizedNames();
						for (var j = 0 ; j < subitems.length ; j ++){
							if(
								(subitems[j].match(nameRegex))
							){
								var desc      = nas.CellDescription.parse(RegExp.$1,nameString);
								var num       = nas.parseNumber(desc.body);
								if (renameGroupCount[h] < num) renameGroupCount[h] = num;
							};
						};
					};
				};
			};
console.log(renameGroupCount);
			if(
				(pman.reName.nameExt) !=
				((event)&&((event.metaKey)||(event.ctrlKey)))
			){
//[meta]|[ctrl]同時押しの際は サブアイテム操作を切り替え
				var operate = function(elm){
//チェックアイテムをサブアイテムに分解して最終アイテムをリネーム
					var subitems = elm.getNormalizedNames();
					var countOffset = ((event)&&(event.altKey))? -1: 1;
					if (nameString.indexOf('%') == 0){
						var currentDescription = new nas.CellDescription(subitems[subitems.length-1]);
						nameString = nameString.replace(/%/,currentDescription.prefix);
					};
					count += (subNum)? 0:countOffset;
					subitems[subitems.length-1] = ([nameString,nas.Zf(count,digits)]).join(sep);
					if(subNum){
						subitems[subitems.length-1] = nas.incrName(subitems[subitems.length-1],countOffset);
					};
					return subitems.join('_');
				};
//			}else if(){
				
			}else{
				var operate = function(elm){
//サブアイテムは無視して全体をリネーム
					if (nameString.indexOf('%') == 0) nameString = nameString.replace(/%/,elm.text);
//					var newName = ([nameString,nas.Zf(count,digits)]).join(sep);
					if(subNum){
						if(count == 0) count = 1;
						sub_count ++;
						return nas.incrStr([nameString,nas.Zf(count,digits)].join(sep),sub_count,true,true);
					}else{
						count++;
						return ([nameString,nas.Zf(count,digits)]).join(sep);
					};
				};
			};
		};
//グループごとに処理を実行
//副番号を扱う際は、親番号毎
		var focusBackup = pman.reName.focus;//
		var selectionBackup = Array.from(pman.reName.selection);//選択状態バックアップ

		for (var k = 0 ;k < targetItems.length ; k ++){
			var backupNames = Array.from(renameGroup[k],e => e.text);
			var newNames = [];
			var count     = 0;//カウント・サブカウント変数は
			var sub_count = 0;//
			if((postfix)&&(renameGroupPostfixCount)){
				count = renameGroupPostfixCount[k];
			}else if(renameGroupCount){
				count = renameGroupCount[k];
			};
//			if(pman.numOrderUp) renameGroup[k].members.reverse();//オーダー反転
//処理メンバーを一時設定 シャローコピーをとってオーダーを調整
			var opMember = Array.from(renameGroup[k].members);
			if(pman.numOrderUp) opMember.reverse();//オーダー反転
			opMember.forEach(e => {
				var itemIx = targetItems[k].indexOf(e);
				if((subNum)&&(itemIx >= 0)){
//					sub_count = 0;//reset
//グループメンバーから最大の副番号を抽出
					e.parent.members.forEach((itm)=>{
						if (itm.selected == false){
							var itmDesc = nas.CellDescription.parse(itm.text,nameString);
							if(nas.parseNumber(itmDesc.body) == num){
								var sub_num = nas.parseName(itmDesc.body,'abcdefghijklmnopqrstuvwxyz');
								sub_count = (sub_count < sub_num)? sub_num : sub_count;
							};
						};
					});//
				};
				if(itemIx < 0){
					newNames.push(e.text);
				}else{
					newNames.push(operate(e));
				};
			});
			if(pman.numOrderUp) newNames.reverse();//オーダー反転
			var checkNames = [];
			newNames.forEach(e => checkNames.add(e,function(a,b){nas.compareCellIdf(a,b) >= 7}));
			if (checkNames.length != newNames.length){
//名前衝突が発生したので処理保留
					var msg = nas.localize("変更後の名前に重複があるため変更できません\n%1\n確認してください",newName);
					console.log(msg);
			}else{
//コンフリクトがないので、実処理を行う
				var targetId  = pman.reName.items.indexOf(renameGroup[k].members[0]);
				var selection = Array.from(renameGroup[k].members,e=>pman.reName.items.indexOf(e));
				xUI.put([new xUI.InputUnit(
					[targetId,selection],newNames,{
						command:"name",
						focus:targetId,
						selection:selection,
						backup:backupNames
					}
				)]);
			};
		};

//フォーカスとセレクションの復帰
		pman.reName.focus = focusBackup;
		pman.reName.select();
		selectionBackup.forEach(e => pman.reName.select(e,true,false));
	};
//ソートチェックがあればグループメンバーをソート
	if(sortList){
		pman.reName.itemSort();
	}else{
		pman.reName.itemAlignment();
	};
//	this.getSelected();
	pman.reName.setPreview(pman.reName.focus,null,'setName');
}

/**
 * @params {Object pman.ReNameItem|Number|String}  itm
 *		Object pman.ReNameItem||Number itemID||String keyword
 * @params {Boolean} withCtrl
 * @params {Boolean} withShift
 * @returns {Array}
 *	選択されているアイテムの配列
 *  +[Shift]	フォーカスを固定してセレクションを拡縮する
 *  +[Ctrl]	フォーカスを固定してセレクションを切換(アイテム毎にトグル)
 *  +[Shift]+[Ctrl] ヒストリ解除のキャンセル
 *	アイテムの選択|解除
 *	選択解除の際は 旧来の -1 でなく null をsetPreviewに引数として与える 220609
 *	削除されたアイテムに対するフォーカスをリジェクト 220611
 *	(withCtrl)&&(withShift)をヒストリコントロールのフラグとして使用
 *  uafバンドルアイテムがセレクトされた場合はプロダクト変数を更新
 *  hidden属性増設 隠しアイテムは選択不能とする 選択状態のアイテムをhideした場合選択は解除
表示モード増設に伴い動作拡張
	状況によりitmは以下に分類される
		通常アイテム
		隠しアイテム
		削除済みアイテム
		バンドルメンバーアイテム
	バンドルメンバーが指定された場合は、フォーカスを親バンドル　親バンドルのサブフォーカスをアイテムにセットする（暫定）
 */

pman.reName.select = function(itm,withCtrl,withShift,history){
//console.log(itm,withCtrl,withShift);
	if(!(history)) pman.reName.history.pt = -1;//ヒストリモード解除
//バンドル導入により !(isUAF) の場合items へエントリのある各UAF配下のxmap|statusアイテムが選択不能アイテムとなる
//items配列の後方にゴミ箱に入ったアイテムが固まっているのでその数を引いて選択可能な最大のIDを得る
/*
変数 selectableを現在の選択可能アイテム配列に設定する
全体からゴミ箱に入ったアイテムと隠しアイテムを除いたアイテムの配列を得る
 */
	var selectable = pman.reName.items.filter(function(i){return((pman.reName.removedItems.members.indexOf(i) == -1)&&(!(i.hidden)))});//選択可能域(削除アイテムと隠れアイテムを除く)
	if( selectable.length <= 0 ){
//選択可能なアイテムがない
		pman.reName.focus = -1;
		pman.reName.setPreview(-1);
		return [];
	};
//編集中はロック
	if(pman.reName.onCanvasedit) return;
//アイテム正規化まえに文字列引数を解決する
	if((typeof itm == 'string')&&((itm == 'next')||(itm == 'prev'))){
// case keyword next|prev キー文字列を与えられた場合
		var currentItem = pman.reName.getItem(pman.reName.focus);
		if((currentItem.type == '-bundle-')&&(currentItem.bundleInf.bundleFocus >= 0)){
//選択がバンドルメンバーのケースでは選択可能域を制限するためにparentSelectableを作成
			var subForcus = currentItem.bundleInf.bundleFocus;
			var parentSelectable = currentItem.members.filter(function(i){return((pman.reName.removedItems.members.indexOf(i) == -1)&&(!(i.hidden)))});
//暫定的にメンバーをループ選択 サブフォーカス更新？・フォーカスは操作しない
			var idx = (parentSelectable.length + parentSelectable.indexOf(currentItem.members[subForcus]) + ((itm == 'prev')?-1:1)) % parentSelectable.length;
			itm = parentSelectable[idx];//ここでフォーカス移動を禁止されたサブアイテムが選択される
			pman.reName.bundlePreview(currentItem,currentItem.members.indexOf(itm));
			return ;
		} else {
//選択が主アイテムリストのメンバー
			var parentSelectable = [];
			if(currentItem.parent) parentSelectable = currentItem.parent.members.filter(function(i){return((pman.reName.removedItems.members.indexOf(i) == -1)&&(!(i.hidden)))});
			if((!(currentItem instanceof pman.ReNameItem))||(! currentItem)) return null;
			if((pman.reName.selection.length > 1)&&(!(withCtrl))&&(!(withShift))){
//複数アイテム選択状態で修飾キー押下なし > セレクション配列内でフォーカスアイテムをループ選択
				var idx = (pman.reName.selection.indexOf(currentItem) + ((itm == 'prev')?-1:1) + pman.reName.selection.length) % pman.reName.selection.length;
				itm = pman.reName.selection[idx];withCtrl = true ;withShift = true ;
			}else if((withCtrl)&&(withShift)){
//[Shift]+[Ctrl] 選択可能なアイテム全体でループ移動
				var idx = (selectable.indexOf(currentItem) + ((itm == 'prev')?-1:1)) % selectable.length;
				itm = selectable[idx];
				pman.reName.selectionOffset = 0;withCtrl = false ;withShift = false ;
			}else if(withShift){
//with [shift] focusを固定してselectionを拡縮 offsetを設定
				var idx = (selectable.indexOf(currentItem) + pman.reName.selectionOffset + ((itm == 'prev')?-1:1)) % selectable.length;
				itm = selectable[idx];
				pman.reName.selectionOffset = idx - selectable.indexOf(currentItem);//選択オフセットが選択可能アイテム上のオフセットになる
			}else if(withCtrl){
//with [Ctrl] focus固定 で同一フォルダ内の先頭または末尾までのアイテムをすべて選択
				itm = (itm == 'prev')? parentSelectable[0]:parentSelectable[parentSelectable.length -1];
				withCtrl = false ;withShift = true ;
				pman.reName.selectionOffset = 0;
			}else{
//カレントアイテム親の内部ループ
				var idx = (parentSelectable.length + parentSelectable.indexOf(currentItem) + ((itm == 'prev')?-1:1)) % parentSelectable.length;
				itm = parentSelectable[idx];
				pman.reName.selectionOffset = 0;
			};
		};
	};
	itm = pman.reName.getItem(itm);//再取得
console.log(itm)
	if(
		(!(itm))||
		(itm === pman.reName)||
		(itm === pman.reName.removedItem)
	) itm = null;//ルートを強制

	if((itm)&&(itm.ip.length == 1)) return [];//removed item
	if((itm)&&(itm.hidden)) return [];//hidden item

	var currentFocus = pman.reName.focus;//
	var itemID = pman.reName.items.indexOf(itm);//get item index;
//	var itemIX = itm.parent.members.indexOf(itm);//get item sub-index;
	if(! itm){
//アイテム指定がない場合は全解除
		pman.reName.focus = -1;
		pman.reName.setPreview(-1);
		for(var i = 0 ; i < selectable.length ; i ++){
			if (selectable[i].selected){
				selectable[i].selected = false;
				let ckbx = document.getElementById(['ckb_rename_item',pman.reName.items.indexOf(selectable[i])].join('_'));
				if(ckbx) ckbx.checked = false;
//document.getElementById(['ckb_rename_item',pman.reName.items.indexOf(selectable[i])].join('_')).checked = false;
			};
		};
	}else if((itm.parent)&&(itm.parent.type == '-bundle-')){
		if(pman.reName.items.indexOf(itm.parent) !== currentFocus) pman.reName.focus = pman.reName.items.indexOf(itm.parent);
//pman.reName.select(itm);
		itm.parent.bundleInf.bundleFocus = itm.parent.members.indexOf(itm);
		pman.reName.bundlePreview(pman.reName.items.indexOf(itm.parent),itm.parent.members.indexOf(itm));
		return ;
	}else{
		if ((itm.type == '-bundle-')) itm.bundleInf.bundleFocus = -1;//リセット
		if ((withCtrl)&&(withShift)){
//with[ctrl]|[cmd]+[Shift] selectionを維持してフォーカス移動
			itm.selected = true;
			pman.reName.focus = itemID;
			pman.reName.setPreview(itemID,null,'select-ctrl+shift');
			for(var i = 0 ; i < selectable.length ; i ++){
				if (selectable[i].selected){
					let ckbx = document.getElementById(['ckb_rename_item',pman.reName.items.indexOf(selectable[i])].join('_'));
					if(ckbx) ckbx.checked = false;
//document.getElementById(['ckb_rename_item',pman.reName.items.indexOf(selectable[i])].join('_')).checked = false;
				};
			};
		}else if (withCtrl){
//with[ctrl]|[cmd] selectionを強制的にトグル・フォーカスがあれば抜く
			itm.selected = (itm.selected)? false:true;
			if(
				(pman.reName.focus < 0)&&
				(itm.selected)
			){
				pman.reName.focus = itemID ;
				pman.reName.setPreview(itemID,null,'select-ctrl');
			};
			for(var i = 0 ; i < selectable.length ; i ++){
				if (selectable[i].selected){
					let ckbx = document.getElementById(['ckb_rename_item',pman.reName.items.indexOf(selectable[i])].join('_'));
					if(ckbx) ckbx.checked = (selectable[i].selected)? true:false;
//document.getElementById(['ckb_rename_item',pman.reName.items.indexOf(selectable[i])].join('_')).checked = (selectable[i].selected)? true:false;
				};
			};
		}else if(withShift){
//with [shift] focusを固定してselectionを拡縮
//		if(pman.reName.focus == itemID) return;//NOP
			if(pman.reName.focus < 0){
				pman.reName.focus = itemID ;
				pman.reName.setPreview(itemID,null,'select-Shift');
			};
			var range = [pman.reName.focus,itemID];//range
			if(pman.reName.focus > itemID) range.reverse();
			for(var i = 0 ; i < selectable.length ; i ++){
				var ix = pman.reName.items.indexOf(selectable[i]);
				selectable[i].selected = ((ix < range[0])||(ix > range[1])) ? false:true;
				let ckbx = document.getElementById(['ckb_rename_item',ix].join('_'));
				if(ckbx) ckbx.checked = (selectable[i].selected)? true:false;
//document.getElementById(['ckb_rename_item',ix].join('_')).checked = (selectable[i].selected)? true:false;
			};
		}else{
//文字列指定ではなく アイテム｜アイテムID 指定
			if(pman.reName.focus != itemID){
				if(pman.reName.focus >= 0) nas.HTML.removeClass(document.getElementById(['cnt_rename_item',pman.reName.focus].join('_')),'elementContainer-focus');
				nas.HTML.addClass(document.getElementById(['cnt_rename_item',itemID].join('_')),'elementContainer-focus');
				pman.reName.focus = itemID;
//				pman.reName.setPreview(itemID,null,'select');//focus move
			}
			for(var i = 0 ; i < selectable.length ; i ++){
				var ix = pman.reName.items.indexOf(selectable[i]);
				selectable[i].selected = (ix == itemID) ? true:false;
				let ckbx = document.getElementById(['ckb_rename_item',ix].join('_'));
				if(ckbx) ckbx.checked = (selectable[i].selected)? true:false;
//document.getElementById(['ckb_rename_item',ix].join('_')).checked = (selectable[i].selected)? true:false;
			};

			if(itm.parent) for(var j = 0 ; j < itm.parent.members.length ; j ++){
//オーバレイ状態を描画 itm.parent.members.indexOf(itm)
				if((!(pman.reName.lightBox.disabled))&&(pman.reName.lightBox.overlay)&&(itm.parent.members[j].isOvl())){
					nas.HTML.addClass(   itm.parent.members[j].getHTMLElement(),'elementContainer-overlay');
				}else{
					nas.HTML.removeClass(itm.parent.members[j].getHTMLElement(),'elementContainer-overlay');
				};
			};
		};
	};
		for(var i = 0 ; i < selectable.length ; i ++){
			var ix = pman.reName.items.indexOf(selectable[i]);
			if(selectable[i].selected){
				nas.HTML.addClass(document.getElementById(['cnt_rename_item',ix].join('_')),'elementContainer-selected');
			}else{
				nas.HTML.removeClass(document.getElementById(['cnt_rename_item',ix].join('_')),'elementContainer-selected');
			};
		};
		if(
			(pman.reName.focus >= 0)&&
			(pman.reName.items[pman.reName.focus].parent)&&
			(pman.reName.items[pman.reName.focus].parent.close)
		){
			pman.reName.items[pman.reName.focus].parent.close = false;
			if(! pman.reName.rewrite) pman.reName.rewrite = true;//書き換えフラグを立てる
		};
		pman.reName.syncSelection();//更新
		if (pman.reName.lightBox.overlay){
			pman.reName.flip.member = pman.reName.selection.filter(e => !(e.isOvl()));
		}else{
			pman.reName.flip.member = Array.from(pman.reName.selection);
		};
		xUI.sync('flip');
		if (pman.reName.selection.length == 0) pman.reName.focus = -1;
		if (currentFocus != pman.reName.focus) this.setPreview(pman.reName.focus,null,'select-exit');
//		if ((currentFocus != pman.reName.focus)||(itm.type == '-bundle-')) this.setPreview(pman.reName.focus,null,'select-exit');
//	if ($('#flip_seekbar').isVisible()) xUI.sync("flipSeekbar");
		if (
			(pman.reName.selection.length == 1)&&
			(pman.reName.selection[0].type == '-bundle-')&&
			(
				(pman.reName.selection[0].bundleInf)&&
				(pman.reName.selection[0].bundleInf.type == 'uaf')
			)
		){
//バンドルのカット情報をbrowserに設定
			pman.reName.setSCi(pman.reName.selection[0].bundleInf.bundleData.uniquekey);
		};
		xUI.sync('paintCommand');
		return pman.reName.getSelected(true);
}
//
/**
 *	@params {String|Boolean}  sel
 *		選択と解除の切り替えスイッチ
 *	全選択|全解除
 * フォーカスアイテムが有る無しで動作を切り替える
 フォーカスアイテムがあれば、フォーカスアイテムの親をフィルタにして直下の同種のアイテムだけを扱う
 フォーカスアイテムがない場合は、グループアイテムを含む全アイテムを選択（旧形式互換）
 */
pman.reName.selectAll = function(sel){
//画像編集中はロック(NOP)
	if(pman.reName.onCanvasedit) return;

	var parentArray = (pman.reName.focus >= 0)? pman.reName.items[pman.reName.focus].parent.members : pman.reName.items;
	var targetType  = (pman.reName.focus >= 0)? pman.reName.items[pman.reName.focus].type : '';
	if(pman.reName.focus >= 0){
		for (var i = 0 ; i < parentArray.length ; i ++){
			let ix = pman.reName.items.indexOf(parentArray[i]);
			if((parentArray[i].hidden)||(parentArray[i].ip.length < 2)){
				parentArray[i].selected = false;
			}else{
				if(sel){
					parentArray[i].selected = (parentArray[i].type == targetType)? true:false;
				}else{
					parentArray[i].selected = (ix == pman.reName.focus)? true:false;
				}
			};
			let ckbx = document.getElementById(['ckb_rename_item',ix].join('_'));
			if(ckbx) ckbx.checked = (pman.reName.items[ix].selected)? true:false;
//document.getElementById('ckb_rename_item_'+ix).checked = (pman.reName.items[ix].selected)? true:false;
			if(pman.reName.items[ix].selected){
				nas.HTML.addClass(document.getElementById('cnt_rename_item_'+ix),'elementContainer-selected');
			}else{
				nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+ix),'elementContainer-selected');
			};
		};
	}else{
//旧来の動作を選択可能アイテムに制限
		for (var i = 0 ; i < pman.reName.items.length ; i ++){
			if((pman.reName.items[i].hidden)||(pman.reName.items[i].ip.length < 2)) continue;
			pman.reName.items[i].selected = (sel)? true : false;
			let ckbx = document.getElementById(['ckb_rename_item',i].join('_'));
			if(ckbx) ckbx.checked = (pman.reName.items[i].selected)? true:false;

//document.getElementById('ckb_rename_item_'+i).checked = (pman.reName.items[i].selected)? true:false;

			if(pman.reName.items[i].selected){
				nas.HTML.addClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-selected');
			}else{
				nas.HTML.removeClass(document.getElementById('cnt_rename_item_'+i),'elementContainer-selected');
			};
		};
	};
	pman.reName.syncSelection();
	if (pman.reName.lightBox.overlay){
		pman.reName.flip.member = pman.reName.selection.filter(e => !(e.isOvl()));
	}else{
		pman.reName.flip.member = Array.from(pman.reName.selection);
	}
	xUI.sync('flip');
	return pman.reName.getSelected(true);
/*
	if(pman.reName.selection.length == 0){
		pman.reName.focus = -1;
		pman.reName.setPreview(pman.reName.focus,null,'selectAll');
	};// */
};
/**
仮設　バンドルメンバーのプレビュー関数
バンドルメンバーをプレビューに表示する
 itm  親バンドルアイテム
 ix   メンバーID
*/
pman.reName.bundlePreview = function(itm,ix){
	itm = pman.reName.getItem(itm);//アイテムパース
	if((itm)&&(itm.type == '-bundle-')){
		if(itm.members[ix]){
			itm.bundleInf.bundleFocus = ix;
			if(itm.img){
				pman.reName.setPreview(itm.members[ix]);
			}else{
				itm.members[ix].setImage(undefined,true,function(i){pman.reName.setPreview(i)});
			};
		}else{
			itm.bundleInf.bundleFocus = -1;
			pman.reName.setPreview(itm);
		};
	};
}
/**
 *	params {Number|Object pman.ReNameItem} itm
 *	params {Boolean} force
 *	アイテムをプレビュー pman.reName.setPreview(itm)
 *
var itemPos   = $('#imgPreview').position();
var previewOffset = [
	(document.getElementById('previewWindow').clientWidth/2 - itemPos.left)/document.getElementById('imgPreview').width,
	(document.getElementById('previewWindow').clientHeight/2 - itemPos.top)/document.getElementById('imgPreview').height
];
previewOffset
 *
 * force オプションがある場合は処理スキップを保留する
 */
pman.reName.setPreview = async function(itm,force){
	if(typeof itm == 'string'){
		itm = false;
	}else{
		if(typeof itm == 'undefined') itm = -1;
		if(!(itm instanceof pman.ReNameItem)) itm = pman.reName.items[itm];
		if((! itm)&&(pman.reName.items.length)) itm = pman.reName;
	};
	var myViewContent = "";
//シークバーを同期
	if ($('#flip_seekbar').isVisible()) xUI.sync("flip");
//アンダーレイも含めてライトボックスアイテムすべてを非表示に
	pman.reName.hideOverlay();
//モード状態により背景イメージを変更（synclightBoxへ移動予定）
	if(document.getElementById('previewWindow'))
		document.getElementById('previewWindow').style.backgroundImage = (
			(pman.reName.lightBox.disabled)||
			(pman.reName.lightBox.blendingMode == 'normal')
		)?
			"url('css/images/ui/transparent_background.png')":
			"url('css/images/ui/white_background.png')";
	var baseImage     = document.getElementById("imgPreview");//仮設定
	if((baseImage)&&(baseImage.style.opacity != 1.00))
		baseImage.style.opacity = 1.00;//showUnderlayの中で解決されない分
	if (!itm){
//========表示可能アイテムなし(クリア)
		if(baseImage){
			baseImage.src = './css/images/pman-ui/no-item.png';
		}else{
			myViewContent += "<img id=imgPreview src='./css/images/pman-ui/no-item.png'>";//新規イメージエレメント
			document.getElementById("previewWindow").innerHTML=myViewContent;
		};
		document.getElementById('previewheader_reName_text').value     = "";
		document.getElementById('previewheader_reName_path').innerText = "";
		document.getElementById("imgPreview").style.width  = '640px';//UIサイズの決定用変数に置き換え予定
		document.getElementById("imgPreview").style.height = '640px';//
		return itm;
//このケースはここで関数終了・表示履歴には含まれない
	}else if(document.getElementById("imgPreview")){
		document.getElementById("imgPreview").style.width  = '';//reset
		document.getElementById("imgPreview").style.height = '';//
	};
//表示可能アイテムあり・指定アイテムをプレビュー領域へ表示  //
		document.getElementById('previewheader_reName_text').disabled = false;
		document.getElementById("previewWindow").style.overflow = '';
	if((itm === pman.reName)||(itm.type == '-group-')){
//========グループアイテム(ルート|フォルダ)
		var groupView = 'icon';
		if(groupView == 'icon'){

//グループアイテムではアイテムリストを表示リストで
			var groupInfo = '[ '+pman.reName.baseFolder+'/'+((itm.text)?itm.text:"")+' ] total : ' + itm.members.length + ' items\n';
			myViewContent += "<div id=listPreview>";
			myViewContent += groupInfo +"<hr><br>";
			for(var i = 0; i< itm.members.length;i++){
				var itemIdf = pman.reName.items.indexOf(itm.members[i]);
				myViewContent += "<div class='assetItemBox' id='listItem_"+i+"' onclick='pman.reName.select("+itemIdf +");' ";
				if(itm.members[i].hidden) myViewContent += "style='display:none;' ";
				myViewContent += ">";
				myViewContent += '<div class ="thumbnailBoxPreview">';
				if(itm.members[i].type == '-bundle-'){
//バンドル処理をこちらでまとめる
					var imgSrc = 'css/images/pman-ui/documenticons/uaf.png';
					if(itm.members[i].bundleInf.posterImages.length){
						if(itm.members[i].bundleInf.posterImages[0].thumbnail){
							imgSrc = itm.members[i].bundleInf.posterImages[0].thumbnail.src;
						}else if(itm.members[i].bundleInf.posterImages[0].src){
							imgSrc = itm.members[i].bundleInf.posterImages[0].src;
						};
					};
					myViewContent += "<img id=listItemThumbneil_"+i+" class='elementThumbnail' src ="+imgSrc+">";
				}else if(itm.members[i].type == '-group-'){
					myViewContent += "<img id=listItemThumbneil_"+i+" class='elementThumbnail' src =css/images/pman-ui/documenticons/groupfolder.png>";
//UIとしてリアクションさせる予定
				}else if(itm.members[i].thumbnail){
					myViewContent += "<img id=listItemThumbneil_"+i+" class='elementThumbnail";
		if((itm.members[i].img)&&(itm.members[i].type == '-asset-')){
					if(itm.members[i].img.width  % 2 != 0) myViewContent += " elementThumbnailWidthOdd";
					if(itm.members[i].img.height % 2 != 0) myViewContent += " elementThumbnailHeightOdd";
				};
					myViewContent += "' src = "+ itm.members[i].thumbnail.src +">";
				}else{
					myViewContent += "<img id=listItemThumbneil_"+i+" class='elementThumbnail' src =" + nas.HTML.getTypeIcon(itm.members[i].mime,(itm.members[i].type == '-xpst-')) +" >";
				};

				myViewContent += '<p class="elementThumbnailText">';
				myViewContent += itm.members[i].getStatusString();
				myViewContent += '</p>';

				myViewContent += '</div>';
				myViewContent += '<hr>';
				myViewContent += itm.members[i].text;
				myViewContent += "</div>";
			};
			myViewContent += "</div>"
			document.getElementById("previewWindow").innerHTML = myViewContent;

			document.getElementById("listPreview").style.minHeight = document.getElementById("previewWindow").clientHeight + 'px';
			if(itm instanceof pman.ReNameItem){
				document.getElementById('previewheader_reName_text').value     = itm.name;
				document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
			}else{
				document.getElementById('previewheader_reName_text').value     = nas.File.basename(pman.reName.baseFolder);
				document.getElementById('previewheader_reName_path').innerText = pman.reName.baseFolder;
			};
			document.getElementById('previewheader_reName_text').disabled = true;
			document.getElementById("previewWindow").style.overflow = 'scroll';
//			pman.reName.history.append();
//			return itm;//
		}else{
//グループアイテム情報テキストを表示
			myViewContent+="<iframe id=previewText frameborder=0 width=100% height=100%> inline frame use </iframe>"
			document.getElementById("previewWindow").innerHTML = myViewContent;
			document.getElementById("previewText").style.height = document.getElementById("previewWindow").clientHeight +'px';
			document.getElementById('previewheader_reName_text').value     = itm.text;
			document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
			var groupInfo = '[ '+pman.reName.baseFolder+'/'+itm.text+' ] total : ' + itm.members.length + ' items\n';
			var previewData = new Blob([groupInfo,itm.getInfo()], {type : 'text/plane'});
			document.getElementById("previewText").src = URL.createObjectURL(previewData);
//			pman.reName.history.append();
//			return itm;
		};
	}else if(itm.type == '-bundle-'){
//========バンドルデータ uaf 独立関数に置き換え予定
	myViewContent += "<div id=listPreview>";
		myViewContent += "<div id=itemInfo class='itemInfo'></div>";
	myViewContent += "</div>";
		var listElement = document.getElementById("listPreview");
		var textElement = document.getElementById("itemInfo");
		if((! textElement)||(!listElement)){
			document.getElementById("previewWindow").innerHTML = myViewContent;
			listElement = document.getElementById("listPreview");
			textElement = listElement.children[0];// document.getElementById("itemInfo");
		}else{
			Array.from(listElement.children).forEach(function(e){if(e !== textElement) e.remove();});
		};
		listElement.style.minHeight = document.getElementById("previewWindow").clientHeight + 'px';
		textElement.innerHTML = itm.bundleInf.bundleData.uniquekey + " : " + itm.getStatusString() ;

		var lnk = document.createElement("button");
		  lnk.id      = itm.id;
		  lnk.innerText = (appHost.platform == 'Electron')? "別ウィンドウで開く":"別ウィンドウを開く";
		  lnk.onClick = "pman.reName.openNewWindow(this.id);"
		  textElement.append(lnk);
		  lnk.style = 'margin-left:120px;';

		textElement.innerHTML += '<hr>';//
		textElement.innerHTML += itm.getBundleSummary('html');//末尾に<hr>あり
//		textElement.innerHTML += '<hr>';//
//itemメンバーへのリンクを仮設
//var memberList = [];
//var thm = (e.thumbnail)?e.thumbnail.src:
//('<div class="assetItemBox" id="listItem_%1" onclick="pman.reName.bundlePreview(%2,%1);"><div class="thumbnailBoxPreview"><img id="listItemThumbneil_%2" class="elementThumbnail" src="%3" style="width: 128px;"><p class="elementThumbnailText" style="font-size: 32px;">.jpg</p></div><hr>%3</div>',
//itm.members.indexOf(e),
//pman.reName.items.indexOf(itm),
//)
/*
itm.members.forEach(e=>{
	if((e.type == '-asset-')||(e.type == '-xpst-')){
		memberList.push(nas.localize("<button onclick='pman.reName.bundlePreview(%1,%2)' > %3</button>",pman.reName.items.indexOf(itm),itm.members.indexOf(e),e.relativePath));
	}else{
		memberList.push(e.relativePath);
	}
});

		textElement.innerHTML += "<hr>" + memberList.reverse().join('<br>');
*/
//========バンドルアイテムプレビュー
			var itemIdf = pman.reName.items.indexOf(itm);
			var bundelListContent = "";
			for(var i = 0; i< itm.members.length;i++){
				bundelListContent += nas.localize("<div class='assetItemBox' id='listItem_%1' onclick='pman.reName.bundlePreview(%2,%1);'",i,itemIdf);
				if(itm.members[i].hidden) bundelListContent += "style='display:none;' ";
				bundelListContent += ">";
				bundelListContent += '<div class ="thumbnailBoxPreview">';
				if(itm.members[i].thumbnail){
					bundelListContent += "<img id=listItemThumbneil_"+i+" class='elementThumbnail";
					if((itm.members[i].img)&&(itm.members[i].type == '-asset-')){
						if(itm.members[i].img.width  % 2 != 0) bundelListContent += " elementThumbnailWidthOdd";
						if(itm.members[i].img.height % 2 != 0) bundelListContent += " elementThumbnailHeightOdd";
					};
					bundelListContent += "' src = "+ itm.members[i].thumbnail.src +">";
				}else{
					bundelListContent += "<img id=listItemThumbneil_"+i+" class='elementThumbnail' src =" + nas.HTML.getTypeIcon(itm.members[i].mime,(itm.members[i].type == '-xpst-')) +" >";
				};

				bundelListContent += '<p class="elementThumbnailText">';
				bundelListContent += itm.members[i].getStatusString();
				bundelListContent += '</p>';

				bundelListContent += '</div>';
				bundelListContent += '<hr>';
				bundelListContent += itm.members[i].text;
				bundelListContent += "</div>";
			};

			listElement.innerHTML += bundelListContent;

//console.log(lnk);
		document.getElementById(itm.id).addEventListener('click',function(){pman.reName.openNewWindow(this.id);});

		document.getElementById('previewheader_reName_text').value     = itm.text;
		document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
		pman.reName.history.append();
		return itm;
	}else if(
		(itm.type == '-xmap-')||
		(itm.name.match( /\.(text|txt|html|htm|csv|json|mp4|webm)$/i ))||
//		(itm.name.match( /\.(gdoc|gdraw|gform|gjam|gmap|gslide|gscript|gsite|gsheet)$/i ))||
		(((appHost.platform=='Safari')||(appHost.platform=='Mozilla'))&&(itm.name.match( /\.mov$/i )))||
		((! electron)&&(itm.mime=='application/pdf'))
	){
//管理メタデータ表示
//========テキスト｜ムービー｜PDF等のiframe表示系
// エンジン整備が終了したら -xpst-をこちらへ移行
		var textSource = (((appHost.platform == 'Electron')&&(itm.path))? new nas.File(itm.path).fullName.replace(/#/g,'%23'):URL.createObjectURL(itm.file));
		if(! (document.getElementById("previewText"))){
			document.getElementById("previewWindow").innerHTML='<iframe src="' + textSource + '" name=previewText id=previewText frameborder=0 width=100% height=100%> inline frame use </iframe>';
		}else{
			document.getElementById("previewText").src = textSource;
		};
		document.getElementById('previewheader_reName_text').value     = itm.text;
		document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
		pman.reName.history.append();
		return itm;
	}else if((itm.name.match( /\.(gdoc|gdraw|gform|gmap|gslides|gsheet|gsite)$/i ))){
//システム（googleDrive）へ投げる [meta|ctrl]+(click)ならばフレームで開く
//扱い停止 |gjam|gscript
		myViewContent+="<div id=itemInfo style='width:100%;height:100%;background-color:white;'></div>"
		if(! (document.getElementById("itemInfo")))
		document.getElementById("previewWindow").innerHTML=myViewContent;
		var target_url = (((appHost.platform == 'Electron')&&(itm.path))? new nas.File(itm.path).fullName.replace(/#/g,'%23'):URL.createObjectURL(itm.file));
		$.ajax({
			url:target_url,
			dataType: 'json',
			success: function(result){
				var previewContent = '<h1>';
				previewContent += itm.name;
				previewContent += '</h1><pre id=itemSummary>';
				previewContent += JSON.stringify(result,null,2);
				previewContent += '</pre><a href=https://drive.google.com/file/d/' + result.doc_id + '/view target=_blank>';
				previewContent += nas.localize({ja:"GoogleDriveでプレビュー"});
				previewContent += '</a> ';
				previewContent += ' <a href=https://drive.google.com/open?id=' + result.doc_id +' target=_blank>';
				previewContent += nas.localize({ja:"GoogleDriveで開く"});
				previewContent += '</a><br><hr><br>';
				document.getElementById("itemInfo").innerHTML = previewContent;
			}
		});
		document.getElementById('previewheader_reName_text').value     = itm.text;
		document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
		document.getElementById('previewheader_reName_text').disabled = false;
		pman.reName.history.append();
//		return itm;
	}else if((itm.type == '-xpst-')&&(itm.name.match( /\.(xps|xpst|tsh|ard|ardj|txt|text|csv|json|xdts|tdts)$/i ))){
//========テキスト系タイムシートデータ
//previewWindowを現在のウインドウ外枠にマッチさせる
//		$("#previewWindow").width( document.getElementById('previewBox').clientWidth  - 6);
//		$("#previewWindow").height(document.getElementById('previewBox').clientHeight - 6);
// xpsとして整形して配置する 将来的には編集可能なXPSTとして整形表示 エディタは別コールで組み込まない
		myViewContent+="<iframe id=previewText frameborder=0 width=100% height=100% ></iframe>"
		if(! (document.getElementById("previewText"))){
			document.getElementById("previewWindow").innerHTML=myViewContent;
//		}else{
//			document.getElementById("previewWindow").style.width  = document.getElementById('previewBox').clientWidth+"px";
//			document.getElementById("previewWindow").style.height = document.getElementById('previewBox').clientHeight+"px";
		}
		var target_url = (((appHost.platform == 'Electron')&&(itm.path))? new nas.File(itm.path).fullName.replace(/#/g,'%23'):URL.createObjectURL(itm.file));
		$.ajax({
			url:target_url,
			dataType: 'text',
			success: function(result){
				var previewData = new Blob([xUI.convertXps(result).toString()], {type : 'text/plane'});
				document.getElementById("previewText").src = URL.createObjectURL(previewData);
			}
		});//*/
		document.getElementById('previewheader_reName_text').value     = itm.text;
		document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
		document.getElementById('previewheader_reName_text').disabled = false;
//		pman.reName.history.append();
//		return itm;
	}else if(
		(itm.canvas)||
		(
			(itm.name.match(pman.reName.imageRegex))&&
			(itm.type == '-asset-')||(itm.type == '-xpst-')
		)
	){
//console.log('=========preview '+ itm.text);
//========画像タイムシートを含む一般アセット（画像）及び canvasasset || canvasxpst
//	document.getElementById('previewWindow').style.width  = "px";
//	document.getElementById('previewWindow').style.height = "px";
//canvasassetは、キャッシュした画像を表示して、リクエストがあった場合のみ編集フィールドへ出す
		if((!itm.img)){
//アイテムに画像登録がない(不正データを含む未ロードデータ)
console.log('set queue : '+ itm.text);
			pman.reName.loadQueue.add(itm);//読み出しキューへ追加
			return;
		}else if(itm.img.width > 0){
//有効な画像キャッシュが存在するのでまず表示する
			if(! document.getElementById("imgPreview"))
				document.getElementById("previewWindow").innerHTML = "<img id=imgPreview>";
//ベースイメージ表示     オーバレイON | 透過台ONのケースでは、ベースアイテムを親アイテムに設定
			var baseItm   = itm;
			var ovlParent = null;
			if(
				(pman.reName.lightBox.disabled == false)&&
				(pman.reName.lightBox.overlay)&&
				(itm.isOvl())
			) ovlParent = itm.getOvlParent();
			if(ovlParent) baseItm = ovlParent;
/*
	canvas付きのアセットは、再生速度が落ちるのを避けるためと構成を単純化するために.imgに常にキャッシュが置かれるのでここでは関与しない
	changeViewでもむろん関与しない
*/
//このブロック全体をchangeViewへ移動するか?
		//
			pman.reName.changeView(itm.text,pman.reName.preview,baseItm.img,force);//cahangeView force
//テキストボックスの表示を更新
			document.getElementById('previewheader_reName_text').value     = itm.text;
			document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
			if(! itm.thumbnail) itm.setThumbnail(true);
//			lightBox.syncPreview(baseItm);
			if((pman.reName.lightBox.disabled == false)||(force)){
//ライトボックスON この内容はsync lightBoxへ移動予定
/*	=============アンダーレイ・オーバーレイ画像を設定
	処理条件
		アイテムがアセットであること && 透過枚数が1以上であること
		ここでは分岐のみを行い、実際の表示は別の非同期メソッドに委ねる
 */
				if(
					((pman.reName.lightBox.underlay > 0)||(pman.reName.lightBox.overlay))&&
					(itm.type.match(/-asset-|-canvasasset-|-xpst-|-canvasxpst-/))
				){
					pman.reName.showUnderlay(baseItm);
				};
			};
//			pman.reName.history.append();
//			return itm;
		}else{
//表示可能な画像がないので仮画面を表示
			console.log(itm)
		};
	}else{
//条件を満たせなかったアイテムは、情報表示
		myViewContent+="<iframe id=previewText frameborder=0 width=100% height=100%> inline frame use </iframe>"
		document.getElementById("previewWindow").innerHTML = myViewContent;
		document.getElementById("previewText").style.height = document.getElementById("previewWindow").clientHeight +'px';
		document.getElementById('previewheader_reName_text').value     = itm.text;
		document.getElementById('previewheader_reName_path').innerText = itm.relativePath;
		var previewData = new Blob([itm.getInfo('text')], {type : 'text/plane'});
		document.getElementById("previewText").src = URL.createObjectURL(previewData);
//表示可能でかつ未ロードのアイテムもここでいったん表示されるので　条件を満たした場合は1回だけ再表示にトライする
	};
	pman.reName.history.append();//?
//	pman.reName.history.set(itm);//?
	return itm;
};// setPreview
/*
	オーバレイとアンダーレイを一括して非表示化する
*/
pman.reName.hideOverlay = function(){
	if(document.getElementById('imgPreview')){
//console.log('hide Over|Underlay');
		var ovlEs = Array.from(
			document.getElementById('imgPreview').parentNode.getElementsByClassName('imgOverlay')
		).concat(
			Array.from(
				document.getElementById('imgPreview').parentNode.getElementsByClassName('imgUnderlay')
			)
		);
		ovlEs.forEach(e => e.style.display = 'none');
	};
}
/*
	オーバレイとアンダーレイを一括して削除する
*/
pman.reName.removeOverlay = function(){
	if(document.getElementById('imgPreview')){
console.log('remove Over|Underlay');
		var ovlEs = Array.from(document.getElementById('imgPreview').parentNode.getElementsByClassName('imgOverlay imgUnderlay'));
		ovlEs.forEach(ovlE =>{
			ovlE.parentNode.removeChild(ovlE);//あれば非表示
		});
	};
}
/*
	オーバーレイアイテムを表示する
*/
pman.reName.showOverlay = function(itm){
//console.log('showOverlay');
//console.log([document.getElementById('imgPreview').width , itm.img.naturalWidth]);
//console.log([itm.img.width , itm.img.naturalWidth]);
	var imgScale = document.getElementById('imgPreview').width / itm.img.naturalWidth;
	var ovlix = 0;
	pman.reName.getOverlay(itm).forEach(ovl =>{
		var ovlid = 'imgOverlay_'+ ovlix ; ovlix ++;
//console.log(document.getElementById(ovlid));
		if(document.getElementById(ovlid)){
//存在しなければ作る あれば再利用
			var ovlImg = document.getElementById(ovlid);
		}else{
			var ovlImg = new Image();
			ovlImg.id = ovlid;
			ovlImg.name = ovl.text;
			ovlImg.className = 'imgOverlay';
			document.getElementById('imgPreview').parentNode.insertBefore(ovlImg,null);
		};
		if(ovlImg.src !== ovl.img.src){
			ovlImg.src = ovl.img.src;//複製
		};
		ovlImg.style.top  = document.getElementById('imgPreview').style.top;
		ovlImg.style.left = document.getElementById('imgPreview').style.left;
		ovlImg.width = Math.round(ovl.img.naturalWidth * imgScale);
		ovlImg.style.display = 'block';//再表示
	});
}
/*
 *	アンダーレイ及びオーバーレイ（透過台）アイテムを表示
 *	両カテゴリを一括処理
 **overlay == trueのケースでは、underlayアイテム中のoverlayは表示
 */
pman.reName.showUnderlay = async function(itm){
	var imgScale = document.getElementById('imgPreview').width / itm.img.naturalWidth;
	var frontImageElement = document.getElementById('imgPreview');
	if(pman.reName.onCanvasedit){
		frontImageElement = document.getElementById('canvasWrap');
		if(document.getElementById('imgPreview').style.opacity != 0)
			document.getElementById('imgPreview').style.opacity = 0;
	};
	var ovlElements = pman.reName.getOverlay(itm);
	var udlElements = pman.reName.getUnderlay(itm);
console.log(udlElements);
	if(
		((ovlElements.length == 0)&&(udlElements.length == 0))
	){
		if(frontImageElement.style.opacity != 1.0)
			frontImageElement.style.opacity = 1.0;
		if(frontImageElement.style.mixBlendMode != pman.reName.lightBox.blendingMode)
			frontImageElement.style.mixBlendMode = pman.reName.lightBox.blendingMode;
		return;//style reset
	};
//合成モードで分岐して主ディスプレイを変更
	if(pman.reName.lightBox.blendingMode == 'normal'){
		frontImageElement.style.opacity = (udlElements.length)? pman.reName.lightBox.opacity:1.0;
	}else{
		frontImageElement.style.opacity = pman.reName.lightBox.opacity ** ovlElements.length;
	}
	frontImageElement.style.mixBlendMode = pman.reName.lightBox.blendingMode;
//先行でアンダーレイ処理
	var udlix = 0;
	udlElements.forEach(udl =>{
		var udlid = 'imgUnderlay_'+ udlix ; udlix ++;
		if(document.getElementById(udlid)){
//存在しなければ作る あれば再利用
			var udlImg = document.getElementById(udlid);
		}else{
			var udlImg = new Image();
			udlImg.id = udlid;
			udlImg.name = udl.text;
			document.getElementById('imgPreview').parentNode.insertBefore(udlImg,document.getElementById('imgPreview').parentNode.firstChild);
			udlImg.className = 'imgUnderlay';
		};
		if(udlImg.src !== udl.img.src) udlImg.src = udl.img.src;//複製する
		udlImg.style.top  = document.getElementById('imgPreview').style.top;
		udlImg.style.left = document.getElementById('imgPreview').style.left;
		udlImg.width = Math.round(udl.img.naturalWidth * imgScale);
		if(pman.reName.lightBox.blendingMode == 'normal'){
//ノーマル
			udlImg.style.opacity =(udlix == udlElements.length)? 1.0 : pman.reName.lightBox.opacity;
		}else{
//乗算||比較暗
			udlImg.style.opacity = pman.reName.lightBox.opacity ** (ovlElements.length + udlix)
		};
		udlImg.style.mixBlendMode = pman.reName.lightBox.blendingMode;
		udlImg.style.display = 'block';//再表示
	});
	if((itm.hasOvl())||(pman.reName.lightBox.overlay)){
//オーバーレイ処理
		var ovlix = 0;
		ovlElements.forEach(ovl =>{
			var ovlid = 'imgOverlay_'+ ovlix ; ovlix ++;
			if(document.getElementById(ovlid)){
//存在しなければ作る あれば再利用
				var ovlImg = document.getElementById(ovlid);
			}else{
				var ovlImg = new Image();
				ovlImg.id = ovlid;
				ovlImg.name = ovl.text;
				ovlImg.className = 'imgOverlay';
				document.getElementById('imgPreview').parentNode.insertBefore(ovlImg,null);
			};
			if(ovlImg.src !== ovl.img.src){
				ovlImg.src = ovl.img.src;//複製
			};
			ovlImg.style.top  = document.getElementById('imgPreview').style.top;
			ovlImg.style.left = document.getElementById('imgPreview').style.left;
			ovlImg.width = Math.round(ovl.img.naturalWidth * imgScale);
			if(pman.reName.lightBox.blendingMode == 'normal'){
//ノーマル
				ovlImg.style.opacity = pman.reName.lightBox.opacity;
			}else{
//乗算||比較暗
				ovlImg.style.opacity = pman.reName.lightBox.opacity ** (ovlElements.length - ovlix);
			};
			ovlImg.style.mixBlendMode = pman.reName.lightBox.blendingMode;
			ovlImg.style.display = 'block';//再表示
		});
	};
}
/*
	画像タイムシートのオーバーレイを表示する
*/
pman.reName.showOverlayXps = function(itm){
	console.log('showOverlayXps');
}

/**
 *	params {Number} itmIdx
 *	アイテム情報をモーダルダイアログで表示
 */
pman.reName.showInfo = function(itmIdx){
	if(typeof itmIdx =='undefined') itmIdx = parseInt(xUI.contextMenu.eventSourceElement.id.split('_').slice(-1)[0]);
console.log(itmIdx);
console.log(xUI.contextMenu.eventSourceElement);
	if((itmIdx >= 0)&&(itmIdx < pman.reName.items.length))
		nas.showModalDialog(
			'alert',
			pman.reName.items[itmIdx].getInfo(true),
			pman.reName.items[itmIdx].name +'の情報'
		);
}
/**
 *	@params {Object Event | Object HTMLImageElement} img
 *	画像データをクリップボードに転送
 *	ブラウザのコンテキストメニューと同じ動作
 */
pman.reName.copyImage = function(img){
console.log(img);
	if(img instanceof Event) img = event.target;
	if(img.id =='cMcopyImage') img = document.getElementById('imgPreview');
	if(img instanceof HTMLImageElement){
//
		const canvas= document.createElement("canvas");
		canvas.width = img.naturalWidth;
		canvas.height= img.naturalHeight;
		document.body.appendChild(canvas);
		const ctx= canvas.getContext("2d");
		ctx.drawImage(img,0,0);
		canvas.toBlob(function(blob) {
			const item= new ClipboardItem({ "image/png": blob });
			navigator.clipboard.write([item]);
		});
		document.body.removeChild(canvas);
	};
}
/**
 *	@params {Object Event | Object HTMLImageElement} img
 *	アイテムデータのアドレスをクリップボードに転送
 *	引数としてimgを与えた場合のみブラウザのコンテキストメニューと同じ動作をする
 */
pman.reName.copyItemURL = function(itm){
	if(itm instanceof Event) itm = event.target;
	if(itm instanceof HTMLImageElement){
		itm = URL.createObjectURL(itm.src)　　;
	}else if(pman.reName.focus >= 0){
		itm = pman.reName.items[pman.reName.focus];
		itm = ((appHost.platform == 'Electron')&&(itm.path))? itm.path:URL.createObjectURL(itm.file)
	};
	if(typeof itm == 'string'){
		navigator.clipboard.writeText(itm).then(function() {
/* clipboard successfully set */
			console.log('writeToCLipboard');
		}, function() {
/* clipboard write failed */
			console.log('err');
		});
	};
}
/**
 *	アセット画像に名前をつけて保存
 *	引数としてimgを与えた場合のみブラウザのコンテキストメニューと同じ動作
 */
pman.reName.downloadItem = function(img){
	if(img instanceof Event) img = event.target;
	if(img instanceof HTMLImageElement){
		var dl = document.createElement("a");
		document.body.appendChild(dl);
		dl.href = img.src;
		dl.download = "download";
		dl.click();
		document.body.removeChild(dl);
	}else if(pman.reName.focus >= 0){
		var targetItem = pman.reName.items[pman.reName.focus];
		if (targetItem.type != '-group-'){
		var dl = document.createElement("a");
			document.body.appendChild(dl);
			dl.href     = ((appHost.platform == 'Electron')&&(targetItem.path))? targetItem.path:URL.createObjectURL(targetItem.file);
			dl.download = ((appHost.platform == 'Electron')&&(targetItem.path))? nas.File.basename(targetItem.path):targetItem.file.name;
			dl.click();
			document.body.removeChild(dl);
		}
	};
}
/**
 *	@params	{Boolean} status
 *	プレビューウインドウのサイズを現在のサイズで固定(true)|解除(false)する
 *  引数なしの場合は現在のウィンドウサイズを返すだけになる
 */
pman.reName.lockView = function(status){
//表示基準値を現在の状態から計算
		var sbMargin = {x:32,y:32};
		var currentPreviewBounds = document.getElementById("previewBox").getBoundingClientRect();
		var currentWidth  = document.body.clientWidth  - currentPreviewBounds.left - sbMargin.x;
		var currentHeight = document.body.clientHeight - currentPreviewBounds.top  - sbMargin.y;
	if(typeof status == 'undefined'){
		return (pman.reName.previewLock)?
			pman.reName.previewLock:[currentWidth,currentHeight];
	}else if(status){
		pman.reName.previewLock = [currentWidth,currentHeight];//この変数自体がフラグになっている
		document.getElementById('previewWindow').style.maxWidth  = Math.floor(currentWidth)+'px';
		document.getElementById('previewWindow').style.maxHeight = Math.floor(currentHeight)+'px';
		return pman.reName.previewLock;
	}else{
		document.getElementById('previewWindow').style.maxWidth  = null;
		document.getElementById('previewWindow').style.maxHeight = null;
		pman.reName.previewLock = false;//この変数自体がフラグになっている
		return [currentWidth,currentHeight];
	};
}
/**
 *	@params {Event|null}  event
 *	@params {Number}  scale
 *	@params {Object Image}  img
 *	@params {Boolean}  force
 *	プレビューの表示サイズを変更
 *	0:等倍(size 不明)|1:スクリーンフィット|2:スクリーンフィットの2倍|3:スクリーンフィットの3倍
 *	イベントが与えられない場合はセンタリングを試みる
 *	プレビュー画像が表示されていない場合は、表示用変数の変更のみにとどめる
 * previewLockデータが存在する場合は表示基準値を
 */
pman.reName.changeView = async function changeView(event,scale,img,force){
	var changeSize  = false;
	var changeScale = false;
	var changeImage = false;
//先行してスケール指定をチェック
	var current_scale = pman.reName.preview;
	if(typeof scale == 'undefined'){
		pman.reName.preview = (Math.floor(Math.abs(pman.reName.preview)) + 1) % 9;
	}else{
		pman.reName.preview = Math.abs(scale) % 9;
	};

	changeScale = (current_scale == pman.reName.preview)? false:true;
	if(changeScale) xUI.sync('previewScale');
	if(!(document.getElementById('imgPreview'))) return;

//表示基準値
/*	if(document.getElementById("previewWindow")){
		var winBounds = document.getElementById("previewWindow").getBoundingClientRect();
		sbMargin = {
			x:Math.ceil((winBounds.right-winBounds.left) - document.getElementById("previewWindow").clientWidth),
			y:Math.ceil((winBounds.bottom-winBounds.top) - document.getElementById("previewWindow").clientHeight)
		};
	};// */
	if(pman.reName.previewLock){
		var currentWidth  = pman.reName.previewLock[0];
		var currentHeight = pman.reName.previewLock[1];
	}else{
		var sbMargin = {x:32,y:32};
		var currentPreviewBounds = document.getElementById("previewBox").getBoundingClientRect();
		var currentWidth  = document.body.clientWidth  - currentPreviewBounds.left - sbMargin.x;
		var currentHeight = document.body.clientHeight - currentPreviewBounds.top - sbMargin.y;
	};
	var win = document.getElementById('previewWindow');
	var tgtImg = document.getElementById('imgPreview');

	var tgtCanvas   = document.getElementById('imgPreviewOverlay');
//	var tgtBackdrop = document.getElementById('canvasBackdrop');

if(tgtImg.width == 0)console.log(tgtImg);
	var tgtOvl = Array.from(
		tgtImg.parentNode.getElementsByClassName('imgOverlay')
	).concat(Array.from(
			tgtImg.parentNode.getElementsByClassName('imgUnderlay')
	));
//	var canvasOvl = document.getElementById('imgPreviewOverlay');//testfor canvasaddon 判定を変更したので不要
	win.style.width  = currentWidth;
	win.style.height = currentHeight;
	var winAspect = currentWidth/currentHeight;
	var baseWidth  = currentWidth;
	var baseHeight = currentHeight;
	var imgWidth  = tgtImg.width;
	var imgHeight = tgtImg.height;
	if(img instanceof HTMLImageElement){
		if(
			(tgtImg.naturalWidth  != img.naturalWidth)||
			(tgtImg.naturalHeight != img.naturalHeight)
		) changeSize = true;
		if(
			(force)||
			(tgtImg.src != img.src)
		){
			changeImage = true;
			tgtImg.src = img.src;
		};
	}else{
		img = tgtImg;
	};
console.log((img === tgtImg));
//console.log();
console.log([img.naturalWidth,img.naturalHeight]);
console.log([tgtImg.naturalWidth,tgtImg.naturalHeight]);
	var imgAspect = img.naturalWidth / img.naturalHeight;//更新
	if(
		((changeScale)||(changeSize)||(changeImage))&&
		(tgtImg)
	){
		if(pman.reName.preview == 0){
//ゼロスケールは例外として原寸に展開する
			imgWidth  = img.naturalWidth;
			imgHeight = img.naturalHeight;
		}else if(changeScale || changeSize ){
//その他は基準サイズに対して縦横大きい方を(ウインドウ最大設定に対して？)マッチさせて展開 
			if(winAspect < imgAspect){
//横マッチ
				imgWidth  = baseWidth * pman.reName.preview;
				imgHeight = Math.round(imgWidth / imgAspect);
			}else{
//縦マッチ
				imgHeight = baseHeight * pman.reName.preview;
				imgWidth  = Math.round(imgHeight * imgAspect);
			};
		}
		var imgScale = imgWidth/img.naturalWidth;

console.log([baseWidth,baseHeight]);

		if(pman.reName.canvas){
// for canvasBackdrop
			if(document.getElementById('canvasBackdrop')){
				document.getElementById('canvasBackdrop').width  = imgWidth;
				document.getElementById('canvasBackdrop').height = imgHeight;
			}
// for canvas
			pman.reName.canvas.setZoom(imgScale)   ;
			pman.reName.canvas.setWidth(imgWidth)  ;
			pman.reName.canvas.setHeight(imgHeight);
//			if(tgtBackdrop) tgtBackdrop.width = imgWidth;
//			if(document.getElementById('canvasWrap')){
//				document.getElementById('canvasWrap').style.width  = imgWidth+'px';
//				document.getElementById('canvasWrap').style.height = imgHeight+'px';
//			};
		};
		tgtImg.width  = imgWidth;
		if(tgtOvl.length){
			tgtOvl.forEach((e)=>{
				e.width = Math.round(e.naturalWidth*imgScale)
			});
		};
	};
	if(tgtImg){
//画像が表示フィールドより小さい場合・位置でセンタリング
//position:abolute
		var c_top = (win.clientHeight > imgHeight)?
			Math.floor((win.clientHeight-imgHeight)/2)+'px':"0px";
		var c_left = (win.clientWidth > imgWidth)?
			Math.floor((win.clientWidth-imgWidth)/2)+'px':
			"0px";
		if(pman.reName.canvas){c_top = "0px";c_left = "0px";};
		tgtImg.style.top  = c_top;
		tgtImg.style.left = c_left;
//test用仮コード 複数の画像がすべて同サイズであることを期待して左上合わせになっているので要修正
		if(tgtOvl.length){
			tgtOvl.forEach((e)=>{
				e.style.top  = c_top;
				e.style.left = c_left;
			});
		};

/*
//		if(canvasOvl){
//			pman.reName.canvas._originalCanvasStyle.style.top  = c_top;
//			pman.reName.canvas._originalCanvasStyle.style.left = c_left;
				pman.reName.canvas.viewportTransform = [
					imgScale,
					0,
					0,
					imgScale,
					c_left,
					c_top
				];// */
//		};
//スクロール位置を設定
//		pman.reName.previewPoint = [0.5,0.5];//default [x,y]
//canvas編集中はNOP
//		if(!(pman.reName.onCanvasedit)){
			if(
				((c_top == '0px')&&(c_left == '0px'))
			){
//画像位置が[0,0]の場合 参照位置へスクロール
				win.scrollTo(
					(tgtImg.width  * pman.reName.previewPoint[0])-(win.clientWidth  / 2),
					(tgtImg.height * pman.reName.previewPoint[1])-(win.clientHeight / 2)
				);
			}else{
				pman.reName.previewPoint = [0.5,0.5];
			};//*/
//		};
	};
}
/**
 *	params {String} sciDescription
 *		カット識別子
 *	ショット番号を設定 引数がカラの場合は、ダイアログで入力を促す
 */
pman.reName.setSCi = function(sciDescription){
	if(typeof sciDescription != 'string'){
//引数がないのでダイアログで引数を入力
//		document.getElementById('xmapstring').value pman.reName.xmap.pmu.getIdentifier('simple');
       var newSCi="";
        var msg= "タイトル・エピソード・カット番号 を入力してください" +"\n";
        msg=[msg];
        msg.push(
        	"<hr><input id='confirmTitle' type='text' autocomplete='on' list='' size=48 value='"+
        	pman.reName.xmap.title +
        	"'> : TITLE<br><input id='confirmEpisode' type='text' autocomplete='on' list='' size=48 value='"+
        	pman.reName.xmap.opus +
        	"'> : EpisodeNo<br><input id='confiemSCIs' type='text' autocomplete='on' list='' size=48 value='"+
        	pman.reName.xmap.inherit.toString()+
        	"'> : SCENE-CUT<hr>"
        );
        nas.showModalDialog(
            "confirm",
            msg,
            document.getElementById('xmapstring').value,
            '',
            function(){
            	if(this.status==0){
                	var newSCi =
						document.getElementById('confirmTitle').value + "#" +
						document.getElementById('confirmEpisode').value + "__" +
						document.getElementById('confiemSCIs').value.replace(/,/g,'_');
console.log([newSCi,document.getElementById('xmapstring').value]);
                	if((newSCi.length)&&(newSCi != document.getElementById('xmapstring').value)){
                	    pman.reName.setSCi(newSCi);
                	};
            	}
            },
            false,[100,100]
        );
    document.getElementById("nas_modalInput").focus();
	}else{
//引数がある
		
		pman.reName.xmap = new xMap(sciDescription);
		xUI.sync('xmap_idf');
	};
};
/*
 *	xMap識別子をプレフィクスに追加｜変更する
 *	A-1  =>  ABC#01__s-c123__A-1.png
 *	カット・タイムシートデータとして名付けされているアイテムは選択状態でも無視する
 */
pman.reName.setxMapName = function(){
	var xMapprefix = (pman.reName.xmap instanceof xMap)?
		decodeURI(pman.reName.xmap.getIdentifier('simple').replace(/\.xmap$/,"__")):
		document.getElementById("xmapstring").value;//生データを使う
// プロダクト部分がすでにあればスキップ
	var compareTarget = (pman.reName.xmap instanceof xMap)?
		decodeURI(pman.reName.xmap.getIdentifier('episode').replace(/\.xmap$/,"")):
		xMapprefix;
	var newNames = [];
	var backupNames = [];
// チェックアイテムに前置部分をおく
	for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if((pman.reName.items[i].selected)&&(pman.reName.items[i].text.indexOf(compareTarget) < 0)){
			newNames.push(xMapprefix + pman.reName.items[i].text);
			backupNames.push(pman.reName.items[i].text);
		};
	};
//undo付きで処理
	xUI.put([new xUI.InputUnit(
		[pman.reName.focus,pman.reName.getSelected(true)],
		newNames,
		{
			command:"name",
			focus:pman.reName.focus,
			selection:pman.reName.getSelected(true),
			backup:backupNames
		}
	)]);
}
/*
 *	Xps識別子をアイテムテキストに設定する
 *	ABC#01__s-c123__xps1...
 *	兼用カットがある場合でカット指定がなければダイアログで選択を促す
 *	xMapが存在しなければ、処理を中断する
 */
pman.reName.setXpsName = function(idx){
	if(!(pman.reName.xmap instanceof xMap)) return ;
	if(typeof idx == 'undefined'){
		if(pman.reName.xmap.pmu.inherit.length > 1){
//ダイアログで請求（後で）
			idx = 0;
		}else{
			idx = 0;
		};
	};
	if((idx >= pman.reName.xmap.pmu.inherit.length)) idx = pman.reName.xmap.pmu.inherit.length -1;
	var nameString = (pman.reName.xmap instanceof xMap)?
		decodeURI(pman.reName.xmap.getIdentifier('xps',idx)):
		document.getElementById("xmapstring").value;//生データを使う
// プロダクト部分がすでにあればスキップ
	var compareTarget = (pman.reName.xmap instanceof xMap)?
		decodeURI(pman.reName.xmap.getIdentifier('simple').replace(/\.xmap$/,"")):
		nameString;
// チェックアイテムに前置部分をおく
	var sheetCount = 0;
	var newNames = [];
	var backupNames = [];
	for (var i = 0 ; i < pman.reName.items.length ; i ++){
		if(pman.reName.items[i].text.indexOf(nameString) == 0){
			sheetCount = parseInt(pman.reName.items[i].text.slice(nameString.length)) ;
			if(! sheetCount) sheetCount = 1;
			continue;
		};
		if((pman.reName.items[i].selected)&&(pman.reName.items[i].text.indexOf(compareTarget) < 0)){
			sheetCount ++;
			newNames.push(nameString + '_xps_' + sheetCount);
			backupNames.push(pman.reName.items[i].text);
		};
	};
//undo付きで処理
	xUI.put([new xUI.InputUnit(
		[pman.reName.focus,pman.reName.getSelected(true)],
		newNames,
		{
			command:"name",
			focus:pman.reName.focus,
			selection:pman.reName.getSelected(true),
			backup:backupNames
		}
	)]);
}
/**
 *	作業ウィンドウ（パネル）を開く
 *	xUI.sWitchPanel('Workslip')へ移行する
 *	他の作業伝票と統合をする
 *	
 */
pman.reName.openWorkSlip = function(){
}
/**
 *	@params {String} jobname
 *	@returns {String}
 *	作業伝票の生成
 *	実行ごとにすべてを書き直す
 *	ユーザ入力のみ保管して最終位置にアタッチする
 */
pman.reName.getWorkSlip = function(jobname){
	if(!jobname) jobname = "";
	var workslip =[
'#nas-WORKSLIP 1.0',
'##作業      : '	+ (
	(pman.reName.xmap instanceof xMap)?
		decodeURIComponent(pman.reName.xmap.getIdentifier('full').replace(/\.xmap$/,"")):
		document.getElementById("xmapstring").value
	)+(
	(jobname)? "__"+jobname:""
	),
'##作業日    : '	+ new Date().toNASString(),
'##責任者    : '	+ ((xUI.currentUser.id)? xUI.currentUser.toString(true):"<担当者名が登録されていません>"),
'##場所      : '	+ pman.reName.baseFolder,

'##合計      : '	+ pman.reName.items.length + ' items',
'##ファイル数 : '	+ pman.reName.items.filter(function(elm){return (elm.type != '-group-')}).length + ' files',
'##タイムシート数      : '	+ pman.reName.items.filter(function(elm){return (elm.type == '-xpst-')}).length + ' files',
'##画稿数      : '	+ pman.reName.items.filter(function(elm){return (elm.type != '-asset-')}).length + ' files',
'#========================データリスト'
	];
	var current = "";
	var datalist = Array.from(pman.reName.items,(e)=>{
		return pman.reName.items.indexOf(e)+' : '+e.getPath(true)+((e.type == '-group-')?'/':nas.File.extname(e.name));
	});
/*
	var datalist = [];
	for (var g = 0 ; g < pman.reName.members.length ; g ++){
		if(pman.reName.members[g].type == '-group-'){
			datalist.push(pman.reName.members[g].text + "/");
			for (var i = 0 ; i < pman.reName.members[g].members.length ; i ++){
				datalist.push("\t\t" + pman.reName.members[g].members[i].name );
			};
		}else{
			workslip.push("\t" + pman.reName.members[g].name );
		};
	};// */
//console.log(datalist);
	workslip = workslip.concat(datalist);
//console.log(workslip);

	workslip.push('[END]');
	workslip.push("");
	return workslip.join('\n');
}
/**
 *	@params {Boolean}	save
 *	作業伝票をクリップボードに書き出す
 *	saveオプションがあればファイル保存を試みる
 *	テキストは、現在のworkslipプロパティの値をすべて使用する
 */
pman.reName.exportWorkSlip = function(save,jobname){
	if(!(xUI.currentUser.id)){
		let regist = confirm( "<担当者名が登録されていません>\n入力しますか?\nスキップ:[Cancel] / 登録する:[OK]");
		if(regist) xUI.setCurrentUser(false,function(x){console.log(x)});
	}else{
		nas.HTML.miniTextEdit.init(
			pman.reName.getWorkSlip(jobname) + pman.reName.note,
			jobname+'作業伝票を以下の内容で保存します\n申し送りは[END]の後ろに追加してください\n',
			jobname+'作業伝票保存',
			nas.File.join(pman.reName.baseFolder,"__workslip.txt"),
			function(slipContent){
				pman.reName.updateSlipNote();
//				nas.HTML.writeTextFile(slipContent,'utf-8',nas.HTML.miniTextEdit.filename);
			}
		);
	};
/*
	var content = pman.reName.getWorkSlip() + pman.reName.note;

	if (document.getElementById('slipContent')){
		content = document.getElementById('slipContent').value;
		pman.reName.updateSlipNote();
	};
	document.getElementById('work_slip_content_body').value = content;

	if((save)&&(pman.reName.items.length)&&((appHost.platform=='Electron')||(appHost.Nodejs))){
		var today = new Date();
		var savedir = nas.File.dirname(pman.reName.items[0].path);
		var slipfile = "_"+((pman.reName.xmap instanceof xMap)?
				decodeURI(pman.reName.xmap.getIdentifier('full').replace(/\.xmap$/,"__")):
				document.getElementById("xmapstring").value
				)+"filelist__"+[today.getFullYear(),today.getMonth(),today.getDate(),'.txt'].join('');
//		var savefile = nas.File.join(savedir,slipfile);
			nas.showModalDialog(
				'prompt',
				nas.localize('現在のフォルダ%1に\n画像リスト%2を保存します。\nファイル名を変更することができます。\n変更する場合はボックスの値を書き換えてください。\n同名のファイルは上書きされます。\n保存してよろしいですか？',savedir,slipfile),
				'伝票保存',
				slipfile,
				function(result){
					if(result){
						var savefile = nas.File.join(savedir,result);
console.log(savefile);
						if(fs){
							fs.writeFileSync(savefile,content,{encoding:'utf-8'});
							pman.reName.setItem(savefile);
						}else{
							uat.MH.parentModule.window.postMessage({
								channel:'callback',
								from:{name:xUI.app,id:uat.MH.objectIdf},
								to:{name:'hub',id:uat.MH.parentModuleIdf},
								command:'electronIpc.writeFileSync(...arguments);',
								content:[savefile,content,{encoding:"utf-8"}],
								callback:'pman.reName.setItem("'+ savefile +'")'
							});//electronIpc.writeFileSync(savefile,content,{encoding:'utf-8'});
// 正常に保存が完了したらアイテムエントリする
//アイテムエントリのタイプは -workslip-
						};
					};
				},
				false
			);//*/
/*		if(savefile){
			if(fs){
				fs.writeFileSync(savefile,content,{encoding:'utf-8'});
			}else{
				uat.MH.parentModule.window.postMessage({
					channel:'callback',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					to:{name:'hub',id:uat.MH.parentModuleIdf},
					command:'electronIpc.writeFileSync(...arguments);',
					content:[savefile,content,{encoding:"utf-8"}],
					callback:'pman.reName.setItem("'+ savefile +'")'
				});//electronIpc.writeFileSync(savefile,content,{encoding:'utf-8'});
// 正常に保存が完了したらアイテムエントリする
//アイテムエントリのタイプは -workslip-
			};
		};//
console.log(content);
	};
//クリップボード転送 / clipboard copy
//	var i = document.body.appendChild(document.createElement('textarea'));
//	i.value = content;
//	i.select();
//	console.log(i);
//	document.body.removeChild(i);
	if (document.getElementById('slipContent')){
		document.getElementById('slipContent').select();
		document.execCommand("Copy");
		xUI.printStatus('伝票の内容をクリップボードに転送しました');
	};//*/
}
/*
	
 */
pman.reName.setSlipNote = function(){
	if(!(xUI.currentUser.id)){
		let regist = confirm( "<担当者名が登録されていません>\n入力しますか?\nスキップ:[Cancel] / 登録する:[OK]");
		if(regist) xUI.setCurrentUser(false,function(x){console.log(x)});
	}else{
		nas.HTML.miniTextEdit.init(
			pman.reName.getWorkSlip() + pman.reName.note,
			'作業伝票を編集します\n申し送りは[END]の後ろに追加してください\n',
			'作業伝票編集',
			nas.File.basename(pman.reName.baseFolder)+"__workslip.txt",
			pman.reName.updateSlipNote
		);
	};
}

pman.reName.updateSlipNote = function(slipContent){
//伝票をクリップボードへ送り・同時に申し送りの更新をする
		nas.HTML.sendText2Clipboard(slipContent);
		var endcount = slipContent.indexOf('\n[END]\n');
		var noteText = slipContent;
		if (endcount > 0) noteText = slipContent.slice(endcount+7);
		if (pman.reName.note != noteText) pman.reName.note = noteText;
}

/**
 *	ステータス・追記型作業伝票の生成・編集・保存
 *	日付とユーザ名のみの第一行を設定
 *	現在のステータスファイルが存在すれば取り込んで追加する
 *	(アイテムリストから __[*].status.txt を検索して内容を取得)
 *	保存はダウンロード上書きまたはテキストクリップボードへの転送
 *	引数なし 戻値なし
 */
pman.reName.exportStatusWorkSlip = function(){
//第一行目としてあらかじめ空白キーワードと日付、ユーザ名を与える
//フォルダを開く時点でカレントステータスを生成したほうが良い　2024 05 01
//ステータスは ステージ略称を使用してプラスルールでステータスのステップを表記する
//LO,LO+,LO++,LO+3,LO+4....
//追加コンテンツのボタン群を定義
	var editWordList = ["[CT]","[3DLO]","[LO]","[GE]","[DO]","[PT]","","演出","監督","作監","総作監","","OK","NG","R","完了","+",new Date().toNASString('yy/mm/dd')];
	var contentUI = "<hr>";
	editWordList.forEach(function(e){
		contentUI += (e == "")?
			"<br>":
			"<button class=modalBt  onclick=nas.HTML.miniTextEdit.insert(this.innerText)> "+e+" </button>";
	});
	contentUI += "<hr>";
	contentUI += '<button class=modalBt onclick="nas.HTML.miniTextEdit.insert(\'\\n\')"> (改行) </button>';
	contentUI += '<button class=modalBt onclick="nas.HTML.miniTextEdit.insert(\'\\t\')"> (TAB) </button>';
	contentUI += '<button class=modalBt onclick="nas.HTML.miniTextEdit.insert(\' \')"> (スペース) </button>';
	
	var currentStage    = "";// CT,3DLO,LO...等
	var currentStep     = 0 ;
	var currentStatus   = "";
	var workslipContent = "";
	var currentItem = (pman.reName.isUAF)? pman.reName : pman.reName.getItem(pman.reName.focus);
	if(!( currentItem.bundleInf)) return false;
	var statusItem  = currentItem.members.find(function(e){return(e.name.match(/__(\[[^\]]+\].*)?\.status/))});
	if(!(statusItem)&&(pman.reName.focus >= 0)){
		statusItem = pman.reName.getItem(pman.reName.focus).members.find(function(e){return(e.name.match(/__(\[[^\]]+\].*)?\.status/))});
	};
	if(statusItem){
		currentStage  = currentItem.bundleInf.bundleData.auditTrail[currentItem.bundleInf.bundleData.auditTrail.length-1].stage;
		currentStep   = currentItem.bundleInf.bundleData.auditTrail[currentItem.bundleInf.bundleData.auditTrail.length-1].step;
		currentStatus = currentItem.bundleInf.status;
		workslipContent = currentItem.bundleInf.toString();
			nas.HTML.miniTextEdit.init(
				workslipContent,
				['ステータスデータを以下の内容で保存できます\n必要に従って編集してください',contentUI],
				'ステータス編集・保存',
				((statusItem === pman.reName)?
					nas.File.join(pman.reName.baseFolder,"__["+nas.plEncode(currentStage,currentStep)+"].status.txt"):
					nas.File.join(nas.File.dirname(statusItem.path),"__["+nas.plEncode(currentStage,currentStep)+"].status.txt")
				),
				function(slipContent){
//					nas.HTML.writeTextFile(slipContent,'utf-8',nas.HTML.miniTextEdit.filename);
/*
					nas.File.join(pman.reName.baseFolder,"__["+nas.plIncr(nas.plEncode(currentStage,currentStep),1)+"].status.txt"):
					nas.File.join(nas.File.dirname(statusItem.path),"__["+nas.plIncr(nas.plEncode(currentStage,currentStep),1)+"].status.txt")
*/
				}
			);
/*試験版　ファイル内容の直接編集
		if(statusItem.file){
			var reader  = new FileReader();
			reader.addEventListener('load',()=>{
console.log(reader.result);
				workslipContent = workslipContent + "\n" + reader.result;
				nas.HTML.miniTextEdit.init(
					workslipContent,
					['ステータスデータを以下の内容で保存できます\n必要に従って編集してください',contentUI],
					'ステータス編集・保存',
					nas.File.join(pman.reName.baseFolder,"__["+currentStatus+"].status.txt"),
					function(slipContent){
//						pman.reName.updateSlipNote();
//						nas.HTML.writeTextFile(slipContent,'utf-8',nas.HTML.miniTextEdit.filename);
					}
				);
			},false,);
			reader.readAsText(statusItem.file);
		}else if(statusItem.path){
			var url = new nas.File(statusItem.path).fullName.replace(/#/g,'%23');
			$.ajax({
				url:url,
				dataType: 'text',
				success: function(result){
					nas.HTML.miniTextEdit.init(
						result,
						['ステータスデータを以下の内容で保存できます\n必要に従って編集してください',contentUI],
						'ステータス編集・保存',
						nas.File.join(pman.reName.baseFolder,"__"+currentStatus+".status.txt"),
						function(){}
					)
				}
			});//
		};
*/
	}else{
		nas.HTML.miniTextEdit.init(
			workslipContent + pman.reName.note,
				['ステータスデータを以下の内容で保存できます\n必要に従って編集してください',contentUI],
				'ステータス編集・保存',
				nas.File.join(pman.reName.baseFolder,"__[].status.txt"),
				function(slipContent){
//					pman.reName.updateSlipNote();
//					nas.HTML.writeTextFile(slipContent,'utf-8',nas.HTML.miniTextEdit.filename);
			}
		);
		
	};
}
// TEST pman.reName.exportStatusWorkSlip()
/**
 *	一般テキストデータの　作成・編集・保存
 *	日付とユーザ名のみの第一行を設定
 *	現在の選択が編集可能なテキストファイルならば取り込んで追加する
 *	(.tet|.text|.json|.md|.html|.csv)
 *	保存はダウンロード上書きまたはテキストクリップボードへの転送
 *	引数なし 戻値なし
 */
pman.reName.editTextContent = function(){
//第一行目としてあらかじめ空白キーワードと日付、ユーザ名を与える
//フォルダを開く時点でカレントステータスを生成したほうが良い　2024 05 01
//ステータスは ステージ略称を使用してプラスルールでステータスのステップを表記する
//LO,LO+,LO++,LO+3,LO+4....
//追加コンテンツのボタン群を定義
	var editWordList = ["[CT]","[3DLO]","[LO]","[GE]","[DO]","[PT]","","演出","監督","作監","総作監","","OK","NG","R","完了","+",new Date().toNASString('yy/mm/dd')];
	var contentUI = "<hr>";
	editWordList.forEach(function(e){
		contentUI += (e == "")?
			"<br>":
			"<button class=modalBt  onclick=nas.HTML.miniTextEdit.insert(this.innerText)> "+e+" </button>";
	});
	contentUI += "<hr>";
	contentUI += '<button class=modalBt onclick="nas.HTML.miniTextEdit.insert(\'\\n\')"> (改行) </button>';
	contentUI += '<button class=modalBt onclick="nas.HTML.miniTextEdit.insert(\'\\t\')"> (TAB) </button>';
	contentUI += '<button class=modalBt onclick="nas.HTML.miniTextEdit.insert(\' \')"> (スペース) </button>';
	
	var workslipContent = ["",xUI.currentUser.toString(),new Date().toNASString('yy/mm/dd')].join("\t");
	var currentItem = (pman.reName.focus < 0)? false : pman.reName.getItem(pman.reName.focus);
	if((currentItem)&&( currentItem.name.match(/(\.txt|\.text|\.json|\.md|\.html|\.csv)$/))){
		
/*ファイル内容の直接編集*/
		if(currentItem.file){
			var reader  = new FileReader();
			reader.addEventListener('load',()=>{
				workslipContent = workslipContent + "\n" + reader.result;
				nas.HTML.miniTextEdit.init(
					workslipContent,
					['テキストデータを以下の内容で保存できます\n必要に従って編集できます\nファイル名は保存の際に確認してください',contentUI],
					'テキスト編集・保存',
					currentItem.name,
					function(){}
				);
			},false,);
			reader.readAsText(currentItem.file);
		}else if(currentItem.path){
			var url = new nas.File(currentItem.path).fullName.replace(/#/g,'%23');
			$.ajax({
				url:url,
				dataType: 'text',
				success: function(result){
					nas.HTML.miniTextEdit.init(
						workslipContent+"\n"+result,
						['テキストデータを以下の内容で保存できます\n必要に従って編集できます\nファイル名は保存の際に確認してください',contentUI],
						'テキスト編集・保存',
						currentItem.name,
						function(){}
					)
				}
			});//
		};
	}else{
		nas.HTML.miniTextEdit.init(
			workslipContent + pman.reName.note,
				['テキストデータを以下の内容で保存できます\n必要に従って編集できます\nファイル名は保存の際に確認してください',contentUI],
				'テキスト編集・保存',
				nas.File.join(pman.reName.baseFolder,new Date().toNASString('yymmdd')+".txt"),
				function(slipContent){
//					pman.reName.updateSlipNote();
//					nas.HTML.writeTextFile(slipContent,'utf-8',nas.HTML.miniTextEdit.filename);
			}
		);
		
	};
}
//test pman.reName.editTextContent();

/**
 *	@parmas {String} sourceString
 *	ソース文字列から素材の所属するアセットグループプリフィックスを推測して返す
 *	ソース文字列引数のない場合は選択中のアイテムの名前を使用する
 *	アセットグループのプリフィックスは、A,C,B等のグループ分けを想定している
 */
pman.reName.GroupPrefix = function(sourceString){
	var result = "";
	if(typeof sourceString == 'undefined'){
		if(
			(pman.reName.focus >= 0)&&
			(pman.reName.items[pman.reName.focus] instanceof pman.ReNameItem)
		){
//フォーカスアイテムがグループ以外ならアイテム名を使用
			sourceString = pman.reName.items[pman.reName.focus].text;
		}else{
			var g_source = [];var i_source = [];
			for(var i = 0 ; i < pman.reName.items.length; i ++){
				if(pman.reName.items[i] instanceof pman.ReNameItem){
					i_source.push(pman.reName.items[i].text);
				}else{
					g_source.push(pman.reName.items[i].text);
				};
			};
			if(g_source.length){
				sourceString = "ABC#01__s-c123";
			}else if(i_source.length){
				sourceString = i_source[0].text;
			};
		};
	};
	if(!sourceString) sourceString = "";
	if(
		(!sourceString)||
		(sourceString.match(/.+\#.+(__|\/\/)s.*\-c.+/i))
	){
//高確率で識別子 IDFからグループ名を抽出はできないのでプレフィックスリストから未使用のものを選ぶ
		var g_source = pman.reName.items.filter(function(elm){return (elm.type == '-group-');});
//console.log('select list');
		var sourceArray = pman.reName.prefix[document.getElementById('prefixSelect').value].filter(function(elm){ return(
				(!(elm.match(/^\s*$|[^A-Z]/i)))&&
				(g_source.findIndex(function(gItem){return (gItem.text == elm)}) < 0)
		)});
		if(sourceArray.length) result = sourceArray[0];
	}else if(sourceString.match(/([A-Z].*-\d+.*)(_([A-Z].*-\d+.*))*/i)){
//console.log("elementName :"+ sourceString)
//高確率で画稿名（エレメント名）なのでセル記述としてパースしてプレフィックスを連結する 既存グループの場合も排除しない（受取先で判別する）
		var descriptions = sourceString.replace(/[\/\s]/g,"_").split("_");
		if(descriptions.length) result = Array.from(descriptions,function(elm){return (new nas.CellDescription(elm).prefix)}).join('_');
	}else if(sourceString.length){
		result = sourceString;
	}
	if((! result)){
		result = pman.reName.prefix[document.getElementById('prefixSelect').value].filter(function(elm){return (!(elm.match(/^\s*$|[^A-Z]/i)))})[0];
	};
	return result;
}

/*
 *	参照アイテムからオーバーレイ名を推測する
 *	マルチネームオプションがONで複合アイテム名の場合は、複合名に含まれるすべてのアセットに対するオーバーレイ名を合成して返す
 *	
 */
pman.reName.guessOverlayName = function(refItem){
	if((!(refItem instanceof pman.ReNameItem))||(refItem.type != '-asset-')) return "";
	var sep = '_';
	if(refItem.text.match(/(\/|__|\s)/)) sep = RegExp.$1;
	var ovls = pman.reName.getOverlay(refItem);
	if(pman.reName.nameExt){
		var descrptions = nas.parseAssetIdf(refItem.text,pman.guessAssetPrefix(refItem.text));
		var result = [];
		descrptions.forEach(e =>
				result.push( e.toString()+(String('+')).repeat(ovls.length+1))
		);
		return result.join(sep);
	}else{
		return nas.CellDescription.parse(refItem.text).toString()+(String('+')).repeat(ovls.length+1);
	};
}
/**	
 *	@params {Object pman.ReNameItem} refItem
 *	@returns String
 *	リファレンスアイテムを与えて次のアイテム名を推測する
 *	複数記述は最後の記述から導く
 *	番号つきのアイテムは、親アイテムのメンバー内を検索して最大番号の次の番号を返す
 *	番号のないアイテムは"-2"を後置する
 */
pman.reName.guessNextItemName = function(refItem){
	if((!(refItem instanceof pman.ReNameItem))||(refItem.type != '-asset-')) return "";
		let sep = '_';
		if(refItem.text.match(/(\/|__|\s)/)) sep = RegExp.$1;
		let itms = refItem.parent.members;
		let ix   = itms.indexOf(refItem);
	if(pman.reName.nameExt){
		let descrptions = nas.parseAssetIdf(refItem.text,pman.guessAssetPrefix(refItem.text));
		let target = descrptions[descrptions.length-1];
		var maxCount = nas.parseNumber(target.body);
		if( isNaN(maxCount)){
			return target + '-2';
		}else{
			for(var x = 0; x < itms.length ;x ++){
				if((x==ix)||(itms[x].type != '-asset-')||(itms[x].type != '-canvasasset-')) continue;
				let cs = nas.parseAssetIdf(itm[x],pman.guessAssetPrefix(itm[x]));
				cs.forEach(e => {if((target.compare(e) > 3)&&(nas.parseNumber(e.body) > maxCount)) maxCount = nas.parseNmber(e.body)});
			};
			return [target.body,maxCount+1].join(sep);
		};
	}else{
		var ccc = nas.parseNumber(refItem.text);
		var diff = ccc;
		if(isNaN(ccc)){
			return refItem.text + '-2';
		}else{
			itms.forEach(e => {
				if((e !== refItem)&&((e.type == '-asset-')||(e.type == '-canvasasset-'))){
					let c = nas.parseNumber(e.text);
					if((!(isNaN(c)))&&(c > diff)) diff = c;
				};
			});
console.log([1,diff,ccc])
			return nas.incrStr(refItem.text,1+diff-ccc,true);//
		}
	};
}
