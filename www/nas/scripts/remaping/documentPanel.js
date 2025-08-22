/** 
 * @fileoverview UAT　documentPanel.js
 *    サーバ対応ドキュメントパネル機能
 *    調整後はxUIに統合予定
 * @aouther kiyo@nekomataya.info (ねこまたや)
 * @version 0.9.1 20190221
 */
'use strict';
/*
ドキュメントパネル自体が、データリストを保持する構造にする


実際にデータを保持しているモジュールに対してリスト取得リクエストを出し、自分自身のデータリストを管理する
アプリケーション内の請求手続きは一種類にしてサービスエージェントを通してモジュール間の差異を吸収する

ローカルストレージを使用した参考リポジトリを設計実装する
（サービスモジュールのデフォルト値として登録する）

UI上のドキュメントパネルのオプションリストは、表示用のバッファとして利用（保持リスト本体ではない）

リストのソート タイトルソート・話数ソート・フィルタ等の補助機能を実装
カット番号リストは、ソートを基本　逆順表示　番号フィルタ　を設計実装

ドキュメントエントリは、SCiオブジェクトにサービスへの参照を拡張して使用

    serviceAgent.currentRepository

現在使用しているリポジトリのリスト
サービスにアクセスするごとに更新
サービスエージェント上のエントリへの参照

pmdb.productsへの参照

プロダクトコレクション　サービスにアクセスするごとに更新
各プロダクトは独立したデータとして一覧アクセスできるようにしておく
フィルタは、Depotのオブジェクトメソッドで実装
**nas.Pm.Opus オブジェクトを使用　リポジトリへの参照を加える
opusが同じでリポジトリが異なる場合は、同エントリ内で複数を保持

空プロダクトを作成する際は、リポジトリ内に対応する　TITLE及びOPUSを同時に作成するようにトライする
対応するオブジェクトが存在しないエントリは処理に失敗する

カット（＝ドキュメント）のエントリは空のままでも良い

ドキュメントエントリーコレクション　サービスにアクセスするごとに更新
ドキュメントエントリはカプセル化されたオブジェクトにする　SCi互換 pmdb.products[opusIdf].stbd.contents　への参照

    currentServer           {Object Server}      現在ブラウザで選択表示中のサーバ | null
    currentRepository       {Object Reopository} 現在ブラウザで選択中のレポジトリ | null
    currentProduct          {Object nas.Pm.Opus} 現在ブラウザで選択中のプロダクト | null

    currentRepositoryTimestamp  {Number}    ブラウザを更新した時点のタイムスタンプ
    currentProductTimestamp     {Number}    ブラウザを更新した時点のタイムスタンプ

    currentSelection        {String} 現在ブラウザで選択中のドキュメント識別子 | null
    currentDocumentBag      {Object StoryBoard.SBxMap} 現在編集対象xMAP DB上のエントリ
    currentDocument         {Object SToryBoard.SBShot} 現在編集対象Xps  DB上のエントリ
    currentReferenece       {Object Xps} 現在表示対象の参考Xps  (xUI.referenceXPSの相互参照)
として扱う

documentDepot.currentProduct は pmdp.products エントリへの参照　または　null

*/
//エントリを格納するオブジェクト xUIを再初期化するのでこのコードが消える
//良くない
/** @class アプリケーション内でドキュメントエントリを格納するクラス
 */
var documentDepot = {
    sortOrders         :['name+'],
    browseFilters      :{},
    currentServer      :null,
    currentRepository  :null,
    currentProduct     :null,
    currentSelection   :null,
    currentDocumentBag :null,
    currentDocument    :null,
    currentReferenece  :null,
    currentServerTimestamp      :0,
    currentRepositoryTimestamp  :0,
    currentProductTimestamp     :0
};
/**
 *  ドキュメントブラウザの保持データを初期化
 *
 *    ドキュメントセレクタのアップデートを行う<br />
 *    タイトルリスト及びドキュメントコレクションをクリア後<br />
 *    リポジトリのエントリリストを走査してコレクションを再構築してブラウザをアップデートする
 *    ** リポジトリ(エントリリスト)の更新は行わない　必要に従って事前に更新の要あり
 *
 *    逐次的に画面の再描画が可能なように変更する20170322
 *
 *    引数リストを受けて、現在のエントリと比較を行い逐次更新を行うように変更するか?
 *    ならば　事前に引数リスト組む必要あり
 *    または　参照するエントリリストの複製を持って差分のみの更新を行う？　複製が大変？
*/
documentDepot.documentsUpdate=function(){
console.log('=+=============+++===== documentsUpdate = NOP');
return;
}
/**
 *  @params {String}    identifier
 *    ショット識別子を引数にしてリポジトリ上のドキュメントを開く
 *    引数が指定されない場合は、セレクタの値を使用する
 *      ショットの含まれるxmap全体が読み込まれる
 *    基本・必要な情報はstbd上にある（サーバに都度アクセスしない）
 *    更新のタイミングを管理する
 *    バックエンド更新を基本とする
 *
 */
