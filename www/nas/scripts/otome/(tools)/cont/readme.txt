絵コンテ分解プロジェクト ver0.1d for AE6.5(AE7未検証)

2007/03/10	プロジェクトバーション	nas_stroryboard ver0.1a

2008/01/30	プロジェクトバージョン	nas_storryboard ver0.1c
2008/02/21	プロジェクトバージョン	nas_storryboard ver0.1d

絵コンテ撮またはライカリールと通称される。絵コンテを元にした仮素材を作成する為にスキャンした絵コンテの画像データから、カット毎に画面位置を指定して再利用する為のプロジェクトです。


現在データ構造を確定する為の試験段階です。
そのため各バージョンおよびマイナーバージョン毎に駆動用のエクスプレッションやデータの構造が異なりますので利用の際は充分ご注意ください。
プロジェクトのバーションはプロジェクトアイテム app.project.item(1).comment に埋め込んであります。

メインのスクリプトにはバージョン違いでは起動しない様にトラップがかけてありますが、起動後にプロジェクトの読み直しなどを行うと誤動作の原因となります。
プロジェクトを再読込みした後はカット番号パネル等を再立ち上げしてください。

このプロジェクトは、開発中の試験プロジェクトです。
このプロジェクトを使用したことによるすべての損益は保証されません。
ご使用は各自の判断で行ってください。


基本のデータ構造
アドビアフターエフェクトのプロジェクトとして絵コンテをデータ化します。


データは以下の様な構成で、主としてキーフレーム上に画像に対する補助情報を埋め込む形で利用しています。

[スキャン画像データ](シーケンス)
	↓
[00]	AEによる(モーショントラック)スタビライズ
[01]	絵コンテに使用する用紙の基礎ジオメトリ取得
[02]	ページごとの情報登録
[03]	カラムごとの情報登録

プロジェクトの動作自体は、AE(Pro版)の機能とエクスプレッションで構成し キー作成補助 プロジェクトの管理(テキストデータの入出力等)機能などをスクリプトで補ってゆく形です。
入力管理にはnas(レンダー乙女)によるスクリプト拡張が必要です
入力終了後のプロジェクトは、nas拡張を行わないAEでも利用できる形を目指しております。


簡単な処理手順

1.	絵コンテをスキャンして連番画像で保存する。
スキャンデータは、各自ご用意ください。
演出家の手で各カットに対するシートの指定等がある場合は(通常ある)
演出家がシート付けの判断材料(もしくは原撮素材そのもの)にする為に分解したコマ絵を印刷する必要があります。

印刷にたえる解像度でスキャンしてください。

絵コンテスキャンデータの1画面の横幅がレイアウト用紙原寸で72dpi以上のデータ密度になる様おすすめします。

このプロジェクトでは、標準状態で印字解像度を72dpiに想定しています。
現在一般的な「A4縦サイズ5段絵コンテ用紙」で印字フレームが[225mm 3:4-TV size]であるとすると
絵コンテ1画面の横幅は6cm程度なので、これが最低でも640px程度にはなる様に250dpi以上
可能なら350dpi程度のの解像度でスキャンしてください。

72 ×(印字フレームの横幅 ÷ 絵コンテ1コマの横幅) dpi

上の式が目安となります。

	tips

大量の同判型のデータのスキャンなので「オートドキュメントフィーダ」付きのスキャナを推奨します。
「そんなものはない!」と思っている方、FAXが使えます。
PC-FAXソフトでFAX受信してAEの読める形にコンバートするとずいぶん手間が省けますのでトライしてみてはいかが?
その際、送信側のFAXは新しいもので高画質(高解像度)のモードを選ぶ様にしてください。モノクロ400dpi相当です。

スタジオにコピー機がある場合は、そのコピー機にスキャナ機能がある場合があります。
コピー機にはかなりの確立でドキュメントフィーダが装備されています。説明書掘り出して読んでると良いことあるかもしれません

FAXやコピー機を使用する場合、これらの関連アプリケーションが標準的に扱う「マルチページ・2値化 tiff」 データは、AEでは読めません。
適切なコンバータで分解してグレースケールに変換しましょう。


モノクロ2値でスキャンする場合は、グレースケールの場合よりも高めの解像度でスキャンすることをおすすめします。
計算で300dpiのデータが必要な場合は3～5割り増しで 400～500dpi クラスでスキャンしてAE読み込み前に必要な解像度に縮小すると画面がきれいです。

