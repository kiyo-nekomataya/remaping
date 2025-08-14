/** 
    @aouther kiyo@nekomataya.info (ねこまたや)
    @fileoverview
    UAT　documentPanel
    サーバ対応ドキュメントパネル機能
    調整後はxUIに統合予定
    
ドキュメントパネルが、データリストを保持するためのオブジェクト

実際にデータを保持しているモジュールに対してリスト取得リクエストを出し、自分自身のデータリストを管理する
アプリケーション内の請求手続きは一種類にしてサービスエージェントを通してモジュール間の差異を吸収する

ローカルストレージを使用した参考リポジトリを設計実装する
（サービスモジュールのデフォルト値として登録する）

UI上のドキュメントパネルのオプションリストは、表示用のバッファとして利用（保持リスト本体ではない）

リストのソート タイトルソート・話数ソート・フィルタ等の補助機能を実装
カット番号リストは、ソートを基本・逆順表示・番号フィルタ を設計実装

ドキュメントエントリは、SCiオブジェクトにサービスへの参照を拡張して使用
*/

/**
    serviceAgent.currentRepository
現在使用しているリポジトリのリスト
サービスにアクセスするごとに更新
サービスエージェント上のエントリへの参照

    documentDepot.products
プロダクトコレクション・サービスにアクセスするごとに抽出更新
各プロダクトは独立したデータとして一覧アクセスできるようにしておく
フィルタは、Depotのオブジェクトメソッドで実装
nas.Pm.Opus オブジェクトを使用　リポジトリへの参照を加える
opusが同じでもリポジトリが異なる場合は、同エントリ内で複数を保持

空プロダクトを作成する際は、リポジトリ内に対応する　TITLE及びOPUSを同時に作成するようにトライする
対応するオブジェクトが存在しないエントリは処理に失敗する

カット（＝ドキュメント）のエントリは空のままでも良いがOPUSを持たないタイトルはアプリの表示規則上許可されない

サービスエージェントを介しリポジトリのエントリを
主にローカルリポジトリや、ホームリポジトリでの使用を前提とする?


    documentDepot.documents
    
ドキュメントエントリーコレクション
サービスにアクセスするごとに更新
ドキュメントエントリはカプセル化されたオブジェクト・SCi互換
ListEntry オブジェクトのコレクションとして実装

    currentProduct          現在ブラウザで選択中のプロダクト識別子
    currentSelection        現在ブラウザで選択中のドキュメント識別子
    currentDocument         現在編集対象のXps      (xUI.XPS の相互参照)
    currentReferenece       現在表示対象の参考Xps  (xUI.referenceXPSの相互参照)
として扱う
*/
//エントリを格納するオブジェクト xUIを再初期化するのでこのコードが消える
//良くない

