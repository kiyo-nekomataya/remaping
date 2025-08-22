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

var menuItems = [
  {
    "id": 0,
    "type": "command",
    "key": "NOP",
    "label": "nop",
    "func": "function(){}",
    "icon": "NOP",
    "hotkey": "",
    "description": "nop",
    "note": "有効な動作が存在しない空オブジェクト 未定値に割り付ける特殊アイテム"
  },
  {
    "id": 1,
    "type": "window",
    "key": "application",
    "label": "----",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "Application",
    "note": "アプリケーション全体に対するコマンドトレーラー"
  },
  {
    "id": 2,
    "type": "command",
    "key": "application-managementMode",
    "label": "managementmode",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "管理モード切り替え",
    "note": "制作管理メニューを呼ぶ"
  },
  {
    "id": 3,
    "type": "command",
    "key": "application-chgLoacle",
    "label": "chglocale",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "chglocale_description",
    "note": "アプリケーションの言語を切替"
  },
  {
    "id": 4,
    "type": "command",
    "key": "application-dbgMode",
    "label": "dbgmode",
    "func": "",
    "icon": "debug",
    "hotkey": "",
    "description": "dbgmode_description",
    "note": "デバッグモード切替"
  },
  {
    "id": 5,
    "type": "command",
    "key": "application-reload",
    "label": "reload",
    "func": "",
    "icon": "reload",
    "hotkey": "",
    "description": "reload_description",
    "note": "アプリケーションを再読込する"
  },
  {
    "id": 6,
    "type": "command",
    "key": "application-bgColor",
    "label": "backgroundcolor",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "sheetbackgroundcolor",
    "note": "シート背景色の設定（拡張予定）"
  },
  {
    "id": 7,
    "type": "window",
    "key": "documentSelector",
    "label": "browse",
    "func": "",
    "icon": "open_X",
    "hotkey": "[ctrl],[O]",
    "description": "browse_description",
    "note": "ドキュメントセレクタを開いて共有上のドキュメントを選ぶ"
  },
  {
    "id": 8,
    "type": "command",
    "key": "documentSelector-lineSelect",
    "label": "nodechart",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "nodechart_description",
    "note": "制作パスのラインを選択"
  },
  {
    "id": 9,
    "type": "command",
    "key": "documentSelector-jobSelect",
    "label": "jobselector",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "jobselector_description",
    "note": "作業ノードを選択"
  },
  {
    "id": 10,
    "type": "command",
    "key": "documentSelector-toReference",
    "label": "reference",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "copytoreference",
    "note": "選択したジョブを参照エリアへ"
  },
  {
    "id": 11,
    "type": "command",
    "key": "documentSelector-open",
    "label": "open",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "importdata",
    "note": "選択したドキュメントを開く"
  },
  {
    "id": 12,
    "type": "command",
    "key": "documentSelector-search",
    "label": "search",
    "func": "",
    "icon": "search",
    "hotkey": "",
    "description": "repositorysearch_description",
    "note": "対象リポジトリ内でドキュメントを検索"
  },
  {
    "id": 13,
    "type": "command",
    "key": "documentSelector-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "windowclose_description",
    "note": "ドキュメントセレクタを閉じる"
  },
  {
    "id": 14,
    "type": "command",
    "key": "documentSelector-repository",
    "label": "chgrepository",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "chgrepository_description",
    "note": "共有を切替"
  },
  {
    "id": 15,
    "type": "command",
    "key": "documentSelector-title",
    "label": "title",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タイトル選択",
    "note": "タイトルでフィルタ"
  },
  {
    "id": 16,
    "type": "command",
    "key": "documentSelector-number",
    "label": "number",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "カット番号",
    "note": "カット番号でフィルタ"
  },
  {
    "id": 17,
    "type": "command",
    "key": "documentSelector-status",
    "label": "status",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ステータス",
    "note": "ステータスでフィルタ"
  },
  {
    "id": 18,
    "type": "command",
    "key": "documentSelector-sortReset",
    "label": "reset",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ソート解除",
    "note": "ソート条件を解除"
  },
  {
    "id": 19,
    "type": "command",
    "key": "documentSelector-sortByName",
    "label": "sortByName",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "番号ソート",
    "note": "カット名（番号）でソート"
  },
  {
    "id": 20,
    "type": "command",
    "key": "documentSelector-sortByStage",
    "label": "sortByStage",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "工程ソート",
    "note": "工程でソート"
  },
  {
    "id": 21,
    "type": "command",
    "key": "documentSelector-sortByUid",
    "label": "sortByUid",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ユーザソート",
    "note": "最終作業ユーザでソート"
  },
  {
    "id": 22,
    "type": "command",
    "key": "documentSelector-sortByDate",
    "label": "sortByDate",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "日付ソート",
    "note": "最終更新日付でソート"
  },
  {
    "id": 23,
    "type": "command",
    "key": "documentSelector-sortByStatus",
    "label": "sortByStatus",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ステータスソート",
    "note": "作業ステータスでソート"
  },
  {
    "id": 24,
    "type": "command",
    "key": "documentSelector-line",
    "label": "line",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ライン",
    "note": "ラインでフィルタ"
  },
  {
    "id": 25,
    "type": "command",
    "key": "documentSelector-type",
    "label": "type",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タイプ",
    "note": "データ種別でフィルタ"
  },
  {
    "id": 26,
    "type": "command",
    "key": "documentSelector-selectEpisode",
    "label": "selectEpisode",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "エピソード",
    "note": "エピソード選択"
  },
  {
    "id": 27,
    "type": "command",
    "key": "documentSelector-selectEntry",
    "label": "selectEntry",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ドキュメント",
    "note": "ドキュメント選択"
  },
  {
    "id": 28,
    "type": "window",
    "key": "nodeControl",
    "label": "----",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "",
    "note": "ノードコントロールコマンド群 常時表示"
  },
  {
    "id": 29,
    "type": "command",
    "key": "nodeControl-checkin",
    "label": "作業開始",
    "func": "",
    "icon": "checkin",
    "hotkey": "",
    "description": "作業チェックイン",
    "note": "現在のドキュメントに作業チェックインする"
  },
  {
    "id": 30,
    "type": "command",
    "key": "nodeControl-store",
    "label": "作業保存",
    "func": "",
    "icon": "store",
    "hotkey": "",
    "description": "作業保存",
    "note": "現在のドキュメントを保存する"
  },
  {
    "id": 31,
    "type": "command",
    "key": "nodeControl-checkout",
    "label": "作業終了",
    "func": "",
    "icon": "checkout",
    "hotkey": "",
    "description": "作業チェックアウト",
    "note": "現在のドキュメントから作業チェックアウトする"
  },
  {
    "id": 32,
    "type": "command",
    "key": "nodeControl-activate",
    "label": "作業再開",
    "func": "",
    "icon": "activate",
    "hotkey": "",
    "description": "作業再開",
    "note": "以前の作業に再度チェックインする"
  },
  {
    "id": 33,
    "type": "command",
    "key": "nodeControl-discard",
    "label": "作業破棄",
    "func": "",
    "icon": "destroy",
    "hotkey": "",
    "description": "編集を破棄して閉じる",
    "note": "現在の作業を廃棄して閉じる 取消不能"
  },
  {
    "id": 34,
    "type": "command",
    "key": "nodeControl-deactivate",
    "label": "作業保留",
    "func": "",
    "icon": "deactivate",
    "hotkey": "",
    "description": "編集を保留する",
    "note": "現在の作業チェックイン状態を保持して止める"
  },
  {
    "id": 35,
    "type": "command",
    "key": "nodeControl-receipt",
    "label": "作業検収",
    "func": "",
    "icon": "receipt",
    "hotkey": "",
    "description": "工程を閉じて次の工程を開く",
    "note": "工程の終了を確認して工程を閉じる＝つぎの工程を開く（管理メニュー）"
  },
  {
    "id": 36,
    "type": "command",
    "key": "nodeControl-salvage",
    "label": "作業引揚",
    "func": "",
    "icon": "salvage",
    "hotkey": "",
    "description": "強制的に作業を閉じる",
    "note": "終了していない作業を強制的に閉じる（引揚）（管理メニュー）"
  },
  {
    "id": 37,
    "type": "command",
    "key": "nodeControl-abort",
    "label": "制作中断",
    "func": "",
    "icon": "abort",
    "hotkey": "",
    "description": "制作を中断する",
    "note": "エントリをソフトウェア的に削除する（欠番処理）（管理メニュー）"
  },
  {
    "id": 38,
    "type": "command",
    "key": "nodeControl-branch",
    "label": "工程分岐",
    "func": "",
    "icon": "branch",
    "hotkey": "",
    "description": "ラインを分岐する",
    "note": "任意の工程の終端から並行作業を立ち上げる（管理メニュー）"
  },
  {
    "id": 39,
    "type": "command",
    "key": "nodeControl-offline",
    "label": "オフライン発行",
    "func": "",
    "icon": "branch",
    "hotkey": "",
    "description": "オフライン分岐を発行",
    "note": "オフライン用データを書き出す（管理メニュー）"
  },
  {
    "id": 40,
    "type": "command",
    "key": "nodeControl-merge",
    "label": "ラインマージ",
    "func": "",
    "icon": "merge",
    "hotkey": "",
    "description": "オフライン分岐を統合",
    "note": "オフライン用データを統合する（管理メニュー）"
  },
  {
    "id": 41,
    "type": "window",
    "key": "xpstInf",
    "label": "タイムシート情報",
    "func": "",
    "icon": "xps",
    "hotkey": "",
    "description": "タイムシート情報",
    "note": "タイムシート(Xpst)情報パネル - 新規作成を兼ねる"
  },
  {
    "id": 42,
    "type": "command",
    "key": "xpstInf-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 43,
    "type": "window",
    "key": "newxMap",
    "label": "新規エントリ",
    "func": "",
    "icon": "xmap",
    "hotkey": "",
    "description": "カット袋を新規に登録",
    "note": "＊新規のエントリを作成（管理メニュー）"
  },
  {
    "id": 44,
    "type": "command",
    "key": "newxMap-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "新規作成パネルを閉じる"
  },
  {
    "id": 45,
    "type": "window",
    "key": "inherit",
    "label": "兼用設定",
    "func": "",
    "icon": "inherit",
    "hotkey": "",
    "description": "兼用を追加",
    "note": "カット袋の兼用情報を編集作成（管理メニュー）"
  },
  {
    "id": 46,
    "type": "command",
    "key": "inherit-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 47,
    "type": "window",
    "key": "extIO",
    "label": "Import/Export",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "読み込み書き出しパネルを開く",
    "note": "入出力パネルを開く（デバッグ用）"
  },
  {
    "id": 48,
    "type": "command",
    "key": "extIO-importDatas",
    "label": "import",
    "func": "",
    "icon": "imp",
    "hotkey": "[ctrl],[O]",
    "description": "読込",
    "note": "アプリケーション環境でテキスト入力｜ファイル等で外部データを開く"
  },
  {
    "id": 49,
    "type": "command",
    "key": "extIO-exportFSps",
    "label": "export",
    "func": "",
    "icon": "exp",
    "hotkey": "[shift],[ctrl],[S]",
    "description": "書出",
    "note": "アプリケーション環境でテキスト｜ファイル等で外部にデータを出力"
  },
  {
    "id": 50,
    "type": "command",
    "key": "extIO-downloadXps",
    "label": "Export as Xps",
    "func": "",
    "icon": "cgiStore",
    "hotkey": "[shift],[ctrl],[S]",
    "description": "ダウンロード保存（XPS）",
    "note": "形式を指定してダウンロード保存（書出の部分メニュー）"
  },
  {
    "id": 51,
    "type": "command",
    "key": "extIO-downloadTdts",
    "label": "Export as Tdts",
    "func": "",
    "icon": "cgiStore",
    "hotkey": "",
    "description": "ダウンロード保存（TDTS）",
    "note": "形式を指定してダウンロード保存（書出の部分メニュー）"
  },
  {
    "id": 52,
    "type": "command",
    "key": "extIO-downloadXdts",
    "label": "Export as Xdts",
    "func": "",
    "icon": "cgiStore",
    "hotkey": "",
    "description": "ダウンロード保存（XDTS）",
    "note": "形式を指定してダウンロード保存（書出の部分メニュー）"
  },
  {
    "id": 53,
    "type": "command",
    "key": "extIO-exportHTML",
    "label": "Export as html",
    "func": "",
    "icon": "cgiStore",
    "hotkey": "",
    "description": "表示用HTMLで書出し",
    "note": "形式を指定してダウンロード保存（書出の部分メニュー）"
  },
  {
    "id": 54,
    "type": "command",
    "key": "extIO-buildActionSheet",
    "label": "exportActionSheet",
    "func": "",
    "icon": "xps",
    "hotkey": "",
    "description": "原画アクションシートを作成",
    "note": "原画アクションシートを作成して保存"
  },
  {
    "id": 55,
    "type": "command",
    "key": "extIO-printHTML",
    "label": "Print HTML",
    "func": "",
    "icon": "printer",
    "hotkey": "",
    "description": "印刷",
    "note": "印刷用ページを表示"
  },
  {
    "id": 56,
    "type": "command",
    "key": "extIO-exportEPS",
    "label": "Export as eps",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "epsで画像書出し（実験中）",
    "note": "epsデータで書き出し（中止予定）"
  },
  {
    "id": 57,
    "type": "window",
    "key": "authorize",
    "label": "Authorize",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "認証パネル",
    "note": "認証パネルを表示"
  },
  {
    "id": 58,
    "type": "command",
    "key": "authorize-signInOut",
    "label": "Authorize",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "サインイン/アウト",
    "note": "入力データを使用してサインイン/サインアウト"
  },
  {
    "id": 59,
    "type": "window",
    "key": "selection",
    "label": "----",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "選択範囲",
    "note": "選択範囲関連コマンド"
  },
  {
    "id": 60,
    "type": "command",
    "key": "selection-selectAll",
    "label": "selectAll",
    "func": "",
    "icon": "selectBox",
    "hotkey": "[ctrl],[A]",
    "description": "全選択",
    "note": "全体を選択範囲に"
  },
  {
    "id": 61,
    "type": "command",
    "key": "selection-cut",
    "label": "Cut",
    "func": "",
    "icon": "cut",
    "hotkey": "[ctrl],[X]",
    "description": "カット",
    "note": "選択範囲を切取"
  },
  {
    "id": 62,
    "type": "command",
    "key": "selection-copy",
    "label": "Copy",
    "func": "",
    "icon": "copy",
    "hotkey": "[ctrl],[C]",
    "description": "複写",
    "note": "選択範囲を複写"
  },
  {
    "id": 63,
    "type": "command",
    "key": "selection-paste",
    "label": "Paste",
    "func": "",
    "icon": "paste",
    "hotkey": "[ctrl],[V]",
    "description": "貼付け",
    "note": "ヤンクバッファ内容を貼付け"
  },
  {
    "id": 64,
    "type": "window",
    "key": "renameTL",
    "label": "renameTL",
    "func": "",
    "icon": "layerName",
    "hotkey": "",
    "description": "タイムライントラックラベル変更",
    "note": ""
  },
  {
    "id": 65,
    "type": "command",
    "key": "renameTL-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 66,
    "type": "window",
    "key": "editTN",
    "label": "editTrackTag",
    "func": "",
    "icon": "layerName",
    "hotkey": "",
    "description": "タイムライントラックタグ編集",
    "note": ""
  },
  {
    "id": 67,
    "type": "command",
    "key": "editTN-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 68,
    "type": "window",
    "key": "edit-xpst",
    "label": "----",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タイムシート編集",
    "note": "タイムシート編集関連コマンド"
  },
  {
    "id": 69,
    "type": "command",
    "key": "edit-xpst-clearTL",
    "label": "ClearTL",
    "func": "",
    "icon": "clearTL",
    "hotkey": "",
    "description": "一列クリア",
    "note": "タイムライントラックをクリア"
  },
  {
    "id": 70,
    "type": "command",
    "key": "edit-xpst-clearSheet",
    "label": "ClearAll",
    "func": "",
    "icon": "clearTL",
    "hotkey": "",
    "description": "シートをクリア",
    "note": "タイムシート全体をクリア"
  },
  {
    "id": 71,
    "type": "command",
    "key": "edit-xpst-insertBlank",
    "label": "InsertBlank",
    "func": "",
    "icon": "blockInsert",
    "hotkey": "",
    "description": "選択範囲にカラコマを挿入",
    "note": "選択範囲にブランクセルを挿入"
  },
  {
    "id": 72,
    "type": "command",
    "key": "edit-xpst-blockRemove",
    "label": "BlockDelete",
    "func": "",
    "icon": "blockRemove",
    "hotkey": "",
    "description": "ブロックで削除",
    "note": "選択範囲をブロック削除"
  },
  {
    "id": 73,
    "type": "command",
    "key": "edit-xpst-addSoundTrack",
    "label": "addSoundTrack",
    "func": "",
    "icon": "addSoundTL",
    "hotkey": "",
    "description": "音声トラック追加",
    "note": "選択トラックの右側に音響トラックを追加"
  },
  {
    "id": 74,
    "type": "command",
    "key": "edit-xpst-addStilTL",
    "label": "addStilTL",
    "func": "",
    "icon": "addStilTL",
    "hotkey": "",
    "description": "静止画トラック追加",
    "note": "選択トラックの右側に静止画トラックを追加"
  },
  {
    "id": 75,
    "type": "command",
    "key": "edit-xpst-addReplacementTL",
    "label": "addCellTL",
    "func": "",
    "icon": "addReplacementTL",
    "hotkey": "",
    "description": "動画トラック追加",
    "note": "選択トラックの右側に動画トラックを追加"
  },
  {
    "id": 76,
    "type": "command",
    "key": "edit-xpst-addCameraTL",
    "label": "addCameraTL",
    "func": "",
    "icon": "addCameraTL",
    "hotkey": "",
    "description": "カメラを追加",
    "note": "選択トラックの右側にカメラワークトラックを追加"
  },
  {
    "id": 77,
    "type": "command",
    "key": "edit-xpst-addGeometryTL",
    "label": "addStageworkTL",
    "func": "",
    "icon": "addStageworkTL",
    "hotkey": "",
    "description": "ステージワークを追加",
    "note": "選択トラックの右側にステージワークトラックを追加"
  },
  {
    "id": 78,
    "type": "command",
    "key": "edit-xpst-addSfxTL",
    "label": "addSfxTL",
    "func": "",
    "icon": "addEffectsTL",
    "hotkey": "",
    "description": "効果を追加",
    "note": "選択トラックの右側に効果トラックを追加"
  },
  {
    "id": 79,
    "type": "command",
    "key": "edit-xpst-insertTL",
    "label": "InsertTL",
    "func": "",
    "icon": "insertTL",
    "hotkey": "",
    "description": "トラック挿入",
    "note": "選択トラックの左側に動画トラックを挿入"
  },
  {
    "id": 80,
    "type": "command",
    "key": "edit-xpst-deleteTL",
    "label": "DeleteTL",
    "func": "",
    "icon": "removeTL",
    "hotkey": "",
    "description": "トラック削除",
    "note": "選択範囲のトラックを削除"
  },
  {
    "id": 81,
    "type": "commnad",
    "key": "edit-xpst-formatTL",
    "label": "FormatTL",
    "func": "",
    "icon": "reformat",
    "hotkey": "",
    "description": "タイムライン整形",
    "note": ""
  },
  {
    "id": 82,
    "type": "command",
    "key": "edit-xpst-formatSheet",
    "label": "FormatSheet",
    "func": "",
    "icon": "reformat",
    "hotkey": "",
    "description": "シートを整形",
    "note": "タイムシートを簡易整形"
  },
  {
    "id": 83,
    "type": "command",
    "key": "edit-xpst-simplifyTL",
    "label": "simplifyTL",
    "func": "",
    "icon": "reformat",
    "hotkey": "",
    "description": "タイムライン単整形",
    "note": "選択範囲のタイムラインを単純化"
  },
  {
    "id": 84,
    "type": "command",
    "key": "edit-xpst-simplifySheet",
    "label": "simplifySheet",
    "func": "",
    "icon": "simplify",
    "hotkey": "",
    "description": "タイムシート単整形",
    "note": "タイムシートを単純化"
  },
  {
    "id": 85,
    "type": "command",
    "key": "edit-xpst-circle",
    "label": "◯かこみ",
    "func": "",
    "icon": "addCircle",
    "hotkey": "",
    "description": "丸囲い",
    "note": "シートセルを丸で囲む"
  },
  {
    "id": 86,
    "type": "command",
    "key": "edit-xpst-angles",
    "label": "△かこみ",
    "func": "",
    "icon": "addAngles",
    "hotkey": "",
    "description": "三角囲い",
    "note": "シートセルを三角で囲む"
  },
  {
    "id": 87,
    "type": "command",
    "key": "edit-xpst-brakcets",
    "label": "□かこみ",
    "func": "",
    "icon": "addBrackets",
    "hotkey": "",
    "description": "四角囲い",
    "note": "シートセルを四角で囲む"
  },
  {
    "id": 88,
    "type": "command",
    "key": "edit-xpst-incr",
    "label": "incrementnum",
    "func": "",
    "icon": "incr",
    "hotkey": "",
    "description": "incrementnum_description",
    "note": "選択範囲のセルの値を繰上"
  },
  {
    "id": 89,
    "type": "command",
    "key": "edit-xpst-decr",
    "label": "decrementnum",
    "func": "",
    "icon": "decr",
    "hotkey": "",
    "description": "decrementnum_description",
    "note": "選択範囲のセルの値を繰下"
  },
  {
    "id": 90,
    "type": "command",
    "key": "edit-xpst-framerate",
    "label": "FPS",
    "func": "",
    "icon": "framerate",
    "hotkey": "",
    "description": "フレームレート設定",
    "note": "ドキュメントフレームレートを設定"
  },
  {
    "id": 91,
    "type": "window",
    "key": "document",
    "label": "----",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ドキュメント操作",
    "note": "ドキュメント全体の操作コマンド"
  },
  {
    "id": 92,
    "type": "command",
    "key": "document-pushBackup",
    "label": "pushBackup",
    "func": "",
    "icon": "put",
    "hotkey": "",
    "description": "バックアップ更新",
    "note": "作業データをバックアップ"
  },
  {
    "id": 93,
    "type": "command",
    "key": "document-restoreBackup",
    "label": "restoreBackup",
    "func": "",
    "icon": "get",
    "hotkey": "",
    "description": "バックアップ復帰",
    "note": "作業バックアップを復帰"
  },
  {
    "id": 94,
    "type": "command",
    "key": "document-clearBackup",
    "label": "clearBackup",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "バックアップをクリア",
    "note": "作業バックアップ領域をクリア"
  },
  {
    "id": 95,
    "type": "command",
    "key": "extIO-importReference",
    "label": "importReference",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "参照読込",
    "note": "ファイルブラウザを開き参照エリアへ読み込むデータを選択"
  },
  {
    "id": 96,
    "type": "command",
    "key": "selection-copyToReference",
    "label": "copy to Ref.",
    "func": "",
    "icon": "toReference",
    "hotkey": "",
    "description": "参照エリアへ転記",
    "note": "参照エリアに編集内容を転記"
  },
  {
    "id": 97,
    "type": "command",
    "key": "selection-copyFromReference",
    "label": "copy from Ref.",
    "func": "",
    "icon": "fromReference",
    "hotkey": "",
    "description": "参照エリアから転記",
    "note": "参照エリアから編集エリアへ転記"
  },
  {
    "id": 98,
    "type": "command",
    "key": "selection-clearReference",
    "label": "clear Ref.",
    "func": "",
    "icon": "eraser",
    "hotkey": "",
    "description": "参照エリア消去",
    "note": "参照エリアの内容をクリア"
  },
  {
    "id": 99,
    "type": "window",
    "key": "aboutPanel",
    "label": "about",
    "func": "",
    "icon": "xps",
    "hotkey": "",
    "description": "りまぴんについて",
    "note": "アプリケーション情報パネルを表示"
  },
  {
    "id": 100,
    "type": "command",
    "key": "aboutPanel-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "アバウトパネルを閉じる"
  },
  {
    "id": 101,
    "type": "window",
    "key": "dialogPanel",
    "label": "dialogPanel",
    "func": "",
    "icon": "dialogEdit",
    "hotkey": "",
    "description": "台詞編集",
    "note": "台詞編集パネル"
  },
  {
    "id": 102,
    "type": "command",
    "key": "dialogPanel-apply",
    "label": "apply",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "適用",
    "note": "編集内容をタイムラインに適用"
  },
  {
    "id": 103,
    "type": "command",
    "key": "dialogPanel-fix",
    "label": "fix",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "確定",
    "note": "編集内容を確定してパネルを閉じる"
  },
  {
    "id": 104,
    "type": "command",
    "key": "dialogPanel-resete",
    "label": "reset",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "編集解除",
    "note": "編集内容を破棄する"
  },
  {
    "id": 105,
    "type": "command",
    "key": "dialogPanel-textInsert",
    "label": "textInsert",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "単語挿入",
    "note": "カーソル位置に挿入"
  },
  {
    "id": 106,
    "type": "command",
    "key": "dialogPanel-addAttribute",
    "label": "addAttribute",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "属性追加",
    "note": "台詞に属性を加える"
  },
  {
    "id": 107,
    "type": "command",
    "key": "dialogPanel-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "台詞編集パネルを閉じる"
  },
  {
    "id": 108,
    "type": "window",
    "key": "skb",
    "label": "softwareKB",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ソフトウェアキーボード",
    "note": "ソフトウェアキーボードを開く"
  },
  {
    "id": 109,
    "type": "command",
    "key": "skb-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "ソフトウェアキーボーを閉じる"
  },
  {
    "id": 110,
    "type": "window",
    "key": "preferencePanel",
    "label": "preferencePanel",
    "func": "",
    "icon": "gia",
    "hotkey": "",
    "description": "各種環境設定",
    "note": "環境設定パネル"
  },
  {
    "id": 111,
    "type": "command",
    "key": "preferencePanel-reset",
    "label": "reset",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "reset",
    "note": "編集内容をリセット"
  },
  {
    "id": 112,
    "type": "command",
    "key": "preferencePanel-apply",
    "label": "apply",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "apply",
    "note": "編集内容をアプリケーションに適用"
  },
  {
    "id": 113,
    "type": "command",
    "key": "preferencePanel-save",
    "label": "save",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "設定を保存",
    "note": "設定をクッキーで保存"
  },
  {
    "id": 114,
    "type": "command",
    "key": "preferencePanel-clear",
    "label": "clear",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "設定を削除",
    "note": "設定クッキーを削除"
  },
  {
    "id": 115,
    "type": "command",
    "key": "preferencePanel-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "環境設定パネルを閉じる"
  },
  {
    "id": 116,
    "type": "window",
    "key": "repositoryInfo",
    "label": "リポジトリの情報を見る",
    "func": "",
    "icon": "info",
    "hotkey": "",
    "description": "共有情報",
    "note": "共有情報パネルを開く"
  },
  {
    "id": 117,
    "type": "command",
    "key": "repositoryInfo-",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "",
    "note": ""
  },
  {
    "id": 118,
    "type": "window",
    "key": "memoEdit",
    "label": "メモ編集",
    "func": "",
    "icon": "pen_3",
    "hotkey": "",
    "description": "メモ欄",
    "note": "メモ欄用編集パネルを開く"
  },
  {
    "id": 119,
    "type": "command",
    "key": "memoEdit-",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "",
    "note": ""
  },
  {
    "id": 120,
    "type": "command",
    "key": "memoEdit-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "メモ編集UIを閉じる"
  },
  {
    "id": 121,
    "type": "window",
    "key": "stbd",
    "label": "絵コンテ",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "絵コンテ表示",
    "note": "現在選択中のエピソードを絵コンテ表示でみる"
  },
  {
    "id": 122,
    "type": "command",
    "key": "stbd-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 123,
    "type": "window",
    "key": "application-xpst",
    "label": "----",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タイムシート画面設定",
    "note": "タイムシート画面表示設定"
  },
  {
    "id": 124,
    "type": "command",
    "key": "application-xpst-pageColumns",
    "label": "段組",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タイムシート段組",
    "note": "タイムシートの段組指定"
  },
  {
    "id": 125,
    "type": "command",
    "key": "application-xpst-pageLength",
    "label": "pageLength",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ページ長",
    "note": "タイムシートのページ長（秒数）"
  },
  {
    "id": 126,
    "type": "command",
    "key": "application-xpst-diff",
    "label": "DIFF",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タイムシート差分表示",
    "note": "参照エリアとの差分を表示（旧フットスタンプ）"
  },
  {
    "id": 127,
    "type": "command",
    "key": "application-xpst-cursorLoop",
    "label": "cursorLoop",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "カーソルキーでループ",
    "note": "矢印キーでシート上下をループ接続"
  },
  {
    "id": 128,
    "type": "command",
    "key": "application-xpst-spinLoop",
    "label": "spinLoop",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "スピン動作でループ",
    "note": "スピン操作でシート上下をループ接続"
  },
  {
    "id": 129,
    "type": "command",
    "key": "application-xpst-tabFix",
    "label": "tabFix",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "タブで確定",
    "note": "タブキーを確定操作に含める"
  },
  {
    "id": 130,
    "type": "command",
    "key": "application-xpst-syncInput",
    "label": "syncInput",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "入力同期",
    "note": "キー入力を画面に同期"
  },
  {
    "id": 131,
    "type": "command",
    "key": "application-xpst-restrictionMode",
    "label": "制限モード]",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "制限モード切り替え",
    "note": "タイムシートを制限表示モードに切替"
  },
  {
    "id": 132,
    "type": "command",
    "key": "application-xpst-pageMode",
    "label": "表示モード ]",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "表示モード切り替え",
    "note": "ページ｜スクロール表示の切替"
  },
  {
    "id": 133,
    "type": "command",
    "key": "application-xpst-zoom",
    "label": "zoom",
    "func": "",
    "icon": "zoom",
    "hotkey": "",
    "description": "zoomChange",
    "note": "タイムシートのズーム表示切替"
  },
  {
    "id": 134,
    "type": "command",
    "key": "application-xpst-unZoom",
    "label": "100%",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "zoom100%",
    "note": "タイムシートのズーム表示解除"
  },
  {
    "id": 135,
    "type": "command",
    "key": "application-xpst-referenceArea",
    "label": "references",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "参照エリア",
    "note": "参照エリアの表示"
  },
  {
    "id": 136,
    "type": "command",
    "key": "application-xpst-home",
    "label": "HOME",
    "func": "",
    "icon": "goHome",
    "hotkey": "",
    "description": "開始位置",
    "note": "開始位置へ戻る"
  },
  {
    "id": 137,
    "type": "command",
    "key": "application-xpst-end",
    "label": "END",
    "func": "",
    "icon": "goHome",
    "hotkey": "",
    "description": "末尾",
    "note": "カット末尾へ"
  },
  {
    "id": 138,
    "type": "window",
    "key": "menu",
    "label": "dropdownMenu",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ドロップダウンメニュー",
    "note": "ドロップダウンメニューの表示"
  },
  {
    "id": 139,
    "type": "command",
    "key": "menu-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "ドロップダウンメニューを非表示"
  },
  {
    "id": 140,
    "type": "window",
    "key": "accountMenu",
    "label": "accountMenu",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "service account show/hide",
    "note": "アバターメニューの表示"
  },
  {
    "id": 141,
    "type": "window",
    "key": "accountMenu-pref",
    "label": "preferrence",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ユーザ情報編集",
    "note": "UATサービス互換"
  },
  {
    "id": 142,
    "type": "command",
    "key": "accountMenu-teams",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "チーム設定",
    "note": "UATサービス互換"
  },
  {
    "id": 143,
    "type": "command",
    "key": "accountMenu-members",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "メンバー管理",
    "note": "UATサービス互換"
  },
  {
    "id": 144,
    "type": "command",
    "key": "accountMenu-selectTeam",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "チーム切替",
    "note": "UATサービス互換"
  },
  {
    "id": 145,
    "type": "command",
    "key": "accountMenu-auth",
    "label": "login|logout",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "ログイン｜ログアウト",
    "note": "UATサービス互換"
  },
  {
    "id": 146,
    "type": "window",
    "key": "toolbar",
    "label": "buttonToolbar",
    "func": "",
    "icon": "util",
    "hotkey": "",
    "description": "ボタンツールバー",
    "note": "ボタンツールバーを表示"
  },
  {
    "id": 147,
    "type": "command",
    "key": "toolbar-FWD",
    "label": "commandBarFWD",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "メニュー切替左",
    "note": "ツールバーのメニューセットを切替"
  },
  {
    "id": 148,
    "type": "command",
    "key": "toolbar-BWD",
    "label": "commandBarBWD",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "メニュー切替右",
    "note": "ツールバーのメニューセットを切替"
  },
  {
    "id": 149,
    "type": "window",
    "key": "toolbar-custom",
    "label": "カスタムツールバー",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "カスタムツールバーの編集",
    "note": "ユーザ編集可能なカスタムツールバーをつくる"
  },
  {
    "id": 150,
    "type": "command",
    "key": "toolbar-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 151,
    "type": "window",
    "key": "frControl",
    "label": "フレームカウンター",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "フレームカウンター表示",
    "note": "フレームカウンターパネル表示"
  },
  {
    "id": 152,
    "type": "command",
    "key": "frControl-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 153,
    "type": "window",
    "key": "inputControl",
    "label": "入力ボックス",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "input box show/hide",
    "note": "入力コントロールエリアの表示"
  },
  {
    "id": 154,
    "type": "command",
    "key": "inputControl-spinAdd",
    "label": "spinAdd",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "スピン量加算",
    "note": "コマ送り量を増やす"
  },
  {
    "id": 155,
    "type": "command",
    "key": "inputControl-spinSub",
    "label": "spinSub",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "スピン量減算",
    "note": "コマ送り量を減らす"
  },
  {
    "id": 156,
    "type": "command",
    "key": "inputControl-selectionSpin",
    "label": "selectionSpin",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "選択範囲をスピン量に",
    "note": "選択範囲をスピン量に設定する"
  },
  {
    "id": 157,
    "type": "command",
    "key": "inputControl-OK",
    "label": "OK",
    "func": "",
    "icon": "OK",
    "hotkey": "enter]",
    "description": "適用",
    "note": "入力を適用する"
  },
  {
    "id": 158,
    "type": "command",
    "key": "inputControl-cancel",
    "label": "cancel",
    "func": "",
    "icon": "NG",
    "hotkey": "esc]",
    "description": "キャンセル",
    "note": "入力をキャンセルする"
  },
  {
    "id": 159,
    "type": "command",
    "key": "inputControl-close",
    "label": "",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "入力エリアを隠す"
  },
  {
    "id": 160,
    "type": "window",
    "key": "memoArea",
    "label": "メモ欄",
    "func": "",
    "icon": "pen_3",
    "hotkey": "",
    "description": "メモ欄の表示",
    "note": "メモ欄の表示切り替え"
  },
  {
    "id": 161,
    "type": "command",
    "key": "memoArea-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "メモ欄を非表示"
  },
  {
    "id": 162,
    "type": "window",
    "key": "dbgConsole",
    "label": "debugConsole",
    "func": "",
    "icon": "debug",
    "hotkey": "",
    "description": "debug_ON",
    "note": "デバッグコンソール表示"
  },
  {
    "id": 163,
    "type": "command",
    "key": "dbgConsole-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "デバッグコンソールを閉じる"
  },
  {
    "id": 164,
    "type": "window",
    "key": "viewSource",
    "label": "ソース",
    "func": "",
    "icon": "degub",
    "hotkey": "",
    "description": "データをテキスト閲覧",
    "note": "データをソーステキストで編集する"
  },
  {
    "id": 165,
    "type": "command",
    "key": "viewSource-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "ソースパネルを閉じる"
  },
  {
    "id": 166,
    "type": "window",
    "key": "cameraworkPanel",
    "label": "cameraPanel",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "カメラワーク編集ウインドウ",
    "note": "カメラワーク編集ウインドウ"
  },
  {
    "id": 167,
    "type": "command",
    "key": "cameraworkPanel-button",
    "label": "button",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "button",
    "note": "定形入力コマンド"
  },
  {
    "id": 168,
    "type": "command",
    "key": "cameraworkPanel-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "カメラワーク編集パネルを閉じる"
  },
  {
    "id": 169,
    "type": "window",
    "key": "soundPanel",
    "label": "soundEdit",
    "func": "",
    "icon": "soundEdit",
    "hotkey": "",
    "description": "音響編集パネル",
    "note": "SE音楽等のスポッティング編集パネルを表示"
  },
  {
    "id": 170,
    "type": "command",
    "key": "soundPanel-breve",
    "label": "𝅜",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "𝅜",
    "note": "breve"
  },
  {
    "id": 171,
    "type": "command",
    "key": "soundPanel-wholeNote",
    "label": "𝅝",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "𝅝",
    "note": "全音符"
  },
  {
    "id": 172,
    "type": "command",
    "key": "soundPanel-harfNote",
    "label": "𝅗𝅥",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "𝅗𝅥",
    "note": "2分音符"
  },
  {
    "id": 173,
    "type": "command",
    "key": "soundPanel-quarterNote",
    "label": "𝅘𝅥",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "𝅘𝅥",
    "note": "4分音符"
  },
  {
    "id": 174,
    "type": "command",
    "key": "soundPanel-eighthNote",
    "label": "♪",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "♪",
    "note": "8分音符"
  },
  {
    "id": 175,
    "type": "command",
    "key": "soundPanel-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "音響編集パネルを閉じる"
  },
  {
    "id": 176,
    "type": "window",
    "key": "AEK",
    "label": "AfterEffectsKeyData",
    "func": "",
    "icon": "aek",
    "hotkey": "",
    "description": "アフターエフェクトキーデータ",
    "note": "アフターエフェクトキーデータ調整パネル"
  },
  {
    "id": 177,
    "type": "command",
    "key": "AEK-close",
    "label": "close",
    "func": "",
    "icon": "",
    "hotkey": "",
    "description": "閉じる",
    "note": "パネルを閉じる"
  },
  {
    "id": 178,
    "type": "window",
    "key": "stopWatch",
    "label": "stopWatch",
    "func": "",
    "icon": "goToTime",
    "hotkey": "",
    "description": "ストップウオッチ機能切り替え",
    "note": "ストップウオッチパネル表示"
  },
  {
    "id": 179,
    "type": "command",
    "key": "stopWatch-GOSTOP",
    "label": "START|STOP",
    "func": "",
    "icon": "goToTime",
    "hotkey": "",
    "description": "計測開始｜停止",
    "note": "計測スイッチ"
  },
  {
    "id": 180,
    "type": "command",
    "key": "stopWatch-MARK",
    "label": "MARK",
    "func": "",
    "icon": "pen-1",
    "hotkey": "",
    "description": "マーク",
    "note": "計測マーク"
  },
  {
    "id": 181,
    "type": "command",
    "key": "stopWatch-eraceMark",
    "label": "eraseMark",
    "func": "",
    "icon": "eraser",
    "hotkey": "",
    "description": "マーク消去",
    "note": "マーク消去"
  },
  {
    "id": 182,
    "type": "command",
    "key": "stopWatch-applyMark",
    "label": "applyMark",
    "func": "",
    "icon": "hummer",
    "hotkey": "",
    "description": "マークを区間へ",
    "note": "ストップウオッチのマークを入力に変換"
  }
]


