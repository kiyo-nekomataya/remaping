/**
 * @fileoverview
 * configPMDB.js
 * UATシステム利用する各管理情報の基礎データテーブル
 * このファイル自身はスタンドアロン動作用のデフォルトのデータ群となる
 * 制作管理DB（共有）は、このファイルと同等の内容を保持する
 * リポジトリに接続の際は、DBとの通信が正常に初期化された後、受信したデータで上書きが行なわれる
 * 通信が確立できなかった場合には本データで処理を継続する
 *
 * 本来これらのデータは、リポジトリ内部にデータリジョンごとに設定データとして分散配置され、必要に従って編集、更新が可能なように調整される
 *
 * 設定書式（通信書式）は、パーサを共通化するために統一される
 * パーサは、plain-text,full-dump,JSON の各形式に対応する
 * ユーザは好みの方式で記述を行うことができる
 * 一般のDBではJSON形式を推奨
 *
 * データリジョン
 *   データは一定の単位で区分けされる。各区をリジョンと呼ぶ
 * 以下のリジョンが規定される
 * [organizations]	組織情報テーブル
 * [users]			データにリーチする事のできるユーザ一覧
 * [staff]			スタッフ一覧
 * [workTitles]		管理下のタイトル一覧
 * [products] 		管理下のOpus一覧
 * [assets]			管理対象アセットテーブル
 * [medeias]			制作に供するメディアテーブル
 * [stages]			制作工程テーブル
 * [lines]			制作ラインテーブル
 * [pmTemplate]		ラインごとの標準的な工程テンプレート
 * [jobNames]		管理に使用するジョブ名テーブル
 *
 *    リジョンごとの記述は、後置優先で後からデータを読み込む際に一切のデータを消去して上書きされる
 *    ノードごとの継承が必用な場合は、ノード内に設定を置かない（読み込みがない）かまたは、
 *    必用な情報を上位ノードから引き写した設定データを配置して対応すること。
 *    これはノードデータの独立性を高めるためにあえて自動継承を行わない仕様としてある。要注意
 */
/**
 [organizations]　組織情報
 組織オブジェクトは、組織情報トレーラーとして働く
 pmdbオブジェクト内に一つだけ存在して、それらの共通参照情報となる
 
 
プロパティ名  organization

    name:通常表記名
    fullName:正式名
    code:ファイル名等使用コード
    id:DBリンク用インデックス(UAT token)
    shortName:短縮名
    description:解説
    contact:組織連絡先
    serviceUrl:サービス元URL　リポジトリのサービスを提供するUATサーバのURL　または　Webストレージ等のファイルリポジトリのURL

    organizationName   name    code    id  shortName   description contact users
 */

