/*    時間計測用タイムシート本体のHTMLを返すメソッド
 *        xUI.timerView()
 *  表示は１ページに限定、HTML表示範囲のサイズでウインドウサイズが決定する
 *  カラムの高さは指定のフレームレートで整数秒に収まる最大長
 *  横幅カラム数は、最少で３トラック、ページサイズの許す限界まで拡張可能とする（可変ウインドウ）。
 *  したがって画面サイズを変更のたびに計測ウインドウのリフレッシュが必要
 *  内容の更新は別のプロシジャ
 *  このプロシジャは、基礎計測ウインドウの描画のみを行う
 *　必要なパラメータ
 *  @params {Number} windowRange
 *      計測ウインドウの長さ(フレーム数）必須だがこれは　本体プロパティとして必要
 *  @params {Number} windowOffset
 *      開始オフセット(フレーム数）
 *  @params {Number} windowColumns必須　同上
 *      描画カラム数(幅)
 *  @params {Object nas.Framerate|Number}
 *      フレームレート(引数がなければシステム参照)FPS
 */
xUI.timerView =function(windowRange,windowOffset,windowColumns,){
    var BODY_ = '';
    var headlineHeight=36;
    
    
//ページ数//プロパティに変更せよ
var Pages=Math.ceil((this.XPS.duration()/this.XPS.framerate)/this.SheetLength);//総尺をページ秒数で割って切り上げ
var SheetRows=Math.ceil(this.SheetLength/this.PageCols)*Math.ceil(this.XPS.framerate);
var hasEndMarker=false;// 継続時間終了時のエンドマーカー配置判定(初期値)


//ページ番号が現存のページ外だった場合丸める
    if (pageNumber >=Pages){
        pageNumber=Pages;
    } else {
        if(pageNumber<=-3) pageNumber=0;
    };
    pageNumber--;

//タイムシートテーブル

//タイムシートテーブルボディ幅の算出
/*
タイムシートのルック調整の為のおぼえがき
画面上は、規定幅のエレメントをすべて設定した状態で配置(cssに設定)
全体幅は自動計算
印字上は全体幅の規定が存在するので、規定幅をテーブル全体幅に設定して
フレームコメント以外の各エレメントの設定をcssで行い
誤差をフレームコメントで吸収する。（epsと同じアルゴリズム）
そのために必要な表示クラスを設定
    TimeGuideWidth    th.timeguidelabel
    ActionWidth    th.layerlabelR
    DialogWidth    th.dialoglabel
    SheetCellWidth    th.layerlabel
*new    cameraWidth    th.cameraLabel
    CommentWidth    th.framenotelabel
    ColumnSeparatorWidth colSep
印字に適さない設定(幅/高さオーバー)の場合は、一応警告を表示する。
印字用cssは、固定で作成する。A4,A3,B4,レターサイズくらいのところで作る

*/
/**/
if(this.viewMode=="Compact"){
var tableFixWidth=(
    this.sheetLooks.TimeGuideWidth +
    this.sheetLooks.ActionWidth*this.referenceLabels.length 
    );
var tableColumnWidth=(
    tableFixWidth+
    this.sheetLooks.DialogWidth*xUI.dialogCount +
    this.sheetLooks.StillCellWidth*xUI.stillCount +
    this.sheetLooks.GeometryCellWidth*xUI.stageworkCount +
    this.sheetLooks.SfxCellWidth*xUI.sfxCount +
    this.sheetLooks.CameraCellWidth*xUI.cameraCount +
    this.sheetLooks.SheetCellWidth*xUI.timingCount +
    this.sheetLooks.CommentWidth );//

/*+
    DialogWidth*(xUI.dialogSpan-1)
        (第二・第三象限固定幅)
    (
    参照レイヤ数*参照セル幅+
    タイムヘッダ幅+
    ダイアログ幅
    )
    TimeGuideWidth +
    ActionWidth*xUI.referenceLabels.length +
    DialogWidth*(xUI.dialogCount-xUI.dialogSpan)+
*/
//alert(    DialogWidth*(xUI.dialogCount-xUI.dialogSpan) );
    var tableBodyWidth=tableColumnWidth;
/*
コンパクトモードで１段固定(第一象限スクロールデータ)
    (
    参照レイヤ数*参照セル幅+
    タイムヘッダ幅+
    ダイアログ幅+
    stillレイヤ数*stillセル幅+
    timingレイヤ数*timingセル幅+
    sfxレイヤ数*sfxセル幅+
    cameraレイヤ数*cameraセル幅+
    コメント欄幅
    )
*/
    var PageCols=1;
    var SheetLength=Math.ceil(this.XPS.duration()/this.XPS.framerate);
}else{
//シートワープロモード
/*    第二象限固定ヘッダは、タイムガイド幅
    第一象限ヘッダーはカラム数分繰り返し
    第三象限ヘッダーはシート枚数分繰り返し
UI設定に基づいて段組
*/
    var tableFixWidth=this.sheetLooks.TimeGuideWidth;

    var tableColumnWidth=(
    this.sheetLooks.TimeGuideWidth +
    this.sheetLooks.ActionWidth*this.referenceLabels.length +
    this.sheetLooks.DialogWidth*xUI.dialogCount +
    this.sheetLooks.StillCellWidth*xUI.stillCount +
    this.sheetLooks.GeometryCellWidth*xUI.stageworkCount +
    this.sheetLooks.SfxCellWidth*xUI.sfxCount +
    this.sheetLooks.CameraCellWidth*xUI.cameraCount +
    this.sheetLooks.SheetCellWidth*xUI.timingCount +
    this.sheetLooks.CommentWidth );
/*
    以前はテーブル内のタイムラン種別をここで判定していたが
    xUIのプロパティに変換してこちらでは計算のみを行う仕様に変更済み 2015/04.25
*/
    var tableBodyWidth=tableColumnWidth * this.PageCols +
        (this.sheetLooks.ColumnSeparatorWidth*(this.PageCols-1));//
/*
    (
    参照レイヤ数*参照セル幅+
    タイムヘッダ幅+
    ダイアログ幅+
    stillレイヤ数*stillセル幅+
    timingレイヤ数*timingセル幅+
    stageworkレイヤ数*geometryセル幅+
    sfxレイヤ数*sfxセル幅+
    cameraレイヤ数*cameraセル幅+
    コメント欄幅
    )×ページカラム数＋カラムセパレータ幅×(ページカラム数?1)
*/

    var PageCols=this.PageCols;
    var SheetLength=this.SheetLength

    if(pageNumber==(Pages-1)){hasEndMarker=true;};
}

/*
BODY_ += 'onMouseDown =" return xUI.Mouse(event)"';
BODY_ += 'onMouseUp =" return xUI.Mouse(event)"';
BODY_ += 'onMouseOver =" xUI.Mouse(event)"';
*/
//alert(tableFixWidth+":"+tableBodyWidth);
//============= テーブル出力開始
BODY_ +='<table class=sheet cellspacing=0 ';
    if(pageNumber<=-2){
//第2,3象限用
BODY_ +='style="width:'+(tableFixWidth)+this.sheetLooks.CellWidthUnit+'"';
    }else{
//第1,4象限用
BODY_ +='style="width:'+tableBodyWidth+this.sheetLooks.CellWidthUnit+'"';
    }
    if(pageNumber<0){
BODY_ +='id="qdr'+(-1*pageNumber)+'" ';
    }else{
BODY_ +='id="qdr4" ';
//BODY_ +='id="qdr4_'+String(pageNumber)+'" ';
    }
BODY_ +=' >';
BODY_ +='<tbody>';
    if(true){
//========================================シートヘッダ
/*    テーブルルックを決め込む為の幅配置及び将来的にリンクペアレントを表示する領域(かも)
    第一行目
    UI上は、イベント受信を担当するのは最も上に表示されるエレメント
*/
BODY_ +='<tr class=tlhead ';
    if(this.viewMode=="Compact") BODY_ +='id=tlhead';
    if(pageNumber==0) BODY_ +='Parent';
BODY_ +='>';
//*==============================ページカラムループ処理
    for (cols=0;cols < PageCols;cols ++){
/*********** timeguide ********************/
BODY_ +='<th class="tcSpan tlhead"';
BODY_ +=' ></th>';

if((this.viewMode!="Compact")&&(pageNumber<=-2)){break;
//第二第三象限でかつコンパクトモードでない場合はここでブレイクしてヘッダーを縮小
}
/*********** Action Ref *************/
//=====================参照エリア
        for (r=0;r<this.referenceLabels.length;r++){
BODY_ +='<th class="referenceSpan tlhead ref" ';
BODY_ +='> </th>';
        };

/*********** Dialog Area*************/
//予約タイムラインの為一回分 別に出力
//BODY_ +='<th class=dialogSpan ';
//BODY_ +='> </th>';
/************左見出し固定時の処理*****************/
    if(pageNumber<=-2){
/*********** Edit Area *************/
//=====================編集セル本体の固定部分のみをタイムライン種別に合わせて配置(ラベル部分)
if(true){
        for (var r=0;r<(xUI.dialogSpan);r++){
    BODY_ +='<th class="dialogSpan tlhead"  id="TL'+(r+1)+'" ></th>';
        }
}else{
        for (var r=0;r<this.XPS.xpsTracks.length;r++){
//BODY_ +='<th class="editSpan" ';//editSpanは後で消しておくこと
 switch (this.XPS.xpsTracks[r].option)
 {
case "dialog":
    BODY_ +='<th class="dialogSpan tlhead" ';
    BODY_ +=' id="TL'+ r +'"';
    BODY_ +=' >';
    BODY_ +='</th>';
break;
case "still":
case "sfx":
case "camera":
case "timing":
default:
 }
        };
//BODY_ +='</tr><tr>';//改段
}

    }else{
/*第一、第四象限用処理*/
/*********** Edit Area *************/
//=====================編集セル本体をタイムライン種別に合わせて配置(ラベル部分)
        var noteStep = 1;  
        for (r=0;r<this.XPS.xpsTracks.length-1;r++){
            //末尾レコードはコメント固定なので判定せず（レコード長から1減算）
 switch (this.XPS.xpsTracks[r].option)
 {
case "sound" :
case "dialog":  BODY_ +='<th class="dialogSpan tlhead" ';break;
case "still" :  BODY_ +='<th class="stillSpan tlhead" ';break;
case "sfx"   :  BODY_ +='<th class="sfxSpan tlhead" ';break;
case "geometry":BODY_ +='<th class="geometrySpan tlhead" ';break;
case "camera":  BODY_ +='<th class="cameraSpan tlhead" ';break;
case "timing":
default:        BODY_ +='<th class="timingSpan tlhead" ';
 }
BODY_ +=' id="TL'+(r+1)+'"';
BODY_ +=' > ';
    if(r > 0) noteStep = (this.XPS.xpsTracks[r-1].tag)? (noteStep % 5)+1 : 1 ;
if(this.XPS.xpsTracks[r].tag){
    var  trackId = ['p',pageNumber,'c',cols,'t',r].join('');
    BODY_ += '<span id="';
    BODY_ += trackId;
    BODY_ += '" class="noteOverlay'
    BODY_ += ' note'+noteStep;
    BODY_ += '"><span id="'
    BODY_ += trackId;
    BODY_ += '_L" class=overlayLabel>'+this.XPS.xpsTracks[r].tag+'</span></span>'
}
BODY_ +='</th>';
        };
/*********** FrameNote Area *************/
BODY_ +='<th class="framenoteSpan tlhead"';
BODY_ +=' ></th>';
//カラムセパレータの空セル挿入
if (cols < PageCols-1) BODY_ +=('<td class="colSep tlhead" ></td>');
    };

    }
/************************************************/


BODY_ +='</tr>';//改段
    }
//第二行目========================================シート記入分ヘッダ
    
BODY_ +='<tr>';
    for (cols=0;cols < PageCols;cols ++){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class="tclabel annotationText" ';
BODY_ +='style="height:'+headlineHeight+'px" ';
//BODY_ +='style=" width:'+this.sheetLooks.TimeGuideWidth+CellWidthUnit+'"';
BODY_ +=' ><span class=timeguide> TIME </span></th>';
/*********** Action Ref *************/
BODY_ +='<th colspan="'+this.referenceLabels.length+ '" id="rnArea" class="rnArea annotationText ref" ondblclick=sync("referenceLabel") title=""';
//  ここは参照シートの識別名に置き換え 
BODY_ +=' >Reference</th>';
/*********** Dialog Area*************/
BODY_ +='<th rowspan=2 class="dialoglabel annotationText" ';
//ダイアログの幅は可変
if(xUI.dialogSpan>1){
BODY_ +='colspan ="'+xUI.dialogSpan+'" ';
}
/***
BODY_ +=' onMouseDown=\'xUI.changeColumn(0 ,'+ (2 * pageNumber+cols) +');\'';
***/
BODY_ +='>台<BR>詞</th>';
    if(pageNumber>=-1){
/*********** Edit Area 1 (timing) *************/
BODY_ +='<th colspan='+xUI.timingSpan+' id=editArea class="editArea annotationText" ondblclick=sync("editLabel") title=""';
//ここは編集中のステージ名に置き換え予定
BODY_ +='>Animation</th>';

/*********** Edit Area 2 (camera+sfx) *************/
if(xUI.cameraSpan>0){
BODY_ +='<th colspan='+xUI.cameraSpan+' id=camArea class="camArea annotationText" ';
//
BODY_ +='>camera</th>';
}
/*********** FrameNote Area *************/
BODY_ +='<th rowspan=2 class="framenotelabel annotationText"';
/***
BODY_ +=' onMouseDown=\'xUI.changeColumn("memo" ,'+ (2 * pageNumber+cols) +');\'';
***/
BODY_ +=' >MEMO.</th>';
//カラムセパレータの空セル挿入
if (cols < PageCols-1) BODY_ +=('<td rowspan='+(2+SheetRows)+' id=colSep class=colSep ></td>');
    };

    }
BODY_ +='</tr>';//改段

//ヘッダ2行目
BODY_ +='<tr>';//改段

    for (cols=0;cols < PageCols;cols ++){

//=====================参照エリア
        for (r=0;r<this.referenceLabels.length;r++){
BODY_ +='<th id="rL';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();

BODY_ +='" class="layerlabelR annotationText ref"';
BODY_ +=' >';

var currentRefLabel=this.referenceXPS.xpsTracks[this.referenceLabels[r]].id;
var lbString=(currentRefLabel.length<3)?
    currentRefLabel:
    '<a onclick="return false;" title="'+currentRefLabel+'">'+currentRefLabel.slice(0,2)+'</a>';

 if (currentRefLabel.match(/^\s*$/)){
    BODY_ +='<span style="color:'+this.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +=lbString;
 };

        };
    if(pageNumber>=-1){
//=====================編集セル本体(ラベル部分)

        for (var r=(xUI.dialogSpan);r<(this.XPS.xpsTracks.length-1);r++){
    if(this.XPS.xpsTracks[r].option=="comment"){break;}
    var currentLabel=this.XPS.xpsTracks[r].id;
    var currentElementId= 'L' + String(r) + '_' + pageNumber + '_' + String(cols);

BODY_ +='<th id="' + currentElementId ;
 switch (this.XPS.xpsTracks[r].option){
case "still" :BODY_ +='" class="stilllabel annotationText" ' ;break;
case "stagework":
case "geometry":BODY_ +='" class="geometrylabel annotationText" ';break;
case "effect":
case "sfx"   :BODY_ +='" class="sfxlabel annotationText" '   ;break;
case "camerawork":
case "camera":BODY_ +='" class="cameralabel annotationText" ';break;
case "replacement":
case "timing":
case "dialog":
case "sound":
default:BODY_ +='" class="layerlabel annotationText" ';
}

BODY_ +=' >';
if(this.XPS.xpsTracks[r].option=="still"){
 if (currentLabel.match(/^\s*$/)){
    BODY_ +='<span id ="'+currentElementId+'" style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +='<span id ="'+currentElementId+'" title="'+currentLabel+'">▼</span>';
 };
}else{
 if (this.XPS.xpsTracks[r].id.match(/^\s*$/)){
    BODY_ +='<span id ="'+currentElementId+'" style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    
    BODY_ +=(currentLabel.length<5)?
        currentLabel:
        '<span id ="'+currentElementId+'" title="'+currentLabel+'">'+currentLabel.slice(0,4)+'</span>';
 };
}
BODY_ +='</th>';
        };

    };
    };
BODY_ +='</tr>';

//以下  シートデータ本体  pageNumberが-3以下の場合は固定(冒頭ダイアログ)部分まで出力
if((pageNumber>=0)||(pageNumber<-2)){
/*=========================シートデータエリア==========================*/
//alert("SheetRows : "+ SheetRows +"\nthis.PageCols : "+this.PageCols);
var currentPageNumber=(pageNumber<-2)?0:pageNumber;
for (n=0;n<SheetRows;n++){
BODY_ += '<tr>';
        for (cols=0;cols<PageCols;cols ++){
//フレーム毎のプロパティを設定
    var myFrameCount=cols*SheetRows+n;
    var currentSec=(currentPageNumber*SheetLength)+Math.floor(myFrameCount/Math.ceil(this.XPS.framerate));//処理中の秒
    var restFrm= myFrameCount % Math.ceil(this.XPS.framerate);//処理中の  ライン/秒
//    var mySpt=(this.XPS.rate.match(/df/i))?";":":";
    var mySpt=(this.XPS.framerate.opt=='smpte')?";":":";

    var myTC=[Math.floor(currentSec/3600)%24,Math.floor(currentSec/60),currentSec%60].join(":")+mySpt+restFrm
    var current_frame= nas.FCT2Frm(myTC,this.XPS.framerate);//FCTからフレームインデックスを導くドロップ時はnull

//alert([myFrameCount,currentSec,restFrm].join("\n"));break;
// var current_frame=(this.PageLength*currentPageNumber)+cols*SheetRows+n;//カレントフレームの計算がTCベースになる必要あり
//現在処理中のフレームは有効か否かをフラグ  フレームがドロップまたは継続時間外の場合は無効フレーム
    var isBlankLine =((current_frame != null)&&(current_frame < this.XPS.duration()))? false:true;
// alert(isBlankLine+" : "+current_frame)

//セパレータ(境界線)設定
if(restFrm==(Math.ceil(this.XPS.framerate)-1)){
//秒セパレータ
    var tH_border= 'ltSep';
    var dL_border= 'dtSep';
    var sC_border= 'ntSep';
    var mO_border= 'ntSep';
}else{
    if (n%this.sheetSubSeparator==(this.sheetSubSeparator-1)){
//    サブセパレータ
        var tH_border= 'lsSep';
        var dL_border= 'dsSep';
        var sC_border= 'nsSep';
        var mO_border= 'nsSep';
    }else{
//    ノーマル(通常)指定なし
        var tH_border= 'lnSep';
        var dL_border= 'dnSep';
        var sC_border= 'nnSep';
        var mO_border= 'nnSep';
    };
};
//背景色設定
/*    判定基準を継続時間内外のみでなくドロップフレームに拡張
*/
//    if ((current_frame != null)&&(current_frame < this.XPS.duration())){}
    if (! isBlankLine){
//有効フレーム
        var bgStyle='';
        var bgProp='';
        var cellClassExtention=''
    }else{
//無効フレーム
        var bgStyle='background-color:'+this.sheetblankColor+';';
        var bgProp='bgcolor='+this.sheetblankColor+' ';
        var cellClassExtention='_Blank'
    };

//タイムヘッダ
    var tcStyle='<td nowrap ';

BODY_ +=tcStyle ;
BODY_ +='class="Sep ';
BODY_ +=tH_border+cellClassExtention;
BODY_ +='"';
BODY_ +=' id=tcg_';
BODY_ +=String(current_frame);
BODY_ +=' >';
    if (restFrm==0) {BODY_ += "<span class=timeguide>[ "+ currentSec.toString()+"' ]</span>"};
    if  (((n+1)%2 ==0)&&(! isBlankLine))
    {BODY_ += (current_frame+1).toString();}else{BODY_+='<br>';};
//    {BODY_ += ((n+1)+cols*SheetRows).toString();}else{BODY_+='<br>';};
BODY_ +='</td>';

//参照シートセル
    var refLabelID = 0; //for (var refLabelID=0;refLabelID< this.referenceLabels.length;refLabelID++)
    for (var r=0;r< this.referenceXPS.xpsTracks.length;r++){
        if(this.referenceLabels[refLabelID] != r){continue;}

//参照ラベル抽出と同アルゴリズムで抽出を行うかまたはキャッシュをとる
BODY_ +='<td ';
    if (! isBlankLine){}
    if (current_frame<this.referenceXPS.xpsTracks[r].length){
BODY_ += 'id=\"r_';
BODY_ += r.toString()+'_'+ current_frame.toString();
// BODY_ +=refLabelID.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
BODY_ +='class="';
BODY_ +=sC_border+cellClassExtention + ' ref';
BODY_ +='"';
    }else{
BODY_ +='class="';
BODY_ +=sC_border+'_Blank';
BODY_ +='"';
    };
BODY_ +='>';
        if (current_frame>=this.referenceXPS.xpsTracks[r].length){
    BODY_+="<br>";
        }else{
    this.Select=[r,current_frame];
    if (this.referenceXPS.xpsTracks[r][current_frame]!=""){
        BODY_ += this.trTd(['r',r,current_frame]);
//        BODY_ += this.trTd(this.referenceXPS.xpsTracks[r][current_frame]);
//        BODY_ += this.trTd(document.getElementById(["r",[r],[current_frame]].join("_")));
    }else{
        BODY_+='<br>';
    };
        };
BODY_ +='</td>';
        refLabelID ++;
    };
/*
    ダイアログタイムラインとその他のタイムラインの混在を許容することになるので
    位置による決め打ちでなく、タイムライン種別の判定を行う。
    固定ヘッダ出力の場合は、ループ上限を冒頭ダイアログまでに限定
*/
    var outputColumus=(pageNumber<-2)?xUI.dialogSpan-1:this.XPS.xpsTracks.length-2;
for (var r=0;r<=outputColumus;r++){
    if((r==0)||(this.XPS.xpsTracks[r].option=="dialog")){
//ダイアログセル
        BODY_ +='<td ';
//    if ((current_frame != null)&&(current_frame < this.XPS.duration())){}
        if (! isBlankLine){
            BODY_ += 'id="';
            BODY_ +=r.toString()+'_'+ current_frame.toString();
            BODY_ +='" ';
//BODY_ +='onclick="return xUI.Mouse(event)" ';
        };
            BODY_ +='class="';
            BODY_ += dL_border+cellClassExtention;
            BODY_ +=' soundbody';
            BODY_ +='"';
            BODY_ +='>';
//        if((current_frame==null)||(current_frame>=this.XPS.duration()))
        if (isBlankLine){
            BODY_+="<br>";
        }else{
            this.Select=[0,current_frame];


            if (this.XPS.xpsTracks[r][current_frame]!=""){
                BODY_+=this.trTd([r,current_frame]);
//        BODY_+=this.trTd(this.XPS.xpsTracks[r][current_frame]);
            }else{
        BODY_ += '<BR>';
            }
        };
        BODY_ +='</td>';
    }else{
//シートセル
//極力インラインスタイルシートを書かないように心がける 05'2/25
    BODY_ +='<td ';
//    if ((current_frame != null)&&(current_frame < this.XPS.duration())){}
    if (! isBlankLine){
        BODY_ += 'id="';
        BODY_ +=r.toString()+'_'+ current_frame.toString();
        BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
    };
    BODY_ +='class="';
    BODY_ +=sC_border+cellClassExtention;
    BODY_ +='"';
    BODY_ +='>';
//        if((current_frame==null)||(current_frame>=this.XPS.duration())){}
    if (isBlankLine){
        BODY_+="<br>";
    }else{
        this.Select=[r,current_frame];
        if ( this.XPS.xpsTracks[r][current_frame]!=""){
            BODY_+=this.trTd([r,current_frame]);
//        BODY_ += this.trTd(this.XPS.xpsTracks[r][current_frame]);
        }else{
            BODY_+='<br>';
        };
    };
    BODY_ +='</td>';

    };
}

/*    メモエリア
 * 固定ヘッダー出力時はスキップ
 *
 */
 if(pageNumber>=0){
BODY_ +='<td ';
//    if (current_frame < this.XPS.duration()){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ += (this.XPS.xpsTracks.length-1).toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
    };
BODY_ +='class="';
BODY_ +=mO_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
//        if(current_frame>=this.XPS.duration()){}
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[this.XPS.xpsTracks.length-1,current_frame];
    if ( this.XPS.xpsTracks[this.XPS.xpsTracks.length-1][current_frame]!=""){
        BODY_ += this.trTd([this.XPS.xpsTracks.length-1,current_frame]);
//        BODY_ += this.trTd(this.XPS.xpsTracks[this.XPS.xpsTracks.length-1][current_frame]);
    }else{
        BODY_+='<br>';
    };
        };
BODY_+='</td>';
 }
        };
BODY_ +='</tr>';

};
    };

BODY_ +='</tbody></table>';
BODY_ +='\n';
/*タイムシート記述終了マーカーを配置*/
if((hasEndMarker)&&(pageNumber==currentPageNumber)){    
BODY_ +='<div id=endMarker class=endMarker>';
BODY_ += JSON.stringify([xUI.XPS.xpsTracks.length, xUI.XPS.xpsTracks.duration]);
BODY_ +='</div>';
//BODY_ +='<div id=endMarker-print class=endMarker-print>::print-end::';
//BODY_ +='<br></div>';
 };// */
BODY_ +='';
    this.Select=restoreValue;
    return BODY_;
};