最終的に使用するデータはAEで読めるデータならなんでもOKです。
大量の連番画像ですのでディスク容量にご注意ください。使用目的と容量の兼ね合いですがjpgシーケンスなどがわりとおすすめです。


2.	絵コンテをスタビライズする

スキャンしたデータは、スタビライズしておきます。

[00スタビライズ]コンポにデータを置いてサンプルにしたがってモーショントラックまたは同様の機能でスタビライスしておいてください。

スタビライズ自体は何を使用してもかまいません。
スキャン時点でスタビライズが終了しているデータならば特に加工は必要ありません。
(たとえばスキャナにタップがセットされていて、コンテにもタップ孔が…なさそう)

モーショントラックの使用方法に関してはふれません。各自でお願いいたします。

テンプレートのコンポの長さが不足な場合は延長しておいてください。(自動延長機能は現在ありません)


3.	用紙を定義する

スタビライズ済のデータから用紙の基本構造を定義します。

[01用紙登録]コンポの"画像エリア"レイヤをコンテの画像範囲にあわせてドラグして調整してください。
"コンテの段数"はエクスプレッションで設定します。
一般的には5段または6段が多いと思います。各自の作品であわせてください。グリーンの部分が絵コンテのコマと一致したら設定終了です。

このデータは、自動送りの基本位置の計算に使用されます。
各コマごとの微調整は可能ですのでここで調整しなくてもデータ作成はできますが、きちんとあわせておくとあとの作業が断然楽になるのできっちりあわせておいてください。

"解像度","横配置","フレーム幅" などの各オプションには現在機能が設定されていません。(2007/04/01)



4.	ページ設定

[02ページコレクション]コンポは、中間データ処理コンポです。

このステージでの作業は特にありません。
このコンポは、1フレームあたり1ページでコンテの画像をプロジェクト全体に供給するために使用されます。
layer("PageIndex")には、ページ番号(テキスト)が格納されます。
ページのインデックス値と表示するページ番号にずれがある場合は、このレイヤにキーを作成してページ番号を登録してください。
レイヤにキーを作成すると、きー以降のページの番号は作成されたキーの数値部分をもとに自動加算された番号になります。
ページ欠番がある場合は、欠番直後のページにキーを作成してください。 

一通り処理が済んだあとのページ挿入は、フッテージを変更しないで、同じコンポに別のレイヤとして以前のデータの後方に配置することをお勧めします。

ページ番号の登録は後述のカット番号パネルから行える様になっております。

5.	コマ(カラム)登録

[03カラムコレクション]
こちらが、カットおよびコマの関連を記録するコンポです。
主に以下のレイヤのプロパティにコンテのカラム状態を記録します。

	layer("ColumnInformation")	情報格納レイヤ
	layer("Time")	秒数格納レイヤ
	layer("CUT No.")	カット番号格納レイヤ

記録するデータおよびその配置は(2007/03/10現在)以下のリストの状態です。

,プロパティ,説明,格納オブジェクト
,pageIndex	,ページコレクションのインデックス(int)	,layer("ColumnInformation").effect.property("Page")(スライダ)
,clumnIndex	,page内のカラム番号1～(int)自動生成	,layer("ColumnInformation").effect.property("ColumnIndex")(スライダ)
,scaleFitting	,標準のコマサイズをはずれる場合のフラグ(bo)	,layer("ColumnInformation").effect.property("ScaleFitting")(スライダ)
,columnPosition	,カラム位置/左上([left,top])	,layer("ColumnInformation").position
,columnScale	,カラム画像スケール/%([xScale,yScale])	,layer("ColumnInformation").scale
,timeText	,カラムの時間文字列(string)	,layer("Time").text.sourceText
,cutNumber	,カット番号(string)	,layer("CUT No.").text.sourceText

,dialogText	,台詞を規定の書式で	,layer("Dialog").text.sourceText
,contentText	,ト書き。メモ等を規定の書式で	,layer("Content").text.sourceText

このプロジェクトでは、絵コンテのコマを横方向1セットで「カラム」と呼称します。

カラムの絵
1カラムには、以下の情報が最低ひとつ以上含まれます。

