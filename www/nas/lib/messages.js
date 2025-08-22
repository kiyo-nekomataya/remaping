/**
 * 言語リソースをローカライズオブジェクトに分離
 * 設定オブジェクトがあればキーとして取得
 * ローカライズ関数は nas_locale.js に分離
 *
 * 各アプリケーションごとのファイルでなく共用リソースとして一旦統合
 * 2016.06.01
このデータはリソースとして nas.uiMsg.json に変換済み
リソースは nas_locale.js内で初期化されるため
このファイルを読み込んでも、遅延読み込みの結果データが上書きされる可能性が高い
このファイルは将来的に廃棄 2022.01.17
 */
'use strict';
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config  = require('./nas_common').config;
    var appHost = require('./nas_common').appHost;
    var nas     = require('./nas_locale').nas;
};
if (typeof nas == "undefined")     var nas = {};

nas.uiMsg = {};
nas.uiMsg.note = 'over write message.js';
nas.uiMsg.about                 = {en: "about this application", ja: "このアプリケーションについて"};
nas.uiMsg.aboutOf               = {en: "about %1", ja: "%1 について"};

nas.uiMsg.Abort                 = {en: "Abort", ja: "中断"};
nas.uiMsg.aborted               = {en: "process aborted.", ja: "処理を中断しました"};
nas.uiMsg.Action                = {en: "Action", ja: "動作設定"};
nas.uiMsg.activateUpperLayer    = {en: "activate upper layer", ja: "上位レイヤをアクティブ"};
nas.uiMsg.addNewLayer           = {en: "add new layer", ja: "新規動画レイヤ作成"};
nas.uiMsg.addNewOvl             = {en: "add new overlay", ja: "新規修正レイヤ作成"};

nas.uiMsg.alertAbnomalPrccs     = {en:"[！！Caution！！] Abnormal processing",ja:"[！！注意！！] 異常処理です"};
nas.uiMsg.alertCutConflict      = {en:"The same scene has already been entered.\nThis scene can not be entered",ja:"既に同じカットが登録されています\nこのカットの登録はできません"};
nas.uiMsg.alertCutIllegal       = {en:"Scene name is invalid \ nThis scene can not be entered",ja:"カット番号が不正です\nこのカットの登録はできません"};
nas.uiMsg.alertDurationchange   = {en:"the duration of document is changed.",ja:"カットの継続時間が変更されます。"};
nas.uiMsg.alertDiscardframes    = {en:"contents of the erased frame are discarded.",ja:"消去されるフレームの内容は破棄されます。"};
nas.uiMsg.alertTrackschange     = {en:"layer counts of document is changed.",ja:"カットのレイヤ数が変更されます。"};
nas.uiMsg.alertDiscardtracks    = {en:"contents of the erased track are discarded.",ja:"消去されるトラックの内容は破棄されます。"};
nas.uiMsg.alertDiscardedit      = {en:"Current edits are discarded.",ja:"現在の編集内容は破棄されます。"};
nas.uiMsg.alertNewdocumet       = {en:"Create a new document",ja: "新規ドキュメントを作成します"};

nas.uiMsg.animationDrawing      = {en: "animationDrawing", ja: "動画"};
nas.uiMsg.animationFrameSelectAll = {en: "animation frame selectAll", ja: "アニメフレーム全選択"};
nas.uiMsg.atCreateNewLayer      = {en: "to Create a new Layer", ja: "新規レイヤ作成時に"};
nas.uiMsg.backgroundColor       = {en: "background color", ja: "背景色"};


