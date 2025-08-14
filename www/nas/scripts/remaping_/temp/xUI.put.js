/**
 *  タイムシートデータの入力を行う - UNDO処理つき
 *
 *    <pre>
 *    シートに外部から値を流し込むメソッド
 *    xUI.put(datastream[[,direction],toReference])
 *        読込み時にも使用
 *    Xps.put オブジェクトメソッドに対応
 *    undo処理は戻り値から書き換えに成功した範囲と書き換え前後のデータが取得できるのでその戻値を利用する
 *    このメソッド内では、選択範囲方向の評価を行わないためフォーカス／セレクションは事前・事後に調整を要する場合がある
 *    選択範囲によるクリップはオブジェクトメソッドに渡す前に行う必要あり
 *    
 *    グラフィックレイヤー拡張によりシート上の画像パーツを更新する操作を追加
 *    Xps更新後に、xUI.syncSheetCell()メソッドで必要範囲を更新
 *
 *    グラフィック描画queueを設置してキューに操作を追加してから更新メソッドをコールする形に変更する
 *    更新メソッドはキューを処理して不用な描画をスキップするようにする（未実装20170330）
 *
 *    マクロ展開後には同様に必要範囲内のフットマーク再表示を行う
 *    
 *    参照エリアに対する描画高速化のために、このメソッドでリファレンスの書換をサポートする
 *    引数に変更がなければ従来動作  フラグが立っていればリファレンスを書換
 *    リファレンス操作時はundo/redoは働かない
 *
 *    再描画抑制undoカウンタを設置
 *    カウンタの残値がある限り再描画をスキップしてカウンタを減算する
 *    </pre>
 *  @params {String|Object Xps|Array}  datastream
 *     シートに設定するデータ  単一の文字列  またはXpsオブジェクト または  配列  省略可<br />
 *  
 *  @params {Array} direction
 *     データ入力ベクトル  配列  省略可  省略時は[0,0]
 *  @params {Boolean} toReference
 *    ターゲットオブジェクト切り替えフラグ
 *  @params {Function} callback
 *    コールバック関数 主にリセット時に使用
 *  @returns {Array} 入力開始アドレス、終了アドレス
 *      [[TrackStartAddress,FrameStartAddress],lastAddress];
 */
xUI.put = function(datastream,direction,toReference,callback){
  if(! toReference) toReference = false;
  if((xUI.viewOnly)&&(! toReference)) return xUI.headerFlash('#ff8080');//入力規制時の処理

  var targetXps= (toReference)? xUI.referenceXPS:xUI.XPS;
  
  var selectBackup = [this.Select.concat(),this.Selection.concat()];//カーソル配置をバックアップ
  
  if(typeof datastream == "undefined") datastream="";
  if(typeof direction  == "undefined") direction=[0,0];
//
  if(! toReference){
//  undo/redo 事前処理
    switch (this.inputFlag){
    case "redo":        this.activeDocument.undoBuffer.undoPt++             ;   //REDO処理時
    case "undo":                                  ;   //UNDO処理時
        var undoTarget   = this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt];    //処理データ取得
// undo内容をオブジェクトメソッドでputするためにホットポイントを作成する
// ホットポイント設定
        var hotPoint=[
            (undoTarget[1][0]>0)?undoTarget[0][0]:undoTarget[0][0]+undoTarget[1][0],
            (undoTarget[1][1]>0)?undoTarget[0][1]:undoTarget[0][1]+undoTarget[1][1]
        ]
        this.selection();//セレクション解除
        this.selectCell(hotPoint);//ターゲットのシートセルにフォーカス
        datastream=undoTarget[2];
            break;
    default:              ;//通常のデータ入力
                        ;//NOP
    }
  };
