//TVP書き出しファイル処理専用
/*
	classifyTVPData.jsx
	TVP出力psdをcsvデータの内容を参照してレイヤを仕分けしたドキュメントを作成する
	主な使用目的は、TVPで作画されたレイアウト・原画や動画等をそれぞれレイヤごとにレイヤセットに
	分類されたドキュメントを作成するための作業補助スクリプトである。<<( 暫定版 )>>

	2016.04.15 Nekomataya kiyo

指定解像度の設定が必要
非表示レイヤ名は、スクリプト冒頭の正規表現で指定

修正（オーバレイ）レイヤの処理を追加
	+(オーバレイ)レイヤ用のレイヤセットは作らない
	レイヤセット名からオーバレイレイヤーを作成して当該のレイヤー（と思われるレイヤ）の上に移動されるようにソート比較関数を調整
XPSデータ作成時は、一旦修正レイヤー含みのXPSを作成後、オーバレイ処理を行うレイヤーセットを削除する

オーバレイレイヤー分のタイムシート適用はペンディング
キュー構造の拡張は、マルチステージ化ドキュメントのマルチシート化（MAP導入）と同時処理になる見込み
2016.06.29　
　*/
var myTitles={"mns":"モンスターストライクspecial"};
//var myTitles={"tvpc":"TVPaint Convert TEST"};
var myResolution="150dpi";//
var hideLayers=["All","3D","_[^_]+"];
var interpSigns=["-","=","\\*","○","●","<([^<>]+)>"];

var revRegex=new RegExp("((\\+|演出?|作監?|メカ?|エ(フェクト)?|監督?|カ(ブセ)?|修正?)+)(\\d)*$");
//var revRegex=new RegExp("((演出?|作監?|メカ?|エ(フェクト)?|監督?|カ(ブセ)?|修正?|\\+)+)(\\d)?$");
//下のパターンはAdobe ExtendScript上で"++"を含む文字列を評価すると無限ループになる場合があったので注意　
//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   $.evalFile(new File(Folder.userData.fullName+'/nas/lib/Photoshop_Startup.jsx'));
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
//処理条件判定
/*
	ドキュメントが存在する
	対照ドキュメントと同名のCSVデータが存在する
	未処理である（ドキュメント上にレイヤセットが無い）
*/
var EXFlag=true;
/*		ターゲット取得

	フラットなレイヤ構造である
	同名のcsvが同じフォルダにある
	未処理である
	以上の3条件が揃っている場合のみ処理を行う
		それ以外の場合は動作キャンセル
 */
