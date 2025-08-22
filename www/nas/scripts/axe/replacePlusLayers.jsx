/*
	修正レイヤーを検出して別のレイヤーセットに移動する
	同時にサブトラック用のシートを複製挿入する
	
*/

//ドキュメント内のレイヤセットを検索して以下の条件のレイヤーを検出する

//直下のレイヤー名にポストフィックス"\++"を加えたものが存在するレイヤーセットを抽出して　処理対象にする
//処理対象のオーバーレイ数を取得してループ
//処理対象レイヤセット内部のレイヤ名を確認してオーバーレイ数をカウントする
//同時に移動キューをビルド

/*
	処理前
A
	A3+
	A3
	A2++
	A2+	
	A2
	A1+
	A1
	処理後
A++
	A2++
A+
	A3+
	A2+
	A1+
A
	A3
	A2
	A1
*/
/*
	エントリのオーバーレイ指定（修正指示）は以下のように行う
	エントリの名称にオーバレイ（修正）ポストフィックスを加える
	修正ポストフィックスは、システムごとに定められた1文字のポストフィックスとする

(総|監|検|作|演|修|\+)がポストフィックスであるとして

"A-1"	の修正は	"A-1修" "A-1+"等となる

	ポストフィックスは、数字であってはならない
	ポストフィックスは、データセパレータと同一文字であってはならない

	修正レベルは、ポストフィックスを重ねて表す
"A-1"	の修正の修正は	"A-1修修" "A-1++"　"A-1演作"　等となる

	修正レベルが3以上の場合は以下の表記が認められる
	この場合の数値は繰り返し数値でありポストフィックスの一部ではない

"A-1"	の修正の修正の更に修正は	"A-1修3" "A-1+3"等となる

	可読性のためポストフィックス部分を標準セパレータ[\ _\-]で区切るか、または丸括弧でセパレーションしても良いこととする

A-1(修)	　B-2a(+3)	D-(24)(演)	たぬき-3 修

これらの実アプリ上の展開は各実装に委ねられる
今回の処理では以下のネーミングに限定

A-1+
A-1++
A-1++++++
A-1+3
これは、今回の実装のみの限定

シート処理の手順を組み込む
このプロシジャは基本的に一次処理なため
Xpsが基本的に保存対象でない
引数としてXpsオブジェクトを与えて、加工済みのオブジェクトを戻す？
今回は、等価のルーチンを起こして組み込むことで処理を行う

*/



function movePlusLayers(){
//XPS上の処理対象トラックを複製してトラックラベルを調整
var targetDocument=app.activeDocument;
	var processQueue=[];//処理キュー
/*	　処理の必要がある（修正レイヤを持った）レイヤーセット（トラック）をプロパティとして持った
処理オブジェクトを積む
以下のプロパティとメソッドを持つ
*/
function ProcessEntry(myTarget){
	this.sourceTrack=myTarget;//	LayerSet ソーストラック
	this.targetLayers=[];//	Array [移動ターゲット(Layer),移動先ID]の要素配列
	this.overlayCount=0;//　number オーバレイの必要数を保持
	
}
//オブジェクト自体の処理メソッドで実行
/*
引数:なし
戻値:XPS.insertTLの引数用の（[挿入トラック名配列])
*/
	ProcessEntry.prototype.doProcess=function(){
		var myResult=[];
		if(this.overlayCount==0) return myResult;//カラ配列を戻す
		
		//移転先の新規レイヤセット作成ループ
		for (var cid=this.overlayCount-1;cid>=0;cid--){
//処理に先行してファルダの名前を取得
            var destinationName=this.sourceTrack.name+(["+","++","+3","+4","+5","+6","+7","+8","+9"])[cid];
//既に同名のレイヤセットがあれば処理をスキップ
            try{
                var myDestination=this.sourceTrack.parent.layerSets.getByName(destinationName);
            }catch(err){
			   var myDestination=this.sourceTrack.parent.layerSets.add();
                myDestination.name=destinationName;
                myDestination.move(this.sourceTrack,ElementPlacement.PLACEBEFORE);
				myResult.push(destinationName);//先にトラックがある場合はシート上にもあると思い「たい」のでココで処理
            }
			//レイヤセットのソートは後で行うのでここでは無視
		}
		//エントリ移動
		for (var lix=0;lix<this.targetLayers.length;lix++){
			var myTarget=this.targetLayers[lix][0];
                var myDestName=this.sourceTrack.name+(["+","++","+3","+4","+5","+6","+7","+8","+9"])[(this.targetLayers[lix][1]-1)];
			try{
                var myDestination=this.sourceTrack.parent.layers.getByName(myDestName);
			myTarget.move(myDestination,ElementPlacement.PLACEATEND);
			}catch(err){alert(err)}
//			myTarget.name=myTarget.name;//リネーム保留
		}
		return myResult.reverce();//順序反転して戻す
	}


//============
for (var wsix=0;wsix<targetDocument.layerSets.length;wsix++){
	var myTrack=new ProcessEntry(targetDocument.layerSets[wsix]);
	
	if (
			( myTrack.sourceTrack.layers.length<=0 )||
			( myTrack.sourceTrack.name.match(/(.*[^\+])(\++)([1-9]?)$/) )
	){
		continue;//スキップ条件に一致するエントリの場合は処理スキップ
	}else{
		processQueue.push(myTrack);//キューにエントリ
	}
//レイヤセット内をチェック
	for (var lix=0;lix<myTrack.sourceTrack.layers.length;lix++){
				targetName=myTrack.sourceTrack.layers[lix].name;
				if(targetName.match(/(.*[^\+])(\++)([1-9]?)$/)){
//	ただ一つでも該当エントリがあればそのトラックは複製対象で、かつ該当エントリは移動（変名）対象
//	処理を単純化するために全てのトラックに処理キューが存在して居ることにして判定を行い、
//	移動エントリ０の場合のみ処理をスキップする方法で実装する

					var plusCount=((RegExp.$3).length)?　parseInt(RegExp.$3):(RegExp.$2).length;
					//キューのカウントを更新
					if(myTrack.overlayCount<plusCount){myTrack.overlayCount=plusCount;}
					//処理キューにレイヤー（又はレイヤーセット）を積む
					myTrack.targetLayers.push([myTrack.sourceTrack.layers[lix],plusCount]);
/*
	if(myAllLayers.finedName(RegExp.$1)){
	実処理上、必ずしも修正に対応する元絵は必要ない。
	元絵（番号対応するエントリ）が存在しないケースもままある。
	最も重要な所属関係は、その要素がどのトラックに対応するか
	（＝どの時間情報を使ってタイムライン上に占位するか）である
	}				
*/
				}
	};
}
//========処理収集フェーズ終了　実処理
for(var ix=0;ix<processQueue.length;ix++){
		var myTracks=processQueue[ix].doProcess();
		if(myTracks.length && XPS){
			var myTrackName=processQueue[ix].sourceTrack.name;
			var myIndex=-1;
			for (var lix=0;lix<XPS.layers.length;lix++){if (myTrackName==XPS.layers[lix].name){myIndex=lix;break;};};		XPS.intertTL(myIndex+1,myTracks);//空トラック挿入
			var baseStream=XPS.xpsBody[myIndex+1].join(",");
			for(var tx=0;tx<myTracks.length;tx++){XPS.put([myIndex+tx+1,0],baseStream);};
		}
}
}
var myUndo="修正レイヤを別に";//"レイヤ仕分け"
var myAction="movePlusLayers();";
if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}

