/**
 *@fileoverview	nas配下に基礎オブジェクト拡張
 *
 *基礎オブジェクト群は、基底プロパティの記述に使用するので最終的には従来のnas_common.jsよりも先にロードする必要がある。
 *又は基礎オブジェクトとしてnas_common.jsに編入
 *
 *現在はnas_common.jsよりも後にロードされている
 *
 *デバッグ終了後は、ロード順位が入れ替わるので注意
 *相互依存を考慮してマージ
 *または、基底プロパティをオブジェクト化しないメソッドを考慮すること 24-06 2016
 *
 *
 *単位付きカプセル化オブジェクトでは、演算の際に期待する値を確実に得るためには Object.as(Unit)で明示的に単位を指定すること
 *
 */

//UnitValuで利用可能な単位 px/pixels を与えるとその時点での基底解像度で処理してpointに換算、pxとしての保存は行わない
nas.UNITRegex=new RegExp('^(in|inches|mm|millimeters|cm|centimeters|pt|picas|points|mp|millipoints)$','i');

/*=============================================================================================再利用メソッド*/
//不正単位系の処理を追加　07-04 2016
/**
	common method
*/
nas.UNITString	=function(){return ([this.value,this.type]).join(' ');};
nas.UNITValue	=function(){return this.value;};
nas.UNITAs	=function(myUnit){return nas.decodeUnit(this.toString(),myUnit)};
nas.UNITConvert	=function(myUnit){this.value=nas.decodeUnit(this.toString(),myUnit);this.type=myUnit;return this;};

nas.ANGLEAs	=function(myUnit){
		var targetUnit=(myUnit.match(/^(d|degrees|°|度|)$/))?"degrees":"radians";
		if(targetUnit==this.type){
			return this.value
		}else{
			return (targetUnit=="degrees")? radiansToDegrees(this.value):degreesToRadians(this.value);
		}
	};
nas.ANGLEConvert=function(myUnit){
		var targetUnit=(myUnit.match(/^(d|degrees|°|度|)$/))?"degrees":"radians";
		this.value=(targetUnit=="degrees")? radiansToDegrees(this.value):degreesToRadians(this.value);
		this.type=targetUnit;
		return this;
	};
nas.RESOLUTIONAs	=function(myUnit){
		var targetUnit=(myUnit.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))? RegExp.$1:'dpi';
		if(targetUnit.slice(1)==this.type.slice(1)){
			return this.value
		}else{
			return (targetUnit.indexOf('pc')<0)? this.value*2.540:this.value/2.540;
		}
	};
nas.RESOLUTIONConvert=function(myUnit){
		var targetUnit=(myUnit.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))? RegExp.$1:'dpi';
		this.value=(targetUnit.indexOf('pc')<0)? this.value*2.540:this.value/2.540;
		this.type=targetUnit;
		return this;
	};
nas.LISTString=function(myUnit){
		if(typeof myUnit == "unidefined"){myUnit=false;}
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){
		  if(myUnit){
			myResult.push(this[this.props[myDim]].as(myUnit));
		  }else{
			myResult.push(this[this.props[myDim]].toString());
		  }
		}
		return myResult.join();//リスト文字列で
	};
nas.ARRAYValue	=function(myUnit){
		if(typeof myUnit == "unidefined"){myUnit=false;}
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){
		  if(myUnit){
			myResult.push(this[this.props[myDim]].as(myUnit))
		  }else{
			myResult.push(this[this.props[myDim]].value)
		  }
		}
		return myResult;//配列で
	};
/**
 * 	nas.UnitValue Object
 * コンストラクタ:
 * 	new nas.UnitValue("値"[,"単位"]);
 * 引数:
 * 	値　String 単位つき文字列または数値文字列又は数値
 * 	単位 String 単位を文字列で　省略可　省略時は'pt'
 * 
 * 例　	new nas.UnitValue("値"[,"単位"]);
 * 
 * 	A = new nas.UnitValue("123","mm");
 * 	A = new nas.UnitValue("-72pt","in");
 * 	A = new nas.UnitValue(25.4,"cm");
 * 	A = new nas.UnitValue("うさぎ",'カメ');// {value: 0, type: "pt"}
 * 	A = new nas.UnitValue('125 degree');// {value: 0, type: "pt"}
 * 
 * 単位が指定されない場合は第一引数の単位を使用、異なる場合は第一引数の値を第二引数の単位へ変換してオブジェクト化する
 * どちらも無効な場合は、第一引数の数値部分をpointで換算
 * 無効な単位系で初期化された場合は単位系を無効のまま数値のみ初期化して　無効単位系に対する要求はptで代用する？＜estk互換
 * 無効な値で初期化された場合は値を0に設定する。＜estk互換
 *  (Adobe Extend Script 準拠)
 * 有効な単位は	in,inches,mm,millimeters,cm,centimeters,pt,picas,points,mp,millipoints
 * 
 * オブジェクトメソッド：
 * 
 * nas.UnitValue.as("単位文字列")	指定された単位文字列に変換した数値を返す
 * nas.UnitValue.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す
 * 
 * nas.UnitValue=function(myNumberString,myUnitString){
 * 	this.value=0;
 * 	this.type='pt';
 * }
 */
