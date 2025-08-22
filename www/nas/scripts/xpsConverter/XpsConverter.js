/* XpsConvert.js
	File API を使用したデータの読み込み（ブラウザでローカルファイルを読む）
	File API　は、Chrome Firefoxではローカルファイルの読み出し可能だが、
	IE,Safari等他の環境では、情報取得のみ可能
	File.nameは、ブラウザではパスを含まないファイル名（＋拡張子）のみ。
	ただし、AIR環境ではフルパスのローカルFSパスが戻る。
	同じI.FをAIR環境でも使用するために、ケース分岐する。

    印刷環境ではファイルの入出力自体をサポートしないのでイベントリスナの設定をスキップする
    id="myCurrentFile"のエレメントの有無で判定

    インポートデータトレーラー
    xUI.importBox
        .targetContents:Array  [array of convert target Objects]
            変換元データをまとめたオブジェクトの配列
            name:ファイル名,
            content:データソース,
            xps:一次変換済み Object Xps
            checked:Object bool 処理チェック 
        .selectedContents:Array [array of coverted and selected Xps]
            処理済みのXpsオブジェクトの配列
        .overwriteProps:Object {overwrite properties trailer object}
            オプション・変換時に参照されるプロパティトレーラー
        .maxSize
            読み出しファイルサイズ制限値（バイト数）
        .allowExtensions
            読み出し対象拡張子を正規表現で
        .callback
            終了処理関数
        .reset()
            リセットメソッド　上記プロパティ群を初期化

        .import(files,callback)
        ファイルオブジェクトの配列を引数にしてインポートメソッドを呼び出す

        読み出し成功したデータは、自動処理でコンバートが行われて　Xpsに変換後　targetContents[index].xps　として格納される
        読み出しに失敗したファイルは、対応するtargetContents.xpsの内容がfalseでセットされるので、後ほどでも処理可能
        その後プロパティ編集ダイアログを呼び出す。
        [リセット]で、ダイアログを初期状態に戻す
        [閉じる]、[☓]で、未処理のままダイアログを閉じる
        [カット登録] でチェックのあるコンテンツのみプロパティ編集を行い、処理済み配列 を作成する。

        終了時に実行するコールバック関数を第二引数で渡す
       未編集のコンテンツは　xUI.importBox.targetContents に
       処理、選択済コンテンツは xUI.importBox.processedContents　にあるので適宜これを利用する

*/
    xUI={};//remaping互換

    xUI.currentUser= new nas.UserInfo('testuser@test.example.com');//アプリケーションとの互換のためこの変数をセットしてください
    
/**
    xUI.importBox
    複数データ対応ドキュメントインポーター
*/
    xUI.importBox={};//インポート情報トレーラー初期化
    xUI.importBox.overwriteProps    ={};
    xUI.importBox.maxSize  = 1000000;
    xUI.importBox.maxCount = 10;
    xUI.importBox.allowExtensions=new RegExp("\.(txt|csv|xps|ard|ardj|tsh|xdts|tdts|sts)$",'i');

xUI.importBox.reset = function(){
    this.targetContents    =[];
    this.selectedContents  =[];
    this.importCount= 0;
    this.callback = undefined;
    console.log('reset')
}
    xUI.importBox.reset();