documentDepot.openEntry = function(identifier){
    if(!(identifier)) identifier = this.currentSelection;
    if(!(identifier)) return false;
console.log('open : ' + decodeURIComponent(identifier));
//アクティブなstbd上のエントリをカット識別子で指定する SBxMap|SBShot
    var targetShot = serviceAgent.currentRepository.entry(identifier,'shot');
console.log(targetShot);
//カットの所属するxMapをハンドリングバッファに格納
    this.currentSelection   = targetShot.getIdentifier('time');//
    this.currentDocument    = targetShot     ;//単カット nas.StoryBoard.SBShot
    this.currentDocumentBag = targetShot.xmap;//カット袋 nas.StoryBoard.SBxMap
    document.getElementById('current_identifier').innerHTML = (this.currentSelection)?this.currentSelection:'<br>';
// tokenが存在すれば既存エントリである　⇒　サービスに対して請求が可能
// ローカルリポジトリ｜ネットワークリポジトリを問わず既存エントリが値を持っているとは限らないので注意
    if ((this.currentDocumentBag)&&(this.currentDocumentBag.token)){
console.log(this.currentDocumentBag)
// 既存xMapエントリ
        serviceAgent.currentRepository.getEntry(
            this.currentDocumentBag.getIdentifier(),
            false,
            function(content){
console.log(content);
                
                xUI.documents.clear();
                if(content){
console.log('get content for :' +documentDepot.currentDocumentBag.getIdentifier());
                    xUI.documents.setContent(content);
                }else{
//エントリが存在するがコンテンツが未登録（ローカルでは無いが、UAT上では発生する）
                    var currentIdf = documentDepot.currentDocumentBag.getIdentifier();
console.log(currentIdf +' : has no content so build new xMap');
                    serviceAgent.currentRepository.getxMap(
                        currentIdf,
                        function(resultDat){
                            xUI.documents.setContent(resultDat);
                        },
                        function(resDat){
                            console.log('error !'); console.log(resDat);
                        }
                    );
                    return;
                }
            },function(result){
                console.log('detect error :');
                console.log(result);
            });
    }else{
//既存のｘMapがない    バルクのxMapをメモリ上に作成して　xUI.Documentへ設定 保存は遅延させる
//兼用情報のみのxMapをdocumentsに設定
//現状xMapデータのビルドを行う機能をdocuments.setContentsメソッドから呼ぶようにしてこのルーチンを単純化する
console.log('no entry for :' + targetShot.xmap.getIdentifier());
console.log('================= new xMap data =========');
        xUI.documents.clear();//ドキュメントバッファクリア
        serviceAgent.getxMap(
            targetShot.xmap.getIdentifier(),
            function(resultDat){
                xUI.documents.setContent(resultDat);
            },
            function(resDat){
                console.log('error !'); console.log(resDat);
            }
        );//新規xMapをメソッドで生成
    }
}
/**
 *  引数なし
 *    現在開かれているショット（ドキュメント）をクローズして初期状態を作成する
 */
documentDepot.closeEntry = function(){
//アクティブなstbd上のxmapエントリをカット識別子で指定する
    var targetShot = serviceAgent.currentRepository.entry(xUI.XMAP.getIdentifier());
    if(! targetShot) return false;
//ショットが、アクティブならディアクティベートする
	if(xUI.XMAP.pmu.currentNode.jobStatus.content = 'Active'){
		this.deactivate(function(){xUI.documents.setContent(new xMap.toString());xUI.setUImode('browsing');});
	}else{
		xUI.documents.setContent(new xMap.toString());
		xUI.setUImode('browsing');
	}
}
/* 現在機能停止中　削除予定
 *    カレントのドキュメント情報からプロダクト識別子の配列を抽出して戻す
 *    @return {Array}
*/
documentDepot.getProducts=function(){
console.log('documentDepot - getProducts! NOP 現在機能停止中　削除予定');return [];
}
/**
 *   リポジトリセレクタを更新する
 *
 */
