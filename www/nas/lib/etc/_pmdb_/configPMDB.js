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
nas.Pm.configurations.parseConfig(`{
     "sceneUse":"false",
     "shotNumberUnique":"true",
     "sheetBaseColor":"#ffeeff",
     "receiptBaseColor":"#ffffee",
     "storyBoardStyle":{
         "documentDir":"vertical",
         "columnOrder":["index","picture","dialog","description","timeText"],
         "pageControl":false,
         "pageDir":"ttb",
         "pageSize":"A4"
      }
}`);
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
nas.Pm.organizations.parseConfig(`
undefined
	fullName:未設定
	code:udf
	id:0000
	serviceUrl:file://
	shortName:undef
	contact:管理ユーザ:administrator@u-at.net
	description:未設定状態の初期エントリ
nekomataya
	fullName:ねこまたや
	code:nkm
	id:0001
	serviceUrl:localRepository:info.nekomataya.pmdb
	shortName:(ね)
	contact:ねこまたや:kiyo@nekomataya.info
	description:ねこまたや:kiyo@nekomataya.info
sampleTeam
	fullName:SmapleDataRepository K.K
	code:smpl
	id:0003
	serviceUrl:https://u-at.net/~
	shortName:spl
	contact:contact:contact@sample.example.com
	description:組織サンプル
sampleTeam2
	fullName:Smaple2DataRepository K.K
	code:spl2
	id:0004
	serviceUrl:https://u-at.net/x~
	shortName:sample2
	contact:contact:contact@sample.example.com
	description:組織サンプル
`);
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
nas.Pm.staff.parseConfig(`
	制作管理
		プロデューサ
		統括デスク
		デスク
		制作進行
	演出
		監督
		演出
		演出助手
	文芸
		脚本
		設定制作
		デザイナー
		キャラ設定
		美術設定
		小物設定
		色彩設計
	作画
		総作画監督
		作画監督
		作画監督補
		メカ作画監督
		メカ作画監督補
		原画
		第一原画
		第二原画
		動画検査
		動画監督
		動画
	美術
		美術監督
		美術監督補佐
		原図整理
		背景
	仕上
		色指定
		トレース
		ペイント
		特殊効果
	撮影
		撮影監督
		撮影
		撮影助手
	3D
	無所属
		＊
	オブザーバ
		オブザーバ
		時代考証
`);
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
nas.Pm.assets.parseConfig(`
UNDEFINED
	name:(UNDEFINED)
	hasXPS:false
	code:(UDF)
	shortName:(UNDEF)
	description:未定義ステージのための未定義アセット
	endNode:false
	callStage:undefined
EXTRA
	name:(一般アセット)
	hasXPS:false
	code:NULL
	shortName:EXTRA
	description:カットナンバーを与えられない素材に対するアセット
	endNode:true
	callStage:
ALL
	name:(全アセット)
	hasXPS:true
	code:_ALL
	shortName:ALL
	description:便宜的に設けられる総合アセット
	endNode:true
	callStage:
COMPOSITE
	name:[COMPOSITE]
	hasXPS:true
	code:[COMP]
	shortName:(撮影)
	description:コンポジットアセット
	endNode:true
	callStage:
cComposite
	name:[cComposite]
	hasXPS:true
	code:[REF]
	shortName:[線撮]
	description:リファレンスコンポジットアセット
	endNode:false
	callStage:
SCInfo
	name:コンテチップ
	hasXPS:true
	code:SCI
	shortName:コンテ
	description:絵コンテから得られるカット制作情報
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
leica
	name:プリビズ
	hasXPS:true
	code:prev
	shortName:プリビズ
	description:ライカリール｜プリビジュアライゼーションビデオ作成のための素材
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
draft
	name:ラフスケッチ
	hasXPS:true
	code:DRFT
	shortName:ラフ
	description:ショット作成のためのラフスケッチ
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
pLayout
	name:3Dレイアウト
	hasXPS:false
	code:3DLO
	shortName:LO3D
	description:レイアウト作業のための補助素材
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
layout
	name:レイアウト
	hasXPS:true
	code:LO
	shortName:LO
	description:アニメーション作成のためのレイアウト
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing,layoutProof,layoutA-D,keydrawing,2ndKeydrawing
keyAnimation
	name:原画
	hasXPS:true
	code:GE
	shortName:原
	description:アニメーション線画作成のためのキーアニメーション
	endNode:false
	callStage:KDA-D,2ndKdA-D,checkKD,preProofAD,AD
AnimationDrawing
	name:動画
	hasXPS:true
	code:DOU
	shortName:動
	description:アニメーション線画
	endNode:false
	callStage:ADA-D,proofAD,A-D,ADscan,ADcleanUp,HMechanicalTrace
cell
	name:セル
	hasXPS:true
	code:CELL
	shortName:仕
	description:彩色済みアニメーション線画
	endNode:true
	callStage:AdcleanUp,paint,proofPaint,retouchCell
characterDesign
	name:キャラクター設定
	hasXPS:false
	code:chrD
	shortName:キャラ
	description:アニメーション作画のためのキャラクターデザイン
	endNode:true
	callStage:undefined
propDesign
	name:プロップ設定
	hasXPS:false
	code:prpD
	shortName:プロップ
	description:アニメーション作画のためのプロップデザイン
	endNode:true
	callStage:
BGDesign
	name:美術設定
	hasXPS:false
	code:bgaD
	shortName:美設
	description:アニメーション作画のための美術デザイン
	endNode:true
	callStage:
referenceSheet
	name:参考設定
	hasXPS:false
	code:refD
	shortName:参考
	description:アニメーション作画のための参考デザイン
	endNode:true
	callStage:
colorDesign
	name:色彩設計
	hasXPS:false
	code:colD
	shortName:色設
	description:アニメーション作画のための色彩デザイン
	endNode:true
	callStage:
colorCoordiante
	name:色指定
	hasXPS:true
	code:colC
	shortName:指定
	description:アニメーション作画のための色彩コーディネーション
	endNode:true
	callStage:
backgroundArt
	name:背景
	hasXPS:true
	code:_BGA
	shortName:背景
	description:背景美術
	endNode:true
	callStage:
animation3D
	name:3Dアニメーション
	hasXPS:true
	code:3DCG
	shortName:3D
	description:３Dアニメーションアセット
	endNode:true
	callStage:
cast3D
	name:3Dアニメーション
	hasXPS:true
	code:3DCC
	shortName:3D
	description:３Dアニメーションアセット
	endNode:true
	callStage:
model3D
	name:モデル
	hasXPS:false
	code:mod3
	shortName:mod
	description:3Dアニメーションモデル
	endNode:false
	callStage:
rig3D
	name:リグ
	hasXPS:false
	code:rig3
	shortName:rig
	description:3Dアニメーションリグ
	endNode:false
	callStage:
material3D
	name:マテリアル
	hasXPS:false
	code:mtl3
	shortName:mat
	description:3Dアニメーションマテリアル設定
	endNode:false
	callStage:
animation3D
	name:アニメーション
	hasXPS:true
	code:anm3
	shortName:anim
	description:3Dアニメーション
	endNode:false
	callStage:
set3D
	name:セット
	hasXPS:false
	code:set3
	shortName:set
	description:3Dアニメーションステージセット
	endNode:false
	callStage:
lighting3D
	name:ライティング
	hasXPS:true
	code:lgt3
	shortName:lgt
	description:3Dアニメーションライト
	endNode:false
	callStage:
camera3D
	name:カメラ
	hasXPS:true
	code:cam3
	shortName:cam3D
	description:3Dアニメーションステージコンポジット
	endNode:false
	callStage:
sfx3D
	name:SFX
	hasXPS:true
	code:sfx3
	shortName:sfx3D
	description:
	endNode:false
	callStage:
`)

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
nas.Pm.stages.parseConfig(`
undefined
	name:未定義
	code:UNDF
	shortName:(undefined)
	description:未定義ステージ 制作預りとして扱う。基本的にアセットストアへの編入を指す
	output:(UNDEFINED)
startup
	name:初期化
	code:startup
	shortName:開始
	description:初期化ステージ 制作預りとして扱う。制作開始前処理
	output:SCInfo
characterDesign
	name:キャラクターデザイン
	code:chrD
	shortName:キャラデ
	description:プロダクション管理デザイン（各話発注デザイン）＊メインデザインは別管理
	output:characterDesign
propDesign
	name:プロップデザイン
	code:prpD
	shortName:プロップ
	description:プロダクション管理デザイン（各話発注デザイン）
	output:propDesign
colorDesign
	name:色彩設計
	code:colD
	shortName:色彩設計
	description:カラーデザイン（基本色彩設計）
	output:colorDesign
colorModel
	name:色彩設計カラーモデル
	code:coMD
	shortName:色彩設計M
	description:カラーモデル（パレット）型基本色彩設計(animo toonz等)
	output:colorDesign
colorCoordination
	name:色指定
	code:iro
	shortName:色指定
	description:カット別彩色指定データ
	output:colorDesign
composite
	name:合成
	code:Comp
	shortName:撮影
	description:コンポジットステージ
	output:(COMPOSITE)
coComposite
	name:参照合成
	code:cComp
	shortName:線撮
	description:参考データコンポジット
	output:(cCOMPOSITE)
coordinationModel
	name:色指定カラーモデル
	code:ccM
	shortName:色指定M
	description:カラーモデル（パレット）型カット別彩色指定データ(animo toonz等)
	output:colorDesign
bgDesign
	name:美術設定
	code:artD
	shortName:美設
	description:プロダクション内デザインワーク
	output:BGDsign
SCInfo
	name:コンテチップ
	code:_SCI
	shortName:コンテチップ
	description:絵コンテを分解してシーンをプロジェクトデータ化したものイニシャルデータなのでこれを出力する同名ステージは無い
	output:SCInfo
leica
	name:ライカ
	code:leica
	shortName:ライカ
	description:タイミングを構成したモーションラフ
	output:draft
contChip
	name:絵コンテ撮
	code:cntC
	shortName:コンテ撮
	description:コンテチップを構成したモーションラフ
	output:draft
animatic
	name:プリビジュアライゼーション
	code:__pv
	shortName:PV
	description:同上
	output:layout
roughSketch
	name:ラフ原画
	code:drft
	shortName:ラフ原
	description:同上
	output:draft
pLayout
	name:3Dレイアウト
	code:LO3D
	shortName:3DLO
	description:レイアウト参考
	output:pLayout
layout
	name:レイアウト
	code:LO
	shortName:LO
	description:レイアウト上がり(原図あり)
	output:layout
LayoutAD
	name:LOスキャン
	code:LOcvt
	shortName:レイアウトcvt
	description:layout to Data レイアウトをデータ化したもの
	output:layout
keydrawing
	name:原画
	code:GEN
	shortName:原
	description:原画上がり作画監督修正含む keyDrawing
	output:keyAnimation
KDAD
	name:原画cvt
	code:Gcvt
	shortName:原画cvt
	description:keyAnimation to Data 原画のデータ化
	output:keyAnimation
sndKeydrawing
	name:第二原画
	code:2G
	shortName:二原
	description:第一原画を原画としてフィニッシュしたもの
	output:keyAnimation
sndKdAD
	name:第二原画cvt
	code:2G-D
	shortName:二原cvt
	description:第二原画は原画相当
	output:keyAnimation
checkKD
	name:原画作監修正
	code:KD+
	shortName:作監
	description:上がりは原画として扱う
	output:keyAnimation
preProofAD
	name:発注前動画検査
	code:2G+
	shortName:前動検
	description:実質上の第三原画又は第二原画修正
	output:keyAnimation
BGOrderMeeting
	name:BG打合せ
	code:BGOM
	shortName:BG打ち
	description:グロス発注のための打合せステージ。素材の変更なし
	output:layout
layoutProof
	name:美術原図整理
	code:BGLP
	shortName:原図整理
	description:レイアウト原図を整理加筆してFIXしたもの
	output:backgroundArt
layoutAD
	name:背景原図スキャン
	code:LP-D
	shortName:原図スキャン
	description:
	output:backgroundArt
bgArt
	name:背景美術
	code:BG
	shortName:背景
	description:完成背景美術
	output:backgroundArt
chaeckBgArt
	name:美術検査
	code:BG+
	shortName:美監検査
	description:
	output:backgroundArt
BgArtAD
	name:美術cvt
	code:BG-D
	shortName:背景スキャン
	description:
	output:backgroundArt
AD
	name:動画
	code:AD
	shortName:動
	description:動画上がり animationDrawing
	output:AnimationDrawing
ADAD
	name:動画cvt
	code:AD/D
	shortName:動画cvt
	description:animation to Data 動画をデータ化したもの
	output:AnimationDrawing
proofAD
	name:動画検査
	code:AD+
	shortName:動検
	description:上がりは動画 動画検査をステージ扱いする場合に使用
	output:AnimationDrawing
ADscan
	name:スキャン
	code:AD-D
	shortName:スキャン
	description:彩色データ作成のためのデジタイズ処理・半製品ペイントデータ
	output:cell
ADcleanUp
	name:動画クリンアップ
	code:ADCL
	shortName:Adcleanup
	description:デジタイズされた動画をクリンアップする作業(これをトレースと呼ぶソフトもある)
	output:cell
paint
	name:彩色
	code:PT
	shortName:PAINT
	description:ソフトウェア作業によるセル彩色
	output:cell
proofPaint
	name:彩色検査
	code:PT+
	shortName:セル検
	description:彩色済みデータ
	output:cell
retouchCell
	name:セル特効
	code:PTfx
	shortName:特効
	description:加工済みデータ
	output:cell
HMechanicalTrace
	name:マシントレース
	code:H-mt
	shortName:M-trace
	description:動画をセルに機械転写したもの(古い形式のデータを記述するためのエントリ)
	output:cell
Htrace
	name:ペイント
	code:H-pt
	shortName:彩色
	description:セル時代の作業を記録するためのエントリ
	output:cell
HcolorTrace
	name:色トレス
	code:H-ct
	shortName:色T
	description:セル時代の作業を記録するためのエントリ
	output:cell
HproofPaint
	name:セル検査
	code:H-pp
	shortName:セル検
	description:セル時代の作業を記録するためのエントリ
	output:cell
HretouchCell
	name:エアブラシ特効
	code:H-fx
	shortName:エアブラシ
	description:セル時代の作業を記録するためのエントリ
	output:cell
composite
	name:コンポジット
	code:COMP
	shortName:撮影
	description:コンポジット工程をプロダクションに入れるべきか否かは結構悩む 制作工程上終端なので出力は無し 終了シンボルを作るか？
	output:ALL
preCompositCheck
	name:撮出し検査
	code:PCCk
	shortName:撮出し
	description:撮影前全検査(古い工程を記述するためのエントリ)
	output:ALL
generalDirectorCheck
	name:監督チェック
	code:GDCk
	shortName:監督チェック
	description:監督による作業検査
	output:ALL
directorCheck
	name:演出チェック
	code:DcCk
	shortName:演出チェック
	description:担当演出による作業検査
	output:ALL

# 以下の複合ステージを追加する
# 海外発注等の一括作業のため本来工程として扱っていたものを複合された１工程として扱う
# ステージ内では新規ステージを初期化する手間を省き、全て連続したジョブとして制作を進める
# ステージの成果物は最終的な成果物をターゲットアセットとする。
#
#    仕上(スキャン、トレース、ペイント等をステージ内ジョブとして持つ複合ステージ)
#    動仕(上記の他に動画を含む複合ステージ)
#    原動仕(上記に更に原画を加えたもの)
#    二原動仕(上記の原画が第二原画であるもの)
#
# 制作担当者によるステージの切り替えが自動化された場合は、これらの複合ステージを利用せず、外注先でもUATをそのまま利用してもらうことが望ましい。

TP
	name:仕上
	code:T&P
	shortName:仕上
	description:仕上一括(複合)
	output:cell
ATP
	name:動仕
	code:AT&P
	shortName:動画仕上
	description:動画仕上一括(複合)
	output:cell
KATP
	name:原動仕
	code:KAT&P
	shortName:原動仕
	description:原画動画仕上一括(複合)
	output:cell
sKATP
	name:二原動仕
	code:sKAT&P
	shortName:二原動仕
	description:二原動画仕上一括(複合)
	output:cell
`);

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
nas.Pm.lines.timestamp = new Date('2019.10.01 00:00:00').getTime();
nas.Pm.lines.parseConfig(`
trunk
	name:本線
	shortName:本線
	outoputAsset:セル
	initAsset:コンテチップ
	code:cell
	description:管理本線となるセルライン
colorCoordiante
	name:色指定
	shortName:指定
	outoputAsset:色指定
	initAsset:レイアウト
	code:__cc
	description:色指定
backgroundArt
	name:背景美術
	shortName:背景
	outoputAsset:背景
	initAsset:レイアウト
	code:bg__
	description:美術作業
3Dcgi
	name:3D-CGI
	shortName:3D
	outoputAsset:animation3D
	initAsset:レイアウト
	code:3dcg
	description:総合的3D-CGI
cast3D
	name:3Dアニメーション
	shortName:3D
	outoputAsset:cast3D
	initAsset:コンテチップ
	code:__3D
	description:3Dアニメーションキャスト
characterDesign
	name:キャラクター設定
	shortName:キャラ設
	outoputAsset:キャラクター設定
	initAsset:（空アセット）
	code:cd
	description:キャラクター設定
propDesign
	name:プロップ設定
	shortName:プロップ
	outoputAsset:プロップ設定
	initAsset:（空アセット）
	code:_prp
	description:プロップ設定
BGDesign
	name:美術設定
	shortName:美設
	outoputAsset:美術設定
	initAsset:（空アセット）
	code:_bga
	description:美術設定作業
colorDesign
	name:色彩設計
	shortName:色設計
	outoputAsset:色彩設計
	initAsset:（空アセット）
	code:colD
	description:色彩設計
composite
	name:コンポジット
	shortName:撮影
	outoputAsset:（全アセット）
	initAsset:（全アセット）
	code:comp
	description:撮影
ALL
	name:(全素材)
	shortName:全
	outoputAsset:（全アセット）
	initAsset:（全アセット）
	code:_all
	description:カット情報を持って一時的に集積されるライン
null
	name:(未設定)
	shortName:(未)
	outoputAsset:（空アセット）
	initAsset:（空アセット）
	code:null
	description:初期化前のオブジェクトに設定するダミーライン
`)
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
nas.Pm.pmTemplates.timestamp = new Date('2021.02.20 20:00:00').getTime();
nas.Pm.pmTemplates.parseConfig(`
本線
	stages:絵コンテ撮,レイアウト,原画,動画,セルコンバート,彩色,セル特効
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
色指定
	stages:色指定
	summary:色指定.色指定
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出
3D-CGI
	stages:モデル,リグ,マテリアル,アニメーション,セット,ライティング,カメラ,SFX
	summary:監督.モデル,作監.モデル,監督.アニメーション,作監.アニメーション,監督.カメラ,監督.SFX
撮影
	stages:絵コンテ撮,本撮
`);

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
            :書式は　集計タイプ、集計項目、ステージのキーワードを".(ドット)"で連結した文字列type.jobName.stage
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


