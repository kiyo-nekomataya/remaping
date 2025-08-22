/**
 * @fileOverview
 *  <pre>P-man本体スクリプト
 * </pre>
 */
// http://d.hatena.ne.jp/amachang/20071010/1192012056 //
/*@cc_on _d=document;eval('var document=_d')@*/
'use strict';
/*================================================================================================ 
 *  アプリケーションスタートアップ
 *
 *   スタートアップを他の位置へまとめる必要があるかも
 *   リロードの際に一度だけ実行される部分
 */
/* nodeUIへ移動
if(typeof TgaLoader == 'undefined') var TgaLoader = false;
if(typeof PSD       == 'undefined') var PSD       = require('psd');
if(typeof sharp     == 'undefined') var sharp     = false;
if(typeof Tiff      == 'undefined') var Tiff      = false;
*/
//始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
var xUI         =new Object();
//var xUI         = new_xUI();
    xUI.Mouse   =function(){return};
    xUI.onScroll=function(){return};

//    オブジェクト初期化用ダミーマップ
//    新規XPSオブジェクト作成・初期化
//    var XPS          = {} ;//ダミーオブジェクトとしてグローバル変数を初期化
//    var XMAP         = {} ;//ダミーオブジェクトとしてグローバル変数を初期化
    xUI.activeNode   = null ;//表示・編集対象のノードオブジェクト .pmdbを持つ者はすべてノードたりえる
    xUI.XMAP         = {} ;//ダミーオブジェクトとしてXMAPバッファを初期化
    xUI.XPS          = {} ;//ダミーオブジェクトとしてXPSバッファを初期化
    xUI.PMDBroot     ;//編集中のストレージルート(String ローカルパス) eg: /Users/Shared/workStorage
    xUI.PMDBcurrent  ;//編集中のPMDB(String ストレージルートから先のパス)eg: /Nekomataya/momotaro/mom#02
console.log(nas.pmdb)
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
	アプリケーション開始時にjQuery-uiのtooltipを初期化するプロシジャ
	titleアトリビュートをツールチップ化する
	起動時に一回だけ実行 xUIの初期化前に実行されること
*/

var startupTooltip=function(){
    jQuery( function() {
        var myToolTips=["#"];
            for (var tid=0;tid<myToolTips.length;tid++){
                jQuery(myToolTips[tid]).tooltip( {
                    position: {
                        my: "center top",
                        at: "center bottom",
                        track:true,
                    }
                });
            }
    } );
}
/** Startup手続き
 *    nas_pman_Startup
 *  プログラム及び全リソースをロード後に１回だけ実行される手続
 *  引数なし
 *
 *    nas_pman_reStart
 *  ページリロード等の際に実行される手続
 */
