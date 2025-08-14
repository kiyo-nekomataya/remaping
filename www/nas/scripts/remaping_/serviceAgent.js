/**
 * 　@author kiyo@nekomataya.info (ねこまたや)
 *  @fileoverview ServiceAgent モジュール

    サービスエージェント
    一旦このモジュールを通すことで異なる種別のリポジトリの操作を統一する
    サービスエージェントは、ログイン管理を行う
    
test data:
    var username = kiyo@nekomataya.info
    var password = 'devTest'
    var client_id = "b115aead773388942473e77c1e014f4d7d38e4d4829ae4fd1fa0e48e1347b4cd";
    var client_secret = "54c0f02c38175436df16a058cc0c0e037038c82d3cc9ce4c212e3e4afe0449dd";

http://remaping.scivone-dev.com/oauth/token?
Object ServiceAgent
    .servers    サーバコレクション
    .repositories リポジトリコレクション
    .currentRepository  現在選択されているリポジトリへの参照


    サーバは複数のリポジトリを持つことができる
    リポジトリは、いずれかのサーバに属しそのサーバへの参照を持つ
    ローカルリポジトリはアプリケーション自身がサーバの代用をする

アプリケーションはリポジトリセレクタでリポジトリを選ぶ

ドキュメントリストにはリポジトリから取得した内容と、実際にオープンした内容の履歴を表示する
履歴は、ローカルリポジトリにするか？
そうする場合は、ローカルリポジトリはセレクタに入れずに表示にマーキングをする
特に現在開いている（又は開いていない）リポジトリのカットとカブっている場合

    リポジトリ分類
以下のような段階的な差を付けてアカウントを取得してもらう＋制作会社に対する有料サービスを販売しやすくしたい

    ローカルリポジトリ
オフライン作業用のリポジトリ
常に使用可能、このリポジトリのデータは対応する作品を管理するサーバと同期可能にする？    
作業中に認証を失ったり、ネットワーク接続が切れた作業はこのリポジトリに保存することが可能
サービスノード（サーバ）としてはダミーの値を持たせる
（作業バックアップ領域とは別 作業バックアップは常時使用可能）
ローカルリポジトリは容量が制限されるので保存できるカット数に制限がある（現在５カット 2016.11.15）
この部分は作業履歴や作業キャッシュとして扱うべきかも
履歴として扱う場合は、「最終5カットのリングバッファ」という風に

    ホームリポジトリ
ログインしたサーバ上でデフォルトで提供されるリポジトリ
ログイン時は常に使用可能
＝チーム

    追加リポジトリ
個人用のリポジトリとは別に設定される共同制作用リポジトリ
ある程度の管理サービスが追加される

    プロダクションリポジトリ（有料サービス）
個人用のリポジトリとは別に設定される業務用リポジトリ
会社単位での作品制作のための管理サービスが追加される

こんな感じか？

同時にアクセス可能なリポジトリの数を制限したほうが良い
あまり多くのリポジトリを開いて一律に表示すると混乱する

とくに、ローカルリポジトリはバックアップの性格が強くなるので、他のリポジトリのタイトルを表示することになる
リポジトリセレクタで選んだ単一のリポジトリのみにアクセスするように設定する



サーバのメニュー上でリポジトリにプロダクト（制作管理単位）を登録すると、そのプロダクトに対してカットの読み書きが可能になる

プロダクト毎にアクセス可能な（リポジトリ共有＝スタッフ）グループにユーザを登録することができる

登録されたユーザはそのリポジトリにスタッフとしてアクセスしてデータを編集又は閲覧することが可能
Repository.ouganization
Repository.pmdb.orgnizations
Repository.pmdb.users           当該リポジトリ内の基礎ユーザDB
Repository.pmdb.staff           同基礎スタッフDB（ここにユーザを含む必要はないツリー下位のDBが優先）
Repository.pmdb.lines           同ラインテンプレート（テンプレート　ツリー下位のDB優先）
Repository.pmdb.stages　        同ステージテンプレート（同上）
Repository.pmdb.jobNames        同ジョブテンプレート　(同上)
Repository.pmdb.assets          アセット定義テーブル
Repository.pmdb.medias          同メディアテンプレート
Repository.pmdb.workTitles      作品タイトルコレクション
Repository.pmdb.products          プロダクトコレクション

Repository.users    アクセスの可能性がある全ユーザのリスト
Repository.productsData.staff    アクセス可否情報　リポジトリに対するユーザとその所属・役職のDB
    　Repository.productsData[px].staff    アクセス可否情報　リポジトリに対するユーザとその所属・役職のDB
    　   Repository.productsData[px].episodes[ex].staff    アクセス可否情報　リポジトリに対するユーザとその所属・役職のDB
    　       Repository.productsData[px].episodes[ex].cuts[cx].staff    アクセス可否情報　リポジトリに対するユーザとその所属・役職のDB
        　
エントリごとにスタッフに対して以下の権利を設定することができる

true    (アクセス可)
false   (アクセス不可)

内部状態として、以下の状態があるがユーザが設定可能なのはtrue/falseの２状態のみとする
    X    リスト
    R    読出
    W    チェックイン

権利に対して　レイヤー構造がある
リポジトリは組織として　プロダクト（workTitle）を含む
プロダクト（workTitle）はエピソード（opus）に分割される
opusは制作話数であり、個々のドキュメント（pmunit）を含む

各ドキュメントはライン/ステージ/ジョブの構造を持つ

このアトリビュート毎・ユーザ毎に 権限が異なるケースがある

                
リポジトリ   *
プロダクト   *
各話         *
カット       *
ライン       *
ステージ     * 
ジョブ       *

    サーバごとに権限グループを設ける基本は作業部毎
制作管理部 
演出部     
撮影部     
美術部     
原画部     
動画部     
仕上部     

等

グループ・ユーザの権限は、エントリ毎に設定可能に
基本はグループに対する権限設定
イレギュラー処理が必要なケースのみユーザごとの権限をエントリの設定に追記する

イレギュラーや変更がなければエントリの権限設定は上位のレイヤから継承するので記載は無くとも良い

グループ権限・作品データ・管理基礎データ等の保存管理

基本的なDBへの登録等は、リポジトリ内に設定データを置いてその読み書きで対処する
RDBMのサポートのないファイル（ストレージ）上でリポジトリを築く際に必要
サービスエージェントを介してのDBへの情報請求をここで解決
これらの権利関連を別紙にまとめる

サービスエージェントはこのまま拡張 pmdb,xMap,Xpstを統合する

*/
/**
    @constractor
    
    サービスノードオブジェクト
    複数あるサーバ（ログイン先）の必要な情報を保持するオブジェクト
    複数のサービス情報をプログラム内に保持しないようにドキュメント内の属性として監理する
    同時に記録する認証は一つ、複数のログイン情報を抱える必要はない
    最期に認証したノード一つで運用 トークンはログイン毎に再取得
*/
ServiceNode=function(serviceName,serviceURL){
    this.name = serviceName ;//識別名称
    this.url  = serviceURL  ;//ベースになるURL localStorageの際は"localStorage:"
    this.type = "scivon"    ;//localStrage/scivon/localfilesystem/dropbox/googleDrive/oneDrive 等のキーワード(外部ストレージは未サポート2017.11)
//    this.uid  = '';//uid ログインユーザID パスワードは控えない 必要時に都度請求
//    this.lastAuthorized = "";//最期に認証したタイミング
//    this.accessToken="";//アクセストークン
//    this.username = kiyo@nekomataya.info
//    this.password = 'devTest'
//  以下の情報は、テスト用に埋め込み あとで分離処置
    this.client_id = "b115aead773388942473e77c1e014f4d7d38e4d4829ae4fd1fa0e48e1347b4cd";
    this.client_secret = "54c0f02c38175436df16a058cc0c0e037038c82d3cc9ce4c212e3e4afe0449dd";
}
/**
    リクエストのヘッダにトークンを載せる
    トークンの期限が切れていた場合は、再度のトークン取得（再ログイン）を促す
    v1向けのコードは考慮しない
*/
ServiceNode.prototype.setHeader=function(xhr){
//  if (this.type=="sivon"){}
    var oauth_token = (xUI.onSite)? 
    $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token');
//console.log("setHeader :: ");
//console.log(oauth_token);
//console.log(xhr);
    var organizationToken = (typeof serviceAgent.currentRepository.token != 'undefined')? serviceAgent.currentRepository.token:'';
    if(oauth_token.length==0) return false;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhr.setRequestHeader('Authorization', ( "Bearer " + oauth_token));    
        xhr.setRequestHeader('OrganizationToken', organizationToken );
    return true;
}
/**
    @undocumented
    データ取得
    参考コード 実際にはコールされない
*/
ServiceNode.prototype.getFromServer=function getFromServer(url, msg){
//V1
    $.ajax({
        url: this.url + url,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
if(dbg) console.log(msg);
if(dbg) console.log(res);
        },
        beforeSend: this.setHeader
    });
//V2    
        $.ajax({
          url: this.url + url,
          type: 'GET',
          dataType: 'json',
          success: function(res) {
if(dbg) console.log(msg);
if(dbg) console.log(res);

            if( url == '/api/v2/organizations.json' ){
              organization_token = res.data.organizations[0]["token"];
              $('#organization_needed').fadeIn("slow");
              $('#organization_name').text(res.data.organizations[0]["name"]);
            }else if ( msg == '作品一覧取得'){
              product_token = res.data.products[0]["token"]
            }else if (msg == 'エピソード一覧取得'){
              episode_token = res.data.episodes[0]["token"]
            }else if (msg == 'カット一覧取得'){
              cut_token = res.data.cuts[0]["token"]
            }


          },
          beforeSend: setHeader
        });
}

/**
    認証手続きはサービスノードのメソッド ノード自身が認証と必要なデータの記録を行う
    パスワードは記録しない
    認証毎にパスワードをユーザに要求する
        myService.authorize()
    パスワードとUIDは、ページ上のフォームから読む
*/
ServiceNode.prototype.authorize=function(callback){
if(dbg) console.log("authorize::execute");
    var noW =new Date();
    var myUserId   = document.getElementById('current_user_id').value;
    var myPassword = document.getElementById('current_user_password').value;
    if ((myUserId.length<1) || (myPassword.length<1)) return false;
    var data = {
        username: myUserId,
        password: myPassword,
        client_id: this.client_id,
        client_secret: this.client_secret,
        grant_type: 'password'
    };
    var oauthURL=serviceAgent.currentServer.url+"/oauth/token.json";//.split('/').slice(0,3).join('/');
if(dbg) console.log(oauthURL);
    $.ajax({
        type: "POST",
        url: oauthURL,
        data: data,
		success : function(result) {
//console.log(serviceAgent.currentServer.name + ": success")
//console.log(result.access_token)
            $('#server-info').attr('oauth_token'  , result.access_token);
            $('#server-info').attr('last_authrized' , new Date().toString());
            serviceAgent.authorized('success');
            serviceAgent.currentServer.getRepositories(callback);
		},
		error : function(result) {
		    /**
		        認証失敗 エラーメッセージ表示　トークンと必要情報をクリアして表示を変更する
		    */
		    alert(localize(nas.uiMsg.dmAlertFailAuthorize));
            $('#server-info').attr('oauth_token'  , '');
            $('#server-info').attr('last_authrized' , '');
            serviceAgent.authorized('false');
		}
	});
}
/**　@undocumented
    errorhandle
*/
ServiceNode.prototype.errorhandle=function(obj){
    console.log(obj);
    return;
}
/**
    リポジトリ（TEAM）一覧を取得してUIを更新する
    
*/
ServiceNode.prototype.getRepositories=function(callback){
// console.log(serviceAgent.currentServer.setHeader);
        var myURL = serviceAgent.currentServer.url + '/api/v2/organizations.json';
//console.log(myURL);
        $.ajax({
          url : myURL,
          type : 'GET',
          dataType : 'json',
          success : function(result) {
//            if(result.res != "200"){this.errorhandle(result);}else{};
// result replace result.data
            serviceAgent.repositories.splice(1); // ローカルリポジトリを残してクリア(要素数１)
console.log(result);
            for( var rix=0 ; rix<result.data.organizations.length ; rix ++){
                serviceAgent.repositories.push(new NetworkRepository(
                    result.data.organizations[rix].name,
                    serviceAgent.currentServer
                ));
                serviceAgent.repositories[serviceAgent.repositories.length - 1].token = result.data.organizations[rix].token;
    if(result.data.organizations[rix].owner_name){;//オーナ情報が全てのサーバにに行き渡るまでは判定して避ける
                serviceAgent.repositories[serviceAgent.repositories.length - 1].owner = new nas.UserInfo(
                    result.data.organizations[rix].owner_name,
                    {'token':result.data.organizations[rix].owner_token}
                );
    }else{
                serviceAgent.repositories[serviceAgent.repositories.length - 1].owner = new nas.UserInfo();
    };//
            };
            var myContents="";
    myContents += '<option selected value=0> = local Repository =</option>' ;
    for(var idr=1; idr < serviceAgent.repositories.length;idr ++){
        myContents +='<option value="'+idr+'" >'+serviceAgent.repositories[idr].name+'</option>'; 
    };
    document.getElementById('repositorySelector').innerHTML = myContents;
    document.getElementById('repositorySelector').disabled  = false;
    if(callback instanceof Function){setTimeout(callback,10)};
          },
          error : function(result){
//console.log("getRepositories::fail");
//console.log(JSON.stringify(result));
          },
          beforeSend: serviceAgent.currentServer.setHeader
        });
}
/*
    履歴構造の実装には、XPSのデータを簡易パースする機能が必要
    プロパティを取得するのみ？
    
    サーバは自身でXPSをパースしない
    
    アプリケーションがパースした情報を識別情報として記録してこれを送り返す
    
(タイトル)[#＃№](番号)[(サブタイトル)]//S##C####(##+##)/S##C####(##+##)/S##C####(##+##)/不定数…//lineID//stageID//jobID//documentStatus
    例:
ももたろう#SP-1[鬼ヶ島の休日]//SC123 ( 3 + 12 .)//0//0//1//Hold
 
タイトル/話数/サブタイトル/カット番号等の文字列は、少なくともリポジトリ内/そのデータ階層でユニークであることが要求される
例えば現存のタイトルと同じと判別されるタイトルが指定された場合は、新規作品ではなく同作品として扱う
似ていても、別のタイトルと判別された場合は別作品として扱われるので注意

＊判定時に

    タイトル内のすべての空白を消去
    半角範囲内の文字列を全角から半角へ変換
    連続した数字はparseInt

等の処置をして人間の感覚に近づける操作を行う（比較関数必要）


ラインID ステージID 及びジョブIDはカット（管理単位）毎の通番 同じIDが必ずしも同種のステージやジョブを示さない。
管理工程の連続性のみが担保される
識別子に管理アイテム識別文字列を加えても良い

第４要素は作業状態を示す文字列

    例:
0//0//0//Stratup
0:本線//1:レイアウト//2:演出検査//Active
 
    ラインID
ラインが初期化される毎に通番で増加 整数
0   本線trunkライン
1   本線から最初に分岐したライン
1-1 ライン１から分岐したライン
2   本線から分岐した２番めのライン

    ステージID
各ラインを結んで全通番になる作業ステージID
0//0
0//1
0//2    1//2
0//3    1//3

    ジョブID
ステージごとに初期化される作業ID
0//0//0
0//0//1
0//0//2
0//1//0
0//1//1

    ステータス
作業状態を表すキーワード
Startup/Active/Hold/Fixed/Aborted (開始/作業/保留/終了/削除) の５態
floating/Finished (浮動/完了) の2態を追加

    エントリの識別子自体にドキュメントの情報を埋め込めばサーバ側のパースの必要がない。
    ファイルシステムや一般的なネットワークストレージ、キー／値型のDBをリポジトリとして使う場合はそのほうが都合が良い
    管理DBの支援は受けられないが、作業の管理情報が独立性を持ち、アプリケーションからの管理が容易

ステータスは　それぞれのキーワードで始まり　サブプロパティを含む

    Startup:{asignment:yuid,message:text}

 //現状
 var myXps= XPS;
    [encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
 //将来は以下で置き換え予定 CSオブジェクト未実装
    myXps.sci.getIdentifier();
 //Xpsオブジェクトのクラスメソッドとして仮実装済み オブジェクトメソッドとして同名の機能の異なる関数があるので要注意
  Xps.getIdentifier(myXps);
  
*/
/**
比較関数 管理情報 3要素の管理情報配列 issuesを比較して先行の管理ノード順位を評価する関数
ライン拡張時は追加処理が必要
*/
issuesSorter =function(val1,val2){
    if(typeof val1 == 'undefined'){ return -1 } 
    if(typeof val2 == 'undefined'){ return  1 } 

    return (parseInt(String(val1[0]).split(':')[0]) * 10000 + parseInt(String(val1[1]).split(':')[0]) * 100 + parseInt(String(val1[2]).split(':')[0])) - ( parseInt(String(val2[0]).split(':')[0]) * 10000 + parseInt(String(val2[1]).split(':')[0]) * 100 + parseInt(String(val2[2]).split(':')[0]));
};

/**
    ソート比較関数
    カット番号（文字列内の最初の整数クラスタ）を整数化して比較
*/
numSorter =function(val1,val2){ return (nas.parseNumber(val1) - nas.parseNumber(val2))};

/**
listEntry オブジェクト
初期化引数:カット識別子[タイトルID,話数ID,カットID]

タイトルID、話数IDは将来的にタイトル話数エントリへのアクセスキーを入力
カットIDは自身のDBエントリへのアクセスキーを設定する
現在は省略可だがDB整備され次第必須

ローカルリポジトリの場合はそれぞれのエントリのキーを省略なしに入力
    ドキュメントリストにエントリされるオブジェクト
    parent  リポジトリへの参照
    product 作品と話数
    sci     カット番号（兼用情報含む）
    issues  管理情報 ４要素一次元配列 [line,stage,job,status]
    実際のデータファイルはissueごとに記録される
    いずれも URIエンコードされた状態で格納されているので画面表示の際は、デコードが必要
    issues には　オリジナル（初期化時）の識別子を保存する
    ネットワークリポジトリに接続する場合は以下のプロパティが設定される
    listEntry.titleID   /string token
    listEntry.episodeID /string token
    listEntry.issues[#].cutID  /string token
    listEntry.issues[#].versionID  /string token
    
    オブジェクトメソッド
    listEntry.toString(Index)   
    listEntry.push(Identifier)
    listEntry.getStatus()
    
listEntry　は　listEntryCollection　に格納される
listEntryCollection はデフォルトで this.parent.entryListとして参照される。
*/
listEntry=function(myIdentifier){
    this.dataInfo = Xps.parseIdentifier(myIdentifier);//dataInfoそのものを拡張すればプロパティが不要となる？
    this.parent;//初期化時にリポジトリへの参照を設定
    this.product = encodeURIComponent(this.dataInfo.product.title)+"#"+encodeURIComponent(this.dataInfo.product.opus);
    this.sci     = encodeURIComponent(this.dataInfo.sci[0].cut);
if(typeof this.dataInfo.line == 'undefined'){
//識別子にバージョン情報が含まれない場合は初期バーションで補填（nullとかのほうが良いかも）
    this.issues  = [[
        new nas.Xps.XpsLine(nas.pmdb.pmTemplate.members[0].line).toString(true),
        new nas.Xps.XpsStage(nas.pmdb.pmTemplate.members[0].stages[0]).toString(true),
        new nas.Xps.XpsStage(nas.pmdb.jobNames.getTemplate(nas.pmdb.pmTemplate.members[0].stages[0],"init")[0]).toString(true),
        "Startup"
    ]];
}else{
    this.issues  = [[
        encodeURIComponent(this.dataInfo.line.toString(true)),
        encodeURIComponent(this.dataInfo.stage.toString(true)),
        encodeURIComponent(this.dataInfo.job.toString(true)),
        this.dataInfo.currentStatus.toString(true)
    ]];
}
    this.issues[0].identifier=myIdentifier;
    this.issues[0].time=nas.FCT2Frm(this.dataInfo.sci[0].time);
if(arguments.length>1) {
        this.titleID             = arguments[1];
        this.episodeID           = arguments[2];
        this.issues[0].cutID     = arguments[3];
        this.issues[0].versionID = null;
    }
}
/**
    エントリは引数が指定されない場合、管理情報を除いたSCI情報分のみを返す
    引数があれば引数分の管理履歴をさかのぼって識別子を戻す
    このメソッド全体がIssues配列の並びが発行順であることを期待している
    リスト取得の際にソートをかけることで解決
    ライン拡張後はソートで解決できなくなるので要注意
    方針としては、各ラインをまたがずに開始点まで遡れるように設定する
*/
listEntry.prototype.toString=function(myIndex){
    if(typeof myIndex == "undefined"){myIndex = -1;}
    if(myIndex < 0){
        return [this.product,this.sci].join("//");
    }else{
        if(myIndex<this.issues.length){
            return this.issues[this.issues.length - 1 - myIndex].identifier;
//            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1 - myIndex].join("//");
            //この部分の手続はラインをまたぐと不正な値を戻すので要修正 11.23
        }else{
            return this.issues[this.issues.length - 1].identifier;
//            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1].join("//");
        }
    }
}
/**
*/
listEntry.prototype.dumpIssues=function(form){
    var myResult="";
    switch(form){
    case 'html':
    break;
    case 'dump':
    default:
        for (var idx=0;idx < this.issues.length ;idx++){
            myResult += decodeURIComponent(this.issues[idx].toString());
            myResult += '\n';
        }
    }
    return myResult;
}
/**
    識別子を引数にして管理情報をサブリストにプッシュする
    管理情報のみが与えられた場合は無条件で追加
    フルサイズの識別子が与えられた場合は SCI部分までが一致しなければ操作失敗
    追加成功時は管理情報部分を配列で返す
    
    
    SCI部分のみでなく ラインとステージが一致しないケースも考慮すること（今回の実装では不用）
    
    ネットワークリポジトリ・DB接続用にIDを増設
*/
listEntry.prototype.push=function(myIdentifier){
    if(Xps.compareIdentifier(this.issues[0].identifier,myIdentifier) < 1){return false;}
    var dataInfo=Xps.parseIdentifier(myIdentifier);
    if(dataInfo.currentStatus){
        var issueArray = [
            encodeURIComponent(dataInfo.line.toString(true)),
            encodeURIComponent(dataInfo.stage.toString(true)),
            encodeURIComponent(dataInfo.job.toString(true)),
            dataInfo.currentStatus.toString(true)
        ];
    }else{
        var issueArray = [];
    }
        issueArray.identifier=myIdentifier;
        issueArray.time=nas.FCT2Frm(dataInfo.sci[0].time);
    if(arguments.length>1) {
//        this.titleID         = arguments[1];
//        this.episodeID       = arguments[2];
        issueArray.cutID     = arguments[3];
        issueArray.versionID = arguments[4];
    }
        for (var iid = 0 ; iid < this.issues.length ; iid ++ ){
            if(this.issues[iid].join('//')==issueArray.join('//')) return false;
        }
        this.issues.push(issueArray);
        this.issues.sort(issuesSorter);
        return this.issues;
}
/**
A=new listEntry("%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97[%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%AB%E3%83%83%E3%83%88]//S-C10(72)//0:trunk//1:layout//1://");
A
*/
/**
    エントリのステータスを取得する
    記録位置は、最終ジョブ
    エントリにステータスを設定する機能は設けない
    と、思ったけどやはり設定機能を作る
    新規の状況更新はすべてリポジトリ本体からの再読出で行う
    リポジトリ本体からの読み出しは冗長にすぎる
    戻り値をオブジェクトに変更　0809
*/
listEntry.prototype.getStatus=function(){
    var currentStatusDescription = this.issues[this.issues.length-1][3];
    if((! currentStatusDescription)&&(this.issues[this.issues.length-1].identifier)){
        var currenEntryInfo = Xps.parseIdentifier(this.issues[this.issues.length-1].identifier);
        return currenEntryInfo.currentStatus;
    }
    return new nas.Xps.JobStatus(currentStatusDescription);
}
/**
    エントリのステータスを設定する
    記録対象は最終ジョブのエントリ
    先のデータによって設定可能データは制限される
    管理権限がある場合はAbortedに変更可能
    いったんAbortedになったエントリは基本的に変更不可
Startup > Active
Active  > Hold/Fixed:assignment:comment
Hold　  > Active
Fixed   > Active/Aborted(要権限)

フロート化・シンクの　>>　サインは状態の遷移ではなくコピーして登録であり。
逆方は、全てのステータスからの複製が可能
移行時にもともとのステータスは保存されない

現状 >> 遷移先 > 遷移後のサーバ上のデータのステータス
Float   >> Startup:assignment:comment/Fixed:assignment:comment　> (元データはサーバ上には無い)
Startup >>Float > 変わらず
Active  >>Float > Hold
Hold    >>Float > 変わらず
Fixed   >>Float > 変わらず

ドキュメントはFloat化する際に必ず複製されて安定化遷移を行う。
リポジトリ上には決してFloat状態のエントリを持たない
エラー等により、Float状態のデータをリポジトリ上に確認した場合は、同ジョブのStartup、またはFixed状態に自動で遷移する?

    戻り値は現在のステータス
    ステータスオブジェクトが多分必要
    あとswitch文でない方がヨサゲ
    必要に従ってissuesを更新または追加する
     　Jobが進まないときは更新
     　Jobが進む際に追加　ただし追加時は　listEntry.push(Idf)で追加なので注意
    まだステータスの副次情報は実装しないので配列のまま保存しないように注意
  ステータスを複合オブジェクト nas.Xps.JobStatusとして実装0809


    issues.identifier/.time の設定が抜けている　2017.0429 早急に要修正！！！！！
    timeは基本的に変更が無いがidentifierは,
    statusの変更に従って必ず変わる
    setStatusの引数がJobStatus  であれば変換は行わない
    
    引数にFloatステータスが入った場合は不正引数とする
    サーバ上のエントリのステータスがFloatになることは無い
*/
listEntry.prototype.setStatus=function(myStatus){
    var currentIssue  = this.issues[this.issues.length-1];
//    var currentStatus = currentIssue[3].split(":");
    var currentStatus = new nas.Xps.JobStatus(currentIssue[3]);//オブジェクト化
    if(myStatus instanceof nas.Xps.JobStatus){
     var newStatus = myStatus;
    }else{
     var newStatus = new nas.Xps.JobStatus(myStatus);//オブジェクト化
    }
    if (newStatus.content.indexOf("Float")>=0){return false;}
    if (currentStatus.content=="Hold"){
        switch (newStatus.content){
            case "Active":
                currentIssue[3] = newStatus.toString(true);
                currentIssue.identifier=currentIssue.identifier.replace(/\/\/Hold.*$/,"//"+currentIssue[3]);
            break;
            case "Hold":
            case "Fixed":
            case "Aborted":
            default:
            return new nas.Xps.JobStatus(currentIssue[3]);
        }
    } else if(currentStatus.content=="Startup"){
        switch (newStatus.content){
            case "Active":
                this.push(currentIssue.slice(0,3).concat(newStatus.toString(true)).join("//"));
                this.issues[this.issues.length-1].identifier=currentIssue.identifier.replace(/\/\/Startup.*$/,"//"+newStatus.toString(true));

                this.issues[this.issues.length-1].time=currentIssue.time;
            break;
            case "Hold":
            case "Fixed":
            case "Aborted":
            default:
            return new nas.Xps.JobStatus(currentIssue[3]);
        }
    } else if(currentStatus.content=="Active"){
        switch (newStatus.content){
            case "Hold":
            case "Fixed":
                currentIssue[3] = newStatus.toString(true);
                currentIssue.identifier=currentIssue.identifier.replace(/\/\/Active.*$/,"//"+currentIssue[3]);
            break;
            case "Active":
            case "Aborted":
            default:
            return new nas.Xps.JobStatus(currentIssue[3]);
        }
    } else if(currentStatus.content=="Aborted"){
        switch (newStatus.content){
            case "Hold":
            case "Fixed":
            case "Active":
            case "Aborted":
            default:
            return currentStatus;
        }
    } else if(currentStatus.content=="Fixed"){
        switch (newStatus.content){
            case "Active":
                currentIssue[3] = newStatus.toString(true);
                currentIssue.identifier=currentIssue.identifier.replace(/\/\/Fixed.*$/,"//"+currentIssue[3]);
            break;
            case "Hold":
            case "Fixed":
            case "Aborted":
            default:
            return new nas.Xps.JobStatus(currentIssue[3]);
        }
    }
if(dbg) console.log(currentIssue[3]);
    return new nas.Xps.JobStatus(currentIssue[3]);
}

