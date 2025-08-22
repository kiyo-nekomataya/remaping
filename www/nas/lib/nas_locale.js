/**
 * HTML言語リソースを別ファイルにまとめる
 *
 * スタートアップで1度だけ実行としたいけど初期化のたびに実行が必要かもしれない
 *
 * @fileoverview LanguagePack Object
 *
 * nas.HTM.LangPack[Locale][kind][propertyName]=value;
 *
 * Locale	言語コード カントリーコードまたはロケール文字列で
 * kind	UIのオブジェクト種別innerHTMLはjQueryで変更 他のプロパティは直接更新
 * propertyName	オブジェクトを文字列で指定 HTMLならばid AESオブジェクトならばUIオブジェクトの参照
 */
'use strict';
/*=======================================*/
// load order:9
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config  = require('./nas_common').config;
    var appHost = require('./nas_common').appHost;
    var nas     = require('./xpsio').nas;
const i18next           = require('i18next');
const jqueryI18next     = require('jquery-i18next');
const iconv             = require('iconv-lite');
const i18nextXHRBackend = require('i18next-xhr-backend');

};

if (typeof nas == "undefined")     var nas = {};
if (typeof i18next == 'undefined') var i18next = null;
/**
 * HTML	JQueryを使う	$("#"+propertyName).html(value);
 * AES	textプロパティを更新	eval[propertyName+'.txt="'+value+'"';]
 * 変更書式 ["エレメントid","プロパティ","値"]
 */

//===========================================初期化

/**
 * localeを取得
 * uiLocaleが存在しないシステムでは、
 * navigator文字列から取得
 * グローバルにlocaleがあればlocaleから
 * uiLocaleはAEのみ
 * 判定不能時はとりあえずjaにするので初期値を与える
 *
 * @type {string}
 */
nas.locale = "ja";

if (typeof locale != "undefined") {
    nas.locale = locale.split("_")[0];//"ja_JP"等の前置部分のみをとる
} else {
    if (typeof uiLocale != "undefined") {
        nas.locale = uiLocale;
    }else if(appHost.platform == 'UXP'){
        nas.locale = appHost.uxp_host.uiLocale.split("_")[0];
    }else{
        if (typeof app != "undefined") {
            if (app.locale) {
                nas.locale = app.locale.split("_")[0];
            };
        } else {
            if (typeof $ != "undefined") {
                if ($.locale) {
                    nas.locale = $.locale.split("_")[0];
                };
            } else {
                if (typeof navigator != "undefined") {
                    nas.locale = (navigator.userLanguage || navigator.browserLanguage || navigator.language).substr(0, 2);
                };
            };
        };
    };
};

/**
 * 現状"en","ja"リソースのみなので日本語以外は全て英語扱いとする
 * @type {string}
 */
nas.locale = (nas.locale == "ja") ? "ja" : "en";

if((i18next)&&(i18nextXHRBackend)){
/*
 *  i18next 初期化
 *  loadPathが環境により変わる
 *  WEB上でUATサーバに置かれる場合は /locales/{{lng}}/Locale.json
 *  通常のWEBサービスでは 
 */
    i18next.use(i18nextXHRBackend).init({
        backend: {
            loadPath: './locales/{{lng}}/Locale.json'
        },
        debug: false,
        defaultLng: 'en',
        fallbackLng: false,
        lng: nas.locale,
    }, function (err, t) {
        jqueryI18next.init(i18next, $ ,{
            useOptionsAttr: true // optionを有効にする
        });
        $('[data-i18n]').localize();
    });
/*
 *  i18nextのデータから、ローカライズテーブルを作成
 */
};
/**
 * nas.localize(anyString or languageResource [, replaceStrings ])
 * 引数:zStirng または 何らかの文字列 または nas.LanguageResouce 第二引数以降は置換文字列
 * 内部で使用するlocalizeファンクションを作っておく
 * 置きかえ機能ありadobe拡張スクリプトのlocalizeの前段として使用可能
 * nasオブジェクトの場合は自前で処理して引数が文字列で、かつZStringだった場合localizeのリザルトを戻す
 * それ以外の場合はi18nextのリソースから検索
 * 
 * @param myObject
 * @returns {*}
 */
