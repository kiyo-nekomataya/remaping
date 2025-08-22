/**************************************************************************
 *    ////// UATアプリケーション個別設定ファイル //////
 *   各設定は、共用の設定データを上書きする
 *
 *  設定内容の一部はcookieで保存され、バックアップ情報としてlocalStorageに同内容が保持される
 */
'use strict';
//  設定トレーラーが存在しない場合は再設定
if(typeof config == 'undefined')     var config = {};
if(typeof config.app == 'undefined') config.app = {};
	config.appIdf = 'app_template'     ;//アプリケーション識別キーワードを設定する(既存データがあっても上書き)
	config.app[config.appIdf] = {} ;

/** @desc
 *    開始メッセージ
 *    お好きなメッセージに入れ替えできます。
 *    開始メッセージが抑制されている場合は表示されません。
 *      ＊＊＊アプリ別設定＊＊＊?
 * @type {string}
 */
    config.welcomeMsg  = "nas animation library application teamplate 20250802";
    config.windowTitle = "1.0.0";//window.titleとしての役割は終了 統合バージョン定数
/**************************************************************************
 *  タイムシート等ドキュメントのヘッダに表示するロゴタイプ 共用設定
 *      ページロゴを設定して各会社のサインや作品タイトルとして使用することが可能
 *      ヘッダロゴを使用しない場合は、useHeaderLogo をfalseに
 *      HTMLタグ記述も可　画像使用の場合はタグ記述が必須
 *      ロゴにリンク先をもたせない場合は空白を使用する
 *      ＊＊＊アプリ別設定＊＊＊
 *      例：
 *    config.headerLogo = "<b>りまぴん</b>";
 *    config.headerLogo = "<img src='images/logo/black.gif' alt='Nekomataya' width=150 height=30 border=0 />";
 *    config.headerLogo = "<img src='//www.nekomataya.info/cgi-bin/garden.cgi?SET=test-logo' alt='Nekomataya' width=150 height=24 border=0 />";
 *      ロゴに与えるリンク先
 *    config.headerLogo_url = "./help/index.html";試験中
 *    config.headerLogo_url = "http://www.nekomataya.info/remaping/";
 *      ロゴのコメント(title)
 *    config.headerLogo_urlComment    ="UATimesheet簡易マニュアル";
 */
    config.useHeaderLogo         = true;
    config.headerLogo            = "<img src='/images/logo/UATimesheet.png' alt='UATimesheet' width=141 height=24 border=0 />";
    config.headerLogo_url        = "https://docs.google.com/document/d/14XIjRraSci35fLcZdCtrwIJ7G1Z13Wku5e1hzu1QOCc/edit?tab=t.0";
    config.headerLogo_urlComment = "UATimesheet簡易マニュアル";


/*
    application UI sync table for remaping|xpsedit
    xUI.syncTable

    xUI.sync UI表示同期プロシジャ要素テーブル
    オンメモリの編集バッファとHTML上の表示を同期させる
    共通(標準)キーワードは以下の通り

    about_
    undo
    redo
    windowTitle

    renameDigits
    prefix
    suffix
    preview
    ThumbnailSize
    PreviewSize
    Search

    各アプリケーションごとのキーは個別にこのテーブルに追加または上書きする
    テーブルの値は、同期情報オブジェクト、関数、文字列
    同期情報オブジェクトは{type:<同期タイプ>,value:<表示を切り替える判定条件式|設定する値を得る式>,items:[要素名の配列]}
    タイプ menu-enable|menu-check|radio-check|menu-value|show-hide
    関数|文字列式の場合は、定形外の処理を行うために単純に実行
*/
config.app[config.appIdf].syncTable = {
}
/* PanelTable */
config.app[config.appIdf].panelTable = {

}
/*
	このファイルはconfig.jsのアプリ別拡張データ
	config.jsよりもあと、なるべく早いタイミングで実行のこと
*/