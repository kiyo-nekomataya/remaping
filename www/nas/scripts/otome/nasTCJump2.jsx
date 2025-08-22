/*(TCJumper)
<chr_j>

module nas.TCJ
タイムコードジャンプカウンタ	アクティブなコンポのタイムコード移動を行なう連カウンタ
タイムシート1枚のフレーム数はプリファレンスパネルを使用してnasライブラリ共通変数で書き換えのこと
フレームレートは自動認識（コンポに従う）
アクティブなコンポを自動判別するが、「アクティブなコンポ」が必ずしも前面に出ていないことに注意すること

フレームカウンターは0.5秒ごとの自動更新だが、スイッチを切り替えて手動にすることも可能
自動更新を行ったままアプリケーションを終了しようとするとエラーが発生するので注意が必要

入力形式はnasタイムコードに順ずる。以下の入力は全て有効　タイムシートページセパレータはp##/
123 < フレーム数
5+12　<秒＋コマ
p2/ 1+12 <ページ/ 秒＋コマ
00:00:00	<mm:ss:ff ビデオ形式のTC

通常は省略可能ですが、
TC末尾に"."を付加するとその入力は開始番号が0であるとみなします。
またTC末尾に"_"を付加するとその入力は開始番号が１であるとみなします。

//tcJumper UI

*/
//オブジェクト識別文字列生成 
var myFilename="nasTCJump2.jsx";//正式なファイル名と置き換えてください。
var myFilerevision="1.0";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
//	var myFilename=("$RCSfile: stub.js,v $").split(":")[1].split(",")[0];
//	var myFilerevision=("$Revision: 1.1.4.3 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="TCJ";//識別用のモジュール名で置き換えてください。
var myWindowName	="fct";//モジュール配下のウィンドウ名をできる限りユニークに
/*	他のプログラムのウィンドウ名とコンフリクトした場合はウィンドウ位置が共有されますので注意	*/
//カスタマイズ用にカウンタの連数を変数で調整可能に
var myCounters=2;
//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンをnasモジュールに登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=false;//初期化コマンドを無効にします。
	
	if((this)&&(this instanceof Panel)){
		if(nas[moduleName].isDockingPanel)
		{
//パネルの場合は条件確認して処理停止またはウィンドウを消去して初期化
//ドッキングパネルコンフリクト　実際はこの動作はほとんどない　違うファイル名で同じモジュールを立ち上げようとした場合が主なパターン
//アラート表示して　初期化処理停止　実行キャンセル		
			var msg="すでにモジュールが起動されています。"+nas.GUI.LineFeed;
			msg+="リソースの衝突防止のため二重起動は禁止されています。"+nas.GUI.LineFeed;
			msg+="初期化はスキップされます。"+nas.GUI.LineFeed;
			msg+="ウインドウを閉じて起動しなおしてください。"+nas.GUI.LineFeed;
			alert(msg);
		}else{
//ウインドウ起動済みのモジュールをUIパネルで立ち上げようとした場合はウィンドウを消して再度初期化する
if(false)
{
			var msg="すでにモジュールが起動されています。"+nas.GUI.LineFeed;
			msg+="リソースの衝突防止のため二重起動は禁止されています。"+nas.GUI.LineFeed;
			msg+="パレットをドッキングウインドウに移動しますか？"+nas.GUI.LineFeed;
			msg+="移行しない場合はドッキングウインドウを閉じて起動しなおしてください。"+nas.GUI.LineFeed;
			exFlag=confirm(msg);
}else{
			exFlag=true;//問答無用かも
}
			if(exFlag){
				nas[moduleName][myWindowName].close();
				delete nas[moduleName];
//このスクリプトの識別モジュール名を再登録します。
			nas[moduleName]=new Object();
			nas[moduleName].isDockingPanel=(this instanceof Panel)?true:false;
			}
		}
	}else{
	//パネル以外場合の再初期化コマンドをここに
		if(nas[moduleName].isDockingPanel)
		{
//ドッキングパネルで起動されているモジュールの場合はアラートを表示して全ての動作をスキップ
	var msg="すでにモジュールがドッキングパネルで起動されています。"+nas.GUI.LineFeed;
	msg+="リソースの衝突防止のため二重起動は禁止されています。"+nas.GUI.LineFeed;
	msg+="初期化はスキップされます。"+nas.GUI.LineFeed;
	msg+="ドッキングパネルのモジュールを終了して再起動してください"+nas.GUI.LineFeed;
	alert(msg);
		}else{
//ウィンドウ起動の場合は、実行処理をスキップして既存のオブジェクトにフォーカスをうつす
		nas[moduleName][myWindowName].show();
		}
	}
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
	現在のモジュール(ウインドウ)の表示メソッドを呼んでいます。
	すでに読み込み済みのモジュールを再度初期化することを防止するための処理です。
 */
}else{
//このスクリプトの識別モジュール名を登録します。
	nas[moduleName]=new Object();
	nas[moduleName].isDockingPanel=(this instanceof Panel)?true:false;
}
		}catch(err){
//エラー時の処理をします。
	nas[moduleName]=new Object();
	nas[moduleName].isDockingPanel=(this instanceof Panel)?true:false;
//		強制的に初期化(モジュール名登録)して。実行
//	alert("エラーです。モジュール登録に失敗しました");exFlag=false;
//		または終了
		}
	}
}catch(err){
//nas 環境自体がない(ライブラリがセットアップされていない)時の処理(終了)
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}

