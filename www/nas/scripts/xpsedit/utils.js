/*	りまぴん・ユーティリティー関数群	*/
/*						*/
/*						*/
/*						*/
/*						*/
/*					-------getSample.js
	サンプルデータ取得用プロシジャ(ajaxお試し)
	prototype.js 置き換え 2013.02.10
	Chrome はローカルファイルだと弾かれる。
	File API 版を作ること
	なんだかprototypeよりもjQueryのほうがイロイロ楽なので
	更にjQueryに置き換えてみる。2013.02.24
 */
var mySample="";
var myAjax=new Object();
function getSample(Number){
	var url="./template/blank.txt";
	switch(Number){
case	0:url="./template/timeSheet_eps.txt";break;
case	9:url="./sample/encoded/sample9.txt";break;
case	8:url="./sample/encoded/sample8.txt";break;
case	7:url="./sample/encoded/sample7.txt";break;
case	6:url="./sample/encoded/sample6.txt";break;
case	5:url="./sample/encoded/sample5.txt";break;
case	4:url="./sample/encoded/sample4.txt";break;
case	3:url="./sample/encoded/sample3.txt";break;
case	2:url="./sample/encoded/sample2.txt";break;
case	1:url="./sample/encoded/sample1.txt";break;
	default:url="./sample/encoded/sample1.txt";
	}
	myAjax= jQuery.ajax({
		type    :"GET",
		 url    : url ,
		dataType:"text",
		success : putSample
	});
//	jQuery("data_well").load(url);
//		error :putSample

};
function putSample(request , stts ,oth){
//	if(oth){alert(oth);alert(stts);alert(request);}
//	confirm("stop");
//	if(!request){request=myAjax};
//	var myContent= request.transport.responseText;
	var myContent= request;
//	if(true){request=myAjax}
	xUI.data_well.value=decodeURI(myContent);
//xUI.data_well.value=myContent;
};

/**
 フットスタンプクリア
 */
clearFS=function(){
	if(xUI.footMark){xUI.footstampClear()};
};
//タイムライン消去
clearTL=function(flg){
	var bkPos=xUI.Select.join("_");//現在のカーソルを記録
//フラグによる指定があった場合タイムラインの選択状態を調整する
switch(flg){
case	"all"	:xUI.selectCell("0_"+xUI.Select[1]);xUI.selection((xUI.XPS.xpsTracks.length-1)+"_"+xUI.Select[1]);break;
case	"left"	:xUI.selection("0_"+xUI.Select[1]);break;
case	"right"	:xUI.selection((xUI.XPS.xpsTracks.length-1)+"_"+xUI.Select[1]);break;
};
//消去対象を選択状態から取得
	var minID=(xUI.Selection[0]<0)?xUI.Select[0]+xUI.Selection[0] : xUI.Select[0];
	var maxID=(xUI.Selection[0]<0)?xUI.Select[0]+1 : xUI.Select[0]+xUI.Selection[0]+1;

	for(tId=minID;tId<maxID;tId++){
		xUI.selectCell(tId+"_0");//冒頭データに移動
		xUI.selection(tId+"_"+(xUI.XPS.duration()-1));//タイムライン末尾を選択
		xUI.cut();	//削除
//		if (xUI.edchg){xUI.sheetPut(this.eddt);}//更新
		if(xUI.getid("Selection")!="0_0") {xUI.selection();xUI.spinHi();};
//		選択範囲解除
		if(xUI.Focus) {xUI.focusCell();};
	};
	xUI.selectCell(bkPos);	//バックアップ位置へ復帰
	document.getElementById("iNputbOx").focus();
};
/**
 *description	タイムライン整形
	タイムラインを標準シート表記にリフォーマットします。
	標準シート表記は以下のとおり
timing
-タイムシートセルには、そのフレームで使用する動画番号を記述する
-同じ動画番号が連続して記述される場合は動画番号を重複記述しないで縦線をひいて省略すること。
-動画を使用しないシートセルには「×」印を打って「カラセル」である事を明示すること。
-カラセルが連続する場合は波線(;)で連続を表記すること。
-2コマおよび3コマ連続して同じ動画番号またはカラセルを指定する場合は、記述の簡略化と読みやすさの為、連続の縦線または波線自体を省略すること。
-空白コマおよび縦線で同要素の省略をしたシートセルは、動画入れ替えと紛らわしくない場合に限り注釈を書き込むことが出来る。
-原画番号は可能な限り丸囲い(または同等の強調表示)をする。
-数字の1は縦棒線と紛らわしいので原画番号でなくとも丸囲い（または相当する強調表示）をする。
2015拡張

次回フォーマットでは
-機種依存文字の制限を緩和する。少なくとも丸囲い文字を開放①～㊿をサポート 切り替えは付ける
-動画番号は数値を主体とするテキスト数字は全角半角を区別しないフィールドセパレータとレコードセパレータを含むことはできない
-区間連続の記号は、グラフィックパーツに置きかえられる

dialog
-台詞は、ダイアログ開始マーカと終了マーカーの間に置かれる
-ダイアログ開始マーカーはダイアログ開始前のフレームに置き、ダイアログ終了マーカーはダイアログ区間の後方フレームに置かれる。
-テキスト表現のマーカーは。「カギカッコ」"引用符" 又は [-|_] 3個以上の連続とする。シート上の表記は、これらを横線に置き換える。
-ダイアログ内の注釈データは(丸括弧)でエスケープされる
-マーカー外の記述は、すべて注釈である
-マーカー内の記述は、注釈以外は一連の内容テキストとして配置される。空白及びヌル文字は取り除かれる。

camera
画像ピクセルを持たずジオメトリを持つトラックがこれに相当する カメラワーク／セルワークがこれにあたる
-以下の有効記述がある
	-登録されたキーフレーム（値を持つ）角括弧による指定がない場合はこれを補う
	-[角括弧]でキーフレーム指定が行われた記述 MAPにエントリーがない場合は、入力を促す
	-区間開始マーカー(ダイアログマーカーと異なり区間内に含まれる) ▼▽（慣例的に逆三角が標準）中間値生成ノードを兼ねる
	-区間終了マーカー(ダイアログマーカーと異なり区間内に含まれる) ▲△ 中間値生成ノードを兼ねない場合がある
	-中間値生成記述 |(バーチカルバー) ・（中黒）-(ハイフン)
		中間値生成区間内では、区間終了マーカー以外の有効記述が補間値生成マーカーとして働く
		終了マーカーは、ケースによって中間値生成ノードを兼ねない
-有効記述以外はすべて注釈でありデータ解析上の意味は前方データの継承。
	一部後方参照が行われる。
	具体的には、開始時点の暗黙の初期値がこれに当たる
	第一フレームが値を持たない場合、値の保留が発生して最初に現れたエントリから値を継承する。
	値を持たない有効記述が最初に現れた場合は、初期値（デフォルトのジオメトリ）が適用されるものとする
	効果区間が連続する場合は、その開始マーカーに対して値の保留が発生する。
	終了マーカーの直後の有効値記述は開始マーカーを兼ねることが可能である。
-データ成形上は、区間開始マーカーと終了マーカーの間に何も記述がない場合、その区間全体に同一値の補間を行う
	区間の補間方法（タイミング指定）は別インターフェースで行う。
	記録はXPSでなくMAPエントリに対して行われる（MAP対応必須）
	有効値は、値とともにタイミングを保持する

effect
ジオメトリを持たないプロパティがこれに相当する フェード・中OL（二重フェード）・透過光・レイヤートレーラーの合成モードなどがこれにあたる
-以下の有効記述がある
	-登録されたキーフレーム（値を持つ）矢括弧による指定がない場合はこれを補う
	-<矢括弧>でキー値指定が行われた記述 MAPにエントリーがない場合は、入力を促す
	-区間開始マーカー(ダイアログマーカーと異なり区間内に含まれる) （慣例的に何種かの記号を標準に定める）
	-区間終了マーカー(ダイアログマーカーと異なり区間内に含まれる) 開始記号と同一の記号で閉じる
	-補間値生成マーカー |(バーチカルバー) ・（中黒）-(ハイフン)
		中間値生成区間内では、区間終了マーカー以外の有効記述が補間値生成マーカーとして働く
		終了マーカーは、ケースによって中間値生成ノードを兼ねない
-有効記述以外はすべて注釈でありデータ解析上の意味は前方データの継承。
	一部後方参照が行われる。具体的には、開始時点の暗黙の初期値がこれに当たる
	第一フレームに値がない場合、値の保留が発生して最初に現れたエントリから値を継承する。
	値を持たない有効記述が最初に現れた場合、初めて初期値（デフォルトのジオメトリ）が適用されるものとする
-データ成形上は、区間開始マーカーと終了マーカーの間に記述がない場合、その区間全体に同一値の補間を行う
	区間の補間方法は別インターフェースで行う。記録はXPSでなくMAPエントリに対して行われる（MAP対応必須）
標準記号
]name[	逆角括弧で任意の文字列をトランジションエフェクトマーカーにする
)name(	逆括弧で任意の文字列をマーカーにする
▼	フェード・アウト
▲	フェード・イン



関数の動作(2016/06/5現在)
範囲指定があればその範囲内を
範囲指定が無い場合は、現在フォーカスのあるタイムラインを処理する
引数"all"がある場合は、範囲指定を解除してシート全体を処理

タイムライン種別を本格的に実装開始したので、フォーマッタはタイムライン種別を認識して動作を区分すること。
以下の動作は"timing"タイムラインに限定

 */

