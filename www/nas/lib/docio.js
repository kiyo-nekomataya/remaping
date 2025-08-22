/*
    docio.js
    システム全体に係るdocumentsio関連ソースを分離
    nas_common.js
    nas_common_value.js
    mapio.js
    xpsio.js
    以上のライブラリを必要とする
    remaping.jsの基礎ライブラリ
このソースに先行してpman.jsを実行すること 

*/
'use strict';
/*
    読み込み前にクッキー関連の関数を初期化
-- //Cookie関連メソッド -- */
/*
    汎用的なクッキー関連メソッド
    アプリケーション専用から汎用コードとしてdoc.ioへ移植
    Ciikie操作用各メソッドを設定してエイリアスを設定する
    クッキーテーブルは設けず アプリケーションごとのconfigをライブラリ共用部とアプリケーション専用部分に分離して配置する
    アプリ専用部分は共有設定を上書きすることが可能
    否HTML環境でファイルシステムアクセスが可能な場合はこのクラスで読み書きを行う
*/
var appConfig = {};//クッキー操作クラス
/**
 *  @params  {String}   tgt
        build target name  common|app|<applicationName>
 *  @returns {Array}
 *    クッキー用のデータ配列を作成して返す
 *    cookieTableを参照してアプリごとに異なる文字列を生成する
 *  共用部分とアプリケーション固有部分を
 */
appConfig.buildCk = function buildCk(){
    let myCookie = [];
///////    クッキー配列用のデータを取得。
//    クッキーID:0をシートカラー及び印刷用紙サイズに設定
//    [0] applicationAttributes
    if (config.useCookie.SheetProp){
        config.SheetBaseColor = (xUI.sheetLooks)? xUI.sheetLooks.SheetBaseColor:config.SheetLooks.SheetBaseColor;
        config.ApplicationIdf = serviceAgent.applicationIdf;
        var appAttributes = [config.SheetBaseColor,config.ApplicationIdf];
    }else{
        var appAttributes = [false,false];
    };
    myCookie[0]=appAttributes;
/*
    クッキー及び個人設定データはPrefライブラリに移行予定
    データ保存方式はライブラリで吸収する

    個人領域設定データ
    ローカルストレージ
    クッキー
    
    共用部分とアプリケーション別の２リジョンで収容
    
    nas.Pref.ldPref
    nas.Pref.reitePref
    nas.Pref.buidPref
    
*/
//[1] XPSAttrib 音響カラムを追加予定(20190310)
    if((xUI.app == 'xpsedit')||(xUI.app == 'remaping')){
        config.myTitle           = (config.useCookie.XPSAttrib)? xUI.XPS.title:null;
        config.mySubTitle        = (config.useCookie.XPSAttrib)? xUI.XPS.subtitle:null;
        config.myOpus            = (config.useCookie.XPSAttrib)? xUI.XPS.opus:null;
        config.myFrameRate       = (config.useCookie.XPSAttrib)? xUI.XPS.framerate.toString():null;
        config.Sheet             = (config.useCookie.XPSAttrib)? nas.Frm2FCT(xUI.XPS.xpsTracks[0].length,3,0,xUI.XPS.framerate):null;//
        config.DialogColumns     = (config.useCookie.XPSAttrib)? xUI.dialogCount:null;
        config.SoundColumns      = (config.useCookie.XPSAttrib)? xUI.soundCount:null;
        config.SheetLayers       = (config.useCookie.XPSAttrib)? xUI.timingCount:null;
        config.CameraworkColumns = (config.useCookie.XPSAttrib)? xUI.cameraCount:null;
        config.StageworkColumns  = (config.useCookie.XPSAttrib)? xUI.stageworkCount:null;
        config.SfxColumns        = (config.useCookie.XPSAttrib)? xUI.sfxCount:null;
    }else if((xUI.app == 'pman')||(xUI.app == 'pman_reName')){
        let targetObj = xUI.documents[0].content.xmap;
        config.myTitle           = (config.useCookie.XPSAttrib)? targetObj.title:null;
        config.mySubTitle        = (config.useCookie.XPSAttrib)? targetObj.subtitle:null;
        config.myOpus            = (config.useCookie.XPSAttrib)? targetObj.opus:null;
        config.myFrameRate       = (config.useCookie.XPSAttrib)? nas.FRATE.toString():null;
        config.Sheet             = (config.useCookie.XPSAttrib)? "6+0":null;//
        config.DialogColumns     = (config.useCookie.XPSAttrib)? xUI.dialogCount:null;
        config.SoundColumns      = (config.useCookie.XPSAttrib)? xUI.soundCount:null;
        config.SheetLayers       = (config.useCookie.XPSAttrib)? xUI.timingCount:null;
        config.CameraworkColumns = (config.useCookie.XPSAttrib)? xUI.cameraCount:null;
        config.StageworkColumns  = (config.useCookie.XPSAttrib)? xUI.stageworkCount:null;
        config.SfxColumns        = (config.useCookie.XPSAttrib)? xUI.sfxCount:null;
    
    };
    myCookie[1]=[
        config.myTitle,
        config.mySubTitle,
        config.myOpus,
        config.myFrameRate,
        config.Sheet,
        config.DialogColumns,
        config.SoundColumns,
        config.SheetLayers,
        config.CameraworkColumns,
        config.StageworkColumns,
        config.SfxColumns
    ];

//[2] UserName|UserAccount
    if(config.useCookie.UserName)    {
        config.myName  = xUI.currentUser.toString();
        config.myNames = xUI.recentUsers.convertStringArray();
    }else{
        config.myName  = false;
        config.myNames = [];
    };
    myCookie[2]=[config.myName,config.myNames];

//[3] KeyOptions
    config.BlankMethod      = (config.useCookie.KeyOptions)? xUI.blmtd:null;
    config.BlankPosition    = (config.useCookie.KeyOptions)? xUI.blpos:null;
    config.AEVersion        = (config.useCookie.KeyOptions)? xUI.aeVersion:null;
    config.KEYMethod        = (config.useCookie.KeyOptions)? xUI.keyMethod:null;
    config.TimeShift        = (config.useCookie.KeyOptions)? xUI.timeShift:null;
    config.FootageFramerate = (config.useCookie.KeyOptions)? xUI.fpsF:null;
    config.defaultSIZE      = (config.useCookie.KeyOptions)? [xUI.dfX,xUI.dfY,xUI.dfA].toString():"auto";

    myCookie[3]=[
        config.BlankMethod,
        config.BlankPosition,
        config.AEVersion,
        config.KEYMethod,
        config.TimeShift,
        config.FootageFramerate,
        config.defaultSIZE
    ];

//[4] SheetOptions
        config.SpinValue     = (config.useCookie.SheetOptions)? xUI.spinValue:null;
        config.SpinSelect    = (config.useCookie.SheetOptions)? xUI.spinSelect:null;
        config.SheetLength   = (config.useCookie.SheetOptions)? xUI.SheetLength:null;
        config.SheetPageCols = (config.useCookie.SheetOptions)? xUI.PageCols:null;
        config.FootMark      = (config.useCookie.SheetOptions)? xUI.footMark:null;
    
    myCookie[4]=[
        config.SpinValue,
        config.SpinSelect,
        config.SheetLength,
        config.SheetPageCols,
        config.FootMark
    ];

//[5] CounterType
    config.Counter0    =(config.useCookie.CounterType)? xUI.fct0:null;
    config.Counter1    =(config.useCookie.CounterType)? xUI.fct1:null;

    myCookie[5]=[
        config.Counter0,
        config.Counter1
    ];

//[6] UIOptions
    config.SLoop      = (config.useCookie.UIOptions)? xUI.sLoop:null;
    config.CLoop      = (config.useCookie.UIOptions)? xUI.cLoop:null;
    config.AutoScroll = (config.useCookie.UIOptions)? xUI.autoScroll:null;
    config.TabSpin    = (config.useCookie.UIOptions)? xUI.tabSpin:null;
    config.ViewMode   = (config.useCookie.UIOptions)? xUI.viewMode:null;
    myCookie[6]=[
        config.SLoop,
        config.CLoop,
        config.AutoScroll,
        config.TabSpin,
        config.ViewMode
    ];

//[7] UIView
//Cookieの値は bainari文字列｜またはキーワード default|minimum|full|restriction
    if(config.useCookie.UIView){
    var toolView = xUI.checkToolView(true).join("");
    var toolViewIbCs = xUI.ibCP.activePalette;//toolViewIbCs;
console.log(config.ToolView); // binaryString | keyword
console.log(xUI.toolView);
console.log(toolView);
//    alert(ToolView);//  beforunloadで呼び出すのでその際のアラート、コンソールは読めない



};//記録チェックがない場合は元のデータを変更しない
myCookie[7]=[toolView,toolViewIbCs];
return myCookie;
}
/**
    クッキーを書き込み
 */
appConfig.writeCk = function writeCk(myCookie){
    if (!navigator.cookieEnabled){
        if (config.dbg){alert("クッキーが有効でないカンジ?")};
        return false;
    };
    if(typeof myCookie  == "undefined") myCookie = appConfig.buildCk();
    var myCookieExpiers = "";
    if(config.useCookie.expiers) {
        var Xnow = new Date();
        var completeYear  = Xnow.getFullYear();//    年
        var completeMonth = Xnow.getMonth()+1;//    月
        var completeDate  = Xnow.getDate();//    日
        var completeHour  = Xnow.getHours();//    時刻
        var completeMin   = Xnow.getMinutes();//    分
        var completeSec   = Xnow.getSeconds();//    秒
        var eXpSpan = (isNaN(config.useCookie.expier))? 1:config.useCookie.expier;
//クッキーの期限 デフォルト期限 1日
        var expDate=new Date(
            completeYear, completeMonth-1, completeDate + eXpSpan,
            completeHour , completeMin, completeSec 
        );//    満了期日をセットした日付オブジェクトを作成
        myCookieExpiers=';expires='+ expDate.toGMTString();
    };
    var myCookieSource=appConfig.tosRcs(myCookie);
    if(appHost.platform == 'Electron'){
        electronIpc.setCookie(
            myCookieSource,
            'rEmaping',
            'https://www.u-at.net/uaToolbox-beta/',
            myCookieExpiers
        );
    }else{
        document.cookie = 'rEmaping=' +escape(myCookieSource) + myCookieExpiers;//書き込む
    };
    return myCookie;
}
/**
 *    params {string} ckString
 *        cookie string
 *    params {string} ckName
 *        value name
 *    params {Boolean} flag
 *        エスケープフラグ
 *        文字列をname=value;のセットに分解して与えられたckNameの値を返す。
 *        フラグが立っていればエスケープ展開する。
 */
appConfig.breakValue = function breakValue(ckString,ckName,flag) {
    ckString += ';' ;
    var ckStringS = ckString.split(';');
    for(var n=0 ; n < ckStringS.length ; n ++ ){
        if(ckName == ckStringS[n].split('=')[0]){
            if (flag) {
                return ckStringS[n].split('=')[1];
            }else{
                return unescape(ckStringS[n].split('=')[1]);
            };
        };
    };
    return null;//判定できなかった場合はnullを返す。
}
/**        クッキー文字列を配列に戻し、グローバル変数に展開する
    グローバル変数は、設定ファイルの値を持っているので関数の呼び出し後に必用な参照を行う
    関数内では、ケース毎特定の処理は行わない。
*/
appConfig.ldCk = function ldCk(ckStrings){
if (!navigator.cookieEnabled){return false;}

    if(appHost.platform == 'Electron'){
        var cookies = electronIpc.getCookie("https://www.u-at.net/uaToolbox-beta/","rEmaping");
        if(cookies.length == 0) return false;
        var rEmaping = JSON.parse(cookies[0].value);
    }else if(document.cookie.indexOf("rEmaping") >= 0){
        var rEmaping = JSON.parse(appConfig.breakValue(document.cookie,"rEmaping"));
    }else{
        return false;
    };
console.log(rEmaping);
//    [0] SheetPropsApplicationAttributes
    if (config.useCookie.SheetProp){
        if(rEmaping[0][0]) config.SheetBaseColor = unescape(rEmaping[0][0]);
        if(rEmaping[0][1]) config.ApplicationIdf = unescape(rEmaping[0][1]);
    }

//    [1] XPSAttrib
    if (config.useCookie.XPSAttrib){
        if(rEmaping[1][0])  config.myTitle           = unescape(rEmaping[1][0]);
        if(rEmaping[1][1])  config.mySubTitle        = unescape(rEmaping[1][1]);
        if(rEmaping[1][2])  config.myOpus            = unescape(rEmaping[1][2]);
        if(rEmaping[1][3])  config.myFrameRate       = unescape(rEmaping[1][3]);
        if(rEmaping[1][4])  config.Sheet             = unescape(rEmaping[1][4]);
        if(rEmaping[1][5])  config.DialogColumns     = unescape(rEmaping[1][5]);
        if(rEmaping[1][6])  config.SoundColumns      = unescape(rEmaping[1][6]);
        if(rEmaping[1][7])  config.SheetLayers       = unescape(rEmaping[1][7]);
        if(rEmaping[1][8])  config.CameraworkColumns = unescape(rEmaping[1][8]);
        if(rEmaping[1][9])  config.StageworkColumns  = unescape(rEmaping[1][9]);
        if(rEmaping[1][10]) config.SfxColumns        = unescape(rEmaping[1][10]);
    };

//    [2] UserName
    if(config.useCookie.UserName){
        if(rEmaping[2]) {
            config.myName  = unescape(rEmaping[2][0]);
            config.myNames = [];
            for(var ix=0;ix<rEmaping[2][1].length;ix++){
                config.myNames.push(unescape(rEmaping[2][1][ix]));
            }
        }else{
            config.myName  = "";
            config.myNames = [myName];
        };
    }
    if(! nas.CURRENTUSER) nas.CURRENTUSER = new nas.UserInfo(config.myName);

//    [3] KeyOptions
    if(config.useCookie.KeyOptions){
        if(rEmaping[3][0]) config.BlankMethod      = unescape(rEmaping[3][0]);
        if(rEmaping[3][1]) config.BlankPosition    = unescape(rEmaping[3][1]);
        if(rEmaping[3][2]) config.AEVersion        = unescape(rEmaping[3][2]);
        if(rEmaping[3][3]) config.KEYMethod        = unescape(rEmaping[3][3]);
        if(rEmaping[3][4]) config.TimeShift        = (rEmaping[3][4]=="true")? true:false;
        if(rEmaping[3][5]) config.FootageFramerate = unescape(rEmaping[3][5]);
        if(rEmaping[3][6]) config.defaultSIZE      = unescape(rEmaping[3][6].toString());
    }

//    [4] SheetOptions
    if(config.useCookie.SheetOptions){
        if(rEmaping[4][0]) config.SpinValue        = parseInt(rEmaping[4][0],10);
        if(rEmaping[4][1]) config.SpinSelect       = (rEmaping[4][1]=="true")? true:false;
        if(rEmaping[4][2]) config.SheetLength      = parseInt(rEmaping[4][2],10);
        if(rEmaping[4][3]) config.SheetPageCols    = parseInt(rEmaping[4][3],10);
        if(rEmaping[4][4]) config.FootMark         = (rEmaping[4][4]=="true")? true:false;
    }

//    [5] CounterType
    if(config.useCookie.CounterType){
        if(rEmaping[5][0] instanceof Array) config.Counter0 = [parseInt(rEmaping[5][0][0],10),parseInt(rEmaping[5][0][1],10)];
        if(rEmaping[5][1] instanceof Array) config.Counter1 = [parseInt(rEmaping[5][1][0],10),parseInt(rEmaping[5][1][1],10)];
    }

//    [6] UIOptions
    if(config.useCookie.UIOptions){
        if(rEmaping[6][0]) config.SLoop      = (rEmaping[6][0]=="true")? true:false;
        if(rEmaping[6][1]) config.CLoop      = (rEmaping[6][1]=="true")? true:false;
        if(rEmaping[6][2]) config.AutoScroll = (rEmaping[6][2]=="true")? true:false;
        if(rEmaping[6][3]) config.TabSpin    = (rEmaping[6][3]=="true")? true:false;
        if(rEmaping[6][4]) config.ViewMode   = rEmaping[6][4];
    }
//    [7] UIView
    if(config.useCookie.UIView){
        if(rEmaping[7]){
            config.ToolView     = rEmaping[7][0];//バイナリ文字列またはキーワード
            config.ToolViewIbCs = rEmaping[7][1];
            if(xUI.ibCP) xUI.ibCP.activePalette = config.ToolViewIbCs;
        };
    };
}
/**
 *   クッキー削除
 */
 appConfig.dlCk = function dlCk(){
    const ckName = 'rEmaping';
    if(appHost.platform == 'Electron'){
        electronIpc.setCookie("",'rEmaping','','Thu,01-Jan-70 00:00:01 GMT');
    }else{
        document.cookie = ckName + '=;expires=Thu,01-Jan-70 00:00:01 GMT';
    };

    config.useCookie = false;
    var reloadNow = confirm(localize(nas.uiMsg.dmCookieRemoved));
    if(reloadNow) document.location.reload();
}
/**
 *   クッキーをリセット
 *   削除 > 読出
 */
appConfig.resetCk = function resetCk(){
    appConfig.dlCk();
    appConfig.writeCk();
    appConfig.ldCk();
//アプリケーションIdf設定（クッキーから 存在しなければローカルストレージから読み出す）
    if(! config.ApplicationIdf){
        config.ApplicationIdf = localStorage.getItem("info.nekomataya."+xUI.app+".applicationIdf");
    }
    serviceAgent.applicationIdf = config.ApplicationIdf;
}
/*
    @params {Object} obj
    クッキーで保存する配列オブジェクトをソース文字列化する
    マルチバイト文字列はescapeエンコード
 */
appConfig.tosRcs = function tosRcs(ary){
//    alert(ary);
    var sRcs="[";
    for(var idx=0; idx <ary.length;idx ++){
        var eLm=ary[idx];
        if(eLm instanceof Array){
            sRcs += appConfig.tosRcs(eLm);
        }else{
            sRcs += '"'+escape(eLm)+'"';
        }
        sRcs +=(idx < (ary.length-1))?",":"";
    }
    return sRcs+"]";
}
//alises
var buildCk    = appConfig.buildCk;
var writeCk    = appConfig.writeCk;
var breakValue = appConfig.breakValue;
var ldCk       = appConfig.ldCk;
var dlCk       = appConfig.dlCk;
var resetCk    = appConfig.resetCk;
var tosRcs     = appConfig.tosRcs;
/*--// Cookie関連メソッド//-- */

/*
    xUIその配下のプロパティは空オブジェクトで初期化
    各アプリケーションの始動時スタートアップ終了までのフラグとして参照される
 */
    var XPS          = {} ;//ダミーオブジェクト
    var XMAP         = {} ;//ダミーオブジェクト
    var documentFormat = {active:false};//ダミーオブジェクト

var xUI          = new Object();
    xUI.app      = null;//初期化フラグとして使用される
    xUI.Mouse    = function(){return};
    xUI.onScroll = function(){return};
    xUI.sync     = function(){return};
//    オブジェクト初期化用ダミーマップ
//    新規XPSオブジェクト作成・初期化
    xUI.activeNode   = null ;//表示・編集対象のノードオブジェクト .pmdbを持つ者はすべてノードたりえる
    xUI.XMAP         = XMAP ;//ダミーオブジェクトとしてXMAPバッファを初期化
    xUI.XPS          = XPS  ;//ダミーオブジェクトとしてXPSバッファを初期化
/*
    xUI.XMAP,xUI.XPS は編集バッファであり初期後の代入は禁止
    バッファ更新に関しては、parseXps,parsexMap等を利用して本体オブジェクトを編集すること
    アクティブドキュメント切り替えに際しては、ドキュメント側を更新すること
    グローバルの XPS XMAP は それぞれ xUI.XPS,xUI.XMAPのエイリアス
 */
    xUI.PMDBroot     ;//編集中のストレージルート(String ローカルパス) eg: /Users/Shared/workStorage
    xUI.PMDBcurrent  ;//編集中のPMDB(String ストレージルートから先のパス)eg: /Nekomataya/momotaro/mom#02

var sync = function(){return};//旧コード互換エイリアス
/*
    編集対象のPMDBは、nas.pmdbを直叩きする？
編集アドレスパスが発生する
:server:repository:title:episode
アドレス保持用配列を持たせる
targetMap = [
    servers:[
        server:{
            name:<name>,
            serviceurl:<url>,
            repositories:[
                {
                    name:<name>,
                    token:<token>,
                    titles:[
                        {
                            name:<name>,
                            token:<token>,
                            episodes:[
                            ]
                        }
                    ]
                }....
            ]
        }...
    ]
]
*/

//コード読込のタイミングで行う初期化

    var startupDocument   = ''           ;//初期ドキュメントXPSまたはXMAP
    var referenceDocument = ''           ;//初期参照ドキュメントXpst

/*
    debud output
    デバッグ関連のグローバルメソッド
    nas.htmlへ移動
 */
function dbgPut(aRg){
//    document.getElementById('msg_well').value += (aRg+"\n");
    if(console){if(config.dbg) console.log(aRg);}
}
function show_all_props(Obj){
    var Xalert="\n\tprops\n\n";
    for(var prop in Obj) Xalert+=(prop+"\t:\t"+Obj[prop]+"\n\n\n");
    dbgPut(Xalert);
}

function dbg_action(cmd){
    if(appHost.platform=="AIR"){
        document.getElementById('msg_well').value += (":"+aRg+"\n");
        return;
    }
//エラー発生時はキャプチャしてそちらを表示する
    var body="";
    try{body=eval(cmd);}catch(er){body=er;};
    document.getElementById('msg_well').value += (body+'\n');
//    if(console){if(config.dbg) console.log(body);}

}
/*
    アプリケーション開始時にjQuery-uiのtooltipを初期化するプロシジャ
    titleアトリビュートをツールチップ化する
    起動時に一回だけ実行 xUIの初期化前に実行されること
*/

var startupTooltip=function(){
    jQuery(function() {
        var myToolTips=["#"];
            for (var tid=0;tid<myToolTips.length;tid++){
                jQuery(myToolTips[tid]).tooltip( {
                    position: {
                        my: "center top",
                        at: "center bottom",
                        track:true,
                    }
                } );
            }
    });
}
//----------------------------------- UIコントロールオブジェクトを再作成、初期化
function new_xUI(){
/**  @class
 *<pre>     UIコントロールオブジェクト
 *  エディタ・アプリケーション本体のクラスオブジェク
 *</pre>
 */
    var xUI = {};

/*
 *    アプリが必要とする場合編集バッファを初期化
 *    グローバル変数をエイリアスに設定
 *  この参照はxUI.documensの初期化で上書きされる
 */
    xUI.XMAP = new nas.xMap();
    xUI.XPS  = new nas.Xps(
        config.SheetLooks,
        config.SheetLength,
        nas.FRATE,
        xUI.XMAP
    );
    if(xUI.XMAP !== XMAP) XMAP = xUI.XMAP;
    if(xUI.XPS  !== XPS)  XPS  = xUI.XPS ;
// 構成を明確にするためにこのコードは残置される
/*
 * xUI のエラーメッセージは旧Xpsオブジェクトから移転されたもの
 * XpsオブジェクトにUIエラーハンドリングは不用
 */
    xUI.errorCode    =    0;
    xUI.errorMsg=[
{en: "000:There is no error in final processing" ,ja: "000:最終処理にエラーはありません"},
{en: "001:Data length is 0. It may have failed to read" ,ja: "001:データ長が0です。読み込みに失敗したかもしれません"},
{en: "002:sorry. I do not seem to be able to read this data" ,ja: "002:どうもすみません。このデータは読めないみたいダ"},
{en: "003:There is no data to read" ,ja: "003:読み取るデータがないのです。"},
{en: "004:There is no data to be converted.\n Processing is interrupted." ,ja: "004:変換すべきデータがありません。\n処理を中断します。"},
{en: "005:MAP data is missing" ,ja: "005:MAPデータがありません"},
{en: "006:User cancellation" ,ja: "006:ユーザキャンセル"},
{en: "007:You can not specify outside the range" ,ja: "007:範囲外の指定はできません"},
{en: "008:You can not update confirmed data" ,ja: "008:確定済データを更新することはできません"},
{en: "009:Unexpected error" ,ja: "009:想定外エラー"}
];//    -localized
//------- UIオブジェクト初期化前の未定義参照エラーを回避するためのダミーメソッド
    xUI.flipContextMenu = function(evt){return true;};
    xUI.Mouse = function(evt){return true;};
    xUI.Touch = function(evt){return true;};
    xUI.canvasPaint = {
        active :false
    };
//ドキュメントズームパラメータ
    xUI.viewScale = 1;
//------- 初期化前のキー入力サブモードオブジェクト
    xUI.rapidMode = false;
//    初期化前にバックアップデータの処理が発生するので暫定的に初期化しておく
    xUI.backupStore    ="0123456789";    //作業バックアップ

    xUI.activeDocument   = null ;
    xUI.activeDocumentId = -1   ;
    xUI.delayRefreash    = true ;
//------------------------ 以下インターフェースカラープロパティ
//カラー・トラック幅等のルック決定要素はundefinedで初期化して  遅延解決に移行する
//xUI
    xUI.pmcuiBGColor            ; //マネジメントメニュー背景色
    xUI.pmBorderColor = {}      ; //マネジメントボタン境界色
    xUI.pmBorderColor.ACTIVE    ; //マネジメントボタン境界色
    xUI.pmBorderColor.DISABLED  ; //マネジメントボタン境界色
//Xmap
    xUI.baseColor               ; //背景色

//Xpst タイムシートルック
    xUI.sheetbaseColor          ; //タイムシート背景色**
    xUI.sheetblankColor         ; //編集不可領域の背景色
    xUI.footstampColor          ; //フットスタンプの色
    xUI.inputModeColor = {}     ; //入力モード色
    xUI.inputModeColor.NORMAL   ; //ノーマル色
    xUI.inputModeColor.EXTEND   ; //ラピッド入力基本色**
    xUI.inputModeColor.FLOAT    ; //ブロック移動基本色
    xUI.inputModeColor.SECTION  ; //範囲編集中の色
         
    xUI.selectedColor           ; //選択セルの背景色**
    xUI.selectionColor          ; //選択領域の背景色
    xUI.editingColor            ; //セル編集中のインジケータ
    xUI.selectingColor          ; //セル選択中のインジケータ

//テキストカラー
    xUI.sheetTextColor          ; //本文標準色**
    xUI.annnotationColor        ; //本文注釈色
    xUI.linkColor               ; //リンク色
    xUI.hoverColor              ; //リンクホーバー色
    xUI.activeColor             ; //リンクアクティブ色
//メニュー関連
    xUI.toolView              = (String(config.ToolView).match(/^[01]+$/))? Array.from(config.ToolView):[]; //ツールパネル表示状態配列
//    xUI.toolViewIbCs          = parseInt(config.ToolViewIbCs);
    xUI.closeWindowAtCheckout = true ; //
    xUI.summaryGroup                 ; //サマリ表示エリア状態変数
    xUI.contextMenu                  ;
    xUI.contextMenuRegion = {}       ;
    xUI.menuSelectors     = []       ;
    ;//
    ;//
//タイムライン・ラベル識別カラ－
    xUI.cameraColor;
    xUI.sfxColor;
    xUI.stillColor;//タイムライン全体に着色
//中間色自動計算
        xUI.inputModeColor.NORMALspin;
        xUI.inputModeColor.EXTENDspin;
        xUI.inputModeColor.FLOATspin;
        xUI.inputModeColor.SECTIONspin;
//スピン選択状態
        xUI.inputModeColor.NORMALspinselected;
        xUI.inputModeColor.EXTENDspinselected;
        xUI.inputModeColor.FLOATspinselected;
        xUI.inputModeColor.SECTIONspinselected;
//選択状態
        xUI.inputModeColor.NORMALselection;
        xUI.inputModeColor.EXTENDselection;
        xUI.inputModeColor.FLOATselection;
        xUI.inputModeColor.SECTIONselection;
//編集中
        xUI.inputModeColor.NORMALeddt;
        xUI.inputModeColor.EXTENDeddt;
        xUI.inputModeColor.FLOATeddt;
        xUI.inputModeColor.SECTIONeddt;
//フロートテキスト色
    xUI.floatTextColor;
//----------------------------------------------------------------------初期状態設定
    xUI.spinAreaColor;
    xUI.spinAreaColorSelect;
    xUI.sectionBodyColor;
// ---------------------- ここまでカラー設定
/**
 * メニュー設定関連メソッド
 *
 *
 *
 */
/*
//        コンテキストメニュートレーラー
<div id ="contextMenu" class ="context_menu optionPanelFloat">
</div>
//        アプリケーションメニューバートレーラー
<div id ="puldownMenu" class ="menu_bar_header">
</div>

コンテキストメニューはWEB｜エレクトロン版を同一管理するためにHTML側で実装する
コンテキストメニュー要素はエレメントIDをプレフィクス"cM"で開始してメニュー領域条件を後置する
    
    cM+<region-keyword>
    cM+on+<region-keyword>
    regionの分類
    onHeadline
    onTimelineTrackLabel
        onTimelineTrack
        onSelection
        onSection
    onTimelineTrackHeader
    onReferenece
    onRefereneceHeader
    outer

    onAssetBrowser
    

    管理モードによるメニュー切替はモード変更メソッド(xUI.setUImode)
    表示モードによるメニュー抑制はリセッターメソッド(xUI.resetSheet)が
    アプリケーションのホスト状態による遷移も同様に(xUI.resetSheet)で行う

    操作中の編集モードによるON/OFFはflipcMメソッドが担当する。

var xUI.contextMenu = new nas.HTML.ContextMenu(menuItems);
    xUI.contextMenu.init();

アプリケーションメニューバーは基本的にElectronのメニュー機能を使用する
サーバ上のアプリ（WEBh版）は、HTML上に展開する

 *
 */

//メニューIDのバリエーション
//    cM<メニューグルーピングクラス>
//    pM<メニューグルーピングクラス>
//クラスバリエーション
//    c-menu-<キーワード>-d
//    p-menu-<キーワード>-d
//    c-menu-<キーワード>
//    p-menu-<キーワード>
/*-- //importBox関連// --*/
/*
 *    xUI.importBox
 *    複数データ対応ドキュメントインポーター
 */
    xUI.importBox = {};//インポート情報トレーラー初期化
    xUI.importBox.overwriteProps = {};
    xUI.importBox.importTarget   = false;
    xUI.importBox.maxSize  = 1000000;
    xUI.importBox.maxCount = 10;
//    xUI.importBox.allowExtensions=new RegExp("\.(txt|csv|xps|ard|ardj|tsh|xdts|tdts)$",'i');
    xUI.importBox.allowExtensions    = new RegExp("\.(pmdb)|(stbd)|(xmap|map)|(txt|csv|xps|ard|ardj|tsh|xdts|tdts|sts)$",'i');
    xUI.importBox.allowImgExtensions = nas.Image.allowImgExtensions;
/**
 *  @function
 *    importBox リセット
 *   インポート操作の直前でリセットを行うこと
 */
xUI.importBox.reset = function(){
    this.targetContents    =[];
    this.selectedContents  =[];
    this.importTarget  = false;
    if((document.getElementById('loadTarget'))&&(document.getElementById('loadTarget').value=='ref')){
        this.importTarget=xUI.referenceXPS;
    } else {
        this.importTarget=xUI.XPS;
    }
    this.importCount= 0;
    this.callback = undefined;
//console.log('importBox reset')
}
    xUI.importBox.reset();
/**
    Xpst画像をデータから設定
    ファイルの画像を取得して既存のドキュメント画像を更新する
    画像形式確認は事前に済
    引数アイテムは
        １．編集可能ドキュメントのみ操作可能
            WEB系フォーマット限定（暫定
        ２．フォーカスに対応する画像がある場合のみ登録（複数画像操作保留）
        ３．従来モードの場合はリファレンス画像の登録？
    ケース分け操作・既存オブジェクトの画像を更新する｜新規オブジェクトを生成
    Referenceとして読むかマスターとするかは、状況次第では問題にならない
    画像タイムシートを操作可能なのは ページモードのみ
    画像登録時は、全てxUI.sheetPutへ送るものとする
    １操作につき複数画像アイテムが含まれていてもｘUI. sheetPut １回分
*/
xUI.importBox.setImage = function(files){
console.log(files);
//Xpst専用・新規ドキュメントかドキュメント画像の入れ替えかを判定(汎用でない)
    if(xUI.viewMode == 'Scroll') return false;
    var newData = new nas.Xps(xUI.XPS.sheetLooks);
    newData.parseXps(xUI.XPS.toString(false));
    var changeCount = 0;
    files.forEach(function(e){
console.log('set image :'+e.name);
console.log(e);
        if(
            (((xUI.uiMode == 'production')&&(xUI.sessionRetrace == 0))||
            (xUI.uiMode == 'floating'))&&
            (e.name.match(xUI.importBox.allowImgExtensions))
        ){
console.log('allowImgExtensions type match');
//画像登録操作可能
            var targetImage  = null;//更新対象画像を設定
            var targetPageId = Math.floor(xUI.Select[1] / xUI.PageLength);//配列IDで参照

            if(xUI.XPS.timesheetImages.members.length > targetPageId){
//既存画像の更新確定
                targetImage = newData.timesheetImages.members[targetPageId];
                targetImage.setImage(e);
                changeCount ++ ;
            }else{
//オブジェクト追加確定
                var idf = e.name;
//ファイル名にtype文字列を含む場合は埋められたタイプキーを削除
    if(idf.match(/(dope|xst|xps|xpst|xdts|tdts|sheet|st|ts)/i)) idf = idf.replace(/[_\-\s]?(dope|xst|xps|xpst|xdts|tdts|sheet|st|ts)[_\-\s]?[0-9]*/i,"");
console.log(idf);
                var itmInf = nas.Pm.parseIdentifier(nas.Pm.normalizeIdf(idf));
console.log('append New pageImage');
console.log(itmInf);
console.log(nas.Pm.normalizeIdf(e.name));
console.log(nas.Pm.stringifyIdf([
                itmInf.title,
                itmInf.opus,,
                itmInf.scene,
                itmInf.cut
            ]));
console.log(e,'page:'+(targetPageId+1),newData.timesheetImages);
                newData.timesheetImages.addMember(new nas.NoteImage(e,'page:'+(targetPageId+1),"297mm,420mm",newData.timesheetImages));
                changeCount ++ ;
console.log(targetPageId,xUI.activeDocument.undoBuffer.undoPt);
                if((targetPageId == 0)&&(xUI.activeDocument.undoBuffer.undoPt == 0)){
//読み込みページが冒頭ページで、かつ入力履歴のない場合のみInfの情報を反映
console.log('syncIdentifier : '+e.name);
                    newData.syncIdentifier(nas.Pm.stringifyIdf([
                        itmInf.title,
                        itmInf.opus,,
                        itmInf.scene,
                        itmInf.cut
                    ]));
                };
//                xUI.resetSheet();//画像ドキュメントを追加したので画面更新
            };
console.log(changeCount)
            if(changeCount > 0){
console.log(newData.toString(false));
                xUI.sheetPut(newData);
                if(xUI.XPS.timesheetImages.imageAppearance == 0)
                xUI.setAppearance(1,true);
            };
        }else{
console.log('unmatch nop');
            console.log(e);
        };
    });
}
/**
 *  @function
 *   変換ターゲットとなるFileオブジェクト配列を引数にして以下の関数を呼び出す
 *   全カット変換終了時のコールバック関数を与えることが可能
 *  @params {Array of File} targetFiles
 *  @params {Function} callback
 */
xUI.importBox.read = function (targetFiles,callback){
    if(appHost.platform == "AIR"){
//***AIR  用の分岐は  単ファイルのままで保留2018 0201
    // File APIを利用できるかをチェック
        if (window.File) {
      // 指定されたファイルを取得
            var input = targetFiles[0];
            fileBox.currentFile=new air.File(input.name);
            xUI.data_well.value =fileBox.readContent();
        }else{
            return false;
        }
    } else if(appHost.platform == "Electron"){
//*** Electron  用の分岐は  分岐のみで保留2019 0902
    // File APIを利用できるかをチェック
        if (window.File) {
      // 指定されたファイルを取得
            var input = targetFiles[0];
            fileBox.currentFile=(input.name);
            xUI.data_well.value =fileBox.readContent();
        }else{
            return false;
        };
    } else {
    // File APIを利用できるかをチェック
  if (window.File) {
    if(window.FileReader){
        xUI.importBox.reset();//ここで再初期化する
        xUI.importBox.callback=callback;
//処理に先行して拡張子とファイルサイズでフィルタして処理リストを作成する
//作業リストの進行度合いをチェックして終了判定をかける
        var targetQueue = [];
        var imageQueue  = [];
  for(var ix=0;ix<targetFiles.length;ix++){
    var check = targetFiles[ix];
//拡張子でふるい分け [0].含むポストフックス全体,[1]pmdb,[2],stbd[3],xmap,[4]xpst
    var ext = check.name.match(this.allowExtensions);
    if((ext[1])||(ext[2])||(ext[3])){
        targetQueue=[check]; this.importCount = 1;
        if(ext[0]=='.xmap'){
            this.importTarget = xUI.XMAP;
        }else {
            this.importTarget = false;
        }
        break;
//マッチ次第・第一引数に設定してブレイク
    } else if((ext[4]) && (check.size <= this.maxSize) && (ix < this.maxCount)){
        targetQueue.push(check); this.importCount ++;
    }else if(check.name.match(xUI.importBox.allowImgExtensions)){
//画像認識した場合キューに積む
        imageQueue.push(check);
    }else{
        console.log("skip file "+check.name );
    };
  };
  if(imageQueue.length){
//画像インポート
console.log(imageQueue);
    xUI.importBox.setImage(imageQueue);
  }else if(targetQueue.length){
//タイムシートドキュメントインポート
console.log(targetQueue);
// 指定されたファイルを取得してインポーターのプロパティとして記録
    for(var ix=0;ix<targetQueue.length;ix++){
        var input = targetQueue[ix];
//最初のファイルをターゲットに読込
        if(this.importTarget instanceof Xps){
//target Xpst
            var myEncode=(input.name.match(/\.(ard|csv|tsh|sts)$/))?"Shift-JIS":"UTF-8";
// ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
            var reader = new FileReader();
            reader.name=input.name;
// ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
            reader.addEventListener('load', function(e) {
                var output = reader.result;//
                xUI.data_well.value = reader.result;//最後に読み込んだ内容で上書きされるので注意
//エリアターゲット 
                var areaTarget = (document.getElementById('loadTarget').value == 'ref')? 0:undefined;
console.log(reader.result);
                var myXps = xUI.convertXps(
                    reader.result,
                    nas.File.divideExtension(reader.name)[1],
                    xUI.importBox.overwriteProps,
                    false,
                    areaTarget
                );// 指定オプション無しで一旦変換する
                if(!myXps){
                    alert(reader.name+' is not supported format');
                };
                if((xUI.uiMode == 'production')&&(xUI.importBox.importTarget===xUI.XPS)){
                    if( (xUI.XPS.xpsTracks.duration != myXps.xpsTracks.duration)||
                        (xUI.XPS.xpsTracks.length != myXps.xpsTracks.length)
                    ) xUI.reInitBody(myXps.xpsTracks.length,myXps.xpsTracks.duration);
                    xUI.selection();xUI.selectCell([0,0]);
                    xUI.sheetPut(myXps.getRange());
                }else{
                    if((xUI.uiMode != 'floating')&&(xUI.importBox.importTarget===xUI.XPS)){
                        xUI.resetSheet(myXps,undefined,xUI.importBox.callback);
                        xUI.setUImode('floating');
                    }else{
                        xUI.importBox.importTarget.parseXps(myXps.toString(false));
                        xUI.resetSheet(undefined,undefined,xUI.importBox.callback);
                    };
/*                  if((xUI.uiMode != 'browsing')&&(xUI.importBox.importTarget===xUI.XPS)){
                        xUI.setUImode('browsing');
                        xUI.uiModeMenuUpdate();
                    }else{
                        xUI.importBox.importTarget.parseXps(myXps.toString());
                        xUI.resetSheet();
                    };//*/
                };
            }, true);
            if(input.name.match(/\.sts$/)){
// ファイルの内容をarrayBufferとして取得(sts)
                reader.readAsArrayBuffer(input);
            }else{
// ファイルの内容をテキストとして取得
                reader.readAsText(input, myEncode);
            };
            break;
        }else{
//Traget Not Xpst (smbd,xmap,pmdb....)
            var myEncode=(input.name.match(/\.(ard|csv|tsh)$/))?"Shift-JIS":"UTF-8";
// ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
            var reader = new FileReader();
            reader.name=input.name;
// ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
            reader.addEventListener('load', function(e) {
                var output = reader.result;//
                xUI.data_well.value = reader.result;//最後に読み込んだ内容で上書きされるので注意
//console.log(reader);
//エリアターゲット
                var myData = new nas.xMap();
                var dataCheck = myData.parsexMap(reader.result);// 指定オプション無しで一旦変換する
                if(!dataCheck){
                    alert(reader.name+' is not supported xMap format');
                } else {
                    xUI.documents.setContent(reader.result);
                };
            }, true);
            if(input.name.match(/\.sts$/)){
// ファイルの内容をarrayBufferとして取得(sts)
                reader.readAsArrayBuffer(input);
            }else{
// ファイルの内容をテキストとして取得
                reader.readAsText(input, myEncode);
            };
        };
//非同期で実行
(function(){
    var myEncode=(input.name.match(/\.(ard|csv|tsh)$/))?"Shift-JIS":"UTF-8";
      // ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
      var reader = new FileReader();
      reader.name=input.name;
      // ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
      reader.addEventListener('load', function(e) {
        var output = reader.result;//
        xUI.data_well.value = reader.result;//最後に読み込んだ内容で上書きされるので注意  20180220
//エリアターゲット 
        var areaTarget = (document.getElementById('loadTarget').value == 'ref')? 0:undefined;
        var myXps = xUI.convertXps(
            reader.result,
            nas.File.divideExtension(reader.name)[1],
            xUI.importBox.overwriteProps,
            false,
            areaTarget
        );// 指定オプション無しで一旦変換する
        if(!myXps){
            alert(reader.name+' is not supported format');
        }
        xUI.importBox.targetContents.push({
            "name":reader.name,
            "content":reader.result,
            "xps":myXps,
            "checked":true
        });
        if ( xUI.importBox.importCount == xUI.importBox.targetContents.length ){
            console.log(xUI.importBox.targetContents)
            var firstFile=Xps.parseIdentifier(nas.File.divideExtension(xUI.importBox.targetContents[0].name)[1]);
            xUI.importBox.overwriteProps={
                "title":String(firstFile.title),
                "episode":String(firstFile.opus),
                "description":String(firstFile.subtitle)
            }
    console.log(xUI.importBox.overwriteProps);
            xUI.importBox.resetTarget(xUI.importBox.targetContents,xUI.importBox.overwriteProps);
            var myDialog = $("#optionPanelSCI");
            myDialog.dialog("open");myDialog.focus();
            document.getElementById('optionPanelSCI_01_sc').focus();//第一カット(かならずある)にフォーカス
        };
      }, true);
        if(input.name.match(/\.sts$/)){
// ファイルの内容をarrayBufferとして取得(sts)
            reader.readAsArrayBuffer(input);
        }else{
// ファイルの内容をテキストとして取得
            reader.readAsText(input, myEncode);
        };
})();//キューの各エントリを処理
    };//loop-
  };
      }else{
//FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
var msg = "no FileReader! :\n  このブラウザはFileReaderオブジェクトをサポートしていません。\nこの環境ではローカルファイルは読みだし出来ません。\nThis browser does not support the FileReader object. \n you can't read local files now.";
    alert(msg);
      };//if(window.FileReader)
    };//if(window.File)
  };//if(appHost.platform == "AIR")
};//
/**
    xUI.importBox.updateTarget()
    チェックのあるカットのみダイアログの値でターゲットのプロパティを更新して
    新規の配列を作成する
*/
xUI.importBox.updateTarget= function(){
    for(var tix=0;tix<xUI.importBox.targetContents.length;tix++){
        var doAction = document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_imptCB').checked;
        xUI.importBox.targetContents[tix].checked = doAction;
        if(! doAction ) continue;
        var modefiedXps = xUI.importBox.targetContents[tix].xps;//直に参照
        modefiedXps.title    = document.getElementById('optionPanelSCI_title').value
        modefiedXps.opus     = document.getElementById('optionPanelSCI_opus').value;
        modefiedXps.subtitle = document.getElementById('optionPanelSCI_subtitle').value;
        modefiedXps.scene    = '';
        modefiedXps.cut      = document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_sc').value;
    //  時間変更 短くなった場合は後方からフレームが削除される
        modefiedXps.setDuration(
            nas.FCT2Frm(
                document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_time').value)+
                Math.ceil(modefiedXps.headMargin+modefiedXps.tailMargin)
            );
//  変更されたXpsのステータスをFloatingに変更（暫定処理）Floating ステータス廃止
//        modefiedXps.currentStatus.content    = 'Floating';
        xUI.importBox.selectedContents.push(modefiedXps);
    }
    $("#optionPanelSCI").dialog("close");
    if(xUI.importBox.callback instanceof Function){xUI.importBox.callback();};
}
/**
    xUI.importBox.resetTarget(dataTrailer,optionTrailer)
    インポート用のダイアログを初期化する
    引数は初期化用データ
    optionTrailer が与えられない場合は書き直しは行われない
*/
xUI.importBox.resetTarget= function(dataTrailer,optionTrailer){
    if (! dataTrailer) dataTrailer=this.targetContents;
    if (! dataTrailer.length) return false;
    if (optionTrailer){
      document.getElementById('optionPanelSCI_title').value    = optionTrailer.title;
      document.getElementById('optionPanelSCI_opus').value     = optionTrailer.episode;
      document.getElementById('optionPanelSCI_subtitle').value = optionTrailer.description;
    } else {
      document.getElementById('optionPanelSCI_title').value    = dataTrailer[0].xps.title;
      document.getElementById('optionPanelSCI_opus').value     = dataTrailer[0].xps.opus;
      document.getElementById('optionPanelSCI_subtitle').value = dataTrailer[0].xps.subtitle;
    }
//以下マルチファイル対応に変更
    var listHolder=document.getElementById('optionPanelSCIs');
//子ノードをクリア
    while( listHolder.firstChild ){
        listHolder.removeChild( listHolder.firstChild );
    };
//新規の子ノードを作成
    var sciTemplate = document.getElementById('sciTemplate');
    var sciHTML="";
    for(var dix=0;dix<dataTrailer.length;dix++){
        sciHTML += sciTemplate.innerHTML.replace(/%ID%/g,nas.Zf(dix+1,2));
    }
    listHolder.innerHTML=sciHTML;
    if(dataTrailer.length > 1){
        $('.SCiImportCB').css('display','inline');
    }else{
        $('.SCiImportCB').css('display','none');
    };
    for(var dix=0;dix<dataTrailer.length;dix++){
        var IDnumber=nas.Zf(dix+1,2);
        console.log(dix);
        console.log(dataTrailer[dix]);
        document.getElementById('optionPanelSCI_'+IDnumber+'_imptCB').checked    = dataTrailer[dix].checked;
        document.getElementById('optionPanelSCI_'+IDnumber+'_sc').value    = dataTrailer[dix].xps.cut;
        document.getElementById('optionPanelSCI_'+IDnumber+'_time').value  = dataTrailer[dix].xps.getTC(dataTrailer[dix].xps.time());
    };
    if(optionTrailer){
        for(var prp in optionTrailer){
            switch (prp){
                case "title":
    document.getElementById('optionPanelSCI_title').value    = String(optionTrailer[prp]);
                break;
                case "episode":
    document.getElementById('optionPanelSCI_opus').value    = String(optionTrailer[prp]);
                break;
                case "description":
    document.getElementById('optionPanelSCI_subtitle').value    = String(optionTrailer[prp]);
                break;
                case "cut":
     if(dataTrailer.length==1){
        document.getElementById('optionPanelSCI_01_sc').value    = String(optionTrailer[prp]);
    }
                break;
                case "time":
     if(dataTrailer.length==1){
        document.getElementById('optionPanelSCI_01_time').value    = String(optionTrailer[prp]);
        document.getElementById('optionPanelSCI_01_time').onchange();
    }
                break;
            }
        }
    }
    if(xUI.uiMode=='production'){
        var impt = (xUI.uiMode=='production')? true:false;
        document.getElementById('optionPanelSCI_title').disabled    = impt;
        document.getElementById('optionPanelSCI_opus').disabled     = impt;
        document.getElementById('optionPanelSCI_subtitle').disabled = impt;
        document.getElementById('optionPanelSCI_01_sc').disabled    = impt;
        document.getElementById('optionPanelSCI_01_time').disabled  = impt;
        $('.timeInputButtons').css('display','none')
    }else{
        $('.timeInputButtons').css('display','inline')
    }
    document.getElementById('resetSCiTarget').disabled = true ;
    return true;
}
/**
    xUI.importBox.checkValue(ctrlElement)
    ダイアログの変更状況をチェックしてUIの状態を更新する
     パラメータがひとつでも変更された場合はリセットボタンを有効に
    時間パラメータが変更された場合は、表記をTCに統一する
*/
xUI.importBox.checkValue = function(itm){
    var myProps=(String(itm.id).split('_')).reverse();
    switch(myProps[0]){
        case 'time':;
            itm.value = nas.clipTC(itm.value,Infinity,1,3);
        break;
        case 'imptCB':;
                document.getElementById('optionPanelSCI_'+myProps[1]+'_sc').disabled   = (! itm.checked);
                document.getElementById('optionPanelSCI_'+myProps[1]+'_time').disabled = (! itm.checked);
        break;
        case 'title':;
        case 'opus':;
        case 'subtitle':;
        case 'sc':;
        default:
    }
    document.getElementById('resetSCiTarget').disabled = false;
}
/*-- //importBox関連// --*/
/*-- //dataConverter関連// --*/
/**
    サポート対象の他フォーマットのデータをXpstデータにコンバートして戻す関数
    xUI.convertXps(datastream,optionString,overiteProps,streamOption,targetOption)
引数:
    @params {Staring}    datestream
        コンバート対象のデータ
        基本的にテキストデータ
        バイナリデータの場合は1bite/8bit単位の数値配列として扱う（現在未実装）
    @params {String}    optionString
        コンバート対象のデータがXPSのプロパティ全てを持たない場合があるので
        最低限のプロパティ不足を補うための指定文字列
        URIencodedIdentifier または TextIdentifierを指定
        通常はこのデータがファイル名の形式で与えられるのでファイル名をセットする
        空白がセットされた場合は、カット番号その他が空白となる
    @params {Object}    overwriteProps
        コンバータ側で上書きするプロパティをプロパティトレーラーオブジェクトで与える
        インポーター側へ移設予定
    @params {boolean}    streamOption
        ストリームスイッチフラグがあればストリームで返す（旧コンバータ互換のため）
    @params {String}    targetOption
        コンバート対象になるデータに複数のタイムシートが含まれている場合にその対象データを指定するオプション
        引数が与えらえない場合は、最後にヒットしたタイムシートを戻す（ステージ指定用）

    複数データ用コンバート関数
    内部でparseXpsメソッドを呼んでリザルトを返す
    以下形式のオブジェクトで  overwriteProps を与えると固定プロパティの指定が可能
    {
        "title":"タイトル文字列",
        "epispde":"エピソード文字列",
        "description":" エピソードサブタイトル文字列",
        "cut":"カット番号文字列",
        "time":"カット尺文字列  フレーム数またはTC"
    }
    いずれのプロパテイも省略可能
    指定されたプロパティは、その値でダイアログを上書きして編集が固定される
    全て指定した場合は、ユーザの編集ができなくなるので注意
    単独ファイルの場合は、固定に問題は無いが
    複数ファイル処理の場合に問題が発生する
    
    固定プロパティ強制のケースでは複数のドキュメントに同一のカット番号をもたせることはできないので
    カット番号のロックは行われない
    不正データ等の入力でコンバートに失敗した場合はfalseを戻す
    旧来の戻り値と同じ形式が必要な場合は  xUI.convertXps(datastream,"",{},true) と指定する事
戻値:  Object Xps or XpsStream or false
    
*/
xUI.convertXps=function(datastream,optionString,overwriteProps,streamOption,targetOption){
//console.log([datastream,optionString,overwriteProps,streamOption,targetOption]);
    if(! String(datastream).length ){
        return false;
    }else{
// streamOption
    if(!streamOption){streamOption=false;}
// オプションで識別子文字列を受け取る  （ファイル名を利用）
// 識別子はXps.parseIdentifierでパースして利用
    if(! optionString){optionString = ''};//'=TITLE=#=EP=[=subtitle=]//s-c=CUTNo.=';}
// optionStringが空文字列の場合は置換処理を行わない
    if(optionString.length){
//ファイル名等でsciセパレータが'__'だった場合'//'に置換
        if(optionString.indexOf('__')>=0){optionString=optionString.replace(/__/g,'//');}
// 文字列がsciセパレータ'//'を含まない場合、冒頭に'//'を補って文字列全体をカット番号にする
        if(optionString.indexOf('//') < 0 ){optionString='//' + optionString;}
        var optionTrailer=Xps.parseIdentifier(optionString);
    }else{
        var optionTrailer=false;
    }
// 上書きプロパティ指定がない場合は空オブジェクトで初期化
    if(! overwriteProps){overwriteProps={};}
// シート指定引数は、存在すればそのままコンバート関数に渡す。存在しない場合はfalse|undefinedを渡す

//データが存在したら、種別判定して、コンバート可能なデータはコンバータに送ってXPS互換ストリームに変換する
//Xpxデータが与えられた場合は素通し
//この分岐処理は、互換性維持のための分岐
//ArrayBufferを先に判定して別処理をする
      if(datastream instanceof ArrayBuffer){
            var arrB = new Uint8Array(datastream);
            console.log(arrB);
            datastream = STS2XPS(arrB);
      }else{
        switch (true) {
        case    (/^nasTIME-SHEET\ 0\.[1-9]x?/).test(datastream):
//    判定ルーチン内で先にXPSをチェックしておく（先抜け）
        break;
        case    (/^(exchangeDigitalTimeSheet Save Data\n)/).test(datastream):
            datastream =TDTS2XPS(datastream);
            //ToeiDigitalTimeSheet / eXchangeDigitalTimeSheet
        break;
        case    (/^(toeiDigitalTimeSheet Save Data\n)/).test(datastream):
            datastream = TDTS2XPS(datastream,targetOption);
            //ToeiDigitalTimeSheet / eXchangeDigitalTimeSheet
        break;
        case    (/^UTF\-8\,\ TVPaint\,\ \"CSV 1\.[01]\"/).test(datastream):
            datastream = TVP2XPS(datastream);
            //TVPaint csv
        break;
        case    (/^\"Frame\",/).test(datastream):
            datastream = StylosCSV2XPS(datastream,targetOption);//ボタン動作を自動判定にする 2015/09/12 引数は使用せず
        break;
        case    (/^\{[^\}]*\}/).test(datastream):;
//            try{           }catch(err){console.log(err);return false;};
            datastream = ARDJ2XPS(datastream);console.log(datastream);
         break;
        case    (/^#TimeSheetGrid\x20SheetData/).test(datastream):
//            try{}catch(err){console.log(err);return false;};
                datastream = ARD2XPS(datastream);console.log(datastream);
                
        break;
        case    (/^\x22([^\x09]*\x09){25}[^\x09]*/).test(datastream):
//            try{}catch(err){return false}
                datastream = TSH2XPS(datastream);
        break;
        case    (/^Adobe\ After\ Effects\x20([456]\.[05])\ Keyframe\ Data/).test(datastream):
            try{datastream=AEK2XDS(datastream)}catch(err){alert(err);return false}
            //AEKey のみトラック情報がないので  ダミーXpsを先に作成してそのトラックにデータをputする
            var myXps = new nas.Xps();
            myXps.put(datastream);
            datastream = myXps.toString(false);//内部コンバートフラグ
        break;
        default :
/*
    元の判定ルーチンと同じくデータ内容での判別がほぼ不可能なので、
    拡張オプションがあってかつ他の判定をすべてすり抜けたデータを暫定的にTSXデータとみなす
 */
            if(config.TSXEx){
                try{datastream=TSX2XPS(datastream)}catch(err){alert(err);return false;}
            };
        };
      };
        if(! datastream){return false;}
    }
  if(datastream){
    var convertedXps = new nas.Xps();
    convertedXps.parseXps(datastream);
//ここでセリフトラックのチェックを行って、シナリオ形式のエントリを検知したら展開を行う
    for(var tix = 0;tix<convertedXps.xpsTracks.length;tix++){
        var targetTrack = convertedXps.xpsTracks[tix]
        if(targetTrack.option == 'dialog'){
            var convertQueue=[];//トラックごとにキューを置く
            var currentEnd =false;//探索中の終了フレーム
            
            for(var fix = 0;fix<targetTrack.length;fix++){
                var entryText = String(targetTrack[fix]);
//末尾検索中
                if((convertQueue.length>0)&&(currentEnd)){
//キューエントリが存在してかつブランクを検知、次のエントリの開始または、トラック末尾に達した場合はキューの値を更新
//トラック末尾の場合のみ検出ポイントが異なるので注意
                    if((nas.CellDescription.type(entryText) == 'blank')||
                       ((entryText.length>1)&&(entryText.indexOf('「')>=0))||
                       (fix == (targetTrack.length-1))
                    ){
                        var endOffset = (fix==(targetTrack.length-1))? 2:1;  
                        convertQueue[convertQueue.length-1][2]=currentEnd+endOffset;
                        currentEnd = false;
                    }else{
                        currentEnd = fix;
                    };
                };
//開きカッコを持ったテキスト長１以上のエントリがあったらオブジェクトを作成してキューに入れ
//終了点探索に入る
                if((entryText.length>1)&&
                   (entryText.indexOf('「')>=0)){
                    var dialogValue=new nas.AnimationDialog(targetTrack[fix]);
                    dialogValue.parseContent();//
                    convertQueue.push([dialogValue,fix,0]);// [値,開始フレーム,終了フレーム(未定義)]
                    currentEnd = fix;
                };
            };
//キューにあるダイアログを一括して処理
            for(var qix=0;qix<convertQueue.length;qix++){
                var dialogOffset = (String(convertQueue[qix][0].name).length)? 2:1;
                    dialogOffset += convertQueue[qix][0].attributes.length;
                var dialogDuration = convertQueue[qix][2]-convertQueue[qix][1]; 
                var startAddress =[tix,(convertQueue[qix][1] - dialogOffset)];
                var dialogStream =(convertQueue[qix][0].getStream(dialogDuration)).join(',');
                convertedXps.put(startAddress,dialogStream);
            };
        };
    };
//オプション指定文字列の反映（抽出データを一旦全て反映）
    if(optionTrailer){
        if ((optionTrailer.title).length)    convertedXps.title     = optionTrailer.title;
        if ((optionTrailer.opus).length)     convertedXps.opus      = optionTrailer.opus;
        if ((optionTrailer.subtitle).length) convertedXps.subtitle  = optionTrailer.subtitle;
        if ((optionTrailer.scene).length)    convertedXps.scene     = optionTrailer.scene;
        if ((optionTrailer.cut).length)      convertedXps.cut       = optionTrailer.cut;
    }
//リザルトを返す
    return (streamOption)?convertedXps.toString():convertedXps;
  }else{
    return false;    
  };
}
/*-- //dataConverter関連// --*/
//そのほか  以下はAE用の旧バージョン変数なので要注意
    xUI.keyMethod        = config.KEYMethod;    //キー変換方式
    xUI.aeVersion        = config.AEVersion;    //キーにつけるバージョン番号

/*     xUIオブジェクト初期化メソッド
 *      編集対象となるXpsオブジェクトを与えて初期化する。
 *      初期化時点の参照変数はconfig.js内で設定された値及び
 *      nas_common.jsで処理されたオブジェクト
 *      この手順は、読込の都度実行するのは重すぎるので
 *      アプリケーション初期化時に1回だけ実行するように変更される
 */
/*
 *       新規に動作モードxUI.uiModeを実装 2016 12
 *       ドキュメントステータスと別のアプリケーションステータス（モード）として管理される
 *       モードは以下四態
 *     production|edit    :常に writeable 管理情報をユーザ編集することは無い
 *     management         :ドキュメントに対してはreadonly 管理情報に対して writeable
 *     browsing|browse    :常に readonly
 *     floating           :常に writeable 管理情報を編集可能  ただし作業セッション外になる
 *
 *         各モード内で作業条件によって readonlyの状態が発生する
 *         セッション溯及ステータスを実装  2017 01
 * 
 *     sessionRetrace
 *         制作管理上の作業セッションはジョブに  １：１で対応する
 *         整数値で作業の状態を表す データを読み取った際にセットされる
 *         その都度のドキュメントの保存状態から計算される値なのでデータ内での保存はされない
 *     -1  :所属セッションなし(初期値)  全てwriteable
 *     0   :最新セッション 編集対象 wtiteable
 *     1~  :数値分だけ遡ったセッション 編集対象外 常にreadonly
 * 
 *         要注意  ドキュメントステータスとアプリケーションステータス(動作モード)の混同は避けること
 *       >>>>>>ドキュメントモードのFloationgは廃止 2019.12
 *  マルチドキュメント拡張    2018 09
 *  XPSシングルドキュメントではなくxMapシングルドキュメントに変更
 *  xMapに関連つけられる１以上複数のタイムシート（=SCi）
 *
 * 従来の XPS,sessionRetrace,referenceXPS 等のSCiにアタッチされるべきバッファはコレクションに収容される
 * UNDOバッファもドキュメント切り替えのたびにリセットではなく、セッション内ではドキュメントごとに保持
 * XpsはxMapの配下にアタッチする？
 * ドキュメントコレクション
 * xUI.documents = new xUI.documentCollection()
 * 
 * xUI.documents[idx]= new xUI.xMapDocument(xMap);
 * xUI.documents[idx].Xpsts=[];
 * xUI.documents[idx].sessionRetarace
 * xUI.documents[0].referenceContent;
 * xUI.documents[0].yank;
 * xUI.documents[0].yank;
 * 
 * xMap,Xpst(,Xpst,Xpst,Xpst,Xpst,…） タブに対応
 * undo関連
 * sessionRetrace  セッション
 * referenceXPS 一時参照バッファ
 * 
 */
/**
 *    @constractor
 *    ドキュメント管理単位
 *    各ドキュメントごとに編集バッファ等を保持する
 *    @params    { Object xMap|Xps|StoryBoard|PmDomain|pman.reName }    targetObject
 *    @params    { Object Xpa }    referenceObject
 *
 *    contentが
 *  xMap|PmDomein|StoryBord|reNameの場合リファレンスオブジェクトは無視される
 *  xMapの場合、Selectはフォーカスのあるアセットエレメントがアドレス配列でポイントされる
 *  reNameの focus|selection reName自身が持ちSelect|Selectを使用しない(マップするかも)
 *  [アセットID(,グループID(,エレメントID))]
 *  指定配列の深度が3の場合個別のエレメント、1の場合はアセット全体、2の場合グループ全体を示す
 *  空配列の場合はフォーカスなし（初期値）
 *  Selection配列は不定長で各要素が「選択されたエレメントを示すアドレス配列」
 *  空配列の場合は選択エレメントなし
 *  contentがXpstの場合、Selectはフォーカスのあるタイムシートセルがアドレス配列でポイントされる
 *  [タイムライントラックID,フレームID]
 *  アドレス配列は必ず二次元 タイムシートの範囲外の指定も可能
 *  初期値は[1,0]
 *  Selection配列は不定長で各要素が「選択されたエレメントを示すアドレス配列」
 *  または「起点セル座標と範囲指定ベクトルのセット」の配列
 *  または旧指定互換の「フォーカスセルからの範囲指定ベクトル」
 *  Selectionプロパティの第一要素が配列の場合は前者、スカラの場合は後者
 */
xUI.Document=function(targetObject,referenceObject){
        this.parent           = xUI.documents;
        this.content          = targetObject;
        this.type             = xUI.Document.getType(targetObject);//xpst|xmap|stbd|pmdb
        this.Select           = (this.type != 'xpst')?[]:[0,0];
        this.Selection        = (this.type != 'xpst')?[]:[0,0];
        this.undoBuffer       = new xUI.UndoBuffer();
        this.sessionRetrace   = -1;
        this.referenceContent = (this.type == 'xpst')? referenceObject:null;
        this.id;
        if(this.type == 'xmap'){
            this.content.readIN = xUI._readIN_xmap;
        }else if(this.type == 'xpst'){
            this.content.readIN = xUI._readIN_xpst;
        };
}
/** 
    ｘUIDocumentタイプ判定
    
*/
xUI.Document.getType = function getType(obj){
    var type = "";
    if(obj instanceof xMap){
        type = "xmap";
    }else if(obj instanceof Xps){
        type = 'xpst';
    }else if(obj instanceof nas.StoryBoard){
        type ='stbd';
    }else if(obj instanceof nas.Pm.PmDomain){
        type ='pmdb';
    }else if((obj.dataIdf)&&(obj.dataIdf == 'nas_application_backup_data')){
        type = 'nas_application_backup_data';
    }else if(typeof pman == 'object'){
        if (obj === pman.reName){
            type ='pman_reName';
        };
    };
//console.log(obj);
//console.log(type);
    return type;
}
/*  アクティブドキュメントを切り替える
    ドキュメント自身の切り替えメソッドとして実装する
    deactivate|activate 両方を作成することで分岐をクリアにする
    deactivate は基本的にactivateメソッドから呼び出す機能であり他者から呼ばれることはない
*/
/** ドキュメントをディアクティブする際に各種情報を書き戻す*/
xUI.Document.prototype.deactivate = function(){
    if(this.type == 'xpst'){
//        this.referenceContent = xUI.referenceXPS;
        this.referenceContent = nas.Xps.duplicate(xUI.referenceXPS);//クラスメソッドで複製して控えを取る
    };
    this.Select         = xUI.Select;
    this.Selection      = xUI.Selection;
    this.sessionRetrace = xUI.sessionRetrace;// = this.sessionRetrace;
    xUI.activeDocumentId = -1;
    xUI.activeDocument   = null;
    return;
}
xUI.Document.prototype.activate = function(){
    if(
        (xUI.activeDocument === this)&&
        (xUI.activeDocumentId == xUI.documents.indexOf(this))
    ) return xUI.documents.indexOf(this);

    if(xUI.activeDocument) xUI.activeDocument.deactivate();

    xUI.activeDocument   = this;//参照を設定
    xUI.activeDocumentId = xUI.documents.indexOf(this);
    if(this.type == 'xpst'){
        xUI.XPS = xUI.activeDocument.content;
        XPS = xUI.XPS;
        xUI.referenceXPS = xUI.activeDocument.referenceContent;
        xUI.Select      = this.Select;
        xUI.Selection   = this.Selection;
        xUI.delayRefreash   = true;
    };
/*
    if(this.id > 0){
// Xpstのみの処理
// 同一データ判定は、データのuuidで行う 判定後に バッファをcontentの参照に切り替える
        if(xUI.XPS.id != xUI.activeDocument.content.id){
//            xUI.XPS.parseXps(xUI.activeDocument.content.toString(false));
//            xUI.activeDocument.content = xUI.XPS
            xUI.XPS = xUI.activeDocument.content
            if(XPS !== xUI.activeDocument.content){
                XPS = xUI.activeDocument.content;
            };// XPSの入れ替えは行わない
            if((this.referenceContent)&&(xUI.referenceXPS !== this.referenceContent)){
                xUI.referenceXPS = this.referenceContent;
            };
            xUI.Select      = this.Select;
            xUI.Selection   = this.Selection;
            xUI.delayRefreash   = true;
        }
//
    }else{
//        xUI.delayRefreash   = true;
    };
//    xUI.undoBuffer      = this.undoBuffer;undoBufferの切り替えは不要
// */
    xUI.sessionRetrace  = this.sessionRetrace;
//    if(this.id > 0) xUI.resetSheet();//?
//この判定はドキュメントタブUIの有無を判定したほうが良い
    if(document.getElementById('xmap-header')) xUI.reDrawDocumentTab();
//    if(xUI.app == 'remaping') xUI.reDrawDocumentTab();
    return this.id;
}
/**/
xUI.Document.prototype.setReference = function(content){
    if (content instanceof Xps){
        this.referenceContent = content;
        xUI.referenceXPS = this.referenceContent;
        if(this.id == xUI.activeDocumentId ) xUI.resetSheet();
        return this.id;
    }
    return false;
}
/**
    ドキュメントトレーラーコレクション配列
    内容は現在編集中のドキュメントすべて
remaping|xpsedit
    ID:0  は必ずxMap
    ID:1~ は必ずXpst
    兼用カットがある場合は、順次IDが増す
    XpstのPmNode(Job)違いは、ドキュメントとして増加するのでなくxMapとは別にNodeControlを行い。一つのドキュメントとして扱う
pman_reName
    ID:0  は必ずpman.reName
pman
    ID:0  は必ずnas.Pm.pmdb
sbdeditor
    ID:0  は必ずnas.StoryBoard
*/
xUI.documents=[];
    xUI.documents.currentNode;//フォーカスのある管理ノードを保持する一時変数
    xUI.documents.currentCompositeNode;//フォーカスのあるコンポジットノードを保持する一時変数
/**
 *  ドキュメントキャリア初期化メソッド
 *  配下のメソッドが正常に働くように初期化を行う
 *  @params {}引数  なし
 *  戻値  初期化の成功または失敗のフラグ
 */
xUI.documents.init = function(){
    if (xUI.app == 'pman'){
        xUI.documents[0] = new xUI.Document(nas.pmdb);
        xUI.documents[0].activate();
    }else if (xUI.app == 'pman_reName'){
        xUI.documents[0] = new xUI.Document(pman.reName);
        xUI.documents[0].activate();
    }else if (xUI.app == 'sbdeditor'){
        xUI.documents[0] = new xUI.Document(new nas.StoryBoard());
        xUI.documents[0].activate();
    }else if ((xUI.app == 'remaping')||(xUI.app == 'xpsedit')){
console.log('go init documents XMAP|XPS');
//マスタードキュメントが未設定の場合 カラのxMap で設定する
        if(xUI.documents.length == 0){
console.log('set default xMap')
            xUI.documents[0]    = (xUI.XMAP instanceof nas.xMap)? new xUI.Document(xUI.XMAP):new xUI.Document(new nas.xMap());
            xUI.documents[0].id = 0;
            xUI.XMAP   = this[0].content;
            XMAP       = this[0].content;//グローバルを設定
        };
//マスタードキュメントの兼用カットをセット・アップ
console.log(decodeURIComponent(xUI.XMAP.getIdentifier()));
console.log('setup inherit : '+ xUI.XMAP.pmu.inherit.join(' / '));
        for (var xid = 0 ; xid < xUI.XMAP.pmu.inherit.length ; xid ++){
console.log('setup : inherit : '+ xid +' : '+xUI.XMAP.getIdentifier('xps',xid));
            var idx    = xid + 1;
            var myIdf  = xUI.XMAP.getIdentifier('xps',xid);
            var myShot = serviceAgent.currentRepository.entry(myIdf);
            if(myShot){
//エントリの有無に関わらず一旦クラスメソッドでバルクシートを取得・設定
                var myXps  = xMap.getXps(xUI.XMAP,xid);
                xUI.documents[idx] = new xUI.Document(myXps);
                this[idx].id = idx;
                if(xid == 0 ){
//                    xUI.XPS.parseXps(this[1].content.toString(false));//activateで設定されるので不要
                };
                if(
                    (! this[0].content.contents)||
                    (this[0].content.contents[idx] !== this[xid].content)
                ){
                    this[0].content.contents[idx] = this[xid].content;
                    if(this[xid].content.xMap !== this[0].content)
                    this[xid].content.xMap = this[0].content;
                };
console.log(myShot);
                if(myShot.token){
//トークンがあれば、既登録カット
//実際のアクセス先はUATサーバとローカルで異なる。このトークンで呼び出し可能なケースとそうでない場合があるので注意
//localRepository.getEntry側の修正で対応すべし
//リポジトリ呼び出しでバックグラウンド処理
console.log('entry exists --------- getEntry '+myIdf);
                    serviceAgent.currentRepository.getEntry(myIdf,false,function(result){
console.log(result);
                        xUI.documents.setContent(result);
                    });
                };
                continue;
            }else{
//リポジトリ未登録新規カット または ショット(カット番号)のない特殊エントリ EXTRA
console.log('no STDBentry EXTRA or new Document !')
            var myXps = xMap.getXps(xUI.XMAP,xid);
            if (xid == 0){
                xUI.XPS.parseXps(myXps.toString(false));
                if (!(xUI.XMAP.contents)) xUI.XMAP.contents = [xUI.XPS];
            };
            xUI.documents[idx] = new xUI.Document(myXps);
            this[idx].id = idx;
            };
        };//inherit xps init loop
        if((xUI.app == 'remaping')||(xUI.app == 'xpsedit')){
console.log('activate 1')
//            xUI.activeDocument = xUI.documents[1];
//            xUI.activeDocumentId = 1;
//            xUI.documents.targetId = 1;
            xUI.documents[1].activate();
        }else{
console.log('activate 0')
//            xUI.activeDocument = xUI.documents[0];
//            xUI.activeDocumentId = 0;
//            xUI.documents.targetId = 0;
            xUI.documents[0].activate();
            xUI.resetReceipt();
            xUI.reDrawDocumentTab();
        };
//        xUI.setUImode('browsing');
        if($('#optionPanelFile').isVisible()) xUI.sWitchPanel('File');
    };
};//init
/*
    ドキュメントIDを指定してアクティベートする
*/
xUI.documents.activate = function(idx){return this[idx].activate();}
/*
    ドキュメントコレクションをクリアする
    xUI.XMAP xUI.XPSが、直前状態で残ることに注意
*/
xUI.documents.clear = function(){
    this.length=0;
    xUI.activeDocument = null;
    xUI.activeDocumentId = -1;
    this.targetId = 0;
}
/*
    ドキュメントコレクションメンバーのステータスを一括で変更する
*/
xUI.documents.setStatus=function(status){
    for (var ix = 0 ;ix < this.length; ix ++){
        this[ix].content.pmu.nodeManager.setStatus(status);
    }
}
/**<pre>
 *   xUI.documents データ読み込みメソッド
 *   引数で渡されたデータをdocumentsに適用する
 *   適用成功時は引き渡しデータのアクテイベートを行う?
 *  動作を単純化する
 *  xMap|PmDomain|StoryBoard|pman.reNameが与えられた場合、documents全体をクリアしてid:0にロード
 *  Xpsが与えられた場合、xMapの所属カット以外はリジェクト
 *  Xpsには、同時にリファレンスを与えることが可能
 *  </pre>
 *    
 *  @params     {String|Object initial document}    documentSource
 *      document source string | (xMap|Xps)
 *  @params     {Boolean}   referenceXps
 *      引数データが初期化データであるか否か xMapの場合は必ず初期化データとなる。
 *    @returns    設定成功時は true それ以外は false|undefined
 *        引数データが配置されたドキュメントID 設定が行われなかった場合の戻り値は -1 (存在しないドキュメントID)
 */
xUI.documents.setContent = function(documentSource,referenceXps){
console.log(arguments);
    if((!(documentSource))||(String(documentSource).length == 0)) return -1;
    var isSource = false;
    if(typeof documentSource != 'string'){
        var dataType = xUI.Document.getType(documentSource);
    }else if(documentSource.match(/^nas(TIME-SHEET|MAP-FILE|MOVIE-SCRIPT|PMDB-FILE)\s/)){
/*データストリームの冒頭をチェックしてデータタイプを判別*/
        var dataType = {
            'TIME-SHEET'   :'xpst',
            'MAP-FILE'     :'xmap',
            'MOVIE-SCRIPT' :'stbd',
            'PMDB-FILE'    :'pmdb'
        }[RegExp.$1];
        isSource = true
    }
    if(!(dataType))    return -1;
//xMapが与えられた場合 ドキュメント全体の初期化を行う
//console.log([documentSource,dataType,isSource]);
    if(dataType == 'xmap'){
        if(isSource){
            var startupxMap     = new nas.xMap();
            startupxMap.readIN  = xUI._readIN_xmap;
            var iptM = startupxMap.parsexMap(documentSource);
            if(!(iptM)) return -1;
        }else{
            var startupxMap     = documentSource;
            documentSource      = startupxMap.toString();
        }
        if(startupxMap){
//初期化データとしてxmapを設定して環境構築
//console.log('init all DocumentData');console.log(startupxMap);console.log(this);
//初期化データがデータベース内に存在するか否かを判定しない セットのみ行う
            if((this.length > 1)&&(startupxMap !== this[0].content)){
                xUI.documents.clear();
            }
            if(xUI.XMAP !== startupxMap){
                xUI.documents[0]= new xUI.Document(startupxMap);
                xUI.documents[0].id=0;
                xUI.documents[0].content.contents = [];
                xUI.XMAP = startupxMap;
            }
//この時点ではXpsの設定を行わず documents.initに渡す
//initでは、マスタードキュメントのカット可能であればDBに請求 不成功場合バルクシートを作り初期化を行う
            this.init();
            return 0;
        }else{
            console.log(documentSource);
            return -1;
        }
//================================================ここまでがxmap本処理 それ以外は以下のパスへ
    }else if(dataType == 'xpst'){
console.log([documentSource,dataType,isSource]);
        if(isSource){
            var importXps     = new nas.Xps();
            var iptx = importXps.parseXps(documentSource);
            if(! iptx) return -1;
        }else{
            var importXps     = documentSource;
            documentSource    = importXps.toString();
        };
        importXps.readIN  = xUI._readIN_xpst;
console.log('set content Xpst data :');
console.log(importXps.getIdentifier());
//XpsがxMapにマッチしない場合はリジェクト
        if (
            (!(xUI.documents[0].content instanceof xMap))||
            (nas.Pm.compareIdentifier(importXps.getIdentifier(),xUI.documents[0].content.getIdentifier(),false,false)    < 1)
        ){
console.log('Xpst no match current xMap : rejected '+ importXps.getIdentifier());
            return -1;
        }
        if(importXps){
            var targetId = xUI.XMAP.pmu.inherit.findIndex(function(element){
                return (nas.Pm.compareCutIdf(element.toString('cut'),importXps.pmu.inherit[0].name) == 0);
            }) + 1;
console.log('set Xps :'+importXps.pmu.toString() + ' to xUI.documents :' + targetId);
//console.log(this);
            if(targetId > 0){
                if(xUI.documents[targetId]){
                    xUI.documents[targetId].content.readIN(documentSource);
                    if(xUI.documents[targetId].content.xMap !== xUI.documents[0].content) xUI.documents[targetId].content.xMap = xUI.documents[0].content;
                }else{
                    xUI.documents[targetId] = new xUI.Document(importXps,referenceXps);
                    xUI.documents[targetId].id = targetId;
                    xUI.documents[0].content.contents.add(xUI.documents[targetId].content);
                    if(xUI.documents[targetId].content.xMap !== xUI.documents[0].content) xUI.documents[targetId].content.xMap = xUI.documents[0].content;
                }
//                if(xUI.XPS === xUI.documents[targetId].content) xUI.resetSheet();//リセットを省略
                return targetId;
            }else{
                console.log(documentSource);
                return -1;//想定外エラー
            }
        }else{
            console.log(documentSource);
            return -1;//カット違い
        };
    }else if((dataType == 'pmdb')||(dataType == 'stbd')){
    }else{
        console.log(documentSource);
        return -1;//不正データが与えられたので読み込み失敗
    }
}

/**<pre>
 *   xUI.documents データ読み込みメソッド
 *   引数で渡されたデータをdocumentsに適用する
 *   適用成功時は引き渡しデータのアクテイベートを行う?
 *  動作を単純化する
 *  xMapが与えられた場合、同一オブジェクトで無いかぎりdocuments全体をクリアしてid:0にロード
 *  Xpsが与えられた場合、xMapの所属カット以外はリジェクト
 *  Xpsには、同時にリファレンスを与えることが可能
 *  </pre>
 *    
 *  @params     {String|Object initial document}    documentSource
 *      document source string | (xMap|Xps)
 *  @params     {Boolean}   referenceXps
 *      引数データが初期化データであるか否か xMapの場合は必ず初期化データとなる。
 *    @returns    設定成功時は true それ以外は false|undefined
 *        引数データが配置されたドキュメントID 設定が行われなかった場合の戻り値は -1 (存在しないドキュメントID)
 *
xUI.documents.setContent__=function(documentSource,referenceXps){
    if(String(documentSource).length == 0) return false;
    var isSource = false;
    if(documentSource instanceof xMap){
        var dataType = 'xmap';
    }else if(documentSource instanceof Xps){
        var dataType = 'xpst';
    }else if(documentSource.match(/^nas(TIME-SHEET|MAP-FILE)\s/)){
/*データストリームの冒頭をチェックしてデータタイプを判別
        var dataType = {'TIME-SHEET':'xpst','MAP-FILE':'xmap'}[RegExp.$1];
        isSource = true
    }else{
        return false;
    }
//console.log(documentSource,referenceXps);
    if(dataType == 'xmap'){
        if(isSource){
            var startupxMap     = new nas.xMap();
            startupxMap.readIN  = xUI._readIN_xmap;
            if(!(startupxMap.readIN(documentSource))) return false;
        }else{
            var startupxMap     = documentSource;
        }
        if(startupxMap){
//初期化データとしてxmapを設定して環境構築
console.log('init all DocumentData');console.log(startupxMap);console.log(this);
            xUI.documents.clear();
            xUI.documents[0]= new xUI.Document(startupxMap);
            xUI.documents[0].id=0;
            xUI.documents[0].content.contents = [];
            xUI.XMAP = xUI.documents[0].content;
/*
//開始xMapにinheritがある
            if(startupxMap.pmu.inherit.length){
                for (var xix=0;xix<startupxMap.pmu.inherit.length;xix++){
                    var targetIdf = startupxMap.getIdentifier('xps',xix);//Floatingが戻るのは？
                    xUI.documents[xix+1] = new xUI.Document(new nas.Xps());
                    xUI.documents[xix+1].id = xix+1;
//startupxMap.contents[xix] = xUI.documents[xix+1].content;
console.log(targetIdf);
                    if(serviceAgent.currentRepository.entry(targetIdf)){
                        xUI.documents.targetId = xix+1;
                        serviceAgent.getEntry(targetIdf);
                    }else{
                        xUI.documents[xix+1].content = new nas.Xps(
                            undefined,
                            xUI.XMAP.pmu.inherit[xix].time,
                            xUI.XMAP.framerate,
                            xUI.XMAP,
                            xUI.XMAP.pmu.nodeManager.getNode('*.*.*.').getPath()
                        );
                        //this[xix+1].content.syncIdentifier(targetIdf);
                    }
                    xUI.documents[0].content.contents[xix] = xUI.documents[xix+1].content;
                }
            }else{
//これは異常処理 inherit.length==0 のケースはエラーでも良いかも？ ⇒EXTRAがある
                var blankXps      = new nas.Xps();
                blankXps.xMap = xUI.XMAP;
                xUI.documents[1]= new xUI.Document(blankXps);
                xUI.documents[1].id=1;
                xUI.documents[0].content.contents = [blankXps];
            };// /
            xUI.documents[0].activate();
//            xmapExtension();//仮コード
            xUI.resetReceipt();
            xUI.reDrawDocumentTab();
            return true;
        }else{
            console.log(documentSource);
            return false;
        }
//こちら本処理 それ以外はこの処理へのパス
    }else if(dataType == 'xpst'){
console.log(documentSource);
console.log(isSource);
        if(isSource){
            var importXps     = new nas.Xps();
            importXps.readIN  = xUI._readIN_xpst;
            if(!(importXps.readIN(documentSource))) return false;
        }else{
            var importXps     = documentSource;
        }
console.log(importXps);
        if (nas.Pm.compareIdentifier(importXps.getIdentifier(),xUI.documents[0].content.getIdentifier())<1) return false
//console.log(xUI.documents.targetId);
//          if(xUI.documents.targetId>0){
            if(importXps){
            /*    if(nas.Pm.compareIdentifier(
                    importXps.getIdentifier(),
                    this[0].content.getIdentifier()
                )>0){
                    var docId = -1;
                    for (var ix=0;ix<this[0].content.pmu.inherit.length;ix++){
                        if(nas.Pm.compareCutIdf(
                            [importXps.scene,importXps.cut].join('-'),
                            this[0].content.pmu.inherit[ix].toString()
                        ) == 0) {docId = ix+1;break;}
                    };// /
                    if(this.targetId > 0 ){
                        xUI.documents[xUI.documents.targetId]    = new xUI.Document(importXps,referenceXps);
                        xUI.documents[xUI.documents.targetId].id = xUI.documents.targetId;
                        xUI.documents[xUI.documents.targetId].activate();
                        xUI.documents.targetId = 0;

                        return true;
                    }else{
                        console.log(documentSource);
                        return false;//想定外エラー
                    }
            /*    }else{
                    console.log(documentSource);
                    return false;//カット違い
                };// /
            }else{
               console.log(documentSource);
               return false;//不正データが与えられたので読み込み失敗
            }
//        }else{
/*  この配下は xMapなしでXpsを読み込む際の手続き
 *   XpsからxMapを取得して取得して再帰処理
 *   XpsからxMapを得ることが必要 現在のリポジトリに必要な情報を与えてxMapを取得する。
 *   この下側の処理の大半はRepository.getxMmap(idf)の機能へ移動
 /
/*
console.log(importXps);
console.log(decodeURIComponent(nas.Pm.getIdentifier(importXps,'cut')));
            if(importXps){
                serviceAgent.getxMap(nas.Pm.getIdentifier(importXps,'cut'),null,null);
                return true;

                var dtForm = nas.checkDataPath(importXps.mapfile);
                if(dtForm){
                    switch (dtForm){
                    case 'idf':
                        var mapIdentifier = importXps.mapfile;
                        if (! mapIdentifier.match(/\.xmap$/)) mapIdentifier +='.xmap';
                    break;
                    case 'win':
                    case 'unix':
                    case 'URL':
                    default:
//ファイル等リポジトリ外部のストレージへの参照は2019.0607未サポート 不明データと同じ扱いにする
                        var mapIdentifier = nas.Pm.getIdentifier(importXps)+".xmap";
                    }
                }else{
//mapfile プロパティの記載がないのでシート識別子を転用
                    var mapIdentifier = nas.Pm.getIdentifier(importXps)+".xmap";
                }
                var mapEntry = serviceAgent.currentRepository.entry(mapIdentifier);
                if(mapEntry){
//リポジトリ内にある エントリーキーで取得
console.log(mapEntry);//リポジトリ内のxMapを使用
                    return serviceAgent.getEntry(mapEntry);//再起呼び出し（レスポンスは不定）
                }else{
//マップデータから生成したデータを設定 リポジトリ内のデータで、自身を更新
console.log('*===== マップデータから生成したデータを設定')
console.log(decodeURIComponent(nas.Pm.getIdentifier(importXps)))
                    var newxMap = Xps.getxMap(importXps);
                    var listEntry = serviceAgent.currentRepository.entryList.getByIdf(nas.Pm.getIdentifier(importXps));
console.log(listEntry);
//                    for (var iix = 0 ;iix < listEntry.issues.length ; iix++){
//console.log(listEntry.issues[iix]);
//                    }
                    return this.setContent(newxMap);
                };// */
/*            }
//処理可能なXpsがない
            return false;
        };//
    }
 console.log(xUI.documents);
//    xUI.XMAP = this[0].content;
//    xUI.XPS  = ( xUI.activeDocumentId > 0 )? this[xUI.activeDocumentId].content:this[1].content;
    return undefined;
}
*/

/* TEST
xUI.docuemnts.setContent(startupDocument);
*/
/**
 *    読み込みメソッド
 *    xMap.parsexMapのラッパ関数
 *  @params {String}  datastream
 *    @returns {Object xMap|false}
 *       parsexMap の戻り値を返す
 *   コンバータが必要な場合はここに設置する
 *  {Object xMap}.readIn(datastream) として使用する
 */
xUI._readIN_xmap=function(datastream){return this.parsexMap(datastream)};

/**
        Xpsクラスメソッドを上書きするためのファンクション
        データインポートを自動判定
        xUI.sessionRetrace == -1    通常の読み出し
        xUI.sessionRetrace == 0     内容のみ入れ替え
        xUI.sessionRetrace > 0     読み込んだ後に-1にリセット
        
 *    Xps.parseXpsのラッパ関数
 *  @params {String}  datastream
 *    @returns {Object Xps|false}
 *       parsexMap の戻り値を返す
 *   コンバータが必要な場合はここに設置する
 */
xUI._readIN_xpst=function readIN(datastream){
    xUI.errorCode=0;//読み込みメソッドが呼ばれたので最終のエラーコードを捨てる。
    if(! datastream.toString().length ){
      xUI.errorCode=1;return false;//"001:データ長が0です。読み込みに失敗したかもしれません",
    }else{
//データが存在したら、コンバータに送ってコンバート可能なデータをXPS互換ストリームに変換する
/**
        データインポートは自動判定
        xUI.sessionRetrace == -1    通常の読み出し
        xUI.sessionRetrace == 0     内容のみ入れ替え
        xUI.sessionRetrace > 0     読み込んだ後に-1にリセット
    import判定がtrueの場合、現データの以下のプロパティを保護する
    カット尺を保護する場合は、リファレンスに読み込んで部分コピーを行う
*/
        var isImport=((xUI.sessionRetrace==0)&&(xUI.uiMode=='production'))? true:false;
        var newXps = xUI.convertXps(datastream,"",{},false);
/*
    読み込みデータが、documentMode (page|scroll) をもたない場合は、現在のdocumentModeを与える
    xUI.Mode
*/
        if(newXps.documentMode){
            console.log(newXps.documentMode);
            alert('2000:documentMode :'+ newXps.documentMode);
        }else{
            newXps.documentMode = xUI.XPS.documentMode;
            console.log(newXps.toString());
            alert(' no documentMode ');
        };
/*
    読み込みデータが、sheetLooks(書式情報)をもたない場合は、現在のSheetLooksを与える
    sheetLooksが不完全な場合も仮の書式で置換する
*/
        if(newXps.sheetLooks){
            console.log(newXps.sheetLooks);
            alert('2011: has sheetLooks');
        }else{
            newXps.sheetLooks = xUI.XPS.sheetLooks;
            console.log(newXps.toString());
            alert(' no sheetLooks ');
        };
/*
読み込まれたデータ内にシナリオ形式のダイアログ記述が存在する可能性があるので、これを探して展開する
現在は処理をハードコーディングしてあるが、この展開処理はトラックを引数にして処理メソッドに渡す形に変更する予定
*/
//ここでセリフトラックのチェックを行って、シナリオ形式のエントリを検知したら展開を行う
console.log(newXps)
    for(var tix=0;tix<newXps.xpsTracks.length;tix++){
        var targetTrack=newXps.xpsTracks[tix]
        if(targetTrack.option=='dialog'){
            var convertQueue=[];//トラックごとにキューを置く
            var currentEnd =false;//探索中の終了フレーム
            
            for(var fix=0;fix<targetTrack.length;fix++){
                var entryText=String(targetTrack[fix]);
//末尾検索中
                if((convertQueue.length>0)&&(currentEnd)){
//キューエントリが存在してかつブランクを検知、次のエントリの開始または、トラック末尾に達した場合はキューの値を更新
//トラック末尾の場合のみ検出ポイントが異なるので注意
                    if((nas.CellDescription.type(entryText)=='blank')||
                       ((entryText.length>1)&&(entryText.indexOf('「')>=0))||
                       (fix==(targetTrack.length-1))){
                        var endOffset = (fix==(targetTrack.length-1))? 2:1;  
                        convertQueue[convertQueue.length-1][2]=currentEnd+endOffset;
                        currentEnd=false;
                    }else{
                        currentEnd=fix;
                    }
                }
//開きカッコを持ったテキスト長１以上のエントリがあったらオブジェクトを作成してキューに入れ
//終了点探索に入る
                if((entryText.length>1)&&
                   (entryText.indexOf('「')>=0)){
                    var dialogValue=new nas.AnimationDialog(targetTrack[fix]);
                    dialogValue.parseContent();//
                    convertQueue.push([dialogValue,fix,0]);// [値,開始フレーム,終了フレーム(未定義)]
                    currentEnd = fix;
                };
            };
//キューにあるダイアログを一括して処理
            for(var qix=0;qix<convertQueue.length;qix++){
                var dialogOffset = (String(convertQueue[qix][0].name).length)? 2:1;
                    dialogOffset += convertQueue[qix][0].attributes.length;
//console.log(dialogOffset);
                var dialogDuration = convertQueue[qix][2]-convertQueue[qix][1]; 
                var startAddress =[tix,(convertQueue[qix][1] - dialogOffset)];
//console.log(startAddress);
                var dialogStream =(convertQueue[qix][0].getStream(dialogDuration)).join(',');
//console.log(dialogStream);
                newXps.put(startAddress,dialogStream);
            };
        };
    };
//インポートが必要な場合は、新規オブジェクトに現行のドキュメントから固定対象のプロパティを転記する
//
        if(isImport){
/*
            "xMap",         ;//Object xMap      ドキュメント側を使用（xMap実装後はマージが必要マージメソッドを作成）
            "line",         ;//Object nas.Xps.XpsLine   ドキュメント側を使用   
            "stage",        ;//Object nas.Xps.XpsStage  ドキュメント側を使用
            "job",          ;//Object nas.Xps.XpsStage  ドキュメント側を使用
            "currentStatus",;//Object nas.Xps.JobStatus ドキュメント側を使用
            "mapfile",      ;//String           ドキュメント側を使用
            "opus",         ;//String           ドキュメント側を使用
            "title",        ;//String           ドキュメント側を使用
            "subtitle",     ;//String           ドキュメント側を使用
            "scene",        ;//String           ドキュメント側を使用
            "cut",          ;//String           ドキュメント側を使用
//          "trin",         ;//Array                        インポート側を使用
//          "trout",        ;//Array                        インポート側を使用
//          "rate",         ;//Strting                      インポート側を使用
//          "framerate",    ;//String                       インポート側を使用
            "create_time",  ;//String           ドキュメント側を使用
            "create_user",  ;//Object UserInfo  ドキュメント側を使用
            "update_time",  ;//Stirng           ドキュメント側を使用
            "update_user",  ;//Object UserInfo  ドキュメント側を使用
//          "xpsTracks"     ;//Object XpsTrackCollection    インポート側を使用

  */
            var props = ["xMap","line","stage","job","currentStatus","mapfile","opus","title","subtitle","scene","cut","create_time","create_user","update_time","update_user"];
            for (var ix=0;ix<props.length;ix++){newXps[props[ix]]=xUI.XPS[props[ix]]}
        }else{
            var props = ["xMap","line","stage","job","currentStatus","mapfile","opus","title","subtitle","scene","cut","create_time","create_user","update_time","update_user"];
            if((xUI.importBox.importCount==1)&&(xUI.importBox.selectedContents.length)){
                for (var ix=0;ix<props.length;ix++){
                    if(xUI.importBox.selectedContents[0][props[ix]]) newXps[props[ix]]=xUI.importBox.selectedContents[0][props[ix]];
                }
            };
        }
//        if(xUI.sessionRetrace > 0) xUI.sessionRetrace= -1;
        return this.parseXps(newXps.toString(false));//内部コンバート
    };
};
/*
iconButtonColumnPalette
class ibCP
id = ibCP_00
末尾にユーザパレットを増設可能 任意数

items配列にxUI.CommandItemオブジェクトを置く
数値｜文字列であった場合はparseメソッドでcommandコレクションを検索して置き換える
ヒットしない場合は、NOPコマンドを置く

xUI.ibCP=[
    {
        label:"ラベル（キー兼用）"
        items:[0,1,2,3,4]
    },
    {
        label:"ラベル（キー兼用）"
        items:[5,6,7]
    },
    {
        label:"ラベル（キー兼用）"
        items:[5,6,4,9]
    },
    {
        label:"ラベル（キー兼用）"
        items:[0,1,2,3,4]
    },
]

4つから5つを目安に最大10程度のアイコンボタン
配列の中身はメニューオブジェクトの参照?ID?
書き出しの値はラベル:[ID配列]

切替メソッドはibCPオブジェクトにアタッチする

現在(2020.04.12)メニューアイテムはHTML内のデータを使い切替部分のみが有効
本体の初期化は省略 初期化メソッド内で実行予定
最終メニューはクッキーでの保存対象
*/

xUI.ibCP = [0,1,2,3,4,5,6];//配列仮値
xUI.ibCP.activePalette = 0;//パレット初期値
xUI.ibCP.init = function(){
    for (var l = 0 ; l < this.length ; l ++ ){
        for (var m = 0 ; m < this[l].items.length ; m ++ ){
            var cmd = this[l].items[m];
            if(! cmd instanceof xUI.CommandItem){
                cmd = xUI.commands.find(function(elm){return ((elm.id==cmd)||(elm.key==cmd))});
                if(! cmd){
                    cmd = xUI.CommandItem[0];
                };
            };
        };
    };
}
xUI.ibCP.toString=function(){
    var result = '';
    for (var l = 0 ; l < this.length ; l ++ ){
        result += '<span id="ibCP_'+nas.Zf(l,2)+'" class="ibCP">'
        for (var m = 0 ; m < this[l].items.length ; m ++ ){
            var cmd = this[l].items[m];
            result += '<button';
            result += ' id  ="ibC'+cmd.label+'"';
            result += ' data-i18n="[title]'+ cmd.label +'_description"';
            result += ' class = "boxButton iconButton-'+ "cmd.icon" +'"';
            result += ' onclick="'+cmd.function+'";';
//            result += ' onclick="xUI.commands.exec('+cmd.id+');"';
            result += '>';
            result += '</button>';
            result += '';
        }
        result += '</span>\n';
    }
    result += '';
    return result;
}
/**
    切り替えボタンの内容を書き換える
 */
xUI.ibCP.setMenu = function(evt){
    if(evt.offsetX<14){
        nas.HTML.removeClass(document.getElementById('ibCmenuSwitch'),'iconButton-menuFwd');
        nas.HTML.addClass(document.getElementById('ibCmenuSwitch'),'iconButton-menuBwd');
        document.getElementById('ibCmenuSwitch').title = '前のメニュー'
    }else{
        nas.HTML.removeClass(document.getElementById('ibCmenuSwitch'),'iconButton-menuBwd');
        nas.HTML.addClass(document.getElementById('ibCmenuSwitch'),'iconButton-menuFwd');
        document.getElementById('ibCmenuSwitch').title = '次のメニュー'
    };
};
/**
    メニューを切替える
    params    {Number|String}    ix
        表示するパレットID 0~
        
      キーワード fwd|bwd は、それぞれ前進後進
      引数がない場合は現在表示しているひとつ前のパレットを表示('bwd')
      
      -1を指定するとツールバーを非表示にする
xUI.ibCP.activePalette
*/
xUI.ibCP.switch=function(ix,evt){
    if(evt){
        ix = (evt.offsetX < 14)?'bwd':'fwd';
    }
        console.log(ix);
    if((typeof ix == 'undefined')||(ix == 'bwd')){
        ix = this.activePalette + this.length - 1;
    }else if(ix == 'fwd'){
        ix = this.activePalette + 1;
    };
    if(ix < 0){xUI.sWitchPanel();return;}
    this.activePalette = ix % this.length;
    var tgtMenu ;
    for (var iy= 0;iy<this.length;iy++){
        tgtMenu = $('#ibCP_'+nas.Zf(iy,2));
        if(iy == this.activePalette){tgtMenu.show();}else{tgtMenu.hide();}
    }
};
xUI.ibCP.switch(parseInt(config.ToolViewIbCs));

/** //xUIの初期化メソッド
引数にオブジェクト（Xps|xMap|nas.StoryBoard|nas.Pm.pmdb|pman.reName 等）を渡す
ソース渡しが発生している
    オブジェクトがxMapの場合は、アタッチされたXpsをすべてドキュメントトレーラーにセットして開始
    Xpsが未設定の場合は、Xpsの初期化は保留
    
    オブジェクトがXpsの場合は、Xpsに関連づけられたxMapを呼び出してドキュメントトレーラーを設定
    xMapが存在しない場合は、新しいxMapを初期化してURLのないまま使用する
  @params   {Object xMap|Xps} targetObj
  @params   {Object xMap|Xps} referenceObj
  @params   {String} targetApp
        remaing|xpsedit|pman|sbdedit|pman_reName|console|login|app_template
  @params   {Function} callback
        遅延初期化手続きの終了後に設定される追加手続き
remaping    旧形式のタイムシートエディタ
xpsedit     新形式タイムシートエディタ 統合後はこちらに統一
pman        プロダクト管理ブラウザ リネームツールの全機能を包括してこちらに統一を行う
pman_reName データブラウザ・リネームツール
sbdedit     ストーリーボード（コンテ）エディタ
console     UAFコンソール
login       
app_template
*/
xUI.init = function(targetObj,referenceObj,targetApp,callback){
    if(! targetApp) targetApp = (config.appIdf)?config.appIdf:'console';//
console.log("Init xUI as "+ targetApp);
console.log(targetObj);
console.log(referenceObj);
    xUI.app = targetApp;// remaping|xpsedit|pman|sbdedit|pman_reName|console|login|app_template...
//app確定時にアプリケーション個別テーブルのマージを行う
    if(config.app[xUI.app]){
        if (config.app[xUI.app].syncTable)  xUI.syncTable.mergeItems( config.app[xUI.app].syncTable );
        if (config.app[xUI.app].panelTable) xUI.panelTable.mergeItems(config.app[xUI.app].panelTable);
    };
    xUI.documents.init();
    if(xUI.app.match(/remaping|xsedit/)){
        console.log(this.XMAP.toString());
        console.log(this.XPS.toString());
    };
/*    documentsにオブジェクト渡し */
console.log(targetObj)
    var setResult = this.documents.setContent(targetObj,referenceObj);//ターゲットの判定はメソッドに委ねる
console.log(this.activeDocument);

    if(xUI.app.match(/remaping|xpsedit/)){
console.log(this.XMAP.toString());
console.log(this.XPS.toString());
//    if((setResult)&&(referenceObj)&&(referenceObj instanceof Xps)){this.documents[xUI.activeDocumentId].referenceDocument=referenceObj}

/** 以下は  Xmapに対しての拡張
    xMap コントロールは分離可能に？
    acriveDocumentIdは、以下の遷移をする
    0   ドキュメントの代表となるxMap
        xMapは１番以降のドキュメントにはならない
    1~  0番ドキュメントに含まれるCSCiにアタッチされるXpst
        一個以上、複数

以下の拡張分は xUI.Document.activate メソッドに移行して削除

    this.XMAP = this.documents[0].content;               //編集対象のxMap バッファの切替はactiveteメソッドに移動
    this.XPS  = this.documents[1].content;               //XPSを参照する編集バッファ バッファの切替はactiveteメソッドに移動
    this.XPS.parseXps(this.documents[1].content.toString(false));//XPSを参照する編集バッファ バッファの切替はactiveteメソッドに移動

    this.activeDocumentId = 1;//仮設プロパティ マルチシート拡張を行った後にシートの切り替えを行うようになる

    this.tabCount=this.documents.length;

    this.activeDocument     =  this.documents[this.activeDocumentId];

    this.sessionRetrace = -1;//this.activeDocument.settionRetrace;//                   //管理上の作業セッション状態
    this.referenceXPS=new nas.Xps(5,nas.SheetLength+':00.');           //参照用Xps初期値 */

/**
引数に参照オブジェクトが渡されていたら、優先して解決
    マルチステージ拡張実装後、直接指定された参照ステージは、初期化時のみ優先 
    参照用XPSは初期化の引数で与える（優先）
    初期化時点で参照Xpsが与えられなかった場合は、XPSに含まれる参照ステージの内容
    XPS内のステージストアにある現行ステージの前段のステージを利用する
    セットアップのタイミングはUIの初期化以降に保留される
*/
        if ((typeof referenceObj != "undefined") && (referenceObj instanceof Xps)){
            this.referenceXPS=referenceObj;
        };
/**
    参照Xpsのうち表示させる種別をプロパティ名の配列で与える
    キーワード機能未実装:
        "all"=["replacement","timing","camerawork","effect","still","dialog","sound"],
        "cell(スチル含む)"=["timing","still"]
        "replacement",
        "timing",
        "camerawork",
        "effect",
        "still",
        "dialog",
        "sound"
 */
    this.referenceLabels=new Array();   //表示させるトラックのID配列（後ほど初期化）
    this.referenceView=["timing","cell","replacement"];      
    this.refRegex=new RegExp(xUI.referenceView.join("|"));


    };// for xMap&Xps

/* 
    以下UI動作制御変数 共用部分（アプリによっては使わない環境変数を含む）

    app remaping|xpsedit

    viewMode    ページ単位表示か又は全体を1ページ1カラムで表示させるかのフラグ
        Scroll    Compact  (by scroll)
        PageImage WordProp (by page)
    uiMode      編集/管理/閲覧モードのフラグ
        browsing
            サーバ上のデータを開いて内容をブラウズしている状態
            書込／変更は禁止
        production
            作業中  他ユーザはproductionに移行できない
        management
            管理中  カットのプロパティが変更できるが、内容は編集できない
    viewOnly    編集禁止（データのreadonlyではなくUI上の編集ブロック）
*/
    this.restriction = false;            // 操作制限フラグ boolean
    this.viewMode    = config.ViewMode;  // 表示モード Compact/WordProp Scroll/Page
    this.ipMode      = config.InputMode; // 入力
    this.uiMode      = 'browsing';       // ui基本動作モード
                                         // production/management/browsing
    this.viewOnly    = false;            // 編集禁止フラグ
    this.hideSource  = false;            // グラフィック置き換え時にシートテキストを隠す
    this.showGraphic = true;             // 置き換えグラフィックを非表示  ＝  テキスト表示
//if(appHost.platform=="AIR") this.showGraphic    = false;
    this.onSite   = false;           // Railsサーバ上での動作時サーバのurlが値となる

    this.currentUser = new nas.UserInfo(config.myName); // 実行ユーザをmyNameから作成
    this.recentUsers = new nas.UserInfoCollection(config.myNames);//最近のユーザ情報

    xUI.sync("recentUsers");
/*
    recentUsers 配列の要素は、UserInfo オブジェクト
    myNamesは、アカウント文字列を要素とする配列
    ユーザインフォコレクションの構造変更で配列ベースでなく  メンバー配列を持ったオブジェクトに更新
*/

//以下 remaping||xpsedit
  if(xUI.app.match(/remaping|xpsedit/)){
    this.spinValue   = config.SpinValue;       // スピン量
    this.spinSelect  = config.SpinSelect;      // 選択範囲でスピン指定
    this.sLoop       = config.SLoop;           // スピンループ
    this.cLoop       = config.CLoop;           // カーソルループ

//    this.utilBar     = true;            // サブツールバーの初期状態
    this.SheetLength    = config.SheetLength;  // タイムシート1枚の表示上の秒数 コンパクトモードではシート長が収まる秒数に強制される
//コンパクトモード時はこのプロパティとcolsの値を無視するように変更
    this.SheetWidth= this.XPS.xpsTracks.length; // シートの幅(編集範囲)

//シートのルックを求めるためのプロパティ
    this.dialogCount    = 1;    // セリフトラックの総数
    this.soundCount     = 0;     // 音響トラックの総数
    this.stillCount     = 0;    // 静止画トラックの総数
    this.timingCount    = 4;    // 置換トラックの総数
    this.stageworkCount = 0;    // ステージワークトラックの総数
    this.sfxCount       = 0;    // 効果トラックの総数
    this.cameraCount    = 0;    // カメラトラックの総数
    this.dialogSpan     = 1;    // シート左にあるセリフ・音響トラックの連続数
    this.cameraSpan     = 0;    // シート右の非置き換えトラックの連続数
    this.timingSpan     = this.XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+1);//カメラ（非画像トラックの合計）
    this.SheetWidth     = this.XPS.xpsTracks.length;
    this._checkProp();


    this.PageLength         =this.SheetLength*Math.ceil(this.XPS.framerate); //1ページの表示コマ数を出す
//    1秒のコマ数はドロップを考慮して切り上げ
    this.cPageLength        =Math.ceil(this.XPS.framerate);                  //カラム長だったけど一秒に変更
    this.sheetSubSeparator  = config.SheetSubSeparator;                      // サブセパレータの間隔
    this.PageCols           = config.SheetPageCols;                             // シートのカラム段数。
                //    実際問題としては１または２以外は使いづらくてダメ
                //    コンパクトモードでは1段に強制するのでこの値を無視する
    this.fct0               = config.Counter0;                                  // カウンタのタイプ
    this.fct1               = config.Counter1;                                  // 二号カウンタはコンパクトモードでは非表示

    this.favoriteWords      = config.FavoriteWords;                             // お気に入り単語
    this.footMark           = config.FootMark;                                  // フットマーク機能フラグ
    this.autoScroll         = config.AutoScroll;                                // 自動スクロールフラグ
    this.scrollStop         = false;                                            // 自動スクロール抑制フラグ
    this.tabSpin            = config.TabSpin;                                   // TABキーで確定操作

    this.noSync             = config.NoSync;                                    // 入力同期停止

    this.blmtd              = config.BlankMethod;                               // カラセル方式デフォルト値
                //["file","opacity","wipe","expression1","expression2"];
    this.blpos              = config.BlankPosition;                             // カラセル位置デフォルト値
                //["build","first","end","none"]
    this.fpsF               = config.FootageFramerate;                          // フッテージのフレームレート
                //コンポサイズdefeult
    this.dfX                = config.defaultSIZE.split(",")[0];                 // コンポサイズが指定されない場合の標準値
    this.dfY                = config.defaultSIZE.split(",")[1];                 //
    this.dfA                = config.defaultSIZE.split(",")[2];                 //
    this.timeShift          = config.TimeShift;                                 // 読み込みタイムシフト
  }

    if(document.getElementById('iNputbOx')){
//systemCLipboardに対するイベント設定
// ------------------------------------------------------------
// カット操作が行われると実行されるイベント
//  固定入力エレメントに対するイベントリスナは将来的に変更の寄りあり
// ------------------------------------------------------------
window.addEventListener("cut" , function(evt){
    if(evt.target===document.getElementById('iNputbOx')){
        evt.preventDefault();    // デフォルトのカット処理をキャンセル
        var data_transfer = (evt.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
        data_transfer.setData( "text" , xUI.yankBuf.toString() );// 文字列データを格納する
    }
});
window.addEventListener("copy" , function(evt){
    if(evt.target===document.getElementById('iNputbOx')){
        evt.preventDefault();    // デフォルトの処理をキャンセル
        var data_transfer = (evt.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
        data_transfer.setData( "text" , xUI.yankBuf.toString() );// 文字列データを格納する
    }
});
window.addEventListener("paste" , function(evt){
    if(evt.target===document.getElementById('iNputbOx')){
        var data_transfer = (evt.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
console.log('event paste');
        var myContent = data_transfer.getData( "text" );// 文字列データを取得
        if ((myContent.indexOf('\n')>=0)||(myContent.indexOf('\t')>=0)){
console.log(myContent);
            evt.preventDefault();    // デフォルトの処理をキャンセル
            xUI.yank(myContent);
console.log(xUI.yankBuf);
            xUI.paste();            
        }
    }
});
    };
//
// ============================================= yankバッファ関連
/* ヤンクバッファは
基本的に comma、改行区切りのデータストリーム
または、各編集ドキュメントの編集単位オブジェクトの配列を持つ

*/
    this.yankBuf            ={body:"",direction:""};
    this.yankBuf.valueOf=function(){return this.body;}
    this.yankBuf.toString=function(){
//コンマ区切りのデータをタブ区切りに変換
        var matrixArray=this.body.split('\n');
        for (var rix=0;rix<matrixArray.length;rix++){matrixArray[rix]=matrixArray[rix].split(",");};
        var transArray=[];
        for(var f=0;f<matrixArray[0].length;f++){
            transArray[f]=[];
            for (var r=0;r<matrixArray.length;r++){
            transArray[f].push(matrixArray[r][f]);
            }
            transArray[f]=transArray[f].join('\t');
        }
        return transArray.join('\n');
    }
//undo関連
    this.flushUndoBuf();


// xpst 保存ポインタ関連
  if(xUI.app.match(/remaping|xpsedit/)){
//ラピッド入力モード関連
    this.eXMode = 0;         //ラピッドモード変数(0/1/2/3)
    this.eXCode = 0;         //ラピッドモード導入キー変数
//シート入力関連
    this.eddt   = "";        //編集バッファ
    this.edchg  = false;     //編集フラグ
    this.edmode = 0;          //編集操作モード  0:通常入力  1:ブロック移動  2:区間編集
    this.floatSourceAddress = [0,0];//選択範囲及び区間移動元アドレス
    this.floatDestAddress   = [0,0];//同移動先アドレス
    this.selectBackup       ;//カーソル位置バックアップ
    this.selectionBackup    ;//選択範囲バックアップ
//    this.spinBackup         ;//スピン量をバックアップ
//区間編集バッファ
    this.floatTrack         ;//区間編集対象トラック
    this.floatSectionId     ;//編集対象セクションのID（オブジェクトそのものだと変動するのでIDのみ）
    this.floatTrackBackup   ;//区間編集トラックバックアップ（加工参照用）
    this.floatSection       ;//編集ターゲット区間
    this.floatUpdateCount   ;//フロート編集中の更新カウント
//セクション操作変数
    this.sectionManipulateOffset = ['tail',0];//区間編集ハンドルオフセット
    
//    アクセス頻度の高いDOMオブジェクトの参照保持用プロパティ
    this["data_well"]       = document.getElementById("data_well");//データウェル
    this["snd_body"]        = document.getElementById("snd_body");//音声編集バッファ
  };

///////////
//データ配列に対してUIオブジェクトにフォーカス関連プロパティ設置
//for xpst
                //[カラム,フレーム]
                //初期値は非選択状態
    this.Select    =[1, 0];
                //シート上のフォーカスセル位置
                //選択位置・常にいずれかをセレクト
    this.Selection    =[0, 0];
                //選択範囲・ベクトル正方向=右・下
/*  extension for xmap */
// xmapExtension();
//xUI.reDrawDocumentTab();
//
// =============================================メニュー関連
//*      初期化手順の最後でメニュー関連の初期化を行う      *
//非同期処理が多いのでこの手続群の最後に追加手続きを実行
    if(!xUI.contextMenu) xUI.contextMenu = $('#contextMenu');
//mainMenuDB初期化(全アプリ共用)
    $.ajax({
        url: 'template/menu/nas_menuItems.text',
        dataType: 'text',
        success: function(result){
          if(nas.menuItems.parseConfig(result)){
              xUI.uiMenuInit(callback);
          };
        }
    });
//メニュー関連イベントリスナの初期化はメニュー初期化のあとに実行する必要性あり
console.log('addEventListener');
//    ドキュメント上の基本メニューUI イベントリスナ初期化
//アイコンバーメニュー開閉
    if(document.getElementById('menuIcon')){
        document.getElementById('menuIcon').addEventListener('click',(e)=>{console.log(e); xUI.sWitchPanel()});
//ibCPmenu
        document.getElementById('toolbarPost').children[0].children[0].addEventListener('click',()=> xUI.ibCP.switch(-1));
        document.getElementById('ibCmenuSwitch').addEventListener('click',(e)=> xUI.ibCP.switch('',e));//アイコンバーメニュー前後送り
        document.getElementById('ibCmenuSwitch').addEventListener('mousemove',(e)=>{
            xUI.ibCP.setMenu(e);
        });//アイコンバーセレクタ・アイコン切替

        document.getElementById('loginstatus_button').addEventListener('click',()=>xUI.setCurrentUser());//ユーザ登録
    };
};
// xUI.init()//
//    xUIオブジェクト初期化終了 以下メソッド
/*
    メニュー初期化メソッド
 */
xUI.uiMenuInit = function(callback){
    if(xUI.app){
//  初期化
        if(config.menuset[xUI.app].applicationMenu) $.ajax({
            url: config.menuset[xUI.app].applicationMenu,
            dataType: 'text',
            success: function(result){
                nas.applicationMenuList = xUI.extendOpenmenu(result);
//    必要ならばメインプルダウンメニューを初期化
                if(appHost.platform != 'Electron'){
                    xUI.buildMenuHTML(false,false,'WEB');
                    xUI.sWitchPanel('menu');
                };
//contextMenuList初期化
                if(config.menuset[xUI.app].contextMenu) $.ajax({
                    url: config.menuset[xUI.app].contextMenu,
                    dataType: 'text',
                    success: function(result){
                        nas.contextMenuList = xUI.extendOpenmenu(result);
//    コンテキストメニュー初期化
                        xUI.buildMenuHTML(nas.contextMenuList,false,'CONTEXT');//
//iconBarMenuList初期化
                        if(config.menuset[xUI.app].iconBarMenu) $.ajax({
                            url: config.menuset[xUI.app].iconBarMenu,
                            dataType: 'text',
                            success: function(result){
                                nas.iconBarMenuList = xUI.extendOpenmenu(result);
//    アイコンポストメニュー初期化
                                xUI.buildMenuHTML(nas.iconBarMenuList,false,'ICON');

                                if(callback instanceof Function) callback();
//console.log(" ================= menu 初期化終了");
                            }
                        });
                    }
                });
            }
        });
    };
    xUI.contextMenuRegion = {};
    for(var prp in nas.menuItems ){
        if((nas.menuItems[prp].type == 'window')&&(nas.menuItems[prp].region)){
            xUI.contextMenuRegion[nas.menuItems[prp].region] = false;
        };
    };
console.log(xUI.contextMenu);
}
/* 外部アプリケーションを拡張する */
xUI.extendOpenmenu = function(menuList){
    if(menuList.match(/\s*openWithExternalTool/)){
        var content = [""];
        for(var ap in config.extApps.members){
            content.push("\topenWithExternalTool"+ap);
        };
        content.push("");
        return menuList.replace(/\s*openWithExternalTool/g ,content.join("\n"));
    };
    return menuList;
}
/* ============================================================================ */
/**
 * @params {Boolean}   allowNoValue
 * @params {Function}  callback
 *    作業ユーザを設定するダイアログ
 *    カレントの作業ユーザがあれば表示
 *    変更候補のリストがあればそれからの選択が可能
 *    基本的にユーザなしのオペレーションは認められないので、必ず何らかの情報が必要
 *    情報なしでクローズするための強制オプションは設定するが使用しないこと
 */
xUI.setCurrentUser = function(allowNoValue,callback){
        if(typeof allowNoValue == 'undefined') allowNoValue = false;
        var currentUser=(xUI.currentUser)? xUI.currentUser.toString(true) : nas.CURRENTUSER.toString(true);
        var msg =[];
        msg.push( "\n current user / " + currentUser ) ;
        msg.push( localize('dmAskUserinfo')+
            "<hr><input id='confirmHandle' type='text' autocomplete='on' list='' size=48 value='"+
            ((xUI.currentUser.handle)? xUI.currentUser.handle:'') +
            "'> : Handle<br><input id='confiemEmail' type='text' autocomplete='on' list='' size=48 value='"+
            ((xUI.currentUser.email)? xUI.currentUser.email:'')+
            "'> : e-mail<hr>");

//        "\n\n ハンドル:handle\nメールアドレス:email@example.com \n";
//        msg.push(
//            "<hr><input id='confirmUID' type='text' autocomplete='on' list='recentUsers' size=48 value='"+currentUser+"'>"
//        );//初期値カラ
        nas.showModalDialog(
            "confirm",
            msg,
            localize('userInfo'),
            '',
            function(){
                if(this.status==0){
                    var handle = document.getElementById('confirmHandle').value;
                    var email  = document.getElementById('confiemEmail').value;
                    if((!(allowNoValue))&&(!((handle)&&(email)))){
//再帰呼び出し
console.log(((handle)||(email))? true:false);
                        xUI.setCurrentUser(false);
                    }else{
console.log([handle,email].join(':'));
                        var newName = new nas.UserInfo([handle,email].join(':'));
//nas.pmdb.usersを検索して一致ユーザが存在すればそのユーザと置換
//存在しない場合は、nas.pmdb.usersにエントリを追加 pmdbの変更フラグを立てる
                        var entry = nas.pmdb.users.entry(newName);
                        if(!(entry)){
                            var entryIdx = nas.pmdb.users.addMember(newName);
                            if(entryIdx >= 0){
                                nas.pmdb.modified = true;
                                xUI.currentUser = newName;
                            }else{
//不正オブジェクト・再度エントリをうながす
                                xUI.setCurrentUser(false);
                            };
                        }else{
                            xUI.currentUser = entry;
                        }
//                        if(newName.handle) xUI.currentUser = newName;
                    };
                    nas.CURRENTUSER.parse(xUI.currentUser);//設定済のユーザを同期
console.log(xUI.currentUser);
console.log(this.status);
//ユーザ表示
                    if(xUI.currentUser){
//    document.getElementById("loginuser").innerText = xUI.currentUser.toString(true);//
    if(xUI.recentUsers) xUI.recentUsers.addMember(xUI.currentUser);
    if(xUI.sync instanceof Function){
                xUI.sync("recentUsers");
                xUI.sync("updateUser");
                xUI.sync("currentUser");
    };
                    };
                };
                if(callback instanceof Function) callback(xUI.currentUser);
            },
            false,[100,100]
        );
    document.getElementById("nas_modalInput").focus();
}
/**
    現在編集対象のXPS・referenceXPSをチェックしてxUIのシートビュープロパティを更新
    どちらか単独更新の場合でも画面全体を再描画する必要があるので、このルーチンは等しく実行される
*/
xUI._checkProp = function(){
//リセット
    this.tcCount        = 0;    // タイムコードトラックの総数
    this.dialogCount    = 0;    // 音声トラックの総数
    this.soundCount     = 0;    // 音響トラックの総数
    this.stillCount     = 0;    // 静止画トラックの総数
    this.timingCount    = 0;    // 置換トラックの総数
    this.stageworkCount = 0;    // ステージワークトラックの総数
    this.sfxCount       = 0;    // 効果トラックの総数
    this.cameraCount    = 0;    // カメラトラックの総数
    this.noteCount      = 0;    // フレーム注釈トラック総数
//    this.dialogSpan     = 0;    // 初出の台詞音声トラック数
//    this.soundSpan      = 0;    // 初出の台詞音響トラック数
//    this.cameraSpan     = 0;    // 末尾エリアの幅

//タイムコードトラックはxpsTracksに含まれないので先にareaOrderから取得
    xUI.XPS.xpsTracks.areaOrder.forEach(function(e){if(e.timecode != 'none') xUI.tcCount += (e.timecode == 'bodth')? 2:1;});
//カウント
    for(var idx=0;idx<(this.XPS.xpsTracks.length-1);idx++){
        this.XPS.xpsTracks[idx].sectionTrust=false;
        switch(this.XPS.xpsTracks[idx].option){
            case "comment"    : break;//終端レコードはコメント予約なので判定をスキップ
            case "timecode"   :
            case "note"       : this.noteCount++    ;break;//trackNote トラックコメントはエリアを作らない
            case "sound"      : this.soundCount++   ;break;
            case "dialog"     : this.dialogCount++  ;break;
            case "still"      : this.stillCount++   ;break;
            case "effect"     : ;
            case "sfx"        : this.sfxCount++     ;break;
            case "stage"      :
            case "stagework"  :
            case "geometry"   : this.stageworkCount++;break;
            case "camerawork" : ;
            case "camera"     : this.cameraCount++   ;break;
            case "cell"       : ;
            case "replacement": ;
            case "timing"     : this.timingCount++   ;break;
            default:          ;// NOP
        };
//書式を形成するエリアを計算する

/*
    areaOrderテーブルとtrackSpecを比較して
*/
//表示領域左側の固定列をtrackSpecから確定

/*
//表示域左側で連続した音声トラックの数を控える（最初に出てきたXpsAreaOption が sound以外のトラックの位置で判定 ）
//        if((Xps.AreaOptions[this.XPS.xpsTracks[idx].option] != "sound")&&(this.dialogSpan+this.soundSpan > 0)){
//            this.dialogSpan = this.dialogCount;
//            this.soundSpan  = this.soundCount;
//仕様変更によりxUI.dialogSpan+soundSpanは、役割を喪失のため削除予定
//        };// */
//フレームコメントの左側の連続したcamera/sfxトラックの数を控える(最後のcamera/sfx/effect/geometry以外のトラックの位置から計算)
        if((this.XPS.xpsTracks[idx].option != "camera")&&(this.XPS.xpsTracks[idx].option!="geometry")&&(this.XPS.xpsTracks[idx].option!="sfx")&&(this.XPS.xpsTracks[idx].option!="effect")){this.cameraSpan=this.XPS.xpsTracks.length-idx-2};
//カウントする、ただしこのルーチンはこの後プロパティに変換してレイヤ数が変わるたびにプロパティとして変更するように変更されるべき。
    };
//
//    this.timingSpan = this.XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+this.soundSpan+1);//カメラ（非画像トラックの合計）
    this.SheetWidth = this.XPS.xpsTracks.length;
/*
参照するトラック数をスイッチをもとに算出
*/
    this.referenceLabels.length = 0;//クリア
    this.refRegex        = new RegExp(xUI.referenceView.join("|"));//更新
    for(var ix=0;ix<xUI.referenceXPS.xpsTracks.length;ix++){
        var currentTrack=xUI.referenceXPS.xpsTracks[ix].option;
        if(currentTrack.match(this.refRegex)) {
            this.referenceLabels.push(ix);//array of index
        };
    };
};
/**
    @params {String} col
    setBackgroundColor(bgColor)
    背景色を色コードで指定する
    または 色相,彩度,明度
    または 色コード,彩度,明度
    または 色コード,明度
*/
xUI.setBackgroundColor = function(col){
    col = (col)? col : config.SheetLooks.SheetBaseColor;
    if(String(col).trim().indexOf("#") != 0){
        col = nas.HTML.ColorName[col];
    };
    if(!col) col = "#000000";
    var SheetLooks = config.SheetLooks;
    SheetLooks.SheetBaseColor = col;
    xUI.applySheetlooks(SheetLooks);
    xUI.footstampPaint();
}
/*
 *  @params {Boolean|String}   stat
 *  モバイル環境を設定|解除する
 *  引数は、appHost.platform
 */
xUI.setMobileUI = function(stat){
    if(stat){
//標準のドラグスクロールを停止
//iNputbOx
//        document.getElementById("iNputbOx").disabled = true;
//        document.getElementById("iNputbOx").style.display = 'none';
//optionPanelTbx
        Array.from(document.getElementsByClassName('optionPanelTbx')).forEach(function(e){
            nas.HTML.addClass(e,'optionPanelTbx-mobile');
        });
        Array.from(document.getElementsByClassName('tBSelector')).forEach(function(e){
            nas.HTML.addClass(e,'tBSelector-mobile');
        });
        Array.from(document.getElementsByClassName('skb_key')).forEach(function(e){
            nas.HTML.addClass(e,'skb_key-mobile');
        });
//optionPanleFloat
        Array.from(document.getElementsByClassName('optionPanelFloat')).forEach(function(e){
            nas.HTML.addClass(e,'optionPanelFloat-mobile');
        });
        Array.from(document.getElementsByClassName('iconButton')).forEach(function(e){
            nas.HTML.addClass(e,'iconButton-mobile');
        });
//アイコンボタンを使用しているoptionPanel類を調整
        nas.HTML.addClass(document.getElementById('optionPanelPaint'),'optionPanelPaint-mobile');
        nas.HTML.addClass(document.getElementById('optionPanelSnd'),'optionPanelSnd-mobile');
//メニュー高さ調整
        nas.HTML.setCssRule('#pMenu','height:24px;');
    }else{
//標準のドラグスクロールを停止解除
//マウスドラッグスクロールの停止
//    nas.HTML.mousedragscrollable.movecancel = false;
//タッチスクロール・ホイルスクロールの停止
//    document.removeEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//    document.removeEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
//iNputbOx
//        document.getElementById("iNputbOx").disabled = false;
//        document.getElementById("iNputbOx").style.display = 'inline';
//optionPanelTbx
        Array.from(document.getElementsByClassName('optionPanelTbx')).forEach(function(e){
            nas.HTML.removeClass(e,'optionPanelTbx-mobile');
        });
        Array.from(document.getElementsByClassName('tBSelector')).forEach(function(e){
            nas.HTML.removeClass(e,'tBSelector-mobile');
        });
        Array.from(document.getElementsByClassName('skb_key')).forEach(function(e){
            nas.HTML.removeClass(e,'skb_key-mobile');
        });
//optionPanleFloat
        Array.from(document.getElementsByClassName('optionPanelFloat')).forEach(function(e){
            nas.HTML.removeClass(e,'optionPanelFloat-mobile');
        });
        Array.from(document.getElementsByClassName('iconButton')).forEach(function(e){
            nas.HTML.removeClass(e,'iconButton-mobile');
        });
//optionPanelPaint
        nas.HTML.removeClass(document.getElementById('optionPanelPaint'),'optionPanelPaint-mobile');
        nas.HTML.removeClass(document.getElementById('optionPanelSnd'),'optionPanelSnd-mobile');
//メニュー高さ調整
        nas.HTML.setCssRule('#pMenu','height:20px;');
    };
//    xUI.syncIconbarButton();
}
/*
 *  ツールバースクロールボタン表示制御
 */
xUI.syncIconbarButton = function(){
    [['ibMRibbon','ibMibSelect'],['ibMUtlRibbon','ibMtbSelect']].forEach(function(e){
        var bar   = document.getElementById(e[0]);
        var barBt = document.getElementById(e[1]);
        if(bar.scrollWidth > bar.clientWidth){
            barBt.style.display = 'inline';
        }else{
            barBt.style.display = 'none';
        };
    });
}
/*ボタンバースクロール*/
xUI.buttonbarScrollTo = function(bar,count){
    var buttonSpan = document.getElementById('ibMredo').offsetLeft - document.getElementById('ibMundo').offsetLeft;
    bar.scrollTo(bar.scrollX+(count*buttonSpan),0);
}
/*
    スクロール時にボタン幅単位に移動をスナップさせる
    イベントリスナに登録する
    document.getElementById('ibMRibbon').addEventListener('scroll',xUI.buttonbarOnScroll)
    document.getElementById('ibMUtlRibbon').addEventListener(xUI.buttonbarOnScroll)
*/
xUI.buttonbarOnScroll = function(){
    var buttonSpan = document.getElementById('ibMredo').offsetLeft - document.getElementById('ibMundo').offsetLeft;
    this.scrollTo(Math.round(this.scrollLeft/buttonSpan)*buttonSpan,0);
}
/**
    @params {Boolean}    byUndo
    @params {Function}   callback
    ドキュメントフォーマットオブジェクトが持っている情報をUIに反映させる
    フォーマットエディタがアクティブ｜ドキュメント情報パネルがアクティブな場合は、UNDOなし
    それらの開いていない場合は、UNDO付きで更新が行われる
    ||($('#optionPanelScn').isVisible())
    タイムシート書式が変更になる場合でかつトラック数の増減がある場合調整を行うことができる
    動作キャンセルされない限り、新規フォーマットに合わせて増減して調整される
    超過トラックは切り捨て、不足トラックは空トラックで補填
    referenceXPSに関しても、同様の調整が実施されることに注意
*/
xUI.applyDocumentFormat = function(byUndo,callback){
    if(!(byUndo)||(documentFormat.active)){
console.log('applyDocumentFormat widthout UNOD :'+ documentFormat.FormatName);
        xUI.applySheetlooks(documentFormat.toJSON());
        if(callback instanceof Function) callback();
    }else{
console.log('applyDocumentFormat width UNOD :'+ documentFormat.FormatName)
        var newData = new nas.Xps();
        newData.parseXps(xUI.XPS.toString(false));
        newData.parseSheetLooks(documentFormat.toJSON());
        xUI.put(newData,undefined,false,callback);
//        xUI.applySheetlooks();
// putメソッドにXpsドキュメントを与えた場合resetsheetがSheetLooksを呼び出すので不要
//        xUI.resetSheet()
    };
//    documentFormat.adjustTrack();
}
/**
 *  @params {Object|String} sheetLooks
 *  @returns {Object}
 *        sheetlooks
 *
 *   インターフェースルック反映・適用
 *   カラー・及びシートルックを更新
 *   分離のみ  暗色のテーマにはまだ対応していないので注意  2017.02.04
 *      書式オブジェクトがアプリテーマと独立の情報に変更されたためダークモードの影響はないものとする 2024
 *   標準状態で、右の2つの書式情報は同じオブジェクトを指す xUI.sheetLooks === xUI.XPS.sheetLooks
 *      Object sheetLooksまたは シリアライズ文字列を与えて、ドキュメント及び画面に反映する
 *      引数が与えられなかった|不正な引数が与えられた 場合ドキュメントの持つsheetLooksを使用してルックの更新を行う
 *  トラック数、配置変更を伴うのでtrackSpecの反映はこのメソッドでは行われない
 *  トラック配置変更の際は、あらかじめドキュメントにsheetLooksを適用した後にresetSheetで画面をリフレッシュする必要がある
 *  このプロシジャはresetSheetを呼び出さない
 *  UNDOも考慮されていないので、UNDO処理が必要な場合はこの別に呼び出しを行う必要がある
 *
 *  主にresetSheetから呼び出しを受けるが、それ以外でも呼び出しは可能
 *  処理が多いため、このメソッドの呼び出しはなるべく控えるのが良い
 *  必要ならば各サブプロシジャを呼んだほうが負担は減る
 */
xUI.applySheetlooks = async function(sheetLooks,callback){
//引数があればドキュメント・アプリのプロパティを更新する
console.log(sheetLooks);
    if(typeof sheetLooks != 'undefined'){
//================================ sheetLooks引数が存在する場合はドキュメントに適用
        xUI.XPS.parseSheetLooks(sheetLooks);
    };
console.log(xUI.XPS.documentMode);
    if(!(xUI.XPS.documentMode)){
//フォーマットバージョンによりdocumentModeプロパティがない場合、アプリ側のモードでドキュメントを上書きする（ここではモード変更はサポートされない）
        xUI.XPS.documentMode = ({PageImage :'pageImage',WordProp :'pageImage',Scroll :'scroll',Compact :'scroll'})[xUI.viewMode];//刈り込み予定
    };
//================================ ｘUI.sheetLooks プロパティを更新
console.log(XPS);
console.log(SheetLooks)
console.log(xUI.sheetLooks)
console.log(xUI.XPS.sheetLooks)
    if(xUI.sheetLooks !== xUI.XPS.sheetLooks) xUI.sheetLooks = xUI.XPS.sheetLooks;
console.log(JSON.stringify(xUI.sheetLooks,0,2));
//================================ シートカラーcss設定
    xUI.applyDocumentColor();
//================================ 書式配置適用
    xUI.applySheetHeader();
//================================ タイムシートセルハイトcss設定
    xUI.applySheetCellHeight(xUI.sheetLooks.SheetColHeight);
//================================ タイムシートトラック幅css設定
    xUI.applySheetTrackWidth();
//================================ タイムシートマージン・カラー等をcss設定
    xUI.setAppearance();
//================================ footStampを再描画してシートセルの背景を更新する
    xUI.footstampPaint();
//================================ canvasPaintの調整
    xUI.canvasPaint.backdropColor = xUI.sheetbaseColor;
    xUI.canvasPaint.pencilColorB  = xUI.sheetbaseColor;
    xUI.canvasPaint.syncColors();
    if(callback instanceof Function) calllback();
    return xUI.sheetLooks;
}
/*
    xUI.sheetLooksを参照してドキュメントのカラーデータを構築・反映
    引数なし
    戻り値なし
*/
xUI.applyDocumentColor = function(){
    if (! String(xUI.sheetLooks.SheetBaseColor).match(/^#[0-9a-f]+/i)){xUI.sheetLooks.SheetBaseColor = nas.colorAry2Str(nas.colorStr2Ary(xUI.sheetLooks.SheetBaseColor));};

//編集不可領域の背景色 背景色を自動設定  やや暗  これは初期状態で対向色を設定してその間で計算を行うように変更

    xUI.sheetbaseColor     = xUI.sheetLooks.SheetBaseColor;                                        //タイムシート背景色
    var baseColor           = nas.colorStr2Ary(xUI.sheetbaseColor);  //基本色をRBGのまま配列化
// 輝度出してフラグ立てる
    xUI.sheetbaseDark      = (((76*baseColor[0]+150*baseColor[0]+29*baseColor[0])/255) > 0.3)? false:true;//仮のしきい値0.3

    xUI.sheetTextColor     = xUI.sheetLooks.SheetTextColor;//基本テキストカラー

    xUI.sheetblankColor    = nas.colorAry2Str(mul(nas.colorStr2Ary(xUI.sheetbaseColor),.95)); //編集不可領域の背景色
    xUI.sheetborderColor   = nas.colorAry2Str(mul(nas.colorStr2Ary(xUI.sheetbaseColor),.75)); //罫線基本色
    xUI.trackLabelColor    = xUI.sheetborderColor;//ラベルカラーは罫線色に変更

    xUI.footstampColor     = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.FootStampColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2));                        //フット/差分  スタンプの色 背景色との中間値
        xUI.inputModeColor.NORMAL  = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.SelectedColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2));                      //  ノーマル色
        xUI.inputModeColor.EXTEND  = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.RapidModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2))            ;//ラピッド入力
        xUI.inputModeColor.FLOAT   = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.FloatModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2))            ;//ブロック移動
        xUI.inputModeColor.SECTION = nas.colorAry2Str(mul( add (nas.colorStr2Ary(xUI.sheetLooks.SectionModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),.5))         ;//範囲先頭(編集中)
        xUI.inputModeColor.SECTIONtail = nas.colorAry2Str(mul( add (nas.colorStr2Ary(xUI.sheetLooks.SectionModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),.45))    ;//範囲末尾(編集中)
//      xUI.inputModeColor.SECTIONselection = nas.colorAry2Str( mul( add (nas.colorStr2Ary(sheetLooks.SectionModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),1));//範囲編集中

    xUI.selectedColor      = xUI.inputModeColor.NORMAL        ;//選択セルの背景色.NORMAL
    xUI.selectionColor     = xUI.sheetLooks.SelectionColor     ;//選択領域の背景色
    xUI.selectionColorTail = xUI.sheetLooks.SelectionColor     ;//選択領域末尾背景色(sectionTail)デフォルトは同色
    xUI.editingColor       = xUI.sheetLooks.EditingColor       ;//セル編集中のインジケータ
    xUI.selectingColor     = xUI.sheetLooks.SelectingColor     ;//セル選択中のインジケータ
//タイムライン・ラベル識別カラ－
    xUI.cameraColor = nas.colorAry2Str(div(add([0,1,0],mul(nas.colorStr2Ary(xUI.sheetbaseColor),6)),7));
    xUI.sfxColor    = nas.colorAry2Str(div(add([0,0,1],mul(nas.colorStr2Ary(xUI.sheetbaseColor),5)),6));
    xUI.stillColor  = nas.colorAry2Str(div(add([1,0,0],mul(nas.colorStr2Ary(xUI.sheetbaseColor),6)),7));//タイムライン全体に着色

//中間色自動計算
        xUI.inputModeColor.NORMALspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
        xUI.inputModeColor.EXTENDspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
        xUI.inputModeColor.FLOATspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
        xUI.inputModeColor.SECTIONspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
//スピン選択状態
        xUI.inputModeColor.NORMALspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
        xUI.inputModeColor.EXTENDspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
        xUI.inputModeColor.FLOATspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
        xUI.inputModeColor.SECTIONspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
//選択状態
        xUI.inputModeColor.NORMALselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul(nas.colorStr2Ary(xUI.selectionColor),5)),6));
        xUI.inputModeColor.EXTENDselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul(nas.colorStr2Ary(xUI.selectionColor),5)),6));
        xUI.inputModeColor.FLOATselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul(nas.colorStr2Ary(xUI.sheetbaseColor),5)),6));
        xUI.inputModeColor.SECTIONselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.sheetbaseColor),5)),6));
//編集中
        xUI.inputModeColor.NORMALeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul([1,1,1],8)),9));
        xUI.inputModeColor.EXTENDeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul([1,1,1],8)),9));
        xUI.inputModeColor.FLOATeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul([1,1,1],8)),9));
        xUI.inputModeColor.SECTIONeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul([1,1,1],8)),9));

//フロートテキスト色
    xUI.floatTextColor =
    nas.colorAry2Str(div(add([0,0,0],mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));


//----------------------------------------------------------------------初期状態設定
    xUI.spinAreaColor          = xUI.inputModeColor.NORMALspin;
    xUI.spinAreaColorSelect    = xUI.inputModeColor.NORMALselection;
    xUI.sectionBodyColor       = nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));//?使わんかも
// ---------------------- ここまでカラー設定(再計算)
if(xUI.sheetbaseDark){
    xUI.sheetTextColor     = nas.colorAry2Str( div(sub([1,1,1],nas.colorStr2Ary(xUI.sheetTextColor)),2));
    xUI.trackLabelColor    = nas.colorAry2Str( div(sub([1,1,1],nas.colorStr2Ary(xUI.trackLabelColor)),2));

    xUI.sheetblankColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.sheetblankColor)));
    xUI.sheetborderColor   = nas.colorAry2Str(div(sub([1,1,1],nas.colorStr2Ary(xUI.sheetborderColor)),2));
//    xUI.footstampColor     = nas.colorAry2Str(div(nas.colorStr2Ary(xUI.footstampColor),2));
    xUI.footstampColor     = nas.colorAry2Str(div(add (sub([1,1,1],nas.colorStr2Ary(xUI.sheetLooks.FootStampColor)),nas.colorStr2Ary(xUI.sheetbaseColor)),2));
        xUI.inputModeColor.NORMAL  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMAL)));
        xUI.inputModeColor.EXTEND  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTEND)));
        xUI.inputModeColor.FLOAT   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOAT)));
        xUI.inputModeColor.SECTION = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTION)));
        xUI.inputModeColor.SECTIONtail = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONtail)));

    xUI.selectedColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectedColor)));
    xUI.selectionColor   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectionColor)));
    xUI.selectionColorTail   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectionColorTail)));
    xUI.editingColor      = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.editingColor)));
    xUI.selectingColor     = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectingColor)));
//タイムライン・ラベル識別カラ－
    xUI.cameraColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.cameraColor)));
    xUI.sfxColor       = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.sfxColor)));
    xUI.stillColor     = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.stillColor)));

//中間色自動計算
        xUI.inputModeColor.NORMALspin  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALspin)));
        xUI.inputModeColor.EXTENDspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDspin)));
        xUI.inputModeColor.FLOATspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATspin)));
        xUI.inputModeColor.SECTIONspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONspin)));
//スピン選択状態
        xUI.inputModeColor.NORMALspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALspinselected)));
        xUI.inputModeColor.EXTENDspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDspinselected)));
        xUI.inputModeColor.FLOATspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATspinselected)));
        xUI.inputModeColor.SECTIONspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONspinselected)));
//選択状態
        xUI.inputModeColor.NORMALselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALselection)));
        xUI.inputModeColor.EXTENDselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDselection)));
        xUI.inputModeColor.FLOATselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATselection)));
        xUI.inputModeColor.SECTIONselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONselection)));
//編集中
        xUI.inputModeColor.NORMALeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALeddt)));
        xUI.inputModeColor.EXTENDeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDeddt)));
        xUI.inputModeColor.FLOATeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATeddt)));
        xUI.inputModeColor.SECTIONeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONeddt)));

//フロートテキスト色
    xUI.floatTextColor = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.floatTextColor)));


//----------------------------------------------------------------------初期状態設定
    xUI.spinAreaColor          = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.spinAreaColor)));
    xUI.spinAreaColorSelect    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.spinAreaColorSelect)));
    xUI.sectionBodyColor       = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.sectionBodyColor)));
}
//================================================================================================================================ルックの適用
//タイムシート背景色をsheetbaseColorに設定
    document.body.style.backgroundColor     = xUI.sheetbaseColor;
    document.body.style.color               = xUI.sheetTextColor;
    nas.HTML.setCssRule('.qdr-left','background-color:'+xUI.sheetbaseColor,"both");//スクロールパッチ背景色
// サブテキストカラーを設定
    nas.HTML.setCssRule(".headerInfoLabel"  ,"color:"+xUI.trackLabelColor,"both");
    nas.HTML.setCssRule(".trackLabel"       ,"color:"+xUI.trackLabelColor,"both");
    nas.HTML.setCssRule('td.Sep'            ,'color:'+xUI.trackLabelColor,"both");
//    nas.HTML.setCssRule('td.ref'            ,'color:'+xUI.trackLabelColor,"screen");
    
//ヘッダとフッタの背景色をシート背景色で塗りつぶし
//    document.getElementById("fixedHeader").style.backgroundColor = xUI.sheetbaseColor;
    nas.HTML.setCssRule("#fixedHeader","background-color:"+xUI.sheetbaseColor,"both");

    nas.HTML.setCssRule("table.sheet","background-color:"+xUI.sheetbaseColor,"both");
    nas.HTML.setCssRule("table"      ,"border-color:"+xUI.sheetbaseColor,"both");
    nas.HTML.setCssRule("th"         ,"border-color:"+xUI.sheetborderColor,"both");
    nas.HTML.setCssRule("td"         ,"border-color:"+xUI.sheetborderColor,"both");

//    シートブランクの色設定
var mySeps=[
    "ltSep","dtSep","ntSep","ntSep",
    "lsSep","dsSep","nsSep","nsSep",
    "lnSep","dnSep","nnSep","nnSep"
];

for(var idx=0;idx<mySeps.length;idx++){
    nas.HTML.setCssRule("."+mySeps[idx]+"_Blank","background-color:"+xUI.sheetblankColor,'both')
};
//============================================= シートカラーcss設定
//  タブUIに  背景色を設定
    nas.HTML.setCssRule('.tabControll','backgroundColor:'+xUI.sheetbaseColor,'both');
    nas.HTML.setCssRule('#tabSelector','backgroundColor:'+xUI.sheetbaseColor,'both');

//============================================= シートカラーcss設定2
//    シート境界色設定
    nas.HTML.setCssRule('table'        ,'border-color:'+xUI.sheetbaseColor  ,'both');
    nas.HTML.setCssRule('.tlhead'      ,'border-color:'+xUI.sheetborderColor,'both');
    nas.HTML.setCssRule('.trackLabel'  ,'border-color:'+xUI.sheetborderColor,'both');
    nas.HTML.setCssRule('td.sheetbody' ,'border-color:'+xUI.sheetborderColor,'both');

/*
    nas.HTML.setCssRule('th.stilllabel'  ,'background-color:'+xUI.stillColor  ,"screen");
    nas.HTML.setCssRule('th.sfxlabel'    ,'background-color:'+xUI.sfxColor    ,"screen");
    nas.HTML.setCssRule('th.cameralabel' ,'background-color:'+xUI.cameraColor ,"screen");
// */
//================================ シートカラーcss設定2
//    if(this.footstampPaint) this.footstampPaint();
}
/*
 *    シートヘッダ部に書式を適用
 */
xUI.applySheetHeader = function(sheetLooks){
    if(typeof sheetLooks == 'undefined') sheetLooks = xUI.XPS.sheetLooks;
//シート・ページヘッダサイズを調整
    var selector = "";
    var top    = sheetLooks.HeaderMarginTop ;
    var left   = sheetLooks.HeaderMarginLeft;
    var height = sheetLooks.HeaderBoxHeight;
    var width  = 0;
    sheetLooks.headerItemOrder.forEach(function(e){
        width += (e[2] == 'hide')? 0 : e[1];//合計
    });
    (['div.sheetHeader','.pageHeader']).forEach(function(e){
        nas.setCssRule( e ,
        'left:'   + left   + sheetLooks.CellWidthUnit + ';' +
        'top:'    + top    + sheetLooks.CellWidthUnit + ';' +
        'height:' + height + sheetLooks.CellWidthUnit + ';' +
        'width:'  + width  + sheetLooks.CellWidthUnit + ';',
        'both'
    );});
    (['.pgHeader ','.pgHeader-label']).forEach(function(e){
        nas.setCssRule( e ,
        'height:' + height + sheetLooks.CellWidthUnit + ';',
        'both'
    );});
//内容を書き換え
    var headers = Array.from(document.getElementsByClassName('sheetHeader'));
    for (var i = 0 ;i < headers.length ; i++ ){
        if(headers[i] instanceof HTMLDivElement){
            var pageNumber = nas.parseNumber(headers[i].id);
            var pageCount = Math.ceil(xUI.XPS.duration()/xUI.XPS.sheetLooks.PageLength)
            headers[i].innerHTML = xUI.pageHeaderItemOrder(pageNumber, pageCount);
        };
    };
    sheetLooks.headerItemOrder.forEach(function(e){
        var type  = e[0];
        var width = e[1];
        var hide  = (e[2] == 'hide')? true:false;

        if(! hide) nas.setCssRule(
            documentFormat.headerItemWidthClass[type],
            'width:'+width + sheetLooks.CellWidthUnit + ';',
            'both'
        );
    });
//サインボックス・メモ欄
    (['HeaderSign','HeaderNote']).forEach(function(e){
        selector = (e == 'HeaderSign')? '.signArea':'.noteArea';
        nas.setCssRule(
            selector,
            'left:'+ sheetLooks[e][0] + sheetLooks.CellWidthUnit + ';'+
            'top:' + sheetLooks[e][1] + sheetLooks.CellWidthUnit + ';'+
            'height:'+(sheetLooks[e][3] - sheetLooks[e][1]) + sheetLooks.CellWidthUnit + ';'+
            'width:' +(sheetLooks[e][2] - sheetLooks[e][0]) + sheetLooks.CellWidthUnit + ';'
            ,'both'
        );
    });
}
/*TEST 
xUI.applySheetHeader()
*/
/*
    トラック幅を設定
    sheetLooksの値をcssに対して反映させる
*/
xUI.applySheetTrackWidth = function(sheetLooks){
    if(typeof sheetLooks == 'undefined') sheetLooks = xUI.XPS.sheetLooks;
/*
    sheetLooksの示すサイズは罫線を含むトータルなので罫線分の計算が必要
    tdはデフォルトで罫線を含んでいるか？
    各プロパティは Number|nas.UnitValue なので直接加算が可能
    UnitValueの場合は必ず単位と合致する仕様
*/
    var ofst = 0;
    var mySections=[
        ["th.tcSpan"        ,"width" ,(sheetLooks.TimeGuideWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.dialogSpan"    ,"width" ,(sheetLooks.DialogWidth          + ofst + sheetLooks.CellWidthUnit)],
        ["th.soundSpan"     ,"width" ,(sheetLooks.SoundWidth           + ofst + sheetLooks.CellWidthUnit)],
        ["td.colSep"        ,"width" ,(sheetLooks.ColumnSeparatorWidth + ofst + sheetLooks.CellWidthUnit)],
        ["th.referenceSpan" ,"width" ,(sheetLooks.ActionWidth          + ofst + sheetLooks.CellWidthUnit)],
        ["th.editSpan"      ,"width" ,(sheetLooks.SheetCellWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.timingSpan"    ,"width" ,(sheetLooks.SheetCellWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.stillSpan"     ,"width" ,(sheetLooks.StillCellWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.geometrySpan"  ,"width" ,(sheetLooks.GeometryCellWidth    + ofst + sheetLooks.CellWidthUnit)],
        ["th.sfxSpan"       ,"width" ,(sheetLooks.SfxCellWidth         + ofst + sheetLooks.CellWidthUnit)],
        ["th.cameraSpan"    ,"width" ,(sheetLooks.CameraCellWidth      + ofst + sheetLooks.CellWidthUnit)],
        ["th.framenoteSpan" ,"width" ,(sheetLooks.CommentWidth         + ofst + sheetLooks.CellWidthUnit)]
    ];
/*    cssにルールセットを追加する関数
    nas.HTML.setCssRule( セレクタ, プロパティ, 適用範囲 )
        セレクタ    cssのセレクタを指定
        プロパティ    プロパティを置く
        適用範囲    スタイルシートIDの配列、またはキーワード"screen""print"または"both"
 */
//トラックの幅を設定
/*    リスト
class=timelabel trackLabel
class=timeguide? 
class=dtSep
class=ntSep
class=colSep
class=layerlabelR trackLabel
class=layerlabel trackLabel
 */
    for(var idx=0;idx<mySections.length;idx++){
        nas.HTML.setCssRule( mySections[idx][0],mySections[idx][1]+":"+mySections[idx][2],"both");
    };
}
/*
    カラム高さを文字列で与えてシートセルの高さを設定する
    設定したシート列高を返す
*/
xUI.applySheetCellHeight = function(colHeight){
    if(typeof colHeight != 'undefined') xUI.sheetLooks.SheetColHeight = colHeight;
    if((xUI.sheetLooks.SheetColHeight)&&(document.getElementById('page_1'))){
//カラムあたりのフレーム数 = シート長 / カラム数
        var fpc = nas.FCT2Frm(xUI.sheetLooks.PageLength,nas.FRATE)/xUI.sheetLooks.SheetColumn;
        var offset = document.getElementById('page_1').getBoundingClientRect().bottom - document.getElementById('0_0').getBoundingClientRect().top - ( new nas.UnitValue(nas.getCssRule("td.sheetbody",'height'),'mm').as('px')* fpc);
        var newHeight = (new nas.UnitValue(xUI.sheetLooks.SheetColHeight + xUI.sheetLooks.CellWidthUnit,'mm').as('px')
            - offset ) / fpc;
        if ( newHeight > 10) xUI.sheetLooks.SheetCellHeight = newHeight; 
    }
    nas.HTML.setCssRule('td.sheetbody','height:'+xUI.sheetLooks.SheetCellHeight + xUI.sheetLooks.CellWidthUnit,'both');
    return xUI.sheetLooks.SheetCellHeight;
}
/**
    @params {Boolean}   opt
    タイムシートセルテーブルの表示マージンを設定する
    画像マッチ時は設定値通りに
    ヘッドマージン部分は印字用ヘッダーテーブルを表示
    オフの際はすべて 0
 */
xUI.applySheetMargin = function(opt){
console.log(opt);console.log(xUI.viewMode);
    if(! opt) opt = 0;
//スクロール|ページモードのために0で初期化（制限モードを含む）
    var sheetOffsetTop    = 0;//0固定
    var sheetOffsetLeft   = xUI.XPS.sheetLooks.SheetLeftMargin - 2;
    var sheetMarginBottom = 0;//0固定

    if((!(xUI.restriction))&&(xUI.viewMode == 'PageImage')&&(document.getElementById('0_0'))){
console.log("PAGE2SCROLL")
//ページモード 初期化済（cell"0_0"が存在する）
        sheetOffsetTop = xUI.XPS.sheetLooks.SheetHeadMargin - (document.getElementById('0_0').offsetTop - document.getElementById('page_1').parentNode.offsetTop + document.getElementsByClassName('pgNm')[0].offsetHeight) - 4;
//ページ画像のサイズで
// ((opt)&&(document.getElementById('pageImage-1')))?
        if(document.getElementById('pageImage-1')){
            sheetMarginBottom = Math.round(
                document.getElementById('pageImage-1').naturalHeight
                * (96/nas.NoteImage.guessDocumentResolution(document.getElementById('pageImage-1'),'A3'))
                - xUI.XPS.sheetLooks.SheetHeadMargin
                - xUI.sheetLooks.SheetColHeight
                );
        }else{
            sheetMarginBottom = Math.round(
                new nas.UnitValue("420mm").as('px')
                - xUI.XPS.sheetLooks.SheetHeadMargin
                - xUI.sheetLooks.SheetColHeight
                );
        };
    };
console.log(sheetOffsetTop,sheetMarginBottom,sheetOffsetLeft);
//シートヘッダ領域位置合わせ(表示濃度ではなくviewModeに従って変更)
    if(xUI.restriction){
//制限モード
        nas.HTML.setCssRule('.headerArea','display:none;',"both");
        nas.HTML.setCssRule('.headerArea','height:0px;',"both");
    }else if(xUI.viewMode != 'Scroll'){
//ページ画像モード
        nas.HTML.setCssRule('.headerArea','display:block;',"both");
        nas.HTML.setCssRule('.headerArea','height:'+sheetOffsetTop+'px;',"both");
//ドキュメントヘッダーUIをページモード用に調整
    }else{
//スクロールモード
        nas.HTML.setCssRule('.headerArea','display:none;' ,"screen")    ;//
        nas.HTML.setCssRule('.headerArea','display:block;',"print")     ;//
        nas.HTML.setCssRule('.headerArea','height:'+sheetOffsetTop+'px;',"print");//
        //sheetArea 
    };
//ドキュメントヘッダーのジョブセレクタを固定
/*
    if()
*/
//タイムシートテーブル&オーバレイ画像の位置合わせ
    if(xUI.viewMode == 'PageImage'){
// pageimage シート位置をシフト
        var rule = "margin-top:"+sheetOffsetTop+"px ;margin-bottom:"+sheetMarginBottom+"px ;margin-left:"+sheetOffsetLeft+"px ;";
        nas.HTML.setCssRule('table.sheet',rule,"both");
        nas.HTML.setCssRule('.overlayDocmentImage',"top:0px ;","both");
    }else if(xUI.viewMode == 'WordProp'){
// page スクリーンシート位置はデフォルト プリント位置はシフト
        nas.HTML.setCssRule('table.sheet',"margin-top:0px ;margin-bottom:0px ;margin-left:"+sheetOffsetLeft+"px ;","screen");
        nas.HTML.setCssRule('table.sheet',"margin-top:"+sheetOffsetTop+"px ;margin-bottom:"+sheetMarginBottom+"px ;margin-left:"+sheetOffsetLeft+"px ;","print");
//画像位置を スクリーンでシフト プリントでデフォルト 
        nas.HTML.setCssRule('.overlayDocmentImage',"top: -"+(sheetOffsetTop)+"px ;","screen");
        nas.HTML.setCssRule('.overlayDocmentImage',"top:0px ;","print");
    }else{
//alert('TABLE-SHEET positionReset')
//    document.getElementById("app_status").getBoundingClientRect().bottom
//Scroll
        nas.HTML.setCssRule('table.sheet',"margin-top:0px ;margin-bottom:0px ;margin-left:"+sheetOffsetLeft+"px ;","all");
    };
//for screen && print
//    nas.HTML.setCssRule('table.sheet',"margin-top:0px ;margin-bottom:0px ;margin-left:0px ;","print");//for printout
}
/** 
 *  @params {Number}  appearance
 *  @params {Boolean} update
 *      パラメータ更新フラグ default undefined
 *  @returns {Numver}
 *          表示状態を返す
 *         
 *  ドキュメント画像表示状態を設定する
 *  画像表示状態パラメタを引数として与え ドキュメントの画像イメージを調整
 *    引数のない場合はドキュメントモードを確認して不整合のある部分を再設定
 *    状態フラグと表示パラメータとが必要
 画像表示 ON|OFF    xUI.XPS.sheetLooks.ShowDocumentImage
 
blendmode(合成モード)は、独自形式 エディタ側は罫線のカラーを背景色との中間値で計算・画像は比較暗で固定
そのため指定パラメータは意味を失う

appearance(画像表示状態)パラメータ 値範囲は .0-1.0

(slider)   0  <  50 >  100
(image )   0 <> 100 <> 100 %
(editor) 100 <> 100 <>   0 %

連動スライダで操作
これにより画像の ON|OFF は意味を失うため、.sheetImages.imageAppearance に appearance値を記録してopacityは不要となる

エディタUIは
フォーマットエディタ上では   罫線のみ（ラベルとボディは背景色）
画像マスターモード上 では    ボディのみ
ノーマルモード上    では    スイッチで切り替え

ページモード(viewMode == PageImage)で画像編集(xUI.canvasPaint.active == true)時は アピアランス値0が禁止される
切替時に0の場合は１に変換

画像ハンドリングオフの際は 0~1 可変

ページモード・かつトラック配置がドキュメントモードに一致している場合、
アピアランス値にかかわらず画像100％:罫線0%に固定表示

スクロール表示(モード)中はアピアランス値変更禁止(202310仕様)

アピアランスの値は旧ページモードではそのままopacityとして扱う
旧ページモードは廃止 2025 06
 */
xUI.setAppearance = function(appearance,update){
console.log(arguments);
    if(xUI.viewMode == 'Scroll'){
//Scroll
        appearance = 0;//document-image appearance 仮設値として0を強制して固定 将来的には可変
    }else{
//PageImage
        if(typeof appearance == 'undefined') appearance   = xUI.XPS.timesheetImages.imageAppearance;
        if(
            (xUI.canvasPaint.active)&&
            (xUI.XPS.timesheetImages.imageAppearance == 0)
        ){
            xUI.XPS.timesheetImages.imageAppearance = 1.0;
            appearance = 1.0;
        };//*/
    };

//if(xUI.viewMode == 'PageImage'){
//パラメータ算出
    var documentColor = xUI.sheetborderColor;//罫線色の基本値
    if (appearance > 0.5){
//≒半透明化
        documentColor = nas.colorAry2Str(add(
            mul(nas.colorStr2Ary(xUI.sheetborderColor),1 - ((appearance - 0.5) * 2)),
            mul(nas.colorStr2Ary(xUI.sheetbaseColor),((appearance - 0.5) * 2))
        ));
    };
//罫線色をアピアランス値に合わせて設定 PageImageモードのみ
//    $('.Sep'       ).css('border-color',documentColor);
//    $('.tlhead'    ).css('border-color',documentColor);
//    $('.trackLabel').css('border-color',documentColor);
    nas.HTML.setCssRule('div.sheetHeader','border-color:'+ documentColor+';','both');

    nas.HTML.setCssRule('.tlhead'     ,'border-color:'+ documentColor+';','both');
    nas.HTML.setCssRule('th.headerLabel','color:'+ documentColor+';border-color:'+ documentColor +';','both');

    nas.HTML.setCssRule('.trackLabel' ,'border-color:'+ documentColor+';','both');
    nas.HTML.setCssRule('td.sheetbody','border-color:'+ documentColor+';','both');
    nas.HTML.setCssRule('td.soundbody','border-color:'+ documentColor+';','both');
    nas.HTML.setCssRule('td.ltSep'    ,'border-bottom-color:'+ documentColor+';','both');
    nas.HTML.setCssRule('td.ltSep_Blank','border-bottom-color:'+ documentColor+';','both');
//    nas.HTML.setCssRule('td.Sep'      ,'border-color:'+ documentColor+';','both');
//テキストラベル色設定
//    $('.Sep'       ).css('color',documentColor);
//    $('.tlhead'    ).css('color',documentColor);
//    $('.trackLabel').css('color',documentColor);
//    nas.HTML.setCssRule('td.Sep'      ,'color:'+ documentColor+';','both');
    nas.HTML.setCssRule('.tlhead'     ,'color:'+ documentColor+';','both');
//    nas.HTML.setCssRule('.trackLabel' ,'color:'+ documentColor+';','both');//トラックラベルカラーは別制御に変換予定
    nas.HTML.setCssRule('.pgHeader-label','color:'+ documentColor+';','both');
    nas.HTML.setCssRule('.timeguide','color:'+ documentColor+';','both');
    nas.HTML.setCssRule('.frameguide','color:'+ documentColor+';','both');
    nas.HTML.setCssRule('.cameralabel' ,'color:'+ xUI.sheetborderColor+';','both');//消さない
//タグ配色設定
//};
//シートマージン設定
    xUI.applySheetMargin((appearance > 0));
//画像設定
    if(xUI.viewMode == 'Scroll'){
        document.querySelectorAll('.overlayNoteImage').forEach((e) =>{
                e.style.display      = 'inline';//表示
                e.style.mixBlendMode = xUI.XPS.noteImages.imageBlendMode;//設定モード
                e.style.opacity      = xUI.XPS.noteImages.imageAppearance;//設定表示濃度
        });
    }else{
        if(xUI.viewMode == 'PageImage'){
            document.querySelectorAll('.overlayDocmentImage').forEach((e) =>{
                e.style.display      = 'inline-block';//表示
                e.style.mixBlendMode = 'darken';//'multiply';//xUI.XPS.timesheetImages.imageBlendMode;
                e.style.opacity      = (appearance > 0.5)? 1.0:((appearance) / 0.50);//xUI.XPS.timesheetImages.imageAppearance;
            });
/*
        }else{
//旧来モードは廃止してページイメージモードに統一 各ページヘッダーは必ず表示
//trad = WordProp
            document.querySelectorAll('.overlayDocmentImage').forEach(function(e){
                e.style.display      = 'inline-block';//トレーラーは表示
                e.style.opacity      = appearance ;//xUI.XPS.timesheetImages.imageAppearance;
            });
            document.querySelectorAll('.pageDocumentImage').forEach(function(e){
                e.style.display      = 'none';//画像は非表示
            });
// */
        };
        if(update) xUI.XPS.timesheetImages.imageAppearance = appearance;
        sync('docImgAppearance');;
    };
    return appearance;
}
/*
timeSheetDocumentImageの調整
Xps.TimesheetImageコレクション内のオブジェクト1点ずつのoffsetを調整する
mode変数は、キーボード及び微調整ボタンの編集プロパティを示す inclination|move|scale
scale変数は２次元
*/
xUI.imgAdjust = {
    targetImg : null,
    backup    :{
        offset    : new nas.Offset(),
        scale     : new nas.Scale(1,1)
    },
    mode      : 'scale',
    baseline  : new nas.UnitValue('65mm')
}
/*Adjust control*/
xUI.imgAdjust.ctp0 = document.createElement('div');
xUI.imgAdjust.ctp0.id = 'uiHandle01';
xUI.imgAdjust.ctp0.className = 'node_handle node_handle-red';
xUI.imgAdjust.ctp0.innerHTML = '<svg class="float" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="red" stroke-width="2" d="M 12,1 L 23,12 L 12,23 L 1,12 z" /><path fill="none" stroke="red" stroke-width="1" d="M 12,1 L 12,11 M 23,12 L 13,12 M 12,23 L 12,13 M 1,12 L 11,12" /></svg>';

xUI.imgAdjust.ctp1 = document.createElement('div');
xUI.imgAdjust.ctp1.id = 'uiHandle02';
xUI.imgAdjust.ctp1.className = 'node_handle node_handle-green';
xUI.imgAdjust.ctp1.innerHTML = '<svg class="flaot" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="green" stroke-width="2" d="M 1,12 A 11 11 10 1 0 23,12 A 11 11 10 1 0 1,12" /><path fill="none" stroke="green" stroke-width="1" d="M 12,1 L 12,11 M 23,12 L 13,12 M 12,23 L 12,13 M 1,12 L 11,12" /></svg>';

/*
 * 画像位置補正UIの展開|収容
 */
    xUI.imgAdjust.expand = function(status){
        if(typeof status == 'undefined') status = !($('#imgAdjustDetail').isVisible());
        if(status){
            $('#imgAdjustDetail').show();
//            $('#optionPanelImgAdjust').width(152);
            $('#formImgAdjust').height(236);
            document.getElementById('imgAdjustExpand').innerHTML = '▲';
        }else{
            $('#imgAdjustDetail').hide();
//            $('#optionPanelImgAdjust').width(152);
            $('#formImgAdjust').height(134);
            document.getElementById('imgAdjustExpand').innerHTML = '▼';
        };
    }
/*
 * モード変更
 */
    xUI.imgAdjust.setMode = function(mode){
        if(typeof mode == 'undefined') mode = ["inclination","move","scale"][["scale","inclination","move"].indexOf(this.mode)];
        if(["inclination","move","scale"].indexOf(mode) < 0) return this.mode;
        this.mode = mode;
        document.getElementById('imgAdjustStatus').src = [
            "/remaping/images/ui/imgStatHolizon.png",
            "/remaping/images/ui/imgStatMove.png",
            "/remaping/images/ui/imgStatResize.png"
        ][["inclination","move","scale"].indexOf(this.mode)];
        return this.mode;
    }
/*
 *  キー入力及びボタン操作による詳細編集
 */
    xUI.imgAdjust.adjust = function(e){
        console.log(e);
            var value = 1;
        if ((e.target.id == 'imgAdjustUp')){
            value = value * -2;
        }else if((e.target.id == 'imgAdjustDown')){
            value = value * 2;
        }else if((e.target.id == 'imgAdjustLeft')){
            value = value * -1;
        }else if((e.target.id == 'imgAdjustRight')){
            value = value * 1;
        };
        if (this.mode == 'inclination'){
//inclination 0.1|0.05°
            this.targetImg.offset.r.setValue(Math.floor(this.targetImg.offset.r.as('degrees')*20 + value)/20+'degrees');// 1/20°(0.05°)刻み
        }else if(this.mode == 'move'){
//move 0.1mm
            if(Math.abs(value) == 1){
                this.targetImg.offset.x.setValue(Math.floor(this.targetImg.offset.x.as('mm')*10 + value)/10+'mm');
            }else{
                this.targetImg.offset.y.setValue(Math.floor(this.targetImg.offset.y.as('mm')*5 + value)/5+'mm');
            };
        }else if(this.mode == 'scale'){
//scale 0.1|0.05%
            if(Math.abs(value) == 1){
                this.targetImg.scale.x.setValue(Math.floor(this.targetImg.scale.x.as('%')*20 + value)/20+'%');// 1/20%(0.05%)刻み
            }else{
                this.targetImg.scale.y.setValue(Math.floor(this.targetImg.scale.y.as('%')*10 + value)/10+'%');// 1/20%(0.05%)刻み
            };
        };
console.log(this.targetImg.scale);
        this.apply();
    }
/*
    ドキュメント画像の配置を反映
    xUI.imgAdjust.targetImgの設定が必要
    引数は、offset,scaleを分けて与える object|string
*/
    xUI.imgAdjust.apply = function (offset,scale){
        if(! this.targetImg) return;
        if(typeof offset != 'undefined') this.targetImg.offset.setValue(offset.toString());
        if(typeof scale  != 'undefined') this.targetImg.scale.setValue(scale.toString());
console.log("translate(" + this.targetImg.offset.position.toString('px')+") scale("+ this.targetImg.scale.toString()+") rotate("+ this.targetImg.offset.r.as('degrees')+"deg)");
        this.targetImg.img.style.transformOrigin = (this.targetImg.offset.position.x.as('px') + xUI.XPS.sheetLooks.SheetLeftMargin) +'px '+ ( - this.targetImg.offset.position.y.as('px') + xUI.XPS.sheetLooks.SheetHeadMargin)+ 'px';
        this.targetImg.img.style.transform = "scale("+ this.targetImg.scale.toString()+")"+" rotate("+ this.targetImg.offset.r.as('degrees')+"deg)"+" translate(" + this.targetImg.offset.position.toString('px')+")";
        this.sync();
        return this;
    }
/*オフセットとスケールを初期化する*/
    xUI.imgAdjust.reset = function (){
        if(! this.targetImg) return;
        xUI.imgAdjust.apply('0mm,0mm,0degrees','100%,100%');
    }
/*バックアップを書き戻す*/
    xUI.imgAdjust.restore = function (){
        if(! this.targetImg) return;
        xUI.imgAdjust.apply(this.backup.offset,this.backup.scale);
    }
/*編集UIの値を反映*/
    xUI.imgAdjust.chkValue = function(idx){
        if(! this.targetImg) return;
        if(idx == 'imgAdjustRotation'){
            this.targetImg.offset.r.setValue(document.getElementById('imgAdjustRotation').value +'degrees');
        }else if(idx == 'imgAdjustScaleX'){
            this.targetImg.scale.x.setValue(document.getElementById('imgAdjustScaleX').value +'%');
        }else if(idx == 'imgAdjustScaleY'){
            this.targetImg.scale.y.setValue(document.getElementById('imgAdjustScaleY').value +'%');
        }else if(idx == 'imgAdjustPositionX'){
            this.targetImg.offset.x.setValue(document.getElementById('imgAdjustPositionX').value +'mm');
        }else if(idx == 'imgAdjustPositionY'){
            this.targetImg.offset.y.setValue(document.getElementById('imgAdjustPositionY').value +'mm');
        };
        this.apply();
    }
/*編集対象のイメージオフセットをUIに同期*/
    xUI.imgAdjust.sync = function(){
        document.getElementById('imgAdjustRotation').value  = Math.round(this.targetImg.offset.r.as('degrees')*100)/100;
        document.getElementById('imgAdjustScaleX').value    = Math.round(this.targetImg.scale.x.as(10000))/100;
        document.getElementById('imgAdjustScaleY').value    = Math.round(this.targetImg.scale.y.as(10000))/100;
        document.getElementById('imgAdjustPositionX').value = Math.round(this.targetImg.offset.x.as('mm')*100)/100;
        document.getElementById('imgAdjustPositionY').value = Math.round(this.targetImg.offset.y.as('mm')*100)/100;
    }
//原点コントロールハンドラ(保留　未使用)
    xUI.imgAdjust.handleMove_0 = function(e){
                var pgOffset=document.getElementById('uiHandle01').parentNode.getBoundingClientRect();
                $("#uiHandle01").css({ 
                    top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
                    left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
                });
                $("#uiHandle02").css({ 
                    top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) + xUI.imgAdjust.guiOffset.x.as('px') +"px",
                    left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) + xUI.imgAdjust.guiOffset.y.as('px') +"px"
                });
    }
/*
    編集を反映させて調整モードを抜ける
 */
    xUI.imgAdjust.close = function (){
        if(! this.targetImg) return;
        this.backup.offset.setValue(0,0,0);//backup clear
        this.backup.scale.setValue(1,1);
        this.targetImg.img.parentNode.style.pointerEvents = 'none';
        this.targetImg = null;//編集対象をクリア
        this.ctp0.parentNode.removeChild(this.ctp1);
        this.ctp0.parentNode.removeChild(this.ctp0);
    }
/*
    ドキュメント画像配置調整機能初期化
*/
    xUI.imgAdjust.startup = function (pgid){
        var currentPageId = Math.floor(xUI.Select[1]/nas.FCT2Frm(xUI.XPS.sheetLooks.PageLength,new nas.Framerate(xUI.XPS.sheetLooks.FrameRate).rate));
        if(typeof pgid == 'undefined') pgid = currentPageId;
        var pgOrigin  = [0,pgid*nas.FCT2Frm(xUI.XPS.sheetLooks.PageLength,new nas.Framerate(xUI.XPS.sheetLooks.FrameRate).rate)];
        var focusCell = (pgid == currentPageId)? xUI.Select:pgOrigin;
        this.targetImg = xUI.XPS.timesheetImages.members[pgid];//編集対象を設定
        this.backup.offset.setValue(this.targetImg.offset.toString());
        this.backup.scale.setValue(this.targetImg.scale.toString());//backup
        this.baseline.setValue(xUI.getAreaWidth('document'));//mm | px
        xUI.selectCell(focusCell);//シートセルを再選択して表示を整える
        if((xUI.XPS.timesheetImages.imageAppearance == 0)||(xUI.XPS.timesheetImages.imageAppearance == 1))
            xUI.setAppearance(0.5,true);//画像が表示されていない場合は表示させる

        xUI.imgAdjust.sync();
//this.targetImg.offset.setValue('2mm','3mm','-45d');
//this.targetImg.scale.setValue(1.0,0.6);
//原点オフセット初期値 [document.getElementById('printPg'+(pgid+1)).offsetTop - document.getElementById(pgOrigin.join('_')).offsetTop + 'px',document.getElementById(pgOrigin.join('_')).offsetLeft +'px'];//キーエレメントの位置
;//sheetLooksの値
/*
this.targetImg.offset.setValue([
    xUI.XPS.sheetLooks.SheetLeftMargin + xUI.XPS.sheetLooks.CellWidthUnit,
    xUI.XPS.sheetLooks.SheetHeadMargin + xUI.XPS.sheetLooks.CellWidthUnit
    ]);//*/
//画像調整UI配置
        this.targetImg.img.parentNode.style.pointerEvents = 'auto';
        this.targetImg.img.parentNode.appendChild(this.ctp0);
        this.targetImg.img.parentNode.appendChild(this.ctp1);
            xUI.imgAdjust.ctp0.style.left = xUI.XPS.sheetLooks.SheetLeftMargin - (xUI.imgAdjust.ctp0.clientWidth / 2)  +'px';
            xUI.imgAdjust.ctp0.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp0.clientHeight / 2) +'px';
            xUI.imgAdjust.ctp1.style.left = xUI.XPS.sheetLooks.SheetLeftMargin + xUI.imgAdjust.baseline.as('px') - (xUI.imgAdjust.ctp1.clientWidth / 2) + 'px';
            xUI.imgAdjust.ctp1.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp1.clientHeight / 2) +'px';
//画像調整UI原点(CT-0)初期化
        $('#uiHandle01').mousedown(function(e){
            var target = e.target;
            $(target)
                .data("clickPointX" , e.pageX - $("#uiHandle01").offset().left)
                .data("clickPointY" , e.pageY - $("#uiHandle01").offset().top);
        $('#uiHandle01').css('cursor','none');
            $(document).mousemove(function(e){
//画像位置の調整 テキストボックスのパラメータを連続して更新
                var pgOffset=document.getElementById('uiHandle01').parentNode.getBoundingClientRect();
                $("#uiHandle01").css({ 
                    top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
                    left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
                });
                $("#uiHandle02").css({ 
                    top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) + "px",
                    left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) + xUI.imgAdjust.baseline.as('px') +"px"
                });
//差分をonchangeを保留してテキストボックスに反映させる 解決はマウスアップイベント
                document.getElementById('imgAdjustPositionX').value = xUI.imgAdjust.targetImg.offset.x.as('mm') + new nas.UnitValue(xUI.imgAdjust.ctp0.offsetLeft + (xUI.imgAdjust.ctp0.clientWidth / 2)  - xUI.XPS.sheetLooks.SheetLeftMargin + 'px','mm').as('mm') * -1;//as 'mm'
                document.getElementById('imgAdjustPositionY').value = xUI.imgAdjust.targetImg.offset.y.as('mm') + new nas.UnitValue(xUI.imgAdjust.ctp0.offsetTop  + (xUI.imgAdjust.ctp0.clientHeight / 2) - xUI.XPS.sheetLooks.SheetHeadMargin + 'px','mm').as('mm') * -1;//as 'mm'
            }).mouseup(function(e){
console.log('unbind');
//移動をoffsetに展開して解決
            xUI.imgAdjust.apply(
                document.getElementById('imgAdjustPositionX').value+'mm,'+
                document.getElementById('imgAdjustPositionY').value+'mm,'+
                document.getElementById('imgAdjustRotation').value+'degrees'
            );
//ctp位置リセット
            xUI.imgAdjust.ctp0.style.left = xUI.XPS.sheetLooks.SheetLeftMargin - (xUI.imgAdjust.ctp0.clientWidth / 2)  +'px';
            xUI.imgAdjust.ctp0.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp0.clientHeight / 2) +'px';
            xUI.imgAdjust.ctp1.style.left = xUI.XPS.sheetLooks.SheetLeftMargin + xUI.imgAdjust.baseline.as('px') - (xUI.imgAdjust.ctp1.clientWidth / 2) + 'px';
            xUI.imgAdjust.ctp1.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp1.clientHeight / 2) +'px';

                $(document).unbind("mousemove");
                $('#uiHandle01').css('cursor','move');
                $(document).unbind("mouseup");
            });
        });
//画像調整UI制御点(CT-1)初期化
        $('#uiHandle02').mousedown(function(e){
            var target = e.target;
            $(target)
                .data("clickPointX" , e.pageX - $("#uiHandle02").offset().left)
                .data("clickPointY" , e.pageY - $("#uiHandle02").offset().top);
        $('#uiHandle02').css('cursor','none');
            $(document).mousemove(function(e){
//画像サイズ・傾斜の調整 テキストボックスのパラメータを連続して更新
                var pgOffset=document.getElementById('uiHandle01').parentNode.getBoundingClientRect();
                $("#uiHandle02").css({ 
                    top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
                    left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
                });
//差分をonchangeを保留してテキストボックスに反映させる　解決はマウスアップイベント
                var unitPt = [xUI.imgAdjust.ctp1.offsetLeft - xUI.imgAdjust.ctp0.offsetLeft,xUI.imgAdjust.ctp1.offsetTop - xUI.imgAdjust.ctp0.offsetTop];//正規化座標（[x,y]as px）
                document.getElementById('imgAdjustRotation').value = nas.radiansToDegrees(xUI.imgAdjust.targetImg.offset.r.as('radians') - Math.atan2(unitPt[1],unitPt[0]));//as 'degrees' ctp0 - ctp1 間の傾斜角度
                document.getElementById('imgAdjustScaleX').value = Math.round(xUI.imgAdjust.targetImg.scale.x.as(10000) * (xUI.imgAdjust.baseline.as('px')/nas.length(unitPt)))/100 ;//as percent
                document.getElementById('imgAdjustScaleY').value = Math.round(xUI.imgAdjust.targetImg.scale.y.as(100) * parseFloat(document.getElementById('imgAdjustScaleX').value))/100 ;//as percent
            }).mouseup(function(e){
console.log('unbind');
//移動をoffset,scale に展開して解決
            xUI.imgAdjust.apply(
                document.getElementById('imgAdjustPositionX').value +'mm,'+
                document.getElementById('imgAdjustPositionY').value +'mm,'+
                document.getElementById('imgAdjustRotation').value  +'degrees',
                document.getElementById('imgAdjustScaleX').value    +'%,'+
                document.getElementById('imgAdjustScaleY').value    +'%'
            );
//ctp位置リセット
            xUI.imgAdjust.ctp1.style.left = xUI.XPS.sheetLooks.SheetLeftMargin + xUI.imgAdjust.baseline.as('px') - (xUI.imgAdjust.ctp1.clientWidth / 2) + 'px';
            xUI.imgAdjust.ctp1.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp1.clientHeight / 2) +'px';

                $(document).unbind("mousemove");
                $('#uiHandle02').css('cursor','move');
            });
        });
//初期化終了
        xUI.imgAdjust.apply();
        
    }
/*
    各調整UIの初期化
    type inclination|scale|position
 */
    xUI.imgAdjust.init = function(type){
        if(typeof type == 'undefined') type = 'inclination';
        switch(type){
        case 'inclination':
//回転(傾き)入力
        break;
        case 'scale':
        break;
        case 'position':
        break;
        default :
//クリア
            //カーソルクリア
            //UIバーツ非表示
            //マウス入力解除
            //キー入力解除
        };
    };
/**
    setToolView
    パネル群の一括表示切り替え
    クッキーと同じ形式またはキーワード full,minimum,default,compact,current
     引数がない場合以下を順次切替
    (ユーザ設定(current))＞全表示(full)＞最少表示(minimum)＞推奨表示(defeult)＞推奨コンパクト(compact)＞(ユーザ設定(current))

    各ツールの個別切り替えを行うとその時点の表示がユーザ設定と置き換わるので注意
    "pMenu"             ドロップダウンメニュー <2020改修で削除予定 非表示>
    "account_box"       ユーザアカウント切り替え
    "optionPanelLogin"  認証パネル
    "toolbarHeader"     ツールバー <2020改修で削除予定 非表示>
    "optionPanelUtl"   コマンドバー <2020改修で削除予定 非表示>
    "pmcui"             作業メニュー <2020改修で削除予定 非表示>
    "headerTool"        ヘッダー入力コントロールバー
    "inputControl"     入力コントロール
    "sheetHeaderTable"  タイムシートヘッダ
    "optionPanelTbx"    ソフトウェアキーボード
    "optionPanelDbg"    デバッグコンソール
    "memoArea"          メモ表示域
 */
 /**
    @params {Boolean} asBin
        戻り値の要素をバイナリ文字列に
    @returns {Array} 
    現在のパネルの表示状態を配列で返す
    アイコンバーパネルのサブidは含まない
*/
xUI.checkToolView = function(asBin){
    var result = [];
    var ix = 0;
    for(var prp in xUI.panelTable){
        if(
            (xUI.panelTable[prp].elementId)&&
            (document.getElementById(xUI.panelTable[prp].elementId))
        ){
            let v = ($("#"+xUI.panelTable[prp].elementId).isVisible())? 1:0;
            if(xUI.panelTable[prp].elementId == 'inputControl'){
//例外処理 後で処理一考 20250816
                v = (document.getElementById('inputControl').getAttribute('class').indexOf('inputControl-show') >= 0)? 1:0;
            };
            result.push([prp,xUI.panelTable[prp].elementId,v]);
        }else{
            let v = 0;
            if(
                (document.getElementById(xUI.panelTable[prp].elementId))&&
                (xUI.panelTable[prp].type == 'float')
            ) v = (xUI.toolView[ix])? 1:0;
            result.push([prp,xUI.panelTable[prp].elementId,v]);
        };
        ix ++;
    };
    xUI.toolView = Array.from(result ,e => e[2]);
    if(asBin) return xUI.toolView;
    return result;
};
/**
    @params {String | Array} toolView
        toolView 文字列
    @returns {string}
        表示状態を表す文字列（checkToolViewの出力と同じ）
    引数・戻値は基本的に2進数値文字列 |

    またはキーワード引数
        full        フルサイズUI 
        minimum     フルサイズUI環境下で最小のツールセット（入力可能）
        default     特に指定のない場合の標準セット
        compact     コンパクトUI
        restriction 動作制限下でのセット
{
    'full'   :["account_box","pmui","headerTool","inputControl","sheetHeaderTable","memoArea"],
    'minimum':["headerTool","inputControl"],
    'default':["account_box","pmui","headerTool","inputControl"],
    'compact':["account_box","headerTool","inputControl"]
}

配列が引数として渡された場合は、配列全体を連結"join('')"して文字列とする
// */
xUI.setToolView = function(toolView){
    if(toolView instanceof Array) toolView = toolView.join('');//配列で与えられた場合は連結文字列
    if((!(toolView))||(String(toolView).length == 0)) toolView = config.ToolView;//引数が与えられない場合は設定値
console.log(toolView);
    var currentView = xUI.checkToolView(true).join("");//文字列で取得
    if(String(toolView).match(/^(full|minimum|default|compact|restriction)$/i)){
        if(xUI.restriction) toolView = 'restriction';//強制的に変更
        var limit = {
            restriction:0,
            minimum:1,
            compact:2,
            default:3,
            full:4
        };
        var tv = [];var ix = 0;
        for (var prp in xUI.panelTable){
            if(
                (document.getElementById(xUI.panelTable[prp].elementId))&&
                (xUI.panelTable[prp].uiOrder >= 0)
            ){
                tv.push((xUI.panelTable[prp].uiOrder <= limit[toolView])?1:0);
            }else if(
                (prp == '_exclusive_item_')||
                (xUI.panelTable[prp].uiOrder < 0)||
                (xUI.panelTable[prp].type == 'modal')
            ){
//exclusive_items | order minus | type modal
                tv.push(0);
            }else{
                tv.push((xUI.toolView[ix])? 1:0);
            };
            ix ++;
        };
            toolView = tv.join('');
    }else if(String(toolView).match(/[^01]/)){
            throw "setToolView Incorrect arguments: "+toolView
            //これは実行されない エラー発生案件
    };
console.log(toolView);
    if(toolView != currentView){
//UI表示状態設定
        var changePost = false;
        var ix = 0;
        for (var prp in xUI.panelTable){
            if(prp != '_exclusive_items_'){
                if(xUI.panelTable[prp].elementId == 'toolbarPost'){
                    changePost = (String(toolView).charAt(ix)==currentView.charAt(ix))? false:true;
                }else{
console.log(prp,(String(toolView).charAt(ix)=="0")?"hide":"show")
                    if(document.getElementById(xUI.panelTable[prp].elementId)) xUI.sWitchPanel(
                        prp,
                        (String(toolView).charAt(ix)=="0")?"hide":"show"
                    );
                };
            };
            ix ++;
        };
        xUI.adjustSpacer();
        if(changePost){
            xUI.sWitchPanel('ibC','switch');
            xUI.ibCP.switch(xUI.ibCP.activePalette);
        };
    };
console.log([toolView,xUI.toolView]);
    return toolView;
}
/* TEST
xUI.setToolView()
*/
/**
    @params   {String} modeString
    @params   {Function} callback
    @returns  {String}

    xUI.setDocumentMode(modeString)
    ドキュメント表示モードを変更する
    引数は変更するモード文字列 PageImage|pageImage|WordProp|page|Compact|scroll 等
    現在の表示モード変数の値を戻す xUI.viewMode
    documentMode&&viewMode 変更  引数がなければ変更なし
    引数がモードキーワード以外ならば、モードを順次切り替え
    この関数は、制限モードを解除する
    画面リセットを伴う
    callback関数あり
    現在のdocumentMode値を返す
viewMode
    PageImage         ページモード(WodProp)
    Scroll            スクロールモード(Compact)
documentMode
    pageImage ページ画像モード
    scroll    スクロールモード

2モードに統合
引数は旧来の引数を受け入れる
判別引数は刈り込み予定2506
*/
xUI.setDocumentMode = function(modeString,callback){

    if(typeof modeString == 'undefined') return xUI.XPS.documentMode;
    if(xUI.restriction) xUI.restriction = false;
    switch (modeString){
    case    'WordProp':
    case    'page':
    case    'PageImage':
    case    'pageImage':
        if(xUI.viewMode != 'PageImage'){
            xUI.viewMode = 'PageImage';// WordProp
            xUI.XPS.documentMode = 'pageImage';
            document.getElementById('sheetHeaderTable').style.display='none';
            (['extSig','memoArea']).forEach(function(e){xUI.sWitchPanel(e,'hide')})
            xUI.resetSheet(undefined,undefined,callback);
        };
        return 'pageImage';
    break;
    case    'Compact':
    case    'Scroll':
    case    'scroll':
        xUI.viewMode = 'Scroll';//'Compact';
        xUI.XPS.documentMode = 'scroll';
        document.getElementById('sheetHeaderTable').style.display='inline';
        (['extSig','memoArea']).forEach(function(e){xUI.sWitchPanel(e,'show')})
        sync('docImgAppearance');
        xUI.adjustSpacer();
        xUI.resetSheet(undefined,undefined,callback);
        xUI.applySheetlooks();
        return 'scroll';
    break;
    default :
        if(xUI.viewMode == 'PageImage'){
            return(xUI.setDocumentMode('scroll'));
        }else{
            return(xUI.setDocumentMode('page'));
        };
    };

//    if(mode == 'Scroll') xUI.applySheetlooks();
    return xUI.XPS.documentMode;
}
/*TEST
xUI.setDocumentMode('pageImage');
*/
/**
    @params {Boolean}  mode
    true  制限モードへ移行
    false 解除

restriction(制限)モードについて

restrictionフラグを立てた状態では、使用可能な画面に制限のあるハンドヘルドデバイスまたはアプリケーションのサブパネル内などのために以下の条件に動作環境が制限される

UI類を最低限のものに限定する（ほとんど隠す）
シート編集エリアを強制的に以下の状態に制限する
    リファレンスエリア非表示
    ヘッダー非表示
    シートを1カラム構成＋ページ長をカット尺に（1ページ表示）
これはドキュメントに記録される状態を変更しない
制限モードからは常に元の状況に復帰可能（ドキュメント書式を変更しない）

    XpsEditor想定なので要調整 2025 07

*/
xUI.setRestriction = function(mode){
    if(typeof mode == 'undefined') mode=true;
    if(mode){
//true Restriction ON
        xUI.restriction = true;
        xUI.viewMode = "PageImage";//?
        xUI.PageCols = 1;
        xUI.resetSheet(undefined,undefined,function(){
            xUI.setToolView('minimum');
            xUI.flipRefColumns('hide');
        });
    }else{
//false Restriction OFF
        xUI.restriction = false;
        xUI.viewMode = {"pageImage":"PageImage","scroll":"Scroll"}[xUI.XPS.documentMode];//?
        xUI.PageCols = xUI.XPS.sheetLooks.SheetColumn;
        xUI.resetSheet(undefined,undefined,function(){
//            xUI.setToolView('default');
            xUI.flipRefColumns('show');
        });
    };
    return xUI.restriction;
}
/**
    xUI.manipulateDocument(command,callback)
        (旧 : xUI.setDocumentStatus(myCommnad))
    ドキュメント(xUI.documents)のステータスを操作する関数
    DocumentオブジェクトにアタッチされたxMap|Xpsのみを扱う
    
トランザクションはdocuments[0]を初期化の際残りの必要なサブトランザクションが初期化される

    代表xMapのみを操作対象とする xpx/pmdb/stbd等は扱わない
    このメソッドが必要に従って「UIを提示して」コマンドを実行する
    トランザクション制御の一部として動作するので 引数としてトランザクションオブジェクトのみを受け付ける
    操作に失敗した場合トランザクション全体が破棄される
    
    @params {Object nas.Transaction}    transaction

    @params {String|Function}    command
    引数：操作後にコールバックされる関数または、コールバック処理キーワード
    
    activate/deactivate/checkin/checkout/destroy/abort/receipt/branch // push|pull //sink/float
    
    操作成功時は、モードにあわせてアプリケーションのモードを設定
    引数がカラの場合は、現在のステータスを返す
    非同期のサービスレスポンス待ちなのでコールバック渡し
    activate        from Fixed/Hold     to Active
        Hold中または一旦Fixedにしたドキュメントを再度Activeにする
    deactivate      from Active         to Hold
        ActiveなドキュメントをHoldに

    checkin         from Startup/Fixed  to Active
        チェックイン可能な状態のドキュメントにチェックインしてActiveに
        ｘUI.currentUserが有効であること
    checkout        from Active         to Fixed
        ActiveドキュメントをチェックアウトしてFixedに
        アサイン・メッセージを要求
        
    abort           from Fixed          to Aborted
        ドキュメントを中断（欠番処理）要マネジメントモード
    receipt         from Fixed          to Startup
        ドキュメントを受領してCompleatedに 新ステージを設定してStartupを設定
        同時にブランチも可能
    branch          (status no change)（xMapのみ）
        任意のステージ後端からブランチを作成 ブランチに新ステージを設定してStartupを設定

floatingの切り替えメソッドを独立させる
    flaot                                copy to Floating（xMapのみ）
      if(unactive)  from Startup/Fixed/Hold     No Change
      if(active)    from Active                 to Hold
        現行のドキュメントをフロート化
        ドキュメントがアクティブであった場合のみホールドに切り替えて
        xMap.dataNodeの内容を削除する
        保存、エクスポート等は行わない
    sink            from any            copy to any（xMapのみ）
        フローティング状態のドキュメントをすべてリポジトリに登録する
        すでに登録されている同名データの上書きは禁止する
        xMap|所属Xpsすべて|設定により アセットすべてをアップロード 成功したら
        現pmdb|stbdを更新して これをpush

    push            (status no change)
        xMap|所属Xpsすべて|設定によりアセットすべて をpush
    pull            (status no change)
        xMap|所属Xpsすべて|設定によりアセットすべて をpull

    @params {Function|String callbackMethod}    callback
        コールバック処理メソッド または定形コールバックのためのキーワード
    @returns {Object nas.ManagementNode} カレントドキュメントステータスを戻すが基本的に戻り値は利用されない（消すか？）


＊＊このメソッドがUIを出してパラメータを揃える**
指定メソッドに沿ってコマンドを書きだすハブマニピュレーター
xUI.docuemntsに対する処理のみを扱う
単独データに関してはmanupulateDataで扱う
*/
xUI.manipulateDocument = function(transaction){
//console.log('break xUI.manipulateDocument !!!!!!');return false;
console.log('xUI.manipulateDocument !!!!!!'+transaction.command);
    if(!(transaction instanceof nas.Transaction)) return false;
    if ((transaction.target instanceof xUI.Document)&&(this.documents.length == 0)){
        transatction.fail();
        return false;
    }
    var targetData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
    var command = transaction.command;
    switch (command){
        case 'float':;//ｘMap|Xps only(has .pmu)
            if(targetData.pmu){
                if(targetData.dataNode){
// float  現在のドキュメントを複製して自由編集状態にする
alert('set float : '+targetData.getIdentifier());
                    targetData.dataNode = undefined;//クリア
                }else{
alert(targetData.getIdentifier() + 'is allready float')
                }
                transaction.callback = function(){
                    xUI.setUImode('browsing');
                }
                transaction.success();
            }
        break;
        case 'sink':;//ｘMap|Xps only(has .pmu)
//sink /現在のドキュメントをリポジトリにプッシュする 成功時はドキュメントのステータスを更新
/*sink floatingデータの登録は要注意
現在データが既存である場合は処理を行っていないが、既存データの書き戻しもこのメニューの範疇
既存データと構成が一致した場合はマージを行うように 要調整
*/
//処理パスをこのルーチンにしないで別に仕立てる
            if(targetData.pmu){
//ダイアログ出画前に不能判定を行う
                var contentConfrict = 0;
                var targetEpisode      ;
                var targetTitle     = nas.pmdb.workTitles.entry(targetData.pmu.title.name);
                if(targetTitle){
                    targetEpisode = targetTitle.opuses.entry(targetData.pmu.opus.name);
                    if(targetEpisode){
                        for (var ex = 0 ; ex < targetData.pmu.inherit.length;ex++){
                            if(targetEpisode.stbd.entry(targetData.pmu.inherit[ex].name)) contentConfrict ++;
                        }
                    }
                }
              if((targetTitle)&&(targetEpisode)&&(contentConfrict == 0)){
//タイトルありエピソードありショット重複なし
//モーダルパネル表示（操作ロック）ドキュメントの状態を提示してユーザの確認を促す
//メッセージ設定
                var msg = "SINK-TEST";var ui_description='<strong>SINK-UI</strong>'
                nas.showModalDialog('confirm',[msg,ui_description],"SINK",transaction,function(){
                    var transaction = this.startValue;
                    if(this.status == 0){
                        var targetData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
                        var command = transaction.command;
                        if(!(targetData.dataNode)){
                            targetData.dataNode = serviceAgent.currentRepository.toString();//設定する
                        }
                        transaction.callback = function(){
                            xUI.setUImode('browsing');
                        };
                        serviceAgent.currentRepository.pushContent(transaction);
                    }else{
                        transaction.fail();
                    }
                },true);
              }else{
/*
    ショットが完全に重複していたら放流データの帰還なのでマージを行う
    他に タイトル新規作成・エピソード新規作成も考えられるが ここでは扱わない
    ショット内容が不完全に一致しているケースも考えられるので注意
*/
                  var msg = 'このショットは登録できません。'
                  alert(msg);
                  transaction.fail();
              }
            }
        break;
        case 'activate':;//ｘMap|Xps only(has .pmu)
            if(targetData.pmu){
        //activate / 停止中の作業を再開する
                if(
                    (targetData.pmu.currentNode.jobStatus.content.match(/^Fixed|^Hold/i))&&
                    (xUI.currentUser.sameAs(targetData.pmu.currentNode.updateUser))
                ){
                    var activation = targetData.pmu.activate(xUI.currentUser);
                    if(activation) {
                        transaction.callback = function(){
                            xUI.setUImode('production');
                        };
                        serviceAgent.pushContent(transaction);
                    }else{
console.log("activation failed");console.log(this.XMAP);
                        transaction.fail();
                    }
                }else{
console.log('cannot activate:');
                        transaction.fail();
                }
            }
        break;
        case 'deactivate':;//ｘMap|Xps only(has .pmu)
console.log('de-activation !')
            if(targetData.pmu){
            //deactivate / 保留
                var deactivation = targetData.pmu.deactivate();
                if(deactivation){
console.log(deactivation);
                    transaction.callback = function(){
                        //成功時はドキュメントのステータスを更新してアプリモードをbrowsingへ変更
                        xUI.setUImode('browsing');
                    };
                    serviceAgent.pushContent(transaction);
                }else{
                    transaction.fail();
                }
            }
        break;
        case 'checkin':;//ｘMap|Xps only(has .pmu)
console.log('transaction checkin data manipulate');
            if(targetData.pmu){
              if((targetData.xMap)&&(targetData.xMap.pmu.checkinNode)){

/*  Xps(カット)に対するチェックイン操作は自動で行なわれる
    基本的にxMapへのチェックインが成功した場合Xpに対するユーザのチェックイン操作は不要とする
    メモリ上のデータへのチェックインはその場で行なわれる（この操作は通常は成功するはずだが、失敗の場合はエラー処理に入る）
    sessionRetraceが０にセットされる 
    常に入力可能 ただし、サーバへの保存は遅延解決 
    自動保存のタイミングで((undoPt == 0)&&(storePt == undoPt)である限り、実際のpushは行なわれないように調整する
*/
//checkin引数 (checkinTarget,nodeDescription,activeUser)
console.log(targetData.xMap === xUI.XMAP)
console.log([
                        targetData.xMap.pmu.currentNode.getPath(),
                        xUI.currentUser.toString()
]);

                    var checkin = targetData.pmu.checkin(
                        targetData.xMap.pmu.currentNode,
                        targetData.xMap.pmu.checkinNode.name,
                        xUI.currentUser
                    );
                    if(checkin){;   //console.log('checkin success. ');
                        transaction.callback = function(){
                            xUI.sync('productStatus');
                        };
                        if(targetData.documentRepository){;// console.log('put content to repository');
                            serviceAgent.pushContent(transaction);
                        }else{
                            transaction.success();
                        }
                    }else{
console.log('manipulate checkin fail');
console.log(checkin);
                        transaction.fail();
                    }
              }else{
//check-in / 開く    モーダルパネル表示（操作ロック）ドキュメントの状態を提示してユーザの確認を促す
                var msg = localize('checkin-test');
                var ui_description = "<div>UI-content UID:"+ xUI.currentUser.toString() +": newJobName </div>";
                nas.showModalDialog(
                    'confirm',
                    [msg,ui_description],
                    'check-in',
                    transaction,
                    function(result){
                    var transaction = this.startValue;
                        if(this.status == 0){
                            var targetData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
                            var command = transaction.command;
                            var nodeDescription = 'newJobName';//new job name
                            var checkin = targetData.pmu.checkin(
                                targetData.pmu.currentNode,
                                nodeDescription,
                                xUI.currentUser
                            );
                            if(checkin){
                                transaction.callback = function(){
                                    if (xUI.uiMode != 'production'){
                                        xUI.viewOnly = false;
                                        xUI.setUImode('production');
                                    }else{
                                        xUI.sync('productStatus');
                                    }
                                };
                                if(targetData.documentRepository){
                                    serviceAgent.pushContent(transaction);
                                }else{
                                    transaction.success();
                                }
                            }else{
                                transaction.fail();
                            }
                        }else{
                            transaction.fail();
                        }
                    },
                    true
                );
              }
            }
        break;
        case 'checkout':;//ｘMap|Xps only(has .pmu)
            if(targetData.pmu){
//check-out / 閉じる
              if(
                (transaction.target instanceof xUI.Document )&&
                (targetData.xMap)&&
                (! targetData.xMap.pmu.checkinNode)&&
                (nas.Pm.compareManagementNode(targetData.xMap.pmu.currentNode,targetData.pmu.checkinNode) == 0)
              ){
//checkin引数 (assignUser,message)なし ダイアログなしのチェックアウト
//xUI.Document が直接の引数で、かつトレーラーのxMapがチェックアウト済みであること それ以外はダイアログあり
                    var checkout = targetData.pmu.checkout();
                    if(checkout){
                        transaction.callback = function(){
                                xUI.sync('productStatus');
                        };
                        serviceAgent.pushContent(transaction);
                    }else{
                        transaction.fail();
                    }
              }else{
//モーダルパネル表示（操作ロック）ドキュメントの状態を提示してユーザの確認を促す
//メッセージ設定
                var msg = 'checkout-test';var ui_description = "UI-TEST-CHECKOUT";
                nas.showModalDialog('confirm',[msg,ui_description],'checkout',null,function(result){
                  if(this.status == 0){
                    var assignUser = "ASSIGN-USER";
                    var message    = "MESSAGE";
//checkin引数 (assignUser,message)
                    var checkout = targetData.pmu.checkout(
                        assignUser,
                        message
                    );
                    if(checkout){
                        transaction.callback = function(){
                            if(!(xUI.XMAP.pmu.checkinNode)){
console.log('setBROWSING');
                                xUI.setUImode('browsing');
                            }else{
console.log('refreshSTATUS');
                                xUI.sync('productStatus');
                            }
                        };
                        serviceAgent.pushContent(transaction);
                    }else{
console.log('checkout failed');
                        transaction.fail();
                    }
console.log(result);
                  }else{
console.log('cancel');
                         transaction.fail();
                  }
                });
              }
            }
        break;
        case 'destroy'://ｘMap|Xps only(has .pmu)
            if(targetData.pmu){
                if(targetData.pmu.destroy()){
//ターゲットがXpsの場合のみデータロールバックをトライ
                    if(targetData instanceof Xps){
                        
                    }
console.log(transaction);
                    transaction.success();
                }else{
                    transaction.fail();
                }
            }
        break;
        case 'abort':
           if((xUI.uiMode=='management')&&(targetData.pmu)){
               
           }
        break;
        case 'receipt':;//ｘMap|Xps only(has .pmu)
            if((xUI.uiMode=='management')&&(targetData.pmu)){
//receipt / 検収
//モーダルパネル表示（操作ロック）ドキュメントの状態を提示してユーザの確認を促す
//メッセージ設定
                var msg = 'receipt-test';
                nas.showModalDialog('confirm',msg,'receipt',null,function(result){
                        console.log(result);
                });
                var targetNode = "newNode";
                var stageName  = "newStage";
                var jobName    = "newJob";
//receipt引数 (user,targetNode,stageName,jobName,slipNumber)
                var receipt = targetData.pmu.receipt(
                    xUI.currentUser,
                    targetNode,
                    stageName,
                    jobName,
                    slipNumber
                );
                if(receipt){
                    transaction.callback = function(){
                        xUI.setUImode('management');
                    };
                    serviceAgent.pushContent(transaction);
                }else{
                    transaction.fail();
                }
            }else{
                    transaction.fail();
            }
        break;
        case 'salvage':
           if((xUI.uiMode=='management')&&(targetData.pmu)){
               
           }
        break;
        case 'pull':;
            transaction.callback = function(transaction){xUI.resetScreen();};
            serviceAgent.pullContent(transaction);
            return true;
        break;
        case 'push':;
            transaction.callback = function(transaction){
console.log(transaction);
                if(transaction.target instanceof xUI.Document)
                    serviceAgent.currentRepository.updatePMDB();
                if(xUI.activeDocument)
                    xUI.resetScreen();
            };
            serviceAgent.pushContent(transaction);
            return true;
        break;
    }    
}
/*TEST
    console.log(xUI.manipulateDocument(transaction));
*/
/**
 *    uiMode変更  引数がなければ変更なし
 *    引数がモードキーワード以外ならば、モードを順次切り替えて
 *    現在のモード値を返す
 *  floatingモード消失 2020.01 再設定 2025 
 *    @params  {String}    newMode
 *    current     モード変更なし
 *    production  作業モード
 *    management  管理モード
 *    browsing    閲覧モード
 *    floating    自由入力モード
 * モード変更に伴うUIの書き換えを別メソッドに分離 20200118
 *      xUI.uiModeプロパティはxUI.XMAPの状態をベースに管理を行う
 *      各ドキュメントごとのチェックイン状態は別の管理となるので要注意
 */
xUI.setUImode = function (myMode){
    if(typeof myMode == 'undefined') myMode = 'current';
if(xUI.app == 'xpsedit'){
    document.getElementById('pmcui-checkin').innerHTML=((xUI.XPS.currentStatus.content =='Hold')||(xUI.XPS.currentStatus.content =='Active'))?nas.localize(nas.uiMsg.pMinUse):nas.localize(nas.uiMsg.pMcheckin);//'作業中':'作業開始'//
    switch (myMode){
        case 'current':;//NOP return
            return xUI.uiMode;
            break;
        case 'production':;
            if(xUI.XPS.currentStatus.content != 'Active'){return xUI.uiMode;}
              xUI.viewOnly = false;//メニュー切替
    $('#ddp-man').hide();
    $('#pmaui').hide();
    $('#pmcui').show();
    $('#pmfui').hide();
    $('span.subControl_TC').each(function(){$(this).hide()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).show()});
    $("li.fuiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = false;

            //作業中のドキュメントステータスは、必ずActiveなので以下のボタン状態
            //Active以外の場合はこのモードに遷移しない
            document.getElementById('pmcui-checkin').disabled    =true;
            document.getElementById('pmcui-update').disabled     =true;//初期値 diabled
            document.getElementById('pmcui-checkout').disabled   =false;
            document.getElementById('pmcui-activate').disabled   =true;
            document.getElementById('pmcui-deactivate').disabled =false;
            //インジケータカラー変更
            $('#pmcui').css('background-color','#bbbbdd');
            $('#pmcui').css('color','#666688');
            break;
        case 'floating':;
        if(xUI.XMAP.dataNode){return xUI.uiMode;}
    
//        if(xUI.XPS.currentStatus.content.indexOf("Floating")<0){return xUI.uiMode;}
         //floating で必要なメニュー
         /*
         新規登録  カレントドキュメントを現在のリポジトリに登録する
         
         */
              xUI.viewOnly = false;//メニュー切替
    $('#ddp-man').hide();
    $('#pmaui').hide();
    $('#pmcui').show();
    $('#pmfui').show();
    $('span.subControl_TC').each(function(){$(this).show()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    $("li.fuiMenu").each(function(){$(this).show()});
    document.getElementById('cutList').multiple = true;
            document.getElementById('pmcui-checkin').disabled    =true;//すべてのボタンを無効
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   =true;
            document.getElementById('pmcui-activate').disabled   =true;
            document.getElementById('pmcui-deactivate').disabled =true;
            //インジケータカラー変更
            $('#pmcui').css('background-color','#ddbbbb');
            $('#pmcui').css('color','#886666');
            break;
        case 'management':;
// マネジメントモードに入るには条件あり
// スタッフリストで制作管理者であるか、またはオーナーユーザであること
    if(false){ return xUI.uiMode;}
            //メニュー切替
              xUI.viewOnly =  true;
    $('#ddp-man').show();
    $('#pmaui').show();
    $('#pmcui').show();
    $('#pmfui').hide();
    $('span.subControl_TC').each(function(){$(this).show()})
    $("li.auiMenu").each(function(){$(this).show()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    $("li.fuiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = true;
            document.getElementById('pmcui-checkin').disabled    =true;//すべてのボタンを無効
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   =true;
            document.getElementById('pmcui-activate').disabled   =true;
            document.getElementById('pmcui-deactivate').disabled =true;
            //インジケータカラー変更
            $('#pmcui').css('background-color','#ddbbbb');
            $('#pmcui').css('color','#886666');
            break;
        case 'browsing':;
            //メニュー切替
              xUI.viewOnly = true;
    $('#ddp-man').hide();
    $('#pmaui').hide();
    $('#pmcui').show();
    $('#pmfui').hide();
    $('span.subControl_TC').each(function(){$(this).hide()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    $("li.fuiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = false;
            document.getElementById('pmcui-checkin').disabled    = ((xUI.sessionRetrace==0)&&((xUI.XPS.currentStatus.content =='Startup')||(xUI.XPS.currentStatus.content =='Fixed')))? false:true;                
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   = true;
            if (xUI.currentUser.sameAs(xUI.XPS.update_user)) {
            //ドキュメントオーナー
            document.getElementById('pmcui-activate').disabled   = ((xUI.sessionRetrace==0)&&((xUI.XPS.currentStatus.content =='Hold')||(xUI.XPS.currentStatus.content =='Fixed')||(xUI.XPS.currentStatus.content =='Active')))? false:true;
            }else{
            //オーナー外
            document.getElementById('pmcui-activate').disabled   = (xUI.XPS.currentStatus.content =='Fixed')?false:true;
            }
            document.getElementById('pmcui-deactivate').disabled = true;


            //インジケータカラー変更
            $('#pmcui').css('background-color','#bbddbb');
            $('#pmcui').css('color','#668866');
            break;
        default:;
            var nextMode = ['production','browsing','floating','management'].indexOf(xUI.uiMode);
            switch(xUI.uiMode){
            case "management":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'floating':'browsing';
            break;
            case "floating":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'management':'browsing';
            break;
            case "browsing":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'floating':'management';
            break;
            case "production":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'floating':'browsing';
            break;
            }
                return this.setUImode(nextMode);
    }
//プルダウンメニューの表示をステータスに合わせる
            this.pMenu('pMcheckin'      ,(document.getElementById('pmcui-checkin').disabled)?'disable':'enable');
            this.pMenu('pMsave'         ,(document.getElementById('pmcui-update').disabled)?'disable':'enable');
            this.pMenu('pMcheckout'     ,(document.getElementById('pmcui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMactivate'     ,(document.getElementById('pmcui-activate').disabled)?'disable':'enable');
            this.pMenu('pMdeactivate'   ,(document.getElementById('pmcui-deactivate').disabled)?'disable':'enable');

            this.pMenu('pMdiscard'      ,(xUI.XPS.currentStatus.content =='Active')?'enable':'disable');

            this.pMenu('pMreceipt'      ,(document.getElementById('pmaui-receipt').disabled)?'disable':'enable');
            this.pMenu('pMcheckoutF'    ,(document.getElementById('pmaui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMabort'        ,(document.getElementById('pmaui-abort').disabled)?'disable':'enable');
            this.pMenu('pMbranch'       ,(document.getElementById('pmaui-branch').disabled)?'disable':'enable');
            this.pMenu('pMmerge'        ,(document.getElementById('pmaui-merge').disabled)?'disable':'enable');
//
}else{
//アプリケーションのuiModeは、xUI.XMAP のステータスに基づくものとする
    switch (myMode){
        case 'current':;//NOP return
            return xUI.uiMode;
        break;
        case 'production':
            if(xUI.XMAP.pmu.currentNode.jobStatus.content != 'Active'){return xUI.uiMode;}
        break;
        case 'management':
// マネジメントモードに入るには条件あり
// スタッフリストで制作管理者であるか、またはリポジトリオーナーユーザであること
            if(false){return xUI.uiMode;}
        break;
        case 'browsing':
        break;
        default:;
            var nextMode = ['production','browsing','management'].indexOf(xUI.uiMode);
            switch(xUI.uiMode){
            case "management":
                nextMode = 'production';
            break;
            case "browsing":
                nextMode = 'management';
            break;
            case "production":
                nextMode = 'browsing';
            break;
            }
                return xUI.uiMode;
                //return this.setUImode(nextMode);
    }
}
    xUI.uiMode=myMode;
    xUI.setRetrace();
    xUI.sync('productStatus');
    return xUI.uiMode;
}
/**
 *    xUI.uiMode モード別メニュー更新
 *    標準では xUI.sync('productStatus')から呼び出される 単独実行可能
 *    引数なし
 *    戻値なし
 */
xUI.uiModeMenuUpdate = function(){
    var documentsCheckin = (xUI.XMAP.pmu.checkinNode)? true:false;
    var activeDocumentCheckin = false; var sessionRetrace = -1;
/*動作仕様変更で
    常時xUI.activeDocumentが存在する
    documentsCheckin一つで、タイムシートドキュメントにもチェックイン状態になった
    以上の点を踏まえて状態コントロールをリライト
 */
    if(xUI.activeDocument){
        activeDocumentCheckin = (xUI.activeDocument.content.pmu.checkinNode)? true:false;
        sessionRetrace = (xUI.activeDocument.content.pmu.currentNode)?
            xUI.activeDocument.content.pmu.currentNode.getDistance():-1;
        if((xUI.activeDocument.sessionRetrace)&&(xUI.activeDocument.sessionRetrace > 0)) sessionRetrace = xUI.activeDocument.sessionRetrace;//上書きする
        if (xUI.activeDocument.content.dataNode){
//リポジトリ所属データ
            $('#pmfui').hide();
            $("li.fuiMenu").each(function(){$(this).hide()});
            //css切り替えはここに
        }else{
//フローティングデータ
            $('#pmfui').show();
            $("li.fuiMenu").each(function(){$(this).show()});
            //css切り替えはここに
        }
    }
//チェックインボタンの表示切り替え
//    if(activeDocumentCheckin){
//        $('#pmcui-checkin').hide();
//      }else{
//        $('#pmcui-checkin').show();
//    }
    var setting = xUI.uiMode;
    if((xUI.uiMode != 'management')&&(xUI.activeDocumentId)){
        setting = (activeDocumentCheckin)? 'production':'browsing';
    }
    if(! xUI.XMAP.dataNode){
//フロートエントリ
//インジケータカラー変更
//            $('#pmcui').css('background-color','#dddddd');
            $('.jobControl').css('border-color','#ff8888');
}else{
//リポジトリ所属エントリ サーバ種別ごとの色変えがあったほうが良い
/*  サーバまたはリポジトリごとのカラー設定を考慮 イメージカラー またはテーマカラーとして設定してもらう
*/
            $('.jobControl').css('border-color','#ff22ff');
    switch (xUI.uiMode){
    case 'production':
            //インジケータカラー変更
//            $('#pmcui').css('background-color','#bbbbdd');
            $('#pmcui').css('color','#666688');
            break;
    case 'management':
            //インジケータカラー変更
//            $('#pmcui').css('background-color','#ddbbbb');
            $('#pmcui').css('color','#886666');
            break;
    case 'browsing':;
    default:
            //インジケータカラー変更
//            $('#pmcui').css('background-color','#bbddbb');
            $('#pmcui').css('color','#668866');
    }
}
//状況を判定してスイッチの表示|非表示 有効|無効を切り替え
    switch (setting){
        case 'production':;
    $('#ddp-man').hide();
    $('#pmaui').hide();
    if(activeDocumentCheckin){
        $('#pmbui').hide();
        $('#pmeui').show();
    }else{
        $('#pmbui').show();
        $('#pmeui').hide();
    }
    $('span.subControl_TC').each(function(){$(this).hide()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).show()});

    document.getElementById('cutList').multiple = false;

//mode production (= トレーラードキュメントがActive)
            document.getElementById('pmcui-checkin').disabled    = true ;//すでにproductionなので常にdisabled(消すか？)
            document.getElementById('pmcui-update').disabled     = true ;//初期値 diabled 状況で変わる
//フォーカスドキュメントのステータスで分岐
        if(xUI.activeDocument.content.pmu.currentNode.jobStatus.content == 'Active'){
            document.getElementById('pmcui-checkout').disabled   = false;//カレントがアクティブならばenable
        }else{
            document.getElementById('pmcui-checkout').disabled   = true;//チェックアウト不能(チェックインしていない)
        }
        if((xUI.XMAP.pmu.checkinNode)&&(xUI.XMAP.pmu.checkinNode.getPath('id') == xUI.activeDocument.content.pmu.currentNode.getPath('id'))){
            document.getElementById('pmcui-activate').disabled   = false;//チェックイン可能
        }else{
            document.getElementById('pmcui-activate').disabled   = true;//チェックイン不可
        }
        break;
        case 'management':;
    $('#ddp-man').show();
    $('#pmaui').show();
    $('#pmbui').hide();
    $('#pmeui').hide();
    $('span.subControl_TC').each(function(){$(this).show()})
    $("li.auiMenu").each(function(){$(this).show()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = true;
            document.getElementById('pmcui-checkin').disabled    =true;//すべてのボタンを無効
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   =true;
            document.getElementById('pmcui-activate').disabled   =true;
            break;
        case 'browsing':;
    $('#ddp-man').hide();
    $('#pmaui').hide();
    $('#pmbui').show();
    $('#pmeui').hide();
    $('span.subControl_TC').each(function(){$(this).hide()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = false;
//チェックイン可能条件
/*
    共通  現在未チェックイン
    xMap    ドキュメントステータスがStartup|Fixed

    Xpst    xMapがチェックイン済み
*/
            document.getElementById('pmcui-checkin').disabled    = (
                ((xUI.activeDocumentId==0)&&(! documentsCheckin)&&(
                    (xUI.activeDocument.content.pmu.currentNode.jobStatus.content =='Startup')||(xUI.activeDocument.content.pmu.currentNode.jobStatus.content =='Fixed')
                ))||((xUI.activeDocumentId)&&(documentsCheckin)&&(!activeDocumentCheckin))
            )? false:true;
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   = true;
console.log(xUI.currentUser.sameAs(xUI.XMAP.pmu.currentNode.updateUser))
//アクティベート(作業再開判定)
                if (xUI.currentUser.sameAs(xUI.XMAP.pmu.currentNode.updateUser)) {
//ドキュメントオーナー(最終更新ユーザ)
console.log(sessionRetrace+':'+xUI.activeDocument.content.pmu.currentNode.jobStatus.content);
                    document.getElementById('pmcui-activate').disabled   =(
                        (sessionRetrace == 0)&&(
                            (xUI.activeDocument.content.pmu.currentNode.jobStatus.content =='Hold')||(xUI.activeDocument.content.pmu.currentNode.jobStatus.content =='Fixed')||(xUI.activeDocument.content.pmu.currentNode.jobStatus.content =='Active')
                        )
                )? false:true;
            }else{
//オーナー外
                document.getElementById('pmcui-activate').disabled   = true;

//                document.getElementById('pmcui-activate').disabled   = (xUI.XMAP.pmu.currentNode.jobStatus.content =='Fixed')?false:true;
            }
            break;
    }
//ノードステータス表示を更新
    xUI.updateStatus();
//プルダウンメニューの表示をステータスに合わせる
            this.pMenu('pMcheckin'      ,(document.getElementById('pmcui-checkin').disabled)? 'disable':'enable');
            this.pMenu('pMsave'         ,(document.getElementById('pmcui-update').disabled)?  'disable':'enable');
            this.pMenu('pMcheckout'     ,(document.getElementById('pmcui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMactivate'     ,(document.getElementById('pmcui-activate').disabled)?'disable':'enable');
            this.pMenu('pMdiscard'      ,(xUI.XMAP.pmu.currentNode.jobStatus.content =='Active')?'enable':'disable');
            this.pMenu('pMreceipt'      ,(document.getElementById('pmaui-receipt').disabled)?  'disable':'enable');
            this.pMenu('pMcheckoutF'    ,(document.getElementById('pmaui-checkout').disabled)? 'disable':'enable');
            this.pMenu('pMabort'        ,(document.getElementById('pmaui-abort').disabled)?    'disable':'enable');
            this.pMenu('pMbranch'       ,(document.getElementById('pmaui-branch').disabled)?   'disable':'enable');
            this.pMenu('pMmerge'        ,(document.getElementById('pmaui-merge').disabled)?    'disable':'enable');
}
/*    xUI.ipChg(status boolean)
    入力モード変更 原画|動画モードを切り替えと同時に表示を調整

xUI.ipChg=function(newMode){
    xUI.ipMode =  (newMode)? 1:0 ;
    document.getElementById('iptSlider').innerText = (xUI.ipMode > 0)? '動画' : '原画';
    if(document.getElementById("iptChange").checked != (xUI.ipMode > 0)){
        document.getElementById("iptChange").checked = (xUI.ipMode > 0);
    };
    document.getElementById("iNputbOx").focus();
    return this.ipMode;
};
// */
/**
 *  @params {Boolean}   status
 *  @params {Boolean}   opt
 *    タイムシートセル編集フラグ 切り替えと同時に表示を調整
 */
xUI.edChg = function(status,opt){
    if(this.viewOnly) return xUI.headerFlash('#bb8080');
    this.edchg = status;
    document.getElementById("edchg").style.backgroundColor = (this.edchg)? this.editingColor:"";//表示
};
//
/**
 *  @paramas {Number|String} myModes
 *  @params  {Object any} opt
 *    myModes    モードを数値または文字列で指定  数値で格納
 *    opt    オプション引数
 *    編集モードを変更してカラーをアップデートする
 *    リフレッシュつき
 */
xUI.mdChg=function(myModes,opt){
            //編集操作モード  0:通常入力  1:ブロック移動  2:区間編集  3:領域フロート状態
    if(typeof myModes == "undefined") myModes="normal";
//モード遷移にあわせてUIカラーの変更
    switch(myModes){
    case "float":
    case "section-float":
    case 3:
//セクション編集時のフローティングモード
// emode==2以外ではこの状態に入れない
    if((this.edmode==2)&&(! this.viewOnly)){
       this.edmode=3;
        this.floatSourceAddress     = this.Select.slice();    //移動ソースアドレスを退避
        this.selectedColor          = this.inputModeColor.FLOAT;    //選択セルの背景色
//        this.spinAreaColor          = this.inputModeColor.FLOATspin;    //非選択スピン背景色
//        this.spinAreaColorSelect    = this.inputModeColor.FLOATspinselected;    //選択スピン背景色
        this.spinAreaColor          = this.inputModeColor.FLOATselection;    //非選択スピン背景色
        this.spinAreaColorSelect    = this.inputModeColor.FLOATselection;    //選択スピン背景色
        this.selectionColor         = this.inputModeColor.FLOATselection;    //選択領域の背景色
        this.selectionColorTail     = this.inputModeColor.FLOAT;    //
    };
    break;
    case "section":
    case 2:
/*
 *  モード'normal'かつトラックのダブルクリックでセクション編集モードに入る  抜けるには明示的にmdChg('normal')をコールする必要がある
 *  現行でタイムライン種別トラップあり  ダイアログトラックのみ遷移可能
  さらにダイアログトラックでは値のない区間は選択を抑制中
*/
//sectionManipulateOffsetは、ここでは初期化されない
//if((this.XPS.xpsTracks[this.Select[0]].option.match(/dialog|effect|camera/))){}
//if((this.XPS.xpsTracks[this.Select[0]].option=='dialog')){}
if(true){
  if(this.edmode<2){
//      if(this.spin() > 1){this.spinBackup=this.spin();this.spin(1);};//スピン量をバックアップしてクリア ? これ実はいらない？
      this.selectBackup         = this.Select.concat()      ;       //カーソル位置バックアップ
      this.selectionBackup      = this.Selection.concat()   ;       //選択範囲バックアップ
      this.floatSourceAddress   = this.Select.concat()      ;       //移動元ソースアドレスを退避
      this.floatTrack           = this.XPS.xpsTracks[this.Select[0]];//編集破棄の際に復帰するためモード変更時のトラック全体を記録
      this.floatTrackBackup     = this.floatTrack.duplicate()       ;//編集確定時のためトラック全体をバッファにとる

      this.floatSection         = this.floatTrackBackup.getSectionByFrame(this.Select[1]);

      if((this.floatTrack.option =='dialog')&&(! this.floatSection.value)){
    //操作対象セクションを選択状態にする
      this.selectCell([
        this.Select[0],
        this.floatSection.startOffset()
      ]);
      this.selection([
        this.Select[0],
        this.floatSection.startOffset()+this.floatSection.duration-1
      ]);

        this.floatTrack         = null;
        this.floatTrackBackup   = null;
        this.floatSection       = null;
        return false;
      }
      this.floatSectionId   = this.floatSection.id();
      this.floatUpdateCount = 0;//フロート編集中の更新カウントをリセット

    //操作対象セクションを選択状態にする
      this.selectCell([
        this.Select[0],
        this.floatSection.startOffset()
      ]);
      this.selection([
        this.Select[0],
        this.floatSection.startOffset()+this.floatSection.duration-1
      ]);
  }
      this.edmode=2;
     
      //未確定編集はxUI.put でなくxUI.XPS.putで更新する。
      //範囲確定はここで行う？
        this.selectedColor          = this.inputModeColor.SECTION           ;    //選択セルの背景色
        this.spinAreaColor          = this.inputModeColor.SECTIONselection  ;    //非選択スピン背景色
        this.spinAreaColorSelect    = this.inputModeColor.SECTIONselection  ;    //選択スピン背景色
        this.selectionColor         = this.inputModeColor.SECTIONselection  ;    //選択領域の背景色
        this.selectionColorTail     = this.inputModeColor.SECTIONtail       ;    //選択領域の末尾
        this.Mouse.action=false;
};//セクション編集モード遷移
    break;
    case "block":    //ブロックフロートモードに遷移
    case 1:        //前モードがノーマルだった場合のみ遷移可能
    if(this.edmode==0){
      this.edmode=1;
//      if(this.spin()){this.spinBackup=this.spin();this.spin(1);};//スピン量をバックアップしてクリア
        this.floatSourceAddress  = this.Select.concat();    //移動ソースアドレスを退避
        this.selectedColor       = this.inputModeColor.FLOAT;    //選択セルの背景色
        this.spinAreaColor       = this.inputModeColor.FLOATspin;    //非選択スピン背景色
        this.spinAreaColorSelect = this.inputModeColor.FLOATspinselected;    //選択スピン背景色
        this.selectionColor      = this.inputModeColor.FLOATselection;    //選択領域の背景色
        this.selectionColorTail  = this.inputModeColor.FLOATselection;    //選択領域の背景色
    }
    break;
    case "normal":    //ノーマルモードに復帰
    case 0:        //前モードに従って終了処理をここで行う
    default :    //
    if(this.edmode>=2){
        //区間編集モード確定または編集破棄処理
/*
//console.log(this.floatSourceAddress);
//console.log(this.floatDestAddress);
//console.log(this.floatSectionId);
//console.log(this.floatSection);
*/
    this.sectionManipulateOffset = ['tail',0];//区間編集ハンドルオフセット
        if(true){
        //  確定処理はリリース毎に実行される
        /*
        //現在のトラックのストリームを処理バッファにとる
        var currentStream = this.floatTrack.join();
        var backupStream  = this.floatTrackBackup.join();

    var currentFrame=xUI.Select[1];
    var currentSelection=xUI.Selection[1];
    xUI.selectCell([xUI.Select[0],0]);//トラック冒頭へ移動
    xUI.selection();
    xUI.put(trackContents);
    xUI.selectCell([xUI.Select[0],currentFrame]);
    xUI.selection([xUI.Select[0],currentFrame+currentSelection]);

        //一旦バックアップを書き戻して
        xUI.XPS.put([xUI.Select[0],0],backupStream);
//        xUI.syncSheetCell([xUI.Select[0],0],[xUI.Select[0],xUI.XPS.xpsTracks[0].duration]);
        //改めてundo付きで処理
        xUI.selectCell([xUI.Select[0],0]);
        xUI.put(currentStream);
//console.log(currentStream);
        */
        this.floatTrack         = null;
        this.floatTrackBackup   = null;
        this.floatSection       = null;
        this.floatSectionId     = null;
        this.floatUpdateCount   = 0;
        //  編集破棄はカウントした変更回数分のundoで行う
        }
        this.edmode=0;
        this.selectedColor    =this.inputModeColor.NORMAL;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.NORMALspin;    //非選択スピン背景色
        this.spinAreaColorSelect=this.inputModeColor.NORMALspinselected;//選択スピン背景色
        this.selectionColor    =this.sheetLooks.SelectionColor;            //選択領域の背景色
        this.selectionColorTail    =this.sheetLooks.SelectionColor;            //選択領域の背景色

//        this.selectCell(this.floatSourceAddress);//ソース位置を復帰廃止
//        this.selection(add(this.floatSourceAddress,this.selectionBackup));//選択範囲の復帰廃止
//        this.spin(this.spinBackup);//スピン量をバックアップから復帰
    }else if(this.edmode==1){
        this.edmode=0;
        this.selectedColor    =this.inputModeColor.NORMAL;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.NORMALspin;    //非選択スピン背景色
        this.spinAreaColorSelect=this.inputModeColor.NORMALspinselected;//選択スピン背景色
        this.selectionColor    =this.sheetLooks.SelectionColor;            //選択領域の背景色
        this.selectionColorTail    =this.sheetLooks.SelectionColor;            //選択領域の背景色
//if(dbg) dpgPut("select:"+this.floatSourceAddress+"\nmove:"+sub(this.floatDestAddress,this.floatSourceAddress));

        this.selectCell(this.floatSourceAddress);//ソース位置復帰
        this.move(sub(this.floatDestAddress,this.floatSourceAddress),opt);//ムーブコマンド発行

//        this.spin(this.spinBackup);//スピン量をバックアップから復帰
    }
    }
    //var bkRange=this.Selection.slice();
    this.selection(add(this.Select,this.Selection));
    
//    if(xUI.XPS.xpsTracks[xUI.Select[0]].option.match( /dialog|sound/ ))    SoundEdit.init();
    switch(xUI.XPS.xpsTracks[xUI.Select[0]].option){
    case 'dialog':
    case 'sound' :
        SoundEdit.init();
    break;
    default:
        //NOP
    }
    return this.edmode;
}
/**
    移動先セルを指定して区間選択範囲を更新する
    セクションの内容を自動編集してUndoバッファを更新せずに画面を書き換える処理はここで行う
    ここでの選択範囲はすべて編集中の仮範囲
    確定後にバックアップの選択範囲と置き換えまたは編集破棄の際はバックアップに復帰
    自動編集は常にバックアップ内容をベースに行う
引数:
    destination 移動先フレーム
参照プロパティ:    
    xUI.sectionManipulateOffset は[編集サブモード,選択中のセル（ヘッド）に対するオフセット]  ターゲットから計算する
    
 */
xUI.sectionPreview=function(destination){
    if((xUI.edmode<2)||(xUI.viewOnly)) return xUI.headerFlash('#ff8080');
//    if((xUI.edmode<2)||(xUI.viewOnly)) return false;
    if(typeof destination == 'undefined')   destination = this.Select[1];
    var hotpoint    = xUI.Select[1]+xUI.sectionManipulateOffset[1];
 //   this.sectionManipulateOffset[1]=hotpoint-this.Select[1];//オフセットがでる
//    if(        Math.abs(xUI.sectionManipulateOffset[1]-((xUI.Selection[1]+xUI.Select[1])/2)) >        Math.abs(xUI.Selection[1]/2)    ) return 'overRange';//有効範囲外指定
    switch(xUI.sectionManipulateOffset[0]){
    case    0   :
    case 'head' :
//先頭指定  末尾固定で伸縮
        var tail=xUI.getid('Selection');
        xUI.selectCell([xUI.Select[0],destination-xUI.sectionManipulateOffset[1]]);
        xUI.selection(tail);
        break;
    case    1   :
    case 'body' :
//移動 
        xUI.selectCell([xUI.Select[0],destination-xUI.sectionManipulateOffset[1]]);
        break;
    case    2   :
    case 'tail' :
    default     :
//末尾指定  先頭固定で伸縮 sectionManipulateOffsetを更新
        var duration=xUI.Selection[1]+(destination-hotpoint);
        xUI.selection(add(xUI.Select,[0,duration]));
        xUI.sectionManipulateOffset[1]=xUI.Selection[1];
    }
    return true;
}

//test
//xUI.mdChg(2);
//xUI.sectionPreview(3,4);
// 
/*
引数：  action
    タイムシートセクション操作の結果を実際の画面に反映させるメソッド
    Xps.xpsTracks.menber.manipulateSection()に対応するxUI側の処理
    データ配置の際にトラック全体を書き直すので、カーソル位置を復帰させるためにundoStackに第４要素を積む
    xUI.putメソッドを経由せずにこのルーチン内で完結させる.
*/
xUI.sectionUpdate=function(){
     if(this.viewOnly) return xUI.headerFlash('#ff8080');
    var trackContents = xUI.floatTrack.sections.manipulateSection(xUI.floatSectionId,xUI.Select[1],xUI.Selection[1]);
//undo   保留の場合は以下のルーチンを使用
/* undo保留ではなくユーザが各工程を辿れるように１操作毎に書換を行い、一括undoのために操作回数を記録する。*/
//    xUI.XPS.put([xUI.Select[0],0],trackContents[0]);
//    xUI.syncSheetCell([xUI.Select[0],0],[xUI.Select[0],xUI.XPS.xpsTracks[0].duration]);

    var currentFrame     = xUI.Select[1];
    var currentSelection = xUI.Selection[1];
    xUI.scrollStop = true;
      xUI.selectCell([xUI.Select[0],0]);
        xUI.selection();
          xUI.sheetPut(trackContents[0]);
//対象トラックのセクションが（ダイアログ等）すべての要素を内包しない場合セレクション位置を更新する必要がある
//セクションの先頭を取得するためにパースするか
        xUI.floatUpdateCount ++;//increment
    xUI.floatSectionId = xUI.XPS.xpsTracks[xUI.Select[0]].getSectionByFrame(trackContents[1]).id();
         xUI.selectCell([xUI.Select[0],trackContents[1]]);
//      xUI.selection([xUI.Select[0],xUI.Select[1]+Math.abs(currentSelection)]);
//        this.selection([
//            this.Select[0],
//            trackContents[1]+this.floatSection.duration-1
//        ]);
      xUI.selection([xUI.Select[0],trackContents[1]+trackContents[2]]);
    xUI.scrollStop = false;

    if(xUI.XPS.xpsTracks[xUI.Select[0]].option=="dialog" ) SoundEdit.getProp();
    xUI.mdChg(0);xUI.mdChg(2);
}
/*    xUI.floatTextHi()
引数:なし  モード変数を確認して動作
モードチェンジの際に編集（保留）中のテキストを薄く表示する/もどす
*/
xUI.floatTextHi=function(){
    if(this.edmode>1) return false;
    var paintColor=(this.edmode==0)?"black":this.floatTextColor;
var range=[this.floatSourceAddress,add(this.floatSourceAddress,this.Selection)];
//    dbgPut("selectionHi :\n"+range.join("\n"));
//指定範囲をハイライト
    for (var C=range[0][0];C<=range[1][0];C++){
        for (var L=range[0][1];L<=range[1][1];L++){
            if((C<0) || (L<0)||(C>=this.XPS.xpsTracks.length)||(L>=this.XPS.xpsTracks[C].length)){
//    当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
//                dbgPut(range.toString());
            }else{
  if(document.getElementById(C+"_"+L).style.color!=paintColor) document.getElementById(C+"_"+L).style.color=paintColor;
//文字色変更
            };
        };
    };
}
/*
    現在のファイルからファイル名を作成
    引数でマクロを受け付ける
    引数が空の場合は標準識別子で返す $TITLE$#$OPUS$[$SUBTITLE$]__s$SCENE$-c$CUT$($TC$)
    このメソッドは役割を終えているので削除予定
    保存ファイル名は getIdentifierで取得
    
*/
xUI.getFileName=function(myFileName){
return (nas.Pm.getIdentifier(xUI.XMAP,'full')).replace(/\//g,"_");

//    myResult=(typeof myFileName=="undefined")?"$TITLE$OPUSs$SCENEc$CUT($TC)":myFileName;
//    myResult=(typeof myFileName=="undefined")?"$TITLE$#$OPUS$[$SUBTITLE$]__s$SCENE$-c$CUT$($TC$)":myFileName;
    var myResult=(typeof myFileName=="undefined")?"$TITLE$#$OPUS$__s$SCENE$-c$CUT$":myFileName;
    myResult=myResult.replace(/\$TITLE\$/g,this.XPS.title);
    myResult=myResult.replace(/\$SUBTITLE\$/g,this.XPS.subtitle);
    myResult=myResult.replace(/\$OPUS\$/g,this.XPS.opus);
    myResult=myResult.replace(/\$SCENE\$/g,this.XPS.scene);
    myResult=myResult.replace(/\$CUT\$/g,this.XPS.cut);
    myResult=myResult.replace(/\$TIME\$/g,this.XPS.time());
    myResult=myResult.replace(/\$TC\$/g,this.XPS.getTC(this.XPS.time()));
    myResult=myResult.replace(/[\s\.]/g,"");
    myResult=myResult.replace(/:;\/\\|\,\*\?"＜＞/g,"_");//"
    
    return myResult;
}
/*    シートボディフラッシュ
        xUI.flush(content)
        現在のシートの入力領域をすべてcontentで埋める
        戻り値は常にtrue
        これは試験用関数：実用性は無い  確かもう使ってない  20161106
*/
//
xUI.flush=function(content){
    if(! content){content=""};
//強制的にnullデータで全レイヤ・全フレームを書き換え
    var myDuration = this.XPS.duration();
//    タイムラインループ
    for (var T=0;T< this.XPS.xpsTracks.length;T++){
        this.XPS.xpsTracks[T].sectionTrust=false;
        this.XPS.xpsTracks[T].length= 0;
        this.XPS.xpsTracks[T].length= myDuration;
//        フレームループ
        for(var F=0;F < myDuration;F++){this.XPS.xpsTracks[T][F]=content;};
    };
    this.syncSheetCell();
    return true;
};
/** xUI.UndoBuffer オブジェクト
 * @constractor
 *
 */
xUI.UndoBuffer=function(){
    this.undoStack= []       ;//アンドウスタック配列
    this.undoPt  = 0         ;//アンドウポインタ初期化
    this.skipCt  = 0         ;//再描画抑制カウンタ初期化
    this.storePt = 0         ;//保存ポインタ初期化
}
xUI.UndoBuffer.prototype.flush = function(type){
    this.undoStack= [] ;//アンドウスタッククリア
    if(type=='xpst'){
        this.undoStack.push([new xUI.InputUnit([0,1],'')]);
    }else{
        this.undoStack.push([new xUI.InputUnit('','')]);
    }
    this.undoPt  =0 ;      //アンドウポインタ初期化
    this.skipCt  =0 ;      //再描画抑制カウンタ初期化
    this.storePt =0 ;      //保存ポインタ初期化
};

/*
新モデル
    undoバッファ初期化
        undoバッファをクリアして初期化

            undoStackのデータ構造 undoUnitCollectionArray
    [
        inputUnit:{
            target    :{Object} <xUI.Document 参照 追加プロパティ>,
            address   :{String|Array} <操作対象キーワード|アドレス(セレクト座標+セレクション)>,
            value     :{String} <処理データ(入力ストリーム)>,
            backup  :{String} <応答データ(入力ストリーム)>
            <他にも追加プロパティを設定可能>
        }.....
    ]
undoUnitは、inputUnitを拡張したものを使用する


//旧モデル
Xpst 操作記録第一形式
        [セレクト座標,セレクション,入力データストリーム,[セレクト座標,セレクション]]
    または第二形式（第二形式は廃止の予定）
        [セレクト座標,セレクション,Xpsオブジェクト]

    座標と選択範囲(セレクション)は配列、入力データはcomma,改行区切りの2次元のstream
    第４要素が存在する場合は、その位置にカーソル移動を行う

    第３要素がXpsオブジェクトであった場合は、ドキュメント全体の更新が行われた場合である
    その際は、処理系を切り替えて以下の操作を行う
    従来、UNDOバッファをフラッシュしていた操作が行われた場合
    現状のXPSデータを、オブジェクト化してUndoバッファに積みundoポインタを加算する。
    オブジェクト化の際は参照が発生しないように新規のXpsオブジェクトを作成のこと

    セッション内で明示的にundoバッファをクリアする際はこのメソッドをコールする

clear    :    セッション開始/ユーザ指定時
NOP    :    新規作成/保存/ダウンロード

    undoに画面描画保留機能を追加
    undoカウンタが立っている限り画面の再描画を行わない

xUI.activeDocument.undoBuffer.

undoBufferのフラッシング（初期化）はオブジェクトメソッドに変更して、ドキュメントの全てのundoBufferをクリアする
 */
xUI.flushUndoBuf=function(){
    this.inputFlag= "nomal";//入力フラグ "nomal"|"undo"|"redo"|"cut"|"paste"|"move"
    for(var i = 0; i< this.documents.length ; i ++)
    this.documents[i].undoBuffer.flush(this.documents[i].type);//アンドウスタッククリア
}
/*
    保存ポインタを参照してドキュメントが保存されているか否かを返す関数
    保存状態の変更とリセットも可能

 */
xUI.isStored=function(){
    if(! this.activeDocument ) return true;//初期化前は必ず trueを返す
    return (this.activeDocument.undoBuffer.undoPt==this.activeDocument.undoBuffer.storePt)
};//このリザルトが保存状態を表す
xUI.setStored=function(myPt){
    switch(myPt){
    case "current":this.activeDocument.undoBuffer.storePt=this.activeDocument.undoBuffer.undoPt;
    break;
    case "zero":this.activeDocument.undoBuffer.storePt=0;
    break;
    case "force":this.activeDocument.undoBuffer.storePt=-1;//常にfalseになる値
    break;
    default:
        if(myPt>=0){
            this.activeDocument.undoBuffer.storePt=Math.floor(myPt);//正の数値ならその数値を整数でセット
        }
    }
    return (this.activeDocument.undoBuffer.undoPt==this.activeDocument.undoBuffer.storePt);//セット後の状態を戻す
};
/*
    作業用バックアップオブジェクト
    ユーザによる保存指定可能
    明示的に破棄することが可能
    実行環境の違いによる動作の違いはメソッド内で吸収する。

    xUI.buildBackup();現在の作業バックアップをビルドして返す
    バックアップは無名オブジェクトで旧来のリファレンスのバックアップ関連も包括している
        {
            dataIdf         :'nas_application_backup_data',
            documents       :[ドキュメント配列],
            references      :[リファレンスデータ配列],
            activeDocumentId:<Number.ID>,
            sessionId       :[セッション追跡ID配列],
            undoBuffers     :[配列]
        }
    xUI.setBackup();現在の作業バックアップをストアする
    xUI.getBackup();現状のバックアップデータを返す  バックアップデータがない場合はfalse
    xUI.clearBackup();現在のバックアップデータを廃棄する。
*/
xUI.buildBackup=function(){
    var backupClast={
            dataIdf         : 'nas_application_backup_data',
            documents       : [this.documents[0].content.toString()],
            references      : [],
            activeDocumentId: parseInt(this.activeDocumentId),
            sessionId       : [String(this.documents[0].sessionRetrace)]
    };
//    ,undoBuffers:[JSON.stringify(this.documents[0].undoBuffer)]        

    for (var bix=1;bix<this.documents.length;bix++){
        backupClast.documents.push(this.documents[bix].content.toString());
        backupClast.references.push((this.documents[bix].referenceContent)? this.documents[bix].referenceContent.toString():null );
        backupClast.sessionId.push(String(this.documents[bix].sessionRetrace));
//        backupClast.undoBuffers.push(JSON.stringify(this.documents[bix].undoBuffer));
    }
console.log(backupClast);
console.log(JSON.stringify(backupClast));
    return JSON.stringify(backupClast);
}
xUI.restoreBackup=function(BackupStream){
console.log(BackupStream)
    var backupClast= JSON.parse(BackupStream);
console.log(backupClast);
    if((! backupClast.dataIdf)||(backupClast.dataIdf != 'nas_application_backup_data')) return false;
    if(backupClast.documents.length){
        this.documents.clear();//アプリケーションドキュメントバッファクリア
        this.documents.push(
            new xUI.Document(
                new nas.xMap().parsexMap(backupClast.documents[0]),
                null
            )
        );
        this.XMAP = this.documents[0].content;
        this.documents[0].id = 0;
        this.documents[0].undoBuffer=new xUI.UndoBuffer();
//        Object.assign(this.documents[0].undoBuffer,JSON.parse(backupClast.undoBuffers[0]));
        this.documents[0].sessionRetrace=backupClast.sessionId[0];

        for (var bix=1;bix<backupClast.documents.length;bix++){
//console.log(backupClast.documents[bix]);
//console.log(new nas.Xps().parseXps(backupClast.documents[bix]));
            this.documents.push(
                new xUI.Document(
                    new nas.Xps().parseXps(backupClast.documents[bix]),
                    new nas.Xps().parseXps(backupClast.references[bix-1])
                )
            );
            this.documents[bix].id = bix;
            this.documents[bix].undoBuffer=new xUI.UndoBuffer();
//            Object.assign(this.documents[bix].undoBuffer,JSON.parse(backupClast.undoBuffers[bix]));
            this.documents[bix].sessionRetrace=backupClast.sessionId[bix];
        }
        
console.log('restored backupuData refreash');
        this.activeDocument = this.documents[0];//[backupClast.activeDocumentId];
        this.activeDocumentId = 0;//backupClast.activeDocumentId;
        this.documents.activate(backupClast.activeDocumentId);
console.log(this.documents)
        this.resetReceipt();

        this.resetSheet();
    }
};
xUI.setBackup = function(){
/*
    保存・レストア・削除を一つのメソッドに統一して処理する。
    プラットフォーム別の処理分岐はメソッド側で処置

    xMap拡張に伴って仕様を変更 2019
バックアップの内容は 編集中の xMap/XPS/refereneXPS
*/

/*
    html5対応 localStorageに対して保存する。AIRはWebStorageが無い
    AIR他のlocalStorageのない環境に対して操作互換のlocalStorageオブジェクトを作成 2016.06.17
*/
    if(typeof localStorage=="undefined"){
//localStorageのないブラウザならサーバストア・CGIダウンロード  どちらもダメなら別ウインドウに書き出し
//CGIダウンロード時にはリスタートが実行されるのでその部分の排除コードが必要
//↑==callEcho時点で先行で保存フラグを立てれば自動的に回避可能
//AIRならsaveAs tempSave モーダル保存があった方がよいかも
if(fileBox.saveFile){fileBox.saveFile();}else{writeXPS(this.XPS);}

    }else{
        localStorage.setItem("info.nekomataya.remaping.backupData",this.buildBackup());
/*リファレンスデータ込みでまるごとバックアップクラスタにまとめたので、このエリアは不要
        if(this.referenceXPS){
//            alert(this.referenceXPS.toString());
          localStorage.setItem("info.nekomataya.remaping.referenceData",this.referenceXPS.toString());
//            alert(this.referenceXPS.toString());
        }*/
        if(false){
            var msg = localize(nas.uiMsg.dmBackupDone);//バックアップ終了
            alert(msg);
            };//表示は設定で抑制可能にする
        xUI.setStored("current");xUI.sync();
    }
//==================================== ここまでをシステムバックアップメソッドに移行
};
xUI.getBackup =function(){
//
    var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
    if(myBackup!==null){
      if(confirm(localize(nas.uiMsg.dmBackupConfirm))) xUI.restoreBackup(myBackup);
    }else{
      alert(localize(nas.uiMsg.dmBackupNodata));//バックアップにデータなし
    }
}
xUI.clearBackup =function(){
    var myBackup=localStorage.removeItem("info.nekomataya.remaping.backupData");
    //var myReference=localStorage.removeItem("info.nekomataya.remaping.backupReference");
    alert(localize(nas.uiMsg.dmBackupClear));//バックアップクリア
}
/*    未保存時の処理をまとめるメソッド
未保存か否かを判別してケースごとのメッセージを出す
ユーザ判断を促して処理続行か否かをリザルトする
*/
xUI.checkStored=function(mode){
if(!mode){mode=null;}
    if(xUI.isStored()){return (true)};//保存済みなら即 true
if(fileBox.saveFile){
var    msg = localize(nas.uiMsg.dmDocumentNosave);
//ドキュメントの保存・保存しないで更新・処理をキャンセルの３分岐に変更 2013.03.18
    msg+="\n"+localize(nas.uiMsg.documentConfirmOkCancel)+"\n";
//    nas.showModalDialog("confirm2",msg,"ドキュメント更新",0,
/*
    function(){
    switch (this.status){
case 0:;//yes 保存処理  後でテンポラリファイルを実装しておくこと        
            fileBox.openMode=mode;//ファイル保存に続行処理モードが必要  デフォルトは保存のみ
            fileBox.saveFile();
break;
case 1:;
break;
case 2:;
break;
    }
);
*/
    var myAction=confirm(msg);
    if(myAction){
        //保存処理  後でテンポラリファイルを実装しておくこと        
            fileBox.openMode=mode;//ファイル保存に続行処理モードが必要  デフォルトは保存のみ
            fileBox.saveFile();
            return false;
    }else{
        xUI.setStored("current");xUI.sync();return true;// キャンセルの場合は保存しないで続行
    }
}else{
    var msg  = localize(nas.uiMsg.dmDocumentNosaveExport);//エクスポートしますか？
        msg += "\n"+localize(nas.uiMsg.dmDocumentConfirmOkCancel)+"\n";//
    var myAction=confirm(msg);
    if(myAction){
        //保存処理  後でテンポラリファイルを実装しておくこと        
            writeXPS(xUI.XPS);xUI.setStored("current");xUI.sync();
            return true
//HTMLモードの保存は頻繁だと作業性が低下するので一考
            if(config.ServiceUrl){callEcho()};//CGIエコー

    }else{
        //破棄して続行
        xUI.setStored("current");xUI.sync();return true
    }
}
}

/** アプリ画面全体をシフトさせる(オフセットを設定)
    @params {number}    x
    @params {number}    y

右揃えのアイテムをシフトした分だけ左に寄せて画面内に収める処理つき
現在の値に引数を加える。戻りは想定されないので注意

*/
xUI.screenShift = [0,0];
xUI.shiftScreen = function(x,y){
// body '(top),right,bottom,(left)'
    var currentBox = [parseInt($('body').css('padding-top')),parseInt($('body').css('padding-left'))];
//console.log(currentBox);
    currentBox.forEach(function(itm,idx,itself){itself[idx]=parseInt(itm);});
    var currentFr = parseInt($('.floating-right').css('padding-right'));
    var currentAb = parseInt($('#account_box').css('padding-right'));
    var currentSh = parseInt($('#sheetHeaderTable').css('padding-right'));
    var currentLp = parseInt($('#optionPanelLogin').css('padding-right'));
//left,raightをリセット
//console.log([currentBox[1],currentFr,currentAb,currentLp])
    if(currentBox[1]!=0){
       currentFr -= currentBox[1];
       currentAb -= currentBox[1];
       currentLp -= currentBox[1];
       currentSh -= currentBox[1];
    }
//console.log([currentBox[1],currentFr,currentAb,currentLp])
    $('body').css('padding-left',x+'px');
    $('body').css('padding-top' ,y+'px');
    $('.floating-right').css('padding-right',(currentFr+x)+'px');
    $('#account_box').css('padding-right'   ,(currentAb+x)+'px');
//    $('#optionPanelLogin').css('padding-right'    ,(currentLp+x)+'px');
    $('#sheetHeaderTable').css('padding-right'    ,(currentSh+x)+'px');
//メニューバーをシフト
    document.getElementById('applicationHeadbar').style.marginLeft= (x*-1)+"px";
    document.getElementById('toolbarPost').style.marginLeft= (x*-1)+"px";
    xUI.screenShift = [x,y];
    xUI.adjustSpacer();
}
/*  TEST
xUI.shiftScreen(50,50);
*/
/*  JqueryUIのダイアログウインドウをメニューバー除外・全画面に再設定する
 *
 */
xUI.setDialog = function(dlg,opt){
    if(! dlg) dlg = $("#nas_modalDialog");
    if(! opt) opt = {};
    if(! opt.width)  opt.width  = document.body.clientWidth - 100;
    if(! opt.height) opt.height = window.innerHeight -100 ;
    if(! opt.position) opt.position = {};
    if(! opt.position.at) opt.position.at = "left top";
    if(! opt.position.my) opt.position.my = "left+50 top+50";
    if(! opt.position.at) opt.position.at = "center-"+Math.floor(opt.width/2)+" center+"+Math.floor(opt.height/2);
    console.log(opt)
    dlg.dialog(opt);
}
/*    画面サイズの変更時等にシートボディのスクロールスペーサーを調整する
    固定ヘッダとフッタの高さをスクロールスペーサーと一致させる
    2010.08.28
    引数なし
 */
xUI.adjustSpacer=function(){
    var headHeight=(this.viewMode=="Compact")?
        $("#app_status").offset().top-$("#pMenu").offset().top : document.getElementById("fixedHeader").clientHeight;
    var myOffset=0;
  if(true){
//一時コード  あとで調整  20180916
    if(document.getElementById("scrollSpaceHd"))
        document.getElementById("scrollSpaceHd").style.height=(headHeight-myOffset)+"px";
    if(document.getElementById("xpstScrollSpaceHd"))
        document.getElementById("xpstScrollSpaceHd").style.height=(headHeight-myOffset)+"px";
    if(document.getElementById("xmapScrollSpaceHd"))
        document.getElementById("xmapScrollSpaceHd").style.height=(headHeight-myOffset)+"px";
//document.getElementById("app_status").getBoundingClientRect().bottom
    if(document.getElementById("UIheaderScrollH"))
        document.getElementById("UIheaderScrollH").style.top=(document.getElementById("app_status").getBoundingClientRect().bottom)+"px";
//        document.getElementById("UIheaderScrollH").style.top=(headHeight+$("#app_status").height())+"px";
    if(document.getElementById("UIheaderFix"))
        document.getElementById("UIheaderFix").style.top=(document.getElementById("app_status").getBoundingClientRect().bottom)+"px";
//        document.getElementById("UIheaderFix").style.top=(headHeight+$("#app_status").height())+"px";

    if(document.getElementById("UIheaderScrollV"))
        document.getElementById("UIheaderScrollV").style.top=(document.getElementById("app_status").getBoundingClientRect().bottom)+"px";
//        document.getElementById("UIheaderScrollV").style.top=(headHeight+$("#app_status").height())+"px";
  }else{
      document.body.style['margin-top']=document.getElementById("fixedHeader").clientHeight;
  };
    if(document.getElementById("scrollSpaceFt")) document.getElementById("scrollSpaceFt").style.height="1 px";
}
/**
    主アプリ画面のUIを調整
    xUI.viewMode の値に即して画面調整を行う
    主にToolBoxブラウザ用
*/
xUI.adjustUI = async function adjustUI(){
    var headHeight=(this.viewMode=="Compact")?
        $("#app_status").offset().top-$("#pMenu").offset().top : document.getElementById("fixedHeader").clientHeight;

    if(document.getElementById("fileStrip")){
        var UIHeight = (window.innerHeight - headHeight - 42);
        if(window.innerWidth > 640){
//        document.getElementById("fileRenamer").style.height = document.children[0].innerHeight - headHeight - 16;
            document.getElementById("fileStrip").style.maxHeight  = UIHeight + 'px';
            document.getElementById("fileStrip").style.height     = UIHeight + 'px';
            document.getElementById('itemList').style.maxHeight   = UIHeight - 6 + 'px';
            document.getElementById('previewWindow').style.height = UIHeight - 6 + 'px';
//        pman.reName.setPreview();
//console.log('UIHeight : '+ UIHeight);
        }else{
            document.getElementById("fileStrip").style.maxHeight  = UIHeight/2 + 'px';
            document.getElementById("fileStrip").style.height     = UIHeight/2 + 'px';
            document.getElementById('itemList').style.maxHeight   = UIHeight/2 - 6 + 'px';
            document.getElementById('previewWindow').style.height = UIHeight/2 - 6 + 'px';
            
        };
    };
}
/**
 *  @params {Number} myScale
 *      Number又は配列 数値一つの場合はX,Y方向のスケールとして扱う
 *      引数なしは、現在のスケールを返す
 *      単一数で0が指定された場合はfitWindow(page/A3 96ppiとして自動計算)
 *  @params {Array|String}   scaleTargetID
 *      設定されたスケールを返す
 *  ターゲットエレメントは以下
 *  "UIheaderFix"
 *  "UIheaderScrollH"
 *  "UIheaderScrollV"
 *  "sheet_body"
 *  ドキュメント内に存在しないエレメントは無視（印字用）
 *  スケーリングするターゲットを別に指定する場合は  idまたはid の配列で
 */
xUI.adjustScale=function(myScale,scaleTargetID){
    if(typeof myScale == "undefined") return xUI.viewScale;
    if(myScale == 0){
        var sheetPage = new nas.Size('297mm','420mm');
        var viewWidth  = window.innerWidth;
        var sheetWidth = sheetPage.x.as('px');
        var widthRatio = viewWidth / sheetWidth;
        var viewHeight  = window.innerHeight - document.getElementById('fixedHeader').clientHeight - 16;//スクロールバー16pxを減じておく
        var sheetHeight = sheetPage.y.as('px');
        var heightRatio = viewHeight / sheetHeight;
        myScale = (widthRatio < heightRatio)? widthRatio : heightRatio;
    };
    xUI.viewScale = Math.round(myScale*100) / 100;
    var myId = (scaleTargetID)?
        scaleTargetID:["UIheaderFix","UIheaderScrollH","UIheaderScrollV","xpsDocumentField"];
    if(! (myId instanceof Array )) myId=[myId];
    for (var ix=0;ix<myId.length;ix++){
        var scaleTarget=document.getElementById(myId[ix]);
        if(! scaleTarget) continue;
        if(appHost.platform.match(/CSX|CEP|AIR/)){
          scaleTarget.style.WebkitTransformOrigin="0px 0px";
          scaleTarget.style.WebkitTransform='scale('+xUI.viewScale+')';
        }else{
          scaleTarget.style.transformOrigin="0px 0px";
          scaleTarget.style.transform = 'scale('+xUI.viewScale+')';
        };
    };
    if(xUI.viewScale >= 1) xUI.resetSheet();//リセット
    sync('scale');
    return xUI.viewScale;
}
/*
    @params {Number} opt
    
    スケーリングによるタイムシート部分のズーム処理
    引数をオフセットとして現在の値からスイッチする
    不適合引数の場合は+1で順次表示比率を選択する（大→小）

*/
//xUI.adjustScale(1,0.65);
xUI.zoomSwitch =function(opt){
    if(typeof opt == 'undefined') opt = 1
    this.zoomSwitch.currentPreset = (this.zoomSwitch.currentPreset + opt) % this.zoomSwitch.scalePresets.length;
    return this.adjustScale(this.zoomSwitch.scalePresets[this.zoomSwitch.currentPreset]);
}
xUI.zoomSwitch.scalePresets  = [2,1.5,1,.75,.5,0];
xUI.zoomSwitch.currentPreset = 2;
/*
        xUI.adjustPageImage()
    タイムシートUIを参照画像と一致させる
    一致パラメータは、画像ごとに保持（保存）された情報を使用する
    指定UIを使って編集可能
*/
xUI.adjustPageImage = function(){
    if(
        (xUI.XPS.pageImages.length == 0)||
        (xUI.viewMode != 'PageImage')||
        (true)
    ) return false;
    
}
/* // xUI.adjustPageImage// */
/*        xUI.reInitBody(newTimelines,newDuration);
引数:
    newTimelines    Number 新規トラック数
    newDuration    Number 新規継続時間  フレーム数
戻値:
    指定された大きさにシートを書き直す。
    元データは可能な限り維持

    undoの構造上サイズが変わると弊害が大きいので
    undoバッファは初期化する。undoを改装するまでは必須
    undoバッファ改変中  0923

    データ構造上Xpsのメソッドの方が良いので、
    データ改変部分をXPSlibに移動して
    ここではXPSのメソッドを呼び出す形式に変更  2013.02.23
    タイムシートの拡縮をundo対象に拡張    2015.09.14
    新規に現在のXPSの複製をとって、それを拡縮した後putメソッドに渡す
    putメソッド内部でUNDO処理を行う

xUI.putメソッドがobject Xpsに対応したのでこのメソッド自体が意味を失ったので使用されない
 このメソッドは基本廃止

 */
xUI.reInitBody=function(newTimelines,newDuration){
    var newXPS = new nas.Xps(newTimelines,newDuration);
    newXPS.parseXps(this.XPS.toString(false));//別オブジェクトとして複製を作る
    //変更してputメソッドに渡す
    newXPS.reInitBody(newTimelines,newDuration);
if(config.dbg) console.log(newXPS.toString(false));
    this.sheetPut(newXPS);
};
/*
*/
xUI.switchStage=function(){
    alert(localize(nas.uiMsg.dmUnimplemented));//未実装
};
/**
    リファレンスエリアにデータをセットする
    引数がない場合は、現在のXPSデータをそのままセットする
    引数はオブジェクトまたはソースストリーム
    @params {Object Xps| Xps sourceString} xpsContent

*/
xUI.setReferenceXPS = function (xpsContent){
    if(typeof xpsContent == 'undefined'){
        if (! documentDepot.currentReference ) documentDepot.currentReference=new nas.Xps();
        documentDepot.currentReference.parseXps(xUI.XPS.toString(false));
    }else if(! xpsContent instanceof Xps){
        var newData = new nas.Xps();
        newData.readIN = xUI._readIN_xpst;
        newData.readIN(xpsContent);
        if(newData){
            documentDepot.currentReference = newData;
        }else{
            return false;
        }
    } else if (xpsContent instanceof Xps) {
        documentDepot.currentReference = xpsContent;
    } else {
        return false;
    }
        xUI.resetSheet(undefined,documentDepot.currentReference);
        return true;
};
//////
/**
        xUI.drawSheetCell(HTMLTableCellElement)
    テーブルセルを引数で与えてグラフィック置換及びテキスト置換を行う
    trTdから分離して機能調整
    判定されたグラフィック状態はクラスとしてセルに追加される
    描画は遅延処理
    シートマーカー判定を追加
*/
xUI.drawSheetCell = function (myElement){
    if(typeof myElement =="undefined"){return false;}
    var target=myElement;
    var targetJQ=$("#"+target.id);
    var formPostfix='';
    var marker = null;
    if(target.children.endMarker){
        marker = target.children.endMarker;
    }
    if(this.showGraphic){
        var tgtID=target.id.split("_").reverse();
        var myXps=(tgtID.length==2)? this.XPS:this.referenceXPS;
        formPostfix += (tgtID.length==2)? '':'-ref';
        if (myXps.xpsTracks[tgtID[1]].option.match(/^(efect|sfx|composite)$/)) formPostfix +='-sfx';
        var myStr = myXps.xpsTracks[tgtID[1]][tgtID[0]];
        var drawForm    = '';
        var sectionDraw = false;
        var mySection = myXps.xpsTracks[tgtID[1]].getSectionByFrame(tgtID[0]);
//シートセルに  graph_*クラスがあれば削除
        var myClasses=targetJQ.attr('class').split(' ');
        for (var cix=0;cix<myClasses.length;cix++){
            if(myClasses[cix].indexOf('graph_')==0) targetJQ.removeClass(myClasses[cix]);
        }
//セクションキャッシュが信頼できる限りはセクションパースが保留されるように調整済み
/**
    判定時にトラック種別を考慮する
    ダイアログ、サウンド
    リプレースメント
    カメラ
    エフェクト
    それぞれに置き換え対象シンボルが異なるので注意
*/
        var currentTrackOption  = myXps.xpsTracks[tgtID[1]].option;
        switch(currentTrackOption){
          case "sound":;
          case "dialog":;
            if (myStr.match(/<([^>]+)>/)){
                myStr=xUI.trTd(myStr);
            };//trTdにセルIDを渡す
            if (myStr.match(/[-_─━~＿￣〜]{2,}?/)){
//セクション開始判定
              myStr=(this.showGraphic)?"<br>":"<hr>";//
//              if((mySection.startOffset()+mySection.duration-1) != tgtID[0]){}
              if(mySection.startOffset() == tgtID[0]){
                drawForm =(myStr.match(/[_＿]/))? "line":"dialogClose";
              }else{
                drawForm =(myStr.match(/[_＿]/))? "line":"dialogOpen";
              }
            };//セクションパース情報を参照
            myStr=myStr.replace(/[-−ー─━]/g,"｜");//音引き縦棒
            myStr=myStr.replace(/[~〜]/g,"<p class=rotate>〜</p>");//音引き縦〜
            myStr=myStr.replace(/[…]/g,"︙");//三点リーダー
            myStr=myStr.replace(/[‥]/g,"︰");//二点リーダー
/* 台詞中の文字置換のうち音引き、句読点は画面置き換えで処理
    ListStr=ListStr.replace(/\」/g,"---");//閉じ括弧は横棒
    ListStr=ListStr.replace(/\、/g,"・");//読点中黒
    ListStr=ListStr.replace(/\。/g,"");//句点空白(null)
*/
          break;
          case "still":;
          case "timing":;
          case "replacement":;
            if (myStr.match(/[\|｜]/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
            }
            else if (myStr.match(nas.CellDescription.blankRegex)){
                myStr=(this.showGraphic)?"<br>":"×";                
                drawForm = "blankCloss";
            }
            else if (myStr.match(/[:：]/)){
                myStr=(this.showGraphic)?"<br>":":";                
                drawForm = "wave";
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
            }
            else if (myStr.match(/\(([^\)]+)\)/)){
                myStr=(this.showGraphic)?RegExp.$1:xUI.trTd(myStr);
                drawForm = "circle";
           }
           else if (myStr.match(/<([^>]+)>/)){
                myStr=(this.showGraphic)?RegExp.$1:xUI.trTd(myStr);
                drawForm = "triangle";
            }
            myStr=myStr.replace(/^([~〜])$/g,"<p class=rotate>$1</p>");//音引き縦棒
          break;
          case "camera":;
          case "camerawork":;
        if(! mySection.value) break;
        if(mySection.value.type[0]=='geometry'){
            if (myStr.match(/^[\|｜]$/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
                formPostfix +='-gom';
            } else if (myStr.match(/^([!|！|\/|／|\\|＼]+)$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "shake";
                formPostfix +='-gom';
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
                if (RegExp.$1.length > 2){
                    formPostfix +='_l';
                }else if(RegExp.$1.length == 2){
                    formPostfix +='_m';
                }else{
                    formPostfix +='_s';
                }
            } else if (myStr.match(/^([:：]+)$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "wave";
                formPostfix +='-gom';
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
                if (RegExp.$1.length > 2){
                    formPostfix +='_l';
                }else if(RegExp.$1.length == 2){
                    formPostfix +='_m';
                }else{
                    formPostfix +='_s';
                }
            } else if (myStr.match(/^[▽]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionOpen";
            } else if (myStr.match(/^[△]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionClose";
            } else {
                myStr = xUI.trTd(myStr);
            }
        }else if(mySection.value.type[0]=='composite'){
            var drawForms ={"▲":"fi","▼":"fo"};//この配分は仮ルーチン  良くない,"△":"fi","▽":"fo"
if(myStr.match(/^</)) console.log(myStr);
            var drawForms ={"▲":"fi","▼":"fo","]><[":"transition"};//この配分は仮ルーチン  良くない,"△":"fi","▽":"fo"
            if (myStr.match(/^[\|｜↑↓\*＊]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^[▽]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^[△]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^\]([^\]]+)\[$/)){
                if(this.hideSource) myStr="<br>";
            } else {
                myStr = xUI.trTd(myStr);
            }
if(! mySection) console.log(myElement);
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = drawForms[formStr];
                sectionDraw = true;
            }
        }else if(mySection.value.type[0]=='transition'){
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = 'transition';
                sectionDraw = true;
            }
            myStr = xUI.trTd(myStr);
        } else {
                myStr = xUI.trTd(myStr);
            }

          break;
          case "geometry":;
          case "stage":;
          case "stagework":;
myStr = xUI.trTd(myStr); break;
            if (myStr.match(/^[\|｜]$/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
                formPostfix +='-gom';
            } else if (myStr.match(/^([!|！|\/|／|\\|＼]+)$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "shake";
                formPostfix +='-gom';
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
                if (RegExp.$1.length > 2){
                    formPostfix +='_l';
                }else if(RegExp.$1.length == 2){
                    formPostfix +='_m';
                }else{
                    formPostfix +='_s';
                }
            } else if (myStr.match(/^[▼▽]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionOpen";
            } else if (myStr.match(/^[▲△]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionClose";
            } else {
                myStr = xUI.trTd(myStr);
            }
          break;
          case "composite":;
          case "effect":;
          case "sfx":;
            if(! mySection.value) break;
if(myStr.match(/^</)) console.log(myStr);
            var drawForms ={"▲":"fi","▼":"fo","]><[":"transition"};//この配分は仮ルーチン  良くない
            if (myStr.match(/^[\|｜↑↓\*＊]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^▼$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^▲$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^\]([^\]]+)\[$/)){
                if(this.hideSource) myStr="<br>";
            } else {
                myStr = xUI.trTd(myStr);
            }
if(! mySection) console.log(myElement);
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = drawForms[formStr];
                sectionDraw = true;
            }
          break;
          case "comment":;
              myStr = xUI.trTd(myStr);
          break;
    }
    target.innerHTML=myStr;
    if(this.showGraphic){    
        if((sectionDraw)&&(drawForm)){        
            xUI.Cgl.sectionDraw([tgtID[1],mySection.startOffset()].join("_"),drawForm,mySection.duration);
        }else{
            if(drawForm) targetJQ.addClass('graph_'+drawForm+formPostfix);
        }
    }
    if(marker) target.appendChild(marker);
    return myStr;
}
}
/**
    テーブル表示用文字列置換
        xUI.trTd(Str);
引数:テーブルセルID配列または単独文字列
    テーブルセルのID からターゲット求め
    タグ等htmlで表示不能な文字を置き換える
    戻り値は変換後の文字列
    画面（テーブル）表示のみに使用する
    ＝XPSのデータは保全される
    要素が配列でない場合は直接ターゲットにする
*/
xUI.trTd=function(myID){
if(typeof myID == "undefined"){return false;}
//if(typeof arguments[0] =="undefined"){return false;}
    if(! (myID instanceof Array)){
        var target = myID;
        //var target=arguments[0];
    }else{
        var target = (myID[0]=='r') ?
            xUI.referenceXPS.xpsTracks[myID[1]][myID[2]]:
            xUI.XPS.xpsTracks[myID[0]][myID[1]];
    }
/** HTML表示用に実体参照に置換
*/
  var str = String(target);//明示的に文字列化
  var result = "";
  for(var i = 0 ; i < str.length ; i++) {
    var c = str.charAt(i);var cstr = '';
    if((' ' <= c && c <= '~') || (c == '\r') || (c == '\n')) {
      if(c == '&') {
        cstr = "&amp;";
      } else if(c == '<') {
        cstr = "&lt;";
      } else if(c == '>') {
        cstr = "&gt;";
      } else {
        cstr = c.toString();
      }
    } else {
      cstr = "&#" + c.charCodeAt().toString() + ";";
    }
      result += cstr;
  }
    return result;

};
//
/*    XPSのプロパティの配列要素を"_"でつないで返す(シート上のidに対応)
        getId(要素名)
    現在は"Select"のみが有効値
    "Selection"ではIDを計算する
*/
xUI.getid=function(name){
    if ((!xUI.app)||(this[name].length==0)||(this[name][0]==null))  return '';
  switch(name){
    case "Selection":
        return add(this.Select,this[name]).join("_");
    case "Select":
        return this[name].join("_");
  }
};
/**
 *  @params {String|Array} ID
 *  @params {Number}       frameOffset
 *    指定のシートセルを選択状態にしてカレントのカーソル位置を返す
 *        xUI.selectCell(HTMLElementID)
 *        xUI.selectCell([myTrack,myFrame]);
 *引数が配列の場合も受け付ける
 *フレームオフセットが加算される
 */
xUI.selectCell = function(ID,frameOffset){
if(! document.getElementById("fixedHeader")) return this.Select;
//    if (typeof ID == "undefined") ID = '';//
    if (typeof ID == "undefined") ID = this.selectBackup;//バックアップ位置と換装
    if (typeof frameOffset == "undefined") frameOffset = 0;
if(config.dbg) xUI.printStatus(ID,'dbg : ');//デバッグ用
//      現在のセレクトをフォーカスアウト 引数が偽ならば フォーカスアウトのみ(ここでリターン)
    if(! ID){return;};
//      選択セルの内容をXPSの当該の値で置換 新アドレスにフォーカス処理開始 = IDをセレクト
//      指定IDが稼働範囲外だったら丸め込む
if(! (ID instanceof Array)) ID = ID.split('_') ;
    var tRack = Number(ID[0]);
    var fRame = Number(ID[1])+frameOffset;

    if ((tRack < 0) || (tRack >= this.XPS.xpsTracks.length)){tRack=(tRack<0)?0:this.XPS.xpsTracks.length-1;};
    if ((fRame < 0) || (fRame >= this.XPS.duration())){fRame=(fRame<0)?0:this.XPS.duration()-1;};
    ID = tRack+'_'+fRame;
//    JQオブジェクトを取得
    var currentJQItem=$("#"+ID);
//    セレクションクリア
        this.selectionHi("clear");
//    フットマーク機能がオンならば選択範囲とそしてホットポイントをフミツケ
    var myTgtId = this.getid('Select');var paintColor;
    if(this.footMark && this.diff(myTgtId)){
        paintColor=this.footstampColor;//                    == footmark ==
    }else{
        paintColor='transparent';//this.sheetbaseColor;//                    == clear ==
    };
    if(document.getElementById(myTgtId))
    document.getElementById(myTgtId).style.backgroundColor=paintColor;

//フレームの移動があったらカウンタ更新フラグ立てる
        var fctrefresh = (fRame==this.Select[1])? false : true ;
//レイヤの移動があったらボタンラベル更新フラグ立てる
        var lvlrefresh = (tRack==this.Select[0])? false : true ;
//セレクト更新
    this.Select=[tRack, fRame];
        if(fctrefresh) sync("fct");//フレームカウンタ同期
        if(lvlrefresh) sync("lvl");//トラックカウンタ同期
//入力同期
    this.selectionHi("hilite");    //選択範囲とホットポイントをハイライト
    this.bkup([this.XPS.xpsTracks[tRack][fRame]]);    //編集前にバックアップする
    var eddt=this.XPS.xpsTracks[tRack][fRame];    //編集済データ取得
//    ヘッドライン
    if(document.getElementById("iNputbOx").value!=eddt){
        document.getElementById("iNputbOx").value=eddt;
//        document.getElementById("iNputbOx").focus();
//        document.getElementById("iNputbOx").select();
    };//編集ラインに送る
/*    オートスクロールフラグが立っていたらスクロールを制御
    現在、オートスクロールで移動時にマウスによる選択処理をキャンセルしている
    オートスクロールのアルゴリズムが改善されたら処理を検討のこと
    コンパクトモードと通常モードで動作切り替え

    全体の位置に加えて、現在のスクーンサイズを条件に追加して使用感を改善すること
    2015-0331
    
    区間選択状態または選択状態のドラグ時に選択セルに対するフォーカスオフセットが働くように改装
    2017-0324

オートスクロール起動条件
縦方向    セルフォーカスが表示範囲上下一定（６または８？）フレーム以内であること(上下別の条件に)
横方向  セルフォーカスが表示範囲左右一定（２～４？）カラム以内であること（左右別条件に）
かつ移動余裕があること=各条件がシート端からの距離以上であること
スクロール停止フラグが立っていないこと

*/
    if ((this.autoScroll)&&(! this.scrollStop)){
        var targetID=add(xUI.Select,[0,xUI.sectionManipulateOffset[1]]).join('_');
        this.scrollTo(targetID); 
    };
//セルイメージ表示中で、選択セルに画像アイテムがアタッチされている場合、画像をハイライトする
    if(
        (xUI.canvasPaint.active)&&
        (xUI.viewMode == 'Scroll')
    ) xUI.hilightImage('cell:'+xUI.Select.join('_'));
//        &&(xUI.XPS.noteImages.getByLinkAddress('cell:'+xUI.Select.join('_')))
    if(
        (!(xUI.edchg))&&
        (!(xUI.canvasPaint.active))&&
        (!(documentFormat.active))
    ){
        document.getElementById("iNputbOx").focus();
        document.getElementById("iNputbOx").select();
    };
    return this.Select;
};
/*    カラム移動
        xUI.changeColumn(カラムID,カラムブロック番号)
        カラムブロック番号は、タイムシートのひとかたまりのブロック番号
        2段シートならば第一ページにはブロック0および1がある
*/
xUI.changeColumn =function(ID,cols){
if(this.viewMode=="Scroll"){
    var fr=this.Select[1];
}else{
//レイヤIDとカラムIDから移動位置を算出して実行。移動不能の場合は何もせずに復帰
    if(ID=="memo"){ID=this.XPS.xpsTracks.length -1};

    var lineOffset=this.Select[1]-Math.floor(this.Select[1]/(this.PageLength/this.PageCols))*(this.PageLength/this.PageCols);//ラインオフセット
    var fr=cols*(this.PageLength/this.PageCols)+lineOffset;
    if(fr>=this.XPS.duration()){return};
}
    this.selectCell(([ID,fr]).join("_"));
};
//
//
/**
    @params {String|Array|Ofject} ID
    IDは文字列|配列
    @params {Array}
    xUI.Selectionの値(のみ)を返す(仕様変更 202309)
    
    マルチセレクト
        xUI.selection(ID)
        xUI.selection([myTrack,myFrame]);
        現在のカーソル位置からIDまでの範囲を選択状態にする
        引数が空なら選択解除
        引数が配列の場合も受け付ける 負の数もOK
*/
xUI.selection =function(ID){

//現行のセレクションハイライトクリア
//選択範囲とホットポイントをフミツケ
    this.selectionHi("clear");
//引数未指定ならクリアのみでリターン
    if((typeof ID=="undefined")||(ID==null)){
        this.Selection=[0 ,0];
        if(document.getElementById("edchg")) document.getElementById("edchg").style.backgroundColor="";//ここでUI表示をクリアする
        this.selectionHi("hilite");
        return Array.from(this.Selection);
    };
//ID値から、セレクションの値を導く
    if(!(ID instanceof Array)) ID=ID.split("_");
    this.Selection=[parseInt(ID[0])-this.Select[0],parseInt(ID[1])-this.Select[1]];
    if(document.getElementById("edchg")) document.getElementById("edchg").style.backgroundColor=this.selectingColor;//ここでUIインジケータ表示
    this.selectionHi("hilite");
    return Array.from(this.Selection);
};

/**
 *  @params {String} Method
 *    選択範囲のハイライト
 *        xUI.selectionHi(メソッド)
 *        範囲が許容外だった場合は範囲を維持して操作無し
 *        メソッドは "hilite"|"footmark"|"clear"
 *        モード遷移毎にカラーを変更するのはモードチェンジメソッドで集中処理
 *        印刷モード時はハイライト関連をスキップ
ハイライト類をCSSクラス化して、CSSによる判定を可能にする　２０２５０８０３
 */
xUI.selectionHi    =function(Method){
switch (Method) {
case    "hilite"    :
                var paintColor=this.selectionColor;break;
case    "footmark"    :
                this.spinHi("clear");
                var paintColor=this.footstampColor;break;
case    "clear"        :
                this.spinHi("clear");
default            :
    var paintColor=this.sheetbaseColor;break;
};
var range=this.actionRange();
//    dbgPut("selectionHi :\n"+range.join("\n"));
//新選択範囲をハイライト スタートアドレスに負数を許容  150919
//セクション編集のために選択範囲の末尾を色変え可能に拡張
    for (var C=range[0][0];C<=range[1][0];C++){
        for (var L=range[0][1];L<=range[1][1];L++){
try{
            if((C<0) || (L<0)||(C>=this.XPS.xpsTracks.length)||(L>=this.XPS.xpsTracks[C].length)){
//    当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
console.log(this);
                dbgPut(range.toString());
            }else{
                if (!(this.Select[0] == C && ( ((this.edmode>0)? 1:this.spinValue)+this.Select[1] > L && this.Select[1] <= L)))
                {
                    if(Method=="hilite")
                    {
                        if(((L==range[1][1])||(L==range[0][1]))&&(xUI.edmode>1)){
                            paintColor=xUI.selectionColorTail;
                        }else{
                            paintColor=xUI.selectionColor;
                        }
                    }else{
                        if(this.footMark && this.diff([C,L]))
                        {
                            paintColor=xUI.footstampColor;
                        }else{
//                            paintColor=xUI.sheetbaseColor;
                            paintColor='transparent';
                        };
                    };
                    if(nas.colorAry2Str(nas.colorStr2Ary(document.getElementById(C+"_"+L).style.backgroundColor))!=paintColor)
                    {
                        document.getElementById(C+"_"+L).style.backgroundColor=paintColor;//セレクションのリペイント
                    };
                };
            };
}catch(err){dbgPut("range err :C="+C+"  :L= "+L)};
        };
        if(Method=="hilite"){this.spinHi("put")};
    };
};

/*    スピン範囲のハイライト処理
        xUI.spinHi(メソッド)
        メソッドは["clear"]またはそれ以外
*/
xUI.spinHi = function(Method){
if(! document.getElementById("spin_V")) return;
//選択ポイントのハイライトおよびスピン範囲のハイライト
    if(! document.getElementById(this.getid("Select"))){if(config.dbg) dbgPut(this.getid("Select")) ;return;};
    if(Method == "clear") {
        document.getElementById(this.getid("Select")).style.backgroundColor=(this.diff(this.Select)&&(this.footMark))? this.footstampColor:'transparent';
    }else{
        document.getElementById(this.getid("Select")).style.backgroundColor=this.selectedColor;
    };
//    スピン 1 以上を処理 選択範囲内外で色分け

    for(var L=this.Select[1]+1;L<((this.edmode > 0)? 1:this.spinValue)+this.Select[1];L++){
        if(L > 0 && L < this.XPS.xpsTracks[0].length){
            if((Method=="clear")){
                if(this.diff([this.Select[0],L]) && this.footMark){
                    document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.footstampColor;//スピンエリア表示解除
                }else{
                    if(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor)
                        document.getElementById(this.Select[0]+"_"+L).style.backgroundColor = 'transparent';//スピンエリア表示解除
                };
            }else{
                if(L>(this.Selection[1]+this.Select[1])){
                    if(nas.colorAry2Str(nas.colorStr2Ary(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor))!=this.spinAreaColor)
                        document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.spinAreaColor;//スピンエリア表示
                }else{
                    if(nas.colorAry2Str(nas.colorStr2Ary(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor))!=this.spinAreaColorSelect)
                        document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.spinAreaColorSelect;//スピンエリア表示
                };
            };
        };
    };

//スピン表示が現状と異なっていた場合更新
    if ( document.getElementById("spin_V").value != xUI.spinValue){
         document.getElementById("spin_V").value  = xUI.spinValue;
    }
};
//spinHi
/*  足跡（差分表示）をリセット
引数があれば状況をセット
         有効状態ならば、Paint
         無効状態ならば、Clear
         
*/
xUI.footstampReset    =function(opt){
    if(xUI.activeDocumentId == 0) return ;
    if(typeof opt != 'undefined'){this.footMark=(opt)?true:false;};
    if(this.footMark){this.footstampPaint()}else{this.footstampClear()};
    if(document.getElementById("ibMfootStamp")){
        document.getElementById("ibMfootStamp").innerHTML=(xUI.footMark)?"✓":"";
    }
}
/*    足跡をクリア
        xUI.footstampClear();
 */
xUI.footstampClear    =function(){
    if((xUI.activeDocumentId == 0)||(! xUI.app)) return ;
//    var flipStatus=false
//    if(! this.footMark){flipStatus=true;this.footMark=true;}
    if (this.footstampColor){
        var BGr=parseInt("0x"+this.footstampColor.substr(1,2),16);
        var BGg=parseInt("0x"+this.footstampColor.substr(3,2),16);
        var BGb=parseInt("0x"+this.footstampColor.substr(5,2),16);
    } else {BGr=0;BGg=0;BGb=0;};
    var BGColor="rgb("+BGr+", "+BGg+", "+BGb+")";
//    if (! this.footMark) {return;};
//足跡のお掃除
    for (var c=0;c<(this.SheetWidth);c++){
            for(var f=0;f<(this.XPS.duration());f++){
        if (this.getid("Select")!=(c+"_"+f)){
    if (
        document.getElementById(c+"_"+f).style.backgroundColor==BGColor ||
        document.getElementById(c+"_"+f).style.backgroundColor==this.footstampColor
    ){
//        document.getElementById(c+"_"+f).style.backgroundColor=this.sheetbaseColor;
        document.getElementById(c+"_"+f).style.backgroundColor='transparent';
    };
        };
            };
    };
//    if(flipStatus){this.footMark=false;}
};
/*    足跡をチェック
        xUI.footstampPaint();
        現在のカーソル位置を控えて全選択して解除
        カーソル位置を戻す
 */
xUI.footstampPaint    =function(){
    if((xUI.activeDocumentId == 0)||(! xUI.app)) return ;
    var flipStatus=false
    if(! this.footMark){flipStatus=true;this.footMark=true;}
    var restoreValue=this.getid("Select");
        this.selectCell("0_0");
        this.selection((this.SheetWidth-1)+"_"+this.XPS.duration());
        this.selection();
        this.selectCell(restoreValue);
    if(flipStatus){this.footMark=false;}
};
/**
    ヘッダ部分の背景色を点滅させる
引数:点滅色 未指定の際は'#808080'<> 背景色

*/
xUI.headerFlash = function(hilightColor){
var originalColor=xUI.sheetLooks.SheetBaseColor;
if(!hilightColor) hilightColor='#808080';

    $("#fixedHeader").css("background-color",hilightColor);
    setTimeout(function(){
        $("#fixedHeader").css("background-color",originalColor);
        if(! document.getElementById("forgetInputWarning").checked) document.getElementById("iNputbOx").blur();
/*        setTimeout(function(){
            $("#fixedHeader").css("background-color",hilightColor);
            setTimeout(function(){
                $("#fixedHeader").css("background-color",originalColor);
            },75);
        },120);*/
        if(! document.getElementById("forgetInputWarning").checked) {xUI.sWitchPanel("Rol");}
    },150);
    return false;
};

//test xUI.headerFlash();
/**
 *    @paramas {Number} pageNumber
 *    @paramas {Number} pages
 *    ヘッダアイテムオーダに従ったページヘッダの内容をHTMLで返す
 */
xUI.pageHeaderItemOrder = function(pageNumber,pages){
//  ページヘッダとシートヘッダの共通表示 テーブルのオーダーで表示
    var headerItem = {
        ep   :{template:'<span class="pgHeader opusHeader"     id="opus%1"       >%2</span>',label:'話数.',class:"opusHeader",value:this.XPS.opus},
        title:{template:'<span class="pgHeader titleHeader"    id="title%1"      >%2</span>',label:'TITLE.',class:"titleHeader",value:this.XPS.title},
        sci  :{template:'<span class="pgHeader scenecutHeader" id="scene_cut%1"  >%2</span>',label:'CUT.',class:"scenecutHeader",value:['s'+this.XPS.scene,'c'+this.XPS.cut].join('-')},
        time :{template:'<span class="pgHeader timeHeader"     id="time%1"       >%2</span>',label:'TIME.',class:"timeHeader",value:nas.Frm2FCT(this.XPS.time(),3,0,this.XPS.framerate)},
        user :{template:'<span class="pgHeader nameHeader"     id="update_user%1">%2</span>',label:'NAME.',class:"nameHeader",value:xUI.XPS.update_user.handle},
        page :{template:'<span class="pgHeader pageHeader"     id="page_cont%1"  >%2</span>',label:'.',class:"pageHeader",value:(pageNumber==pages)?'end / '+pages : pageNumber+' / '+pages}
    };
    var _BODY = "";
    _BODY += '<div style="display:table-tr;">';
    xUI.XPS.sheetLooks.headerItemOrder.forEach(function(e){
        if(e[2] != 'hide')
        _BODY += nas.localize(headerItem[e[0]].template,String(pageNumber),headerItem[e[0]].value);
    });
    _BODY += '</div>';
    _BODY += '<div style="display:table-tr;position:absolute;top:0px;">';
    xUI.XPS.sheetLooks.headerItemOrder.forEach(function(e){
        if(e[2] != 'hide')
        _BODY += nas.localize('<span class ="pgHeader-label %1">%2</span>',headerItem[e[0]].class,headerItem[e[0]].label);
    });
    _BODY += '</div>';
    return _BODY;
}
/*    タイムシート本体のヘッダを返すメソッド(ページ単位)
        xUI.headerView(pageNumber)
        引数はページ番号を整数で
        第一ページ以外は省略形を返す
        戻り値はページヘッダのHTMLテキスト
 */
xUI.headerView = function(pageNumber){
    var Pages=(this.viewMode=="Scroll")? 1:Math.ceil(this.XPS.duration()/this.PageLength);//全ページ数・ページ長で割って切り上げ
    var _BODY ='';

//----印字用ページヘッダ・第一ページのみシートヘッダ---//
    _BODY += nas.localize('<div class="printPageStatus">%1</div><div id=pageHeader%2 class=sheetHeader>',
        decodeURIComponent(Xps.getIdentifier(xUI.XPS,'job')) +' : '+new Date().toNASString(),
        String(pageNumber),
    );
    _BODY += xUI.pageHeaderItemOrder(pageNumber,Pages);//========印字用ページヘッダを生成
    _BODY += '</div>';//Sheet|Page header
// */

//第一ページのみシート全体のコメントを書き込む（印刷用）  表示用には別のエレメントを使用
    if(pageNumber==1){
//シート書き出し部分からコメントを外す 印刷時は必要なので注意 2010/08/21
//        _BODY += '<span class=top_comment >'
//シグネチャエリア
        _BODY += '<div class=signArea ><span class="memoLabel">sig.</span>';
        _BODY += '<br><div id=signparade style="display:flex;"><br>--------</div><hr></div>';
//メモエリア
        _BODY +='<div class=noteArea><span class="memoLabel">memo:</span>';
        _BODY += '<span id="transit_dataXXX">';
        if(this.XPS.trin>0){
            _BODY += "△ "+this.XPS.trin.toString();//[1]+'('+nas.Frm2FCT(this.XPS.trin[0],3,0,this.XPS.framerate)+')';
        };
        if((this.XPS.trin > 0)&&(this.XPS.trout > 0)){_BODY += ' / ';};
        if(this.XPS.trout[0]>0){
        _BODY += "▼ "+this.XPS.trout.toString();//[1]+'('+nas.Frm2FCT(this.XPS.trout[0],3,0,this.XPS.framerate)+')';
        };
        _BODY += '</span><br>';

        _BODY+='<div id="memo_prt" class=printSpace >';
        if(this.XPS.xpsTracks.noteText.toString().length){
            _BODY+=this.XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
        }else{
            _BODY+="<br><br><br><br><br><br>";
        };
        _BODY+='</div>';
        _BODY+='</div>';
    }else{
        _BODY+='<div class=printSpace ><br><br><br><br><br><br></div>';
    };
    return _BODY;
};
//end headerView()
/**
 *   ページヘッダを、初期化後に更新するメソッド
 *   事前にXPSを更新する必要あり
 *     eg.
 *      xUI.XPS.parseSheetLooks(documentFormat.toJSON());
 *      xUI.rewritePageHeaderItemOrder();
 */
xUI.rewritePageHeaderItemOrder = function(){
    Array.from(document.getElementsByClassName('sheetHeader')).forEach(function(e){
        var pageNumber = nas.parseNumber(e.id);
        var Pages = (xUI.viewMode == "Scroll")? 1:Math.ceil(xUI.XPS.duration()/xUI.PageLength);
        e.innerHTML = xUI.pageHeaderItemOrder(pageNumber,Pages);
    });
}
/*TEST
    xUI.reWritePageHeaderItemOrder();
 */
/**
 *    @params {string}    type
 *    リザルトのタイプは引数で指定
 *    fix|column|document
 *    
 *    sheetLooksを参照して指定のブロックの幅をpixelで返す関数
 *    指定がない場合はすべてをまとめてオブジェクトで返す
 *    
 */
xUI.getAreaWidth = function(type){
    var tableFixWidth    = 0;
    var tableColumnWidth = 0;
    var tableDocWidth    = 0;
    xUI.XPS.xpsTracks.areaOrder.forEach(function (e){
        var areaWidth = 0;//as CellWidthUnit
        if(e.type == 'reference'){
//トラックテーブル上に存在しないリファレンスはトラックスペックから取得
            areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["reference"]] * e.tracks; 
        }else{
//その他はアサインテーブルの値を合算
            e.members.forEach(function(ex){
                areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth[ex.option]];
            });
        };
//タイムコードトラックの幅を加算
        if(e.timecode != 'none') areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["timecode"]] * ((e.timecode == 'both')? 2:1);
//変数を取得
        if(e.fix)     tableFixWidth    += areaWidth;//固定エリア幅
        if(!(e.hide)) tableColumnWidth += areaWidth;//全幅
    });
    tableDocWidth = tableColumnWidth * xUI.PageCols + (xUI.XPS.sheetLooks.ColumnSeparatorWidth*(xUI.PageCols-1));
//リザルトのコンバート　なくても良いが将来的には必要

    tableDocWidth    = new nas.UnitValue(tableDocWidth    +xUI.XPS.sheetLooks.CellWidthUnit,'mm');
    tableFixWidth    = new nas.UnitValue(tableFixWidth    +xUI.XPS.sheetLooks.CellWidthUnit,'mm');
    tableColumnWidth = new nas.UnitValue(tableColumnWidth +xUI.XPS.sheetLooks.CellWidthUnit,'mm');

    if(type == 'fix'){
        return tableFixWidth;
    }else if(type == 'column'){
        return tableColumnWidth;
    }else if(type == 'document'){
        return tableDocWidth;
    };
    return {
        "fix"     : tableFixWidth,
        "column"  : tableColumnWidth,
        "document": tableDocWidth
    };
}

/*
 *  @params {Number}    pageNumber
 *  @returns {String}
 *      HTML timesheet page content
 *    タイムシート本体のHTMLを返すメソッド(ページ単位)
 *        xUI.pageView(pageNumber)
 *        引数はページ番号を整数で
 *        戻り値はページ内容のHTMLテキスト
 *
 *ページヘッダであった場合のみ固定のタイムラインヘッダーを出力する（画面表示専用）
 * 固定ヘッダの  第一第二第三  象限を出力する
 *   2  |  1 (横スクロール)
 *  ----+-----
 *   3  |  4
 *
 *引数:   pageNumber
 * 0    第一象限(-1)
 *-1    第二象限(-2)
 *-2    第三象限(-3)
 *    内部パラメータでは各値ともに減算して使用  --
 *    0以上は通常ページの出力（0 org）
 * 1~   第四象限(0 ~ ) 1 origin
 *
 *      xUI.XPS.xpsTracks.areaOrder
 *      xUI.XPS.sheetLooks.trackSpec(xUI.sheetLooks.trackspec)を参照
 * 
 TDTSの予備コマに相当するマージンの外観調整
背景色
    マージン区間
        背景色・通常区間に同じ（ブランク色にしない）
        区間長が0以外の場合マージン区間の区切りに赤ラインを引く(!! new !!) 文字は置かない

    トランジション区間
        トランジションマークを描画する(!! new !!)
        トランジション区間は、マージンに組み込む
        マージン長が
    end記述
        記述終了のラインを引く
        文字 "::end::" を配置
 */
/*トラック/トラックエリア/CSSクラスの関連をテーブル化する*/


xUI.pageView = function(pageNumber){
//console.log("++++++++++++++++++++++++++++ 可変書式対応")
    var restoreValue=this.Select;
    var BODY_ = '';
//    var headlineHeight=36;
//ページ数//プロパティに変更
    if(xUI.restriction){
        var Pages        = 1;//制限モードでは1固定
        var SheetRows    = Math.ceil(this.XPS.duration() / this.XPS.framerate) * Math.ceil(this.XPS.framerate);//ショット内フレーム数
        var hasEndMarker = true;// 継続時間終了時のエンドマーカー配置判定(必ず描画)
    }else if(xUI.viewMode=="Scroll"){
//compact(scroll)
        var Pages        = 1;//コンパクトモードでは固定
        var SheetRows    = Math.ceil(this.XPS.duration() / this.XPS.framerate) * Math.ceil(this.XPS.framerate);//ショット内フレーム数
        var hasEndMarker = true;// 継続時間終了時のエンドマーカー配置判定(必ず描画)
    }else{
//wordprop(pageImage)
        var Pages        = Math.ceil((this.XPS.duration() / this.XPS.framerate) / this.SheetLength);//総尺をページ秒数で割って切り上げ
        var SheetRows    = Math.ceil(this.SheetLength / this.PageCols) * Math.ceil(this.XPS.framerate);//カラム内フレーム数
        var hasEndMarker = false;// 継続時間終了時のエンドマーカー配置判定(初期値)

//コンパクトモード用の固定表示が残っている場合1〜3象限の値を消去 このクリアルーチンは別メソッドにしたほうが良い
        if((document.getElementById('qdr3'))&&(document.getElementById('qdr3').innerHTML)){
            document.getElementById('qdr1').innerHTML='';
            document.getElementById('qdr2').innerHTML='';
            document.getElementById('qdr3').innerHTML='';
        };
    };
/*
(2010/11/06)
    現在  PageLengthは冗長フレームを含む <秒数×フレーム母数>
    シート秒数が指定カラムで割り切れない場合は最後のカラムの秒数を1秒短縮して対応する仕様にする
    5秒シート  2段組みの場合  2.5秒2段でなく  3秒と2秒の段を作る
    従って1段のフレーム数は  切り上げ（指定秒数/指定段数）×フレーム母数

(2014/11/17)
    簡易表示のためのタイムラインヘッダを戻す機能を追加
    引数が0以下の場合はヘッダのみを返す
(2015/04/17)
    さらに拡張
引数    0でヘッドライン全体を第一象限用に
    -1で固定部第二象限に
    -2で第三象限に
    それぞれ出力する

簡易UIのために
タイムラインラベルを タイミング適用スイッチに兼用する拡張…可能？12/17

(2015/01/07)
    アクション欄をたたむ（非表示）
    アクション欄のタイムライン  表示プロパティの増設
(2016/07/16)
    アクション（リファレンス）欄の表示オプションを増設
    xUI.referenveView に  種別キーワードを配列で格納
    初期状態ではセル（置きかえ＋スチル）のみを表示する
(2016/08/19)
    xpsTracksとlayersの統合に伴うチューニング
(2017/07/20)
    リファレンスエリアのシート内容表示の際トラック抽出のバグがあったのを修正
(2017/07/21)
 ページ内に最終フレームが含まれるか否かを判定してカット記述終了マーカーを配置する拡張
(2018/03/10)
 トラック注釈を引き出し線付きで表示する機能増設
(2019/01/20)
 固定オーバーレイが参照非表示の際に表示乱れするのを抑制（高さ）
(2023/02/04)
 画像マスタードキュメント機能を拡張
 画像-UI一致のためsheetLooks拡張
 trackSpecをもとにareaOrderを作成してこれを表示のためのテーブルとして使用する
 左エンドの罫線＋マージンをテーブルセルとして処理することで、cssを簡略化

 (2023/06/28)
 sheetlooksオブジェクト分離のため ブロック幅算出の汎用関数を分離

 (2023/10/07)
 TDTS互換の画像表示を追加
 (2024/03/04)
 マージンラインを追加（マージン0の際は表示されない）
*/
//ページ番号が現存のページ外だった場合丸める
    if (pageNumber >=Pages){
        pageNumber=Pages;
    } else {
        if(pageNumber<=-3) pageNumber=0;
    };
    pageNumber--;//内部値に補正

//タイムシートテーブル

//タイムシートテーブルボディ幅の算出
/*
タイムシートのルック調整の為のおぼえがき
画面上は、規定幅のエレメントをすべて設定した状態で配置(cssに設定)
全体幅は自動計算

画像マスター機能の導入に伴う変更

印字上は全体幅の規定が存在するので、規定幅をテーブル全体幅に設定して
印刷時点で横方向をスケーリングして印字範囲内に収める

対応する変数とcssクラス
    SheetCellHeight      td.sheet
    LeftMargin           
    TimeGuideWidth       th.timeguidelabel
    ActionWidth          th.layerlabelR
    DialogWidth          th.dialoglabel
    SheetCellWidth       th.layerlabel
    cameraWidth          th.cameraLabel
    CommentWidth         th.framenotelabel
    ColumnSeparatorWidth .colSep

印字に適さない設定の場合は、一応警告を表示する。
印字用cssは、固定で作成する
現在A3サイズ固定

オーバー時は横幅を縮小

A4サイズオプションは検討中 202302
 */
/*
referenceデータは、本体Xpstに含まれないためここで整合性をチェックする

console.log("========================================================================");
console.log(this.referenceLabels);
    var referenceArea = this.XPS.xpsTracks.areaOrder.find(function(e){return (e.type == "reference")});
console.log(referenceArea);
    if((referenceArea)&&(referenceArea.tracks < this.referenceLabels.length)) referenceArea.tracks = this.referenceLabels.length;
 */
 /*
    表示モードは
    画像表示 ON|OFF
    ページ・スクロール切り替え Scroll|Wordprop
    制限モード
    jp|us切り替え（レイヤーの上下逆転）を検討（UI上の変更はない）
*/
/*
    スクロール固定幅（第2/3象限）
    スクロールエリア幅
    xUI.XPS.xpsTracks.areaOrder テーブルを参照するように切り替え 2023 02
*/
console.log(this === xUI);
console.log(this.sheetLooks);
console.log(xUI.XPS.toString(false));



    var tableFixWidth    = 0;
    var tableColumnWidth = 0;

    xUI.XPS.xpsTracks.areaOrder.forEach(function (e){
        var areaWidth = 0;
        if(e.type == 'reference'){
//トラックテーブル上に存在しないリファレンスはトラックスペックから取得
            areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["reference"]] * e.tracks; 
        }else{
//その他はアサインテーブルの値を合算
console.log(e);
            e.members.forEach(function(ex){
console.log(ex.option,Xps.TrackWidth[ex.option],xUI.XPS.sheetLooks[Xps.TrackWidth[ex.option]]);
                areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth[ex.option]];
            });
        };
//タイムコードトラックの幅を加算
        if(e.timecode != 'none') areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["timecode"]] * ((e.timecode == 'both')? 2:1);
//変数を取得
        if(e.fix)     tableFixWidth    += areaWidth;//固定エリア幅
        if(!(e.hide)) tableColumnWidth += areaWidth;//全幅
    });
    var areaWidth = xUI.getAreaWidth();
    if(this.viewMode == "Scroll"){
//Scrollモード
        var tableBodyWidth = tableColumnWidth;
        var PageCols = 1;
        var SheetLength = Math.ceil(this.XPS.duration()/this.XPS.framerate);
/*
    コンパクト(スクロール）モード
    １段組に固定
    第１象限    トラックラベル縦方向固定ヘッダ・横スクロール
    第２象限    縦横固定部
    第３象限    横方向固定フィールド・縦スクロール
    第４象限    本体ドキュメント・縦横スクロール
*/
    }else{
//PageImageモード
        var PageCols    = this.PageCols;
        var tableBodyWidth = tableColumnWidth * PageCols + 
            (xUI.XPS.sheetLooks.ColumnSeparatorWidth*(PageCols-1));//
        var SheetLength = this.SheetLength
        if(pageNumber==(Pages-1)){hasEndMarker=true;};

console.log(tableColumnWidth , this.PageCols ,xUI.XPS.sheetLooks.ColumnSeparatorWidth,this.PageCols);

/*
    シートワープロ（ページ）モード
    第１、２、３象限非表示
    第４象限のみを使用
*/
    };

console.log(xUI.sheetLooks);
console.log(tableFixWidth+":"+tableBodyWidth);

BODY_ +='<div class=sheetArea>';//open sheetArea
//============= ページテーブル出力開始
BODY_ +='<table cellspacing=0 ';
    if(pageNumber<=-2){
//第2,3象限用
BODY_ +='style="width:' + tableFixWidth  + this.sheetLooks.CellWidthUnit+'"';
    }else{
//第1,4象限用
console.log('style="width:' + tableBodyWidth + this.sheetLooks.CellWidthUnit+'"');
//BODY_ +='style="width:' + tableBodyWidth + this.sheetLooks.CellWidthUnit+'"';
    };
    if(pageNumber<0){

BODY_ +='id="qdr'+(-1*pageNumber)+'" class="sheet"';
    }else{
//BODY_ +='id="qdr4" ';
BODY_ +='id="page_'+String(pageNumber+1)+'" class="qdr4 sheet"';
    }
BODY_ +=' >';
BODY_ +='<tbody>';
//*========================================不可視｜タグ表示シートヘッダ
/*    テーブルルックを決め込む為の幅配置及び将来的にリンクペアレントを表示する領域(かも)
    第一行目 height:2px class:tlhead  (timelineheader)
    不可視シートヘッダ内には、タグを表示するspanを格納するので注意
*/
BODY_ +='<tr class=tlhead ';
    if(this.viewMode=="Scroll") BODY_ +='id=tlhead';
    if(pageNumber==0) BODY_ +='Parent';
BODY_ +='>';
//左マージンセル
BODY_ +='<td class="sheetMargin-left left-top" ></td>';//
//*==============================ページカラムループ処理
    for (var cols=0;cols < PageCols;cols ++){
//*==============================トラックエリアループ処理
console.log(this.XPS.xpsTracks.areaOrder);
        for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){
            var areaOrder = this.XPS.xpsTracks.areaOrder[area];
console.log(areaOrder.timecode);
//第二第三象限でかつコンパクトモードでない場合はここでブレイクしてヘッダーを縮小
            if((!(areaOrder.fix))&&(this.viewMode=="Scroll")&&(pageNumber<=-2)) break;
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'head')){
/*********** timeguide ********************/
BODY_ +='<th class="tcSpan tlhead"';
BODY_ +=' ></th>';
            };
            if(areaOrder.type == 'reference'){
//*==============================リファレンスメンバ処理
                for (var r = 0 ; r < this.referenceLabels.length ; r++){
/*********** Action Ref *************/
BODY_ +='<th class="referenceSpan tlhead ref" ';
BODY_ +='> </th>';
                };
//*==============================リファレンスメンバ処理//
            }else{
//*==============================エリアメンバ処理
                for (var m = 0; m < areaOrder.members.length; m++ ){
BODY_ +='<th class="'+ trackHeaderClass[areaOrder.members[m].option] +' tlhead" ';
BODY_ +=' id="TL'+ areaOrder.members[m].index +'"';
BODY_ +=' > ';
/*********** span for track tag *************/
//=====================編集セル本体をタイムライン種別に合わせて配置(ラベル部分)
                    if(this.XPS.xpsTracks[areaOrder.members[m].index].tag){
                        var noteStep = 0;//tag深度 
                        for (var r = areaOrder.members[m].index ; r >= 0 ;r --) if(this.XPS.xpsTracks[r].tag) noteStep ++ ;
                        var trackId = ['p',pageNumber,'c',cols,'t',areaOrder.members[m].index].join('');
BODY_ += '<span id="';
BODY_ += trackId;
BODY_ += '" class="noteOverlay'
BODY_ += ' note'+((noteStep - 1) % 5 +1);
BODY_ += '"><span id="'
BODY_ += trackId;
BODY_ += '_L" class=overlayLabel>'+this.XPS.xpsTracks[areaOrder.members[m].index].tag+'</span></span>'
                    };
BODY_ +='</th>';
                };
//*==============================エリアメンバ処理//
            };
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'tail')){
/*********** timeguide ********************/
BODY_ +='<th class="tcSpan tlhead"';
BODY_ +=' ></th>';
            };
        };
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
        if (cols < (PageCols-1)){
BODY_ +=('<td class="colSep tlhead" ></td>');
        };
    };
//*==============================ページカラムループ処理//
//*========================================不可視｜タグ表示シートヘッダ//
BODY_ +='</tr>';//改段
//*第２行目========================================シート記入部ヘッダ
BODY_ +='<tr>';
//左マージンセル
BODY_ +='<td class="trackLabel left-end" ></td>';//
//*==============================ページカラムループ処理
    for (cols=0;cols < PageCols;cols ++){
//*==============================トラックエリアループ処理
        for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){
            var areaOrder = this.XPS.xpsTracks.areaOrder[area];
            if((pageNumber<-1)&&(!(areaOrder.fix))) break;//第２・３象限ではfix以外をスキップ
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'head')){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class="tclabel trackLabel trackLabel-tall" ';
BODY_ +=' ><span class=timeguide> </span></th>';
            };
            if(areaOrder.type.match(/sound|dialog/i)){
//単段 複数トラック テープルヘッダー・テキストセンタリング
                var text ={
                    sound:"N",
                    dialog:"台<BR>詞"
                }[areaOrder.type];
                var cellclass;
/*********** Dialog|Sound Area*************/
BODY_ +='<th rowspan=2 class="dialoglabel trackLabel trackLabel-tall';
                if(areaOrder.timecode == 'tail')
BODY_ +=' dialoglabel-join';
BODY_ +='" ';
                if(areaOrder.members.length > 1)
BODY_ +='colspan ="'+areaOrder.members.length+'" ';//ダイアログ|soundの幅は可変 1~
BODY_ +='>'+text+'</th>';
            }else if(areaOrder.type.match(/comment/i)){
//単段処理 確定１トラック
/*********** FrameNote Area *************/
BODY_ +='<th rowspan=2 class="framenotelabel trackLabel trackLabel-tall" title="';
BODY_ +='MEMO.';
BODY_ +='"></th>';
            }else if(areaOrder.type.match(/reference/i)){
/*********** Reference Area *************/
BODY_ +='<th ';
BODY_ +='class="referencelabel rnArea trackLabel ref" ondblclick=sync("referenceLabel") title="" '
BODY_ +='colspan=' + this.referenceLabels.length+' ';//
BODY_ +='>reference</th>';
                var text = ((areaOrder.members.length <= 2)?"ref.":"reference");
            }else if(areaOrder.members.length > 0){
//二段・複数トラック消費型 可変 0~
                var text = {
                    replacement :"cell",
                    camera      :((areaOrder.members.length == 1)?"cam.":"camera"),
                    action      :"action"
                }[areaOrder.type];
                var cellclass = {
                    replacement :'class="editArea trackLabel" ondblclick=sync("editLabel") title="" ',
                    camera      :'class="camArea trackLabel" title="" ',
                    action      :'class="editArea trackLabel" ondblclick=sync("editLabel") title="" '
                }[areaOrder.type];
BODY_ +='<th ';
BODY_ += cellclass
                if(areaOrder.members.length > 1)
BODY_ +='colspan='+areaOrder.members.length+' ';//
BODY_ +='>'+text+'</th>';
            };
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'tail')){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class="tclabel trackLabel" ';
BODY_ +=' ><span class=timeguide> </span></th>';
            };
        };
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
        if (cols < (PageCols-1)){
BODY_ +=('<td class="trackLabel left-end" ></td>');
        };
    };
//*==============================ページカラムループ処理//
BODY_ +='</tr>';
//*第２行目========================================シート記入部ヘッダ//

//*第３行目========================================シート記入部ヘッダ
//ヘッダラベル等を出力するライン
BODY_ +='<tr>';
//左マージンセル
BODY_ +='<td class="trackLabel left-end" ></td>';//
//*==============================ページカラムループ処理
    for (cols=0;cols < PageCols;cols ++){
//*==============================トラックエリアループ処理
        for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){

            var areaOrder = this.XPS.xpsTracks.areaOrder[area];
            if((pageNumber<-1)&&(!(areaOrder.fix))) break;//第２・３象限ではfix以外をスキップ
            if(areaOrder.type.match(/dialog|sound|comment/i)){
//先行処理済なのでスキップ
                continue;
            }else if(areaOrder.type == 'reference'){
//*==============================リファレンスメンバ処理
/*
    referenceXpsのリプレースメントトラックが、trackSpecのリファレンストラック数に満たない場合
    トラックラベルなしの空トラックを一時的に加える仕様変更 2025 05 28
    オーバーした場合は、従来通り拡張した表示を行う
*/
                for (var r = 0 ; r < this.referenceLabels.length ; r++){
BODY_ +='<th id="rL';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();
BODY_ +='" class="layerlabelR trackLabel ref"';
BODY_ +=' >';
                    var currentRefLabel = (this.referenceXPS.xpsTracks[this.referenceLabels[r]])?this.referenceXPS.xpsTracks[this.referenceLabels[r]].id:"";
                    var lbString=(currentRefLabel.length<3)?
                    currentRefLabel:
                    '<a onclick="return false;" title="'+currentRefLabel+'">'+currentRefLabel.slice(0,2)+'</a>';
                    if (currentRefLabel.match(/^\s*$/)){
BODY_ +='<span style="color:'+this.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
                    }else{
BODY_ +=lbString;
                    };
                };
//*==============================リファレンスメンバ処理//
            }else{
//*==============================エリアメンバループ処理
                for (var m = 0;m < areaOrder.members.length ; m ++){
    if(pageNumber>=-1){    };

//=====================編集セル本体(ラベル部分)
                    var r = areaOrder.members[m].index;
                    var currentLabel=this.XPS.xpsTracks[r].id;
                    var currentElementId= 'L' + String(r) + '_' + pageNumber + '_' + String(cols);
BODY_ +='<th id="' + currentElementId ;
                    switch (this.XPS.xpsTracks[r].option){
                    case "still" :
BODY_ +='" class="stilllabel trackLabel" ' ;
                    break;
                    case "stagework":
                    case "geometry":
BODY_ +='" class="geometrylabel trackLabel" ';
                    break;
                    case "effect":
                    case "sfx"   :
BODY_ +='" class="sfxlabel trackLabel" ';
                    break;
                    case "camerawork":
                    case "camera":
BODY_ +='" class="cameralabel trackLabel" ';
                    break;
                    case "replacement":
                    case "timing":
                    case "dialog":
                    case "sound":
                    default:
BODY_ +='" class="layerlabel trackLabel" ';
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
                    };
BODY_ +='</th>';
                };
//*==============================エリアメンバループ処理//
            };
        };
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
        if (cols < (PageCols-1)){
BODY_ +=('<td class="trackLabel left-end" ></td>');
        };
    };
//*==============================ページカラムループ処理//
BODY_ +='</tr>';
//*第３行目========================================シート記入部ヘッダ//

//*========================================以下  シートデータ本体
//pageNumberが-3以下(第２象限)の場合は固定(fix指定エリア)部分まで出力
//
    if((pageNumber>=0)||(pageNumber<-2)){
/*=========================シートデータエリア==========================*/
//alert("SheetRows : "+ SheetRows +"\nthis.PageCols : "+this.PageCols);
        var currentPageNumber = (pageNumber < -2)? 0:pageNumber;
//*==============================シートライン処理
        for (var n = 0 ; n < SheetRows ; n ++){
BODY_ +='<tr>';
//*==============================ページカラムループ処理
            for (cols=0;cols < PageCols;cols ++){

//フレーム毎のプロパティを設定
                var myFrameCount = cols * SheetRows + n;//ページ内フレームカウント
                var currentSec   = (currentPageNumber * SheetLength) + Math.floor(myFrameCount / Math.ceil(this.XPS.framerate));//処理中の秒
                var restFrm= myFrameCount % Math.ceil(this.XPS.framerate);//処理中の  ライン/秒
                var mySpt=(this.XPS.framerate.opt=='smpte')?";":":";
                var myTC=[Math.floor(currentSec/3600)%24,Math.floor(currentSec/60),currentSec%60].join(":")+mySpt+restFrm
                var current_frame= nas.FCT2Frm(myTC,this.XPS.framerate);//FCTからフレームインデックスを導くドロップ時はnull
                var count_frame = (current_frame < xUI.XPS.headMargin)?
                    xUI.XPS.headMargin - current_frame:
                    current_frame - xUI.XPS.headMargin + 1;
//現在処理中のフレームは有効か否かをフラグ  フレームがドロップまたは継続時間外の場合は無効フレーム
                var isBlankLine =((current_frame != null)&&(current_frame < this.XPS.duration()))? false:true;
//現在処理中のフレームがマージンに含まれるか否か
                var isMargin = ((current_frame < this.XPS.headMargin)||((this.XPS.xpsTracks.duration - current_frame) > this.XPS.headMargin))? true:false;
//セパレータ(境界線)設定
                if(restFrm==(Math.ceil(this.XPS.framerate)-1)){
//秒セパレータ
                    var tH_border= 'ltSep';
                    var dL_border= 'dtSep';
                    var sC_border= 'ntSep';
                    var mO_border= 'ntSep';
                }else{
                    if (n % this.sheetSubSeparator==(this.sheetSubSeparator-1)){
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
//    判定基準を継続時間内外のみでなくドロップフレームに拡張
//      ヘッド｜テールマージン拡張も必要（未処理 2023 02）
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

//左マージンセル 兼 シート罫線の左端(マーカーは遅延解決する)
                if(cols == 0){
BODY_ +='<td class="sheetbody left-end" id="le'+current_frame.toString()+'">';//
                    if((xUI.XPS.headMargin)&&(current_frame == xUI.XPS.headMargin)){
BODY_ +='<span class=marginMarker id=headMarker></span>';//CSSのテスト用コード
                    }else if((xUI.XPS.tailMargin)&&(current_frame == (xUI.XPS.xpsTracks.duration - xUI.XPS.tailMargin))){
BODY_ +='<span class=marginMarker id=tailMarker></span>';//CSSのテスト用コード
                    };
BODY_ +='</td>';
                };
//*==============================トラックエリアループ処理
                for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){
                    var areaOrder = this.XPS.xpsTracks.areaOrder[area];
                    if((pageNumber<-1)&&(!(areaOrder.fix))) break;
                    if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'head')){
/*********** timeguide ********************/
// timeguide のアライメントをはみ出し付き右寄せにするため directipn:rtl を使用 そのため 単位記号としての引用符は左置きとなる//
BODY_ +='<td nowrap ';
BODY_ +='class="tcbody Sep ';
//BODY_ += tH_border;if(cellClassExtention) 
BODY_ += tH_border+cellClassExtention;
BODY_ +='"';
BODY_ +=' id=tcg_' + String(current_frame);
BODY_ +=' >';
                        if (restFrm == 0)
BODY_ += "<span class=timeguide>['"+ currentSec.toString()+"]</span>";
                        if (((n+1)%2 ==0)&&(! isBlankLine)){
BODY_ += "<span class=frameguide>"+String(count_frame)+"</span>";
                        }else{
BODY_+='<br>';
                        };
BODY_ +='</td>';
                    };
//
                    if(areaOrder.type == 'reference'){
//*----refecece area
                        for (var refLabelID=0;refLabelID< this.referenceLabels.length;refLabelID++){
                            var r = this.referenceLabels[refLabelID];
BODY_ +='<td ';
BODY_ +='class="sheetbody ref ';
BODY_ +=sC_border;
BODY_ +='"';
                            if (current_frame<this.referenceXPS.xpsTracks[r].length){
//表示可能な内容あり
BODY_ += 'id=\"r_';
BODY_ += r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
BODY_ +='class="';
BODY_ +=sC_border + cellClassExtention + ' ref';
BODY_ +='"';
                            }else{
//ブランクセル
BODY_ +='class="';
BODY_ +=sC_border + '_Blank';
BODY_ +='"';
                            };
BODY_ +='>';
//セル内容を転記
                            if(current_frame >= this.referenceXPS.xpsTracks[r].length){
BODY_+="<br>";
                            }else{
                                this.Select = [r,current_frame];
                                if (this.referenceXPS.xpsTracks[r][current_frame]!=""){
BODY_ += this.trTd(['r',r,current_frame]);
                                }else{
BODY_+='<br>';
                                };
                            };
BODY_ +='</td>';
                        };
//*----refecece area//
                    }else if(areaOrder.type == 'comment'){
//レコード終端フィールド処理    メモエリア
                        if(pageNumber >=0){
BODY_ +='<td ';
                            if (! isBlankLine){
BODY_ += 'id="';
BODY_ += (this.XPS.xpsTracks.length-1).toString()+'_'+ current_frame.toString();
BODY_ +='" ';
                            };
BODY_ +='class="sheetbody ';
BODY_ +=mO_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
                            if (isBlankLine){
BODY_+="<br>";
                            }else{
                                this.Select = [this.XPS.xpsTracks.length-1,current_frame];
                                if ( this.XPS.xpsTracks[this.XPS.xpsTracks.length-1][current_frame]!=""){
BODY_ += this.trTd([this.XPS.xpsTracks.length-1,current_frame]);
                                }else{
BODY_+='<br>';
                                };
                            };
BODY_+='</td>';
                        };
                    }else{
//*----sheet data area    各種タイムライン混在
//*==============================エリアメンバループ処理
                        for (var m = 0;m < areaOrder.members.length ; m ++){
                            var r = areaOrder.members[m].index;
//                        if((r==0)||(this.XPS.xpsTracks[r].option=="dialog")){}
                            if((areaOrder.members[m].option == 'dialog')||(areaOrder.members[m].option == 'sound')){
//ダイアログ|サウンド
BODY_ +='<td ';
                                if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
                               };
BODY_ +='class="';
BODY_ +=' soundbody ';
                                if(areaOrder.timecode == 'tail')
BODY_ +=' soundbody-join ';
//BODY_ +=' sheetbody ';
BODY_ += dL_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
                                if (isBlankLine){
BODY_+="<br>";
                                }else{
                                    this.Select=[0,current_frame];
                                    if (this.XPS.xpsTracks[r][current_frame]!=""){
BODY_+=this.trTd([r,current_frame]);
                                    }else{
BODY_ += '<BR>';
                                    };
                                };
BODY_ +='</td>';
                            }else{
//音響以外のシートセル
BODY_ +='<td ';
                                if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
                                };
BODY_ +='class="sheetbody ';
BODY_ +=sC_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
                                if (isBlankLine){
BODY_+="<br>";
                                }else{
                                    this.Select = [r,current_frame];
                                    if (this.XPS.xpsTracks[r][current_frame]!=""){
BODY_+=this.trTd([r,current_frame]);
                                    }else{
BODY_+='<br>';
                                    };
                                };
BODY_ +='</td>';
                            };
//*----sheet data area//
                        };
//*==============================エリアメンバループ処理//
                    };
                    if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'tail')){
/*********** timeguide ********************/
BODY_ +='<td nowrap ';
BODY_ +='class="tcbody Sep ';
//BODY_ +=tH_border;if(cellClassExtention) 
BODY_ +=tH_border+cellClassExtention;
BODY_ +='"';
BODY_ +=' id=tcg_' + String(current_frame);
BODY_ +=' >';
                        if (restFrm == 0)
BODY_ += "<span class=timeguide>[ '"+ currentSec.toString()+" ]</span>";
                        if (((n+1)%2 ==0)&&(! isBlankLine)){
BODY_ += "<span class=frameguide>"+String(count_frame)+"</span>";
                        }else{
BODY_+='<br>';
                        };
BODY_ +='</td>';
                    };
                };
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
                if (cols < (PageCols-1)){
BODY_ +=('<td class="sheetbody left-end" ></td>');
                };
            };
//*==============================ページカラムループ処理//
BODY_ +='</tr>';
        };
//*==============================シートライン処理//
    };

BODY_ +='</tbody></table>';
BODY_ +='\n';
//============= テーブル出力終了
/*タイムシート記述終了マーカーはxUIクラスメソッドで配置に変更*/
//============= ページフッター出力
//BODY_ +='<biv class=pageFooter></div>';
//BODY_ +='\n';
//============= ページフッター出力終了
BODY_ +='</div>';//close sheetArea//

//画像タイムシート用エレメントを加える
//第4象限限定
    if(pageNumber >= 0){
        if(xUI.viewMode != 'Scroll'){
//ページモード
BODY_ +='\t<div id="sheetImage-'+pageNumber+'" class="overlayDocmentImage" >';//place page image field// 
BODY_ +='\t</div>\n';//close pageImage//
//console.log('================ for sheet image ====================//')
        }else{
//スクロールモード 
BODY_ +='\t<div id="noteImageField" class="overlayNoteImage" >';//place note image field// 
BODY_ +='\t</div>\n';//close noteImage//
//console.log('================ for note image ====================//')
        };
    };
BODY_ +='';
        this.Select =   restoreValue;
        return BODY_;
};
//******************************** pageView//
/**
    @params {Array|Number} endPint
    @returns {Object HTMLElement}
     エンドマーカー配置メソッド  placeEndMarker
    タイムシート記述最終フレームの注釈トラックにタイムシートにオーバーレイする形でマーカーを配置する
    マーカーはspan要素として シートセルを基準に下方オフセットで置く
 */
xUI.replaceEndMarker = async function replaceEndMarker(endPoint){
//すでにマーカーがあれば削除
    if(document.getElementById('endMarker')) document.getElementById('endMarker').remove();
    if (typeof endPoint == 'undefined'){
        try{
            var endPoint = [xUI.XPS.xpsTracks.length, xUI.XPS.xpsTracks.duration];
        }catch(er){return;}
    };
    if(!(endPoint instanceof Array)) {endPoint=[xUI.XPS.xpsTracks.length,endPoint]};
    var endCellLeft  = document.getElementById([0,endPoint[1]-1].join('_'));
    var endCellRight = document.getElementById([endPoint[0]-1,endPoint[1]-1].join('_'));
    endCellRight.innerHTML += '<span id=endMarker class=endMarker> :: end ::</span>'

//JQueryの使用をこの部分のみに制限（ここも削除予定）
/*    $("#endMarker").css({
        'top'  :(endCellRight.clientHeight),
        'left' :(endCellLeft.offsetLeft - endCellRight.offsetLeft ),
        'width':(endCellRight.offsetLeft + endCellRight.clientWidth - endCellLeft.offsetLeft) 
    });//offsetParentをシートテーブルと共用してスケールを合わせる */

    nas.HTML.setCssRule("#endMarker",
        'top:  '+(endCellRight.clientHeight)+'px;'+
        'left: '+(endCellLeft.offsetLeft - endCellRight.offsetLeft )+'px;'+
        'width:'+(endCellRight.offsetLeft + endCellRight.clientWidth - endCellLeft.offsetLeft) +'px;'
    );//offsetParentをシートテーブルと共用してスケールを合わせる 

    return document.getElementById('endMarker');
}
/**
     マージンマーカー配置メソッド  placeMarginMarker
    タイムシート記述最終フレームの注釈トラックにタイムシートにオーバーレイする形でマーカーを配置する
    マーカーはspan要素として シートセルを基準に上方オフセットで置く
    罫線上に1pxの赤ライン
 */
xUI.placeMarginMarker = async function placeMarginMarker(){
//すでにマーカーがあれば削除
    var marks = Array.from(document.getElementsByClassName('marginMarker'));
    marks.forEach(function(e){e.remove();});
    var markCell  = null;
    var markRight = null;
    var markWidth = 0;
    ['headMargin','tailMargin'].forEach(function(mgn){
        if(xUI.XPS[mgn]>0){
            var eid = (mgn == 'headMargin' )? 'headMarker':'tailMarker';
            var mgnPoint = (mgn == 'headMargin' )?
                xUI.XPS.headMargin:xUI.XPS.xpsTracks.duration-xUI.XPS.tailMargin;//head|tail
            markCell  = document.getElementById('le' + mgnPoint);//トラック左端
            markRight = document.getElementById([xUI.XPS.xpsTracks.length-1,mgnPoint].join('_')).getBoundingClientRect();
            markWidth = markRight.right - markCell.getBoundingClientRect().left;
            var mrk = document.createElement('span');
            mrk.id = eid;
            mrk.className = 'marginMarker';
            markCell.append(mrk);
        };
    });
    if(markWidth) nas.setCssRule('.marginMarker','width:'+markWidth+'px;');
}
/* TEST
    xUI.placeMarginMarker();
 */
/**
 *  @params {String} ID
 * 本体シートの表示を折り畳む（トグル）
 */
xUI.packColumn=function(ID){
var Target=ID;
var PageCols=(this.viewMode=="Scroll")?1:this.PageCols;
var PageCount=(this.viewMode=="Scroll")?1:Math.ceil(this.XPS.duration()/this.PageLength);
    for (Page=0 ;Page < PageCount;Page++)
    {
//レイヤラベルのID "L[レイヤID]_[ページID]_[カラムID]"
        for (var cols=0;cols < PageCols;cols ++){
            alert("L"+Target+"_"+Page+"_"+cols+" : "+document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width);
            var isNarrow=(document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width=="4px")?true:false;
            document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width=(isNarrow)? this.sheetLooks.SheetCellWidth:this.sheetLooks.SheetCellNarrow;
            alert(document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width+" : "+isNarrow);

        };
    };
};

//参照シートの表示を折り畳む(トグル)
xUI.packRefColumns=function()
{
var PageCols=(this.viewMode=="Scroll")?1:this.PageCols;
var PageCount=(this.viewMode=="Scroll")?1:Math.ceil(this.XPS.duration()/this.PageLength);
   for (var Target=1;Target<=this.referenceLabels.length;Target++){
    for (var Page=0 ;Page < PageCount ;Page++){
//レイヤラベルのID "L[レイヤID]_[ページID]_[カラムID]"
        for (var cols=0;cols < PageCols;cols ++){
            alert("rL"+Target+"_"+Page+"_"+cols+" : "+document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width);

            var isNarrow=(document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width=="4px")?true:false;
            document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width=(isNarrow)? this.sheetLooks.SheetCellWidth:this.sheetLooks.SheetCellNarrow;
//            alert(document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width+" : "+isNarrow);

        };
    };
   }
};
//参照シートの非表示/表示
/*
tableColumnWidth
$('.ref').each(function(index,elem){$(elem).show/hide()});組み合わせ処理が必要
表示状態を他のメソッドから参照する必要あり（重要）
*/
xUI.flipRefColumns=function(action){
        var status=$('.rnArea').isVisible();
    if(action){
        action = (action == 'hide')? false:true;
        if(action ==  status) return;
    }else{
        action = !(status);
    }
    var flipSpan = (this.sheetLooks.ActionWidth*this.referenceLabels.length)*((this.viewMode=="Compact")?1:this.PageCols);
    if(action){
        $('.ref').show();
//        $('#qdr4.sheet').width($('#qdr4.sheet').width()+flipSpan);
        $('.qdr4.sheet').width($('.qdr4.sheet').width()+flipSpan);
        if(this.viewMode=="Scroll"){
            $('#qdr3.sheet').width($('#qdr3.sheet').width()-flipSpan);
            $('#qdr2.sheet').width($('#qdr2.sheet').width()-flipSpan);
            $('#qdr1.sheet').width($('#qdr1.sheet').width()+flipSpan);
        }
    }else{
        $('.ref').hide();
//        $('#qdr4.sheet').width($('#qdr4.sheet').width()-flipSpan);
        $('.qdr4.sheet').width($('.qdr4.sheet').width()-flipSpan);
        if(this.viewMode=="Scroll"){
            $('#qdr3.sheet').width($('#qdr3.sheet').width()-flipSpan);
            $('#qdr2.sheet').width($('#qdr2.sheet').width()-flipSpan);
            $('#qdr1.sheet').width($('#qdr1.sheet').width()-flipSpan);
        }
    }
//    xUI.replaceEndMarker(xUI.XPS.xpsTracks.duration);
};

/**  UI関連メソッド

ユーザインターフェースコントロール

*/
/*
    スピンアクション
xUI.spin(vAlue)
引数:
設定するスピン量  数値
または
キーワード right/left/up/doun/fwd/back
引数無しで現在のスピン量を返す
戻値:更新あとのスピン量
*/
xUI.spin =function(vAlue){
    if(typeof vAlue =="undefined"){return this.spinValue;}
    var NxsV  = this.spinValue;    //spin値を取得
    var tRack = this.Select[0];//IDからカラムとラインを取得
    var fRame = this.Select[1];//
    var NxrA  = tRack*1;
    var NxFr  = fRame*1;//暫定的に次のフレームをもとのフレームで初期化

//スピンオプションにしたがって次の位置を計算する
switch (vAlue) {
case 'fwd' :    ;//スピン前方*
    NxFr =((NxFr + NxsV) % this.XPS.duration() );
    if (!this.sLoop) {if (fRame > NxFr) {NxFr = fRame}};
    break ;
case 'back' :    ;//スピン後方*
    NxFr =((NxFr + this.XPS.duration() - NxsV ) % this.XPS.duration() ) ;
    if (!this.sLoop) {if (fRame < NxFr) {NxFr = fRame }};
    break ;
case 'down' :    ;//\[down\]*
    NxFr = (NxFr + 1 )% this.XPS.duration() ;
    if ((!this.cLoop) && (fRame > NxFr)) {NxFr = fRame};
    break ;
case 'up' :    ;//\[up\]*
    NxFr = ((NxFr + this.XPS.duration() -1) % this.XPS.duration() );
    if ((!this.cLoop) && (fRame < NxFr)) {NxFr = fRame * 1};
    break ;
case 'right' :    ;//\[right\]データが未編集の場合のみ左右スピン
    if (! this.edchg)
    {
        NxrA =(NxrA < this.XPS.xpsTracks.length) ?
        (NxrA + 1 ) : (this.XPS.xpsTracks.length) ;
    };
    break ;
case 'left' :    ;//\[left\]編集中の場合は、システムに戻す*
    if (! this.edchg)
    {NxrA = (NxrA>0) ? (NxrA -1) : 0 ;};
    break ;
case 'pgup' :    ;//ページアップ*
    if (NxFr-this.cPageLength >= 0){
    NxFr=NxFr-this.cPageLength};
    break;
case 'pgdn' :    ;//ページダウン*
    if(NxFr+this.cPageLength < this.XPS.duration()){
    NxFr=NxFr+this.cPageLength};
    break;
case 'v_up' :    ;//spin値ひとつあげ
    NxsV++;if(NxsV > this.XPS.framerate) NxsV=1;
//return NxsV;
    break;
case 'v_dn' :    ;//spin値ひとつさげ
    NxsV--;if(NxsV <= 0) NxsV=this.XPS.framerate;
//return this.spinValue;
    break;
case 'v_loop' :    ;
    NxsV++;NxsV=[2,3][NxsV%2];//spin値を2,3 交互切り換え
//    NxsV--;NxsV=[2,3,4][NxsV%3];//spin値を2,3,4 交互切り換え
//return this.spinValue;
    break;

case 'update'    :    ;//セレクションの値からスピンの更新
//    if(this.Selection[0]==0 && this.Selection[1]>=0 &&this.spinSelect)
    if(this.Selection[0]==0 && this.Selection[1]>=0){
        NxsV=(Math.abs(this.Selection[1])+1);
    };
    break;
default :    ;//数値の場合は、spin値の更新 数値以外はNOP
    if (isNaN(vAlue)){return;false}else{NxsV=vAlue*1};
};

//スピン値の変更があった場合は、スピン表示の更新
    if(NxsV != this.spinValue)
    {
        this.spinHi("clear");
        this.spinValue=NxsV;
        document.getElementById("spin_V").value=this.spinValue;
        this.spinHi();
    };
    var newID=NxrA+"_"+NxFr;//新しいフォーカス位置を導く
//位置の更新があった場合のみフォーカスを更新
    if((newID != this.getid("Select")) || this.edchg){
         this.selectCell(newID);
    };
    return this.spinValue;
};
//
/*    ダイアログ（くちぱく）指定タイムライン用のSpin動作
    現在値のinc/decをコマンドで行う
*/
xUI.dialogSpin=function(param)
{
    var doSpin=true;
    var entry=(this.eddt)?this.eddt:this.getCurrent();//

    if (! entry || entry=="blank"){syncInput("");return;};

    switch(param)
    {
    case "incr":    doSpin=false;entry++;break;
    case "decr":    doSpin=false;if(entry>1){entry--;break}else{return;break;};
    case "incrS":    entry++;break;
    case "decrS":    if(entry>1){entry--;break}else{return;break;};
    };

    if(doSpin) 
    {
        this.sheetPut(entry);//更新
        this.spin("fwd");
    }else{
        this.eddt = entry;
        syncInput(entry);
    if(!this.edchg)this.edChg(true);
    };

    return false;
};

/*xUI.getCurrent()
引数:なし
戻値:現在フォーカスのあるシートセルの持つ値

現行の関数は、timingタイムラインのみで意味を持つので、改修が必要2015.09.18

*/
xUI.getCurrent=function(){

    var currentValue=null;
    for(var id=this.Select[1];id>=0;id--)
    {
        currentValue=dataCheck(this.XPS.xpsTracks[xUI.Select[0]][id]);
        if(currentValue && currentValue!="blank") break;
     };
    return currentValue;
};
//
//xUI.getCurrent=getCurrent_ ;
//


/*    ラピッドモードのコマンドを実行    */
xUI.doRapid=function(param){if(xUI.rapidMode) xUI.rapidMode.command[param]();};

/*    複写
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避
 */
xUI.copy    =function(){
    this.yank();
    if(ClipboardEvent){
        
    }
};

/*    切り取り
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避して、範囲内を空データで埋める
選択範囲があれば解除してフォーカスを左上にセット

セクション選択の場合(xUI.emode==2) ヤンクバッファにはセクションオブジェクトが入る
 */
xUI.cut    =function(evt){
    console.log(evt)
    this.yank();
    if(xUI.activeDocument.content instanceof Xps){
//選択範囲を取得して全部空のストリームに作って流し込む。
        var actionRange=this.actionRange();
        var Columns=actionRange[1][0]-actionRange[0][0];//幅
        var Frames=actionRange[1][1]-actionRange[0][1];//継続時間
        var bulk_c='';
        var bulk= '';
        for (var f=0;f<=Frames;f++) {bulk_c+=(f!=Frames)? ","    :"";};
        for (var c=0;c<=Columns;c++) {bulk+=(c!=Columns)? bulk_c+"\n":bulk_c;};
        this.sheetPut(bulk);
        this.selectCell(actionRange[0]);//
        this.selection();
    }else if(xUI.activeDocument.content instanceof xMap){
    }else if(xUI.activeDocument.content === pman.reName){
//ヤンクした範囲を取り除く
console.log('reName CUT');
            var X = new xUI.InputUnit(
                [pman.reName.focus,pman.reName.getSelected(true)],
                [pman.reName.getSelected()],
                {
                    command:'remove',
                    focus:pman.reName.focus,
                    selection:pman.reName.getSelected(true),
                    backup:Array.from(pman.reName.items)
                }
            );
            pman.reName.getSelected().forEach(function(e){e.remove()})
        xUI.put([X],false,true);
        pman.reName.refreshItemlist(true);
    };
    this.inputFlag="cut";
};

/*    貼り付け
引数:なし
戻値:なし
現在の操作対象範囲左上を基点にヤンクバッファ内容をペースト
操作対象範囲左上をフォーカスして書き換え範囲を選択範囲にする

 */
xUI.paste    =function(){
    this.inputFlag="paste";
    if(xUI.activeDocument.content instanceof Xps){
        var bkPos=this.Select.slice();
        this.sheetPut(this.yankBuf.body);
        this.selectCell(bkPos);
    }else if(xUI.activeDocument.content instanceof xMap){
        
    }else if(xUI.activeDocument.content === pman.reName){
//ヤンクバッファの値をitemsへ挿入
//同一のアイテムがすでにアイテムリストにある場合は、そのアイテムの移動に振替が行われる
//同一セッション内に同一のアイテムが同時に複数存在することは認められない
//この制限はローレベルファンクションで規制される
        if((xUI.yankBuf.body instanceof Array)&&(xUI.yankBuf.body.length)){
            var X = new xUI.InputUnit(
                [pman.reName.focus,pman.reName.getSelected(true)],
                this.yankBuf.body,
                {
                    command:'append',
                    focus:pman.reName.focus,
                    selecion:pman.reName.getSelected(true),
                    value:Array.from(xUI.yankBuf.body),
                    backup:Array.from(pman.reName.items)
                }
            );
            pman.reName.pending = true;
            var insPt = (pman.reName.focus < 0)? pman.reName.items.length:pman.reName.focus;
            pman.reName.appendItems(xUI.yankBuf.body,insPt,'PLACEBEFORE');
            pman.reName.rewrite = true;
            pman.reName.panding = false;
            xUI.put([X],false,true);
            pman.reName.refreshItemlist(true);
        };
    };
};
/**    タイムシート上の選択範囲を移動
xUI.move(dest,dup);
    @params {Array}    dest
        移動量ベクトル[deltaColumn,deltaLine]
    @params {Boolean}   dup
        複製フラグ trueで移動先に複製を配置

    @returns    {Boolean}
        移動成功時 true 失敗時は false

カットとペーストに相当する入力を自動で行う


移動先が編集範囲外のデータは消去
移動が発生しなかった場合は移動失敗
移動指定時に、フォーカスが範囲外に出るケースは、失敗とする
このルーチン内で計算値を得てxUI.putメソッドに送る（undoバッファの更新はxUI.putが行う）

移動メソッドのケースは、UNDOデータの構造が以下のように拡張される
[書換基点,(ダミーの選択範囲),書換データ,[復帰用のフォーカス,選択範囲]]
UNDOデータが第４要素を保つ場合のみ、そのデータをもとにカーソル位置の復帰が行われる
*/
xUI.move    =function(dest,dup){
    if(xUI.viewOnly) return xUI.headerFlash('#ff8080');//入力禁止
    if(typeof dest =="undefined")     return false    ;//移動指定なし
    if((dest[0]==0) && (dest[1]==0))  return false    ;//指定は存在するが移動はなし
    if(typeof dup =="undefined")      dup = false     ;//複製指定なし

    var bkPos   = this.Select.slice()    ;//現在のフォーカス位置を控える
    var bkRange = this.Selection.slice() ;//現在のセレクト範囲
    
    var myRange   = this.actionRange()     ;//移動対象範囲
    var destRange = [add(myRange[0],dest),add(myRange[1],dest)];//移動先範囲

    var fkPos     =  add(bkPos,dest)       ;//移動終了後のフォーカス
    if ((fkPos[0]<0)||(fkPos[1]<0)||(fkPos[0]>this.XPS.xpsTracks.length)||(fkPos[1]>this.XPS.xpsTracks[0].length)) return false ;
//いずれもシート外にフォーカスが出るので禁止  これを排除するので変更範囲は処理可能となる
    var sourceValue = xUI.XPS.getRange(myRange);
    var ipts = [];
    if(! dup){
//選択範囲の空ストリームを作成
        ipts.push(new xUI.InputUnit(
            bkPos,
            sourceValue.replace(/[^,\n]/g,''),
            {target:xUI.activeDocument.content}
        ));
    }
    ipts.push(new xUI.InputUnit(fkPos,sourceValue,{target:xUI.activeDocument.content}));
console.log(ipts);
    xUI.inputFlag = "move";
    return xUI.put(ipts);

//変更範囲を算出(この計算では範囲外の値が出るが、フォーカスがシートを外れないのでこのまま)
    var left  =(dest[0]<0)? dest[0]+myRange[0][0]:myRange[0][0];
    var top   =(dest[1]<0)? dest[1]+myRange[0][1]:myRange[0][1];
    var right =(dest[0]>0)? myRange[1][0]+dest[0]:myRange[1][0];
    var bottom=(dest[1]>0)? myRange[1][1]+dest[1]:myRange[1][1];

//移動範囲を取得して配列に
    var moveBlockData = xUI.getRange();
        moveBlockData = moveBlockData.split("\n");
    for( var i=0;i<moveBlockData.length;i++) moveBlockData[i] = moveBlockData[i].split(",");
//変更範囲内のデータをオブジェクトメソッドで取得(範囲外は空要素で戻る)
    var bulk = this.XPS.getRange([[left,top],[right,bottom]]);
        bulk = bulk.split("\n");
    for(var i=0;i<bulk.length;i++) bulk[i] = bulk[i].split(",");
//変更配列の内容を入れ替え
    var leftOffset = (dest[0]>=0)?
        [bulk.length-moveBlockData.length,0]:[0,bulk.length-moveBlockData.length];
    var topOffset =(dest[1]>=0)?
        [bulk[0].length-moveBlockData[0].length,0]:[0,bulk[0].length-moveBlockData[0].length];
    for(var c=left;c<=right;c++){
        var cidx=c-left;
        for(var f=top;f<=bottom;f++){
            var fidx=f-top;
            if(! dup){
                if((fidx>=topOffset[1])&&(fidx<(topOffset[1]+moveBlockData[0].length))){
                    if((cidx>=leftOffset[1])&&(cidx<(leftOffset[1]+moveBlockData.length))){
                        bulk[cidx][fidx]="";
                    }
                }
            }
            if((fidx>=topOffset[0])&&(fidx<(topOffset[0]+moveBlockData[0].length))){
                if((cidx>=leftOffset[0])&&(cidx<(leftOffset[0]+moveBlockData.length))){
                    bulk[cidx][fidx]=moveBlockData[cidx-leftOffset[0]][fidx-topOffset[0]];
                }
            }
        }
    }
//
        for(var ix=0;ix<bulk.length;ix++) bulk[ix] = bulk[ix].join(",");
        bulk = bulk.join("\n");
    fkPos = add(fkPos,[0,1]);
//組み上げたデータをxUI.putメソッドにわたす
    putResult = this.put([
        new xUI.InputUnit(
            [left,top],
            bulk,
            {
                target:xUI.activeDocument.content,
                selection:[fkPos,add(fkPos,dest)]
            }
            )
    ]);
    return putResult;
}

/**
 *    やり直し
 *    @params {Number}  undoOffset
 *        操作を遡るundo回数 undoポインタを超えることはできない  省略時は 1
 */
xUI.undo = function(undoOffset){
    if(this.activeDocument.undoBuffer.undoPt==0) {
//UNDOバッファが空なので失敗
if(config.dbg) {dbgPut("UNDOバッファが空")};
        return;
    };
    if(typeof undoOffset == 'undefined') undoOffset = 1;
    this.activeDocument.undoBuffer.skipCt=(undoOffset-1);
    while(undoOffset > 0){
if(config.dbg) {
    dbgPut(
        "undoPt:"+
        this.activeDocument.undoBuffer.undoPt+
        ":\n"+
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt].address
    )
};
        this.inputFlag = "undo";
        var putResult  = this.put();
        if((putResult)&&(config.dbg)) dbgPut("putResult:\n"+putResult);
        undoOffset --;
  }
};

/*    やり直しのやり直し    
 *    @params {Number}  redoOffset
 *        再操作回数 可能回数を超えることはできない  省略時は 1
 */
xUI.redo    =function(redoOffset){
    if(
        (this.activeDocument.undoBuffer.undoPt+1)>=this.activeDocument.undoBuffer.undoStack.length
    ){
//REDOバッファが空
if(config.dbg){dbgPut("REDOバッファが空")};
        return;
    };
    if(typeof redoOffset == 'undefined') redoOffset = 1;
    while(redoOffset>0){
if(config.dbg) {
    dbgPut(
        "undoPt:"+
        this.activeDocument.undoBuffer.undoPt+
        "\n:"+
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt].address
    )
};
        this.inputFlag = "redo";
        var putResult = this.put();
if((putResult)&&(config.dbg)) dbgPut("putResult:\n"+putResult);
        redoOffset --;
    }
};

/**
 *    @params {String} tabText
 *    @params {Object|String} note
 *    ヤンクバッファに選択範囲の方向と値を格納
 *    引数としてタブ区切りテキストが与えられた場合は、行列置換してヤンクバッファの値を更新する
 *    ノート画像拡張、NoteImageキャッシュへの参照を格納する
 *
 *  xUIのヤンクバッファを利用したコピー・ペースト・ムーブ・デュプリケート等の編集操作は、
 *  Xps.timelineTrack
 *  xMap.elementStore
 *  pman.reName.items
 *      が対象となる
 *  それ以外のデータはシステムクリップボードを利用するので注意
 *
 *  引数としてタブ区切りテキストが与えられた場合は、行列置換してヤンクバッファの値を更新する
 *  @params {String}    tabText
 */
xUI.yank=function(tabText,note){
    if(arguments.length){
//レコード / フィールド 分離
        tabText = (typeof tabText == 'string')? String(tabText):'';
        var dataArray = tabText.split('\n');
        var fieldCount = 0;
        for (var r=0;r<dataArray.length;r++){
            dataArray[r]=dataArray[r].split('\t');
            if(dataArray[r].length >= fieldCount) fieldCount=dataArray[r].length;
        };
        var myBody=[];
        for (var f = 0; f < fieldCount;f++){
            var frameData=[];
            for (var r=0;r<dataArray.length;r++){
                frameData.push((dataArray[r][f])?dataArray[r][f]:"");
            };
            myBody.push(frameData.join(','));
        };
        if(xUI.activeDocument.content instanceof Xps){
            this.yankBuf.direction = [fieldCount-1,dataArray.length-1];
            this.yankBuf.body = myBody.join('\n');
            if(note){
                if(note instanceof nas.NoteImage){
                    this.yankBuf.noteimage = note;
                }else if(typeof note =='string'){
                    if(note.indexOf('cell:')==0){
                        this.yankBuf.noteimage = xUI.XPS.noteImages.getByLinkAddress(note);
                    }else{
                        this.yankBuf.noteimage = xUI.XPS.noteImages.members.find(function(e){
                            return ((e.id == note)||(e.link == note))
                        });
                    };
                };
            };
        }else if(xUI.activeDocument.content instanceof xMap){
            //テキスト表現からのコンバートをここへ
        }else if(xUI.activeDocument.content === pman.reName){
            //パスのみを
        };
    }else{
        if(xUI.activeDocument.content instanceof Xps){
            this.yankBuf.direction=xUI.Selection.slice();
            this.yankBuf.body=this.getRange();
        }else if(xUI.activeDocument.content instanceof xMap){
            //アセットエレメントのオブジェクト内容を後ほどコーディング
        }else if(xUI.activeDocument.content === pman.reName){
            this.yankBuf.direction=[pman.numOrderUp];
// direction は選択ベクトルを表す. reNameに対してはpman.numOrderUpの値が設定される
            this.yankBuf.body=Array.from(pman.reName.getSelected());
        };
    };
};

/**    xUI.actionRange(limit)
 *    @params {Array}  limit
 *        制限配列 [columns,frames]
 *
 *    @returns    {Array}
 *        レンジ配列
 *        [[TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]]
 *
 *    現在のUI上の操作範囲の抽出
 *     引数は、制限範囲を絶対量で与える。通常は入力データサイズ
 *    省略可能  省略時は選択範囲と同一
 *    指定時は、UNDOバッファ消費を押さえるために制限範囲と選択範囲の重なる部分を返す
 *    [0,0]が指定された場合は、該当セルのみを返すので開始終了アドレスが同一
 *    戻値は絶対座標で[左上座標、右下座標]の形式
*/
xUI.actionRange    =function(limit){
    if (! limit) limit=this.Selection.slice();
//レイヤ操作範囲
    var TrackStartAddress    =(this.Selection[0]<0)? this.Selection[0] + this.Select[0]:this.Select[0];//左側の座標をとる
    var RangeWidth    =(Math.abs(limit[0])<Math.abs(this.Selection[0]))? Math.abs(limit[0]):Math.abs(this.Selection[0]);//引数と比較して小さいほう
    var TrackEndAddress    = TrackStartAddress+RangeWidth;
    if(TrackStartAddress<0) TrackStartAddress=0;//スタートアドレスが負数になったらクリップ（移動処理のため可能性がある）
    if (TrackEndAddress>this.SheetWidth) TrackEndAddress=this.SheetWidth;//トラック数以内にクリップ
//フレーム操作範囲
    var FrameStartAddress    =(this.Selection[1]<0)? this.Select[1] + this.Selection[1]: this.Select[1];
    var RangeHeight    =(Math.abs(limit[1])<Math.abs(this.Selection[1]))? Math.abs(limit[1]):Math.abs(this.Selection[1]);
//            引数と比較して小さいほう
    var FrameEndAddress    = FrameStartAddress+RangeHeight;
    if(FrameStartAddress<0) FrameStartAddress=0;//スタートアドレスに負数ならばクリップ
    if (FrameEndAddress>=this.XPS.duration()) FrameEndAddress=this.XPS.duration()-1;//継続時間内にクリップ
    return [[TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]];
};

/**
 *    @params {Array of Array} Range
 *    xUI.getRange(Range:[[startColumn,startFrame],[endColumn,endFrame]])
 *    指定範囲内のデータをストリームで返す
 *    指定がない場合は、現在の選択範囲
 *      UNDOデータ拾いだしのために作成されたが編集全般に便利
 *      ストリームで返す
 *
 *  ホットポイントの取得ルーチン
 *  focus  [C,F] : selection  [c,f]
 *  hotPoint    [(c>0)?C:C+c,(f>0)?F:F+f]
 *  dataRange   [Math.abs(c),Math.abs(f)]
 *        指定範囲 Range:[[startColumn,startFrame],[endColumn,endFrame]]
*/
xUI.getRange    =function(Range){
    if (! Range) Range=this.actionRange();//指定がなければ現在の操作範囲を設定
    return this.XPS.getRange(Range);
};
/*    xUI.putReference(datastream[,direction])
 *  @params {String|Object Xps|Array}  datastream
 *  @params {Array} direction
 *  @params {Function} callback
引数
    :datastream    シートに設定するデータ  単一の文字列  またはXpsオブジェクト または  配列  省略可
    :direction    データ開始位置ベクトル  配列  省略可  省略時は[0,0]
      参照シートに外部から値を流し込むメソッド
        xUI.putReference(データストリーム)
        読み込み時も使用
    xUI.put オブジェクトの機能サブセット
    undo/redo処理を行わない
    xUI.putのラッパ関数
*/
xUI.putReference    =function(datastream,direction){
    xUI.sheetPut(datastream,direction,true);
}
/**
 *  入力ユニットオブジェクト
 *  @params {Array|String}  address
 *  @params {String}        content
 *  @parmas {Object}        props
 *      additional property career {prop:value...}
 *      追加プロパティはプロパティを載せたオブジェクトを与えて初期化する
 *  eg.       Xps
    new xUI.InputUnit(
        [[1,0],[1,11]],
        "X,,,1,,,2,,,3,,",
        {
            target:xUI.documents[0],
            selection:[[1,12],[1,12]]
        }
    )
additional properties
        addrress  : {String :<入力開始位置> 省略不可}
        value     : {String :<入力値ストリーム> 省略不可}
        target    : {Object :<入力ターゲット>}
        backup    : {String :<入力先の書き換え前の値ストリーム>}**
        selection : {Array  :[[<入力範囲左上セル座標>],[<入力範囲右下セル座標>]]}*
        command   : {String :<コマンド文字列>}
                  : {:<>}
                  *     タイムライントラック入力時のみ
                  **    UNDOバッファで使用
 */
xUI.InputUnit = function(address,content,props){
    this.address      = address;
    this.value        = content;
    if((props)&&(Object.keys(props).length)){
        for (var prop in props) this[prop]=props[prop];
    };
}
/**
 *  ドキュメントデータの入力を行う UNDO処理つき
 *
 *    <pre>
 *    シートに外部から値を流し込むメソッド
 *      putされたデータはアドレスに従って適切なオブジェクトごとのputメソッド振り分け、
 *      返り値をつかってundo処理と画面の更新をこのメソッドが行う
 *      input引数はinputオブジェクトの配列で複数の入力を一括で処理する
 *      一括処理された入力は一回分のundoユニットとして同じく複数の逆入力操作を記録する
 *
 *    xUI.put(input,toReference)
 *      リファレンス領域のデータ読み込み（流し込み）の際はリファレンスフラグを立てる
 *      現在リファレンスの変更にはundo|redoが適用されない
 *
 *    undo処理は戻り値から書き換えに成功した範囲と書き換え前後のデータが取得できるのでその戻値を利用して処理を行う
 *      入力操作は必ずしも成功するとは限らない
 *      書き換え後の値は入力値と一致する保証はない
 *      入力値、書き換え前の値、書き換え後の値 が混同されないよう注意
 *
 *    このメソッド内では、選択範囲方向の評価を行わないためフォーカス／セレクションは事前・事後に調整を要する場合がある
 *      選択範囲によるクリップはオブジェクトメソッドに渡す前に行う必要あり
 *    
 *    グラフィックレイヤー拡張によりシート上の画像パーツを更新する操作を追加
 *    Xps更新後に、xUI.syncSheetCell()メソッドで必要範囲を更新
 *
 *    グラフィック描画queueを設置してキューに操作を追加してから更新メソッドをコールする形に変更する
 *    更新メソッドはキューを処理して不用な描画をスキップするようにする（未実装20170330）
 *
 *    マクロ展開後には同様に必要範囲内のフットマーク再表示を行う
 *    
 *    参照エリアに対する描画高速化のために、このメソッドでリファレンスの書換をサポートする
 *    引数に変更がなければ従来動作  フラグが立っていればリファレンスを書換
 *    リファレンス操作時はundo/redoは働かない
 *
 *    再描画抑制undoカウンタを設置
 *    カウンタの残値がある限り再描画をスキップしてカウンタを減算する
 *  @params {Arrray of xUI.InputUnit}    input
 *      汎用入出力オブジェクト
 *  @params {Boolean}   toReference
 *      リファレンス入力フラグ リファレンス操作時はundo|redoは働かない
 *  @params {Boolean}   undoStack
 *      入力操作を行わず、undoStackの更新のみを行う
 *      あらかじめ入力操作を別に行いこのフラグを立ててbackupデータ付きのInputUnitを与える
 *      このフラグがない場合は、xUI.putがundoStackに格納するデータを作る
 *  @params {Function}    callback
 *      コールバック関数 主にリセット時に使用
 *      処理終了時に実行
 *  @returns {Object} 入力開始アドレス、終了アドレス

 *    </pre>
 */
xUI.put = function(input,toReference,undoStack,callback){
console.log([input,toReference,undoStack,callback]);
    if((xUI.viewOnly)&&(! toReference)) return xUI.headerFlash('#ff8080');//入力規制時の処理
//undo|redoのための事前処理 リファレンス入力時はUNDO操作対象外
//    if(! toReference){
//UNDO準備・操作記録配列初期化
        var output = [];
//xUI.inputFlagを参照して 予備処理
        if((this.inputFlag == 'redo')||(this.inputFlag == 'undo')){
            if(this.inputFlag == 'redo') this.activeDocument.undoBuffer.undoPt++;
//スタック内のundo|redo処理データを取得してinputを上書きする(undo|redoはカラ入力で実行される 入力引数は無視される)
            input = this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt].slice();
//undo時は逆順処理のため入力反転
            if(this.inputFlag == 'undo') input.reverse();
        };
//    };
//undo|redoのための事前処理//
//undoStackの処理のみを行う inputは配列である必要がある
    if(undoStack){
console.log(input);
/*
    入力が配列で、要素が存在、第一要素にターゲットがあり、バックアップデータを持つ
    実処理は事前に終了のため、復帰用のバッファを更新（追加）
    UI同期を行い処理終了
*/
        if((input instanceof Array)&&(input.length)&&(input[0].target)&&(input[0].backup)){
            this.activeDocument.undoBuffer.undoPt++;
            this.undoGc = 0;
            this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt] = input;
console.log(this.activeDocument.undoBuffer);
        };
// undoバッファの状態を表示
        xUI.sync("undo");xUI.sync("redo");
//callbackがあれば処理
        if(callback instanceof Function) callback();
        return;
    };
//カーソル配置をバックアップ(Select|SelectionはXpstに対してのみ有効 他のドキュメントでは使用されない点に注意)
    var selectBackup =[this.Select.concat(),this.Selection.concat()];
//入力を配列に正規化
    if(! (input instanceof Array)) input = [input];
    if((input.length)&&(! input[0] instanceof xUI.InputUnit)) return false;//入力引数をxUI.InputUnitのみに制限
//---------------------------------------------//入力事前処理
    if(xUI.activeDocumentId > 0){
//---------------------------------------------//ID:1以降は無条件でタイムシート入力・事前処理
//選択範囲のハイライトを払う
        this.selectionHi("clear");
//編集範囲を記録する一時変数
        if(toReference){
            var TrackStartAddress = xUI.referenceXPS.xpsTracks.length;
            var FrameStartAddress = xUI.referenceXPS.xpsTracks.duration;
        }else{
            var TrackStartAddress = xUI.XPS.xpsTracks.length;
            var FrameStartAddress = xUI.XPS.xpsTracks.duration;
        }
        var TrackEndAddress = 0 ;var FrameEndAddress = 0;
//---------------------------------------------タイムシート入力事前処理//
    }else if(xUI.documents[0].content instanceof xMap){
//---------------------------------------------//XMAP(アセットストア)入力事前処理
        //ここに記述
//---------------------------------------------XMAP(アセットストア)入力事前処理//
    }else if((pman.reName)&&(xUI.activeDocument.content === pman.reName)){
//---------------------------------------------//リネーム操作UI(アセットストアサブセット)入力事前処理
//操作前に 画面更新を一旦停止
        pman.reName.pending = true;
//---------------------------------------------リネーム操作UI(アセットストアサブセット)入力事前処理//
    };
//---------------------------------------------入力事前処理//
console.log(input);
//---------------------------------------------//データ入力操作
    var ipt;var putResult;var addressStore = [];
    for(var ix = 0; ix < input.length ; ix ++){
//入力逐次処理
        ipt = input[ix];
//操作対象オブジェクト確定 xMap|Xpst|pman.reName
        if(!(ipt.target)) ipt.target = xUI.documents[xUI.activeDocumentId].content;
        if(ipt.target instanceof xUI.Document) ipt.target = ipt.target.content;

        if((toReference)&&(ipt.target instanceof Xps)){
            if(ipt.target !== xUI.referenceXPS) ipt.target = xUI.referenceXPS;//参照設定
        };
//case Xpst
        if(ipt.target instanceof Xps){
//アドレスによる入力対象オブジェクトの振り分けはnas.Pm.valuePutが自動で行うので不要
//入力対象がxpsTracksに振り分けられるケースのみ現在の選択状態が影響するのでその事前処理が必要(戻値に処理成功領域が含まれる)
//undo 処理時のみバックアップと入力を入れ替え
            putResult = (xUI.inputFlag == 'undo')?
                ipt.target.put(ipt.address,ipt.backup):ipt.target.put(ipt.address,ipt.value);
            if(putResult){
console.log(putResult);
//                if(!(toReference)){
//リザルトの形式{Array}    [{Array|String:address},{String:書き換え後の値},{String:書き換え前の値},{Array:書き換え範囲}]
                    var current = output[output.push(
                        new xUI.InputUnit(
                            putResult[0],
                            putResult[1],
                            {
                                target:ipt.target,
                                backup:putResult[2]
                            }
                        )
                    )-1];
                if(putResult[3]){
//ターゲットがリファレンスを含むXpsタイムラインテーブルであった場合編集範囲を記録して累積する
                    current.selection = putResult[3];
                    if(TrackStartAddress > putResult[3][0][0]) TrackStartAddress = putResult[3][0][0];
                    if(FrameStartAddress > putResult[3][0][1]) FrameStartAddress = putResult[3][0][1];
                    if(TrackEndAddress   < putResult[3][1][0]) TrackEndAddress   = putResult[3][1][0];
                    if(FrameEndAddress   < putResult[3][1][1]) FrameEndAddress   = putResult[3][1][1];
//タイムライントラックが対象であった場合表示を同期
                    xUI.syncSheetCell(putResult[3][0],putResult[3][1],toReference);
                }else{
                    if(input.selection) current.selection = input.selection;
                };
//                };
//表示を同期
//                xUI.syncSheetCell(putResult[3][0],putResult[3][1],toReference);
//入力成功時にアドレスを保存する
                addressStore.add(ipt.address);
            }else{
//入力操作エラーケース
console.log('error');console.log(ipt);
            };
//条件的に必要なケースでは追加プロパティを乗せる？
        }else if(ipt.target instanceof xMap){
//case xMAP
console.log('xMAP :');
console.log(ipt);
        
        }else if((pman.reName)&&(ipt.target === pman.reName)){
//case pamn.reName
console.log('pman.reName :');console.log(ipt);
/*
            var cmd = (xUI.inputFlag != 'undo')?
                ipt.command:
                ({append:'remove',remove:'append',order:'order',name:'name'})[ipt.command];
console.log(cmd);//*/
            putResult = ipt.target.itemPut(ipt,(xUI.inputFlag == 'undo'));

/*            {
                address  : ipt.address,
                selection: ipt.sellection,
                focus    : ipt.focus,
                selected : ipt.selected,
                value    : (xUI.inputFlag != 'undo')? ipt.value:ipt.backup,
                command  : cmd
            };// */
            if(putResult){
//リザルトの形式{Array}    [{Array|String:address},{Array:書き換え後の値},{Array:書き換え前の値},{Array:書き換え範囲}]
                var current = output[output.push(
                    new xUI.InputUnit(
                        putResult[0],
                        putResult[1],
                        {
                            command:ipt.command,
                            target:ipt.target,
                            backup:putResult[2],
                            selection:putResult[3]
                        }
                    )
                )-1];
//入力成功時にアドレスを保存する
                addressStore.add(ipt.address);
            }else{
//入力操作エラーケース
console.log('error');console.log(putResult);console.log(ipt);
            }
        };//
    };//----input loop//
//---------------------------------------------データ入力操作//
console.log([xUI.activeDocumentId,putResult]);
  if(ipt.target instanceof Xps){
//---------------------------------------------//Xpstフォーカス再配置
    if((xUI.activeDocumentId > 0)&&(putResult[3])){
//Xpst.xpsTracks
        switch (this.inputFlag){
        case "undo" :
        case "move" :
        case "paste":
//入力開始セルに移動
console.log('movehead  : '+putResult[3][0].join('_'))
            this.selectCell(putResult[3][0]);
        break;
        case "redo" :;//副列と単列で切り分け
            if(putResult[3][1][0]==putResult[3][0][0]){
                this.selectCell([TrackEndAddress,FrameEndAddress+1]);//単列(次入力セル)
            }else{
                this.selectCell(putResult[3][0]);//副列(入力開始セル)
            };
        break;
        case "cut":
        case "copy":
        case "normal":
        default:
//標準位置入力最終セル
            this.selectCell([TrackStartAddress,FrameEndAddress]);
        }
    };
//---------------------------------------------Xpstフォーカス再配置//
//操作別に終了処理
    if(! toReference){
        switch (this.inputFlag){
        case "redo":
        case "undo":
            if(this.inputFlag=="undo") this.activeDocument.undoBuffer.undoPt--;
        break;//undo|redoはスタックの更新を行なわない
//move|pasteの場合のみ最終入力の選択状態を作成する
        case "move":    ;//moveは実質上cut+pasteに相当する
        case "paste":   ;//
                if((putResult.length == 4)&&(! toReference)){
                    xUI.selection(putResult[3][1]);
                }
        case "cut":     ;//通常のデータ入力に準ずる
//一行入力の際のみ処理後のスピン操作で次の入力位置へ移動できるポジションへ
//( = マクロ展開時に画面処理を行う) putResultは最終入力のリザルトに置き換え
        case "nomal":   ;//通常のデータ入力
        default:       ;//カット・コピー・ペースト操作の際はカーソル移動無し
            this.activeDocument.undoBuffer.undoPt++;
            this.undoGc=0;
            this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt]=output;
        };
        this.inputFlag="nomal";
//addressStoreを走査して画面を更新
        for(var a = 0;a <addressStore.length; a ++){
            if(addressStore[a] instanceof Array) continue;//assetStore|xpsTracksは処理済み(としておく)
            var address = addressStore[a].split(".").reverse();//アドレス分解/反転
            if(addressStore[a].indexOf("pmu") == 0){
            }else{
/*              "xpsTarcks.noteText":
                ""://*/
            };
        };// ------------- addressStoreを走査して画面を更新//
//編集バッファをクリア・編集フラグを下げる(バッファ変数をモジュールスコープに変更したので副作用発生)
        if(this.edchg) this.edChg(false);
        if(this.eXMode==1){this.eXMode=0;this.eXCode=0;};//予備モード解除
    };//リファレンス入力時は特に処理なし
  }else if(ipt.target instanceof xMap){
      
  }else if((pman)&&(ipt.target === pman.reName)){
        switch (this.inputFlag){
        case "redo":
        case "undo":
            if(this.inputFlag=="undo") this.activeDocument.undoBuffer.undoPt--;
        break;//undo|redoはスタックの更新を行なわない
        case "paste":   ;//
        case "cut":     ;//通常のデータremoveに準ずる
        case "nomal":   ;//通常のデータ入力 name|move|remove|append
        default:       ;//カット・コピー・ペースト操作の際はカーソル移動無し
            this.activeDocument.undoBuffer.undoPt++;
            this.undoGc=0;
            this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt]=output;
        };
        this.inputFlag="nomal";
  };
// undoバッファの状態を表示
        xUI.sync("undo");xUI.sync("redo");
//callbackがあれば処理
        if(callback instanceof Function) callback();
// 処理終了のリザルトを返す(デバッグ用)
return putResult;
//処理終了時に記述等の同期を行う場合は、リターンの前に処理を行う
//終了処理
}
/*TEST
    xUI.put(new xUI.InputUnit([1,12],"1,2,3,4,5,6",{target:xUI.XPS}));
    xUI.syncSheetCell();

    xUI.put(new xUI.InputUnit(
        [-1,[1,2,3],
        ["ABC","DEF","GHI"],
        {command:"name",selection:[1,2,3],focus:-1}
    ));

*/
/**    タイムシート入力前段処理
 *    シート選択状態で入力値をクリップ・正規化してxUI.InputUnitの配列へ変換する
 *    調整済みの入力値をxUI.putメソッドへわたす 開始アドレス、選択範囲などの調整はこちらで済ませる 
 *  @params {String|Array|Object Xps|Object xMap}  datastream
 *     シートに設定するデータ シートデータ文字列 または シートデータ配列 またはXpsオブジェクト 省略可<br />
 *  @params {Array} direction
 *     データ入力ベクトル  配列  省略可  省略時は[0,0]
 *  @params {Boolean} toReference
 *    ターゲットオブジェクト切り替えフラグ
 *  @params {Function} callback
 *    コールバック関数 主にリセット時に使用
 *  @returns {Array} 入力開始アドレス、終了アドレス
 *      [[TrackStartAddress,FrameStartAddress],lastAddress];
 */
xUI.sheetPut = function(datastream,direction,toReference,callback){
console.log(arguments);

    if(! toReference) toReference = false;
    var targetXps= (toReference)? xUI.referenceXPS:xUI.XPS;
  
//  var selectBackup = [this.Select.concat(),this.Selection.concat()];//カーソル配置をバックアップ>>勘案しない

    if(typeof datastream == "undefined") datastream="";
    if(typeof direction  == "undefined") direction=[0,0];
/*
    datastream の形式

やりとりするデータの基本形式は、コンマ区切り文字列
フレーム方向のストリームで、改行で次のレイヤに移動
制御トークン等は無し  データのみ
    '1,,,2,,\n1,,,,,\n"x",,,,,\n'

Xpsオブジェクトの際は、シートトラック全体を入れ替える
以前のコードでは構造変更や大規模な変更をまとめる際はこの方法を推奨されいてたが
今時のコードではシートトラックのみを差し替えるので注意


全体構造の変更時及びタイムライントラック以外の各プロパティは、新規のputメソッドで指定
xUI.put([new xUI.InputUnit("*",<String:tartgetXpsSource>)]);//全体を更新
xUI.put([new xUI.InputUnit(<String:プロパティ名>,<String:propertySource>)]);//プロパティを更新

2020.06.02  修正

undoスタックに格納する値は {Object xUI.InputUnit}
初期化は
    new xUI.InputUnit(
        <data-address>,
        <data-content>,
        {Object additional-property}
 *    )
 *  eg.       
 *    new nas.InputUnit(
 *        [[1,0],[1,11]],
 *        "X,,,1,,,2,,,3,,",
 *        {
 *            target:xUI.documents[0],
 *            selection:[[1,12],[0,0]]
 *        }
 *    )
 */
/*    入力データを判定    */
    if(datastream instanceof Array){
/*    引数が配列の場合は、Xps のプロパティを編集する（旧形式）
古い形式の場合ここで新形式にコンバートされる
可能な限りこのメソッドを通さずに新形式へ移行のこと（UNDOの回数が減る）

形式:    [kEyword,vAlue]
    キーワード列とプロパティの対応リストは以下を参照
    キーワードは基本的にプロパティ文字列  "parent""stage"等
    タイムラインコレクションの個別プロパティは  "id.1.xpsTracks"等の"."接続した倒置アドレスで指定
//        Xps標準のプロパティ設定
    parent      ;//親Xps参照用プロパティ  初期値はnull（参照無し）編集可
    stage       ;//初期化の際に設定する  編集不可
    mapfile     ;//初期化の際に設定する  編集不可
    opus        ;//編集対象
    title       ;//編集対象
    subtitle    ;//編集対象
    scene       ;//編集対象
    cut         ;//編集対象
    trin        ;//編集対象(ドキュメント構成変更)
    trout       ;//編集対象(ドキュメント構成変更)
    rate        ;//編集対象(ドキュメント構成変更)
    framerate   ;//編集対象(ドキュメント構成変更)
    create_time ;//システムハンドリング  編集不可
    create_user ;//システムハンドリング  編集不可
    update_time ;//システムハンドリング  編集不可
    update_user ;//システムハンドリング  編集不可

    xpsTracks   ;タイムラインコレクション  構成変更のケースと内容変更の両ケースあり
                ;コレクションのエントリ数が変更になる場合は全て構成変更  それ以外は内容編集

xpsTimelineTrackオブジェクトのプロパティ
    noteText    ;//編集対象
    
    id      ;//識別用タイムラインラベル  編集対象
    tag;//トラック補助情報 編集対象
    sizeX   ;//デフォルト幅 point    編集対象（編集価値低）
    sizeY   ;//デフォルト高 point    編集対象（編集価値低）
    aspect  ;//デフォルトのpixelAspect  編集対象（編集価値低）
    lot     ;//map接続データ  編集禁止（編集価値低）
    blmtd   ;//セレクター利用  
    blpos   ;//セレクター利用  
    option  ;//セレクター利用 トラック種別変更時はセクションキャッシュをクリア
    link    ;//セレクター利用  
    parent  ;//セレクター利用  


*/
        var myTarget= datastream[0].split(".");
        var myValue = datastream[1];
//新形式アドレスへ変換
        this.put([new xUI.InputUnit(
            myTarget.reverse().join('.'),
            myValue,
            {
                target:targetXps
            }
        )],toReference,false,callback);
    }else if(datastream instanceof Xps){
// Xpsならばシートの入れ替えを行うためデータストリームを取得
//(現在の選択範囲を見るか？-見ない リセットする)
        datastream = datastream.getRange();
        this.put([new xUI.InputUnit(
            [0,0],
            datastream,
            {
                target:targetXps
            }
        )],toReference,false,callback);
    }else{
//データストリームを配列に変換
        var srcData=String(datastream).split("\n");
        for (var n=0;n<srcData.length;n++){
            srcData[n]=srcData[n].split(",");
        }
//配列に変換したソースからデータのサイズと方向を出す。
        var sdWidth    =Math.abs(srcData.length-1);
        var sdHeight   =Math.abs(srcData[0].length-1);
//データ処理範囲調整
        if (this.Selection.join() != "0,0"){
//セレクションあり(操作範囲を取得)
            var actionRange=this.actionRange([sdWidth,sdHeight]);
//カレントセレクションの左上端から現在の配列にデータを流し込む。
            var TrackStartAddress=actionRange[0][0];//    左端
            var FrameStartAddress=actionRange[0][1];//    上端
//セレクションとソースのデータ幅の小さいほうをとる
            var TrackEndAddress=actionRange[1][0];//    右端
            var FrameEndAddress=actionRange[1][1];//    下端
        } else {
//セレクション無し(開放操作)
            var TrackStartAddress= this.Select[0];//    左端
            var FrameStartAddress= this.Select[1];//    上端
//シート第2象限とソースデータの幅 の小さいほうをとる
            var TrackEndAddress=((xUI.SheetWidth-this.Select[0])<sdWidth)?
            (this.SheetWidth-1):(TrackStartAddress+sdWidth)    ;//    右端
            var FrameEndAddress=((targetXps.duration()-this.Select[1])<sdHeight)?
            (targetXps.duration()-1):(FrameStartAddress+sdHeight)    ;//    下端
        };
//バックアップは遅延処理・入力クリップをここで行う
        var Tracklimit=TrackEndAddress-TrackStartAddress+1;
        var Framelimit=FrameEndAddress-FrameStartAddress+1;
        if(srcData.length>Tracklimit){srcData.length=Tracklimit};
        if(srcData[0].length>Framelimit){for (var ix=0;ix<srcData.length;ix++){srcData[ix].length=Framelimit}};

//入力値をオブジェクトメソッドで設定 callbackはそのままxUI.putへ渡す
        return this.put([new xUI.InputUnit(
            [TrackStartAddress,FrameStartAddress],
            srcData.join("\n"),
            {
                target:targetXps,
                selection:[
                    [TrackStartAddress,FrameStartAddress],
                    [TrackEndAddress,FrameEndAddress]
                ]
            }
        )],toReference,false,callback);
    };
};//xUI.sheetPut */

/**
 *  @paramas {Array}   startAddress
 *  @paramas {Array}   endAddress
 *  @paramas {Boolean} isReference
 *
 *   指定されたレンジのシートセルの内容を更新
 *   指定がない場合は、シート全て
 *   アドレス一致の場合は、一コマのみ
 */
xUI.syncSheetCell = function(startAddress,endAddress,isReference){
    if(this.activeDocument.type != 'xpst') return;//NOP
    if(this.activeDocument.undoBuffer.skipCt > 0) {this.activeDocument.undoBuffer.skipCt --;return;};//?
    var targetXps = (isReference)? this.referenceXPS:this.XPS;
    if((! startAddress)||(! endAddress)){
        startAddress=[0,0];
        endAddress  =[targetXps.xpsTracks.length-1,targetXps.xpsTracks.duration-1];
    };
    var TrackStartAddress =startAddress[0];
    var TrackEndAddress   =  endAddress[0];
    var FrameStartAddress =startAddress[1];
    var FrameEndAddress   =  endAddress[1];
//設定値に従って、表示を更新（別メソッドにしたい）
    for (var r=TrackStartAddress;r<=TrackEndAddress;r++){
        for (var f=FrameStartAddress;f<=FrameEndAddress;f++){
            if((r>=0)&&(r<targetXps.xpsTracks.length)&&(f>=0)&&(f<targetXps.xpsTracks.duration)){

//シートデータを判別してGraphicシンボル置き換えを判定（単純置き換え）
//        配置データが未設定ならば<br>に置き換え
                var sheetCell=(isReference)? document.getElementById(["r",r,f].join("_")):document.getElementById([r,f].join("_"));
                if(sheetCell instanceof HTMLTableCellElement){
                    if(document.getElementById(sheetCell.id)){xUI.Cgl.remove(sheetCell.id);}
                    this.drawSheetCell(sheetCell);//関数内でシートセルを書き換える（同期処理）
//                var td=(targetXps.xpsTracks[r][f]=='')? "<br>" : this.trTd(targetXps.xpsTracks[r][f]) ;
//        シートテーブルは必要があれば書き換え
//                if (sheetCell.innerHTML!= td){ if(config.dbg) console.log(sheetCell.innerHTML);sheetCell.innerHTML=td;}
                };
//本体シート処理の際のみフットスタンプ更新
                var targetElement=document.getElementById(r+"_"+f);
                if((targetElement)&&(! isReference)){
//変更されたデータならフットスタンプ処理
                    if (this.diff[r,f]){
                        lastAddress=[r,f] ;        //最終入力操作アドレス控え
                        var footstamp =(this.footMark)? 
                        this.footstampColor:this.sheetbaseColor;//踏むぞー
                        this.Select=([r,f]);
//各ブラウザで試験して判定文字列を変更(未処置)
                        if (targetElement.style.backgroundColor!=footstamp)
                        targetElement.style.backgroundColor=footstamp; //セレクト位置を踏む！
                    }else{
//否変更なので、背景色がフットスタンプならフットスタンプを消す。
//各ブラウザで試験して判定文字列を変更(未処置)
                        if (targetElement.style.backgroundColor!=this.sheetbaseColor && this.footMark)
                        targetElement.style.backgroundColor=this.sheetbaseColor; //踏み消す
                    };
                };
            };
        };
    };
    setTimeout(function(){xUI.Cgl.refresh([startAddress,endAddress],isReference)},0);//非同期処理
}
//syncSheetCell シートセルの表示を編集内容に同期させる  
/**
    リファレンス領域と編集領域のデータが異なっているか否かを返す関数
    標準で[トラックid,フレーム]を配列で、又は ID文字列"trc_frm"
    それ以外はXPSのプロパティ名
    (id)とみなす オブジェクト渡しは禁止
    指定IDの比較データが存在しない場合は、常にfalseを返す
*/
xUI.diff = function(target){
    if(String(target).match(/^\d+_\d+$/)){target = target.split('_');}
    if(target instanceof Array){
         if (
            (typeof this.XPS.xpsTracks[target[0]]                       == 'undefined')||
            (typeof this.referenceXPS.xpsTracks[target[0]]              == 'undefined')||
            (typeof this.XPS.xpsTracks[target[0]][target[1]]            == 'undefined')||
            (typeof this.referenceXPS.xpsTracks[target[0]][target[1]]   == 'undefined')
        ) return false;
        return (this.XPS.xpsTracks[target[0]][target[1]] != this.referenceXPS.xpsTracks[target[0]][target[1]]);
    }else{
        return (this.XPS[target] != this.referenceXPS[target]);
    }
}
/**
 *  シートセル入力バックアップ
 *      キー入力等で編集前のセル内容のバッファを送受するメソッド
 *  @params {Array} Datas
 *       セルの内容データ 省略時は現在の値を戻す。
 *  @returns {String} バックアップ内容 または 受領フラグ
 *
 */
xUI.bkup    =function(Datas){
    if ((! Datas)||(Datas.length==0)){
        return this.cellBackup[0];
    }else{
        this.cellBackup=Datas;return true;
    };
};
/*
UI関数群
    これも、xUIのメソッドに

*/
/*=====================================*/

/**
 *   メッセージをアプリケーションステータスに出力する|writeLn
 *   引数なしでクリア
 *   アプリケーションステータスが無いばあいはコンソール出力
 *  @params {String}    msg
 *      メッセージ本体
 *  @params {String}    prompt
 *      プロンプトサイン|keyword "append"
 */
xUI.printStatus    =function(msg,prompt){
//    if(typeof msg == 'undefined') return;
    if(! msg) msg = "";
    if(! prompt) prompt = "";
    if(prompt == 'append'){
        var bodyText = document.getElementById("app_status").innerText + msg +'\n';
    }else{
        var bodyText = prompt + msg +'\n';
    }
    if(document.getElementById("app_status")){
        if(document.getElementById("app_status").innerText != bodyText)
            document.getElementById("app_status").innerText = bodyText;
    }else{
        console.log(bodyText);
    };
}
/**    キーダウンハンドラ
    @params {Object Event}  e
IEがプレスだとカーソルが拾えないようなのでキーダウン
iNputbOx以外の入力もこのメソッドで受ける
フォーカスがiNputbOx以外にある場合は、トラップする特定キー以外はNOPで戻す
*/
xUI.keyDown = function(e){
console.log('down :'+e.keyCode)
//モーダルバリヤ参照 書式エディタ処理
    if((document.getElementById('nas_modalDialog'))&&($('#nas_modalDialog').isVisible())) return true;
    if((documentFormat.active)||(xUI.onCanvasedit)) return;
//stopwatch|player処理
//タイマー処理中は有効キー検知で入力キャンセル
if((xUI.player)&&(xUI.player.keyboard)){
    if(e.keyCode == 32) {
//[Space] 計測停止中は計測開始 計測中は ストップ|マーク|ラップ
        if(xUI.player.status != 'run'){
                xUI.player.start();
        } else {
            if(xUI.player.markSwap){
                xUI.player.getCount=true;
            }else{
                xUI.player.stop();
            }
        }
        return false;
    } else if(e.keyCode == 13){
//[Enert] 計測中は 停止|マーク|ラップ 停止中はリセット
        if(xUI.player.status!='stop'){
            if(xUI.player.runMode > 0){
                if(xUI.player.markSwap){
                    xUI.player.stop()
                }else{
                    xUI.player.getCount=true
                }
            }else{
                xUI.player.lap();
            }
            return false;
        }else{
            if(xUI.player.runMode > 0){
                if(xUI.player.countStack.length){xUI.player.clearMark();return false;}
            }else{
                xUI.player.reset(); return false;
            }
        }
    } else if (e.keyCode == 77) {
//[M]
        if(xUI.player.status=='run'){
            xUI.player.getCount=true;
        }else{
            xUI.player.start('mark');
        }
        return false;
    }else if((e.keyCode == 35)||(e.keyCode == 36)){
//[End]|[Home]
        if(xUI.player.status=='run') return false;
    }
}else if((typeof pman == 'object')&&(pman.reName)&&(pman.reName.selection.length > 1)){
    if(e.keyCode == 32) {
        pman.reName.flipStart();
        return false;
    };
};
//iNputbOx以外のテキスト入力中はキー入力をスキップ
console.log("focusItem");
console.log(e.target instanceof HTMLInputElement);
    if((e.target instanceof HTMLInputElement)&&(e.target !== document.getElementById('iNputbOx'))) return true;
//ブラウザ全体のキーダウンを検出
    var key = e.keyCode;//キーコードを取得
//入力中以外のショートカット処理
    switch(key) {
case    66 :        ;    //[ctrl]+[B]/ パネルセット切り替え
    if(xUI.app == 'pman_reName') return true;
    if ((e.ctrlKey)||(e.metaKey))    {
        this.setToolView();
        return false;}else{return true}
    break;
case    68 :        ;    //[ctrl]+[D]/ 選択解除｜スクロール・ページ表示モード切り替え
    if(xUI.app == 'pman_reName'){
    if ((e.ctrlKey)||(e.metaKey))    {
        pman.reName.selectAll(false);
        return false;}else{return true}
    }else{
        if ((e.ctrlKey)||(e.metaKey))    {
            xUI.viewMode=(xUI.viewMode=="Scroll")?"PageImage":"Scroll";
            xUI.resetSheet();
        return false;}else{return true};
    };
    break;
case    79 :        ;    //[ctrl]+[O]/ Open Document
    if(((appHost.platform != 'Electron'))&&((e.ctrlKey)||(e.metaKey))) {
         if(e.shiftKey){
            this.openDocument("localFile");
        }else{
            this.openDocument();
        }
        return false;
    }
    return true;
    break;
case    80 :        ;    //[ctrl]+[P]/ Open PrintPage
    if ((e.ctrlKey)||(e.metaKey)) {
         if(e.shiftKey){
            printHTML("png");// [shift]+[ctrl]+[P]
        }else{
            printHTML("print");
        }
        return false;
    }
    return true;
    break;
case    83 :    ;    //[ctrl]+[S]/ Save or Store document
    if(xUI.app == 'pman_reName'){ return true};
    if ((e.ctrlKey)||(e.metaKey)) {
         if(e.shiftKey){
            this.storeDocument("as");
        }else{
            this.storeDocument();
        }
        return false;
    }
        return true;
    break;
    }
//フォーカスエレメントがiNputbOx以外なら入力を戻す
if(document.getElementById("iNputbOx")){
    if(document.activeElement!==document.getElementById("iNputbOx")){
        if(((key==79)||(key==83))&&((e.ctrlKey)||(e.metaKey))){
        console.log("capt")
            return false;
        }else{
            return true;
        };
    };
    this.eddt = document.getElementById("iNputbOx").value;
    var currentTrack = xUI.XPS.xpsTracks[xUI.Select[0]];
    var exch = ((e.ctrlKey)||(e.metaKey))? true:false;
    var interpKey=110;
};
//      console.log(key+':down:');
    switch(key) {
case    25    :if(appHost.platform != 'Safari') break;
case    9    :    //tab
if(xUI.activeDocument.content instanceof Xps){
if (! this.tabSpin) {
    if(!this.edchg) return;
    var expdList = (xUI.ipMode)?
        nas_expdList(nas.normalizeStr(xUI.eddt)):nas_expdList(xUI.eddt);
    this.sheetPut(iptFilter(expdList,currentTrack,xUI.ipMode,exch));
//    this.sheetPut(this.eddt);
    return false;break;
}
};
case    13    :        //Enter 標準/次スピン・シフト/前スピン・コントロール/interpSpin
if(xUI.activeDocument.content instanceof Xps){
    if(xUI.edmode>=2){
// 区間編集中
        if(e.shiftKey){
            if((e.ctrlKey)||(e.metaKey)){
                if(xUI.edmode==3) this.sectionUpdate();
                this.mdChg('normal');                           //[ctrl]+[shift]+[ENTER]:モード解除
            }else{
                this.mdChg('float');                        //[shift]+[ENTER]:float遷移
            };
        }else if((e.ctrlKey)||(e.metaKey)){
            if(xUI.edmode==3) this.sectionUpdate();                           //[ctrl]+[ENTER]:確定のみ
        }else{
            if(xUI.edmode==3) this.sectionUpdate();
            this.mdChg((xUI.edmode==3)?'section':'normal'); //[ENTER]:確定してモード遷移
        };
        return false;//スピン動作キャンセルのためここでリターン
    }else{
        if((e.shiftKey)&&((e.ctrlKey)||(e.metaKey))){
            xUI.mdChg('section');                   //[ctrl]+[shift]+[ENTER]:カーソル位置でモード遷移
            return false;//スピン動作キャンセルのためここでリターン
        };
        if(this.ipMode >= 2){
            if((e.ctrlKey)||(e.metaKey)){
                interpSign('=');return false;//[ctrl|meta]+[ENTER]:中間値サイン
            }else if(e.altKey){
                interpSign('-');return false;//[alt]+[ENTER]:中間値サイン
            };
        };
/*   
     if(e.shiftKey){
        }else{
            interpSign();                           //[shift]+[ENTER]:中間値サイン
        }
    }
*/    
    if (this.edchg){
//入力ボックスに入力中
        var expdList = (xUI.ipMode)?
            nas_expdList(nas.normalizeStr(xUI.eddt)):nas_expdList(xUI.eddt);
        this.sheetPut(iptFilter(
            expdList.split(','),
            currentTrack,
            xUI.ipMode,
            exch
        ));//更新
        this.selectCell(add(this.Select,[0,1]));//入力あり
    }else{
        if(e.shiftKey){
            if(expd_repFlag){
                this.spin("up");expd_repFlag=false;     //<マクロ展開中>[shift]+[ENTER]:スピンアップ
            }else{
                this.spin("back");                      //[shift]+[ENTER]:スピンバック
            }
        }else{
            if(expd_repFlag){
                this.spin("down");expd_repFlag=false;   //<マクロ展開中>[ENTER]:スピンダウン
            }else{
                if((xUI.Selection[0]==0)&&(xUI.Selection[1]>0)){
                    this.selectCell([xUI.Select[0],xUI.Select[1]+xUI.Selection[1]+1]);
//選択範囲有りのカラ[ENTER] 自動的にカラ移動
                }else{
                    this.spin("fwd");                       //[ENTER]:スピンフォワード
                };
            };
        };
//処理終了時にコントロール（メタ）キーの同時押しがない場合は選択範囲を解除
        if((! e.ctrlKey)&&(! e.metaKey)){
            if(this.getid("Selection")!="0_0"){this.selection();this.spinHi();};//選択範囲解除
        };
    };
  };
  return false;
};
    break;
case    27    :    //esc 選択範囲解除
if(xUI.activeDocument.content instanceof Xps){
//ラピッドモード解除
    if(xUI.eXMode){
        return xUI.rapidMode.command.exit();
    }
//        編集中
    if (this.edchg){return false;}//バックアップ復帰のためスキップ(実処理はUP)
//      区間操作中
    if(this.edmode == 3 ){
//        this.selection(add(this.Select,this.selection));
        this.selectCell(this.floatSourceAddress);
        this.mdChg('section');
       break;
    } else if(this.edmode == 2 ){
        if((e.ctrlKey)||(e.metaKey)){
            this.undo(this.floatUpdateCount);//まとめて開始点までUNDO
            this.mdChg('normal');
            this.selectCell();//編集を解除してバックアップ状態へ復帰
            this.selection(add(this.selectBackup,this.selectionBackup));
        }else{
            this.mdChg('normal');
            this.selection();
        }
        break;
    }
//        複数セレクト状態 
    if(this.getid("Selection")!="0_0")
        {this.selection();this.spinHi();break;};//選択範囲解除
        return false;break;//標準処理(NOP)
};
break;
//case 32    :        //space 値を確定してフォーカスアウト
//    this.edchg=false;
//    this.focusCell();    break;
case    38    :        //カーソル上・下
case    40    :        //
if(xUI.activeDocument.content instanceof Xps){
/*
    通常編集時
        [shift]+[↑]/[↓] セレクションの調整
        [ctrl]+[shift]+[↑]/[↓]  セレクションの調整にスピン量の調整も兼ねる
    区間編集時
        [↑]/[↓] 全体移動に遷移
        [ctrl] +[↑]/[↓] 先頭移動に遷移
        [shift]+[↑]/[↓] 末尾移動に遷移
        [ctrl]+[shift]+[↑]/[↓]  現在の編集を確定して選択している区間を前後の区間に変更？
    区間フロート時
        [↑]/[↓] モードに従って移動
 */
            var kOffset=(key==38)? -1:1;
//    if ( this.edmode == 3){            this.sectionPreview(this.Select[1]+kOffset);}else
    if ( this.edmode == 3){
        if (    e.shiftKey &&
            this.Select[1]+this.Selection[1]>=0 &&
            this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
        ){
            this.sectionManipulateOffset=['tail',0];
//            this.sectionPreview((this.Select[1]+this.Selection[1]+kOffset));
//            if((e.ctrlKey)||(e.metaKey)) ;
        }else if(((e.ctrlKey)||(e.metaKey)) &&
            this.Select[1]+this.Selection[1]>=0 &&
            this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
        ){
            this.sectionManipulateOffset=['head',0];
        }else{
        //通常移動処理
            this.sectionManipulateOffset=['body',0];
        };        
            this.sectionPreview(this.Select[1]+kOffset);
    }else if(this.edmode == 2){
        if (    e.shiftKey &&
            this.Select[1]+this.Selection[1]>=0 &&
            this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
        ){
            this.sectionManipulateOffset=['tail',0];
        }else if(((e.ctrlKey)||(e.metaKey)) &&
            this.Select[1]+this.Selection[1]>=0 &&
            this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
        ){
            this.sectionManipulateOffset=['head',0];
        }else{
        //通常移動処理
        };
        this.mdChg('float');
    }else{
        if (    e.shiftKey &&
            this.Select[1]+this.Selection[1]>=0 &&
            this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
        ){
            var kOffset=(key==38)? -1:1;
            this.selection(this.Select[0]+"_"+
            (this.Select[1]+this.Selection[1]+kOffset));
            if((e.ctrlKey)||(e.metaKey)||(this.spinSelect)) this.spin("update");
        }else{
        //通常入力処理
            if((! e.ctrlKey)&&(! e.metaKey)){
                if(this.getid("Selection")!="0_0"){
                    this.selection();this.spinHi();
                };//選択範囲解除
            }
            if (this.edchg){
                var expdList = (xUI.ipMode)?
                    nas_expdList(nas.normalizeStr(xUI.eddt)):nas_expdList(xUI.eddt);
                this.sheetPut(iptFilter(expdList,currentTrack,xUI.ipMode,exch));//更新
            };
//console.log(key);
//console.log(this.Select);
                if(key==38){this.spin("up")}else{this.spin("down")};
        };
    };
    return false;
}else if(xUI.app == 'pman_reName'){
    var offset = (39 - key);// -1 || 1
    pman.reName.select(((offset < 0)?'next':'prev'),((e.ctrlKey)||(e.metaKey)),(e.shiftKey));
    return false;
};
    return true;
    break;
case    39    :        //右[→]
case    37    :        //左[←]
if(xUI.activeDocument.content instanceof Xps){
    if ((this.edmode < 2)&&((! this.edchg)||(this.viewOnly))) {
        if(key==37) {this.spin("left")} else {this.spin("right")};
        return false;
    }else{
        return true;
    };
}else if(xUI.app == 'pman_reName'){
    var offset = (38 - key);// -1 || 1
    if(pman.numOrderUp) offset = offset * -1
    pman.reName.select(((offset < 0)?'next':'prev'),((e.ctrlKey)||(e.metaKey)),(e.shiftKey));
    return false;
};
    break;
case     33:        //ページアップ
if(xUI.activeDocument.content instanceof Xps){
    if (this.edchg) this.sheetPut(iptFilter(this.eddt,currentTrack,xUI.ipMode,exch));//更新
    this.spin("pgup");return false;
};
    break;
case     34:        //ページダウン
if(xUI.activeDocument.content instanceof Xps){
    if (this.edchg) this.sheetPut(iptFilter(this.eddt,currentTrack,xUI.ipMode,exch));//更新
    this.spin("pgdn");return false;
};
    break;
case    35 :;//[END]
if(xUI.activeDocument.content instanceof Xps){
    this.selectCell(this.Select[0]+"_"+this.XPS.duration());
};
    break;
case    36 :;//[HOME]
if(xUI.activeDocument.content instanceof Xps){
    this.selectCell(this.Select[0]+"_0");
};
    break;
case    65 :        ;    //[ctrl]+[A]/selectAll
if(xUI.activeDocument.content instanceof Xps){
     if ((e.ctrlKey)||(e.metaKey))    {
        this.selectCell(this.Select[0]+"_0");
        this.selection(
            this.Select[0]+"_"+this.XPS.duration()
        );
        return false;}else{return true}
}else if(xUI.app == 'pman_reName'){
     if ((e.ctrlKey)||(e.metaKey))    {
        pman.reName.selectAll(true);
        return false;}else{return true}
};
    break;
case    67 :        ;    //[ctrl]+[C]/copy
    if ((e.ctrlKey)||(e.metaKey))    {
        this.yank();
        return true;}else{return true}
    break;
case    69 :        ;    //[ctrl]+[E]/export AE Key
if(xUI.activeDocument.content instanceof Xps){
    if ((e.ctrlKey)||(e.metaKey))    {
        console.log('writeAEKey');
        writeAEKey();
        return true;}else{return true}
};
    break;
case    73 :        ;    //[ctrl]+[I]/information 
if(xUI.activeDocument.content instanceof Xps){
    if ((e.ctrlKey)||(e.metaKey))    {
//        config.myScenePref.open("edit");
        return false;}else{return true}
};
    break;
case    86 :        ;    //[ctrl]+[V]/paste
    if ((e.ctrlKey)||(e.metaKey))    {
//        this.paste();
        return true;
        return false;}else{return true}
    break;
case    88 :        ;    //[ctrl]+[X]/cut
    if ((e.ctrlKey)||(e.metaKey))    {
        this.cut();
        return true;}else{return true}
    break;
case    89 :        ;    //[ctrl]+[Y]/redo
    if ((e.ctrlKey)||(e.metaKey))    {
        this.redo();
        return false;}else{return true}
    break;
case    90 :        ;    //[ctrl]+[Z]/undo
    if ((e.ctrlKey)||(e.metaKey))    {
        if(e.shiftKey){
            this.redo();
        }else{
            this.undo();
        }
        return false;}else{return true}
    break;
//case    61 :        ;
//case    107 :        ;
//case    108 :        ;
//case    109 :        ;
case 187:  ;//[+] plus keydown
case 189:  ;//[-] plus keydown
    if(xUI.app == 'pman_reName'){
        if((e.ctrlKey)||(e.metaKey)){
            let sizeOffset = 188 - e.keyCode;
            let size = (pman.reName.preview + sizeOffset);
            if(size > 8){size = 8;} else if(size < 1){size = 1;}
            if(size != pman.reName.preview) pman.reName.changeView('',size);
            return false;
        }else{
            return true;
        };
    };
    break;

//case    221 :        ;    //[+]/plus
//    alert("PLUS :"+key);
//return dialogSpin("incr");
//return true;
//    break;
//case    108 :        ;
//case    109 :        ;
case    interpKey :        ;//[.]/dot-Tenkey これは問題あるキーの交換が出来ない
if(xUI.activeDocument.content instanceof Xps){
    if(! this.edchg) {
        interpSign();return false;
    }else{
        return true;
    }
};
break;
//case    219 :        ;    //[-]/minus
//    alert("MINUS :"+key);
//return dialogSpin("decr");
//return true;
//    break;
/* 保留
case 8    :    this.spin("bs");    break;    //bs NOP
case 46    :    this.spin("del");    break;    //del 
case  :    window.status="[]";    break;    //
*/
default :    return true;
    }
return true;
}
/*
if(false){    if(this.Mouse.action){return false};//マウス動作優先中
//フォーカスされたテーブル上の入力ボックスのキーダウンを検出
//window.status = e.keyCode+'/'+String.fromCharCode(e.keyCode)
//    alert(e.KeyCode)
    var key = e.keyCode;//キーコードを取得
    this.eddt = document.getElementById("iNputbOx").value;
alert(this.eddt);
//    var eddt = document.getElementById("iNputbOx").value;
    switch(key) {
case    25    :if(appHost.platform != 'Safari') break;
case    9    :    ;//tab
if(! this.tabSpin){
    if(!this.edchg) return;
    this.sheetPut(this.eddt);
    return false;break;
};
case    13    :    ;//Enter 標準/次スピン・シフト/前スピン
alert("xUI.keyDown=ENTER");
    if (this.edchg){this.sheetPut(this.eddt);}//更新
    if(e.shiftKey) {this.spin("back")}else{this.spin("fwd")};
//    if(! e.ctrlKey){}
    if(! e.metaKey){
        if (this.Selection.join() != "0,0"){this.selection();this.spinHi();};//選択範囲解除
    };
    return false;
    break;
case    27    :    ;//esc
    if (this.edchg){this.sheetPut(this.eddt);}//更新
    if (this.Selection.join() != "0,0"){this.selection();this.spinHi();break;};
        //選択範囲解除
    break;
case    32    :    ;//space 値を確定してフォーカスアウト
    if (this.edchg){this.sheetPut(this.eddt);}//更新
//    this.focusCell();
    break;
case    38    :    ;//カーソル上・下
case    40    :    ;//シフト時はセレクション(+スピン)の調整
     if (    e.shiftKey &&
        this.Select[1]+this.Selection[1]>=0 &&
        this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
    )
    {    var kOffset=(key==38)? -1:1;
        this.selection(this.Select[0]+"_"+
        (this.Select[1]+this.Selection[1]+kOffset));
        this.spin("update");
    }else if(    e.ctrlKey){
        //選択範囲を維持したまま移動
    }else{
//        this.selection();this.spinHi();
if (this.Selection.join() != "0,0"){this.selection();this.spinHi();alert(123)};
    //あれば選択範囲クリアして
        if (this.edchg){this.sheetPut(this.eddt);}//更新
        if(key==38){this.spin("up")}else{this.spin("down")};
    }    ;return false;    break;
case    39    :        ;//右
    if (this.edchg){this.sheetPut(this.eddt);}//更新
    if (! this.edchg) {this.spin("right")    ;return false;
    }else{
    return true;
    };    break;
case    37    :        ;//左?
    if (this.edchg){this.sheetPut(this.eddt);}//更新
     if (! this.edchg) {this.spin("left")    ;return false;
    }else{
    return true;
    };    break;
case    33:        ;//ページアップ
    if (this.edchg){this.sheetPut(this.eddt);}//更新
    this.spin("pgup");    break;
case    34:    ;//ページダウン
    if (this.edchg){this.sheetPut(this.eddt);}//更新
    this.spin("pgdn");    break;
case    35 :;//[END]
    xUI.selectCell(xUI.Select[0]+"_"+this.XPS.duration());
//    xUI.selectCell(xUI.Select[0]+"_"+this.XPS.duration(),"end");
    break;
case    36 :;//[HOME]
//    xUI.selectCell(xUI.Select[0]+"_0","home");
    xUI.selectCell(xUI.Select[0]+"_0");
    break;
case    65 :        ;    //[ctrl]+[A]/selectAll
     if (e.ctrlKey)    {
    if (this.edchg){this.sheetPut(this.eddt);}//更新
        this.selectCell(this.Select[0]+"_0");//selall
        this.selection(this.Select[0]+"_"+this.XPS.duration());
        return false;}else{return true};
    break;
//case    :;//    break;
case    67 :        ;    //[ctrl]+[C]/copy
    if (e.ctrlKey)    {
    if (this.edchg){this.sheetPut(this.eddt);}//更新
        this.yank();
        return false;}else{return true};
    break;
case    79 :        ;    //[ctrl]+[O]/ Open Document
    if ((e.ctrlKey)&&(! e.shiftKey))    {
        this.openDocument();
        return false;}else{return true}
    break;
case    83 :    alert("SSS");    //[ctrl]+[S]/ Save or Store document
    if (e.ctrlKey) {
         if(e.shiftKey){this.storeDocument("as");}else{this.storeDocument();}
        return false;
    }else{
        return true
    }
    break;
case    86 :        ;    //[ctrl]+[V]/paste
    if (e.ctrlKey)    {
    if (this.edchg){this.sheetPut(this.eddt);}//更新
        this.paste();
        return false;}else{return true};
    break;
case    88 :        ;    //[ctrl]+[X]/cut
    if (e.ctrlKey)    {
    if (this.edchg){this.sheetPut(this.eddt);}//更新
        this.cut();
        return false;}else{return true};
    break;
case    89 :        ;    //[ctrl]+[Y]/redo
    if (e.ctrlKey)    {
    if (this.edchg){this.sheetPut(this.eddt);}//更新
        this.redo();
        return false;}else{return true};
    break;
case    90 :        ;    //[ctrl]+[Z]/undo
    if (e.ctrlKey)    {
    if (this.edchg){this.sheetPut(this.eddt);}//更新
        this.undo();
        return false;}else{return true};
    break;
*/
/* 保留
case     :        ;    //[ctrl]+[]/
case    8    :    this.spin("bs");    break;    //bs NOP
case    46    :    this.spin("del");    break;    //del 
case  :    window.status="[]";    break;    //
*/
/*
default :    return true;
    };
return false;
//return true;
};
*/
/**
//    フォーカスされたテーブル上の入力ボックスのキープレスを検出して
//    動作コントロールのために戻り値を調整

        フロートモード判定
    フロート（ブロック移動/セクション編集）モードでは、キー動作の入力が制限される。
    最初にモード内動作を判定して処理
    モードを抜けるまでは他の機能に移行できない
    モードイン判定はノーマル入力モードアウト判定はこのルーチン内
-------------------------------------------------ブロック移動：
[↑][↓][→][←][h][j][k][l][8][2][4][6]    移動
[enter][5]            確定>モードアウト
[esc][0]            モードアウト
-------------------------------------------------セクション編集：
[↑]/[↓]             区間移動
[ctrl] +[↑]/[↓]     前端点移動
[shift]+[↑]/[↓]     後端点移動
[enter][5]          確定>モードアウト
[esc][0]            モードアウト

*/
xUI.keyPress = function(e){
    var key = e.keyCode;//キーコードを取得
      console.log(key+':press:');
//      console.log(xUI.edmode+':xUI.edmode:');
    if(this.ipMode <= 0){
//iNputbOxでかつ原画モード時はショートカット入力
        if(((key==160)||(key==8211))&&((e.altKey)||(e.ctrlKey)||(e.metaKey))){
            interpSign();
            return false;
        };
    };
    if((key==8776)&&(e.altKey)){
//ブランクを入力[alt]+[X]
        xUI.put(nas_expdList('X'));xUI.spin("down");return false;
    };
    if(xUI.edmode>0){
if(xUI.edmode==1){
//ブロック移動モード
}else{
//セクション編集モード
}
      return true;
    }
/*
    ラピッドモード!=0 分岐処理
    ラピッドキーモードでは、マウスの入力は受け入れない
    0:解除
    1:スタンバイ（導入キーが一度押しされた状態）
    2:ラピッドモード
    
 */
if((key < 48)||(key > 57)){
  if(xUI.eXMode){
//ラピッドモード前駆状態フラグONなのでラピッドモード判定
    if(xUI.eXMode==1 && document.getElementById("iNputbOx").value.length==1){
//    入力が前キーと同一ならばモードアクティブ
        if(xUI.eXCode==key && document.getElementById("iNputbOx").value.charCodeAt(0)==key){
            xUI.eXMode++;//モード遷移
            var eddt="";
            xUI.eddt="";
            xUI.selectedColor=xUI.inputModeColor.EXTEND;
            xUI.spinAreaColor=xUI.inputModeColor.EXTENDspin;
            xUI.spinAreaColorSelect=xUI.inputModeColor.EXTENDselection;
            xUI.spinHi();
        }else{
            xUI.eXMode=0;xUI.eXCode=0;return true;//遷移失敗 このセッションでは入れない
        };
    }
//モード変更直後でも1回はラピッド動作する
    if(xUI.eXMode>=2){
        if(xUI.eXMode==2){
//    モード遷移直後なので、現在の入力コントロールとバッファをクリアしてモードを確定する
            xUI.eXMode++;
            if(xUI.eddt==xUI.bkup())xUI.edChg(false);
            syncInput(xUI.bkup());
        };
    for (var idx=0;idx<(xUI.rapidMode.length-1)/2;idx++){if(key==xUI.rapidMode[idx*2].charCodeAt(0))break;};
        if(idx<(xUI.rapidMode.length-1)/2){
            xUI.doRapid([xUI.rapidMode[idx*2+1]]);
            return false;
        }else{
            if (key!=13 && key!=8 && key!=9){
        //モード解除
                if(xUI.eXMode){
        return xUI.rapidMode.command.exit();
                }
            }
        }
    }
}else{
//        通常状態なので予備モード遷移判定
    for (var idx=0;idx<(xUI.rapidMode.length-1)/2;idx++)
    {
//        if(key==xUI.rapidMode[idx*2].charCodeAt(0) && document.getElementById("iNputbOx").value.length==0)
        if(key==xUI.rapidMode[idx*2].charCodeAt(0) && xUI.edChg)
        {
//dbgPut("exMode-ready: "+ key);
            xUI.eXMode=1;xUI.eXCode=key;return true;//予備モードに入る
        }
    }
  }
}
//        通常判定
    switch(key) {
case    27    :             ;//esc
    return false;
case    25    :if(appHost.platform != 'Safari') break;
case    0    :if(appHost.platform == 'Mozilla'){return true;};//キーコード0を返すコントロールキー群
//  fierfox  が keypress で全てキーコード0:を返す状態になっている  2017.12
case    9    :            ;//またはTAB および ctr-I
//    return false;

if (! xUI.tabSpin) {
    if(!xUI.edchg) return true;
    return false;break;
}else{
    if (xUI.edchg)
    {return true} else {return false};break;
}
case    13    :            ;//Enter
        return false;break;
case    65    :            ;//a
case    67    :            ;//c
//case    79    :            ;//o
//case    83    :            ;//s
case    86    :            ;//v
case    88    :            ;//x
case    89    :            ;//y
case    90    :            ;//z
case    97    :            ;//A
case    99    :            ;//C
case    118    :            ;//V
case    120    :            ;//X
case    121    :            ;//Y
case    122    :            ;//Z
    if ((e.ctrlKey)||(e.metaKey))    {return false;}else{return true;};
        break;
//case        : ;    //
default :;
    return true;
    }
//return true;
}
//
//xUI.keyPress    = keyPress_ ;
/**
    キーアップをキャプチャ。UI制御に必要 今のところは使ってない?
*/
xUI.keyUp = function (e){
console.log('up :' + e.keyCode);
//    if(xUI.onCanvasedit) return false;
//書式エディタ処理
    if((documentFormat.active)) return;
    if((xUI.player)&&(xUI.player.keyboard)){
        if(xUI.player.markSwap){
            if((e.keyCode == 32)&&(xUI.player.status=='run')) xUI.player.getCount=false;
        }else{
            if((e.keyCode == 13)&&(xUI.player.status=='run')) xUI.player.getCount=false;
        }
        if (e.keyCode == 77) {
        if(xUI.player.status=='run') xUI.player.getCount=false;
        }
    }
    var key = e.keyCode;//キーコードを取得
/*    if(this.ipMode >= 2){
//原画モード時はショートカット入力 F-1 ,2 , 
//FunctionKey割当（TDTS互換）
        if(key==112){
            interpSign('○');return false;
        }else if(key==113){
            interpSign('●');return false;
        }else if(key==114){
            xUI.put(nas_expdList('X'));xUI.spin("down");return false;
        };
    };// */
//フォーカスエレメントがiNputbOx以外なら入力を戻す
    if(document.activeElement!==document.getElementById("iNputbOx")){
        if(((key==79)||(key==83))&&((e.ctrlKey)||(e.metaKey))){
        console.log("capt")
            return false;
        }else{
            return true;
        }
    }
    if((this.eXMode>=2)&&((key < 48)||(key > 57))){
        document.getElementById("iNputbOx").select();
        return false;
    };
if(false){
//        通常状態なので予備モード遷移判定
    for (var idx=0;idx<(xUI.rapidMode.length-1)/2;idx++)
    {
        
        if(key==xUI.rapidMode[idx*2].charCodeAt(0) && document.getElementById("iNputbOx").value.length==1)
        {
            this.eXMode=1;this.eXCode=key;break;//予備モードに入る
        }
    }
};
//    通常処理 入力コントロールとバックアップが食い違っているので編集中フラグON
    if(this.bkup()!=document.getElementById("iNputbOx").value){
if(config.dbg)document.getElementById("app_status").innerHTML=this.bkup()+" <> "+document.getElementById("iNputbOx").value;
    if(! this.edchg) this.edChg(true);//変更されていたらフラグ立て
    };
    switch(key) {
case  27:    ;    //esc

    if(this.edchg){this.edChg(false);}
//        document.getElementById("iNputbOx").value=this.bkup();
        syncInput(this.bkup());
        return false;
break;
case  112:    ;    //F-1
    if(this.ipMode >= 2) interpSign('○');return false;
break;
case  113:    ;    //F-2
    if(this.ipMode >= 2) interpSign('●');return false;
break;
case  114:    ;    //F-3
    xUI.put(nas_expdList('X'));xUI.spin("down");return false;
break;
case  9    :    ;    //tab はシステムで使うのでUPは注意
case  13:    ;    //Enter
case  32:    ;    //space
case  38:    ;    //上カーソル
case  40:    ;    //下
case  39:    ;    //右
case  37:    ;    //左
case  33:    ;    //ページアップ
case  34:    ;    //ページダウン
case  16:    ;    //シフト
case  17:    ;    //コントロール
case  18:    ;    //ALT
case  45:    ;    //ins
case  46:    ;    //del
case  144:    ;    //clear(NumLock)
//case  :    ;    //
    if(this.viewOnly) return false;
    if(
        (!(xUI.edchg))&&
        (!(xUI.canvasPaint.active))&&
        (!(documentFormat.active))
    ){
        document.getElementById("iNputbOx").select();
        document.getElementById("iNputbOx").focus();
    };
//    syncInput(document.getElementById("iNputbOx").value);
    return true;
//case  :    window.status="[]";    break;    //
case    65    :    ;//[a]
case    67    :    ;//[c]
//case    79    :    ;//[o]
//case    83    :    ;//[s]
case    86    :    ;//[v]
case    88    :    ;//[x]
case    89    :    ;//[y]
case    90    :    ;//[z]
    if ((e.ctrlKey)||(e.metaKey))    {
        return true;
    }
        break;
//case 110:;//.テンキー
//case 190:;//.>
//    if(!this.edchg) document.getElementById("iNputbOx").select();

//break;
//case 99 :    ;    //[C]copy    このあたりは横取り
//case 118 :    ;    //[V]paste
//case 120 :    ;    //[X]cut    しないほうが良い?
case 8    :    ;    //bs NOP
default :
//if(! this.edchg) this.edChg(true);
if(this.Select[0]>0){syncInput(document.getElementById("iNputbOx").value);};
    return true;
    }
return true;
}
//
//xUI.keyUp    =    keyUp_    ;
//
/**
 * コンテキストメニュー表示切り替え
 *  @params {Object Event}  e
コンテキストメニューの表示制限範囲を設定ファイルによる制御に切り替え
ウインドウごとアイテムごとの条件をproperty regionで設定する
システム定義 all-application
    onPulldownMenu  プルダウンメニューの上 NOP(表示時) コンテキストメニューは排除される
    onHeadbar       共通ヘッドメニュー上
    onIconpost      共通アイコンポスト上(表示時)
    onHeadline      ヘッドライン領域
    onDocumenttab   ドキュメント切り替えタブ上(表示時)
    withMimeType    ドキュメントリスト・プレビュー等ハンドリングするドキュメントタイプが得られる範囲でtrueになる

Xps remaping|xpsedit
    onReference
    onReferenceheader
    onTimeguide
    onTracklabel
    onTimelinetrack
    onTimelinetrackheader

xMap remaping|pman
    onReceipt
    onAssetbrowser
    onPreview

reName pman|
    onRenamelist
    onPreview

 */
// コンテキストメニュー範囲一覧
xUI.appContextMenu = {};
//common
xUI.appContextMenu.common = [
    'onPulldownMenu',
    'onHeadbar',
    'onIconpost',
    'onHeadline',
    'onDocumenttab',
    'withMimeType'
];
//xpst
xUI.appContextMenu.doc_xpst = [
	'onXpsTimeline',
		'onXpsSelect',
		'onXpsSelection',
			'onXpsDialog',
			'onXpsSound',
			'onXpsReplacement',
			'onXpsStill',
			'onXpsCamera',
			'onXpsStg',
			'onXpsSfx',
			'onXpsTracknote',
			'onXpsTc',
			'onXpsFramenote',
	'onXpsReference',
	'onTimeguide',

	'onReferenceheader',
	'onTracklabel',

	'onXpsPageHeader',
	'onXpsSignature',
	'onXpsNoteText'
];
//xMap
xUI.appContextMenu.doc_xmap = [
    'onReceipt',
    'onAssetbrowser',
    'onPreview'
];
//pmdb
xUI.appContextMenu.doc_pmdb = [
];
//pmdb
xUI.appContextMenu.doc_stbd = [
];
//app.pman_reName
xUI.appContextMenu.app_reName = [
    'onRenamelist',
    'onPreview'
];
/**
 *  @params {Event} e
 *  @returns {Boolean}
 *  イベントを受け取り、リジョンを判別して必要ならコンテキストメニューを開く
 *  メニューを開いた場合はイベントの伝播を停止
 *  古い呼び出し形式に対応するために、メニューを開かなかった場合は true 開いた場合は falseを戻り値で返す
 *  コンテキストメニュー内にヒストリリスト等の可変メニューの表示が含まれる場合がある
 */
xUI.flipContextMenu = function(e){
    if(
        (xUI.canvasPaint.active)||
        (document.getElementsByClassName('ui-widget-overlay').length > 0)
    ) return false;//ペイントアクティブ モーダルウインドウ使用時は抑制
//スマートフォン判定
    if((appHost.touchDevice)&&(!(appHost.tablet))){
        return false;//コンテキストメニューを一旦停止
    };
console.log(e.target);
console.log(e.type);
    if(
        (xUI.contextMenu.isVisible())&&(
        (e.type == 'mousedown')||(e.type == 'touchend')
        )
    ){
//クリックコマンドを実行
        if(e.target.onclick){
            e.target.onclick(e);
        }else{
            e.target.click(e);
        };
//メニューを隠す
        xUI.contextMenu.hide();
        return false;
    }else if(
        ((e.button == 2 )&&(e.type == 'mousedown'))||
        ((e.button == 0 )&&(e.type == 'mousedown')&&(e.originalEvent))||
        (e.type == 'touchstart')
    ){
        e.stopPropagation();e.preventDefault();
        var point ={x:0,y:0};
        if(e.type == 'touchstart'){
            point.x = e.originalEvent.touches[0].clientX;point.y = e.originalEvent.touches[0].clientY;
            //JQ.longtouch
        }else{
            point.x = e.clientX;point.y = e.clientY;
        };
/*
console.log(">>>============== context item :" + e.target.id);
if(!(e.target.id)) console.log(e);
console.log(e);
console.log(e.composedPath());
    if(
        ((e.composedPath().indexOf(xUI.contextMenu[0]) < 0))&&
        (xUI.contextMenu.isVisible())
//        &&((e.type == 'mousedown')||(e.type == 'touchend'))
    ){
console.log('menu close=====');
        xUI.contextMenu.hide();
        return;
    };
/*
    if((xUI.contextMenu.isVisible())&&(e.type == 'mousedown')){
//コンテキストメニュー表示状態+マウスダウン
//クリックされたコマンドを実行
//        if(e.target.onclick) e.target.onclick();
//メニューを隠す
//        xUI.contextMenu.hide();
        return false;
    }else ;// 
    if((e.button == 2 )&&(e.type == 'mousedown')){
//
//右クリック(open)
*/
//コンテキストメニューを開いたイベントを保持
        xUI.contextMenu.eventSourceElement = e.target;
//初期位置設定
        xUI.contextMenu.css('left',point.x-xUI.screenShift[0]);
        xUI.contextMenu.css('top' ,point.y-xUI.screenShift[1]);
//リジョン判定変数初期化
        for(var prp in xUI.contextMenuRegion){
            xUI.contextMenuRegion[prp] = false;
        };
console.log(xUI.contextMenuRegion);
/* 以下は、各アプリ別設定ファイルへ移動 
        xUI.contextMenuRegion.onHeadbar             = false;//(共)
        xUI.contextMenuRegion.onHeadline            = false;//(共)
        xUI.contextMenuRegion.onHistory             = false;//(共)
        xUI.contextMenuRegion.onPulldownMenu        = false;//(共)
        xUI.contextMenuRegion.onIbcSelector         = false;//(共)
        xUI.contextMenuRegion.onIconpost            = false;//(共)

        xUI.contextMenuRegion.onDocumenttab         = false;//(共)
        xUI.contextMenuRegion.withMimeType          = false;//(共)
//(xpst)
        xUI.contextMenuRegion.onReference           = false;//(xpst)
        xUI.contextMenuRegion.onReferenceheader     = false;//(xpst)
        xUI.contextMenuRegion.onTracklabel          = false;//(xpst)
        xUI.contextMenuRegion.onTimelinetrack       = false;//(xpst)
        xUI.contextMenuRegion.onTimeguide           = false;//(xpst)
        xUI.contextMenuRegion.onTimelinetrackheader = false;//(xpst)
        xUI.contextMenuRegion.onXpsSelection           = false;//(xpst)
        xUI.contextMenuRegion.onXpsSection             = false;//(xpst)
        onXpsNoteText
//xpsttrack
        xUI.contextMenuRegion.onDialog              = false;//(xpst)
        xUI.contextMenuRegion.onSound               = false;//(xpst)
        xUI.contextMenuRegion.onReplacement         = false;//(xpst)
        xUI.contextMenuRegion.onCmarawork           = false;//(xpst)
        xUI.contextMenuRegion.onStagework           = false;//(xpst)
        xUI.contextMenuRegion.onSfx                 = false;//(xpst)

        xUI.contextMenuRegion.onNotetext            = false;//(xpst)(uaf)
        xUI.contextMenuRegion.onSignature           = false;//(xpst)(uaf)
//(uaf)
        xUI.contextMenuRegion.onReceipt             = false;//(共)
        xUI.contextMenuRegion.onAssetbrowser        = false;//(uaf)
//(uat)=(pman)(pman_reName)
        xUI.contextMenuRegion.onRenamelist          = false;//
        xUI.contextMenuRegion.onNameButton          = false;//
        xUI.contextMenuRegion.onPreview             = false;//
        xUI.contextMenuRegion.onUIPanel             = false;//
*/
/*
onFooter
onHeadbar
onHeadline
onHistory
onIbcSelector

onPreview
onRenamelist

onXpsTimeline  入力タイムライン
    onXpsReplacement
    onXpsDialog
    onXpsSound
    onXpsCamerawork
    onXpsStgwork
    onXpsSfxwork

onXpsTracklabel

onXpsReference  リファレンスエリア

onXpsPageHeader
    onXpsSignature
    onXpsNoteText

;// */
        var outer = true;

//================リジョン判定
        var cPath = (e.originalEvent)?
            Array.from(e.originalEvent.composedPath(),(p)=> p.id ):
            Array.from(e.composedPath(),(p)=> p.id );
//アプリケーション共用
        if(e.target.id == 'ibCmenuSwitch'){
            xUI.contextMenuRegion.onIbcSelector = true; outer = false;
        }else if(point.y <= document.getElementById('fixedHeader').clientHeight){
//固定ヘッダー上
            outer = false;
            if(cPath.indexOf('pMenu') >= 0){
//            if(point.y <= $('#applicationHeadbar').offset().top){}
//  プルダウンメニュー上
                xUI.contextMenuRegion.onPulldownMenu = true; outer = true;
            }else if(cPath.indexOf('applicationHeadbar') >= 0){
//            }else if(point.y <= ($('#applicationHeadbar').offset().top + $('#applicationHeadbar').height())){}
//  アプリケーションヘッドバー上
                xUI.contextMenuRegion.onHeadbar      = true; outer = false;
                if(e.target.id.match(/^pman_history_/)){
//  ヒストリセレクタ上(All)
                    xUI.contextMenuRegion.onHistory  = true; outer = false;
                };
            }else if(cPath.indexOf('tabSelector-doc') >= 0){
//            }else if(e.target.id == 'tabSelector-doc'){}
//  タブセレクター上(UAF)
                xUI.contextMenuRegion.onDocumenttab  = true; outer = false;
            }else{
//  上記以外
                xUI.contextMenuRegion.onHeadline     = true; 
            }
        }else if(xUI.activeDocument){
console.log(xUI.activeDocument);
//有効なドキュメント処理中
            if(xUI.activeDocument.type == 'xpst'){
//Xpstドキュメント
                if(e.target.id.match(/^\d+_\d+$/)){
//timeline track
                    var cell = e.target.id.split('_') ;
                    outer = false;
                    if(xUI.Select.join('_') == e.target.id) xUI.contextMenuRegion.onXpsSelect = true;
                    if(
                        ((xUI.Selection[0] > 0)||(xUI.Selection[1] > 0))&&
                        ((cell[0] >= xUI.Select[0])&&(cell[0] <= xUI.Select[0] + xUI.Selection[0])&&
                         (cell[1] >= xUI.Select[1])&&(cell[1] <= xUI.Select[1] + xUI.Selection[1]))
                    ) xUI.contextMenuRegion.onXpsSelection = true;
                    xUI.contextMenuRegion.onXpsTimeline       = true;
                    switch(xUI.XPS.xpsTracks[xUI.Select[0]].option){
                    case "dialog"     :
                        xUI.contextMenuRegion.onXpsDialog = true;break;
                    case "sound"      :
                        xUI.contextMenuRegion.onXpsSound = true;break;
                    case "cell"       :
                    case "timing"     :
                    case "replacement":
                        xUI.contextMenuRegion.onXpsReplacement = true;break;
                    case "still"      :
                        xUI.contextMenuRegion.onXpsStill = true;break;
                    case "cam"        :
                    case "camera"     :
                        xUI.contextMenuRegion.onXpsCamera = true;break;
                    case "stagework"  :
                    case "stage"      :
                    case "geometry"   :
                        xUI.contextMenuRegion.onXpsStg = true;break;
                    case "sfx"        :
                    case "effect"     :
                    case "composite"  :
                        xUI.contextMenuRegion.onXpsSfx = true;break;
                    case "tracknote"  :
                        xUI.contextMenuRegion.onXpsTracknote = true;break;
                    case "timecode"   :
                        xUI.contextMenuRegion.onXpsTc = true;break;
                    case "comment"    :
                        xUI.contextMenuRegion.onXpsFramenote = true;break;
                    };
                }else if(e.target.id.match(/^r_\d+_\d+$/)){
//reference timeline track
                    outer = false;
                    xUI.contextMenuRegion.onXpsReference           = true;
                }else if(e.target.id.match(/^tc.+$/)){
//timecode track
                    outer = false;
                    xUI.contextMenuRegion.onTimeguide           = true;
                }else if(e.target.className.match(/^.+ref$/)){
//reference timeline track header
                    outer = false;
                    xUI.contextMenuRegion.onReferenceheader     = true;
                }else if(e.target.className.match(/^camArea|editArea|^framenotelabel|^dialoglabel/)){
//timeline track header
                    outer = false;
                    xUI.contextMenuRegion.onTimelinetrackheader = true;
                }else if(e.target.id.match(/^L\d+_\-?\d+_\d+$/)){
//timelline track label
                    outer = false;
                    xUI.contextMenuRegion.onTracklabel          = true;
                }else if(e.target.className.match(/pgHeader\-label/)){
//ページヘッダー
                    outer = false;
                    xUI.contextMenuRegion.onXpsPageHeader          = true;
                }else if(e.target.className.match(/sigArea/)){
//ページヘッダー 署名欄
                    outer = false;
                    xUI.contextMenuRegion.onXpsSignature          = true;
                }else if(e.target.className.match(/noteArea/)){
//ページヘッダー メモ欄
                    outer = false;
                    xUI.contextMenuRegion.onXpsNoteText          = true;
                };
            }else if(xUI.activeDocument.type == 'xmap'){
            }else if(xUI.activeDocument.type == 'stbd'){
            }else if(xUI.activeDocument.type == 'pmdb'){
            }else if(xUI.activeDocument.type == 'pman'){
            }else if(xUI.activeDocument.type == 'pman_reName'){
console.log('<<<<<<<< element id :' +  String(e.target.id));
                if(
                    (e.target.id.match( /_rename_item|fileRenamer|fileStrip|itemList/ ))
                ){
console.log('onRenamelist')
                    outer = false;
                    xUI.contextMenuRegion.onRenamelist  = true;
                    xUI.contextMenuRegion.withMimeType  = true;
                }else if(e.target.id.match( /imgPreview|previewWindow/ )){
console.log('onPreview')
                    outer = false;
                    xUI.contextMenuRegion.onPreview     = true;
                    xUI.contextMenuRegion.withMimeType  = true;
                }else if(e.target.id.match( /(pre|suf)fixStrip/ )){
console.log('onNameButton')
                    outer = false;
                    xUI.contextMenuRegion.onNameButton  = true;
                }else{
console.log('nomatch ?!!');
                };
            };
        };
//    outer = false;
console.log(xUI.contextMenuRegion);
//以下がアイテムごとの表示制御
/*
    'ul.cM'+<onXXXX> グループクラスに対して機械的にshow|hideを実施
*/
        var vis = 0;
//各クラスのアイテムを全処理
console.log(xUI.appContextMenu['doc_xpst']);
        ['common','doc_xpst','doc_xmap','doc_pmdb','doc_stbd','app_reName'].forEach(function(ex){
            if(xUI.appContextMenu[ex])
            xUI.appContextMenu[ex].forEach(function(elm){
                if(xUI.contextMenuRegion[elm]){
                    vis ++ ;
                    $('ul.cM'+elm).each(function(){$(this).show();});
                }else{
                    $('ul.cM'+elm).each(function(){$(this).hide();});
                };
            });
console.log(vis);
        });
//ヒストリクラスを処理
        if(xUI.contextMenuRegion.onHistory){
            vis ++ ;
            $('ul.cMonHistory').each(function(){$(this).show();});
        }else{
            $('ul.cMonHistory').each(function(){$(this).hide();});
        };
//アイコンポストクラスを処理
        if(xUI.contextMenuRegion.onIbcSelector){
            vis ++ ;
            $('ul.cMonIbcSelector').each(function(){$(this).show();});
        }else{
            $('ul.cMonIbcSelector').each(function(){$(this).hide();});
        };//*/
//特定処理
        if(xUI.contextMenuRegion.onHeadline){
//            $('ul.cMonHeadline').each(function(){$(this).show();});
            if($('#pMenu').isVisible()){
                $('.noDm').each(function(){$(this).hide();});
            }else{
                vis ++ ;
                $('.noDm').each(function(){$(this).show();});
            }
            if(
                ((xUI.app=='remaping')||((xUI.app=='xpsedit')))&&
                ($('#pmui').isVisible())
            ){
                $('.noPm').each(function(){$(this).hide();});
            }else{
                vis ++ ;
                $('.noPm').each(function(){$(this).show();});
            };
        };
        if(xUI.contextMenuRegion.onTracklabel){
            vis ++ ;
            $('.cMonTrackLabel').each(function(){$(this).show();});
        }else{
            $('.cMonTrackLabel').each(function(){$(this).hide();});    
        }
        if(xUI.contextMenuRegion.onTimelinetrack){
            if(appHost.touchDevice) return;
            vis ++;
//            $('.cMonTrack').each(function(){$(this).show();});
            switch(xUI.XPS.xpsTracks[xUI.Select[0]].option){
            case 'dialog':
                $('.onDialog').each(function(){$(this).show();});
                $('.onTiming').each(function(){$(this).hide();});
                $('.onCamera').each(function(){$(this).hide();});
            break;
            case 'timing':
                $('.onDialog').each(function(){$(this).hide();});
                $('.onTiming').each(function(){$(this).show();});
            $('.onCamera').each(function(){$(this).hide();});
            break;
            case 'camera':
                $('.onDialog').each(function(){$(this).hide();});
                $('.onTiming').each(function(){$(this).hide();});
                $('.onCamera').each(function(){$(this).show();});
            break;
            default:
            };
        };

/*
    if(xUI.contextMenuRegion.onTimelinetrackheader){
        $('.cMonTrackHeader').each(function(){$(this).show();});
    }else{
        $('.cMonTrackHeader').each(function(){$(this).hide();});    
    }
    if(xUI.contextMenuRegion.onReference){
        $('.cMonReference').each(function(){$(this).show();});
    }else{
        $('.cMonReference').each(function(){$(this).hide();});    
    }
    if(xUI.contextMenuRegion.onReferenceheader){
        $('.cMonReferenceHeader').each(function(){$(this).show();});
    }else{
        $('.cMonReferenceHeader').each(function(){$(this).hide();});    
    }
    if(outer){
        $('.cMouter').each(function(){$(this).show();});
    }else{
        $('.cMouter').each(function(){$(this).hide();});
    };// */ 
/*    
    if(xUI.edmode==0){
        $('.emode0').each(function(){$(this).show();});
    }else{
        $('.emode0').each(function(){$(this).hide();});
    }
    if(xUI.uiMode=='management'){
        $('.pmad').each(function(){$(this).show();});
    }else{
        $('.pmad').each(function(){$(this).hide();});
    }
*/

/*
xUI.contextMenu.html([
('#'+e.target.id+':'+e.target.className)+'<hr>',
'onHeadline           :'+onHeadline,
'onTimelineTrack      :'+onTimelineTrack,
'onReference         :'+onReference,
'onTimeguide          :'+onTimeguide,
'onReferenceHeader     :'+onReferenceHeader,
'onTimelineTrackHeader:'+onTimelineTrackHeader,
'Select     :'+xUI.Select,
'Selection  :'+xUI.Selection,
'edmode     :'+xUI.edmode,
'viewOnly   :'+xUI.viewOnly,
'viewMode   :'+xUI.viewMode
].join('<br>\n'));
*/
console.log([outer,vis]);
        if((! outer)&&(vis > 0)){
            xUI.contextMenu.show();
/*表示されたメニューアイテムをチェックして、必要があればセレクタの値を更新する*/
        xUI.menuSelectors.forEach((e)=>{
            if($("#"+e.id).isVisible()){
                var options;
                var contents = "";
                if(e.item.options instanceof Function){
                    options = e.item.options();
                }else if(typeof e.item.options == 'string'){
                    options = (Function(e.item.options))();
                };// ここで解決して挿入*/
                options.forEach((o)=>{
                    contents += '<option value="'+o.value+'" '+((o.selected)?"class=selectedOption":"")+'>'+o.text+'</option>';
                });
                document.getElementById(e.id).innerHTML = contents;
                document.getElementById(e.id).size = (options.length < e.item.size)? options.length:e.item.size;
            };
        });
//表示前に確定したサイズから画面外に隠れるケースで位置を調整
//上下方向
            if(
                (window.innerHeight - (xUI.contextMenu.position().top+xUI.contextMenu.height())) < 0
            ){
                xUI.contextMenu.css('top',point.y- xUI.contextMenu.height());//単純にクリック位置をメニュー下端に変更
            }
//左右 タイムシートセルとそれ以外で切り分け
            if(e.target instanceof HTMLTableCellElement){
                if((window.innerWidth - (xUI.contextMenu.position().left+xUI.contextMenu.width())) < 0){
                    xUI.contextMenu.css('left',point.x-xUI.screenShift[0]-xUI.contextMenu.width()-e.target.clientWidth);
                }
            }else{
                if((window.innerWidth - (xUI.contextMenu.position().left+xUI.contextMenu.width())) < 0){
                        xUI.contextMenu.css('left',point.x-xUI.screenShift[0]-xUI.contextMenu.width()-32);
                }
            };//  */
            e.stopPropagation();e.preventDefault();
            return false;
        }else{
            return true;
        };
    };
        return true;
}
/*  flipContextMenu//   */
/*  cUI.onTouch
onTouchStart
onTouchEnd
onTouchMove

*/
xUI.Touch = function(e){
    console.log(e);
//タッチデバイス（ドラグムーブが標準であるタブレット・モバイル）
    if(e.type == 'touchstart'){
        if(! xUI.Touch.tapCount){
            xUI.Touch.tapCount ++;
            xUI.Touch.tapItem = e.target;
            setTimeout(function(){xUI.Touch.tapCount = 0;xUI.Touch.tapItem = null;},500);
        }else{
// ビューポートの変更(ズーム)を防止
            e.preventDefault() ;
// ダブルタップイベントの処理内容
            if((xUI.Touch.tapCount)&&(xUI.Touch.tapItem == e.target)) console.log(xUI.Touch.tapCount + " : !! doubleTap !!" ) ;
            xUI.Touch.tapCount ++;
// タップ回数をリセット
//            xUI.Touch.tapCount = 0 ;
        };
    };
/*    if((e.target.className)&&(e.target.className.match(/floatPanel/))){
        e.stopPropagation();e.preventDefault();
        return false;
    };// */
    return true;

    return xUI.Mouse(e);
}
xUI.Touch.tapCount = 0;
xUI.Touch.tapItem  = null;

/*    xUI.Mouse(e)
引数:    e    マウス｜ポインタイベント
戻値:        UI制御用
    マウス動作
ポインタ処理を集中的にコントロールするファンクション

関連プロパティ
    xUI.edmode
0 : 通常編集
1 : ブロック編集
2 : セクション編集
3 : セクション編集フローティング
モード変更はxUI.mdChg関数を介して行う

モード別テーブルセル編集操作一覧


ポインタイベント対応開始
マルチポイント対応変数を増設

xUI.Mouse.pointerCash : []
xUI.Mouse.down        : Bool
xUI.Mouse.moveDelta   : []
 */
xUI.Mouse = function(e){
if(e.type == 'click') console.log('CLICK!');
    if((documentFormat.active)||(xUI.onCanvasedit)) return;//キャンセル条件注意
    var currentTrack = xUI.XPS.xpsTracks[xUI.Select[0]];
    var exch = ((e.ctrlKey)||(e.metaKey));
    if((xUI.edmode==3)&&(e.target.id=='sheet_body')&&(e.type=='pointerout')){
        xUI.sectionUpdate();
        xUI.mdChg(2);
        xUI.Mouse.action=false;
        return false;
    };
// if(config.dbg) dbgPut(e.target.id+":"+e.type.toString());
//document.getElementById("iNputbOx").focus();
if(xUI.edchg){ xUI.eddt= document.getElementById("iNputbOx").value };
//IEのとき event.button event.target
//if(appHost.platform == 'MSIE'){TargeT = event.target ;Bt = event.button ;}else{};
        var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
// dbgPut(TargeT.id);
//IDの無いエレメントは処理スキップ
    if(! TargeT.id){
        xUI.Mouse.action = false;
//         if (this.edmode==3){this.Mouse()}
        return false;
    };
//カラム移動処理の前にヘッダ処理を追加 2010/08
    if(TargeT.id.match(/^L([0-9]+)_(-?[0-9]+)_([0-9]+)$/)) {
        var tln=1*RegExp.$1;var pgn=1*RegExp.$2;var cbn=1*RegExp.$3;//timeline(column)ID/pageID/columnBlockID
switch(e.type){
case    "dblclick":
        reNameLabel((tln).toString());
break;
case    "pointerdown":
case    "mousedown":
case    "touchstart":
    if(xUI.edmode==0)xUI.changeColumn(tln,2*pgn+cbn);
break;
}
    xUI.Mouse.action = false;
    return ;
    }
//-------------------ヘッダ処理解決

//    if(TargeT.id.split("_").length>2){return false};//判定を変更
//ページヘッダ処理終了
//=============================================モード別処理
if(xUI.edmode==3){
/*
    セクション編集フローティング
    フローティング移動中
*/
    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
switch (e.type){
case    "pointerdown" :
case    "dblclick"    :
case    "mousedown"   :
case    "touchstart"  :
//    document.getElementById("iNputbOx").focus();
break;
case    "click"       :
case    "pointerup"   :
case    "mouseup"     ://終了位置で解決
case    "touchend"    ://終了位置で解決
//[ctrl][shift]同時押しでオプション動作
    xUI.sectionUpdate();
    xUI.mdChg(2);
    xUI.Mouse.action=false;
break;
case    "pointerenter":
case    "pointerover" :
case    "mouseover"   :
    if((hottrack!=xUI.Select[0])||(! xUI.Mouse.action)) {
        if(TargeT.id && TargeT.id.match(/r?L\d/)){
            xUI.sectionUpdate();
            xUI.mdChg(2);
            xUI.Mouse.action=false;
        }
        return false
    };
if(! xUI.Mouse.action){
    return false;

    if(xUI.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
        xUI.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(xUI.edmode==2){
//    document.getElementById("iNputbOx").focus();
    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
/*
    モード遷移は他の状態からコール
    セクション編集モード
    トラック内限定で区間編集を行う。
    モード変更コマンドの発行はemode==0の際のみ有効
    モード変更のトリガは、ダブルクリック
基本操作
３種のターゲットがある
        body
セクション全体がトラック内を前後に移動する
フローティングムーブに準ずる処理  ホットポイントオフセットが存在する
        head
        tail
トラック内でセクションが伸縮
他のノードを固定してヘッドまたはテールノードが移動することでセクションを伸縮する  

edmode==3  中は、マウスオーバーでセクション body||head||tail 移動
リリースで移動（＝編集）を解決  1回毎に更新回数を記録
ダブルクリックまたは対象トラック外をクリックで解決してモード解除
エスケープまたは対象トラック外右クリックで変更を廃棄して編集前に戻す

キーボード操作(1フレームづつ移動なので要注意)
    モード遷移・確定 [ctrl]+[shift]+[ENTER]
    ボディ移動       [↑]/[↓]
    ヘッド移動       [ctrl]+[↑]/[↓]
    テール移動       [shift]+[↑]/[↓]
                     [shift]+[ctrl]+[↑]/[↓]
     編集破棄＋モード解除
                     [esc]
                     
    セクション操作オフセットをxUIのプロパティで設定する
    値が０なら前方伸長  値が末尾なら後方伸長それ以外は移動
    継続時間が1の場合は末尾として扱う
    解決順が  末尾＞先頭＞以外になれば操作種別を１種にできる
    すべてsectionMove(start,duration)に集約できそう
    
*/
switch (e.type){
case    "dblclick"    :
//セクション操作モードを抜けて確定処理を行う
//確定処理はmdChg メソッド内で実行
              xUI.mdChg("normal");
break;            
case    "pointerdown"  :
case    "mousedown"    :
case    "touchstart"   :
    //サブモードを設定
    if((
        Math.abs(hotpoint -(xUI.Select[1]+(xUI.Selection[1]/2))) >
        Math.abs(xUI.Selection[1]/2)
        )&&(hottrack == xUI.Select[0])
    ){
//レンジ外
        if (e.shiftKey){
//近接端で移動
            xUI.sectionManipulateOffset[1] = (hotpoint<xUI.Select[1])? 0:this.Selection[1];
            xUI.sectionManipulateOffset[0] = 'body';
        }else if((e.ctrlKey)||(e.metaKey)){
//近接端で延伸
            xUI.sectionManipulateOffset[1] = (hotpoint<xUI.Select[1])? 0:this.Selection[1];
            xUI.sectionManipulateOffset[0] = (hotpoint<xUI.Select[1])? 'head':'tail'; 
        }else{
            return xUI.mdChg(0);//モード解除
        }
        xUI.sectionPreview(hotpoint);
        xUI.sectionUpdate();
    }else{
//フロートモードへ遷移
        xUI.sectionManipulateOffset[1] = hotpoint-xUI.Select[1];
        xUI.sectionManipulateOffset[0] = 'body';
        if(xUI.sectionManipulateOffset[1]==xUI.Selection[1]){
            xUI.sectionManipulateOffset[0] = 'tail';
        } else if(xUI.sectionManipulateOffset[1]==0){
            xUI.sectionManipulateOffset[0] = 'head';
        }
    }
    xUI.mdChg(3);
    xUI.Mouse.action=true;
//    console.log([xUI.edmode,hotpoint,xUI.sectionManipulateOffset,xUI.Mouse.action]);
break;
case    "click"    :;//クリックしたセルで解決  (any):body/+[ctrl]:head/+[shift]:tail 
    if(hottrack!=xUI.Select[0]) {
        //対象トラック外なら確定して解除
        xUI.mdChg("normal");        
    }
break;
case    "pointerup"  ://
case    "mouseup"    ://
case    "touchend"   ://終了位置で解決
//[ctrl]同時押しで複製処理
    //  xUI.mdChg(0,(e.ctrlKey));
    xUI.Mouse.action=false;
    xUI.floatTextHi();
break;
case    "pointerenter" :
case    "pointerover"  :
case    "mouseover"    :
    
//トラックが異なる場合 NOP return
//    var sectionRegex=new RegExp('^'+String(xUI.Select[0])+'_([0-9]+)$');
//    if((!(TargeT.id.match(sectionRegex)))||(! xUI.Mouse.action)){return false};//ターゲットトラック以外を排除
    if((hottrack!=xUI.Select[0])||(! xUI.Mouse.action)) {return false};
if(! xUI.Mouse.action){
    return false;

    if(xUI.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
            xUI.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(xUI.edmode==1){
//return false;
//ブロックムーブ（フローティングモード）
/*
    基本動作:
マウスオーバーでセクションを移動
リリースで移動を解決してモード解除
ダブルクリック・クリック等は基本的に発生しないので無視
*/
    switch (e.type){
    case    "dblclick"    :
//              xUI.mdChg("section");
//              xUI.floatTextHi();//導入処理
//            xUI.selectCell(TargeT.id);
//    xUI.floatDestAddress=xUI.Select.slice();
            
    case    "pointerdown" :
    case    "mousedown"   :
//  case    "touchstart"   :
    case    "click"       :
    case    "pointerup"   :
    case    "mouseup"     :
    case    "touchend"    ://終了位置で解決
//    console.log("<<<<<<")
//[ctrl]同時押しで複製処理
      xUI.mdChg(0,((e.ctrlKey)||(e.metaKey)));
      xUI.floatTextHi();
    break;
    case    "pointerover"  ://
    case    "pointerenter" ://
    case    "mouseover"    ://可能な限り現在位置で変数を更新
        if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除
//オフセットを参照して  .Select .Selection を操作する
/*
    
*/
    if(false){
        if(xUI.Mouse.action){
            if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
                xUI.selection(TargeT.id);
                if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
                return false;
            }else{
                return true;
            };
        };
    }else{
        xUI.selectCell(TargeT.id);
        xUI.floatDestAddress=xUI.Select.slice();
    };
    break;
    default    :    return true;
    };
    return false;
}
//=============================================カラム移動処理
    if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除

    switch (e.type){
    case    "dblclick"    :
            //ダブルクリック時はモード保留して（解除か？）タイムラインセクション編集モードに入る
            xUI.mdChg("section",TargeT.id);
            xUI.Mouse.action=false;
            return false;
    break;
    case    "pointerdown"  :
    case    "mousedown"    :
    case    "touchstart"   :
//document.getElementById("iNputbOx").value=("mouseDown")
        if(xUI.edchg){
            var expdList = iptFilter(nas_expdList(xUI.eddt).split(","),currentTrack,xUI.ipMode,exch);
            xUI.put(expdList);//更新
            xUI.selectCell(add(xUI.Select,[0,1]));//入力あり
        }
        xUI.Mouse.rID=xUI.getid("Select");//
        xUI.Mouse.sID=TargeT.id;
        xUI.Mouse.action=true;

//    if(TargeT.id==xUI.getid("Select"))
//    {    }else{    };

        if(xUI.Selection[0]!=0||xUI.Selection[1]!=0){
//選択範囲が存在した場合
//if(dbg) dbgPut(xUI.edmode+":"+xUI.getid("Select")+"=="+TargeT.id);
//        var CurrentSelect=TargeT.id.split("_");
/*
        var CurrentAction=this.actionRange();
        if(
        (CurrentAction[0][0]<=CurrentSelect[0] && CurrentAction[1][0]>=CurrentSelect[0])&&
        (CurrentAction[0][1]<=CurrentSelect[1] && CurrentAction[1][1]>=CurrentSelect[1])
        ){}
*/
        if(TargeT.id==xUI.getid("Select")){
              //フォーカスセルにマウスダウンしてブロック移動へモード遷移
            //クリック時とダブルクリック時の判定をしてスキップしたほうが良い
//            if(TargeT.id!=xUI.floatDestAddress.join("_")){}
            xUI.mdChg('block');
            xUI.floatTextHi();
            xUI.selectCell(TargeT.id);
            xUI.floatDestAddress=xUI.Select.slice();

            xUI.Mouse.action=false;
            return false;
          }else{
        if(e.shiftKey){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;//マルチセレクト
        }else{
            xUI.selection();//セレクション解除
            xUI.Mouse.action=false;
            xUI.selectCell(TargeT.id);//セレクト移動
        }
            return false;
          }
        }else{
//選択範囲が存在しない場合
            xUI.selection();//セレクション解除
        };

        if(e.shiftKey){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;//マルチセレクト
        }else{
            if ((! e.ctrlKey)&&(! e.metaKey)){xUI.selection()};//コントロールなければ選択範囲の解除

            //xUI.Mouse.action=false;
            xUI.selectCell(TargeT.id);
        };
    break;
case    "pointerup"  :
case    "mouseup"    :
case    "touchend"   :
        xUI.Mouse.action=false;
    if( xUI.Mouse.sID!=TargeT.id){
        if(e.shiftKey){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;//マルチセレクト
        }else{
            return false;//セレクトしたまま移動
        };
    };
    break;
case    "click"    :

    break;
case    "pointerenter" :
case    "pointerover"  :
case    "mouseover"    :
    if(xUI.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;
        }else{
            return true;
        };
    };
default    :    return true;
};
    return false;
};
//
//    xUI.Mouse.action    =false    ;//マウスアクション保留フラグ
//    xUI.Mouse.rID=false    ;//マウスカーソルID
/** ドキュメントを開く
    引数'localFile'の場合は、サーバリポジトリでなくローカルファイルインポートを優先する。
    fileBox.openFileDBが関数として存在する場合は、  AIR準拠環境でローカルファイルの操作が可能なので実行
    それ以外は、インポート手順に従ってローカルファイルチューザーを提示
    失敗時はNOP
    引数なしのケースでは、リポジトリの操作を行う。（リポジトリドキュメントチューザーを提示）
    ドキュメント編集中はリポジトリの操作がブロックされるので、強制的にローカルインポートモードに遷移
    
*/
xUI.openDocument=function(mode){
    if(xUI.app == 'pman_reName'){
        pman.reName.openFolder(); return;
    }else if((xUI.app == 'remaping')||(xUI.app == 'xpsedit')){
        xUI.sWitchPanel('File'); return;
//    }else if(xUI.app == 'stbd'){
//    }else if(xUI.app == 'pmdb'){
    };
    if(xUI.uiMode=='production') {mode='localFile';}
    document.getElementById('loadShortcut').value='true';
    document.getElementById('loadTarget').value  ='body';
    if(mode=='localFile'){
        if(fileBox.openFileDB){
            fileBox.openFileDB();
        }else{
//        this.sWitchPanel("Data");//インポート・エクスポートパネルを呼び出す必要はなくなったので削除
//            if(document.getElementById('optionPanelData').style.display!='inline'){xUI.sWitchPanel('Data')};
            document.getElementById('myCurrentFile').value = '';
            document.getElementById('myCurrentFile').click();
        }
    }else{
        xUI.sWitchPanel("File");   
    }

}
/**
りまぴん-WEB-用 ローカルファイルインポートコマンド
loadTarget 変数の設定とファイルセレクタのクリアを同時に行い
クリックイベントを送出する
*/
xUI.importDocument =function(targetArea){
    if(! targetArea) targetArea = '';
    document.getElementById('loadTarget').value = targetArea;
    if(fileBox.openFileDB){
        fileBox.openFileDB();
    }else{
        document.getElementById('myCurrentFile').value = '';//これをカラにしないとchangeイベントが発火しないケースがある。
        document.getElementById('myCurrentFile').click();
    }
}

/** ドキュメントを保存
 *   @params {String} mode
 *    現在のドキュメントをしかるべきロケーションに上書|新規保存する。
 *    保存ロケーションの判定はxUI.uiModeによって判別
 *    case "floating":  //ローカルファイルを扱える唯一のモード
 *         AIRローカルファイル:fileBox.saveFile/fileBox.saveAs
 *         その他:serviceAgent.addEntry/callEcho;
 *    case "production": // ネットワークドキュメント編集中
 *     ネットワークリポジトリドキュメント:serviceAgent.putEntry(xUI.XPS,function(){xUI.setStored("current");xUI.sync();})/
 *     
 *    default:
 *
 *    trueに判定される引数が与えられた場合、可能な限りローカルファイルシステムヘの別名保存を行う。
 *    AIR環境の場合は、fileBox.saveAs()  それ以外の場合はエコーサーバ経由のダウンロード
*/
xUI.storeDocument=function(mode){
    if(xUI.app == 'pman_reName'){
        return null;
//    }else if(xUI.app == 'xpsedit'){
//    }else if(xUI.app == 'stbd'){
//    }else if(xUI.app == 'pmdb'){
    };
//        this.sWitchPanel("Data");//インポート・エクスポートパネルを呼び出す必要はなくなったので削除
    if(xUI.XMAP.dataNode){
        if((mode)||(xUI.uiMode!='production')){
            callEcho();//ダウンロード保存
        }else{
            if(! (this.setStored())){
                serviceAgent.putEntry(
                    xUI.XPS,
                    function(){xUI.setStored("current");xUI.sync();}
                );
            };//現行ドキュメントの上書き、最終保存から変更なければ処理スキップ
        };
    }else{
        if(fileBox.saveFile){
            if(mode){
                fileBox.saveAs();
            }else{
                fileBox.saveFile();//setStoredeの判定はsaveFileメソッド内で行うのでここでは不要
            };
        }else{
            if(mode){
                callEcho();//ダウンロード保存
            }else{
                serviceAgent.addEntry(xUI.XPS,function(){
                    var myIdentifier = Xps.getIdentifier(xUI.XPS,'job');
                    console.log(myIdentifier);
                    serviceAgent.currentRepository.getSCi(function(){
                        serviceAgent.currentRepository.getEntry(myIdentifier,false,function(){alert(myIdentifier)});
                    },false,myIdentifier);
                },function(){
                    alert("データ登録失敗");
                });
            };
        };
    };
}
/**
 *  @params {Array of File|String} pth
 *  @params {Object} options
 *  指定のパス|URLまたはファイルをシステム設定のアプリケーションで実行
 * ディレクトリが指定された場合は Finder | FileExproler 等で表示される
 * optionsでターゲットアプリケーション等の条件指定が可能
 */
xUI.openWithSystem = function openWithSystem(pth,options){
console.log(pth);
console.log(options);
    if(! pth instanceof Array) pth = [pth];
    if(appHost.platform == 'Electron'){
        uat.MH.parentModule.window.postMessage({
            channel:"command",
            form:{name:xUI.app,id:uat.MH.objectIdf},
            to:{name:'hub',id:uat.MH.parentModuleIdf},
            command:'electronIpc.openWithSystem(...arguments)',
            content:[pth]
        });
    }else if(appHost.Nodejs){
        pth.forEach(openPath);//require nodeUI
    }else if(appHost.ESTK){
        
    };
console.log(pth);
}

/*xUI.scrollTo(ID)
    特定のIDのセルが画面内に収まるようにスクロールする
    ずれ込みの象限によって移動位置は変わる
    IDを持ったエレメントならば汎用的に使用可能
    CSX環境でscrollTo()メソッドの際にスクロールイベントが発生しないケースあり
*/
xUI.scrollTo=function(ID){
console.log("##############################################################################################################");
//要素が存在しない場合はNOP
    if(document.getElementById(ID) == null){return};
//ドキュメント系の座標に変換するメソッド要る？

    var elementOffset=$("#"+ID).offset();
//ドキュメントオフセット（スクロール）
    var currentOffset={};
      currentOffset.left=$(document).scrollLeft();
      currentOffset.top=$(document).scrollTop();

//表示ウインドウを算出（Window系座標値)この基準位置はScrollモードの基準値なので注意
if(this.viewMode=="Scroll"){
    var clipBounds={};
      clipBounds.left=($("#qdr2").offset().left+$("#qdr2").width())-currentOffset.left;
      clipBounds.top=$("#qdr2").offset().top+$("#qdr2").height()-currentOffset.top;
      clipBounds.right=$(window).width();
      clipBounds.bottom=$(window).height();
}else{
    var clipBounds={};
      clipBounds.left=120;
      clipBounds.top=$("#fixedHeader").height()+$("#app_status").height();
      clipBounds.right=$(window).width();
      clipBounds.bottom=$(window).height();
}
//フレーム高さ
    var frameHeight=$("#0_0").height();
if(this.viewMode=="Scroll"){
//境界オフセット変数
    var borderOffset={};
//左マージン    ２カラム
      borderOffset.left=this.sheetLooks.SheetCellWidth;
//上マージン    ４フレーム
      borderOffset.top=frameHeight*4;
//右マージン    レコード末コメント除き１カラム
      borderOffset.right=this.sheetLooks.CommentWidth;
//下マージン    ４フレーム内寄り
      borderOffset.bottom=frameHeight*6
}else{
//境界オフセット変数
    var borderOffset={};
//左マージン    ３カラム
      borderOffset.left=this.sheetLooks.SheetCellWidth*4;
//上マージン    ６フレーム
      borderOffset.top= frameHeight*4;
//右マージン    レコード末コメント除き２カラム
      borderOffset.right= this.sheetLooks.CommentWidth;
//下マージン    ６フレーム
      borderOffset.bottom= frameHeight*6;
}
//オフセット計算
var offsetV=0;var offsetH=0;
    if((elementOffset.top-currentOffset.top)<(clipBounds.top+borderOffset.top)){
        offsetV=clipBounds.top+borderOffset.top-elementOffset.top+currentOffset.top;
    }else{
        if((elementOffset.top-currentOffset.top)>(clipBounds.bottom-borderOffset.bottom)){
        offsetV=clipBounds.bottom+currentOffset.top-borderOffset.bottom-elementOffset.top;
        }
    }

    if((elementOffset.left-currentOffset.left)<(clipBounds.left+borderOffset.left)){
        offsetH=(clipBounds.left+borderOffset.left)-elementOffset.left+currentOffset.left;
    }else{
        if((elementOffset.left-currentOffset.left)>(clipBounds.right-borderOffset.right)){
        offsetH=(clipBounds.right+currentOffset.left-borderOffset.right)-elementOffset.left;
        }
    }
//オフセットがHVともに0の場合は処理をスキップ(移動条件外)
    if((offsetV==0)&&(offsetH==0)){return;}else{
//移動量を計算してスクロール(可動範囲外の値が出るのでクランプする)
//    var myLeft=clamp([currentOffset.left-offsetH],0,document.body.clientWidth-(clipBounds.right -clipBounds.left))[1];
//    var myTop =clamp([currentOffset.top-offsetV] ,0,document.body.clientHeight-(clipBounds.bottom-clipBounds.top))[1];
    var myLeft=(currentOffset.left-offsetH);
    var myTop =(currentOffset.top-offsetV );
        scrollTo(myLeft,myTop);
      if(appHost.platform=="CSX"){
        this.onScroll();
      };
    };
}

/* xUI.onScroll
    SheetBody(document.body)のスクロールイベントに合わせ相当量の移動をヘッダに与える
３秒目からセルの高さが減少するのは、出力ルーチン側のカラム処理の問題だと思われる
スクロールが外れるのは、Rmp_initを通過しない書き換え部分で  body の初期化が発生するためと推測
onscrollの設定位置を一考
マージン部分のカバーをするか、または全体paddingが必要
キーボードによるスクロールが発生した場合、ケースを見て対応が必要

2015.04.22
*/
    xUI.onScroll=function() {
        if(xUI.activeDocument.id==0) return;
/*
     $('#UIheaderScrollV').offset( { top : $('#qdr4').offset().top} );
     $('#UIheaderScrollH').offset( { left : $('#qdr4').offset().left} );
*/
        xUI.contextMenu.hide();
        var scrollOffsetV = (appHost.touchDevice)? 0:document.getElementById("app_status").getBoundingClientRect().bottom;
        document.getElementById('UIheaderScrollV').style.top  = (scrollOffsetV - window.scrollY)+'px';//qdr3
        document.getElementById('UIheaderScrollH').style.left = - window.scrollX +'px';
   };
//===========================================
/**
    @params {String}    target
    @params {String}    mode
    xUI.pMenu(target,mode)
    プルダウンメニューアイテムの有効／無効を切り替える
    引数:
        target  stging:メニューid
        mode    string: disable|enable
*/
    xUI.pMenu = function(target,mode){
        if (mode == 'enable'){
            $('#'+target+'-d').hide();
            $('#'+target).show();
        }else{
            $('#'+target).hide();
            $('#'+target+'-d').show();
        }
    }
/* 
 *  xUI.panelTable
    <key>:{
        elementId:{String}<HTML Element Id>,
        type:{String}<fix|modal|float|doc>,
        status:{function|expression}<optional>,
        uiOrder:{Number}    <optional>,
        exclusive:{Boolean} <optional 排他フラグ>,
        sync:{String}   <optional xUI.syncメソッドに与えるキーワード>,
        func:{Function} <optional 開閉時関数>,
        note:{String}   <optional パネルの説明>
    }
 type
    fix     固定位置パネル
    float   フロートタイプダイアログ(jquiパネル)
    modal   モーダルダイアログ（jqui疑似モーダルパネル）
    doc     ドッキングタイプ（未実装 - 予約）
    exclusive_item_group アプリ別排他グループリスト
    またはキー値の配列
    [<key>.....]

 uiOrder       数値の低いほど表示優先順位が高い 低優先指定の場合は高位のアイテムを包括する
   -1:other             番外・優先度なし 比較対象外 このアトリビュートを持たない場合もこれに準ずる
    0:restriction       制限モード入力規制
    1:input-minimum     入力最小モード
    2:compact           コンパクトモード
    3:default-basic     標準モード
    4:full              フルサイズモード
 sync       パネル表示後に同期処理が必要な場合 同期テーブルのキーワードを与える
 func       モーダルパネルを除き、通常処理をスキップして開閉処理を特定の関数で行う場合に設定する
 */

/* base panelTable */
xUI.panelTable = {
//======== MODAL
// common modal-dialog
    'Login'    :{elementId:"optionPanelLogin"    ,type:'modal',note:"サーバログイン(汎)"},
    'Ver'      :{elementId:"optionPanelVer"      ,type:'modal',note:"アバウト(汎)"},
    'Prog'     :{elementId:"optionPanelProg"     ,type:'modal',note:"プログレス表示（汎）"},
    'Pref'     :{elementId:"optionPanelPref"     ,type:'modal',note:"環境設定(汎)",func:function(){}},
    'Rol'      :{elementId:"optionPanelRol"      ,type:'modal',note:"書込み制限警告(汎)uaf|xpst"},
//floating panels common
//inplace-UI-panel (fixed) common
//uat-common
    'menu'          :{elementId:'pMenu'                   ,uiOrder: 3,type:'fix', note:"WEB pulldown menu(汎)"},
    'appHdBr'       :{elementId:'applicationHeadbar'      ,uiOrder: 1,type:'fix', note:"uat アプリケーションヘッドバー"},
    'Dbg'           :{elementId:'optionPanelDbg'          ,uiOrder:-1,type:'fix', note:"debug console(汎)"},
    'ibC'           :{elementId:'toolbarPost'             ,uiOrder: 1,type:'fix', note:"iconButtonColumn(汎)"},
//===============
    '_exclusive_items_':{}
};

/**
 *  UIパネルテーブルをマージ
 *  @params {Object} panelTable
 *  @params {Boolean} overwrite
 *    パネルテーブルオブジェクト
 *     上書きオプション default true
 *    テーブルマージ
 *      キーワードコンフリクトしたメンバーアイテムは上書きオプションを明示的にfalseに設定しない限り新しいメンバーで上書きされる
 */
xUI.panelTable.mergeItems = function(panelTable,overwrite){
    let skip = false;
    if((typeof overwrite != 'undefined')&&(!(overwrite))) skip = true;
    let conflictItems = [];
    for( var f in panelTable){
        if((xUI.panelTable[f])&&(skip)){
            conflictItems.push(f);
        }else{
            xUI.panelTable[f] = panelTable[f];
        };
    };
    if(conflictItems.length) console.log(conflictItems);
};
/**
    @params {String}    itm
    りまぴんフロートウィンドウ初期化
    
    モバイルデバイス上ではフローティングパネル不使用
    スタティックパネルとして初期化される
    ヘッドバーは非表示
    パネルは他のパネル類と排他
    パネル幅は、ウインドウ全幅
    パネル高さは、内容による
*/
xUI.initFloatingPanel = function(itm){
console.log(itm);
    if(
        (xUI.panelTable[itm].type != 'float')||
        (!(document.getElementById(xUI.panelTable[itm].elementId)))
    ) return;
    var target = xUI.panelTable[itm].elementId;
console.log(target);
    if(appHost.touchDevice){
console.log('init : '+ target)
//モバイルデバイスモード初期化
        if(xUI.panelTable[itm].type == 'float'){
//パネル要素から'OptionPanelFloat'クラスを削除
            nas.HTML.removeClass(document.getElementById(target),'optionPanelFloat');
//パネル要素から'OptionPanelFloat'クラスを削除
            nas.HTML.addClass(document.getElementById(target),'optionPanelFloat-mobile');
        };
//ヘッドバー（ターゲットの第一アイテムで<dl>）非表示
        if(document.getElementById(target).children[0] instanceof HTMLDataListElement){
            document.getElementById(target).children[0].style.display = 'none';
        };
//クローズ(down)のみを設定
        $(function(){
            $("#"+target+" a.down").click(function(){
                xUI.sWitchPanel(itm,'hide');
                return false;
            });
        });
    }else{
//従来処理
console.log('init Floating panel :' + target)
        $(function(){
            $("#"+target+" a.close").click(function(){
                xUI.sWitchPanel(itm,'hide');
                return false;
            });
            $("#"+target+" a.minimize").click(function(){
                if($("#"+target).height() > 50){
                    $("#form"+itm).hide();
                    $("#"+target).height(24);
                }else{
                    $("#form"+itm).show();
                    $("#"+target).height('');
                };
                return false;
            });
            $("#"+target+" dl dt").on('pointerdown',function(e){
//マウスドラッグスクロールの停止
                nas.HTML.mousedragscrollable.movecancel = true;
//タッチスクロール・ホイルスクロールの停止
                document.addEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//                document.addEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
                document.addEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
                $("#"+target)
                    .data("clickPointX" , ((e.pageX)? e.pageX:e.targetTouches[0].pageX) - $("#"+target).offset().left)
                    .data("clickPointY" , ((e.pageY)? e.pageY:e.targetTouches[0].pageY) - $("#"+target).offset().top);
                $(document).on('pointermove',function(e){
                    var myOffset=document.body.getBoundingClientRect();
                    $("#"+target).css({
                        top:e.pageY  - $("#"+target).data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                        left:e.pageX - $("#"+target).data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
                    });
                });
            }).on('pointerup', function(e){
                    $(document).unbind("pointermove");
//マウスドラッグスクロール再開
                nas.HTML.mousedragscrollable.movecancel = false;//(xUI.canvasPaint.currentTool == 'hand')? false:true;
//タッチスクロール・ホイルスクロール再開
                document.removeEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//                document.removeEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
                document.removeEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
            });
        });
    };
}
xUI.floatPanelMvHandle = function(e){
    var myOffset=document.body.getBoundingClientRect();
    if(e.pageX){
        var pgX = e.pageX;
        var pgY = e.pageY;
    }else{
        var pgX = e.targetTouches[0].pageX;
        var pgY = e.targetTouches[0].pageY;
    }
    $("#"+target).css({
        top: pgY - $("#"+target).data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
        left:pgX - $("#"+target).data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
    });
};
/*
    xUI.sWitchPanel(target,statsu)
    @params {String} kwd
        パネルアイテムキーワード
    @params {String} status
        switch|show|hide|clear 未指定はswitch(現在の状態を反転)現在の状態と一致している場合はNOP

パネル類の表示をコントロールする
statu引数="clear"または  なしの場合は、排他表示のパネル類を表示クリア（hide）して表示を初期化する

引数    JQobject    備考
//一括クリア除外オブジェクト
menu
ibC
_exclusive_items_
headerTool
SheetHdr
memoArea
inputControl
//排他表示グループ
login   #optionPanelLogin   //ログインUI（  排他）
memo    #optionPanelMemo    //メモ編集（  排他）
Data    #optionPanelData    //Import/Export（  排他）
AEKey   #optionPanelAEK     //キー変換（  排他）
Scn     #optionPanelScn     //シーン設定(モーダル)
SCIs    #optionPanelSCI    //複数対応簡易シーン設定(モーダル)
Pref    #optionPanelPref    //環境設定（モーダル）
Ver     #optionPanelVer     //about(モーダル)
File    #optionPanelFile    //ファイルブラウザ（モーダル）
Timer       #optionPanelTimer       //ストップウオッチ(共)
NodeChart   #optionPanelNOdeChart   //ノードチャート（モーダル）

Rol     #optionPanelRol    //入力ロック警告（モーダル）
Snd     #optionPanelSnd     //音響パネル(共)
Img     #optionPanelImg     //画像パネル(共)

Dbg     #optionPanelDbg    //デバッグコンソール（排他）
Prog    #optionPanelProg    //プログレス表示（排他モーダル）
//フローティングツール
Tbx     #optionPanelTbx    //ソフトウェアキーボード
//常時パネル（ユーザ指定）
menu    #pMenu    //ドロップダウンメニュー(共)
ToolBr      div#toolbarHeader    //ツールバー(共)
SheetHdr    div#sheetHeaderTable    //シートヘッダー(共)
memoArea        //ヘッダメモ欄複合オブジェクト
Search  検索・置換UI
Utl    #optionPanelUtl    //ユーティリティーコマンドバー(共)排他から除外
//新UIツールポスト
モバイルモードの際は、フローティングパネルはすべて排他
フローティングパネル呼び出し時に通常パネルをすべて閉じる
*/
xUI.sWitchPanel = function sWitchPanel(kwd,status){
console.log(kwd,status);
    if(! kwd) kwd = 'ibC';
    if(kwd == 'clear'){
//clearコマンド
        for (var prp in xUI.panelTable){
            if(
                (prp== '_exclusive_items_')||
                (xUI.panelTable[prp].uiOrder <= 3)||
                (! document.getElementById(xUI.panelTable[prp].elementId))
            ) continue ;//除外
            if(
                ((xUI.panelTable[prp].type == 'float')||(xUI.panelTable[prp].type == 'fix'))&&
                ($("#"+xUI.panelTable[prp].elementId).isVisible())
            ){
//表示中のフロートアイテムをすべてhideする
                $("#"+xUI.panelTable[prp].elementId).hide();
            }else if(
                (xUI.panelTable[prp].type == 'modal')&&
                ($("#"+xUI.panelTable[prp].elementId).isVisible())
            ){
//ダイアログをすべて閉じる
                nas.HTML.removeClass(document.body,'scroll-lock');
                $("#"+xUI.panelTable[prp].elementId).dialog("close");
            };
        };
        xUI.adjustSpacer();
        return;
    };
//status  'switch'|'show'|'hide'|'minimise'|'expand'
    if((typeof status == 'undefined')||(!(String(status).match(/show|hide/)))) status = 'switch';
    let itm = xUI.panelTable[kwd];
    if((!(itm))&&(document.getElementById(kwd))){
        for(var prp in xUI.panelTable){
            if(xUI.panelTable[prp].elementId == kwd){
                itm = xUI.panelTable[prp];//document.getElementById(kwd);
                kwd = prp;
                break;
            };
        };
    };
    if((itm)&&(document.getElementById(itm.elementId))){
//操作対象エレメントが存在する場合のみ実行
        let currentStatus = $("#"+itm.elementId).isVisible();//visible true|false
        if(itm.status){
            if(itm.status instanceof Function){
                currentStatus = itm.status();
            }else{
                currentStatus = Function(String(itm.status))();
            };
        };
        let opt = (status == 'switch')? (!(currentStatus)):(status == 'show');// true|false
        if (opt != currentStatus){
//前処理 排他アイテムグループメンバー表示の場合他のウインドウをすべて非表示
            if((opt)&&(xUI.panelTable['_exclusive_items_'][xUI.app])&&(xUI.panelTable['_exclusive_items_'][xUI.app].indexOf(kwd) >= 0)){
                xUI.panelTable['_exclusive_items_'][xUI.app].forEach(e => {
                    if((e != kwd)&&(document.getElementById(xUI.panelTable[e].elementId))){
                        if(xUI.panelTable[e].type == 'modal'){
                            $("#"+xUI.panelTable[e].elementId).dialog("close");//modal
                        }else{
                            $("#"+xUI.panelTable[e].elementId).hide();//fix||float
                        };
                    };
                });
            };
/*            if((itm.type == 'float')&&(appHost.touchDevice)){
//タッチデバイスの際はモバイルデバイス用排他リストを参照
                for(var prp in xUI.panelTable){
                    if((xUI.panelTable[prp].type == 'fix')||(xUI.panelTable[prp].type == 'float')){
                        if (xUI.panelTable[prp] !== itm){
                            $("#"+xUI.panelTable[prp].elementId).hide();//fix||float
                        };
                    };
                };
            };// */
            if(itm.type == 'modal'){
                if(opt){
//モーダル処理確認
                    $("#"+itm.elementId).dialog("open");
                    nas.HTML.addClass(document.body,'scroll-lock');
//                    xUI.setDialog($("#"+itm.elementId));
                    $("#"+itm.elementId).focus();
                }else{
                    nas.HTML.removeClass(document.body,'scroll-lock');
                    $("#"+itm.elementId).dialog("close");
                };
            }else if((itm.func)&&(itm.func instanceof Function)){
//funcプロパティがあれば実行（イレギュラー処理）
console.log(itm.elementId,status);
                return itm.func(document.getElementById(itm.elementId),status);
/*            }else if(itm.type == 'float'){
                if(status){
                    $("#"+itm.elementId).width('100%');
                    $("#"+itm.elementId).dialog('open')
                }else{
                    $("#"+itm.elementId).dialog('close');
                };// */
            }else{
                if(opt){
                    $("#"+itm.elementId).show();
                }else{
                    $("#"+itm.elementId).hide();
                };
            };
//後処理 syncテーブルを参照してメニュー表示UI同期・固定アイテムの場合アジャスト
            if(appHost.touchDevice){
                if((itm.type == 'float')&&(opt)){
                    if(document.getElementById('fixedPanels')) document.getElementById('fixedPanels').style.display = 'none';
                }else{
                    if(document.getElementById('fixedPanels')) document.getElementById('fixedPanels').style.display = '';
                };
            };
            if(xUI.panelTable[kwd].sync) xUI.sync(xUI.panelTable[kwd].sync);
            if(kwd == 'ibC'){
                if($('#toolbarPost').isVisible()){
                    xUI.shiftScreen(50,0);
                }else{
                    xUI.shiftScreen(0,0);
                };
            };
            if(
                (document.getElementById('applicationHeadbar'))&&
                (((kwd == 'ibC'))||(kwd == 'menu'))
            ) $('#toolbarPost').css('margin-top',$('#applicationHeadbar').position().top);
            if(itm.type == 'fix') xUI.adjustSpacer();
        };
    };
//    console.log(arguments);
}
/*
 *    @params {String}    kwd
 *          パネルテーブルの要素名
 *    @params {String}    status
 *           変更ステータス expand|minimise
 *           引数がない場合は変更を行わず状態のみを返す
 *    @returns {String}
 *           切り替え後の状態を文字列で返す expand|minimize
 *
 *    最大化最小化に対応しているパネルを切り替える
 */
xUI.eXpandPanel = function(kwd,status){
    let itm = xUI.panelTable[kwd];
    if(
        (itm)&&
        (document.getElementById(itm.elementId))&&
        (document.getElementById(itm.elementId+'_expand'))&&
        (document.getElementById(itm.elementId+'_minimise'))
    ){
        let currentStatus = ($('#'+itm.elementId+'_expand').isVisible())? 'expand':'minimise';
        if(status == currentStatus) return currentStatus;//NOP
        if(status == 'expand'){
            $('#'+itm.elementId+'_expand').show();
            $('#'+itm.elementId+'_minimise').hide();
            currentStatus = status;
        }else if(status == 'minimise'){
            $('#'+itm.elementId+'_expand').hide();
            $('#'+itm.elementId+'_minimise').show();
            currentStatus = status;
        };
        if(itm.type == 'fix') xUI.adjustSpacer();
        return currentStatus;
    };
}
/*
    メモ欄の編集機能と閲覧を交互に切りかえる
    引数なし
ノート編集をフローティングパネルに変更するため、このメソッドは廃止
 */
xUI.sWitchNotetext = function sWitchNotetext(){
    var myTarget   = $("#optionPanelMemo");//置き換え
    var hideTargets = [$("#memo"),$("#memo_image")];

    if(! myTarget.is(':visible')){
        xUI.sWitchPanel("clear");
        if((document.getElementById("myWords").innerHTML=="word table")&&(myWords)){
            document.getElementById("myWords").innerHTML=putMyWords();
        }

        hideTargets.forEach(function(e){e.hide();});
        myTarget.show();
        document.getElementById("rEsult").value=this.XPS.xpsTracks.noteText;
        xUI.adjustSpacer();
        document.getElementById("rEsult").focus();
    }else{
        hideTargets.forEach(function(e){e.show();});
        xUI.XPS.xpsTracks.noteText=document.getElementById("rEsult").value;
        xUI.sync("memo");
        myTarget.hide();
        xUI.adjustSpacer();
        document.getElementById("iNputbOx").focus();
    };
}
/*TEST
sWitchNotetext();
 */
/* メニュー関連メソッド*/
/*
    @params {String}    command
        メニューコマンド文字列
        nas.menuItemsのkeyプロパティを指定する
        存在しないコマンドは無視される
    @params {Array}     props
        メニューコマンドと引数を連ねた配列
        省略可・省略時はmenuItemsに記載された機能を実行する
        
    メニューコマンドレゾルバ
    自身のアプリケーションモジュール内で実行するメニューコマンドが渡される
    他のモジュールに向かうコマンドはこのメソッド以前に配分されてここまではこない
    処理は各コマンドに一任する

    複雑なメッセージを扱うコマンドも存在するが、このメソッドではメニューテーブルの解決及びコマンドの起動のみを行う
    メッセージの解決はコマンド側で各自とり行う
    レソルバはseletorメニュー場合、処理をスキップする
 */
xUI.menuResolver = function(command,content,callback){
    if(xUI.contextMenu.isVisible()) xUI.contextMenu.hide();
console.log(command,content,callback);
//登録されたメニューだけを選択して実行する
    var mItem = nas.menuItems.get(command);
    if (! mItem) return;
    if (mItem.type == 'selector'){
console.log(event.target.value,mItem);
        var result = Function(mItem.func)(event.target.value);//Function(...content)();
//        if(typeof callback == 'function') callback(result);
        return;//セレクタメニューはアイテム自身が値を呼び出す
    };
    if (typeof content == 'undefined'){
        content = [];
    }else if(!(content instanceof Array)){
        content = [content];
    };
    console.log(mItem);
    if((mItem.func)){
//アイテムにfuncプロパティがある
        if(mItem.func instanceof Array){
//配列指定メニューコマンド [<command>,<arg>,<arg>...]
            content = mItem.func.slice(1);
        }else if(mItem.func.match( /^function|=>/ )){
//コード片実行のため配列に格納
            content = [mItem.func];
        }else{
            if((mItem.type == 'url')||(mItem.type == 'file')){
//ファイルを別ウインドウで開く(メインプロセス側で処理)
                var prop = uat.modules.get(mItem.func.trim());
                prop.asFile = (mItem.type == 'file')? true:false,
                content = ['electronIpc.openURLmain('+JSON.stringify(prop)+')'];
            }else if((mItem.type == 'URL')||(mItem.type == 'FILE')){
//ファイルを同ウインドウ内でページ遷移(メインプロセス側で処理)
                var prop = uat.modules.get(mItem.func.trim());
                prop.asFile = (mItem.type == 'FILE')? true:false,
                content = ['electronIpc.openURLmain('+JSON.stringify(prop)+')'];
            }else if((mItem.type == 'url-')||(mItem.type == 'file-')){
//ファイルを別ウインドウで開く(ブラウザプロセス側で処理)
                content = ['uat.MH.openURL("'+mItem.func.trim()+'")'];
            }else if((mItem.type == 'URL-')||(mItem.type == 'FILE-')){
//ファイルを同ウインドウ内でページ遷移(ブラウザプロセス側で処理)
                content = ['window.location ="'+ mItem.func.trim() +'"'];
            }else if(mItem.type == 'openEx'){
//システムブラウザで開く(WEB環境では動作しない)
                if(appHost.platform == 'Electron'){
                    content = ['pman.openData("'+mItem.func.trim()+'")'];
                }else{
                    content = ['uat.MH.openURL("'+mItem.func.trim()+'")'];
//                }else{
//                    content = ['alert("'+mItem.func+'")'];
                };
            };
        };
console.log(...content);
        var result = Function(...content)();
console.log(result);
        if(typeof callback == 'function') callback(result);
    }else{
console.log(mItem);
    };
};
/**
    コマンド実行メソッド
    @params {String} command
        コード片 <Object>_<function>
    @params {Object | any} content
        コマンドに与える引数 不要な場合は undefinedを置く
    @params {Function} callback
        コールバック関数 なくとも良い 不要な場合は undefinedを置く
    
    メッセージに文字列で与えられたコマンドを現アプリケーションで直接実行する
    コマンド引数が実行可能なファンクションならば、内容引数を与えて実行
    コールバック引数があればリザルトを引数にしてコールバックを実行する
 */
xUI.commandResolver = function commandResolver(command,content,callback){
//console.log(arguments);
    if(!(content instanceof Array)) content = [content];
    var result = Function(command)(...content);
    if(typeof callback == 'function') callback(result);
}
//xUI.menuResolve.commandID = null;
/*
 * セレクタメニューに呼び出されるコマンドディストリビュータ
 */
xUI.menuSelect = function menuSelect(elm){
console.log('MENUSELECT');
console.log(elm);
    var mItem = nas.menuItems.get(elm.id.replace(/^(cM|pM|ibC)/,''));
console.log(mItem);
    if (! mItem) return;
    if(typeof mItem.func == 'string'){
console.log(mItem.func);
//コード片実行
        (Function(mItem.func))(elm.value);
    };
}
/**
 *    @prams {Object nas.MenuItem} mItem
 *    @params    {String}    target
 *        WEB|CONTEXT|ICON    
 *    @returns {Object}
 *        html menu piece
 *        メニューアイテム個別HTMLコンバータ
 */
xUI.menuItemConvert = function convert(mItem,target){
//メニューに表示するテキストは、優先順に ラベル>ロール>キー 最低でもキー文字列が存在する i18n設定をする
    var result     = "";
    var idPrefix = (target == 'ICON')? 'ibC':((target == 'WEB')? 'pM':'cM');
    var menuPrefix = idPrefix + mItem.key;
    var menuText   = mItem.key;
    if(mItem.role) menuText = mItem.role;
    if(mItem.label) menuText = mItem.label;
    menuText = nas.localize(menuText,"UAToolbox");

/*
    アプリケーションのWEBメニューコマンドは以下の３ケースに分類
    セルフ実行 ＞ファンクションを直接埋める
    リモート実行
*/
//funcプロパティの内容からファンクション文字列を作成
    var menuFunctionText = 'xUI.menuResolver("'+mItem.key+'")';
/*
    if(mItem.func){
            if(mItem.func instanceof Array){
                menuFunctionText = 'xUI.menuResolve("'+mItem.func[0]+'",'+JSON.stringify(mItem.func.slice(1))+');';
//            }else if(mItem.func.match( /^function|=>/ )){
//そのまま使用する
//                menuFunction = mItem.func;
            }else{
                if((mItem.type == 'url')||(mItem.type == 'file')){
//別ウインドウを開く
                    menuFunctionText = 'window.open("'+mItem.func.trim()+'");';
                }else if((mItem.type == 'URL')||(mItem.type == 'FILE')){
//ページ遷移
                    menuFunctionText = 'window.location ="'+ mItem.func.trim() +'";';
                }else if(mItem.type == 'openEx'){
//システムブラウザで開く(WEB環境では別ウインドウで開くに振り替え)
                    menuFunctionText = 'alert("'+mItem.func+'")';
                }else{
//そのまま使用する
                    menuFunctionText = mItem.func;
                };
            };
    }else if(mItem.type){
        
    };//*/

    if(target == 'ICON'){
        if(mItem.type == 'separator'){
//アイコンポストのセパレータはスキップするほうが良いか？
            result += '<hr>';
        }else if(
            (mItem.type == 'command')||
            (mItem.type == 'normal')
        ){
            result += '<button id="'+menuPrefix+'"';
            result += ' class="boxButton ' 
            if(mItem.icon){result += mItem.icon;}else{result +='iconButton-selectCircle';};
            result += '"';
            result += ' title="'+ menuText + '" ';
            result += ' data-i18n="[title]'+ menuText +'"';
            if(mItem.func) result += " onclick = '" + menuFunctionText + "\'";
            result += '>';
            if(mItem.image) result += '<img src="' +mItem.image+'">' ;
            result += '</button>';
        }else if(
            (mItem.type == 'radio')
        ){
//ラジオボタンは、ポイントして横出しのリストを表示する □□□☑□□□
            
        }else if(
            (mItem.type == 'slider')
        ){
            
        }else if(
            (mItem.type == 'selector')
        ){
            
        }else if(
            (mItem.type == 'checkbox')
        ){
            result += '<button id="'+menuPrefix+'"';
            result += ' class="boxButton ';
            if(mItem.icon){result += mItem.icon;}else{result +='iconButton-selectCircle';};
            result += ' boxButtonCheckbox"';
            result += ' title="'+ menuText + '" ';
            result += ' data-i18n="[title]'+ menuText +'"';
            if(mItem.func) result += " onclick = '" + menuFunctionText + "\'";
            result += '>';
            if(mItem.image) result += '<img src="' +mItem.image+'">' ;
            result += '</button>';
        };
/*
    ボタンUIはセレクタ/ラジオボタン/テキスト はサポートされない
    現在は URL|url|FILE|file|opneEx もスキップ
*/
    }else if(target == 'CONTEXT'){
        if((mItem.type == 'window')){
            return "";//
        }else if((mItem.type == 'submenu')){
                result += '<hr><span data-i18n="'+ menuPrefix +'" id="'+menuPrefix+'-d"';
                result += ' class="'+ idPrefix + ' ' + idPrefix + '-alt">'
                result += menuText;
                result += '</span><span data-i18n="'+ menuPrefix +'" id="'+ menuPrefix + '" ';
                result += 'title="'+ mItem.description +'"';
                result += '>'+ menuText +'</span>';
        }else if(mItem.type == 'separator'){
            return '<hr>';
        }else{
            result += '<li id="'+menuPrefix+'Menu" class="' +idPrefix +'" ';
//            if(mItem.region ) result += ' ' + mItem.region ;//?
            result += " onclick =\'"+ menuFunctionText + "\'"; 
            result += ">";
            if(
                (mItem.type == 'command')||
                (mItem.type == 'normal')||
                (mItem.type == 'file')||
                (mItem.type == 'url')||
                (mItem.type == 'FILE')||
                (mItem.type == 'URL')||
                (mItem.type == 'file-')||
                (mItem.type == 'url-')||
                (mItem.type == 'FILE-')||
                (mItem.type == 'URL-')||
                (mItem.type == 'openEx')
            ){
                result += '<span data-i18n="'+ menuPrefix +'" id="'+menuPrefix+'-d"';
                result += ' class="'+ idPrefix + ' ' + idPrefix + '-alt">'
                result += menuText;
//                result += '</span><A data-i18n="'+ menuPrefix +'" id="'+ menuPrefix + '" href = "javascript:void(0)" ';
                result += '</span><A data-i18n="'+ menuPrefix +'" id="'+ menuPrefix + '" ';
//                result += "onclick =\'"+ menuFunctionText +"\' ";
                result += 'title="'+ mItem.description +'"';
                result += '>'+ menuText +'</A>';
            }else if(
                (mItem.type == 'checkbox')||
                (mItem.type == 'radio')
            ){
                result += '<input type="'+mItem.type+'" id="'+menuPrefix + '"';

//                if(mItem.func) result += " onchange = \'"+ menuFunctionText +"'";

                if(mItem.type == 'radio') result += " name='" +mItem.name+ "'";
                result += (mItem.checked)? 'checked >':'>';
                result += '<span id="lbl_'+menuPrefix +'" ';
//                result += ' for="'+menuPrefix +'"';
//                result += " onclick =\'"+ menuFunctionText +"\' "; 
                result += '>';
                result += menuText;
                result += '</span>';
            }else if( mItem.type == 'selector'){
/*
    selectの値は文字列で JSON｜関数
    形式は配列[{text:<ラベル>,value:<値>},...]
    関数は同形式のJSONを返すのでそれをoptionsに展開
アイコンバーメニューのリストは、初回の表示タイミングでは、情報が成立していないので利用不可
コンテキストメニューオープン時点での再初期化は可能（そちらへ移行するのが良い）
スタティックな指定以外は空配列で初期化する
*/
                result += '<select id="'+menuPrefix + '" class=historySelect ';
                result += 'size = 0 ';
//                if(mItem.size)  result += 'size = "'+ mItem.size +'" ';
                result += 'onchange ="xUI.menuSelect(this)" ';
                result += '>';
                var options = [];
                if(mItem.options.match(/^\[.*\]$/)){
                    options = JSON.parse(mItem.options);
                }else{
//固定リスト以外は、更新テーブルに登録して表示毎に更新される
                    xUI.menuSelectors.add({"id":menuPrefix,"item":mItem},function(a,b){return (a.id == b.id);});
                };
console.log(options);
                options.forEach((o)=>{
                    result += '<option value="'+o.value+'" ';
                    if(o.selected == true) result += 'selected ';
                    result += '>'+o.text+'</option>';
                });
                result += '</select>';
            }else if( mItem.type == 'slider'){
                result += '<input type="range" id="'+menuPrefix + '"';
                if(mItem.min)   result += " min = \'"+ mItem.min +"'";
                if(mItem.max)   result += " max = \'"+ mItem.max +"'";
                if(mItem.value) result += " value = \'"+ mItem.value +"'";
                if(mItem.step)  result += " step = \'"+ mItem.step +"'";
//                if(mItem.func)  result += " onchange = \'"+ menuFunctionText +"'";
                result += '>'; 
            }else{
                result += '<span id="' + menuPrefix +'">?? '+menuText+' ??</span>';
            };
            result += '</li>';
        }
/*
    コンテキストメニューではセレクタ/ラジオボタン/テキスト はサポートされない
    チェックボックス サポートデバッグ済 220408
*/
    }else{
//WEB pulldownMenu
        if((mItem.type == 'window')){
            result += '<span data-i18n="'+ menuPrefix +'" id="' + menuPrefix + 'Menu">';//spanのみ
            result += menuText + '</span>';//

        }else if(mItem.type == 'separator'){
            result += '<hr>';// <hr>||'' ?

        }else{
        result += '<li id="'+menuPrefix+'Menu" >';
        if(
            (mItem.type == 'command')||
            (mItem.type == 'normal')||
            (mItem.type == 'file')||
            (mItem.type == 'url')||
            (mItem.type == 'FILE')||
            (mItem.type == 'URL')||
            (mItem.type == 'file-')||
            (mItem.type == 'url-')||
            (mItem.type == 'FILE-')||
            (mItem.type == 'URL-')||
            (mItem.type == 'openEx')
        ){
            result += '<span data-i18n="'+ menuPrefix +'" id="'+menuPrefix+'-d"';
            result += ' class="'+ idPrefix + ' ' + idPrefix + '-alt">'
            result += menuText;
//            result += '</span><A data-i18n="'+ menuPrefix +'" id="'+ menuPrefix + '" href = "javascript:void(0) "';
            result += '</span><A data-i18n="'+ menuPrefix +'" id="'+ menuPrefix + '" ';
            result += "onclick ='"+ menuFunctionText +"' "; 
            result += 'title="'+ mItem.description +'"';
            result += '>'+ menuText +'</A>';
        }else if(
            (mItem.type == 'checkbox')||
            (mItem.type == 'radio')
        ){
            result += '<input type="'+mItem.type+'" id="'+menuPrefix + '"';
            if(mItem.func) result += " onchange = \'"+ menuFunctionText +"'";
            if(mItem.type == 'radio') result += " name='" +mItem.name+ "'";
            result += (mItem.checked)? 'checked >':'>';
            result += '<label id="lbl_'+menuPrefix +'"';
            result += ' for="'+menuPrefix +'">';
            result += menuText;
            result += '</label>';
        }else if( mItem.type == 'selector'){
            result += '<hr><span>'+menuText;
            result += '</span><hr><select id="'+menuPrefix + '"';
            if(mItem.size)  result += " size = \'"+ mItem.size +"'";
            result += 'onchange ="xUI.menuSelect(this)" ';
            result += '>';
                var options = [];
                if(mItem.options.match(/^\[.*\]$/)){
                    options = JSON.parse(mItem.options);
                }else{
//固定リスト以外は、更新テーブルに登録して表示毎に更新される
                    xUI.menuSelectors.add({"id":menuPrefix,"item":mItem},(a,b)=>(a.id == b.id));
                };
                options.forEach((o)=>{
                    result += '<option value="'+o.value+'" ';
                    if(o.selected == true) result += 'selected ';
                    result += '>'+o.text+'</option>';
                });
            result += '</select><hr>';

        }else if( mItem.type == 'slider'){
            result += '<input type="range" id="'+menuPrefix + '"';
            if(mItem.min)   result += " min = \'"+ mItem.min +"'";
            if(mItem.max)   result += " max = \'"+ mItem.max +"'";
            if(mItem.value) result += " value = \'"+ mItem.value +"'";
            if(mItem.step)  result += " step = \'"+ mItem.step +"'";
            if(mItem.func)  result += " onchange = \'"+ menuFunctionText +"'";
            result += '>'; 
        }else{
            result += '<span id="' + menuPrefix +'">'+menuText+'</span>';
        };
        result += '</li>';
/*
            result += '<li id="'+menuPrefix+'Menu" >';
            result += '<span data-i18n="'+ menuPrefix +'" id="'+menuPrefix+'-d"';
            result += ' class="'+ idPrefix + ' ' + idPrefix + '-alt">'
            result += menuText;
            result += '</span><A data-i18n="'+ menuPrefix +'" id="'+ menuPrefix + '" href = "javascript:void(0) "';
            result += "onclick ='"+ menuFunctionText +"' "; 
            result += 'title="'+ mItem.description +'"';
            result += '>'+ menuText +'</A></li>';;// */
        };
    };
console.log(xUI.menuSelectors.length)
    return result;
};
/**
 *      @params {} menuList
 *    @params    {String}    target
 *        WEB|CONTEXT|ICON
 *    
 *    メニューデータを画面表示用にHTMLコンバートして表示及び初期化
 *    ターゲット形式は 
 *    WEB   pMenu
 *        HTMLプルダウンメニュ＝ソース
 *    CONTEXT   contextMenu
 *        HTMLコンテキストメニューソース
 *    ICON   ibContent
 *        HTMLアイコンボタンメニューソース
 */
xUI.buildMenuHTML = function buildMenu(menuList,itemCollection,target){
    if(! menuList)       menuList       = nas.applicationMenuList
    if(! itemCollection) itemCollection = nas.menuItems;
    if(! target)         target         = 'WEB';// debug 本来は"ICON"

    if(!(menuList instanceof Array)) menuList = nas.MenuItem.parseMenuMapSource(menuList,true);
    if((!(menuList instanceof Array))||(menuList.length == 0)) return [];
//console.log("==================:"+ target);
console.log(menuList);
//console.log(itemCollection.dump());

//WEB|CONTEXTの内容は配置が異なる
//メニューに表示するテキストは、優先順に ラベル>ロール>キー 最低でもキー文字列が存在する i18n設定をする
    var content  = "";
    var idPrefix = (target == 'ICON')? 'ibC':((target == 'WEB')? 'pM':'cM');
    var currentGroup = false;
    var currentItem = null;

    if((target == 'ICON')&&(document.getElementById('ibContent'))){
        var groupCount = 0;
        xUI.ibCP.length  = 0;
        xUI.ibCP.options = [];
//        content += '<span id="ibCP_" class=ibCP>';
        for(var e = 0 ; e < menuList.length ; e ++){
            currentItem = itemCollection.get(menuList[e]);
            if(!(currentItem)) continue;
            if(! nas.MenuItem.chkPlatform(currentItem.platform)){
//グループ処理のみ開始
                if(currentItem.type == 'window') currentGroup = currentItem;
                continue;
            };
            if(currentItem.type == 'window'){
                xUI.ibCP.push(groupCount);
                xUI.ibCP.options.push({text:(currentItem.label),value:groupCount});
                if(currentGroup) content += '</span>';//グループ処理中は閉じる
                content += xUI.menuItemConvert(currentItem,target);
                content += '<span id="ibCP_'+nas.Zf(groupCount,2)+'" class=ibCP';
                if(currentGroup){
                    content += ' style="display:none"';
                }else{
                    content += ' style="display:inline"';
                }
                content += '>';
                groupCount ++;
                currentGroup = currentItem;//グループ処理開始
            }else{
                content += xUI.menuItemConvert(currentItem,target);
            };
        };
        content += '</span>';
        document.getElementById('ibContent').innerHTML = content;
    }else if((target == 'WEB')&&(document.getElementById('pMenu'))){
        content += '<ul id=pMenu_>';
        for(var e = 0 ; e < menuList.length ; e ++){
            currentItem = itemCollection.get(menuList[e]);
            if(!(currentItem)) continue;
            if(! nas.MenuItem.chkPlatform(currentItem.platform)){
//グループ処理のみ開始
                if(currentItem.type == 'window') currentGroup = currentItem;
                continue;
            };
            if(currentItem.type == 'window'){
                if(currentGroup) content += '</li></ul>';//グループ処理中は閉じる
                content += '<li>';
                content += xUI.menuItemConvert(currentItem,'WEB');
                content += '<ul>';
                currentGroup = currentItem;//グループ処理開始
            }else{
//if(currentGroup) console.log(currentGroup);
                if(
                    (currentGroup)&&
                    (! nas.MenuItem.chkPlatform(currentGroup.platform))
                )continue;
                content += xUI.menuItemConvert(currentItem,'WEB');
            };
        };
        content += '</li></ul></ul>';
        document.getElementById('pMenu').innerHTML = content;
//ブラウザ用プルダウンメニュー非表示
        $("#pMenu").hide();
//プルダウンメニューの初期化
        $("#pMenu li").hover(function() {
            $(this).children('ul').show();
        }, function() {$(this).children('ul').hide();});
        xUI.adjustSpacer();
    }else if(target == 'CONTEXT'){
//コンテキストメニュー初期化
//        content += '<ul class='+idPrefix+'enu_>';
        for(var e = 0 ; e < menuList.length ; e ++){
            currentItem = itemCollection.get(menuList[e]);
            if(!(currentItem)) continue;
            if(! nas.MenuItem.chkPlatform(currentItem.platform)){
//グループ処理のみ開始
                if(currentItem.type == 'window') currentGroup = currentItem;
                continue;
            };
            if(currentItem.type == 'window'){
                if(currentGroup) content += '</ul>';//グループ処理中は閉じる
//                content += xUI.menuItemConvert(currentItem,'CONTEXT');
                content += '<ul class="';
                if(currentItem.region ){
                    content += 'cM' + currentItem.region;
                }else{
                    content += 'cMonHeadline';
                }
                content += '">';
                currentGroup = currentItem;//グループ処理開始
            }else{
            if((currentGroup)&&(! nas.MenuItem.chkPlatform(currentGroup.platform))) continue;
                content += xUI.menuItemConvert(currentItem,'CONTEXT');
            };
        };
        content += '</ul>';
        document.getElementById('contextMenu').innerHTML = content;
    };
    return content;
};
/*MENU-parts TEST
document.getElementById("ibContent").innerHTML = xUI.buildMenuHTML(nas.applicationMenuList,nas.menuItems,'ICON');


document.getElementById("webpulldownmenu").innerHTML = xUI.buildMenuHTML(nas.applicationMenuList,nas.menuItems,'WEB');
*/
/**
 *  @class
 *   画像パーツを描画するローレベルファンクション
 *   bodyコレクションは、描画したテーブルセル内の画像エレメントへの参照が格納される
*/
xUI.Cgl = new Object();
/** セル画像部品描画色*/
xUI.Cgl.baseColorArray = (xUI.sheetTextColor)? nas.colorStr2Ary(xUI.sheetTextColor):[0,1,0,1,0,1];
/** セル画像部品トレーラー*/
xUI.Cgl.body={};
/** セル画像部品キャッシュ */
xUI.Cgl.formCashe = {};     

/** セル画像部品表示
 *     @params {String} myId
 *         描画ターゲットセルID
*/
xUI.Cgl.show=function(myId){
    if(! this.body[myId]){    this.body[myId] = document.getElementById("cgl"+myId)    ;}
    if(this.body[myId]){$("#cgl"+myId).show();}else{delete this.body[myId];}
}
/** セル画像部品非表示
 *     @params {String} myId
 *         描画ターゲットセルID
*/
xUI.Cgl.hide=function(myId){
    if(! this.body[myId]){    this.body[myId] = document.getElementById("cgl"+myId)    ;}
    if(this.body[myId]){$("#cgl"+myId).hide();}else{delete this.body[myId];}
}
/** セル画像部品削除
 *     @params {String} myId
 *         ターゲットセルID
 *         コレクションから削除する
*/
xUI.Cgl.remove=function(myId){
    if(! this.body[myId]){    this.body[myId] = document.getElementById("cgl"+myId)    ;}
    if(this.body[myId]){$("#cgl"+myId).remove();delete this.body[myId];}
}
/** セル画像部品クラス全体を初期化 */
xUI.Cgl.init=function(){
    for (var prp in this.body){
        $("#cgl"+prp).remove();
        delete this.body[prp];
    }
}
/**
 *    @params {Array}     myRange
 *    @params {Boolean}   isReference
 *    @params {Function}  callback
 *    @return {Array}
 *    範囲を指定してグラフィック部品を再描画するラッパ関数
 *    レンジの書式はXpsの戻すレンジに準ずる
 *    [[開始トラック,開始フレーム],[終了トラック,終了フレーム]]
 *    リファレンスフラグが無い場合は編集対象のXPSを処理する
 
 */
xUI.Cgl.refresh = async function(myRange,isReference,callback){
    if (typeof myRange == "undefined") {
        myRange = [[0, 0], [xUI.XPS.xpsTracks.length - 1, xUI.XPS.xpsTracks[0].length - 1]]
    }//指定がなければ全体を更新 印刷時は明確に範囲を指定する必要あり？
    var StartAddress = myRange[0];
    var EndAddress   = myRange[1];
    var idPrefix     =(isReference)?"r_":"";
    /**
     * ループして更新
     */
    for (var t = StartAddress[0]; t <= EndAddress[0]; t++) {
        for (var f = StartAddress[1]; f <= EndAddress[1]; f++){
            this.draw(idPrefix+[t,f].join('_'));
        }
    };
    if(callback instanceof Function) callback();
    return myRange;
}
/**
 *    セル画像部品描画コマンド
 * 位置計算をブラウザに任せるため  絶対座標でなく相対座標で各テーブルセル自体にCANVASをアタッチする
 * 
 * 基本部品はすべてキャッシュを行い  image Objectを作成する。
 * 
 * 印字の際に描画の動作独立性を高める必要があるので、セルに埋め込んだ画像クラスを判定してその描画を行う仕様に変更
 * 具体的には、myFormに優先してターゲットセルの"graph_"で開始されるクラス名からFormを取得するように変更
 *   170815
 * シートカラーを  ユーザ変更可能にしたので  暗色テーマへの対応が必要
 * 描画カラーをオブジェクトプロパティ設ける事
 *  @params {String} myId
 *       ターゲットセルID
 *  @params {String} myForm
 *      描画図形キーワード
 * 引数myFormの書式は以下
 *     Shape[[-Track]-Cycle]_Start-End
 *     後ほどShapeごとにプラグイン処理が可能なように変更を行う予定
 * 
 *   引数として以下の形式も受け入れる
 * addGraphElement(myId,myForm,start,end)
 * 
 * myForm を事前処理してtargetShapeを事前抽出するように変更20180513
 */
xUI.Cgl.draw=function addGraphElement(myId,myForm) {
    var objTarget  = document.getElementById(myId);//ターゲットシートセルを取得
    if(! objTarget) return false;//シートセルが存在しない場合は操作失敗
    var jqTarget = $('#'+myId);
    var classes=jqTarget.attr('class').split(' ');
//シートセルのクラス名を検索して graph で開始する場合formの値を取得する
    for (var cix=0;cix<classes.length;cix++){
        if (classes[cix].indexOf('graph_') == 0){ myForm=classes[cix].replace(/^graph_/,'');break; };
    };
    if(typeof myForm == 'undefined') {return false};//指定無しでかつ取得に失敗した場合はリターン(印刷時に有効)

/*
    区間描画時に形成されたIDの場合はパーセンテージを分解して描画する  開始・終了率を先行して分離
    終了率が省略された場合は、開始率で補う
    キーワードとして m,l,s が 100,50,25 を表す。
*/
    if(myForm.match(/(.*)_(\d+)(\-(\d+))?$/)){
            myForm=RegExp.$1; arguments[2]=(RegExp.$2/100);
        if(RegExp.$4){
            arguments[3]=(RegExp.$4/100);
        }
    }else if(myForm.match(/(.*)_([mls])$/)){
        switch(RegExp.$2){
            case 'l':
                arguments[2]=(100/100);
            break;
            case 'm':
                arguments[2]=(50/100);
            break;
            case 's':
                arguments[2]=(25/100);
            break;
        }
    }
/*
    myForm を分解して目標形状、目標トラック、Cycle値を取得
*/
    var targetShape = (myForm.split('_')[0]).split('-')[0];//ターゲット形状
    var targetTrack = (myForm.match(/-(ref|stl|rmt|cam|sfx)/i))? RegExp.$1:"";//トラック指定  ヒットがない場合は全トラック適用
/*
    サイクルターゲットパラメータは配列で持つ  [参照値,母数]
*/
    var cycleTarget=[0,1];
    if (myForm.indexOf('evn')>=0){
        cycleTarget = [0,2];//evnを数値化
    } else if(myForm.indexOf('odd')>=0){
        cycleTarget = [1,2];//oddを数値化
    } else if(myForm.match(/\-(\d+)/)){
        cycleTarget = RegExp.$1;
        var myLength=Math.floor(cycleTarget.length/2);
        cycleTarget=[cycleTarget.slice(0,myLength),cycleTarget.slice(cycleTarget.length-myLength)];
    }

        if(! this.body[myId]){    this.body[myId] = document.getElementById("cgl"+myId)    ;}
        if( this.body[myId] ){
            $("#cgl"+myId).remove();delete this.body[myId];
        //二重描画防止の為すでにエレメントがあればクリアして描画
        }
/*
    以下の場合分けは、ノーマル時の処理とAIR環境のバグ回避コード
    先の処理のほうがオーバヘッドが小さいので推奨だが、AIRで正常に処理されない
- td配下に置いたcanvasエレメントが、position=absoluteを指定するとページ全体又はテーブルを包括するdivの原点をベースに描画される。
- element.top/.left で指定した座標が反映されないことがある  element.style.top/.left は正常
 動作異状の検出ルーチンはまだ組んでいない。ビルド毎にAIRに当該のバグがあるか否か確認が必要
 2016.11.12
*/
if(appHost.platform != "AIR"){
        var objParent = objTarget;
        var myTop     = "0px";
        var myLeft    = "0px";
}else{
        var objParent  = ((xUI.viewMode == "Scroll")&&(myId.indexOf("r")==0))?
                    document.getElementById("UIheaderScrollV-table"):
                    document.getElementById("page_1");
//                    document.getElementById("qdr4");
//        var targetRect = objTarget.getBoundingClientRect();
//        var parentRect = document.getElementById("sheet_body").getBoundingClientRect();
        var myTop     = objTarget.offsetTop  + "px";
        var myLeft      = objTarget.offsetLeft + "px";
}
/**
    formCache  を作成する
    単一セルに対するformは初回描画時にpngにレンダリングCacheに格納される
    ２度め以降はその都度利用される。
    トランジション系は形状が安定しないため都度描画
*/
    if(xUI.Cgl.formCashe[myForm]){
        var element = new Image(objTarget.clientWidth,objTarget.clientHeight); 
        element.id      = 'cgl' + myId; 
        element.className   = 'cgl';
        element.style.top  = myTop
        element.style.left = myLeft;
        element.src = xUI.Cgl.formCashe[myForm];
    }else{
        var element = document.createElement('canvas'); 
        element.id      = 'cgl' + myId; 
        element.className   = 'cgl';
        
//        element.style.position="absolute";
        element.style.top  = myTop
        element.style.left = myLeft;
        element.width  = objTarget.clientWidth;
        element.height = objTarget.clientHeight;
        var ctx = element.getContext("2d");

switch(targetShape){
case "blankCloss":;        //transition
/*
    ブランク用ばつ印
    セルいっぱいに描く
*/        var lineWidth  =4;
        ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
        ctx.strokeWidth=lineWidth;
        ctx.moveTo(element.width, 0);//
        ctx.lineTo(0,element.height);
        ctx.moveTo(0, 0);//
        ctx.lineTo(element.width,element.height);
        ctx.stroke();
break;case "line":        //vertical-line
/*
case "line-ref":        //vertical-line
case "line-cam":        //vertical-line
case "line-sfx":        //vertical-line
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
        var lineWidth  =3;
        ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
        ctx.strokeWidth=lineWidth;
        ctx.moveTo(element.width*0.5, 0);
        ctx.lineTo(element.width*0.5, element.height);
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "wave":;            //wave-line
/*
奇遇フレームのみでなくサイクル動作するフォームを全てサポートする
Waveは奇遇サイクル
case "wave-odd":;        //wave-line 偶数フレーム
case "wave-evn":;        //wave-line 奇数フレーム
case "wave-ref-odd":;        //wave-line 偶数フレーム
case "wave-ref-evn":;        //wave-line 奇数フレーム
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
        var waveSpan  =(arguments[2])? element.width*arguments[2]/2:element.width/4;
        //var waveSpan  =7.5;
        var lineWidth  =3;
        ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
        ctx.strokeWidth=lineWidth;
        ctx.moveTo(element.width*0.5, 0);
        if(cycleTarget[0]%cycleTarget[1]){
    ctx.bezierCurveTo(element.width*0.5-waveSpan, element.height*0.5,element.width*0.5-waveSpan, element.height*0.5,  element.width*0.5, element.height);
        }else{
    ctx.bezierCurveTo(element.width*0.5+waveSpan, element.height*0.5,element.width*0.5+waveSpan, element.height*0.5,  element.width*0.5, element.height);
        }
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "shake":;            //shake-line
/*
シェイク形状は、大中小の副形状をサポートする  ウェーブと初期位相を反転させる
case "shake-odd":;        //shake-line 偶数フレーム
case "shake-evn":;        //shake-line 奇数フレーム
case "shake-cam-odd":;        //shake-line 偶数フレーム
case "shake-cam-evn":;        //shake-line 奇数フレーム
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
        var shakeSpan  =(arguments[2])? element.width*arguments[2]/2:element.width/4;
        var lineWidth  =2;
        ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
        ctx.strokeWidth=lineWidth;
        ctx.moveTo(element.width*0.5, 0);
        if(cycleTarget[0]%cycleTarget[1]){
    ctx.lineTo(element.width*0.5+shakeSpan, element.height*0.5);
    ctx.lineTo(element.width*0.5, element.height);
        }else{
    ctx.lineTo(element.width*0.5-shakeSpan, element.height*0.5);
    ctx.lineTo(element.width*0.5, element.height);
        }
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "fi":;        //fade-in
    var startValue = arguments[2]; var endValue= arguments[3];
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo((1-startValue)*element.width*0.5, 0);
        ctx.lineTo(element.width-(1-startValue)*element.width*0.5,0);
        ctx.lineTo(element.width-(1-endValue)*element.width*0.5,element.height);
        ctx.lineTo((1-endValue)*element.width*0.5,element.height);
        ctx.fill();
break;
case "fo":;        //fade-out
    var startValue = arguments[2]; var endValue= arguments[3];
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo(startValue*element.width*0.5, 0);
        ctx.lineTo(element.width-startValue*element.width*0.5,0);
        ctx.lineTo(element.width-endValue*element.width*0.5,element.height);
        ctx.lineTo(endValue*element.width*0.5,element.height);
        ctx.fill();
break;
case "transition":;        //transition
    var startValue = arguments[2]; var endValue= arguments[3];
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo(startValue*element.width, 0);//
        ctx.lineTo(element.width-startValue*element.width,0);
        ctx.lineTo(element.width-endValue*element.width,element.height);
        ctx.lineTo(endValue*element.width,element.height);
        ctx.fill();
break;
case "circle":;         //circle
/*
case "circle-ref":;     //circle-reference
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
        var phi  = .9;        var lineWidth  =3;
        ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
        ctx.strokeWidth=lineWidth;
        ctx.arc(element.width * 0.5, element.height * 0.5, element.height*phi*0.5, 0, Math.PI*2, true);
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "triangle":;        //triangle
/*
case "triangle-ref":;    //triangle
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
        var lineWidth  =4;
        ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
        ctx.strokeWidth=lineWidth;
        ctx.moveTo(element.width*0.5, -1);
        ctx.lineTo(element.width*0.5 + (element.height-2)/Math.sqrt(3), element.height-2);
        ctx.lineTo(element.width*0.5 - (element.height-2)/Math.sqrt(3), element.height-2);
        ctx.closePath();
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "sectionOpen":;        //sectionOpen
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
    var formFill = arguments[2];
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo(element.width * 0.5 - element.height/Math.sqrt(3), 0);
        ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), 0);
        ctx.lineTo(element.width * 0.5 , element.height);
        ctx.closePath();
        if(formFill) {ctx.fill();}else{ctx.stroke();}
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "sectionClose":;        //sectionClose
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
    var formFill = arguments[2];
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo(element.width * 0.5, 0);
        ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), element.height);
        ctx.lineTo(element.width * 0.5 - element.height/Math.sqrt(3), element.height);
        ctx.closePath();
        if(formFill) {ctx.fill();}else{ctx.stroke();}
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "dialogOpen":;        //dialogsectionOpen
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
    var lineWidth = 3;
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo(0, element.height-lineWidth);
        ctx.lineTo(element.width, element.height-lineWidth);
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "dialogClose":;        //dialogsectionClose
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
    var lineWidth = 3;
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.moveTo(0, lineWidth);
        ctx.lineTo(element.width, lineWidth);
        ctx.stroke();
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
case "areaFill":;    //fill sheet cell
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
        ctx.moveTo(0, 0);
        ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
        ctx.fillRect(0, 0, targetRect.width, targetRect.height);
        xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
    }
break;
}
    }
        element=objParent.appendChild(element); 
//        element=objTarget.appendChild(objParent);
//        element.top = myTop;
//        element.left= myLeft;
//        element.style.zIndex=1;//シートに合わせて設定
//        element.style.pointerEvents='none';//イベントは全キャンセル
//        element.style.brendMode="multiply";//乗算
//        element.style.opacity="0.2";//30%
this.body[myId]=element;
this.body[myId].formProp=myForm;

return element;
}
/**
 *  @params {String} myId
 *        シートセルID "0_0","0_1"...
 *  @params {String} myForm
 *        図形キーワード transition
 *  @params {String} myDuration
 *    トランジション系セクションを一括描画するラッパー関数
 *   この関数を使用する場合は直接Gcl.drawを呼ばないようにすること。
 */
xUI.Cgl.sectionDraw = function(myId,myForm,myDuration){
    var Idx=myId.split("_").reverse();
    for (var offset = 0;offset< myDuration;offset ++){
//編集エリアとリファレンスエリアで分岐
        if(Idx.length==2){
//編集エリア
          //this.draw(       [Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
          $('#'+[Idx[1],parseInt(Idx[0])+offset].join('_')).addClass('graph_'+myForm+'_'+String(parseInt(100 * offset / myDuration))+'-'+String(parseInt(100 *((offset+1) / myDuration))));
        }else{
//リファレンスエリア()
          //this.draw([Idx[2],Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
          $('#'+[Idx[2],Idx[1],parseInt(Idx[0])+offset].join('_')).addClass('graph_'+myForm+'_'+String(parseInt(100 * offset / myDuration))+'-'+String(parseInt(100 *((offset+1) / myDuration))));
        };
    };
}
/**
 *     sessionRetrace 値の更新
 *     サーバ上での更新状態を示す
 *  @returns {Number}
 *      更新後の xUI.sessionRetrace 値
 *     -1  エントリがリポジトリ上にない
 *     0   最新のデータ = 作業続行可能
 *     1~  番号が増えるに従って1世代づつ古いデータとなる
 */
xUI.setRetrace = function(){
/*    var myIdentifier = Xps.getIdentifier(xUI.XPS);
    var currentEntry = serviceAgent.currentRepository.entry(myIdentifier);
    if((currentEntry)&&(xUI.uiMode!='floating')){
        for (var ix=0;ix<currentEntry.issues.length;ix++){
            if(Xps.compareIdentifier(currentEntry.toString(ix),myIdentifier)>4){
                xUI.sessionRetrace = ix;
                break;
            }
        }
    }else{
        xUI.sessionRetrace = -1;    
    } // */
    var myIdentifier = nas.Pm.getIdentifier(xUI.XMAP);
    var currentEntry = serviceAgent.currentRepository.entry(myIdentifier);
    if (xUI.XMAP.dataNode){
//エントリリストのデータから求めるのでなく nodeChartから求める
/*        for (var ix=0;ix<currentEntry.issues.length;ix++){
            if(Xps.compareIdentifier(currentEntry.toString(ix),myIdentifier)>4){
                xUI.sessionRetrace = ix;
                break;
            }
        };//*/
//
                xUI.sessionRetrace = 0;
    }else{
        xUI.sessionRetrace = -1;    
    }
    return xUI.sessionRetrace;
}
/*

*/
/**
 *  @params {Object Xps} editXps
 *      主ターゲットXps　省略可
 *  @params {Object Xps} referenceXps
 *      参照ターゲットXpa  省略可
 *  @params {Function} callback
 *      終了コールバック関数  省略可
 *
 *  xUIにターゲットオブジェクトを与えてシートをリセットする関数<pre>
 *  初期化手順を用いていた部分の置換え用途で作成
 *  初期化手順内でもこの手続を呼び出すように変更
 *  この手続内では基本的にundo処理は行わない
 *  したがって必要に従ってこの手続を呼ぶ前にundoの初期化を行うか、またはundo操作を行う必要がある。
 *  引数省略時は画面のリフレッシュのみを行う。
 *  画像マスター時の処理を追加実装
 *      viewMode=='Scroll' の場合は画像表示をキャンセル（将来はサポート）
 *      202302 現在画像マスター状態の場合 Scroll(スクロール)モードをキャンセル(将来サポート?)
 *      callback関数を持てるように変更
 *      202505 Scroll(scroll) WordProp(page)  モードの動作を再定義
 *      202506 Scroll | PageImage モードとして統合
 *      ページモードをフルセット スクロールモードはTDTS互換のサブセットと位置づける
 *  シートヘッダーとページヘッダを分ける（第一ページのページヘッダをUIシートヘッダーと切り分ける）
 *      ページモードでのページヘッダにUI機能を割り付ける
 *  Xps編集画面が非表示の場合、リフレッシュを保留する。
 *  Xps編集画面表示時に保留フラグがある場合リフレッシュを強制的に行う。
 */
xUI.resetSheet = async function(editXps,referenceXps,callback){
console.log('xmap|xpst reset : activeDocument id : '+ xUI.activeDocumentId);
    if(
        (xUI.activeDocumentId <= 0)||
        (xUI.XPS !== xUI.documents[xUI.activeDocumentId].content)
    ){
//表示アイテムがxMapの場合はスキップ
console.log('skip data refresh');
        xUI.delayRefreash = true;
        return ;
    };
//UI切り替え 切り替え操作時のみ呼び出しとなるようにポイントへ移動か？
    if(xUI.restriction){
            $('#docImgAppearance').hide();//scroll
            $('#documentHdUI').hide();//ヘッダUI
    }else{
        if(xUI.viewMode == 'PageImage'){
            $('#docImgAppearance').show();//pageImage専用コントローラ
            $('#documentHdUI').hide();//ヘッダUI
        }else{
            $('#docImgAppearance').hide();//scroll
            $('#documentHdUI').show();//ヘッダUI
        };
    };
//現在のカーソル配置をバックアップ
    var restorePoint     = this.Select.concat();
    var restoreSelection = this.Selection.concat();
    this.selection();//選択解除
//画像編集状態
    if(xUI.canvas){
//編集中事前処理
        xUI.canvasPaint.syncColors();
        xUI.canvasPaint.syncCommand();
        xUI.canvasPaint.syncTools();
    };
//画像表示状態をバックアップ
//    var appearance = xUI.setAppearance();
//    var scale      = xUI.viewScale;
//    var scrollPt   = window.
//
    var reWriteXPS = false;
    var reWriteREF = false;
    var Refstatus = (document.getElementsByClassName('rnArea').length > 0)? $('.rnArea').isVisible():true;
    if(! Refstatus) xUI.flipRefColumns('show');
/*
    引数にeditXPSが与えられなかった場合は、現在のXPSのまま処理を続行（画面のrefreshのみを行う）
    sheetLooksのみ更新が行われる可能性あるので要注意
    その場合、トラックの調整があり得るがここでは関与しない 呼び出し側で事前の処理をすること
 */
    if ((typeof editXps != "undefined") && (editXps instanceof Xps)){
//編集エリアに対するreadINの条件判定
//      xUI.uiMode=='production' のケースではSCi情報を保持する
//      それ以外のケースでは引数側の情報で上書きされる
        var propertyBackup = Xps.parseIdentifier(Xps.getIdentifier(xUI.XPS));
        this.XPS.parseXps(editXps.toString(false));//XPSをバッファ更新
        // 書換え範囲にXPS全体を追加
        reWriteXPS = true;
    };
/*
        引数に参照シートが渡されていたら、優先して解決
        指定のない場合は現在の参照シートを保持して使用
 */
    if ((typeof referenceXps != "undefined") && (referenceXps instanceof nas.Xps)){
        xUI.referenceXPS = referenceXps;
        // 書換え範囲に 参照XPS全体を追加
        reWriteREF = true;
    };
//  バックアップしたカーソル位置が新しいシートで範囲外になる場合は範囲内にまるめる
    if(restorePoint[0] >= xUI.XPS.xpsTracks.length)   restorePoint[0] = xUI.XPS.xpsTracks.length -1;
    if(restorePoint[1] >= xUI.XPS.xpsTracks.duration) restorePoint[1] = xUI.XPS.xpsTracks.duration -1;
//幅計算に先立って xpsTracks.areaOrderを更新
    xUI.XPS.xpsTracks.initAreaOrder(); xUI.XPS.xpsTracks.assignAreaOrderMember();
//表示プロパティのリフレッシュを行う  シートが変更されていなければ不用
    xUI._checkProp();
//セルグラフィック初期化( = 画面クリア)
//    this.Cgl.init();
//タイムシートテーブルボディ幅の再計算
    var tableReferenceWidth =  this.sheetLooks.ActionWidth * this.referenceLabels.length;
    var tableEditWidth = (
        this.sheetLooks.DialogWidth       * this.dialogCount + 
        this.sheetLooks.SheetCellWidth    * this.timingCount +
        this.sheetLooks.StillCellWidth    * this.stillCount +
        this.sheetLooks.SfxCellWidth      * this.sfxCount +
        this.sheetLooks.GeometryCellWidth * this.stageworkCount +
        this.sheetLooks.CameraCellWidth   * this.cameraCount +
        this.sheetLooks.TrackNoteWidth    * this.noteCount +
        this.sheetLooks.CommentWidth
    );//タイムシートの基礎トラック専有幅を算出
    var tableColumnWidth = this.sheetLooks.TimeGuideWidth + tableReferenceWidth + tableEditWidth;
    var tableBodyWidth   = tableColumnWidth * this.PageCols + (this.sheetLooks.ColumnSeparatorWidth * (this.PageCols-1));
//  UI上メモとトランジション表示をシート表示と切り分けること 関連処理注意
    xUI.sync("memo");
//  マスターデータが画像の場合の表示を更新(同期)
//    xUI.sync("xpstImage");
//  シートボディの表示
    if(this.viewMode=="Scroll"){
//コンパクト|スクロールモード  スクロールUI用のラベルヘッダーを作成
        document.getElementById("UIheaderFix").innerHTML     = this.pageView(-1);//qdr2
        document.getElementById("UIheaderScrollH").innerHTML = this.pageView(0) ;//qdr1
        document.getElementById("UIheaderScrollV-table").innerHTML = this.pageView(-2);//qdr3
        document.getElementById("UIheader").style.display    = "inline";
//        document.getElementById("UIheaderLeft").style.display    = "inline";
//スクロールUI時は1ページ限定なのでボディ出力を１回だけ行う
        var SheetBody = '<div id=printPg1 class=printPage>';
        SheetBody += '<div class=headerArea id=pg1Header>';
        SheetBody += this.headerView(1);
        SheetBody += '</div>';//UI調整用に１行（ステータス行の分）<br><div id=spcHd class=application_status ><br></div>
        SheetBody += this.pageView(1);
        SheetBody += '</div>';
    }else{
//ページモード  スクロールUI用のラベルヘッダーを隠す
        if(document.getElementById("noteImageField")) document.getElementById("noteImageField").style.display="none";
        if(document.getElementById("UIheader"))       document.getElementById("UIheader").style.display="none";
//        if(document.getElementById("UIheaderLeft"))   document.getElementById("UIheaderLeft").style.display="none";
        var SheetBody='';
        for (var Page=1 ;Page <=Math.ceil(xUI.XPS.duration()/this.PageLength);Page++){
            SheetBody += '<div id=printPg'+String(Page) +' class=printPage>';
            SheetBody += '<div class=headerArea id=pg'+String(Page)+'Header>';
            SheetBody += this.headerView(Page);
            SheetBody += '</div><span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
            SheetBody += this.pageView(Page);
            SheetBody += '</div>';
        };
    };
console.log(SheetBody);
//  sheet_body配下のエレメントを削除
    var sheet_body = document.getElementById("sheet_body");
    while (sheet_body.firstChild) {
        sheet_body.removeChild(sheet_body.firstChild);
    };
//  シートボディを締める
    sheet_body.innerHTML = SheetBody+"<div class=\"screenSpace\"></div>";
// モードに関わらずドキュメントイメージ要素があれば内容を再配置
//syncメソッドに渡すことを検討 syncNoteImage
//*****
//タイムシート画像再配置(ドキュメント画像またはドキュメントテンプレート画像・ページモードのみ)
if(xUI.viewMode == 'PageImage'){

    var imgs = document.querySelectorAll('.overlayDocmentImage');
    var ix   = 0;
    imgs.forEach(function(e){
        ix = nas.parseNumber(e.id);
console.log(e.id,)
//        if(xUI.viewMode == 'WordProp'){
//            e.style.top = -(xUI.sheetLooks.SheetHeadMargin-document.getElementById('0_0').offsetTop +3)+'px';//?
//        }
//        e.style.top = e.parentNode.parentNode.offsetTop+'px';//常時 0px

        if(documentFormat.active){
            var docImg = e.appendChild(documentFormat.img);
            docImg.style.width = (docImg.naturalWidth *96 / nas.NoteImage.guessDocumentResolution(docImg,'A3')) +'px';//A3 width 96ppi
        }else{
            if(
                (xUI.XPS.timesheetImages.members[ix])&&
                (xUI.XPS.timesheetImages.members[ix].content != '')&&
                (xUI.XPS.timesheetImages.members[ix].img)
            ){
//ドキュメントイメージ配置 img==null(content=='')のケースあり
console.log(xUI.XPS.timesheetImages.members[ix].img);
                var docImg = e.appendChild(xUI.XPS.timesheetImages.members[ix].img);
                docImg.id  = "pageImage-"+ (ix+1);//uniqe id
                docImg.className = "pageDocumentImage";//image class name
                docImg.style.width = (xUI.XPS.timesheetImages.members[ix].img.naturalWidth *96 / xUI.XPS.timesheetImages.members[ix].resolution) +'px';//A3 width 96ppi
//ドキュメントcanvasBuffer配置 canvas==nullのケースあり
            }else{
//フォーマットテンプレート画像を再配置
                var docImg = e.appendChild(new Image());
                if(xUI.XPS.sheetLooks.TemplateImage == ""){
                    xUI.XPS.sheetLooks.TemplateImage = documentFormat.TemplateImage;//フォーマッタから転記
                };
                docImg.src = xUI.XPS.sheetLooks.TemplateImage;//ドキュメントが持つテンプレート画像

//                docImg.id  = "pageImage-"+ (ix+1);//uniqe id
                docImg.id  = "pageTemplateImage-"+ (ix+1);//uniqe id

                docImg.className = "pageDocumentImage";//image class name
                docImg.addEventListener('load',function(){
                docImg.style.width = (docImg.naturalWidth *96 / nas.NoteImage.guessDocumentResolution(docImg,'A3')) +'px';//"1122px = 297mm 96ppi;A3 width 96ppi 推定処理
                },{once:true});
            };
//svg contentデータがあれば読み込み時にsvgに展開する（ここでは行わない）
            if(
                (xUI.XPS.timesheetImages.members[ix])&&
                (xUI.XPS.timesheetImages.members[ix].svg)&&
                (xUI.XPS.timesheetImages.members[ix].svg instanceof HTMLElement)
            ){
console.log(xUI.XPS.timesheetImages.members[ix].svg);
                e.appendChild(xUI.XPS.timesheetImages.members[ix].svg);
            };
        };
    });
};
//***** 
//ノート画像再配置
if(xUI.viewMode == 'Scroll'){
    if(document.getElementById('noteImageField')){
        xUI.XPS.noteImages.members.forEach(function(e){
            if(e.type =='cell'){
                if(xUI.XPS.xpsTracks.getAreaOrder(e.link).fix){
                    document.getElementById('areaFixImageField').appendChild(e.svg);
                }else{
                    document.getElementById('noteImageField').appendChild(e.svg);
                };
            };
        });
    };
};
//ディスクリプション画像再配置
    var dsImg = xUI.XPS.noteImages.getByLinkAddress('description:');
    if(dsImg){
        document.getElementById('memo_image').appendChild(dsImg.svg)
    }
//編集中の画像を再配置
    if(xUI.canvas){
        xUI.canvasPaint.wrapParent = document.getElementById(xUI.canvasPaint.wrapParent.id);
        xUI.canvasPaint.wrapParent.appendChild(xUI.canvasPaint.canvasWrap);
        if(xUI.canvasPaint.targetItem.type=='cell'){
            var linkElement = document.getElementById(xUI.canvasPaint.targetItem.link);//cell-id
console.log(linkElement);
console.log([linkElement.offsetLeft+xUI.canvasPaint.targetItem.offset.x.as('px'),linkElement.offsetTop+xUI.canvasPaint.targetItem.offset.y.as('px')]);

            xUI.canvasPaint.canvasWrap.style.left  = (linkElement.offsetLeft + xUI.canvasPaint.targetItem.offset.x.as('px'))+'px';
            xUI.canvasPaint.canvasWrap.style.top   = (linkElement.offsetTop  + xUI.canvasPaint.targetItem.offset.y.as('px'))+'px';
        };
    };
//if(documentFormat.orderbox) document.getElementById('sheet_body').appendChild(documentFormat.orderbox);

// グラフィックパーツを配置(setTimeoutで無名関数として非同期実行)
    window.setTimeout(function(){
        xUI.syncSheetCell(0,0,false);//シートグラフィック置換
        xUI.syncSheetCell(0,0,true);//referenceシートグラフィック置換
//フットスタンプの再表示
        if(xUI.footMark) xUI.footstampPaint();
//  カーソル位置復帰（範囲外は自動でまるめる）
        xUI.selectCell(restorePoint);
        xUI.selection(add(restorePoint,restoreSelection));
//ドキュメントモードに従って画像アピアランスを設定
/*        if(xUI.XPS.imgMaster()){
            if(xUI.XPS.timesheetImages.imageAppearance == 0) xUI.setAppearance(1,true);//xUI.XPS.timesheetImages.imageAppearance;
        }else{
            if(xUI.XPS.timesheetImages.imageAppearance >= 1) xUI.setAppearance(0,true);
        };// */
    },0);
//    this.bkup([xUI.XPS.xpsTracks[1][0]]);
//画像部品の表示前のカーソル位置描画,'width':markerWidth
//    this.selectCell(restorePoint);
//    this.selection(restoreSelection);
//    this.selection(add(restorePoint,restoreSelection));
//セクション編集状態であれば解除
    if(this.edmode>0){this.mdChg('normal');}
//表示内容の同期
    xUI.sync("tool_");
    xUI.sync("info_");
/*
    viewMode設定
    viewModeは、UIの状況 (Compact|Page)|(WordProp|Scroll)|(Image)
*/
//コンパクトモードが有効 docImage非表示
    if(xUI.viewMode == "Scroll"){
//ロゴ
//        $("#logoTable").hide();
//第二カウンタ
        $("#fct1").hide();
//ツールバーボタン
        $("#ok").hide();
        $("#ng").hide();
//シートヘッダ
//        $("#opusL").hide();
//        $("#titleL").hide();
//        $("#subtitleL").hide();
        $("#nameL").hide();
//        $("#opus").hide();
//        $("#title").hide();
//        $("#subtitle").hide();
        $("#update_user").hide();
//メモエリア 切り替えなし
//        $("#memoArea").hide();
//タイムラインヘッダ
        $("#UIheader").show();
        if(document.getElementById("UIheaderScrollV-table").innerHTML==""){document.getElementById("UIheaderScrollV-table").innerHTML=xUI.pageView(-2);};
//        $("#UIheaderFix").show();
//        $("#UIheaderScroll").show();
//タグ表示域高さ調整
        $('.tlhead').each(function(){$(this).height($('#tlheadParent').height())});
    }else{
//ロゴ
//        $("#logoTable").show();
//        $("#headerLogo").show();
//第二カウンタ
        $("#fct1").show();
//ツールバーボタン
        $("#ok").show();
        $("#ng").show();

//シートヘッダ
//        $("#opusL").show();
//        $("#titleL").show();
//        $("#subtitleL").show();
        $("#nameL").show();
//        $("#opus").show();
//        $("#title").show();
//        $("#subtitle").show();
        $("#update_user").show();
//メモエリア
//        $("#memoArea").show();
//タイムラインヘッダ
        $("#UIheader").hide();
        $("#UIheaderScrollV-table").html("");

//        $("#UIheaderFix").hide();
//        $("#UIheaderScroll").hide();
    };
//===================== トラックラベルの高さ調整
        var ht=0;
        Array.from(document.getElementsByClassName('trackLabel-tall')).forEach(function(e){if(ht < e.clientHeight) ht = e.clientHeight});
        nas.HTML.setCssRule('.trackLabel-tall','height:'+ht+'px;'); // */
//===================== ヘッダ高さの初期調整
    this.adjustSpacer();
//===================== 入力モードスイッチ初期化
    sync('ipMode');
/* エンドマーカー位置調整 はadjustSpacerに内包
//印字用endマーカーは  印刷cssを参照して誤差を反映させること  フレームのピッチを計算すること
印刷画面は印刷画面出力時に再度同メソッドで調整  トラック間の
xUI.replaceEndMarker([トラック数,フレーム数],上下オフセットpx);
 */
    xUI.replaceEndMarker(xUI.XPS.xpsTracks.duration);
console.log('marginmarker');
    xUI.placeMarginMarker();
if(! Refstatus) xUI.flipRefColumns('hide');
    if(xUI.viewMode != "Scroll") xUI.setAppearance();
    if(reWriteXPS) reWriteTS();
console.log('reset Sheet ');
console.log(callback);
    if(callback instanceof Function) callback();
    return ;
};

//test-    xUI.resetSheet(new nas.Xps(3,24),new nas.Xps(5,72));
/**
 *   @params {Number} page
 *   指定のドキュメントページを表示する（指定以外のページを隠す）
 *   存在しないページが指定された場合はすべてのページを表示する
 */
xUI.showPage = function showPage(page){
    if (xUI.XPS instanceof Xps){
        var pgStart = 1;
        var pgEnd   = Math.ceil(xUI.XPS.duration()/xUI.PageLength);
        if((page > 0)&&(page <= pgEnd)){
            for (var pg = pgStart ;pg <= pgEnd ;pg++){
                if(pg == page){
                    $('#printPg'+String(pg)).show();
                }else{
                    $('#printPg'+String(pg)).hide();
                };
            };
        }else{
            for (var pg = pgStart ;pg <= pgEnd ;pg++){
                $('#printPg'+String(pg)).show();
            };
        };
    };
    xUI.replaceEndMarker();
}

/**
 *     tcサブコントロールに設定してターゲット要素の値を編集する関数.
 * 
 *     関数の最期にonChangeがあれば実行
 * 
 * 
 *     @params {Stirng}    targetId   ターゲット要素のIDまたはターゲット要素
 *     @params {Number}    tcForm     使用するTC型式
 *     @params {Numder}    myStep     クリック毎に加算するフレーム数
 */
xUI.tcControl = function(targetId,tcForm,myStep){
    var myTarget = document.getElementById(targetId);
    myTarget.value=nas.Frm2FCT(nas.FCT2Frm(myTarget.value)+myStep,tcForm,0,this.XPS.framerate);
    if(document.getElementById(targetId).onchange) document.getElementById(targetId).onchange();
    return false;
}
/*
    xUI.XPS < 編集対象のXpstが参照される
    xUIに編集対象Xpsトレーラを増設
    各Xpsごとにテータスを持つのでそれを参照して切り替えを行うようにする
*/
/** タブコントロール
引数 tabID 0:project 1~ :Xpst 1~

0
    xmap    if(xpst1)? left-active-overlay:left-active;
    xpst    if(xpst[ix+1])? right-dectivate:mid-deactivate-overlay;   
1~
    xmap    if(xpst[1] == active)? left-dective:left-deactive-overlay;
    xpst    if(xpst[ix+1])? mid: right;
            if(idx==ix)? active:(midd) ? dective-overlay : deactive;
*/
xUI.tabSelect =function(tabId){
        if(xUI.activeDocumentId != tabId){xUI.activateDocument(tabId)}
    if(tabId){
        $('.xpst').show();$('.xmap').hide();
    }else{
        $('.xpst').hide();$('.xmap').show();
    }
    xUI.adjustSpacer();
    return xUI.activeDocumentId;
}
/**
 *  ドキュメントタブ再描画
 */
xUI.reDrawDocumentTab = function(){
    if(document.getElementById('tabSelector-doc')){
        var uiContent='';
        uiContent += '\n<!-- タブコントロール -->\n'
        uiContent += '<button id ="tab_0" class ="tabControll tabControll-xmap" onClick = xUI.tabSelect(0);>'
        uiContent += this.documents[0].content.pmu.opus.toString();
        uiContent += '</button>';
        for (var dix = 1 ; dix < this.documents.length ; dix++){
            uiContent += '<button id="tab_'+dix
            uiContent += '" class="tabControll tabControll-xpst" '
            uiContent += 'onClick ="xUI.tabSelect('+dix+');" >';
            uiContent += this.documents[0].content.pmu.inherit[dix-1].toString('full');
            uiContent += '</button>'
        }
        uiContent += '<button id="tab_end" class="tabControll tabControll-end" disabled=true></button>';
        uiContent += '\n<!-- タブコントロール -->\n'

    document.getElementById('tabSelector-doc').innerHTML=uiContent;
//ここにカラーのリセットが必要
//  タブUIに背景色を設定
        $('.tabControll').css('background-color',this.sheetbaseColor);
    }
    xUI.activateDocument();
}
/**
 *  @params {Number Int} tabId
 *  複合ドキュメントのIdを指定してドキュメントをアクティブにする
 */
 xUI.activateDocument = function(documentId){
    if(typeof documentId == 'undefined') documentId = xUI.activeDocumentId;
//タブループ
    for (var tix=0;tix<this.documents.length; tix++){
//console.log('#tab_'+tix)
        var targetTab = $('#tab_'+tix);//タブ位置
        var prefix=(tix==0)?'left':'midd';//左タブ
        var currentStatus=(tix== xUI.activeDocumentId)?'active':'deactive';//処理中のタブの現ステータス
        var status=(tix==documentId)?'active':'deactive';//処理中のタブの新ステータス
        var currentPostfix=((prefix=='mid')&&(currentStatus=='deactive')&&(tix-1!=this.activeDocumentId))?'overlay':false;
        var postfix=((prefix=='midd')&&(status=='deactive')&&(tix-1!=documentId))?'overlay':false;
        var currentClass=(currentPostfix)?['tabControll',prefix,currentStatus,currentPostfix].join('-'):['tabControll',prefix,currentStatus].join('-');
        var newClass=(postfix)?['tabControll',prefix,status,postfix].join('-'):['tabControll',prefix,status].join('-');
//console.log([currentClass,newClass]);

        if(targetTab.hasClass(currentClass)){
//console.log("removeClass "+currentClass);
            targetTab.removeClass(currentClass);
        }
        if(!(targetTab.hasClass(newClass))){
//console.log("addClass "+newClass);
            targetTab.addClass(newClass);
        }
//console.log(document.getElementById('tab_'+tix));
        targetTab.prop("disabled", (documentId == tix));
        if(tix==(this.documents.length-1)){
            var endTab = $('#tab_end');
            var curreentEndClass = (currentStatus=='active')? 'tabControll-end-active':'tabControll-end-deactive';
            var newEndTabClass   = (status=='active')?     'tabControll-end-active':'tabControll-end-deactive';
            if(endTab.hasClass(curreentEndClass)){
                endTab.removeClass(curreentEndClass);
                endTab.addClass(newEndTabClass);
            }else{
                endTab.addClass(newEndTabClass);            
            }
        }
    }
    if(this.activeDocumentId != documentId) {
        this.documents[documentId].activate()
    }
    if(xUI.activeDocumentId > 0){
        if ($('#xmap').isVisible()){
            if((document.getElementById('qdr2'))&&(! $('#qdr2').isVisible())){
                $('#qdr2').show();
            }
            if((document.getElementById('qdr3'))&&(! $('#qdr3').isVisible())){
                $('#qdr3').show();
            }
            $('.xpst').show();
            $('.xmap').hide();
        }
    }else{
        if (!($('#xmap').isVisible())){
            if((document.getElementById('qdr2'))&&($('#qdr2').isVisible())){
                $('#qdr2').hide();
            }
            if((document.getElementById('qdr3'))&&($('#qdr3').isVisible())){
                $('#qdr3').hide();
            }
            $('.xpst').hide();
            $('.xmap').show();
        }
    }
    if((xUI.activeDocumentId > 0)&&(xUI.delayRefreash)){
        xUI.delayRefreash = false;
        xUI.resetSheet();
    }else{
        xUI.adjustSpacer();
    }
    xUI.sync('productStatus');
    return this.activeDocumentId;
}
/*ステージチャート表示UI */
xUI.stageChart = {};
//xUI.stageChart.
/**
    xUI.parsePathString
    URL文字列をチェックして、相対パスの解決をする
    /^[a-zA-Z]+:\/\/.+$/  URI書式のデータ → 処理不要・そのまま返す
    /^(\/[^\/]+|\\[^\\]+|[a-zA-Z]:\\)/ ローカルファイルでかつフルパス(ルートからのパス)で記載されている → 処理不要・そのまま返す
    /^\\\\.+/ windows UNCパス
*/
xUI.parsePath = function(pathString,baseURL){
//console.log(baseURL);
    if (! baseURL) baseURL = document.location.toString();
    if ((URL)&&(! (baseURL.match(/^[a-zA-Z]+:\/\/.+$/)))) baseURL = new URL(baseURL,document.location);
    if (URL) return new URL(pathString,baseURL);
    return new nas.File(pathString,baseURL);
}
/**
 *   カット番号ルーラーに値をセットする
 *  @params {number} value
 *       設定する値（配列可）
 *  @params {number} max
 *      最大値
 * maxの数が少ないとき10分割では目盛りの不整合が発生するので、しきい値以下の際に目盛りの数値を調整
 * 値が範囲外のときはマーカーを非表示
 */
xUI.setRuler = function setRuler(value,max){
if(!(document.getElementById('sliderCount'))) return;
    var currentValue = $('#sliderCount').text().split('/');
    if(!value) value = currentValue[0];
    if(!max)   max   = currentValue[1];
    var newValue = [value,max].join('/');
    if($('#sliderCount').text() != newValue){
        $('#sliderCount').text(newValue);
        if(currentValue[1]!= max){
            $('#sliderRuler-MAX').html($('#sliderRuler-MAX').html().replace(/^\s*\d+/,' '+max));
            for (var sid = 1 ; sid < 10 ; sid++){
//しきい値を設定
                var thl = 50;
                var rulerNum = max * (sid/10);
                if(max > thl){
                    rulerNum = Math.round(rulerNum);
                }else{
                    rulerNum =(rulerNum % 1 > 0)? "":rulerNum;
                }
                
                $('#sliderRuler-'+sid).text(rulerNum);
            }
        }
        if((currentValue[0]/currentValue[1]) != (value/max)){
            if((value <= 0)||(value > max)){
                $('#sliderRunner').hide();
            }else{
                var startOffset  = $('#sliderRuler-0').offset();
                var right = $('#sliderRuler-MAX').offset().left;
                if(!$('#sliderRunner').is(':visible'))$('#sliderRunner').show();
                $('#sliderRunner').css('left',((100*value)/max)+'%');
            }
        }
    }
}
/**
    カレントノード表示・セレクタ出力
    2020.06.11現在出力のみ
    ＊閲覧編集操作のためのポインタとしての役割を持つので
    カレントノード変数をドキュメントのカレントノード以外に
    アプリケーションレベルの操作一時変数として置いたほうが良い
    タイムシートドキュメントのカーソルと同様
    xUI.Document.
*/
xUI.setNodeSelector = function(){
	if(!(document.getElementById('compStageList'))) return;
//ライン
    var lineListContent = '';
    for(var lix = 0; lix < xUI.XMAP.pmu.nodeManager.lines.length ; lix ++){
        var currentLine = xUI.XMAP.pmu.nodeManager.lines[lix];
        lineListContent += '<span id = "boxLine_';
        lineListContent += currentLine.id.join('_');
        lineListContent += '" class = "nodeBox nodeBox-line ';
        if(currentLine===xUI.XMAP.pmu.currentNode.stage.parentLine){
            lineListContent += 'nodeBox-line_active';
        }else{
            lineListContent += 'nodeBox-line_compleated';//inactive?
        }
        lineListContent += '">';
        lineListContent += currentLine.toString(true)+'//';
        lineListContent += '</span>';
    }
    document.getElementById('lineList').innerHTML = lineListContent;
//ステージ
    var stageListContent = '';
    for(var six = 0; six < xUI.XMAP.pmu.currentNode.stage.parentLine.stages.length ; six ++){
        var currentStage = xUI.XMAP.pmu.currentNode.stage.parentLine.stages[six];
        stageListContent += '<span id = "boxStage_';
        stageListContent += currentStage.id;
        stageListContent += '" class = "nodeBox nodeBox-stage ';
        if(currentStage===xUI.XMAP.pmu.currentNode.stage){
            stageListContent += 'nodeBox-stage_active';
        }
        stageListContent += '">';
        stageListContent += currentStage.toString(true)+'//'+xUI.XMAP.pmu.currentNode.toString(true);
        stageListContent += '</span>';
    }
    document.getElementById('stageList').innerHTML = stageListContent;
//コンポジットライン
    var compLineContent = '';
    var compStageListContent = '';
    var compLine = xUI.XMAP.pmu.nodeManager.lines.composite;
    if(compLine){
        lineListContent += '<span id = "boxLine_';
        lineListContent += compLine.id.join('_');
        lineListContent += '" class = "nodeBox nodeBox-line ';
        lineListContent += 'nodeBox-line_active';
        lineListContent += '">';
        lineListContent += compLine.toString(true)+'//';
        lineListContent += '</span>';
//コンポジットステージ
        for(var six = 0; six < xUI.XMAP.pmu.nodeManager.lines.composite.stages.length ; six ++){
            var currentCompStage = xUI.XMAP.pmu.nodeManager.lines.composite.stages[six];
            compStageListContent += '<span id = "boxstage_comp_';
            compStageListContent += currentCompStage.id;
            compStageListContent += '" class = "nodeBox nodeBox-stage ';
            if(six == (xUI.XMAP.pmu.nodeManager.lines.composite.stages.length - 1)){
                compStageListContent += 'nodeBox-stage_active';
            }
            compStageListContent += '">';
            compStageListContent += six + ':TAKE-'+ (six+1);
            compStageListContent += '</span>';
        }
    }
    document.getElementById('compLine').innerHTML = compLineContent;
    document.getElementById('compStageList').innerHTML = compStageListContent;
}
/**
    UI上のxMapプロパティ表示部分
    @params {String|Array}  target
指定可能プロパティリストは以下

product
cutNo
inherit
stamp
stageSummary
posterPicture
assignment
assets

一連のupdateProp類は、アプリケーション別syncTableに移植予定 (2025 0725)
*/
xUI.setPropView = function(target){
    if (arguments.length <= 0) {
        target = ['all'];
    }
    if(! target instanceof Array) target = [target];
    for (var ix = 0 ;ix < target.length ; ix ++){
        switch(target[ix]){
        case 'product':
            this.updateProduct();
        break;
        case 'cutNo':
            this.updateCutBox();
        break;
        case 'inherit':
            this.updateInherit();
        break;
        case 'stamp':
            this.drawManagementSummary();
            this.updateManagementSummary();
        break;
        case 'managementStatus':
            this.drawManagementSummary();
            this.updateManagementSummary();
        break;
        case 'posterPicture':
            this.updateupdatePosterPicture();
        break;
        case 'assignment':
            this.updateAssignment();
        break;
        case 'assets':
            this.viewAssetBrowser();
        break;
        default:
        }
    }
}
/**
    画面上のプロダクト情報を更新 title|product
    @params {Object xMap}   targetXMAP
    @returns    {Object}
        プロダクト情報オブジェクト
    uaf|xmap handle
    syncTableに移動予定
*/
xUI.updateProduct=function(targetXMAP){
    if (! targetXMAP) targetXMAP = this.XMAP;
    if(document.getElementById('productBox')){
        document.getElementById('productBox_title').innerHTML    = (targetXMAP.pmu.title instanceof nas.Pm.WorkTitle)?targetXMAP.pmu.title.fullName :String(targetXMAP.pmu.title);
        document.getElementById('productBox_epNo').innerHTML     = (targetXMAP.pmu.opus instanceof nas.Pm.Opus)? targetXMAP.pmu.opus.name:String(targetXMAP.pmu.opus);
        document.getElementById('productBox_subtitle').innerHTML = targetXMAP.pmu.subtitle;
    };
    return targetXMAP.pmu.product;
}
/**
    画面上のカット番号情報を更新 inherit|cut
    @params {Object xMap}   targetXMAP
    @returns    {Object}
        プロダクト情報オブジェクト
*/
xUI.updateCutBox=function(targetXMAP){
    if (! targetXMAP) targetXMAP = this.XMAP;
    if(document.getElementById('cutBox')){
        document.getElementById('cutBox_epNo').innerHTML      = '<span class=xmap_productNumberSign># </span>' + ((targetXMAP.pmu.opus instanceof nas.Pm.Opus)? targetXMAP.pmu.opus.name:String(targetXMAP.pmu.opus));
        document.getElementById('cutBox_cutNumber').innerHTML = targetXMAP.pmu.inherit[0].toString();
    };
    return targetXMAP.pmu.inherit[0];
}
/**
    画面上の兼用情報を更新 inherit|cut
    @params {Object xMap}   targetXMAP
    @returns    {Object}
        兼用情報オブジェクト
*/
xUI.updateInherit=function(targetXMAP){
    if (! targetXMAP) targetXMAP = this.XMAP;
    if(document.getElementById('inheritBox')){
        var inheritContent = "";
        for (var ix = 0 ; ix < targetXMAP.pmu.inherit.length; ix ++){
            inheritContent += '<div id = "sciBox_' + String(ix);
            inheritContent += '" class = "productInherit">';
            inheritContent += targetXMAP.pmu.inherit[ix].toString();
//        if(targetXMAP.pmu.inherit[ix].time) inheritContent += '( '+ targetXMAP.pmu.inherit[ix].time +' )';
            inheritContent += '<button class ="xmap_property_edit iconButton-editItem"></button>';
            inheritContent += '</div>';
        };
        if(targetXMAP.pmu.inherit.length < 3){
            for (var ix = targetXMAP.pmu.inherit.length ; ix < 3; ix ++){
                inheritContent += '<div id = "sciBox_' + String(ix);
                inheritContent += '" class = "productInherit">';
                inheritContent += '<button class ="xmap_property_edit iconButton-addItem"></button>';
                inheritContent += '</div>'
            };
        };
        document.getElementById('inheritBox').innerHTML      =   inheritContent;
    };
    return targetXMAP.inherit;
}
/**
    画面上の指定情報を更新 memo|
    @params {Object xMap}   targetXMAP
    @returns    {String}
        処理指定テキスト
*/
xUI.updateNoteArea=function(targetXMAP){
    if (! targetXMAP) targetXMAP = this.XMAP;
    if(document.getElementById('noteArea_content')){
        var noteAreaContent = document.getElementById('noteArea_content').innerHTML;
//    var noteAreaContent = "";
        noteAreaContent += '<p>';
        noteAreaContent += targetXMAP.memo;
        noteAreaContent += '</p>';
//包括するXPSの現ステータスのnoteTextをすべて取得して合成する
        document.getElementById('noteArea_content').innerHTML      =   noteAreaContent;
    };
    return $('#noteArea_content').text();
}
/**
    画面のサムネイル（posterPicture）を更新
    @params {Object xMap}   targetXMAP
    @returns    {String}
        URLテキスト
*/
xUI.updatePosterPicture=function(targetXMAP){
    if (! targetXMAP) targetXMAP = this.XMAP;
    if(!(document.getElementById('posterPicuture_content'))) return ;
        var picGroup = targetXMAP.getElementGroupByName('posterPicture');//グループ取得に要置換
//console.log(picGroup instanceof xMap.xMapGroup);
    if((picGroup instanceof xMap.xMapGroup)&&(picGroup.elements.length)){
        var thumbnails = [];
        for (var eix = 0 ; eix < picGroup.elements.length ; eix ++){
            if(picGroup.elements[eix].content.source.file)
            thumbnails.push(xUI.parsePath(picGroup.elements[eix].content.source.file,xUI.XMAP.baseURL));//テスト用暫定コード
            /*本番用にはデータのベースロケーションとしてxMap.baseURLプロパティを置く*/
        }
        if(thumbnails.length){
            var htmlContent = "";
            for (var tix = 0;tix < thumbnails.length ; tix ++){
                htmlContent += '<img width=100% src="';
                htmlContent += thumbnails[tix];
                htmlContent += '">';
            };
console.log(thumbnails);
            document.getElementById("posterPicuture_content").innerHTML=htmlContent;
            return thumbnails.join();
        }
    }
    document.getElementById("posterPicuture_content").innerHTML="";
    return "<no picture>";
}
/**
 *    ステータス表示UIを更新
 *    （ノードチャート呼び出し|ジョブセレクタ|アサインメッセージ呼び出しUIを兼ねる）
 *    引数ナシ
 *    戻値ナシ
 */
xUI.updateStatus = function(){
    if(!(document.getElementById("pmsui"))) return;
    var currentNode  = xUI.XMAP.pmu.nodeManager.getNode();
    var currentStage = currentNode.stage;
    var currentLine  = currentStage.parentLine;
    var selectorContent = '<a class="dark" href="javascript:void(0);" onclick="xUI.sWitchPanel(\'NodeChart\')">';
    selectorContent += currentLine.toString(true);
    selectorContent += ' // ';
    selectorContent += currentStage.toString(true);
    selectorContent += '</a>';
    selectorContent += ' // ';
    selectorContent += '<select>';

    for (var j =0 ; j < currentStage.jobs.length ; j ++){
        selectorContent += '<option value="';
        selectorContent += currentStage.jobs[j].toString(true);
        selectorContent += '"';
        if(currentNode === currentStage.jobs[j]){
            selectorContent += 'selected >';
        }else{
            selectorContent += ' >';
        }
        selectorContent += currentStage.jobs[j].toString(true);
        selectorContent += '</option>';
    }
    selectorContent += '</select>';
    selectorContent += ' // ';
    selectorContent += (currentNode.jobStatus.content)? currentNode.jobStatus.content:'no-status';
    selectorContent += ' : ';
//ユーザがメッセージ閲覧可能な場合を後で判定
    if(
        (true)&&
        ((currentNode.jobStatus.assign)||(currentNode.jobStatus.message))
    ){
        selectorContent += '<button class="boxButton iconButton-message" onclick="alert(\'has message\')"></button>'
    }
        selectorContent += " ";
    document.getElementById("pmsui").innerHTML = selectorContent;

}
/**
    進行状況概要を描画
    @params {Object xMap}   targetXMAP
    @returns    {String}
        HTMLElementId-List
*/
/*
    [{label:{name},checkPoint:[targetList]},{label:{name},checkPoint:[targetList]}...]
*/
xUI.drawManagementSummary = function(targetXMAP){
    if (! targetXMAP) targetXMAP = this.XMAP;
    this.summaryGroup = [];
    for (var bix = 0; bix < nas.pmdb.pmTemplates.summary.length ; bix ++){
        var summaryLabel = nas.pmdb.pmTemplates.summary[bix].split('.');
        
        var eidx = this.summaryGroup.add(
            {name:summaryLabel[0],checkPoint:[]},
            function(a,b){return (a.name == b.name)}
        );
        this.summaryGroup[eidx].checkPoint.add(nas.pmdb.pmTemplates.summary[bix]);
    }
    if(document.getElementById("stamp_container")){
//<div id=stamp01_label class = stamp_label>演出</div>
//<div id=stamp02_label class = stamp_label>作画監督</div>
/*
<div class=stampBox>
<div id=stamp01_label class = stampBox_label>演出</div>
<div id=stamp01 class = stamp>{演出} </div>
</div>
*/
        var htmlContent = "";
        var boxCount = (this.summaryGroup.length < 6)? 6 : this.summaryGroup.length;
        for (var six = 0;six < boxCount ; six ++){
            htmlContent += '<div class="stampBox"><div id="stamp_'+six+'_label" class="stampBox_label">';
            htmlContent += (six < this.summaryGroup.length)? this.summaryGroup[six].name:"";
            htmlContent += '</div>';
            htmlContent += '<div id="stamp_'+six+'" class="stamp">';
            htmlContent += '</div></div>';
    };
        document.getElementById("stamp_container").innerHTML=htmlContent;
    };
    return this.summaryGroup;
}

/**
 *  ステージ進行状況を描画
 *
 */
/*  ステージの進行状況は、ノードの状態を先に構築してから作成する
 *  マネジメントノードオブジェクトのツリー状態は、
 *  1.表示用のライン配列コレクションを作成
 *  2.各ラインごとにテンプレートから表示用配列を作成
 *  3.実際のステージ進捗をトレースして表示配列の置換、または挿入をおこなう
 *  表示配列は、ノードツリーの表示にも利用されるので、xUIのプロパティとして管理する
 */
xUI.nodeChart = {
    selectedLine:"",
    selectedNode:"",
    setChart:null
};
/*
    ノードチャート出力
    (ノードセレクターを兼ねる)
    @params    {Array}    chart
    チャート配列を与える
    チャート配列の要素はラインチャートオブジェクト
    {
        name:<ライン識別名>,
        manager: [<UserInfo>,<Date>],
        staff: [<UserInfo>,<Date>],
        user: [<UserInfo>,<Date>],
        stages: [
            {
                name:<ステージ識別名>,
                nodes:[
                    {
                        name:<ジョブ識別名>,
                        token:<アクセストークン>
                    }...
                ]
            }...
        ],
        stageOffset;0,
        status: JobStatus {content: "Fixed", assign: "", message: "", stageCompleted: false}
    } 
*/
xUI.nodeChart.setChart = function(compChart){
    if(! compChart) compChart = xUI.XMAP.pmu.nodeManager.getChart();
//第一レコード以降を分離
    var chart = compChart.slice(1);
//最小テーブル幅を６フィールド分確保
    var chartWidth  = (chart.length < 5) ? 6 : (chart.length + 1);
    var chartHeight = 0;//0で初期化する
//最小テーブル高をラインテンプレートの工程数+
/*
    高さは、(ラインラベル+最多工程ラインの工程数)× 2 + 1
    各ラインの工程数は、テンプレートの工程と実施済み工程を比較して表示用のテーブルをビルドして導く
    「テンプレート工程数-(テンプレート内実施工程数)+(実施工程数)」であるが、単純な計算はできない

    高さ検出の際にノード(ステージ)ラベルを記録
    同時に以下を判別して記録 
    エントリ種別    既設|予定|ブランク {String} completed|active|hold|aborted|no_started|blank
    後続罫線種 はエントリ種別よって変化する blank|conect|branch|down|through|through_down|head
    等を先行して判定する
*/
    var tableStages = new Array(chart.length);//バッファ配列
/* 配列メンバー 無名オブジェクト
    {
        id:{String:<lindex>_<sindex>},
        name:{String},
        stage:{null | object Stage | object},
        status:{String:completed|active|hold|aborted|no_started|blank},
        flow:{String:blank|conect|branch|down|through|through_down|head}
    }
    
*/
//console.log(chart);
    for (var l = 0 ; l < chart.length ; l ++ ){
        tableStages[l] = [];//空配列
        var stageOffset = parseInt(chart[l].stages[0].name.split(':')[0]);//chart[l].stageOffset;
        chart[l].stageOffset = stageOffset;
//チャート出力からステージ配列を作成
        for (var s =0 ;s < chart[l].stages.length ; s ++ ){
            var stageStatus = 'completed';
            if(( s == (chart[l].stages.length-1))&&( chart[l].status.content != 'Completed')) stageStatus = 'active';
            var flowLine = 'conect';
            if(stageStatus == 'active') flowLine = 'head';
            tableStages[l][s+chart[l].stageOffset] = {
                id:[l,s+chart[l].stageOffset].join('_'),
//ステージ識別名のみのコピー
                name:(chart[l].stages[s].name),
                stage:chart[l].stages[s],
                status:stageStatus,
                flow:flowLine
            }
//分岐後の第一ステージだった場合、先行するノードを登録して親ラインまでの罫線ステータスを変更する
            if((s==0)&&(chart[l].stageOffset > 0)){
                var prevStg = chart[l].stageOffset-1;
//先行ノードを登録(先行ノードが存在する場合もあるのでベタ書きは不可)
                if(tableStages[l][prevStg]){
                    if(tableStages[l][prevStg].flow == 'through')
                    tableStages[l][prevStg].flow = 'through_down';
                }else{
//先行ノードが存在しない場合は、先行ノードを作成して分岐に衝突するまでプロパティの更新を行う
                    tableStages[l][prevStg] = {
                        id:[l,prevStg].join('_'),
                        name:'<change>',
                        stage:null,
                        status:'blank',
                        flow:'down'
                    };
                    for (var rv = l-1 ; rv >= 0 ; rv --){
                        if(tableStages[rv][prevStg]){
//分岐点ヒット
                            if(tableStages[rv][prevStg].flow == 'down'){
                                tableStages[rv][prevStg].flow = 'through_down';
                            }else{
                                tableStages[rv][prevStg].flow = 'branch';
                            }
                            break;
                        }else{
//空白エントリなのでブランクエントリを投入
                            tableStages[rv][prevStg] = {
                                id    : [rv,prevStg].join('_'),
                                name  : '',
                                stage : null,
                                status: 'blank',
                                flow  : 'through'
                            };
                        }
                    }
                }
            }
        }
        var lastStageName = chart[l].stages[chart[l].stages.length -1].name.split(':')[1].replace(/^\(|\)$/g,'');
        var lastStage     = nas.pmdb.stages.entry(lastStageName);
        var lineName      = chart[l].name.split(':')[1].replace(/^\(|\)$/g,'');//ライン名抽出
        var lineTempalte  = nas.pmdb.pmTemplates.entry(lineName);
        if((lineTempalte)&&(lastStage)){
            var templateStages = lineTempalte.stages.dump().split(',');//該当ラインテンプレートのデフォルトステージ配列で初期化する
            var ix = templateStages.findIndex(function(element){
                return (lastStage.output == nas.pmdb.stages.entry(element).output)
            });
            if(ix >= 0){
                var newNodes = [];
                var templates = templateStages.slice(ix+1);
                for (var tx = 0 ; tx < templates.length ; tx ++){
                    newNodes.push({
                        id:[l,ix+tx].join('_'),
                        name:templates[tx],
                        stage:null,
                        status:'no_started',
                        flow:'blank'
                    });
                }
                tableStages[l] = tableStages[l].concat(newNodes);
            }
        }
        if(tableStages[l].length > chartHeight) chartHeight = tableStages[l].length;//最大数をチャートハイトに
    };
//ループ終了時にチャート高さを補正(基本的にはこの判定はfalse)
    if(chartHeight < compChart[0].stages.length) chartHeight = compChart[0].stages.length;
    if(document.getElementById('nodeSelector')){
//チャート配列
        var tableContent = "";
// ======ノードセレクタテーブルを出力======
        tableContent += "<table id='nodeFlow-chart' class='nodeFlow-chart'>";
//ラインセレクタ兼用 ラインラベルレコード
    tableContent += "<tr>";
        for (var f = 0 ; f < chartWidth ; f++){
            if(f < chart.length){
                tableContent += "<td ";
                tableContent += "id = 'nodeFlow_line_"+f+"_' ";
                tableContent += "onclick='alert(this.id)' ";
                tableContent += "class='nodeFlow nodeFlow-line";
                tableContent += (f==0)? " nodeFlow-line-selected' >":"' >";
                tableContent += chart[f].name
                tableContent += "</td>";
            }else{
                tableContent += "<td  class='nodeFlow' ></td> ";//blank
            }
        }
        tableContent += "<td  class='nodeFlow' ></td>";//blankfield
        tableContent += "<td  class='nodeFlow nodeFlow-composite' >"+compChart[0].name+"</td>";//
        tableContent += "</tr>";

//スタートアップ ルートレコード
        tableContent += "<tr>";
        for (var f = 0 ; f < chartWidth ; f++){
            if(f==0){
                tableContent += "<td  class='nodeFlow nodeFlow-startup' ></td>";
            }else{
                tableContent += "<td  class='nodeFlow nodeFlow-blank' ></td>";
            }
        }
        tableContent += "<td  class='nodeFlow' ></td>";//blankfield
        tableContent += "<td  class='nodeFlow' ></td>";//ライン先頭のノード表示は削除
        tableContent += "</tr>";
//フローチャートテーブル配置

//ラインループ
        for (var l = 0 ; l < chartHeight ; l ++){
            tableContent += "<tr>";
//フィールドループ
            for (var f = 0 ; f < chartWidth ; f++){
                var nodeId     = 'node_'+f+'_'+l+'_';
//              if((chart[f])&&(chart[f].stages[l-chart[f].stageOffset])&&(tableStages[f][l].status!='blank')){}
                if((tableStages[f])&&(tableStages[f][l])&&(tableStages[f][l].status!='blank')){
//処理済エントリ
                    var satusClass = 'node-stage-'+tableStages[f][l].status;
                    tableContent += "<td id='"+nodeId+"' class='nodeFlow nodeFlow-stage' ><button id='btn-";
                    tableContent += nodeId;
                    tableContent += "' class='node-stage " +satusClass+ "' onclick = 'alert(this.id)' >";
                    tableContent += tableStages[f][l].name;
                    tableContent += "</button></td>";
                }else{
                    var conectForm = 'nodeFlow-blank';
                    if((tableStages[f])&&(l == tableStages[f].length)){
                        if (tableStages[f][l-1].flow != 'head'){
                            conectForm = 'nodeFlow-'+tableStages[f][l-1].flow;
                            tableStages[f][l] = {flow:tableStages[f][l-1].flow};
                        };
                    };
                    tableContent += "<td  class='nodeFlow "+conectForm+"' ></td> ";//blank
                };
            };
//後方
            tableContent += "<td  class='nodeFlow' ></td>";//blankfield
            var cmpStg = (compChart[0].stages[l])?compChart[0].stages[l].name:'';
            var cmpStatus = (cmpStg.length)? 'reference':'';
            tableContent += "<td  class='nodeFlow nodeFlow-blank' ><button class='node-composite"+((cmpStatus.length)?(" node-composite-"+cmpStatus):"")+"'>"+cmpStg+"</button></td>";//
            tableContent += "</tr>";
//サブレコード（罫線）
            tableContent += "<tr>";
//フィールドループ
            for (var f = 0 ; f < chartWidth ; f++){
                var nodeId     = 'xnode_'+f+'_'+l+'_';
                var conectForm = '';
                if((tableStages[f])&&tableStages[f][l]) conectForm = 'nodeFlow-'+tableStages[f][l].flow;
                tableContent += "<td id ='"+nodeId+"' class='nodeFlow "+conectForm+"' ></td>";//ひとまず罫線ナシ
            };
//後方
            tableContent += "<td  class='nodeFlow' ></td>";//blankfield
            tableContent += "<td  class='nodeFlow nodeFlow-blank' ></td>";//ひとまず罫線ナシ
            tableContent += "</tr>";
        };

//素材プール分
        tableContent += "<tr>";
        tableContent += "<td  class='nodeFlow nodeFlow-store' colspan=";
        tableContent += chartWidth;
        tableContent += "><button id=elementStore class='node-stage node-stage-elementStore'>素材プール</button></td>";
        tableContent += "<td  class='nodeFlow' ></td>";
        tableContent += "<td  class='nodeFlow nodeFlow-blank' ><button id=node_0_ class='node-composite'></button></td>";
        tableContent += "</tr>";

        tableContent += "</table>";
        document.getElementById('nodeSelector').innerHTML = tableContent;
    };
}
/*TEST
xUI.nodeChart.setChart(xUI.XMAP.pmu.nodeManager.getChart());
// */

/*ノードリストを更新*/
xUI.updateNodeList = function(pmUnit){
    if(!pmUnit) pmUnit = xUI.XMAP.pmu;
    if(!(pmUnit instanceof nas.Pm.PmUnit)) return false;
    var result = '';
//lineloop
    for (var l = 0; l < pmUnit.nodeManager.lines.length ; l++){
        var targetLine = pmUnit.nodeManager.lines[l];
        var lastNode = targetLine.getLastNode();
    if (l < 2) result += '<div class="nodeList_line">';
//LINE TABLE
    result += '<table class="nodeListTable">';
    result += '<tr class="flatTable flatTable-header" width=35%>';
    result += '<th class=flatTable>LINE</th>';
    result += '<td class=flatTable>'+targetLine.toString(true)+'</td>';
    result += '</tr><tr>';
    result += '<th class=flatTable>作業開始</th>';
    result += '<td class=flatTable>'+targetLine.stages[0].jobs[0].createDate.toLocaleDateString()+'</td>';
    result += '</tr><tr>';
    result += '<th class=flatTable>作業更新</th>';
    result += '<td class=flatTable>'+lastNode.updateDate.toLocaleDateString()+'</td>';
    result += '</tr>';
    result += '</table>';

    result += '<table class="nodeListTable">';
//stageloop
  for (var s = 0; s <pmUnit.nodeManager.lines[l].stages.length ; s++){
      var targetStage = pmUnit.nodeManager.lines[l].stages[s];
//JOB LIST by STAGE
    result += '<tr class="flatTable flatTable-header">';
    result += '<th class="flatTable flatTable-stageName" colspan=2>'+targetStage.toString(true)+'</th>';
    result += '</tr>'
//nodeloop
  for (var n = 0; n < pmUnit.nodeManager.lines[l].stages[s].jobs.length ; n++){
      var targetNode = pmUnit.nodeManager.lines[l].stages[s].jobs[n];
      var dt;var nm;
    result += '<tr class="nodeList">';
//状態は2値tail|body
      if( targetNode === lastNode){
          dt = targetNode.createDate.toLocaleDateString();
          nm = (targetNode.createUser instanceof nas.UserInfo)? targetNode.createUser.toString('handle'):targetNode.createUser;
    result += '<th class="flatTable flatTable-jobName">'+targetNode.toString(true)+'</th>';
    result += '<td class="flatTable flatTable-checkin">'+[dt,nm].join(' / ')+'</td>';
      }else{
          dt = targetNode.updateDate.toLocaleDateString();
          nm = (targetNode.updateUser instanceof nas.UserInfo)? targetNode.updateUser.toString('handle'):targetNode.updateUser;
    result += '<th class="flatTable flatTable-jobName" width=35%>'+targetNode.toString(true)+'</th>';
    result += '<td class="flatTable flatTable-checkout">'+[dt,nm].join(' / ')+'</td>';
          
      }

//    result += '</tr><tr>';
//    result += '<th class="flatTable flatTable-jobName">[演出検査]</th>';
//    result += '<td class="flatTable flatTable-checkin">2020.04.11 / {スタッフ名}</td>';
//    result += '</tr><tr class="nodeList">';
//    result += '<th class="flatTable flatTable-jobName-hns">[作監]</th>';
//    result += '<td class="flatTable flatTable"></td>';
//    result += '</tr><tr class="nodeList">';
//    result += '<th class="flatTable flatTable-jobName-hns">[総作監]</th>';
//    result += '<td class="flatTable flatTable"></td>';
    result += '</tr>';
  };//loop-jobs

  };//loop-stages
    result += '</table>';
//    result += '<br>';
    if((l==0)||(l==(pmUnit.nodeManager.lines.length-1))) result += '</div> ';//nodeList_line
    };//loop-lines
    $('#nodeList').html(result);
    return result;
}
/*TEST
    
*/
/**
 *   アセットブラウザ代表オブジェクト
 looksは、表情状態を記録する配列
    [elementThumbnail,assetURL,assetProperties]
 */
xUI.assetBrowser = {
    tabCount : 0,
    selected : 0,
    looks:[true,false,false]
}
/*  アセットブラウザのタブを書き直す
    @params {Array of Asset}    assets
*/
xUI.assetBrowser.reset = function(assets){
    if(typeof assets == 'undefined') assets = xUI.XMAP.assetStore;
    var content = '';
    for (var aix=0;aix<assets.length;aix++){
        content += '<button id ="asset_'+aix+'"';
        content += ' class ="tabControll tabControll-xmap '
        content += (aix==0)? 'tabControll-left-deactive"':'tabControll-mid-deactive"';
        content += ' onClick = "xUI.assetBrowser.select(this.id);" >';
        content += assets[aix].name;
        content += '</button>';
    }
    content += '<button id="asset_end" class="tabControll tabControll-end tabControll-end-deactive" ></button>';
    
    $('#tabSelector-asset').html(content);
    this.select(assets.length-1);
}
/*  アセットブラウザのアセットリストを選択する
    @params {String assetKey}    asset
    アセットキーは 整数 または asset_<No.>
*/
xUI.assetBrowser.select = function(asset){
    if(typeof asset == 'undefined'){
        asset = xUI.XMAP.assetStore.length-1;
    }
    if(String(asset).indexOf('asset_') == 0) {
        asset = asset.replace(/^asset_/,'');
    }
    asset = parseInt(asset);
//タブループ
    for (var tix=0;tix<xUI.XMAP.assetStore.length; tix++){
        var targetTab = $('#asset_'+tix);
        var prefix=(tix==0)?'left':'midd';
        var currentStatus=(tix==this.selected)?'active':'deactive';
        var status=(tix==asset)?'active':'deactive';
        var currentPostfix=((prefix=='mid')&&(currentStatus=='deactive')&&(tix-1!=this.selected))?'overlay':false;
        var postfix=((prefix=='midd')&&(status=='deactive')&&(tix-1!=asset))?'overlay':false;
        var currentClass=(currentPostfix)?['tabControll',prefix,currentStatus,currentPostfix].join('-'):['tabControll',prefix,currentStatus].join('-');
        var newClass=(postfix)?['tabControll',prefix,status,postfix].join('-'):['tabControll',prefix,status].join('-');
        if(tix==(xUI.XMAP.assetStore.length-1)){
            var endTab = $('#asset_end');
            var curreentEndClass = (currentStatus=='active')? 'tabControll-end-active':'tabControll-end-deactive';
            var newEndTabClass   = (status=='active')?     'tabControll-end-active':'tabControll-end-deactive';
            if(endTab.hasClass(curreentEndClass)){
                endTab.removeClass(curreentEndClass).addClass(newEndTabClass);
            }else{
                endTab.addClass(newEndTabClass);            
            }
        }
        if(targetTab.hasClass(currentClass)){
            targetTab.removeClass(currentClass).addClass(newClass);
        }else{
            targetTab.addClass(newClass);            
        }
    }
    if(this.selected != asset) {
        this.selected = asset;
        $("#assetList").html(xUI.assetView(xUI.XMAP.assetStore[asset]));//画面書き直し
        this.setLook();
    }
}
/**
    ルックを調整
*/
xUI.assetBrowser.setLook = function(looks){
    if(typeof looks == 'undefined') looks=this.looks;
    if(!(looks instanceof Array)){
        switch(looks){
        case "elementThumbnail":    this.looks.splice(0,1,(arguments[1]));break;
        case "assetURL":            this.looks.splice(1,1,(arguments[1]));break;
        case "assetProperties":     this.looks.splice(2,1,(arguments[1]));break;
        }
        looks = this.looks;
    }
        for(var lkix = 0;lkix < looks.length;lkix++){
            switch (lkix){
            case 0:$('.elementThumbnail').css('display',((looks[lkix])?'block':'none')) ;break;
            case 1:$('.assetURL').css(        'display',((looks[lkix])?'inline':'none')) ;break;
            case 2:$('.assetProperties').css( 'display',((looks[lkix])?'block':'none')) ;break;
            }
        }
        if((looks[1])||(looks[2])){
            $('.groupColumn').css('width','460px');
        }else{
            $('.groupColumn').css('width','160px');
        }
        this.looks = looks;
        return looks;
}
/**
 *   アセットブラウザの表示１単位（１ページ）分のhtmlを出力する
 *  
 *  @params {Object xMap.xMapAsset} asset
 *  @params {String | Object nas.Pm.ManagementJob}  job
 *  @returns    {String}    htmlテキスト
 */
xUI.assetView = function(asset,job){
    if(! asset) return '<!-- no asset -->';
    if(! job)job = asset.groups
//表示用配列を設定（同名グループはひとつのカラムで合成表示する）
    var assetGroups=[];
    for (var gix=0;gix<asset.groups.length;gix ++){
        var px = assetGroups.length;
        var ax = assetGroups.add({
            name:asset.groups[gix].name,
            contents:[asset.groups[gix]]
        },function (tgt,dst){return (tgt.name == dst.name)});
//        if(ax < px){assetGroups[ax].contents.push(asset.groups[gix])};
        if(px == assetGroups.length){
console.log(asset.groups[gix].name + ': 衝突検出');
            assetGroups[ax].contents.push(asset.groups[gix]);
        };
    }
console.log(assetGroups)
    var result = '';//<!-- asset container -->
        result += '<div id ="asset_' + 0 +'" class ="assetTab">';
//        result += '<!-- group container -->';

//    for (var gix=0;gix<asset.groups.length;gix ++){}
    for (var gix=0;gix<assetGroups.length;gix ++){
    for (var ggx=0;ggx<assetGroups[gix].contents.length;ggx ++){
        var group = assetGroups[gix].contents[ggx];
        result += '<div id ="group_'+ group.id +'" class ="groupColumn">';

        result += '<div id ="group_'+ group.id +'_label" class ="groupLabel">';
        result += '<label for ="select_g_'+ group.id +'">';
        result += '<input type ="checkbox" id ="select_g_'+ group.id +'">';
        result += '<span id="group_'+ group.id +'_name" class="groupName" >'
        result += group.name;//group label
        result += '</span></label><hr></div>';

        result += '<div id = "group_'+ group.id +'_content">';
//        result += '<!-- assetElement container -->';
        for (var eix = 0;eix < group.elements.length;eix ++){
            var element = group.elements[eix];
            var elementIdf = [group.id,element.id].join('_');
console.log(element);
            var elementPicture = (element.content.source)?
xUI.parsePath(element.content.source.file,xUI.XMAP.baseURL):
                false;//暫定置き換えパス
            result += '<div class ="elementContainer noFileAssign" >';
            if(elementPicture){
                result += '<img class ="elementThumbnail assetThumbnail" id ="thumbnail_elm_'+elementIdf+'" src="';
                result += elementPicture;//asset picuture url
                result += '" alt ="';
                result += element.name ;//asset picture alt text
                result += '" title ="';
                result += 'title text';//asset picture title text
                result += '">';
            }else{
                result += '<div class="elementThumbnail"> no picture </div>';
            }
            result += '<img class=assetAssign src=/images/ui/file.png >';
            result += '<label for="select_elm_'+elementIdf+'">';
            result += '<input type = checkbox id="select_elm_'+elementIdf+'">';
            result += '<span class=assetName id="elm_'+elementIdf+'" >'+ element.name +'</span>';
            result += '</label>';

            result += '<span class=assetURL>';
            result += '<button ><img src="/images/ui/triangle.png"></button>';
            
            result += (elementPicture)?
                ('<a href="'+elementPicture+'" target="_new">'+elementPicture+'</a>'):
                 'no picture';
            result += '</span><br>';

            result += '<span class="assetProperties">';
            result +=  element.toString();//*---- asset properties <br><br><br>
            result += '</span><hr>';
            result += '</div>';

//        result += '<!-- group container end-->';
        };// asset group container
//        result += '<!-- assetElement container end-->';
        result += '<div class = endSign> end </div>';
        result += '</div>';
        result += '</div>';
    }
    };//グループコンテナ
    return result;
}
//TEST
 /*
xUI.XMAP.parsexMap(startupDocument);
xUI.setRuler(24,48);
xUI.updateProduct();
xUI.updateCutBox();
xUI.updateInherit();
xUI.updateNoteArea();
xUI.updatePosterPicture();
xUI.drawManagementSummary();
xUI.assetBrowser.reset();
xUI.updateNodeList();
//xUI.();
//xUI.documents[0].activate();
// */

/*
    仮設（デバッグ用）xMapLook
*/
xUI.resetReceipt = function(){
/*    if(documentDepot.currentProduct){
        xUI.setRuler(
            documentDepot.currentProduct.stbd.contents.findIndex(function(element){
                return(nas.Pm.compareCutIdf(element.sci.name,xUI.documents[0].content.pmu.inherit[0].name)==0)
            })+1,
            documentDepot.currentProduct.stbd.contents.length
        );
        
    }else{
        xUI.setRuler(-1,1);
    };// */
    xUI.nodeChart.setChart()   ;
    xUI.updateProduct()        ;
    xUI.updateCutBox()         ;
    xUI.updateInherit()        ;
    xUI.updateNoteArea()       ;
    xUI.updatePosterPicture()  ;
    xUI.drawManagementSummary();
    xUI.updateNodeList()       ;
    xUI.assetBrowser.reset()   ;
// タブを
    xUI.updateStatus()    ;//ステータス表示を更新
    xUI.setNodeSelector() ;//ノードセレクタを更新
}
/*
    仮設（デバッグ用）画面更新
*/
xUI.resetScreen = function(){
    if(xUI.activeDocument)
        if(xUI.activeDocument.id == 0){
            xUI.resetReceipt();
        }else{
            xUI.resetSheet();
        }
    xUI.sWitchPanel('clear');
    if (xUI.XMAP.pmu.checkinNode){
        xUI.setUImode('production');
//    }else{
        
    }
}
/*
    application UI syncTable
    xUI.syncTable

    xUI.sync UI表示同期プロシジャ要素テーブル
    オンメモリの編集バッファとHTML上の表示を同期させる
    共通(標準)キーワードは以下の通り

    about_  アバウトパネルのバージョン・環境等
    windowTitle HTML window.title 文字列
    undo    undo ボタンの有効|無効
    redo    redo ボタンの有効|無効
    copy    copy ボタンの有効|無効
    cut     cut  ボタンの有効|無効
    paste   pasteボタンの有効|無効
    copyImage   ボタンの有効|無効
    save    保存ボタンの有効|無効

    各アプリケーションごとのキーは個別にこのテーブルに追加または上書きする
    テーブルの値は、同期情報オブジェクト、関数、文字列
    同期情報オブジェクトは{type:<同期タイプ>,value:<表示を切り替える判定条件式|設定する値を得る式>,items:[要素名の配列]}
    タイプ menu-enable|menu-check|radio-check|menu-value|show-hide
    関数|文字列式の場合は、定形外の処理を行うために単純に実行
    
*/
xUI.syncTable = {
    "about_":function(){
        for(var N=0;N<2;N++){
            if(document.getElementById("myVer"+N)){
                document.getElementById("myVer"+N).innerText= config.windowTitle
            };
            if(document.getElementById("myServer"+N)){
                document.getElementById("myServer"+N).innerText=(xUI.onSite)? xUI.onSite:"[no server]";
            };
        };
        document.getElementById("uaf-version").innerText = myFilerevision;
        if((document.getElementById("uatb-version"))&&(typeof config.package != 'undefined')) document.getElementById("uatb-version").innerText = config.package.version;
        document.getElementById("appMode").innerText = (appHost.platform == 'Electron')? appHost.platform : 'WEB-APPLICATION';
    },
    "windowTitle":function(){
        var windowTitle = xUI.app;
        document.title = windowTitle
    },
    "undo":{
        type:'menu-enable',
        value:"return ((xUI.activeDocument)&&(xUI.activeDocument.undoBuffer.undoPt > 0))",
        items:['pMundo','ibCundo','cMundo']
    },
    "redo":{
        type:'menu-enable',
        value:"return ((xUI.activeDocument)&&((xUI.activeDocument.undoBuffer.undoStack.length - xUI.activeDocument.undoBuffer.undoPt) > 1))",
        items:['pMredo','ibCredo','cMredo']
    },
    "copy":{
        type:'menu-enable',
        value:"return (xUI.Selection[0]+xUI.Selection[1] > 0)",
        items:['pMcopy','ibCcopy','cMcopy']
    },
    "cut":{
        type:'menu-enable',
        value:"return ((xUI.activeDocument)&&((xUI.activeDocument.undoBuffer.undoPt+1) > xUI.activeDocument.undoBuffer.undoStack.length))",
        items:['pMcut','ibCcut','cMcut']
    },
    "paste":{
        type:'menu-enable',
        value:"return (xUI.yankBuf.body.length)? true:false",
        items:['pMpaste','ibCpaste','cMpaste']
    },
    "copyImage":function(){
        var tgt = ['pMcopyImage','cMcopyImage'];
        navigator.permissions.query({name:'clipboard-write'}).then((r)=>{
            if(r.state !='granted'){
                tgt.forEach((e)=> xUI.pMenu(e,'disable'));//不可
            }else{
                tgt.forEach((e)=> xUI.pMenu(e,'enable'));//使用可
            };
        });
    },
    "save":{
        type:'menu-enable',
        value:'return xUI.isStored()',
        items:['pMsave','ibCsave','cMsave']
    }
};

/**
 *  UI同期テーブルをマージ
 *  @params {Object} syncTable
 *  @params {Boolean} overwrite
 *    同期テーブルオブジェクト
 *     上書きオプション default true
 *     <呼びだしキー文字列>:<同期関数>,
 *    テーブルマージ
 *      キーワードコンフリクトしたメンバーアイテムは上書きオプションを明示的にfalseに設定しない限り新しいメンバーで上書きされる
 */
xUI.syncTable.mergeItems = function(syncTable,overwrite){
    let skip = false;
    if((typeof overwrite != 'undefined')&&(!(overwrite))) skip = true;
    let conflictItems = [];
    for( var f in syncTable){
        if((xUI. syncTable[f])&&(skip)){
            conflictItems.push(f);
        }else{
            xUI.syncTable[f] = syncTable[f];
        };
    };
    if(conflictItems.length) console.log("stnc table merge",conflictItems);
};

/**
 *  @params {String} prop
 *      同期キーワード
 *  @params {Array of String} param
 *      同期ファンクションに与える引数
 *      メニュー類にアプリケーションのステータスを反映させる
 *      xUI.sync() method
 */
xUI.sync = function sync(prop,param){
    if(! (param instanceof Array)) param = [param];
    if(xUI.syncTable[prop] instanceof Function){
//as Function execute
        (xUI.syncTable[prop])(...param);
    }else if(typeof xUI.syncTable[prop] == 'string'){
//as Expression
        Function(xUI.syncTable[prop])();
    }else if(typeof xUI.syncTable[prop] == 'object'){
        let status = Function(xUI.syncTable[prop].value)();//引数を得る式を実行
        if(appHost.platform =='Electron'){
//Electron menu
            if(nas.menuItems.get(prop)){
                uat.MH.parentModule.window.postMessage({
                    channel:'system',
                    from:{name:xUI.app,id:uat.MH.objectIdf},
                    command:xUI.syncTable[prop].type,
                    content:[prop,status]
                });
            };
        };
//WEBメニューアイテム・ボタンアイテム等の表示更新
console.log([prop,status]);
        xUI.syncTable[prop].items.forEach((e)=>{
            if(document.getElementById(e)){
                if(xUI.syncTable[prop].type == 'menu-enable'){
//menu-enable
                    if(e.indexOf('ibC') == 0){
                        $("#"+e).attr("disabled",((status)?false:true));//アイコンボタンメニュー
                    }else if((e.indexOf('pM') == 0)||(e.indexOf('cM') == 0)){
                        xUI.pMenu(e,(status)?"enable":"disable");//プルダウン|コンテキスト メニュー
                    };
                }else if(xUI.syncTable[prop].type == 'menu-check'){
//menu-check
//                    $("#"+e).attr("checked",((status)?true:false));//チェックメニュー
                    if(document.getElementById(e).id.indexOf('ibC') == 0){
                        if(status){
                            document.getElementById(e).innerText = "✓";
                            nas.HTML.addClass(document.getElementById(e),'boxButtonChecked');
                        }else{
                            document.getElementById(e).innerText = "";
                            nas.HTML.removeClass(document.getElementById(e),'boxButtonChecked');
                        };
                    }else{
                        document.getElementById(e).checked = (status)? true:false;//チェックメニュー
                    };


                }else if(xUI.syncTable[prop].type == 'radio-check'){
//radio-check(20220121現在renameDigitsのみ)
                    if((e.indexOf('pM') == 0)||(e.indexOf('cM') == 0)){
                        $("#"+e+status).attr("checked",true);//プルダウン|コンテキスト メニュー
                    }else if(e.indexOf('ibC') == 0){
                        $("#"+e).attr("checked",true);//アイコンボタンメニュー
                    }else if(document.getElementById(e) instanceof HTMLSelectElement){
                        document.getElementById(e).value = document.getElementById(e+status).value;
//                        if(document.getElementById(e).onchange) document.getElementById(e).onchange();
                    };
                }else if(xUI.syncTable[prop].type == 'item-value'){
//item-value
                    document.getElementBy(e).value = status;
                }else if(xUI.syncTable[prop].type == 'show-hide'){
//show-hide
                    if(status){$("#"+e).show();}else{$("#"+e).hide();};
                };
            };
        });
    };
/*
//windowTitle及び保存処理系をアプリごとに処理
    if(xUI.syncTable.windowTitle){
//        xUI.sync('windowTitle');
    }else if(xUI.syncTable.windowTitle){
//        xUI.syncTable.windowTitle();
    }else if(
        (config.app[xUI.app])&&
        (config.app[xUI.app].syncWindowTitle instanceof Function)
    ){
//この分岐不要にする
        config.app[xUI.app].syncWindowTitle();
    }else{
        document.title = xUI.app;
    };// */
}
/*
    アプリごとのsyncTable設定
    config.app[xUI.app.name].syncTable

    Window.title 更新予約関数
    config.app[xUI.app.name].syncWindowTitle
    引数なしの関数を設定する
    eg.config.app[xUI.app.name].syncWindowTitle = function(){...}
    
    アプリごとのconfig拡張は、個別設定ファイルを作成する

    eg. config_remaping.js 

    xUI.initのプロセス中でテーブルマージを行う
*/
// Sample - app.remaping //
/*
config.app[xUI.app.name].syncWindowTitle = async function (){
//windowTitle及び保存処理系は無条件で変更
    if(xUI.init){
// ウィンドウタイトル
        var winTitle=decodeURIComponent(xUI.XPS.getIdentifier('cut'));
        if((appHost.platform == "AIR") && (fileBox.currentFile)){
            winTitle = fileBox.currentFile.name;
        };
        if(! xUI.isStored()) winTitle = "*"+winTitle;//未保存
        if(document.title != winTitle) document.title = winTitle ;//異なる場合のみ書き直す
        if(document.getElementById('pmcui')){
            if(! xUI.isStored()){
                if(document.getElementById('pmcui-update').disabled == true) document.getElementById('pmcui-update').disabled = false;
                xUI.pMenu('pMsave','enable');
            }else{
                if(document.getElementById('pmcui-update').disabled == false) document.getElementById('pmcui-update').disabled = true;
                xUI.pMenu('pMsave','false');
            };
        };
        if(xUI.canvasPaint.active) xUI.canvasPaint.syncCommand();
    };
}
*/
/**
 *     @params {String} noteText
 *    引数文字列でUI上のメモ欄を同期する
 *  引数を与える場合は、一時変更となる
 */
xUI.syncNoteText = function(noteText){
//ここをnoteTextparserで置き換える予定
//    var noteContent = document.getElementById('rEsult').value.toString().replace(/(\r)?\n/g,"<br>");
//    var noteContent = md.render(document.getElementById('rEsult').value);
    if(typeof noteText =='undefined') noteText = xUI.XPS.xpsTracks.noteText;
//入力編集欄
    if( document.getElementById('rEsult').value != noteContent) document.getElementById('rEsult').value = noteContent;
    var noteContent = md.render(noteText);
//screen画面表示
    if(document.getElementById("memo")) document.getElementById("memo").innerHTML = noteContent;
//printout表示
    if(document.getElementById("memo_prt")) document.getElementById("memo_prt").innerHTML = noteContent;
}
/*TEST
    xUI.syncNoteText();
    xUI.syncNoteText("text\n\ntext");
    xUI.syncNoteText(document.getElementById('rEsult').value);
 */
if(markdownit) var md = markdownit({
    html       : true,
    linkify    : true,
    breaks     : true,
    typographer: true
});
/**
 *     @params {Object nas.NoteImage|HTMLElement} noteImage
 *    UI上のメモ欄画像を同期する
 *  引数を与える場合は、一時変更となる
 */
xUI.syncNoteImage = function(noteImage){
}
/*    外部ツールDB extApps 
    処理メソッドを搭載するために xUIのプロパティとして設定を行う
    メンバー本体はconfigを直に参照
*/
xUI.extApps = {
//呼び出しメソッド
    get : function(key){
        if(config.extApps.members[key]){
            return config.extApps.members[key];
        }else{
            for(var app in config.extApps.members){
                if((config.extApps.members[app].name == key)||(config.extApps.members[app].applicationpath == key)) return config.extApps.members[app];
                };
        };
        return null;
    },
//呼び出しメソッド
    type:function(type){
        var result = [];
        for(var app in config.extApps.members){
            if((config.extApps.members[app].platform.indexOf(appHost.os) >= 0)&&(config.extApps.members[app].type.indexOf(type) >= 0)) result.push(config.extApps.members[app]);
        };
        return result;
    },
    parseConfig : function(contentString){config.extApps.members = JSON.parse(contentString);},
    toString : function(){JSON.stringify(config.extApps.members)}
};
//xUI.extApps.members = config.members;

/*
    アプリケーション|ツール類を開く
*/



/*============*/
// sync エイリアスを設定
    sync = xUI.sync;
//オブジェクト戻す
    if(nas.CanvasAddon) return nas.CanvasAddon(xUI);
    return xUI;
};
//docio.js end