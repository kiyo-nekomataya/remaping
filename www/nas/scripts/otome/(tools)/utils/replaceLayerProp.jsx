/*(レイヤプロパティ置換)

	レイヤプロパティ置き替えスクリプト暫定版(2007/11/30)


	このスクリプトの動作は以下の変数を編集して決定して下さい。
	これはGUIなしの版です。GUI版は選択動作が発生するので別スクリプト
	このスクリプトを使う場合はこの下を編集して置換するプロパティを決定してください。

	現在プロジェクトウインドウで選択したアイテムの内コンポアイテムが操作の対象です。
	選択アイテムがなくアクティブアイテムがある場合はアクティブアイテムが操作対象になります。
	選択アイテムもアクティブアイテムもない場合は、"setAllItems"の値で動作が変わります。
	true	>	なにも選択していない時全アイテムを操作対象にする。
	false	>	なにもしない
	お好きな方に設定してください。

	** このスクリプトは、nasライブラリがなくても動作します。
*/
	var setAllItems	=true;	//操作フラグ

	var undoName	="エフェクト置換";	//undoに使う名前
	var tgtName	="ADBE Gaussian Blur";		//置換元エフェクトのmatchName
	var dstName	="ADBE Fast Blur";			//置換先エフェクトの指定 matchName or name

	/*	変換先は matchName と name どちらの指定も可能です	*/

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

function replaceProp(tgtProp){
	var myProp=tgtProp.parentProperty.addProperty(dstName);//エフェクトかける
//		myProp.property("ブラー").setValue(tgtProp.property("ブラー").value);//元の値を引き継ぎ
//		myProp.property("ほげふが").setValue("もごもご");//必要に応じてプロパティに値をセット
//マーカーとして名前を変更

	if((nas)&&(nas.biteClip)){
		myProp.name=nas.biteClip("__"+tgtProp.name,22)+"(replace)";
	}else{
		myProp.name="__"+tgtProp.name+"(replace)";
	};
	return myProp;//作成したプロパティを返す
}

//=====================================================================以下変更不要っぽい
/*
	指定されたアイテムの中からコンポを抜き出し
	コンポのレイヤに対して指定のスクリプトを実行するスクリプト
	アイテム指定がない場合はapp.project.activeItemが対象

引数:	実行する関数(アイテムの指定はセレクト状態を参照)
戻値:	サブスクリプトのリザルトを配列で
*/

var eachLayer=function(action){

	var myResult	=new Array;
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
				for(var id=0;id<myItem.layers.length;id++){myResult.push(action(myItem.layer(id+1)));};
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
	レイヤに特定のエフェクトが あったら 別のエフェクトに 置き換える
		tgtNameに検索するエフェクトのmatchNameを設定して
		関数replaceEffectのエフェクトを書き換えて下さい。
		関数内に必要なプロパティがあれば値の設定をお願いします。
		関数replaceEffects()内ではオリジナルのエフェクトは tgtProp として参照可能です。
	引数:	レイヤアイテム
	戻値:	置き替えたエフェクト数
 */

var replaceEffects=function(myLayer){
	var replacedIndexes=new Array();

	var myEffects=myLayer.property("ADBE Effect Parade");	
	for(var idx=1;idx<=myEffects.numProperties;idx ++){
		var targetEffect=myEffects.property(idx);
		if( targetEffect.matchName==tgtName){
//			alert(targetEffect.propertyIndex +" : "+tgtName);//debug
/*	ここで新エフェクトを挿入	*/
	var newEffect=replaceProp(targetEffect);//新しいエフェクトを作成


	newEffect.moveTo(targetEffect.propertyIndex+1);//作ったエフェクトをターゲットの直下に移動
	replacedIndexes.push(targetEffect.propertyIndex);//リザルト積む
	targetEffect.remove();// ターゲット消去
		};
	}
return replacedIndexes.length;
}

if(app.project){
	myReplaced=eachLayer(replaceEffects)//
		myCount=0;
		for(var idx=0;idx<myReplaced.length;idx++){myCount+=myReplaced[idx]};
	writeLn(myCount.toString()+"個のエフェクトを置換しました。");
}
;//