try{
	var TargetDocument=app.activeDocument;
	var myTargetCSV=new File((app.activeDocument.path.fullName+"/"+ app.activeDocument.name).replace(/psd$/i,"csv"));

	EXFlag=(TargetDocument.layers.length)?false:true;
	EXFlag=myTargetCSV.exists;
	EXFlag=(TargetDocument.layerSets.length)?false:true;
}catch(er){
	EXFlag=false;
}
if(! EXFlag){
	alert("処理対象のデータが無いか、または処理済みです");
}else{
//======================== 暫定ライブラリ　デバッグ終了後に統合
/*
	XPS用簡易ダイアログ他音声トラックパーサ

	音声系トラックのパースを行いセクションコレクションを戻すアルゴリズム
	単純
	データ列を順次チェック
	MAPへの問い合わせは基本的に無し
*/
/*
簡易オブジェクトで実装
エレメントのラップもしない

nas.AnimationSound Object
　同名のオブジェクトとの互換はあまり考えない
　名前が同じだけと思うが吉
　タイムシートサウンドトラックの値となる
　外部ファイルリンクはこの際割愛
bodyStream();	タイムシート内のストリームをテキストで取り出す（メソッド）
contentText;	String	内容テキスト原文
name;	String	ラベルとなる名称
bodyText;	String	
attributes;	Array	オブジェクト属性配列
comments;	Array	ノートコメントコレクション配列


*/
nas.AnimationSound=function(myContent){
//	this.source;
//	this.duration;
//	this.startOffset;
	this.contentText=myContent;
	this.name="";
	this.bodyText="";
	this.attributes=[];
	this.comments=[];
}
//
/*
	初期化時の内容テキスト（シナリオ型式）をパースしてオブジェクト化するメソッド
	本来は自動実行だが、今回は必要に従ってコールする
*/
nas.AnimationSound.prototype.parseContent=function(){
	if(this.contentText.length){
		if(this.contentText.match(/^([^"'「]*)["'「]([^"'」]*)["'」]?$/)){ ;//"
			this.name=RegExp.$1;
			this.bodyText=RegExp.$2;
		}else{
			this.name="";
			this.bodyText=this.contentText;
		}
		var myAttributes=this.name.match(/\([^)]+\)/g)
		if(myAttributes){
			this.attributes=myAttributes;
			this.name=this.name.replace(/\([^)]+\)/g,"");
		}
		var myComments=this.bodyText.match(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g);
		if(myComments){
			this.comments=[];//newArray
			var myString=this.bodyText;
			for (var cix=0;cix<myComments.length;cix++){
				if(cix==0){
					var prevIndex=0;
				}else{
					var prevIndex=parseInt(this.comments[this.comments.length-1][0]);					
				}
				this.comments.push([prevIndex+myString.indexOf(myComments[cix]),myComments[cix]]);
				myString=this.bodyText.slice(prevIndex+this.comments[this.comments.length-1][0]+this.comments[this.comments.length-1][1].length);
			}
			this.bodyText=this.bodyText.replace(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g,"");
		}
		return this.toString();
	}else{return false;}	
}
/*
プロパティを組み上げてシナリオ型式のテキストを返す
*/
nas.AnimationSound.prototype.toString=function(){
	var myResult=this.name;
	myResult+=this.attributes.join("");
	myResult+="「";
	var startPt=0;
	if(this.comments.length){var endPt=this.comments[0][0]}else{var endPt=0};
for(var cix=0;cix<this.comments.length;cix++){
	myResult+=this.bodyText.slice(startPt,endPt)+this.comments[cix][1];
	startPt=endPt;
	if(cix<this.comments.length-1){endPt=this.comments[cix+1][0]};
}
if(startPt<this.bodyText.length){myResult+=this.bodyText.slice(startPt)};
	myResult+="」";
 return myResult;
}
/*
	本体プロパティからデータ配列を返す　引数でヘッダかボディを選択

	セクションがこの戻り値を受けて整形して出力を行う
	
	ボディストリームは、継続時間内にコンテンツを配置したストリームで返す
	マージンは自動配置で、先頭から（残処理分の）平均マージン（切り捨て）を加えた間隔で１セルあたり１文字配置
	コメント類は１セルに置く
	ボディデータの前後関係は保持
	表示マージンが不足している場合は、とりあえず継続時間を延長 　2016.05.29
*/
nas.AnimationSound.prototype.toStream=function(myType,myDuration){
	if(typeof myType=="undefined"){myType="body"};//body,header,
	var myResult=[];

	if(myType=="header"){
		myResult.push(this.name);
		myResult = myResult.concat(this.attributes);
		myResult.push("----");
	}
	if(myType=="body"){	
		var startPt=0;
		var bodyElements=[];
		//配置フレーム数は引数で与えることが出来る
		//平均マージンは　Math.floor((残フレーム-残文字数)/残文字数)
		if(this.comments.length){var endPt=this.comments[0][0]}else{var endPt=0};
		for(var cix=0;cix<this.comments.length;cix++){
			bodyElements=bodyElements.concat(this.bodyText.slice(startPt,endPt).split(""));
			bodyElements.push(this.comments[cix][1]);
			startPt=endPt;
			if(cix<this.comments.length-1){endPt=this.comments[cix+1][0]};
		}
		if(startPt<this.bodyText.length){bodyElements=bodyElements.concat(this.bodyText.slice(startPt).split(""))};
		//　作成したbody配列をマージン付きに再配置
		if (typeof myDuration == "undefined") myDuration=0;
		myDuration=(myDuration<bodyElements.length)?bodyElements.length:myDuration;
		for (var eix=0;eix<bodyElements.length;eix++){
			var restFrames=myDuration-myResult.length;
			myResult.push(bodyElements[eix]);
			var marginLength=Math.floor((restFrames-(bodyElements.length-eix))/(bodyElements.length-eix));
			if(marginLength>0) myResult=myResult.concat(new Array(marginLength));
		}
	}
//	if(myType=="body") myResult.push("----");
return myResult;
}
//	test
//A=new  nas.AnimationSound("たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る]」");
//A.parseContent();
//A.toStream("body",24);

//タイムラインをダイアログパースする
/*
	引数は、ストリーム文字列又は配列
	配列は１次のみ
	音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
	今回は省略
	開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
	後から仕様に合わせて再実装
	判定内容は
	/^[-_]{3,4}$/	開始・終了マーカー
	/^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/	インラインコメント
	その他は
	ブランク中ならばラベル
	音響Object区間ならばコンテントテキストに積む　空白は無視する
	⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
	オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
	
*/
parseSoundTrack =function(myStream){
	if(!(myStream instanceof Array)){myStream=myStream.split(",")};
	var myResultTL=new XpsTimelineTrack("temp","dialog");
	//この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
	//継続時間０で先に作成 同時にカラのサウンドObjectを生成
	var currentSection=myResultTL.addSection(false);
	var currentSound=new nas.AnimationSound("");//コンテンツはカラで初期化も保留
	for (var fix=0;fix<myStream.length;fix++){
		currentSection.duration ++;//currentセクションの継続長を加算
		//未記入データ　これが一番多いので最初に処理しておく
		if(myStream[fix]==""){
			continue;
		}
		//括弧でエスケープされたコメント又は属性
		if(myStream[fix].match(/^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/)){
			if(currentSection.value){
				currentSound.comments.push([currentSound.bodyText.length,RegExp.$1]);
			}else{
				currentSound.attributes.push(RegExp.$1);
			}
			continue;
		}
		//セクションセパレータ　少ない
		if(myStream[fix].match(/^[-_]{3,4}$/)){
			if(currentSection.value){
				currentSection.duration --;//加算した継続長をキャンセル
				currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
				currentSection=myResultTL.addSection(false);//新規のカラセクションを作る
				currentSection.duration ++;//キャンセル分を後方区間に加算
				currentSound=new nas.AnimationSound("");//サウンドを新規作成
			}else{
				currentSection=myResultTL.addSection(currentSound);//新規有値セクション作成
			}
			continue;
		}
//判定を全て抜けたデータは本文又はラベル　ラベルは上書きで更新
		if(currentSection.value){
			if(myStream[fix]=="|") myStream[fix]="ー";
			currentSound.bodyText+=myStream[fix];
		}else{
			currentSound.name=myStream[fix];
		}
	}
	return myResultTL;
}

//	 ダイアログタイムラインからから置きかえタイムラインへ変換したストリームを返すメソッド
/*
	 この置換えタイムラインの扱いを簡略化するために、タイムラインの統合は行なわない
	 台詞ボールドは必ず、トラックごとにレイヤセットを設けること
	 
	 Xpsに台詞用置きかえタイムラインを挿入するのは望ましくないので
	 まず行わない
	 望ましくは、psAxeではダイアログタイムラインのまま台詞ボールドを扱う
	 TVPaint用としては"[layerID][frameNo] _dialog#_-#"レイヤ名を与える
	 このルーチンは内部処理用で外部からコールすることはない（使うと弊害ありそう）
*/

XpsTimelineTrack.prototype.convertReplacement=function(){
	var myResult="";var currentIdx=1;
	for(var ix=0;ix<this.sections.length;ix++){
		currentSectionArray= new Array(this.sections[ix].duration);
		if(this.sections[ix].value){
			currentSectionArray[0]=currentIdx;
			currentIdx++;
		}else{
			currentSectionArray[0]="X";
		}
		myResult+=currentSectionArray.join(",");
	}
	return myResult;
}


//========================暫定ライブラリここまで
function _reformatTL(id){
//===timing===
//　分岐であらかじめ判定するのでプロパティチェックは不要に　2013/06/22
//現状ではidがセル範囲外であった場合に中断するトラップが必要
//	if( id<0 || id>= XPS.layers.length ){return false};
//タイミングタイムラインでない場合は、処理中断
//	if(XPS.layers[id+1]["option"]!="timing"){return false};
//ターゲットタイムライン
	var myTargetBody=saveXPS.xpsBody[id];//指定タイムラインのバルクデータを配列で参照
	var myDestTLBody=new Array();//編集用カラ配列
	var bufNoChange=new Array(); var bufModified=new Array();//編集バッファ
	var sVC=0;//同値カウンタ
	var myLimit=5;//5kまでは縦線省略 演出希望で調整 06/03
//第一フレームが有効記述か否か確認(id=0は、事前チェックで入らないはず)
	var referenceValue=(myTargetBody[0]=="X")?"blank":myTargetBody[0];
//このスクリプトとしては前段の処理でデータチェックが済んでいるのでデータチェックを省略　20160416
	if(referenceValue=="blank"){
		myDestTLBody.push("X");
	}else{
		if(myTargetBody[0].match(/^(\d+)$/)){myTargetBody[0]="("+myTargetBody[0]+")"};//これは一括調整がほしい
		myDestTLBody.push(myTargetBody[0]);
	};
	sVC=1;
//第二フレームからデータループ
	for(var fidx=1;fidx<myTargetBody.length;fidx++){
//	評価値取得
		var evValue=(myTargetBody[fidx]=="")?referenceValue:myTargetBody[fidx];

		if(myTargetBody[fidx].match(/^(\d+)$/)){myTargetBody[fidx]="("+myTargetBody[fidx]+")"};//これは一括調整がほしい

		bufNoChange.push(myTargetBody[fidx].replace(/^(x|0|〆|Ｘ|ｘ)$/i,"X"));//非加工バッファを作成
//	リファレンスと一致
		if((evValue==referenceValue)&&(evValue!="interp")){
			var modifiedData=(myTargetBody[fidx])?myTargetBody[fidx]:"|";
			if(modifiedData.match(/^(\d+)$/)){modifiedData="("+modifiedData+")"};//これ一括調整関数がほしい
			if((referenceValue=="blank")&&(modifiedData=="|")){
				modifiedData=":";//置き替え
			};
			bufModified.push(modifiedData);
//	同値カウンタ加算
			sVC++;
		}else{
			var modifiedData=myTargetBody[fidx];
			if(modifiedData.match(/^(\d+)$/)){
				modifiedData="("+modifiedData+")";
};//これ一括調整関数がほしい
			if(evValue=="blank"){
				modifiedData=modifiedData.replace(/^(x|0|〆|Ｘ|ｘ)$/i,"X");
			};
			bufModified.push(modifiedData.toString());
//	シートの値が変更されたのでバッファをフラッシュする
			if(sVC>myLimit){
//	同値カウンタが規定値以上(4以上)なら加工済みバッファでフラッシュ
				myDestTLBody=myDestTLBody.concat(bufModified);
//myDestTLBody.push("mfd");
			}else{
//	同値カウンタが規定値より下(3以下)なら非加工バッファでフラッシュ
				myDestTLBody=myDestTLBody.concat(bufNoChange);
//myDestTLBody.push("nch");
			};
//	同値カウンタリセット
		sVC=1;
//	サブバッファ初期化
		bufNoChange.length=0; bufModified.length=0;
//	基準値更新
		referenceValue=evValue;
		};
	};
//	全ループ終了後に残った編集バッファをフラッシュする
	if(sVC>0){
		if(sVC>myLimit){
//	同値カウンタが規定値以上(4以上)なら加工済みバッファでフラッシュ
			myDestTLBody=myDestTLBody.concat(bufModified);
		}else{
//	同値カウンタが規定値より下(3以下)なら非加工バッファでフラッシュ
			myDestTLBody=myDestTLBody.concat(bufNoChange);
		};
	};
	return myDestTLBody.join();
};
/*		removeDuplicatedLayers(ターゲットレイヤトレーラ)
	TVpaintによって複製されたレイヤを削除する専用関数
	（グループ名＋フレーム番号）から元のインスタンス名をナンバーとするレイヤ名を割り出して、名前が重複する場合そのレイヤを削除する
	引数はレイヤセット
	振り分け前にdocument.layersに対して実行する
*/
removeDuplicatedLayers=function(target){
	var newNames=[];
	newNames.hasName=function(cmp){for(var ix=0;ix<this.length;ix++){if(this[ix]==cmp)return true;};return false;}
	var queue=[];
	for(var lix=0;lix<target.length;lix++){
		var newName=XPS.getName(target[lix].name);
		if(newNames.hasName(newName)){queue.push([target[lix],false])}else{queue.push([target[lix],newName]);newNames.push(newName);}
	}
	for(var qix=0;qix<queue.length;qix++){
		if(queue[qix][1]){queue[qix][0].name=queue[qix][1];}else{queue[qix][0].remove();};
	}
}

/*		removeIterpLayers(ターゲットレイヤトレーラ)
	動画記号を持ったレイヤを削除する専用関数
	指定の正規表現でインスタンス名が動画記号であるレイヤ名を割り出して、そのレイヤを削除する
	引数はレイヤセット
	振り分け前にdocument.layersに対して実行する
*/
	//動画記号
if(interpSigns.length){
	var interpRegex=new RegExp("-"+interpSigns.join("|")+"$","i");
}else{
	var interpRegex=new RegExp("")
}

removeInterpLayers=function(target){
	var queue=[];var delNames=[];
	for(var lix=0;lix<target.length;lix++){
		var newName=XPS.getName(target[lix].name);
		if(newName.match(interpRegex)){delNames.push(newName);queue.push(target[lix]);}
	}
	for(var qix=0;qix<queue.length;qix++){ queue[qix].remove();}
}
/*		parseFileName(ファイル名)
ファイル名文字列を与えて分解して戻す
拡張子はあってもなくても良い
戻しは配列	[cut,scene,opus,title]
あとでSCInfo で書きなおしが必要
*/
parseFileName=function(myFileName){
	if(myFileName.match(/^(.+[^\d#])(op|ep)?#?(\d+[^\d#]*)[s_-]#?(\d+[^\d#]*)[c_-]#?(\d+[^\d\.]*)(\.?[^\.]*)$/i)){
		return[RegExp.$5,RegExp.$4,RegExp.$3,RegExp.$1];
	}
	if(myFileName.match(/^(.+[^\d#])(op|ep)?#?(\d+[^\d#]*)[c_-]#?(\d+[^\d\.]*)(\.?[^\.]*)?$/i)){
		return[RegExp.$4,"",RegExp.$3,RegExp.$1];
	}
	return ["---","","--","mns"];
}
//parseFileName("mns02c125.tvpp")
//parseFileName("うらしま#02s12c133.xps")
/*
			layerSort(レイヤコレクション[,並び順]);
	汎用レイヤソート関数
		指定されたレイヤコレクションをレイヤ名でソートする。
		引数にfalseを与えると、逆順ソートになる（アニメのセルでは逆順がスキなのでデフォルト）
		同名のレイヤがある場合は、警告を出して処理を続行。
		二つ目以降は処理対象にならずに下にたまって残る
		並び順オプションはtrue/falseで指定
		レイヤコレクションは、Layers,ArtLayers,LayerSets など
*/

layerSort= function(targetCol,revFlag){
//	並び替え対象を設定
	var myTarget=targetCol;
//	引数がレイヤコレクションでなかった場合、キャンセル
	if(targetCol.typename != "Layers"){return false;};
//	引数なければ下から正順
	if(! revFlag) revFlag=false;//
//	並び替え対称のレイヤが1つしかない場合は、並び替え不能なのでキャンセル
	if(myTarget.length<=1){return false;};
//	ソート用配列を作る
	var sortOrder=new Array();
	for (idx=0;idx<myTarget.length;idx++){
		if (myTarget[idx].isBackgroundLayer){
			continue;//レイヤが背景だったら無視
		}else{
			sortOrder.push(myTarget[idx].name);
		}
	}
//まず並び替える(この時点で下から正順)
	sortOrder.sort(	function(a,b){
		a=nas.RZf(a);b=nas.RZf(b);
    	if( a < b ) return -1;
       	if( a > b ) return 1;
       	return 0;
    });
    if (revFlag){
//反転フラグあれば反転
		sortOrder.reverse();
	}
//並び替えた配列から同名レイヤのチェック
	for (idx=1;idx<sortOrder.length;idx++){
		if(sortOrder[idx-1]==sortOrder[idx]){
			alert(nas.uiMsg.dm015);//"同名のレイヤがあります。\n二つ目以降のレイヤは並び替えの対象になりません。"
			break;
		}
	}
	for (idx=0;idx<sortOrder.length;idx++){
		myTarget.getByName(sortOrder[idx]).move(myTarget[0],ElementPlacement.PLACEBEFORE);
	}
	return sortOrder;
}
/*
		layerReverse(レイヤコレクション);
	レイヤ並び順反転サブプロシージャ
	レイヤの並び順を反転する。引数はレイヤコレクション(~.layers)
*/
layerReverse= function(targetCol){
//	並び替え対象を設定
	var myTarget=targetCol;
//	引数がレイヤコレクションでなかった場合、キャンセル
	if(targetCol.typename != "Layers"){return false;};
//	並び替え対称のレイヤが1つしかない場合は、並び替え不能なのでキャンセル
	if(myTarget.length<=1){return false;};

//	ソート用配列を作る
	var sortOrder=new Array();
	for (idx=0;idx<myTarget.length;idx++){
		if (myTarget[idx].isBackgroundLayer){
			continue;//レイヤが背景だったら無視
		}else{
//レイヤ自体を配列に格納
			sortOrder.push(myTarget[idx]);
		}
	}
//逆順で配置
	for (idx=0;idx<sortOrder.length;idx++){  
		sortOrder[idx].move(myTarget[0],ElementPlacement.PLACEBEFORE);
	}
	return;
}


/*
		reductString(対象文字列);
	文字列を解釈して要素分解する関数
	引数は文字列
	戻り値は、エレメントコレクション配列
	[[オリジナルのエレメント名,ステージ,グループラベル,エレメントID,修正記述子],[(同左)],[(同左)]…]
サンジゲンのTVP運用では"-_"等をレイヤラベルとして使用するのでセパレータから排除する　2016.06.22
引数は必ず　Psレイヤー名 = [TVPレイヤー名,TVPインスタンス名].join("-")　と、なる
*/
reductString=function(myString){
	if(!myString){return false};
	var resultArray=new Array();

var stgRegex=new RegExp("^(cont|layout|rough|key|cell|コンテ|レイアウト|ラフ原|原画|一原|二原|セル)","i");
var lblRegex=new RegExp("^(BG|BOOK|SLIDE|PAN|T\\.U|T\\.B|Z\\.I|Z\\.O|L\/?O|背景|原図|ブック|[A-Z])","i");

var revRegex=new RegExp("((\\+|演出?|作監?|メカ?|エ(フェクト)?|監督?|カ(ブセ)?|修正?)+)(\\d)*$");
//エレメントセパレータとして"/","_"を使用しているのでラベルとIDの間にこれらの文字がある場合はあらかじめ置換してからこのスクリプトに渡すこと 一時修正(2016.05.22)

//	if(myString.match(/(.+)\..+$/)){myString=RegExp.$1};//ファイル拡張子は捨てる--引数として与えられないので削除
//	if(myString.match(/^([^\/\_\ ]+)[\/\_\ ]([0-9]+)$/)){myString=RegExp.$1+"-"+RegExp.$2};//文字列全体が1ラベル＋数値だと思われる場合はラベルセパレータを削除 -- この工程も省略
//引数文字列をエレメント配列に分割
//	myElements=myString.replace(/\s*[\/\_]\s*/g,"/").split("/");
	myElements=myString.split("/");
//各エレメントを解析
	for (var idx=0;idx<myElements.length;idx++){

//		myPattern=myElements[idx].replace(/\ *[\-\ ]\ */g,"-").split("-");
		myPattern=myElements[idx].split("-");
		myPattern=[myPattern.slice(0,myPattern.length-1).join("-"),myPattern[myPattern.length-1]];
		if(myPattern.length==4){
			//要素4の場合は、無条件で全指定とみなす
		}else{
			
		}
		switch (myPattern.length){
		case 4:;//要素数4なので全指定とみなしてマッピング
			myStgPrefix	=myPattern[0];
			myGrpLabel	=myPattern[1];
			myElmIndex	=myPattern[2];
			myRevPostfix	=myPattern[3];
		break;
		case 3:;//要素数3は、第一要素で判定 2分岐
			if(myPattern[0].match(stgRegex)){
				myStgPrefix	=myPattern[0];
				myGrpLabel	=myPattern[1];
				myElmIndex	=myPattern[2];
				myRevPostfix	="";
			}else{
				myStgPrefix	="";
				myGrpLabel	=myPattern[0];
				myElmIndex	=myPattern[1];
				myRevPostfix	=myPattern[2];
			}
		break;
		case 2:;//要素数2の場合は、ラベルとインデックスの対として処理
				myStgPrefix	="";
				myGrpLabel	=myPattern[0];
				myElmIndex	=myPattern[1];
				myRevPostfix	="";
		break;
		default:;//標準処理
			myTestStr=myElements[idx];
//	冒頭はステージ指定か?
	if(myTestStr.match(stgRegex)){
		myStgPrefix=RegExp.$1;
//						評価文字列更新
		myTestStr=myTestStr.replace(myStgPrefix,"");
	}else{
		myStgPrefix="";
	}
//	末尾に修正レベル指定があるか
	if(myTestStr.match(revRegex)){
		myRevPostfix=RegExp.$1;
//						評価文字列更新
		myTestStr=myTestStr.replace(myRevPrefix,"");
	}else{
		myRevPostfix="";
	}
//	ラベルマッチ？
	if(myTestStr.match(lblRegex)){
		myGrpLabel=RegExp.$1;
//						評価文字列更新
		myElmIndex=myTestStr.replace(myGrpLabel,"");
	}else{
		myGrpLabel="";
		myElmIndex=myTestStr;
	}
//評価後にグループラベルとインデックスに空文字列が現れた場合補完する
//空文字列は禁止
		if(myElmIndex==""){myElmIndex=myElements[idx];};
		if(myGrpLabel==""){myGrpLabel=myElmIndex;};
//フォーマット側でグループ内にエントリが1点のみの場合は、エレメントインデックスとグループ名を一致させる方向性をつける
//	------ 暫定版エレメント名評価
		break;
		}
				resultArray.push([myElements[idx],myStgPrefix,myGrpLabel,myElmIndex,myRevPostfix]);
	}

return resultArray;
}
//reductString("A+001");

/*
		classify(ターゲットレイヤトレーラ)
	ターゲットのレイヤトレーラを対象にレイヤを分類整理(仕分け)するナリよ
	引数は、レイヤトレーラ(layers をもつオブジェクト)
*/
classify=function(targetObject){
//	ターゲット内にアートレイヤが無い場合は処理中止
	if(targetObject.artLayers.length==0){return false;}
	var moveActions=new Array();
//		まず情報収集
	for (var idx=0;idx<targetObject.artLayers.length;idx++){
		//	名前を分解
		// 
		if(false){
			myElements=(targetObject.artLayers[idx].name).replace(/\s/g,"").split("-").reverse();
			var newLayerName=myElements[0];
				moveActions.push([targetObject.artLayers[idx],myElements[1],newLayerName,0]);
		}else{
			myElements=reductString(targetObject.artLayers[idx].name);
			for (var id=0;id<myElements.length;id++){
//			var newLayerName=myElements[id].join("-").replace(/^\-/,"").replace(/\-$/,"");
			var newLayerName=myElements[id][0];
//				moveActions.push([targetObject.artLayers[idx],myElements[id][2],myElements[id][3],id]);
				moveActions.push([targetObject.artLayers[idx],myElements[id][2],newLayerName,id]);
		//		処理スタックに[レイヤオブジェクト/ターゲットフォルダ名/新レイヤ名/アクションフラグ]で積む
			}
		}
	}
//	alert(moveActions.toString());
//
	for (var idl=0;idl<moveActions.length;idl++){
		var targetLayer	=moveActions[idl][0];
		var dstFolderName	=moveActions[idl][1];
		var dstLayerName	=moveActions[idl][2];
		var actionFlag	=(moveActions[idl][3]==0)? true : false;
		var myDestFolder =new Object();
/*
//修正レイヤーのターゲットフォルダは被修正レイヤーの親として判定
//修正レイヤーの修正レベル指定子をレイヤ名に移動する
//マッチの際の戻り値[指定子全体,繰り返し部,指定文字列,,,数値部]
		if(dstFolderName.match(revRegex)){
			var myPostFix=RegExp.$5;
			dstFolderName=moveActions[idl][1].replace(revRegex,"");
			dstLayerName=targetLayer.name.replace(revRegex,"")+myPostFix;
		}
*/
//	移動先フォルダを設定(getByNameでアクセスして失敗したら作成・設定する)これはCSでは動くが CS2以降ではダメ
//		try{myDestFolder=targetObject.layerSets.getByName(dstFolderName);}catch(e){myDestFolder=targetObject.layerSets.add(dstFolderName);}
//		dstFolderName=prompt("dstFolderName",dstFolderName);
var folderExists=false;
for(var ids=0;ids<targetObject.layerSets.length;ids++){
	if(dstFolderName==targetObject.layerSets[ids].name){folderExists=true;break;}
}
if(folderExists){
	myDestFolder=targetObject.layerSets.getByName(dstFolderName);
}else{
	myDestFolder=targetObject.layerSets.add();//新セット作って名前をつけないとダメっぽい
	myDestFolder.name=dstFolderName;//怒るよもう!
}
//	アクションフラグが0以外なら複製
//	0ならば、ターゲット自身を移動
//	dstLayerName=prompt(targetLayer.name + " to targetLayerName?",dstLayerName);
		if(! actionFlag){
			newLayer=targetLayer.duplicate(myDestFolder,ElementPlacement.INSIDE);
			newLayer.name=dstLayerName;
		}else{
			targetLayer.move(myDestFolder,ElementPlacement.INSIDE);
			targetLayer.name=dstLayerName;
		}

//	リネーム
	}
//フォルダ内のレイヤーを逆順（下側から順で）ソート
for(var idf=0;idf<targetObject.layerSets.length;idf++){
	layerSort(targetObject.layerSets[idf].layers);
}
//ターゲットドキュメントのレイヤセット順序をシートに合わせてソート
	for (var six=0;six<XPS.layers.length;six++){
		targetObject.layerSets.getByName(XPS.layers[six].name).move(targetObject,ElementPlacement.PLACEATBEGINNING);
	}
//	layerSort(targetObject.layers);
/*
//背景レイヤを最も下へ
for(var idf=0;idf<targetObject.layerSets.length;idf++){
	if(targetObject.layerSets[idf].name.match(/BG/i)){
		targetObject.layerSets[idf].move(targetObject,ElementPlacement.PLACEATEND);
	}
}
//ブックレイヤがあれば最も上へ
for(var idf=0;idf<targetObject.layerSets.length;idf++){
	if(targetObject.layerSets[idf].name.match(/BOOK/i)){
		targetObject.layerSets[idf].move(targetObject,ElementPlacement.PLACEATBEGINNING);
	}
}
//レイアウトがあればさらに上へ
for(var idf=0;idf<targetObject.layerSets.length;idf++){
	if(targetObject.layerSets[idf].name.match(/L\/?O|レイアウト|layout|All/i)){
		targetObject.layerSets[idf].move(targetObject,ElementPlacement.PLACEATBEGINNING);
	}
}
 */
//csvデータのセリフ欄は削除するので、セリフレイヤセットがあれば必ず最上位へ
//又は合わせて削除
var removeSets=[];
for(var idf=0;idf<targetObject.layerSets.length;idf++){
	if(targetObject.layerSets[idf].name.match(/_dialog(\d*)_/i)){
//		targetObject.layerSets[idf].move(targetObject,ElementPlacement.PLACEATBEGINNING);
		removeSets.push(targetObject.layerSets[idf]);
	}
}
for(var sidx=0;sidx<removeSets.length;sidx++){
	removeSets[sidx].remove();
}

//レイヤセットは通過ではなく通常にしておくこと?(スイッチつけよう)
for(var idf=0;idf<targetObject.layerSets.length;idf++){
	targetObject.layerSets[idf].blendMode=BlendMode.NORMAL;
}
/*TVPaintは、出力が全て72dpiなので解像度を指定解像度へ変更				*/
	var myDpi=(myResolution.match("dpc"))?parseFloat(myResolution)*2.54:parseFloat(myResolution);
	app.activeDocument.resizeImage(undefined,undefined,myDpi,ResampleMethod.NONE)
/*指定サイズが必要ならばリサイズ
	app.activeDocument.resizeCanvas(new UnitValue("297mm"),new UnitValue("185mm"));
	app.activeDocument.resizeCanvas(new UnitValue("297mm"),new UnitValue("210mm"),AnchorPosition.BOTTOMCENTER);
*/
/* アニメーションモードがタイムラインならフレームモードに変換　ループを無限に */
if (nas.axeAFC.checkAnimationMode()!="frameAnimation"){
//==アニメフレーム作成
var idmakeFrameAnimation = stringIDToTypeID( "makeFrameAnimation" );
executeAction( idmakeFrameAnimation, undefined, DialogModes.NO );
//==再生モードを無限ループへ
    var descObj = new ActionDescriptor();
        var refLoop = new ActionReference();
        refLoop.putEnumerated( stringIDToTypeID( "animationClass" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
    descObj.putReference( charIDToTypeID( "null" ), refLoop );
        var descLoop = new ActionDescriptor();
        descLoop.putEnumerated( stringIDToTypeID( "animationLoopEnum" ), stringIDToTypeID( "animationLoopType" ), stringIDToTypeID( "animationLoopForever" ) );
    descObj.putObject( charIDToTypeID( "T   " ), stringIDToTypeID( "animationClass" ), descLoop );
executeAction( charIDToTypeID( "setd" ), descObj, DialogModes.NO );

}
//終了
return true;
}
//=============== XPSからレイヤ名とフレームでエントリ名を取得
var XPS=new Xps();
XPS.getName=function(myName,frameOffset){
	if(typeof frameOffset=="undefined")frameOffset=0;
	myName = myName.split("-");
	myFrame= parseInt(myName[1])-frameOffset;
	var lyr=1;
	for(var l=0;l<this.layers.length;l++){if(this.layers[l].name==myName[0]){lyr=l+1;break;}};
	return [myName[0],this.xpsBody[lyr][myFrame]].join("-");
}
XPS.cut=TargetDocument.name;
/*================================================================================= main */
//ターゲットCSV読み出し
	myTargetCSV.encoding="UTF-8";//決め打ちで
	myTargetCSV.open("r");
	myCSVContent=myTargetCSV.read();
	myTargetCSV.close();

	XPS.parseXps(TVP2XPS(myCSVContent));
//XPSを前処理
//第一フレームが空白のタイムラインに"X(カラ)"を補う
//参考レイヤーだった場合も強制的にカラ
if(hideLayers.length){
	var refRegex=new RegExp("^"+hideLayers.join("|")+"$","i")
}else{
	var refRegex=new RegExp("")
}
	for (var tix=0;tix<XPS.layers.length;tix++){
		if((XPS.timeline(tix+1)[0]=="")||(XPS.layers[tix].name.match(refRegex))) XPS.timeline(tix+1)[0]="X";
		//変換XPSなのでtiming以外のタイムラインがないので簡易判定で済ませる。
	}
/*タイムライン中に
	"_dialog\b*_"のラベルを持つタイムラインがあったら、セリフを作成して本体シートからトラックを削除する
	"修正指定子付き"のラベルを持つタイムラインは無条件で削除

　　これはオブジェクトメソッドで実装
*/
	var removeTracks=[];
	for (var tix=0;tix<XPS.layers.length;tix++){
	  if(XPS.layers[tix].name.match(/_dialog(\d*)_/i)){
			var newDialogTL= new XpsTimelineTrack("台詞","dialog");
			var trackNo=(RegExp.$1)?parseInt(RegExp.$1):1;
			var currentSection=(XPS.xpsBody[tix+1][0]=="")?newDialogTL.addSection(false):false;
			for (var fix=0;fix<XPS.xpsBody[0].length;fix++){
				if(currentSection) currentSection.duration++;
				if(XPS.xpsBody[tix+1][fix]=="") {continue;}
				if(XPS.xpsBody[tix+1][fix].match(/[Xx0]/)){
					currentSection=newDialogTL.addSection(false)
				}else{
					var newDlg=new nas.AnimationSound(XPS.xpsBody[tix+1][fix]);//カラ以外のエントリはサウンドオブジェクト
					newDlg.parseContent();//コンテントからプロパテイを更新
					currentSection=newDialogTL.addSection(newDlg);
				}
			}
			//削除トラックを積む
			removeTracks.push(tix+1);
			//サウンドオブジェクトからタイムラインに変換
			if(trackNo==1){
				var targetTrack=XPS.xpsBody[0];
			}else{
				var targetTrack=XPS.intertTL(-1,new XpsLayer("N"+trackNo,"dialog"));
			}
			var myStreamArray=[];//要素配列で
			for(var sx=0;sx<newDialogTL.sections.length;sx++){
				if(newDialogTL.sections[sx].value){
					//音声区間
						myStreamArray=myStreamArray.concat(newDialogTL.sections[sx].value.toStream("body",newDialogTL.sections[sx].duration));
					}else{
					//無音区間
						var headerNode=0;
						if((sx>0)&&(newDialogTL.sections[sx-1].value)){
							myStreamArray.push("----");//先行区間閉鎖ノードセパレータ置換
							headerNode=1;
						}
						if((sx<(newDialogTL.sections.length-1))&&(newDialogTL.sections[sx+1].value)){
							//後方区間ラベルあり
							myLabels=newDialogTL.sections[sx+1].value.toStream("header");//開始ノード付きラベル要素
							myStreamArray=myStreamArray.concat(new Array(newDialogTL.sections[sx].duration-myLabels.length-headerNode),myLabels);
						}else{
							//後方区間ラベルなし
							myStreamArray=myStreamArray.concat(new Array(newDialogTL.sections[sx].duration-headerNode));
						}
					}
			}
				XPS.put([targetTrack.index,0],myStreamArray); //書き込み
		}else
/*		 if(XPS.layers[tix].name.match(revRegex)){removeTracks.push(tix+1);};*/
	}
	XPS.deleteTL(removeTracks);// まとめて削除（削除操作でIDが変わるので注意）
/*
	無音区間のdurationが区間外表記の要素数を下回る場合の処理は以下の手順で行う
	開始区間で継続長が０の場合　トラックラベルを音声ラベルとして使用　トラックプロパティにmemoを加えて配列をコンマ区切りストリームで格納する　セパレータは省略
	同　開始区間で継続長が１以上必要数未満の場合　セパレータを優先して表示　それ以外は上記に準ずる

	トラック開始区間以外の場合
	継続長がラベル長以下になることは認められない。無音区間はガードバンドとして最低１フレーム以上のフレーム数が要求される。
	無音区間のラベル長は以下のように求められる。
	先行区間の音声を閉じるために１フレームのセパレータを要する
	後方区間の音声を開始するために１フレームのセパレータを要する
	後方区間にラベルとプロパティを与えるために必要数のフレームが要求される
	後方区間の音声ラベルが先行区間と一致している場合のみ後方区間のラベルを省略することが可能である
	プロパティを持たずラベルが省略可能な場合に限り　音声終了マーカーが開始マーカーを兼ねることが出来る
	
	この「継続長１フレームの無音区間」の場合、セパレータのみが無音区間に表示される
	
*/

//ファイル名からタイトルと話数等を転記
var ttls=parseFileName(app.activeDocument.name)//
XPS.title	=myTitles[ttls[3]];
XPS.opus	=ttls[2];
XPS.scene	=ttls[1];
XPS.cut	=ttls[0];

//タイムライン整形
	var saveXPS=new Xps();
	saveXPS.readIN(XPS.toString());
for (var lix=1;lix<XPS.layers.length;lix++){
    var formatedValue=_reformatTL(lix);
	saveXPS.xpsBody[lix]=formatedValue.split(",");
}

//XPSへコンバート
//同名で保存
var myTargetXps=new File((app.activeDocument.path.fullName+"/"+ app.activeDocument.name).replace(/psd$/i,"xps"));
	myTargetXps.encoding="UTF-8";
	myTargetXps.open("w");
	myTargetXps.write(saveXPS.toString());//警告無しで上書きしてる　今回は警告はしない
	myTargetXps.close();
//	alert(XPS.toString())

//undo付きでレイヤを分類
var myUndo=nas.localize(nas.uiMsg.layerClassify);//"レイヤ仕分け"
var myAction="removeInterpLayers(TargetDocument.layers);removeDuplicatedLayers(TargetDocument.layers);classify(TargetDocument)";
if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
//修正トラックの確認と再処理を確認ダイアログ付きで実行
if(confirm("修正レイヤートラック整理を行いますか？")){
//XPSから を保存時点のXPSに入替え
	XPS=saveXPS;
//削除可能な修正トラックを削除キューに積む
	removeTracks=new Array();//削除キューをリセット;
	for(var tix=0;tix<XPS.layers.length;tix++){if(XPS.layers[tix].name.match(revRegex)){removeTracks.push(XPS.layers[tix].name);}}
/**	削除キュー内のレイヤーをリネームして移動 レイヤセット名配列渡し
*/
	function moveAndRemove(myTargets){
		for (var lsid=0;lsid<myTargets.length;lsid++){
            var check=myTargets[lsid].match(revRegex);
			if(check){
				var myPostFix=check[0];
				var srcFolderName=myTargets[lsid];
				var dstFolderName=myTargets[lsid].replace(revRegex,"");
//				alert(myPostFix+":"+srcFolderName+":"+dstFolderName);
			}else{continue;}
			var targetSet=false;
			try{targetSet=app.activeDocument.layers.getByName(srcFolderName);}catch(err){continue;};
			var dstFolder=false;
			try{dstFolder=app.activeDocument.layers.getByName(dstFolderName);}catch(err){continue;};
			var moveTarget=[];
			for(var lix=0;lix<targetSet.layers.length;lix++){moveTarget.push(targetSet.layers[lix]);}
			for(var lix=0;lix<moveTarget.length;lix++){
				var targetLayer=moveTarget[lix];
				targetLayer.name=[dstFolderName,targetLayer.name.split("-")[1]+myPostFix].join("-");
				targetLayer.move(dstFolder,ElementPlacement.INSIDE);
			}
			targetSet.remove();
			layerSort(dstFolder.layers);
		}
	}
	myAction="";//リセット
	myAction+="moveAndRemove(['";
	for(var trId=0;trId<removeTracks.length;trId++){
		if(trId>0){	myAction+=removeTracks[trId].name+",'";};
		myAction+=removeTracks[trId]+"'";
	};
	myAction+="]);";
		XPS.deleteTL(removeTracks);// まとめて削除（削除操作でIDが変わるので注意）
//上書き保存
var myTargetXps=new File((app.activeDocument.path.fullName+"/"+ app.activeDocument.name).replace(/psd$/i,"xps"));
	myTargetXps.encoding="UTF-8";
	myTargetXps.open("w");
	myTargetXps.write(XPS.toString());//警告無しで上書きしてる　今回は警告はしない
	myTargetXps.close();
//undo付きでトラック整理
var myUndo="トラック整理";//nas.localize(nas.uiMsg.layerClassify);//"レイヤ仕分け"
if(app.activeDocument.suspendHistory){app.activeDocument.suspendHistory(myUndo,myAction)}else{evel(myAction)}
}
//初回のシート適用を行う（確認ダイアログ付き）
if(confirm("applyXPS ?\n　現在のシートを適用しますか？")){
	$.evalFile(Folder.userData.fullName+"/nas/scripts/axe/applyXps.jsx");
}
//レイヤセットごとにレイヤ名を変更 参照するのは変換後のXPS
//レイヤーセット内のレイヤーに対してループをかける（フレームごとよりも早そう？）
//レイヤー名規則は　「グループ名 - フレームナンバー」オリジネーションを出し
//シート上の番号を取得して変更名称を組む
//変更後の同名レイヤが存在するレイヤは削除

}