if(exFlag)
{
	var myDefaultLeft	=nas.GUI.dafaultOffset[0];//ウィンドウ位置初期値を設定したい場合は
	var myDefaultTop	=nas.GUI.dafaultOffset[1];//お好きな値で置き換えてください。

	myLeft=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][0] : myDefaultLeft;
	myTop=(nas.GUI.winOffset[myWindowName])?
	nas.GUI.winOffset[myWindowName][1] : myDefaultTop;

// ///////////// GUI 設定 /////////////
// ウインドウ初期化
	if((this)&&(this instanceof Panel)){
		nas[moduleName][myWindowName]=this;//パネルの参照
	}else{
		nas[moduleName][myWindowName]=nas.GUI.newWindow("palette","tcJumper",myCounters*2+0.5,2,myLeft,myTop);
	}

if(! nas[moduleName].isDockingPanel){
//	ウィンドウ最終位置を記録(不要ならば削除してください。)
	nas[moduleName].onMove=function(){
nas.GUI.winOffset[myWindowName] =[nas[moduleName][myWindowName].bounds[0],nas[moduleName][myWindowName].bounds[1]];
	}
}
/*
if(this instanceof Panel){
	nas.TCJ.fct=this;
	var myUIOffset=0;
	nas.TCJ.fct.onClose=function(){delete nas.TCJ};//ウィンドウ終了時にオブジェクト削除　これはドッキングパネルの場合のみ標準処理にする
}else{
	nas.TCJ.fct=nas.GUI.newWindow("palette","tcJumper",6.5,2);
	var myUIOffset=1;
}
*/
	nas.TCJ.fct.taskID=false;//リフレッシュタスクIDを初期化
if(nas[moduleName].isDockingPanel){
	var myUIOffset=0.5;
	nas.TCJ.fct.onClose=function(){if(this.taskID){app.cancelTask(this.taskID)};delete nas.TCJ;};
//ウィンドウ終了時にオブジェクト削除　これはドッキングパネルの場合のみ標準処理にする
}else{
	var myUIOffset=1;
	nas.TCJ.fct.onClose=function(){if(this.taskID){app.cancelTask(this.taskID);}};
}

//	オブジェクトプロパティ設定
	nas.TCJ.fct.targetComp=null;//まずnullで初期化する
	nas.TCJ.fct.counters=myCounters;//カウンタ連数
	nas.TCJ.fct.currentTime=false;//カウンタ連数

		nas.TCJ.fct.getTarget=function(){
			//　this.targetCompが無効オブジェクトの場合があるのでその時はnullで初期化する
			if((this.targetComp)&&(nas.propCount(this.targetComp)<30)){this.targetComp=null}
			if(app.project.activeItem==this.targetComp)
			{
				//双方nullの場合もここでリターン フレームレート変更なし
				return this.targetComp;
			}
			if(app.project.activeItem instanceof CompItem)
			{
				//ターゲット変更フレームレート更新
				nas.FRATE = nas.newFramerate("",app.project.activeItem.frameRate);
				this.targetComp = app.project.activeItem;
				return true;
			}else{
				//ターゲットリリース
				this.targetComp=null;return false;
			}
			//ターゲットを取得時にフレームレートを書き直すこと
		}
