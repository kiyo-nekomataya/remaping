/**
 * @fileOverview
 *  <pre>Remaping本体スクリプト
 *     XPSオブジェクトとMAPオブジェクトについては、
 *     以下のドキュメントを参照のこと
 *     http://www.nekomataya.info/remaping/teck.html
 *     $Id: remaping.js,v 1.66 2014/11/29 kiyo Exp $
 * CEP動作のための修正開始 </pre>
 */
// http://d.hatena.ne.jp/amachang/20071010/1192012056 //
/*@cc_on _d=document;eval('var document=_d')@*/
'use strict';
/*================================================================================================ 
 *  アプリケーションスタートアップ
 */
//コード読込のタイミングで行う初期化 グルーバル変数設定

//ユーザ設定を予備加工
    var MaxFrames=nas.FCT2Frm(config.Sheet);//タイムシート尺

    var MaxLayers=[
        config.DialogColumns,
        config.SoundColumns,
        config.SheetLayers,
        config.CameraworkColumns,
        config.StageworkColumns,
        config.SfxColumns
    ];//タイムシートのスタートアップ構成(セル重ね)

    var startupDocument   = ''           ;//初期ドキュメント XPSまたはXMAP
    var referenceDocument = ''           ;//初期参照ドキュメントXpst

/** Startup手続き
 *    nas_Rmp_Startup
 *  プログラム及び全リソースをロード後に１回だけ実行される手続
 *  引数なし
 *
 *    nas_Rmp_Init
 *  データドキュメントロード時に毎回実行される手続  UI初期化を含む
 *  画面書き換え用のメソッドxUI.resetSheet を内部で呼び出す
 *
 *    nas_Rmp_reStart
 *  ページリロード等の際に実行される手続
 */
function nas_Rmp_Startup(){
console.log('application xpsedit init : nas_Rmp_Startup !!');
//クッキーよりも優先でpmdb含むServiceの初期化を行う localRepositoryを含むリポジトリCollectionも初期化
    localRepository.init();
    serviceAgent.init();
//モーダルパネルの背景色を設定
//JQuery-UIのcssを上書き(cssのurlをローカルにする必要あり)
//    nas.HTML.setCssRule('.ui-widget-content','background:#efefef;',[3]);
        Array.from(document.getElementsByClassName('optionPanelModal')).forEach(function(e){e.style.backgroundColor='#efefef'});
//モバイルデバイスを検知してUIを設定
    if(appHost.touchDevice){
//上部のシステム領域を下へ
        document.getElementById('fixedHeader').style.bottom = '0px';
//ドロップダウンメニューを上へ展開する
        nas.HTML.deleteCssRule('#pMenu li ul',0);
        nas.HTML.addCssRule('#pMenu li ul' ,'display: none;position: absolute;bottom: 24px;left: -1px;padding: 5px;width: 150px;background: #eee;border: solid 1px #ccc;',0)
//メニューの間隔を開く
        nas.HTML.setCssRule('#pMenu li','height:24px;',0);
//被せロゴの位置調整
        document.getElementById('underlay').className = 'underlay-mobile';
    };
//バージョンナンバーセット
    sync("about_");
//クッキー指定があれば読み込む
    if(config.useCookie[0]) ldCk();//ldCk内部でibCPにアクセスしている
console.log(config.SheetLooks);

//ドキュメントフォーマットマネージャー初期化
    documentFormat.init();
//WEB-UI解像度の設定
    nas.RESOLUTION.setValue('96ppi');
//ライブラリフレームレートの設定
    nas.FRATE=nas.newFramerate(config.SheetLooks.FrameRate);
//背景カラーを置換 入れ替えで不要に
//    SheetLooks.SheetBaseColor=SheetBaseColor;
console.log('startup')
console.log(config.SheetLooks);
console.log(documentFormat);
/**
 *      xUI.XPSを実際のXpsオブジェクトとして再初期化する
 */
/*
    xUI.XPS=new Xps([
        config.DialogColumns,
        config.SoundColumns,
        config.SheetLayers,
        config.CameraworkColumns,
        config.StageworkColumns,
        config.SfxColumns
    ],config.MaxFrames,config.myFrameRate);
*/
/*
    Mapオブジェクトの改装を始めるので、いったん動作安定のため切り離しを行う
    デバッグモードでのみ接続
if(config.dbg)    XPS.getMap(MAP);
*/
/*============*     初期化時のデータ取得    *============*/
/*
 *  最優先・レンダリング時にドキュメント内にスタートアップデータが埋め込まれている
 *  読み取ったスタートアップデータを判別して
 */
//    ドキュメント内にスタートアップデータがあれば読み出し  startupContent >startupDocument

if(document.getElementById( "startupContent" )){
        startupDocument=$("#startupContent").text();
        var dataStart= startupDocument.indexOf("nasTIME-SHEET");
        if(dataStart<0){
             startupDocument="";
        }else if(dataStart>0){
             startupDocument= startupDocument.slice(dataStart);
        }
        if( startupDocument.indexOf("&amp;")>=0) startupDocument= startupDocument.replace(/&amp;/g,"&");
        if( startupDocument.indexOf("&lt;")>=0) startupDocument= startupDocument.replace(/&lt;/g,"<");
        if( startupDocument.indexOf("&gt;")>=0) startupDocument= startupDocument.replace(/&gt;/g,">");
}
//    同ドキュメント内にスタートアップ用参照データがあれば読み出し startupReference > referenceDocument
if(
    document.getElementById( "startupReference" ) &&
    document.getElementById( "startupReference" ).innerHTML.length
){
    referenceDocument=$("#startupReference").text();
    if(referenceDocument.indexOf("&amp;")>=0){
        referenceDocument=referenceDocument.replace(/&amp;/g,"&");
    };
    if(referenceDocument.indexOf("&lt;")>=0){
        referenceDocument=referenceDocument.replace(/&lt;/g,"<");
    };
    if(referenceDocument.indexOf("&gt;")>=0){
        referenceDocument=referenceDocument.replace(/&gt;/g,">");
    };
}else{
    referenceDocument='';

}
//    起動時に AIR|Node環境で引数があれば引数を解釈実行する。
//    同様のルーチンで  invorkイベントがあれば引数を解釈して実行するルーチンが必要
//    実態はair_UI.jsxに
//    UI再生成 (docio内で予めグローバル設定されているものはダミーオブジェクト)
    xUI=new_xUI();

//アプリケーションxpseditとして初期化
console.log('init I');

    xUI.XPS        = new Xps();
    xUI.XPS.readIN = xUI._readIN_xps;

if((! startupDocument)&&(fileBox)&&(fileBox.contentText.length)){ startupDocument=fileBox.contentText;}
if( startupDocument.length > 0){
console.log(startupDocument);
console.log(xUI.XPS);
console.log(xUI.XPS.parseXps(startupDocument));
    NameCheck=false;
}
//リファレンスシートデータがあればオブジェクト化して引数を作成
        var referenceX=new Xps(5,nas.SheetLength+':00.');
    if((referenceDocument)&&(referenceDocument.length)) referenceX.readIN(referenceDocument);
    xUI.init(
        xUI.XPS,
        referenceX,
        'xpsedit',
        function(){
//初期化終了後に起動される手続き群
//システムの変更によりメニューアイテムの初期化がすべてxUI配下に入る
//メニュー初期化終了後でないと呼び出せないものをここへ配置

//クッキー指定があれば読み込む
//            if(config.useCookie[0]) ldCk(); 
//ライブラリフレームレートの設定
//            nas.FRATE=nas.newFramerate(config.myFrameRate);
//カメラワークDB初期化
            $.ajax({
                url: "nas/lib/etc/nas.cameraworkDescriptionDB.JSON",
                dataType: 'text',
                success: function(result){
                nas.cameraworkDescriptions.parseConfig(result);
                },
            });


//背景カラーを置換
            config.SheetLooks.SheetBaseColor = config.SheetBaseColor;
/**
    シートのカラーデータを構築
*/
            xUI.applySheetlooks();//タイムシートルック初期化
            xUI.resetSheet();
//シートロゴをアップデート
/*
    応急処置
    ロケーションを確認して  開発／試験サーバ  であった場合はヘッダロゴ画像を差し替える
*/
            var headerLogo            = config.headerLogo;
            var headerLogo_url        = config.headerLogo_url;
            var headerLogo_urlComment = config.headerLogo_urlComment;

            if(location.hostname.indexOf("scivone-dev")>=0){
                headerLogo="<img src='/images/logo/UATimesheet_dev.png' alt='Nekomataya' width=141 height=24 border=0 />"
            };
            if(location.hostname.indexOf("remaping-stg")>=0){
                headerLogo="<img src='/images/logo/UATimesheet_staging.png' alt='Nekomataya' width=141 height=24 border=0 />"
            };
            document.getElementById("headerLogo").innerHTML=
                "<a href='"+ headerLogo_url +
                "' title='"+ headerLogo_urlComment +
                "' target='_new'>"+ headerLogo +"</a>";
//サービスCGIのアドレスを調整
            if(String(location).indexOf('https')==0) {ServiceUrl=HttpsServiceUrl};


    });//------------ xUI.init//

//アプリケーションUI同期テーブルアイテム追加
    xUI.syncTableMergeItems(syncTable_remaping);
//バージョンナンバーセット
    xUI.sync("about_");


/*  暫定コード
    XPS内のxMapをXPSの制作管理情報とシンクロさせる
*/
if(! xUI.XPS.xMap.currentJob) xUI.XPS.xMap.syncProperties(xUI.XPS);
/**
    シートのカラーデータを構築
*/
console.log('global')
console.log(config.SheetLooks);
    xUI.applySheetlooks(config.SheetLooks);//タイムシートルック初期化
    xUI.resetSheet();
    nas_Rmp_Init();
/* ================================css設定
//================================================================================================================================ シートカラーcss設定2
//    シート境界色設定
    $('table').css('border-color',SheetBaseColor);
    $('th').css('border-color',xUI.sheetborderColor);
    $('td').css('border-color',xUI.sheetborderColor);
//    識別用ラベル背景色設定
//    nas.addCssRule("th.stilllabel" ,"background-color:"+xUI.stillColor ,"screen");
//    nas.addCssRule("th.sfxlabel"   ,"background-color:"+xUI.sfxColor   ,"screen");
//    nas.addCssRule("th.cameralabel","background-color:"+xUI.cameraColor,"screen");
    $("th.stilllabel").css("background-color",xUI.stillColor);// ,"screen");
    $("th.sfxlabel").css("background-color",xUI.sfxColor);//   ,"screen");
    $("th.cameralabel").css("background-color",xUI.cameraColor);//,"screen");

//================================================================================================================================ シートカラーcss設定2
*/
// startupDocumentがない場合でフラグがあればシートに書き込むユーザ名を問い合わせる
/*
    この時点のユーザ問い合わせ手順に問題あり
    問い合わせが必要か否かの条件を調整  かつ  問い合わせ時に記録からユーザの情報を取得して選択肢として提示するUIが必要
    ユーザ設定フラグを判定してUIを提示する
    html5のオートコンプリートを利用するのでinput初期値はカラに
    UIを提示しない場合は、デフォルトの値またはクッキーで記録した最後のユーザが設定される
*/
if(! xUI.onSite){
if((config.NameCheck)||(config.myName=="")){
        var newName=null;
        var msg=config.welcomeMsg+"\n"+localize(nas.uiMsg.dmAskUserinfo)+
        "\n\n ハンドル:メールアドレス / handle:email@example.com \n";
        if(xUI.currentUser) msg += "\n current user / " + [xUI.currentUser.handle,xUI.currentUser.email].join(":");
        msg=[msg];
        msg.push("<hr><input id='confirmUID' type='text' autocomplete='on' list='recentUsers' size=48 value=''>");//初期値カラ
        nas.HTML.showModalDialog("confirm",msg,localize(nas.uiMsg.userInfo),'',function(){
            if(this.status==0){
                var newName = new nas.UserInfo(document.getElementById('confirmUID').value);
                if(newName.handle){
                    xUI.currentUser = new nas.UserInfo(newName);
                }
                xUI.XPS.update_user      = xUI.currentUser;
                xUI.XPS.xMap.update_user = xUI.currentUser;
                xUI.recentUsers.addMember(xUI.currentUser);
                xUI.sync("recentUsers");
                xUI.sync("update_user");
                xUI.sync("current_user");
            }
        },false);
    document.getElementById("nas_modalInput").focus();
    }};
//    クッキーで設定されたspinValueがあれば反映
    if(xUI.spinValue){document.getElementById("spin_V").value=xUI.spinValue} ;
//  クッキーで設定された差分表示をコントロールに反映
    xUI.footstampReset();
//ツールバー表示指定があれば表示 プロパティ廃止
//    if((xUI.utilBar)&&(!$("#optionPanelUtl").is(':visible'))){$("#optionPanelUtl").show();};//xUI.sWitchPanel('Utl');


/*
	UATimesheet(remaping)ドキュメント全体のドラグドロップ処理コード
*/

    document.body.addEventListener('dragover', function(e) {
        e.stopPropagation();e.preventDefault();
console.log(e);
//ドラグオーバーされたファイルの種類でカラーを変更する
        this.style.background = xUI.selectedColor;//
    }, false);
    document.body.addEventListener('dragleave', function(e) {
        e.stopPropagation();e.preventDefault();
        this.style.background = xUI.sheetbaseColor;//
    }, false);
    document.body.addEventListener('drop', async function(e) {
        e.stopPropagation();e.preventDefault();
        this.style.background = xUI.sheetbaseColor;//
console.log('droped');
console.log(e.composedPath());

//        const itmid = pman.reName.parseId(e.dataTransfer.getData('text/plain'));
        const files = e.dataTransfer.files; //ドロップされたファイルを取得
        const items = e.dataTransfer.items;

console.log([files,items]);
/*
        if(itmid >= 0){
//アイテムドロップ
            var itm = pman.reName.getItem(itmid);
            if(e.composedPath().indexOf(document.getElementById('fileStrip')) >= 0){
//            if(e.composedPath()[0].id == 'fileStrip'){};//
console.log('droped to fileStrip end');
//リスト領域内でアイテム外にドロップ ルートの最後尾にアタッチ
				let targetIdx = pman.reName.parseId(e.composedPath()[0].id);
//				let placement = pman.reName.parseId((e.composedPath()[0].id);
				let checkedItems = pman.reName.getSelected();
				if(checkedItems.length){
					pman.reName.move(checkedItems,-1,'PLACEATEND');
				}else{
					pman.reName.move(itm,-1,'PLACEATEND');
				};
				pman.reName.pending = false;
            }else{
//リスト領域外（削除？）
                alert('OUT of RANGE!!');
            };
        }else ;// */  
        if((items.length == 1)&&(items[0].webkitGetAsEntry().isFile)){
//ファイル単独ドロップ
console.log(items[0].webkitGetAsEntry().isFile);
        xUI.importBox.read(e.dataTransfer.files,processImport);
/* エレクトロン拡張時に使用
            if((files.length == 1)&&(files[0].path)){
//fileにpath拡張があるのでhub&&spoke:メッセージ通信でバックグラウンド処理へ移行
				uat.MH.parentModule.window.postMessage({
					channel:'callback',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					to:{name:'hub',id:uat.MH.parentModuleIdf},
					command:'return electronIpc.getEntryFileList(...arguments)',
					content:[files[0].path,3,pman.reName.maxItemCount],
					callback:"pman.reName.initItems(...arguments)"
				});
			}else if ((files.length == 1)&&(items.length == 1)){
			} ;// */
        }else{
console.log(files);
console.log(items);
            
        };
    }, false);
//入力スタンバイ
    document.getElementById("iNputbOx").focus();
//test タスクコントローラ起動
    startupTaskController();
};
/**
    印字用HTMLスタートアップ  （スタートアップのサブセット)




 */
function nas_Prt_Startup(callback){
/**
       xUI.XPSを実際のXpsオブジェクトとして再初期化する
*/
    xUI.XPS=new Xps(MaxLayers,MaxFrames);
//    xUI.XPS = new Xps([SoundColumns,SheetLayers,CameraworkColumns,StageworkColumns,SfxColumns],MaxFrames);

/*============*     初期化時のデータ取得    *============*/
/*
 *  レンダリング時にドキュメント内にスタートアップデータが埋め込まれている
 */
//    ドキュメント内スタートアップデータを読み出し

if(document.getElementById( "startupContent" )){
         startupDocument=$("#startupContent").text();
}

//    同ドキュメント内にスタートアップ用参照データがあれば読み出し

if(document.getElementById( "startupReference" ) && document.getElementById( "startupReference" ).innerHTML.length){
        referenceDocument=$("#startupReference").text();
}
//    UI生成
    xUI=new_xUI();

    xUI.XPS.readIN=xUI._readIN_xps;
//    *** xUI オブジェクトは実際のコール前に必ずXPSを与えての再初期化が必要  要注意

if( startupDocument.length > 0){ xUI.XPS.readIN(startupDocument) }
//リファレンスシートデータがあればオブジェクト化して引数を作成
        var referenceX=new Xps(MaxLayers,MaxFrames);
    if((referenceDocument)&&(referenceDocument.length)){
        referenceX.parseXps(referenceDocument);
    }
      xUI.init(xUI.XPS,referenceX);
    var pgRect     = document.getElementById("printPg1").getBoundingClientRect();
    var headerRect = document.getElementById("pg1Header").getBoundingClientRect();
    var tableRect  = document.getElementsByClassName("sheet")[0].getBoundingClientRect();
    var baseWidth  = headerRect.width;
    var baseHeight = 1580;//
    var xScale = baseWidth/tableRect.width;
    var yScale = (baseHeight-headerRect.height)/tableRect.height;
    $(".sheet").css({"transform":"scale("+[xScale,yScale].join()+")","transform-origin":"0 0"});
    $(".printPage").css({"height":baseHeight,"width":baseWidth});
    xUI.replaceEndMarker([xUI.XPS.xpsTracks.length,xUI.XPS.xpsTracks.duration]);//編集HTML用のみ

    //スケーリング終了後のアイテム座標でマーカーを配置
    if(callback instanceof Function) callback();
};
//
/** タイムシートのUIをリセットする手続き
タイムシートの変更があった場合はxUI.init(xUI.XPS)を先にコールしてxUIのアップデートを行うこと

引数としてuiModeを文字列で与えて  リセット後のuiModeを指定可能 未指定の場合はリセット前のモードを継続
    ↓
シート内容のみの変更の場合は、xUI.resetSheetを用いる  その際xUI.initを省略することが必要
xUI.initの初期化手続は１回のみに変更  コードを組み替えて整理すること。

シート変更時の画面リフレッシュを別の手続'xUI.resetSheet'へ移行
この手続は、UIの再初期化手続として利用される
この一連の手続内でxUI.resetSheet()メソッドがコールされる
*/
function nas_Rmp_Init(uiMode){
alert('xpsedit初期化 : ' + uiMode)
    var startupWait=false;
/*
//console.log(xUI.XPS.toString())
//console.log(xUI.referenceXPS.toString())
*/
if(false){
//プロパティのリフレッシュ
    xUI._checkProp();
    xUI.Cgl.init();//特にこの処理を重点的にチェック  このルーチンは実行回数が少ないほど良い
}
//    xUI.resetSheet();

/*  表示モード増設 
Compactモード時は強制的に
  表示１列  コンテの継続時間とページ長を一致させる
表示モードにしたがって
  タイトルヘッドラインの縮小
*/

/** 動作モードを新設
production/management/browsing
managementモードではシート編集はブロック
viewOnly プロパティは再初期化前の状態を再生
*/
    var vOcurrent=xUI.viewOnly;
    if(typeof uiMode != 'undefined'){xUI.setUImode(uiMode);}else{xUI.setUImode(xUI.setUImode());}
    xUI.viewOnly=vOcurrent;

    xUI.sync('productStatus');
/*
//タイムシートテーブルボディ幅の再計算 ここにトラック種別が反映されていない  注意
//(タイムヘッダ幅+ダイアログ幅+レイヤ数*幅+コメント欄幅+余分)×ページカラム数＋カラムセパレータ幅×(ページカラム数?1)

    var tableBodyWidth=(
        xUI.sheetLooks.TimeGuideWidth +
        xUI.sheetLooks.DialogWidth + 
        xUI.sheetLooks.ActionWidth * xUI.referenceLabels.length +
        xUI.sheetLooks.SheetCellWidth*(XPS.xpsTracks.length-2) +
        xUI.sheetLooks.CommentWidth
    )
    if(xUI.viewMode!="Compact"){
        tableBodyWidth=tableBodyWidth* xUI.PageCols +(xUI.sheetLooks.ColumnSeparatorWidth*(xUI.PageCols-1));//
    }
*/
//シートを初期化
if(config.dbg) var TimeStart=new Date();
/*

//UI上メモとトランジション表示をシート表示と切り分けること 関連処理注意
    xUI.sync("memo");

if(xUI.viewMode=="Compact"){
//    alert("compact xD:"+ XPS.duration()+" pL: "+xUI.PageLength );
//コンパクトモード  コンパクトUI用のラベルヘッダーを作成
document.getElementById("UIheaderFix").innerHTML=xUI.pageView(-1);
document.getElementById("UIheaderScrollH").innerHTML=xUI.pageView(0);
document.getElementById("UIheaderScrollV").innerHTML=xUI.pageView(-2);
document.getElementById("UIheader").style.display="inline";
//コンパクトUI時は1ページ限定なのでボディ出力を１回だけ行う
        var SheetBody= xUI.headerView(1);
        SheetBody+= '<br>';//UI調整用に１行（ステータス行の分）
        SheetBody+= xUI.pageView(1);
}else{
//ノーマルモード  コンパクトUI用のラベルヘッダーを隠す
document.getElementById("UIheader").style.display="none";
//
    var SheetBody='';
    for(var Page=1 ;Page <=Math.ceil(xUI.XPS.duration()/xUI.PageLength);Page++)
    {
        SheetBody+= xUI.headerView(Page);
        SheetBody+= ' <span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
        SheetBody+= xUI.pageView(Page);
    };
}
*/
/*
サーバーオンサイトであるか否かを判定して表示を更新
     エレメントが存在すればon-site
 */
     if(
        (document.getElementById('backend_variables'))&&
        ($("#backend_variables").attr("data-organization_token").indexOf('<%=')!= 0)
    ){
//オンサイト
console.log('Application server-onsite');
        if (serviceAgent.servers.length==1) {
            serviceAgent.switchService(0);
        }else{
            serviceAgent.switchService(0);//デフォルトサーバのIDを置く
        }
        xUI.onSite = serviceAgent.currentServer.url.split('/').slice(0,3).join('/');
         serviceAgent.currentStatus='online';

//  ドキュメント表示更新
         document.getElementById('loginstatus_button').innerHTML = '=ONLINE=';
         document.getElementById('loginstatus_button').disabled  = true;
         document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;
         document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;
/*
オンサイト時にiFrame表示を行う場合
以下のエレメントを非表示にする
スクリーンをメニュー幅シフトする
*/
    $('#headerLogo').hide();
    $('#headerRepository').hide();
    $('#account_box').hide();
//    xUI.shiftScreen(50,50);//旧UIでは不要

//  サーバ指定のフレームレートが存在する場合は最優先で取得してデフォルト値を設定する
        var frtString=$("#backend_variables").attr("data-frame_rate");
        if(String(frtString).length){
console.log("framerate specified : " + frtString);
            nas.FRATE = nas.newFramerate(frtString);//ここでnas.FRATEを変更するか否か…  一時変数とするケースを考慮のこと
        }else{
console.log("no framerate specified");
        };
//  データスケール指定が有効ならばフレーム数として取得
	    var spcFrames=nas.FCT2Frm($('#backend_variables').attr('data-scale'),nas.FRATE);
//   カラーセット
        var sheetBaseColor=$("#backend_variables").attr("data-sheet_color");
        if (sheetBaseColor.match(/^rgba?\(([\d\s\.,]+)\)$/i)){
            var collorArray=(RegExp.$1).split(',');
            sheetBaseColor="#"+parseInt(collorArray[0],10).toString(16)+parseInt(collorArray[1],10).toString(16)+parseInt(collorArray[2],10).toString(16);
        }
        if(sheetBaseColor.match(/^#[0-9a-f]+$/i)){
            config.SheetLooks.SheetBaseColor = config.sheetBaseColor;
            xUI.applySheetlooks(config.SheetLooks);
        }
//  ユーザ情報取得
        xUI.currentUser = new nas.UserInfo(
            $("#backend_variables").attr("data-user_name") + ":" +
            $("#backend_variables").attr("data-user_email")
        );

        myName = xUI.currentUser.toString();//旧変数互換 まとめて処理する関数が必要
//        myNames = xUI.recentUsers.covertStringArray();//要素を文字列可した配列

         if($("#backend_variables").attr("data-episode_token").length > 0){
console.log('bind single document');
//シングルドキュメント拘束モード
		    startupWait=true;//ウェイト表示を予約
             serviceAgent.currentStatus='online-single';
document.getElementById('loginstatus_button').innerHTML='>ON-SITE<';
document.getElementById('loginstatus_button').disabled=true;

//新規作成メニューをブロック
    xUI.pMenu('pMnewdoc','disabled');
    xUI.pMenu('pMnewEntry','disabled');
//インポート関連をロック  操作 xUI.sync('productStatus')に統合（タイミングが同じ）
// xUI.sync("importControllers");//document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;//document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;//document.getElementById('ibMdiscard').disabled=true;//document.getElementById('ibMfloat').disabled=true;
         $('#ibMdiscard').hide();
         $('#ibMfloat').hide();
         $('#pMbrowseMenu').hide();
         $('#ibMbrowse').hide();
//設定表示
                 document.getElementById('toolbarHeader').style.backgroundColor='#ddbbbb';
//サーバ既存エントリ
            var isNewEntry = ( startupDocument.length==0)? true:false;
//サーバ上で作成したエントリの最初の1回目はサーバの送出データが空
//空の状態でかつトークンがある場合が存在するので判定に注意！
//トークンあり、送出データが存在する場合は、識別子同期自体を省略すること
//カットトークンがない場合はマルチドキュメントモードで初期化
            if($("#backend_variables").attr("data-cut_token").length){ ;//この判定は仕様変更で不要になっている  ここでトークンのないケースはエラーケース
 /* ========= シンクルドキュメントバインド時の初期化 ========= */
console.log('has cut token');
                 serviceAgent.currentServer.getRepositories(function(){
                     var RepID = serviceAgent.getRepsitoryIdByToken($("#backend_variables").attr("data-organization_token"));
                     serviceAgent.switchRepository(RepID,function(){
                         if(config.dbg) console.log('switched repository :' + RepID);

console.log(nas.FRATE);
/*  最小の情報をトークンベースで取得
最短時間で情報を構築するためにAPIを直接コール
*/
//get product information
$.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/products/'+ $('#backend_variables').attr('data-product_token') +'.json',
        type:'GET',
        dataType: 'json',
        success: function(productResult) {
console.log('get ProductResult');
console.log(productResult);
            serviceAgent.currentRepository.productsData=[productResult.data.product];
//get episode information
    $.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/episodes/'+ $('#backend_variables').attr('data-episode_token') +'.json',
        type:'GET',
        dataType: 'json',
        success: function(episodeResult) {
console.log('get EpisodeResult');
console.log(episodeResult);
            serviceAgent.currentRepository.productsData[0].episodes=[[episodeResult.data.episode]];
//get cut information
        $.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/cuts/'+ $('#backend_variables').attr('data-cut_token') +'.json',
        type:'GET',
        dataType: 'json',
        success: function(cutResult){
console.log('get CutResult')
console.log(cutResult)
//データ請求に成功
        	var myContent=cutResult.data.cut.content;//XPSソーステキストをセット
console.log('create new Xps');
    //data-scaleに有効な値が存在する場合は、その値を参照  後ほど調整する処理を減らす
            
        	var currentXps =new Xps(MaxLayers,(spcFrames)?spcFrames:nas.SheetLength+':00.');//一時オブジェクトを作成

currentXps.title    = productResult.data.product.name;
currentXps.opus     = episodeResult.data.episode.name;
currentXps.subtitle = episodeResult.data.episode.description;
currentXps.cut      = cutResult.data.cut.name;
currentXps.line      = new XpsLine(cutResult.data.cut.line_id);
currentXps.stage      = new XpsStage(cutResult.data.cut.stage_id);
currentXps.job      = new XpsStage(cutResult.data.cut.job_id);
currentXps.currentStatus      = new JobStatus(cutResult.data.cut.status);

var curentAPIIdentifier = Xps.getIdentifier(currentXps); 
/*
    有効なリザルトを得た場合は、最新データなので startupDocumentを入れ換える。
    ロードのタイミングで他のユーザが書き換えを行った可能性があるので、最新のデータと換装
    myContent==nullのケースは、サーバに空コンテンツが登録されている場合なので単純にエラー排除してはならない
    
    稀なケースで、登録直後のデータを開いて作業にはいり、アクシデント等で未編集のままサーバの接続を断って自動保存が発生した場合、
    タイムシートの内容がデフォルト1秒でタイトル・エピソード・カット番号等を失う場合がある  要検出
    
*/
console.log('getStartupContent')
//console.log(myContent);
	        if(myContent){
console.log('has Content')
                var checkSheet = new Xps();
                checkSheet.parseXps(myContent);//取得した内容で一時データ作成
                //一時データの整合性を検査
                var checkIdf=Xps.compareIdentifier(Xps.getIdentifier(checkSheet),Xps.getIdentifier(currentXps));
                if(checkIdf > 0){
                     startupDocument=myContent;
                    //currentXps.parseXps(myContent);
                    currentXps=checkSheet;//Swapで
                }
console.log(currentXps);
                
//if(currentXps.time()!=spcFrames)
	        } else if(myContent == null){
console.log('no Content get');
	            var myParseData = Xps.parseSCi((cutResult.data.cut.description)?cutResult.data.cut.description:cutResult.data.cut.name);
	            currentXps.cut = myParseData[0].cut;
//ディスクリプション領域に識別子があればそちらを優先、更にdata-scaleが存在すればそれを優先  名前 < 識別子 < data-scale
                if(spcFrames){
console.log('data scale specified :');
console.log(spcFrames);
console.log(nas.FRATE);
                    myParseData[0].time=String(spcFrames);
console.log(myParseData);
                }
console.log( myParseData[0].time );
console.log( 'setDuration :'+nas.FCT2Frm(myParseData[0].time,nas.FRATE));
	            currentXps.setDuration(nas.FCT2Frm(myParseData[0].time,nas.FRATE));
//このケースでは必ずFloatingステータスのデータができるので、ステータスを強制的にStartupへ変更する
                currentXps.currentStatus= new JobStatus('Startup');
	        };
console.log(currentXps);
console.log([
    currentXps.line.toString(true),
    currentXps.stage.toString(true),
    currentXps.job.toString(true),
    currentXps.currentStatus.toString(true)
].join('//'));
console.log(Xps.getIdentifier(currentXps));
console.log(currentXps.getIdentifier(true));

//本体情報からエントリを作成して要素一つだけのproductsDataリストを作る
            serviceAgent.currentRepository.productsData[0].episodes[0][0].cuts=[[{
                token:cutResult.data.cut.token,
                name:cutResult.data.cut.name,
//                description:cutResult.data.cut.description,
                description:Xps.getIdentifier(currentXps),
                created_at:cutResult.data.cut.created_at,
                updated_at:cutResult.data.cut.updated_at,
                versions:cutResult.data.versions
            }]];
            serviceAgent.currentRepository.convertPDEL();//エントリリストに変換
//
//currentXpsのプロパティをリザルトに同期させる
                    var myIdentifier=serviceAgent.currentRepository.getIdentifierByToken($('#backend_variables').attr('data-cut_token'));
                    if((myIdentifier)&&(Xps.compareIdentifier(Xps.getIdentifier(xUI.XPS),myIdentifier) < 5)){
                        xUI.XPS.syncIdentifier(myIdentifier,false);
                        
//同期が行われたのでフラグを立てる
//console.log(xUI.XPS)
                    }
                    
                    if( startupDocument.length==0 ){
console.log('detect first open no content');//初回起動を検出  コンテント未設定
                        xUI.XPS.line     = new XpsLine(nas.pmdb.pmTemplates.members[0]);
                        xUI.XPS.stage    = new XpsStage(nas.Pm.pmTemplates.members[0].stages.members[0]);
                        xUI.XPS.job      = new XpsStage(nas.pmdb.jobNames.getTemplate(xUI.XPS.stage,"init")[0]);
                        xUI.XPS.currentStatus   = new JobStatus("Startup");     
                        xUI.XPS.create_user=xUI.currentUser;
                        xUI.XPS.update_user=xUI.currentUser;
//syncIdentifierでカット尺は調整されているはずだが、念のためここで変数を取得して再度調整をおこなう
//data-scale を廃止した場合は、不用
                        var myCutTime = nas.FCT2Frm($('#backend_variables').attr('data-scale'));
                        if((myCutTime) && (!(isNaN(myCutTime))) && (myCutTime != xUI.XPS.time())){
//console.log('setDuration with data-scale')
                            xUI.XPS.setDuration(myCutTime);
                        }
                    }
                    xUI.resetSheet(currentXps);
//ここで無条件でproductionへ移行せずに、チェックが組み込まれているactivateEntryメソッドを使用する
                        xUI.setRetrace();
                        xUI.setUImode('browsing');//初期値設定
		                if (startupWait) xUI.sWitchPanel('Prog');//ウェイト表示消去
                        switch(xUI.XPS.currentStatus.content){
                            case "Active":
                        // チェックイン直後の処理の際はactivate処理が余分なのでケースわけが必要
                        // jobIDがフラグになる  スタートアップ直後の自動チェックインの場合のみ処理をスキップしてモード変更
                                if(xUI.XPS.job.id==1){
                                    xUI.setUImode('production');
                                }else{
                                    serviceAgent.activateEntry();
                                }
                            break;
                            case "Hold":
                        // 常にactivate
                                serviceAgent.activateEntry();
                            break;
                            case "Fixed":
                        //ユーザが一致しているケースでもactivateとは限らないので、Fixedに関してはスキップ 
                            break;
                            case "Startup":
                                serviceAgent.checkinEntry();
                            case "Aborted":
                            default:
                        //NOP
                        }
                        xUI.sync('info_');
                        xUI.setUImode(xUI.setUImode());//現モードで再設定
console.log('初期化終了');
                },
        error : function(result){console.log(result)},
        beforeSend: serviceAgent.currentRepository.service.setHeader
        });//get cut information
        },
        error : function(result){console.log(result)},
        beforeSend: serviceAgent.currentRepository.service.setHeader
    });//get episode information
        },
        error : function(result){console.log(result)},
        beforeSend: serviceAgent.currentRepository.service.setHeader
});//get product information

                     });//set Repository
                 });//get Repository
             };//カットトークンの確認  これがなければ不正処理