documentDepot = {
    products    :[],
    documents   :[],
    currentProduct:null,
    currentSelection:null,
    currentDocument:null,
    currentReferenece:null
};
/**
    ドキュメントブラウザの保持データ初期化

    ドキュメントセレクタのアップデートを行う
    タイトルリスト及びドキュメントコレクションをクリア後
    リポジトリのエントリリストを走査してコレクションを再構築してドキュメントブラウザをアップデートする
    ** リポジトリ(エントリリスト)の更新は行わない　必要に従って事前に更新の要あり

    逐次的に画面の再描画が可能なように変更する20170322

    引数リストを受けて、現在のエントリと比較を行い逐次更新を行うように変更するか?
    ならば　事前に引数リスト組む必要あり
    または　参照するエントリリストの複製を持って差分のみの更新を行う？　複製が大変？
*/
documentDepot.documentsUpdate=function(){
console.log('=+=============+++===== documentsUpdate ')
/*  既存データをクリアしない
引数で受け取ったデータ群は、新規のデータ構造を組んで従来のデータと照合しながら更新を行う
    既存エントリ＞新規データで置き換え
    新規エントリ＞新規データから追加
リムーブの機能が必要となるが、それをどうするか？
    ○エントリそのものにリムーブメソッドを設ける
    ○アップデートメソッドに第二引数を設けてリストを与えて処理する

大量のリストが与えられた場合に、逐次的に一定数で画面をリフレッシュする（リストを分割処理する）機能を作る?
エントリ全体の比較更新と、逐次リフレッシュを機能分割したほうが良さそう？

ただし全体のパフォーマンスをひどく下げているのは、ServiceAgent.getList の再帰呼び出しなのでこの処理は後回しでもOK　2017.04.19

*/
    documentDepot.products  = [];
    documentDepot.getProducts();
    documentDepot.documents = serviceAgent.currentRepository.entryList;//カレントリポジトリのリストのみ
//    documentDepot.documents = myDocuments;
//    documentDepot.updateOpusSelector();
//    documentDepot.updateDocumentSelector();
}
/**
    カレントのドキュメント情報からプロダクト識別子の配列を抽出して戻す関数
*/
documentDepot.getProducts=function(){
    var myProducts  =[];
//productsData を走査してプロダクトリストを作成する
    for (var idx = 0 ; idx < serviceAgent.currentRepository.productsData.length ; idx ++){
        var myTitle = serviceAgent.currentRepository.productsData[idx].name;
        if(serviceAgent.currentRepository.productsData[idx].episodes){
        for (var ide = 0 ; ide < serviceAgent.currentRepository.productsData[idx].episodes[0].length ; ide ++){
                var myOpus = serviceAgent.currentRepository.productsData[idx].episodes[0][ide].name;
                var mySubtitle = serviceAgent.currentRepository.productsData[idx].episodes[0][ide].description;
                var myIdentifier = 
                        encodeURIComponent(myTitle)+
                    "#" + encodeURIComponent(myOpus)+
                    ((String(mySubtitle).length)?"["+mySubtitle+"]":"")
                myProducts.push(myIdentifier);
            }
        }
    }
    documentDepot.products=myProducts
    return myProducts;
}

/*
    @params {Object RegExp | String} myRegexp
        引数:エントリフィルタ用正規表現
    @params {Boolean}   rev
        フィルタを反転
    @returns {Array}
  OPUSセレクタを更新する
戻値:フィルタリング済のリスト配列
更新後のセレクタ内に現在の被選択アイテムがある場合はそれを選択状態にする
ない場合は選択アイテムを空に
プロダクトリストは、都度生成に変更（スタティックには持たない）
 */