documentDepot.updateRepositorySelector=function(){
    if(
        (this.currentServerTimestamp)&&
        (this.currentServer === serviceAgent.currentServer)&&
        (this.currentServerTimestamp >= serviceAgent.currentServer.pmdb.timestamp)&&
        (this.currentRepository === serviceAgent.currentRepository)
    ) return ;
console.log("\t\t:change")
    var selectorDisabled = true;
    var selected = 0;
    var myContents= '<option value="0">= local Repository =</option>' ;
    if(serviceAgent.repositories.length > 1){
        for(var idr=1; idr < serviceAgent.repositories.length;idr ++){
            if(serviceAgent.repositories[idr] === serviceAgent.currentRepository) selected = idr;
            myContents +='<option value="'+idr+'">'+serviceAgent.repositories[idr].name+'</option>'; 
        };
        selectorDisabled = false;
    }
    if( document.getElementById('repositorySelector').innerHTML != myContents){
console.log("change selector content \n" +document.getElementById('repositorySelector').innerHTML +"\n"+ myContents);
        document.getElementById('repositorySelector').innerHTML = myContents;
    }
    document.getElementById('repositorySelector').disabled  = selectorDisabled;
    document.getElementById('repositorySelector').value = selected;
console.log(serviceAgent.currentServer);
    this.currentServer = serviceAgent.currentServer;
    this.currentServerTimestamp = serviceAgent.currentServer.pmdb.timestamp;
}
/**
 *  タイトルセレクタを更新する
 *  タイトルセレクタは、productsデータの表示を制限するフィルタ
 *  フィルタ未指定の場合、表示可能なエントリをすべて表示する
 */
documentDepot.updateTitleSelector=function(){
console.log([serviceAgent.currentRepository.pmdb.timestamp,this.currentRepositoryTimestamp])
    if(
        (this.currentRepositoryTimestamp)&&
        (serviceAgent.currentRepository === this.currentRepository)&&
        (serviceAgent.currentRepository.pmdb.timestamp <= this.currentRepositoryTimestamp)
    ){ console.log('skip update TitleSelector');return ;}
    this.currentRepository = serviceAgent.currentRepository ;
    this.currentRepositoryTimestamp = serviceAgent.currentRepository.pmdb.timestamp;

    var titles = serviceAgent.currentRepository.pmdb.workTitles.members;
    var targetElement = document.getElementById('titleSelector');
//暫定処理 2020.11.05
    if(! targetElement) targetElement = document.getElementById('workTitleSelector');
    var currentTitleID = (this.currentProduct)? this.currentProduct.title.id:null;
    var listData = '<option value = "(*--all--*)">(*--all--*)';
    for (var ttl in titles){
        listData += '<option value="'+
        titles[ttl].id+'"'+
        ((currentTitleID == titles[ttl].id)?" selected ":"")+
        '>'+titles[ttl].fullName;
    }
console.log(listData);
    if(targetElement) targetElement.innerHTML = listData;
}
/**  タイトルIDを指定してプロダクトセレクタを更新する
 *    @params {String}    titleID       タイトルID
 *    @returns {Array}    フィルタリング済のリスト配列
 *<pre>
 *    更新後のセレクタ内に現在の被選択プロダクトがある場合はそれを選択状態にする
 *    ない場合はいずれの要素も選択状態にしない（選択プロダクトはそのまま）
 *    プロダクトリストは、都度生成に変更（スタティックには持たない）
 *
 *    エントリフィルタは正規表現を廃止
 *    フィルタリングは 全タイトル|単タイトルのみでページ上の情報を参照
 *  </pre>
 */