/**
    エントリが自分自身を削除する。
    parentが存在しない場合は削除に失敗する
*/
listEntry.prototype.remove=function(){
    if(! this.parent) return false;
    for (var ix=0;ix<this.parent.entryList.length;ix++){
        if(this.parent.entryList[ix].issues[0].cutID == this.issues[0].cutID){
            this.parent.entryList.splice(ix,1);
            return true;
        };
    }
//この下実行されない…はず されたらヤダ
//console.log(this);
//console.log(this.parent.entryList.length);
    return false;
}
/**
    listEntryから識別子を抽出するメソッド
    自己の情報を組み上げて最も正しいと思われる識別子で戻す
*/
listEntry.prototype.getIdentifier=function(issueOffset){
    if(typeof issueOffset == 'undefined') issueOffset =-1;
    var myTitle = this.parent.title (this.titleID);
    var myOpus  = this.parent.opus  (this.episodeID);

    var myResult = [
        encodeURIComponent(myTitle.name),
        '#',encodeURIComponent(myOpus.name),'[',encodeURIComponent(myOpus.description),']//',
        this.dataInfo.cut,'(',this.dataInfo.time,')'
    ].join('');
    if(issueOffset>=0){
        if (issueOffset > (this.issues.length-1)) issueOffset = (this.issues.length-1);
        var targetIssue = this.issues[this.issues.length-1-issueOffset];
        myResult+='//'+targetIssue.join('//');
    }
    return myResult;
}
/**
    エントリリストコレクション
    配列ベースで以下のメソッドを持つ

.put(entry)       ;エントリ追加
.remove(idf)        ;idf指定でエントリ削除
.getByIdf(idf)      ;idf指定でエントリを返す
.getByToken(token)  ;ネットワークのみ
*/
function listEntryCollection (){
/*
    コレクションにエントリを追加する
    同識別子のエントリが存在する場合は上書き（置換）
    存在しなかった場合は新規に追加する
*/
    　this.put=function (myEntry){
        for (var ix = 0 ; ix < this.length ; ix ++){
            if(this[ix].toString().split('//')[0] != myEntry.toString().split('//')[0]) continue;
            if (Xps.compareIdentifier(this[ix].toString(true),myEntry.toString(true)) >= 1 ) {
                this[ix]=myEntry;
                return myEntry;
            }
        }
        return this.push(myEntry);
    }
/*
    識別子指定でコレクションからエントリを削除する
    存在しなかった場合はfalse
*/
    this.remove=function (myIdentifier){
        for (var ix = 0 ; ix < this.length ; ix ++){
            if(String(this[ix]).split('//')[0] != myIdentifier.split('//')[0]) continue;
            if (Xps.compareIdentifier(this[ix].toString(true),myIdentifier) >= 1 ) {
                return this.splice(ix,1);
            }
        }
        return false;
    }
/*
    識別子指定でエントリを取得
    第二引数で一致レベルを指定
    指定がない場合は、カットNo一致
    -2  <NO-match>
    -1  title
    0   opus    (プロダクト一致)
    1   カットNo
    2   ライン
    3   ステージ
    4   ジョブ
    Repository.entry　の基底メソッド
*/
    this.getByIdf=function (myIdentifier,opt){
        if(typeof opt == 'undefined') opt = 1;
        for (var ix = 0 ; ix < this.length ; ix ++){
//　高速化スキップは文字列比較だと取りこぼしが多いので禁止　それよりはcompareIdentifier自体を高速化すること
            if (Xps.compareIdentifier(this[ix].toString(true),myIdentifier) >= opt ) return this[ix];
        }
        return null;
    }
/*
    トークンでエントリを取得
    バージョンの指定は不能
*/
    this.getByToken=function (myToken){
        for (var ix = 0 ; ix < this.length ; ix ++){
            if (this[ix].issues[0].cutID == myToken) return this[ix];
        }
        return null;
    }
};
listEntryCollection.prototype = Array.prototype;
/**
    ローカルリポジトリ
    主に最近の作業データをキャッシュする役目
    カットのデータを履歴付きで保持できる
    複数カットを扱う 制限カット数内のリングバッファ動作
    xUIから見るとサーバの一種として働く
    ローカルストレージを利用して稼働する

保存形式
info.nekomataya.remaping.dataStore
内部にオブジェクト保存
リポジトリのデータ取得メソッド
Repository.title(myIdentifier) 
Repository.opus(myIdentifier)
Repository.cut(myIdentifier)
Repository.entry(myIdentifier)

productsData追加
    プロダクトデータは　DBに直接接続して情報ストアするオブジェクト
    JSONで通信を行う場合に必須
    entryList(listEntryコレクション)はこのデータから生成するように変更される？
    またはentryListからproductsDataを生成する　同時か？
    動作試験のため　maxEntryを増やしてある　10>32 170705
*/
localRepository={
    name:'localStrageStore',
    url:'localStorage:',
    owner:new nas.UserInfo(),
//    owner:xUI.currentUser,
//    currentProduct:"",
//    currentSC:"",
//    currentLine:"",
//    currentStage:"",
//    currentJob:"",
    productsData:[],
    entryList:new listEntryCollection(),
    keyPrefix:"info.nekomataya.remaping.dataStore.",
    maxEntry:32
};
/**
    TITLE取得
引数:
    myIdentifier    識別子またはトークン
    searchDepth     検索深度 0:タイトルのみ　1:エピソードからもタイトルを探す　2:カットからも

    エピソードやカットのトークンからもタイトルノードを返す
    深度指定省略時は 0
    該当するオブジェクトがない場合はnullを戻す
*/
_title=function(myIdentifier,searchDepth){
    if(! searchDepth) searchDepth = 0;
    var myIdf= Xps.parseIdentifier(myIdentifier);
    for ( var idx = 0 ;idx <this.productsData.length;idx ++){
        if(
            (myIdf.title == this.productsData[idx].name)||
            (myIdentifier == this.productsData[idx].token)
        ) return this.productsData[idx];
        if((searchDepth > 0)&&(this.productsData[idx].episodes)){
            for(var epx = 0 ;epx <this.productsData[idx].episodes[0].length;epx++){
                if(
                    (myIdf.opus == this.productsData[idx].episodes[0][epx].name)||
                    (myIdentifier == this.productsData[idx].episodes[0][epx].token)
                ) return this.productsData[idx];
            }
            if(searchDepth >1){
                 for(var ctx = 0 ;ctx <this.productsData[idx].episodes[0][epx].cuts[0].length;ctx++){
                    if(
                        (myIdf.sci[0].cut == this.productsData[idx].episodes[0][epx].cuts[0][ctx].name)||
                        (myIdentifier == this.productsData[idx].episodes[0][epx].cuts[0][ctx].token)
                    ) return this.productsData[idx];
                }
            }
        }
    };
    return null;
}

localRepository.title=_title;
/**
    OPUS取得
引数:
    myIdentifier    識別子またはトークン

    識別子またはトークンからエピソードノードを戻す
    該当するオブジェクトがない場合はnullを戻す
*/
_opus=function(myIdentifier,searchDepth){
console.log([myIdentifier,searchDepth])
    if(! searchDepth) searchDepth = 0;
    var currentOpus = Xps.parseProduct(myIdentifier);
    var isTkn = ((currentOpus.opus =='')&&(currentOpus.title == myIdentifier))? true:false;
//console.log([searchDepth,currentOpus,isTkn])
    for ( var idx = 0 ;idx <this.productsData.length;idx ++){
      if(
        ((! isTkn ) &&
        (String(currentOpus.title).indexOf(this.productsData[idx].name) < 0))||
        (! this.productsData[idx].episodes )
      ) continue;
      for (var eid = 0 ;eid < this.productsData[idx].episodes[0].length; eid ++){
        if (
            (currentOpus.opus == this.productsData[idx].episodes[0][eid].name)||
            (myIdentifier == this.productsData[idx].episodes[0][eid].token)
        ) return this.productsData[idx].episodes[0][eid];
      };
    };
    return null;
}

localRepository.opus=_opus;
/**
    CUT取得
    myIdentifier は識別子またはトークンからカットノードを戻す
*/
_cut=function(myIdentifier){
    var target = Xps.parseIdentifier(myIdentifier);
    var isTkn = ((target.cut =='')&&(target.title == myIdentifier))? true:false;
//console.log([myIdentifier,target,isTkn]);
//console.log(this.productsData)
    for ( var idx = 0 ;idx <this.productsData.length;idx ++){
    if(
        (! this.productsData[idx].episodes )||(
         (! isTkn )&&
         (String(target.title).indexOf(this.productsData[idx].name) < 0)
        )
      ) continue;
//console.log(this.productsData[idx].episodes[0]);
      for (var eid = 0 ;eid < this.productsData[idx].episodes[0].length; eid ++){
        if (
            (! this.productsData[idx].episodes[0][eid].cuts )||(
             (! isTkn ) &&
             (String(target.opus).indexOf(this.productsData[idx].episodes[0][eid].name) < 0)
            )
        ) continue;
//console.log(this.productsData[idx].episodes[0][eid].cuts[0]);
        for (var cid = 0 ; cid < this.productsData[idx].episodes[0][eid].cuts[0].length ; cid ++) {
            if (
                (Xps.compareCutIdf(target.sci[0].cut,this.productsData[idx].episodes[0][eid].cuts[0][cid].name))||
                (myIdentifier == this.productsData[idx].episodes[0][eid].cuts[0][cid].token)
            ) return this.productsData[idx].episodes[0][eid].cuts[0][cid];
        };
      };
    };
    return null;
}

localRepository.cut=_cut;

/**
    プロダクト(タイトル)データを更新
    タイトル一覧をクリアして更新する エピソード更新を呼び出す
    受信したデータを複合させてサービス上のデータ構造を保持する単一のオブジェクトに
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得するように変更
    引き続きの処理を行う際はコールバック渡し
    コールバックがない場合は、全プロダクトの詳細を取得？
    プロダクトデータ取得のみの場合は　空動作のコールバックを渡す必要あり
    myToken 引数がある場合はtokenが一致したエントリのみを処理する
    myToken は配列でも良い
*/
localRepository.getProducts=function(callback,callback2,myToken){
        if(typeof myToken == 'undefined') myToken =[];
        if(!(myToken instanceof Array)) myToken = [myToken];
    try{
        var keyCount=localStorage.length;
        for (var kid=0;kid<keyCount;kid++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
//            if(localStorage.key(kid).match(/\.(xmap|pmdb|stbd)$/i)) continue;
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
//タイトルリストにすでに登録されているか検査 未登録エントリをDBに追加
//token指定がある場合は、登録タイトルを抹消して新しい情報で上書き？
                var currentTitle = this.title(currentIdentifier);
                if(! currentTitle){
// console.log(currentIdentifier);
                if((myToken.indexOf(localStorage.key(kid)) >= 0)||(! myToken.length)){
                    var myData=Xps.parseIdentifier(currentIdentifier);
                    localRepository.productsData.push({
                        token:localStorage.key(kid),
                        name:myData.title,
                        description:"",
                        created_at:null,
                        updated_at:null,
                        episodes:[[]]
                    });
                }};
            };
        };
        if(callback instanceof Function){
            callback();
        }else{
//console.log('get Episodes###')
            for(var ix =0;ix < localRepository.productsData.length; ix ++){
//console.log(this.productsData[ix].token)
                this.getEpisodes(false,false,this.productsData[ix].token);
            }    
        };
    }catch(err){
        if(callback2 instanceof Function){callback2();}
    }
}
/**
    opusデータ更新
引数:成功時コールバック,失敗時コールバック,タイトルキー
myOpusToken 引数がある場合は、引数で制限された処理を行う
*/
localRepository.getEpisodes=function(callback,callback2,myProductToken,myOpusToken){
    var allOpus =false
    if(typeof myOpusToken == 'undefined'){
        myOpusToken = [];
        allOpus     = true;
        var myProduct=this.title(myProductToken);
//console.log(myProduct);
        if(! myProduct){console.log('stop'); return false;}
        for (var px = 0 ;px < myProduct.episodes[0].length;px ++){myOpusToken.push(myProduct.episodes[0][px].token);}
    }
    if(!(myOpusToken instanceof Array)) myOpusToken = [myOpusToken];
//console.log(myOpusToken);
//console.log(documentDepot.currentProduct);
    try{
        var myProduct=localRepository.title(myProductToken);
        var keyCount     = localStorage.length;
        for (var kid = 0;kid < keyCount; kid++){
//console.log(myProduct.name);
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
//            if(localStorage.key(kid).match(/\.(xmap|pmdb|stbd)$/i)) continue;
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var myData = Xps.parseIdentifier(currentIdentifier);
                if(myData.title != myProduct.name) continue;//タイトル違いを排除
//OPUSリストにすでに登録されているか検査 未登録エントリはDBに追加 tokenは初出のkey
                var currentOpus = localRepository.opus(currentIdentifier);
                if(! currentOpus){
                if((! myOpusToken.length)||(myOpusToken.indexOf(localStorage.key(kid)) >= 0)){
                    var Ex = myProduct.episodes[0].push({
                        token:localStorage.key(kid),
                        name:myData.opus,
                        description:myData.subtitle,
                        created_at:null,
                        updated_at:null,
                        cuts:[[]]
                    });
                    currentOpus = myProduct.episodes[0][Ex-1];
                    if(!(callback instanceof Function)){
                        localRepository.getSCi(false,false,currentOpus.token);
                    };
                }};
            };
        };
//エピソード１取得毎に実行したほうが良いかも？
//このままだと必ずタイトル内の全エピソード取得になる
        if(callback instanceof Function){ callback();}   
    } catch(err) {
        if(callback2 instanceof Function){ callback2();}
    }
}
/**
    エピソード毎にカットリストを取得
    エピソード詳細の内部情報にコンバート    
引数
    myOpusToken   ターゲットの話数キー(識別子で与える)
    pgNo      リストのページID　1 origin
    ppg       ページごとのエントリ数
 */
localRepository.getSCi=function (callback,callback2,myOpusToken,pgNo,ppg) {
//現在、pgNo,ppgは意味を持たない引数
    try{
        var myOpus = this.opus(myOpusToken);
        if(! myOpus){console.log('noOpus');return false;}
//console.log('prcessing : '+myOpus.name);
        var keyCount=localStorage.length;
        for (var kid = 0; kid < keyCount; kid ++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
            if(localStorage.key(kid).match(/\.(xmap|pmdb|stbd)$/i)) continue;
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var myData = Xps.parseIdentifier(currentIdentifier);
                if(myOpus.name != myData.opus) continue;
                var myCut = this.cut(currentIdentifier);
                var currentEntry= this.entry(currentIdentifier);
                if(myCut){
                //登録済みカットなのでissues追加
//console.log("push version :" + decodeURIComponent(currentIdentifier));
                    myCut.versions.push({
                        updated_at:null,
                        description:currentIdentifier,
                        version_token:localStorage.key(kid)
                    });
                    if(currentEntry){
        //登録済みプロダクトなのでエントリに管理情報を追加
                        currentEntry.push(currentIdentifier);
                    }else{
                //情報不整合                            
                    }
                }else{
                //未登録カット  新規登録
                //エントリが既に登録済みなので不整合 消去
                    if(currentEntry) currentEntry.remove();
//console.log("add :: "+decodeURIComponent(currentIdentifier));
                    var myCut = myOpus.cuts[0].push({
                        token:localStorage.key(kid),
                        name:myData.cut,
                        description:currentIdentifier,
                        created_at:null,
                        updated_at:null,
                        versions:[{
                            updated_at:null,
                            description:currentIdentifier,
                            version_token:localStorage.key(kid)
                        }]
                    });
                //未登録新規プロダクトなのでエントリ追加
                    //ここにローカルストレージのキーIDを置く　タイトルとエピソードの情報取得キーは現在エントリなし
                    //初出エントリのキーか？　0524
                    var newEntry = new listEntry(currentIdentifier,null,null,localStorage.key(kid));
                    newEntry.parent = this;
                    this.entryList.push(newEntry);
                }
            };
        };
        if(callback instanceof Function){ callback();}   
    } catch(err) {
        if(callback2 instanceof Function){ callback2();}
    }
}
/**
    getListメソッドは、entryList/productsData の更新を行う
    メンバー初期化を行わない
    ローカルストレージ内のデータを走査してリストを更新
    既に存在するエントリは上書き//新規のエントリは追加//存在しないエントリは削除する
    getList関数自体が非同期動作になるように調整
引数:
  force /Bool
  callback  /Function
forceオプションは、引数の統一のために存在する NetworkRepositoryでのみ必要なオプション
localStorageでは意味を持たないダミーオプションとなる
callBack関数が指定された場合　処理終了直前に実行される　存在しない場合は　ドキュメントセレクタの更新が行われる

戻値: なし
    実際のデータ・エントリリストが必要な場合は、localRepository.entryList を参照すること
*/
localRepository.getList=function(force,callback){
//console.log('localRepository getList');
//    if(callback instanceof Function){callback();}else{documentDepot.documentsUpdate(this.entryList);}
    if(!(callback instanceof Function)){documentDepot.documentsUpdate(this.entryList);}
        return;
    var keyCount=localStorage.length;//ローカルストレージのキー数を取得
    this.entryList.length=0;//配列初期化
    for (var kid=0;kid<keyCount;kid++){
        if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
        if(localStorage.key(kid).match(/\.(xmap|pmdb|stbd)$/i)) continue;
            var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
            //エントリリストにすでに登録されているか検査
            var currentEntry = this.entry(currentIdentifier);
            if(currentEntry){
if(dbg) console.log("push issues :" + decodeURIComponent(currentIdentifier));
                //登録済みプロダクトなのでエントリに管理情報を追加
                currentEntry.push(currentIdentifier);
            }else{
if(dbg) console.log("add :: "+decodeURIComponent(currentIdentifier));
                //未登録新規プロダクトなのでエントリ追加
                var newEntry = new listEntry(currentIdentifier);
                newEntry.parent = this;
                this.entryList.push(newEntry);
            }
        }
    }
    //コールバックがない場合はデフォルト動作としてエントリをドキュメントブラウザに送る
    if(callback instanceof Function){
        callback();
    }else{
        documentDepot.documentsUpdate(this.entryList);
    }
//    return this.entryList.length;//no use
}
/**
    ローカルリポジトリにエントリを追加
    引数:Xpsオブジェクト
    与えられたXpsオブジェクトから識別子を自動生成
    識別子にkeyPrefixを追加してこれをキーにしてデータを格納する
    ここでステータスの解決を行う？
    キーが同名の場合は自動で上書きされるのでクリアは行わない
    エントリ数の制限を行う
    エントリ数は、キーの総数でなく識別子の第一、第二要素を結合してエントリとして認識する

    Floating ステータスが新設
    Floating ステータスのドキュメントは書込み不可とする。
    リポジトリメソッドに渡す前にステータスの解決を行い適切なステータスを持たせること。
    このメソッドはステータス変更をサポートしない。
*/
localRepository.pushEntry=function(myXps,callback,callback2){
    var msg='';
    if(String(myXps.cut).match(/^\s*$/)){
        msg += localize({
            en:"you can't save entry without cutNo.",
            ja:"カット番号のないエントリは記録できません。"
        });
    };
    if(myXps.currentStatus.content.indexOf('Floating')>=0){
        msg += '\n'+localize({
            en:"you can't save entry of Flating status.",
            ja:"Floatingエントリは記録できません。"
        });
    }
    if(
        (myXps.update_user.handle == null)||
        (String(myXps.update_user.handle).match(/^\s*$/))
    ){
        msg += '\n'+localize({
            en:"you can't save un-signed entries.",
            ja:"無記名のエントリは記録できません。"
        });
    }
    if(msg.length){
        alert(msg);
        return false;
    };
//クラスメソッドで識別子取得
    var myIdentifier=Xps.getIdentifier(myXps);
//識別子に相当するアイテムがローカルストレージ内に存在するかどうかを比較メソッドで検査
    for (var pid=0;pid<this.entryList.length;pid++){
        if(Xps.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > 3){
            //既存のエントリが有るのでストレージとリストにpushして終了
            try{
                this.entryList[pid].push(myIdentifier);
                localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
                if (xUI.XPS === myXps){
                    xUI.setStored('current');
                    sync();
                }
            }catch(err){
                if(callback2 instanceof Function){callback2();}                
            }
            sync();
            documentDepot.updateDocumentSelector();
            if(callback instanceof Function){callback();}
            return this.entryList[pid];
        };
    };
// console.log(myXps)
console.log("既存エントリなし :追加処理");
//既存エントリが無いので新規エントリを追加
//設定制限値をオーバーしたら、警告する。　OKならばローカルストレージから最も古いエントリを削除して実行
    try{
        if ( this.entryList.length >= this.maxEntry ){
            var msg=localize({en:"over limit!\n this entry will remove [%1]\n ok?",ja:"制限オーバーです!\nこのカットを登録するとかわりに[%1]が消去されます。\nよろしいですか？"},decodeURIComponent(this.entryList[0].toString()));
            if(confirm(msg)){
//console.log("removed Item !");
                for (var iid=0; iid < this.entryList[0].issues.length ; iid++ ){
                    localStorage.removeItem( this.keyPrefix + this.entryList[0].issues[iid].identifier );
                };
                this.entryList[0].remove();//アイテムメソッドで削除
                localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
                this.entryList.put(new listEntry(myIdentifier));//Collectionメソッドで追加
//console.log(this.entryList.length +":entry/max: "+ this.maxEntry)
            }
        }else{
            localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
//            this.entryList.put(new listEntry(myIdentifier)); 
        }
    }catch(err){
//console.log('localRepositoty.pushEntry');
//console.log(err);
        if(callback2 instanceof Function){callback2();}                
    }
    sync();
    documentDepot.updateDocumentSelector();
    if(callback instanceof Function){callback();}
    return this.entryList[this.entryList.length-1];
}

