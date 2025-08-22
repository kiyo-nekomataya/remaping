/*
	新規ステージ作成
	パネルアプリケーション
	現在の環境でアクティブなXPSをステージにビルドする
	実行前にダイアログパネルを表示して確認を取る
	確認不要なら　XPS.mkStage()を直接呼ぶこと
*/
		if(nas.XPSStore.select()){
			var stgLength=XPS.duration;//フレーム数
			var stgWidth="";
			var stgHeight="";
			var myOptions="";
	var stgName=[XPS.scene,XPS.cut].join("");//この部分をステージ名を生成する関数で置き換えるべき（2010/10/16）
//31バイト制限のためステージ名を前後の余裕を持って（5bitePrefix+myStageName+5bitePostFix "(xxx)NAME tk01"<このくらい）21バイトに制限しておく
	if(nas.biteCount(stgName)>21){stgName=nas.biteClip(stgName,21)};//暫定版　一回指定しそこねたら強制的にちじめる　後ろを切るのでじつはあまり役に立たない
	var myAlign=4;
	if((myOptions)&&(myOptions.match(/align(\d)/i))){myAlign=RegExp.$1*1};
	var getSelection=false;
	if((myOptions)&&(myOptions.match(/select/i))){getSelecton=true};
	var getMap=true;
	if((myOptions)&&(myOptions.match(/nomap/i))){getMap=false};
//呼び出し時点でプロジェクト内のフッテージが選択されていれば、そのフッテージをメンバーとするコンポを組む
//オプションがあればユーザ選択を無視して自動判定（ＭＡＰ検索）する
//メンバーがない場合は処理停止
	var myLength=XPS.duration();
	if( (stgLength)&&(!( isNaN(stgLength) )) ){myLength=Math.floor(stgLength*1)};
	var myResolution=(nas.inputMedias.selectedRecord[3]*1);
	if( (stgResolution)&&(!( isNaN(stgResolution) )) ){myResolution=(stgResolution*1)};
//入力メディアから初期値を作成する幅や高さの指定があれば上書き。引数をフラグにしてあとで自動判定の際に処理をスキップ
	var myFrameAspect=eval(nas.inputMedias.selectedRecord[2]);
	var myWidth=Math.ceil((nas.inputMedias.selectedRecord[1]/2)*(nas.inputMedias.selectedRecord[3]/25.4))*2;
	var myHeight=Math.ceil(myWidth/(myFrameAspect*2))*2;

	if( (stgWidth)&&(!( isNaN(stgWidth) )) ){myWidth=Math.ceil(stgWidth*(2*myResolution/25.4))*2};
	if( (stgHeight)&&(!( isNaN(stgHeight) )) ){myHeight=Math.ceil(stgHeight*(2*myResolution/25.4))*2};
//BG取込オプション
	var bgOpt=null;
	if((myOptions)&&(myOptions.match(/bg(\d)/i))){bgOpt=RegExp.$1*1};

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++GUI*/
var w=nas.GUI.newWindow("dialog","ステージ作成",8,12);
w.msg=nas.GUI.addStaticText(w,"タイムシートをステージにビルドします。"+nas.GUI.LineFeed+"必要に従ってパラメータを変更してください。コンポ名はシートを編集すると変更できます。",0,0,8,2);

w.stage=nas.GUI.addStaticText(w,"Stage-sig :"+stgName +" ( "+nas.Frm2FCT(myLength,3)+")",0,2,6,1);

	w.stgResolutionlb=nas.GUI.addStaticText(w,"resolution(dpi) :",0,3.5,2,1);
	w.stgResolution=nas.GUI.addComboBox(w,[myResolution,2,3,4,5],"0",2,3,4,1);

	w.stgWidthlb=nas.GUI.addStaticText(w,"width(pixel) :",0,4.5,2,1);
	w.stgWidth=nas.GUI.addComboBox(w,[myWidth,2,3,4,5],"0",2,4,4,1);

	w.stgHeightlb=nas.GUI.addStaticText(w,"height(pixel) :",0,5.5,2,1);
	w.stgHeight=nas.GUI.addComboBox(w,[myHeight,2,3,4,5],"0",2,5,4,1);














//---------------------------------
w.show()
}