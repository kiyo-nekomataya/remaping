/*		nas.GUI.addMultiControl(Parent,type,dim,left,top,width,height,option,labelText,defaultValue,minValue,maxValue)

	回転コントロール
複合コントロール
UIに簡易的なコントロールエレメントを設定する
戻り値は拡張メソッドをもったパネルコントロール

コントロールはパネルオブジェクトの中にあらかじめUIが配置されているので簡単に使用できる。

Parent	親オブジェクト
type	コントロールタイプ angle number color position speed
dim	コントロールの次元 1〜5
labelText	ラベルテキスト　(多次元配列の場合は 順次割り当て)
defaultValue	初期値　省略値はタイプ依存　(多次元配列の場合は 順次割り当て　単数の場合は全てに適用)
minValue	スライダの最小値　省略値はタイプ依存　(多次元配列の場合は 順次割り当て　単数の場合は全てに適用)
maxValue	スライダの最大値　省略値はタイプ依存　(多次元配列の場合は 順次割り当て　単数の場合は全てに適用)

left,top	描画位置　ユニットで
widhth,height 	コントロールサイズ ユニットで
option 正規化オプション　trueなら値をスライダの制限値におさめる。初期値は false

	コントロールプロパティ
MultiCntrol.type	文字列　コントロールタイプを表す　初期化時以外書き換え禁止
MultiCntrol.dim	整数　コントロールの次元を表す。　初期化時以外書き換え禁止
MultiCntrol.value	コントロールの現在の値を持つ　多次元コントロールの場合は配列

	コントロールメソッド
MultiControl.set(値[,インデックス])	外部から値を設定するメソッド　数値のみ受付る。多次元モードの場合は配列で与えるか、インデックスで指定できる

タイプごとに初期値・次元数は異なる

----type	次元数	初期値	最小	最大	ラベル
   number	1	0	0	  100	数値 00 01 02 03 ...
      angle	1	0	0	  360	角度(°)01 02 03...
   positon	2	0	0	3000	位置 x y z 01 02 03...
       color	3	0	0	       1	色(rgb) r g b a 00 01 02 ...

次元数は、ユーザの自由だが、コントロール配置は必ず縦方向に行なわれるのであまり多いと使いづらくなるはず

*/
	nas.GUI.addMultiControl=function(Parent,type,dim,left,top,width,height,option,labelText,defaultValue,minValue,maxValue)
	{
		//type別初期値
		defValue=new Object();
		defValue["number"]=[1,0,0,100,["数値"]];
		defValue["angle"]=[1,0,0,360,["角度(°)"]];
		defValue["position"]=[2,0,-3000,3000,["位置","x","y","z"]];
		defValue["color"]=[3,0,0,1,["RGB","r","g","b","a"]];
		//type特定
			if(! type){type="number"};
		//タイプ別に初期値を出す
			if(! dim){dim=defValue[type][0]}else{dim=Math.round(Math.abs(dim))}
			if(! left){left=0};
			if(! top){top=0};
			if((! width)||(width<3)){width=3};
//			if((! height)||(height<(2*dim+1))){height=(2*dim+1)};//最小サイズあり
			if((! height)||(height<dim+1)){height=dim+1};//最小サイズあり
			if(type=="angle"){height+=dim};
			if(! labelText){
				labelText=defValue[type][4];//内部的には配列で統一
			}else{
				if(!(labelText instanceof Array)){	labelText=[labelText]}
			}
			if(labelText.length<(dim+1))
			{var addCount=(dim+3)-labelText.length;
				for(var myCount=1;myCount<=addCount;myCount++)
				{
					labelText.push(nas.Zf(myCount,2));
				}
			}
			if(! defaultValue){	defaultValue=defValue[type][1]};
			if(! minValue){	minValue=defValue[type][2]};
			if(! maxValue){	maxValue=defValue[type][3]};
		//トレーラ（パネル）
		var myMC=nas.GUI.addPanel(Parent,labelText[0],left,top,width,height);
			myMC.valueType=type
			myMC.dim=dim
		//タイプ別各値設定
			if(myMC.dim>1){
				myMC.value        =new Array(dim);
				myMC.minValue  =new Array(dim);
				myMC.maxValue =new Array(dim);
				if(defaultValue instanceof Array){
					//指定値が複数なら　あるだけ順に設定　不足分は規定値で埋める
					for(var idx=0;idx<dim;idx++)
					{
						if(defaultValue.length<idx)
						{
							myMC.value[idx]=defaultValue[idx]
						}else{
							myMC.value[idx]=defValue[type][1]
						}
					}
				}else{
					//値がひとつだけなら全ての要素に適用
					for(var idx=0;idx<myMC.dim;idx++)
					{
							myMC.value[idx]=defaultValue;
					}
				}

				if(minValue instanceof Array){
					//指定値が複数なら　あるだけ順に設定　不足分は規定値で埋める
					for(var idx=0;idx<dim;idx++)
					{
						if(minValue.length<idx)
						{
							myMC.minValue[idx]=minValue[idx]
						}else{
							myMC.minValue[idx]=defValue[type][2]
						}
					}
				}else{
					//値がひとつだけなら全ての要素に適用
					for(var idx=0;idx<dim;idx++)
					{
							myMC.minValue[idx]=minValue;
					}
				}

				if(maxValue instanceof Array){
					//指定値が複数なら　あるだけ順に設定　不足分は規定値で埋める
					for(var idx=0;idx<dim;idx++)
					{
						if(maxValue.length<idx)
						{
							myMC.maxValue[idx]=maxValue[idx]
						}else{
							myMC.maxValue[idx]=defValue[type][2]
						}
					}
				}else{
					//値がひとつだけなら全ての要素に適用
					for(var idx=0;idx<dim;idx++)
					{
							myMC.maxValue[idx]=maxValue;
					}
				}

			}else{
				myMC.value=defaultValue;
				myMC.minValue  =minValue;
				myMC.maxValue =maxValue;
			}

			myMC.isReg=(option)?option:false;
//値テキスト初期化
			var shiftL=(type=="angle")? 1:0;			var spanT=(type=="angle")? 2:1;
	if(dim>1){
					myMC.labelText=new Array();
					myMC.valueText=new Array();
					myMC.valueSlider=new Array();
					myMC.ri=new Array();
for(var idx=0;idx<dim;idx++){
			myMC.labelText[idx]=nas.GUI.addStaticText(myMC,labelText[idx+1].toString(),0,0.2+(idx*spanT),0.5,1);
			myMC.valueText[idx]=nas.GUI.addEditText(myMC,myMC.value[idx].toString(),0.5+shiftL,0.2+(idx*spanT),1,1);
			myMC.valueText[idx].index=idx;
			myMC.valueText[idx].onChange=function()
			{
				if((this.text != this.parent.value[this.index])&&(!(isNaN(this.text))))
				{
					var myValue=this.text*1;
					if(this.parent.isReg)
					{
						if(myValue<this.parent.minValue[this.index]){myValue=this.parent.minValue[this.index]};
						if(myValue>this.parent.maxValue[this.index]){myValue=this.parent.maxValue[this.index]};
					}
					this.parent.set(myValue,this.index);
				}else{this.text=this.parent.value[this.index].toString()}
			}
//値スライダ
			myMC.valueSlider[idx]=nas.GUI.addSlider(myMC,myMC.value[idx],myMC.minValue[idx],myMC.maxValue[idx],1.5,(shiftL)-0.2+(idx*spanT),width-1.5);
			myMC.valueSlider[idx].bounds.height=20;
			myMC.valueSlider[idx].index=idx;
			myMC.valueSlider[idx].onChanging=function()
			{
				if(this.value != this.parent.value[this.index]){		this.parent.set(this.value,this.index)	};
			}
	if(type=="angle"){	
//回転アイコン初期化
		var iconWidth=1;var iconHeight=2;var myFile=new File();
		myMC.ri[idx]=nas.GUI.addIconButton(myMC,"add degrees 45",0.5,0.2+(idx*2),iconWidth,iconHeight,myFile);//rollButton
		myMC.ri[idx].icon=nas.GUI.systemIcons["rot_01"];
		myMC.ri[idx].enabled=true;
		myMC.ri[idx].index=idx;
		myMC.ri[idx].onClick=function(){
			this.parent.set(this.parent.value[this.index]+45,this.index);
		}
	}
}
	}else{
			myMC.valueText=nas.GUI.addEditText(myMC,myMC.value.toString(),shiftL,0.2,1,1);
			myMC.valueText.onChange=function()
			{
				if((this.text != this.parent.value)&&(!(isNaN(this.text))))
				{
					var myValue=this.text*1;
					if(this.parent.isReg)
					{
						if(myValue<this.parent.minValue){myValue=this.parent.minValue};
						if(myValue>this.parent.maxValue){myValue=this.parent.maxValue};
					}
					this.parent.set(myValue);
				}else{this.text=this.parent.value.toString()}
			}
//値スライダ
			myMC.valueSlider=nas.GUI.addSlider(myMC,myMC.value,myMC.minValue,myMC.maxValue,1,shiftL-0.2,width-1);
			myMC.valueSlider.bounds.height=20;
			myMC.valueSlider.onChanging=function()
			{
				if(this.value != this.parent.value){		this.parent.set(this.value)	};
			}
			if(type=="angle"){
//回転アイコン初期化
		var iconWidth=1;var iconHeight=2;var myFile=new File();
		myMC.ri=nas.GUI.addIconButton(myMC,"add degrees 45",0,0.2,iconWidth,iconHeight,myFile);//rollButton
		myMC.ri.icon=nas.GUI.systemIcons["rot_01"];
		myMC.ri.enabled=true;
		myMC.ri.index=idx;
		myMC.ri.onClick=function(){
			this.parent.set(this.parent.value+45);
		}
	}
}
//次元拡張を行なったのでset()メソッドも配列を扱うように拡張が必要
/*
	set( [ 配列 ] )　か　set( 値,ID )　かはたまた両方？
*/
		myMC.set=function(newValue,myIndex)
		{
			if(dim>1){
				if(newValue instanceof Array)
				{
					for(var idx=0;idx<this.dim;idx++){if(newValue.length<idx){this.set(newValue[idx],idx)}}
				}else{
					if(!(isNaN(newValue))){
						if(! myIndex){myIndex=0};
						if(this.isReg){
							if(this.valueType=="angle"){
								this.value[myIndex]=this.value[myIndex]%this.maxValue[myIndex]
							}else{
								if(newValue<this.minValue[myIndex]){newValue=this.minValue[myIndex]}
								if(newValue>this.maxValue[myIndex]){newValue=this.maxValue[myIndex]}
							}
						}
						this.value[myIndex]=newValue;
						if(this.valueText[myIndex].text !=newValue){this.valueText[myIndex].text=this.value[myIndex].toString()};
						if(this.valueSlider[myIndex].value !=newValue){this.valueSlider[myIndex].value=this.value[myIndex]};
//角度アイコンありの時のみ
						if(this.valueType=="angle"){
							if(this.isReg){this.value[myIndex]=this.value[myIndex]%this.maxValue[myIndex]};
							var count=1+(Math.round(((this.value[myIndex]%360)/360)*24)+24)%24;
							this.ri[myIndex].icon=nas.GUI.systemIcons["rot_"+nas.Zf(count,2)];
						}
						this.onChange();//メソッドの最後にonChangeをコール

					}
				}
				//
			}else{
				if(!(isNaN(newValue))){
					if(this.isReg){
						if(this.valueType=="angle")
						{
							this.value=this.value%this.maxValue
						}else{
							if(newValue<this.minValue){newValue=this.minValue}
							if(newValue>this.maxValue){newValue=this.maxValue}
						}
					}
					this.value=newValue;
					if(this.valueText.text !=newValue){this.valueText.text=this.value.toString()};
					if(this.valueSlider.value !=newValue){this.valueSlider.value=this.value};
//角度アイコンありの時のみ
					if(this.valueType=="angle"){
						var count=1+(Math.round(((this.value%360)/360)*24)+24)%24;
						this.ri.icon=nas.GUI.systemIcons["rot_"+nas.Zf(count,2)];
					}
					this.onChange();//メソッドの最後にonChangeをコール
				}
			}
		}
		myMC.onChange=function()
		{
			//空ファンクション　ユーザは上書きできる
			return;
		}
		return myMC;
	}