nas.uiMsg.confirmEdit           = {en:'(You can edit the contents of the text box.)',ja:'(テキストボックスの内容を編集できます)'};
nas.uiMsg.confirmOk             = {en:'Is it OK?',ja:'よろしいですか？'};
nas.uiMsg.confirmExecute        = {en:"Do you want to run it?",ja:"実行してよろしいですか?"};
nas.uiMsg.confirmCallecho       = {en:"Save the document in the download folder with the following name.",ja:"次の名前でダウンロードフォルダに書類を保存します。"};
nas.uiMsg.confirmCallechoSwap   = {en:"Save %1 in the download folder with the following name.",ja:"次の名前でダウンロードフォルダに %1 を保存します。"};
nas.uiMsg.baseResolution        = {en: "BaseResolution", ja: "基準解像度"};
nas.uiMsg.BG                    = {en: "BG", ja: "背景"};
nas.uiMsg.Book                  = {en: "MG/FG", ja: "BOOK"};
nas.uiMsg.Cancel                = {en: "Cancel", ja: "取消"};
nas.uiMsg.Ok                    = {en: "OK", ja: "OK"};
nas.uiMsg.Cell                  = {en: "Cell", ja: "セル"};
nas.uiMsg.Change                = {en: "Change", ja: "変更"};
nas.uiMsg.Close                 = {en: "Close", ja: "閉じる"};
nas.uiMsg.Common                = {en: "Common", ja: "一般環境"};
nas.uiMsg.confirmLayerName      = {en: "confirm layer name", ja: "レイヤ名を確認して下さい"};
nas.uiMsg.cut                   = {en: "Cut", ja: "カット番号"};
nas.uiMsg.Delete                = {en: "Delete", ja: "削除"};
nas.uiMsg.Destruction           = {en: "Destruction", ja: "破棄"};
nas.uiMsg.document              = {en: "document", ja: "ドキュメント"};

nas.uiMsg.documentHTML          = {en:"HTML document",ja:"HTML書類"};
nas.uiMsg.documentxMap          = {en:"xMap document",ja:"xMap書類"};
nas.uiMsg.documentXps           = {en:"Xps document",ja:"Xps書類"};
nas.uiMsg.documentTdts          = {en:"Tdts document",ja:"TDTS書類"};
nas.uiMsg.documentXdts          = {en:"Xdts document",ja:"XDTS書類"};
nas.uiMsg.documentArd           = {en:"ARD document",ja:"ARD書類"};
nas.uiMsg.documentArdj          = {en:"ARDJ document",ja:"ARDJ書類"};
nas.uiMsg.documentCSV           = {en:"Stylos-CSV document",ja:"Stylos-CSV書類"};
nas.uiMsg.documentSTS           = {en:"STS document",ja:"STS書類"};
nas.uiMsg.documentTSheet        = {en:"t-Sheet document",ja:"t-Sheet書類"};
nas.uiMsg.documentTVP           = {en:"TVP-csv document",ja:"TVPaint-csv書類"};

nas.uiMsg.Documents             = {en: "Documents", ja: "ドキュメント設定"};
nas.uiMsg.Drawing               = {en: "Drawing", ja: "動画"};
nas.uiMsg.drawingFunctions      = {en: "drawingFunctions", ja: "作画機能設定"};
nas.uiMsg.DrawSettings          = {en: "DrawSettings", ja: "作画設定"};
nas.uiMsg.duplicateAnimationFrame = {en: "duplicate animation frame", ja: "アニメフレームを複製"};
nas.uiMsg.Edit                  = {en: "Edit", ja: "編集"};
nas.uiMsg.ElementsFilter        = {en: "footages", ja: "素材フィルタ"};
nas.uiMsg.Export                = {en: "Export", ja: "書出"};
nas.uiMsg.failed                = {en: "Processing failed",ja:"処理できませんでした"};
nas.uiMsg.File                  = {en: "File", ja: "ファイル"};
nas.uiMsg.fileName              = {en: "file name", ja: "ファイル名"};
nas.uiMsg.Filter                = {en: "Filter", ja: "フィルタ"};
nas.uiMsg.Frame                 = {en: "Frame", ja: "フレーム"};
nas.uiMsg.Framerate             = {en: "Framerate", ja: "フレームレート"};
nas.uiMsg.IMedit                = {en: "ImputMedias", ja: "入力メディア編集"};
nas.uiMsg.Import                = {en: "Import", ja: "読出"};
nas.uiMsg.IMset                 = {en: "ImputMedias", ja: "入力メディア登録"};
nas.uiMsg.inputDocName          = {en: "Specify the document name", ja: "ドキュメントの名前を入力"};
nas.uiMsg.install               = {en: "install", ja: "インストール"};
nas.uiMsg.KeyDrawing            = {en: "KeyDrawing", ja: "原画"};
nas.uiMsg.layerClassify         = {en: "layerClassify", ja: "レイヤ仕分"};
nas.uiMsg.layerControl          = {en: "layerControl", ja: "レイヤコントロール"};
nas.uiMsg.layerRename           = {en: "layer rename", ja: "レイヤ名変更"};
nas.uiMsg.Layout                = {en: "Layout", ja: "レイアウト"};
nas.uiMsg.Load                  = {en: "Load", ja: "読込"};
nas.uiMsg.makeNewXPS            = {en: "make new eXposureSheet", ja: "新規タイムシートを作成します"};
nas.uiMsg.modeChange            = {en: "mode change", ja: "モード切替"};
nas.uiMsg.Medias                = {en: "Medias", ja: "メディア設定"};
nas.uiMsg.newLayerBgColor       = {en: "bgColor of new layer", ja: "新規レイヤの背景色"};
nas.uiMsg.newXPS                = {en: "new eXposureSheet", ja: "新規タイムシート"};
nas.uiMsg.newItem               = {en: "new item", ja: "新規アイテム"};
nas.uiMsg.newItemName          = {en: "new item name", ja: "新規アイテム名"};
//nas.uiMsg.new                = {en: "new ", ja: "新規"};
//nas.uiMsg.new                = {en: "new ", ja: "新規"};
//nas.uiMsg.new                = {en: "new ", ja: "新規"};
//nas.uiMsg.new                = {en: "new ", ja: "新規"};