/*
処理データが、Xpsオブジェクトだった場合は、現在のXPS（編集対象データ全体）を複製してUndoバッファに格納
その後引数オブジェクトでXPSを初期化する

    datastream の形式

やりとりするデータの基本形式は、コンマ区切り文字列
フレーム方向のストリームで、改行で次のレイヤに移動
制御トークン等は無し  データのみ
    '1,,,2,,\n1,,,,,\n"x",,,,,\n'

Xpsオブジェクトの際は、シート全体を入れ替え
構造変更や大規模な変更をまとめる際はこの方法を推奨

データテーブル以外の各プロパティは、配列を使用して指定
配列は[プロパティ名称,値]  で  UNDOスタックには[プロパティ名称,変更前の値]  を積む
2015.09.14  修正

    07/08/07    undoGroup着手

グループフラグが立っていたらグループカウントをかける

グループカウント中はグループID付きのputを受け付けて。
シート全体のコピーをとってそちらの編集を行う

カウント中はundoに値を積まない。undoポインタも固定する。
フラグがendGroupになるか、通常のputを受け取った時点で解除
コピーした配列から変更範囲全体をXPSに流し込んで、UNDOを更新する。
こんな予定、でもまだやってない

undoGroupは優先度低い  ほぼいらないような気がするのでまあアレだ
2015.09.14 

undoスタックに格納する値は
[Select],[Selection],[dataBody],[カーソル位置,選択範囲]
dataBodyは データストリーム,Xpsオブジェクト,またはプロパティの配列
プロパティ配列のフォーマットは後記
第４要素のカーソル位置と選択範囲はオプション

*/
    var lastAddress=this.Select.slice();//最終操作アドレス初期化
    if(!toReference){
//UNDO配列
    var UNDO=new Array(3);
        UNDO[0]    =this.Select.slice();
        UNDO[1]    =this.Selection.slice();
    }