nas.UnitValue=function(myNumberString,myUnitString){
	if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\+\-\.\s0-9]/g,'')
	}else{
		var myNumberUnit='';//第一引数が文字列以外
		myNumberString=new String(myNumberString);
	};
	if(arguments.length<2){myUnitString=myNumberUnit;}
	if(!(myUnitString.match(nas.UNITRegex))) myUnitString="pt";// 

	this.value=(myNumberUnit=='')?parseFloat(myNumberString):nas.decodeUnit(myNumberString,myUnitString);
	if((! this.value)||(isNaN(this.value))){this.value=0.000000;}

	this.type=myUnitString;
}

nas.UnitValue.prototype.as	=nas.UNITAs;
nas.UnitValue.prototype.convert	=nas.UNITConvert;
nas.UnitValue.prototype.toString=nas.UNITString;
nas.UnitValue.prototype.valueOf	=nas.UNITValue;

/*	test
 *	A=new nas.UnitValue("125","mm");//2引数初期化
 *	B=new nas.UnitValue("125mm","cm");//2引数初期化
 *	C=new nas.UnitValue("5in");//1引数初期化
 *	D=new nas.UnitValue(-123,"mm");//数値初期化
 *	E=new nas.UnitValue("たぬきさん","mm");//不正値初期化
 *	console.log(A);
 *	console.log(B);
 *	console.log(C);
 *	console.log(D);
 *	console.log(E);
 *	console.log("A+B = ",A+B);
 *	//これは誤った答えが戻る。が、使い方を誤っているのでそれで正常
 *	console.log(A.as("mm")+B.as("mm"));
 *	//確実な値が必要な場合は .as(単位)で値を求める
 *	//直接演算でUnitValeが戻ることは無い
 *	
 */
/**	nas.UnitAngle
コンストラクタ	nas.UnitAngle("値"[,"単位"])
引数:
	値	Number or String 単位付き数値または数値
	単位	 String 単位文字列省略可能

使用可能な値は　/^(d|degrees|°|度|)$/)
指定値以外または単位なしで初期化された場合は radians
単位変換機能付き
例:	A=new nas.UnitAngle("180 degrees","radians");//	180度相当の値がラディアンで格納される
	A=new nas.UnitAngle(1);//1 rad
	A=new nas.UnitAngle("27.4 d");//27.4 degrees　として格納

オブジェクトメソッド:
nas.UnitAngle.as("単位文字列")	指定された単位文字列に変換した数値を返す
nas.UnitAngle.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す
*/
nas.UnitAngle=function(myNumberString,myUnitString){
	if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\.\s0-9]/g,'')
	}else{
		var myNumberUnit='';//第一引数は未指定
		myNumberString=new String(myNumberString);
	};
	if(arguments.length<2){myUnitString=myNumberUnit;};
//	if(! myUnitString){myUnitString=myNumberString.replace(/[\.\s0-9]/g,'')};
	if(myUnitString.match(/^(d|degrees|°|度|)$/)){myUnitString='degrees'}else{myUnitString='radians'};
	this.value=((myNumberUnit=='')||(myUnitString==myNumberUnit))?parseFloat(myNumberString):
	(myUnitString=="degrees")?nas.radiansToDegrees(parseFloat(myNumberString)):nas.degreesToRadians(parseFloat(myNumberString));
	if(isNaN(this.value)){this.value=0.000000;}
	this.type=myUnitString;
//	this.objName="UnitAngle";
}
nas.UnitAngle.prototype.as	=nas.ANGLEAs;
nas.UnitAngle.prototype.convert	=nas.ANGLEConvert
nas.UnitAngle.prototype.toString=nas.UNITString;
nas.UnitAngle.prototype.valueOf	=nas.UNITValue;
/*
	nas.UnitResolution Object
コンストラクタ　単位付き解像度オブジェクト
	new nas.UnitResolution("解像度"[,"単位"])

引数:	解像度　String or Number 単位付き文字列または数値
	単位	String	単位を文字列で
	双方が異なっていれば指定単位に換算
	指定可能な単位は (/dpi|ppi|lpi|dpc|ppc|lpc/i)　実質は2種　デフォルトは dpc
	無効値で初期化された場合は　72dpi相当の密度に設定する(nas標準値か？)
	値0はどの単位系でも発散が起きるのでダメ　これも値を矯正する

例:	new Resolution('120dpi','dpc');
	new Resolution( 50,'dpc');
	new Resolution('200 dpi');

オブジェクトメソッド:
nas.UnitResolution.as("単位文字列")	指定された単位文字列に変換した数値を返す
nas.UnitResolution.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す

*/
nas.UnitResolution=function(myNumberString,myUnitString){
	if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\.\s0-9]/g,'')
	}else{
		var myNumberUnit='dpc';
		myNumberString=new String(myNumberString);
	};
	if(arguments.length<2){myUnitString=myNumberUnit;};
	if(! (myUnitString.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))){myUnitString='dpc'};
	this.value=(myUnitString==myNumberUnit)?parseFloat(myNumberString):
	(myUnitString.indexOf('pc')<0)?parseFloat(myNumberString)*2.540:parseFloat(myNumberString)/2.540;
//	if((isNaN(this.value))||(this.value<=0)){this.value=(myUnitString.indexOf('pc')<0)?72.:72./2.540;};
	if((isNaN(this.value))||(this.value<=0)){this.value=(myUnitString.indexOf('pc')<0)?nas.RESOLUTION*2.540:nas.RESOLUTION;};
	this.type=myUnitString;
