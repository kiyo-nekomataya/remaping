/**
 * @fileoverview
 * <pre>
 * UATシステム利用する各管理情報の基礎データテーブル
 * このファイル自身はスタンドアロン動作用のデフォルトのデータ群となる
 * 制作管理DB（共有）は、このファイルと同等の内容を保持する
 * リポジトリに接続の際は、DBとの通信が正常に初期化された後、受信したデータで上書きが行なわれる
 * 通信が確立できなかった場合には本データで処理を継続する
 *
 * 本来これらのデータは、組織（リポジトリ）/タイトル/エピソード のデータ階層ごとにデータリジョンごとに配置され、必要に従って編集、更新が可能なように調整される
 * アプリケーション内部では.pmdb プロパティとして管理される
 * 
 * データリジョン
 *   データは一定の単位で区分けされる。各区をリジョンと呼ぶ
 * 以下のリジョンが規定される
 *
 * [configration]	アプリケーション動作設定情報テーブル(config.js 内の階層化の必要なデータを格納)
 * [organizations]	組織情報テーブル
 * [users]			データにリーチする事のできるユーザ一覧
 * [staff]			スタッフ(ユーザロール)一覧
 * [workTitles]		管理下のタイトル一覧
 * [products] 		管理下のProductOpus（エピソード）一覧
 * [assets]			管理対象アセットテーブル
 * [medeias]		制作に供するメディアテーブル
 * [stages]			制作工程テーブル
 * [lines]			制作ラインテーブル
 * [pmTemplates]	ラインごとの標準的な工程テンプレート
 * [jobNames]		管理に使用するジョブ名テーブル
 *
 *    リジョンごとの記述は、後置優先で後からデータを読み込む際に先のデータを消去して上書きされる
 *    ノード間の継承が必用な場合は、ノード内に設定を置かない（読み込みがない）か、
 *    または、必用な情報を上位ノードから引き写した設定データを配置して対応すること。
 *    これはノードデータの独立性を高めるためにあえて自動継承を行わない仕様としてある。要注意
 *      各リジョンごとに最終更新のtimestamp値を設定する　値はUnix time(1970.1.1 0:0:0 からのミリ秒値)
 *
 *
 * 各オブジェクトの設定書式（通信書式）は、パーサを共通化するためのルールに従う
 * 各オブジェクトは、データパーサとして.parseConfig　メソッドをもち、テーブルデータを一括で入れ替えるとこができる。
 * パーサは、JSON,plain-text,full-dump の各形式に対応する
 * 使用例はこのファイルを参照
 *
 *
 *     上記の各テーブルを一つにまとめるオブジェクトが nas.Pm.PmDomain オブジェクトとなる
 *     このオブジェクトは、通常はリポジトリの配下に {リポジトリ}.pmdb　として配置される。
 *     アクティブなDBは nas.pmdb　にマッピングされる。こちらをアクセスすることも可能
 *     .pmdb.parseConfig　メソッドが以下の形式で、複合状態の設定データを受け取り　配下のテーブルの内容を上書き更新する
 *     
 *     {
 *         "dataInformation":{
 *             "version":"nasPMDB-FILE 1.0.0",
 *             "uuid":false,
 *             "dataNode":".",
 *             "contents":[<更新テーブル1>,<更新テーブル2>,<更新テーブル3>]
 *         },
 *         <更新テーブル1>:{},
 *         <更新テーブル2>:{},
 *         <更新テーブル3>:{}....
 *     }"
 *     更新テーブルのリストは、テーブルプロパティ名の文字列リスト
 *     リストの要素数は、0でも構わない。　その場合は上位のノードの内容が反映される
 *     各更新テーブルの内容は上述の設定データをそのまま与える</pre>
 *
 *
 * ユーザは好みの方式で記述を行うことができる
 * 一般のDBではJSON形式を推奨
 * </pre>
 */
'use strict';
/*[configurations]
 *<pre>
 * アプリケーション設定DB
 * アプリケーションの動作に関わる設定情報DB
 * config.jsで　設定される内容のうちタイトル｜エピソードレベルでの記録が望ましいものをpmdb内に保存する
 * config.js内の情報は残置　実動作上はこのDBの内容で上書きされる
 * 他のテーブルと異なり、このテーブルは一律のオブジェクトのCollectionではなく、雑多のプロパティの集合となる
 * すべてのプロパティは、あってもなくても良い　ない場合はシステムのデフォルトの値が適用される
 *
 * データは、　{プロパティ名:内容}　のリスト
 * shotNamePrefix         :{String}     "s-c"|"c"|"S#-C#"|"C#" いずれか
 * sceneUse               :{Boolean}    false シーン番号を使用するか？
 * shotNumberUnique       :{Boolean}    true  カット番号を重複不可にする　シーン番号が不使用の場合は設定内容に関わらず自動的に true
 * sheetBaseColor         :{String}     タイムシートの地色　web16進色指定
 * receiptBaseColor       :{String}     制作伝票（xMap画面）の地色　web16進色指定
 *
 *
 * storyBoardStyle        :{String}     絵コンテの表示スタイル
 * 
 * eg. JSON
 * 
 *{
 *      "sceneUse":false,               :{Boolean}    false シーン番号を使用するか？
 *      "shotNumberUnique":true,       :{Boolean}    true  カット番号を重複不可にする　シーン番号が不使用の場合は設定内容に関わらず自動的に true
 *      "sheetBaseColor":"#eeffff",         :{String}     タイムシートの地色　web16進色指定
 *      "receiptBaseColor":"#eeffff",       :{String}     制作伝票（xMap画面）の地色　web16進色指定
 *      "storyboardStyle":{
 *          "documentDir":"vertical",          :{String}	vertical|horizontal|none 絵コンテの時間進行方向,
 *          "columnOrder":["index","picture","dialog","description","timeText"],          :[[lineOrder]]	カラム配置多次元配列テーブル,
 *          "pageControl":true,          :{Boolean}	true|false ページ管理を行うか否か,
 *          "pageDir":"ttb",              :{String}	ttb|ltr|rtl|vertical(=ttb)|horizontal(=ltr)|none ページ配置方向,
 *          "pageSize":"A4"              :{String}	ページ管理時の用紙サイズ
 *      }
 *}
 * 
 *</pre>
 */
nas.Pm.configurations.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.configurations.parseConfig('{"sceneUse":"false","shotNumberUnique":"true","sheetBaseColor":"#ffeeff","receiptBaseColor":"#ffffee","storyBoardStyle":{"documentDir":"vertical","columnOrder":["index","picture","dialog","description","timeText"],"pageControl":false,"pageDir":"ttb","pageSize":"A4"}}');
 /**<pre>
 *  [organizations]　組織情報
 *  組織オブジェクトは、組織情報トレーラーとして働く
 *  pmdbオブジェクト内に通常一つだけ存在して、共通の参照情報となる
 *  
 *  
 * プロパティ名  organization
 * 
 *     name          :通常表記名
 *     fullName      :正式名
 *     code          :ファイル名等使用コード
 *     id            :DBリンク用インデックス(UAT token)
 *     shortName     :短縮名
 *     description   :解説
 *     contact       :組織連絡先
 *     contact_token :組織連絡先DB接続ID
 *     serviceUrl    :サービス元URL　リポジトリのサービスを提供するUATサーバのURL　または　Webストレージ等のファイルリポジトリのURL
 * 
 * eg. JSON
 * {
 *     "nekomataya":{
 *         "name":"nekomataya",
 *         "fullName":"ねこまたや",
 *         "code":"nkmt",
 *         "id":"0001",
 *         "serviceUrl":"localRepository:info.nekomataya.pmdb",
 *         "shortName":"(ね)",
 *         "contact":"ねこまたや:kiyo@nekomataya.info",
 *         "description":"ねこまたや:kiyo@nekomataya.info"
 *     }
 * }
 * eg.dump　データ位置依存　配列ダンプ　改行区切り name,[fullName,code,id,serviceUrl,shortName,contact,description]
 * 
 * "nekomataya",["ねこまたや","nkmt","0001","localRepository:info.nekomataya.pmdb","(ね)","ねこまたや:kiyo@nekomataya.info","ねこまたや:kiyo@nekomataya.info"]
 * 
 * eg. text
 * 
 * nekomataya
 * 	fullName:ねこまたや
 * 	code:nkmt
 * 	id:0001
 * 	serviceUrl:localRepository:info.nekomataya.pmdb
 * 	shortName:(ね)
 * 	contact:ねこまたや:kiyo@nekomataya.info
 * 	description:ねこまたや:kiyo@nekomataya.info
 * </pre>
 */

