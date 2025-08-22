'use strict';
/*=======================================*/
// load order:3
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config    = require( './nas_common' ).config;
    var appHost   = require( './nas_common' ).appHost;
    var nas       = require( './nas_common_Image' ).nas;
}
/** 
    アニメーション記述値オブジェクトライブラリ

コーディング中なので、マージは保留   2016- 12.24
    xMap/Xpsで使用する値オブジェクト群

    新規のオブジェクトは、基本的に new コンストラクタ() ではなく
    Object.create(親オブジェクト)又は、各クラスの.newAnimationXXX() メソッドで作成すること
    各々のValueオブジェクトはnas.xMap.xMapElementのcnontentプロパティとなる
    置きかえタイムラインの（区間）値としては参照を持つ
    タイムシート上は回数未定で同じ値が再利用される

このソースは、nasライブラリの基底オブジェクトを組み合わせて構成される
タイムライントラックの値（=xMapに登録されるelementの値）となるオブジェクト群

ライブラリを分割して nas_AnimationValues.js として nas_common.jsの後 xpsio mapioの前に読み込むものとする

            nas.Animation<Values>

xMapElementの値オブジェクト
xMapElementを介してXpsTimelineSectionの値となる

nas.AnimationCamerawork     抽象化された撮影指示を記述する値オブジェクト
nas.AnimationComposite      画像合成を記述する値オブジェクト
nas.AnimationDesctiption    注意点や特記内容を記述するオブジェクト
nas.AnimationGeopmetry      要素の配置を記述する値オブジェクト
nas.AnimationReplacement    画像データを保持してその置き換えを記述するオブジェクト
nas.AnimationSound          音響情報を記述するオブジェクト
nas.AnimationDialog         セリフ情報を記述するオブジェクト

*/
nas.AnimationDescription = function(parent,content){
    this.parent      = (parent)? parent : null     ;//xMapElementGroup or null
    this.contentText = (content)? content : '';//コンテンツソース
    this.bodyText    = '';//ト書き本文
    this.comments    = [];//コメントキャリア
    this.offset      = '';//
}
/**
 *  nas.Xps.XpsTimelineトラックの値
 *
 *<per>
  *</pre>
 */
/**
 * ValueInterpolatorは必要な情報を収集して、value プロパティに対して中間値を請求するオブジェクト
 * 実際の計算は各値のValue自身が行い仮のオブジェクトを作成して返す
 * 値エージェントとなるオブジェクト
 * 各valueプロパティには中間値補間
 * startValue.interpolate(endValue,indexCount,indexOffset,frameCount,frameOffset,props)
 * が実装される
 * ただし、Sound等中間値補間の存在しないオブジェクトには当該メソッドは不用（undefined）
 * そもそも補間区間を作らないので、ValueInterpolatorオブジェクトが作成されない
 *
 * nas.Xps.XpsTimelineSection.valueプロパティはnas.xMap.xMapElement
 *  @params {Object nas.Xps.XpsTimelineSectionCollection}
 */

nas.ValueInterpolator = function ValueInterpolator (parent){
    this.parent=parent;//interpolateSection
}


nas.ValueInterpolator.prototype.valueOf = function valueOf(myProp){
        var indexCount=parseInt(this.parent.subSections.length);//サブセクションの総数なので親の親のサブセクション
        var indexOffset=this.parent.id()
        var startValue=this.parent.parent.sections[currentIndex-1].value;
        var frameCount=this.parent.duration;
        var frameOffset=this.parent.startOffset();
        var endValue=this.parent.parent.sections[currentIndex+1].value;
        return startValue.interpolate(endValue,indexCount,indexOffset,frameCount,frameOffset,myProp);

/*
        var indexCount=parseInt(this.parent.parent.subSections.length);//サブセクションの総数なので親の親のサブセクション
        var indexOffset=this.parent.id()
        var startValue=this.parent.parent.parent.sections[currentIndex-1].value;
        var frameCount=this.parent.parent.duration;
        var frameOffset=this.parent.startOffset();
        var endValue=this.parent.parent.parent.sections[currentIndex+1].value;
        return startValue.interpolate(endValue,indexCount,indexOffset,frameCount,frameOffset,myProp);
*/
}

nas.ValueInterpolator.prototype.getStream = function getStream(frameCount){
    if(! frameCount) frameCount=this.parent.duration;
    var resultContent = new Array(frameCount);
    resultContent[0] = this.parent.getContent()[0];
    return resultContent;
}


/** 
 *  @summary
 *  静止画置換オブジェクト<br />
 *  置き換えトラックの値となるオブジェクト
 *<pre>
 * contentTextはxMapの記述の該当部分を改行区切りテキストで与える
 * 
 * データ型式は 第一、第二型式混載で自動判別
 *
 *    第一型式
 *^<group>\t<elementID>[\t<optionString>[\t<comment>]]$   
 *エントリーの定義を兼ねる
 *A	A-1-end	"c:\temp\A001.png"	FIX
 *    第二型式
 *^\t<property> = <value>$
 * 第二型式（プロパティ名＝値）型式の場合はそのまま使用
 *	size = 120Fl
 *
 * 第二型式に当てはまらない場合は、第一型式とし最大4フィールドのタブ区切りテキストとみなす
 * =冒頭から３つまでのタブで分割する
 *
 *
 * 第一フィールドは、グループ名パース時点のみの情報
 * 第二フィールドは、エレメント名 エレメント名単独でパースを行いグループ含まれる場合グループ名を上書きする
 * 第三フィールドは、オプションプロパティcsv URI,width,height,offsetX,offsetY,offsetR フィールド位置依存
 * 第四フィールドは、エレメントに対するコメント レコード終了までをすべて保存
 * 
 * 第三フィールドは、csvパーサを通してプロパティに割り付けを行う
 * 第三フィールド以降、レコード内はタブを含むすべての記述がエレメントに対するコメントプロパティとなる
 * 
 * 情報はすべて省略可能
 * 省略時は、各要素の親となるグループの持つプロパティを引き継ぐ
 *
 * 以上、各エレメント共通
 *
 *
 *以下種別ごとの第一型式情報並び(エレメントの配置)フォーマット
 *
 *    置きかえタイムラインエレメント    
 *["file","size.x","size.y","offset.x","offset.y","offset.r"]
 *
 *    カメラワークタイムラインエレメント
 *[フィールドテキスト]     フィールド記述テキストは別定義のパーサに通す 16夏改装では保留
 *
 *    エフェクトタイムラインエレメント
 *[エフェクトテキスト]     エフェクト記述テキストは別定義のパーサに通す 16夏改装では保留
 *
 *xMapのパース時は、ドキュメントの記述を整形してそれを引数としてオブジェクトを初期化する
 *
 *XPSのデータをパースする場合は、データ記述からキーワードを抽出して適合するｘMapエレメントを検索する
 *検索に外れた場合は、デフォルトでオブジェクトを初期化
 *都度値を与えてxMapに登録する
 *
 *xMapがない場合（暫定コード）では、仮のｘMapデータにエントリを送り以降の再利用に供する
 *
 * 以下 各値オブジェクトに共通
 *
 * 親オブジェクト参照としてparentプロパティを置く
 * 基礎プロパティからの設定拡張のフラグとして extendedプロパティ
 *
 * 一時的にセクションの値として初期化する場合は、第二引数が第一形式で与えられる
 *
 *    new nas.AnimationReplacement(null,"GroupID\tElementName");
 *        または
 *    new nas.AnimationReplacement(Object xMapElmentGroup,"GroupID\tElementName");
 *
 * parent オブジェクトなしで初期化される場合があるので要注意
 * その場合は 可能な限りGroupを抽出してparentを設定して不能な場合はnullのままにしておく
 *
 *</pre>
 *  @params {Object xMapElementGroup|null} myParent
 *  @params {String} myContent
 *      xMap content string
 
 */
nas.AnimationReplacement=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;//xMapElementGroup or null
    this.contentText = (myContent)? myContent : 'blank-cell';//xMap上のコンテントソースを保存する 自動で再構築が行なわれるタイミングがある
                                                   //myContent undefined で初期化を行った場合の値は blank-cell
    this.name                                     ;//素材名（グループ名はあっても除かない）
    this.source                                   ;//nas.AnimationElementSource
    this.comment                                  ;//コメント文字列 エレメントの注釈プロパティ-xMap編集UIのみで確認できる
    this.extended = false;

    this.formGeometry                             ;//nas.AnimationFieldオブジェクト
    this.resolution                               ;//要素の解像度   nas.Resolution()
    this.size                                     ;//要素のサイズ   nas.Size()
    this.offset                             ;//要素の原点オフセット   nas.Offset()
    this.pegOffset                          ;//要素のペグオフセット＊ これらはオブジェクトで統合？
    this.overlay                            ;//カブセの対象となるエレメントへの参照  < elementのプロパティへ移行が必要？
    
    this.parseContent();
}
/**
    同値判定メソッド
    値種別ごとに同値判定条件が異なるので注意
*/
nas.AnimationReplacement.prototype.sameValueAs = function(target){
    return (
        (target instanceof nas.AnimationReplacement)&&
        (nas.compareCellIdf(this.name,target.name))&&
        (this.source == target.source)&&
        (this.extended == target.extended)
    );
}
/**
 *    引数なし または引数が１つで文字列'basic'またはfalseと判断される場合は標準保存形式出力
 *    標準保存形式(グループ名/エレメント名＋主要プロパティの１行出力)
 *^<group>\t<cellDescription>\t< ここまではElementObjectの出力範囲
 *<proppertyValues>\t<comment>
 *    例
 *"./stages/kd/kt#00[pilot]__s-c001_kd.psd///kd/A/0001+",254mm,142.875mm,127mm,71.4375mm	testOverlay
 *
 *proppertyValuesは、comma区切りで以下の順のデータ
 *["<source>"[,size.X,size.Y[,offset.X,offset.Y[,offset.R]]]]
 *末尾から順にすべて省略可能
 *各エントリに登録のない場合はデフォルトの値が使用される
 *
 *    //  引数が一つ以上ある場合の処理
 *  parentがnullで初期化されたオブジェクトは、グループ名 ""
 *    @params {String} exportForm
 *        extend|basic
 *      引数が 'extend'の場合は拡張保存形式で返す
 *    拡張保存形式(グループ名,エレメント名を含まないタブを先頭にした複数行出力)
 *^\t<propname> = <proppertyValue>$\n
 *    例
 *	file = "./stages/kd/kt#00[pilot]__s-c001_kd.psd///kd/A/0001+"
 *	
 *	
*/
nas.AnimationReplacement.prototype.toString=function(exportForm){
    if(exportForm == 'extend'){
        var resultArray=[];
        if(this.source)   resultArray.push('\tsource = "'    + this.source.toString(true)+'"');
        if(this.size)     resultArray.push('\tsize = '     + this.size.toString());
        if(this.offset)   resultArray.push('\toffset = '   + this.offset.toString());
        if(this.rotation) resultArray.push('\trotation = ' + this.rotation.toString());
        if(this.comment)  resultArray.push('\tcomment = '  + this.comment);
        return resultArray.join("\n");
    }else if ((arguments.length==0)||((arguments.length==1)&&(! arguments[0]))||(exportForm == 'basic')){
        var resultArray=[];
        var groupName =((this.parent)&&(this.parent.name))? this.parent.name :"";
        if(this.source)   resultArray.push('"'+this.source.toString()+'"');
        if(this.size)     resultArray.push(this.size.toString());
        if(this.offset)   resultArray.push(this.offset.toString());
        if(this.rotation) resultArray.push(this.rotation.toString());
        resultArray = [resultArray.join(",")];
        if(this.comment) resultArray.push(this.comment);
        return ([groupName,this.name,resultArray.join("\t")]).join('\t');
    }
}
//nas.AnimationReplacement.prototype.valueOf=function(){
//    return nas.parseNumber(nas.normalizeStr(this.name).replace(/^[^0-9]*/,""))
//valueOfの設定自体にあまり意味が無いのでやめたほうがヨサゲ 
//}
/** 与えられたオブジェクトとプロパティ同士を比較して 変更状態を返す
    引数
対照する基準値（オブジェクト）
    戻り値
変更状態コード
0   変化なし    最小標準出力に対応
1   標準変更    拡張標準出力に対応
2   重度変更    フルダンプに対応
*/
nas.AnimationReplacement.prototype.compareWith= function(targetValue){
    var igunoreProps    =['contentText','source'];
    var basicProp       =['size','offset','comment'];
    var extendProps     =['pegOffset',];
}
/** タイミングパラメータに従って指定されたフレームのキー間の補完値を返す

   置きかえタイムラインの中間値は前方値で代表されるので基本的に戻り値は自分自身
    オプションの状態によって（時間的）中間タイミングで後方値に切り替える
    return endValue;
    又はブランク状態のオブジェクトを返す
   return new nas.newAnimationReplacement("blank");
*/
nas.AnimationReplacement.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;
}