documentDepot.updateOpusSelector=function(titleID){
//console.log([serviceAgent.currentRepository.pmdb.workTitles.timestamp,this.currentProductTimestamp])
//    if(
//        (this.currentProductTimestamp)&&
//        (serviceAgent.currentRepository === this.currentRepository)&&
//        (serviceAgent.currentRepository.pmdb.products.timestamp <= this.currentProductTimestamp)
//    ) { console.log('skip update TitleSelector');return ;}
//    this.currentProduct = serviceAgent.currentRepository ;
//    this.currentProductTimestamp = serviceAgent.currentRepository.pmdb.workTitles.timestamp;

    var result = [];
    var products = serviceAgent.currentRepository.pmdb.products.members;
//
    var targetElement = document.getElementById('opusSelect');
//リストを再構成
    var listData = '<option value = "(*--no episode selected--*)">(*--no episode selected--*)';
    var targetTitle;
    var hasSelect = false;
    if(titleID) targetTitle = serviceAgent.currentRepository.pmdb.workTitles.entry(titleID);
    for (var prd in products){
        if((targetTitle)&&(targetTitle !== products[prd].title)) continue;
        if(targetTitle) documentDepot.currentProduct = products[prd];
        if(
            (documentDepot.currentDocument)&&(documentDepot.currentProduct)&&
            (documentDepot.currentDocument.parent.product == documentDepot.currentProduct.productName)
        ) hasSelect = true;
        listData += '<option value="' + products[prd].id+'">';
        listData += products[prd].productName+
        ((products[prd].subtitle)?'['+products[prd].subtitle+']':'');
        result.push(products[prd].productName);
    }
console.log(listData);
    if(targetElement.innerHTML != listData){
        targetElement.innerHTML = listData;
        targetElement.disabled  = false;
    }
    if(hasSelect){
        targetElement.value = documentDepot.currentProduct.id;
    }else{
        targetElement.value = "(*--no episode selected--*)";
    }
    this.updateDocumentSelector();
    return result;
}
/**  Documentセレクタを更新
 *
 *  更新前選択ドキュメントが更新後のセレクタ内に存在する場合は、それを選択状態にする
 *  ない場合は選択アイテムを空にする
 *  更新前選択ドキュメントは　documentDepot.currentSelectionを使用
 *  引数はStoryBoard.getListメソッドの引数に準ずる
 *
 *  Aborted ステータスのエントリは、制作管理モードでのみ表示可能にUIで調整
 *
 *    @params    {Object filterOption}    filter
 *    @params    {Array sortOrder}        sortOrders
 *
 *    @returns    {Array}     フィルタリング&&ソート済のリスト配列
 *
 *  ファイルセレクタの更新に関しては、キャッシュオブジェクトの整備に伴って構造変更が行われれるので要注意
 */
documentDepot.updateDocumentSelector=function(filter,sortOrders){
if(!(document.getElementById("dataBrowser"))) return [];


//    フィルタ構築　基本的にUI上のフィルタをここで取得・構築する　引数が指定された場合はそちらを優先
//エイリアスの実装は保留
    if(! filter){
        filter = {};
        filter.type      = document.getElementById('typeSelector').value;
        filter.shotCount = document.getElementById('rangeFilter').value;
        filter.line      = document.getElementById('lineSelector').value;
        filter.status    = document.getElementById('statusSelector').value;
    };
    this.browseFilters = filter;//指定されたフィルタを記録

//    ソート順構築　基本的にUI上のフィルタをここで取得・構築する　引数が指定された場合はそちらを優先
    if(! sortOrders){
        sortOrders = ['name+'];
        for (var s = 1 ;s < 6; s++){
            var sorterElement = document.getElementById('sortOrder0'+s);
            var sortOrder = sorterElement.innerHTML.split(':');
            sortOrder[0].trim().toLowerCase();
            if(sortOrder[1]=='') continue;
            sortOrders.push(sortOrder[0].trim().toLowerCase()+((sortOrder[1]=='▼')? "+":"-"));
        }
    }
//console.log([filter,sortOrders]);//未指定時はフィルタとソートオーダーをビルド
    var currentProduct = documentDepot.currentProduct;
    var dataList = (currentProduct)? currentProduct.stbd.getList(null,filter,sortOrders):[];//プロダクトが存在しないケースがある
//console.log(dataList);
    var myContents = "";
    var myResult   = [];
    myContents +=(dataList.length)? 
    '<option value="(*-- no document selected--*)" >(*-- no document selected--*)</option>':
    '<option value="(*-- no documents --*)" >(*-- no documents --*)</option>';
    for ( var dlid = 0 ; dlid < dataList.length ; dlid ++){
        var currentStatus = dataList[dlid].status.split(':');
            myContents += '<option';
            myContents += ' class="docStatus docStatus-';
            myContents += currentStatus[0];
if((currentStatus.content=='Fixed')&&(currentStatus[1])){
            myContents += "-2";
}
            myContents += '"';
            myContents += ' value="';
            myContents += dataList[dlid].entryIdf;
            myContents += '">';
            myContents += dataList[dlid].entryIdf.split('//')[1];
            myContents += ' ['+currentStatus[0];
            myContents += ']</option>';
            myResult.push(dataList[dlid]);
    }
    if (document.getElementById( "cutList" ).innerHTML != myContents){
        document.getElementById( "cutList" ).innerHTML = myContents;
        document.getElementById( "cutList" ).disabled  = false;
    }
//console.log(this.currentSelection);
    if(dataList.length){
        if(this.currentSelection){
            document.getElementById( "cutList" ).value = this.currentSelection;
        }else{
            document.getElementById( "cutList" ).value = '(*-- no document selected--*)';
        }
    }else{
        document.getElementById( "cutList" ).value = '(*-- no documents --*)';
    }
    document.getElementById( "cutList" ).focus();
    return myResult;//抽出したリスト
}
/** documentPanel上のソート順UIの変更を画面に反映させる
 *  UIの書き直し及びリストの更新
 *    @params {String}    type
 *        name|scene|cut|stage|user|date|status
 *    @params {Boolean}    order
 *        true|false
 
 *    @returns {Array}
 *      作成したソート用指定配列
 */
