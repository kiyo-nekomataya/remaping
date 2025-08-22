/*
	位置アライメント.jsx
位置の値を設定値にアライメントする
INDEX指定がない場合は再生ヘッド時点の位置の値をアライメントする
キーが存在しない場合は作成される
位置アライメントは、
用紙範囲を横2、縦（段数ｘ２）分割されたポイントのうち
最も近い位置に強制される

オプションを与えて特定の位置を指定することが出来る
指定オプションはlength2の16進文字列　00
位置対応の例は以下（5段組）
00	01	02
10	11	12	
20	21	22	
30	31	32	
40	41	42	
50	51	52	
60	61	62	
70	71	72	
80	81	82	
90	91	92	
A0	A1	A2	
*/
nas.eStoryBoard.alignPos=function(myIndex,alignPosition)
{
	if(typeof myIndex=="undefined") myIndex = nas.eStoryBoard.targetCC.time/nas.eStoryBoard.targetCC.frameDuration;
var myBlocks=[2,2*nas.eStoryBoard.targetPS.layers.byName("画像エリア").effect("コンテ段数").property(1).value];
var myOffset=sub(
	nas["eStoryBoard"].targetPS.layers.byName("画像エリア").position.value,
	sub(
	nas["eStoryBoard"].targetPS.layers.byName("00スタビライズ").position.value,
	nas["eStoryBoard"].targetPS.layers.byName("00スタビライズ").anchorPoint.value
	));//用紙設定のオフセット
var myArea=nas.eStoryBoard.targetPS.layers.byName("画像エリア").scale.valueAtTime(0,true);//全体エリア
var myUnit =[myArea[0]/myBlocks[0] , myArea[1]/myBlocks[1]];//アライメントグリッドサイズ
/*
位置指定がなければ　現在ポイントからオフセットを減じてユニットで割り　最小値から最大値でクリップしてターゲット位置を出す
*/
if(typeof alignPosition == "undefined"){
	var currentPoint=nas.eStoryBoard.columnPosition.valueAtTime(myIndex*nas.eStoryBoard.targetCC.frameDuration,true);
	var alignPoint=[
		Math.round((currentPoint[0]-myOffset[0])/myUnit[0]),
		Math.round((currentPoint[1]-myOffset[1])/myUnit[1])
	]
}else{
	var alignPoint=[parseInt(alignPosition.charAt(0),16),parseInt(alignPosition.charAt(1),16)];
}
//値を範囲内にクリップ　…指定時はこれをスキップしたほうが良いかも
	if(alignPoint[0]<0){alignPoint=[0,alignPoint[1]]}
	if(alignPoint[0]>myBlocks[0]){alignPoint=[myBlocks[0],alignPoint[1]]}
	if(alignPoint[1]<0){alignPoint=[alignPoint[0],0]}
	if(alignPoint[1]>myBlocks[1]){alignPoint=[alignPoint[0],myBlocks[1]]}
	
//配置
	var targetTime=myIndex*this.targetCC.frameDuration;
	var myPosition=add([alignPoint[0]*myUnit[0],alignPoint[1]*myUnit[1]],[myOffset[0],myOffset[1]]);
	nas.eStoryBoard.columnPosition.setValueAtTime(targetTime,myPosition);
}
// nas.eStoryBoard.alignPos(1,"01");
var keyCount=nas.eStoryBoard.columnPosition.numKeys;
for(var kidx=keyCount;kidx>0;kidx--){
	var currentFrame=Math.round(nas.eStoryBoard.columnPosition.keyTime(kidx)/nas.eStoryBoard.targetCC.frameDuration);
	nas.eStoryBoard.alignPos(currentFrame);
}