nas.Pm.organizations.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.organizations.parseConfig('{"0000":{"name":"undefined","fullName":"未設定","code":"udf","id":"0000","serviceUrl":"file://","shortName":"undef","contact":"管理ユーザ:administrator@u-at.net","description":"管理ユーザ:administrator@u-at.net"},"0001":{"name":"nekomataya","fullName":"ねこまたや","code":"nkm","id":"0001","serviceUrl":"localRepository:info.nekomataya.pmdb","shortName":"(ね)","contact":"ねこまたや:kiyo@nekomataya.info","description":"ねこまたや:kiyo@nekomataya.info"},"0003":{"name":"sampleTeam","fullName":"SmapleDataRepository K.K","code":"smpl","id":"0003","serviceUrl":"https://u-at.net/~","shortName":"spl","contact":"contact:contact@sample.example.com","description":"contact:contact@sample.example.com"},"0004":{"name":"sampleTeam2","fullName":"Smaple2DataRepository K.K","code":"spl2","id":"0004","serviceUrl":"https://u-at.net/x~","shortName":"sample2","contact":"contact:contact@sample.example.com","description":"contact:contact@sample.example.com"}}');
/**<pre>
 *     productionStaff
 *
 *
 *    組織に属する全ユーザのリスト
 *    リストにないユーザは、作業に参加できない
 * eg. JSON
 * 
 *  [
 *      {"handle":"ねずみ","email":"mouse@animals.example.com","token":"1234566"}"
 *  ]
 * 
 * eg. dump 　位置依存　配列ダンプ　改行区切り　[handle,e-mail,{追加プロパティ}]
 * 
 * ["ねずみ","mouse@animals.example.com",{"token":"1234566"}]
 * 
 * eg. plain-text  handle:e-mail[:{option}]
 *
 *    ねこまたや:kiyo@nekomataya.info
 *
 *
 *</pre>
*/
nas.Pm.users.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.users.parseConfig('[{"handle":"管理者ユーザ","email":"administrator@u-at.net"}]');

/**<pre>
 * スタッフ登録
 *
 * スタッフリストに登録のないユーザは作品に一切参加できない
 *
 *  タブ区切りテキスト形式の場合は、空行以外の１行ごとに以下のデータが登録される
 *
 *アクセス可否[h-tab]部門[h-tab]役職[h-tab]ユーザ[h-tab]別名
 *
 *  それぞれのフィールドが空欄の場合は、既述の値またはデフォルトの値で補われる
 *
 * acsess(アクセス可否)
 *     エントリへのアクセス権限、省略可
 *         true|+  アクセス可
 *         false|- アクセス不可
 *     省略時はアクセス可
 * section(部門)
 *     部署（セクション）名　部門を登録する
 *     省略時は既述値
 * duty(役職)
 *     役職名　役職を登録する
 *     省略時は既述値
 * user(ユーザ)
 *     ユーザID　<名前>:<メールアドレス　または　システムID(トークン)>
 *     省略時は値なし
 * alias(別名)
 *     ペンネーム等の表示名
 *     省略時は値なし
 *
 *
 * eg. JSON
 * 
 * [
 *     {"acsess":true,"type":"section","alias":"","user":null,"duty":null,"section":"制作管理"},
 *     {"acsess":true,"type":"duty","alias":"","user":null,"duty":"プロデューサ","section":"制作管理"},
 *     {"acsess":true,"type":"user","alias":"","user":"ねずみ:","duty":"プロデューサ","section":"制作管理"}
 * ]
 *
 * eg. dump 　位置依存　配列ダンプ　改行区切り　[アクセス可否,別名,ユーザ,役職,部門]
 *
 *[true,"","",null,"制作管理"]
 *[true,"","","プロデューサ","制作管理"]
 *[true,"","ねずみ:","プロデューサ","制作管理"]
 *
 * eg. plain-text
 *アクセス可否	部門	役職	ユーザ	別名
 *	制作管理
 *		プロデューサ
 *			ねずみ:
 *
 *</pre>
 *
 */
nas.Pm.staff.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.staff.parseConfig('\n	制作管理\n		プロデューサ\n		統括デスク\n		デスク\n		制作進行\n	演出\n		監督\n		演出\n		演出助手\n	文芸\n		脚本\n		設定制作\n		デザイナー\n		キャラ設定\n		美術設定\n		小物設定\n		色彩設計\n	作画\n		総作画監督\n		作画監督\n		作画監督補\n		メカ作画監督\n		メカ作画監督補\n		原画\n		第一原画\n		第二原画\n		動画検査\n		動画監督\n		動画\n	美術\n		美術監督\n		美術監督補佐\n		原図整理\n		背景\n	仕上\n		色指定\n		トレース\n		ペイント\n		特殊効果\n	撮影\n		撮影監督\n		撮影\n		撮影助手\n	3D\n	無所属\n		＊\n	オブザーバ\n		オブザーバ\n		時代考証\n');
/*
    部門・無所属 をデフォルトで置く
*/

/**<pre>
 * アセット分類
 *
 *  データ管理の基礎となるアセットの定義テーブル
 *  assetName  :アセット名　キー値　必須　unique
 *  name       :一般表示名称　必須　unique
 *  hasXPS     :アセットがXps(タイムシート)を伴うか否かのフラグ　省略時は true
 *  code       :短縮表記コード　必須　unique
 *  shortName  :短縮表記名 必須　unique
 *  description:説明 省略時は ""
 *  endNode    :ラインの終了条件アセットになりうるか否かのフラグ 省略時は false
 *  linkStages :呼び出しステージ配列 省略時はすべてのステージ
 *
 *
 *  呼び出しステージ配列は アセット側としては、アセットを受けて開始することが可能なステージ群
 *  ステージ側から見るとそのステージの開始に最低限必要なアセット
 *  呼び出しステージ配列が空のアセットはストアにストックされるのみで、次のステージを開始しない
 *
 *  アセットは、システムごとに定義してユーザによる編集（追加・削除・内容の変更）が可能
 *
 *
 *クラスのコレクションはテンプレートとして機能
 * eg. JSON
 * 
 *{
 *    "SCInfo":{
 *         "name":"コンテチップ",
 *         "hasXPS":"true",
 *         "code":"SCI",
 *         "shortName":"コンテ",
 *         "endNode":"false",
 *         "callStage":[
 *             "leica",
 *             "animatic",
 *             "roughSketch",
 *             "layout",
 *             "1stKeydrawing"
 *         ]
 *     }
 *}
 * 
 * eg. dump 改行区切り　位置依存　配列ダンプ　assetName,[name,hasXPS,code,shortName,description,endNode,[linkStages]]
 * 
 *"SCInfo",["コンテチップ","true","SCI","コンテ",null,"false",["leica","animatic","roughSketch","layout","1stKeydrawing"]]
 * 
 * eg. plain-text
 * 
 *SCInfo
 *	name:コンテチップ
 *	hasXPS:true
 *	code:SCI
 *	shortName:コンテ
 *	description:null
 *	endNode:false
 *	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
 *
 *</pre>
 */