/**
    xUI 汎用メニューコマンドアイテム
    ドロップダウンメニュー|アイコンポタン｜コンテキストメニュー等に汎用的に使用するオブジェクト
    アイテム自身にサブコマンドを持ったアイテムトレーラーとしての機能がある？
    
*/
xUI.CommandItem = function(id,type,key,label,role,func,icon,hotkey,description,note){
	this.id          = id;
	this.type        = type;
	this.key         = key;
	this.label       = label;
	this.role        = role;
	this.func        = func;
	this.icon        = icon;
	this.image       = this.icon;
	this.hotkey      = hotkey;
	this.description = description;
	this.note        = note;
}
/**
    
*/
/*

*/

xUI.commands = [];//CommandCollection
  for (var i = 0;i < menuItems.length;i ++){
	xUI.commands.push( new xUI.CommandItem(
		i,
		menuItems[i].type,
		menuItems[i].key,
		menuItems[i].label,
        "",
		menuItems[i].func,
		menuItems[i].icon,
        "",
		menuItems[i].hotkey,
		menuItems[i].description,
		menuItems[i].note
	));
  };

 console.log(JSON.stringify(xUI.commands,false,2));
/**
    一覧用出力
    編集用出力に拡張予定
    @params {String}  form
    フォーマット指定キーワード
    
*/
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
	
    document.getElementById('commandList').innerHTML=result;
    return result;
}