/**
    識別子を引数にしてリスト内を検索
    一致したデータをローカルストレージから取得してXpsオブジェクトで戻す
    識別子に管理情報があればそれをポイントして、なければ最も最新のデータを返す
    コールバック渡し可能
    引数は、Object
    読み出し直後は必ず書き込み禁止のモードとなる
*/
localRepository.getEntry=function(myIdentifier,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
    //識別子をパース
    var targetInfo = Xps.parseIdentifier(myIdentifier);//根底としてここで解釈に問題が発生している

    var myIssue = false;
    var refIssue = false;

    var myEntry = this.entry(myIdentifier);
    if(! myEntry){
if(dbg) console.log("noProduct : "+ decodeURIComponent(myIdentifier));//プロダクトが無い
        return false;
    }
    if(! targetInfo.currentStatus){
   //引数に管理部分がないので、最新のissueとして補う
        var cx = myEntry.issues.length-1;//最新のissue
        myIssue = myEntry.issues[cx];//配列で取得
    } else {
    //指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
        checkIssues:{
            for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
                if ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier) > 4){
                    myIssue = myEntry.issues[cx];
                    break checkIssues;
                }
            }
            if (! myIssue){
console.log( 'no target data :'+ decodeURIComponent(myIdentifier) );//ターゲットのデータが無い
                return false;
            }
        }
    }

    // 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
    // ソースデータ取得
if(dbg) console.log("readIn XPS");
if(dbg) console.log(decodeURIComponent(myIssue.identifier));

    var myXpsSource=localStorage.getItem(this.keyPrefix+myIssue.identifier);
//識別子を再結合してもキーが得られない場合があるのでエントリから対応キーの引き出しを行う

    if(myXpsSource){
        if(callback instanceof Function){
console.log(callback);
console.log('has callback function');
            callback(myXpsSource);
        }else if(isReference){
        //データ単独で現在のセッションのリファレンスを置換
            documentDepot.currentReference = new nas.Xps();
            documentDepot.currentReference.readIN(myXpsSource);
            xUI.resetSheet(undefined,documentDepot.currentReference);
        }else{
console.log('start session');
        //新規セッションを開始する
            documentDepot.currentDocument = new nas.Xps();
            documentDepot.currentDocument.readIN(myXpsSource);
            documentDepot.currentReference = new nas.Xps(5,144);//カラオブジェクトをあらかじめ新規作成
           //自動設定されるリファレンスはあるか？
            //指定管理部分からissueを特定する 文字列化して比較
            if ( cx > 0 ){
                if(parseInt(decodeURIComponent(myIssue[2]).split(':')[0]) > 0 ){　　  
                //ジョブIDが１以上なので 単純に一つ前のissueを選択する
                //必ず先行jobがある  =  通常処理の場合は先行JOBが存在するが、単データをエントリした場合そうでないケースがあるので対処が必要　2016 12 29
                    refIssue = myEntry.issues[cx-1];
                }else if(decodeURIComponent(myIssue[1]).split(':')[0] > 0 ){
                //第2ステージ以降前方に向かって検索
                //最初にステージIDが先行IDになった要素が参照すべき要素
                    for(var xcx = cx-1 ;xcx >= 0 ; xcx --){
                        if (parseInt(decodeURIComponent(myEntry.issues[xcx][1]).split(':')[0]) == (parseInt(decodeURIComponent(myIssue[1]).split(':')[0])-1)){
                            refIssue = myEntry.issues[xcx];
                            break;
                        }
                    }
                };//cx==0 のケースでは、デフォルトで参照すべき先行ジョブは無い
                if(refIssue){
//if(dbg) console.log(this.keyPrefix + refIssue.identifier);
                    myRefSource=localStorage.getItem(this.keyPrefix + refIssue.identifier);//リファレンスソースとる
                    if(myRefSource){
//if(dbg) console.log('myRefSource:');
//if(dbg) console.log(myRefSource);
                        documentDepot.currentReference.readIN(myRefSource);
                    }
                }
            }
// if(dbg) console.log(documentDepot.currentReference);//単エントリで直前のエントリ取得不能の可能性あり
            xUI.resetSheet(documentDepot.currentDocument,documentDepot.currentReference);
            xUI.sessionRetrace = myEntry.issues.length-cx-1;
            xUI.setUImode('browsing');sync("productStatus");
            xUI.flushUndoBuf();sync('undo');sync('redo');
//            if(callback instanceof Function){setTimeout(callback,10)};
            setTimeout(function(){
                if(
                    xUI.currentUser.sameAs(xUI.XPS.update_user)&&
                    (xUI.XPS.currentStatus.content.match(/(Hold|Active)/))&&
                    (xUI.sessionRetrace==0)
                ){
                    serviceAgent.activateEntry();
                };
                sync('historySelector');
            },10);
        };
    }else{
        if(callback2 instanceof Function) callback2();
        return false;
    }
}
/**
    DBにタイトルを作成する。
    confirmなし 呼び出し側で済ませること
    必要あれば編集UI追加
引数
    タイトル（必須）
    備考テキスト
    Pmオブジェクト
    コールバック関数２種
識別子は受け入れない　必要に従って前段で分解のこと
*/
localRepository.addTitle=function (myTitle,myDescription,myPm,callback,callback2){
//現在ローカルリポジトリ側で行う処理は存在しない コールバックの実行のみを行う
//タイトルDBが実装された場合はDBにエントリを加える
console.log(['localRepository.addTitle',myTitle,myDescription,myPm].join(':'));
    if(callback instanceof Function) callback();
    return true;
}
/**
    DBにOPUS(エピソード)を作成する。
引数
    タイトルを含む識別子　カット番号は求めない
    コールバック関数２種
    識別子のみ受け入れ
    このルーチンを呼び出す時点で、タイトルは存在すること
*/
localRepository.addOpus=function (myIdentifier,prodIdentifier,callback,callback2){
//console.log(['localRepository.addOpus',myIdentifier,prodIdentifier].join(':'));
//現在ローカルリポジトリ側で行う処理は存在しない コールバックの実行のみを行う
//タイトルDBに加えて、documetntDepotのプロダクト更新が必要
//タイトルDB側のイベント処理とするか、または追加後にdocumentDepot側でのデータ要求処理に振替
    
　if(callback instanceof Function) callback();
    return true;
}
/**
    識別子を指定してローカルリポジトリから相当エントリを消去する
    リストは再構築
    ローカルリポジトリに関しては、各ユーザは編集権限を持つ
    
    また、ステータス変更のため内部ルーチンがこのメソッドを呼ぶ
    直接要素編集をしても良い？
*/
localRepository.removeEntry=function(myIdentifier){
    var myEntry = this.entry(myIdentifier);
    if(myEntry){
//エントリに関連するアイテムをすべて削除
        for (var iid=0;iid < myEntry.issues.length;iid++){
            localStorage.removeItem(this.keyPrefix+myEntry.issues[iid].identifier);
        };
//エントリ自身を削除
        var res = myEntry.remove();
        if(! res ){console.log('fail removed : ' + res)}
//ドキュメントブラウザ更新
    documentDepot.updateDocumentSelector();
//        documentDepot.rebuildList();//ドキュメントブラウザの再ビルド
        return true;
    };
    return myEntry;    
};
/**
    識別子でエントリリストを検索して該当するリストエントリを返す操作をメソッド可
    issuesは受取先で評価
    NetroekRepositoryにも同メソッドを
    引数　opt を加えると　プロダクトまで一致で最初のエントリを返す
 */
localRepository.entry=function(myIdentifier,opt){
    if(! opt) {opt = 1}else{opt = 0};
    return this.entryList.getByIdf(myIdentifier,opt);
    
    if(! opt) {opt = 0}else{opt = -1};
    for (var pid=0;pid<this.entryList.length;pid++){
        if(Xps.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > opt){
            return this.entryList[pid]
        }
    }
    return null;        
}
/**
    以下、ステータス操作コマンドメソッド
    serviceAgentの同名メソッドから呼び出す下位ファンクション

*/
/**
    現在のドキュメントをアクティベートする
*/
localRepository.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
        var newXps = new nas.Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) { newXps.readIN(currentContents); }else {return false;}
        //ここ判定違うけど保留 あとでフォーマット整備 USERNAME:uid@domain(mailAddress)  型式で暫定的に記述
        //':'が無い場合は、メールアドレスを使用
        if ((newXps)&&(xUI.currentUser.sameAs(newXps.update_user))){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = new nas.Xps.JobStatus('Active');
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
                localStorage.removeItem (this.keyPrefix+currentEntry.toString(0));
                currentEntry.setStatus(newXps.currentStatus);
                var myVersion=currentCut.versions[currentCut.versions.length-1];
                  myVersion.updated_at=new Date().toString();
                  myVersion.description=currentEntry.toString(0);
                  myVersion.version_token=this.keyPrefix+myVersion.description;
                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Active');//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                sync('historySelector');//履歴セレクタ更新
            }else{
//console.log('ステータス変更失敗 :');
                delete newXps ;
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                return false;
            }
            xUI.setUImode('production');
            xUI.sWitchPanel();//パネルクリア
            if(callback instanceof Function){ setTimeout (callback,10);}
            return true;
        }else{
//console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
            if(callback2 instanceof Function) {setTimeout(callback2,10);}
            return false
        }
}
//作業を保留する リポジトリ内のエントリを更新してステータスを変更 
localRepository.deactivateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
            //Active > Holdへ
        var newXps = new nas.Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = new nas.Xps.JobStatus('Hold');//（ジョブID等）status以外の変更はない
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
if(dbg) console.log('deactivated');
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                currentEntry.setStatus(newXps.currentStatus);
                var myVersion=currentCut.versions[currentCut.versions.length-1];
                  myVersion.updated_at=new Date().toString();
                  myVersion.description=currentEntry.toString(0);
                  myVersion.version_token=this.keyPrefix+myVersion.description;
                documentDepot.rebuildList();
                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Hold');//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                sync('historySelector');//履歴セレクタの更新
            }else{
            //保存に失敗
//console.log('保留失敗')
                delete newXps ;
			    if(callback2 instanceof Function) setTimeout(callback2,10);
                return false;
            }
            //データをホールドしたので、リストを更新 編集対象をクリアしてUIを初期化
            xUI.setUImode('browsing');
            xUI.sWitchPanel();//パネルクリア
			if(callback instanceof Function) setTimeout(callback,10);
        }else{
//console.log('保留可能エントリが無い :'+ Xps.getIdentifier(newXps));
			if(callback2 instanceof Function) setTimeout(callback2,10);
            return false ;
        }
}
/** 
    作業にチェックイン
    リポジトリ種別にかかわらないので
    このメソッドを呼ぶ前段でジョブ名称は確定しておくこと
    ジョブ名指定のない場合は操作失敗    
*/
localRepository.checkinEntry=function(myJob,callback,callback2){
    if( typeof myJob == 'undefined') return false;
    myJob = (myJob)? myJob:xUI.currentUser.handle;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 読み出したデータでXpsを初期化 
        var newXps = new nas.Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(dbg) console.log('読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.job.increment(myJob);
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = new nas.Xps.JobStatus('Active');
             //引数でステータスを変更したエントリを作成 新規に保存 JobIDは必ず繰り上る
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
                currentEntry.push(Xps.getIdentifier(newXps));
                currentCut.versions.push({
                    updated_at:new Date().toString(),
                    description:currentEntry.toString(0),
                    version_token:this.keyPrefix+currentEntry.toString(0)
                });
                xUI.setReferenceXPS();
                xUI.XPS.job.increment(myJob);
                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Active');//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.setUImode('production');//モードをproductionへ
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(dbg) console.log(result);
            }
        }
//console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    作業終了
*/
localRepository.checkoutEntry=function(assignData,callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(! currentEntry) {
//console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
            //Active > Fixed
        var newXps = new nas.Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用 JobID変わらず
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
//            newXps.currentStatus = ['Fixed',assignData].join(":");
            newXps.currentStatus = new nas.Xps.JobStatus('Fixed');
            newXps.currentStatus.assign = assignData;
            //いったん元に戻す　assignData は宙に保留（ここで消失）
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());

            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps))==newXps.toString())? true:false;
            if(result){
//console.log(result);
//console.log(currentCut)
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
                currentEntry.setStatus(newXps.currentStatus);
                var myVersion=currentCut.versions[currentCut.versions.length-1];
                  myVersion.updated_at=new Date().toString();
                  myVersion.description=currentEntry.toString(0);
                  myVersion.version_token=this.keyPrefix+myVersion.description;
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.setUImode('browsing');//モードをbrousingへ
                sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){
console.log(12345)
                     setTimeout(callback,10)
                };
                return result;
            }else{
//console.log("fail checkout store")
            }
        }
//console.log('終了更新失敗');
        delete newXps ;
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    検収処理receiptEntry/receiptEntry
*/
localRepository.receiptEntry=function(stageName,jobName,callback,callback2){
    if( typeof stageName == 'undefined') return false;
    var myStage = nas.pmdb.stages.getStage(stageName) ;//ステージDBと照合　エントリが無い場合はエントリ登録
    /*  2016-12 の実装では省略して　エラー終了
        2017-07 最小限の処理を実装　ステージの存在を確認して続行
    */
    if(! myStage) return false;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
    var currentCut   = this.cut(currentEntry.toString());//= this.cut(currentEntry.issues[0].cutID);
    if(! currentCut) return false;
//次のステージを立ち上げるため 読み出したデータでXpsを初期化 
        var newXps = new nas.Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(dbg) console.log('読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.stage.increment(stageName);
            newXps.job.reset(jobName);
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = new nas.Xps.JobStatus('Startup');
if(dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
if(dbg) console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
if(dbg) console.log('receipt');
                //delete newXps ;
if(dbg) console.log(newXps.currentStatus);
//                this.getList();//リストステータスを同期
                currentEntry.push(Xps.getIdentifier(newXps));
                currentCut.versions.push({
                    updated_at:newXps.update_time,
                    description:currentEntry.toString(0),
                    version_token:this.keyPrefix+currentEntry.toString(0)
                });
                xUI.XPS.stage.increment(stageName);
                xUI.XPS.job.reset(jobName);
                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Startup');//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
//                xUI.setUImode('browsing');//モードをbrowsingへ　　＜＜領収処理の後はモード遷移なし
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(dbg) console.log(result);
            }
        }
if(dbg) console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    作業中断処理
*/
localRepository.abortEntry=function(myIdentifier,callback,callback2){
    var currentEntry = this.entry(myIdentifier);
    if(! currentEntry) return false;
    var currentStatus=currentEntry.getStatus();

    if(String(currentStatus.content).indexOf('Fixed')<0){return false;}
    var currentCut   = this.cut(currentEntry.toString());
    if(! currentCut) return false;
    
//中断エントリを作成するために、読み出したデータで新規Xpsを初期化 
        var newXps = new nas.Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.parseXps(currentContents);
        } else {
//console.log('abort entry:読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.job.increment('Abort');
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = new nas.Xps.JobStatus('Aborted');
//console.log('abort entry:');
//console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは変わらず、jobIDは繰り上る
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
//console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
//console.log('aborted');
//console.log(newXps.currentStatus);
                this.getList();//リストステータスを同期
//                currentEntry.push(Xps.getIdentifier(newXps));
                currentEntry.remove(Xps.getIdentifier(newXps));
                currentCut.versions.push({
                    updated_at:newXps.update_time,
                    description:currentEntry.toString(0),
                    version_token:this.keyPrefix+currentEntry.toString(0)
                });
//                xUI.XPS.stage.increment(stageName);
//                xUI.XPS.job.reset(jobName);
//                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Startup');//ドキュメントステータスを更新
//                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
//                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.setUImode('floating');//モードをfloatingへ　　＜＜領収処理の後はモード遷移なし
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(dbg) console.log(result);
            }
        }
if(dbg) console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    リポジトリの情報をダイアログで表示

*/
localRepository.showInformation=function (){
    var ownerString = (xUI.currentUser)? xUI.currentUser.toString(): nas.localize({en:"(Could not acquire.)",ja:"(取得できません)"});
    var title = nas.localize(nas.uiMsg.aboutOf,this.name);
    var msg = "";
    msg += nas.localize(nas.uiMsg.serviceNode) +" : "+ "localRepository<br>";
    msg += nas.localize(nas.uiMsg.repositoryName) +" : " + this.name +"<br>";
    msg += nas.localize(nas.uiMsg.repositoryOwner) + " : " + ownerString + "<br>";
    msg += nas.localize({
en:"<hr>** This is the area where temporary files are stored using local storage of the browser.　Data can not be shared between users in this repository.<br>",
ja:"<hr>** ブラウザのローカルストレージを使用した、一時ファイルを保存する領域です。<br>ユーザ間のデータ共有はできません。<br>"
});
    nas.showModalDialog("alert",msg,title);
}
/*  test data 
    localRepository.currentProduct = "ももたろう#12[キジ参戦！ももたろう地獄模様！！]";
    localRepository.currentSC      = "S-C005 (12+00)/011(3+00)/014(3+00)";
    localRepository.currentLine    = 0;
    localRepository.currentStage   = 0;
    localRepository.currentJob     = 0;

JSON.stringify(localRepository);

localRepository.pushStore(XPS);
localRepository.getList();
//localRepository.entryList[0];
localRepository.getEntry(localRepository.entryList[0]);

localRepository.showInformation();
*/
/**
    最終作業の破棄
    バックアップ作業これを呼び出す側で処理
    ここを直接コールした場合はバックアップは実行されない
    ユーザメッセージはここでは処理されない
    
*/
localRepository.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus.content != 'Active'){return false}
//   カレントの作業に対応するストレージ上のキーを消去
//   成功すれば
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    try {
        localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
		currentEntry.issues.pop();
//        xUI.resetSheet(new nas.Xps(5,144),new nas.Xps(5,144));
        xUI.resetSheet();
        if(callback instanceof Function) callback();
    }catch(er){
//console.log(er) 
        if(callback2 instanceof Function) callback2();
    }
}