documentDepot.sortOrderChange=function(type,order){
    var currentOrders=[];
    var insPt = 0;
    for (var elid = 1 ; elid < 6;elid ++){
        currentOrders.push( document.getElementById('sortOrder0'+elid).innerHTML.split(':'));
        if(currentOrders[elid -1][1]!='') insPt ++;
    }
    var ix = currentOrders.findIndex(function(element){return(element[0].indexOf(type)>=0)},this);
    if (currentOrders[ix][1]==''){
        currentOrders.splice(ix,1);
        currentOrders.splice(insPt,0,[type,((order)? '▼':'▲')]);
    }else{
        currentOrders[ix]=[type,((order)? '▼':'▲')];
    }
    for (var elid = 1 ; elid < 6;elid ++){
        document.getElementById('sortOrder0'+elid).innerHTML = currentOrders[elid -1].join(' :');
        var setClass = 'sortOrder ';
        if(currentOrders[elid -1][1]=='▼'){
            setClass += 'sortOrder_down';
        }else if(currentOrders[elid -1][1]=='▲'){
            setClass += 'sortOrder_up';
        }else {
            setClass += 'sortOrder_none';
        }
        document.getElementById('sortOrder0'+elid).className = setClass;
    }
    documentDepot.updateDocumentSelector();
    return currentOrders;
}
/*
 *  ソート条件をすべてクリアして初期状態に戻し　リストを更新する
 */
documentDepot.sortOrderReset=function(){
    var currentOrders=["name","stage","user","date","status"];
    for (var elid = 1 ; elid < 6;elid ++){
        document.getElementById('sortOrder0'+elid).innerHTML = currentOrders[elid-1]+' :';
        document.getElementById('sortOrder0'+elid).className = 'sortOrder sortOrder_none';
    }
    return currentOrders;
}
/*
    ドキュメントエントリをセレクトする
    カットで選択しても、xmapで選択しても同じルーチンへ

    xmapエントリの有無を確認する
	ある		読み出してドキュメントへ展開
	ない		エントリを作成してリポジトリへ書き込む	成功したら開いてドキュメントへ展開

    xmap展開済の状態から

    xpsのエントリの有無を確認する
	ある		読み出してドキュメントへ設定
	ない		エントリを作成してリポジトリへ書き込む　書き込みに成功したらドキュメントへ展開
	
兼用カット数くりかえし

	完了したら制御をユーザへ渡す
	openSelectedとして実装したほうが良いか？
*/