nas.Pm.assets.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.assets.active = 'ALL';
nas.Pm.assets.parseConfig('\nUNDEFINED\n	name:(UNDEFINED)\n	hasXPS:false\n	code:(UDF)\n	shortName:(UNDEF)\n	description:未定義ステージのための未定義アセット\n	endNode:false\n	callStage:undefined\nEXTRA\n	name:(空アセット)\n	hasXPS:false\n	code:NULL\n	shortName:EXTRA\n	description:カットナンバーを与えられない素材に対するアセット\n	endNode:true\n	callStage:\nALL\n	name:(全アセット)\n	hasXPS:true\n	code:_ALL\n	shortName:ALL\n	description:便宜的に設けられる総合アセット\n	endNode:true\n	callStage:\nCOMPOSITE\n	name:[COMPOSITE]\n	hasXPS:true\n	code:[COMP]\n	shortName:(撮影)\n	description:コンポジットアセット\n	endNode:false\n	callStage:\ncComposite\n	name:[cComposite]\n	hasXPS:true\n	code:[REF]\n	shortName:[線撮]\n	description:リファレンスコンポジットアセット\n	endNode:false\n	callStage:\nSCInfo\n	name:コンテチップ\n	hasXPS:true\n	code:SCI\n	shortName:コンテ\n	description:絵コンテから得られるカット制作情報\n	endNode:false\n	callStage:leica,animatic,roughSketch,layout,1stKeydrawing\nleica\n	name:プリビズ\n	hasXPS:true\n	code:prev\n	shortName:プリビズ\n	description:ライカリール｜プリビジュアライゼーションビデオ作成のための素材\n	endNode:false\n	callStage:leica,animatic,roughSketch,layout,1stKeydrawing\ndraft\n	name:ラフスケッチ\n	hasXPS:true\n	code:DRFT\n	shortName:ラフ\n	description:ショット作成のためのラフスケッチ\n	endNode:false\n	callStage:leica,animatic,roughSketch,layout,1stKeydrawing\nlayout\n	name:レイアウト\n	hasXPS:true\n	code:LO\n	shortName:LO\n	description:アニメーション作成のためのレイアウト\n	endNode:false\n	callStage:leica,animatic,roughSketch,layout,1stKeydrawing,layoutProof,layoutA-D,keydrawing,2ndKeydrawing\nkeyAnimation\n	name:原画\n	hasXPS:true\n	code:GEN\n	shortName:原\n	description:アニメーション線画作成のためのキーアニメーション\n	endNode:false\n	callStage:KDA-D,2ndKdA-D,checkKD,preProofAD,AD\nAnimationDrawing\n	name:動画\n	hasXPS:true\n	code:DOU\n	shortName:動\n	description:アニメーション線画\n	endNode:false\n	callStage:ADA-D,proofAD,A-D,ADscan,ADcleanUp,HMechanicalTrace\ncell\n	name:セル\n	hasXPS:true\n	code:CELL\n	shortName:仕\n	description:彩色済みアニメーション線画\n	endNode:true\n	callStage:AdcleanUp,paint,proofPaint,retouchCell\ncharacterDesign\n	name:キャラクター設定\n	hasXPS:false\n	code:chrD\n	shortName:キャラ\n	description:アニメーション作画のためのキャラクターデザイン\n	endNode:true\n	callStage:undefined\npropDesign\n	name:プロップ設定\n	hasXPS:false\n	code:prpD\n	shortName:プロップ\n	description:アニメーション作画のためのプロップデザイン\n	endNode:true\n	callStage:\nBGDesign\n	name:美術設定\n	hasXPS:false\n	code:bgaD\n	shortName:美設\n	description:アニメーション作画のための美術デザイン\n	endNode:true\n	callStage:\nreferenceSheet\n	name:参考設定\n	hasXPS:false\n	code:refD\n	shortName:参考\n	description:アニメーション作画のための参考デザイン\n	endNode:true\n	callStage:\ncolorDesign\n	name:色彩設計\n	hasXPS:false\n	code:colD\n	shortName:色設\n	description:アニメーション作画のための色彩デザイン\n	endNode:true\n	callStage:\ncolorCoordiante\n	name:色指定\n	hasXPS:true\n	code:colC\n	shortName:指定\n	description:アニメーション作画のための色彩コーディネーション\n	endNode:true\n	callStage:\nbackgroundArt\n	name:背景\n	hasXPS:true\n	code:_BGA\n	shortName:背景\n	description:背景美術\n	endNode:true\n	callStage:\nanimation3D\n	name:3Dアニメーション\n	hasXPS:true\n	code:3DCG\n	shortName:3D\n	description:３Dアニメーションアセット\n	endNode:true\n	callStage:\ncast3D\n	name:3Dアニメーション\n	hasXPS:true\n	code:3DCC\n	shortName:3D\n	description:３Dアニメーションアセット\n	endNode:true\n	callStage:\nmodel3D\n	name:モデル\n	hasXPS:false\n	code:mod3\n	shortName:mod\n	description:3Dアニメーションモデル\n	endNode:false\n	callStage:\nrig3D\n	name:リグ\n	hasXPS:false\n	code:rig3\n	shortName:rig\n	description:3Dアニメーションリグ\n	endNode:false\n	callStage:\nmaterial3D\n	name:マテリアル\n	hasXPS:false\n	code:mtl3\n	shortName:mat\n	description:3Dアニメーションマテリアル設定\n	endNode:false\n	callStage:\nanimation3D\n	name:アニメーション\n	hasXPS:true\n	code:anm3\n	shortName:anim\n	description:3Dアニメーション\n	endNode:false\n	callStage:\nset3D\n	name:セット\n	hasXPS:false\n	code:set3\n	shortName:set\n	description:3Dアニメーションステージセット\n	endNode:false\n	callStage:\nlighting3D\n	name:ライティング\n	hasXPS:true\n	code:lgt3\n	shortName:lgt\n	description:3Dアニメーションライト\n	endNode:false\n	callStage:\ncamera3D\n	name:カメラ\n	hasXPS:true\n	code:cam3\n	shortName:cam3D\n	description:3Dアニメーションステージコンポジット\n	endNode:false\n	callStage:\nsfx3D\n	name:SFX\n	hasXPS:true\n	code:sfx3\n	shortName:sfx3D\n	description:\n	endNode:false\n	callStage:\n')

/**<pre>
 * ステージ分類
 *　ステージの持つプロパティ
 *stageName     :定義名称：オブジェクトのコールに使用する キャメル記法で
 *name          :一般名称
 *code          :省略表記コード 英数４バイトまで
 *shortName     :日本語用省略表記コード
 *description   :日本語の名称を兼ねた説明？
 *output        :ステージの出力する（目的となる）アセットをキーワードで指定
 *
 *nas.Pm.stages[ステージ名]={name:一般名,code:短縮コード(4biteまで),shortName:短縮名,description:解説,output:出力アセット};
 *
 *  nas.Pm.stages には、その作品で定義されたステージのリファレンスが格納される。
 *  管理DBと連結される場合は、このオブジェクトとDB上のステージ定義テーブルが対照・連結される
 *  ここでは、独立駆動のためのテーブルを定義している
 *
 *  ステージを定義する際にステージにグループ・スタッフロール・個人ユーザを連結することができる
 *  明示的な連結のないステージは　＊（全ユーザ）に連結される。
 *  連結テーブルは別に設ける
 *  リンクのキーはステージID(stageName)
 * 
 * eg. JSON
 * {
 *     "keydrawing":{
 *         "name":"原画",
 *         "code":"KD",
 *         "shortName":"原",
 *         "description":"原画上がり作画監督修正含む keyDrawing",
 *         "output":"keyAnimation",
 *         "stageName":"keydrawing"
 *     }
 * }
 *
 * eg. dump 改行区切り　位置依存　名前付き配列ダンプ　stageName[name,code,shortName,description,output]
 *
 *"keydrawing",["原画","KD","原","原画上がり作画監督修正含む keyDrawing","keyAnimation"]
 *
 * eg. plain-text
 * 
 *init
 *	name:原画
 *	code:KD
 *	shortName:原
 *	description:原画上がり作画監督修正含む keyDrawing
 *	output:keyAnimation
 *
 *</pre>
 */