/**
    ネットワーク上のリポジトリオブジェクト
    識別名とサーバを与えて初期化する
        リポジトリとしての共通メソッド
    .getList()
    .title(myIdentifier)
    .opus(myIdentifier)
    .cut(myIdentifier)
    .entry(myIdentifier)

    .push(myXps)
        
リポジトリに 相当する構造は Team
チームごとにリポジトリが設定される
Teamへアクセスするためのトークンは、アクセス毎に設定される
リポジトリは、複数の同一名称のリポジトリが想定されるため、補助的にオーナー情報を保持する仕様を追加
特に同作品の複製を見分けるために必須　APIに追加
*/
//NetworkRepository=function(repositoryName,repositoryOwner,myServer,repositoryURI){}
NetworkRepository=function(repositoryName,myServer,repositoryURI){
    this.name = repositoryName;
//    this.owner = new nas.UserInfo(repositoryOwner);//リポジトリオーナー情報
    this.service = myServer;//リポジトリの所属するサーバ
    this.url=(typeof repositoryURI == 'undefined')?this.service.url:repositoryURI;//サーバとurlが異なる場合は上書き
    this.token=null;//nullで初期化
//サーバ内にTeamが実装 Teamをリポジトリとして扱うのでその切り分けを作成 12/13
//リストは素早いリポジトリの切り替えやリポジトリ同士のマージ処理に不可欠なのでここで保持
//    this.currentProduct;
//    this.currentSC;
//    this.currentLine;
//    this.currentStage;
//    this.currentJob;
//    this.product_token      = $('#server-info').attr('product_token');
//    this.episode_token      = $('#server-info').attr('episode_token');
//    this.cut_token          = $('#server-info').attr('cut_token');
// ?idの代替なので要らないか？ 
    this.pmdb={};//制作管理データキャリア　機能クラスオブジェクト化？
    this.currentIssue;
    this.productsData=[];//workTitleCollectionで置換？タイトルキャリアでノードルートになる
    this.entryList = new listEntryCollection();
}
/**
    リポジトリ情報表示メソッド
    引数:なし
    リポジトリのオーナー情報を表示してリポジトリ（共有・チーム）へのアクセスリンクを提供する
    リポジトリへのリンクはリポジトリ名を使用
    
*/
NetworkRepository.prototype.showInformation = function(){
    var ownerString = (this.owner.handle)? this.owner.handle: nas.localize({en:"(Could not acquire.)",ja:"(取得できません)"});
    var title = nas.localize(nas.uiMsg.aboutOf,this.name);
    var msg = "";
    msg += nas.localize(nas.uiMsg.serviceNode) +" : <a href='" +this.service.url+"' target='_blank'>"+ this.service.name + "("+this.service.url +")</a><br>";
    msg += nas.localize(nas.uiMsg.repositoryName) +" : " + this.name +"<br>";
    msg += nas.localize(nas.uiMsg.repositoryOwner) + " : " + ownerString + "<br>";
//    msg += "    アクセス先 : " + this.owner.token + "<br>";
    nas.showModalDialog("alert",msg,title);
}
/**
各層のエントリを識別子で取得
    TITLE取得
*/
NetworkRepository.prototype.title=_title;
/**
    OPUS取得
*/
NetworkRepository.prototype.opus=_opus;
/**
    CUT取得
*/
NetworkRepository.prototype.cut=_cut;
/**
    タイトル一覧を取得して情報を更新する エピソード更新を呼び出す
    受信したデータを複合させてサービス上のデータ構造を保持する単一のthis.productsDataオブジェクトにする
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得できるように変更
    引き続きの処理を行う際はコールバック渡し
    トークン指定がない場合は、全プロダクトの詳細を取得
    プロダクトデータ取得のみの場合は　空動作のコールバックを渡す必要あり
*/
NetworkRepository.prototype.getProducts=function (callback,callback2,prdToken){
    if(typeof prdToken == 'undefined') prdToken = [];
    if(!(prdToken instanceof Array)) prdToken=[prdToken];
    $.ajax({
        url: serviceAgent.currentRepository.url+'/api/v2/products.json',
        type: 'GET',
        dataType: 'json',
        success: function(result) {
console.log(result);
            //resultにデータが無いケース{}があるので分離が必要
            //権限等で
            //この時点でタイトルに付属のメンバーシップを同時に取得してオブジェクトに設定する（プロパティオブジェクト未実装20171116）
		    serviceAgent.currentRepository.productsData = result.data.products;
		    if(prdToken.length){
		    //引数があれば引数のプロダクトを順次処理
		        for (var tId = 0 ; tId < prdToken.length ; tId ++ ){
		            serviceAgent.currentRepository.productsUpdate(callback,callback2,prdToken[tId]);
		        }
		    }else{
		    //引数がない場合はすべてのプロダクトの詳細を取得更新
		        for (var tId = 0 ; tId < serviceAgent.currentRepository.productsData.length ; tId ++ ){
		            serviceAgent.currentRepository.productsUpdate(callback,callback2,serviceAgent.currentRepository.productsData[tId].token);
		        }
		    }
        },
        error : function(result){
            if(dbg) console.log('fail productsData::');
            if(dbg) console.log(result);
		    if(callback2 instanceof Function){callback2()}
        },
        beforeSend: serviceAgent.currentRepository.service.setHeader
    });
}
/**
    タイトルごとの詳細（エピソードリスト含む）を取得してタイトルに関連付ける
    myToken 引数がない場合はすべてのプロダクトを更新
    必要に従ってエピソードリストの更新を行う
    コールバック引数がない場合はタイトルのエピソード毎に情報を取得
*/
NetworkRepository.prototype.productsUpdate=function(callback,callback2,myToken){
    if(typeof myToken == 'undefined'){
            myToken = [];
        for(var tknId = 0 ;tknId < serviceAgent.currentRepository.productsData.length ;tknId ++){
            myToken.push(serviceAgent.currentRepository.productsData[tknId].token);
        }
    }else{
        if(!(myToken instanceof Array)) myToken=[myToken];
    }
    for(var ix = 0 ;ix < myToken.length ;ix ++){
    $.ajax({
        url: serviceAgent.currentRepository.url+'/api/v2/products/'+myToken[ix]+'.json' ,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
console.log(result);
            var productUpdated = false;
            for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
		        if(result.data.product.token != serviceAgent.currentRepository.productsData[idx].token) continue;
                //プロダクトデータを詳細データに「入替」エピソードの概要を取得する
console.log("update product data detail:"+serviceAgent.currentRepository.productsData[idx].name) ;
//console.log(serviceAgent.currentRepository.productsData);
		                serviceAgent.currentRepository.productsData[idx] = result.data.product ;
		                if(! (serviceAgent.currentRepository.productsData[idx].episodes)){serviceAgent.currentRepository.productsData[idx].episodes=[[]];};//episodes/cutsの配列整理が終了したら変更
		                serviceAgent.currentRepository.productsData[idx].episodes[0] = result.data.episodes ;
		                productUpdated=true;
		                break;
		    };
//console.log("updated : "+serviceAgent.currentRepository.productsData[idx].name);
		    if(productUpdated) {
		            serviceAgent.currentRepository.updateEpisodes(callback,callback2,serviceAgent.currentRepository.productsData[idx].token);
		    }else{
//console.log('fail productsData update no entry in Repository::');
//console.log(result);
		        //指定されたトークンが ,リポジトリ内に存在しないのでエラー
		        if(callback2 instanceof Function){callback2();}
		    };
        },
        error : function(result){
//console.log('fail productsData update::');
//console.log(result);
		    if(callback2 instanceof Function){callback2();}
        },
        beforeSend: (serviceAgent.currentRepository.service.setHeader)
    });
    }
}
/**
    プロダクトごとにエピソード一覧を再取得してデータ内のエピソード一覧を更新
    引数 product_tokenが存在する場合は、指定のプロダクト以外の処理をスキップ
*/
NetworkRepository.prototype.updateEpisodes=function (callback,callback2,prdToken) {
//       var myProduct = serviceAgent.currentRepository.getNodeElementByToken(prdToken);
       var myProduct = serviceAgent.currentRepository.title(prdToken);
        if(! myProduct) return false;
//console.log("getEpisodeList : "+myProduct.token+' : '+myProduct.name) ;
    $.ajax({
        url: serviceAgent.currentRepository.url+'/api/v2/episodes.json?product_token='+myProduct.token ,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
console.log(result);
                //プロダクトデータのエピソード一覧を「入替」
		    if(result){
		        if(! myProduct.episodes) {myProduct.episodes=[[]];}
		        //後ほどエピソードレベルのユーザ情報取得
		        myProduct.episodes[0] = result.data.episodes;
//console.log('success getting episodes :'+myProduct.name);
//console.log(myProduct);
                if(callback instanceof Function){
		            callback();
		        }else{
		            serviceAgent.currentRepository.getEpisodes(callback,callback2,myProduct.token);
//                    for(var eid=0;eid<myProduct.episodes[0].length;eid++){
//		                serviceAgent.currentRepository.getEpisodes(callback,callback2,myProduct.token,myProduct.episodes[0][eid].token);
//		            }
		        }
		    }else{
//console.log('fail get no episodes::');
//console.log(result);
		        if(callback2 instanceof Function){callback2();}		        
		    }
        },
        error : function(result){
//console.log('fail getting Episodes::');
//console.log(result);
		    if(callback2 instanceof Function){callback2();}
        },
        beforeSend: serviceAgent.currentRepository.service.setHeader
    });
}
/**
    episode_token を指定して詳細を取得 内部リストにコンバート
    コールバックリンクのためこのあたりの機能は統合かける
リポジトリ取得 server.getRepositories()
    サーバ指定＝引数なしでサーバの管理するリポジトリの情報を取得

プロダクト取得 repositoriy.getProducts(識別子)

下位ファンクションを組み合わせてプロダクトレベルの情報取得を行う
識別子でコントロール
識別子を引数にするとその配下を取得

    タイトル取得  repositoriy.getTitle(myTitel,callback,callback2)
        リポジトリ指定＝引数なし　で全タイトル
        タイトル指定で特定タイトルの情報を更新
        引数が配列の場合は配列内のタイトルを更新
        下位情報には踏み込まないコールバックリレーは行わない

    エピソード取得 repository.getOpus(myTitle,myOpus,callback,callback2)
        タイトル指定で、そのタイトル配下のエピソード
        OPUS指定があれば、そのOPUSのみを更新
    カット取得       repository.getSCi(myOpus,pgNo,ppg,callback,callback2)
        プロダクト指定,エピソード指定,ページ数,単位
    エピソードの指定が存在する場合は、指定エピソードの処理を行う　配列OK
    それ以外は指定プロダクトのすべてを更新
 */
NetworkRepository.prototype.getEpisodes=function (callback,callback2,prdToken,epToken) {
console.log(prdToken);
console.log(epToken);
    var allEpisodes=false;
    if(typeof epToken == 'undefined'){
        epToken     = [];
        allEpisodes = true;
        var myProduct=this.title(prdToken);
console.log(myProduct)
        if((! myProduct)||(! myProduct.episodes)||(myProduct.episodes[0].length == 0)){console.log('stop'); return false;}
        for (var px = 0 ;px < myProduct.episodes[0].length;px ++){epToken.push(myProduct.episodes[0][px].token);}
    };
    if(!(epToken instanceof Array)) epToken = [epToken];
console.log(epToken);
    for(var ex = 0;ex < epToken.length ;ex ++){
        var myEpisode=this.opus(epToken[ex]);
console.log(myEpisode);
        if(! myEpisode) continue;
        if((allEpisodes)&&(myEpisode.cuts)){console.log('skip'+myEpisode.name) ;continue;}
        //対象が全エピソードで、エピソードがすでにカット情報を持っているケースでは処理スキップ
console.log("get episodes details for : "+myEpisode.name) ;
console.log("Token : "+myEpisode.token) ;
	            // /api/v2
                var targetURL = serviceAgent.currentRepository.url+ '/api/v2/episodes/'+myEpisode.token +'.json';
	    $.ajax({
            url: targetURL,
            type: 'GET',
            dataType: 'json',
            success: function(result) {
console.log('success : episode details for:'+result.data.episode.name);//リザルト不正　調整中20190129
console.log(result);
        var updateTarget = serviceAgent.currentRepository.opus(result.data.episode.token);
        if(! updateTarget){console.log('erroe###');console.log(updateTarget);};
//非同期処理中に変数を共有するのでmyEpisodeが変動するためターゲットをリザルトから再キャプチャ
//オブジェクト入れ替えでなくデータの追加アップデートに変更
//内容は等価だがAPIの変更時は注意
//この時点でカットの総数が取得されるのでカット一覧詳細取得時総数を参照して分割取得
//console.log('update target episode###');console.log(updateTarget);
                if(!(updateTarget.cuts)){updateTarget.cuts=[[]];}
                updateTarget.cuts[0] = result.data.cuts;
                updateTarget.created_at = result.data.episode.created_at;
                updateTarget.updated_at = result.data.episode.updated_at;
//console.log(updateTarget);
                if(callback instanceof Function){
                    callback();
                }else{
                    //標準処理
                    serviceAgent.currentRepository.getSCi(false,false,myEpisode.token);
                }
            },
            error : function(result){
//console.log('fail getting episode details::');
//console.log(result);
		        if(callback2 instanceof Function){callback2();}
            },
            beforeSend: serviceAgent.currentRepository.service.setHeader
        });
    }
};
/**
    エピソード毎にカットリストを再取得
    エピソード詳細の内部情報にコンバート
    カット一覧にdescriptionを出してもらう
    取得時にentryListを同時更新する
引数
    epToken   ターゲットの話数キーまたは、カットトークン
    pgNo      リストのページID　1 origin
    ppg       ページごとのエントリ数

    epToken のかわりにカットトークンが与えられた場合は、カット1つのみのリスト作成して高速に処理を完了する。
    
 */
NetworkRepository.prototype.getSCi=function (callback,callback2,epToken,pgNo,ppg) {
    var myEpisode = this.opus(epToken);
console.log('getSCi :');console.log(myEpisode);
    if((! myEpisode)||(! myEpisode.cuts)) return false;
/*
    if(! myEpisode){
         if(myEpisode == null) {
            var targetURL='/api/v2/cuts/'+epToken+'.json';// epToken ascutToken
            $.ajax({
                url: this.url + targetURL,
                type: 'GET',
                dataType: 'json',
                success: function(result) {
                    console.log(result);
                },
                beforeSend: this.service.setHeader
            })
         }else{
            return false;
         }
            return true;
    }
*/
    if(typeof pgNo == 'undefined') pgNo = '1';
    if(typeof ppg  == 'undefined')  ppg = (myEpisode.cuts[0])? myEpisode.cuts[0].length:100;
//console.log(arguments);
//console.log([pgNo,ppg]);
    var targetURL = serviceAgent.currentRepository.url+ '/api/v2/cuts.json?episode_token='+myEpisode.token+'&page_no='+parseInt(pgNo)+'&per_page='+parseInt(ppg);
	            $.ajax({
                    url: targetURL,
                    type: 'GET',
                    dataType: 'json',
                    success: function(result){
//console.log(result);console.log(myEpisode);
                                      myEpisode.cuts[0]=result.data.cuts;
//カット登録数1以上の場合のみ処理
if(myEpisode.cuts[0].length){
if (! myEpisode.cuts[0][0].description) console.log(myEpisode.token)
                                        var currentTitle = (! myEpisode.cuts[0].description)?
                                            serviceAgent.currentRepository.title(myEpisode.token,1):
                                            serviceAgent.currentRepository.title(myEpisode.cuts[0].description);
if(! currentTitle){console.log(currentTitle)}
/**
エントリ取得タイミングで仮にcutのdescription を追加するcuts[1][cid].description を作成して調整に使用する
本番ではデータ比較ありで、入替えを行う　サーバ側のプロパティ優先
*/
    var myIdentifier_opus =
        encodeURIComponent(currentTitle.name) +
        '#'+encodeURIComponent(myEpisode.name) +
        ((myEpisode.description)?
            '['+encodeURIComponent(myEpisode.description) +']':''
        );
    if(! myEpisode.cuts){console.log(myEpisode.cuts);}
    for ( var cid = 0 ; cid < result.data.cuts.length ; cid ++){
        var myCut = myEpisode.cuts[0][cid];
        if(myCut.name == null) myCut.name = "";//この状態は実際にはエラー
        var myIdentifier_cut = encodeURIComponent(myCut.name);
// デスクリプションに識別子がない場合issuen部の無い識別子を補う
// 他はDB側の識別子を優先して識別子を更新する
        if(! myCut.description){
            myCut.description=[myIdentifier_opus,myIdentifier_cut].join('//');
        } else {
            var currentIssue = myCut.description.split("//").slice(2);
            myCut.description=([myIdentifier_opus,myIdentifier_cut].concat(currentIssue)).join('//');
        }
//============エントリ更新　
/*
    管理情報は識別子から取得する
APIの情報は、識別子と一致しているはずだが　照合の上異なる場合はAPIの情報で上書きを行う
識別子として　cut.description を使用　上位情報は、エントリから再作成
サブタイトルは　episode.discriptionを使用
兼用カット情報はペンディング
*/
//console.log(myCut)
                var myCutToken = myCut.token;
                var myCutLine  = (myCut.line_id)?
                    myCut.line_id:
                    (new nas.Xps.XpsLine(nas.pmdb.pmTemplates.members[0].line.toString())).toString(true);
                var myCutStage = (myCut.stage_id)?
                    myCut.stage_id:
                    (new nas.Xps.XpsStage(nas.pmdb.pmTemplates.members[0].stages.getStage())).toString(true);
                var myCutJob   = (myCut.job_id)?
                    myCut.job_id:
                    (new nas.Xps.XpsStage(nas.pmdb.jobNames.members[0].toString())).toString(true);
                var myCutStatus= (myCut.status)?
                    myCut.status:new nas.Xps.JobStatus('Startup');
// myCut.status new nas.Xps.JobStatus('Startup');
//管理情報が不足の場合は初期値で補う description情報が未登録の場合は、APIの情報からビルドする？

                var entryArray = (
                    String(myCut.description).split('//').concat([
                        encodeURIComponent(myCutLine),
                        encodeURIComponent(myCutStage),
                        encodeURIComponent(myCutJob),
                        myCutStatus
                    ])
                ).slice(0,6);//
                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
                var currentEntry=serviceAgent.currentRepository.entry(myCut.description);//既登録エントリを確認
                if(currentEntry) {console.log(decodeURIComponent(myCut.description));console.log(currentEntry);console.log(currentEntry.remove());console.log('current entry removed')}
                    //登録されていた場合はあらかじめ削除しておく
                var newEntry = new listEntry(entryArray.join('//'),currentTitle.token,myEpisode.token,myCutToken);
                newEntry.parent = serviceAgent.currentRepository;
                serviceAgent.currentRepository.entryList.push(newEntry);
                // エントリ配下にversionsがあればそのままpush
                if(! myCut.versions) myCut.versions=[];
                for (var vid = 0;vid<myCut.versions.length;vid++){
                    var myVersionString=(myCut.versions[vid].description)?
                    myCut.versions[vid].description:entryArray.join("//");
                    var myVersionToken = myCut.versions[vid].version_token;
                    newEntry.push(myVersionString,currentTitle.token,myEpisode.token,myCut.token,myVersionToken);
                }
//============エントリ更新
    }
}
                        if(callback instanceof Function){
                            callback();
                        }else{
                            documentDepot.documentsUpdate();
                        }
                    },
                    error : function(result){
if(dbg) console.log('getSCi ::');
if(dbg) console.log(result);
		                if(callback2 instanceof Function){callback2();}
                    },
                    beforeSend: serviceAgent.currentRepository.service.setHeader
                });
};

/**
リポジトリ内のentryListを更新する
documentsDataの更新が必要なケースでは、force スイッチを置く
force スイッチが与えられるかまたはプロダクトリストに値がない場合はプロダクトの取得から処理が開始され
現在のリストはクリアされずに（バッファリストを作って比較）更新が行われる

このメソッド自体　サービス内のエントリを取得してentryListを更新するのが目的なので
一括取得をやめるまたはこのメソッドの再帰的な呼び出しをやめるかいずれかの処置が必要
getProductsからの再呼び出しは再クリアがあるのでOK
それ以外のメソッドからの再呼び出しは厳禁
代わりに　entryListに編集メソッドを設けて出力はそちらにつなぐものとする
entryList.put(entry)    エントリを加える　同じidfのエントリは上書きする
entryList.remove(idf)    エントリを削除する　idf指定
entryList.get(idf)    エントリを加える　同じトークンのエントリは上書きする


documentDepot.documents は　serviceAgent.currentRepository.entryList への参照

更新時点の新規データを常に参照可能　リポジトリを切り替える際に参照を切り替えれば、特に問題はない？

オブジェクトをクリアしなければ問題ないはず
entryListの機能性を高めてスタティックオブジェクト化する

getList等のentryListを更新するメソッドはリストのメソッドを使ってリストを更新する

store(listEntry)


*/
NetworkRepository.prototype.getList_=function (force,callback){
//console.log("clear entryList \n rebuild entryList from documentsData"); console.log(this.productsData); console.log('++==%%');

    this.entryList.length=0;//エントリリスト初期化
    var newList = []; //新規配列作成    
    if((force)||(serviceAgent.currentRepository.productsData.length==0)) {
// forceオプションが指定されるかまたはプロダクトエントリがまだ無いケース
//プロダクト取得を設定して手続を一旦終了
        serviceAgent.currentRepository.getProducts();
        return;//一旦処理を中断　getProductsの最終工程でgetListが再度呼び出される
    }else{
//プロダクト情報更新
       for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
            var currentTitle = serviceAgent.currentRepository.productsData[idx];//Object取得
            if(typeof currentTitle.episodes == "undefined"){
                if(! force){console.log('skip :'+ currentTitle.name) ;continue;}
                serviceAgent.currentRepository.productsUpdate(function(){
                    serviceAgent.currentRepository.getEpisodes(false,false,currentTitle.token);
                },false,currentTitle.token);
                return;
            }
            if( currentTitle.episodes[0].length == 0 ) continue;
            for(var eid = 0 ;eid < serviceAgent.currentRepository.productsData[idx].episodes[0].length ; eid ++){
                var currentEpisode = currentTitle.episodes[0][eid];
                if(typeof currentEpisode.cuts == "undefined"){
                if(! force){console.log('skip :'+currentEpisode.name) ;continue;}
                    serviceAgent.currentRepository.episodesUpdate(false,false,currentEpisode.token);
                    return;//中断
                }
//console.log('products check clear');console.log(currentEpisode);
//                if( currentEpisode.cuts.length==1){serviceAgent.currentRepository.getSCi(false,false,currentEpisode.token);return;}
                if( currentEpisode.cuts[0].length == 0 ) continue;
                for(var cid = 0 ; cid < currentEpisode.cuts[0].length ;cid ++){
/*
    管理情報は識別子から取得する
APIの情報は、識別子と一致しているはずだが　照合の上異なる場合はAPIの情報で上書きを行う
識別子として　cut.description を使用　上位情報は、エントリから再作成
サブタイトルは　episode.discriptionを使用
兼用カット情報はペンディング
*/
                var myCutToken = currentEpisode.cuts[0][cid].token;
                var myCutLine  = (currentEpisode.cuts[0][cid].line_id)?
                    currentEpisode.cuts[0][cid].line_id:
                    (new nas.Xps.XpsLine(nas.pmdb.pmTemplate.members[0].line.toString())).toString(true);
                var myCutStage = (currentEpisode.cuts[0][cid].stage_id)?
                    currentEpisode.cuts[0][cid].stage_id:
                    (new nas.Xps.XpsStage(nas.pmdb.pmTemplate.members[0].stages[0].toString())).toString(true);
                var myCutJob   = (currentEpisode.cuts[0][cid].job_id)?
                    currentEpisode.cuts[0][cid].job_id:
                    (new nas.Xps.XpsStage(nas.pmdb.jobNames.members[0].toString())).toString(true);
                var myCutStatus= (currentEpisode.cuts[0][cid].status)?
                    currentEpisode.cuts[0][cid].status:'Startup';

//管理情報が不足の場合は初期値で補う description情報が未登録の場合は、APIの情報からビルドする？
if(! currentEpisode.cuts[0][cid].description){
    currentEpisode.cuts[0][cid].description="";
if(dbg)    console.log(currentEpisode.cuts[0][cid]);
};
                var entryArray = (
                    String(currentEpisode.cuts[0][cid].description).split('//').concat([
                        encodeURIComponent(myCutLine),
                        encodeURIComponent(myCutStage),
                        encodeURIComponent(myCutJob),
                        myCutStatus
                    ])
                ).slice(0,6);//

                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
                var currentEntry=serviceAgent.currentRepository.entry(currentEpisode.cuts[0][cid].description);//既登録エントリを確認
                if(currentEntry){
                    //データ構造上このパートが実行されるケースは無い…はず　versionIDがつかない＝エラーエントリになる
                    currentEntry.push(entryArray.slice(2).join("//"),currentTitle.token,currentEpisode.token,myCutToken);
                }else{
                    var newEntry = new listEntry(entryArray.join('//'),currentTitle.token,currentEpisode.token,myCutToken);
                    newEntry.parent = serviceAgent.currentRepository;
                    serviceAgent.currentRepository.entryList.push(newEntry);
                    // エントリ配下にversionsがあればそのままpush
if(! currentEpisode.cuts[0][cid].versions){
    currentEpisode.cuts[0][cid].versions=[];//
//    console.log(currentEpisode.cuts[0][cid]);
};
                    for (var vid = 0;vid<currentEpisode.cuts[0][cid].versions.length;vid++){
                        var myVersionString=(currentEpisode.cuts[0][cid].versions[vid].description)?
                            currentEpisode.cuts[0][cid].versions[vid].description:entryArray.join("//");
                        var myVersionToken = currentEpisode.cuts[0][cid].versions[vid].version_token;
if(dbg) console.log("push entry : "+ myVersionString);
                       newEntry.push(myVersionString,currentTitle.token,currentEpisode.token,myCutToken,myVersionToken);
                    }
                }
            };//エピソード更新ループ終了
        };//プロダクト更新ループ終了
    }
    }
    documentDepot.documentsUpdate();
    //現在すべてのデータを取得後にドキュメントブラウザの更新を行っているためレスポンスが途絶える
    //これを解消するためにドキュメントブラウザが逐次更新を行えるように改装を行う
    if(callback instanceof Function) callback();
