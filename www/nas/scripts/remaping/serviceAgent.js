/**
 *  @author kiyo@nekomataya.info (ねこまたや)
 *  @fileoverview ServiceAgent モジュール
 */
'use strict';
if(! xUI) var xUI = {};
if(! $) var $ = function(){};
if(! serviceAgent) var serviceAgent = {};
if(! config.dbg) config.dbg = true;

/*
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
    (ローカルリポジトリの上位にローカルストレージサービスを追加実装予定)
    FileStorageServiceを作成して、その配下にFileStoprageRepositoryを追加実装予定
    サービス群をサービスコレクションとして再実装予定

アプリケーションはリポジトリセレクタでリポジトリを選ぶ

リポジトリは、property pmdb を持ちアクセスに必要な情報を管理する

    リポジトリ分類
以下のような段階的な差を付けてアカウントを取得してもらう＋制作会社に対する有料サービスを販売しやすくしたい

    ローカルリポジトリ
オフライン作業用のサービス｜リポジトリ
常に使用可能、このリポジトリのデータは対応する作品を管理するサーバと同期可能にする？
作業中に認証を失ったり、ネットワーク接続が切れた作業はこのリポジトリに保存することが可能
サービスノード（サーバ）としてはダミーの値を持たせる
（作業バックアップ領域とは別 作業バックアップは常時使用可能）
ローカルリポジトリは容量が制限されるので保存できるカット数に制限がある（現在５カット 2016.11.15）
この部分は作業履歴や作業キャッシュとして扱うべきかも
履歴として扱う場合は、「最終5カットのリングバッファ」という風に

    ファイルストレージ
オフライン作業用のサービス｜リポジトリ
自サービスの管理するリポジトリの他にネットワークサービスまたは別のホストの管理するリポジトリのクローンを収容することが可能
ファイルストレージは、ファイルリポジトリを収容する

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

Repository.pmdb.orgnizations    リポジトリ内での組織情報
Repository.pmdb.users           当該リポジトリ内の基礎ユーザDB
Repository.pmdb.staff           同基礎スタッフDB（ここにユーザを含む必要はないツリー下位のDBが優先）
Repository.pmdb.lines           同ラインテンプレート（テンプレート  ツリー下位のDB優先）
Repository.pmdb.stages          同ステージテンプレート（同上）
Repository.pmdb.jobNames        同ジョブテンプレート  (同上)
Repository.pmdb.assets          アセット定義テーブル
Repository.pmdb.medias          同メディアテンプレート
Repository.pmdb.workTitles      作品タイトルコレクション
Repository.pmdb.products        プロダクトコレクション
Repository.pmdb.configration    アプリケーション動作設定

権利に対して  レイヤー構造がある
リポジトリは組織として  プロダクト（workTitle）を含む
プロダクト（workTitle）はエピソード（opus）に分割される
opusは制作話数であり、個々のドキュメント（pmunit）を含む

各ドキュメントはライン/ステージ/ジョブの構造を持つ

このアトリビュート毎・ユーザ毎に 権限が異なるケースがある

リポジトリ   *
プロダクト   *
各話        *
カット      *
ライン      *
ステージ    * 
ジョブ      *

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

サービスエージェントはこのまま拡張 pmdb,stbd,xMap,Xpstを統合する

*/
    if(! appHost.Nodejs){
        var localFilesystemService = null;
    }else{
/**
    ローカルファイルサービス LFS
    ローカルファイルリポジトリをサービスする専用のサービス

var localFilesystemService = {
	name:"localFilesystemService",
	url:'file://',
	root:,
	type:'localfilesystem',
	pmdb:new nas.Pm.PmDomain(nas.Pm,encodeURIComponent(".file://"+Folder.current.fsName)),
	bindTarget:null
}
初期状態でパスを空にするが、これは変更するのが前提
一旦変更した後は再初期化の際に最終パスへ自動で変更

*/
        var localFilesystemService = new ServiceNode(
            "localFilesystemService",
            'file:',
            'localfilesystem'
        );
        localFilesystemService.pmdb = new nas.Pm.PmDomain(
            nas.Pm,
            encodeURI(".file:")
        )
/**
    ローカルファイルサービス LFS 初期化
    引数でルートパスをnas.Fileで与える
    再初期化の場合もこのメソッドを呼ぶ
    @params {Object nas.File}   rootpath
*/
        localFilesystemService.init = function(rootpath){
            if(typeof rootpath == 'undefined') rootpath = '';
//console.log(typeof rootpath);
//console.log(rootpath instanceof nas.File);
            if(!(rootpath instanceof nas.File)&&(rootpath.length)) rootpath = new nas.File(rootpath);
//console.log(rootpath.fsName);
            if(fs.existsSync(rootpath.fsName)){
//console.log('exists')
                this.url = 'file://'+rootpath.fsName;
                this.root = rootpath
            }else{
//console.log('no exists')
                var LFSStatus = Folder.current.fsName+'/nas/lib/etc/localFilesystemStatus.json'
                if(fs.existsSync(LFSStatus)){
                    var statusContent = fs.readFileSync(LFSStatus,'utf-8');
                    if(statusContent) serviceAgent.setStatus(statusContent);
                }
            }
            return this;
        }
/**
    ローカルファイルサービス LFS 終了処理
    終了時のルートパスを保存する
    再初期化の場合もこのメソッドを呼ぶ
*/

        localFilesystemService.beforRestart = function(){
            var LFSStatus = Folder.current.fsName+'/nas/lib/etc/localFilesystemStatus.json'
            var fd = fs.openSync(LFSStatus,'w');
            fs.writeSync(fd,serviceAgent.getStatus('JSON'));
            fs.closeSync(fd);
        }
//  localFilesystemService.init();

/**
	ローカルパスを与えて指定フォルダ配下のpmdb|stbd|xmap|xpstのリストをタイムスタンプで逆順ソートして配列で返す
	type未指定の場合はpmdb
	指定パスに記録が存在しない場合は空配列を戻す
*/
        localFilesystemService.getListByPath = function(path,type){
            var result = [];
            if(! path) return null;
            if(! type) type = 'pmdb';//pmdb|stbd|xmap|xpst other extention
            var files = fs.readdirSync(path,{withFileTypes:true});
console.log(files);
            for (var ix = 0;ix < files.length;ix++){
                if(
                    (files[ix].isFile())&&
                    (files[ix].name.indexOf(type) == (files[ix].name.length-type.length))
                ) result.push(files[ix].name);
            };
            return result.sort().reverse();
        }
/**
	ローカルパスを与えてフォルダ配下のpmdb|stbd|xmap|xpstの内容をutf-8テキストで返す
	type未指定の場合はpmdb
	指定パスに記録が存在しない場合はnullを戻す
	最もタイムスタンプの新しいデータを返す
*/
        localFilesystemService.getContentByPath = function(path,type){
            var result = null;
            if(! path) return result;
            if(! type) type = 'pmdb';
            var list = localFilesystemService.getListByPath(path,type);
            if (list.length){
                return fs.readFileSync(list[0],{encoding:"utf-8"});
            }
            return result;
        }
/*TEST
    localFilesystemService.getListByPath(Folder.current.fsName,)
*/
/**
 * リポジトリを登録
 *
 *
 */
        localFilesystemService.setRepository = function(repositoryName){
            if(repositoryName.match(/^(\/|[a-zA-Z]?\\).*/)){
                var fd = new nas.File(repositoryName);
            }else{
                var fd = new nas.File(this.url+'/'+repositoryName);
            };
//スキームはfile:か？
            if(fd.scheme != 'file:') return false;
//ディレクトリが既存か？作成可能か？
//    var parent  = this.url
//    var entries = fs.readdirSync('/'+fd.body.slice(0,fd.body.length-1).join('/'),{withFileTypes:true});
            var entries = fs.readdirSync(new nas.File(this.url).fullName,{withFileTypes:true});
            var traget = entries.find(function(elm){return (elm.name == fd.name)});//同名のエントリ
            var settemplate = false;
            if (target){
//既存
                if(! target.isDirectory()) return false;//既存だがディレクトリではないので登録失敗
                if(fs.readdirSync(fd.fsName).findIndex(function(elm){return(elm.indexOf('_etc') == 0)}) <= 0) {
                    settemplate = true;//_etc フォルダが無いのでフラグを立てる
                }
            }else{
//存在しないので新規作成 テンプレートデータ複製フラグをたてる
                try{ fs.mkdirSync(fd.fsName);
                    settemplate = true;//_etc フォルダが無いのでフラグを立てる
                }catch(er){
                    return false;
                }
            }
//_etcフォルダを作ってテンプレート群コピー
            if(settemplate) this.setTemplate(fd.fullName,"repository");
//リポジトリオブジェクトを登録
            var repository = new FileRepository(fd);
            var clength = this.repositories.length;
            var nidx = this.repositories.add(repository,function(tgt,dst){return (tgt.url==dst.url)});
            var xidx = serviceAgent.repositories.add(this.repositories[nidx],function(tgt,dst){return (tgt.url==dst.url)});
            return serviceAgent.repositories[xidx];
        }

/**
 *  _etcフォルダを作成してテンプレート群を複製登録する
 *  @params {Sting} path
 *      ターゲットパス
 *  @params {String} type
 *      テンプレートのタイプ repository|title|episode|xmap
 */
localFilesystemService.setTemplate = function(path,type){
    var srcprefix = Folder.current.fullName + '/storage_templates';
    var templates={
    "repository":[
        {type:"makefolder",name:"_etc",description:"設定フォルダ"},
        {type:"copyfile",name:"_etc/_frame.png",description:"標準フレーム"},
        {type:"copyfile",name:"_etc/field_guide.png",description:"フィールドガイド"},
        {type:"copyfile",name:"_etc/field_guide_large.png",description:"大判フィールドガイド"},
        {type:"copyfile",name:"_etc/_xps.png",description:"タイムシート罫線"},
        {type:"copyfile",name:"_etc/gou.txt",description:"合成伝票テンプレート"}
    ],
    "title":[
        {type:"makefolder",name:"_etc",description:""},
        {type:"makefolder",name:"00_yaritori",description:""},
        {type:"makefolder",name:"01_genan",description:""},
        {type:"makefolder",name:"02_senario",description:""},
        {type:"makefolder",name:"03_conte",description:""},
        {type:"makefolder",name:"04_imageboard",description:""},
        {type:"makefolder",name:"05_settei",description:""},
        {type:"makefolder",name:"06_color",description:""}
    ],
    "episode":[
        {type:"makefolder",name:"_etc",description:""},
        {type:"makefolder",name:"_movie",description:""},
        {type:"makefolder",name:"_rash",description:""},
        {type:"makefolder",name:"00_yaritori",description:""},
        {type:"makefolder",name:"01_genan",description:""},
        {type:"makefolder",name:"02_senario",description:""},
        {type:"makefolder",name:"03_conte",description:""},
        {type:"makefolder",name:"04_imageboard",description:""},
        {type:"makefolder",name:"05_settei",description:""},
        {type:"makefolder",name:"06_color",description:""}
    ],
    "xmap":[
        {type:"copyfile",name:"__",description:""},
        {type:"makefolder",name:"_etc",description:""},
        {type:"makefolder",name:"_movie",description:""},
        {type:"makefolder",name:"0_0CT",description:""}
    ]
}
    for (var ix = 0 ; ix < templates[type].length ; ix++ ){
        if(templates[type][ix].type == 'copyfile'){
            var tgt = scrprefix + '/' + type + '/' + templates[type][ix].name;
            var dst = path+'/'+templates[type][ix].name;
            fs.copyFile(tgt,dst,function(err){console.log(err);});
        }else if(templates[type][ix].type == 'makefolder'){
            fs.mkdirSync(path + '/' + templates[type][ix].name);
        }
    }
}
/**
 *
 *
 *
 */
// localFilesystemService. = function(path,type){}
  }
/**
    ファイルリポジトリ
    ファイルシステムリポジトリ
    ファイルストレージを利用して稼働する
保存形式
マスターストレージ形式
	単独のファイルパスで初期化

function Repository(path){
リポジトリ名を初期化時点で与える
サービスはLFS固定（指定不要?）
パスは、nas.File に変換して収納

DB照合はオブジェクト作成後の初期化に保留

組織情報とリポジトリの結合は相互参照に留めるのでオブジェクトによる初期化は行わない
*/
function FileRepository(path){
	if((arguments.length >= 1)&&(typeof arguments[0] =='string')){
		path = new nas.File(path);
	}
    this.name     = path.name;//識別名称
    this.service  = localFilesystemService;//サービスオブジェクト参照(固定) 
    this.url      = path.fsName;//ローカルパスをuri形式で与える
	this.root     = path;//
    this.id       = nas.uuid();
    this.pmdb     = {};//初期化前は空オブジェクト
    this.mergeBuffer ;//マージ処理バッファ
    this.mergedIndex ;//マージ処理カウンタ
};
/*
	entryメソッド設定

    pmdbを検索して該当するエントリを返す
    リポジトリ汎用メソッド
    @mathod
    @params	{String}	myIdentifier
        データ識別子
    @params	{Number}	opt
        戻値指定オプション title|product|shot
    @returns	{Object}
        識別子に該当するSBShot(CUT)|SBxMap(CUTBag)|StoryBoard(StoryBoard)|PmDomain(pmdb)
        または title|product|shot情報
        データ照合に失敗した場合はnull
*/
FileRepository.prototype.entry = serviceAgent._entry;
/**
    自身を親サービスノードのリポジトリコレクションから
*/
/**
    pmdbをtoken|id検索して該当するエントリを返す
    リポジトリ汎用メソッド
    @mathod
    @params	{String}	targetToken
        データ識別子
    @returns	{Object}
        識別子に該当するSBShot(CUT)|SBxMap(CUTBag)|StoryBoard(StoryBoard)|PmDomain(pmdb)
        または title|product|shot情報
        データ照合に失敗した場合はnull
    
    issues他のプロパティは受取先で評価
    指定の識別子との比較は
    title,opus,scene,cut の４点の比較で行う(秒数とサブタイトルは比較しない)
    optを加えるとtitle,opus(= product)のみを比較
    現在カットが０（未登録）の登録済みプロダクトの場合  true/-1 false/0 を戻す
    トークンでの検索専用
    タイトル・エピソード等の名称で(括弧くくり)または*のみのエントリはすべてのエントリとマッチしない仕様を追加
*/
FileRepository.prototype.entryByToken = serviceAgent._entryByToken;
/**<pre>
    ファイルリポジトリの初期化手続き
    同期処理を完了して非同期処理をローンチしたタイミングでtrueを返す。
    リポジトリのpmdbを取得してそこに含まれるworkTitles/productsから基本のブラウズリストを作成する。
    リポジトリ内にpmdbが存在しない場合はシステムのpmdbの内容をコピーしたデフォルトpmdbを作成して
    fileRepository.pmdbをセットする（ここでは保存しない）
    初期化手続き内でセットアップしたpmdbはデータ取得後にpush(保存)
    初期化済みフラグはpmdbが{}からオブジェクトであるか否かで判定
</pre>
*/
FileRepository.prototype.init=function(){
    if(Object.keys(this.pmdb).length > 0) return 'TRUE';//初期化済みの場合は二度目を行わない
//リポジトルートのpmdbをチェックする
//存在しない場合にはストレージ内を検索して構築
    this.service.repositories.add(this);
    this.pmdb       = new nas.Pm.PmDomain(this.service,['',this.service.url,this.id].join('.'));
    this.pmdb.token = nas.uuid();
//ファイルを取得する
//保存データを検索
//<name>.<timestamp>.pmdb ファイルを収集してタイムスタンプでソート
    var pmdbStream = this.service.getContentByPath(this.root.fullName+'/_etc' , "pmdb");//リポジトリ一致 タイプ指定
    if(pmdbStream){
//保存されたpmdbが存在するので読み出す　タイムスタンプも取得
        this.pmdb.parseConfig(pmdbStream);
    }else{
//保存されたファイルが存在しない
        this.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this.pmdb);;
        this.pmdb.products   = new nas.Pm.OpusCollection(this.pmdb);;
    }
    this.updatePMDB();
        return true;
}
/**
 * リポジトリにプロダクト（タイトル|エピソード）を登録
 *  @parms {String} entryName
 *      '<title>#<epNo>'
 *  @returns {Object}
 *      エントリーに成功したファイルパスを含むエントリーオブジェクト WorkTitel|Opus
 *  タイトルのみを作成することができる
 *  エピソードを作成するには 'momotaro#02'のようにタイトルを与える
 *  未作成のタイトルは自動で作成される
 *  いずれのケースでも既存のエントリは処理スキップ
 */
FileRepository.prototype.setProduct = function(entryName){
    if((typeof entryName == 'undefined')||(String(entryName).length <= 0)) return false;
//console.log('badArguments');
//エントリ名分解
    var product = nas.Pm.parseProduct(entryName);
//タイトルが空の場合、処理中断
    if(! product.title) return false;
//タイトルパス取得
    var titlepath = new nas.File(this.root.fullName +'/'+ product.title);
//スキームはfile:か？
    if(titlepath.scheme != 'file:') return false;
//ディレクトリが既存か？作成可能か？
    var entries = fs.readdirSync(this.root.fullName,{withFileTypes:true});
    var traget = entries.find(function(elm){return (elm.name == titlepath.name)});//同名のエントリ
    var settemplate = false;
    if (target){
//既存
        if(! target.isDirectory()) return false;//既存だがディレクトリではないので登録失敗
        if(fs.readdirSync(titlepath.fsName).findIndex(function(elm){return(elm.indexOf('_etc') == 0)}) <= 0) {
            settemplate = true;//_etc フォルダが無いのでフラグを立てる
        }
    }else{
//存在しないので新規作成 テンプレートデータ複製フラグをたてる
        try{fs.mkdirSync(titlepath.fsName);settemplate = true}catch(er){return false}
    }
//_etcフォルダを作ってテンプレート群コピー
    if(settemplate) this.setTemplate(titlepath.fullName,"title");
//タイトルオブジェクトを登録(メソッドに振る)

//エピソードが指定されていればエピソード処理
    var productpath = titlepath.fullName + '/' + product.opus;
    if(product.opus){
        entries = fs.readdirSync(titlepath.fullName,{withFileTypes:true});
        traget = entries.find(function(elm){return (elm.name == productpath.name)});//同名のエントリ
        settemplate = false;
        if (target){
//既存
            if(! target.isDirectory()) return false;//既存だがディレクトリではないので登録失敗
            if(fs.readdirSync(productpath.fsName).findIndex(function(elm){return(elm.indexOf('_etc') == 0)}) <= 0) {
                settemplate = true;//_etc フォルダが無いのでフラグを立てる
            }
        }else{
//存在しないので新規作成 テンプレートデータ複製フラグをたてる
            try{fs.mkdirSync(productpath.fsName);settemplate = true}catch(er){return false}
        }
//_etcフォルダを作ってテンプレート群コピー
        if(settemplate) this.setTemplate(productpath.fullName,"episode");
//プロダクトオブジェクトを登録(メソッドに振る)
    }
}
/*
    ファイルストレージのキー値は、以下の構造で　キープレフィックスとデータ識別部と含む
info.nekomataya.remaping.dataStore
.localStorage
.fileRepository
.00000
.%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E3%82%84%E3%81%BE
#0%3APilot[%E9%96%8B%E7%99%BA%E3%83%86%E3%82%B9%E3%83%88%E3%83%87%E3%83%BC%E3%82%BF]
//s-c26(192)
//0%3A(%E6%9C%AC%E7%B7%9A)
//0%3Alayout
//0%3Ainit
//Startup
.1586996954559
.xpst

    <keyprefix>
    .<server>    *
    .<repository-name>    *
    .<repository-idf>    *
    .<TITLE>
    #<OPUS>
    //<SCI>
    //<LINE>
    //<STAGE>
    //<JOB>
    //<STATUS>
    .<timestamp>    *
    .<datatype>        *

*印は省略のケースあり

        キープレフィックス部　固定値
    info.nekomataya.remaping.dataStore
        キープレフィックスごとキーをパースできるように
        
    データ識別部に、ステータス・タイムスタンプ情報を含むため、
    キー値を無条件でユニークキーとして使用することはできない
    ユニークキーの抽出条件
    pmdb|stbd    キー値から.<timestamp>を除いた値
    xmap        キー値から//<SCI>-<timestamp>を除いた値
    xpst        キー値から.<timestamp>を除いた値

*/
/**
 *  pmdbを更新するリポジトリメソッド
 *  リポジトリpmdb内の workTitles,products テーブルを更新する
 *  リポジトリpmdb内の productsのエントリ(xmaps contents) テーブルを更新する
 *  ストレージ内のデータエントリをサーチしてタイムスタンプを照合
 *  テーブルのタイムスタンプよりも新しいデータが有れば関連テーブルを更新する
 *  更新の発生したタイトルのエピソードを更に更新するか？
 */
FileRepository.prototype.updatePMDB = function(){
//ファイルストレージの全データを検査 pmdbのタイムスタンプと比較して大きなもののデータを取得してpmdb更新する
    var keyCount=localStorage.length;
    var timestampCash = 0;
    var updated = {
            'pmdb'      :false,
            'workTitles':false,
            'products'  :false
        }
    for (var kid=0;kid<keyCount;kid++){
        var currentWorkTitle;
        var currentProduct;
        var currentIdentifier;
        var dataInfo;
//キープレフィックスの有無でデータを選別
        if(localStorage.key(kid).indexOf(this.baseStorage.keyPrefix)!=0) continue;
//Idf取得して情報をパース
        currentIdentifier=localStorage.key(kid).slice(this.baseStorage.keyPrefix.length);
//console.log(decodeURIComponent(currentIdentifier));
        dataInfo=nas.Pm.parseIdentifier(currentIdentifier);
//エントリがタイムスタンプをもち かつ pmdbと同じかより古い場合はすべて処理スキップ
        if((dataInfo.timestamp)&&(dataInfo.timestamp <= this.pmdb.timestamp)) continue;
//変更フラグを立ててタイムスタンプの最新データをキャッシュ
        if(! updated.pmdb ) updated.pmdb = true;
        if((dataInfo.timestamp)&&(dataInfo.timestamp > timestampCash)) timestampCash = dataInfo.timestamp;
//データエントリの所属タイトルとエピソードを文字列で取得
        var titleStr = (dataInfo.title instanceof nas.Pm.WorkTitle)?
            dataInfo.product.title : dataInfo.title;//文字列
        var epStr    = (dataInfo.opus instanceof nas.Pm.Opus)?
            dataInfo.product.opus  : dataInfo.opus;//文字列
//識別子から得たタイトルがpmdb.workTitlesに登録されているかを検査 未登録エントリの場合　新規に登録
        currentWorkTitle = this.pmdb.workTitles.entry(titleStr);//取得
        if(! currentWorkTitle){
//タイトルDB内に該当データがないので登録を行いdataInfoを更新
            var newTitle   = new nas.Pm.WorkTitle(titleStr);//タイトル作成
            newTitle.id    = nas.uuid();
            newTitle.token = localStorage.key(kid);//初回ヒットのエントリをタイトルtokenにする
//fileRepositoryの場合 タイトル・エピソードのトークンはpmdbのトークンを使用する様に調整
//この時点ではトークンが存在しないので注意
            newTitle.pmdb  = new nas.Pm.PmDomain(
                fileRepository,
                fileRepository.pmdb.dataNode+dataInfo.product.title
            );
            newTitle.pmdb.token     = "";//未保存のためトークンをクリア
            newTitle.pmdb.timestamp = 0;//タイムスタンプをリセット
            var res = this.pmdb.workTitles.addMembers(newTitle);
            if(res.length > 0){
                dataInfo.title = newTitle;
                currentWorkTitle = res[0];// pmdb prop
            }else{
//異常処理　このケースで追加に失敗することはほぼない
                currentWorkTitle = this.pmdb.workTitles.entry(titleStr);
                dataInfo.title = workTitle;
            }
        }else if(titleStr){
//タイトル既存なのでオブジェクトを取得
            currentWorkTitle = this.pmdb.workTitles.entry(titleStr);
        }else{
//エントリーがリポジトリpmdbデータである場合等 タイトルデータを持たないケースも有る
            currentWorkTitle = null;
        }
//DB変更フラグ
        if((currentWorkTitle)&&(! updated.workTitles )) updated.workTitles = true;
//識別子から得たエピソードがprodoctworkTitle.opusesに登録されているか検査
//未登録エントリの場合 新規に登録
        if((epStr)&&(currentWorkTitle)){
            currentProduct = currentWorkTitle.opuses.entry(epStr);
            if(! currentProduct){
//console.log('detect newEpisode : '+ titleStr+'#'+epStr);
                currentProduct = new nas.Pm.Opus(
                    [titleStr,epStr].join('#'),
                    dataInfo.uniquekey,
                    epStr,
                    dataInfo.subtitle,
                    currentWorkTitle
                );
                currentProduct.pmdb = new nas.Pm.PmDomain(
                    currentWorkTitle,
                    currentWorkTitle.pmdb.dataNode+'#'+epStr
                    );
                currentWorkTitle.opuses.addMembers(currentProduct);
                fileRepository.pmdb.products.addMembers(currentProduct);
            }
            if(! currentProduct.stbd) currentProduct.stbd = new nas.StoryBoard(titleStr+'#'+epStr);
        }else{
//エントリーがプロダクトデータを持たないケースも有る
            currentProduct = null;
        }
//DB変更フラグ
        if((currentProduct)&&(! updated.products )) updated.products = true;

        switch(dataInfo.type){
        case 'pmdb':
//pmdbエントリ ターゲットを特定
/*
fileRepositoryの場合は以下の５対象レベルを末端側から解決
    //title#ep    エピソード
    //title        タイトル
    .server.*    リポジトリ
    .server        サーバレベル
    .            ルートレベル
*/
            var targetPMDB;
            if(currentProduct){
                targetPMDB = currentProduct.pmdb;
            }else if(currentTitle){
                targetPMDB = currentTitle.pmdb;
            }else if(dataInfo.dataNode.token){
                targetPMDB = this.pmdb;
            }else{
                targetPMDB = nas.Pm.pmdb;//　これは一時的な上書き
            }
            targetPMDB.parseConfig(localStorage.getItem(localStorage.key(kid)));
            if(this.pmdb !== targetPMDB) targetPMDB.timestamp = dataInfo.timestamp;
            this.pmdb.timestamp  = dataInfo.timestamp;
        break;
        case 'stbd':
//stbdエントリ
            currentProduct.stbd.parseScript(localStorage.getItem(localStorage.key(kid)));
            currentProduct.stbd.timestamp = dataInfo.timestamp;
        break;
        case 'xmap':
//xmapエントリ
            var myShot = currentProduct.stbd.entry(dataInfo.sci[0].toString('cut'));
            if(myShot){
//既存エントリxmapの兼用数を比較して未登録エントリを追加する　エントリ過多の場合はワーニング
                var myxMap = myShot.xmap;
                if(myxMap.inherit.length > dataInfo.sci.length){
                    console.log('bad data exists :');console.log(dataInfo);
                };//and NOP
            }else{
//新規エントリをstbdに追加
//あらかじめキャリアとなるmyXmapを作成（ショットのリンク無しで先行作成）
                var myXmap = new nas.StoryBoard.SBxMap(
                  currentProduct.stbd,dataInfo.inherit.join('/')
                );
                myXmap.token     = localStorage.key(kid);
                if(dataInfo.timestamp) myXmap.timestamp = dataInfo.timestamp;//timestamp転記
                if(dataInfo.mNode)     myXmap.writeNode(dataInfo.mNode);//ノード書込
// nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
                for (var s = 0; s < dataInfo.sci.length ; s ++){
                    if(currentProduct.stbd.entry(dataInfo.sci[s].toString('cut'))){
                        continue;//ここで既存エントリをskip
                    }
                    var newClmn = new nas.StoryBoard.SBColumn(currentProduct.stbd,0);
                    newClmn.indexText = dataInfo.sci[s].cut;
                    newClmn.timeText  = dataInfo.sci[s].time;
                    var newShot = new nas.StoryBoard.SBShot(currentProduct.stbd,dataInfo.sci[s],[newClmn]);
                    var added   = currentProduct.stbd.edit('add',newShot);//単純追加
                };
            };
        break;
        default:
    if (currentProduct){
//xpst entry
//console.log('detect cut :'+dataInfo.sci);
            var myShot = currentProduct.stbd.entry(dataInfo.sci[0].toString('cut'));
            if(myShot){
//stbd内に既存エントリあり(=ｘMapも登録済み) xMapに管理ノードを追加
//console.log('\t\tupdate Entry :'+myShot.name);console.log(myShot);//追加情報書き込み
                var currentxMap = myShot.xmap;
//console.log(
                myShot.writeNode(dataInfo.mNode,localStorage.key(kid));
//);console.log(
                currentxMap.writeNode(dataInfo.mNode);
//);
                if((! myShot.timestamp)||(dataInfo.timestamp > myShot.timestamp)){
//既存ショットのタイムスタンプを比較して大きい方で更新する
//タイムスタンプが書き換わる際にShot.tokenを同時に更新
                    myShot.timestamp = dataInfo.timestamp;
                    myShot.token     = localStorage.key(kid);
                }
//console.log(myShot);
            }else{
//nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
//console.log('\tset Entry :'+dataInfo.sci);//追加情報書き込み
               var newClmn = new nas.StoryBoard.SBColumn(currentProduct.stbd,0);
                newClmn.indexText = dataInfo.sci[0].cut;
                newClmn.timeText = dataInfo.sci[0].time;
                var newShot = new nas.StoryBoard.SBShot(currentProduct.stbd,dataInfo.sci[0],[newClmn]);
                var shotCount = currentProduct.stbd.contents.length;
                var added   = currentProduct.stbd.edit('add',newShot);//単純追加
//console.log('add Entry');console.log(added[0])
//console.log(dataInfo.mNode);
                    added[0].writeNode(dataInfo.mNode,localStorage.key(kid));
                    added[0].timestamp = dataInfo.timestamp;
                    added[0].token     = localStorage.key(kid);
                    added[0].xmap.writeNode(dataInfo.mNode);
            }
    }else{
console.log(dataInfo);
console.log('no currentProduct continue');
    }
        }
        continue;
    };
//タイムスタンプの最新データでpmdbのタイムスタンプを置き換え
    if(updated.pmdb)       this.pmdb.timestamp = timestampCash;
    if(updated.workTitles) this.pmdb.workTitles.timestamp = timestampCash;
    if(updated.products)   this.pmdb.products.timestamp = timestampCash;
};//fileRepository.updatePMDB

/**
 *  リポジトリのデータノードを返す
 *  returns {String}
 *      data node address  .<serverURL>.<repositoryName>.<repositoryID>//
 */
FileRepository.prototype.toString = function(){
    return ['',this.url,this.name,'00000'].join(".")+'//';
}

/**<pre>
    プロダクト(タイトル)データを更新
    リポジトリ内のデータを取得してタイトル一覧を得る
    リポジトリpmdbが得られない場合、エントリ内容からビルドして保存
    ビルドした場合に、エピソード更新を呼び出す

    タイトル一覧をクリアして更新する エピソード更新を呼び出す

    取得したデータを複合して、サービス上のデータ構造を保持する単一のオブジェクトに
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得するように変更
    引き続きの処理を行う際はコールバック渡し
    コールバックがない場合は、全プロダクトの詳細を取得？
    プロダクトデータ取得のみの場合は  空動作のコールバックを渡す必要あり
    myToken 引数がある場合はtokenが一致したエントリのみを処理する
    myToken は配列でも良い
    </pre>
    @params  {Array}   myToken
        強制的に更新するタイトルのトークン配列
 */
FileRepository.prototype.getProducts=function(myToken){
console.log(myToken);
        if(typeof myToken == 'undefined') myToken =[];
        if(!(myToken instanceof Array)) myToken = [myToken];
//pmdbにworkTitles/productsが存在するか否かをチェック ない場合は新規作成
        if (
            (fileRepository.pmdb.contents.indexOf('workTitles') < 0)&&
            (fileRepository.pmdb.contents.indexOf('products') < 0)
        ){
console.log(fileRepository.pmdb.dump('dump'));
console.log(fileRepository.pmdb.dataNode);
console.log(fileRepository.pmdb.contents);
console.log('----------------------------------------------------------------------------------clear TitleDB');console.log(fileRepository.pmdb.dump('dump')); // */
            fileRepository.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this);
            fileRepository.pmdb.contents.add('workTitles');
            fileRepository.pmdb.products = new nas.Pm.OpusCollection(this);
            fileRepository.pmdb.contents.add('products');
        }
        var workTitles = fileRepository.pmdb.workTitles;
        var products = fileRepository.pmdb.products;
        var productsData = fileRepository.baseStorage.productsData;
        for(var t = 0 ; t < myToken.length ; t ++ ){
//処理済みのプロダクトはスキップ
            if(products.entry(myToken[t])) return ;
        }
        for (var d=0 ; d<productsData.length ; d++){
//Idf取得
            var currentTitle = productsData[d];
            var currentIdentifier=currentTitle.token.slice(fileRepository.baseStorage.keyPrefix.length);
            var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
            var titleStr = (dataInfo.title instanceof nas.Pm.WorkTitle)? dataInfo.product.title:dataInfo.title;
            if(!(workTitles.entry(titleStr))){
//タイトルDB内に該当データがない	自動的に登録してdataInfoを更新
//console.log('newTitle');
//                var newTitle = (dataInfo.title instanceof nas.Pm.WorkTitle)?dataInfo.title:new nas.Pm.WorkTitle();
                var newTitle = new nas.Pm.WorkTitle();
                newTitle.projectName = dataInfo.product.title;
                newTitle.id          = nas.uuid();
                newTitle.fullName    = dataInfo.product.title;
                newTitle.shortName   = dataInfo.product.title;
                newTitle.code        = dataInfo.product.title;
                newTitle.framerate   = new nas.Framerate();

                newTitle.name   = newTitle.projectName;
                newTitle.token  = productsData[d].token;
                newTitle.pmdb   = productsData[d].pmdb;
                var res = workTitles.addMembers(newTitle);
                if(res.length == 0){
                    var workTitle = workTitles.entry(titleStr);// pmdb prop
                    dataInfo.title = workTitle;
                }else{
                    dataInfo.title = newTitle;
                    var workTitle = res[0];// pmdb prop
                }
            }else{
                var workTitle = workTitles.entry(titleStr);// pmdb prop
            }
//エピソードDB内に該当データがない 自動登録
            for(var e = 0 ; e < currentTitle.episodes.length ; e ++){
                var epsd  = currentTitle.episodes[e][0];
                if(! epsd) continue;
                var epIdf = epsd.token.slice(fileRepository.baseStorage.keyPrefix.length);
                var epInf = nas.Pm.parseIdentifier(epIdf);
console.log(decodeURIComponent(epIdf));
console.log(epInf);
                if(
                    (!(workTitle.opuses.entry(epInf.product.title+'#'+epInf.product.opus)))
                ){
                	var newEpisode = new nas.Pm.Opus();
                    newEpisode.productName = workTitle.name+'#'+epInf.product.opus ;//
                    newEpisode.id          = nas.uuid()          ;//
                    newEpisode.name        = epInf.product.opus         ;//
                    newEpisode.subtitle    = epInf.product.subtitle     ;//
                    newEpisode.title       = workTitle                  ;//
//console.log('add pmdb/stbd for :'+newEpisode.productName);
                    newEpisode.token       = epsd.token                 ;
//                    newEpisode.pmdb        = Object.create(workTitle.pmdb);
                    newEpisode.pmdb        = epsd.pmdb;
                    newEpisode.stbd        = epsd.stbd;
//                    newEpisode.stbd        = new nas.StoryBoard(newEpisode.productName);

                    var resp = workTitle.opuses.addMembers(newEpisode);
                    products.addMembers(newEpisode);
                    var storyBoard = resp[0].stbd;
console.log(epsd);
console.log(decodeURIComponent(epIdf));
console.log(epInf);
console.log('------------------------ xmap entry add to stbd')
//entryList内のxmapを先行して登録する
                    for(var ex = 0;ex < this.baseStorage.entryList.length;ex ++){
                        if(this.baseStorage.entryList[ex].dataInfo.type != 'xmap') continue;
                        if(nas.Pm.compareIdentifier(epIdf,this.baseStorage.entryList[ex].issues[0].identifier,false,false) < 0) continue;
                        var xmapEntry = this.baseStorage.entryList[ex];
console.log(xmapEntry);
//あらかじめキャリアとなるxmapを作成（ショットのリンク無しで先行作成）
                        var xmap = new nas.StoryBoard.SBxMap(storyBoard,xmapEntry.dataInfo.inherit.join('/'));
                        xmap.timestamp = xmapEntry.dataInfo.timestamp;
/*	nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入*/
                        for (var s = 0; s < xmapEntry.dataInfo.sci.length ; s ++){
                            if(storyBoard.entry(xmapEntry.dataInfo.sci[s].toString('cut'))){
                                continue;//ここで既存エントリをskip
                            }
                            var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                            newClmn.indexText = xmapEntry.dataInfo.sci[s].cut;
                            newClmn.timeText = xmapEntry.dataInfo.sci[s].time;
                            var newShot = new nas.StoryBoard.SBShot(storyBoard,xmapEntry.dataInfo.sci[s],[newClmn]);
                            var added   = storyBoard.edit('add',newShot);//単純追加
if(added[0].xmap !== xmap){console.log([added[0].xmap,xmap])}
//console.log('add Entry');console.log(added[0].xmap.nodeChart);//追加情報
console.log(xmapEntry);console.log(xmapEntry.dataInfo.sci[s].name);
console.log(xmapEntry.dataInfo.mNode);
//通常識別子に取得可能なデータノードがない
                            if(xmapEntry.dataInfo.mNode) added[0].xmap.writeNode(xmapEntry.dataInfo.mNode);//test
                            added[0].xmap.token = xmapEntry.issues[0].cutID;
                        };//
                    };//SBxMap setup こちらを先行
console.log('xmap entry count = '+ storyBoard.xmaps.length);

console.log(epsd.cuts[0]);

//entryList内のタイムシートを順次登録
//xmap登録により先行で登録されたショットを検出して情報の上書きを行う必要あり
                    for(var c = 0 ; c < epsd.cuts[0].length ; c ++){
                        var cut    = epsd.cuts[0][c];
                        var cutIdf = cut.token.slice(fileRepository.baseStorage.keyPrefix.length);
                        var cutInf = nas.Pm.parseIdentifier(cutIdf);

console.log(decodeURIComponent(cutIdf));

                      if(cutInf.type == "xpst"){
/*Xps*/
console.log(cutInf);
console.log(cut);
//既登録ショットを検出
                        var myShot = storyBoard.entry(cutInf.sci[0].name);
                        if(myShot){
//既登録なのでトークンを書込み
//                          myShot.xmap.writeNode(cutInf.mNode);
//                          myShot.token = cut.token;
                        }else{

//未登録 nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
                          var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                          newClmn.indexText = cutInf.sci[0].cut;
                          newClmn.timeText = cutInf.sci[0].time;
                          var newShot = new nas.StoryBoard.SBShot(storyBoard,cutInf.sci[0],[newClmn]);

                          var added   = storyBoard.edit('add',newShot);//単純追加
                          myShot = added[0];
console.log('add Entry');console.log(added[0]);//追加情報書き込み
console.log(cutInf.mNode);
                        }
//                            console.log(added[0].xmap.writeNode(cutInf.mNode));//test
                          myShot.xmap.writeNode(cutInf.mNode);
//                            added[0].token=currentIdentifier;
                          myShot.token = cut.token;
                          for(var v = 0 ; v < cut.versions.length ; v ++){
/*バージョンをノードチャートに書き込み*/
                            var version = cut.versions[v];
                            var versionInf = nas.Pm.parseIdentifier(version.description);
                            myShot.xmap.writeNode(versionInf.mNode);
                          };//shot versions loop
                        
                      };
                    };//SBShot loop
                    storyBoard.sortContents();
                };//
            };//episodes loop
        };//baseStorage.Products loop
//        if(callback instanceof Function) callback();
/*    }catch(err){
console.log('#### detect entry error###');
console.log(err);
//        if(callback2 instanceof Function)callback2();
    };// */
//console.log(products.dump());
console.log('------------------------------------------converted fileRepository baseStorage to pmdb|stbd');console.log(this.pmdb.dump('dump'));

    return this;
}
/**<pre>
    ファイルリポジトリの　opus(episode)データを取得更新
    @params     {Function}  callback
        成功コールバック
    @params     {Function}  callback
        失敗コールバック
    @params     {String}    myProductToken
        対象タイトルのトークン
    @params     {Array}     myOpusToken
        強制的に更新するエピソードのトークン配列
myOpusToken 引数がある場合は、引数で制限された処理を行う
pmdb/stbd取得はここでは行わない。

*/
FileRepository.prototype.getEpisodes=function(callback,callback2,myProductToken,myOpusToken){
console.log('getEpisodes for title :'+decodeURIComponent(myProductToken));
    var allOpus =false
    if(typeof myOpusToken == 'undefined'){
        myOpusToken = [];//トークン配列
        allOpus     = true;
        var entryDB = this.baseStorage.title()
        var myProduct = this.pmdb.workTitles.entry(myProductToken);
 console.log(myProduct);
        if(! myProduct){console.log('process stop'); return false;}
        for (var ops in myProduct.opuses){
            myOpusToken.push(myProduct.opuses[ops].token);
        }
    }
    if(!(myOpusToken instanceof Array)) myOpusToken = [myOpusToken];
//console.log(myOpusToken);
//console.log(documentDepot.currentProduct);
    try{
        var myProduct=fileRepository.title(myProductToken);
        var keyCount     = localStorage.length;
//console.log(myProduct);
        for (var kid = 0;kid < keyCount; kid++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
//エントリーがpmdb|stbdであった場合、処理スキップ
                if((dataInfo.type=='pmdb')||(dataInfo.type=='stbd'))　continue;
                if(
                    ((dataInfo.title instanceof nas.Pm.WorkTitle)&&
                    (dataInfo.title.sameAs(myProduct.name)))||
                    (dataInfo.title == myProduct.name)
                ){
//console.log(dataInfo);
//タイトル違いを排除
//OPUSリストにすでに登録されているか検査 未登録エントリはDBに追加 tokenは初出のkey
                    var currentOpus = this.opus(currentIdentifier);
//console.log(currentOpus);
// (dataInfo.opus==currentOpus.name) 同一判定式
                    if((! currentOpus)||((myOpusToken.indexOf(localStorage.key(kid)) >= 0))){
                        if((! myOpusToken.length)||(myOpusToken.indexOf(localStorage.key(kid)) >= 0)){
console.log('add Episode :'+dataInfo.product.title+'#'+dataInfo.product.opus);
                            var Ex = myProduct.episodes[0].push({
                                token:localStorage.key(kid),
                                name:dataInfo.product.opus,
                                description:dataInfo.product.subtitle,
                                created_at:null,
                                updated_at:null,
                                pmdb:new nas.Pm.PmDomain(myProduct,dataInfo.product.title+'#'+dataInfo.product.opus+'//'),
                                stbd:new nas.StoryBoard(dataInfo.product.title+'#'+dataInfo.product.opus),
                                cuts:[[]]
                            });
                            currentOpus = myProduct.episodes[0][Ex-1];
                            if(callback instanceof Function){
                                callback();
                            }else{
console.log('get SCi for :'+currentOpus.name);
                                fileRepository.getSCi(false,false,currentOpus.token);
                            }
                        }
                    }
                }
            }
        }
//エピソード１取得毎に実行したほうが良いかも？
//このままだと必ずタイトル内の全エピソード取得になる
        if(callback instanceof Function){ callback();}   
    } catch(err) {
        console.log(err);
        if(callback2 instanceof Function){ callback2();}
    }
}
/**
    エピソード毎にカットリストを取得
    エピソード詳細の内部情報にコンバート
    xmapエントリに対しては、カットのエントリーと別にxmap専用のエントリを置く

    @params {Function}  callback
        成功コールバック
    @params {Function}  callback2
        失敗コールバック
    @params {String}    myOpusToken
        ターゲットの話数キー(トークン)
    @params {String}    pgNo
          リストのページID  1 origin
    @params {String}    ppg
          ページごとのエントリ数
        現在、pgNo,ppgは意味を持たない引数
 */
FileRepository.prototype.getSCi=function (callback,callback2,myOpusToken,pgNo,ppg){
    try{
        var myProduct = nas.Pm.parseIdentifier(myOpusToken.slice(this.keyPrefix.length)).product;
        var storyBoard = this.pmdb.products.entry(myProduct.title+'#'+myProduct.opus).stbd;
        var myOpus = this.opus(myOpusToken);
        var currentEpisode = this.pmdb.products.entry(myOpusToken);
        if(! myOpus){console.log('noOpus');return false;};//旧DBの検索
        var keyCount=localStorage.length;
        for (var kid = 0; kid < keyCount; kid ++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
//対象外データをスキップ
                if((myOpus.name != dataInfo.product.opus)||(dataInfo.type=='pmdb')||(dataInfo.type=='scbd')) continue;
//xmapデータの場合inheritをチェックしてバルクのカットを同時に登録する（xpstとどちらが先でも障害の出ないように作る）
                if(dataInfo.type == "xmap"){
/*新処理*/
                    var myShot = storyBoard.entry(dataInfo.sci[0].toString('cut'));
                    if(myShot){
//既存エントリxmapの兼用数を比較して未登録エントリを追加する　エントリ過多の場合はワーニング
                        var myxMap = myShot.xmap;
                        if(myxMap.inherit.length > dataInfo.sci.length){
                            console.log('bad data exists :');console.log(dataInfo);
                        };//and NOP
                    }
                    for (var sx = 0; sx < dataInfo.sci.length ; sx ++){
                        if(storyBoard.entry(dataInfo.sci[sx].toString('cut'))){
                            continue;//ここで既存エントリをskip
                        }
                        var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                        newClmn.indexText = dataInfo.sci[sx].cut;
                        newClmn.timeText = dataInfo.sci[sx].time;
                        var newShot = new nas.StoryBoard.SBShot(storyBoard,dataInfo.sci[sx],[newClmn]);
                        var added   = storyBoard.edit('add',newShot);//単純追加
                        added[0].xmap.token = localStorage.key(kid);//
                    }
//旧処理
                    var newEntry = new listEntry(
                        currentIdentifier,
                        null,
                        null,
                        localStorage.key(kid)
                    );
                    newEntry.parent = this;
                    this.entryList.put(newEntry);
                    continue;
                };
//xMapデータを検出の際の処理は特になし（データを開いた際に処理が多い）
                var myCut = this.cut(currentIdentifier);
                var currentEntry= this.entry(currentIdentifier);

                var myShot = storyBoard.entry(dataInfo.sci[0].toString('cut'));

                if(myShot){
//絵コンテのショットを確認して処理スキップ
//    ショットに対応するSBxMapに識別子から得たノードを追加（マージ）する
                    var currentxMap = myShot.xmap;
                    currentxMap.writeNode(dataInfo.mNode);
                    myShot.token = localStorage.key(kid);//
                }else{
                    var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                    newClmn.indexText = dataInfo.sci[0].cut;
                    newClmn.timeText = dataInfo.sci[0].time;
                    var newShot = new nas.StoryBoard.SBShot(storyBoard,dataInfo.sci[0],[newClmn]);
                    var added   = storyBoard.edit('add',newShot);//単純追加
                        added[0].token=localStorage.key(kid);
                }
                if(myCut){
                //登録済みカットなのでissues追加
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
//console.log(currentIdentifier);
                    }
                }else{
                //未登録カット  新規登録
                //エントリが既に登録済みなので不整合 消去
                    if(currentEntry){
                        currentEntry.remove();
                    }
                    myOpus.cuts[0].push({
                        token:localStorage.key(kid),
                        name:dataInfo.cut,
                        description:currentIdentifier,
                        created_at:null,
                        updated_at:null,
                        versions:[{
                            updated_at:null,
                            description:currentIdentifier,
                            version_token:localStorage.key(kid)
                        }]
                    });
                    var myCut=myOpus.cuts[0][myOpus.cuts[0].length-1];
                //未登録新規プロダクトなのでエントリ追加
                    //ここにファイルストレージのキーIDを置く  タイトルとエピソードの情報取得キーは現在エントリなし
                    //初出エントリのキーか？  0524
                    var newEntry = new listEntry(
                        currentIdentifier,
                        null,
                        null,
                        localStorage.key(kid)
                    );
                    newEntry.parent = this;
                    this.entryList.put(newEntry);
//                    this.entryList.push(newEntry);
                };
            };
        };
        if(callback instanceof Function){ callback();}   
    } catch(err) {
console.log(err)
        if(callback2 instanceof Function){ callback2();}
    }
}
/**
    ファイルリポジトリにエントリを追加
    引数:Xps|xMap|PmDomain|StoryBoard|PmDCオブジェクト
    与えられたオブジェクトから識別子を自動生成

    識別子にkeyPrefixを追加してこれをキーにしてデータを格納する
    ここでステータスの解決を行う？
    キーが同名の場合は自動で上書きされるのでクリアは行わない
    エントリ数の制限を行う
    エントリ数は、キーの総数でなく識別子の第一、第二要素を結合してエントリとして認識する

    xMapの識別子は、マルチラインステータをサポート

    引数オブジェクトをXpsのみからXps|xMap|PmDomain|SrotyBoardの自動判別に拡張

*/
FileRepository.prototype.putEntry = function(entryData,callback,callback2){
    var msg='';
    if(
        ((entryData instanceof Xps)||(entryData instanceof xMap))&&
        (((! entryData.pmu)&&(String(entryData.cut).match(/^\s*$/)))||
        ((entryData.pmu)&&(entryData.pmu.cut.match(/^\s*$/))))
    ){
//xps|xmap かつデータ識別情報が無い
        msg += localize({
            en:"you can't save entry without cutNo.",
            ja:"カット番号のないエントリは記録できません。"
        });
    };
    if(
        ((entryData instanceof Xps)&&(entryData.currentStatus.content.indexOf('Floating')>=0))||
        ((entryData instanceof xMap)&&(entryData.pmu)&&(entryData.pmu.nodeManager.currentStatus)&&
        (entryData.pmu.nodeManager.currentStatus.content.indexOf('Floating')>=0))
    ){
//エントリステータスがfloating   statusにfloatingが消滅したためこのコードは不要
        msg += '\n'+localize({
            en:"you can't save entry of Flating status.",
            ja:"Floatingエントリは記録できません。"
        });
    }
    if(msg.length){
        alert(msg);
        return false;
    };

if((entryData instanceof Xps)||(entryData instanceof xMap)){
//Xps|xMap 識別子取得
    var myIdentifier = nas.Pm.getIdentifier(entryData);//
//識別子に相当するアイテムがファイルストレージ内に存在するかどうかを比較メソッドで検査
    for (var pid=0;pid<this.entryList.length;pid++){
        if(nas.Pm.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > 3){
//既存のエントリが有るのでストレージとリストにpushして終了
            try{
                this.entryList[pid].push(myIdentifier);
                localStorage.setItem(this.keyPrefix+myIdentifier,entryData.toString());
                if ((xUI.XMAP === entryData)||(xUI.XPS === entryData)){
                    xUI.setStored('current');
                    xUI.sync();
                }
            }catch(err){
                if(callback2 instanceof Function){callback2();}                
            }
            xUI.sync();
            documentDepot.updateDocumentSelector();
            if(callback instanceof Function){callback();}
            return this.entryList[pid];
        };
    };
// console.log(entryData)
//console.log("既存エントリなし :追加処理");
//既存エントリが無いので新規エントリを追加
//設定制限値をオーバーしたら、警告する。  OKならばファイルストレージから最も古いエントリを削除して実行
/*
        エントリ上限設定を　カット数・管理単位数で別に制御する
        stbd.contents
        localStrage.entryCountメソッドを作成して呼び出すのが良い
*/
    try{
        if ( this.entryList.length >= this.maxEntry ){
            var msg=localize({en:"over limit!\n this entry will remove [%1]\n ok?",ja:"制限オーバーです!\nこのカットを登録するとかわりに[%1]が消去されます。\nよろしいですか？"},decodeURIComponent(this.entryList[0].toString()));
            if(confirm(msg)){
                for (var iid=0; iid < this.entryList[0].issues.length ; iid++ ){
                    localStorage.removeItem( this.keyPrefix + this.entryList[0].issues[iid].identifier );
                };
                this.entryList[0].remove();//アイテムメソッドで削除
                localStorage.setItem(this.keyPrefix+myIdentifier,entryData.toString());
                this.entryList.put(new listEntry(myIdentifier));//Collectionメソッドで追加
            }
        }else{
            localStorage.setItem(this.keyPrefix+myIdentifier,entryData.toString());
        }
    }catch(err){
//console.log(err);
        if(callback2 instanceof Function){callback2();}                
    }
    xUI.sync();
    documentDepot.updateDocumentSelector();
    if(callback instanceof Function) callback();
}else if(entryData instanceof nas.Pm.PmDomain){
    var Idf = nas.Pm.getIdentifier(entryData);
    localStorage.setItem(this.keyPrefix+Idf,entryData.dump('JSON'));

}else if(entryData instanceof nas.StoryBoard){
    var Idf = nas.Pm.getIdentifier(entryData);
    localStorage.setItem(this.keyPrefix+ Idf,entryData.toString());
}else if(entryData instanceof nas.Pm.PmDataCash){
    var Idf = encodeURIComponent(entryData.title.projectName) +'#'+ encodeURIComponent(entryData.opus) +'.pmdc';
    localStorage.setItem(this.keyPrefix+ Idf,entryData.toString());
    
}
    return this.entryList[this.entryList.length-1];
}

/**
 *   識別子を引数にしてリスト内を検索
 *    一致したデータをファイルストレージから取得してコールバックに渡す
 *    コールバック関数が与えられない場合は
 *    xpst|xmapの場合　xUI.documents.setContent()に渡す
 *    pmdbの場合 ルート|リポジトリ|タイトル|エピソード それぞれにロード サーバのpmdbは、親サービスをたどって渡す
 *    stbdの場合 該当エピソードにロード
 *
 *    xmapの場合 識別子の管理情報はあっても無視する
 *    xpstの場合 識別子に管理情報があればそのデータを、なければ最も最新のデータを処理対象にする
 *  isRerference フラグはxpstのケースのみ有効　立っている場合は、xUI.referenceXpsのデータをセットしてXPS編集バッファをリセットする
 *   引数にstbdエントリ(SBShot|SBxMap) を拡張 検索を省略してトークンキーをもとにコンテンツを取得する
 *
 *  @params  {String}    identifier
 *      読み出しデータ識別子|ターゲット登録オブジェクト
 *  @params  {Boolean}   isReference
 *      リファレンス読み出しフラグ(xpstエントリ専用　他のリクエストに対しては無効)
 *  @params  {Function}  callback
 *      コールバック関数
 *  戻値 不定
 */
FileRepository.prototype.getEntry=function(identifier,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
//識別子をパース
    var targetInfo = nas.Pm.parseIdentifier(identifier);
    var myIssue = false;
    var refIssue = false;
    var matchLevel = 1;//CUT
    if(targetInfo.type == 'pmdb'){
//pmdbのマッチレベルは可変　ルート、リポジトリ（共有）、タイトル、エピソード　の各段階があるので、それを識別する
// .<server>.<repository-name>.<repository-id>//<title>#<opus>//~.<timestamp>.<type>
        if(targetInfo.product.opus){
            matchLevel = 0;//product = episode
        }else if(targetInfo.product.title){
            matchLevel = -1;//title
        }else if(targetInfo.dataNode.repository){
            matchLevel = -2;//repository
        }else if(targetInfo.dataNode.server){
            matchLevel = -3;//server
        }else{
            matchLevel = -4;//root
        }
    } else if(targetInfo.type == 'stbd'){
        matchLevel = 0;//product
    }
    var myEntry = this.entryList.getByIdf(identifier,matchLevel,true,false);//第三引数でタイプを限定するのでコレは暫定コード
//エントリを指定の際にpmdb,stbdを求めることがあるのでカット一致レベルに固定してはならない
//タイプは限定　タイプによって一致レベルが変わる
    if(! myEntry){
        return null;
    }
if((targetInfo.type == 'xmap')||(targetInfo.type == 'xpst')){
    if(targetInfo.type == 'xpst'){
//この処理が必要なのはxpstエントリのみ　xmap エントリにissue概念は不要だが便宜上isses[0]にエントリのキーを置く
        if(! targetInfo.status){
//引数に管理部分がないので、最新のissueとして補う
            var cx = myEntry.issues.length-1;//最新のissue
            myIssue = myEntry.issues[cx];//配列で取得
        } else {
//指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
            checkIssues:{
                for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
                    if ( nas.Pm.compareIdentifier(myEntry.issues[cx].identifier,identifier) > 4){
                        myIssue = myEntry.issues[cx];
                        break checkIssues;
                    }
                }
                if (! myIssue){
console.log( 'no target data :'+ decodeURIComponent(identifier) );//ターゲットのデータが無い
                    return false;
                }
            }
        }
    }else{
        myIssue = myEntry.issues[0];
    }
//issues処理
// 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
// ソースデータ取得
console.log("readIn localStarge data : " + decodeURIComponent(myIssue.identifier));
    var documentSource = localStorage.getItem(this.keyPrefix+myIssue.identifier);
// console.log(callback);
//識別子を再結合してもキーが得られない場合があるのでエントリから対応キーの引き出しを行う
}else{
//pmdb|stbd
	var documentSource = localStorage.getItem(myEntry.issues[0].identifier);//エントリのidfをつかってデータを取得
}

    if(documentSource){
        if(callback instanceof Function){
            if((targetInfo.type == 'xpst')||(targetInfo.type == 'xmap'))
                documentSource = serviceAgent.overwriteProperty(documentSource,fileRepository.toString(),'REPOSITORY');
            callback(documentSource);
            return true;
        }
        if(! isReference){
//xpst以外はリポジトリ内のリビジョン管理がないのでそのままレスポンスを処理する
            if(targetInfo.type == 'pmdb'){
//pmdb
/*
pmdbはデータノードによる管理が行われる
識別子にはデータノード前置詞がつく　データノード指定のないものはタイトル｜エピソード
    エピソード用 pmdb     　.serverURL.repositoryName.repositoryIDF//TITLE#ep[subtitle]//.pmdb
    タイトル用 pmdb       //TITLE//.pmdb
    リポジトリ用 pmdb     //.pmdb
*/
                var targetName=targetInfo.product.title+'#'+targetInfo.product.opus;
                var target = serviceAgent.currentRepository.opus(targetName);
                if(! target){
                    target = serviceAgent.currentRepository.title(targetName);
                }
                if(! target){
                    target = fileRepository;
                }
                target.pmdb.parseConfig(documentSource);
                return false;
            }else if(targetInfo.type == 'stbd'){
//stbd
                var targetEpisode = serviceAgent.currentRepository.opus(targetInfo.product.title+'#'+targetInfo.product.opus);
                if(targetEpisode) targetEpisode.stbd.parseScript(documentSource);
                return false;
            }else{
//xpst|xmap
                documentSource = serviceAgent.overwriteProperty(documentSource,fileRepository.toString(),'REPOSITORY');
console.log('set Content'+this.toString());
//console.log(documentSource);//ここの設定で無限ループに落ちる
//識別が必要 識別はxUI.documents　自身に置く
				var setIndex = xUI.documents.setContent(documentSource,true);
                if(setIndex >=0 ){
                    xUI.setUImode('browsing');
                    if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
                };
            }
            return true;
        } else if(targetInfo.type=='xpst'){
            xUI.setReferenceXPS(documentSource);
            return true;
        };//xmapはrefereneceデータとならない
        return false;
    } else {
//        if(targetInfo.type == 'xmap'){}
        return false;
    }
}
/**
 *	Xpsターゲットの識別子を与えxMapを生成する
 *	該当するxMapエントリが存在すればそれを
 *	該当するエントリがない場合は、リポジトリ内のXpsエントリーの内容を合成する
 *	生成したデータは、リポジトリに置く　生成時刻をタイムスタンプとして記録する
 *　fileRepository.mergeBuffer に置いて callbackに渡す
 *  @params {String}    targetIdf
 *  @returns {Object}   処理ステータス{status:true|false}
 *
 */
FileRepository.prototype.getxMap = function(targetIdf,callback,callback2){
console.log('===================fileRepository===================================SET TARGET');
	var targetEntry = this.entry(targetIdf,'shot');
	if(! targetEntry){
		if(callback2 instanceof Function){
			callback2();
		}else{
			return {status:false};
		}
	}
console.log(targetEntry)
	if(targetEntry instanceof nas.StoryBoard.SBShot){
	    targetEntry = targetEntry.xmap;
	}
	this.mergeBuffer = new xMap(targetEntry.getIdentifier());
	if(targetEntry.token){
//リポジトリ上にすでにエントリが存在するのでそれを取得(前段でチェックが効いていればこれは実行されない　直アクセス時機能)
        this.mergeBuffer.parsexMap(localStorage.getItem(targetEntry.token));
        this.mergeBuffer.dataNode = fileRepository.toString();//これはプッシュ時まで保留（最後にpush）
        if(callback instanceof Function){
            callback(this.mergeBuffer);
        }else{
            xUI.documents.setContent(this.mergeBuffer,true);
        }
        return {status:true};
    }
//ファイルリポジトリ上にエントリなし
//エントリのすべてのXpsからxMapを生成してマージターゲット配列を設定する　fileRepository版
console.log('build xmap form Xpst for : '+decodeURIComponent(targetIdf));
    var sourceXps = new Xps();//ソース用一時Xps
    var mergeTarget = [];
    for (var ix = 0 ; ix < targetEntry.contents.length ; ix ++ ){
        for (var l = 0 ; l < targetEntry.contents[ix].nodeChart.length ; l ++ ){
            for (var s = 0 ; s < targetEntry.contents[ix].nodeChart[l].stages.length ; s ++ ){
                for (var n = 0 ; n < targetEntry.contents[ix].nodeChart[l].stages[s].nodes.length ; n ++ ){
                    if(targetEntry.contents[ix].nodeChart[l].stages[s].nodes[n].token)
    var sourceString = localStorage.getItem(targetEntry.contents[ix].nodeChart[l].stages[s].nodes[n].token);
    if(sourceString){
        sourceXps.parseXps(sourceString);
        mergeTarget.push(Xps.getxMap(sourceXps));
    }
                };//targetEntry.contents[ix].nodeChart[l].stages[s].nodes >>(全ジョブ)
            };//targetEntry.contents[ix].nodeChart[l].stages >>(全ステージ)
        };//targetEntry.contents[ix].nodeChart >>(ショット内全ライン)
    };//targetEntry.contents >>(全ショット)
//マージターゲットをチェック エントリがない場合は失敗終了
    if(mergeTarget.length == 0) return {status:false};
//整ったところでマージバッファの再初期化
    this.mergeBuffer.parsexMap(mergeTarget.splice(0,1).toString());//第一要素先行処理・ターゲットから削除
    if(mergeTarget.length > 0){
        var merged = this.mergeBuffer.merge(mergeTarget);//残があるのでマージ
    }else{
        var merged = {status:true};//変換対象がひとつなので処理終了
    }
    this.mergeBuffer.dataNode = fileRepository.toString();//これはプッシュ時まで保留（最後にpush）
    if(merged.status){
        var fnc = function(transaction){
            console.log(xUI.activeDocument);
            xUI.documents.setContent(transaction.target,true);
        };
	    if(callback instanceof Function){
		    fnc = function(transaction){callback(transaction.target)};
	    }
	}
console.log(fileRepository.mergeBuffer);
	var tr = new nas.Transaction(fileRepository.mergeBuffer,"push",false,fnc,callback2);
console.log(['transaction ',tr])
    return merged;
}
/*TEST
    fileRepository.getxMap(nas.Pm.getIdentifier(xUI.XPS),function(x){console.log(x.toString())});
*/
/**
 *   識別子またはオブジェクトを引数にして一致データをファイルストレージから取得
 *   コールバックに渡す
 *    コールバック関数が与えられない場合は
 *    xpst|xmapの場合　xUI.documents.setContent()に渡す
 *    pmdb|stbd の場合 対応するオブジェクトに読込
 *
 *    xmapの場合 識別子のノード指定は無意味
 *    xpstの場合 識別子のノード指定はエントリ検索時に解決
 *              識別子にノードが指定されない場合は、本線最終ノードを返す
 *  isRerference フラグはxpstのケースのみ有効　指定された場合は、xUI.referenceXpsのデータをセットしてXPS編集バッファをリセットする
 *   引数にstbdエントリ(SBShot|SBxMap) を拡張 検索を省略してトークンキーをもとにコンテンツを取得する
 *
 *  @params  {String|Object}    target
 *      読み出しデータ識別子|ターゲット登録オブジェクト StoryBoard.SBxMap|StoryBoard.SBShot|nas.Pm.PmDomain|StoryBoard
 *  @params  {Boolean}   isReference
 *      リファレンス読み出しフラグ(xpstエントリ専用　他のリクエストに対しては無効)
 *  @params  {Function}  callback
 *      コールバック関数
 *  戻値 不定
 */
FileRepository.prototype.getEntry=function(target,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
//識別子をターゲットオブジェクトに変換 変換前に情報を取得しておく
    if(typeof target == 'string'){
        var　tgtInfo = nas.Pm.parseIdentifier(target);
        target = fileRepository.entry(target);
    }else{
        var tgtInfo = nas.Pm.parseIdentifier(target.getIdentifier());
    }
    if((! target)||(! target.token)){
//ターゲットオブジェクトがないまたはエントリが存在しない
        if(callback2 instanceof Function) callback2();
        return false;
    }
    var documentType = 'xpst';//デフォルトでxpst設定
    if(target instanceof nas.Pm.PmDomain){
        documentType = 'pmdb';
    }else if(target instanceof nas.StoryBoard){
        documentType = 'stbd';
        
    }else if(target instanceof nas.StoryBoard.SBxMap){
        documentType = 'xmap';
    }
//xpstでターゲットにノード指定がない場合はtarget.tokenを使用したアクセス不可（対象不定になる）
    var targetToken = target.token;
    if((documentType == 'xpst')&&(! tgtInfo.mNode)){
console.log(target);
        targetToken = target.nodeChart[0].stages[target.nodeChart[0].stages.length-1].nodes[
            target.nodeChart[0].stages[target.nodeChart[0].stages.length-1].nodes.length-1
        ].token;
//本線最終ノードのトークンを取得するコードが合ったほうが良い
console.log(targetToken);
    }
    var documentSource = localStorage.getItem(targetToken);
    if(documentSource){
        if(callback instanceof Function){
            if((documentType == 'xpst')||(documentType == 'xmap'))
                documentSource = serviceAgent.overwriteProperty(documentSource,fileRepository.toString(),'REPOSITORY');
            callback(documentSource);
            return true;
        }
        if(! isReference){
//xpst以外はリポジトリ内のリビジョン管理がないのでそのままレスポンスを処理する
            if(documentType == 'pmdb'){
//pmdb
                target.parseConfig(documentSource);
            }else if(documentType == 'stbd'){
//stbd
                target.parseScript(documentSource);
            }else{
//xpst|xmap
                documentSource = serviceAgent.overwriteProperty(documentSource,fileRepository.toString(),'REPOSITORY');
console.log('set Content'+this.toString());
//console.log(documentSource);//ここの設定で無限ループに落ちる
//識別が必要　識別はxUI.documents　自身に置く
                var setIndex = xUI.documents.setContent(documentSource,true);
                if(setIndex >=0 ){
                    xUI.setUImode('browsing');
                    if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
console.log('set documents index : '+ setIndex);
                };
            }
            return true;
        } else if(documentType=='xpst'){
            xUI.setReferenceXPS(documentSource);
            return true;
        };//xmapはrefereneceデータとならない
        return false;
    } else {
        if(callback2 instanceof Function) callback2();
        return false;
    }
}

/**
    DBにタイトルを作成する。
    confirmなし 呼び出し側で済ませること
    必要あれば編集UIを呼び出し側に追加
    fileRepository.pmdb.workTitlesにタイトルをエントリする
    タイトル.pmdbを初期化する
引数
    タイトル（必須）
    備考テキスト
    PmDomainオブジェクト(pmdb)
    コールバック関数２種
識別子は受け入れない  必要に従って前段で分解のこと
*/
FileRepository.prototype.addTitle=function (myTitle,myDescription,myPm,callback,callback2){
//現在ファイルリポジトリ側で行う処理は存在しない コールバックの実行のみを行う
//タイトルDBが実装された場合はDBにエントリを加える
console.log(['fileRepository.addTitle',myTitle,myDescription,myPm].join(':'));
  if(callback instanceof Function) callback();
    return true;
}
/**
    DBにOPUS(エピソード)を作成する。
引数
    タイトルを含む識別子  カット番号は求めない
    コールバック関数２種
    識別子のみ受け入れ
    このルーチンを呼び出す時点で、タイトルは存在すること
*/
FileRepository.prototype.addOpus=function (myIdentifier,prodIdentifier,callback,callback2){
//console.log(['fileRepository.addOpus',myIdentifier,prodIdentifier].join(':'));
//現在ファイルリポジトリ側で行う処理は存在しない コールバックの実行のみを行う
//タイトルDBに加えて、documetntDepotのプロダクト更新が必要
//タイトルDB側のイベント処理とするか、または追加後にdocumentDepot側でのデータ要求処理に振替
    
  if(callback instanceof Function) callback();
    return true;
}
/**
    @params {String} myIdentifier
    @returns {Object} 
    識別子を指定してファイルリポジトリから相当エントリを消去する
    リストは再構築()
    ファイルリポジトリに関しては、各ユーザは編集権限を持つ
    
    baseStorage.entryListからの削除、当該プロダクトのエピソードからの削除も同時に行う
    また、ステータス変更のため内部ルーチンがこのメソッドを呼ぶ
    直接要素編集をしても良い？
*/
FileRepository.prototype.removeEntry=function(myIdentifier){
console.log(myIdentifier);
    var myEntry = this.baseStorage.entryList.getByIdf(myIdentifier);//listEntry
console.log(myEntry);
//productsデータから削除
console.log(fileRepository.entry(myIdentifier));
    var removed = fileRepository.entry(myIdentifier).remove();
console.log(removed);
    if((removed)&&(myEntry)&&(myEntry.issues)){
//エントリに関連するアイテムをファイルストレージから削除
        for (var iid=0;iid < myEntry.issues.length;iid++){
            localStorage.removeItem(this.keyPrefix+myEntry.issues[iid].identifier);
console.log (decodeURIComponent('remove : '+myEntry.issues[iid].identifier));
console.log (localStorage.getItem(this.keyPrefix+myEntry.issues[iid].identifier));
        };
//エントリ自身を削除
        var res = myEntry.remove();
        if(! res ){console.log('fail removed : ' + res)}
//ドキュメントブラウザ更新
    documentDepot.updateDocumentSelector();//ドキュメントブラウザの再ビルド
        return true;
    };
    return myEntry;
};

/**
    以下、ステータス操作コマンドメソッド
    serviceAgentの同名メソッドから呼び出す下位ファンクション

*/
/*
    現在のドキュメントをアクティベートする
*/
FileRepository.prototype.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
        var newXps = new Xps();
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタ更新
            }else{
//console.log('ステータス変更失敗 :');
//             if(newXps) delete newXps;
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                return false;
            }
            xUI.setUImode('production');
            xUI.sWitchPanel();//パネルクリア
            if(callback instanceof Function){ setTimeout (callback,10);}
            return true;
        }else{
//console.log('ステータス変更不可 :'+ nas.Pm.getIdentifier(newXps));
            if(callback2 instanceof Function) {setTimeout(callback2,10);}
            return false
        }
}
//作業を保留する リポジトリ内のエントリを更新してステータスを変更 
FileRepository.prototype.deactivateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
            //Active > Holdへ
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = new nas.Xps.JobStatus('Hold');//（ジョブID等）status以外の変更はない
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
if(config.dbg) console.log('deactivated');
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                currentEntry.setStatus(newXps.currentStatus);
                var myVersion=currentCut.versions[currentCut.versions.length-1];
                  myVersion.updated_at=new Date().toString();
                  myVersion.description=currentEntry.toString(0);
                  myVersion.version_token=this.keyPrefix+myVersion.description;
//                documentDepot.rebuildList();
                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Hold');//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタの更新
            }else{
            //保存に失敗
//console.log('保留失敗')
//                delete newXps ;
			    if(callback2 instanceof Function) setTimeout(callback2,10);
                return false;
            }
            //データをホールドしたので、リストを更新 編集対象をクリアしてUIを初期化
            xUI.setUImode('browsing');
            xUI.sWitchPanel();//パネルクリア
			if(callback instanceof Function) setTimeout(callback,10);
        }else{
//console.log('保留可能エントリが無い :'+ nas.Pm.getIdentifier(newXps));
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
FileRepository.prototype.checkinEntry=function(myJob,callback,callback2){
    if( typeof myJob == 'undefined') return false;
    myJob = (myJob)? myJob:xUI.currentUser.handle;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(! currentEntry){
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 読み出したデータでXpsを初期化 
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(config.dbg) console.log('読み出し失敗')
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.setUImode('production');//モードをproductionへ
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(config.dbg) console.log(result);
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
FileRepository.prototype.checkoutEntry=function(assignData,callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
    if(! currentEntry) {
        return false;
    }
            //Active > Fixed
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用 JobID変わらず
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
//            newXps.currentStatus = ['Fixed',assignData].join(":");
            newXps.currentStatus = new nas.Xps.JobStatus('Fixed');
            newXps.currentStatus.assign = assignData;
            //いったん元に戻す  assignData は宙に保留（ここで消失）
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());

            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps))==newXps.toString())? true:false;
            if(result){
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
                currentEntry.setStatus(newXps.currentStatus);
                var myVersion=currentCut.versions[currentCut.versions.length-1];
                  myVersion.updated_at=new Date().toString();
                  myVersion.description=currentEntry.toString(0);
                  myVersion.version_token=this.keyPrefix+myVersion.description;
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.setUImode('browsing');//モードをbrousingへ
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout('callback()',10)};
                return result;
            }else{
//console.log("fail checkout store")
            }
        }
//console.log('終了更新失敗');
//        delete newXps ;
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    検収処理receiptEntry/receiptEntry
*/
FileRepository.prototype.receiptEntry=function(stageName,jobName,callback,callback2){
    if( typeof stageName == 'undefined') return false;
    var myStage = nas.pmdb.stages.getStage(stageName) ;//ステージDBと照合  エントリが無い場合はエントリ登録
    /*  2016-12 の実装では省略して  エラー終了
        2017-07 最小限の処理を実装  ステージの存在を確認して続行
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
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(config.dbg) console.log('読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.stage.increment(stageName);
            newXps.job.reset(jobName);
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = new nas.Xps.JobStatus('Startup');
if(config.dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
if(config.dbg) console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
if(config.dbg) console.log('receipt');
//                delete newXps ;
if(config.dbg) console.log(newXps.currentStatus);
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
//                xUI.setUImode('browsing');//モードをbrowsingへ    ＜＜領収処理の後はモード遷移なし
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(config.dbg) console.log(result);
            }
        }
if(config.dbg) console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    作業中断処理
*/
FileRepository.prototype.abortEntry=function(myIdentifier,callback,callback2){
    var currentEntry = this.entry(myIdentifier);
    if(! currentEntry) return false;
    var currentStatus=currentEntry.getStatus();

    if(String(currentStatus.content).indexOf('Fixed')<0){return false;}
    var currentCut   = this.cut(currentEntry.toString());
    if(! currentCut) return false;
    
//中断エントリを作成するために、読み出したデータで新規Xpsを初期化 
        var newXps = new Xps();
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.setUImode('floating');//モードをfloatingへ    ＜＜領収処理の後はモード遷移なし
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(config.dbg) console.log(result);
            }
        }
if(config.dbg) console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    リポジトリの情報をダイアログで表示

*/
FileRepository.prototype.showInformation=function (){
    var ownerString = (xUI.currentUser)? xUI.currentUser.toString(): nas.localize({en:"(Could not acquire.)",ja:"(取得できません)"});
    var title = nas.localize(nas.uiMsg.aboutOf,this.name);
    var msg = "";
    msg += nas.localize(nas.uiMsg.serviceNode)     + " : " + this.service.name +"("+this.url+")<br>";
    msg += nas.localize(nas.uiMsg.repositoryName)  + " : " + this.name +"<br>";
    msg += nas.localize(nas.uiMsg.repositoryOwner) + " : " + ownerString + "<br>";
    msg += nas.localize({
en:"<hr>** This is the area where temporary files are stored using local storage of the browser.  Data can not be shared between users in this repository.<br>",
ja:"<hr>** ファイルシステム上の保存領域です。<br>ユーザ間のデータ共有のためにはリポジトリを共有領域においてください。<br>"
});
    nas.showModalDialog("alert",msg,title);
}
/*  test data 
    fileRepository.currentProduct = "ももたろう#12[キジ参戦！ももたろう地獄模様！！]";
    fileRepository.currentSC      = "S-C005 (12+00)/011(3+00)/014(3+00)";
    fileRepository.currentLine    = 0;
    fileRepository.currentStage   = 0;
    fileRepository.currentJob     = 0;

JSON.stringify(fileRepository);

fileRepository.pushStore(XPS);
fileRepository.getList();
//fileRepository.entryList[0];
fileRepository.getEntry(fileRepository.entryList[0]);

fileRepository.showInformation();
*/
/**
    最終作業の破棄
    バックアップ作業これを呼び出す側で処理
    ここを直接コールした場合はバックアップは実行されない
    ユーザメッセージはここでは処理されない
    
*/
FileRepository.prototype.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus.content != 'Active'){return false}
//   カレントの作業に対応するストレージ上のキーを消去
//   成功すれば
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    try {
        localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
		currentEntry.issues.pop();
//        xUI.resetSheet(new Xps(5,144),new Xps(5,144));
        xUI.resetSheet();
        if(callback instanceof Function) callback();
    }catch(er){
//console.log(er) 
        if(callback2 instanceof Function) callback2();
    }
}


/**
    @constractor
    
    UATサービスノードオブジェクト
    複数あるサーバ（ログイン先）のための必要な情報を保持するオブジェクト
    複数のサービス情報をプログラム内に保持しないようにドキュメント内の属性として監理する
    同時に記録する認証は一つ、複数のログイン情報を抱える必要はない
    最期に認証したノード一つで運用 トークンはログイン毎に再取得
    シングルドキュメント拘束のための情報キャリアを兼ねる
    データ管理のためリポジトリのコレクション配列を拡張
    @params {String}    seviceName
    @params {String}    serviceURL
        localStorageの際は"localStorage:" ファイルストレージの場合はfile://<絶対パス>
    @params {String}    serviceType
        localStrage/scivon/localfilesystem/dropbox/googleDrive/oneDrive 等のキーワード(webストレージは未サポート2020.11)
*/
function ServiceNode (serviceName,serviceURL,serviceType){
    this.name = serviceName ;//識別名称
    this.url  = serviceURL  ;//serviceURL 
    this.type = (serviceType)? serviceType:"scivon";//
    this.pmdb = {};//nas.Pm.pmdb;コンストラクタでは空オブジェクト
    this.repositories = [];
    this.bindTarget   = null;//バインド対象プロパティ
//  以下の情報は、テスト用に埋め込み あとで分離処置
    if(this.serviceType == 'scivon'){
        this.client_id = "b115aead773388942473e77c1e014f4d7d38e4d4829ae4fd1fa0e48e1347b4cd";
        this.client_secret = "54c0f02c38175436df16a058cc0c0e037038c82d3cc9ce4c212e3e4afe0449dd";
    }else if(this.serviceType == 'localfilesystem'){
        this.root = new nas.File(serviceURL);
        this.client_id;
        this.client_secret;
    }
/* FileStorageService の client_id はuuidで生成？*/
}
/*
    
    bindTarget
    拘束がない場合は null
    ある場合は以下の無名Objectでトークンを保持
    {
        repository :<organization_token>,
        title      :<product_token>,
        opus       :<episode_token>,
        xmap       :<cut_bag_token>,
        cut        :<cut_token>
    }
    情報が必要なファンクションはこのプロパティを参照する
    



*/
/**
 *  @params {String}    form
 *      output form type Object|JSON|full-dump|plain-text|<propname>
 *  @returns {String}
 *      formated string
 *   再初期化可能なの情報を書き出すメソッド
 *   オブジェクト戻しも可能に
 */
ServiceNode.prototype.getStatus = function(form){
    var result = {
        name:this.name,
        url :this.url,
        type:this.type,
        bindTarget:this.bindTarget
    };
    switch (form){
    case 'Object':
        return result;
    break;
    case 'JSON':
        return JSON.stringify(result);
    break;
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.url,
            this.type,
            this.bindTarget
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.name,
            '\tname:'+this.name,
            '\turl:'+this.url,
            '\ttype:'+this.type,
            '\tbindTarget:'+this.bindTarget
        ]).join('\n');
    break;
    default:
        return (this[form])? this[form]:this.name;
    }
};
/**
    リクエストのヘッダにトークンを載せる
    トークンの期限が切れていた場合は、再度のトークン取得（再ログイン）を促す
    v1向けのコードは考慮しない
*/
ServiceNode.prototype.setHeader=function(xhr,repository){
    var oauth_token = (xUI.onSite)? 
    $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token');
    var session_token = (xUI.onSite)?
    $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token');
    var organizationToken = (typeof serviceAgent.currentRepository.token != 'undefined')? serviceAgent.currentRepository.token:'';
    if(repository) organizationToken = (repository.token)? repositoty.token:repository;
    if(oauth_token.length==0) return false;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhr.setRequestHeader('Authorization', ( "Bearer " + oauth_token));
        xhr.setRequestHeader('OrganizationToken', organizationToken );
        xhr.setRequestHeader('SessionToken', session_token );
        xhr.setRequestHeader('ApplicationIdf', serviceAgent.applicationIdf );
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
if(config.dbg) console.log(msg);
if(config.dbg) console.log(res);
        },
        beforeSend: this.setHeader
    });
//V2    
        $.ajax({
          url: this.url + url,
          type: 'GET',
          dataType: 'json',
          success: function(res) {
if(config.dbg) console.log(msg);
if(config.dbg) console.log(res);

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
 *    認証手続きはサービスノードのメソッド ノード自身が認証と必要なデータの記録を行う
 *    パスワードは記録しない 認証毎にパスワードをユーザに要求する
 *        myService.authorize()
 *    パスワードとUIDは、ページ上のフォームから取得する
 *  @params {Function}  callback
 *      処理成功時のコールバック関数
 */
ServiceNode.prototype.authorize=function(callback){
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
    var oauthURL=serviceAgent.currentServer.url+"/oauth/token.json";
    $.ajax({
        type: "POST",
        url: oauthURL,
        data: data,
		success : function(result) {
            $('#server-info').attr('oauth_token'    , result.access_token);
            $('#server-info').attr('session_token'  , result.session_token);
            $('#server-info').attr('last_authrized' , new Date().toString());
            serviceAgent.authorized('success');
console.log('+++++++++++++ init serviceNode');
            serviceAgent.currentServer.init(callback);//
		},
		error : function(result) {
		    /**
		        認証失敗 エラーメッセージ表示  トークンと必要情報をクリアして表示を変更する
		    */
		    alert(localize(nas.uiMsg.dmAlertFailAuthorize));
            $('#server-info').attr('oauth_token'    , '');
            $('#server-info').attr('session_token'  , '');
            $('#server-info').attr('last_authrized' , '');
            serviceAgent.authorized('false');
		}
	});
}
/**
 *  serviceNodeの初期化　init
 *  初期化手続きをまとめる
 *  pmdbの初期化と初回更新
 */
ServiceNode.prototype.init=function(callback,callback2){
//初期値{}のケースのみ上書きでpmdbを初期化
    if(Object.keys(this.pmdb).length == 0){
console.log('init new pmdb for serviceNode : '+this.name);
        this.pmdb = new nas.Pm.PmDomain(nas.Pm,'.'+this.url+'//');
        this.pmdb.contents.add('organizations');
        this.pmdb.organizations = new nas.Pm.OrganizationCollection(this);
    }
//初回コール APIはクラスメソッドで呼ぶ?
//    ServiceNode.apiCallOrganizations(this,callback,callback2);
    this.updatePMDB(callback,callback2);
}
/**
 *  serviceNode pmdb更新
 */
ServiceNode.prototype.updatePMDB=function(callback,callback2){
//pmdbテーブルの更新(未実装)
//    ServiceNode.apiCallServerProperty(this);
//内包リポジトリの更新
    ServiceNode.apiCallOrganizations(this,callback,callback2);
}
//======= UAT api call
/**  @undocumented
    errorhandle
*/
ServiceNode.errorhandle=function(obj){
    console.log(obj);
    return;
}
/**  サービスノード（サーバ）のOrganizations(一覧)取得
 *   organization情報でリポジトリの初期化をおこなう
 * APIcallを明確にするためにメソッド名を系列で変更
 *    apiCallOrganizations(/api/v2/organizations.json)
 *    @params  {Object SreviceNode} svnd
 *        処理対象オブジェクト　(pmdbプロパティをもつオブジェクト)
 *    @params  {Function}    callback
 *        正常終了コールバック
 *    @params  {Function}    callback2
 *        エラーコールバック
 */
ServiceNode.apiCallOrganizations=function(svnd,callback,callback2){
    if(! (svnd instanceof ServiceNode)){
        if(callback2 instanceof Function){callback2(svnd)}else{ServiceNode.errorhandle(svnd)};
        return false;
    }
    var myURL = svnd.url + '/api/v2/organizations.json';
    var req = new UATRequest(
        myURL,
        function(result,callback,callback2){
            var servicenode = this.parent;
// console.log(result);
            if(result.res != 200){
//リザルト不正
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
//正常データ取得
var extb ={
	"name"           :"name",
	"owner_name"     :"contact",
	"owner_token"    :"owner_token",
	"property_token" :"property_token",
	"token"          :"token"
};
                var currentTimestamp = new Date().getTime();
//ServiseNode.pmdb.organizations のエントリを全検査して受信データに存在しないエントリを消去
                for(var i = servicenode.pmdb.organizations.members.length -1 ; i > -1; i --){
                    if(result.data.organizations.findIndex(function(elm){
                        return (elm.token == servicenode.pmdb.organizations.members[i].id)}
                    ) == -1 ){
                        servicenode.pmdb.organizations.members.splice(i,1);
                    }
                }
//リザルトデータのチームを全て検査して、新規または更新されたエントリのデータを書き込む
                var currentEntry;
                for( var rix=0 ; rix<result.data.organizations.length ; rix ++){
                    currentEntry = servicenode.pmdb.organizations.entry(result.data.organizations[rix].token);
                    if(!(currentEntry)){
//新規エントリ作成
                        currentEntry      = new nas.Pm.Organization(result.data.organizations[rix].name);
console.log(servicenode.pmdb);
                        currentEntry.code = nas.Pm.getUniqueStringInTable(
                              result.data.organizations[rix].name,
                              2,
                              servicenode.pmdb.organizations.members,
                              'code'
                        );
                        currentEntry.shortname = nas.Pm.getUniqueStringInTable(
                              result.data.organizations[rix].name,
                              4,
                              servicenode.pmdb.organizations.members,
                              'shortname'
                          );
                        currentEntry.serviceUrl     = servicenode.url;
                        currentEntry.id             = result.data.organizations[rix].token;
console.log('add new repository : '+ currentEntry.name)
console.log(currentEntry.toString('text'));
console.log(
                        servicenode.pmdb.organizations.addMembers(currentEntry)
);
                    }
//エントリプロパティ更新
                    for (var prop in extb){
console.log('set property :'+[extb[prop]] +' : '+result.data.organizations[rix][prop]);
                        currentEntry[extb[prop]] = result.data.organizations[rix][prop];
                    }
                }
                servicenode.pmdb.organizations.timestamp = currentTimestamp;
                if(servicenode.pmdb.timestamp < currentTimestamp) servicenode.pmdb.timestamp = currentTimestamp;
console.log(currentEntry);
            }
            if(callback instanceof Function){
console.log("*******")
                setTimeout(callback,10)
            }else{
                serviceAgent.setRepositories(servicenode);
            }
        },
        callback,
        callback2,
        '',
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        undefined,
        svnd
    );//サーバデータの取得のためリポジトリIDは空白
    var TSK = new UItask("call_api_organizations",req,-1,1);
    xUI.taskQueue.addTask(TSK);
};//ServiceNode.apiCallOrganizations
/**
 *    リポジトリのpmdbを更新するサーバAPI /api/v2/organizations/property.json 呼び出しメソッド
 *    @params  {Object NetworkRepository} repositry
 *        処理対象オブジェクト　(pmdbプロパティをもつオブジェクト)
 *    @params  {Function}    callback
 *        正常終了コールバック
 *    @params  {Function}    callback2
 *        エラーコールバック
//各エントリのプロパティを読み出し
//				ServerNode.apiCallOrganizationProperty(repository);
 */
ServiceNode.apiCallOrganizationProperty = function (repository,callback,callback2){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
console.log('call API : /api/v2/organizations/property.json');
    var myURL = repository.url + '/api/v2/organizations/property.json';
    var req = new UATRequest(
        myURL,
        function(result,callback,callback2){
console.log(result);
            if(result.res != 200){
//リザルト不正
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
/* pmdbデータの更新
    pmdbの最低限の初期化は行なわれているものとする
    UATからの受信データでpmdbを上書きする
*/
                var repository = this.parent;
console.log(repository);
                if((result.data.memberships)&&(result.data.memberships.length)){
//                    ServiceNode.applyMemberships2Users(memberships,pmdb);
//pmdb.users ( memberships : users )
//プロパティ交換テーブル
var extb = {
    "membership_name"           :"handle",
    "email"                     :"email",
    "membership_token"          :"token",
    "avatar_image_medium_url"   :"avatar_image_medium_url",
    "avatar_image_thumb_url"    :"avatar_image_thumb_url",
    "is_custom_avatar"          :"is_custom_avatar",
    "main_organization_token"   :"main_organization_token",
    "organization_name"         :"organization_name",
    "organization_token"        :"organization_token",
    "preset_avatar_type"        :"preset_avatar_type",
    "role"                      :"role"
}
//現メンバーを検索してメンバーシップから外れたユーザを削除
            for(var u = repository.pmdb.users.members.length-1 ; u > -1;u --){
                var currentUser = this.pmdb.users.members[u];
                if(result.data.memberships.findIndex(function(elm){
                    return (elm.membership_token == currentUser.token)
                })==-1) repository.pmdb.users.members.splice(u,1)
            }
//正常データ取得 チームプロパティからメンバー(users)を取得
            for(var i=0 ; i<result.data.memberships.length ; i ++){
                var currentMember = repository.pmdb.users.entry(result.data.memberships[i].email);
                if(! currentMember){
                    var newEntry = new nas.UserInfo(result.data.memberships[i].name);
                    newEntry.handle = result.data.memberships[i].membership_name;
                    newEntry.email  = result.data.memberships[i].email;
                    newEntry.token  = result.data.memberships[i].membership_token;

                    newEntry.avatar_image_medium_url = result.data.memberships[i].avatar_image_medium_url;
                    newEntry.avatar_image_thumb_url  = result.data.memberships[i].avatar_image_thumb_url;
                    newEntry.is_custom_avatar        = result.data.memberships[i].is_custom_avatar;
                    newEntry.preset_avatar_type      = result.data.memberships[i].preset_avatar_type;
                    newEntry.role                    = result.data.memberships[i].role;

                    repository.pmdb.users.addMember(newEntry);//
                }else{
                    currentMember.handle = result.data.memberships[i].membership_name;
                    currentMember.avatar_image_medium_url = result.data.memberships[i].avatar_image_medium_url;
                    currentMember.avatar_image_thumb_url  = result.data.memberships[i].avatar_image_thumb_url;
                    currentMember.is_custom_avatar        = result.data.memberships[i].is_custom_avatar;
                    currentMember.preset_avatar_type      = result.data.memberships[i].preset_avatar_type;
                    currentMember.role                    = result.data.memberships[i].role;
                }
            };//users
            };//
                if((result.data.property.animation_assets)&&(result.data.property.animation_assets.length)){
//                    ServiceNode.applyAnimationAssets2Assets(animationAssets,pmdb);
//pmdb.assets (property.animation_assets : assets)
if(repository.pmdb.assets.timestamp < result.data.property.updated_at){
//プロパティ交換テーブル
var extb = {
    "animation_asset_descriptor": "assetName",
    "description"                : "description",
    "end_node"                    :" endNode",
    "has_xps"                    :" hasXPS",
    "name"                        :" name",
    "short_name"                :" shortName",
    "token"                        :" token",
};
//現メンバーを検索してメンバーから外れたエントリを削除
                for(var m = repository.pmdb.assets.members.length-1 ; m > -1;m --){
                    var currentMember = repository.pmdb.assets.members[m];
                    if(result.data.property.animation_assets.findIndex(function(elm){
                        return (elm.token == currentMember[extb['token']]);
                    })==-1) repository.pmdb.assets.members.splice(m,1);
                }
//受信データから新規エントリを作成|エントリプロパティを更新
                for(var i=0 ; i<result.data.property.animation_assets.length ; i ++){
//新規
                    var currentMember = repository.pmdb.assets.entry(
                        result.data.property.animation_assets[i].animation_asset_descriptor
                    );
                    if(! currentMember){
                        var newEntry = new nas.Pm.Asset();
                        for(var kyw in extb){
                            newEntry[extb[kyw]]=result.data.property.animation_assets[i][kyw];
                        }
//                        newEntry.callStage = result.data.property.animation_assets[i].call_stages;
//呼び出しステージテーブルがない20200427
                        repository.pmdb.assets.addMembers(newEntry);//
                    }else{
//更新
                        for(var kyw in extb){
                            currentMember[extb[kyw]] = result.data.property.animation_assets[i][kyw];
                        }
                    }
                };//assets
}
                }
                if((result.data.property.configurations)&&(result.data.property.configurations.length)){
//                    ServiceNode.applyConfigurations2Configurations(configurations,pmdb);
//pmdb.configurations
                }
                if((result.data.property.pmTemplates)&&(result.data.property.pmTemplates.length)){
//                    ServiceNode.applyPmTemplates2PmTemplates(pmTemplates,pmdb);
//pmdb.pmTemplates
                }
                if((result.data.property.pmWorkflows)&&(result.data.property.pmWorkflows.length)){
//                    ServiceNode.applypmWorkflows2pmWorkflows(pmWorkflows,pmdb);
//pmdb.pmWorkflows
                }
                if((result.data.property.lines)&&(result.data.property.lines.length)){
//                    ServiceNode.apply2(lines,pmdb);
//pmdb.lines
                }
                if((result.data.property.stages)&&(result.data.property.stages.length)){
//                    ServiceNode.applyStages2Stages(stages,pmdb);
//pmdb.stages
                }
                if((result.data.property.jobNames)&&(result.data.property.jobNames.length)){
//                    ServiceNode.applyJobNames2JobNames(jobNames,pmdb);
//pmdb.jobNames
                }
                if((result.data.property.mediums)&&(result.data.property.mediums.length)){
//                    ServiceNode.applyMediums2Medias(,pmdb);
//pmdb.medias
                }
                if((result.data.property.sections)&&(result.data.property.sections.length)){
//                    ServiceNode.applySections2Staff(sections,pmdb);
//pmdb.staff
                }
// workToitles,products,stbd はapiCall***Properties以外で処理する
//細部はいったん保留して構造変更を優先
                if(callback instanceof Function){
console.log('callback execute ServiceNode.apiCallOrganizationProperty')
console.log(callback);
                    callback(callback);
                }
            }
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,
        repository
    );
    var TSK = new UItask("call_api_organization_property",req,-1,1);
    xUI.taskQueue.addTask(TSK);
};//ServiceNode.apiCallOrganizationProperty


/**
 *    プロダクト（タイトル）pmdbの更新
 *    UATサーバのエントリ一覧(/api/v2/products.json)を取得してRepository.pmdb.workTitlesを更新する
 *    @params  {Object NetworkRepository} repository
 *        処理対象オブジェクト　(pmdbプロパティをもつオブジェクト)
 *    @params  {Function}    callback
 *        正常終了コールバック
 *    @params  {Function}    callback2
 *        エラーコールバック
 *    タイトルの初期化を行い　情報更新を呼び出す
 */
ServiceNode.apiCallProducts=function (repository,callback,callback2){
//コールバックとして呼び出されるので、thisの参照先は不定　リポジトリは引数で渡す仕様に変更
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var req = new UATRequest(
        repository.url+'/api/v2/products.json',
        function(result){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var repository = this.parent;
                if((!repository)||(!(repository instanceof NetworkRepository)))
                repository = serviceAgent.repositories.find(function(element){
                    return (
                        (element instanceof NetworkRepository)&&
                        (element.token == result.data.current_membership.organization_token))
                });
                if(! (repository instanceof NetworkRepository)){
                    if(cellback2 instanceof Function) callback2();
                }
//console.log(repository);
//プロパティ交換テーブル
var extb = {
"frame_rate"       :"framerate",
"name"             :"name",
"full_name"        :"fullName",
"short_name"       :"shortName",
"code"             :"code",
"token"            :"token",
"updated_at"       :"updated_at",
"sheet_color_hex"  :"sheet_color_hex",
"icon_preset_type" :"icon_preset_type",
"icon_url"         :"icin_url"
};
//"input_media" :"inputMedia"
//"output_media":"outputMedia"
//現在のpmdb.workTitlesからサーバに存在しないタイトルを削除
                for(var m = repository.pmdb.workTitles.members.length-1 ; m > -1;m --){
                    var currentMember = repository.pmdb.workTitles.members[m];
                    if(result.data.products.findIndex(function(elm){
                        return (elm.token == currentMember[extb['token']]);
                    })==-1) repository.pmdb.assets.members.splice(m,1);
                }
//resultのデータを登録｜更新(バインド状態を反映)
                for(var tid = 0 ;tid < result.data.products.length ; tid ++){
                    if(
                        (repository.service.bindTarget)&&
                        (result.data.products[tid].token != repository.service.bindTarget.title)
                    ) continue;
                    var title = (! result.data.products[tid].name)? result.data.products[tid].token:result.data.products[tid].name;
                    var currentEntry = repository.pmdb.workTitles.entry(result.data.products[tid].token);
                    if(! currentEntry){
//未登録データは新規に登録
console.log('add newTitle');
                        currentEntry = new nas.Pm.WorkTitle(title);
                        currentEntry.id          = nas.uuid();//
                        currentEntry.projectName = title;
                        currentEntry.pmdb   = new nas.Pm.PmDomain(
                            repository,'.'+serviceAgent.url+'.'+repository.token+'//'
                        );
//エントリ追加
                        repository.pmdb.workTitles.addMembers(currentEntry);
                    }
                    for(var prop in extb){
//テーブルデータ更新
                        if(repository.pmdb.medias.entry(result.data.products[tid][prop]))currentEntry.outputMedia = repository.pmdb.medias.entry(result.data.products[tid][prop]);

                        currentEntry.name   = currentEntry.projectName;
//                      currentEntry.token  = currentEntry.id;

                        if(prop == 'frame_rate'){
                            currentEntry[extb[prop]] = new nas.Framerate(result.data.products[tid][prop]);//Object FrameRate
                        }else if((prop == 'input_media')||(prop == 'output_media')){
                            if(repository.pmdb.medias.entry(result.data.products[tid][prop])){
                                currentEntry[prop] = repository.pmdb.medias.entry(result.data.products[tid][prop]);//Object
                            }else{
                                currentEntry.inputMedia = result.data.products[tid][prop];//文字列
                            }
                        }else if(
                            ((prop == 'full_name')||(prop == 'code')||(prop == 'short_name'))&&
                            (! result.data.products[tid][prop])
                        ){
                            if(prop == 'full_name')  currentEntry[extb[prop]] = title;
                            if(prop == 'code') currentEntry.code = nas.Pm.getUniqueStringInTable(
                                title,
                                2,
                                repository.pmdb.products.members,
                                'code'
                            );
                            if(prop == 'short_name') currentEntry.shortname = nas.Pm.getUniqueStringInTable(
                                title,
                                4,
                                repository.pmdb.products.members,
                                'shortname'
                            );
                        }else{
                            currentEntry[extb[prop]] = result.data.products[tid][prop];
                        }
                    }
//エピソード一覧取得
                    ServiceNode.apiCallEpisodes(repository,callback,callback2,currentEntry.token);
                }
/*            //すべてのプロダクト(作品)詳細情報を取得 
            for (var prd in repository.pmdb.workTitles.members){
console.log([repository.pmdb.workTitles.members[prp].name,repository.pmdb.workTitles.members[prp].token].join(' : '));
// Repository.assTitle(myTitle,myDescription,myPm,callback,callback2)
                    repository.updateTitle(
                        repository.pmdb.workTitles.members[prd],
                        callback,
                        callback2,
                        repository.pmdb.workTitles.members[prd].token
                    );
            };// */
                if(callback instanceof Function) callback()
            }//res == 200
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme =  new Date().getTime() + '%%call_api_products'
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};// ServiceNode.apiCallProducts

/**
 *    タイトルごとの詳細（/api/v2/products/<token>.json）を取得　エピソード一覧
 *    @params  {Object NetworkRepository} repository
 *        処理対象オブジェクト　(pmdbプロパティをもつオブジェクト)
 *    @params  {Function}    callback
 *        正常終了コールバック
 *    @params  {Function}    callback2
 *        エラーコールバック
 *    @params {String}       titleToken
 *        対象プロダクト（タイトル）の識別トークン
 *    エピソードリストを取得更新
 *	エピソード追加の際には初期化もおこなう
 */
ServiceNode.apiCallProductDetail=function(repository,callback,callback2,titleToken){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var req = new UATRequest(
        repository.url+'/api/v2/products/'+titleToken+'.json',
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var myRepository = repository;
console.log(result.data)
                var workTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
//プロパティ交換テーブル
var extb = {
    "name"  : "name",
    "token" : "token"
};
//"input_media" :"inputMedia"
//"output_media":"outputMedia"
//リザルトに存在しないエピソードを削除
                for (var ox = (workTitle.opuses.members.length - 1) ; ox > -1 ; ox --){
                    var currentMember = workTitle.members[ox];
                    if(result.data.episodes.findIndex(function(elm){
                        return (elm.token == currentMember[extb['token']]);
                    })==-1) myRepository.pmdb.products.members.splice(ox,1);
                }
//未登録エントリを登録
                for (var eix = 0;eix < result.data.episodes.length; eix ++){
                    var productIdf = result.data.product.name+'#'+result.data.episodes[eix].name;
                    var currentOpus = workTitle.pmdb.products.entry(result.data.episodes[eix].token)
                    if(!currentOpus){
                        currentOpus = new nas.Pm.Opus(
                            productIdf,
                            result.data.episodes[eix].token,
                            result.data.episodes[eix].name,
                            ((result.data.product.episodes)?result.data.product.episodes[eix].description:''),
                            workTitle
                        );
                        currentOpus.pmdb = new nas.Pm.PmDomain(config.myTitle,'.'+myRepository.service.url+'.'+myRepository.token+'//'+productIdf);
                        currentOpus.stbd = new nas.StoryBoard(productIdf);
                        var resp = workTitle.opuses.addMembers(currentOpus);
                        if(resp[0]) myRepository.pmdb.products.addMembers(resp[0]);
                    }else{
                        if(currentOpus.name != result.data.episodes[eix].name)
                            currentOpus.name = result.data.episodes[eix].name;
                    }
//                  serviceNode.apiCallEpisodes();
                    currentOpus.updatePMDB();
                }
            }
/*            if(result.data.episodes.length) {
            	ServiceNode.apiCall
                myRepository.updateEpisodes(callback,callback2,result.data.product.token);
            }else{
            };// */
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme = titleToken + '%%call_api_product_detail';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};//ServiceNode.apiCallProductDetail
/**
 *    エピソード詳細（/api/v2/episodes.json?product_token=<token>）を取得
 *    @params {Object} repository
 *    @params {String} titleToken
 *    カット袋リストを取得
 */
ServiceNode.apiCallEpisodes=function(repository,callback,callback2,titleToken){
//console.log(repository);
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var req = new UATRequest(
        repository.url+'/api/v2/episodes.json?product_token='+titleToken,
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var repository = this.parent;
//console.log(result.data)
                var workTitle = repository.pmdb.workTitles.entry(result.data.product.token);
//プロパティ交換テーブル
var extb = {
	"name"             : "name",
	"token"            : "token",
	"updated_at"    : "timestamp",
	"description"   : "description",
	"icon_url"   : "icon_url",
	"property"   : "property"
};
//リザルトに存在しないエピソードを削除
                if(workTitle){
                    for (var ox = (workTitle.opuses.members.length - 1) ; ox > -1 ; ox --){
                        var currentMember = workTitle.members[ox];
                        if(result.data.episodes.findIndex(function(elm){
                            return (elm.token == currentMember[extb['token']]);
                        })==-1) repository.pmdb.products.members.splice(ox,1);
                    }
                }else{
//console.log([repository,result]);
            }
//未登録エントリを登録
                for (var eix = 0;eix < result.data.episodes.length; eix ++){
                    if(
                        (repository.service.bindTarget)&&
                        (result.data.episodes[eix].token != repository.service.bindTarget.opus)
                    ) continue;
                    var episode = (result.data.episodes[eix].name)? result.data.episodes[eix].name:result.data.episodes[eix].token;
                    var productIdf = result.data.product.name+'#'+episode;
                    var currentOpus = workTitle.pmdb.products.entry(result.data.episodes[eix].token);
                    if(!currentOpus){
                        currentOpus = new nas.Pm.Opus(
                            productIdf,
                            result.data.episodes[eix].token,
                            episode,
                            ((result.data.product.episodes)?result.data.product.episodes[eix].description:''),
                            workTitle
                        );
                        currentOpus.pmdb = new nas.Pm.PmDomain(config.myTitle,'.'+repository.service.url+'.'+repository.token+'//'+productIdf);
                        currentOpus.stbd = new nas.StoryBoard(productIdf);
                        var resp = workTitle.opuses.addMembers(currentOpus);
                        if(resp[0]) var AX = repository.pmdb.products.addMembers(resp[0]);
                    }
                    for(var kyw in extb){
                        if(kyw == 'updated_at'){
                            currentOpus[extb[kyw]] = new Date(result.data.episodes[eix][kyw]).getTime();
                        }else if(kyw == 'description'){
                            currentOpus[extb[kyw]] = result.data.episodes[eix][kyw];
                        }else{
                            currentOpus[extb[kyw]] = result.data.episodes[eix][kyw];
                        }
                    }
                }
//カット袋の情報データを呼び出し
                if(result.data.episodes.length){
                    for(var i = 0 ; i < result.data.episodes.length ; i ++){
                        if(
                            (repository.service.bindTarget)&&
                            (result.data.episodes[i].token != repository.service.bindTarget.opus)
                        ) continue;
                        ServiceNode.apiCallCutBags(repository,callback,callback2,result.data.episodes[i].token);
                    }
                }
            };//res == 200
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,
        repository
    );
    var tskNme = titleToken + '%%call_api_episodes';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};//ServiceNode.apiCallEpisodes
/**
 *    タイトルプロパティ（/api/v2/products/<token>/property.json）を取得
 *    @params    {Object}    title
 *    @params    {String}    titleToken
 */
ServiceNode.apiCallProductProperty=function(repository,callback,callback2,titleToken){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var req = new UATRequest(
        repository.url+'/api/v2/products/'+titleToken+'/property.json',
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var myRepository = repository;
console.log(result.data)
                var workTitle = myRepository.pmdb.workTitles.entry(titleToken);
/* //result.data.property.xxxx : title.pmdb.XXX 
//プロパティ交換テーブル
var extb = {
	"token":"token"
};
//リザルトに存在しないエントリを削除
            for (var ox = (workTitle.XXX.members.length - 1) ; ox > -1 ; ox --){
                var currentMember = workTitle.members[ox];
                if(result.data.property.xxxx.findIndex(function(elm){
                    return (elm.token == currentMember[extb['token']]);
                })==-1) myRepository.pmdb.XXX.members.splice(ox,1);
            }
//未登録エントリを登録
            for (var eix = 0;eix < result.data.property.xxxx.length; eix ++){
                var currentEntry = workTitle.pmdb.XXX.entry(result.data.property.xxxx[eix].token)
                if(!currentEntry){
                    currentEntry = new nas.Pm.Opus(
                        productIdf,
                        result.data.property.xxxx[eix].token,
                        result.data.property.xxxx[eix].name,
                        ((result.data.product.property.xxxx)?result.data.product.property.xxxx[eix].description:''),
                        workTitle
                    );
                    currentEntry.pmdb = new nas.Pm.PmDomain(myTitle,'.'+myRepository.service.url+'.'+myRepository.token+'//'+productIdf);
                    currentEntry.stbd = new nas.StoryBoard(productIdf);
                    
                    var resp = workTitle.XXX.addMembers(currentEntry);
                    if(resp[0]) myRepository.pmdb.products.addMembers(resp[0]);
                }
                for(var kyw in extb){
                	if(kyw == 'updated_at'){
                        currentEntry[extb[kyw]] = new Date(result.data.property.xxxx[eix][kyw]).getTime();
                	}else if(kyw == 'description'){
                        currentEntry[extb[kyw]] = result.data.property.xxxx[eix][kyw];
                	}else{
                        currentEntry[extb[kyw]] = result.data.property.xxxx[eix][kyw];
                    }
                }
            };//xxxx:XXX */

//title.pmdb.assets
//title.pmdb.lineTemplates
//title.pmdb.medias
//title.pmdb.staff
                if(callback instanceof Function) callback(repository);
            }
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,title
    );
    var tskNme = titleToken + '%%call_api_product_property';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};//ServiceNode.apiCallProductProperty
/**
 *    エピソードごとの詳細（/api/v2/episodes/<token>.json）を取得
 *    @params {Object} repository
 *    @params {String} titleToken
 *    カット袋一覧を取得更新
 *このAPIで取得可能なカット一覧はリストのみなので注意　リスト取得のみでstbdの更新を行なわない事に注意
*/
ServiceNode.apiCallEpisodeDetail=function(repository,callback,callback2,episodeToken){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var episode = repository.pmdb.products.entry(episodeToken);

    var req = new UATRequest(
        repository.url+'/api/v2/episodes/'+episodeToken+'.json',
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var myRepository = repository;
                var product = myRepository.pmdb.products.entry(result.data.episode.token);
                var pmdb = product.pmdb;
                var stbd = product.stbd;
                if(callback instanceof Function) callback(result);
            }
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme = titleToken + '%%call_api_episode_detail';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
//    undefined,
//    episode
};//ServiceNode.apiCallEpisodeDetail

/**
 *    エピソードプロパティ（/api/v2/episodes/<token>/property.json）を取得
 *    @params    {Object}    title
 *    @params    {String}    titleToken
 */
ServiceNode.apiCallEpisodeProperty=function(repository,callback,callback2,titleToken){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var req = new UATRequest(
        repository.url+'/api/v2/products/'+episodeToken+'/property.json',
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var repository = this.parent;
console.log(result.data)
                var workTitle = title;//myRepository.pmdb.workTitles.entry();
//property_tokenセット
//episode.pmdb.users
//episode.pmdb.assets
//episode.pmdb.lineTemplates
//episode.pmdb.medias
//episode.pmdb.staff
                if(callback instanceof Function) callback(repository);
            }
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme = titleToken + '%%api_call_episode_property';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};//ServiceNode.apiCallEpisodeProperty
/**
 *    カット袋一覧（/api/v2/cut_bags.json?episode_token=<token>）を取得
 *    @params {Object} repository
 *    @params {String} titleToken
 *    カット袋一覧を取得更新
*/
ServiceNode.apiCallCutBags=function(repository,callback,callback2,episodeToken){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var episode = repository.pmdb.products.entry(episodeToken);
    var req = new UATRequest(
        repository.url+'/api/v2/cut_bags.json?episode_token='+episodeToken,
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var repository = this.parent;
//console.log(repository);
//console.log(result);
                var title   = repository.pmdb.workTitles.entry(result.data.product.token);
                var product = repository.pmdb.products.entry(result.data.episode.token);
                var storyBoard        = product.stbd;
                var currentTitle      = product.title;
//xmaps
//リザルトに存在しないカットを削除(カット単位アクセス トークン比較)
                var removeItems = [];
                for (var ox = 0 ; ox < storyBoard.contents.length ; ox ++){
                //	storyBoard.contents[ox].token
                    if(result.data.cut_bags.findIndex(function(e){
                        e.cuts.findIndex(function(elm){
                            return (elm.token == storyBoard.contents[ox].token);
                        }) > -1
                    })==-1) removeItems.push(storyBoard.contents[ox]);
                }
                if (removeItems.length) storyBoard.edit('remove',removeItems);
//基本的にはこのルーチンでの削除はまずない（欠番プロパティを配置してソフトデリートになるため）
//未登録エントリを登録
                for (var bix = 0 ;bix < result.data.cut_bags.length ; bix ++){
                    if(
                        (repository.service.bindTarget)&&
                        (result.data.cut_bags[bix].token != repository.service.bindTarget.xmap)
                    ) continue;
                    for (var cix = 0 ;cix < result.data.cut_bags[bix].cuts.length ; cix ++){
//先行で内包カットを登録
                        var shot = result.data.cut_bags[bix].cuts[cix];
                        var shotIdf = (shot.description)?
                            shot.description:
                            currentTitle.name+'#'+product.name+'//'+((shot.name)?shot.name:shot.token);
                       var dataInfo = nas.Pm.parseIdentifier(shotIdf);
                       if(storyBoard.entry(dataInfo.sci[0].name)){}
                       if(storyBoard.getEntryByToken(shot.token)) continue;//ここで既存エントリをskip
//未登録ショットを登録　ショットの所属カラムを作成
                        var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                        newClmn.indexText = dataInfo.sci[0].name;
                        newClmn.timeText = dataInfo.sci[0].time;
                        var newShot = new nas.StoryBoard.SBShot(storyBoard,dataInfo.sci[0],[newClmn]);
                        newShot.token = shot.token;

                        var added   = storyBoard.edit('add',newShot);//単純追加
                        added[0].xmap.token=result.data.cut_bags[bix].token
                        if(dataInfo.mNode) added[0].xmap.writeNode(dataInfo.mNode);
                        for (var vix = 0 ;vix < shot.versions.length; vix ++){
                            if(shot.versions[vix]==null) continue;//下と統合可能だが現在保留 2019.09.24
                            if(shot.versions[vix].description == null) continue;
                            var subDataInfo = nas.Pm.parseIdentifier(shot.versions[vix].description);
                           if(subDataInfo.mNode) added[0].xmap.writeNode(subDataInfo.mNode);
                        }
                    }
                }
                if(callback instanceof Function) callback(repository);
            }
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme = episodeToken + '%%call_api_cut_bags';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
    undefined,
    episode
};//ServiceNode.apiCallapiCallCutBags
/*
getOrganizations
getOrganizationProperty

getProducts
getProductDetail
getProductProperty

getEpisodes
getEpisodeDetail >> カット袋リストが概要であるためpmdb更新時はcut_bag.json?を使用する
getEpisodeProperty

	カット袋一覧
/api/v2/cut_bags.json?episode_token=<episode_token>
	カット袋詳細
/api/v2/cut_bags/<cut_bag_token>.json

	詳細と一覧で取得できる情報がほぼ同一
	書き換え対象がstbd|stbd.SBxMapと異なる
*/
/*Template*/
/*
ServiceNode.apiCall＊＊＊=function(repository,callback,callback2,targetToken){
    if(! (repository instanceof NetworkRepository)){
        if(callback2 instanceof Function){callback2(repository)}else{ServiceNode.errorhandle(repository)};
        return false;
    }
    var req = new UATRequest(
        repository.url + '/api/v2/products/' + targetToken + '/property.json',
        function(result,callback,callback2){
            if(result.res != 200){
                if(callback2 instanceof Function){callback2(result)}else{ServiceNode.errorhandle(resuls)};
            }else{
                var repository = this.parent;//
                var targetCollection = ;//repository.pmdb.workTitles.entry();
//result.data.**.<property> : target.<property>
var extb = {
"name"             :"name",
"token"            :"token"
};
//リザルトに存在しないエントリを削除
                for (var ox = (targetCollection.members.length - 1) ; ox > -1 ; ox --){
                    var currentMember = targetCollection.members[ox];
                    if(result.data.episodes.findIndex(function(elm){
                        return (elm.token == currentMember[extb['token']]);
                    })==-1) targetCollection.members.splice(ox,1);
                }
//未登録エントリを登録
                for (var eix = 0;eix < result.data.＊＊＊.length; eix ++){
                    var productIdf = result.data.product.name+'#'+result.data.episodes[eix].name;
                    var currentOpus = workTitle.pmdb.products.entry(result.data.episodes[eix].token)
                    if(!currentOpus){
                        currentOpus = new nas.Pm.Opus(
                            productIdf,
                            result.data.episodes[eix].token,
                            result.data.episodes[eix].name,
                            ((result.data.product.episodes)?result.data.product.episodes[eix].description:''),
                            workTitle
                        );
                        currentOpus.pmdb = new nas.Pm.PmDomain(myTitle,'.'+repository.service.url+'.'+repository.token+'//'+productIdf);
                        currentOpus.stbd = new nas.StoryBoard(productIdf);
                        
                        var resp = workTitle.opuses.addMembers(currentOpus);
                        if(resp[0]) repository.pmdb.products.addMembers(resp[0]);
                    }else{
                        if(currentOpus.name != result.data.episodes[eix].name)
                            currentOpus.name = result.data.episodes[eix].name;
                    }
                }
//title.pmdb.assets
//title.pmdb.lineTemplates
//title.pmdb.medias
//title.pmdb.staff
                if(result.data.episodes.length) {
                    repository.updateEpisodes(callback,callback2,result.data.product.token);
                }else{
                }
                if(callback instanceof Function) callback(repository)
            }
        },
        callback,
        callback2,
        repository.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme =  + '%%call_api_name_string';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};// */


//======= UAT api call
/*
 *      履歴構造の実装には、XPSのデータを簡易パースする機能が必要
 *      プロパティを取得するのみ？
 *      
 *      サーバは自身でXPSをパースしない
 *      
 *      アプリケーションがパースした情報を識別情報として記録してこれを送り返す
 *      
 *  (タイトル)[#＃№](番号)[(サブタイトル)]//S##C####(##+##)/S##C####(##+##)/S##C####(##+##)/不定数…//lineID//stageID//jobID//documentStatus
 *      例:
 *  ももたろう#SP-1[鬼ヶ島の休日]//SC123 ( 3 + 12 .)//0//0//1//Hold
 *   
 *  タイトル/話数/サブタイトル/カット番号等の文字列は、少なくともリポジトリ内/そのデータ階層でユニークであることが要求される
 *  例えば現存のタイトルと同じと判別されるタイトルが指定された場合は、新規作品ではなく同作品として扱う
 *  似ていても、別のタイトルと判別された場合は別作品として扱われるので注意
 *  
 *  判定時に
 *  
 *      タイトル内のすべての空白を消去
 *      半角範囲内の文字列を全角から半角へ変換
 *      連続した数字はparseInt
 *  
 *  等の処置をして人間の感覚に近づける操作を行う（比較関数必要）
 *  
 *  
 *  ラインID ステージID 及びジョブIDはカット（管理単位）毎の通番 カットが異なれば同じIDは必ずしも同種のステージやジョブを示さない。
 *  管理工程の連続性のみが担保される
 *  識別子に管理アイテム識別文字列を加えても良い
 *  
 *  第４要素は作業状態を示す文字列
 *  
 *      例:
 *  0//0//0//Stratup
 *  0:本線//1:レイアウト//2:演出検査//Active
 *   
 *      ラインID
 *  ラインが初期化される毎に通番で増加 整数
 *  0   本線trunkライン
 *  1   本線から最初に分岐したライン
 *  1-1 ライン１から分岐したライン
 *  2   本線から分岐した２番めのライン
 *  
 *      ステージID
 *  各ラインを結んで全通番になる作業ステージID
 *  0//0
 *  0//1
 *  0//2    1//2
 *  0//3    1//3
 *  
 *      ジョブID
 *  ステージごとに初期化される作業ID
 *  0//0//0
 *  0//0//1
 *  0//0//2
 *  0//1//0
 *  0//1//1
 *  
 *      ステータス
 *  作業状態を表すキーワード
 *  Startup/Active/Hold/Fixed/Aborted (開始/作業/保留/終了/削除) の５態
 *  floating/Finished (浮動/完了) の2態を追加
 *  
 *      エントリの識別子自体にドキュメントの情報を埋め込めばサーバ側のパースの必要がない。
 *      ファイルシステムや一般的なネットワークストレージ、キー／値型のDBをリポジトリとして使う場合はそのほうが都合が良い
 *      管理DBの支援は受けられないが、作業の管理情報が独立性を持ち、アプリケーションからの管理が容易
 *  
 *  ステータスは  それぞれのキーワードで始まり  サブプロパティを含む
 *  
 *      Startup:{asignment:uid,message:text}
 *  
 *   //現状
 *   var myXps= XPS;
 *      [encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
 *   //将来は以下で置き換え予定 CSオブジェクト未実装
 *      myXps.sci.getIdentifier();
 *   //Xpsオブジェクトのクラスメソッドとして仮実装済み オブジェクトメソッドとして同名の機能の異なる関数があるので要注意
 *    Xps.getIdentifier(myXps);
 *    
 */
/**
比較関数 管理情報 3要素の管理情報配列 issuesを比較して先行の管理ノード順位を評価する関数
ライン拡張時は追加処理が必要

0//0//0
0//0//1
0//0//2
0//0//3

0//1//0
0//1//1
0//1//2
0//1//3

0//2//0
0//2//1
0//2//2
0//2//3

0//3//0
0//3//1
0//3//2

0//4//0
0//4//1
0//4//2

1//2//0
1//2//1
1//2//2
1//2//3

1//3//0
1//3//1
1//3//2
1//3//3

1-1//3//0
1-1//3//1
1-1//3//2
1-1//3//3

上記のようにラインごとに整列させる

*/
var issuesSorter =function(val1,val2){
    if(typeof val1 == 'undefined'){ return -1 } 
    if(typeof val2 == 'undefined'){ return  1 } 

    return (parseInt(String(val1[0]).split(':')[0]) * 10000 + parseInt(String(val1[1]).split(':')[0]) * 100 + parseInt(String(val1[2]).split(':')[0])) - ( parseInt(String(val2[0]).split(':')[0]) * 10000 + parseInt(String(val2[1]).split(':')[0]) * 100 + parseInt(String(val2[2]).split(':')[0]));
};

/**
 *    ソート比較関数
 *    カット番号（文字列内の最初の整数クラスタ）を整数化して比較
 *    @params {String}    val1
 *        カット番号
 *    @params {String}    val2
 *        比較カット番号
 */
var numSorter =function(val1,val2){ return (nas.parseNumber(val1) - nas.parseNumber(val2))};

 
/*  タイトルID、話数IDは将来的にタイトル話数エントリへのアクセスキーを入力
 *  カットIDは自身のDBエントリへのアクセスキーを設定する
 *  現在は省略可だがDB整備され次第必須
 *
 *  ローカルリポジトリの場合はそれぞれのエントリのキーを省略なしに入力
 *    ドキュメントリストにエントリされるオブジェクト
 *    listEntry.dataInfo  {Object} データの状態を保持するオブジェクト(≒識別子)
 *    listEntry.type  {String} pmdb|stbd|xmap|xpst
 *    timestamp {Number} データタイムスタンプ
 *    parent  {Object Repository} リポジトリへの参照
 *    product {String} productCode(作品と話数のみの識別子) URIencoded
 *    sci     {String} カット番号（兼用情報含む）兼用情報識別子　 URIencoded
 *    issues  管理情報 ４要素一次元配列 [line,stage,job,status]
 *    実際のデータファイルはissueごとに記録される
 *    いずれも URIエンコードされた状態で格納されているので画面表示の際は、デコードが必要
 *    issues には  オリジナル（初期化時）の識別子を保存する
 *    ネットワークリポジトリに接続する場合は以下のプロパティが設定される
 *    listEntry.titleID   /string token
 *    listEntry.episodeID /string token
 *    listEntry.issues[#].cutID  /string token
 *    listEntry.issues[#].versionID  /string token
 *
 *    オブジェクトメソッド
 *    listEntry.toString(Index)     カット情報までを識別子で戻す(getIdentifierのほうが良さげ)
 *    listEntry.push(Identifier)    issueコレクションに管理情報（ノードパス）をプッシュする。
 *                                  フルサイズ識別子も可。その場合はエントリがマッチしてないとリジェクト
 *    listEntry.getStatus()         最終ステータスを返す
 *    
 *  listEntry  は  listEntryCollection  に格納される
 *  listEntryCollection はデフォルトで this.parent.entryListとして参照される。
 
 *  xpstデータには、1点毎にissueが付属する。これを集めてissueコレクションを形成する
 *  xmapデータは、内部にissueコレクションに相当するnodeManagerオブジェクトを持つ
 *  xmap,pmdb,stbd エントリにはissueの概念はないのでissues[0]にデータアクセス用のプロパティのみを持った識別用の空配列エントリをもたせる
 */
/**
 *  @contsractor
 *      listEntry オブジェクト
 *  @params {String}    dataIdentifier
 *      初期化引数:カット識別子{,タイトルID,話数ID,カットID}
 */

var listEntry=function(dataIdentifier){
    this.dataInfo   = nas.Pm.parseIdentifier(dataIdentifier);//dataInfoそのものを拡張すればプロパティが不要となる？
    this.type       = this.dataInfo.type;//pmdb|stbd|xpst|xmap
    this.timestamp  = (this.dataInfo.timestamp)?this.dataInfo.timestamp:0;
    this.parent;//初期化時にリポジトリへの参照を設定
    this.product    = encodeURIComponent(this.dataInfo.product.title)+"#"+encodeURIComponent(this.dataInfo.product.opus);
    this.sci        = (this.dataInfo.sci.length == 1 )?
        encodeURIComponent(this.dataInfo.sci[0].name):encodeURIComponent(this.dataInfo.sci.join('/'));
    if((this.type != 'xpst')||(typeof this.dataInfo.line == 'undefined')){
//xmap　等、識別子にバージョン情報が含まれない場合は空配列で設定
        this.issues  = [[]];
    }else{
//nas.Pm.Issueに換装した方が良い? 2019.05.31
//console.log(this.dataInfo)
        this.issues  = [[
            encodeURIComponent(this.dataInfo.line.toString(true)),
            encodeURIComponent(this.dataInfo.stage.toString(true)),
            encodeURIComponent(this.dataInfo.job.toString(true)),
            encodeURIComponent(this.dataInfo.status)
        ]];
    }
    this.issues[0].identifier=dataIdentifier;//data token
    if(this.dataInfo.sci[0]) this.issues[0].time = nas.FCT2Frm(this.dataInfo.sci[0].time);//sciプロパティが存在すれば転記
//追加プロパティ
    if(arguments.length>1) {
        this.titleID             = arguments[1];
        this.episodeID           = arguments[2];
        this.issues[0].cutID     = arguments[3];
        this.issues[0].versionID = arguments[3];
    }
}
/* TEST
    A = new listEntry("kachi#00[%E3%83%81%E3%83%A5%E3%83%BC%E3%83%88%E3%83%AA%E3%82%A2%E3%83%AB%E3%83%87%E3%83%BC%E3%82%BF]//4/12//0%3A(%E6%9C%AC%E7%B7%9A).xmap");
    A.toStrig();
    B= new listEntry("%E3%83%86%E3%82%B9%E3%83%88#08[%E9%9B%89%E3%81%AE%E9%80%86%E8%A5%B2]//s#X-c#120(96)//0%3A(%E6%9C%AC%E7%B7%9A)//0%3Alayout//0%3Ainit//Startup:kiyo@nekomataya.info");
    B
*/
/*
    @params     {Number}    issueIndex
    @returns    {String}
        data identifier
    エントリは引数が指定されない場合、管理情報を除いたSCi情報分のみを返す

    引数があれば引数分の管理履歴をさかのぼって識別子を戻す
    
    旧版は、このメソッド全体がIssues配列の並びが発行順であることを期待している
    これはリスト取得の際にソートをかけることで解決
    ライン拡張後はソートで解決できなくなるので要注意
    方針としては、各ラインをまたがずに開始点まで遡れるように設定する

    ノードパスをカレント（最後尾値）から指定数値さかのぼった値を得る
    その値でエントリを検索して値を超えない最大のエントリを返す
    ノードのカレントラインが必要
    
    workIssue/managementNodeの概念を明確にする必要がある
    暫定的にもとのまま
    後ほど、ステージを遡れないように調整
*/
listEntry.prototype.toString=function(issueIndex){
    if(typeof issueIndex == "undefined"){issueIndex = -1;}
    if(issueIndex < 0){
        return [this.product,this.sci].join("//");
    }else{
        if(issueIndex<this.issues.length){
            return this.issues[this.issues.length - 1 - issueIndex].identifier;
            //この部分の手続はラインをまたぐと不正な値を戻すので要修正 11.23
        }else{
            return this.issues[this.issues.length - 1].identifier;
        }
        var endNode = this.issues[this.issues.length - 1]
    }
}
/**
 *  エントリーのIssueコレクションをノードパスでダンプ
 *  @params     {String}    form
 *      ダンプ形式　
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
    (識別子,タイトルID,エピソードID,カットID,バージョンID)
*/
listEntry.prototype.push=function(myIdentifier){
    if(nas.Pm.compareIdentifier(this.issues[0].identifier,myIdentifier) < 1){return false;}
    var dataInfo=nas.Pm.parseIdentifier(myIdentifier);
    if(dataInfo.status){
        var issueArray = [
            encodeURIComponent(dataInfo.line.toString(true)),
            encodeURIComponent(dataInfo.stage.toString(true)),
            encodeURIComponent(dataInfo.job.toString(true)),
            dataInfo.status.toString(true)
        ];
    }else if(dataInfo.mNode){
        var issueArray = [
            encodeURIComponent(dataInfo.line.toString(true)),
            encodeURIComponent(dataInfo.stage.toString(true)),
            encodeURIComponent(dataInfo.job.toString(true)),
            encodeURIComponent(dataInfo.status)
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
 *      エントリのステータスを取得する
 *      記録位置は、最終ジョブ
 *  @returns    {Object}
 *      job(node)Status
 */
listEntry.prototype.getStatus=function(){
    if(this.status instanceof nas.Pm.JobStatus) return this.status;
    var currentStatusDescription = this.issues[this.issues.length-1][3];
    
    if((! currentStatusDescription)&&(this.issues[this.issues.length-1].identifier)){
        var currenEntryInfo = nas.Pm.parseIdentifier(this.issues[this.issues.length-1].identifier);
        return currenEntryInfo.status;
    }
    return new nas.Pm.JobStatus(currentStatusDescription);
}
/*
 *      エントリのステータスを設定する
 *      記録対象は最終ジョブのエントリ
 *      先のデータによって設定可能データは制限される
 *      管理権限がある場合はAbortedに変更可能
 *
 *      いったんAbortedになったエントリは基本的に変更不可
 *  Startup > Active
 *  Active  > Hold/Fixed:assignment:comment
 *  Hold    > Active
 *  Fixed   > Active/Aborted(要権限)
 *  
 *  フロート化・シンクの  >>  サインは状態の遷移ではなくコピーして登録であり。
 *  逆方は、全てのステータスからの複製が可能
 *  移行時にもともとのステータスは保存されない
 *  
 *  現状 >> 遷移先 > 遷移後のサーバ上のデータのステータス
 *  Float   >> Startup:assignment:comment/Fixed:assignment:comment  > (元データはサーバ上には無い)
 *  Startup >> Float > 変わらず
 *  Active  >> Float > Hold
 *  Hold    >> Float > 変わらず
 *  Fixed   >> Float > 変わらず
 *  
 *  ドキュメントはFloat化する際に必ず複製されて安定化遷移を行う。
 *  リポジトリ上には決してFloat状態のエントリを持たない
 *  エラー等により、Float状態のデータをリポジトリ上に確認した場合は、同ジョブのStartup、またはFixed状態に自動で遷移する?
 *  
 *      戻り値は現在のステータス
 *      ステータスオブジェクトが多分必要
 *      あとswitch文でない方がヨサゲ
 *      必要に従ってissuesを更新または追加する
 *         Jobが進まないときは更新
 *         Jobが進む際に追加  ただし追加時は  listEntry.push(Idf)で追加なので注意
 *      まだステータスの副次情報は実装しないので配列のまま保存しないように注意
 *    ステータスを複合オブジェクト JobStatusとして実装0809
 *  
 *  
 *      issues.identifier/.time の設定が抜けている  2017.0429 早急に要修正！！！！！
 *      timeは基本的に変更が無いがidentifierは,
 *      statusの変更に従って必ず変わる
 *      setStatusの引数がJobStatus  であれば変換は行わない
 *      
 *      引数にFloatステータスが入った場合は不正引数とする
 *      サーバ上のエントリのステータスがFloatになることは無い
*/

listEntry.prototype.setStatus=function(myStatus){
    var currentIssue  = this.issues[this.issues.length-1];
    var currentStatus = new nas.Xps.JobStatus(currentIssue[3]);//オブジェクト化
    if(myStatus instanceof JobStatus){
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
if(config.dbg) console.log(currentIssue[3]);
    return new nas.Xps.JobStatus(currentIssue[3]);
}

/**
 *  @returns {Object listEntry|false} 削除した自身のオブジェクト 操作失敗時はfalse
 *   エントリが自分自身を削除する
 *   引数なし
 *   parentが存在しない場合は削除に失敗する
 */
listEntry.prototype.remove=function(){
    if(! this.parent) return false;
    for (var ix=0;ix<this.parent.entryList.length;ix++){
        if(this.parent.entryList[ix].issues[0].cutID == this.issues[0].cutID){
            if(this.type == 'xpst') this.parent.entryList.shotCount --;
            if(this.type == 'xmap') this.parent.entryList.xmapCount --;
            return this.parent.entryList.splice(ix,1);
        }
    }
    return false;
}
/**
 *   listEntryから識別子を抽出するメソッド
 *   自己の情報を組み上げて最も正しいと思われる識別子で戻す
 */
listEntry.prototype.getIdentifier=function(issueOffset){
    if(typeof issueOffset == 'undefined') issueOffset =-1;

    var myTitle = (this.titleID)?   this.parent.title (this.titleID):this.dataInfo.title;
    var myOpus  = (this.episodeID)? this.parent.opus  (this.episodeID):this.dataInfo.opus;
    var myResult = [
        encodeURIComponent(myTitle.name),
        '#',encodeURIComponent(myOpus.name),'//',
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
 *  @constractor
 *      エントリリストコレクション
 *      配列ベースで以下のメソッドを持つ
 *  
 *  .put(entry)         ;エントリ追加
 *  .remove(idf)        ;idf指定でエントリ削除
 *  .getByIdf(idf)      ;idf指定でエントリを返す
 *  .getByToken(token)  ;ネットワークのみ
 *  .getByType(type)    ;タイプ指定でサブリストを返す
 *  識別子にタイムスタンプが拡張されpmdb|stbdが拡張されているのでそれに対応
 *  エントリ選択に対してタイムスタンプ違いのケースでも値を返す
 *  Xpstエントリは
 */
function listEntryCollection (){
    this.shotCount  = 0;
    this.xmapCount  = 0;
/**
    @method
    コレクションにエントリを追加する
    同識別子のエントリが存在する場合は上書き（置換）
    存在しなかった場合は新規に追加する
    @params     {Object listEntry}    myEntry
    @returns    {Object listEntry}
        データを登録したオブジェクト
*/
      this.put=function (myEntry){
        for (var ix = 0 ; ix < this.length ; ix ++){
//            if(this[ix].toString().split('//')[0] != myEntry.toString().split('//')[0]) continue;
            if (
                (this[ix].type != myEntry.type)||
                (this[ix].product != myEntry.toString().split('//')[0])
            ) continue;
            if (nas.Pm.compareIdentifier(this[ix].toString(true),myEntry.toString(true)) >= 1 ) {
                this[ix]=myEntry;
                return myEntry;
            }
        }
        if(myEntry.type == 'xpst'){
//            console.log(myEntry.sci);
            this.shotCount ++
        };
        if(myEntry.type == 'xmap') this.xmapCount ++;
        return this.push(myEntry);
    }
/*
    識別子指定でコレクションからエントリを削除する
    存在しなかった場合はfalse
*/
    this.remove=function (myIdentifier){
        for (var ix = 0 ; ix < this.length ; ix ++){
            if(this[ix].product != myIdentifier.split('//')[0]) continue;
            if (nas.Pm.compareIdentifier(this[ix].toString(true),myIdentifier) >= 1 ) {
                if(this.type == 'xpst') this.shotCount --;
                if(this.type == 'xmap') this.xmapCount --;
                return this.splice(ix,1);
            }
        }
        return false;
    }
/**　<pre>
 *    Repository.entry  の基底メソッド
 *    識別子を指定してエントリを得る
 *    </pre>
 *    @params {String}    dataIdentifier
 *        識別子指定
 *    @params {Number}    opt
 *        一致レベルオプション
 *    @params {Boolean}    compareType
 *        typeを比較対象とする
 *        タイプ違いがアンマッチとなる
 *        
 *    第二引数で一致レベルを指定
 *    指定がない場合は、カットNo一致 (opt = 1)
 *    -4  <NO-match>
 *    -3  server
 *    -2  repository
 *    -1  title
 *    0   opus    (プロダクト一致)
 *    1   カットNo
 *    2   ライン
 *    3   ステージ
 *    4   ジョブ
 *    最初にヒットしたエントリを戻す
 */
    this.getByIdf=function (myIdentifier,opt,compareType){
        if(typeof opt == 'undefined') opt = 1;
        for (var ix = 0 ; ix < this.length ; ix ++){
//  高速化スキップは文字列比較だと取りこぼしが多いので禁止  それよりはcompareIdentifier自体を高速化すること
            if (nas.Pm.compareIdentifier(this[ix].toString(true),myIdentifier,compareType) >= opt ) return this[ix];
        }
        return null;
    }
/*
 *   トークンでエントリを取得
 *   バージョンの指定は不能
 *  params  {String} myToken
 */
    this.getByToken=function (myToken){
        for (var ix = 0 ; ix < this.length ; ix ++){
            for (var sx = 0 ; sx < this[ix].issues.length ; sx ++){
                if (
                    (this[ix].issues[sx].cutID)&&(this[ix].issues[sx].cutID == myToken)
                ) return this[ix];
            }
        }
        return null;
    }
/**
 *    タイプ指定でサブリストを配列戻し pmdb|stbd|xmap|xpst
 *  params  {String} type
 */
    this.getByType = function(type){
        if(! type) type = 'xpst';
        var result = [];
        for (var ix = 0 ; ix < this.length ; ix ++){
            if (this[ix].type == type) result.push(this[ix]);
        }
        return result;
    }
};
listEntryCollection.prototype = Array.prototype;
/**
    ローカルストレージサービス
    ローカルリポジトリをサービスする専用のサービス
*/
var localStorageStore = new ServiceNode(
    'localStorageStore',
    'localStorage://info.nekomataya.remaping',
    'localStorage'
)
localStorageStore.pmdb = new nas.Pm.PmDomain(
    nas.Pm,
    encodeURI(".localStorage://info.nekomataya.remaping")
);
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
    プロダクトデータは  DBに直接接続して情報ストアするオブジェクト
    JSONで通信を行う場合に必須
    entryList(listEntryコレクション)はこのデータから生成するように変更される？
    またはentryListからproductsDataを生成する  同時か？
    動作試験のため  maxEntryを増やしてある  10>32>100 190922
    をカット数として処理する(xpstエントリ数)
*/
var localRepository = {
    name:'localRepository',
    service:localStorageStore,
    url:'localStorage:',
    id:'00000',
    owner:new nas.UserInfo(),
    pmdb:new nas.Pm.PmDomain(
        localStorageStore,
        ['',localStorageStore.url,'00000'].join('.')
    ),
    baseStorage:{
        productsData:[],
        entryList:new listEntryCollection(),
        keyPrefix:"info.nekomataya.remaping.dataStore.",
        maxEntry:100
    }
};
/**
 *    識別子からデータ型を取得
 *    識別子の末尾を参照してデータ型を返す
 *    該当するオブジェクトがない場合はnullを戻す
 *
 *    @params {String}  myIdentifier
 *        識別子またはトークン
 *
 *    @returns    {String}
 *        data type xps|xmap|pmdb|stbd
 */
localRepository.baseStorage.type=function(myIdentifier,searchDepth){
    if(! searchDepth) searchDepth = 0;
    var myIdf= nas.Pm.parseIdentifier(myIdentifier);
    return myIdf.type;
}
/**
    TITLE取得
    指定タイトル情報と一致するproductsデータ内のエントリを返す
    
    @params {String}  myIdentifier
        識別子またはトークン
    @params {Number}  searchDepth
        検索深度 0:タイトルのみ  1:エピソードからもタイトルを探す  2:カットからも

    エピソードやカットのトークンからもタイトルノードを返す
    深度指定省略時は 0
    該当するオブジェクトがない場合はnullを戻す
    
    pmdb移行後はpmdb内部を検索して戻す
*/
localRepository.baseStorage.title=function(myIdentifier,searchDepth){
    if(! searchDepth) searchDepth = 0;
    var myIdf= nas.Pm.parseIdentifier(myIdentifier);
    var isTkn = (myIdf.title == myIdentifier)? true:false;
    for ( var idx = 0 ;idx <this.productsData.length;idx ++){
/*titleをオブジェクト化しているので同一判定をタイトルのメソッドに委ねる必要あり  2019 5 30
            (myIdf.product.title  == this.productsData[idx].name)||
*/
        if(
            (myIdentifier == this.productsData[idx].token)||
            (nas.Pm.compareTitles(myIdf.title,this.productsData[idx].name))||
            ((! isTkn)&&(myIdf.title.token == this.productsData[idx].token))
        ) return this.productsData[idx];
        if((searchDepth > 0)&&(this.productsData[idx].episodes)){
            for(var epx = 0 ;epx <this.productsData[idx].episodes[0].length;epx++){
                if(
                    (myIdf.product.opus == this.productsData[idx].episodes[0][epx].name)||
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

/**
    OPUS取得
引数:
    myIdentifier    識別子またはトークン

    識別子またはトークンからエピソードノードを戻す
    該当するオブジェクトがない場合はnullを戻す
*/
localRepository.baseStorage.opus=function(myIdentifier,searchDepth){
//console.log([myIdentifier,searchDepth])
    if(! searchDepth) searchDepth = 0;
    var currentOpus = nas.Pm.parseProduct(myIdentifier);
    var currentTitle = nas.pmdb.workTitles.entry(currentOpus.title);
    if(! currentTitle) currentTitle = currentOpus.title;
    
    var isTkn = (
        ((currentOpus.opus =='')&&(currentOpus.title == myIdentifier))||
        (myIdentifier.indexOf(this.keyPrefix)==0)
    )? true:false;

//console.log([searchDepth,currentOpus,isTkn])
    for ( var idx = 0 ;idx <this.productsData.length;idx ++){
    //タイトル不一致を排除 文字列一致で判定しているのでここに不整合が出る
    /*タイトルの調整取得を行う
      (String(currentOpus.title).indexOf(this.productsData[idx].name) < 0))||
          */
//console.log([currentTitle,this.productsData[idx].name]);
//console.log(nas.Pm.compareTitles(currentTitle,this.productsData[idx].name));
    if(
        ((! isTkn ) &&
        (! nas.Pm.compareTitles(currentTitle,this.productsData[idx].name)))||
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
/**
    CUT取得
    myIdentifier は識別子またはトークン
    カットノードを戻す
*/
localRepository.baseStorage.cut=function(myIdentifier){
    var target = nas.Pm.parseIdentifier(myIdentifier);
    var isTkn = ((target.cut =='')&&(target.product.title == myIdentifier))? true:false;
//console.log([myIdentifier,target,isTkn]);
//console.log(this.productsData)
    for ( var idx = 0 ;idx <this.productsData.length;idx ++){
    if(
        (! this.productsData[idx].episodes )||(
            (! isTkn )&&
            (String(target.product.title).indexOf(this.productsData[idx].name) < 0)
        )
      ) continue;
//console.log(this.productsData[idx].episodes[0]);
      for (var eid = 0 ;eid < this.productsData[idx].episodes[0].length; eid ++){
        if (
            (! this.productsData[idx].episodes[0][eid].cuts )||(
                (! isTkn ) &&
                (String(target.product.opus).indexOf(this.productsData[idx].episodes[0][eid].name) < 0)
            )
        ) continue;
//console.log(this.productsData[idx].episodes[0][eid].cuts[0]);
//console.log(target);
        for (var cid = 0 ; cid < this.productsData[idx].episodes[0][eid].cuts[0].length ; cid ++){
            if (
                ((isTkn)&&(myIdentifier == this.productsData[idx].episodes[0][eid].cuts[0][cid].token))||
                ((! isTkn)&&(nas.Pm.compareCutIdf(target.sci[0].name,this.productsData[idx].episodes[0][eid].cuts[0][cid].name) == 0))
            ) return this.productsData[idx].episodes[0][eid].cuts[0][cid];
        };
      };
    };
    return null;
}
/**
 *  @params {String}    form
 *      output form type Object|JSON|full-dump|plain-text|<propname>
 *  @returns {String}
 *      formated string
 *   再初期化可能なだけの情報を書き出すメソッド
 *   オブジェクト戻しも可能に
 */
serviceAgent._getRepositoryStatus = function(form){
    var result = {
        name:this.name,
        service:this.service.url,
        url:this.url,
        id:this.id
    };
    switch (form){
    case 'Object':
        return result;
    break;
    case 'JSON':
        return JSON.stringify(result);
    break;
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.service.url,
            this.url,
            this.id
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.name,
            '\tname:'+this.name,
            '\tservice:'+this.service.url,
            '\turl:'+this.url,
            '\tid:'+this.id
        ]).join('\n');
    break;
    default:
        return (this[form])? this[form]:this.name;
    }
};

localRepository.getStatus = serviceAgent._getRepositoryStatus;
FileRepository.prototype.getStatus = serviceAgent._getRepositoryStatus;
/**
    pmdbを検索して該当するエントリを返す
    リポジトリ汎用メソッド
    @mathod
    @params	{String}	myIdentifier
        データ識別子
    @params	{Number}	opt
        戻値指定オプション title|product|shot
    @returns	{Object}
        識別子に該当するSBShot(CUT)|SBxMap(CUTBag)|StoryBoard(StoryBoard)|PmDomain(pmdb)
        または title|product|shot情報
        データ照合に失敗した場合はnull
    
    issues他のプロパティは受取先で評価
    指定の識別子との比較は
    title,opus,scene,cut の４点の比較で行う(秒数とサブタイトルは比較しない)
    optを加えるとtitle,opus(= product)のみを比較
    現在カットが０（未登録）の登録済みプロダクトの場合  true/-1 false/0 を戻す
    トークンでの検索はできない
    タイトル・エピソード等の名称で(括弧くくり)または*のみのエントリはすべてのエントリとマッチしない仕様を追加
*/
serviceAgent._entry=function(identifier,opt){
//    if(! opt) opt = 'none';
    var dataInfo = nas.Pm.parseIdentifier(identifier);
console.log(dataInfo);
    if(
        (! dataInfo.product) ||
        (dataInfo.product.title.match(/^\(.*\)$|^\*+$/)) ||
        (dataInfo.product.opus.match(/^\(.*\)$|^\*+$/)) ||
        ((opt > 0)&&(dataInfo.sci[0].cut.match(/^\(.*\)$|^\*+$/))) 
    ) return null;
//console.log(dataInfo);
    var title   = (dataInfo.title instanceof nas.Pm.WorkTitle )? dataInfo.title:this.pmdb.workTitles.entry(dataInfo.title);
//console.log(title);
    var product = ((!(title))||(dataInfo.product.opus == ''))? null : title.opuses.entry(dataInfo.product.opus);
//console.log(product);
    var shot    = ((product)&&(product.stbd)&&(dataInfo.sci.length))? product.stbd.entry(dataInfo.sci[0].name):null;
//console.log(shot);
  switch (opt){
  case "title"  :   return (title)? title:null     ; break;
  case "opus":
  case "episode":
  case "product":   return (product)? product:null ; break;
  case "cut"    :
  case "shot"   :   return (shot)? shot:null       ; break;
  default       :
    if(dataInfo.type == 'xpst'){
//識別子でissueが指定された場合で一致エントリが存在する場合トークンのみを持った一時オブジェクト(node)で返す
console.log(dataInfo);
        if((dataInfo.mNode)&&(shot)) return shot.searchNode(dataInfo.mNode);
        return shot;
    }else if(dataInfo.type == 'xmap'){
        return (shot)?shot.xmap : null ;
    }else if(dataInfo.type == 'stbd'){
        return (product)? product.stbd:null ;
    }else if(dataInfo.type == 'pmdb'){
        if(! shot){
            if(! product){
                if(! title){
                    return this.pmdb;
                }else{
                    return title.pmdb;
                }
            }else{
                return product.pmdb;
            }
        }
    } else {
        return null;
    }
  }
}
localRepository.entry = serviceAgent._entry;

localRepository.baseStorage.entry = function(idf,opt,compareType){
    return this.entryList.getByIdf(idf,opt,compareType);
};
/**
    pmdbをtoken検索して該当するエントリを返す
    リポジトリ汎用メソッド
    @mathod
    @params	{String}	targetToken
        データ識別子
    @returns	{Object}
        識別子に該当するSBShot(CUT)|SBxMap(CUTBag)|StoryBoard(StoryBoard)|PmDomain(pmdb)
        または title|product|shot情報
        データ照合に失敗した場合はnull
    
    issues他のプロパティは受取先で評価
    指定の識別子との比較は
    title,opus,scene,cut の４点の比較で行う(秒数とサブタイトルは比較しない)
    optを加えるとtitle,opus(= product)のみを比較
    現在カットが０（未登録）の登録済みプロダクトの場合  true/-1 false/0 を戻す
    トークンでの検索専用
    タイトル・エピソード等の名称で(括弧くくり)または*のみのエントリはすべてのエントリとマッチしない仕様を追加
*/
serviceAgent._entryByToken=function(targetToken){
	var title;var product;var shot;var xmap;
    title = this.pmdb.workTitles.entry(targetToken);
    if(title) return title;
    product = this.pmdb.products.entry(targetToken);
    if(product) return product;
	for(var kyd in this.pmdb.products.members){
	    var opus = this.pmdb.products.members[kyd];
		shot = opus.stbd.getEntryByToken(targetToken,'cut');
		if (shot) return shot;
		xmap = opus.stbd.getEntryByToken(targetToken,'cut_bag');
		if (xmap) return xmap;
	} 
	return null;
}
localRepository.entryByToken = serviceAgent._entryByToken;

/**
 *    debug function
 *    ローカルストレージのキー一覧ダンプ表示
 *  @params {String|RegExp}   kwd
 *  
 *  
 */
localRepository.baseStorage.ls = function(kwd){
    var result = [];
    if(typeof kwd == 'undefined') kwd = ".*";
    
    var Kwd = (kwd instanceof RegExp)? kwd:new RegExp(kwd);
    for (var i = 0 ;i < localStorage.length; i++){
        var entry = decodeURIComponent(localStorage.key(i)).replace(/^info.+dataStore\./,'');
        if(entry.match(Kwd)){
//            console.log(i + " : " +entry);
            result.push(entry);
        };
    };
    return result.length +'\n'+result.join('\n');
}
/**
    キーナンバーでエントリ内容をダンプ(デバッグ用)
 */
localRepository.baseStorage.dumpKey = function(kid){
console.log("dump item kid :" + kid + " : " +decodeURIComponent(localStorage.key(i)));
console.log(localStorage.getItem(localStorage.key(kid)));
//    return localStorage.getItem(localStorage.key(kid));
}

/**
    キーナンバーでエントリをリムーブ(デバッグ用)
 */
localRepository.baseStorage.removeKey = function(kid){
console.log("remove item kid :" + kid + " : " +decodeURIComponent(localStorage.key(i)));
    return localStorage.removeItem(localStorage.key(kid));
//    for (var i = 0 ;i < localStorage.length; i++){    }
}

/**
 *    debug function
 *    ローカルストレージのキーIDによる値の取得
 * キーIDは恒久的なインデクスではないので要注意
 */
localRepository.baseStorage.getItemByKey = function(keyId){
    return localStorage.getItem(localStorage.key(keyId));
}

/**
 *    debug function
 *    エントリリストのダンプ表示
 *    @params {String}    idf
 *    引数に識別子を与えると識別子の一致したエントリに表示を制限する
 *
 */
localRepository.baseStorage.entryList.dump = function(idf){
    var result = [];
    for (var i = 0 ;i < this.length; i++){
        var currentIdf = this[i].issues[0].identifier;
        if(idf){
            var idfInfo = nas.Pm.parseIdentifier(idf);
            var threshold = 7;
            if(idfInfo.status){
                 if(! idfInfo.status.clientIdf){
                    threshold = 6;
                 } else if(! idfInfo.status.assign){
                     threshold = 5;
                 } else {
                     threshold = 4;
                 }
            }
            if(! idfInfo.job){
                threshold = 3;
            }
            if(! idfInfo.stage){
                threshold = 2;
            }
            if(! idfInfo.line){
                threshold = 1;
            }
            if(idfInfo.sci.length == 0){
                threshold = 0;
            }
            if(!idfInfo.opus){
                threshold = -1;
            }
            if((idfInfo.dataNode.server)||(idfInfo.dataNode.repository)){
                threshold = -2;
                if(! idfInfo.dataNode.repository){
                    threshold = -3;
                }
            }
            if(nas.Pm.compareIdentifier(idf,currentIdf,false,true) >= threshold)
            result.push(decodeURIComponent(currentIdf));
        }else{
            result.push(decodeURIComponent(currentIdf));
        }
    }
    return result.join('\n');
}
/**<pre>
    ローカルリポジトリの初期化手続き
    同期処理を完了して非同期処理をローンチしたタイミングでtrueを返す。
    リポジトリのpmdbを取得してそこに含まれるworkTitles/productsから基本のブラウズリストを作成する。
    リポジトリ内にpmdbが存在しない場合はシステムのpmdbの内容をコピーしたデフォルトpmdbを作成して
    localRepository.pmdbをセットする（ここでは保存しない）
    初期化手続き内でセットアップしたpmdbはデータ取得後にpush(保存)
    初期化済みフラグはpmdbが{}からオブジェクトであるか否かで判定
</pre>
*/
localRepository.init=function(){
console.log('localRepository INIT');
console.log(this.pmdb);
    if(typeof this.pmdb.token != 'undefined') return ;//token の有無で判定　初期化済みの場合は二度目を行わない
//    this.pmdb = new nas.Pm.PmDomain(nas.Pm,'.localStorage:.localrepository.00000//');
    this.pmdb.token = this.baseStorage.keyPrefix + '.localStorage:.localrepository.00000//.pmdb';
    var pmdbStream = this.baseStorage.entryList.getByIdf(this.pmdb.token,-2,'pmdb');//リポジトリ一致　タイプ指定
    if(pmdbStream){
//保存されたキャッシュが存在するので読み出す　タイムスタンプも取得
console.log('restore pmdb from stored data in localStorage : ');
        this.pmdb.parseConfig(pmdbStream);
    }else{
//保存されたキャッシュが存在しないので現データ内容からビルド
console.log('no data entry : '+this.pmdb.token);
console.log('clear workTitle|Products Table for :'+this.pmdb.token);
        this.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this.pmdb);
        this.pmdb.products   = new nas.Pm.OpusCollection(this.pmdb);
    }
//console.log('localStorage init : build localRepository pmdb');
//    this.baseStorage.getProducts();//updatePMDB内部でbaseStorageへの問い合わせを行いその問い合わせがentryListを更新する
    this.updatePMDB();
        return true;
}

/*
    ローカルストレージのキー値は、以下の構造で　キープレフィックスとデータ識別部と含む
info.nekomataya.remaping.dataStore
.localStorage
.localRepository
.00000
.%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E3%82%84%E3%81%BE
#0%3APilot[%E9%96%8B%E7%99%BA%E3%83%86%E3%82%B9%E3%83%88%E3%83%87%E3%83%BC%E3%82%BF]
//s-c26(192)
//0%3A(%E6%9C%AC%E7%B7%9A)
//0%3Alayout
//0%3Ainit
//Startup
.1586996954559
.xpst

    <keyprefix>
    .<server>    *
    .<repository-name>    *
    .<repository-idf>    *
    .<TITLE>
    #<OPUS>
    //<SCI>
    //<LINE>
    //<STAGE>
    //<JOB>
    //<STATUS>
    .<timestamp>    *
    .<datatype>        *

*印は省略のケースあり

        キープレフィックス部　固定値
    info.nekomataya.remaping.dataStore
        キープレフィックスごとキーをパースできるように
        
    データ識別部に、ステータス・タイムスタンプ情報を含むため、
    キー値を無条件でユニークキーとして使用することはできない
    ユニークキーの抽出条件
    pmdb|stbd    キー値から.<timestamp>を除いた値
    xmap        キー値から//<SCI>-<timestamp>を除いた値
    xpst        キー値から.<timestamp>を除いた値

*/
/**
 *  pmdbを更新するリポジトリメソッド
 *  リポジトリpmdb内の workTitles,products テーブルを更新する
 *  リポジトリpmdb内の productsのエントリ(xmaps contents) テーブルを更新する
 *  ストレージ内のデータエントリをサーチしてタイムスタンプを照合
 *  テーブルのタイムスタンプよりも新しいデータが有れば関連テーブルを更新する
 *  更新の発生したタイトルのエピソードを更に更新するか？
 */
localRepository.updatePMDB = function(){
console.log('start update pmdb for localstorage');
//ローカルストレージの全データを検査 pmdbのタイムスタンプと比較して大きなもののデータを取得してpmdb更新する
    var keyCount=localStorage.length;
    var timestampCash = 0;
    var updated = {
            'pmdb'      :false,
            'workTitles':false,
            'products'  :false
        }
    for (var kid=0;kid<keyCount;kid++){
        var currentWorkTitle;
        var currentProduct;
        var currentIdentifier;
        var dataInfo;
//キープレフィックスの有無でデータを選別
        if(localStorage.key(kid).indexOf(this.baseStorage.keyPrefix)!=0) continue;
//Idf取得して情報をパース
        currentIdentifier=localStorage.key(kid).slice(this.baseStorage.keyPrefix.length);
        dataInfo=nas.Pm.parseIdentifier(currentIdentifier);
//エントリがタイムスタンプをもち かつ pmdbと同じかより古い場合はすべて処理スキップ
        if((dataInfo.timestamp)&&(dataInfo.timestamp <= this.pmdb.timestamp)){
console.log('skiped');
            continue;
        }
//変更フラグを立ててタイムスタンプの最新データをキャッシュ
        if(! updated.pmdb ) updated.pmdb = true;
        if((dataInfo.timestamp)&&(dataInfo.timestamp > timestampCash)) timestampCash = dataInfo.timestamp;
//データエントリの所属タイトルとエピソードを文字列で取得
        var titleStr = (dataInfo.title instanceof nas.Pm.WorkTitle)?
            dataInfo.product.title : dataInfo.title;//文字列
        var epStr    = (
            (dataInfo.opus instanceof nas.Pm.Opus)?
            dataInfo.product.opus  : dataInfo.opus
        );//文字列
//識別子から得たタイトルがpmdb.workTitlesに登録されているかを検査 未登録エントリの場合新規に登録
        currentWorkTitle = this.pmdb.workTitles.entry(titleStr);//取得
        if(! currentWorkTitle){
//タイトルDB内に該当データがないので登録を行いdataInfoを更新
            var newTitle   = new nas.Pm.WorkTitle(titleStr);//タイトル作成
            newTitle.id    = nas.uuid();
            newTitle.token = localStorage.key(kid);//初回ヒットのエントリをタイトルtokenにする
//LocalRepositoryの場合 タイトル・エピソードのトークンはpmdbのトークンを使用する様に調整
//この時点ではトークンが存在しないので注意
            newTitle.pmdb  = new nas.Pm.PmDomain(
                localRepository,
                localRepository.pmdb.dataNode+dataInfo.product.title
            );
            newTitle.pmdb.token     = "";//未保存のためトークンをクリア
            newTitle.pmdb.timestamp = 0;//タイムスタンプをリセット
            var res = this.pmdb.workTitles.addMembers(newTitle);
            if(res.length > 0){
                dataInfo.title = newTitle;
                currentWorkTitle = res[0];// pmdb prop
            }else{
//異常処理　このケースで追加に失敗することはほぼない
                currentWorkTitle = this.pmdb.workTitles.entry(titleStr);
                dataInfo.title = workTitle;
            }
        }else if(titleStr){
//タイトル既存なのでオブジェクトを取得
            currentWorkTitle = this.pmdb.workTitles.entry(titleStr);
        }else{
//エントリーがリポジトリpmdbデータである場合等 タイトルデータを持たないケースも有る
            currentWorkTitle = null;
        }
//DB変更フラグ
        if((currentWorkTitle)&&(! updated.workTitles )) updated.workTitles = true;
//識別子から得たエピソードがprodoctworkTitle.opusesに登録されているか検査
//未登録エントリの場合 新規に登録
        if((epStr)&&(currentWorkTitle)){
            currentProduct = currentWorkTitle.opuses.entry(titleStr+'#'+epStr);
            if(! currentProduct){
//console.log('detect newEpisode : '+ titleStr+'#'+epStr);
                currentProduct = new nas.Pm.Opus(
                    [titleStr,epStr].join('#'),
                    dataInfo.uniquekey,
                    epStr,
                    dataInfo.subtitle,
                    currentWorkTitle
                );
                currentProduct.pmdb = new nas.Pm.PmDomain(
                    currentWorkTitle,
                    currentWorkTitle.pmdb.dataNode+'#'+epStr
                    );
                currentWorkTitle.opuses.addMembers(currentProduct);
                localRepository.pmdb.products.addMembers(currentProduct);
            }
            if(! currentProduct.stbd) currentProduct.stbd = new nas.StoryBoard(titleStr+'#'+epStr);
        }else{
//エントリーがプロダクトデータを持たないケースも有る
            currentProduct = null;
        }
//DB変更フラグ
        if((currentProduct)&&(! updated.products )) updated.products = true;

        switch(dataInfo.type){
        case 'pmdb':
//pmdbエントリ ターゲットを特定
/*
localRepositoryの場合は以下の５対象レベルを末端側から解決
    //title#ep    エピソード
    //title        タイトル
    .server.*    リポジトリ
    .server        サーバレベル
    .            ルートレベル
*/
            var targetPMDB;
            if(currentProduct){
                targetPMDB = currentProduct.pmdb;
            }else if(currentTitle){
                targetPMDB = currentTitle.pmdb;
            }else if(dataInfo.dataNode.token){
                targetPMDB = this.pmdb;
            }else{
                targetPMDB = nas.Pm.pmdb;//　これは一時的な上書き
            }
            targetPMDB.parseConfig(localStorage.getItem(localStorage.key(kid)));
            if(this.pmdb !== targetPMDB) targetPMDB.timestamp = dataInfo.timestamp;
            this.pmdb.timestamp  = dataInfo.timestamp;
        break;
        case 'stbd':
//stbdエントリ
            currentProduct.stbd.parseScript(localStorage.getItem(localStorage.key(kid)));
            currentProduct.stbd.timestamp = dataInfo.timestamp;
        break;
        case 'xmap':
//xmapエントリ
            var myShot = currentProduct.stbd.entry(dataInfo.sci[0].toString('cut'));
            if(myShot){
//既存エントリxmapの兼用数を比較して未登録エントリを追加する　エントリ過多の場合はワーニング
                var myxMap = myShot.xmap;
                if(myxMap.inherit.length > dataInfo.sci.length){
                    console.log('bad data exists :');console.log(dataInfo);
                };//and NOP
            }else{
//新規エントリをstbdに追加
//あらかじめキャリアとなるmyXmapを作成（ショットのリンク無しで先行作成）
                var myXmap = new nas.StoryBoard.SBxMap(
                  currentProduct.stbd,dataInfo.inherit.join('/')
                );
                myXmap.token     = localStorage.key(kid);
                if(dataInfo.timestamp) myXmap.timestamp = dataInfo.timestamp;//timestamp転記
                if(dataInfo.mNode)     myXmap.writeNode(dataInfo.mNode);//ノード書込
// nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
                for (var s = 0; s < dataInfo.sci.length ; s ++){
                    if(currentProduct.stbd.entry(dataInfo.sci[s].toString('cut'))){
                        continue;//ここで既存エントリをskip
                    }
                    var newClmn = new nas.StoryBoard.SBColumn(currentProduct.stbd,0);
                    newClmn.indexText = dataInfo.sci[s].cut;
                    newClmn.timeText  = dataInfo.sci[s].time;
                    var newShot = new nas.StoryBoard.SBShot(currentProduct.stbd,dataInfo.sci[s],[newClmn]);
                    var added   = currentProduct.stbd.edit('add',newShot);//単純追加
                };
            };
        break;
        default:
    if (currentProduct){
//xpst entry
//console.log('detect cut :'+dataInfo.sci);
            var myShot = currentProduct.stbd.entry(dataInfo.sci[0].toString('cut'));
            if(myShot){
//stbd内に既存エントリあり(=ｘMapも登録済み) xMapに管理ノードを追加
//console.log('\t\tupdate Entry :'+myShot.name);console.log(myShot);//追加情報書き込み
                var currentxMap = myShot.xmap;
//console.log(
                myShot.writeNode(dataInfo.mNode,localStorage.key(kid));
//);console.log(
                currentxMap.writeNode(dataInfo.mNode);
//);
                if((! myShot.timestamp)||(dataInfo.timestamp > myShot.timestamp)){
//既存ショットのタイムスタンプを比較して大きい方で更新する
//タイムスタンプが書き換わる際にShot.tokenを同時に更新
                    myShot.timestamp = dataInfo.timestamp;
                    myShot.token     = localStorage.key(kid);
                }
//console.log(myShot);
            }else{
//nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
//console.log('\tset Entry :'+dataInfo.sci);//追加情報書き込み
               var newClmn = new nas.StoryBoard.SBColumn(currentProduct.stbd,0);
                newClmn.indexText = dataInfo.sci[0].cut;
                newClmn.timeText = dataInfo.sci[0].time;
                var newShot = new nas.StoryBoard.SBShot(currentProduct.stbd,dataInfo.sci[0],[newClmn]);
                var shotCount = currentProduct.stbd.contents.length;
                var added   = currentProduct.stbd.edit('add',newShot);//単純追加
//console.log('add Entry');console.log(added[0])
//console.log(dataInfo.mNode);
                    added[0].writeNode(dataInfo.mNode,localStorage.key(kid));
                    added[0].timestamp = dataInfo.timestamp;
                    added[0].token     = localStorage.key(kid);
                    added[0].xmap.writeNode(dataInfo.mNode);
            }
    }else{
console.log(dataInfo);
console.log('no currentProduct continue');
    }
        }
        continue;
    };
//タイムスタンプの最新データでpmdbのタイムスタンプを置き換え
    if(updated.pmdb)       this.pmdb.timestamp = timestampCash;
    if(updated.workTitles) this.pmdb.workTitles.timestamp = timestampCash;
    if(updated.products)   this.pmdb.products.timestamp = timestampCash;

console.log(localRepository.pmdb);
};//localRepository.updatePMDB

/**
 *  リポジトリのデータノードを返す
 *  returns {String}
 *      data node address  .<serverURL>.<repositoryName>.<repositoryID>//
 */
localRepository.toString = function(){
    return ['',this.url,this.name,'00000'].join(".")+'//';
}
/**<pre>
	localRepository用　entryList構築専用メソッド
    プロダクト(タイトル)データを更新
    リポジトリ内のデータを検索してタイトル一覧をビルド
    タイトル一覧をクリアして更新する エピソード更新を呼び出す

    取得したデータを複合して、サービス上のデータ構造を保持する単一のオブジェクトに
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得するように変更
    引き続きの処理を行う際はコールバック渡し
    コールバックがない場合は、全プロダクトの詳細を取得？
    プロダクトデータ取得のみの場合は  空動作のコールバックを渡す必要あり
    myToken 引数がある場合はtokenが一致したエントリのみを処理する
    myToken は配列でも良い
    </pre>
    @params  {Array}   myToken
        更新するタイトルのトークン配列
 */
localRepository.baseStorage.getProducts=function(callback,callback2,myToken){
        if(typeof myToken == 'undefined') myToken =[];
        if(!(myToken instanceof Array)) myToken = [myToken];
        var keyCount=localStorage.length;
//ローカルストレージの全データを検査
        for (var kid=0;kid<keyCount;kid++){
//キープレフィックスの有無でデータを選別
            if(localStorage.key(kid).indexOf(this.keyPrefix)!=0) continue;
//Idf取得
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
//console.log('check for :'+decodeURIComponent(currentIdentifier));
//識別子から得たタイトルがすでに登録されているか検査 未登録エントリは追加
//token指定がある場合は、登録タイトルを抹消して新しい情報で上書き？
                var currentTitle = this.title(currentIdentifier);
//console.log(currentTitle);
                var dataInfo=nas.Pm.parseIdentifier(currentIdentifier);
//productsData設定
                if(! currentTitle){
//var dataNodeString = localRepository.pmdb.dataNode.replace(/\/\/$/,'.'+dataInfo.product.title +'//');
var dataNodeString = localRepository.pmdb.dataNode+dataInfo.product.title;
                    if((myToken.indexOf(localStorage.key(kid)) >= 0)||(! myToken.length)){
                            this.productsData.push({
                            token:localStorage.key(kid),
                            name:dataInfo.product.title,
                            title:dataInfo.title,
                            description:"",
                            created_at:null,
                            updated_at:null,
                            pmdb:new nas.Pm.PmDomain(localRepository,dataNodeString),
                            episodes:[[]]
                        });
                    }
            };
        };
            for(var ix =0;ix < this.productsData.length; ix ++){
//console.log('get Episodes of title :'+decodeURIComponent(this.productsData[ix].token));
                (function(){
                    localRepository.baseStorage.getEpisodes(callback,callback2,localRepository.baseStorage.productsData[ix].token);}
                )();
            };
}
/**<pre>
    ローカルリポジトリの　opus(episode)データを取得
    @params     {String}    myProductToken
        対象タイトルのトークン
    @params     {Array}     myOpusToken
        強制的に更新するエピソードのトークン配列
myOpusToken 引数がある場合は、引数で制限された処理を行う
pmdb/stbd取得はここでは行わない。
*/
localRepository.baseStorage.getEpisodes=function(callback,callback2,myProductToken,myOpusToken){
//console.log('start getEpisodes for title :'+decodeURIComponent(myProductToken));
    var allOpus =false
    if(typeof myOpusToken == 'undefined'){
        myOpusToken = [];
        allOpus     = true;
        var myProduct = this.title(myProductToken);
        if(! myProduct){console.log('process stop'); return false;}
        for (var px = 0 ;px < myProduct.episodes[0].length;px ++){
            myOpusToken.push(myProduct.episodes[0][px].token);
        }
    }
    if(!(myOpusToken instanceof Array)) myOpusToken = [myOpusToken];
//    try{
        var myProduct=this.title(myProductToken);
        var keyCount     = localStorage.length;
        for (var kid = 0;kid < keyCount; kid++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
//エントリーがpmdb|stbdであった場合、処理スキップ
//                if((dataInfo.type=='pmdb')||(dataInfo.type=='stbd'))　continue;
                if(
                    ((dataInfo.title instanceof nas.Pm.WorkTitle)&&
                    (dataInfo.title.sameAs(myProduct.name)))||
                    (dataInfo.title == myProduct.name)
                ){
//console.log(dataInfo);
//タイトル違いを排除
//OPUSリストにすでに登録されているか検査 未登録エントリはDBに追加 tokenは初出のkey
                    var currentOpus = this.opus(currentIdentifier);
//console.log(currentOpus);
// (dataInfo.opus==currentOpus.name) 同一判定式
                    if((! currentOpus)||((myOpusToken.indexOf(localStorage.key(kid)) >= 0))){
                        if((! myOpusToken.length)||(myOpusToken.indexOf(localStorage.key(kid)) >= 0)){
//console.log('add Episode :'+dataInfo.product.title+'#'+dataInfo.product.opus);
//var dataNodeString = myProduct.pmdb.dataNode.replace(/\/\/$/,'#'+dataInfo.product.opus +'//');
var dataNodeString = myProduct.pmdb.dataNode+'#'+dataInfo.product.opus;
                            var Ex = myProduct.episodes[0].push({
                                token:localStorage.key(kid),
                                name:dataInfo.product.opus,
                                description:dataInfo.product.subtitle,
                                created_at:null,
                                updated_at:null,
                                pmdb:new nas.Pm.PmDomain(myProduct,dataNodeString),
                                stbd:new nas.StoryBoard(dataInfo.product.title+'#'+dataInfo.product.opus),
                                cuts:[[]]
                            });
                            currentOpus = myProduct.episodes[0][Ex-1];
//console.log('get SCi for :'+currentOpus.name);
                            this.getSCi(callback,callback2,currentOpus.token);
                        }
                    }
                }
            }
        }
//        if(callback instanceof Function) callback();
/*    } catch(err) {
        console.log(err);
        if(callback2 instanceof Function) callback2();
    };// */
}
/**
    エピソード毎にカットリストを取得
    エピソード詳細の内部情報にコンバート
    xmapエントリに対しては、カットのエントリーと別にxmap専用のエントリを置く
    @params {String}    myOpusToken
        ターゲットの話数キー(トークン)

 */
localRepository.baseStorage.getSCi=function (callback,callback2,myOpusToken){
//    try{
        var myProduct = nas.Pm.parseIdentifier(myOpusToken.slice(this.keyPrefix.length)).product;
        var myOpus = this.opus(myOpusToken);
console.log('getSCi :'+decodeURIComponent(myOpusToken));
console.log('product :');console.log(myProduct);
        if(! myOpus){console.log('noOpus');return false;};//旧DBの検索
//console.log('prcessing : '+myOpus.name);
        var keyCount=localStorage.length;
        for (var kid = 0; kid < keyCount; kid ++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
                var currentIdentifier = localStorage.key(kid).slice(this.keyPrefix.length);
                var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
/*----------------------------------------------------------------------------------------*/
//console.log(decodeURIComponent(currentIdentifier));
//console.log('type :'+dataInfo.type);
//対象外データをスキップ
                if(
                    (myOpus.name != dataInfo.product.opus)||
                    (dataInfo.type=='pmdb')||
                    (dataInfo.type=='stbd')
                ) continue;
//xpst以外(xmap)の場合単独でlistEntryに登録｜
                if(dataInfo.type == "xmap"){
//console.log('detect xmap :'+decodeURIComponent(currentIdentifier));
                    var newEntry = new listEntry(
                        currentIdentifier,
                        null,
                        null,
                        localStorage.key(kid)
                    );
                    newEntry.parent = this;
                    this.entryList.put(newEntry);
//xmapの情報で兼用カットのエントリを行うとidf重複が発生するのでそれは避ける
                    continue;
                };
//xpstの場合はカットごとにissuesをスタックする
console.log('detect cut :'+decodeURIComponent(currentIdentifier));
                var myCut = this.cut(currentIdentifier);//
//                var myCut = localRepository.cut(currentIdentifier);//仕様変更によりこれはstbdのSBShotが戻るようになる。要調整
//                var currentEntry= this.entryList.getByIdf(currentIdentifier,1,true);//したのラインと等価
                var currentEntry= this.entry(currentIdentifier,1,true);
                
                if(myCut){
                //登録済みカットなのでissues追加
//console.log("push version :" + decodeURIComponent(currentIdentifier));
                    myCut.versions.push({
                        updated_at:null,
                        description:currentIdentifier,
                        version_token:localStorage.key(kid)
                    });
                    if(currentEntry){
        //登録済みプロダクトなのでエントリに管理情報を追加 (idf,title,,cutID,versionID)
                        currentEntry.push(
                            currentIdentifier,
                            null,
                            null,
                            localStorage.key(kid),
                            localStorage.key(kid)
                        );
                    }else{
                //情報不整合
//console.log(currentIdentifier);
                    }
                }else{
                //未登録カット  新規登録
                //エントリが既に登録済みなので不整合 消去
                    if(currentEntry){
                        currentEntry.remove();
                    }
                    myOpus.cuts[0].push({
                        token:localStorage.key(kid),
                        name:dataInfo.cut,
                        description:currentIdentifier,
                        created_at:null,
                        updated_at:null,
                        versions:[{
                            updated_at:null,
                            description:currentIdentifier,
                            version_token:localStorage.key(kid)
                        }]
                    });
                    var myCut=myOpus.cuts[0][myOpus.cuts[0].length-1];
                //未登録新規プロダクトなのでエントリ追加
                    //ここにローカルストレージのキーIDを置く  タイトルとエピソードの情報取得キーは現在エントリなし
                    //初出エントリのキーか？  0524
//console.log([currentIdentifier,localStorage.key(kid)].join('\n'));
                    var newEntry = new listEntry(
                        currentIdentifier,
                        null,
                        null,
                        localStorage.key(kid)
                    );
                    newEntry.parent = this;
                    this.entryList.put(newEntry);
                };
            };
        };
        if(callback instanceof Function){
            callback();
        } else {
            localRepository.getProducts([myProduct.title,myProduct.opus].join('#'));
        }
/*    }catch (err){
        console.log(err);
        if(callback2 instanceof Function) callback2();
    };// */
}

/**<pre>
    プロダクト(タイトル)データを更新
    リポジトリ内のデータを取得してタイトル一覧を得る
    リポジトリpmdbが得られない場合、エントリ内容からビルドして保存
    ビルドした場合に、エピソード更新を呼び出す

    タイトル一覧をクリアして更新する エピソード更新を呼び出す

    取得したデータを複合して、サービス上のデータ構造を保持する単一のオブジェクトに
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得するように変更
    引き続きの処理を行う際はコールバック渡し
    コールバックがない場合は、全プロダクトの詳細を取得？
    プロダクトデータ取得のみの場合は  空動作のコールバックを渡す必要あり
    myToken 引数がある場合はtokenが一致したエントリのみを処理する
    myToken は配列でも良い
    </pre>
    @params  {Array}   myToken
        強制的に更新するタイトルのトークン配列
 */
localRepository.getProducts=function(myToken){
console.log(myToken);
        if(typeof myToken == 'undefined') myToken =[];
        if(!(myToken instanceof Array)) myToken = [myToken];
//pmdbにworkTitles/productsが存在するか否かをチェック ない場合は新規作成
        if (
            (localRepository.pmdb.contents.indexOf('workTitles') < 0)&&
            (localRepository.pmdb.contents.indexOf('products') < 0)
        ){
console.log(localRepository.pmdb.dump('dump'));
console.log(localRepository.pmdb.dataNode);
console.log(localRepository.pmdb.contents);
console.log('----------------------------------------------------------------------------------clear TitleDB');console.log(localRepository.pmdb.dump('dump')); // */
            localRepository.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this);
            localRepository.pmdb.contents.add('workTitles');
            localRepository.pmdb.products = new nas.Pm.OpusCollection(this);
            localRepository.pmdb.contents.add('products');
        }
        var workTitles = localRepository.pmdb.workTitles;
        var products = localRepository.pmdb.products;
        var productsData = localRepository.baseStorage.productsData;
        for(var t = 0 ; t < myToken.length ; t ++ ){
//処理済みのプロダクトはスキップ
            if(products.entry(myToken[t])) return ;
        }
        for (var d=0 ; d<productsData.length ; d++){
//Idf取得
            var currentTitle = productsData[d];
            var currentIdentifier=currentTitle.token.slice(localRepository.baseStorage.keyPrefix.length);
            var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
            var titleStr = (dataInfo.title instanceof nas.Pm.WorkTitle)? dataInfo.product.title:dataInfo.title;
            if(!(workTitles.entry(titleStr))){
//タイトルDB内に該当データがない	自動的に登録してdataInfoを更新
//console.log('newTitle');
//                var newTitle = (dataInfo.title instanceof nas.Pm.WorkTitle)?dataInfo.title:new nas.Pm.WorkTitle();
                var newTitle = new nas.Pm.WorkTitle();
                newTitle.projectName = dataInfo.product.title;
                newTitle.id          = nas.uuid();
                newTitle.fullName    = dataInfo.product.title;
                newTitle.shortName   = dataInfo.product.title;
                newTitle.code        = dataInfo.product.title;
                newTitle.framerate   = new nas.Framerate();

                newTitle.name   = newTitle.projectName;
                newTitle.token  = productsData[d].token;
                newTitle.pmdb   = productsData[d].pmdb;
                var res = workTitles.addMembers(newTitle);
                if(res.length == 0){
                    var workTitle = workTitles.entry(titleStr);// pmdb prop
                    dataInfo.title = workTitle;
                }else{
                    dataInfo.title = newTitle;
                    var workTitle = res[0];// pmdb prop
                }
            }else{
                var workTitle = workTitles.entry(titleStr);// pmdb prop
            }
//エピソードDB内に該当データがない 自動登録
            for(var e = 0 ; e < currentTitle.episodes.length ; e ++){
                var epsd  = currentTitle.episodes[e][0];
                if(! epsd) continue;
                var epIdf = epsd.token.slice(localRepository.baseStorage.keyPrefix.length);
                var epInf = nas.Pm.parseIdentifier(epIdf);
console.log(decodeURIComponent(epIdf));
console.log(epInf);
                if(
                    (!(workTitle.opuses.entry(epInf.product.title+'#'+epInf.product.opus)))
                ){
                	var newEpisode = new nas.Pm.Opus();
                    newEpisode.productName = workTitle.name+'#'+epInf.product.opus ;//
                    newEpisode.id          = nas.uuid()          ;//
                    newEpisode.name        = epInf.product.opus         ;//
                    newEpisode.subtitle    = epInf.product.subtitle     ;//
                    newEpisode.title       = workTitle                  ;//
//console.log('add pmdb/stbd for :'+newEpisode.productName);
                    newEpisode.token       = epsd.token                 ;
//                    newEpisode.pmdb        = Object.create(workTitle.pmdb);
                    newEpisode.pmdb        = epsd.pmdb;
                    newEpisode.stbd        = epsd.stbd;
//                    newEpisode.stbd        = new nas.StoryBoard(newEpisode.productName);

                    var resp = workTitle.opuses.addMembers(newEpisode);
                    products.addMembers(newEpisode);
                    var storyBoard = resp[0].stbd;
console.log(epsd);
console.log(decodeURIComponent(epIdf));
console.log(epInf);
console.log('------------------------ xmap entry add to stbd')
//entryList内のxmapを先行して登録する
                    for(var ex = 0;ex < this.baseStorage.entryList.length;ex ++){
                        if(this.baseStorage.entryList[ex].dataInfo.type != 'xmap') continue;
                        if(nas.Pm.compareIdentifier(epIdf,this.baseStorage.entryList[ex].issues[0].identifier,false,false) < 0) continue;
                        var xmapEntry = this.baseStorage.entryList[ex];
console.log(xmapEntry);
//あらかじめキャリアとなるxmapを作成（ショットのリンク無しで先行作成）
                        var xmap = new nas.StoryBoard.SBxMap(storyBoard,xmapEntry.dataInfo.inherit.join('/'));
                        xmap.timestamp = xmapEntry.dataInfo.timestamp;
/*	nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入*/
                        for (var s = 0; s < xmapEntry.dataInfo.sci.length ; s ++){
                            if(storyBoard.entry(xmapEntry.dataInfo.sci[s].toString('cut'))){
                                continue;//ここで既存エントリをskip
                            }
                            var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                            newClmn.indexText = xmapEntry.dataInfo.sci[s].cut;
                            newClmn.timeText = xmapEntry.dataInfo.sci[s].time;
                            var newShot = new nas.StoryBoard.SBShot(storyBoard,xmapEntry.dataInfo.sci[s],[newClmn]);
                            var added   = storyBoard.edit('add',newShot);//単純追加
if(added[0].xmap !== xmap){console.log([added[0].xmap,xmap])}
//console.log('add Entry');console.log(added[0].xmap.nodeChart);//追加情報
console.log(xmapEntry);console.log(xmapEntry.dataInfo.sci[s].name);
console.log(xmapEntry.dataInfo.mNode);
//通常識別子に取得可能なデータノードがない
                            if(xmapEntry.dataInfo.mNode) added[0].xmap.writeNode(xmapEntry.dataInfo.mNode);//test
                            added[0].xmap.token = xmapEntry.issues[0].cutID;
                        };//
                    };//SBxMap setup こちらを先行
console.log('xmap entry count = '+ storyBoard.xmaps.length);

console.log(epsd.cuts[0]);

//entryList内のタイムシートを順次登録
//xmap登録により先行で登録されたショットを検出して情報の上書きを行う必要あり
                    for(var c = 0 ; c < epsd.cuts[0].length ; c ++){
                        var cut    = epsd.cuts[0][c];
                        var cutIdf = cut.token.slice(localRepository.baseStorage.keyPrefix.length);
                        var cutInf = nas.Pm.parseIdentifier(cutIdf);

console.log(decodeURIComponent(cutIdf));

                      if(cutInf.type == "xpst"){
/*Xps*/
console.log(cutInf);
console.log(cut);
//既登録ショットを検出
                        var myShot = storyBoard.entry(cutInf.sci[0].name);
                        if(myShot){
//既登録なのでトークンを書込み
//                          myShot.xmap.writeNode(cutInf.mNode);
//                          myShot.token = cut.token;
                        }else{

//未登録 nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
                          var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                          newClmn.indexText = cutInf.sci[0].cut;
                          newClmn.timeText = cutInf.sci[0].time;
                          var newShot = new nas.StoryBoard.SBShot(storyBoard,cutInf.sci[0],[newClmn]);

                          var added   = storyBoard.edit('add',newShot);//単純追加
                          myShot = added[0];
console.log('add Entry');console.log(added[0]);//追加情報書き込み
console.log(cutInf.mNode);
                        }
//                            console.log(added[0].xmap.writeNode(cutInf.mNode));//test
                          myShot.xmap.writeNode(cutInf.mNode);
//                            added[0].token=currentIdentifier;
                          myShot.token = cut.token;
                          for(var v = 0 ; v < cut.versions.length ; v ++){
/*バージョンをノードチャートに書き込み*/
                            var version = cut.versions[v];
                            var versionInf = nas.Pm.parseIdentifier(version.description);
                            myShot.xmap.writeNode(versionInf.mNode);
                          };//shot versions loop
                        
                      };
                    };//SBShot loop
                    storyBoard.sortContents();
                };//
            };//episodes loop
        };//baseStorage.Products loop
//        if(callback instanceof Function) callback();
/*    }catch(err){
console.log('#### detect entry error###');
console.log(err);
//        if(callback2 instanceof Function)callback2();
    };// */
//console.log(products.dump());
console.log('------------------------------------------converted localRepository baseStorage to pmdb|stbd');console.log(this.pmdb.dump('dump'));

    return this;
}
/**<pre>
    ローカルリポジトリの　opus(episode)データを取得更新
    @params     {Function}  callback
        成功コールバック
    @params     {Function}  callback
        失敗コールバック
    @params     {String}    myProductToken
        対象タイトルのトークン
    @params     {Array}     myOpusToken
        強制的に更新するエピソードのトークン配列
myOpusToken 引数がある場合は、引数で制限された処理を行う
pmdb/stbd取得はここでは行わない。

*/
localRepository.getEpisodes=function(callback,callback2,myProductToken,myOpusToken){
console.log('getEpisodes for title :'+decodeURIComponent(myProductToken));
    var allOpus =false
    if(typeof myOpusToken == 'undefined'){
        myOpusToken = [];//トークン配列
        allOpus     = true;
        var entryDB = this.baseStorage.title()
        var myProduct = this.pmdb.workTitles.entry(myProductToken);
 console.log(myProduct);
        if(! myProduct){console.log('process stop'); return false;}
        for (var ops in myProduct.opuses){
            myOpusToken.push(myProduct.opuses[ops].token);
        }
    }
    if(!(myOpusToken instanceof Array)) myOpusToken = [myOpusToken];
//console.log(myOpusToken);
//console.log(documentDepot.currentProduct);
    try{
        var myProduct=localRepository.title(myProductToken);
        var keyCount     = localStorage.length;
//console.log(myProduct);
        for (var kid = 0;kid < keyCount; kid++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
//エントリーがpmdb|stbdであった場合、処理スキップ
                if((dataInfo.type=='pmdb')||(dataInfo.type=='stbd'))　continue;
                if(
                    ((dataInfo.title instanceof nas.Pm.WorkTitle)&&
                    (dataInfo.title.sameAs(myProduct.name)))||
                    (dataInfo.title == myProduct.name)
                ){
//console.log(dataInfo);
//タイトル違いを排除
//OPUSリストにすでに登録されているか検査 未登録エントリはDBに追加 tokenは初出のkey
                    var currentOpus = this.opus(currentIdentifier);
//console.log(currentOpus);
// (dataInfo.opus==currentOpus.name) 同一判定式
                    if((! currentOpus)||((myOpusToken.indexOf(localStorage.key(kid)) >= 0))){
                        if((! myOpusToken.length)||(myOpusToken.indexOf(localStorage.key(kid)) >= 0)){
console.log('add Episode :'+dataInfo.product.title+'#'+dataInfo.product.opus);
                            var Ex = myProduct.episodes[0].push({
                                token:localStorage.key(kid),
                                name:dataInfo.product.opus,
                                description:dataInfo.product.subtitle,
                                created_at:null,
                                updated_at:null,
                                pmdb:new nas.Pm.PmDomain(myProduct,dataInfo.product.title+'#'+dataInfo.product.opus+'//'),
                                stbd:new nas.StoryBoard(dataInfo.product.title+'#'+dataInfo.product.opus),
                                cuts:[[]]
                            });
                            currentOpus = myProduct.episodes[0][Ex-1];
                            if(callback instanceof Function){
                                callback();
                            }else{
console.log('get SCi for :'+currentOpus.name);
                                localRepository.getSCi(false,false,currentOpus.token);
                            }
                        }
                    }
                }
            }
        }
//エピソード１取得毎に実行したほうが良いかも？
//このままだと必ずタイトル内の全エピソード取得になる
        if(callback instanceof Function){ callback();}   
    } catch(err) {
        console.log(err);
        if(callback2 instanceof Function){ callback2();}
    }
}
/**
    エピソード毎にカットリストを取得
    エピソード詳細の内部情報にコンバート
    xmapエントリに対しては、カットのエントリーと別にxmap専用のエントリを置く

    @params {Function}  callback
        成功コールバック
    @params {Function}  callback2
        失敗コールバック
    @params {String}    myOpusToken
        ターゲットの話数キー(トークン)
    @params {String}    pgNo
          リストのページID  1 origin
    @params {String}    ppg
          ページごとのエントリ数
        現在、pgNo,ppgは意味を持たない引数
 */
localRepository.getSCi=function (callback,callback2,myOpusToken,pgNo,ppg){
    try{
        var myProduct = nas.Pm.parseIdentifier(myOpusToken.slice(this.keyPrefix.length)).product;
        var storyBoard = this.pmdb.products.entry(myProduct.title+'#'+myProduct.opus).stbd;
console.log(storyBoard);
        var myOpus = this.opus(myOpusToken);
        var currentEpisode = this.pmdb.products.entry(myOpusToken);

console.log('getSCi :'+decodeURIComponent(myOpusToken));
console.log('product :');console.log(myProduct);
        if(! myOpus){console.log('noOpus');return false;};//旧DBの検索
console.log('prcessing : '+myOpus.name);

        var keyCount=localStorage.length;
        for (var kid = 0; kid < keyCount; kid ++){
            if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
                var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
                var dataInfo = nas.Pm.parseIdentifier(currentIdentifier);
/*----------------------------------------------------------------------------------------*/
console.log(decodeURIComponent(currentIdentifier));
console.log('type :'+dataInfo.type);
//対象外データをスキップ
                if((myOpus.name != dataInfo.product.opus)||(dataInfo.type=='pmdb')||(dataInfo.type=='scbd')) continue;
//xmapデータの場合inheritをチェックしてバルクのカットを同時に登録する（xpstとどちらが先でも障害の出ないように作る）
                if(dataInfo.type == "xmap"){
/*新処理*/
console.log('detect xmap :'+decodeURIComponent(currentIdentifier));
                    var myShot = storyBoard.entry(dataInfo.sci[0].toString('cut'));
                    if(myShot){
//既存エントリxmapの兼用数を比較して未登録エントリを追加する　エントリ過多の場合はワーニング
                        var myxMap = myShot.xmap;
/*                        if (myxMap.inherit.length < dataInfo.shi.length){
                            //・・追加処理 ここであってもなくても追加処理は必要
                        }else ;// */
                        if(myxMap.inherit.length > dataInfo.sci.length){
                            console.log('bad data exists :');console.log(dataInfo);
                        };//and NOP
                    }
/*
	nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
*/
//var newClmn = nas.StoryBoard.SBColumn = function Column(parent,columnIndex,style)
//var newShot = new nas.StoryBoard.SBShot(parent,sci,columns,style);
                    for (var sx = 0; sx < dataInfo.sci.length ; sx ++){
                        if(storyBoard.entry(dataInfo.sci[sx].toString('cut'))){
console.log('skip operation for :'+dataInfo.sci[sx].toString('cut'));
                            continue;//ここで既存エントリをskip
                        }
                        var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                        newClmn.indexText = dataInfo.sci[sx].cut;
                        newClmn.timeText = dataInfo.sci[sx].time;
                        var newShot = new nas.StoryBoard.SBShot(storyBoard,dataInfo.sci[sx],[newClmn]);
                        var added   = storyBoard.edit('add',newShot);//単純追加
console.log('add Entry');console.log(added[0].xmap.nodeChart);//追加情報
console.log(dataInfo.mNode);
                        console.log(added[0].xmap.writeNode(dataInfo.mNode));//test
                        added[0].xmap.token = localStorage.key(kid);//
                    }
//旧処理
                    var newEntry = new listEntry(
                        currentIdentifier,
                        null,
                        null,
                        localStorage.key(kid)
                    );
                    newEntry.parent = this;
                    this.entryList.put(newEntry);
                    continue;
                };
//xMapデータを検出の際の処理は特になし（データを開いた際に処理が多い）
/*----------------------------------------------------------------------------------------*/
console.log('detect cut :'+(currentIdentifier));
                var myCut = this.cut(currentIdentifier);
                var currentEntry= this.entry(currentIdentifier);

                var myShot = storyBoard.entry(dataInfo.sci[0].toString('cut'));

                if(myShot){
console.log(myShot);
//絵コンテのショットを確認して処理スキップ
//    ショットに対応するSBxMapに識別子から得たノードを追加（マージ）する
//                    var currentxMap = myShot.getxMap();
                    var currentxMap = myShot.xmap;
                    currentxMap.writeNode(dataInfo.mNode);
                    myShot.token = localStorage.key(kid);//
//コンバータの場合は順次処理
//                    continue;
                }else{
/*
	nas.StoryBoard.SBShotを新規作成してStoryBoardに挿入
*/
//var newClmn = nas.StoryBoard.SBColumn = function Column(parent,columnIndex,style)
//var newShot = new nas.StoryBoard.SBShot(parent,sci,columns,style);
                    var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                    newClmn.indexText = dataInfo.sci[0].cut;
                    newClmn.timeText = dataInfo.sci[0].time;
                    var newShot = new nas.StoryBoard.SBShot(storyBoard,dataInfo.sci[0],[newClmn]);
                    var added   = storyBoard.edit('add',newShot);//単純追加
console.log('add Entry');console.log(added[0]);//追加情報書き込み
console.log(dataInfo.mNode);
                        console.log(added[0].xmap.writeNode(dataInfo.mNode));//test
//                        added[0].token=currentIdentifier;//localStorage.key(kid)?
                        added[0].token=localStorage.key(kid);
//                        added[0].xmap.writeNode(dataInfo.mNode);
                }
console.log(myCut);
console.log(currentEntry);
                if(myCut){
                //登録済みカットなのでissues追加
console.log("push version :" + decodeURIComponent(currentIdentifier));
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
//console.log(currentIdentifier);
                    }
                }else{
console.log('no cut entry :'+dataInfo.cut)
                //未登録カット  新規登録
                //エントリが既に登録済みなので不整合 消去
                    if(currentEntry){
console.log('remove entry :'+ currentEntry.toString());
                        currentEntry.remove();
                    }
console.log("add :: "+decodeURIComponent(currentIdentifier));
                    myOpus.cuts[0].push({
                        token:localStorage.key(kid),
                        name:dataInfo.cut,
                        description:currentIdentifier,
                        created_at:null,
                        updated_at:null,
                        versions:[{
                            updated_at:null,
                            description:currentIdentifier,
                            version_token:localStorage.key(kid)
                        }]
                    });
                    var myCut=myOpus.cuts[0][myOpus.cuts[0].length-1];
console.log(myCut);
console.log(myOpus);
                //未登録新規プロダクトなのでエントリ追加
                    //ここにローカルストレージのキーIDを置く  タイトルとエピソードの情報取得キーは現在エントリなし
                    //初出エントリのキーか？  0524
//console.log([currentIdentifier,localStorage.key(kid)].join('\n'));
                    var newEntry = new listEntry(
                        currentIdentifier,
                        null,
                        null,
                        localStorage.key(kid)
                    );
console.log(newEntry);
                    newEntry.parent = this;
                    this.entryList.put(newEntry);
//                    this.entryList.push(newEntry);
console.log(this.entryList);
                };
            };
        };
        if(callback instanceof Function){ callback();}   
    } catch(err) {
console.log(err)
        if(callback2 instanceof Function){ callback2();}
    }
}
/**
    ローカルリポジトリにエントリを追加
    引数:Xps|xMap|PmDomain|StoryBoard|PmDCオブジェクト
    与えられたオブジェクトから識別子を自動生成
    識別子にkeyPrefixを追加してこれをキーにしてデータを格納する
    ここでステータスの解決を行う？
    キーが同名の場合は自動で上書きされるのでクリアは行わない
    エントリ数の制限を行う
    エントリ数は、キーの総数でなく識別子の第一、第二要素を結合してエントリとして認識する

    Floating ステータスが新設
    Floating ステータスのドキュメントは書込み不可とする。
    リポジトリメソッドに渡す前にステータスの解決を行い適切なステータスを持たせること。
    このメソッドはステータス変更をサポートしない。
    201912の改装でFloatingステータスは消滅
    xMapの識別子は、マルチラインステータをサポート

    引数オブジェクトをXpsのみからXps|xMap|PmDomain|SrotyBoardの自動判別に拡張

*/
localRepository.putEntry = function(entryData,callback,callback2){
    this.baseStorage.putEntry(entryData,callback,callback2);
}
localRepository.baseStorage.putEntry=function(entryData,callback,callback2){
    var msg='';
    if(
        ((entryData instanceof Xps)||(entryData instanceof xMap))&&
        (((! entryData.pmu)&&(String(entryData.cut).match(/^\s*$/)))||
        ((entryData.pmu)&&(entryData.pmu.cut.match(/^\s*$/))))
    ){
//xps|xmap かつデータ識別情報が無い
        msg += localize({
            en:"you can't save entry without cutNo.",
            ja:"カット番号のないエントリは記録できません。"
        });
    };
console.log(entryData);

    if(
        ((entryData instanceof Xps)&&(entryData.currentStatus.content.indexOf('Floating')>=0))||
        ((entryData instanceof xMap)&&(entryData.pmu)&&(entryData.pmu.nodeManager.currentStatus)&&
        (entryData.pmu.nodeManager.currentStatus.content.indexOf('Floating')>=0))
    ){
//エントリステータスがfloating   statusにfloatingが消滅したためこのコードは不要
        msg += '\n'+localize({
            en:"you can't save entry of Flating status.",
            ja:"Floatingエントリは記録できません。"
        });
    }
    if(msg.length){
        alert(msg);
        return false;
    };

if((entryData instanceof Xps)||(entryData instanceof xMap)){
//Xps|xMap 識別子取得
    var myIdentifier = nas.Pm.getIdentifier(entryData);//
//識別子に相当するアイテムがローカルストレージ内に存在するかどうかを比較メソッドで検査
    for (var pid=0;pid<this.entryList.length;pid++){
        if(nas.Pm.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > 3){
//既存のエントリが有るのでストレージとリストにpushして終了
            try{
                this.entryList[pid].push(myIdentifier);
                localStorage.setItem(this.keyPrefix+myIdentifier,entryData.toString());
                if ((xUI.XMAP === entryData)||(xUI.XPS === entryData)){
                    xUI.setStored('current');
                    xUI.sync();
                }
            }catch(err){
                if(callback2 instanceof Function){callback2();}                
            }
            xUI.sync();
            documentDepot.updateDocumentSelector();
            if(callback instanceof Function){callback();}
            return this.entryList[pid];
        };
    };
// console.log(entryData)
//console.log("既存エントリなし :追加処理");
//既存エントリが無いので新規エントリを追加
//設定制限値をオーバーしたら、警告する。  OKならばローカルストレージから最も古いエントリを削除して実行
/*
        エントリ上限設定を　カット数・管理単位数で別に制御する
        stbd.contents
        localStrage.entryCountメソッドを作成して呼び出すのが良い
*/
    try{
        if ( this.entryList.length >= this.maxEntry ){
            var msg=localize({en:"over limit!\n this entry will remove [%1]\n ok?",ja:"制限オーバーです!\nこのカットを登録するとかわりに[%1]が消去されます。\nよろしいですか？"},decodeURIComponent(this.entryList[0].toString()));
            if(confirm(msg)){
//console.log("removed Item !");
                for (var iid=0; iid < this.entryList[0].issues.length ; iid++ ){
                    localStorage.removeItem( this.keyPrefix + this.entryList[0].issues[iid].identifier );
                };
                this.entryList[0].remove();//アイテムメソッドで削除
                localStorage.setItem(this.keyPrefix+myIdentifier,entryData.toString());
                this.entryList.put(new listEntry(myIdentifier));//Collectionメソッドで追加
//console.log(this.entryList.length +":entry/max: "+ this.maxEntry)
            }
        }else{
            localStorage.setItem(this.keyPrefix+myIdentifier,entryData.toString());
//            this.entryList.put(new listEntry(myIdentifier)); 
        }
    }catch(err){
//console.log('localRepositoty.putEntry');
//console.log(err);
        if(callback2 instanceof Function){callback2();}                
    }
    xUI.sync();
    documentDepot.updateDocumentSelector();
    if(callback instanceof Function) callback();
}else if(entryData instanceof nas.Pm.PmDomain){
// case pmdb
//    var Idf = entryData.dataNode+'.'+entryData.timestamp+'.pmdb';
    var Idf = nas.Pm.getIdentifier(entryData);
    localStorage.setItem(this.keyPrefix+Idf,entryData.dump('JSON'));

}else if(entryData instanceof nas.StoryBoard){
//case storyboard
//    var Idf = encodeURIComponent(entryData.title.projectName) +'#'+ encodeURIComponent(entryData.opus)+'.'+entryData.timestamp+'.stbd';
    var Idf = nas.Pm.getIdentifier(entryData);
    localStorage.setItem(this.keyPrefix+ Idf,entryData.toString());
    
}else if(entryData instanceof nas.Pm.PmDataCash){
//cae storybord data cash ストーリーボードデータキャッシュ（未実装）
    var Idf = encodeURIComponent(entryData.title.projectName) +'#'+ encodeURIComponent(entryData.opus) +'.pmdc';
    localStorage.setItem(this.keyPrefix+ Idf,entryData.toString());
    
}
    return this.entryList[this.entryList.length-1];
}

/**
 *   識別子を引数にしてリスト内を検索
 *    一致したデータをローカルストレージから取得してコールバックに渡す
 *    コールバック関数が与えられない場合は
 *    xpst|xmapの場合　xUI.documents.setContent()に渡す
 *    pmdbの場合 ルート|リポジトリ|タイトル|エピソード それぞれにロード サーバのpmdbは、親サービスをたどって渡す
 *    stbdの場合 該当エピソードにロード
 *
 *    xmapの場合 識別子の管理情報はあっても無視する
 *    xpstの場合 識別子に管理情報があればそのデータを、なければ最も最新のデータを処理対象にする
 *  isRerference フラグはxpstのケースのみ有効　立っている場合は、xUI.referenceXpsのデータをセットしてXPS編集バッファをリセットする
 *   引数にstbdエントリ(SBShot|SBxMap) を拡張 検索を省略してトークンキーをもとにコンテンツを取得する
 *
 *  @params  {String}    identifier
 *      読み出しデータ識別子|ターゲット登録オブジェクト
 *  @params  {Boolean}   isReference
 *      リファレンス読み出しフラグ(xpstエントリ専用　他のリクエストに対しては無効)
 *  @params  {Function}  callback
 *      コールバック関数
 *  戻値 不定
 */
localRepository.baseStorage.getEntry=function(identifier,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}

//識別子をパース
console.log(arguments);
    var targetInfo = nas.Pm.parseIdentifier(identifier);
    var myIssue = false;
    var refIssue = false;
    var matchLevel = 1;//CUT
    if(targetInfo.type == 'pmdb'){
//pmdbのマッチレベルは可変　ルート、リポジトリ（共有）、タイトル、エピソード　の各段階があるので、それを識別する
//　.<server>.<repository-name>.<repository-id>//<title>#<opus>//~.<timestamp>.<type>
        if(targetInfo.product.opus){
            matchLevel = 0;//product = episode
        }else if(targetInfo.product.title){
            matchLevel = -1;//title
        }else if(targetInfo.dataNode.repository){
            matchLevel = -2;//repository
        }else if(targetInfo.dataNode.server){
            matchLevel = -3;//server
        }else{
            matchLevel = -4;//root
        }
    } else if(targetInfo.type == 'stbd'){
        matchLevel = 0;//product
    }
console.log(identifier+' : '+matchLevel)
    var myEntry = this.entryList.getByIdf(identifier,matchLevel,true,false);//第三引数でタイプを限定するのでコレは暫定コード
//エントリを指定の際にpmdb,stbdを求めることがあるのでカット一致レベルに固定してはならない
//タイプは限定　タイプによって一致レベルが変わる
    if(! myEntry){
console.log("noEntry : "+ decodeURIComponent(identifier));//一致エントリが無い
        return null;
    }
console.log(myEntry);

if((targetInfo.type == 'xmap')||(targetInfo.type == 'xpst')){
    if(targetInfo.type == 'xpst'){
//この処理が必要なのはxpstエントリのみ　xmap エントリにissue概念は不要だが便宜上isses[0]にエントリのキーを置く
        if(! targetInfo.status){
//引数に管理部分がないので、最新のissueとして補う
            var cx = myEntry.issues.length-1;//最新のissue
            myIssue = myEntry.issues[cx];//配列で取得
        } else {
//指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
            checkIssues:{
                for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
                    if ( nas.Pm.compareIdentifier(myEntry.issues[cx].identifier,identifier) > 4){
                        myIssue = myEntry.issues[cx];
                        break checkIssues;
                    }
                }
                if (! myIssue){
console.log( 'no target data :'+ decodeURIComponent(identifier) );//ターゲットのデータが無い
                    return false;
                }
            }
        }
    }else{
        myIssue = myEntry.issues[0];
    }
//issues処理
// 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
// ソースデータ取得
console.log("readIn localStarge data : " + decodeURIComponent(myIssue.identifier));
    var documentSource = localStorage.getItem(this.keyPrefix+myIssue.identifier);
// console.log(callback);
//識別子を再結合してもキーが得られない場合があるのでエントリから対応キーの引き出しを行う
}else{
//pmdb|stbd
	var documentSource = localStorage.getItem(myEntry.issues[0].identifier);//エントリのidfをつかってデータを取得
}

    if(documentSource){

console.log(documentSource);
        if(callback instanceof Function){

            if((targetInfo.type == 'xpst')||(targetInfo.type == 'xmap'))
                documentSource = serviceAgent.overwriteProperty(documentSource,localRepository.toString(),'REPOSITORY');
console.log('set Content'+localRepository.toString());
            callback(documentSource);
            return true;
        }
        if(! isReference){
//xpst以外はリポジトリ内のリビジョン管理がないのでそのままレスポンスを処理する
            if(targetInfo.type == 'pmdb'){
//pmdb
/*
pmdbはデータノードによる管理が行われる
識別子にはデータノード前置詞がつく　データノード指定のないものはタイトル｜エピソード
    エピソード用 pmdb     　.serverURL.repositoryName.repositoryIDF//TITLE#ep[subtitle]//.pmdb
    タイトル用 pmdb       //TITLE//.pmdb
    リポジトリ用 pmdb     //.pmdb
*/
                var targetName=targetInfo.product.title+'#'+targetInfo.product.opus;
                var target = serviceAgent.currentRepository.opus(targetName);
                if(! target){
                    target = serviceAgent.currentRepository.title(targetName);
                }
                if(! target){
                    target = localRepository;
                }
                target.pmdb.parseConfig(documentSource);
                return false;
            }else if(targetInfo.type == 'stbd'){
//stbd
                var targetEpisode = serviceAgent.currentRepository.opus(targetInfo.product.title+'#'+targetInfo.product.opus);
                if(targetEpisode) targetEpisode.stbd.parseScript(documentSource);
                return false;
            }else{
//xpst|xmap
                documentSource = serviceAgent.overwriteProperty(documentSource,localRepository.toString(),'REPOSITORY');
console.log('set Content'+this.toString());
//console.log(documentSource);//ここの設定で無限ループに落ちる
//識別が必要　識別はxUI.documents　自身に置く
				var setIndex = xUI.documents.setContent(documentSource,true);
                if(setIndex >=0 ){
                    xUI.setUImode('browsing');
                    if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
console.log('set documents index : '+ setIndex);
                };
            }
            return true;
        } else if(targetInfo.type=='xpst'){
            xUI.setReferenceXPS(documentSource);
            return true;
        };//xmapはrefereneceデータとならない
        return false;
    } else {
//        if(targetInfo.type == 'xmap'){}
        return false;
    }
}
/**
 *	Xpsターゲットの識別子を与えxMapを生成する
 *	該当するxMapエントリが存在すればそれを
 *	該当するエントリがない場合は、リポジトリ内のXpsエントリーの内容を合成する
 *	生成したデータは、リポジトリに置く　生成時刻をタイムスタンプとして記録する
 *　localRepository.mergeBuffer に置いて callbackに渡す
 *  @params {String}    targetIdf
 *  @returns {Object}   処理ステータス{status:true|false}
 *
 */
localRepository.getxMap = function(targetIdf,callback,callback2){
console.log('===================localRepository===================================SET TARGET');
	var targetEntry = this.entry(targetIdf,'shot');
	if(! targetEntry){
		if(callback2 instanceof Function){
			callback2();
		}else{
			return {status:false};
		}
	}
console.log(targetEntry)
	if(targetEntry instanceof nas.StoryBoard.SBShot){
	    targetEntry = targetEntry.xmap;
	}
	this.mergeBuffer = new xMap(targetEntry.getIdentifier());
	if(targetEntry.token){
//リポジトリ上にすでにエントリが存在するのでそれを取得(前段でチェックが効いていればこれは実行されない　直アクセス時機能)
        this.mergeBuffer.parsexMap(localStorage.getItem(targetEntry.token));
        this.mergeBuffer.dataNode = localRepository.toString();//これはプッシュ時まで保留（最後にpush）
        if(callback instanceof Function){
            callback(this.mergeBuffer);
        }else{
            xUI.documents.setContent(this.mergeBuffer,true);
        }
        return {status:true};
    }
//ローカルリポジトリ上にエントリなし
//エントリのすべてのXpsからxMapを生成してマージターゲット配列を設定する　localRepository版
console.log('build xmap form Xpst for : '+decodeURIComponent(targetIdf));
    var sourceXps = new Xps();//ソース用一時Xps
    var mergeTarget = [];
    for (var ix = 0 ; ix < targetEntry.contents.length ; ix ++ ){
        for (var l = 0 ; l < targetEntry.contents[ix].nodeChart.length ; l ++ ){
            for (var s = 0 ; s < targetEntry.contents[ix].nodeChart[l].stages.length ; s ++ ){
                for (var n = 0 ; n < targetEntry.contents[ix].nodeChart[l].stages[s].nodes.length ; n ++ ){
                    if(targetEntry.contents[ix].nodeChart[l].stages[s].nodes[n].token)
    var sourceString = localStorage.getItem(targetEntry.contents[ix].nodeChart[l].stages[s].nodes[n].token);
    if(sourceString){
        sourceXps.parseXps(sourceString);
        mergeTarget.push(Xps.getxMap(sourceXps));
    }
                };//targetEntry.contents[ix].nodeChart[l].stages[s].nodes >>(全ジョブ)
            };//targetEntry.contents[ix].nodeChart[l].stages >>(全ステージ)
        };//targetEntry.contents[ix].nodeChart >>(ショット内全ライン)
    };//targetEntry.contents >>(全ショット)
//マージターゲットをチェック エントリがない場合は失敗終了
    if(mergeTarget.length == 0) return {status:false};
//整ったところでマージバッファの再初期化
    this.mergeBuffer.parsexMap(mergeTarget.splice(0,1).toString());//第一要素先行処理・ターゲットから削除
    if(mergeTarget.length > 0){
        var merged = this.mergeBuffer.merge(mergeTarget);//残があるのでマージ
    }else{
        var merged = {status:true};//変換対象がひとつなので処理終了
    }
    this.mergeBuffer.dataNode = localRepository.toString();//これはプッシュ時まで保留（最後にpush）
    if(merged.status){
        var fnc = function(transaction){
            console.log(xUI.activeDocument);
            xUI.documents.setContent(transaction.target,true);
        };
	    if(callback instanceof Function){
		    fnc = function(transaction){callback(transaction.target)};
	    }
	}
console.log(localRepository.mergeBuffer);
	var tr = new nas.Transaction(localRepository.mergeBuffer,"push",false,fnc,callback2);
console.log(['transaction ',tr])
    return merged;
}
/*TEST
    localRepository.getxMap(nas.Pm.getIdentifier(xUI.XPS),function(x){console.log(x.toString())});
*/
/**
 *   識別子またはオブジェクトを引数にして一致データをローカルストレージから取得
 *   コールバックに渡す
 *    コールバック関数が与えられない場合は
 *    xpst|xmapの場合　xUI.documents.setContent()に渡す
 *    pmdb|stbd の場合 対応するオブジェクトに読込
 *
 *    xmapの場合 識別子のノード指定は無意味
 *    xpstの場合 識別子のノード指定はエントリ検索時に解決
 *              識別子にノードが指定されない場合は、本線最終ノードを返す
 *  isRerference フラグはxpstのケースのみ有効　指定された場合は、xUI.referenceXpsのデータをセットしてXPS編集バッファをリセットする
 *   引数にstbdエントリ(SBShot|SBxMap) を拡張 検索を省略してトークンキーをもとにコンテンツを取得する
 *
 *  @params  {String|Object}    target
 *      読み出しデータ識別子|ターゲット登録オブジェクト StoryBoard.SBxMap|StoryBoard.SBShot|nas.Pm.PmDomain|StoryBoard
 *  @params  {Boolean}   isReference
 *      リファレンス読み出しフラグ(xpstエントリ専用　他のリクエストに対しては無効)
 *  @params  {Function}  callback
 *      コールバック関数
 *  戻値 不定
 */
localRepository.getEntry=function(target,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
//識別子をターゲットオブジェクトに変換 変換前に情報を取得しておく
    if(typeof target == 'string'){
        var　tgtInfo = nas.Pm.parseIdentifier(target);
        target = localRepository.entry(target);
    }else{
        var tgtInfo = nas.Pm.parseIdentifier(target.getIdentifier());
    }
    if((! target)||(! target.token)){
//ターゲットオブジェクトがないまたはエントリが存在しない
        if(callback2 instanceof Function) callback2();
        return false;
    }
    var documentType = 'xpst';//デフォルトでxpst設定
    if(target instanceof nas.Pm.PmDomain){
        documentType = 'pmdb';
    }else if(target instanceof nas.StoryBoard){
        documentType = 'stbd';
        
    }else if(target instanceof nas.StoryBoard.SBxMap){
        documentType = 'xmap';
    }
//xpstでターゲットにノード指定がない場合はtarget.tokenを使用したアクセス不可（対象不定になる）
    var targetToken = target.token;
    if((documentType == 'xpst')&&(! tgtInfo.mNode)){
console.log(target);
        targetToken = target.nodeChart[0].stages[target.nodeChart[0].stages.length-1].nodes[
            target.nodeChart[0].stages[target.nodeChart[0].stages.length-1].nodes.length-1
        ].token;
//本線最終ノードのトークンを取得するコードが合ったほうが良い
console.log(targetToken);
    }
    var documentSource = localStorage.getItem(targetToken);
    if(documentSource){
        if(callback instanceof Function){
            if((documentType == 'xpst')||(documentType == 'xmap'))
                documentSource = serviceAgent.overwriteProperty(documentSource,localRepository.toString(),'REPOSITORY');
            callback(documentSource);
            return true;
        }
        if(! isReference){
//xpst以外はリポジトリ内のリビジョン管理がないのでそのままレスポンスを処理する
            if(documentType == 'pmdb'){
//pmdb
                target.parseConfig(documentSource);
            }else if(documentType == 'stbd'){
//stbd
                target.parseScript(documentSource);
            }else{
//xpst|xmap
                documentSource = serviceAgent.overwriteProperty(documentSource,localRepository.toString(),'REPOSITORY');
console.log('set Content'+this.toString());
//console.log(documentSource);//ここの設定で無限ループに落ちる
//識別が必要　識別はxUI.documents　自身に置く
                var setIndex = xUI.documents.setContent(documentSource,true);
                if(setIndex >=0 ){
                    xUI.setUImode('browsing');
                    if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
console.log('set documents index : '+ setIndex);
                };
            }
            return true;
        } else if(documentType=='xpst'){
            xUI.setReferenceXPS(documentSource);
            return true;
        };//xmapはrefereneceデータとならない
        return false;
    } else {
        if(callback2 instanceof Function) callback2();
        return false;
    }
}

/**
    DBにタイトルを作成する。
    confirmなし 呼び出し側で済ませること
    必要あれば編集UIを呼び出し側に追加
    localRepository.pmdb.workTitlesにタイトルをエントリする
    タイトル.pmdbを初期化する
引数
    タイトル（必須）
    備考テキスト
    PmDomainオブジェクト(pmdb)
    コールバック関数２種
識別子は受け入れない  必要に従って前段で分解のこと
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
    タイトルを含む識別子  カット番号は求めない
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
    @params {String} myIdentifier
    @returns {Object} 
    識別子を指定してローカルリポジトリから相当エントリを消去する
    リストは再構築()
    ローカルリポジトリに関しては、各ユーザは編集権限を持つ
    
    baseStorage.entryListからの削除、当該プロダクトのエピソードからの削除も同時に行う
    また、ステータス変更のため内部ルーチンがこのメソッドを呼ぶ
    直接要素編集をしても良い？
*/
localRepository.removeEntry=function(myIdentifier){
console.log(myIdentifier);
    var myEntry = this.baseStorage.entryList.getByIdf(myIdentifier);//listEntry
console.log(myEntry);
//productsデータから削除
console.log(localRepository.entry(myIdentifier));
    var removed = localRepository.entry(myIdentifier).remove();
console.log(removed);
    if((removed)&&(myEntry)&&(myEntry.issues)){
//エントリに関連するアイテムをローカルストレージから削除
        for (var iid=0;iid < myEntry.issues.length;iid++){
            localStorage.removeItem(this.keyPrefix+myEntry.issues[iid].identifier);
console.log (decodeURIComponent('remove : '+myEntry.issues[iid].identifier));
console.log (localStorage.getItem(this.keyPrefix+myEntry.issues[iid].identifier));
        };
//エントリ自身を削除
        var res = myEntry.remove();
        if(! res ){console.log('fail removed : ' + res)}
//ドキュメントブラウザ更新
    documentDepot.updateDocumentSelector();//ドキュメントブラウザの再ビルド
        return true;
    };
    return myEntry;
};

/**
    以下、ステータス操作コマンドメソッド
    serviceAgentの同名メソッドから呼び出す下位ファンクション

*/
/*
    現在のドキュメントをアクティベートする
*/
localRepository.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var currentCut   = this.cut(currentEntry.toString());
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
        var newXps = new Xps();
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタ更新
            }else{
//console.log('ステータス変更失敗 :');
//             if(newXps) delete newXps;
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                return false;
            }
            xUI.setUImode('production');
            xUI.sWitchPanel();//パネルクリア
            if(callback instanceof Function){ setTimeout (callback,10);}
            return true;
        }else{
//console.log('ステータス変更不可 :'+ nas.Pm.getIdentifier(newXps));
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
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = new nas.Xps.JobStatus('Hold');//（ジョブID等）status以外の変更はない
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
if(config.dbg) console.log('deactivated');
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                currentEntry.setStatus(newXps.currentStatus);
                var myVersion=currentCut.versions[currentCut.versions.length-1];
                  myVersion.updated_at=new Date().toString();
                  myVersion.description=currentEntry.toString(0);
                  myVersion.version_token=this.keyPrefix+myVersion.description;
//                documentDepot.rebuildList();
                xUI.XPS.currentStatus=new nas.Xps.JobStatus('Hold');//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタの更新
            }else{
            //保存に失敗
//console.log('保留失敗')
//                delete newXps ;
			    if(callback2 instanceof Function) setTimeout(callback2,10);
                return false;
            }
            //データをホールドしたので、リストを更新 編集対象をクリアしてUIを初期化
            xUI.setUImode('browsing');
            xUI.sWitchPanel();//パネルクリア
			if(callback instanceof Function) setTimeout(callback,10);
        }else{
//console.log('保留可能エントリが無い :'+ nas.Pm.getIdentifier(newXps));
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
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 読み出したデータでXpsを初期化 
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(config.dbg) console.log('読み出し失敗')
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.setUImode('production');//モードをproductionへ
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(config.dbg) console.log(result);
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
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用 JobID変わらず
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
//            newXps.currentStatus = ['Fixed',assignData].join(":");
            newXps.currentStatus = new nas.Xps.JobStatus('Fixed');
            newXps.currentStatus.assign = assignData;
            //いったん元に戻す  assignData は宙に保留（ここで消失）
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.setUImode('browsing');//モードをbrousingへ
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout('callback()',10)};
                return result;
            }else{
//console.log("fail checkout store")
            }
        }
//console.log('終了更新失敗');
//        delete newXps ;
        if(callback2 instanceof Function){ setTimeout(callback2,10)};
        return false ;
}
/**
    検収処理receiptEntry/receiptEntry
*/
localRepository.receiptEntry=function(stageName,jobName,callback,callback2){
    if( typeof stageName == 'undefined') return false;
    var myStage = nas.pmdb.stages.getStage(stageName) ;//ステージDBと照合  エントリが無い場合はエントリ登録
    /*  2016-12 の実装では省略して  エラー終了
        2017-07 最小限の処理を実装  ステージの存在を確認して続行
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
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(config.dbg) console.log('読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.stage.increment(stageName);
            newXps.job.reset(jobName);
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = new nas.Xps.JobStatus('Startup');
if(config.dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
if(config.dbg) console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
if(config.dbg) console.log('receipt');
//                delete newXps ;
if(config.dbg) console.log(newXps.currentStatus);
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
//                xUI.setUImode('browsing');//モードをbrowsingへ    ＜＜領収処理の後はモード遷移なし
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(config.dbg) console.log(result);
            }
        }
if(config.dbg) console.log('編集権利取得失敗');
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
        var newXps = new Xps();
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.setUImode('floating');//モードをfloatingへ    ＜＜領収処理の後はモード遷移なし
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.sync('historySelector');//履歴セレクタ更新
                if(callback instanceof Function){ setTimeout(callback,10)};
                return result;
            }else{
if(config.dbg) console.log(result);
            }
        }
if(config.dbg) console.log('編集権利取得失敗');
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
    msg += nas.localize(nas.uiMsg.serviceNode)     + " : " + this.service.name +"("+this.url+")<br>";
    msg += nas.localize(nas.uiMsg.repositoryName)  + " : " + this.name +"<br>";
    msg += nas.localize(nas.uiMsg.repositoryOwner) + " : " + ownerString + "<br>";
    msg += nas.localize({
en:"<hr>** This is the area where temporary files are stored using local storage of the browser.  Data can not be shared between users in this repository.<br>",
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
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    try {
        localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
		currentEntry.issues.pop();
//        xUI.resetSheet(new Xps(5,144),new Xps(5,144));
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
特に同作品の複製を見分けるために必須  APIに追加
*/
function NetworkRepository(repositoryName,myServer,repositoryURI,token){
    this.name    = repositoryName;
    this.service = myServer;//リポジトリの所属するサーバ
    this.url     = (typeof repositoryURI == 'undefined')?this.service.url:repositoryURI;//サーバとurlが異なる場合は上書き
    this.token   = token;//初期化時設定
//サーバ内にTeamが実装 Teamをリポジトリとして扱うのでその切り分けを作成 12/13
//リストは素早いリポジトリの切り替えやリポジトリ同士のマージ処理に不可欠なのでここで保持
//    this.owner = new nas.UserInfo(repositoryOwner);//リポジトリオーナー情報
//    this.currentProduct;
//    this.currentSC;
//    this.currentLine;
//    this.currentStage;
//    this.currentJob;
//    this.product_token      = $('#server-info').attr('product_token');
//    this.episode_token      = $('#server-info').attr('episode_token');
//    this.cut_token          = $('#server-info').attr('cut_token');
// ?idの代替なので要らないか？ 
    this.pmdb = {};//制作管理データキャリア  機能クラスオブジェクト化？
//    this.pmdb = new nas.Pm.PmDomain(this.service,'.'+this.service.url+'.'+this.token+'//' );//初期化

    this.productsData=[];//workTitleCollectionで置換？タイトルキャリアでノードルートになる
    this.currentIssue;
//    this.entryList = new listEntryCollection();
    this.mergeBuffer = undefined;//マージ処理バッファ
    this.mergedIndex = null;//マージ処理カウンタ
}
/**
    リポジトリステータス取得メソッド
    
*/
NetworkRepository.prototype.getStatus = serviceAgent._getRepositoryStatus;

/**
    リポジトリ情報表示メソッド
    引数:なし
    リポジトリのオーナー情報を表示してリポジトリ（共有・チーム）へのアクセスリンクを提示する
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
/*
    エントリ取得
    リポジトリの持つpmdb配下のカットリストからエントリを抽出するメソッド
*/
NetworkRepository.prototype.entry        = serviceAgent._entry;
NetworkRepository.prototype.entryByToken = serviceAgent._entryByToken;

/**
    リクエストのヘッダにトークンを載せる
    リポジトリ汎用
*/
NetworkRepository.prototype.setHeader = function(xhr){
//console.log(this);
    var oauth_token = (xUI.onSite)? 
    $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token');
    var session_token = (xUI.onSite)? 
    $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token');
    var organizationToken = (this.token)? this.token : '';
//console.log([oauth_token,organizationToken]);
    if(oauth_token.length==0) return false;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhr.setRequestHeader('Authorization', ( "Bearer " + oauth_token));
        xhr.setRequestHeader('OrganizationToken', organizationToken );
        xhr.setRequestHeader('SessionToken', sessionToken );
    return true;
}
/**
 *    ネットワークリポジトリのpmdbを更新
 *    関連APIを順次呼び出し
 *    @params (Function) callback
*/
NetworkRepository.prototype.updatePMDB=function (callback){
//リポジトリ内各種情報の更新
    ServiceNode.apiCallOrganizationProperty(this);
//所属タイトル取得
    if(callback instanceof Function){
        ServiceNode.apiCallProducts(this,callback);
    }else{
        ServiceNode.apiCallProducts(this,function(){documentDepot.updateRepositorySelector()});
    }
//タイトルをコールすると順次エピソード、カットの更新が実行される
}
/**
    ネットワークリポジトリ初期化手続き
    同期処理を完了して非同期処理をローンチしたタイミングでtrueを返す。
    リポジトリのpmdbを取得してそこに含まれるworkTitles/productsから基本のブラウズリストを作成する。
    リポジトリ内にpmdbが存在しない場合は、処理をスキップ
    ＊システムのpmdbの内容をコピーしたデフォルトpmdbを作成して //.pmdbをセットする
    このメソッドは2019 09 23現在実行されていないので注意

*/
NetworkRepository.prototype.init=function (callback){
console.log('NetworkRepository init : '+this.name)
//初期値{}のケースのみ上書きでpmdbを初期化
    if(Object.keys(this.pmdb).length == 0){
        this.pmdb = new nas.Pm.PmDomain(this.service,'.'+this.service.url+'.'+this.token+'//');
        this.pmdb.token = this.service.pmdb.organizations.entry(this.token).pmdb_token;
//users,workTitles,productsは固定で必須テーブル　これ以外は各テーブルごとに初期化
        this.pmdb.contents.add('users');
        this.pmdb.contents.add('workTitles');
        this.pmdb.contents.add('products');
        this.pmdb.users      = new nas.UserInfoCollection(this.pmdb);
        this.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this.pmdb);
        this.pmdb.products   = new nas.Pm.OpusCollection(this.pmdb);
    }
//初回コール
    this.updatePMDB(callback);//引数として渡す
    return true;//
/*
    this.getProperties(function(nme){
        console.log(nme +' : read properties !!!!!!');
    });
    return true;//
//
    if(Object.keys(this.pmdb).length > 0) return 'TRUE';//初期化済みの場合は二度目を行わない

    this.pmdb = new nas.Pm.PmDomain(this.service,'.'+this.service.url+'.'+this.token+'//' );//ここで初期化

    this.pmdb.token = this.baseStorage.keyPrefix + '.localStorage:.localrepository.00000//.pmdb';
    var pmdbStream = this.baseStorage.entryList.getByIdf(this.pmdb.token,-2,'pmdb');//リポジトリ一致　タイプ指定
    if(pmdbStream){
//保存されたキャッシュが存在するので読み出す　タイムスタンプも取得
console.log('restore pmdb from stored data in localStorage : ');
        this.pmdb.parseConfig(pmdbStream);
    }else{
//保存されたキャッシュが存在しない
console.log('no data entry : '+this.pmdb.token);
console.log('clear workTitle|Products Table for :'+this.pmdb.token);
        this.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this.pmdb);;
        this.pmdb.products   = new nas.Pm.OpusCollection(this.pmdb);;
    }
console.log('localStorage init : build localRepository pmdb');
//    this.baseStorage.getProducts();//updatePMDB内部でbaseStorageへの問い合わせを行いその問い合わせがentryListを更新する
    this.updatePMDB();
        return true;


//基礎的Repository全体のpmdbを初期化する。全取得不能な場合は分割情報からビルド
    this.getEntry('//.pmdb',false,function(result){
        var pmdbStream = result;
        if(pmdbStream){
            this.pmdb.parseConfig(pmdbStream);
        }else{
            console.log('no data entry : //.pmdb for '+this.name );
            this.pmdb = new nas.Pm.PmDomain(nas,'.'+this.service.url+'.'+this.token+'//' );
        }
    },function(){
            console.log('no data entry : //.pmdb for '+this.name);
            this.pmdb = new nas.Pm.PmDomain(nas,'.'+this.service.url+'.'+this.token+'//');
    });
    return true;// */
}
/**
    リポジトリを一意に表す文字列を得る
 */
NetworkRepository.prototype.toString=function (){
    return ['',this.url,this.name,this.token].join('.')+'//';
}


/**
    リポジトリのプロパティを取得するメソッド
    初期化の際に必要に応じて呼び出す
    呼出前にリポジトリのpmdbを設定のこと 
*/

NetworkRepository.prototype._x_getProperties = function(callback,callback2){
console.log(this.name);
    var myURL = this.service.url + '/api/v2/organizations/property.json';
    var repositoryToken = this.token;

    var req = new UATRequest(
        myURL,
        function(result,callback,callback2){
console.log(result);
            var repository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
            var myServer = repository.service;
//（リポジトリ）ルートpmdbのためのデータ取得
//pmdb.users setup
            if(result.data.memberships.length){
                myServer.pmdb.contents.add('users');//チームプロパティ
                myServer.pmdb.users = new nas.UserInfoCollection([],myServer);
                repository.pmdb.users = Object.create(myServer.pmdb.users);//新規作成時に子の位置のオブジェクトを更新
//console.log(myServer.pmdb);
                for( var rix=0 ; rix<result.data.memberships.length ; rix ++){
                    var newEntry = new nas.UserInfo(result.data.memberships[rix].membership_name + ':' + result.data.memberships[rix].email);
                    newEntry.contact     = result.data.memberships[rix].owner_name;
                    newEntry.token       = result.data.memberships[rix].membership_token;
                    myServer.pmdb.users.addMember(newEntry);//UserInfoCollectionのみメソッド名が異なるので注意　配列受け入れできない
                };
            }
//pmdb.assets setup
            if(result.data.property.animation_assets.length){
                myServer.pmdb.contents.add('assets');//チームプロパティ
                myServer.pmdb.assets = new nas.Pm.AssetCollection(myServer);
                repository.pmdb.assets = Object.create(myServer.pmdb.assets);//新規作成時に子の位置のオブジェクトを更新
                for( var rix=0 ; rix<result.data.property.animation_assets.length ; rix ++){
                    var newEntry = new nas.UserInfo(result.data.property.animation_assets[rix].membership_name + ':' + result.data.property.animation_assets[rix].email);
                    newEntry.contact     = result.data.property.animation_assets[rix].owner_name;
                    newEntry.token       = result.data.property.animation_assets[rix].membership_token;
                    myServer.pmdb.assets.addMembers(newEntry);
                };
            }
//pmdb.lines setup ??
            if(result.data.property.lines.length){
                myServer.pmdb.contents.add('assets');//チームプロパティ
                myServer.pmdb.lines = new nas.Pm.LineCollection(myServer);
                repository.pmdb.lines = Object.create(myServer.pmdb.lines);//新規作成時に子の位置のオブジェクトを更新
                for( var rix=0 ; rix<result.data.property.lines.length ; rix ++){
                    var newEntry = new nas.UserInfo(result.data.property.lines[rix].membership_name + ':' + result.data.property.lines[rix].email);
                    newEntry.contact     = result.data.property.lines[rix].owner_name;
                    newEntry.token       = result.data.property.lines[rix].membership_token;
                    myServer.pmdb.assets.addMembers(newEntry);
                }
            };
            repository.getProducts();
            if(callback instanceof Function){
                callback(result.data.current_membership.organization_name);
            }
          },
        callback,
        callback2,
        repositoryToken,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var TSK = new UItask("",req,-1,1);
    xUI.taskQueue.addTask(TSK);
}
/**
    タイトル一覧を取得して情報を更新する エピソード更新を呼び出す
    
    受信したデータを複合させてサービス上のデータ構造を保持する単一のthis.productsDataオブジェクトにする
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得できるように変更
    引き続きの処理を行う際はコールバック渡し
    トークン指定がない場合は、全プロダクトの詳細を取得
    プロダクトデータ取得のみの場合は  空動作のコールバックを渡す必要あり
*/
NetworkRepository.prototype._x_getProducts=function (callback,callback2,prdToken){
    if(typeof prdToken == 'undefined'){prdToken = [];}
    if(!(prdToken instanceof Array)) prdToken=[prdToken];
//pmdbにworkTitles/productsが存在するか否かをチェック ない場合は新規作成
    if (
        (this.pmdb.contents.indexOf('workTitles') < 0)&&
        (this.pmdb.contents.indexOf('products') < 0)
    ){
       this.pmdb.workTitles = new nas.Pm.WorkTitleCollection(this);
       this.pmdb.contents.add("workTitles");
       this.pmdb.products = new nas.Pm.OpusCollection(this);
       this.pmdb.contents.add("products");
    }
    var workTitles = this.pmdb.workTitles;
    var products = this.pmdb.products;
    if (this.pmdb.contents.indexOf('users') < 0){
       this.pmdb.users = new nas.UserInfoCollection([],this);
    }
    var users = this.pmdb.users;

    var req = new UATRequest(
        this.url+'/api/v2/products.json',
        function(result){
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
//console.log(myRepository);
            //resultにデータが無いケース{}があるので分離が必要?
            for(var tid = 0 ;tid < result.data.products.length ; tid ++){
                var title = (result.data.products[tid].name == '')? result.data.products[tid].token:result.data.products[tid].name; 
//Idf取得
                var currentIdentifier=encodeURIComponent(title);
//console.log('check for :'+decodeURIComponent(currentIdentifier));
//識別子から得たタイトルがすでに登録されているか検査 未登録エントリは追加
//token指定がある場合は、登録タイトルを抹消して新しい情報で上書き？
//                var currentTitle = myRepository.title(currentIdentifier);
                var dataInfo=nas.Pm.parseIdentifier(currentIdentifier);
//console.log([currentIdentifier,dataInfo]);
                if(
                    (!(dataInfo.title instanceof nas.Pm.WorkTitle))||
                    (!(myRepository.pmdb.workTitles.entry(dataInfo.title)))
                ){
//タイトルDB内に該当データがない    自動的に登録してdataInfoを更新
//console.log('newTitle');
                    var newTitle = (dataInfo.title instanceof nas.Pm.WorkTitle)?dataInfo.title:new nas.Pm.WorkTitle(dataInfo.title);
                    newTitle.projectName = dataInfo.product.title;
                    newTitle.id          = nas.uuid();//Object.keys(localRepository.pmdb.workTitles.members).length;
                    newTitle.fullName    = dataInfo.product.title;
                    newTitle.shortName   = result.data.products[tid].short_name;
                    newTitle.code        = result.data.products[tid].code;
                    newTitle.framerate   = new nas.Framerate();

                    newTitle.name   = newTitle.projectName;
                    newTitle.token  = result.data.products[tid].token;
                    newTitle.pmdb   = new nas.Pm.PmDomain(myRepository,'.'+serviceAgent.url+'.'+myRepository.token+'//');
//console.log(newTitle);
                    var res = myRepository.pmdb.workTitles.addMembers(newTitle);
//console.log(res)
                    dataInfo.title = newTitle;
                }
            }
            //権限等で
            //この時点でタイトルに付属のメンバーシップを同時に取得してオブジェクトに設定する（プロパティオブジェクト未実装20171116）
//            myRepository.productsData = result.data.products;
            if(prdToken.length){
            //引数があれば引数のプロダクトを順次処理
                for (var tId = 0 ; tId < prdToken.length ; tId ++ ){
console.log(prdToken[tId]);
                    myRepository.productsUpdate(callback,callback2,prdToken[tId]);
                }
            }else{
            //引数がない場合はすべてのプロダクトの詳細を取得更新
                for (var prp in myRepository.pmdb.workTitles.members){
console.log(myRepository.pmdb.workTitles.members[prp].token);
                    myRepository.productsUpdate(callback,callback2,myRepository.pmdb.workTitles.members[prp].token);
                }
            };
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        null,repository
    );
    var tskNme =  new Date().getTime() + '%%getProducts'
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
}
/**
    タイトルごとの詳細（エピソードリスト含む）を取得してタイトルに関連付ける
    myToken 引数がない場合はすべてのプロダクトを更新
    必要に従ってエピソードリストの更新を行う
    コールバック引数がない場合はタイトルのエピソード毎に情報を取得
*/
NetworkRepository.prototype._x_productsUpdate=function(callback,callback2,myToken){
console.log(this.name + ' : productsUpdate !!');
    if(typeof myToken == 'undefined'){
            myToken = [];
        for(var tknId = 0 ;tknId < serviceAgent.currentRepository.productsData.length ;tknId ++){
            myToken.push(serviceAgent.currentRepository.productsData[tknId].token);
        }
    }else{
        if(!(myToken instanceof Array)) myToken=[myToken];
    }
console.log(myToken);
    for(var ix = 0 ;ix < myToken.length ;ix ++){
console.log(myToken[ix]);
    var req = new UATRequest(
        this.url+'/api/v2/products/'+myToken[ix]+'.json',
        function(result,callback,callback2){
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
console.log(result.data)
            var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
            for (var eix = 0;eix < result.data.episodes.length; eix ++){
//console.log(myTitle);
                var productIdf = result.data.product.name+'#'+result.data.episodes[eix].name;
                var workTitle  = myRepository.pmdb.workTitles.entry(result.data.product.token);
                if(!(myRepository.pmdb.workTitles.entry(result.data.episodes[eix].token))){
            	    var newProduct = new nas.Pm.Opus(
            	        productIdf,
            	        result.data.episodes[eix].token,
            	        result.data.episodes[eix].name,
            	        ((result.data.product.episodes)?result.data.product.episodes[eix].description:''),
            	        workTitle
                    );
console.log(myRepository);
                    newProduct.pmdb = new nas.Pm.PmDomain(myTitle,'.'+myRepository.service.url+'.'+myRepository.token+'//'+productIdf);
                    newProduct.stbd = new nas.StoryBoard(productIdf);
//console.log(newProduct);
                    var resp = workTitle.opuses.addMembers(newProduct);
//console.log(resp);
                    if(resp[0]) myRepository.pmdb.products.addMembers(resp[0]);
                }
            }
            if(result.data.episodes.length) {
console.log('request updateEpisodes :' + result.data.product.token);
                myRepository.updateEpisodes(callback,callback2,result.data.product.token);
            }else{
console.log('fail productsData update no entry in Repository::');
console.log(result);
            }
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var tskNme = myToken[ix] + '%%productsUpdate';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
    }
}
/**
    プロダクトごとにエピソード一覧を再取得してデータ内のエピソード一覧を更新
    引数 product_tokenが存在する場合は、指定のプロダクト以外の処理をスキップ
*/
NetworkRepository.prototype._x_updateEpisodes=function (callback,callback2,prdToken) {
//console.log(this.name + ' : updateEpisodes');
//       var myProduct = serviceAgent.currentRepository.getNodeElementByToken(prdToken);
       var myProduct = this.pmdb.workTitles.entry(prdToken);
//console.log(myProduct);
        if(! myProduct) return false;
console.log("getEpisodeList : "+myProduct.token+' : '+myProduct.name) ;
    var req = new UATRequest(
        this.url+'/api/v2/episodes.json?product_token='+myProduct.token,
        function(result,callback,callback2){
//console.log(result.data)
            if(callback instanceof Function){
                callback(callback);
            }else{
                var myRepository = serviceAgent.repositories.find(function(element){
                    return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
                });
                var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
                for (var eix = 0;eix < result.data.episodes.length; eix ++){
                    
                    var currentProduct = myRepository.pmdb.workTitles.entry(result.data.episodes[eix].token);
                    if(!(currentProduct)){
                        var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
                        var productIdf = result.data.product.name+'#'+result.data.episodes[eix].name;
//  nas.Pm.Opus(myProductName,myID,myOpus,mySubtitle,myTitle) 実際にはこちらは実行されない（はず）
                        var newProduct = new nas.Pm.Opus(
                            productIdf,
                            result.data.episodes[eix].token,
                            result.data.episodes[eix].name,
                            result.data.episodes[eix].description,
                            myTitle
                        );
                        newProduct.pmdb = new nas.Pm.PmDomain(myTitle,'.'+myRepository.service.url+'.'+myRepository.token+'//'+productIdf)
                        newProduct.stbd = new nas.StoryBoard(productIdf);
                        myTitle.opuses.addMembers(newProduct);
                        myRepository.pmdb.products.addMembers(newProduct);
                    }else{
                        currentProduct.subtitle = result.data.episodes[eix].description;
                    }
                    myRepository.getBAGs(result.data.episodes[eix].token,false,false);
                };
            }
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var tskNme = myProduct.token + '%%updateEpisodes' ;
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
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
        リポジトリ指定＝引数なし  で全タイトル
        タイトル指定で特定タイトルの情報を更新
        引数が配列の場合は配列内のタイトルを更新
        下位情報には踏み込まないコールバックリレーは行わない

    エピソード取得 repository.getOpus(myTitle,myOpus,callback,callback2)
        タイトル指定で、そのタイトル配下のエピソード
        OPUS指定があれば、そのOPUSのみを更新
    カット取得       repository.getSCi(myOpus,pgNo,ppg,callback,callback2)
        プロダクト指定,エピソード指定,ページ数,単位
    エピソードの指定が存在する場合は、指定エピソードの処理を行う  配列OK
    それ以外は指定プロダクトのすべてを更新
 */
NetworkRepository.prototype._x_getEpisodes=function (callback,callback2,prdToken,epToken) {
console.log(this.name + ' : get Episodes for :'+prdToken);
    var allEpisodes=false;
    if(typeof epToken == 'undefined'){
        epToken     = [];
        allEpisodes = true;
        var myProduct=this.title(prdToken);
        if((! myProduct)||(! myProduct.episodes)||(myProduct.episodes[0].length == 0)){console.log('stop'); return false;}
        for (var px = 0 ;px < myProduct.episodes[0].length;px ++){epToken.push(myProduct.episodes[0][px].token);}
    }
    if(!(epToken instanceof Array)) epToken = [epToken];
    for(var ex = 0;ex < epToken.length ;ex ++){
        var myEpisode=this.pmdb.products.entry(epToken[ex]);
        if(! myEpisode) continue;
        if((allEpisodes)&&(myEpisode.cuts)){console.log('skip'+myEpisode.name) ;continue;}
//対象が全エピソードで、エピソードがすでにカット情報を持っているケースでは処理スキップ
//api/v2
    var req = new UATRequest(
        this.url+ '/api/v2/episodes/'+myEpisode.token +'.json',
        function(result,callback,callback2){
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
            var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
            var updateTarget = myRepository.pmdb.products.entry(result.data.episode.token);
        if(! updateTarget){console.log('erroe###');console.log(updateTarget);};   
//非同期処理中に変数を共有するのでmyEpisodeが変動するためターゲットをリザルトから再キャプチャ
//オブジェクト入れ替えでなくデータの追加アップデートに変更
//内容は等価だがAPIの変更時は注意
//この時点でカットの総数が取得されるのでカット一覧詳細取得時総数を参照して分割取得
//console.log('update target episode###');console.log(updateTarget);
      /*          if(!(updateTarget.cuts)){updateTarget.cuts=[[]];}
                updateTarget.cuts[0] = result.data.cuts;
                updateTarget.created_at = result.data.episode.created_at;
                updateTarget.updated_at = result.data.episode.updated_at;// */
console.log(updateTarget);
                if(callback instanceof Function){
                    callback();
                }else{
                    //標準処理
                    if(result.data.storyboards.length){
                        var stbdInf = result.data.storyboards[0];
                        updateTarget.stbd.token = stbdInf.token;
                        myRepository.getEntry(stbdInf.token);
                    }else{
                        myRepository.getSCi(false,false,myEpisode.token);
                    }
                }
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var tskNme = myEpisode.token + '%%getEpisodes';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
    };
};
/**
    episode_token を与えてカット袋データをstbdエントリへ変換　UATサーバ ⇒ stbd
    エントリの更新時は　アプリケーション > stbd > UATサーバ
    情報の不整合をマッチさせる機能はバックエンドで走らせるように予定
    @params {String}    epToken
        ショット/xMap取得を行うproduct(opus)token
    @params {Function}  callback
        成功時コールバック
    @params {Function}  callback2
        失敗時コールバック
*/
NetworkRepository.prototype._x_getBAGs=function (epToken,callback,callback2) {
    var myEpisode = this.pmdb.products.entry(epToken);
    if((! myEpisode)) return false;
//console.log(this.name + ' : getBAGs : '+ myEpisode.name);

    var req = new UATRequest(
        this.url+ '/api/v2/cut_bags.json?episode_token='+myEpisode.token,
        function(result,callback,callback2){
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
            var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
//このメソッドはstbdのエントリがあってもなくても実行可能
                        var currentEpisode    = myRepository.pmdb.products.entry(result.data.episode.token);
                        var currentTitle      = currentEpisode.title;
                        var storyBoard        = currentEpisode.stbd;
                        for (var bix = 0 ;bix < result.data.cut_bags.length ; bix ++){
                            for (var cix = 0 ;cix < result.data.cut_bags[bix].cuts.length ; cix ++){
//先行で内包カットを登録
                                var shot = result.data.cut_bags[bix].cuts[cix];
                                var shotIdf = (shot.description)?shot.description:currentTitle.name+'#'+currentEpisode.name+'//'+((shot.name)?shot.name:shot.token);
//console.log(shotIdf);
                                var dataInfo = nas.Pm.parseIdentifier(shotIdf);
                                if(storyBoard.entry(dataInfo.sci[0].name)){
//console.log('skip operation for :'+dataInfo.name);
                                    continue;//ここで既存エントリをskip
                                }
                                var newClmn = new nas.StoryBoard.SBColumn(storyBoard,0);
                                newClmn.indexText = dataInfo.sci[0].name;
                                newClmn.timeText = dataInfo.sci[0].time;
                                var newShot = new nas.StoryBoard.SBShot(storyBoard,dataInfo.sci[0],[newClmn]);
                                newShot.token = shot.token;

                                var added   = storyBoard.edit('add',newShot);//単純追加
                                added[0].xmap.token=result.data.cut_bags[bix].token
//console.log('add Entry');console.log(added[0].xmap.nodeChart);//追加情報
//console.log(dataInfo.mNode);
                                if(dataInfo.mNode) added[0].xmap.writeNode(dataInfo.mNode);
                                for (var vix = 0 ;vix < shot.versions.length; vix ++){
                                    if(shot.versions[vix]==null) continue;//下と統合可能だが現在保留 2019.09.24
                                    if(shot.versions[vix].description == null) continue;
                                    var subDataInfo = nas.Pm.parseIdentifier(shot.versions[vix].description);
                                    if(subDataInfo.mNode) added[0].xmap.writeNode(subDataInfo.mNode);
//console.log(subDataInfo.mNode);
                                }
                            }
                        }
                        if(callback instanceof Function){
                            callback(result);
                        }else{
//                            documentDepot.documentsUpdate();
                        }
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var tskNme = epToken + '%%getBAGs';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};
/**
    エピソード毎にカットリストを再取得
    エピソード詳細の内部情報にコンバート
    カット一覧にdescriptionを出してもらう
    取得時にentryListを同時更新する
    @params {String}    epToken
        ショット/xMap取得を行うproduct(opus)token
        ターゲットの話数キーまたは、カットトークン
        epToken のかわりにカットトークンが与えられた場合は、カット1つのみのリスト作成して高速に処理を完了する
    @params {Function}  callback
        成功時コールバック
    @params {Function}  callback2
        失敗時コールバック
    @params {Number}    pgNo
        リストのページID  1 origin
    @params {Number}    ppg
        ページごとのエントリ数


    
 */
NetworkRepository.prototype._x_getSCi=function (callback,callback2,epToken,pgNo,ppg) {
    var myEpisode = this.opus(epToken);
console.log(this.name + ' : getSCi :');console.log(myEpisode);
    if((! myEpisode)||(! myEpisode.cuts)) return false;
    if(typeof pgNo == 'undefined') pgNo = '1';
    if(typeof ppg  == 'undefined')  ppg = myEpisode.cuts[0].length;
    var targetURL = this.url+ '/api/v2/cuts.json?episode_token='+myEpisode.token+'&page_no='+parseInt(pgNo)+'&per_page='+parseInt(ppg);
    var req = new UATRequest(
        targetURL,
        function(result,callback,callback2){
//console.log(result.data)
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
            var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
            var myEpisode = myRepository.opus(epToken);
//console.log(result);console.log(myEpisode);
                                      myEpisode.cuts[0]=result.data.cuts;
//カット登録数1以上の場合のみ処理
if(myEpisode.cuts[0].length){
if (! myEpisode.cuts[0][0].description) console.log(myEpisode.token)
                                        var currentTitle = (! myEpisode.cuts[0].description)?
                                            myRepository.title(myEpisode.token,1):
                                            myRepository.title(myEpisode.cuts[0].description);
if(! currentTitle){console.log(currentTitle)}
/**
エントリ取得タイミングで仮にcutのdescription を追加するcuts[1][cid].description を作成して調整に使用する
本番ではデータ比較ありで、入替えを行う  サーバ側のプロパティ優先
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
APIの情報は、識別子と一致しているはずだが  照合の上異なる場合はAPIの情報で上書きを行う
識別子として  cut.description を使用  上位情報は、エントリから再作成
サブタイトルは  episode.discriptionを使用
兼用カット情報はペンディング
*/
//console.log(myCut)
                var myCutToken = myCut.token;
                var myCutLine  = (myCut.line_id)?
                    myCut.line_id:
                    (new XpsLine(nas.pmdb.pmTemplates.members[0].line.toString())).toString(true);
                var myCutStage = (myCut.stage_id)?
                    myCut.stage_id:
                    (new XpsStage(nas.pmdb.pmTemplates.members[0].stages.getStage())).toString(true);
                var myCutJob   = (myCut.job_id)?
                    myCut.job_id:
                    (new XpsJob(nas.pmdb.jobNames.members[0].toString())).toString(true);
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
                var currentEntry=myRepository.entry(myCut.description);//既登録エントリを確認
                if(currentEntry) {console.log(decodeURIComponent(myCut.description));console.log(currentEntry);console.log(currentEntry.remove());console.log('current entry removed')}
                    //登録されていた場合はあらかじめ削除しておく
                var newEntry = new listEntry(entryArray.join('//'),currentTitle.token,myEpisode.token,myCutToken);
                newEntry.parent = myRepository;
                myRepository.entryList.put(newEntry);
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
//                            documentDepot.documentsUpdate();
                        }
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var tksNme = myEpisode.token + '%%getSCi';
    var TSK = new UItask(tskNme,req,-1,1);
    xUI.taskQueue.addTask(TSK);
};


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
/** UATservice (トランザクション対応新コード)
 *	Object UATRequest のrequestプロパティ用
 *    xpst受信メソッド
 *    NetworkRepositoryクラス・メソッド
 *	@params	{Object}	result
 *		受信データ
 *	@params {Function}	callback
 *		処理成功時コールバック 第４引数があれば無視
 *	@params {Function}	callback2
 *		処理失敗時コールバック 第４引数があれば無視
 *	@params {Object}	transaction
 *		　処理transaction
 */
NetworkRepository.receiveXpst = function(result,callback,callback2,transaction) {
//console.log(result);
//データ請求に成功したので、現在のデータを判定して必要があれば処理
	var myContent=result.data.cut.content;//XPSソーステキストをセット
    myContent = serviceAgent.overwriteProperty(
        myContent,
        serviceAgent.currentRepository.toString(),
        'REPOSITORY'
    );
//console.log(myContent);
//カットコンテンツがnullのケースは、カットの登録のみでデータがない場合(エラーではない)
//その場合は、カットのデータ登録内容に従って空のタイムシートを受信したものとして扱う
    if(transaction){
//トランザクション処理
        var targetOject = (transaction.target instanceof xUI.Document)? transaction.target.content:transaction.target;
        var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);
        if((myContent)&&(result.data.updated_at > targetObject.timestamp)){
            targetObject.parseXps(myContent);
            targetObject.timestamp = result.data.updated_at;
        }
		if(transaction.command=='pull'){
			transaction.success();
		}else{
			xUI.manipulateDocument(transaction);
		}
    }else{
//非トランザクション処理
		if(callback instanceof Function){
			callback(myContent);
		}else{
            if(myContent == null){
                myContent = new Xps();
                var shotId = xUI.documents[0].content.inherit.findIndex(function(element){
                    return (nas.Pm.compareCutIdf(element.name,result.data.cut.name)==0);}
                )
//console.log(shotId);
                myContent.syncIdentifier(xUI.documents[0].content.getIdentifier('xps',shotId));
//                オブジェクト渡しとなる
            }
//console.log(myContent);
			var setIndex = xUI.documents.setContent(myContent,true);
//console.log('set documents index : '+ setIndex);
            if(setIndex >= 0){
                if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
            }
		}
	};//no-transaction method
}
/** UATservice (トランザクション対応新コード)
 *	Object UATRequest のrequestプロパティ用
 *    xmap受信メソッド
 *    NetworkRepositoryクラス・メソッド
 *	@params	{Object}	result
 *		受信データ
 *	@params {Function}	callback
 *		処理成功時コールバック 第４引数があれば無視
 *	@params {Function}	callback2
 *		処理失敗時コールバック 第４引数があれば無視
 *	@params {Object}	transaction
 *		　処理transaction
 */
NetworkRepository.receivexMap = function(result,callback,callback2,transaction) {
console.log(result);
//データ請求に成功したので、現在のデータを判定して処理の必要があれば処理
//リザルトのデータ長が0のケースが存在するので要注意
	var myContent=result.data.cut_bag.x_map;//xMapソーステキストをセット
//空データ（null）のケースあり注意
console.log('set source to REPOSITORY:' +  serviceAgent.currentRepository.toString());
    myContent = serviceAgent.overwriteProperty(myContent,serviceAgent.currentRepository.toString(),'REPOSITORY');
console.log(myContent);
    if(transaction){
//トランザクション処理(Xpstのケースとほぼ同一なので統合を考慮 20200310)
        var targetOject = (transaction.target instanceof xUI.Document)? transaction.target.content:transaction.target;
        var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);
        if((myContent)&&(result.data.updated_at > targetObject.timestamp)){
            targetObject.parsexMap(myContent);
            targetObject.timestamp = result.data.updated_at;
        }
		if(transaction.command=='pull'){
			transaction.success();
		}else{
			xUI.manipulateDocument(transaction);
		}
    }else{
        if(! myContent){
console.log('this entry has no xmap data content.' + result.data.cut_bag.name);
            serviceAgent.currentRepository.getxMap(
                result.data.cut_bag.cuts[0].description,
                callback,
                callback2
            );
        }else{
	    try{
		    if(callback instanceof Function){
console.log('callback execute')
			    callback(myContent);
		    }else{
			    var setIndex = xUI.documents.setContent(myContent,true);
			    console.log(setIndex);
		    }
	    }catch(err){
		    console.log(err);
		    if(callback2 instanceof Function) callback2();
	    }
        }
    }
}
/** UATservice (トランザクション対応新コード)
 *	Object UATRequest のrequestプロパティ用
 *    stbd受信メソッド
 *    NetworkRepositoryクラス・メソッド
 *	@params	{Object}	result
 *		受信データ
 *	@params {Function}	callback
 *		処理成功時コールバック 第４引数があれば無視
 *	@params {Function}	callback2
 *		処理失敗時コールバック 第４引数があれば無視
 *	@params {Object}	transaction
 *		　処理transaction
 */
NetworkRepository.receiveSTBD = function(result,callback,callback2,transaction) {
//console.log(result);
//データ請求に成功したので、現在のデータを判定して処理の必要があれば処理
	var mySTBD = (result.data.stoalybords)? 
	    result.data.storyboards[0]:result.data.storyboard;
console.log(mySTBD);
    if(transaction){
//トランザクション処理
        var targetOject = transaction.target;
        var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);
        if((mySTBD.content)&&(mySTBD.updated_at > targetObject.timestamp)){
            targetObject.parseScript(mySTBD.content);
            targetObject.timestamp = mySTBD.updated_at;
        }
		if(transaction.command=='pull'){
			transaction.success();
		}else{
			xUI.manipulateDocument(transaction);
		}
    }else{
	  try{
		if(callback instanceof Function){
			callback(myContent);
		}else{
			console.log(result.data.storyboards[0]);
			console.log(myContent);
		}
	  }catch(err){
		console.log(err);
		if(callback2 instanceof Function) callback2();
	  }
	}
};//receiveSTBD
/** UATservice (トランザクション対応新コード)
 *	Object UATRequest のrequestプロパティ用
 *    pmdb受信メソッド
 *    NetworkRepositoryクラス・メソッド
 *	@params	{Object}	result
 *		受信データ
 *	@params {Function}	callback
 *		処理成功時コールバック 第４引数があれば無視
 *	@params {Function}	callback2
 *		処理失敗時コールバック 第４引数があれば無視
 *	@params {Object}	transaction
 *		　処理transaction
 *　UATの場合202005現在このメソッドがコールされることはない
 */
NetworkRepository.receivePMDB = function(result,callback,callback2,transaction) {
console.log(result);
//データ請求に成功したので、現在のデータを判定して処理の必要があれば処理
	var myContent=result.data.pmdb.content;//xMapソーステキストをセット
	console.log(myContent);
	try{
		if(callback instanceof Function){
			callback(myContent);
		}else{
			console.log(result.data.storyboards[0]);
			console.log(myContent);
		}
	}catch(err){
		console.log(err);
		if(callback2 instanceof Function) callback2();
	}
}

/**
識別子（ユーザの選択）を引数にして実際のデータを取得
サーバから受け取ったデータはコールバックで処理

識別子がxpstで管理情報が付いている場合はそれを呼ぶ
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
//    if(typeof isReference == 'undefined'){isReference = false;}
//識別子をパース
    var targetInfo     = nas.Pm.parseIdentifier(myIdentifier);//与えられた識別子をパース
    var myIssue = false;
    var refIssue = false;
//識別子からDBを検索してトークンを得る
    var myEntry = this.entry(myIdentifier);
    var exists = (myEntry.token)? myEntry:null;
    if((! myEntry)||(! exists)){
            var msg=localize({en:"no entry %1 in DB",ja:"DBからエントリ%1の取得に失敗しました"},decodeURIComponent(myIdentifier));
        return false;
    }
    var targetURL;
    var taskName ;
    var getMethod;
    if(targetInfo.type == 'pmdb'){
//pmdbは、階層化データなのでtargetInfoから階層データを得る
        console.log([targetInfo,myEntry]);return ;
//        targetURL = this.url + '/api/v2/pmdb/'+myEntry.token+'.json';
//        taskName  = 'requesPMDB:'+decodeURIComponent(myIdentifier);
//        getMethod = NetworkRepository.receivePMDB;
    }else if(targetInfo.type == 'stbd'){
        targetURL = this.url + '/api/v2/storyboards/'+myEntry.token+'.json';
        taskName  = 'requestSTBD:'+decodeURIComponent(myIdentifier);
        getMethod = NetworkRepository.receiveSTBD;
    }else if(targetInfo.type == 'xmap'){
console.log('request xmap :'+ decodeURIComponent(myIdentifier));
        targetURL = this.url + '/api/v2/cut_bags/'+myEntry.token+'.json';
        taskName  = 'requestxMap:'+decodeURIComponent(myIdentifier);
        getMethod = NetworkRepository.receivexMap;
    }else{
//のこりすべてxpst
        targetURL = this.url + '/api/v2/cuts/'+myEntry.token+'.json';
        taskName  = 'requestXpst:'+decodeURIComponent(myIdentifier);
        getMethod = NetworkRepository.receiveXpst;
    }
console.log(targetURL);
console.log(taskName);
console.log(isReference);console.log(this.token);
    if(! isReference){
//主エントリの取得　バックグラウンド実行
        var req = new UATRequest(
            targetURL,
            getMethod,
            callback,
            callback2,
            this.token,
            "GET",
            'json',
            (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
            (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
        );
//リクエストをタスクとして初期化　100ミリ秒ウエイトで１回実行
console.log([taskName,req]);
        var TSK = new UItask(taskName,req,100,1);
console.log (xUI.taskQueue.addTask(TSK));
    }else{
        if(targetInfo.type != 'xpst') return false;
    //データ単独で現在のセッションのリファレンスを置換
        $.ajax({
            url: targetURL,
            type: 'GET',
            dataType: 'json',
            success: function(result) {
                var myContent=result.data.cut.content;//XPSソーステキストをセット
                if(callback instanceof Function){
                    callback(myContent);
                }else{
	                xUI.setReferenceXPS(myContent);
	            }
                xUI.setUImode('browsing');
                if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
            },
            error: function(result){
if(config.dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
        },
        beforeSend: this.service.setHeader
    });
    return true
}
  return null;
}
/**
 *	ターゲットの識別子を与えxMapを取得する
 *	xpst|xmapのみを受け付ける仕様に変更
 *	コールバック処理のためマージバッファを設定
 */
NetworkRepository.prototype.getxMap = function(targetIdf,callback,callback2){
console.log('====================NetworkRepository====================================SET TARGET');
console.log(decodeURIComponent(targetIdf));
console.log(this);
    var targetEntry = this.entry(targetIdf,'shot');//Xpstを取得する
console.log(targetEntry);
    if(! targetEntry){
        this.mergeBuffer = undefined;
        this.mergeTarget = [];
        this.mergedIndex = null;
        if(callback2 instanceof Function){
            callback2();
        }else{
            return false;
        }
    }
    targetEntry = targetEntry.xmap;
console.log(targetEntry);
    if(this.mergedIndex == null){
        this.mergeBuffer = undefined;
        this.mergeTarget = [];
        this.mergedIndex = 0        ;//スタートアップセット
    }
//エントリのすべてのバージョンからxMapを生成してマージする
console.log('set merge count :' + targetEntry.contents.length);
    this.mergedIndex = targetEntry.contents.length;//減算カウンタ初期値
//カット数ループ
    for (var cx = 0 ;cx < targetEntry.contents.length ;cx ++ ){
        var targetToken = targetEntry.contents[cx].token;
        var targetURL= '/api/v2/cuts/'+targetToken+'/all/versions.json';
//データをバージョン一括取得してマージ実行
        var req = new UATRequest(
            this.url+targetURL,
            function(result,callback,callback2){
console.log([result,callback,callback2]);
//母体リポジトリをスコープに関わらず取得する
                var myRepository = serviceAgent.repositories.find(function(element){
                    return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
                });
//タイトル取得(ここはタイトルトークンがない)
//                var myTitle = myRepository.pmdb.workTitles.entry(result.data.current_membership.token);
//console.log(myTitle)
//以下処理
                try{
                    var contents = []
                    var tmpXps  = new Xps();
                    var tmpxMap = myRepository.mergeBuffer;
var monitor  = []
for(var vx = 0; vx < result.data.versions.length ; vx ++){
    if(!(result.data.versions[vx].content)) continue;//skip　コンテンツがないケースをスキップ
    var tmp = new Xps();
    var resp = tmp.parseXps(result.data.versions[vx].content);
    var xxmp = Xps.getxMap(tmp)
    console.log(vx +' : '+ xxmp.pmu.nodeManager.getNode().getPath());
    monitor.push(xxmp.pmu.nodeManager.getNode().getPath());
}
console.log(monitor);//無要素の場合採取可能なデータがない
                    for(var vx = 0; vx < result.data.versions.length ; vx ++){
console.log(result.data.versions[vx]);
                        if(!(result.data.versions[vx].content)) continue;//skip

                        tmpXps.parseXps(result.data.versions[vx].content);
                        if(! tmpxMap){
                            tmpxMap = Xps.getxMap(tmpXps);
                            myRepository.mergeBuffer = tmpxMap ;
                        }else{
                            tmpxMap.merge(Xps.getxMap(tmpXps));
                        }
                    }
                    myRepository.mergedIndex --;
                    if(myRepository.mergedIndex <= 0){
                        if(! tmpxMap) tmpxMap = new xMap(targetIdf);
                        tmpxMap.pmu.reset();
                        tmpxMap.pmu.setProduct(targetIdf);
                        tmpxMap.dataNode = myRepository.toString();//これはプッシュ時まで保留（最後にpush）
                        if(!(tmpxMap.pmu.currentNode)) tmpxMap.pmu.currentNode = tmpxMap.pmu.nodeManager.getNode();

                        if(callback instanceof Function){
                            callback(tmpxMap);
                        }else{
                            xUI.documents.setContent(tmpxMap,true);
                        }

                        myRepository.mergedIndex = null;//
                    }
                }catch(err){
                    console.log(err);
                    if(callback2 instanceof Function) callback2();
                }
            },
            callback,
            callback2,
            this.token,
            "GET",
            'json',
            (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
            (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
        );
//リクエストをタスクとして初期化　100ミリ秒ウエイトで１回実行
        var TSK = new UItask('get_xmap_'+targetEntry.name,req,100,1);
        var tid = xUI.taskQueue.addTask(TSK);
console.log(tid);
    }
};//
/* TEST
serviceAgent.currentRepository.getxMap(xUI.XMAP.getIdentifier('xps',0),function(res){console.log(res)})

*/

/**
    標準コールバックを作る
    コールバック関数が引数で与えられなかった場合は xUIに新規Xpsとして与えて読み込ませる
    読み出したエントリに前方のジョブがあれば、それをリファレンスとして与えるルーチンも必要


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

識別子は受け入れない  必要に従って前段で分解のこと
*/
NetworkRepository.prototype.addTitle=function (myTitle,myDescription,myPm,callback,callback2){
/*
    識別子を検出（呼び出し側で）このルーチンまで来た場合は、引数を分解しておくこと
    2017.01.28時点でAPIにtemplateが出ていないのでpmの処理は省略  遅延で詳細編集を行っても良い
    serviceAgent.currentRepository.addTitle("tST2","testTitlewith API")
    作成時に検査を行い、既存タイトルならば処理を中断する（呼び出し側で）
    タイトル作成前に確認メッセージを出す（これも呼び出し側）
    現在はPmオブジェクトは機能していない  2/9 2017
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
if(config.dbg) console.log('success');
if(config.dbg) console.log(result);
            if(callback instanceof Function) callback();
		},
		error:function(result) {
if(config.dbg) console.log('error');
if(config.dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
}
/**
    DBにOPUS(エピソード)を作成する。
引数
    タイトルを含む識別子  カット番号は求めない
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
    var parseData = nas.Pm.parseIdentifier(myIdentifier);
    if(! parseData){
        if(callback2 instanceof Function) callback2;
        return;
    }
    var myProduct = parseData.product;
    
    var myEntry=false;
    if(typeof prodIdentifier == 'undefined'){
        for (var pid=0;pid<documentDepot.products.length;pid ++){
        //productsのメンバをオブジェクト化したほうが良いかも
            var prdInfo=nas.Pm.parseProduct(documentDepot.products[pid]);
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
		    if( callback instanceof Function) callback();
		},
		error:function(result) {
		    if( callback2 instanceof Function) callback2();
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
}
/*
データオブジェクトを渡してリポジトリにプッシュする
一致エントリがあれば上書き
一致エントリで先行の管理情報がロックされている場合はリジェクト
管理情報の世代が上がっていれば追加の管理情報を添えて保存
タイトルがDBに登録されていない場合は、ユーザの確認をとってタイトルを作成
エピソードがDBに登録されていない場合も同様

これは保存系のAPIが出てから調整

エントリオブジェクト（xUI.Document）を引数にする仕様に変更
Document.type == 'xmap'であった場合は、配下のXpsすべてPushする
    params  {Object nas.Document}   targetDocument
トランザクションは受け取らない（処理がトランザクション内に内包されている）
*/

NetworkRepository.prototype.putEntry=function (targetDocument,callback,callback2){
//識別子取得（全要素で取得）
    var targetIdentifier=nas.Pm.getIdentifier(targetDocument.content,'full');
//識別子に相当するアイテムがリポジトリに存在するかどうかをチェック
    var currentEntry = this.entry(targetIdentifier);
//    var currentCut   = this.cut(currentEntry.issues[0].cutID);
    if(currentEntry.token){
            //既存のエントリが有るのでストレージとリストにpushして処理終了
        this.pushData('PUT',currentEntry,targetDocument,callback,callback2)
    }else{
//    currentEntry==null なので、ターゲットのエピソードtokenを再取得して引数で渡す必要あり １２・２１
//新規エントリなので新たにPOSTする (空エントリを引数に付ける)
        var tmpEntry= this.entry(Xps.getIdentifier(targetDocument),true);
        this.pushData('POST',tmpEntry,targetDocument,callback,callback2)    
    }
};
/**
    サーバにデータを送信する（基底メソッド）
    引数:
        メソッド文字列
        product|listEntry
        pmdb|xMap|Xpsオブジェクト
        成功時コールバック関数
        失敗時コールバック関数

リポジトリ上に既存エントリはPUT 新規エントリはPOSTで  送信
タイトルや、エピソードが存在しないデータはリジェクト
オンサイト時は  各種データをbackend_variablesから取得
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
NetworkRepository.prototype.pushData=function (myMethod,myEntry,dataObject,callback,callback2){
//console.log(myEntry);
if (myEntry instanceof listEntry){
//エントリオブジェクト渡し
	var lastIssue   = myEntry.issues[myEntry.issues.length-1];

    var title_name     = myEntry.product.split('#')[0];
    var episode_name   = myEntry.product.split('#')[1];
    var cut_name       = (myMethod == 'PUT')? myEntry.sci:'s'+((dataObject.scene)? dataObject.scene:'-')+'c'+dataObject.cut+"("+nas.Frm2FCT(dataObject.time(),3,0,dataObject.framerate)+")";
    var line_id        = dataObject.line.toString(true);
    var stage_id       = dataObject.stage.toString(true);
    var job_id         = dataObject.job.toString(true);
    var status         = dataObject.currentStatus.toString(true);
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
    var cut_name       = (myMethod == 'PUT')? myEntry.sci:'s'+((dataObject.scene)? dataObject.scene:'-')+'c'+dataObject.cut+"("+nas.Frm2FCT(dataObject.time(),30,dataObject.framerate)+")";
    var line_id        = dataObject.line.toString(true);
    var stage_id       = dataObject.stage.toString(true);
    var job_id         = dataObject.job.toString(true);
    var status         = dataObject.currentStatus.toString(true);
/*
    var line_id        = lastIssue[0];
    var stage_id       = lastIssue[1];
    var job_id         = lastIssue[2];
    var status         = lastIssue[3];
*/
    
}
//オンサイト・シングルドキュメントバインドの場合はbackend_variablesから情報を取得
  if(serviceAgent.currentStatus=="online-single"){
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
	                description     : nas.Pm.getIdentifier(dataObject,true),
			 		status          : dataObject.currentStatus.toString(true),
			 		job_id          : decodeURIComponent(dataObject.job.toString(true)),
			 		stage_id        : decodeURIComponent(dataObject.stage.toString(true)),
			 		line_id         : decodeURIComponent(dataObject.line.toString(true)),
			 		content         : dataObject.toString()
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
	                   description  : nas.Pm.getIdentifier(dataObject,true),
			 		   content      : dataObject.toString(),
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
if((typeof cut_token == 'undefined')||(cut_token == 'undefined')){console.log(dataObject);console.log(myEntry);}
/*
開発中の 制作管理DB/MAP/XPS で共通で使用可能なnas.SCInfoオブジェクトを作成中
これに一意のIDを持たせる予定です。
*/
if(config.dbg) console.log(method_type+' :'+serviceAgent.currentRepository.url+target_url +'\n' +JSON.stringify(json_data));
	$.ajax({
		type : method_type,
		url : serviceAgent.currentRepository.url+target_url,
		data : JSON.stringify(json_data),
		contentType: 'application/JSON',
		dataType : 'JSON',
		scriptCharset: 'utf-8',
		success : function(result) {
                if (xUI.XPS === dataObject) xUI.setStored('current');
			xUI.sync();//保存ステータスを同期
			if( method_type == 'POST'){
if(config.dbg) console.log("new cut!");
//console.log(result);
				$('#backend_variables').data('cut_token', result.data.cut['token']);
			}else{
if(config.dbg) console.log('existing cut!');
			}
// リストプッシュ 等の内部  DB操作は前段で適用を済ませるかまたはコールバック渡しにする
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
    カットトークン又はエピソードトークンから識別子を取得する
    エピソードトークンで得られた識別子はカット番号を自動で補う
    タイトル等の文字列が必要な場合はダミーのカット番号を捨てる必要あり
   <削除予定>
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
    product>episodes>cut の順で検索  種別指定があればそのエレメントを先に検索
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
                //cuts[0]がトレーラーオブジェクト  cuts[1] を廃止する準備中
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
手順  GET serverURL(token).json
サーバリザルトのdescriptionから状態と内容を確認して
Activate可能な場合は新しいコンテンツとdescriptionを送信              
それ以外は失敗
*/
                currentCut.versions = result.data.versions;
                var currentServerXps=new Xps();
                    currentServerXps.parseXps(result.data.cut.content);
//cut.description  にidentifierがセットされないケースがある（サービス的には正常）
//cut.descriptionがヌルまたはundefinedの際はXps本体から情報を構築する

                var currentDataInfo=nas.Pm.parseIdentifier(result.data.cut.description);
//ディスクリプションがcutに付属していないのは  APIの変更によるので  調整  0211
                if(! currentDataInfo) currentDataInfo = nas.Pm.parseIdentifier(Xps.getIdentifier(currentServerXps));
console.log(currentDataInfo);
//書き込み権限の判定からスタッフの判定になる  
//                    (result.data.permissions.write)&&
//                    (result.data.permissions.read)&&
                if(
                    ((currentDataInfo.status.content == "Fixed")|| (currentDataInfo.status.content == "Hold"))&&
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
                            description: nas.Pm.getIdentifier(newXps)
                        }
                    };
if(config.dbg) console.log(data);
                    $.ajax({
		                type : 'PUT',
		                url : serviceAgent.currentRepository.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		                data : data,
		                success : function(result){
//console.log('success activated :' + decodeURIComponent(currentEntry.toString()));
//console.log(result)
                            currentEntry.setStatus(newXps.currentStatus);

                            currentCut.versions[currentCut.versions.length-1].description = nas.Pm.getIdentifier(newXps);
                            currentCut.versions[currentCut.versions.length-1].updated_at  = newXps.update_time;
//PUTのリザルトは200コードのみ
//PUT時点でアサイン可能リスト等をとったほうが良いか？
                            xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
			                xUI.setStored("current");//UI上の保存ステータスをセット
			                xUI.sync();//保存ステータスを同期
                            selectSCi();//カレントデータを再セレクトして情報更新
                            xUI.sync('historySelector');//履歴セレクタ更新
                
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
if(config.dbg) console.log("error");
if(config.dbg) console.log(result);
if(config.dbg) console.log('ステータス変更不可 :'+ nas.Pm.getIdentifier(newXps));
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
                    description: nas.Pm.getIdentifier(newXps)
                }
        };
if(config.dbg) console.log(data);
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('production');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(config.dbg) console.log("error");
if(config.dbg) console.log(result);
if(config.dbg) console.log('ステータス変更不可 :'+ nas.Pm.getIdentifier(newXps));
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
                    description : nas.Pm.getIdentifier(newXps),
                    content     : newXps.toString(),
			 		line_id     : newXps.line.toString(true),
			 		stage_id    : newXps.stage.toString(true),
			 		job_id      : newXps.job.toString(true),
			 		status      : newXps.currentStatus.toString(true)
                }
        };
if(config.dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
//console.log('network repository deactivated :'+decodeURIComponent(currentEntry.toString().split('//')[1]));
//console.log(result);
                currentEntry.setStatus(newXps.currentStatus);
//                currentCut.versions[currentCut.versions.length-1]=result.data.versions[currentCut.versions.length-1];
                currentCut.versions[currentCut.versions.length-1].description = nas.Pm.getIdentifier(newXps);
                currentCut.versions[currentCut.versions.length-1].updated_at= newXps.update_time;
                xUI.XPS.currentStatus=newXps.currentStatus;//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
//console.log("error");
//console.log(result);
//console.log('保留失敗 :'+ nas.Pm.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
//                delete newXps;
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
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 
            //リポジトリのステータスを変更する XPSの内容は変更不用
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        // ユーザ判定は不用（権利チェックは後ほど実装）
    if (newXps){
        newXps.job.increment(myJob);
        newXps.update_user = xUI.currentUser;
        newXps.currentStatus = new nas.Xps.JobStatus('Active');
if(config.dbg) console.log(newXps.toString());//
    //引数でステータスを変更したエントリを作成 新規に保存 JobIDは必ず繰り上げる
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 
    //成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットを送信してステータスを変更(ステータスのみの変更要求は意味が無い・内部データと不整合を起こすので却下)
    //descriptionのステータスを優先するならその方法も可能だが、バックアップタイミングを逃す？

        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString(true).split('//')[1]),
                    description: nas.Pm.getIdentifier(newXps),
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('production');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(config.dbg) console.log("error");
if(config.dbg) console.log(result);
if(config.dbg) console.log('ステータス変更不可 :'+ nas.Pm.getIdentifier(newXps));
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
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
            //Active > Fixed
if(true){
        var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
}else{
        var newXps = new Xps();
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
                    description : nas.Pm.getIdentifier(newXps),
                    content     : newXps.toString(),
 			 		line_id     : newXps.line.toString(),
			 		stage_id    : newXps.stage.toString(),
			 		job_id      : newXps.job.toString(),
			 		status      : newXps.currentStatus.toString(true)
               }
        };
if(config.dbg) console.log(data);
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
			    xUI.sync();//保存ステータスを同期
                selectSCi();//カレントデータを再セレクトして情報更新
                xUI.sync('historySelector');//履歴セレクタ更新

                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
//                if(serviceAgent.currentStatus=="online-single"){backToDocumentList('cut');} ;//コレだ！  ダメだ！！
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error :function(result) {
			// Error
if(config.dbg) console.log("error");
if(config.dbg) console.log(result);
if(config.dbg) console.log('終了更新失敗 :'+ nas.Pm.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
//                delete newXps;
		    },
		    beforeSend: this.service.setHeader
	    });
    }
if(config.dbg) console.log('終了更新失敗');
//        delete newXps ;
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
    var myStage = nas.pmdb.stages.getStage(stageName) ;//ステージDBと照合  エントリが無い場合はエントリ登録
    /*  2106-12 の実装では省略して  エラー終了
        2017-07 最小限の処理を実装  ステージの存在を確認して続行
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
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.parseXps(currentContents);

        // ユーザ判定は不用（権利チェックは後ほど実装 -- これらはノードマネージャに接続する形で実装される
    if (newXps){
        newXps.stage.increment(stageName);
        newXps.job.reset(jobName);
        newXps.update_user = xUI.currentUser;
        newXps.currentStatus = new nas.Xps.JobStatus('Startup');
if(config.dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
    //明示的なエントリ変更の要求が必要ならば処理
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: nas.Pm.getIdentifier(newXps),
                    content: newXps.toString()
                }
        };
if(config.dbg) console.log(data);
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
			    xUI.sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(config.dbg) console.log("error");
if(config.dbg) console.log(result);
if(config.dbg) console.log('ステータス変更不可 :'+ nas.Pm.getIdentifier(newXps));
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
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    
        //currentEntry.issues[0].cutID 
        // debug : change PATCH to PUT
if(config.dbg) console.log(currentEntry.issues[0].cutID);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'/discard',
		    success : function(result) {
		        currentEntry.issues.pop();
//                xUI.resetSheet(new Xps(5,144),new Xps(5,144)) ;
                xUI.resetSheet() ;
                documentDepot.updateDocumentSelector();
//                documentDepot.rebuildList();
                xUI.setStored("current");//UI上の保存ステータスをセット
			    xUI.sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(config.dbg) console.log("error");
if(config.dbg) console.log(result);
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });

}
//serviceAgent.currentRepository.destroyJob();
/**
サービスエージェントオブジェクト

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
    applicationIdf  :undefined
};
/**    サービスエージェントの初期化
 *ローカルファイルシステムサービスを追加 2020 11/04
 */
serviceAgent.init= function(){
//appllicationIdfを記録から取得　cookie > localStorage の順にチェックしヒットした値で設定　存在しない場合はuuidで設定
    this.applicationIdf = (config.ApplicationIdf)? config.ApplicationIdf : nas.uuid();
    this.servers=[]; //サーバコレクション初期化

    this.servers.push( localStorageStore );//ローカルストレージ用仮想サービスをセットアップ
    this.repositories = [localRepository] ;//ローカルリポジトリを0番として加える
    this.switchService(0)                 ;//カレントサーバをローカルストレージで設定

    if(appHost.Nodejs){
//ノード環境下ではローカルファイルシステムサービスを追加
        this.servers.push( localFilesystemService );//LFSセットアップ
//ファイルシステム上のリポジトリを記録から再生する
        var storedRepositories = Folder.current.fsName+'/nas/lib/etc/'
    }

//オンサイト|オフサイトで処理切り替え
    if(xUI.onSite){
console.log(xUI.onSite);
      if($("#backend_variables").attr("data-server_url")){
//ローカルテスト時はサービスURLを強制的に上書き
        var myUrl = $("#backend_variables").attr("data-server_url");
      }else{
//オンサイト時 ロケーションからサービスURL取得
        var loc = String(window.location).split('/');//
        var locOffset = (loc[loc.length-1]=="edit")? 3:2;
        var myUrl = loc.splice(0,loc.length-locOffset).join('/');
      }
      this.servers.push(new ServiceNode("CURRENT",myUrl));
    }else{
//オフサイト時 サーバーリストにテスト用のサイトを登録
//ローカルリポジトリ用仮想サービスを設置する
//localStorage:{name:'localStorageStore',url:'localStorage://info.nekomataya.remaping.dataStore.'},
      var myServers={
        devFront:{name:'devFront',url:'https://remaping.scivone-dev.com'},
        UAT     :{name:'U-AT'    ,url:'https://u-at.net'},
        Srage   :{name:'Stage'   ,url:'https://remaping-stg.u-at.net'}
      };
      for(var svs in myServers) this.servers.push(new ServiceNode(myServers[svs].name,myServers[svs].url));
    }
//サーバセレクタを設定
    var mylistContents="";
    mylistContents +='<option selected value="-1" > +no server selected+';
    for(var ids=0; ids < this.servers.length;ids ++){
        mylistContents +='<option value="'+ids+((ids==0)? '" selected >':'" >')+this.servers[ids].name; 
    }
    document.getElementById('serverSelector').innerHTML = mylistContents;
//組みあげたリポジトリでリポジトリリストを更新する ローカルリポジトリはすべての状況で利用可能
//    var myContents="";
//    myContents +='<option selected value=0> = local Repository =';
//    for(var idr=1; idr < this.repositories.length;idr ++){
//        myContents +='<option value="'+idr+'" >'+this.repositories[idr].name; 
//    }
//    document.getElementById('repositorySelector').innerHTML = myContents;
//リポジトリごとに初期化手続きを実行
    var opCount = [];
//ここでローカルリポジトリの初期化がある？
    for (var r = 0; r < this.repositories.length;r ++){
//console.log('init Repository :'+ r);
        opCount.push(this.repositories[r].init());
    }
//初期化終了に従ってリザルトを返す
    if(opCount.length == this.repositories.length){
        return this.switchService(opCount.length-1);
    }else{
        console.log('リポジトリ初期化失敗');
        return false;
    }
}
/**
 *  
 *  @params {String} form
 *      export form Object|JSON
 *
 * サービスの状態を保存用テキストで返す
 * servers
 * 取得ステータスをJSONに絞るdump|textは使用しない
 *
 */
serviceAgent.getStatus = function(form){
    var result = {
        "servers":[],
        "repositories":[],
        "currentStatus":this.currentStatus,
        "currentServer":this.currentServer.url,
        "currentRepository":(this.currentRepository)?this.currentRepository.toString():null
    };
    for(var s = 0;s < this.servers.length ; s ++){
        result.servers.push(this.servers[s].getStatus('Object'));
    }
    for(var r = 0;r < this.repositories.length ; r ++){
        result.repositories.push(this.repositories[r].getStatus('Object'));
    }
    if(form == 'Object'){
        return result;
    }else{
        return JSON.stringify(result,null,2)
    }
}
/**
 *  
 *  @params {Object|String} status
 *      import statua of Object|JSON
 *
 * 読みだしたサービスの状態を適用
 * 取得ステータスをJSONに絞るdump|textは使用しない
 *
 */
serviceAgent.setStatus = function(status){
    if(typeof status =='string') status = JSON.parse(status);

/*
    status:{
        "servers":[],
        "repositories":[],
        "currentStatus":this.currentStatus,
        "currentServer":this.currentServer.url,
        "currentRepository":this.currentRepository.toString()
    };
    サービス適用手順
入力のサービスをurlで特定して、情報を更新
未知のサーバーは新規に登録する > 登録メソッドを使用
　リポジトリ適用手順
リポジトリをIDで特定して情報を照合更新する
未知のリポジトリを登録する > 登録メソッドを使用
リポジトリの所属するサービスが存在しない場合は、新規に登録

2020.11時点では、全仕様を処理しない
ローカルファイルシステムのルートパスのみを書き換え

*/
//サーバリスト内のローカルファイルシステムのルートを取得
    for(var s = 0;s < status.servers.length ; s ++){
        if(status.servers[s].type != 'localfilesystem') continue;
        if(localFilesystemService.url != status.servers[s].url) localFilesystemService.url = status.servers[s].url;
/*
        var matchService = this.servers.find(function(elm){return (elm.url == status.servers[s].url)});
        if(matchService){
            console.log (matchService);
        }else{
            
        }
        this.servers[s].setStatus(status.servers[s]);
// */
    }
//リポジトリ一覧を追加（入れ替え？）
    for(var r = 0;r < status.repositories.length ; r ++){
        if(status.repositories[r].service.indexOf("localfilesystem") < 0) continue;
        if(this.repositories.find(function(elm){return (elm.id == status.repositories[r].id)})){
//同idのリポジトリが存在するので処理スキップ
console.log('exist : '+status.repositories[r].name );
            ;
        }else{
//無い→パスを確認して存在すれば登録
            var newOne =  new nas.
            this.repositories.add(new status.repositories[r]);
        }
    }
    this.currentStatus = status.currentStatus;
    this.currentRepository = this.repositories.find(function(elm){return (status.currentRepository.indexOf(elm.url) >= 0)});
}
/**
 *  サービスエージェントにサービスを登録する
 *  String url | JSON | Object
 *  @params {String|Object}    serviceprop
 *     Object ServiceNodeProps サービスノード本体でも良いが、条件によってはオブジェクトの複製が登録されるので注意が必要
 *  @returns {Object}   ServiceNode
 *      登録に失敗したときは null
 *      既存のサービスとurlが一致している場合は他のプロパティを更新する
 */
serviceAgent.addSrevice = function(serviceprop){
//登録済みなので登録の必要がない
    if(
        (serviceprop instanceof ServiceNode)&&
        (this.servers.indexOf(serviceprop) >= 0)
    ) return serviceprop;
    if(typeof serviceprop == 'string'){
        if(serviceprop.trim().match(/^\{.*\}$/)){
            seviceprop = JSON.parse(serviceprop)
        }else{
            serviceprop = new ServiceNode()
        }
    }
        var matchService = this.servers.find(function(elm){return (elm.url == serviceprop.url)});
    if(matchService){
//url一致のサービスが存在
//タイプが異なる場合はリジェクト
            if(matchService.type != service.type) return null;
        }else{
            
        }
}
/**
 *  サービスエージェントにリポジトリを登録する
 *  String url | JSON | Object
 *  @params {String|Object}    serviceprop
 *     Object ServiceNodeProps リポジトリオブジェクト本体でも良いが、条件によってはオブジェクトの複製が登録されるので注意が必要
 *  @returns {Object}   ServiceNode
 *      登録に失敗したときは null
 *      既存のサービスとurlが一致している場合は他のプロパティを更新する
 */
serviceAgent.addRepository = function(repositoryprop){
//登録済みなので登録の必要がない
    if((this.repositories.indexOf(repositoryprop) >= 0)) return repositoryprop;
    if(typeof serviceprop == 'string'){
        if(serviceprop.trim().match(/^\{.*\}$/)){
            seviceprop = JSON.parse(serviceprop)
        }else{
            serviceprop = new ServiceNode()
        }
    }
        var matchService = this.servers.find(function(elm){return (elm.url == serviceprop.url)});
    if(matchService){
//url一致のサービスが存在
//タイプが異なる場合はリジェクト
            if(matchService.type != service.type) return null;
        }else{
            
        }
    

}

 /**
 *    ユーザ認証
 *  カレントサービスを認証又は解除する
 *
 *  カレントサービスが"0:=no selected="の場合は,
 *  単純にすべてのサービスからログアウトする
 *
 */
serviceAgent.authorize=function(callback){
if(config.dbg) console.log("authorize!::");
    switch (this.currentStatus){
    case 'online-single':
        return false;
    break;
    case 'online':
        if(xUI.onSite){return 'online'};
            this.authorized(false);
        return 'offline';
    break;
    case 'offline':
    default:
        if(this.currentServer) this.currentServer.authorize();
        (function(){
            //リポジトリを順次取得（バックグラウンド処理）
            console.log('リポジトリを順次取得（バックグラウンド処理）');
//            this.getRepositories();
        })()
        if(callback instanceof Function) callback();
        return 'online';
    }
}
/**
 *    認証|解除時の画面処理
 *  @params {String}   status
 */
serviceAgent.authorized=function(status){
    if (status == 'success'){
        this.currentStatus = 'online';
//二回目以降のUI初期化時は ローカルリポジトリにフォーカスが移ってカレントサーバがないケースがあるので注意
          if(serviceAgent.currentServer){
            document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url.split('/').slice(0,3).join('/');//?
            document.getElementById('loginuser').innerHTML = document.getElementById('current_user_id').value;
            document.getElementById('currentrepository').innerHTML = serviceAgent.currentRepository.name;
//            document.getElementById('loginstatus_button').innerHTML = "=ONLINE=";
         $('#loginstatus_button').removeClass('round-button-offline');
         $('#loginstatus_button').removeClass('round-button-online-bind');
         $('#loginstatus_button').addClass('round-button-online');
            document.getElementById('login_button').innerHTML = "SIGNOUT";
            document.getElementById('serverSelector').disabled  = true;
          };//二度目以降の表示更新はサーバの切り替えが無い限り特に不用
    }else{
        this.currentStatus = 'offline';
            document.getElementById('serverurl').innerHTML = localize(nas.uiMsg.noSigninService);//?
            document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;
            document.getElementById('currentrepository').innerHTML = serviceAgent.currentRepository.name;
//            document.getElementById('loginstatus_button').innerHTML = "=OFFLINE=";
         $('#loginstatus_button').removeClass('round-button-online');
         $('#loginstatus_button').removeClass('round-button-online-bind');
         $('#loginstatus_button').addClass('round-button-offline');
            document.getElementById('login_button').innerHTML = "SIGNIN";
            document.getElementById('serverSelector').disabled  = false;

        serviceAgent.switchRepository(0);//ローカルレポジトリ設定
        serviceAgent.switchService();
console.log('re init serviceAgent');
        serviceAgent.init();
    }
}
/**
 *  現在のリポジトリコレクションにもとづいてリポジトリセレクタの内容を更新
 documentDepotのメソッドに移動して削除予定 2020.06.13
 */
serviceAgent.__updateSelector=function(){

    var selectorDisabled = true;
    var myContents= '<option selected value=0> = local Repository =</option>' ;
    if(serviceAgent.repositories.length > 1){
        for(var idr=1; idr < serviceAgent.repositories.length;idr ++){
            myContents +='<option value="'+idr+'" >'+serviceAgent.repositories[idr].name+'</option>'; 
        };
        selectorDisabled = false;
    }
        document.getElementById('repositorySelector').innerHTML = myContents;
        document.getElementById('repositorySelector').disabled  = selectorDisabled;
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
//引数とカレントのサービスが一致  切替不能（不用）
    if (myServer === this.currentServer) return myServer;
    if ((myServer instanceof ServiceNode )&&(myServer !== this.currentServer)){
//引数がノードオブジェクト
        newServer = myServer;
    }else if((myServer >= 0)&&(myServer<this.servers.length)){
//引数がサーバID
console.log('======set server ID:'+myServer);
        newServer = this.servers[myServer];
    }else if(myServer instanceof String){
//引数が文字列
        for (var ix = 0 ;ix < this.servers.length ; ix ++){
            if((myServer == this.servers[ix].url)||(myServer == this.servers[ix].name)){
                newServer = this.servers[ix];break;
            }
        }
        if(! newServer) return this.currentServer;
    }
//オンラインであった場合は切替前にオフライン化して エントリリスト  クリア  ドキュメントセレクタ  リセット
    this.currentServer = newServer;
    this.switchRepository(0);
console.log(serviceAgent.currentServer);
    if(xUI.sync) xUI.sync();
    return this.currentServer;
};
/**
    リポジトリを切り替える
    UIから直接呼び出されるのはこちら
    カレントのリポジトリを切り替え、
    リポジトリに関連付けられたサービスをカレントにする
    サービスが現在のログイン先と異なる場合も認証は実際のアクセスまで保留
    データベース（nas.pmdb）の切り替えも認証時に行う
    （解除前にもとのサービスに戻った際に再ログインを行わないため）
    引数は、現在のリポジトリID
    リポジトリIDは以下のように決定
    
    0:ローカルリポジトリ固定
    1~ 以降登録順  現在同時に処理できるサーバは１つ サーバ内のリポジトリは複数
    
     リポジトリ切替時にドキュメントリストの更新をバックグラウンドで行う
     @params {Number | Object Repository} targetRepository
        id または Repository オブジェクト
     @params {Function}     callback
        コールバック関数があれば共有オブジェクトを引数にしてコールバックを実行する
     @returns {Object Repository}
        共有オブジェクトを返す
*/
serviceAgent.switchRepository=function(targetRepository,callback){
//リポジトリオブジェクトであった場合IDに変換
    if(
        (targetRepository instanceof NetworkRepository)||
        (targetRepository instanceof FileRepository)
    ){
        var idx = serviceAgent.repositories.indexOf(targetRepository);
        if(idx < 0){
            return this.currentRepository;
        }else{
            targetRepository = idx;
        }
    }else if(targetRepository === localRepository){
        targetRepository = 0;
    }
    if(this.currentRepository !== this.repositories[targetRepository]){
        if(typeof targetRepository == 'undefined')  targetRepository = 0;
//切り替え前に現在のデータの状態を確認して必要ならば編集状態を解除  その後自身を再度呼び出し
        if((xUI.uiMode=='production')&&(xUI.XPS.currentStatus.content=='Active')){
            if(xUI.edchg) xUI.sheetPut(document.getElementById('iNputbOx').value);
                this.currentRepository.deactivateEntry(function(){
                serviceAgent.switchRepository(targetRepository,callback);
            });
            return;
        }else{
            this.currentRepository = this.repositories[targetRepository];
            if((targetRepository > 0)&&(targetRepository < this.repositories.length)){
                this.switchService(this.currentRepository.service);
            } else {
//            serviceAgent.currentServer     = null;
//console.log('reset');console.log(serviceAgent.currentServer);
            //serviceAgent.switchService();
            };
            if(! this.currentRepository) this.switchRepository(0,callback);//切替失敗ロールバック
        }
        if(
            (document.getElementById('repositorySelector').value != targetRepository)
        ){
            documentDepot.updateRepositorySelector();
        }
// 変更が発生した場合のみリフレッシュ
console.log("========================change repository :"+ targetRepository);
//OPUSセレクタを停止
    if(document.getElementById( "opusSelect" )) document.getElementById( "opusSelect" ).disabled=true;
//ドキュメントセレクタを停止
    if(document.getElementById( "cutList" )) document.getElementById( "cutList" ).disabled=true;
//タイトルセレクタを停止
    if(document.getElementById( "workTitleSelector" )) document.getElementById( "workTitleSelector" ).disabled=true;
//ドキュメントセレクタを停止
    if(document.getElementById( "episodeSelector" )) document.getElementById( "episodeSelector" ).disabled=true;

//pmdbを切り替える
        nas.pmdb = this.currentRepository.pmdb;
/*==                ドキュメントリスト更新                  ==*/
console.log("========================reset selectors :");
        documentDepot.currentProduct=null;
        documentDepot.currentSelection=null;
console.log(documentDepot.updateTitleSelector());
console.log(documentDepot.updateOpusSelector());
console.log(documentDepot.updateDocumentSelector());
    }
    if(callback instanceof Function){
//切り替え後のリポジトリを引数にしてコールバックを実行
        callback(serviceAgent.currentRepository);
    }
    if(xUI.sync) xUI.sync('server-info');
    return this.currentRepository;
};
/**
 *  引数でサービスノードを受け取りpmdbの内容をチェックしてリポジトリ（TEAM）一覧を更新する
 *  サーバのメソッドでなく　サービスエージェントのメソッドに変更？
 *   @params {Object} svnd
 *      サービスノードまたはそれに準ずるpmdb.organizationsを持ったオブジェクト
 *   @params {String} repositoryToken
 *      トークン指定された場合は、トークン以外のリポジトリをスキップする
 *   @params {Function} callback
 *      終了コールバック関数
 */
serviceAgent.setRepositories = function(svnd,callback){
//引数のサービスノードをチェックして svnd.pmdb.opganizations に存在しないエントリを削除
//ローカルリポジトリはスキップ(サーバ側に存在しない&&削除しない固定リポジトリ)
    for(var r = (serviceAgent.repositories.length - 1);r > 0 ; r --){
        if(! (svnd.pmdb.organizations.entry(serviceAgent.repositories[r].token))){
//存在しないので削除
            serviceAgent.repositories.splice(r,1);
        };
    }
//bind状態(svnd.bindTarget)を考慮　
//pmdb.organizationsのデータを順次チェック　リポジトリ内にないデータの場合新規リポジトリオブジェクトを初期化
    for(var tgt in svnd.pmdb.organizations.members){
        var targetOrganization = svnd.pmdb.organizations.members[tgt];
        if((svnd.bindTarget)&&(targetOrganization.token != svnd.bindTarget.repository)) continue;
        var currentRepositoryId = serviceAgent.repositories.findIndex(
                function(elm){return (elm.token == targetOrganization.id)}
        )
        if(currentRepositoryId < 0){
//存在しない・新規登録
            var newRepository = new NetworkRepository(
                targetOrganization.name,
                serviceAgent.currentServer,
                serviceAgent.currentServer.url,
                targetOrganization.id
            )
            newRepository.owner = new nas.UserInfo(
                targetOrganization.contact,
                {'token':targetOrganization.contact_token}
            );
            serviceAgent.repositories.push(newRepository);
console.log('init repository : '+ newRepository.name);

            if(svnd.bindTarget){
                newRepository.init(callback);//新規登録時初期化
            }else{
                newRepository.init();//新規登録時初期化
            }
        }else{
//既存・タイムタンプ比較・データ比較　更新
            var currentRepository= serviceAgent.repositories[currentRepositoryId];
            if(targetOrganization.name != currentRepository.name)
                currentRepository.name = targetOrganization.name;
            if( ! currentRepository.owner.sameAs(targetOrganization.contact))
                currentRepository.owner = new nas.UserInfo(
                    targetOrganization.contact,
                    {'token':targetOrganization.contact_token}
                );
            if(targetOrganization.pmdb.timestamp > currentRepository.pmdb.timestamp){
console.log('update repository pmdb : '+ currentRepository.name);
                currentRepository.updatePMDB();
            }
        };
    }
    if((callback instanceof Function)&&(! svnd.bindTarget)) callback();
};//setRepositories

/**
 *    repository-token|title-token|episode-token が含まれるRepositoryのIDを返す
 *  ローカルリポジトリを無視しているが、これでよいか？
 */
serviceAgent.getRepsitoryIdByToken=function(myToken){
    for (var rix=0;rix<this.repositories.length;rix++){
        if(myToken==this.repositories[rix].token) return rix;
//リポジトリトークンにヒット
//リポジトリ内のプロダクトデータを検索（エントリ総当りはしない）
        if (this.repositories[rix].pmdb.workTitles.entry(myTitle)) return rix;
//タイトルトークンでヒット
        if (this.repositories[rix].pmdb.products.entry(myTitle)) return rix;
//エピソードトークンでヒット
    };
    return -1;
};
/**
    引数を判定して動作を決定 カレントリポジトリの操作を呼び出す
    @params {String} identifier
        データ識別子 完全状態で指定されなかった場合は、検索で補う
    @params {boolean}　isReference
        リファレンスとして呼び込むか否かのフラグ 指定がなければ自動判定
    @params {Function} callback
        取得成功時のコールバック関数
    @params {Function} callback2
        失敗時のコールバック関数

    X コールバックの指定がない場合は指定データをアプリケーションに読み込む X
    コールバックの指定がない場合はリザルトは読み出しバッファに設定される
    コールバック関数以降の引数はコールバックに渡される
    リファレンス取得の際にアプリケーションステータスをリセットする場合があるので注意
    
    ネットワークリポジトリからエントリを取得の際コンテンツが空のケースがある。
    これはエントリ登録直後のデータで、アプリケーション上でタイトル/エピソードに従ったデータを作成する必要があるので注意
    （現在はこの可能性がほぼ消失 2019.06.04）
    リポジトリ共通の機能としてタイトル/エピソードからデフォルトプロパティの取得を行い、その後、各リポジトリごとに記述子による指定データのパースを行って新規データのビルドを行う。
    
    xmap請求時のみエントリの兼用カット全てで照合を行う
*/
serviceAgent.getEntry=function(identifier,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
//識別子をパース
    var targetInfo = nas.Pm.parseIdentifier(identifier);
    var myIssue = false;
    var refIssue = false;
    var myEntry = serviceAgent.currentRepository.entry(identifier);//SBショットオプション
    if(! myEntry){
console.log("no SBShot entry : "+ decodeURIComponent(identifier));//該当ショットが無い
        return false;
    } else{
console.log(myEntry);
//myEntryはSBShot.nodeChartNode|SBShot|SBxMap|pmdb|stbdが戻る可能性あり
console.log('toss currentRepository');
var targetIdf = identifier;
        if(
            ( myEntry instanceof nas.StoryBoard.SBShot )||
            ( myEntry instanceof nas.StoryBoard.SBxMap )
        ){
console.log(myEntry.getIdentifier());
            targetIdf = myEntry.getIdentifier();
        } else if (
            ( myEntry instanceof nas.StoryBoard )||
            ( myEntry instanceof nas.Pm.PmDomain )
        ){
console.log(nas.Pm.getIdentifier(myEntry));
            targetIdf = nas.Pm.getIdentifier(myEntry);
        }else{
//
console.log(myEntry.token);
            
        }
        this.currentRepository.getEntry(targetIdf,isReference,callback,callback2);
    };
};
/**
 *  Idf指定されたxMapを取得する
 *  到達範囲で既存のデータが得られない場合は、Xpsから得られる情報を合成してできたxMapをコールバック関数で処理する
 *  コールバックが指定されない場合アプリケーションに設定する
 */
serviceAgent.getxMap = function(targetIdf,callback,callback2){
	var target = this.currentRepository.entry(targetIdf,'shot');//SBShot|SBxMapが戻る
	if(target){
console.log(target);
		if(target.xmap.token){
//リポジトリ内にxMapの登録がある
			this.currentRepository.getEntry(targetIdf,callback,callback2);
		} else {
//リポジトリ内にxMapの登録が無い
			this.currentRepository.getxMap(targetIdf,callback,callback2);
		}
		return true;
	}
	if (callback2 instanceof Function){
	    callback2();
	}else{
	    return false;
	}
}
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
if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
//console.log(currentEntry);
    var currentStatus=currentEntry.getStatus();
    switch (currentStatus.content){
        case 'Aborted': case 'Startup': case 'Hold': case 'Fixed':
            //NOP
//            if(config.dbg) console.log('fail deactivate so :'+ currentEntry.getStatus());
            alert(localize(nas.uiMsg.dmAlertCantDeactivate));//アクティブでない
            return false;
            break;
        case 'Active':
            //編集を確認して Active > Holdへ
            if(xUI.edchg) xUI.sheetPut(document.getElementById('iNputbOx').value);
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
/*リストの更新では、ムダに待ち時間が長いので「エントリ情報の更新」に変更したい 後ほど処理  今は保留  ０４２２*/
//    this.currentRepository.getList(true);
//console.log(Xps.getIdentifier(xUI.XPS))
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//console.log(currentEntry);
    var currentCut   = this.currentRepository.cut(currentEntry.issues[0].cutID);
//console.log(currentCut)
    if(! currentEntry){
        alert(localize(nas.uiMsg.dmAlertNoEntry));//対応エントリが無い
//        if(config.dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
    var currentStatus=currentEntry.getStatus();
    switch (currentStatus.content){
        case 'Aborted': case 'Active': case 'Hold':
            alert(localize(nas.uiMsg.dmAlertCheckinFail)+"\n>"+currentEntry.getStatus(myJob,callback,callback2));
            //NOP return
if(config.dbg) console.log('fail checkin so :'+ currentEntry.getStatus(myJob,callback,callback2));
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
                msg2   += '</datalist>';
            nas.showModalDialog('confirm',[msg,msg2],title,false,function(){
                var newJobName=document.getElementById('newJobName').value;
                if((this.status == 0)&&(newJobName)){
                    serviceAgent.currentRepository.checkinEntry(newJobName,function(){
                        //成功時は現在のデータをリファレンスへ複製しておく
                        //putReference();  このタイミングで行うと  ステータス変更後のデータがリファレンスへ入るので  ダメ  各メソッド側に実装
//                        xUI.sync('productStatus');//ここで  ステータスの更新を行う
//                        xUI.sync('historySelector');//ここで  履歴セレクタの更新を行う
                        if(callback instanceof Function) callback();
                    },
                    function(){
                        alert(localize(nas.uiMsg.dmAlertCheckinFail));//チェックイン失敗
//                        xUI.sync('productStatus');//ここで  ステータスの更新を行う
//                        xUI.sync('historySelector');//ここで  履歴セレクタの更新を行う
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
//            if(config.dbg) console.log('fail checkout so :'+ currentEntry.getStatus());
            alert(localize(nas.uiMsg.dmAlertCantCheckout));//作業データでない
            return false;
        break;
        case 'Active':
            //編集状態を確認の上  Active > Fixed
            if(xUI.edchg) xUI.sheetPut(document.getElementById('iNputbOx').value);
            //Jobチェックアウト
            //アサイン情報を請求
            //このあたりはアサイン関連のDB構成が済むまで保留  要調製
            var title   = localize(nas.uiMsg.pMcheckout);//'作業終了 / チェックアウト';
//            var msg     = localize(nas.uiMsg.dmPMnewAssign,xUI.XPS.cut);
var msg = localize({
  en:"",
  ja:"%1\n作業終了します"  
},decodeURIComponent(Xps.getIdentifier(xUI.XPS)))

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
                    serviceAgent.currentRepository.checkoutEntry(assignData,callback,callback2);
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
     尺（識別子情報）のみ指定可能  最小テンプレートでカット番号のある空エントリのみが処理対象
     
     現在のTitle+Opus(product)の既存カットに対する衝突は排除
     
     初期状態の、ライン／ステージ／ジョブの指定が可能
     引数で与えられるXpsのステータスは、"Floating"である必要がある
     旧形式のXpsを登録する手続き　新規にxMapをエントリする場合は
*/
serviceAgent.addEntry=function(myXps,callback,callback2){
    if(!myXps){
//console.log(documentDepot);
         if(xUI.uiMode!='management')   return false;         
        var myIdentifier = documentDepot.buildIdentifier();
//console.log(decodeURIComponent(myIdentifier));
        var entryInfo = nas.Pm.parseIdentifier(myIdentifier);
                myXps = new Xps(5,entryInfo.time);
                myXps.title      = entryInfo.title;
                myXps.opus       = entryInfo.opus;
                myXps.subtitle   = entryInfo.subtitle;
                myXps.cut        = entryInfo.cut;
                myXps.createUser = xUI.currentUser;
                myXps.updateUser = xUI.currentUser;
                myXps.currentStatus =  new nas.Xps.JobStatus();
        var productIdf = nas.Pm.getIdentifier(myXps,'product');
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
        var myIdentifier = nas.Pm.getIdentifier(myXps);
//既存カットと一致(排除)
        if(this.currentRepository.entry(myIdentifier)){
            alert(localize(nas.uiMsg.alertCutConflict));
            return false;
        }

//既存プロダクトあり（プロダクト作成処理不用）
        if(this.currentRepository.entry(myIdentifier,true)){
            serviceAgent.putEntry(myXps,callback,callback2);
        }else{
//既存のタイトルがあるか？あればエピソードのみ新作
//なければタイトルを作成後にエピソードを新作して処理続行
// confirmあり
              var hasTitle = false;
              var hasOpus  = false;
              for (var pid=0;pid<documentDepot.products.length;pid ++){
                 //productsのメンバをオブジェクト化したほうが良いかも
                 var prdInfo=nas.Pm.parseProduct(documentDepot.products[pid]);
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
                     serviceAgent.putEntry(myXps,callback,callback2);
                 });
               }else if((! hasTitle)&&(! hasOpus)){
                 var msg=localize({
                     en:"The specified production %1#%2[%3] is not registered in this sharing.\nwould you like to create a new production %1#%2[%3]?\nTo change sharing please cancel once and try the procedure again.",
                     ja:"この共有には指定された作品 %1#%2[%3] が登録されていません。\n新規に %1#%2[%3] を登録しますか？\n\n共有を変更する場合は一旦キャンセルして手続をやり直してください。"},myXps.title,myXps.opus,myXps.subtitle);
                 if(confirm(msg))
                 serviceAgent.currentRepository.addTitle(myXps.title,"","",function(){
                     serviceAgent.currentRepository.addOpus(myIdentifier,myIdentifier,function(){
                         serviceAgent.putEntry(myXps,callback,callback2);
                     });
                 });
              }else{
                 serviceAgent.putEntry(myXps,callback,callback2);
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
                msg2  = msg2.replace(/%currentStage%/,xUI.XPS.stage.toString(true));
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
                    //if(config.dbg) console.log([newStageName,newJobName]);
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
    //  ドキュメントがアクティブで変更フラグが立っている場合 holdしてカレントリポジトリにプッシュ
     if((xUI.XPS.currentStatus.content=="Active")&&(! xUI.isStored())){
    //  成功したらカレントドキュメントをクリアしてロック
         serviceAgent.currentRepository.deactivateEntry(function(){
            serviceAgent.closeEntry(callback,callback2);
        },function(){
            xUI.errorCode=9;
            if(callback2 instanceof Function) callback2();
        }
        );
    }else{
        xUI.resetSheet(
            new nas.Xps(xUI.sheetLooks.trackSpec),
            new nas.Xps(xUI.sheetLooks.trackSpec)
        );
        xUI.XPS.currentStatus = new nas.Xps.JobStatus("Floating");
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
*/
serviceAgent.floatEntry=function(callback,callback2){
    //  ドキュメントがアクティブで変更フラグが立っている場合  holdしてカレントリポジトリにプッシュ
     if((xUI.XPS.currentStatus.content=="Active")&&(! xUI.isStored())){
    //  成功したらカレントドキュメントをクリアしてロック
         serviceAgent.currentRepository.deactivateEntry(function(){
            serviceAgent.floatEntry();
        },function(){
            xUI.errorCode=9;
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
    ハードデリートを伴うため  バックアップコピーを作成して保険として使うべき
     
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
                xUI.setUImode("browsing");xUI.sync("productStatus");                
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
//    if(config.dbg) console.log(newJobList);
}
//Test code
/**
    サービスエージェントを経由してリポジトリにデータを送出する
    ドキュメント引数が未定義の場合は失敗
    タイトル,エピソード名,カット番号がが\(.*\)|\*+にマッチする場合はリジェクト
    
    データ種別(xpst|xmap)を判定して
    保存データが最新のissueでない場合はリジェクト？
    この場合はデータの更新があるかないかは問わない
    ステータスがFloatingの場合は、複製をとってStartup状態でプッシュする

*/
serviceAgent.putEntry=function(myDocument,callback,callback2){
console.log('serviceAgent.putEntry :'+ myDocument.getIdentifier());
    if (typeof myDocument == 'undefined') return false;
    var idfInfo = nas.Pm.checkIdentifier(myDocument.getIdentifier());
    if (! idfInfo ) return false;
    if((xUI.XPS === myDocument)&&(xUI.sessionRetrace > 0)){
        xUI.errorCode=8;//確定済データを更新することはできません
        alert(localize(xUI.errorMsg[xUI.errorCode]));
        return false;
    }
    if(idfInfo.sci[0].name.match(/^(s-)?c$|^$/)){
        alert(localize(nas.uiMsg.alertCutIllegal));
        return false;
    }
/*    if (!( myDocument instanceof Xps)){
        if(callback2 instanceof Function){callback2();}
        return false;
    };// */
    if(myDocument instanceof Xps){
        var newDocument = new Xps();
        newDocument.parseXps(myDocument.toString());
    }else if(myDocument instanceof xMap){
        var newDocument = new xMap(nas.Pm.getIdentifier(myDocument));
        newDocument.parsexMap(myDocument.toString());
    }
    if(myDocument.currentStatus.content.indexOf('Floating')>=0){
/*プッシュ条件
タイトルが存在する、エピソードが存在する
カット番号がある
ユーザ情報が存在する
ここでユーザアサインメントを付加することが可能ーーー未実装  201802
*/
        var msg=localize({
        en:"Add the current cut: %1 :\nto the share : %2 :.\n Is it OK?",
        ja:"現在のカット: %1 :を\n共有: %2 :に追加します。\nよろしいですか？"
    },myDocument.getIdentifier(),serviceAgent.currentRepository.name)
        // "TEST push Entry :"+myDocument.getIdentifier();
        var go=confirm(msg);
        if(go){
/*  データステータスをチェック
    カレントタイトルがない場合は新作
    カレントのopusが無い場合は新作
    いずれも  コールバック処理渡し
    データステータスがFloatingなので、Startupへ変更
*/
            if((newDocument instanceof Xps)&&(newDocument.currentStatus.content == 'floating')){
                newDocument.currentStatus.content = 'Startup';
            }else if((newDocument instanceof xMap)&&(newDocument.currentNode.currentStatus.content == 'floating')){
                newDocument.currentNode.currentStatus.content = 'Startup';
            }
        }else{
            return false;//処理中断
        }
    }
// console.log(newDocument);
    this.currentRepository.putEntry(newDocument,callback,callback2);
}
/**

Repos.getProducts();//一度初期化する
if(config.dbg) console.log(Repos.productsData);
Repos.getList();

*/
/**
 *	ソース文字列上のdataNodeエントリを置換して戻す関数
 *	@params	{String}	sourceData
 *		置換対象データ
 *	@params	{String}	dataString
 *		置換文字列
 *	@params	{String}	prop
 */
serviceAgent.overwriteProperty = function(sourceData,dataString,prop){
	if((!sourceData)||(! dataString)) return false;
	if(sourceData.match){
console.log('detectString');
		if(! prop) prop = 'REPOSITORY';
		var searchRegex = new RegExp('\\n##'+prop+'=.*\\n');
		if(sourceData.match(searchRegex)){
			return sourceData.replace(searchRegex,"\n##"+prop+'='+dataString+'\n');
		}else{
			return sourceData.replace(/(^nas.*\n)/,"$1##"+prop+'='+dataString+'\n');
		}
	}else{
		sourceData[prop] = dataString;
		return sourceData;
	}
}
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
     これを引数にしてputEntryを順次コールする。
     
*/
    serviceAgent.entryQueue = [];
    serviceAgent.entryQueue.select = 0;

function makeNewEntriesFromFormatedText(ix){
    if(typeof ix == 'undefined'){
        var sourceText=document.getElementById('data_well').value;
        serviceAgent.entryQueue = parseCutText(sourceText);
        for (var qid=0;qid<serviceAgent.entryQueue.length;qid++){
            var cutNo   = serviceAgent.entryQueue[qid][0];
            var cutTime = serviceAgent.entryQueue[qid][1];//整数化が済んでいるものとする
            if((String(cutNo).length > 0)&&(cutTime > 0)){
                // ビルドの際にXPSを参照するのはあまり良くない これは引数で与えるか、またはdocumentDepotのプロパティから取得する
                var myXps = new Xps(5,cutTime);
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
        //カット番号が空・カット尺が0  の場合は処理スキップ
        
//console.log("queue entry : "+ix);

        if(serviceAgent.entryQueue[ix]){
//console.log(serviceAgent.entryQueue[ix]);
//console.log(decodeURIComponent(Xps.getIdentifier(serviceAgent.entryQueue[ix])));
            serviceAgent.currentRepository.putEntry(serviceAgent.entryQueue[ix],function(){
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
    sci         : 代表カット番号  -encoded,
    issues      : [[
        ライン情報  -encoded,
        ステージ情報-encoded,
        ジョブ情報  -encoded,
        ステータス  -encoded
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
または切替時にエントリを強制クローズ  ＜  これで対処

リポジトリ切り替えのタイミングで強制的にアクティブなドキュメントをディアクティベートすることで処理

切り替えのタイミングでセレクタが使えなくなる（表示データの信頼性が無くなる）タイミングでセレクタを不活性化

データ更新が終了した時点で再活性化するように変更（済）

ネットワーク上でのDB更新にまだ問題あり  dev に適用して調整

*/
