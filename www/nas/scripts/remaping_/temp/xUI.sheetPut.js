/**    タイムシート入力前段処理
 *    シート選択状態で入力値をクリップ・正規化してxUI.InputUnitの配列へ変換する
 *    調整済みの入力値をxUI.putメソッドへわたす 開始アドレス、選択範囲などの調整はこちらで済ませる 
 *  @params {String|Array|Object Xps|Object xMap}  datastream
 *     シートに設定するデータ シートデータ文字列 または シートデータ配列 またはXpsオブジェクト 省略可<br />
 *  
 *  @params {Array} direction
 *     データ入力ベクトル  配列  省略可  省略時は[0,0]
 *  @params {boolean} toReference
 *    ターゲットオブジェクト切り替えフラグ
 *  @params {Function} callback
 *    コールバック関数 主にリセット時に使用
 *  @returns {Array} 入力開始アドレス、終了アドレス
 *      [[TrackStartAddress,FrameStartAddress],lastAddress];
 */
xUI.sheetPut = function(datastream,direction,toReference){
console.log(arguments);

    if(! toReference) toReference = false;
    var targetXps= (toReference)? xUI.referenceXPS:xUI.XPS;
  
//  var selectBackup = [this.Select.concat(),this.Selection.concat()];//カーソル配置をバックアップ>>勘案しない

    if(typeof datastream == "undefined") datastream="";
    if(typeof direction  == "undefined") direction=[0,0];
/*
    datastream の形式

やりとりするデータの基本形式は、コンマ区切り文字列
フレーム方向のストリームで、改行で次のレイヤに移動
制御トークン等は無し  データのみ
    '1,,,2,,\n1,,,,,\n"x",,,,,\n'

Xpsオブジェクトの際は、シートトラック全体を入れ替える
以前のコードでは構造変更や大規模な変更をまとめる際はこの方法を推奨されいてたが
今時のコードではシートトラックのみを差し替えるので注意


全体構造の変更時及びタイムライントラック以外の各プロパティは、新規のputメソッドで指定
xUI.put([new xUI.InputUnit("*",<String:tartgetXpsSource>)]);//全体を更新
xUI.put([new xUI.InputUnit(<String:プロパティ名>,<String:propertySource>)]);//プロパティを更新

2020.06.02  修正

undoスタックに格納する値は {Object xUI.InputUnit}
初期化は
    new xUI.InputUnit(
        <data-address>,
        <data-content>,
        {Object additional-property}
 *    )
 *  eg.       
 *    new nas.InputUnit(
 *        [[1,0],[1,11]],
 *        "X,,,1,,,2,,,3,,",
 *        {
 *            target:xUI.documents[0],
 *            selection:[[1,12],[0,0]]
 *        }
 *    )
 */
/*    入力データを判定    */
    if(datastream instanceof Array){
/*    引数が配列の場合は、Xps のプロパティを編集する（旧形式）
古い形式の場合ここで新形式にコンバートされる
可能な限りこのメソッドを通さずに新形式へ移行のこと（UNDOの回数が減る）

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
    tag;//トラック補助情報 編集対象
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
        var myValue = datastream[1];
//新形式アドレスへ変換
        this.put([new xUI.InputUnit(
            myTarget.reverse().join('.'),
            myValue,
            {
                target:targetXps
            }
        )],toReference);
    }else if(datastream instanceof Xps){
// Xpsならばシートの入れ替えを行うためデータストリームを取得
//(現在の選択範囲を見るか？-見ない リセットする)
        datastream = datastream.getRange();
        this.put([new xUI.InputUnit(
            [0,0],
            datastream,
            {
                target:targetXps
            }
        )],toReference);
    }else{
//データストリームを配列に変換
        var srcData=String(datastream).split("\n");
        for (var n=0;n<srcData.length;n++){
            srcData[n]=srcData[n].split(",");
        }
//配列に変換したソースからデータのサイズと方向を出す。
        var sdWidth    =Math.abs(srcData.length-1);
        var sdHeight   =Math.abs(srcData[0].length-1);
//データ処理範囲調整
        if (this.Selection.join() != "0,0"){
//セレクションあり(操作範囲を取得)
            var actionRange=this.actionRange([sdWidth,sdHeight]);
//カレントセレクションの左上端から現在の配列にデータを流し込む。
            var TrackStartAddress=actionRange[0][0];//    左端
            var FrameStartAddress=actionRange[0][1];//    上端
//セレクションとソースのデータ幅の小さいほうをとる
            var TrackEndAddress=actionRange[1][0];//    右端
            var FrameEndAddress=actionRange[1][1];//    下端
        } else {
//セレクション無し(開放操作)
            var TrackStartAddress= this.Select[0];//    左端
            var FrameStartAddress= this.Select[1];//    上端
//シート第2象限とソースデータの幅 の小さいほうをとる
            var TrackEndAddress=((xUI.SheetWidth-this.Select[0])<sdWidth)?
            (this.SheetWidth-1):(TrackStartAddress+sdWidth)    ;//    右端
            var FrameEndAddress=((targetXps.duration()-this.Select[1])<sdHeight)?
            (targetXps.duration()-1):(FrameStartAddress+sdHeight)    ;//    下端
        };
//バックアップは遅延処理・入力クリップをここで行う
        var Tracklimit=TrackEndAddress-TrackStartAddress+1;
        var Framelimit=FrameEndAddress-FrameStartAddress+1;
        if(srcData.length>Tracklimit){srcData.length=Tracklimit};
        if(srcData[0].length>Framelimit){for (var ix=0;ix<srcData.length;ix++){srcData[ix].length=Framelimit}};

//入力値をオブジェクトメソッドで設定
        return this.put([new xUI.InputUnit(
            [TrackStartAddress,FrameStartAddress],
            srcData.join("\n"),
            {
                target:targetXps,
                selection:[
                    [TrackStartAddress,FrameStartAddress],
                    [TrackEndAddress,FrameEndAddress]
                ]
            }
        )],toReference);
    }
};//xUI.sheetPut */