//    return serviceAgent.currentRepository.entryList.length;
}
/*
    サーバから情報を取得してproductsDataを更新する
    entryListの更新は行わない
*/
NetworkRepository.prototype.getList=function (force,callback){
//console.log('networkRepository getList');
    alert('getList');return false;
    if(callback instanceof Function){callback();}else{documentDepot.documentsUpdate(this.entryList);}
        return;

    if((force)||(serviceAgent.currentRepository.productsData.length==0)) {
// forceオプションが指定されるかまたはプロダクトエントリがまだ無いケース
//プロダクト取得を呼び出して手続を一旦終了
        setTimeout(function (){serviceAgent.currentRepository.getProducts(callback)},10);
        return;
    }else{
//プロダクト情報更新
//getProductsメソッドの一部として同様の処理が行わるれる？
       for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
            var currentTitle = serviceAgent.currentRepository.productsData[idx];//Object取得
            if(typeof currentTitle.episodes == "undefined"){
                if(! force){console.log('skip :'+ currentTitle.name) ;continue;}
                serviceAgent.currentRepository.productsUpdate(function(){
                    serviceAgent.currentRepository.getEpisodes(false,false,currentTitle.token);
                },false,currentTitle.token);
                return;
            }
            if( currentTitle.episodes[0].length == 0 ) continue;
            for(var eid = 0 ;eid < serviceAgent.currentRepository.productsData[idx].episodes[0].length ; eid ++){
                var currentEpisode = currentTitle.episodes[0][eid];
                if(typeof currentEpisode.cuts == "undefined"){
                if(! force){console.log('skip :'+currentEpisode.name) ;continue;}
                    serviceAgent.currentRepository.episodesUpdate(false,false,currentEpisode.token);
                    return;//中断
                }
//console.log('products check clear');console.log(currentEpisode);
//                if( currentEpisode.cuts.length==1){serviceAgent.currentRepository.getSCi(false,false,currentEpisode.token);return;}
                if( currentEpisode.cuts[0].length == 0 ) continue;
                for(var cid = 0 ; cid < currentEpisode.cuts[0].length ;cid ++){
                }
            };//エピソード更新ループ終了
            documentDepot.updateOpusSelector();
        };//プロダクト更新ループ終了
    }
    //現在すべてのデータを取得後にドキュメントブラウザの更新を行っているためレスポンスが途絶える
    //これを解消するためにドキュメントブラウザが逐次更新を行えるように改装を行う
    if(callback instanceof Function){
        callback();
    }else{
        documentDepot.documentsUpdate();
    };
}
/**
    productsDataをentryListに変換するプロシジャ
  　独立してなるべく高速に処理
  　変換のみリスト取得は試みない
*/
NetworkRepository.prototype.convertPDEL=function (){
console.log("clear entryList \n rebuild entryList from documentsData"); console.log(this.productsData); console.log('++==%%');
    this.entryList.length=0;//エントリリスト初期化
    var newList = []; //新規配列作成
//プロダクト情報構築
    for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
        var currentTitle = serviceAgent.currentRepository.productsData[idx];//Object取得
console.log(currentTitle);
        if((typeof currentTitle.episodes == "undefined")||( currentTitle.episodes[0].length == 0 )) continue;
        //エピソード未登録タイトルはカットが存在しないので処理スキップ
        for(var eid = 0 ;eid < serviceAgent.currentRepository.productsData[idx].episodes[0].length ; eid ++){
console.log(serviceAgent.currentRepository.productsData[idx].episodes[0][eid]);
            var currentEpisode = currentTitle.episodes[0][eid];
            if((typeof currentEpisode.cuts == "undefined")||( currentEpisode.cuts[0].length == 0 )) continue;
                for(var cid = 0 ; cid < currentEpisode.cuts[0].length ;cid ++){
/*
    管理情報をビルド
APIの情報は、識別子と一致しているはずだが　照合の上異なる場合はAPIの情報で上書きを行う
識別子として　cut.description を使用　上位情報は、エントリから再作成
サブタイトルは　episode.discriptionを使用
兼用カット情報はペンディング
*/

                var myCut = currentEpisode.cuts[0][cid];
console.log(myCut);
console.log(xUI.XPS.currentStatus);
    if((! myCut.currentStatus)&&(myCut.description)){
        console.log('no currentStatus');
        myCut.line_id="0:trunk";
        myCut.stage_id="0:noname";
        myCut.job_id="0:init";
        myCut.status="Startup";
    }
//管理情報が不足の場合は初期値で補う   初期値の設定はダミー
  
    if (myCut.description){
console.log(decodeURIComponent(myCut.description));
                var myIdentifier = myCut.description;



    }else{

                if(! myCut.line_id)　myCut.line_id  =(new nas.Xps.XpsLine(nas.pmdb.pmTemplate.members[0])).toString(true);
                if(! myCut.stage_id) myCut.stage_id =(new nas.Xps.XpsStage(nas.pmdb.pmTemplate.members[0].stages.getStage())).toString(true);
                if(! myCut.job_id)   myCut.job_id   =(new nas.Xps.XpsStage(nas.pmdb.jobNames.getTemplate(nas.pmdb.pmTemplate.members[0].stages.getStage(),"init")[0])).toString(true);
                if(! myCut.status)   myCut.status   =(new nas.Xps.JobStatus("Startup")).toString(true);

                var myIdentifier =  encodeURIComponent(currentTitle.name);
                myIdentifier += '#' + encodeURIComponent(currentEpisode.name);
                myIdentifier += (currentEpisode.description)? '['+encodeURIComponent(currentEpisode.description) + ']':'';
                myIdentifier += '//'+encodeURIComponent(myCut.name);
                myIdentifier += '//'+([
                    encodeURIComponent(myCut.line_id),
                    encodeURIComponent(myCut.stage_id),
                    encodeURIComponent(myCut.job_id),
                    encodeURIComponent(myCut.status)
                ]).join('//');
                myCut.description=myIdentifier;//description情報が未登録の場合は、APIの情報からビルドした識別子を登録
    }
console.log(myCut.description);
console.log(decodeURIComponent(myCut.description));                

                var entryArray = myIdentifier.split('//').slice(0,6);//
                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
                var currentEntry=serviceAgent.currentRepository.entry(currentEpisode.cuts[0][cid].description);//既登録エントリを確認
console.log(currentEntry);
console.log(entryArray.slice(2).join("//"),currentTitle.token,currentEpisode.token,myCut.token);
               if(currentEntry){
/*
ネットワークリポジトリの場合は、同カットが二重にプロダクトデータに存在することはない。
存在した場合はエラーを記録してNOP
*/
console.log('error : エントリ重複検出');console.log(currentEntry);
                }else{
//当該カットが無いので新規にエントリ
console.log([entryArray.join('//'),currentTitle.token,currentEpisode.token,myCut.token]);              
//                    var newEntry = new listEntry(entryArray.slice(0,2).join('//'),currentTitle.token,currentEpisode.token,myCut.token);
                    var newEntry = new listEntry(myCut.description,currentTitle.token,currentEpisode.token,myCut.token);
                    newEntry.parent = serviceAgent.currentRepository;
                    serviceAgent.currentRepository.entryList.put(newEntry);
console.log(newEntry.issues[0].toString());
console.log(serviceAgent.currentRepository.entryList);
                };
// エントリ配下にversionsがあるはずなのでissuesをクリアしてデータをpush
// versionsが存在しない場合のみissuesに規定値が残る
                if(! myCut.versions){ myCut.versions=[]};
                for (var vid = 0;vid < myCut.versions.length;vid++){
                    var myVersionString=(myCut.versions[vid].description)?
                        myCut.versions[vid].description:entryArray.join("//");
                    var myVersionToken = myCut.versions[vid].version_token;
                    if(vid == 0){
//第一要素のみ　上書き処理
console.log('既存のissuesを上書き');
console.log(entryArray);
console.log(myCut);
console.log(newEntry.issues[0]);
//                        newEntry.issues[0][0]='';
//                        newEntry.issues[0][1]='';
//                        newEntry.issues[0][2]='';
//                        newEntry.issues[0][3]='';
//                        newEntry.issues[0].time='';
                        newEntry.issues[0].cutID=myCut.token;
                        newEntry.issues[0].identifier=myVersionString;
                        newEntry.issues[0].versionID=myVersionToken;
                    }else{
console.log("push entry : "+ myVersionString);
                        newEntry.push(
                            myVersionString,
                            currentTitle.token,
                            currentEpisode.token,
                            myCut.token,
                            myVersionToken
                        );
                    };
                };//バージョンループ
            };//カットループ
        };//エピソードループ
    };//プロダクトループ
console.log('XXXXXX');
console.log(serviceAgent.currentRepository.entryList)
    documentDepot.documentsUpdate();
}
/**
online-sigleモード用にエントリを一つだけ（高速に）作って固定する

以下の構造の productsDataを組む

タイトル/詳細は、該当タイトル一つのみ
エピソード/詳細も当該カットの親一つのみ
カットも当該カット一つのみ

NetworkRepository.prototype.buildProducts=function(){
    serviceAgent.currentServer.getRepositories(function(){
        serviceAgent.currentRepository.getEntry();
    });
}    
*/
/**
識別子（ユーザの選択）を引数にして実際のデータを取得
識別子に管理情報が付いている場合はそれを呼ぶ
管理情報なしの場合は、当該エントリの最新ジョブの内容を呼ぶ
管理情報が未fixの場合は編集エリア、既fixの場合はリファレンスエリアに読み込む

ターゲットジョブに先行するジョブがある場合は、そのジョブをリファレンスとしてコールバック内で呼ぶ

動作仕様調整
識別子引数は同じだが、完全型式の引数＋動作を渡してここでは判定を行わないように変更
判定はブラウザ又はサービスエージェントの同名関数が行う
引数の自動補完もしない

サーバからの読み出し後に、データ照合を行ってデータから生成される識別子がサーバの識別子と一致するように調整
サーバ側指定を優先してデータは自動更新される
詳細情報を受け取った際に補助情報又は受け取ったオブジェクトそのものをバックアップすること

UATサーバに対する請求の際に、識別子のかわりにtokenを使用可能にする。
(targetInfo.title == myIdentifier)であった場合のみcutTokenとして扱う？

*/
NetworkRepository.prototype.getEntry=function (myIdentifier,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
    //識別子をパース
    var targetInfo     = Xps.parseIdentifier(myIdentifier);//?
    var myIssue = false;
    var refIssue = false;
/*
  if (targetInfo.title == myIdentifier){
//トークンが直接与えられたものと判断する
    var targetURL='/api/v2/cuts/'+myIdentifier+'.json'; 
  } else {}
*/
//識別子からトークンを得る
    var myEntry = this.entry(myIdentifier);
    var myCut   = this.cut(myEntry.issues[0].cutID);
console.log(myEntry);
    if((! myEntry)||(! myCut)){
            var msg=localize({en:"no entry %1 in DB",ja:"DBからエントリ%1の取得に失敗しました"},decodeURIComponent(myIdentifier));
        alert(msg);
console.log(myEntry);
console.log(myCut);
console.log(serviceAgent.currentRepository);
console.log("noEntry : "+ decodeURIComponent(myIdentifier));//プロダクトが無い
        return false;
    }
    if(! targetInfo.currentStatus){
    //ターゲットに管理部分がないので、最新のissueとして補う
        var cx = myEntry.issues.length-1;
        myIssue = myEntry.issues[cx];
    }else{
    //指定管理部分からissueを特定する 連結して比較（後方から検索)リスト内に指定エントリがなければ失敗
        checkIssues:{
            for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
               if ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier) > 4){
                    myIssue = myEntry.issues[cx];
                    break checkIssues;
                }
            }
            if (! myIssue){
if(dbg) console.log( 'no target data :'+ decodeURIComponent(myIdentifier) );//ターゲットのデータが無い
                return false;
            }
        }
    }
// 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
//      myIssue; これがカットへのポインタ episode.cuts配列のエントリ myIssue.url にアドレスあり
//      urlプロパティが無い場合はid があるのでidからurlを作成する
    if(! myIssue.versionID){
        var targetURL=(myIssue.url)? myIssue.url: '/api/v2/cuts/'+myIssue.cutID.toString()+'.json';
    }else{
        var targetURL=(myIssue.url)? myIssue.url: '/api/v2/cuts/'+myIssue.cutID.toString()+'/'+String(myIssue.versionID)+'.json';
if(dbg) console.log(targetURL);
    }

    if(! isReference){
/**
暫定補助情報フォーマット
    product.name
        decoded name
    product.description
    episode.name
        decoded name
    episode.description
        decoded subtitle 
    cut.name
        decoded name
    cut.description
        identifier-fullformat
*/
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
console.log(result);
//データ請求に成功したので、現在のデータを判定して処理の必要があれば処理
        	var myContent = result.data.cut.content;//XPSソーステキストをセット
        	var currentXps = new nas.Xps();
            if(callback instanceof Function){
//コールバック関数に渡す
                callback(myContent);
            }else{
                if(myContent){
//処理バッファに反映
                    currentXps.parseXps(myContent);
                }else{
/*
    サーバリザルトにタイムシートの内容が含まれない場合は、登録直後の空白データ
    以下の情報を取得して空のタイムシートをビルドする
    タイトル、エピソード
    タイトルのフレームレート（ない場合はシステムデフォルト）
    識別子に含まれるカット番号　あれば　カット尺（ない場合はシステムデフォルト）
*/
//console.log('contents :'+ myContent);
                    var myParseData = Xps.parseSCi(result.data.cut.name);
                    currentXps.cut = myParseData.cut;
                    currentXps.setDuration(nas.FCT2Frm(String(myParseData.time)));
                };
//myContent==nullのケースは、サーバに空コンテンツが登録されている場合なので単純にエラー排除してはならない
//currentXpsのプロパティをリザルトに同期させる
//エラーではなく初期化時点の初期状態のXpsのままで処理を継続する
            //xUI.userPermissions=result.data.cut.permissions;
//読み込んだXPSが識別子と異なっていた場合識別子優先で同期する
                xUI.resetSheet(currentXps);
                var durationChange=xUI.XPS.duration();
//console.log(xUI.XPS);
//console.log(myIssue.identifier);
//                xUI.XPS.syncIdentifier(myIssue.identifier,false);
                xUI.XPS.syncIdentifier(myIssue.identifier,true);
                durationChange = (durationChange == xUI.XPS.duration())? false:true;
                if(myEntry.issues.length>1){
                    documentDepot.currentReference = new nas.Xps(5,144);//空オブジェクトをあらかじめ新規作成
                    //自動設定されるリファレンスはあるか？
                    //指定管理部分からissueを特定する 文字列化して比較
                    if ( cx > 0 ){
                        if(parseInt(decodeURIComponent(myIssue[2]).split(':')[0]) > 0 ){
                    //ジョブIDが１以上なので 単純に一つ前のissueを選択する
                    //必ず先行jobがある  =  通常処理の場合は先行JOBが存在するが、単データをエントリした場合　そうではないケースがあるので対処が必要　2016 12 29
                        refIssue = myEntry.issues[cx-1];
                        }else if(decodeURIComponent(myIssue[1]).split(':')[0] > 0 ){
                    //第2ステージ以降前方に向かって検索
                    //最初にステージIDが先行IDになった要素が参照すべき要素
                            for(var xcx = cx-1 ;xcx >= 0 ; xcx --){
                                if (parseInt(decodeURIComponent(myEntry.issues[xcx][1]).split(':')[0]) == (parseInt(decodeURIComponent(myIssue[1]).split(':')[0])-1)){
                                    refIssue = myEntry.issues[xcx];
                                    break;
                                };
                            };
                        };//cx==0 のケースでは、デフォルトで参照すべき先行ジョブは無い
                    };
                    if(refIssue) serviceAgent.currentRepository.getEntry(refIssue.identifier,true);
                };
                //xUI.resetSheet(XPS);
                xUI.sessionRetrace = myEntry.issues.length-cx-1;
                xUI.setUImode('browsing');sync("productStatus");
                xUI.flushUndoBuf();sync('undo');sync('redo');
                if(durationChange) xUI.resetSheet();
                setTimeout(function(){sync('historySelector');},10);
//                if(callback instanceof Function) callback();//callbackの扱いを定形処理外のユーザ関数に変更
            };
        },
        error:function(result){
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2(result);
        },
        beforeSend: this.service.setHeader
    });

}else{
    //データ単独で現在のセッションのリファレンスを置換
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
            var myContent=result.data.cut.content;//XPSソーステキストをセット
if(dbg) console.log('import Reference'+myContent);
	        documentDepot.currentReference=new nas.Xps();
	        documentDepot.currentReference.readIN(myContent);
	        xUI.setReferenceXPS(documentDepot.currentReference);
            if(callback instanceof Function) callback();
        },
        error: function(result){
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
        },
        beforeSend: this.service.setHeader
    });
}
  return null;
}
/**
    標準コールバックを作る
    コールバック関数が引数で与えられなかった場合は xUIに新規Xpsとして与えて読み込ませる
    読み出したエントリに前方のジョブがあれば、それをリファレンスとして与えるルーチンも必要

function(result){
	var myContent=result.data.cut.content;//XPSソーステキストをセット
//以下が標準の読み込み時の初期化
	if(xUI.XPS.readIN(myContent)){xUI.resetSheet(xUI.XPS);}
    if(that.
}
function(result){
	var myContent=result.data.cut.content;//XPSソーステキストをセット
	myXps=new nas.Xps();
    xUI.setReferenceXPS(myXps)
}
    外部からコールバックを与える場合は、以下のようなケース
未fixのXPSをリファレンスペインに読み込む操作（これに関してはオプションをつけたほうが良さそう？）
 */