カット番号	任意	カラムが当該カットの第一カラムであった場合は必須
画像	必須	絵のない文字だけのコマは情報を絵のあるコマに付随させるか、または白紙の画像を登録すること。
ダイアログテキスト	任意	台詞を規定の書式で
コンテントテキス	任意	ト書き・説明を規定の書式で
タイムテキスト		任意	カットを構成するカラムの継続時間を合計してカット時間を決定する
トランジット時間はタイムテキスト内で括弧付きで記載すること

/*
	絵コンテ分解プロジェクト用エクスプレッションセット
		2007/03/16
*/

/*-------------------------------------------------------------------------------*/
{
//コラムインデックスをページ番号のキーから計算する
var targetTimeline=effect("Page")("スライダ");
//	ここに対象タイムライン

var myResult=0;

//参照すべきキーの総数を求める。
//失敗した時（キーまたはレイア自体がない場合）は、値を0に初期化して終了
	var maxIndex = targetTimeline.num_keys
if ( maxIndex != 0) {
// 再近接のキーを求める
	nKey = targetTimeline.nearestKey(time);
// 現在時と比較
	if( time == nKey.time ) {
		myResult=0;
	}else{
		if ( time <= nKey.time ){
if(nKey.index > 1){
			myResult=(time-targetTimeline.key(nKey.index-1).time)/thisComp.frameDuration;
}else{
	myResult=time/thisComp.frameDuration;
}
		}else{
			myResult=(time-nKey.time)/thisComp.frameDuration;
		}
	}
} else {

	//キーがないので計測原点０で計算
	myResult=time/thisComp.frameDuration;
}
// ページ内のカラム番号を１開始に変更
Math.round(myResult+1);
}

/*-------------------------------------------------------------------------------*/

//画像範囲指定用（第二フレーム以降）
//ソース画像の解像度とフレーム情報から平面のリサイズ
//横
var myScaleX=100
	*(
		thisComp.layer("画像エリア").effect("フレーム幅(mm)")("スライダ")
		*thisComp.layer("画像エリア").effect("解像度(dpi)")("スライダ")/25.40
	)/(this.width);
//縦
var myScaleY=100
	*(
		(	thisComp.layer("画像エリア").effect("フレーム幅(mm)")("スライダ")
			/thisComp.layer("画像エリア").effect("フレーム縦横比")("スライダ")
		)*(
			thisComp.layer("画像エリア").effect("コンテ段数")("スライダ")-1
		)*thisComp.layer("画像エリア").effect("解像度(dpi)")("スライダ")/25.40
	)/(this.height);

[myScaleX,myScaleY];

/*-------------------------------------------------------------------------------*/

//第二フレーム以降の位置情報(1段分下方)
add(thisComp.layer("画像エリア").position,[
	0,(
		thisComp.layer("画像エリア").effect("フレーム幅(mm)")("スライダ")
		/thisComp.layer("画像エリア").effect("フレーム縦横比")("スライダ")
	)* thisComp.layer("画像エリア").effect("解像度(dpi)")("スライダ")/25.40
]);

/*-------------------------------------------------------------------------------*/

//第一フレーム用
//ソース画像の解像度とフレーム情報から平面のリサイズ

//横
var myScaleX=100
	*(
		thisComp.layer("画像エリア").effect("フレーム幅(mm)")("スライダ")
		*thisComp.layer("画像エリア").effect("解像度(dpi)")("スライダ")/25.40
	)/(this.width);
//縦
var myScaleY=100
	*(
		(
			thisComp.layer("画像エリア").effect("フレーム幅(mm)")("スライダ")
			/thisComp.layer("画像エリア").effect("フレーム縦横比")("スライダ")
		)* thisComp.layer("画像エリア").effect("解像度(dpi)")("スライダ")/25.40
	)/(this.height);

[myScaleX,myScaleY];




/*-------------------------------------------------------------------------------*/

//指定用nullオブジェクトのジオメトリからパラメータ抽出

//横幅(mm)
((this.width*this.scale[0]/100)/effect("解像度(dpi)")("スライダ"))*25.40;

//フレーム縦横比を算出
//	エリア縦幅を出して段数で割る
var　frameHeight=(((this.width*this.scale[1]/100)/effect("解像度(dpi)")("スライダ"))*25.40)/effect("コンテ段数")("スライダ");