nas.localize = function (myObject) {
    if (
        (typeof app != "undefined") && 
        (localize instanceof Function) && 
        (localize !== nas.localize ) && 
        (myObject instanceof String) && 
        (myObject.indexOf("$$$/") == 0)
    ){
// 引数がZStringでかつAdobe環境(グローバルのlocalizeがある)の場合引数を渡して終了
// localize が自分自身である場合も排除
        var myEx = "localize(myObject ";
        if (arguments.length > 1) {
            for (var aid = 1; aid < arguments.length; aid++) {
                myEx += ",arguments[" + aid + "] "
            };
        };
        myEx += ");";
        return eval(myEx);
    }else{
// 自前処理 localize がない場合(html等)は自前で処理
        var myArg = [];
        if (arguments.length > 1) {
            for (var aId = 1; aId < arguments.length; aId++) {
                myArg.push(arguments[aId]);
            };
        };
        if (typeof myObject == "string") {
            var myResult = myObject;
            if (myObject.indexOf("$$$/") == 0) myResult = myObject.replace(/^\$\$\$[^=]+=/, "");//ZString
//i18next テーブル参照
            var trns = ((i18next)&&(i18next.getDataByLanguage(nas.locale)))?
                i18next.getDataByLanguage(nas.locale).translation[myResult]:null;
            if(trns){
                myResult = trns;
            }else{
                if (Object.keys(nas.uiMsg).indexOf(myResult) >= 0){
                    var trobj = nas.uiMsg[myResult];
                    myResult = (trobj[nas.locale]) ? trobj[nas.locale]:trobj['en'];
                };
            };
        } else {
            var myResult = myObject[nas.locale];
        };
        if (myArg.length > 0) {
            /**
             * 言語リソース内の%d(1,2,3…)を置き換える  引数は不定 ("%1").replace(/%1/g,"AAA")
             */
            for (var rId = 0; rId < myArg.length; rId++){
                var myRegex = new RegExp("%" + (rId + 1), "g");
                myResult = myResult.replace(myRegex, myArg[rId]);
            };
        };
        return myResult;
    };
};
/**
 * ローカライズ関数がない場合は上書き
 */
if (typeof localize == "undefined") {
    var localize = nas.localize;
};

/**
 * test
 *
 * A={en:"eng%1 1%2 3"};
 * nas.localize(A,"Q","B");
 * アドビのlocalizeとわずかに動作が違うが堪忍
 * パラメータ置換の際にadobe版では"%d"パラメータの後方に空白文字を入れないと、そこで処理を中断するらしい
 * 実際上この位置には空白が入るケースが圧倒的なので問題はないものとする
 * この動作はマッチさせない(自前処理では空白はなくても置換を行う)
 * adobe の localizeのほうが早いのでそちらになるべく流したほうが良い
 * 2015 06-25
 */

/**
 * @constructor
 */
nas.LanguagePack = function () {
    this["en"] = [];
    this["ja"] = [];
};

/**
 * @param myLocale
 コマンドメニュー用の切り替えルーチンを追加
 "_M"で開始するリソースは、pM/cM/ibMで兼用リソースとして扱われる
 また"_M","innerHTML"に関しては接尾詞"-d"をカバー範囲にする
 */
nas.LanguagePack.prototype.chgLocale = function (myLocale) {
    if (!myLocale) {
        myLocale = "ja"
    };
    nas.locale = myLocale;
// set language i18next

        console.log('lang=' + myLocale);
    if(i18next){
        i18next.use(i18nextXHRBackend).init({
            backend: {
                loadPath: './locales/{{lng}}/Locale.json'
            },
            debug: false,
            defaultLng: 'en',
            fallbackLng: false,
            lng: nas.locale,
        }, function (err, t) {
            jqueryI18next.init(i18next, $,{
        useOptionsAttr: true // optionを有効にする
            });
            $('[data-i18n]').localize();
        });
    };
/*
    for (var idx = 0; idx < nas.LangPack[myLocale].length; idx++) {
        var eId = nas.LangPack[myLocale][idx][0];
        var eType = nas.LangPack[myLocale][idx][1];
        var value = nas.LangPack[myLocale][idx][2];
        try {
            if(eId.indexOf('pM')==0){
                var menuSet = ['pM','cM','ibM']
                for(pfx = 0 ; pfx < menuSet.length; pfx ++){
                    if((pfx == 2)&&(eType=="innerHTML")) continue;
                    var xeId = eId.replace(/^pM/,menuSet[pfx]);
                    if (document.getElementById(xeId)) {
                        document.getElementById(xeId)[eType] = value;
                        if((eType=="innerHTML")&&(document.getElementById(xeId+'-d'))) {
                            document.getElementById(xeId+'-d')['innerHTML'] = value;
                        };
                    };
                };
            }else{
                if (document.getElementById(eId)) {
                    document.getElementById(eId)[eType] = value;
                };
            };
        } catch (err) {
            console.log(err);
        };
    };// */
};
/*=======================================*/
if(typeof jQuery == 'function'){
    $.get(
        './nas/lib/nas.uiMsg.json',
        function(result){
            nas.uiMsg = result;
//console.log('loaded : nas.uiMsg.json');
        }
    );
}else if(appHost.platform == 'UXP'){
//UXPの場合は起点がindex.htmlからになる
    nas.uiMsg = require('./nas/lib/nas.uiMsg.json');
}else if(appHost.Nodejs){
//通常のnode環境では lib内のindex-uat.jsから呼ばれる
    nas.uiMsg = require('./nas.uiMsg.json');
}else if(appHost.ESTK){
	var myOpenfile = new File('./nas.uiMsg.json');
	myOpenfile.encoding="UTF8";
	myOpenfile.open("r");
	var myContent = myOpenfile.read();
	myOpenfile.close();
	if(myContent.length)
	nas.uiMsg = JSON.parse(myContent);
}else{
    nas.uiMsg = {};
};
// console.log('loaded : nas_locale.js');
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas  = nas;
};