//	this.objName="UnitResolution";
}
nas.UnitResolution.prototype.as		=nas.RESOLUTIONAs;
nas.UnitResolution.prototype.convert	=nas.RESOLUTIONConvert;
nas.UnitResolution.prototype.toString	=nas.UNITString;
nas.UnitResolution.prototype.valueOf	=nas.UNITValue;
/*================================  以下は単位付き数値オブジェクトを要素に持つ複合オブジェクト===============*/
/**
	座標オブジェクト
コンストラクタ:
	new nas.Point(x[,y[,z]])
1次元、2次元、3次元の値が初期化可能
引数は UnitValueまたは文字列で

第一引数の持つ単位を、代表単位として保存するが、オブジェクトの生成後に他の単位を設定することが可能

または
	new nas.Point(nas.Point)
第一引数がnas.Point　オブジェクトだった場合は、そのオブジェクトの複製を初期化する

または
	new nas.Point(値リスト/配列[,単位])
値リストでの初期化も可能　多くの実装で配列形式の座標を扱うので互換をもたせるものとする
　myPoint=new nas.Point([myX,myY]);
　myPoint=new nas.Point([0,128,255],"pt");

Point.length　で次数が取得できる

プロパティはUnitValue
引数が数値ならばptとして初期化する
与えられない次数の値を0として扱うことが可能
引数なしの場合は2次元 ["0pt","0pt"] で初期化される

	プロパティ
nas.Point.length	Int　整数　保持している値の次数
nas.Point.x	UnitValue x座標値
nas.Point.y	UnitValue y座標値
nas.Point.z	UnitValue z座標値
nas.Point.type String 単位

数値で値を得る場合は各プロパティのas()メソッドを使用のこと

例： [myPoint.x.as('pt'),myPoint.y.as('pt')]

オブジェクトメソッド:
nas.Point.toString([指定単位])	;指定単位に揃えてリストで返す
nas.Point.valueOf([指定単位])	;指定単位にそろえて配列を戻す
単位指定がない場合は、登録された単位で返す

nas.Position は古いので　nas.Pointを使えやゴルァ
コンストラクタと初期化クラスメソッドを割ったほうが良いかも？

*/
nas.Point=function(x,y,z){
	this.props = ['x','y','z'];
	this.x = new nas.UnitValue('0 pt');
	this.y = new nas.UnitValue('0 pt');
	this.z;
	this.length = 2;
	this.type="pt";
}
nas.Point.prototype.toString=nas.LISTString;
nas.Point.prototype.valueOf =nas.ARRAYValue;

nas.newPoint=function(){
//	this.props=['x','y','z'];
	if(arguments.length == 0){
		arguments=[new nas.UnitValue('0 pt'),new nas.UnitValue('0 pt')];
	}
	//第一引数がポイントオブジェクトであれば、その複製を返す
	if(arguments[0] instanceof nas.Point){
		return Object.create(arguments[0]);
	}
		var newPoint= new nas.Point();//戻り値用新規Point
	//第一引数が配列なら配列内容からポイントを作成して戻す
	if(arguments[0] instanceof Array){
		if(arguments[0].length == 1) return newPoint;//配列要素数0ならデフォルトオブジェクトで戻す
		newPoint.length=(arguments[0].length > 3)? 3:arguments[0].length;
		//DimensionLength==Array.length 3以下に限定
		var myType=(typeof arguments[1] == "undefined")? false :arguments[1];
		for(var myDim=0;myDim<3;myDim++){
			if(myDim >= newPoint.length){newPoint[newPoint.props[myDim]] = undefined;continue;}
			
			if(arguments[0][myDim] instanceof nas.UnitValue){
		    	newPoint[newPoint.props[myDim]]  =arguments[0][myDim];
	  		}else{
	  	  		newPoint[newPoint.props[myDim]] =(myType)?
	  	  		new nas.UnitValue(arguments[0][myDim],myType):new nas.UnitValue(arguments[0][myDim]);
	  		}
		}	
	}else{
		newPoint.length=(arguments.length > 3)? 3:arguments.length;
		//DimensionLength==引数の次数 | 3 以下に限定
		for(var myDim=0;myDim<3;myDim++){
			if(myDim >= newPoint.length){newPoint[newPoint.props[myDim]] = undefined;continue;}
	  		if(arguments[myDim] instanceof nas.UnitValue){
	   			newPoint[newPoint.props[myDim]]  =arguments[myDim];
	  		}else{
	    		newPoint[newPoint.props[myDim]]  =new nas.UnitValue(arguments[myDim]);
	  		}
		}
	}
	newPoint.type=newPoint.x.type;
	return newPoint;
}
/** test
	A= new nas.Point();//原点初期化

	myX= new nas.UnitValue("12mm");
	myY= new nas.UnitValue("25.4mm");
	myZ= new nas.UnitValue("-36mm");
	
	B= nas.newPoint(A);
	C= nas.newPoint(myX,myY,myZ);
	D= nas.newPoint([myX,myY,myZ]);
	E= nas.newPoint([myX,myY],'in');
	F= nas.newPoint('12cm','2.54cm','30mm');
	G= nas.newPoint(['12cm','2.54cm','30mm']);
	H= nas.newPoint(['12cm','2.54cm','30mm'],'in');

	I= nas.newPoint(['12cm']);

	console.log (A.toString());
	console.log (B.toString());
	console.log (C.toString());
	console.log (D.toString());
	console.log (E.toString());
	console.log (F.toString());
	console.log (G.toString());
	console.log (H.toString());
	console.log (I.toString());

 */