nas.Pm.stages.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.stages.parseConfig('\nundefined\n	name:未定義\n	code:UNDF\n	shortName:(undefined)\n	description:未定義ステージ 制作預りとして扱う。基本的にアセットストアへの編入を指す\n	output:(UNDEFINED)\ninit\n	name:初期化\n	code:init\n	shortName:開始\n	description:初期化ステージ 制作預りとして扱う。制作開始前処理\n	output:SCInfo\ncharacterDesign\n	name:キャラクターデザイン\n	code:chrD\n	shortName:キャラデ\n	description:プロダクション管理デザイン（各話発注デザイン）＊メインデザインは別管理\n	output:characterDesign\npropDesign\n	name:プロップデザイン\n	code:prpD\n	shortName:プロップ\n	description:プロダクション管理デザイン（各話発注デザイン）\n	output:propDesign\ncolorDesign\n	name:色彩設計\n	code:colD\n	shortName:色彩設計\n	description:カラーデザイン（基本色彩設計）\n	output:colorDesign\ncolorModel\n	name:色彩設計カラーモデル\n	code:coMD\n	shortName:色彩設計M\n	description:カラーモデル（パレット）型基本色彩設計(animo toonz等)\n	output:colorDesign\ncolorCoordination\n	name:色指定\n	code:iro\n	shortName:色指定\n	description:カット別彩色指定データ\n	output:colorDesign\ncomposite\n	name:合成\n	code:Comp\n	shortName:撮影\n	description:コンポジットステージ\n	output:(COMPOSITE)\ncoComposite\n	name:参照合成\n	code:cComp\n	shortName:線撮\n	description:参考データコンポジット\n	output:(cCOMPOSITE)\ncoordinationModel\n	name:色指定カラーモデル\n	code:ccM\n	shortName:色指定M\n	description:カラーモデル（パレット）型カット別彩色指定データ(animo toonz等)\n	output:colorDesign\nbgDesign\n	name:美術設定\n	code:artD\n	shortName:美設\n	description:プロダクション内デザインワーク\n	output:BGDsign\nSCInfo\n	name:コンテチップ\n	code:_SCI\n	shortName:コンテチップ\n	description:絵コンテを分解してシーンをプロジェクトデータ化したものイニシャルデータなのでこれを出力する同名ステージは無い\n	output:SCInfo\nleica\n	name:ライカ\n	code:leica\n	shortName:ライカ\n	description:タイミングを構成したモーションラフ\n	output:draft\ncontChip\n	name:絵コンテ撮\n	code:cntC\n	shortName:コンテ撮\n	description:コンテチップを構成したモーションラフ\n	output:draft\nanimatic\n	name:プリビジュアライゼーション\n	code:__pv\n	shortName:PV\n	description:同上\n	output:layout\nroughSketch\n	name:ラフ原画\n	code:drft\n	shortName:ラフ原\n	description:同上\n	output:draft\nlayout\n	name:レイアウト\n	code:LO\n	shortName:LO\n	description:レイアウト上がり(原図あり)\n	output:layout\nLayoutAD\n	name:LOスキャン\n	code:LOcvt\n	shortName:レイアウトcvt\n	description:layout to Data レイアウトをデータ化したもの\n	output:layout\nkeydrawing\n	name:原画\n	code:GEN\n	shortName:原\n	description:原画上がり作画監督修正含む keyDrawing\n	output:keyAnimation\nKDAD\n	name:原画cvt\n	code:Gcvt\n	shortName:原画cvt\n	description:keyAnimation to Data 原画のデータ化\n	output:keyAnimation\nsndKeydrawing\n	name:第二原画\n	code:2G\n	shortName:二原\n	description:第一原画を原画としてフィニッシュしたもの\n	output:keyAnimation\nsndKdAD\n	name:第二原画cvt\n	code:2G-D\n	shortName:二原cvt\n	description:第二原画は原画相当\n	output:keyAnimation\ncheckKD\n	name:原画作監修正\n	code:KD+\n	shortName:作監\n	description:上がりは原画として扱う\n	output:keyAnimation\npreProofAD\n	name:発注前動画検査\n	code:2G+\n	shortName:前動検\n	description:実質上の第三原画又は第二原画修正\n	output:keyAnimation\nBGOrderMeeting\n	name:BG打合せ\n	code:BGOM\n	shortName:BG打ち\n	description:グロス発注のための打合せステージ。素材の変更なし\n	output:layout\nlayoutProof\n	name:美術原図整理\n	code:BGLP\n	shortName:原図整理\n	description:レイアウト原図を整理加筆してFIXしたもの\n	output:backgroundArt\nlayoutAD\n	name:背景原図スキャン\n	code:LP-D\n	shortName:原図スキャン\n	description:\n	output:backgroundArt\nbgArt\n	name:背景美術\n	code:BG\n	shortName:背景\n	description:完成背景美術\n	output:backgroundArt\nchaeckBgArt\n	name:美術検査\n	code:BG+\n	shortName:美監検査\n	description:\n	output:backgroundArt\nBgArtAD\n	name:美術cvt\n	code:BG-D\n	shortName:背景スキャン\n	description:\n	output:backgroundArt\nAD\n	name:動画\n	code:AD\n	shortName:動\n	description:動画上がり animationDrawing\n	output:AnimationDrawing\nADAD\n	name:動画cvt\n	code:AD/D\n	shortName:動画cvt\n	description:animation to Data 動画をデータ化したもの\n	output:AnimationDrawing\nproofAD\n	name:動画検査\n	code:AD+\n	shortName:動検\n	description:上がりは動画 動画検査をステージ扱いする場合に使用\n	output:AnimationDrawing\nADscan\n	name:スキャン\n	code:AD-D\n	shortName:スキャン\n	description:彩色データ作成のためのデジタイズ処理・半製品ペイントデータ\n	output:cell\nADcleanUp\n	name:動画クリンアップ\n	code:ADCL\n	shortName:Adcleanup\n	description:デジタイズされた動画をクリンアップする作業(これをトレースと呼ぶソフトもある)\n	output:cell\npaint\n	name:彩色\n	code:PT\n	shortName:PAINT\n	description:ソフトウェア作業によるセル彩色\n	output:cell\nproofPaint\n	name:彩色検査\n	code:PT+\n	shortName:セル検\n	description:彩色済みデータ\n	output:cell\nretouchCell\n	name:セル特効\n	code:PTfx\n	shortName:特効\n	description:加工済みデータ\n	output:cell\nHMechanicalTrace\n	name:マシントレース\n	code:H-mt\n	shortName:M-trace\n	description:動画をセルに機械転写したもの(古い形式のデータを記述するためのエントリ)\n	output:cell\nHtrace\n	name:ペイント\n	code:H-pt\n	shortName:彩色\n	description:セル時代の作業を記録するためのエントリ\n	output:cell\nHcolorTrace\n	name:色トレス\n	code:H-ct\n	shortName:色T\n	description:セル時代の作業を記録するためのエントリ\n	output:cell\nHproofPaint\n	name:セル検査\n	code:H-pp\n	shortName:セル検\n	description:セル時代の作業を記録するためのエントリ\n	output:cell\nHretouchCell\n	name:エアブラシ特効\n	code:H-fx\n	shortName:エアブラシ\n	description:セル時代の作業を記録するためのエントリ\n	output:cell\ncomposite\n	name:コンポジット\n	code:COMP\n	shortName:撮影\n	description:コンポジット工程をプロダクションに入れるべきか否かは結構悩む 制作工程上終端なので出力は無し 終了シンボルを作るか？\n	output:ALL\npreCompositCheck\n	name:撮出し検査\n	code:PCCk\n	shortName:撮出し\n	description:撮影前全検査(古い工程を記述するためのエントリ)\n	output:ALL\ngeneralDirectorCheck\n	name:監督チェック\n	code:GDCk\n	shortName:監督チェック\n	description:監督による作業検査\n	output:ALL\ndirectorCheck\n	name:演出チェック\n	code:DcCk\n	shortName:演出チェック\n	description:担当演出による作業検査\n	output:ALL\n\n# 以下の複合ステージを追加する\n# 海外発注等の一括作業のため本来工程として扱っていたものを複合された１工程として扱う\n# ステージ内では新規ステージを初期化する手間を省き、全て連続したジョブとして制作を進める\n# ステージの成果物は最終的な成果物をターゲットアセットとする。\n#\n#    仕上(スキャン、トレース、ペイント等をステージ内ジョブとして持つ複合ステージ)\n#    動仕(上記の他に動画を含む複合ステージ)\n#    原動仕(上記に更に原画を加えたもの)\n#    二原動仕(上記の原画が第二原画であるもの)\n#\n# 制作担当者によるステージの切り替えが自動化された場合は、これらの複合ステージを利用せず、外注先でもUATをそのまま利用してもらうことが望ましい。\n\nTP\n	name:仕上\n	code:T&P\n	shortName:仕上\n	description:仕上一括(複合)\n	output:cell\nATP\n	name:動仕\n	code:AT&P\n	shortName:動画仕上\n	description:動画仕上一括(複合)\n	output:cell\nKATP\n	name:原動仕\n	code:KAT&P\n	shortName:原動仕\n	description:原画動画仕上一括(複合)\n	output:cell\nsKATP\n	name:二原動仕\n	code:sKAT&P\n	shortName:二原動仕\n	description:二原動画仕上一括(複合)\n	output:cell\n');