/**
    変換ターゲットとなるFileオブジェクト配列を引数にして以下の関数を呼び出す
    全カット変換終了時のコールバック関数を与えることが可能
    importBox.importより名称変更
    特定の環境下で同名の関数がエラーとなるため
*/
xUI.importBox.read = function(targetFiles,callback){
    if(appHost.platform == "AIR"){
        return false;
//***AIR  用の分岐は　単ファイルのままで保留2018 0201
    // File APIを利用できるかをチェック
  if (window.File) {
      // 指定されたファイルを取得
      var input = targetFiles[0];
	fileBox.currentFile=new air.File(input.name);
	xUI.data_well.value =fileBox.readContent();
  }
    }else{
    // File APIを利用できるかをチェック
    if (window.File) {
      if(window.FileReader){
        xUI.importBox.reset();//ここで再初期化する
        xUI.importBox.callback=callback;
        xUI.data_well.value +='\n\tread datas:'+ new Date().toString();
//処理に先行して拡張子とファイルサイズでフィルタして作業リストを作成する
//作業リストの進行度合いをチェックして終了判定をかける
        var targetQueue=[];
  for(var ix=0;ix<targetFiles.length;ix++){
    var check = targetFiles[ix];
    if(
        (check.name.match(this.allowExtensions)) &&
        (check.size <= this.maxSize) &&
        (ix < this.maxCount)
    ){
        targetQueue.push(check);
        this.importCount ++;
    }else{
        console.log("skip file "+check.name );
    }
  };
      // 指定されたファイルを取得してインポーターのプロパティで控える
  for(var ix=0;ix<targetQueue.length;ix++){
    var input = targetQueue[ix];
//非同期で実行
(function(){
    console.log(input);
	var myEncode=(input.name.match(/\.(ard|csv|tsh|sts)$/))?"Shift-JIS":"UTF-8";
      // ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
      var reader = new FileReader();
      reader.name=input.name;
      // ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
      reader.addEventListener('load', function(e) {
        console.log(reader);
        var output = reader.result;//
        xUI.data_well.value +='\n'+ input.name;
        xUI.data_well.value +='\n'+ reader.result;

        var myXps = convertXps(reader.result,nas.File.divideExtension(reader.name)[1],xUI.importBox.overwriteProps);// 指定オプション無しで一旦変換する
        if(!myXps){alert(reader.name+' is not support format')}
        console.log (myXps);

        xUI.importBox.targetContents.push({"name":reader.name,"content":reader.result,"xps":myXps,"checked":true});
        if ( xUI.importBox.importCount == xUI.importBox.targetContents.length ){
//            xUI.importBox.resetTarget(xUI.importBox.targetContents,overwriteTest);
            xUI.importBox.resetTarget(xUI.importBox.targetContents,xUI.importBox.overwriteProps);
console.log(xUI.importBox.overwriteProps)
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
})();
  }
      }else{
//FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
var msg = "no FileReader! :\n　このブラウザはFileReaderオブジェクトをサポートしていません。\n残念ですが、この環境ではローカルファイルは読みだし出来ません。\nThis browser does not support the FileReader object. \n Unfortunately, you can't read local files now.";
	alert(msg);
      }
    }
   }
}
/**
    xUI.importBox.updateTarget()
    チェックのあるカットのみダイアログの値でターゲットのプロパティを更新して
    新規の配列を作成する
    
*/
xUI.importBox.updateTarget= function(){
console.log(xUI.importBox);
    for(var tix=0;tix<xUI.importBox.targetContents.length;tix++){
        var doAction = document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_imptCB').checked;
        xUI.importBox.targetContents[tix].checked = doAction;
        if(! doAction ) continue;

        var modefiedXps = xUI.importBox.targetContents[tix].xps;//直に参照
        //var modefiedXps = new Xps();
        //modefiedXps.parseXps(xUI.importBox.targetContents[tix].xps.toString());//複製を作る
        

        modefiedXps.title    = document.getElementById('optionPanelSCI_title').value
        modefiedXps.opus     = document.getElementById('optionPanelSCI_opus').value;
        modefiedXps.subtitle = document.getElementById('optionPanelSCI_subtitle').value;
        modefiedXps.scene    = '';
        modefiedXps.cut      = document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_sc').value;
    //  時間変更 短くなった場合は後方からフレームが削除されるので注意
        modefiedXps.setDuration(nas.FCT2Frm(document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_time').value));
    //  変更されたXpsのステータスをStartup変更（暫定処理）
        modefiedXps.currentStatus.content    = 'Startup';
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
    if (optionTrailer){
      document.getElementById('optionPanelSCI_title').value    = optionTrailer.title;
      if(optionTrailer.episode)     document.getElementById('optionPanelSCI_opus').value     = optionTrailer.episode;
      if(optionTrailer.description) document.getElementById('optionPanelSCI_subtitle').value = optionTrailer.description;
      if(optionTrailer.subtitle)    document.getElementById('optionPanelSCI_subtitle').value = optionTrailer.subtitle;
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
//    var dataCount=(dataTrailer.length <= this.maxCount)? dataTrailer.length:this.maxCount;
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
    }
    
    for(var dix=0;dix<dataTrailer.length;dix++){
        var IDnumber=nas.Zf(dix+1,2);
        document.getElementById('optionPanelSCI_'+IDnumber+'_imptCB').checked    = dataTrailer[dix].checked;
        document.getElementById('optionPanelSCI_'+IDnumber+'_sc').value    = dataTrailer[dix].xps.cut;
        document.getElementById('optionPanelSCI_'+IDnumber+'_time').value  = dataTrailer[dix].xps.getTC(dataTrailer[dix].xps.time());
    }
    if(optionTrailer){
        for(prp in optionTrailer){
            switch (prp){
                case "title":
    document.getElementById('optionPanelSCI_title').value    = String(optionTrailer[prp]);
    document.getElementById('optionPanelSCI_title').disabled = true;
                break;
                case "episode":
    document.getElementById('optionPanelSCI_opus').value    = String(optionTrailer[prp]);
    document.getElementById('optionPanelSCI_opus').disabled = true;
                break;
                case "description":
    document.getElementById('optionPanelSCI_subtitle').value    = String(optionTrailer[prp]);
    document.getElementById('optionPanelSCI_subtitle').disabled = true;
                break;
                case "cut":
     if(dataTrailer.length==1){
        document.getElementById('optionPanelSCI_01_sc').value    = String(optionTrailer[prp]);
        document.getElementById('optionPanelSCI_01_sc').disabled = true;
    }
                break;
                case "time":
     if(dataTrailer.length==1){
        document.getElementById('optionPanelSCI_01_time').value    = String(optionTrailer[prp]);
        document.getElementById('optionPanelSCI_01_time').onchange();
        document.getElementById('optionPanelSCI_01_time').disabled = true;
    }
                break;
            }
        }
    }
    document.getElementById('resetTarget').disabled = true;
}
/**
    xUI.importBox.checkValue(ctrlElement)
    ダイアログの変更状況をチェックしてUIの状態を更新する
     パラメータがひとつでも変更された場合はリセットボタンを有効に
    時間パラメータが変更された場合は、表記をTCに統一する
*/
xUI.importBox.checkValue = function(itm){
    var myProps=(String(itm.id).split('_')).reverse();
//    itmNumber = myProps[1]
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
    document.getElementById('resetTarget').disabled = false;
}
/**
変換のトリガーにファイル指定のイベントを使用
ファイル（複数）が指定されたタイミングで、
インポートコマンドにターゲット配列を渡す
*/
window.addEventListener('DOMContentLoaded', function() {
  if(document.getElementById("myCurrentFile")){
    console.log('addEventListener');
    document.getElementById("myCurrentFile").addEventListener('change', function(e) { xUI.importBox.read(this.files,processImport)}, true);//myCrrentFile.addEvent
  }
});//window.addEvent
/**
*/
var processImport=function(){
            alert('ユーザ処理終了')
            //for Test
//        コンバート済みデータが格納されている配列はxUI.importBox.selectedContents
            for(var dix=0;dix<xUI.importBox.selectedContents.length;dix++){        
                document.getElementById("xpsResult").innerHTML += '\t'+xUI.importBox.selectedContents[dix].getIdentifier() +'\n';
                document.getElementById("xpsResult").innerHTML += xUI.importBox.selectedContents[dix].toString();
                document.getElementById("xpsResult").innerHTML += '\n\n';
            }
}
 /*
    convertXps(datastream,optionString,overiteProps,streamOption)
引数:
    datestream
        コンバート対象のデータ
        基本的にテキストデータ
        バイナリデータの場合は1bite/8bit単位の数値配列として扱う（現在未実装）
    optionString
        コンバート対象のデータがXPSのプロパティ全てを持たない場合があるので
        最低限のプロパティ不足を補うための指定文字列
        URIencodedIdentifier または　TextIdentifierを指定
        通常はこのデータがファイル名の形式で与えられるのでファイル名をセットする
        空白がセットされた場合は、カット番号その他が空白となる
    overwriteProps
        コンバータ側で上書きするプロパティをプロパティトレーラーオブジェクトで与える
        インポーター側へ移設予定
    streamOption
        ストリームスイッチフラグがあればストリームで返す（旧コンバータ互換のため）

    複数データ用コンバート関数
    内部でparseXpsメソッドを呼んでリザルトを返す
    以下形式のオブジェクトで　overwriteProps を与えると固定プロパティの指定が可能
    {
        "title":"タイトル文字列",
        "episode":"エピソード文字列",
        "description":" エピソードサブタイトル文字列",
        "cut":"カット番号文字列",
        "time":"カット尺文字列　フレーム数またはTC"
    }
    いずれのプロパテイも省略可能
    指定されたプロパティは、その値でダイアログを上書きして編集が固定される
    全て指定した場合は、ユーザの編集ができなくなるので注意
    単独ファイルの場合は、固定に問題は無いが
    複数ファイル処理の場合に問題が発生する
    
    固定プロパティ強制のケースでは複数のドキュメントに同一のカット番号をもたせることはできないので
    カット番号のロックは行われない
    不正データ等の入力でコンバートに失敗した場合はfalseを戻す
    旧来の戻り値と同じ形式が必要な場合は　convertXps(datastream,"",{},true) と指定する事
戻値:　Object Xps or XpsStream or false
    
*/


var convertXps = function(datastream,optionString,overwriteProps,streamOption){
    if(! String(datastream).length ){
        return false;
    }else{
// streamOption
    if(!streamOption){streamOption=false;}
// オプションで識別子文字列を受け取る　（ファイル名を利用）
// 識別子はXps.parseIdentifierでパースして利用
    if(! optionString){optionString = '=TITLE=#=EP=[=subtitle=]//s-c=CUTNo.=';}
//ファイル名等でsciセパレータが'__'だった場合'//'に置換
    if(optionString.indexOf('__')>=0){optionString=optionString.replace(/__/g,'//');}
// 文字列がsciセパレータ'//'を含まない場合、冒頭に'//'を補って文字列全体をカット番号にする
    if(optionString.indexOf('//') < 0 ){optionString='//' + optionString;}
    var optionTrailer=Xps.parseIdentifier(optionString);

// 上書きプロパティ指定がない場合は空オブジェクトで初期化
    if(! overwriteProps){overwriteProps={};}

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
        case    (/^nasTIME-SHEET\ 0\.[1-9].*/).test(datastream):
//    判定ルーチン内で先にXPSをチェックしておく（先抜け）
        break;
        case    (/^((toei|exchange)DigitalTimeSheet Save Data\n)/).test(datastream):
            datastream =TDTS2XPS(datastream);
            //ToeiDigitalTimeSheet / eXchangeDigitalTimeSheet
        break;
        case    (/^UTF\-8\,\ TVPaint\,\ \"CSV 1\.[01]\"/).test(datastream):
            datastream =TVP2XPS(datastream);
            //TVPaint csv
        break;
        case    (/^\"Frame\",/).test(datastream):
            datastream =StylosCSV2XPS(datastream);//ボタン動作を自動判定にする 2015/09/12 引数は使用せず
        break;
        case    (/^\{[^\}]*\}/).test(datastream):;
            try{datastream =ARDJ2XPS(datastream);console.log(datastream);}catch(err){console.log(err);return false;};
        break;
        case    (/^#TimeSheetGrid\x20SheetData/).test(datastream):
            try{datastream = ARD2XPS(datastream);console.log(datastream);}catch(err){console.log(err);return false;};
        break;
        case    (/^\x22([^\x09]*\x09){25}[^\x09]*/).test(datastream):
            try{datastream = TSH2XPS(datastream);}catch(err){return false}
        break;
        case    (/^Adobe\ After\ Effects\x20([456]\.[05])\ Keyframe\ Data/).test(datastream):
            try{datastream=AEK2XDS(datastream)}catch(err){alert(err);return false}
            //AEKey のみトラック情報がないので　ダミーXpsを先に作成してそのトラックにデータをputする
            var myXps=new Xps();
console.log(datastream);
            myXps.put(datastream);
            datastream=myXps.toString();
        break;
        default :
/*
    元の判定ルーチンと同じくデータ内容での判別がほぼ不可能なので、
    拡張オプションがあってかつ他の判定をすべてすり抜けたデータを暫定的にTSXデータとみなす
 */
            if(TSXEx){
                try{datastream=TSX2XPS(datastream)}catch(err){alert(err);return false;}
            }
        }
      }
        if(! datastream){return false}
    }

  if(datastream){
    var convertedXps=new Xps();
    convertedXps.parseXps(datastream);
//ここでセリフトラックのチェックを行って、シナリオ形式のエントリを検知したら展開を行う
    for(var tix=0;tix<convertedXps.xpsTracks.length;tix++){
        var targetTrack=convertedXps.xpsTracks[tix]
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
                }
            }
//キューにあるダイアログを一括して処理
            for(var qix=0;qix<convertQueue.length;qix++){
                var dialogOffset = (String(convertQueue[qix][0].name).length)? 2:1;
                    dialogOffset += convertQueue[qix][0].attributes.length;
                var dialogDuration = convertQueue[qix][2]-convertQueue[qix][1]; 
                var startAddress =[tix,(convertQueue[qix][1] - dialogOffset)];
                var dialogStream =(convertQueue[qix][0].getStream(dialogDuration)).join(',');
                convertedXps.put(startAddress,dialogStream);
            }
        }
    }
//オプション指定文字列の反映（抽出データを一旦全て反映）
console.log(optionTrailer);
    convertedXps.title       = optionTrailer.title;
    convertedXps.opus        = optionTrailer.opus;
    convertedXps.subtitle    = optionTrailer.subtitle;
    convertedXps.scene       = optionTrailer.scene;
    convertedXps.cut         = optionTrailer.cut;
//リザルトを返す
    return (streamOption)?convertedXps.toString():convertedXps;
  }else{
    return false;    
  }
}
    

/**
nas.File
　ファイルハンドルオブジェクト
　ファイルハンドルはプラットフォーム毎に実装されるファイルオブジェクトのエージェントとして機能する
　AIR/Adobe 拡張スクリプト/html5 File/Node.js/
　とか色々必要だけど
　今回はファイル名から拡張子切り分け（=最後の'.'で文字列をセパレート）のみの実装で済ませる
　ファイル名本体に空文字列を認めていない
　.git 等は　ファイル名　".git"   拡張子　なし　となる
　拡張子なしのドットファイルの扱いに注意
    これは保留　今回はHTML5のFileオブジェクトを直接扱う　AIRは保留
*/

/**
divideExtension(filename)
引数:文字列　拡張子付きファイル名
戻値:配列[拡張子,ファイル名本体]

divideExtension = function(filename){
    filename=String(filename);
        var nameBody=filename;
        var nameExtension ='';
    if(filename.match(/^(.+)\.([^\.]*)$/)){
        nameExtension   =RegExp.$2;
        nameBody        =RegExp.$1;
    }
    return [nameExtension,nameBody];
};//*/
/*
    ダイアログパネル初期化
    インポートデータの確認ダイアログを初期化
*/
initConverter=function(overwriteProps){
    if(! overwriteProps) overwriteProps ={};
//ダイアログパネル初期化
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
// UIオブジェクトのプロパティをアタッチ
    if(document.getElementById('data_well')){
        xUI.data_well= document.getElementById('data_well');
    }else{
        xUI.data_well= {"value":""};
    }
    xUI.importBox.overwriteProps=overwriteProps;

console.log(xUI.importBox.overwriteProps)
}