/**
 * 	位置オブジェクト
 * 	
 * 位置オブジェクトは、座標オブジェクトを主たるデータとして位置プロパティを保持する複合オブジェクト
 * 
 * コンストラクタ:
 * 	new nas.Position(x,y[,z])
 * 2次元、3次元の値が初期化可能
 * 引数は UnitValueまたは文字列、Pointオブジェクトの初期化に準ずる
 * Pointオブジェクトを与えて初期化することも可能？
 * 
 * Position.point.length　で次数が取得できる
 * 
 * プロパティはUnitValue
 * 引数が数値ならばptとして初期化する
 * 与えられない次数のプロパティは0として扱うことが可能
 * 引数なしの場合は2次元["0pt","0pt"]で初期化される
 * 
 * 	プロパティ
 * nas.Position.point	Object nas.Point　保持している座標の値
 * nas.Position.x	UnitValue   x座標値 this.point.x
 * nas.Position.y	UnitValue   y座標値 this.point.y
 * nas.Position.z	UnitValue   z座標値 this.point.z
 * nas.Position.c	arcCurve    初期値 undefined 
 * nas.Position.t	timingCurve 初期値 undefined
 * 
 * プロパティc,tは 各座標のプロパティとして付帯することも可能
 * 
 * nas.Position.toString([指定単位])  ;指定単位に揃えてリストで返す
 * nas.Position.valueOf([指定単位])   ;指定単位にそろえて配列を戻す
 * 単位指定がない場合は、登録された単位で返す
 * 
 * 引数なしの初期化を廃して、コードを整理したほうが良いかも？
 * 
 */
nas.Position=function(x,y,z){
	if(arguments.length==0){
		arguments=[new nas.UnitValue('0 pt'),new nas.UnitValue('0 pt')];
	}
	this.point=nas.newPoint(arguments);
    this.length=this.point.length;
	this.props=['x','y','z'];
	this.x=this.point.x;
	this.y=this.point.y;
	this.z=this.point.z;
/*
	for(var myDim=0;myDim<this.length;myDim++){
//		alert(myDim +":"+arguments[myDim]);
	  if(arguments[myDim] instanceof nas.UnitValue){
	  	alert(this.props[myDim]);
	    this[this.props[myDim]]  = arguments[myDim];
	  }else{
	    this[this.props[myDim]]  =new nas.UnitValue(arguments[myDim]);
	  }
	}
*/
	this.type=this.x.type;
}
nas.Position.prototype.toString=nas.LISTString;
nas.Position.prototype.valueOf =nas.ARRAYValue;

//nas.Position objectはPointオブジェクトに換装

/*
	 オフセットオブジェクト
オフセットを利用するための複合オブジェクト
positionとorientationを組み合わせたもの
初期化の引数は位置オブジェクトと方向オブジェクトで
*/
nas.Offset=function(myPos,myOrt){
	this.position=myPos;
	this.orientation=myOrt;
	this.x=this.position.x;
	this.y=this.position.y;
	this.r=this.orientation.rotationZ;
}
/*
	ベクトルオブジェクト
コンストラクタ:
	new nas.Vector(終点[,始点][,単位])
1次元、2次元、3次元の値が初期化可能
引数
	終点・始点　/nas.Point
	単位文字列

引数の次元のうち次数の高い方に合わせたVectorを初期化する
Vector.dimension　で次数が取得できる
単位文字列が指定されなかった場合は、第一引数の単位を使用する

プロパティは　nas.Point
与えられない次数のプロパティは0として扱う

引数なしの場合はデフォルトの単位値で原点を始点とする２次元の単位ベクトルを戻す

	プロパティ

nas.Vector.dimension	Int　整数　保持している値の次数1～3
nas.Vector.origin	Point 始点座標
nas.Vector.value	Point ベクトル値(=終点座標-始点座標)
nas.Vector.type	String　単位文字列

始点を省略した場合は、原点を始点に置く
オブジェクトメソッド:
nas.Vector.toString([指定単位])	;指定単位に揃えて数値をコンマ区切りリストで返す
nas.Vector.valueOf([指定単位])	;指定単位にそろえて数値配列を戻す

*/
nas.Vector=function(endPoint,startPoint,myUnit){
	if(arguments.length==0){
		this.dimension=2;
		this.origin=new nas.Point('0 pt','0 pt');
		this.value=new nas.Point('1 pt','1 pt');
		this.type="pt";
	}else{
		this.type=(arguments.length>2)? myUnit:endPoint.type;
		if(arguments.length>1){
			this.dimension=(startPoint.dimension>endPoint.dimension)?startPoint.dimension:endPoint.dimension;
		}else{
			this.dimension=endPoint.dimension;
			startPoint=new nas.Point(([0,0,0,0]).slice(0,this.dimension),this.type);
		}
		if(this.dimension>startPoint.dimension){
			this.origin=new nas.Point((startPoint.toString(this.type)+',0,0').split(',').slice(0,this.dimension),this.type);
		}else{
			this.origin=new nas.Point(startPoint.valueOf(this.type),this.type);
		}
		this.value=new nas.Point(nas.sub(endPoint.valueOf(this.type),this.origin.valueOf(this.type)),this.type);

		this.props=['origin','value'];
	}
}
nas.Vector.prototype.toString=nas.LISTString;
nas.Vector.prototype.valueOf =nas.ARRAYValue;
/**
	回転オブジェクト
	引数一つで初期化された場合は、ｚ軸回転
	それ以上の場合は、3軸の回転となる
	回転の解決順は z-y-x
コンストラクタ
	new nas.Rotation([x,y,] z)
引数はUnitAngleまたは文字列

*/
nas.Rotation=function(){
	if(arguments.length==0){
		arguments[0]=new nas.UnitAngle('0 radians');//記述がない場合はz軸のみで初期化
	}
	this.length=arguments.length;//DimensionLength
	this.props=["rotationZ","ritationY","rotationX"];
	if(this.length==1){
	  this.rotationZ=(arguments[0] instanceof nas.UnitAngle)? arguments[0]:new nas.UnitAngle(arguments[0]);
	  this.rotationY=new nas.UnitAngle('0 radians');
	  this.rotationX=new nas.UnitAngle('0 radians');
	}else{
	  for(var myDim=0;myDim<this.length;myDim++){
	    if(arguments[myDim] instanceof nas.UnitAngle){
	      this[this.props[myDim]]=arguments[myDim];
	    }else{
	      this[this.props[myDim]]=new nas.UnitAngle(arguments[myDim]);
	    }
	  }
	}
}
nas.Rotation.prototype.toString=nas.LISTString;
nas.Rotation.prototype.valueOf =nas.ARRAYValue;

