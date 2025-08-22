/**
 *
 *	@fileOverview
 *		タイムシート記述用カメラワークDB
 *	
 */
'use strict';
/*=======================================*/
//load order :4
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config    = require( './nas_common' ).config;
    var appHost   = require( './nas_common' ).appHost;
    var nas       = require( './nas_AnimationValues').nas;
}else if(typeof nas == 'undefined'){
	var nas = {};
};
/*
	@description
<pre>
書式:
(キーワード)
	name:(キーワード)
	type:String "symbol","geometry","composite" サブタイプとしてエフェクト名称を使用
	aliases:[別名の配列]　正規表現サブセットで記述可能
	nodeSigns:[中間値補完サイン,セクション開始サイン,セクション終了サイン]
	description:記述の説明

name	ー	識別用名称

データベース内でユニークになるように注意
アルファベットのみ、空白不可
複合単語はキャメル記法で記述　"frame in"→"frameIn"


type	ー	抽象化された記述を分類する文字列


    geometry
geometryトラックに直接展開可能な一般記述
slide,rotation等が含まれるがそれだけにとどまらない
通常はフレーミング情報を値として持つことができる


    composite(.effectName)
compositeトラックに直接展開可能な一般記述
BK,WK,fi,fo　等
ベクトル以外の一つ以上のスカラー値を値として持つことができる
フィルタ類もこのタイプ

    transition(.effectName)
transition記述
２素材以上のcomposite値の複合オブジェクト
２つ以上のトラックに展開される効果


    symbol(.effectName)
複合された概念、または単純にトラックに展開できないものの記述
オプチ、パーススライド等の定義が定まらない効果も含む？


aliases	ー	記述の別名

実際のタイムシートの記述は、この別名のうちいずれかが使用可能
使用された記述がDB内にない場合は
一時的にデフォルトの "unknown" が適用される。
あとから新規登録が可能

nodeSigns	ー　ノード記号配列

タイムシート上でのテキスト表示用記号
第一要素	中間値補完サイン　記述範囲を埋める記号　登録がない場合は"|(縦棒)"
第二要素	セクション開始サイン　セクションの冒頭を示す記号　登録がない場合は第一要素を使う
第三要素	セクション終了サイン　セクションの末尾を示す記号　登録がない場合は第二要素を使う


description	ー	記述の簡単な説明

記述内容の説明を付加


演出手法
カメラワーク
ステージワーク
</pre>
*/
nas.cameraworkDescriptions.parseConfig('{"unknown":{"name":"unknown","type":"symbol","aliases":["未登録"],"nodeSigns":["┃","┳","┻"],"description":"未登録シンボル(デフォルトの値)"},"bar":{"name":"bar","type":"symbol","aliases":["バー","BAR","縦棒","‖"],"nodeSigns":["‖"],"description":"指定の区間を表す棒線"},"insert":{"name":"insert","type":"symbol","aliases":["ins.","insert","インサート","挿入","＜INSERT"],"nodeSigns":["＜INSERT"],"description":"場面に別場面のショットを挿入する演出手法"},"cutIn":{"name":"cutIn","type":"symbol","aliases":["カットイン","CUTIN","＜CUTIN"],"nodeSigns":["＜CUTIN"],"description":"カットの切り替え"},"strobo":{"name":"strobo","type":"symbol","aliases":["ストロボ","Strobo","]Strobo["],"nodeSigns":["|","]Strobo["],"description":"連続した動画の置き換えにオーバーラップトランジションを使う演出手法"},"stroboOdd":{"name":"stroboOdd","type":"symbol","aliases":["ストロボ1","Strobo1","▼▲"],"nodeSigns":["|","▼▲"],"description":"ストロボ"},"stroboEvn":{"name":"stroboEvn","type":"symbol","aliases":["ストロボ2","Strobo2","▲▼"],"nodeSigns":["|","▲▼"],"description":"ストロボ"},"follow":{"name":"follow","type":"symbol","aliases":["follow","フォロー","フォロウ"],"nodeSigns":["┃","┳","┻"],"description":"画面が被写体を追って移動する演出手法"},"bigcloseUp":{"name":"bigcloseUp","type":"symbol","aliases":["BC","ビッグクローズアップ","大寄り"],"nodeSigns":["┃","┳","┻"],"description":"特定の一部分を大写しにする演出手法"},"closeUp":{"name":"closeUp","type":"symbol","aliases":["CU","クローズアップ","寄りアップ"],"nodeSigns":["┃","┳","┻"],"description":"顔などの注目範囲を画面いっぱいに写す演出手法"},"upShot":{"name":"upShot","type":"symbol","aliases":["US","UP","アップショット","アップ"],"nodeSigns":["┃","┳","┻"],"description":"顔などの注目範囲が主体になるように画面を構成する演出手法"},"bustShot":{"name":"bustShot","type":"symbol","aliases":["BS","バストショット","バスト寄り"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際に胸部から上を主体に画面を構成する演出手法"},"westShot":{"name":"westShot","type":"symbol","aliases":["WS","ウエストショット","腰高"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際に腹部から上を主体に画面を構成する演出手法"},"kneeShot":{"name":"kneeShot","type":"symbol","aliases":["KS","ニーショット","膝上"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際に膝部から上を主体に画面を構成する演出手法"},"fullFigure":{"name":"fullFigure","type":"symbol","aliases":["FF","フルフィギュア","全身"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際に全身像を主体に画面を構成する演出手法"},"middleShot":{"name":"middleShot","type":"symbol","aliases":["MS","ミドルショット","やや引き"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際に全身像とその周囲の環境を主体に画面を構成する演出手法"},"longShot":{"name":"longShot","type":"symbol","aliases":["LS","ロングショット","引き"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際に人物の周辺環境を主体として画面を構成する演出手法"},"fullLong":{"name":"fullLong","type":"symbol","aliases":["FL","フルロング","大引き"],"nodeSigns":["┃","┳","┻"],"description":"人物撮影の際にステージ全体を主体として画面を構成する演出手法"},"crane":{"name":"crane","type":"symbol","aliases":["クレーン","クレーンショット","carne-shot"],"nodeSigns":["｜","┬","┴"],"description":"クレーン先端にカメラを搭載して画像を収録する演出手法"},"dolly":{"name":"dolly","type":"symbol","aliases":["DLY","ドリー","トロッコ","台車"],"nodeSigns":["｜","┬","┴"],"description":"移動台車にカメラを搭載して画像を収録する演出手法"},"multi":{"name":"multi","type":"symbol","aliases":["MULTI","マルチ","密着マルチ","マルチスピードスライド","多段引き","多段スライド"],"nodeSigns":["｜","┬","┴"],"description":"移動感を表すために多段の撮影指定が存在する旨の撮影指定"},"multiPlain":{"name":"multiPlain","type":"symbol","aliases":["マルチプレーン","マルチ台"],"nodeSigns":["｜","┬","┴"],"description":"立体型マルチプレーン撮影台を使用する旨の撮影指定"},"fairing":{"name":"fairing","type":"symbol","aliases":["フェアリング","加速","減速","徐々に"],"nodeSigns":["｜","⇑","⇓"],"description":"スライド等の値の切り替わりを滑らかにコントロールすること"},"highContrast":{"name":"highContrast","type":"symbol","aliases":["ハイコン","High-Con","HI CON"],"nodeSigns":["|","┬","┴"],"description":"ハイコントラスト状態"},"rackFocus":{"name":"rackFocus","type":"symbol","aliases":["ピン送り","ピント送り","ラック・フォーカス","フォーカス送り","Rack Focus"],"nodeSigns":["｜","┬","┴"],"description":"実写のピント送りを模した演出手法"},"overExposure":{"name":"overExposure","type":"symbol","aliases":["露出オーバー","露光超過","OverEX"],"nodeSigns":["｜","┬","┴"],"description":"露出オーバーの画像を使用する演出手法"},"underExposure":{"name":"underExposure","type":"symbol","aliases":["露出アンダー","露光不足","UnderEX"],"nodeSigns":["｜","┬","┴"],"description":"露出アンダーの画像を使用する演出手法"},"perspectiveTransform":{"name":"perspectiveTransform","type":"symbol","aliases":["パース変形","パース引き","ParsSL"],"nodeSigns":["┃","┳","┻"],"description":"素材の立体感を補助する変形を素材に加える撮影手法"},"jumpSlide":{"name":"jumpSlide","type":"symbol","aliases":["ジャンプスライド","ジャンプ引き","間欠スライド","JumpSL"],"nodeSigns":["｜","┬","┴"],"description":"一定の合成素材をグループごとに基点を与えて処理する撮影手法"},"diffusionFilter":{"name":"diffusionFilter","type":"symbol","aliases":["DF","ディフュージョンフィルタ","DF1","DF2","DF3"],"nodeSigns":["｜","┬","┴"],"description":"画像を拡散させるフィルター"},"clossFilter":{"name":"clossFilter","type":"symbol","aliases":["ClOSS","クロスフィルタ"],"nodeSigns":["｜","┬","┴"],"description":"光源から光条を発生させるフィルター"},"foggyFilter":{"name":"foggyFilter","type":"symbol","aliases":["FOGGY","フォギーフィルタ"],"nodeSigns":["｜","┬","┴"],"description":"画像を霧のように柔らかく拡散させるフィルター"},"bokeh":{"name":"bokeh","type":"symbol","aliases":["BOKEH","ボケ","ピントぼかし","オフフォーカス"],"nodeSigns":["｜","┬","┴"],"description":"画像をぼやけさせる演出手法"},"fix":{"name":"fix","type":"symbol","aliases":["FIX","フィックス","止め"],"nodeSigns":["｜","┬","┴"],"description":"カメラを据えて画面を固定する演出手法"},"rolling":{"name":"rolling","type":"symbol","aliases":["ローリング","roll.","↻","↺"],"nodeSigns":["｜","┬","┴"],"description":"合成素材の周期的なスライドで被写体のモーションを表現する撮影手法"},"cameraShakeS":{"name":"cameraShakeS","type":"geometry","aliases":["ぶれ(弱)","画面動(弱)","画ぶれ(弱)","カメラブレ(弱)","/"],"nodeSigns":["/"],"description":"カメラを揺するような効果（弱）"},"cameraShake":{"name":"cameraShake","type":"geometry","aliases":["ぶれ","画面動","画ぶれ","カメラブレ","//"],"nodeSigns":["//"],"description":"カメラを揺するような効果"},"cameraShakeL":{"name":"cameraShakeL","type":"geometry","aliases":["ぶれ(強)","画面動(強)","画ぶれ(強)","///"],"nodeSigns":["///"],"description":"カメラを揺するような効果（強）"},"trackUp":{"name":"trackUp","type":"geometry","aliases":["TU","T.U","トラックアップ"],"nodeSigns":["|","▽","△"],"description":"カメラが被写体に近づいてゆく演出手法"},"trackBack":{"name":"trackBack","type":"geometry","aliases":["TB","T.B","トラックバック"],"nodeSigns":["|","▽","△"],"description":"カメラが被写体から遠ざかる演出手法"},"zoomIn":{"name":"zoomIn","type":"geometry","aliases":["ZI","Z.I","ズームイン"],"nodeSigns":["|","▽","△"],"description":"画角を調整して被写体を拡大する演出手法"},"zoomOut":{"name":"zoomOut","type":"geometry","aliases":["ZO","Z.O","ズームアウト"],"nodeSigns":["|","▽","△"],"description":"画角を調整して被写体を縮小する演出手法"},"pan":{"name":"pan","type":"geometry","aliases":["PAN","パン","pnning"],"nodeSigns":["|","▽","△"],"description":"カメラを主に横方向に振る演出手法"},"panUp":{"name":"panUp","type":"geometry","aliases":["PANUP","PAN UP","パンアップ"],"nodeSigns":["|","▽","△"],"description":"カメラを画面上方向に振る演出手法　チルトアップ"},"panDown":{"name":"panDown","type":"geometry","aliases":["PANDOWN","pan down","パンダウン"],"nodeSigns":["|","▽","△"],"description":"カメラを画面下方向に振る演出手法　チルトダウン"},"panTU":{"name":"panTU","type":"geometry","aliases":["PAN-UP","パンTU","PAN TU","TUpaning"],"nodeSigns":["|","▽","△"],"description":"PANとTUを併用する演出手法"},"panTB":{"name":"panTB","type":"geometry","aliases":["PAN-TB","パンTB","PAN TB","TBpaning"],"nodeSigns":["|","▽","△"],"description":"PANとTBを併用する演出手法"},"tilt":{"name":"tilt","type":"geometry","aliases":["TILT","チルト","tilting"],"nodeSigns":["|","▽","△"],"description":"カメラを画面上下方向に振る演出手法"},"tiltUp":{"name":"tiltUp","type":"geometry","aliases":["TILT-UP","チルトアップ"],"nodeSigns":["|","▽","△"],"description":"カメラを画面上方向に振る演出手法"},"tiltDown":{"name":"tiltDown","type":"geometry","aliases":["TILT-DOWN","チルトダウン"],"nodeSigns":["|","▽","△"],"description":"カメラを画面下方向に振る演出手法"},"slide":{"name":"slide","type":"geometry","aliases":["SL","引き","スライド","移動"],"nodeSigns":["|","▽","△"],"description":"合成素材の移動"},"rotation":{"name":"rotation","type":"geometry","aliases":["RT","回転","ローテーション"],"nodeSigns":["|","▽","△"],"description":"合成素材の回転移動"},"rotatePan":{"name":"rotatePan","type":"geometry","aliases":["回転PAN","rtPAN","rotate PAN","PAN(回転加味)"],"nodeSigns":["|","▽","△"],"description":"カメラを試写体に対して回転を加えてPANする演出手法"},"roteteSlide":{"name":"roteteSlide","type":"geometry","aliases":["回転スライド","rtSL","rotate SLIDE","rotate SL","引き（回転加味）"],"nodeSigns":["|","▽","△"],"description":"合成素材をスライドさせながら回転を加える撮影指定"},"rotateTU":{"name":"rotateTU","type":"geometry","aliases":["回転TU","rtTU","Rotate TU","TU（回転加味）"],"nodeSigns":["|","▽","△"],"description":"カメラを試写体に対して回転を加えながら接近させる演出手法"},"rateteTB":{"name":"rateteTB","type":"geometry","aliases":["回転TB","rtTB","Rotate TB","TB（回転加味）"],"nodeSigns":["|","▽","△"],"description":"カメラを試写体に対して回転を加ながら引き離す演出手法"},"handShakeS":{"name":"handShakeS","type":"geometry","aliases":["ハンディブレ小","手持ちカメラ風画面動",":"],"nodeSigns":[":"],"description":"手持ちカメラのような振動を画面に与える演出手法"},"handShake":{"name":"handShake","type":"geometry","aliases":["ハンディブレ","手持ちカメラ風画面動","::"],"nodeSigns":["::"],"description":"手持ちカメラのような振動を画面に与える演出手法"},"handShakeL":{"name":"handShakeL","type":"geometry","aliases":["ハンディブレ大","手持ちカメラ風画面動",":::"],"nodeSigns":[":::"],"description":"手持ちカメラのような振動を画面に与える演出手法"},"followTracking":{"name":"followTracking","type":"geometry","aliases":["つけPAN","フォローパン","follow pan","followPAN","フォロートラッキング"],"nodeSigns":["|","▽","△"],"description":"カメラの移動で被写体を追従する演出手法"},"followSlide":{"name":"followSlide","type":"geometry","aliases":["FollowSL","台引き","台SL"],"nodeSigns":["|","▽","△"],"description":"被写体以外の合成素材をスライドすることでフォロー状態を表現する撮影手法"},"quickTU":{"name":"quickTU","type":"geometry","aliases":["Q-TU","クイックTU","QTU","Q TU"],"nodeSigns":["|","▽","△"],"description":"急速なTU"},"quickTB":{"name":"quickTB","type":"geometry","aliases":["Q-TB","クイックTB","QTB","Q TB"],"nodeSigns":["|","▽","△"],"description":"急速なTB"},"quickPAN":{"name":"quickPAN","type":"geometry","aliases":["Q-PAN","クイックPAN","QPAN","Q PAN"],"nodeSigns":["|","▽","△"],"description":"急速なPAN"},"fadeIn":{"name":"fadeIn","type":"composite","aliases":["FI","F.I","フェード・イン","フェードイン","fade-in","▲","溶明"],"nodeSigns":["|","▲"],"description":"画面が暗転状態から徐々に明るくなる演出手法"},"fadeOut":{"name":"fadeOut","type":"composite","aliases":["FO","F.O","フェード・アウト","フェードアウト","fade-out","▼","溶暗"],"nodeSigns":["|","▼"],"description":"画面が徐々に暗転する演出手法"},"whiteIn":{"name":"whiteIn","type":"composite","aliases":["WI","W.I","W/in","ホワイト・イン","ホワイトイン","white-in","△"],"nodeSigns":["|","△"],"description":"白画面からフェードインする演出手法"},"whiteOut":{"name":"whiteOut","type":"composite","aliases":["WO","W.O","W/out","ホワイト・アウト","ホワイトアウト","white-out","▽"],"nodeSigns":["|","▽"],"description":"白画面へフェードアウトする演出手法"},"kurokoma":{"name":"kurokoma","type":"composite","aliases":["黒コマ","BK","■"],"nodeSigns":["■"],"description":"黒い画面を挿入する演出手法"},"shirokoma":{"name":"shirokoma","type":"composite","aliases":["白コマ","WK","□"],"nodeSigns":["□"],"description":"白い画面を挿入する演出手法"},"sublina":{"name":"sublina","type":"composite","aliases":["サブリナ","SUBLINA","＜SUBLINA"],"nodeSigns":["＜SUBLINA"],"description":"一コマだけ露出オーバー、または前後に繋がりのない絵を挿入する演出手法"},"backlight":{"name":"backlight","type":"composite","aliases":["T光","透過光","backlight","TFlash","backlight bleed","backlight glow"],"nodeSigns":["|","┬","┴"],"description":"バックライトで撮影を行う演出手法"},"focusIn":{"name":"focusIn","type":"composite","aliases":["focus-IN","focus IN","フォーカスイン","▲"],"nodeSigns":["|","▲"],"description":"ショット内でフォーカスを合わせる演出手法"},"focusOut":{"name":"focusOut","type":"composite","aliases":["focus-OUT","focus OUT","フォーカスアウト","▼"],"nodeSigns":["|","▼"],"description":"ショット内でフォーカスをはずす演出手法"},"waveGlassS":{"name":"waveGlassS","type":"composite","aliases":["波ガラス(弱)","distorted glass S","WaveGlass S","!"],"nodeSigns":["!"],"description":"波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣"},"waveGlass":{"name":"waveGlass","type":"composite","aliases":["波ガラス","distorted glass","WaveGlass M","!!"],"nodeSigns":["!!"],"description":"波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣"},"waveGlassL":{"name":"waveGlassL","type":"composite","aliases":["波ガラス(強)","distorted glass L","WaveGlass L","!!!"],"nodeSigns":["!!!"],"description":"波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣"},"blur":{"name":"blur","type":"composite","aliases":["ぼかし","ブラー"],"nodeSigns":["┃","┳","┻"],"description":"画面をぼやけさせる撮影手法"},"transition":{"name":"transition","type":"transition","aliases":["トランジション","transition","]transition[","]><["],"nodeSigns":["|","]><["],"description":"２つのショットが継続時間をもって入れ替わること"},"overlap":{"name":"overlap","type":"transition","aliases":["OL","diss","オーバーラップ","closs-dissolve","]X[","]OL[","]diss[","]><[","]⋈["],"nodeSigns":["|","]OL["],"description":"経過中の画面を二重写しにする転換のための演出手法"},"wipe":{"name":"wipe","type":"transition","aliases":["wipe","]WIPE[","ワイプ"],"nodeSigns":["|","]WIPE["],"description":"トラベリングマスクを利用して行うトランジション"},"wipeIn":{"name":"wipeIn","type":"transition","aliases":["WIPE-IN","ワイプイン","]▲["],"nodeSigns":["|","]▲["],"description":"被写体がワイプで画面に現れること"},"wipeOut":{"name":"wipeOut","type":"transition","aliases":["WIPE-OUT","ワイプアウト","]▼["],"nodeSigns":["|","]▼["],"description":"被写体がワイプで画面から消えること"},"iris":{"name":"iris","type":"transition","aliases":["iris","アイリス","アイリスワイプ","]iris["],"nodeSigns":["|","]iris["],"description":"アイリス（虹彩＝絞り）状のマスクを用いたワイプ"},"irisIn":{"name":"irisIn","type":"transition","aliases":["IRIS-IN","アイリスイン","]iris-In[","]○["],"nodeSigns":["|","]○["],"description":"ショットがアイリスワイプで現れること"},"irisOut":{"name":"irisOut","type":"transition","aliases":["IRIS-OUT","アイリスアウト","]iris-Out[","]●["],"nodeSigns":["|","]●["],"description":"ショットがアイリスワイプで消えること"}}');
/*
unknown
	name:unknown
	type:symbol
	aliases:["未登録"]
	nodeSigns:["┃","┳","┻"]
	description:未登録シンボル(デフォルトの値)
bar
	name:bar
	type:symbol
	aliases:["バー","BAR","縦棒","‖"]
	nodeSigns:["‖"]
	description:指定の区間を表す棒線
insert
	name:insert
	type:symbol
	aliases:["ins.","insert","インサート","挿入","＜INSERT"]
	nodeSigns:["＜INSERT"]
	description:場面に別場面のショットを挿入する演出手法
cutIn
	name:cutIn
	type:symbol
	aliases:["カットイン","CUTIN","＜CUTIN"]
	nodeSigns:["＜CUTIN"]
	description:カットの切り替え
strobo
	name:strobo
	type:symbol
	aliases:["ストロボ","Strobo","]Strobo["]
	nodeSigns:["|","]Strobo["]
	description:連続した動画の置き換えにオーバーラップトランジションを使う演出手法
stroboOdd
	name:stroboOdd
	type:symbol
	aliases:["ストロボ1","Strobo1","▼▲"]
	nodeSigns:["|","▼▲"]
	description:ストロボ
stroboEvn
	name:stroboEvn
	type:symbol
	aliases:["ストロボ2","Strobo2","▲▼"]
	nodeSigns:["|","▲▼"]
	description:ストロボ
follow
	name:follow
	type:symbol
	aliases:["follow","フォロー","フォロウ"]
	nodeSigns:["┃","┳","┻"]
	description:画面が被写体を追って移動する演出手法
bigcloseUp
	name:bigcloseUp
	type:symbol
	aliases:["BC","ビッグクローズアップ","大寄り"]
	nodeSigns:["┃","┳","┻"]
	description:特定の一部分を大写しにする演出手法
closeUp
	name:closeUp
	type:symbol
	aliases:["CUP","クローズアップ","寄りアップ"]
	nodeSigns:["┃","┳","┻"]
	description:顔などの注目範囲を画面いっぱいに写す演出手法
upShot
	name:upShot
	type:symbol
	aliases:["US","UP","アップショット","アップ"]
	nodeSigns:["┃","┳","┻"]
	description:顔などの注目範囲が主体になるように画面を構成する演出手法
bustShot
	name:bustShot
	type:symbol
	aliases:["BS","バストショット","バスト寄り"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に胸部から上を主体に画面を構成する演出手法
westShot
	name:westShot
	type:symbol
	aliases:["WS","ウエストショット","腰高"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に腹部から上を主体に画面を構成する演出手法
kneeShot
	name:kneeShot
	type:symbol
	aliases:["KS","ニーショット","膝上"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に膝部から上を主体に画面を構成する演出手法
fullFigure
	name:fullFigure
	type:symbol
	aliases:["FF","フルフィギュア","全身"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に全身像を主体に画面を構成する演出手法
middleShot
	name:middleShot
	type:symbol
	aliases:["MS","ミドルショット","やや引き"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に全身像とその周囲の環境を主体に画面を構成する演出手法
longShot
	name:longShot
	type:symbol
	aliases:["LS","ロングショット","引き"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に人物の周辺環境を主体として画面を構成する演出手法
fullLong
	name:fullLong
	type:symbol
	aliases:["FL","フルロング","大引き"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際にステージ全体を主体として画面を構成する演出手法
crane
	name:crane
	type:symbol
	aliases:["クレーン","クレーンショット","carne-shot"]
	nodeSigns:["｜","┬","┴"]
	description:クレーン先端にカメラを搭載して画像を収録する演出手法
craneDown
	name:crane
	type:symbol
	aliases:["クレーンダウン","CD","Cr-DOWN","carne-down"]
	nodeSigns:["｜","┬","┴"]
	description:下向クレーンショット
craneUp
	name:crane
	type:symbol
	aliases:["クレーンアップ","CU","Cr-UP","carne-up"]
	nodeSigns:["｜","┬","┴"]
	description:上向クレーンショット
dolly
	name:dolly
	type:symbol
	aliases:["DLY","ドリー","トロッコ","台車"]
	nodeSigns:["｜","┬","┴"]
	description:移動台車にカメラを搭載して画像を収録する演出手法
multi
	name:multi
	type:symbol
	aliases:["MULTI","マルチ","密着マルチ","マルチスピードスライド","多段引き","多段スライド"]
	nodeSigns:["｜","┬","┴"]
	description:移動感を表すために多段の撮影指定が存在する旨の撮影指定
multiPlain
	name:multiPlain
	type:symbol
	aliases:["マルチプレーン","マルチ台"]
	nodeSigns:["｜","┬","┴"]
	description:立体型マルチプレーン撮影台を使用する旨の撮影指定
fairing
	name:fairing
	type:symbol
	aliases:["フェアリング","加速","減速","徐々に"]
	nodeSigns:["｜","⇑","⇓"]
	description:スライド等の値の切り替わりを滑らかにコントロールすること
highContrast
	name:highContrast
	type:symbol
	aliases:["ハイコン","High-Con","HI CON"]
	nodeSigns:["|","┬","┴"]
	description:ハイコントラスト状態
rackFocus
	name:rackFocus
	type:symbol
	aliases:["ピン送り","ピント送り","ラック・フォーカス","フォーカス送り","Rack Focus"]
	nodeSigns:["｜","┬","┴"]
	description:実写のピント送りを模した演出手法
overExposure
	name:overExposure
	type:symbol
	aliases:["露出オーバー","露光超過","OverEX"]
	nodeSigns:["｜","┬","┴"]
	description:露出オーバーの画像を使用する演出手法
underExposure
	name:underExposure
	type:symbol
	aliases:["露出アンダー","露光不足","UnderEX"]
	nodeSigns:["｜","┬","┴"]
	description:露出アンダーの画像を使用する演出手法
perspectiveTransform
	name:perspectiveTransform
	type:symbol
	aliases:["パース変形","パース引き","ParsSL"]
	nodeSigns:["┃","┳","┻"]
	description:素材の立体感を補助する変形を素材に加える撮影手法
jumpSlide
	name:jumpSlide
	type:symbol
	aliases:["ジャンプスライド","ジャンプ引き","間欠スライド","JumpSL"]
	nodeSigns:["｜","┬","┴"]
	description:一定の合成素材をグループごとに基点を与えて処理する撮影手法
diffusionFilter
	name:diffusionFilter
	type:symbol
	aliases:["DF","ディフュージョンフィルタ","DF1","DF2","DF3"]
	nodeSigns:["｜","┬","┴"]
	description:画像を拡散させるフィルター
clossFilter
	name:clossFilter
	type:symbol
	aliases:["ClOSS","クロスフィルタ"]
	nodeSigns:["｜","┬","┴"]
	description:光源から光条を発生させるフィルター
foggyFilter
	name:foggyFilter
	type:symbol
	aliases:["FOGGY","フォギーフィルタ"]
	nodeSigns:["｜","┬","┴"]
	description:画像を霧のように柔らかく拡散させるフィルター
bokeh
	name:bokeh
	type:symbol
	aliases:["BOKEH","ボケ","ピントぼかし","オフフォーカス"]
	nodeSigns:["｜","┬","┴"]
	description:画像をぼやけさせる演出手法
fix
	name:fix
	type:symbol
	aliases:["FIX","フィックス","止め"]
	nodeSigns:["｜","┬","┴"]
	description:カメラを据えて画面を固定する演出手法
rolling
	name:rolling
	type:symbol
	aliases:["ローリング","roll.","↻","↺"]
	nodeSigns:["｜","┬","┴"]
	description:合成素材の周期的なスライドで被写体のモーションを表現する撮影手法
cameraShakeS
	name:cameraShakeS
	type:geometry
	aliases:["ぶれ(弱)","画面動(弱)","画ぶれ(弱)","カメラブレ(弱)","/"]
	nodeSigns:["/"]
	description:カメラを揺するような効果（弱）
cameraShake
	name:cameraShake
	type:geometry
	aliases:["ぶれ","画面動","画ぶれ","カメラブレ","//"]
	nodeSigns:["//"]
	description:カメラを揺するような効果
cameraShakeL
	name:cameraShakeL
	type:geometry
	aliases:["ぶれ(強)","画面動(強)","画ぶれ(強)","///"]
	nodeSigns:["///"]
	description:カメラを揺するような効果（強）
trackUp
	name:trackUp
	type:geometry
	aliases:["TU","T.U","トラックアップ"]
	nodeSigns:["|","▽","△"]
	description:カメラが被写体に近づいてゆく演出手法
trackBack
	name:trackBack
	type:geometry
	aliases:["TB","T.B","トラックバック"]
	nodeSigns:["|","▽","△"]
	description:カメラが被写体から遠ざかる演出手法
zoomIn
	name:zoomIn
	type:geometry
	aliases:["ZI","Z.I","ズームイン"]
	nodeSigns:["|","▽","△"]
	description:画角を調整して被写体を拡大する演出手法
zoomOut
	name:zoomOut
	type:geometry
	aliases:["ZO","Z.O","ズームアウト"]
	nodeSigns:["|","▽","△"]
	description:画角を調整して被写体を縮小する演出手法
pan
	name:pan
	type:geometry
	aliases:["PAN","パン","pnning"]
	nodeSigns:["|","▽","△"]
	description:カメラを主に横方向に振る演出手法
panUp
	name:panUp
	type:geometry
	aliases:["PANUP","PAN UP","パンアップ"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面上方向に振る演出手法　チルトアップ
panDown
	name:panDown
	type:geometry
	aliases:["PANDOWN","pan down","パンダウン"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面下方向に振る演出手法　チルトダウン
panTU
	name:panTU
	type:geometry
	aliases:["PAN-UP","パンTU","PAN TU","TUpaning"]
	nodeSigns:["|","▽","△"]
	description:PANとTUを併用する演出手法
panTB
	name:panTB
	type:geometry
	aliases:["PAN-TB","パンTB","PAN TB","TBpaning"]
	nodeSigns:["|","▽","△"]
	description:PANとTBを併用する演出手法
tilt
	name:tilt
	type:geometry
	aliases:["TILT","チルト","tilting"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面上下方向に振る演出手法
tiltUp
	name:tiltUp
	type:geometry
	aliases:["TILT-UP","チルトアップ"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面上方向に振る演出手法
tiltDown
	name:tiltDown
	type:geometry
	aliases:["TILT-DOWN","チルトダウン"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面下方向に振る演出手法
slide
	name:slide
	type:geometry
	aliases:["SL","引き","スライド","移動"]
	nodeSigns:["|","▽","△"]
	description:合成素材の移動
rotation
	name:rotation
	type:geometry
	aliases:["RT","回転","ローテーション"]
	nodeSigns:["|","▽","△"]
	description:合成素材の回転移動
rotatePan
	name:rotatePan
	type:geometry
	aliases:["回転PAN","rtPAN","rotate PAN","PAN(回転加味)"]
	nodeSigns:["|","▽","△"]
	description:カメラを試写体に対して回転を加えてPANする演出手法
roteteSlide
	name:roteteSlide
	type:geometry
	aliases:["回転スライド","rtSL","rotate SLIDE","rotate SL","引き（回転加味）"]
	nodeSigns:["|","▽","△"]
	description:合成素材をスライドさせながら回転を加える撮影指定
rotateTU
	name:rotateTU
	type:geometry
	aliases:["回転TU","rtTU","Rotate TU","TU（回転加味）"]
	nodeSigns:["|","▽","△"]
	description:カメラを試写体に対して回転を加えながら接近させる演出手法
rateteTB
	name:rateteTB
	type:geometry
	aliases:["回転TB","rtTB","Rotate TB","TB（回転加味）"]
	nodeSigns:["|","▽","△"]
	description:カメラを試写体に対して回転を加ながら引き離す演出手法
handShakeS
	name:handShakeS
	type:geometry
	aliases:["ハンディブレ小","手持ちカメラ風画面動",":"]
	nodeSigns:[":"]
	description:手持ちカメラのような振動を画面に与える演出手法
handShake
	name:handShake
	type:geometry
	aliases:["ハンディブレ","手持ちカメラ風画面動","::"]
	nodeSigns:["::"]
	description:手持ちカメラのような振動を画面に与える演出手法
handShakeL
	name:handShakeL
	type:geometry
	aliases:["ハンディブレ大","手持ちカメラ風画面動",":::"]
	nodeSigns:[":::"]
	description:手持ちカメラのような振動を画面に与える演出手法
followTracking
	name:followTracking
	type:geometry
	aliases:["つけPAN","フォローパン","follow pan","followPAN","フォロートラッキング"]
	nodeSigns:["|","▽","△"]
	description:カメラの移動で被写体を追従する演出手法
followSlide
	name:followSlide
	type:geometry
	aliases:["FollowSL","台引き","台SL"]
	nodeSigns:["|","▽","△"]
	description:被写体以外の合成素材をスライドすることでフォロー状態を表現する撮影手法
quickTU
	name:quickTU
	type:geometry
	aliases:["Q-TU","クイックTU","QTU","Q TU"]
	nodeSigns:["|","▽","△"]
	description:急速なTU
quickTB
	name:quickTB
	type:geometry
	aliases:["Q-TB","クイックTB","QTB","Q TB"]
	nodeSigns:["|","▽","△"]
	description:急速なTB
quickPAN
	name:quickPAN
	type:geometry
	aliases:["Q-PAN","クイックPAN","QPAN","Q PAN"]
	nodeSigns:["|","▽","△"]
	description:急速なPAN
fadeIn
	name:fadeIn
	type:composite
	aliases:["FI","F.I","フェード・イン","フェードイン","fade-in","▲","溶明"]
	nodeSigns:["|","▲"]
	description:画面が暗転状態から徐々に明るくなる演出手法
fadeOut
	name:fadeOut
	type:composite
	aliases:["FO","F.O","フェード・アウト","フェードアウト","fade-out","▼","溶暗"]
	nodeSigns:["|","▼"]
	description:画面が徐々に暗転する演出手法
whiteIn
	name:whiteIn
	type:composite
	aliases:["WI","W.I","W/in","ホワイト・イン","ホワイトイン","white-in","△"]
	nodeSigns:["|","△"]
	description:白画面からフェードインする演出手法
whiteOut
	name:whiteOut
	type:composite
	aliases:["WO","W.O","W/out","ホワイト・アウト","ホワイトアウト","white-out","▽"]
	nodeSigns:["|","▽"]
	description:白画面へフェードアウトする演出手法
kurokoma
	name:kurokoma
	type:composite
	aliases:["黒コマ","BK","■"]
	nodeSigns:["■"]
	description:黒い画面を挿入する演出手法
shirokoma
	name:shirokoma
	type:composite
	aliases:["白コマ","WK","□"]
	nodeSigns:["□"]
	description:白い画面を挿入する演出手法
sublina
	name:sublina
	type:composite
	aliases:["サブリナ","SUBLINA","＜SUBLINA"]
	nodeSigns:["＜SUBLINA"]
	description:一コマだけ露出オーバー、または前後に繋がりのない絵を挿入する演出手法
backlight
	name:backlight
	type:composite
	aliases:["T光","透過光","backlight","TFlash","backlight bleed","backlight glow"]
	nodeSigns:["|","┬","┴"]
	description:バックライトで撮影を行う演出手法
focusIn
	name:focusIn
	type:composite
	aliases:["focus-IN","focus IN","フォーカスイン","▲"]
	nodeSigns:["|","▲"]
	description:ショット内でフォーカスを合わせる演出手法
focusOut
	name:focusOut
	type:composite
	aliases:["focus-OUT","focus OUT","フォーカスアウト","▼"]
	nodeSigns:["|","▼"]
	description:ショット内でフォーカスをはずす演出手法
waveGlassS
	name:waveGlassS
	type:composite
	aliases:["波ガラス(弱)","distorted glass S","WaveGlass S","!"]
	nodeSigns:["!"]
	description:波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣
waveGlass
	name:waveGlass
	type:composite
	aliases:["波ガラス","distorted glass","WaveGlass M","!!"]
	nodeSigns:["!!"]
	description:波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣
waveGlassL
	name:waveGlassL
	type:composite
	aliases:["波ガラス(強)","distorted glass L","WaveGlass L","!!!"]
	nodeSigns:["!!!"]
	description:波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣
blur
	name:blur
	type:composite
	aliases:["ぼかし","ブラー"]
	nodeSigns:["┃","┳","┻"]
	description:画面をぼやけさせる撮影手法
transition
	name:transition
	type:transition
	aliases:["トランジション","transition","]transition[","]><["]
	nodeSigns:["|","]><["]
	description:２つのショットが継続時間をもって入れ替わること
overlap
	name:overlap
	type:transition
	aliases:["OL","diss","オーバーラップ","closs-dissolve","]X[","]OL[","]diss[","]><[","]⋈["]
	nodeSigns:["|","]OL["]
	description:経過中の画面を二重写しにする転換のための演出手法
wipe
	name:wipe
	type:transition
	aliases:["wipe","]WIPE[","ワイプ"]
	nodeSigns:["|","]WIPE["]
	description:トラベリングマスクを利用して行うトランジション
wipeIn
	name:wipeIn
	type:transition
	aliases:["WIPE-IN","ワイプイン","]▲["]
	nodeSigns:["|","]▲["]
	description:被写体がワイプで画面に現れること
wipeOut
	name:wipeOut
	type:transition
	aliases:["WIPE-OUT","ワイプアウト","]▼["]
	nodeSigns:["|","]▼["]
	description:被写体がワイプで画面から消えること
iris
	name:iris
	type:transition
	aliases:["iris","アイリス","アイリスワイプ","]iris["]
	nodeSigns:["|","]iris["]
	description:アイリス（虹彩＝絞り）状のマスクを用いたワイプ
irisIn
	name:irisIn
	type:transition
	aliases:["IRIS-IN","アイリスイン","]iris-In[","]○["]
	nodeSigns:["|","]○["]
	description:ショットがアイリスワイプで現れること
irisOut
	name:irisOut
	type:transition
	aliases:["IRIS-OUT","アイリスアウト","]iris-Out[","]●["]
	nodeSigns:["|","]●["]
	description:ショットがアイリスワイプで消えること
` */

