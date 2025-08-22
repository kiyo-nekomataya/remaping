/**
 *  @fileOverview
 *  production managemaent io
 *
 *  nas.Pm は 管理情報を分離するためのクラス<br />
 *
 *  PmUnitを中核にしてそれに付随する制作管理情報をオブジェクトとして保持する
 */
'use strict';
/*=======================================*/
// load order:5
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config    = require( './nas_common' ).config;
    var appHost   = require( './nas_common' ).appHost;
    var nas       = require( './cameraworkDescriptionDB').nas;
}else if(typeof nas == 'undefined'){
	var nas = {};
};
/*
 * require ./config.js
 *  PmUnitは Production(or Project) Management Unit(マネジメントユニット)を表す
 *  ＝カット袋に相当するオブジェクトの拡張機能＝
 *
 *  制作ライン及びステージングを管理するためのオブジェクト
 *  カレントの ライン、ステージ、ジョブの値をひとまとめに保持する
 *  制作上の既経路を保持
 *  エレメントグループに対する変更権の保持（ラインが持つ情報）
 *  及びこれらの情報に対するアクセスを受け持つ
 *  開始時間 伝票番号 担当ユーザなどを参照・設定・変更が可能
 *  オブジェクト初期化時点では、空のオブジェクトを作成する
 *
 *  カット管理を行う場合は ALLアセットを、他の個別素材の場合は個別アセットを引数にして初期化のこと

nas.Pm配下のDB通信オブジェクトは、アクセスポイントとして
nas.pmdb オブジェクトを置いてその配下に参照を配置する
配置されたオブジェクト群は基本的な情報テンプレートとして働く

ClassObject nas.Pm がアプリケーションとしてのテンプレートキャリア
初期状態ではnas.pmdbを実アクセスポイントとして参照を置く
nas.pmdb  は、リポジトリ切り替え毎に各リポジトリの.pmdbに参照先が切り替えられる？

    nas.pmdb.organizations
         関連組織一覧 組織情報コレクション
            プライマリエントリーとしてpmdbの組織情報をエントリーする
            他組織のエントリは、接続情報のみでusersには通常自身のエントリのみを複製する
    nas.pmdb.users
         関連ユーザ一覧　ユーザ情報コレクション
    nas.pmdb.staff
        スタッフ一覧　スタッフコレクション

    nas.pmdb.lines
        ライン一覧テーブル   ラインコレクション
    nas.pmdb.stages
        ステージ一覧テーブル  ステージコレクション
    nas.pmdb.pmTemplates
        制作管理テンプレートコレクション
            ラインテンプレート（ライン定義）
                ラインテンプレートの内容は自分自身と自分で保持するステージコレクション
    nas.pmdb.jobNames
        ジョブテンプレートコレクション
        
    nas.pmdb.workTitles
        .workTitles[titleIndex].episodes
            .episodes[episodeIndex].works ?

    nas.pmdb.products

    nas.pmdb.assets
        アセット情報コレクション
            制作時に管理対象となるアセットの定義テーブル
    nas.pmdb.medias
        制作メディアコレクション
            制作に供されるメディア情報のトレーラー
    nas.pmdb.docForms
        書式コレクション
            制作に供される書類フォーマット情報トレーラー

    等々 その際にparent  経由で相互の参照を行うので初期化時のパラメータ注意    
    nas オブジェクト内では以下の相互関係を持つ

    nas.Pm.~    マスターとなるクラスデータ
    nas.Repository.pmd.~    サーバごとのカスタマイズデータ
    nas.pmdb.~    実アクセスポイント
    配下の各オブジェクトのparentは、それぞれの親をポイントして初期化

    Pmモジュールに設定パーサを実装
    設定パーサは設定ストリームを入力として、リジョン毎に分離
    各リジョンを適切のパーサに振り分けて、自身のコレクションDBを再初期化する
    各パーサは、追加処理を行うが、設定パーサ側でデータのクリアを行い、再初期化動作とする

    nas.Pm.parseConfig(ストリーム)

    nas.pmdb.users
    nas.pmdb.staff

    nas.pmdb.assets
    nas.pmdb.medias

    nas.pmdb.lines
    nas.pmdb.stages
    nas.pmdb.jobNames


// products/workTitles はPmクラスのみに存在するキャッシュオブジェクトなので要注意
   nas.Pm.products	リポジトリ内に記録されたエピソード単位のキャッシュ
   nas.Pm.workTitles	同、作品単位のデータコレクション

Object PmDomain
    nas.Pm.WorkTitle.pmd
    ・
    ・

pmdbオブジェクトは親オブジェクトへの参照 pmdb.parent を持つ
このプロパティは、pmdbが持つ情報の親ノードへの参照
親ノードは以下のオブジェクトに対応する

organization   = Repository.pmdb                 //pmdb.parent = Repository      ; Repository.parent='.';
product(title) = products/product.pmdb           //product.pmdb.parent = product ; product.parent = Repository;
episode(opus)  = product/episodes/episode.pmdb   //episode.pmdb.parent = episode ; episode.parent = product;
cut(work)      = episode/cuts/cut.pmdb           //cut.pmdb.parent = cut         ; cut.parent = episode
各ノードはツリー内を相互にアクセスするための .parentプロパティをもつ
pmdbはノードに対する.parent参照を持つ
pmdb からツリー上位のpmdbにアクセスするためには　this.parent.parent.pmdbをアクセスする必要がある　OK？

organization:
repository:
   product
    title:
     opus:
      pmu:
      cut:
    

pmdbの各オブジェクトにはユニークなプロパティを格納するunique配列をもたせる
この配列に値がある場合、新規メンバー登録の比較条件としてそのプロパティを参照する
RDBMのuniqueインデックスの付いたフィールドに同じ

*/
/**
 * @class
 *   nas 制作管理クラス
 */
nas.Pm = {
    IdentifierStyle : "strict"
};
/*
    識別子フルスペック
datanode-description//product-description//sci-description//management-status.lock.timestamp.dataIdf
<入力データ> {省略可能}
    product-description
<TITLE-STRING>#<OPUS>{[<SUBTITLE>]}

    sci-description
<SCi>/<SCi>/....
    SCi
s<SCENE-No>-c<CUT-No>{(<TIME-CODE>{//<FRAME-RATE>})}

    management-status
[<LINE>//<STAGE>//<JOB>//<STATUS>]/[]
    LINE(URI encoded)
<LINE-ID>:<LINE-STRING>|<LINE-STRING>:<LINE-ID>
    STAGE(URI encoded)
<STAGE-ID>:<STAGE-STRING>|<STAGE-STRING>:<STAGE-ID>
    JOB(URI encoded)
<JOB-ID>:<JOB-STRING>|<JOB-STRING>:<JOB-ID>
    STATUS(URI encoded)
<STATUS-STRING>:<assign-user>:<assign-message>

識別子末尾にはデータ識別フラグが追加される　　2019 5月拡張
識別子の末尾は、データ内容に従って以下のフラグを付加する
xMap    .xmap
Xps     .xpst
pmdb    .pmdb
データ識別フラグの無い識別子は、下位互換ため.xpst扱いとなる
ファイル保存時は、そのまま識別子を拡張子として使用可能
識別子末尾のデータ識別フラグにタイムスタンプを拡張

整数unix-timestamp値を以下の形式で付加
    .1577676348895.xmap
当該データの最終更新情報とする

データの管理ロック情報を追加 2020.06.23
タイムスタンプ情報の手前に管理ロックフラグを追加
ロックが行われていない場合ここ分離記号の'.'を含めて記述が省略される
何らかの記述（分離記号のみ=ヌルストリング を含む）が存在すればそのエントリは管理ロックされているものとする
標準では    .locked.1577676348895.xmap のように単語を挿入
 */
/*
    管理ロック状態の基本的な扱い
    制作管理者が、データ管理中に現場スタッフユーザがデータを更新する危険を回避するために
    管理ロック状態を設ける

    管理ロックの必要なオブジェクト(pmdb|stbd|xmap|xpst)に .management として設定される

    データ管理のための状態オブジェクトプロパティ
    nullまたはnas.UserInfo Boolとして評価 値のコンストラクタはつくらない

    このフラグが立っているデータは当該ユーザ以外のユーザに対して読み出し操作以外ロックされる
    (読み出しは常に可能)

	標準データ識別子上のmLockedプロパティとしてタイムスタンプの前に置くことができる
	値の置かれない場合はunlocked
	
	管理ログは将来的にアプリケーションがsyslog等に向かって投げる形式を取る
	今回の実装では不要 2020.06.23
*/
/**
 *	引数がユニークになるまでラストの一文字を置換する
 *	@params {String} target
 *		比較対象文字列
 *	@params {number} length
 *		比較文字列の冒頭文字数をキャプチャする数
 *      省略時または０の場合は何もしない
 *	@params {Array|Object} table
 *		対照データセットが入ったテーブル配列またはオブジェクト
 *	@params {String}	prop
 *		対照データがオブジェクトであった場合のプロパティ名
 *	
 */
nas.Pm.getUniqueStringInTable = function(target,length,table,prop){
    if(length) target=target.slice(0,length);
	if(nas.Pm.isUniqueStringInTable(target,table,prop)) return target;
	for (var x=0;x<52;x++){
		var resultString = target.slice(0,-1)+("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").charAt(x);
		if(nas.Pm.isUniqueStringInTable(resultString,table,prop)) return resultString;
	}
	return nas.uuid();
}
/**
 *	データテーブル内でユニークな値か否かを判定する
 *	@params {String} target
 *		比較対象文字列
 *	@params {Array|Object} table
 *		対照データセットが入ったテーブル配列またはオブジェクト
 *	@params {String}	prop
 *		対照データがオブジェクトであった場合のプロパティ名
 */
nas.Pm.isUniqueStringInTable = function(target,table,prop){
	var list = [];
	if (table instanceof Array){
		list = table;
	}else if(Object.keys(table).length > 0){
		for(var prp in table){
			list.push(table[prp]);
		}
	}
	if(list.length == 0) return true;
	if((prop)&&(list[0][prop])){
		if(list.findIndex(function(elm){return elm[prop]==target})>-1) return false;		
	}else{
		if(list.findIndex(function(elm){return elm==target})>-1) return false;
	}
	return true;
}
/*TEST

nas.Pm.getUniqueStringInTable(
"32TGh",3,
["1","A","B","3","D"]
);
nas.Pm.getUniqueStringInTable(
"AD",
3,
[
	{bom:"AB"},
	{bom:"AC"},
	{bom:"AD"},
	{bom:"AE"},
	{bom:"AF"},
	{bom:"AG"},
],
"bom"
);
nas.Pm.getUniqueStringInTable(
"AD",
{
	A:{bom:"AB"},
	B:{bom:"AC"},
	C:{bom:"AD"},
	D:{bom:"AE"},
	E:{bom:"AF"},
	F:{bom:"AG"},
},
"bom"
);
*/
/*
     管理データオブジェクトから識別子を作成するnas.Pmクラスメソッド
     管理データは、そのオブジェクトがpmuプロパティ(nas.Pm.PmUnit)を持っているか否かで判定
     名前を変更するか又はオブジェクトメソッドに統合
     このメソッドは同名別機能のオブジェクトメソッドが存在するので厳重注意
     クラスメソッドはURIencodingを行い、オブジェクトメソッドは部分的'%'エスケープを行う

*** 識別子のフレームレート拡張
    (括弧)でくくられた時間情報は、カット尺であり素材継続時間ではない。
    フレームレートを追加情報として補うことが可能とする
    その際は以下のルールに従う
    (FCT/FPS)
    単独のカットに対して設定されたフレームレートは、そのカットのみで有効
    基本的には、タイトルのプロパティからフレームレートを取得してそれを適用する。
    識別子には、基本的にフレームレートを含める必要性はない。

    タイトルのフレームレートと異なる場合のみ、識別子にフレームレートを埋め込む。
    (このコーディングは、pmdb実装後に行われる。2018.07.16)

引数  opt
"title"#"opus"//"s-c"("time")//"line"//"stage"//"job"//"status"
'episode'(or 'product')//'cut'//'statsu'

デフォルトでは
Xps の場合 制作管理情報が付加されたフルフォーマットの識別子が戻る ステータスはタイムシートの所属するラインのステータスのみが添付される
xMapの場合 制作管理情報を含まないカット識別子が戻る　フルサイズが指定されると 保持しているラインのすべてのステータスを記載する
pmdbの場合 タイトル識別子が戻る
stbdの場合 エピソード識別子が戻る

仕様変更でタイムスタンプを追加
タイムスタンプは必ず付加される

管理ステータスを追加
管理ステータスは、マネージャのユーザIDを使用
タイムスタンプの前方に
*/

nas.Pm.getIdentifier = function(entryData,opt,index){
    var dataType = '';
    if(entryData instanceof nas.xMap){
        dataType = 'xmap';
    }else if(entryData instanceof nas.Xps){
        dataType = 'xpst';
    }else if(entryData instanceof nas.Pm.PmDomain){
        dataType = 'pmdb';
    }else if(entryData instanceof nas.StoryBoard){
        dataType = 'stbd';
    }
    if(dataType=='pmdb'){
            var result = entryData.dataNode;
            if(entryData.timestamp) result += "."+entryData.timestamp;
            return result + ".pmdb";
    }else if(dataType=='stbd'){
            var result = [encodeURIComponent(entryData.title),encodeURIComponent(entryData.opus)].join('#');
            if(entryData.timestamp) result += "."+entryData.timestamp;
            return result + ".stbd";
    }

    if(typeof opt=='undefined') opt = 'status';
    if (!index) index = 0;
    var timestamp = 0;
    if(entryData.timestamp) timestamp = entryData.timestamp;

    var locked = (entryData.menagement)? true:false;//管理ロック状態

    var myProduct=[
        encodeURIComponent(entryData.pmu.title),
        "#"+encodeURIComponent(entryData.pmu.opus.toString('name')),
        ((String(entryData.pmu.subtitle).length > 0)? "["+encodeURIComponent(entryData.pmu.subtitle)+"]":'')
    ];
    var myIdentifier=[myProduct.join("")];
    if(entryData.pmu.inherit.length){
        var cutList=[];
        for (var cix = 0 ; cix < entryData.pmu.inherit.length ;cix ++){
            cutList.push(
                encodeURIComponent(entryData.pmu.inherit[cix].toString('full'))
            );
        }

        if(opt=='xps') {
            myIdentifier.push(cutList[index]);
        }else{
            myIdentifier.push(cutList.join('/'));
        }
    }else{
        myIdentifier.push(entryData.name);
    }
    if(dataType=='xmap'){
/*
    拡張仕様:
    ノードコレクション内の各ライン最終更新のデータを列挙して戻す
    本線のみしか存在しない場合は、従来どおりの出力を行う
 */
        var status = []
        for (var li = 0 ;li < entryData.pmu.nodeManager.lines.length ; li ++){
            var targetLine  = entryData.pmu.nodeManager.lines[li];//参照ライン
            var targetStage = targetLine.stages[targetLine.stages.length - 1];
            var targetNode  = targetStage.jobs[targetStage.jobs.length-1];
            status[li] =(encodeURIComponent(targetLine.toString(true))) +'//';
            status[li]+=(encodeURIComponent(targetStage.toString(true)))+'//';
            status[li]+=(encodeURIComponent(targetNode.toString(true))) +'//';
            status[li]+=(encodeURIComponent(targetNode.jobStatus.toString(true)));
        }
        if(status.length <= 1){
            myIdentifier.push(status[0]);
        }else{
            myIdentifier.push('['+status.join('][')+']');
        }
    }else if (dataType=='xpst'){
        myIdentifier.push([
            encodeURIComponent(entryData.line.toString(true)),
            encodeURIComponent(entryData.stage.toString(true)),
            encodeURIComponent(entryData.job.toString(true)),
            encodeURIComponent(entryData.currentStatus.toString(true))
        ].join('//'));
    };
    var order = 2;     
    switch(opt){
    case 'title':
        return myProduct[0]+'.'+dataType;break;
    case 'opus':
        return myProduct.slice(0,2).join("")+'.'+dataType;break;
    case 'episode':
        return myProduct.join("")+'.'+dataType;break;
    case 'product':
        order = 1;break;
    case 'cut':
        order = 2;break;
    case 'line':
        order = 3;break;
    case 'stage':
        order = 4;break;
    case 'job':
        order = 5;break;
    case 'status':
    case 'xps':
    case 'full':
    default:
        order = 6;break;
    }
//pmdb|stbdデータはissueを持たない　エクスポート時にエクスポート時点のpmdbを複製してともに書き出す。
//識別子をネットワークリポジトリに送信後正常に追加・更新ができた場合は（コールバックで）ローカルリストの更新を行うこと
    return myIdentifier.slice(0,order).join("//")+((locked)?'.locked':'')+((timestamp>0)?('.'+timestamp):'')+((opt=='xps')?'':('.'+dataType));
}
/**
 *   データ識別子をフランクな形状へ加工する
 *   @params {String} idf
 *   @returns {String}
 */
nas.Pm.simplifyIdf = function(idf){
	return String(idf).replace(/[#\[\]_]+/g,'_').replace(/s-c/ig,'').replace(/s([^s-]+)-c/ig,"$1-");
}
//TEST nas.Pm.simplifyIdf("ABC#123__s01-c234_s23-c245");//ABC_123_01-234_23-245
/**
 *  管理情報をパースして無名オブジェクトで返す
 *  IDと名前の分離は行わない　単純なデータチャンクで戻す
 *  書式は '.'書式 または '//' 書式 セパレータが認識できない場合は　入力値をそのまま返す
 *      '.'書式
 *  セパレーターは'.'
 *  並びは逆順(リーフtoルート)
 *  各ノードはIDまたは名前 ステータスを含まない
 *  URIエンコード不可　終端の'.'はルートを表す　ノードパス形式
 *
 *  原画:1.原画:2.(本線):1.|1:原画.2:原画.1:(本線).
 *  1.2.1.
 *  原画.原画.(本線).
 *
 *      '//'書式
 *  セパレーターは'//'
 *  並びは正順(ルートtoリーフ)
 *  各ノードはIDまたは名前 ステータスを含む可能性あり
 *  URIエンコード可
 *  @params     {String}    nodeDescription
 *      eg.
 *      1.2.1-1.
 *      1:[原画].2:原画.0:(本線).
 *      0:(本線)//2:原画//1:[原画]//fixed:kiyo@nekomataya.info:宜しくおねがいします
 *      0(本線)2原画
 *  @returns    {Object}
 *      {line:*,stage:*,job:*,status:*}
 *
 */
 
nas.Pm.parseNodeDescription = function(nodeDescription){
    if(! nodeDescription) return null;
    if(! nodeDescription.match(/\.|\/\//)) return nodeDescription;
    if(nodeDescription.match(/\.$/)){
        var dataArray = nodeDescription.split('.');
        dataArray.splice(-1);//ルートの上の不要なエントリを削除
        dataArray = dataArray.reverse();//反転
        dataArray.splice(3);//.書式はステータスを含むことができない
        dataArray = dataArray.concat(["","","",""]);//ステータス情報はないので""を追加
    }else{
        var dataArray = nodeDescription.split('//');
        if(dataArray.length > 4){
            dataArray.splice(0,(dataArray.length-4));
        }else if(dataArray.length < 4){
            dataArray = dataArray.concat(["","","",""]).slice(0,4);
        };
    };
    return {
        line    : decodeURIComponent(dataArray[0]),
        stage   : decodeURIComponent(dataArray[1]),
        job     : decodeURIComponent(dataArray[2]),
        status  : decodeURIComponent(dataArray[3])
    };
}

/*
  ドット区切りノードパス文字列をパースして、無名オブジェクトを返す
    ドット区切りノードパスは以下のような形式の文字列（主にアプリケーション内部で使用）

        [ジョブ記述].[ステージ記述].[ライン記述].

    リーフ側からルートに向かってドット区切りでノード記述を連ねる
    ルート記号として右端に'.'を置く
    記述が完全でない場合は、不足分をカレントデータ("*")で補う
    その際、ルート記述がある場合はリーフ側、ない場合はルート側からデータが補完される

    各記述は、それぞれのオブジェクト記述に準ずる
eg.
    4.2.0.              ライン0 の ステージ2 ジョブ4
    1       (1.*.*.)    カレントステージの　ジョブ1
    1.3     (1.3.*.)    カレントラインの　ステージ3 ノード1
    3.      (*.*.3.)    ライン3|ライン3のカレントステージカレントノード
    2.1.    (*.2.1.)    ライン1 の ステージ2|ライン1ステージ2のカレントノード

パスがノード以外のステージ、ラインを表す場合のアトリビュートを追加


NodeManager.prototype
*/

nas.Pm.parseNodePath = function(nodepath){
    var result={
        path:[],
        job:"",
        stage:"",
        line:"",
        spcl:0
    };
    nodepath = String(nodepath).split('.').reverse();
    if(nodepath[0]==""){
//ルート記述がある(ライン|ステージ指定の可能性がある)
        nodepath = nodepath.slice(1);
        if(nodepath.length > 3) nodepath = nodepath.slice(0,3);
//指定レベルを控えておく
        result.spcl = nodepath.length;//1:line,2:stage,3:job(=node)
        if(nodepath.length < 3) nodepath = nodepath.concat([' ',' ',' ']).slice(0,3);
//        if(nodepath.length < 3) nodepath = nodepath.concat(['*','*','*']).slice(0,3);
    }else{
//ルート記述がない
        result.spcl = 3;//必ずノード指定
        if(nodepath.length < 3) nodepath = (['*','*','*']).concat(nodepath).slice(-3);
    }
//console.log(nodepath);
    result.path  = nodepath;
    if(nodepath.length){
        result.line  = new nas.Pm.ManagementLine(nodepath[0],{nodes:[],stages:[],lines:[]});
        if(result.line.id.join('-') == '0-0'){
//コンポジットライン(コンストラクタで初期化処理はされていないのでここで処理する)
            result.line.parent.lines.composite = result.line;//コンポジットライン設定（上書き）
            var tempTrunk = new nas.Pm.ManagementLine('(tempTrunk)',result.line.parent);
            result.line.parent.lines.add(tempTrunk);//仮の本線を置く
        }else{
//通常ライン
            result.line.parent.lines.add(result.line);//仮設オブジェクトだがラインコレクションを置く
        }
    }
    if(nodepath.length >= 1){
//        result.stage = new nas.Pm.ManagementStage(nodepath[1],result.line);
        result.stage = new nas.Pm.ManagementStage(
            nodepath[1],
            new nas.Pm.ManagementLine(nodepath[0],{parent:null,nodes:[],stages:[],lines:[]})
        );
        if(result.line.parent.lines.composite){
//ライン指定がコンポジットなのでステージもコンポジットステージにする
            result.stage.parentLine.parent.lines.composite = result.stage.parentLine;
            result.stage.parentLine.parent.lines.composite.stages.add(result.stage);
            result.stage.composite = true;
        }
    }
    if(nodepath.length >= 2)
var dummyManager = {parent:null,nodes:[],stages:[],lines:[]};
//        result.job   = new nas.Pm.ManagementJob(nodepath[2],result.line.parent,result.stage);
        result.job   = new nas.Pm.ManagementJob(
            nodepath[2],
            dummyManager,
            new nas.Pm.ManagementStage(
                nodepath[1],
                new nas.Pm.ManagementLine(nodepath[0],dummyManager)
            )
        );

    return result;
}
/* TEST
var node='0:.原画.(本線):0.'
node = nas.Pm.parseNodePath(node);
console.log(node.getPath());
console.log(node.getPath('name'));
console.log(node.getPath('id'));
*/
/*
    ノードパスを比較して評価数値を返す
    一致        0
    直系の親    -1
    直系の子     1
    傍系       -2
*/
nas.Pm.compareManagementNode = function(tgt,dst){
    if(!(tgt instanceof nas.Pm.ManagementJob)) tgt=this.parseNodePath(tgt).job;
    if(!(dst instanceof nas.Pm.ManagementJob)) dst=this.parseNodePath(dst).job;
    if (tgt.getPath('id')==dst.getPath('id')) return 0;
    if (tgt.stage.parentLine.id.join() == dst.stage.parentLine.id.join()){
        if(tgt.stage.id == dst.stage.id){
            if(tgt.id>dst.id){return -1}else{return 1};
        }else if(tgt.stage.id>dst.stage.id){return -1}else{return 1}
    }else{
        return -1//直系の判断は分岐情報不足
    }
}
/*TEST
    nas.Pm.compareManagementNode('0.0.0','0.0.0.')
*/
/**
 *       データ識別子をパースして無名オブジェクトで戻す
 *       データ判定を兼ねる
 *       分割要素がカット番号を含まない（データ識別子でない）場合
 *       引数からドキュメント拡張子をのぞいたものとcutプロパティが完全に一致する
 *       このケースでtypeがxmapの場合"asExtra"フラグを立てて戻す
 *       asign/-(削除)
 *       オブジェクトメソッドの識別子も解釈可能にする-(?)
2022 05 仕様:
dataNode情報を解釈するように拡張されているので
全スペックの仕様は以下の様になる
<dataNode>//<product>//<sci>//<line>//<stage>//<job>//<status>//.<timestamp>.<file-extension>

 *      '//（二連スラッシュ）'を認識できなかったケースに限り'__（二連アンダーバー）'をセパレータとして認識するように変更
 *      兼用カット情報は、冒頭のカットナンバーを代表カットと認識する
 *      **"_(アンダーバー単独)"はセパレータ以外で使用するケースがあるため要注意
 *          特に引数全体がひとつのアンダーバーで開始する場合は、
 *          それがデータ識別子を含まないエントリである可能性が高いので予めフィルタすることを推奨
 *      storyboardデータのために無名のショットに対応
 *      データタイプを拡張　.xmap .xpst .pmdb .stbd
 *      dataNode情報にurlスキームが含まれる場合データセパレータがずれる可能性があるのでこれを検出・エスケープする
 *      dataNode情報にlocalStorageprefixが含まれる場合を考慮
 *     （serverアドレスの一部として解釈する様に）
 *    データユニークキーの抽出条件
 *    pmdb|stbd	キー値から.<timestamp>を除いた値
 *    xmap		キー値から//<SCI>-<timestamp>を除いた値
 *    xpst		キー値から.<timestamp>を除いた値
 *   がタイトル|エピソードパートを含まない場合を判別して空情報で補う機能を増設
 *   第二引数に参照オブジェクトを渡して参照オブジェクトの情報で既存情報の上書きを行う機能を増設
 *
 *  @params {String} dataIdentifier
 *          データ
 *  @params {Object} template
 *          title,opusプロパティを持った参照オブジェクト
 *  @params {Object} parent
 *          参照するpmdbを持つオブジェクト
 *
 *  @returns    {Object}
 *      戻りデータのプロパティは以下
    .type       :{string}   データ型 xpst|xmap|pmdb|stbd
    .mLocked    :{Boolean}  管理ロック状態
    .timestamp  :{Number}   timestamp Int
    .dataNode   :{Object}   serverURL+repositoryIdf
    .product    :{Object}   title,opus,subtitle
    .sci        :{Array}    カット inherit
    .inherit    :.sci       alias of sci
    .nodes      :{Array}    Array of mNode
            
    .mNode      :{Object}   {line:*,stage:*,job:*,status:*} マネジメントノード
    .title      :{Object|String}
    .subtitle   :{String}
    .scene      :{String}
    .cut        :{String}   代表カット
    .time       :{String}   代表カットのカット尺
    .line       :{String}
    .stage      :{String}
    .job        :{String}
    .status     :{String}

    .asExtra    :{Boolean}  エクストラアセットに対するフラグ
    .uniqekey   :{String}   データごとの識別キー

特例処理 xps判定のデータに関してのみ、兼用情報にタイムシート識別キーワード(/xpst?|xdts|tdts|dope|sheet|st|sht/)が含まれる場合
そこで兼用を切り上げ ユニークキーを切り詰める

事前に引数を判定して、不要情報を別線でパースするのが望ましい parseSCiに対して実装する?
 */
nas.Pm.parseIdentifier = function(dataIdentifier,template,parent){
    if(! dataIdentifier) return false;
    if((! parent)||(typeof parent.pmdb == 'undefined')) parent = nas;
    dataIdentifier = nas.Pm.normalizeIdf(dataIdentifier);
console.log(dataIdentifier);
//正規化した識別子からよくある補助情報を分離削除
    var asXps = nas.Pm.parseXpstIdf(dataIdentifier);
    if(asXps.check){
        dataIdentifier = asXps.dataIdentifier;
    };
    var uniquekey        = dataIdentifier;
    var typeString       = ''        ;
    var managementLocked = false     ;
    var timestamp        = undefined ;
//拡張子型typeString(4文字固定)分離
    if(dataIdentifier.match(/^(.*)\.(....)$/)){
        typeString     = RegExp.$2;
        dataIdentifier = RegExp.$1;
    };
//タイムスタンプ分離
    if(dataIdentifier.match(/^(.*)\.(\d+)$/)) {
        timestamp      = parseInt(RegExp.$2);
        dataIdentifier = RegExp.$1;
        uniquekey      = dataIdentifier;
        if(typeString) uniquekey += '.'+typeString;
    };
//'.'を伴う何らかの先行記述があった場合管理ロック状態とみなして分離
    if(dataIdentifier.match(/^(.*)\.(.*)$/)) {
        managementLocked = true;
        dataIdentifier = RegExp.$1;
        uniquekey      = dataIdentifier;
        if(typeString) uniquekey += '.'+typeString;
    }
    if(! typeString) typeString = 'xpst';
//分離済識別子 予備整形
    if(dataIdentifier.indexOf('//')< 0 ) dataIdentifier=dataIdentifier.replace(/__/g,'//');
    dataIdentifier = dataIdentifier.replace(/:\/\//g,"%3A%2F%2F");//URLスキームの'://'をエンコード

//フィールド分解
    var dataArray = dataIdentifier.split('//');
    if((typeString == 'xpst')||(typeString == 'xmap')){
        var title = "";//"(名称未設定)";//空文字列に変更
        var opus  = "";//"**";//空文字列に変更 5/30
        if(dataArray[0].indexOf('#') < 0) dataArray = ([title+"#"+opus]).concat(dataArray);
        if(template){
            if(template.title) title = template.title;
            if(template.opus)  opus = template.opus;
            dataArray[0] = title+"#"+opus ;
        }
    }
    var dataNodeString = '';
    if(typeString == 'pmdb'){
        dataNodeString = dataArray.splice(0,1)[0];//pmdbエントリからデータノード部分をスライス
    }
    var result={
        type     : typeString,
        asExtra  : false,
        mLocked  : managementLocked,
        dataNode : nas.Pm.parseDataNode(dataNodeString),//無名オブジェクト
        product  : nas.Pm.parseProduct(dataArray[0]),//無名オブジェクト
        sci      : nas.Pm.parseSCi(dataArray[1],dataArray[0]),//nas.Pm.SCiオブジェクトの配列
    };
//    result.type     = typeString;
//    result.mLocked  = managementLocked;

    if(timestamp) result.timestamp = timestamp;
//    result.dataNode = nas.Pm.parseDataNode(dataNodeString);//無名オブジェクト
//    result.product  = nas.Pm.parseProduct(dataArray[0]);//無名オブジェクト
//    result.sci      = nas.Pm.parseSCi(dataArray[1]);//nas.Pm.SCiオブジェクトの配列
    result.inherit    = result.sci;//alias
    result.server     = result.dataNode.server;
    result.repository = result.dataNode.repository;
    result.title      = parent.pmdb.workTitles.entry(result.product.title,'local');
    if(! result.title) result.title = result.product.title;//Object|Srtring
    result.opus       = parent.pmdb.products.entry(result.product.opus,'local');
    if(! result.opus) result.opus = result.product.opus;//Object|Srtring
    result.subtitle   = (result.opus.subtitle)?result.opus.subtitle:result.product.subtitle ;//string

    if(result.sci.length){
    var names = nas.Pm.parseCutIF(result.sci[0].name);//get Array [cutNo,sceneNo]|[cutNo]|[]
        result.scene    = (names.length > 1)? names[1]:'';
        result.cut      = (names.length > 0)? names[0]:'';
        result.time     = result.sci[0].time;
    }else{
        result.scene    = '';
        result.cut      = '';
        result.time     = '';
    }
//複数マネジメントノードに対応 複数ノードの記述は//[0:(本線).]//
    if(dataArray.length >= 6){
        result.nodes = [];
        if(dataArray[2].indexOf('[')==0){
            var nodeDescriptions = dataArray.slice(2).join( "//" ).replace(/^\[|\]$/g,"").split('][');
        }else{
            var nodeDescriptions = [dataArray.slice(2,6).join('//')];
        }
        for (var n = 0 ; n < nodeDescriptions.length ; n ++){
            result.nodes.push(nas.Pm.parseNodeDescription(nodeDescriptions[n]));
        }
        result.mNode    = result.nodes[0];
        result.line     = new nas.Pm.ManagementLine(result.mNode.line,{lines:[],stages:[],nodes:[]});
        result.stage    = new nas.Pm.ManagementStage(result.mNode.stage,result.line);
        result.job      = new nas.Pm.ManagementJob(result.mNode.job,null,result.stage,result.line.parent,result.mNode.status);
        result.status   = new nas.Pm.NodeStatus(result.mNode.status);
    }
//    if(typeString != 'xpst'){    };
    result.uniquekey = uniquekey;
    if((result.type == 'xmap')&&(result.cut == uniquekey)){
//        result.cut     = '_EXTRA_';//cutに与える文字列は変更なし
        result.asExtra = true;
    };
    return result;
}
/** test 
console.log(nas.Pm.parseIdentifier('%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97//s-c10(72)//0%3A(%E6%9C%AC%E7%B7%9A)//0%3Alayout//0%3Ainit//Startup.'));

nas.Pm.parseIdentifier(nas.Pm.getIdentifier(xUI.XMAP));

nas.Pm.parseIdentifier(' (3+6)');


*/
/* 一時仮設メソッド
識別子交換用のJSONテキストに変換
交換用のJSONを整備して入出力に対応したクラスオブジェクトを作成
*/
nas.Pm.parseIdentifierJSON = function(idf,template){
    var tgt = nas.Pm.parseIdentifier(idf,template);
    var result = {
        uniquekey   :   tgt.uniquekey,

        mLocked     :   tgt.mLocked,
        dataNode    :   tgt.dataNode,

        timestamp   :   tgt.timestamp,
        type        :   tgt.type,

        product     :   tgt.product,
        inherit     :   tgt.inherit,
        mNode       :   tgt.mNode,
        nodes       :   tgt.nodes
    }
    return JSON.stringify(result,undefined,2);
}
/**
 *	識別子を分解してチェックする
 *	@params {String}   idf
 *	@returns {Object|false}
 *	parseIdentifierのラッパ関数でもあるので、チェックとパースを同時に処理可能
 *	チェックを抜けた識別子はパースデータを返す
 */
nas.Pm.checkIdentifier = function(idf){
	var idfInfo = nas.Pm.parseIdentifier(idf);
	var rejectRegex = new RegExp("\\(.*\\)|\\*+");
	if(idfInfo){
		if(
			(idfInfo.product.title.match(rejectRegex))||
			(idfInfo.product.opus.match(rejectRegex))||
			(idfInfo.product.subtitle.match(rejectRegex))||
			(idfInfo.sci[0].scene.match(rejectRegex))||
			(idfInfo.sci[0].cut.match(rejectRegex))
		){
			return false;
		}else{
			return idfInfo;
		}
	}
	return false;
}
/**
 *    識別子比較関数
 *    一致推測は未実装
 *  @params {String}    target
 *      比較識別子
 *  @params {String}    destination
 *      比較対象識別子
 *  @params {Boolean}   compareType
 *      タイプ比較を行い同タイプ以外を不一致とする デフォルト true
 *  @params {Boolean}   compareNode
 *      ノード比較を行い同ノード以外を不一致とする　pmdbの際は常にON 
 *  @returns    {Number}
 *    戻値:数値
 *               -4   :no match
 *               -3   :server match
 *               -2   :dataNode(repository) match
 *               -1   :title match
 *                0   :product match
 *                1   :product + cut match
 *                2   :line match
 *                3   :stage match
 *                4   :job match
 *                5   :status content match
 *                6   :status assign match
 *                7   :status clientIdf match
 *
 *  ステータス情報のうちassign/messageの比較は行わない
 *  ステータス自体の比較もほぼ利用されないので省略を検討
 *  追加実装:type比較:dataTypeがxmapであった場合は兼用カットの包括を一致と判定する
 *      
 *  上記実装により障害発生 type不一致を不一致とするタイプ比較オプション引数を追加   デフォルト値は比較ありに変更
 *
 *  追加実装　識別子に
 *      タイトルの上位ドメインとして　データノード　（サービスURL:リポジトリ）
 *      ステータスのプロパティとしてクライアントID
 *　これらに伴い戻り値が拡張される
 *      タイプのオプションとしてタイムスタンプが実装されたがここではタイムスタンプの比較は行わない
 */
nas.Pm.compareIdentifier =function (target,destination,compareType,compareNode){
    if(typeof compareType == 'undefined') compareType = true;
    if(typeof compareNode == 'undefined') compareNode = true;
    var tgtInfo  = nas.Pm.parseIdentifier(target);
    var destInfo = nas.Pm.parseIdentifier(destination);
    //type
        if((compareType)&&(tgtInfo.type!=destInfo.type)){
            return -4;
        }
    //type-set
//        if((tgtInfo.type == xmap)||(tgtInfo.type == xpst))
//            compareNode = false;
    //server
        if((compareNode)&&(tgtInfo.server!=destInfo.server)){
            return -4;
        }
    //repository
        if((compareNode)&&(tgtInfo.repository!=destInfo.repository)){
            return -3;
        }
    //title
        if(tgtInfo.title instanceof nas.Pm.WorkTitle){
            if(! tgtInfo.title.sameAs(destInfo.title)) return -2;
        }else if(String(tgtInfo.title)!= String(destInfo.title)){
            return -2;
        }
    //title+opus
        if(tgtInfo.opus.sameAs){
            if(! tgtInfo.opus.sameAs(destInfo.opus) ) { return -1 }
        }else if(String(tgtInfo.opus)!= String(destInfo.opus)){
            return -1
        }
    //Scene,Cut
        var result = 0;
        if((tgtInfo.type=='xmap')||(destInfo.type=='xmap')){
            for(var tix=0;tix<tgtInfo.sci.length;tix++){
                for(var dix=0;dix<destInfo.sci.length;dix++){
                    if(nas.Pm.compareCutIdf(tgtInfo.sci[tix].name,destInfo.sci[dix].name) == 0){
                        result = 1; break ;
                    }
                }
                if(result > 0) break;
            }
            if(result == 0) return result;
        }else{
            var tgtSC = tgtInfo.cut;
            var dstSC = destInfo.cut;
            if((! tgtSC)||(! dstSC)) return result;
            if(nas.Pm.compareCutIdf(tgtSC,dstSC) != 0) return result;
            result = 1;
        }
    //version status
        if (((tgtInfo.line)&&(destInfo.line))&&(tgtInfo.line.id.join() == destInfo.line.id.join() )){
            result = 2;}else{return result;}
        if (((tgtInfo.stage)&&(destInfo.stage))&&(tgtInfo.stage.id == destInfo.stage.id )){
            result = 3;}else{return result;}
        if (((tgtInfo.job)&&(destInfo.job))&&(tgtInfo.job.id  == destInfo.job.id )){
            result = 4;}else{return result;}
//console.log(destInfo)
        if ((tgtInfo.status.content == destInfo.status.content)) result = 5;
        if ((tgtInfo.status.assign != null)&&(tgtInfo.status.assign == destInfo.status.assign)) result = 6;
        if ((tgtInfo.status.clientIdf == destInfo.status.clientIdf)) result = 7;
        return result;
}
/*  TEST
var A =[
    "うなぎ",0,"ニョロ",
    "","12","2+0",
    "0:(本線)","1:原画","2:演出チェック","Startup:kiyo@nekomataya.info:TEST"
    ];
var B =[
    "うなぎ",0,"ニョロ",
    "","12","2+0",
    "0:(本線)","1:原画","2:演出チェック","Startup"
    ];
nas.Pm.compareIdentifier("35%E5%B0%8F%E9%9A%8A_PC#RBE//04d",'35%E5%B0%8F%E9%9A%8A_PC#RBE[ベルセルク・エンチャント演出]')
//console.log(nas.Pm.compareIdentifier(nas.Pm.stringifyIdf(A),nas.Pm.stringifyIdf(B)))
*/
/**
 *	@params {String}	idf
 *	@returns {String}
 *	アニメーション識別子に利用される文字列のうちURI文字列の予約文字に相当する文字を部分的にURIエンコードする関数
 *	#+= 及びURIエンコードされていない%
 *	リザルト文字列は decodeURIComoponetでデコードが可能
 */
nas.Pm.encodeIdf = function encodeIdf(idf){
//URIエンコード文字列が含まれていた場合は無条件で解除
	if(idf.match(/\%[0-9a-fA-F]{2}/))
		idf = decodeURIComponent(idf);
	idf = idf.replace(/\%/g,"%25");
	idf = idf.replace(/\#/g,"%23");
	idf = idf.replace(/\=/g,"%3D");
	idf = idf.replace(/\+/g,"%2B");
	return idf;
}
/*TEST
    nas.Pm.encodeIdf('ABC#01__s-c123_125__A4_200%++');

*/
/**
 *	@params {String}	idf
 *	@returns {String}
 *
 *	データ識別子をノーマライズして返す
 *	現状一般的な
 *	ABC_00_000{_000}*
 *	ABC00_000_000{_000}
 *	のような識別子は、プリプロセッサを通して正規化する
 *
 *	記述ミスによりダブルアンダーバーが失われた以下のような記述は、推測でアンダーバーを補う
 *
 *	ABC#00_000{_000}*
 *	ABC#00_000_000{_000}
 *
 *  %URIエンコードはデコードされる
 *  整形済みと思われる識別子は処理スキップして戻す
 *  識別子末尾のデータタイプトークンは削除？ ＞パーサで判別
 */
nas.Pm.normalizeIdf = function normalizeIdf(idf){
	if(!idf) return '';
	if(idf.match(/\%[0-9A-Fa-f]{2}/)) idf = decodeURIComponent(idf);
	idf = nas.normalizeStr(String(idf));
	idf = idf.replace(/\s+/g,'_');//空白をアンダースコア
	if(idf.match(/^([^0-9\#]+)\#([^\_]+)\_{2}(.+)$/)) return idf;
	idf = idf.replace(/\_+/g,'_');//連続アンダースコアをひとつに
	if(
		(idf.match(/^([^\_\#]+)\_([0-9]+[^\_]*)\_(.+)$/))||
		(idf.match(/^([^0-9\#]+)([0-9]+[^\_]*)\_(.+)$/))
	){
		idf = [RegExp.$1,'#',RegExp.$2,'__s-c',RegExp.$3].join('');
	};
	if(
		(idf.match(/^[^\_]+\_[0-9]+[^\_]*(\_[^\_]+)+$/))||
		(idf.match(/^[^0-9]+[0-9]+[^\_]*(\_[^\_]+)+$/))
	){
		idf = idf.replace(/\_/,'__');//初出の'_'を'__'に置換
	};
	return(idf);
}
/*TEST
var idf = 'ABC_01_234_456';
conasole.log(nas.Pm.normalizeIdf(idf));
 */
/**
    識別子をパースする関数
    SCiオブジェクトで戻す？
    Identifier の持ちうる情報は以下

    title
        .name
    opus
        .name
        .subtitle
    [sci]
        .name
        .time
    
    [issues]
        Line
            .id
            .name
        Stage
            .id
            .name
        Job
            .id
            .name
    status
        JobStatus
            .content
            .assign
            .message
*/
/**
 *   プロダクト識別子をパースして無名オブジェクトで返す
 *   サブタイトルは一致比較時に比較対象から外す
 *   引数または第一要素がカラの場合はfalse
 *  @params     {String}    productString
 *  @returns    {Object}
 *  @example
 *  nas.Pm.parseProduct("うらしまたろう#01[亀]");
 */
nas.Pm.parseProduct = function(productString){
console.log(productString);

    var dataArray = String(productString).replace( /[\[\]]/g ,'#').split('#');
console.log(dataArray);
    var result = {
        title     :   (typeof dataArray[0] == 'undefined')? '':decodeURIComponent(dataArray[0]),
        opus      :   (typeof dataArray[1] == 'undefined')? '':decodeURIComponent(dataArray[1]),
        subtitle  :   (typeof dataArray[2] == 'undefined')? '':decodeURIComponent(dataArray[2])
    };
//console.log(typeof dataArray[2]);
/* DB内にエントリがある場合のみproductを
    if( nas.pmdb.workTitles.entry(result.title)&&
        (nas.pmdb.workTitles.entry(result.title).products.entry(result.opus))
    ) result.product = nas.pmdb.workTitles.entry(result.title).products.entry(result.opus);// */
    return result;
}
/** test
//if(dbg) console.log (nas.Pm.parseProduct('%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB%E6%9C%AA%E5%AE%9A#%E7%AC%AC%20%20%E8%A9%B1'));
*/
/*
 * 引数末尾にタイムシート識別記号が入っている場合、これを削除し他文字列を返す
 *    オプションで　識別の成否とページ数を返す
 * dataIdentifier.replace(/[_\-\s](sheet|xps|xpst|dope|ts|st|sht)([_\-\s]*\d*)$/i),'')
 *
 */
nas.Pm.parseXpstIdf = function(dataIdentifier){
    var result = {
        check:false,
        dataIdentifier:dataIdentifier,
        pageNumber:null
    };
    if(dataIdentifier.match(/[_\-\s](sheet|xps|xpst|dope|ts|st|sht)([_\-\s]*\d*)$/i)){
        var pgS = RegExp.$2;
        result.check = true;
        result.pageNumber = (String(pgS).length > 0)? nas.parseNumber(pgS):1;
        if(isNaN(result.pageNumber)) result.pageNumber = 1;
        result.dataIdentifier = dataIdentifier.replace(/[_\-\s](sheet|xps|xpst|dope|ts|st|sht)([_\-\s]*\d*)$/i,'');
    }
    return result;
}
/*TEST
    nas.Pm.parseXpstIdf('ABC#01__s-c123_234_xps-2').dataIdentifier;// "ABC#01__s-c123_234"
    nas.Pm.parseXpstIdf('BOM_12_123_456_sheet').dataIdentifier;// "BOM_12_123_456"
*/
/**
 *    sci識別子をパースして nas.Pm.SCi オブジェクトの配列で返す
 *    兼用エントリのセパレータは / [\|\/\,\_\s*] / 時間記述のカッコ内のセパレータは考慮されない
 *    識別子に付属する時間情報はトランジション／継続時間ではなくカット尺のみ
 *    補助情報は持たせない。かつ対比時に比較対象とならないものとする
 *    カット番号情報は、ここではscene-cutの分離を行わない
 *    比較の必要がある場合に始めて比較を行う方針でコーディングする
 *    sciString末尾の（括弧内）は時間情報部分
 *    (括弧)による記述が2つ以上ある場合は最初の開き括弧の前がカット識別子で、時間情報はその直後の（括弧）内の情報を用いる
 *    更に後続の（括弧）記述は出現順にtrin/troutの情報として扱う
 *      フルフォーマットでは以下のような表現となる
 *      123/240
 *      123,240
 *      123|240
 *      123 240
 *      123_240
 *      s-c123(1+12)(0,trin)(18,trout)/s4-c18(13+12)(wipe(1+12))(OL(2+0))
 *      
 *    カッコ内の時間書式は(TC//framareteString) or (TC) フレームレートの指定のない場合はデフォルトの値で補われる
 *    (1+12),(1+12//24FPS),(1:12//30),(01:12//30DF),(00:00:01:12//59.94) 等
 *    デフォルト値は、タイトルから取得
 *    sciStringに時間情報が含まれないケースあり
 *    time指定の存在しない識別子の場合''を補う
 *
 *    引数が与えられない場合は引数を''とみなす
 *      その場合の戻り値は空配列
 *      名前が空となる要素はスキップ（無名要素は認められない）
 *      特例で引数が'('で始まる場合のみ無名のSCiを返す
 *  @params     {String}    sciDescription
 *  @returns    {Array}
 *      array of {Object SCi}
 *      
 */
nas.Pm.parseSCi = function(sciDescription,productString){
    if((typeof sciDescription == 'undefined')||(sciDescription == '')) return [];
    if(sciDescription.match( /^\([^\)]+\)/ )) sciDescription = 's-c'+sciDescription;//例外処理
// 兼用を分離 /[\,\/\|\_\s]+/ 1つ以上の連続セパレータ
    var dataArray = [];
    var entry = "";var parOpn = 0;
    for (var c = 0 ; c < sciDescription.length ; c++){
        if (sciDescription.charAt(c) == "(") parOpn ++;
        if (sciDescription.charAt(c) == ")") parOpn --;
        if (
            (parOpn <= 0)&&
            (sciDescription.charAt(c).match(/[\,\/\|\_\s]/))
        ){
            if(entry.length > 0){
                dataArray.push(entry);entry = "";
            };
            continue;
        }else{
            entry += sciDescription.charAt(c);
        };
    };
    if(entry.length > 0) dataArray.push(entry);
    var result = [];
    for (var ix=0;ix < dataArray.length ;ix ++){
        var currentDsc = (dataArray[ix].replace(/\)\(/g,'),_,(')).split(',_,');
        if(currentDsc[0].match(/^([^\(]+)\(([^\)]+)\)/)) {
            var cName = RegExp.$1;
            var cTime = RegExp.$2;
        }else{
            var cName = currentDsc[0];
            var cTime = '';
        }
        var cTrin  = '';
        var cTrout = '';
        if(currentDsc.length > 1) cTrin  = currentDsc[1].trim().replace(/(^\(|\)$)/g,'');
        if(currentDsc.length > 2) cTrout = currentDsc[2].trim().replace(/(^\(|\)$)/g,'');
// SCi(cutName,cutProduct,cutTime,cutTRin,cutTRout,cutRate,cutFrate,cutId)
        result.add(
            new nas.Pm.SCi(
                decodeURIComponent(cName),
                productString,
                decodeURIComponent(cTime),
                decodeURIComponent(cTrin,'in'),
                decodeURIComponent(cTrout,'out')
            ),
            function(tgt,dst){ return (nas.Pm.compareCutIdf(tgt.name,dst.name) == 0); }
        );
    }
    return result;
}
/** test
    console.log (nas.Pm.parseSCi('s-cC%23%20(72)/s-c96(133,30)'));
    console.log (nas.Pm.parseSCi('s-cC%23%20(16)/s-c96(144//24)'));
    console.log (nas.Pm.parseSCi('s-cC%23%20(16)(18)'));
    console.log (nas.Pm.parseSCi('scC%23%20(16)(18)'));
*/
/**
セル記述を整形して比較評価用に正規化された文字列を返すクラスメソッド
戻り値は、<グループ名>-<セル番号>[-<ポストフィックス>]

A_(001)_ovl  A-1-ovl
*/
nas.Pm.normalizeCell = function(myString){
    return nas.normalizeStr(myString.replace( /[-_ー＿\s]/g ,"-")).replace( /([^\d.])0+/g ,"$1");
}
//test
//nas.Pm.normalizeCell("A_００１２ー上");
//nas.Pm.normalizeCell("");
//nas.Pm.normalizeCell("");
//nas.Pm.normalizeCell("");
//nas.Pm.normalizeCell("");
//nas.Pm.normalizeCell("");
//nas.Pm.normalizeCell("");
/*
作品ごとのカット番号付ルールが問題になる

s#@@@-c#$$$

カット番号をユニークにする(通し番号)
	$$$部分のみで識別できるようにする。$$$部分のかぶり番号は禁止　＠＠＠部分を比較に使わない
	
シーン番号を使う（表示するか否かのフラグ）
	@@@

どこのフラグを使うか？

pmdb.
ルートに接待


カット番号比較機能に拡張が必要？
	順位比較は現在の比較でOK
	同位比較条件も同じ
2-23 == 02-023	
1-12 < 2-12
2-13
	shotNumberUnique下で、同番判定の際に問題が出る
	1-12 == 2-12　となるので　先の判定に加えることが必要

storyBoar.entry　等に　shotNumberUniqueを反映させる（検索系）

カット識別子（いわゆるカット番号）CutIF を定義

カット識別子は、一連の映像内でカットに与えられるユニークな名称で、カットを識別する役目を与えられる
自由な文字列で設定して良い。
名前が空白文字の場合システムで設定したユニークなID以外でのアクセスが制限される

ユーザの間隔に一致させるため一定のゆらぎを許容する
通常のプログラムでは異なる名称として認識される以下の文字は識別子としては同じものであると判断される

1,１,01,０００１	⇒　すべて　いわゆる「カット1」


カット識別子は慣習的に、シーン番号とショット番号の二部分に分けて解釈される

	s#<XX>-c#<YY>

<XX>	シーン番号
<YY>	ショット（カット）番号

カット識別子の命名ルールを以下の２変数で定義する

	ShotNumberUnique
ショット番号を重複禁止にする
このチェックがオフの場合、シーン,ショットの組み合わせでユニークであれば良い
シーン番号管理を行う場合はオフにする

	SceneUse
シーン番号を使用するか否か
データ内部でのシーン分けに関わらずシーン番号を使用・表示しないモード
データ並べ替えの際にも考慮されない
シーン番号管理を行う場合はオンにする

ShotNumberUnique	SceneUser	eg.

true	true	1-1	2-2	2-3	3-4 ...*
false	true	1-1	2-1	2-2	3-1 ...
true	false	1	2	3	4	...*
false	false	1	1	1	1	...*
*/
/**
 *  @params {String}  cutIdentifier
 *  @returns {Array}
 *  SCiデータ上のカット名をセパレータで分離するクラスメソッド
 *  この場合のカット名には時間情報・ステータス等を含まないものとする
 *  先行プロダクト情報は排除される
 *  パースされたカット名は、カット、シーンの順の配列で戻す最大２要素
 *
 *    [cut,scene];//第三要素以降は分離しても使用されないことに注意
 *    [cut]
 *    []
 *
 *  要素数が識別子に含まれる情報の深度を示す**
 */
nas.Pm.parseCutIF = function(cutIdentifier){
    if(!cutIdentifier) return [];
//プロダクト情報があればカット
    if(cutIdentifier.match(/^.*(\/\/|__)/)) cutIdentifier = cutIdentifier.replace(/^.*(\/\/|__)/,'');
//時間情報を削除
    if(cutIdentifier.match(/\([^\(\)]+\)$/)) cutIdentifier = cutIdentifier.replace(/\([^\(\)]+\)$/,'');
//全体でシーン記述のみしかない場合にセパレータを追加して空のカット番号を与える
    if(cutIdentifier.match(/^s#?[^c\ _\-]+$/i)) cutIdentifier+='_';
//第一セパレータで分解して倒置
    cutIdentifier = String(cutIdentifier).trim().replace(/[\ _\-]+/,"%_%");
//    cutIdentifier.indexOf('_')
    var result = cutIdentifier.split("%_%").reverse();
    for (var ix=0;ix<result.length;ix++){
        if(ix==0){result[ix]=result[ix].replace(/^[CcＣｃ]/,"");};//cut
        if(ix==1){result[ix]=result[ix].replace(/^[SsＳｓ]/,"");};//scene
        result[ix]=result[ix].replace(/^[#＃№]|^(No.)/,"");//ナンバーサインを削除
    };
    return result;
}
/*test
 console.log(nas.Pm.parseCutIF("00123#31[124]__s-c123"));
 console.log(nas.Pm.parseCutIF("s-cC# "));
 console.log(nas.Pm.parseCutIF("00123#31[124]__s-c123"));
 console.log(nas.Pm.parseCutIF("ABCDE#26[9999]//s-c123-125(12+12)"));

*/
/**
 *  エンコード済みのカット記述子を比較してマッチ情報を返す
 *  ソート時の判定関数を兼ねるようにリターンを数値に変更 2019 06 20
 *  シーンカットともに一致した場合のみ 0 それ以外は -1|+1で順位情報を返す
 *  引数に秒表記部が含まれないよう調整が必要
 *
 *  @params     {String}   tgt
 *     比較元カット記述子
 *  @params     {String}   dst
 *     比較先カット記述子
 *  @returns    {Number}
 *       -1 比較元下位（前方)
 *       0  一致
 *       +1 比較元上位（後方)
 */
nas.Pm.compareCutIdf = function(tgt,dst){
//console.log(tgt,dst);
//引数がSC|PmUnitオブジェクトであった場合評価値をパース済みの値と入れ替える
	if(tgt instanceof nas.Pm.SCi) tgt = tgt.name;
	if(dst instanceof nas.Pm.SCi) dst = dst.name;
	if(tgt instanceof nas.Pm.PmUnit) tgt = tgt.inherit[0].name;
	if(dst instanceof nas.Pm.PmUnit) dst = dst.inherit[0].name;
//評価値に時間表記が含まれる場合パースして分離
    if(tgt.match(/\(.+\)/)){tgt = nas.Pm.parseSCi(tgt)[0].name};
    if(dst.match(/\(.+\)/)){dst = nas.Pm.parseSCi(dst)[0].name};
//必ず２要素以下の配列が戻るように変更されたので不足時に空文字列要素を追加 2020-12
    var tgtArray = nas.Pm.parseCutIF(tgt);
    if(tgtArray.length < 2) tgtArray = tgtArray.concat(["",""]);
    var dstArray = nas.Pm.parseCutIF(dst);
    if(dstArray.length < 2) dstArray = dstArray.concat(["",""]);
    tgtArray[0]=nas.RZf(nas.normalizeStr(tgtArray[0]),12);
    tgtArray[1]=nas.RZf(nas.normalizeStr(tgtArray[1]),12);
    dstArray[0]=nas.RZf(nas.normalizeStr(dstArray[0]),12);
    dstArray[1]=nas.RZf(nas.normalizeStr(dstArray[1]),12);

//シーン記述なしは記述のあるものと一致しない
    if ((tgtArray[1]==dstArray[1])||(nas.ShotNumberUnique)||(!(nas.SceneUse))){
        if(tgtArray[0]==dstArray[0]){
            return 0 ;//return 0;//一致
        }else{
            return (tgtArray[0] < dstArray[0])? -1:1;
        }
    }
    return (tgtArray[1] < dstArray[1])? -1:1;
}
/*TEST
nas.Pm.compareCutIdf("C12","s-c012");//-1
nas.Pm.compareCutIdf("0012","title_opus_s-c012");
nas.Pm.compareCutIdf("C００１２","s-c012");
nas.Pm.compareCutIdf("S#1-32","s01-c0３２");

["s-c12(32)","s-c14","s2-c11","s1-c#23","s#0-C#67(2+12)","s-c10(00:00:02:20)","123"].sort(nas.Pm.compareCutIdf);
*/

/**
 *    配列指定で識別子をビルドするテスト用関数
 *  @params {Array} myData
 *  [
        title,
        opus,
        subtitle,
        scene,
        cut,
        time,
        line,
        stage,
        job,
        status
    ];
 * このテスト関数は完全な識別子を生成するが、複数カット複数ラインを含む識別子には対応していない
 * またデータノード及びタイムスタンプデータタイプに関しても未対応 20200906
 テスト用機能を残しつつIdf再構築のためのツールとして整備
  パーサのリザルトを解釈してIdfを再構築して返す
 */
nas.Pm.stringifyIdf = function(myData){
//myDataはlength>3の配列であること
//この識別子作成は実験コードです2016.11.14
  if(myData instanceof Array){
    var myIdentifier=[
            encodeURIComponent(String(myData[0]))+
        "#"+encodeURIComponent(String(myData[1]))+
        (
            (
                (String(myData[2]).length == 0)||
                (typeof myData[2] == 'undefined')
            )? "":"["+encodeURIComponent(myData[2])+"]"
        )];
        if(myData.length > 3){
            myIdentifier.push(
                encodeURIComponent(
                    "s" + ((myData[3])? myData[3] : "" )+'-'+
                    "c" + ((myData[4])? myData[4] :'00')
                ) +
                ((myData[5])? "(" + myData[5] +")": "" )
            ) 
        }
        if((myData.length > 6)&&(typeof myData[6] != 'undefined')){
            myIdentifier.push(encodeURIComponent(myData[6]));
            if((myData.length > 7)&&(typeof myData[7] != 'undefined')){
                myIdentifier.push(encodeURIComponent(myData[7]));
                if((myData.length > 8)&&(typeof myData[8] != 'undefined')){
                    myIdentifier.push(encodeURIComponent(myData[8]));
                    if((myData.length > 9)&&(typeof myData[9] != 'undefined')){
                        myIdentifier.push(encodeURIComponent(myData[9]));
                        if(myData.length > 10)
                        myIdentifier = myIdentifier.concat(myData.slice(9));
                }
            }
        }
    }
  }else if((myData) && (myData.sci)){
    var myIdentifier=[
        encodeURIComponent(String(myData.product.title))+
        "#"+encodeURIComponent(String(myData.product.opus))+(
            (
                (String(myData.product.subtitle).length == 0)||
                (typeof myData.product.subtitle == 'undefined')
            )? "":"["+encodeURIComponent(myData.product.subtitle)+"]"
    )];
    if(myData.sci.length == 1){
            myIdentifier.push(
                encodeURIComponent(
                    "s" + ((myData.scene)? myData.scene : "" )+'-'+
                    "c" + ((myData.cut)? myData.cut :'00')
                ) +
                ((myData.time)? "(" + myData.time +")": "" )
            );
        }else{
            var inherit = [];
            for(var cix = 0 ; cix < myData.sci.length ; cix ++){
            inherit.push(
                myData.sci[cix].cut + ((myData.sci[cix].time)? "(" + myData.sci[cix].time +")": "" ));
            };
            myIdentifier.push(inherit.join('_'))
        };
        if((myData.nodes)&&(myData.nodes.length)){
            var mNodes = [];
            for(var nix = 0 ;nix < myData.nodes.length ; nix++){
                mNodes.push([
                    encodeURIComponent(myData.nodes[nix].line),
                    encodeURIComponent(myData.nodes[nix].stage),
                    encodeURIComponent(myData.nodes[nix].job),
                    encodeURIComponent(myData.nodes[nix].status)
                ].join('//'));
            }
            if(myData.nodes.length == 1){
                myIdentifier.push(mNodes[0]);
            }else{
                myIdentifier.push('['+mNodes.join(']/[')+']');
            };
        };
  };
    return myIdentifier.join("//");
}
//TEST
/*
var X = nas.Pm.stringifyIdf([
    "たぬき",
    "12",
    "ポンポコリン",
    "",
    123,
    "1+12",
    "0:(本線)",
    "1:原画",
    "2:[演出チェック]",
    "Startup:kiyo@nekomataya.info"
]);

nas.Pm.parseIdentifier(X);
*/


/**
 *<pre>
 *  @constractor
 *   PmDomain オブジェクトは、制作管理上の基礎データを保持するキャリアオブジェクト
 *   制作管理ディレクトリノード毎に保持される。
 *   基礎データを必要とするプログラムに基礎データをサービスする
 *   基本データが未登録の場合は親オブジェクトの同データを参照してサービスを行う
 *　@params {Object Repositry|Title|Episode|others} myParent
 *   リポジトリ（共有）、プロダクト（作品）または　エピソード（各話）
 *  @example
 *case:localRepository    
 *    localRepository.pmdb = new nas.Pm.PmDomain(localRepository);
 *case:NetworkRepository
 *    NetworkRepository.pmdb = new nas.Pm.PmDomain(NetworkRepository);
 *case:workTitle
 *    myTitle.pmdb = Object.create(myTitle.parent.pmdb);
 *case:Opus
 *    myOpus.pmdb = Object.create(myOpus.parent.pmdb);;
 */
 /*
    データノードパス文字列の仕様を調整
    '.'+サーバ識別子(URL様文字列)+'.'+リポジトリ識別子+'.'+リポジトリ識別コード+'//'
    最初の３フィールドがリポジトリを表すフィールドでユニーク値
    xMap|Xpstは、ここまでの情報を識別情報として持つ
 　　データノード//標準識別子//
    '.'で始まる文字列
    最後の'.'の後方がリポジトリ識別子で'//'で終了していた場合はこれを払う
    リポジトリ識別子の前方の'.'の前方がリポジトリ名
    最初の'.'からリポジトリ名の前方の'.'の間の文字列すべてがサーバ識別子（URL）となる
    .[serverIdf(url)].[RepositoryName].[RepositoryIdf]//
    eg.
    .https%3A%2F%2Fwww.dropbox.com%2Fsh%2Fg5zpxghnua49zlb%2FAADaU3-mH9zGwwEKpgLy2XYja%3Fdl%3D0.name of repository.%45abfg0170hg76376//

    サービス識別子の記述はURI文字列に準ずる
    ローカルファイルシステムのファイル名の一部として利用するためセパレータを含めてURIエンコードする
    リポジトリ識別子の記述に".(ドット)"が必要な場合はURIエンコードする
 */
/**
 *  データノードパスを分離する
 *  @params {String}    dataNode
 *  @returns {Object}
 *      無名オブジェクト　{repository:REPOSITORY-STRING,server:SERVER-STRING}
 */
nas.Pm.parseDataNode = function(dataNode){
    var result = {};
    if(!(String(dataNode).indexOf('.') == 0)) dataNode = '.' + dataNode;
    var nodeArray = dataNode.replace(/\/\/$/,'').split('.');
    result.token      = decodeURIComponent(nodeArray.slice(-1)[0]);
    result.repository = decodeURIComponent(nodeArray.slice(-2)[0]);
    result.server     = decodeURIComponent(nodeArray.slice(1,-2).join('.'));
    return result;
}

/** 
 *    編集のための汎用データ出力メソッド
 *  @params {String}    output
 *         値を取得するアドレスまたはキーワード
 *         プロパティ名 または ワイルドカード "*" または アドレス配列
 *  @returns {String}
 *         contents put　メソッドに引き渡し可能な文字列出力
 */
nas.Pm.valueGet = function (output){
console.log(output);
console.log(this.exList);
//引数がない場合は失敗
	if(! output) return false;
//編集可能プロパティリストは、親オブジェクトのプロパティ this.exListとして保持
/*
	getメソッドは
		JSON
			JSON.stringify(<target>)
		direct
			String(<target>)
		as Function
			<target>[<getMathodFunction>]()
		other
			<target>
*/
//変換テーブルに値のないプロパティは、書き込み不能なので失敗
//	if(! this.exList[output]) return false;
//親オブジェクトごとに継承オブジェクトを確認
	var targets = [];
	if(this instanceof nas.Pm.PmUnit){
		targets = ["nodeManager","issues"]; 
	}else if(this instanceof nas.xMap){
	    if(
	        (output instanceof Array)||
	        ((typeof output == 'string')&&(output.match(/^-?\d(\.-?\d)*$/)))
	       ){
console.log('asset address detect');
	           return this.assetGet(output);
	    }
		targets = ["pmu"]; 
	}else if(this instanceof nas.Xps){
	    if(
	        (output instanceof Array)||
	        ((typeof output == 'string')&&(output.match(/\d+_\d+/)))
	       ) return this.xpsTracks.get(output);
		targets = ["pmu"];
	}
	for(var i = 0 ; i < targets.length ; i ++){
		var child = targets[i]+'.';
		if(output.indexOf(child)==0){
			output = output.slice(child.length);
console.log([targets[i]] +':'+ output);
			return this[targets[i]].get(output);//子供オブジェクトのメソッドへ渡す
		}
	}
//アドレスから現データを取得
	var targetProp   = this[output];
	if(output == "*") targetProp = this;//特例
//文字列化した値（ディープコピー）取得
	var currentValue;
	if(this.exList[output].get == 'JSON'){
		currentValue = JSON.stringify(targetProp);
	}else if(this.exList[output].get == 'direct'){
		currentValue = (targetProp)? String(targetProp):targetProp;
	}else if(targetProp[this.exList[output].get] instanceof Function){
		currentValue = targetProp[this.exList[output].get]();
	}else {
		return false;
	}
//値文字列を返す
    return currentValue;
};// nas.Pm.valueGet
/** 
 *    編集のための汎用データ入力メソッド
 *  @params {Object InputUnit|Array address|String targetItem}    input
 *         入力オブジェクトまたはアドレス｜キーワード
 *  @params {String}    content
 *         入力（書換）内容 文字列データ 第一引数が InputUnitの場合は無効
 *  @returns [Array]
 *      [書き込みプロパティアドレス,書き込み前の値,書き込み後の値]
 *  複数のInputUnitの入力は認められない

put(
    []
)



xUI InputUnitの評価を行う関係上xUIの初期化及びオブジェクト化が必要
 */
nas.Pm.valuePut = function (input,content){
//引数をオブジェクト化
//ｘUIがない場合は旧来の動作に
    if((typeof xUI != 'undefined')&&(input instanceof xUI.InputUnit)){
        var inputUnit = input;
    }else{
        var inputUnit = {address:input,value:content};
    };
//ターゲットがない場合は失敗
    if(! inputUnit.address) return false     ;
//親オブジェクトごとに継承オブジェクトを確認して引き渡し
    var targets = [];
    if(this instanceof nas.Pm.PmUnit){
        targets = ["nodeManager","issues"]; 
    }else if(this instanceof nas.xMap){
        if(inputUnit.address instanceof Array) return this.assetPut(inputUnit);
        targets = ["pmu"];
    }else if(this instanceof nas.Xps){
        if(
            ((typeof inputUnit.address == 'string')&&(inputUnit.address.match(/\d+_\d+/)))||
            (inputUnit.address instanceof Array)
        ) return this.xpsTracks.put(inputUnit);
        targets = ["pmu"];
    }else if(this instanceof nas.StoryBoard){
        
    }else if((typeof pman != undefined)&&(this === pman.reName)){
        if(
            ((typeof inputUnit.address == 'string')&&(inputUnit.address.match(/\d+_\d+/)))||
            (inputUnit.address instanceof Array)
        ) return this.itemPut(inputUnit);
    };
    for(var i = 0 ; i < targets.length ; i ++){
        var child = targets[i]+'.';
        if(inputUnit.address.indexOf(child)==0){
            inputUnit.address = inputUnit.address.slice(child.length);
            return this[targets[i]].put(inputUnit);//子供オブジェクトのメソッドへ渡す
        }
    }
//変換テーブルに値のないプロパティは、書き込み不能なので失敗
    if(! this.exList[inputUnit.address]) return false;
//アドレス変換可能なプロパティを処理
    if(this.exList[inputUnit.address].convert){
        return this.put({
            address : this.exList[inputUnit.address].convert,
            value   : inputUnit.value
        });
    }
//アドレスから現データを取得
    var targetProp   = this[inputUnit.address];
    if(inputUnit.address == "*") targetProp = this;//特例
    var currentValue = this.get(inputUnit.address);//ディープコピーを取得
    var putMethod = this.exList[inputUnit.address].put;//書き込み用メソッドを取得
    if(putMethod == 'direct'){
        this[inputUnit.address] = inputUnit.value;//直接代入
    }else if(putMethod == 'JSON'){
        this[inputUnit.address] = JSON.parse(inputUnit.value);
    }else if(this[inputUnit.address][putMethod] instanceof Function){
        this[inputUnit.address][putMethod](inputUnit.value);//メソッドで書き込み
    }else{
        return false;
    }
//戻り値は、配列 [書き込みアドレス,書き込み後の値,書き込み前の値[,書き込みに成功したレンジ]]
//第四要素はレンジが存在するxpsTracksのみ
//範囲のデータフォーマットは [[startCol,startFrm],[endCol,endFrm]]
    if((this.exList[inputUnit.address].sync)&&(this[this.exList[inputUnit.address].sync])){
//同期メソッドがあれば実行 引数は必ずtrue
        this[this.exList[inputUnit.address].sync](true);
    }
    return [inputUnit.address, this.get(inputUnit.address), currentValue];
};// nas.Pm.valuePut

/* 
 *   PmDomainはドメインごとにPmUnitオブジェクトにアタッチされてpmdbとして働くデータ参照用オブジェクト 
 *
 *
 *   (organization|repository).pmdb 
 *    
 *   title.pmdb 
 *    
 *   epsode.pmdb 
 *    
 *   これらは皆　nas.pmdb　をアクセスポイントにする 
 *   DB接続が不能な場合は　nas.Pm　を基礎DBとして利用する 
 *   
 *   親オブジェクトには .pmdbプロパティが必要であるが、これがない場合空のコレクションで初期化される
 *   親オブジェクト指定なしで初期化した場合は、自身を親と設定して情報のルートとして使用する
 *   情報ルートとして初期化された場合のみ一括読込が可能
 *
 *   ProductionLine 
 *   ProductionStage 
 *   JobNames 
 *    
 *   これらは入力参照用オブジェクトで設計時の雛形 
 *    
 *   実運用時は 
 *    
 *   ManagementLine 
 *   ManagementStage 
 *   ManagementJob|PmNode 
 *
 *  parent      ドメインが参照する親ドメインを持つプロパティが記録される(parent.pmdb　が存在すること)
 *  dataNode    pmdbが所属するドメイン自身がIdfとして記録される　指定されない場合はルートドメイン'.'になる
 *
 *
 *  pmdb継承配置
 *	  pmdbにnamePathを与える
 *	{pmdb}.dataNode　として確認
 *  エピソードがパスの終端で、それ以下の枝葉にはpmdbを置かない
 *	
 *	ルート　.//.pmdb				nas.Pm.pmdb アプリケーション組み込みクラス
 *		└ サービスノード			.<serviceNode>//.<timestamp>.pmdb    nas.Pm.pmdbから継承する　UATユーザごとのpmdb
 *			└ リポジトリ			.<serviceNode>.<repository>//.<timestamp>.pmdb    サービスノードから継承する
 *				└ タイトル		.<serviceNode>.<repository>//<title>.<timestamp>.pmdb
 *					└ エピソード	.<serviceNode>.<repository>//<title>#<episode>.<timestamp>.pmdb
 *
 *	.<serbiceNode>.<repository>//<title>#<ep>[<subtitle>].<timestamp>.pmdb
 *  <serbiceNode>   サービスノード識別子　serverのurlを使用
 *  <repository>    リポジトリ識別子 予約名またはサービスごとの識別コードを使用
 *  .https://remaping-stg.u-at.net.
 */
/*  @constractor
 *  @params {Object Xps|xMap} myParent
 *      PMDBデータベースオブジェクトを持つ、親オブジェクトを指定
 *  @params {String}    myNode
 *      継承関係を表す所属データノード
 */
nas.Pm.PmDomain = function(myParent,myNode){
    this.parent     = (typeof myParent == 'undefined')? {}:myParent;
    this.version    = "nasPMDB-FILE 1.0.0";
    this.uuid       = false;
    if(this.parent.pmdb) myNode = this.parent.pmdb.dataNode + myNode;
    this.dataNode   = (myNode)?myNode:'.';
    this.token        ;//DB接続用トークン

    this.management = null;//管理ロックフラグ ロックの際は nas.UserInfoを配置
    this.timestamp  = 0   ;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    this.contents   = [];
    var hasReference = (
        (this.parent.pmdb) &&
        (this.parent.pmdb instanceof nas.Pm.PmDomain)&&
        (Object.create)
    )? true:false;
//Adobe実行系でObject.createが使用できないので一時的にブロックする
//代替コードはのちほど 2021 01 12
    this.configurations = (hasReference)? Object.create(this.parent.pmdb.configurations):new nas.Pm.ProductConfigurations(this);
//pmdbにアタッチするプロパティトレーラー
    this.assets         = (hasReference)? Object.create(this.parent.pmdb.assets)        :new nas.Pm.AssetCollection(this);//
    this.users          = (hasReference)? Object.create(this.parent.pmdb.users)         :new nas.UserInfoCollection([],this);//
    this.staff          = (hasReference)? Object.create(this.parent.pmdb.staff)         :new nas.Pm.StaffCollection(this);//
    this.pmTemplates    = (hasReference)? Object.create(this.parent.pmdb.pmTemplates)   :new nas.Pm.PmTemplateCollection(this);//
    this.pmWorkflows    = (hasReference)? Object.create(this.parent.pmdb.pmWorkflows)   :new nas.Pm.PmWorkflowCollection(this);//
    this.lines          = (hasReference)? Object.create(this.parent.pmdb.lines)         :new nas.Pm.LineCollection(this);//
    this.stages         = (hasReference)? Object.create(this.parent.pmdb.stages)        :new nas.Pm.StageCollection(this);//
    this.jobNames       = (hasReference)? Object.create(this.parent.pmdb.jobNames)      :new nas.Pm.JobTemplateCollection(this);//
    this.organizations  = (hasReference)? Object.create(this.parent.pmdb.organizations) :new nas.Pm.OrganizationCollection(this);//
    this.medias         = (hasReference)? Object.create(this.parent.pmdb.medias)        :new nas.Pm.MediaCollection(this);//
    this.workTitles     = (hasReference)? Object.create(this.parent.pmdb.workTitles)    :new nas.Pm.WorkTitleCollection(this);//
    this.products       = (hasReference)? Object.create(this.parent.pmdb.products)      :new nas.Pm.OpusCollection(this);//
//
/*
    this.configurations = new nas.Pm.ProductConfigurations(this);
    this.assets         = new nas.Pm.AssetCollection(this);//
    this.users          = new nas.UserInfoCollection([],this);//
    this.staff          = new nas.Pm.StaffCollection(this);//
    this.pmTemplates    = new nas.Pm.PmTemplateCollection(this);//
    this.pmWorkflows    = new nas.Pm.PmWorkflowCollection(this);//
    this.lines          = new nas.Pm.LineCollection(this);//
    this.stages         = new nas.Pm.StageCollection(this);//
    this.jobNames       = new nas.Pm.JobTemplateCollection(this);//
    this.organizations  = new nas.Pm.OrganizationCollection(this);//
    this.medias         = new nas.Pm.MediaCollection(this);//
    this.workTitles     = new nas.Pm.WorkTitleCollection(this);//
    this.products       = new nas.Pm.OpusCollection(this);//
 */
//    if(appHost.ESTK) this.parseConfig(this.parent.pmdb.dump("JSON"));
//pmdbにアタッチするプロパティトレーラー
//
//    this.activeProduct = this.products.entry('%default%');//
    this.activeProduct = null;//
//作業割宛設定
//    this.allocations   = (this.parent.pmdb)?  Object.create(this.parent.pmdb.allocations):new nas.Pm.AllocateCollection(this);//
}
//クラスプロパティ出力順序 ここに記述のないtテーブルは遅延で解決される
nas.Pm.PmDomain.export_order =[
    "configurations",
    "assets",
    "medias",
    "users",
    "staff",
    "lines",
    "stages",
    "jobNames",
    "organizations",
    "products",
    "workTitles",
    "pmTemplates",
    "pmWorkflows"
];

/*
    自分自身の継承クローンを返す
    ノードアドレスを引数で渡す
 */
nas.Pm.PmDomain.prototype.getChild = function(parent,nodeAddress){
    var childDB = new nas.Pm.PmDomain();
    childDB.parseConfig(this.dump('JSON'));
    childDB.parent   = parent;
    childDB.dataNode = nodeAddress;
    return childDB;
}
/**
timestamp更新
*/
nas.Pm.PmDomain.prototype.updateTimestamp = function(){
    if(this.contents.length){
        this.timestamp = 0;
        for(var ix = 0 ;ix < this.contents.length ; ix ++){
            var collectionTimestamp = this[this.contents[ix]].timestamp;
            if(collectionTimestamp > this.timestamp) this.timestamp = collectionTimestamp;
        }
    }
    return this.timestamp;
}
/*  PmDomainに固定のDBを設定する手続き
    引数は設定データの JSON|プレーンテキスト|ダンプフォーマット
    更新リストに存在しないデータは本体に含まれていても更新しない
    更新リスト内のデータが本体に含まれない場合はエラー終了
*/
nas.Pm.PmDomain.prototype.parseConfig = function(configStream){
//    if(this.parent !== this) return false;
    if((!(configStream))||(String(configStream).length==0)) return false;
    var dataContents  = [];
    var newColections = [];
    var form = false;
    if(configStream.indexOf('nasPMDB-FILE ')==0){
        form = 'plain-text';
    }else if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    }
    if (! form ) return false;
//フォーマット別に情報を取得する
    if(form == 'JSON'){
//JSON
        try {var configContent = JSON.parse(configStream);} catch(err){console.log('err !!!!') ;console.log(err) ;return false; }
        if(configContent.dataInformation){
            this.version    = configContent.dataInformation.version;//nasPMDB-FILE 1.0.0
            this.uuid       = configContent.dataInformation.uuid;//
            this.dataNode   = configContent.dataInformation.dataNode;
            this.timestamp  = configContent.dataInformation.timestamp;
            dataContents    = configContent.dataInformation.contents;//;
            if(dataContents.lengh) this.timestamp = 0;//コンテンツ側のタイムスタンプを取得するために0リセット
            for (var idx=0 ;idx < dataContents.length; idx++){
                var tgt = dataContents[idx];
console.log('read table : ' + tgt);
                this.contents.add(tgt);
//console.log(configContent[tgt]);
                this[tgt].parent = this ;
                this[tgt].parseConfig(JSON.stringify(configContent[tgt]));
            }
        }
    }else{
//text
        configStream=String(configStream).split('\n');
        var prop ={
            'UUID':'uuid',
            'DATA_NODE':'dataNode',
            'TIMESTAMP':'timestamp',
            'CONTENTS':'contents',
        }
        this.version    = configStream[0];
//第一パス
        for(var ir = 1;ir<configStream.length;ir++){
            if(configStream[ir].indexOf("##")!=0) continue;//
            if((configStream[ir].match(/^##([^#=]+)=(.+)$/))){
                var nAme= RegExp.$1; var vAlue=RegExp.$2;
                if(nAme == 'CONTENTS'){
                    dataContents   = vAlue.split(',');
                }else{
                    this[prop[nAme]]=vAlue;
                }
            }
        }
//第二パス
        var currentCollection = false;
        var dataBuf={};
        for(var ir = 1;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//

            if(currentCollection) dataBuf[currentCollection].push(configStream[ir]);

            if((configStream[ir].match(/^\[([a-z]+)\]:?(\d*)$/i))){
                var collectionName      = RegExp.$1;
                var collectionTimestamp = RegExp.$2;
                if (dataContents.indexOf(collectionName) < 0){
                    currentCollection = false;
                }else{
                    currentCollection = collectionName;
                    dataBuf[currentCollection]=[];
                    dataBuf[currentCollection].timestamp = collectionTimestamp;
                    if(collectionTimestamp > this.timestamp) this.timestamp = collectionTimestamp;
                }
            }
        }
//第二パスで取得したデータでコレクションを更新
        for(var ix= 0 ;ix <dataContents.length; ix++){
            if((this[dataContents[ix]])&&(dataBuf[dataContents[ix]])){
                this[dataContents[ix]].parseConfig(dataBuf[dataContents[ix]].join('\n'));
                this[dataContents[ix]].timestamp = dataBuf[dataContents[ix]].timestamp;
            }
        }
    }
    this.updateTimestamp();
    return this;
}
/*TEST
    var A = new nas.Pm.PmDomain(nas,"testPMDB");
    A.parseConfig(nas.Pm.pmdb.dump('JSON'));
    A.dump('text')

    var B = new nas.Pm.PmDomain(nas,"testPMDB");
    B.parseConfig(nas.Pm.pmdb.dump('text'));
    JSON.stringify(JSON.parse(B.dump('JSON')),null,4);
*/
/*
 *  PmDomain(.pmdb)上のデータを書き出すメソッド
 *  @params     {String} form
 *      export data format JSON|plain-text|dump
 *  PmDomain.contentsを再読込する際には順序に依存性がある
 *  出力の際にあらかじめ先行グループに所属するテーブルを先にダンプするように調整
 */
nas.Pm.PmDomain.prototype.dump = function(form){
    if(typeof form == 'undefined') form = 'JSON';

    this.contents.sort(function(a,b){return (nas.Pm.PmDomain.export_order.findIndex(function(elm){return (elm == a);})-nas.Pm.PmDomain.export_order.findIndex(function(elm){return (elm == b);}));});

//  フォームごとに情報を再構成して返す
    if(form == 'JSON'){
//JSON
        var result = {dataInformation:{
            version     :this.version,
            uuid        :this.uuid,
            dataNode    :this.dataNode,
            timestamp   :this.timestamp,
            contents    :this.contents
        }};
        for(var cix = 0 ;cix < this.contents.length;cix ++){
            var targetCollection = this[this.contents[cix]];
            result[this.contents[cix]] = JSON.parse(targetCollection.dump('JSON'));
            if(result[this.contents[cix]] instanceof Array){
                result[this.contents[cix]].push({timestamp:this[this.contents[cix]].timestamp});
            }else{
                result[this.contents[cix]].timestamp = this[this.contents[cix]].timestamp;
            }
        }
        return JSON.stringify(result,null,4);
    }else{
//text
        var resultArray = [];
        resultArray.push(this.version);
        resultArray.push("##UUID="        +this.uuid);
        resultArray.push("##DATA_NODE=" +this.dataNode);
        resultArray.push("##TIMESTAMP=" +this.timestamp);
        resultArray.push("##CONTENTS="    +this.contents.join(','));
        for(var cix = 0 ;cix < this.contents.length;cix ++){
            var targetCollection = this[this.contents[cix]];
            resultArray.push("["+this.contents[cix]+"]:"+this[this.contents[cix]].timestamp);
            resultArray.push(targetCollection.dump(form));
        }
        return resultArray.join("\n");
    }
}
/*TEST
A = new nas.Pm.PmDomain();
A.contents=["organizations","users","staff","assets","stages","lines","pmTemplates","jobNames","workTitles","products","medias"];
console.log(A.dump('JSON'));
console.log(A.dump('dump'));
A.dump('text');
*/
/**
 * @method
 * @desc
 *<pre>
 * ターゲットコレクション内にkeywordに一致するプロパティを持っているメンバーがあればコレクションメンバーのキー値を返す
 * keyword がメンバーキーだった場合はそのまま返す
 * 検索に失敗したらfalse
 * オブジェクト本体が必要な場合は、Object.members[key]またはこの検索関数を間接的にコールする_getMemberメソッドを使用
 * タイトル|エピソード|メディア|アセット|ライン|ステージ　共用</pre>
 * @param {String} keyword
 * @return {property}
 * memberProp
 * キーワードは、各コレクションのuniqueプロパティ
 * 以下は代表的なもの　各コレクション
 *   id          DBアクセス用のキー値（予約）
 *   projectName 作品としてのタイトル　タイトルに所属する情報の場合に有効だが、検索キーとしてはタイトルコレクション以外では無効
 *   name        コレクションメンバーの一般名称
 *   shortName   コレクションメンバーの省略表記
 *   fullName    コレクションメンバーの正式表記
 *   code        コレクションメンバーの短縮アイテムコード
 *
 */
nas.Pm.searchProp = function(keyword,target,region){
    if(! region) region = 'global';
    if(! target.unique[region]) region = Object.keys(target.unique)[0];
    if(target.members[keyword]) return keyword;
    for (var prp in target.members){
    var propNames = target.unique[region];
        for (var pix = 0;pix < propNames.length ; pix ++){
            if(
                (!(target.members[prp][propNames[pix]]))||
                (target.members[prp][propNames[pix]] == '')||
                (target.members[prp][propNames[pix]] == null)||
                (typeof target.members[prp][propNames[pix]] == undefined)
            ) continue;
            
            if(target.members[prp][propNames[pix]] == keyword) return prp;
        }
    };// */
/*
    for (var prp in target.members){
        if( (target.members[prp].id          == keyword)||
            (target.members[prp].name        == keyword)||
            (target.members[prp].projectName == keyword)||
            (target.members[prp].episodeName == keyword)||
            (target.members[prp].mediaName   == keyword)||
            (target.members[prp].shortName   == keyword)||
            (target.members[prp].fullName    == keyword)||
            (target.members[prp].token       == keyword)||
            (target.members[prp].code        == keyword) ) return prp;
    };// */
    return false;
}
/*
    コレクションメンバーキャリアが配列の場合は以下を使用
    使えないかも
*/
nas.Pm.searchPropA = function(keyword,target){
    if(! target.unique) return false;
    //メンバー総当たり
    for (var mix = 0 ; mix < target.members.length ; mix ++){
    //オブジェクトのプロパティ内で　unique情報のあるプロパティのみを検索
        for (var uix = 0 ; uix < target.unique.length ; uix ++){
            if(
                (target.members[mix][target.unique[uix]] == null)||
                (target.members[mix][target.unique[uix]] == '')||
                (typeof target.members[mix][target.unique[uix]] == 'undefined')
            ) continue; //相互にマッチしない
            if(
                ((target.members[mix][target.unique[uix]].sameAs)&&(target.members[mix][target.unique[uix]].sameAs(keyword))) ||
                (target.members[mix][target.unique[uix]].toString()==keyword)
            ) return target.members[mix]
        }
    }
    return null;
}
/**
 *  @method
 *  <pre>
 クラスメソッド　メンバー内でユニークなアルファベットのコードを生成して返す
 引数を代表値とみなして Collection内の先行値に重複部分が多い場合はシリーズ値としてその値に隣接した値を返す
 メンバーの代表値が
 代表値にアルファベットが含まれている場合は優先的にその値を使う
 *  </pre>
 *  @
 */
nas.Pm._newCode = function(memberName,region){
    if(! region) region = 'global';
    if(! this.unique[region]) region = Object.keys(this.unique)[0];
    if(this.unique[region].indexOf('code') < 0) return false;
    var seedString = String(memberName).replace(/[^A-Z]/gi,"").slice(0,3).toUpperCase();
    while(seedString.length < 3){
        seedString += ("ABCDEFGHIJKLMNOPQRSTUVWXYZ").charAt(Math.floor(Math.random()*10000)%26);
    };
    while(!(this.entry(seedString))){
        seedString.slice(
            s,
            ("ABCDEFGHIJKLMNOPQRSTUVWXYZ").charAt(Math.floor(Math.random()*10000)%26)
        )
    }
    return seedString;
}
/**
 *  @method
 * <pre>
 *    クラスメソッドnas.Pm.searchPropを使ってキーを検索して対応するメンバーを返すオブジェクトメソッド
 *    検索に失敗したケースではnullを戻す
 *    引数に"%default%"を与えた場合、そのコレクションに.activeアトリビュートが存在すればそのメンバーを
 *    存在しない場合はメンバー内の最初のエントリを戻す
 *    これは デフォルトエントリ として使用される
 *    デフォルトエントリを最初のエントリとして登録する必要がある
 *    通常は各コレクションの.entryメソッドにマッピングされる</pre>
 *  @params {String}    keyword
 *  @returns    {Object|null}
 *  ヒットしたコレクションメンバー | null
 */
nas.Pm._getMember = function(keyword){
    if(keyword=='%default%'){
        if(this.active){
            return this.members[this.active];
        }else{
            for (var itm in this.members){return this.members[itm];break;}
        }
    }
    if(this.members[keyword]) return this.members[keyword];
    var prp = nas.Pm.searchProp(keyword,this,'local');
    if(prp){
        return this.members[prp];
    }else{
        return null;
    };
}

/**
 *  @method
 * <pre>
 *    クラスメソッドnas.Pm.searchPropAを使ってキーを検索して対応するメンバーを返すオブジェクトメソッド
 *    検索に失敗したケースではnullを戻す
 *    引数に"%default%"を与えた場合、そのコレクションに.activeアトリビュートが存在すればそのメンバーを
 *    存在しない場合はメンバー内の最初のエントリを戻す
 *    これは デフォルトエントリ として使用される
 *    デフォルトエントリを最初に登録する必要がある
 *    通常は各コレクションの.entryメソッドにマッピングされる</pre>
 *  @params {String}    keyword
 *  @returns    {Object|null}
 *  ヒットしたコレクションメンバー | null
 */
nas.Pm._getMemberA = function(keyword){
    if(keyword=='%default%'){
        if(this.active){
            return this.members[this.active];
        }else{
            return this.members[0];
        }
    }
//    if(this.members[keyword]) return this.members[keyword];
    var prp = nas.Pm.searchPropA(keyword,this);
    if(prp){return prp}else{return null}
}

/**
 *<pre>
 *    コレクションメンバーをテキストとしてダンプ出力するメソッド　汎用
 *    対象コレクション
 * nas.Pm.OrganizationCollection //nas.pmdb.Organizations.dump();
 * nas.Pm.WorkTitleCollection //nas.pmdb.workTitles.dump();
 * nas.Pm.MediaCollection     //nas.pmdb.medias.dump();
 * nas.Pm.AssetCollection     //nas.pmdb.assets.dump();
 * nas.Pm.StageCollection     //nas.pmdb.stages.dump();
 * nas.Pm.LineCollection      //nas.pmdb.lines.dump();
 *
 * nsa.Pm.//nas.pmdb.jobNames.dump(true);　これは別わけ　コレクションの構造が異なる
 * nas.pmdb.//nas.pmdb.pmTemplates.dump(true);
 *  データ形式の複雑なものは汎用メソッドを使用せずに専用メソッドを持つ
 *  ただし仕様は汎用メソッドに準ずる</pre>
 *    @params   {String}    form
 *          出力形式指定文字列
 *    引数なし        メンバーあたり1要素のカンマ区切りテキスト  改行なし
 *                    代表値　例えばステージならばステージ名を単独でコンマ区切りで戻す
 *
 *     plain|text     プレーンテキスト　文章形式 config.pmdb用
 *                    可読性の高い平文フォーマット改行あり
 *                    １要素１行とは限らないので注意
 *
 *    full|dump      プレーンテキスト設定ファイル用のダンプストリーム　config.pmdb用
 *                   コレクションの　addMember メソッドで直接処理可能なテキストデータの配列を改行区切りで出力する
 *                   １要素１レコード
 *
 *    JSON        JSONによるダンプ 汎用的なデータ交換用
 *                オブジェクトごとに戻りデータの構造が異なるので注意
 *                JSONを指定した場合のみ第２、第３引数がStringifyの引数として渡される
 */
nas.Pm._dumpList = function(form){
    switch (form){
    case "JSON":
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
        var result = [];
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push(JSON.parse((this.members[ix].dump)?this.members[ix].dump(form):this.members[ix].toString(form)));
            }
       }else{
        //キャリアがオブジェクトベースの場合
        var result = {};
            for (var prp in this.members){
                result[prp]=JSON.parse((this.members[prp].dump)?this.members[prp].dump(form):this.members[prp].toString(form));
            }
        }
        return JSON.stringify(result,arguments[1],arguments[2]);
        break;
    case "full-dump":
    case "full":
    case "dump":
        var result="";
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
            for (var ix =0 ; ix<this.members.length;ix++){
//                if (ix > 0) result +=",\n";
                if (ix > 0) result +="\n";
                result += (this.members[ix].dump )? this.members[ix].dump('full'):this.members[ix].toString('full');
            }
            result += '\n';
       }else{
         //キャリアがオブジェクトベースの場合
            for (var prp in this.members){
                result += '"'+prp+'",';
                result += (this.members[prp].dump)? this.members[prp].dump('full') : this.members[prp].toString('full');
                result += '\n';
            }
        }
        return result;
        break;
    case 'plain-text':
    case 'plain':
    case 'text':
    default:
        var result = new Array;
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push((this.members[ix].dump)? this.members[ix].dump(form) : this.members[ix].toString(form));
            }
       }else{
        //キャリアがオブジェクトベースの場合
            for (var prp in this.members){
                result.push((this.members[prp].dump)? this.members[prp].dump(form) : this.members[prp].toString(form));
            }
        }
        return result.join((form)? '\n':',');
    }
}
/**
 *<pre>
 *      コレクションオブジェクトのメンバ追加オブジェクト
 *    引数  メンバオブジェクトの配列
 *    戻値  追加に成功したエントリの配列
 *    重複メンバーは登録しない
 *    重複の条件は、Collection.unique配列を参照　いずれかのバッティングを（_getMember() で）検出
 *      uniqueキーのプロパティが存在しないまたはnull値の場合は全てのキーとマッチしないものとみなす
 *      (=ユニークと評価する)
 *</pre>
 *  @params {Array of member|Object member} members
 *  @params {String} region
 *  @returns    {Array of Object mambers process sucseed}
 */
nas.Pm._addMembers = function(members,region){
    if(this.unique){
        if(! region) region = 'global';
        if(! this.unique[region]) region = Object.keys(this.unique)[0];
    }
    var result = [];
    if(!(members instanceof Array)) members = [members];
if (this.members instanceof Array){
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempMember = members[ix];
        var conflict = false;
        if((this.unique)&&(this.entry)){
            for (var uix = 0 ; uix < this.members.length ; uix++ ){
                if(
                 (typeof tempMember[this.unique[region][uix]] != 'undefined')&&
                 (tempMember[this.unique[region][uix]] != 'null')&&
                 (this.entry(tempMember[this.unique[region][uix]])!=null)
                ){ conflict = true;break;}
            }
        }
        if(! conflict){
            var idx = this.members.add(tempMember);//>=0;
            if(ix == idx) result.push(tempMember);
        }
    }
}else{
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempMember = members[ix];
        var conflict = false;
        for (var uix = 0 ; uix < this.unique[region].length ; uix++ ){
//console.log(this.unique[region][uix]);
//console.log(tempMember[this.unique[region][uix]]);
//console.log(this.entry(tempMember[this.unique[region][uix]]));// */
            if (
                (typeof tempMember[this.unique[region][uix]] == 'undefined')||
                (tempMember[this.unique[region][uix]] == null)||
                (tempMember[this.unique[region][uix]] == '')
            ) continue;
            if (
                (typeof tempMember[this.unique[region][uix]] != 'undefined')&&
                (tempMember[this.unique[region][uix]] != 'null')&&
                (this.entry(tempMember[this.unique[region][uix]]) != null)
            ){conflict = true;break;}
        }
        if(! conflict){
//console.log('=============='+tempMember[this.unique[region][0]]);
            this.members[tempMember[this.unique[region][0]]]=tempMember;
            result.push(tempMember);
        }else{
//console.log('conflict !!! ==============');console.log(tempMember);
        }
    }
}
    return result;
}
nas.Pm._updateTimestamp = function(){
    this.timestamp = new Date().getTime();
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.timestamp = this.timestamp;;
}

/*
 * コレクションオブジェクトの設定読み込みメソッド
 *    不正データの排除と重複データの排除はコレクションのaddMembersメソッドが受け持つ
 *    これは使用されない　メンバーごとのオブジェクトの相関が記述できていない　9/3
*/
/*
nas.Pm._parseConfig = function(dataStream,form){
    var myMembers =[];
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\s*\[\s*.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            var currentMember=new nas.Pm.Object(
                tempObject[rix].
                
            );
            currentMember[]=tempObject[rix][];
            
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':	
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
            if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentMember=new nas.Pm.Object(
            );
            currentMember.parse(dataStream[rix]);
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
plainフォーマット
entryName
	prop:value
	prop:value

        if((currentMember)&&(currentField.match(/^\t([^:])+:(.+)/))){
        	currentMember[RegExp.$1]=RegExp.$2;
        } else if(currentField.match(/^[a-z].*$/)) {
        	if(currentMember) myMembers.push(currentMember);
        	currentMember=new nas.Pm.Object(currentField);
        }
      }
      myMembers.push(currentMember);
    }
    return this.addStaff(myMembers);
}
*/
//test 上記共用メソッドの関与するコレクションの出力確認
// nas.pmdb.workTitles.toString(true)
// nas.pmdb.medelias
/**
 *  @constractor
 *  ノード管理マネージャ
 *  アセットスタックの管理も合わせてこのオブジェクトが行う？
 *  @summary
 * 制作管理オブジェクト ProductionNodeManager
 * 制作管理オブジェクトは、それぞれの管理単位　nas.PmUnit（xMap|Xps）についての制作管理部分を抽出したオブジェクト
 * BANK等の管理移管時データ独立性を持たせるために分離される
 *  @params {Object nas.Pm.PmUnit}  parentObject
 *       親オブジェクトは、通常 (Xps|xMap).pmu　として参照される。
 */
 
/* ラインごとに各PmUnitのプロパティとして登録され、ラインの開始条件及び終了条件の判定を含む
 * カット袋よりも上位となるエピソード・タイトルについては、このオブジェクトでなくnas.Pm.PmUnitをコレクションメンバーとする上層ノードオブジェクトを作る
 ＞＞管理がノードベースでありアセット単位にならないため
 *  @params {Object Asset|assetDescription} targetAsset
 *  @params {String} nodeDescription
    @example
identifier:
2:美監チェック.8:原図整理.1:(BG).
plain:
    
 */
/*ノードマネージャに変更されたのでパーサは不要

nas.Pm.NodeManager.prototype.parseContent = function(){
    if(!(this.target instanceof nas.Pm.Asset)){
        var newAsset = nas.pmdb.assets.entry(this.target);
        if(! newAsset) newAsset = new nas.Pm.Asset()
    }
}

必要なメソッドは
ノード追加　= チェックインに内包
ノード削除　リムーブ
カレントノードセット　
    .setCurrent()
    ノードパス記述・またはキーワード start,end,previwe,*
    "5.2.1."
    "*."
チェックイン
チェックアウト
アクティベート
ディアクティベート
ノード破棄　= ノード削除

ブランチ　
    ブランチメソッドは、ラインブランチをコントロールする
    .branch(ライン名称<,分岐ノード>)
    戻り値はブランチした新規ラインの　ヘッドノード
    分岐ノードは、必ず管理ノード
マージ
    branchはブランチのままでマージが発生することはない
    データマージは　オンライン｜オフラインのissueに対して発生する
    .merge(issue)
    nodeManager.parent.issues
ノードパスからノード取得
ステージチャート配列取得
*/
/**
 *  @params {Object nas.Pm.PmUnit}  parentObject
 *  @params {Object} mNode {line:lineDescription,stage:stageDescription,job:jobDescription,status:statusDescription}
 */
nas.Pm.NodeManager = function NodeManager(parentObject,mNode){
    this.parent = parentObject    ;//{Object nas.Pm.PmUnit} parentObject
    this.lines    = [];//{Array of nas.Pm.ManagementLine}
    this.lines.composite = null;//コンポジットラインが存在しないノードがあるので初期値はnull コンポジットラインプロパティ
    this.stages   = [];//{Array of nas.Pm.ManagementStage}
    this.nodes    = [];//{Array of nas.Pm.ManagementJob|Node}

//初期化の際に一度だけ接続設定する このコードは廃止　接続更新は (xMap|Xps).syncPmuProps に移行
/*       if((this.parent)&&(this.parent.parent)&&(this.parent.parent instanceof nas.xMap)){
            this.parent.parent.lines  = this.lines ;
            this.parent.parent.stages = this.stages;
            this.parent.parent.jobs   = this.nodes ;
        };// */

/* 以下のプロパティはすべて上記オブジェクト側に記録されるので削除
    this.currentNode    ;//{Object nas.ManagementNode}アクティブノードの参照　ユーザのチェックインまでは存在しない
    this.activeStage    ;//{Object nas.ManagementStage}アクティブステージの参照　同上
    this.activeLine     ;//{Object nas.ManagementLine}アクティブラインの参照　同上
    this.currentUser    ;//{Object nas.UserInfo|String}　同上
    this.currentStatus  ;//{String} init|active|hold|fixed|finished　同上
*/
/*  以下は、ロード｜ストア時に転記　データビルド時はメソッドからコントロール　*/
    this.createUser     = new nas.UserInfo();//{Object nas.UserInfo|String userAccount}
    this.createDate     ;//{Object Date|String date}
    this.updateUser     = new nas.UserInfo();//{Object nas.UserInfo|String userAccount}
    this.updateDate     ;//{Object Date|String date}
    if(mNode) this.reset(mNode);
//編集可能プロパティリスト
/*
  "parent"          : 編集禁止（書き換え対象外）
  "line"            : 編集禁止（書き換え対象外）
  "stages"          : 編集禁止（書き換え対象外）
  "nodes"           : 編集禁止（書き換え対象外）
  "line"            : 編集禁止（書き換え対象外）
*/
this.exList = {
    "*"          : { "get": "toString"  , "put": "parse"   },
    "createUser" : { "get": "toString"  , "put": "parse"   },
    "createDate" : { "get": "getTime"   , "put": "setTime" },
    "updateUser" : { "get": "toString"  , "put": "parse"   },
    "updateDate" : { "get": "getTime"   , "put": "setTime" }
};
}
/*TEST
    xUI.XMAP.pmu.nodeManager.get("*");
*/
/** 
 *    編集のためのデータ出力メソッド
 *  @params {String}    output
 *         値を取得するアドレスまたはキーワード
 *         プロパティ名　または　ワイルドカード "*"　または
 *         
 *  @returns {String}
 *         contents put　メソッドに引き渡し可能な文字列出力
 */
nas.Pm.NodeManager.prototype.get = function (output){
//引数をオブジェクト化
	if(! output) return false     ;//ターゲットがない場合は失敗
console.log(output);
//編集可能プロパティリストは、親オブジェクトのプロパティ this.exListとして保持
/*
	getメソッドは
		JSON
			JSON.stringify(<target>)
		direct
			String(<target>)
		as Function
			<target>[<getMathodFunction>]()
		other
			<target>
*/
//アドレスがノードパスであった場合
    if((typeof output == 'string')&&(output.match(/^((\d+|\*)\.){0,2}(\d+\-\d+|\d+|\*)\.$/))){
console.log('nodePath detect :' + output)
        var currentNode  = this.getNodeByNodepath(output);//node|stage|line
        return (currentNode)? currentNode.get():currentNode;
    }
//変換テーブルに値のないプロパティは、書き込み不能なので失敗
	if(! this.exList[output.split('.')[0]]) return false;
//アドレスから現データを取得
	var targetProp   = this[output];
	if(output == "*") targetProp = this;//特例
	if(! targetProp) return false;
//文字列化した値で（ディープコピー）取得
	var currentValue;
	if(this.exList[output].get == 'JSON'){
		currentValue = JSON.stringify(targetProp);
	}else if(this.exList[output].get == 'direct'){
		currentValue = (targetProp)? String(targetProp):targetProp;
	}else if(targetProp[this.exList[output].get] instanceof Function){
		currentValue = targetProp[this.exList[output].get]();
	}else {
		return false;
	}
//値文字列を返す
    return currentValue;
};// NodeManager.get
/** 
 *    編集のためのデータ入力メソッド
 *  @params {String}    input
 *         入力オブジェクトまたはアドレス｜キーワード
 *  @params {String}    content
 *         入力（書換）内容　文字列データ
 *  @returns [Array]
 *  [書き込みプロパティアドレス,書き込み前の値,書き込み後の値]
 */

nas.Pm.NodeManager.prototype.put = function (input,content){
//引数をオブジェクト化
	var inputUnit = input;
	if(arguments.length > 1) inputUnit = {address:input,value:content};
	if(! inputUnit.address) return false     ;//ターゲットがない場合は失敗
//アドレスがノードパスであった場合
    if((typeof inputUnit.address == 'string')&&(inputUnit.address.match(/^((\d+|\*)\.){0,2}(\d+\-\d+|\d+|\*)\.$/))){
        var currentNode  = this.getNodeByNodepath(inputUnit.address);//node|stage|line
        var currentValue = currentNode.get();
        currentNode.put(inputUnit.value);
        return [inputUnit.address, currentValue, currentNode.get()];
    }
//一般アトリビュート
//変換テーブルに値のないプロパティは、書き込み不能なので失敗
	if(! this.exList[inputUnit.address]) return false;
//アドレスから現データを取得
	var targetProp   = this[inputUnit.address];
	if(inputUnit.address == "*") targetProp = this;//特例
	var currentValue = this.get(inputUnit.address);//ディープコピーを取得
	var putMethod = this.exList[inputUnit.address].put;//書き込み用メソッドを取得
	if(putMethod == 'direct'){
		this[inputUnit.address] = inputUnit.value;//直接代入
	}else if(this[inputUnit.address][putMethod] instanceof Function){
		this[inputUnit.address][putMethod](inputUnit.value);//メソッドで書き込み
	}else{
	    return false;
	}
//戻値:[<書き込みアドレス>,<書き込み前の値>,<書き込み後の値>]
    return ["pmu.nodeManager."+inputUnit.address, currentValue, this.get(inputUnit.address)];
};// NodeManager.put

/**
 *  読込時にノードマネージャーをリセットする手続き
 *      @params {Object}        mNode
 *  リセットの際にノードへのリンクを持つオブジェクトに注意
 *  所属ドキュメントがxMapでエレメントストアに既にオブジェクトがある場合リセットは禁止
 *  あらかじめ別途クリアが必要
 */
nas.Pm.NodeManager.prototype.reset = function (mNode){
    if(
        (this.parent)&&
        (this.parent.parent)&&
        (this.parent.parent.elementStore)&&
        (this.parent.parent.elementStore.length)
    ){
console.log('nodeManager reset failed');
        return false;
    }
    this.lines.length  = 0;//{Array of nas.Pm.ManagementLine}
    this.lines.composite = null;//予約　コンポジットラインプロパティ
    this.stages.length = 0;//{Array of nas.Pm.ManagementStage}
    this.nodes.length  = 0;//{Array of nas.Pm.ManagementJob|Node}
//0.0.0.の初期状態を作成
    if(mNode){
        var lin = this.new_ManagementLine(mNode.line);
        var stg = this.new_ManagementStage(mNode.stage,lin);
        var job = this.new_Job(mNode.job,stg);
        job.jobStatus = new nas.Pm.JobStatus(mNode.status);
    }else if(
        (this.parent)&&
        (this.parent.parent)&&
        (this.parent.parent.xpsTracks)
    ){
//console.log(mNode);
// if(!(confirm('OK?'))) return false;
        var lin = this.new_ManagementLine(nas.pmdb.pmTemplates.entry('trunk').name);
        var stg = this.new_ManagementStage(nas.pmdb.pmTemplates.entry('trunk').stages.dump().split(',')[0],lin);
        var job = this.new_Job('0:[init]',stg);
        job.jobStatus = new nas.Pm.JobStatus('Startup');
    };//  */
//pmu配下の場合 親pmuのプロパティを設定
    if(this.parent){
        this.parent.currentNode = job;//{Object nas.ManagementNode}アクティブノードの参照
        this.parent.checkinNode = undefined;//{Object nas.ManagementNode}チェックインまでは存在しない
    }
//console.log(this.parent);
}
/*
    ステータスを設定

*/
nas.Pm.NodeManager.prototype.setStatus = function (statusString){
    var activeNode = this.nodes;
//    this.currentNode = undefined;//{Object nas.ManagementNode}アクティブノードの参照　ユーザのチェックインまでは存在しない
//    this.createUser     ;//{Object nas.UserInfo|String userAccount}
//    this.createDate     ;//{Object Date|String date}
//    this.updateUser     ;//{Object nas.UserInfo|String userAccount}
//    this.updateDate     ;//{Object Date|String date}
}
/**
 *  ノードパスを指定してステータスを取得
 *  ノードパス未指定の場合は自動的にトランクのカレントノードのステータスが帰る
 *  @params {String}    nodePath
 *  @returns    {Object NodeStatus}
 */
nas.Pm.NodeManager.prototype.getStatus = function (nodePath){
    return this.getNode(nodePath).jobStatus;
}

/**
 *  ノードパス指定なしで最終ノードを取得する
 *  @returns    {Object nas.Pm.ManagementNode}
 */
nas.Pm.NodeManager.prototype.getLastNode = function (){
    if(this.lines.length == 0) return null;
    var lastUpdateNode = this.lines[0].getLastNode();
    if(this.lines.length > 0){
        for(var lix = 1 ;lix < this.lines.length ; lix ++){
            var currentNode = this.lines[lix].getLastNode();
            if(lastUpdateNode.updateDate < currentNode.updateDate) lastUpdateNode = currentNode;
        }
    }
    return lastUpdateNode;
}
/**
 *    デバッグ用にノード概要をダンプ
 */
nas.Pm.NodeManager.prototype.toString = function(){
    var result = [];
    if(this.lines.length) for(var l = 0 ;l < this.lines.length ; l++){
        result.push(this.lines[l].toString());
        if(this.lines[l].stages.length) for(var s = 0 ;s < this.lines[l].stages.length ; s++){
                result.push(this.lines[l].stages[s].toString());
            if(this.lines[l].stages[s].jobs.length) for(var n = 0 ;n < this.lines[l].stages[s].jobs.length ; n++){
                    result.push(this.lines[l].stages[s].jobs[n].toString());
            }
        }
    }
    return result.join('\n');
}
/**
    ノード内容をマージ
*/
nas.Pm.NodeManager.prototype.merge = function(target){
    var errorBuffer = [];
//ラインマージ
    for(var tlx = 0;tlx < target.lines.length ; tlx ++){
//ターゲットのラインコレクション一件ごとに既存ラインを検索
        var destLineIndex = this.lines.findIndex(function(element){return (element.getPath('id')==target.lines[tlx].getPath('id'))});
        if(destLineIndex >= 0){
//既存ライン検出
//既存ラインの情報を確認して不整合があれば処理中断
            if(
                ((this.lines[destLineIndex].delegations)&&(target.lines[tlx].delegations))&&
                (this.lines[destLineIndex].delegations.join()!=target.lines[tlx].delegations.join())
            ){
console.log('line property no match');
                errorBuffer.push({
                    status:"line property no match",
                    content:this.lines[destLineindex].toString() +"line delegations no match :" +[this.lines[destLineIndex].delegations.join(),target.lines[tlx].delegations.join()].join(':')
                });
                return {status:false,error:errorBuffer};
            }
//既存ライン　ライン情報のconflictがなければ　NOP
//ステージマージの際に複製新規ステージを作成してコレクションに登録  >> データ破壊は行わない
        }else{
//既存のラインでないのでターゲットの情報を複製した新規のラインを登録する
            var lineIx = this.new_ManagementLine(
                target.lines[tlx].toString(),
                'ブランチ記述は現在未使用',
                target.lines[tlx].delegations
            );//新規作成
        }
    };//ラインマージ終了
    
//ステージマージ　ノードパスが一致するステージを検出
    for(var tsx = 0;tsx < target.stages.length ; tsx ++){
        var destStgIndex = this.stages.findIndex(function(element){return(element.getPath('id')==target.stages[tsx].getPath('id'));});
        if(destStgIndex >= 0){
//既存ステージ検出
//条件一致　ステージマージ元/先　のアセット内容確認
            if(target.stages[tsx].asset.code != this.stages[destStgIndex].asset.code){
console.log('target stage asset no match');
//アセットに不整合があるためマージ不可
                errorBuffer.push({status:'stage asset no match',content:target.stages[tsx].asset.code+'<>'+ this.stages[destStgIndex].asset.code});
                continue;//該当ステージをスキップ？
                return {status:false,error:errorBuffer};
            }
//内包するジョブをマージ
            var jobCount = this.stages[destStgIndex].jobs.length;
            var addCount = 0;
            for (var tjx = 0;tjx< target.stages[tsx].jobs.length ;tjx ++){
                target.stages[tsx].jobs[tjx].stage = this.stages[destStgIndex];
                this.stages[destStgIndex].jobs.add(target.stages[tsx].jobs[tjx],function(tgt,dst){return (tgt.id == dst.id);});
                if(jobCount == this.stages[destStgIndex].jobs.length){
console.log('job merge failed')
//ジョブマージリジェクト
                    errorBuffer.push({status:'job merge failed',content: target.stages[tsx].jobs[tjx].toString()});
                    continue;
                }else{
                    jobCount = this.stages[destStgIndex].jobs.length;
                    addCount ++;
                }
            }
            if((addCount)&&(this.stages[destStgIndex].jobs.length > 1)
            ){
                this.stages[destStgIndex].jobs.sort(function(a,b){return (a.id-b.id);});
            }
        }else{
//一致既存ステージなし エレメントなしでターゲットの情報を複製した新規ステージを登録
//ステージの親ラインは前段のラインマージで必ず存在するので、別途検索
            var parentLine = this.lines.find(function(elm){return (elm.id.join('_')==target.stages[tsx].parentLine.id.join('_'))});
            var stgIx = this.stages.push(new nas.Pm.ManagementStage(
                target.stages[tsx].toString(),
                parentLine
            )) - 1;
            this.stages[stgIx].asset = new nas.xMap.xMapAsset(
                target.stages[tsx].asset.name,
                target.stages[tsx].asset.asset,
                this.stages[stgIx]
            );
        }
    }
//ノード(job)マージ
    var ndCount = this.nodes.length;
    var addNdCount = 0;
    for(var tnx = 0;tnx < target.nodes.length ; tnx ++){
        var destNodeIndex = this.nodes.findIndex(function(element){return (element.getPath('id')==target.nodes[tnx].getPath('id'))});
        if(destNodeIndex>=0){
//既存ノード　マージ不要 内容が異なる場合はコンフリクト検出でエラー終了
//コンソールに出す　データの所在を提示すること（課題）
            if(this.nodes[destNodeIndex].toString()!=target.nodes[tnx].toString()){
console.log('node property no match')
                console.log(this.toString());
                console.log(target.toString());
                errorBuffer.push({
                    status:'node property no match',
                    content:this.nodes[destNodeIndex].toString(true) +"node contents no match :" +[this.nodes[destNodeIndex].toString(),target.nodes[tnx].toString()].join('\n')
                });
                return {status:false,error:errorBuffer};
            }
        }else{
            var nodeStageIx = this.stages.findIndex(function(element){
                return ((target.nodes[tnx].stage)&&(element.getPath('id')== target.nodes[tnx].stage.getPath('id')));
            });
if(!(this.stages[nodeStageIx])){
console.log(nodeStageIx);
}
if(nodeStageIx < 0) {
console.log(this);
    errorBuffer.push({status:'WHAT?'});
    return {status:false,error:errorBuffer};
}
            var nodeIdx = this.nodes.add(
                new nas.Pm.ManagementJob(
                    target.nodes[tnx].toString(true),
                    this,
                    this.stages[nodeStageIx],
                    target.nodes[tnx].slipNumber,
                    target.nodes[tnx].jobStatus.toString()
                ),
                function(tgt,dst){return (tgt.getPath('id') == dst.getPath('id'))}
            );
            this.nodes[nodeIdx].type        = target.nodes[tnx].type;
            this.nodes[nodeIdx].createUser.parse(target.nodes[tnx].createUser);
            this.nodes[nodeIdx].createData  = target.nodes[tnx].createDate;
            this.nodes[nodeIdx].updateUser.parse(target.nodes[tnx].updateUser);
            this.nodes[nodeIdx].updateDate  = target.nodes[tnx].updateDate;
        }
    }
//マージの順が、時系列とは限らない 時系列でソート
    if((ndCount < this.nodes.length)&&(this.nodes.length > 1)) this.nodes.sort(nas.Pm.sortNodesByTime);
//console.log(JSON.stringify(this.getChart(),null,'\t'));

    return {status:true,error:errorBuffer};
}
/**
 *    ノードチャート配列を返す
 *    配列の第一要素は、コンポジットラインとする
 *  @returns {Array of nordChartElement}
 
	{
		name:<ライン識別名>,
		manager: [<UserInfo>,<Date>],
		staff: [<UserInfo>,<Date>],
		user: [<UserInfo>,<Date>],
		stages: [
			{
				name:<ステージ識別名>,
				nodes:[
					{
						name:<ジョブ識別名>,
						token:<アクセストークン>
					}...
				]
			}...
		],
		stageOffset;0,
		status: JobStatus {content: "Fixed", assign: "", message: "", stageCompleted: false}
	} 
 */
nas.Pm.NodeManager.prototype.getChart = function(){
    var result = [];
//コンポジットノードを第一レコードで設定
    if(this.lines.composite){
        result.push({
            'name':(this.lines.composite)? this.lines.composite.toString(true):'(comp)',
            'stages':[]
        });//配列にコンポジットラインを登録
        var six;
        for(six=0;six<this.lines.composite.stages.length;six++){
            var stageEntry = [this.lines.composite.stages[six].toString(true),[]];
            for(var jix = 0 ;jix < this.lines.composite.stages[six].jobs.length ; jix ++){
                stageEntry[1].push(this.lines.composite.stages[six].jobs[jix].toString(true));
            }
            result[result.length-1].stages.push(stageEntry);
        };//コンポジットラインにステージを登録 */
    }else{
        result.push({
            'name':'=no-composite=',
            'stages':[]
        });//配列にコンポジットラインを登録
    }
    for(var lix=0;lix<this.lines.length;lix++){
        var initNode = this.getNode([0,'*',lix,''].join('.'));
        var primaryNode = this.getNode([1,'*',lix,''].join('.'));
        var endNode = this.getNode(['*','*',lix,''].join('.'));
        result.push({
            'name'   : this.lines[lix].toString(true),
            'manager': [initNode.createUser    ,initNode.createDate],
            'staff'  : [primaryNode.updateUser ,primaryNode.updateDate],
            'user'   : [endNode.updateUser     ,endNode.updateDate],
            'status' : endNode.jobStatus,
            'stages' : []
        });//配列にラインを登録
        var six;
        for(six=0;six<this.lines[lix].stages.length;six++){
            var stageEntry = {
                'name' : this.lines[lix].stages[six].toString(true),
                'nodes': []
            };
            for(var jix = 0 ;jix < this.lines[lix].stages[six].jobs.length ; jix ++){
                stageEntry.nodes.push({
                    'name':this.lines[lix].stages[six].jobs[jix].toString(true)
                });
            }
            result[lix+1].stages.push(stageEntry);//offset(+1)
        }
    }
/*
    result.push({
        'name':this.lines.composite.toString(true),
        'stages':[]
    });//配列にコンポジットラインを登録
    var six;
    for(six=0;six<this.lines.composite.stages.length;six++){
        var stageEntry = [this.lines.composite.stages[six].toString(true),[]];
        for(var jix = 0 ;jix < this.lines.composite.stages[six].jobs.length ; jix ++){
            stageEntry[1].push(this.lines.composite.stages[six].jobs[jix].toString(true));
        }
        result[result.length-1].stages.push(stageEntry);
    };//コンポジットラインにステージを登録 */
    return result;
}
/**
 *    @function
 *    ノード一覧を時系列ソートする際の比較メソッド
 *    @example
 *    pmu.nodeManager.nodes.sort(nas.Pm.sortNodesByTime)
 *    @params   {Object nas.Pm.ManagementJob}  a
 *    @params   {Object nas.Pm.ManagementJob}  b
 *    @returns {Number} time sort diff
 */
nas.Pm.sortNodesByTime = function(a,b){
    return (a.updateDate - b.updateDate);
}
/**
 *     ノードコレクション内の(ID)ノードパス形式で指定された条件に一致するジョブノードを返す(ライン、ステージは戻らない)
 *    @params     {String|number}    nodepath
 *        省略''は開始ノード|'*'は最終更新ノード
 *        ジョブIDが負の数値であった場合　最終更新ノードから指定値分遡上したジョブノードを返す
 *        ライン・ステージIDは負の数値による指定は不可（アンマッチとなる）
 *        他は、ノードパス形式のものとする 負数IDを解釈するのはこのメソッドのみ
 *    @returns    {Object nas.Pm.ManagementJob | null}
 *        ライン、ステージ及びノードが存在しない場合nullを返す
 *
 *
 *    引数のない場合は 本線最終ステージ最終ノード *.*.0.
 *    ヒットしないidは最終エントリ　それ以外は当該エントリを表す
 *  注）*.*.*. は最も更新の遅いノードでなく　ラインIDの大きなノードの最終更新ジョブになるので注意
 *    *.*.0.  本線の最終ステージ最終ノード
 *    *.1.    ライン:1    最終ステージ開始ノード
 *    1-1.    ライン:1-1  開始ステージ開始ノード
 *    0.*.*.  最終更新ライン最終ステージ開始ノード
 */
nas.Pm.NodeManager.prototype.getNode = function(nodepath){
    if((this.lines.length==0)||(this.stages.length==0)||(this.nodes.length==0)) return null;
    if(typeof nodepath=='undefined') nodepath = '*.*.0.';
    var spliter = String(nodepath).split('.').reverse();//'.'でスプリットして反転
    if (spliter[0]=='') spliter.splice(0,1);//ルートノード指定あり
    for (var i = 0;i < spliter.length ; i ++) if(spliter[i].match(/^\s*$/)) spliter[i] = 0;//空白指定を0に正規化
    if (spliter.length < 3) spliter = spliter.concat(['','','']).slice(0,3);//不足分に開始ノードを補う
//(ID)数値パス
    if(String(nodepath).match(/^([\-\d\*]+\.?)+$/)){
//        this.sortByTime();//セットアップ後に一度だけ実行するように変更しておきたい
        var lineId = spliter[0];//line
//ライン抽出
        if (lineId == ''){
            var lin = this.lines[0];//確定本線
        }else if (lineId == '0-0'){
            var lin = this.line.composite;//コンポジットライン予約ID
        }else if(lineId == '*'){
            var lin = this.lines[this.lines.length-1]//通常ラインコレクションの末尾
        }else{
            var lin = this.lines.find(function(element){return(element.id.join('-') == lineId)});//通常ラインから検索
        }
        if(! lin) return null;//ノーヒット
//ステージ抽出
        var stgId = spliter[1];//stage
        if (stgId == ''){
            var stg = lin.stages[0];
        }else if (stgId.match(/^\-\d+$/)){
            var stg = lin.stages[lin.stages.length - 1 + parseInt(stgIx)];
        }else if(stgId == '*'){
            var stg = lin.stages[lin.stages.length - 1];
        }else{
            var stg = lin.stages.find(function(element){return(element.id == stgId)});
        }
        if(! stg) return null;//ノーヒット
//ジョブ抽出
        var jobId = spliter[2];//job
        if (jobId ==''){
            var job = stg.jobs[0];
        }else if (jobId.match(/^\-\d+$/)){
            var job = stg.jobs[stg.jobs.length - 1 + parseInt(jobIx)];
        }else if(jobId == '*'){
            var job = stg.jobs[stg.jobs.length - 1];
        }else{
            var job = stg.jobs.find(function(element){return(element.id==jobId)});
        }
        if(! job) return false;
        return job;
    }
//console.log(spliter.reverse().join('.')+'.');
//console.log(nas.Pm.parseNodePath(spliter.reverse().join('.')+'.'));
    return this.getNodeByNodepath(spliter.reverse().join('.')+'.');
}
/* TEST
    var testItems =[
        ["*.原画.(本線):0."  ,"3:[原画作監チェック].2:原画.0:(本線)."],
        ["3.2.0."           ,"3:[原画作監チェック].2:原画.0:(本線)."],
        ["3:.2:.0:."           ,"3:[原画作監チェック].2:原画.0:(本線)."],
        ["原画作監チェック.原画.本線."    ,"3:[原画作監チェック].2:原画.0:(本線)."],
        [".原画.本線."    ,"0:[作画打合せ].2:原画.0:(本線)."],
        ["原画.本線."    ,"0:[作画打合せ].2:原画.0:(本線)."],
        [".本線."    ,"0:[SCInfo].0:初期化.0:(本線)."],
        ["*.本線."    ,"0:[彩色発注].5:彩色.0:(本線)."],
        ["*."    ,"0:[BG打合せ].2:BG打合せ.1:(背景美術)."],
        ["9:voodoo.(VOM).","null"],
        ["0:(VOM).","0:[SCInfo].0:初期化.0:(本線)."],
        ["一致なし.(本線).","0:[SCInfo].0:初期化.0:(本線)."],
        ["91:一致なし.(本線).","null"],
        ["999:[なし].*.(本線).","null"],
        ["*.*.(本線).","2:[newJobName].5:彩色.0:(本線)."],
        ["0.*.(本線).","0:[彩色発注].5:彩色.0:(本線)."]
    ];
    for (var i = 0;i< testItems.length ; i ++){
        var result = xUI.XMAP.pmu.nodeManager.getNode(testItems[i][0]);
        if( result ){
            if( result.getPath() == testItems[i][1]){
                console.log(i +" : OK");
            }else{
                console.log(i + ": NG : " +testItems[i].join() +' : '+ result.getPath());
            }
        }else{
            if (testItems[i][1] == "null"){
                console.log(i +" : OK");
            }else{
                console.log(i + ": NG : " +testItems[i].join() +' : '+ result)
            }
        }
    }

*/
/**
 *   ノードパスをキーとしてノードオブジェクト|ステージ|ラインを返す
 *   明確に指定されたノードが存在しない場合はnullを返す(IDが不一致)
 *   空白,未指定は開始ノード 、 * は最終ノードを示す（エラーでない）
 *
 *   検索に失敗した場合はnull
 *   ライン、ステージが必要な場合は、ノード内のリンクをたどって使用することも可能
 *   ノードパスは、文字列型、数値型、フルスペックのいずれでも良い
 *   フルスペックの場合　名称→数値　の順位で解決が行われる
 *   名称が一致した場合、数値IDが無視される場合があるので注意
 *   数値優先の場合は、.getNode メソッドを使用すること
 *  @params {String}    nodepath
 *      ノードパス文字列
 *  @returns {Object nas.Pm.ManagementJob | null}
 */
nas.Pm.NodeManager.prototype.getNodeByNodepath = function(nodepath){
    nodepath = nas.Pm.parseNodePath(nodepath);//仮オブジェクトにパースして正規化　ManagementNodeを取得
//ライン抽出(直接指定しない限りコンポジットノードは指さない)
    if(String(nodepath.path[0])=='*'){
        nodepath.line.put(this.lines[this.lines.length-1].get());//通常ライン終端
    }else if(String(nodepath.path[0]).match(/^\s*$/)){
        nodepath.line.put(this.lines[0].get());//本線
    }
    var currentLine = this.lines.find(function(elm){ return (elm.name == nodepath.line.name);});
    if(!currentLine) currentLine = this.lines.find(function(elm){ return (elm.id.join('-') == nodepath.line.id.join('-'));});
//console.log(currentLine)
    if((nodepath.spcl == 1)||(! currentLine)) return currentLine;
//ステージ抽出
    if(String(nodepath.path[1])=='*'){
//console.log('set stage end');
        nodepath.stage.put(currentLine.stages[currentLine.stages.length-1].get());//ライン終端ステージ
    }else if(String(nodepath.path[1]).match(/^\s*$/)){
//console.log('set stage start');
        nodepath.stage.put(currentLine.stages[0].get());//ライン開始ステージ
    }
//console.log(nodepath.stage);
//    if(String(nodepath.path[1]).match(/^\*$|^\s*$/)) nodepath.stage.put(currentLine.stages[currentLine.stages.length-1].get());
    var currentStage = currentLine.stages.find(function(elm){return (elm.name == nodepath.stage.name);});
    if(! currentStage) currentStage = currentLine.stages.find(function(elm){return (elm.id == nodepath.stage.id);});
//console.log(currentStage)
    if((nodepath.spcl == 2)||(! currentStage)) return currentStage;
//ジョブ抽出
    if(String(nodepath.path[2])=='*'){
        nodepath.job.put(currentStage.jobs[currentStage.jobs.length-1].get());//ステージ終端ジョブ
    }else if(String(nodepath.path[2]).match(/^\s*$/)){
        nodepath.job.put(currentStage.jobs[0].get());//ステージ開始ジョブ
    }
    var currentNode = currentStage.jobs.find(function(elm){return (elm.name == nodepath.job.name);});
    if(!currentNode) currentNode = currentStage.jobs.find(function(elm){return (elm.id == nodepath.job.id);});
    return currentNode;
;// */
/*    for(var nix=(this.nodes.length-1);nix>=0;nix--){
        var item = this.nodes[nix];
        if(
            (item.getPath()         == nodepath.job.getPath())||
            (item.getPath('name')   == nodepath.job.getPath('name'))||
            (item.getPath('id')     == nodepath.job.getPath('id'))
        ){
            if(nodepath.spcl == 1) return item.stage.parentLine;
            if(nodepath.spcl == 2) return (nodepath.path[1]=="*")? item.stage.parentLine.stages[item.stage.parentLine.stages.length-1]:item.stage;
            return item;
        }else if (
            (nodepath.name == undefined)&&(
                (item.stage.getPath()       == nodepath.stage.getPath())||
                (item.stage.getPath('name') == nodepath.stage.getPath('name'))||
                (item.stage.getPath('id')   == nodepath.stage.getPath('id'))
            )
        ){
            if(nodepath.spcl == 1) return item.stage.parentLine;
            if(nodepath.spcl == 2) return (nodepath.path[1]=="*")? item.stage.parentLine.stages[item.stage.parentLine.stages.length-1]:item.stage;
            return item;
        }else if (
            (nodepath.stage.name == undefined)&&(
                (item.stage.parentLine.getPath()        == nodepath.line.getPath())||
                (item.stage.parentLine.getPath('name')  == nodepath.line.getPath('name'))||
                (item.stage.parentLine.getPath('id')    == nodepath.line.getPath('id'))
            )
        ){
            if(nodepath.spcl == 1) return item.stage.parentLine;
            if(nodepath.spcl == 2) return (nodepath.path[1]=="*")? item.stage.parentLine.stages[item.stage.parentLine.stages.length-1]:item.stage;
            return item;
        }
    }:// */
    return null;
}
/*TEST

    var testItems =[
        ["*.原画.(本線):0."  ,"3:[原画作監チェック].2:原画.0:(本線)."],
        ["3.2.0."           ,"3:[原画作監チェック].2:原画.0:(本線)."],
        ["3:.2:.0:."           ,"3:[原画作監チェック].2:原画.0:(本線)."],
        ["原画作監チェック.原画.本線."    ,"3:[原画作監チェック].2:原画.0:(本線)."],
        [".原画.本線."    ,"0:[作画打合せ].2:原画.0:(本線)."],
        ["原画.本線."    ,"2:原画.0:(本線)."],
        [".本線."    ,"0:初期化.0:(本線)."],
        ["*.本線."    ,"5:彩色.0:(本線)."],
        ["*."    ,"1:(背景美術)."],
        ["9:voodoo.(VOM).","null"],
        ["0:(VOM).","0:(本線)."],
        ["一致なし.(本線).","0:初期化.0:(本線)."],
        ["91:一致なし.(本線).","null"],
        ["999:[なし].*.(本線).","null"],
        ["*.*.(本線).","2:[newJobName].5:彩色.0:(本線)."],
        ["0.*.(本線).","0:[彩色発注].5:彩色.0:(本線)."]
    ];
    for (var i = 0;i< testItems.length ; i ++){
        var result = xUI.XMAP.pmu.nodeManager.getNodeByNodepath(testItems[i][0]);
        if( result ){
            if( result.getPath() == testItems[i][1]){
                console.log(i +" : OK");
            }else{
                console.log(i + ": NG : " +testItems[i].join() +' : '+ result.getPath());
            }
        }else{
            if (testItems[i][1] == "null"){
                console.log(i +" : OK");
            }else{
                console.log(i + ": NG : " +testItems[i].join() +' : '+ result)
            }
        }
    }
*/
/*
    ノードパスを指定してノードを削除
    削除可能なノードは、各ラインの最終ノードのみ
    子供がすべて消失したステージ　ラインはそれ自体を削除する
    本線ラインは削除不可
*/
nas.Pm.NodeManager.prototype.removeNode = function(nodepath){
    var targetNode  = this.getNode(nodepath);
    var targetStage = targetNode.stage;
    var targetLine  = targetStage.parentLine;
    if( (targetNode)&&
        (targetStage.jobs[targetStage.jobs.length-1]===targetNode)&&
        (targetLine.stages[targetLine.stages.length-1]===targetStage)
    ){
        targetNode.stage.jobs.pop();
        if(targetStage.jobs.length == 0){
            targetLine.stages.pop();
            if(targetLine.stages.length == 0){
                var lineIx = this.lines.indexOf(targetLine);
                this.lines.splice(lineIx,1);
            }
        } 
        var nodeIx=this.nodes.indexOf(targetNode);
        this.nodes.splice(nodeIx,1);
        return true;
    }
    return false;
}
/*
    ノードパスを指定してアクティブにする。
    ノードパスが完全でない場合はカレントの値で補われる
    ラインの変更はできない
 */
//ラインオブジェクト登録 クラスメソッド
/**
 *<pre>
 *	ノードマネージャーのライン登録メソッドはIDの管理を行う
 *	nas.Pm.lines[キーワード]  から複製をとってプロパティを追加する
 *  不正なラインIDが指定された場合、及びラインIDが指定されない場合登録は失敗する（return null）
 *  飛び番のIDは認められない。
 *  ノードマネージャー上で出力アセットが、タイムシートを持っている場合、マネージャにコンポジットラインを自動で生成する
 *  すでにノードマネージャに同ラインが設定されてる場合はNOP
 *  ライン記述は "0-0:(Composite)"に固定
 *	</pre>
 *  @params {String}    lineDescription
 *      ライン記述子　正順及び逆順記述どちらでも良い
 *  @params {Object nas.Pm.ManagementJob}   branchNode
 *      オプショナルブランチ元ノード
 *  @params {Array} deregetions
 *      グループ名配列
 *  @example
 *      var 
 *      var current = nas.xMap.pmu.nodeManager.new_ManagementLine("(本線):0");
 *      var current = nas.xMap.pmu.nodeManager.new_ManagementLine("(背景美術):1");
 *      var current = nas.xMap.pmu.nodeManager.new_ManagementLine("1-1:(美術3D)");
 *      var current = nas.xMap.pmu.nodeManager.new_ManagementLine("(3D-CGI):2");
 *      var current = nas.xMap.pmu.nodeManager.new_ManagementLine("(3D-MOD):2:2");
 *
 ***    nas.xMap.pmu.nodeManager.new_ManagementLine("(Compotite):");
 *  IDを与えずに初期化されたコンポジットラインは、デフォルトの統合ラインになる
 *  明示的な初期化は不要
 *   IDを与えずに初期化することも可能とする
 *  @returns    {Object ManagementLine|null}
 *      コレクション登録されたManagementLine　登録失敗の場合にはnull

lineDescription,parentTrailer,branchNode,deregations
 */
nas.Pm.NodeManager.prototype.new_ManagementLine = function(lineDescription,branchNode,deregations){
//    return new nas.Pm.ManagementLine(lineDescription,this);
    var newManagementLine = new nas.Pm.ManagementLine(
        lineDescription,
        this,
        branchNode,
        deregations
    );
    if( (! this.composite) && (newManagementLine)&&
        (newManagementLine.line instanceof nas.Pm.ProductionLine)&&
        (nas.pmdb.assets.entry(newManagementLine.line.outputAsset))&&
        (nas.pmdb.assets.entry(newManagementLine.line.outputAsset).hasXps)
    )   new nas.Pm.ManagementLine('0-0:(合成)',this);
    return newManagementLine;
}
//新規ステージオブジェクト登録
/*
	ステージ名は登録されたキーワード
	ライン種別によって登録可能なステージが異なるのでフィルタリングが必要
	ステージオブジェクトに親をもたせたほうが良いかもしれない
*/
nas.Pm.NodeManager.prototype.new_ManagementStage = function(stageDescription,parentLine){
    if(stageDescription)
    return new nas.Pm.ManagementStage(stageDescription,parentLine);
}
//新規ジョブオブジェクト登録
/*
ジョブは新規に作成
parentStageはオブジェクトでもステージ記述でも良い
判定してオブジェクト化する　不正オブジェクトの場合は登録失敗
id||typeの管理を行う
*/
nas.Pm.NodeManager.prototype.new_Job = function(jobDescription,parentStage){
    if(! parentStage instanceof nas.Pm.ManagementStage){
        parentStage = this.getNode(parentStage).stage;
    }
    if(jobDescription.match(':')){}
//    console.log([jobDescription,parentStage]);
	var newJob = new nas.Pm.ManagementJob(jobDescription,this,parentStage);
		return newJob;
}
/*
 ManagementNodeオブジェクトは、Mapデータの内部で進捗情報を受け持つ
ｘMap.manager=new nas.xMap.xMap.ManagementNode()
	マネジメントノードの役割は
ライン・ステージ・ジョブの情報を持つ
各オブジェクトは「ジョブ」に対応する（type は不要）  管理ノードは  ステージ／ラインプロパティを持ったJOBのみ
ステージは  アセットにリレーション

ステージスターター（アセット）ステージを開始するアセットがある  特定ステージの出力
ステージアウトプット  ステージはアウトプットで終了する
ステージのアウトプットは、ジョブのアウトプットである
最終ジョブのアウトプットが常にステージのアウトプットとなる
ジョブのアウトプットがステージアウトプットの条件を満たすか否かの判定は、判定権限者が行う。
実質上  次の工程の開始を持って判定が行なわれたものとみなす。

ラインに関して
（本線）以外のラインは、命名時に最終想定目的アセットの名前を持ってライン名にすることを推奨
例えば  3DAnimationアセットを期待されるラインは「3DAnimation」
背景美術上がりを期待されるラインは「背景美術」となる
ラインの名前はプリセットの他はライン立ち上げ時に新しく定義が行なわれ、DBの更新がなされるものとする
（本線）は「CELL」ラインでもある
  ラインの初期化に当たってライブラリ内部では、エイリアスでの初期化を許す
その仕組を作りこむ必要あり

 */
 /*
 	アセットオブジェクト
 	管理上のアセット
 	アセットは複数のステージを呼び出すことが出来る
 	実際の起動はユーザが行い、起動される度にPMUのラインが増える
	実運用上は外部DBから供給されるデータで初期化する
	アセットのアクセスは以下のように
	nas.Pm.assets["キーワード"]  又は	nas.Pm.assets("アセット名")
	
	アセットが呼び出し可能なステージの一覧は
	配列  asset.callStage に識別文字列で格納（オブジェクトでない）
	アセットのプロパティは
	name	表記名
	shortName	短縮名
	code	コード
	description  概要
	hasXPS/bool	タイムシートを持つか否か
	endNode/bool	ラインを終了することが出来るか否かのフラグ
	callStage/array	呼び出し可能ステージ種別

	コンストラクタ他のメンテナンス系コードは保留

 */
nas.new_ManagementAsset = function(assetTypeName,assetProps,myStages){
	var newAsset=Object.create(nas.Pm.assets[assetTypeName]);//=assetProps;
	newAsset.callStage=myStages;
	//ステージオブジェクトコレクション選択可能なステージキーワードを列記したものを与える
	return nas.Pm.assets[assetTypeName];
}

/**
 *  @constractor
 *<pre>
 *  var PMU = new PmUnit(scObjects);
 *  カット袋に相当するワークキャリア（ワークトレーラー）
 *  SCiオブジェクトを配列で与えて初期化する。
 *  複数オブジェクトを持つ場合は 兼用カットとして処理する
 *  クラスメソッドを使って後から編集可能
 *  カット番号等のムービー内での識別情報が複数入っている
 *  また、集合全体の進捗情報が格納されている
 *  作品情報・管理フラグ・カットコレクション・進捗情報・素材DBを持つ
 *  素材DBはPMUと関連付けられたxMapが保持する。
 *  管理情報をこのユニットが受け持つ
 *  基本的にxMap|Xpsオブジェクトのプロパティとして管理する
 *  Xpsに使用する場合は初期引数の第一引数でカットを指定するか、またはcut && sceneを上書きで調整すること
    </pre>
 *  @params {Object xMap|Object Xps} parentData
 *      参照するxMap|Xps またはデバッグ用に null
 *  @params {Array of SCi|String}  mySCs
 *      カット情報オブジェクトの配列
 */

nas.Pm.PmUnit = function(parentData,productIdentifier){
    this.parent       = parentData;//{Object xMap|XPS} parentData
    this.currentNode  = null      ;//表示（編集）対象ノード
    this.checkinNode  = null      ;//チェックイン時のみ値がある

    this.product        ;//
    this.cut            ;//参照 代表カット
    this.scene          ;//参照 代表カットのシーン
//サブタイトル記述はDBと接続のない場合は別途入力するか、又は空白のまま保留
    this.title          ;
    this.opus           ;
    this.subtitle       ;//参照
    this.inherit        = []      ;//{Array of SCi}
    this.pmdb           = nas.pmdb;//{Object nas.Pm.PmDomain}
    this.nodeManager    = new nas.Pm.NodeManager(this);//{Object nas.Pm.NodeManager}
    this.issues         = new nas.Pm.LineIssueCollection(new nas.Pm.Issue("trunc",0),this);//{Object nas.Pm.LineIssueCollection}
//編集可能プロパティリスト
/*
  "pmdb"            : 編集禁止（書き換え対象外）
  "parent"          : 編集禁止（書き換え対象外）
  "currentNode"     : 編集禁止（一時データ）
  "checkinNode"     : 編集禁止（一時データ）
  "nodeManager"     : {    "get": "toString",    "put": "put"  },//get|putを拡張する
  "issues"          : {    "get": "toString",    "put": "put"  },//get|putを拡張する
*/
this.exList = {
  "inherit"         : { "get": "JSON"         , "put": ""  },
  "product"         : { "get": "JSON"         , "put": ""  },
  "cut"             : { "get": "toString"     , "put": ""  },
  "scene"           : { "get": "toString"     , "put": ""  },
  "title"           : { "get": "toString"     , "put": ""  },
  "opus"            : { "get": "toString"     , "put": ""  },
  "subtitle"        : { "get": "toString"     , "put": ""  }
};
//識別記述あればパースして初期化　TKHG31PBR
    if (productIdentifier) {this.setProduct(productIdentifier);}else{this.setProduct('#');}
}
/*TEST
    xUI.XMAP.pmu.get("inherit");
*/
/** 
 *    編集のためのデータ出力メソッド
 *  @params {String}    output
 *         値を取得するアドレスまたはキーワード
 *         プロパティ名　または　ワイルドカード "*"　または
 *         
 *  @returns {String}
 *         contents put　メソッドに引き渡し可能な文字列出力
 */
nas.Pm.PmUnit.prototype.get = function (output){
//引数をオブジェクト化
	if(! output) return false     ;//ターゲットがない場合は失敗
console.log(output);
	if(output.indexOf('nodeManager.')==0){
		output = output.replace(/^nodeManager\./,'');
console.log("call nodeManager.get");
		return this.nodeManager.get(output);//nodeManagerへ渡す
	}else if(output.indexOf('issues.')==0){
		output = output.replace(/^issues\./,'');
console.log("call issues.get");
		return this.issues.get(output);//issuesへ渡す
	}
//編集可能プロパティリストは、親オブジェクトのプロパティ this.exListとして保持
/*
	getメソッドは
		JSON
			JSON.stringify(<target>)
		direct
			String(<target>)
		toString|dump
			<target>[<getMathodFunction>]()
*/
//変換テーブルに値のないプロパティは、書き込み不能なので失敗
	if(! this.exList[output]) return false;
//アドレスから現データを取得
	var targetProp   = this[output];
	if(output == "*") targetProp = this;//特例
//文字列化した値で（ディープコピー）取得
	var currentValue;
	if(this.exList[output].get == 'JSON'){
		currentValue = JSON.stringify(targetProp);
	}else if(this.exList[output].get == 'direct'){
		currentValue = String(targetProp);
	}else if(targetProp[this.exList[output].get] instanceof Function){
		currentValue = targetProp[this.exList[output].get]();
	}else {
		currentValue = targetProp;
	}
//値文字列を返す
    return currentValue;
};// PmUnit.get
/** 
 *    編集のためのデータ入力メソッド
 *  pmuの親オブジェクトがxMap|Xpsであった場合の関連データの同期は、バックグラウンド処理へ持ち越し
 *  バックグラウンドの同期メソッドの呼び出しは可能に xUI.documents.sync(tgt,dst) 2020.06.25
 *  関連付けられたすべてのドキュメントのプロパティに影響を及ぼす
 *  @params {String}    input
 *         入力オブジェクトまたはアドレス｜キーワード
 *  @params {String}    content
 *         入力（書換）内容　文字列データ
 *  @returns [Array]
 *  [書き込みプロパティアドレス,書き込み前の値,書き込み後の値]
 */

nas.Pm.PmUnit.prototype.put = function (input,content){
//引数をオブジェクト化
    var inputUnit = input;
    if(arguments.length > 1) inputUnit = {address:input,value:content};
    if(! inputUnit.address) return false     ;//ターゲットがない場合は失敗
    if(inputUnit.address.indexOf('nodeManager.')==0){
        inputUnit.address = inputUnit.address.replace(/^nodeManager\./,'');
        return this.nodeManager.put(inputUnit);//nodeManagerへ渡す
    }else if(inputUnit.address.indexOf('issues.')==0){
        inputUnit.address = inputUnit.address.replace(/^issues\./,'');
        return this.issues.put(inputUnit);//assetStoreへ渡す
    }

//変換テーブルに値のないプロパティは、書き込み不能なので失敗
    if(! this.exList[inputUnit.address]) return false;
//アドレスから現データを取得
    var targetProp   = this[inputUnit.address];//Object代入
    if(inputUnit.address == "*") targetProp = this;//特例
    var previousValue = this.get(inputUnit.address);//ディープコピーを取得
    var putMethod = this.exList[inputUnit.address].put;//書き込み用メソッドを取得
    if(putMethod == 'direct'){
        this[inputUnit.address] = inputUnit.value;//直接代入
    }else if(this[inputUnit.address][putMethod] instanceof Function){
        this[inputUnit.address][putMethod](inputUnit.value);//メソッドで書き込み
    }else{
//putメソッドが指定されないプロパティは本メソッド内で処理を実行する
        switch(inputUnit.address){
        case 'inherit':
//inheritはSCiオブジェクトの配列で、全体のバルク書き換えのみをサポートする
            var ipts = JSON.parse(inputUnit.value);
            if (this.inherit.length > ipts.length) this.inherit.length = ipts.length;
            for(var i=0;i<ipts.length;i++){
                if(! this.inherit[i]){
                    this.inherit[i] = new nas.Pm.SCi(
                        ipts[i].name,
                        ipts[i].product,
                        ipts[i].time,
                        ipts[i].trin,
                        ipts[i].trout
                    );
                }
                this.inherit[i].cut      = ipts[i].cut;
                this.inherit[i].framerate= ipts[i].framerate;
                this.inherit[i].id       = ipts[i].id;
                this.inherit[i].name     = ipts[i].name;
                this.inherit[i].product  = ipts[i].product;
                this.inherit[i].scene    = ipts[i].scene;
                this.inherit[i].time     = ipts[i].time;
                this.inherit[i].trin     = ipts[i].trin;
                this.inherit[i].trout    = ipts[i].trout;
            }
            this.scene = ipts[0].scene;
            this.cut   = ipts[0].cut;
        break;
        case 'cut':
        case 'scene':
console.log(targetProp);//スカラであった場合値が入るので入力できないことに注意
            this[inputUnit.address]            = inputUnit.value;
            this.inherit[0][inputUnit.address] = inputUnit.value;
            this.inherit[0].name   = this.inherit[0].toString('cut');
        break;
        case 'opus':
            this.opus     = (nas.pmdb.products.entry(this.product.title+"#"+inputUnit.value))?nas.pmdb.products.entry(this.product.title+"#"+inputUnit.value):new nas.Pm.Opus(this.product.title+"#"+inputUnit.value+"["+this.product.subtitle+"]");
            this.product.opus = this.opus.name
        break;
        case 'subtitle':
            this.subtitle            = inputUnit.value;
            this.product.subtitle    = inputUnit.value;
        break;
        case 'title':
            this.title = (nas.pmdb.workTitles.entry(inputUnit.value))? nas.pmdb.workTitles.entry(inputUnit.value):new nas.Pm.WorkTitle(inputUnit.value);
            this.product.title          = this.title.projectName;
        break;
        case 'product':
            this.product = JSON.parse(inputUnit.value);
            this.title = (nas.pmdb.workTitles.entry(this.product.title))? nas.pmdb.workTitles.entry(this.product.title):new nas.Pm.WorkTitle(this.product.title);
            this.opus     = (nas.pmdb.products.entry(this.product.title+'#'+this.product.opus))?nas.pmdb.products.entry(this.product.title+'#'+this.product.opus):new nas.Pm.Opus(this.product.title+"#"+this.product.opus+"["+this.product.subtitle+"]");
            this.subtitle = this.product.subtitle;
        break;
        default:
console.log('cannnot execute')
            return false;
        }
    }
//書き換え前後の値を比較して変更があれば（通常はある）parent.syncPmuPropsをコールする
    var newValue = this.get(inputUnit.address);
    if((previousValue != newValue)&&(this.parent)){
        this.parent.syncPmuProps();
    }
//戻り値は、書き込みに成功したレンジ
    return ["pmu."+inputUnit.address, previousValue, newValue];
};// PmUnit.put

/**
    pmUnitの内容をリセット
    親オブジェクトは切り替え禁止
    カレントノードクリア
    プロパティクリア
    pmdbクリア
    nodeManagerリセット
    issueコレクションリセット
*/
nas.Pm.PmUnit.prototype.reset = function(){
    this.currentNode      = null;//表示（編集）対象ノードノードマネージャーのりセットで更新される
    this.checkinNode      = null;//チェックイン時のみ値がある

    this.product     = undefined;//
    this.cut         = undefined;//
    this.scene       = undefined;//
    this.title       = undefined;//
    this.opus        = undefined;//
    this.subtitle    = undefined;//参照
    this.inherit.length = 0     ;//{Array}
    this.pmdb        = nas.pmdb ;//{Object nas.Pm.PmDomain}
    this.nodeManager.reset()    ;//{Object nas.Pm.NodeManager}
    this.issues         = new nas.Pm.LineIssueCollection(new nas.Pm.Issue("trunc",0),this);
}


/** 与えられたpmUnitのプロパティを自身にマージする
    マージするUnitは同じプロダクトである必要がある
    チェックイン中のデータにはいかなるマージも不可
    マージ先・マージ元を破壊するので、ターゲット引数は複製を推奨
    @params {Object nas.Pm.PmUnit}  target
    
*/
nas.Pm.PmUnit.prototype.merge = function(target){
//基本情報の同一性を確認
    if( (this.checkinNode )||(target.checkinNode )||
        (nas.Pm.compareIdentifier(this.getIdentifier(),target.getIdentifier(),true,false) < 0)
    ) return {status:false};
//兼用情報をマージ
    var inheritCount = this.inherit.length;
    for (var ix = 0; ix < target.inherit.length ; ix ++){
        this.inherit.add(
            target.inherit[ix],
            function(tgt,dst){return (nas.Pm.compareCutIdf(tgt.name,dst.name) == 0)}
        );
    }
    if(inheritCount < this.inherit.length){
//追加発生
        this.inherit.sort(numSorter);
        this.cut   = this.inherit[0].cut;
        this.scene = this.inherit[0].scene;
    }
//ノードをマージ
    var nodemerged = this.nodeManager.merge(target.nodeManager);
//マージ完了　
    if(nodemerged.status){
console.log('pmunit merged');
//カレントノードを本線最終ステージ最終ノードへ移行
        this.currentNode = this.nodeManager.getNode('*.*.0.');
        if (this.parent.syncPmuProps) this.parent.syncPmuProps();
    }
    return nodemerged;
}
/**
 *    PmUnitにプロダクト情報をセットするメソッド
 *    @params {String}    productIdentifier
 *    プロダクト識別子を引数で与える
 *    @example
 *        pmu= new nas.Pm.Pmunit("Title#Ep[Subtitle]//s-cCUT(1+12)/s-cCUT2(3_18)//");
 *    pmuの親オブジェクトがXpstであった場合は代表カット番号が親オブジェクトのプロパティになり、兼用情報はソートされる
 *    pmuの親オブジェクトがxMapで、かつ
 *    セット後に親オブジェクトのsyncPmuPropsメソッドを実行する
 */
nas.Pm.PmUnit.prototype.setProduct = function(productIdentifier){
console.log('pmu set product info :\n' + decodeURIComponent(productIdentifier));
    var parseData = nas.Pm.parseIdentifier(productIdentifier);
console.log(parseData);
    if(parseData.asExtra){
        this.product        = '';//
        this.cut            = parseData.uniqekey;//
        this.scene          = '';//
        this.title          = '';//
        this.opus           = '';//
        this.subtitle       = '';//
        this.inherit        = '';//
        this.pmdb           = nas.pmdb;
    }else{
        this.product        = parseData.product;//
        this.cut            = parseData.cut;    //
        this.scene          = parseData.scene;  //参照　代表カットのシーン
//サブタイトル記述はDBと接続のない場合は別途入力するか、又は空白のまま保留のこと
        this.title          = nas.pmdb.workTitles.entry(parseData.title);
        if(! this.title ) this.title = new nas.Pm.WorkTitle(parseData.title);//{Object nas.Pm.ProductTitle}
        this.opus           = ((this.title instanceof nas.Pm.WorkTitle)&&(this.title.opuses.entry(parseData.opus)))?
        this.title.opuses.entry(parseData.opus):parseData.opus;//{Object nas.Pm.ProductOpus|String}
        this.subtitle       = parseData.subtitle;//参照
        this.inherit        = parseData.sci;//{Object SciCollection|String}
    };
    var mNode = (parseData.mNode)? parseData.mNode:undefined;
    if(appHost.ESTK){
        this.pmdb = (this.opus instanceof nas.Pm.Opus)? this.opus.pmdb:nas.pmdb;//直接参照する
    }else{
        this.pmdb = (this.opus instanceof nas.Pm.Opus)? Object.create(this.opus.pmdb):Object.create(nas.pmdb);//{Object nas.Pm.PmDomain}
    };
    this.nodeManager.reset(mNode);
    this.issues         = new nas.Pm.LineIssueCollection(new nas.Pm.Issue("trunc",0),this);//{Object nas.Pm.LineIssueCollection}
    if((this.parent)&&(this.parent.syncPmuProps)&&(this.parent.pmu === this)) this.parent.syncPmuProps();
    return parseData;
}
/**
    制作管理単位の内容ダンプメソッド
    @params {String}    exportForm
    引数：　form 文字列可形式 xml,plain,dump,JSON
    指定がない場合は　Sciオブジェクトのリストを"/（スラッシュ）"で区切って戻す
*/
nas.Pm.PmUnit.prototype.toString = function(exportForm){
    if(! exportForm){
        return this.inherit.join("/");
    }else{
        return "yet coding";
    }
//toString()メソッドは、出力用に調整する
//
}
/** <pre>
 * ドキュメントのカット識別子を返すオブジェクトメソッド
 * PmUnit.getIdentifier(識別オプション,兼用インデックス)
 * カット識別文字列を返す
 * 兼用情報は以下のようにカット番号を単一セパレータで列挙
 *
 *   s-cXXX(S+K)(wipe(1+18))(OL(3+12))_s-cXXX(S+K)_s-cXXX(S+K) 兼用識別
 *
 * カット識別子はタイトル、制作番号、シーン、カット番号等の各情報をセパレータ"_"で結合した文字列
 * カット番号以外の情報はデフォルトの文字列と比較して一致した場合セパレータごと省略
 * オプションで要素の結合状態を編集して返す
 * オブジェクトメソッドはドキュメントのステータスを返さないので、ステータスを必要とする場合はクラスメソッドを利用のこと
 *
 *   セパレータ文字列は[(__)#\[]
 *   出力仕様はクラスメソッド互換
 *   オブジェクトメソッドを利用する場合はURIEncodeを使用しないプレーン文字列でやり取りが行われるものとする
 *   旧:     TITLE_OPUS_SCENE_CUT
 *   新:     TITLE#OPUS[subtitle]__sSCENE-cCUT(time)
 *  旧形式に出力を統一するフラグは Pmオブジェクトに持たせる
 *  
 *   基本的に「結合文字列をファイル名として使用できる」「ユーザ可読性がある」ことを前提にする
 *      プロダクションIDとSCiは"__(二連アンダーバー)"でセパレートする
 *      部分エンコーディング
 *      各要素は、自身の要素のセパレータを含む場合 '%' を前置して部分的にURIエンコーディングを行う
 *      要素の文字列は識別子をファイル名等に利用する場合、ファイルシステムで使用できない文字が禁止されるが、この文字も併せて部分エンコードの対象となる。
 *      対象文字列は、Windowsの制限文字である¥\/:*?"<>| に加えて . 及びエンコード前置文字の %
 *      (これらは関数側で記述)
 *      
 *  TITLE       "#"が禁止される
 *  OPUS        "#","[","__" が禁止される
 *  subtitle    "[","]","__"が禁止される
 *  SCi         "__","("が禁止される
 *</pre>
 *   @params {String} [full|episode|cut|simple|complex|xps] opt
 *
 *   'full' 全ての要素を含む識別文字列で返すタイトル文字列はフルネーム
 *          TITLE#OPUS[subtitle]__sSCENE-cCUT(time){_sSCENE-cCUT(time)}..
 *   'episode'
 *          #OPUS[subtitle]
 *   'cut'
 *          #OPUS__sSCENE-cCUT{_sSCENE-cCUT}..
 *   'simple'　全識別子となるがタイトルはコードを使用　カット時間は省略される
 *          TITLE#OPUS__sSCENE-cCUT{_sSCENE-cCUT}..
 *   'complex'   全識別子　タイトルはショートネームを使用　カット時間は省略
 *          TITLE#OPUS[subtitle]__sSCENE-cCUT{_sSCENE-cCUT}...
 *   
 *   @params {number}  [number:0]  index
 *      opt:'xps' の際のみ有効  呼び出す兼用カットのID
 *   @returns {string}
 */
nas.Pm.PmUnit.prototype.getIdentifier = function (opt,index) {
//console.log(this);
    var myResult="";
    var unitList = [];
    if(this.inherit.length){
        var stringOpt = (opt=='full')? 'time': 'cut';
        for (var cix = 0 ;cix<this.inherit.length;cix++){unitList.push(nas.IdfEncode(this.inherit[cix].toString(stringOpt),"_"))};
    }else{
//        unitList = (this.parent.cut=='_EXTRA_')? [this.parent.name]:["%no_name%"];
        unitList = (this.parent.extraAsset)? [this.parent.name]:[];
    }
    switch (opt){
    case 'cut':
        myResult = this.title.code+'#'+nas.IdfEncode(this.product.opus,"#_\[")+'__'+unitList.join('_');
    break;
    case 'simple':
        myResult = this.title.code+'#'+nas.IdfEncode(this.product.opus,"#_\[")+'__'+unitList.join('_');
    break;
    case 'complex':
        myResult = nas.IdfEncode(this.title.shortName,"#")+'#'+nas.IdfEncode(this.product.opus,"#_\[");
        if(this.subtitle) myResult += '['+nas.IdfEncode(this.subtitle,"\[\]_")+']';
        myResult += '__'+unitList.join('_');
    break;
    case 'episode':
        myResult=this.title.code+'#'+nas.IdfEncode(this.product.opus,"#_\[");
        if(this.subtitle) myResult += '['+nas.IdfEncode(this.product.subtitle,"\[\]_")+']';
    break;   
    case 'xps':
        if(! index) index=0; index = parseInt(index % this.inherit.length);
        myResult = nas.IdfEncode(this.title.name,'#')+'#'+nas.IdfEncode(this.product.opus,"#_\[");
//       if(this.subtitle) myResult += '['+nas.IdfEncode(this.subtitle,"\[\]_")+']';
        myResult += '__'+this.inherit[index].toString();
    break;
    case 'full':
    default    :
        myResult = nas.IdfEncode(this.title.fullName,"#")+'#'+nas.IdfEncode(this.product.opus,"#_\[");
        if(this.subtitle) myResult += '['+nas.IdfEncode(this.subtitle,"\[\]_")+']';
        myResult +='__'+unitList.join('_');
    }
//    if((this.parent instanceof nas.xMap)&&(opt != 'xps')) myResult += '.xmap'
    return myResult;
};
/**
 *   管理単位のステータスを取得する
 *  管理単位自体は自身のステータスプロパティをもたず、ノードマネージャーにトランクラインの最新ステータスを請求する
 */
nas.Pm.PmUnit.prototype.getStatus = function(){
    var currentStatus = this.nodeManager.getStatus('0.');
    return currentStatus;
}
/*
nas.xMap.currentNode
	廃止　下記に統合
pmu.currentNode
	プロパディとしてはリードオンリーにしてユーザによる操作を直接は受け付けないようにする
	現在フォーカスのあるノードを指すプロパティ
	アセットブラウザのセレクタの操作でコントロールされる
	アセットブラウザの状態が反映されるようにする
	チェックイン操作を行う対象ノード
	必要なプロセスはこのプロパティを直接アクセスする
pmu.checkinNode
	nullで初期化
	閲覧状態では常にnull
	編集時に編集中のノードがポイントされる
	チェックアウト時にクリア
pmu.nodeManager.currentNode
	廃止　上記に統合

pmu.chackin(対象ライン記述、ステージ記述、ノード記述または　ノードオブジェクト)
	チェックインメソッド
	引数がない場合はカレントノードに対してチェックインを試みる
	ライン記述、ステージ記述が指定された場合は各末端ノードに対するチェックインを試みる
	チェックイン対象がラインの末端ノードではない場合はチェックインは失敗
	成功した場合はノードの含まれるラインを専有（排他）状態にしてデータを更新（払い出し）を行う
	リポジトリ内のデータはリポジトリに対する払い出し
	フローティングデータでは、データファイルが存在すればファイルに、ファイルが無ければデータ自身に対する記録のみを行う

	フローティングデータの位置づけが変更　フローティングデータであってもライン管理は行われる
	より上層のstbd|pmdbに対する働きかけが無くなる


pmu.checkinNod が存在するデータはチェックイン中のオブジェクトである
オブジェクトとして複数のチェックインはサポートされない

記録データとしては末端ノードのステータスが、現在の「プロダクションラインチェックイン」状況を示す
node.jobStatus.content
同ステータスの最終ユーザ情報がログインユーザと一致している場合、アプリケーション再アクティベート可能な状態となる
ディアクティベートでアクティブ化されたデータはチェックイン状態となる

アプリケーションチェックイン状態でのみデータ編集が可能



xMapにチェックインした際、同時にすべての所属Xpsにチェックインすべきか？　　ーー＞　NO

トラフィックが増加する　手続きが増加してエラーの可能性が高まるので可能な限りチェックイン・アウトの手続きを減らすのが望ましいためここでは同時のすべてのデータにチェックインするのは避ける
そもそもXpsへのチェックインを必須としない方向で構成する。

どのタイミングで手続を行うか
Xpsは、データにチェックインリクエスト（編集要請）があった時点で、チェックイン済みのxMapの配下のステージ・ジョブにチェックインが行われる

その際に再アクティベートリスエストを除き新規のJob(Xps）が新規作成される。

再アクティベート時は、最後のJobがアクティベートされる

変更のないカットはチェックアウトの時点でタイムシートの保存をスキップする＞＞これは取りやめ　変更がない場合はそもそもアクティベートされない
一旦アクティベートされたらユーザが異なるのでシートコンテンツに変更がなくとも新規のXpstとして保存対象

親（所属xMap）のチェックイン状態を確認して自動で手続きを代行する

    Startup|Active|Hold|Fixed|Completed|Aborted//Floating

Floatingステータスの位置づけが変わる
jobStatus:各ラインはStartup|Active|Hold|Fixed|Completed|Abortedの７状態を遷移する（ラインステータス=最終ノードのJobStatsu）

documentStatus:ドキュメント単位でFloating|Storedの２状態をトグルで持つ
実際はnas.xMap.dataURLの値を見る　このプロパティが何らかの値を持っている場合はStored ない場合はFloationgデータとなる

	nas.xMap.dataNode
所属リポジトリの場所を記録する
リポジトリ単位で pmdbをもつので通常作業ではリポジトリが必須
Floatingデータの場合、リポジトリをもたずデフォルトのpmdbを使用する

ファイルシステム上のデータの場合は、リポジトリ（config.pmdb）を格納するフォルダのURLを使用する
	eg.
file:/dataStore/home/repository1/
file:c:\\dataStore\home\repository1\
https://drive.google.com/open?id=1xmDlqSagAliplQ0qnhr5fKdnnVtEsYHp
	等（未実装）

UATサーバ上のデータの場合

サーバURLとorganization.tokenを":"で連結した文字列
	eg.
https://remaping.scivone-dev.com:6kT3SX2Mg8Er1w63RhzgVfzH
	等

ローカルリポジトリの場合
単一のリポジトリのみ扱うので、識別が不用
識別情報として文字列".locaStorage:.localRepository."を置く

フローティングデータの場合
リポジトリをもたず独立したデータとして処理される。
dataNode プロパティを持たない あっても値は undefined　を置く
 */
/**
 *   xMapの場合チェックイン可能なノードは、終端ノードのみなので指定は不要
 *   チェックインリクエストがあるとxMapデータにチェックインを試みる
 *   チェックインが成功するとデータ整合性を確認して編集可能な状態を作成する
 *   必要に従いxMapに含まれるXpsのチェックインを行えるようになる
 *   Xpsの場合はチェックインターゲットに相当するノードを作成してチェックインを行う
 *   checkin操作は「現在のジョブを踏まえて、新規ジョブを作成してラインを専有する動作」と定義する
 *   チェックイン後のドキュメントステータスはアクティブ
 *   ドキュメントに同一の環境（クライアント）から同時に複数ラインへのチェックインは認められない
 *   メモリ上のドキュメントでチェックイン可能なラインは１つのみ
 *   
 *   @params {Object ManagementNode | String node-description} checkinTarget
 *   対象ノードパス　または　ノードオブジェクト
 *   @params {String job-description} nodeDescription
 *   対象ノードパス　または　ノードオブジェクト
 *   @params {Object nas.UserInfo} activeUser
 *   チェックインユーザ　値がないときは失敗
 *   @params   {Function}  callback
 *   処理終了時のコールバック関数 値が指定されない場合は定形処理
 *   @returns    {Object ManagementNode | null}  チェックイン成功時 新ステータスを持ったManagementNode:失敗時 null
 */
nas.Pm.PmUnit.prototype.checkin = function(checkinTarget,nodeDescription,activeUser){
//アクティブユーザ（UserInfo）が与えられない場合操作は失敗
    if(! activeUser instanceof nas.UserInfo) return null;
//アクティブユーザ（UserInfo）がチェックイン権限をもたない場合失敗
    //ここに判定を追加
//新規ノード記述（ジョブ名）が与えられない場合操作は失敗
    if(! nodeDescription) return null;
//引数がノードでない場合ノードを特定する
    if(! checkinTarget) checkinTarget = this.currentNode;//引数なし　現在のノードを設定
    if(!(checkinTarget instanceof nas.Pm.ManagementJob)){
//チェックイン対象がノードでない　
        checkinTarget = this.nodeManager.getNodeByNodepath(checkinTarget);
        if(!(checkinTarget instanceof nas.Pm.ManagementJob)){
console.log('ノードが得られなかった xxxxxxxx');console.log(checkinTarget);
            return null;//ノードが得られなかったので中断
        }
    }
    if(this.nodeManager.nodes.indexOf(checkinTarget) < 0){
console.log('ノードコレクションに存在しない');//Xpsの場合は正常
console.log([this.nodeManager.nodes,checkinTarget]);
console.log((this.nodeManager.nodes[0] === checkinTarget));

        if(this.parent instanceof nas.Xps){
            console.log(checkinTarget);
console.log((this.parent.xMap === xUI.XMAP));
//既存ノードではない&&Xpsである&&Xps.xMapのチェックインノードと指定がオブジェクトレベルで一致している（同一）
//チェックイン = xMapの状態に従った新規のXpsを作成して現行のデータと入れ替える
//タイムライントラック内容は先行データの複製から開始　作業開始後に必要なトラックをクリアする
            if(this.parent.xMap.pmu.checkinNode === checkinTarget){
console.log('XPS checkin');
//次のJobへチェックイン
//ユーザ判定は不用（権利チェックは後ほど実装）
//xMapのカレントノードの内容でpmuを上書きしてデータ同期
                    this.nodeManager.reset({
                        line  :this.parent.xMap.pmu.checkinNode.stage.parentLine.toString(true),
                        stage :this.parent.xMap.pmu.checkinNode.stage.toString(true),
                        job   :this.parent.xMap.pmu.checkinNode.toString(true),
                        status:this.parent.xMap.pmu.checkinNode.jobStatus.toString()
                    });
                    this.parent.syncPmuProps();
                    this.checkinNode = this.currentNode;
console.log(this.checkinNode.getPath());
                    return this.checkinNode;
            }else{
                return null;//ノードコレクションに存在しない
            }
        }
    }

//以下xMapのみの処理
    if(
        (checkinTarget !== checkinTarget.stage.jobs[checkinTarget.stage.jobs.length-1])||
        (checkinTarget.stage !== checkinTarget.stage.parentLine.stages[checkinTarget.stage.parentLine.stages.length-1])
    ) return null;//ライン・ステージの末端ジョブでない
//    if((this.parent.dataURL)&&());
//ドキュメント(xMap)がStoredでかつJobステータスがチェックイン可能であるか
    switch (checkinTarget.jobStatus.content){
        case 'Startup':     ;
        case 'Fixed':       ;//チェックイン成功 > 新規ジョブ作成
            checkinTarget.jobStatus.content = 'Compleated';//このタイミングでのみコンプリートステータスを設定
            checkinTarget.updateUser.parse(activeUser);
            checkinTarget.updateDate        = new Date();
            var newJob = this.nodeManager.new_Job(nodeDescription,checkinTarget.stage);
            newJob.jobStatus.parse(['Active',activeUser,serviceAgent.applicationIdf]);//[content,assign,clientIdf,sessionIdf]
            newJob.createUser.parse(activeUser);
            newJob.updateUser.parse(activeUser);
            this.currentNode  = newJob;
            this.checkinNode  = newJob;
//チェックイン処理後、配下のXpst全てに自動でチェックインする
console.log(this.parent.contents);
            for(var i = 0 ; i < this.parent.contents.length ; i ++){
console.log(
                this.parent.contents[i].pmu.checkin(newJob,newJob.name)
)
            }
            return newJob;
        break;
        case 'Hold':        ;//チェックイン失敗
        case 'Active':      ;
        case 'Compleated':  ;
        case 'Aborted':     ;
        default:
            return null;
    }
}
/*TEST　checkin|activate|deactivate|checout|destroy
var org = decodeURIComponent(nas.Pm.getIdentifier(xUI.XMAP,'status'));
console.log([org,xUI.XMAP.pmu.currentNode,xUI.XMAP.pmu.checkinNode].join('\n'));

function TST(eq){
    var stat = decodeURIComponent(nas.Pm.getIdentifier(xUI.XMAP,'status'));
    if(org == stat ){console.log((eq)?'OK:':'NG!!!')}else{console.log((eq)?'NG:':'OK')};
    console.log([org,stat,xUI.XMAP.pmu.currentNode,xUI.XMAP.pmu.checkinNode].join('\n'));
    org = stat;
}
    xUI.XMAP.pmu.checkin(xUI.XMAP.pmu.nodeManager.getNode(),"newJob",new nas.UserInfo('TEST:test@example.com'));//成功
TST(false);
    xUI.XMAP.pmu.deactivate();//成功
TST(false);
    xUI.XMAP.pmu.deactivate();//失敗
TST(true);
    xUI.XMAP.pmu.activate(new nas.UserInfo('FALSE:false@example.com'));//失敗
TST(true);
    xUI.XMAP.pmu.activate(new nas.UserInfo('TEST:test@example.com'));//成功
TST(false);
    xUI.XMAP.pmu.checkout();
TST(false);
    xUI.XMAP.pmu.activate(new nas.UserInfo('FALSE:false@example.com'));//失敗
TST(true);
    xUI.XMAP.pmu.destroy();//失敗
TST(true);
    xUI.XMAP.pmu.activate(new nas.UserInfo('TEST:test@example.com'));//成功
TST(false);
    xUI.XMAP.pmu.destroy();//成功
TST(false);
    xUI.XMAP.pmu.checkin(xUI.XMAP.pmu.nodeManager.getNode(),"newJob2",new nas.UserInfo('FALSE:false@example.com'));//成功
TST(false);
    xUI.XMAP.pmu.activate(new nas.UserInfo('TEST:test@example.com'));//失敗
TST(true);
*/
/**
 *   アクティベート対象はカレントノード
 *   事前にカレントの設定が必要
 *   ユーザ一致が必要条件
 *   ドキュメントレベルでは判断できないので引数渡しする
 *   @params {Object UserInfo}   activeUser
 *   @returns    {Object nas.Pm.ManagementJob | null}   アクティベート成功時 アクティブオブジェクト 失敗時は null
 */
nas.Pm.PmUnit.prototype.activate = function(activeUser){
//アクティブユーザ（UserInfo）が与えられない場合操作は失敗
    if(! activeUser) return null;
    var activateTarget = this.currentNode;
//カレントがラインの末端ノードでない場合はリジェクト
    if(activateTarget !== this.nodeManager.getNode(activateTarget.stage.parentLine.id.join('-')+'.')) return null;
    switch (activateTarget.jobStatus.content){
        case 'Startup':     ;
        case 'Compleated':  ;
        case 'Aborted':     ;//アクティベートにマネージャ権限が必要
            return null;
        break;
        case 'Fixed':       ;
        case 'Hold':        ;
        case 'Active':      ;//アクティベート可能
            if(! activeUser.sameAs(activateTarget.updateUser)) return null;
            activateTarget.jobStatus.parse('Active');
            activateTarget.updateDate = new Date();
//            this.currentNode  = activateTarget;//もとより一致しているので操作不要
            this.checkinNode  = activateTarget;
            return activateTarget;
        break;
        default:
            return null;
    }
}
/**
 *   チェックイン状態がない（Active｜Hold 以外の）場合は操作失敗
 *  @params {String}    assignUser
 *  @params {String}    message
 *  @returns    {Object nas.Pm.ManagementJob | null}   操作成功時 アクティブオブジェクト 失敗時 null
 *   xMapのチェックアウトは配下のすべてのXpsをチェックアウトする
 *   Xpsのチェックアウトは単独
 */
nas.Pm.PmUnit.prototype.checkout = function(assignUser,message){
    if(! this.checkinNode) return null;
//xMapの場合内包カットを先行でチェックアウト
    if((this.parent instanceof nas.xMap)&&(this.parent.contents.length)){
        for (var i = 0 ; i < this.parent.contents.length ; i ++){
            if(this.parent.contents[i].pmu.checkinNode){
                var ex = this.parent.contents[i].pmu.checkout();
                if(! ex) return false;
            }
        }
    }
    if(! assignUser) assignUser = "";
    if(! message)    message    = "";
    var targetJob = this.checkinNode;
    targetJob.jobStatus.parse([
        'Fixed',
        assignUser,
        message
    ]);
    targetJob.updateDate = new Date();
    this.checkinNode  = undefined;
    return targetJob;
}
/**
 *   カレントノードをディアクティベート
 *   引数 なし
 *  @returns    {Object nas.Pm.ManagementJob | null}   操作成功時 アクティブオブジェクト 失敗時 null
 */
nas.Pm.PmUnit.prototype.deactivate = function(){
    if(! this.checkinNode) return null;
    var targetJob = this.checkinNode;
    targetJob.jobStatus.parse('Hold');
    targetJob.updateDate = new Date();
    this.checkinNode  = undefined;
    return targetJob;
}
/**
 *   チェックインノードを削除
 *   引数なし
 *  削除条件はアクティブ(=セッションオーナー)
 *  削除後は、ノード発生状態の前にロールバックして一つ前のノードに戻る
 *  アクティブ状態は解除　スタートアップノードは開始ユーザ（通常は制作担当）のみが解除可能
 *  @returns    {Object nas.Pm.ManagementJob | null}   操作成功時 アクティブオブジェクト 失敗時 null
 *      処理単純化のため本線0番ステージ0番ノードは削除できない（ノード数0を回避する）ものとする
 *      これはエントリの削除に相当するが別手続きにおく
 */
nas.Pm.PmUnit.prototype.destroy = function(){
    if(this.checkinNode !== this.currentNode) return null;
    if(this.parent instanceof nas.Xps){
//Xpstの場合はノード削除不能　チェックイン状態の解除のみでカレントノードを戻す
//サーバ接続時はサーバ上の最終ノードに戻す処理が必要だがそれは別レイヤにおく
        this.checkinNode = undefined;
        return this.currentNode;
    }
    var targetNode = this.currentNode;
    if((targetNode.id != 0)||(targetNode.createUser.sameAs(targetNode.updateUser))){
        targetNode = targetNode.remove();
        if(targetNode){
//削除に成功したので状態をロールバック
//現コードはノード残数0のケースをカバーしていないので注意
            this.checkinNode = undefined;
            this.currentNode = this.nodeManager.getNode();
            if (this.currentNode.jobStatus.content == 'Compleated') this.currentNode.jobStatus.content = 'Fixed';
            return targetNode;
        }
    }
    return null;
}
/*
 *  ノードを検収して新規のステージを設定する
 *  @params {Object nas.UserInfo}           user
 *  @params {Object nas.Pm.ManagementJob}   targetNode
 *  @params {String}                        stageName
 *  @params {String}                        jobName
 *  @params {String}                        slipNumber  optional
 *
 *  @returns    {Object nas.Pm.ManagementJob}   new node
 */
nas.Pm.PmUnit.prototype.receipt = function(user,targetNode,stageName,jobName,slipNumber){
//ユーザ指定のない場合リジェクト
    if(!(user instanceof nas.UserInfo)) return null;
//引数ノードがない場合リジェクト
    if(! targetNode instanceof nas.Pm.ManagementJob) return null;
//カレントがラインの末端ノードでない場合はリジェクト
    if(targetNode !== this.nodeManager.getNode(targetNode.stage.parentLine.id.join('-')+'.')) return null;
//ステージ記述が指定されない場合リジェクト
    if(! stageName) return false;
//指定情報で新規ステージと初期化ジョブをセット
    var currentStage = targetNode.stage;
    var newStage = new nas.Pm.ManagementStage(
        [currentStage.id+1,stageName].join(':'),
        currentStage.parentLine
    );
    var newJob = new nas.Pm.ManagementJob(
	    ["0",jobName].join(':'),
	    targetNode.parent,
	    newStage,
	    slipNumber
    );
    newJob.createUser.parse(user);
    newJob.createDate = new Date();
    newJob.updateUser.parse(user);
    newJob.updateDate = newJob.createDate;
    return newJob;
}
/*
 *  任意ノードを指定してその後方にbranchを作成する　新規ライン・新規ステージを設定する
 *  @params {Object nas.UserInfo}           user
 *  @params {Object nas.Pm.ManagementJob}   targetNode
 *  @params {String}    lineDescription
 *  @params {String}    deregations
 *  @params {String}        stageName
 *  @params {String}            jobName
 *  @params {String}            slipNumber  optional
 * 予めチェックインしていることが動作条件
 *
 *  @returns    {Object nas.Pm.ManagementJob}   new node
 *
 */
nas.Pm.PmUnit.prototype.branch = function(user,targetNode,lineDescription,delegations,stageName,jobName,slipNumber){
//ユーザ指定のない場合リジェクト
    if(!(user instanceof nas.UserInfo)) return null;
//引数ノードがない場合リジェクト　カレントノードがラインの末端ノードである必要はない
    if(! targetNode instanceof nas.Pm.ManagementJob) return null;
//ライン記述が欠けている場合はリジェクト
    if(! lineDescription) return null;
//ステージ記述が指定されない場合リジェクト
    if(! stageName) return false;
//指定情報で新規ステージと初期化ジョブをセット
    var currentStage = targetNode.stage;
    var newStage = new nas.Pm.ManagementStage(
        [currentStage.id+1,stageName].join(':'),
        currentStage.parentLine
    );
    var newJob = new nas.Pm.ManagementJob(
	    ["0",jobName].join(':'),
	    targetNode.parent,
	    newStage,
	    slipNumber
    );
    newJob.createUser = user;
    newJob.createDate = new Date();
    newJob.updateUser = user;
    newJob.updateDate = newJob.createDate;
    return newJob;

}
//アプリケーション設定DB
/*
アプリケーション動作設定DBは、他の設定に含まれない動作設定情報をまとめたデータベースとなる
DBとの連結時は連結時に再設定
*/
nas.Pm.ProductConfigurations = function(parent){
    this.sceneUse          = 'false';
    this.shotNumberUnique  = 'true';
    this.sheetBaseColor    = '#eeffff';
    this.receiptBaseColor  = '#eeffff';
    this.storyBoardStyle   = {};
    this.storyBoardStyle.documentDir = "vertical";
    this.storyBoardStyle.columnOrder = ["index","picture","dialog","description","timeText"];
    this.storyBoardStyle.pageControl = false;
    this.storyBoardStyle.pageDir     = "ttb";
    this.storyBoardStyle.pageSize    = "A4";

    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)

    this.parent            = parent;
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('configurations');
}
nas.Pm.ProductConfigurations.prototype.toString = function(form){
    var configData = {};
    for (var prp in this){
        if((this[prp] instanceof nas.Pm.PmDomain)||(prp == 'timestamp')) continue;
        configData[prp] = this[prp];
    }
    switch(form){
    case 'full-dump':
    case 'full':
    case 'dump':
    case 'plain-text':
    case 'plain':
    case 'text':
	    var lines = JSON.stringify(configData).replace( /\{|\[|,/g , "$&\n").replace( /\}|\]/g , "\n$&").split('\n');
	    var indent = '';
	    for (var l = 0 ; l < lines.length ; l ++){
		    if(lines[l].match(/\}|\]/)) indent = indent.slice(1);
		    lines[l] = indent + lines[l];
		    if(lines[l].match(/\{|\[/)) indent += '\t';
	    }
	    return lines.join('\n');
    break;
    case    'JSON':
    default:
        return JSON.stringify(configData);
    }
}
nas.Pm.ProductConfigurations.prototype.dump = nas.Pm.ProductConfigurations.prototype.toString;
/**
 *    アプリケーション動作設定の読み込み JSON固定
 */
nas.Pm.ProductConfigurations.prototype.parseConfig = function(configStream){
    var configData=JSON.parse(configStream);
    for(var prp in configData){
        this[prp] = configData[prp];
    }
}
/*
 この情報は各ドメイン間の直線継承のみで、テーブル管理は不要
書き出しは　JSONを利用する

*/
//制作管理用 Organizationオブジェクト　各Repositoryに対応する
/*
nas.Pm.Organization(組織名)

    name        =;//識別名　            eg."nekomataya"
    fullName    =;//正式名称            eg.'ねこまたや'
    code        =;//省略コード          eg.'nkmt'
    id          =;//DB接続用Index　     eg.'0001'
    serviceUrl  =;//サービス接続情報    eg.'localRepository:info.nekomataya.pmdb'
    shortName   =;//表示用短縮名　      eg.'(ね)'
    contact     =;//コンタクト情報 　   eg.'ねこまたや;//nekomataya@nekomataya.info'
    description =;//説明　所在住所等自由記述

オブジェクトメソッドで初期化する
戻り値は組織情報オブジェクト
実運用上はDBとリンクして動作するように調整
初期化段階ではプライマリオブジェクトとしてRepositoryに関連付けられた組織一つだけが登録される

Organization.usersには、pmdbのusersへの参照か　またはカレントのuserのみを登録した一時的ユーザコレクションを用いる？　
*/
nas.Pm.Organization = function(repositoryName){
    this.name        =repositoryName;
    this.fullName    =repositoryName;
    this.code        =String(repositoryName).slice(0,4);
    this.id          ;
    this.serviceUrl  ='localRepository:info.nekomataya.pmdb';
    this.shortName   =String(repositoryName).slice(0,2);
    this.contact     =repositoryName;
    this.contact_token;
    this.pmdb        = {}; //Object nas.Pm.PmDomain 
    this.pmdb_token;
    this.description =""; 
}
nas.Pm.Organization.prototype.toString = function(form){
    switch(form){
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.fullName,
            this.code,
            this.id,
            this.serviceUrl,
            this.shortName,
            this.contact,
            this.description
        ]);
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=[
            this.name,
            "\tfullName:"+this.fullName,
            "\tcode:"+this.code,
            "\tid:"+this.id,
            "\tserviceUrl:"+this.serviceUrl,
            "\tshortName:"+this.shortName,
            "\tcontact:"+this.contact,
            "\tdescription:"+this.description
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify({
            "name":this.name,
            "fullName":this.fullName,
            "code":this.code,
            "id":this.id,
            "serviceUrl":this.serviceUrl,
            "shortName":this.shortName,
            "contact":this.contact,
            "description":this.contact
        });
    break;
    default:
        if(this[form]){
          return this[form]
        }else{
            return this.name;
        }
    }
}
/**
組織コレクション
プライマリの組織はデータベースを維持する組織本体の情報
serviceUrl　はUATの同一サーバ内で共用のためユニーク値とならない
*/
nas.Pm.OrganizationCollection = function(myParent){
    this.parent = myParent;
    this.members = {};
    this.unique  = {
        global :["id"],
        local  :["id","name","fullName","shortName","code"]
    };
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('organizations');
}
nas.Pm.OrganizationCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.OrganizationCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.OrganizationCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
nas.Pm.OrganizationCollection.prototype.dump = nas.Pm._dumpList;
/*
    設定パーサ
*/
nas.Pm.OrganizationCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('organizations');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData[prp];
                continue;
            }
            var tempData = configData[prp];
            var newEntry         = new nas.Pm.Organization(prp);
            newEntry.fullName    = tempData.fullName;
            newEntry.code        = tempData.code;
            newEntry.id          = tempData.id;
            newEntry.serviceUrl  = tempData.serviceUrl;
            newEntry.shortName   = tempData.shortName;
            newEntry.contact     = tempData.contact;
            newEntry.description   = tempData.description;
            newMembers.push(newEntry);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newEntry         = new nas.Pm.Organization(tempData[0]);
            newEntry.fullName    = tempData[1][0];
            newEntry.code        = tempData[1][1];
            newEntry.id          = tempData[1][2];
            newEntry.serviceUrl  = tempData[1][3];
            newEntry.shortName   = tempData[1][4];
            newEntry.contact     = tempData[1][5];
            newEntry.description = tempData[1][6];
            newMembers.push(newEntry);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentEntry=null;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentEntry)){
                currentEntry[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentEntry) newMembers.push(currentEntry);
                currentEntry=new nas.Pm.Organization(configStream[ir]);
            }
        }
        newMembers.push(currentEntry);
    }
    return this.addMembers(newMembers);
}
//制作管理用 WorkTitelオブジェクト　サーバ上のProductに対応する
/*
nas.Pm.newWorkTitle(タイトル識別子)
オブジェクトメソッドで初期化する
戻り値はタイトル情報オブジェクト
実運用上はDBとリンクして動作するように調整

クラスメソッドとしての初期化機能は保留
タイトル情報及びタイトルの制作母体となる組織(Organization)へのペアレントリンクを保持する
親オブジェクト内のタイトルコレクションのメンバー
タイトル内にOpusコレクションを持たせる

	未登録のworktitleを新規登録する手順とUI
	

projectName				新規に必要pmdb上のアクセスキー指定のない場合タイトルをencodeURI
id						pmdb上の通しID(自動作成) uuid
token				＊＊UATのtoken
name				＊＊UAT上のタイトル（既存情報）
fullname				nameを流用（ユーザ設定を促す）
shortname				nameを流用　pmdb内部でユニークになるように文字数を減らす　ももたろう > も 等
code					アルファベット2~4文字でpmdb内のユニークコード　指定がなければ自動作成（作成順にアルファベット３文字　AAA,AAB,AAC,AAD.....)
format					ユーザ指定	未指定のデフォルトは "20:00:00"
framerate				ユーザ指定	未指定のデフォルトは 24fps

inputMedia				ユーザ指定	未指定のデフォルトは 10inHDTV
outputMedia				ユーザ指定	未指定のデフォルトは HDTV720p


sceneUse			
shotNumberUnique		
receiptBaseColor	
sheetBaseColor		

*/
nas.Pm.WorkTitle = function(titleString){
    this.id         ;   //DB接続用index - UATサーバの場合はtoken　tokenはidへの参照
    this.projectName = titleString; //タイトル - UATサーバの場合はname name はprojectNameへの参照
    this.fullName    = titleString; //完全なタイトル文字列（なるべく公式に）
    this.shortName   = titleString; //表示用短縮名
    this.code        = titleString; //ファイル名使用の略号2~3文
//    this.shortName   = String(titleString).slice(0,5); //表示用短縮名
//    this.code        = String(titleString).replace(/[^A-Z]/gi,"").slice(0,3).toUpperCase(); //ファイル名使用の略号2~3文字アルファベット限定
    this.framerate   = new nas.Framerate(); //Object nas.Framerate フレームレート
    this.format      = '00:20:00:00'; //String 納品定尺フレーム数 または nasTC
    this.inputMedia  = nas.Pm.pmdb.medias.entry('作画フレーム200ppi'); //Object nas.Pm.ProductionMedia スタンダードフレーム
    this.outputMedia = nas.Pm.pmdb.medias.entry('HDTV-720p')       ; //Object nas.Pm.ProductionMedia 編集スペック
    this.pmdb        = null; //Object nas.Pm.PmDomain 
//****************************************************************
//    this.pmTemplates;    //作品内の標準工程テンプレート 不要
//   this.staff; //作品のスタッフ一覧　スタッフコレクションオブジェクト　不要
//    this.opuses = new nas.Pm.OpusCollection(this);    //Object nas.Pm.OpusCollection タイトル配下の話数コレクション　不要
// これらはすべて<WorkTitle>.pmdb内に保存される
//****************************************************************
//UATサーバのためのプロパティ
    this.token       = this.id;
    this.name        = this.projectName;
    this.updated_at  ={};
    this.created_at  = new Date();
    this.description;//タイトル識別子として使用？
//タイトル配下のOpusCollection
    this.opuses      = new nas.Pm.OpusCollection(this);
}
/** タイトル文字列化
 *  引数が与えられない場合はプロジェクト名で返す
 *  @params {String}    form
 *      形式指定文字列
 *  <pre>
 *    なし          プロジェクト名で返す
 *    propName      一致したプロパティを単独で返す 文字列またはオブジェクト
 *    "full"        設定ダンプ形式 
 *    "plain"       設定ダンプ形式 プレーンテキスト　ダンプと同形式？
 *    "JSON"          データ交換用JSONフォーマット
 *   </pre>
 *  @returns    {String}
 */
nas.Pm.WorkTitle.prototype.toString = function(form){
    switch (form){
    case    'full-dump':
    case    'full':
    case    'dump':
        return JSON.stringify([
            this.id,
            this.fullName,
            this.shortName,
            this.code,
            this.framerate.toString(true),
            this.format,
            this.inputMedia.toString(),
            this.outputMedia.toString()
        ]);
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=[
            this.projectName,
            "\tid:"+this.id,
            "\tfullName:"   +this.fullName,
            "\tshortName:"  +this.shortName,
            "\tcode:"       +this.code,
            "\tframerate:"  +this.framerate.toString(true),
            "\tformat:"     +this.format,
            "\tinputMedia:" +this.inputMedia.toString(),
            "\toutputMedia:"+this.outputMedia.toString()
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify({
            "projectName":this.projectName,
            "id":this.id,
            "fullName":this.fullName,
            "shortName":this.shortName,
            "code":this.code,
            "framerate":this.framerate.toString(true),
            "format":this.format,
            "inputMedia":this.inputMedia.toString(),
            "outputMedia":this.outputMedia.toString()
        });
    break;
    default:
        if(this[form]){
            return this[form];
        }else{
            return this.projectName;
        }
    }
}

nas.Pm.WorkTitle.prototype.valueOf = function(){return this.id;}
/**
 *    タイトルと引数の同値判定
 *  @params {string|Object nas.PmWprkTitle}     target
 *  @returns    {boolean}
 *      引数がオブジェクトの場合は直接比較　文字列の場合はオブジェクト化して比較を行う
 */
nas.Pm.WorkTitle.prototype.sameAs =function(target){
    if(target instanceof nas.Pm.WorkTitle) {
        return (this.id==target.id)
    } else {
        var targetTitle = nas.pmdb.workTitles.entry(target);
        if(targetTitle){
            return (this.id==targetTitle.id);
        } else {
            return false;
        }
    }
    return false;
}
/**   DB上のタイトルオブジェクトの更新（編集）を行う
 *    成功時は本体自身　失敗時はfalseを返す
 *
 *    @params    {String|Object}    dataSource
 *    @returns   {Boolean}
 *
 *  このメソッドではid,tokenの変更が禁止される
 *  したがってオブジェクトの複製には使用できない点に注意
 */
nas.Pm.WorkTitle.prototype.setContent = function(dataSource){
    if(
        (dataSource instanceof nas.Pm.WorkTitle)||
        ((dataSource instanceof Object)&&(Object.keys(dataSource).length > 0))
    ){
//そのまま使用
    }else if(typeof dataSource == 'string'){
//テキストを判別してオブジェクト化する
        if(dataSource.match(/\{[^\}]+\}/)){
//JSON
console.log('JSON');
            dataSource = JSON.parse(dataSource);
        }else if(dataSource.match(/\[.+\]/)){
//dump
console.log('dump');
            var configStream = dataSource.split('\n');
            dataSource = {};
            for(var ir = 0;ir<configStream.length;ir++){
                if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
                var tempData = JSON.parse(configStream[ir]);
                dataSource.id          = tempData[0];
                dataSource.fullName    = tempData[1];
                dataSource.shortName   = tempData[2];
                dataSource.code        = tempData[3];
                dataSource.framerate   = new nas.Framerate(tempData[4]);
                dataSource.format      = tempData[5];
                dataSource.inputMedia  = tempData[6];
                dataSource.outputMedia = tempData[7];
            }
        }else{
//plain-text
console.log('text');
            var configStream = dataSource.split('\n');
            dataSource=null;
            for(var ir = 0;ir<configStream.length;ir++){
                if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
                if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(dataSource)){
                    var prop = RegExp.$1;var value = RegExp.$2;
                    switch(prop){
                    case 'framerate':dataSource['framerate'] = new nas.Framerate(value);
                    break;
                    default:dataSource[prop] = value;
                    }
                }else{
                    dataSource ={};
                    dataSource.projectName=String(configStream[ir]);
                }
            }
            dataSource.name   = dataSource.projectName;
            dataSource.token  = dataSource.id;
        }
    }else{
console.log('bad data');
        
        return false;
    }
    try{
        if(dataSource.projectName) this.projectName = dataSource.projectName;
//        if(dataSource.id)          this.id          = dataSource.id;
        if(dataSource.fullName)    this.fullName    = dataSource.fullName;
        if(dataSource.shortName)   this.shortName   = dataSource.shortName;
        if(dataSource.code)        this.code        = dataSource.code;
        if(dataSource.framerate)   this.framerate   = new nas.Framerate(dataSource.framerate);
        if(dataSource.format)      this.format      = dataSource.format;
        if(dataSource.inputMedia)  this.inputMedia  = new nas.Pm.ProductionMedia(dataSource.inputMedia);
        if(dataSource.outputMedia) this.outputMedia = new nas.Pm.ProductionMedia(dataSource.outputMedia);
        this.name   = this.projectName;
//        this.token  = this.id;

        return this;
    }catch(err){
        return false;
    }
}
/*TEST
var A = new nas.Pm.WorkTitle('メイドイン・アビス');

A.setContent(`madeInAbbys
	id:bf3c6bea-c3cd-43c9-b84a-69edbeb4b727
	fullName:メイドイン・アビス
	shortName:アビス
	code:ABB
	framerate:24FPS
	format:00:20:00:00
`);
console.log(A.toString('text'));

var B = new nas.Pm.WorkTitle('BOMBOMBOM');

B.setContent(A);

console.log(B);
 */
/**
 *タイトル一致を判定
 *    @params   {Object|String} tgt
 *    @params   {Object|String} dst
 *    @returns  {boolean}
 */
nas.Pm.compareTitles = function(tgt,dst){
    if(tgt instanceof nas.Pm.WorkTitle) return tgt.sameAs(dst);
    if(dst instanceof nas.Pm.WorkTitle) return dst.sameAs(tgt);
    var tgtTitle = nas.pmdb.workTitles.entry(tgt);
    if (tgtTitle) return tgtTitle.sameAs(dst);
    var dstTitle = nas.pmdb.workTitles.entry(dst);
    if (dstTitle) return dstTitle.sameAs(tgt);
    return (tgt==dst);
}
/**
       ワークタイトルコレクションオブジェクト
       一般に組織の配下に入るが、システム配下のリセント情報としても利用される
*/
nas.Pm.WorkTitleCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique  = {
        global :["id","token"],
        local  :["id","token","projectName","fullName","shortName","code"]
    };
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('workTitles');
}
nas.Pm.WorkTitleCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.WorkTitleCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.WorkTitleCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
nas.Pm.WorkTitleCollection.prototype.dump = nas.Pm._dumpList;
/*
function(keyword){
    if(keyword){  return this.entry(keyword)};
    return JSON.stringify(this.members);
}
*/
/*
    タイトル登録メソッド
    引数  メンバーオブジェクトの配列
    戻値  エントリに成功したメンバー数

    重複メンバーは登録しない
    重複の条件は、projectName,id,fullName,shortName,code　いずれかのバッティングを検出（_getMember）
    他のプロパティは比較対象外
    propListの形式は
    projectName,[id,fullName,shortName,code,framerate,format,inputMedia,outputMedia]
*/
/*
function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempTitle = members[ix];
        if( (this.entry(tempTitle.projectName)==null)&&
            (this.entry(tempTitle.id)==null)&&
            (this.entry(tempTitle.fullName)==null)&&
            (this.entry(tempTitle.shortName)==null)&&
            (this.entry(tempTitle.code)==null)
        ){
            this.members[tempTitle.projectName]=tempTitle;
            result++;
        }
    }
    return result;
}
*/
/**
 *   設定パーサ
 *  ダンプコマンドで出力されたデータを読み込むメソッド
 *  @params    {String}   configStream
 */
nas.Pm.WorkTitleCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('workTitles');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData.timestamp;
                continue;
            };
            var tempData = configData[prp];
            var newTitle         = new nas.Pm.WorkTitle();
            newTitle.projectName = prp;
            newTitle.id          = tempData.id;
            newTitle.fullName    = tempData.fullName;
            newTitle.shortName   = tempData.shortName;
            newTitle.code        = tempData.code;
            newTitle.framerate   = new nas.Framerate(tempData.framerate);
            newTitle.format      = tempData.format;
            if(nas.Pm.pmdb.medias.entry(tempData.inputMedia)) newTitle.inputMedia  = nas.Pm.pmdb.medias.entry(tempData.inputMedia);
            if(nas.Pm.pmdb.medias.entry(tempData.outputMedia))newTitle.outputMedia = nas.Pm.pmdb.medias.entry(tempData.outputMedia);

            newTitle.name   = newTitle.projectName;
            newTitle.token  = newTitle.id;
            newMembers.push(newTitle);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newTitle         = new nas.Pm.WorkTitle();
            newTitle.projectName = tempData[0];
            newTitle.id          = tempData[1][0];
            newTitle.fullName    = tempData[1][1];
            newTitle.shortName   = tempData[1][2];
            newTitle.code        = tempData[1][3];
            newTitle.framerate   = new nas.Framerate(tempData[1][4]);
            newTitle.format      = tempData[1][5];
            if(nas.Pm.pmdb.medias.entry(tempData[1][6])) newTitle.inputMedia  = nas.Pm.pmdb.medias.entry(tempData[1][6]);
            if(nas.Pm.pmdb.medias.entry(tempData[1][7])) newTitle.outputMedia = nas.Pm.pmdb.medias.entry(tempData[1][7]);

            newTitle.name   = newTitle.projectName;
            newTitle.token  = newTitle.id;
            newMembers.push(newTitle);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentTitle=null;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentTitle)){
                var prop = RegExp.$1;var value = RegExp.$2;
                switch(prop){
//                case 'format':currentTitle['length']=nas.FCT2Frm(value);//納品フォーマット尺
//                break;
                case 'framerate':currentTitle['framerate'] = new nas.Framerate(value);
                break;
                case 'inputMedia':
                case 'outputMedia':
                    if(nas.Pm.pmdb.medias.entry(value)) 
                    currentTitle[prop] = nas.Pm.pmdb.medias.entry(value);
                break;
                default:currentTitle[prop] = value;
                }
            }else{
                if (currentTitle){
                    currentTitle.name   = currentTitle.projectName;
                    currentTitle.token  = currentTitle.id;
                    newMembers.push(currentTitle);
                }
                currentTitle=new nas.Pm.WorkTitle(configStream[ir]);
//                currentTitle.projectName=String(configStream[ir]);
            }
        }
        newMembers.push(currentTitle);
    }
    return this.addMembers(newMembers);
}
/**
 *    新規タイトル登録
 *    パーサのfull-dumpの部分を参照
 *  タイトルに付属のプロパティが指定されない場合は、タイトルからプロパティを生成する
 *  引数のtitleNameは数字以外で始まる半角英数文字列に制限
 *  propListの形式は
 *   [id,fullName,shortName,code,fps,formatLength,im,om]
 *   @example
 *   addTitle(
 *      "urashimataro",[
 *          '0012835',
 *          'うらしま太郎',
 *          'URSM',
 *          'UR',
 *          '24',
 *          '00:21:30:00',
 *          '作画フレーム200ppi',
 *          'HDTV-720p'
 *       ]
 *   )
 *  引数不備の場合　登録を失敗させる？
 *   projectName = titleName;
 *   id          = propList[0];//UAT token /DB-ID
 *   fullName    = propList[1];//引数をそのまま
 *   name        = propList[1];//引数をそのまま
 *   shortName   = propList[2];//引数を冒頭でカット
 *   code        = propList[3];//引数の冒頭から2文字とって他と重複した場合は数字を付加
 *   framerate   = new nas.Framerate(propList[4]);//引数または標準値
 *   length      = nas.FCT2Frm(propList[5]);//引数または標準値
 *   inputMedia  = propList[6];//引数または標準値
 *   outputMedia = propList[7];//引数または標準値
 *  @returns    {Object newMamber|null}
 */
nas.Pm.WorkTitleCollection.prototype.addTitle = function(titleName,propList){
    var newTitle         = new nas.Pm.WorkTitle();
    newTitle.projectName = titleName;
    newTitle.id          = (propList[0])? propList[0]:nas.uuid();
    newTitle.fullName    = (propList[1])? propList[1]:titleName;
    newTitle.shortName   = (propList[2])? propList[2]:titleName.slice(0,4);
    newTitle.code        = (propList[3])? propList[3]:titleName.slice(0,2);
    newTitle.framerate   = (propList[4])? new nas.Framerate(propList[4]):nas.FRATE;
    newTitle.format      = (propList[5])? propList[5]:'00:21:00+00';
    newTitle.inputMedia  = (nas.Pm.pmdb.medias.entry(propList[6]))? nas.Pm.pmdb.medias.entry(propList[6]):nas.Pm.pmdb.medias.entry('作画フレーム200ppi');
    newTitle.outputMedia = (nas.Pm.pmdb.medias.entry(propList[7]))? nas.Pm.pmdb.medias.entry(propList[7]):nas.Pm.pmdb.medias.entry('HDTV-720p');

    newTitle.name        = newTitle.projectName;
    newTitle.token       = newTitle.id;
    console.log(newTitle);
    var result = this.addMembers([newTitle]);
    console.log(result);
    return (result.length)? result[0]:null;
}

//テンプレート用コレクション
/*
    UI上で参照されるコレクション
    使用したタイトルを記録してテンプレートとして利用
    recentTitles
    プロダクションオブジェクトの配下のコレクションは別に設定される
*/
/**
 *  制作管理用 Opusオブジェクト
 *　サーバ上のEpisodeに対応する
 *  管理単位のProductと対応する
 *  @params {String}    myProductName
 *      UAT.title.code+UAT.name unique
 *  @params {String}    myID
 *      DB接続用index|UAT.token unique
 *  @params {String} myOpus
 *      表示名 話数／制作番号等 UAT.name
 *  @params {String} mySubtitle
 *      サブタイトル文字列 UAT.description
 *  @params {Object nas.Pm.workTitle} myTitle
 *      タイトルObject UAT.title
 */
nas.Pm.Opus = function Opus(myProductName,myID,myOpus,mySubtitle,myTitle){
    this.productName = myProductName ;//String identifier
    this.id          = myID          ;//String unique kay
    this.name        = myOpus        ;//String episode name as No. eg "01"
    this.subtitle    = mySubtitle    ;//String episode title as Name. eg "主人公登場の巻"
    this.title       = myTitle       ;//Object nas.Pm.WorkTitle
//UATサーバのためのプロパティ
    this.token       = this.id       ;//tokenはidを参照する
//    this.pmdb       = ((this.title)&&(this.title.pmdb))? Object.create(this.title.pmdb):new nas.Pm.PmDomain(this);
    this.pmdb       = ((this.title)&&(this.title.pmdb))?
        this.title.pmdb.getChild(this,this.title.pmdb.dataNode + "." + this.name):new nas.Pm.PmDomain(this);
    this.stbd         = new nas.StoryBoard(myProductName);
    this.valueOf    = function(){return this.id};
}
/**
 *  同値判定メソッド
 *  @params {Object nas.Pm.Opus} target
 *  @returns {Boolean}
 */
nas.Pm.Opus.prototype.sameAs = function(target){return (this.id==target.id)}
/*
 *  @example
 *      myOpus=nas.newOpus("うらしま太郎#12[そりゃマア玉手箱]")
 *nas.Pm.newOpus(管理話数名,タイトル)
 *オブジェクトメソッドで初期化する
 *戻り値は管理単位情報オブジェクト
 *実運用上はDBとリンクして動作するように調整
 * UATサービス接続時はidとしてtokenを使用　それ以外はCollectionの登録時インデックスを使用する
 *  @params {String}    opusDescription
 *      タイトル部分を含むOpus識別子　カット記述部、スタータス等を含んでいても良い
 *  @params {String|Number}    token
 *      optional    DB接続用キー
 *  クラスメソッドとしての初期化機能は保留
 *  制作話数(Opus/Episode)が所属するタイトル(Title/Product)へのリンクを持つ
 *  @returns    {Object nas.Pm.Opus|null}
 *
*/
nas.newOpus = function(opusDescription,token){
    if(! opusDescription) return null;
    var arg = nas.Xps.parseIdentifier(opusDescription);
    if((arg)&&(arg.opus)){
        if(arg.title){
            var objTitle = nas.pmdb.workTitles.entry(arg.title);
            if(! objTitle) objTitle= nas.pmdb.workTitles.addTitle(arg.title,[]);
            return new nas.Pm.Opus(
                [objTitle.code,arg.opus].join('#'),
                    arg.id,
                    arg.opus,
                    arg.subtitle,
                    objTitle
            );
        }
    }
//    else{    }
// 不正引数
        return null;
}
/**
 *      引数がなければ識別子用の文字列を返す
 *      引数を与えると設定ファイル形式のJSONを返す
 *  @params {String} form
 *      出力形式指定文字列
 *    なし          識別名を返す
 *    propName      一致したプロパティを単独で返す 文字列またはオブジェクト
 *    "full"        設定ダンプ形式 
 *    "plain"       設定ダンプ形式 プレーンテキスト　ダンプと同形式？
 *    "JSON"          データ交換用JSONフォーマット
 *  @returns    {String}
 */
nas.Pm.Opus.prototype.toString   = function(form){
    switch (form){
    case 'full':
    case 'full-dump':
    case 'dump':
        return JSON.stringify([
            this.productName,
            this.id,
            this.name,
            this.subtitle,
            this.title.projectName,
            this.token
        ]);
    break;
    case    'text':
    case    'plain':
    case    'plain-text':
        var result=[
            this.productName,
            "\tid:"+this.id,
            "\tname:"+this.name,
            "\tsubTitle:"+this.subtitle,
            "\ttitle:"+((this.title)? this.title.projectName:''),
            "\ttoken:"+this.token
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify({
            "productName":this.productName,
            "id":this.id,
            "name":this.name,
            "subTitle":this.subtitle,
            "title":((this.title)? this.title.projectName:''),
            "token":this.token
        });
    break;
    default:
        if(this[form]){
            return this[form];
        }else{
    //デフォルトはプレーンテキストの識別子を組んで返す(product識別子)
            return this.title.toString()+"#"+this.name+((this.subtitle)?"["+this.subtitle+"]":"");
        }
    }
};
/*
　URIエンコードされた識別子を返す
*/
nas.Pm.Opus.prototype.getIdentifier   = function(){
    //デフォルトは識別子を組んで返す(product識別子)
            return (
                encodeURIComponent(this.title.toString())+"#"+
                encodeURIComponent(this.name)+
                ((this.subtitle)?"["+encodeURIComponent(this.subtitle)+"]":"")
            );
}
/**   DB上のOpusオブジェクトの更新（編集）を行う
 *    成功時は本体自身　失敗時はfalseを返す
 *    所属タイトルの変更はこのメソッドでは禁止条項とする
 *    @params    {String|Object}    dataSource
 *    @returns   {Boolean}
 */
nas.Pm.Opus.prototype.setContent = function(dataSource){
    if(
        (dataSource instanceof nas.Pm.WorkTitle)||
        ((dataSource instanceof Object)&&(Object.keys(dataSource).length > 0))
    ){
//そのまま使用
    }else if(typeof dataSource == 'string'){
//テキストを判別してオブジェクト化する
        if(dataSource.match(/\{[^\}]+\}/)){
//JSON
console.log('JSON');
            dataSource = JSON.parse(dataSource);
        }else if(dataSource.match(/.+\,\[.+\]/)){
//dump
console.log('dump');
            var configStream = dataSource.split('\n');
            dataSource = {};
                var tempData = JSON.parse(configStream);
                dataSource.productName = tempData[0];
                dataSource.id          = tempData[1];
                dataSource.name        = tempData[2];
                dataSource.subtitle    = tempData[3];
                dataSource.title       = tempData[4];
        }else{
//plain-text
console.log('text');
            var configStream = dataSource.split('\n');
            dataSource=null;
            for(var ir = 0;ir<configStream.length;ir++){
                if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
                if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(dataSource)){
                    var prop = RegExp.$1;var value = RegExp.$2;
                    switch(prop){
                    case 'framerate':dataSource['framerate'] = new nas.Framerate(value);
                    break;
                    default:dataSource[prop] = value;
                    }
                }else{
                    dataSource= {} ;
                    dataSource.productName=String(configStream[ir]);
                }
            }
        }
    }else{
console.log('bad data');
        return false;
    }
    try{
        if(dataSource.productName) this.productName = dataSource.productName;
//        if(dataSource.id)          this.id          = dataSource.id;
        if(dataSource.name)        this.name        = dataSource.name;
        if(dataSource.subtitle)    this.subtitle    = dataSource.subtitle;
//        if(dataSource.token)       this.token       = dataSource.token;
//タイトルの付け替えはこのメソッドでは行わない!!pmdb上での不整合が発生するので禁止
//同じくid,tokenの変更も行わない
//必要がある場合は、削除・新規作成の手順を踏むこと
//したがって　このメソッドはOpusの複製に使用できない
        return this;
    }catch(err){
        return false;
    }
}
/*TEST
var A = nas.newOpus('メイドイン・アビス#パートD//s-c1201(3+0)','123456678990');

A.setContent(`メイドイン・アビス#パートD
	id:33d26dce-977b-4a7c-9705-92bbf7fc7ce1
	name:partD
	subTitle:深き魂のお好み焼き
	title:medeInAbbys
`);
console.log(A.toString('text'));

var B = new nas.Pm.Opus(
	'BOMBOMBOM#7',
	'sdahjsdkhkjhaksjd',
	'7',
	'千日前スカラ座',
	'うなぎ3人前'
);

B.setContent(A);

console.log(B);
 */
/**
 *  @constractor
 *    各話（エピソード）コレクションオブジェクト　OpusCorrection
 *    一般にタイトルの配下に入るが、システム配下でキャッシュとしても利用
 *    その場合はpmdb配下でProductCollectionとして利用
 *  @params {Object nas.Pm.WorkTitle|other}   myParent
 *
 */
nas.Pm.OpusCollection = function(parentTitle){
    this.parent  = parentTitle;//{Object nas.Pm.WorkTitleCollection|nas.Pm.PmDomain}    parentTitle
    this.members = {};
    this.unique  = {
        global :["id","token","productName"],
        local  :["id","token","productName","name"]
    };
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('products');
}
nas.Pm.OpusCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.OpusCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.OpusCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
nas.Pm.OpusCollection.prototype.dump =  nas.Pm._dumpList;
/*


nas.Pm.OpusCollection.prototype.addMembers = function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempOpus = members[ix];
        if( (this.entry(tempOpus.name)==null)&&
            (this.entry(tempOpus.id)==null)
        ){
            this.members[tempOpus.name]=tempOpus;
            result++;
        }
    }
    return result;

}
*/
/*
    設定パーサ
*/
nas.Pm.OpusCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('products');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData.timestamp;
                continue;
            };
            var tempData = configData[prp];
            var parentTitle = (this.parent instanceof nas.Pm.WorkTitleCollection)?
                this.parent.entry(tempData.title):this.parent.workTitles.entry(tempData.title);
            var newOpus  = new nas.Pm.Opus(
                tempData.productName,
                tempData.id,
                tempData.name,
                tempData.subTitle,
                parentTitle
            );
            if(parentTitle) parentTitle.opuses.addMembers(newOpus);
            newMembers.push(newOpus);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var parentTitle = (this.parent instanceof nas.Pm.WorkTitleCollection)?
                this.parent.entry(tempData.title):this.parent.workTitles.entry(tempData.title);
            var newOpus  = new nas.Pm.Opus(
                prp,
                tempData.id,
                tempData.name,
                tempData.subTitle,
                parentTitle
            );
            if(parentTitle) parentTitle.opuses.addMembers(newOpus);
            newMembers.push(newOpus);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentTitle = null;
        var currentOpus  = null;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentOpus)){
                if(RegExp.$1 == "title"){
                    var parentTitle = (this.parent instanceof nas.Pm.WorkTitleCollection)?
                        this.parent.entry(RegExp.$2):this.parent.workTitles.entry(RegExp.$2);
//                    parentTitle = this.parent.workTitles.entry(RegExp.$2);
                    currentOpus.title = parentTitle;
                }else{
                    currentOpus[RegExp.$1]=RegExp.$2;//プロパティ設定
                }
            }else{
                if (currentOpus) newMembers.push(currentOpus);
                currentOpus=new nas.Pm.Opus(configStream[ir]);
            }
        }
        if(parentTitle) parentTitle.opuses.addMembers(currentOpus);
        newMembers.push(currentOpus);
    }
    return this.addMembers(newMembers);
}
/**
 *    新規制作管理単位(opus|episode)登録
 *    パーサのfull-dumpの部分を参照
 *  引数の記述には標準的にタイトルが含まれる
 *  引数のopusNameは数字以外で始まる半角英数文字列に制限
 *  propListの形式は
 *   [id,fullName,shortName,code,fps,formatLength,im,om]
 *   @example
 *   addTitle(
 *      "urashimataro",[
 *          '0012835',
 *          'うらしま太郎',
 *          'URSM',
 *          'UR',
 *          '24',
 *          '00:21:30:00',
 *          '作画フレーム200ppi',
 *          'HDTV-720p'
 *       ]
 *   )
 *  引数不備の場合　登録を失敗させる？
 *   productName = productName;//Tcode#epNo
 *   id          = propList[0];//UAT token /DB-ID
 *   name        = propList[1];//引数をそのまま
 *   subtitle    = propList[1];//引数をそのまま
 *   title       = propList[2];//引数を冒頭でカット
 *   token       = propList[3];//引数の冒頭から2文字とって他と重複した場合は数字を付加
 *  @returns    {Object newMamber|null}
 */
nas.Pm.OpusCollection.prototype.addOpus = function(opusName,propList,parentTitle){
    if((! opusName)||(! parentTitle))return null;
//    if(!(productName.match(/^[a-z_]/))) productName='_'+productName;
//    var product = nas.Pm.parseProduct(productName);
    if(! parentTitle instanceof nas.Pm.workTitle){
        parentTitle = nas.pmdb.workTitles.entry(parentTitle);
        if(! parentTitle) parentTitle = nas.pmdb.workTitles.addTitle(parentTitle);
    }
        product.title = nas.pmdb.workTitles.entry(product.title);
    var newOpus         = new nas.Pm.Opus(
            productName,
            (proplist[0])?propList[0]:nas.uuid(),
            (propList[1])? propList[1]:productName,
            (propList[2])? propList[2]:"",
            parentTitle
        );
    newOpus.token       = (propList[4])? new nas.Framerate(propList[4]):nas.FRATE;
    newOpus.name        = newOpus.productName;
    newOpus.token       = newOpus.id;
    console.log(newOpus);
    var result = this.addMembers([newOpus]);
    console.log(result);
    return (result.length)? result[0]:null;
}

//メディアDB
/*
メディアDBは、入出力のメディアスペックを記述するための複合オブジェクト
MAP内部ではワークタイトルに付属する情報として処理する
animationField,framerate,baseResolution等は、オブジェクトで保持
初期化時は、デフォルトの値で作成　再初期化が必用
idは初期化時は未設定
コレクション加入時に設定される
DBとの連結時は連結時に再設定
*/
/**
    @params {String}    mediaName
    @params {String}    animationField
    @params {Number|String} framerate
 */
nas.Pm.ProductionMedia = function(mediaName,animationField,framerate){
    this.id             ;
    this.animationField = new nas.AnimationField(animationField);
    this.mediaName      = mediaName;//
    this.baseResolution = new nas.UnitResolution();//
    this.mediaType           ;//mediaType drawing/video|movie
    this.baseWidth      = this.animationField.baseWidth;
    this.frameAspect    = this.animationField.frameAspect;
    this.framerate      = nas.newFramerate(framerate);
    this.tcType         ;//string tradJA/SMPTE/TC/frame
    this.pegForm        = this.animationField.peg;//animationField.peg
    this.pegOffset      = this.animationField.pegOffset;
    this.pixelAspect    ;//float
    this.description    ;
}
/*

*/
nas.Pm.ProductionMedia.prototype.toString = function(form){
    switch (form){
    case 'JSON':
        return JSON.stringify({
            "mediaName"     :this.mediaName,
            "id"            :this.id,
            "animationField":this.animationField.toString(),
            "baseResolution":this.baseResolution.toString(),
            "mediaType"     :this.mediaType,
            "tcType"        :this.tcType,
            "pegForm"       :this.pegForm.toString(),
            "pixelAspect"   :this.pixelAspect,
            "description"   :this.description
        });
    break;
    case 'full-dump':
    case 'dump':
    case 'full':
        return JSON.stringify([
            this.id,
            this.animationField.toString(),
            this.baseResolution.toString(),
            this.mediaType,
            this.tcType,
            this.pegForm.toString(),
            this.pixelAspect,
            this.description
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.mediaName,
            "\tid:"+this.id,
            "\tanimationField:"+this.animationField.toString(),
            "\tbaseResolution:"+this.baseResolution.toString(),
            "\tmediaType:"+this.mediaType,
            "\ttcType:"+this.tcType,
            "\tpegForm:"+this.pegForm.toString(),
            "\tpixelAspect:"+this.pixelAspect,
            "\tdescription:"+this.description
        ]).join('\n');
    break;
    default:
        return this.mediaName;
    }
}
//
nas.Pm.MediaCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique  = {
        global :["id"],
        local  :["mediaName","id"]
    };
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('medias');
}
nas.Pm.MediaCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.MediaCollection.prototype.addMembers= nas.Pm._addMembers;
nas.Pm.MediaCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
nas.Pm.MediaCollection.prototype.dump = nas.Pm._dumpList;
/*
    コレクションメンバー登録メソッド
    引数  メンバーオブジェクト配列
    戻値  エントリに成功したメンバー数
    重複メンバーは登録しない
    重複の条件は、mediaName,id　いずれかのバッティングを検出（_getMember）
    他のプロパティは比較対象外
    full-dump の形式は
    mediaName,[id,animationField,baseResolution,mediaType,tcType,pegForm,pixelAspect,description]
nas.Pm.MediaCollection.prototype.addMembers = function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempOpus = members[ix];
        if( (this.entry(tempOpus.mediaName)==null)&&
            (this.entry(tempOpus.id)==null)
        ){
            this.members[tempOpus.name]=tempOpus;
            result++;
        }
    }
    return result;
}
*/
/*
*/
nas.Pm.MediaCollection.prototype.parseConfig = function(configStream){
    if((! configStream)||(String(configStream).length==0)) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('medias');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }

    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData.timestamp;
                continue;
            };
            var tempData = configData[prp];
            var newMedia  = new nas.Pm.ProductionMedia(tempData.mediaName,tempData.animationField,tempData.framerate);
                newMedia.id             = tempData.id;
//              newMedia.mediaName      = tempData.mediaName;//
//              newMedia.animationField = tempData.new nas.AnimationField(tempData.animationField);
//              newMedia.baseWidth      = newMedia.animationField.baseWidth;
//              newMedia.frameAspect    = newMedia.animationField.frameAspect;
//              newMedia.pegForm        = newMedia.animationField.peg;//animationField.peg
//              newMedia.pegOffset      = newMedia.animationField.pegOffset;
                newMedia.baseResolution = new nas.UnitResolution(tempData.baseResolution);//
                newMedia.mediaType      = tempData.mediaType;//mediaType drawing/video
//              newMedia.framerate      = nas.newFramerate(tempData.framerate);
                newMedia.tcType         = tempData.tcType;//string tradJA/SMPTE/TC/frame
                newMedia.pixelAspect    = parseFloat(tempData.pixelAspect);//float
                newMedia.description    = tempData.description;
            newMembers.push(newMedia);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newMedia  = new nas.Pm.ProductionMedia(tempData[0],tempData[1][1]);
    newMedia.id             = tempData[1][0];
    newMedia.baseResolution = tempData[1][2];// new nas.UnitResolution();//
    newMedia.mediaType      = tempData[1][3];// ;//mediaType drawing/video
    newMedia.tcType         = tempData[1][4];// ;//string tradJA/SMPTE/TC/frame
    newMedia.pegForm        = tempData[1][5];// newMedia.animationField.peg;//animationField.peg
    newMedia.pixelAspect    = parseFloat(tempData[1][6])  ;//float
    newMedia.description    = tempData[1][7];

            newMembers.push(newMedia);
        }
    break;
    case 'plain-text':
    default:
        configStream=String(configStream).split('\n');
        var tempData    = false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(tempData)){
                tempData[RegExp.$1]=RegExp.$2;//一時オブジェクトにプロパティ設定
            }else{
//プレーンテキストで設定した一時オブジェクトをメディア化する
                if(tempData){
                var newMedia  = new nas.Pm.ProductionMedia(tempData.mediaName,tempData.animationField,tempData.framerate);
                    newMedia.id             = tempData.id;
                    newMedia.baseResolution = new nas.UnitResolution(tempData.baseResolution);//
                    newMedia.mediaType      = tempData.mediaType;//mediaType drawing/video
                    newMedia.tcType         = tempData.tcType;//string tradJA/SMPTE/TC/frame
                    newMedia.pixelAspect    = parseFloat(tempData.pixelAspect);//float
                    newMedia.description    = tempData.description;
                    newMembers.push(newMedia);
                }
                tempData = {};
                tempData.mediaName = configStream[ir];
            }
        }
        if(tempData){
            var newMedia  = new nas.Pm.ProductionMedia(tempData.mediaName,tempData.animationField,tempData.framerate);
                newMedia.id             = tempData.id;
                newMedia.baseResolution = new nas.UnitResolution(tempData.baseResolution);//
                newMedia.mediaType      = tempData.mediaType;//mediaType drawing/video
                newMedia.tcType         = tempData.tcType;//string tradJA/SMPTE/TC/frame
                newMedia.pixelAspect    = parseFloat(tempData.pixelAspect);//float
                newMedia.description    = tempData.description;
                newMembers.push(newMedia);
        }
    }

    return this.addMembers(newMembers);
}


nas.Pm.MediaCollection.prototype.addMedia = function(mediaName,propList){
    
    this.members[mediaName]                 = new nas.Pm.ProductionMedia();
    this.members[mediaName].mediaName       = mediaName;
    this.members[mediaName].id              = propList[0];
    this.members[mediaName].animationField  = propList[1];//現在は文字列のまま
    // 本日は仕様変更が主眼なのでこのまま保留　12/04
    this.members[mediaName].baseResolution  = propList[2];
    this.members[mediaName].mediaType       = propList[3];
    this.members[mediaName].tcType          = propList[4];//nas.Framerate Objectする場合は nas.newFramerate(this.tcType)
    this.members[mediaName].pegForm         = propList[5];
    this.members[mediaName].pixelAspect     = propList[6];
    this.members[mediaName].description     = propList[7];
}
/*
nas.Pm.MediaCollection.prototype.addMembers = function (members){
    if(!(members instanceof Array)) members =[members];
    for (var ix=0 ;ix< members.length;ix++) this.addMember(members[ix])
}
*/
/**
 *<pre>
 *  制作管理用 Assetオブジェクト
 * アセットベースの管理を行う
 * このシステム上のアセットは、通常XPSを介して時間／空間的に配置された再利用可能データ群を指す
 * XPSを持たない（時間構造を持たない）場合もある
 *
 * 作品内でユニークな識別名を持つ管理用のキーオブジェクトに結合されたデータ群を総称するもの、
 * 管理用オブジェクトは以下のプロパティを持つ</pre>
 * id           {String} DB接続用ID
 * token        {String} DB接続用token
 * name         {String}
 *      識別名称:作品内での一意性を求められる
 * hasXPS       {Boolean}
 *      アセットがXPS（時間構造）を持つかのフラグ
 * code         {String}
 *      省略表記用短縮コード ２〜３バイトを推奨 ユニークであること
 * shortName    {String}
 *      画面表示用略称 ８文字程度までを推奨 指定のない場合はnameを転用
 * description  {String}
 *      アセットの説明 ユーザのために必用
 * endNode      {Boolean}
 *      アセットがラインを終了させうる（素材プールへの流入をする）か否かのフラグ。
 *      このフラグのあるアセットは、制作ラインのターゲット（目的）アセットとなりラインを収束させる。
 *       このフラグの有無にかかわらずすべてのアセットはステージの目的アセットとなりうる。
 * callStage    {Array}
 *      ステージ識別名配列 当該アセットを受けて（入力として）開始することが可能なステージ群
 *      ユーザが選択する 一つのアセットを受けて２つ以上のステージを開始する場合、ライン分岐が発生する
 *
 */
nas.Pm.Asset = function Asset(){
    this.id             ;
    this.token          ;
    this.assetName      ;
    this.name           ;
    this.hasXPS         ;
    this.code           ;
    this.shortName      ;
    this.description    ;
    this.endNode        ;
    this.callStage   =[];
}

nas.Pm.Asset.prototype.toString = function(form){
    switch (form) {
    case 'JSON':
        return JSON.stringify({
            name:this.name,
            hasXPS:this.hasXPS,
            code:this.code,
            shortName:this.shortName,
            descripion:this.description,
            endNode:this.endNode,
            callStage:this.callStage
        });
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.hasXPS,
            this.code,
            this.shortName,
            this.description,
            this.endNode,
            this.callStage
        ]);
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.assetName,
            '\tname:'+this.name,
            '\thasXPS:'+this.hasXPS,
            '\tcode:'+this.code,
            '\tshortName:'+this.shortName,
            '\tdescription:'+this.description,
            '\tendNode:'+this.endNode,
            '\tcallStage:'+this.callStage
        ]).join('\n');
    default:
        return this.name;
//        return nas.Pm.searchProp(this.name,nas.pmdb.assets);
    }
}
/**
 *   アセットコレクション
 */
nas.Pm.AssetCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique  = {
        global  :["assetName","name","code","shortName"]
//        global  :["id","token","assetName","name","code","shortName"]
    }
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('assets');
}
/**
 *  @method
 *      アセットコレクションからメンバーを取得する
 *  @params {String}    keyword
 *      取得するメンバーキーワード
 *      アセット登録名でヒットしなかった場合はuniqueキーワードを比較して、合致した最初のメンバーを返す
 */
nas.Pm.AssetCollection.prototype.entry = nas.Pm._getMember;
/**
 *  @method
 *    <pre>
 *    アセットコレクションにメンバーを追加する
 *    重複メンバーは登録しない
 *    重複の条件は、Collection.unique配列を参照
 *    いずれかのバッティングを（_getMember() で）検出</pre>
 *  @params {Array}    members
 *      追加するメンバー(オブジェクト)の配列
 *  @returns    {Number}
 *      追加に成功したエントリ数
 */
nas.Pm.AssetCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.AssetCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
nas.Pm.AssetCollection.prototype.dump = nas.Pm._dumpList;

/**
 *    データ入力メソッド
 *  @params {String}    address
 *  @params {String}    content
 * @returns [Array]
 *  [書き込みプロパティアドレス,書き込み前の値,書き込み後の値]
 (
    "assetStore.<groupName>.<elementName>",
    ""
 */
nas.Pm.AssetCollection.prototype.put = function(address,content){
    var previousValue = '';
/*
	if(putMethod == 'direct'){
		targetProp = inputUnit.value;//直接代入
	}else{
		targetProp[putMethod](inputUnit.value);//メソッドで書き込み
	};//*/

    return [address,content,previousValue];
};//put
/**
 *  アセット登録メソッド
 *  @params {String}    assetName
 *      アセット登録名 ユニークID 同名のアセットは上書き
 *  @params {Array}     propList
 *      　要素順依存のプロパティ配列
 */
nas.Pm.AssetCollection.prototype.addAsset = function(assetName,propList){
    this.members[assetName]             = new nas.Pm.Asset();
    this.members[assetName].assetName   = assetName;
    this.members[assetName].name        = propList[0];
    this.members[assetName].hasXPS      = (propList[1])?true:false;
    this.members[assetName].code        = propList[2];
    this.members[assetName].shortName   = propList[3];
    this.members[assetName].description = propList[4];
    this.members[assetName].endNode     = (propList[5])?true:false;
    this.members[assetName].callStage   = propList[6];
}
/* 
    return [ this[assetName].name,
    this[assetName].hasXPS,
    this[assetName].code,
    this[assetName].shortName,
    this[assetName].description,
    this[assetName].endNode,
    "["+(this[assetName].callStage).join()+"]"
    ];
*/
/**
 *  データパーサ
 *  保存形式テキストをパースしてAssetCollectionをビルドする
 *  @params {String}    configStream
 *      記述（保存）形式のテキスト　JSON|palin-text|full-dump
 */
nas.Pm.AssetCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('assets');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }        
    switch(form){
    case    'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData.timestamp;
                continue;
            };
            var tempData = configData[prp];
            var newEntry        = new nas.Pm.Asset();
            newEntry.assetName   = prp;
            newEntry.name        = tempData.name;
            newEntry.hasXPS      = tempData.hasXPS;
            newEntry.code        = tempData.code;
            newEntry.shortName   = tempData.shortName;
            newEntry.description = tempData.description;
            newEntry.endNode     = tempData.endNode;
            newEntry.callStage   = tempData.callStage;
            newMembers.push(newEntry);
        }
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newEntry         = new nas.Pm.Asset();
            newEntry.assetName    = tempData[0];
            newEntry.name        = tempData[1][0];
            newEntry.hasXPS      = tempData[1][1];
            newEntry.code        = tempData[1][2];
            newEntry.shortName   = tempData[1][3];
            newEntry.description = tempData[1][4];
            newEntry.endNode     = tempData[1][5];
            newEntry.callStage   = tempData[1][6];
            newMembers.push(newEntry);
        }
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
    default:
        configStream=String(configStream).split('\n');
        var currentEntry=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentEntry)){
                currentEntry[RegExp.$1]=(RegExp.$1=='callStage')?(RegExp.$2).split(','):RegExp.$2;//プロパティ設定
            }else{
                if (currentEntry) newMembers.push(currentEntry);
                currentEntry=new nas.Pm.Asset();
                currentEntry.assetName=String(configStream[ir]);
            }
        }
        newMembers.push(currentEntry);
    }
    return this.addMembers(newMembers)
}
/*制作管理用 PmTemplateオブジェクト
 *プロパティ parentの参照以外はすべて配列
 *  lineNames   ライン名称コレクション
 *  stageNames  ステージ名称コレクション
 *  jobName     ジョブ名称コレクション
 *  
 *  .getLines()             設定されているラインのリストを返す
 *  .getStageName(myLine)   ラインごとのステージ候補セットを設定順で戻す
 *  .getJobNames(myStage)   指定ステージのジョブ候補セットを設定順で戻す
 *  
 *  タイトルごとに設定される工程テンプレート
 *  ユーザが管理情報を入力する際に提示される参考データとして提示される
 *  記録データ的には、コレクション外の入力はOK
 *  コレクション外の入力は入力時にコレクションに追加されて必要に従ってマスターDBへ送信される
 *  アクセスメソッドを介して情報セットを引き出す
 *    
lineNames[line]=[stage1,stage2,stage3];
stageNames[stage]=[line1,line2];
jobNames[job]=[stage1,stage2]
line null,ALL,trunk,backgroundArt,
 */
//ラインテンプレートコレクション配列
nas.Pm.PmTemplateCollection = function(myParent){
    this.parent    = myParent;
    this.members   = [];
    this.summary   = [];
    this.aggregate = [];
    this.unique  = {
        global :["line.name","line.shortName","line.lineName"]
    };
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('pmTemplates');
};
/*テンプレートコレクションメンバー追加メソッド
配列型のみを受け取る
重複チェックはなし　上書き
*/
nas.Pm.PmTemplateCollection.prototype.addTemplate = function(templates){
        if(! templates[0] instanceof Array){templates = [templates];}
    for (var eid = 0;eid<templates.length ; eid ++){
        //引数: トレーラーオブジェクトの参照,ライン識別名,ステージコレクションの内容配列,サマリ記述配列
        this.members[eid] = new nas.Pm.LineTemplate(this.parent,templates[eid][0],templates[eid][1],templates[eid][2],templates[eid][3]);
    }
};
/*  テンプレートコレクションメンバーの対象ラインを検索して該当するテンプレートを返す
 *  @params {String} keyword
 *  @returns    {Object nas.Pm.LineTemplate}
 */
nas.Pm.PmTemplateCollection.prototype.entry = function(keyword,region){
    if(! region) region = 'global';
    if(! this.unique[region]) region = Object.keys(this.unique)[0];
    if(keyword=='%default%')　return this.members[0];//本線を返す
    for (var ix = 0 ; ix < this.members.length ; ix++){
        for (var uix = 0 ;uix < this.unique[region].length ; uix ++){
            var prp = this.unique[region][uix].split('.');
            if (this.members[ix][prp[0]][prp[1]]==keyword)
                return this.members[ix];
        }
    }
}
nas.Pm.PmTemplateCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.PmTemplateCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
/*
    設定データストリームパーサ
*/
nas.Pm.PmTemplateCollection.prototype.parseConfig = function(dataStream,form){
    
    if(! dataStream) return false;
    var myMembers =[];
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('pmTemplates');
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            if(tempObject[rix].timestamp){
                this.timestamp = tempObject[rix].timestamp ;
                continue ;
            }
            var currentMember=new nas.Pm.LineTemplate(
                this.parent,
                tempObject[rix].line,
                tempObject[rix].stages,
                tempObject[rix].summary,
                tempObject[rix].aggregate
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.Pm.LineTemplate(
                this.parent,
                currentRecord[0],
                currentRecord[1],
                currentRecord[2],
                currentRecord[3]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
/*plainフォーマット
entryName
	prop:value
	prop:value
*/
        if((currentMember)&&(currentField.match( /^\t([a-z]+)\:(.+)$/i ))){
            if(RegExp.$1=='stages'){
                var stages=(RegExp.$2).split(',');
                for (var sid=0;sid<stages.length;sid++){
                   currentMember.stages.addStage(stages[sid],currentMember.parent.stages.entry(stages[sid]));
                }
            } else if(RegExp.$1=='summary'){
                currentMember.summary=(RegExp.$2).split(',');
            } else if(RegExp.$1=='aggregate'){
                currentMember.aggregate=(RegExp.$2).split(',');
            } else {
        	    currentMember[RegExp.$1]=RegExp.$2;//追加プロパティ用
        	}
        } else if(currentField.match( /^.+$/i )) {
        	if(currentMember) myMembers.push(currentMember);
        	currentMember = new nas.Pm.LineTemplate(this.parent,currentField,[]);
        }
      }
      myMembers.push(currentMember);
    }
//console.log(myMembers);
    for(var mix=0;mix<myMembers.length;mix ++){
        if(myMembers[mix].summary){
            for(var six=0;six<myMembers[mix].summary.length;six ++){
                this.summary.add(myMembers[mix].summary[six]+'.'+myMembers[mix].line.toString()+'.');
            }
        }
        if(myMembers[mix].aggregate){
            for(var aix=0;aix<myMembers[mix].aggregate.length;aix ++){
                this.aggregate.add(myMembers[mix].aggregate[aix]+'.'+myMembers[mix].line.toString()+'.');
            }
        }
    }
    return this.addMembers(myMembers);
}
nas.Pm.PmTemplateCollection.prototype.dump = nas.Pm._dumpList;
/**
    ラインテンプレート　ステージデータコレクションを持つ
    @params {Object}    parent
        Collectionオブジェクト
    @params {Staring}   lineName
        ライン識別名称
    @params {Array of String}  myStarges
        ラインの標準的なステージ並びをステージ名配列で与える 空配列で初期化可能
    @params {Array of String} checkSummary
        概要表示の識別子配列
    @params {Array of String} aggregateList
        集計項目配列
*/
nas.Pm.LineTemplate = function(parent,lineName,myStages,checkSummary,aggregateList){
    if (!(myStages instanceof Array)) myStages = [myStages];
    this.parent    = parent;//親参照にpmdbをもたせる
    this.line      = this.parent.lines.getLine(lineName);
    this.stages    = new nas.Pm.StageCollection(this);
    this.summary   = (checkSummary)?checkSummary:[];
    this.aggregate = (aggregateList)?aggregateList:[];
    for (var ix=0;ix< myStages.length;ix++){
        var stageKey= nas.Pm.searchProp(myStages[ix],this.parent.stages)
        this.stages.addStage(stageKey,this.parent.stages.entry(stageKey));
    }
};
/*
toString(true) テキスト設定形式で書き出す

*/
nas.Pm.LineTemplate.prototype.toString = function(form){
    switch(form){
    case 'JSON':
        var result ={
           line: this.line.toString(),
           stages:(this.stages.dump()).split(',')
        };
        if(this.summary.length)   result.summary   = this.summary;
        if(this.aggregate.length) result.aggregate = this.aggregate;
        return JSON.stringify(result);
    case 'full-dump':
    case 'full':
    case 'dump':
        var result =[
        this.line.toString(),
        (this.stages.dump()).split(',')
        ];
        if(this.summary.length)   result.push(this.summary)
        if(this.aggregate.length) result.push(this.aggregate);
        return JSON.stringify(result);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
       var result = [
        this.line.toString(),
        '\tstages:'+this.stages.dump()
        ];
        if (this.summary.length)   result.push('\tsummary:'+this.summary.join());
        if (this.aggregate.length) result.push('\taggregate:'+this.aggregate.join());
      return result.join('\n');
    break;
    default:
        return this.line.toString();
    }
};

/* 制作管理用 PmWorkflowオブジェクト
 * サイトの標準ワークフローを保持するオブジェクト
 *  workflowName   ワークフロー名
 *  workflow       ラインテンプレートコレクション
 *  
 *  .getLines()             設定されているラインのリストを返す
 *  .getStageName(myLine)   ラインごとのステージ候補セットを設定順で戻す
 *  .getJobNames(myStage)   指定ステージのジョブ候補セットを設定順で戻す
 *  
 *  タイトルごとに設定可能な工程テンプレート
 *  ユーザが管理情報を入力する際に提示される参考データとして提示される
 *  記録データ的には、コレクション外の入力はOK
 *  コレクション外の入力は入力時にコレクションに追加されて必要に従ってマスターDBへ送信される
 *  アクセスメソッドを介して情報セットを引き出す
 *    従来のpmTemplatesを代替する
 */
//ワークフローコレクション
nas.Pm.PmWorkflowCollection = function(myParent){
    this.parent    = myParent;
    this.members   = [];//Array of PmWorkflow
    this.active    = 0 ;//selected member ID
    this.unique    = {
         global:["name"]
    };//基本は同名のワークフローのみを禁止
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('pmWorkflows');
};
/*ワークフローコレクションメンバー追加メソッド
配列型のみを受け取る
重複チェックはなし 上書き    これはすでに使用していないメソッド
*/
/*
nas.Pm.PmWorkflowCollection.prototype.addWorkflow = function(workflows){
        if(! workflows[0] instanceof Array){workflows = [workflows];}
    for (var eid = 0;eid<workflows.length ; eid ++){
        //引数: トレーラーオブジェクトの参照,ワークフロー識別名,ラインテンプレートコレクション
        this.members[eid] = new nas.Pm.Workflow(this,workflows[eid].name,workflows[eid].workflow);
    }
};// */
/*  ワークフローコレクションメンバーを検索して該当するワークフロー（テンプレートセット）を返す "UATSample"
 *  @params {String} keyword
 *  @returns    {Object nas.Pm.Workflow}
 */
nas.Pm.PmWorkflowCollection.prototype.entry = function(keyword,region){
    if(! region) region = 'global';
    if(! this.unique[region]) region = Object.keys(this.unique)[0];
    if(keyword=='%default%'){
        return this.members[this.active];//第一エントリーを戻す
    }
    for (var ix = 0 ; ix < this.members.length ; ix++){
        for (var uix = 0 ;uix < this.unique[region].length ; uix ++){
            var prp = this.unique[region][uix].split('.');
            if (this.members[ix][prp[0]][prp[1]]==keyword)
                return this.members[ix];
        }
    }
}
nas.Pm.PmWorkflowCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.PmWorkflowCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
/*
 *    ワークフロー設定データストリームパーサ
 *    ダンプメソッドで書き出したデータを取り込んでコレクションを再設定する
 *    @params {String}  dataStream
 *    @params {String}  form
 *          data-format JSON|full-dump|plain-text
 */
nas.Pm.PmWorkflowCollection.prototype.parseConfig = function(dataStream,form){
    if(! dataStream) return false;
    var myMembers =[];
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('pmTemplates');
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            if(tempObject[rix].timestamp){
                this.timestamp = tempObject[rix].timestamp ;
                continue ;
            }
            var currentMember=new nas.Pm.Workflow(
                this,
                tempObject[rix].name,
                JSON.stringify(tempObject[rix])
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.Pm.Workflow(
                this,
                currentRecord[0],
                dataStream[rix]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      var currentStream = [];
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
        if(currentField.indexOf("workflow:") >= 0){
            var workflowName = currentField.slice(currentField.indexOf("workflow:")+9).trim();
            if(currentMember){
                currentMember.parse(currentStream.join("\n"));
                myMembers.push(currentMember);
            }
            currentMember = new nas.Pm.Workflow(this,workflowName);
            currentStream.length = 0;
        }else{
            currentStream.push(currentField);
        }
      }
      currentMember.parse(currentStream.join("\n"));
      myMembers.push(currentMember);
    }
    return this.addMembers(myMembers);
}
nas.Pm.PmWorkflowCollection.prototype.dump = nas.Pm._dumpList;

/**    
 *  制作管理用 ワークフローオブジェクト
 *  ワークフローオブジェクトは、ラインテンプレートコレクションを兼ねる
 * @constractor
 *  @params {Object}  parent
 *    @params {String}  workflowName
 *    @params    {String}  dataStream
 */
//ワークフロー記述用ラインテンプレートコレクション配列
nas.Pm.Workflow = function(parent,workflowName,dataStream){
    this.parent    = parent;//ワークフローコレクション
    this.name      = workflowName;
    this.members   = [];//ラインテンプレートコレクションメンバー
    this.summary   = [];//メンバー内のサマリと集計ターゲットを合成して一次変数にする
    this.aggregate = [];
    this.unique  = {
        global :["line.name","line.shortName","line.lineName"]
    }
    if(dataStream) this.parse(dataStream);
};
/**
 * ラインテンプレートコレクションへのメンバー追加メソッド
 * 配列型データのみを受け入れる
 * 重複チェックはなし 上書き
 *  @params {Array of Array} templates
 */
nas.Pm.Workflow.prototype.addTemplate = function(templates){
        if(! templates[0] instanceof Array){templates = [templates];}
    for (var eid = 0;eid<templates.length ; eid ++){
        if(templates[eid] instanceof nas.PM.LineTemplate){}
//引数: トレーラーオブジェクトの参照,ライン識別名,ステージコレクションの内容配列,サマリ記述配列
        this.members[eid] = new nas.Pm.LineTemplate(this.parent.parent,templates[eid][0],templates[eid][1],templates[eid][2],templates[eid][3]);
    }
};
/*  テンプレートコレクションメンバーの対象ラインを検索して該当するテンプレートを返す
 *  @params     {String} keyword
 *  @returns    {Object nas.Pm.LineTemplate}
 */
nas.Pm.Workflow.prototype.entry = function(keyword,region){
    if(! region) region = 'global';
    if(! this.unique[region]) region = Object.keys(this.unique)[0];
    if(keyword=='%default%')　return this.members[0];//本線を返す
    for (var ix = 0 ; ix < this.members.length ; ix++){
        for (var uix = 0 ;uix < this.unique[region].length ; uix ++){
            var prp = this.unique[region][uix].split('.');
            if (this.members[ix][prp[0]][prp[1]]==keyword)
                return this.members[ix];
        }
    }
}
nas.Pm.Workflow.prototype.addMembers = nas.Pm._addMembers;
/**
 *   設定データストリームパーサ
 *   ワークフローテンプレートセットの書き出しを受け取ってオブジェクトを設定する
 *   各設定はクリア後に上書き
 *   @params {String} dataStream
 *   @params {String} form
 *       data format JSON|full-dump|plain-text
 */
nas.Pm.Workflow.prototype.parse = function(dataStream,form){
    if(! dataStream) return false;
    var myMembers =[];
//形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
        if (dataStream.match(/\{.+\}/)) form='JSON';
        else if (dataStream.match(/^\[.+\]$/)) form='full-dump';//配列１ラインダンプ
        else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        this.name = tempObject.name;
        for (var rix=0;rix<tempObject.members.length;rix++){
            var currentMember=new nas.Pm.LineTemplate(
                this.parent.parent,
                tempObject.members[rix].line,
                tempObject.members[rix].stages,
                tempObject.members[rix].summary,
                tempObject.members[rix].aggregate
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':
        var currentContent=JSON.parse(dataStream);
        this.name = currentContent[0];
        for(var rix = 0; rix < currentContent[1].length; rix++){
            var currentRecord = currentContent[1][rix];
            var currentMember=new nas.Pm.LineTemplate(
                this.parent.parent,
                currentRecord[0],
                currentRecord[1],
                currentRecord[2],
                currentRecord[3]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        if(dataStream[rix].indexOf("workflow:") >= 0){
            this.name = dataStream[rix].slice(dataStream[rix].indexOf("workflow:")+9).trim();
            continue;
        }
        var currentField=dataStream[rix];
        if((currentMember)&&(currentField.match( /^\t([a-z]+)\:(.+)$/i ))){
            if(RegExp.$1=='stages'){
                var stages=(RegExp.$2).split(',');
                for (var sid=0;sid<stages.length;sid++){
                   currentMember.stages.addStage(stages[sid],currentMember.parent.stages.entry(stages[sid]));
                }
            } else if(RegExp.$1=='summary'){
                currentMember.summary=(RegExp.$2).split(',');
            } else if(RegExp.$1=='aggregate'){
                currentMember.aggregate=(RegExp.$2).split(',');
            } else {
                currentMember[RegExp.$1]=RegExp.$2;//追加プロパティ用
            }
        } else if(currentField.match( /^.+$/i )) {
            if(currentMember) myMembers.push(currentMember);
            currentMember = new nas.Pm.LineTemplate(this.parent.parent,currentField,[]);
        }
      }
      myMembers.push(currentMember);
    }
    for(var mix=0;mix<myMembers.length;mix ++){
        if(myMembers[mix].summary){
            for(var six=0;six<myMembers[mix].summary.length;six ++){
                this.summary.add(myMembers[mix].summary[six]+'.'+myMembers[mix].line.toString()+'.');
            }
        }
        if(myMembers[mix].aggregate){
            for(var aix=0;aix<myMembers[mix].aggregate.length;aix ++){
                this.aggregate.add(myMembers[mix].aggregate[aix]+'.'+myMembers[mix].line.toString()+'.');
            }
        }
    }
    return this.addMembers(myMembers);
}
/**
 ワークフローオブジェクト単体の文字列化メソッド
    @params {String} form
         出力フォーマット JSON|full-dump|plain-text
    @returns {String}
         取り込み可能出力またはオブジェクト名
*/
/*
toString(form) テキスト設定形式で書き出す
plain-text|dull-dump|JSON
*/
nas.Pm.Workflow.prototype.toString = function(form){
    switch(form){
    case 'JSON':
        var result ={ name: this.name };
        result.members = [];
        for(var mx = 0 ; mx < this.members.length; mx ++){
            result.members.push(JSON.parse(this.members[mx].toString('JSON')))
        }
        return JSON.stringify(result);
    case 'full-dump':
    case 'full':
    case 'dump':
        var result =[
            this.name,
            []
        ];
        for(var mx = 0 ; mx < this.members.length; mx ++){
            result[1].push(JSON.parse(this.members[mx].toString('dump')))
        }
        return JSON.stringify(result);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
       var result = "workflow:"+this.name + "\n";
        for(var mx = 0 ; mx < this.members.length; mx ++){
            result += this.members[mx].toString('plain-text');
            result += '\n';
        }
      return result;
    break;
    default:
        return this.name;
    }
};

//nas.Pm.Workflow.prototype.dump = nas.Pm._dumpList;

/**
    @params {String} statusDescription
    nas.Pm.JobStatus
    Jobの状況（＝カットの作業状態）を保持するオブジェクト
    content:作業状態を示すキーワード
    Startup|Active|Hold|Fixed|Completed|Reorder|Aborted
    standby|awaiting|holding|fixed|compleated|rework|(aborted)
    初期値は"Startup"
    マスター管理に観点に立つ下側のワードでも良い
    大文字小文字は問わない
    対応するそれぞれのワードは等価とする
    頭文字はおおむね同じなので aborted以外は省略形として英１文字でも可
    自動生成の記載は Startup|Active|Hold|Fixed|Completed|Reorder|Aborted

作業状態に従いステータスは遷移する
データが
    assign:{Object nas.UserInfo}アクティブまたは中断状態でない作業が持つ次作業者の指名UIDまたは文字列（特にチェックはない）
        初期値null
        ステータスがActive,Holdの場合この値は現在作業チェックイン中のユーザを示す
        assign.clientIdfが、そのユーザがチェックインしているクライアントアプリケーションの識別情報
    message:次の作業に対する申し送りフリーテキスト
初期値は長さ0の文字列
最長で144文字の文字列
    clientIdf :{String} チェックインしているアプリケーション識別ID
        識別IDは、インストールごとに設定されるので、同一ユーザがチェックインしていてもマシンが異なれば別のID
        重複操作を避けるためのID、マスタを自動管理の際に必要
    sessionIdf:{String} 作業セッション事にサーバから発行されるセッションID
        セッションIDはチェックインごとに設定される
        重複操作を避けるためのID、マスタを自動管理の際に必要
    上記のふたつのパラメータは、管理サーバがない場合は発行も利用もされない

    stageComleted:{Boolean} 工程の完了 ブーリアン
        作業ステータスの終了フラグはどのユーザでも立てることができる、フラグ自体は工程の完了を直接意味しない。
        フラグが立ったカットを、適切な管理者がチェックして実際の完了処理を行う。
        このステータスが'Compleated'に変更されるのは、一般に次ステージ初期化の際に行われる
        初期値 false

初期化引数はステータス識別子または 配列[content,assign,message],ステータス記述のいずれか
assin/messageが存在する場合は出力が以下の形式の文字列となる
    "content:assign:message"
人的マスタ管理の場合は利用されない

eg. fixed:dog@animal.example.com:海の表現は撮影処理

アサイン、メッセージ情報は、ステータスがFixed,Compleated,Reworkの際は、次作業へのアサインメントとなる
Aborted はアサインメントメッセージを持たない

ステータスActive,Hold の場合はサーバからエクスポートされた現在のユーザ情報を置く

    new nas.Pm.NodeStatus()

statusDescription
*/
nas.Pm.NodeStatus = function JobStatus (statusDescription){
//初期値は ""に変更 値はリポジトリ登録成功時に割り当てられるステータスとする
//    this.parent  = parent;
    this.content    = ""    ;//{String} Startup|Fixed|Compleated|Rework|Active|Holding|Aborted|''
    this.assign     = new nas.UserInfo("");//{Object} nas.UserInfo
    this.clientIdf      = "";//{String} クライアントアプリケーションID
    this.sessionIdf     = "";//{String} セッションID(サーバが発行する)
    this.message        = "";//{Stirng}
    this.stageCompleted = false;//ステージの持つフラグ

    if(statusDescription) this.parse(statusDescription);
}
/**
 *    引数をパースする
 *    @params {Object JobStatus|String|Array}  statusDescription
 *    nas.Pm.NodeStatusオブジェクトの場合は　プロパティの複製を行う
 *    配列の場合は   [content,assign,message]|[content,assign,clientIdf,sessionIdf]
 *    文字列の場合は  <content>:<assign>:<massage>:<message>...|<content>:<assign>:<clientIdf>:<sessionIdf>
 *    @returns    {Object this}
Content予約語 日本語も解釈するが、内部値としては使用されない 出力時にオプションで利用可能？

    Aborted
    (aborted)
        欠番（全体作業中断）解除されるまですべてが凍結

    A
    Active
    awaiting
        発注済み サーバがある場合は発注識別子を登録
        アサインメントなし
        サーバ存在時はclientIDを記録して,sessionIDを発行

    C
    compleated
        完了フラグ付き作業終了
        アサインメントメッセージ付加可能

    F
    fixed
        フラグなし作業終了
        アサインメントメッセージ付加可能

    H
    hold
    holding
        保留中 管理上はAと等価

    R
    rework
        差戻しフラグ付き作業終了
        アサインメントメッセージ付加可能


 *
 */
 nas.Pm.NodeStatus.prototype.parse = function(statusDescription){
    if ((statusDescription instanceof nas.Pm.NodeStatus)||(statusDescription.content)){
//ノードステータスオブジェクトが与えられたケース
          this.content    = statusDescription.content;
          if(this.assign instanceof nas.UserInfo){
              this.assign.parse(statusDescription.assign);
          }else{
              this.assign = new nas.UserInfo(statusDescription.assign);
          }
          this.clientIdf  = statusDescription.clientIdf;
          this.sessionIdf = statusDescription.sessionIdf;
          this.message    = (typeof statusDescription.message == 'undefined')? '':statusDescription.message;
    }else if (statusDescription instanceof Array){
//配列で引数を与えられたケース
        var prpArray = statusDescription;
        if(prpArray.length){
          this.content = prpArray[0];
          this.assign  = (prpArray.length > 1)? new nas.UserInfo(prpArray[1]):new nas.UserInfo("");
          if(this.content.match(/^(active|awaited|hold|holding|A|H)$/i)){
              this.clientIdf  = (prpArray.length > 3)? prpArray[2]:"";
              this.sessionIdf = (prpArray.length > 4)? prpArray[3]:"";
              this.message = "";
          }else{
              this.clientIdf  = "";
              this.sessionIdf = "";
              this.message = (prpArray.length > 1)? (prpArray.splice(2).join(':')):"";
          }
        }
    }else if(statusDescription){
//それ以外のケース(文字列)
        var prpArray = String(statusDescription).split(':');
        if(prpArray.length){
//引数をいったん原型のまま格納
          this.content = prpArray[0];
          if (prpArray.length > 1){
            this.assign.parse(decodeURIComponent(prpArray[1]))
          }

          if(this.content.match(/^(active|awaited|hold|holding|A|H)$/i)){

              this.clientIdf  = prpArray[2];
              this.sessionIdf = prpArray[3];
              this.message = "";
          }else{
              this.clientIdf  = "";
              this.sessionIdf = "";
//              this.message = (prpArray.length > 2)? (prpArray.splice(2).join(':')):"";
          }
          this.message = (prpArray.length > 2)? decodeURIComponent(prpArray.splice(2).join(':')):"";
        }
    }
    this.content = nas.Pm.NodeStatus.normalize(this.content);//最後に本体データを正規化する
    if(this.content == 'Compleated') this.stageCompleted = true;
    return this;
}
/*TEST
    var A = new nas.Pm.NodeStatus('Startup');
    A.parse([
        "Fixed",
        "USER-HANDLE:uid@example.com",
        "ご配慮どうもありがとうございます:原画時どうぞよろしくおねがいします"
    ]);
    A;
    var B = new nas.Pm.NodeStatus('fixed:作監様:よろしくお願いします')
*/
/**
 *    @params {Boolean}   opt
 *    フルサイズ出力フラグ 
 */
nas.Pm.NodeStatus.prototype.toString = function(opt){
/*    if((this.parent) && (this.content=='')){
        return this.parent.getStatus();
    }else ;// */ 
    if(opt){
        var result = [this.content];
        if(this.assign!="") result.push(this.assign.toString());
        if((this.content=="Fixed")||(this.content=="Startup")||(this.content=="Completed")){
            if(this.message!="") result.push(this.message);
        }else if((this.content=="Active")||(this.content=="Hold")){
            if(this.clientIdf!="")  result.push(this.clientIdf);
            if(this.sessionIdf!="") result.push(this.sessionIdf);
        };
        return result.join(':');
    }else{
//シンボル化したステータスのみを返す
     return nas.Pm.NodeStatus.symbolize(this.content);
    };
}
/**
 *    @params {String}   status
 *     ステータス文字列を評価して表象値で返す
 *      A,C,F,H,R,S||(aborted)
日本語の文字列を評価対象に加える
A   作業中 ◯ ○
C   完了 了
F   終了 あがり ●
H   待ち 保留
R   再作業 差戻 戻
S   待機 未着手
(aborted)   欠番 中断 凍
 */
nas.Pm.NodeStatus.symbolize = function(status){
    if(status.match(/abort|欠番|中断|欠/i)) return "(aborted)";
    status = status.replace(/作業中|◯|○|IN/i   ,'a');
    status = status.replace(/完了|了|終/      ,'c');
    status = status.replace(/終了|あがり|●|UP/i ,'f');
    status = status.replace(/待|保留|留/     ,'h');
    status = status.replace(/再作業|差戻|戻|リテイク|リ/,'r');
    status = status.replace(/未発注|未着手|未/ ,'s');
    var result = status.charAt(0).toUpperCase();
    if(("ACFHRS").indexOf(result) < 0)return ""; 
    return result;
}
/*日本語のカット表のためのシンボル化*/
nas.Pm.NodeStatus.symbolizeJ = function(status){
    return ["○","了","●","待","戻","未"][("ACFHRS").indexOf(nas.Pm.NodeStatus.symbolize(status))];
}
/* TEST
    nas.Pm.NodeStatus.symbolize("aborted")
    nas.Pm.NodeStatus.symbolize("active")
    nas.Pm.NodeStatus.symbolize("fixed")
    nas.Pm.NodeStatus.symbolize("balance")
    
    nas.Pm.NodeStatus.symbolizeJ("aborted")
    nas.Pm.NodeStatus.symbolizeJ("active")
    nas.Pm.NodeStatus.symbolizeJ("fixed")
    nas.Pm.NodeStatus.symbolizeJ("balance")
*/
/**
 *    @params {String}   status
 *     ステータス文字列を評価して正規化された旧形式の文字列で返す
 *      Active,Compleated,Fixed,Hold,Rework,Startup||(aborted)
 */
nas.Pm.NodeStatus.normalize = function(status){
    if(status.match(/abort|欠番|中断|凍|欠/i)) return "Aborted";
    var ix = ["A","C","F","H","R","S"].indexOf(nas.Pm.NodeStatus.symbolize(status)); 
    if(ix >= 0) return ["Active","Compleated","Fixed","Hold","Rework","Startup"][ix];
    return "";//空文字列を返す
}
/* TEST
    nas.Pm.NodeStatus.normalize("aborted")
    nas.Pm.NodeStatus.normalize("active")
    nas.Pm.NodeStatus.normalize("fixed")
    nas.Pm.NodeStatus.normalize("balance")
    
*/
nas.Pm.JobStatus = nas.Pm.NodeStatus
/**   制作管理用 Job|ManagementNode オブジェクト
 *  @params {String}    jobDescription
 *      ジョブ記述
 *第１形式(フルスペック)
 *      "##[<jobname>]:<job-id>\n
 *       ##status  = <job-status>\n
 *       ##assign  = <job-assign>:<job-message>\n
 *       ##created = <date>:<user>\n | ##checkin  = <date>:<user>\n
 *       ##updated = <date>:<user>\n | ##checkout = <date>:<user>\n
 *       ##slipNumber=<slipNumber>"
 *第２形式(略式)
 *      "<job-id>:<job-name>"|"<job-name>:<job-id>
 *      不正記述は初期化失敗させる
 *  @params {Object}    parentTrailer
 *      ノードの所属する親トレーラー（nas.Pm.NodeManager）
 *  @params {Object nas.Pm.ManagementStage} parentStage
 *      ノードの親ステージ　ステージ内のノードCollectionへ自身を登録して、IDをチェックする
 *      
 *  @params {String}    slipNumber
 *      経理システム接続ID
 *  @params {String}    statusDescription
 *      ステータス記述
 */
 
/*  プロパティ
 * name {String} ジョブ名
 * // line {Object Line} 所属ライン＜＜不要 stage にライン情報が含まれるので不用
 * stage {Object Stage} 所属ステージ
 * type {Number typeID} 0:init/1:primary/2~:check/ 当該Jobのタイプ
 * id Number:Index ステージ内でのユニークID 自己アクセスのための配列インデックスを内部保持
 * jobId生成規則
 * 管理単位所属ステージ内部でユニークな整数ID 重複不可 飛び番等は許容される
 * DB連結時はDBへの照合プロパティになるので初期化時には引数として外部から与えるのが基本
 * 引数が与えられない（＝DB連結が無い）場合は、その場での自動生成を行う
 * その際のルールは、同PmStage内部での出現順連番 0はStartupJobとして予約 
 * currentStatus String:ステータス startup|active<>hold|fixed|ok|ng|finished
 * createUser String:UID
 * createDate String:DATE
 * updateUser String:UID
 * updateDate String:DATE
 * slipNumber String:伝票番号
 * new Job(jobName?)
 *  制御関連は各ステージの持つアセットがステージ内で完結する構造により無用の概念となる
 *  更新権利の概念は消失したので不要 これを持って制御する事項が無い
 *  アセット（ステージ）間の衝突の検知は必用
 *  
 *  作業状態(nodeStatus)の遷移
 *       startup|standby 初期化状態（未着手）
 *       ↓（一方通行）
 *       active|awaiting ⇐⇒ hold
 *       ↓    ↓
 *       fixed/finished/(aborted)/compleated/rework
 *          
 *          floating
 *
 *  activeには本作業中とチェック作業中が含まれる
 *  holdは、作業をサーバ側で預かっている状態 作業権限の無いユーザはアクティブに遷移出来ない
 *  fixed|finisthed は、ラインの作業が完成した状態 ほぼ同じ状況だが、finishedはステージの完成を表すフラグを含む
 *  abortedは、ライン自体が中断（破棄）された状態 中断からの復帰が可能なので reject,discard,destruct 等では無いが実質同等
 *
 *  ステータス属性は基本的には作業の状態変数であるが、同時のそのステージの状況でありラインの状態である。並行する他のラインには影響しない
 *
 *  ラインステータスはライン自身がもつ
 *  対になる記述の制御はこのオブジェクトに持たせる
 * 
 * 
    new nas.Pm.ManagementJob(
        jobDescription:"原画",
        parentTrailer:Object,
        parentStage:Object,
        slipNumber:{String},
        statusDescription:
    )
 */
nas.Pm.ManagementJob = function ManagementNode(jobDescription,parentTrailer,parentStage,slipNumber,statusDescription){

    this.name           ;//{String} jobName|undefined
    this.id         = -1;//{Number} jobId Integer -1 初期化前
    this.name       = "";//{String} job name
/*     { jobDescription=String(jobDescription);
      if(jobDescription.match(/^\d*$/)) jobDescription += ':[]';
      var prpArray=jobDescription.split(':');
      if(prpArray.length){
        if(prpArray[0].match(/^\d+$/)){prpArray.reverse();}
        if(String(prpArray[1]).match(/^\d+$/)) this.id = parseInt(prpArray[1]);
        this.name=prpArray[0].replace(/^\[|\].*$/g,'');
      }
    };// */
    this.parent         = (parentTrailer instanceof nas.Pm.NodeManager)? parentTrailer:null;//{Object nas.Pm.NodeManager}
    this.stage          = (parentStage instanceof nas.Pm.ManagementStage)? parentStage:null;//{Object nas.Pm.ManagementStage} parentStage
    this.type           ;//{String} init|primary|check
    this.slipNumber     ;//{String} optional slip number
    if(slipNumber) this.slipNumber = String(slipNumber);
    this.jobStatus  = new nas.Pm.NodeStatus(statusDescription);
    if(typeof xUI != 'undefined'){
//{Object nas.UserInfo|String userAccount}
        this.createUser = new nas.UserInfo(xUI.currentUser);
        this.updateUser = new nas.UserInfo(xUI.currentUser);
    }else{
        this.createUser = "";
        this.updateUser = "";
    };
    this.createDate     = new Date();//{Object Date|String date}
    this.updateDate     = new Date();//{Object Date|String date}

    if(jobDescription) this.parse(jobDescription);

    if(this.stage){
        var stageNodeCount = this.stage.jobs.length;
        if(this.id < 0) this.id = stageNodeCount;
        this.stage.jobs.add(this,function(tgt,dst){return (tgt.id == dst.id)});
        if(this.stage.jobs.length > stageNodeCount){
            if((this.id == 0)&&(this.jobStatus.content == '')) this.jobStatus.parse('Startup');
            if(this.parent){
                var nodeCount = this.parent.nodes.length;
                this.parent.nodes.add(this,function(tgt,dst){
                    return ([tgt.stage.parentLine.id.join('-'),tgt.stage.id,tgt.id].join(':') == [dst.stage.parentLine.id.join('-'),dst.stage.id,dst.id].join(':'))}
                );
                if(nodeCount < this.parent.nodes.length){
//追加に成功したのでソート（作成時系列）
                    this.parent.nodes.sort(function(a,b){return (a.createDate-b.createDate);})
                };
            };
        };
    };
};
/**
    本体オブジェクトの再現情報を得る
    createDate: Tue May 26 2020 19:32:41 GMT+0900
    createUser: <userString>
    id: <job-Id>ステージごと0開始のアドレス（固定　ユニーク）
    jobStatus: JobStatus {content: "Startup", assign: "", clientIdf: "", sessionIdf: "", message: "", …}
    name: "init"
xMapAsset, …}
    updateDate: Tue May 26 2020 19:32:41 GMT+0900 (日本標準時) {}
    updateUser: undefined
以下のプロパティは編集不可(不要)で
    parent: NodeManager {parent: nas.Pm.PmUnit, lines: Array(1), stages: Array(1), nodes: Array(1), exList: {…}}
    stage: ManagementStage {parentLine: ManagementLine, id: 0, name: "絵コンテ撮", stage: nas.Pm.ProductionStage,asset: 
    @params {Boolean}   asObj
        オブジェクト取得フラグ    
    @returns    {String|Object}
        デフォルトでJSONテキストが戻る

*/
nas.Pm.ManagementJob.prototype.get = function(asObj){
    var result = {
        name        :this.name,
        id          :this.id,
        type        :(this.type)?this.type:'',
        slipNumber  :(this.slipNumber)?this.slipNumber:'',
        createUser  :(this.createUser)?this.createUser.toString():'',
        updateUser  :(this.updateUser)?this.updateUser.toString():'',
        createDate  :this.createDate.getTime(),
        updateDate  :this.updateDate.getTime(),
        jobStatus   :JSON.parse(JSON.stringify(this.jobStatus))
    };
    return (asObj)? result:JSON.stringify(result);
}
nas.Pm.ManagementJob.prototype.put = function(input){
    if((typeof input == 'string')&&(input.indexOf('{')==0)){input = JSON.parse(input);}
        this.name   = input.name;
        this.id     = input.id;
        this.type   =(input.type)? input.type:'';
        this.slipNumber = (input.slipNumber.length)?this.slipNumber:'';
        if(input.createUser) this.createUser.parse(input.createUser);
        if(input.updateUser) this.updateUser.parse(input.updateUser);
        this.createDate.setTime(input.createDate);
        this.updateDate.setTime(input.updateDate);
        this.jobStatus.parse(input.jobStatus); 
    return this.get();
}
/*TEST
    var A = xUI.XMAP.pmu.nodeManager.lines[0].stages[0].jobs[0].get();
    xUI.XMAP.pmu.nodeManager.lines[0].stages[0].jobs[0].put(A)
*/
/**
    引数文字列をパースして本体オブジェクトに適用する
    @params {String} nodeDescription
*/
nas.Pm.ManagementJob.prototype.parse = function(nodeDescription){
	if(! nodeDescription) return this;
//新形式 "[LO+3]R   2024/05/12 12:12:12  note slipNumber:123456"
    if(
        (typeof nodeDescription == 'string')&&
        (nodeDescription.match(/^\[([^\]]*)\]([ACFHRS]*)\s/i))
    ){
//現在冒頭のステージ＋ステップ｜ステータスのみをパースしているので注意 20240617
         var iValue = RegExp.$1; var pValue = RegExp.$2;
         iValue     = nas.plParse(iValue);
console.log(iValue,pValue)
        if(iValue.name == "(abortedt)"){
            this.jobStatus.content = nas.Pm.NodeStatus.normalize("abort");
        }else{
            this.stage = new nas.Pm.ManagementStage(iValue.name,null);//略記法はステージ情報を含む
            this.name  = nas.plEncode(iValue.name,iValue.count,"+");//ジョブ名はプラスルース名称に固定
            this.id    = parseInt(iValue.count);//
            if(pValue){
                this.jobStatus.content = nas.Pm.NodeStatus.normalize(pValue);
            };
        };
        return this;
    };
	if(nodeDescription.indexOf('##') != 0){
		nodeDescription = '##[' + nodeDescription +']';
	}
	var infoArray = nodeDescription.split('\n');
	for (var ix = 0 ; ix < infoArray.length ; ix ++){
		if(infoArray[ix].match(/^##([^=]+)\s*=?\s*(.*)$/)){
			var nAme=(RegExp.$1).trim();var vAlue=(RegExp.$2).trim().replace(/;*$/,'');
			switch(nAme){
			case	"status":
				this.jobStatus.content = vAlue;
			break;
			case	"assign":
			case	"message":
			case	"clientIdf":
			case	"sessionIdf":
				this.jobStatus[nAme] = vAlue;
			break;
			case	"compleated;":
				this.jobStatus.stageCompleated = true;
			break;
			case	"created":
			case	"checkin":
				vAlue = vAlue.split('/');
				this.createUser = new nas.UserInfo(vAlue.splice(-1)[0]);
				this.createDate = new Date(vAlue.join('/'));
			break;
			case	"updated":
			case	"checkout":
				vAlue = vAlue.split('/');
				this.updateUser = new nas.UserInfo(vAlue.splice(-1)[0]);
				this.updateDate = new Date(vAlue.join('/'));
			break;
			case	"slipnumber":
			case	"manager":
			case	"worker":
				this[nAme] = vAlue;
			break;
			default:
			    if(nAme.match(/^\[(.+)\]\/?$/)) nAme = RegExp.$1;
				if(nAme.match(/^\d*$/)) nAme += ':[]';
				var prpArray=nAme.split(':');
				if(prpArray.length){
					if(prpArray[0].match(/^\d+$/)){prpArray.reverse();}
					if(String(prpArray[1]).match(/^\d+$/)) this.id = parseInt(prpArray[1]);
					this.name=prpArray[0].replace(/^\[|\].*$/g,'');
				}
			}
		}
	}
	return this;
};
/*TEST
new nas.Pm.ManagementJob(
    jobDescription,
    parentTrailer,
    parentStage,
    slipNumber,
    statusDescription
)
    new nas.Pm.ManagementJob("[LO++]R",null,'','00123456');//新設の略式表記　記述内にステージ・jobID・ステータスを内包している

    new nas.Pm.ManagementJob("[原画作業]:1",null,'原画:6','00123456')
    new nas.Pm.ManagementJob("2:彩色チェック",null,'仕上:8','01234567')
    new nas.Pm.ManagementJob("3",null,'LO:2','12345678')
    new nas.Pm.ManagementJob(`##[[BOM]id:4]
##status=Fixed;
##assign=%5Btrue%2C%22%22%5D;
##created=Mon Jan 20 2020 09:47:59 GMT+0900 (日本標準時)/kiyo:kiyo@nekomataya.info;
##updated=Mon Jan 20 2020 09:47:59 GMT+0900 (日本標準時)/kiyo:kiyo@nekomataya.info;
`,
    null,
    'LO:2',
    '12345678'
    );

    new nas.Pm.ManagementJob('[LO+]',null,'02_LO','slip-number','[LO+]A  6/3  演出入れ')

*/
/**
    nodePathを返す
    
*/
nas.Pm.ManagementJob.prototype.getPath = function(form){
    if(!arguments.length){form = 'full'}
    switch(form){
    case "index":
    case "id":
        return [this.id,this.stage.getPath("id")].join(".");
    break;
    case "name":
        return ['['+this.name+']',this.stage.getPath("name")].join(".");
    break;
    case "job":
        return ['['+this.name+']',this.id].join(':');
    break;
    case "full":
    default:
//        return [this.id,this.name].join(':');
        return [[this.id,'['+this.name+']'].join(':'),this.stage.getPath("full")].join(".");
    }
}
/**
    終端ノードからの距離を返す（sessionRetorace相当）
    
*/
nas.Pm.ManagementJob.prototype.getDistance = function(){
    var jobDistance = (this.stage.jobs.length - this.stage.jobs.indexOf(this) -1);//ステージ内の終端からの距離
    var stageId = this.stage.parentLine.stages.indexOf(this.stage);//所属ステージの所属ライン上のId
    for( var ix = (stageId + 1) ; ix < this.stage.parentLine.stages.length ;ix++ ){
        jobDistance += this.stage.parentLine.stages.length;
    }
    return jobDistance;
}
/**
    ノードの情報（概要）を文字列化して返す
    @params {String} form
        引数なし    xMap|Xpstダンプ出力
        キーワード
            'easy'  xMap|Xpst簡易ダンプ出力
            'line'  
            'stage' 
            'full'  
        true|false 順置|倒置の切り替え
*/
nas.Pm.ManagementJob.prototype.toString = function(form){
    var myResult        = "";
    if((typeof form == 'undefined')||(form == 'eazy')){
// myResult            += "##["+this.stage.name+"][["+this.name+"]"+"id:"+this.id+"]\n";
        myResult            += "##[["+this.name+"]"+"id:"+this.id+"]\n";
        if(this.jobStatus.content){
            myResult +=  "##status="+this.jobStatus.content+";\n";
            if(this.jobStatus.assign)  myResult +=  "##assign="+this.jobStatus.assign+";\n";
            if(this.jobStatus.message) myResult +=  "##message="+this.jobStatus.message+";\n";
            if(this.jobStatus.stageCompleted) myResult +=  "##completed;\n";
        }else{
            myResult +=  "##status=Floating;\n";
        }
//        myResult            += "##created="+this.createDate+"/"+this.createUser+";\n";
        myResult            += "##checkin  = "+this.createDate+"/"+this.createUser+";\n";
//        myResult            += "##updated="+this.updateDate+"/"+this.updateUser+";\n";
        myResult            += "##checkout = "+this.updateDate+"/"+this.updateUser+";\n";
        if(this.manager)    myResult += "##manager="+this.manager+";\n";
        if(this.worker)     myResult += "##worker="+this.worker+";\n";
        if(this.slipNumber) myResult += "##slipNumber="+this.slipNumber+";\n";
        var myGroups        = new Array();
//stageが文字列のケースが発生しているのでトラップが必要
        if(
            (this.stage)&&(this.stage instanceof nas.Pm.ManagementStage)&&
            (this.stage.parentLine.parent instanceof nas.Pm.NodeManager)&&
            (this.stage.parentLine.parent.parent)
        ){
            var myMapElements   = this.stage.parentLine.parent.parent.parent.elementStore;
//XPSの配下のJobにはエレメントストアが無い
            if(! myMapElements) myMapElements = [];
//エレメント総当りで ジョブに対応するグループを抽出
            for (var eID=0 ; eID < myMapElements.length ; eID++){
                if((myMapElements[eID] instanceof nas.xMap.xMapGroup)&&(myMapElements[eID].link===this.stage)){
                    myGroups.push(myMapElements[eID].link); 
                }
            }
//登録グループごとにエレメント総当りで ジョブ内のグループに対応するエレメントを抽出して出力に加算
            for (var gID=0;gID<myGroups.length;gID++){
                myResult+="["+myGroup[gID].name+"\t"+myGroup[gID].type+"]\n";
                for (var eID=0;eID<myMapElements.length;eID++){
                    if((myMapElements[eID] instanceof nas.xMap.xMapElement)&&(myMapElements[eID].link===this)){
                        myResult+=myMapElements[eID].toString();//
                    }
                }
//  myResult+="["+myGroup[gID].name+"]/\n";//グループ終了子は省略可
            }
        }
//    myResult+="##[["+this.name+"]]/\n";//終了子をここでは出力しない　呼び出し側で処置　
    }else{
        myResult = (form)?
            [this.id,"["+this.name+"]"].join(':'):
            ["["+this.name+"]",this.id].join(':');
    }
    return myResult;
};
/**
    ジョブをリムーブする
    ジョブに所属するすべてのアセットエレメントをすべて削除して、更に自分自身を削除
    親ステージの所属ジョブが0になった場合は、ステージの削除メソッドを呼び出す
*/
nas.Pm.ManagementJob.prototype.remove = function(){
    if(this.parent.parent.parent instanceof nas.xMap){
        var xmap = this.parent.parent.parent;
        for (var gix = xmap.elementGroups.length - 1 ; gix >=0 ; gix --){
            if(xmap.elementGroups[gix].link == this) xmap.elementGroups[gix].remove();
        }
    }
    this.stage.jobs.splice(this.stage.jobs.indexOf(this),1);
    if(this.stage.jobs.length == 0) this.stage.remove();
    this.parent.nodes.splice(this.parent.nodes.indexOf(this),1);

    if((this.parent)&&(this.parent.parent instanceof nas.Pm.PmUnit)){
        if(this.parent.parent.checkinNode === this) this.parent.parent.checkinNode = undefined;
        if(this.parent.parent.currentNode === this){
             this.parent.parent.currentNode = undefined;
             this.parent.parent.currentNode = this.parent.getNode();
          }
    }
    return this;
}
/*TEST
    xUI.XMAP.pmu.nodeManager.getNode().remove();//成功する
    xUI.XMAP.pmu.nodeManager.nodes[0].remove();//成功する
*/
/**
    JOB名称ストア
    クラス内でDBとして働くコレクション
    このオブジェクト（配列）がDBと通信を行う
    引数:   jobName,targetStage,jobType
            ジョブ名,所属ステージ名,ジョブタイプ
    配列要素は引数の配列である必要あり。
    実際のジョブは定義されるものではなく、名称をその場で決めて開始することが可能
    これらの設定は、
 */
nas.Pm.JobTemplate = function(jobName,targetStage,jobType){
    this.jobName   = jobName    ;
    this.targetStage  = targetStage;
    this.jobType   = jobType    ;
};
nas.Pm.JobTemplate.prototype.toString = function(form){
    switch(form){
    case    'JSON':
        return JSON.stringify({
            jobName:this.jobName,
            targetStage:this.targetStage,
            jobType:this.jobType
        });
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        return JSON.stringify([this.jobName,this.targetStage,this.jobType]);
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        return ([
            this.jobName,
            "\ttargetStage:"+this.targetStage,
            "\tjobType:"+this.jobType
        ]).join('\n');
    break;
    default:
        return this.jobName;
    }
};
nas.Pm.JobTemplateCollection = function(myParent){
    this.parent  = myParent ;
    this.members = [];
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    this.unique  = {local:["jobName"]};
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('jobNames');
}
/**
    ジョブテンプレートコレクション
    一括登録メソッド
    
*/
nas.Pm.JobTemplateCollection.prototype.addNames = function(names){
    if(! names[0] instanceof Array){names = [names];}
    for (var eid = 0;eid<names.length ; eid ++){
        this.members[eid] = new nas.Pm.JobTemplate(names[eid][0],names[eid][1],names[eid][2]);
    }
}
nas.Pm.JobTemplateCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.JobTemplateCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
/**
    テンプレート取得
    引数に従ってJobテンプレートから必要な集合を抽出して返す
引数:
    ステージキーワード   layout LO レイアウト　等
    ジョブタイプ  init/primary/check/* ジョブタイプ'*'は primary+check (! init)
*/
nas.Pm.JobTemplateCollection.prototype.getTemplate = function(stage,type){
    if((! stage)||(! type)){return []};
    var result=[];
    for (var eid = 0;eid<this.members.length ; eid ++){
        if((this.members[eid].jobType == type)||(this.members[eid].jobType == "*")||(type == "*")&&(this.members[eid].jobType != "init")){
            if((this.parent.stages.getStage(this.members[eid].targetStage) === this.parent.stages.getStage(stage))||(this.members[eid].targetStage == "*")){
                var jobName         = this.members[eid].jobName;
                var parentStage = this.parent.stages.getStage(stage);
                if(( jobName.indexOf("*") >= 0)&&(parentStage)){
                    var myString = jobName.replace(/\*/,parentStage.name);
                }else{
                    var myString = jobName;
                }
                result.push(myString);
            }
        }
    }
    return result;
}
nas.Pm.JobTemplateCollection.prototype.dump = nas.Pm._dumpList;
/*  設定パーサ
nas.Pm.JobTemplate (jobName,targetStage,jobType)
*/
nas.Pm.JobTemplateCollection.prototype.parseConfig = function(dataStream,form){
    var myMembers =[];
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('jobNames');
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            if(tempObject[rix].timestamp){
                this.timestamp = tempObject[rix].timestamp ;
                continue ;
            }
            var currentMember=new nas.Pm.JobTemplate(
                tempObject[rix].jobName,
                tempObject[rix].targetStage,
                tempObject[rix].jobType
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':	
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.Pm.JobTemplate(
                currentRecord[0],
                currentRecord[1],
                currentRecord[2]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
/*plainフォーマット
entryName
	prop:value
	prop:value
*/
        if((currentMember)&&(currentField.match( /^\t([a-z]+)\:(.+)$/i ))){
        	currentMember[RegExp.$1]=RegExp.$2;
        } else if(currentField.match( /^.+$/i )) {
        	if(currentMember) myMembers.push(currentMember);
        	currentMember = new nas.Pm.JobTemplate(currentField);
        };
      };
      myMembers.push(currentMember);
    }
    return this.addMembers(myMembers);
}
/*
function(form){
    if(form == 'JSON'){
        return JSON.stringify(this.members);//JSON.stringify不能なオブジェクトがあるので注意
    }else if(form == 'dump'){
        var result="[";
        for (var ix =0 ; ix<this.members.length;ix++){
            result += this.members[ix].toString('dump');
            result += ((ix+1)<this.members.length)? ",\n":"]\n";
        }
        return result;
    }else{
        var result="[";
        for (var ix =0 ; ix<this.members.length;ix++){
            result += this.members[ix].toString(true);
            result += ((ix+1)<this.members.length)? ",\n":"]\n";
        }
        return result;
    }
}
*/
/**
 * @params {String} stageName
 * @params {Object nas.Pm.StageCollection} myParent
 *<pre>
 *   制作管理用 Stageオブジェクト
 *
 * name String 識別名称:作品内での一意性を求められる
 * line Object ステージが所属するラインへの参照
 * code String 省略表記用短縮コード ２〜３バイトを推奨 ユニークであること
 * shortName String 画面表示用略称 ８文字程度までを推奨 指定のない場合はnameを転用
 * description String ステージの説明 ユーザのために必用
 * output Asset ステージの出力アセット
 * staffs Object スタッフリスト（リスト）
 * ステージは必ずステージコレクションを介してラインに所属するので、親ラインの参照はコレクション側のline属性で保持する。
 * ステージ内では、コレクションを parent プロパティで示す　従って親のラインを参照するパスは this.parent.line
 *</pre>
 */
nas.Pm.ProductionStage = function(stageName,myParent){
    this.parent = myParent  ;//{Object nas.Pm.StageCollection} 
    this.name   = stageName ;//{String stageName}
    this.code       ;//{String}
    this.shortName  ;//{String}
    this.description;//{String}
    this.output ;//{Object Asset}
    this.stageName  ;
}
//nas.Pm.ProductionStage.prototype.getPath = function(){return [this.name,this.parent.line.getPath()].join(".")}

nas.Pm.newStage = function(myStage,myLine){
    var newStage= nas.Pm.pmdb.stages.getStage(myStage);//参照をとっているが、これは複製？
    if(newStage){
        newStage.line=myLine;
        return newStage;
    }else{
  //ステージは未登録なので、新規ステージ編集？
        return new nas.Pm.ProductionStage(myStage,myLine);
  　}
}
nas.Pm.ProductionStage.prototype.toString = function(form){
    
    switch(form){
    case 'JSON':
        return JSON.stringify({
            name:this.name,
            code:this.code,
            shortName:this.shortName,
            description:this.description,
            output:this.output,
            stageName:this.stageName
        });
    break;
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.code,
            this.shortName,
            this.description,
            this.output
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.stageName,
            "\tname:"+this.name,
            "\tcode:"+this.code,
            "\tshortName:"+this.shortName,
            "\tdescription:"+this.description,
            "\toutput:"+this.output
        ]).join('\n');

    default:
    return this.name;
    }
};

/**
 *  ステージ情報を保持するオブジェクト
 *  @param {String} stageDescription|
 *  ステージを表す記述
 *   '0:(trunk)//1:LO'等のステージまでの記述
 *  @example
 *  var A= new nas.Pm.ManagementStage("1:原画");
 *  var A= new nas.Pm.ManagementStage("原画:1");
 *  整数id部は前置・後置どちらの型式でも良い
 *   ':' は省略不可  xMap/Xps への記録時は後方型式を推奨
 *  ステージIDは、全行程を通しての通番となる
 *  重複あり(ラインIDを加えて初めてユニークになる)
 */
nas.Pm.ManagementStage = function ManagementStage(stageDescription,parentLine){
    this.parentLine = (parentLine instanceof nas.Pm.ManagementLine)? parentLine:null;//上位ライン
    this.id     = -1;//無名でid=-1のオブジェクトは初期化前
    this.name   = '';
    this.stage  = null;//{}
    this.asset  = null;//ステージが初期化される際にアセットも同時に初期化される
    this.jobs   = [];//配下のジョブスタック
    this.composite   = false;//Boolean ステージをコンポジットラインに投入するフラグ
    this.compositeId = -1;//ステージのコンポジットライン上のID
    this.removed;//削除フラグ　

    if(stageDescription) this.parse(stageDescription);
}
/**
 *    ステージ記述のパース
 *  @param {String} stageDescription
 *  ステージ記述が セパレータを含まないステージのみの単独記述であった場合本線ラインのステージであるとみなして初期化を行う
 */
nas.Pm.ManagementStage.prototype.parse = function(stageDescription){
    if(! stageDescription) return this;
    if(stageDescription){

//console.log(stageDescription);
      stageDescription=String(stageDescription);
      if(stageDescription.match(/^\d+$/)) stageDescription += ":"
      var prpArray=stageDescription.split(':');
      if(prpArray.length){
        if(prpArray[0].match(/^\d+$/)) prpArray.reverse();
        if(String(prpArray[1]).match(/^\d+$/)) this.id = parseInt(prpArray[1]);
        this.name=prpArray[0];
        this.stage=nas.pmdb.stages.entry(this.name);
        if(this.stage){
//console.log(this.stage);
            this.name = this.stage.name;
            var asset = nas.pmdb.assets.members[this.stage.output];//直接呼び出し
            if(asset) this.asset = new nas.xMap.xMapAsset(asset.name,asset,this);//xMapAsset初期化
        };
//else{this.stage=nas.pmdb.stages.entry('%default%');}
      }
    }
//    else{    this.stage  = nas.pmdb.stages.entry('%default%');}
    if(this.stage == null){
        this.stage  = nas.pmdb.stages.entry('%default%');
    }
    if(this.asset == null){
        var asset   = nas.pmdb.assets.entry('%default%');
        this.asset  = new nas.xMap.xMapAsset(asset.name,asset,this);//xMapAsset初期化
    }

    if(this.parentLine){
        if(this.parentLine.id.join('-')=='0-0'){
//初期化時に親ラインがコンポジットラインであった場合の処理
            this.composite=true;
        }
        if(this.id < 0){
            if(this.parentLine.parent.stages.length == 0){
                this.id = 0;//本線初期ステージ
            }else{
                this.id = this.parentLine.getLastNade().stage.id + 1;
            }
        }
        var lineStageCount = this.parentLine.stages.length;
        this.parentLine.stages.add(this,function(tgt,dst){return (tgt.id == dst.id);});
        if(lineStageCount < this.parentLine.stages.length){
//親ラインに追加成功
            if(this.parentLine.stages.length > 1) this.parentLine.stages.sort(function(a,b){return (a.id-b.id);});
            if(this.parentLine.stages.length > lineStageCount){
                var stgCount = this.parentLine.parent.stages.length;
                this.parentLine.parent.stages.add(this,function(tgt,dst){
                    return ([tgt.parentLine.id.join('-'),tgt.id].join(':') == [dst.parentLine.id.join('-'),dst.id].join(':'));
                });
                if(stgCount < this.parentLine.parent.stages.length){
                    this.parentLine.parent.stages.sort(function(a,b){
                        if((a.jobs[0])&&(b.jobs[0])){
                        return (a.jobs[0].createDate-b.jobs[0].createDate);
                        }else{
                            return 0;
                        }
                    });
                }
                if(this.composite){
console.log(this.parentLine);
                    var compStageCount = this.parentLine.parent.lines.composite.stages.length;
                    if(this.compositeId < 0) this.compositeId = compStageCount;
                    this.parentLine.parent.lines.composite.stages.add(this,function(tgt,dst){return (tgt.compositeId == dst.compositeId);});
                    if(compStageCount < this.parentLine.parent.lines.composite.stages.length){
                        this.parentLine.parent.lines.composite.stages.sort(function(a,b){return (a.compositeId-b.compositeId);})
                    }
                }
            }
        }else{
//衝突検出 後続オブジェクトのプロパティを上書き
            var stgIdx = this.id;
            var currentStage = this.parentLine.stages.find(function(elm){return (elm.id == stgIdx)});
            currentStage.name = this.name;
        }
    }
    return this;
}
/**
    本体オブジェクトの再現情報を得る
    this.id     = -1;//初期状態で無名　id=-1のオブジェクトは初期化前
    this.name   = '';
    this.stage  = null;//ステージキーワードで保存　ステージ定義オブジェクトへの参照　通常は編集不可
    this.asset  = null;//アセットIDで保存　ステージにリンクする実際のアセットエントリへの参照　通常は編集不可　ステージ登録時は同時に登録
    this.jobs   = [];//配下のジョブスタック　ジョブの内容を全て
    this.composite   = false;//Boolean ステージをコンポジットラインに投入するフラグ
    this.compositeId = -1;//ステージのコンポジットライン上のID

以下のプロパティは編集不可(不要)で
    parentLine = (parentLine instanceof nas.Pm.ManagementLine)? parentLine:null;//上位ライン

    @params {Boolean}   asObj
        オブジェクト取得フラグ    
    @returns    {String|Object}
        デフォルトでJSONテキストが戻る

*/
nas.Pm.ManagementStage.prototype.get = function(asObj){
    var result = {
        id          :this.id,
        name        :this.name,
        stage       :(this.stage)? this.stage.stageName:null,
        asset       :(this.asset)?this.asset.id:null,
        composite   :this.composite,
        compositeId :this.compositeId,
        jobs  :[]
    };
    for (var ix = 0;ix<this.jobs.length;ix++){
        result.jobs.push(this.jobs[ix].get(true));//get as Object
    }
    return (asObj)? result:JSON.stringify(result);
}
/**
    ステージの内容書換（復帰含む）
    @params {String}    input
    JSONデータ
*/
nas.Pm.ManagementStage.prototype.put = function(input){
    if((typeof input == 'string')&&(input.indexOf('{')==0)){input = JSON.parse(input);}
        this.id     = input.id;
        this.name   = input.name;
        var stg = nas.pmdb.stages.entry(input.stageName);
        if(stg !== this.stage)  this.stage = stg;//ステージ変更があった場合は接続を変更（まず無い）
if(this.parentLine.parent.parent)
        this.asset  = this.parentLine.parent.parent.parent.assetStore[input.asset];
        this.composite = input.composite;
        this.compositeId = input.compositeId;
//jobコレクション全更新
    if(this.jobs.length > input.jobs.length)
        for (var rx = this.jobs.length - 1 ;rx >= input.jobs.length ;rx--) this.jobs[rx].remove();
    for (var ix = 0;ix<input.jobs.length;ix++){
        if(! this.jobs[ix])
            var newEntry = new nas.Pm.ManagementJob(
                [input.jobs[ix].id,input.jobs[ix].name].join(':'),
                this.parentLine.parent,
                this,
            );
        this.jobs[ix].put(input.jobs[ix]);
    }
    return this.get();
}

/**
 *  @params {String} form
 *      result type　name|index|full
 *  <pre>
 *      name : {常用の名称}
 *      index: {整数ID}
 *      full : {整数ID}:{常用の名称}
 *  </pre>
 *  @example
   line=new nas.Pm.ManagementLine("(美術):1");
   line.id = [1,0];
   stage=new nas.Pm.ManagementStage("美術原図",line);
   line.id = [1,0];
    A = line.getPath('name') ;// (美術).
    B = line.getPath('index');// 0-1.
    C = line.getPath('full') ;// 0-1:(美術).
 */

nas.Pm.ManagementStage.prototype.getPath = function getPath(form){
    if(!arguments.length){form = 'full'}
    switch(form){
    case "index":
    case "id":
        return [this.id,this.parentLine.getPath("id")].join(".");
    break;
    case "name":
        return [this.name,this.parentLine.getPath("name")].join(".");
    break;
    case "stage":
        return [this.name,this.id].join(':');
    break;
    case "full":
    default:
        return [[this.id,this.name].join(':'),this.parentLine.getPath("full")].join(".");
    }
}
/**
 *   ステージのステータスを取得する
 *   ステージ自体は自身のステータスプロパティをもたず、自身の最新ステータスを返す
 */
nas.Pm.ManagementStage.prototype.getLastNode = function(){
    if(this.jobs.length){
        return this.jobs[this.jobs.length - 1];
    }
    return null;
}
/**
 *   ステージのステータスを取得する
 *   ステージ自体は自身のステータスプロパティをもたず、自身の最新ステータスを返す
 */
nas.Pm.ManagementStage.prototype.getStatus = function(){
    if(this.jobs.length){
        return this.jobs[this.jobs.length - 1].jobStatus;
    }
    return null;
}
/**
 *  @param {bool} opt
 * 整数id部前置・後置切り替えオプション
 */
nas.Pm.ManagementStage.prototype.toString = function(opt){
    if(opt)     return [this.id,this.name].join(':');
    return [this.name,this.id].join(':');
}
/**
 * 整数id部を、次ステージのために繰り上げる</ br>
 * 次ステージ名が与えられない場合は、IDのゼロ埋め３桁の数値に置き換える
 *  @param {String} myString　次ステージ名
 */
nas.Pm.ManagementStage.prototype.increment = function(myString){
    this.id   = nas.incrStr(String(this.id));
    this.name = (myString)? myString:nas.Zf(this.id,3);
    return this;
}
/**
 * ステージを削除する
 * ラインの最終ステージのみが削除可能
 * ジョブをもたない場合のみ削除可能
 */
nas.Pm.ManagementStage.prototype.remove = function(){
    if(this.parentLine.stages.indexOf(this) != (this.parentLine.stages.length-1)) return false;
    if(this.jobs.length > 0) return false;
    this.parentLine.parent.stages.splice(this.parentLine.parent.stages.indexOf(this),1);
    this.parentLine.stages.splice(-1);
    if((this.parentLine.stages.length == 0)&&(this.parentLine.id.join('-')!='0')) this.parentLine.remove();
    return this;
} 
/**    ステージコレクション
 *
 *  クラス内でDBとして働くオブジェクト
 *  このオブジェクトがDBと通信する
 *   ステージにテンプレートとしてスタッフコレクションを持たせる拡張を行う
 */
nas.Pm.StageCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique  = {
        global :["stageName","name","code","shortName"]
    }
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('stages');
}

nas.Pm.StageCollection.prototype.dump = nas.Pm._dumpList;
nas.Pm.StageCollection.prototype.getStage = nas.Pm._getMember;
nas.Pm.StageCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.StageCollection.prototype.addMembers = nas.Pm._addMembers
nas.Pm.StageCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
//ステージコレクション追加メソッド
/*
引数：
stageName
myStage ステージオブジェクト　または　プロパティリスト配列
*/
nas.Pm.StageCollection.prototype.addStage = function(stageName,myStage){
    if(myStage instanceof nas.Pm.ProductionStage){
        this.members[stageName]= myStage;
    }else if(myStage instanceof Array){
    this.members[stageName] = new nas.Pm.ProductionStage(myStage[0],null);
//    this.members[stageName].name=myStage[0];
    this.members[stageName].code        = myStage[1];
    this.members[stageName].shortName   = myStage[2];
    this.members[stageName].description = myStage[3];
    this.members[stageName].output      = myStage[4];
    this.members[stageName].stageName   = stageName;
    }
}

/*
設定パーサ
*/
nas.Pm.StageCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('stages');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/))          form = 'JSON';
    else if(configStream.match(/.+\,\[.+\]/)) form = 'full-dump';
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData.timestamp;
                continue;
            };
            var tempData = configData[prp];
            var newStage         = new nas.Pm.ProductionStage(prp,this);
            newStage.stageName   = prp;
            newStage.name        = tempData.name;
            newStage.code        = tempData.code;
            newStage.shortName   = tempData.shortName;
            newStage.description = tempData.description;
            newStage.output      = tempData.output;
            newMembers.push(newStage);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newStage         = new nas.Pm.ProductionStage(tempData[1][0],this);
            newStage.stageName   = tempData[0];
            newStage.name        = tempData[1][0];
            newStage.code        = tempData[1][1];
            newStage.shortName   = tempData[1][2];
            newStage.description = tempData[1][3];
            newStage.output      = tempData[1][4];
            newMembers.push(newStage);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentStage=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentStage)){
                currentStage[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentStage) newMembers.push(currentStage);
                currentStage=new nas.Pm.ProductionStage(configStream[ir],this);
                currentStage.stageName=String(configStream[ir]);
            }
        }
        newMembers.push(currentStage);
    }
    return this.addMembers(newMembers);
}
/**
 *    次のステージの候補を抽出する関数
 *  @params {String}    stageName
 *    ライン識別子//ステージ識別子
 *  @returns    {Array of Stage}
 *    引数のステージの出力アセットから、そのアセットが呼び出し可能なステージを得て展開する
 */
nas.Pm.StageCollection.prototype.getTemplate = function(stageName){
    var result=[];
    var myStageAsset =this.parent.assets.entry(this.getStage(stageName).output);
    var newStageList=(myStageAsset)? myStageAsset.callStage:[];
    for (var idx = 0 ;idx < newStageList.length ; idx ++){
        var myStage = this.getStage(newStageList[idx]);//null可能性あり
        if(myStage) result.push(myStage.name);
    }
    return result;
}
/*
 *  <pre>
 *    ステージコレクション内からスタートアップ候補（開始デフォルト）のステージを取得するメソッド
 *    第一ステージとなるアイテムはステージコレクションに最初に置かれたステージ
 *    for(var itm in this.menbers) で最初に出てくるステージのこと
 *    ↑これはgetStage=_getMember に統合　したので不要</pre>
 * @example
 *  nas.Pm.StageCollection.prototype.getStartup =function(){
 *      for(var itm in this.members){return itm;break;}
 *  }
 *
 */

/*
定義テーブルからテンプレートを取得するための機能
名前と検索先(指定がない場合はcallerから判定)を与えて、その定義テーブル内のオブジェクト引数を返す
あたるべきプロパティはname,code,shortName,fullName オブジェクトによってはいくつかのプロパティを持たないものものある

*/

/*制作管理用 ProductionLineオブジェクト

name String 識別名称:作品内での一意性を求められる
shortName String 画面表示用略称 ８文字程度までを推奨 指定のない場合はnameを転用
outputAsset Object Asset ラインの出力アセット
initAsset Object Asset ラインの入力アセット
code String 省略表記用短縮コード ２〜３バイトを推奨 ユニークであること
description String ラインの説明 ユーザのために必用
*/

nas.Pm.ProductionLine = function　ProductionLine(lineName){
    this.lineName;
    this.name;
    this.shortName;
    this.outputAsset;
    this.initAsset;
    this.code;
    this.description;
}
/**
 *  @params {String}    form
 *      output form type JSON|full-dump|plain-text|<propname>
 *  @returns {String}
 *      formated string
 */
nas.Pm.ProductionLine.prototype.toString = function(form){
    switch (form){
    case 'JSON':
        return JSON.stringify({
            name:this.name,
            shortName:this.shortName,
            outputAsset:((this.outputAsset)?this.outputAsset.toString():this.outputAsset),
            initAsset:((this.initAsset)?this.initAsset.toString():this.initAsset),
            code:this.code,
            description:this.description
        });
    break;
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.shortName,
            (this.outputAsset)?this.outputAsset.toString():this.outputAsset,
            (this.initAsset)?this.initAsset.toString():this.initAsset,
            this.code,
            this.description
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.lineName,
            '\tname:'+this.name,
            '\tshortName:'+this.shortName,
            '\toutoputAsset:'+((this.outputAsset)?this.outputAsset.toString():null),
            '\tinitAsset:'+((this.initAsset)?this.initAsset.toString():null),
            '\tcode:'+this.code,
            '\tdescription:'+this.description
        ]).join('\n');
    break;
    default:
        return (this[form])? this[form]:this.name;
    }
};
/**
 *  @constractor
 *  制作管理用 ManagementLineオブジェクト
 *  ライン記述を与えて、DBから該当するラインを取得して管理用インスタンスを作る
 *  @params {String}    lineDescription
 *      id は記述に含まれる値をパースして使用する
 *      idがコンフリクトした場合はリジェクト
 *      正常なidが得られなかった場合もリジェクト
 *  @params {Array} parentTrailer
 *      比較は行うが、idの生成は行わない
 *  @params {Object nas.Pm.ManagementJob}    branchNode
 *      optional ブランチ元ノード
 *  @params {Array of String}     deregations
 *      branchラインに制御権を委託されるグループ名リスト
 *      
 *  予約ID'0-0'を与えてコンポジットラインを初期化することが可能
 *  ID'0-0'でコンポジットラインを初期化した場合、parent.lines.compositeプロパティへ設定する　通常のラインコレクション外となる
 *  
 */
nas.Pm.ManagementLine = function ManagementLine(lineDescription,parentTrailer,branchNode,deregations){
    this.parent =(parentTrailer)?parentTrailer:null;
    this.id     = [];//
    this.name   = '';//又は'trunk'
    this.line   = null;
    this.stages = [];//ステージスタック Collectionである必要はない？
    this.parentNode  = null;//親ノード 親ノードの無い本線の場合、自分自身を指す　未設定の場合はnull
//branchプロパティは設定しない ブランチ記述はparentNodeから導く
//    this.status = new nas.Pm.nodeStatus();
    this.deregations = [];//そのライン下で委任されて管理されるグループ名のリスト 存在しない場合は要素なしの配列
    this.removed ;//削除フラグ

    if(lineDescription) this.parse(lineDescription,branchNode,deregations);
    if(this.id.length == 0){
        this.id = [0];
        if((this.parent)&&(this.parent.lines)&&(this.parent.lines.length)){
//最終ラインの次分岐　[1,X,X] > [2]
          this.id = [this.parent.lines[this.parent.lines.length - 1].id[0]+1];
        }
    }
}

nas.Pm.ManagementLine.prototype.parse = function(lineDescription,branchNode,deregations){
//description parser
    if(! lineDescription) return this;
    if(lineDescription){
        lineDescription = String(lineDescription);
// 1-1:(背景-3D) , (背景-3D):1:1 , 0: , :0 
        if(lineDescription.match(/^:?[\d\-]+:?\s*$/)) lineDescription = lineDescription.replace( /:?\s*$/ ,'').replace(/-/g,':').replace(/^:?/,"():");// IDのみでライン名が省略されているケースを　後置型に変換　():#:#:#
        
      var prpArray = lineDescription.split(':');
      if(prpArray.length > 2){
//要素数3以上ならば必ずID後置 "(name):0:2:1"のタイプ
        this.name = prpArray[0].replace(/^\(|\)$/g,"");
        this.id   = prpArray.slice(1);
      } else if(lineDescription.length > 0){
        if (prpArray[0].match(/^[\d\-]+$/)) prpArray.reverse();
        //　"0-2-1:(name)"前置型　または
        if (prpArray[1]) this.id = prpArray[1].split('-');
        this.name = prpArray[0].replace(/^\(|\)$/g,"");
      }
//set property
      this.line = nas.pmdb.lines.entry(this.name);//nullのケースあり
      if(this.line) this.name = this.line.name;

    if((branchNode)&&(branchNode instanceof nas.Pm.ManagementJob)){
            this.parentNode = branchNode;//parentNodeを設定する
    }else{
      if((this.parent)&&(this.parent.lines)){
    /*
    親ラインがあればラインIDをフォールダウンさせて探索
    0からブランチ1,2,3,4,5...
    1からブランチ1-1,1-2,1-3...
    親ラインの最終ステージ、最終ノードを親ノードに設定する
    */
        if(this.id.length == 1){
                var parentLineId = [0];
        }else{
                var parentLineId = this.id.slice(0,-1);
        }
        for(var lix=0;lix<this.parent.lines.length;lix<0){
            if(this.parent.lines[lix].getPath('id')==(parentLineId.join('-')+'.')){
                this.parentNode = this.parent.getNode("*.*."+this.parent.lines[lix].getPath('id'));
                break;
            }
        }
      }
    }
    if(deregations) this.setDeregations(deregations);

      if(
        (this.id.length > 0)&&
        (this.parent)&&(this.parent instanceof nas.Pm.NodeManager)
      ){
      if(this.id.length==0){
//引数でIDが与えられなかった場合は本線の最終ノードからの分岐ラインとみなす
        branchNode = this.parent.getNode('*.*.0.');
        this.id = (this.parent.lines.length == 0)? [0]:[1];
        for (var cl = 0;cl < this.parent.lines.length ; cl ++){
            if((this.parent.lines[cl].id.length == 1)&&(this.parent.lines[cl].id[0] >= this.id[0])
            ) this.id[0] = this.parent.lines[cl].id[0] + 1;
        }
      }
//console.log(this.id.join('-'));
        if(this.id.join('-') == '0-0'){
//console.log(this);
          this.parent.lines.composite = this;
          this.parentNode = this.parent.lines[0];//自身のほうが良いかも
        } else {
          var lineCount = this.parent.lines.length;
          var current = null;
          if((this.parent.lines.length == 0)||(this.parent.lines[0].line !== this.line)){
            current = this.parent.lines.add(this,function(tgt,dst){
              return (
                (tgt.line != null)&&
                (tgt.id.length == dst.id.length)&&
                (tgt.id.join('-') == dst.id.join('-'))
              )
            });
          }
//console.log([current,lineCount,this.parent.lines.length,this.getPath()]);
          if((lineCount < this.parent.lines.length)&&(this.parent.lines.length > 1)){
//新規ラインの追加に成功 衝突なし　コレクションをソート
              this.parent.lines.sort(function(a,b){
                  if((a.getLastNode())&&(b.getLastNode())) return (a.getLastNode().updateDate-b.getLastNode().updateDate);
                  return 0;
                });
          }else if((this.parent.lines.length)&&(current != null)){
//衝突検出　新オブジェクトのプロパティで旧データを上書きする(後置優先)
                var lineIdx = this.id.join(',');
                var currentline = this.parent.lines[current];//
                currentline.name        = this.name;
                currentline.parentNode  = this.branchNode;
                currentline.deregations = this.deregations;
          }
        }
      }
    }
    return this;
};//parse
/*TEST
    A = new nas.PmManagementLine(
        '1:(背景美術)',
        xUI.XMAP.pmu.nodeManager,
        xUI.XMAP.pmu.nodeManager.getNode(),
        ["BG","BOOK1","BOOK2"]
    );

*/
/**
    本体オブジェクトの再現情報を得る

    this.id          = []  ;//配列ID 0,0はコンポジットライン
    this.name        = ''  ;//又は'trunk'　ライン名
    this.line        = null;//pmdb上の定義エントリ　文字列で記載
    this.parentNode  = null;//親ノードのノードパス(.getPath('id')で得られる値)
    this.stages      = []  ;//ステージスタック Collectionである必要はない？
    this.deregations = []  ;//そのライン下で委任されて管理されるグループ名のリスト 存在しない場合は要素なしの配列

以下のプロパティは編集不可(不要)で
    this.parent =(parentTrailer)?parentTrailer:null;

    @params {Boolean}   asObj
        オブジェクト取得フラグ    
    @returns    {String|Object}
        デフォルトでJSONテキストが戻る

*/
nas.Pm.ManagementLine.prototype.get = function(asObj){
    var result = {
        id          : this.id,
        name        : this.name,
        line        : (this.line)? this.line.lineName:null,
        parentNode  : (this.parentNode)?this.parentNode.getPath('id'):null,
        deregations : this.deregations.slice(),
        stages      : []
    };
    for (var ix = 0;ix<this.stages.length;ix++){
        result.stages.push(this.stages[ix].get(true));//get as Object
    }
    return (asObj)? result:JSON.stringify(result);
};//get
/**
    ステージの内容書換（復帰含む）
    @params {String}    input
    JSONデータ
*/
nas.Pm.ManagementLine.prototype.put = function(input){
    if((typeof input == 'string')&&(input.indexOf('{')==0)){input = JSON.parse(input);}
        this.id     = input.id;
        this.name   = input.name;
        var lin = nas.pmdb.lines.entry(input.line);
        if(lin !== this.line)  this.line = lin;//ライン変更があった場合は接続を変更（まず無い禁止しても良い　するか）
        this.parentNode  = (input.parentNode)? this.parent.lines.find(function(elm){return (input.parentNode == elm.getPath('id'))}):null;
        this.deregations = input.deregations.slice();
//stageコレクション全更新
    if(this.stages.length > input.stages.length)
        for (var rx = this.stages.length - 1 ;rx >= input.stages.length; rx--) this.stages[rx].remove();
    for (var ix = 0;ix<input.stages.length;ix++){
        if(! this.stages[ix])
            var newEntry = new nas.Pm.ManagementStage(
                [input.stages[ix].id,input.stages[ix].name].join(':'),
                this
            );
        if(this.stages[ix]) this.stages[ix].put(input.stages[ix]);
    }
    return this.get();
};//put
/**
 *    ラインオブジェクトの委任グループをセットする
 *    @params {Array of String} deregations
 *    委任されるグループの名称　配列または',（コンマ）'区切りリスト文字列
 */
nas.Pm.ManagementLine.prototype.setDeregations = function(deregations){
    if(! deregations instanceof Array){
        delegations = String(delegations).split(',');
    }
    this.deregations.length = 0;//clear
    for (var dix=0;dix<delegations.length;dix++) this.delegations.add(delegations[dix]);
    return this.delegations;
}
/**
 *   ラインオブジェクトのbranchプロパティを設定して　親ノードを返す
 *   引数による指定に不整合がある場合は設定を失敗させる
 *   @params {Object nas.Pm.ManagementJob} branchNode
 *   
 *   ブランチ記述の書式は　以下の'/(スラッシュ)'区切りリスト
 *   分岐親ステージパス / 分岐ラインパス / 分岐日付　/ 分岐処理ユーザ
 *   eg. LO:1.(本線):0./(背景美術):1./2016.01.31 18:45:36/kiyo@nekomataya.info
 *
 *分岐ラインパスが、自身のパスと一致する必要がある
 *分岐日時は、本体ラインの制作日時と一致する必要がある
 *分岐処理ユーザが、本体ラインの制作ユーザと一致する必要がある
 *
 *ブランチ元のステージがデータ内に存在する必要は無いが、ラインIDが自身のラインIDと整合する必要がある
 *ステージIDが存在する必要がある。
 *またすでに内部ステージが初期化されたあとならばこのIDが(自身の開始ステージID-1)である必要がある
 *　　branchDescriptionを廃止する　2019.12.25
 */
nas.Pm.ManagementLine.prototype.parseBranch = function(branchNode){
    if(branchNode instanceof nas.Pm.ManagementJob) {
        if(branchNode)
        this.parentNode = branchNode;
    }
    if((this.parent)&&(this.parent instanceof nas.Pm.NodeManager)){
        var parsed = branchNode.split('/');
//第一記述をパース
        var parsedNode = nas.Pm.parseNodePath(parsed[0]);
//第二記述をパース
        var parsedCurrent = nas.Pm.parseNodePath(parsed[1]);
//分岐日時をパース
        var branchTime = new Date(parsed[2]);
//分岐ユーザをパース
        var branchUser = new nas.UserInfo(parsed[3]);

        var parentNode = this.parent.getNode(parsed[0]);
        if(parentNode instanceof nas.Pm.ManagementJob){
            this.parentNode = parentNode;
                return this.parentNode;
        }
    }
    return false;
}
/**
 *  @params {String} form
 *      result type　name|index|full
 *  <pre>
 *      name : {常用の名称}
 *      index: {整数ID}
 *      full : {整数ID}:{常用の名称}
 *  </pre>
 *  @example
   line=new nas.Pm.ManagementLine("(美術):1");
   line.id = [1,0];
    A = line.getPath('name') ;// (美術).
    B = line.getPath('index');// 0-1.
    C = line.getPath('full') ;// 0-1:(美術).
 */
nas.Pm.ManagementLine.prototype.getPath = function(form){
//   return this.line.toString(form)+'.';
    if(!arguments.length){form = 'full'}
    switch(form){
    case "index":
    case "id":
        return [this.id.join('-'),''].join(".");
    break;
    case "name":
        return ['('+this.name+')',''].join(".");
    break;
    case "line":
    case "full":
    default:
        return [[this.id.join('-'),'('+this.name+')'].join(':'),''].join(".");
    }
}
/**
 *   ラインの最新ノードを取得する
 */
nas.Pm.ManagementLine.prototype.getLastNode = function(){
    if(this.stages.length) return  this.stages[this.stages.length - 1].getLastNode();
    return null
}
/**
 *   ラインのステータスを取得する
 *   ライン|ステージは自身のステータスプロパティをもたず、内包する最新ジョブのステータスを返す
 */
nas.Pm.ManagementLine.prototype.getStatus = function(){
    if(this.stages.length) return this.stages[this.stages.length - 1].getStatus();
    return null;
}
/**
 *  @param {bool} opt
 * 整数id部前置・後置切り替えオプション
 */
nas.Pm.ManagementLine.prototype.toString = function(opt){
    if(opt) return [this.id.join('-'),'(' + this.name +')'].join(':');
            return ['(' + this.name +')',this.id.join(':')].join(':');
}
/**
 *  
 * ライン削除
 *  保持ステージが0であること
 *  その場合でも本線は削除できない
 */
nas.Pm.ManagementLine.prototype.remove = function(){
    if(this.stages.length > 0){
        return false;
    }
    if(this.id.join('-') == '0') return false;
    this.parent.lines.splice(this.parent.lines.indexOf(this),1);
    return this;
}
/*    ラインストア

クラス内でDBとして働くコレクションオブジェクト
このオブジェクトがタイトルの下に入り上位オブジェクトがDBと通信する
*/
nas.Pm.LineCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique  = {
        global :["lineName","name","code","shortName"]
    }
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('lines');
}

nas.Pm.LineCollection.prototype.dump = nas.Pm._dumpList;
//function(){    return JSON.stringify(this.members);}
nas.Pm.LineCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.LineCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;

/**
ラインテンプレートの中から指定された名前と一致するオブジェクトを戻す
lineNameと一致していればそのまま、一致するものがない場合はname/shortName/codeを検索してその順で最初に一致したものを戻す
*/
nas.Pm.LineCollection.prototype.getLine = nas.Pm._getMember;
nas.Pm.LineCollection.prototype.entry = nas.Pm._getMember;

/**
 *    ライン設定パーサ
 *
 **/
nas.Pm.LineCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('lines');
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }        
    switch(form){
    case    'JSON':
        var configData=JSON.parse(configStream);
        for ( var prp in configData){
            if(prp == 'timestamp'){
                this.timestamp = configData.timestamp;
                continue;
            };
            var tempData = configData[prp];
            var newLine         = new nas.Pm.ProductionLine();
            newLine.lineName    = prp;
            newLine.name        = tempData.name;
            newLine.shortName   = tempData.shortName;
            newLine.outputAsset = tempData.outputAsset;
            newLine.initAsset   = tempData.initAsset;
            newLine.code        = tempData.code;
            newLine.description  = tempData.description;
            newMembers.push(newLine);
        }
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newLine         = new nas.Pm.ProductionLine();
            newLine.lineName    = tempData[0];
            newLine.name        = tempData[1][0];
            newLine.shortName   = tempData[1][1];
            newLine.outputAsset = tempData[1][2];
            newLine.initAsset   = tempData[1][3];
            newLine.code        = tempData[1][4];
            newLine.description = tempData[1][5];
            newMembers.push(newLine);
        }
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
    default:
        configStream=String(configStream).split('\n');
        var currentLine=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentLine)){
                currentLine[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentLine) newMembers.push(currentLine);
                currentLine=new nas.Pm.ProductionLine();
                currentLine.lineName=String(configStream[ir]);
            }
        }
        newMembers.push(currentLine);
    }
    return this.addMembers(newMembers)
}
/*
    ライン編集メソッド
*/

nas.Pm.LineCollection.prototype.addLine =function(lineName,propList){
    this.members[lineName]              =new nas.Pm.ProductionLine();
    this.members[lineName].lineName     =lineName;
    this.members[lineName].name         =propList[0];
    this.members[lineName].shortName    =propList[1];
    this.members[lineName].outputAsset  =nas.Pm.assets.entry(propList[2]);
    this.members[lineName].initAsset    =nas.Pm.assets.entry(propList[3]);
    this.members[lineName].code         =propList[4];
    this.members[lineName].description  =propList[5];
}
//制作管理用 SCオブジェクト
/*
新規オブジェクト作成は以下のクラスメソッドを利用されたし

nas.Pm.newSC(カット識別子,時間指定文字列);

カット識別子を与えて初期化
分解はクラスメソッドで行う
格納はプロパティを分けて、可能ならばDBと比較対照して校正する？
識別子がフルで与えられなかった場合は、現在アクティブなPmでポイントしている作品で補う

識別子はMapフォーマットドキュメントを参照
[TITLE(セパレータ)][Oo#]OPUS(セパレータ)][[Ss]SCENE(セパレータ)?[Cc]CUT
例：
var sci = new nas.Pm.SCi("ktc#01.s-c123","3+12","OL(1+12)","--(0+0)",framerate,"t@sdjhpozPsakj");

*/
/**
 *  @constractor
 * SCオブジェクトコンストラクタ
 * コンストラクタの引数は、分離を終えた状態で与える
 * プロパティの不足は呼び出し側（newSCi）で行う
 * コンストラクタ内でのチェックはしない
 */
nas.Pm.SCi = function SCi(cutName,cutProduct,cutTime,cutTRin,cutTRout,cutRate,cutFrate,cutId,cutStatus){
    this.name       = (cutName)?cutName:'';//{String} cutName not number
    this.product    = cutProduct;//{Object nas.Pm.Opus|String|undefined} 引数が文字列の場合は初期化後にバックグラウンドで更新処理
    this.time       = (cutTime)?cutTime:'';//{String}  TCで記録 空白可
    this.trin   = new nas.ShotTransition((cutTRin)?  cutTRin :'trin' ,'in' );
    this.trout  = new nas.ShotTransition((cutTRout)? cutTRout:'trout','out');
    this.framerate  = ((cutRate)&&(cutRate instanceof nas.Framerate))? cutFrate : null; //Object nas.Framerate|null;
    this.id         = cutId ;//{String} cutId DB連結用 DBに接続していない場合はundefined
    this.status     = cutStatus;//{String} カットの現在状況 undefined(不定/default)|active|hold|fixed|compleated|(aborted)|
    if(this.name.length){
        var sc = nas.Pm.parseCutIF(this.name);
        this.cut   = (sc.length)?     sc[0]:'';
        this.scene = (sc.length > 1)? sc[1]:null;
    }
    if((this.time.toString().indexOf('//')>0)||(this.time.toString().indexOf(',')>0)){
        var timeData=this.time.replace(/\,/,'//').split('//');
        this.time = timeData[0];//string
        if(!this.framerate) this.framerate = new nas.Framerate(timeData[1]);//object
    }
}
/*TEST
    
*/

/*     現在未使用　nas.Pm.parseIdentifier でSCiオブジェクトは生成済
 *  @params {String} idfString
 *  @params {String} data id
 *
nas.Pm.newSCi = function(idfString,index){
    var mySCi=nas.Pm.parseIdentifier(idfString)
    var mySC= new nas.Pm.SCi(
        mySCi.sci.name,
        mySCi.cut,
        mySCi.scene,
        mySCi.opus,
        mySCi.title,
        nas.FCT2Frm(mySCi.time),
        "",
        "",
        mySCi.framerate
    )
    if(typeof index != 'undefined'){mySC.id=index}

    return mySC
};// */
/**
 *   カットを文字列で返す
 *  @params {String}    form
 *      'cut'   カット識別子のみ
 *      'time'  時間情報つき
 *      'full'  全時間情報文字列
 *      'dump'  xMapフォーマットのダンプ
 */
nas.Pm.SCi.prototype.toString =function(form){
    var myResult="";
    
    switch(form){
    case    'dump':
        myResult+= "##CUT="+this.cut+"\n";
        if(this.scene)     myResult     += "##SCENE="     +this.scene+"\n";
        if(this.product)   myResult     += "##PRODUCT="   +this.product.toString(true)+"\n";
        if(this.time)      myResult     += "##TIME="      +this.time+"\n";
        if(this.trin)      myResult     += "##TRIN="      +this.trin.toString('xps') +"\n";
        if(this.trout)     myResult     += "##TROUT="     +this.trout.toString('xps')+"\n";
        if(this.framerate) myResult     += "##FRAME_RATE="+this.framerate+"\n";
        if(this.status)    myResult     += "##STATUS="+this.status+"\n";
    break;
    case    'cut':
        
        myResult+= ((nas.pmdb.sceneUse)||(this.scene))?["s",this.scene,"-c",this.cut].join(""):this.name;
    break;
    case    'time':
        
        myResult+= ((nas.pmdb.sceneUse)||(this.scene))?["s",this.scene,"-c",this.cut].join(""):this.name;
        if(this.time)   myResult+= "("+this.time+")";
    break;
    case    'full':
        myResult+= (this.scene)?["s",this.scene,"-c",this.cut].join(""):this.name;
        if(this.time)   myResult+= "("+this.time+")";
        if(form == 'full'){
            if(this.trin.frames() > 0)   myResult+= "("+this.trin.toString() +")";
            if(this.trout.frames() > 0)  myResult+= "("+this.trout.toString()+")";
//            if(this.trin)   myResult+= "("+this.trin.toString('xps') +")";
//            if(this.trout)  myResult+= "("+this.trout.toString('xps')+")";
        }
    break;
    default:
        myResult+= ((nas.pmdb.sceneUse)||(this.scene))?["s",this.scene,"-c",this.cut].join(""):this.name;
        if(this.time)   myResult+= "("+this.time+")";
        if(form == 'full'){
            if(this.trin.frames() > 0)   myResult+= "("+this.trin.toString() +")";
            if(this.trout.frames() > 0)  myResult+= "("+this.trout.toString()+")";
        }
    }
       return myResult;
};//
/*
    s-c123(3+12)(trin|)()
*/

nas.Pm.SCi.prototype.valueOf =function(){return this.id;};//

/**
 *       引数をまとめて解釈してSCiオブジェクトを返すPmクラスメソッド 
 *
 *
 */
nas.Pm.newSC = function(myTitleString,myTimeString,myRateString){
    var myInfo      = nas.separateTitleString(myTitleString)
    var myOpus      = nas.newOpus(myInfo[2],myInfo[3]);
    var myTimeInfo  = nas.parseTimeString(myTimeString);
    var myRate      = (myRateString)? new nas.Framerate(myRateString):myOpus.workTitle.framerate;
    var myTime      = myTimeInfo[0];
    var myTrin      = myTimeInfo[1];
    return new nas.Pm.SCi(myInfo[0],myInfo[1],myOpus,myTimeInfo[0],myTimeInfo[1],myTimeInfo[2],myRate);
}
//Test
// A=nas.Pm.newSC("mte02")

/*
    作業管理

new nas.Pm.Issue(Line or LineName,IssueID)
オフライン発行された作業管理情報オブジェクト

ライン単位で発行される

DBからチェックアウト(発行)が行われ、チェックイン（収容）で終了する

.lineId; {String}       issueID 識別ID  文字列処理 専用のパーサを作る
.lineName; {String}     issueName 識別名
.line {Object}          Line 発行されるライン
.checkOut; {string}     date / user
.checkOutDate; {string} date / user
.checkIn; {String}      date / user
.checkInDate; {String}  date / user

.checkStatus; {String} Startup|Active|Hold|Fixed|Finished|Aborted || floating | 

 */
/**
 *  @constractor
 *      書き出し（発行）情報を記録するデータ単位
 *  @params    {String lineDescription|Object nas.Pm.ManagementLine} myLine
 *      ライン記述またはIDをもったラインオブジェクト
 *  @params    {Array of Number} myID
 *      optional    ラインID配列 あれば第一引数の指定を上書きする
 *
 */
nas.Pm.Issue = function(myLine,myID){
    this.line=(myLine instanceof nas.Pm.ManagementLine)? myLine:null;//Object:Pm.line if exists link
    //名前指定時は 次の拡張では初期化時点でシステム上の既存ラインを検索、存在しない場合はライン新規登録用の機能を呼び出す
    this.lineId         = new String(myID);//String:index 
    this.name           = (myLine instanceof nas.Pm.ManagementLine)? this.line.name:myLine;//String:name
    this.checkOut       = nas.CURRENTUSER;//String:uid
    this.checkOutDate   = new Date();//Date;
    this.checkIn        ;//String:uid undefined
    this.checkInDate    ;//Date: undefined
    this.checkStatus      = "startup";//String:startup active hold fixed aborted 
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
}
/*
    IssueにJSONの入出力を設置する必用あり
    issue.timestampは廃止予定　202001
*/
nas.Pm.Issue.prototype.toString = function(){
    var myResult = "";
    myResult     += "##CHECK_OUT=("+this.name+"):"+this.lineId+" / "+this.checkOutDate.toNASString()+" / "+this.checkOut +";\n";
    if(this.checkInDate)
    myResult     += "##CHECK_IN=("+this.name+"):"+this.lineId+" / "+this.checkInDate+" / "+this.checkIn +";\n";
    myResult     += "##TIMESTAMP=" + this.timestamp +";\n";
    return myResult
}
/*
    Issue識別子　ラインに対しての発行となるので、ライン情報のみを返す
*/
nas.Pm.Issue.prototype.getIdentifier = function(){
    if (this.line) return this.line.toString(true);
    var myResult = "";
    myResult     += this.lineId+':('+this.name+')';
    return myResult
}
/*
    LineIssueCollection
    issue  コレクション
    発行されたライン記述をパースする機能と文字列化する機能をオブジェクトメソッドで加える
    支線の発行/合流機能を持たせる
    LineIssueCollection.branch(newIssue) : boranchedLines
     自分自身の現在のコピーをつくって新たなIssues オブジェクトで返す
    LineIssueCollection.merge(LineIssueCollection) : mergedLines
     与えられたIssuesをマージする。コンフリクト判定が必用
    LineIssueCollection.parse(LineString) : initLinesItself
    


    本体にチェックインされてクローズされたブランチを戻す
    引数無しでコールされた場合、条件をチェックして可能なら本体をクローズする
    
    LineIssueCollection.toString() : LineString
    LineIssueCollection.valueOf() : currentIssue

これらのメソッドは、さらに外側のｘMapにも同名メソッドが必用
このメソッドはそちらから呼ばれるのが前提でありユーザやアプリケーションが直接呼び出すことは無いとしておく
不正引数のハンドリングはしない

ライン発行コレクションはラインの作業状態を保持するコレクション
作業状態はアクティブなラインの作業状態を保存する＞＞ステージ／ジョブの作業状態が反映される
日付情報は、チェックアウト・チェックインを独自に保存
*/
nas.Pm.LineIssueCollection = function LineIssueCollection(myIssue,myParent){
    this.currentId=0;//Int currentLine Array index
    this.body=[myIssue];// {Array of nas.Pm.Issue};
    this.parent=myParent;//{Object nas.Pm.PmUnit|xMap|Xps};
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
//編集可能プロパティリスト
/*
  "currentId"       : 編集禁止（書き換え対象外）
  "parent"          : 編集禁止（書き換え対象外）
*/
    this.exList = {
        "*"          : { "get": "toString"  , "put": "parse"   },
        "timestamp"  : { "get": "toString"  , "put": "direct"  }
    };
}
nas.Pm.LineIssueCollection.prototype.valueOf =function(){return this.body[this.id]};

/*
    Issue
*/
nas.Pm.LineIssueCollection.prototype.toString = function(check){
    var myResult="";
    myResult+="##LINE_ID=("+ this.body[this.currentId].name +"):"+this.body[this.currentId].lineId+"\n";
    myResult+="##currentStatus="+ this.body[this.currentId].currentStatus+"\n";
//    myResult+="##currentNode="+ this.body[this.currentId].currentNode+"\n";
    for (var iix=0;iix<this.body.length;iix++){myResult+=this.body[iix].toString();}
    return myResult;
}
/* branch(新規ライン名)
    ブランチ
    既存のラインと同名のブランチが指定された場合ブランチは失敗 false を戻す
    ただし現在の実装だと、支線側で親のラインを把握していないので 重複の可能性を排除できない
    DB接続時は、マスターDBに問い合わせを行う処理が必用
    最終的には同名のラインは許容される
    ブランチはノードマネージャーの機能に移動される　20190522
*/
nas.Pm.LineIssueCollection.prototype.branch = function(newLineName){
    for(var ix =0;ix<this.body.length;ix++){if(this.body[ix].name==newLineName) return false;};//重複をリジェクト
    var currentDepth    = this.body[this.currentId].lineId.split(":").length;//現在の分岐深度
    var branchCount     = 0;
    for(var ix =0;ix<this.body.length;ix++){if(this.body[ix].lineId.split(":").length==currentDepth) branchCount++;};
    var newBranchId     = (this.body[this.currentId].lineId=="0")? branchCount :this.body[this.currentId].lineId+":"+branchCount;
    var newIssue        = new nas.Pm.Issue(newLineName,newBranchId);
    this.body.push(newIssue);
    var newIssues       = new nas.Pm.LineIssueCollection(newIssue);
    return newIssues;
}
/* merge(Issueオブジェクト)
//支線のIssues配列をマージする 今日は検査は保留20160505
マージの手順
マージされる側のラインのステータスを検査 startup,active,hold のラインはマージ不可 処理失敗
fixed,abortedのラインのみがマージ可能
マージ側のトランクに対する被マージ（親）側の該当するラインを閉じる（チェックイン）
同時にマージ側のラインを同じタイムスタンプで閉じる
親ラインに未登録のサブラインは、ここでマージされる。
この時点で発給されたラインにマージ（チェックイン）されていないラインはこれ以降のマージは親ラインに対して行なわれる。
＝クローズした子ラインに対するマージは、データの整合性を脅かすので禁止

*/
nas.Pm.statuses={"startup":0,"active":1,"hold":2,"fixed":3,"aborted":4,"compleated":5};

nas.Pm.LineIssueCollection.prototype.merge = function(myBranch){
    if(nas.Pm.statuses[myBranch.body[myBranch.currentId].currentStatus]<3) return false;
    //カレントラインがフィックスしていない場合失敗
    for(var ix=0;ix<this.body.length;ix++){
        if(this.body[ix].lineId==myBranch.body[0].lineId){
      //マージ側のラインが被マージ側にあるか否か確認
            if(typeof this.body[ix].lineCheckIn !="undefined"){
                return false;//既にマージ済みの場合もリジェクト
            }else{
                this.body[ix].lineCheckIn=nas.CURRENTUSER;
                this.body[ix].lineCheckInDate   =new Date();
                myBranch.body[0].lineCheckIn    =this.body[ix].lineCheckIn;//転記
                myBranch.body[0].lineCheckInDate=this.body[ix].lineCheckInDate;//転記
                for(var mix=1;mix<myBranch.body.length;mix++){
                    this.body.push(myBranch.body[mix]);//残り情報を転記
                }
            }
        }
    }
    return myBranch;
}
//クラスメソッド
nas.Pm.parseIssue = function(datastream){
    if(! datastream.match){return false};
//ラインで分割して配列に取り込み
    var SrcData     = new Array();
    if(datastream.match(/\r/)){datastream=datastream.replace(/\r\n?/g,("\n"))};
    SrcData=datastream.split("\n");
    var newIssues   = false;
    for (var l = 0 ; l < SrcData.length ; l++){
        if(SrcData[l].match(/^\#\#([\[<A-Z][^=]+)=?(.*)$/)){var nAme=RegExp.$1;var vAlue=RegExp.$2;}
        switch (nAme){
        case "LINE_ID":
            if(! newIssues) {
                var myContent   = vAlue.split(":");
                var myLineName  = myContent[0].replace(/^\(|\)$/g,"");
       // alert("setupLine :"+myLineName);
                var myLineId    = myContent.slice(1,myContent.length).join(":");
                newIssues       = new nas.Pm.LineIssueCollection(new nas.Pm.Issue(myLineName,myLineId));
            }else{continue;}
        break;
        case "CHECK_OUT":
        case "CHECK_IN":
            var myContentIssue  = vAlue.split(";")[0].split("/");
            var myIndex = myContentIssue[0].split(":");myIndex[1] = nas.chopString(myIndex[1]);
            var myDate          = myContentIssue.slice(1,myContentIssue.length-1).join("/");
            var myUser          = nas.chopString(myContentIssue[myContentIssue.length-1]);
            if((newIssues)&&(newIssues.body[newIssues.body.length-1].lineId==myIndex[1])){
                var myIssue     = newIssues.body[newIssues.body.length-1];
            }else{
                var myIssue     = new nas.Pm.Issue(myIndex[0].replace(/^\(|\)$/g,""),myIndex[1]);
                newIssues.body.push(myIssue);
            }
            if(nAme=="CHECK_OUT"){
                myIssue.lineCheckOut    = myUser;
                myIssue.lineCheckOutDate= new Date(myDate);
            }else{
                myIssue.lineCheckIn     = myUser;
                myIssue.lineCheckInDate = new Date(myDate);
            }
        break;
        case "currentStatus":
            newIssues.currentStatus  = nas.chopString(vAlue)  ;
        break;
        }
    }
    return newIssues;
}
/*
ライン情報は、１セットのxMap/Xpsに対して１種類発行される
Pm.PmUには同時に複数セットのラインが記録され 複数の

A= "##LINE_ID=(本線):0\n##CHECK_OUT=(本線):0/ 2016/01/31 18:45:22 / kiyo;"
B=nas.Pm.parseIssue(A);
C=B.branch("BG").toString();
B.body[B.currentId].lineId

*/
/*========================================================================この下は整理が済んだらcommonライブラリへ移行*/
/**
    カット表記用時間文字列オブジェクト
    名前とフレーム数で初期化する
    toString()メソッドは 秒＋コマ 又は 名前（秒＋コマ）型式文字列
    valueOf() メソッドは フレーム数を返す
    toStringにXps保存用の形式も必要 ","区切りで倒置
*/
nas.TimeUnit = function(myName,myFrames){
    this.name   = myName;
    this.frames = myFrames;
this.toString   = function(myForm){
    if(myForm){
        return (this.name)?([nas.Frm2FCT(this.frames,3) , this.name ]).join(","):nas.Frm2FCT(this.frames,3);
    }else{ 
        return (this.name)? this.name+" ( "+nas.Frm2FCT(this.frames,3)+" )":nas.Frm2FCT(this.frames,3);
    }
}
this.valueOf = function(){return this.frames;}
}
/**
     カット用の時間記述を解釈してTimeUnitオブジェクトの配列で返す
    nas.parseTimeString("timeString")
    "1+12,OL(3+0),4+0" コンマ区切りでいくつでも配列で返す
    ⇒[{name:"time",frames:Frames-Int},{name:"tr-in",frames:Frames-Int},{name:"tr-out",frames:Frames-Int}]
 **解釈の幅を広げてパターン調整が必要
*/
nas.parseTimeString = function(myTimeString){
    var myTarget    = myTimeString.split(",");
    var myResult    = new Array();
    for (var t = 0; t < myTarget.length; t ++){
        myResult[t]   =new nas.TimeUnit();
        if(myTarget[t].match(/(.*)\(([^\)]+)\)$/)){
            myResult[t]   =new nas.TimeUnit(RegExp.$1,nas.FCT2Frm(RegExp.$2));
        }else{
            myResult[t]=new nas.TimeUnit("",nas.FCT2Frm(myTarget[t]));
        }
    }
    return myResult;
}
//test nas.pareseTimeString("12+6,trin(0),tr-out(0)");

/**
 *<pre>
 *     識別文字列を分解して配列戻し
 *     カット識別文字列の詳細はドキュメントを参照
 *</pre>
 *  @params {String} titleString
 *      カット識別文字列 "title.opus.scene.cut"
 *  @returns    {Array} 戻値:配列[cut,scene,opus,title]
 *  @example
 *  nas.separateTitleString("Title#12_s12-c#123B") == ["123B","12","12","Title"]
 *  nas.separateTitleString("XAv/10/s-c0023") == ["0023","","10","XAv"]
 *  セパレータは . / _ -
 *  プレフィックスは Oo#Ss#Cc#
 *  ポストフィックスはカット番号に含まれるものとします。＞必要にしたがって別途パースすること
*/
nas.separateTitleString = function(titleString){
// alert(titleString);
    var regSep      = new RegExp("[\\.\/\-]+","g");//セパレータ("_"以外)
    var myString    = titleString.toString().replace(regSep,"_");//セパレータを統一
     myString       = myString.replace(/[cCｃＣsSｓＳoOｏＯ#＃№][#＃№]?([0-9]+)/g,"_$1")
// プレフィクスをセパレータに変換
// alert(myString);
     myString       = myString.replace(/_+/g,"_");//連続セパレータを縮小
// alert(myString);
    var myParse     = myString.split("_").reverse();
    var newCut      = (myParse.length>0)?myParse[0]:"";
// var newCut=(myParse.length>0)?new String(myParse[0]).replace(/^[cCｃＣ]?[#＃№]?/,""):"";
    var newScene    = (myParse.length>1)?new String(myParse[1]).replace(/^[sSｓＳ]?[#＃№]?/g,""):myScene;
// var newOpus      = (myParse.length>2)?new String(myParse[2]).replace(/^[oOｏＯ]?[#＃№]?/g,""):myOpus;
    var newOpus     = (myParse.length>2)?myParse[2]:myOpus;
    var newTitle    = (myParse.length>3)?myParse[3]:myTitle;
    return [newCut,newScene,newOpus,newTitle];
}
// nas.separateTitleString("Title#12_s12-c#123B");
// nas.separateTitleString("TitleO#12s#12c#123B");
// timeString
// 1+12 (trin:0+00)(trout:0+00)
// test
// var A=new SC("c012","s")
/** nas.Pm.Orgnization
    システム内で参照される組織の
*/
/** nas.Pm.Staff
作業許可/拒否の判定基準となるスタッフオブジェクト
.type   String  //自動設定スタッフエントリのタイプ識別名
.user   Object nas.UserInfo or null or * //
.duty   Object dutyName or null or * //
.section  Object sectionName or null or * //
.access 　bool  //アクセス権
.alias   String  //スタッフユーザの表示名称　ユーザ指定可能　デフォルトは""　データがある場合は、優先的にユーザハンドルと置換される

""(ヌルストリング)　nullエントリとして扱う
nullエントリは、自身を含む全てのエントリとマッチしない

特殊なエントリとして"*"(スターエントリ)を扱う
アクセス権を判定する場合、設定可能な全てのユーザとマッチする特殊なエントリ
*同士は判定対象外（マッチがおきない）
 
    以下のエントリは全ての部門、役職及びユーザのアクセスを禁止する （一般に指定されない）
false,"*","*","*"

    以下のエントリは演出部のユーザ全てのアクセスを許す
true,"*","*","演出"
    以下のエントリ役職が演出である演出部所属のユーザのアクセスを許す
true,"*","演出","演出"
    以下のエントリは役職が演出である全てのユーザのアクセスを許す、このエントリは上記のエントリの内容を包括する
true,"*","演出","*"
    以下のエントリは役職が演出でいずれの部門にも属さないユーザのアクセスを許す
true,"*","演出",""

    以下のエントリは演出部の全て役職のアクセスを許す
true,"*","*","演出"
*/
nas.Pm.Staff = function(user,duty,section,access,alias){
    this.type ;                             //String  タイプ識別名　section/duty/user
//    if(!(user instanceof nas.UserInfo)) user =new nas.UserInfo(user);
    this.user    = (user)? user:null;//Object nas.UserInfo or * or null
    this.duty    = (duty)? duty:null;       //StringID of duty
    this.section = (section)? section:null; //StringID of section
    this.access  = (typeof access == "undefined")? true:(access); //bool  アクセス権
    this.alias   = (alias)? alias:"";  //String  表示名称　ユーザ指定可能　デフォルトは""
    this.typeSet();
}
/*
  テキスト形式の指定を受けてスタッフオブジェクトを再初期化するオブジェクトメソッド
  palin形式の文字列は、単一レコードでは初期化に必要な情報に欠けるのでここでは扱わない
  StaffCollectionのメソッドのみが受け付ける
  ここではdump形式のみを判定　それ以外はfullフォーマットとして扱う
*/
nas.Pm.Staff.prototype.parseStaff = function(staffString){
    if (staffString.match(/^\[([^\[\]]+)\]$/)) {;
//dump format
//  [access ,alias  ,user   ,duty   ,section]

        var myProps=JSON.parse(staffString);
        if (myProps.length!=5) return false;
        this.access  = (String(myProps[0]).match(/-|false/i))?false:true;
        this.alias   = myProps[1];
        this.user    = (myProps[2])? new nas.UserInfo(myProps[2]):null;
        this.duty    = myProps[3];
        this.section = myProps[4];
    } else {
//full format
/*
Access *SECTION* [DUTY] handle:email ALIAS

    Access　以外は順不同
    ALIAS は、スタッフユーザの表示エイリアスなのでuserエントリがnullの場合は意味を持たないことに注意
*/
        staffString= staffString.replace(/\s+/g,'\t');//空白をタブに置換
        var myProps = staffString.split('\t');//配列化
        if ((myProps.length<2)||(myProps.length>6)) return false;//フィールド数0,1,6~は不正データ
        this.access=(myProps[0].match( /-|false/i ))?false:true;//第一フィールドは、固定でアクセス可否 bool
        //第二フィールド〜ラストまでループでチェック
        for (var ix=1;ix<myProps.length;ix++){
            if(myProps[ix].match(/^\*([^\*]+)\*$|^([^部]+)部$/)){
                this.section=RegExp.$1+RegExp.$2;// *SECTION*
            }else if(myProps[ix].match(/^\[([^\]]+)\]$/)){
                this.duty=RegExp.$1;// [duty]
            }else if(myProps[ix].match(/^[^:]*:[^:]+$|^[^:]+:[^:]*$/)){
                this.user=new nas.UserInfo(myProps[ix]);// Handle:email
            }else{
                this.alias = myProps[ix]
            }
        }
    }
    this.typeSet();
    return this;
}
/*TEST
var A = new nas.Pm.Staff();
A.parseStaff('[false,"","","プロデューサ","制作管理"]');
A.parseStaff(' *うなぎ*　[海遊館]　ハンドル:sample@example.com ほげら');

*/
/*
    データの内容を確認してtypeプロパティをセットする。
    同時に必要なエントリにスタープロパティを補う
    初期化以後プロパティの変更の際にコールする必要がある
*/
nas.Pm.Staff.prototype.typeSet = function(){
    if((this.user)&&(this.user!="*")){
        this.type = "user";
    }else{
        if((this.duty)&&(this.duty!="*")){
            this.type = "duty";
        }else if((this.section)&&(this.section!="*")){
            this.type = "section"; 
        }else{
            this.type = null;
        }
    }
    return this.type;
}
/*.sameAs
    同値判定用メソッド
    アクセス可否判定を含めてエントリが完全に一致した場合のみtrueを返す
    ユーザ情報はメールアドレスのみでなくハンドルまで一致した場合にtrue
    null,"" は、いずれのエントリとも一致しない
    マッチングの順位あり
タイプ    部署　役職　ユーザ　ハンドル　アクセス可否
user        全マッチ以外はfalse
section
duty
*/
nas.Pm.Staff.prototype.sameAs = function(target){
    if(!(target instanceof nas.Pm.Staff)) return false; 
    var result = 0;
    //user プロパティに値がある　双方がUserInfoオブジェクトだった場合のみ文字列化して比較　それ以外は直接比較
    if(this.user){
      if ((this.user instanceof nas.UserInfo)&&(target.user instanceof nas.UserInfo)){
            if(this.user.toString()==target.user.toString()) result += 4;
      } else {
         if(this.user==target.user) result +=4;
      }
    }else{
    //値がない＞相手先に値がない場合のみマッチ　（nullが"",0,false等とマッチする）
        if(! target.user) result += 4;
    }
    if (this.duty){
        if(String(this.duty)==String(target.duty)) result += 2;//文字列比較
    }else{
        if(! target.duty) result += 2;        
    }
    if (this.section){
        if(String(this.section)==String(target.section)) result += 1;//文字列比較
    }else{
        if(! target.section) result += 1;        
    }
    if ((this.access)==(target.access)) result += 8 ;//比較先にアクセス権がなければ負数へ
    return (result==15);
}
/*TEST
 var A = new nas.Pm.Staff("*","*","作画");
 var B = new nas.Pm.Staff("","作画監督","作画");
 var C = new nas.Pm.Staff("","演出","");
 var D = new nas.Pm.Staff(new nas.UserInfo("kiyo:kiyo@nekomataya.info"),"作画監督","作画");
 D.alias="ねこまたや";

A.sameAs(A);
A.sameAs(B);
A.sameAs(C);
A.sameAs(D);
A.sameAs();
A.sameAs("kjsadhjakshdjkh");

B.parseStaff(A.toString("dump"))
*/

/*
    .compareWith(target)
    比較用に与えられたオブジェクトとの比較係数を返す
特殊エントリ "*"
    比較先が"*"エントリの場合、"*","",nullを除く全てのエントリに対してマッチが発生する
    比較元が"*"の場合は、 比較先"*"を含めてなにものにもマッチしない

    片方向判定を行うので、thisとtargetを入れ替えた場合の戻り値は一致しない

特殊エントリ　"" == null
    比較元が及び比較先が""またはnullの場合""同士、null同士を含めてマッチが発生しない
「比較先」のアクセス可否情報を見てfalseの場合　得られた係数を正負反転させて戻す。
（自身の可否情報は見ない　必要があれば戻り値に対して自身のアクセス可否情報を乗せる）

var A=[true   *      *     演出]
var B=[false  *      監督  演出]
var C=[true   タヌキ 監督  演出]
    として
    A.cpmpareWith(A)    result 1
    A.cpmpareWith(B)    result -1
    A.cpmpareWith(C)    result 1
    B.cpmpareWith(A)    result 3
    B.cpmpareWith(B)    result -3
    B.cpmpareWith(C)    result 3
    C.compareWith(A)　　result 7
    C.compareWith(B)　　result -7
    C.compareWith(C)　　result 7
    
用途: 自身に対する相手の比較係数を得て自身のアクセスの可否を判定するのが主
副用途として、エントリコレクション中の完全一致するエントリを検出して重複エントリの排除を行う?
--完全一致の判定が出来ない？
*/
nas.Pm.Staff.prototype.compareWith = function(target){
    if(!(target instanceof nas.Pm.Staff)) return false; 
    var result = 0;
//  一致条件 
//  相手先が nullと*以外の場合で自身が*　>マッチ
//  自身の値が存在して（null以外） ＞相手を判定　相手先が
//   ＞相手先問わずアンマッチ
//  自身と相手先の判別
    if (
        (this.user!="*")&&
        (((this.user)&&(target.user=="*"))||
        ((this.user instanceof nas.UserInfo)&&(this.user.sameAs(target.user))))
    )        result += 4;
    if (
        (this.duty!="*")&&
        (((this.duty)&&(target.duty=="*"))||
        (this.duty == target.duty))
    )       result += 2;
    if (
        (this.section!="*")&&
        ((this.section)&&(target.section=="*"))||
        ((this.section)&&(this.section == target.section))
    )       result += 1;
//比較先にアクセス権がなければ負数へ(自身のアクセス権は問わない)
    if (! target.access) result *= -1 ;
    return result;
}
/*TEST　(user,duty,section,access,alias)
var A=new nas.Pm.Staff("*","*","演出");
var B=new nas.Pm.Staff("*","監督","演出",false);
var C=new nas.Pm.Staff(new nas.UserInfo("タヌキ:tanuki@animal.example.com"),"監督","演出",true);
//    として
    console.log(A.compareWith(A))    ;//result 1
    console.log(A.compareWith(B))    ;//result -1
    console.log(A.compareWith(C))    ;//result 1
    console.log(B.compareWith(A))    ;//result 3
    console.log(B.compareWith(B))    ;//result -3
    console.log(B.compareWith(C))    ;//result 3
    console.log(C.compareWith(A))　　;//result 7
    console.log(C.compareWith(B))　　;//result -7
    console.log(C.compareWith(C))　　;//result 7
*/
/*
     文字列化して返す
     formオプション
plain-textフォーマット
        'plain-text'
        'plain'
        'text'
この書式は、スタッフコレクションから呼び出された時のみに意味を持つので注意
     sction
部門                  \t部門名
     duty
役職                  \t\t役職名
     user
ユーザ                \t\t\tハンドル:e-メール

スタッフコレクションの'plain'オプションに対応する機能


full-dumpフォーマット     
        'full-dump'
        'full'
        'dump'

アクセス可否  UID [役職] *部門* 別名

    スペース区切りで、第一フィールドはアクセス可否
    最終フィールドは別名
    UIDは通常文字列
    役職はブラケットで囲む
    部門はスターで囲む
    それぞれのエントリが無い場合はフィールドごと省略するのでフィールド数は可変
   
dumpフォ−マット
        'dump'テキスト記録用文字列で返す

    [アクセス可否,"別名","UID","役職","部門"]
配列型文字列　フィールド数固定
        
    エントリーの全情報をカンマ区切りで出力する。
    コレクションのエントリ追加メソッドの引数形式

        
     上記以外の返り値の文字列はtypeにより異なる
     section（部門）エントリーはセクション名の前後に'*'を付けて返す
        ex:*演出* *作画*
    duty（役職）エントリーは役職名の前後をブラケットで囲んで返す
        ex:[監督][作画監督]
    部門エントリがあればそれを添付する
    
    ユーザエントリーは、ユーザの表示名を返す　オブジェクトに設定されたALIASまたはユーザ情報オブジェクトのハンドル

JSONフォーマット
    他のDBとのデータ交換用にJSON文字列化したデータを返す
*/
nas.Pm.Staff.prototype.toString = function(form){
    switch(form){
    case 'JSON':
        return JSON.stringify({
            acsess:this.access,
            type:this.type,
            alias:this.alias,
            user:((this.user)?this.user.toString():null),
            duty:this.duty,
            section:this.section
        });
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=(this.access)?"\t":"-\t";
        switch(this.type){
        case "section":
            result += this.section;
        break;
        case "duty":
            result += "\t";
            result += this.duty;
        break;
        case "user":
            if(this.alias.length){this.user.handle=this.alias}
                result += "\t\t";
                result += this.user.toString();
        break;
        }
        return result;
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        var result=(this.access)?[true]:[false];
        result.push(this.alias);
        result.push((this.user)?this.user.toString():'');
        result.push(this.duty);
        result.push(this.section);
        return JSON.stringify(result);
    break;
/*    case 'void':
        var result='';
        result +=(this.access)? "":"-";
        if(this.user){
            result +="\t";
            result += (this.user instanceof nas.UserInfo)? this.user.toString():String(this.user);
        }
        if(this.duty){
            result +="\t";
            result += "["+String(this.duty)+"]";
        }
        if (this.section){
            result +="\t";
            result += "*"+String(this.section)+"*"  ;
        }
        if (this.alias){
            result +="\t";
            result += String(this.alias)  ;
        }
        return result;
*/
    default:
        var result=(this.access)?'':'-';
        switch(this.type){
        case "duty"   :
            result += "["+String(this.duty)+"]";
        break;
        case "section":
            result += "*"+String(this.section)+"*"  ;
        break;
        case "user"   :
            if(this.alias.length){
                result += String(this.alias);
            }else{
                result += String(this.user.handle);
            }
        break;
        default:
            return false;
        }
        return result;
    }
}
//test　初期化引数　user,duty,section,access,alias
/*
 var A = new nas.Pm.Staff("*","*","作画");
 var B = new nas.Pm.Staff("","作画監督","作画");
 var C = new nas.Pm.Staff("","演出","");
 var D = new nas.Pm.Staff(new nas.UserInfo("kiyo:kiyo@nekomataya.info"),"作画監督","作画");
 D.alias="ねこまたや";
F= new nas.Pm.StaffCollection(nas.pm);
F.addStaff([A,B,C,D]);

//console.log(F)
//A.sameAs(B);
D.sameAs(C);
*/
/** nas.Pm.StaffCollection
スタッフコレクションオブジェクト
スタッフを収集したスタッフコレクションをエントリノード毎に保持する
問い合わせに対して権利の解決を行う
ペアレント属性には、自身が所属するノードが格納される
ノードのペアレント属性に親子関係にあるノードがあるので、継承及び参照の解決は当該の情報パスをたどる。
コレクションのメンバー数が０の場合、コレクションは上位ディレクトリの内容を返す
.parent     Object      所属するノード　親ノードのstaffをアクセスするパスは this.parent.parent.staffs
.members    Array       オブジェクトトレーラー配列
.add()      Function    メンバー追加メソッド　戻り値 追加成功時 Object staff 失敗時 false
.parseConfig() Function    設定ファイルのストリームからメンバーを入れ替え
.dump() Functio         ダンプリストを取得
.toString() Function    
.remove()   エントリを削除


*/
nas.Pm.StaffCollection = function(myParent){
    this.parent = myParent;
    this.members = [];
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('staff');
}
/*
toStringは、二種の出力フォーマットを持つ
 full/引数なし または dump
フルフォーマットは可読テキストとして出力
    第１フィールドに何らかのデータのあるレコードは拒否エントリになる
    第４フィールドはalias　個々にデータがある場合、そのエントリの表示名称として優先して使用される
        例　\t演出\t監督\t\tbigBoss
        例　\t作画\t原画\tcitten:cat@animals.example.com\tキティちゃん
    各フィールドの値として、h-tabは使用できない
ダンプフォーマットは、機械読み取り用のフォーマットでaddStaffメソッドの引数形式
    

nas.Pm.StaffCollection.prototype.toString = function(form){
    var result="";
    switch (form){
    case "full":
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +="\n";
                result += this.members[ix].toString('full');
            }
            result += '\n';
        return result;
        break;
    case "plain":
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +="\n";
                result += this.members[ix].toString('plain');
            }
            result += '\n';
        return result;
        break;
    case "dump":
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +=",\n";
                result += this.members[ix].toString('dump');
            }
            result += '\n';
        return result;
        break;
    default:
        var result = new Array;
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push(this.members[ix].toString());
            }
        return result.toString();
    }
}
*/
nas.Pm.StaffCollection.prototype.dump=nas.Pm._dumpList;
/*
  コレクションをソートする
  ソート基準は
  部門　役職　ユーザ
  メンバーをタイプ別にわける
  タイプごとに部門でソートする
    部門エントリを抽出して　辞書ソート
    部門１エントリ毎に役職エントリを抽出して辞書ソート
    役職１エントリ毎にユーザエントリを抽出して
    役職エントリ  部門ソート　辞書ソート
    ユーザエントリ　部門ソート　役職ソート　辞書ソート

*/
nas.Pm.StaffCollection.prototype.sort = function(){
    
};
/*
    コレクション内の指定条件にマッチするエントリを新たなコレクションで返すメソッド
    @params {String} staffString
        検索文字列
    "演出"    単独文字列は、ユーザ・役職・部門の順で優先的に検索（下位優先）
    ユーザ検索は handle,e-mail,alias いずれでも検索
    "[演出]"  duty(役職)指定検索
    "*演出*"|"演出部"    section(部門)指定検索 両表記を解釈
        演出部のエントリを出力
    "*演出* [演出助手]" 部門・演出 && 役職・演出助手のエントリ
    "[作画監督]" セクションを問わず 役職・作画監督　を含むエントリ
    '馬:hose@animal.example.com','duty' ユーザ・馬が所属する役職エントリ

    @params {String} type
        user|duty|section 明示的に出力エントリタイプを指定する
        タイプ指定が行われた場合は、出力エントリが制限される

エントリの問い合わせがあった場合、コレクションメンバーを検索してアクセスの可否を返す。
コレクションのエントリ数が０の場合のみ、親オブジェクトの持つスタッフコレクションに問い合わせを行いその結果を返す。
*/
nas.Pm.StaffCollection.prototype.getMember = function(staffString,type){
    if(! staffString) return null;
    if((!(type))||(!(String(type).match(/^(section|duty|user)$/i)))) type = '';

    var result=new nas.Pm.StaffCollection(this.parent);
//    var sect='';    var dut ='';    var usr ='';
    if(! (staffString.match(/^(false|\-)?\t/))) staffString = '\t'+staffString.trim();//
    var stff = new nas.Pm.Staff().parseStaff(staffString);
//console.log(stff);
    for(var i = 0;i<this.members.length;i ++){
//user,duty,sectionの順に解決
        if((! type)||(type == this.members[i].type)){
            if(stff.type == 'user'){
                if(
                    (this.members[i].type=='user')&&(
                        ((stff.alias)&&(this.members[i].alias == stff.alias))||
                        (this.members[i].user.sameAs(stff.user))
                    )
                ){
                    result.addStaff(this.members[i]);
                }
            }else if(stff.type == 'duty'){
                if(
                    (
                        (stff.section)&&
                        (this.members[i].section == stff.section)&&
                        (this.members[i].duty == stff.duty)
                    )||(
                        (stff.section == null)&&
                        (this.members[i].duty == stff.duty)
                    )
                ){
                    result.addStaff(this.members[i]);
                }
            }else if(stff.type == 'section'){
                if(this.members[i].section == stff.section){
                    result.addStaff(this.members[i]);
                }
            }else{
                continue;
            }
        }
    }
    return (result.members.length)? result:null;
}
/*    .parseConfig
    設定ファイルのスタッフ初期化文字列をパースしてスタッフコレクションを更新するオブエジェクトメソッド
    引数はレコード改行区切りテキストストリーム
    受け入れ形式は3つ
    ストリームの第一有効レコードで判定する
    
    いずれも行頭 '#'はコメント行　空行は無視 
    JSON   データ交換用JSON
{access:<ACESS>,alilas:<ALIAS>,user:<USER>,duty:<DUTY>,section:<SECTION>,type:<TYPE>}
    full-dump 引数配列形式
[アクセス可否,"別名","UID","役職","部門"]

    plain-text    タブ区切りフィールド
アクセス可否\t部門\t役職\tユーザ\t別名

    free-form スペース分離　不定フィールドテキスト
アクセス可否	handle:UID	[役職]	*部門*	別名
例：
true	*演出*
false	*作画*	[原画]

** Free-Formは、スタッフDB記述の独自記法なので充分に留意のこと　これに類する記法は他に　Line,Stage,Job　にみられる


*/
nas.Pm.StaffCollection.prototype.parseConfig = function(dataStream,form){
    var myMembers =[];
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/^\[\s*(\{[^\}]+\}\s*,\s*)*(\{[^\}]+\})+\s*\]$/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else if (dataStream.match(/\*[^\*]+\*|\[[^\[\]]+\]/)) form='free-form';//]
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
//console.log('staff-JSON');
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            if(tempObject[rix].timestamp){
                this.timestamp = tempObject[rix].timestamp ;
                continue ;
            }
            var currentStaff=new nas.Pm.Staff(
                tempObject[rix].user,
                tempObject[rix].duty,
                tempObject[rix].section,
                tempObject[rix].access,
                tempObject[rix].alias
            );
            myMembers.push(currentStaff);
        }
    break;
    case    'full-dump':
    case    'free-form':
//console.log('staff-DUMP');
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
            if(dataStream[rix].indexOf('#')==0) continue;
            var currentStaff=new nas.Pm.Staff();
            currentStaff.parseStaff(dataStream[rix]);
            if (currentStaff) myMembers.push(currentStaff);
        }
    break;
    case    'plain-text':
    default:
//console.log('staff-TEXT');
        dataStream = String(dataStream).split("\n");
//console.log(dataStream);
      var currentSection=null;var currentDuty=null;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentRecord=dataStream[rix].split('\t');
        var currentAccess=true;var currentUser=null;var currentAlias="";
//plainフォーマットはタブ区切り　タブ１つは部門　２つで役職　３つでユーザ　ユーザ指定のレコードには別名の指定も可
//例:  ^access  section duty user alias
        if(currentRecord[0]) currentAccess = (String(currentRecord[0]).match( /-|false/i ))?false:true;
        if(currentRecord[1]) {
            var mySection = currentRecord[1].replace(/\/$/,"");
            if(mySection != currentSection) {currentSection=mySection;currentDuty=null;}
            //myMembers.push(new nas.Pm.Staff(null,null,currentSection,currentAccess,""));
        }
        if(currentRecord[2]) {
            currentDuty    = currentRecord[2];
//            myMembers.push(new nas.Pm.Staff(null,currentDuty,currentSection,currentAccess,""));
        }
        if(currentRecord[3]) {
//console.log(currentRecord[3]);
            currentUser    = new nas.UserInfo(currentRecord[3]);
            var currentAlias   = (currentRecord[4])? currentRecord[4]:"";
//            myMembers.push(new nas.Pm.Staff(currentUser,currentDuty,currentSection,currentAccess,currentAlias));
//console.log(currentUser);
        }
        myMembers.push(new nas.Pm.Staff(currentUser,currentDuty,currentSection,currentAccess,currentAlias));
      }
    }
    return this.addStaff(myMembers);
}
/*TEST

*/



/*
      ターゲットになるユーザまたはスタッフとコレクションの内容を比較して、
      一致したエントリIDを返すメソッド
      ヒットしなかった場合は　-1
*/
nas.Pm.StaffCollection.prototype.indexOf = function(target){
    for (var ix =0 ;ix <this.members.length;ix ++){
        if(this.members[ix].sameAs(target)) return ix;
    }
    return -1;
}
/*  スタッフの追加メソッド
    引数は　nas.Pm.Staff　オブジェクト
    引数形式は、Staffオブジェクトまたはオブジェクトの配列
    可読テキストの再ロードはparseConfigメソッドを利用
    parseConfigメソッドは、可読テキストをdump形式にコンバートしてこのメソッドを内部で呼び出す
    同内容のエントリがあった場合は追加されない。
    
    追加時に既存のsection/dutyエントリに存在しないプロパティを持ったuserエントリがあった場合は、
  　当該のエントリを新規に作成して追加する？　ユーザの設定を変更することになるのでコレは行わない　
    戻り値は、追加に成功したエントリ数（エントリ配列か？）
    
*/
nas.Pm.StaffCollection.prototype.addStaff = function(members){
    var result=0;
    if(!( members instanceof Array)) members = [members];
    for(var ix =0 ; ix<members.length;ix++){
      if(!(members[ix] instanceof nas.Pm.Staff)){
/*
        member[0]// access
        member[1]// alias
        member[2]// user
        member[3]// duty
        member[4]// section
*/
        var member=new nas.Pm.Staff();
        member.parseStaff(members[ix]);//文字列としてパースする　不正データの場合は初期化できないのでスキップ
      }else{
        var member = members[ix]
      }
      if(! member) continue;
      var checkHint = this.indexOf(member);
//console.log("checkHint : " + checkHint)  ;   
//一致エントリがないので追加
      if (checkHint < 0){
        this.members.push(member);
        result ++;
//console.log('push member :'+member.toString('dump'));
        continue;
      }
    }
    return result;
}
/*TEST
新設が必要な設定群
ユーザDB
    U-AT の場合はサーバから取得   Repository.pmd.users? この管理はサーバに任せて、スタッフだけもらうべき
    ローカルストレージ等の
スタッフDB
    部門、役職、ユーザを合成したスタッフDB
        Repository.pmd.staff ~ タイトル、エピソード、カット（ライン、ステージ）までのツリー状の構造の各所でそれぞれのデータを参照可能にするための構造

nas.Pm.inportDB(settingStream)
 
DBとの通信は基本的に serviceAgent配下で各ServiceNodeが行う
読み出しは低レベル関数をそれぞれのオブジェクトが受け持ち
設定ファイル読み出しに相当するひとまとまりのアクションを親オブジェクト側で実装する

統一形式
Object.parseConfig(dataStream)

perseStaff等もリネーム

*/
/*担任範囲オブジェクト
配列要素は nas.StoryBoard.SBShot|String

ショット、フレーム、画像番号等の主に数値で指定される範囲表現を保持展開する
プレフィックス、ポストフィックス、ワイルドカード等の補助表現を解釈することが可能

文字列化可能
文字列からのオブジェクト化が可能
範囲同士の論理演算が可能

Allocationの記載時は、範囲指定でなく固定的に同定可能なコードでの記録が必要（保存出力時にはIDで記録）
カットの名称変動に対応するために .idの記録を行う

    @params   {Object nas.Pm.Opus|null} parent
    
    @params   {Object nas.Pm.Asset}    asset
    @params   {Array of Object nas.Pm.SBShot|String} list

*/
nas.Pm.AllocateRegion = function(opus,description){
    this.parent  = (opus instanceof nas.Pm.Opus)? opus:null;//nas.Pm.Opus 初期化時に必須
    this.asset   = "*"      ;//パーサで再設定
    this.list    = ["*"]    ;//パーサで再設定
    if(description) this.parse(description);
}
/*
    担当記述を与えてオブジェクトを初期化する
parent(pmdb)のデータノードがproductである場合は、stbdを参照してカット番号範囲の解決を行う
それ以外の場合、担当範囲の指定は"*|-"に限定される。

プレーンテキスト（一件あたりが複数行で与えられることがある）
LO  1,2,3,4,5,6
    7~20,6
配列ダンプ
["LO",["1","2","3","4","5","6","7~20","6"]]
JSON
{
    "asset":"LO",
    "list":["1","2","3","4","5","6","7~20","6"]]
}

    プリプロセス
JSON|配列ダンプの場合は、データ交換用途を想定するので入れ子の配列は認められない
プレーンテキストの場合は一旦一次配列に変換して第一要素をアセット記述として分離
第二要素以降を全て .listプロパティの配列要素に繰り入れる

    メインプロセス
.listオブジェクトを再評価

リストプロパティの内容がnas.StoryBoard.SBShot|"*"|"-" 以外であった場合、カット一覧から検索してリストをnas.StoryBoard.SBShotへの参照と置換する
 uuid , カット番号 の順に検索をおこなう
検索結果がヒットしない場合はそのエントリを削除する
文字列が"~"を含む場合は、"~"で前後分割してそれぞれを検索 どちらか片方でも存在しない場合は、このエントリを削除
双方が存在する場合は、ふたつのエントリの間に位置するエントリを全て追加する

最終的に"*"|"-"以外のエントリが残る場合、文字列のみエントリを削除する

    @params {String|Array}
*/
nas.Pm.AllocateRegion.prototype.parse = function(description){
    var currentOpus = this.parent;
    var currentPmdb = (currentOpus)? currentOpus.pmdb:nas.pmdb;
    if(typeof description !== 'undefined'){
        if(description instanceof Array){
//配列が渡された場合はプリプロセスを省略してプロパティに代入（第一要素がアセットであった場合アセットを設定後リストにも加える）
            var ast = currentPmdb.assets.entry(description[0]);
            this.asset = (ast instanceof nas.Pm.Asset)? ast:description[0];
            this.list = description;
        }else{
            if(typeof description !== 'string') description = '*,*';//デフォルト値{asset:"*",list:"*"}
//preprocess
            if (description.match(/^\s*\{[\n.]+\}\s*$/)){
//JSON
                var tmpObj = JSON.parse(description);
                var ast;
                if(tmpObj.asset) ast = currentPmdb.assets.entry(tmpObj.asset);
                this.asset = (ast)? ast : tmpObj.asset;
                if(tmpObj.list)  this.list  = tmpObj.list;
            }else if(description.match(/^\[.*\]\]$/)){
//dump-text
                var tmpArray = JSON.parse(description);
                var ast;
                if(tmpArray[0]) ast = currentPmdb.assets.entry(tmpArray[0]);
                this.asset = (ast)? ast : tmpArray[0];
                if(tmpArray[1]) this.list  = tmpArray[1];
            }else{
//plain-text
                var tmpArray = String(description).replace(/\s*|\n/g,",").split(",");
                var ast;
                ast = currentPmdb.assets.entry(tmpArray[0]);
                this.asset = (ast)? ast : tmpArray[0];
                this.list  = tmpArray.slice(1);
            }
        }
    };//引数無し(undefined)で呼ばれた場合 preprocessをスキップして現行の.listプロパティの再評価のみを行う
//main process
//assetの再評価
    if((!(this.asset instanceof nas.Pm.Asset))&&(this.asset != '-')) this.asset = '*';
//opus指定がある場合のみメインプロセスでリストの再評価 それ以外はリストを *|- で再評価
    var newList = [];
    for (var i = (this.list.length - 1);i >= 0 ; i --){
        if((!currentOpus)||(this.list[i]=="*")||(this.list[i]=="-")) continue;
        if(this.list[i] instanceof nas.StoryBoard.SBShot){
            newList.add(this.list[i]); continue;
        }
        if(this.list[i].indexOf('~') < 0){
//検索リプレース
            var currentShot = currentOpus.stbd.getEntryById(this.list[i]);//id
            if(! currentShot) currentShot = currentOpus.stbd.entry(this.list[i],"shot");//cutNo
            if(currentShot) newList.add(currentShot);
        }else{
//分割処理
            var range = this.list[i].split('~');
            var headShot = currentOpus.stbd.getEntryById(range[0]);
            if(!headShot) headShot = currentOpus.stbd.entry(range[0],"shot");
            var tailShot = currentOpus.stbd.getEntryById(range[1]);
            if(!tailShot) tailShot = currentOpus.stbd.entry(range[1],"shot");
            if((! headShot)||(! tailShot)) continue;
            if((headShot instanceof nas.StoryBoard.SBShot)&&(tailShot instanceof nas.StoryBoard.SBShot)){
                var headID = currentOpus.stbd.contents.indexOf(headShot);
                var tailID = currentOpus.stbd.contents.indexOf(tailShot);
                if(headID > tailID){
                    tailID = currentOpus.stbd.contents.indexOf(headShot);
                    headID = currentOpus.stbd.contents.indexOf(tailShot);
                };
                for (var ix = headID ; ix <= tailID ;ix++) newList.add(currentOpus.stbd.contents[ix]);
            }
        }
    }
    if(newList.length){
        this.list = nas.StoryBoard.sortList(newList,["name+"]);//ネームソート正順
    }else{
        if(this.list[0]=="-"){ this.list = ["-"];}else{this.list = ["*"];}
    }
    return this;
}
/*
    テキスト出力
    出力フォーマットを切り替えるオプションが必要
    連続省略("1,2,3,4,5,7"→"1~5,7")を行うオプションはおかない。plain-text && name 形式のみが省略を行う
    出力形式("name|id|token")
    @params  {String}   form
    JSON|dump|full-dump|text|plain-text
    @params  {String}   type
        output list-type id|token|name
    @returns {String}
*/
nas.Pm.AllocateRegion.prototype.toString = function(form,type){
    if(! form) form = 'plain-text';//?
    if(! type) type = 'id';//プロパティ名を直接指定
    var currentOpus = this.parent;//opusを置く
    var currentPmdb = (this.parent)? this.parent.pmdb:nas.pmdb;//pmdb設定
    var listResult = [];
    if((currentOpus)&&(type=='name')&&(form == 'plain-text')){
//この処理が必要なのは plain-text && name only
        var idx ; var cix = -1; var strix = -1;
        for(var i = 0 ; i < this.list.length ; i ++){
            idx = currentOpus.stbd.contents.indexOf(this.list[i]);
            if(strix < 0){
                strix = idx; cix = strix; continue;
            }
            if(idx == (cix + 1)){
                cix = idx ; continue;
            }else{
                if(strix == cix){
                    listResult.push(this.list[strix].name);
                }else{
                    listResult.push([this.list[strix].name,this.list[cix].name],join('~'));
                }
                strix = idx; cix = strix;
            }
        };// */
    }else{
//出力用リストをビルド
        for(var i = 0 ; i < this.list.length ; i ++){
            listResult.push((this.parent)? this.list[i][type]:this.list[i]);
        }
    }
    if(form == 'JSON'){
        result = {'asset': this.asset.toString(),'list' : listResult}
        return JSON.stringify(result,arguments[1],arguments[2]);
    }else if(form.indexOf('dump') >= 0){
        var result = [this.asset.toString(),listResult];
        return JSON.stringify(result,arguments[1],arguments[2]);
    }else{
        return ([this.asset.toString(),listResult.join(',')]).join('\t');
    }
}
/* TEST
var ops = nas.pmdb.products.entry('%default%');
A = new nas.Pm.AllocateRegion(ops,'{"asset":"LO","list":["1"]}');
B = new nas.Pm.AllocateRegion(ops,'{"asset":"x","list":["8","3","4"]}');
C = new nas.Pm.AllocateRegion(ops,'{"asset":"*","list":["1~3"]}');
D = new nas.Pm.AllocateRegion(ops,'{"asset":"-","list":["6~12"]}');
console.log()
*/
/* TEST
//parseXps
var source1 = localStorage.getItem(localStorage.key(0));
var xps1 = new nas.Xps();
console.log(source1);
xps1.parseXps(source1);
xps1.toString();


//parsexMap
var source2 = localStorage.getItem(localStorage.key(15));
var xmap = new nas.xMap();
console.log(source2);
xmap.parsexMap(source2);
xmap.toString();


//nas.Xps.getxMap XpsからxMap
var source1 = localStorage.getItem(localStorage.key(0));
var xps1 = new nas.Xps();
xps1.parseXps(source1);
var xmap1 = nas.Xps.getxMap(xps1);



//nas.xMap.merge
var source1 = localStorage.getItem(localStorage.key(0));
var xps1 = new nas.Xps();
xps1.parseXps(source1);
var xmap1 = nas.Xps.getxMap(xps1);

var source2 = localStorage.getItem(localStorage.key(7));
var xps2 = new nas.Xps();
xps2.parseXps(source2);
var xmap2 = nas.Xps.getxMap(xps2);

//console.log(source1);
//console.log(xps1.toString());
//console.log(xps2.toString());
console.log(xmap1.toString());
console.log(xmap2.toString());
if(xps1.job.toString(true)==xps1.pmu.nodeManager.nodes[0].toString(true)){
	console.log('OK');
}else{
	console.log('NOGOOD!');
}
//console.log(xps1)
//console.log(xps2)

var result = xmap1.merge(xmap2);


var xpsSource =localStorage.getItem(localStorage.key(0));
var xps = new nas.Xps();
xps.parseXps(xpsSource);
var map = nas.Xps.getxMap(xps);
console.log(xps.toString());
console.log(map.toString());

//localRepository.getxMap
localRepository.getxMap('かちかちやま#0:Pilot//s-c1.xmap',function(res){console.log(res.toString())});

//NetworkRepository.getxMap
serviceAgent.currentRepository.getxMap('かちかちやま#0:Pilot//s-c1.xmap',function(res){console.log(res.toString())});

 */
/**
 * 参考書類管理用 ReferenceDocumentオブジェクト
 * 設定書類等の制作参考ドキュメントの情報を保持するオブジェクト
 *  ReferenceDocument         参考ドキュメント
 *  ReferenceList             参考ドキュメントのコレクション
 *  ReferenceListCollection   リストコレクション
 *  .getLists()             コレクションリストを返す
 */
//リストコレクション
nas.Pm.ReferenceListCollection = function(myParent){
    this.parent    = myParent;//pmdb
    this.members   = [];//Array of ReferenceList
    this.unique    = {
         global:["name","index","prefix"]
    };//同名の設定書類は禁止 
    this.timestamp = 0;//タイムスタンプ Unix time値  初期値 0(タイムスタンプ無し)
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('pmReferences');
};
/**  ドキュメントリストコレクションメンバーを検索して該当するリストを返す
 *  @params     {String} keyword
 *  @returns    {Object nas.Pm.ReferenceList}
 */
nas.Pm.ReferenceListCollection.prototype.entry = nas.Pm._getMemberA;
/* リジョン有効？
function(keyword,region){
    if(! region) region = 'global';
    if(! this.unique[region]) region = Object.keys(this.unique)[0];
    if(keyword=='%default%'){
        return this.members[0];//第一エントリーを戻す
    }
    for (var ix = 0 ; ix < this.members.length ; ix++){
        for (var uix = 0 ;uix < this.unique[region].length ; uix ++){
            var prp = this.unique[region][uix].split('.');
            if (this.members[ix][prp[0]][prp[1]]==keyword)
                return this.members[ix];
        }
    }
};// */

nas.Pm.ReferenceListCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.ReferenceListCollection.prototype.updateTimestamp = nas.Pm._updateTimestamp;
/*
 *    参照ドキュメントリスト　データストリームパーサ
 *    ダンプメソッドで書き出したデータを取り込んでコレクションを再設定する
 *    @params {String}  dataStream
 *    @params {String}  form
 *          data-format JSON|full-dump|plain-text
 */
nas.Pm.ReferenceListCollection.prototype.parseConfig = function(dataStream,form){
    if(! dataStream) return false;
    var myMembers =[];
    if(this.parent instanceof nas.Pm.PmDomain) this.parent.contents.add('pmTemplates');
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            if(tempObject[rix].timestamp){
                this.timestamp = tempObject[rix].timestamp ;
                continue ;
            }
            var currentMember=new nas.Pm.ReferenceList(
                this,
                tempObject[rix].name,
                JSON.stringify(tempObject[rix])
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.Pm.ReferenceList(
                this,
                currentRecord[0],
                dataStream[rix]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      var currentStream = [];
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
        if(currentField.indexOf("documentList:") >= 0){
            var fileds = currentField.split(":");
            var listName = fileds[1].trim();
// currentField.slice(currentField.indexOf("documentList:")+13).trim();
            var listID   = fileds[2].trim();
            if(currentMember){
                currentMember.parse(currentStream.join("\n"));
                myMembers.push(currentMember);
            }
            currentMember = new nas.Pm.ReferenceList(this,listName);
            currentStream.length = 0;
        }else{
            currentStream.push(currentField);
        }
      }
      currentMember.parse(currentStream.join("\n"));
      myMembers.push(currentMember);
    }
    return this.addMembers(myMembers);
}
nas.Pm.ReferenceListCollection.prototype.dump = nas.Pm._dumpList;

/**
	分類コードをオブジェクト化する
	大分類	{String}
	大分類ID	{Number Int}
	小分類	{String}
	小分類ID	{Number Int}
	名称		{String}
	ドラフトフラグ {Boolean}

	Aa,Ab,Ac

*/
nas.Pm.ReferenceCategory = function(parent,number,code,name,draft){
	this.parent = (parent)? parent : null  ;
	this.number = (number)? number : "00"  ;
	this.code   = (code)?   code   : "Aa"  ;
    this.name   = (name)?   name   : "総合" ;
	this.draft  = (draft)?  true   : false ;
}
nas.Pm.ReferenceCategory.prototype.isDraft = function(){return this.draft};
nas.Pm.ReferenceCategory.prototype.toString = function(form){
	var result = "";
    switch(form){
    case "JSON":
    	result = JSON.stringify({
    		number : this.number,
    		code   : this.code,
    		name   : this.name,
    		draft  : this.draft
    	});
    break;
    case "dump":
    case "full-dump":
    	result = JSON.stringify([
    		this.number,
    		this.code,
    		this.name,
    		this.draft
    	]);
    break;
    case "text":
    case "plain-text":
	default:
    	result = this.number + "\t" + this.code + "\t" + this.name ;
    	if (this.draft) result += "\tdraft";
    	result += "\n";
    }
	return result;
};

/**
 *  参照ドキュメントコレクション
 *  
 *    @constractor
 *    @params {Object}  parent
 *    @params {String}  idf
 *    @params {String}  dataStream

ReferenceListオブジェクトは以下の用に供する単位として想定されている
	作画設定資料集
		00Cd	キャラクター(準備・検討稿)
		01Ca	キャラクター対比表・目録
		02Cm	メインキャラクター
		03Cs	サブキャラクター
		04Cg	ゲストキャラクター
		05Ma	メカ対比表
		06Mm	メインメカ
		07Mg	ゲストメカ
		08Pa	プロップ
	美術設定資料集
		10Sd	美術設定(準備・検討稿)
		11Sa	美術設定目次
		12Sm	メイン美術設定
		13Sg	ゲスト(各話)美術設定
	背景イメージボード
		20Bd	カラーボード(準備・検討稿)
		21Ba	イメージボード目次
		22Bm	メイン美術イメージボード
		23Bg	ゲスト(各話)美術イメージボード
	色指定表
		31Mc	メインキャラクター色指定表
		32Sc	サブキャラクター色指定表
		33Gc	ゲストキャラクター色指定表
		34Mm	メインメカ
		35Gm	ゲストメカ
		36Pa	プロップ
	参考写真資料集
		40Pa
	作監修正集
		50Cc

内部で更に大分類|小分類を持てる
参照リストコレクションはこれらを複数管理するためのテーブル構造
参照リストオブジェクトにはIDと名称を与える
参照リストの内部ドキュメントは、配下にサブドキュメントを持つことが可能
マスタードキュメントとサブドキュメントはフラットなデータ構造で保持される

リストの識別は名前とIDで行われる
IDは初回生成時にuuidで与えられる

 */
nas.Pm.ReferenceList = function(parent,prefix,name,dataStream){
    this.parent     = parent;//リストコレクション
    this.index      = nas.uuid();//unique
    this.prefix     = prefix;//name prefix number
    this.name       = name;//unique
    this.members    = [];//参照ドキュメントコレクションメンバー
    this.categories = [];//登録分類リスト
    this.unique  = {
        global :["id","name"]
    };
	if(dataStream) this.parse(dataStream);
};
/**
 *	@params	{String} name
 *	@returns {Boolean}
 */
nas.Pm.ReferenceList.prototype.isDraft = function(name){
    return this.categories.find(function(elm){
        if((elm.code == name)||(elm.number == name)) return true;
    }).draft;
};

/**
 * ドキュメントコレクションへのメンバー追加メソッド
 * 配列型データのみを受け入れる
 * 重複チェックはなし 上書き
 *  @params {Array of nas.Pm.RefereneceDocument} documents
 */
nas.Pm.ReferenceList.prototype.addDocuments = function(documents){
    if(! documents instanceof Array){documents = [documents];}
    for (var eid = 0 ; eid < documents.length ; eid ++){
        if(! documents[eid] instanceof nas.Pm.ReferenceDocument) continue;
//引数: 自身,識別名,版数,表題,注釈,ドキュメント配置,サムネイル
        this.members[eid] = new nas.Pm.ReferenceDocument(
        	this,
        	documents[eid]
        );
    }
};
/*  テンプレートコレクションメンバーの対象ラインを検索して該当するテンプレートを返す
 *  @params     {String} keyword
 *  @returns    {Object nas.Pm.LineTemplate}
 */
/*
nas.Pm.ReferenceList.prototype.entry = function(keyword,region){
    if(! region) region = 'global';
    if(! this.unique[region]) region = Object.keys(this.unique)[0];
    if(keyword=='%default%') return this.members[0];//本線を返す
    for (var ix = 0 ; ix < this.members.length ; ix++){
        for (var uix = 0 ;uix < this.unique[region].length ; uix ++){
            var prp = this.unique[region][uix].split('.');
            if (this.members[ix][prp[0]][prp[1]]==keyword)
                return this.members[ix];
        }
    }
}; // */
nas.Pm.ReferenceList.prototype.entry      = nas.Pm._getMember;
nas.Pm.ReferenceList.prototype.addMembers = nas.Pm._addMembers;
/**
 *   設定データストリームパーサ
 *   ワークフローテンプレートセットの書き出しを受け取ってオブジェクトを設定する
 *   各設定はクリア後に上書き
 *   @params {String} dataStream
 *   @params {String} form
 *       data format JSON|full-dump|plain-text
 */
nas.Pm.ReferenceList.prototype.parse = function(dataStream,form){
    if(! dataStream) return false;
    var myMembers    = [];
//形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
        if (dataStream.match(/\{.+\}/)) form='JSON';
        else if (dataStream.match(/^\[.+\]$/)) form='full-dump';//配列１ラインダンプ
        else  form='plain-text';
    };
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        this.index  = tempObject.index;
        this.prefix = tempObject.prefix;
        this.name   = tempObject.name;
        for (var rix=0;rix<tempObject.members.length;rix++){
            var currentMember=new nas.Pm.ReferenceDocument(
                this,
                tempObject.members[rix].id,
                tempObject.members[rix].version,
                tempObject.members[rix].name,
                tempObject.members[rix].note,
                tempObject.members[rix].document,
                tempObject.members[rix].picture
            );
            myMembers.push(currentMember);
        };
        for (var cix=0;cix<tempObject.categories.length;cix++){
            var currentCategory=new nas.Pm.ReferenceCategory(
                this,
                tempObject.categories[cix].number,
                tempObject.categories[cix].code,
                tempObject.categories[cix].name,
                tempObject.categories[cix].draft
            );
            this.categories.add(currentCategory,function(elm){return (elm.code == currentCategory.code)})
        };
    break;
    case    'full-dump':
        var currentContent=JSON.parse(dataStream);
        this.index  = currentContent[0];
        this.prefix = currentContent[1];
        this.name   = currentContent[2];
        for(var rix = 0; rix < currentContent[3].length; rix++){
            var currentRecord = currentContent[3][rix];
//[this.id,this.version,this.name,this.note,this.document,this.picture]

            var currentMember=new nas.Pm.ReferenceDocument(
                this,
                currentRecord[0],
                currentRecord[1],
                currentRecord[2],
                currentRecord[3],
                currentRecord[4],
                currentRecord[5]
            );
            if (currentMember) myMembers.push(currentMember);
        }
        for (var cix = 0; cix < currentContent[4].length; cix++){
            var currentCategory=new nas.Pm.ReferenceCategory(
                this,
                currentContent[4][cix][0],
                currentContent[4][cix][1],
                currentContent[4][cix][2],
                currentContent[4][cix][3]
            );
            this.categories.add(currentCategory,function(elm){return (elm.code == currentCategory.code)})
        };
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
        var currentProp   = "";
      var currentMember   = false;
      var currentCategory = false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        if(dataStream[rix].indexOf("referenceList:") >= 0) continue;
        if(dataStream[rix].indexOf("categories:") >= 0 ){currentProp = "category"; continue;}
        if(dataStream[rix].indexOf("documents:")  >= 0 ){currentProp = "document"; continue;}
        var currentField=dataStream[rix];
        if(currentProp == 'category'){
            var prps = currentField.replace(/\s+/g,',').split(',');
            if(prps.length){
                var currentCategory = new nas.Pm.ReferenceCategory(this,prps[1],prps[2],prps[3],((prps[4])?true:false));
            };
            this.categories.add(currentCategory ,function(elm){
                    return (elm.code == currentCategory.code)
            });
        }else if(currentProp == 'document'){
            if(currentField.match(/^\t/)&&(currentMember)){
                var prp = currentField.trim().split(':');
                currentMember[prp[0]] = prp.slice(1).join(":");
            }else if(currentField.length){
                if(currentMember) myMembers.push(currentMember);
                currentMember = new nas.Pm.ReferenceDocument(this,currentField);
            }
        }else{
            if(currentField.match( /^\t([a-z]+)\:(.+)$/i )){
                this[RegExp.$1] = String(RegExp.$2).trim();
            };
        };
      }
      myMembers.push(currentMember);
    }
    return this.addMembers(myMembers);
};
/**
 参考・設定集の文字列化メソッド
    @params {String} form
         出力フォーマット JSON|full-dump|plain-text
    @returns {String}
         取り込み可能出力またはオブジェクト名
	toString(form) テキスト設定形式で書き出す
	plain-text|dull-dump|JSON
*/
nas.Pm.ReferenceList.prototype.toString = function(form){
    switch(form){
    case 'JSON':
        var result ={ name: this.name , prefix:this.prefix , index:this.index };
        result.members    = [];
        for(var mx = 0 ; mx < this.members.length; mx ++){
            result.members.push(JSON.parse(this.members[mx].toString('JSON')))
        }
        result.categories = [];
        for(var cx = 0 ; cx < this.categories.length; cx ++){
            result.categories.push(JSON.parse(this.categories[cx].toString('JSON')))
        }
        return JSON.stringify(result);
    case 'full-dump':
    case 'full':
    case 'dump':
        var result =[
            this.index,
            this.prefix,
            this.name,
            [],[]
        ];
        for(var mx = 0 ; mx < this.members.length; mx ++){
            result[3].push(JSON.parse(this.members[mx].toString('dump')));
        }
        for(var cx = 0 ; cx < this.categories.length; cx ++){
            result[4].push(JSON.parse(this.categories[cx].toString('dump')));
        }
        return JSON.stringify(result);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
       var result = "referenceList:" + this.prefix + this.name + "\n";
       result += "\tindex:" + this.index  + "\n";
       result += "\tprefix:" + this.prefix + "\n";
       result += "\tname:" + this.name   + "\n";

       result += '\n';

       result += "categories:\n";
        for(var cx = 0 ; cx < this.categories.length; cx ++){
            result += '\t';
            result += this.categories[cx].toString('plain-text');
            result += '\n';
        }

       result += "documents:\n";
        for(var mx = 0 ; mx < this.members.length; mx ++){
            result += this.members[mx].toString('plain-text');
            result += '\n';
        }
      return result;
    break;
    default:
        return this.name;
    }
};
/* TEST
var cfg = `referenceList:01作画設定資料集
	index:ee419c03-c8fe-4d55-accb-6765e8764064
	prefix:01
	name:作画設定資料集

categories:
	00	As	メインキャラ%20(準備稿) draft

documents:
As0001-01[ジャッキー01]
	id:As0001-01
	version:1
	name:ジャッキー01
	note:ジャッキーノーマル衣装
	document:./123456.png
As0001-02[ジャッキー02:網目模様の服]
	id:As0001-02
	version:1
	name:ジャッキー02:網目模様の服
	note:ジャッキー衣装替え:02:網目模様の服
	document:./234567.png
As0002-01[ベティー]
	id:As0002-01
	version:1
	name:ベティー
	note:
	document:./345678.png
`;
    var lc  = new nas.Pm.ReferenceListCollection(nas.pmdb);
	var lst = new nas.Pm.ReferenceList(lc,"01","作画設定資料集");
    lst.parse(cfg);

	var lll = new nas.Pm.ReferenceList(lc,"02","美術設定");
	lc.addMembers([lst,lll]);
	lll.parse(lst.toString('JSON'));

	lc.dump('text');




*/

/**
 *		リファレンスドキュメント管理オブジェクト
 *	引数が2点のみ場合のみ第２引数をネームパーサに回す
 *	
 */
 
//nas.Pm.ReferenceList.prototype.dump = nas.Pm._dumpList;
//ワークフロー記述用ラインテンプレートコレクション配列
nas.Pm.ReferenceDocument = function(parent,idf,version,name,note,document,thumbnail){
	this.parent      = (parent)? parent:null;//
	this.id          = (idf)? idf : "Aa0000-00";//unique-key
		this.category    = "";
		this.number      = [];
	this.version     = (version)? parseInt(version):1;
	this.name        = (name)?  name : "";
	this.note        = (note)?  note : "";
	this.document    = (document)?  document :null;
	this.thumbnail   = (thumbnail)? thumbnail:null;
	if(arguments.length > 1) this.parseIdf();
};
/**
 *	@params {String}	idf
 *		Xx####-##[name](information)
 *		補助情報は無視して
 *		分類,番号,名称 のみをパースする
 *		引数なしの場合は現在のidをパースする
 */
nas.Pm.ReferenceDocument.prototype.parseIdf = function(idf){
	if(!idf) idf = this.id;
	var props = idf.match(/^([A-Z][a-z])([0-9\-]+)(\[([^]]+)\])?/);
	if(props){
		this.category    = props[1];
		this.number      = props[2].split('-');
		for (var ix = 0 ; ix < this.number.length ; ix ++){
		    this.number[ix] = parseInt(this.number[ix]);
		};
		if(props[4]) this.name = String(props[4]).trim();
	};
	return this;
};
/**	idを再設定する
 *		Xx####-##[name]()
 *	再設定したidを返す
 */
nas.Pm.ReferenceDocument.prototype.setId = function(){
		this.id = String(this.category);
		for (var ix = 0 ; ix < this.number.length ; ix ++){
			if(ix) this.id += "-";//コネクタ挿入
			var count = (ix > 0)? 2:4;
			this.id += nas.Zf(this.number[ix],count);//番号追加
		};
	return this.id;
};
/**
 * idの再設定を行い現在のidfを得る formオプションがtrueなら最小のidfを返す
 *	@params {Boolean}   form
 *		Xx####-##[name](information)
 */
nas.Pm.ReferenceDocument.prototype.getIdf = function(form){
	var idf = this.setId();
	var inf = "";
	if(this.name) idf += "[" + this.name + "]";
	if(form) return idf;
	if((this.parent)&&(this.parent.isDraft(this.category))){
		if(this.version > 1){
			inf = nas.localize({en:"draft_ver%1",ja:"準備稿_第%1稿"},this.version);
		}else{
			inf = nas.localize({en:"draft",ja:"準備稿"});
		};
	}else if(this.version > 1){
		inf = nas.localize({en:"ver%1",ja:"改定%1稿"},this.version);
	};
	if(inf) idf += "(" + inf + ")";
	return idf;
}
/**
 *	@params {String}	form
 *		JSON|fullname|idf|dump|full-dump|plain-text|text
 *
 *
//	nas.Pm.ReferenceDocument
	this.id         = "Aa0000-00";//unique 合成識別ID文字列またはクラスメソッドで比較
		this.category = "Aa";//分類記号 パースして保持
		this.number   = [0,0];//要素数可変の配列ID 内部表現は整数文字列
	this.version     = 2;//オリジン1整数ID
	this.name        = "キャラ設定一覧";
	this.note        = "キャラクター設定一覧表 準備稿山田版";
	this.document    = "./00Aa/Aa0000-00[キャラ設定一覧](準備稿 2版).png";//unique
	this.picture     = "./00Aa/_thumbnails/Aa0000-00_2.png";//サムネイルは共用もあり得るが推奨はされない　データ無しは可
//	JSON
{
	"id"        : "Aa0000-00",
	"version"   : "2",
	"name"      : "キャラ設定一覧",
	"note"      : "キャラクター設定一覧表 準備稿山田版",
	"document"  : "./00Aa/Aa0000-00[キャラ設定一覧](準備稿 2版).png",
	"picture"   : "./00Aa/_thumbnails/Aa0000-00_2.png"
}
//	full-dump
//	"id","version","name","note","address","thumbnail"
["Aa0000-00","2","キャラ設定一覧","キャラクター設定一覧表 準備稿山田版","./00Aa/Aa0000-00[キャラ設定一覧](準備稿 2版).png","./00Aa/_thumbnails/Aa0000-00_2.png"]

//	plain-text
Aa0000-00[キャラ設定一覧]
	id       |id:Aa0000-00
	version  |版数: 2
	name     |名称: キャラ設定一覧
	note     |注釈: キャラクター設定一覧表 準備稿山田版
	document |書類: ./00Aa/Aa0000-00[キャラ設定一覧](準備稿 2版).png
	picture  |書影: ./00Aa/_thumbnails/Aa0000-00_2.png
 */
nas.Pm.ReferenceDocument.prototype.toString = function(form){
	if(! form) form = 'fullname';
	if(form == "JSON"){
		return JSON.stringify({
			"id":this.id,
			"version":this.version,
			"name":this.name,
			"note":this.note,
			"document":this.document,
			"picuture":this.picture
		},null,2);
	}else if((form == "dump")||(form == "full-dump")){
		return JSON.stringify([
			this.id,
			this.version,
			this.name,
			this.note,
			this.document,
			this.picture
		])
	}else if((form == "text")||(form == "plain-text")){
        var props = ["id","version","name","note","document","picture"];
	    var result = [this.getIdf(true)];
	    for (var i = 0 ; i < props.length ; i ++ ){
	        var prp = props[i];
	        if(this[prp]) result.push("\t"+prp+":"+this[prp]);
	    }
	        result.push("");//改行分
	    return result.join("\n");
	}else{
	    var result = [
		    this.category,
		    nas.Zf(this.id,4),
		    "-",
		    nas.Zf(this.vaersion,2)
	    ].join('');
	    if((form != "idf")&&(String(this.name).length > 0)){
		    result += "[" + this.name + "]";
	    }
	    if(this.parent.categories[this.category].isDraft()){
		    result += "(" + nas.localize({en:"draft",ja:"準備稿"}) + ")";
	    }else if(this.version > 1){
		    result += "(" + nas.localize({en:"ver.%1",ja:"改定%1稿"}) + ")";		
	    }
	return rerult;
    }
}
/* TEST
//
var TEST = new nas.Pm.ReferenceDocument(
	null,
	"Ax0012-02",
	null,
	"ジャッキー02:網目模様の服",
	"ジャッキー衣装替え:02:網目模様の服",
	null,null
);
 */

/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
/** @constant
    基礎制作管理DB設定
*/
    nas.Pm.pmdb           = new nas.Pm.PmDomain();
    nas.Pm.users          = nas.Pm.pmdb.users;
    nas.Pm.staff          = nas.Pm.pmdb.staff;
    nas.Pm.assets         = nas.Pm.pmdb.assets;
    nas.Pm.pmTemplates    = nas.Pm.pmdb.pmTemplates;//Workflowに統合して削除予定
    nas.Pm.pmWorkflows    = nas.Pm.pmdb.pmWorkflows;
    nas.Pm.lines          = nas.Pm.pmdb.lines;
    nas.Pm.stages         = nas.Pm.pmdb.stages;
    nas.Pm.jobNames       = nas.Pm.pmdb.jobNames;
    nas.Pm.organizations  = nas.Pm.pmdb.organizations;
    nas.Pm.medias         = nas.Pm.pmdb.medias;
    nas.Pm.configurations = nas.Pm.pmdb.configurations;
    nas.Pm.workTitles     = nas.Pm.pmdb.workTitles;
    nas.Pm.products       = nas.Pm.pmdb.products;


    nas.pmdb            = nas.Pm.pmdb;
//    nas.xMap    = xMap;
//    nas.Xps     = Xps;
    exports.nas = nas;
}else{
/** @constant
    基礎制作管理DB設定
*/
    nas.Pm.pmdb           = new nas.Pm.PmDomain();
    nas.Pm.users          = nas.Pm.pmdb.users;
    nas.Pm.staff          = nas.Pm.pmdb.staff;
    nas.Pm.assets         = nas.Pm.pmdb.assets;
    nas.Pm.pmTemplates    = nas.Pm.pmdb.pmTemplates;//Workflowに統合して削除予定
    nas.Pm.pmWorkflows    = nas.Pm.pmdb.pmWorkflows;
    nas.Pm.lines          = nas.Pm.pmdb.lines;
    nas.Pm.stages         = nas.Pm.pmdb.stages;
    nas.Pm.jobNames       = nas.Pm.pmdb.jobNames;
    nas.Pm.organizations  = nas.Pm.pmdb.organizations;
    nas.Pm.medias         = nas.Pm.pmdb.medias;
    nas.Pm.configurations = nas.Pm.pmdb.configurations;
    nas.Pm.workTitles     = nas.Pm.pmdb.workTitles;
    nas.Pm.products       = nas.Pm.pmdb.products;
/**
  管理情報アクセスポイント
  nas.pmdbは、アクセスポイントとして働くプロパティ
 PmDomain または nas.Pm.pmdb を参照する
*/
    nas.pmdb            = nas.Pm.pmdb;
};