/*
	方向オブジェクト
	引数一つで初期化された場合は、ｚ軸指定
	それ以上の場合は、3軸指定となる
	回転の解決順は z-y-x
コンストラクタ
	new nas.Orientation([x,y,] z)
引数はUnitAngleまたは文字列

*/
nas.Orientation=function(){
	if(arguments.length==0){
		arguments[0]=new nas.UnitAngle('0 radians');//記述がない場合はz軸のみで初期化
	}
	this.length=arguments.length;//DimensionLength
	this.props=["orientationX","orientationY","orientationZ"];
	if(this.length==1){
	  this.rotationZ=(arguments[0] instanceof nas.UnitAngel)? arguments[0]:new UnitAngle(arguments[0]);
	  this.rotationY=new nas.UnitAngle('0 radians');
	  this.rotationX=new nas.UnitAngle('0 radians');
	}else{
	  for(var myDim=0;myDim<this.length;myDim++){
	    if(arguments[myDim] instanceof nas.UnitAngle){
	      this[this.props[myDim]]=arguments[myDim];
	    }else{
	      this[this.props[myDim]]=new nas.UnitAngle(arguments[myDim]);
	    }
	  }
	}
}
nas.Orientation.prototype.toString=nas.LISTString;
nas.Orientation.prototype.valueOf =nas.ARRAYValue;

/*	フレームレートオブジェクト
コンストラクタ
	new nas.Framerate(rateString[,rate])?
引数:
	reteString String フレームレート文字列
	rate Number 省略可能　実フレームレート
	フレームレート文字列は任意　24FPS 25FPS等の\dFPS の場合はその数値を利用
	またはキーワード SMPTE(NDF),SMPTE60(NDF),SMPTE24NDF　で各 30/1.001 60/1.001 24/1.001 をセットする
	NDFをキーワードに含む場合はNDFコードを使用する
	フレームレート文字列に数値が含まれているかまたはキーワードの場合は、第二引数を省略可能
	不正な引数で初期化された場合は、クラスプロパティを使用する
初期化メソッドは、以下の動作に変更
	単一引数の場合
引数文字列を数値パースしてフレームレートを取得して、文字列自体をnameに設定
二つ以上の場合は、第一引数がname,第二引数がフレームレート
第一引数が数値のみの場合は"FPS”を補うが、それ以外の場合は文字列全体をnameとする
	
*/
//nas.Framerate={name:"24FPS",rate:24};

nas.Framerate=function(){
	this.name="24FPS";
	this.rate=24;
};

nas.Framerate.prototype.toString=function(){return this.name;}
nas.Framerate.prototype.valueOf=function(){return this.rate;}
nas.newFramerate=function(rateString,rate){
//	var newOne=Object.create(nas.Framerate);
	var newOne=new nas.Framerate();
	if(arguments.length){
	  if(arguments.length>1){
	    newOne.name=rateString;
	    newOne.rate=parseFloat(rate);
	  }else{
	      newOne.name=rateString;
	    if(rateString.indexOf('PAL')>=0){
	      newOne.rate=25.
	    }else{
	      if(rateString.indexOf('SMPTE')>=0){
	      switch(rateString){
	case	"SMPTE24":	newOne.rate=24/1.001;break;
	case	"SMPTE60":
	case	"SMPTE60NDF": newOne.rate=60/1.001;break;
	default	:          newOne.rate=30/1.001;break;
	        }
	      }else{
	        newOne.rate=parseFloat(rateString.replace(/^[^-\d]+/,""));
	      }
	    }
	  }
	}
	if(!(newOne.rate)){alert(newOne.rate);delete newOne.rate;delete newOne.name;}
	return newOne;
}