/*
読み出し・請求
    明示的にリスト内のサーバにアクセスする場合は、その時点の最新リストを請求してリストを更新する
    キャッシュを利用する場合は、リストの更新はなし。
    
書き込み・更新
    データの保存は、
        アプリケーション終了（ウインドウクローズ）時の自動バックアップ
        明示的なバックアップへの退避（↑上と同じ領域）

        保存先「リポジトリ」を指定して保存
        上書き保存
            「リポジトリ」の指定がない場合は、上書き保存
        新規作成時
            カレントリポジトリを使用
            任意のリポジトリを指定するには保存前にカレントの変更が必要
            
リポジトリについて
    リポジトリは、このシステム上「データ保存場所」に識別用の名前を付けて管理対象としたもの。

    タイムシート・カット袋等の制作管理及びカット内容のメタデータ　及び将来的には、これらのデータに記載された制作データそのものを保存
    ユーザのリクエストに従って読み書き可能なサービスとする。

    リポジトリには、基本的に制作管理DBの機能はない。
    制作管理DBの機能は、一般のRDBMサービスを立ち上げそこで利用するものとする。
    基本的にリポジトリとは別の接続を使用する
    
    簡易的なデータの解釈は、リポジトリから読み出したデータをアプリケーションがパースして行う。
    簡易のパース結果を識別子としてリポジトリに送り、それをファイル名又はそれに類するメタ情報として保存して利用する
    リポジトリにはデータの解釈（解析）を求めない。
    
        １＞必要なデータを保存時に識別子としてデータにつけてアプリケーション側から送信する
        ２＞リポジトリサーバは、その識別子を利用して保存を行う
                リスト要素を分解するか否かはサーバ側の事情で使い分けて良い
                階層管理する場合は、要素ごとに分解してディレクトリを分ける等の処理を行うとデータの管理が容易になる
                 /(作品)/(話数)/(カット)/(ライン)/(ステージ)/(ジョブ)/(タイムシートデータ) 等のデータ配置にすると
                 バックアップやレストア等の処理に利便性あり
        
    識別子の型式（埋め込み情報）は以下の様にする（仮仕様　2016/11/20）
    
title＃opus[subtitle]//SsceneCcut(seconds+frames) / SsceneCcut(seconds+frames) / SsceneCcut(seconds+frames) //lineID//stageID//jobID//

例:
    origData
かちかち山Max#おためし[サンプルカット] // S-C10(72) //0//0//0
    encodeURIComponent
%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97[%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%AB%E3%83%83%E3%83%88] // S-C10(72) //0//0//0


タイトル・カット番号・サブタイトル等のデータにはセパレータ等の予約文字列が含まれるケースがあるので識別子を作成前にURI置換を行う必要あり
置き換え又はエスケープの必要な文字列（使用禁止のセンも考慮）
\n  　　改行　           - 使用禁止
/   　　スラッシュ       - \###
#＃No.　ナンバーサイン   - 
[ ] 　　角括弧           - 
「 」 　カギ括弧         - 
"'  　　引用符           - 
encodeURIComponent() を識別子組み立て前に通す
必要に従ってdecodeURIComponent()

　  上記の型式で（今回実装のローカルリポジトリではこの方法を採用する）        
    簡易パース手順
        split("//")
            5要素なら上書き可
            6要素ならロック(fix)されて上書き不可
            
            第一要素　プロダクト識別子　パース手順あり
            第二要素　SCi識別子
                split("/")
                第一要素代表カット番号　第二要素以降は兼用番号　第一要素と同じ番号が入る場合があるがその場合は無視
                各要素はカット番号とカット尺に分解して利用　カット尺は省略可能
            第三要素    ラインID   (Int 通番)　 各要素にname要素を付加しても良い　0:本線//1:レイアウト//0:打合せ　等
            第四要素    ステージID (Int 通番)
            第五要素    ジョブID   (Int 通番)
            第六要素    ジョブステータス　値は文字列 Startup/Active/Hold/Fixed/Aborted いずれか

*   作業ステージを閉じる処理は、ユーザがアプリケーション側で行う
    その際、識別子にフィックスのサインを付加する（第六要素'Fixed'）
    フィックスされたデータが上書きされることはない　データの請求は常に有効
    将来的には、ステージ/ジョブを内部に備えたXps,xMap 等が利用されるが、その際もこの識別子はそのまま使用可能

りまぴんで呼び出しの際は、基本的に既fixのデータはリファレンスに　未fixのデータは編集エリアに読み込む
    
    第一要素をパースしてタイトル/OPUS情報を取得可能
    第二要素を split("/")　で兼用情報が得られる　第一要素が当該のカット番号
        各カット情報は カット番号(カット尺) *durationではない　transition情報もない（この通信では不用）
        プロトコル上は(カッコ内)は補助情報とする
            duration,transition等の情報を追加することも可能？
        
以上の機能をアプリケーション側で処理することで、RDBMのない状態で通常のストレージをリポジトリとして使用可能になる
とくにローカルファイルシステムを使う際は
    URIエンコードを施しファイル名規則に抵触するのを避ける
    長いファイル名を利用できる環境を使用すること
    識別子は分解してディレクトリをわけて保存するか、又はエスケープしてスラッシュがファイル名に含まれるの避ける

    リポジトリに要求される機能は、
        1.アプリケーションからの請求に従って、保存しているデータの識別子リストを送り返す
        2.アプリケーションから送信された(識別子付き)データを受信して、
            同じ識別子のエントリがあれば上書きする
            エントリがない場合は新規に保存エントリを作成する
        3.アプリケーションからの請求に従って、指定された識別子の保存データを送信する
        
    1.      list(filter)
        あまりエントリ数が多いと待ち時間が増すので、フィルタ機能はあったほうが良い
        （アプリケーション側でもフィルタするので無くても良い）
    2.      write(identifier)
        識別子のエントリがない場合は、新規エントリを登録
    3.      read(identifier)
        識別子のエントリがない場合は。操作失敗のレスポンスを返す

* webStorage には一般的なリスト機能はないが　全キーを取得してリストを構築することは可能
    リストオブジェクトをJSONパースしてストレージに一括で納める？
ただし、ブラウザ全体で５MB程度ととして、シートエディタのみでこれを専有するわけにもいかないので基本的にはドキュメントエントリ数を限って扱う。
試験的には複数エントリが扱えるように組む（ローカルファイルやDropBox/GoogleDrive等のネットストレージに対応するため）


*/
/**
 *  @params {String|Object nas.Pm.Opus}   product
 *    プロダクトオブジェクトまたはタイトル文字列
 *    プロダクトを選択して入力エリア/カットセレクタを更新
 *    文字列の場合は以下の型式で分解する
 *    <タイトル>[#＃№]<ep番号>[<サブタイトル>]
 *    
 *    ももたろう＃12 [キジ参戦！ももたろう地獄模様！！]
 *    源氏物語 #23帖 [初音]
 *    
 *    タイトルと話数はナンバーサイン[#|＃|№]で区切る
 *    サブタイトルが存在する場合は、[]角括弧|「」カギ括弧|""引用符 で区切って記入する
 */