nas.uiMsg.noAnimationFrames     = {en: "no Animation Frames", ja: "アニメーションフレームがありません"};
nas.uiMsg.noDocument            = {en: "no document", ja: "ドキュメントがありません"};
nas.uiMsg.noLayers              = {en: "no layer for deploying", ja: "展開するレイヤがありません"};
nas.uiMsg.noRemoveData          = {en: "no data to remove.", ja: "削除するデータがありません"};
nas.uiMsg.noSvaeData            = {en: "no data to save.", ja: "保存するデータがありません"};
nas.uiMsg.noTarget              = {en: "no target items", ja: "対象アイテムがありません"};
nas.uiMsg.noSigninService       = {en: "(You are not signed in to the service)",ja:"（サービスにサインインしていません）"};
nas.uiMsg.OMedit                = {en: "OutputMedias", ja: "出力メディア編集"};
nas.uiMsg.OMset                 = {en: "OutputMedias", ja: "出力メディア登録"};
nas.uiMsg.Open                  = {en: "Open", ja: "開く"};
nas.uiMsg.OpenFolder            = {en: "Open folder", ja: "フォルダを開く"};
nas.uiMsg.opus                  = {en: "Opus", ja: "制作番号"};
nas.uiMsg.othet                 = {en: "other", ja: "その他"};
nas.uiMsg.overlay               = {en: "overlay", ja: "オーバーレイ"};
nas.uiMsg.overlayBgColor        = {en: "bgColor of overlay", ja: "修正レイヤの背景色"};
nas.uiMsg.overrideAlpha         = {en: "overrideAlpha", ja: "アルファチャンネル優先"};
nas.uiMsg.overrideColorKey      = {en: "overrideColorKey", ja: "カラーキー優先"};
nas.uiMsg.peg                   = {en: "peg", ja: "タップ"};
nas.uiMsg.Preference            = {en: "Preference", ja: "各種設定"};
nas.uiMsg.previewControl        = {en: "preview Control", ja: "プレビューコントロール"};
nas.uiMsg.processing            = {en: "proscessing…", ja: "処理中…"};
nas.uiMsg.inputWarning          = {en: "Input operation is invalid", ja: "入力操作は無効です"};

nas.uiMsg.Registration          = {en: "Registration", ja: "新規登録"};
nas.uiMsg.removeAnimationFrame  = {en: "remove animation frame", ja: "アニメフレームを削除"};
nas.uiMsg.resetSmartObj         = {en: "reset smartObj", ja: "スマートオブジェクトをリセット"};
nas.uiMsg.reverseAnimationFrame = {en: "reverse animation frame", ja: "アニメフレームを反転"};

