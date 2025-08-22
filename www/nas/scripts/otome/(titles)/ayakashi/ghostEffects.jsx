/*(幽霊効果)
 *	スクリプト名:ghostEffects.jsx
 *
 *		このファイルは、nas ライブラリを使用してGUI付きのAEスクリプトを
 *		作成するためのテンプレートです。パレット用
 *
 *		このファイルの手続きが標準の処理ですが、処理内容によっては
 *		かなり冗長な内容になっています。
 *		あなたの用途にしたがって書き換えてご使用ください。
 *		2006/11/9 kiyo/Nekomataya
 */
//オブジェクト識別文字列生成 
//var myFilename="renOugi.jsx";//正式なファイル名と置き換えてください。
//var myFilerevision="0.01";//ファイルージョンはアバウトパネルで表示されます。

/*	cvs/rcs使用の方は、下の2行をご使用ください	*/
	var myFilename=("$RCSfile: ghostEffects.jsx,v $").split(":")[1].split(",")[0];
	var myFilerevision=("$Revision: 1.1.2.5 $").split(":")[1].split("$")[0];
//

var exFlag=true;
var moduleName="ghostEffects";//識別用のモジュール名で置き換えてください。
//二重初期化防止トラップ
try{
	if(nas.Version)
	{
		nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	//現在のモジュール名とバージョンを登録する
		try{
if(nas[moduleName]){
//モジュールがオンメモリ(すでに初期化されている)場合の処理
	exFlag=true;//本来の初期化コマンドを無効にします。
//	nas[moduleName][myWindowName].show();
/*
	この部分は再初期化コマンドで置き換えてください。上の行は例です。
	現在のモジュール(ウインドウ)の表示メソッドを呼んでいます。
	すでに読み込み済みのモジュールを再度初期化することを防止するための処理です。
 */
}else{
//このスクリプトの識別モジュール名を登録します。
	nas[moduleName]=new Object();
}
		}catch(err){
//エラー時の処理をします。
	nas[moduleName]=new Object();
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
//初期化およびGUI設定
if(exFlag){
	/*----この下に初期化スクリプトを記述してください。----*/


//	各種プロパティ・メソッド等を初期


};

	/*---- この下には初期化の必要ないコマンドを置きます。----*/
			if(!( app.project)){
//	プロジェクトがないのでもう何もしません。
			}else{
		if(!(app.project.activeItem instanceof CompItem)){
			alert("アクティブコンポがありません。")	
		}else{
//ターゲットのコンポにすでに「幽霊効果」レイヤがある場合は処理スキップ
	if(app.project.activeItem.layers.byName("幽霊効果")){alert("コンポに「幽霊効果」レイヤがあります。\nすでに処理済みのようなので処理をスキップします。");
	}else{
if (app.project.activeItem.selectedLayers.length==0){
	alert("レイヤを選択してください。");//選択レイヤなし
}else{
//ターゲットレイヤが複数の場合は、プリコンポーズしてターゲットレイヤをひとつにする。
	if(app.project.activeItem.selectedLayers.length==1){
		targetLayer=app.project.activeItem.selectedLayers[0];
	}else{
		var newCompName=app.project.activeItem.name+"幽霊効果プリコンポ";
		newCompName=prompt("複数レイヤをプリコンポーズします。\nコンポの名前を指定してください。",newCompName);
		while(nas.biteCount(newCompName)>31){
			newCompName=prompt("名前が長すぎるような気がする。\n短くしてほしい。",newCompName);
		};
		if(newCompName){
			var myLayers=new Array();
			for (idx=app.project.activeItem.selectedLayers.length-1; idx>=0; idx--){
				myLayers.push(app.project.activeItem.selectedLayers[idx].index);
			};
			app.project.activeItem.layers.precompose(myLayers,newCompName,true);
			targetLayer=app.project.activeItem.selectedLayers[0];
		}else{
			targetLayer=null;
		}
	}
	if(targetLayer instanceof AVLayer){
//	undoブロック開始
	app.beginUndoGroup("幽霊効果の設定");
//制御用のヌルレイヤを作成
	ctrLayer=app.project.activeItem.layers.addNull();
	ctrLayer.name="幽霊効果";
	ctrLayer.moveBefore(targetLayer);
	ctrLayer.property("Effects").addProperty("カラー制御");
	ctrLayer.effect.property("カラー制御").name="ハイライト";
	ctrLayer.effect.property("ハイライト").property(1).setValue([1,1,1,1]);//初期値白
//アオリレイヤを作成(上から順)
	fanLayer=targetLayer.duplicate();
		fanLayer.name="アオリ";
		fanLayer.opacity.setValue(50);
		fanLayer.blendingMode=BlendingMode.LINEAR_DODGE;
//アニメフィルムさんのアオリセットを適用
		fanLayer.property("Effects").addProperty("スライダ制御");
		fanLayer.effect.property("スライダ制御").name="ストローク(コマ数)";
		fanLayer.effect.property("ストローク(コマ数)").property(1).setValue(24);

		fanLayer.property("Effects").addProperty("スライダ制御");
		fanLayer.effect.property("スライダ制御").name="最大値(%)";
		fanLayer.effect.property("最大値(%)").property(1).setValue(70);

		fanLayer.property("Effects").addProperty("スライダ制御");
		fanLayer.effect.property("スライダ制御").name="最小値(%)";
		fanLayer.effect.property("最小値(%)").property(1).setValue(30);

		fanLayer.property("Effects").addProperty("スライダ制御");
		fanLayer.effect.property("スライダ制御").name="コマうち";
		fanLayer.effect.property("コマうち").property(1).setValue(1);

		fanLayer.property("Effects").addProperty("トランスフォーム");
		fanLayer.effect.property("トランスフォーム").name="あおり";
		fanLayer.effect.property("あおり").property(9).setValue(100);
		var myExpression="var%20my_stro=effect(%22%E3%82%B9%E3%83%88%E3%83%AD%E3%83%BC%E3%82%AF(%E3%82%B3%E3%83%9E%E6%95%B0)%22).param(1);%0Dvar%20my_random=1%20;%0D%0D%0D%0Dvar%20my_max%20=effect(%22%E6%9C%80%E5%A4%A7%E5%80%A4(%25)%22).param(1)*my_random;%0Dvar%20my_min%20=effect(%22%E6%9C%80%E5%B0%8F%E5%80%A4(%25)%22).param(1)*my_random;%0Dvar%20my_A%20=(my_max-my_min)/2;%0Dvar%20my_mid%20=my_min+my_A;%0Dvar%20my_step%20=%20effect(%22%E3%82%B3%E3%83%9E%E3%81%86%E3%81%A1%22).param(1);%0D%0Dif%20(my_step%3C1)%7Bmy_step=1;%7D%0D%0D////////////////////////////////////////////////////%0D////////////%E3%82%B9%E3%83%86%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0%E5%87%A6%E7%90%86%E3%82%82%E3%81%A8///////////////////////%0Dae_st%20=%20this_layer.in_point*24%20;/*%E9%96%8B%E5%A7%8B%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0*/%0D%0Dsec_time=time*24;%0Dsec_ae_st=ae_st;%0Dzt=my_step-(ae_st%20-Math.floor(ae_st/my_step)*my_step);%0D///////////////////////////////////////////////////////%0D%0D%0Dmy_T%20=%20((my_step*Math.floor((sec_time+zt)/my_step)-zt)/24)-this_layer.in_point;%0D%0D%0Dvar%20my_opa=my_A*Math.cos(24*my_T*2*Math.PI/my_stro)+my_mid;%0Dmy_opa;%0D";
		fanLayer.effect.property("あおり").property(9).expression=decodeURI(myExpression);

		fanLayer.opacity.expression="random(100,80)";
//エクスプレッションでアオリ

//差分レイヤを作成
	diffLayer=targetLayer.duplicate();
		diffLayer.name="差分ブレ";
		diffLayer.property("Effects").addProperty("ポイント制御");//
		diffLayer.effect.property("ポイント制御").name="トラックポイント";//
		var shakeExpression='//%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%96%E3%83%A9%E3%83%BC%E4%BB%A3%E7%94%A8%E3%80%80%E5%9B%BA%E5%AE%9A%E6%95%B0%E5%88%97%E3%80%80Ver%201.0%20(36%20frames)%0Dvar%20Xs=%5B751.000,762.8,765.246,756.593,722.199,720.902,%0D%09732.672,743.066,753.099,758.76,769.653,793.627,%0D%09784.558,730.793,715.394,698.256,721.118,750.328,%0D%09743.976,766.978,761.538,843.363,862.258,775.158,%0D%09777.562,762.511,632.659,658.031,670.777,693.237,%0D%09703.698,754.759,752.068,734.375,765.187,744%5D;%0Dvar%20Ys=%5B703.000,694.6,683.435,677.606,695.963,713.738,%0D%09702.913,717.43,706.406,736.756,736.573,733.669,%0D%09693.807,623.598,655.573,668.665,675.757,663.457,%0D%09678.877,672.48,701.515,689.677,626.628,722.428,%0D%09708.642,718.856,801.87,779.329,740.038,754.747,%0D%09716.789,643.231,686.676,735.452,725.225,689%5D;%0D//%5B%20Xs%5B0%5D,%20Ys%5B0%5D%5D;%0D%09var%20idx=(Math.round((1+time)/thisComp.frameDuration)%20%25%20(Xs.length));%0D%09%5BXs%5Bidx%5D,Ys%5Bidx%5D%5D;%0D%0D';
		diffLayer.effect.property("トラックポイント").property(1).expression=decodeURI(shakeExpression);//
//		diffLayer.effect.property("トラックポイント").property(1).expression="";//

		diffLayer.property("Effects").addProperty("角度制御");//
		diffLayer.effect.property("角度制御").name="シャッター開口度";//
		diffLayer.effect.property("シャッター開口度").property(1).setValue(120);//
		diffLayer.effect.property("シャッター開口度").property(1).expression=decodeURI("thisComp.layer(%22%E5%B9%BD%E9%9C%8A%E5%8A%B9%E6%9E%9C%22).scale%5B1%5D*.6%0D")//
		diffLayer.property("Effects").addProperty("ブラー(方向）");
		var wordExpression='targetProperty=effect(%22%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%22)(%22%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%22);%0D/*%09%E3%83%8C%E3%83%AB%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E7%A7%BB%E5%8B%95%E3%82%92%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%81%97%E3%81%A6%E3%83%A2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%BB%E3%83%96%E3%83%A9%E3%83%BC%E3%82%92%E9%81%A9%E7%94%A8%E3%81%99%E3%82%8B%E3%80%82%0D%20*%09%09%E3%83%8C%E3%83%AB%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E4%BB%A3%E3%82%8F%E3%82%8A%E3%81%ABPAN%E5%BD%93%E3%81%AE%E3%82%AB%E3%83%A1%E3%83%A9%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%AE%E3%82%A2%E3%83%B3%E3%82%AB%E3%83%BC%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%82%84%E3%83%9D%E3%82%B8%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AB%E3%82%BB%E3%83%83%E3%83%88%E3%81%97%E3%81%A6%E3%82%82%E8%89%AF%E3%81%84%0D%20*%20%09%E5%8F%82%E7%85%A7%E3%81%99%E3%82%8B%E3%83%97%E3%83%AD%E3%83%91%E3%83%86%E3%82%A3%E3%82%92%E5%A4%89%E6%9B%B4%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88%E3%81%AF%E3%80%81%E4%B8%80%E7%95%AA%E4%B8%8A%E3%81%AE%E5%A4%89%E6%95%B0%E3%82%92%E6%9B%B8%E3%81%8D%E6%8F%9B%E3%81%88%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%E3%83%94%E3%83%83%E3%82%AF%E3%82%A6%E3%82%A3%E3%83%83%E3%83%97%E3%81%8C%E3%83%A9%E3%82%AF%E3%83%81%E3%83%B3%E3%81%A7%E3%81%99%E3%80%82%0D%20*/%0D%0D%20myVector=div(add(%0D%20%09sub(targetProperty.valueAtTime(time),targetProperty.valueAtTime(time-thisComp.frameDuration)),%0D%20%09sub(targetProperty.valueAtTime(time+thisComp.frameDuration),targetProperty.valueAtTime(time))%0D%20),2);%0D%0D%20function%20vec2deg(Vector,form)%0D%7B%0D%20%09if%20(Vector.length!=2)%7Breturn%20false%7D;%0D%20%09if%20(!form)%7Bform=%22degrees%22%7D;%0D%20%09var%20x=Vector%5B0%5D;var%20y=Vector%5B1%5D;%0D%09var%09myRadians=(y==0)?0:Math.atan(y/x);%0D%20%09if%20(x%3C0)%7BmyRadians+=Math.PI%7D;%0D%09switch(form)%0D%09%7B%0D%09%09case%09%09%22redians%22:var%20result=myRadians;%0D%09%09break;%09%0D%09%09case%09%09%22degrees%22:var%20result%20=%20Math.floor(180.%20*%20(myRadians/Math.PI)*%2010000)/10000;//degrees;%0D%09%09break;%09%0D%09%09case%09%09%22azimuth%22:var%20result%20=%20(radiansToDegrees(myRadians))-90;%0D%09%09break;%09%0D%09%7D%20%09%0D%09return%20result;%0D%7D%0D%20%0Dvec2deg(myVector,%22azimuth%22);//%E3%83%96%E3%83%A9%E3%83%BC%E6%96%B9%E5%90%91%0D'
		var lengthExpression='targetProperty=effect(%22%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%22)(%22%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%22);%0D/*%09%E3%83%8C%E3%83%AB%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E7%A7%BB%E5%8B%95%E3%82%92%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%81%97%E3%81%A6%E3%83%A2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%BB%E3%83%96%E3%83%A9%E3%83%BC%E3%82%92%E9%81%A9%E7%94%A8%E3%81%99%E3%82%8B%E3%80%82%0D%20*%09%09%E3%83%8C%E3%83%AB%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%AE%E4%BB%A3%E3%82%8F%E3%82%8A%E3%81%ABPAN%E5%BD%93%E3%81%AE%E3%82%AB%E3%83%A1%E3%83%A9%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%AE%E3%82%A2%E3%83%B3%E3%82%AB%E3%83%BC%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%82%84%E3%83%9D%E3%82%B8%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AB%E3%82%BB%E3%83%83%E3%83%88%E3%81%97%E3%81%A6%E3%82%82%E8%89%AF%E3%81%84%0D%20*%20%09%E5%8F%82%E7%85%A7%E3%81%99%E3%82%8B%E3%83%97%E3%83%AD%E3%83%91%E3%83%86%E3%82%A3%E3%82%92%E5%A4%89%E6%9B%B4%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88%E3%81%AF%E3%80%81%E4%B8%80%E7%95%AA%E4%B8%8A%E3%81%AE%E5%A4%89%E6%95%B0%E3%82%92%E6%9B%B8%E3%81%8D%E6%8F%9B%E3%81%88%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%E3%83%94%E3%83%83%E3%82%AF%E3%82%A6%E3%82%A3%E3%83%83%E3%83%97%E3%81%8C%E3%83%A9%E3%82%AF%E3%83%81%E3%83%B3%E3%81%A7%E3%81%99%E3%80%82%0D%20*/%0D%0D%20myVector=div(add(%0D%20%09sub(targetProperty.valueAtTime(time),targetProperty.valueAtTime(time-thisComp.frameDuration)),%0D%20%09sub(targetProperty.valueAtTime(time+thisComp.frameDuration),targetProperty.valueAtTime(time))%0D%20),2);%0D%0D%0Dlength(myVector)*(effect(%22%E3%82%B7%E3%83%A3%E3%83%83%E3%82%BF%E3%83%BC%E9%96%8B%E5%8F%A3%E5%BA%A6%22)(%22%E8%A7%92%E5%BA%A6%22)/360)%0D;%20%20'
		diffLayer.effect.property("ブラー(方向）").property(1).expression=decodeURI(wordExpression);//方向
		diffLayer.effect.property("ブラー(方向）").property(2).expression=decodeURI(lengthExpression);//長さ
		diffLayer.blendingMode=BlendingMode.DIFFERENCE;

//本体レイヤを作成
	bodyLayer=targetLayer.duplicate();
		bodyLayer.name="本体ボカシ";

		bodyLayer.property("Effects").addProperty("ブラー(滑らか)");
		bodyLayer.effect.property("ブラー(滑らか)").property(1).setValue(20);
		bodyLayer.effect.property("ブラー(滑らか)").property(1).expression=decodeURI("thisComp.layer(%22%E5%B9%BD%E9%9C%8A%E5%8A%B9%E6%9E%9C%22).scale%5B0%5D/10;");
		bodyLayer.effect.property("ブラー(滑らか)").property(3).setValue(true);
//		bodyLayer.opacity.setValue();
		bodyLayer.blendingMode=BlendingMode.LINEAR_BURN;
//ターゲットレイヤをハロウレイヤに変換
	haloLayer=targetLayer;
		haloLayer.name="ハロー";
		haloLayer.property("Effects").addProperty("色合い");
		haloLayer.effect.property("色合い").property(1).setValue([1,1,1,1]);
		haloLayer.effect.property("色合い").property(2).setValue([1,1,1,1]);
		var colorLookup="div(add(thisComp.layer(%22%E5%B9%BD%E9%9C%8A%E5%8A%B9%E6%9E%9C%22).effect(%22%E3%83%8F%E3%82%A4%E3%83%A9%E3%82%A4%E3%83%88%22)(%22%E3%82%AB%E3%83%A9%E3%83%BC%22),%5B1,1,1,1%5D),2)";
		haloLayer.effect.property("色合い").property(1).expression=decodeURI(colorLookup);
		haloLayer.effect.property("色合い").property(2).expression=decodeURI(colorLookup);

		haloLayer.effect.property("色合い").property(3).setValue(100);
		haloLayer.property("Effects").addProperty("ブラー(滑らか)");
		haloLayer.effect.property("ブラー(滑らか)").property(1).setValue(200);
		haloLayer.effect.property("ブラー(滑らか)").property(1).expression=decodeURI("thisComp.layer(%22%E5%B9%BD%E9%9C%8A%E5%8A%B9%E6%9E%9C%22).scale%5B0%5D");
		haloLayer.effect.property("ブラー(滑らか)").property(3).setValue(true);
//		haloLayer.

		haloLayer.blendingMode=BlendingMode.SCREEN;

//	undoブロック終了
	app.endUndoGroup();
	}
}
	}
		}
			}
//スクリプト終了