function setProduct(product){
//    if(documentDepot.currentProduct){
//console.log('current Procuct is : '+ documentDepot.currentProduct.toString());
//console.log('change to :' + product);
//    }
//ドキュメント（カット）ブラウザの表示をリセット（クリア）
    document.getElementById('cutList').innerHTML = "<option selected>（*-- no document --*）";
    document.getElementById( "cutList" ).disabled=true;
    if(typeof product == "undefined"){
    //プロダクト名が引数で与えられない場合はセレクタの値をとる
    //選択されたアイテムがない場合は、デフォルト値を使用してフリー要素を選択する
        if ( document.getElementById("opusSelect").selectedIndex > 0 ){
            product = serviceAgent.currentRepository.pmdb.products.entry(document.getElementById("opusSelect").options[document.getElementById("opusSelect").selectedIndex].value);
        }else{
            document.getElementById("opusSelect").selectedIndex = 0;
            product = '';
        }
    }else{
//console.log("changeSelector");
    //プロダクトが与えられた場合は、可能ならばセレクタの選択を更新する
        if((product != null)&&(!(product instanceof nas.Pm.Opus))){
            product = serviceAgent.currentRepository.pmdb.products.entry(product);
        }
//console.log(product);
        document.getElementById('opusSelect').value=(product)? product.id:'(*--no episode selected--*)'
    }
// プロダクトからデータリストを取得して右ペインのリストを更新
    documentDepot.currentProduct = (product)? product : null ;
// ドキュメントセレクタ更新
    documentDepot.updateDocumentSelector();
}
/*TEST
    setProduct("源氏物語＃二十三帖「初音」");
*/
/**
 *  カット識別子またはフルの識別子を与えてエントリーを選択する
 *  @params {String}    sciName
 *      カット識別子
 */