//横幅(mm)
var　frameWidth=((this.width*this.scale[0]/100)/effect("解像度(dpi)")("スライダ"))*25.40;
frameWidth/frameHeight;
/*-------------------------------------------------------------------------------*/



コンテ分解手順



	各ページ同解像度で絵コンテをスキャンする。

300dpi(A4コンテ時)程度を推奨。
*それ以下の解像度の場合は、標準フレームのピクセル密度が 720px/画面横 を下回るためビデオ出力時の画質が保証できない。

試験プロジェクトは300dpiで作成(288dpiかも…)

	コンテ用紙からジオメトリを取得

扉、または同解像度で読み込んだ用紙を「用紙登録」コンポにドラグして情報を取得
 -コンテの段数の指定
 -画像エリアの指定
 -スタビライズ用の記入エリアの指定
などを行う

	シーケンスで読み込んだ絵コンテをスタビライズする。

AEのスタビライズ機能で充分。コンテ用紙の対角のエッジでスタビライズ
*完成系では、このコンポは自動作成

	スタビライズ済のコンポをデータ取得用一時コンポに読み込んでデータ取得

ユーザ指定支援機能を作成する。
 -ショット登録パネル
 -コンテからカラムを拾って登録してゆく。
 -完成画像ビューア欲しい
 -カメラワーク考慮
 -
 -

XPSを使用？
XPSよりも上位構造になる?
エレメントとしてXPSを内包する上位の構造を作らないと映画を記述できない。


絵コンテデータは"ショット(カット)"オブジェクトの集合とする。
対照する場合は、絵コンテの"ショット"がXPSファイル1つに相当する。

各カットごとのデータを作成。(XPS+MAPを内部に含むことができる様に考慮)
プロパティの対照を明確に(共有プロパティ明示)

		絵コンテ自体が持つプロパティ
object Cont
new Cont(){}

↑*	title		タイトル
↑*	subTitle	サブタイトル
↑*	opus		話数

	frameRate	制作メディアフレームレート
	totalDuration	コンテ総尺
	page	ページフォーマット(基準値)「ページオブジェクト」
		page.width	用紙幅
		page.height	用紙高
		page.anchorPoint	画像エリア開始点
		page.frameColumns	カラム段数
		page.frameWidth	画面幅
		page.frameAspect	画面アスペクト
		page.
	column		カラムオブジェクト
		column.positon	登録座標(フレーム中央?)
		column.
		column.
		column.
		column.
		column.
	columns		カラムコレクション
		
	pages		ページコレクション
	cuts		ショットコレクション

Cont.pages=PageCollection;
new Page();
		ページコレクション
		ページコレクションは以下のプロパティをもつ
index	インデックス 登録順
name	ページ番号(文字列)ユニーク
pageTotalDuration	ページの合計記録時間 columns.onChange()で更新
columns	カラムコレクション

Cont.cuts=CutCollection;
new Cut();
		カット(ショット)プロパティ

	name	識別文字列(ユニーク)	scene-cut セパレータがある場合は、前置をシーン名に
*	scene	nameの派生プロパティ
*	cut	nameの派生プロパティ
*	time	
*	trIN		トランジションエフェクトおよび時間
*	trOut		トランジションエフェクトおよび時間

>	shotIndex	カットINDEX
>	shotName	カット番号=scene+cut
>	startTime	開始時間
>	duration	継続時間
>	columns		カラムコレクション


"ショット"は、コンテデータとしてカラムコレクションを持つ
カラムコレクションはカラムの集合である。
カラムは絵コンテを構成する最小要素である。
カラムは以下の要素を持つ

Cont.columns
new Column(){}

>	position	コンテ内位置([pageIndex,columnIndex])
>
>	contentPicture	画像	/位置・サイズ・画像本体は外部参照
>	dialogText	台詞	/キャラ名・内容テキスト(・開始時間・継続時間)
開始時間は、ショット冒頭からのオフセット。負の数を許容
時間関連は実数かフレーム数か?
>	contentText	ト書き	/内容テキスト
内容不問 分類されないものすべて および 分類されたものの補助
>	soundEffect	サウンドエフェクト関連のト書き
				/ラベル・内容テキスト(・開始時間・継続時間)
>	musicComment	音楽関連のト書き
				/ラベル・内容テキスト(・開始時間・継続時間)
>	columnDuration	カラム継続時間(オプション)
				通常はカラム継続時間を集積したものがショットの継続時間となる。