/** Contentをパースして プロパティを設定する内部メソッド
引数でcontentを与えてオブジェクト全体の値を更新することも可能
引数がAnimationRepalcementであった場合は、全プロパティを継承して引き写す
ただし引数と同じジョブ内のコレクションに追加を行う場合は、失敗するので要注意

xMap形式のデータをパースする nas.AnimationXXX シリーズオブジェクトの共通メソッド
xMapパーサから呼び出す際に共通でコールされる
引数が与えられない場合は、現在の保持コンテンツを再パースする
*/
nas.AnimationReplacement.prototype.parseContent = function(myContent){
//console.log(myContent);
//    var blankRegex  = new RegExp("^[ｘＸxX×〆0０]$");//カラ判定 システム変数として分離予定
    var interpRegex = new RegExp("^[\-\+=○●・a-zア-ン]$|^\[[^\]]+\]$");//中間値補間（動画記号）サイン 同上
    var valueRegex  = new RegExp("^[\(<]?([A-Z][\-_\.]?)?[0-9].+[>\)]?$");//無条件有効値 同上
//    var valueRegex  = new RegExp("^[\(<]?[0-9]+[>\)]?$");//無条件有効値 同上

//引数がなければ現在のコンテンツを再パース
    if(typeof myContent == 'undefined'){
        myContent = this.contentText;
    }else{
        
        this.contentText = myContent;
    }
/*
    AnimatiopnReplacementの特殊値として
    contentText='blank-cell'を設ける
    AnimationElementSource("")
    サイズは不問  シンボルとしての「カラセル」

*/
    if(myContent == 'blank-cell') return this;
    var isGroup = (myContent.indexOf('[')==0)? true:false;
//第一形式グループ ^[\<group>\t<typeName>[\t<option-text>[\t<comment>]]\]$
//第二形式エントリ ^<group>\t<name>[\t<option-text>[\t<comment>]]$

    myContent = String(myContent).split('\n');
    for ( var line = 0 ; line < myContent.length ; line++){

    if((isGroup)&&(myContent[line].indexOf('[')==0)) myContent[line] = myContent[line].slice(1,-1);//ブラケット削除

        if(myContent[line].match(/^\t(\S+)\s*=\s*(.+)\s*$/)){
            //第二形式(タブ開始)でプロパティ別のデータ更新を行う
            this.extended=true;

            var myProp=RegExp.$1;var valueArray=csvSimple.parse(RegExp.$2)[0];
//console.log(valueArray);
            switch(myProp){
            case   "file":;// 旧プロパティ互換
            case   "path":;// 旧プロパティ互換
            case    "url":;//互換プロパティ
            case "source":
                this.source = new nas.AnimationElementSource(valueArray[0]);
            break;
            case "resolution":
                this.resolution= new nas.Resolution(valueArray.join(','));
            break;
            case "resolution.X":
                this.resolution.x = new nas.UnitResolution(valueArray[0],this.resolution.type);
            break;
            case "resolution.Y":
                this.resolution.y = new nas.UnitResolution(valueArray[0],this.resolution.type);
            break;
            case "size":
                this.size = (valueArray.length<3)?
                    new nas.Size(valueArray[0],valueArray[1]):new nas.Size(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "size.X":
                this.size.x = new nas.UnitValue(valueArray[0]);
            break;
            case "size.Y":
                this.size.y = new nas.UnitValue(valueArray[0]);
            break;
            case "offset":
                this.offset = (valueArray.length<3)?
                    new nas.Offset(valueArray[0],valueArray[1]):new nas.Offset(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "offset.X":
                this.offset.x = new nas.UnitValue(valueArray[0]);
            break;
            case "offset.Y":
                this.offset.y = new nas.UnitValue(valueArray[0]);
            break;
            case "offset.R":
                this.offset.r = new nas.UnitAngle(valueArray[0]);
            break;
            case "pegOffset":
                this.offset = (valueArray.length<3)?
                    new nas.Offset(valueArray[0],valueArray[1]):new nas.Offset(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "pegOffset.X":
                this.offset.x=new nas.UnitValue(valueArray[0]);
            break;
            case "pegOffset.Y":
                this.offset.y=new nas.UnitValue(valueArray[0]);
            break;
            case "pegOffset.R":
                this.offset.r=new nas.UnitAngle(valueArray[0]);
            break;
           default:
                this[myProp]=valueArray[0];
            }
        } else if(myContent[line].match(/^(\S+)\t?(\S+)\t?([^\t]+)?\t?(.*)$/)){
        // 第一形式の再パース
//console.log(myContent[line]);
            var myGroup=RegExp.$1; //グループの再パースは行われない
            var myName =RegExp.$2;
            var myComment=RegExp.$4;
            var valueArray=nas.parseDataChank(RegExp.$3);
            var numeProps =[["size","x"],["size","y"],["offset","x"],["offset","y"]];

//console.log(myComment);
//console.log(myName);
//console.log(valueArray);
//console.log(this);
/*
    フィールド文字列であった場合の判定が必要 2018 10 09

case :this.parent == null
*/
            if((! (this.parent))||(myGroup == this.parent.name)){
//                if(! isGroup) this.name = myName.replace(new RegExp('^'+myGroup+'\-'),"");
                if(! isGroup) this.name = myName;
                var numCount=0;
                for(var vix=0;vix<valueArray.length;vix++){
                    switch(valueArray[vix].type){
                    case "numeric":
                    case "unitValue":
                        if(numCount<numeProps.length){
                            if(! this[numeProps[numCount][0]]){
                                this[numeProps[numCount][0]] = ([numeProps[numCount][0]]=='size')? new nas.Size():new nas.Offset();
                            }
                            this[numeProps[numCount][0]][numeProps[numCount][1]] = new nas.UnitValue(valueArray[vix].value);
                            numCount++;
                        }
                    break;
                    case "unitAngle":
                        if(! this.offset) this.offset = new nas.Offset();
                        this.offset.r==new nas.UnitAngle(valueArray[vix].value);            
                    break;
                    case "unitResolution":
                        this.resolution=new nas.Resolution(valueArray[vix].value);            
                    break;
                    case "source":
                        this.source=new nas.AnimationElementSource(valueArray[vix].value);            
                    break;
                    default:
                        continue;
                    }
                }
                if(myComment) this.comment = myComment;
            }
        }

    }
    return this;    
}
/** 指定フレーム数に内容を展開して配列で返す
引数 :cellCount
戻値 :配列 + offset
*/
nas.AnimationReplacement.prototype.getStream=function(cellCounts){
    var myResult=new Array(cellCounts);
    myResult[0]=(this.name)? this.name:"";
    if (myResult[0].match(/blank(-cell)?/)) myResult[0]="×";
    return myResult;
}
/**
    置きかえタイムライントラックをパースしてセクションコレクションを返す
    セクションの値は各トラックごとxMapを介したxMapエレメントのcontentプロパティを接続

    パース時にセクションの値判定を行う
    ・無効記述
    ・有効記述 値あり（既存xMapエレメント）・なし（新規xMapエレメント）
    
 タイムライントラックをパースする際に統一手順としてトラックに対応するxMapエレメントグループの有無を確認する。
現行Jobにトラックと同名のエレメントグループが、存在しなかった場合（Stageには存在する可能性あり）は、新規にグループを作成してエントリすること。
この処理は、トラックパースの前段階で共通で行うことにする

確認手段は nas.xMap.getElementByName(グループ名)を使用
//nas.Xps.XpsTimelineTrack.parseTimelineTrack() メソッドに置く


中間値補間区間の空セルに対応するために全体のブランク処理をサブセクションコレクションに置く
置きかえタイムラインのみの処置
カラ状態のみを扱うsctionCollectionを併置してセットで扱うので注意
各セクションのvalueは on/off(true/false)のみでオブジェクトは使用されない エレメントへのリンクも無い
一つのトラックをパースして二つのセクションコレクションを得る
値側のコレクションは、従来のカラを含むことができるが、このパーサが書き出すデータ上は従来型のカラが含まれることは無い
カラ区間の値は先行区間の値となる
カラセル区間コレクションは2つの状態しか持ち得ないので、サブセクションは発生しない

 */
nas._parseReplacementTrack=function(){
//    var blankRegex  = new RegExp("^[ｘＸxX×〆0０]$");//カラ判定 システム変数として分離予定
//    var interpRegex = new RegExp("^[\-\+=○◯●・a-zア-ン]$|^\[[^\]]+\]$");/*中間値補間（動画記号）サイン 同上*/
    var valueRegex  = new RegExp("^[\(<][^>\)]+[>\)]$|^[\(<]?([A-Z][\-_\.]?)?[0-9]\S+[>\)]?$|^[0-9]+.?$");
    /* 無条件有効値 */
//    var valueRegex  = new RegExp("^[\(<]?([A-Z][\-_\.]?)?[0-9]\S+[>\)]?$|^[0-9]+.?$");//無条件有効値 同上
    //自分自身(トラック)を親として新規セクションコレクションを作成
    var myCollectionBlank = new nas.Xps.XpsTimelineSectionCollection(this);//ブランクベースコレクション
    var myCollection      = new nas.Xps.XpsTimelineSectionCollection(this);//ベースコレクション

    var appearance    = new nas.AnimationAppearance(null,'on');
    var disAppearance = new nas.AnimationAppearance(null,'off');

    //継続時間０で値未定初期セクションを作成
    //値を持たないセクションをブランク値のオブジェクトとするか？
    var currentSection=myCollection.addSection(null);
    
    var currentSubSection = null;
    var currentValue      = this.getDefaultValue();
    if(! currentValue) currentValue = new nas.AnimationReplacement('system','blank-cell');
//console.log(currentValue)
    var isInterp = false;
    var isBlank  = ((! currentValue)||(currentValue.contentText == "blank-cell"))? true:false ;//デフォルトのブランク状態を取得

var currentSectionBlank=(isBlank)? myCollectionBlank.addSection(disAppearance):myCollectionBlank.addSection(appearance);

    var valueDetect = false;
/**
    タイムライントラックのデフォルト値は、以下の手続きで取得
    タイムラインラベルが指定するグループがあらかじめ存在する場合は、そのグループオブジェクトが保持する値
    存在しない場合は、新規にグループを作成する。その際にトラックの種別ごとのValueオブジェクトを初期値として登録するのでその値を使用
    nas.Xps.XpsTimelineTrack.getDefeultValue()側で調整
    Replacementの場合基本はブランクだが、必ずしもブランクとは限らないので要注意
    トラック上で明示的なブランクが指定された場合は、値にfalse/null/"blank"を与える。
*/
    for (var fix=0;fix<this.length;fix++){
        var currentCell=nas.Xps.sliceReplacementLabel(new String(this[fix]));//記述をラベルとエントリに分解
        if( currentCell.length == 1 ){ currentCell.push(this.id); }//エントリにグループ名が含まれないようならばトラックのラベルで補う
        // ここでデータの形式は [name,groupName] となる
        currentSection.duration ++; //
        currentSectionBlank.duration ++;     //セクション長加算
        if(currentSubSection) currentSubSection.duration ++ ;
        //未記入データ　これが一番多いので最初に処理しておく(処理高速化のため)
        if(currentCell[0].match(/^([\|｜;]|\s+)?$/)||(currentCell[0]==null)||(currentCell.length==0)) continue;
        /*      ブランク判定
            値処理に先立ってブランク関連の処理をすべて終了する
            ブランク状態切り替え判定 カレントを切り替えて新規セクションを積む
        */
        var valueDetect   = false;//値検出状態初期化
        var blankDetect   = (String(currentCell[0]).match(nas.CellDescription.blankRegex))?  true:false;//値からブランク状態を検出
        var interpDetect  = (String(currentCell[0]).match(nas.CellDescription.interpRegex))? true:false;//括弧つきの補間サインも同時検出へ
//console.log(fix+":"+this[fix]+" interp:"+interpDetect + "  blank: " + blankDetect);
        //ブランク処理判定
        if(blankDetect){
                if(! isBlank){
                    if(fix==0){
                        currentSectionBlank.value=disAppearance;
                        currentSection.value = new nas.AnimationReplacement('system','blank-cell');// *Blank-set
                    }else{
                        currentSectionBlank.duration --;
                        currentSectionBlank=myCollectionBlank.addSection(disAppearance);
                        currentSectionBlank.duration ++;
                        currentSection.duration --;// *
                        currentSection=myCollection.addSection(this.pushEntry('blank-cell','system'));// *
                        currentSection.duration ++;// *
                        if(currentSubSection){
                            currentSubSection.duration --;
                            currentSubSection = null;
                        }
                    }
                    isBlank=true;
                }
                continue;
        }
//         else if(fix==0){    currentSectionBlank.value=appearance; }
        //中間値補間サインを検出したら中間値処理モード
        //既定値以外の補間サイン検出が必要>> 規定値のみを補完サインと定義する 他の記述はコメントとして利用
        if(interpDetect){
              if( isBlank ){
                 if(fix==0){
                    currentSectionBlank.value=appearance;
                 }else{
                    currentSectionBlank.duration --;
                    currentSectionBlank=myCollectionBlank.addSection(appearance);
                    currentSectionBlank.duration ++;
                 }
                 isBlank = false;
              }
              if(! isInterp ){
                //中間値補間区間開始 カレントセクションを切り替え サブセクションを登録
                isInterp = true;
                if(fix==0){
                    currentSection.value="interpolation";
                        currentSection.subSections=new nas.Xps.XpsTimelineSectionCollection(currentSection);
                }else{
                    currentSection.duration --;
                    currentSection=myCollection.addSection("interpolation");
                    currentSection.duration ++;
                }
                currentSubSection = currentSection.subSections.addSection(new nas.AnimationReplacement(null,currentCell.join("\t")));
                currentSubSection.duration ++;
                //新規中間値補間セクションを立てる 以降は、モードを抜けるまでカレント固定
              }else{
                if (currentSubSection) currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection(new nas.AnimationReplacement(null,currentCell.join("-")));
                currentSubSection.duration ++;
                //中間値補間モード内ではサブセクションを登録
              }
              continue;
        }
        //区間値を処理
/**
    既存エントリがない場合、エントリ文字列が条件を満たせば新規エントリとしてxMapにグループとエントリを登録して使用する
    それ以外は、無効エントリとなる
*/
        var currentElement = this.xParent.parentXps.xMap.getElementByName(currentCell.join("-"));
        if(currentElement) {
//console.log("value detcted in xMap:");
            valueDetect=true;
        }else{
//console.log("value not detcted in xMap: push Entry "+currentCell.reverse().join("-"));
            if(String(currentCell[0]).match(valueRegex)){
                valueDetect = true;
                currentElement=this.pushEntry(currentCell[0],currentCell[1]);
                currentElement=this.pushEntry(this[fix],currentCell[1]);
            }
        }
//console.log(valueDetect);
//console.log(currentElement);
        if(valueDetect){
                currentValue = currentElement.content;
            if(isBlank){
                if(fix==0){
                    currentSectionBlank.value=appearance;
                }else{
                    currentSectionBlank.duration --;
                    currentSectionBlank=myCollectionBlank.addSection(appearance);
                    currentSectionBlank.duration ++;
                }
                isBlank = false;
            }
            if(isInterp){
                isInterp = false;
                if(currentSubSection){
                        currentSubSection.duration --;
                        currentSubSection = null;
                };
            }
            if(fix==0){
                currentSection.value = currentValue;
            }else{
                currentSection.duration --;
                currentSection = myCollection.addSection(currentValue);
                currentSection.duration ++;
            }
        }
        continue
    }
//console.log(myCollection)
    this.sections       = myCollection;
    this.sectionsBlank  = myCollectionBlank;
//console.log("sections-length:"+myCollection.length +":blank:"+myCollectionBlank.length);
    return this.sections;//ブランク情報の返し方を考えたほうが良いかも
}

/*test

nas.Xps.XpsTimelineTrack.prototype.parseReplacementTrack=nas._parseReplacementTrack;
XPS.xpsTracks[2].parseReplacementTrack();
XPS.xpsTracks[2].sections[1].toString();

nas.Xps.XpsTimelineTrack.prototype.parseReplacementTrack=nas._parseReplacementTrack;

nas.Xps.XpsTimelineTrack.prototype.parseCameraWorkTrack=nas._parseCameraworkTrack;

nas.Xps.XpsTimelineTrack.prototype.parseCompositeTrack=nas._parseCompositeTrack;//コンポジット

//nas.Xps.XpsTimelineTrack.prototype.parseTrack=nas._parseTrack;
//nas.Xps.XpsTimelineTrack.prototype.parseTrack=nas._parseTrack;
*/
/*
ノートテキスト・タイムシート記述（カメラワーク・エフェクト）オブジェクト
具体的なステージワークやコンポジットワークを抽象化した シンボリックオブジェクト
トラック内には複数のオブジェクトを表記可能

値区間のみ
または値区間にぶら下がった補完区間を一組として扱う
トラック名は、基本的に論理的な分類の役割のみをあつかう

各効果は必要に従ってジオメトリトラック コンポジットトラックとして分解統合が期待される
このトラックのリンクとペアレントは、必ずしも整合性を持たない。

"[A],▽,|,|,|,|,|,PAN,|,|,|,|,|,△,[B]"
"[1],▽,|,|,|,|,|,SL→,|,|,|,|,|,△,[2]"
"]OL[,|,|,|,|,s-c12,＊,s-c13,|,|,|,|,]OL["
"]WIPE[,|,|,|,|,s-c12,＊,s-c13,|,|,|,|,]WIPE["
"▲,|,|,FI,|,|,▲"
"■","■","■","<黒コマ>","■","■","■"

等のソースストリームをパースする

＞ブランクセクション   値なしで長さのみがある Section.value.type = geometryセクションの前後には必ずつく

区間を開始するエントリー
    [ブラケット]値エントリ
後続フレームから値つきgeometry区間を開始

    ]逆ブラケット[エントリ
トランジション区間を開始・終了
開始時に終了サインを設定

    空白エントリ
空白区間を開始
何らかの有効エントリーで終了




*/

nas._parseCameraworkTrack= function(){
    var myCollection       = new nas.Xps.XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    var currentSection     = myCollection.addSection(null);//開始セクションを作成 継続時間０ 値は保留
    var currentValue       = new nas.AnimationCamerawork(null,"");//コンテンツはカラで初期化も保留
    var currentSymbol      = null;

    var startNodeRegex=new RegExp("^[▼▽⇑●◯◎◆◇★☆┳┬]$");
    var endNodes={
        "▼":"▲",
        "▽":"△",
        "⇑":"⇓",
        "●":"●",
        "○":"◯",
        "◎":"◎",
        "◆":"◆",
        "◇":"◇",
        "☆":"☆",
        "★":"★",
        "┳":"┻",
        "┬":"┴"
    };// */
    var startNodeId = 0;
    var endNode;
    var lastBracketsId ;
    
    for (var fix=0;fix<this.length;fix++){
        var isBlank = (String(this[fix]).match(/^\s*$/))? true :false ;
        if (String(this[fix]).match(/^\[[^\[]+\]$/)){ lastBracketsId = fix;isBlank = true;}
        currentSection.duration ++;//currentセクションの継続長を加算

        if(
            (lastBracketsId == fix)&&
            ((!(currentSection.value))||(endNode))
        ) currentSection.tailMargin = -1 ;

//未記入セル カレントが空白セクションならば継続それ以外の場合は、セクション更新して継続
//[値]セルは未記入セル扱いにする
        if(isBlank){
            if((!endNode)&&(fix != lastBracketsId)) continue;
//            if( currentSection.value ){}
            
            if(endNode){
                currentSection.duration --;
                if (fix == lastBracketsId){
                    currentSection.value.postfix = this[fix];
                    currentSection.tailMargin = 1;
                }
                currentSection.value.attributes.push([currentSection.value.prefix,currentSection.value.postfix].join('-'));
                if(currentSection.value.prefix)  currentSection.headMargin = 1;
                currentSection = myCollection.addSection(null);//changeCurrentNull
                 if (fix == lastBracketsId) currentSection.headMargin = -1;
                currentSection.duration = 1;
                if(endNode)         endNode       = undefined ;//終了ノードクリア
                if(currentSymbol)   currentSymbol = null;//シンボルクリア
            }
            continue;
        }
/*
継続バー カレントが空白セクションの場合のみセクション更新して継続
このエントリのみ扱いが特殊
値区間が次の値区間開始でしか閉じない
*/
        if(
            (String(this[fix]).match(nas.cameraworkDescriptions.singleRegex))
        ){
            if(!(currentSection.value)){
                currentSection.duration --;
                if(currentSection.duration < 1) myCollection.pop();
                currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,false));//changeCurrent unknown
                currentSection.duration = 1;
                startNodeId = fix;
                endNode = true ;//endNode をtrueに設定 存在判定はするが、どのシートセルともマッチしない
                currentSymbol = nas.cameraworkDescriptions.get('unknown');
//先行セクションが[値]セルであった場合
                if(lastBracketsId == (fix-1)){
                    currentSection.value.prefix = this[lastBracketsId];
                    currentSection.headMargin = 1;
                };// */
            }
            continue;
        }
//エンドノードを検出した場合 検出用変数をクリアして 後続のセルを判定して動作を切り分け
/*
    記述継続の場合のみ先行でセクションを切り替える
    後続セルが空白セル||[値]セルならばNOP
    
    endNode検知
    フレーム内容がstartNodeに対応するendNodeでかつ後続フレームが値エントリでない場合のみセクションを閉じる
    最終フレーム処理では startNodeId==durationとなるが、以降の判定はないので放置

*/
       if((endNode)&&(this[fix] == endNode)){
        if(fix == (this.length-1)){
            var nextBlank = true;
        }else{
            var nextBlank = (String(this[fix+1]).match(/^\s*$/))? true :false ;
            if (String(this[fix+1]).match(/^\[[^\[]+\]$/)){ nextBlank = true;}
        }
                if(! nextBlank ){
                    var mySymbol = nas.cameraworkDescriptions.get(this[fix+1]);
                    var detectedName = false;
                    if((this[fix+1]).match(/^<([\>]+)>$/)){
                        detectedName = RegExp.$1;
                    }else if(mySymbol){
                        detectedName = mySymbol.name;
                    }
                    if(currentSection.duration < 1) myCollection.pop();
                    //if(currentSection.value) currentSection.value.parseContent();
                    currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,detectedName));//changeCurrent unknown
                    startNodeId   = fix + 1;
                    endNode       = undefined ;//終了ノードクリア
                    currentSymbol = null;//シンボルクリア 判定保留
//先行セクションが[値]セルであった場合
                if(lastBracketsId == (fix-1)){
                    currentSection.value.prefix = this[lastBracketsId];
                    currentSection.headMargin = 1;
                };// */
                }
//console.log(currentSection.value.type.join(':'))
                continue;
        }
//開始ノード（予約語）を検知 強制的に新しい区間を開始
       if( String(this[fix]).match(startNodeRegex)){
//区間の開始
            if(fix != 0){
                startNodeId = fix;//シート入力をスタートノードに設定
                endNode = endNodes[this[startNodeId]];//頭尾マッチ
                currentSection.duration --;
                if((currentSection.duration < 1)&&(lastBracketsId!=(fix-1))) myCollection.pop();
                if(lastBracketsId == (fix-1)){
                    currentSection.tailMargin = -1;                    
                }
//                if(currentSection.value) currentSection.value.parseContent();
                currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,false));//changeCurrent
                currentSection.duration = 1;
//先行セクションが[値]セルであった場合
                if(lastBracketsId == (fix-1)){
                    currentSection.value.prefix = this[lastBracketsId];
                    currentSection.headMargin = 1;
                };// */
//console.log(currentSection.value.type.join(':'))
                continue;
            }
        };
//].*[トランジションエントリ()
        if( String(this[fix]).match(/\^][^\[]+\[$/) ){
            var mySymbol = nas.cameraworkDescriptions.get(this[fix]);
            if(
                ((currentSection.value)&&(String(this[fix])!=endNode))||
                (!(currentSection.value))
            ){
//]transition[区間の開始
                startNodeId = fix;//シート入力をスタートノードに設定
                endNode = this[startNodeId];//トランジションの頭尾は一致
                if(fix==0){
                    currentSection.value=new nas.AnimationCamerawork(null,(mySymbol)?mySombol.name:this[startNodeId]);//change Value;
                    continue;
                }else{
                    currentSection.duration --;
                    if(currentSection.duration < 1) myCollection.pop();
                    //if(currentSection.value) currentSection.value.parseContent();
                    currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,(mySymbol)?mySombol.name:this[startNodeId]));//changeCurrent
                    currentSection.duration = 1;
                }
            }
//console.log(currentSection.value.type.join(':'))
            continue;
        }
