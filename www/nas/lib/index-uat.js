/**
 *	index-uaf.js
 * @fileOverview
 * 
 * グローバルの環境差を吸収して共用可能にするためスターターを含む
 * nodeベースでHTMLのない環境ではこのファイルをスタータとして使用する
 */
'use strict';
const path              = require('path');
const fs                = require('fs-extra');

    var config    = require( './nas_common' ).config;
    var appHost   = require( './nas_common' ).appHost;
/* 基礎Libraryのために以下のソースを順次ロードする */
//1:  var nas = require('./nas_common').nas       ;//基本オブジェクトのみ
//2:  var nas = require('./nas_common_Image').nas ;//基本オブジェクトのみ
//3:  var nas = require('./nas_AnimationValues')  ;//基礎オブジェクトに追加オブジェクト
//4:  var nas = require('./cameraworkDescription');//基礎カメラワーク情報オブジェクト
//5:  var nas = require('./pmio')                 ;//プロダクト管理オブジェクト
//6:  var nas = require('./storyboard')           ;//ストーリーボード管理オブジェクト
//7:  var nas = require('./mapio' ).nas           ;//データマップ
//8:  var nas = require('./xpsio' ).nas           ;//タイムシート
//9:  var nas = require('./nas_locale' ).nas      ;//ロケール
//A:  var nas = require('./nas_menuItem' ).nas    ;//メニューDB
//B:
var nas        = require('./nas_preferenceLib' ).nas;//設定関連ライブラリ 可能な限り最終位置へ
/*
	メニューDBは分離が望ましい 分割予定 20220117
 */
    var Storyboard = nas.Storyboard;//
    var xMap       = nas.xMap;//データマップ
    var Xps        = nas.Xps; //ドープシート
//nas_preferenceLibをコンバートしたので、以下のコードを全体プリファレンスへ統合可能
    var configure = require( './etc/nas.Pm.pmdb.json' );
    nas.Pm.pmdb.parseConfig(JSON.stringify(configure));

//console.log('-----laded PMDB.')
//使っている関数のみロードしたほうが良い
/*
	const {
		EscapeSJIS,
		UnescapeSJIS,
		EscapeEUCJP,
		UnescapeEUCJP,
		EscapeJIS7,
		UnescapeJIS7,
		EscapeJIS8,
		UnescapeJIS8,
		EscapeUnicode,
		UnescapeUnicode,
		EscapeUTF7,
		UnescapeUTF7,
		EscapeUTF8,
		UnescapeUTF8,
		EscapeUTF16LE,
		UnescapeUTF16LE,
		GetEscapeCodeType
	} = require('./ecl-mod');
;// */
	module.exports = {
		config,
		appHost,
		nas,
		Storyboard,
		xMap,
		Xps,
		...require( './ecl-mod' )
	};
/*====================================================================/
    emports.config  = config;
    emports.appHost = appHost;
    emports.nas     = nas;
    emports.xMap    = xMap;
    emports.Xps     = Xps;
/====================================================================*/

//TEST
/*
const {
	nas,
	Storyboard,
	xMap,
	Xps
} = require('./index-uat');
console.log('/====================================================================1');
    console.log(JSON.stringify(config,null,2));
console.log('/====================================================================2');
    console.log(nas.pmdb.dump('plain-text'));
console.log('/====================================================================3');
    console.log(xMap);
    var xmap = new xMap();
    console.log(xmap.toString());
console.log('/====================================================================4');
    var xpst = new Xps(8,120);
    console.log(xpst.toString());
*/