>	pageIndex	ページID　絵コンテ内で登録順　ページ番号とは別、オーダリングはさらに別
			絵コンテ自身はページの集合で構成される。

>	columnIndex	カラムID ページ内で登録順に与えられるID　整数　記録点は画像エリア左上の座標でソート
			ページは、カラムの集合で構成される。座標のみでもよいか?

これは、以下の様に読み替えた方がよい?

絵コンテは、カラムの集合で構成されている。
カラムは、最低限 「画像・台詞・ト書き・音声メモ・音楽メモ・時間指定」 のうちいずれかひとつの情報をもつ絵コンテを構成する最小単位である。
通常のカラムは、上の情報すべてをもつ

複数のカラムが1つのカットを構成する場合が多いが、カラム単独で1つのカットを構成することも可能である。

カラムは、物理情報としてページ(pageIndex)、およびページ内での位置(columnIndex)をもち、絵コンテの画像情報内での特定が行われる。



=====

マップオブジェクトの動作仕様

データチェックメソッド
引数は

xMap.dataChack(グループラベル,XPSトークン)
xMap.dataChack(XPSトークン)


マップのメソッドで実装
与えられたトークンを検索してマップ内のエントリを返す。
戻り値
	xMap.groups[idx].entrys[idx]	マップエントリオブジェクト
		または
	null

マッチしなかった場合は、null

オプションとしてグループ非限定検索可能
引数がひとつだけの場合は、グループに限定されない検索を行う。

グループオブジェクトに xMap.groups[idx].getByName(トークン) を実装して
そのラッパとして動作させるのが良さそう。

xMap.getGroupByName("グループ名")


AEの場合は、MAPオブジェクトを作ってエントリを返す様に設定
戻すエントリは、レイヤ限定のみで当該レイヤの先頭からの時間オフセットで返す。
(タイムリマップ値)

例:
	dataCheck("A","12")

戻り値	整数(フレーム数)	(有効エントリ)
	またはキーワード	"blank"	(有効ブランク)
	または	null	(無効エントリ)

このくらいで良さそう?	仮にここまで作れば原撮に使える様になるはず。



//72dpi 安全フレーム幅　(225mm*0.9/25.40)*72 > 574.0157px
//72dpi 安全フレーム高　(225mm*(3/4)*0.9/25.40)*72 > 430.5188px

[100*(574.0157)/this.source.layer("カラムセレクタ").scale[0],100*(430.5188)/this.source.layer("カラムセレクタ").scale[1]];

[100*(574.0157)/this.width,100*(430.5188)/this.height];//クリップマスクエクスプレッション

//
スケールフィッティングの値を確認してスケーリングを行うエクスプレッション

スケールはまずガイドのサイズを出して縦横いずれをスケール指標にするかを決定する。
ガイドのサイズが規定フレームよりも横長なら縦が・縦長ならば横が基準スケール

規定フレーム縦横比は
var baseAspect=	thisComp.layer("01用紙登録").source.layer("画像エリア").effect("フレーム縦横比")("スライダ").value;
var myAspect=	thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[0]/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[1];
var fitScale=(myAspect<=baseAspect)?thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[0]:thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[1];
gudeScale


/* 出力バッファのスケール決定エクスプレッション 固定＋fitモードつき*/
//72dpi 安全フレーム幅　(225mm*0.9/25.40)*72 > 574.0157px
//72dpi 安全フレーム高　(225mm*(3/4)*0.9/25.40)*72 > 430.5188px
if(this.source.layer("ColumnInformation").effect("ScaleFitting")("チェックボックス")==true){
	var baseAspect=	thisComp.layer("01用紙登録").source.layer("画像エリア").effect("フレーム縦横比")("スライダ").value;
	var myAspect=	thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[0]/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[1];
	var fitScale=(myAspect<=baseAspect)?
		57401.57/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[0]:
		43051.88/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[1];
	var fixScale=fitScale;
}else{
	var fixScale=57401.57/this.source.layer("ColumnInformation").effect("PageWidth")("スライダ").value;
}

[fixScale,fixScale];

/*	スケーリング対応クリップマスク	*/
//72dpi 安全フレーム幅　(225mm*0.9/25.40)*72 > 574.0157px
//72dpi 安全フレーム高　(225mm*(3/4)*0.9/25.40)*72 > 430.5188px
//[100*(574.0157)/this.width,100*(430.5188)/this.height]