/* ========= シンクルドキュメントバインド時の初期化 ========= */
         } else {
//マルチドキュメントモード
// リポジトリのIDは不問 とりあえず１(ローカル以外)
//console.log('onsite multi-document mode');
             serviceAgent.currentServer.getRepositories(function(){
//                 serviceAgent.switchRepository(1,documentDepot.rebuildList);
                 serviceAgent.switchRepository(1);
             });
            $("li#pMos").each(function(){$(this).hide()});//シングルドキュメントモード専用UI

         }
//if(serviceAgent.currentRepository.entry(Xps.getIdentifier(xUI.XPS))),
     }else{
console.log('Application Offsite');
//オフサイトモード
    console.log(serviceAgent.currentServer);
//オンサイト専用UIを隠す
            $("li#pMos").each(function(){$(this).hide()});
            $("li#pMom").each(function(){$(this).hide()});
            $("#ibMmenuBack").hide();
/** 現在のセッションが承認済みか否かを判定して表示を更新
    
*/
        if($("#server-info").attr('oauth_token')){
            serviceAgent.authorized('success');
        }else{
            serviceAgent.authorized();
        };
//localRepositoryの設定を行う
    serviceAgent.currentRepository.getProducts();
    serviceAgent.switchRepository();
        xUI.sync('server-info');
     }
//シートボディを締める
//    document.getElementById("sheet_body").innerHTML=SheetBody+"<div class=\"screenSpace\"></div>";

    console.log(serviceAgent.currentServer);

/*
// 初回ページレンダリングでグラフィックパーツを配置
// setTimeoutで無名関数として実行
window.setTimeout(function(){
    xUI.syncSheetCell(0,0,false);//シートグラフィック置換
    xUI.syncSheetCell(0,0,true);//referenceシートグラフィック置換
//フットスタンプの再表示
    if(xUI.footMark){xUI.footstampPaint()};
},0);
*/

//書き出したら、セレクト関連をハイライト
//
//    XPS.selectionHi("hilite")
//    xUI.focusCell("1_0")    ;//フォーカスして
//    xUI.selectCell("1_0")    ;//フォーカスして,"startup"
    xUI.bkup([xUI.XPS.xpsTracks[1][0]]);
//    xUI.focusCell()    ;//リリース
//jquery関連  パネル類の初期化
//    initPanels();
/*
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
*/
(function initPanels(){
//起動時に各種パネルの初期化を行う。主にjquery-ui-dialog
//aboutパネル
$("#optionPanelVer").dialog({
	autoOpen:false,
	modal	:true,
	width	:480,
	title	:localize(nas.uiMsg.aboutOf,"xpsedit.remaping…")
});
//:nas.uiMsg.Preference
$("#optionPanelPref").dialog({
	autoOpen:false,
	modal	:true,
	width	:520,
	title	:localize(nas.uiMsg.Preference)
});
//:nas.uiMsg.xSheetInfo
$("#optionPanelScn").dialog({
	autoOpen:false,
	modal	:true,
	width	:512,
	title	:localize(nas.uiMsg.xSheetInfo)
});
//:nas.uiMsg.document
$("#optionPanelFile").dialog({
	autoOpen:false,
	modal	:true,
	width	:720,
	title	:localize(nas.uiMsg.document)
});
})();

(function initPanelsII(){
//:nas.uiMsg.processing
$("#optionPanelProg").dialog({
	autoOpen:false,
	modal	:true,
	width	:240,
	title	:localize(nas.uiMsg.processing)
});
//:nas.uiMsg.inputWarning
$("#optionPanelRol").dialog({
	autoOpen:false,
	modal	:true,
	width	:480,
	title	:localize(nas.uiMsg.inputWarning)
});
//:シーンカット入力ダイアログパネル
$("#optionPanelSCI").dialog({
    autoOpen:false,
    modal	:true,
    width	:480,
    position :{
        my: "left top",
        at: "center-240 top+100",
    },
    title	:"IMPORT"
});

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
});


//:nas.uiMsg.Sounds
/* ダイアログをスクリーンに対して固定にする場合はJQuiry UIで初期化する
こちらで初期化するとスクロール追従となる

$("#optionPanelSnd").dialog({
	autoOpen:false,
	modal	:false, 
	width	:680,
	title	:localize(nas.uiMsg.Sounds),
    position: {
        of : window,
        at: 'center top',
        my: 'senter top'
    }
});
*/
})();
//インポート用ファイルドラッガ初期化
 $(function() {
        var localFileLoader = $("#data_well");
        // File API が使用できない場合は諦め
        if(!window.FileReader) {
        console.log("File API がサポートされていません。:"+new Date());
          return false;
        }
        // イベントをキャンセルするハンドラ
        var cancelEvent = function(event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        // dragenter, dragover イベントのデフォルト処理をキャンセル
        localFileLoader.bind("dragenter", cancelEvent);
        localFileLoader.bind("dragover", cancelEvent);
        // ドロップ時のイベントハンドラを設定します.
        var handleDroppedFile = function(event) {
          // ドロップされたファイル配列を取得してファイルセレクタへ
          // 同時にonChangeを打つ
          document.getElementById('myCurrentFile').files = event.originalEvent.dataTransfer.files;
          // デフォルトの処理をキャンセル
          cancelEvent(event);
          return false;
        }
        // ドロップ時のイベントハンドラを設定
        localFileLoader.bind("drop", handleDroppedFile);
});

//ヘッドラインの初期化
    initToolbox();
//デバッグ関連メニューの表示
    if(config.dbg){
        $("button.debug").each(function(){$(this).show()});
        $("li.debug").each(function(){$(this).show()});
        if(appHost.platform=="AIR"){$("li.airDbg").each(function(){$(this).show()})};
    }else{
        $("button.debug").each(function(){$(this).hide()});
        $("li.debug").each(function(){$(this).hide()});
        $("li.airDbg").each(function(){$(this).hide()});
    }

//AIR|Node.js(+Electron)を認識した場合cgiUIとlocalUIを切り換え

//switch (appHost.platform){
    if ((appHost.Nodejs)||(appHost.platform == "AIR")){
/*
        document.ondragover = document.ondrop = function (e) {
            e.preventDefault();
console.log('droped ',e)
            
        };// */
        document.body.addEventListener('drop', function (e) {
            console.log('file dropped:', e.dataTransfer.files[0]);
        });
//case    "AIR":
//tableメニュー表記
        $("tr#cgiMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
        $("#airMenu").show();//="inline";
        $("#psMenu").hide();//
        $("#cgiMenu").hide();//="none";
//        document.getElementById("airMenu").style.display="inline";
//        document.getElementById("cgiMenu").style.display="none";
//サンプル取得部
//        document.getElementById("cgiSample").style.display="none";
//ドロップダウンメニュー用表記切り替え
        $("li").each(function(){
                switch(this.id){
                case "cMair":
                case "dMair":$(this).show();break;
                case "cMps":
                case "dMps":
                case "cMcgi":
                case "dMcgi":$(this).hide();break;
                }
            });
//ブラウザ用ドロップダウンメニュー表示
        $("#pMenu").show();
//ドロップダウンメニューの初期化
        $("#pMenu li").hover(function() {
            $(this).children('ul').show();
        }, function() {$(this).children('ul').hide();});
//osがwindowsでかつAIR環境だった場合のみドロップダウンメニューを隠す
//        if((window.navigator.platform).indexOf("Win")>=0){$("#pMenu").hide()};
//break;
    }else if((appHost.platform == "CEP")||(appHost.platform == "CSX")){
//case "CEP":
//    window.parent.psHtmlDispatch();    xUI.shiftScreen(50,50);
//case    "CSX":
//tableメニュー表記
        $("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
        $("#airMenu").hide();//
        $("#psMenu").show();//
        $("#cgiMenu").hide();//
//サンプル取得部
//        document.getElementById("cgiSample").style.display="none";
//ドロップダウンメニュー用表記切り替え
        $("li").each(function(){
                switch(this.id){
                case "cMps":
                case "dMps":$(this).show();break;
                case "cMair":
                case "dMair":
                case "cMcgi":
                case "dMcgi":$(this).hide();break;
                }
            });
//ブラウザ用ドロップダウンメニュー表示
        $("#pMenu").show();
//ドロップダウンメニューの初期化
        $("#pMenu li").hover(function() {
            $(this).children('ul').show();
        }, function() {$(this).children('ul').hide();});
//表示切り替え
    xUI.setToolView('compact');
//break;
    }else{
//default:
//標準的なブラウザ
        $("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
        $("#airMenu").hide();//
        $("#psMenu").hide();//
        $("#cgiMenu").show();//
//ドロップダウンメニュー用表記切り替え
        $("li").each(function(){
                switch(this.id){
                case "cMcgi":
                case "dMcgi":$(this).show();break;
                case "cMair":
                case "dMair":
                case "cMps":
                case "dMps":$(this).hide();break;
                }
            });
//ブラウザ用ドロップダウンメニュー表示
        $("div#pMenu").show();
//ドロップダウンメニューの初期化
        $("#pMenu li").hover(function() {
            $(this).children('ul').show();
        }, function() {$(this).children('ul').hide();});
    }
// }
//Node.js(+electron)環境の際airMenuを再表示
    if(appHost.Nodejs) $("#airMenu").show();//="inline";
//オンサイト時の最終調整はこちらで？
    if(xUI.onSite){
//        xUI.sWitchPanel('Prog');
    }

//infoシートの初期化
    if(config.TSXEx){init_TSXEx();};
//window.FileReader オブジェクトがある場合のみローカルファイル用のセレクタを表示する
//読み込み機能自体は封鎖してないので注意
    if(window.FileReader){
        $("#localFileLoader").show();
        $("#localFileLoaderSelect").show();
    }else{
        $("#localFileLoader").hide();
        $("#localFileLoaderSelect").hide();
    }
//initInfosheet();
//xUI.spin(1);xUI.spin(SpinValue);
//ドキュメント設定オブジェクト初期化
    xUI.myScenePref    =new ScenePref();
//UI設定オブジェクト初期化
    xUI.myPref    =new Pref();
//UI表示状態のレストア
    xUI.setToolView((config.ToolView)?config.ToolView:'default');
//暫定  プラットホームを判定して保存関連のボタンを無効化したほうが良い  後でする

//開発用表示
if(config.dbg){
//    $("#optionPanelDbg").show();//
//    if(config.dbg){xUI.openSW("dbg_")};
//    $("#optionPanelDbg").show();
//    $("#optionPanelUtl").show();
//    $("#optionPanelTrackLabel").show();
//    $("#optionPanelEfxTrack").show();
//    $("#optionPanelTrsTrack").show();
        $("#serverSelector").show();
}
//表示内容の同期
    xUI.sync("tool_");
    xUI.sync("info_");
if(config.dbg){
    var TimeFinish=new Date();
    var msg="ただいまのレンダリング所要時間は、およそ "+ Math.round((TimeFinish-TimeStart)/1000) +" 秒 でした。\n レイヤ数は、 "+xUI.XPS.xpsTracks.length+ "\nフレーム数は、"+xUI.XPS.duration()+"\tでした。\n\t現在のspin値は :"+xUI.spinValue;
//    if(config.dbg) alert(msg);
    config.dbg=false;
}
//起動時の画面幅で制限モードON
    if((window.innerWidth<640)||
    (window.parent.screen.width<640)){
        xUI.setRestriction(true);
    }
/* ヘッダ高さの初期調整*/
//xUI.adjustSpacer();
    if(xUI.app == 'remaping') xUI.tabSelect(xUI.activeDocumentId);
/* */
    xUI.selection();
//スタートアップ中に時間のかかる処理をしていた場合はプログレスパネルで画面ロック  解除は操作側から行う
if(startupWait){xUI.sWitchPanel('Prog');};//ウェイト表示
};
/*
    ページ再ロード前に必要な手続群
*/
function nas_Rmp_reStart(evt){
//ファイルがオープン後に変更されていたら、警告する
/*
    変更判定は xUI.activeDocument.undoBuffer.storePt と xUI.activeDocument.undoBuffer.undoPtの比較で行う
storePtはオープン時および保存時に現状のundoPtを複製するので、
内容変化があれば (xUI.activeDocument.undoBuffer.storePt != xUI.activeDocument.undoBuffer.undoPt) となる

*/
//    if(! xUI.isStored()){
        /*
    evt = event || window.event;
    return evt.returnValue=localize({
        en:"The document change is not saved!",
        ja:"ドキュメントの変更が保存されていません！"
    });
        //xUI.setBackup();
        var msg=locallize({
            en:"I will move from this page (move can not be canceled).\n The document is not saved, but save it?",
            ja:"このページから移動します(移動のキャンセルはできません)\nドキュメントが保存されていませんが、保存しますか？"
        });
        */
/*データ保全は、モード／ケースごとに振り分け必要*/
//        if(confirm(msg)){ xUI.setBackup() };
//console.log('backup');
//        xUI.setBackup();
        //保存処理
//    };
    if(! xUI.isStored()){
        console.log('backup');
        xUI.setBackup();
    };
// if(confirm("TEST")){return true}else {return false};
//    クッキーを使用する設定なら、
//    現在のウィンドウサイズを取得してクッキーかき出し
    if (config.useCookie[0]) {
        writeCk(buildCk());
    };//現在  cookie:0 は常にfalse

//データ保存の有無に関係なくセッションチェックイン中ならば保留する（自動）
    if(xUI.uiMode=='production'){
        serviceAgent.deactivateEntry();
    }
// return true;
};

/*
メモ

アンドゥスタックの使用

通常入力
アンドゥポインタと配列の長さを比較
配列をアンドゥポインタの長さに揃える(切り取る)
アンドゥ要素(位置・セレクション・保存データストリーム)を
アンドゥ配列に積む・ポインタ1加算

タイムシート構成変更
現在のタイムシートをオブジェクト化してUNDOスタックに積む
UNDO/REDOともに準拠操作

アンドゥ操作
ポインタ位置のデータを使用して本体配列の書き換え
アンドゥデータとリドゥデータの入れ換え(位置とセレクションはそのまま)
ポインタだけを1減算

リドゥ操作
ポインタ1加算
ポインタ位置のデータを使用して本体配列の書き換え
アンドゥデータにデータを置き換え

操作フラグ必要


HTML上のシート取り込み手順
index(または相当の)ファイルのbodyに textarea でXPSデータを書き込む
startup内でXPSデータを認識したら。フレームセットのプロパティにXPSデータをescapeして書き込む
シート初期化の際に parent.document.body.innerHTML から切り分けで読み出す
読み出しに成功した場合だけ、そのXPSを使用してシートを初期化する。



2015 01 10
メモ  シートの秒数を減らす際にスクロールスペーサーのサイズ計算が間違っている
計算違いではなく  ステータス表示エレメントの位置がズレて、その値から計算しているのでおおきくなる
エラー検出が必要かも
全尺が大きい時に顕著？

尺が大きい時に自動スクロールの位置計算に狂いが出ているので要チェック

2015 07 04
ペースト内容の挿入を実装
    指定位置からシート末尾までの範囲（不定スパン）を一次バッファにとる
    ヤンクまたは挿入範囲と一次バッファで新規の上書き用データを作る
    上書きデータをputする
    ＝undo一回分となる
指定範囲移動を実装する
実際に
ヤンク>クリア>ペースト（上書き移動）
ヤンク>

*/
/*  ---------- sync.js
		パネル情報同期

ユニット名称	HTML-Elements  説明

	headline	ヘッドライン・常用ツール
	body		タイムシート本体
	info		情報表示・AEキーリザルト
	tool_		ツールボックス(実質上の常用ツール)
	map			マップ表示
	pref		プリファレンスパネル
	dataio		データI/O(XPS/AEload)

こんなもんかしら
こいつは相当いじらないと危ないかも
*/
//汎用表示同期プロシージャ
//同期プロシージャは発信側に置いたほうが、なにかとベンリなので本体に移動

//プロパティとセレクタの関連づけ
//	var PropLists = new Array();
var PropLists = new Object();
	PropLists["blmtd"]=["file","opacity","wipe","channelShift","expression1"];
	PropLists["blpos"]=["first","end","none"];
	PropLists["AEver"]=["8.0","10.0"];
//	PropLists["AEver"]=["4.0","5.0"];
	PropLists["KEYmtd"]=["min","opt","max"];
	PropLists["framerate"]=["custom","23.976","24","30","29.97","59.96","25","50","15","48","60"];
	PropLists["framerate_name"]=["=CUSTOM=","23.98","FILM","NTSC","SMPTE","SMPTE-60","PAL","PAL-50","WEB","FR48","FR60"];
	PropLists["SIZEs"]=["custom",
"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
"1280,720,1","1920,1080,1","1440,1080,1.333"];
	PropLists["dfSIZE"+"_name"]=["=CUSTOM=",
"VGA","DV","D1","D1sq",
"D4","D16","std-200dpi","std-144dpi",
"HD720","HDTV","HDV"];
/*
	タイトル置換機能初期化
 */
if(config.useworkTitle){
var workTitle=new Object();
	for(var i=0;i<=(config.workTitles.length-1/5);i++){
	ix=i*5;
	workTitle[config.workTitles[ix]]=new Array();
		workTitle[config.workTitles[ix]].imgSrc=(config.workTitles[ix+1])?
			config.workTitles[ix+1]:"";
		workTitle[config.workTitles[ix]].ALTText=(config.workTitles[ix+2])?
			config.workTitles[ix+2]:"";
		workTitle[config.workTitles[ix]].linkURL=(config.workTitles[ix+3])?
			config.workTitles[ix+3]:"";
		workTitle[config.workTitles[ix]].titleText=(config.workTitles[ix+4])?
			config.workTitles[ix+4]:"";
	};
};

function aserch_(name,ael){if(this[name]){for(var n=0;n<this[name].length;n++){if(this[name][n]==ael)return n}};return -1;}

PropLists.aserch = aserch_	;

/*
	タイムシート表示同期プロシジャ
オンメモリの編集バッファとHTML上の表示を同期させる。キーワードは以下の通り
fct         ;//フレームカウンタ
lvl         ;//キー変換ボタン
spinS       ;//スピンセレクタ
ipMode      ://入力モードセレクタ 0:フィルタなし|1:動画|2:原画
title       ;//タイトル
subtitle    ;//サブタイトル
opus        ;//制作番号
create_time ;//作成時間
update_time ;//更新時間?これは要らない
create_user ;//作成ユーザ
update_user ;//更新(作業)ユーザ
scene       ;//シーン番号
cut         ;//カット番号
framerate   ;//フレームレート
undo        ;//アンドゥボタン
redo        ;//リドゥボタン
time        ;//時間
trin	;//トランジション時間1
trout	;//トランジション時間2
memo	;//メモ欄
tag     ;//タイムラインタグ
lbl	    ;//タイムラインラベル
info_	;//セット変更 シート上書き
tool_	;//セット変更 ツールボックス
pref_	;//セット変更 設定パネル
scene_	;//セット変更 ドキュメントパネル
about_	;//セット変更 りまぴんについて
data_	;//
dbg_	;//
winTitle;//ウィンドウタイトル文字列
productStatus	;//制作ステータス 
server-info     ;//
historySelector ;//ヒストリセレクタ
referenceLabel  ;//リファレンスエリアのラベル
importControllers    ;//インポートリードアウトコントロール
*/

//　以下のコードは共用ファイルに分離されたため不要
if((typeof syncTable_remaping == 'undefined')&&(xUI.syncTable)){
xUI.syncTable["xpstImage"] = function(){
    if(xUI.XPS.imgMaster()){
        document.getElementsByClassName("overlayDocmentImage").forEach(function(e){
            e.style.top  = '0px';
            e.style.left = '0px';
            e.style.opacity = 1.0;
        });
    }else if(xUI.XPS.timesheetImages.length){
        
    }
}

xUI.syncTable["server-info"] = function(){
        document.getElementById('headerRepository').innerHTML='<a onclick="serviceAgent.currentRepository.showInformation();" title="'+serviceAgent.currentRepository.owner.handle+'"><b>'+serviceAgent.currentRepository.name+'</b></a>';
};
xUI.syncTable["importControllers"] = function(){
//読み出しコントローラ抑制
    if(
        (serviceAgent.currentStatus=='online-single')&&
        (xUI.XPS.currentStatus.content.indexOf('Active')<0)
    ){
        document.getElementById('updateSCiTarget').disabled=true;
        xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
        xUI.pMenu('pMopenFS','disable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','disable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
    }else{
        document.getElementById('updateSCiTarget').disabled=false;
        xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
        xUI.pMenu('pMopenFS','enable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','enable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
    }
};
xUI.syncTable["recentUsers"] = function(){
//case    "recentUsers":
//ダイアログ類から参照される最近のユーザリスト
    var rcuList = "";
    for (var i=0;i<xUI.recentUsers.length;i++){
        rcuList += '<option value="';
        rcuList += xUI.recentUsers[i].toString();
        rcuList += xUI.currentUser.sameAs(xUI.recentUsers[i])?'" selected=true >':'">';
    }
    if(document.getElementById('recentUsers')) document.getElementById('recentUsers').innerHTML = rcuList;
};
xUI.syncTable["editLabel"] = function(){
//XPS編集エリアのラベル更新
/*
タイトルテキストは
    IDFをすべて
ラベル表示
    jobName
*/
    var myIdf  =Xps.getIdentifier(xUI.XPS);
    var editLabel = xUI.XPS.job.name;
    var editTitle = decodeURIComponent(myIdf);
// ラベルをすべて更新
    $("th").each(function(){
        if(this.id=='editArea'){
            this.innerHTML =(this.innerHTML == 'Animation')? editLabel:'Animation';
            this.title     = editTitle;
        };
    });
};
xUI.syncTable["referenceLabel"] = function(){
//referenceXPSエリアのラベル更新
/*
    リファレンスが編集中のデータと同エントリーでステージ・ジョブ違いの場合はissueの差分表示を行う。
タイトルテキストは
    同ステージのジョブなら    jobID:jobName
    別ステージのジョブならば  stageID:stageName//jobID:jobName
    別ラインのジョブならば    lineID:lineName//stageID:stageName//jobID:jobName
    別カットならば  IDFをすべて
ラベル表示は上記の1単語省略形で
    同ステージのジョブなら    jobName
    別ステージのジョブならば  stageName
    別ラインのジョブならば    lineName
    別カットならば  cutIdf(Xps.getIdentifier(true))
*/
    var myIdf  =Xps.getIdentifier(xUI.XPS);
    var refIdf =Xps.getIdentifier(xUI.referenceXPS);
    var refDistance = Xps.compareIdentifier(myIdf,refIdf);
    if(refDistance < 1){
        var referenceLabel = "noReferenece";//xUI.referenceXPS.getIdentifier(true);
        var referenceTitle = decodeURIComponent(refIdf);
    }else if(refDistance == 1){
        var referenceLabel = xUI.referenceXPS.line.name;
        var referenceTitle = [
            xUI.referenceXPS.line.toString(true),
            xUI.referenceXPS.stage.toString(true),
            xUI.referenceXPS.job.toString(true)
        ].join('//');
    }else if(refDistance == 2){
        var referenceLabel = xUI.referenceXPS.stage.name;
        var referenceTitle = [
            xUI.referenceXPS.stage.toString(true),
            xUI.referenceXPS.job.toString(true)
        ].join('//');
    }else if(refDistance >= 3){
        var referenceLabel = xUI.referenceXPS.job.name;
        var referenceTitle = xUI.referenceXPS.job.toString(true);
    }
// ラベルをすべて更新
    $("th").each(function(){
        if(this.id=='rnArea'){
            this.innerHTML = (this.innerHTML == referenceLabel)? 'Referenece' : referenceLabel;
            this.title     = referenceTitle;
        };
    });
};
xUI.syncTable["historySelector"] = function(){
    var currentIdentifier = (xUI.uiMode == 'production')? Xps.getIdentifier(xUI.referenceXPS):Xps.getIdentifier(xUI.XPS);
    var currentEntry = serviceAgent.currentRepository.entry(currentIdentifier);
    if(currentEntry){
        var myContentsLine ='';
        var myContentsStage='';var stid=-1;
        var myContentsJob  ='';
        for (var ix=currentEntry.issues.length-1;ix >= 0;ix--){
            var matchResult=Xps.compareIdentifier(currentEntry.issues[ix].identifier,currentIdentifier);
            if(decodeURIComponent(currentEntry.issues[ix][2]).split(":")[0] == 0){stid=ix-1}
            if((stid == ix)||(ix == (currentEntry.issues.length-1))){
                if(matchResult>4){
                    myContentsStage += '<li><span id="'+currentEntry.issues[ix].identifier+'" ' ;
                    myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
                    myContentsStage += 'class="pM">*';
                    myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
                    myContentsStage += '</span></li>'
                }else{
                    myContentsStage += '<li><a id="'+currentEntry.issues[ix].identifier+'" ' ;
                    myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
                    myContentsStage += 'href="javascript:void(0)" ';
                    myContentsStage += 'onclick="serviceAgent.getEntry(this.id)"> ';
                    myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
                    myContentsStage += '</a></li>'
                }
            }
/*
            if(matchResult>2){
                myContentsJob += '<option value="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'"' ;
                myContentsJob += (matchResult>4)?
                    'selected >':' >';
                myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"/"+currentEntry.issues[ix][3];
                myContentsJob += '</option>'
            }
*/
            if(matchResult>2){
                myContentsJob += '<option value="'+currentEntry.issues[ix].identifier+'"' ;
                myContentsJob += (matchResult>4)?
                    'selected >':' >';
                myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"//"+currentEntry.issues[ix][3];
                myContentsJob += '</option>'
            }
            
        }
        document.getElementById('pMstageList').innerHTML=myContentsStage;
        document.getElementById('jobSelector').innerHTML=myContentsJob;
    }
};
xUI.syncTable["productStatus"] = function(){
	document.getElementById('documentIdf').innerHTML  = decodeURIComponent(Xps.getIdentifier(xUI.XPS));

	document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.toString(true);
	document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.toString(true);

//	document.getElementById('pmcui_stage').innerHTML = '<option value="'+Xps.getIdentifier(xUI.XPS)+'" selected >'+ xUI.XPS.stage.toString(true) +'</option>';
	
//	document.getElementById('pmcui_job').innerHTML   = xUI.XPS.job.toString(true);
//	document.getElementById('pmcui_status').innerHTML= decodeURIComponent(xUI.XPS.currentStatus);
    document.getElementById('jobSelector').innerHTML =
        '<option value="'+Xps.getIdentifier(xUI.XPS)+'" selected >'+[xUI.XPS.job.toString(true),decodeURIComponent(xUI.XPS.currentStatus)].join('//') +'</option>';
//	document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus.toString();
	document.getElementById('headerInfoWritable').innerHTML= (xUI.viewOnly)?'[編集不可] ':' ';
    if (xUI.viewOnly){
	document.getElementById('pmcui_documentWritable').innerHTML= '[編集不可] ';
    $('#documentWritable').show();
    }else{
	document.getElementById('pmcui_documentWritable').innerHTML= ' ';
    $('#documentWritable').hide();
    }
	document.getElementById('headerInfoWritable').innerHTML += String(xUI.sessionRetrace);
	document.getElementById('pmcui_documentWritable').innerHTML += String(xUI.sessionRetrace);
	switch (xUI.uiMode){
		case 'production':
	document.getElementById('pmcui').style.backgroundColor = '#bbbbdd';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusEdit);
	break;
		case 'management':
	document.getElementById('pmcui').style.backgroundColor = '#ddbbbb';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusAdmin);
	break;
		case 'browsing':
	document.getElementById('pmcui').style.backgroundColor = '#bbddbb';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
	break;
	    default:;// floating and other
	document.getElementById('pmcui').style.backgroundColor = '#dddddd';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
	}
//読み出しコントローラ抑制
    if(
        (serviceAgent.currentStatus=='online-single')&&
        (xUI.XPS.currentStatus.content.indexOf('Active')<0)
    ){
        document.getElementById('updateSCiTarget').disabled=true;
        xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
        xUI.pMenu('pMopenFS','disable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','disable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
    }else{
        document.getElementById('updateSCiTarget').disabled=false;
        xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
        xUI.pMenu('pMopenFS','enable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','enable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
    }
};
xUI.syncTable["fct"] = function(){
//フレームの移動があったらカウンタを更新
	document.getElementById("fct0").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1],0,xUI.XPS.framerate);
	document.getElementById("fct1").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1],0,xUI.XPS.framerate);
};
xUI.syncTable["lvl"] = function(){
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
	//フォーカスのあるトラックの情報を取得
	if (xUI.Select[0]>0 && xUI.Select[0]<xUI.XPS.xpsTracks.length){
		var label=xUI.XPS.xpsTracks[xUI.Select[0]]["id"];
		var bmtd=xUI.XPS.xpsTracks[xUI.Select[0]]["blmtd"];
		var bpos=xUI.XPS.xpsTracks[xUI.Select[0]]["blpos"];
		var stat=(xUI.XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))?
		false:true;
	}else{
		var label=(xUI.Select[0]==0)? "台詞":"メモ";//
		var bmtd=xUI.blmtd;
		var bpos=xUI.blpos;
		var stat=true;
	}

	document.getElementById("activeLvl").value=label;
	document.getElementById("activeLvl").disabled=stat;
	//現在タイムリマップトラック以外はdisable  将来的には各トラックごとの処理あり
	document.getElementById("blmtd").value=bmtd;
	document.getElementById("blpos").value=bpos;
	document.getElementById("blmtd").disabled=stat;
	document.getElementById("blpos").disabled=stat;
	if(! document.getElementById("blpos").disabled) chkPostat();
};
xUI.syncTable["spinS"] = function(){
	document.getElementById("spinCk").checked       = xUI.spinSelect;
    document.getElementById('spinSlider').innerText = (xUI.spinSelect)? '連動' : '';
};
xUI.syncTable["ipMode"] = function(){
	document.getElementById("iptChange").value     = xUI.ipMode;
	$("#iptChange").css('background-color',["#eee","#ddd","#ccc"][xUI.ipMode]);
    document.getElementById('iptSlider').innerText = ['','動画','原画'][xUI.ipMode];
    $('#iptSlider').css('left',["1px","22px","44px"][xUI.ipMode]);
};
xUI.syncTable["title"] = function(){
    var titleStyle=0;
	if(config.useworkTitle && workTitle[xUI.XPS["title"]]){
        if(workTitle[xUI.XPS["title"]].linkURL){
	        var linkURL=workTitle[xUI.XPS["title"]].linkURL;
	        var titleText=(workTitle[xUI.XPS["title"]].titleText)?  workTitle[xUI.XPS["title"]].titleText:workTitle[xUI.XPS["title"]].linkURL;
	        titleStyle += 1;
        }
        if(workTitle[xUI.XPS["title"]].imgSrc){
	        var imgSrc=workTitle[xUI.XPS["title"]].imgSrc;
	        var ALTText=(workTitle[xUI.XPS["title"]].ALTtext)?
	        workTitle[xUI.XPS["title"]].ALTtext:workTitle[xUI.XPS["title"]].imgSrc;
	        titleStyle += 10;
        }
        switch(titleStyle){
        case 11:	;//画像ありリンクあり
	        var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\"  target=_new><img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0></a>";
	    break;
        case 10:	;//画像のみ
	        var titleString="<img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0>";
	    break;
        case 1:		;//画像なしリンクあり
	        var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\" target=_new>"+xUI.XPS["title"]+" </a>";
	    break;
        default:
	        var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
        };
	}else{
    	var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
	}
//
	if(document.getElementById("title")) document.getElementById("title").innerHTML=titleString;
    if(xUI.viewMode != "Compact"){
	    for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		    document.getElementById("title"+pg).innerHTML=titleString+"/"+xUI.XPS.subtitle;
        }
	}
    document.getElementById("XpsIdentifier").innerHTML=decodeURIComponent(Xps.getIdentifier(xUI.XPS,'cut'));
};
xUI.syncTable["product"] = function(prop){
//case	"opus":	;
//case	"subtitle":	;
	if(document.getElementById(prop)) document.getElementById(prop).innerHTML=(xUI.XPS[prop])? xUI.XPS[prop] : "";
    xUI.sync("title");
};
xUI.syncTable["create_time"] = function(){
//case	"create_time":	;
//case	"update_time":	;//?これは要らない
	document.getElementById("create_time").innerTEXT=
	(xUI.XPS["create_time"])? xUI.XPS["create_time"] : "";
if(xUI.viewMode != "Compact"){
	for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		document.getElementById("create_time"+pg).innerHTML=(xUI.XPS["create_time"])? xUI.XPS["create_time"] : "<br />";
}
	}
};
xUI.syncTable["update_user"] = function(){
	document.getElementById("update_user").innerHTML=	(xUI.XPS["update_user"])?
	(xUI.XPS["update_user"].toString()).split(':')[0] : "<br />";
if(xUI.viewMode != "Compact"){
	for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		document.getElementById("update_user"+pg).innerHTML=(xUI.XPS["update_user"])? (xUI.XPS["update_user"].toString()).split(':')[0] : "<br />";
    }
}
//case	"create_user":	;
//case    "current_user": ;
    document.getElementById("current_user_id").value=xUI.currentUser.email;
};
xUI.syncTable["sci"] = function(){
//case	"scene":;
//case	"cut":;
	var scn= xUI.XPS["scene"]	; 
	var cut= xUI.XPS["cut"]	;
	
	var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
	document.getElementById("scene_cut").innerHTML=myValue;
    if(xUI.viewMode !="Compact"){
	    for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		    document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
        }
	}
};
xUI.syncTable["winTitle"] = function(){
//case	"winTitle":	;
};
xUI.syncTable["framerate"] = function(){
//case	"framerate":
};
xUI.syncTable["time"] = function(){
//case	"time":	;//時間取得
	var timestr=nas.Frm2FCT(xUI.XPS.time(),3,0,xUI.XPS.framerate);
	document.getElementById("time").innerHTML=timestr;
if(xUI.viewMode !="Compact"){
	for(var pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
		document.getElementById("time"+pg).innerHTML=(timestr)? timestr : "<br />";
}
	}
};
xUI.syncTable["transition"] = function(prop){
//case	"trin":	;
//case	"trout":	;
	var timestr=nas.Frm2FCT(xUI.XPS[prop].time,3,0,xUI.XPS.framerate);
	var transit=xUI.XPS[prop].name;
	document.getElementById(prop).innerHTML=
	(xUI.XPS[prop].time == 0)? "-<br/>" : " ("+timestr+")";
	var myTransit="";
	if(xUI.XPS.trin.time > 0){
		myTransit+="△ "+xUI.XPS.trin.name+'('+nas.Frm2FCT(xUI.XPS.trin.time,3,0,xUI.XPS.framerate)+')';
	}
	if((xUI.XPS.trin.time > 0)&&(xUI.XPS.trout.time > 0)){	myTransit+=' / ';}
	if(xUI.XPS.trout.time > 0){
	myTransit+="▼ "+xUI.XPS.trout.name +'('+nas.Frm2FCT(xUI.XPS.trout.time,3,0,xUI.XPS.framerate)+')';
	}
	document.getElementById("transit_data").innerHTML=myTransit;
};
xUI.syncTable["memo"] = function(){
//case	"memo":
	var memoText=xUI.XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
	document.getElementById("memo").innerHTML=memoText;
	if(document.getElementById("memo_prt")){document.getElementById("memo_prt").innerHTML=memoText;}
};
xUI.syncTable["tag"] = function(){
//case	"tag":	;
//case	"lbl":	;
//ラベルとタグは　UNDOの対処だが…
    xUI.resetSheet(); 
};
xUI.syncTable["info_"] = function(){
//case	"info_":	;//セット変更
    setTimeout(function(){xUI.sync('historySelector')},10);
	var syncset=
["opus","title","subtitle","time","trin","trout","scene","update_user","productStatus"];
//["opus","title","subtitle","time","trin","trout","scene","update_user","memo"];
	for(var n=0;n<syncset.length;n++) xUI.sync(syncset[n]);
};
xUI.syncTable["tool_"] = function(){
//case	"tool_":	;//セット変更
	var syncset=["fct","lvl","undo","redo","spinS"];
	for(var n=0;n<syncset.length;n++)xUI.sync(syncset[n]);
};
xUI.syncTable["pref_"] = function(){
//case	"pref_":	;//セット変更	
};
xUI.syncTable["scene_"] = function(){
//case	"scene_":	;//セット変更
};
xUI.syncTable["data_"] = function(){
//case	"data_":	;
};
xUI.syncTable["dbg_"] = function(){
//case	"dbg_":	;
};
xUI.syncTable["NOP_"] = function(){
//case	"NOP_":	;
};
}else{
console.log('uiTable old code skiped');
};// syncTableを別ファイルに分離したためこのコードは不要