nas.Pm.pmWorkflows.timestamp = new Date('2020.07.11 00:00:00').getTime();
nas.Pm.pmWorkflows.parseConfig(`
workflow:UATSample
本線
	stages:絵コンテ撮,レイアウト,原画,動画,セルコンバート,彩色,セル特効
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
色指定
	stages:色指定
	summary:色指定.色指定
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
	stages:絵コンテ撮,レイアウト,原画,動画,スキャン,彩色,セル特効
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
色指定
	stages:色指定
	summary:色指定.色指定
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出
3D-CGI
	stages:モデル,リグ,マテリアル,アニメーション,セット,ライティング,カメラ,SFX
	summary:監督.モデル,作監.モデル,監督.アニメーション,作監.アニメーション,監督.カメラ,監督.SFX
撮影
	stages:絵コンテ撮,本撮

workflow:UATSample3
本線
	stages:絵コンテ撮,レイアウト,原画,動画,マシントレース,色トレス,彩色,セル特効
	summary:演出.原画,作画監督.原画,総作画監督.原画,動画検査.動画,彩色検査.彩色
	aggregate:sciTime.*.レイアウト,sciCount.*.レイアウト,timelineMember.*.動画,timelineMember.*.彩色,xmapMember.primary.動画,xmapMember.primary.彩色
色指定
	stages:色指定
	summary:色指定.色指定
背景美術
	stages:美術原図整理,背景美術,美術検査
	summary:美術監督.原図,メカ作監.原画,総メカ作監.原画,前動検.原画,監督.撮出
撮影
	stages:絵コンテ撮,本撮
`);// */
//JSON
/*
nas.Pm.pmWorkflows.parseConfig('[{"name":"UATSample","members":[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"3D-CGI","stages":[""],"summary":["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]},{"name":"UATSample2","members":[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","スキャン","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"3D-CGI","stages":[""],"summary":["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]},{"name":"UATSample3","members":[{"line":"本線","stages":["絵コンテ撮","レイアウト","原画","動画","マシントレース","色トレス","彩色","セル特効"],"summary":["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],"aggregate":["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]},{"line":"色指定","stages":["色指定"],"summary":["色指定.色指定"]},{"line":"背景美術","stages":["美術原図整理","背景美術","美術検査"],"summary":["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]},{"line":"コンポジット","stages":["絵コンテ撮"]}]}]');// */
//dump
/*
nas.Pm.pmWorkflows.parseConfig(`["UATSample",[["本線",["絵コンテ撮","レイアウト","原画","動画","彩色","セル特効"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]],["色指定",["色指定"],["色指定.色指定"]],["背景美術",["美術原図整理","背景美術","美術検査"],["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]],["3D-CGI",[""],["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]],["コンポジット",["絵コンテ撮"]]]]
["UATSample2",[["本線",["絵コンテ撮","レイアウト","原画","動画","スキャン","彩色","セル特効"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]],["色指定",["色指定"],["色指定.色指定"]],["背景美術",["美術原図整理","背景美術","美術検査"],["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]],["3D-CGI",[""],["監督.モデル","作監.モデル","監督.アニメーション","作監.アニメーション","監督.カメラ","監督.SFX"]],["コンポジット",["絵コンテ撮"]]]]
["UATSample3",[["本線",["絵コンテ撮","レイアウト","原画","動画","マシントレース","色トレス","彩色","セル特効"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","彩色検査.彩色"],["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]],["色指定",["色指定"],["色指定.色指定"]],["背景美術",["美術原図整理","背景美術","美術検査"],["美術監督.原図","メカ作監.原画","総メカ作監.原画","前動検.原画","監督.撮出"]],["コンポジット",["絵コンテ撮"]]]]`);// */
/*
 //１ライン配列ダンプ
["UATSample",[["本線",["絵コンテ撮","レイアウト","原画","第一原画","第二原画","発注前動画検査","動画","色指定","スキャン","色トレス","セル特効","撮出し検査"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","色指定.色指定","彩色検査.彩色"],["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]],["本線B",["絵コンテ撮","レイアウト","原画","第一原画","第二原画","発注前動画検査","動画","色指定","スキャン","色トレス","セル特効","撮出し検査"],["演出.原画","作画監督.原画","総作画監督.原画","動画検査.動画","色指定.色指定","彩色検査.彩色"],["sciTime.*.レイアウト","sciCount.*.レイアウト","timelineMember.*.動画","timelineMember.*.彩色","xmapMember.primary.動画","xmapMember.primary.彩色"]]]]
*/


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
nas.Pm.jobNames.parseConfig(`
作業開始
	targetStage:*
	jobType:init
初期化
	targetStage:*
	jobType:init
作打済
	targetStage:*
	jobType:init
準備
	targetStage:*
	jobType:init
*打合せ
	targetStage:*
	jobType:init
*発注
	targetStage:*
	jobType:init
作画打合せ
	targetStage:LO
	jobType:init
作画打合せ
	targetStage:KD
	jobType:init
作画打合せ
	targetStage:1G
	jobType:init
作画打合せ
	targetStage:2G
	jobType:init
*
	targetStage:*
	jobType:primary
*作業
	targetStage:*
	jobType:primary
演出チェック
	targetStage:*
	jobType:check
監督チェック
	targetStage:*
	jobType:check
作監チェック
	targetStage:*
	jobType:check
総作監チェック
	targetStage:*
	jobType:check
メカ作監チェック
	targetStage:*
	jobType:check
美監チェック
	targetStage:bgArt
	jobType:check
動画検査
	targetStage:AD
	jobType:check
動画検査
	targetStage:ADAD
	jobType:check
セル検査
	targetStage:H-pt
	jobType:check
彩色検査
	targetStage:PT
	jobType:check
トレース検査
	targetStage:H-tr
	jobType:check
トレース検査
	targetStage:ADscan
	jobType:check
クリンアップ検査
	targetStage:ADcleanup
	jobType:check
`)
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
nas.Pm.medias.parseConfig(`
作画フレーム300ppi
	id:0000
	animationField:12in-HDTV
	baseResolution:300ppi
	mediaType:drawing
	tcType:SMPTE
	pegForm:ACME
	pixelAspect:1
	description:参考用作画フレーム
作画フレーム200ppi
	id:0001
	animationField:10in-HDTV
	baseResolution:200ppi
	mediaType:drawing
	tcType:trad-JA
	pegForm:ACME
	pixelAspect:1
	description:参考用作画フレーム
作画フレーム192ppi
	id:0002
	animationField:10in-HDTV
	baseResolution:192ppi
	mediaType:drawing
	tcType:trad-JA
	pegForm:ACME
	pixelAspect:1
	description:参考用作画フレーム
HDTV-720p
	id:0003
	animationField:HDTVA
	baseResolution:108ppi
	mediaType:movie
	tcType:SMPTE-drop
	pegForm:invisible
	pixelAspect:1
	description:HDTV省力原版
HDTV-1080p
	id:0004
	animationField:HDTVA
	baseResolution:192ppi
	mediaType:movie
	tcType:SMPTE
	pegForm:invisible
	pixelAspect:1
	description:HDTV
HDTV-2160p
	id:0005
	animationField:HDTVA
	baseResolution:384ppi
	mediaType:movie
	tcType:SMPTE
	pegForm:invisible
	pixelAspect:1
	description:4KUHDTV
`);

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
nas.Pm.workTitles.parseConfig(`
TVshowSample
	id:0000
	fullName:名称未設定
	shortName:未定
	code:_UN
	framerate:24FPS
	format:21:00:00 .
	inputMedia:10in-HDTV
	outputMedia:HDTV-720p
kachi
	id:0001
	fullName:かちかちやま
	shortName:か
	code:_KT
	framerate:24FPS
	format:20:12:00 .
	inputMedia:10in-HDTV
	outputMedia:HDTV-720p
Momotaro
	id:0002
	fullName:ももたろう
	shortName:も
	code:_MT
	framerate:24FPS
	format:19:21:00 .
	inputMedia:10in-HDTV
	outputMedia:HDTV-720p
Urashima
	id:0003
	fullName:うらしまたろう
	shortName:う
	code:_UR
	framerate:24FPS
	format:24:08:12 .
	inputMedia:12in-HDTV
	outputMedia:HDTV-1080p
`)
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
nas.Pm.products.parseConfig(`
_UN_01
	id:0000
	name:01
	subTitle:未定
	title:TVshowSample
_UN_02
	id:0001
	name:02
	subTitle:未定
	title:TVshowSample
_UN_03
	id:0002
	name:03
	subTitle:未定
	title:TVshowSample
_UN_04
	id:0003
	name:04
	subTitle:未定
	title:TVshowSample
_KT_01
	id:0004
	name:01
	subTitle:ひので
	title:kachi
_KT_02
	id:0005
	name:2
	subTitle:やまのかげ
	title:kachi
_KT_03
	id:0006
	name:3
	subTitle:いただき
	title:kachi
_KT_04
	id:0007
	name:4
	subTitle:やますそ
	title:kachi
_KT_05
	id:0008
	name:05
	subTitle:うつせみ
	title:kachi
_KT_06
	id:0009
	name:06
	subTitle:はまべ
	title:kachi
`);
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
var A = JSON.parse(`
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
`)
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
nas.Pm.allocations.parseConfig(`
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
`);
nas.Pm.allocations.parseConfig(`
[制作管理部,[[*,*]]]
[演出部,[[*,*]]]
[文芸部,[[*,-]]]
[*作画*,[[LO,*],[原画,*]]]
[ねこ:cat@animal.example.com,[[原画,[1-10,13-34]]]]
`);
*/
///* endof data */