if(thisComp.layer("03カラムコレクション").source.layer("ColumnInformation").effect("ScaleFitting")("チェックボックス")==true){
	var baseAspect=	thisComp.layer("01用紙登録").source.layer("画像エリア").effect("フレーム縦横比")("スライダ").value;
	var myAspect=	thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[0]/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[1];
	var fitScale=(myAspect<=baseAspect)?
		57401.57/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[0]:
		43051.88/thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale[1];
	mul(thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale,fitScale/100);
}else{
	var fixScale=57401.57/thisComp.layer("03カラムコレクション").source.layer("ColumnInformation").effect("PageWidth")("スライダ").value;
	mul(thisComp.layer("03カラムコレクション").source.layer("カラムセレクタ").scale,fixScale/100)
}




//
なんだかすごくいやなバグ発見
エクスプレッションで、エクスプレッション制御エフェクトのチェックボックスを評価する場合
チェックボックスの値をifだけでは評価できない。

たとえば
チェックボックスをひとつ作ってスライダに以下のエクスプレッションを適用すると

if(this.effect("チェックボックス制御")("チェックボックス")){1}else{0};

チェックボックスの値に関わらず 1 がリザルトされる。
本来の期待する効果のためには

if(this.effect("チェックボックス制御")("チェックボックス")==true){1}else{0};

こう書かないとダメっぽい… どうにも 「ヘン!」

だよねぇ
valueで参照すれば比較的すっきりサンかも


/*	ページ上部の表示用エクスプレッション
		表示原点は用紙登録の画像エリア座標
		オフセット調整はプロパティの値を流用
 */
add(this.value,
sub(
	thisComp.layer("01用紙登録").source.layer("画像エリア").position,
	sub(
		thisComp.layer("01用紙登録").source.layer("00スタビライズ").position,
		[
			thisComp.layer("01用紙登録").source.layer("00スタビライズ").width/2,
			thisComp.layer("01用紙登録").source.layer("00スタビライズ").height/2
		]
	)
));


メモ
カット時間プロパティの値を後方キー参照にするほうがよいかも
または全キーで　出力時参照か…　一考


/*	何もかも初期化
		基本的なプロジェクトをロードして保存する？


 */

//	テンプレートファイルを読み込み
myTemplateFileLocation=Folder.startup.toString()+"/Scripts/nas/(tools)/cont/template.aep"
myTemplateFile= new File(myTemplateFileLocation);
app.open(myTemplateFile);

========	("02ページコレクション")("PageIndex")
/*
	ページコレクション ページ番号補助スクリプト
	キーフレームがあればその値を
	なければ直前のキーの整数値部分にフレーム数を加えたものを返す
	ページコレクションに要素を追加・削除する場合は、基本的に
	不要な要素の削除は行わずに、必要な要素をコレクション後方に
	追加することとしてください。
	カラムコレクションから参照されない要素があっても自動削除は行いません。
*/
// ゼロ埋め ZEROfilling
Zf = function(N,f) {
var prefix="";
if (N < 0) {N=Math.abs(N);prefix="-"};
if (String(N).length < f) {
	return prefix + ('00000000' + String(N)).slice(String(N).length + 8 - f , String(N).length + 8);
} else {return String(N);}
};
//
if(!numKeys){this.value}else{
	if(nearestKey(time).time==time){
//		this.value;
		text.sourceText;
	}else{
		var preKeyIndex=(nearestKey(time).time<time)? nearestKey(time).index:nearestKey(time).index-1;
		var baseValue=key(preKeyIndex).value.toString();
		if(baseValue.match(/[^0-9]*([0-9]+)[^0-9]*/)){baseValue=RegExp.$1*1;}else{baseValue=key(preKeyIndex).time/thisComp.frameDuration}
		Zf(baseValue*1+(time-key(preKeyIndex).time)/thisComp.frameDuration,3);
	}
}
========	("03カラムコレクション")("ColumnInformation")("Page")("スライダ")