/**<pre>
 * ライン分類
 * 管理モデルの簡略化のため 本線・傍線ともに分離後の個別の合流はないものとする
 * 必要なアセットはストアから引き出す
 * 制作ラインの前方にはスタートラインがあり SCinfoで始まる
 * 後方コンポジット工程の手前にアセットストア（合流）ラインがあり、ここをストアとして全ての素材がマージされる
 * カット情報を持ったコンポジット素材はコンポジット情報を元に各カットへ配分される それ以外のアセットは参照アセットとして格納される
 * 参照アセットは随時引き出し可能
 *
 * 本線（trunk）は特殊なラインで、通常すべての制作ワークフローに共通で使用されるデフォルトエントリー
 *
 * nas.Pm.lines には、システムで定義された工程のリファレンスが格納される。
 * 管理DBと連結される場合は、このオブジェクトとDB上のライン定義テーブルが対照・連結される
 * ここでは、独立駆動のためのテーブルを定義している
 *
 * lineName        :ラインアクセスキーワード
 * name            :ライン名
 * shortName       :短縮名
 * initAsset       :初期化アセット
 * code            :コード
 * description     :説明
 *
 *
 * eg. JSON
 *
 *{
 *     "trunk":{
 *         "name":"本線",
 *         "shortName":"本線",
 *         "initAsset":"コンテチップ",
 *         "code":"cell",
 *         "description":"管理本線となるセルライン"
 *     },
 *     "backgroundArt":{
 *         "name":"背景美術",
 *         "shortName":"背景",
 *         "initAsset":"レイアウト",
 *         "code":"bg",
 *         "description":"美術作業"
 *     }
 *}
 *
 * eg. dump 改行区切り　位置依存　配列ダンプデータ lineName,[name,shortName,initAsset,code,description]
 *
 * "trunk",["本線","本線",null,"コンテチップ","cell","管理本線となるセルライン"]
 * "backgroundArt",["背景美術","背景",null,"レイアウト","bg","美術作業"]
 * 
 * eg. palain-text
 *
 *trunk
 *	name:本線
 *	shortName:本線
 *	outoputAsset:セル
 *	initAsset:コンテチップ
 *	code:cell
 *	description:管理本線となるセルライン
 *backgroundArt
 *	name:背景美術
 *	shortName:背景
 *	outoputAsset:背景
 *	initAsset:レイアウト
 *	code:bg__
 *	description:美術作業
 *
 *</pre>
 */
nas.Pm.lines.timestamp = new Date('2021.02.20 20:00:00').getTime();
nas.Pm.lines.parseConfig('{"trunk":{"name":"本線","shortName":"本線","initAsset":"コンテチップ","code":"cell","description":"管理本線となるセルライン"},"colorCoordiante":{"name":"色指定","shortName":"指定","initAsset":"レイアウト","code":"__cc","description":"色指定"},"backgroundArt":{"name":"背景美術","shortName":"背景","initAsset":"レイアウト","code":"bg__","description":"美術作業"},"3Dcgi":{"name":"3D-CGI","shortName":"3D","initAsset":"レイアウト","code":"3dcg","description":"総合的3D-CGI"},"characterDesign":{"name":"キャラクター設定","shortName":"キャラ設","initAsset":"（空アセット）","code":"cd","description":"キャラクター設定"},"propDesign":{"name":"プロップ設定","shortName":"プロップ","initAsset":"（空アセット）","code":"_prp","description":"プロップ設定"},"BGDesign":{"name":"美術設定","shortName":"美設","initAsset":"（空アセット）","code":"_bga","description":"美術設定作業"},"colorDesign":{"name":"色彩設計","shortName":"色設計","initAsset":"（空アセット）","code":"colD","description":"色彩設計"},"composite":{"name":"コンポジット","shortName":"撮影","initAsset":"（全アセット）","code":"comp","description":"撮影"},"ALL":{"name":"(全素材)","shortName":"全","initAsset":"（全アセット）","code":"_all","description":"カット情報を持って一時的に集積されるライン"},"null":{"name":"(未設定)","shortName":"(未)","initAsset":"（空アセット）","code":"null","description":"初期化前のオブジェクトに設定するダミーライン"}}');
/*========================================================================*/

/**<pre>
 *   制作基準テンプレート
 *  制作管理のため基準値として利用
 *   このデータは基礎データとして各現場ごとに編集する必要がある
 *   現場ごとのライン内のステージの流れをテンプレートとして保存する
 *   各テンプレートは、相互運用を前提とするテンプレートセットに所属する
 *   テンプレート
 *   以下に設定するのは参考用テンプレート
 *   書式:
 *<ライン名>
 *   stages:<工程名>,<工程名>...
 *   summary:<duty.stage>,<duty.stage>...
 *
 *   親オブジェクト    (nas.Pmは参照用マスターDB　その他はリポジトリを親に設定する。プラグラムの動作に必用な　lines,stages,jobNames　を配下に持っているオブジェクト)
 *   <ライン名>    名称は任意、ただし基本的には、0番は本線、
 *   <工程名>  ラインごとの工程（ステージ）標準並び 作業順にコンマ区切りで工程名を列記する
 *  各ラインの持つステージ群の最初のエントリがデフォルトのエントリとなり、ドキュメント初期化の際に候補される　または自動処理で割り当てられる
 'startup'ステージは、テンプレート未設定の場合の汎用アウターとアップステージとする
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"本線",["レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]));
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"背景美術",["原図整理","背景","美術検査"]));

line        :対象ライン
stages      :初期想定のステージの並びを　ステージのキーワードのコンマ区切りデータまたは配列で
summary     :進捗の概要表示の際にピックアップするポイントをリストアップする
            :書式は　役職とステージのキーワードを".(ドット)"で連結した文字列　duty.stage
aggregate   :集計対象　集計内容を列挙　()
            :書式は　集計タイプ、集計項目、ステージのキーワードを".(ドット)"で連結した文字列　type.jobName.stage
            :typeは以下のいずれか　xmapMember|timelineMember|sciTime|sciCount
            :jobNameは、直接指定の他にタイプキーワード *,primary,all　が使用できる
            :* - 最終のジョブ ,primary - ステージの主作業のみ ,all - init以外のすべてのJobごと
            :ex.timelineMember.primary.動画 sciTime.*.原画

eg. JSON

[
    {
        "line":"本線",
        "stages":[
            "絵コンテ撮",
            "レイアウト",
            "原画",
            "第一原画",
            "第二原画",
            "発注前動画検査",
            "動画",
            "色指定",
            "スキャン",
            "色トレス",
            "仕上",
            "セル特効",
            "撮出し検査",
            "コンポジット"
        ],
        "summary":[
            "演出.原画",
            "作画監督.原画",
            "総作画監督.原画",
            "動画検査.動画",
            "色指定.色指定",
            "仕上検査.仕上"
        ],
        "aggregate":[
            "sciTime.*.レイアウト",
            "sciCount.*.レイアウト",
            "timelineMember.*.動画",
            "timelineMember.*.仕上"
        ]
    },
    {
        "line":"背景美術",
        "stages":[
            "美術原図整理",
            "背景美術",
            "美術検査"
        ],
        "summary":[
            "美術監督.原図",
            "メカ作監.原画",
            "総メカ作監.原画",
            "前動検.原画",
            "監督.撮出"
        ]
    }
]

eg. dump 改行区切り　位置依存　配列ダンプデータ [line,[stages],[summary],[aggregate]]

["本線",["絵コンテ撮","レイアウト","原画","第一原画","第二原画","発注前動画検査","動画","色指定","スキャン","色トレス","彩色","セル特効","撮出し検査","コンポジット"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","色指定.色指定","彩色検査.彩色"],"aggregate":[]]
["背景美術",["美術原図整理","背景美術","美術検査"],["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]]

eg. palain-text

本線
	stages:絵コンテ撮,レイアウト,原画,第一原画,第二原画,発注前動画検査,動画,色指定,スキャン,色トレス,セル特効,撮出し検査,コンポジット
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,色指定.色指定,彩色検査.彩色
	aggregate:"sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色"
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出

 *</pre>
*/
nas.Pm.pmTemplates.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.pmTemplates.parseConfig('[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"3D-CGI","stages":[""],"summary":["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]');

