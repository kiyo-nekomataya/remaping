/**
 *	@fileoverview
 *	汎用（データ交換用）ストーリーボードデータを作成するためのStoryBoardクラスライブラリ
 *	nas,nas-pmdb,
 *	プロダクトごとのデータキャッシュとして使用するストーリーボードデータ（映画の構造｜編集データ）
 */
'use strict';
/*=======================================*/
// load order:6
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config    = require( './nas_common' ).config;
    var appHost   = require( './nas_common' ).appHost;
    var nas       = require( './pmio').nas;
}else if(typeof nas == 'undefined'){
	var nas = {};
}
/*
 * 最小のエントリ単位は、カラム（日本語文書では一節がカラム状になっていたのでカラムと呼ばれる）
 * 紙のストーリーボード再現のための情報はstyleプロパティ(オプショナル)として分離（ page,column等はオプショナル）
 *
 * ストーリーボードdbは、カット袋の編集に際して随時書き換わる可能性がありうる
 * データ更新の機能を整備すること
 *	カット内容の蓄積情報としてキャッシュの役割を果たすテーブル
 *	StoryBoardオブジェクトのスタイル
 *	Object style:{
 *		documentDir	:{String}	vertical|horizontal|none 絵コンテの時間進行方向,
 *		columnOrder	:[[lineOrder]]	カラム配置多次元配列テーブル,
 *		pageControl	:{Boolean}	true|false ページ管理を行うか否か,
 *		pageDir		:{String}	ttb|ltr|rtl|vertical(=ttb)|horizontal(=ltr)|none ページ配置方向,
 *		pageSize	:{String}	ページ管理時の用紙サイズ
 *	}
 *
 *
 *	contentsプロパティにコレクションされるのは、（日本の慣例にしたがって）カット　別名は　ショット
 *	並行してカット袋データ単位のコンテチップアセット（SCInfo）と同一の情報を保持するコレクションを持つ
 *
 *アセット群の中で、特定の予約グループが
 *アセットコレクションに入るコンテチップアセットは、以下のプロパティを記録するものとする
 *
 *group名予約
 *picture			:絵コンテの持っている画像 Object nas.AnimationRepalcement
 *posterPicture	:*ドキュメントの代表画像　複数可　pictureにposterプロパティをアタッチするか？
 *description		:絵コンテの記述　Object nas.AnimationDescription
 *dialog			:セリフ記述　Object nas.AnimationDialog
 *sound			:音響記述	Object nas.AnimationSound
 *timeText		:{String} timeText
 *noteImage		:参考に描かれた画像等　Object nas.NoteImage
 *
 *シナリオ予約語
 *title:
 *episode:
 *subtitle:
 *format:
 *author:
 *production:
 *date:
 *character:
 *description:
 *
 * */

nas.StoryBoard = function(productIdf,style){
	this.title		 = ''  ;//{String | Object WorkTitle}	workTitle
	this.opus		 = ''  ;//{String | Object Opus}		opus
	this.product	 = ''  ;//{String} productIdentifier 
	this.date		 = ''  ;//{String} update date
	this.description = ''  ;//{String |Object nas.AnimationDescription }	script description text
	this.endDescription= '';//{String}	script end description text
	this.token			   ;//DB接続用トークン
	this.management  = null;//管理ロックフラグ ロックの際は nas.UserInfoを配置
	this.timestamp		   ;//タイムスタンプ Unix time値  初期値 undefined
//シナリオプロパティ
	this.stage		= 'draft';//draft|script|draft-storyboard|storyboard|preview|production-cash
	this.fixed		= false;//floating|fixed
	this.scriptType = 'ja';//ja-1,ja-2,en(,cn,kr ほかは未拡張)
	this.longIndent		= '\t\t\t';
	this.shortIndent	= '\t\t';
	this.framerate  = nas.FRATE;//{null:Object nas.Framrate}
	this.format		= '';//{String}	定尺
	this.author		= '';//{String}	著者情報
	this.production	= '';//{Stirng}	製作
	this.characters	= [];
//キャストアイテムオブジェクトコレクション
	this.cast = {};
//contentsDatas
	this.scenes		= [];//SBScene  member Array
	this.xmaps		= [];//SCinfo   member Array
	this.contents	= [];//SBShot   member Array
	this.columns	= [];//SBColumn member Array
	this.sceneNumberUse		= false;
	this.shotNumberUnique	= true;
	this.activeColumnId = this.columns.length;//末尾位置　初期値0
	this.activeColumn	= this.columns[this.activeColumnId];//挿入可能カラムは undefined
//optional
	this.style = {pageControll:false};
	this.pages ;//SBpege member Array
	this.dataNode;//serviceAddress
//初期化
	if((productIdf)||(style)) this.clear(productIdf,style);
};

nas.StoryBoard.sceneRegex = new RegExp("^(\\(?(\\d+)\\)?|[○◯])\\.?([^\\n]*)\\n?");//シーン柱検出正規表現　$1=前置部 $2=シーン番号　$3=シーン記述
nas.StoryBoard.shotRegex  = new RegExp("^[◇◆]([^\\n]*)\\n?")    ;//ショット柱検出正規表現 $1=ショット（カット）記述
nas.StoryBoard.keywordAliass  = {
	title		:["title","題名","劇題","タイトル"],
	opus		:["episode","ep.","op.","opus","話数"],
	date		:["日付","date"],
	format		:["format","定尺"],
	author		:["author","脚本","screenplay","作"],
	production	:["production","製作"],
	characters	:["characters","登場人物"],
	scene		:["scene","場面","場"]
};//予約語一覧ls

/**
 *    StoryBoard抽出リスト専用のソートメソッド
 *    @params    {Array}	targetList
 *    @params    {Array sortOrders}	sortOrders
 *    @returns   {Array}
 *		targetList
 *<pre>
 *	クラスメソッド　引数として並べ替える配列を与える
 *	引数配列自体がソート対象　戻り値は引数配列
 *	不正引数が渡された場合でも引数配列を戻す
 *ソート指定配列
 *    それぞれの要素は以下の形式をとる
 *    "<ソート項目>+|-" ソート項目に続けて +(昇順),-(降順)のポストフィックスをつけたもの
 *    ソート項目は name|stage|manager|staff|user|date|status のいずれか
 *        "name"        シーン＋カット番号順	*(*印Idfに包括)
 *        "cut"         カット番号順	*(*印Idfに包括)
 *        "scene"       シーン番号順	*(*印Idfに包括)
 *        "stage"       ステージ並び順	*
 *        "manager"     担当制作順
 *        "staff"       作業担当者順
 *        "user"        最終ユーザ順
 *        "date"        最終更新日付順	*
 *        "status"      ステータス順	*
 *    これをソート順位ごとに並べた配列で指定する
 *    ポストフィックス未指定の場合は +(昇順)とする
 *    ソート引数未指定の場合 戻り値は　["name+"] 
 *    name.id等その時点でユニーク値のフィールドを第一優先でソートした場合は他の項目は無効であることに注意
 *    eg.
 *    ["manager+","date+","staff-",]
 *
 *
 *</pre>
 */
nas.StoryBoard.sortList = function sortList(targetList,sortOrders){
    if((!(targetList instanceof Array))||(targetList.length == 0)) return targetList;
    if(!(sortOrders instanceof Array)) sortOrders  = ["name+"];//for Test
//
//sort オーダーを逆順で解決する（優先度の高い方を後）引数が空配列の場合は、並べ直しなし。ソート処理自体をスキップ
//console.log(sortOrders);

	for (var so =  sortOrders.length-1; so >=0 ; so --){
		var sortType = sortOrders[so].replace(/(\-|\+)$/,'');
		var flip = (sortOrders[so].indexOf('-') > 0)? -1:1;
		var sortFn;
		switch(sortType){
		case 'name':
			sortFn = function(tgt,dst){return  flip * nas.Pm.compareCutIdf(tgt.name,dst.name)};//シーン+カット番号
		break;
		case 'cut':
			sortFn = function(tgt,dst){return flip * nas.Pm.compareCutIdf(tgt.cut,dst.cut)};//カット番号のみ(シーン制の場合のみ有効？)
		break;
		case 'scene':
			sortFn = function(tgt,dst){return  flip * nas.Pm.compareCutIdf(tgt.scene,dst.scene)};//シーン番号のみ
		break;
		case 'stage':
			sortFn = function(tgt,dst){return  flip * (tgt.stage.id-dst.stage.id)};//ステージ並び
		break;
		case 'manager':
			sortFn = function(tgt,dst){return  flip * (
			(tgt.manager.name < dst.manager.name)?-1:((tgt.manager.name == dst.manager.name)? 0 : 1 )
		);};//マネージャ並び
		break;
		case 'staff':
			sortFn = function(tgt,dst){return  flip * (
			(tgt.staff.name < dst.staff.name)?-1:((tgt.staff.name == dst.staff.name)? 0 : 1 )
		);};//スタッフ並び
		break;
		case 'user':
			sortFn = function(tgt,dst){return  flip * (
			(tgt.user.name < dst.user.name)?-1:((tgt.user.name == dst.user.name)? 0 : 1 )
		);};//ユーザ並び
		break;
		case 'date':
			sortFn = function(tgt,dst){return  flip * (tgt.date-dst.date)};//日付並び
		break;
		case 'status':
			sortFn = function(tgt,dst){return  flip * (
			(tgt.status < dst.status)?-1:((tgt.status == dst.status)? 0 : 1 )
		);};//ステータス並び
		break;
		}
//console.log(sortType);
		targetList.sort(sortFn);
	}
    return targetList;
}
/*	ストーリーボードをクリア（初期化）
*/
nas.StoryBoard.prototype.clear = function(productIdf,style){
	this.title		= '';//{String | Object WorkTitle}	workTitle
	this.opus		= '';//{String | Object Opus}		opus
	this.product	= '';//{String} productIdentifier 
	this.date		= '';//{String} update date
	this.description= '';//{String |Object nas.AnimationDescription }	script description text
	this.endDescription= '';//{String}	script end description text
//シナリオプロパティ
	this.stage		= 'draft';//draft|script|draft-storyboard|storyboard|preview|production-cash
	this.fixed		= false;//floating|fixed
	this.scriptType = 'ja';//ja-1,ja-2,en(,cn,kr ほかは未拡張)
	this.longIndent		= '\t\t\t';
	this.shortIndent	= '\t\t';
	this.framerate  = nas.FRATE;//{null:Object nas.Framrate}
	this.format		= '';//{String}	定尺
	this.author		= '';//{String}	著者情報
	this.production	= '';//{Stirng}	製作
	this.characters	= [];//castItemコレクションに換装予定 登場人物テーブルはキャストアイテムでおきかえ
	this.cast       = {};
//contentsDatas
	this.scenes		= [];//SBScene  member Array
	this.xmaps		= [];//SCinfo   member Array
	this.contents	= [];//SBShot   member Array
	this.columns	= [];//SBColumn member Array
	this.sceneNumberUse		= false;
	this.shotNumberUnique	= true;
	this.activeColumnId = this.columns.length;//末尾位置　初期値0
	this.activeColumn	= this.columns[this.activeColumnId];//挿入可能カラムは　undefined
//optional
	this.style = {pageControll:false};
	this.pages = null ;//pageCollection if use pagemode
	if(productIdf){
		var inf = nas.Pm.parseIdentifier(productIdf);
		if(inf){
			this.title = inf.title;
			this.opus = inf.opus;
//(this.opus instanceof nas.Pm.Opus)? this.opus.toString():(inf.product.title+inf.product.opus);
		}
		this.product = productIdf;
	}
	if(style){
		this.style = style;
	}
	if(this.style.pageControll) this.pages = [];//SBpege member Array
}
/*
	文字列化メソッド
	@params	{Stging} form
		出力フォーム指定文字列 screenplay|AR|storyboard|full
			screenplay	シナリオ形式（シーン）
			AR			録音台本形式（シーン｜ショット）
			storyboard	絵コンテ形式（ショット｜カラム）
			full		全出力（シーン|ショット|カラム）
*/

