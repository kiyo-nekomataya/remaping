//参照テキストからトランジションオブジェクトを抽出して返すメソッド?

//トランジションオブジェクト
function Transition(myParent,myLabel,myLength,myEffect)
{
	this.parent=(myParent)?myParent:null;
	this.label=(myLabel)?myLabel:"trin";
	this.length=(myLength)?nas.FCT2Frm(myLength):nas.FCT2Frm("1:00");
	this.inPoint=Math.floor(this.length/2);//長さの半分で切り捨て
	if(myEffect){
		this.effect=myEffect;
	}else{
		new Effect(this,this.label,this,length)
	}
//一般的なトランジションで初期化
		this.effect.parent=this;
		this.effect.length=this.lengtht
		this.effect.inPoint=this.inPoint
		this.effect.keys=new Array();キーフレームコレクションを初期化
		this.effect.addKey(0,0,"ease");//time,value,timing
		this.effect.addKey(this.length,1);
}
/*

コンストラクタはtrinのみを初期化する
troutタイミングで指定されたトランジションは
その場で初期化したオブジェクトを保留して、
次のカットの初期化時に衝突が無いかぎり(次のカットの)メンバーとしてコレクションに積む

*/

//エフェクトコンストラクタ(仮)
function Effect(myParent,myLabel,myLength)
{
	this.parent=(myParent)?myParent:null;
	this.label=(myLabel)?myLabel:"normal";
	this.length=(myLength)?nas.FCT2Frm(myLength):null;//ヌルで初期化したlengthは親カットのおわりまで
	this.inPoint=0;//デフォルトはオフセット0
	this.effectModule=new BlendingMode();//こんな感じに実装する 一寸たいへん
	this.effectModule.blendMode="normal";//別データベースで参照 実装毎に違っていても良い
	this.effectModule.opacity=1;//実数
	this.keys=new Array();
}

function BlendingMode(){};//今回は使わないので空オブジェクトで保留


//カメラワークコンストラクタ
function CameraWork(myParent,myLabel,myLength)
{
	this.parent=(myParent)?myParent:null;
	this.label=(myLabel)?myLabel:"fix";
	this.length=(myLength)?nas.FCT2Frm(myLength):null;//ヌルで初期化したlengthは親カットのおわりまで
	this.inPoint=0;//デフォルトはオフセット0
	this.geometriy=new Geometry();//これはベース値となる
	this.keys=new Array();//キーオブジェクトコレクション
}
//ジオメトリオブジェクト

function Geometry(myScale,myPosition,myOffset,myRotation)
{
//とりあえず配列 オブジェクト化した方がよい
	this.scale	=(myScale)?	myScale   	:[1,1,1]	;//[x,y,z]
	this.position	=(myPosition)?	myPosition	:[0,0,0]	;//[x,y,z]DTPpoint
	this.offset	=(myOffset)?	myOffset	:[0,0,0]	;//[x,y,z]DTPpoint
	this.rotation	=(myRotation)?	myRotation	:[0,0,0]	;//[x,y,z]
}