/**<pre>
 *   制作基準ワークフローテンプレート
 *  制作管理のため基準値として利用
 *   このデータは基礎データとして各現場ごとに編集する必要がある
 *   現場ごとのライン内のステージの流れをラインテンプレートとして管理する
 *   ラインテンプレートは、相互運用を前提とするワークフローテンプレートセットに所属する
 *   ワークフローテンプレート
 *   以下に設定するのは参考用テンプレート
 *   書式:
 *   name:<ワークフロー名>,
 *   members|workflow:[
 *     {
 *       line:<ラインテンプレート名>
 *       stages:[<工程名>,<工程名>...],
 *       summary:[<duty.stage>,<duty.stage>...],
 *       aggregate:[<type.item.stage>,<type.item.stage>...]
 *     },
 *     {},....
 *   ]
 *   親オブジェクト    (nas.Pmは参照用マスターDB　その他はリポジトリを親に設定する。プラグラムの動作に必用な　lines,stages,jobNames　を配下に持っているオブジェクト)
 *   <ライン名>    名称は任意、ただし基本的には、0番は本線、
 *   <工程名>  ラインごとの工程（ステージ）標準並び 作業順にコンマ区切りで工程名を列記する
 *  各ラインの持つステージ群の最初のエントリがデフォルトのエントリとなり、ドキュメント初期化の際に候補される　または自動処理で割り当てられる
 'startup'ステージは、テンプレート未設定の場合の汎用アウターとアップステージとする
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"本線",["レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]));
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"背景美術",["原図整理","背景","美術検査"]));

line        :対象ラインテンプレート名　名前のみで同定 ユニーク
stages      :初期想定のステージの並びを　ステージのキーワードのコンマ区切りデータまたは配列で
summary     :進捗の概要表示の際にピックアップするポイントをリストアップする
            :書式は　役職とステージのキーワードを".(ドット)"で連結した文字列　duty.stage
aggregate   :集計対象　集計内容を列挙　()
            :書式は　集計タイプ、集計項目、ステージのキーワードを".(ドット)"で連結した文字列　type.jobName.stage
            :typeは以下のいずれか　xmapMember|timelineMember|sciTime|sciCount
            :jobNameは、直接指定の他にタイプキーワード *,primary,all　が使用できる
            :* - 最終のジョブ ,primary - ステージの主作業のみ ,all - init以外のすべてのJobごと
            :ex.timelineMember.primary.動画 sciTime.*.原画

eg. JSON
{
  name: "UATsample",
  members:[
    {
        "line":"本線",
        "stages":[
            "絵コンテ撮",
            "レイアウト",
            "原画",
            "第一原画",
            "第二原画",
            "発注前動画検査",
            "動画",
            "色指定",
            "スキャン",
            "色トレス",
            "仕上",
            "セル特効",
            "撮出し検査",
            "コンポジット"
        ],
        "summary":[
            "演出.原画",
            "作画監督.原画",
            "総作画監督.原画",
            "動画検査.動画",
            "色指定.色指定",
            "仕上検査.仕上"
        ],
        "aggregate":[
            "sciTime.*.レイアウト",
            "sciCount.*.レイアウト",
            "timelineMember.*.動画",
            "timelineMember.*.仕上"
        ]
    },
    {
        "line":"背景美術",
        "stages":[
            "美術原図整理",
            "背景美術",
            "美術検査"
        ],
        "summary":[
            "美術監督.原図",
            "メカ作監.原画",
            "総メカ作監.原画",
            "前動検.原画",
            "監督.撮出"
        ]
    }
  ]
}
eg. dump 改行区切り(* ワークフロー１レコードを１行でダンプする = ワークフローコレクション内で改行区切り)
#要素位置依存 配列ダンプデータ [workflowName,[[line,[stages],[summary],[aggregate]]..]] 

["UATsample",[["本線",["絵コンテ撮","レイアウト","原画","第一原画","第二原画","発注前動画検査","動画","色指定","スキャン","色トレス","彩色","セル特効","撮出し検査","コンポジット"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","色指定.色指定","彩色検査.彩色"],"aggregate":[]],["背景美術",["美術原図整理","背景美術","美術検査"],["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]]]]\n

eg. palain-text
# ワークフローコレクション内では'workflow:~'をキーに切り替え
workflow:UATSample
本線
	stages:絵コンテ撮,レイアウト,原画,第一原画,第二原画,発注前動画検査,動画,色指定,スキャン,色トレス,セル特効,撮出し検査,コンポジット
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,色指定.色指定,彩色検査.彩色
	aggregate:"sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色"
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出

</pre>
*/ 


nas.Pm.pmWorkflows.timestamp = new Date('2021.02.20 20:00:00').getTime();
/*nas.Pm.pmWorkflows.parseConfig('
workflow:UATSample
本線
	stages:絵コンテ撮,レイアウト,原画,第一原画,第二原画,発注前動画検査,動画,色指定,スキャン,色トレス,セル特効,撮出し検査
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,色指定.色指定,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出
3D-CGI
	stages:モデル,リグ,マテリアル,アニメーション,セット,ライティング,カメラ,SFX
	summary:監督.モデル,作監.モデル,監督.アニメーション,作監.アニメーション,監督.カメラ,監督.SFX
撮影
	stages:絵コンテ撮,本撮

workflow:UATSample2
本線
	stages:絵コンテ撮,レイアウト,原画,第一原画,第二原画,発注前動画検査,動画,色指定,スキャン,色トレス,セル特効,撮出し検査
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,色指定.色指定,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出
3D-CGI
	stages:モデル,リグ,マテリアル,アニメーション,セット,ライティング,カメラ,SFX
	summary:監督.モデル,作監.モデル,監督.アニメーション,作監.アニメーション,監督.カメラ,監督.SFX
撮影
	stages:絵コンテ撮,本撮

workflow:YAL
本線
	stages:絵コンテ撮,3Dレイアウト,レイアウト,原画,第二原画,動仕,原動仕,動画,スキャン,トレス,彩色,セル特効,撮出し検査
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,色指定.色指定,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出
3D-CGI
	stages:モデル,リグ,マテリアル,アニメーション,セット,ライティング,カメラ,SFX
	summary:監督.モデル,作監.モデル,監督.アニメーション,作監.アニメーション,監督.カメラ,監督.SFX
撮影
	stages:絵コンテ撮,本撮
');// */
//JSON


nas.Pm.pmWorkflows.parseConfig('[{"name":"UATSample","members":[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"3D-CGI","stages":[""],"summary":["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]},{"name":"UATSample2","members":[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","スキャン","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"3D-CGI","stages":[""],"summary":["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]},{"name":"UATSample3","members":[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","マシントレース","色トレス","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]}]');//*/
//dump


/**<pre>
 *  ジョブは、ステージごとに定義される
 *  作業中に初期状態の名称リストの他に逐次新しい名前を定義して良い
 *  定義された名称はステージごとに蓄積される
 *  以降の同ステージの作業者はそのリストから自分の作業にふさわしいジョブ名称を選択することができる
 *  常に新しい作業名を作成して入力して良い　重複は制限されない
 *  ジョブの名称、順序は各ステージオブジェクト（カット）毎に異なっていて良い
 *
 *  どのステージでも０番ジョブは予約で、制作管理者が立ち上げる
 * ０番ジョブは手続き的なジョブであり、実際に素材が作成されることはない
 * 名称はステージごとに定義されるが、通常は 「初期化」「開始」「作打済」「準備」 等の名称が与えられる
 * 伝票の発行は０番ジョブに対して行なわれると想定されている
 *
 *  １番ジョブは、通常そのステージの主作業　プライマリ・ジョブ
 * 原画ステージなら「原画」作業 動画ステージならば「動画」作業となる
 *
 *  ２番ジョブ以降は、主作業に対するチェック作業となる場合が多い
 *  原画ステージならば「演出検査」「作監検査」「監督検査」など
 *  ステージ内の差し戻し作業（やり直し）が発生した場合は、リテイク処理とは別に ステージ内差し戻し作業が発生する
 *  例えば演出検査で演技の変更指示が発生した場合などは、ジョブ番号を増加させて原画作業者が再度作業を行う
 *  ジョブ番号の上限は無い
 *  ステージが求めるアセットが完成するまでジョブを重ねてステージを終了させるものとする。
 *
 * ＊＊特殊事例として、「作画キャラクター制」での制作作業では、一般に作画作業者間での頻繁なやり取りが想定される。
 *この場合は素材の引き渡し毎に何度も「（原画）作画」作業が繰り返されることになる。
 *「作画キャラクター制」の場合、キャラクター統一のための作画監督作業は一般に存在しない （アニメーションディレクターとしてのチェックはある）
 *
 *  JobDB =エントリーリスト は、ステージ・カットごとの独立したデータとなる
 *  カットとしての保存位置は、ドキュメントのエントリー記録そのもの
 *  ステージとして参照のための保存は システムの配下にJobコレクションをおいてそこに追記してゆく
 *  各エントリの名称は重複が考えられるので、Jobコレクションにエントリされたアイテム（名称）はステージに対するリレーションを保存する
 *  アイテムエントリは、以下のメソッドで随時行う
 *        nas.Pm.jobNames.addName("Job名" , relStage);
 * 
 * 工程テンプレートの構成は
 * 
 * ラインの出力アセットでステージをフィルタする
 * 
 *     ライン.outputAsset==ステージ.output
 * 
 * 抽出されたステージが入力候補となる
 * 
 * ステージのidでジョブ名をフィルターして
 * そのステージで使用可能なジョブの入力候補を取得する
 * 
 * ジョブ名のDBは単純な名称とリレーションするステージのセットとする
 * ジョブ名,ステージ名,プロパティ(init/primary/check)
 * ジョブ名の'*'は置換予約語でこの記述は、指定ステージ名の名称と同一の名称を用いる
 * ステージidの'*'は、ワイルドカード展開を行いすべてのステージに対して同じジョブを追加する
 * 
 * 
 *     以下は、初期値
 *  
 * nas.Pm.jobNames.addNames([
 * 	["作業開始","*","init"],
 * 	["初期化","*","init"],
 * 	["作打済","*","init"],
 * 	["準備","*","init"],
 * 	["演出チェック","*","check"],
 * 	["監督チェック","*","check"],
 * 	["作監チェック","*","check"],
 * 	["総作監チェック","*","check"],
 * 	["メカ作監チェック","*","check"],
 * 	["美監チェック","bgArt","check"],
 * 	["動画検査","AD","check"],
 * 	["動画検査","ADAD","check"],
 * 	["セル検査","H-pt","check"],
 * 	["彩色検査","PT","check"],
 * 	["トレース検査","H-tr","check"],
 * 	["トレース検査","ADscan","check"],
 * 	["クリンアップ検査","ADcleanup","check"],
 * 	["*作業","*","primary"]
 * ]);
 * 
 * 下は英訳分だけどどうも日本式の役職の英語訳はワカラン　というか　ムチャじゃね？
 * nas.Pm.jobNames.addNames([
 * 	["startup","*","init"],
 * 	["init","*","init"],
 * 	["standby","*","init"],
 * 	["ready","*","init"],
 * 	["Director","*","check"],
 * 	["ChiefDirector","*","check"],
 * 	["AnimationDirector","*","check"],
 * 	["ChiefAnimationDirector","*","check"],
 * 	["","*","check"],
 * 	["ArtDirector","bgArt","check"],
 * 	["AnimationChecker","AD","check"],
 * 	["動画検査","ADAD","check"],
 * 	["セル検査","H-pt","check"],
 * 	["PaintCheck","PT","check"],
 * 	["トレース検査","H-tr","check"],
 * 	["ScanCheck","ADscan","check"],
 * 	["CleanupCheck","ADcleanup","check"],
 * 	["*-job","*","primary"]
 * ]);
 * 
 * テンプレートは、作品ごとの標準工程を示す
 * ユーザの入力時に入力値候補として提示される
 * line(並列)
 * stage(ラインごと順次)
 * job(ステージごとtype別)
 * 
 * line
 *     stage
 *         job
 *         job
 *     stage
 *         job
 *         job
 *         job
 *     stage
 *         job
 *         job
 *         job
 *
 * 3層のデータ構造を持つ
 * ジョブ名は重複が多いので省略表記設定を採用する　targetStageプロパティの値"*"は、ワイルドカードとしてすべてのステージを示す
 *
 * ManagementLine/ManagementStage/ManagementJob
 * 各オブジェクトを初期化するのは実際にエントリを作成するタイミングで
 *
 * eg. JSON
 *
 *[
 *     {
 *         "jobName":"作業開始",
 *         "targetStage":"*",
 *         "jobType":"init"
 *     }
 *]
 *
 * eg. dump 改行区切り　位置依存　配列ダンプデータ [jobName,targetStage,jobType]
 *
 *["作業開始","*","init"]
 *
 * eg. palain-text
 *
 *作業開始
 *	targetStage:*
 *	jobType:init
 * 
 *  *</pre>
 */