nas.StoryBoard.prototype.toString = function (form){
	if(! form) form = 'full';
	var result=[];
	result.push('nasMOVIE-SCRIPT 1.0');

	result.push('##[beginStartup]');

	result.push('title:\t'+this.title.toString('fullName'));
	if(this.opus instanceof nas.Pm.Opus){
		result.push('episode:\t' + this.opus.name.toString());
		result.push('subTitle:\t'+ this.opus.subtitle.toString());
	}else{
		result.push('episode:\t'+ this.opus.toString());
	}
	result.push('style:'+JSON.stringify(this.style));
	for (var prp in this){
//			(Object.keys(this[prp]).length == 0)||
		if(
			(this[prp] instanceof Function)||
			(this[prp]==null)||(typeof this[prp]=='unfefined')||(this[prp]=='')||
			(prp.match(/^(title|opus|subtitle|style|scenes|xmaps|contents|columns|characters|description|activeColumn|longIndent|shortIndent)$/i))
		) continue;
			result.push(prp +':\t'+this[prp]);
	}
	if(this.description.length){
		result.push('description:');
		result.push(this.description);
	}
	if(this.characters.length){
		result.push('characters:');
		for (var ix = 0;ix < this.characters.length;ix ++){
			result.push('\t'+this.characters[ix]);
		}
	}

	result.push('##[endStartup]');
	result.push('/*----------------------------------------------------------------*/');
	result.push('##[beginScript]');
//	if(form=='full')
	for (var cix = 0 ; cix < this.columns.length ; cix++){
		if(this.columns[cix].cid < 0){
			var scene = this.columns[cix].getScene();
			if(scene){
				result.push('/*----------------------------------------------------------------*/');
				result.push(scene.toString(form));
			}else{
				if((form=='full')||(form=='storyboard')) result.push(this.columns[cix].toString(form));
			}
		}
	};
//終了サイン
	result.push('/*----------------------------------------------------------------*/');
	result.push(["##[endScript]",this.endDescription].join('\t'));
	return result.join('\n');
}
/*
	JSON化可能オブジェクトに変換して返す
	プログラム利用のための出力なので省略は行わない

storyBoard:{
title:{Stirng},
episode:{String},
author:{};
production:

	description:{String},
	style:{Object},
	scenes:[Array of Shot]
}
getExchangeObject
*/
nas.StoryBoard.prototype.getObject = function (form){
	if(! form) form = 'Object';
	var exportProps = [
		'date',
		'description',
		'endDescription',
		'stage',
		'fixed',
		'scriptType',
		'format',
		'author',
		'production'
	];
	var result = {};
/* データ識別用のプロパティ　*/
	result.data_type = 'nasMOVIE-SCRIPT_exchange';
	result.data_version   = '1.0.0';
	result.title=this.title.toString();
	if(this.opus instanceof nas.Pm.Opus){
		result.episode  = this.opus.name.toString();
		result.subTitle = this.opus.subtitle.toString();
	}else{
		result.episode = this.opus.toString();
	}
//スタイルプロパティがあれば
	if(Object.keys(this.style).length){
		result.style = this.style;
	}
	for (var pix = 0 ; pix < exportProps.length ;pix ++){
		if(this[exportProps[pix]]){
			result[exportProps[pix]] = this[exportProps[pix]];
		}
	}
//シーン
	result.scenes = [];
	for (var cix = 0 ; cix < this.scenes.length ; cix++){
		result.scenes.push(this.scenes[cix].getObject('Object'));
	}
//フラットテーブル
	result.table = this.exportTable();
//output
	if (form=='JSON'){
		return JSON.stringify(result);
	}else{
		return result;
	}
}
/**
	台本（スクリプト）形式のテキストをパースしてオブジェクトを初期化する
	テキスト書式は、一般的なスクリプト（台本）に準ずるが、一部拡張書式が含まれる（別紙）
	現在対応しているのは、日本式の脚本及び英語形式のスクリプトに対応予定(自動判定？)
	その他の（脚本スタイル）は未定
	行内コメントは廃止
	オプションにより　パース終了時にストーリボード全体のソートを呼び出す
*/
nas.StoryBoard.prototype.parseScript = function(dataStream){
	if(! dataStream) return false;
//	dataStream = dataStream.replace(/\n{3}/g,'\n\n');//空白行を一つにまとめる
	if(!(dataStream.match(/\n[^#:\s\{\"「\n]+[\"「]/g))) this.scriptType = 'en';

	var dataArray       = dataStream.split(/\r\n|\r|\n/);
	var pathArray       = [];//コメント削除後のデータ配列
	var sceneEntry      = [];//psthAarray上のシーンカラムの位置
	var isStartup       = true;//startup(prologue)フラグ
	var hasBeginStartup = false;//スタートアップ開始サイン検出フラグ
	var hasEndStartup   = false;//スタートアップ終了サイン検出フラグ
	var hasBegin        = false;//データ開始サイン検出フラグ
	var commentSkip     = false;//第一パス用コメントスキップ状態フラグ
	var indentCount     = [];

	var endDescription  = '';
	var shortIndent = '\t\t';
	var longIndent  = '\t\t\t';
	var scriptType  = 'ja';
/*
	第一パス
	コメントをはらう
	全データの終了行を検出してそれ以降をはらう
	領域の開始・終了行を検出して記録する
	シナリオ本文の開始（Prologue終了|本文開始)｜（シーンカラム|ショットカラム|SBカラム）の初出）位置を取得する
	日本語形式か、または英文形式かの判定を行う

	インデントなしで nas.StoryBoard.DialogRegexのヒット数が0の場合は英文形式と判定する。
	** 上記判定は悪手　nas.StoryBoard.DialogRegexが　ト書に存在できないことになる。
	明示的に形式が指定された場合は、指定の形式で
	
	英文形式の場合はインデントの確認が必要
	インデント（字下げ）が空白に展開さているケースを想定して検出を行う？
	インデントは、データ内で統一されているものとする		＊＊データフォーマットの一部
	
	ロング・ミドル・ショートインデント｜インデントなしの４種にふりわける
	検出インデントが３種以下の場合は、日本形式確定？

	全角空白をインデントとしてカウントする?
	タブ＝インデント 1単位
	行頭の空白文字の連続＞カウント数を集計する
	長いインデントのあとに短いインデントが出現するパターンが
*/
	if (!dataArray[0].match(/^nasMOVIE-SCRIPT\s/)) return false;
//console.log(dataArray[0]);console.log(escape(dataArray[0].trim()));
	for (var line = 0; line < dataArray.length; line++){
		if (dataArray[line].match(/^(\s+)\S+/)) indentCount.push([RegExp.$1,line]);//判定のためのインデント集計
		if (dataArray[line].match( /^##\[(\S+)\](.*)$/ )){
			var signWord = RegExp.$1 ; var optionalText = RegExp.$2;
			if(signWord.match(/^end$|^endscript$/i)){
				endDescription=optionalText;
				break;//第一パス終了
			}else if((! hasBegin)&&(signWord.match(/^begin$|^beginScript$/i))){
				if(hasEndStartup) pathArray = pathArray.splice(hasEndStartup-pathArray.length);
				if(isStartup)     isStartup = false;
				sceneEntry      = [];
				hasBegin        = pathArray.length;
				commentSkip     = false;
			}else if((! hasEndStartup)&&(signWord.match(/^endPrologue$|^endStartup$/i))){
				isStartup       = false;
				hasEndStartup   = pathArray.length;
				commentSkip     = true;
			}else if((! hasBeginStartup)&&(signWord.match(/^beginPrologue$|^beginStartup$/i))){
				pathArray       = [];
				sceneEntry      = [];
				hasBeginStartup = pathArray.length;
				commentSkip     = false;
			}
			continue;
		}
		if (commentSkip){
			if(dataArray[line].trim().match(/^[^\*\/]*\*\/(.*)$/)){
				commentSkip = false;//フラグ下げ
				if(RegExp.$1){
					pathArray.push(RegExp.$1);
				}
			}
			continue;
		};//複数行に渡るコメントスキップモードの際の終了判定　
		if (dataArray[line].match(/^#|^\/\//)) continue;//行頭コメントをスキップ
//シーン柱先行検出
		if (
			(dataArray[line].match(nas.StoryBoard.sceneRegex))||
			(
				(sceneEntry.length == 0)&&
				(dataArray[line].match(nas.StoryBoard.shotRegex))
			)
		){
console.log(dataArray[line]);
			if((sceneEntry.length)&&(sceneEntry[sceneEntry.length-1].length == 1)) sceneEntry[sceneEntry.length-1].push(pathArray.length);
			sceneEntry.push([pathArray.length]);
		}
		if((sceneEntry.length == 0)&&(dataArray[line].match(/^\s*\<column\b/i))&&(!hasEndStartup))
			hasEndStartup = pathArray.length;
		if (! commentSkip){
//行頭（空白を含む）からのコメント開始
			if(dataArray[line].trim().match(/^\s*\/\*[^\*\/]*(\*\/(.*))?$/)){
				commentSkip = (RegExp.$1)? false:true;
				if(RegExp.$2) pathArray.push(RegExp.$2);
				continue;
			}
		}
		pathArray.push(dataArray[line]);
	}
//ループ終了・最終シーンの終端を設定
	if((sceneEntry.length)&&(sceneEntry[sceneEntry.length-1].length == 1))
		sceneEntry[sceneEntry.length-1].push(pathArray.length);
//インデント解析
	if(scriptType == 'en'){
		var indentCase=[];
		for(var ix =0 ;ix < indentCount.length ;ix++){
			indentCase.add(indentCount[ix][0]);
		}
console.log(indentCase.sort(function(a,b){return(b.length-a.length)}));
		longIndent  = indentCase[0];	 shortIndent = indentCase[1];
	}
console.log("longIndent  :"+longIndent);
console.log("shortIndent :"+shortIndent);
console.log("scriptType  :"+scriptType);
console.log(["pathArray " ,pathArray]);
console.log(["sceneEntry" ,sceneEntry]);
//console.log("isStartup,hasBeginStartup,hasEndStartup,hasBegin");console.log([isStartup,hasBeginStartup,hasEndStartup,hasBegin]);
//console.log('indentCount :');console.log(indentCount);
// */

//第一パス終了・第二パス実行前に現在のデータをクリアする エラー検出時は、クリアを行わず終了
	this.clear();
	this.endDescription = endDescription;
	this.scriptType     = scriptType;
	this.longIndent     = longIndent;
	this.shortIndent    = shortIndent;

//第2パス pathArrayを処理
//ドキュメントプロパティ取得
	var prop = '';var value = null;var prologueLength = (isStartup)? pathArray[0][0] :((hasBegin)?hasBegin:hasEndStartup);
	for (var line = 0;line < prologueLength ;line ++){
		if(pathArray[line].match(/([a-z]+):(.*)/i)){
			prop  = RegExp.$1;
			value = (RegExp.$2).trim();
//エイリアス実装予定(2019 08 15 未処理)
			if(prop.match(this.castRegex)){
				
			}else if(prop == 'episode'){
				this['opus'] = value;
			} else if(prop == 'style'){
				this[prop] = JSON.parse(value);
			}else if(value.length){
				this[prop] = value;
			}
		}else if(prop =='cast'){
			var groupData = pathArray[line].trim().replace(/[\/:\|,\s]+/,'-').split('-');
//コレクションの代用で配列を使用中
			this.cast[groupData[0]]=[];
		}else if(prop =='description'){
			this.description += pathArray[line].trim() +'\n';
		}else if((prop)&&(this.cast[prop] instanceof Array)){
//コレクションの代用で配列を使用中
			this.cast[prop].push(pathArray[line].trim());
		}else{
console.log(prop);
		}
	}
//本文処理シーン開始前カラム情報を収集
	if (prologueLength <  sceneEntry[0][0]){
		var previousScene= new nas.StoryBoard.SBScene(this,'',null,{},true);
console.log((pathArray.slice(prologueLength,sceneEntry[0][0])).join('\n'));
		previousScene.parseContent((pathArray.slice(prologueLength,sceneEntry[0][0])).join('\n'));
	}
	for (var scn = 0;scn < sceneEntry.length;scn ++){
		var dataHead = sceneEntry[scn][0];
		var dataEnd  = sceneEntry[scn][1];
		var currentScene= new nas.StoryBoard.SBScene(this,pathArray[dataHead],null,{});
console.log('scene :\n' + (pathArray.slice(dataHead,dataEnd)).join('\n'));
		currentScene.parseContent((pathArray.slice(dataHead,dataEnd)).join('\n'));
	}

	if(! this.endDescription){this.endDescription=(new Date()).toNASString()+'\t'+nas.CURRENTUSER};


//取得データとDBを照合してプロパティを補正
	var inf = nas.Pm.parseIdentifier(this.title+'#'+this.opus);
	if(inf){
		this.title = inf.title;
		this.opus = inf.opus;
		this.product = (this.opus instanceof nas.Pm.Opus)? this.opus.toString():(inf.product.title+"#"+inf.product.opus);
		this.subtitle = inf.subtitle;
	}
	if(this.title instanceof nas.Pm.WorkTitle){
		this.framerate = this.title.framerate;
	}else{
		this.framerate = nas.FRATE;
	}
	if(this.style.pageControll) this.pages = [];//pege member Array
//編集ヘッドを再初期化
	this.activeColumn = undefined;
	this.activeColumnId = this.columns.length;
	return this;
}
/*
	exchangeデータ（専用）の読み込み
	JSONでもオブジェクトでも受け取る
	scenes/階層化データ|table/フラットデータ
	いずれかを自動判定
	両方がある場合はtableを優先
*/
nas.StoryBoard.prototype.readExchange = function(sourseData){
	if(typeof sourseData == 'string') sourceData = JSON.parse(sourceData);
	if((! sourceData instanceof Object)||(Object.keys(sourceData).length == 0)) return false;
	if(
		(sourceData.data_type)&&
		(sourceData.data_type.match(/^nasMOVIE-SCRIPT(-|_)exchenge/))&&
		(sourceData.data_version)&&
		(sourceData.data_version.mach(/1\.0\.0/))
	){
		var title  = nas.pmdb.workTitles.entry(sourceData.title);
		if(! title) title = sourceData.title;
		var episode = (title instanceof nas.workTitle)?
			title.opuses.entry(sourceData.episode):nas.pmdb.products.entry(sourceData.episode);
		if(! episode) episode = sourceData.episode;
	}else{
		return false;
	}
		this.title		= title
		this.opus		= episode
		this.product	= title+"#"+episode;//{String} productIdentifier
//必ず存在するプロパティ
//	*	this.date		= sourceData.data;//{String} update date
//	*	this.description= sourceData.description;//{String |Object nas.AnimationDescription }	script description text

		this.endDescription = sourceData.endDescription;//{String}	script end description text
//シナリオプロパティ
		this.stage		= sourceData.stage ;//draft,script,draft-storyboard,storyboard,preview,production-cash
		this.fixed		= sourceData.fixed ;//floating,fixed
		this.scriptType = sourceData.scriptType;//ja-1,ja-2,en(,cn,kr ほかは未拡張)
		this.framerate  = new nas.Framerate(sourceData.framerate);//{null:Object nas.Framrate}
		this.format		= sourceData.format;//{String}	定尺
//	*	this.author		= sourceData.author;//{String}	著者情報
//	*	this.production	= sourceData.production;//{Stirng}	製作
//	*	this.characters	= sourceData.characters;//{Array}	登場人物一覧

		this.scenes		= [];//SBScene  member Array
		this.xmaps		= [];//SCinfo   member Array
		this.contents	= [];//SBShot   member Array
		this.columns	= [];//SBColumn member Array

		this.sceneNumberUse		= false;
		this.shotNumberUnique	= true;
		
//contentsDatas
		if(sourceData.table){
			this.importTable(sourceData.table);
		}else if(sourceData.scenes){
			for (var s = 0 ; s < sourceData.scenes.length ; s ++){
				for (var c = 0 ; c < sourceData.scenes[s].contents.length ; c ++){
				
					for (var m = 0 ; m < sourceData.scenes[s].contents[c].columns.length ; m ++){
						currentColumn = sourceData.scenes[s].contents[c].columns[m];
					}
				}
			}
		}
}
/*
	ストーリーボードカラムを単純な構造の配列で出力する
	@params	{String}	form　csv|JSON|Array
		配列オブジェクトで戻すか、scv文字列を選択

<pre>
フィールド並びは
[ ] "index"				//{Number Int}データ通しインデック

[0] "pageIndex"			//{Number Int}ページインデックス
[1] "pageColumnIndex"	//{Number Int}ページ内カラムインデックス
[2]	"sceneIndex"	//{Number Int}シーンインデックス
[3] "cutIndex"		//{Number Int}カットインデックス
 [4] "indexText"		//{String}シーン|カット番号（名称）IndexText|null
 [5] "pictureIndex"	//{String}ファイル名body
 [6] "contentText"	//{String}ト書き部分　URIencoded
 [7] "dialogText"	//{String}セリフ・音声部分　URIencoded
 [8] "timeText"		//{String}尺数　TC timeText
 [9] "inherit"		//{String}兼用リスト(空白あり)
 [10]"uuid"			//{String}uuid

カラムには以下の特殊カラムが存在する

	カットインデックスを持たないシーン柱に相当するカラム
カットインデックスにはどこにも所属していないことをあらわす -1 を入れる
シーンインデックスのみを持つ
インデックステキストにはシーン番号が記載される「◯」であることも多い
シーンに対する記述（シーン名等）はcontentTextに記載される
画像はブランクになる確率が高いが登録しても良い
timeTextは必ず空白

	シーンインデックス、カットインデックスを持たないコメントに相当するカラム
シーン・カットインデックスにはどこにも所属していないことをあらわす -1 を入れる
扉や、カットに対する説明のための絵や文章をカラムとして挿入できる

☆ノートイメージの扱い
ノートイメージはデータフィールドを持たないオプション画像とする。
contentTextまたはdialogTextの一部としてHTMLImageタグに準拠したタグを書き込む
これを解釈するシステムでは、表示が行われるかまたは画像に対するリンクを作成して閲覧可能にすること	

contentText及びdialogTextの書式は別紙詳解

</pre>
*/
nas.StoryBoard.prototype.exportTable = function(form,addScene){
	if(! form) form = 'Array';
	var result = [];
	var serialIndex		= 0;
	var pageIndex		= 0;
	var pageColumnIndex	= 0;
	var sceneIndex	= -1;
	var shotIndex	= -1;
/*
//カット単位でビルド
	for (var s = 0; s < this.contents.length ; s ++){
		var currentShot = this.contents[s];
		for (var c = 0; c < currentShot.columns.length ; c ++){
			var currentColumn = currentShot.columns[c];
			var currentPageIndex = (currentColumn.pgId)? currentColumn.pgId:pageIndex;
			var currentPageColumnIndex = (currentColumn.pgClm)?currentColumn.pgClm:pageColumnIndex;
			var currentSceneIndex = (currentShot.sci.scene >= 0)? currentShot.sci.scene:-1;
//

			result.push([
				currentPageIndex,
				pageColumnIndex,
				currentSceneIndex,
				s,
				((! currentColumn.indexText)&&(currentColumn.cid==0))?"◯":currentColumn.indexText,
				encodeURI(currentColumn.picture),
				encodeURI(currentColumn.description.join('\n')),
				encodeURI(currentColumn.dialog.join('\n')),
				currentColumn.timeText,
				currentShot.xmap.inherit.toString(),
				nas.uuid()
			]);
			serialIndex++;
			if(currentPageIndex != pageIndex){
				pageIndex = currentPageIndex;
				pageColumnIndex = 0 ;//リセット
			}else{
				pageColumnIndex ++ ;//inc
			}
		}
	}
*/
	for (var c = 0; c < this.columns.length ; c ++){
		var currentColumn = this.columns[c];
		var currentShot   = currentColumn.getShot();
		var currentScene  = (currentShot)? currentShot.getScene():currentColumn.getScene();
		var currentPageIndex = (currentColumn.pgId)? parseInt(currentColumn.pgId):pageIndex;
		var pageColumnIndex = (currentColumn.pgClm)? parseInt(currentColumn.pgClm):pageColumnIndex;
		var sceneId = this.scenes.indexOf(currentScene);
		var shotId  = (currentScene)? this.contents.indexOf(currentShot):-1;
		result.push([
			currentPageIndex,
			pageColumnIndex,
			sceneId,
			shotId,
			((! currentColumn.indexText)&&(currentColumn.cid==0))?"◯":currentColumn.indexText,
			encodeURI(currentColumn.picture),
			encodeURI(currentColumn.description.join('\n')),
			encodeURI(currentColumn.dialog.join('\n')),
			currentColumn.timeText,
			((currentShot)&&(currentShot.xmap))? currentShot.xmap.inherit.toString():'',
			nas.uuid()
		])
		serialIndex++;
		if(currentPageIndex != pageIndex){
			pageIndex = currentPageIndex;
			pageColumnIndex = 0 ;//リセット
		}else{
			pageColumnIndex ++ ;//inc
		}
	}

	if(form == 'csv'){
		return csvSimple.toCSV(result,true);
	}else if (form == 'JSON'){
		return JSON.stringify(result);
	}else{
		return result;
	}
}
/*
	ストーリーボードカラムを単純な構造の配列から読み込む
	csv|JSON|Array
	通常は重複エントリはリジェクト
	オプションで　重複エントリの上書きと現行データの　入れ替えが選択できる
	@params {String|Array}	dataTable
	@params	{String}	unit
		scene|cut
	@params	{String}	action
		add|overwrite|swap
	@returns {Number}　imported column count
 */
nas.StoryBoard.prototype.importTable = function(dataTable,unit,action){
	if(typeof dataTable == "string"){
		if(dataTable.match(/^\s*\[/)){
			dataTable = JSON.parse(dataTable);
		}else{
			dataTable = csvSimple.parse(dataTable);
		}
	}
	if(!(dataTable instanceof Array)) return 0;
//console.log(dataTable);
	if(! unit) unit = 'scene';//指定なければシーン単位マージ
	if(! action) action = 'add';//指定なければ追加アクション
	var tempSB = new nas.StoryBoard(this.product,this.style);
	tempSB.date				= this.date;
	tempSB.description		= this.description;
	tempSB.endDescription	= this.endDescription;
	tempSB.stage			= this.stage;
	tempSB.fixed			= this.fixed;
	tempSB.scriptType		= this.scriptType;
	tempSB.longIndent		= this.longIndent;
	tempSB.shortIndent		= this.shortIndent;
	tempSB.framerate		= this.framerate;
	tempSB.format			= this.format;
	tempSB.author			= this.author;
	tempSB.production		= this.production;
	tempSB.characters		= this.characters.slice(0);//シャローコピー
	tempSB.sceneNumberUse	= this.sceneNumberUse;
	tempSB.shotNumberUnique	= this.shotNumberUnique;
//テーブル以外を複製
//現行データをテーブルで取得
/*	if(! action == 'swap'){
		var currentTable = null;
		if(action == 'overwrite'){
			currentTable = dataTable;
			dataTable = this.exportTable();
		} else {
			currentTable = this.exportTable();
		}
		for (var d = 0 ;d < currentTable.length; d ++){
			if(currentTable[d][3] < 0 ) continue;
			dataTable.add(currentTable[d],function(tgt,dst){
				return nas.Pm.compareCutIF(tgt[11],dst[11]);
			})
		}
	}; // */
//

/*	テーブルデータは基本的にカラムデータ
	pg,pgClmはカラムプロパティとして格納するのでバッファ不要
	scn,sht,cml
*/
	var currentScn		= false;
	var currentSht		= false;
	for (var c = 0 ; c < dataTable.length ; c ++ ){
		if(dataTable[c].length < 11) continue;
//SBScene 判定　切り替わりを検知したら新規のシーンを作成してバッファを入れ替え
/*
	カラムテーブル上でシーンを切り替えるスイッチ
	1.カットに所属しないカラムを消費してシーンのみを記述する
		この場合カラムインデックステキストに S#<シーン番号>を記述するかまたは
		カラムインデックスを空にしてコンテンツテキストにS#<シーン番号>を記述する
		シーン番号は空文字列でも良い
	2.カットのインデックステキストにシーンを記述する
		S#<シーン番号>-C#<カット番号>記述を行う
	どちらでも切り替わる
*/
	var cIdx = nas.Pm.parseCutIF(dataTable[c][4]);//インデックス分解
	var scnChange = false;
	if((dataTable[c][6]!='')&&(dataTable[c][6].match(nas.StoryBoard.sceneRegex))){
//コンテンツテキストにシーン切り替え記述はあるか？
		var tmpScn = new nas.StoryBoard.SBScene(null,dataTable[c][6]);
		cIdx[1] = tmpScn.number;
		scnChange = true;//切り替え確定
	}
//	else{	cIdx[1] = '';}
//console.log(cIdx);
//console.log(scnChange);
	if(
		(! currentScn)||
		((cIdx[0]=='')&&( cIdx.length > 1))||
		(scnChange)||
		((cIdx.length > 1)&&(cIdx[1] != '')&&(currentScn.number != cIdx[1]))||
		(dataTable[c][2] >= tempSB.scenes.length)
	){
		currentScn = new nas.StoryBoard.SBScene(tempSB,(scnChange)?dataTable[c][6]:((cIdx[1]=='')?'○':cIdx[1]+'.'));
	};
	var sci = nas.Pm.parseSCi(dataTable[c][4])[0];
	var inherit = nas.Pm.parseSCi(dataTable[c][9]);
	inherit.add(sci);
	inherit.sort(function(tgt,dst){return nas.Pm.compareCutIdf(tgt.name,dst.name)});
	var newClm = new nas.StoryBoard.SBColumn(tempSB,c);
	
	newClm.pgId			= dataTable[c][0];
	newClm.pgClm		= dataTable[c][1];
	newClm.indexText	= dataTable[c][4];
	newClm.picture		= dataTable[c][5];
	newClm.description	= decodeURIComponent(dataTable[c][6]).split(/\r\n|\r|\n/);
	newClm.dialog		= decodeURIComponent(dataTable[c][7]).split(/\r\n|\r|\n/);
	if(dataTable[c][8]){
		newClm.timeText		= nas.Frm2FCT(nas.FCT2Frm(dataTable[c][8]),3);
	}else{
		newClm.timeText		= '';
	}
//	newClm.uuid			= dataTable[c][10];// ?不要
	if(
		(! currentSht)||
		((dataTable[c][4] != '')&&(currentSht.sci))||
		(dataTable[c][3] >= tempSB.contents.length)
	){
		currentSht = new nas.StoryBoard.SBShot(tempSB,sci,[newClm]);
		tempSB.contents.push(currentSht);
		tempSB.columns.push(newClm);
		if(! currentSht.getScene()){
			currentSht.scene = currentScn
			currentScn.contents.push(currentSht);
		}
	}else{
		currentSht.columns.push(newClm);
		tempSB.columns.push(newClm);
	}
/*
		dataTable[c][0] ;//"pageIndex"		//{Number Int}ページインデックス
		dataTable[c][1] ;//"pageColumnIndex"	//{Number Int}ページ内カラムインデックス
		dataTable[c][2]	;//"sceneIndex"		//{Number Int}シーンインデックス
		dataTable[c][3] ;//"cutIndex"		//{Number Int}カットインデックス
		dataTable[c][4] ;//"indexText"		//{String}シーン|カット番号（名称）IndexText|null
		dataTable[c][5] ;//"pictureIndex"	//{String}ファイル名body
		dataTable[c][6] ;//"contentText"		//{String}ト書き部分　URIencoded
		dataTable[c][7] ;//"dialogText"		//{String}セリフ・音声部分　URIencoded
		dataTable[c][8] ;//"timeText"		//{String}尺数　TC timeText
		dataTable[c][9] ;//"inherit"			//{String}兼用リスト(空白あり)
		dataTable[c][10];//"uuid"			//{String}uuid
*/
		//SBScene 判定　切り替わりを検知したら新規のシーンを作成してバッファを入れ替え
		//SBShot判定
		//SBxMap判定
		
	};
/*		this.mergeScene(tempSB,action);//scene
		this.mergeContents(tempSB,action);//
		tempSB.mergeScene(this);//
		tempSB.mergeContents(this);// */
		this.parseScript(tempSB.toString());//swap
	return this;
}
/**
 *	ストーリーボード全体を、時間軸（シーン・カット番号｜名前）でソートする
 *	シーンカット番号（名称）が与えられない要素は無視される
 *	対象テーブルはcolumns,scenes,contents,xmaps
 *	以下の順でソートを行いその結果を参照して残りのテーブルをソートする
 *	scenes
 *	scene.contents
 *	contents
 */
nas.StoryBoard.prototype.sortContents = function(){
	var newColumns = [];
//シーンをシーン番号でソート
	this.scenes.sort(function(tgt,dst){return nas.Pm.compareCutIdf(tgt.name,dst.name)});
//シーンに内包するカットをカット番号でソート
//同時に新規の全カラムコレクションを作成する
	for(var sx = 0 ; sx < this.scenes.length ; sx ++){
		this.scenes[sx].contents.sort(function(tgt,dst){return nas.Pm.compareCutIdf(tgt.name,dst.name)});
		newColumns.push(this.scenes[sx].column);
		for(var cx = 0 ;cx < this.scenes[sx].contents.length ; cx ++){
			newColumns = newColumns.concat(this.scenes[sx].contents[cx].columns);
		}
	}
//全カット一覧|xmapsをソート
	this.contents.sort(function(tgt,dst){return nas.Pm.compareCutIdf(tgt.name,dst.name)});
	this.xmaps.sort(function(tgt,dst){return nas.Pm.compareCutIdf(tgt.name,dst.name)});
//
	this.columns = newColumns;
}
/**
	ストーリーボードにシーンを挿入する
	@params	{Object nas.StoryBoard.SBScene}	scn
	@params	{Number|String}	insPt
		挿入点ID　指定IDの前方に挿入　指定のない場合は末尾へ追加
		またはキーワード'bySceneNumber'
	@returns	{Object nas.StoryBoard.SBScene}
		挿入したSBScene
	
	挿入後は、activeColumn|activeColumnId を更新する
*/
nas.StoryBoard.prototype.insertScene =function(scn,insPt){
	if(
		( this.scenes.indexOf(scn) >= 0)||
		(! scn instanceof nas.StoryBoard.SBScene)
	) return false;
	if(scn.parent !== this) scn.parent = this;
	if(isNaN(insPt)){
		if((insPt == 'bySceneNumber')&&(this.scenec.length > 1)){
			var startVl = nas.Pm.compareCutIdf(this.scnecs[0].name,scn.name);
			for (var i = 1 ; i < this.scenes.length ; i++){
				if (startVl != nas.Pm.compareCutIdf(this.scenes[i].name+'-0',scn.name+'-0')){
					insPt = i;
					break;
				}
			}
		}
		insPt = this.scenes.length;
	}else{
		insPt = parseInt(insPt);
		if(insPt < 0) this.scenens.length + instPt;//負数の指定は末尾から
		if(insPt < 0) instPt = 0;//なお負数ならば０に
		if(insPt > this.scenes.length) insPt = this.scenes.length;
	}
//挿入前に現ショット|カラム挿入オフセットIDを取得
	if(insPt == this.scenes.length){
		var insOffsetSht = this.contents.length;
		var insOffsetClm = this.columns.length;
	}else{
		if(this.scenes[insPt].contents.length){
			var insOffsetSht = this.contents.indexOf(this.scenes[insPt].contents[0]) + 1;
			var insOffsetClm = this.columns.indexOf(this.scenes[insPt].contents[0].columns[0]) + 1;
		}else{
			var prevScn = (insPt > 0)? this.scenes[insPt-1]:null;
			if(prevScn){
				var insOffsetSht = this.contents.indexOf(prevScn.contents[prevScn.contents.length-1]) + 1;
				var insOffsetClm = this.columns.indexOf(
					prevScn.contents[prevScn.contents.length-1].columns[prevScn.contents[prevScn.contents.length-1].columns.length-1]
				) + 1;
			}else{
				var insOffsetSht = 0;
				var insOffsetClm = 0;
			}
		}
	}
//挿入する
	this.scenes.splice(insPt,0,scn);
//被挿入シーンのカット|カラムをフラットコレクションに追加
	var stc = 0;
	for(var s = 0 ; s < scn.contents.length ; s ++){
		var insSx = this.contents.indexOf(scn.contents[s]);
		if (insSx < 0) {
//既存カットでないので追加
			this.contents.splice(insOffsetSht + s,0,scn.contents[s]);
			for (var c = 0 ;c< scn.contents[s].columns.length ; c ++){
				var insCx = this.columns.indexOf(scn.contents[s].columns[c]);
				if (insCx < 0) {
//既存カラムでないので追加
					this.columns.splice(insOffsetClm + stc,0,scn.contents[s].columns[c]);
					stc++;
				}
			}
		}
//カットに対応するカット袋を検索して存在しなければ作成してカットに上書き登録
		var insCb = scn.contents[s].getMap();
		if((scn.contents[s].sci instanceof nas.Pm.SCi)&&(insCb == null)){
			scn.contents[s].xmap = new nas.StoryBoard.SBxMap(this,scn.contents[s].sci.toString('full'));
		}else{
			scn.contents[s].xmap = insCb;
		};//カット番号未定ショットは、xmapの登録を保留(nullで放置)
	}
	this.activeColumnId = this.columns.indexOf(this.scenes[insPt+1].contents[0].columns[0])+1;
	this.activeColumn = this.columns[this.activeColumnId];
	return scn;
}
/**
	ストーリーボードにショット(カット)を挿入する
	@params	{Object nas.StoryBoard.SBShot}	sht
	@params	{Number|String}	insPt
		挿入点ID　ショットIDで指定
		指定IDの前方に挿入　マイナス指定は後ろから
		文字列'byShotNumber' の場合は先頭からショット順の挿入位置を探す
		この場合、ショット情報からシーンを導出して、存在しない場合はシーンの作成も行う
		指定のない場合｜不正指定は末尾へ追加　ショットコレクションインデックス 
	@params	{Number}	offset
		挿入点加算オフセット　後方挿入時に１以上の値を与える
	@returns	{Object nas.StoryBoard.SBShot}
		挿入したshotオブジェクト
	挿入位置の計算のみを受け持ち、実際の挿入はSBSceneのメソッドを呼び出す
	戻り値は呼び出されたメソッド側に依存
	このメソッド内でアクティブポイントの変更は行わない
	同一ショットの挿入は禁止
	無名ショット以外の同名ショットの挿入は禁止
*/
nas.StoryBoard.prototype.insertShot =function(sht,insPt,offset){
	if(
		(! sht instanceof nas.StoryBoard.SBShot)||
		( this.contents.indexOf(sht) >= 0)||
		((sht.name != '')&&(this.entry(sht.name)))
	) return false;

	if(sht.parent !== this) sht.parent = this;//被挿入ショットの親を変更する（複製した方が良いか？）
	if(isNaN(insPt)){
//数値でない場合は、カット番号として挿入点を検索　対象のショットIDに変換
		if((insPt == 'byShotNumber')&&(this.contents.length > 1)){
			var startVl = nas.Pm.compareCutIdf(this.contents[0].name,sht.name);
			var i
			for (i = 1 ; i < this.contents.length ; i++){
				if (startVl != nas.Pm.compareCutIdf(this.contents[i].name,sht.name)) break;
			}
			insPt = i;//ブレーク時点の助変数で設定
		}else{
			insPt = this.contents.length-1;
		}
	}else{
		insPt = parseInt(insPt);
	}
	if(insPt < 0) insPt = this.columns.length + insPt;
	if(insPt < 0) insPt = 0;
//console.log(insPt);
 try{
//指定位置のショットの所属シーンを取得そちらへ処理を移行して終了
	var currentSht = this.contents[insPt];
	var parentScn = this.contents[insPt].currentSht.getScene();
	var insertShotAddress = parentScn.contents.indexOf(currentSht);//必ず存在する
	insertShotAddress += (offset)? 1:0;//オフセット指定があれば後方挿入
	return parentScn.insertShot(sht,insertShotAddress);
  } catch (err){
  	console.log(err);
	return null;
  }
}
/**
	ストーリーボードに直接カラムを挿入する
	@params	{Object nas.StoryBoard.SBColumn}	clm
	@params	{Number}	insPt　あれば　なければ activeColumnId
		挿入点ID　0~ 指定IDの前方に挿入　指定のない場合｜不正指定は末尾へ追加
	@returns	{Object nas.StoryBoard.SBColumn}
		挿入したSBColumn
	操作ヘッド位置のカラムが所属するカットに対しての挿入に置き換える
	カラムがショットに所属しない場合、直接フリーカラムとして挿入する
*/
nas.StoryBoard.prototype.insertColumn =function(clm,insPt){
	if(
		( this.columns.indexOf(clm) >= 0)||
		(! clm instanceof nas.StoryBoard.SBColumn)
	) return false;

	if(clm.parent !== this) clm.parent = this;

	if(isNaN(insPt)){
		insPt = this.activeColumnId;
	}else{
		insPt = parseInt(insPt);
	}
//指定位置のカラムの所属ショットを取得　存在すればそちらへ処理を移行して終了
	var parentSht = this.columns[insPt].getShot();
	if(parentSht){
		return parentSht.insertColumn(clm,insPt-this.columns.indexOf(parentSht.columns[0]));
	}
//所属ショットが存在しないので直接挿入する
	this.columns.splice(insPt,0,clm);

	this.activeColumnId = insPt + 1;
	this.activeColumn = this.columns[this.activeColumnId];
	return clm;
}
/*TEST
//空シーンを作って挿入
A = new nas.StoryBoard.SBScene(null,'○ マンドリン酒場（夜）');
test.SB.insertScene(A,1);
B = new nas.StoryBoard.SBShot(null,new nas.Pm.SCi('123'),[]);
A.insertShot(B);
C = new nas.StoryBoard.SBColumn(test.SB,0);
B.insertColumn(C);
C.parseContent(`◇s-c008(3+6)
<column cid=0 picture='file:URL' width=640px height=360px timeText='3+6/OL(1+0)/'>
	汗だくのオサゲ、アップで 
オサゲ「これ、ついでに買ってきちゃった」
	アイスバーを差し出して「トクイ！」`);
test.SB;

*/
/*		編集ヘッドの移動
	指定カラムIDへアクティブ編集カラムを移動させる
	カラムID で指定　カット番号　シーン番号　オフセット等をパースしてカラムIDへ変換する機能あり
	カラム数よりも多い値はカラム数へまとめる
	引数無しでヘッドの現在位置を返す
	@params	{String|number}	to
		整数値ならばカラムIDとして解釈
		キーワードの場合必要に従って第二引数を指定数値と解釈する
		for|+|back|-|scene+|scene-|cut+|cut-|CutIF
	@params	{String|number}	unit
	@returns {number} activeColumnId
*/
nas.StoryBoard.prototype.moveHead = function(to,unit){
//	if(this.fixed) return false;//編集にはロック解除が必要 移動は編集にあたらないとする
	var targetId = this.activeColumnId;
	if(this.columns[targetId] !== this.activeColumn)this.activeColumn=this.columns[targetId];
	if(typeof to == 'number'){
		targetId = parseInt(to);
		if (targetId < 0) targetId = this.columns.length + targetId;//負数は後方からのカウント数に変換
	}else{
		to = String(to);
		var unitCount = parseInt(unit);
		var currentShot  = (this.activeColumn)? this.activeColumn.getShot():undefined;
		var currentScene = (currentShot)? currentShot.getScene():undefined;
		switch (to){
		case 'start':targetId = 0; break;
		case 'end'  :targetId = this.columns.length; break;
		case 'for':;//加算方向オフセット
		case '+':
			if(! isNaN(unitCount)) targetId = targetId + unitCount;
		break;
		case 'back':;//減算方向オフセット
		case '-':
			if(! isNaN(unitCount)) targetId = targetId - unitCount;
		break;
		case 'scene':;//シーンID 指定
			if(! isNaN(unitCount)){
				if(unitCount < 0) unitCount = this.scenes.length + unitCount;
				if(unitCount < 0) unitCount = 0;
				if(unitCount > this.scenes.length) unitCount = this.scenes.length;
				currentScene = this.scenes[unitCount];
				if(currentScene) {
					targetId = this.columns.indexOf(currentScene.contents[0].columns[0]);
				}else{
					targetId = this.columns.length;
				}
			}
		break;
		case 'scene-':;//シーンIDオフセット(マイナス)
			if(! isNaN(unitCount)) unitCount = - unitCount;
		case 'scene+':;//シーンIDオフセット
			if(! isNaN(unitCount)){
				var scnIndex = this.scenes.indexOf(currentScene) + unitCount;
				if(scnIndex < 0) scnIndex = 0;
				if(scnIndex > this.scenes.length) scnIndex = this.scenes.length;
				currentScene = this.scenes[scnIndex];
				if(currentScene) {
					targetId = this.columns.indexOf(currentScene.contents[0].columns[0]);
				}else{
					targetId = this.columns.length;
				}
			}
		break;
		case 'cut':;//カットID
		case 'shot':
			if(! isNaN(unitCount)){
				if(unitCount < 0) unitCount = this.contents.length + unitCount;
				if(unitCount < 0) unitCount = 0;
				if(unitCount > this.contents.length) unitCount = this.contents.length;
				currentShot = this.contents[unitCount];
				if(currentShot) {
					targetId = this.columns.indexOf(currentShot.columns[0]);
				}else{
					targetId = this.columns.length;
				}
			}
		break;
		case 'shot-':;//カットIDオフセット(マイナス)
		case 'cut-':
			if(! isNaN(unitCount)) unitCount = - unitCount;
		case 'cut+':;//カットIDオフセット
		case 'shot+':
			if(! isNaN(unitCount)){
				var shtIndex = this.contents.indexOf(currentShot) + unitCount;
				if(shtIndex < 0) shtIndex = 0;
				if(shtIndex > this.contents.length) shtIndex = this.contents.length;
				currentShot = this.contents[shtIndex];
				if(currentShot) {
					targetId = this.columns.indexOf(currentShot.columns[0]);
				}else{
					targetId = this.columns.length;
				}
			}
		break;
		default:
			var Inf = nas.Pm.parseCutIF(to);//指定値をカット番号としてパース
			if((Inf[0]=='')&&(Inf.length>1)){
				var targetScene = this.scenes.find(function(element,index,array){
					return ((element.number)&&(element.number == Inf[1]))
				},this);//シーン指定
				if(targetScene) targetId = this.columns.indexOf(targetScene.contents[0].columns[0])
			}else{
				var targetShot = this.contents.find(function(element,index,array){
					return ((element.sci)&&(nas.Pm.compareCutIdf(element.sci.name,to)==0));
				},this);//シーン指定
				if(targetShot) targetId =  this.columns.indexOf(targetShot.columns[0]);
			}
		}
	}
//
	if(targetId < 0) targetId = 0;//限界値でクリップ 0以下は0へ
	if(targetId > this.columns.length ) targetId = this.columns.length;//限界値でクリップ 最大値はlength（要素なし）

	this.activeColumnId = targetId;
	this.activeColumn = (targetId == this.columns.length)? undefined : this.columns[this.activeColumnId];
	return this.activeColumnId;
//	return this.activeColumn;
}
/*TEST
	test.SB.fixed = false;//ロック解除
	console.log(test.SB.moveHead(0));//0
	console.log(test.SB.moveHead(-1));//
	console.log(test.SB.moveHead(20));
	console.log(test.SB.moveHead('start'));
	console.log(test.SB.moveHead('end'));
	console.log(test.SB.moveHead('scene',0));
	console.log(test.SB.moveHead('scene',-2));
	console.log(test.SB.moveHead('scene+',1));
	console.log(test.SB.moveHead('scene-',1));
	console.log(test.SB.moveHead('cut',4));
	console.log(test.SB.moveHead('cut',-2));
	console.log(test.SB.moveHead('cut+',4));
	console.log(test.SB.moveHead('cut-',-4));
	console.log(test.SB.moveHead('s-c7'));
	console.log(test.SB.moveHead('s#1'));
	
*/
/**
	ストーリーボード要素を編集する統一制御メソッド
	@params	{String}	action
		insert|add|replace|remove|
		操作対象IDは、編集ヘッド位置(カラムアドレス)
		各オブジェクト内での位置ではない
		あらかじめ編集ヘッドをmoveHeadコマンドで移動させておく必要がある
		
	@params	{Array of Object nas.StoryBoard.SBScene|nas.StoryBoard.SBShot|nas.StoryBoard.sbColumn | String } 	unit
		配列で操作オブジェクトを与える
		削除の場合は配列でなく削除する対象キーワード　scene|shot|cut|column　未指定ならば column 削除数は　第三引数を使用
		配列内のオブジェクトは一括でなく順次処理
		引数がコレクション既存メンバーであった場合は処理スキップ
		要素ごとに編集点を自動判別
		アクティブ編集点のある　カラム・ショット・シーンを自動判別して編集点を割り出す
		シーンが与えられた場合は、アクテイブシーン
		ショットでは、アクティブショット
		カラムならばアクティブカラムの位置が編集点となる
		insert 前方挿入・add 最終位置・replace|remove アクティブオブジェクト
		後方挿入が必要な場合は、ヘッド位置を一つ後方へ移動する必要がある
		ヘッド位置は最終エレメントの後ろまで移動可能
		
		例外値として　activeColumn が undefinedのケースが存在する（カラム数０＝カラム登録前）
	@returns {Array}
		edited Object
		返り値は、各操作コマンドの返り値の配列
*/
nas.StoryBoard.prototype.edit =function(action,unit){
//if(this.activeColumn == undefined) console.log(this);
	if((this.fixed)||(! action)) retrun ;//編集にはロック解除|コマンドが必要
	var result = [];
	var currentShot  = (this.activeColumn)? this.activeColumn.getShot():undefined;
	var currentScene = (currentShot)? currentShot.getScene():undefined;
//console.log([this.activeColumnId,this.activeColumn,currentShot,currentScene]);

	if(action == 'remove'){
//削除系（引数はターゲット種別文字列 削除数は第３引数）
		var removeTarget = unit;
		var removeCount = parseInt(arguments[2]);
//console.log('action remove :'+removeCount +':');
//console.log([this.activeColumn,currentShot,currentScene]);
		if((isNaN(removeCount))||(removeCount <= 0))return ;
		switch(removeTarget){
		case "scene":
			if(! currentScene) return false;//例外処理組込前
			var targetId = this.scenes.indexOf(currentScene);
			if(removeCount > (this.scenes.length - targetId))
				removeCount = this.scenes.length - targetId;
			for(var rx = 0 ; rx < removeCount ; rx ++){
				 result.push(this.scenes[targetId].remove());
			}
		break;
		case "shot":
		case "cut":
			if(! currentShot) return false;//例外処理組込前
			var targetId = this.contents.indexOf(currentShot);
			if(removeCount > (this.contents.length - targetId))
				removeCount = this.contents.length - targetId;
			for(var rx = 0 ; rx < removeCount ; rx ++) result.push(this.contents[targetId].remove());
		break;
		case "columns":
		default:
			var targetId = this.activeColumnId;
			if(removeCount > (this.columns.length - targetId))
				removeCount = this.columns.length - targetId;
			for(var rx = 0 ; rx < removeCount ; rx ++) result.push(this.columns[targetId].remove());
		}
//console.log(this.activeColumnId);
		return result;
	}else{
//引数データが存在する処理
//console.log('action '+action);
//console.log([this.activeColumnId,this.activeColumn,currentShot,currentScene]);
/*
	挿入処理後にヘッド位置は次挿入位置へ移動するのでくりかえし処理のみ行う
	ヘッドが占位するカラムがショット｜シーンに所属しない場合は、後方最寄りのショット｜シーンに対する操作に置き換える
*/
		if(!( unit instanceof Array)) unit = [unit];
//console.log(unit);
		for (var ux = 0 ; ux < unit.length ; ux ++){
			var targetObj = unit[ux];
//console.log(targetObj);
			if (targetObj instanceof nas.StoryBoard.SBScene){
				switch(action){
				case	'insert':
					result.push(this.insertScene(targetObj,this.scenes.indexOf(currentScene)));
				break;
				case	'add':
					result.push(this.insertScene(targetObj,this.scenes.length));
				break;
				case	'replace':
					var idx = this.scenes.indexOf(currentScene);
					var rmv = currentScene.remove();
					if(rmv){
						result.push([rmv,this.insertScene(targetObj,idx)]);
					}else{
						result.push([rmv]);
					}
				break;
				default :
					//NOP
				}
			}else if (targetObj instanceof nas.StoryBoard.SBShot){
//SBShotのアドレス変換はここで行う。 カラムID to シーン内ショットID
				var targetSht  ;var targetScn;
				var targetShtId;var targetScnId;
				if(!(currentShot)){
//console.log('no currentShot');
					if(this.columns.length == 0){
//エントリがまだないので新規シーンを作成してショットを登録する
						var scnName = (targetObj.sci.scene=='')? '○ ':targetObj.sci.scene+'.';
						targetScn = new nas.StoryBoard.SBScene(this,scnName);
						targetShtId = 0;
						targetScnId = this.scenes.indexOf(targetScn);
					}else if(this.activeColumnId >= this.columns.length){
//アクティブカラムが、最後尾の追加位置にあるので、最後尾のショットを選択する
						targetScnId = this.scenes.length-1;
						targetScn   = this.scenes[targetScnId];
						targetShtId = targetScn.contents.length-1;
						targetSht   = targetScn.contents[targetShtId];
					}else{
//アクティブカラムが存在するがショットに所属していないので、その後方ショットを検索してターゲットを移動する
//後方ショットが存在しない場合は、最後尾にシーンを作成してショットを登録
						var c;
						for (c = this.activeColumnId;c<this.columns.length;c++){
							targetSht = this.columns[c].getSht();
							if(targetSht){targetScn = targetSht.getScene(); break;}
						}
						if (c < this.columns.length){
							targetScnId = this.scenes.indexOf(targetScn);
							targetShtId = targetScn.contents.indexOf(targetSht);
						}else{
							var scnName = (targetObj.sci.scene=='')? '○ ':targetObj.sci.scene+'.';
							targetScn = new nas.StoryBoard.SBScene(this,scnName);
							targetShtId = 0;
							targetScnId = this.scenes.indexOf(targetScn);
						}
					}
//console.log([this.activeColumnId,targetScn,targetSht,targetScnId,targetShtId]);
				}else{
					targetSht = currentShot;
					targetScn = targetSht.getScene();
					targetShtId = currentScene.contents.indexOf(currentShot);
					targetScnId = this.scenes.indexOf(currentScene);
				}
				switch(action){
				case	'insert':
					result.push(targetScn.insertShot(targetObj,targetShtId));
				break;
				case	'add':
//console.log([this.activeColumnId,targetScn,targetSht,targetScnId,targetShtId]);
					result.push(targetScn.insertShot(targetObj,targetScn.contents.length));
				break;
				case	'replace':
// replaceのためには交換ショットが必ず必要なので遷移はしない　対応ショットがない場合失敗
					if(currentShot){
						var rmv = currentShot.remove();
//console.log(currentShot);
						if(rmv){
							result.push([rmv,this.insertShot(targetObj,this.activeColumnId)]);
						}else{
							result.push([rmv]);
						}
					}else{
						result.push([null]);
					}
				break;
				default :
					//NOP
				}
			}else if (targetObj instanceof nas.StoryBoard.SBColumn){
				switch(action){
				case	'insert':
					result.push(this.insertColumn(targetObj,this.activeColumnId));
				break;
				case	'add':
					result.push(this.insertColumn(targetObj,this.columns.length));
				break;
				case	'replace':
					var idx = this.activeColumnId;
					var rmv = this.activeColumn.remove();
					if (rmv){
						targetObj.cid = rmv.cid;
						result.push([rmv,this.insertColumn(targetObj,idx)]);
					}else{
						result.push(null);
					}
				break;
				default :
					//NOP
				}
			}else{
				result.push(null);//処理失敗のフラグ
			}
//1ループごとにカレントターゲットの更新を行う
			currentShot  = (this.activeColumn)? this.activeColumn.getShot():undefined;
			currentScene = (currentShot)? currentShot.getScene():undefined;
		}
		return result;
	}
}
/*TEST
0: エラー終了成功
//オリジナル　ロック解除
test.SB.fixed = false;
//複製をとる
var copySB = new nas.StoryBoard();
copySB.parseScript(test.SB.toString());
//console.log(copySB.toString());

copySB.moveHead('+',0);

//　引数配列    [['moveHead','shot',1],['edit','insert',test.SB.contents[4]],"(! (result[0] instanceof nas.StoryBoard.SBShot))","[currentSht,result,copySB.activeColumnId]"],


var doArguments=[
    [['moveHead','shot',2],['edit','replace',test.SB.contents[4]],
        "((result[1]))","[copySB.activeColumnId,currentClm,currentSht,currentScn,result]"],
    [['moveHead','shot',3],['edit','replace',test.SB.contents[4]],
        "((result[1])&&(test.SB.contents[4].name == result[1].name))","[copySB.activeColumnId,currentClm,currentSht,currentScn,result]"],
    [['moveHead','shot+',1],['edit','replace',test.SB.contents[4]],
        "((result[1])&&(test.SB.contents[4].name == result[1].name))","[copySB.activeColumnId,currentClm,currentSht,currentScn,result]"],
    [['moveHead','end',0],['edit','add',test.SB.contents[4]],
        "((shtCount + 1 ) == copySB.contents.length)","[shtCount,result,copySB.contents.length]"],
    [['moveHead','shot',0],['edit','add',test.SB.contents[4]],
        "((shtCount + 1 ) == copySB.contents.length)","[currentScn,currentSht,shtCount,result,copySB.contents.length]"],
    [['moveHead','shot',2],['edit','remove','shot',2],
        "(shtCount > copySB.contents.length)","[shtCount,copySB.contents]"],
    [['moveHead','shot',0]],
    [['moveHead','+',1],['edit','remove','column',1],
        "(clmCount > copySB.columns.length)","[clmCount,copySB.columns]"],
    [['moveHead','scene',3],['edit','remove','scene',8],
        "(scnCount > copySB.scenes.length)","[scnCount,copySB.scenes]"]
];

//try {
for (var tst = 0 ;tst <doArguments .length; tst ++){
//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> test : No.'+tst);
//console.log(doArguments[tst]);
    var resAdd = copySB[doArguments[tst][0][0]](doArguments[tst][0][1],doArguments[tst][0][2]);
//console.log(doArguments[tst][0].join()+'>--------------- move to :'+copySB.activeColumnId);
    if(doArguments[tst].length == 1) continue;//移動コマンドのみのエントリを処理
//ターゲットポイントが末尾に入るとcurrentColumnはundefinedになる（正常）その場合replaceは不能でaddのみが正常に働く
    var scnCount = copySB.scenes.length;
    var shtCount = copySB.contents.length;
    var clmCount = copySB.columns.length;
    var currentClm = copySB.activeColumn;
    var currentSht = (currentClm)? currentClm.getShot():undefined;
    var currentScn = (currentSht)? currentSht.getScene():undefined;
    var result;
//console.log([resAdd,copySB.activeColumnId,currentClm,currentSht,currentScn]);
//console.log(doArguments[tst]);
    if(doArguments[tst][1].length > 3){
        result = copySB[doArguments[tst][1][0]](doArguments[tst][1][1],doArguments[tst][1][2],doArguments[tst][1][3]);
    }else{
        result = copySB[doArguments[tst][1][0]](doArguments[tst][1][1],doArguments[tst][1][2]);
    }
    if(result){
        console.log((eval(doArguments[tst][2]))?"OK":eval(doArguments[tst][3]));
    }else{
        console.log(result);
    }
}
//} catch (err){console.log(err)}
//第４シーンから８シーン削除（実際は一つ）
//第３カットから２カット削除
//第１カットから２カラム目を削除
//オリジナルのカット4を第２カットとして挿入
//オリジナルのカット4を先頭と交換
//オリジナルのカット4を末尾に追加
copySB.moveHead('end');
var bkup=copySB.activeColumn
var result = copySB.edit('add',test.SB.contents[4]);

//console.log([bkup,test.SB.contents[4].sci,result]);
//console.log([bkup,test.SB.contents[4].sci,result]);

//新規カラムを末尾に追加
copySB.moveHead('end');
copySB.edit('add',new nas.StoryBoard.SBColumn(0));
//オリジナルのカラム10(カット未所属)を先頭と交換
copySB.moveHead('column',0);
copySB.edit('replace',test.SB.columns[10]);
//オリジナルのカラム11を末尾前に追加
copySB.moveHead(-1);
copySB.edit('insert',test.SB.columns[11]);


//オリジナルの第２シーンを第３シーンとして挿入
copySB.moveHead('scene',2);
copySB.edit('insert',[test.SB.scenes[1]]);


;//
 */
/**
 *	ストーリーボードから任意のデータ単位(shot|cut|xmap)をIdfで取得するメソッド
 *	Idfの示すデータ単位がない場合はショットを戻す
 *	@params {String} idf
 *	 shot identifier
 */
nas.StoryBoard.prototype.entry = function(idf){
	var shotInfo  = nas.Pm.parseSCi(idf);
if(!(shotInfo[0] instanceof nas.Pm.SCi))console.log([idf,shotInfo]);
	var shotName  = shotInfo[0].toString('cut');
//	var shotName  = (shotInfo[0] instanceof nas.Pm.SCi)?shotInfo[0].toString('cut'):shotInfo[0];
	var entryInfo = nas.Pm.parseCutIF(shotName);
	return this.contents.find(function(element,id,array){
		return (nas.Pm.compareCutIdf(element.name,shotName) == 0);
	},this);
}
/**
 *	ストーリーボードから指定のデータ単位をtokenで取得するメソッド
 *	uatの場合は id==token
 *	@params {String} token
 *	@params {String} dataKind
 *	 data kind (cut|shot|cut_bag|xmap)
 */
nas.StoryBoard.prototype.getEntryByToken = function(token,dataKind){
	var targetArray
	if((dataKind == 'xmap')||(dataKind == 'cut_bag')){
		targetArray = this.xmaps;
	}else{
		targetArray = this.contents;
	}
		return targetArray.find(function(element){
				return (element.token == token);
		});
}
/**
 *	ストーリーボードから指定のデータ単位をidで取得するメソッド
 *	uatの場合に限りid==token
 *	@params {String} id
 *	@params {String} dataKind
 *	 data kind (cut|shot|cut_bag|xmap)
 */
nas.StoryBoard.prototype.getEntryById = function(id,dataKind){
	var targetArray;
	if((dataKind == 'xmap')||(dataKind == 'cut_bag')){
		targetArray = this.xmaps;
	}else{
		targetArray = this.contents;
	}
		return targetArray.find(function(element){
				return (element.id == id);
		});
}

/*
絵コンテは以下の基本データ構造を持つ

Storyboard:{
	scenes:[
		scene:{
			contents:[
				cut{
					xmap:{所属するカット袋オブジェクト(参照)}
					columns:[
						column{
							indexText:{},
							picuture:{},
							description:{},
							dialog:{},
							timeText:{}
						}...
					]
				}...
			]
		}....
	],
	xmaps[
		inherit:[
			cut:{内包するカットへの参照}...
		]
	]
}
		

切り出した絵を主体に考えた場合は、カラムを作成することになるので

切り出し中は、以下のようなフラットなデータ構造にしておいて最後にストーリーボード化するのが良い。
このデータは、そのままStoryBoardオブジェクトの初期化に使用できます

{
"pageIndex":0,			//{Number Int}ページインデックス(空白可)
"pageColumnIndex":0,		//{Number Int}ページ内カラムインデックス(空白可)
"sceneIndex":-1,			//{Number Int}シーンインデックス(空白可)　シーンに所属しないカラム
"cutIndex":-1,				//{Number Int}カットインデックス(空白可)　カットに所属しないカラム
"indexText":""			//{String}シーン|カット番号（名称）IndexText|null
"pictureIndex":""			//{String}ファイル名body（空白可）
"contentText":""		//{String}ト書き,Actionテキスト部分　URIencoded（空白可）
"dialogText":""			//{String}セリフ・音声部分　URIencoded（空白可）
"timeText":""				//{String}尺数　TC timeText（空白可）
"inherit":""				//{String}兼用リスト(空白可)
"uuid":"jdsyfiujgey8ehwejkjwehjhwf"					//{String}uuid（空白可）
}



制作管理データキャッシュを取得するためのパス

 *	entryIdf		エントリ識別子					title#ep//sci//(.xpst|.xmap); **
 					必要なオブジェクト（SBShot|SBxMap）にメソッドで実装
 *	shotName		代表カット番号					該当する sci.toString('time');
					必要なオブジェクト（SBShot|SBxMap）のnameプロパティ
 *	inheritList		兼用リスト					自カット番号を含むカット番号(文字列の) 配列(時間含まず)
 					SBxMap.inherit.toString();
 *	pictures		画像URL						ターゲットの posterPictures(配列) 数を定めず複数
 					SBShot.posterPicutures|SBxMap.posterPictures
 *	descriptions	記述テキスト（最新情報）			カラム更新｜Xps|xMap書き込みの際に更新
 					SBxMap.discription	SBShot.discription プレーンテキスト
 *	sounds			音声/セリフテキスト（最新情報）	カラム更新｜Xps|xMap書き込みの際に更新
 					SBxMap.dialog	SBShot.dialog　プレーンテキスト
 *	xpsMembers		本線・予想動画点数（最新情報）	xMapを読み込んだ際に更新
 					SBxMap.xpsMemberCount のみ	シートカウントを合算？
 *	xmapMembers		予想画像点数（最新情報）		xMapを読み込んだ際に更新
 					SBxMap.memberCount のみ	SBShotでは接続先のSBxMapから取得

 *	nodoChart		進捗ノード（最新情報）			xMapを読み込んだ際に nas.xMap.pmu.nodeManager.getChart()の値で更新
 					SBxMap.nodepath のみ	SBShotは接続先のSBxMapから取得
 					ノードチャート自体を書き出す後はできるが、通常は以下の部分情報を請求

//以下ノードチャートから抽出可能な部分情報
 *	nodeStatus		最新ノードステータス			ラインごとの最新ノードとそのステータス　"原画//[演出]//Active"等
 *	nodeManager		担当制作（最新ステージ）		最新ステージの開始ユーザ（担当制作）と日付　
 *	nodeStaff		担当スタッフ（最新ステージ）		最新ステージの作業スタッフ（担当スタッフ）と日付
 *	nodeUser		現作業スタッフ（最新ジョブ）		最新ステージの最終更新ユーザと日付

["鯖:saba@fish.example.com","2019-02-10T03:00:12.000Z"]

進捗ノードチャートデータキャッシュ例
[
	{
		"name":"0:(本線)",
		"manager":["manager:@.example.com:","2019-01-31T15:00:00.000Z"],
		"staff":["staff:@.example.com:","2019-01-31T15:00:00.000Z"],
		"user":["user:@.example.com:","2019-01-31T15:00:00.000Z"],
		"status":"5:彩色//1:[彩色]//Fixed",
		"stages":[
			["0:初期化",["0:[SCInfo]"]],
			["1:レイアウト",["0:[作画打合せ]","1:[レイアウト]","2:[演出検査]","3:[監督チェック]","4:[作監チェック]"]],
			["2:原画",["0:[作画打合せ]","1:[原画]","2:[原画演出チェック]","3:[原画作監チェック]"]],
			["3:動画",["0:[動画発注]","1:[動画]","2:[動画検査]"]],
			["4:色指定",["0:[色指定発注]","1:[色指定]"]],
			["5:彩色",["0:[彩色発注]","1:[彩色]"]]]
	},
	{
		"name":"1:(背景美術)",
		"manager":["鯖:saba@fish.example.com","2019-02-10T03:00:12.000Z"],
		"staff":["鯖:saba@fish.example.com","2019-02-11T09:24:21.000Z"],
		"user":["マグロ:maguro@fish.example.com","2019-02-11T00:23:31.000Z"],
		"status":"3:美術原図整理//3:[美術監督チェック]//Active",
		"stages":[
			["2:BG打合せ",["0:[BG打合せ]"]],
			["3:美術原図整理",["0:[原図発注]","1:[原図整理]","3:[美術監督チェック]"]]
		]
	}
]


この形式のオブジェクトをSBShotまたはSBxMapオブジェクトが返す（同形式）
unit={
	entryIdf
	shotName
	inheritList
	posterPicture
	headNodo
	nodeStatus
	description
	dialog
	xpsMembers
	xmapMembers
	nodeManager
	nodeStaff
	nodeUser
}
*/

/**
 *    キャッシュオブジェクトのStoryBoardにリスト取得機能をもたせる
 *    @params    {Array of propertyName}    dataList
 *         [請求データ並び配列]
 *         default ["代表カット番号（秒数含む）","画像URL","","","","",""]
 *    @params    {Object filterOption}    filter
 *    @params    {Array sortOrders}        sortOrders
 *    @returns   {Array of entrySummary}
 * eg.
 *     getList(
			[]
       )
 *<pre>
 *    デフォルトの戻り値（コンテ形式一覧）
 *    [
 *        エントリ識別子,
 *        代表カット番号（秒数含む）,
 *        画像URL,
 *        進捗ノード（本線）,
 *        ステータス,
 *        記述テキスト,
 *        セリフテキスト,
 *        本線・予想動画枚数
 *    ]
 *
 *    以下のキーワードでリストの項目を選択する
 *    entryIdf        エントリ識別子　title#ep//sci(.xpst|.xmap) **
 *    shotName        代表カット番号(時間情報含む)
 *    inheritList        兼用リスト(時間情報含まず)
 *    posterPicture    画像URL
 *    description        記述テキスト（最新情報）
 *    dialog            セリフテキスト（最新情報）
 *
 *    xpsMembers        本線・予想動画点数（最新情報）
 *    xmapMembers        予想画像点数（最新情報）
 *
 *    headNodo        進捗ノード（最新情報）
 *    nodeStatus        ノードステータス
 *    manager        担当制作（最新ステージ）
 *    staff        担当スタッフ（最新ステージ）
 *    user        現作業スタッフ（最新ジョブ）
 *    以下の項目は必ずリストに含まれるのでエントリ識別子を指定する必要はない
 *    エントリ識別子には、shotName,inheritListの情報が含まれる。
 *
 *    entryIdf
 *    shotName
 *    inheritList        兼用リスト(時間情報含まず)
 *    posterPicture    画像URL
 *    description        記述テキスト（最新情報）
 *    dialog            セリフテキスト（最新情報）
 *
 *    xpsMembers        本線・予想動画点数（最新情報）
 *    xmapMembers        予想画像点数（最新情報）
 *
 *    headNodo        進捗ノード（最新情報）
 *    nodeStatus        ノードステータス
 *    manager        担当制作（最新ステージ）
 *    staff        担当スタッフ（最新ステージ）
 *    user        現作業スタッフ（最新ジョブ）
 *    
 *    default
 *    ["entryIdf","shotName","posterPicture","headNode","nodeStatus","description","dialog","xpsMembers"];
 *    フィルターの指定オブジェクト
 *    {
 *        "type":'xMap',
 *        "shotCount":"*",
 *        "line":'0:(本線)',
 *        "status":'all'
 *    }
 *    フィルタタイプの指定
 *type
 *データタイプ切り替え    Xpst|xMap
 *    "Xps"    ショット（カット）単位で表示する	1(1/3),2,3(1,3),4,5,6,7,8...
 *    "xMap"   制作管理（カット袋）単位で表示する	1(1/3),2,4,5,6,7,8....
 *
 *不正値｜未指定は"Xps"とみなす
 *
 *shotCount
 *    カットの並び順にフィルタをかけてリストの数を絞る 引数は 整数値,',','-','/'|'*' のみで構成される
 *
 *以下の形式を解釈　値はリストに展開される　不正値｜未指定はフィルタなし（全要素取得）とする
 *    "*"                    フイルタなし（全要素）
 *    "<ID>"                表示するエントリーのID
 *    "<開始ID>-<終了ID>"    開始IDと終了IDをハイフンでつなぐ
 *    "<開始ID>/<個数>"        開始IDから連続で項目数を指定する
 *    "<ID>,<ID>..."        複数の表現をコンマで区切ったリスト
 *
 *line
 *ライン切り替え　表示・集計対象のラインを切り替える
 *"<ラインID>:(<ライン名>)"または"<ラインID>"のみでも良い
 *ユーザが定義したライン指定記述をそのまま使用する
 *    "0:(本線)"
 *    "1:(背景美術)"
 *    "2:(3D-CGI)"
 *
 *    不正値｜未指定は "0:(本線)"とする
 *
 *status
 *作業ステータス単位でフィルタする
 *        "all"        aborted|floationgを除くすべてのステータス
 *        "aborted"    中断・削除されたエントリ
 *        "startup"    未着手　作業可能
 *        "active"    作業中
 *        "hold"        作業（保留）中
 *        "fixed"        次作業待ち
 *        "compleat"    完了(制作検収待ち)
 *        "floating"    未保存　ステータスとしては存在するが、floating状態で保存されることはないのでフィルタ不要
 *    指定引数が 不正値｜未指定 は"all"とする
 *
 *ソート指定配列
 *    それぞれの要素は以下の形式をとる
 *    "<ソート項目>+|-" ソート項目に続けて +(昇順),-(降順)のポストフィックスをつけたもの
 *    ソート項目は name|stage|manager|staff|user|date|status のいずれか
 *        "name"        シーン＋カット番号順	*(*印Idfに包括)
 *        "cut"         カット番号順	*(*印Idfに包括)
 *        "scene"       シーン番号順	*(*印Idfに包括)
 *        "stage"       ステージ並び順	*
 *        "manager"     担当制作順
 *        "staff"       作業担当者順
 *        "user"        最終ユーザ順
 *        "date"        最終更新日付順	*
 *        "status"      ステータス順	*
 *    これをソート順位ごとに並べた配列で指定する
 *    ポストフィックス未指定の場合は +(昇順)とする
 *    ソート引数未指定の場合 戻り値は　["name+"] 
 *    ユニーク値のフィールドを第一優先でソートした場合は他の項目は無効であることに注意
 *    eg.
 *    ["manager+","date+","staff-",]
 *
 *
 *</pre>
 */
nas.StoryBoard.prototype.getList = function getList(dataList,filter,sortOrders){
    if(! dataList)    dataList   = ["entryIdf","shotName","posterPictures","headNode","nodeStatus","description","dialog","xpsMembers"];
    if(! filter){
        filter     = {"type":'xmap',"shotCount":'*',"line":'0:(本線)',"status":'all'};
    }else{
        if(! filter.type)        filter.type            = 'xpst';//xMap ?
        if(! filter.shotCount)    filter.shotCount    = '*';
        if(! filter.line)        filter.line            = '0:(本線)';
        if(! filter.status)        filter.status        = 'all';
    }

//カットIDフィルタ作成
	var idFilter =[];
    if(filter.shotCount != '*'){
        idFilter = [];//IDフイルタリスト
        var idList = filter.shotCount.split(',');//指定データリスト
        for (var ix = 0 ; ix < idList.length ; ix ++){
            if (idList[ix].match(/(\d+)\/(\d+)$/)){
                var rangeStart = parseInt(RegExp.$1);var rangeCount = parseInt(RegExp.$2);
                for (var c = 0 ; c < rangeCount ;c ++) idFilter.add(rangeStart - 1 + c);
            } else if (idList[ix].match(/(\d+)\-(\d+)$/)){
                var rangeStart = parseInt(RegExp.$1);var rangeEnd = parseInt(RegExp.$2)+1;
                var rangeCount  = rangeEnd - rangeStart;
                if(rangeCount <= 0) continue;//不正指定なのでスキップ
                for (var c = 0 ; c < rangeCount ;c ++) idFilter.add(rangeStart - 1 + c);
            }　else if (idList[ix].match(/^(\d+)$/)){
                idFilter.add(parseInt(idList[ix]) - 1);
            }
        }
        if(idFilter.length == 0) filter.shotCount = '*'; //すべて不正指定だったのでキャンセルして全表示フラグにする
    }
    var targetLine = (new nas.Pm.ManagementLine(filter.line)).id.join('-');//配列を連結して文字列化
    var result = [];
//ターゲットのtype切り替え
    var targetCollection     = (filter.type == 'xmap')? this.xmaps:this.contents;

    for (var idx = 0 ; idx < this.contents.length ;idx ++){
//カットIDでフィルタする
        if((filter.shotCount != '*')&&(idFilter.indexOf(idx) < 0)) continue;
        var targetShot = this.contents[idx];
        var targetxMap = targetShot.xmap;

//typeフィルタ（SBxMapがカブったらスキップ）
        if((filter.type == 'xmap')&&(result.findIndex(function(element){
        	return (element.entryIdf == targetxMap.getIdentifier())
        })>=0)){console.log(result.findIndex(function(element){
        	return (element.entryIdf == targetxMap.getIdentifier())
        })); continue;};

//ライン設定・ステータスフィルタ(２つ合わせてフィルタとして働く)
        var targetPath = targetxMap.nodeChart.find(function(element,index,array){return ((new nas.Pm.ManagementLine(element.name)).id.join('-')==targetLine)},this);//進捗パスを抽出（メソッド作れ）
//console.log(targetPath);
        if((filter.status!='all')&&( targetPath.status.indexOf(filter.status) >=0 )) continue;
//１単位を構成
//        var resultUnit = {};
        var resultUnit = new Object();
        result.push(resultUnit);
        resultUnit.entryIdf  = (filter.type == 'xmap')?targetxMap.getIdentifier():targetShot.getIdentifier();
        resultUnit.name      = (filter.type == 'xmap')?targetxMap.name:targetShot.name;
        resultUnit.cut       = targetxMap.cut;
        resultUnit.scene     = targetxMap.scene;
        resultUnit.nodeChart = targetxMap.nodeChart;
        resultUnit.token     = (filter.type == 'xmap')?targetxMap.token:targetShot.token;
//console.log(targetLine);
        var targetLineId = targetxMap.nodeChart.findIndex(function(element){
        	return(element.name.indexOf(targetLine)==0)
        },this);
if((targetxMap.nodeChart.length)&&(targetLineId >= 0)){
//console.log(targetLineId);
        resultUnit.stage     = targetxMap.nodeChart[targetLineId].stages[targetxMap.nodeChart[targetLineId].stages.length-1];
        resultUnit.manager   = targetPath.manager.split(':')[0];
        resultUnit.staff     = targetPath.staff.split(':')[0];
        resultUnit.user      = targetPath.user.split(':')[0];
        resultUnit.date      = targetPath.user.split(':')[1];
        resultUnit.status    = targetPath.status;
}else{
        resultUnit.stage     = 'void';
        resultUnit.manager   = 'void';
        resultUnit.staff     = 'void';
        resultUnit.user      = 'void';
        resultUnit.date      = 'void';
        resultUnit.status    = 'void';
}
//
        for (var dcx = 0 ;dcx < dataList.length ;dcx ++){
            var propValue = null;
            switch(dataList[dcx]){
            case 'inheritList':
                propValue = targetxMap.inherit.toString();
            break;
            case 'posterPictures':
                propValue = (filter.type == 'xMap')?　targetxMap.pictures:targetShot.picutures;
            break;
            case 'headNode':
                propValue = targetxMap.nodePath;
            break;
            case 'nodeStatus':
                propValue = targetxMap.nodeChart;
            break;
            case 'description':
                propValue = targetxMap.description;
            break;
            case 'dialog':
                propValue = targetxMap.dialog;
            break;
            case 'xpsMembers':
                propValue = targetxMap.summary;
            break;
            case 'xmapMembers':
                propValue = targetxMap.summary;
            break;
            case 'nodeManager':
                propValue = targetxMap.summary;
            break;
            case 'nodeStaff':
                propValue = targetxMap.summary;
            break;
                propValue = targetxMap.summary;
            case 'nodeUser':
            break;
            }
            if(propValue) resultUnit[dataList[dcx]] = propValue;
        }
    }
//sort クラスメソッドに渡してソート
    return  nas.StoryBoard.sortList(result,sortOrders);
}
/*TEST
var myTestSB = tess.SB;
myTestSB.getList(null,{type:"xps",shotCount:"1-6",line:"1"},)

*/

//===================== 
/*
	シナリオ｜絵コンテ用管理単位データ (xMapの要約オブジェクト=カット袋に相当する)
	parent			:{Object nas.StoryBoard}　nas.StoryBoard配下のデータと定義する　ストーリーボードを介してエピソードに付属するデータ
	id				:{String} xmap number	任意　空白の可能性あり DB用接続ID UATのトークンの記録等に使用
	uid				:{String} unique id　必須 同一判定用プロパティ　自動生成（指定しても良いが衝突の際には削除されるので指定値は保証されない）
	scene			:{String} xmap scene 代表シーン番号　空白の可能性あり
	cut				:{String} xmap cut　代表カット番号　空白の可能性あり
	name			:{String} xmap name　必須作品内でユニーク　カット代表番号使用を推奨するがユニークであれば何でも良い　これを表示名にする
	inherit			:[Array]  xmap.pmuから転記　sciオブジェクトの配列　inherit[0]が代表カット

	nodepath		:{String} xmap 進捗情報空白可　その場合はnodeChartの本線の先頭を使用

	nodeChart		;[Array]  進捗チャート　nas.xMap.pmu.nodeManager.getChart()メソッドで得られる配列

	contents		:[Array]
	posterPicture	:[Array] xmap 表示画像 のID [contentId,pictureId] 

	updateTime		:{String} xmap.pmuから転記 Date文字列
	updateUser		:{String} xmap.pmuから転記 nas.UserInfo文字列または単に名前またはe-mail

	description		:{String} xmap.description を転記 カット袋のコメント記述・カットのコメント記述を合成したもの
	action			:{String} ト書  storyboardから転記して初期化　ユーザが明示的に更新を求めた場合のみ更新
	sound			:{String} セリフstoryboardから転記して初期化　ユーザが明示的に更新を求めた場合のみ更新
*/
/**
	ストリーボード上でカット袋（制作管理単位）ごとの情報を記録するオブジェクト
	@params	{Object nas.StoryBoard|nas.StoryBoard.SBShot}	parent
	@params	{String}	inheritDescription
	@params	{String}	uuid
	
	parentにSBShotを使用することを推奨
*/
nas.StoryBoard.SBxMap = function xmap(parent,inheritDescription,uuid){
	this.parent		= (parent instanceof nas.StoryBoard.SBShot)? parent.parent:parent;
//{Object nas.StoryBoard|nas.StoryBoard.SBShot}　= episode(opus)
	this.id			= '';//{String} 
	this.uid		= (uuid)? uuid :nas.uuid();//
	this.scene		= '';//{String} シーン番号（名称）
	this.cut		= '';//{String} カット番号（名称）
	this.name		= '';//{String} 識別名・時間なし
	this.inherit	= [];//sci collection nas.xMap.inherit

	this.contents	= (parent instanceof nas.StoryBoard.SBShot)? [parent]:[];//カットオブジェクト参照配列 - inheriにマッチさせたSBShotへの参照を置く メソッドのアクセス用　書き出しとは切り離す
	this.token;//DB接続用トークン
	this.timestamp;//DB接続用タイムスタンプ
	this.nodeChart	= [];//進捗チャート　nas.xMap.pmu.nodeManager.getChart()メソッドで得られる配列(自動更新)
	this.pictures	= [];//{Array of Array} picuture URL ショット？　ここに集めずにcontentsのデータを参照したほうが良い＊＊＊
	this.posterPicture = [0,0];//{Array} pointer id of picutures
//xMap更新時に自動更新
	this.description= "";//{String} カット袋のディスクリプション（メモ欄）　自動更新　ユーザ記述は保持
//表示の際はShotのデータと合成？
	this.summary	= {};//{Object nas.xMap.Summary}  要約情報オブジェクト exChangeObject キャッシュ本体
//記述パース
/*
	カット袋の識別子で初期化
	記述の形式は以下
	"{<TITLE>#<EPISODE>[<SUBTITLE>]//}s-c<###>(<#+#>)/s-c<###>(<#+#>)/s-c<###>(<#+#>)/..."
例:
かちかちやま#01//s1-c1(12+0)
うらしまたろう#6//s-c123(3+12)/s-c127(1+18)
c#12,c#15,c#328

	兼用カットは'/'または','で区切って列挙
	秒数（カット尺）はなくとも良い
	シーンわけしない場合は 's-c'を省略可能
	代表番号を先頭にする
	タイトル,エピソード,サブタイトルは省略可能（その場合'//'ごと省略）
*/
	if(inheritDescription){
//console.log(inheritDescription);
		if (!(inheritDescription.match(/\/\//))){
			inheritDescription = this.parent.title+'#'+this.parent.opus+"//"+ inheritDescription;
		}
		this.inherit = nas.Pm.parseIdentifier(inheritDescription).sci;
		this.scene = this.inherit[0].scene;
		this.cut   = this.inherit[0].cut;
		this.name  = this.inherit[0].name;
	}
//プロパティ検証
	if(this.parent instanceof nas.StoryBoard){
//idに衝突が発生したらuuid生成
		var conflictId = this.parent.xmaps.findIndex(function(element,index,array){return (this.uid == element.uid)},this);
		if (conflictId >= 0) this.uid = nas.uuid();
		this.parent.xmaps.push(this);//自身をコレクションに追加
	}
}
/*
枚数として集計する項目
原画:？原画予測枚数
動画:
仕上:
	管理単位(SBxMap)文字列化メソッド
	スクリプト関連には出力しない　リスト時のみ使用
	例
name:
scene:
cut:
time:
product:
inherit:
lot:	

 */
nas.StoryBoard.SBxMap.prototype.toString = function (){
	var result=[];
//
		result.push('name:'+this.name);
//プロパティ出力
	var exportProps = ['scene','cut','time','production','inherit','summary'];//
	for (var i = 0; i < exportProps.length;i ++){
		result.push(exportProps[i]+':'+this[exportProps[i]]);
	}
//
	return result.join('\n');
}
/*
	xMapとしてのIfdを返す
*/
nas.StoryBoard.SBxMap.prototype.getIdentifier = function (){
	var names = [];
	for (var s = 0 ;s < this.inherit.length ; s ++) names.push (this.inherit[s].toString());
	return [this.parent.product,names.join('/'),'.xmap'].join('//');
}
/*
	JSON化可能オブジェクトに変換して返す
	プログラム利用のための出力なので省略は行わない

xmap:{
	:{String},
	:{String},
	:{String},
	:{Object},
	inherit:[Array of Shot]
}
*/
nas.StoryBoard.SBxMap.prototype.getObject = function (form){
	if(! form) form = 'Object';
	var result = {};
	result.number 	= this.number;

	if(this.name){
		result.name = this.name;
	}
	if(this.uid){
		result.uid = this.uid;
	}
//ショット
	result.inherit = [];
	for (var cix = 0 ; cix < this.inherit.length ; cix++){
		result.inherit.push(this.inherit[cix]);
	}
	if (form=='JSON'){
		return JSON.stringify(result);
	}else{
		return result;
	}
}
/*
	管理ノードの書き込み(追記)	管理単位分のノード記述を与えてnodeChartに書き込む
	@params	{Object mNode|String}	nodePath
		mNode オブジェクト  または 文字列 "<line>//<stage>//<job>//<status>"
	@params	{String}	token
		文字列 エントリトークン
	@returns	{Object}
		this.nodeChart
*/
nas.StoryBoard._writeNode = function (nodePath,token){
	if(typeof nodePath == 'string') nodePath = nas.Pm.parseNodeDescription(nodePath);
//ラインエントリを作成
/*	var entry = {
		name:nodePath.line,
		manager:'',
		staff:'',
		user:'',
		status:nodePath.status,
		stages:[
			[
				nodePath.stage,
				[nodePath.job]
			]
		]
	};// */
// ノードチャートエントリの構造は pmu.nodeManager.getChartで得られるnodeChart互換
	var entry = {
		name:nodePath.line,
		manager:'',
		staff:'',
		user:'',
		status:nodePath.status,
		stages:[
			{
				name :nodePath.stage,
				nodes:[
					{
						name:nodePath.job
					}
				]
			}
		]
	};
	if(token) entry.stages[0].nodes[0].token = token;
//	if(token) entry.token = token;
// console.log(this);
	var lineId = this.nodeChart.add(entry,function(tgt,dst){
		var tgtLine = new nas.Pm.ManagementLine(tgt.name);
		var dstLine = new nas.Pm.ManagementLine(dst.name);
		return (tgtLine.id.join('-') == dstLine.id.join('-'));
	});
	if(this.nodeChart[lineId] !== entry){
//既存ライン(=追加に失敗)だったのでステージ以下の要素を書き込み
		var stgId = this.nodeChart[lineId].stages.add(entry.stages[0],function(tgt,dst){
//console.log(tgt)
			var tgtStg = new nas.Pm.ManagementStage(tgt.name,{});
			var dstStg = new nas.Pm.ManagementStage(dst.name,{});
			return (tgtStg.id == dstStg.id);
		});
		if(this.nodeChart[lineId].stages[stgId] !== entry.stages[0]){
//既存ステージ(=追加に失敗)だったのでジョブ（ノード）要素を書き込み
			var jobCount = this.nodeChart[lineId].stages[stgId].nodes.length;
			var jobId = this.nodeChart[lineId].stages[stgId].nodes.add(entry.stages[0].nodes[0],function(tgt,dst){
				var tgtJob = new nas.Pm.ManagementJob(tgt.name);
				var dstJob = new nas.Pm.ManagementJob(dst.name);
				return (tgtJob.id == dstJob.id);
			});
			if(	
				(jobCount < this.nodeChart[lineId].stages[stgId].nodes.length)&&
//				(this.nodeChart[lineId].stages[stgId].nodes[jobId] !== entry.stages[0].nodes[0])&&
				(this.nodeChart[lineId].stages[stgId].nodes.length > 1)
			){
//ノード追加された場合はソート
				this.nodeChart[lineId].stages[stgId].nodes.sort(function(tgt,dst){
					var tgtJob = new nas.Pm.ManagementJob(tgt.name);
					var dstJob = new nas.Pm.ManagementJob(dst.name);
					return (parseInt(tgtJob.id) - parseInt(dstJob.id));
				});
				if(this.nodeChart[lineId].stages[stgId].nodes[this.nodeChart[lineId].stages[stgId].nodes.length-1] === entry.stages[0].nodes[0]){
//書き込みジョブがステージ内最後尾ジョブだったのでステータスを更新
					this.nodeChart[lineId].status = nodePath.status;
//					if(token) this.token = token;
//tokenの扱いがサーバごとに異なる ここではノードの固有トークンであることに注意
					
				}
			}
		}else{
//ステージ要素が追加されたのでステージをIDでソート
			this.nodeChart[lineId].stages.sort(function(tgt,dst){
				var tgtJob = new nas.Pm.ManagementStage(tgt.name);
				var dstJob = new nas.Pm.ManagementStage(dst.name);
				return (parseInt(tgtJob.id) - parseInt(dstJob.id));
			});
		}
	}else{
//ライン要素が追加されたのでラインIDでソート
		this.nodeChart.sort(function(tgt,dst){
			if(dst.name == '=no-composite=') return -1;
			var tgtJob = new nas.Pm.ManagementLine(tgt.name);
			var dstJob = new nas.Pm.ManagementLine(dst.name);
			return (tgtJob.id.join('-') < dstJob.id.join('-'))? -1:1;
		});
	}
	return this.nodeChart;
}

nas.StoryBoard.SBxMap.prototype.writeNode = nas.StoryBoard._writeNode;
/*TEST
	test.SB.xmaps[1].writeNode("0:(本線)//1:レイアウト//5:[謎チェック]//Fixed:XXXXXXX");
	test.SB.xmaps[1]
*/
/**
	管理単位オブジェクトのパース
	基本的には１管理単位分の記述子を与えて初期化する
	タイトル#エピソード//カット/カット/カット/カット/・・・
	カット・時間　兼用 タイムスタンプ等
	データキャッシュとしての更新を行う際に使用
	params	{Object xMap|String}	content
	更新対象のxMapまたは識別子
	returns {Object this| false}
*/
nas.StoryBoard.SBxMap.prototype.parseContent = function (content){
	if(content instanceof nas.xMap) content = nas.Pm.getIdentifier(content);
	var idfInfo = nas.Pm.parseIdentifier(content);
	if(! idfInfo.timestamp )　idfInfo.timestamp = new Date().getTime();
	if(
		(idfInfo.timestamp <= this.timestamp)||
		(idfInfo.product !== this.pmu.opus)
	) return false;
	this.inherit = idfInfo.sci;
	this.scene = this.inherit[0].scene;
	this.cut   = this.inherit[0].cut;
	this.name  = this.inherit[0].name;
	
	
	
	return this;	
}
/**
	xMapの構成ショットを削除する
	構成ショットがなくなった時点で自身を削除する
	引数無しで呼ばれた場合は、構成内容をすべて削除する
	@params	{String|Array of SCi} sciDescription;
	@returns	{Object} this

*/
nas.StoryBoard.SBxMap.prototype.remove =function(sciDescription){
	var target = [];
	if(typeof sciDescription == 'undefined'){
		target = this.inherit;//兼用全て
	}else if(sciDescription instanceof Array){
		target = sciDescription;
	} else {
		target = nas.Pm.parseSCi(sciDescription);
	}
	for (var t = 0 ; t < target.length ; t ++ ){
		for (var i = 0 ; i < this.inherit.length ; i++ ){
			if(nas.Pm.compareCutIdf(target[t].name,this.inherit[i].name) == 0) this.inherit.splice(i,1);
		}
		for (var c = 0 ; c < this.contents.length ; c++ ){
			if(nas.Pm.compareCutIdf(target[t].name,this.contents[c].name) == 0) this.contents.splice(c,1);
		}
	}
	if((this.inherit.length == 0)&&(this.contents.length == 0)){
		var mx = this.parent.xmaps.indexOf(this);
		this.parent.xmaps.splice(mx,1);
	}
	return this;
}
//=====================キャストアイテム分類テーブル
/*
	大分類A-Z、小分類a-zの分類テーブルをストリーボードごとに持つ事が可能
	大分類と小分類を結合してアイテムタグとして利用する
	分類テーブルは、タイトルDBの分類テーブルがあれば参照して初期化する
	テーブル自体はstbd内部で保持（記録）する
	pmdb.castItemTag["A"]
*/
nas.StoryBoard.castItems = {
	A:"all",
	B:"Backgroung-art",
	C:"Character",
	D:"Draft",
	E:"Extra",
	G:"cgi-Graphics"
};
//===================== 
/*
	キャストアイテムオブジェクト
	
*/
nas.StoryBoard.SBCast = function CastItem(name,tag,description){
	this.id    ;//IDストーリーボード内でユニーク
	this.tag   = tag ;//アイテム分類コード
	this.name  = name;//アイテム名称
	this.description = description;//
	
}
/*
	シナリオ｜絵コンテ用シーンデータ
	parent	:{Object nas.StoryBoard}
	number	:{String} scene number	任意　空白の可能性あり
	name	:{String} scene name	必須　ユニークでない
	uid		:{String} unique id
	contentText	:{String} contentText 
	tmp		:{Boolean} データパーサのための一時トレーラーとしての初期化フラグ
	シーン記述は シナリオで使用される柱の記述をそのまま使用
	eg.
	"○ 裏山（夕方）柿の木の下"
	"1.天狗岩の上　昼"
*/
nas.StoryBoard.SBScene = function Scene(parent,sceneDescription,uuid,style,isTmp){
	this.parent		= parent;//{Object nas.StoryBoard}
	this.number		= '';//{String} 
	this.name		= '';//{String}
	this.column		= new nas.StoryBoard.SBColumn(parent,-1);//シーン切り替えカラム参照プロパティ シーン柱を格納
	this.uid		= (uuid)? uuid :nas.uuid();//
	this.contents	= [];//shot collection
	this.contentText= sceneDescription;//{String} シーンの記述内容を柱部分を含むすべて(自動更新あり)
	this.castItems	= [];//香盤のためのアイテムリスト（配役・場面・大道具・小道具 等）CastItem
	this.tmp		= (isTmp)? true:false ;//{Boolean} 一時トレーラーフラグ（初期化終了後にパーサによって削除される）
//optional
	this.style	= {hide:true};
	if(style){
		this.style = style;
	}
//記述パース
	if(sceneDescription){
		var colSearch = sceneDescription.match(nas.StoryBoard.sceneRegex);
		if(colSearch){
//[0]:ヒット文字列全体 [1]:前置部 [2]:ナンバー [3]:記述部
			if(colSearch[2]){
				this.number = colSearch[2];
				this.column.indexText = colSearch[2];
			}
			this.name = colSearch[3].trim();
			this.column.description = [((colSearch[2])? (colSearch[2]+". "):("◯. "))+colSearch[3].trim()] ;
		};//ヒットなければ初期値のまま

//セパレーターとともに丸印を払う
//		sceneDescription = sceneDescription.replace(/^(\(?\d*\)?)\.?\s*|^[○◯]\.?\s*/,"$1");
//		var breaked	= sceneDescription.match(/^\(?(\d*)\)?\.?\s*/);
/*		this.number	= breaked[1];
		this.name	= sceneDescription.slice(breaked.index+breaked[0].length);//分離しない
*/
	}
//プロパティ検証
	if((! this.tmp)&&(this.parent instanceof nas.StoryBoard)){
//idに衝突が発生したらuuid生成
		var conflictId = this.parent.scenes.findIndex(function(element,index,array){return (this.uid == element.uid)},this);
		if (conflictId >= 0) this.uid = nas.uuid();
		this.parent.scenes.add(this);//自身をコレクションに追加
		this.parent.columns.add(this.column);//カット代表カラムをColumnCollectionに追加
	}
}
/*
	シーン記述パーサ
	@params	{Stging} sceneDescription
		シーン記述からシーン番号シーン名注釈を取得
		キャスト(登場人物と場面・道具等)のリストを初期化する
		リストされるキャストアイテムは
		登場人物/舞台美術/道具/（その他ユーザ設定）などのタグを持ちひとつのテーブルに格納される
		出力時にタグごとに分類されてシーン柱の後方に列記することが可能
		分類の初期化は

場（シーン）記述(日本・英文共通)
1行のみ
字下げなし
シーン番号　または　"○◯"または で開始する
丸印は日本語脚本で一般的であるが、このパーサではシーン番号を省略したものであると解釈される
一般には数字を丸で囲い　その数字を省略したもの
英文脚本では　数字　空白　場　となることが多い
シーン番号はピリオドまたは空白で記述との間を区切って良い
シーン番号を括弧で囲んで良い

○うなぎ御殿
(6)お祭り広場 - 朝
1.竜宮城
(01) たぬきやま
10 INT. TOWN HOUSE - OLD MAN'S ROOM - MORNING

特殊なシーンとして、自体はシーンコレクションに含まれず、カラムを登録するためだけに一時期に存在するシーンがある

 */
nas.StoryBoard.SBScene.prototype.parse = function (sceneDescription){
	var colSearch = sceneDescription.match(nas.StoryBoard.sceneRegex);
	if(colSearch){
//[0]:ヒット文字列全体 [1]:前置部 [2]:ナンバー [3]:記述部
		if(colSearch[2]){
			this.number = colSearch[2];
			this.column.indexText = colSearch[2];
		}
		this.name = colSearch[3].trim();
		this.column.description = [((colSearch[2])? (colSearch[2]+". "):("◯. "))+colSearch[3].trim()] ;
	};//ヒットなければ初期値のまま
//記述部からcharacter・舞台美術の
//セパレーターとともに丸印を払う
//		sceneDescription = sceneDescription.replace(/^(\(?\d*\)?)\.?\s*|^[○◯]\.?\s*/,"$1");
//		var breaked	= sceneDescription.match(/^\(?(\d*)\)?\.?\s*/);
/*		this.number	= breaked[1];
		this.name	= sceneDescription.slice(breaked.index+breaked[0].length);//分離しない
*/
	
}
/*
	シーン文字列化メソッド
	@params	{Stging} form
		出力フォーム指定文字列 screenplay|AR|storyboard|full
			screenplay	シナリオ形式（シーン）
			AR			録音台本形式（シーン｜ショット）
			storyboard	絵コンテ形式（ショット｜カラム）
			full		全出力（シーン|ショット|カラム）

 */
nas.StoryBoard.SBScene.prototype.toString = function (form){
	if(! form) form = 'full';
	var result=[];
//シーン柱 storyBoard形式の場合は、カラムとして挿入する
	if(form != 'storyboard'){
		result.push(((this.number)? (this.number+". "):("◯ "))+this.name);// type ja|en
/*		switch(this.parent.scriptType){
		case 'en':
			result.push(this.number+'\t'+this.name);//英語シナリオ
		break;
		case 'ja-2':
		break;
			result.push('○'+((this.number.length)?'('+this.number+')\t':'\t')+this.name);//日本語シナリオ 2
		case 'ja-1':
		default:
			result.push(((this.number.length)?'('+this.number+')\t':'○\t')+this.name);//日本語シナリオ 1
		};// */
	}else{
		result.push(this.column.toString());
	}
//ショット出力
	for (var cix = 0 ; cix < this.contents.length ; cix++){
		result.push(this.contents[cix].toString(form));
	}
	return result.join('\n');
}
/*
	JSON化可能オブジェクトに変換して返す
	プログラム利用のための出力なので省略は行わない

scene:{
	number:{String},
	name:{String},
	uid:{String},
	style:{Object},
	contents:[Array of Shot]
}
*/
nas.StoryBoard.SBScene.prototype.getObject = function (form){
	if(! form) form = 'Object';
	var result = {};
	result.number 	= this.number;

	if(this.name){
		result.name = this.name;
	}
	if(this.uid){
		result.uid = this.uid;
	}
//スタイルプロパティがあれば
	if(Object.keys(this.style).length){
		result.style = this.style;
	}
//ショット
	result.contents = [];
	for (var cix = 0 ; cix < this.contents.length ; cix++){
		result.contents.push(this.contents[cix].getObject('Object'));
	}
	if (form=='JSON'){
		return JSON.stringify(result);
	}else{
		return result;
	}
}
/*
	シーンオブジェクトのパース
	基本的には１シーン分のシナリオ内容のテキストデータが与えられる
	シーン柱は処理対象外
	ショット柱を認識した場合、そこからデータを分割してショットパーサに送る
シーン柱の形式
行頭空白なし
シーン番号またはシーン番号の省略を示す(○|◯) 空白またはピリオドを置いて　シーン説明本文
シーン番号を括弧で囲んでも良い　
*/
nas.StoryBoard.SBScene.prototype.parseContent = function (content){
console.log(content);
	if(content.length == 0 ) return false;
	var style 		= {};
//シーン柱を検出して柱を削除(シーン柱出現以前のショット・カラムはシーンに所属しない)
	var colSearch = content.match(nas.StoryBoard.sceneRegex);
	if(colSearch){
console.log(colSearch);
//[0]:ヒット文字列全体 [1]:前置部 [2]:ナンバー [3]:記述部
		if(colSearch[2]){
			this.number = colSearch[2];
			this.column.indexText = colSearch[2];
		}
		this.name = colSearch[3].trim();//前後の空白を取り払う
		this.column.description = [((colSearch[2])? (colSearch[2]+". "):("◯. "))+colSearch[3].trim()] ;

		content = content.slice((colSearch.index+colSearch[0].length)-content.length);
		content = content.replace(/\n{3}/g,'\n\n');
	}else{
//ショット柱がない
		this.name = '';
	}
//再実行して二番目以降の柱が存在すればその後方内容を削除
	colSearch = content.match(nas.StoryBoard.sceneRegex);
	if(colSearch){
console.log(colSearch);
		content = content.slice(0,colSearch.index);
	}
console.log(content);
//コンテンツ内の（初出の）スタイルタグを検索
	var styleTag = content.match(/<style\b[^>]*>/);
	if(styleTag){
		tagData = (styleTag[0].replace(/\s+/g,",").split(","));
		for (var tix = 0 ;tix < tagData.length; tix++){
			if(tagData[tix].match(/.+=.+$/)){
				dataSet = tagData[tix].split('=');
				if(dataSet[1].length){
					if(dataSet[1].match(/^".*"$|^'.*'*/)){
						style[dataSet[0]]=dataSet[1].slice(1,dataSet[1].length-1);//	
					}else{
						style[dataSet[0]]=dataSet[1];
					}
				}
			}
		}
		content = content.replace(/<style\b[^>]*>/g,"");//全削除
	}
	var dataArray = String(content).split(/\r\n|\r|\n/);
	var coldetect = 0;
	var commentSkip = false;
//初期ショット　s#<Scene-ID>-c#<Shot-ID>のショットを作成（ショットカラムがない場合のため）
//シーン番号が存在しない場合は、通番を使用　その際番号付け規則を参照
	if((!this.name)&&(!this.number)){
		var currentShot = new nas.StoryBoard.SBShot(
			this.parent,
			null,
			[],
			{}
		);
	}else{
		if((this.parent)&&(this.parent.shotNumberUnique)){
			if(this.parent.sceneNumberUse){
				var shotName = 's'+((this.number)?this.number:this.parent.scenes.indexOf(this)+1)+'-c';
			}else{
				var shotName = 's-c';
			}
			shotName += (this.parent.contents.length+1);
		}else{
			var shotName = 's'+((this.number)?this.number:'')+'-c';
			shotName += (this.contents.length+1);
		}
		var currentShot = new nas.StoryBoard.SBShot(
			this.parent,
			new nas.Pm.SCi(
				shotName,
				this.parent.product,
				'','','',null
			),
			[],
			{}
		);
	}
//初期ショットを登録
	this.contents.add(currentShot);
	this.parent.contents.add(currentShot);
	var columnText = '';

	for (var line = 0; line < dataArray.length; line++){
		if (commentSkip){
			if(dataArray[line].match(/^.*\*\/(.*)$/)){
				commentSkip = false;
				if(RegExp.$1) columnText += RegExp.$1 +'\n';
			}
			continue;
		}
		if (dataArray[line].match(/^#|^\/\//)) continue;
		if (! commentSkip){
			if(dataArray[line].match(/^\s*\/\*.*$/)){
				commentSkip = true;
//				if(RegExp.$1) columnText += RegExp.$1 +'\n';
				continue;
			}
		}
/*
	ショット柱にヒットしたら、そこで未処理のカレントショットのデータ処理を行い
	新規の空ショットを作成する
	ヒットした行は次のバッファの先頭へ
*/
		var shtSearch = dataArray[line].match(nas.StoryBoard.shotRegex);
		if(shtSearch){
			if(this.contents.length == coldetect){
				currentShot.parseContent(columnText);
				if((this.sceneNumberUse)||(! currentShot.sci.scene)){
					currentShot.sci.scene=(this.number)?this.number:String(this.parent.scenes.indexOf(this)+1);
				}
				currentShot = new nas.StoryBoard.SBShot(
					this.parent,
					{},
					[],
					{}
				);
				this.contents.add(currentShot);
				this.parent.contents.add(currentShot);
			}
			columnText = dataArray[line]+'\n';//カラムテキストリセット
			coldetect ++;
		}else{
			columnText += dataArray[line]+'\n';
		}
	}
//loopend　最後のコンテンツを最終ショットに流し込む
//console.log(columnText);
	if(columnText.length) currentShot.parseContent(columnText);
//style設定
	this.style = style;
/* test 一時シーンであった場合　パース後にキャリア用のショットをコレクションから削除して自身を削除する　*/
	if((this.tmp)&&(this.contents.length == 1)&&(this.contents[0].sci == null)){
		//this.contents[0].columns[0].remove();
		this.parent.contents.splice(this.parent.contents.indexOf(this.contents[0]),1);
		this.contents.splice(0,1);
		this.parent.scenes.splice(this.parent.scenes.indexOf(this),1);
	}
//返す
	return this;	
}
/**
 *   シーンが自分自身を削除する
 *   引数なし　削除時には内包するカットをすべて削除する
 */
nas.StoryBoard.SBScene.prototype.remove =function(){
	var ix = this.parent.scenes.indexOf(this);
//自身を削除する前に内包するカットをすべて削除する
	for (var sx = this.contents.length - 1 ; sx >= 0 ; sx --){
		this.contents[sx].remove();
	}
	this.parent.activeColumn = this.parent.columns[this.parent.activeColumnId];
	if((this.contents.length == 0)&&(ix > -1)){
		return this.parent.scenes.splice(ix,1);
	}else{
		return false;
	}
}
/**
	シーンにショット(カット)を挿入する
	@params	{Object nas.StoryBoard.SBShot}	sht
	@params	{Number}	insPt
		挿入点ID　指定IDの前方に挿入　指定のない場合｜不正指定は末尾へ追加
	@returns	{Object nas.StoryBoard.SBShot}
		挿入したshotオブジェクト
	
*/
nas.StoryBoard.SBScene.prototype.insertShot =function(sht,insPt){
	if(
		( this.contents.indexOf(sht) >= 0)||
		(! sht instanceof nas.StoryBoard.SBShot)
	) return false;

	if(sht.parent !== this.parent) sht.parent = this.parent;

	if(isNaN(insPt)){
		insPt = this.contents.length;
	}else{
		insPt = parseInt(insPt);
	}
//挿入前に現ショット|カラム挿入オフセットIDを取得
	if(this.contents.length){
		var insOffsetSht = this.parent.contents.indexOf(this.contents[0]) + 1;
		var insOffsetClm = this.parent.columns.indexOf(this.contents[0].columns[0]) + 1;
	}else{
		var prevScn = (insPt > 0)? this.scenes[insPt-1]:null;
		if(prevScn){
		var insOffsetSht = this.parent.contents.indexOf(prevScn.contents[prevScn.contents.length-1]) + 1;
		var insOffsetClm = this.parent.columns.indexOf(prevScn.contents[prevScn.contents.length-1].columns[prevScn.contents[prevScn.contents.length-1].columns.length-1]) + 1;
		}else{
		var insOffsetSht = 0;
		var insOffsetClm = 0;
		}
	}
//挿入する
	this.contents.splice(insPt,0,sht);
//被挿入カットと所属カラムをフラットコレクションに挿入
	var insSx = this.parent.contents.indexOf(sht);
	if (insSx < 0) {
//既存カットでないのでショットを挿入
		this.parent.contents.splice(insOffsetSht + this.contents.indexOf(sht),0,sht);
		for (var c = 0 ;c< sht.columns.length ; c ++){
			var insCx = this.parent.columns.indexOf(sht.columns[c]);
			if (insCx < 0) {
//既存カラムでないので挿入
				this.parent.columns.splice(insOffsetClm + c,0,sht.columns[c]);
			}
		}
	}else{
//既存カットである　＞　例外発生
		console.log('check storyboard shotCollemction conflict　!!:');
		console.log(sht);
	}
//カットに対応するカット袋を検索・存在しなければ作成　カットに上書き登録
	var insCb = sht.getMap();
	if((sht.sci instanceof nas.Pm.SCi)&&(insCb == null)){
		sht.xmap = new nas.StoryBoard.SBxMap(sht,sht.sci.toString('full'));
	}else{
		sht.xmap = insCb;
	};//カット番号未定ショットは、xmapの登録を保留(nullで放置)
	insSx = this.parent.contents.indexOf(sht);
	this.parent.activeColumnId = ((insSx+1)<this.parent.contents.length)?
		this.parent.columns.indexOf(this.parent.contents[insSx+1].columns[0]):this.parent.columns.length;
//　この処理では最後尾の後方カラムでなく、次カットの先頭カラムにフォーカスするするため、ショット未所属カラムにはフォーカスがゆかない
	this.parent.activeColumn = this.parent.columns[this.parent.activeColumnId];
	return sht;
}
/*
	絵コンテ用カット（ショット）データ
	parent			:{Object nas.StoryBoard}
	sci				:shot information nas.Pm.sci
	xmap			:ショット自身が格納されたxmapへの参照  nullで初期化して初期化の際に検索が行われる
					:兼用情報はxmapオブジェクトを介して参照する仕様に変更される
	columns			:content columns {Object na.StoryBoard.SBColumnCollection}
	posterPicture	:number
	nodeChart		:管理用ノードコレクション 存在しない場合もある
	
	絵コンテ用カラムデータコレクション
	絵コンテ上のカット カラムトレーラーとしても働く
	無名のカラムパーサとして　sci|xmapを持たないショットを設定可能にする
	データパース終了時に、自分自身を削除する

	サマリキャッシュとしての機能をもたせる
*/
nas.StoryBoard.SBShot = function Cut(parent,sci,columns,style){
	this.parent		= parent         ;//{Object nas.StoryBoard}
	this.scene		= this.getScene();//{Object nas.StoryBoard}
	this.sci		= null	         ;//{null | Object nas.Pm.SCi}
	this.xmap		= null	         ;//{null | Object nas.StoryBoard.SBxMap}
	this.columns	= columns        ;//{Array of nas.StoryBoard.SBCloumn}
	this.posterPicture = 0;//{Number} posterPicture column-I	d 
	this.sn ;//{number} serial number(一時変数)
	this.token;//DB接続用トークン
	this.timestamp        ;//DB接続用タイムスタンプ
	this.nodeChart  =[]   ;//バージョンコレクション nas.Xps.pmu.nodeManager.getChart()で得られる配列(自動更新)
//optional
	this.style	= {};
	if(style){
		this.style = style;
	}
//sciが存在すれば　sciプロパティから転記
	if(sci instanceof nas.Pm.SCi){
		this.sci = sci;
		this.id		=	this.sci.id  ;//:{Number Int} ショットID(ShotIndex) unique
		if((typeof this.id == 'undefined')||(this.parent.contents.findIndex(function(element,index,array){return (this.id == element.id)}) >=0 ),this)		this.id = nas.uuid();
		this.name	=(sci instanceof nas.Pm.SCi)? sci.name:"";//:{String} indexText　カット名称
		this.time	=(sci instanceof nas.Pm.SCi)? sci.time:"";//:{String} timeText,

/*{
		var xmapId = -1;
		if(Object.keys(sci) != 0){
			xmapId = this.parent.xmaps.findIndex(function(element,index,array){
//console.log(array[index]);
				for (i = 0;i<array[index].inherit.length;i++){
//console.log([this.sci.name,array[index].inherit[i].name])
					if ((this.name)&&(nas.Pm.compareCutIdf(this.name,array[index].inherit[i].name)==0)) return true;
				}
				return false;
			},this);
		};
	}else{}
;// */
	}
/*
	if(xmapId >= 0){
		this.xmap = this.parent.xmaps[xmapId];
	}else if(this.sci instanceof nas.Pm.SCi){
		this.xmap = new nas.StoryBoard.SBxMap(this.parent,this.sci.toString('full'));
	};// コンストラクタ上は、カット番号未定ショットは、xmapの登録を保留(nullで放置) */

//	this.inherit= [this.sci];
//columnsデータから転記する分
	this.pictures		;//:{Array of String} 画像URL|encodedText,
	this.descriptions	;//:{String} descriptionText 
	this.sounds			;//:{String} dialog|soundText

	this.xmap = this.getMap();
	if((this.sci instanceof nas.Pm.SCi)&&(this.xmap == null)&&(this.parent)){
		this.xmap = new nas.StoryBoard.SBxMap(this,this.sci.toString('full'));
	};// コンストラクタ上は、カット番号未定ショットは、xmapの登録を保留(nullで放置)

	if(this.xmap) this.xmap.contents.add(this);
}
/*
	管理ノードコレクションにノードを追記する
*/
nas.StoryBoard.SBShot.prototype.writeNode = nas.StoryBoard._writeNode;

/*
	管理ノードコレクションでノードを検索
	@params	{Object mNode} mNode
	{line:<linename>,stage:<stagename>,job:<jobname>,status:<statusstring>}
	@returns {Object}
		node or null
*/
nas.StoryBoard.SBShot.prototype.searchNode = function(mNode){
	if(! this.nodeChart) return null;
	var spt = [mNode.job,mNode.stage,mNode.line,''].join('.');
	for(var l = 0; l< this.nodeChart.length ; l++){
			for(var s = 0; s< this.nodeChart[l].stages.length ; s++){
				for(var n = 0; n< this.nodeChart[l].stages[s].nodes.length ; s++){
					if(nas.Pm.compareManagementNode([
						this.nodeChart[l].stages[s].nodes[n].name,
						this.nodeChart[l].stages[s].name,
						this.nodeChart[l].name,
						''
					].join('.'),spt) == 0) return this.nodeChart[l].stages[s].nodes[n];
			}
		}
	}
	return null;
}
/*
	所属 BSScene を検索して返す
	存在しない（シーンに所属しない場合は）null
	
*/
nas.StoryBoard.SBShot.prototype.getScene = function (){
	if(! this.parent) return null;
	var sceneID = this.parent.scenes.findIndex(function(element,array){
			return (element.contents.indexOf(this) >= 0);
	},this);
	if (sceneID >= 0){
		this.scene = this.parent.scenes[sceneID];
		return this.parent.scenes[sceneID];
	}
	return null;
}
/*
	所属SBxMapを検索して返す
	ヒット時にxmapのinherit情報を同期更新する
	親のxMapコレクション内に存在しない場合はnullを戻す
	getMapの判定アルゴリズムをcontentsの検索に変更
*/
nas.StoryBoard.SBShot.prototype.getMap = function (){
//console.log(this.sci);
	if ((! this.sci)||(! this.parent)) return null;
	var xmapId = -1;
	if(Object.keys(this.sci) != 0){
		xmapId = this.parent.xmaps.findIndex(function(element,index,array){
			for (var i = 0;i<element.inherit.length;i++){
				if ((this.sci.name)&&(nas.Pm.compareCutIdf(this.sci.name,element.inherit[i].name)==0)){
					element.inherit[i]  = this.sci;//一致条件を満たしたので現在のオブジェクトで上書きする
					element.contents[i] = this;//一致条件を満たしたので現在のオブジェクトで上書きする
					return true;
				}
			}
			return false;
		},this);
	};
/*
	if(Object.keys(this.sci) != 0){
		xmapId = this.parent.xmaps.findIndex(function(element,index,array){
			return (element.contents.indexOf(this) >= 0);
		},this);
	};// */
	if (xmapId >= 0){
		return this.parent.xmaps[xmapId];
	}
	return null;
}
/*
	文字列化メソッド
	@params	{Stging} form
		出力フォーム指定文字列 screenplay|AR|storyboard|full
			screenplay	シナリオ形式（シーン）
			AR			録音台本形式（シーン｜ショット）
			storyboard	絵コンテ形式（ショット｜カラム）
			full		全出力（シーン|ショット|カラム）
カット柱以下の出力
*/
nas.StoryBoard.SBShot.prototype.toString = function (form){
	if(! form) form = 'full';
	var result		= [];
	var inheritList	= [];
//シナリオ(screenplay)モード以外でカットがシーンに所属していれば、カット柱を出力
	if((form != 'screenplay')&&(this.sci instanceof nas.Pm.SCi)){
		var shotName = this.sci.toString('time');
//		if(this.sci.time) shotName += '('+this.sci.time+')'; 
		if(this.xmap.inherit.length > 1){
			for(var ix=0;ix<this.xmap.inherit.length;ix ++){
				if(nas.Pm.compareCutIdf(shotName,this.xmap.inherit[ix].name)!=0){
					inheritList.push(this.xmap.inherit[ix].toString('time'));
				}
			}
		}
		if(inheritList.length){
			result.push('◇' + shotName+'/'+inheritList.join('/'));
		}else{
			result.push('◇' + shotName);
		}
	}
	for (var cix = 0 ; cix < this.columns.length ; cix++){
		result.push(this.columns[cix].toString(form));
	}
	return result.join('\n');
}
/*
	識別子で返す
*/
nas.StoryBoard.SBShot.prototype.getIdentifier = function (){
		return [this.parent.product,this.sci.toString(),'.xpst'].join('//');
}
/*
	JSON化可能オブジェクトに変換して返す
	プログラム利用のための出力なので省略は行わない
	sciプロパティがnullの場合もそのまま

cut:{
	sci:{String},
		name:{String},
		time:{String},
	inherit:{String},
	id:{String},
	style:{Object},
	columns:[Array of Columns]
}
*/
nas.StoryBoard.SBShot.prototype.getObject = function (form){
	if(! form) form = 'Object';
	var result = {};
	if(this.sci instanceof nas.Pm.SCi){
		result.sci = this.sci.name+'('+this.sci.time+')'
	}else{
		result.sci = null;
	}
	if(this.xmap instanceof nas.StoryBoard.SBxMap){
		result.inherit = [];
		for (var ix = 0;ix < this.xmap.inherit.length ;ix ++) result.inherit.push(this.xmap.inherit[ix].toString('time'));
	}
	if(this.name){
		result.name = this.name;
	}
	if(this.picture){
		result.picture = this.picture;
	}
	if(this.time){
		result.time = this.time;
	}
	if(this.id){
		result.id = this.id;
	}
//スタイルプロパティがあれば
	if(Object.keys(this.style).length){
		result.style = this.style;
	}
//カラム
	result.columns = [];
	for (var cix = 0 ; cix < this.columns.length ; cix++){
		result.columns.push(this.columns[cix].getObject('Object'));
	}
	if (form=='JSON'){
		return JSON.stringify(result);
	}else{
		return result;
	}
}

/*
	ショット（カット）オブジェクトのパース
	基本的にはショットデータ一つ分のデータが与えられる
	カラムタグを認識した場合、そこからデータを分割してカラムパーサに送る
	データパーサ用の一時オブジェクトは sci情報がnullなのですべてのカラムは cid = -1となる

	また、カラム内でカット記述終了のサインがあれば、以降のカラムはやはり cid = -1 となり
	ドキュメントのコレクションには追加するがショット内のカラムコレクションには編入しない
	（カラムパーサ側の処理）

無名のショット柱に対する調整が必要 2021.02 24
*/
nas.StoryBoard.SBShot.prototype.parseContent = function (content){
//console.log(content)
	if(!content) return false;
//	var sci			= this.sci;//nullの可能性アリ
//	var inherit		= [];//兼用リスト 直接保存はしない　一時配列
	var description	= [];//カラムデータを連結する
	var dialog		= [];//カラムデータを連結する
	var style 		= {};//取得したスタイルデータを一時保存
//	var xmap		= this.xmap;
//ショット柱を検出して自身を初期化 柱を削除
	var colSearch = content.match(nas.StoryBoard.shotRegex);
	if(colSearch){
//console.log(this.parent.product+'//'+colSearch[1]);
//		var colInf = nas.Pm.parseIdentifier(this.parent.product+'//'+colSearch[1]);
		var colInf = nas.Pm.parseIdentifier(colSearch[1]);
		this.sci = ((colInf)&&(colInf.sci))? colInf.sci[0]:new nas.Pm.SCi() ;//overwrite
		this.xmap = this.getMap();
		if(this.xmap == null){
			this.xmap = new nas.StoryBoard.SBxMap(this,this.sci.toString('time'));
		}
		if((!this.xmap)||(this.sci.name != this.xmap.name)||(this.xmap.inherit.length == 1)){
//xmapがない||ショット名の変更が発生している||初期xmapがアタッチされている
//新しいショット名が既存のxmapにあるか否かを先行で検査
			var xmapId = -1;
			xmapId = this.parent.xmaps.findIndex(function(element,index,array){
				for (var i = 0;i<array[index].inherit.length;i++){
					if ((this.sci.name)&&(nas.Pm.compareCutIdf(this.sci.name,array[index].inherit[i].name)==0)) return true;
				}
				return false;
			},this);
			if(xmapId >= 0){
				if(this.parent.xmaps[xmapId] !== this.xmap){
					var newxMap = this.parent.xmaps[xmapId];
					this.xmap.remove();
					this.xmap = newxMap;
					if (this.xmap.contents.indexOf(this) < 0) this.xmap.contents.add(this);
				}
			}else{
				this.xmap.scene = this.sci.scene;
				this.xmap.cut   = this.sci.cut;
				this.xmap.name  = this.sci.name;
				this.xmap.inherit[0]  = this.sci;
				this.xmap.contents[0] = this;
			}
		};
console.log(colInf);
		this.inherit = (colInf)? colInf.sci:[];//配列保存
		if(this.inherit.length > 1){
			for(var ix = 0; ix < this.inherit.length ; ix ++){
				this.xmap.inherit.add(this.inherit[ix],
					function(tgt,dst){return (nas.Pm.compareCutIdf(tgt.name,dst.name)==0)}
				);
			}
		}
		content = content.replace(nas.StoryBoard.shotRegex,"");
	}
//再実行して二番目以降の柱が存在すればその後方内容を削除
	colSearch = content.match(nas.StoryBoard.shotRegex);
	if(colSearch) content = content.slice(0,colSearch.index);
//コンテンツ内のスタイルタグを検索
	var styleTag = content.match(/<style\b[^>]*>/);
	if(styleTag){
		tagData = (styleTag[0].replace(/\s+/g,",")).split(",");
		for (var tix = 0 ;tix < tagData.length; tix++){
			if(tagData[tix].indexOf("=") < 0) continue;
			Function('style.'+tagData[tix])();//as eval string
		}
		content = content.replace(/<style\b[^>]*>/g,"");//全削除
	}
	var dataArray = String(content).split(/\r\n|\r|\n/);
	var tagdetect = 0;
	var commentSkip = false;
	var currentColumn = new nas.StoryBoard.SBColumn(this.parent,((this.sci)? 0:-1),{});//****
	this.columns.push(currentColumn);//いったんcolumnコレクションに収納
	this.parent.columns.push(currentColumn);
//残データ（description|dialog|<Tag>）を処理
//タグごとに分解してショットのカラムを構成
//タグのないケースではすべてが第一カラムに登録される
	var columnText = '';
	for (var line = 0; line < dataArray.length; line++){
		var dataLine = dataArray[line];
		if (commentSkip){
			if(dataArray[line].match(/^.*\*\/(.*)$/)){
				commentSkip = false;
				if(RegExp.$1){
					columnText += RegExp.$1+'\n';
				}else{
					continue;
				}
			}
		}
		if (dataLine.match(/^#|^\/\//)) continue;
		if (! commentSkip){
			if(dataLine.match(/^(.*)\/\*.*$/)){
				commentSkip = true;
				if(RegExp.$1){
					columnText += RegExp.$1+'\n';
				}
				continue;
			}
		}
		if(dataLine.match(/<column\b/)){
			if(this.columns.length == tagdetect){
				currentColumn.parseContent(columnText);
				if((this.sci)&&(currentColumn.cid < 0)) this.columns.splice(this.columns.indexOf(currentColumn),1);
//ダミーショット以外ではカラムをパースした結果cidが負数になる場合コレクションから削除する = ダミーショットはショットごと削除されるので処理不要
				currentColumn = new nas.StoryBoard.SBColumn(this.parent,(((!this.sci)||(currentColumn.closeShot))? -1:this.columns.length),{});//****
				this.columns.push(currentColumn);
				this.parent.columns.push(currentColumn);
				columnText = dataLine +'\n';
			}else{
				columnText += dataLine +'\n';
			}
			tagdetect ++;
		}else{
			columnText+=dataLine+'\n';
		}
	}
//loopend
	if(columnText.length) currentColumn.parseContent(columnText);
	if((this.sci)&&(currentColumn.cid < 0)) this.columns.splice(this.columns.indexOf(currentColumn),1);
//ダミーショット以外ではカラムをパースした結果cidが負数になる場合コレクションから削除する
	this.name  = (this.sci)? this.sci.name:null;
	this.style = style;
//カット内のカラム情報を集計して整合をとる
	this.adjustColumn();
//ショット自体が一時データであった場合、パース処理終了時に自身を親コレクションから削除
	if(! this.sci) this.parent.contents.splice(this.parent.contents.indexOf(this),1);
	return this;	
}

/*
	カラムの内容をチェックして親カットのプロパティに反映させる
	カラムの情報に不整合がある場合は、基本的にカット側をカラム内の情報に合わせる
	特例として
	ショットに番号がありカラムに記述が存在しない場合は特例でカラムへ転記する
	ショットに時間情報があり、カラムに時間記述が一切存在しない場合は特例でカラム側へ転記する
	sciが無効なケースでは処理なし
*/
nas.StoryBoard.SBShot.prototype.adjustColumn = function (){
	if(! this.sci) return this;//処理なし
//カラムの内容をチェックしてsciプロパティに反映させる(逆はなし)
	var timeStack = 0;//カット時間（フレーム数）合計
	var nameDescription = [];
	var frate = this.parent.framerate;
	this.pictures		= [];
	this.descriptions	= "";
	this.sounds			= "";
	for(var cix=0;cix<this.columns.length;cix++){
		if(! this.columns[cix].cid != cix) this.columns[cix].cid = cix;
		if(this.columns[cix].indexText != ''){
			nameDescription.push(this.columns[cix].indexText);
			this.columns[cix].indexText = '';
/*　カラムインデックスは、フラットデータの際にカット番号として使用するので最初の一つだけを有効データとする*/
		}
		if(this.columns[cix].timeText){
			var columnTime = nas.FCT2Frm(this.columns[cix].timeText,frate);
			timeStack += (columnTime)? columnTime : 0 ;
		}
/*--------------------------------------------------------*/
		this.pictures.push((this.columns[cix].picture)? this.columns[cix].picture:'blank');
		this.descriptions += this.columns[cix].description.join('\n').replace(/\n+/g,'\n');
		this.sounds += this.columns[cix].dialog.join('\n').replace(/\n+/g,'\n');


	}
	if(nameDescription.length){
		this.sci.cut = nameDescription[0];//第一出現データをとってあとは廃棄
	}
		this.columns[0].indexText = this.sci.cut;//ここは番号付け規則で分岐・調整が必要　

	if(timeStack == 0){
		this.columns[this.columns.length - 1].timeText = this.sci.time;
	}else{
		this.sci.time = nas.Frm2FCT(timeStack,3,0,this.parent.framerate);
	}
	this.time = this.sci.time;




/*--------------------------------------------------------*/
	return this;
}
/**
 *   ショット(カット)が自分自身を削除する
 *   @returns {Object this | false}
 */
nas.StoryBoard.SBShot.prototype.remove =function(){
//自身を削除する前に内包するカラムをすべて削除する
	for (var cx = this.columns.length - 1 ; cx >= 0 ; cx -- ) this.columns[cx].remove();
//シーンに所属しているならシーン内のコレクションから自身を削除する
	var myScn = this.getScene();
	if(myScn){
		var dx = myScn.contents.indexOf(this);
		if(dx >= 0) myScn.contents.splice(dx,1);
	}
//カット袋が割り当てられているはずなので　そこから兼用を抜く
	var myxMap = this.getMap();
	if(myxMap) myxMap.remove(this.name);
	if(this.parent){
		this.parent.activeColumn = this.parent.columns[this.parent.activeColumnId];
		var ix = this.parent.contents.indexOf(this);
		if((this.columns.length == 0)&&(ix > -1)){
			this.parent.contents.splice(ix,1);
		}
	}
	return this;
}
/**
	ショットにカラムを挿入する
	@params	{Object nas.StoryBoard.SBColumn}	clm
	@params	{Number}	insPt
		挿入点ID　0~ 指定IDの前方に挿入　指定のない場合｜不正指定は末尾へ追加
	@returns	{Object nas.StoryBoard.SBColumn}
		挿入したSBColumn

*/
nas.StoryBoard.SBShot.prototype.insertColumn =function(clm,insPt){
	if(
		( this.columns.indexOf(clm) >= 0)||
		(! clm instanceof nas.StoryBoard.SBColumn)
	) return false;

	if(clm.parent !== this.parent) clm.parent = this.parent;

	if(isNaN(insPt)){
		insPt = this.columns.length;
	}else{
		insPt = parseInt(insPt);
	}
//挿入前に現カラムの開始IDを取得
	var insOffsetClm = this.parent.columns.indexOf(this.columns[0]) + 1;
//挿入する
	this.columns.splice(insPt,0,clm);
//被挿入カラムをフラットコレクションに挿入
	var insCx = this.parent.columns.indexOf(clm);
	if (insCx < 0) {
		this.parent.columns.splice(insOffsetClm+this.columns.indexOf(clm),0,clm);
	}
	this.parent.activeColumnId = this.parent.columns.indexOf(clm)+1;
	this.parent.activeColumn = this.parent.columns[this.parent.activeColumnId];
	return clm;
}

/*
	絵コンテ用コラムデータ
	indexText
	picture
	descriptionText
	timeText
	soundText
	style optional
cidは、ショット（カット）内でのインデックス
cid = 0 は先頭カラム表す　初期化時のみ有効
コレクション編入後はショットの編集状態によって変動する
cid = -1 はそのカラムがいずれのショットにも含まれないことを示すフラグとなる

コラムデータはストーリーボードのアトムとなる
pgId - pgClm を　必須情報として持つ
pageControllを行わない場合は　pgId==0;pgClm == parent.columns.id;　となる

Object style:{
	pgId	:{String}	page index number or name 絵コンテの時間進行方向,
	pgClm	:{String}	pageColumnIndex
}
	
シーンにもカットにも所属しないカラムを本文冒頭以外で挿入する書式を作成する


カラムにショット終端のプロパティを作成する？
カラムの記述内ショット終了タグを埋め込むことで終了プロパティが設定される

カラムのcidを -1 に設定することで明示的にシーン｜ショット外カラムを記述できる

カット（ショット）

カラムインデックステキストを○または数値で置いてショットの変更を定義する。

ここに予約語を与えて以降の記述がショット及びシーンから離れることを宣言できるものとする。

予約語
○,◯,(*),(_)
	カットの切り替わりを示すサイン
	自動ナンバリングの対象
*,_,-,/,↓,ヽ,々,〃,''(空文字列)
	カラムが先行カラムと同じ所属であることを表すサイン
	先行カラムの所属が null である場合は同じく null (null≠null)
<cut>
	当該カットの内容記述がこのカラムで終了することを宣言するタグ
*/
nas.StoryBoard.SBColumn = function Column(parent,columnIndex,style){
	this.parent		= parent;//parent storyboard
	this.cid		= columnIndex ;//:{Number Int} カラムID(ArrayIndex),
	this.indexText	= '';//:{String} indexText
	this.picture	= 'blank';//:{String} 画像URL|encodedText,
	this.timeText	= '';//:{String} timeText,
	this.description= [];//:{String} array of descriptionText by line,
	this.dialog		= [];//:{String} array of dialog|soundText by line
	this.pgId		= 0;
	this.pgClm		;
	this.sn			;//{number} serial number(一時変数)
//optional
	this.style	= {
	};
	
	if(style){
		this.style = style;
	}
}
/*
	所属カットを検索して返す
	存在しない（カットに所属しない場合は）null
	
*/
nas.StoryBoard.SBColumn.prototype.getShot = function (){
	if (! this.parent) return null;
	var shotID = this.parent.contents.findIndex(function(element,array){
			return (element.columns.indexOf(this) >= 0);
	},this);
	if (shotID >= 0) return this.parent.contents[shotID];
	return null;
}
/*
	所属シーンを検索して返す
	存在しない（シーンに所属しない場合は）null
	カットには所属しないがシーンに所属するカラムが存在するので注意
*/
nas.StoryBoard.SBColumn.prototype.getScene = function (){
	if (! this.parent) return null;
	var shotID = this.parent.contents.findIndex(function(element,array){
			return (element.columns.indexOf(this) >= 0);
	},this);
	if (shotID >= 0) {
		var cSht = this.parent.contents[shotID];
		return cSht.getScene();
	}else{
		if(this.cid == -1){
			for(var s = 0 ;s < this.parent.scenes.length;s++){
				if(this.parent.scenes[s].column == this) return this.parent.scenes[s];
			}
		}
	}
	return null;
}
/*
	文字列化メソッド
	@params	{Stging} form
		出力フォーム指定文字列 screenplay|AR|storyboard|full
			screenplay	シナリオ形式（シーン）
			AR			録音台本形式（シーン｜ショット）
			storyboard	絵コンテ形式（ショット｜カラム）
			full		全出力（シーン|ショット|カラム）

	タグ出力から開始
	パーサはタグ前の未解決記述を許すが、出力はしない（記録自体をしない）
<column cid=>
*/
nas.StoryBoard.SBColumn.prototype.toString = function (form){
	if (! form) form = 'full';
	var result = '';
	if(form.match(/full|storyboard/i)){
		result += '<column';
		result += ' cid=';
		result += String(this.cid);
		if(this.indexText){
			result += ' indexText="';
			result += this.indexText;
			result += '"';
		}
		if(this.picture){
			result += ' picture="';
			result += this.picture;
			result += '"';
		}
		if(this.timeText){
			result += ' timeText="';
			result += this.timeText;
			result += '"';
		}
		result += '>\n';
	}
//スタイルプロパティがあれば
	if(Object.keys(this.style).length){
		result += '<style ';
		for (var prp in this.style){
			result += prp +'="';
			result += this.style[prp]+'"';
		}
		result += '>\n';
	}
//セリフとト書きを合成する
//インデント量のコントロールをして英文タイプと日本タイプを切り分ける
	var descriptionIndent =(this.parent.scriptType=="en")? '':'\t';
	var textArray = [''];//ト書き複製　セリフの挿入位置に null
	var insertNull = true;//ダイアログ挿入フラグ
	for (var ix=0;ix<this.description.length;ix++){
		if(this.description[ix] != null){
			textArray.push(descriptionIndent+this.description[ix]);
			insertNull = true;
		}else{
			if(insertNull){
				textArray.push(null);
				insertNull = false;
			}
		}
	}
//日本型はinlineで　名前「セリフ」, 英文型は　<center><uppercase>name</uppercase></cente><br><indent>dialog....
	if(this.parent.scriptType=="en"){
		var dialogIndent = (this.parent.shortIndent)? this.parent.shortIndent:'\t\t';//h-tab 2つ　全体の字下げ用
		for (var ix=0;ix<this.dialog.length;ix++){
			var dialogText = (
				(this.dialog[ix] == null) ||
				(
					(this.dialog[ix])&&
					(this.dialog[ix].match(/^.+[\"「]/))
				)
			)? this.dialog[ix]:dialogIndent + this.dialog[ix];
			if(textArray.length == ix){
				textArray.push(dialogText);
			}else if(this.dialog[ix] == null){
				continue;
			}else if(textArray[ix] == null){
				textArray[ix] = '';//replace
				textArray.splice(ix+1,0,dialogText);
			}else{
				textArray.splice(ix+1,0,dialogText);
			}
		}

	}else{
//日本語形式
		var dialogIndent = '  ';//空白2つ　2行目以降の字下げ用
		for (var ix=0;ix<this.dialog.length;ix++){
			var dialogText = (
				(this.dialog[ix] == null) ||
				(
					(this.dialog[ix])&&
					(this.dialog[ix].match(/^.+[\"「]/))
				)
			)? this.dialog[ix]:dialogIndent + this.dialog[ix];
			if(textArray.length == ix){
				textArray.push(dialogText);
			}else if(this.dialog[ix]==null){
				continue;
			}else if(textArray[ix] == null){
				textArray.splice(ix+1,0,dialogText);
			}else{
				textArray.splice(ix+1,0,dialogText);
			}
		}
	}
//	result += this.description.join('\n');
//	result += this.dialog.join('\n');
	for(var t = 0 ; t < textArray.length ; t ++ ){
		if(textArray[t] == null){
			textArray[t] = '';
		}
	}
	result += textArray.join('\n');
	return result;

}
/*TEST
document.getElementById('msg_well').value = (`nasMOVIE-SCRIPT 1.0
##[beginStartup]
title:	メイドイン・アビス
episode:	パートD
style:{"pageControll":false}
product:	メイドイン・アビス#パートD
stage:	draft
scriptType:	en
framerate:	24
shotNumberUnique:	true
activeColumnId:	2
##[endStartup]
##[beginScript]
◯ 
◇s-c846(120)
<column indexText="846" picture="blank" timeText="120">
◇s-c847(144)
<column indexText="847" picture="blank" timeText="144">

 三角池に顔を見せるうなぎ

			うなぎ
		ニョロリンころりん」

 タヌキやってくる

			うなぎ
		おやおや、タヌキさんこんにちは！

			タヌキ
		ポポン！

##[endScript]`)
	A = new nas.StoryBoard('madeInAbbys#partD');
	A.parseScript(document.getElementById('msg_well').value);
	A;
*/
/* このコードは、日本型ダイアログテキストから　英文型ダイアログテキストへの変換コードになってるので要移設
		var nameIndent = this.parent.longIndent;
		var dialogIndent = this.parent.shortIndent;
		var dialogArray = [];
		var currentDialog = [];
		var dialogText = ''

		for (var ix=0;ix<this.dialog.length;ix++){
			if( this.dialog[ix] == null){
				dialogArray.push(null);
				continue;
			}else if(this.dialog[ix].match(/[\"」]$/)){
				currentDialog.push(this.dialog[ix]);
//console.log(currentDialog.join(''));
				dialogArray.push(new nas.AnimationDialog(null,currentDialog.join('')));
				if(currentDialog.length > 1){
					for (var ins = 1;ins < currentDialog.length;ins ++){dialogArray.push(null)}
				};
				currentDialog =[];//reset
			}else if( this.dialog[ix].match(/^.+[\"「]/)){
				currentDialog = [this.dialog[ix]];
			}
		}
//console.log(dialogArray);
		for (var ix=0;ix<dialogArray.length;ix++){
			if (dialogArray[ix]){
				var dialogText = nameIndent + dialogArray[ix].name +'\n';
				for (var ax=0;ax<dialogArray[ix].attributes.length;ax++){
					dialogText += nameIndent + dialogArray[ix].attributes[ax]+'\n';
				}
					dialogText += dialogIndent;
				var startPt=0;
				if(dialogArray[ix].comments.length){var endPt=dialogArray[ix].comments[0][0]}else{var endPt=0};
				for(var cix=0;cix<dialogArray[ix].comments.length;cix++){
					dialogText+=dialogArray[ix].bodyText.slice(startPt,endPt)+dialogArray[ix].comments[cix][1];
					startPt=endPt;
					if(cix<dialogArray[ix].comments.length-1){endPt=dialogArray[ix].comments[cix+1][0]};
				}
				if(startPt<dialogArray[ix].bodyText.length){dialogText+=dialogArray[ix].bodyText.slice(startPt)};
			}else{
				var dialogText = "";
			}
			if(textArray.length == ix){
				textArray.push(dialogText);
			}else if(this.dialog[ix]==null){
				continue;
			}else if(textArray[ix] == null){
				textArray[ix] = dialogText;//replace
			}else{
				textArray.splice(ix+1,0,dialogText);
			}
		}:
*/
/*
	JSON化可能オブジェクトに変換して返す
	プログラム利用のための出力なので省略は行わない

{
	cid:{init},
	uid:{String},
	dialog:{String},
	description:{String}
}
*/
nas.StoryBoard.SBColumn.prototype.getObject = function (form){
	var result = {};
	result.cid 	= this.cid
	if(this.indexText){
		result.name = this.indexText;
	}
	if(this.picture){
		result.picture = this.picture;
	}
	if(this.timeText){
		result.timeText = this.timeText;
	}
//スタイルプロパティがあれば
	if(Object.keys(this.style).length){
		result.style = this.style;
	}
//セリフ・ト書き
	result.dialog = this.dialog.join('\n');
	result.discription = this.description.join('\n');

	if (form=='JSON'){
		return JSON.stringify(result);
	}else{
		return result;
	}
}
/*
	parseContent
	拡張台本形式のテキスト片をパースしてオブジェクトプロパティを配置するオブジェクトメソッド
	テキスト片は<column>タグに囲まれた形で与えられる
	<column>タグは一度以上現れてはならない。
	二度目の<column>の出現点で処理は中止されタグから先のデータは無視される
	テキスト片に柱データが含まれていてはならない。柱のレコードは無視される。
	<column>タグのアトリビュートはオブジェクトのプロパティに振り分ける
	基礎プロパティ以外の内容はリセットされるので注意
	シーン柱・カット柱出現後、<column>タグの開始前に現れるデータは　後で出現するはずの<column cid=0>タグに対するデータとみなされる
	テキスト内に遅延して<column　cid=0 ~>タグが現れた場合は、そのタグ内のアトリビュートのみを取得する
	cid=0　以外のデータが現れた場合は（2つ目のタグとみなして）そこで<column cid=0>のタグを解決する
	タグをまるで含まないテキスト片はcid=0の単一カラム以外にはならない
	（⇒AR台本等を処理すると各ショット1カラムかつ絵が含まれない構成となる）
	
	カラム記述・インデックステキストまたはその他のショット記述終了が宣言された場合以降のカラムはショット内のカラムコレクションから削除される
	カラム(id<0)が検出された場合、そのカラムはショット内のカラムコレクションから削除される
	
	StoryBoard.TimeText format
	(0012//24fps)
	フレームレートの指定は可能だが、非推奨　本来的には親（タイトル・エピソード）のフレームレートを使用する
	シナリオテキスト（ディスクリプションテキスト）上での尺指定は拾わない。
	柱またはタグで打つ
	ショット柱◇s-c12(3+6)
	冒頭のマークを払って nas.Pm.parseIdentiferに通して情報を得る
eg.
`◇s-c008(3+6)
<column cid=0 picture='file:URL' width=640px height=360px timeText='3+6/OL(1+0)/'>
	汗だくのオサゲ、アップで 
オサゲ「これ、ついでに買ってきちゃった」
	アイスバーを差し出して「トクイ！」`

*/
nas.StoryBoard.SBColumn.prototype.parseContent = function(content){
	if(!content) return false;

	var cid ;//パースされるcid情報 オブジェクトの既設情報は無視
	var description	= [];
	var dialog		= [];
	var style 		= {};
	var tagData		= '';
	var dataSet		= [];
//初出のタグ内を処理 タグ記述を削除
	var tagSearch = content.match(/<column\b[^>]*>/);
//console.log(tagSearch[0]);
	if(tagSearch){
//console.log(tagSearch[0].replace(/\s+/g,",").split(","));
		tagData = (tagSearch[0].replace(/\s+/g,",")).split(",");
//console.log(tagData);
		for (var tix = 0 ;tix < tagData.length; tix++){
			if(tagData[tix].match(/.+=.+$/)){
				dataSet = tagData[tix].split('=');
				if(dataSet[1].length){
					if(dataSet[1].match(/^".*"$|^'.*'*/)){
//console.log("引用符削除" + dataSet[1].slice(1,dataSet[1].length-1));
						this[dataSet[0]]=dataSet[1].slice(1,dataSet[1].length-1);//
					}else{
						if(dataSet[0]=='cid'){
							cid = parseInt(dataSet[1]);//タグに記入してあるcidは直接反映されない（データ控え）
						}else{
							this[dataSet[0]]=dataSet[1];
						}
					}
//if(dataSet[0]=='timeText'){console.log(this[dataSet[0]])};
				}
			}
		}
		content = content.replace(/<column\b[^>]*>/,"");
		if(content.match( /\n+/ )){content.replace( /\n+/g,'\n')};
	}
//再実行して二番目以降のコンテンツタグが存在すればその後方内容を削除
	tagSearch = content.match(/<column\s.+>/);
	if(tagSearch){
		content = content.slice(0,tagSearch.index);
	}
//コンテンツ内のスタイルタグを検索
	var styleTag = content.match(/<style\b[^>]*>/);
	if(styleTag){
		tagData = (styleTag[0].replace(/\s+/g,",").split(","));
		for (var tix = 0 ;tix < tagData.length; tix++){
			if(tagData[tix].match(/.+=.+$/)){
				dataSet = tagData[tix].split('=');
				if(dataSet[1].length){
					if(dataSet[1].match(/^".*"$|^'.*'*/)){
						style[dataSet[0]]=dataSet[1].slice(1,dataSet[1].length-1);//	
					}else{
						style[dataSet[0]]=dataSet[1];
					}
				}
			}
		}
		content = content.replace(/<style\b[^>]*>/g,"");//全削除
	}
	var dataArray = String(content).split(/\r\n|\r|\n/);
	if(dataArray[dataArray.length-1]=='')(dataArray.splice(-1));
	if(dataArray[0]=='')(dataArray.splice(0,1));
	var tagread = false;
	var onDialog = false;
//残りデータを振り分ける
	for(var lix = 0; lix < dataArray.length ; lix ++ ){
		var currentLine = dataArray[lix];
		if(currentLine.match(/^[◯○].*|^[◇◆].*/)) continue;//skip
/*
日本型
	ライン構造を保存するために空行を維持する？
	ここでは空行はdescription|dialog双方に登録する
	改行・字下げを含むセリフをパースする
英語型
	^longIndent = ダイアログラベル
	^shortIndent = ダイアログ内容
	
*/
		if(this.parent.scriptType == 'ja'){
//日本式
			if(currentLine.match(/^\s*$/)){
				description.push(null);
				dialog.push(null);
			} else if(currentLine.match(/^\s+.*/)){
				if(onDialog){
					description.push(null);
//					dialog.push(currentLine.replace(/^\s*/,""));
					dialog.push(currentLine.trim());
					if(currentLine.match(/」$|"$/)) onDialog = false;//"
				} else {
//					description.push(currentLine.replace(/^\s*/,""));
					description.push(currentLine.trim());
					dialog.push(null);
				}
			} else {
//字下げなし
				description.push(null);
//console.log(currentLine);
				var dialogBody = currentLine.trim();
				dialog.push(dialogBody);
				onDialog = (dialogBody.match(/[」\"]/))? false:true;
			}
		}else{
//英文型書式
/*
1.柱の形式は日本語形式と同じ"○"も使用可
	ト書は(インデントなし)または(ショートインデント)
	複数行の際もインデントは統一
			名前(ロングインデント)
		引用符なし　ミドルインデントセリフ内容を記述
		複数行の際もインデント統一
記録データはインデントをトリミング
名前（ダイアログインデックス）にはトリミングの上１段だけタブを加えてサインとする
*/
			if(currentLine.match(/^\s*$/)){
				description.push(null);
				dialog.push(null);
				onDialog = false;
			} else if(currentLine.indexOf(this.parent.longIndent)==0){
				onDialog = true;
				dialog.push('\t'+currentLine.trim());
				description.push(null);
			} else if (currentLine.indexOf(this.parent.shortIndent)==0){
				if (onDialog) {
					dialog.push(currentLine.trim());
					onDialog = false ;
				}else{
					dialog.push(currentLine.trim());
				}
				description.push(null);
			} else {
//字下げなしまたは一段字下げ
				onDialog = false;
				description.push(currentLine.trim());
				dialog.push(null);
			}
		}
	}
//取得データでオブジェクトを更新
//コンテンツ内のショット記述終了サインを検索
/*
	ト書内の"<closeShot>|<cut>"タグ
	インデックステキスト==<cut>
	パーサの戻り値に　終了サインを付加する
	それ以降のcidを-1にするのは呼び出し側の判断で行う
	またはカラムタグで明示的に cid を負数に設定することこも可能
 */
	if(
		(description.join("\n").match(/<cut>|<closeShot>/i))||
		(this.indexText.match(/<cut>/i))
	) this["closeShot"] = true;//一時プロパティを追加

/*
	this.cid		= cid;
	this.indexText		= indexText;
	this.timeText	= timeText;
	this.picture	= picture;
*/
	if(cid < 0) this.cid = cid;
	this.description	= description;
	this.dialog 		= dialog;
	this.style = style;
//パース時にcidが0以下の場合ショットのコレクションから抜く
/*	if(this.cid < 0){
		var parentSht = this.getShot();
		if(parentSht) parentSht.columns.splice(parentSht.columns.indexOf(this),1);
	};// */
	return this;
}
/*test
A=`◇s-c008(3+6)
<column cid=0 picture='file:URL' width=640px height=360px timeText='3+6/OL(1+0)/'>
	汗だくのオサゲ、アップで 
オサゲ「これ、ついでに買ってきちゃった」
	アイスバーを差し出して「トクイ！」`;

*/
/**
 *    引数なし
 *    カラムが自分自身を削除する
 *    所属ショットのカラムコレクションから自身を削除して
 *    所属ショットのカラム数が０になった場合はショットの削除メソッドを呼ぶ
 */
nas.StoryBoard.SBColumn.prototype.remove =function(){
	if(this.parent){
		var idx = this.parent.columns.indexOf(this);
		if(idx >= 0) this.parent.columns.splice(idx,1);
		this.parent.activeColumn = this.parent.columns[this.parent.activeColumnId];
	}
	var myShot = this.getShot()
	if(myShot){
		var ix = myShot.columns.indexOf(this);
		myShot.columns.splice(ix,1);
		if(myShot.columns.length == 0){
			myShot.remove();
		}
	}
	return this;
}

/*
	絵コンテ用ページオブジェクト
	絵コンテ上のカット カラムトレーラー
	ページとして機能する
	ページ管理を行わない場合は不要
	parent		親StoryBoard
	pageIndex	整数インデックス
	columns
*/
nas.StoryBoardColumnCollection = function (parent,pagename){
	this.parent		= parent;
	this.pageIndex	= this.parent.pages.length;
	this.name		= pagename;
}


/*
	シナリオ・録音台本形式のテキストをパースしてストーリーボードオブジェクトを返すクラスメソッド
	新規にオブジェクトを作ってそれを戻す　テスト用
*/
nas.StoryBoard.parseScript = function parseScriptText(dataStream){
	if(! dataStream) return false;

	var result = new nas.StoryBoard("",{});
	result.parseScript(dataStream);
	return result;

}

/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
//    var configure = require('./etc/pmdb/nas.Pm.pmdb.json');
//    nas.Pm.pmdb.parseConfig(JSON.stringify(configure));
// 内部でnas.Storyboardにアクセスがあるのでこの位置ではエラーが出る
    exports.nas = nas;
};