function syncInput(entry){
	if((xUI.noSync)||(xUI.viewOnly)) return;
//カーソル入力同期
//		表示更新
	if (document.getElementById("iNputbOx").value != entry)
	document.getElementById("iNputbOx").value = entry;
	var htmlEntry = xUI.trTd(entry);
	if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML!= htmlEntry)
		document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML=(entry=="")?"<br>":htmlEntry;
	var paintColor=(xUI.eXMode>=2)?xUI.inputModeColor.EXTENDeddt:xUI.inputModeColor.NORMALeddt;
	if (! xUI.edchg) paintColor=xUI.selectedColor;
	if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor!=paintColor)
		document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor=paintColor;
}

/*						----- io.js
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
*/
/*
	メモ欄用単語セレクタ
*/
function putMyWords(){
	var myResult="<table>";
	for(var idx=0;idx<config.myWords.length;idx++){
		myResult+="\n<td>";
		for(var idxw=0;idxw<config.myWords[idx].length;idxw++){
		    var buttonValue = config.myWords[idx][idxw];
			if(idx == (config.myWords.length-1)){
                if(buttonValue.match( /\%/ )){
                    buttonValue = buttonValue.replace(/\%stage\%/g,xUI.XPS.stage.name);
                    buttonValue = buttonValue.replace(/\%user\%/g,xUI.currentUser.handle);
                    buttonValue = buttonValue.replace(/\%date\%/g,new Date().toLocaleDateString());
                };
			    myResult+="<input type=button class='toolTip sig' value=\""+buttonValue+"\"><br>";
			}else{
			    myResult+="<input type=button class=toolTip value=\""+buttonValue+"\"><br>";
			};
		};
		myResult+="\n</td>";
	}
	myResult+="\n</table>";
	return myResult;
}
/**
    テキストエリアに値を挿入する編集メソッド
    クリックの発生したエレメントの値 をinsertTargetのinsertメソッドに渡しフォーカスを移す
*/
var editMemo = function(e,insertTarget){
	var myTarget=e.target;
	if(
	    (myTarget instanceof HTMLInputElement)||
	    (myTarget instanceof HTMLButtonElement)
    ){
	    var myValue=(myTarget.value)?myTarget.value:myTarget.innerHTML;
	    if(myTarget.classList.contains('sig')){
	        if(insertTarget.value.indexOf("sig.")<0){
	            insertTarget.value = "sig. "+ myValue +"\n<hr>"+ insertTarget.value;
	        }else{
	            var isp = insertTarget.value.indexOf('\n');
	            insertTarget.setSelectionRange(isp,isp);
	            insertTarget.insert(myValue);
	        };
	    }else{
	        insertTarget.insert(myValue);
	    };
	    insertTarget.focus();
	};
}
/**
	AEキー書き出し
	現状ではタイミングタイムラインだけが変換対象
*/
function writeAEKey(n){
if(! n){n=xUI.Select[0]; }
		document.getElementById("AEKrEsult").value=XPS2AEK(xUI.XPS,n-1);
		if(appHost.platform != "Safari") document.getElementById("AEKrEsult").focus();
		if((appHost.platform=="AIR")&&(air.Clipboard)){
//AIRだった場合はここでクリップボードへ転送
			writeClipBoard(XPS2AEK(xUI.XPS,n-1));
		}else{
//ブラウザの場合もコピーにトライ
            if(navigator.clipboard){
                navigator.clipboard.writeText(document.getElementById("AEKrEsult").value);
            }
            if(document.getElementById('opnAEKpnl').checked){
//リザルトエリアが表示されていない場合表示させる。
	            if (! $("#optionPanelAEK").is(':visible')){xUI.sWitchPanel("AEKey");}
			    document.getElementById("AEKrEsult").select();
			    if(document.execCommand) document.execCommand("copy");
			}
		}
	return document.getElementById("AEKrEsult").value;
}


//リスト展開プロシージャ
/**
    @params  {String}   ListStr
            ソース文字列
    @params  {Boolean}  rcl
            再帰呼出しフラグ
    @returns    {String}
            putメソッド入力引数ストリーム

	マクロ記法の文字列をputメソッドに引き渡し可能なストリームへ展開する
	リスト展開エンジンは汎用性を持たせたいので、無理やりグローバルに置いてある。
	要注意
	戻り値の形式は  "1,,2,,3,,4,,5"等のスピン展開後のカンマ区切りテキストストリーム
	スイッチを解釈してリスト展開時に文字の入れ替えフィルタリングを行う
	展開時のトラックを取得する必要あり
    リスト展開はxUIのメソッドに移行予定
*/
	var expd_repFlag	= false	;
	var expd_skipValue	= 0	;//グローバルで宣言