/**
    DBにタイトルを作成する。
    confirmなし 呼び出し側で済ませること
    必要あれば編集UI追加
引数:
    タイトル（必須）
    備考テキスト
    Pmオブジェクト
    コールバック関数２種
戻値:
     なし

識別子は受け入れない　必要に従って前段で分解のこと
*/
NetworkRepository.prototype.addTitle=function (myTitle,myDescription,myPm,callback,callback2){
/*
    識別子を検出（呼び出し側で）このルーチンまで来た場合は、引数を分解しておくこと
    2017.01.28時点でAPIにtemplateが出ていないのでpmの処理は省略　遅延で詳細編集を行っても良い
    serviceAgent.currentRepository.addTitle("tST2","testTitlewith API")
    作成時に検査を行い、既存タイトルならば処理を中断する（呼び出し側で）
    タイトル作成前に確認メッセージを出す（これも呼び出し側）
    現在はPmオブジェクトは機能していない　2/9 2017
*/
    if(! myTitle) return false;
    if(! myDescription) myDescription="";
//      var parseData = Xps.parseIdentifier(myTitle);
//      if(parseData){myTitle=parseData.title};
    var data = {
        product: {
          name          : myTitle,
          description   : myDescription,
          framerate     : nas.FRATE,
        } 
    };

	$.ajax({
		type : 'POST',
		url : serviceAgent.currentRepository.url+"/api/v2/products.json",
		data : data,
		success : function(result) {
if(dbg) console.log('success');
if(dbg) console.log(result);
            if(callback instanceof Function) callback();
		},
		error:function(result) {
if(dbg) console.log('error');
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
}
/**
    DBにOPUS(エピソード)を作成する。
引数
    タイトルを含む識別子　カット番号は求めない
    コールバック関数２種
    識別子のみ受け入れ
    このルーチンを呼び出す時点で、タイトルは存在すること
    手続的には、カット作成を主眼にして
    Title/Opus 等の上位のオブジェクトが存在しない時点で自動でコールされるように調整する？
    
*/
NetworkRepository.prototype.addOpus=function (myIdentifier,prodIdentifier,callback,callback2){
/*
    listEntry.titleID
*/
    var parseData = Xps.parseIdentifier(myIdentifier);
    if(! parseData){
        if(callback2 instanceof Function) callback2;
        return;
    }
    var myProduct = parseData.product;
    
    var myEntry=false;
    if(typeof prodIdentifier == 'undefined'){
        for (var pid=0;pid<documentDepot.products.length;pid ++){
        //productsのメンバをオブジェクト化したほうが良いかも
            var prdInfo=Xps.parseProduct(documentDepot.products[pid]);
            if(prdInfo.title==myProduct.title) {
                 myEntry = serviceAgent.currentRepository.entry(documentDepot.products[pid]);
                break;
            }
        };
    }else{
        myEntry = serviceAgent.currentRepository.entry(prodIdentifier+"//",true);
    }
    if(!myEntry){
        if(callback2 instanceof Function) callback2;
        return;
    }
    var data = {
        episode: {
          product_token : myEntry.productID,
          name          : myProduct.opus,
          description   : myProduct.subtitle
        } 
    };

	$.ajax({
		type : 'POST',
		url : serviceAgent.currentRepository.url+"/api/v2/episodes.json",
		data : JSON.stringify(data),
		success : function(result) {
console.log(result);
		    if( callback instanceof Function) callback();
		},
		error:function(result) {
		    if( callback2 instanceof Function) callback2();
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
}
/**
データオブジェクトを渡してリポジトリにプッシュする
一致エントリがあれば上書き
一致エントリで先行の管理情報がロックされている場合はリジェクト
管理情報の世代が上がっていれば追加の管理情報を添えて保存
タイトルがDBに登録されていない場合は、ユーザの確認をとってタイトルを作成
エピソードがDBに登録されていない場合も同様

これは保存系のAPIが出てから調整
*/

NetworkRepository.prototype.pushEntry=function (myXps,callback,callback2){
//識別子取得（全要素で取得）
    var myIdentifier=Xps.getIdentifier(myXps,true);
//識別子に相当するアイテムがリポジトリに存在するかどうかをチェック
    var currentEntry = this.entry(myIdentifier);
//    var currentCut   = this.cut(myIdentifier);
    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(currentEntry){
            //既存のエントリが有るのでストレージとリストにpushして処理終了
        this.pushData('PUT',currentEntry,myXps,callback,callback2)
    }else{
/**
    currentEntry==null なので、ターゲットのエピソードtokenを再取得して引数で渡す必要あり １２・２１
*/
            //新規エントリなので新たにPOSTする (空エントリを引数に付ける)
//        var tmpEntry= new listEntry(Xps.getIdentifier(myXps));
        var tmpEntry= this.entry(Xps.getIdentifier(myXps),true);
        this.pushData('POST',tmpEntry,myXps,callback,callback2)    
    }
};
/**
    サーバにデータを送信する（メンテナンスメソッド）
    引数:
        メソッド
        myProduct
        Xpsオブジェクト
        成功時コールバック関数
        失敗時コールバック関数

リポジトリ上に既存エントリはPUT 新規エントリはPOSTで　送信
タイトルや、エピソードが存在しないデータはリジェクト
オンサイト時は　各種データをbackend_variablesから取得
それ以外の場合は、documentDepotから取得をトライする
取得に失敗した場合は送信失敗

エントリリスト等の内部操作は行わない

<span id="backend_variables" data-user_access_token="4dcb5a249c94aa21529a522e23de730f176d032d8e1e1bf621c8f09b0d733566"
                               data-user_token="aWWMWNKW2HAfuRHWANZKbETy"
                               data-user_name="ねこまたや"
                               data-user_email="kiyo@nekomataya.info"
                               data-episode_id="17"
                               data-cut_id="24"　
                               data-episode_token="mfjVjBUuG6Q8GHu7u6nzJTa2"
                               data-cut_token="73o16nRYK7oqNNmeGDHWizLV"
                               data-line_id="0:(trunk)"
                               data-stage_id="0:Startup"
                               data-job_id="1:work"
                               data-status="Active"
  ></span>
  myEntry を myProduct に換装
  listEntry > productsData.episodes[0]
*/
NetworkRepository.prototype.pushData=function (myMethod,myEntry,myXps,callback,callback2){
//console.log(myEntry);
if (myEntry instanceof listEntry){
//エントリオブジェクト渡し
	var lastIssue   = myEntry.issues[myEntry.issues.length-1];

    var title_name     = myEntry.product.split('#')[0];
    var episode_name   = myEntry.product.split('#')[1];
    var cut_name       = (myMethod == 'PUT')? myEntry.sci:'s'+((myXps.scene)? myXps.scene:'-')+'c'+myXps.cut+"("+nas.Frm2FCT(myXps.time(),3,0,myXps.framerate)+")";
    var line_id        = myXps.line.toString(true);
    var stage_id       = myXps.stage.toString(true);
    var job_id         = myXps.job.toString(true);
    var status         = myXps.currentStatus.toString(true);
/*
    var line_id        = lastIssue[0];
    var stage_id       = lastIssue[1];
    var job_id         = lastIssue[2];
    var status         = lastIssue[3];
*/
}else{
//プロダクト(該当カットはなし)
	var lastIssue   = ['0:','0:','0:','Startup'];

    var title_name     = myEntry.product.split('#')[1];
    var episode_name   = encodeURIComponent(myEntry.name);
    var cut_name       = (myMethod == 'PUT')? myEntry.sci:'s'+((myXps.scene)? myXps.scene:'-')+'c'+myXps.cut+"("+nas.Frm2FCT(myXps.time(),30,myXps.framerate)+")";
    var line_id        = myXps.line.toString(true);
    var stage_id       = myXps.stage.toString(true);
    var job_id         = myXps.job.toString(true);
    var status         = myXps.currentStatus.toString(true);
/*
    var line_id        = lastIssue[0];
    var stage_id       = lastIssue[1];
    var job_id         = lastIssue[2];
    var status         = lastIssue[3];
*/
    
}
//オンサイト・シングルドキュメントバインドの場合はbackend_variablesから情報を取得
  if(serviceAgent.currentStatus=="online-single"){
//  if(document.getElementById('backend_variables')){}
	var episode_token   = $('#backend_variables').attr('data-episode_token');
	var cut_token       = $('#backend_variables').attr('data-cut_token');
  }else{
	var episode_token   = myEntry.episodeID;
	var cut_token       = (myMethod == 'PUT')? lastIssue.cutID:false;
  }
//console.log(serviceAgent.currentStatus);
//console.log("epToken : "+episode_token);
//console.log("ctToken : "+cut_token +" :: "+ lastIssue.cutID);
//console.log("ctName  : "+decodeURIComponent(cut_name));
//return
/**
	保存時に送り出すデータに
		タイトル・エピソード番号（文字列）・サブタイトル
		カット番号+カット尺
	を加えて送出する
	型式をきめこむ
	サーバ側では、これが保存状態と異なる場合は、エラーを返すか又は新規タイトルとして保存する必要がある。
	アプリケーション側は、この文字列が異なる送出を抑制して警告を出す？
このメソッドは、既存のエピソードに対しての追加機能のみ
タイトル作成及びエピソード作成は別に用意する	
*/
if(myMethod=='POST'){
//新規エントリ作成 POST
	json_data = {cut:{
		     		episode_token   : episode_token,
	                name            : decodeURIComponent(cut_name),
	                description     : Xps.getIdentifier(myXps,true),
			 		status          : myXps.currentStatus.toString(true),
			 		job_id          : decodeURIComponent(myXps.job.toString(true)),
			 		stage_id        : decodeURIComponent(myXps.stage.toString(true)),
			 		line_id         : decodeURIComponent(myXps.line.toString(true)),
			 		content         : myXps.toString()
				}};
		method_type = 'POST';
		target_url = '/api/v2/cuts.json';
}else{
//エントリ更新 PUT
	json_data = {
		     		token: cut_token,
		     		cut:{
	                   name         : decodeURIComponent(cut_name),
//	                   description  : myEntry.toString(true),
	                   description  : Xps.getIdentifier(myXps,true),
			 		   content      : myXps.toString(),
//			 		 cut_token   : cut_id,
//			 		 title_name  : title_name,
//			 		 episode_name: episode_name,
//			 		 cut_name    : cut_name,
			 		   line_id     : decodeURIComponent(line_id),
			 		   stage_id    : decodeURIComponent(stage_id),
			 		   job_id      : decodeURIComponent(job_id),
			 		   status      : status
				}};
		method_type = 'PUT';
		target_url = '/api/v2/cuts/' + cut_token + '.json'
}
if((typeof cut_token == 'undefined')||(cut_token == 'undefined')){console.log(myXps);console.log(myEntry);}
/*
開発中の 制作管理DB/MAP/XPS で共通で使用可能なnas.SCInfoオブジェクトを作成中
これに一意のIDを持たせる予定です。
*/
if(dbg) console.log(method_type+' :'+serviceAgent.currentRepository.url+target_url +'\n' +JSON.stringify(json_data));
	$.ajax({
		type : method_type,
		url : serviceAgent.currentRepository.url+target_url,
		data : JSON.stringify(json_data),
		contentType: 'application/JSON',
		dataType : 'JSON',
		scriptCharset: 'utf-8',
		success : function(result) {
                if (xUI.XPS === myXps) xUI.setStored('current');
			sync();//保存ステータスを同期
			if( method_type == 'POST'){
if(dbg) console.log("new cut!");
//console.log(result);
				$('#backend_variables').data('cut_token', result.data.cut['token']);
			}else{
if(dbg) console.log('existing cut!');
			}
// リストプッシュ 等の内部　DB操作は前段で適用を済ませるかまたはコールバック渡しにする
            if(callback instanceof Function){callback();}
		},
		error : function(result) {
            if(callback2 instanceof Function){callback2();}
			// Error
//console.log("error");
//console.log(result);
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
};
/**
    ネットワークリポジトリのエントリをアプリケーションから削除することは無いので以下のメソッドは不用？
    APIにハードデリートとソフトデリートを出してもらう？
    削除が可能な条件は
    自分自身が開始した作業セッションであること && 最終の作業セッションであること
    エントリをすべて削除するにはオプションが必要
    識別子がフル（）
*/
NetworkRepository.prototype.removeEntry=function (myIdentifier){
//
//識別子 からエントリを特定して削除する？
};
/**
    エントリリストを検索して該当するリストエントリを返す操作をメソッド可
引数:
    識別子
    プロダクト検索オプション
戻値:
    識別子に該当するlistEntry
    または episode情報
    データ照合に失敗した場合はnull
    
    issues他のプロパティは受取先で評価
    指定の識別子との比較は
    title,opus,scene,cut の４点の比較で行う(秒数とサブタイトルは比較しない)
    optを加えるとtitle,opus(= product)のみを比較
    現在カットが０（未登録）の登録済みプロダクトの場合　true/-1 false/0 を戻す
*/
NetworkRepository.prototype.entry=function(myIdentifier,opt){
//    if(! opt) {opt = 1}else{opt = 0};
//    return this.entryList.getByIdf(myIdentifier,opt);
/*--以下検証要
--*/
    opt = (opt)? -1 : 0;
  if(serviceAgent.currentRepository.entryList.length){
    for (var pid=0;pid<serviceAgent.currentRepository.entryList.length;pid++){
        if(Xps.compareIdentifier(serviceAgent.currentRepository.entryList[pid].toString(),myIdentifier) > opt){
                return serviceAgent.currentRepository.entryList[pid]
        }
    }
  }else if(opt){
    for (var pid=0;pid<serviceAgent.currentRepository.productsData.length;pid++){
      for (var oid=0;oid<serviceAgent.currentRepository.productsData[pid].episodes[0].length;oid++){
        var checkTitle = serviceAgent.currentRepository.productsData[pid].name;
        var checkOpus  = serviceAgent.currentRepository.productsData[pid].episodes[0][oid].name;
        if(
    Xps.compareIdentifier([decodeURIComponent(checkTitle),decodeURIComponent(checkOpus)].join('#')+'//',myIdentifier) > opt
        ){
                return opt;
        }
      }
    }
  }
    return null;        
}
/**
    カットトークン又はエピソードトークンから識別子を取得する
    エピソードトークンで得られた識別子はカット番号を自動で補う
    タイトル等の文字列が必要な場合はダミーのカット番号を捨てる必要あり
*/
NetworkRepository.prototype.getIdentifierByToken=function(myToken){
    search_loop:
    for (var pid=0;pid<this.productsData.length;pid++){
        //先にカットの照合を行う
        //要素内に情報の不足がある場合はそのブロックをスキップする
        if(! this.productsData[pid].episodes) continue;
        for (var eid=0;eid<this.productsData[pid].episodes[0].length;eid++){
            if(! this.productsData[pid].episodes[0][eid].cuts) continue;
            for (var cid=0;cid<this.productsData[pid].episodes[0][eid].cuts[0].length;cid++){
                if(this.productsData[pid].episodes[0][eid].cuts[0][cid].token==myToken){
                    return this.productsData[pid].episodes[0][eid].cuts[0][cid].description;
                }
            if(this.productsData[pid].episodes[0][eid].token==myToken){
                var lastName = (this.productsData[pid].episodes[0][eid].cuts[0].length)?
                this.productsData[pid].episodes[0][eid].cuts[0][this.productsData[pid].episodes[0][eid].cuts[0].length-1].name:'0';
                var myIdentifier = encodeURIComponent(this.productsData[pid].name)+'#'+
                    encodeURIComponent(this.productsData[pid].episodes[0][eid].name)+
                    ((this.productsData[pid].episodes[0][eid].description)?
                    '['+encodeURIComponent(this.productsData[pid].episodes[0][eid].description)+']':''
                )+'//'+nas.incrStr(lastName);
                return myIdentifier;   
            }
            }
        }
    }
    return null;        
}
/**
    tokenの一致するproductsData内のノードエレメントを戻す
    product>episodes>cut の順で検索　種別指定があればそのエレメントを先に検索
*/
NetworkRepository.prototype.getNodeElementByToken=function(myToken,myKind){
    if(! myToken) return null;
    if(! myKind) myKind = '*';
products:
    for (var pid=0;pid<this.productsData.length;pid++){
        if(((myKind=="product")||(myKind=="*"))&&(this.productsData[pid].token == myToken))
        return this.productsData[pid];
episodes:
        if(this.productsData[pid].episodes){
        for (var eid=0;eid<this.productsData[pid].episodes[0].length;eid++){
            // episodes[0]がトレーラー配列なので注意
            if(((myKind=="episode")||(myKind=="*"))&&(this.productsData[pid].episodes[0][eid].token == myToken))
            return this.productsData[pid].episodes[0][eid];
cuts:
            if(this.productsData[pid].episodes[0][eid].cuts){
            for (var cid=0;cid<this.productsData[pid].episodes[0][eid].cuts[0].length;cid++){
//                if(this.productsData[pid].episodes[0][eid].cuts[0].token == myToken) return this.productsData[pid].episodes[0][eid].cuts[0];
                if(((myKind=="cut")||(myKind=="*"))&&(this.productsData[pid].episodes[0][eid].cuts[0].token == myToken))
                return this.productsData[pid].episodes[0][eid].cuts[0];
                //cuts[0]がトレーラーオブジェクト　cuts[1] を廃止する準備中
            }}
        }}
    }
    return null;
}
/**
    エントリステータス操作コマンドメソッド群
    ServiceAgentの同名メソッドから呼び出す下位ファンクション

    caller側のルーチンで判定基準にしたデータが最新である保証が無いので
    各メソッドの書込み前にステータスの再確認が必要
    読み出しを前段に置いて成功時の関数内で再判定か？
    または、サービス側で変更要求に対する処理基準を明確にしてリジェクトを実装してもらう 2016.12.23
*/
/**
    現在のドキュメント XPS に対応するリポジトリ上のエントリをアクティベートする
    アクティベート前に、データの現状を取得してコールバックでアクティベート処理を渡す

    引数:処理成功時と失敗時のコールバック関数
*/
NetworkRepository.prototype.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.cut(currentEntry.toString());
    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if((!currentEntry)||(!currentCut)){
//console.log('noentry');
//console.log(serviceAgent.currentRepository);
        return false;
    }
/*
    サーバからデータの最新状況を取得する
    ステータスを確認してから、新規のステータスを設定する
 */
	    $.ajax({
		    type : 'GET',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    success : function(result){
//console.log(result);
/*
手順　GET serverURL(token).json
サーバリザルトのdescriptionから状態と内容を確認して
Activate可能な場合は新しいコンテンツとdescriptionを送信　            
それ以外は失敗
*/
                currentCut.versions = result.data.versions;
                var currentServerXps=new nas.Xps();
                    currentServerXps.parseXps(result.data.cut.content);
//cut.description　にidentifierがセットされないケースがある（サービス的には正常）
//cut.descriptionがヌルまたはundefinedの際はXps本体から情報を構築する

                var currentDataInfo=Xps.parseIdentifier(result.data.cut.description);
//ディスクリプションがcutに付属していないのは　APIの変更によるので　調整　0211
                if(! currentDataInfo) currentDataInfo = Xps.parseIdentifier(Xps.getIdentifier(currentServerXps));
//書き込み権限の判定からスタッフの判定になる　
//                    (result.data.permissions.write)&&
//                    (result.data.permissions.read)&&
                if(
                    ((currentDataInfo.currentStatus.content == "Fixed")|| (currentDataInfo.currentStatus.content == "Hold"))&&
                    (xUI.currentUser.sameAs(currentServerXps.update_user))
                ){
//同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
                    var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
//console.log('activate : '+decodeURIComponent(Xps.getIdentifier(newXps)));
                        newXps.currentStatus = new nas.Xps.JobStatus('Active');
                        newXps.update_time   = new Date().toNASString();
                    var data = {
                        token: currentCut.token,
                        cut: {
                            name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                            content:    newXps.toString(),
                            description: Xps.getIdentifier(newXps)
                        }
                    };
if(dbg) console.log(data);
                    $.ajax({
		                type : 'PUT',
		                url : serviceAgent.currentRepository.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		                data : data,
		                success : function(result){
//console.log('success activated :' + decodeURIComponent(currentEntry.toString()));
//console.log(result)
                            currentEntry.setStatus(newXps.currentStatus);

                            currentCut.versions[currentCut.versions.length-1].description = Xps.getIdentifier(newXps);
                            currentCut.versions[currentCut.versions.length-1].updated_at  = newXps.update_time;
//PUTのリザルトは200コードのみ
//PUT時点でアサイン可能リスト等をとったほうが良いか？
                            xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
			                xUI.setStored("current");//UI上の保存ステータスをセット
			                sync();//保存ステータスを同期
                            selectSCi();//カレントデータを再セレクトして情報更新
                            sync('historySelector');//履歴セレクタ更新
                
                            xUI.setUImode('production');
                            xUI.sWitchPanel();//パネルクリア
                            if(callback instanceof Function) {setTimeout(callback,10);}
                        },
                        error : function(result){
//console.log('fail activate :'+ decodeURIComponent(currentEntry.toString()));
//console.log(result);
//console.log('ステータス変更失敗 :');
                            if(callback2 instanceof Function) {setTimeout(callback2,10);}
                                return false;
                        },
		                beforeSend: serviceAgent.currentRepository.service.setHeader
                    });                    
                }else{
//console.log('fail activate :'+ decodeURIComponent(currentEntry.toString()));
//console.log(result);
//console.log('ステータス変更できません :');
                    if(callback2 instanceof Function) {setTimeout(callback2,10);}
                        return false;
                }
            },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
/**
    サービス側での排他が完了したら下の簡単な処理でOKのはず
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: Xps.getIdentifier(newXps)
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
//console.log('network repository activated :'+ decodeURIComponent(currentEntry.toString()));
//console.log(result);
                currentEntry.setStatus(newXps.currentStatus);
                currentCut.versions[currentCut.versions.length-1]=result.data.versions[currentCut.versions.length-1];

                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('production');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
*/
}
/**
    作業を保留する リポジトリ内の対応エントリデータを更新してステータスを変更
    基本的にデータはActiveなので、変更権利は取得済みとみなして操作を行う
    失敗の可能性はあり
*/
NetworkRepository.prototype.deactivateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.cut(currentEntry.toString());
    var currentCut   = this.cut(currentEntry.issues[0].cutID);
        //Active > Holdへ
    var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
        //ユーザ判定は不用
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に上書き保存（先行データは上書きされる）
            newXps.currentStatus = new nas.Xps.JobStatus('Hold');//（ジョブID等）status以外の変更はない
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
        var data = {
                token: currentCut.token,
                cut: {
                    name        : decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description : Xps.getIdentifier(newXps),
                    content     : newXps.toString(),
			 		line_id     : newXps.line.toString(true),
			 		stage_id    : newXps.stage.toString(true),
			 		job_id      : newXps.job.toString(true),
			 		status      : newXps.currentStatus.toString(true)
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
//console.log('network repository deactivated :'+decodeURIComponent(currentEntry.toString().split('//')[1]));
//console.log(result);
                currentEntry.setStatus(newXps.currentStatus);
//                currentCut.versions[currentCut.versions.length-1]=result.data.versions[currentCut.versions.length-1];
                currentCut.versions[currentCut.versions.length-1].description = Xps.getIdentifier(newXps);
                currentCut.versions[currentCut.versions.length-1].updated_at= newXps.update_time;
                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
//console.log("error");
//console.log(result);
//console.log('保留失敗 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                delete newXps;
		    },
		    beforeSend: this.service.setHeader
	    });
    }else{
//console.log('保留可能エントリ無し :'+ decodeURIComponent(Xps.getIdentifier(newXps)));
             return false ;
    }
}
/** 
    作業にチェックイン
    リポジトリ種別にかかわらないので
    このメソッドを呼ぶ前段でジョブ名称は確定しておくこと
    ジョブ名指定のない場合は操作失敗    
*/
NetworkRepository.prototype.checkinEntry=function(myJob,callback,callback2){
    if( typeof myJob == 'undefined') return false;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 
            //リポジトリのステータスを変更する XPSの内容は変更不用
        var newXps = new nas.Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        // ユーザ判定は不用（権利チェックは後ほど実装）
    if (newXps){
        newXps.job.increment(myJob);
        newXps.update_user = xUI.currentUser;
        newXps.currentStatus = new nas.Xps.JobStatus('Active');
if(dbg) console.log(newXps.toString());//
    //引数でステータスを変更したエントリを作成 新規に保存 JobIDは必ず繰り上げる
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 
    //成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットを送信してステータスを変更(ステータスのみの変更要求は意味が無い・内部データと不整合を起こすので却下)
    //descriptionのステータスを優先するならその方法も可能だが、バックアップタイミングを逃す？

        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString(true).split('//')[1]),
                    description: Xps.getIdentifier(newXps),
                    content: newXps.toString()
                }
        };
//console.log('networkRepository checkinEntry')
//console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
//console.log('check-in :'+decodeURIComponent(currentEntry.toString()));
//console.log(result);//PUTなので200番のみ
//リザルトに含まれるカットのデータでリストを更新する（ムリ）

//                currentEntry.push(result.cut.description,currentEntry.titleID,currentEntry.episodeID,result.cut.token);
                currentEntry.push(Xps.getIdentifier(newXps),currentEntry.titleID,currentEntry.episodeID,currentEntry.issues[0].cutID);

                if(! currentCut.versions) currentCut.versions = [];
                currentCut.versions.push({
                    updated_at:newXps.updated_time,
                    description:Xps.getIdentifier(newXps),
                    version_token:null
                });

                xUI.setReferenceXPS()
                xUI.XPS.job.increment(myJob);

                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('production');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
    }
}
/**
    作業終了
*/
NetworkRepository.prototype.checkoutEntry=function(assignData,callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.cut(currentEntry.toString());
    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(! currentEntry) {
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
            //Active > Fixed
if(true){
        var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
}else{
        var newXps = new nas.Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
};//下の複製のほうが安全？
        //ユーザ判定は不用 JobID変わらず
    if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = new nas.Xps.JobStatus('Fixed');//（ジョブID等）status以外の変更はない
            
//            newXps.currentStatus = ['Fixed',assignData].join(":"); アサインデータはまだUIのみでペンディング

    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name        : decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description : Xps.getIdentifier(newXps),
                    content     : newXps.toString(),
 			 		line_id     : newXps.line.toString(),
			 		stage_id    : newXps.stage.toString(),
			 		job_id      : newXps.job.toString(),
			 		status      : newXps.currentStatus.toString(true)
               }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
//console.log('check out entry :' + decodeURIComponent(currentEntry.toString()));
//console.log(result);
                currentEntry.setStatus(newXps.currentStatus);//result.data.cut.status も可
                if(result.data.versions)
                currentCut.versions[currentCut.versions.length-1] = result.data.versions[currentCut.versions.length-1];
//?
                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
//                if(serviceAgent.currentStatus=="online-single"){backToDocumentList('cut');} ;//コレだ！　ダメだ！！
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error :function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('終了更新失敗 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                delete newXps;
		    },
		    beforeSend: this.service.setHeader
	    });
    }
if(dbg) console.log('終了更新失敗');
        delete newXps ;
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    検収処理
引数:
    nas.Pm.ProductionStageオブジェクト
    Xps.Stage
    または
    Stage名文字列("layout"等)
*上二つのオブジェクトからの処理は未実装2016-1230
    初期化用Job名文字列
    現在の工程（作業は既Fixed）を閉じて次の工程を開始する手続き
    現在のデータのステータスを変更
        ステージを新規オブジェクトでincrement = Jobは初期状態にリセット
        
    
*/
NetworkRepository.prototype.receiptEntry=function(stageName,jobName,callback,callback2){
    if( typeof stageName == 'undefined') return false;
    var myStage = nas.pmdb.stages.getStage(stageName) ;//ステージDBと照合　エントリが無い場合はエントリ登録
    /*  2106-12 の実装では省略して　エラー終了
        2017-07 最小限の処理を実装　ステージの存在を確認して続行
    */
    if(! myStage) return false;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.cut(currentEntry.toString());
    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if((!currentEntry)||(!currentCut)){
//console.log('noentry');
//console.log(serviceAgent.currentRepository);
        console.log('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のステージを立ち上げるため 読み出したデータでXpsを初期化 
if(false){
        var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
}else{
        var newXps = new nas.Xps();
        var currentContents = xUI.XPS.toString();
        newXps.parseXps(currentContents);
};//下の複製のほうが安全？
        // ユーザ判定は不用（権利チェックは後ほど実装）
    if (newXps){
        newXps.stage.increment(stageName);
        newXps.job.reset(jobName);
        newXps.update_user = xUI.currentUser;
        newXps.currentStatus = new nas.Xps.JobStatus('Startup');
if(dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
    //明示的なエントリ変更の要求が必要ならば処理
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: Xps.getIdentifier(newXps),
                    content: newXps.toString()
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
//console.log('check-in');
//console.log(result);
                currentEntry.push(result.data.cut.description);
                documentDepot.documentsUpdate();
//                serviceAgent.currentRepository.getList(true);//リストステータスを同期
//                currentEntry.push(Xps.getIdentifier(newXps));
//                documentDepot.updateDocumentSelector();
//                documentDepot.rebuildList();
                xUI.XPS.stage.increment(stageName);
                xUI.XPS.job.reset(jobName);
                xUI.XPS.currentStatus= new nas.Xps.JobStatus('Startup');//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
    }
}
/**
    作業中断処理
*/
NetworkRepository.prototype.abortEntry=function(myIdentifier){
    var currentEntry = this.entry(myIdentifier);
    if(! currentEntry) return false;
    var currentStatus=currentEntry.getStatus();

    if(String(currentStatus.content).indexOf('Fixed')<0){return false;}

    switch (currentStatus.content){
        case 'Startup':
        case 'Hold':
        case 'Fixed':
        case 'Active':
            //管理モード下でのみ処理 このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
    }
}

/**
    最終作業の破棄
    バックアップ作業これを呼び出す側で処理
    ここを直接コールした場合はバックアップは実行されない
    ユーザメッセージはここでは処理されない
    
*/
NetworkRepository.prototype.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus.content != 'Active'){return false}
 //    カレントのtokenを添えてdestroyコマンドを発行する
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    
        //currentEntry.issues[0].cutID 
        // debug : change PATCH to PUT
if(dbg) console.log(currentEntry.issues[0].cutID);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'/discard',
		    success : function(result) {
		        currentEntry.issues.pop();
                xUI.resetSheet(new nas.Xps(5,144),new nas.Xps(5,144)) ;
                documentDepot.updateDocumentSelector();
//                documentDepot.rebuildList();
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });

}
//serviceAgent.currentRepository.destroyJob();
/**
サービスエージェントオブエジェクト

ログインするサーバを選んでログイン処理をする
ログイン情報を保持して
状態は offline/onnline/online-single の3状態
モードによっては機能が制限される
UI上モードを表示するシンボルが必要

servers ServiceNode
*/


serviceAgent = {
    servers     :[],
    repositories:[],
    currentStatus       :'offlline',
    currentServer       :null,
    currentRepository   :null,
};
/**
    サービスエージェントの初期化(テスト版)
 リポジトリの初期化は 最終的には作業記録とサーバからの受信情報でアプリケーション初期化のタイミングで組む
*/
serviceAgent.init= function(){
    this.servers=[]; //サーバコレクション初期化
    this.repositories=[localRepository]; //ローカルリポジトリを0番として加える
    if(
        (document.getElementById('backend_variables'))&&
        ($('#backend_variables').attr('data-user_token').match(/<%.+%>/))
    ){
        var myServers={
            UAT: {name:'U-AT',url:'https://u-at.net'},
            Srage:{name:'Stage',url:'https://remaping-stg.u-at.net'},
            devFront:{name:'devFront',url:'https://remaping.scivone-dev.com'},
            devFront2:{name:'devFront2',url:'https://uaf-alma.scivone-dev.com'},
        };
        for(svs in myServers){
            this.servers.push(
                new ServiceNode(myServers[svs].name,myServers[svs].url)
            );
        };
    }else if(
        (document.getElementById('backend_variables'))&&
        $("#backend_variables").attr("data-server_url")
    ){
//バックエンド変数にURLあり
        this.servers.push(new ServiceNode(
            "CURRENT",
            $("#backend_variables").attr("data-server_url")
        ));
    }else{
//現在のロケーションから取得
        var loc = String(window.location).split('/');//
        var locOffset = (loc[loc.length-1]=="edit")? 3:2;
        var myUrl = loc.splice(0,loc.length-locOffset).join('/');
        this.servers.push(new ServiceNode("CURRENT",myUrl));
    };
/*
    仮のサーバセレクタを設定
*/
    var mylistContents="";
    mylistContents +='<option selected value="-1" > +no server selected+';
    for(var ids=0; ids < this.servers.length;ids ++){
        mylistContents +='<option value="'+ids+((ids==0)? '" selected >':'" >')+this.servers[ids].name; 
    }
    document.getElementById('serverSelector').innerHTML = mylistContents;

//    var Home=new NetworkRepository("HOME",serviceA);
//    this.repositories.push(Home);
/**
    組んだリポジトリでリポジトリリストを更新する
    ローカルリポジトリはすべての状況で利用可能
*/
    var myContents="";
    myContents +='<option selected value=0> = local Repository =';
    for(var idr=1; idr < this.repositories.length;idr ++){
        myContents +='<option value="'+idr+'" >'+this.repositories[idr].name; 
    }
    document.getElementById('repositorySelector').innerHTML = myContents;

//    this.switchRepository(0);
    this.switchService(0);
//    this.currentServer = this.severs[0];//初期化時点のサーバは 最初のサーバ(U-AT);
}
/**
    ユーザ認証
カレントサービスを認証又は解除する

カレントサービスが"0:=no selected="の場合は,
単純にすべてのサービスからログアウトする

 */
serviceAgent.authorize=function(){
if(dbg) console.log("authorize!::");
    switch (this.currentStatus){
    case 'online-single':
        return false;
    break;
    case 'online':
        if(xUI.onSite){return 'online'};
//            this.currentServer     = null;
//            this.currentRepository = null;
            this.authorized(false);
        return 'offline';
    break;
    case 'offline':
    default:
        if(this.currentServer) this.currentServer.authorize();
        return 'online';
    }
}
/**
    認証/解除時の画面処理
*/
serviceAgent.authorized=function(status){
    if (status == 'success'){
        this.currentStatus = 'online';
//二回目以降のUI初期化時は ローカルリポジトリにフォーカスが移ってカレントサーバがないケースがあるので注意
          if(serviceAgent.currentServer){
            document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url.split('/').slice(0,3).join('/');//?
            document.getElementById('loginuser').innerHTML = document.getElementById('current_user_id').value;
            document.getElementById('loginstatus_button').innerHTML = "=ONLINE=";
            document.getElementById('login_button').innerHTML = "SIGNOUT";
            document.getElementById('serverSelector').disabled  = true;
          };//二度目以降の表示更新はサーバの切り替えが無い限り特に不用
    }else{
        this.currentStatus = 'offline';
            document.getElementById('serverurl').innerHTML = localize(nas.uiMsg.noSigninService);//?
            document.getElementById('loginuser').innerHTML = '';
            document.getElementById('loginstatus_button').innerHTML = "=OFFLINE=";
            document.getElementById('login_button').innerHTML = "SIGNIN";
            document.getElementById('serverSelector').disabled  = false;

        serviceAgent.switchRepository(0);//ローカルレポジトリセット
        serviceAgent.switchService();
        serviceAgent.init();
    }
}
/**
    サーバを切り替える
引数: myServer / Object ServiceNode
サーバ名・URL・ID またはキーワードで指定
キーワードと同名のサーバは基本的に禁止？
サーバにログインしていない場合は、各サーバごとの認証を呼ぶ
既にサービスにログインしている場合は、その認証を解除してから次のサービスを認証する

内部的にはともかくユーザ視点での情報の輻輳を避けるため サーバ/リポジトリを多層構造にせず 
リポジトリに対する認証のみをUIで扱う
リポジトリの切り替えに対してログイン/ログアウトを行うUI仕様とする。
サービスの切り替えは内部での呼び出しのみになるので引数は整理する
*/
serviceAgent.switchService=function(myServer){
    var newServer = null;
//引数とカレントのサービスが一致　切替不能（不用）
    if (myServer === this.currentServer){
        return myServer;
    }
    
    if((myServer instanceof ServiceNode )&&(myServer !== this.currentServer)) {
//引数がノードオブジェクト
        newServer = myServer;
    }else if((myServer >= 0)&&(myServer<this.servers.length)){
//引数がサーバID
        newServer = this.servers[myServer];
    }else if(myServer instanceof String){
//引数が文字列
        for (var ix = 0 ;ix < this.servers.length ; ix ++){
            if((myServer == this.servers[ix].url)||(myServer == this.servers[ix].name)){
                newServer = this.servers[ix];break;
            }
        }
    }
//オンラインであった場合は切替前にオフライン化して
//エントリリスト　クリア　ドキュメントセレクタ　リセット
    this.switchRepository(0);
    this.currentServer = newServer;
    sync();

return this.currentServer;
};
/**
    リポジトリを切り替える
    UIから直接呼び出されるのはこちら
    カレントのリポジトリを切り替え、
    リポジトリに関連付けられたサービスをカレントにする
    サービスが現在のログイン先と異なる場合も認証は実際のアクセスまで保留
    （解除前にもとのサービスに戻った際に再ログインを行わないため）
    引数は、現在のリポジトリID
    リポジトリIDは以下のように決定
    
    0:ローカルリポジトリ固定
    1~ 以降登録順　現在同時に処理できるサーバは１つ サーバ内のリポジトリは複数
    
     リポジトリ切替時にドキュメントリストの更新をバックグラウンドで行う
     
*/
serviceAgent.switchRepository=function(myRepositoryID,callback){
    if(this.currentRepository === this.repositories[myRepositoryID]){
        //同オブエジェクトに切り替える必要はないのでそのままリターン
        return this.currentRepository;
    }else{
    if(typeof myRepositoryID == 'undefined')  myRepositoryID = 0;
//切り替え前に現在のデータの状態を確認して必要ならば編集状態を解除　その後自身を再度呼び出し
    if((xUI.uiMode=='production')&&(xUI.XPS.currentStatus.content=='Active')){
//console.log("deactivate current document");
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
                serviceAgent.currentRepository.deactivateEntry(function(){
                serviceAgent.switchRepository(myRepositoryID,callback);
            });
        return;
}else{
        serviceAgent.currentRepository = serviceAgent.repositories[myRepositoryID];
        if((myRepositoryID > 0)&&(myRepositoryID<this.repositories.length)){
//            serviceAgent.currentServer=serviceAgent.currentRepository.service;
            serviceAgent.switchService(serviceAgent.currentRepository.service);
        } else {
//            serviceAgent.currentServer     = null;
//console.log('reset');console.log(serviceAgent.currentServer);
            //serviceAgent.switchService();
        };
}
        if(document.getElementById('repositorySelector').value != myRepositoryID){
            document.getElementById('repositorySelector').value　=　myRepositoryID;
        }
        if(callback instanceof Function){ callback(); }else{
//OPUSセレクタを停止
        document.getElementById( "opusSelect" ).disabled=true;
//ドキュメントセレクタを停止
        document.getElementById( "cutList" ).disabled=true;
        /*== ドキュメントリスト更新 ==*/
console.log("change repository :"+ myRepositoryID);
        serviceAgent.currentRepository.getProducts(function(){

                        documentDepot.getProducts();
                        documentDepot.currentProduct=null;
                        documentDepot.currentSelection=null;
                        documentDepot.updateOpusSelector();
                        documentDepot.updateDocumentSelector();
/*          for(var ix=0;ix<serviceAgent.currentRepository.productsData.length;ix ++){
            var myProduct = serviceAgent.currentRepository.productsData[ix];
            serviceAgent.currentRepository.getEpisodes(function(){
//                documentDepot.documentsUpdate();//クリア
//                for(var ex =0 ;ex < myProduct.episodes[0].length;ex++){
//                    var myEpisode = myProduct.episodes[0][ex];
//                    serviceAgent.currentRepository.getSCi(function(){},false,myEpisode.token);
//                }
 //             console.log(myEpisode.name);
                        documentDepot.getProducts();
                        documentDepot.currentProduct=null;
                        documentDepot.currentSelection=null;
                        documentDepot.updateOpusSelector();
                        documentDepot.updateDocumentSelector();
                    
            },false,myProduct.token);//getEpisode
          }
*/
        },false);//getProduct
        
//        this.currentRepository.getList()
//                documentDepot.updateDocumentSelector();
//            documentDepot.rebuildList(callback);
        }
    };
    sync('server-info')
    return this.currentRepository;
};
/**
    title-token  又は　episode-token が含まれるRepositoryをカレントに切り替えて返す
*/
serviceAgent.getRepsitoryIdByToken=function(myToken){
    var RIX=0;
    search_loop:
    for (var rix=1;rix<this.repositories.length;rix++){
        if(myToken==this.repositories[rix].token){
            RIX=rix;
            break search_loop;            
        }
        //リポジトリ内のプロダクトデータを検索（エントリ総当りはしない）
        for (var pix=0;pix<this.repositories[rix].productsData.length;pix++){
            if(myToken==this.repositories[rix].productsData[pix].token){
                RIX=rix;
                break search_loop;
            };
            for (var eix=0;eix<this.repositories[rix].productsData[pix].episodes[0].length;eix++){
                if(myToken == this.repositories[rix].productsData[pix].episodes[0][eix].token){
                    RIX=rix;
                    break search_loop;                    
                };
            };
        };
    };
    if(RIX)  {return RIX}else{return false}
    
};

/**
    引数を判定して動作を決定 カレントリポジトリの操作を呼び出す
    myIdentifier    カット識別子 完全状態で指定されなかった場合は、検索で補う
    isReference    リファレンスとして呼び込むか否かのフラグ 指定がなければ自動判定
    callback    コールバック関数指定が可能 コールバックは以下の型式で
    コールバックの指定がない場合は指定データをアプリケーションに読み込む
    コールバック関数以降の引数はコールバックに渡される
    リファレンス取得の際にアプリケーションステータスをリセットする場合があるので注意
    
    ネットワークリポジトリからエントリを取得の際コンテンツが空のケースがある。
    これはエントリ登録直後のデータで、アプリケーション上でタイトル/エピソードに従ったデータをさくせいる必要があるので注意
    
    リポジトリ共通の機能としてタイトル/エピソードからデフォルトプロパティの取得を行い、その後、各リポジトリごとに記述子による指定データのパースを行って新規データのビルドを行う。
*/
serviceAgent.getEntry=function(myIdentifier,isReference,callback,callback2){
if(dbg) console.log('getEntry ::' + decodeURIComponent(myIdentifier));
    if(typeof isReference == 'undefined'){isReference = false;}
    //識別子をパース
    var targetInfo = Xps.parseIdentifier(myIdentifier);
    var myIssue = false;
    var refIssue = false;

    var myEntry = serviceAgent.currentRepository.entry(myIdentifier);
    if(! myEntry){
if(dbg) console.log("noProduct : "+ decodeURIComponent(myIdentifier));//プロダクトが無い
        return false;
    }else{
//pmdbからプロダクトごとのデフォルト値を取得する

    };
    if(! targetInfo.currentStatus){
   //引数に管理部分がないので、最新のissueとして補う
        var cx = myEntry.issues.length-1;//最新のissue
        myIssue = myEntry.issues[cx];//配列で取得
    } else {
    //指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
        checkIssues:{
            for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
//if(dbg) console.log ( String(myEntry.issues[cx].identifier)+'\n'+String(myIdentifier));
//if(dbg) console.log ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier))
                if ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier) > 4){
                    myIssue = myEntry.issues[cx];
                    break checkIssues;
                };
            };
            if (! myIssue){
if(dbg) console.log( 'no target data :'+ decodeURIComponent(myIdentifier) );//ターゲットのデータが無い
                return false;
            };
        };
    };