//ドッキングパネルでない場合はタスクのキャンセルのみ
//	nas.TCJ.fct.onClose=function(){app.cancelTask(this.taskID);};

// ターゲット更新
		nas.TCJ.fct.getTarget();

//表示更新は初期化時に行なわれるが、リアルタイム追従できないので現在値を更新するボタンを付けることにする
//イベント駆動はできないが、インターバルは可能…このためにインターバルを使いたいかと問われると微妙…
//インターバル試験中
nas.TCJ.fct.refresh=nas.GUI.addButton(nas.TCJ.fct,"=",0,myUIOffset,0.7,1);
	nas.TCJ.refresh=function(){
		this.fct.getTarget();
		if((this.fct.targetComp)&&(this.fct.currnetTime != this.fct.targetComp.time)){
			this.fct.currnetTime = this.fct.targetComp.time;
			for(var c=0;c<this.fct.counters;c++)
			{
				this.fct.display[c].set(nas.ms2FCT(this.fct.targetComp.time*1000,this.fct.display[c].FCTtype,this.fct.display[c].FCTorg))
			}
		}
	}
nas.TCJ.fct.refresh.onClick=function(){

	if(nas.TCJ.fct.taskID){
		app.cancelTask(nas.TCJ.fct.taskID);
		nas.TCJ.fct.taskID=false;
		this.text="=";
	}else{
		nas.TCJ.fct.taskID=app.scheduleTask("nas.TCJ.refresh()",500,true);
		this.text="★";
	}
}
//カウンタ作る
nas.TCJ.fct.display=new Array();
for(var n=0;n<nas.TCJ.fct.counters;n++)
{
	var myType=[1,4,3,2,5,1,2,3,4,5][n%10];
	var myOrig=[0,1,0,1,1,1,1,0,0,0][n%10];
	nas.TCJ.fct.display[n]=nas.GUI.addComboBox(
		nas.TCJ.fct,
		["00000","0:00:00","000 + 00","p 0 / 0 + 00","p 0 / + 000","00001 _","0:00:01 _","000 + 01 _","p 0 / 0 + 01 _","p 0 / + 001 _"],
		(myType-1)+(myOrig*5),
		(2*n)+0.5,myUIOffset,2.1,1,true
	)
		nas.TCJ.fct.display[n].index=n;
		nas.TCJ.fct.display[n].FCTtype=myType;
		nas.TCJ.fct.display[n].FCTorg=myOrig;
		if(nas.TCJ.fct.targetComp instanceof CompItem){
			nas.TCJ.fct.display[n].set(nas.ms2FCT(nas.TCJ.fct.targetComp.time*1000,nas.TCJ.fct.display[n].FCTtype,nas.TCJ.fct.display[n].FCTorg));//コンポがない時は初期化省略
		}
	nas.TCJ.fct.display[n].onChange=function(){
			if(! this.parent.getTarget()){return}
			if(this.selected==null){
				if((this.FCTorg)&&(this.value.match(/[0-9\s]$/))){this.value=this.value+"_"};//ないほうが良いかも
				var myTime=nas.FCT2ms(this.value)/1000;
				if((myTime>=0)&&(myTime<=this.parent.targetComp.duration)){this.parent.targetComp.time=myTime;}
				for(var c=0;c<this.parent.counters;c++){this.parent.display[c].set(nas.ms2FCT(this.parent.targetComp.time*1000,this.parent.display[c].FCTtype,this.parent.display[c].FCTorg))}
			}else{
				this.FCTtype=(this.selected%5)+1;
				this.FCTorg=Math.floor(this.selected/5);
				this.set(nas.ms2FCT(this.parent.targetComp.time*1000,this.FCTtype,this.FCTorg));//nullの場合はスキップ
			}
		}
	}
if(true){
//スタートアップ
if(! nas.TCJ.isDockingPanel){
	nas.TCJ.fct.show()};//パレットのときのみ初期化
}
	if(nas.TCJ.fct.taskID){
		app.cancelTask(nas.TCJ.fct.taskID);
	}
//	nas.TCJ.fct.taskID=app.scheduleTask("nas.TCJ.refresh()",500,true);
}