/*
	サイズオブジェクト
コンストラクタ
	new nas.Size(width,height[,depth])
引数は
	UnitValue	/	width,height,depth


	TimingCurve	/	timing	
引数がない場合は単位"pt"でサイズ 72x72　二次元のオブジェクトを初期化

コンストラクタでタイミングカーブを初期化する必要は無い
Size オブジェクトはPointを中核データとしたサイズを扱うオブジェクト

Size
	.x(width)
	.y(height)
	.z(depth)
size Object出力書式
form1:
    125mm,254mm
form2:
    size.X = 125mm
    size.Y = 254mm
*/
nas.Size=function(){
	if(arguments.length==0){
		arguments=[new nas.UnitValue("72 pt"),new nas.UnitValue("72 pt")];
	}
	this.length=arguments.length;//DimensionLength
	this.props=["x","y","z"];
	for(var myDim=0;myDim<this.length;myDim++){
		 this[this.props[myDim]]  =new nas.UnitValue(arguments[myDim]);
	}

	this.toString=function(opt){
    		var myResult=[];
	    if(! opt){
	    	for(var myDim=0;myDim<this.length;myDim++){
		        myResult.push(this[this.props[myDim]].toString())
		    }
		    return myResult.join(",");
		}else{
	    	for(var myDim=0;myDim<this.length;myDim++){
		        myResult.push("\tsize."+this.props[myDim] +" = "+this[this.props[myDim]].toString());
		    }
		    return myResult.join("\n");
		}
	};
	this.valueOf=function(asUnit){
		if(typeof asUnit == 'undefined') asUnit=this.type;
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){myResult.push(this[this.props[myDim]].as(asUnit))}
		return myResult;
	};
}

/* 
Position（座標）クラス
Vectorオブジェクト


1次元のVevtorはbool / 2次元のVectorは 1次元のOrientation（Z）/ 3次元のVeltorは 3次元のOrientation (XYZ)を持つ
プロパティで持たせるか、またはラムダ関数で導くか？　アクセス頻度？

*/
/*
Curve　Object
new nas.Curve(point1,point2,isAbs)
アークを指定するための複合Object
座標系のObjectに持たせるcurveプロパティの値
自分自身の座標を始点としてベジェの第一制御点と第二制御点を相対座標で持たせる
終点はタイムシート上に次に出現する値
したがって次の区間に値が存在しない場合は、指定自体が意味を失う
指定が絶対座標であった場合は、 親オブジェクト側で座標系の変換を行い相対座標にして格納する
カーブデータを必要とする区間は、直前の区間のカーブ値と直後の区間の値を参照する。
値を持っていてもカーブプロパティを持たないエントリがあっても良い
その場合は、標準値で補う
C=new Curve( new Point(0,0),new Point(1,1))
*/
nas.Curve=function(){
	this.parent;
	this.ctlrpt1;
	this.ctlrpt2;
}
/*
　TimingCurve　Object
　タイミング指定をするための配列ベースのObject
値を持つObjectに全て持たせることが可能
値は二次元に限定 / 値範囲は0-1に限定
始点を[0,0] 終点を[1,1]と置いて第一制御点と第二制御点を少数値で与える

キーワード文字列で初期化された場合、ライブラリ内にキーワードに対応する値が存在するならテキストを値として実際の値はクラスライブラリを参照する。
タイミングを解決するのは、値を持ったObjectの直後の中間値補間区間

T=new TimingCurve("linear"); //	戻値[[0,0],[1,1]]
nas.TimingCurve=function(){
	this.
}
.parent タイミングカーブが適用されるプロパティを与える
.ctlrPtは自身の配列要素を使用

*/
nas.TimingCurve=function(){
	this.parent;
	this.name;
	this.push([0,0]);this.push([1,1]);//デフォルトのlinearタイミング
}
/*
	リニアタイミング（均等タイミング）	0	0	1	1
	イーズ（両詰め）	0.5	0	0.5	1
	イーズアウト（前詰め）	0.5	0	1	0.5
	イーズイン（後詰め）	0	0.5	0.5	1
	クイック（極端な両詰め）	1	0	0	1
	クイックアウト（極端な前詰め）	1	0	1	0
	クイックイン（極端な後詰め）	0	1	0	1
	ステイ（中詰め）	0	0.5	1	0.5
	ステイストロング(極端な中詰め)	0	1	1	0
*/
nas.TimingCurve.keyWords={
	"linear":    [[  0,  0],[  1,  1]],
	"ease":      [[0.5,  0],[0.5,  1]],
	"easeOut":   [[0.5,  0],[  1,0.5]],
	"easeIn":    [[  0,0.5],[0.5,  1]],
	"quick":     [[  1,  0],[  0,  1]],
	"quickOut":  [[  1,  0],[  1,  0]],
	"quickIn":   [[  0,  1],[  0,  1]],
	"stay":      [[  0,0.5],[  1,0.5]],
	"stayStrong":[[  0,  1],[  1,  0]]
};