nas.uiMsg.requiresNumber		= {en:"Please specify a numerical value",ja:"数値を指定してほしいのョ!と"};
nas.uiMsg.requiresPositiveInteger = {en:"Please specify a positive value",ja:"正の数がいいなぁ…"};
nas.uiMsg.requiresStrings       = {en:"Please specify String value",ja:"文字列で指定してほしいのですョ!"};

nas.uiMsg.statusEdit            = {en: "editting", ja: "編集中"};
nas.uiMsg.statusView            = {en: "readonly", ja: "閲覧"};
nas.uiMsg.statusAdmin           = {en: "management", ja: "制作管理"};

nas.uiMsg.Save                  = {en: "Save", ja: "保存"};
nas.uiMsg.saveAndClose          = {en: "save and close", ja: "保存して閉じる"};
nas.uiMsg.savePsdPlease         = {en: "Please save the document in psd format.", ja: "ドキュメントをpsd形式で保存してください。"};
nas.uiMsg.saveToDonloadfolder   = {en:"save to download folder",ja:"ダウンロードフォルダに保存"};
nas.uiMsg.saveToDonloadfolderSwap = {en:"save to download folder",ja:"ダウンロードフォルダに %1 を保存"};

nas.uiMsg.serviceNode           = {en: "service node", ja: "共有サーバ"};
nas.uiMsg.repositoryName        = {en:"share name",ja:"共有名"};
nas.uiMsg.repositoryOwner        = {en:"share owner",ja:"共有オーナー"};

nas.uiMsg.scene                 = {en: "Scene", ja: "シーン"};
nas.uiMsg.sceneCut              = {en: "S-C", ja: "S-C"};
nas.uiMsg.setGuideLayer         = {en: "setGuideLayer", ja: "ガイドレイヤにする"};
nas.uiMsg.SheetLength           = {en: "xSheetLength", ja: "シート１枚の長さ"};
nas.uiMsg.shortcutKey           = {en: "shartcut key scripts", ja: "ショートカットツール"};
nas.uiMsg.Sounds                = {en: "Sounds", ja: "サウンド編集"};
nas.uiMsg.time                  = {en: "time", ja: "time"};
nas.uiMsg.title                 = {en: "title", ja: "題名"};
nas.uiMsg.transition            = {en: "transition", ja: "トランジション"};
nas.uiMsg.timelineTrack         = {en: "timeline track", ja: "タイムライントラック"};
nas.uiMsg.timelineRename        = {en: "timeline rename", ja: "タイムライン名変更"};
nas.uiMsg.tagEdit         = {en: "timeline tag edit", ja: "タイムラインタグ編集"};
nas.uiMsg.uninstall             = {en: "uninstall", ja: "削除"};
nas.uiMsg.Update                = {en: "Update", ja: "更新"};
nas.uiMsg.userInfo              = {en:"userInfo",ja:"作業者の情報"};
nas.uiMsg.userName              = {en: "Name", ja: "名前"};
nas.uiMsg.withColorKey          = {en: "withColorKey", ja: "カラーキーで白を透過"};
nas.uiMsg.withSmoothing         = {en: "withSmoothing", ja: "スムージングする"};
nas.uiMsg.withTransparent       = {en: "with transparent", ja: "透過させる"};
nas.uiMsg.workTitles            = {en: "workTitles", ja: "作品タイトル登録"};
nas.uiMsg.xSheet                = {en: "xSheet", ja: "タイムシート"};
nas.uiMsg.xSheetInfo            = {en: "xSheet information",ja:"タイムシート情報"};
// nas.uiMsg.Name               ={en:"Name"	,ja:"作業者名"};
//serviceAgentCommnad
nas.uiMsg.pMabort               ={en:"abort",ja:"作業中断"};
nas.uiMsg.pMactivate            ={en:"activate",ja:"作業再開"};
nas.uiMsg.pMcheckin             ={en:"check in",ja:"作業開始"};
nas.uiMsg.pMcheckout            ={en:"check out",ja:"作業終了"};
nas.uiMsg.pMdeactivate          ={en:"deacivate",ja:"作業保留"};
nas.uiMsg.pMreceipt             ={en:"receipt",ja:"作業検収"};