//console.log(decodeURIComponent(myEntry.issues[cx].identifier));
    if((! isReference)&&(Xps.compareIdentifier(myEntry.issues[cx].identifier,Xps.getIdentifier(xUI.XPS)) > 3)){
console.log(decodeURIComponent(Xps.getIdentifier(xUI.XPS)))
console.log('ジョブ一致　ロードスキップ');
    };
//読み込み前に現在のデータの状態を確認して必要ならば編集状態を解除
//その後読み込み
//読込の前にカーソル位置を　1_0　にリセット
//参照読み込みに際しては、編集状態を維持
    if((! isReference ) && ( xUI.uiMode=='production' )&&( xUI.XPS.currentStatus.content=='Active' )){
//console.log("need deactivate");
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
            serviceAgent.currentRepository.deactivateEntry(function(){
                serviceAgent.currentRepository.getEntry(myIdentifier,isReference,callback,callback2);
                return;
/*
                serviceAgent.currentRepository.getEntry(myIdentifier,isReference,function(){
//console.log("get ");
                    sync('historySelector');
                    if (callback instanceof Function) callback();
}
*/
            },(callback2 instanceof Function)? callback2:function(result){
//error callback
            console.log(result);
        });
    }else{
        xUI.selectCell([1,0]);
//callbackの扱いを定形処理外のユーザ関数に変更
        this.currentRepository.getEntry(myIdentifier,isReference,
        (callback instanceof Function)? callback:null,
        (callback2 instanceof Function)? callback2:function(result){
//error callback
            console.log(result);
        });
    }
    if($("#optionPanelFile").is(':visible')) xUI.sWitchPanel('File');
};

/**
    ドキュメント操作メソッド群
    実行時に実際の各リポジトリに対してコマンドを発行して エントリのステータスを更新する
    ステータスによっては、ジョブ名引数を必要とする
    変更をトライして成功時／失敗時に指定のコールバック関数を実行する
    
    操作対象ドキュメントは、必ずUI上でオープンされている (xUI.XPS が対象)
    引数で識別子を与えることは無い
    
    activate(callback,callback2)
                Active > Active  例外操作 作業セッションの回復時のみ実行 データにチェック機能が必要
        ステータス変更なし
                Hold   > Active
                Fixed  > Active （Fixedの取り消し操作）
        ステータスのみ変更(カレントユーザのみが可能)
    
    deactivate(callback,callback2)
                Active > Hold
        現データをpush
        ステータス変更(カレントユーザのみが可能)
    
    checkin(ジョブ名,callback,callback2)
                Startup > Active
                Fixed   > Active

    checkout/fix/close(callback,callback2)
                Active  > Fixed
        現データをpush
        ステータス変更(カレントユーザのみが可能)
    

        引数としてJob名が必要
    
Abort > 最終JobのステータスをAbortに変更して保存する
ストレージタイプの場合、同内容でステータスの異なるデータを保存して成功時に先行データを削除して更新する
サービス型の場合は変更リクエストを発行して終了

この場合の違いを吸収するためにRepositry.changeStatus() メソッドを実装する
エントリステータスの変更は単純な変更にならない かつ リポジトリ通信先のデータ更新にかかわるのでエントリのメソッドにはしない

    checkin(開く)
Startup/Fixed/(Active) > Active
新規ジョブを開始

    checkout(fix)(閉じる)
Active > Fixed
カレントジョブを終了

    activate(再開)
Hold/Fixed > Active
カレントジョブの状態を変更
データをActiveにできるのは、updateユーザのみ

    deactivate(保留)
Acive > Hold   
カレントジョブの状態を変更

=================== ここまでproductionMode での操作
ドキュメントブラウザパネルの表示は
[ CHECKIN][CHECKOUT][ACTIVATE][DEACTIVATE]
[作業開始][作業終了][作業保留][作業再開]
となる
=================== 

    receipt(検収)
fixed > Startup
新規ステージを開始(管理者権限)

＊管理者権限での作業時はステータスの遷移を抑制する
=読み出してもactiveにならない？

    abort(中断)
*   > Aborted
エントリの制作を中断(管理者権限)
すべての状態から移行可能性あり

状況遷移を単純化するために、読み込まれていないデータの状況遷移を抑制する。
基本的にユーザのドキュメント操作の際に状況の遷移が自動で発生する。

プログラム上の手続きとして

リポジトリのステータス更新
ドキュメントリスト上のステータスを同期
バッファ上のデータのステータス同期
を上の順序で行う必要があるので注意

*/
/**
    現在のドキュメントをアクティベートする
    
*/
serviceAgent.activateEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.currentRepository.cut(currentEntry.toString());
    var currentCut   = this.currentRepository.cut(currentEntry.issues[0].cutID);
    if(! currentEntry) {
//console.log ('noentry in this repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
//console.log('activateEntry :'+decodeURIComponent(currentEntry.toString()));
//console.log(currentEntry);
//console.log(currentEntry.getStatus());
    switch (xUI.XPS.currentStatus.content){
        case 'Active':
/**     例外処理 ロストセッションの回復
    編集中に保存せずに作業セッションを失った場合 この状態となる
    また同一ユーザで編集中に他のブラウザからログインした場合も可能性あり
    ここに確認用のメッセージが必要
    checkinの手続内でここがコールされている？
*/
//console.log('recover acitivate');
            if(xUI.currentUser.sameAs(xUI.XPS.update_user)){
                var msg = localize(nas.uiMsg.alertAbnomalPrccs);
                msg += '\n'+localize(nas.uiMsg.dmPMrecoverLostSession);
                msg += '\n\n'+localize(nas.uiMsg.confirmOk);
               if(confirm(msg)){
                    xUI.setUImode('production');
//  必要があればここでリポジトリの操作（基本不用）
                    xUI.sWitchPanel();//パネルクリア
                    return true;
                }
            }
        break;
        case 'Aborted':case 'Startup':
            alert(localize(nas.uiMsg.dmAlertCantActivate));//アクティベート不可 
            //NOP return
            return false;
        break;
        case 'Hold':case 'Fixed':
            //ユーザが同一の場合のみ 再アクティベート可能(activate)
            //Fixed>Active の場合は、通知が必要かも
        if (xUI.currentUser.sameAs(xUI.XPS.update_user)){
//console.log('call repository.activateEntry :')
            this.currentRepository.activateEntry(callback,callback2);//コールバックはリレーする
            return true;
        } else {
            alert(localize(nas.uiMsg.dmAlertDataBusy));//ユーザ違い
            return false;
        }
        break;
    }
}
/**
    作業を保留する リポジトリ内のエントリを更新してステータスを変更
    ユーザ判定は不用
    現データの送信（保存）後にリスト更新とドキュメントブラウザの更新
*/
serviceAgent.deactivateEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.currentRepository.cut(currentEntry.toString());
    var currentCut   = this.currentRepository.cut(currentEntry.issues[0].cutID);
    if(! currentEntry) {
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
//console.log(currentEntry);
    var currentStatus=currentEntry.getStatus();
    switch (currentStatus.content){
        case 'Aborted': case 'Startup': case 'Hold': case 'Fixed':
            //NOP
//            if(dbg) console.log('fail deactivate so :'+ currentEntry.getStatus());
            alert(localize(nas.uiMsg.dmAlertCantDeactivate));//アクティブでない
            return false;
            break;
        case 'Active':
            //編集を確認して Active > Holdへ
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
            this.currentRepository.deactivateEntry(callback,callback2);
        break;
    }
}
/** 
    作業にチェックイン
    リポジトリ種別にかかわらないので
    このメソッド内でジョブ名称を確定しておく  
*/
serviceAgent.checkinEntry=function(myJob,callback,callback2){
//  ここで処理前にリストを最新に更新する
/*リストの更新では、ムダに待ち時間が長いので「エントリ情報の更新」に変更したい 後ほど処理　今は保留　０４２２*/
//    this.currentRepository.getList(true);
//console.log(Xps.getIdentifier(xUI.XPS))
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//console.log(currentEntry);
    var currentCut   = this.currentRepository.cut(currentEntry.issues[0].cutID);
//console.log(currentCut)
    if(! currentEntry){
        alert(localize(nas.uiMsg.dmAlertNoEntry));//対応エントリが無い
//        if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
    var currentStatus=currentEntry.getStatus();
    switch (currentStatus.content){
        case 'Aborted': case 'Active': case 'Hold':
            alert(localize(nas.uiMsg.dmAlertCheckinFail)+"\n>"+currentEntry.getStatus(myJob,callback,callback2));
            //NOP return
if(dbg) console.log('fail checkin so :'+ currentEntry.getStatus(myJob,callback,callback2));
            return false;
        break;
        case 'Fixed':case 'Startup':
            //次のJobへチェックイン
            //ジョブ名称を請求
            var title   = localize(nas.uiMsg.pMcheckin);//'作業開始 / チェックイン';
            var msg     = localize(nas.uiMsg.dmPMnewItemSwap,localize(nas.uiMsg.pMjob));
            //'新規作業を開始します。\n新しい作業名を入力してください。\nリストにない場合は、作業名を入力してください。';
//            var msg2    = '<br> <input id=newJobName class=mdInputText type=text list=newJobList></input><datalist id=newJobList>';
            var msg2    = '<br> <input type="text" list="newJobList" id=newJobName class=mdInputText  autocomplete=on ></input><datalist id="newJobList">';
//console.log(xUI.XPS.stage.name +","+ ((xUI.XPS.job.id == 0) ? 'primary':'*'));
//console.log(nas.pmdb.jobNames.getTemplate(xUI.XPS.stage.name,((xUI.XPS.job.id == 0) ? 'primary':'*')));
            var newJobList = nas.pmdb.jobNames.getTemplate(xUI.XPS.stage.name,((xUI.XPS.job.id == 0) ? 'primary':'*'));//ここは後ほどリポジトリ個別のデータと差替
//console.log(newJobList)
            for(var idx = 0 ; idx < newJobList.length;idx ++){
                msg2   += '<option value="';
                msg2   += newJobList[idx];
                msg2   += '">'+newJobList[idx]+'</option>';
            };
                msg2 += '</datalist>';
//console.log(msg);

//console.log(newJobList);
//console.log(msg2);
            nas.showModalDialog('confirm',[msg,msg2],title,false,function(){
                var newJobName=document.getElementById('newJobName').value;
                if((this.status == 0)&&(newJobName)){
                    serviceAgent.currentRepository.checkinEntry(newJobName,function(){
                        //成功時は現在のデータをリファレンスへ複製しておく
                        //putReference();　このタイミングで行うと　ステータス変更後のデータがリファレンスへ入るので　ダメ　各メソッド側に実装
//                        sync('productStatus');//ここで　ステータスの更新を行う
//                        sync('historySelector');//ここで　履歴セレクタの更新を行う
                        if(callback instanceof Function) callback();
                    },
                    function(){
                        alert(localize(nas.uiMsg.dmAlertCheckinFail));//チェックイン失敗
//                        sync('productStatus');//ここで　ステータスの更新を行う
//                        sync('historySelector');//ここで　履歴セレクタの更新を行う
                        if(callback2 instanceof Function) callback2();
                    });
                }
            });
        break;
    }
}
/**
    作業を終了する リポジトリ内のエントリを更新してステータスを変更
    ユーザ判定は不用
    現データの送信（保存）後にリスト更新とドキュメントブラウザの更新
*/
serviceAgent.checkoutEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//    var currentCut   = this.currentRepository.cut(currentEntry.toString());
    var currentCut   = (currentEntry.issues[0].cutID) ?this.currentRepository.cut(currentEntry.issues[0].cutID):this.currentRepository.cut(currentEntry.toString());
//console.log('checkoutEntry'+decodeURIComponent(currentEntry));
//console.log(currentEntry.toString(true));
//console.log(currentEntry.getStatus());
    if(! currentEntry) {
//console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
        alert(localize(nas.uiMsg.dmAlertNoEntry)+'\n>'+decodeURIComponent(currentEntry));//対応エントリが無い
        return false;
    }
    var currentStatus=currentEntry.getStatus();
    switch (currentStatus.content){
        case 'Startup': case 'Hold': case 'Fixed':
            //NOP
//            if(dbg) console.log('fail checkout so :'+ currentEntry.getStatus());
            alert(localize(nas.uiMsg.dmAlertCantCheckout));//作業データでない
            return false;
        break;
        case 'Active':
            //編集状態を確認の上　Active > Fixed
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
            //Jobチェックアウト
            //アサイン情報を請求
            //このあたりはアサイン関連のDB構成が済むまで保留　要調製
            var title   = localize(nas.uiMsg.pMcheckout);//'作業終了 / チェックアウト';
//            var msg     = localize(nas.uiMsg.dmPMnewAssign,xUI.XPS.cut);
var msg = localize({
  en:"\n",
  ja:"%1\n作業終了します\n"
},decodeURIComponent(Xps.getIdentifier(xUI.XPS)))
var checkd = '';
if (xUI.closeWindowAtCheckout == true) checkd = 'checked';
msg += "<input id=closeWindowAtCheckout type=checkbox onchange='xUI.closeWindowAtCheckout = this.checked' "+checkd+"><a href='javascript:document.getElementById(\"closeWindowAtCheckout\").checked=(document.getElementById(\"closeWindowAtCheckout\").checked)?false:true;'>ウインドウを閉じる</a></input>";
            var msg2    = '<br>';

            msg2   += localize(nas.uiMsg.toPrefix);
            msg2   += ' <input id=assignNextUser autocomplete=yes class=mdInputText type=text list=assignUserList></input> ';
            msg2   += localize(nas.uiMsg.toPostfix);
            msg2   += '<datalist id=assignUserList>';
            var assignUserList = ["演出","作画監督","監督","美術監督","美術","原画","動画","仕上","特効"];//ここは後ほどタイトル個別のデータを請求して差替
            for(var idx = 0 ; idx < assignUserList.length;idx ++){
                msg2   += '<option value="';
                msg2   += assignUserList[idx];
                msg2   += '"></option>';
            };
                msg2 += '</datalist><br>';
                msg2 += '<textarea id=assignNoteText class=mdInputArea >指名及び申し送りは開発中のダミー画面です。\n指名データを選択または入力して先に進めてください。</textarea>'

            nas.showModalDialog('confirm',msg,title,false,function(){
//            nas.showModalDialog('confirm',[msg,msg2],title,false,function(){
//                var assignUserName=document.getElementById('assignNextUser').value;
//                var assignNoteText=document.getElementById('assignNoteText').value;
                var assignUserName=true
                var assignNoteText="";
                if((this.status == 0)&&(assignUserName)){
                    var assignData=encodeURIComponent(JSON.stringify([assignUserName,assignNoteText]));
                    serviceAgent.currentRepository.checkoutEntry(assignData,function(){if(xUI.closeWindowAtCheckout.checked==true) window.close();},callback2);
//                        alert(localize(nas.uiMsg.dmAlertCheckoutFail));//チェックアウト失敗
                }
            });
        break;
    }
}
/**
     新規カットを追加登録
     現在のリポジトリに存在しないタイトル・エピソードを指定する場合は、必ずXpsオブジェクトを指定すること
     マネジメントモード下で引数無しで呼び出された場合に限り、ドキュメントブラウザの入力情報をベースに新規のエントリを作成する。
     その際は、規定のコールバック関数を利用して、指定のコールバックは使用されない
     引数なしのケースではデータ内容の指定は不可
     尺（識別子情報）のみ指定可能　最小テンプレートでカット番号のある空エントリのみが処理対象
     
     現在のTitle+Opus(product)の既存カットに対する衝突は排除
     
     初期状態の、ライン／ステージ／ジョブの指定が可能
     引数で与えられるXpsのステータスは、"Floating"である必要がある
*/
serviceAgent.addEntry=function(myXps,callback,callback2){
    if(!myXps){
//console.log(documentDepot);
         if(xUI.uiMode!='management')   return false;         
        var myIdentifier = documentDepot.buildIdentifier();
//console.log(decodeURIComponent(myIdentifier));
        var entryInfo = Xps.parseIdentifier(myIdentifier);
                myXps = new nas.Xps(5,entryInfo.time);
                myXps.title      = entryInfo.title;
                myXps.opus       = entryInfo.opus;
                myXps.subtitle   = entryInfo.subtitle;
                myXps.cut        = entryInfo.cut;
                myXps.createUser = xUI.currentUser;
                myXps.updateUser = xUI.currentUser;
                myXps.currentStatus =  new nas.Xps.JobStatus();
        var productIdf = Xps.getIdentifier(myXps,'product');
//新規エントリを判定
        if((String(myXps.cut).length==0)||(serviceAgent.currentRepository.entry(myIdentifier))){
            var msg = "";
            if (String(myXps.cut).length==0){
//console.log(String(myXps.cut));
                msg += localize(nas.uiMsg.alertCutIllegal);//"カット番号不正"
            }else{
                msg += localize(nas.uiMsg.alertCutConflict);//"カット番号衝突"
            }
            alert(msg+': can not addEntry');
            return false;
        }else{
//限定条件下なのでコールバックを規定値で行う
            serviceAgent.addEntry(myXps,function(){
                serviceAgent.currentRepository.getSCi(false,false,Xps.getIdentifier(myXps));
            },function(){
//console.log('error: addEntry')
            });
        };
        return;
    }else{
        var myIdentifier = Xps.getIdentifier(myXps);
//既存カットと一致(排除)
        if(this.currentRepository.entry(myIdentifier)){
            alert(localize(nas.uiMsg.alertCutConflict));
            return false;
        }

//既存プロダクトあり（プロダクト作成処理不用）
        if(this.currentRepository.entry(myIdentifier,true)){
            serviceAgent.pushEntry(myXps,callback,callback2);
        }else{
//既存のタイトルがあるか？あればエピソードのみ新作
//なければタイトルを作成後にエピソードを新作して処理続行
// confirmあり
            　var hasTitle = false;
            　var hasOpus  = false;
            　for (var pid=0;pid<documentDepot.products.length;pid ++){
            　   //productsのメンバをオブジェクト化したほうが良いかも
            　   var prdInfo=Xps.parseProduct(documentDepot.products[pid]);
            　   if(prdInfo.title== myXps.title) {
            　       hasTitle = documentDepot.products[pid];
            　       if(prdInfo.opus == myXps.opus) {hasOpus  = documentDepot.products[pid];break;}
            　   }
            　}
            　if((hasTitle)&&(! hasOpus)){
            　   var msg=localize({
            　       en:"The specified episode #%1[%2] is not registered in this sharing.\nwould you like to create a new episode #%1[%2]?\nTo change sharing please cancel once and try the procedure again.",
            　       ja:"この共有には指定の制作話数 #%1[%2] が登録されていません。\n新規に制作話数 #%1[%2] を登録しますか？\n共有を変更する場合は一旦キャンセルして手続をやり直してください。"},myXps.opus,myXps.subtitle);
            　   if(confirm(msg))
            　   serviceAgent.currentRepository.addOpus(myIdentifier,productIdf,function(){
            　       serviceAgent.pushEntry(myXps,callback,callback2);
            　   });
            　 }else if((! hasTitle)&&(! hasOpus)){
            　   var msg=localize({
            　       en:"The specified production %1#%2[%3] is not registered in this sharing.\nwould you like to create a new production %1#%2[%3]?\nTo change sharing please cancel once and try the procedure again.",
            　       ja:"この共有には指定された作品 %1#%2[%3] が登録されていません。\n新規に %1#%2[%3] を登録しますか？\n\n共有を変更する場合は一旦キャンセルして手続をやり直してください。"},myXps.title,myXps.opus,myXps.subtitle);
            　   if(confirm(msg))
            　   serviceAgent.currentRepository.addTitle(myXps.title,"","",function(){
            　       serviceAgent.currentRepository.addOpus(myIdentifier,myIdentifier,function(){
            　           serviceAgent.pushEntry(myXps,callback,callback2);
            　       });
            　   });
            　}else{
            　   serviceAgent.pushEntry(myXps,callback,callback2);
            　};
            　          
        };
    };
};
/**
     工程を閉じて次の工程を開始する手続き
     逆戻り不能なのでチェックを厳重に
     
*/
serviceAgent.receiptEntry=function(){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//    var currentEntry = (typeof myIdentifier == 'undefined')?this.currentRepository.entry(Xps.getIdentifier(xUI.XPS)):this.currentRepository.entry(myIdentifier);
    if(! currentEntry) return false;
    var currentStatus=currentEntry.getStatus();
//console.log(currentStatus);
    switch (currentStatus.content){
        case 'Startup': case 'Active': case 'Hold':case 'Floating':
console.log("not Fixed :"+currentEntry.toString());
            return false;
        break;
        case 'Fixed':
            //Fixedのみを処理
            var newStageList = nas.pmdb.stages.getTemplate(xUI.XPS.stage.name);
            var newJobList   = nas.pmdb.jobNames.getTemplate(xUI.XPS.stage.name);
            var title = localize(nas.uiMsg.pMreseiptStage);//'作業検収 / 工程移行';
            var msg   = localize(nas.uiMsg.dmPMnewStage);//'現在の工程を閉じて次の工程を開きます。\n新しい工程名を入力してください。\nリストにない場合は、工程名を入力してください。';
            var msg2  = '<br><span>'
                      + localize(nas.uiMsg.pMcurrentStage)
                      + ' : %currentStage% <br>'
                      + localize(nas.uiMsg.pMnewStage) + ' : '+ nas.incrStr(xUI.XPS.stage.id)
                      + ':</span><input id=newStageName type=text list=taragetStageList onChange="serviceAgent.updateNewJobName(this.value);"></input><datalist id=taragetStageList>';
                msg2　= msg2.replace(/%currentStage%/,xUI.XPS.stage.toString(true));
            for(var idx = 0 ; idx < newStageList.length;idx ++){
                msg2   += '<option value="';
                msg2   += newStageList[idx];
                msg2   += '"></option>';
            };
                msg2   += '</datalist>';
                msg2   += '<br><span>'
                       + localize(nas.uiMsg.pMnewJob) + ' : 0'
                       +':</span><input id=newJobName type=text list=taragetJobList ></input><datalist id=taragetJobList></datalist>';
            nas.showModalDialog('confirm',[msg,msg2],title,false,function(){
                var newStageName = document.getElementById('newStageName').value;
                var newJobName = document.getElementById('newJobName').value;
                if ((this.status == 0)&&(newStageName)&&(newJobName)){
                    //if(dbg) console.log([newStageName,newJobName]);
                    serviceAgent.currentRepository.receiptEntry(newStageName,newJobName);
                }
            });
            
        break;
    }
}
/**
    当該エントリの制作を中断する。
    以降は複製のみ可能となる
*/
serviceAgent.abortEntry=function(myIdentifier,callback,callback2){
    var currentEntry = (typeof myIdentifier == 'undefined')? this.currentRepository.entry(Xps.getIdentifier(xUI.XPS)):this.currentRepository.entry(myIdentifier);
//console.log(currentEntry)
    if(! currentEntry) return false;
    var currentStatus=currentEntry.getStatus();
//console.log(currentStatus)
    switch (currentStatus.content){
        case 'Startup':
        case 'Hold':
        case 'Active':
        case 'Floating':
            //管理モード下でのみ処理 このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
        case 'Fixed':
        default:
//console.log('serviceAgent abort entry');
            return this.currentRepository.abortEntry(myIdentifier,callback,callback2);
    }
    return currentStatus.content;
}
/**
    閉じる
    開いているエントリが、ActiveならばHoldに変更
    XPSをカラ（初期状態＝float）する
    ドキュメントの状態をFloatingにセット
    
    現状のドキュメントをフロート化する際はfloatEntryメソッドを使用

*/
serviceAgent.closeEntry=function(callback,callback2){
//ドキュメントがアクティブで変更フラグが立っている場合 holdしてカレントリポジトリにプッシュ
    if((xUI.XPS.currentStatus.content=="Active")&&(! xUI.isStored())){
//成功したらカレントドキュメントをクリアしてロック
        serviceAgent.currentRepository.deactivateEntry(function(){
            serviceAgent.closeEntry(callback,callback2);
        },function(){
//            xUI.errorCode=9;
            if(callback2 instanceof Function) callback2();
        });
    }else{
//新規ブランクシートを作成　
        xUI.resetSheet(
			new nas.Xps(
				xUI.XPS.sheetLooks,
				xUI.XPS.sheetLooks.PageLength
			),
			new nas.Xps(
				xUI.XPS.sheetLooks.trackSpec.find(function(e){return(e[0]=='reference')})[1],
				documentFormat.PageLength
			)
        );
        xUI.XPS.currentStatus= new nas.Xps.JobStatus("Floating");
        xUI.setUImode('floating');    
        if(callback instanceof Function) callback();
    };
}
/**
    フロート化
    ドキュメントを複製してFloating状態にする
    開いているエントリが、ActiveならばHoldに変更する
    XPSはそのままの状態でステータスをフロート化する
    レポジトリ上のエントリーは変更なし
    これは単純なエクスポートであり、管理情報はここで切れる
    uuidを新規に発行するほうが良いか？
*/
serviceAgent.floatEntry=function(callback,callback2){
    //  ドキュメントがアクティブで変更フラグが立っている場合　holdしてカレントリポジトリにプッシュ
     if((xUI.XPS.currentStatus.content=="Active")&&(! xUI.isStored())){
    //  成功したらカレントドキュメントをクリアしてロック
         serviceAgent.currentRepository.deactivateEntry(function(){
            serviceAgent.floatEntry();
        },function(){
//            xUI.errorCode=9;
            if(callback2 instanceof Function) callback2();
        }
        );
    }else{
        xUI.XPS.currentStatus.content='Floating';
        xUI.setUImode('floating');
        if(callback instanceof Function) callback();
    }
}
/**
    最終ジョブを破棄する（巻き戻し）
    現在のジョブ内容を、保存含めて破棄する
    破棄可能な条件は、
    現在作業中のジョブまたは作業可能なジョブであること（Activeドキュメントのみに適用）
    closeに手順がにているが、ハードデリートを伴う点が異なる
    ハードデリートを伴うため　バックアップコピーを作成して保険として使うべき
     
*/
serviceAgent.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus.content !="Active"){alert("this entry is not active.");return false;}
//ドキュメントがアクティブでない場合は操作不能
    var currentEntry = serviceAgent.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    var currentOpus  = serviceAgent.currentRepository.opus(currentEntry.toString(0));