//第一エントリで区間タイプが判別可能な区間の判定
        if(
            String(this[fix]).match(nas.cameraworkDescriptions.singleRegex)
         ){
            var mySymbol = nas.cameraworkDescriptions.get(RegExp.$1);
if(! mySymbol) console.log(this[fix]);
            if((!(currentSection.value))||(currentSection.value.type[1]!=mySymbol.name)){
//Symbol区間の開始
                if(fix==0){
                    currentSection.value=new nas.AnimationCamerawork(null,mySymbol.name);//change Value;
//console.log(currentSection.value.type.join(':'))
                    continue;
                }else{
                    currentSection.duration --;
                    if(currentSection.duration < 1) myCollection.pop();
                    //if(currentSection.value) currentSection.value.parseContent();
                    currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,mySymbol.name));//changeCurrent
                    currentSection.duration = 1;
//先行セクションが[値]セルであった場合
                    if(lastBracketsId == (fix-1)){
                        currentSection.value.prefix = this[lastBracketsId];
                        currentSection.headMargin = 1;
                    };// */
                }
            } else if(
                (fix<(this.length-1))&&(this[fix+1]!=this[fix])
            ){
                if(currentSection.duration < 1) myCollection.pop();
                //if(currentSection.value) currentSection.value.parseContent();
                if(String(this[fix+1]).match(/^\s*$/)){
                    currentSection = myCollection.addSection(null);//changeCurrentNull
                    endNode     = undefined;
                    currnetSymbol = null;
                }else{
                    currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,false));//changeCurrent
                    startNodeId = fix+1;//シート入力をスタートノードに設定
                    if ((!(endNode)) && (endNodes[this[startNodeId]])) endNode = endNodes[this[startNodeId]] ;
                    currnetSymbol = mySymbol;
               }
//先行セクションが[値]セルであった場合
                if(lastBracketsId == (fix-1)){
                    currentSection.value.prefix = this[lastBracketsId];
                    currentSection.headMargin = 1;
                };// */
            }
//console.log(currentSection.value.type.join(':'))
            continue;
        }
/*==================================================================*/
//一般セクションの処理
//トラック開始フレームであった場合のみ無条件でセクション開始 
//セクション開始Idは初期値で更新不用 エンドノードは 予約語内の対応文字列＞シンボルが同定可能ならそのデータ＞開始文字列と同じ
        if((fix==0)||(! currentSection.value)){
//先行セクションが空白であった場合のみセクション開始
            startNodeId = fix;
            if(! currentSymbol) currentSymbol = nas.cameraworkDescriptions.get(this[startNodeId]);
            if(! currentSymbol) currentSymbol = nas.cameraworkDescriptions.get('unknown');
            var detectName = false;
            if(currentSymbol.name != 'unknown') detectName = currentSymbol.name;
            if(fix==0){
                currentSection.value=new nas.AnimationCamerawork(null,detectName);//setValueToCurrentSection;
            }else{
                currentSection.duration --;
                if(lastBracketsId == (fix-1)) currentSection.tailMargin = -1; 
                if(currentSection.duration < 1) myCollection.pop();
                //if(currentSection.value) currentSection.value.parseContent();
                currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,detectName));//changeCurrent
                currentSection.duration = 1;
//先行セクションが[値]セルであった場合のみ
//                if((lastBracketsId == (fix-1))&&(currentSymbol.type != "composite")&&(currentSymbol.type != "transition")){}
                if(lastBracketsId == (fix-1)){
                    //if(currentSymbol.type != "geometry"){
                    //    currentSymbol = nas.cameraworkDescriptions.get('SL');
                    //    currentSection.value=new nas.AnimationCamerawork(null,currentSymbol.name);
                    //}
                    currentSection.value.prefix = this[lastBracketsId];
                    currentSection.headMargin = 1;
                }
            }
            //スタートノードに対応するエンドノードが予約語内にあればそちらを優先
            if (endNodes[this[startNodeId]]){
                endNode = endNodes[this[startNodeId]];
            } else if((currentSymbol)&&(currentSymbol.nodeSigns.length > 1)){
                endNode = currentSymbol.nodeSigns[currentSymbol.nodeSigns.length-1]
            } else {
                endNode = this[startNodeId];
            }
//console.log(currentSection.value.type.join(':'))
//            continue;
        }else if(startNodeId == fix){
//セルエントリが開始ノードであった場合のみ終了ノードだけを設定する            
            //スタートノードに対応するエンドノードが予約語内にあればそちらを優先
            if (endNodes[this[startNodeId]]){
                endNode = endNodes[this[startNodeId]];
            } else if((currentSymbol)&&(currentSymbol.nodeSigns.length > 1)){
                endNode = currentSymbol.nodeSigns[currentSymbol.nodeSigns.length-1]
            }
        }
//<name>エントリまたはタイプ識別可能エントリ
//          当該エントリの前に//セクションが閉じているか否か//セクションが確定しているか否か//の判定が必要
        
        var ckSymbol = nas.cameraworkDescriptions.get(this[fix]);
        if(
            (String(this[fix]).match(/^<([^>]+)>$/))||(ckSymbol)
        ){
            var detectedName = ( ckSymbol )? this[fix] : RegExp.$1;
            if(! ckSymbol){
                  ckSymbol = nas.cameraworkDescriptions.get(detectedName); 
            }
//console.log(fix + ' : '+ this[fix]);
//console.log(ckSymbol);
//console.log(this[startNodeId]);
/*
                (currentSection.value.type[0]=="transition")||
                (currentSection.value.type[1]=="fadeIn")||
*/
            if(
                (currentSection.value)&&((currentSection.value.name=="")||
                (currentSection.value.name==this[startNodeId]))||
                ((ckSymbol) && (
                    ((ckSymbol.type == currentSection.value.type[0]) && (ckSymbol.name == currentSection.value.type[1]))||
                    ((ckSymbol.nodeSigns.length>1) && (ckSymbol.nodeSigns[1]==this[startNodeId]))
                ))
            ){
                currentSection.value.name = detectedName;
                currentSymbol = ( ckSymbol )? ckSymbol : nas.cameraworkDescriptions.get(currentSection.value.name);
                if(!currentSymbol){ currentSymbol = nas.cameraworkDescriptions.get('unknown')}
                currentSection.value.type=[currentSymbol.type,currentSymbol.name];
//console.log(fix +': set section value');
            }else{
                currentSection.duration --;
                if(lastBracketsId == (fix-1)) currentSection.tailMargin = -1 ; 
                if(currentSection.duration < 1) myCollection.pop();
                //if(currentSection.value) currentSection.value.parseContent();
                currentSection = myCollection.addSection(new nas.AnimationCamerawork(null,detectedName));//changeCurrent
                currentSection.duration = 1;
                currentSymbol = ( ckSymbol )? ckSymbol : nas.cameraworkDescriptions.get(currentSection.value.name);
                if(!currentSymbol){ currentSymbol = nas.cameraworkDescriptions.get('unknown')}
//console.log(fix +': start section');
            }
//先行セクションが[値]セルであった場合
                if(lastBracketsId == (fix-1)){
                    currentSection.value.prefix = this[lastBracketsId];
                    currentSection.headMargin = 1;
                };
            if(!(endNode)){
                endNode = (currentSymbol.nodeSigns.length>2)?currentSymbol.nodeSigns[2]:currentSymbol.nodeSigns[1];
//&&(this[startNodeId]==currentSymbol.nodeSigns[1])
            }else if(
                (currentSymbol.nodeSigns.length > 1)
            ){
                endNode = currentSymbol.nodeSigns[currentSymbol.nodeSigns.length-1];
            }
//console.log(currentSection.value.type.join(':'))
//console.log(currentSymbol)
//console.log(endNode);
            continue;           
        }
//コメントエントリ
        if( String(this[fix]).match(/^\(([^\)]+)\)$/) ){
            currentSection.value.comments.push(RegExp.$1);
        }
//interp,start,end以外のエントリーはattributesに積む
    }

    this.sections=myCollection;
//console.log(this.sections)
    return this.sections;
}

/**
 *  ジオメトリタイムラインの（区間）値
 *  カメラワーク
 基本的なサイズは、トラックに設定されたデフォルト値から継承する
 
 
要素名は[ブラケット]で囲む
プロパティの値はブラケットを払ったもの
 */
nas.AnimationGeometry =function(myParent,myContent){
    this.parent = (myParent)? myParent : null   ;//xMapElementGroup or null
    this.contentText=(myContent)?myContent:''   ;//xMapのソースを保存する 自動で再構築が行なわれるタイミングがある

    this.name                                   ;//素材名
    this.source                                 ;//参照画像データソース 存在する場合は、type="still-reference"で初期化される
    this.comment=""                             ;//コメント文字列
    this.extended = false                       ;//拡張表示フラグ

    this.formGeometry = new nas.AnimationField();//nas.AnimationFieldオブジェクト
    this.position     = new nas.Position()      ;//要素を配置する位置
    this.offset       = new nas.Offset()        ;//要素の原点オフセット
    this.scale        = new nas.Scale()         ;//要素スケール
    this.t            = new nas.TimingCurve();
    this.c            = new nas.Curve();
    this.x = this.position.x;
    this.y = this.position.y;
    this.z = this.position.z;
    
    this.parseContent();
}