nas.uiMsg.pMinUse               ={en:"in use",ja:"作業中"};
nas.uiMsg.pMline                ={en:"line",ja:"ライン"};
nas.uiMsg.pMcurrentLine         ={en:"current line",ja:"現在のライン"};
nas.uiMsg.pMnewLine             ={en:"new line",ja:"新規ライン"};
nas.uiMsg.pMstage               ={en:"stage",ja:"工程"};
nas.uiMsg.pMcurrentStage        ={en:"current stage",ja:"現在の工程"};
nas.uiMsg.pMnewStage            ={en:"new stage",ja:"新規工程"};
nas.uiMsg.pMjob                 ={en:"job",ja:"作業"};
nas.uiMsg.pMcurrentJob          ={en:"curent job",ja:"現在の作業"};
nas.uiMsg.pMnewJob              ={en:"new job",ja:"新規作業"};
nas.uiMsg.pMaddNewScene         ={en:"add new scene",ja:"新規カット追加"};
nas.uiMsg.pMreseiptStage        ={en:"check out job/check in new stage",ja:"作業検収/新規工程"};

nas.uiMsg.toPrefix              ={en:"to:",ja:" "};
nas.uiMsg.toPostfix             ={en:" ",ja:"様へ"};

nas.uiMsg.dmPMnewDocument = {
    en:"I will create a new document.\nPlease enter scene number/duration and confirm with OK button.",
    ja:"新規カットを作成します。\nカット番号/継続時間を入力して[OK]ボタンで確定してください。"
};
nas.uiMsg.dmPMnewItemSwap = {
    en:"Start new %1.\nPlease enter a new %1 name. \nIf it is not on the list, please enter it with the keyboard.",
    ja:'新規 %1 を開始します。\n新しい %1 名を入力してください。\nリストにない場合は、キーボードで入力してください。'
};
nas.uiMsg.dmPMnewStage = {
    en:"Close the current stage and open the next stage.\nPlease enter a new stage name.\nIf it is not on the list, please enter it with the keyboard.",
    ja:'現在の工程を閉じて次の工程を開きます。\n新しい工程名を入力してください。\nリストにない場合は、工程名を入力してください。'
};
nas.uiMsg.dmPMnewAssign = {
    en:"We finish the job for %1 and make it editable by other users.\nIt is possible to assign the next user.\nTo assign please choose a name from the list or enter the user name directly.\nPlease input if there is a message to send.",
    ja:"カット%1の作業を終了して、他のユーザが編集可能な状態にします。\n次の担当者を指名することが可能です。\n指名する場合はリストから名前を選ぶか、または直接ユーザ名を入力してください。\n申し送りメッセージがあれば、入力してください。"
};
//合成モード分離
nas.uiMsg.NORMAL                = {en: "NORMAL"             , ja: "通常"};
nas.uiMsg.MULTIPLY              = {en: "MULTIPLY"           , ja: "乗算"};
nas.uiMsg.LIGHTEN               = {en: "LIGHTEN"            , ja: "比較（明）"};
nas.uiMsg.DARKER                = {en: "DARKER"             , ja: "比較（暗）"};
nas.uiMsg.DIFFERENCE            = {en: "DIFFERENCE"         , ja: "差の絶対値"};
nas.uiMsg.SILHOUETTE_LUMA       = {en: "SILHOUETTE_LUMA"    , ja: "シルエットルミナンス"};

/*
 nas.uiMsg.	={en:"	,ja:"};
 nas.uiMsg.	={en:"	,ja:"};
 nas.uiMsg.	={en:"	,ja:"};
 */