// リスト展開はxUIのメソッドか?
function nas_expdList(ListStr,rcl){
	if(typeof rcl=="undefined"){rcl=false}else{rcl=true};
	var leastCount=(xUI.Selection[1])? xUI.Selection[1]:xUI.XPS.duration()-xUI.Select[1];
	if(!rcl){
		expd_repFlag=false;
		expd_skipValue=xUI.spinValue-1;
	//再帰呼び出し以外はスピン値で初期化
	};
//(スキップ量はスピン-１)この値はグローバルの値を参照
	var SepChar="\.";

//カメラワークトラックの値を展開
	if (
		((xUI.Select[0]<(xUI.XPS.xpsTracks.length-1))&&
		(xUI.XPS.xpsTracks[xUI.Select[0]].option=="camera"))
	){
        if(ListStr.match(/^\\(.+)$/)){
            ListStr = RegExp.$1;
            console.log(ListStr);
            var myWork = new nas.AnimationCamerawork(null,ListStr);
            console.log(myWork)
            var minimumLength = myWork.getStream(1).length;
            var sectionLength= (xUI.Selection[1])? (xUI.Selection[1]+1):minimumLength * xUI.spinValue;
            if(sectionLength < minimumLength) sectionLength = minimumLength;
            ListStr= myWork.getStream(sectionLength).join(',');
            return ListStr;
        }
	}
	
//	台詞トラックの場合、カギ括弧・引用符の中をすべてセパレートして戻す
//  ダイアログトラックは固定ではなくなったので判定を変更
//  コメントトラックを排除する必要あり	
//この判定をxUIに依存すると汎用性がなくなるので、コール側で引数渡しに変更する必要あり？
	if (
		((xUI.Select[0]<(xUI.XPS.xpsTracks.length-1))&&
		(xUI.XPS.xpsTracks[xUI.Select[0]].option=="dialog"))
	){
        if(ListStr.match(/[\"\'「]/)){
            console.log(ListStr);
            var mySound = new nas.AnimationDialog(null,ListStr);
//            mySound.parseContent();//パーサの起動は不要
            console.log(mySound)
            var sectionLength= xUI.spinValue * (mySound.bodyText.length + mySound.comments.length);
            ListStr= mySound.getStream(sectionLength).join(',');
            return ListStr;
        }
/*
    201801変更
    ダイアログの展開をオブジェクトメソッドに移行
    引数がシナリオ形式であること  ListStr.indexOf("「")>0
    スピンの量をみて展開範囲を得る
if (ListStr.match(/「([^「]*)」?/)) ;
if (ListStr.match(/「(.+)」?/)) {
//alert("Hit ："+ListStr.match(/^(.*「)([^」]*)(」?$)/));
	ListStr=d_break(ListStr.match(/^(.*「)([^」]*)(」?$)/));
	ListStr=ListStr.replace(/「/g,SepChar+"「"+SepChar);//開き括弧はセパレーション
}
	ListStr=ListStr.replace(/\」/g,"---");//閉じ括弧は横棒
	ListStr=ListStr.replace(/\、/g,"・");//読点中黒
	ListStr=ListStr.replace(/\。/g,"");//句点空白(null)
	ListStr=ListStr.replace(/\ー/g,"｜");//音引き縦棒
	ListStr=ListStr.replace(/〜/g,"⌇");//音引き縦棒
*/
	};
//ダイアログトラック以外はカギカッコ開くまたは引用符で開始される引数は、先頭文字を払ってコマ単位で縦に展開して戻す
if(ListStr.match( /^[\'\"「](.+)/)){    return (RegExp.$1).replace(/./g,"$&,"); };
//		r導入リピートならば専用展開プロシージャへ渡してしまう
		if (ListStr.match(/^([\+rR])(.*)$/)){
			var expdList=TSX_expdList(ListStr);
			expd_repFlag=true;
		}else{

//		リスト文字列を走査してセパレータを置換
	ListStr=ListStr.replace(/[\,\x20]/g,SepChar);
//		スラッシュを一組で括弧と置換(代用括弧)
	ListStr=ListStr.replace(/\/(.*)(\/)/g,"\($1\)");//コメント引数注意
//		var PreX="/\(\.([1-9])/g";//括弧の前にセパレータを補う
	ListStr=ListStr.replace(/\(([^\.])/g,"\(\.$1");
//		var PostX="/[0-9](\)[1-9])/";//括弧の後にセパレータを補う
	ListStr=ListStr.replace(/([^\.])(\)[1-9]?)/g,"$1\.$2");

//		前処理終わり
//		リストをセパレータで分割して配列に
	var srcList=new Array;
		srcList=ListStr.toString().split(SepChar);

	var expdList= new Array;//生成データ配列を作成

	var sDepth=0;//括弧展開深度/初期値0
	var StartCt=0;var EndCt=0;

//		元配列を走査
	var ct=0;//関数ローカルスコープにするために宣言する
	for(var ct=0;ct<srcList.length;ct++){
	var tcn=srcList[ct];
//		トークンが開きカギ括弧の場合リザルトに積まないで
//		リザルトのおしまいの要素を横棒にする。
	if (tcn=="「") {y_bar();continue;}

//		トークンがコントロールワードならば値はリザルトに積まない
//		変数に展開してループ再開
	if (tcn.match(/^s([1-9][0-9]*)$/)){
		expd_skipValue=(RegExp.$1*1>0)? (RegExp.$1*1-1):0;
		continue;
	}
//		トークンが開き括弧ならばデプスを加算して保留
	if (tcn.match(/^(\(|\/)$/)){
		sDepth=1;StartCt=ct;
//		トークンを積まないで閉じ括弧を走査
		var ct2=0;//ローカルスコープにするために宣言する
		for(var ct2=ct+1;ct2<srcList.length;ct2++){
	        if (srcList[ct2].match(/^\($/)){sDepth++}
	        if (srcList[ct2].match(/^(\)|\/)[\*x]?([0-9]*)$/)){sDepth--}
			if (sDepth==0){
			    EndCt=ct2;
//	最初の括弧が閉じたので括弧の繰り返し分を取得/ループ
			    var rT = RegExp.$2 * 1 ;if(rT<1) rT = 1;
			    if(RegExp.$2=="") expd_repFlag=true;
			    var ct3=0;//関数スコープにするために宣言する
			    for(ct3=1;ct3<=rT;ct3++){
			        if((StartCt+1)!=EndCt){
//console.log("DPS= "+sDepth+" :start= "+StartCt+"  ;end= "+EndCt +"\n"+ srcList.slice(StartCt+1,EndCt).join(SepChar)+"\n\n-- "+rT);
                        var rca = nas_expdList(
                                srcList.slice(StartCt+1,EndCt).join(SepChar),
                                "Rcall"
                        );
                        expdList = expdList.concat(rca.split(','));
//括弧の中身を自分自身に渡して展開させる
//展開配列が規定処理範囲を超過していたら処理終了
	                    if(expdList.length >= leastCount) return expdList.join(",");
                    }
			    }
			    ct=EndCt;break;
			}//if block end
		}//ct2 loop end
		if(rT==0){
			expdList.push(srcList[ct]);s_kip();//ct++;
		}
	}else{
//	トークンが展開可能なら展開して生成データに積む
			if (tcn.match(/^([1-9]{1}[0-9]*)\-([1-9]{1}[0-9]*)$/))
			{
	var stV=Math.round(RegExp.$1*1) ;var edV=Math.round(RegExp.$2*1);
		if (stV<=edV){
	for(var tcv=stV;tcv<=edV;tcv++){expdList.push(tcv);s_kip();}
		}else{
	for(var tcv=stV;tcv>=edV;tcv--){expdList.push(tcv);s_kip();}
		}
			}else{
	expdList.push(tcn);s_kip();
			}
	}
}
	}
//	生成配列にスキップを挿入
function s_kip(){ for(var x=0;x<expd_skipValue;x++) expdList.push('');}
//	配列の末尾を横棒に
function y_bar(){ expdList.pop(); expdList.push('---');}
//	かぎ括弧の中身をセパレーション
function d_break(dList){ wLists=dList.toString().split(","); return wLists[1]+wLists[2].replace(/(.)/g,"$1\.")+wLists[3];}
// カエス
	if ( expdList.length < leastCount && expd_repFlag ){
			var blockCount = expdList.length;
//			alert(blockCount + " / " +leastCount);
			for(var resultCt=0; resultCt <= (leastCount-blockCount); resultCt++){
				expdList.push(expdList[resultCt % blockCount]);
			}
		}
		return expdList.join();//文字列で戻す
}
/**
	Xps オブジェクトから データテキストを保存用ウィンドウに出力
    @params     {Object Xps}    obj
    @returns    {Boolean}
        false(リンクでアクセスするので動作抑制用)
        xpsSourceText(AIR等のAdobe環境下ではXpsテキストを戻す)
*/
function writeXPS(obj)
{
	if(! nas.isAdobe){
		if(true){xUI.setStored("current"); xUI.sync();};//書き出すのでフラグリセット(ブラウザのみ)
		_w=window.open ("","xpsFile","width=480,height=360,scrollbars=yes,menubar=yes");

		_w.document.open("text/plain");
		if(appHost.platform != "Mozilla") _w.document.write("<html><body><pre>");
		_w.document.write(obj.toString());
		if(appHost.platform != "Mozilla") _w.document.write("</pre></body></html>");
		_w.document.close();
		_w.window.focus();//書き直したらフォーカス入れておく

		return false;//リンクのアクションを抑制するためにfalseを返す
	}else{
		return obj.toString();
	};
}

/**
	XPSデータを印刷および閲覧用htmlに変換
引数：
    mode    動作モード
true時はhtmlをそのまま文字列でリザルトするがfalseの際は別ウィンドウを開いて書き出す
"body-only"  で<body>タグ内のHTML本体のみを返す
    form    出力前加工　"action"で、アクションシート相当の加工を施す
*/
function printHTML(mode,form){
if(! form) form = '';

if(form == 'action'){
    var backupPoint = xUI.activeDocument.undoBuffer.undoPt;
    var mainXps = new Xps();
    var backupXps = new Xps();
    var backupRef  = new Xps();
    mainXps.parseXps(xUI.XPS.toString());
    backupXps.parseXps(xUI.XPS.toString());
    backupRef.parseXps(xUI.referenceXPS.toString());
    for (var tr = 0 ; tr < mainXps.xpsTracks.length ; tr++){
        if(mainXps.xpsTracks[tr].option.match( /cell|timing|replacement/ )) mainXps.put([tr,0],new Array(mainXps.xpsTracks.duration));
    }
    xUI.resetSheet(mainXps,backupXps);  
}
/*
    画像パーツの転送を行うかまたは、自分自身でレンダリングできるようにする必要あり
    エンドマーカーの配置も必要 0814
 */

if(! mode){mode=false;}
var myBody="";

//body-only時省略分
    if(mode!='body-only'){
myBody+='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">';
myBody+='<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>';
myBody+=xUI.XPS.scene.toString()+xUI.XPS.cut.toString();
// myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping.js/template/printout.css">';
if((xUI.onSite)&&(window.location.href.indexOf(serviceAgent.currentRepository.url)>=0)){
    myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="/remaping/template/printout.css">';//for TEST onSite
    var libOffset = '/remaping/'
}else{
    var myAddress = window.location.href;
    if (myAddress.match(/(.+\/)(\S+\.html?$)/i)) myAddress = RegExp.$1;
    myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="'+myAddress+'template/printout.css">';//for TEST offSite
    var libOffset = './'   
}

/*
if(String(location).indexOf('https')!=0){
myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping.js/template/printout.css">';//for TEST onWeb
}else{
myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="https://nekomataya.sakura.ne.jp/test/remaping.js/template/printout.css">';//for TEST on https
}
*/
/* ライブラリロード */
myBody+='<script src="'+libOffset+'lib/jquery.js"></script>';
myBody+='<script src="'+libOffset+'lib/jquery-ui.js"></script>';
myBody+='<script src="'+libOffset+'lib/ecl/ecl.js"></script>';
myBody+='<script src="'+libOffset+'config.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/nas_common.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/nas_common_HTML.js"></script>';
myBody+='<script src="'+libOffset+'nas/newValueConstractors.js"></script>';
myBody+='<script src="'+libOffset+'nas/pmio.js"></script>';
myBody+='<script src="'+libOffset+'nas/configPM.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/mapio.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/xpsio.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/airUI.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/cameraworkDescriptionDB.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/remaping.js"></script>';


myBody += '<script>replaceEndMarker=function (){{if(! document.getElementById("endMarker")) return;    if (typeof endPoint == "undefined"){   try{    var endPoint = [xUI.XPS.xpsTracks.length, xUI.XPS.xpsTracks.duration];   }catch(er){return;}    }    if(!(endPoint instanceof Array)) {endPoint=[xUI.XPS.xpsTracks.length,endPoint]};    var endCellLeft  = $("#"+[0,endPoint[1]-1].join("_"));    var endCellRight = $("#"+[endPoint[0]-1,endPoint[1]-1].join("_"));    var parentSheet  = $(document.getElementById("endMarker").parentNode);    var topMargin  = $(document.getElementById("fixedHeader")).height();    var endCellLeftOffset  = endCellLeft.offset();    var endCellRightOffset = endCellRight.offset();    var parentOffset   = parentSheet.position();    var markerTop    = endCellLeftOffset.top + endCellLeft.height() -topMargin;    var markerLeft   = endCellLeftOffset.left - parentOffset.left;    var markerWidth  = endCellRightOffset.left + endCellRight.width() - endCellLeftOffset.left;   $("#endMarker").css({"top":markerTop,"left":markerLeft,"width":markerWidth });document.getElementById("endMarker").innerHTML = ":: end ::";};resizePage2Paper=function(){var areaHeight = 1250;xUI.adjustScale([1,1]); var pgRect=document.getElementById("printPg1").getBoundingClientRect(); xUI.adjustScale([1,areaHeight/pgRect.height]);};</script>';
//myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="./template/printout.css">';
myBody+='<style type="text/css"> * { margin: 0; padding: 0;} #fixed {position: fixed;} #sheet_view {  margin:0; }</style></head>';//

myBody+='<body ';//"
myBody+= 'onload="var nRS = setTimeout(\'nas_Prt_Startup(function(){xUI.syncSheetCell();xUI.syncSheetCell(undefined,undefined,true);xUI.Cgl.refresh();})\',10);" ';//
//myBody+= 'onload="var nRS = setTimeout(\'nas_Prt_Startup(function(){xUI.syncSheetCell();xUI.syncSheetCell(undefined,undefined,true);xUI.Cgl.refresh();window.print();window.close();})\',10);" ';//
myBody+='" >';//
    };//ここまでbody-only時は省力

myBody+='<textarea id="startupContent" >';
myBody+= xUI.XPS.toString();
myBody+='</textarea>';
myBody+='<textarea id="startupReference">';
myBody+= xUI.referenceXPS.toString();
myBody+='</textarea>';
myBody+='<div id="sheet_body">';//

	for(var Page=1 ;Page <=Math.ceil(xUI.XPS.duration()/xUI.PageLength);Page++)
	{
	    myBody+= '<div class=printPage id=printPg'+String(Page)+'>';
	    myBody+= '<div class=headerArea id=pg'+String(Page)+'Header>';
		myBody+= xUI.headerView(Page);
		myBody+= '<span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br></div>';
	// myBody+= '<div class="tableArea"  id=pg'+String(Page)+'Table>';
		myBody+= xUI.pageView(Page);
	//myBody+= '</div></div>'
	    myBody+= '</div>'
	};
//myBody+='<div class="screenSpace"></div>';



myBody+='</div>';

if(mode != 'body-only') myBody+='</body></html>';

if(mode){return myBody;}else{
_w=window.open ("","xpsFile","width=1120,height=1600,scrollbars=yes,menubar=yes");

	_w.document.open("text/html");
	_w.document.write(myBody);
	_w.document.close();

	_w.window.focus();//書き直したらフォーカス入れておく 保存扱いにはしない
//アクション処理の際はバックアップを復帰・本体はUNDOバッファで戻す
    if(form == 'action')    xUI.resetSheet(backupXps,backupRef);  

	return false;//リンクのアクションを抑制するためにfalseを返す
}

}
/*
	File API を使用したデータの読み込み（ブラウザでローカルファイルを読む）
	File API  は、Chrome Firefoxではローカルファイルの読み出し可能だが、
	IE,Safari等他の環境では、情報取得のみ可能
	File.nameは、ブラウザではパスを含まないファイル名（＋拡張子）のみ。
	ただし、AIR環境ではフルパスのローカルFSパスが戻る。
	同じI.FをAIR環境でも使用するために、ケース分岐する。

    印刷環境ではファイルの入出力自体をサポートしないのでイベントリスナの設定をスキップする
    id="myCurrentFile"のエレメントの有無で判定
*/
window.addEventListener('DOMContentLoaded', function() {
// ファイルが指定されたタイミングで、その内容を表示
    if(document.getElementById("myCurrentFile")){
        document.getElementById("myCurrentFile").addEventListener('change', function(e){
            xUI.importBox.read(this.files,processImport)},
            true
        );//myCrrentFile.addEvent
    }
});//window.addEvent

/*
りまぴん用インポート処理関数
トリガーはファイルトレーラーの変更
複数ファイルの場合はファイル名でデータを補ってカレントリポジトリに一括送信（管理モードでのみ実行）
単一ファイルはデータウエルに読み込む
    ユーザ選択追加処理として以下のマトリクスで分岐

xUI.uiMode
floating    load/Floationg
management  load/Floationg
browsing    load/Floationg setUImode('floationg')
production  import/currentStatus


xUIの状況を確認して必要に従ってimportDocumentを呼ぶ  
 */
/**
 *  @paramas    {boolean}   autoBuffer
 *      
 */
var processImport=function(autoBuffer){
    
    if(typeof autoBuffer == 'undefined') autoBuffer = true;
  if(autoBuffer){
//        コンバート済みデータが格納されている配列はxUI.importBox.selectedContents
    if(xUI.importBox.selectedContents.length > 1){
        for(var dix=0;dix<xUI.importBox.selectedContents.length;dix++){
            console.log(xUI.importBox.selectedContents[dix].getIdentifier());
            console.log(xUI.importBox.selectedContents[dix].toString());
        }
    }else{
        if((document.getElementById('loadTarget').value != 'ref')&&(xUI.uiMode == 'production')&&(xUI.sessionRetrace == 0)){
//インポート時 undoが必要なケースでは xUI.sheetPutに渡す
            xUI.sheetPut(xUI.importBox.selectedContents[0]);
        }else{
//undoリセットが望ましい場合はxUI.resetSheetに渡してリセットする
            if(document.getElementById('loadTarget')=='ref'){
console.log('ref')
                xUI.resetSheet(false,xUI.importBox.selectedContents[0]);
            }else{
console.log('body');
                xUI.resetSheet(xUI.importBox.selectedContents[0]);
            }
        }
    }
  }else{
     var loading=false;
    if(document.getElementById('loadTarget')!='ref'){
console.log('>>body')
        if(xUI.uiMode == 'production'){
            var tempDocument = new Xps();
            tempDocument.readIN=xUI._readIN_xps;
            tempDocument.readIN(xUI.data_well.value);
            if(tempDocument){
                if( (xUI.XPS.xpsTracks.duration != tempDocument.xpsTracks.duration)||
                    (xUI.XPS.xpsTracks.length != tempDocument.xpsTracks.length)
                ) xUI.reInitBody(tempDocument.xpsTracks.length,tempDocument.xpsTracks.duration);
                xUI.selection();xUI.selectCell([0,0]);
                xUI.sheetPut(tempDocument.getRange());
                return ;
            }
        }else{
            loading=xUI.XPS.readIN(xUI.data_well.value);
        }
    }else{
console.log('>>ref')
        loading=xUI.referenceXPS.readIN(xUI.data_well.value);
    }
    if(loading){
        xUI.resetSheet();
    }else{
        return false;
    }
  }
      if(xUI.uiMode=='browsing') {xUI.setUImode('floating')};
}
/*
	テンプレートを利用したeps出力
テンプレートは、サーバ側で管理したほうが良いのだけど  一考

*/
/*
	XPSから出力に必要な本体データを切り出し、1ページづつepsエンコードして返す

	引数は整数  ページナンバー 1から開始
	引数が0 又は引数なしは全ページリザルト
	ページが存在しない場合は空データを返す
*/
var getBodyData = function(myPage){

	var startCount=0;var endCount=xUI.XPS.duration();
	if((myPage > 0 )&&(myPage <= Math.ceil(xUI.XPS.duration()/xUI.PageLength))){
		startCount=(myPage-1)*xUI.PageLength;
		endCount=(endCount>(startCount+xUI.PageLength))?startCount+xUI.PageLength:endCount;
	}else{
		if(myPage > Math.ceil(xUI.XPS.duration()/xUI.PageLength))return "";
	}
	var myBody= new Array();
	for (var frm=startCount;frm<endCount;frm++){
		for(var col=0;col<(xUI.XPS.xpsTracks.length);col++){
		  var currentData=xUI.XPS.xpsTracks[col][frm];
		if (currentData.match(/^[|｜:]$/)){currentData=""}
		  myBody.push("\("+EncodePS2(currentData)+")");
		}
	}
	return myBody.join(" ");
}
/*
	リファレンスXpsから出力に必要なデータを切り出し、epsエンコードして返す
	横幅はリファレンスデータそのまま（コメント省略）
	継続時間が本体データを越えた部分をカットする（返すべきかも？）
	引数はページナンバー  1から開始
	引数が0  又は無ければ全ページを返す
	ページが存在しない場合は空データを返す
 */
var getReferenceData = function(myPage){
	var startCount=0;var endCount=xUI.XPS.duration();
	if((myPage > 0 )&&(myPage <= Math.ceil(xUI.XPS.duration()/xUI.PageLength))){
		startCount=(myPage-1)*xUI.PageLength;
		endCount=(endCount>(startCount+xUI.PageLength))?startCount+xUI.PageLength:endCount;
	}else{
		if(myPage > Math.ceil(xUI.XPS.duration()/xUI.PageLength))return "";
	}
	var myRef= new Array();
	for (var frm=startCount;frm<endCount;frm++){
		for(var col=1;col<=xUI.referenceXPS.xpsTracks.length-1;col++){
			if(frm<xUI.referenceXPS.duration()){
              var currentData=xUI.referenceXPS.xpsTracks[col][frm];
              if (currentData.match(/^[|｜:]$/)){currentData=""}
              myRef.push("\("+EncodePS2(currentData)+")");
//			myRef.push("\("+EncodePS2(xUI.referenceXPS.xpsTracks[col][frm])+")");
			}
		}
	}
	return myRef.join(" ");
}
/*
	epsタイムシートに記載するデータを抽出してdata_wellの内容と置き換える
	エンコード注意


追加プロパティ

FrameRate	XPSから転記
PageRength	ｘUIから転記
PageColumns	xUIから転記
"camColumns"	現在固定  ただしカメラワーク指定可能になり次第xUIから転記

Columns	XPSの値から計算
	各フォーマットごとに規定数あり
	規定数以下なら規定数を確保（読みやすいので）
	規定数をオーバーした際は段組変更を警告
	A3 2段組  規定 6/3 最大8/4
	A3 1段組  規定10/5 最大18/9

トランジションの尺と注釈を転記してない！
MemoTextの前に挿入する  

この部分は epsExporter としてソース分離すべき
*/
var pushEps= function (myTemplate){
//テンプレート取得後に呼び出される。
 myTemplate=decodeURI(myTemplate);
/*====================置換え用データ生成
置き換えのためのキャリアオブジェクトを作成してevalを避ける  13/06/22
*/
	var sWap=[];
//フレームレートのドロップ処理をしていない、ドロップ処置が済むまでは小数点以下のレートは扱わない
	sWap.FileName="";
	sWap.FrameRate=new Number(xUI.XPS.framerate);
if(sWap.FrameRate%1 > 0){return false;}
	sWap.PageLength = xUI.SheetLength;//１ページの秒数（フレーム数にあらず）
	sWap.PageColumns = xUI.PageCols;//シートの段組はxUIを複写
	sWap.ActionColumns =(xUI.referenceXPS.xpsTracks.length < 10)? 8 :XPS.xpsTracks.length-2;

	sWap.DialogColumns =xUI.dialogSpan;//xUIのプロパティを作成するのでそれを参照

	sWap.Columns =(xUI.timingSpan < SheetLayers)? SheetLayers :xUI.timingSpan;//カラム数総計
	sWap.TimingColumns = xUI.timingSpan ;//xUIのプロパティを参照
	sWap.camColumns = (xUI.cameraSpan<CameraworkColumns)?CameraworkColumns:xUI.cameraSpan;//CameraworkColumns ; //現在固定4を標準にしてオーバー分を追加
//sWap.SpanOrder / Cam のビルド
spanWord=({
	still:"StillCellWidth",
	dialog:"DialogCellWidth",
	sound:"DialogCellWidth",
	timing:"CellWidth",
	replacement:"CellWidth",
	geometry:"GeometryCellWidth",
	sfx:"SfxCellWidth",
	effect:"SfxCellWidth",
	camera:"CameraCellWidth"
});

	var SO=[];
	for (var ix=0; ix<sWap.Columns;ix++){
//	for (var ix=0; ix<sWap.TimingColumns;ix++){}
		if(ix<xUI.timingSpan){
		  SO.push( spanWord[xUI.XPS.xpsTracks[ix+xUI.dialogSpan-1].option] );
		}else{
		  SO.push('CellWidth');
		};
	}
	sWap.SpanOrder=SO.join(" ");
	var SOC=[];
	for (var ix=0; ix<sWap.camColumns;ix++){
		if(ix<xUI.cameraSpan){
		  SOC.push( spanWord[xUI.XPS.xpsTracks[ix+xUI.dialogSpan+xUI.timingSpan-1].option] );
		}else{
		  SOC.push('CameraCellWidth');
		};
	};
	sWap.SpanOrderCam=SOC.join(" ");
//トランジションテキストの組立
	sWap.transitionText="";

	if(xUI.XPS.trin.time>0){
		sWap.transitionText+="△ "+xUI.XPS.trin.name+'\('+nas.Frm2FCT(xUI.XPS.trin.time,3,0,xUI.XPS.framerate)+')';
	};
	if((xUI.XPS.trin.time>0)&&(xUI.XPS.trout.time>0)){	sWap.transitionText+=' / ';};
	if(xUI.XPS.trout.time>0){
		sWap.transitionText+="▼ "+xUI.XPS.trout.namr+'\('+nas.Frm2FCT(xUI.XPS.trout.time,3,0,xUI.XPS.framerate)+')';
	};
	sWap.transitionText=EncodePS2(sWap.transitionText);

 sWap.timesheetDuration = xUI.XPS.duration();

	var ACL=[];
 for(var id = 0;id < 26; id++){
	if(id < xUI.referenceXPS.xpsTracks.length-2){
	 ACL.push("\("+EncodePS2(xUI.referenceXPS.xpsTracks[id+1].id)+")")
	}else{
	 ACL.push("\( )");
	}
 };
 sWap.ActionCellLabels  = ACL.join(" ");//
	var CL=[];
 for(var id = 0;id < 26; id++){
	if(id < xUI.timingSpan){
	 CL.push("\("+EncodePS2(xUI.XPS.xpsTracks[id + xUI.dialogSpan].id)+")");
	}else{
	 CL.push("\( )");
	}
 };
 sWap.CellLabels = CL.join(" ");

	var CCL=[];
 for(var id = 0;id < 26; id++){
	if(id < xUI.cameraSpan){
	 CCL.push("\("+EncodePS2(xUI.XPS.xpsTracks[id + xUI.timingSpan + xUI.dialogSpan].id)+")");
	}else{
	 CCL.push("\( )");
	}
 };
 sWap.CameraCellLabels = CCL.join(" ");
 
 sWap.TitleString =EncodePS2(xUI.XPS.title);//
 sWap.Opus = EncodePS2(xUI.XPS.opus);//
 sWap.SceneCut= EncodePS2(xUI.XPS.scene +" "+xUI.XPS.cut);//
 sWap.DurationString = EncodePS2("\("+nas.Frm2FCT(xUI.XPS.time(),3)+")");
 sWap.UserName = EncodePS2(xUI.XPS.create_user);//
 sWap.xpsRef = "";//getReferenceData();
 sWap.refLayers = xUI.referenceXPS.xpsTracks.length-1;
 sWap.xpsBody = "";//getBodyData();
 sWap.xpsLayers = xUI.XPS.xpsTracks.length;
 	var MT=xUI.XPS.xpsTracks.noteText.split("\n");

	var MTR=[];
 for(var id = 0 ;id < MT.length ; id++ ){MTR.push("\("+EncodePS2(MT[id])+")")};
 sWap.memoText = MTR.join("\n");

  var myDatas=["FileName",
"FrameRate",
"PageLength",
"PageColumns",
"ActionColumns",
"DialogColumns",
"Columns",
"TimingColumns",
"camColumns",
"timesheetDuration",
"SpanOrder",
"SpanOrderCam",
"ActionCellLabels",
"CellLabels",
"CameraCellLabels",
"TitleString",
"Opus",
"SceneCut",
"DurationString",
"UserName",
"PageNumber",
"PageCount",
"xpsRef",
"refLayers",
"xpsBody",
"xpsLayers",
"transitionText",
"memoText"
  ];

//	var myContent=document.getElementById("data_well").value;
 var epsBodys=[];
 var pages=Math.ceil(xUI.XPS.duration()/xUI.PageLength);//ページ長で割って切り上げ
//	１ページづつ変換してストア
 for(var pageCount=0;pageCount<pages;pageCount++){

 if(pageCount>0){
  sWap.FileName=xUI.getFileName()+"_"+sWap.pageCount;
  sWap.memoText=" ";
  sWap.transitionText="";
 }else{
  sWap.FileName=xUI.getFileName();
 }

	sWap.PageNumber=((pageCount+1)==pages)? "end / "+ pages:(pageCount+1)+" / "+ pages;
	sWap.PageCount= pageCount+1;

 sWap.xpsRef=getReferenceData(pageCount+1);
 sWap.xpsBody=getBodyData(pageCount+1);

 epsBodys[pageCount]=myTemplate;

  for(var count=0;count<myDatas.length;count++){
	var myRegex=new RegExp("=="+myDatas[count]+"==");
	var swapData=sWap[myDatas[count]];
	epsBodys[pageCount]=epsBodys[pageCount].replace(myRegex,swapData);
  }
 }
//置き換え終了したデータは、データウェルに流しこみ。かつチェックがあればダウンロードCGIに送る
	document.getElementById("data_well").value="";//クリア
	var myCount=0;
	var myContents=[]
 for(var pageCount=0;pageCount<pages;pageCount++){
	document.getElementById("data_well").value+=epsBodys[pageCount];
	if(document.getElementById("exportCheck").checked){

	 switch (appHost.platform){
case "AIR":
case "CSX":
case "CEP":
		myContents.push(epsBodys[pageCount]);//配列にスタックする 配列の要素数が処理判定
//		if(fileBox) { myCount=fileBox.storeOtherExtensionFile(epsBodys[pageCount],"eps");}
	//このルーチンではページ毎の処理ができないのであまり良くない
	//SJIS化もできていないのでOUT callEchoEpsに準じた処理が必要  CEP CSXも同様の処理が必要
	//さらにローカル保存なのでロケーション指定を一箇所にして連番処理に
//		alert(pageCount+":"+myCount);
break;
default:
		Count=callEchoEps(epsBodys[pageCount],xUI.getFileName(),pageCount+1);//ページカウントはオリジン0なので加算して送る
//		alert(pageCount+":"+myCount);
	 }

	}
 }
 //AIR/CSX/CEPの環境ではループしてスタックしたデータを配列で渡す
		if((fileBox)&&(myContents.length)) { myCount=fileBox.storeOtherExtensionFile(myContents,"eps");}
// alert ("myCount :"+myCount); 
}

function exportEps(myTemplate){
	var url="./template/blank.txt";
	switch(myTemplate){
case	"A3":url="./template/timeSheet_epsA3.txt";break;
default:url="./template/timeSheet_eps.txt";
	}
	myAjax= jQuery.ajax({
		type    :"GET",
		 url    : url ,
		dataType:"text",
		success : pushEps
	});
};

//htmlUIなのでここじゃないんだけどパネル関連ということで暫定的にこちら
/*
	jQueryでフローティングウインドウを初期化
*/
/*
optionPanelSign
*/
jQuery(function(){
    jQuery("#optionPanelSign a.close").click(function(){
        jQuery("#optionPanelSign").hide();
        return false;
    });
    jQuery("#optionPanelSign a.minimize").click(function(){
        if(jQuery("#optionPanelSign").height()>100){
           jQuery("#formSign").hide();
           jQuery("#optionPanelSign").height(24);
	}else{
           jQuery("#formSign").show();
           jQuery("#optionPanelSign").height(165);
	};
        return false;
    });
    jQuery("#optionPanelSign dl dt").mousedown(function(e){
        jQuery("#optionPanelSign")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelSign").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelSign").offset().top );
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();

            jQuery("#optionPanelSign").css({
                top:e.pageY  - jQuery("#optionPanelSign").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelSign").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            });
        });
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    });
});
/*
OptionPanelTbx
*/
jQuery(function(){
    jQuery("#optionPanelTbx a.close").click(function(){
        jQuery("#optionPanelTbx").hide();
        return false;
    })
    jQuery("#optionPanelTbx a.minimize").click(function(){
        if(jQuery("#optionPanelTbx").height()>100){
           jQuery("#formTbx").hide();
           jQuery("#optionPanelTbx").height(24);
	}else{
           jQuery("#formTbx").show();
           jQuery("#optionPanelTbx").height(210);
	}
        return false;
    })
    jQuery("#optionPanelTbx dl dt").mousedown(function(e){
        jQuery("#optionPanelTbx")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelTbx").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelTbx").offset().top );
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();

            jQuery("#optionPanelTbx").css({
                top:e.pageY  - jQuery("#optionPanelTbx").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelTbx").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelSnd
  パネル上で全体のonfocusイベントに対するiNputbOxへのフォーカス遷移を抑制することが必要
*/
jQuery(function(){
    jQuery("#optionPanelSnd a.close").click(function(){
        jQuery("#optionPanelSnd").hide();
        return false;
    })
    jQuery("#optionPanelSnd a.minimize").click(function(){
        if(jQuery("#optionPanelSnd").height()>100){
           jQuery("#formSnd").hide();
           jQuery("#optionPanelSnd").height(24);
	}else{
           jQuery("#formSnd").show();
           jQuery("#optionPanelSnd").height(248);
	}
        return false;
    })
    jQuery("#optionPanelSnd dl dt").mousedown(function(e){
        jQuery("#optionPanelSnd")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelSnd").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelSnd").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelSnd").css({
                top:e.pageY  - jQuery("#optionPanelSnd").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelSnd").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelTimer
  パネル上で全体のonfocusイベントに対するiNputbOxへのフォーカス遷移を抑制することが必要
*/
jQuery(function(){
    jQuery("#optionPanelTimer a.close").click(function(){
        jQuery("#optionPanelTimer").hide();
        return false;
    })
    jQuery("#optionPanelTimer a.minimize").click(function(){
        if(jQuery("#optionPanelTimer").height()>64){
           jQuery("#formTimer").hide();
           jQuery("#optionPanelTimer").height(24);
    }else{
           jQuery("#formTimer").show();
           jQuery("#optionPanelTimer").height(72);
    }
        return false;
    })
    jQuery("#optionPanelTimer dl dt").mousedown(function(e){
        jQuery("#optionPanelTimer")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelTimer").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelTimer").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelTimer").css({
                top:e.pageY  - jQuery("#optionPanelTimer").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelTimer").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelCam
*/
jQuery(function(){
    jQuery("#optionPanelCam a.close").click(function(){
        jQuery("#optionPanelCam").hide();
        return false;
    })
    jQuery("#optionPanelCam a.minimize").click(function(){
        if(jQuery("#optionPanelCam").height()>100){
           jQuery("#formCam").hide();
           jQuery("#optionPanelCam").height(24);
	}else{
           jQuery("#formCam").show();
           jQuery("#optionPanelCam").height(165);
	}
        return false;
    })
    jQuery("#optionPanelCam dl dt").mousedown(function(e){
        jQuery("#optionPanelCam")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelCam").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelCam").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelCam").css({
                top:e.pageY  - jQuery("#optionPanelCam").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelCam").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelStg
*/
jQuery(function(){
//close
    jQuery("#optionPanelStg a.close").click(function(){
        jQuery("#optionPanelStg").hide();
        return false;
    })
//minimaize/maxinaiz
    jQuery("#optionPanelStg a.minimize").click(function(){
        if(jQuery("#optionPanelStg").height()>100){
           jQuery("#formStg").hide();
           jQuery("#optionPanelStg").height(24);
	}else{
           jQuery("#formStg").show();
           jQuery("#optionPanelStg").height(165);
	}
        return false;
    })
//move
    jQuery("#optionPanelStg dl dt").mousedown(function(e){
        jQuery("#optionPanelStg")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelStg").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelStg").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelStg").css({
                top:e.pageY  - jQuery("#optionPanelStg").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelStg").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
//resize
    jQuery("#StgPanelCorner").mousedown(function(e){
        jQuery("#StgPanelCorner")
            .data("cornerPointX" , e.pageX - jQuery("#StgPanelCorner").offset().left)
            .data("cornerPointY" , e.pageY - jQuery("#StgPanelCorner").offset().top );
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
 console.log({
                 width: e.pageX - jQuery("#StgPanelCorner").data("cornerPointX")+16+myOffset.left - xUI.screenShift[1]-jQuery("#optionPanelStg").offset().left,
                height:e.pageY - jQuery("#StgPanelCorner").data("cornerPointY")+16+myOffset.top  - xUI.screenShift[0]-jQuery("#optionPanelStg").offset().top   

 });
           jQuery("#optionPanelStg").css({
                width: e.pageX - jQuery("#StgPanelCorner").data("cornerPointX")+16+myOffset.left - xUI.screenShift[1]-jQuery("#optionPanelStg").offset().left,
                height:e.pageY - jQuery("#StgPanelCorner").data("cornerPointY")+16+myOffset.top  - xUI.screenShift[0]-jQuery("#optionPanelStg").offset().top   
            }) 
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })});
/*
OptionPanelSfx
*/
jQuery(function(){
    jQuery("#optionPanelSfx a.close").click(function(){
        jQuery("#optionPanelSfx").hide();
        return false;
    })
    jQuery("#optionPanelSfx a.minimize").click(function(){
        if(jQuery("#optionPanelSfx").height()>100){
           jQuery("#formSfx").hide();
           jQuery("#optionPanelSfx").height(24);
	}else{
           jQuery("#formSfx").show();
           jQuery("#optionPanelSfx").height(165);
	}
        return false;
    })
    jQuery("#optionPanelSfx dl dt").mousedown(function(e){
        jQuery("#optionPanelSfx")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelSfx").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelSfx").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelSfx").css({
                top:e.pageY  - jQuery("#optionPanelSfx").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelSfx").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
optionPanelPaint
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
           jQuery("#optionPanelPaint").height(165);
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
// 画像ウインドウ
jQuery(function(){
    jQuery("#optionPanelRef a.close").click(function(){
        jQuery("#optionPanelRef").hide();
        return false;
    })
//minimize/maximaize
    jQuery("#optionPanelRef a.minimize").click(function(){
        if(jQuery("#optionPanelRef").height()>100){
           jQuery("#formSnd").hide();
           jQuery("#optionPanelRef").height(24);
	}else{
           jQuery("#formSnd").show();
           jQuery("#optionPanelRef").height(700);
	}
        return false;
    })
//move
    jQuery("#optionPanelRef dl dt").mousedown(function(e){
        jQuery("#optionPanelRef")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelRef").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelRef").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelRef").css({
                top:e.pageY  - jQuery("#optionPanelRef").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelRef").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
//resize
    jQuery("#RefPanelCotner").mousedown(function(e){
        jQuery("#optionPanelRef")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelRef").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelRef").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelRef").css({
                top:e.pageY  - jQuery("#optionPanelRef").data("clickPointY")+myOffset.top+"px",
                left:e.pageX - jQuery("#optionPanelRef").data("clickPointX")+myOffset.left+"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
//パネル上のデータリストを初期化する
//    document.getElementById("sndCastList")
//    document.getElementById("soundProplist")
//    SoundEdit.PanelInit();
/*
// IE用コードとのこと  今回はもうIEは動作対象外なので勘弁
jQuery("#optionPanelTbx dl dt").mousedown(function(e){
    jQuery("body").bind('selectstart', function(){
        return false;
    })
}).mouseup(function(){
    jQuery("body").unbind('selectstart');
})

*/
/*          ---------- cookie.js
	汎用的なクッキー関連メソッド??

	nasオブジェクトのメソッドとして実装する。
	nas.cookie.toString()//クッキー文字列
	nas.cookie.write()
	nas.cookie.read()
*/
//クッキー文字列を作って書き込み
/*
function buildCk(){
var myCookie = new Array();
///////    クッキー配列用のデータを取得。
//    クッキーID:0をシートカラー及び印刷用紙サイズに設定
//    [0] applicationAttributes
    if (config.useCookie.SheetProp){
        config.SheetBaseColor    = xUI.sheetLooks.SheetBaseColor;
        config.ApplicationIdf    = serviceAgent.applicationIdf;
        var        appAttributes=[config.SheetBaseColor,config.ApplicationIdf];
    }else{
        var        appAttributes=[false,false];
    }
myCookie[0]=appAttributes;

//    [1] xUI.XPSAttrib 音響カラムを追加予定(20190310)
    config.myTitle        = (config.useCookie.XPSAttrib)? xUI.XPS.title:null;
    config.mySubTitle     = (config.useCookie.XPSAttrib)? xUI.XPS.subtitle:null;
    config.myOpus         = (config.useCookie.XPSAttrib)? xUI.XPS.opus:null;
    config.myFrameRate    = (config.useCookie.XPSAttrib)? xUI.XPS.framerate.toString():null;
    config.Sheet          = (config.useCookie.XPSAttrib)?nas.Frm2FCT(xUI.XPS.xpsTracks[0].length,3,0,xUI.XPS.framerate):null;//
    config.DialogColumns     = (config.useCookie.XPSAttrib)?xUI.dialogCount:null;
    config.SoundColumns      = (config.useCookie.XPSAttrib)?xUI.soundCount:null;
    config.SheetLayers       = (config.useCookie.XPSAttrib)?xUI.timingCount:null;
    config.CameraworkColumns = (config.useCookie.XPSAttrib)?xUI.cameraCount:null;
    config.StageworkColumns  = (config.useCookie.XPSAttrib)?xUI.stageworkCount:null;
    config.SfxColumns        = (config.useCookie.XPSAttrib)?xUI.sfxCount:null;

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

//    [2] UserName
    if(config.useCookie.UserName)    {
        config.myName  = xUI.currentUser.toString();
        config.myNames = xUI.recentUsers.convertStringArray();
    }else{
        config.myName    = false;
        config.myNames = [];
    }
    myCookie[2]=[
        config.myName,
        config.myNames
    ];

//    [3] KeyOptions
    config.BlankMethod         = (config.useCookie.KeyOptions)?xUI.blmtd:null;
    config.BlankPosition    = (config.useCookie.KeyOptions)?xUI.blpos:null;
    config.AEVersion         = (config.useCookie.KeyOptions)?xUI.aeVersion:null;
    config.KEYMethod         = (config.useCookie.KeyOptions)?xUI.keyMethod:null;
    config.TimeShift         = (config.useCookie.KeyOptions)?xUI.timeShift:null;
    config.FootageFramerate = (config.useCookie.KeyOptions)?xUI.fpsF:null;
    config.defaultSIZE         = (config.useCookie.KeyOptions)?[xUI.dfX,xUI.dfY,xUI.dfA].toString():"auto";

    myCookie[3]=[
        config.BlankMethod,
        config.BlankPosition,
        config.AEVersion,
        config.KEYMethod,
        config.TimeShift,
        config.FootageFramerate,
        config.defaultSIZE
    ];
//    [4] SheetOptions
    config.SpinValue       = (config.useCookie.SheetOptions)?xUI.spinValue:null;
    config.SpinSelect      = (config.useCookie.SheetOptions)?xUI.spinSelect:null;
    config.SheetLength     = (config.useCookie.SheetOptions)?xUI.SheetLength:null;
    config.SheetPageCols   = (config.useCookie.SheetOptions)?xUI.PageCols:null;
    config.FootMark        = (config.useCookie.SheetOptions)?xUI.footMark:null;
    
    myCookie[4]=[
        config.SpinValue,
        config.SpinSelect,
        config.SheetLength,
        config.SheetPageCols,
        config.FootMark
    ];

//    [5] CounterType
    config.Counter0    = (config.useCookie.CounterType)?xUI.fct0:null;
    config.Counter1    = (config.useCookie.CounterType)?xUI.fct1:null;

    myCookie[5]=[
        config.Counter0,
        config.Counter1
    ];

//    [6] UIOptions
    config.SLoop          = (config.useCookie.UIOptions)?xUI.sLoop:null;
    config.CLoop          = (config.useCookie.UIOptions)?xUI.cLoop:null;
    config.AutoScroll     = (config.useCookie.UIOptions)?xUI.autoScroll:null;
    config.TabSpin        = (config.useCookie.UIOptions)?xUI.tabSpin:null;
    config.ViewMode       = (config.useCookie.UIOptions)?xUI.viewMode:null;
    config.InputMode      = (config.useCookie.UIOptions)?xUI.ipMode:null;
myCookie[6] = [
    config.SLoop,
    config.CLoop,
    config.AutoScroll,
    config.TabSpin,
    config.ViewMode,
    config.InputMode
];
//    [7] UIView
if(config.useCookie.UIView){
    config.ToolView=[];
    for (var ix=0;ix<config.UIViewIdList.length;ix++){
        config.ToolView.push(($('#'+config.UIViewIdList[ix]).css('display')=='none')? 0:1);
    };
    config.ToolView=config.ToolView.join("");
};
//記録チェックがない場合は元のデータを変更しない
myCookie[7]=config.ToolView;
if(config.dbg) console.log(config.ToolView);

return myCookie;
}

function writeCk(myCookie){
	if (!navigator.cookieEnabled){
		if (config.dbg){alert("クッキーが有効でないカンジ?")};
		return false;
	}
if(typeof myCookie == "undefined") myCookie=buildCk();
//console.log(myCookie);
var myCookieExpiers="";

if(config.useCookie.expiers) {
	var Xnow = new Date();

var completeYear=Xnow.getFullYear();//	年
var completeMonth=Xnow.getMonth()+1;//	月
var completeDate=Xnow.getDate();//	日
var completeHour=Xnow.getHours();//	時刻

var completeMin=Xnow.getMinutes();//	分
var completeSec=Xnow.getSeconds();//	秒

var eXpSpan=(isNaN(config.useCookie.expier))? 1:config.useCookie.expier[1];
//クッキーの期限 デフォルト期限 1日

var expDate=new Date(
	completeYear, completeMonth-1, completeDate + eXpSpan,
	completeHour , completeMin, completeSec 
);//	満了期日をセットした日付オブジェクトを作成

var myCookieExpiers=';expires='+ expDate.toGMTString();
}

var myCookieSource=tosRcs(myCookie);
document.cookie= 'rEmaping=' +escape(myCookieSource) + myCookieExpiers;//書き込む
	return myCookie;
}

//
//	文字列をname=value;のセットに分解して与えられたckNameの値を返す。
//	フラグが立っていればエスケープする。
function breakValue(ckString,ckName,flag) {
	ckString += ';' ;
	var ckStringS = ckString.split(';');
	for(var n=0;n<ckStringS.length;n ++){
        if(ckName == ckStringS[n].split('=')[0]){
	        if(flag) {
	            return ckStringS[n].split('=')[1];
	        }else{
	            return unescape(ckStringS[n].split('=')[1]);
	        }
        }
	}
return null;//判定できなかった場合は空文字列を返す。
}
/**    クッキー文字列を配列に戻し、グローバル変数に展開する
    グローバル変数は、設定ファイルの値を持っているので関数の呼び出し後に必用な参照を行う
    関数内では、ケース毎特定の処理は行わない。
*/
function ldCk(ckStrings){
if (!navigator.cookieEnabled){return false;}

	if(breakValue(document.cookie,"rEmaping")){
		var rEmaping = JSON.parse(breakValue(document.cookie,"rEmaping"));
	}else{
		return false;
	}
//	[0] SheetProps
	if (config.useCookie.SheetProp){
	if(rEmaping[0][0])  config.SheetBaseColor = unescape(rEmaping[0][0]);
	}

//	[1] XPSAttrib
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
    if(rEmaping[1][10]) config.vSfxColumns       = unescape(rEmaping[1][10]);
	}

//	[2] UserName
	if(config.useCookie.UserName){
	    if(rEmaping[2]) {
		    config.myName  = unescape(rEmaping[2][0]);
		    config.myNames = [];
		    for(var ix=0;ix<rEmaping[2][1].length;ix++){
		        config.myNames.push(unescape(rEmaping[2][1][ix]));
		    }
	    }else{
	        config.myName = "";
	        config.myNames = [myName];
	    }
	}

//	[3] KeyOptions
	if(config.useCookie.KeyOptions){
	if(rEmaping[3][0]) config.BlankMethod      = unescape(rEmaping[3][0]);
	if(rEmaping[3][1]) config.BlankPosition    = unescape(rEmaping[3][1]);
	if(rEmaping[3][2]) config.AEVersion	       = unescape(rEmaping[3][2]);
	if(rEmaping[3][3]) config.KEYMethod	       = unescape(rEmaping[3][3]);
	if(rEmaping[3][4]) config.TimeShift	       = (rEmaping[3][4]=="true")?true:false;
	if(rEmaping[3][5]) config.FootageFramerate = unescape(rEmaping[3][5]);
	if(rEmaping[3][6]) config.defaultSIZE      = unescape(rEmaping[3][6].toString());
	}

//	[4] SheetOptions
	if(config.useCookie.SheetOptions){
	if(rEmaping[4][0]) config.SpinValue        = parseInt(rEmaping[4][0],10);
	if(rEmaping[4][1]) config.SpinSelect       = (rEmaping[4][1]=="true")?true:false;
	if(rEmaping[4][2]) config.SheetLength      = parseInt(rEmaping[4][2],10);
	if(rEmaping[4][3]) config.SheetPageCols    = parseInt(rEmaping[4][3],10);
	if(rEmaping[4][4]) config.FootMark         = (rEmaping[4][4]=="true")?true:false;
	}

//	[5] CounterType
	if(config.useCookie.CounterType){
	
	if(rEmaping[5][0] instanceof Array) config.Counter0 = [parseInt(rEmaping[5][0][0],10),parseInt(rEmaping[5][0][1],10)];
	if(rEmaping[5][1] instanceof Array) config.Counter1 = [parseInt(rEmaping[5][1][0],10),parseInt(rEmaping[5][1][1],10)];
	}

//	[6] UIOptions
	if(config.useCookie.UIOptions){
	if(rEmaping[6][0]) config.SLoop        = (rEmaping[6][0]=="true")?true:false;
	if(rEmaping[6][1]) config.CLoop        = (rEmaping[6][1]=="true")?true:false;
	if(rEmaping[6][2]) config.AutoScroll   = (rEmaping[6][2]=="true")?true:false;
	if(rEmaping[6][3]) config.TabSpin      = (rEmaping[6][3]=="true")?true:false;
	if(rEmaping[6][4]) config.ViewMode     = rEmaping[6][4];
	if(rEmaping[6][5]) config.InputMode    = rEmaping[6][5];
	};
console.log(rEmaping[6][5]);
//	[7] UIView
	if(config.useCookie.UIView){
	if(rEmaping[7]) config.ToolView	=rEmaping[7];
	}
//console.log(rEmaping)
}
//	クッキー削除
function dlCk() {
	var ckName = 'rEmaping'; document.cookie = ckName + '=;expires=Thu,01-Jan-70 00:00:01 GMT';
	config.useCookie=false;
	var reloadNow=confirm(localize(nas.uiMsg.dmCookieRemoved));
	if(reloadNow){document.location.reload()}
}
function resetCk(){ dlCk(); writeCk(); ldCk(); }
//
function tosRcs(obj)
{
//	alert(obj);
	var sRcs="[";
	for(var idx=0; idx <obj.length;idx ++){
		var eLm=obj[idx];
		if(eLm instanceof Array){
			sRcs +=tosRcs(eLm);
		}else{
			sRcs +='"'+escape(eLm)+'"';
		}
		sRcs +=(idx < (obj.length-1))?",":"";
	}
	return sRcs+"]";
}

//  */
/*          ---------headline.js
情報エリア用データ更新モジュール

*/
//
//親ウィンドウを設定

function getProp(msg,prp){
	msg=(msg)?msg:prp+" : こちらの値を編集してください";
	var org_dat=xUI.XPS[prp];
	var new_dat=prompt(msg , org_dat);
	
	if (new_dat && new_dat!=org_dat)
	{
		xUI.XPS[prp]=new_dat;
	    xUI.sync(prp);
	}
};
//各種設定表示更新
function chgDuration(targetProp,prevalue,newvalue){
	if( newvalue!=prevalue){
	    var newTime  = xUI.XPS.time();
	    var newTrin  = new nas.ShotTransition(xUI.XPS.trin.toString('xps') ,xUI.XPS.trin.direction);
	    var newTrout = new nas.ShotTransition(xUI.XPS.trout.toString('xps'),xUI.XPS.trout.direction);
    	switch(targetProp){
        case	"time":
	        newTime = nas.FCT2Frm(newvalue);
        break;
        case	"trin":
	        if (newvalue.match(/(.+)\s\((.+)\)/)){
		        newTrin.name = RegExp.$1;
		        newTrin.time = nas.FCT2Frm(RegExp.$2);
	        }else{
	            alert(localize(nas.uiMsg.failed));//"処理できませんでした"
	            return;
	        };
	    break;
        case	"trout":
	        if (newvalue.match(/([^\(]+)\s\((.+)\)/)){
		        newTrout.name = RegExp.$1;
	    	    newTrout.time = nas.FCT2Frm(RegExp.$2);
	        }else{
		        alert(localize(nas.uiMsg.failed));//"処理できませんでした"
		        return;
	        };
        break;
        default	:return;
	   }
	}else{ return; };
//alert(newTime+"\n"+newTrin.join("/")+"\n"+newTrout.join("/"));
//	return;
//	現在の値からカット継続時間を一時的に生成
	var duration=newTime+(newTrin.time+newTrout.time)/2;
	var oldduration= xUI.XPS.duration();
	var durationUp=(duration>oldduration)? true : false ;

//	カット尺更新確認
		if(duration!=oldduration){
		var msg = localize(nas.uiMsg.alertDurationchange);
		if (!durationUp) msg +="\n\t" + localize(nas.uiMsg.alertDiscardframes);
		msg += "\n" + localize(nas.uiMsg.confirmExecute);
//確認:
	if(confirm(msg)){
//	設定尺が現在の編集位置よりも短い場合は編集位置を調整
		if(oldduration>duration){
			xUI.selectCell ("1_"+(duration-1).toString());
		};
//ターゲットから複製を作ってサイズを調整
	var newXPS=new Xps();
	newXPS.readIN( xUI.XPS.toString());
    newXPS.setDuration(duration);
		newXPS["trin"]=newTrin;
		newXPS["trout"]=newTrout;
		xUI.sheetPut(newXPS);
		xUI.setStored("force");//変更フラグを立てる
	};
	xUI.sync("info_");
		}else{
	//
	xUI.setStored("force");
	if(xUI.XPS["trin"].name != newTrin.name){xUI.XPS.trin.name =newTrin.name ; xUI.sync('trin');};
	if(xUI.XPS["trout"].name !=newTrout.name){xUI.XPS.trout.name=newTrout.name; xUI.sync('trout');};
		}
//更新操作終了
}

function chkPostat(){
	var blmtd=document.getElementById("blmtd");
	var blpos=document.getElementById("blpos");
	switch(blmtd.value)
	{
	case "file"	:
		var status=false;break;
	case "opacity"	:	;
	case "wipe"	:	;
		var status=true;
		blpos.value="end";break;
	case "expression1"	:
		var status=true;
		blpos.value="first";break;
	case "expression2"	:
		var status=true;
		blpos.value="end";break;
	defaule	:
		var status=true;
		blpos.value="build";break;
	}
	if (blpos.disabled!=status)
		blpos.disabled=status;
}
function chgValue(id)
{
	var myTarget=document.getElementById(id);
	switch (id)
	{
case	"iptChange":
		    xUI.ipMode = parseInt(myTarget.value);
		    xUI.sync('ipMode');
		break;
case	"memo"	:
case	"noteText"	:
		    xUI.sheetPut(["noteText.xpsTracks",myTarget.value]);
		break;
case	"blmtd"	:
		    xUI.sheetPut([[id,xUI.Select[0],"xpsTracks"].join("."),myTarget.value]);
		    chkPostat();
		break;
case	"blpos"	:
		    xUI.sheetPut([[id,xUI.Select[0],"xpsTracks"].join("."),myTarget.value]);
		break;

case	"aeVersion"	:
case	"keyMethod"	:
		    xUI[id]=myTarget.value;
		break;

case	"fct0"	:
case	"fct1"	:
	        xUI.selectCell(xUI.Select[0]+'_'+
		    nas.FCT2Frm(myTarget.value));
	;break;
case	"selall"	:
		    xUI.selectCell(xUI.Select[0]+"_0");
		    xUI.selection(
			    xUI.Select[0]+"_"+xUI.XPS.duration()
		    );
		break;
case	"copy"	:	xUI.copy();break;
case	"cut"	:	xUI.cut();break;
case	"paste"	:	xUI.paste();break;
case	"keyArea"	:
	var Lvl=xUI.Select[0];
	if(Lvl>0 && Lvl<=(xUI.XPS.xpsTracks.length-1))
	{	writeAEKey(Lvl) }
	;break;
case	"areaXPS"	:
	document.getElementById("rEsult").value=xUI.XPS.toString();
	document.getElementById("rEsult").focus();
	;break;
case	"iNputbOx"	:	hello();break;
case	"ok"	    :	hello();break;
case	"ng"	    :	hello();break;
case	"undo"	    :	xUI.undo();break;
case	"redo"	    :	xUI.redo();break;
case	"up"	    :	;//スピン
case	"down"	    :	;
case	"right"	    :	;
case	"left"	    :	;
case	"fwd"	    :	;
case	"back"	    :	;
	xUI.spin(id);break;
case	"home"	    :	;xUI.selectCell(xUI.Select[0]+"_0");break;
case	"end"	    :	;xUI.selectCell(xUI.Select[0]+"_"+xUI.XPS.duration());break;
//
case	"spin_V"	:
	xUI.spin(myTarget.value);break;
case	"v_up"	:	;//スピン関連
case	"v_dn"	:	;//IDとキーワードを合わせてそのまま送る
case	"pgdn"	:	;
case	"pgup"	:
	xUI.spin(id);break;
case	"clearFS"	:	;//フットスタンプクリア
	xUI.footstampClear();break;
case	"layer"	:	;//レイヤ変更
	if (document.getElementById("single")){}

	xUI.selectCell(
		(myTarget.selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	break;
case	"cell"	:	;//セルの入力
	xUI.sheetPut((myTarget.selectedIndex+1));
	xUI.spin("fwd");

	break;
case	"fav"	:	;//文字の入力
	xUI.sheetPut(xUI.favoriteWords[myTarget.selectedIndex]);
	xUI.spin("fwd");

	break;
case	"TSXall"	:	return false;//捨てる
	break;
default:	alert(id);return false;
	}
//	alert(id);
return false;
}
//チェックボックストグル操作
function chg(id)
{
	var myCkBox=document.getElementById(id);
	myCkBox.checked=
	(myCkBox.checked) ?
	false	:	true	;
		chgValue(id);
	return false;
}
//単独書き換え

var rewriteValueByEvt = function(e){
//ターゲットがクリックされた時、イベントから引数を組み立てて関数を呼ぶ
//alert(e);
if(xUI.viewOnly) return false;
	var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
	var myPrp=TargeT.id;
	var msg="";
	var currentValue=null;
	if ($('#'+myPrp).attr('lock')=="yes") {return false;}
	switch(myPrp){
	case "time":
		msg="カットの時間を入力してください。\n";
	break;
	case "trin":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trin.name+"\ \("+nas.Frm2FCT(this.XPS.trin.time,3,0,this.XPS.framerate)+"\)";
	break;
	case "trout":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trout.name+"\ \("+nas.Frm2FCT(this.XPS.trout.time,3,0,this.XPS.framerate)+"\)";
	break;
	case "scene_cut":
 		msg="シーン・カットナンバーを変更します。データは 空白区切。\nひとつだとカット番号";
	break;
		case "update_user":
 		msg="作業ユーザ名を変更します。\n";
	break;
		case "opus":
 		msg="制作ナンバーを変更します。\n";
	break;
		case "title":
 		msg="タイトルを変更します。\n";
 		currentValue=this.XPS.title;
	break;
		case "subtitle":
 		msg="サブタイトルを変更します。\n";
	break;
	}
	xUI.printStatus(msg);

	var myFunction=function(){
		var prp=this.target.id
		var org_dat=xUI.XPS[prp];
		var new_dat=this.newContent;
		switch (prp){
		case "scene_cut":
		 var prevalue=this.orgContent
		 var newvalue=this.newContent;
		 if(newvalue != prevalue){
		 var newvalues=newvalue.split(" ");
	xUI.sheetPut(["scene",(newvalues.length>1)?newvalues[0]:""]);
		 xUI.XPS.cut  =(newvalues.length>1)?newvalues[1]:newvalues[0];
	xUI.sheetPut(["cut",(newvalues.length>1)?newvalues[1]:newvalues[0]]);
		 xUI.setStored("force");
		 }
		 xUI.sync("cut");
			break;
		case "time":
		case "trin":
		case "trout":
		 var prevalue=this.orgContent
		 var newvalue=this.newContent;
		 if(newvalue != prevalue){chgDuration(prp,prevalue,newvalue);}else{ xUI.sync("info_");}
			break;
		case "update_user":
		case "opus":
		case "title":
		case "subtitle":
		 default:
dbgPut("new_dat :"+new_dat)
		 if (new_dat!=org_dat)
		 {
			xUI.sheetPut([prp,new_dat]);
			xUI.setStored("force");
		 }
		 xUI.sync(prp);
		}
		xUI.printStatus();//クリア
	}
	if((TargeT.id)&&(TargeT instanceof HTMLTableCellElement)){
		nas.editTableCell(TargeT,"input",currentValue,myFunction);
//		document.getElementById(TargeT+"_ipt").style.padding="0";
	}
}

function rewriteValue(id){
    if(xUI.edchg)
console.log(document.getElementById('iNputbOx').value);
    xUI.sheetPut(document.getElementById('iNputbOx').value);
var msg="";
var prp="";
	switch (id){
case	"opus":
	msg="制作ナンバーを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"title":
	msg="タイトルを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"subtitle":
	msg="サブタイトルを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"scene_cut":
	msg="シーン・カットナンバーを変更します。\nデータは 空白で区切ってふたつ書き込んでください。\n一つだけ書くとカット番号です";
	var prevalue=(xUI.XPS.scene)?xUI.XPS.scene+" "+xUI.XPS.cut:xUI.XPS.cut;

	var newvalue=prompt(msg,prevalue);
	if(newvalue != prevalue){
		var newvalues=newvalue.split(" ");
	xUI.XPS.scene	=(newvalues.length > 1)?newvalues[0]:"";
	xUI.XPS.cut	=(newvalues.length > 1)?newvalues[1]:newvalues[0];
//	 xUI.sync("scene");
	 xUI.sync("cut");
	}
	;break;
case	"time":
case	"trin":
case	"trout":
	chgDuration(id);
	break;

case	"update_user":
	msg="作業ユーザを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
	}
//
xUI.setStored("force"); xUI.sync();
}
/*	暫定版データエコーCGI 呼び出し
引数:DLファイル名    

	CGI呼び出しの際に、フォイル名の確認を行うように変更
	ただしオブションで機能を切り離し可能に
    引数によってダイアログを省略
    引数がなければ、自動生成のファイル名を作成してダイアログで確認
 */
function callEcho(dlName,callback){
var msg = localize(nas.uiMsg.confirmCallecho)+"\n"+localize(nas.uiMsg.confirmOk)+"\n"+localize(nas.uiMsg.confirmEdit)+"\n";
var title = localize(nas.uiMsg.saveToDonloadfolder);
    if(!dlName){
nas.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.xps',function(){
	if(this.status==0){
	  var storeName=this.value;
	  xUI.setStored("current");
	  xUI.sync();
		//ファイル保存を行うのであらかじめリセットする;
	  document.saveXps.action=ServiceUrl+'COMMAND=save&';
	  document.saveXps.COMMAND.value ='save';
	  document.saveXps.encode.value  ='utf8';
	  document.saveXps.XPSBody.value=encodeURI(xUI.XPS.toString());
	  document.saveXps.XPSFilename.value=storeName;
	  document.saveXps.submit();
      if(callback instanceof Function){callback();}; 
	}
})
    }else{
	  xUI.setStored("current");
	  xUI.sync();
		//ファイル保存を行うのであらかじめリセットする;
	  document.saveXps.action=ServiceUrl+'COMMAND=save&';
	  document.saveXps.COMMAND.value ='save';
	  document.saveXps.encode.value  ='utf8';
	  document.saveXps.XPSBody.value=encodeURI(xUI.XPS.toString());
	  document.saveXps.XPSFilename.value=dlName+'.xps';
	  document.saveXps.submit();
      if(callback instanceof Function){callback();}; 
    }
}
/*	拡張子を引数にしてコールする
txt,html,ard,tsh,eps,ard  など
送信データ本体は、document.saveXps.XPSBody.value なので  あらかじめ値をセットしてからコールする必要あり
:nas.uiMsg
*/
function callEchoExport(myExt)
{
   var myEncoding="utf8";//デフォルトutf-8
   var sendData=xUI.data_well.value;
   
var form={
html: "documentHTML",
xmap: "documentxMap",
xps: "documentXps",
tdts:"documentTdts",
xdts:"documentXdts",
ard: "documentArd",
ardj: "documentArdj",
csv: "documentCSV",
sts: "documentSTS",
tsh: "documentTSheet"
}
		//ファイル保存ではなくエクスポートなので環境リセットは省略;
   if(! myExt){myExt="txt";}
   switch (myExt){
	case "tdts":
	case "xdts":
		sendData=sendData.replace(/\r?\n/g,"\n");
		myEncoding="utf8";
	break;
	case "tsh":
		sendData=sendData.replace(/\r?\n/g,"\r")+"\n";
	case "eps":
	case "ard":
		myEncoding="sjis";
	break;
	default:
		myEncoding="utf8";
   }
  var msg = localize(nas.uiMsg.confirmCallechoSwap,localize(nas.uiMsg[form[myExt]]))+"\n"+localize(nas.uiMsg.confirmOk)+"\n"+localize(nas.uiMsg.confirmEdit)+"\n";
  var title = localize(nas.uiMsg.saveToDonloadfolderSwap,localize(nas.uiMsg[form[myExt]]))
nas.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.'+myExt,function(){
	if(this.status==0){
//alert(myEncoding);
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	switch (myEncoding){
	case "sjis" : document.saveXps.XPSBody.value =EscapeSJIS(sendData);break;
	case "eucjp": document.saveXps.XPSBody.value =EscapeEUCJP(sendData);break;
	default     : document.saveXps.XPSBody.value =encodeURI(sendData);
	}
	document.saveXps.XPSFilename.value=this.value;
	document.saveXps.submit();
	}
})
}
//現在のXPSデータを保存用HTMLに変換してエコーサービスへ送るルーチン

function callEchoHTML()
{
    var myEncoding="utf-8";//デフォルトutf8
    var sendData=printHTML(true);
    var myExt="html";
   
    var msg = localize(nas.uiMsg.confirmCallechoSwap,localize(nas.uiMsg.documentHTML))+"\n"+localize(nas.uiMsg.confirmOk)+"\n"+localize(nas.uiMsg.confirmEdit)+"\n";
    var title = localize(nas.uiMsg.saveToDonloadfolderSwap,localize(nas.uiMsg.documentHTML));
nas.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.'+myExt,function(){
//	sendData=sendData.replace(/\r?\n/g,"\r\n");
	if(this.status==0){
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	document.saveXps.XPSBody.value =sendData;
	document.saveXps.XPSFilename.value=this.value;
//send前にターゲットのiframeを確認して、無ければappendするコードをここへ挿入
	document.saveXps.submit();
	}
})
}
/*
	現行のデータをページ番号を指定してepsデータとして保存する関数
	epsデータは１ページ毎の別ファイルなので  複数葉の場合このダウンロードルーチンが
	ページごとに順次コールされる。
	名前付けや、番号付けはこの関数の外で行われる
*/

function callEchoEps(myContent,myName,myNumber)
{
   var myEncoding="sjis";//デフォルトsjis
   var sendData=myContent;
   var myExt="eps";

	sendData=sendData.replace(/\r?\n/g,"\r\n");

	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.target="window"+myNumber;
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	document.saveXps.XPSBody.value =EscapeSJIS(sendData);
	document.saveXps.XPSFilename.value=myName+"_"+myNumber+'\.'+myExt;
//send前にターゲットのiframeを確認して、無ければappendするコードをここへ挿入
	document.saveXps.submit();
}
/*				--------toolbox.js
作業ツールボックス用関数
拡張ツール用

ツールボックスは、ペン等のポインタを使用した汎用入力パネル
jquery導入に合わせて、ドラッガブルでミニマイズ可能な作りに変更  2013.04.07

*/
/**
	ソフトウェアキーボード処理
	ツールボックス上のソフトウェアキーボードの入力をxUIに送る
*/
function skbPush(Chr){
	var textBody=document.getElementById("iNputbOx").value;
	switch(Chr){
	case	"(*)":if(textBody.length){document.getElementById("iNputbOx").value="("+textBody+")"};
	break;
	case	"○":chkValue("ok");
	break;
	case	"^z":chkValue("undo");
	break;
	case	"^y":chkValue("redo");
	break;
	case	"←":if(textBody.length){document.getElementById("iNputbOx").value=textBody.slice(0,-1)};
	break;
	case	"esc":chkValue("ng");return;
	break;
	default	:document.getElementById("iNputbOx").value += Chr;//
	};
	if(textBody != document.getElementById("iNputbOx").value){
	    xUI.eddt = document.getElementById("iNputbOx").value;
		xUI.edChg(true);//編集フラグ立て
	};//(! xUI.edchg)
	document.getElementById("iNputbOx").focus();
}
/**
 *	UIControlの値を検査して値に従ったアクションに変換する
 *	@params {String}    id
 *	    動作キーワード
 */
function chkValue(id)
{
	document.getElementById("iNputbOx").select();

	switch (id)
	{
case	"imgUse":
//マスターモードがノーマルでかつシート画像が存在する場合のみ有効
		if(!(xUI.XPS.imgMaster())&&(xUI.XPS.timesheetImages.length)){
			var imgs = document.querySelectorAll('.overlayDocmentImage');
			if(imgs.length <= 0){
			    alert('error');
			}
			if(document.getElementById(id).checked){
//画像表示
				imgs.forEach((e) => e.style.display = 'inline');
//シートマージン有効
			}else{
//画像非表示
				imgs.forEach((e) => e.style.display = 'none');
//シートマージン無効
			};
		};//
break;
case	"fct0"	:
case	"fct1"	:
	xUI.selectCell(xUI.Select[0]+'_'+
		nas.FCT2Frm(document.getElementById(id).value));
	;break;
case	"selall"	:
		xUI.selectCell(xUI.Select[0]+"_0");
		xUI.selection(xUI.Select[0]+"_"+xUI.XPS.duration());
		break;
case	"copy"	:	xUI.copy();	break;
case	"cut"	:	xUI.cut();	break;
case	"paste"	:	xUI.paste();break;
case	"activeLvl"	:
	var Lvl=xUI.Select[0];
	if(Lvl>0&&Lvl<=(xUI.XPS.xpsTracks.length-1)){	writeAEKey(Lvl);	}
	return;
	break;
case	"iNputbOx"	:	hello();break;
case	"ok"	:
	if (xUI.edchg){
        var expdList = (xUI.ipMode)?
            nas_expdList(nas.normalizeStr(xUI.eddt)):nas_expdList(xUI.eddt);
		xUI.sheetPut(iptFilter(
		    expdList.split(","),
		    xUI.XPS.xpsTracks[xUI.Select[0]],
		    xUI.ipMode,
		    false
		));//更新
	}
	if(expd_repFlag){
		xUI.spin("down");expd_repFlag=false;
	}else{
		xUI.spin("down");
	}
		break;

case	"ng"	:
	if(xUI.edchg){xUI.edChg(false);}
	syncInput(xUI.bkup());
	if(xUI.getid("Selection")!="0_0")
		{xUI.selection();break;}
		//選択範囲解除
		break;

case	"undo"	:	xUI.undo();break;
case	"redo"	:	xUI.redo();break;
case	"up"	:	;//スピン
case	"down"	:	;
case	"right"	:	;
case	"left"	:	;
case	"fwd"	:	;
case	"back"	:	;
	xUI.spin(id);break;
case	"home"	:	xUI.selectCell(xUI.Select[0]+"_0");break;
case	"end"	:	xUI.selectCell(xUI.Select[0]+"_"+xUI.XPS.duration());break;
//
case	"spin_V":	xUI.spin(document.getElementById(id).value);break;
case	"v_up"	:	;//スピン関連
case	"v_dn"	:	;//IDとキーワードを合わせてそのまま送る
case	"pgdn"	:	;
case	"pgup"	:	xUI.spin(id);break;
case	"iptChange":	;//スイッチ変更
    xUI.ipMode = parseInt(document.getElementById("iptChange").value);
 xUI.sync("ipMode");
			break;
case	"spinCk":	;//スイッチ変更
	xUI.spinSelect=document.getElementById(id).checked;
 xUI.sync("spinS");
			break;
case	"exportCheck":	;//スイッチ変更
	var myCheck=document.getElementById(id);
	myCheck.checked=(myCheck.checked)?false:true;
	return false;
			break;
case	"layer"	:	;//レイヤ変更
case	"tBtrackSelect"	:	;//レイヤ変更
	if (document.getElementById("single")){}

	xUI.selectCell(
		(document.getElementById(id).selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	break;
case	"cell"	:	;//セルの入力
case	"tBitemSelect"	:	;//セルの入力
	xUI.sheetPut(iptFilter(
	    document.getElementById(id).selectedIndex+1,
	    xUI.XPS.xpsTracks[xUI.Select[0]],
	    xUI.ipMode,
	    false
	));
	xUI.spin("fwd");

	break;
case	"fav"	:	;//文字の一括入力
case	"tBkeywordSelect"	:	;//文字の一括入力
var EXword=xUI.favoriteWords[document.getElementById(id).selectedIndex];
var TGword=xUI.XPS.xpsTracks[xUI.Select[0]][xUI.Select[1]];
//文字列に*があれば、現在の値と置換
if(EXword.match(/\*/))EXword=EXword.replace(/\*/,TGword);
//#があれば現在の値の数値部分と置換
if(EXword.match(/\#/)){
	if(TGword.match(/(\D*)([0-9]+)(.*)/)){
		var prefix=RegExp.$1;var num=RegExp.$2;var postfix=RegExp.$3;
		EXword=EXword.replace(/\#/,num);
		EXword=prefix+EXword+postfix;
	}
}
if(EXword.match(nas.CellDescription.interpRegex)){
        interpSign(EXword);
}else{
	xUI.sheetPut(EXword);
	xUI.spin("fwd");
}
	break;
case	"single":	;
case	"TSXall":	break;
default:	alert(id);return false;
	}
//	alert(id);
return false;
}
//チェックボックストグル操作
function chg(id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
	chkValue(id);
	return false;
}
/**
	ツールボックス初期化
*/
function initToolbox(){
//エレメントブラウザを初期化
	var Selector="";
	var selected=xUI.Select[0];
	for(var c=0;c<xUI.XPS.xpsTracks.length;c++){
		var myLabel=(c==xUI.XPS.xpsTracks.length-1)?"MEMO.":xUI.XPS.xpsTracks[c]["id"];
		if(c < xUI.dialogSpan ) myLabel="台詞"+ ((c>0)?c:"");
		Selector+=(selected==c)?'<option selected/>':'<option />';
		Selector+=myLabel;
	}
	document.getElementById("tBtrackSelect").innerHTML=Selector;
	reWriteCS();//cellセレクタの書き直し
	reWriteWS();//wordセレクタの書き直し
}

//入力補助セレクタを書き直す。
function reWriteCS(){
	var Selector='';
//セレクタはカレントのトラック種別で書き換えを行う。基本的にxMapエレメントを選択可能にするセレクタ
//xMapにグループが存在しないか、または不十分なときは基本データで埋める
switch (xUI.XPS.xpsTracks[xUI.Select[0]].option){
    case "timing":
		if(xUI.Select[0] < (xUI.XPS.xpsTracks.length-1))
	        var cOunt = (isNaN(xUI.XPS["xpsTracks"][xUI.Select[0]]["lot"]))?
            20 : xUI.XPS["xpsTracks"][xUI.Select[0]]["lot"];
        for(var f=1;f<=cOunt;f++){Selector+='<option />'+String(f);};
    break;
    case "dialog":
//        var wOrds=["____","<SE>","<BGM>","<V.O>","<背>","!"];
//        for(var f=1;f<=wOrds.length;f++){Selector+='<option value ="'+wOrds[f]+'">'+xUI.trTd(wOrds[f])+"</option>"};
//    break;
    default:
}
//	if(xUI.Select[0] >= xUI.dialogSpan || xUI.Select[0] < (xUI.XPS.xpsTracks.length-1)){};
	
	document.getElementById("tBitemSelect").innerHTML=Selector;
}
//お気に入り単語のセレクタを書き直す。
function reWriteWS(){
	var Selector='';
	var wCount=xUI.favoriteWords.length;
	for(var id=0;id<wCount;id++){Selector+='<option />'+xUI.favoriteWords[id]};
		document.getElementById("tBkeywordSelect").innerHTML=Selector;
	}
//
function toss(target){document.getElementById(target).focus();};
//
function hello(){
    alert("この辺は、まだなのだ。\nのんびり待っててチョ。\n Unimplemented. Please wait and leisurely Jo ");
}
/**					------pref.js
	環境設定パネル
*/
//プリファレンスオブジェクト作成
function Pref(){
	this.changed=false;
//ブランク方式
	this.Lists = new Array();
	this.Lists["prefBlmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["prefBlpos"]=["first","end","none"];
	this.Lists["prefAeVersion"]=["8.0","10.0"];
/*	AE 旧バージョンはサポート廃止
	this.Lists["prefAeVersion"]=["4.0","5.0","6.5","7.0","8.0"];
	this.Lists["prefKeyMethod"]=["min","opt","max"];
 */
	this.Lists["prefFpsF"]=["custom","auto","24","29.97","30","25","15","23.976","48","60"];
	this.Lists["prefFpsF"+"_name"]=["=CUSTOM=","コンポと同じ","FILM","NTSC","NDF","PAL","WEB","DF24","FR48","FR60"];
	this.Lists["prefDfSIZE"]=
["custom",
"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
"1280,720,1","1920,1080,1","1440,1080,1.333"];
	this.Lists["prefDfSIZE"+"_name"]=
["=CUSTOM=",
"VGA","DV","D1","D1sq",
"D4","D16","std-200dpi","std-144dpi",
"HD720","HDTV","HDV"];
    this.Lists["bgColorList"]=
["=CUSTOM=,=CUSTOM=,=CUSTOM=",
"#fff1ba,レモン,れもん",
"#f8b500,山吹,やまぶき",
"#88a3af,浅葱,あさぎ",
"#bce2e8,水色,みずいろ",
"#fef4f4,さくら,さくらいろ",
"#e198b4,桃色,ももいろ",
"#f2c288,びわ,びわ",
"#afafb0,銀鼠,ぎんねず",
"#f8f8f8,白練,しろねり"];
//リスト検索 指配列内の定された要素のサブ要素をあたってヒットしたら要素番号を返す。
this.Lists.aserch=function(name,ael){if(this[name]){for (var n=0;n<this[name].length;n++){if(this[name][n]==ael)return n}};return -1;}

	this.userName=xUI.currentUser.toString();
//ユーザ名変更  プリファレンスパネルは大幅に変更があるのでこのメッセージの翻訳は保留  :nas.uiMsg.
this.chgMyName=function(newName){
	if(! newName){
		var msg = localize(nas.uiMsg.dmAskUserinfo)+
		        "\n\n ハンドル:メールアドレス / handle:uid@example.com ";
		    msg=[msg];
		    msg.push("<hr><input id='new_user_account' type='text' autocomplete='on' list='recentUsers' size=48 value=''>");
//ユーザ変更UIを拡充
/*
    ブラウザにユーザを複数記録する。
    記録形式は  handle:uid  に変更する
    UI上は、ユーザID(マスタープロパティ)とハンドル（補助プロパティ）を別に提示
    ユーザIDリストで表示する   ユーザIDは、サインイン用のIDとして使用する

ユーザID
*/
		nas.showModalDialog("confirm",msg,localize(nas.uiMsg.userInfo),xUI.currentUser,function(){
		    if(this.status==0){
//このダイアログは直接xUIのプロパティを変更しない  一時オブジェクトを作成してPrefの表示のみを変更する
		        var newName = new nas.UserInfo(document.getElementById('new_user_account').value);
		        xUI.myPref.chgMyName(newName.toString());
		    }
		});
	}else{
	this.userName=newName;
	document.getElementById("myName").value=this.userName;
	if((!(xUI.currentUser.sameAs(this.userName)))&&(! this.changed)){this.changed=true;};
    }
}
//背景カラー変更  引数はエレメントid
/*  
    "prefBGColor",  "prefColorpick" または 候補ボタンID "bgColorList##" が引数として与えられる  
*/
this.chgColor = function(id){
	if (! id) id="prefBGColor";
    var targetColor = document.getElementById(id).value;
//    if(targetColor == "=CUSTOM="){targetColor=document.getElementById("prefBGColor").value;}
    document.getElementById("prefBGColor").value = targetColor;
    document.getElementById("prefColorpick").value = targetColor;
    document.getElementById("bgColorList").style.backgroundColor = targetColor;
    
    document.getElementById("bgColorList").style.backgroundColor = targetColor;
    return;
}
//ブランク関連変更
this.chgblk=function(id)
{
	if (id!="prefBlpos")
	{
//	method変更
		switch (document.getElementById("prefBlmtd").value)
		{
		case "0":
			document.getElementById("prefBlpos").disabled=false;
			break	;
		case "1":	;
		case "2":	;
		case "4":	;
			document.getElementById("prefBlpos").value=1;//end
			document.getElementById("prefBlpos").disabled=true;
			break	;
		case "3":	;
		default :	;
			document.getElementById("prefBlpos").value=0;//first
			document.getElementById("prefBlpos").disabled=true;
		}

	}
		if(! this.changed){this.changed=true;};
}

//フッテージフレームレート変更
this.chgfpsF=function(id)
{
	if(id!="SetFpsF"){
//	値を直接書き換えた
	document.getElementById("SetFpsF").value=
(this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString())==-1)?
0 : this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("prefFpsF").value=
(document.getElementById("SetFpsF").value == 0)?
document.getElementById("prefFpsF").value : this.Lists["prefFpsF"][document.getElementById("SetFpsF").value]
	}
		if(! this.changed){this.changed=true;};
}
//省略時サイズ変更
this.chgdfSIZE=function(id)
{
	if(id!="prefDfSizeSet"){
//	値を直接書き換えた
	var name=[
	    document.getElementById("prefDfX").value,
	    document.getElementById("prefDfY").value,
	    document.getElementById("prefDfA").value
	].join(",");

	document.getElementById("prefDfSizeSet").value=
(this.Lists.aserch("prefDfSIZE",name)==-1)?
0 : this.Lists.aserch("prefDfSIZE",name);
	}else{
//	セレクタを使った

	    var dfSIZE=this.Lists["prefDfSIZE"][document.getElementById("prefDfSizeSet").value];
		if(dfSIZE !="custom"){
	        document.getElementById("prefDfX").value = dfSIZE.split(",")[0];
	        document.getElementById("prefDfY").value = dfSIZE.split(",")[1];
	        document.getElementById("prefDfA").value = dfSIZE.split(",")[2];
		}
	}
	if(! this.changed) this.changed=true;
}

//フッテージフレームレート変更
this.chgprefFpsF=function(id)
{
	if(id!="SetFpsF"){
//	値を直接書き換えた
	document.getElementById("SetFpsF").value=
(this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString())==-1)?
0 : this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("prefFpsF").value=
(document.getElementById("SetFpsF").value == 0)?
document.getElementById("prefFpsF").value : this.Lists["prefFpsF"][document.getElementById("SetFpsF").value]
	}
		if(! this.changed){this.changed=true;};
}
//チェックボックストグル操作
this.chg=function(id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if(! this.changed){this.changed=true;};
	return false;
}
//viewMode変更
this.chgVM=function(myValue)
{
		document.getElementById("vMWordProp").checked =(myValue=='WordProp')? true:false;
		document.getElementById("vMCompact").checked  =(myValue=='Compact')?  true:false;
	if(xUI.viewMode != myValue){
		if(! this.changed){this.changed=true;};
	}
	return false;
}
//
//各種設定表示初期化
this.getProp=function()
{
//作業ユーザ名
	this.chgMyName(xUI.currentUser.toString());
//表示モード
	this.chgVM(xUI["viewMode"]);
//カラセル関連
	var idNames =["prefBlmtd","prefBlpos","prefAeVersion"];//不要プロパティ＞,"prefKeyMethod"
	var iNames  =["blmtd"    ,"blpos"    ,"aeVersion"    ];//,"keyMethod"    
	for (var i=0;i<idNames.length;i++ ){
		var idName = idNames[i];var name = iNames[i];
		document.getElementById(idName).value=
		this.Lists.aserch(idName,xUI[name]);
	}
	this.chgblk();
//キーオプション
	var keyNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	var kNames  =["fpsF"    ,"dfX"    ,"dfY"    ,"dfA"    ];
	for (var i=0;i<keyNames.length;i++){
		var idName = keyNames[i];var name = kNames[i];
		document.getElementById(idName).value=xUI[name];
	}
	this.chgprefFpsF();this.chgdfSIZE();

	document.getElementById("timeShift").checked=xUI["timeShift"];
// UI情報
//	document.getElementById("prefToolBar").checked=xUI["toolBar"];
//	document.getElementById("prefUtilBar").checked=xUI["utilBar"];

// シート情報
//ページ長・カラム・フットスタンプ
	document.getElementById("prefSheetLength").value=xUI.SheetLength;//nas["SheetLength"];
	document.getElementById("prefPageCol").checked=(xUI["PageCols"]==2)? true : false ;
	document.getElementById("prefFootMark").checked=xUI["footMark"];

//カウンタ
	document.getElementById("FCTo0").value=10*(xUI["fct0"][0])+xUI["fct0"][1];
	document.getElementById("FCTo1").value=10*(xUI["fct1"][0])+xUI["fct1"][1];

//ループアクション
	document.getElementById("cLoop").checked=xUI["cLoop"];
	document.getElementById("sLoop").checked=xUI["sLoop"];
	document.getElementById("autoScroll").checked=xUI["autoScroll"];
	document.getElementById("tabSpin").checked=xUI["tabSpin"];

	document.getElementById("noSync").checked=xUI["noSync"];

//シートカラー
    document.getElementById("prefBGColor").value = xUI.sheetLooks.SheetBaseColor;
    document.getElementById("prefColorpick").value = xUI.sheetLooks.SheetBaseColor;
    var selectButtons = "";
    for(var btid=0;btid<this.Lists["bgColorList"].length;btid++){
        var myProps = String(this.Lists["bgColorList"][btid]).split(",");
        selectButtons += '<button class=colorSelect id="bgColorList'
        selectButtons += nas.Zf(btid,2);
        selectButtons += '" onClick="xUI.myPref.chgColor(this.id)" value="';
        selectButtons += (myProps[0]=="=CUSTOM=")? xUI.sheetLooks.SheetBaseColor:myProps[0];
        selectButtons += '" title="';
        selectButtons += myProps[2];
        selectButtons += '" style="background-color:';
        selectButtons += (myProps[0]=="=CUSTOM=")? xUI.sheetLooks.SheetBaseColor:myProps[0];
        if (myProps[0]=="=CUSTOM="){
            selectButtons += ';border-color:black;border-width:1px;'
        }
        selectButtons += '"> </button>';
    }
    document.getElementById("bgColorList").innerHTML = selectButtons;
		if(this.changed){this.changed=false;};
}

//
//各種設定をドキュメントに反映
this.putProp=function ()
{
//名前変更
	var newUser=new nas.UserInfo(this.userName);
	if(!(xUI.currentUser.sameAs(newUser))){
		xUI.currentUser = newUser;//objectc
        xUI.recentUsers.addMember(newUser);//recentUsersにアイテム追加(トライ)
		xUI.XPS.update_user = xUI.currentUser;//object参照
	 xUI.sync("recentUsers");
	 xUI.sync("update_user");
	 xUI.sync("current_user");
	};
//カラセル関連
	var blankNames=["prefBlmtd","prefBlpos","prefAeVersion"];//,"prefKeyMethod"
	var iNames    =["blmtd"    ,"blpos"    ,    "aeVersion"];//,    "keyMethod"
	for (var i=0;i<blankNames.length;i++){
		name=blankNames[i];
		xUI[iNames[i]]=this.Lists[name][document.getElementById(name).value];
	}
//キーオプション
	var kOptNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	for (var i=0;i<kOptNames.length;i++){
		name=kOptNames[i];
		xUI[name]=document.getElementById(name).value;
	}
//読み込みタイムシフト
	xUI["timeShift"]=document.getElementById("timeShift").checked;
//UI情報
//	xUI["utilBar"]=document.getElementById("prefUtilBar").checked;
//viewMode
	var newMode=(document.getElementById("vMCompact").checked)?"Compact":"WordProp";
// シート情報
//ページ長・カラム
var cols=(document.getElementById("prefPageCol").checked==true)? 2 : 1;
if(	xUI.SheetLength !=document.getElementById("prefSheetLength").value ||
	xUI.PageCols !=  cols ||
	xUI.viewMode != newMode
){
	xUI["viewMode"] = newMode;
// シート外観の変更が必要なので再初期化する
	xUI.SheetLength=document.getElementById("prefSheetLength").value;
		xUI.PageLength	=xUI.SheetLength  *  xUI.XPS.framerate;
	xUI.PageCols= cols;
//実行
        xUI.resetSheet();
}
//フットスタンプ
    if(xUI.footMark != document.getElementById("prefFootMark").checked){
	    xUI.footstampReset(document.getElementById("prefFootMark").checked);
    }
//カウンタ
	xUI["fct0"]=
	[Math.floor(document.getElementById("FCTo0").value/10),
	document.getElementById("FCTo0").value%10];
	xUI["fct1"]=
	[Math.floor(document.getElementById("FCTo1").value/10),
	document.getElementById("FCTo1").value%10];
 xUI.sync("fct");		
//ループアクション
	xUI["cLoop"]=document.getElementById("cLoop").checked;
	xUI["sLoop"]=document.getElementById("sLoop").checked;
	xUI["autoScroll"]=document.getElementById("autoScroll").checked;
	xUI["tabSpin"]=document.getElementById("tabSpin").checked;
//	これだけは一時変更(なくしても良いかも)
	xUI["noSync"]=document.getElementById("noSync").checked;

//背景色
if( document.getElementById("prefBGColor").value != xUI.sheetLooks.SheetBaseColor){
    xUI.setBackgroundColor(document.getElementById("prefBGColor").value);
}

		if(this.changed){this.changed=false;};
}
//
//パネル初期化

this.init=function(){
    this.getProp();
// userID control disabled if onSite
    if (xUI.onSite){
        document.getElementById('myName').disabled = true;
    }else{
        document.getElementById('myName').disabled = false;        
    }
    if(serviceAgent.currentStatus=='online-single'){
        document.getElementById('prefBGColor').disabled = true;
    }else{
        document.getElementById('prefBGColor').disabled = false;        
    }
}

//パネルを開く
//すでに開いていたらNOP Return
this.open=function(){
		if($("#optionPanelPref").is(":visible")){
			return false;
		}else{
			this.init();
			xUI.sWitchPanel("Pref");
		}
	return null;
}
/**
	パネルを閉じる
	変更フラグ立っていれば確認して操作を反映
 */
this.close=function(){
	if(this.changed){if(confirm(localize(nas.uiMsg.dmPrefConfirmSave
))){this.putProp();}};
		xUI.sWitchPanel("Pref");
}

}
//test
//プリファレンスオブジェクト作成
//	var myPref=new Pref();
//さらに初期化(初期化込みでコールされた時でも良いかも)
//	xUI.myPref.init();
/*						-------scene.js
シーン設定ボックス用関数
2007/06/24 ScenePrefオブジェクト化


シーンプロパティ編集UIにモードを設ける
通常時は
A	シーン（カット）登録  Title/Opus/S_C + time
B	シーン属性編集	各トラックのプロパティ編集
の２面UIとする
Aは管理DBにエントリ登録を行う専用UI
BはXps（ステージ）の属性編集UI
二つの概念を分離して、それぞれのUIを作成すること
*/

function ScenePref(){
//内容変更フラグ
	this.changed=false;
	document.getElementById("scnReset").disabled=(! this.changed);
//
	this.tracks=0;//ローカルの トラック数バッファ・スタートアップ内で初期化
//各種プロパティとセレクタの対応を格納する配列

	this.Lists = new Array();

	this.Lists["blmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["blpos"]=["first","end","none"];
	this.Lists["AEver"]=["8.0","10.0"];
	this.Lists["KEYmtd"]=["min","opt","max"];

	this.Lists["framerate"]=["custom","23.976","24","30","29.97","59.96","25","50","15","48","60"];
	this.Lists["framerate_name"]=["=CUSTOM=","23.98","FILM","NTSC","SMPTE","SMPTE-60","PAL","PAL-50","WEB","FR48","FR60"];
	this.Lists["SIZEs"]=[	"custom",
							"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
							"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
							"1280,720,1","1920,1080,1","1440,1080,1.333"];

	this.Lists["dfSIZE"+"_name"]=[	"=CUSTOM=",
									"VGA","DV","D1","D1sq",
									"D4","D16","std-200dpi","std-144dpi",
									"HD720","HDTV","HDV"];

//リストにaserchメソッドを付加 List.aserch(セクション,キー) result;index or -1 (not found)

this.Lists.aserch =function(name,ael){for(var n=0;n<this[name].length;n++){if(this[name][n]==ael)return n};return -1;}

//変更関連
this.chgProp = function (id){
	var	name	=id.split("_")[0];
	var	number	=id.split("_")[1];
		switch (name)
		{
		case "scnLopt":	this.chgopt(name,number);break;
		case "scnLlbl":	this.chglbl(name,number);break;
		case "scnLlot":	this.chglot(name,number);break;
		case "scnLbmd":	;
		case "scnLbps":	this.chgblk(name,number);break;
		case "scnLszT":	;
		case "scnLszX":	;
		case "scnLszY":	;
		case "scnLszA":	this.chgSIZE(name,number);break;
		}
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
this.chgopt =function (){return;}
this.chglbl =function (name,number){
	var newLabels=[];
	for(var i=0;i<(this.tracks-1);i++){
		newLabels.push(document.getElementById(name+"_"+i).value);
	}
	document.getElementById("scnLayersLbls").value=newLabels.join();
	return;
}
this.chglot =function (){return;}

//レイヤ数変更
this.chglayers =function (id){

	if(id=="scnLayersLbls"){
//レイヤラベルボックス内で指定されたエレメントの数でレイヤ数を決定する
		document.getElementById("scnLayers").value=document.getElementById("scnLayersLbls").value.split(",").length;		
		if(this.tracks!=(document.getElementById("scnLayers").value)){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
    	document.getElementById("scnReset").disabled=(! this.changed);
		return;
	}
	if(id=="scnLayers"){
		if(isNaN(document.getElementById("scnLayers").value))
		{
			alert(localize(nas.uiMsg.requiresNumber));
			return;
		}
		if(document.getElementById("scnLayers").value<=0)
		{
			alert(localize(nas.uiMsg.requiresPositiveInteger));
			return;
		}
		if(document.getElementById("scnLayers").value>=27)
		{
var msg=localize(nas.uiMsg.dmAlertMenytracks);//レイヤ数多すぎの警告
if(! confirm(msg)){
		document.getElementById("scnLayers").value=this.tracks;//リセット
			return;
}
		}
//値を整数化しておく
		document.getElementById("scnLayers").value=Math.round(document.getElementById("scnLayers").value);

		document.getElementById("scnLayersLbls").value=this.mkNewLabels(document.getElementById("scnLayers").value-xUI.dialogSpan).join();

		if(this.tracks!=document.getElementById("scnLayers").value){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
	    document.getElementById("scnReset").disabled=(! this.changed);
		return;
	}

/*
	//tracks=//現在のテーブル上のトラック数（ダイアログ及びコメント含む）
	var chgLys=
	(document.getElementById("scnLayers").value!=this.tracks)?
	true	:	false	;//変更か?
//確認
	if (chgLys){
		if(confirm("レイヤテーブルを再描画します。\nシートを 更新/作成 するまでは、実際のデータの変更は行われません。\n\t再描画しますか？"))
		{
//			レイヤ数変わってテーブル変更なのでテーブル出力
			this.layerTableUpdate();
		}else{
			document.getElementById("scnLayers").value=this.tracks;//トラック数復帰
			this.layerTableUpdate();
		}
	}
*/

}
//
//ブランク関連変更
this.chgblk =function (name,number)
{
	if (name!="Lbps")
	{
//	methodの変更に合わせてposition変更
		switch (document.getElementById("scnLbmd_"+number).value)
		{
		case "expression1":
			document.getElementById("scnLbps_"+number).value="first";
			document.getElementById("scnLbps_"+number).disabled=true;
			break;
		case "file":
			document.getElementById("scnLbps_"+number).disabled=false;
			break;
		case "opacity":	;
		case "wipe":	;
		case "channelShift":	;
		default :
			document.getElementById("scnLbps_"+number).value="end";
			document.getElementById("scnLbps_"+number).disabled=true;
			break;
		}
	}
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
//コンポフレームレート変更
this.chgFRATE =function (id)
{
	if(id!="scnSetFps"){
//	値を直接書き換えた
	document.getElementById("scnSetFps").value=
(this.Lists.aserch("framerate",document.getElementById("scnFramerate").value.toString())==-1)?
0 : this.Lists.aserch("framerate",document.getElementById("scnFramerate").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("scnFramerate").value=
(document.getElementById("scnSetFps").value == 0)?
document.getElementById("scnFramerate").value : this.Lists["framerate"][document.getElementById("scnSetFps").value] ;
	}
nas.RATE=this.Lists["framerate_name"][document.getElementById("scnSetFps").value];
nas.FRATE = nas.newFramerate(nas.RATE,Number(document.getElementById("scnFramerate").value));
//内部計算用なので親のレートは変更しない
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
//省略時サイズ変更
this.chgSIZE =function (name,number)
{
	if(name!="scnLszT"){
//	値を直接書き換えた
	var valset=[
	    document.getElementById("scnLszX_"+number).value,
	    document.getElementById("scnLszY_"+number).value,
	    document.getElementById("scnLszA_"+number).value
	].join(",");

	document.getElementById("scnLszT_"+number).value=
(this.Lists.aserch("SIZEs",valset)==-1)?
0 : this.Lists.aserch("SIZEs",valset);
	}else{
//	セレクタを使った

	var SIZE=this.Lists["SIZEs"][document.getElementById("scnLszT_"+number).value];
		if(SIZE !="custom"){
	        getElementById("scnLszX_"+number).value=SIZE.split(",")[0];
	        getElementById("scnLszY_"+number).value=SIZE.split(",")[1];
	        getElementById("scnLszA_"+number).value=SIZE.split(",")[2];
		};
	};
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
//新規作成のスイッチトグル
this.chgNewSheet =function (){
	var dist=(! document.getElementById("scnNewSheet").checked)? true:false;
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);

//新規作成から更新に戻した場合は、時間とレイヤ数を
//親オブジェクトから複写して上書き思ったが、どうせ暫定なのでとりあえずリセット
	if(dist) {this.getProp()}
}

//チェックボックストグル操作
this.chg =function (id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if (id=="newSheet") this.chgNewSheet();

	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
//テキストボックス書き換え
this.rewrite =function (id)
{
if(config.dbg){dbgPut(id);}
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
	return false;//フォーム送信抑止
}
/*
    引数の数だけラベルを作って返す
    現行のドキュメント変更時は、現在のラベルを取得する
*/
this.mkNewLabels=function(timingLayers,dialogs){
    if (document.getElementById("scnNewSheet").checked){
        if(! dialogs) dialogs = 1
    }else{
        dialogs = xUI.dialogSpan;
    }
//現状のダイアログトラック数を取得するかまたはデフォルト値のダイアログ数1
	var myLabels=[];
	for(var Tidx=0;Tidx<(timingLayers+dialogs);Tidx++){
		if((! document.getElementById("scnNewSheet").checked)&&(Tidx<xUI.XPS.xpsTracks.length-1)){
			myLabels.push(xUI.XPS.xpsTracks[Tidx].id);
		}else{
		    if(Tidx<dialogs){
				myLabels.push("N"+((Tidx==0)?"":String(Tidx)));
			}else if((Tidx-dialogs)<26){
				myLabels.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Tidx-dialogs));
			}else{
					myLabels.push(String(Tidx));
			}
		}
	}
return myLabels;
}
//
/**
  201802改修  レイヤブラウザの位置づけ変更
  AE依存のパラメータを使用しない
  基本はデータ編集をロックして閲覧のみ
  引数はトラック数
*/
this.mkLayerSheet =function (lot){
//	レイヤブラウザを作る  終端のフレームコメントを除くすべて
//	引数はレイヤの数
var body_='<table cellspacing=0 cellpadding=0 border=0 >';//

//タイトルつける +1はタイトル
body_+='<tr><th colspan='+(lot+1)+'>詳細指定</th></tr>';//
//インデックスを配置 0-
			body_+='<tr><th>ID:</th>';//
for(var i=0;i<lot;i++){	body_+='<td>'+ String(i)+'</td>'}
			body_+='</tr>';//

/*
var labelOptions=[
	"option","link","tag","label","lot","blmtd","blpos",
	"size","sizeX","sizeY","aspect"
];
*/
var labelOptions=[
	"種別","リンク","親","タグ","ラベル",
	"セル枚数","カラセル","配置",
	"プリセット",
	"sizeX","sizeY","aspect"
];
var Labels=["Lopt_","Llnk_","Lpnt_","Ltag_","Llbl_","Llot_","Lbmd_","Lbps_","LszT_","LszX_","LszY_","LszA_"
];
	for (var opt=0;opt<labelOptions.length;opt++)
	{
if(config.dbg){dbgPut("check labelOptions : "+ opt)}
		body_+='<tr><th nowrap> '+labelOptions[opt]+' </th>';//
		for(var i=0;i<lot;i++)
		{
// currentTimeline = xUI.XPS.xpsTimeline(i)
			body_+='<td class=layerOption>';//

//idは、種別前置詞+レイヤ番号で

//		if(confirm("Stop? : [ "+opt.toString()+" ]"+Labels[opt])){return false};

	switch(Labels[opt])
{
case	"Lopt_":	body_+='<SELECT id="scnLopt_';	//レイヤオプション:0
		break;
case	"Llnk_":	body_+='<input type=text id="scnLlnk_';	//リンクパス:1
		break;
case	"Lpnt_":	body_+='<input type=text id="scnLpnt_';	//Parentパス:2
		break;
case	"Ltag_":	body_+='<input type=text id="scnLtag_';	//タグ:3
		break;
case	"Llbl_":	body_+='<input type=text id="scnLlbl_';	//ラベル:4
		break;
case	"Llot_":	body_+='<input type=text id="scnLlot_';	//ロット:5
		break;
case	"Lbmd_":	body_+='<SELECT id="scnLbmd_';	//カラセルメソッド:6
		break;
case	"Lbps_":	body_+='<SELECT id="scnLbps_';	//カラセル位置:7
		break;
case	"LszT_":	body_+='<SELECT id="scnLszT_';	//サイズまとめ:8
		break;
case	"LszX_":	body_+='<input type=text id="scnLszX_';	//サイズX:9
		break;
case	"LszY_":	body_+='<input type=text id="scnLszY_';	//サイズY:10
		break;
case	"LszA_":	body_+='<input type=text id="scnLszA_';	//アスペクト:11
		break;
default	:alert(opt);
}
//番号追加
	body_+=String(i);


body_+='" onChange="myScenePref.chgProp(this.id)"';//共通
body_+=' style="text-align:center;width:100px"';//共通
	if (opt==1||opt==2||opt==3||opt==4||opt==5||opt>8)
	{
body_+=' value=""'	;//text値はアトデ
body_+='>';
	}else{
body_+='>';

var optS=opt.toString(10);
	switch (optS)
	{
case	"0":
//オプション別/セレクタもの	レイヤオプション
body_+='<OPTION VALUE=still >still';//
body_+='<OPTION VALUE=timing >timing';//
body_+='<OPTION VALUE=dialog >dialog';//
body_+='<OPTION VALUE=sound >sound';//
body_+='<OPTION VALUE=camera >camera';//
body_+='<OPTION VALUE=sfx >geometry';//
body_+='<OPTION VALUE=sfx >effects';//
break;

case	"6":
//オプション別/セレクタもの	カラセルメソッド
body_+='<OPTION VALUE=file > ファイル ';//
body_+='<OPTION VALUE=opacity > 不透明度 ';//
body_+='<OPTION VALUE=wipe > リニアワイプ ';//
body_+='<OPTION VALUE=channelShift > チャンネルシフト';//
body_+='<OPTION VALUE=expression1 > 動画番号トラック';//
break;

case	"7":
//オプション別/セレクタもの	カラセル位置
body_+='<OPTION VALUE=build >--------';//
body_+='<OPTION VALUE=first >最初の絵を使う';//
body_+='<OPTION VALUE=end >最後の絵を使う';//
body_+='<OPTION VALUE=none >カラセルなし';//
break;

case	"8":
//オプション別/セレクタもの	サイズまとめ
body_+='<OPTION VALUE=0 >=CUSTOM=';//
body_+='<OPTION VALUE=1 >VGA(640x480,1.0)';//
body_+='<OPTION VALUE=2 >DV(720x480,0.9)';//
body_+='<OPTION VALUE=3 >D1(720x486,0.9)';//
body_+='<OPTION VALUE=4 >D1sq(720x540,1.0)';//
body_+='<OPTION VALUE=5 >D4(1440x1024,1.0)';//
body_+='<OPTION VALUE=6 >D16(2880x2048,1.0)';//
body_+='<OPTION VALUE=7 >std-200dpi(1772x1329,1.0)';//
body_+='<OPTION VALUE=8 >std-144dpi(1276x957,1.0)';//
body_+='<OPTION VALUE=9 >HD720(1280x720,1.0)';//
body_+='<OPTION VALUE=10 >HDTV(1980x1080,1.0)';//
body_+='<OPTION VALUE=11 >HDV(1440x1080,1.333)';//
break;
	}

body_+='</SELECT>';//セレクタものならば閉じる
}

body_+='<br></td>';//

		}
body_+='</tr>';//
	}
body_+='</table>';//

return body_;
}
//
this.openTable=function(){
	if(document.getElementById("scnCellTable").style.display=="inline"){

		document.getElementById("scnCellTable").style.display="none";
	}else{
		document.getElementById("scnCellTable").style.display="inline";
	}
}
//
this.layerTableNameUpdate=function(){
		var myNames=document.getElementById("scnLayersLbls").value.split(",");
		for(var i=0;i<this.tracks;i++){
			document.getElementById("scnLlbl_"+i).value=myNames[i];
		}

}
this.layerTableUpdate =function(){
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
		this.getLayerProp();
		this.tracks=parseInt(document.getElementById("scnLayers").value);
		this.layerTableNameUpdate();
}

//各種設定表示初期化
this.getProp =function ()
{
    document.getElementById("scnRepository").innerHTML = (! xUI.XMAP.dataNode)?
        [serviceAgent.currentRepository.url,serviceAgent.currentRepository.name].join("/"):
        "This data is not stored in any repository.";
//このデータはいずれのリポジトリにも保存されていません
        document.getElementById("scnNewSheet").checked=false;//新規フラグダウン
    if (! xUI.XMAP.dataNode){
        document.getElementById("scnPushentry").disabled=false;
    }else{
        document.getElementById("scnPushentry").disabled=true;
    }
//ドキュメントパネルから新規ドキュメントフラグを削除  削除に伴う変更まだ
//ドキュメント一覧からプロジェクト一覧を取得してリストに展開する
/*
    var myProducts = documentDepot.products;
        this.titles   =[];    this.episodes =[];
    for (var pix=0;pix<documentDepot.products.length;pix++){
        var product=Xps.parseProduct(documentDepot.products[pix]);
        this.episodes.push(product);
        this.titles.add(product.title);
    }
    document.getElementById("scnTitleList").innerHTML="";//クリア
    for(var tix=0;tix<this.titles.length;tix++){
        var opt=document.createElement("option");
        opt.value = this.titles[tix];
        document.getElementById("scnTitleList").appendChild(opt);
    }
    this.reWrite("scnTitle");
// */
//レイヤ数取得
	if (this.tracks != (xUI.XPS.xpsTracks.length-1)){
		this.tracks =  (xUI.XPS.xpsTracks.length-1);//バックアップとる
		document.getElementById("scnLayers").value=	this.tracks;
//ラベルウェルを書き換え
		document.getElementById("scnLayersLbls").value = this.mkNewLabels(this.tracks-xUI.dialogSpan).join();
//レイヤ数変わってテーブル変更なのでテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);

	}else{
		document.getElementById("scnLayers").value=this.tracks;
	}
	if(document.getElementById("scnNewSheet").checked){
        document.getElementById("scnLayers").disabled = false;
        document.getElementById("scnLayersLbls").disabled = false;
    }else{
        document.getElementById("scnLayers").disabled = true;
        document.getElementById("scnLayersLbls").disabled = true;
    }
//変換不要パラメータ "mapfile",
	var names=[
"title","subtitle","opus","scene","cut","framerate",
"create_time","create_user","update_time","update_user"
];
	var ids=[
"scnTitle","scnSubtitle","scnOpus","scnScene","scnCut","scnFramerate",
"scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"
];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]).value = xUI.XPS[names[i]];
		document.getElementById(ids[i]).disabled = (xUI.onSite)? true:false;
	}
//シートメモ転記
		document.getElementById('scnMemo').value=xUI.XPS.xpsTracks.noteText;
        
	var names=["create_time","create_user","update_time","update_user"];
	var ids=["scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]+"TD").innerHTML=
		(document.getElementById(ids[i]).value=="")?"<br>":
		xUI.trTd(document.getElementById(ids[i]).value);
	}

//取得したシートのフレームレートをnasのレートに代入する
	nas.FRATE= nas.newFramerate(document.getElementById("scnFramerate").value);
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value=
		nas.Frm2FCT(xUI.XPS.time(),3,0,xUI.XPS.framerate);
		document.getElementById("scnTrin").value=
		xUI.XPS["trin"][1];
		document.getElementById("scnTrinT").value=
		nas.Frm2FCT(xUI.XPS["trin"][0],3,0,xUI.XPS.framerate);
		document.getElementById("scnTrot").value=
		xUI.XPS["trout"][1];
		document.getElementById("scnTrotT").value=
		nas.Frm2FCT(xUI.XPS["trout"][0],3,0,xUI.XPS.framerate);

//		document.getElementById("scn").value=
//		document.getElementById("scnLayers").value=

//	if(document.getElementById("scnCellTable").style.display!="none"){	};
		this.getLayerProp();
	this.changed=false;
	document.getElementById("scnReset").disabled=(! this.changed);
}
this.getLayerProp =function (){
//レイヤ情報テーブルに値をセット
	var myLabels=document.getElementById("scnLayersLbls").value.split(",");

	if (this.tracks >(xUI.XPS.xpsTracks.length-1)){this.tracks=xUI.XPS.xpsTracks.length-1}
	for(var i=0;i<document.getElementById("scnLayers").value;i++)
	{
	    var currentTrack = xUI.XPS.xpsTracks[i];
		if (i<this.tracks &&! document.getElementById("scnNewSheet").checked)
		{
			document.getElementById("scnLopt_"+i).value=
			currentTrack["option"]; // 種別  0番は固定
	        document.getElementById("scnLopt_"+i).disabled = (i==0)? true:false;

			document.getElementById("scnLlnk_"+i).value=
			currentTrack["link"];//リンク  現在固定
			document.getElementById("scnLlnk_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			currentTrack["parent"];//ペアレント  現在固定
			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLtag_"+i).value=
			currentTrack["tag"];//tag
			document.getElementById("scnLlbl_"+i).value=
			currentTrack["id"];//ラベル
			
			document.getElementById("scnLlot_"+i).value=
			currentTrack["lot"];//数量
			document.getElementById("scnLlot_"+i).disabled=(currentTrack.option=="timing")?false:true;;

			document.getElementById("scnLszX_"+i).value=
			currentTrack["sizeX"];
			document.getElementById("scnLszX_"+i).disabled=(currentTrack.option=="timing")?false:true;;
			document.getElementById("scnLszY_"+i).value=
			currentTrack["sizeY"];
			document.getElementById("scnLszY_"+i).disabled=(currentTrack.option=="timing")?false:true;;
			document.getElementById("scnLszA_"+i).value=
			currentTrack["aspect"];
			document.getElementById("scnLszA_"+i).disabled=(currentTrack.option=="timing")?false:true;;

			document.getElementById("scnLbmd_"+i).value=
			currentTrack["blmtd"];
			document.getElementById("scnLbmd_"+i).disabled=(currentTrack.option=="timing")?false:true;
			document.getElementById("scnLbps_"+i).value=
			currentTrack["blpos"];
			document.getElementById("scnLbps_"+i).disabled=(currentTrack.option=="timing")?false:true;

		}else{

			document.getElementById("scnLopt_"+i).value=
			(i==0)?"dialog":"timing";
			document.getElementById("scnLopt_"+i).disabled=
			(i==0)?true:false;

			document.getElementById("scnLlnk_"+i).value=
			".";
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			".";
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLtag_"+i).value=
			'';
			document.getElementById("scnLlbl_"+i).value=myLabels[i];

			document.getElementById("scnLlot_"+i).value=
			"=AUTO=";

			document.getElementById("scnLszX_"+i).value=
			xUI.dfX;

			document.getElementById("scnLszY_"+i).value=
			xUI.dfY;

			document.getElementById("scnLszA_"+i).value=
			xUI.dfA;


			document.getElementById("scnLbmd_"+i).value=
			xUI.blmtd;

			document.getElementById("scnLbps_"+i).value=
			xUI.blpos;
		}
				this.chgSIZE("LszA",i.toString());
				this.chgblk("Lbmd",i.toString());
	}
}
//バルクシートの設定
this.newProp =function (showMsg)
{
    if(showMsg){
	    var msg = localize(nas.uiMsg.dmComfirmNewxSheetprop);
        var go = confirm(msg);
    }else{
        var go = true;        
    }
  if (go){
	document.getElementById("scnNewSheet").checked=true;//新規チェック入れる

//レイヤ数デフォルトに設定
		document.getElementById("scnLayers").value=Number(SheetLayers)+Number(SoundColumns);
//レイヤ名表示更新
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(Number(SheetLayers),Number(SoundColumns)).join();
		this.tracks=document.getElementById("scnLayers").value;
//レイヤテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
//デフォルトパラメータを設定
  Now =new Date();
	document.getElementById("scnMapfile").innerHTML="no mapfile";
	document.getElementById("scnTitle").value=myTitle;
	document.getElementById("scnSubtitle").value=mySubTitle;
	document.getElementById("scnOpus").value=myOpus;
	document.getElementById("scnScene").value=myScene;
	document.getElementById("scnCut").value=myCut;
	document.getElementById("scnFramerate").value=myFrameRate;

	document.getElementById("scnCreate_time").value=Now.toNASString();
	document.getElementById("scnCreate_user").value=xUI.currentUser;//myName;
	document.getElementById("scnUpdate_time").value="";
	document.getElementById("scnUpdate_user").value=xUI.currentUser;//myName;

	document.getElementById("scnMemo").value="";
//	document.getElementById("scn").value=;
//	document.getElementById("").value=;
//	document.getElementById("").value=;
	var names=["scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"];
	for (var i=0;i<names.length;i++){
		name=names[i];
		document.getElementById(name+"TD").innerHTML=
		(document.getElementById(name).value=="")?"<br>":
		xUI.trTd(document.getElementById(name).value);
//console.log([name,document.getElementById(name).value]);
	}
//取得したシートのフレームレートをnasのレートに代入する
	nas.FRATE= nas.newFramerate(document.getElementById("scnFramerate").value);
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value=Sheet;
		document.getElementById("scnTrin").value="trin";
		document.getElementById("scnTrinT").value="00+00.";
		document.getElementById("scnTrot").value="trout";
		document.getElementById("scnTrotT").value="00+00.";
	this.layerTableUpdate();
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
  }else{
	return;
  }
}
//ダイアログの値更新にともなう動的変更
this.reWrite = function(eid){
    switch(eid){
    case "scnTitle":
        //タイトル変更にともなうリスト更新
        document.getElementById("scnOpusList").innerHTML="";//クリア
        for(var eix=0;eix<this.episodes.length;eix++){
            if ((this.episodes[eix].title == document.getElementById("scnTitle").value)||
            (document.getElementById("scnTitle").value=="")){
                var opt=document.createElement("option");
//            opt.value = this.episodes[eix].opus;
                opt.value = documentDepot.products[eix];
                document.getElementById("scnOpusList").appendChild(opt);
            }
        }
    break;
    case "scnOpus":
        //Opusの内容がリストと一致している場合のみサブタイトルとリストを更新する
        //Title文字列がカラの場合のみタイトルも変更する
        for(var pix=0;pix<documentDepot.products.length;pix++){
            if(documentDepot.products[pix]==document.getElementById("scnOpus").value){
                if(document.getElementById("scnTitle").value==""){
                    document.getElementById("scnTitle").value=this.episodes[pix].title;
                }
                document.getElementById("scnOpus").value= this.episodes[pix].opus;
                document.getElementById("scnSubtitle").value=this.episodes[pix].subtitle;
                break;
            }
        }
    break;
    }
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
//各種設定表示更新
this.putProp =function (){
//	現在のドキュメントは未保存か？
	if(! xUI.checkStored()){return}
//レイヤテーブルを自動更新で処理続行
//		this.layerTableUpdate();

//	現在の時間からカット継続時間を一時的に生成
//	framerate?
	var duration=(
nas.FCT2Frm(document.getElementById("scnTrinT").value)+
nas.FCT2Frm(document.getElementById("scnTrotT").value))/2+
nas.FCT2Frm(document.getElementById("scnTime").value);
	var oldduration=xUI.XPS.duration();
	var durationUp=(duration>oldduration)? true : false ;
//	レイヤ数の変更を一時変数に取得
	var newWidth=this.tracks;//新幅コメント含まず
	var oldWidth=xUI.XPS.xpsTracks.length-1;//もとの長さを控える
	var widthUp =(newWidth>oldWidth)?true:false;//増えたか?
//	新規作成ならば細かいチェックは不要
	if(document.getElementById("scnNewSheet").checked){
	var msg = localize(nas.uiMsg.alertNewdocumet) ;//新規シートを作成します。
    msg += "\n"+localize(nas.uiMsg.alertDiscardedit);//現在の編集内容は、破棄されます。
    msg += "\n\n"+localize(nas.uiMsg.confirmExecute);//実行してよろしいですか?
	}else{
//	現内容の変更なので一応確認
//	レイヤ数の変更確認
	var msg="";
		if(newWidth!=oldWidth){
			msg += localize(nas.uiMsg.alertTrackschange)+"\n";//レイヤ数が変更されます
			if (!widthUp)
			msg += "\t"+ localize(nas.uiMsg.alertDiscardtracks )+"\n";//消去されるレイヤの内容は破棄されます
		}
//	カット尺更新確認
		if(duration!=oldduration){
			msg+= localize(nas.uiMsg.alertDurationchange)+"\n";//カットの尺が変更されます
			if (!durationUp)
			msg += "\t"+localize(nas.uiMsg.alertDiscardframes)+"\n";//消去されるフレームの内容は破棄されます。
		}
//
		msg += localize(nas.uiMsg.confirmExecute);//実行してよろしいですか
	}
//確認
	if(confirm(msg)){
	if (
		(document.getElementById("scnNewSheet").checked)	||
		(newWidth!=oldWidth)	||
		(duration!=oldduration)
	)
	{ var changeSheet=true; }else{ var changeSheet=false; }
//	実際のデータ更新
    if(document.getElementById("scnNewSheet").checked) xUI.setUImode('floating');
//シートメモ転記
		xUI.XPS.xpsTracks.noteText = document.getElementById("scnMemo").value;
//値の変換不要なパラメータをまとめて更新  "mapfile"を削除  ユーザ編集は可能性自体が無い
	var names=[
"title","subtitle","opus","scene","cut"
	];//
	var ids=[
"scnTitle","scnSubtitle","scnOpus","scnScene","scnCut"
	];//
	for (var i=0;i<names.length;i++){
		xUI.XPS[names[i]]=document.getElementById(ids[i]).value;
	}


// //////新規作成なら現在のシート内容をフラッシュ ?
		if (document.getElementById("scnNewSheet").checked){xUI.flush();}
// /////////
//レイヤ数を設定
	this.tracks=parseInt(document.getElementById("scnLayers").value);
if(true){
dbgPut("元タイムシートは : "+oldWidth+" 列/ "+oldduration+"コマ\n 新タイムシートは : "+newWidth+" 列/ "+duration+"コマ です。\n ");
}
//継続時間とレイヤ数で配列を更新
	xUI.reInitBody((this.tracks+1),duration);

//		プロパティの更新
		xUI.XPS["trin"]=
[nas.FCT2Frm(document.getElementById("scnTrinT").value),
document.getElementById("scnTrin").value
];
		xUI.XPS["trout"]=
[nas.FCT2Frm(document.getElementById("scnTrotT").value),
document.getElementById("scnTrot").value
];

//本体シートのフレームレート更新
	xUI.XPS.framerate= nas.newFramerate(nas.FRATE.toString());
	xUI.XPS.rate=xUI.XPS.framerate.name;
//書き直しに必要なUIのプロパティを再設定
	xUI.PageLength=
	xUI.SheetLength*Math.ceil(xUI.XPS.framerate);//1ページのコマ数
//新規作成時はundo関連をリセット
    if(document.getElementById("scnNewSheet").checked){
	    xUI.flushUndoBuf();
	    xUI.sync("undo"); xUI.sync("redo");
    }
//	レイヤプロパティ更新
	this.putLayerProp();

//	尺または、レイヤ数の変更があるか、新規作成ならばシートを初期化

	if (changeSheet){
//	xUI.sWitchPanel("Prog");

//カーソル位置初期化
	xUI.selectCell("1_0");

        xUI.resetSheet();
		//nas_Rmp_Init();
//AIR環境の場合カレントファイルを初期化する
	if(isAIR){fileBox.currentFile=null;};//忘れていたとほほ
	}else{
//	それ以外はシート情報表示のみを更新
	 xUI.sync("info_");
	 xUI.sync("lbl");
	}
//タイトル初期化・保存フラグ強制アクティブ
	xUI.setStored("force");
 xUI.sync();
//パネルを再初期化
	this.getProp();
	this.chgFRATE();
	this.changed=false;
	document.getElementById("scnReset").disabled=(! this.changed);
		this.close();
//	xUI.sWitchPanel("Prog");
	}else{
	    alert(localize(nas.uiMsg.aborted));
	}
}
//更新操作終了
this.putLayerProp =function ()
{
//テーブルから読み出した値をXPSにセット
	var oldlayers=(xUI.XPS.xpsTracks.length-1);//もとの長さを控える

	var widthUp=(oldlayers<this.tracks)?true:false;
	for(var i=0;i<this.tracks;i++)
	{
		if (i>=oldlayers){
			xUI.XPS.xpsTracks.insertTrack(new XpsTimelineTrack(
				"NABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(i),
				(i==0)?"dialog":"timing",
				xUI.XPS.xpsTracks,
				xUI.XPS.xpsTracks.duration,
				i
			));
			xUI.XPS["xpsTracks"][i]["lot"]= "=AUTO=";
			xUI.XPS["xpsTracks"][i]["sizeX"]= xUI.dfX;
			xUI.XPS["xpsTracks"][i]["sizeY"]= xUI.dfY;
			xUI.XPS["xpsTracks"][i]["aspect"]= xUI.dfA;
			xUI.XPS["xpsTracks"][i]["blmtd"]= xUI.blmtd;
			xUI.XPS["xpsTracks"][i]["blpos"]= xUI.blpos;
		}else{
			xUI.XPS["xpsTracks"][i]["option"]= document.getElementById("scnLopt_"+i).value;
			xUI.XPS["xpsTracks"][i]["link"]= document.getElementById("scnLlnk_"+i).value;
			xUI.XPS["xpsTracks"][i]["tag"]= document.getElementById("scnLtag_"+i).value;
			xUI.XPS["xpsTracks"][i]["id"]= document.getElementById("scnLlbl_"+i).value;
			xUI.XPS["xpsTracks"][i]["lot"]= document.getElementById("scnLlot_"+i).value;
			xUI.XPS["xpsTracks"][i]["sizeX"]= document.getElementById("scnLszX_"+i).value;
			xUI.XPS["xpsTracks"][i]["sizeY"]= document.getElementById("scnLszY_"+i).value;
			xUI.XPS["xpsTracks"][i]["aspect"]= document.getElementById("scnLszA_"+i).value;
			xUI.XPS["xpsTracks"][i]["blmtd"]= document.getElementById("scnLbmd_"+i).value;
			xUI.XPS["xpsTracks"][i]["blpos"]= document.getElementById("scnLbps_"+i).value;
		}
	}
	xUI.XPS.xpsTracks.renumber();
}
//プロシジャ部分抜きだし
//パネル初期化
this.init =function (opt){
    switch (opt){
    case "edit":
        document.getElementById('scnNewSheet').checked="false";
        document.getElementById('scnNewDocument').style="display:none";
        document.getElementById('scnPushentry').style="display:none";
        document.getElementById('scnUpdate').style="display:inline";
        document.getElementById('scnNew').style="display:none";
    break;
    case "push":
        document.getElementById('scnNewSheet').checked="false";
        document.getElementById('scnNewDocument').style="display:none";
        document.getElementById('scnPushentry').style="display:inline";
        document.getElementById('scnUpdate').style="display:none";
        document.getElementById('scnNew').style="display:none";
    break;
    case "new":
    default:
        document.getElementById('scnNewSheet').checked="true";
        document.getElementById('scnNewDocument').style="display:inline";
        document.getElementById('scnPushentry').style="display:none";
        document.getElementById('scnUpdate').style="display:none";
        document.getElementById('scnNew').style="display:inline";
    };
	this.Lists = PropLists;//現状だとオブジェクト参照
	this.getProp();
	this.chgFRATE();
	this.changed=false;
	document.getElementById("scnReset").disabled=(! this.changed);
    if(opt=='new') this.newProp();
}
/** パネルを開く
 *すでに開いていたら NOP リターン
 */
this.open=function(opt){
    if(! opt) opt = 'edit';
		if(document.getElementById("optionPanelScn").style.display=="inline"){
			return false;
		}else{
			xUI.sWitchPanel("Scn");
			this.init(opt);
		}
	return null;
}
//パネルを閉じる

this.close=function(){
	//変更フラグ立っていれば確認して操作反映
	//新規作成モードの際は無条件でクロース
	if(
	    (document.getElementById("scnNewSheet").checked == false)&&
	    (this.changed)
	){if(confirm(localize(nas.uiMsg.dmPrefConfirmSave))){this.putProp();}};//設定変更確認
	//パネル閉じる
		xUI.sWitchPanel("Scn")
}

};
//ScenePrefオブジェクト終了
/**
    サウンド関連オブジェクト編集パネル
    201704現在はダイアログ関連のみ
*/
/*
    ダイアログ(SoundEdit)編集パネル
    サウンドオブジェクトプロパティを表示編集するUI
    変更内容は常時タイムシートと同期させる
*/
var SoundEdit = {
    panel:document.getElementById('optionPanelSnd'),
    changed:false,
    duration:0,
    timeLock:0,
//0:inPointLock,1:outPointLock,2:durationLock
/*
label参照配列  カット／作品内のラベルをストアして入力候補として提示するためのデータ
タイトルごとの集積データを持つ  タイトルDB内の香盤データとして監理する
新規に入力されたラベルがあれば、香盤に加える（最終的にはそうする）
＊香盤への操作は香盤DBに対しての通信として実装する＊
新規入力ラベルはこのデータに対して最新候補として追加すること
*/
    labels:[
        "医者",
        "警官",
        "子供",
        "女",
        "男",
        "通行人"
    ],
/*
    ダイアログプロパティは、個人データとして監理する
    デフォルトでシステムDBの値を置く
*/
    props:[
        'アドリブ',
        'エコー',
        'N',
        '背',
        'V.O.',
        'off',
        ''
    ],
/*
    台詞間に挿入するコメントデータは、個人データとして管理する
    デフォルトでシステムDBの値を置く
*/
    notes:[
        '♪',
        '♬',
        '☓',
        '○',
        '◇',
        '効果',
        '音楽',
        'BGM',
        'SE',
        '間',
        '息'
    ]
}
/*
    パネル初期化
    xUI.edmode に従ってパネル状態を設定
    各コントロールの有効無効化  視覚化隠蔽等を行う
    
    現在はダイアログ関連のコントロールのみ

    フォーカス位置が有値のダイアログセクションであれば(既にedmode>=2の場合)
    コントロールを有効化して選択されているセクションの値を反映(getProp)
     :edmode==0
    フォーカスが値セクションの場合はフォーカスのあるセクションを選択
*/
SoundEdit.init = function(){
    if(xUI.edmode<2){
        document.getElementById('dialogEdit').disabled=true;
            document.getElementById('soundPanelApply').disabled=true;
            document.getElementById('soundPanelFix').disabled=true;
            document.getElementById('soundPanelRelease').disabled=true;
    }else{
        this.getProp();
        document.getElementById('dialogEdit').disabled=false;
            document.getElementById('soundPanelApply').disabled=false;
            document.getElementById('soundPanelFix').disabled=false;
            document.getElementById('soundPanelRelease').disabled=false;
    }
}

SoundEdit.panelInit = function(){
    var recentCast   =document.getElementById('sndCasts');
    recentCast.innerHTML='';
    for(var ix=this.labels.length-1;ix>=0;ix--){
        var myOption = document.createElement('option');
        myOption.setAttribute('value',this.labels[ix]);
        recentCast.appendChild(myOption);
    }
    var propSelector =document.getElementById('soundPropSelector');
    propSelector.innerHTML='';
    for(var ix=this.props.length-1;ix>=0;ix--){
        var myOption = document.createElement('option');
        myOption.setAttribute('value',this.props[ix]);
        myOption.innerHTML=this.props[ix];
        propSelector.appendChild(myOption);
    }
    var commentButtonCareer =document.getElementById('commentCareer');
    commentButtonCareer.innerHTML='';
    for(var ix=this.notes.length-1;ix>=0;ix--){
        var myOption = document.createElement('button');
        myOption.setAttribute('value','<'+this.notes[ix]+'>');
        myOption.className  = 'dialogComment';
        myOption.innerHTML  = this.notes[ix];
        commentButtonCareer.appendChild(myOption);
    }
}


/*  UIロックパラメータ同期
引数：ロックするパラメータを文字列または数値 引数なしは同期のみ

*/
SoundEdit.syncTCL=function(ix){
    switch(ix){
    case 'inPoint':
    case 0:
        this.timeLock=0;
    break;
    case 'outPoint':
    case 1:
        this.timeLock=1;
    break;
    case 'duration':
    case 2:
        this.timeLock=2;
    default:
        //NOP
    }
    for(var idx=0;idx<3;idx++){
        var targetId = ['soundInpointLock','soundOutpointLock','soundDurationLock'][idx];
        if(this.timeLock==idx){
            document.getElementById(targetId).innerHTML= '🔒';//Lock
        }else{
            document.getElementById(targetId).innerHTML= '🔓';//unLock
        }
    }   
}
/*  編集対象のパネルのラベルを入れ替える
引数:ダイアログラベル文字列
*/
SoundEdit.setLabel = function(myName){
    if(typeof myName == 'undefined') return false;
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId]
    targetSection.value.name = myName;
    document.getElementById('sndBody').value=targetSection.value.toString();
    targetTrack.sectionTrust=false;
    xUI.sectionUpdate();
}
/*  編集対象のダイアログの属性を入れ替える
引数:属性配列または属性文字列
文字列の形式は,(コンマ)で区切られたリスト
引数が未定義または空文字列の場合は、属性を全削除
*/
SoundEdit.setProp = function(myProp){
    console.log(myProp);
    if(typeof myProp == 'undefined') myProp=[];
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId]
    var myProps = (myProp instanceof Array)? myProp:myProp.split(',');
    targetSection.value.attributes.length = myProps.length;
    for(var itx=0;itx<myProps.length;itx++){
        targetSection.value.attributes[itx]=(String(myProps[itx]).match(/^\(.+\)$/))?
        String(myProps[itx]):targetSection.value.attributes[itx]="("+String(myProps[itx])+")";
    }
    document.getElementById('sndBody').value=targetSection.value.toString();
    console.log(targetSection.value.toString());
    targetTrack.sectionTrust=false;
    xUI.sectionUpdate();
}
/** 編集対象のパネルの値をセットする
引数: 
    tc  TC文字列
    target 目的のプロパティ"inPoint","outPoint","duration"
ロックされているプロパティに値を設定しようとすると、自動でロックが入れ替わる
    in点     → out点
    out点    → in点
    duration → in点
    ただしあらかじめ他のロックが行われている場合は、自動変更は働かない
*/
SoundEdit.setTime = function(tc,target){
    if(xUI.edmode<2) return;//NOP
    var myFrame = nas.FCT2Frm(tc);
    if(myFrame < 0) myFrame = 0;
    if(myFrame > xUI.XPS.xpsTracks.duration) myFrame = xUI.XPS.xpsTracks.duration;
//     xUI.mdChg(3);
    switch(target){
    case 0:
    case 'inPoint':
        if(this.timeLock==0){this.syncTCL(1);}
        var headOffset = myFrame;
        var tailOffset = (this.timeLock == 1)?
            nas.FCT2Frm(document.getElementById('soundOutPoint').value)-tc:
            nas.FCT2Frm(document.getElementById('soundDuration').value);
    break;
    case 1:
    case 'outPoint':
        if(this.timeLock==1){this.syncTCL(0);}
        var headOffset = (this.timeLock == 0)?
            nas.FCT2Frm(document.getElementById('soundInPoint').value):
            tc-nas.FCT2Frm(document.getElementById('soundDuration').value);
        var tailOffset = (this.timeLock == 0)?
            tc-headOffset:nas.FCT2Frm(document.getElementById('soundDuration').value);
    break;
    case 2:
    case 'duration':
        if(this.timeLock==2){this.syncTCL(0);}
        var headOffset = (this.timeLock == 0)?
            nas.FCT2Frm(document.getElementById('soundInPoint').value):
            nas.FCT2Frm(document.getElementById('soundOutPoint').value)-tc;
        var tailOffset = tc-1;
    break;
    }
//  xUI.XPS.xpsTracks[xUI.Select[0]].sections.manipulateSection(xUI.floatSectionId,myFrame,tailOffset);
    xUI.selectCell([xUI.Select[0],headOffset]);
    xUI.selection([xUI.Select[0],headOffset+tailOffset])
    xUI.sectionUpdate();
}
/*
    編集パネル上の値を変更して仮の範囲を表示する
    モードをフロートに変更
*/
SoundEdit.floatTC = function(changeID){
    if(xUI.edmode<2) return false;
    if(xUI.edmode==2) if(xUI.mdChg('float') != 3) return false; //モード変更に失敗したのでメソッド終了
        var inPoint = nas.FCT2Frm(document.getElementById('soundInPoint').value);
        var outPoint = nas.FCT2Frm(document.getElementById('soundOutPoint').value);
        var duration = nas.FCT2Frm(document.getElementById('soundDuration').value);
    switch(changeID){
    case 0:
    case 'inPoint':
        if (inPoint < 0) inPoint = 0;
        if (inPoint >= xUI.XPS.xpsTracks.duration) inPoint = (xUI.XPS.xpsTracks.duration-1);
        if (this.timeLock == 0) this.syncTCL(1);
        if (this.timeLock == 1) duration = outPoint - inPoint + 1;
        else if (this.timeLock == 2) outPoint = inPoint + duration - 1 ;
    break;
    case 1:
    case 'outPoint':
        if (outPoint < 0) outPoint = 0;
        if (outPoint >= xUI.XPS.xpsTracks.duration) outPoint = (xUI.XPS.xpsTracks.duration-1);
        if (this.timeLock == 1) this.syncTCL(0);
        if (this.timeLock == 2) inPoint  = outPoint - duration + 1;
        else if (this.timeLock == 0) duration = outPoint - inPoint + 1;
    break;
    case 2:
    case 'duration':
        if (duration < 1) duration = 1;
        if (duration > xUI.XPS.xpsTracks.duration) duration = xUI.XPS.xpsTracks.duration;
        if (this.timeLock == 2) this.syncTCL(0);
        if (this.timeLock == 1) inPoint  = outPoint - duration + 1;
        else if (this.timeLock == 0) outPoint = inPoint + duration - 1;
    break;
    }
    document.getElementById('soundInPoint').value  = nas.Frm2FCT(inPoint ,2,0,xUI.XPS.framerate);
    document.getElementById('soundOutPoint').value = nas.Frm2FCT(outPoint,2,0,xUI.XPS.framerate);
    document.getElementById('soundDuration').value = nas.Frm2FCT(duration,2,0,xUI.XPS.framerate);
    xUI.selection([xUI.Select[0],xUI.Select[1]+duration-1]);
    xUI.selectCell([xUI.Select[0],inPoint]);
//    xUI.sectionUpdate();
}
/**
    シート上のダイアログのプロパティをパネルに反映
*/
SoundEdit.getProp = function(){
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId];
//if(!(targetSection.value)){console.log(xUI);alert('break');}
//ターゲットセクションの値を取得して表示同期
    var inPoint  = targetSection.startOffset();
    var outPoint = inPoint + targetSection.duration - 1;
    document.getElementById('sndBody').value=targetSection.value.toString();
    document.getElementById('soundInPoint').value  = nas.Frm2FCT(inPoint ,2,0,xUI.XPS.framerate);
    document.getElementById('soundOutPoint').value = nas.Frm2FCT(outPoint,2,0,xUI.XPS.framerate);
    document.getElementById('soundDuration').value = nas.Frm2FCT(targetSection.duration,2,0,xUI.XPS.framerate);
    document.getElementById('soundLabel').value = targetSection.value.name;
    document.getElementById('soundProps').value = targetSection.value.attributes.join(",");
}
/** パネルの内容をシートに同期反映させる  値が同じプロパティはスキップ
    forceオプションが立っていたら強制的にスピン適用を行う
*/
SoundEdit.sync = function(force){
    if(xUI.edmode<2) return;//NOP
//台詞
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId];
    var newContent    = new nas.AnimationDialog(targetTrack,document.getElementById('sndBody').value);newContent.parseContent();
    var minLength     = newContent.bodyText.length+newContent.comments.length;
    if ((force)||(minLength > targetSection.duration)){
        targetSection.duration = xUI.spinValue*minLength;
        document.getElementById("soundDuration").value=xUI.spinValue*minLength;
        SoundEdit.floatTC(2);
    }
    targetSection.value.contentText = newContent.contentText;
    //テキストエリアの内容が正しいコンテンツ型式であるか保証されないので注意！
    //パーサにチェック機能を設けるか  またはフィルタすること
    targetSection.value.parseContent();

    //変更したデータでリストを更新する。変更が発生していればHTMLを書き直し
    var labelCount = this.labels.length;
        this.labels.add(targetSection.value.name);

    var propCount=this.props.length;
    for(var ix=0;ix<targetSection.value.attributes.length;ix++){
        this.props.add((targetSection.value.attributes[ix]).replace( /(^\(|\)$|^<|>$|^\[|\]$)/g ,''));
    }

    var noteCount = this.notes.length;
    for(var ix=0;ix<targetSection.value.comments.length;ix++){
        this.notes.add(targetSection.value.comments[ix][1].replace( /(^\(|\)$|^<|>$|^\[|\]$)/g ,''));
    }
    if( (labelCount != this.labels.length)||
        (propCount != this.props.length)||
        (noteCount != this.notes.length)){this.panelInit();}
    
    var myContent = targetTrack.sections.manipulateSection(
        xUI.floatSectionId,
        nas.FCT2Frm(document.getElementById('soundInPoint').value),
        nas.FCT2Frm(document.getElementById('soundDuration').value)-1
    );
    xUI.floatSectionId = xUI.XPS.xpsTracks[xUI.Select[0]].getSectionByFrame(myContent[1]).id();
    targetTrack.sectionTrust=false;
    xUI.sectionUpdate();
}
/**
    音響編集パネルを閉じる
*/
SoundEdit.close = function(){
	if($("#optionPanelSnd").is(":visible")){
	    //閉じる時に編集内容を確定しておく
	    if(xUI.edmode > 0) {
	        this.sync();
	        xUI.mdChg(0);
	    }
		xUI.sWitchPanel("Snd");
		
	}else{
		return false;
	}
	return null;
}
/*  パネルを開く
    すでに開いていたら最小化されていないか確認して開く  最小化もされていなければ  NOP Return
    開く際モードを確認して必要に合わせてモードを変更する
    null値セクションの場合は、選択範囲の前後にセクションノードを挿入して空の値セクションを作成して選択
    その後  mdChg(2)
*/
SoundEdit.open=function(){
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];

    if($("#optionPanelSnd").is(":visible")){
	    if(document.getElementById('optionPanelSnd').style.display=='none')
	      document.getElementById('optionPanelSnd').style.display='inline';
		return false;
	}else{
    //this.targetSection = this.targetTrack.sections[xUI.floatSectionId];
    if ((! xUI.viewOnly)&&(targetTrack.option=='dialog')&&(xUI.edmode<2)){
        var currentFrame=(xUI.Select[1]==0)? 1:xUI.Select[1];
        var myDuration=((xUI.Selection[0]==0)&&(xUI.Selection[1]>0))?parseInt(xUI.Selection[1],10):1;
//フロートセクションがないのでモード遷移をトライ
//モード遷移に失敗したら新規のセリフ(有値セクション)を作成してそれを選択する
//        if(! xUI.mdChg('section')){}
        if(false){
            xUI.selection();
            xUI.selectCell([xUI.Select[0],currentFrame-1]);
            xUI.sheetPut('----,'+(new Array(myDuration+1).join(','))+',----')
            xUI.selectCell([xUI.Select[0],currentFrame]);
            xUI.mdChg('section');
        };
    }
		this.init();
		xUI.sWitchPanel("Snd");
	}
	return null;
}

/*
    xUI.SignBoxパネル機能オブジェクト

メモ欄に簡易サイン機能を追加 2021 04 10

メモ編集パネルの右端のボタン一列が署名用のボタン

テキストでの署名は

◯なるべく1か所に集めて確認を容易にする
◯ひとつずつの署名を見分けやすくする
◯日付を添える

以上の観点で
以下のように名前と日付を括弧でまとめたものを "sig." または "sign.""署名."で始まる行に記載します
括弧は[]()<>いずれの括弧を使っても良いとします

sig.LO:[たぬき 2/13](きつね 2/15)<ももんが 2/18> 原画:[たぬき 3/1](きつね 3/4)<ももんが 3/9>

LO、原画、動画などの工程の区切りには "工程名:" を挿入します

署名行(サマリ)を、確認を容易にするためにメモ欄の第一行目に置きます

署名ボタンには、括弧、名前、日付を自動でセットされる
ボタンのテキストは、ユーザ名と現在日付から自動作成

入力の際に行頭の"sig."がない場合は、自動で補われる

*/
var SignBox = {
    stampText:"%user%",
    stampNames:['%user%','監督','演出','作監','総作監','動検','仕検','特効','撮影'],
    stampPicture:"fixed",
    stampPictures:['%user%','=済=','=OK=','=NG='],
    stampColor:"#ff4444",
    stampColors:["#888888","#ff4444","#22CC22","#8888ff"]
};
SignBox.init = function init(name){
    document.getElementById('sigStage').innerText = nas.pmdb.stages.entry(xUI.XPS.stage.name).shortName;
    document.getElementById('sigLabel').value = (this.stampText == '%user%')?
    xUI.currentUser.handle:this.stampText;
    document.getElementById('sigDate').value  = new Date().toNASString('mm/dd');

};

SignBox.update = function init(name){
    this.stampText    = document.getElementById('sigLabel').value;
    this.stampPicture = '';
    document.getElementById('signature').innerText = "[" + 
        document.getElementById('sigLabel').value + " " +
        document.getElementById('sigDate').value  + "]";

};




// debaug デバグ用ルーチン        ------ dbg.js

/*
    デバグ汎用
        デバッグ対象ルーチン側でロードすること
*/


	var dbg_info=new Array();
if(typeof console == 'undefined'){
    if(air.Introspector){
        console=air.Introspector.Console;
    }else{
        console = {};
if(config.dbg) console.log=function(aRg){
        //dbg_action(aRg)
            try{document.getElementById('msg_well').value += (String(aRg) + "\n");}catch(err){alert(err)}
        };
    }
}
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

function dbgaction(cmd){
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