========	("03カラムコレクション")("ColumnInformation")("ColumnIndex")("スライダ")
if(!numKeys){this.value}else{
//コラムインデックスをページ番号のキーから計算する
var targetTimeline=effect("Page")("スライダ");
//	ここに対象タイムライン

var myResult=0;

//参照すべきキーの総数を求める。
//失敗した時（キーまたはレイア自体がない場合）は、値を0に初期化して終了
	var maxIndex = targetTimeline.num_keys
if ( maxIndex != 0) {
// 再近接のキーを求める
	nKey = targetTimeline.nearestKey(time);
// 現在時と比較
	if( time == nKey.time ) {
		myResult=0;
	}else{
		if ( time <= nKey.time ){
if(nKey.index > 1){
			myResult=(time-targetTimeline.key(nKey.index-1).time)/thisComp.frameDuration;
}else{
	myResult=time/thisComp.frameDuration;
}
		}else{
			myResult=(time-nKey.time)/thisComp.frameDuration;
		}
	}
} else {

	//キーがないので計測原点０で計算
	myResult=time/thisComp.frameDuration;
}
//
Math.round(myResult);
}

========	("03カラムコレクション")("ColumnInformation")("PageWidth")("スライダ")

thisComp.layer("01用紙登録").source.layer("画像エリア").scale[0];



========	("03カラムコレクション")("ColumnInformation")("ScaleFitting")("チェックボックス")

if(!numKeys){this.value}else{if(nearestKey(time).time==time){false}else{true}};


========	("03カラムコレクション")("ColumnInformation")("anchorpoint")
	エクスプレッションで固定。常に"[0,0]"
========	("03カラムコレクション")("ColumnInformation")("position")

	カラム位置情報をこのキーに記録する。

========	("03カラムコレクション")("ColumnInformation")("scale")

	カラムの絵コンテ上のサイズを当該レイヤのスケールで記録する。
	参照時の実サイズは後述

========	("03カラムコレクション")("ColumnInformation")("rotation")

	カラムの絵コンテ上の回転を当該レイヤの回転で記録する。
	一般的には常に"0"

	



削除と挿入を検討
	カラム削除
フォーカスの入ったカラムを削除する

場合分け
	カラムが1単位で1カットを構成する場合
キーを削除して間を詰める(後方キーを前方へ移動)

	カラムが複数カラムで構成されるカットの1部分であった場合
		先頭カラムだった場合
カット番号のキーを残して他を削除する後方キーをすべて前に移動
		途中または終了カラムだった場合
カラムキーを削除して後方データを前方へ移動

分割パターンの差異はカット番号キーを削除するか否かの条件の取得である
削除後はいずれも他のキーを前方へ移動して編集用一時変数を更新


	カラム挿入
フォーカス位置の前方に新規カラムを挿入

場合分け
	フォーカス位置がカットの冒頭カラムだった場合
		カラムは前方カットの追加カラムとして挿入
		挿入カットであった場合はあとでそのカラムを別カットにする。
	カラムが複数カラムで構成されるカットの1部分であった場合かつ先頭以外のカラムだった場合
		カラムは当該カットの追加カラムとして挿入処理

	共通で、カラム挿入位置は、同ページ内のカラムであれば中間位置
	他ページにまたがる場合は、前方カットの半カラム下方


property
ver.		name	valueType	r/w

myRQ.comp	[CompItem]	readOnly	コンポ
myRQ.elapsedSeconds	float	readOnly	レンダリング経過時間
myRQ.logType	(LogType?)	r/w		ログタイプ
myRQ.numOutputModules	integer	readOnly	出力モジュール数
myRQ.outputModules	[OMCollection]	readOnly	出力モジュールコレクション
myRQ.render	boolean	r/w	レンダリングチェック
myRQ.skipFrames	integer	r/w	(結構不明?)コマとばしレンダリングができるらしい…プレビュー用?
myRQ.startTime	float	readOnly	開始時刻Dateオブジェクト
myRQ.status	[RQItemStatus]	readOnly	RQアイテムのエナミュレーテッドタイプ値
myRQ.templates	Array of string	r/w	RQテンプレート名前リスト
myRQ.timeSpanDuration	float	r/w	レンダリング継続時間
myRQ.timeSpanStart	float	r/w	レンダリング開始時間(コンポ)

method 



リリースまでの準備作業
サンプル用のコンテを作る
手書きで、 カット番号と絵があればよろしい。5枚くらいか。

作業手順表を作る。

スタビライズ支援コンポを作る。
>動画の奴と同様のスタビライズ支援コンポを仮組みしてトンボをレイヤで配置したあと
スクリプトでスタビライズをかける。