//dialog messages 複合単語以上のセンテンスはこちらで処理します
nas.uiMsg.dm000 = {
    en: 'nas- library is required.\nPlease run the "nasStartup.jsx".',
    ja: "nasライブラリが必要です。\nnasStartup.jsx を実行してください。"
};
nas.uiMsg.dm001 = {
    en: "The effect is limited to the session.\n If you need record, please click Save button below.",
    ja: "このパネルの変更はセッション限りです。記録が必要な場合は下のボタンで保存してください。"
};
nas.uiMsg.dm002 = {
    en: "Switching the active layer with the movement of animation frames\n(only valid when using psAxe)",
    ja: "フレーム移動時にアクティブレイヤの移動をする\n(エクステンション使用時のみ有効)"
};
nas.uiMsg.dm003 = {
    en: "Dialog to create a new file",
    ja: "新規ファイル作成ダイアログ"
};
nas.uiMsg.dm004 = {
    en: "PsAxe use the advanced features when you create a new document",
    ja: "新規ドキュメント作成時にアニメ拡張機能を使う"
};
nas.uiMsg.dm005 = {
    en: "Can not drop to zero because the number of entries.",
    ja: "エントリ数が0になるので削除できません。"
};
nas.uiMsg.dm006 = {
    en: "Drop the selected entry. Are you sure?",
    ja: "選択されたエントリを削除します。よろしいですか？"
};
nas.uiMsg.dm007 = {
    en: "Load the saved settings. Current settings will be overwritten.",
    ja: "保存中の設定を読み込みます。現在の設定は上書きされます。"
};
nas.uiMsg.dm008 = {
    en: "You can not cancel. Are you sure?",
    ja: "取消はできません。よろしいですか？"
};
// nas.preferenceFolder.fsName 
nas.uiMsg.dmPreferenceConfirmSave = {
    en: "Save the configuration to the directory [ %1 ].\nThe previous file is overwritten. Are you sure? ",
    ja: "設定を[ %1 ]以下に保存します。\n以前のファイルは上書きされます。よろしいですか？"
};
nas.uiMsg.dm009 = nas.uiMsg.dmPreferenceConfirmSave;
nas.uiMsg.dm010 = {
    en: "Use the opacity key to the head movement (timeline)",
    ja: "ヘッド移動に不透明度キーを使用(timeline)"
};
nas.uiMsg.dm011 = {
    en: "frame skip (timeline)",
    ja: "フレームスキップ(timeline)"
};
nas.uiMsg.dm012 = {
    en: "frame skip (timeline)",
    ja: "フレームスキップ(timeline)"
};
nas.uiMsg.dm013 = {
    en: "use difference mode when peg image placement",
    ja: "タップ画像配置時に差の絶対値にする"
};
nas.uiMsg.dm014 = {
    en: "use semi-transparent when picture-frame arrangement",
    ja: "フレーム画像配置時に半透明にする"
};
nas.uiMsg.dm015 = {
    en: "There is the same name of the layer.\n Layer after the second will not be subject to the sort.",
    ja: "同名のレイヤがあります。\n二つ目以降のレイヤは並び替えの対象になりません。"
};

nas.uiMsg.dmPrefConfirmSave = {
    en:"The setting has been changed. Do you want to apply it?",
    ja:"設定が変更されています。反映させますか?"
};
// documents //
nas.uiMsg.dmDocumentNosave = {
    en: "Document has not been saved. Do you want to save?",
    ja: "ドキュメントは保存されていません。保存しますか？"
};
nas.uiMsg.dmDocumentNosaveExport= {
    en: "Document has not been saved. Do you want to export?",
    ja: "ドキュメントは保存されていません。書出しますか？"
};
nas.uiMsg.dmDocumentConfirmOkCancel = {
    en:"OK:save / Cancel:coninue without saveing",
    ja:"OK:保存する / Cancel:保存せずに続行"
};
nas.uiMsg.dmDocumentConfirmYNC={
    en:"Yes:save / No: update without saving / Cancel:cancel processing",
    ja:"Yes:保存する / No:保存しないで更新 / Cancel:処理をキャンセル"
};
nas.uiMsg.dmDocumentConfirmOverwrite= {
    en: "There is already a file with the same name.\nAre you sure you want to overwrite?",
    ja: "同名のファイルがすでにあります.\n上書きしてよろしいですか?"
};