nas.TimingCurve.prototype =Array.prototype;
/*
nas.AnimationPeg Object
nasペグシステムでサポートするペグオブジェクト

以下のペグをサポートする
0:表示のないペグ　角合せ及び中央合せ	中央合わせがデフォルト値
	0:中央合せ
	1:左下合せ(ステージ第一象限)
	2:左上合せ(ステージ第二象限)
	3:右上合せ(ステージ第三象限)
	4:右下合せ(ステージ第四象限)
	5:他任意の位置
	プリセットで色々作る
　各ポイントは、ペグ（レジストレーション点）として扱う
	可視、不可視の属性を持ち、外見プロパティを持たせることができる。
	外見プロパティの登録がない場合簡易表示として、レジストリシンボルを使う
　エレメントグループ内部のみで角合わせを行うとレジストレーション点が画面中央で初期化されたりするが通常の動作である
　必要に従って、新たなタップを作成（ステージにタップ＝カメラワークフレームを設定＝設置）して其処にジオメトリネットワークを構築する
　実物線画台と異なり同じ位置に別のタップが置ける　干渉は無い

外見プロパティは以下から選択できるように設定
0:不可視、表示の際はシンボルで
1:ACME	ACME があれば問題ないと思う
2:丸あな2穴	穴径及び間隔は別に設定　またはシンボル
3:丸あな3穴	タイプはASAのみ用意する　ほかはいらん

ペグ（レジストレーション）システムとして考えた場合　角合せも中央整列もペグの位置指定と同じ
フレームからのレジストレーション点オフセットのデータ書式は同じ　→　ケースわけしない
レジストレーション代表点は、ペグの場合各ペグの中心（ACMEならセンターホール中心）、０番系列はポイントそのもの
向きはエレメントグループ内で揃っていれば同じ
データ上のオフセットは、レジストリ点のローカル座標とローテーション
pegオフセットは、フレーム中心からのペグ（レジストレーション点）のオフセットとローテーション

したがってフレーム中心のローカル座標は　sub(offset,pegOffset)となる。

基本構成は同じだが、AnimationPegはオブジェクトでなく　AnimationFrameオブジェクトのプロパティとして実装してそのプロパティの一部としてPegFormを設定する。
これがペグの外形を保持するように実装

オフセットプロパティ群の関連は以下のリスト

 GeometryOffset　オブジェクト　基底クラスオブジェクト
 位置オフセット+回転（オリエンテーション）値で成立する　回転に際して正規化が発生する

offset
	セルエレメントのローカル座標内のペグ位置オフセット
pegOffset
	プロパティとしては親座標系内のペグ位置
	デフォルトで使う限りは親がステージなのでワールド座標系での位置になる
	ネットワーク構築時のネスト時の親に注意
	乗り換え操作の際は、一旦ステージまでさかのぼってコンバートする方針で実装
frameOffset
	ペグ位置に対するフレームのオフセット
	エレメント（ローカル）座標系で記録する
*/
/*
myPeg =new nas.AnimationPegForm(pegForm)

*/
nas.AnimationPegForms={
	"invisible":0,
	"ACME":1,
	"jis2hales":2,
	"us3hales":3
}
nas.AnimationPegForm=function(pegName){
	this.name=pegName;//"invisible","ACME","jis2hales","ansi3holes"
}
nas.AnimationPegForm.prototype.toString=function(){return this.name;}
nas.AnimationPegForm.prototype.valueOf=function(){return nas.AnimationPegForms[this.name];}

nas.GeometryOffset=function(myPoint,myRotation){
	this.position=(myPoint)?myPoint:new nas.Point();
	this.x=this.position.x;
	this.y=this.position.y;
	this.rotation=(myRotation)?myRotation:new nas.Rotation();
	this.r=this.rotation.rotationZ;
}
/*
nas.AnimationField Object
作画アニメーションフレームを保持するオブジェクト
クリッピングフレーム（カメラワークオブジェクト）の基底クラス
10インチ標準フレームは、
	new nas.AnimationFrame(
		"10inSTD",
		new nas.UnitValue("720 pt"),
		16/9,
		myOffset =nas.GeometryOffset(new nas.Position("0mm","105mm"),new nas.Rotation(0))
	);

*/
nas.AnimationField=function(myName,baseWidth,frameAspect,scale,peg,pegOffset){
	this.name=(myName)?myName:"10in-HDTV";
	this.baseWidth=(baseWidth)?baseWidth:new nas.UnitValue("254 mm");
	this.frameAspect=(frameAspect)?frameAspect:16/9;
	this.scale=(scale)?scale:1.0;
	this.peg=(peg)?peg:new nas.AnimationPegForm("ACME");
	this.pegOffset=(pegOffset)?pegOffset:nas.GeometryOffset(new nas.Position("0 mm","104.775 mm"),new nas.Rotation(0));
}

//区間要素群のtoString()	メソッドの仕様

