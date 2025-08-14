/*
    主にSE及びBGM等のセリフ以外のサウンドを扱うオブジェクト
    値にブランクが存在するので、リプレースメントをベースに作成

初期化引数の（コンテント）形式は、'ラベル"注釈テクスト"'
スポッティング等に使用されるトラック
*/
nas.AnimationSound=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;//xMapElementGroup or null
    this.contentText = (myContent)? myContent : '';//xMap上のコンテントソースを保存する　自動で再構築が行なわれるタイミングがある
                                                   //myContent undefined で初期化を行った場合の値は blank-cell
    this.name                                     ;//要素名（グループ名があればパース時に除く）
    this.noteText                                 ;//注釈テキスト　要素区間にマージンがあれば表示される
    this.source                                   ;//nas.AnimationElementSource
    this.comment                                  ;//コメント文字列　エレメントの注釈プロパティ-xMap編集UIのみで確認できる

    this.parseContent();
}
/*
主に予約ラベルで構成されるが、シートに入力された注釈テキストがあればそれらをxMapに保存する。
注釈テキストは
*/
nas.AnimationSound.prototype.toString=function(exportForm){
//return this.contentText;//動作確認用ダミー行

    if(exportForm == 'extend'){
        var resultArray=[];
        if(this.source)   resultArray.push('\tfile = "'    + this.source.toString(true)+'"');
        if(this.size)     resultArray.push('\tsize = '     + this.size.toString());
        if(this.offset)   resultArray.push('\toffset = '   + this.offset.toString());
        if(this.rotation) resultArray.push('\trotation = ' + this.rotation.toString());
        if(this.comment)  resultArray.push('\tcomment = '  + this.comment);
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
}
//nas.AnimationSound.prototype.valueOf=function(){
//    return nas.parseNumber(nas.normalizeStr(this.name).replace(/^[^0-9]*/,""))
//valueOfの設定自体にあまり意味が無いのでやめたほうがヨサゲ　
//}
/**　与えられたオブジェクトとプロパティ同士を比較して　変更状態を返す
    引数
対照する基準値（オブジェクト）
    戻り値
変更状態コード
0   変化なし    最小標準出力に対応
1   標準変更    拡張標準出力に対応
2   重度変更    フルダンプに対応
*/
nas.AnimationSound.prototype.compareWith= function(targetValue){
    var igunoreProps    =['contentText','source'];
    var basicProp       =['size','offset','comment'];
    var extendProps     =['pegOffset',];
}
/** タイミングパラメータに従って指定されたフレームのキー間の補完値を返す

  　置きかえタイムラインの中間値は前方値で代表されるので基本的に戻り値は自分自身
    オプションの状態によって（時間的）中間タイミングで後方値に切り替える
    return endValue;
    又はブランク状態のオブジェクトを返す
  　return new nas.newAnimationSound("blank");
*/
nas.AnimationSound.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;
}