nas.uiMsg.dm016=nas.uiMsg.dmDocumentConfirmOverwrite;
nas.uiMsg.dm017=nas.uiMsg.dmDocumentNosave;
nas.uiMsg.dm018 = {
    en: "It has already been started.\nDouble start since receiving the console output is prohibited.\nDo you want to reset.",
    ja: "すでに起動されています。\nコンソール出力を受信するので二重起動は禁止されています\nリセットしますか"
};
nas.uiMsg.dm019 = {
    en: "specify the file name for export",
    ja: "書き出しのファイル名を指定してください"
};
nas.uiMsg.dm020 = {
    en: "choose eXposure sheet to read",
    ja: "読み込むタイムシートを選んでください"
};
nas.uiMsg.dm021 = {
    en: "Please select eXposure sheet file.",
    ja: "タイムシートファイルを選択してください。"
};
nas.uiMsg.dm022 = nas.uiMsg.alertNewdocumet;
nas.uiMsg.dm023 = {
    en: "All the recorded information to the individual area to clear.\nbut it does clear the information of all the applications that use the nas library, please particular attention to those who are using the nas library in AE ,PS and others.\nIt is may be clear?",
    ja: "個人領域に記録した情報をすべてクリアします。\nnasライブラリを使用するすべてのアプリケーションの情報をクリアしますので、AEとPSでnasライブラリを使用している方は特にご注意ください。\nクリアして良いですか？"
};
nas.uiMsg.dm024 = {
    en: "Information was recorded in the personal area : %1 pieces of data has been cleared.\nThe current information is located on the memory.\nData is initialized at the time of application restart.\nIf you want to initialize, please restart the application without saving.",
    ja: "個人領域に記録した情報 :%1 個のデータをクリアしました。\n現在の情報は、メモリ上にあります。\nデータはアプリケーション再起動の際に初期化されます。\n初期化を希望する場合は、保存せずにアプリケーションを再起動してください。"
};
nas.uiMsg.dm025 = {
    en: "please choose Folder to import.",
    ja: "読み込むフォルダを指定してください"
};
nas.uiMsg.dm026 = {
    en: "please choose Folder to export",
    ja: "書き出しフォルダを指定してください"
};
nas.uiMsg.dm027 = {
    en: ":\n You will import the settings of the folder above.\nThe same name of the setting can not undo been overwritten.\nAre you sure you want to run?",
    ja: ":\n 上のフォルダの設定をインポートします。\n同名の設定は上書きされて取り消しはできません。\n実行してよろしいですか？"
};
nas.uiMsg.dm028 = {
    en: ":\nIt will export the settings to a folder of the above.\nWe recommend the free folder.\nAre you sure you want to run?",
    ja: ":\n上のフォルダに設定をエクスポートします。\n空きフォルダ推奨します\n実行してよろしいですか？"
};
nas.uiMsg.dm029 = {
    en: "Please save the document in psd format.",
    ja: "ドキュメントをpsd形式で保存してください。"
};
/** backup  */
nas.uiMsg.dmBackupConfirm = {
    en:"Load the backup data on the sheet. Current data will be lost. Is it OK?",
    ja:"バックアップデータをシートに読み込みます。\n現在のデータは失われます。\nよろしいですか？"
}
nas.uiMsg.dmBackupDone = {
    en:"current data has been saved in the backup area",
    ja:"バックアップ領域に現在のデータを退避しました"
};
nas.uiMsg.dmBackupNodata = {
    en:"no data in the backup area",
    ja:"バックアップ領域にデータがありません"
}
nas.uiMsg.dmBackupClear = {
    en:"Cleared backup area",
    ja:"バックアップ領域をクリアしました"
}

nas.uiMsg.dmUnimplemented = {
    en:"this feature has not been implemented yet",
    ja:"この機能はまだ実装されていません"
}

nas.uiMsg.dmConfirmClosepMenu = {
    en:"are you sure you want to hide the drop down menu?",
    ja:"ドロップダウンメニューを非表示にしてよろしいですか？"
};
nas.uiMsg.dmAskUserinfo = {
    en:"Enter the name of the workstaff. If you need to enter an e-mail address, separate it with a ':' (colon).",
    ja:"作業担当者の名前を入力します。メールアドレスを入力する場合は':(コロン)'で区切って入力してください。"
}
nas.uiMsg.dmCookieRemoved = {
    en:"I deleted the cookie. \nIn order to reset the value, reloading the page is necessary.\nIt will be reloaded with [OK].",
    ja:"クッキーを削除しました。\n値をリセットするには、ページの再読込みが必要です。\n[OK]で再読込みします。"
};