//nas.AnimationGeometry.prototype.constractor=nas.AnimationField.constractor
/**
    同値判定メソッド
    値種別ごとに同値判定条件が異なるので注意
*/
nas.AnimationGeometry.prototype.sameValueAs = function(target){
    return (this.source == target.source);
}
/**
    文字列化して返す
    exportForm
    basic
source+
    extend
*/
nas.AnimationGeometry.prototype.toString=function(exportForm){
    if(! this.name) return '';//無名オブジェクトは空リターン
//return this.contentText;//動作確認用ダミー行
    if(exportForm == 'extend'){
        var resultArray=[];
        if(this.position)   resultArray.push('\tposition = "'+ this.position.toString(true)+'"');
        if(this.source)     resultArray.push('\tsource = "'    + this.source.toString(true)+'"');
        if(this.size)       resultArray.push('\tsize = '     + this.size.toString());
        if(this.offset)     resultArray.push(this.offset.toString());
//        if(this.offset)   resultArray.push('\toffset = '   + this.offset.toString());
        if(this.rotation)   resultArray.push(this.rotation.toString(true));
        if(this.comment)    resultArray.push('\tcomment = '  + this.comment);
        return resultArray.join("\n");
    }else if ((arguments.length==0)||((arguments.length==1)&&(! arguments[0]))||(exportForm == 'basic')){
        var resultArray=[];
        
        if(this.source)   resultArray.push('"'+this.source.toString()+'"');
        if(this.size)     resultArray.push(this.size.toString());
        if(this.offset)   resultArray.push(this.offset.toString());
        if(this.rotation) resultArray.push(this.rotation.toString());
        resultArray = [resultArray.join(",")];
        if(this.comment) resultArray.push(this.comment);
        return ([this.parent.name,this.name,resultArray.join("\t")]).join('\t');
    }


    if(exportForm=='extended'){
        var resultData=[];
        if(this.source)     resultData.push(this.source.toString(true));   
        if(this.size)       resultData.push(this.size.toString(true));
        if(this.position)   resultData.push(this.position.toString(true));
    }else{
    }
    return this.contentText;
}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
*/
nas.AnimationGeometry.prototype.parseContent=function(myContent){
//引数がなければ現在のコンテンツを再パース
    if(typeof myContent == 'undefined'){
        myContent = this.contentText;
    }else{
        this.contentText = myContent;
    }

    var isGroup = (myContent.indexOf('[')==0)? true:false;
//第一形式グループ ^[\<group>\t<typeName>[\t<option-text>[\t<comment>]]\]$
//第二形式エントリ ^<group>\t<name>[\t<option-text>[\t<comment>]]$

    myContent = String(myContent).split('\n');
    for ( var line = 0 ; line < myContent.length ; line++){

    if((isGroup)&&(myContent[line].indexOf('[')==0)) myContent[line] = myContent[line].slice(1,-1);//ブラケット削除

        if(myContent[line].match(/^\t(\S+)\s*=\s*(.+)\s*$/)){
            //第二形式(タブ開始)でプロパティ別のデータ更新を行う
            this.extended=true;

            var myProp=RegExp.$1;var valueArray=csvSimple.parse(RegExp.$2)[0];

            switch(myProp){
            case "file":;// 旧プロパティ互換
            case "source":
                this.source = new nas.AnimationElementSource(valueArray[0]);
            break;
            case "position":
                this.position = new nas.Position(valueArray[0],valueArray[1]);
            break;
            case "position.X":
                this.position.x = new nas.UnitValue(valueArray[0]);
            break;
            case "position.Y":
                this.position.y = new nas.UnitValue(valueArray[0]);
            break;
            case "offset":
                this.offset = (valueArray.length<3)?
                    new nas.Offset(valueArray[0],valueArray[1]):new nas.Offset(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "offset.X":
                this.offset.x = new nas.UnitValue(valueArray[0]);
            break;
            case "offset.Y":
                this.offset.y = new nas.UnitValue(valueArray[0]);
            break;
            case "offset.R":
                this.offset.r = new nas.UnitAngle(valueArray[0]);
            break;
            case "scale":
                this.scale = (valueArray.length<3)?
                    new nas.Scale(valueArray[0],valueArray[1]):new nas.Offset(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "scale.X":
                this.scale.x=new nas.UnitValue(valueArray[0]);
            break;
            case "scale.Y":
                this.scale.y=new nas.UnitValue(valueArray[0]);
            break;
            case "scale.Z":
                this.scale.z=new nas.UnitAngle(valueArray[0]);
            break;
           default:
                this[myProp]=valueArray[0];
            }
        } else if(myContent[line].match(/^(\S+)\t?(\S+)\t?([^\t]+)?\t?(.*)$/)){
        // 第一形式の再パース
//console.log(myContent[line]);
            var myGroup=RegExp.$1; //グループの再パースは行われない
            var myName =RegExp.$2;
            var myComment=RegExp.$4;
            var valueArray=nas.parseDataChank(RegExp.$3);
            var numeProps =[["size","x"],["size","y"],["offset","x"],["offset","y"]];
//console.log(myComment);
//console.log(valueArray);
//console.log(this);
/*
    フィールド文字列であった場合の判定が必要 2018 10 09 未処理 //nas.xMap.xMapGroup
*/
//console.log(isGroup);
//console.log(myName);
            if((this.parent instanceof Object)&&(myGroup == this.parent.name)){
                if(! isGroup) this.name = myName.replace(new RegExp('^'+myGroup+'[\-_\s]+'),"");
                var numCount=0;
                for(var vix=0;vix<valueArray.length;vix++){
                    switch(valueArray[vix].type){
                    case "numeric":
                    case "unitValue":
                        if(numCount<numeProps.length){
                            if(! this[numeProps[numCount][0]]){
                                this[numeProps[numCount][0]] = ([numeProps[numCount][0]]=='size')? new nas.Size():new nas.Offset();
                            }
                            this[numeProps[numCount][0]][numeProps[numCount][1]] = new nas.UnitValue(valueArray[vix].value);
                            numCount++;
                        }
                    break;
                    case "unitAngle":
                        if(! this.offset) this.offset = new nas.Offset();
                        this.offset.r==new nas.UnitAngle(valueArray[vix].value);            
                    break;
                    case "unitResolution":
                        this.resolution=new nas.Resolution(valueArray[vix].value);            
                    break;
                    case "source":
                        this.source=new nas.AnimationElementSource(valueArray[vix].value);            
                    break;
                    default:
                        continue;
                }
            }
                if(myComment) this.comment = myComment;
            }
        }

    }
    return this;    
}

nas.AnimationGeometry.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;//置きかえタイムラインの中間値は前方値で代表される
    /* オプション状態で中間タイミングで後方値に切り替える（時間で） return endValue;
      又はブランク状態のオブジェクトを返す return new nas.newAnimationReplacement("blank");
    */
}

/** 指定フレーム数に内容を展開して配列で返す
 * @params {Number} cellCount
 * @returns {Array} 配列
*/
/*
値セクションと補完セクションで出力を分ける
空配列を作成
値セクションは値を冒頭または末尾に表示
表示条件
    冒頭 セクションIDがである場合を除き先行セクションが補完セクションであった場合に表示
    末尾 後続セクションが補完セクションであった場合に表示
補完セクション
    継続長１フレーム・２フレーム バーサインのみ
    それ以上は、
    開始サイン1,バーサイン 継続長-2,終了サイン1

最少セクション長は 1
最少セクション長を割ることは認められない セクション削除は可能

ユーザ記述の文字列は可能な限り保存したいが、その仕組は後から 2019.02
 */
nas.AnimationGeometry.prototype.getStream=function(cellCounts){
    if(isNaN(cellCounts)) cellCounts = 1;//1  > minimumCount

    var minCount = 1 ;//name
//    if(this.prefix)  minCount++;
//    if(this.postfix) minCount++;

//    var myResult=new Array(cellCounts);

    if(cellCounts<0) cellCounts=Math.abs(cellCounts);//?
    if(cellCounts >= minCount){
//        var myName = (mySymbol.nodeSigns.length == 1) ?mySymbol.nodeSigns[0]:'<'+this.name+'>';
        var myResult = new Array(cellCounts);
        for (var ix = 0 ; ix < cellCounts ;ix ++){
            /*if(ix == Math.floor((cellCounts-(1+this.comments.length))/2)){
                myResult[ix] = "<center>";
                if(this.comments.length){
                    for (var cx = 0 ;cx<this.comments.length;cx++){
                        myResult[ix+cx+1] = '('+this.comments[cx]+')';
                    }
                    ix += this.comments.length;
                }
               continue;
            }// */
        }
        if(this.prefix)  myResult = [this.prefix].concat(myResult);
        if(this.postfix) myResult = myResult.concat([this.postfix]); 
  }

    return myResult;
}
/*

ジオメトリ要素、コンポジット要素 では、第三フィールド内の各値は、書式による自動判定をおこなう（順序によらない）

％付き数値判定（strength または scale）
インチフィールド文字列
フィールド文字列
ジオメトリデータ配列
    単位値と単位角度の組み合わせ

これらを判定して、判定から外れたデータをファイルパス（素材識別データ）とみなす
スケール以外の単位省略は不可

[PAN	geometry	,12FLD-10]

[FI-1	effect]
[TU	geometry]
[透過光	effect]

	field = 10FLD
PAN	[A]	10FLD2S3W12 Quick


[FI-A	effect	"",,,	コメントですです]


	geometry
[FLDString][,"file-path"]
	1,2
[FLDString[,left,top[,rotation]]][,"file-path"]
	1,2,3,4,5
[width,height[,left,top[,rotation]]][,"file-path"]
	1,2,3,4,5,6

Target.match(/^[\d]+\.?[\d]*FLD()?$/i)


	effect
[strength[,blendingMode]][,file-path]
	1,2,3

(Target).match(/^[+-]?[\d]+\.?[\d]*\%?$/);//％付き数値判定
(new nas.BlendingMode[Target]);//ブレンドモード判定
上記以外はファイルパス
50%,normal
50%,"/path/file-name.ext"


[WXP	effect	50%,normal	カットいっぱい]

[FI	effect	0%]
FI	<10%>	normal
FI	<0.01>		
*/
/* TEST
var A=new nas.AnimationGeometry(null,
`[PAN	GEOMETRY]
	size=252mm,142.875mm
	position=0mm,0mm,0mm
	offset=0mm,104.875mm
	rotation=0d
	comment=10in/StanderdFrame/16:9/HDTV
# 作品データの継承があるのでこのサンプルでは本来は記述不要
`);
A.toString();
*/
/*
    カメラワークトラックをパースしてセクションコレクションを返す
    option:(geometry|stagework)
    セクションの状態は
    値：
        あり>有値セクション
            何らかの値オブジェクトを持つ値セクション この継続時間中トラックの持つ値は変化しない最短で１フレーム
        なし>中間値補間セクション
            valueプロパティが空で値オブジェクトを持たない
            中間値補間サブセクションコレクションを持つ
    geometryタイムライントラックセクションの開始、終了判定
    セクションは「値区間(セクション)」と「中間値補間区間(セクション)」の２種に分類される
    中間値セクションは必ず前後に値セクションを持つ
    値区間は連続することが可能
    値区間は最低でも１フレームの継続時間を持ち、そのトラックの返す値nas.AnimationGeometryオブジェクトを保持する

    補間区間は、値オブジェクトを持たず、サブセクションコレクションを持ち 前後の値区間の中間値を補間して戻す
    サブセクションは値としてnas.ValueInterpolatorオブジェクトを持つ
    
    補間区間は補間区間開始ノードで開始され終了ノードで閉じる
    
    入力としては開始ノードと終了ノードはそれぞれ対応するサインを対で使用することが求められる
    特定の開始ノードで初期化された補間区間は、明示的に開始ノードと対の終了ノードで閉じられるか又は
    後続の値エントリが宣言されて値区間が開始されるまでの間継続される
    中間値補間区間はその区間が閉じられるまでの間 基本的にすべての空白以外のエントリが副補間区間を初期化する。
    開始ノードは必ず副補間区間を開始するが、終了ノードは副補間区間を開始するとは限らない。
        
    終了ノードが中間値補間ノードとなるかならないかの判定
   
   区間内の終了ノードを除く中間値生成ノードの数がdurationの整数分の１である（割り切れる）場合（＝ 均等フレーミング）の場合
   終了ノードは中間値を初期化しない。
   
   タイミングが乱れ打ちの中間値補間を行う場合は、終了ノードを利用せずにタイミング指定を行うものとする
   実際に開始ノードと終了ノードのみの区間があった場合は、中間値指定ノードでシートセルを埋めるように促すほうが良い
*/
nas._parseGeometryTrack= function(){
    var myCollection      = new nas.Xps.XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    var currentSection    = myCollection.addSection(null);//開始セクションを作成 継続時間０ 値は保留
    var currentSubSection = null;//操作サブセクションへの参照 値はカラ 処理中は操作対象オブジェクトへの参照
//    var currentValue      = new nas.AnimationGeometry(null,"");//コンテンツはカラで初期化も保留
//初期コンテンツは、継承のためにトラックに関連するxMapGroup.contentを求めて利用する。
    var trackGroup        = this.xParent.parentXps.xMap.getElementByName(this.id);
    if(!trackGroup)
        trackGroup        = this.xParent.parentXps.xMap.new_xMapElement(
            this.id,
            'geometry',
            this.xParent.parentXps.currentJob
        );
    var currentElement    = null;
    var currentValue      = trackGroup.content;
    var currentNodeSign   = false;//否で初期化(確認用)
    var valueDetect       = false;//否で初期化(確認用)
//    var startNodeRegex    = new RegExp("^▼$");//ノードサインを限定
    var startNodeRegex=new RegExp("^[▼▽●◯◎◆◇★☆]$");
    var endNodes={
        "▼":"▲",
        "▽":"△",
        "●":"●",
        "○":"◯",
        "◎":"◎",
        "◆":"◆",
        "◇":"◇",
        "☆":"☆",
        "★":"★"
    };
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        if( currentSubSection ) currentSubSection.duration ++;//currentセクションの継続長を加算
//未記入データ これが一番多いので最初に処理しておく
        if(this[fix]=="") continue;
//中間値補間セクション終了ノード(対で処理する方)
        if(this[fix]==currentNodeSign){
//console.log('detect end of interpSection :'+fix+':'+this[fix])
            //補間サブセクションを初期化するかどうかを判定
            if( currentSection.duration % currentSection.subSections.length ) {
                currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection();//割り切れない場追加
                currentSubSection.duration = 1;//必ず1
            }
            currentNodeSign=false;//補間区間終了ノードクリア
            currentSubSection=null;//補完区間一時バッファクリア
            currentSection=myCollection.addSection(false); // 新規値セクション追加
            continue;
        } else
/* この正規表現は仮でハードコーディング あとで設定ファイルからの反映に変更予定*/
        if(this[fix].match(startNodeRegex)){
//console.log('detect start of interpSection :'+fix+':'+this[fix])
/*
    予約開始ノードサイン検出
予約語の開始ノードサインを検出したので対応する終了ノードをセットする
第一区間が補間区間であった場合、トラックのデフォルト値を先行区間の値とする。
第一区間は、値区間 補間区間のいずれでも良いので初期区間の値は保留されている
検出したサインがカレントノードサインと一致していたら補間区間終了それ以外は副補間区間のエントリ初期化
セクションノードサイン
予約語
    /^▼$/
    特殊ノードとして中間値補間区間を開き、同じサインで当該の区間を閉じる
    予約語以外の中間値指定ノードには閉鎖機能がない
    値指定ノード以外は基本的にすべて中間値指定ノードとする
    空白エントリ・予約語以外の記述は値を指定するノードか否かを判定する。
    明示的に値を生成するノードを切り分け 残るエントリはｘMapに問い合わせを行い値を持たないエントリを中間値発生ノードとして扱う
*/
            if(currentNodeSign==false){
                currentNodeSign=endNodes[this[fix]];//予約語で開いたので終了ノードを設定する
                if(fix == 0){
                    currentSection.subSections=new nas.Xps.XpsTimelineSectionCollection(currentSection);//第一フレームだった場合のみ第一セクションを補間区間に変換
                    currentSubSection=currentSection.subSections.addSection();//同時に第一サブセクションを初期化
                    currentSubSection.duration = 1;
                }else{
                    currentSection.duration --;
                    currentSection = myCollection.addSection("interpolation"); //それ以外は新規補間セクション追加
                    currentSection.duration = 1;
                    if(currentSubSection) currentSubSection.duration --;
                    currentSubSection = currentSection.subSections.addSection();
                    currentSubSection.duration = 1;
                }
            } else {
                currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection();
            }
            currentSubSection.duration = 1;
        } else {
//予約ノードサイン外
/**
valueDetect = fale;
値指定ノード\[[^\]]+\]を検出した場合、セルエントリーの角括弧をもったまま評価値とする。
フラグは立てる (valueDetect = true)
それ以外はセルエントリーを評価値とする。
xMapで評価値をエントリ検索 検索がヒットしたらフラグを立てる
ヒットしたエントリをバッファに置く
ノーヒットエントリ(valueDetect == true) なら エントリを作成してそれをバッファに置く

valueDetect==true
    カレントセクションが中間値補間セクションだった場合はカレントセクションをクロースして検出した値をもつ値セクションを初期化する
    カレントセクションの値が未設定の場合、カレントセクションの値を設定
    カレントセクションに値がある場合は新規の値セクションを初期化
valueDetect==false
    中間値指定ノードとなる
    カレントセクションが中間値補間セクションだった場合は新規に副補間区間を初期化
    カレントセクションが値区間だった場合はこれをクロース。
    新規に中間値補間セクションを初期化して第一副補間区間を初期化する
    トラック内無効記述（コメント）は許可されない。
*/
    valueDetect = false;
        var checkValue= this[fix];
    if(this[fix].match(/^\[([^\]])\]$/)){
        valueDetect=true;
    }
    currentElement = this.xParent.parentXps.xMap.getElementByName([this.id,checkValue].join('-'));
    //グループIDを加えたセル内容でxMap内を検索 既存値が存在すればそのエレメントが戻る
    if((! currentElement) && (valueDetect)){
//console.log(fix+':'+this[fix])
//console.log(this.xParent.parentXps.xMap.currentJob);
//エレメント新規登録
       currentElement = this.xParent.parentXps.xMap.new_xMapElement(
            checkValue,
            trackGroup,
            this.xParent.parentXps.xMap.currentJob,
            [this.id,checkValue].join('\t')
        );
//console.log(currentElement);
    };//else{  }
    valueDetect=(currentElement)?true:false;
  
if(valueDetect){
//console.log('value detected :'+fix+':'+this[fix]);
//console.log(currentElement);
}else{
//console.log('value not detected :'+fix+':'+this[fix]);
//console.log(currentElement);
}

            if(currentElement){
//console.log(currentElement);
//console.log(currentNodeSign);
                if(currentNodeSign){
                    currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                    currentNodeSign = false;//補間区間終了ノードクリア
                    currentSection = myCollection.addSection(currentElement);//新規セクション追加
                    currentSubSection = null;//補完区間一時バッファクリア
                } else {
                    if (currentSection.value){
                        currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                        currentSection = myCollection.addSection(currentElement);//新規セクション追加
                        currentSubSection = null;//補完区間一時バッファクリア
                    }else{
                        currentSection.value=currentElement.content;//値を遅延設定
                    }
                }               
            } else {
                if(! currentNodeSign) {
                    currentSection.duration--;//開始ノード無しで値セクションを閉じるので加算したdurationをキャンセル
                    currentSection = myCollection.addSection("interpolation");//新規補完セクション追加
                    currentNodeSign = true;
                    currentSection.duration = 1;//新規セクション長設定
                }
                /* 中間値補完区間 */
//              console.log("fix:"+fix);
                if(currentSubSection) currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection();
                currentSubSection.duration = 1;
            }
        }
    }
    this.sections=myCollection;
    return this.sections;
}

/**
 *  @class
 *  コンポジット(エフェクト)タイムラインの（区間）値
 *<pre>  
 *  要素名は、可能な限り<name>矢括弧で囲む 囲まれていた場合には括弧ごと記録する
 *  要素名が数値 または  %つき数値であった場合は strength の値として使用する
 *  1.0                 基数1 浮動小数点値
 *  100%    100/100     100分率値
 *  1000‰  1000/1000   1000分率値(パーミルは現在解釈されない2019 03)
 *
 *  要素名が指定されない場合は、<START>,<01>,<02>…<END>を自動で割り付ける様に配慮する
 *</pre>
 * @example
[WXP	composite	50%]
WXP	<75%>  75%
    
[FI	effect]
    comment = じわっと
    effect  = FI
FI	<START> 0%
FI	<END> 100%
 */