nas.Pm.organizations.parseConfig(`
nekomataya
	fullName:ねこまたや
	code:nkmt
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
/**
 *     productionStaff
 * 
 * 
 *    組織に属する全ユーザのリスト
 *    リストにないユーザは、作業に参加できない
 *    書式:
 *    handle:e-mail[:{option}]
 *    例:
 *    ねこまたや:kiyo@nekomataya.info
 * 
 *    同形式のリストはローカルファイルシステム上はない
 *    グループ（スタッフ）リストに
 *       
 * 
*/
nas.Pm.users.parseConfig(`
ねずみ:mouse@animals.example.com:{"token":"1234566"}
うし:cow@animals.example.com
とら:tiger@animals.example.com
うさぎ:rabbit@animals.example.com
たつ:dragon@legend.example.com
へび:snake@animals.example.com
うま:horse@animals.example.com
ひつじ:sheep@animals.example.com
さる:monkey@animals.example.com
とり:bird@animals.example.com
犬丸:dog@animals.example.com
いのしし:boar@animals.example.com
たぬきスタジオ:tanuki-st@animal.example.com
たぬき:tanuki.tanuki-st@animal.example.com
ムジナ:mjina.tanuki-st@animal.example.com
穴熊:anaguma.tanuki-st@animal.example.com
アイナメ:ainame@fish.example.com
イワシ:iwashi@fish.example.com
エソ:eso@fish.example.com
オコゼ:okoze@fish.example.com
カサゴ:kasago@fish.example.com
キス:kisu@fish.example.com
クロダイ:kurodai@fish.example.com
ケショウフグ:kesyoufugu@fish.example.com
コノシロ:konoshiro@fish.example.com
サバ:saba@fish.example.com
シラウオ:shirauo@fish.example.com
スズキ:suzuki@fish.example.com
ソメワケベラ:somewake@fish.example.com
セトダイ:setodai@fish.example.com
タナゴ:tanago@fish.example.com
チヌ:chinu@fish.example.com
ツボダイ:tsubodai@fish.example.com
テッポウウオ:teppouuo@fish.example.com
トラフグ:torafugu@fish.example.com
ナマズ:namazu@fish.example.com
ニシキゴイ:nishikigoi@fish.example.com
ヌタウナギ:nutaunagi@fish.example.com
ネコザメ:nekozame@fish.example.com
ハゼ:haze@fish.example.com
ヒラメ:hirame@fish.example.com
フグ:fugu@fish.example.com
ノドグロ:nodoguro@fish.example.com
ヘラ:hera@fish.example.com
ホッケ:hokke@fish.example.com
マグロ:maguro@fish.example.com
ミゾレフグ:mizorefugu@fish.example.com
ムツゴロウ:mutsugoro@fish.example.com
メゴチ:megochi@fish.example.com
モンガラカワハギ:monngarakawahagi@fish.example.com
ヤツメウナギ:yatsumeunagi@fish.exapmle.com
ユメカサゴ:yumekasago@fish.example.com
ヨシキリザメ:yoshikirizame@fish.example.com
ライギョ:raigyo@fish.example.com
リュウグウノツカイ:ryuuguunotsukai@fish.example.com
絶滅寸前:ztm@fish.example.com
ウナギ:unagi.ztm@fish.example.com
ねこ:cat@animal.example.com
こねこ:kitty@animal.example.com
いぬ:dog@animal.example.com
こいぬ:puppy@animal.example.com
かもめ:gull@bird.example.com
回遊館:kaiyu@fish.example.com
海洋工房:st-sea@fish.example.com
マグロ:mgr.st-sea@fish.example.com
スジクロギンポ:sjk.st-sea@fish.example.com
ワカサギ:wakasagi.st-sea@fish.example.com
サバ:saba.st-sea@fish.example.com
レモンスズメダイ:remonnsuzumedai.st-sea@fish.example.com
ロウソクギンポ:rousokuginnpo.st-sea@fish.example.com
ルリハタ:rurihata.st-sea@fish.example.com
ツバメ:swallow@bird.example.com
スタジオ鳥類:st-bird@bird.example.com
ハト:pigeon@bird.example.com
スズメ:sparrow@bird.example.com
オウム:parrot@bird.example.com
シジュウカラ:tits@bird.example.com
ワシ:eagle@bird.example.com
アイガモ:duck.aigamo@bird.example.com
`);

/**
 * スタッフ登録
 * タブ区切りテキストでスタッフリストの形式で
 * スタッフリストに登録のないユーザは作品に一切参加できない
 * 
 * アクセス可否[h-tab]部門[h-tab]役職[h-tab]ユーザ[h-tab]別名
 * 
 * アクセス可否
 *     エントリへのアクセス権限、省略可
 *         true,+  アクセス可
 *         false,- アクセス不可
 *     省略時はアクセス可
 * 部門
 *     部署（セクション）名
 * 役職
 *     役職名
 * ユーザ
 *     ユーザID　<名前>:<メールアドレス　または　システムID>
 * 別名
 *     ペンネーム等の表示名(省略可)
 */
nas.Pm.staff.parseConfig(`
	制作管理
		プロデューサ
			ねずみ:
		統括デスク
			うし:
		デスク
			とら:
		制作進行
			とり:
			たつ:
			うま:
			ひつじ:

	演出
		監督
			犬丸:dog@animal.example.com
		演出
			犬丸:dog@animal.example.com
		演出助手
			いのしし:boar@animals.example.com

	文芸
		脚本
			ウナギ:
		設定制作
			へび:
		デザイナー
			アイナメ:
		キャラ設定
			いわし:
		美術設定
			ワカサギ:
		小物設定
			クロダイ:
		色彩設計
			ツバメ:swallow@bird.example.com
	作画
		総作画監督
		作画監督
			いわし:iwashi@fish.example.com
		作画監督補
		メカ作画監督
		メカ作画監督補
		原画
			ねこ:cat@animal.example.com
			こねこ:kitty@animal.example.com
			いぬ:dog@animal.example.com
			こいぬ:puppy@animal.example.com
			オコゼ:okoze@fish.example.com
			カサゴ:kasago@fish.example.com
			キス:kisu@fish.example.com

		第一原画
		第二原画
			ねこ:cat@animal.example.com
			かもめ:gull@bird.example.com
		動画検査
			サバ:saba@fish.example.com
		動画監督
		動画
			スズキ:suzuki@fish.example.com
			ソメワケベラ:somewake@fish.example.com
			セトダイ:setodai@fish.example.com
			タナゴ:tanago@fish.example.com
			チヌ:chinu@fish.example.com
			たぬきスタジオ:
			たぬき:tanuki.tanuki-st@animal.example.com
			ムジナ:mjina.tanuki-st@animal.example.com
			穴熊:anaguma.tanuki-st@animal.example.com
			回遊館:kaiyu@fish.example.com
	美術
		美術監督
			マグロ:mgr.st-sea@fish.example.com
		美術監督補佐
			スジクロギンポ:sjk.st-sea@fish.example.com
		原図整理
			スジクロギンポ:sjk.st-sea@fish.example.com
		背景
			海洋工房:st-sea@fish.example.com
			ワカサギ:wakasagi.st-sea@fish.example.com
			サバ:saba.st-sea@fish.example.com
			レモンスズメダイ:remonnsuzumedai.st-sea@fish.example.com
			ロウソクギンポ:rousokuginnpo.st-sea@fish.example.com
			ルリハタ:rurihata.st-sea@fish.example.com

	仕上
		色指定
			ツバメ:swallow@bird.example.com
		トレース
			アイガモ:duck.aigamo@bird.example.com
		ペイント
			アイガモ:duck.aigamo@bird.example.com
			スズメ:sparrow@bird.example.com
			オウム:parrot@bird.example.com
			シジュウカラ:tits@bird.example.com
			ワシ:eagle@bird.example.com
		特殊効果
			たぬきスタジオ:tanuki-st@animal.example.com
			穴熊:meles.tanuki-st@animal.example.com

	撮影
		撮影監督
			　さる:mnk@animal.example.com
		撮影
			猿山撮影所:
			さる:mnk.mt-mnk@animal.example.com
			ごりら:gori.mt-mnk@animal.example.com
			オランウータン:ora.mt-mnk@animal.example.com
			チンパンジー:pan.mt-mnk@animal.example.com
			ニホンザル:mac.mt-mnk@animal.example.com
		撮影助手

	3D

	無所属
		＊
	オブザーバ
		オブザーバ
		時代考証
			ガンモドキ:
`);

/**
 * アセット分類
 *
 *  assets[assetName] = {name:"アセット表記名",hasXPS:シートありか？,code:コード,shortName:短縮名,description:解説,endNode:終了ノードか？,linkStage:[呼び出しステージ配列]};
 *
 *  呼び出しステージ配列は アセット側としては、アセットを受けて開始することが可能なステージ群
 *  ステージ側から見るとそのステージの開始に最低限必要なアセット
 *  呼び出しステージ配列が空のアセットはストアにストックされるのみで、次のステージを開始しない
 *  assetName  は重複不可のindex
アセットは、システムごとに定義してユーザによる編集（追加・削除・内容の変更）が可能

 クラスのコレクションはテンプレートとして機能
                        assetName           name            hasXPS      code    shortName   description     endNode     linkStages
*/
nas.Pm.assets.parseConfig(`
SCInfo
	name:コンテチップ
	hasXPS:true
	code:SCI
	shortName:コンテ
	description:null
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
leica
	name:プリビズ
	hasXPS:true
	code:prev
	shortName:プリビズ
	description:null
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
draft
	name:ラフスケッチ
	hasXPS:true
	code:DRFT
	shortName:ラフ
	description:null
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing
layout
	name:レイアウト
	hasXPS:true
	code:__LO
	shortName:LO
	description:null
	endNode:false
	callStage:leica,animatic,roughSketch,layout,1stKeydrawing,layoutProof,layoutA-D,keydrawing,2ndKeydrawing
keyAnimation
	name:原画
	hasXPS:true
	code:__KD
	shortName:原
	description:null
	endNode:false
	callStage:KDA-D,2ndKdA-D,checkKD,preProofAD,AD
AnimationDrawing
	name:動画
	hasXPS:true
	code:__AD
	shortName:動
	description:null
	endNode:false
	callStage:ADA-D,proofAD,A-D,ADscan,ADcleanUp,HMechanicalTrace
cell
	name:セル
	hasXPS:true
	code:CELL
	shortName:仕
	description:null
	endNode:true
	callStage:AdcleanUp,paint,proofPaint,retouchCell
characterDesign
	name:キャラクター設定
	hasXPS:false
	code:chrD
	shortName:キャラ
	description:null
	endNode:true
	callStage:undefined
propDesign
	name:プロップ設定
	hasXPS:false
	code:crpD
	shortName:プロップ
	description:null
	endNode:true
	callStage:
BGDesign
	name:美術設定
	hasXPS:false
	code:bgaD
	shortName:美設
	description:null
	endNode:true
	callStage:
referenceSheet
	name:参考設定
	hasXPS:false
	code:refD
	shortName:参考
	description:null
	endNode:true
	callStage:
colorDesign
	name:色彩設計
	hasXPS:false
	code:colD
	shortName:色設
	description:null
	endNode:true
	callStage:
colorCoordiante
	name:色指定
	hasXPS:true
	code:colC
	shortName:指定
	description:null
	endNode:true
	callStage:
backgroundArt
	name:背景
	hasXPS:true
	code:_BGA
	shortName:背景
	description:null
	endNode:true
	callStage:
cast3D
	name:3Dアニメーション
	hasXPS:true
	code:3DCC
	shortName:3D
	description:null
	endNode:true
	callStage:
EXTRA
	name:（空アセット）
	hasXPS:false
	code:NULL
	shortName:EXTRA
	description:null
	endNode:true
	callStage:
ALL
	name:（全アセット）
	hasXPS:true
	code:_ALL
	shortName:ALL
	description:null
	endNode:false
	callStage:
`)

/**
 * ステージ分類
 *ステージの持つプロパティ
 *stageName 定義名称：オブジェクトのコールに使用する キャメル記法で
 *name 名称
 *code 省略表記コード
 *shortName 日本語用省略表記コード
 *description 日本語の名称を兼ねた説明？
 *output ステージの出力するアセット種別 文字列
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
 */
nas.Pm.stages.parseConfig(`
undefined
	name:未定義
	code:(undef)
	shortName:(undefined)
	description:未定義ステージ 制作預りとして扱う。基本的にアセットストアへの編入を指す
	output:SCInfo
init
	name:初期化
	code:init
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
	code:CD
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
	code:CC
	shortName:色指定
	description:カット別彩色指定データ
	output:colorDesign
coordinationModel
	name:色指定カラーモデル
	code:_ccM
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
	output:drfat
layout
	name:レイアウト
	code:LO
	shortName:LO
	description:レイアウト上がり(原図あり)
	output:layout
LayoutAD
	name:LOスキャン
	code:LO-D
	shortName:レイアウトA/D
	description:layout to Data レイアウトをデータ化したもの
	output:layout
fstKeydrawing
	name:第一原画
	code:1G
	shortName:一原
	description:レイアウトを含むラフ原画シート付き
	output:layout
fstKdAD
	name:第一原画A/D
	code:1G-D
	shortName:一原A/D
	description:
	output:layout
keydrawing
	name:原画
	code:KD
	shortName:原
	description:原画上がり作画監督修正含む keyDrawing
	output:keyAnimation
KDAD
	name:原画A/D
	code:KD-D
	shortName:原画A/D
	description:keyAnimation to Data 原画をデータ化したもの
	output:keyAnimation
sndKeydrawing
	name:第二原画
	code:2G
	shortName:二原
	description:第一原画を原画としてフィニッシュしたもの
	output:keyAnimation
sndKdAD
	name:第二原画A/D
	code:2G-D
	shortName:二原A/D
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
	name:美術A/D
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
	name:動画A/D
	code:AD/D
	shortName:動画A/D
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
	description:仕上げ一括(複合)
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

/**
 * ライン分類
 * 管理モデルの簡略化のため 本線・傍線ともに分離後の個別の合流はないものとする
 * 必要なアセットはストアから引き出す
 * 制作ラインの前方にはスタートラインがあり SCinfoで始まる
 * 後方コンポジット工程の手前にアセットストア（合流）ラインがあり、ここをストアとして全ての素材がマージされる
 * カット情報を持ったコンポジット素材はコンポジット情報を元に各カットへ配分される それ以外のアセットは参照アセットとして格納される
 * 参照アセットは随時引き出し可能
 *
 *nas.Pm.lines には、その作品で定義された工程のリファレンスが格納される。
 *管理DBと連結される場合は、このオブジェクトとDB上のライン定義テーブルが対照・連結される
 *ここでは、独立駆動のためのテーブルを定義している
 *
*/
nas.Pm.lines.parseConfig(`
trunk
	name:本線
	shortName:本線
	outoputAsset:セル
	initAsset:コンテチップ
	code:cell
	description:管理本線となるセルライン
backgroundArt
	name:背景美術
	shortName:背景
	outoputAsset:背景
	initAsset:レイアウト
	code:bg__
	description:美術作業
cast3D
	name:3Dアニメーション
	shortName:3D
	outoputAsset:null
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
colorCoordiante
	name:色指定
	shortName:指定
	outoputAsset:色彩設計
	initAsset:コンテチップ
	code:__cc
	description:色指定
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

/**
 *   制作基準テンプレート
 *  制作管理のため基準値として利用
 *   このデータは基礎データとして各現場ごとに編集する必要がある
 *　 現場ごとのライン内のステージの流れをテンプレートとして保存する
 *   以下に設定するのは参考用テンプレート
 *　　書式:
 *<ライン名>
 *   stages:<工程名>,<工程名>,<工程名>,<工程名>,<工程名>,<工程名>,<工程名>,<工程名>,<工程名>
 *   親オブジェクト    (nas.Pmは参照用マスターDB　その他はリポジトリを親に設定する。プラグラムの動作に必用な　lines,stages,jobNames　を配下に持っているオブジェクト)
 *   <ライン名>    名称は任意、ただし基本的には、0番は本線、
 *   <工程名>  ラインごとの工程（ステージ）標準並び 作業順にコンマ区切りで工程名を列記する
 *  各ラインの持つステージ群の最初のエントリがデフォルトのエントリとなり、ドキュメント初期化の際に候補される　または自動処理で割り当てられる
 'startup'ステージは、テンプレート未設定の場合の汎用アウターとアップステージとする
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"本線",["レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]));
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"背景美術",["原図整理","背景","美術検査"]));
*/
nas.Pm.pmTemplates.parseConfig(`
本線
	stages:絵コンテ撮,レイアウト,原画,第一原画,第二原画,発注前動画検査,動画,色指定,スキャン,色トレス,セル特効,撮出し検査,コンポジット
背景美術
	stages:美術原図整理,背景美術,美術検査
`)
/*
    ["本線",["レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
    ["本線",["コンテ撮","レイアウト","原画","第一原画","作画監督修正","第二原画","発注前動画検査","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
    ["本線",["コンテ撮","レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
*/
/**
 *  ジョブは、ステージごとに定義される
 *  正確には作業中に初期状態の名称リストの他に逐次新しい名前を定義して良い
 *  定義された名称はステージごとに蓄積される
 *  以降の同ステージの作業者はそのリストから自分の作業にふさわしいジョブ名称を選択することができる
 *  新しい作業名を入力して良い
 *  ジョブの名称、順序は各ステージオブジェクト（カット）毎に異なっていて良い
 *
 *  どのステージでも０番ジョブは予約で、制作管理者が立ち上げる
 * ０番ジョブは手続き的なジョブであり、実際に素材が作成されることはほぼない
 * 名称はステージごとに定義されるが、通常は 「初期化」「開始」「作打済」「準備」 等の名称が与えられる
 * 伝票が発行されるのは０番ジョブに対して行なわれる場合が多い
 *
 *  １番ジョブは、通常そのステージの主作業
 * 原画ステージなら「原画」作業 動画ステージならば「動画」作業となる
 *
 *  ２番ジョブ以降は、主作業に対するチェック作業となる場合が多い
 *  原画ステージならば「演出検査」「作監検査」「監督検査」など
 *  ステージ内の差し戻し作業（やり直し）が発生した場合は、リテイク処理とは別に ステージ内差し戻し作業が発生する
 *  例えば演出検査で演技の変更指示が発生した場合などは、ジョブ番号を増加させて原画作業者が再度作業を行う
 *  ジョブ番号の上限は無い
 *  ステージが求めるアセットが完成するまでジョブを重ねてステージを終了させるものとする。
 
＊＊特殊事例として、「作画キャラクター制」での制作作業では、一般に作画作業者間での頻繁なやり取りが想定される。
この場合は素材の引き渡し毎に何度も「（原画）作画」作業が繰り返されることになる。
「作画キャラクター制」の場合、キャラクター統一のための作画監督作業は一般に存在しない （アニメーションディレクターとしてのチェックはある）

 *  JobDB =エントリーリスト は、ステージ・カットごとの独立したデータとなる
 *  カットとしての保存位置は、ドキュメントのエントリー記録そのもの
 *  ステージとして参照のための保存は システムの配下にJobコレクションをおいてそこに追記してゆく
 *  各エントリの名称は重複が考えられるので、Jobコレクションにエントリされたアイテム（名称）はステージに対するリレーションを保存する
 *  アイテムエントリは、以下のメソッドで随時行う
        nas.Pm.jobNames.addName("Job名" , relStage);

工程テンプレートの構成は

ラインの出力アセットでステージをフィルタする

    ライン.outputAsset==ステージ.output

抽出されたステージが入力候補となる

ステージのidでジョブ名をフィルターして
そのステージで使用可能なジョブの入力候補を取得する

ジョブ名のDBは単純な名称とリレーションするステージのセットとする
ジョブ名,ステージ名,プロパティ(init/primary/check)
ジョブ名の'*'は置換予約語でこの記述は、指定ステージ名の名称と同一の名称を用いる
ステージidの'*'は、ワイルドカード展開を行いすべてのステージに対して同じジョブを追加する


    以下は、初期値
 
nas.Pm.jobNames.addNames([
	["作業開始","*","init"],
	["初期化","*","init"],
	["作打済","*","init"],
	["準備","*","init"],
	["演出チェック","*","check"],
	["監督チェック","*","check"],
	["作監チェック","*","check"],
	["総作監チェック","*","check"],
	["メカ作監チェック","*","check"],
	["美監チェック","bgArt","check"],
	["動画検査","AD","check"],
	["動画検査","ADAD","check"],
	["セル検査","H-pt","check"],
	["彩色検査","PT","check"],
	["トレース検査","H-tr","check"],
	["トレース検査","ADscan","check"],
	["クリンアップ検査","ADcleanup","check"],
	["*作業","*","primary"]
]);

下は英訳分だけどどうも日本式の役職の英語訳はワカラン　というか　ムチャじゃね？
nas.Pm.jobNames.addNames([
	["startup","*","init"],
	["init","*","init"],
	["standby","*","init"],
	["ready","*","init"],
	["Director","*","check"],
	["ChiefDirector","*","check"],
	["AnimationDirector","*","check"],
	["ChiefAnimationDirector","*","check"],
	["","*","check"],
	["ArtDirector","bgArt","check"],
	["AnimationChecker","AD","check"],
	["動画検査","ADAD","check"],
	["セル検査","H-pt","check"],
	["PaintCheck","PT","check"],
	["トレース検査","H-tr","check"],
	["ScanCheck","ADscan","check"],
	["CleanupCheck","ADcleanup","check"],
	["*-job","*","primary"]
]);

テンプレートは、作品ごとの標準工程を示す
ユーザの入力時に入力値候補として提示される
line(並列)
stage(ラインごと順次)
job(ステージごとtype別)

line
    stage
        job
        job
    stage
        job
        job
        job
    stage
        job
        job
        job

3層のデータ構造を持つ
ジョブ名は重複が多いので省略表記設定を採用

実処理の際に展開？
又は
初期化時に展開？

展開メソッドを設けて使用時に展開するのが最もヨサゲ

ProductionLine/ProductionStage/ProductionJob
各オブジェクトを初期化するのは実際にエントリを作成するタイミングで

*/
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
/**
 * タイトルDB
 *
 *タイトル文字列  ,[ID(リレーションID) ,フルネーム ,ショートネーム ,コード ,フレームレート ,定尺 ,入力メディア" ,"出力メディア"]
 *
 *このタイトル分類と同内容のデータがDBとの通信で扱われる
 *各アプリケーションのタイトルDBをこの形式に統一
 タイトルごとの製作工程テンプレートが必要
    テンプレートの作成用UIをサーバ上に構築
    タイトルの付随情報としてテンプレートオブジェクトを持たせる
    テンプレートオブジェクトを介して nas.PmのDBオブジェクトをアクセスする
    テンプレートにないアイテムも使用可能
        
 */
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

/*
　* メディアDB

 *mediaName ,[ID(リレーションID) ,animationField, baseResolution ,mediaType ,tcType ,pegForm ,pixelAspect ,description]
mediaName               名称　識別名
ID                      リレーションID　登録順連番整数　DB接続時に再解決する
animationField          作画時の標準フィールドのリンク又は識別名称　主に画面縦横比（画郭）を指定するための要素
baseResolution          基本的な画像解像度（走査線密度==縦方向解像度）String　単位付き文字列で
mediaType               メディアタイプキーワード string　"drawing"=="input"||"intermediate"||"movie"=="output"
tcType                  タイムコードタイプ   frames,trag-JA,SMPTE,SMPTE-drop,page-Frames,page-SK　等の文字列で指定？
pegForm                 タップの型式         invisible,ACME,jis2hales,us3hales ビデオ等のタップと無関係のデータはinvisible　　
pixelAspect             ピクセル縦横比　縦方向を１として対する横方向の比率を浮動小数点数値で
description             コメントテキスト
 */
nas.Pm.medias.parseConfig(`
作画フレーム300ppi
	id:0000
	animationField:12in-HDTV
	baseResolution:300dpi
	mediaType:drawing
	tcType:SMPTE
	pegForm:ACME
	pixelAspect:1
	description:参考用作画フレーム
作画フレーム200dpi
	id:0001
	animationField:10in-HDTV
	baseResolution:200dpi
	mediaType:drawing
	tcType:trad-JA
	pegForm:ACME
	pixelAspect:1
	description:参考用作画フレーム
作画フレーム192dpi
	id:0002
	animationField:10in-HDTV
	baseResolution:192dpi
	mediaType:drawing
	tcType:trad-JA
	pegForm:ACME
	pixelAspect:1
	description:参考用作画フレーム
HDTV-720p
	id:0003
	animationField:HDTV
	baseResolution:72dpi
	mediaType:movie
	tcType:SMPTE-drop
	pegForm:invisible
	pixelAspect:1
	description:HDTV省力原版
HDTV-1080p
	id:0004
	animationField:HDTV2K
	baseResolution:108dpi
	mediaType:movie
	tcType:SMPTE
	pegForm:invisible
	pixelAspect:1
	description:HDTV
HDTV-2160p
	id:0005
	animationField:HDTV4K
	baseResolution:216dpi
	mediaType:movie
	tcType:SMPTE
	pegForm:invisible
	pixelAspect:1
	description:4KHDTV
`);