function nas_pman_Startup(){
console.log('application init : nas_pman_Startup !!');
//var limit = new Date('2022.08.01');var now  = new Date();
if(
    (appHost.platform == 'MSIE')
){
    var msg = "";
    if(appHost.platform == 'MSIE') msg += nas.localize("%1は動作対象外です\n",appHost.platform);
//    if(now > limit)                msg += "テスト版のため使用期限を設けてあります\n";
    msg += "このアプリは動作を停止します\n 新しいバージョンを入手するか、アンインストールして下さい\n yal/kiyo/ nekomataya.info";
    alert(msg);
    return false;
}
//    UI生成
    xUI=new_xUI();
//アプリケーションpmanとして初期化
    xUI.init(
        pman.reName,
        null,
        'pman_reName'
        ,function(){

//クッキー指定があれば読み込む
    if(config.useCookie[0]) ldCk();
//アプリケーションIdf設定（クッキーに存在しなければローカルストレージから読み出す）
    if(! config.ApplicationIdf){
        config.ApplicationIdf = localStorage.getItem("info.nekomataya.pman.applicationIdf");
    }
    serviceAgent.applicationIdf = config.ApplicationIdf;
//ライブラリフレームレートの設定
    nas.FRATE=nas.newFramerate(config.myFrameRate);
//背景カラーを置換
    config.SheetLooks.SheetBaseColor = config.SheetBaseColor;

//UI状態の初期化
        if(config.useCookie.UIView){
            xUI.setToolView(config.ToolView);
//            xUI.setToolView('default');
            xUI.ibCP.switch(xUI.ibCP.activePalette);
        };
        if(appHost.platform == 'Electron') document.getElementById('doRename').disabled = false;
        [
            "undo","redo","save","cut","copy","paste","copyImage"
        ].forEach(e =>xUI.sync(e));
        [
            "numOrder","prefix","suffix","preview","search",
            "showThumbnail","thumbnail","rename_setting",
            "renameDigits","nameExt","sortAuto","flip",
            "flipMode","flipSwitch","flipControl","flipSeekbar",
            "lightBoxControl","lightBoxProp","xmap_idf",
            "paintColor","paintTool","paintCommand"
        ].forEach(e =>xUI.sync(e));

//バージョンナンバーセット
        xUI.sync("about_");
        xUI.adjustUI();
    });//リネームアプリケーション

//  メッセージハンドラを初期化//フロントアプリケーション設定
    if(typeof uat == 'object'){uat.MH.init();uat.MH.appchange();}
//アプリケーション pman starup // */

//クッキーよりも優先でpmdb含むServiceの初期化を行う localRepositoryを含むリポジトリCollectionも初期化
    localRepository.init();
    serviceAgent.init();
//アプリケーションIdf設定（クッキーに存在しなければローカルストレージから読み出す）
    if(! config.ApplicationIdf){
      config.ApplicationIdf = localStorage.getItem("info.nekomataya.pman.applicationIdf");
    }
//console.log('application idf :' + config.ApplicationIdf);
    serviceAgent.applicationIdf = config.ApplicationIdf;
//ライブラリフレームレートの設定
    nas.FRATE=nas.newFramerate(config.myFrameRate);
//背景カラーを置換
    config.SheetLooks.SheetBaseColor="#eeffee";
//pman.reName 初期化
//ボタン描画
    pman.reName.drawPrefix();
    pman.reName.drawPostfix();
//
/*
    エントリから内容をスキャンして戻す
*/
async function scanFiles(entry, tmpObject) {
    switch (true) {
        case (entry.isDirectory) :
            const entryReader = entry.createReader();
            const entries = await new Promise(resolve => {
                entryReader.readEntries(entries => resolve(entries));
            });
            await Promise.all(entries.map(entry => scanFiles(entry, tmpObject)));
            break;
        case (entry.isFile) :
            tmpObject.push(entry);
            break;
    };
}
//ドキュメントのドラグドロップハンドラを設定
    document.body.addEventListener('keydown', function(e) {
        if(pman.reName.onCanvasedit){
            if(!(pman.reName.canvasPaint.kbHandle(e))){e.stopPropagation();e.preventDefault();};
        }else{
            if(!(xUI.keyDown(e))){e.stopPropagation();e.preventDefault();};
        };
    },false);
    document.body.addEventListener('keypress', function(e) {
        if(pman.reName.onCanvasedit){
            if(!(pman.reName.canvasPaint.kbHandle(e))){e.stopPropagation();e.preventDefault();};
        }else{
            if(!(xUI.keyPress(e))){e.stopPropagation();e.preventDefault();};
        };
    },false);

    document.body.addEventListener('keyup', function(e) {
        if((pman.reName.onCanvasedit)){
            if(!(pman.reName.canvasPaint.kbHandle(e))){e.stopPropagation();e.preventDefault();};
        };
    },false);


    window.addEventListener('blur',function(e) {
         if(pman.reName.flip.play != 0) pman.reName.flipStop();
    });

    window.addEventListener('resize',function(e) {
         xUI.adjustSpacer();
         xUI.adjustUI();
    });
//ドキュメント全体の終了処理
//    document.body.addEventListener('beforeunload',function(e){alert('boforeunload');});
// */


    document.body.addEventListener('dragover', function(e) {
        e.stopPropagation();e.preventDefault();
        this.style.background = config.SheetLooks.SelectedColor;//
    }, false);
    document.body.addEventListener('dragleave', function(e) {
        e.stopPropagation();e.preventDefault();
        this.style.background = '';//
    }, false);
    document.body.addEventListener('drop', async function(e) {
        e.stopPropagation();e.preventDefault();
        this.style.background = '';//;

console.log('droped');
console.log(e.dataTransfer.getData('text/plain'));
console.log(e.composedPath());
//ドロップアイテム判定
/*
    ブラウジングアイテム
        アプリ内での移動
    ファイルエントリ
        システムからセッションへの入出力
        画像編集中は、テキスト　画像を画像編集機能へ引き渡す（保留）
        フォルダ|ファイルアイテム
            単独フォルダアイテムのドラグのみを判定するか＞初期化指定として判定
            それ以外は追加アイテムとして処理
    アプリ内エリア判定
        アイテムエリア（end よりも下を含む）リストに対してのドロップ
            補助キー指定が無い限りアイテムの追加、移動として扱う
            shift|ctrl|mataドロップは初期化指定とする
        それ以外の範囲
            フォルダ単独はセッション初期化
            それ以外はセッションにアイテムを追加（セッションにアイテム未登録の場合も含む）
*/
        const files = e.dataTransfer.files; //ドロップされたファイルを取得
        const items = e.dataTransfer.items;

        let tgtID = (e.target.id)? pman.reName.parseId(event.target.id):pman.reName.parseId(e.composedPath()[1].id);//イベント発生オブジェクトのElementIDから整数部を取得 IDがなければ一つ上のElementID
        if(isNaN(tgtID)) tgtID = -1;//IDを得られなかった場合ルート
        let itmid = pman.reName.parseId(e.dataTransfer.getData('text/plain'));//データトランスファーの識別情報
        let placement = 'PLACEATEND';//default atEnd
        if(e.composedPath().indexOf(document.getElementById('fileStrip')) >= 0){
//        if((!isNaN(itmid))&&(itmid >= -1)&&(itmid < pman.reName.items.length)){}
//ドロップターゲットがリスト範囲内であった場合placementを調整
//ドロップターゲットアイテムを確定
            let targetItem = pman.reName.getItem(tgtID);
//配置を取得 PLACEBEFORE|PLACEAFTER|INSIDE|PLACEATEND|PLACEATBEGINNING
            placement = (
                (targetItem.type == '-group-')&&(e.offsetX < 52)
            )? 'INSIDE':(
                (e.layerY < (e.target.clientHeight/2)
            )?
                'PLACEBEFORE':'PLACEAFTER'
            );
        }
        if(files.length > 0){
//ファイルアイテムが存在する
//アイテムが単独でかつフォルダか？ filesで得られるリストはこのコードを経由しないので考慮外
            let itmType = ((items.length == 1)&&(items[0].webkitGetAsEntry().isDirectory))? 'folder':'files';
            if(pman.reName.items.length == 0){
//初期化前なので固定モード
                pman.reName.loadCtrl = 'init';
            }else if(
                (itmType == 'folder')||
                (e.composedPath().indexOf(document.getElementById('fileStrip')) < 0)
            ){
//フォルダドロップ|ファイルリスト外へのドロップ 初期化ベースとなる
                pman.reName.loadCtrl = ((e.metaKey)||(e.ctrlKey)||(e.shiftKey))? 'append':'init';
            }else{
//それ以外は追加ベース
                pman.reName.loadCtrl = ((e.metaKey)||(e.ctrlKey)||(e.shiftKey))? 'init':'append';
            };
        };
console.log([pman.reName.loadCtrl,tgtID,itmid,files,items,placement]);

        if(itmid >= 0){
//ブラウジングアイテムドロップ
            let itm = pman.reName.getItem(itmid);//
//複数選択アイテム
            let selectedItems = pman.reName.selection;
            if(e.composedPath().indexOf(document.getElementById('fileStrip')) >= 0){
console.log('move ( '+ pman.reName.selection.join()+ ') to ' +placement +' of '+ tgtID);
//リスト領域内
//リスト領域内でアイテムの外にドロップ ＞ ルートの最後尾にアタッチ
console.log('droped to fileStrip end');
                if(selectedItems.length){
                    pman.reName.move(selectedItems,tgtID,placement);
                };
                pman.reName.pending = false;// */
            }else{
//リスト領域外（削除？）
                alert('OUT of RANGE!!');
            };
        }else if((items.length >= 1)&&(items[0].webkitGetAsEntry)){
//        }else if((items.length == 1)&&(items[0].webkitGetAsEntry().isDirectory)){
//フォルダの単独ドロップ
/*
ファイル・フォルダの混合ドロップ
ドロップ処理が行われる以上、アイテムはファイルエントリであるはずなのでディレクトリ判定は基本的に不要
単独ドロップと複数ドロップの境界は曖昧なのでこのルーチンで全処理が可能なはず
実行条件が変更される
*/
console.log(items);
console.log(items[0].webkitGetAsEntry().isDirectory)
            if((electronIpc)&&(files.length == 1)&&(files[0].path)){
console.log('Electron')
//ドロップ数１ path拡張あり
console.log('files[0] has path ;')
//fileにpath拡張があるのでエレクトロン環境と判定
//hub&&spoke:メッセージ通信でバックグラウンド処理へ移行
				uat.MH.parentModule.window.postMessage({
					channel:'callback',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					to:{name:'hub',id:uat.MH.parentModuleIdf},
					command:'return electronIpc.getEntryFileList(...arguments)',
					content:[files[0].path,3,pman.reName.maxItemCount],
					callback:"pman.reName.openItems(...arguments)"
				});
			}else if((files.length >= 1)&&(items.length >= 1)){
//			}else if((files.length == 1)&&(items.length == 1)){
console.log('entry some folders :'+ pman.reName.loadCtrl)
//console.log('entry single folder :'+ pman.reName.loadCtrl)
//
				const entries = [];
				const promise = [];
				for (const item of items) {
					const entry = item.webkitGetAsEntry();
console.log(entry);
					promise.push(scanFiles(entry, entries));
				};
				await Promise.all(promise);
console.log(entries,files[0].name,((e.metaKey)||(e.ctrlKey))); //テスト表示
/*--------------------追加コード--------------------
                for(let result of entries) {
                    result.file(file => {
                        const reader = new FileReader();
                        reader.readAsText(file);
                        reader.onload = () => {
                            console.log(result.fllPath);
                            console.log(file);
                            console.log(reader.result);
                        };
                    });
                }
//;-----------------------------------------------*/
//                pman.reName.initItems(entries,files[0].name,((e.metaKey)||(e.ctrlKey)));
//                pman.reName.openItems(entries,files[0].name,((e.metaKey)||(e.ctrlKey)));
                var baseName = ((files.length == 1)&&(items.length == 1))? files[0].name:false;
                pman.reName.openItems(entries,baseName,((e.metaKey)||(e.ctrlKey)));
            }else if(files.length){
console.log('toss openItems')
//                pman.reName.initItems(files,false,((e.metaKey)||(e.ctrlKey)));
                pman.reName.openItems(files,false,((e.metaKey)||(e.ctrlKey)));
            };
        }else if(
            (files.length > 0)
//            (e.composedPath().indexOf(document.getElementById('fileStrip')) >= 0)&&
        ){
//ファイル｜フォルダアイテムのドロップ
console.log('file item droped');
console.log(files);
//openItems(itms,baseFolder,update,evt,insTargetItem,placement)
            pman.reName.openItems(
                files,
                '',
                false,
                e,
                pman.reName.getItem(tgtID),
                placement
            );//イベントも渡す
/*
            if(pman.reName.items.length == 0){
//アイテム未登録(baseFolderが未登録)の場合は初期化
console.log('init items droped');
                pman.reName.initItems(files,false,((e.metaKey)||(e.ctrlKey)));
            }else{
//それ以外は、追加
                pman.reName.openItems(files);
            };// */
        }else{
//不明
console.log(itemid);
console.log(files);
console.log(items);
        };
    }, false);

//    document.getElementById('itemList').
//    document.getElementById('fileStrip').addEventListener('focus', function(e){console.log(e.id);},false);
    document.getElementById('fileStrip').addEventListener('click', function(e) {
        e.stopPropagation();e.preventDefault();
        pman.reName.check(e);
    }, false);
    document.getElementById('basefolder').addEventListener('dblclick', function(e) {
        e.stopPropagation();e.preventDefault();
        pman.reName.check(e);
    }, false);
    document.getElementById('basefolder').addEventListener('click', function(e) {
        e.stopPropagation();e.preventDefault();
        pman.reName.select(null);
    }, false);
    document.getElementById('basefolder_reName_status').addEventListener('click', function(e) {
        e.stopPropagation();e.preventDefault();
        pman.reName.select(null);
    }, false);
    document.getElementById('previewheader_reName_text').addEventListener('input', function(e) {
        if(pman.reName.focus < 0) return ;
        document.getElementById("ipt_rename_item_" + pman.reName.focus).value = e.target.value;
    }, false);
//カーソル変更
    document.getElementById('previewWindow').addEventListener('pointermove', function(e) {
//xUI.printStatus(e.target.id);
        var point = [
            (e.pageX-document.getElementById('previewWindow').offsetLeft)/document.getElementById('previewWindow').clientWidth,
            (e.pageY-document.getElementById('previewWindow').offsetTop)/document.getElementById('previewWindow').clientHeight
        ];
        if(
            (e.target.className=='assetItemBox')||
            (e.target.className=='thumbnailBoxPreview')||
            (e.target.className=='elementThumbnail')
        ){
//対象外アイテム
            document.getElementById('previewWindow').style.cursor = 'auto';
        }else if(
            (!(nas.HTML.mousedragscrollable.movecancel))&&
            (nas.HTML.mousedragscrollable.move)
//            (nas.HTML.mousedragscrollable.footmark)
        ){
//移動中（アイテムハンドリング注）
            document.getElementById('previewWindow').style.cursor = 'grabbing';
        }else if(
            (document.getElementById('imgPreview'))&&
            (!(pman.reName.onCanvasedit))&&
//            (!(nas.HTML.mousedragscrollable.footmark))&&(
            (!(nas.HTML.mousedragscrollable.move))&&(
                (document.getElementById('previewWindow').clientWidth  <= document.getElementById('imgPreview').width)||
                (document.getElementById('previewWindow').clientHeight <= document.getElementById('imgPreview').height)
            )&&(point[0] >= 0.1)&&(point[0] <= 0.9)&&(point[1] >= 0.1)&&(point[1] <= 0.9)
        ){
//移動可能（）
            document.getElementById('previewWindow').style.cursor = 'grab';
        }else if(pman.reName.focus >= 0){
//ページ遷移可能
/*
    ページ遷移のホットエリアを各辺の中央(0.4-0.6)に変更
*/
            if(pman.numOrderUp){
                if(
//                    (point[1] < 0.1)||(point[0] > 0.9)
                    ((point[1] < 0.1)&&(point[0] > 0.4)&&(point[0] < 0.6))||
                    ((point[0] > 0.9)&&(point[1] > 0.4)&&(point[1] < 0.6))
                ){
                    document.getElementById('previewWindow').style.cursor = 'url(css/images/cursor/upward.png) 16 4,n-resize';
//                pman.reName.select('prev');//上・右
                }else if(
//                    (point[1] > 0.9)||(point[0] < 0.1)
                    ((point[1] > 0.9)&&(point[0] > 0.4)&&(point[0] < 0.6))||
                    ((point[0] < 0.1)&&(point[1] > 0.4)&&(point[1] < 0.6))
                ){
                    document.getElementById('previewWindow').style.cursor = 'url(css/images/cursor/downward.png) 16 28,s-resize';
//                pman.reName.select('next');//下・左
                }else{
                    document.getElementById('previewWindow').style.cursor = 'auto';
                };
            }else{
                if(
//                    (point[1] < 0.1)||(point[0] < 0.1)
                    ((point[1] < 0.1)&&(point[0] > 0.4)&&(point[0] < 0.6))||
                    ((point[0] < 0.1)&&(point[1] > 0.4)&&(point[1] < 0.6))
                ){
                    document.getElementById('previewWindow').style.cursor = 'url(css/images/cursor/upward.png) 16 4,n-resize';
//                pman.reName.select('prev');//上・左
                }else if(
//                    (point[1] > 0.9)||(point[0] > 0.9)
                    ((point[1] > 0.9)&&(point[0] > 0.4)&&(point[0] < 0.6))||
                    ((point[0] > 0.9)&&(point[1] > 0.4)&&(point[1] < 0.6))
                ){
                    document.getElementById('previewWindow').style.cursor = 'url(css/images/cursor/downward.png) 16 28,s-resize';
//                pman.reName.select('next');//下・右
                }else{
                    document.getElementById('previewWindow').style.cursor = 'auto';
                };
            };
        }else{
            document.getElementById('previewWindow').style.cursor = 'auto';
        };
    });
//document.getElementById('previewWindow').addEventListener('mousedown', function(e) {});
    document.body.addEventListener('mousedown', function(e) {
//console.log('context :' + e.target.id);
//console.log(e.composedPath());
//コンテキストメニュー上のボタンダウンイベントは送らない
        if(e.target.id.indexOf('cM')!= 0) xUI.flipContextMenu(e);
    },false);

//ロングプレスによるコンテキスメニュー呼び出し
//引き渡しイベントは JQイベントをそのまま
    $(document.body).longpress(
        function(e){
console.log('longpress') ;console.log(e);
console.log(e.originalEvent.composedPath());
//console.log([e.target.id,e.target.className]);
            if(!(
                (e.target.value)||
                (e.target.onclick)||
                (e.target instanceof HTMLLIElement)||
                (e.target instanceof SVGElement)||
                (
                    (e.target.id.match(/^[0-9]+_[0-9]+$/))&&
                    (xUI.Selection.join('_')!='0_0')
                )||(
                    (e.target.id.indexOf('optionPanel')>=0)||
                    (e.target.className.indexOf('float')>=0)
                )||
                (e.target.id.indexOf('cM')== 0)
            )) xUI.flipContextMenu(e);},
        function(e){
//console.log('shortpress');console.log(e);
            if(!(
                (e.target.value)||
                (e.target.onclick)||
                (e.target instanceof HTMLLIElement))||
                (e.target instanceof SVGElement)||
                (
                    (e.target.id.match(/^[0-9]+_[0-9]+$/))&&
                    (xUI.Selection.join('_')!='0_0')
                )||(
                    (e.target.id.indexOf('optionPanel')>=0)||
                    (e.target.className.indexOf('float')>=0)
                )||
                (e.target.id.indexOf('cM')== 0)
            ) xUI.flipContextMenu(e);},
    500);
// 
//プレビューウインドウ マウスオペレーション終了時の処理
    document.getElementById('previewWindow').addEventListener('pointerup', function(e) {
console.log(e);
        if(!(nas.HTML.mousedragscrollable.movecancel)){
//フットマークが存在すればマウスドラグ移動の解決
//        if(nas.HTML.mousedragscrollable.footmark){}
        if(nas.HTML.mousedragscrollable.move){
            var itemPos   = $('#imgPreview').position();
            if (itemPos) pman.reName.previewPoint = [
                (document.getElementById('previewWindow').clientWidth/2 - itemPos.left)/document.getElementById('imgPreview').width,
                (document.getElementById('previewWindow').clientHeight/2 - itemPos.top)/document.getElementById('imgPreview').height
            ];
console.log(pman.reName.previewPoint);// */
//                nas.HTML.mousedragscrollable.footmark = false ;
//                nas.HTML.mousedragscrollable.down = false ;
//                nas.HTML.mousedragscrollable.move = false ;
console.log(
    nas.HTML.mousedragscrollable.move,
    nas.HTML.mousedragscrollable.down,
    nas.HTML.mousedragscrollable.footmark
);
//                e.stopPropagation();
                return ;
            };
        };
console.log(e);
console.log([e.target.clientWidth,e.layerX]);
//        xUI.flipContextMenu(e);
        if(
            (pman.reName.onCanvasedit)||
            (pman.reName.focus < 0)||
            (e.button != 0)||
            (e.target.className == 'assetItemBox')||
            (e.target.className == 'thumbnailBoxPreview')||
            (e.target.className == 'elementThumbnail')||
            (e.target.clientWidth  < e.layerX)||
            (e.target.clientHeight < e.layerY)
        ) return true;
        var clickPoint = [
            (e.pageX-document.getElementById('previewWindow').offsetLeft)/document.getElementById('previewWindow').clientWidth,
            (e.pageY-document.getElementById('previewWindow').offsetTop)/document.getElementById('previewWindow').clientHeight
        ];
console.log('SELECT PAGE');
        if(pman.numOrderUp){
            if((clickPoint[1] < 0.1)||(clickPoint[0] > 0.9)){
                pman.reName.select('prev');//上・右
            }else if((clickPoint[1] > 0.9)||(clickPoint[0] < 0.1)){
                pman.reName.select('next');//下・左
            };
        }else{
            if((clickPoint[1] < 0.1)||(clickPoint[0] < 0.1)){
                pman.reName.select('prev');//上・左
            }else if((clickPoint[1] > 0.9 )||(clickPoint[0] > 0.9)){
                pman.reName.select('next');//下・右
            };
        };
    }, false);

/*
 *    プレビュー画面のホイルズーム
 *    リスト画面の場合はスクロール
 */
    document.getElementById('previewWindow').addEventListener('wheel', function(e) {
        if(e.composedPath().indexOf(document.getElementById('listPreview')) >= 0){
            return;
        };//        if(pman.reName.onCanvasedit) return;//NOP return
        var rev = -1;
        let size = pman.reName.preview + rev * (((e.deltaY > 0)? 1:-1) + Math.floor(e.deltaY / 200));
        if(size > 8){size = 8;} else if(size < 1){size = 1;}
        if(size != pman.reName.preview) pman.reName.changeView('',size);
        e.preventDefault();
    },false);
/*ウインドウ上のペースト*/
    document.body.addEventListener('paste', function(e) {
//console.log(e);
        if(true){
// event からクリップボードのアイテムを取り出す
	    var data_transfer = (e.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
//console.log('event paste');
	    var myImg = data_transfer.getData( "image" );// 文字列データを取得

            var items = e.clipboardData.items; //clipboard item
            for (var i = 0 ; i < items.length ; i++) {
                var item = items[i];
                if (item.type.indexOf("image") != -1) {
// 画像拾い出す
                    var file = item.getAsFile();
                    console.log(file);
//      upload_file_with_ajax(file);
                };
            };
        };
    });
//サービスCGIのアドレスを調整 Electron版では基本的に不要
//    if(String(location).indexOf('https')==0) {ServiceUrl=HttpsServiceUrl};

//    起動時に AIR環境で引数があれば引数を解釈実行する。
//同様のルーチンで  invorkイベントがあれば引数を解釈して実行するルーチンが必要
//実体はair_UI.jsxに

//test タスクコントローラ起動
    startupTaskController();
//画面リフレッシュタスクを設定する
    xUI.taskQueue.addTask( new UItask(
        "item_list_update",
        function(){pman.reName.refreshItemlist(false,false)},
        500,
        -1
    ));

//flip player タスク起動
    xUI.taskQueue.addTask( new UItask(
        "flip_player",
        pman.reName.flipPlay,
        10,
        -1
    ));
//アイテム監視タスクを設定する
    xUI.taskQueue.addTask( new UItask(
        "dataWatcher",
        function(){if(pman.reName.items.length) pman.reName.checkItemSource();},
        15000,
        -1
    ));

//スタートアップ自動実行タスクを設定する
    xUI.taskQueue.addTask( new UItask(
        "application_startup_action",
        pman.loadStartupItem,
        1000,
        1
    ));

//プレビュー関連ドラグスクロール起動
    nas.HTML.mousedragscrollable('.mousedragscrollable');
//UI画面類初期化
    nas_pman_Init();


// startupDocumentがない場合でフラグがあればシートに書き込むユーザ名を問い合わせる
/*
    この時点のユーザ問い合わせ手順に問題あり
    問い合わせが必要か否かの条件を調整  かつ  問い合わせ時に記録からユーザの情報を取得して選択肢として提示するUIが必要
    ユーザ設定フラグを判定してUIを提示する
    html5のオートコンプリートを利用するのでinput初期値はカラに
    UIを提示しない場合は、デフォルトの値またはクッキーで記録した最後のユーザが設定される
*/
if((! xUI.onSite)&&(config.NameCheck)) xUI.setCurrentUser(false);

//リネームパネル初期化
//console.log(i18next.getDataByLanguage(nas.locale));
//console.log(pman.startupItem);

    pman.reName.initItems([]);
//画面状態を再初期化
    xUI.sWitchPanel('ibC','show');
    xUI.sWitchPanel('Search','show');
    xUI.sWitchPanel('flip_control','show');
    xUI.sWitchPanel('rename_setting','hide');
    xUI.sWitchPanel('PreviewSize','hide');
    xUI.sWitchPanel('ThumbnailSize','hide');
    xUI.sWitchPanel('prefix','hide');
    xUI.sWitchPanel('suffix','hide');
    xUI.adjustSpacer();

//nas.HTML.showModalDialog('alert','WAIT');

};

//
/** アプリケーションUIをリセットする手続き
*/
function nas_pman_Init(){
//    var startupWait=false;
//    console.log(nas.pmdb)
//ダイアログ類の初期化

/*
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
*/
(function initPanels(){

    console.log("float & modal panel init");

//perfect-scrollbar初期化
//    var ps3 = new PerfectScrollbar('#tabSelector-doc');

//起動時に各種パネルの初期化を行う。主にjquery-ui-dialog
//ログインパネル

$("#optionPanelLogin").dialog({
    autoOpen:false,
    modal    :true,
    width    :480,
    position :{
        my: "left top",
        at: "center-240 top+100",
    },
    title    :"login"
});// */
//aboutパネル
$("#optionPanelVer").dialog({
    autoOpen:false,
    modal    :true,
    width    :'100%',
    top      :50,
    title    :localize(nas.uiMsg.aboutOf,"UAToolbox"),
    position: {
        of : window,
        at: 'left top',
        my: 'left+50 top+50'
    }
});
pman.reName.canvasPaint.syncItemDlg();//背景色を初期化しておく
/*
    新規アイテム挿入ダイアログ（モーダル）
*/
$("#optionPanelInsertItem").dialog({
    autoOpen:false,
    modal    :true,
    width    :480,
    position :{
        my: "left top",
        at: "center-240 top+100",
    },
    title    :"insert new item"
});// */
/*
optionPanelPaint floating Panel
*/
jQuery(function(){
    jQuery("#optionPanelPaint a.close").click(function(){
        jQuery("#optionPanelPaint").hide();
        return false;
    })
    jQuery("#optionPanelPaint a.minimize").click(function(){
        if(jQuery("#optionPanelPaint").height()>100){
           jQuery("#formPaint").hide();
           jQuery("#optionPanelPaint").height(24);
    }else{
           jQuery("#formPaint").show();
           jQuery("#optionPanelPaint").height(360);
    }
        return false;
    })
    jQuery("#optionPanelPaint dl dt").mousedown(function(e){
        jQuery("#optionPanelPaint")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelPaint").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelPaint").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelPaint").css({
                top:e.pageY  - jQuery("#optionPanelPaint").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelPaint").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});

/*
optionPanelText floating Panel
*/
jQuery(function(){
    jQuery("#optionPanelText a.close").click(function(){
        jQuery("#optionPanelText").hide();
        return false;
    })
    jQuery("#optionPanelText a.minimize").click(function(){
        if(jQuery("#optionPanelText").height()>100){
           jQuery("#formText").hide();
           jQuery("#optionPanelText").height(24);
    }else{
           jQuery("#formText").show();
           jQuery("#optionPanelText").height(200);
    }
        return false;
    })
    jQuery("#optionPanelText dl dt").mousedown(function(e){
        jQuery("#optionPanelText")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelText").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelText").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelText").css({
                top:e.pageY  - jQuery("#optionPanelText").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelText").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
optionPanelStamp floating Panel
*/
jQuery(function(){
    jQuery("#optionPanelStamp a.close").click(function(){
        jQuery("#optionPanelStamp").hide();
        return false;
    })
    jQuery("#optionPanelStamp a.minimize").click(function(){
        if(jQuery("#optionPanelStamp").height()>100){
           jQuery("#formStamp").hide();
           jQuery("#optionPanelStamp").height(24);
    }else{
           jQuery("#formStamp").show();
           jQuery("#optionPanelStamp").height(200);
    }
        return false;
    })
    jQuery("#optionPanelStamp dl dt").mousedown(function(e){
        jQuery("#optionPanelStamp")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelStamp").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelStamp").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelStamp").css({
                top:e.pageY  - jQuery("#optionPanelStamp").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelStamp").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});

})();
//ダイアログ類の初期化

};

/*
    ページ再ロード前に必要な手続群
*/
function nas_pman_reStart(evt){
//applicationIdfをローカルストレージに保存
    if(serviceAgent.applicationIdf) localStorage.setItem("info.nekomataya.pman.applicationIdf",serviceAgent.applicationIdf);
//    クッキーを使用する設定なら、現在のデータをビルドしてクッキーかき出し
    if (config.useCookie[0]) writeCk(buildCk());

};

/*
    sync UI表示同期プロシジャ
オンメモリの編集バッファとHTML上の表示を同期させる。キーワードは以下の通り
    undo
    redo
    renameDigits
    prefix
    suffix
    preview
    ThumbnailSize
    PreviewSize
    Search
    NOP_
*/
function sync(prop){
if (typeof prop == 'undefined') prop = 'NOP_';
    switch (prop){
case    "undo":    ;
if(xUI.activeDocument){
//undoバッファの状態を見てボタンラベルを更新
    var stat=(xUI.activeDocument.undoBuffer.undoPt==0)? true:false ;
    $("#ibCundo").attr("disabled",stat);
}else{
    $("#ibCundo").attr("disabled",true);
}
    break;
case    "redo":    ;
if(xUI.activeDocument){
//redoバッファの状態を見てボタンラベルを更新
    var stat = ((xUI.activeDocument.undoBuffer.undoPt+1)>=xUI.activeDocument.undoBuffer.undoStack.length)? true:false ;
    $("#ibCredo").attr("disabled",stat);
}else{
    $("#ibCredo").attr("disabled",true);
}
    break;
case    "renameDigits":
	var postfix = nas.RZf("_0",pman.reName.renameDigits);
console.log(prop +postfix);
//プルダウンメニュー用
	if(document.getElementById("pMrenameDigits" +postfix)) document.getElementById("pMrenameDigits" + postfix).checked = true;
//コンテキストメニュー用
	if(document.getElementById("cMrenameDigits" +postfix)) document.getElementById("cMrenameDigits" + postfix).checked = true;
//エレクトロンメニュー用
	if(( appHost.Nodejs )&&( electron )) ipc.send('menu-check',"renameDigits" + postfix,true);
    break;
case    "prefix":
case    "suffix":
case    "preview":
case    "thumbnail":
case    "search":
//===================== パネルスイッチ
//パネルの状態を取得
    var panels = {
        prefix     :"#prefixStrip",
        suffix     :"#suffixStrip",
        preview    :"#optionPanelPreviewSize",
        search     :"#optionPanelSearch",
        thumbnail  :"#optionPanelThumbnailSize"
    };
    var isVisible =  $(panels[prop]).isVisible();
//プルダウンメニュー用
		if(document.getElementById("pM" + prop)) document.getElementById("pM" + prop).checked = isVisible;
//コンテキストメニュー用
		if(document.getElementById("cM" + prop)) document.getElementById("cM" + prop).checked = isVisible;
//エレクトロンメニュー用
		if(( appHost.Nodejs )&&( electron )) ipc.send('menu-check',prop,isVisible);
    break;
case    "NOP_":    ;
    break;
default    :    if(config.dbg){dbgPut(": "+prop+" :ソレは知らないプロパティなのです。");}
    }
//windowTitle及び保存処理系は無条件で変更
    if(xUI.activeDocument){
    }else{
console.log('xUI は初期化前: yet init xUI');
    }
//
}

/*                        ----- io.js
*/
/**
    テキストエリアに値を挿入する編集メソッド
    クリックの発生したエレメントの値 をinsertTargetのinsertメソッドに渡しフォーカスを移す
*/
var editMemo=function(e,insertTarget){
    var myTarget=e.target;
    if(
    (myTarget instanceof HTMLInputElement)||
    (myTarget instanceof HTMLButtonElement)
    ){
        var myValue=(myTarget.value)?myTarget.value:myTarget.innerHTML;
        insertTarget.insert(myValue);
        insertTarget.focus();
    }
}

//
/*
    pmanオブジェクトをアプリケーショントレーラーとして作成
    numOrderUp  アセットの並び替えを行う際の番号並び順 true=昇順(仕撮) | false=降順(作画)
    startupItem アプリケーション初期化の際に読み込むデータ
    文字列で指定されるターゲットディレクトリのパス（Electron環境下のみ）
    配列で与えられるブラウズエントリ（URLに変換して与えられる）
    初期アイテムが不要な場合は [] または '' を指定
    特殊キーワードとして -sample- または -openFolder- を指定可能
    -sample-      別に設定されたサンプルデータが読み込まれる
    -openFolder-  起動直後にディレクトリを指定するダイアログを呼び出す
    スタートアップアイテムは、queryの形で与えることができる
*/
    var pman = {
        numOrderUp:false,
        startupItem:[]
    };//config.pman_startupItems
/**
 *  スタートアップアイテム読み込み
 *  WEB版起動時にURLクエリを解釈
 *  ?load=-sample-
 *      配列pman.startupItemにサンプルデータを配置してUIを初期化する
 *  ?load=-openFolder-msg
 *      起動後にフォルダ選択ダイアログを呼び出して入力を促す
 *  ?load=<url>
 *      <url>(拡張子は".json")で指定されたアドレスの内容読み出し
 *      アイテムリストとして初期化する
 *      urlの戻り値は、以下の形式のオブジェクトまたはデータURLの配列データであること
 *      {
     
        }
 *      [<データURL>,<データURL>...]
 *  ?load=<URIエンコードされたフルパス>
 *  環境が appHost.platform == "Electron" である場合は、フルパスによるフォルダの指定も可能
 */
pman.loadStartupItem = async function loadStartupItem(baseFolder){

    if(! baseFolder) baseFolder = "";
//window.location をチェック
    if(window.location.search){
        var searchParams = new URLSearchParams(window.location.search);
        var loadTarget = null;
        if((searchParams)&&(searchParams.has('load'))){
            loadTarget = searchParams.get('load');
        };
        if(loadTarget){
            if(loadTarget.match(/^(\-openFolder\-|\-sample\-).*/)){
                pman.startupItem = RegExp.$1;
            }else if(loadTarget.match(/\.json$/i)){
//JSONを読み込んでスタートアップアイテムに展開する
                var dataurl = loadTarget;
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('GET', dataurl);
                xhr.onload = function (res) {
    console.log(res);
    console.log(
                    res.target.response.items,
                    decodeURIComponent(res.target.response.baseFolder)
                );
                    pman.reName.initItems(
                        res.target.response.items,
                        decodeURIComponent(res.target.response.baseFolder)
                    );
//                    pman.startupItem = res.target.response.items;
//                    pman.loadStartupItem(decodeURIComponent(res.target.response.baseFolder));
                };
                xhr.send();
                pman.startupItem = "";
            }else{
//fullPath等、与えられたqueryの末尾がJSONでない場合は、そのままデコードして登録 クエリで直接オブジェクトを引き渡すことはできない
                pman.startupItem = decodeURIComponent(loadTarget);
            };
        };
    };
//以降設定に従って動作
    if(pman.startupItem == '-sample-'){
//        pman.startupItem = config.pman_startupItems;
        pman.reName.initItems(config.pman_startupItems);
    }else if(pman.startupItem == '-openFolder-'){
        if(appHost.platform == 'Electron'){
            pman.reName.openFolder();
        }else{
            nas.HTML.showModalDialog('confirm',['OKボタンでフォルダを選択\n',decodeURIComponent(loadTarget).slice(12)],'openFolder',null,pman.reName.openFolder);
        };
    }else if(pman.startupItem instanceof Array){
//相対パスの配列で与えられた初期アイテムをURLに展開する
        pman.reName.initItems(Array.from(pman.startupItem,e =>{
            if(e.indexOf('http') >= 0){
//http|shttp
                return new URL(e);
            }else{
//相対パス
                return new URL(e,document.location);
            };
        }),baseFolder);
    }else if((electronIpc)&&(pman.startupItem)){
//単独の文字列
        window.moveBy(50,50);
        pman.reName.initItems(...electronIpc.getEntryFileList(pman.startupItem));
    };
}
/**
    コンストラクタ　アイテムステータス
 */
pman.ItemStat = function ItemStat(stat){
	let now = new Date();
	this.size        = null;
	this.atime       = now;
	this.ctime       = now;
	this.mtime       = now;
	this.birthtime   = now;
	this.atimeMs     = now.getTime();
	this.ctimeMs     = now.getTime();
	this.mtimeMs     = now.getTime();
	this.birthtimeMs = now.getTime();
	if(stat) this.parse(stat);
}
pman.ItemStat.parse = function(stat){
}

/* コンスタトラクタ 作業セッション情報
ローカルディスク上の作業セッション情報を代表するオブジェクト
xMap.pmu Pm.PmUnitのセッションに対応する、ローカルファイルシステム上のセッション管理を行うローレベルの管理オブジェクト
関連付けられたPm.PmUnitが存在しない

パス・セッション名（フォルダ名）・セッション状況・作業ログ等を保持する

排他制御のロックファイルを管理する
セッションが初期化される際に対象の作業フォルダにロックファイルを兼ねた「バックアップフォルダ」を作成する
作成に成功したことを確認してセッションが開始される
作成失敗時はロックができないのでセッションの初期化に失敗する
バックアップフォルダのフォルダ名は以下のルールに従う

<セッションID>[<任意の作業名称>]<任意文字列|''>

整数のセッションIDを持つ
Origin 1
例
セッション中(作業中)
1[原画](wroking)/
1[原画](wroking)/_jobstatus.text|_jobstatus.json

セッション終了(納品状態)
1[原画]/
1[原画]/_jobstatus.text|_jobstatus.json

バックアップフォルダのサフィックス文字列は排他ロック中の状況を表示する役割をもつ
終了（納品）時にはサフィックスを外す　以降はリネームが禁止される

_jobstatusファイルは内部にセッション情報とログを持つ
随時Worksessionと同期が行われる
    @params {String}    path
    @params {String}    nodePath

最小の管理単位として初期化される場合WorkSessionはJobと一致する
ひとつのJobはStageを排他占拠するので同時にStageSessionとしても機能する

*/
pman.Worksession = function(path){
	this.xmap       = null;//
	this.uniquekey  = nas.uuid();
	this.mLocked    = false;
	this.dataNode   = {}
	this.type       = "workSessionStatus";

	this.pmu        = this.xmap.pmu;//pmuごと参照する
	this.product    = this.xmap.pmu.product;//参照
	this.inherit    = this.xmap.pmu.inherit;
	this.mNode      = this.xmap.pmu.currentNode;

	this.sessionLog = [];//空白で初期化
	
}
/*
    Object Worksession を作成するクラスメソッド
    作成に失敗した場合はnullが返される
    セッション名は以下の形式
    <lineNo>__<StageNo><StageName>__<jobNo>[<jobName>]
    eg.
    0__1GE__1[cd]
    0__1GE__2[ad]
数字、アンダーバー、ブラケットは必須
文字列はユーザによる任意の文字列
UAFフルサポートでない場合はフォルダ名を使用する
<baseFolder>
    ├_backyard/                 //バックヤードはすべてのフォルダに存在するケースがある標準では非表示？
    ├#[<baseFolder>](working)/  //バックアップフォルダーが存在するケースあり
    ├<xxx>.xmap                 //存在する場合は、これが pman.reName.xmap と同期される
    ├__[XXX][YYY][ZZZ]          //存在する場合は、xmapとセットで
    ├<subFolder1>/
    ├<subFolder2>/
    ├<subFolder3>/
    └<subFolder4>/
        ├_backyard/
        ├<xxx>.xmap             //下位にxmapが存在する場合は現在は放置　ただし全サポートに変更された場合はフォールダウンの対象
        ├<item1>
        ├<item2>
        ├<item3>
        ├1[<subFolder4>]/
        └2[<subFolder4>](working)/  //バックアップフォルダーのうち、最も時制の遅いものをチェックイン判定対象に ユーザが異なる場合は必ず新規
            ├_jobstatus.txt     
            ├<backup-data>
            ├...
*/
pman.Worksession.init = async function initWorksession(sessionPath,xmap,sessionName){
    var result = null;
    if(typeof sessionPath == 'undefined') return result;
    if((appHost.fileAccess)||(appHost.platform == 'Electron')){
        if(sessionPath.exists){
            sessionPath
        }else{
            
        }
    }
    if(! xmap) xmap = pman.reName.xmap;// 参照用のxmapは必要　参照のみでなくセッションにより更新が行われる
    if(! sessionName) sessionName = nas.File.basename(sessionPath);
/*
//sessionPathがフォルダとして存在するか？
//無い リジェクト
//ある セッション初期化可能か？
//  既存セッションでロックされている => ユーザ認証が同一 再開可能 | リジェクト 確認
        既存の作業セッションを続けますか？ 既存のセッションを閉じて新しい作業を開始することも可能です
        作業中のセッションがすでにあります 作業を開始できません
//  既存の終了セッションがある 最終セッションはユーザがマッチしているか マッチ再開可能 ｜ マッチ||アンマッチ 新規セッション開始可能
        既存の作業を再開することが可能です または新しく作業を開始することができます
//  既存のセッションが無い => 新規１号セッションが開始可能
        作業を開始します
        ;// */
    return result;
};


nas.Stamp = function(){
    this.name = "";
    this.url = "";
    this.alt = "";
    this.description =""; 
    if(arguments.length) this.parse(...arguments);
}
nas.Stamp.prototype.parse = function(){

    return this;
}
nas.StampCollection = function(){
    this.members = {};
}
//呼び出しメソッド
nas.StampCollection.prototype.get = function(key){
    if(this.members[key]){
        return this.members[key];
    }else{
        for(var ky in this.members){
            if((this.members[ky] === key)||(this.members[ky].name == key)||(this.members[ky].url == key)) return this.members[ky];
        };
    };
    return null;
}
//書き込みメソッド
nas.StampCollection.prototype.put = function(stmp){
    if(this.get(stmp) !== stmp){
        var newMember = new Stamp(stmp);
        this.members[newMember.name] = newMember;
    }else{
        return stmp
    };
}
/* 現在はJSONのみ 他の仕様にあわせて dump|plain|textの三種を設定する予定 */
nas.StampCollection.prototype.parseConfig = function(configStream){
    this.members = JSON.parse(configStream);
}
nas.StampCollection.prototype.dump = function(form){
    if(form == 'JSON')
        return JSON.stringify(this.members);
}

nas.stamp = {
    members :{
        "director":{
            name:"director",
            url:"nas/lib/resource/Stamp/images/director.png",
            alt:"監督",
            description:"監督印"
        },
        "animation":{
            name:"animation",
            url:"nas/lib/resource/Stamp/images/animation.png",
            alt:"動検",
            description:"動検印"
        },
        "animetion_director":{
            name:"animetion_director",
            url:"nas/lib/resource/Stamp/images/animetion_director.png",
            alt:"総作監",
            description:"総作監印"
        },
        "chief_animator":{
            name:"chief_animator",
            url:"nas/lib/resource/Stamp/images/chief_animator.png",
            alt:"作監",
            description:"作監印"
        },
        "co_director":{
            name:"co_director",
            url:"nas/lib/resource/Stamp/images/co_director.png",
            alt:"演出",
            description:"演出印"
        },
        "color_sp":{
            name:"color_sp",
            url:"nas/lib/resource/Stamp/images/color_sp.png",
            alt:"色指定",
            description:"色指定印"
        },
        "data_convert":{
            name:"data_convert",
            url:"nas/lib/resource/Stamp/images/data_convert.png",
            alt:"データコンバート",
            description:"データコンバート印"
        },
        "finishwork":{
            name:"finishwork",
            url:"nas/lib/resource/Stamp/images/finishwork.png",
            alt:"仕検",
            description:"仕上検査印"
        },
        "image_scan":{
            name:"image_scan",
            url:"nas/lib/resource/Stamp/images/image_scan.png",
            alt:"スキャン",
            description:"イメージスキャン印"
        },
        "printout":{
            name:"printout",
            url:"nas/lib/resource/Stamp/images/printout.png",
            alt:"印刷",
            description:"印刷印"
        }
    },
    selected:"director",
}
//呼び出しメソッド
nas.stamp.get = function(key){
    if(this.members[key]){
        return this.members[key];
    }else{
        for(var ky in this.members){
            if((this.members[ky].name == key)||(this.members[ky].url == key)) return this.members[ky];
        };
    };
    return null;
}

/**
    @params {Array of Object pman.ReNameItem}    items
    @params {Boolean}   parentdir
    @params {String}    app
    アセットアイテムの配列を指定してシステムで開く

mac open コマンド引数
open -a (application path) (target file) アプリで開く
open -t (target file) 標準テキストエディタで開く

ex.
open -a photoshop.app hogehoge.psd

windows start
https://docs.microsoft.com/ja-jp/windows-server/administration/windows-commands/start

start [<title>] [/d <path>] [/i] [{/min | /max}] [{/separate | /shared}] [{/low | /normal | /high | /realtime | /abovenormal | belownormal}] [/node <NUMA node>] [/affinity <hexaffinity>] [/wait] [/b] [<command> [<parameter>... ] | <program> [<parameter>... ]]

ex.
start photoshop.exe hogehoge.psd
start hogehoge.psd
start http://hogehoge.org/

xdg-open
ex.
photoshop hogehoge.psd
xdg-open hogehoge.psd
xdg-open http://hogehoge.org/

*/

pman.openData = function openData(items,parentdir,app){
    if(!( items instanceof Array)) items = [items];
    var pathItems = (Array.from(items,(e)=>{
        if(e.url){
            return e.url.href;
        }else if (e.path){
            return e.path;
        }else if (e.relativePath){
            return nas.File.join(nas.File.dirname(pman.reName.baseFolder), e.relativePath);
        }else if (e.fullPath){
            return e.fullPath;
        };
        return e.toString();
    }));
//アイテムの存在するフォルダをファインダ｜エクスプローラで開くオプション
//重複を整理して空白アイテムを削除する
    if(parentdir){
        var tmp = [];
        pathItems.forEach(e =>{
            if(e) tmp.add(decodeURI(nas.File.dirname(e)));
        });
        pathItems = tmp;
    };
    if(app){
        if(app == '-newWindow-'){
            if(appHost.platform == 'Electron'){
                
            }else{
                uat.MH.openURL('pman_reName',"unique");
            };
        }else{
            app = xUI.extApps.get(app);
console.log(pathItems);
console.log(app);
            var comprop = [];
            if((app)&&(app.name != 'system')){
                if(appHost.os == 'Mac'){
                    comprop = ["open","-a",app.applicationpath[appHost.os]];//Mac
                }else{
                    comprop = [app.applicationpath[appHost.os]];// Win|Unix
                };
            }else{
                if(appHost.os == 'Mac'){
                    comprop = ["open"];
                }else if(appHost.os == 'Win'){
                    comprop = ["start"];
                }else if(appHost.os == 'Unix'){
                    comprop = ["xdg-open"];
                };
            };
            xUI.openWithSystem(comprop.concat(pathItems));
        };
    }else{
//app指定のない場合は、指定アイテムを現在のウインドウで開く
console.log(pathItems);
        pman.reName.openFolder(pathItems[0]);
    };
}
/**
 *    パスを指定して、そのパスが含まれる管理ノードパスを返す
 *    ルートパス指定があれば管理ノードのルートパスを返す
 *    ヌルが返る場合はいずれの管理エントリにも含まれない
 *  @params {String}    targetpath
 *  @params {Boolean}   rootpath
 *  @returns    {String|null}
 *      パスが位置する管理ノードパスは以下
 *  .<server-url>.<reposiotry-name>.<repository-idf>//
 *  .<サーバ-url(unique)>.<リポジトリ名>.<リポジトリ識別ID(unique)>.//
 *  .<サーバ-url(unique)>...//
 *  
 *   組織(チーム)情報は通常リポジトリの詳細情報内にある
 *  ローカルファイルシステム上のマスターストレージの場合は、これをフォルダで管理する
 * Nekomataya/kachi/kt#00/
 */
pman.getNodeByPath = function(targetpath,rootpath){
    if((!targetpath)||(! fs.existsSync(targetpath))) return false;//パスはアクセス可能か
    var nodepath ;
    var fullpath = fs.realpathSync(targetpath).split('/');
    var currentpath;
    for(var dpt = fullpath.length ; dpt > 0 ; dpt --){
//パスをルートまで遡る
        currentpath = fullpath.slice(0,dpt).join('/');
console.log([path.basename(path.dirname(currentpath)),currentpath]);
        var dirent = fs.readdirSync(path.dirname(currentpath),{withFileTypes:true});
        var etcdir = dirent.find(function(elm){return (elm.name.indexOf("_etc") == 0)});
        if(etcdir){
            var etcdirent = fs.readdirSync(path.join(path.dirname(currentpath),etcdir.name),{withFileTypes:true});
            var currentpmdb = etcdirent.find(function(elm){return (elm.name.indexOf(".pmdb") >= 0)});
            if(currentpmdb){
                var p = new nas.Pm.PmDomain(nas.Pm);
                var pmdbContent = fs.readFileSync(currentpath + etcdir.name + '/' +currentpmdb.name,{encoding:"utf8"});
                p.parseConfig(pmdbContent.trim().replace(/\r\n?/g,"\n"));
                if((p.dataNode)&&(! rootpath)){
                    return decodeURIComponent(p.dataNode) ;
                }else{
                    nodepath = path.dirname(currentpath);
                }
            }else{
                    nodepath = path.dirname(currentpath);
            }
        }else{
            continue;
        }
    }
    if(nodepath){
        return nodepath;
    }
    return null;
}
/*test
    pman.getNodeByPath('/Users/kiyo/Desktop/納品規則/repository\(マスターストレージサンプル\)/Nekomataya\ \(サンプル\)/かちかちやま\ \(NG配置例\)')

var p =new nas.Pm.PmDomain();
var content = fs.readFileSync('/Users/kiyo/Desktop/納品規則/repository(マスターストレージサンプル)/_etc (基礎情報フォルダ)/repository.pmdb',{encoding:"utf8"})
console.log(content)
console.log(content.replace(/\r\n?/g,"\n"))
p.parseConfig(content.trim().replace(/\r\n?/g,"\n"));
console.log(p);
*/
/*
パスを指定してローカルファイルシステムにマスターストレージを作成する
パス指定がない場合は、ファイルダイアログを開いてパスを指定
指定されたパスがすでに設定済みのストレージ内だった場合はストレージを開く
マスターストレージか否かの判定は、指定パスからルートまでのパスをさかのぼって"_etc/nas_master_storage"ファイルの存在を検出する

*/
pman.setupMasterStorage = function(path){
    if (! path){
        path = dialog.showOpenDialogSync({
            title:"setup masterStorage",
            properties: ['openDirectory','createDirectory'],
            message:"新規のマスターストレージを作成します\n既存のディレクトリを指定する場合は、空のディレクトリを指定してください\nすでにファイルのあるディレクトリをマスターストレージにすることはできません\n指定のディレクトリが存在しない場合は、新たに作成します"
        });
    }
    if(! path) return false;//指定されなかったので処理終了
console.log(path);
console.log(path instanceof Array);
console.log(path.length);
    if(path instanceof Array) path = path[0];
    var storagePath = pman.getNodeByPath(path,true);
    if(storagePath) return storagePath;//pman.openStorage(storagePath) ;//指定パスがすでに管理下にあればサーバを開く

    if(fs.existsSync(path)){
//既存パスが指定されている
        var existsEntries = fs.readdirSync(path);
        if(existsEntries.length > 0){
//            (existsEntries.length == 1)&&(existsEntries[0]=='.DS_Store')||(existsEntries[0]=='Thumbs.db')
//既存パスにファイルがある=空ディレクトリのみをセットアップできるので失敗
//console.log(fs.readdirSync(path));
            alert("すでにデータのあるディレクトリをセットアップすることはできません。\n空ディレクトリを指定してください");
            return false;
        }else{
            storagePath = path;
        }
    }else{
//引数で新規パスが指定されている(作成可能か否か不明)
        try{
            console.log(fs.mkdirSync(path));//ここで作成失敗の可能性がある
        }catch(e){
            console.log(e);
            console.log("新規ディレクトリの作成に失敗しました。\nパスを確認してください");
            return false;
        }
        storagePath = path;
    }
    var cfm = confirm(storagePath + "を新たなマスターストレージとして設定します。\nよろしいですか？");
    if(cfm){
//<ストレージパス>/_etc/を作成
//.pmdbを作成
        try{
//root-pmdbを作成し .users .oragnizations tableを作成
//.usersにマスターユーザを加える（必要）仮設
//.oraganizationにイニシャルエントリを加える（必要）仮設
            var rootPmdb = new nas.Pm.PmDomain(nas.Pm,"file://"+storagePath);
            rootPmdb.users = new nas.UserInfoCollection();
            rootPmdb.organizations = new nas.Pm.OrganizationCollection();
            var adminUser = new nas.UserInfo("handle:e-mail");


            var initOrganization = new nas.Pm.Organization()

rootPmdb.organizations.timestamp = new Date('2019.10.01 00:00:00').getTime();
rootPmdb.organizations.parseConfig(`
nekomataya
	fullName:ねこまたや
	code:nkm
	id:0001
	serviceUrl:localRepository:info.nekomataya.pmdb
	shortName:(ね)
	contact:ねこまたや:kiyo@nekomataya.info
	description:ねこまたや:kiyo@nekomataya.info
`);

console.log(rootPmdb.dump('text'));
            var etcPath = storagePath.replace(/\/$/,'')+"/_etc";
console.log(etcPath);
            fs.mkdirSync(etcPath);
            var pmdbFile = etcPath+'/managemant_root.pmdb';
            var fd = fs.openSync(pmdbFile,'w');
            fs.writeSync(fd,rootPmdb.dump('text'));
            fs.closeSync(fd);
//ここで作成失敗の可能性がある
        }catch(e){
            console.log(e);
            console.log("セットアップに失敗しました。\n操作の権限を確認してください");
            return false;
        }
    }
}
/*
 *    マスターストレージをビルドする
 *  手順:
 *      引数はファイルパス
 *  マスターストレージを作成するディレクトはあらかじめ存在してかつ空であることが条件
 *  _etcフォルダを作成 fs.mkdirSynk(path)
 *  基準ファイル群を作成（最低限）
    _etc/organizations.json
	[configurations]    マスターパスワードのハッシュを登録するか？
	[organizations]     空テーブルを初期化
	[users] マスター管理者を１名のみ登録　初回手続き　引数渡し
_etc/users
_etc/password
    一応この形式を考慮しておく
    @params {String}    path
    @params {String}    user
    @params {String}    password
 */
/*  マスターストレージを選択して開く
 *  
 * xUI.
 *  アプリケーション
 *
 *
 *
 *
 */
pman.openStorage =function(targetdir){
    if(!targetdir){
        targetdir = dialog.showOpenDialogSync({
            title:"setup masterStorage",
            properties: ['openDirectory'],
            message:"管理するマスターストレージを指定してください。"
        });
    }
    if(!targetdir) return false;
    console.log(targetdir);
}

/*  サーバセレクタを選択
 *
 *  サーバセレクタを操作して選択を切り替える
 *  フォーカスレベルがサーバへ移行
 *      リポジトリ/タイトル・エピソードの選択がすべて解除されて編集対象がサービスノードになる
 *      xUI.activeNode = ServiceNode
 *
 */
pman.updateServerSelector =function(targetId){
    console.log(parseInt(targetId)+1);
    console.log(serviceAgent.servers[parseInt(targetId)]);
    xUI.activeNode
}

/**
 *	指定された配列内の要素をインプレースで指定位置へ移動する
 *	@params	{Array}   a
 *		並びを変更する配列
 *	@params	{Array}   m
 *		移動する要素IDの配列
 *	@params	{Number}  t
 *		移動先の先頭ID(元配列のID)
 *	@params	{Boolean} p
 *		placementフラグ trueで'PLACEAFTER'に相当するように1を加える
 *	@returns {Array}
 *		並びを変更した引数配列を返す
 */
 pman.arrayElementMove=function(a,m,t,p){
	if(! (m instanceof Array)) m = [m];
	var i = [];
	m.forEach(function(e){ if(e < t) t --;i = i.concat(a.splice(e,1));});
	if(p) t++;
	a.splice.apply(a,[t,0,...i]);
	return a;
}
/**
 *  引数データからSCIを推測して返す
 *  引数は ファイル名||ファイルパスを文字列で
 *  内容テキストの判別はここでは行わない
 * 
 */
pman.guessSCI = function(path){
    if(!path) return '';
console.log(path);
    var pathFile  = new nas.File(path);
    var checkString = pathFile.fullName.replace(/\//g,'__').match( /[^_]+#[^\[#]+(\[[^\]+]\])?__s[^-_]*\-c[^_]+(_[^_]+)*/ );
    if(checkString){
        return checkString[0];
//        return new xMap(checkString[0]);
    }
    return '';
}
/**
 *  @params {String|File|FileEntry|URL}
 *  引数文字列からアイテムタイプを推測して返す
 *  引数は ファイル名||ファイルパスを文字列で
 *  内容テキストの判別はここでは行わない
 *  引数がフォルダであっても良い
 *	アイテムタイプ
 *		-group-		アイテムグループ ファイルシステムのディレクトリに準ずる
 *		-bundle-		UAFolder等のアイテム名で判別できないアイテムバンドルは-bundle-に分類される 
 *		-hiddengroup-	非表示グループアイテム アイテムとして管理される 通常は非表示
 *		-xmap-      制作管理ドキュメント
 *		-status-    制作管理ステータスタグファイル
 *		-xpst-        タイムシート・ドープシートドキュメント
 *		-asset-       制作アセット 管理対象アイテム
 *		-other-       その他 直接管理対象外アイテム
 *		-workslip-    作業納品伝票  ドキュメントの拡張子は txt|json|slip
 *		-canvasasset- 作成中の一時アセット
 *		-note-        アプリ上で挿入されるtextその他の注釈を記述する準アセットアイテム 画像であっても良い

 *		-canvasasset-		canvasassetは、ファイルとして保存されることは無いのでここでは判別対象外
 */
 pman.guessItemType = function(fl){
    var type = '-other-';//初期値・判定にかからなかったアイテムの値
    if(typeof fl == 'string'){
    }else if(fl instanceof URL){
        fl = decodeURIComponent(fl.pathname)
    }else if(fl instanceof File){
        fl = fl.name
    }else if(fl.fullPath){
//fullPathが存在する＝ファイルエントリ
        fl = nas.File.basename(fl.fullPath);
    };
     if(fl == '') return '-group-'
     if(typeof fl == 'string'){
        if(fl.match(/\.[^\.]+$/)){
//拡張子あり パスまたはファイル名(__* && isFile)
            if(fl.match(/\.status\.(te?xt|json|csv)$/i)){
//ステータスタグファイル text,json,csv
                type = '-status-';
            }else if(fl.match(/\.txt|text|csv|json/i)){
//      xspt
//      xmap
//      pmdb
//      stbd
//      workslip
//      
                
            }else if(fl.match(/\.(xps|xpst|sts|tsh|ard|ardj|tdts|xdts)$/i)){
//タイムシートデータ（拡張子による判定）
		        type = '-xpst-';
	        }else if(fl.match(/\.xmap$/i)){
//xMap管理データ
	            type = '-xmap-';
	        }else if(fl.match(/\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pje|png|svg|svgz|webp|aep|bmp|dga|tga|targa|tiff?|ai|eps|ps|tvp|clip|psd|pdf|fl)$/i)){
			    if(fl.match(/.+(sheet|xps|xpst|dope|ts|st|sht)([_-]*\d*)\./i)){
//画像ファイルでファイル名末尾にタイムシート記載のあるもの（推測）
	                type = '-xpst-';
			    }else{
//asset(推測)
	                type = '-asset-';
	            };
	        };
//        }else{
//データ内容文字列 判定メソッドができたらここに挿入
//            return pman.guessItemTypeByContent();
        };
//     }else if(){
         
     };
     return type;
 }
//テキスト判定
/*
xpst|xmap|pmdb|stbd|workslip|PMstatus

 */
/* こちらはpmanで必要なnode resolver
outer_loop:
    for (var i = 0;i < arguments.length; i++){
        var tgt = arguments[i].split('/');
        for (var n = 1; n <= result.length;n ++){
            var head = tgt.indexOf(result.slice(-n)[0]);
            if(head == -1){
                result = result.concat(tgt);
                break;
            }if(head == 0) {
                result.splice(-n,n);
                result = result.concat(tgt);
                break;
            }else if(head > 0){
                continue;
            };
        };
//        result = result.concat(tgt);
    };
:// */
/*
 guessAssetPrefix関数を nas配下に移動
*/
pman.guessAssetPrefix = nas.guessAssetPrefix ;
/**
 *  @params   {Array} memberArray
 *      Item等のcollection配列
 *  @params   {String|nas.CellDescription}  cellDescription
 *      セル記述
 *  @params   {Number}   threshold
 *      セル記述比較関数の返す値を分ける境界値
 *
 * 配列メンバーからセルディスクリプションに一致するエントリを返す
 * メンバーはtoStringで得られる値を使って比較を行う
 *
 *  セル記述比較関数は以下の値を返す
 * 0	0000xb	no match
 * 1	0001xb	number match
 * 3	0011xb	number & suffix match
 * 5	0101xb	number & group match
 * 7	0111xb	number & group & suffix match (fullmatch)
 * 9	1001xb	mod $ number match ~
 試験的関数 同じ親に対するオーバレイセットを得られる関数のほうが有益かも 20220309
 */

pman.getByCellDescription = function(memberArray,cellDescription,threshold){
	if((!(memberArray instanceof Array))||(!(cellDescription))) return false;
	if(typeof threshold =='undefined') threshold = 5;
	var cd = new nas.CellDescription(cellDescription);
	return memberArray.find(e =>{
	    console.log(cd.compare(e.toString()));
	    return (cd.compare(e.toString()) >= threshold)
	});
}
/* TEST
    var member = ["A-1","A-2","A2+","A-002++","A_3","A-3-修","A-4","A005"];
    pman.getByCellDescription(member,"A-3",7);
*/
/*
    @params  {String}   name
        引数文字列 記述・ラベルまたはラベルを含んだ文字列
    @params  {Array}    list
        配列 番号リストまたは記述リスト
    @params  {Boolean}  im
        番号補完フラグfalseの場合末尾番号の次、trueの場合は抜けた番号を補う
    @params  {Number}   dig
        桁指定 0は桁合わせを行わない。未指定の場合はシステムの標準値を使用する

    リストがあれば
    引数から得られるプレフィックスで次の番号をつけて返す汎用関数
    リストがあり番号補完フラグが立っている場合は、補完して最小の番号を返す


    名前リストが与えられた場合その配列内の「次の番号｜補完して最小の番号」を返す
    すべて指定桁が４と仮定して以下のようなリザルトとなる
    nas.pman.guessNextName("A")                           ;// "A-0001"
    nas.pman.guessNextName("A-12")                        ;// "A-0013"
    nas.pman.guessNextName("A",[1,3,5,7],false)           ;// "A-0008"
    nas.pman.guessNextName("A",[1,3,5,7],true)            ;// "A-0002"
    nas.pman.guessNextName("A-12",["A-11","A-12","12a"])  ;// "A-0013"
    nas.pman.guessNextName("A",["A-11","A-12","13"])      ;// "A-0014"
    nas.pman.guessNextName("A",["A-11","A-12","12a"],true);// "A-0001"
    abc...等の補助記号は排除・整数化して解釈する
    nas.pman.guessNextName("A-[A]")                       ;// "A-[B]"
    nas.pman.guessNextName("A-あ")                        ;// "A-い"
    nas.pman.guessNextName("A-a",["b","c","d","e"],false)           ;// "A-f"
    nas.pman.guessNextName("A",["b","c","d","e"],true)            ;// "A-a"
    nas.pman.guessNextName("A-12",["A-11","A-12","12a"])  ;// "A-0013"
    nas.pman.guessNextName("A",["A-11","A-12","13"])      ;// "A-0014"
    nas.pman.guessNextName("A",["A-11","A-12","12a"],true);// "A-0001"

    主記述のbody値が数値を含まない文字列であった場合は、
    文字数列として次の値を求める

一応pmanの配下に置くが、nas|nas.Pm または xMap配下のほうがよいかも
候補は nas.CellDescription.guessNextName (class method)
*/
pman.guessNextName = function guessName(name,list,im,dig){
    var cd  = new nas.CellDescription(name);
    var lts = "";
    if(cd.body == ''){
//比較関数はbody==''の際にアンマッチを返す仕様なので数値としてのダミー値を与える
//このケースの場合は文字数列比較を行わないのでltsの初期化は行わない
        if((list)&&(list instanceof Array)&&(list.length > 0)){
            cd = nas.CellDescription.parse([name,"-",nas.parseNumber(list[0])].join(''));
        }else{
            cd = nas.CellDescription.parse(name+'-1');
        };
    }else if(cd.body.match(/^[^0-9]+$/)){
//数値を含まないので文字数列比較のための初期化を行う
		for(var ix=0;ix<nas.incrName.ltSet.length;ix++){
			lts = nas.incrName.ltSet[ix];
			var ltRgx = new RegExp("["+lts+"]+");
			if((cd.body).match(ltRgx)) break;
		};
    };
//比較リストをチェック
    if(typeof list == 'undefined'){
        list = [];
    }else if(!(list instanceof Array)){
        list = [list];
    };
//console.log(cd)
//console.log(list)
//参照リストと引数の比較を行い同グループのリストを抽出する
    var cpList = list.filter(e => (cd.compare(e,cd.prefix) >= 1));
//console.log(cpList);
//桁数の指定がなければアプリ変数を使用
    if(typeof dig =='undefined') dig = pman.reName.renameDigits;
//引数記述にbodyが存在する場合は比較リストに加える
    if(cd.body){
        cpList.add(cd.content);
    }
    if(cd.body.match(/^[0-9]+$/)){
        var numList = Array.from(cpList,e => nas.parseNumber(nas.CellDescription.parse(e,cd.prefix).body));
    }else{
        var numList = Array.from(cpList,e => nas.parseName(nas.CellDescription.parse(e,cd.prefix).body),lts);
        numList = numList.filter(e => (e > 0));//正の整数のみを取得
    };
    numList.sort();//標準的ソート
//console.log(numList);
    var num = 0;
    if(numList.length > 0){
        if(im){
            if(numList[0] > 1){
                num = 1;
            }else{
                for(var i = 0; i < numList.length ; i ++ ){
                    if(i == (numList.length-1)){
                        num = num = numList[i]+1;
                    }else{
                        if((numList[i]+1) < numList[i+1]){num = numList[i]+1 ;break;}
                    };
                };
            };
        }else{
            num = numList[numList.length-1] + 1;
        };
    }else{
        num = 1;
    };
//console.log(num);
    var resultDescription = nas.CellDescription.parse(String(num),cd.prefix);
    resultDescription.modifier = cd.modifier;//modifierを引き継ぎ
    if((cd.body.match(/^[^0-9]+$/))&&(resultDescription.body > 0))
    resultDescription.body = nas.stringifyName(resultDescription.body,lts);
//console.log(resultDescription);
    return nas.normalizeStr(resultDescription.toString('full'),dig);
}
/*TEST
    pman.guessNextName("A-12",["A-11","A-12","12a"])  ;// "A-0013"
    pman.guessNextName("A")                           ;// "A-0001"
    pman.guessNextName("A-12")                        ;// "A-0013"
    pman.guessNextName("A",[1,3,5,7],false)           ;// "A-0008"
    pman.guessNextName("A",[1,3,5,7],true)            ;// "A-0002"
    pman.guessNextName("A-12",["A-11","A-12","12a"])  ;// "A-0013"
    pman.guessNextName("A",["A-11","A-12","13"])      ;// "A-0014"
    pman.guessNextName("A",["A-11","A-12","12a"],true);// "A-0001"
*/
/*
//以下はセル記述のソート関数としてクラスメソッドにするほうが良いかを検討
一般の文字列集合に適用するためにはのソート前に参照オブジェクトの設定が必要なので注意
オブジェクトメソッドとして実装するのは容易
        var cd = nas.CellDescription.parse(description);
        var cpList = [...arrayOfString];
        cpList.sort(function(a,b){
            return (nas.normalizeStr(nas.CellDescription.parse(b,cd.prefix).toString('full').toUpperCase(),7)).localeCompare(
                nas.normalizeStr(nas.CellDescription.parse(a,cd.prefix).toString('full').toUpperCase(),7),
                nas.locale
            );
        });
        var resultDescription = nas.CellDescription.parse(cpList[0],cd.prefix);
        return nas.normalizeStr(nas.incrStr(resultDescription.toString('full'),1),dig);
// */

/* bundle imformation file
//text format sample

nasUafBundleInfo ver1.0
// // # はコメント行
//監査記録は属性記述開始前に限定される　属性記述以降は更新されない
#job_________data____.___________________________
[LO+]A       6/24    LO演出チェック発注
[LO]         6/23    LOあがり
[LO]A        6/23    LO発注
[3DLO]       6/1     LO参考用3D-CGIデータ登録（OKが出た）
[CT]         5/26    絵コンテ撮影素材を登録
[startup]    5/23   管理開始(エントリ登録)
#___________________________________________________
##uniquekey=かちかちやま#0:Pilot[開発テストデータ]//s-c4(4+0)/s-c12(6+0)
##id=7322468c-9f18-428e-8865-7df44a4cfb82
##mLocked=true
##timestamp=1719198000000
##dataNode=localfilesystem:Nekomataya
##product=かちかちやま#0:Pilot[開発テストデータ]
##inherit=s-c4(4+0)_s-c12(6+0)
##imageCount
#group  count
	[LO]    54
	A       1
	B       12
	C       32
	[GEN+]  53
	A       1
	B       12
	C       31
##posterImages
	02_LO/LO.png
#___________________________________________________extension linestatus
//nas.Pm.NodeDescription
[0-0:(composite)//////Startup]
[0:(本線)//2:原画//1[原画]//Fixed:::::]
[1:(背景美術)////1:[背景]//Hold:::::]
[2:(3D-CGI)////1:[3D-CGI]//Active]
#___________________________________________________
##[end-status]

ブラケット記述は定義が必要

簡易的な定義ツールの提供が急がれるが　試験中は固定で　pman上で実装

簡易記述とver1.0の詳細記述は互換をもたせるか？
データ構造がけっこう異なるので
	詳細記述日付がない 状態のみしかあらわしていない
	追記に向かない
	各ラインの現状ステータスだけしかない データノード+ステータス

[0-0:(composite)//////Startup]
[0:(本線)//2:原画//1[原画]//Fixed:::%7B%22id%22%3A%22%22%7D::]
[1:(背景美術)////1:[背景]//Hold:::%7B%22id%22%3A%22%22%7D::]
[2:(3D-CGI)////1:[3D-CGI]//Active]

旧来エントリーは、マネジメントノードのサマリ

JOBはノードの一部分であり、IDから親のXMAPをたどることで
日付等の情報を取得する仕様

新エントリは、JOBのサマリであり、ステータスを含包する

[LO+]A       6/24    LO演出チェック発注


ブラケット内が ステージ+ジョブID（名称は不定）
	現状テスト用に ID固定のステージを発行
	00_CT,01_3DLO,02_LO,03_GEN,04_POC,05_DOU,06_

後置記号でステータスを表す  Standby|Awaiting|Hold|Fixed|Compleated|Rework|(aborted)
C,R以外のステータスは省略可能
ステータスが(aborted)の場合は、ブラケット内全体がステータスとして働き、ステージ・ジョブを隠す
r状態修飾子としての補助情報あり r状態が解消された時点で消える　省略可能

[LO++]Fr     6/28    R作業IN
[LO++]rA     6/27    R作業IN (小文字のrが含まれる場合はrework中)
[LO+]R       6/25    演出R()
[LO+]A       6/24    LO演出チェック発注


>> ステージ, job-id, date,note_text

日付は省略形だが、制作期間中はこれで問題ない（取り込み時に補正式は組む　出力時も省略形を使う）

申し送りのノートはステータスのアサインメントのない汎用メッセージに相当するが　管理ノートの意味合いのほうが強い
ノートテクストから機械的な意味の抽出は難しい

これは別のオブジェクトに読み分けて、別途統合するほうが良い

新規形式の部分はジョブ累積情報として積む

分岐線はステージがない ジョブはないわけには行かないので
ライン//-//ジョブ
となる

ステータスは更にパースする
状況:ユーザ:申し送り:追加プロパティ

[LO+]	5/26	演出OK
	⇓
0//02_LO//1[LO]//Fixed:(assignment):(メッセージ):(create):(update):(slipNumber)

{
	"format":"nasUafBundleInfo ver1.0",
	"status":[
		{"stage":"LO"     ,"step":1 ,"status":"await","date":"2024/6/24","slipNumber":"2388217267","stuff":"kiyo@nekomataya.info","description":"LO演出チェック発注"},
		{"stage":"LO"     ,"step":0 ,"status":"fixed","date":"2024/6/23","description":"LOあがり"},
		{"stage":"LO"     ,"step":0 ,"status":"await","date":"2024/6/23","description":"LO発注"},
		{"stage":"3DLO"   ,"step":0 ,"status":"fixed","date":"2024/6/1" ,"description":"参考用3D-CGIデータ"},
		{"stage":"CT"     ,"step":0 ,"status":"fixed","date":"2024/5/26","description":"コンテ撮影素材"},
		{"stage":"startup","step":0 ,"date":"2024/05/23","description":"管理開始(エントリ登録)"}
	],
	"uniquekey"  :"かちかちやま#0:Pilot[開発テストデータ]//s-c4(4+0)/s-c12(6+0)",
	"id"         :"7322468c-9f18-428e-8865-7df44a4cfb82",
	"mLocked"    :"true",
	"timestamp"  :"1719198000000",
	"dataNode"   :"localfilesystem:Nekomataya",
	"mNode"      :"0:(本線)//2:[LO]//1:LO+//Active:",
	"product"    :"かちかちやま#0:Pilot[開発テストデータ]",
	"inherit"    :"s-c4(4+0),s-c12(6+0)",
	"imageCount" :[
		{
			stage:"LO",
			total:"3",
			groups:[{group:"A",count:"1"},{group:"B",count:"1"},{group:"C",count:"1"}]
		},
		{
			stage:"GEN",
			total:"3",
			groups:[{group:"A",count:"1"},{group:"B",count:"1"},{group:"C",count:"1"}]
		}
	],
	"posterImages":["02_LO/LO.png"]
}

*/
/**
	@params {String}	type
	uaf
	@params {String}	description
	バンドル情報トレーラーを初期化する
	初期化記述は、バンドルの形式によって変化する

eg.	new pman.BundleInformation('uaf',"ABC#01//s-c123(3+12)/s-c230(6+0)");
タイプは現在uafのみがある
バンドルメンバーのプレビュー表示状態は サブフォーカスをエントリごとに保持
-1:サマリー 0以降:メンバーID
UI操作はバンドル選択中はサブIDの操作を行う？
 */
pman.BundleInformation = function(type,description){
	this.type = type;//uaf
	this.posterImages = "";
	this.bundleData   = null;
	this.bundleFocus  = -1;

	if(description) this.init(description);
}
/**
    @params {String} description
    
    バンドル初期化
    pman.reName.bundelInf = new pman.BundleInformation('uaf',pman.reName.baseFolder);
    初期化に際しては、データ識別子を使用する
    dataIdentifier
*/
pman.BundleInformation.prototype.init = function(description){
	if(! description) return this;
	if(! this.type) this.type = 'uaf';
	switch (this.type){
	default:
		this.bundleData = new pman.UAFBundle(description);
	};
	this.posterImages = this.bundleData.posterImages;//参照でつなぐ
}
/*TEST
    new pman.BundleInformation('uaf',"ABC#01//s-c123(3+12)/s-c230(6+0)");
*/

/*バンドルの記録データを反映*/
pman.BundleInformation.prototype.parse = function(description){
	if(! description) return this;
    if(! this.bundleData) return this;
	this.bundleData.parse(description);
}
pman.BundleInformation.prototype.toString = function(form){
	return this.bundleData.toString();
};

/**
 *	params {String |Object} description
 *
 *	text || JSON で与えられた記録データからオブジェクトをパース
		"format":"nasUafBundleInfo ver1.0",

		"auditTrail":[],
		"auditStatus":[],

		"uniquekey"  :<システム内ユニーク識別子>,
		"id"         :<uuid>,
		"mLocked"    :,
		"timestamp"  :<timestamp>,
		"dataNode"   :"string nodepath",
		"product"    :"productIdf",
		"inherit"    :"s-c123(3+0)/s-c132(6+0)(trin 1+18)",
		"imageCount" :[[],[]],
		"posterImages":[]

 */

/**
pman UAF UAFBundle
    カット番号(識別子)で初期化
new pman.UAFBundle("ABC#01//s-c123(1+12)")
    その後記録データがあれば当該データでオーバーライドする
    
    記録データに識別子と異なるエントリが登録されている場合は、エラーを発生させて必要な処置を促す
*/
pman.UAFBundle = function(identifier){
	this.format = 'nasUafBundleInfo ver1.0';
	this.title         = ""        ;//{String} タイトル・プロダクトから取得
	this.episode       = ""        ;//{String} エピソード・プロダクトから取得
	this.product       = null      ;//{Object} プロダクト無名オブジェクト
	this.inherit       = null      ;//{Object SCi} シーンカット番号コレクション
	this.uniquekey     = ""        ;//{String} プロダクトとカット番号を連結した識別情報　カット識別子
//以上は基礎データ　プロパティ登録後の変更はすべてエラー inherit 情報は識別子のみが固定で他の内容は変更可（カット尺・ステータスは変動情報）
//以下は可変データ
	this.id            = ""        ;//{String} 記録データのユニークID uuid
	this.timestamp     = ""        ;//new Date().getTime();//{Number Int} 最終更新時タイムスタンプ
	this.dataNode      = ""        ;//{String} pmdbの所在ノード
	this.mNode         = null      ;//{Object} 管理ノード ManagementNode
	this.stage         = null      ;//this.mNode.stage ;//{String} 本線ステージ参照要リンク
	this.step          = null      ;//this.mNode.id    ;//{String} 進行ジョブID参照要リンク
	this.mLocked       = false     ;//{Boolean} 本線作業管理ロック 発注済 作業時/欠番エントリは true 発注可能時は false
	this.imageCount    = []        ;//{Array} 制作管理上の工程ごと原稿枚数
	this.posterImages  = []        ;//{Array} UAF代表画像 登録制　未登録の際は進行工程に従って予約名の画像が代用される
	this.status        = new nas.Pm.NodeStatus();//{Object} 本線の進行ステータス A,C,F,H,R,S || (aborted)
	this.auditTrail    = []        ;//{Array of Object pman.UAFBundleStatusRecord} 制作管理上の進行記録
	this.auditStatus   = []        ;//{Array of String} 各ラインごとの進行ステータス
	if(identifier) this.init(identifier);//カット識別子で初期化
};
pman.UAFBundle.format = 'nasUafBundleInfo ver1.0';
/**
 *  @params {String} idf
カット識別子による初期化(init)と　記録ストリームのパース(parse) 処理メソッドが異なる
eg.  var uaf = new pman.UAFBundle("ABC#01//123(3+12)/125(4+0)/145(6+0)");
 */
pman.UAFBundle.prototype.init = function(idf){
	var inf = nas.Pm.parseIdentifier(idf);
	this.uniquekey = inf.uniquekey      ;// 正規化されたフルフォーマットのカット識別子
	this.product   = inf.product        ;// プロダクト無名オブジェクト
	this.title     = this.product.title ;// タイトル
	this.episode   = this.product.opus  ;// エピソード名
	this.inherit   = inf.inherit        ;// 兼用SCIs
	this.dataNode  = inf.dataNode       ;// PMDBデータノード serverURL+repositoryIdf
	this.mNode     = inf.mNode          ;// 本線制作管理ノード
	this.mLocked   = inf.mLocled        ;// 本線管理ロック変数
}
/*
    var BundleData0 = new pman.UAFBundle("ABC#01//s-c123(1+12)");//フルスペック
    var BundleData1 = new pman.UAFBundle("ABC_01_123_125")          ;//一般型
    var BundleData2 = new pman.UAFBundle("ABC#01__s-c123")      ;//UAF型
*/
/**
 *  @params     {String}    description
 *  記述データから詳細をパース
 *  記述データはステータスファイルのファイル名または内容記述データを与える
 *   内容記述がオブジェクトに登録されている基礎データと矛盾する(uniquekyを変更する)場合は、エラーを発生させる
    基礎データは (title episode (product) inherit ) = uniquekey
 * ステータス記述 厳正フォーマット

nasUafBundleInfo ver1.0
#job_________data________________________________
[LO+2]  2024/06/11      監督チェック
[LO+]   2024/05/24      演出OK
[LO]    2024/04/23
[startup]       2024/04/22      フォルダ作成
#___________________________________________________
##uniquekey=ABC#01__s-c024
##id=8466d844-472f-4eb9-903c-4d85bc3d4883
##timestamp=1718678986445
##product=ABC#01
##inherit=s-c024(2+6) *Aborted 6/12 
##inherit=s-c027(8+12)(OL(1+12))(OL(3+0))
##inherit=s-c024(3+18) 
#___________________________________________________
##[end-status]

ステータス記述 簡易記述

[LO+2]  06/11      監督チェック
[LO+]   05/24      演出OK
[LO]    04/23      UP
2024/04/22      フォルダ作成

ABC_01_024(3+12)*欠番
ABC_01_027(8+12)(26- OL(1+12))(-28 OL(3+0))



ステータス記述拡張

簡易記述

フォーマット宣言は省略可能（ファイル名が"__["で始まる場合を想定）
ABC_01_024(3+12)*欠番
ABC_01_027(8+12)(26- OL(1+12))(-28 OL(3+0))
#行頭がブラケット、日付記述でない行はidfとして扱う
//	*(アスタリスク)の後方から改行まではidfに対するスタータス記述を含むコメント
// 尺変更 分割・統合 欠 番・復活 等の内容変更を記述するために、日付とサインを含む

	内容 日付 署名をスペース区切りで1行で書き込み
	または、空白文字で開始される行は、直前の記述内容に対する情報となる

[LO+2]
	06/11	監督チェック

ABC_01_024(3+12)*
	欠番 6/12 kiyo@nekomataya.info

	[ブラケット]記述は、ステータス遷移を記録する
	レコード間の空行は無視されるのであってもなくても良い
	標準的な出力では適宜挿入する

	フィールド間の空白文字はひとつ以上必ず必要
	主記述行内での各フィールド内の空白は基本的に許容されない

//  コメント行
rem コメント行
#   コメント行

ブラケットに後続する記述はステータス記述
ステータスは、日本語記述も解釈する
書き出しは、基本的に英略号
A,C,F,H,R,S || (aborted)
✓,◯,●,待,戻,未 || (欠番)
アプリケーション設定で下段の略号を使用することが可能

[LO+3]●   

auditTrail(平記述)にカット単位の変更を記述可能にする

idfで開始して 日付を伴う記述行は、カット単位のステータスを変更可能
sci-idfが一致しない場合は、行全体を無視(カットの追加にならない)とする
再記録時には削除される

ABC_01_123  10/11 欠番

ABC_01_123
	10/11	欠番

これで、平文記述が可能

平文記述では、日付なしの単体IDF記述を認める
ABC#01__s-c024_123
ABC#02__s-c012
//--------------------------
ABC_01_123  10/11 欠番
[LO+2]  2024/06/11      監督チェック
[LO+]   2024/05/24      演出OK
[LO]    2024/04/23
[startup]       2024/04/22      フォルダ作成


２つ以上の連続する "-(ハイフンマイナス)""=(イコール)"のみで成る行は、データブロックのセパレータとして認識する

ステータスのプラス記述は、ステージのジョブステップカウントを示す
ステップは通常では
0   ステージの初期化(管理者のみが使用)
1   プライマリジョブ(受注スタッフによる)
2...   2以降はチェックジョブ　演出　監督　作監　総作監と進むことが期待されるが、その限りではない

各ステップには以下の状態がある 状態は作業状態を表すと同時に工程全体の状態でもある
ヘッドステータスと考えて良い
S(startup)  未着手・未発注（受注）状態　作業が存在するがまだ開始されていない状態
    A(active)   作業中　作業が開始された状態　制作管理的には「IN」
    H(hold)     作業中に何らかの理由で状態が固定しているもの A の特殊な状態　原因を解消する必要がある
    F(finished) 作業が終了している状態 次のステップに進むことができる
    R(rework)   何らかの理由で作業を再度行う必要がある状態　チェックの結果やり直し等が発生している状態＝リテイク
C(compreated) 作業中の工程が全終了している状態　このサインは、通常は制作管理者が行う
 */
pman.UAFBundle.prototype.parse = function(description){
console.log(description);
	if (typeof description == 'undefined') return this;
//String
//JSON - string
	if((typeof description == 'string')&&(String(description).trim().match(/^\{.*\}$/))){
		var description = JSON.parse(description);
	};
	if(
	    (typeof description == 'object')&&
	    ((description.format)&&(description.format == this.format))&&
	    ((description.uniquekey)&&(description.uniquekey == this.uniquekey))
	){
//JSON
		this.id           = description.id                            ;//String
//		this.status       = Array.from(description.status,function(e){return pman.UAFBundle.parseStatus(e)});//Object
		this.status       = this.status.parse(description.status)     ;//Object
		this.mLocked      = (description.mLocked)? true:false         ;//Boolean
		this.timestamp    = parseInt(description.timestamp)           ;//Number Int 読み出し時は記録されたタイムスタンプを採用
		this.dataNode     = nas.Pm.parseDataNode(description.dataNode);//String DataNode
		this.inherit      = nas.Pm.parseSCi(description.inherit)      ;//Array of SCi
		this.imageCount   = Array.from(description.imageCount)        ;//Object Int
		this.posterImages = Array.from(description.posterImages)      ;//Array of String(path)
		this.auditTrail   = Array.from(description.auditTrail,function(e){
			return new pman.UAFBundleStatusRecord(e);}
		);//{Array of Object pman.UAFBundleStatusRecord}
		this.auditStatus  = Array.from(description.auditStatus,function(e){
			return new nas.Pm.NodeStatus(e);}
		);//{Array of Object pman.UAFBundleStatusRecord}

	}else if((typeof description == 'string')&&(true)){
//String textfile
		var SrcData = description.split('\n');
		SrcData.ristrect    = false;//厳正モード(202406時点では使用されないすべてフランクモード)
		SrcData.startLine   = null;//データ開始行
//        var
/*
	第一パス
	データ冒頭の空白行を無視して、データ開始行を取得
	識別行の確認
	^nasUafBundleInfo\ ver1\.0$
*/
		for (var l = 0; l < SrcData.length ; l++){
			if(SrcData[l].match(/^\s*$/)){
				continue;
			}else{
				SrcData.startLine = l;//データ開始行
				if(String(SrcData[l]).indexOf(this.format) == 0){
					SrcData.startLine ++;
					SrcData.ristrect = true;
				}else{
//識別行以外がヒット プレーンテキストと判断してブレーク
					SrcData.ristrect = false;
				};
				break;
			};
		};
//データ開始行が無かった場合その時点で終了
		if(SrcData.startLine == null) return this;
//第一パス終了
//第二パス 終了サインまたはデータ終端までソースをスキャンしてデータを取得
		var currentProp  = 'auditTrail';
		var currentValue = "";
		var countStage   = "";
		for (var l = SrcData.startLine ; l < SrcData.length; l ++){
			currentValue = String(SrcData[l]).trim();
			if(currentValue.match(/(^\#[^#]*$|^\/\/)/)) continue;
			if(SrcData[l].match(/^##([^\=]+)\=(.+)$/)){
				currentProp  = RegExp.$1.trim();
				currentValue = RegExp.$2.trim();
				switch(currentProp){
				case "mLocked":
					this[currentProp] = (currentValue)? true:false;
				break;
				case "timestamp":
					this[currentProp] = parseInt(currentValue);
				break;
				case "posterImages":
				case "imageCount":
					currentValue = "";//エントリリセット
					continue;
				break;
				case "inherit":
					this[currentProp] = nas.Pm.parseSCi(currentValue);
				break;
				case "status":
					this.status.parse(currentValue);
				break;
				case "product":
					this[currentProp] = nas.Pm.parseProduct(currentValue);
					this.title    = this.product.title;
					this.epsisode = this.product.opus;
				break;
				default:
					this[currentProp] = currentValue;
				};
			}else if(SrcData[l].match(/^##([^\=]+)$/)){
				if((RegExp.$1 == "[end-status]")||(RegExp.$1 == "[END]")) break;
				currentProp = RegExp.$1.trim();
			}else{
				if(
					(currentProp == 'auditTrail')&&(
						(currentValue.indexOf("[")==0)||
						(currentValue.match(/^\d{1,4}[\/\s]\d{1,2}\/\d{1,2}\s|^\d{1,2}\/\d{1,2}\s/))
					)
				){
					this[currentProp].push( new pman.UAFBundleStatusRecord(currentValue));
				}else if(currentValue.match(/^\[(.+)]$/)){
//生のノード記述(旧フォーマット= 全ブラケット記述) 一旦記載をパースする これらの記述は最終状態現状を保持するポスター値にとどまる
//currentValue.replace(/^\[|\]$/g,'')
					this.auditStatus.push( nas.Pm.parseNodeDescription(RegExp.$1));
//					this.auditStatus.push( decodeURI(currentValue));
				}else if(currentProp == 'posterImages'){
					this[currentProp].push(currentValue);
				}else if(currentProp == 'imageCount'){
					var vArray = String(currentValue).trim().replace(/\s+/g,' ').split(' ');
					if(vArray[0].match(/^\[([^\]]+)\]$/)){
						countStage = RegExp.$1;
						this.imageCount.push({stage:countStage,total:vArray[1],groups:[]});
					}else if(vArray.length = 2){
						this.imageCount[this.imageCount.length - 1].groups.push({group:vArray[0],count:vArray[1]});
					};
				};
			};
		};//2nd path
		if(this.auditTrail.length > 0){
			this.auditTrail.sort(function(tgt,dst){

				if (tgt.date == dst.date){
					if(tgt.stage == ""){
						return -1;
					}else if(dst.stage == ""){
						return 1;
					}else{
						return (tgt.stage.charCodeAt(0)-dst.stage.charCodeAt(0))
					};
				};
				return (tgt.date - dst.date);
			});
			var currentTrail = this.auditTrail[this.auditTrail.length-1];
console.log(typeof currentTrail.status);
console.log(this);
//			this.status = currentTrail.status;//
			this.status.parse(currentTrail.status);//
            if(!(this.mNode instanceof nas.Pm.ManagementJob)) this.mNode = new nas.Pm.ManagementJob(
                nas.localize(
                    "[%1]%2",
                    nas.plEncode(currentTrail.stage,currentTrail.step),
                    currentTrail.status.toString()
                )
            );
            this.mNode.parse(currentTrail.toString());
//			this.mNode.jobStatus.content = currentTrail.status;
			this.mNode.jobStatus.parse(currentTrail.status);
			this.mNode.updateDate.setTime(currentTrail.date.getTime());
			this.mNode.id      = currentTrail.step;
			this.mNode.name    = nas.plEncode(currentTrail.stage,currentTrail.step);
			this.mNode.stage   = currentTrail.stage;
			this.mNode.updateUser.parse(currentTrail.staff);
		};
	};//string data

    this.setStatusSign();
/*内容から*/
	return this;
}
/*TEST
 var uaf = new pman.UAFBundle('ABC#01[TEST]//s-c123(3+12)');
uaf.parse(`

nasUafBundleInfo ver1.0
// // # はコメント行
//監査記録は属性記述開始前に限定される　属性記述以降は更新されない
#job_________data____.___________________________
[LO+]A       5/24    LO演出チェック発注
[LO]         5/23    LOあがり
[LO]A        5/23    LO発注
[3DLO]       5/1     LO参考用3D-CGIデータ登録（OKが出た）
[CT]         4/26    絵コンテ撮影素材を登録
[startup]    3/23   管理開始(エントリ登録)
#___________________________________________________
##uniquekey=かちかちやま#0:Pilot[開発テストデータ]//s-c4(4+0)/s-c12(6+0)
##id=7322468c-9f18-428e-8865-7df44a4cfb82
##mLocked=true
##timestamp=1719198000000
##dataNode=localfilesystem:Nekomataya
##product=かちかちやま#0:Pilot[開発テストデータ]
##inherit=s-c4(4+0)_s-c12(6+0)
##imageCount
#group  count
	[LO]    54
	A       1
	B       12
	C       32
	[GEN+]  53
	A       1
	B       12
	C       31
##posterImages
	02_LO/LO.png
#___________________________________________________extension linestatus
//nas.Pm.NodeDescription
[0-0:(composite)//////Startup]
[0:(本線)//2:原画//1[原画]//Fixed:::::]
[1:(背景美術)////1:[背景]//Hold:::::]
[2:(3D-CGI)////1:[3D-CGI]//Active]
#___________________________________________________
##storyBoard
#___________________________________________________
たぬき「ぽんぽこりん」
    狸が腹鼓をうちながら登場
    
##[end-status]

ブラケット記述は定義が必要

簡易的な定義ツールの提供が急がれるが　試験中は固定で　pman上で実装
`);
//フランクモードの欠番
[欠番]    2-24/06/12
的な記述は例外記述で ブラケット内の記述がステージではなく　ステータス情報へ転機されるものとする
 */
pman.UAFBundle.prototype.toString = function(){
	var result = [this.format];
	result.push("#job_________data________________________________");
	if(this.auditTrail.length) for(var i = this.auditTrail.length - 1 ; i >= 0 ; i--){
		result.push(this.auditTrail[i].toString());//逆順ソートで出す
	};
	result.push("#___________________________________________________");
	(["uniquekey","id","mLocked","timestamp","dataNode","product","inherit"]).forEach( function (e){
		if(e == 'product'){
			result.push("##"+e+"="+this[e].title+"#"+this[e].opus+((this[e].subtitle)?"["+this[e].subtitle+"]":""));
		}else if(e == 'dataNode'){
			if(this[e].server){
				result.push("##"+e+"=."+[this[e].server,this[e].repository].join('.'));
			};
		}else if(e == 'timestamp'){
			result.push("##"+e+"="+new Date().getTime());
		}else if((this[e])&&(this[e].toString)){
			result.push("##"+e+"="+this[e].toString());
		}else if((this[e])&&(this[e].dump)){
			result.push("##"+e+"="+this[e].dump());
		}else if(this[e]){
			result.push("##"+e+"="+String(this[e]));
		};
	},this);
	if(this.imageCount.length){
		result.push("#group  count");
		for(var c = 0 ; c < this.imageCount.length ; c++){
			result.push("\t["+this.imageCount[c].stage+"]\t"+this.imageCount[c].total);
			for(var g = 0 ; g < this.imageCount[c].groups.length ; g++){
				result.push("\t"+this.imageCount[c].groups[g].group+"\t"+this.imageCount[c].groups[g].count);
			};
		};
	};
	if(this.posterImages.length){
		result.push("##posterImages");
		for(var c = 0 ; c < this.posterImages.length ; c++){
			result.push("\t"+this.posterImages[c]);
		};
	};
	if(this.auditStatus.length){
		result.push("#__________________________________extension linestatus");
		for(var i = 0; i < this.auditStatus.length ; i++){
			result.push(this.auditStatus[i]);//今のところ正順
		};
	};
	result.push("#___________________________________________________");
	result.push("##[end-status]");
	return result.join('\n');
}

pman.UAFBundle.prototype.toJSON = function(){
	return this;
}
/* 現在のステータス状況から簡略表示文字列を得る

    __[(STG)(+STEP)](STATUS).status.txt


*/
pman.UAFBundle.prototype.getStatusSign = function(){
//    var result = (this.status == '(aborted)')?
    var result = (this.status.content == 'Aborted')?
        "[(aborted)]":"[" + nas.plEncode(this.stage,this.step) + "]" + this.status.toString();
    return result;
}
/*ステータスパラメータを設定する initBundleの最後でもこれを呼ぶ*/
pman.UAFBundle.prototype.setStatusSign = function(statusSign){
    if((!(statusSign))&&(this.auditTrail.length)){
//指定のない場合記録の最終ステータスを取得
        statusSign = this.auditTrail[this.auditTrail.length - 1];
    }else{
console.log(statusSign);
        statusSign = pman.UAFBundle.parseStatus(statusSign);
        if(this.auditTrail.length == 0) this.auditTrail.push(satusSign);
    };
    if(statusSign){
        this.mNode.stage   = statusSign.stage;
        this.mNode.id      = statusSign.step;
        this.mNode.name    = nas.plEncode(this.mNode.stage,this.mNode.id);
//        this.mNode.jobStatus.content = statusSign.status;//パーサ？
        this.mNode.jobStatus.parse(statusSign.status);//パーサ？
        this.stage  = this.mNode.stage ;
        this.step   = this.mNode.id    ;
//        this.status = this.mNode.jobStatus.content;
        this.status.parse(this.mNode.jobStatus);
//ショット情報更新
//        this.inherit.forEach(c => if(c.status != 'Aborted') c.status = statusSign)
    };
    return this;
}
/*
 * UAFオブジェクトが自身のプロパティを指定されたリストにしたがって配列で返す
 * 集計処理のためのオブジェクトメソッド
 * getDataArray("cut");
 * 引数は プロパティ指定を記述したコンマ区切り文字列　またはプロパティ指定の配列（等価）
 *  入れ子のプロパティも指定可能
 例
    getDataArray("stage")
    getDataArray("mNode.status")
    getDataArray("uniqekey,stage,auditTrail")

 */
pman.UAFBundle.prototype.getDataArray = function getDataArray(props){
	var result = [];
    if((typeof props == 'string')&&(props.indexOf(',') >= 0)){
        props = props.split(',');
    }else if(!(props instanceof Array)){
        props = [props];
    };

	props.forEach(function(prop){
		if(this[prop]){
			if(this[prop].getDataArray){
				result.push(this[prop].getDataArray());
			}else if(this[prop].dump){
				result.push(this[prop].this[prop].dump('array'));
			}else{
				result.push(this[prop].toString());
			};
		};
	},this);
	return result;
}
/*TEST

*/
/**

new pman.UAFBundleStatusRecord("[LO++]A 6/12 演出チェック ねこまたや 伝票番号:12245673")

冒頭記述は省略形で [(工程名)(ステップ)](状況)

フル記述の例は 
"0:(本線)//2:LO//2[LO]//Active//Nekomataya:kiyo@nekomataya.info//slip_number:12245673",
____＿＿_____^^__^______^_______^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

工程名は、自由文字列 連続データでの統一は必要
"LO","Layout" いずれでもよい 日本語表記は避けることを強く推奨
ステップは整数で、各ステージの現場ジョブのステップ数(=id)をもつ

記録テキスト上はJOB-IDをプラスルール表記で記述してブラケットで囲む
LOステージの第２ステップは "[LO++]" または "[LO+2]"となる

状況は、以下のいずれかの値をとる制作管理上の監査状態
記録テキスト上は略号で記述　大文字小文字は問わない
状況記述は省略可能で、省略された場合の値は (ステップ==0)? "Startup":"Fixed";
それ以外の値の場合は記述を省略しない

Startup    |stanby           : S : 待機（発注可能・未発注）
Hold       |holding          : H : 保留（何らかの理由で発注先で作業停止しているもの）
Active     |awaiting         : A : 作業（発注済作業中あがり待ち）
Fixed      |fixed            : F : 終了(*default)（作業が終了状態・発注可能）
Compleated |completed        : C : 完了（ステージ完了フラグ付き作業終了）
Rework     |rework           : R : 差戻（リワークフラグ付き作業終了）
差戻作業（リワーク）中のエントリには rを付加してR中であることを示すことができる
	Ar,Fr...等
	
記録レコードに伝票番号を付加する際は接頭詞(プレフィックス) "slipNumber:"または"slip:" のついた値をフィールドに加える
記録レコードに担当(staff)を付加する際は接頭詞(プレフィックス) "staff:"または"to:","from:" のついた値をフィールドに加える

レコード区切りは改行、フィールド区切りは空白（連続した空白はひとつに数える）
記録データは以下のようになる
基本的に書き込みはスタック形式で最新情報を一番上の行に加えること
第一フィールド(ジョブコード+ステータス)と第二フィールド(日時)以外は順不同でよい

日時は、４桁年を省略した場合入力の年が補われる 時刻を省略した場合は操作の際の時刻が補われる

[LO+]A     6/21
[LO]       6/20  to:あいうえお slip:6799-12A-2346 注釈テキスト
[3DLO]     04/21 from:スタジオCDE
[CT]       2024/03/15 15:23:54 slip:178-456 to:演出 
[startup]      03/12

以下は特例記述でステージ・ジョブ無しでステータスのみを設定する　書き出し事も同様
[欠番]       1/12
[(aborted)] 2/29
[abort]     3/31

以下の記述の場合はステージ情報を含む
[LO+](aborted)     4/15  編集時に欠番

以下の特殊エントリはステージ・ジョブ・ステータスを持たずエントリ登録のみを記録する特殊エントリ

2024/04/01  ABC#01//s-c123/s-c125

これらの情報は、nas.Pm.managementJobと相互に変換が可能
 */
pman.UAFBundleStatusRecord = function(description){
	this.stage       = "";//{String}
	this.step        = 0 ;//{Number Int}
//	this.status      = "";//{String}
	this.status      = new nas.Pm.NodeStatus();//{Object}
	this.date        = new Date();//{Date}
	this.slip_number = "";//{String}
	this.staff       = "";//{String}
	this.note        = "";//{String}
	if(description) this.parse(description);
}
//記述パーサ フルフォーマットDate記述を解釈するように変更
pman.UAFBundleStatusRecord.prototype.parse = function(description){
	var fields = String(description).trim().replace(/\s+/g," ").split(" ");
//連結してフルサイズ記述になる時間表現を検索する
	var time_field = fields.find(e => e.match(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/));
	if(time_field){
		var ix = fields.indexOf(time_field);
		if(Date.parse(fields.slice(ix-1,ix+1).join(" "))){
			fields.splice(ix,1);
			fields[ix-1] += " " + time_field;
		};
	}; 
	var notes = [];
	fields.forEach(function(e){
		if(e.match(/^\[([^\]]+)\](.*)$/)){
			let stat = RegExp.$2;
			let stageParam = nas.plParse(RegExp.$1);
			if(nas.Pm.NodeStatus.symbolize(stageParam.name) == "(aborted)"){
				this.stage = "";
				this.step  = 0;
				stat = "(aborted)";
			}else{
				this.stage = stageParam.name;
				this.step  = stageParam.count;
			};
//			this.status = String(stat);
			this.status.parse(String(stat));
		}else if(Date.parse(e)){
			this.date.setNASString(e);//簡易日付を補完して設定
		}else if(e.match( /(slip|slipNumber|from|to|staff|user)\:/i )){
			switch (RegExp.$1){
			case "slip":
			case "slipNumber":
				this.slip_number = e.slice(RegExp.$1.length + 1);
			break; 
			case "from":
			case "to":
			case "staff":
			case "user":
			default:
				this.stuff = e;
			};
		}else{
			notes.push(e);
		};
	},this);
	if(notes.length) this.note = notes.join("");
	if(this.stage == "") this.stage = 'startup';
	return this;
}
pman.UAFBundleStatusRecord.prototype.convertmNode = function(){
    var result = new nas.Pm.ManagementJob();
    result.id      =this.step;
    result.name    =nas.plEncode(this.stage,this.step);
    result.stage   =this.stage;
    result.updateDate.setNASString(this.date.toNASString());
    result.updateUser.parse(this.staff);
    result.jobStatus.parse(this.status);
    return result;
}
pman.UAFBundleStatusRecord.prototype.toString = function(){
//リザルトをスペースで埋めて整形する文字幅はプロポーショナルではないため推定を含む
//統合ポイントが基数の正倍になるように調整を行う
	var result = "";var baseCount = 8;
	if(this.stage!=""){
		result += ('['+nas.plEncode(this.stage,this.step)+']'+this.status.toString());
		result += (' ').repeat(((Math.floor(result.length / baseCount) + 1 ) * baseCount) - result.length);
	};
//	result += (this.date.toNASString())           ;//時間情報含む
	result += (this.date.toNASString("yy/mm/dd")) ;//日付まで
	if(this.stuff){
		result += (' ').repeat(((Math.floor(result.length / baseCount) + 1 ) * baseCount) - result.length);
		result += this.stuff;
	};
	if(this.slip_number){
		result += (' ').repeat(((Math.floor(result.length / baseCount) + 1 ) * baseCount) - result.length);
		result += ('slipNumber:'+this.slip_number);
	};
	if(this.note){
		result += (' ').repeat(((Math.floor(result.length / baseCount) + 1 ) * baseCount) - result.length);
		result += (this.note);
	};
	return result;
}
/*TEST
new pman.UAFBundleStatusRecord("[LO+]Ar       6/2  to:あいうえお slip:6799-12A-2346 注釈テキスト")+" ";
*/
/*
    簡易記述(ステータスファイル名)をパースして返す
    初出の"."の前方だけをパースするので、引数が複数の拡張子を含んでいても良い

*/
pman.UAFBundle.parseStatus = function(statusIdf){
    return new pman.UAFBundleStatusRecord(statusIdf.replace(/^[^\[]*/,"").split('.')[0]);

}