nas.AnimationComposite =function(myParent,myContent){
    this.parent = (myParent)? myParent : null   ;//xMapElementGroup or null
    this.contentText=(myContent)?myContent:''   ;//xMapのソースを保存する 自動で再構築が行なわれるタイミングがある
    this.extended = false                       ;//拡張表示フラグ

    this.name                                   ;/** {String} name ｘMap素材名 */
    this.source                                 ;//参照画像データソース nas.AnimationElementSource
    this.file                                   ;//参照画像データソース nas.AnimationElementSource?
    this.comment                                ;//コメント文字列
    this.effect                                 ;//{String} effectItemString WXP,FI,FO & others

    this.blendingMode = nas.BlendingMode.NORMAL ;//enumlatedObject nas.BlendingMode
    this.strength     = 1                       ;//内部表記は実数 表示は%で
    this.t        = new nas.TimingCurve(0,0);//

    this.parseContent();
}
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.AnimationComposite.prototype.sameValueAs = function(target){
    return (this.contentText.trim() == target.contentText.trim());
}
/**
 *  @function
 *   中間点取得 オブジェクトメソッド
 *   自身の値とターゲット値の中間の値を求める
 *
 * @params {Object nas.AnimationComposite}    endValue        ターゲット値
 * @params {Number}    indexCount      
 * @params {Number}    indexOffset
 * @params {Number}    frameCount
 * @params {Number}    frameOffset
 * @params {String}    props    
*/
nas.AnimationComposite.prototype.interpolate= function(
    endValue,
    indexCount,
    indexOffset,
    frameCount,
    frameOffset,
    props
){
    myResult=Object.create(this);
    myResult.strength=(this.strength+endValue.strength)*(indexCount/indexCount);// 仮値リニア補間
    return myResult;//コンポジットタイムラインの中間値は濃度値のみ

}
/**
 *    xMapデータのためにエレメントを文字列化して返す
 *
 *  @params {String} exportForm
 *      出力形式指定文字列 edtend|basic
 *
 */
nas.AnimationComposite.prototype.toString=function(exportForm){
//return this.contentText;//動作確認用ダミー行
    
    var props=['effect','blendingMode','strength','T','comment'];
    var myResult = '';

    for (var pid=0;pid<props.length;pid++){
        if(this[props[pid]]){
            myResult += '\t'+props[pid]+' = '+this[props[pid]]
        }
    }
    if(exportForm == 'extend'){
        var resultArray=[];
        if(this.source)       resultArray.push('\tsource = "'      + this.source.toString(true)+'"');
        if(this.file)         resultArray.push('\tfile = "'        + this.source.toString(true)+'"');
        if(this.effect)       resultArray.push('\teffect = '       + this.effect);
        if(this.blendingMode) resultArray.push('\tblendingMode = ' + nas.BlendingMode.reversemap(this.blendingMode));
        if(! isNaN(this.strength)) resultArray.push('\tstrength = '     + (this.strength*100)+'%');
        if(this.t)            resultArray.push('\tT = '            + this.t.toString(true));
        if(this.comment)      resultArray.push('\tcomment = '      + this.comment);
        return resultArray.join("\n");
    }else if ((arguments.length==0)||((arguments.length==1)&&(! arguments[0]))||(exportForm == 'basic')){
        var result = ([this.parent.name,this.name]).join('\t');
        var resultArray=[];
        if(! isNaN(this.strength))      resultArray.push((this.strength*100)+'%');
//        if(this.effect)        resultArray.push(this.effect);
//        if(this.blendingMode)  resultArray.push(nas.BlendingMode.reversemap(this.blendingMode));
        //resultArray = [resultArray.join(",")];
        if((resultArray.length)||(this.comment))		result += '\t' + resultArray.join(',');
		if(this.comment)	result += '\t' +this.comment;
        return result;
    }

}
/**
    引数でxMapコンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする

[FI effect]
FI  0% to 100%
FO  100% to 0%

*/
nas.AnimationComposite.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }else{
        this.contentText = myContent;
    }
    var isGroup = (myContent.indexOf('[')==0)? true:false;
//第一形式グループ ^\[<group>\t<typeName>[\t<option-text>[\t<comment>]]\]$
//第一形式エントリ ^<group>\t<entryName>\t<option-text>\t<comment>$
//option-text   <strength>,<effect>,<blendingMode>
//第二形式エントリ ^<group>\t<name>[\t<option-text>[\t<comment>]]$

    myContent = String(myContent).split('\n');
    for ( var line = 0 ; line < myContent.length ; line++){

    if((isGroup)&&(myContent[line].indexOf('[')==0)) myContent[line] = myContent[line].slice(1,-1);//ブラケット削除

        if(myContent[line].match(/^\t(\S+)\s*=\s*(.+)\s*$/)){
            //第二形式(タブ開始)でプロパティ別のデータ更新を行う
            this.extended=true;

            var myProp=RegExp.$1;var valueArray=csvSimple.parse(RegExp.$2)[0];

            switch(myProp){
            case "file":
                this.file = new nas.AnimationElementSource(valueArray[0]);
            break;
            case "source":
                this.source = new nas.AnimationElementSource(valueArray[0]);
            break;
            case "blendingMode":
                this.blendingMode= (nas.BlendingMode[valueArray[0]])?
                nas.BlendingMode[valueArray[0]]:nas.BlendingMode.NORMAL;
            break;
           default:
                this[myProp]=valueArray[0];
            }
        } else if(myContent[line].match(/^(\S+)\t?(\S+)\t?([^\t]+)?\t?(.*)$/)){
        // 第一形式の再パース
            var myGroup=RegExp.$1;//グループの再パースは行われない
            var myName =RegExp.$2;
            var myComment=RegExp.$4;
            var valueArray=nas.parseDataChank(RegExp.$3);
//            var valueArray=csvSimple.parse(RegExp.$3)[0];
/*
//console.log(myGroup);
//console.log(myName);
//console.log(myComment);
//console.log(valueArray);
//console.log(this);
//console.log(isGroup);
//console.log(myName);// */
//            if((this.parent instanceof Object)&&(myGroup == this.parent.name)){}
            if((this.parent instanceof nas.xMap.xMapGroup)&&(myGroup == this.parent.name)){
                if(! isGroup){
                  this.name = myName.replace(new RegExp('^'+myGroup+'[\-_\s]+'),"");//グループプレフィックスがあれば削除
                }else{
                  this.name = myName;
                }
// console.log(this.name);
                if(this.name.match(/^<([\-0-9\.]+(%|％)?)>$/)){
                //名前が値を内包していた場合strengthを設定
                    this.strength = RegExp.$1;
                    //var valueString  = RegExp.$1;
                    //var valuePostfix = RegExp.$2;
                    //this.strength = parseFloat(valueString)*((valuePostfix)? 0.01:1);
                }
                if(valueArray.length){
                //strength
                	switch (valueArray[0].type){
                	case 'persent':
                    	this.strength = valueArray[0].value/100;
                    break;
                	case 'numeric':
                    	this.strength = valueArray[0].value;
                    break;
                    default:
                    	this.strength = parseFloat(valueArray[0].value)/100;
                	}
//                    this.strength=valueArray[0];
                }
                //valueArrayの0番以外の要素は廃棄
/*                if(valueArray[1]){
                //effect
                    this.effect=valueArray[1];
                }
                if(valueArray[2]){
                //blendingMode
                    this.blendingMode=(nas.BlendingMode[valueArray[2]])?
                    nas.BlendingMode[valueArray[2]]:nas.BlendingMode.NORMAL;
                }:// */
                if(myComment) this.comment = myComment;
            }
        }

    }
    if(this.strength){
        var prop = nas.parseDataChank(this.strength)[0];
        this.strength=parseFloat(this.strength)*((prop.type=='percent')?0.01:1);
    }
    
    return this;    

}
nas.AnimationComposite.prototype.getStream=function(cellCounts){
    var myResult=new Array(cellCounts);
    myResult[0] = this.name;

    if (myResult.length > 6 )myResult[myResult.length-1] = this.name

    return myResult;
}
/**
    コンポジットトラックをパースしてセクションコレクションを返す
    nas.Xps.XpsTrack.option:(effect|sfx|composite)
    セクションの状態は、以下の２態の状態を持つ
        値あり>有値セクション
            何らかの値オブジェクトを持つ値セクション この継続時間中トラックの持つ値は変化しない最短で１フレーム
        値なし>中間値補間セクション
            valueプロパティが空で値オブジェクトを持たない
            中間値補間サブセクションコレクションを持つ
    compositeタイムライントラックセクションの開始、終了判定
    セクションは「値区間(セクション)」と「中間値補間区間(セクション)」の２種に分類される
    中間値セクションは必ず前後に値セクションを持つ
    値区間は連続することが可能
    値区間は最低でも１フレームの継続時間を持ち、そのトラックの返す値を保持する
    補間区間は、値オブジェクトを持たず、サブセクションコレクションを持ち 前後の値区間の中間値を補間して戻す
    補間区間は補間区間開始セパレータで開始され終了セパレータで閉じる
    入力としては開始セパレータと終了セパレータが同一のエントリを対で使用することが求められる
    開始セパレータで宣言された補間区間は、明示的に開始セパレータと対の終了セパレータで閉じられるか又は
    後続の値エントリを宣言して値区間を開始されくまでの間継続される
    補間区間はその区間が閉じられるまでの間 すべての空白以外のエントリが副補間区間を開始する。
    補間区間中すべてのエントリが空白であった場合に限り、空白区間がすべて副補間区間のエントリとなる
    （＝補間区間に何も間に置かなかったトラックは１コマ撮りの補間区間となる）（？この処理はやめる 例外を設けない）
*/
nas._parseCompositeTrack=function(){
    var myCollection    = new nas.Xps.XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    var currentSection  = myCollection.addSection(false);//開始セクションを作成 継続時間０ 値は保留
    var currentSubSection  = null;//操作サブセクションへの参照 値はカラ 処理中は操作対象オブジェクトへの参照

//初期コンテンツは、継承のためにトラックに関連するxMapGroup.contentを求めて利用する。
    var trackGroup        = this.xParent.parentXps.xMap.getElementByName(this.id);
    if(!trackGroup)
        trackGroup        = this.xParent.parentXps.xMap.new_xMapElement(
            this.id,
            'effect',
            this.xParent.parentXps.currentJob
        );
    var currentElement    = null;
    var currentValue      = trackGroup.content;
    var currentNodeSign    = false;//否で初期化(確認用)
    var valueDetect        = false;//否で初期化(確認用)

    var startNodeRegex=new RegExp("^([┳┬▼▽])$|^\\](.+)\\[$|^\\)(.+)\\($");
    var endNodes={
        "┳":"┻",
        "┬":"┴",
        "▼":"▲",
        "▽":"△"
    };
    
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        if( currentSubSection ) currentSubSection.duration ++;//currentセクションの継続長を加算
        //未記入データ これが一番多いので最初に処理しておく
        if(this[fix]=="") continue;
        //区間の値
//中間値補間セクション終了ノード(対で処理する方)
        if(this[fix]==currentNodeSign){
            //補間サブセクションを初期化するかどうかを判定
            if( currentSection.duration % currentSection.subSections.length ) {
                currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection();//割り切れない場追加
                currentSubSection.duration = 1;//必ず1
            }
            currentNodeSign=false;//補間区間終了ノードクリア
            currentSubSection=null;//補完区間一時バッファクリア
            currentSection=myCollection.addSection(false); // 新規値セクション追加
            continue;
        } else
/* この正規表現は仮でハードコーディング あとで設定ファイルからの反映に変更予定*/
        var startCheck=this[fix].match(startNodeRegex);
        if(startCheck){
        currentEffectProp=(startCheck[1]=="")? startCheck.slice(1).join(''):"-noItem-";
/*
    ノードサイン検出
第一区間が補間区間であった場合、トラックのデフォルト値を先行区間の値とする。
第一区間は、値区間 補間区間のいずれでも良いので初期区間の値は保留されている
currentNodeSignがfalseであった場合はセクション開始
それ以外の場合、補間区間のエントリ中でのサイン検出
検出したサインがカレントノードサインと一致していたら補間区間終了それ以外は副補間区間のエントリ初期化
セクションノードサイン
"┳"のみのセル または ").+("
予約語
    /^([┳┬▼▽])$|^\](.+)\[$|^\)(.+)\($/
    特殊ノードとして中間値補間区間を開き、設定されたサインで当該の区間を閉じる
    予約語以外の中間値指定ノードには閉鎖機能がない
    値指定ノード以外は基本的にすべて中間値指定ノードとする
    空白エントリ・予約語以外の記述は値を指定するノードか否かを判定する。
    明示的に値を生成するノードを切り分け 残るエントリはｘMapに問い合わせを行い値を持たないエントリを中間値発生ノードとして扱う
*/
            if(currentNodeSign==false){
                currentNodeSign=(endNodes[this[fix]])? endNodes[this[fix]]:this[fix];
                //予約語で開いたので終了ノードを設定
                if(fix==0){
                    currentSection.subSections=new nas.Xps.XpsTimelineSectionCollection(currentSection);//第一フレームだった場合のみ第一セクションを補間区間に変換
                    currentSubSection=currentSection.subSections.addSection();//同時に第一サブセクションを初期化
                    currentSubSection.duration = 1;
                }else{
                    currentSection.duration --;
                    currentSection = myCollection.addSection("interpolation"); //それ以外は新規補間セクション追加
                    currentSection.duration = 1;
                    if(currentSubSection) currentSubSection.duration --;
                    currentSubSection = currentSection.subSections.addSection();
                    currentSubSection.duration = 1;
                }
            } else {
                currentSubSection.duration --;
                currentSection.subSections.addSection();
            }
            currentSubSection.duration = 1;
        } else {
//予約ノードサイン外
/**
valueDetect = fale;
値指定ノード[値]を検出した場合、セルエントリーからAngleBracketsを払って評価値を得る かつ フラグを立てる (valueDetect = true)
それ以外はセルエントリーを評価値とする
    xMapで評価値をエントリ検索
    マップエントリがない場合でかつ valueDetect == true なら エントリを作成してそれを値として使用
    エントリがあれば valueDetect = true なければ false
valueDetect==true
    カレントセクションが中間値補間セクションだった場合はカレントセクションをクロースして検出した値をもつ値セクションを初期化する
    カレントセクションの値が未設定の場合、カレントセクションの値を設定
    カレントセクションに値がある場合は新規の値セクションを初期化
valueDetect==false
    エントリがない場合は中間値指定ノードとなる
    カレントセクションが中間値補間セクションだった場合は新規に副補間区間を初期化
    値区間だった場合は新規に中間値補間セクションを初期化して第一副補間区間を初期化する
    トラック内無効記述（コメント）は現在許可されない。
*/
    valueDetect = false;
        var checkValue= this[fix];
    if(this[fix].match(/^<([^>]+)\>$/)){
//        var checkValue=RegExp.$1;
        valueDetect=true;
    }
    currentElement = this.xParent.parentXps.xMap.getElementByName([this.id,checkValue].join('-'));
    //グループIDを加えたセル内容でxMap内を検索 既存値が存在すればそのエレメントが戻る
    if((! currentElement) && (valueDetect)){
//エレメント新規登録
       currentElement = this.xParent.parentXps.xMap.new_xMapElement(
            checkValue,
            trackGroup,
            this.xParent.parentXps.xMap.currentJob,
            [this.id,checkValue].join('\t')
        );
    }else{
        valueDetect=(currentElement)?true:false;
    }
            if(currentElement){
                if(currentNodeSign){
                    currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                    currentNodeSign = false;//補間区間終了ノードクリア
                    currentSection = myCollection.addSection(currentElement);//新規セクション追加
                    currentSubSection = null;//補完区間一時バッファクリア
                } else {
                    if (currentSection.value){
                        currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                        currentSection = myCollection.addSection(currentElement);//新規セクション追加
                        currentSubSection = null;//補完区間一時バッファクリア
                    }else{
                        currentSection.value=currentElement.content;//値を遅延設定
                    }
                }               
            } else {
                if(! currentNodeSign){
                    currentSection.duration--;//開始ノード無しで値セクションを閉じるので加算したdurationをキャンセル
                    currentSection = myCollection.addSection("interpolation");//新規補完セクション追加
                    currentNodeSign = true;
                    currentSection.duration = 1;//新規セクション長設定
                }
                /* 中間値補完区間 */
                if(currentSubSection) currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection();
                currentSubSection.duration = 1;
            }
        }
    }
    this.sections=myCollection;
    return this.sections;
}