documentDepot.updateOpusSelector=function(myRegexp,rev){
    if(!(myRegexp instanceof RegExp)){ myRegexp = new RegExp(".+");}
    if(!rev ) rev = false;
// ここで正規表現フィルタを引数にする
    var myContents = "";
    var myProducts = documentDepot.products;
    
    var options    = [];
    myContents += (myProducts.length)?
    '<option class=docStatus-NV value="==newTitle==" selected>（*-- no title selected --*）</option>':
    '<option class=docStatus-NV value="==newTitle==" selected>（*-- no titles --*）</option>';
    options.push((myProducts.length)?
        {value:"==newTitle==",className:"docStatus-NV",innerText:"（*-- no title selected --*）"}:
        {value:"==newTitle==",className:"docStatus-NV",innerText:"（*-- no titles --*）"}
    );
    for( var opid = 0 ; opid < myProducts.length ; opid ++){
        var currentText  = decodeURIComponent(myProducts[opid]);
        var currentData  = myProducts[opid];
        var contentClass = "docStatus document-selector-option-right";
        var contentStyle = "text-align:right;";
        var show = (currentText.match(myRegexp))? true:false;
        if(rev) show = !show;
        if(show){


            myContents += '<option';
            myContents += ' value="'+currentData;
            if (documentDepot.currentProduct == myProducts[opid]){
                myContents += '" selected>';
            }else{
                myContents += '">';
                documentDepot.currentProduct = null;
            }
            myContents += currentText;
            myContents += '</option>';
            options.push({
                value     :currentData.toString(),
                innerText :currentText,
                className :contentClass,
                style     :contentStyle
            });
        }
    }

	if(document.getElementById("opusSelect").link){
		document.getElementById("opusSelect").link.setOptions(options);
		document.getElementById("opusSelect").link.select(documentDepot.currentProduct);
    }else{
        if(document.getElementById( "opusSelect" ).innerHTML != myContents){
            document.getElementById( "opusSelect" ).innerHTML = myContents;
            document.getElementById( "opusSelect" ).disabled  = false;
        };
    };
    return options;
}
/*  Documentセレクタを更新
引数:エントリフィルタ用正規表現
戻値:フィルタリング済のリスト配列
被選択ドキュメントが更新後のセレクタ内に存在する場合は、それを選択状態にする
ない場合は選択アイテムを空にする

引数は正規表現よりも[開始番号,終了番号（表示個数？）]あたりにしたほうが何かと良いので順次変更
ドキュメントエントリは、ステータスを認識するように改修
Aborted ステータスのエントリは、制作管理モードでのみ表示
 */
 documentDepot.updateDocumentSelector=function(myRegexp){
// ここで正規表現フィルタを引数にする？
    if(!(myRegexp instanceof RegExp)){ myRegexp = new RegExp(".+");}
// 選択済みタイトルで抽出
console.log(documentDepot.currentProduct);
    var myDocuments = documentDepot.getEntriesByOpusid(documentDepot.currentProduct);
console.log(myDocuments);
//  正規表現フィルタで抽出してHTMLを組む
    var myContents = "";
    var options    = [];
    myContents +=(myDocuments.length)? 
    '<option class="docStatus-NV" value="==newDocument==" selected>（*-- no document selected--*）</option>':
    '<option class="docStatus-NV" value="==newDocument==" selected>（*-- no documents --*）</option>';
    options.push((myDocuments.length)?
        {value:"==newDocument==",className:"docStatus-NV",innerText:"（*-- no document selected--*）"}:
        {value:"==newDocument==",className:"docStatus-NV",innerText:"（*-- no documents --*）"}
    );
    for ( var dlid = 0 ; dlid < myDocuments.length ; dlid ++){
//全ドキュメント走査
        var currentText = decodeURIComponent(myDocuments[dlid].toString(0).split('//')[1]);
        var currentData = myDocuments[dlid];
        var currentStatus = currentData.getStatus();
        var contentClass  = "docStatus document-selector-option-left";
        var contentStyle  = "text-align:left;";

        if( (currentData.dataInfo.currentStatus.content.indexOf('Aborted') < 0) &&
            (currentData.dataInfo.sci[0].cut.match(myRegexp))
        ){

            contentClass += " docStatus-"+ currentStatus;
            if((currentStatus=='Fixed')&&(currentStatus.assign)){
                contentClass += "-2";
            };
            var myContents = '<option class="';
            myContents += contentClass;
            myContents += '" value="';
            myContents += myDocuments[dlid];
            if(this.currentSelection == myDocuments[dlid]){
                myContents += '" selected >';
            }else{
                myContents += '">';
                this.currentSelection = null;
            };
            currentText += ' ['+currentStatus.content +']';
            myContents += currentText;
            myContents += '</option>';
            options.push({
                value     :currentData.toString(),
                innerText :currentText,
                className :contentClass,
                style     :contentStyle
            });
//            options.push(currentText);
        }
    }
	if(document.getElementById("cutList").link){
		document.getElementById("cutList").link.setOptions(options);
		document.getElementById("cutList").link.select(documentDepot.currentSelection);
	}else{
		if(document.getElementById( "cutList" ).innerHTML != myContents){
			document.getElementById( "cutList" ).innerHTML = myContents;
			document.getElementById( "cutList" ).disabled  = false;
		};
	};
	return options;//抽出したリスト
}

/*
  現在の全エントリから　プロダクトIDが一致するエントリを抽出してカット順にソートして返す
引数:プロダクト識別子
 */