//console.log(currentOpus)
    var currentWork = [
        xUI.XPS.line,
        xUI.XPS.stage,
        xUI.XPS.job       
    ].join("//"); 
    var msg=currentEntry.toString() + "\n" +localize({
        en:"%1 : Discard the current work and return it to the state of the previous work. Is it OK?",
        ja:"%1 : 現在の作業を廃棄して、一つ前の作業の状態にもどします。よろしいですか？"
    },currentWork);
    if(confirm(msg)){
//console.log('bkup');
        xUI.setBackup();//自動でバックアップをとる（undoではない）
        serviceAgent.currentRepository.destroyJob(function(){
            alert("destroyed job :" +currentWork);
            serviceAgent.currentRepository.getSCi(false,false,currentOpus.token);
            documentDepot.documentsUpdate();
//console.log(serviceAgent.currentRepository);
            alert(currentEntry.toString(1));
            serviceAgent.getEntry(currentEntry.toString(1),function(){
                xUI.setUImode("browsing");sync("productStatus");                
            })
        },function(result){
//console.log(result)
            alert("作業取り消しに失敗しました。");
        });
    }
}
/**
    選択可能な参考ジョブリストの更新
    更新されたリスト以外のジョブ名称も認められる
*/
serviceAgent.updateNewJobName=function(stageName,type){
    var targetList=document.getElementById("taragetJobList");
    if(! targetList) return false;
    for (var i = targetList.childNodes.length-1; i>=0; i--) {
        targetList.removeChild(targetList.childNodes[i]);
    }
    if(!type) type='init';
    var newJobList = nas.pmdb.jobNames.getTemplate(stageName,type);
    for(var idx = 0 ; idx < newJobList.length;idx ++){
        var option = document.createElement('option');
        option.id = idx;
        option.value = newJobList[idx];
        targetList.appendChild(option);
    };
//    if(dbg) console.log(newJobList);
}
//Test code
/**
    サーバエージェントを経由してリポジトリにデータを送出する
    保存データが最新のissueでない場合はリジェクト
    この場合はデータの更新があるかないかは問わない
    ステータスがFloatingの場合は、複製をとってStartup状態でプッシュする
*/
serviceAgent.pushEntry=function(myXps,callback,callback2){
//console.log('serviceAgent.pushEntry');
    if (typeof myXps == 'undefined') myXps = xUI.XPS;
    if((xUI.XPS === myXps)&&(xUI.sessionRetrace > 0)){
//        xUI.errorCode=8;//確定済データを更新することはできません
//        alert(localize(xUI.errorMsg[xUI.errorCode]));
        return false;
    }
    if (!( myXps instanceof Xps)){
        if(callback2 instanceof Function){callback2();}
        return false;
    }
    var newXps = new nas.Xps();
    newXps.parseXps(myXps.toString());
    
    if(myXps.currentStatus.content.indexOf('Floating')>=0){
/*プッシュ条件
タイトルが存在する、エピソードが存在する
カット番号がある
ユーザ情報が存在する
ここでユーザアサインメントを付加することが可能ーーー未実装　201802
*/
        var msg=localize({
        en:"Add the current cut: %1 :\nto the share : %2 :.\n Is it OK?",
        ja:"現在のカット: %1 :を\n共有: %2 :に追加します。\nよろしいですか？"
    },myXps.getIdentifier(),serviceAgent.currentRepository.name)
        // "TEST push Entry :"+myXps.getIdentifier();
        var go=confirm(msg);
        if(go){
/*  データステータスをチェック
    カレントタイトルがない場合は新作
    カレントのopusが無い場合は新作
    いずれも　コールバック処理渡し
    データステータスがFloatingなので、Startupへ変更
*/
       newXps.currentStatus = new nas.Xps.JobStatus('Startup');
        }else{
            return false;//処理中断
        }
    }
// console.log(newXps);
    this.currentRepository.pushEntry(newXps,callback,callback2);
}
/**

Repos.getProducts();//一度初期化する
if(dbg) console.log(Repos.productsData);
Repos.getList();

*/
/**
    入力テキストをパースしてカットを集計した配列を返す
    入力書式は別紙
*/
function parseCutText(sourceText){
    var sepChar      = '\t';//セパレータ初期値H-TAB
    var commentRegex = new RegExp('(#|;|//)');
    var cutRegex     = new RegExp('cut(#|＃|no\.|№)?','i');
    var timeRegex    = new RegExp('(time|duration|seconds|秒|時間|尺)','i');
    var sourceArray=sourceText.split('\n');
    var dataStartLine     = -1;
    var namePosition = -1;var timePosition= -1;
    
    for (var lid=0;lid<sourceArray.length;lid++){
        if(String(sourceArray[lid]).match(/^\s*$/)||String(sourceArray[lid]).match(commentRegex)){
            continue;
        }else{
            dataStartLine = lid;
            if(String(sourceArray[lid]).match(/,/)){sepChar = ','};
            var myFields = String(sourceArray[lid]).split(sepChar);
            for (var fid=(myFields.length-1);fid>=0;fid--){
                if(myFields[fid].match(cutRegex)) {namePosition=fid};
                if(myFields[fid].match(timeRegex)){timePosition=fid};
            }
            break;
        }
    }
// console.log(dataStartLine)
    
    if(namePosition==-1){
        namePosition=0;
        if(timePosition != -1){dataStartLine ++};
        timePosition=1;
    }else{
        dataStartLine ++;
    }

//console.log(dataStartLine)
    var resultArray=[];
    var cutName="";var cutTime="";
    var currentName="";var currentTime=0;
    
    for (var lid=dataStartLine;lid<sourceArray.length;lid++){
        if(String(sourceArray[lid]).match(/^\s*$/)||String(sourceArray[lid]).match(commentRegex)){
            continue;
        }else{
            var myFields = String(sourceArray[lid]).split(sepChar);
            cutName = (myFields[namePosition])? String(myFields[namePosition]) :currentName;
                if (cutName.match(/^"([^"]*)"$/)){cutName=RegExp.$1};//"
            cutTime = (timePosition < 0)? "":String(myFields[timePosition]);
                if (cutTime.match(/^"([^"]*)"$/)){cutTime=RegExp.$1};//"
                cutTime = parseInt(nas.FCT2Frm(decodeURI(cutTime)),10);
//            console.log(cutName+":"+currentName);
            if((cutName != currentName)&&(currentName.length>0)){
                resultArray.push([currentName,currentTime]);
                currentTime = cutTime;
            }else{
                currentTime+=cutTime;
            }
            currentName = cutName;
        }
    }
    resultArray.push([currentName,currentTime]);
    return resultArray;
}
// test
//sourceText="1,24\n2,48\n3,12\n,12";
/**
sourceText=([
"cut\tb\ttime\td\te",
"1\tX\t30\tA\tA",
"2\tW\t30\tA\tA",
"3\tZ\t30\tA\tA",
"\t''\t30\tA\tA",
]).join("\n");
sourceText=document.getElementById('data_well').value;
parseCutText(sourceText);
*/

/*
     インポート/エクスポートウェルに置いたカット登録テキストを識別子に変換して
     entryQueueを作成
     これを引数にしてpushEntryを順次コールする。
     
*/
    serviceAgent.entryQueue = [];
    serviceAgent.entryQueue.select = 0;

makeNewEntriesFromFormatedText=function(ix){
    if(typeof ix == 'undefined'){
        var sourceText=document.getElementById('data_well').value;
        serviceAgent.entryQueue = parseCutText(sourceText);
        for (var qid=0;qid<serviceAgent.entryQueue.length;qid++){
            var cutNo   = serviceAgent.entryQueue[qid][0];
            var cutTime = serviceAgent.entryQueue[qid][1];//整数化が済んでいるものとする
            if((String(cutNo).length > 0)&&(cutTime > 0)){
                // ビルドの際にXPSを参照するのはあまり良くない これは引数で与えるか、またはdocumentDepotのプロパティから取得する
                var myXps = new nas.Xps(5,cutTime);
                myXps.title     = xUI.XPS.title;
                myXps.opus      = xUI.XPS.opus;
                myXps.subtitle  = xUI.XPS.subtitle;
                myXps.cut       = cutNo;//sciはやく
                myXps.create_user = xUI.currentUser;
            }else{
                myXps=null;
            }
                serviceAgent.entryQueue[qid] = myXps;
        }
        serviceAgent.entryQueue.select = 0;//エントリ用のキューを初期化
        ix = 0;
    }
        //カット番号が空・カット尺が0　の場合は処理スキップ
        
//console.log("queue entry : "+ix);

        if(serviceAgent.entryQueue[ix]){
//console.log(serviceAgent.entryQueue[ix]);
//console.log(decodeURIComponent(Xps.getIdentifier(serviceAgent.entryQueue[ix])));
            serviceAgent.currentRepository.pushEntry(serviceAgent.entryQueue[ix],function(){
                serviceAgent.entryQueue.select ++;
                if(serviceAgent.entryQueue.select < serviceAgent.entryQueue.length){
                    makeNewEntriesFromFormatedText(serviceAgent.entryQueue.select);
                }else{
                    //終了
                    alert('エントリ終了だと思われるナリ :' + serviceAgent.entryQueue.select+"/"+serviceAgent.entryQueue.length)
                }
            });
        }else{
                 //エントリ不正の場合は、処理スキップ
                serviceAgent.entryQueue.select ++;
                if(serviceAgent.entryQueue.select < serviceAgent.entryQueue.length)
                    makeNewEntriesFromFormatedText(serviceAgent.entryQueue.select);
        }
};

//makeNewEntriesFromFormatedText();

/**
    プロダクトデータDB
object Pm.Title={
    token:token-string, //ローカルリポジトリのキー
    name:title-short-name,
    description:title-string,
    created_at:time-created,
    updated_at:time-updated,
    episodes:[[array of Pm.Opus]]
}
object Pm.Opus={
    token:token-string,
    name:opus-name
    description:opus-string-long(ex subtitle)
    created_at:time-created,
    updated_at:time-updated,
    cuts:[[array of SCi]]    
}
object Pm.SCi={
    token:token-string,
    name:opus-name
    description:entry-identifier-string,
    versions:[]    
}

object PM.SCiVersion={
    content:[line,stage,Job]
    updated_at:time-updated,
    description:entry-identifier-string,
    version_token:59    
}

productsData=[
{
    "token":"fTkqAmVz8ZEfrctW7JrrJ66g",
    "name":"mns2_r",
    "description":"モンスターストライク2",
    "created_at":"2017-01-20T09:42:30.000+09:00",
    "updated_at":"2017-01-20T11:59:02.000+09:00",
    "episodes":[
     [
      {
        "token":"CKmnhS6iu3Hw8Jh2nZyNBWtB",
        "name":"00",
        "description":"",
        "created_at":"2017-01-20T09:43:01.000+09:00",
        "updated_at":"2017-01-20T11:28:12.000+09:00",
        "cuts":[[
        {
            "token":"aDZn4cteVMUSvAsuJa3hmZGW",
            "name":"001",
            "description":"mns2_r#00//001",
            "versions":[]
        },
        {
            "token":"tCEpSnz9BanvwKrCdtqc5fSs",
            "name":"1",
            "description":"mns2_r#00//1",
            "versions":[]
        },
        {
            "token":"85c5q2NsNbdXmqkFrMS6jyJy",
            "name":"s-c2",
            "description":"mns2_r#00//s-c2//0%3A(undefined)//0%3A//0%3Aundefined//Fixed",
            "versions":[
            {
                "updated_at":"2017-01-20T11:52:12.000+09:00",
                "description":null,
                "version_token":59
            },
            {
                "updated_at":"2017-01-20T12:13:58.000+09:00",
                "description":"mns2_r#00//s-c2(144)//0%3A(undefined)//%3Aundefined//undefined%3ALO//Active",
                "version_token":115
            }]
        }]],
       }
      ]
     ]
    }
]
//listEntrオブジェクトプロパティ

object listEntry={
    dataInfo    : 識別子情報オブジェクト,
    parent      : リポジトリへの参照,
    product     : プロダクト識別子-encoded,
    sci         : 代表カット番号　-encoded,
    issues      : [[
        ライン情報　-encoded,
        ステージ情報-encoded,
        ジョブ情報　-encoded,
        ステータス　-encoded
    ]],
        issues[0].identifier :カット識別子,
        issues[0].time       :代表カット尺,
        issues[0].cutID      :DBアクセスキー,
        issues[0].versionID  :DBアクセスキー,
    titleID             : DBアクセスキー,
    episodeID           : DBアクセスキー
}

アクティブなカットがある状態で、カレントのリポジトリを切り替えると問題が発生するので対応を考えること
編集中のエントリをキャッシュするか、切替前のリポジトリをキャッシュ？
または　切替時にエントリを強制クローズ　＜　これで対処

リポジトリ切り替えのタイミングで強制的にアクティブなドキュメントをディアクティベートすることで処理

切り替えのタイミングでセレクタが使えなくなる（表示データの信頼性が無くなる）タイミングでセレクタを不活性化

データ更新が終了した時点で再活性化するように変更（済）

ネットワーク上でのDB更新にまだ問題あり　dev に適用して調整

*/