/*
簡易オブジェクトで実装
エレメントのラップもしない

nas.AnimationDialog Object
 同名のオブジェクトとの互換はあまり考えない
 名前が同じだけと思うが吉
 タイムシートサウンドトラックの値となる
 外部ファイルリンクはこの際割愛

    現在のプロパティ
    Property

    getStream(cellCount);
タイムシート用のストリームを配列で返す（内部利用メソッド）
引数のカウントはデータを配置するオブジェクト継続フレーム数 ０〜
（値は継続時間を持たない）
引数０の際はラベルとセパレータ分の配列を返す

    toString(cellCount);
引数のカウントに従ってタイムシート上での利用のためcsvストリームで戻す
それ以外の場合はコンテントテクストを戻す（メソッド）

    contentText;    String
内容テキスト原文 "たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]」"
    name;    String
ラベルとなる名称    "たぬきさん"

    bodyText;    String
台詞本体のテキスト "ぽん！ぽこ！りん！"

    attributes;    Array
オブジェクト属性の配列 ["(off)"] 

    comments;    Array
ノートコメントコレクション配列 [[3,"(SE:ポン)"],[6,"<BGM:開始>"],[9,"[光る！]"]]
コメントのインデックスはbodyText内の挿入点 シート展開時は、bodyText.length+comments.length のフレームを再配置する
*/
nas.AnimationDialog=function(myParent,myContent){
    this.parent = (myParent)? myParent : null   ;//xMapElementGroup or null
    this.contentText=(myContent)?String(myContent):"";//xMapのソーステキストを保存する 自動で再構築が行なわれるタイミングがある

    this.name =''                               ;//xMap素材名（=話者の名称 ＊重複あり ＊空白あり）
    this.source                                 ;//nas.AnimationElementSource
    this.comment                                ;//
    this.extended = true                        ;//必ずtrue

    this.bodyText=""                            ;//セリフ等の本体コメント
    this.attributes =[]                         ;
    this.comments   =[]                         ;
    this.isDialog                               ;//ダイアログセクショングフラグ
    
    this.parseContent()                         ;//作成時に一回パースする
}
//
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.AnimationDialog.prototype.sameValueAs = function(target){
    return (this.contentText.trim() == target.contentText.trim());
}
/*
    初期化時の内容テキスト（シナリオ型式）をパースしてオブジェクト化するメソッド
    本来は自動実行だが、今回は必要に従ってコールする
    "ダブルクォーテーション",'シングルクォーテーション',「かぎかっこ」で囲まれた文字列はダイアログとして処理する
    それ以外はサウンドノード
    
    基本
    エレメントグループ名<\tエレメント名>\n
    エレメントグループ名\n
    
    ラベル「内容」
    「内容」
*/
nas.AnimationDialog.prototype.parseContent=function(myContent){
//console.log(myContent);
    if(typeof myContent == 'undefined') myContent = this.contentText;
//xMapパーサからのグループエントリーデータなのでコンテンツをクリアして終了
    if(myContent.indexOf('[')==0){
//console.log('detect GroupEntry :'+myContent);
        this.contentText='';
        return this;
    }
    if( (this.parent)&&
        (myContent.indexOf(this.parent.name+'\t') == 0)&&
        (myContent.match(/^[\S]+\t[\S]+/))
    ){
//console.log('XXXXXXX entry :'+myContent);
        var myContents  = myContent.split('\n')[0].split('\t');
//xMapパーサからのエントリ登録データなのでコンテンツを初期化
//第三エントリが存在した場合source propertyを設定する
        this.name = myContents[1];
        if(myContents.length>2){this.source = new nas.AnimationElementSource(myContents.slice(2).join(' '));}
        myContent = myContent.split('\n').splice(1).join('\n');
    }
    if(myContent.length){
        if(myContent.match(/^([^「"']*)[「"']([^」"']*)/)){
            this.name=RegExp.$1;
            this.bodyText=RegExp.$2.replace(/」\s*$/,"");
        }else{
            this.name="";
            this.bodyText=myContent;
        }
        var myAttributes=nas.normalizeStr(this.name).match(/\(([^)]+)\)/g);
//        var myAttributes=this.name.match(/\(([^)]+)\)/g);
        if(myAttributes){
            this.attributes=myAttributes;
            this.name=this.name.slice(0,nas.normalizeStr(this.name).indexOf('('));
        }
        //                    本文内からコメントを抽出
        var myComments=this.bodyText.match(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))|＜[^＜]+＞|〈[^〈]+〉|（[^（]+）|［[^［]+］/g);
        if(myComments){
            this.comments=[];//newArray 再初期化
            var myString=this.bodyText;//修正テキスト
            var prevIndex=0;var noteOffset=0;
            for (var cix=0;cix<myComments.length;cix++){
                noteOffset=myString.indexOf(myComments[cix]);//修正テキスト内コメント挿入位置
                this.comments.push([prevIndex+noteOffset,myComments[cix]]);
                prevIndex += noteOffset;
                myString=myString.slice(noteOffset+myComments[cix].length);
            }
            this.bodyText=this.bodyText.replace(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))|＜[^＜]+＞|〈[^〈]+〉|（[^（]+）|［[^［]+］/g,"");
        }
        this.contentText = this.toString();
        return this
    }else{
    //内容テキストが空
        return false;
    }
}
/*
toStringはプロパティを組み上げてMap記述用のテキストを返す
ダイアログの場合はシナリオ型式のテキスト

引数に正の数値でセルカウントが与えられた場合は、XPS上への展開配列ストリームで戻す。
展開配列は getStream() メソッドで得る
getStreamメソッドに統一してオフセットつき配列で戻す方式に変更 2018.12



＊各Valueの標準形式

toString メソッドの共通オプションとして
引数
    basic         xMap用１行エントリ
    なし/extended シナリオ形式
    
dialogオブジェクトに関しては、標準形式と拡張形式は同じものとなるので注意

*/
nas.AnimationDialog.prototype.toString=function(exportForm){
//  if((isFinite(exportForm))&&(exportForm > 0)){
//受け渡しをJSON経由にするか否かはペンディング JSONStringの場合はString.split厳禁 
//    return JSON.stringify(this.getStream(exportForm));
//    return (this.getStream(exportForm)).join();
//  }else{}
    if(exportForm=='basic'){
        var myResult=[this.parent.name,this.name];
        if(this.source) myResult.push('"'+this.source.toString(true)+'"');
        return myResult.join('\t');
    }else{
        var myResult=this.name;
        myResult+=this.attributes.join("");
        myResult+="「";
        var startPt=0;
        if(this.comments.length){var endPt=this.comments[0][0]}else{var endPt=0};
        for(var cix=0;cix<this.comments.length;cix++){
            myResult+=this.bodyText.slice(startPt,endPt)+this.comments[cix][1];
            startPt=endPt;
            if(cix<this.comments.length-1){endPt=this.comments[cix+1][0]};
        }
        if(startPt<this.bodyText.length){myResult+=this.bodyText.slice(startPt)};
        myResult+="」";
        if(this.source) myResult+=('\tsource="'+this.source.toString(true)+'"');
        if(myResult=='「」') return '';
        return myResult;
    }
}
/*    test
A=new  nas.AnimationDialog(null,"たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]とうりゃぁー！！」");
A.parseContent();
//console.log(A)
*/
/**
 *  @function
 * 値を配列でもどす
 *  @paramas {Number} cellCount
 *  @returns {Array}
 *    セルエントリの配列
 *  <pre>cellCountが与えられることが前提で配列を組む
 * ダイアログ展開時に与えられた引数を区間長とする
 * 区間の前方側にname,attributes+開始セパレータ 後方側に終了セパレータ分のフレームが追加される
 * =引数が０でもラベルとセパレータ分のデータが戻る
 * 必ずしも引数の長さの配列は戻さない。差分は呼び出し側で調整</pre>
 */
nas.AnimationDialog.prototype.getStream=function(cellCounts){
    if(isNaN(cellCounts)) cellCounts = (this.contents.length+this.comments.length+this.attributes.length+3);
    if(cellCounts<0)cellCounts=Math.abs(cellCounts);
  if(cellCounts){
    var myResult=[];
//        myResult.startOffset = -(this.attributes.length + 2);//name,attributes,startSign パース時にセクションにストア
    if(String(this.name).length) myResult.push(this.name);//ラベルあれば
    for(var aid=0;aid<this.attributes.length;aid++){myResult.push(this.attributes[aid])};//アトリビュート
    myResult.push('----');//開始セパレータ
    var entryCount = this.bodyText.length+this.comments.length;//テキスト文字数とコメント数を加算
    var dataCount = 0;//データカウントを０で初期化
    var textIndex = 0;//テクストインデックス
    var commentIndex = 0;//コメントインデックス
    var dataStep = cellCounts/entryCount ;//データステップ
    for(var cnt = 0; cnt < cellCounts; cnt ++){
        var myIndex = (entryCount >= cellCounts) ? cnt:Math.floor(cnt/dataStep);//配置Index
        //挿入点判定
        if(dataCount==myIndex){
            if((this.comments[commentIndex])&&(this.comments[commentIndex][0]==textIndex)){
                myResult.push(this.comments[commentIndex][1]);
                commentIndex++;
            }else{
                myResult.push(this.bodyText.charAt(textIndex));
                textIndex++;
            }
            dataCount++;
        }else{
            myResult.push('');
        }
    } 
    myResult.push('----');
    return myResult;
  }
}
//TEST 
/*
        タイムラインをダイアログパースする
    タイムライントラックのメソッド
    引数なし
    音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
    今回は省略
    開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
    後から仕様に合わせて再調整
    判定内容は
    /^[-_]{3,4}$/    開始・終了マーカー
    /^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/    インラインコメント
    その他は
    ブランク中ならばラベル
    音響Object区間ならばコンテントテキストに積む 空白は無視する
    ⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
    オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
    
    トラックの内容をパースしてセクションコレクションを構築する機能はトラック自身に持たせる
    その際、トラックの種別毎に別のパーサを呼び出すことが必要なのでその調整を行う
    
        タイムライントラックのメソッドにする
        ストリームはトラックの内容を使う
        新規にセクションコレクションを作り、正常な処理終了後に先にあるセクションコレクションを上書きする
        ＊作成中に、同じ内容のセクションはキャッシュとして使用する？
        戻り値はビルドに成功したセクション数(最低で１セクション)
        値として 無音区間の音響オブジェクト（値）を作るか又は現状のままfalse(null)等で処理するかは一考
*/
nas._parseDialogTrack =function(){
    var myCollection = new nas.Xps.XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    //この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
    //継続時間０で先に作成 同時にカラのサウンドObjectを生成
    var groupName = this.id;
    var myGroup = this.xParent.parentXps.xMap.getElementByName(groupName);
    if (!myGroup) myGroup = this.xParent.parentXps.xMap.new_xMapElement(
        this.id,
        'dialog',
        this.xParent.parentXps.xMap.currentJob,
        ""
    ) ;//nas.xMap.xMapGroup(groupName,'dialog',null);//new nas.xMap.xMapGroup(myName,myOption,myLink);
    var currentSection=myCollection.addSection(null);//区間値false
    var currentSound=new nas.AnimationDialog(myGroup,"");//第一有値区間の値コンテンツはカラで初期化も保留
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        //未記入データ最も多いので最初に判定しておく
        if(this[fix]=="") continue;
        //括弧でエスケープされたコメント又は属性
        if(this[fix].match(/(^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$)/)){
            if(currentSection.value){
                currentSound.comments.push([currentSound.bodyText.length,RegExp.$1]);
            }else{
                currentSound.attributes.push(RegExp.$1);
            }
            continue;
        }
        //セクションセパレータ少ない
        if(this[fix].match(/^[-_~^〜＿ー￣]{3,4}$/)){
            if(currentSection.value){
                currentSection.duration --;//加算した継続長をキャンセル
                currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
                currentSection.tailMargin = 1;//-1
                currentSection=myCollection.addSection(null);//新規のブランクセクションを作る
                currentSection.headMargin = -1;
                currentSection.duration ++;//キャンセル分を後方区間に加算
                currentSound=new nas.AnimationDialog(groupName,null);//サウンドを新規作成
            }else{
//引数をサウンドオブジェクトでなくxMapElementに変更予定
//                nas.new_MapElement(name,Object xMapGroup,Object Job);
//console.log(currentSound.name);
                var sectionOffset = (currentSound.name)? 2 : 1 ;
                sectionOffset += currentSound.attributes.length;
                currentSection.tailMargin= -sectionOffset;
                currentSection=myCollection.addSection(currentSound);//新規有値セクション作成
                currentSection.headMargin = sectionOffset;
//console.log('ValuedSection offset :'+ sectionOffset)
//                currentSection.value.
            }
                        continue;
        }
//判定を全て抜けたデータは本文又はラベルは上書きで更新
//ラベル無しの音声オブジェクトは無しのまま保存必要に従って先行オブジェクトのラベルを引継ぐ
        if(currentSection.value){
            if(this[fix]=="|") this[fix]="ー";
            currentSound.bodyText+=this[fix];
        }else{
            currentSound.name=this[fix];
        }
    }
// 最終セクションは必ずブランクセクションになるのでtailMarginを設定する
// 最終セクションが長さ０の有値セクションになる可能性があるので注意！
//    currentSection.tailMargin = -1;
    this.sections=myCollection;
    return this.sections;
}

/** //test
nas.Xps.XpsTimelineTrack.prototype.parseSoundTrack=nas._parseSoundTrack;
XPS.xpsTracks[0].parseSoundTrack();
XPS.xpsTracks[0].sections[1].toString();

nas.Xps.XpsTimelineTrack.prototype.parseSoundTrack=nas._parseSoundTrack;
//nas.Xps.XpsTimelineTrack.prototype.parseDialogTrack=nas._parseDialogTrack;

//nas.Xps.XpsTimelineTrack.prototype.parseKeyAnimationTrack=nas._parsekeyAnimationTrack;
//nas.Xps.XpsTimelineTrack.prototype.parseAnimationTrack=nas._parseAnimationTrack;
nas.Xps.XpsTimelineTrack.prototype.parseReplacementTrack=nas._parseReplacementTrack;

nas.Xps.XpsTimelineTrack.prototype.parseCameraWorkTrack=nas._parseCameraworkTrack;

nas.Xps.XpsTimelineTrack.prototype.parseCompositeTrack=nas._parseCompositeTrack;//コンポジット

//nas.Xps.XpsTimelineTrack.prototype.parseTrack=nas._parseTrack;
//nas.Xps.XpsTimelineTrack.prototype.parseTrack=nas._parseTrack;
*/
/**
 *   主にサウンドスポッティングシートを想定した音響トラックの値
 *  @params {Object xMapElementGroup|null}  myParent
 *  @params {String} xMap型の記述
 *      基本的にXpsデータへの記載のみで xMapへの転記は発生しない
 
 値にはタイプが存在する
 sound      音響（アタックやトーンそのもの）を示す
 modifier   修飾状態 トリルやビブラート、音楽記号などを示す発音状態（主に休止・休符）を示す (カッコつきは修飾)
 
 */
nas.AnimationSound=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;//xMapElementGroup or null
    this.contentText = (myContent)? myContent : '--no-sound--';
                        //トラック記述をxMap記載型に変換した内容テキスト
                        //myContent==undefined で初期化を行った場合の値は--no-sound--
    this.name                                     ;//素材名（Xps表示文字列）
    this.source                                   ;//nas.AnimationElementSource
    this.comment                                  ;//コメント文字列 常にundefined
    this.extended = false;

    this.type  ;       //サウンド要素タイプ (undefined)|sound|modifier

    this.parseContent(myContent);
}
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.AnimationSound.prototype.sameValueAs = function(target){
    return (this.contentText.trim() == target.contentText.trim());
}
/**
 *    文字列化して返す
 *  @params {String} exportForm
 *      出力形式
 *   extended xMap形式
 *   basic|dafault   name only
 */