documentDepot.getEntriesByOpusid=function(myIdentifier){
    if(! myIdentifier) myIdentifier = documentDepot.currentProduct;
    myIdentifier+="//";
console.log(myIdentifier);
// タイトルIDで抽出
    var myDocuments = [];
    for ( var dcid = 0 ; dcid < documentDepot.documents.length ; dcid ++){
console.log(documentDepot.documents[dcid].toString());
console.log(myIdentifier);
        if(
            (documentDepot.currentProduct)&&
            (Xps.compareIdentifier(documentDepot.documents[dcid].toString(),myIdentifier) > -1)
        ){
            myDocuments.push(documentDepot.documents[dcid]);
        };
         continue;
    };
    myDocuments.sort(documentDepot.sortBySCi);
    return myDocuments;    
}
/**
listEntryのカット番号順にソートする　評価関数
*/
documentDepot.sortBySCi = function(val1,val2){return (nas.parseNumber(val1.sci)-nas.parseNumber(val2.sci))};
/**
    読み出して編集エリアに取り込む
    識別子が指定されない場合は、セレクタの値を見る
    ドキュメントリストに識別子が存在しない場合は、falseを返す
    読み込み成功時はセレクタが開いていたら閉じる
*/
documentDepot.getEntry =function(myIdentifier){
    if(typeof myIdentifier == 'undefined'){
        myIdentifier = documentDepot.currentSelection;
    }
    for (var did = 0;did < documentDepot.documents.length ; did ++){
        if (documentDepot.documents[did].toString() == myIdentifier){
            documentDepot.documents[did].parent.getEntry(myIdentifier);
            return true;
        }
    }
    return false
}
/**
    現在のテキスト入力状態から識別子をビルドする。
*/
documentDepot.buildIdentifier = function(addStatus){
    var result="";
    result += (document.getElementById('titleInput').value.match(/\(\*.*\*/)) ? "":
        encodeURIComponent(document.getElementById('titleInput').value);
    result += (document.getElementById('opusInput').value.match(/\(\*.*\*/)) ? "#":
        '#'+encodeURIComponent(document.getElementById('opusInput').value);
    result += (document.getElementById('subtitleInput').value.match(/\(\*.*\*/)) ? '':
        '['+encodeURIComponent(document.getElementById('subtitleInput').value)+']';
    result += '//';
    var mySCi =Xps.parseSCi(((document.getElementById('cutInput').value.match(/\(\*.*\*\)/)) ? '':
        document.getElementById('cutInput').value )+'('+document.getElementById('timeInput').value+')');
if(dbg) console.log(mySCi);
    var myNames = Xps.parseCutIF(mySCi[0].cut);
    result += (myNames.length > 1) ? 's'+encodeURIComponent(myNames[1])+'-c':'s-c';
    result += (typeof myNames[0] == 'undefined')?"":encodeURIComponent(myNames[0]);
    var timeSpc = parseInt(nas.FCT2Frm(String(mySCi[0].time)));
  if(timeSpc > 0){
    result += '( '+String(timeSpc)+' )';
  }
    if(addStatus){
        result +='//';
        result +=document.getElementById('issueSelector').value;
    }
if(dbg) console.log("buildIdentifier::");
if(dbg) console.log(mySCi[0].time);
if(dbg) console.log(decodeURIComponent(result));
    return result;
}
/**
    ドキュメントリストを更新する
    カレントリポジトリの内容を取得
    得たリストをブラウザの保持リストとして更新する
    先に存在するリストは破棄
    この処理をカットのステータス変更の度に行うとレスポンスの低下が著しいので
    要変更
    当該のカットの状況のみをアップデートする手続が必要
    実際は
    LocalRepositoryの場合listEntryのアップデートのみでOK
    NetworkRepositoryの場合はサーバのレスポンスからlistEntryをアップデートする
*/
documentDepot.rebuildList=function(force,callback){
    
    documentDepot.currentProduct     =null;
    documentDepot.currentSelection   =null;
    documentDepot.products    =[];
    documentDepot.getProducts();
    documentDepot.documents   = serviceAgent.currentRepository.entryList;
//    documentDepot.currentDocument    =null;
//    documentDepot.currentReferenece  =null;
/*=============*/
    if(typeof force == 'undefined') force = true;
//    serviceAgent.currentRepository.getProducts(force,callback);
//    serviceAgent.currentRepository.getList(force,callback);
//  テスト中はこれで良いが、その後はあまり良くない
//console.log(this);
//console.log(callback);
//    documentDepot.documentsUpdate();
    
}
/**
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
    入力されたタイトルを評価してセレクタを切り替える
*/
function selectBrowser(){
    var myTitle     = document.getElementById('titleInput').value;
    var myOpus      = document.getElementById('opusInput').value;
    var mySubtitle  = document.getElementById('subtitleInput').value;
    var myCutNo     = document.getElementById('cutInput').value;
    var myTime      = document.getElementById('timeInput').value;
/*
    セレクタの中から該当するエントリを検索して　存在すればそのエントリを選択状態にする
    手続きは、セレクタ側の各要素を分解して下位から順に評価
    明確に異なる値があった時点でエントリをリジェクト
    すべてリジェクトされた場合フリーエントリを選択状態にする
    サブタイトル・カット秒数は特に評価しない
*/

}
/**
    タイトルを選択して入力エリア/カットセレクタを更新
    productNameは以下の型式で分解する
    (タイトル)[#＃№](番号)[(サブタイトル)]
    
    ももたろう＃12 [キジ参戦！ももたろう地獄模様！！]
    源氏物語 #23帖 [初音]
    
    タイトルと話数はナンバーサイン[#＃№]で区切る
    サブタイトルが存在する場合は、[]角括弧,「」カギ括弧,""引用符で区切って記入する
*/
function setProduct(productName){
console.log('setProduct####')
console.log(productName);

//ドキュメント（カット）ブラウザの表示をリセット（クリア）
//    document.getElementById('cutList').innerHTML = "<option selected>（*-- no document --*）";
    document.getElementById('cutList').link.setOptions(["（*-- no document --*）"]);
    documentDepot.updateDocumentSelector();
//    selectSCi();
//ブラウザの選択を解除
    documentDepot.currentSelection=null;
    document.getElementById( "cutList" ).disabled = true;
    
    if(typeof productName == "undefined"){
    //プロダクト名が引数で与えられない場合はセレクタの値をとる
    //選択されたアイテムがない場合は、デフォルト値を使用してフリー要素を選択する
        if ( document.getElementById("opusSelect").selectedIndex >= 0 ){
            productName = ( document.getElementById("opusSelect").selectedIndex == 0 )?
            "#[]":
            document.getElementById("opusSelect").value;//.options[document.getElementById("opusSelect").selectedIndex].text;
        }else{
            document.getElementById("opusSelect").link.select(0);
            productName = "#[]";
        };
    }else{
console.log("changeSelector")
    //プロダクト名が与えられた場合は、セレクタの選択を更新する
        for(var pix=0;pix<documentDepot.products.length;pix++){
            if(Xps.compareIdentifier(documentDepot.products[pix],productName)>=0){
                document.getElementById('opusSelect').link.select(documentDepot.products[pix]);break;
            };
        };
    };
    productName = String(productName);//明示的にストリング変換する
    var productInfo=Xps.parseProduct(productName);
        var subTitle    = productInfo.subtitle;
        var opus        = productInfo.opus;
        var title       = productInfo.title;
/** パネルテキスト更新
リストに存在しないプロダクトの場合は、リスト側で'(* new product *)'を選択する
*/ 
    document.getElementById("titleInput").value    = (title.length)? title:"(*--title--*)";
    document.getElementById("opusInput").value     = (opus.length)? opus:"(*--opus--*)";
    document.getElementById("subtitleInput").value = (subTitle.length)? subTitle:"(*--subtitle--*)";
//    selectSCi();    

// タイトルからカットのリストを構築して右ペインのリストを更新
//    documentDepot.currentProduct=document.getElementById("opusSelect").options[document.getElementById("opusSelect").selectedIndex].value;
    documentDepot.currentProduct=document.getElementById("opusSelect").value;

    serviceAgent.currentRepository.getEpisodes(function(){
//        documentDepot.documentsUpdate();
//        documentDepot.updateOpusSelector();
// 選択したプロダクトが存在すればカットを取得
console.log(decodeURIComponent(documentDepot.currentProduct));
        var currentOpus = serviceAgent.currentRepository.opus(documentDepot.currentProduct);
        if(currentOpus){
// console.log(currentOpus.token);
            serviceAgent.currentRepository.getSCi(function(){
// 更新したリストからリスト表示を更新
            documentDepot.documentsUpdate();
            documentDepot.updateDocumentSelector();
            },false,currentOpus.token)
        }else{
           console.log("no opus exists ###");console.log(currentOpus);
        }
    },false,
    documentDepot.buildIdentifier(),
    documentDepot.buildIdentifier()
    );
/*
// 選択したプロダクトが存在すればカットを取得
    var currentOpus = serviceAgent.currentRepository.opus(documentDepot.currentProduct);
if(currentOpus){
// console.log(currentOpus.token);
    serviceAgent.currentRepository.getSCi(function(){
// 更新したリストからリスト表示を更新
        documentDepot.documentsUpdate();
        documentDepot.updateDocumentSelector();
    },false,currentOpus.token);
  
}else{
//該当するプロダクトをコンソールへ
console.log(documentDepot.currentProduct);
}  */
//{        documentDepot.updateDocumentSelector();    }
/** パネルテキスト更新
リストに存在しないプロダクトの場合は、リスト側で'(* new product *)'を選択する
*/ 
//    document.getElementById("titleInput").value    = (title.length)? title:"(*--title--*)";
//    document.getElementById("opusInput").value     = (opus.length)? opus:"(*--opus--*)";
//    document.getElementById("subtitleInput").value = (subTitle.length)? subTitle:"(*--subtitle--*)";
    selectSCi();    
}
//setProduct("源氏物語＃二十三帖「初音」");
/**
selectSCi
*/
function selectSCi(sciName){
console.log(sciName);
    if(typeof sciName == "undefined"){
    //カット名が引数で与えられない場合はセレクタの値をとる
    //セレクタ値の場合は、ドキュメントリストの対応するエントリを取得
    //選択されたアイテムがない場合は、デフォルト値を使用してフリー要素を選択する
        if ( document.getElementById("cutList").selectedIndex > 0 ){
            /*  セレクタで選択したカットのissuesをドロップダウンリストで閲覧可能にする
                デフォルト値は最終issue
             */
            var myEntry = serviceAgent.currentRepository.entry(document.getElementById("cutList").value);//options[document.getElementById("cutList").selectedIndex].value);
            if(myEntry){
            var myContents="";
            for (var ix=0;ix<myEntry.issues.length;ix++){
                myContents += '<option value="'+myEntry.issues[ix].join('//')+'"';
                myContents += (ix==(myEntry.issues.length-1))? ' selected >':' >';
                myContents += decodeURIComponent(decodeURIComponent(myEntry.issues[ix].join('//')))+"</option>";
            }
            document.getElementById("issueSelector").innerHTML=myContents;
            if(xUI.uiMode!='management') document.getElementById("issueSelector").disabled=false;

            sciName = myEntry.sci;//.options[document.getElementById("cutList").selectedIndex].text;
            }else{console.log(myEntry)}
        }else{
            document.getElementById("issueSelector").innerHTML='<option value="" selected>#:---line//#:---stage//#:---job//(status)</option>';
            document.getElementById("issueSelector").disabled=true;
            document.getElementById("cutList").link.select(0);//.selectedIndex = 0;
            sciName = "(*--c#--*)";
            var myEntry = null;
        };
    };
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

//  状態更新
//  パネルテキスト更新
    document.getElementById("cutInput").value   = (cutNumber.length)? cutNumber:"(*--c#--*)";
    document.getElementById("timeInput").value  = (cutTime)? nas.Frm2FCT(nas.FCT2Frm(cutTime),3):"6 + 00 .";
//UIボタンの更新
    var myInputText=["titleInput","opusInput","subtitleInput","cutInput","timeInput"];

    if (document.getElementById("cutList").selectedIndex <= 0){}
    if (! myEntry){
//選択されたドキュメントがリスト内に無い　
        document.getElementById("ddp-readout").disabled     = true;
        document.getElementById("ddp-reference").disabled   = true;
        if(xUI.uiMode=='management')
        for ( var tidx = 0 ; tidx < myInputText.length ; tidx ++ ){
            document.getElementById(myInputText[tidx]).disabled = false;
        }
        documentDepot.currentSelection = documentDepot.buildIdentifier();//現在のテキスト入力状態から識別子をビルドする。
    }else{
//リポジトリ内に指定データが存在する
var currentStatus = myEntry.issues[myEntry.issues.length-1][3];
    
        document.getElementById("ddp-readout").disabled     = ((xUI.onSite)&&(serviceAgent.currentStatus=='online-single'))? true:false;//シングルドキュメント拘束時読出抑制
        document.getElementById("ddp-reference").disabled   = false;//参照は無条件読出可能
        for ( var tidx = 0 ; tidx < myInputText.length ; tidx ++ ){
            document.getElementById(myInputText[tidx]).disabled = true;
        }
        documentDepot.currentSelection = document.getElementById("cutList").value;//.options[document.getElementById("cutList").selectedIndex].value;
    }
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


/**
プロダクト名　カット番号ともに編集可能とそうでないケースをグラフィックで表示する機能が必要
選択のみで編集不能な場合、文字をグレーアウトさせるか？
最初からグレーアウトで編集キーを押したときのみ編集可能（＝新規作成）とするか　要調整
*/