reformatTimeline=function(flg){

function reformatTLC(id,range){
//===camerawork===
//ターゲットタイムライン
	var myTargetBody=xUI.XPS.xpsTracks[id];//指定タイムラインのデータを配列参照
	var myDestTLBody=new Array();//編集用カラ配列
	var bufNoChange=new Array(); var bufModified=new Array();//編集バッファ
	var fix=true;//値固定（中間値生成ではない）区間か否かのフラグ 生成区間の未記入セルに中間値生成記号を補間する？
/*第一フレームが有効記述か否か確認
カメラワークトラックでは開始フレームが無効記述・区間開始ノードであった場合、
その値は初期値ではなく次に区間切り替えノードがあるか、有効値を持った記述があるまでは保留状態とする。
有効な値が与えられなかった場合初期値が効果を持つ。

1.意味のある値かまたは予約語の確認
	[角括弧]で指示された値がある（と思われる）エントリ、開始ノード、終了ノード、中間値生成ノード
2.その他の記述
	マップに問い合わせて有効な値か否かを確認
	有効記述ならば、[角括弧]を与える
	無効記述ならば、値はそのままにして配置
	区間(Section)により意味が変わる
		値固定区間(fixSection)ならば無効記述
		中間値生成区間(interpolationSection)ならば、中間値生成ノード

*/
	var referenceValue=(myTargetBody[0].match(/^(\[.+\]|[▽▼])$/))?RegExp.$1:"res";

	if(referenceValue=="res"){
		myDestTLBody.push(myTargetBody[0]);
	}else{
		if(myTargetBody[0].match(/^[▽▼]$/)){fix=false};
		myDestTLBody.push(myTargetBody[0]);
	};
//第二フレームからデータループ
	for(var fidx=1;fidx<myTargetBody.length;fidx++){
//	評価値取得
		var evValue=myTargetBody[fidx];

		bufNoChange.push(myTargetBody[fidx].replace(/^(x|0|〆|Ｘ|ｘ)$/i,"|"));//非加工バッファを作成
//	リファレンスと一致
		if((evValue=="")&&(! fix)){
			var modifiedData=(myTargetBody[fidx])?myTargetBody[fidx]:"|";
			if(modifiedData=="1"){modifiedData="(1)"};//これ一括調整関数がほしい
			if((referenceValue=="blank")&&(modifiedData=="|")){
				modifiedData=":";//置き替え
			};
			bufModified.push(modifiedData);
//	同値カウンタ加算
			sVC++;
		}else{
			var modifiedData=myTargetBody[fidx];
			if(modifiedData=="1"){
				modifiedData="(1)";
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
	
function reformatTL(id,range){
//===timing/replacement===
/*
	置きかえタイムラインの整形
	すでに書き込みのあるセルは、メモの可能性があるのでそのまま利用する。
	未記入のセルのみが編集対象
	タイムラインの整合性判断のため暫定的だが、タイムライン全長で処理を行い
	レンジでクリップしてリザルトを返す
*/
//引数 rangeは配列[開始フレーム,終了フレーム]  指定がない場合は全尺
	if(typeof range == "undefined") range=[0,xUI.XPS.xpsTracks[0].length];
//ターゲットタイムライン
	var myTargetBody=xUI.XPS.xpsTracks[id];//指定タイムラインのバルクデータを配列で参照
	var myDestTLBody=new Array();//編集用カラ配列
	var bufNoChange=new Array(); var bufModified=new Array();//編集バッファ
	var sVC=0;//同値カウンタ
	var myLimit=5;//5kまでは縦線省略 6kから(暫定措置)これはプリファレンスへ移動か？
//第一フレームが有効記述か否か確認(id=0は、事前チェックで入らないはず)
	var referenceValue=(dataCheck(myTargetBody[0],xUI.XPS.xpsTracks[id].id)==null)?"blank":dataCheck(myTargetBody[0],xUI.XPS.xpsTracks[id].id);

	if(referenceValue=="blank"){
		myDestTLBody.push("X");
	}else{
		if(myTargetBody[0]=="1"){myTargetBody[0]="(1)"};//これは一括調整がほしい
		myDestTLBody.push(myTargetBody[0]);
	};
	sVC=1;
//第二フレームからデータループ
	for(var fidx=1;fidx<myTargetBody.length;fidx++){
//	評価値取得
		var evValue=(dataCheck(myTargetBody[fidx],xUI.XPS.xpsTracks[id].id)==null)?referenceValue:dataCheck(myTargetBody[fidx],xUI.XPS.xpsTracks[id].id);

		if(myTargetBody[fidx]=="1"){myTargetBody[fidx]="(1)"};//これは一括調整がほしい

		bufNoChange.push(myTargetBody[fidx].replace(/^(x|0|〆|Ｘ|ｘ)$/i,"X"));//非加工バッファを作成
//	リファレンスと一致
		if((evValue==referenceValue)&&(evValue!="interp")){
			var modifiedData=(myTargetBody[fidx])?myTargetBody[fidx]:"|";
			if(modifiedData=="1"){modifiedData="(1)"};//これ一括調整関数がほしい
			if((referenceValue=="blank")&&(modifiedData=="|")){
				modifiedData=":";//置き替え
			};
			bufModified.push(modifiedData);
//	同値カウンタ加算
			sVC++;
		}else{
			var modifiedData=myTargetBody[fidx];
			if(modifiedData=="1"){
				modifiedData="(1)";
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
	return myDestTLBody.slice(range[0],range[1]+1).join();
};


//分岐と処理
	var bkPos=xUI.Select.join("_");//カーソル位置保存

if(flg=="all"){
//全シート指定
	for(var idx=0;idx<(xUI.XPS.xpsTracks.length-1);idx++){

		xUI.selectCell((idx)+"_0")//カーソルを当該タイムラインの第一フレームへ
	 var myOpt=(idx==0)? "dialog":xUI.XPS.xpsTracks[idx].option;
	 switch(myOpt){
	 case "dialog": ;break;
	 case "still": ;break;
	 case "sfx": ;break;
	 case "camera": ;break;
	 case "timing":
	 default:
//alert(reformatTL(idx));
 xUI.sheetPut(reformatTL(idx));
// alert(idx+":"+myOpt);
	 }
	};
}else{
//セレクションがない場合は当該タイムラインを1列処理
  if(xUI.Selection.join()=="0,0"){
	if((! flg) && (xUI.Select[0]>=1 && xUI.Select[0]<(xUI.XPS.xpsTracks.length-1))){
		xUI.selectCell(xUI.Select[0]+"_0")//カーソルを当該タイムラインの第一フレームへ
	if(xUI.Select[0]>0){var myOpt=xUI.XPS.xpsTracks[xUI.Select[0]].option}else{var myOpt="dialog"};
	 switch(myOpt){
	 case "dialog": ;break;
	 case "still": ;break;
	 case "sfx": ;break;
	 case "camera": ;break;
	 case "timing":
	 default:
		xUI.sheetPut(reformatTL(xUI.Select[0]));//データ更新
	 }
	};
	xUI.selectCell(bkPos);	//バックアップ位置へ復帰
  }else{
	var currentSelection=add(xUI.Select,xUI.Selection);//保存
	var myRange=xUI.actionRange();//
	var myStream=[];
	for(var ix=myRange[0][0];ix<=myRange[1][0];ix++){
			if(ix>=xUI.XPS.xpsTracks.length-1) break;	
			if(ix>0){var myOpt=xUI.XPS.xpsTracks[ix].option}else{var myOpt="dialog"};
			switch(myOpt){
				case "dialog":
				case "still":
				case "sfx":
				case "camera":
					myStream.push(xUI.XPS.xpsTracks[ix].slice(myRange[0][1],myRange[1][1]));
				break;
				case "timing":
				default:
					myStream.push(reformatTL(ix,[myRange[0][1],myRange[1][1]]));//データ更新
			}		
	}	
	xUI.selection();//範囲クリア
	xUI.selectCell(myRange[0])//カーソルを当該選択範囲の左上へ
	xUI.sheetPut(myStream.join("\n")); 
	xUI.selectCell(bkPos);	//バックアップ位置へ復帰
	xUI.selection(currentSelection);	//選択状態の復帰
  }
};
	document.getElementById("iNputbOx").focus();
};
/*	simplifyTimeline(フラグ)
 *引数：キーワード"all"
タイムシートの記述をデータ評価して最低限の記述に単純化する
この表記はユーザには読みにくいが機械の解釈には問題がない。
演出家が変更をする際などのクリンアップとしても使用できる
選択範囲があればそれを見る
引数にキーワード"all"を与えるとシートの選択状態に関係なくタイムシート全体に対する単純化を行う
 *	
 *	
 *	
 */
simplifyTimeline=function(flg){
function simplifyTL(id,range){
//===timing===
//単純化を行うのは現在はタイミング（置きかえ）タイムライントラックのみ
//ターゲットタイムライン
	var myTargetBody=xUI.XPS.xpsTracks[id];//指定タイムラインのバルクデータを配列で参照
	if(typeof range=="undefined")range=[0,xUI.XPS.xpsTracks[id].length];
	var myDestTLBody=new Array();//編集用カラ配列
//全フレームデータループ
	for(var fidx=range[0];fidx<=range[1];fidx++){
//	評価値取得
		var evValue=dataCheck(myTargetBody[fidx],xUI.XPS.xpsTracks[id].id);

		switch(evValue){
		case "blank":
			myDestTLBody.push("X");				
		break;
		case "null":
			myDestTLBody.push("");
		break;
		case "interp":
			myDestTLBody.push(myTargetBody[fidx]);
		break;
		default:
			myDestTLBody.push(evValue);
		}
	};
	return myDestTLBody.join();
};
//置きかえストリーム
	var myStream=[];
//分岐と処理
	var bkPos=xUI.Select.join("_");//カーソル位置保存
if(flg=="all"){
//現在の選択状態を記録してクリア
	var currentSelection=add(xUI.Select,xUI.Selection);
	xUI.selection();
//全シート指定(メモトラックは処理しない)
	for(var idx=0;idx<(xUI.XPS.xpsTracks.length-1);idx++){
	 var myOpt=(idx==0)? "dialog":xUI.XPS.xpsTracks[idx].option;
	 switch(myOpt){
	 case "dialog":
	 case "still":
	 case "sfx":
	 case "camera":
	 	myStream.push(xUI.XPS.xpsTracks[idx].join());
	 break;
	 case "timing":
	 default:
	 	myStream.push(simplifyTL(idx));
	 }
	}
	xUI.selectCell([0,0])//カーソルを当該タイムラインの第一フレームへ
	xUI.sheetPut(myStream.join("\n"));

//カーソルと選択状態を復帰
	xUI.selectCell(bkPos);	//バックアップ位置へ復帰
	xUI.selection(currentSelection);	//選択状態の復帰
}else{
	var currentSelection=add(xUI.Select,xUI.Selection);//保存
//範囲指定がなければ現在のタイムラインを処理 あれば範囲内を処理＝入替えストリームをビルドしてput
	if(xUI.Selection.join()=="0,0"){
		xUI.selection();//範囲クリア
		if((! flg) && (xUI.Select[0]>=1 && xUI.Select[0]<(xUI.XPS.xpsTracks.length-1))){
			xUI.selectCell(xUI.Select[0]+"_0")//カーソルを当該タイムラインの第一フレームへ
			if(xUI.Select[0]>0){var myOpt=xUI.XPS.xpsTracks[xUI.Select[0]].option}else{var myOpt="dialog"};
		 	switch(myOpt){
		  		case "dialog":
		  		case "still":
		  		case "sfx":
		  		case "camera":
		  		break;
		  		case "timing":
		  		default:
			 		xUI.sheetPut(simplifyTL(xUI.Select[0]));//データ更新
		 	}
	 	};
		xUI.selectCell(bkPos);	//バックアップ位置へ復帰
	}else{
		var myRange=xUI.actionRange();//
		for(var ix=myRange[0][0];ix<=myRange[1][0];ix++){
			if(ix>=xUI.XPS.xpsTracks.length-1) {break;}	
			if(ix>0){var myOpt=xUI.XPS.xpsTracks[ix].option}else{var myOpt="dialog"};
			switch(myOpt){
				case "dialog":
				case "still":
				case "sfx":
				case "camera":
					myStream.push(xUI.XPS.xpsTracks[ix].slice(myRange[0][1],myRange[1][1]));
				break;
				case "timing":
				default:
					myStream.push(simplifyTL(ix,[myRange[0][1],myRange[1][1]]));//データ更新
			}
		}
		xUI.selection();//範囲クリア
		xUI.selectCell(myRange[0]);//カーソルを当該選択範囲の左上へ
		xUI.sheetPut(myStream.join("\n"));
		xUI.selectCell(bkPos);//バックアップ位置へ復帰
		xUI.selection(currentSelection);	//選択状態の復帰
	}
};
	document.getElementById("iNputbOx").focus();
};
//simplifyTimeline("all")

vxPrompt= function(msg,params){return prompt(msg,params);};

//タイムライン追加
/**
 *	現在アクティブなタイムラインの右側にタイムラインを１つだけ追加する
 *	以下の手順のもとにラベルは引数指定または自動生成
 *	コマンドには、確認等の手順はなし
 *	既存のタイムラインラベルは変更されない
 *	ユーザは必要ならば挿入後にリネーム
 *　@params {String} kind
 *		挿入するトラックのタイプ dialog|sound|still|timing|camera|effect|geometry
 *	@params {String} trackName
 *		挿入するトラックのラベル　任意
 */
/*
 	UNDO拡張に伴って変更 2015.09.14

addTimeline(kind,label)
	kind はタイムライン種別
	dialog,sound,still,timing,replacement,camera,effect いずれか
	label はタイムラインラベル
	指定がない場合は以下の基準で命名
	ダイアログ	指定順に N2 N3 N4 ～ナンバリング
	タイミング	右端追加の場合のみABC順で次のラベル
			それ以外の場合は現在のタイムラインラベルに数字を加算
	カメラ/エフェクト	挿入後のタイムラインID 3番タイムラインでの指定時には必ず"04"
*/
addTimeline=function(myOpt,trackName){
	var trackPrefix = {'dialog':'N','still':'BOOK','camera':'cam','effect':'ex','geometry':'stg','sound':'S'}
	if(xUI.Select[0]>xUI.XPS.xpsTracks.length-2){return false;};//コメントの右側へは挿入不可
	var insertPoint=[xUI.Select[0]+1,xUI.Select[1]];//挿入ポイントを作成
	if(!myOpt){myOpt="timing"};
	if(!trackName){
		switch(myOpt){
case	"timing":
			var currentLabels=[];
		//タイミングラベルの最大を検出して次の文字をピックアップ 
			for (var pIdx = 0; pIdx < xUI.XPS.xpsTracks.length;pIdx++){
				if (xUI.XPS.xpsTracks[pIdx].option == "timing") currentLabels.push(xUI.XPS.xpsTracks[pIdx].id.charAt(0));
			}
			currentName=currentLabels.sort()[currentLabels.length-1];
			trackName= ("ABCDEFGHIJKLMNOPQRSTUVWXYZ").charAt((("ABCDEFGHIJKLMNOPQRSTUVWXYZ").indexOf(currentName)+1)%26);
break;
case	"dialog":
case	"stage":
case	"geometry":
case	"still":
case	"camera":
case	"effect":		//トラックを数えて数値でラベル名を作成
		var countTrack = 0;
		for (var pIdx = 0; pIdx < xUI.XPS.xpsTracks.length;pIdx++){if (xUI.XPS.xpsTracks[pIdx].option==myOpt) countTrack++;}
		trackName= trackPrefix[myOpt]+(countTrack +1);
break;
default	:	trackName=nas.Zf(insertPoint[0],2).toString();//挿入点のID 二桁文字列
		
		}
	}
console.log(trackName);
/*
	現在のXPSの複製を作り新しいタイムラインを作成して挿入位置に挿入
	putメソッドでドキュメントを入れ替える
 */
	var newXPS= new Xps();
	newXPS.readIN(xUI.XPS.toString());
	var currentDuration=newXPS.duration();
	newXPS.insertTL(insertPoint[0],new Xps.XpsTimelineTrack(trackName,myOpt,newXPS.xpsTracks,currentDuration));
	var X=xUI.sheetPut(newXPS);
	xUI.selectCell(insertPoint.join("_"));
}
//タイムライン挿入
/*
	指定IDの前方に挿入
	挿入するタイムラインはすべて"timing"
	挿入位置及び挿入数指定は、選択範囲を使用
	新規作成するタイムラインのラベルは自動作成したものを提示してユーザ編集
	挿入と削除はXpsオブジェクトのメソッドを呼ぶ形に変更
 */
insertColumns=function(newNames){
	var insertLength=Math.abs(xUI.Selection[0])+1;//挿入タイムライン数を取得
	var insertPoint=(xUI.Selection[0]<0)?[xUI.Select[0]+xUI.Selection[0],0]:[xUI.Select[0],0];//挿入ポイントを記録
if(typeof newNames == "undefined"){
	if(insertPoint[0]<1){return};

	var currentNames=new Array();//挿入後のラベル名格納配列
//	挿入分仮ラベルをタイムラインIDで初期化
	for(var Tidx=0;Tidx<insertLength;Tidx++){
		currentNames.push(nas.Zf(Tidx+insertPoint[0],2));
	};
//	警告
	nas.showModalDialog("prompt",
		"以下のタイムラインを挿入します。\n希望のラベルをコンマ区切りで指定できます。\n",
		"タイムライン挿入",
		currentNames.join(","),
		function(){if(this.status==0){insertColumns(this.value)};xUI.setStored("force");//sync();
		}
	)

}else{
//	xUI.printStatus();
if(newNames!=null){
	newNames=newNames.split(",");
	if(newNames.length>insertLength){newNames.length=insertLength;};//オーバー時切捨て
	if(newNames.length<insertLength){
		for(var Tidx=newNames.length;Tidx<insertLength;Tidx++){
			newNames.push(nas.Zf(Tidx+insertPoint[0],2));
		};
	};//不足時は再生成

	var bkPt=xUI.Select;//カーソル元位置控

	var newXPS=new Xps();
	newXPS.readIN(xUI.XPS.toString());
	newXPS.insertTL(insertPoint[0],newNames);//配列渡し
	xUI.sheetPut(newXPS);
//	nas_Rmp_Init();//リフレッシュ put側で実行される

	xUI.selectCell(add(bkPt,[insertLength,0]).join("_"));//カーソルを挿入後の元位置へ復帰
//	xUI.flushUndoBuf();sync("undo");//

}else{
	alert(localize(nas.uiMsg.aborted));//処理を中止しました
};
};
}
;//
//		タイムライン削除
/*
	指定IDのタイムラインを削除
	指定は、選択範囲を使用することに
	undoバッファは維持できないのでクリア
	Xpxのメソッドを呼び出す形に変更
	0番タイムライン及びフレームコメントは削除不可
 */
deleteColumns=function(newNames){
	if(xUI.Select[0]==0||xUI.Select[0]+xUI.Selection[0]<=0||xUI.Select[0]+xUI.Selection[0]>=(xUI.XPS.xpsTracks.length-1)||xUI.Select[0]==(xUI.XPS.xpsTracks.length-1))
	{return false;};
	var deleteLength=Math.abs(xUI.Selection[0])+1;//削除列数を算出
	if(deleteLength>=(xUI.XPS.xpsTracks.length-2)){return false;};
	var deletePoint=(xUI.Selection[0]<0)?[xUI.Select[0]+xUI.Selection[0],0]:[xUI.Select[0],0];//削除ポイントを記録

if(newNames==undefined){


	var restNames=new Array();//削除後のラベル名格納配列
//新規ラベルセット
	for(var Lidx=1; Lidx<xUI.XPS.xpsTracks.length - 1 ;Lidx++){
		if((Lidx<deletePoint[0]) || (Lidx >(deletePoint[0]+deleteLength-1)) ){restNames.push(xUI.XPS.xpsTracks[Lidx].id)};
	};

//	警告
nas.showModalDialog(
	"prompt",
	deleteLength+" 個のタイムラインが削除されて以下のタイムラインが残ります。\n必要ならばレイヤ名の編集ができます。\n",
	"タイムライン削除",
	restNames.join(","),
	function(){if(this.status==0){deleteColumns(this.value)};xUI.setStored("force");sync();}
);
//		alert(newNames);
}else{
if(newNames!=null){
	newNames=newNames.split(",");
	var bkPt=xUI.Select;//カーソル元位置
	var removeIdx=[];
	for (var ix=0;ix<deleteLength;ix++){removeIdx.push(ix+deletePoint[0]);}

	var newXPS=new Xps();
	newXPS.readIN(xUI.XPS.toString());
	newXPS.deleteTL(removeIdx); 
	xUI.sheetPut(newXPS);

	// タイムライン削除後にラベルの指定があれば書きなおし(ダイアログ拡張が考慮されていないでの後で修正)
//	for(var Lidx=0;Lidx<restNames.length;Lidx++){		if(xUI.XPS.xpsTracks[Lidx+1].id != restNames[Lidx]){xUI.XPS.xpsTracks[Lidx+1].id=restNames[Lidx]}	};

		sync("lbl");
//	nas_Rmp_Init();//リフレッシュ

	xUI.selectCell(bkPt.join("_"));//カーソルを元位置へ復帰
//	xUI.flushUndoBuf();sync("undo");//

}else{
	alert(localize(nas.uiMsg.aborted));//処理を中止しました
};
}

};
//フレームデータ挿入
/*
	指定フレームの位置に引数データを挿入
	引数がない場合はヤンクバッファを挿入
	空フレーム挿入時は相当の空データを作成してコール
	データ形式はストリーム
 */
insertBlock=function(myStream){
	if(typeof myStream == "undefined") myStream=xUI.yankBuf;
	if(myStream.length==0) return false;
//挿入データから操作配列を作成
	var myInsert=myStream.split('\n');
    var origPoint=xUI.Select;
     var myRange=xUI.Selection;
	;//選択範囲はクリアする
	xUI.selection();//クリア
	var myRight=origPoint[0]+myInsert.length-1;
	xUI.selection([(myRight<xUI.XPS.layers.length+1)?myRight:xUI.XPS.layers.length+1,xUI.XPS.duration()-1].join("_"));//末尾まで選択
	//ヤンクバッファを使わずにレンジ内のデータを取得する
	var myBuf=xUI.getRange().split('\n');
	//バッファ内のストリームを整形して上書き用のデータを作る
	for(var lineCount=0;lineCount<myBuf.length;lineCount++){
		myBuf[lineCount]=myInsert[lineCount]+','+myBuf[lineCount];
	}
	myBuf=myBuf.join('\n');
	xUI.sheetPut(myBuf);//整形データで上書き
	xUI.selectCell(origPoint.join("_"));//挿入ポイントへ戻る
	xUI.selection(add(origPoint,myRange).join("_"));//選択範囲を戻す？
};
//空フレームデータ挿入
/*
	選択範囲に空フレームを挿入
	削除も同様の処理で可能か？
 */
insertBlank=function(){
	;//選択範囲がなければ処理なし
  if(xUI.Selection[0]==0 && xUI.Selection[1]==0){return};
    var origPoint=xUI.Select;
     var myRange=xUI.Selection;
var myLeft=(myRange[0]<0)?origPoint[0]+myRange[0]:origPoint[0];
var myTop=(myRange[1]<0)?origPoint[1]+myRange[1]:origPoint[1];
	xUI.selectCell([myLeft,myTop].join("_"));//選択範囲左上方
	xUI.selection([myLeft+Math.abs(myRange[0]),xUI.XPS.duration()-1].join("_"));//末尾まで選択
	//ヤンクバッファを使わずにレンジ内のデータを取得する
	var myBuf=xUI.getRange().split('\n');
	//挿入分の空白データを作成
	var insertBlank=Array(Math.abs(myRange[1])+1).join(',');
	//バッファ内のストリームを整形して上書き用のデータを作る
	for(var lineCount=0;lineCount<myBuf.length;lineCount++){
		myBuf[lineCount]=insertBlank+','+myBuf[lineCount];
	}
	myBuf=myBuf.join('\n');
	xUI.sheetPut(myBuf);//整形データで上書き
	xUI.selectCell(origPoint.join("_"));//挿入ポイントへ戻る
	xUI.selection(add(origPoint,myRange).join("_"));//選択範囲を復帰
};
/*
	選択範囲を削除して隙間を詰める
*/
deleteBlank=function(){
	;//選択範囲がなければ処理なし
	if(xUI.Selection[0]==0 && xUI.Selection[1]==0){return};
	var origPoint=xUI.Select;
	var myRange=xUI.Selection;
	
var myLeft=(myRange[0]<0)?origPoint[0]+myRange[0]:origPoint[0];
var myTop=(myRange[1]<0)?origPoint[1]+myRange[1]:origPoint[1];

	if(Math.abs(myRange[1])+myTop<xUI.XPS.duration()){
		xUI.selectCell(add([myLeft,myTop],[0,Math.abs(myRange[1])+1]).join("_"));//新しいポイントへ移動
		xUI.selection([myLeft+Math.abs(myRange[0]),xUI.XPS.duration()-1].join("_"));//末尾まで選択
	//ヤンクバッファを使わずにレンジ内のデータを取得する
		var myBuf=xUI.getRange().split('\n');
	//レンジ分の空白データを作成
		var tailBlank=Array(Math.abs(myRange[1])+1).join(',');
	//バッファ内のストリームを整形して上書き用のデータを作る
	for(var lineCount=0;lineCount<myBuf.length;lineCount++){
		myBuf[lineCount]=myBuf[lineCount]+','+tailBlank;;
	}
	myBuf=myBuf.join('\n');
		xUI.selectCell([myLeft,myTop].join("_"));//挿入ポイントへ戻る
		xUI.selection();//クリア
		xUI.sheetPut(myBuf);
		xUI.selectCell([myLeft,myTop].join("_"));//挿入ポイントへ戻る
//		xUI.selection();//クリア
		xUI.selection(add(origPoint,myRange).join("_"));//選択戻す?
	};
};

/*
	セルラベルの付け替え
	タイムラインIDが与えられた場合は、そのタイムラインのみ
	引数なしの場合は、すべてのタイムラインのラベルを変更
	単独ラベルの場合はタイムラインラベルの種別を判定してUIを表示する
	セル	A-Z?
	静止画	BG/BOOK インクリメント・デクリメント
	カメラワーク FIX/PAN/SL/TU/TB/TILT/
	効果 WXP/透過光/FI/FO/OL/FLT 通常/加算/SC/覆焼/乗算/焼込/差分
	種別の編集は行わない
*/
reNameLabel=function(TimelineId) {
	if(xUI.viewOnly){return false;};
	var newNames=new Array();
	var msg=localize(nas.uiMsg.dmTLlabelRename);//タイムラインラベルを変更します
	if(!TimelineId){
		//全タイムラインのラベルを取得して仮セット
		for (var Tidx=0;Tidx<xUI.XPS.xpsTracks.length-1;Tidx++){
			newNames.push(xUI.XPS.xpsTracks[Tidx].id);
		};

		msg+="\n"+localize(nas.uiMsg.dmRenameLabels);//新しいラベル名セットを指定してください
	}else{
		var kind=xUI.XPS.xpsTracks[TimelineId].option;
		newNames.push(xUI.XPS.xpsTracks[TimelineId].id);
		msg+="\n"+localize(nas.uiMsg.dmRenameLabel)+"\n"+kind+":";//新しいラベルを指定してください
		msg=[msg];
		switch (kind){
		  case "dilaog":
		  	msg.push(document.getElementById("DSLabelTemplate").innerHTML);
		  break;
		  case "still":
		  	msg.push(document.getElementById("BGLabelTemplate").innerHTML);
		  break;
		  case "timing":
		  case "replacement":
		  	msg.push(document.getElementById("CLLabelTemplate").innerHTML);
		  break;
		  case "camera":
		  case "camerawork":
		  	msg.push(document.getElementById("CWLabelTemplate").innerHTML);
		  case "geometry":
		  case "peg":
		  case "stage":
		  case "stagework":
		  	msg.push(document.getElementById("CWLabelTemplate").innerHTML);
		  break;
		  case "effect":
		  case "composite":
		  	msg.push(document.getElementById("FXLabelTemplate").innerHTML);
		  break;
		}
	};
	var myFunc=function(){
	  if(! TimelineId){this.TimelineId=null}else{this.TimelineId=TimelineId};
		if((this.value=="")||(this.startValue==this.value)||(this.status >= 1)){return;};
	  var newNames=this.value;
	  if(newNames!=null){
		newNames=newNames.split(",");
		if(! this.TimelineId){
			for (var Lidx=0;Lidx<newNames.length;Lidx++){
				if((Lidx<xUI.XPS.xpsTracks.length)&&(xUI.XPS.xpsTracks[Lidx].id!=newNames[Lidx])){
					xUI.sheetPut([["id",Lidx].join("."),newNames[Lidx]]);
				};
			};
		}else{
			xUI.sheetPut([["id",this.TimelineId].join("."),newNames[0]]);
		};
		sync("lbl");
	  };
	return;
	}
	myFunc.TimelineId=TimelineId;
	newNames=nas.showModalDialog("prompt",msg,localize(nas.uiMsg.timelineRename),newNames.join(","),myFunc);
};
/*
	トラックコメントの編集
	タイムラインIDが与えられた場合は、そのタイムライン
	引数なしの場合は、現在フォーカスのあるタイムライン

*/
editTrackTag=function(TimelineId) {
	if(xUI.viewOnly){return false;};
	if(! TimelineId) TimelineId = xUI.Select[0];
	var newName='';
	var msg=localize(nas.uiMsg.dmTLtagEdit);//タイムライントラックノート

		newName = xUI.XPS.xpsTracks[TimelineId].tag;
		msg+="\n"+localize(nas.uiMsg.dmRenameLabel)+"\n";//新しいラベルを指定してください

	var myFunc=function(){
	  if(isNaN(TimelineId)){return false;}else{this.TimelineId=TimelineId};
		if((this.startValue==this.value)||(this.status >= 1)){return;};
	    var newName=this.value;
		xUI.sheetPut([["tag",this.TimelineId].join("."),newName]);
		sync("lbl");
	return;
	}
	myFunc.TimelineId=TimelineId;
	newName=nas.showModalDialog("prompt",msg,localize(nas.uiMsg.tagEdit),newName,myFunc);
};

//タイムラインラベル変更用ボタンメソッド
inputButtonText=function(myText){
	document.getElementById("nas_modalInput").value=myText;nas.showModalDialog("result",0);
}
/** リファレンスシートへのコピー
引数:	キーワード "all"又は"timing","replacement","camerawork","sfx","dialog"

デフォルトはreplacement
*/
putReference=function()
{
	//xUIに範囲設定があれば、その範囲を、無ければすべてのシートを操作対象にする
	if((xUI.Selection[0]==0)&&(xUI.Selection[1]==0)){
		documentDepot.currentReference=new Xps();
		documentDepot.currentReference.readIN(xUI.XPS.toString());//選択範囲指定がない場合は、すべてコピー
		xUI.resetSheet(undefined,documentDepot.currentReference);
	}else{
	//return false;
		var mStart=[
			(xUI.Selection[0]>0)?xUI.Select[0]:xUI.Select[0]+xUI.Selection[0],
			(xUI.Selection[1]>0)?xUI.Select[1]:xUI.Select[1]+xUI.Selection[1]
		];
		var mEnd  =[
			(xUI.Selection[0]>0)?xUI.Select[0]+xUI.Selection[0]:xUI.Select[0],
			(xUI.Selection[1]>0)?xUI.Select[1]+xUI.Selection[1]:xUI.Select[1]
		];
	//選択範囲がreferenceXPSよりも広かった場合は、参照XPSを拡張する
		var widthUp=   (mEnd[0]>xUI.referenceXPS.xpsTracks.length)? true:false;
		var durationUp=(mEnd[1]>xUI.referenceXPS.duration())?     true:false;
		if((widthUp)||(durationUp)){
			xUI.referenceXPS.reInitBody(
				(widthUp)?    mEnd[0]:xUI.referenceXPS.xpsTracks.length,
				(durationUp)? mEnd[1]:xUI.referenceXPS.duration()
			);
		};
		xUI.sheetPut(xUI.getRange(),[0,0],true)
//		xUI.putReference(xUI.getRange([mStart,mEnd]));
	}
	//nas_Rmp_Init();
    xUI.selectionHi("hilite");
}

getReference=function(){
	//xUIに範囲設定があれば、その範囲を、無ければすべてのシートを操作対象にする
	if((xUI.Selection[0]==0)&&(xUI.Selection[1]==0)){
		xUI.sheetPut(xUI.referenceXPS);//選択範囲指定がない場合は、参照シートをすべてコピー
	}else{
	//現在のカーソル位置と選択範囲を取得
    var restorePoint     = xUI.getid('Select');
    var restoreSelection = xUI.getid('Selection');
		var mStart=[
			(xUI.Selection[0]>0)?xUI.Select[0]:xUI.Select[0]+xUI.Selection[0],
			(xUI.Selection[1]>0)?xUI.Select[1]:xUI.Select[1]+xUI.Selection[1]
		];
		var mEnd  =[
			(xUI.Selection[0]>0)?xUI.Select[0]+xUI.Selection[0]:xUI.Select[0],
			(xUI.Selection[1]>0)?xUI.Select[1]+xUI.Selection[1]:xUI.Select[1]
		];
	//選択範囲がreferenceXPSよりも広かった場合は、参照XPSを拡張する
		var widthUp=   (mEnd[0]>xUI.referenceXPS.xpsTracks.length)? true:false;
		var durationUp=(mEnd[1]>xUI.referenceXPS.duration())?     true:false;
		if((widthUp)||(durationUp)){
			xUI.referenceXPS.reInitBody(
				(widthUp)?    mEnd[0]:xUI.referenceXPS.xpsTracks.length,
				(durationUp)? mEnd[1]:xUI.referenceXPS.duration()
			);
		};
		xUI.sheetPut(xUI.referenceXPS.getRange([mStart,mEnd]));
        xUI.selectCell(restorePoint);
        xUI.selection(restoreSelection);
	}
    xUI.selectionHi("hilite");
}
/*	セルの内容を繰り上げる/下げる
数値部分を持ったタイムラインセルの数値部分を引数分だけ操作する
通常は+1/-1
セルの内容がアルファベット一文字のみだった場合は、文字位置を引数分だけシフトする

捜査対象は選択範囲、選択範囲がなければ現在のセル
操作終了時は、開始時のセルと選択範囲を維持
// 今捜査対象がタイムライン一つだけど複数列に拡張したほうがよいかも
*/
incrementCell=function(myShift){
	if((!myShift)||(isNaN(myShift))) return ;//引数ゼロ＝操作なし とみなす
	myShift=parseInt(myShift);
  var bkCell=xUI.Select.join("_");
	var bkSelect=[xUI.Select[0]+xUI.Selection[0],xUI.Select[1]+xUI.Selection[1]].join("_");
  var startFrm=xUI.Select[1];
  var names="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var myDepth =xUI.Selection[0]; 
  var myLength=xUI.Selection[1];
	var myStream=[];
for(var idy=0;idy<=myDepth;idy++){  
  var myBody=[];
  var currentContent=xUI.XPS.xpsTracks[xUI.Select[0]].slice(startFrm,startFrm+myLength+1);
for(var idx=0;idx<currentContent.length;idx++){
	if(currentContent[idx].match(/^([\[\<\(]?)([A-Z])([\)\>\]]?)$/)){
		myBody.push(RegExp.$1+names.charAt((names.indexOf(RegExp.$2)+myShift+26)%26)+RegExp.$3);
	}else{
		if(currentContent[idx].match(/^([\[\<\(]?)(\d+)([\)\>\]]?)$/)){
			myBody.push(nas.incrStr(currentContent[idx],myShift,true));
		}else{
			myBody.push(currentContent[idx]);
		}
	}
}
	myStream.push(myBody.join(","));
}
	xUI.selectCell(xUI.Select[0]+"_"+startFrm);
	xUI.selection();
	xUI.sheetPut(myStream.join("\n"));
	xUI.selectCell(bkCell);
	xUI.selection(bkSelect);
}

/**
 *	@summary
 *　現在の選択範囲に指定の区間記述を入力する。
 *	@description
 * <pre>
 * 選択範囲がない場合はNOP
 * 動作条件は、指定範囲が単一タイムラインで２フレーム以上ある場合（１フレームの区間は対象外）
 * 選択タイムラインが
 * カメラワーク→両端に区間端子（三角）を置き前後に値ノードを配置する。
 * エフェクト→両端に区間端子シンボルを置いて注釈を挿入する。シンボルは、ラベルで判定 判定不能な場合はデフォルト
 * ダイアログ→サウンドエフェクト区間を入れる
 * セリフはダイアログの方から入力
 * スチル	→NOP
 * セル→NOP
 * 
 * 動作終了後は、選択を解除してカーソル位置を復帰
 *</pre>
 *	@params {String} myOpt
 *		描画する区間の種別
 */
writeNewSection=function(myOpt){
  if((xUI.Selection[0]>0)||(xUI.Selection[1]<1)){return}

  var bkFrm=xUI.Select[1];
  var startFrm=xUI.Select[1];
  var myLength=xUI.Selection[1];
  var myBody=[];
 if(! myOpt){
 	myOpt=(xUI.Select[0]==0)?"dialog":(xUI.Select[0]<=xUI.XPS.xpsTracks.length-1)?xUI.XPS.xpsTracks[xUI.Select[0]].option:"comment";
 	
 }
    switch(myOpt){
      case "camera":
      case "camerawork":
      case "stage":
      case "stagework":
      case "geometry":
      		myOpt = 'slide';
      case "pan":
      case "slide":
      case "TU":
      case "TB":
      	//カメラワーク/ジオメトリトラックには値指定ブラケット付きで
      	if(startFrm > 0){startFrm--}else{myLength--};//開始フレーム０以外は一コマ先行で配置
      	if((startFrm+1+myLength) >= (xUI.XPS.xpsTracks[xUI.Select[0]].length-1)){
      		myLength--};//終了フレームが最終の場合は一コマカット
	myBody.push("[A]");
	myBody.push("▽");
	for(var idx=1;idx<myLength;idx++){
		myBody.push(((xUI.XPS.xpsTracks[xUI.Select[0]].option=="camera")&&(idx==Math.floor((myLength-1)/2)))?"<"+myOpt+">":"|");
	}
	myBody.push("△");
	myBody.push("[B]");
      break;
      case "composite":
      case "sfx":
      case "effect":
      	//コンポジットトラック値指定アングルブラケット付き
      	if(startFrm > 0){startFrm--}else{myLength--};//開始フレーム０以外は一コマ先行で配置
      	if((startFrm+1+myLength) >= (xUI.XPS.xpsTracks[xUI.Select[0]].length-1)){
      		myLength--};//終了フレームが最終の場合は一コマカット
	myBody.push("<100%>");
	myBody.push("┳");
	for(var idx=1;idx<myLength;idx++){myBody.push("┃");}
	myBody.push("┻");
	myBody.push("<100%>");
      break;
      case "FI":
	myBody.push("▲");
	for(var idx=1;idx<myLength;idx++){
		myBody.push((idx==Math.floor((myLength-1)/2))?"<"+myOpt+">":"|");
	}
	myBody.push("▲");
	break;
      case "FO":
	myBody.push("▼");
	for(var idx=1;idx<myLength;idx++){
		myBody.push((idx==Math.floor((myLength-1)/2))?"<"+myOpt+">":"|");
	}
	myBody.push("▼");
	break;
      case "transition":
      case "OL":
      case "WIPE":
	myBody.push("]><[");
	for(var idx=2;idx<(myLength/2);idx++){myBody.push("|");}
	if(myLength%2){myBody.push("↓");myBody.push("↑");}else{myBody.push("＊")}
	for(var idx=2;idx<(myLength/2);idx++){myBody.push("|");}
	myBody.push("]><[");
      break;
	case "comment":
	myBody.push("┓");
	for(var idx=2;idx<myLength+1;idx++){myBody.push("┃");}
	myBody.push("┛");
	break
	case "dialog":
      	//ダイアログトラックにはダイアログセパレータ付きで
      	if(startFrm > 0){startFrm--}else{myLength--};//開始フレーム０以外は一コマ先行で配置
      	if((startFrm+1+myLength) >= (xUI.XPS.xpsTracks[xUI.Select[0]].length-1)){
      		myLength--};//終了フレームが最終の場合は一コマカット
	myBody.push("____");
	for(var idx=0;idx<=myLength;idx++){myBody.push("|");}
	myBody.push("____");
      break;
	case "timing": return;
    default:
		for(var idx=0;idx<myLength+1;idx++){myBody.push("|");}
    }

	xUI.selectCell(xUI.Select[0]+"_"+startFrm);
	xUI.selection();
	xUI.sheetPut(myBody.join(","));
	xUI.selectCell(xUI.Select[0]+"_"+bkFrm);
}

/*	呼び出されたら指定範囲に縦棒を入力する。
罫線としての「縦棒（線引き）」と、論理的な[セクション]とを分けるほうが良い
このルーチンは線引に特化させる
空白部の線引のみを行うトグル動作

指定範囲がない場合はセレクションを使用(1コマのみ処理)
選択タイムラインがカメラワーク・エフェクト・タイミングの場合は単純にセルに縦線を引く
ダイアログ、サウンド等の場合は、動作しない
開始フレームに縦棒がすでにある場合は、縦棒を削除する動作
タイミングの場合のみセルの値を判定して波線に自動変更

動作終了後は、選択を解除してカーソル位置を入力終了位置へ送り、可能ならその下へ1フレーム進める
暫定的に引数でターゲットを与える
ターゲットのシンボルのトグルとなる
*/
putSectionLine=function(myTarget){
  //if((xUI.Selection[0]>0)||(xUI.Selection[1]<1)){return}
	if (! myTarget) myTarget="|"; 
  var bkFrm=xUI.Select[1]+xUI.Selection[1]+1;
  var startFrm=xUI.Select[1];
  var myLength=xUI.Selection[1];
  var myBody=[];
  var myOpt=(xUI.Select[0]==0)?"dialog":(xUI.Select[0]<=xUI.XPS.xpsTracks.length-1)?xUI.XPS.xpsTracks[xUI.Select[0]].option:"comment";
  var currentContent=xUI.XPS.xpsTracks[xUI.Select[0]].slice(startFrm,startFrm+myLength+1);
  
    switch(myOpt){
      case "dialog":     	return;
      break;
      case "camera":
      case "effect":
      case "timing":
//すでに入力されているセルはそのままで "","|",";" のみを編集対象セルにする？
//↑しない 全て上書き
for(var idx=0;idx<currentContent.length;idx++){
	if(currentContent[0]==myTarget){myBody.push("");}else{myBody.push(myTarget);}
}
      break;

      default:
	for(var idx=0;idx<myLength+1;idx++){myBody.push(myTarget);}
    }

	xUI.selectCell(xUI.Select[0]+"_"+startFrm);
	xUI.selection();
	xUI.sheetPut(myBody.join(","));
	xUI.selectCell(xUI.Select[0]+"_"+bkFrm);
//	xUI.spin("fwd");
}
/*
	波線引
	トラック種別を認識して波線を引く
	ジオメトリトラックに限り シフトキーで大波 コントロールキーを同時押しで小波を描画する。
	描画するアイテムを選択してputSectionLineを呼び出すラッパ関数
*/
setWave =function(e){
    var item = "";
    switch (xUI.XPS.xpsTracks[xUI.Select[0]].option){
    case "timing":;case "replacement":;item = ":";
    break;
    case "camera":;case "geometry":
        if((e.metaKey)||(e.ctrlKey)) {
            item = "/";//small
        } else if (e.shiftKey) {
            item = "///";//large
        } else {
            item = "//";//middle
        }
    break;
    case "sfx":;case "effect":;case "composite":;
    default:
        return false;
    }
    putSectionLine(item);
}
/**
	@params {String} char

中間値補間サインをシート上に配置する
補完サインに使用する文字を指定可能
指定時は強制的にその文字と置き換える

選択範囲のない場合フォーカスのあるシートセルに、補間サインを入力してスピンする
配置候補のシートセルがすでに補間サインだった場合は補完サインの種別を変更してスピンを留保する
種別ループに消去あり? > なし
消去はDELキー

有効記述だった場合はNOP？

選択範囲がある場合 範囲が一列ならばそのまま動作対象に
複数列の場合はフォーカスのある一列に変更して
その区間にSPIN指定の間隔で補完サインを配置する。基点は選択範囲の最も上のシートセル

*/
var interpSign=function(char){
	var myValue = xUI.XPS.xpsTracks[xUI.Select[0]][xUI.Select[1]];
	if (typeof char == 'undefined'){
		if(myValue.match(nas.CellDescription.interpRegex)){
			char=nas.CellDescription.interpolationSigns[
				((nas.CellDescription.interpolationSigns.indexOf(myValue))+1) % nas.CellDescription.interpolationSigns.length
			];
		}else{
			char = nas.CellDescription.interpolationSigns[0];
		};
	};
  if(xUI.Selection.join(",")=="0,0"){
		xUI.sheetPut(nas_expdList(char));
		xUI.spin("down");
  }else{
	var myRange=xUI.actionRange();
	var currentColumn=xUI.Select[0];//現在のカラム
	xUI.selectCell([currentColumn,myRange[0][1]]);
	xUI.selection([currentColumn,myRange[1][1]]);
	xUI.sheetPut(nas_expdList("/"+char+"/"));
	xUI.selectCell([currentColumn,myRange[1][1]+1]);
  };
};
/*addCircle(キーワード)
 *	@params {String} keyword
 *		"none"|"circle"|"triangle"|"brackets"
 * 
 * フォーカスのあるシートセルのまたは選択範囲内の記述が操作ターゲット
 * ターゲットとなるセルの記述にキーワードで指定された修飾を施す。または削除する。
 * ターゲットセルにすでに指定の装飾がある場合は、その装飾を削除するトグル動作。
 * ターゲットは、空白、カラセル、補間サイン、省略の線引以外の記述
 * 処理対象範囲はつねにトラック全体(=内容変更のある場合は変更範囲をput)
 * 
 * 選択範囲のない場合
 * 捜査対象はフォーカスのあるセルの記述のみ
 * 同トラックの全ての同じ記述に指定の装飾を加える
 * 記述が処理対象外の場合はNOP
 * 
 * 選択範囲がある場合
 * 範囲が一列ならばそのまま複数列の場合はフォーカスのある一列に変更する
 * その区間内の全てのセルをスキャンして操作対象列を作る。
 * 同一の記述は１対象としてカウント
 * 
 * 将来的に、トラックのプロパティとしてmodifierリストが保持されなくてはならない。
 * その際にはmodifierプロパティに働きかける関数になり、この内容はそちらへ移植される。
 * xUI.XPS.xpsTracks[tid].
 * 
 * <矢括弧>(=△囲み)は、replacementトラック中間値補間サインとして予約されているので中間値チェックにかかるため先に判定して抜ける。
 * 	@returns {Array}
 *	戻り値は、変更後のストリーム？  入力したセル数？ 最終アドレス？
 */
addCircle=function(kwd){
	if(! kwd) kwd="circle";
     if(typeof interpRegex == "undefined")
        interpRegex = nas.CellDescription.interpRegex;
 	 if(typeof blankRegex == "undefined")
 		blankRegex = nas.CellDescription.blankRegex;
 	 if(typeof ellipsisRegex == "undefined")
 		ellipsisRegex = nas.CellDescription.ellipsisRegex;

//コレは基礎オブジェクトに移行 …というか、総合判定メソッドが必要（ケースで判断が変わる）
//後で置き換え
//ターゲット記述を収集
	var targetDescriptions = [];
   targetDescriptions.cellIndexOf = function (description /*, fromIndex */) {
    "use strict";

    if (this == null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = 0;

    if (arguments.length > 0) {
      n = Number(arguments[1]);//第ニ引数-検索開始インデックス

      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;// NaNならば０開始
      } else if (n != 0 && n != Infinity && n != -Infinity) {//ゼロ 無限大 マイナス無限大以外 すなわち実数範囲 の場合負数を全て-1 それ以外を整数化
         n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
//要素数をオーバーしたら検索失敗
    if (n >= len) {
      return -1;
    }
//範囲を設定
    var k = (n >= 0)? n : Math.max(len - Math.abs(n), 0);
//順次検索 compare メソッドの戻値が１以上でヒット
    for (; k < len; k++) {
      if (k in t && (t[k].compare(description) > 0)) {
        return k;
      }
    }
    return -1;
  }
//ターゲットセルの記述内容を取得
//	var targetDescription = new nas.CellDescription(xUI.getRange([xUI.Select,xUI.Select]));

	var myRange		  = xUI.actionRange();
	var currentColumn = xUI.Select[0];//現在のカラム

	xUI.selectCell([currentColumn,myRange[0][1]]);
	xUI.selection([currentColumn,myRange[1][1]]);
//ターゲット収集 最低数は０
	for(var f=myRange[0][1];f<=myRange[1][1];f++){
		var myDesc = new nas.CellDescription(xUI.XPS.xpsTracks[currentColumn][f]);

//この判定はxMAP完成後に有効記述であるか否かを判定する評価関数に置きかえ予定

		if(myDesc.type != "normal"){
			continue;//cellIndexOf でもヒットはしないが、高速化のため先抜け排除
		}else{
			if ( targetDescriptions.cellIndexOf(myDesc)<0 ) targetDescriptions.push(myDesc);
		}
	}
//収集後に処理対象数が０の場合は機能終了
 if(targetDescriptions.length == 0) return;
//トラック全体をサーチして新規データをビルド
	var changeStart  = -1;
	var changeEnd    = -1;
	var newValue     = [];
	var currentTrack=xUI.XPS.xpsTracks[currentColumn];
	for(var f = 0;f<currentTrack.length;f++){
		var currentCell=new nas.CellDescription(currentTrack[f]);
		if (currentCell.type!="normal"){
		//チェック対象外 無条件で新規配列にプッシュ
			newValue.push(currentCell);
			continue;
		}else{
			for(var t=0;t<targetDescriptions.length;t++){
				dest = (targetDescriptions[t].modifier == kwd)?"none":kwd;
				if(currentCell.compare(targetDescriptions[t]) > 1){
					//記述が同じ(ヒット)処理して最終処理フレームをプッシュ
					currentCell.modifier = dest;
					currentCell.content = currentCell.toString("normal");
					if( changeStart < 0) {
						changeStart = f;
					}
						changeEnd   = f;
					break;
				}
			}
			newValue.push(currentCell)
		}
	}
	if(changeStart<0) return ;//一点も処理しなかった

		xUI.selectCell([currentColumn,changeStart]);
		xUI.selection();
	var result = 	xUI.sheetPut(newValue.slice(changeStart,changeEnd+1).join(","));
		xUI.selectCell([currentColumn,myRange[0][1]]);
		xUI.selection([currentColumn,myRange[1][1]]);
return result;
}
/* test

*/

/**
 * 原画アクションシート作成
 * 現在のシートをリファレンスに送って原画アクションシートを作る一連の手続
 * カレントデータを無指定でリファレンスに転送
 * シートのリプレースメント（タイミング）タイムラインをクリア
 * 引数:なし
 * 戻値:
 * 
 */
buildActionSheet =function(){
	putReference();
	var bkPos=xUI.Select.join("_");//現在のカーソルを記録

	for (var lix=1;lix<xUI.XPS.xpsTracks.length-1;lix++){
		if(xUI.XPS.xpsTracks[lix].option=="timing"){
			console.log('clear :'+xUI.XPS.xpsTracks[lix].id)
			xUI.selectCell(String(lix)+"_0");
			clearTL();
		}		 
	}
	xUI.selectCell(bkPos);	//バックアップ位置へ復帰
}
/**
 *pageZoom()
 */
pageZoom = function(){
	var xScale=1;var yScale =1;
	return xUI.adjustScale([xScale,yScale]);
}
/**
	アプリケーション開始時にjQuery-uiのtooltipを初期化するプロシジャ
	起動時に一回だけ実行 xUIの初期化前に実行されること
*/

startupTooltip=function(){
    jQuery( function() {
var myToolTips=["#airMenu","#cgiMenu","#psMenu","#commonEditMenu","#optionPanelUtl"];
for (var tid=0;tid<myToolTips.length;tid++){
        jQuery(myToolTips[tid]).tooltip( {
        position: {
            my: "center top",
            at: "center bottom",
            track:true,
        }
    } );
 };
    } );
}

/*
	タイムラインをセクションへ変換する関数
	Section オブジェクトは Timeline.sectionsのメンバーである
	sections[0]〜 メンバーは以下のプロパティを持つ
	Section.inpoint	: Int Frames
	Section.duration	: Int Frames 
	Section.body 	: Array.
	Section.isInterp	: Bool 補間フラグ
	Section.value		: String 値 Timeline.valueAt()関数はこの値から現在の値を算出する
	値は空白の場合がある 未定義の値は空白となる場合がある
	補間フラグがあればその区間は中間値補間区間となる
	補間区間は基本的に値を持たず、前後区間の値を補完する
	補間区間が連続する場合は前方区間が終了値を持つ場合がある
		セクションは必ずタイミングを持つ
	Section.timing	:タイミングオブジェクトまたはタイミング記述？
	
	
	セクション編集時はタイムライン全体をバッファにとって編集する
	編集後のストリームをシート上にputして編集を終了する
	りまぴんでは編集のたびにセクションを含むタイムラインをパースする
	キャッシュは行われない
*/
/*
	対象トラックを走査してセル表記をノーマライズする
	丸囲い等の強調装飾記述を統一する
	
 */
var normalizeTimeline = function normalizeTimeline(timelineTrack){
	var cellStack = [];
	var cell;
	for(var f=0; f<timelineTrack.length;f++){
		cell = new nas.CellDescription(timelineTrack[f],timelineTrack.id);
		if(cell.type != "normal") continue;
		var pcl = cellStack.find(function(elm){return (elm.compare(cell)>0);});
		if(pcl){
			if(pcl.modifier != cell.modifier) timelineTrack[f]=pcl.content;
		}else{
			cellStack.add(cell);
		};
	};
};

/**
 *	セル記述入力正規化フィルタ
 *		確定値 タイムシート記述時に確定した値を持つセルのうち
 *		カラセルを除く既存の記述を複製する
 *
 *			モードは以下
 *	0:加工なし・文字列正規化のみで返す
 *	1:動画|セル用標準加工 １番のみ強制丸囲み
 *	2:LO|原画用加工 １番を含む新規の確定値セルをすべて丸囲みする
 *
 *	0以外は
 *	トラック既存のセル記述の装飾を参照して入力を加工
 *	または exchスイッチが立っている場合
 *	トラック既存の入力を新規入力を参照して加工
 *	その際入力値側の加工はスキップ
 *
 *	@params	{Array of String|String}  cell
 *		配列渡し
 *	@params	{Object|Xps.XpsTimelineTrack} targetTrack
 *	@params {Number Int}              mode
 *		0|1|2
 *	@params {Boolean}                 exch
 *
 *	@returns {Array}
 *		フィルタ処理した配列戻し
 *
 * タイムシートの入力に動作モード別の入力文字の自動修飾機能が付く
 * 修飾なし、動画向け、原画向けの3つのモードがある
 *
 * 修飾なしのモードは入力した文字をそのままシートに記入
 * すべてのモードで入力時に数字とアルファベットは半角に変換
 *
 * 動画向けの変換は1番のみ、原画向けの変換では未記入の文字にすべて丸で囲む
 * 修飾を変更するには修飾ボタンを使用
 *
 * または入力確定の際に[ctrl]+[enter]キーで修飾のない文字を入力可能
 * targetTrackがリプレースメント以外の場合は正規化以外の処理をスキップ
 * 台詞・音響・カメラ
 */
var iptFilter = function(cell,targetTrack,mode,exch){
    if(typeof cell == 'undefined') return cell;
    if(!(cell instanceof Array)) cell = [cell];
    if(!(targetTrack instanceof Xps.XpsTimelineTrack)) return cell;
	if(! mode) mode = 0;
	if(! exch) exch = false;
	var excStack = [];
	var changeStart = targetTrack.length;var changeEnd = 0;
	for(var cid = 0;cid < cell.length ; cid ++){
		cell[cid] = new nas.CellDescription(cell[cid]);
		if(cell[cid].type != 'normal') continue;
		cell[cid].parseContent(nas.normalizeStr(String(cell[cid].content)));//normalize
		if ((targetTrack.option == 'cell')||(targetTrack.option == 'timing')||(targetTrack.option == 'replacement')){
			if((cell[cid].modifier == 'none')&&(! exch)){
				if((mode > 0)&&(cell[cid].body == '1')) cell[cid].parseContent('(1)');//１番強制丸囲み mode1-2 共通
				if(mode > 1) cell[cid].parseContent('('+cell[cid].body+')');//強制丸囲み mode2
			};
		}else if((targetTrack.option == 'camera')){
			if((mode >= 2)&&(! exch)){
//原画モードのみ
				var cam = nas.cameraworkDescriptions.get(cell[cid]);
				
			};
		};
		var pcl = targetTrack.findCell(cell[cid]);
		if((pcl)&&(cell[cid].modifier != pcl.modifier)){
			if(exch){
				excStack.push(cell[cid]);
			}else{
				cell[cid].parseContent(pcl.content);
			};
		};
	};

	if((exch)&&(excStack.length)){
		for(exc = 0;exc < excStack.length ; exc ++){
			for(f = 0;f < targetTrack.length ; f ++){
				if(excStack[exc].compare(targetTrack[f])>0){
					if(changeStart > f) changeStart = f;
					if(changeEnd < f)   changeEnd   = f;
				};
			};
		};
		var pclContent = targetTrack.xParent.parentXps.getRange([
			[targetTrack.index,changeStart],
			[targetTrack.index,changeEnd]
		]).split(",");
//console.log([[targetTrack.index,changeStart],[targetTrack.index,changeEnd]]);
//console.log(pclContent);
		for(var pid = 0; pid < pclContent.length; pid ++){
			var mt = excStack.find(function(elm){return elm.compare(pclContent[pid])});
			if(mt) pclContent[pid] = mt.content;
		};
		var bkup  = xUI.Select.join('_');
		var bkupR = [xUI.Select[0]+xUI.Selection[0],xUI.Select[1]+xUI.Selection[1],];
		xUI.selectCell([targetTrack.index,changeStart]);
		xUI.selection();
//console.log(pclContent);
		xUI.sheetPut(pclContent.join());
		xUI.selectCell(bkup);
		xUI.selection(bkupR);
	};
	return cell.join();

/*            if(
                (!pcl)&&
                ((targetTrack.option == 'timing')||(targetTrack.option == 'replacement'))&&
                (xUI.ipMode <= 0)&&
                (! nas.CellDescription.modifiedRegex.test(srcData[tx][fx]))&&
                (! nas.CellDescription.blankRegex.test(srcData[tx][fx]))
            ){
                srcData[tx][fx] = "(" + srcData[tx][fx] + ")";
            };// */
};
/*TEST
	iptFilert(["1","2","3",4,5])
*/
/*
	このファイルの関数は基本的にはxUIまたはXPSのメソッドなので
	デバグ終了後には必要に応じてラッパ関数を残してふさわしい位置へ移動すること。
	2007/06/29

*/