/*
	Obj.toString() 又は　Obj.toString(0 or false)
	代表値を保存形式出力で
	Obj.toString(出力キーワード) 又は　Obj.toString(1 or true)
	先頭 \t フィールドデリミタ \n でフルスペック出力
	Obj.toString([プロパティ名配列])
	指定プロパティを先頭 \t フィールドデリミタ \n で列挙
	
実際の使用時は以下の例のように利用
	xMapElement.content.toString("all");
	xMapElement.toString() //内部的にcontent.toString()にアクセス
	
メモ:
関数仕様
エレメント又はその値のtoString()で xMap の出力を得る

toString():引数なし	標準型
toString("all"):true ? 全プロパティ出力
toString(propName):プロパティ名　単独プロパティ
toString([propNames]):プロパティ名配列　指定プロパティを改行で区切って連続で与える


例(セル):
AnimationRreplacement.toString();

戻値
'A	A-1	"c:\myWorkshop\dataStore\work01\c001\A\0001.png",120 mm,360 mm '

AnimationRreplacement.toString(["size.x","size.y","size.t"]);

戻値
'	size.x=12 mm
	size.y=36 mm
	size.t=linear
'

xMapElement.toString("all");
戻値
'A	A-1	"c:\myWorkshop\dataStore\work01\c001\A\0001.png"
	size.x=12 mm
	size.y=36 mm
	size.t=linear
'

例:
AnimationReplacement.toString()
戻値
B	B-1	"c:\\\\Users\\Me\\Desktop\\Datas\\B_00001.png",640pt,480pt,

これらの値がグループの場合と要素の場合で共通に使える仕様とすること

値に名前（ラベル）を与えるのは上位オブジェクトの役目なので上位オブジェクト側で、これらの値をラップした出力を得る
	group
[A]
//最低限、名前のみ（これけっこう多い）
[A	CELL	720,405]
//標準形式、[label kind geometry]
//これ以上の情報が継承以外で保持されている場合geometryの追加情報を個別型式で出力

セルグループのプロパティ
	セッションユニークID
	名前
	値	アニメーションフィールド

	セッションユニークID
	所属グループ
	名前
	値	アニメーションリプレースメントエレメント　ファイル実体とアニメーションフィールドを持つ複合オブジェクト

[A	CELL	254mm,142.875mm,]



*/
/*
	区間の値としてのオブジェクトとMapの値を同一オブジェクトとするか否か？
	兼用して参照渡しにするのが最良と思われる

	作成するオブジェクトのリスト＞＞トラックの種類だけ必要
nas.AnimationDialog	　音響
nas.AnimationReaplacement	置きかえ（画像ーセル＊静止画と動画を双方含む）
nas.AnimationGeometry	ジオメトリ（カメララーク）
nas.AnimationComposite	合成（撮影効果）

システムグループのエントリは各オブジェクトをすべて含む可能性がある == システムのみグループのタイプと値のタイプが異なる
XPSグループのエントリは時間属性を持ったリプレースメントオブジェクトとして扱う

TEXTグループは、タイムシート上には配置されず区間の値となることは無い…と思う
字幕等 の　AnimationDialogに準ずるAnimationTextオブジェクトは、そのうち必要かも  

これでOK？

*/

/**
 * nas.AnimationElementSource Object
 * 各エレメントのソースファイルを統合して扱うオブジェクト
 * 初期化引数:ターゲット記述テキスト
 * .file ソースファイル Fileオブジェクト又はパス文字列　初期値 "/"
 * .framerate ソースフレームレート 主に静止画、ムービーの際に利用　nas.Framerate Object
 * .duration ソース継続時間 主に静止画の際に利用　frames/int
 * .startOffset ソース継続時間に対するオフセット　frames/int
 */
nas.AnimationElementSource=function(targetDescription){
    this.file;
	this.framerate;
    this.duration;
    this.stratOffset;
}


/**

    Xps
        .stage  *
        .mapfile    *
        .opus
        .title
        .subtitle
        .create_time
        .create_user
        .cut
        .framerate
        .memo
        .rate
        .scene
        .trin
        .trout
        .update_time
        .update_user
        .xpsTracks(XpsTrackCollection)

        .duration()
        .deleteTL()
        .getIdentifier()
        .getMap()
        .getNormarizedStream()
        .getRange()
        .getTC()
        .init()
        .insertTL()
        .isSame()
        .newTracks()
        .parseXps()
        .put()
        .reInitBody()
        .readIN()
        .time()
        .timeLine()
        .toString()

    XpsTrackCollection
        .parentXps
        .jobIndex
        .length
        .duration
        .noteText

        .addSection()
        .duplicate()
        .getDuration()
        .insertTrack()
        .parseSoundTrack()?間違いなので削除
        .renumber()
        
    XpsTimelineTrack (track-collection member)
        .index
        .xParent
        .length
        .duration
        .id
        .option
        .sizeX
        .sizeY
        .aspect
        .lot
        .blmtd
        .blpos
        .link
        .parent
        .sections   (XpsTimelineSectionCollection)

        .getDefaultValue()
        .duplicate()
        .parseTm()          test
        .parseSoudTrack()   test

    XpsTimelineSectionCollection    セクションキャリア(配列ベース)
        .parent 親セクション又はトラック

        .addSection()   値を置いてセクションを追加する
        .getDuration()  セクションの値を合計して継続時間をフレーム数で戻す
        
    XpsTimelineSction   セクションメンバ
        .id             セクションの現行index　==parent.sections[id]
        .parent         タイムライントラック  
        .duration       継続時間（フレーム数）
        .value          .this.mapElement.value　または同等の値オブジェクト
        .mapElement     nas.xMapElement　値へは.value経由でアクセスする
        .subSections    


    nas.xMapElemnet
        .id uniq-index/int
        .parent xMapGroup
        .link   PmJob
        .type   parent.type / erement-type
        .name   element label
        .content    タイプごとの値オブジェクト
        .comment    申し送りコメント

 */