nas.Pm.jobNames.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.jobNames.parseConfig('\n作業開始\n	targetStage:*\n	jobType:init\n初期化\n	targetStage:*\n	jobType:init\n作打済\n	targetStage:*\n	jobType:init\n準備\n	targetStage:*\n	jobType:init\n*打合せ\n	targetStage:*\n	jobType:init\n*発注\n	targetStage:*\n	jobType:init\n作画打合せ\n	targetStage:LO\n	jobType:init\n作画打合せ\n	targetStage:KD\n	jobType:init\n作画打合せ\n	targetStage:1G\n	jobType:init\n作画打合せ\n	targetStage:2G\n	jobType:init\n*\n	targetStage:*\n	jobType:primary\n*作業\n	targetStage:*\n	jobType:primary\n演出チェック\n	targetStage:*\n	jobType:check\n監督チェック\n	targetStage:*\n	jobType:check\n作監チェック\n	targetStage:*\n	jobType:check\n総作監チェック\n	targetStage:*\n	jobType:check\nメカ作監チェック\n	targetStage:*\n	jobType:check\n美監チェック\n	targetStage:bgArt\n	jobType:check\n動画検査\n	targetStage:AD\n	jobType:check\n動画検査\n	targetStage:ADAD\n	jobType:check\nセル検査\n	targetStage:H-pt\n	jobType:check\n彩色検査\n	targetStage:PT\n	jobType:check\nトレース検査\n	targetStage:H-tr\n	jobType:check\nトレース検査\n	targetStage:ADscan\n	jobType:check\nクリンアップ検査\n	targetStage:ADcleanup\n	jobType:check\n')
/*
以下はサンプルデータ
*/

/*<pre>
 * メディアDB
 * 制作に使用するメディア情報DB メディアに関する詳細は別紙
 *
 * mediaName               :名称　識別名
 * ID                      :リレーションID　登録順連番整数　DB接続時に再解決する
 * animationField          :作画時の標準フィールドのリンク又は識別名称　主に画面縦横比（画郭）を指定するための要素
 * baseResolution          :基本的な画像解像度（走査線密度==縦方向解像度）String　単位付き文字列で
 * mediaType               :メディアタイプキーワード string　"drawing"=="input"||"intermediate"||"video"=="movie"=="output"
 * tcType                  :タイムコードタイプ   frames,trag-JA,SMPTE,SMPTE-drop,page-Frames,page-SK　等の文字列で指定？
 * pegForm                 :タップの型式         invisible|ACME|jis2hales|us3hales ビデオ等のタップと無関係のデータはinvisible　　
 * pixelAspect             :ピクセル縦横比　縦方向を１として対する横方向の比率を浮動小数点数値で
 * description             :コメントテキスト
 * 
 * eg. JSON
 * 
 *{
 *     "作画フレーム300ppi":{
 *         "mediaName":"作画フレーム300ppi",
 *         "id":"0000",
 *         "animationField":"12in-HDTV",
 *         "baseResolution":"300 ppi",
 *         "mediaType":"input",
 *         "tcType":"SMPTE",
 *         "pegForm":"ACME","pixelAspect":1,
 *         "description":"参考用作画フレーム"
 *     }
 *}
 * 
 * eg. dump 改行区切り　位置依存　配列ダンプデータ
 * mediaName,[id,animationField,baseResolution,mediaType,tcType,pegForm,pixelAspect,description]
 * 
 *"作画フレーム300ppi",["0000","12in-HDTV","300 ppi",null,"SMPTE","ACME",1,"参考用作画フレーム"]
 * 
 * eg. palain-text
 * 
 *作画フレーム300ppi
 *	id:0000
 *	animationField:12in-HDTV
 *	baseResolution:300ppi
 *	mediaType:drawing
 *	tcType:SMPTE
 *	pegForm:ACME
 *	pixelAspect:1
 *	description:参考用作画フレーム
 *
 *</pre>
 */
nas.Pm.medias.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.medias.parseConfig('\n作画フレーム300ppi\n	id:0000\n	animationField:12in-HDTV\n	baseResolution:300ppi\n	mediaType:drawing\n	tcType:SMPTE\n	pegForm:ACME\n	pixelAspect:1\n	description:参考用作画フレーム\n作画フレーム200ppi\n	id:0001\n	animationField:10in-HDTV\n	baseResolution:200ppi\n	mediaType:drawing\n	tcType:trad-JA\n	pegForm:ACME\n	pixelAspect:1\n	description:参考用作画フレーム\n作画フレーム192ppi\n	id:0002\n	animationField:10in-HDTV\n	baseResolution:192ppi\n	mediaType:drawing\n	tcType:trad-JA\n	pegForm:ACME\n	pixelAspect:1\n	description:参考用作画フレーム\nHDTV-720p\n	id:0003\n	animationField:HDTVA\n	baseResolution:128ppi\n	mediaType:movie\n	tcType:SMPTE-drop\n	pegForm:invisible\n	pixelAspect:1\n	description:HDTV省力原版\nHDTV-1080p\n	id:0004\n	animationField:HDTVA\n	baseResolution:192ppi\n	mediaType:movie\n	tcType:SMPTE\n	pegForm:invisible\n	pixelAspect:1\n	description:HDTV\nHDTV-2160p\n	id:0005\n	animationField:HDTVA\n	baseResolution:384ppi\n	mediaType:movie\n	tcType:SMPTE\n	pegForm:invisible\n	pixelAspect:1\n	description:4KUHDTV\n');

