/*(アレ置換)



	レイヤプロパティ置き替えスクリプト暫定版(2007/11/30)

	困ったねまったく

	危険なので準備しておくテスト

	

	** このスクリプトは、nasライブラリがなくても動作します。

	AE9以前の環境で走らせるとアプリケーションエラーにトラップされる可能性が高いので、可能な限りAE10で実行してください。

	いったん読み込んだ際にエラーで無効にされたエクスプレッションは有効にするようにしてあります。

*/

	var setAllItems	=true;	//操作フラグ



	var undoName	="例のアレ置換";	//undoに使う名前

	var tgtReg	=new RegExp("(スライダ|モジュレータ|アルファ|コンバータ|フレア|テクスチャ|スタビライザ|フィルタ)([^ー])","g");		//置換元エフェクトのアレ



	/*	変換元は 後で確認	*/



// nasがインストールされていない場合を判定



	try{if(nas){;}}catch(err){var nas=new Object();nas.biteClip=false;}



/*

	この下は実際の置換スクリプトです

	以前のプロパティを引き継ぐ必要がある場合は"tgtProp"のプロパティを参照できます。

	ここを書き換えて操作を指定して下さい	

	ここでのPropはエフェクトのことです。



	引数は、置き替えるエフェクト

	戻値は、作成したエフェクトそのもの



*/



//=====================================================================以下変更不要っぽい

/*

	指定されたアイテムの中からコンポを抜き出し

	コンポのレイヤに対して指定のスクリプトを実行するスクリプト

	アイテム指定がない場合はapp.project.activeItemが対象



引数:	実行する関数(アイテムの指定はセレクト状態を参照)

戻値:	サブスクリプトのリザルトを配列で

*/



var eachLayer=function(action){



	var myResult	=0;

	var bkupArray	=new Array;//選択状態の保存配列



	for(var idx=0;idx<app.project.numItems;idx++){bkupArray.push(app.project.item(idx+1).selected);};//現在の選択状態を保存



	//アイテムの選択 選択が無い状態ではアクティブアイテムを選択 それもなければ、オプションで 全アイテムを選択/処理しない

	if(app.project.selection.length==0){

		if(app.project.activeItem){

			app.project.activeItem.selected=true;

		}else{

			if(setAllItems){

				for(var idx=0;idx<app.project.numItems;idx++){app.project.item(idx+1).selected=true};//全部選択

			};//フラグなけりゃ何もしない

		}

	}

//		前処理してなおかつ対象アイテムがあれば設定されたアクションを実行

//		この時点で選択アイテムがなければ何もしない

	if(app.project.selection.length){

			app.beginUndoGroup(undoName);

		for(var idx=0;idx<app.project.selection.length;idx++){

			myItem=app.project.selection[idx];

			if(myItem instanceof CompItem){

				for(var id=0;id<myItem.layers.length;id++){myResult+=(action(myItem.layer(id+1)));};

			};//アイテムがコンポだった場合のみ各レイヤを引数にaction()を実行して リザルトを積む

		};

		for(var idx=0;idx<app.project.numItems;idx++)

		{

			app.project.item(idx+1).selected=bkupArray[idx];

		};//選択状態を復帰

		app.endUndoGroup();

	};

	return myResult;//なにも実行していな時は空配列をリザルト

}



/*

	レイヤに特定のエクスプレッションがあったらアレを 置き換える

 */



var replaceExpString=function(myProp){

	var replacedCounts=0;


	//全てのプロパティを検査してエクスプレッションの値が存在すればそれを変換

	var myPropCount=(myProp.numProperties)?myProp.numProperties:0;
if(myPropCount){
for (var idx=0;idx<myPropCount;idx++){

	//下位プロパティが存在するので再帰コール
    replacedCounts+=replaceExpString(myProp.property(idx+1));
}
return replacedCounts;
}else{
if((myProp.canSetExpression)&&(myProp.expression !="")){

	var checkRepalce=myProp.expression.match(tgtReg);
    replacedCounts=(checkRepalce instanceof Array)?checkRepalce.length:0;

	if(replacedCounts){

//		if(appHost.version<10){myProp.expressionEnabled=false};//この行は実際の役に立たない　エラーで止まるから

//alert(RegExp.$1+"ー"+RegExp.$2);

var chgWord=RegExp.$1+"ー"+RegExp.$2;

		myProp.expression=myProp.expression.replace(tgtReg,chgWord);

		if(app.version.split(".")[0]>=10){myProp.expressionEnabled=true}else{myProp.expressionEnabled=false};//エクスプレッションを書き換えてから有効にする。

}
return replacedCounts;
}else{
	return 0;
}
}
}


if(app.project){

	myReplaced=eachLayer(replaceExpString)//

	alert(myReplaced+"個のアレを置換しました。");

}
;//こんなもの使わないで済めばよいのだけどそれはそれで無理そう？