function selectSCi(sciName){
    if(typeof sciName == "undefined"){
//カット名が引数で与えられない場合はセレクタの値をとる
//セレクタ値の場合は、ドキュメントリストの対応するエントリを取得
//選択されたアイテムがない場合は、デフォルト値を使用してフリー要素を選択する
        if ( document.getElementById("cutList").selectedIndex > 0 ){
            /*  セレクタで選択したカットのissuesをドロップダウンリストで閲覧可能にする？
                デフォルト値は最終issue
                これは、読み出し後のコンテキストメニューに移したほうが良い
                
             */
console.log(decodeURIComponent(document.getElementById("cutList").options[document.getElementById("cutList").selectedIndex].value))
            var selectedInfo = nas.Pm.parseIdentifier(
                document.getElementById("cutList").options[document.getElementById("cutList").selectedIndex].value
            );
console.log(selectedInfo);
            var myShot = documentDepot.currentProduct.stbd.entry(selectedInfo.sci[0].name);
            if(myShot){
                var myEntry = serviceAgent.currentRepository.entry(myShot.getIdentifier());
console.log(myEntry);
                sciName = myEntry.sci.toString('time');
            }
        }else{
            document.getElementById("issueSelector").innerHTML='<option value="" selected>#:---line//#:---stage//#:---job//(status)</option>';
            document.getElementById("issueSelector").disabled=true;
            document.getElementById("cutList").selectedIndex = 0;
            sciName = "(*--c#--*)";
            var myEntry = null;
        }
    }
    sciName=String(sciName);//明示的にストリング変換する
    if(sciName.length <= 0){return false;}
    var sciArray=sciName.split( "/" );//セパレータ"/"で兼用カットを分離
    //代表カット番号 はsciArray[0]
    if(sciArray[0].match(/^\s*(.+)\s*\(([^\)]+)\)\s*$/)){
        var cutNumber = RegExp.$1;
        var cutTime  = parseInt(nas.FCT2Frm(RegExp.$2)); 
    }else{
        var cutNumber = sciArray[0];
        var cutTime   =  6*nas.FRATE;//６秒分フレーム
    }
    if (document.getElementById("cutList").selectedIndex <= 0){}
    if (! myEntry){
//選択されたドキュメントがリスト内に無い　
        document.getElementById("ddp-readout").disabled     = true;
        document.getElementById("ddp-reference").disabled   = true;
//        if(xUI.uiMode=='management')
//        for (var tidx = 0 ; tidx < myInputText.length ; tidx ++ ){
//            document.getElementById(myInputText[tidx]).disabled = false;
//        }
    }else{
//リポジトリ内に指定データが存在する
        document.getElementById("ddp-readout").disabled     = ((xUI.onSite)&&(serviceAgent.currentStatus=='online-single'))? true:false;//シングルドキュメント拘束時読出抑制
        document.getElementById("ddp-reference").disabled   = false;//参照は無条件読出可能
    }
    documentDepot.currentSelection   = (myEntry)? myEntry.getIdentifier():null;
    documentDepot.currentDocument    = (myEntry)? myEntry:null;
    documentDepot.currentDocumentBag = (myEntry)? myEntry.xmap:null;
    document.getElementById('current_identifier').innerHTML = (documentDepot.currentSelection)?documentDepot.currentSelection:'<br>';
    if((xUI.uiMode=='management')&&(!myEntry)){
        document.getElementById('ddp-addentry').disabled    = false;
    }else{
        document.getElementById('ddp-addentry').disabled    = true;
    }
    if((myEntry)&&(serviceAgent.currentRepository===localRepository)){
        document.getElementById('ddp-removeentry').disabled = false;
    }else{
        document.getElementById('ddp-removeentry').disabled = true;
    }
}
/*
 プロダクト名　カット番号ともに編集可能とそうでないケースをグラフィックで表示する機能が必要
 選択のみで編集不能な場合、文字をグレーアウトさせるか？
 最初からグレーアウトで編集キーを押したときのみ編集可能（＝新規作成）とするか　要調整
*/