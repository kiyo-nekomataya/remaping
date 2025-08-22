/**	
 *	@fileOverview
 *	<pre>メニューコマンド関連オブジェクト
 	
 *	</pre>
 */
'use strict';
/*<pre> メニューコマンド定義 書式
    エレクトロンのメニューアイテムとUAFのメニューアイテムを兼用
    両方のプロパティを持つ
        id          :{Number}
            コマンドID 整数 ユニーク
            コレクション（親配列）IDをそのまま使用する 定義不要
        type        :{String}
            カテゴリプロパティ window|command
            "window"    サブコマンドを持ったウインドウまたはパネルを開く 
            "command"   単独で機能を実行する
        key         :{String}
            ASCIIコード範囲内 ユニーク
            特定のウインドウのサブコマンドである場合は
            ウィンドウのキーをプレフィックスとして共有する
        label       :{String}
            ラベル（表示するものがない場合は自由）非ユニーク
            多言語化キー
        func        :{String|Function}
            ロール文字列またはファンクション
        icon        :{String}
            コマンドアイコンイメージ文字列
        hotKey      :{String or keycode}
            [ctrl][cmd][option][alt][enter][del]
            [shift][tab][esc][caps]|[A][B]
            ブラケットで囲んだキーワードまたは文字
            一文字はそのキーを表す
            数値はキーコード
            同時押しは",(コンマ)"区切りで併記
        description :[String]
            メニューに付随するショートヘルプメッセージ
        note        :{String}
            コメント 解説 翻訳対象外
eg
コマンド
  {
    "id"         : ""
    "type"       : "command",
    "key"        : "app-quit",
    "label"      : "終了",
    "func"       : "xUI.quit",
    "icon"       : "quit",
    "hotkey"     : "[ctrl]+[Q]",
    "description": "アプリケーション終了",
    "note"       : "アプリケーションを終了します"
  },
サブコマンドトレーラー
  {
    "id"         : ""
    "type"       : "window",
    "key"        : "file",
    "label"      : "ファイル",
    "func"       : "",
    "icon"       : "",
    "hotkey"     : "",
    "description": "",
    "note"       : ""
  },
サブコマンド
  {
    "id"         : ""
    "type"       : "command",
    "key"        : "file-open",
    "label"      : "",
    "func"       : "",
    "icon"       : "",
    "hotkey"     : "",
    "description": "",
    "note"       : ""
  },
  </pre>
 */
/*
Document
    open
        フォルダを開く
        フォルダにはタイトル・エピソード・カット・ライン・ステージ・ジョブを設定
        対象のプロダクトを検索して設定する
    close
        閉じる
        編集対象フォルダを閉じる
    ーーーー
    リネーム実行
    現在の名前でダウンロード
    リネームスクリプト
    ーーーー
    伝票

Edit
    選択|解除(フォーカス位置のエントリをアクティブ｜非アクティブに）
    ↑→↓←(フォーカス位置を移動）
    コピー(ファイルパスをクリップボードにコピー)
    カット(ファイルパスをクリップボードにコピーしてエントリを削除)
    ペースト(クリップボードにファイルパスがあればそれをフォーカス位置に挿入)
    全選択（全エントリをアクティブ）
    全解除（全エントリを非アクティブに）
    ソート
    逆順

    名前変更
        プレフィクス設定
        サフィックス設定
        置換
        正規表現置換
        識別子編集

表示・設定
    (☑ 自動リネーム?)
    ☑ 伝票を自動で保存
    ☑ 自動ソート
    ☑ サムネイル
    連番桁数
        1:0
        2:00
        3:000
        4:0000
        5:00000
View
    リロード
    キャッシュをクリアして再読み込み
    開発ツール
    ーーーー
    実際のサイズ
    拡大
    縮小
    ーーーー
    フルスクリーンにする

サーバ...
    作業ユーザ
    サインイン
    ーーーー
    コンソール
    マネージャー
    ストーリーボードエディタ
    タイムシートエディタ
    
ツール
    リネームツール
    電卓
    ストップウオッチ
    
Window
    最小化
    全画面|戻る
    最前面へ
    
ヘルプ
    使い方ガイド
    UAF画稿名ルール
    PS拡張機能インストール
    AE拡張機能インストール
    ーーーー
    リネームツールについて

    */
/**
    xUI 汎用メニューコマンドアイテム
    ドロップダウンメニュー|アイコンポタン｜コンテキストメニュー等に汎用的に使用するオブジェクト
    アイテム自身にサブコマンドを持ったアイテムトレーラーとしての機能がある？
    
*/
//nas.menuItems = new nas.MenuItemCollection();
//nas.menuList  = '';

//mainMenuDB初期化
    $.ajax({
        url: 'template/menu/nas_menuItems.text',
        dataType: 'text',
        success: function(result){
console.log(result);
          nas.menuItems.parseConfig(result);
        }
    });
//applicationMenuList初期化
    $.ajax({
        url: 'template/menu/pman_applicationMenu.text',
        dataType: 'text',
        success: function(result){
console.log(result);
          nas.applicationMenuList = result;

//          document.getElementById('webpulldownmenu').innerHTML = nas.build
        }
    });
//contextMenuList初期化
    $.ajax({
        url: 'template/menu/pman_contextMenu.text',
        dataType: 'text',
        success: function(result){
console.log(result);
          nas.contextMenuList = result;
        }
    });
//iconBarMenuList初期化
    $.ajax({
        url: 'template/menu/pman_iconBarMenu.text',
        dataType: 'text',
        success: function(result){
console.log(result);
          nas.iconBarMenuList = result;
        }
    });



/*
xUI.commands = new nas.MenuItemCollection();//CommandCollection
xUI.commands.parseConfig(menuItemSource);
 console.log(xUI.commands);
 console.log(xUI.commands.dump('JSON'));
 console.log(xUI.commands.dump('dump'));
 console.log(xUI.commands.dump('text'));
 */
/**
    一覧用出力
    編集用出力に拡張予定
    @params {String}  form
    フォーマット指定キーワード
    

xUI.commands.toString=function(form){
	var result = '<ul>';
  for (var i = 0;i < this.length;i ++){
	if(this[i].type=='window') result += "<hr>";
	result += "<li style='height:50px;'> ";
	result += "<span>"+nas.Zf(this[i].id,3)+"</span>";
	if(this[i].type != 'window') result += " <span style='width:64px;'> ........ </span>";
//	result += "<span>"+this[i].type+"</span>";
	result += "<button ";
	result += "class='boxButton iconButton-"+this[i].icon+"'"
	result += ">";
	result += "</button>";
	result += "<span style='color:#880000;'> ["+this[i].type+"] </span>";
//	result += "<span style='font-size:12px;'> "+this[i].label+" </span> >";
	result += "<span style='font-size:24px;' data-i18n='" +this[i].label+ "'></span>";
	result += "< <span style='color:#880000;'> "+this[i].hotkey+" </span>";
//	result += "<span style='color:#0000aa;font-size:18px;'> "+this[i].description+" </span> ";
	result += "<span style='color:#0000aa;font-size:18px;' data-i18n='"+this[i].description+"'> "+this[i].description+" </span> ";
	result += "<span style='color:#888888;'> "+this[i].note+" </span>";
	result += " / <span style='color:#aaaaaa;width:96px;'> "+this[i].key+" </span>\n";
  }
	result += "</ul>";
	
//    document.getElementById('commandList').innerHTML=result;
    return result;
};

*/