/**  追加予定メモ
offFocus
scale
scaleUP
scaleDown
gondola

中OL
*/
/*
    区間開始・終了ノードの予約語
    これはコーディングしちゃったほうが良さそう
    開始ノードを定義して終了ノードは対で使用ただし省略は可能
    データ構造は、[開始シンボル,終了シンボル]の配列
    終了シンボルは開始シンボル再利用固定、対応シンボル固定、またはフリー
    常に終了シンボルは省略可能
    フォーマットで規定してしまったほうが良さそうなのであった
    

var CamNodeSigns	=[["▽","△"],["▼","▲"],["┳","┻"],["┬","┴"],["↑","↓"],["⇑","⇓"]];//["◎"],["＊"],["○"],["●"],["□"],["■"],["◇"],["◆"],["☆"],["★"]
//カメラノードサインは、配列で登録する  要素数１の配列は開始と終了を同じサインで行う
var TrnNodeSigns	=["].+[","]><[","]X[","]⋈["];
//トランジションノードサインは、開始サインと終了サインを一致させる。継続長２フレーム以下の場合は開始サインのみでOK
var FxNodeSigns	=[").+(","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
//効果ノードサインは、開始サインと終了サインを一致させる。トランジションタイプの効果はトランジションサインを使用する
var NodeSigns =[").+(","]X[","]⋈[","[.+]","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
			//範囲ノード予約記述  インターポレーションサインの機能も併せ持つ  詳細別紙
var DialogSigns=["(*)","____","----","⁀⁀⁀⁀","‿‿‿‿"];
			//ダイアログ（サウンド）タイムライン専用のセパレーター  詳細別紙
*/


/* TEST
	カメラワーク記述データをGoogleスプレッドシート向けにテキストダンプ
	2019.08.23


var A = JSON.parse(nas.cameraworkDescriptions.dump('JSON'));
var result = '';
var idx = 0 ;
for (var prp in A){
	result += idx +'\t';
	result += A[prp].name +'\t';
	result += A[prp].type + '\t';
	result += A[prp].description + '\t';
	result += '={"';
	result += A[prp].nodeSigns.join('","') + '"}\t\t\t';
	result += '={"';
	result += A[prp].aliases.join('","') + '"}';
	result += '\n';
	idx ++;
};

result;
*/
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas = nas;
}