if(this.edmode >= 2){
    UNDO[3]=[this.floatSourceAddress.concat(),this.selectionBackup.concat()];
};
/*    入力データを判定    */
if(datastream instanceof Xps){
/*    Xpsならばシートの入れ替えを行う。現在のシート複製をundoStackに格納  */
    if(toReference){
//入力データをXPSに設定   UNDO対象外
        xUI.resetSheet(undefined,datastream,callback);//リファレンス更新
    }else{
        var prevXPS=new Xps();
        prevXPS.readIN(xUI.XPS.toString(false));
        UNDO[2]=prevXPS;
//入力データをXPSに設定
console.log(datastream);
        if(documentFormat.compareSheetLooks(datastream.sheetLooks)){
            xUI.resetSheet(datastream,undefined,callback);//書式情報一致
        }else{
            xUI.XPS.parseSheetLooks(datastream.sheetLooks);
            xUI.resetSheet(datastream,undefined,xUI.applySheetlooks(undefined,callback));//書式更新
        };
console.log(xUI.XPS);
    };
}else if(datastream instanceof Array){
/*    引数が配列の場合は、Xps のプロパティを編集する
形式:    [kEyword,vAlue]
    キーワード列とプロパティの対応リストは以下を参照
    キーワードは基本的にプロパティ文字列  "parent""stage"等
    タイムラインコレクションの個別プロパティは  "id.1.xpsTracks"等の"."接続した倒置アドレスで指定

//        Xps標準のプロパティ設定
    parent      ;//親Xps参照用プロパティ  初期値はnull（参照無し）編集可
    stage       ;//初期化の際に設定する  編集不可
    mapfile     ;//初期化の際に設定する  編集不可
    opus        ;//編集対象
    title       ;//編集対象
    subtitle    ;//編集対象
    scene       ;//編集対象
    cut         ;//編集対象
    trin        ;//編集対象(ドキュメント構成変更)
    trout       ;//編集対象(ドキュメント構成変更)
    rate        ;//編集対象(ドキュメント構成変更)
    framerate   ;//編集対象(ドキュメント構成変更)
    create_time ;//システムハンドリング  編集不可
    create_user ;//システムハンドリング  編集不可
    update_time ;//システムハンドリング  編集不可
    update_user ;//システムハンドリング  編集不可

    xpsTracks   ;タイムラインコレクション  構成変更のケースと内容変更の両ケースあり
                ;コレクションのエントリ数が変更になる場合は全て構成変更  それ以外は内容編集

xpsTimelineTrackオブジェクトのプロパティ
    noteText    ;//編集対象
    
    id      ;//識別用タイムラインラベル  編集対象
    tag;//トラック補助情報　編集対象
    sizeX   ;//デフォルト幅 point    編集対象（編集価値低）
    sizeY   ;//デフォルト高 point    編集対象（編集価値低）
    aspect  ;//デフォルトのpixelAspect  編集対象（編集価値低）
    lot     ;//map接続データ  編集禁止（編集価値低）
    blmtd   ;//セレクター利用  
    blpos   ;//セレクター利用  
    option  ;//セレクター利用 トラック種別変更時はセクションキャッシュをクリア
    link    ;//セレクター利用  
    parent  ;//セレクター利用  


*/
    var myTarget= datastream[0].split(".");
//    新規設定値    datastream[1];
//現在のプロパティの値をバックアップして新規の値をセット
    if(myTarget.length>1){
//ターゲットの要素数が1以上の場合はタイムラインプロパティの変更
//        UNDO[2]=[入力ターゲット複製,現在値];
        UNDO[2]=[datastream[0],targetXps.xpsTracks[myTarget[1]][myTarget[0]]];
        targetXps.xpsTracks[myTarget[1]][myTarget[0]]=datastream[1];//入力値を設定
        if((targetXps.xpsTracks[myTarget[1]].option == 'still')&&(myTarget[0] == 'id')){
            targetXps.xpsTracks[myTarget[1]]["tag"]=datastream[1];//
        }
        if(myTarget[0] =="option"){targetXps.xpsTracks[myTarget[1]].sectionTrust = false;}
    }else{
//単独プロパティ変更
        UNDO[2]=[datastream[0],targetXps[myTarget[0]]];
        targetXps[myTarget[0]]=datastream[1];
    }
    if(toReference){
        xUI.resetSheet(undefined,targetXps,callback);
    }else{
        xUI.resetSheet(targetXps,undefined,callback);
    }
}else if(this.inputFlag != "move"){
/*
    move時は、データ処理が煩雑なのでこのメソッド内では処理しない
    2015.09.19
*/
//通常のデータストリームを配列に変換
        var srcData=String(datastream).split("\n");
        for (var n=0;n<srcData.length;n++){
            srcData[n]=srcData[n].split(",");
        }
//配列に変換(済) ソースからデータのサイズと方向を出す。
    var sdWidth    =Math.abs(srcData.length-1);
    var sdHeight    =Math.abs(srcData[0].length-1);
//データ処理範囲調整
    if (this.Selection.join() != "0,0"){
//セレクションあり。操作範囲を取得
        var actionRange=this.actionRange([sdWidth,sdHeight]);
//カレントセレクションの左上端から現在の配列にデータを流し込む。
        var TrackStartAddress=actionRange[0][0];//    左端
        var FrameStartAddress=actionRange[0][1];//    上端
//セレクションとソースのデータ幅の小さいほうをとる
        var TrackEndAddress=actionRange[1][0];//    右端
        var FrameEndAddress=actionRange[1][1];//    下端
    } else {
//セレクション無し
        var TrackStartAddress= this.Select[0];//    左端
        var FrameStartAddress= this.Select[1];//    上端
//シート第2象限とソースデータの幅 の小さいほうをとる
        var TrackEndAddress=((xUI.SheetWidth-this.Select[0])<sdWidth)?
    (this.SheetWidth-1):(TrackStartAddress+sdWidth)    ;//    右端
        var FrameEndAddress=((targetXps.duration()-this.Select[1])<sdHeight)?
    (targetXps.duration()-1):(FrameStartAddress+sdHeight)    ;//    下端
    };
//バックアップは遅延処理に変更・入力クリップをここで行う
        var Tracklimit=TrackEndAddress-TrackStartAddress+1;
        var Framelimit=FrameEndAddress-FrameStartAddress+1;
    if(srcData.length>Tracklimit){srcData.length=Tracklimit};
    if(srcData[0].length>Framelimit){for (var ix=0;ix<srcData.length;ix++){srcData[ix].length=Framelimit}};
//入力値をオブジェクトメソッドで設定
    switch(this.inputFlag){
    case "redo":
    case "undo":
    default:
        this.selectionHi("clear");//選択範囲のハイライトを払う
        var putResult=targetXps.put([TrackStartAddress,FrameStartAddress],srcData.join("\n"));
        this.syncSheetCell([TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress],toReference);
    }
//設定値に従って、表示を更新（別メソッドにしてフォーカスを更新）
    lastAddress=[TrackEndAddress,FrameEndAddress];
/*UNDO配列を作成 Xps.put()メソッド以外は、各オブジェクトで*/
    if((! toReference)&&(putResult)){
if(dbg){dbgPut("XPS.put :\n"+putResult.join("\n"));}
//        UNDO[0]=putResult[0][0];//レンジが戻るので左上を設定する
//        UNDO[1]=sub(putResult[0][1],putResult[0][0]);//セレクションに変換
//        UNDO[1]=[0,0];//通常処理は選択解除で記憶
        UNDO[2]=putResult[2];//入れ替え前の内容
//処理前のカーソル位置とUNDO[0]が異なっていた場合修正要素を加える
//        if(UNDO[0].join()!=selectBackup[0].join()) UNDO[3]=selectBackup;
    }
}

