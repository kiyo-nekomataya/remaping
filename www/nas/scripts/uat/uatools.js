/*
 *	uatools.js
 *	UAT Application Suite Hub
 *コンソールを兼ねたアプリケーションコントロールモジュール
frontend
	スプラッシュ
	ログイン管理
	ローカルリポジトリ選択
	データベース編集
backend
	uat_messagehandler
 *
 */
'use strict';

// 始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
	var xUI         =new Object();
    xUI.Mouse   =function(){return};
    xUI.onScroll=function(){return};
//    オブジェクト初期化用ダミーマップ
// 新規XPSオブジェクト作成・初期化
    xUI.activeNode   = null ;//表示・編集対象のノードオブジェクト .pmdbを持つ者はすべてノードたりえる
    xUI.XMAP         = {} ;//ダミーオブジェクトとしてXMAPバッファを初期化
    xUI.XPS          = {} ;//ダミーオブジェクトとしてXPSバッファを初期化
    xUI.PMDBroot     ;//編集中のストレージルート(String ローカルパス) eg: /Users/Shared/workStorage
    xUI.PMDBcurrent  ;//編集中のPMDB(String ストレージルートから先のパス)eg: /Nekomataya/momotaro/mom#02
console.log(nas.pmdb)

//コード読込のタイミングで行う初期化
/*
    debud output
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
上のルーチンはアプリ間共通部分が多いので doc_io.jsへ移動の予定
以下は uat共用モジュール

*/

var uat = {
	isParent:true,
	
};
/*

mac open コマンド引数
open -a (application path) (target file) アプリで開く
open -t (target file) 標準テキストエディタで開く


start
https://docs.microsoft.com/ja-jp/windows-server/administration/windows-commands/start

start [<title>] [/d <path>] [/i] [{/min | /max}] [{/separate | /shared}] [{/low | /normal | /high | /realtime | /abovenormal | belownormal}] [/node <NUMA node>] [/affinity <hexaffinity>] [/wait] [/b] [<command> [<parameter>... ] | <program> [<parameter>... ]]

*/