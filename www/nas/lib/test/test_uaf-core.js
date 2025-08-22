/*	TEST for uaf-core
 *
 *
 *
 */
const {
	nas,
	Storyboard,
	xMap,
	Xps
} = require('./index-uaf');
/*----------------------------------------------------------------------------------------*/
console.log('/====================================================================1');
    console.log(JSON.stringify(config,null,2));
console.log('/====================================================================2');
    console.log(nas.pmdb.dump('plain-text'));
console.log('/====================================================================3');
    var stbd = new nas.StoryBoard();
	var script =`nasMOVIE-SCRIPT 1.0
/*
 絵コンテの情報をすべて入れ込んだ状態
	拡張書式２のサンプル
*/
##[beginStartup]
title:		かちかちやま
episode:	0:Pilot
style:{"page":false}
subtitle:	サンプルデータ
format:		00:00:07:00
characters:
姐さん(28)・・・カチカチ山の猟師中堅
オサゲ(19)・・・見習い猟師

##[endStartup]
##[beginScript]
○(001)タヌキ島 かちかちやま　中腹　山道
◇s-c001(12+0)
<column
    cid=0
    picture="http://localhost/~kiyo/uat_sample/cont/img/4f37f7b9-4874-4e08-b7ca-8a5cdaa813b6.png"
>
	F.I.(2+12)▲ 
<column
    cid=1
    picture="http://localhost/~kiyo/uat_sample/cont/img/44a7947b-dcf3-4b64-97d0-3c9abb00fd0a.png"
    timeText="12+0"
>
	昼間　晴天　水平線 
	何か巨大な構造物のシルエットが 
	うっかりすると気づかない程度に薄く見える 
	その手前に雲がチラホラ 

	PAN DOWN↓（ティルティング） 
	海の見える坂道 
	かちかち山ふもとから 

	山道　斜面に古代文明の遺跡 
	人声　絵に先行してIN 
	小さな人影 
オサゲ(OFFからON)「ホッ、ホッ、ホィ　ホッ…　（アドリブ）」
◇s-c002
<column
    cid=0
    picture="http://localhost/~kiyo/uat_sample/cont/img/f11296ee-8496-46cf-b8e3-d50b88ae81e0.png"
    timeText=5+12
>
	カメラ寄り 
	follow 
	BGは止め　遠景はタテヒキ　近景は歩きの方向合わせ 
	（クロス引き） 
	買い出し荷物を持って坂道をのぼる　オサゲちゃん 

	遠景に古代遺跡あり
オサゲ「ホッ、ホッ、ホィ　ホッ…」
○(002)かちかち山　別の場所
◇s-c003(5+12)
<column
    cid=0
    picture="http://localhost/~kiyo/uat_sample/cont/img/0eee2fae-50c3-4b00-9af4-18164b2c4735.png"
    width=
    height=
    timeText=
>
	かちかち山　中腹 

	岩（実は遺跡の一部）に腰掛けた姐さんの足元 
	カッと照りつける日差しと陽炎（カゲロウ） 
	足元に汗が落ちるが　はじから蒸発して消える（F.O） 

	セミの声大音量で響く 
	それに紛れて姐さんの声が小さくきこえる 

(SE:バタバタうちわの音) 
	じわっとPAN↑UP
姐さん(OFF)「あ゛～　暑い　暑い　暑い　暑い　あつい」

◇s-c004(4+0)
<column
    picture="http://localhost/~kiyo/uat_sample/cont/img/cba58c9c-c9f7-433d-9656-3a7a995725ad.png"
>
	カメラ背中側から 
	PAN↑UP 
	立てかけた猟銃　その他　猟師さん風荷物など見える 

	バタバタとうちわであおぐ 
姐さん（セリフ　意味不明にブツブツと続く…）「あぢあぢ　うぇあおんがごげ」 
◇s-c005(2+18)
//	カラムIDは、省略可能
<column   picture="http://localhost/~kiyo/uat_sample/cont/img/250deef8-f938-4a33-b9d3-947b1c6786f7.png"
>
	姐さんの手元　クロースアップ 
	うちわバタバタ 
	ダラダラと流れ落ちる汗 
	PAN-UP↑ 
	ふと扇ぐ手を止めてせりふ 
姐さん「お！」
<column
    picture="http://localhost/~kiyo/uat_sample/cont/img/458eed66-1f82-4efd-8825-0427f66e5713.png"
    timeText=2+18
>
	立ち上がる(A.C) 
//	コンテ上で兼用カットが判明している場合は以下のようにリストする
◇s-c006(6+12),s-c010
<column
    picture="http://localhost/~kiyo/uat_sample/cont/img/fab394de-16a0-4790-bc42-7273646ffe17.png"
    timeText=6+12
>
	(A.C)岩の露頭に立ち上がり手を振る姐さん

	T.B、するとふもとの方から山道を登ってくるオサゲちゃん
	手を振る

	山腹にはなにか巨大な空中構造物（先文明の遺跡）がある
姐さん「オーイ！　かいだしごくろうさーん」 

オサゲ「ハ～イーぃ　おまたせぇ～」
○(003)同所
◇s-c007(2+18)
<column
    cid=0
    picture="http://localhost/~kiyo/uat_sample/cont/img/351438e8-d0ee-44d7-8900-18bf22a4feae.png"
>
	買い出しケース（保冷）のクローズアップ 

	フタをパカっと開くとドライアイスの煙出る 
	一番上にアイスバーが見える
<column
    cid=1
    picture="http://localhost/~kiyo/uat_sample/cont/img/80b754b4-05b5-4c9a-8826-62df57070ded.png"
    timeText=2+18
>
	ちょい　T.U
オサゲ「じゃーん」
◇s-c008(3+6)
<column
    picture="http://localhost/~kiyo/uat_sample/cont/img/ef52e031-0a32-459c-92a2-99f9518edfa4.png"
    timeText=3+6
>
	汗だくのオサゲ、アップで
	アイスバーを差し出して「トクイ！」
	オサゲ「これ、ついでに買ってきちゃったー」
◇s-c009(3+18)
<column
    cid=0
    picture="http://localhost/~kiyo/uat_sample/cont/img/7d424a56-7e63-4759-b121-d520f54145ba.png"
>
	切り返し
	姐さん　バストアップ 
	汗ダラダラ流れてる 
	目パチ 
<column
    cid=1
    picture="http://localhost/~kiyo/uat_sample/cont/img/1dfdb181-aa71-4a4b-bbf6-c7cd95afe76c.png"
>
姐さん　アップへ Q.T.U. 

	中O.Lで表情変わるb
	ウルウル目 

	カンゲキ！！！ 
姐さん「………！」
◇s-c010(7+12),s-c006
<column    picture="http://localhost/~kiyo/uat_sample/cont/img/1e8d1c39-c2b4-4f2e-b161-cb668e715d83.png"
    timeText=7+12
>
	引き絵 
	姐さん　アイスバー受け取って 
	オサゲのアタマをかいぐりかいぐりする 

カメラC6同ポジション FIX 
WIPE (2+18)→

姐さん「ナイスぅ！　ほめてとらすぞ 
　解ける前にいただきぃっ！」 
	オサゲ「でへへぇー（アドリブで）」
//	.
//	.
//	.
##[endScript] 2019.08.12  ねこまたや:nekomataya@example.com
`;
stbd.parseScript(script);
    console.log(stbd.toString());
console.log('/====================================================================4');
    console.log(xMap);
    var xmap = new xMap("かちかちやま#0:Pilot//s-c006(6+12)_s-c010(6+12)");
    console.log(xmap.toString());
console.log('/====================================================================5');
    var xpst0 = xMap.getXps(xmap,0);
    var xpst1 = xMap.getXps(xmap,1);
    console.log(xpst0.toString());
    console.log(xpst1.toString());