//  if(this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][0].join()!=selectBackup[0].join()) this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][3]=selectBackup;
  if(! toReference){
//操作別に終了処理
switch (this.inputFlag){
case "undo":
case "redo":
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][2]=UNDO[2];    //UNDO処理時
if(undoTarget.length>=4){
//第４要素がある場合のみredo用のデータを設定して、カーソル復帰処理を行う
    var currentAddress =undoTarget[3][0].slice();
    var currentRange   =undoTarget[3][1].slice();
    if(this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][0].join()!=selectBackup[0].join()) this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][3]=selectBackup;
    this.selection (add(this.Select,currentRange));
    this.selectCell(currentAddress);
}else{
    this.selection(add(undoTarget[0],undoTarget[1]));
    this.selectCell(undoTarget[0].join('_'));
};
        if(this.inputFlag=="undo") this.activeDocument.undoBuffer.undoPt--;
        break;
case "nomal":   ;//通常のデータ入力
case "cut":     ;
  if(datastream instanceof Xps){
    this.selectCell("1_0");//
  }else{
//一行入力の際のみ処理後のスピン操作で次の入力位置へ移動できるポジションへ
//( = マクロ展開時に画面処理を行う)
    if(putResult){
if(dbg){
   dbgPut(putResult[0]+":"+add(putResult[0][1],[0,-(this.spinValue-1)]).join("_"));
}
      if(xUI.footMark){ this.selection(putResult[0][1]) };
      this.selection();
      if (selectBackup[1][1]>0){
        this.selectCell(([selectBackup[0][0],selectBackup[0][1]+selectBackup[1][1]]).join("_"));
      }else{
        this.selectCell(putResult[0][1].join("_"));//操作なしに最終アドレスへ
      }
    }
  }
case "move":
default:    ;//カット・コピー・ペースト操作の際はカーソル移動無し
        this.activeDocument.undoBuffer.undoPt++;
        this.undoGc=0;
if(dbg){    dbgPut(    "UNDO stack add:\n"+UNDO.join("\n")); }
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt]=UNDO;
        if (this.activeDocument.undoBuffer.undoStack.length>(this.activeDocument.undoBuffer.undoPt+1)){ this.activeDocument.undoBuffer.undoStack.length=(this.activeDocument.undoBuffer.undoPt+1)};
};
    this.inputFlag="nomal";
// undoバッファの状態を表示
    sync("undo");sync("redo");
//編集バッファをクリア・編集フラグを下げる(バッファ変数をモジュールスコープに変更したので副作用発生)
    if(this.edchg){ this.edChg(false) };
    if(this.eXMode==1){this.eXMode=0;this.eXCode=0;};//予備モード解除
  }
// 処理終了アドレスを配列で返す(使わなくなったような気がする)
return [[TrackStartAddress,FrameStartAddress],lastAddress];
//処理終了時に記述修飾の同期を行う場合は、リターンの前に処理を行う
};//xUI.put