/** Contentをパースして　プロパティを設定する内部メソッド
引数でcontentを与えてオブジェクト全体の値を更新することも可能
引数がAnimationRepalcementであった場合は、全プロパティを継承して引き写す
ただし引数と同じジョブ内のコレクションに追加を行う場合は、失敗するので要注意

xMap形式のデータをパースする　nas.AnimationXXX シリーズオブジェクトの共通メソッド
xMapパーサから呼び出す際に共通でコールされる
引数が与えられない場合は、現在の保持コンテンツを再パースする
*/
nas.AnimationSound.prototype.parseContent = function(myContent){
//    var blankRegex  = new RegExp("^[ｘＸxX×〆0０]$");//カラ判定　システム変数として分離予定
    var interpRegex = new RegExp("^[\-\+=○●*・a-zア-ン]$|^\[[^\]]+\]$");//中間値補間（動画記号）サイン　同上
    var valueRegex  = new RegExp("^[\(<]?[0-9]+[>\)]?$");//無条件有効値 同上

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
    サイズは不問　 シンボルとしての「カラセル」

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

            switch(myProp){
            case "file":
                this.file = new nas.AnimationElementSource(valueArray[0]);
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
        //　第一形式の再パース
console.log(myContent[line]);
            var myGroup=RegExp.$1; //グループの再パースは行われない
            var myName =RegExp.$2;
            var myComment=RegExp.$4;
            var valueArray=nas.parseDataChank(RegExp.$3);
            var numeProps =[["size","x"],["size","y"],["offset","x"],["offset","y"]];

console.log(myComment);
console.log(valueArray);
console.log(this);
/*
    フィールド文字列であった場合の判定が必要　2018 10 09

case :this.parent == null
*/
            if((! (this.parent))||(myGroup == this.parent.name)){
                if(! isGroup) this.name = myName.replace(new RegExp('^'+myGroup+'\-'),"");
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
戻値 :配列　+ offset
*/
nas.AnimationSound.prototype.getStream=function(cellCounts){
    var myResult=new Array(cellCounts);
    myResult[0]=(this.name)? this.name:"";
    if (myResult[0].match(/blank(-cell)?/)) myResult[0]="X";
    return myResult;
}
/**
    置きかえタイムライントラックをパースしてセクションコレクションを返す
    セクションの値を各トラックごとの値オブジェクトからxMapを介したxMapエレメントに変更する

    パース時にセクションの値判定を行う
    ・無効記述
    ・有効記述　値あり（xMap既存エレメント）・なし（新規エレメント）
    
 タイムライントラックをパースする際に統一手順としてトラックに対応するxMapエレメントグループの有無を確認する。
現行Jobにトラックと同名のエレメントグループが、存在しなかった場合（Stageには存在する可能性あり）は、新規にグループを作成してエントリすること。
この処理は、トラックパースの前段階で共通で行うことにする

確認手段は xMap.getElementByName(グループ名)を使用
//XpsTimelineTrack.parseTimelineTrack()　メソッドに置く


中間値補間区間の空セルに対応するために全体のブランク処理をサブセクションコレクションに置く
置きかえタイムラインのみの処置
カラ状態のみを扱うsctionCollectionを併置してセットで扱うので注意
各セクションのvalueは　on/off(true/false)のみでオブジェクトは使用されない　エレメントへのリンクも無い
一つのトラックをパースして二つのセクションコレクションを得る
値側のコレクションは、従来のカラを含むことができるが、このパーサが書き出すデータ上は従来型のカラが含まれることは無い
カラ区間の値は先行区間の値となる
カラセル区間コレクションは2つの状態しか持ち得ないので、サブセクションは発生しない

　*/
_parseReplacementTrack=function(){
//    var blankRegex  = new RegExp("^[ｘＸxX×〆0０]$");//カラ判定　システム変数として分離予定
    var interpRegex = new RegExp("^[\-\+=○◯●*・a-zア-ン]$|^\[[^\]]+\]$");//中間値補間（動画記号）サイン　同上
    var valueRegex  = new RegExp("^[\(<]?[0-9]+[>\)]?$");//無条件有効値 同上
    //自分自身(トラック)を親として新規セクションコレクションを作成
    var myCollectionBlank = new XpsTimelineSectionCollection(this);//ブランクベースコレクション
    var myCollection      = new XpsTimelineSectionCollection(this);//ベースコレクション

    var appearance    = new nas.AnimationAppearance(null,'on');
    var disAppearance = new nas.AnimationAppearance(null,'off');

    //継続時間０で値未定初期セクションを作成
    //値を持たないセクションをブランク値のオブジェクトとするか？
    var currentSection=myCollection.addSection(null);
    
    var currentSubSection = null;
    var currentValue      = this.getDefaultValue();
    if(! currentValue) currentValue = new nas.AnimationSound('system','blank-cell');
//console.log(currentValue)
    var isInterp = false;
    var isBlank  = ((! currentValue)||(currentValue.contentText == "blank-cell"))? true:false ;//デフォルトのブランク状態を取得

var currentSectionBlank=(isBlank)? myCollectionBlank.addSection(disAppearance):myCollectionBlank.addSection(appearance);

    var valueDetect = false;
/**
    タイムライントラックのデフォルト値は、以下の手続きで取得
    タイムラインラベルが指定するグループがあらかじめ存在する場合は、そのグループオブジェクトが保持する値
    存在しない場合は、新規にグループを作成する。その際にトラックの種別ごとのValueオブジェクトを初期値として登録するのでその値を使用
    XpsTimelineTrack.getDefeultValue()側で調整
    Replacementの場合基本はブランクだが、必ずしもブランクとは限らないので要注意
    トラック上で明示的なブランクが指定された場合は、値にfalse/null/"blank"を与える。
*/
    for (var fix=0;fix<this.length;fix++){
        var currentCell=Xps.sliceReplacementLabel(new String(this[fix]));//記述をラベルとエントリに分解 
        if( currentCell.length == 1 ){ currentCell.push(this.id); }//エントリにグループ名が含まれないようならばトラックのラベルで補う
        // ここでデータの形式は [name,groupName] となる
        currentSection.duration ++; //
        currentSectionBlank.duration ++;     //セクション長加算
        if(currentSubSection) currentSubSection.duration ++ ;
        //未記入データ　これが一番多いので最初に処理しておく(処理高速化のため)
        if(currentCell[0].match(/^([\|｜;]|\s+)$/)||currentCell.length==0) continue;
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
                        currentSection.value = new nas.AnimationSound('system','blank-cell');// *Blank-set
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
        //既定値以外の補間サイン検出が必要>> 規定値のみを補完サインと定義する　他の記述はコメントとして利用
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
                //中間値補間区間開始　カレントセクションを切り替え サブセクションを登録
                isInterp = true;
                if(fix==0){
                    currentSection.value="interpolation";
                }else{
                    currentSection.duration --;
                    currentSection=myCollection.addSection("interpolation");
                    currentSection.duration ++;
                }
                currentSubSection = currentSection.subSections.addSection(new nas.AnimationSound(null,currentCell.join("-")));
                currentSubSection.duration ++;
                //新規中間値補間セクションを立てる 以降は、モードを抜けるまでカレント固定
              }else{
                currentSubSection.duration --;
                currentSubSection = currentSection.subSections.addSection(new nas.AnimationSound(null,currentCell.join("-")));
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
//console.log(currentCell.join("-"));
        var currentElement = this.xParent.parentXps.xMap.getElementByName(currentCell.join("-"));
        if(currentElement) {
//console.log("value detcted in xMap:");
            valueDetect=true;
        }else{
//console.log("value not detcted in xMap: push Entry "+currentCell.reverse().join("-"));
            if(String(currentCell[0]).match(valueRegex)){
                valueDetect = true;
                currentElement=this.pushEntry(currentCell[0],currentCell[1]);
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
                currentSubSection.duration --;
                currentSubSection = null;
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

XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;
XPS.xpsTracks[2].parseReplacementTrack();
XPS.xpsTracks[2].sections[1].toString();

XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;

XpsTimelineTrack.prototype.parseCameraWorkTrack=_parseCameraworkTrack;

XpsTimelineTrack.prototype.parseCompositeTrack=_parseCompositeTrack;//コンポジット

//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
*/