/**<pre>
 * タイトルDB
 *
 * projectName     :作品識別キー
 * id              :インデックス unique
 * fullName        :作品の正式名称
 * shortName       :省略名
 * code            :短縮コード
 * framerate       :フレームレート
 * format          :定尺
 * namingStyle     :ショット番号付けスタイル 'serial|loop' (productへ継承)
 * namingPrefix    :ショット番号付け　プレフィクス文字列指定 s-c|c|c#|s#-c# (productへ継承)
 * inputMedia      :標準入力（作画）仕様メディア
 * optputMedia     :出力メディア仕様
 *
 *
 * ショット番号付けスタイル
 * serial  カット番号を作品内で通しの連番号で扱う（デフォルト）
 * loop    シーンごとに１番からの連番にリセットする
 * シーン-カット番号のプレフィクス文字列
 * s-|s#- が存在すれば、シーン表示あり(シーンの値がカラでもプレフィクスだけ表示する) 
 * sプレフィックスが存在しない場合は、シーン表示なし　かつ自動的にスタイルがserialになる（上書き）
 * デフォルトは 's-c'
 *
 *このタイトル分類と同内容のデータがDBとの通信で扱われる
 *各アプリケーションのタイトルDBをこの形式に統一
 *  タイトルごとの製作工程テンプレートが必要
 *     テンプレートの作成用UIをサーバ上に構築
 *     タイトルの付随情報としてテンプレートオブジェクトを持たせる
 *     テンプレートオブジェクトを介して nas.PmのDBオブジェクトをアクセスする
 *     テンプレートにないアイテムも使用可能
 *
 * eg. JSON
 *
 *{
 *     "TVshowSample":{
 *         "projectName":"TVshowSample",
 *         "id":"0000",
 *         "fullName":"名称未設定",
 *         "shortName":"未定",
 *         "code":"_UN",
 *         "framerate":"24FPS",
 *         "format":"21:00:00 .",
 *         "namingStyle":"",
 *         "inputMedia":"10in-HDTV",
 *         "outputMedia":"HDTV-720p"
 *     }
 *}
 * eg. dump 改行区切り　位置依存　配列ダンプデータ projectName,[id,fullName ,shortName,code,framerate,format,inputMedia,optputMedia]
 * 
 * 
 *"TVshowSample",["0000","名称未設定","未定","_UN","24FPS","21:00:00 .","10in-HDTV","HDTV-720p"]
 * 
 * eg. palain-text
 *
 *TVshowSample
 *	id:0000
 *	fullName:名称未設定
 *	shortName:未定
 *	code:_UN
 *	framerate:24FPS
 *	format:21:00:00 .
 *	inputMedia:10in-HDTV
 *	outputMedia:HDTV-720p
 *
 *</pre>
 */
nas.Pm.workTitles.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.workTitles.parseConfig('\nTVshowSample\n	id:0000\n	fullName:名称未設定\n	shortName:未定\n	code:_UN\n	framerate:24FPS\n	format:21:00:00 .\n	inputMedia:10in-HDTV\n	outputMedia:HDTV-720p\nkachi\n	id:0001\n	fullName:かちかちやま\n	shortName:か\n	code:_KT\n	framerate:24FPS\n	format:20:12:00 .\n	inputMedia:10in-HDTV\n	outputMedia:HDTV-720p\nMomotaro\n	id:0002\n	fullName:ももたろう\n	shortName:も\n	code:_MT\n	framerate:24FPS\n	format:19:21:00 .\n	inputMedia:10in-HDTV\n	outputMedia:HDTV-720p\nUrashima\n	id:0003\n	fullName:うらしまたろう\n	shortName:う\n	code:_UR\n	framerate:24FPS\n	format:24:08:12 .\n	inputMedia:12in-HDTV\n	outputMedia:HDTV-1080p\n')
/*<pre>
 *  プロダクション（opes|episode）DB
 *  制作管理単位（カット|カット袋）が直接所属する制作単位。　制作話数に相当する
 * 
 * productName :プロダクション名　呼び出しキー　英数字　unique　"_(アンダーバー)"で開始　キャメル記法を推奨
 * id          :識別用ID unique　指定のない場合は正の整数でセッションユニークなIDが割り当てられる
 * name        :プロダクション名称　制作話数としての利用が多いため数字のみの名称が認められる
 * subTitle    :サブタイトル　制作単位の補助情報
 * title       :制作単位が所属する作品　作品のキーワードで指定
 * 
 * eg. JSON
 * 
 *{
 *    "_UN_01":{
 *        "productName":"_UN_01",
 *        "id":"0000",
 *        "name":"01",
 *        "subTitle":"未定",
 *        "title":"TVshowSample"
 *    }
 *{
 * 
 * eg. dump 改行区切り　位置依存　配列ダンプデータ　productName[productName,id,name,subTitle,title]
 * 
 *"_UN_01",["_UN_01","0000","01","未定","TVshowSample"]
 * 
 * eg. palain-text
 * 
 *_UN_01
 *	id:0000
 *	name:01
 *	subTitle:未定
 *	title:TVshowSample
 *
 *
 *</pre>
 */
nas.Pm.products.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.products.parseConfig('\n_UN_01\n	id:0000\n	name:01\n	subTitle:未定\n	title:TVshowSample\n_UN_02\n	id:0001\n	name:02\n	subTitle:未定\n	title:TVshowSample\n_UN_03\n	id:0002\n	name:03\n	subTitle:未定\n	title:TVshowSample\n_UN_04\n	id:0003\n	name:04\n	subTitle:未定\n	title:TVshowSample\n_KT_01\n	id:0004\n	name:01\n	subTitle:ひので\n	title:kachi\n_KT_02\n	id:0005\n	name:2\n	subTitle:やまのかげ\n	title:kachi\n_KT_03\n	id:0006\n	name:3\n	subTitle:いただき\n	title:kachi\n_KT_04\n	id:0007\n	name:4\n	subTitle:やますそ\n	title:kachi\n_KT_05\n	id:0008\n	name:05\n	subTitle:うつせみ\n	title:kachi\n_KT_06\n	id:0009\n	name:06\n	subTitle:はまべ\n	title:kachi\n');
/*
割当管理テーブル allocations

業務担当割当を行うデータを複数記録する

一件ごとのレコードは以下の構造

{
	staff		:<スタッフ記述>,
	allocation	:[<割当記述>,...]
}

スタッフ記述は <名称文字列>で記述
	DB内に存在しない記述の場合は当該のリストエントリが無視される
割当記述は<アセット名>:[<範囲記述>]
	
割当リストのアイテムは
カット識別子|アセット記述｜
	
//	JSON
var A = JSON.parse('
[
	{
		"staff"		:"演出部",
		"allocation"	:[
			{"asset":"全アセット"	,"list":["*"]}
		]
	},
	{
		"staff"		:"作画部",
		"allocation"	:[
			{"asset":"レイアウト"	,"list":["*"]},
			{"asset":"原画"		,"list":["*"]},
			{"asset":"動画"		,"list":["*"]},
			{"asset":"cell"		,"list":["*"]}
		]
	},
	{
		"staff"		:"太郎:taro@example.com",
		"allocation"	:[
			{"asset":"レイアウト"	,"list":["31-58","123"]},
			{"asset":"原画"		,"list":["31-58","123"]},
			{"asset":"動画"		,"list":["31-58","123"]},
			{"asset":"cell"		,"list":["31-58","123"]}
		]
	}
]
')
//	dump
[演出部,[[*,[*]]]]
[作画部,[[レイアウト,[*]],[原画,[*]],[動画,[*]],[cell,[*]]]]
[太郎:taro@example.com,[[レイアウト,[31-58,123]],[原画,[31-58,123]],[動画,[31-58,123]],[cell,[31-58,123]]]]

//	text
演出部
	*	*
作画部
	レイアウト	*
	原画	*
	動画	*
	cell	*
太郎:taro@example.com
	レイアウト	31-58,123
	原画	31-58,123
	動画	31-58,123
	cell	31-58,123

*/

/*
nas.Pm.allocations.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.allocations.parseConfig('
制作管理部
	*	*
演出部
	*	*
文芸部      
*作画*
    LO  *
    原画  *
ねこ:cat@animal.example.com
	    1-10,13-34
');
nas.Pm.allocations.parseConfig('
[制作管理部,[[*,*]]]
[演出部,[[*,*]]]
[文芸部,[[*,-]]]
[*作画*,[[LO,*],[原画,*]]]
[ねこ:cat@animal.example.com,[[原画,[1-10,13-34]]]]
');
*/
///* endof data */