nas.AnimationSound.prototype.toString=function(exportForm){

    if(exportForm == 'extend'){
            return this.contentText;//
    }else if ((arguments.length==0)||((arguments.length==1)&&(! arguments[0]))||(exportForm == 'basic')){
            return this.name;//
    }
}
/** Contentをパースして プロパティを設定する内部メソッド
引数でcontentを与えてオブジェクト全体の値を更新することも可能
引数がAnimationSoundであった場合は、全プロパティを継承して引き写す
ただし引数と同じジョブ内のコレクションに追加を行う場合は、失敗するので要注意

xMap形式のデータをパースする nas.AnimationXXX シリーズオブジェクトの共通メソッド
xMapパーサから呼び出す際に共通でコールされる
引数が与えられない場合は、現在の保持コンテンツを再パースする
*/
nas.AnimationSound.prototype.parseContent = function(myContent){
//プロパティ複製
    if(myContent instanceof nas.AnimationSound){
        this.parent      = myContent.parent;
        this.contentText = myContent.contentText;
        this.name        = myContent.name;
        this.source      = myContent.source;
        this.comment
        this.extended    = myContent.extended;

        this.type        = myContent.type;
        return this;
    }
//引数がなければ現在のコンテンツを再パース
    if(typeof myContent == 'undefined'){
        myContent = this.contentText;
    }else{
        this.contentText = myContent;
    }
//console.log(myContent);
/*
    AnimationSoundの特殊値として
    contentText='--no-sound--'を設ける
    シンボルとしての「no-sound」
*/
    if(myContent == '--no-sound--') {
        this.parent = null;
        this.name   = '(x)';
        this.type   = undefined;
        return this;
    }
    var isGroup = (myContent.indexOf('[')==0)? true:false;
//第一形式グループ ^[\<group>\t<typeName>[\t<option-text>[\t<comment>]]\]$
//第二形式エントリ ^<group>\t<name>[\t<option-text>[\t<comment>]]$

    myContent = String(myContent).split('\n');
    for ( var line = 0 ; line < myContent.length ; line++){

    if((isGroup)&&(myContent[line].indexOf('[')==0)) myContent[line] = myContent[line].slice(1,-1);//ブラケット削除

        if(myContent[line].match(/^\t(\S+)\s*=\s*(.+)\s*$/)){
            //第二形式(タブ開始)でプロパティ別のデータ更新を行う
            this.extended=true;

            var myProp=RegExp.$1;var valueArray=csvSimple.parse(RegExp.$2)[0];

            switch(myProp){
            case "file":;// 旧プロパティ互換のため
            case "source":
                this.source = new nas.AnimationElementSource(valueArray[0]);
            break;
           default:
                this[myProp]=valueArray[0];
            }
        } else if(myContent[line].match(/^(\S+)\t?(\S+)\t?([^\t]+)?\t?(.*)$/)){
        // 第一形式の再パース
            var myGroup=RegExp.$1; //グループの再パースは行われない
            var myName =RegExp.$2;
                if(myName == '(x)'){
                    return this.parserContent('--no-sound--');
                }
            var myComment=RegExp.$4;
            var valueArray=nas.parseDataChank(RegExp.$3);

            if((! (this.parent))||(myGroup == this.parent.name)){
                if(! isGroup) this.name = String(myName);
                var numCount=0;
                for(var vix=0;vix<valueArray.length;vix++){
                    switch(valueArray[vix].type){
                    case "source":
                        this.source=new nas.AnimationElementSource(valueArray[vix].value);            
                    break;
                    default:
                        continue;
                    }
                }
                if(myComment) this.comment = myComment;
            }
        }else{
            this.contentText = '--no-sound--'
            this.parent = null;
            this.name   = '(x)';
            this.type   = undefined;
        }
    }
//console.log(this);
    this.type =(this.name.match(/^\(.+\)$/))?'modifier':'sound';
    return this;    
}
/** 指定フレーム数に内容を展開して配列で返す
 *  @params {Number}    cellCount
 *  @returns {Array}    展開済み配列
*/
nas.AnimationSound.prototype.getStream=function(cellCounts){
    var myResult=new Array(cellCounts);
    myResult[0]=(this.name)? this.name:"";
    if (myResult[0].match(/--no-sound--/)) myResult[0]="(☓)";
    return myResult;
}
/**
 *    サウンドタイムライントラックをパースしてセクションコレクションを返す
 *    セクションの値は各トラックごとxMapを介さないxMapエレメントのcontentプロパティを接続
 *
 *    サウンドトラックのセクションはすべてサブセクションを持つ
 *    サウンドの値はすべてサブセクションがこれを持ち、セクションは値を持たない
 *    楽譜の小節と音符の関連に近い
 *
 *
 */
nas._parseSoundTrack=function(){
    var endRegex  = new RegExp("^____$|^----$|^====$");//セクション終了判定 システム変数として分離予定
    //自分自身(トラック)を親として新規セクションコレクションを作成
    var myCollection      = new nas.Xps.XpsTimelineSectionCollection(this);//ベースコレクション
    //継続時間０で値未定初期セクションを作成
    //値を持たないセクションをブランク値のオブジェクトとするか？
    var currentSection=myCollection.addSection("sectionCareer");
    //currentSection.subSections=new nas.Xps.XpsTimelineSectionCollection(currentSection);
    var currentValue      = this.getDefaultValue();
    if(! currentValue) currentValue = new nas.AnimationSound(null,'--no-sound--');
    var currentSubSection = currentSection.subSections.addSection(currentValue);
/*
    サウンドトラックのセクションはすべて値を持たないセクショントレーラーであり、サブセクションが値を持つ
*/
    for (var fix=0;fix<this.length;fix++){
        var currentCell=new String(this[fix]);//記述を明示的に文字列化する

        currentSection.duration ++    ; //
        currentSubSection.duration ++ ;
        //未記入データ これが一番多いので最初に処理しておく(処理高速化のため)
        if(currentCell.match(/^([\|｜;]|\s+)$/)||currentCell.length==0) continue;
        //サブセクション切り替え判定
        if(currentCell.match(endRegex)){
            currentSection=myCollection.addSection("sectionCareer");//
//console.log(currentSection);
            //currentSection.subSections=new nas.Xps.XpsTimelineSectionCollection(currentSection);
            currentSubSection=currentSection.subSections.addSection(
                new nas.AnimationSound(null,'--no-sound--')
            );
         continue;
       }
/*切り替えを抜けたのですべてサブセクションの追加または更新*/
//console.log(fix+":"+currentCell);
//console.log(currentSection)
        if(currentSubSection.duration==1){
//            currentSubSection.value.parseContent(currentCell);

            currentSubSection.value.parseContent([this.id,currentCell].join("-"));
        }else{
            currentSubSection.duration --;
//                new nas.AnimationSound(this.id,currentCell);
            currentSubSection=currentSection.subSections.addSection(
                new nas.AnimationSound(null,[this.id,currentCell].join("-"))
            );
            currentSubSection.duration ++;
        }
        continue
    }
    this.sections       = myCollection;
    return this.sections;//ブランク情報の返し方を考えたほうが良いかも
}

/*test
     A=new nas.AnimationSound(null,"🎵");
     B=new nas.AnimationSound(null,"(＊)");
*/
/**

    タイムラインをパースしてセクション及びその値を求めるメソッド
    タイムライン種別ごとにパースするオブジェクトが異なるので
    各オブジェクトに特化したパーサが必要
    別々のパーサを作ってセクションパーサから呼び出して使用する
    Sound
        parseSoundTrack
        *parseDialogTrack
    Replacement
        parseKyeDrawind(補間区間あり)
        parseAnimationCell(確定タイムライン)
    Geometry
        parseCameraworkTrack
    Composite
        parseEffectTrack
    各々のパーサは、データ配列を入力としてセクションコレクションを返す
    各コレクションの要素はタイムラインセクションオブジェクト
    値はタイムライン種別ごとに異なるがセクション自体は共通オブジェクトとなる

nas.Xps.XpsTimelineTrack.prototype.parseTimelineTrack = function(){
    switch(this.option){
        case "dialog":;
            return this.parseDialogTrack();
        break;
        case "sound":;
            return this.parseSoundTrack();
        break;
        case "cell":;
        case "timing":;
        case "replacement":;
            return this.parseReplacementTrack();
        break;
        case "camerawork":;
        case "camera":;
            return this.parseCameraworkTrack();
        break;
        case "effect":;
        case "sfx":;
        case "composit":;
            return this.parseCompositeTrack();
        break;
    }
}
*/
/** Xpsに対するエージェントオブジェクト
 *  
 *  XpsデータをxMapに対して登録する際の代理オブジェクト
 *
 * 標準のXpst データ以外にも STS,ARD,XDTS,TDTS等の他フォーマットデータも登録可能とする
 * 汎用形式のテキスト、画像なども扱う
 * 編集が発生した場合は、発生ポイント移行をXpstに引き継ぐ
 *
 *
 *
 *
 */
nas.XpsAgent=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;
    this.contentText=(myContent)?String(myContent):"";//xMapのソースを保存する 自動で再構築が行なわれるタイミングがある

    this.name                                     ;//素材名
    this.source                                   ;//nas.AnimationElementSource
    this.comment                                  ;//コメント文字列 エレメントの注釈プロパティ-xMap編集UIのみで確認できる
    this.extended = false;

    this.attributes=[];
    this.comments=[];

    this.parseContent(myContent)
}
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.XpsAgent.prototype.sameValueAs = function(target){
    return (this.contentText.trim() == target.contentText.trim());
}
/**
    文字列化して返す
*/
nas.XpsAgent.prototype.toString=function(exportForm){
return this.contentText;//動作確認用ダミー行
}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
    戻り値はオブジェクト自身
*/
nas.XpsAgent.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }
    this.contentText = (myContent)?String(myContent):"";
    return this;
}
/** タイムシートに記述されるカメラワークの抽象化クラス
 *
 * FI,FO,OL,WIPE
 * SL,PAN,TILT,TU,TB
 *  等々の実際の処理に展開される抽象化シンボルを扱うクラスオブジェクト
 * シンボルデータベースnas.cameraDescriptionsを参照する
 *  シンボルを扱うため基本的にはｘMapとのリレーションがダイアログと同様にトラックに対する強い接続を持たない
 *  （=トラックが単なるキャリアとなる グループ内部のオブジェクト毎に再構成が必要）
 * cameraworkトラックのセクション値
 *  
 * nas.AimationCamerawork
 ex.
targets name attributes descriptions comments
symbol:◎
    symbol記述は、演出効果等で他の分類に収まらないかまたは複合的な状態を表す記述に対して用いられる分類
    例えば
    follow:symbol
    followSL:geometry

transition:＊
     トラジション記述の場合はターゲットの指定が不可欠
]x[ または ]><[ でトランジションの対象となる素材指定ができる
外ブラケットは解釈しない
対象が複数の場合はカンマで分離
処理シンボルは省略可能 その場合は無名トランジションとして扱う（オーバーラップディゾルブを補う？）
    ex.(transition)
s-c12]><[s-c13   <OL> (3+0)
s-c12]><[s-c13   <WIPE>(2+0)
A-1,B-3]><[A-2,B-4 <中OL> (0+18)


geometry:☆
    name attributes.join('-') comments .join(',')
    ex.(geometry)
<PAN> [A]-[B] ＞２つまで、 これ以上はセクション側で連結する 
<TU> [A]-[B]
A,B,C <slide> [1]-[2]-[3] ([2],[3]間フェアリング)

<follow> → (stage ← 2mm/k)

    ex.(geometry.zigzag)

composite:○
    ex.(composite.fi fo)
<FI> ▲ (1+12)
<FO> ▼ (time)

effect:□
    ex.(effect)
BG,A,E <透過光> 強 

***"effect"は予約タイプ現在（2019時点）使用されていない

xps description sample
CAM1
[start]  <後続セクション属性として保存
▼   ┐
|   中間値補完区間が同時にカメラワークのセクションとなる
|   この区間の名称及びサブプロパティは前置の形で前方セクションに置かれる
|   前方セクションは必ずブランクセクションに（セリフと同様に扱う）
PAN     nameは中央配置
|       表示優先順位は name>startNode>endNode>bar
|
|
▲   ┘
[end]   <先行セクションの属性値として保存

 */
nas.AnimationCameraworkPrefix={
    symbol:"◎",
    transition:"＊",
    geometry:"☆",
    composite:"★",
    effect:"※"
};
nas.AnimationCamerawork=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;//xMapElementGroup or null
    this.contentText=(myContent)?String(myContent):"";//xMapのソースを保存する 自動で再構築が行なわれるタイミングがある

    this.name   = ''                            ;//カメラワークシンボル名 値を識別する名称<矢括弧>でセパレート 正規化が行われた場合のトラック名になる
    this.source                                   ;//nas.AnimationElementSource（設定されない）
    this.comment                                  ;//コメント文字列 エレメントの注釈プロパティ-xMap編集UIのみで確認できる（設定されない）
    this.extended = true                          ;//常にtrue

    this.type         = ['symbol','']             ;//typeStringArray symbol,geometry,compositeをマスタータイプ サブタイプでエフェクトの種類が記録される DBとの対照で決定する
    this.attributes   = []                        ;//セパレートされていない文字列のうちnameにならなかったもの 通常は撮影指定コメント
    this.comments     = []                        ;//丸かっこでセパレートされたコメントの中身
    this.descriptions = []                        ;
    this.targets      = []                        ;//ワーク対象素材配列空の場合はカット全体が対象 トランジションの場合は必ず２要素の配列
                                                  ;//分割されたコンテンツ冒頭で、トラックIDと一致するもの A,B,BG,BOOK等
                                                  ;//トランジションの場合は分離要件を調整する
    this.prefix;                                   //セクション冒頭で[ブラケット]で囲まれる表示
    this.postfix;                                  //セクション末尾で[ブラケット]で囲まれる表示
    
    this.parseContent();
}
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.AnimationCamerawork.prototype.sameValueAs = function(target){
    return (this.contentText.trim() == target.contentText.trim());
}
/**
    文字列化して返す
    
書式は
    対象素材（省略可 省略時はカット全体）
    効果・識別名
    付属パラメータ（タイプごとに定義）composite,transition,geometry,effect,zigzag,fi,fo,stroboIn,stroboOut 等
symbol:(未分類)


連結条件は、トラック内でガードバンドを挟んで同じtarget,type,name のセクションが隣接している場合のみ
カメラワーク（シンボル）トラック内のセクションは、ガードバンドがあってもなくても良い
ジオメトリカメラワークトラック値セクションの前後には最低１フレームのガードバンドが入る
引数：    exportForm   出力書式
    basic         :xMap用１行エントリ
    ナシ/extend   :タイムシートメモ形式１行エントリ
*/
nas.AnimationCamerawork.prototype.toString=function(exportForm){
    if(! this.name) return '';//
if(exportForm == 'basic'){
        var resultArray=[(this.parent)?this.parent.name:"",this.name];
        if(this.source)         resultArray.push('"'+ this.source.toString(true)+'"');
        return resultArray.join("\t");
    }else{
    var descriptionPrefix="";
    var myResult=[];
//target
    if(this.targets.length){
        if(this.type[0]=='transition'){
            myResult.push([this.targets[0].join(','),"]><[",this.targets[1].join(',')].join(''));
        }else{       
            myResult.push(this.targets.join(','));
        }
    }
//warkName
    if(String(this.name).length) myResult.push('<'+this.name+'>');//文字列は<矢括弧>でセパレートする
//attribute
    switch(this.type[0]){
    case "symbol":
        if(this.attributes.length) myResult.push(this.attributes.join(" "));
    break;
    case "transition":
    case "composite":
    case "geometry":
    default:
        if(this.attributes.length) myResult.push(this.attributes.join("-"));        
    }
    if(this.descriptions.length) myResult.push(this.descriptions.join(' '));
    if(this.comments.length) myResult.push('(' + this.comments.join(') (') + ')');
    
    myResult = myResult.join(' ');
    if(this.source)         myResult+=('\n\tsource="'+ this.source.toString(true)+'"');
    return nas.AnimationCameraworkPrefix[this.type[0]] +' '+ myResult;
    }
}
/*TEST
A = new nas.AnimationCamerawork(null,"A,B,C <FI> ▲ (1+12)");
B = new nas.AnimationCamerawork({name:'CAM1'},"<PAN> [A]-[B]-[C] (2+13) (ラスト早く)");
*/
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
    xMapの記述は、基本的にダイアログと同等。入力はメモ欄に記述するテキストとほぼ等価
    メモ記述ライン冒頭が段落マーク（◎＊○●◇◆☆★等の強調サイン）だった場合はそれを無視して評価する
    toStringでえられる文字列を自動でメモ記述欄にカット間トランジションと同様に表示する（ユーザ指定外）
    メモ欄にユーザが入力した記述はメモ内容をパースして、カメラワーク記述を認識した場合タイムシートへの挿入を問い合わせる？

    例
★ A,B,C <Slide> ↑ [1]→[2]→[3] 
☆ クロコマ
※ pan [A]-[B]
＊ follow 
○
◯
●
■ 黒コマ
□ 白コマ
＜＜
＜

等になる
コンマ区切りのフィールド（フレーム）数に関わりなく
name        明示的<シンボル名>・暗示的シンボル名
prefix      コンテンツ頭の[ブラケット]で囲まれた要素
postfix     コンテンツ末尾の[ブラケット]で囲まれた要素
attributes  カッコのないむき出しの要素 基本的に素材ターゲット、transitionターゲットの場合は配列の配列
comments    (丸かっこ)で囲まれた要素 数値指定 尺指定はこの形式で統一
省略サインはすべて無視

トランジションのセパレータは /\](x|><|.+)\[/


xMap上の記述の形式
[CAM1   CAMERAWORK]
    グループ（トラック）登録
グループ（トラック）に、記述上の位置を示す以上の意味はない。
デフォルト値には有効な値が存在しない。
空白セクションに対応する「無効値」がデフォルト値となる。
よってグループ記述に対する値のパースは「名前だけを持った無効値」を返す。
*/
nas.AnimationCamerawork.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }

//xMapパーサからのグループエントリーデータなのでコンテンツをクリアして終了
  if(myContent.indexOf('[')==0){
//console.log('detect GroupEntry :'+myContent);
    this.contentText  ='';
//    this.name         = undefined;
//    this.file         = undefined;
//    this.comment      = undefined;
//    this.type         = ['symbol',''];
//    this.attributes   = [];
//    this.comments     = [];
//    this.descriptions = [];
//    this.targets      = [];
//    this.prefix       =undefined;
//    this.postfix      =undefined;
        return this;
}
    myContent = nas.normalizeStr(myContent);
    var myContentLines = myContent.split('\n');
    this.attributes   = [];
    this.comments     = [];
    this.descriptions = [];
    this.targets      = [];
    this.prefix       = undefined;
    this.postfix      = undefined;

    var myName        = '';
    var myTargets     = [];
    var myProps       = [];
    var bracketValues = [];

    for (var lid=0;lid<myContentLines.length;lid++){
        if(String(myContentLines[lid]).length==0) continue;//カメラワークでは意味を持たないので空白行スキップ
//console.log([myContentLines[lid].indexOf(this.parent.name+'\t')])
    if( (this.parent)&&
        (myContentLines[lid].indexOf(this.parent.name+'\t') == 0)&&
        (myContentLines[lid].match(/^[\S]+\t[\S]+/))
    ){
//console.log('XXXXXXX entry :'+myContentLines[lid]);
        var myContents  = myContentLines[lid].split('\t');
//xMapパーサからのエントリ登録データなのでコンテンツを初期化
//第三エントリが存在した場合source propertyを設定する
        this.name = myContents[1];
        if(myContents.length>2){this.source = new nas.AnimationElementSource(myContents.slice(2).join(' '));}
        continue;
    }else{
//プロパティ単独記述 プロパティ別のパースが必要だが、ここで処理しないほうが良いかも その場合はtoString側も要修正
    if(myContentLines[lid].match(/^\t([^=\s]+)=(.+)/)){
//console.log('single propertiy =========================='+ myContent+'+++++');
        var myPrp = RegExp.$1; var myVlu = csvSimple.parse(RegExp.$2)[0];
        switch(myPrp){
        case 'file':;// 旧プロパティ互換
        case 'source':
            this.source = new nas.AnimationElementSource(myVlu[0]);break;
        default : this[myPrp]=myVlu[0];
        }
        continue;
    }
    var myContents    = (myContentLines[lid].replace(/^[◎*◯○●・◇◆☆★]/g,"").replace(/\s+/g,'\t')).split('\t');
//console.log(this.parent.name);
//console.log(myContents);
//    var myName        = '';
//    var myTargets     = [];
//    var myProps       = [];
//    var bracketValues = [];

//name検出
    if (myContent.match(/<([^<]+)>/)){
        myName = RegExp.$1;
    } else if(myContents.length){
        var myWord = '';
        for( var cix = 0; cix < myContents.length ; cix ++){
            //書式上カメラワーク指定外のエントリをスキップ
            if(myContents[cix].match(/^\[|^\(|(cell|セル|BG.*|BOOK.*)$|\)$|,/i)) continue;
            if(! myWord) myWord = myContents[cix];//最初の候補単語を控える
            if(nas.cameraworkDescriptions.get(myContents[cix])){
                myName = myContents[cix];
                myContents.splice(cix,1);
                break;
            }
        }        
        if(! myName) myName = (myWord)? myWord : "";//！注意点！
/*  カメラワークの名称を取得できなかった場合は、遅延解決のため必ず""(空文字列)に設定のこと */
    }
// トランジション検出
//  カメラワークタイプがトランジションに固定されて名前はトランジションのサブタイプ（種別）情報となる
    var detectTransition = myContent.match(/([^\[\s]+)\]([^\[\-ー→]+)\[([^\]\s]+)/i);
//console.log(detectTransition);
    if(detectTransition){
        if((myName == detectTransition[0])||(myName == '')) myName = detectTransition[2];
        this.targets=[detectTransition[1].split(','),detectTransition[3].split(',')];   
        if(myName.match(/x|></i)) myName = 'transition';//noname transition sign
    }
    this.name = myName;
console.log(this.name)
//検出したシンボルからタイプ
    var mySymbol = nas.cameraworkDescriptions.get(this.name);
console.log(mySymbol)
    if (! mySymbol) mySymbol = nas.cameraworkDescriptions.get('unknown')
/*symbol未検出時はユーザ指定を促すか？*/
    this.type = [mySymbol.type,mySymbol.name];

//コメント検出
    var commentsGet = myContent.match(/\(([^\)]+)\)/g);
//コメントリダクション
    if(commentsGet) {
        for (var cix = 0 ;cix < commentsGet.length;cix ++){
            commentsGet[cix] = commentsGet[cix].replace(/^\(\s*|\s*\)$/gi,'');
            if(! commentsGet[cix]) continue;
            this.comments.push(commentsGet[cix]);
        }
    }

//タイプ別に残りの属性値を判別
//console.log(myContents);
    for(var cix = 0 ; cix < myContents.length ; cix++){
//transition指定エントリをスキップ
        if((detectTransition)&&(myContents[cix] == detectTransition[0])){
//console.log(myContents[cix]);
            continue;
        }
//コメント取得済みなのでスキップ
        if(myContents[cix].match(/^\(|\)&/)) continue;
//カメラワーク名スキップ
        var checkName = myContents[cix].match(new RegExp('<?'+this.name+'>?','i'));
        if((checkName)&&(checkName[0])){
//console.log(checkName);
            continue;
        }
//ターゲット検出
//この時点ではポストフィックスと空エントリが含まれる
        if(myContents[cix].match(/(cell|セル)$|(BG.*|BOOK.*)$|,/i)){
//console.log(myContents[cix]);
            if((myContents[cix].indexOf(',') > 0)){
                myTargets = myTargets.concat(myContents[cix].split(','));
                continue;
            }else{
                myTargets.push(myContents[cix]);
            }
            continue;
        }
//残りはすべてアトリビュート
//[ブラケット]
//console.log(myContents[cix]);
       if( myContents[cix].match(/^(\[[^\]]+\][-ー→]?)+/)){
            bracketValues  = bracketValues.concat(myContents[cix].replace(/[-ー→]/g,",").split(','));
            continue
        }
        switch (this.type[0]){
        case "composite":
            if((mySymbol.nodeSigns)&&(mySymbol.nodeSigns.length > 2)&&(myProps.indexOf(mySymbol.nodeSigns[1]) < 0)){
                myProps.push(mySymbol.nodeSigns[2]);
            }
        case "geometry":
        case "transition":
        case "symbol":
        default:
            myProps.push(myContents[cix]);
        }    
    }
//myTargetsリダクション
        
    for (var tix = 0 ;tix < myTargets.length;tix ++){
        if(myTargets[tix] instanceof Array){this.targets.push(myTargets[tix]);continue;}
        if(! myTargets[tix]) continue;
        this.targets.push(myTargets[tix].replace(/(cell|セル)$/gi,''));
    }
//bracketValuesリダクション
    for (var bix = 0 ;bix < bracketValues.length;bix ++){
        if(! bracketValues[bix]) continue;
        this.attributes.push(bracketValues[bix]);
        if(! this.prefix)                   this.prefix  = bracketValues[bix];
    }
    if((this.prefix)&&(! this.postfix)) this.postfix = this.attributes[this.attributes.length - 1];
//myPropsリダクション
    for (var pix = 0 ;pix < myProps.length;pix ++){
        if(! myProps[pix]) continue;
        var isGroup=false;
//        if((this.parent)&&(this.parent instanceof nas.xMap.xMapGroup)) isGroup = this.parent.link.stage.line.parent.getElementByName(myProps[pix]);
//console.log(this.parent)
        if((this.parent)&&(this.parent instanceof nas.xMap.xMapGroup)) isGroup = this.parent.link.parent.parent.parent.getElementByName(myProps[pix]);//新オブジェクトで
        if((isGroup)&&(isGroup instanceof nas.xMap.xMapGroup)){
            this.targets.push(myProps[pix]);
        }else{
            this.descriptions.push(myProps[pix]);
        }
    }
  }
    }
    this.contentText = this.toString();//(myContent)?String(myContent):"";
    return this;
}
/* TEST
new nas.AnimationCamerawork(null,"A,B,Cセル BG BOOK2 BOOK3 SL [A]-[B] (じんわり)");

new nas.AnimationCamerawork(null,"slide");
new nas.AnimationCamerawork(null,"BOOK3 FI ()");
new nas.AnimationCamerawork(null,"クロコマ");

*/


/**

ストリームの構造
[A] prefix
▽   StartSign
|       interpSign
|
<PAN>       name
|
|
△   EndSign
[B] postfix

ブラケット値以外のアトリビュートが記録されないので何らかの処置を取る
コメント表示を行う必要がある
メモ欄に流し込んで、両方を合成処理するか？


prfix<postfix<name<StartSign<endSign<interpSign
*/
nas.AnimationCamerawork.prototype.getStream=function(cellCounts){
    if(isNaN(cellCounts)) cellCounts = 1;//1  > minimumCount

    var minCount = 1 ;//name
//    if(this.prefix)  minCount++;
//    if(this.postfix) minCount++;


    if(cellCounts<0)cellCounts=Math.abs(cellCounts);
    if(cellCounts >= minCount){
        var mySymbol = nas.cameraworkDescriptions.get(this.type[1]);
        if(! mySymbol) mySymbol = nas.cameraworkDescriptions.get('bar');
        var myName = (mySymbol.nodeSigns.length == 1) ?mySymbol.nodeSigns[0]:'<'+this.name+'>';
        var myResult = new Array(cellCounts);
        for (var ix = 0 ; ix < cellCounts ;ix ++){
            if(ix == Math.floor((cellCounts-(1+this.comments.length))/2)){
                myResult[ix] = myName;
                if(this.comments.length){
                    for (var cx = 0 ;cx<this.comments.length;cx++){
                        myResult[ix+cx+1] = '('+this.comments[cx]+')';
                    }
                    ix += this.comments.length;
                }
               continue;
            }
            if ((ix == 0)&&(mySymbol.nodeSigns[1])){
                myResult[ix] = mySymbol.nodeSigns[1];
                continue;
            }
            if ((ix == (cellCounts-1))&&(mySymbol.nodeSigns[1])){
                myResult[ix] = (mySymbol.nodeSigns[2])?mySymbol.nodeSigns[2]:mySymbol.nodeSigns[1];
                break;
            }
            myResult[ix] = mySymbol.nodeSigns[0];
        }
        if(this.prefix)  myResult = [this.prefix].concat(myResult);
        if(this.postfix) myResult = myResult.concat([this.postfix]);
 
     return myResult;
  }
}


/** 単純な記録が必要な場合のオブジェクト
 * 基礎的なデータを保持
 *  コンテの記述等がこの値で保持される
 *  また共通に要求されるメソッドの雛形
 *
 *  タイムシートのトラックの値として利用されることはない
 */
nas.StoryboardDescription=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;//xMapElementGroup or null
    this.contentText=(myContent)?String(myContent):"";//xMapのソースを保存する 自動で再構築が行なわれるタイミングがある
/** ex.
[description   text]
description s-c4
#----------------------------------------------------------------
	カメラ背中側から
	<PAN↑UP>
	立てかけた猟銃 その他 猟師さん風荷物など見える
	
	バタバタとうちわであおぐ
#----------------------------------------------------------------    
絵コンテのト書きに相当する行頭のタブを払って記録される
*/

    this.name                                     ;//素材名
    this.source                                   ;//nas.AnimationElementSource
    this.comment                                  ;//コメント文字列 エレメントの注釈プロパティ-xMap編集UIのみで確認できる
    this.extended = false;

    this.type;  //typeString storyBoardText 
    this.attributes=[];
    this.comments=[];
    
    this.parseContent();
}
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.StoryboardDescription.prototype.sameValueAs = function(target){
    return (this.contentText.trim() == target.contentText.trim());
}
/**
    文字列化して返す
*/
nas.StoryboardDescription.prototype.toString=function(exportForm){
return this.contentText;//動作確認用ダミー行
}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
*/
nas.StoryboardDescription.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }
    this.contentText = (myContent)?String(myContent):"";
    return this;
}

nas.StoryboardDescription.prototype.getStream=function(cellCounts){
    if(isNaN(cellCounts)) return this.getContent();//cellCounts = this.getContent().length;?
    if(cellCounts<0)cellCounts=Math.abs(cellCounts);
  if(cellCounts){
    var myResult = new Array(cellCounts);
    myResult[0]=(this.name)? this.name:"";
    
    if(String(this.name).length) myResult.push(this.name);//ラベルあれば
    for(var aid=0;aid<this.attributes.length;aid++){myResult.push(this.attributes[aid])};//アトリビュート
    myResult.push('----');//開始セパレータ
    var entryCount = this.bodyText.length+this.comments.length;//テキスト文字数とコメント数を加算
    var dataCount = 0;//データカウントを０で初期化
    var textIndex = 0;//テクストインデックス
    var commentIndex = 0;//コメントインデックス
    var dataStep = cellCounts/entryCount ;//データステップ
    for(var cnt = 0; cnt < cellCounts; cnt ++){
        var myIndex = (entryCount >= cellCounts) ? cnt:Math.floor(cnt/dataStep);//配置Index
        //挿入点判定
        if(dataCount==myIndex){
            if((this.comments[commentIndex])&&(this.comments[commentIndex][0]==textIndex)){
                myResult.push(this.comments[commentIndex][1]);
                commentIndex++;
            }else{
                myResult.push(this.bodyText.charAt(textIndex));
                textIndex++;
            }
            dataCount++;
        }else{
            myResult.push('');
        }
    } 
    myResult.push('----');
    return myResult;
  }
}

/** nas.AnimationAppearance
 *  
 *  ブランク（カラセル）管理セクションで使用されるアピアランスに特化した値
 * 値は ON-OFF 状態をbooleanで持つ
 * ソース等のプロパティは持たない 一時的な値でありｘMapに記述されることはない
 * コンテントテキスト
 *
 */
nas.AnimationAppearance=function(myParent,myContent){
    this.parent      = (myParent)? myParent : null     ;
    this.contentText = (myContent)? myContent : "on"       ;
    this.appearance  = false       ;//表示状態を表す

    this.parseContent();
}
/**
 *    同値判定メソッド
 *   @params {Object}    target
 *   値種別ごとに同値判定条件が異なるので注意
 */
nas.AnimationAppearance.prototype.sameValueAs = function(target){
    return (this.appearance == target.appearance);
}
/**
    文字列化して返す
*/
nas.AnimationAppearance.prototype.toString=function(exportForm){
return (this.appearance)?"ON":"OFF";//動作確認用ダミー行
}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
    xMapのエントリを扱うためCellDescriptionの持つ正規表現オブジェクトを直接使用しない
    戻り値はオブジェクト自身
*/
nas.AnimationAppearance.prototype.parseContent=function(myContent){
    var blankRegex=new RegExp("^(\\b|blank(-cell)?|off|false|empty|"+nas.CellDescription.blankSigns.join("|")+")$","i");
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }

    this.appearance = (this.contentText.match(blankRegex))? false : true ;

    return this;
}
/*静止画トラックのパース
静止画トラックは基本的に置き換えのない静止画のみを扱う
値は AnimationAppearanceに画像名（AnimationSource）を与えて使用する
認識するセル記述は [on/off][true/false][empty/full][blank/fill][disappearance/appearance][0/1]等の二項記述

入れ替えが必要な場合は、ReplacementTrackを使用するかまたは複数の静止画トラックを使用すること
*/
nas._parseStillTrack =function(){
    var myCollection = new nas.Xps.XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    //この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
    //継続時間０で先に作成 同時にカラのサウンドObjectを生成
    var groupName = this.id;
    var myGroup = this.xParent.parentXps.xMap.getElementByName(groupName);
    if (!myGroup) myGroup = this.xParent.parentXps.xMap.new_xMapElement(
        this.id,
        'CELL',
        this.xParent.parentXps.xMap.currentJob,
        [this.id,""].join('\t')
    ) ;//nas.xMap.xMapGroup(groupName,'dialog',null);//new nas.xMap.xMapGroup(myName,myOption,myLink);
    var currentValue=new nas.AnimationAppearance(myGroup,"");//第一有値区間の値コンテンツはカラで初期化も保留
    var currentSection=myCollection.addSection(null);//区間値false
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        //未記入データ最も多いので最初に判定しておく
        if(this[fix]=="") continue;
        //括弧でエスケープされたコメント又は属性
        if(this[fix].match(/(^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$)/)){
            if(currentSection.value){
                currentSound.comments.push([currentSound.bodyText.length,RegExp.$1]);
            }else{
                currentSound.attributes.push(RegExp.$1);
            }
            continue;
        }
        //セクションセパレータ少ない
        if(this[fix].match(/^[-_~^〜＿ー￣]{3,4}$/)){
            if(currentSection.value){
                currentSection.duration --;//加算した継続長をキャンセル
                currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
                currentSection=myCollection.addSection(null);//新規のカラセクションを作る
                currentSection.duration ++;//キャンセル分を後方区間に加算
                currentSound=new nas.AnimationDialog(groupName,"");//サウンドを新規作成
            }else{
//引数をサウンドオブジェクトでなくxMapElementに変更予定
//                nas.new_MapElement(name,Object xMapGroup,Object Job);
                currentSection=myCollection.addSection(currentSound);//新規有値セクション作成
//                currentSection.value.
            }
                        continue;
        }
//判定を全て抜けたデータは本文又はラベルラベルは上書きで更新
//ラベル無しの音声オブジェクトは無しのまま保存必要に従って先行オブジェクトのラベルを引継ぐ
        if(currentSection.value){
            if(this[fix]=="|") this[fix]="ー";
            currentSound.bodyText+=this[fix];
        }else{
            currentSound.name=this[fix];
        }
    }
    this.sections=myCollection;
    return this.sections;
}
//test
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas = nas;
}