nas.uiMsg.dmAlertMenytracks = {
en:"The number of specified tracks is very large.\nAutomatic generation of track name is up to 'Z'.",
ja:"止めないけど…そんなにレイヤが多いとツライよ\nレイヤ名を自動でつけるのは「Z」までなので\nその先は自分でつけてね。"
};
nas.uiMsg.dmAlertCheckinFail = {
    en:"Check-in failed.\nplease check the status of document",
    ja:"作業開始に失敗しました\nドキュメントの状態を確認してください"
};
nas.uiMsg.dmAlertCheckoutFail = {
    en:"Check-out failed.\nplease check the status of document",
    ja:"作業終了に失敗しました\nドキュメントの状態を確認してください"
};
nas.uiMsg.dmAlertDataBusy = {
    em:"Another user has this scene working. \nYou can not work on this scene.",
    ja:"他のユーザが作業中です\nこのカットを作業することはできません"
};
nas.uiMsg.dmAlertCantActivate = {
    en:"You can not work on this data. \nPlease try Check-in procedure",
    ja:"このデータで作業する事はできません。\n作業開始手続を試してみてください"
};
nas.uiMsg.dmAlertCantDeactivate = {
    en:"Work cannot deactivate.\nThis is not active data",
    ja:"作業保留できません\nこれは作業中のデータではありません"
};
nas.uiMsg.dmAlertCantCheckout = {
    en:"Work cannot Chack-out.\nThis is not active data",
    ja:"作業終了できません\nこれは作業中のデータではありません"
};
nas.uiMsg.dmAlertFailAuthorize = {
    en:"Server authentication failed.\nPlease check ID and password",
    ja:"サーバ認証に失敗しました\nIDとパスワードを確認してください"
};

nas.uiMsg.dmComfirmNewxSheetprop = {
    en:"Set a new xSheet with the default value.\n Is it OK?",
	ja:"デフォルトの値で新規にシートを設定します。\n\tよろしいですか?"
};
nas.uiMsg.dmAlertNoEntry = {
    en:"There are no match-entry in this repository.\nPlease make sure the target repository is selected.\nYou can temporarily store it to LocalRepository or write it externally to protect the data.",
    ja:"リポジトリにこのカットがありません\n正しいリポジトリか確認してください\nローカルリポジトリに一時的に保存するか又は外部に書出してデータを保護することができます"
};
nas.uiMsg.dmPMrecoverLostSession = {
    en:'This data is currently being edited in your account.\nPlease check that the document is not open in other environment.\nPress OK to resume work from the current data.',
    ja:'このデータは現在あなたのアカウントで編集中です\n他の環境でドキュメントを開きっぱなしになっていないか確認してください\nOKを押すと、現在のデータから作業を再開できます\n'
}
nas.uiMsg.dmTLlabelRename = {
	en:"Change timeline label.",
	ja:"タイムラインラベルを変更します。"
};
nas.uiMsg.dmRenameLabels ={
	en:"Please specify a new label name set. \nThe shortfall, excess will be ignored.",
	ja:"新しいラベル名セットを指定してください。\n不足分、超過分は無視されます。"
};
nas.uiMsg.dmRenameLabel = {
	en:"Please specify a new label.",
	ja:"新しいラベルを指定してください。"
};
nas.uiMsg.dmReadOnly = {
en:"You can not edit this document at the moment.\nTo change the document please check in and start your job.",
ja:"現在ドキュメントは編集できません。\nドキュメントを変更するためにはチェックインしてジョブを開始してください。"
};
nas.uiMsg.dmRemoveThisMessage = {
en:"Thereafter, do not display this message.",
ja:"以後、このメッセージを表示しない。"
};
nas.uiMsg.dmTLtagEdit = {
	en:"Edit the note text of the track.",
	ja:"トラックの注釈を編集します。"
};
//console.log('loaded : nas_messages.js');
/*

 nas.uiMsg.	={en:"	,ja:"};
 nas.uiMsg.dm={
 en:",
 ja:"
 };
 */
//=========nas.uiMsg
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas  = nas;
};