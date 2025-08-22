/*(ライカコンポ出力)
<cell_red>
コンテ撮(ライカリール)出力仮スクリプト 2008 1月暫定版

コンテ分解プロジェクトに追加する
カット毎のコンポを作成する

コンテから読んだテーブルをもとにコンポの長さを出してステージと出力コンポを作る

ステージは、
	コンテサイズ
	コンテを定位置で配置
	カラム情報にしたがってカメラを配置(カメラワークがなければそれで終了)
	ステージをアウトプットコンポに配置
	アウトプットコンポはステージをフッテージにしてエクスプレッションで連結
	レンダーキューに自動配置
*/

/*	カットナンバーを引数にして実行すると当該カットのステージコンポと出力コンポを作成
ついでに出力コンポにボールドつけてRQに投げ込む。

本コーディングで必要な機能
	中断・データ確認・プログレス表示
	上書き(現在だと複数作成になってしまう。)
*/
nas.eStoryBoard.makeLeica=function(myCutNo){

	var buildComp	=false;//処理フラグ
//	var myAbort	=false;//処理終了フラグ
//	カラムコレクションの全キーを検査して順次処理

		for (var idx=0;idx<this.columnPosition.numKeys;idx++){
	var currentCutNo=this.targetCC.layers.byName("CUT No.").text.sourceText.valueAtTime(idx/this.frameRate,true).toString();

			if((! buildComp)&&(currentCutNo==myCutNo)){
/*
					カット番号がマッチした時に処理開始
			同一カットナンバーがあった場合にマージされないように
			先に1カット処理した時点で終了フラグ立てる。
 */
			myColumnInfo=this.getColumnInformation(idx);//カラム情報取得1回だけ
				buildComp=true;
				var myLength=myColumnInfo.length;//カット尺取得(整数値コマ数)
				var columnCount=0;//
				var startIndex=idx;//カットの開始インデックスを記録
				var startTime=idx/this.frameRate;//カラムの開始時間を記録
			};
			if((isNaN(myLength))||(myLength<=0)){buildComp=false};//尺が振られていないユニットはスキップする
			if(buildComp){
//処理フラグが立っている場合のみ情報を収集
				if(currentCutNo==myCutNo){
//終了判定
					columnCount++;//カラム数(画像枚数)を集計
				}else{
					break;//ブレークして情報収集ループを抜ける
				}
			}
		};

if(columnCount==0){return false;};//カット不適合時はfalseを戻してここで終了

		//収集した情報でXPSを初期化してXPSオブジェクト生成;いらないかも 使ってない
/*
		var myXps=new Xps(myLayers,myLength);
			writeLn(myLayers+":"+myLength);//
			myXps.init(myLayers,myLength);//

//			myXps.opus="";
			myXps.title=this.targetPS.layers.byName("TITLE").text.sourceText.value.toString();
//			myXps.subtitle="";
//			myXps.scene="";
			myXps.cut=myCutNo;
//			myXps.trin=;
//			myXps.trout=;
			myXps.framerate=this.frameRate;
			myXps.memo=columnCount.toString();
 */
		//ステージコンポを作る
/*
	コンテサイズでカメラがカラムコレクションのポジションを参照して初期配置される
	
	ライカ用のSolidをテンプレートに‘追加しておくこと　2010/02/03
*/
	nas.eStoryBoard.leicaCamera=app.project.items.getByName("Camera")[0];//ライカ用特設カメラ 512x288
	nas.eStoryBoard.leicaBoard=app.project.items.getByName("LeicaBoard")[0];//ライカ用特設カメラ 1280x720
	nas.eStoryBoard.leicaMask=app.project.items.getByName("clipOutMask")[0];//ライカ用特設カメラ 1280x720

	var w=this.targetCC.width;//カラムコレクションコンポのサイズを参照
	var h=this.targetCC.height;//
//undoGroupを3ブロックにわけるか?
app.beginUndoGroup(myCutNo+" Leica");
	var myStage=app.project.items.addComp("Leica_"+myCutNo,w,h,1,myLength/this.frameRate,this.frameRate);
	var myCast=myStage.layers.add(this.targetCC);//カラムコレクションをレイヤに登録
	var myCamera=myStage.layers.add(this.leicaCamera);//カメラレイヤを登録する今回は素材固定
		myCamera.blendingMode=BlendingMode.MULTIPLY;//乗算に
		myCamera.guideLayer=true;//ガイドレイヤに
//キャストレイヤのタイムリマップを有効にする。
	myCast.timeRemapEnabled=true;
//カウント数だけリマップにキーを作成して、リマップキーごとにカメラを配置する。
//キー種別はHOLD
for(var idx=0;idx<columnCount;idx++){
var myColumnInfo=this.getColumnInformation(startIndex+idx);//カラム情報再取得

	var myTime=(myLength/this.frameRate)*(idx/columnCount);//カット尺内で均等配置にする。
	var myValue=startTime+(idx/this.frameRate);
	myCast.property("timeRemap").setValueAtTime(myTime,myValue);
	myCast.property("timeRemap").setInterpolationTypeAtKey(myCast.property("timeRemap").nearestKeyIndex(myTime),KeyframeInterpolationType.HOLD);
	var myLeft	=myColumnInfo.position[0]+myColumnInfo.width/2;
	var myTop	=myColumnInfo.position[1]+myColumnInfo.height/2;
	var myScale	=100 * myColumnInfo.width/512;
	myCamera.property("position").setValueAtTime(myTime,[myLeft,myTop]);//時間配置は対照
	myCamera.property("position").setInterpolationTypeAtKey(myCamera.property("position").nearestKeyIndex(myTime),KeyframeInterpolationType.HOLD);
	myCamera.property("scale").setValueAtTime(myTime,[myScale,myScale]);//時間配置は対照

}
		//ステージコンポを格納してボールドつきの出力コンポを作る
	var myOutput=app.project.items.addComp("ライカ_"+myCutNo+"_output",1280,720,1,myLength/this.frameRate,this.frameRate);
//ボールド作成
	var boardLayer=myOutput.layers.add(this.leicaBoard);//最後に比較明で配置か?

	var stageLayer=myOutput.layers.add(myStage);//ステージコンポをアイテム追加
//ステージを8フレーム後ろに配置ちょっと 今回中止
//	stageLayer.startTime=8/this.frameRate;
//カメラ追従エクスプレションを適用
	stageLayer.property("anchorPoint").expression='this.source.layer(¥"Camera¥").position;';
	stageLayer.property("position").expression='[thisComp.width/2,thisComp.height/2]';
	stageLayer.property("scale").expression='[10000/this.source.layer(¥"Camera¥").scale[0]*thisComp.width/this.source.layer(¥"Camera¥").width,10000/this.source.layer(¥"Camera¥").scale[1]*thisComp.width/this.source.layer(¥"Camera¥").width];';
	stageLayer.property("rotation").expression='-this.source.layer(¥"Camera¥").rotation';
//クリップマスクを載せてトリミングする
	var clipMask=myOutput.layers.add(this.leicaMask);//
	clipMask.blendingMode=BlendingMode.STENCIL_ALPHA;
	clipMask.locked=true;//
//カット番号をのせる
	var cutNumberText=myOutput.layers.addText(new TextDocument(myCutNo));//デフォルトセンタ配置で良い
	cutNumberText.property("position").setValue([1100,680]);
	cutNumberText.property("scale").setValue([200,200]);
//	cutNumberText.outPoint=8/this.frameRate;//ボールド分の移動を今日は中止
		//出力コンポ用のOM / RQ登録

	var lrRQtemplate="最良設定";
	var lrOMtemplate="H.264";//"MPG4_VGA";
		myRQ=app.project.renderQueue.items.add(myOutput);
		myRQ.applyTemplate(lrRQtemplate);
		myRQ.outputModule(1).applyTemplate(lrOMtemplate);
app.endUndoGroup();
return myCutNo;//カット番号戻す

}
//上のコンポ作成を順次呼び出して全カット出力用のコンポを作成

nas.eStoryBoard.makeAllLeica=function(){
	var mySaveFolder=new Folder(Folder.current.path);
	mySaveFolder=Folder.selectDialog("レンダリング先フォルダを指定してください",mySaveFolder);

	var previewCutNo="";//初期値ヌル
	for (var idx=0;idx<this.columnPosition.numKeys;idx++){
		var myColumn=this.getColumnInformation(idx);
		if(myColumn.cutNo!==previewCutNo){
		//カット切り替え点で出力
			clearOutput();
			nas.otome.writeConsole(myColumn.cutNo+" : "+this.makeLeica(myColumn.cutNo));

		};
		previewCutNo=myColumn.cutNo;//更新
	};
}

//全カット出力
nas.eStoryBoard.makeAllLeica();
// 下は部分出力のための暫定コード
/*
for (var ctidx=51;ctidx<130;ctidx++){
	clearOutput();
	writeLn(nas.eStoryBoard.makeLeica(nas.Zf(ctidx,3)));
}
*/