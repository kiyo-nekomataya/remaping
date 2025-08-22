/*(エクスプレッションエディタ)

	選択プロパティのエクスプレッションを編集する
	エクスプレッションをバッファにとって表示
	書き換えた内容をアップデートすることができるUI
*/
var exFlag=false;
var myTargetItem=(this instanceof CompItem)? this:app.project.activeItem;

if(
	(myTargetItem)&&
	(myTargetItem instanceof CompItem)&&
	(myTargetItem.selectedLayers.length)&&
	(myTargetItem.selectedLayers[0].selectedProperties.length)
)
	{
		for(var pIdx=0;pIdx<myTargetItem.selectedLayers[0].selectedProperties.length;pIdx++)
		{
			myTargetProp=myTargetItem.selectedLayers[0].selectedProperties[pIdx];
			exFlag=(myTargetProp.canSetExpression)?true:false;
			if(exFlag){break};//最初にtrueになったところでブレイク
		}
	}
//exPressionStore をnas配下にするかローカルオブジェクトにするかちょっと考える
//ユーザごとにファイルで監理したほうがよさそう　いろいろ違うし ActionFolder化して中に保存するとよさそう?
//
if(! nas.expressions){
nas.expressions=({
names:["USERExpression","Grobal","Vector Math","Rondom numbers","interpolations","Color Conversion","Other Math","Javascript Math","Comp","Footage","Layer Sub-objects","Layer General","Layer Properties","Layer 3D","Layer Space Transforms","Camera","Light","Effect","Mask","Property","Key","MarkerKey"],
bodys:{
USERExpression:[
	"//現在、内容はありません。ユーザのエクスプレッションを登録できます"
],
Grobal:[
	"comp(name)",
	"footage(name)",
	"thisComp",
	"thisLayer",
	"thisProperty",
	"time",
	"colorDepth",
	"posterizeTime(framesPerSecond)",
	"timeToFrames(t = time + thisComp.displayStartTime, fps = 1.0 / thisComp.frameDuration, isDuration = false)",
	"framesToTime(frames, fps = 1.0 / thisComp.frameDuration)",
	"timeToTimecode(t = time + thisComp.displayStartTime, timecodeBase = 30, isDuration = false)",
	"timeToNTSCTimecode(t = time + thisComp.displayStartTime, ntscDropFrame = false, isDuration = false)",
	"timeToFeetAndFrames(t = time + thisComp.displayStartTime, fps = 1.0 / thisComp.frameDuration, framesPerFoot = 16, isDuration = false)",
	"timeToCurrentFormat(t = time + thisComp.displayStartTime, fps = 1.0 / thisComp.frameDuration, isDuration = false)"
],
"Vector Math":[
	"add(vec1, vec2)",
	"sub(vec1, vec2)",
	"mul(vec, amount)",
	"div(vec, amount)",
	"clamp(value, limit1, limit2)",
	"dot(vec1, vec2)",
	"cross(vec1, vec2)",
	"normalize(vec)",
	"length(vec)",
	"length(point1, point2)",
	"lookAt(fromPoint, atPoint)"
],
	"Rondom numbers":[
	"seedRandom(seed, timeless = false)",
	"random()",
	"random(maxValOrArray)",
	"random(minValOrArray, maxValOrArray)",
	"gaussRandom()",
	"gaussRandom(maxValOrArray)",
	"gaussRandom(minValOrArray, maxValOrArray)",
	"noise(valOrArray)"
],
	interpolations:[
	"linear(t, value1, value2)",
	"linear(t, tMin, tMax, value1, value2)",
	"ease(t, value1, value2)",
	"ease(t, tMin, tMax, value1, value2)",
	"easeIn(t, value1, value2)",
	"easeIn(t, tMin, tMax, value1, value2)",
	"easeOut(t, value1, value2)",
	"easeOut(t, tMin, tMax, value1, value2)"
],
	"Color Conversion":[
	"rgbToHsl(rgbaArray)",
	"hslToRgb(hslaArray)"
],
	"Other Math":[
	"degreesToRadians(degrees)",
	"radiansToDegrees(radians)"
],
	"Javascript Math":[
	"Math.cos(value)",
	"Math.acos(value)",
	"Math.tan(value)",
	"Math.atan2(y, x)",
	"Math.sqrt(value)",
	"Math.exp(value)",
	"Math.pow(value, exponent)",
	"Math.log(value)",
	"Math.abs(value)",
	"Math.round(value)",
	"Math.ceil(value)",
	"Math.floor(value)",
	"Math.min(value1, value2)",
	"Math.max(value1, value2)",
	"Math.PI",
	"Math.E",
	"Math.LOG2E",
	"Math.LOG10E",
	"Math.LN2",
	"Math.LN10",
	"Math.SQRT2",
	"Math.SQRT1_2"
],
	Comp:[
	"layer(index)",
	"layer(name)",
	"layer(otherLayer, relIndex)",
	"marker",
	"numLayers",
	"activeCamera",
	"width",
	"height",
	"duration",
	"displayStartTime",
	"frameDuration",
	"shutterAngle",
	"shutterPhase",
	"bgColor",
	"pixelAspect",
	"name"
],
	Footage:[
	"width",
	"height",
	"duration",
	"frameDuration",
	"pixelAspect",
	"name"
],
	"Layer Sub-objects":[
	"source",
	"effect(name)",
	"effect(index)",
	"mask(name)",
	"mask(index)"
],
	"Layer General":[
	"width",
	"height",
	"index",
	"parent",
	"hasParent",
	"inPoint",
	"outPoint",
	"startTime",
	"hasVideo",
	"hasAudio",
	"enabled",
	"active",
	"audioActive",
	"sampleImage(point, radius = [.5, .5], postEffect = true, t = time)"
],
	"Layer Properties":[
	"anchorPoint",
	"position",
	"scale",
	"rotation",
	"opacity",
	"audioLevels",
	"timeRemap",
	"marker",
	"name"
],
	"Layer 3D":[
	"orientation",
	"rotationX",
	"rotationY",
	"rotationZ",
	"lightTransmission",
	"castsShadows",
	"acceptsShadows",
	"acceptsLights",
	"ambient",
	"diffuse",
	"specular",
	"shininess",
	"metal"
],
	"Layer Space Transforms":[
	"toComp(point, t = time)",
	"fromComp(point, t = time)",
	"toWorld(point, t = time)",
	"fromWorld(point, t = time)",
	"toCompVec(vec, t = time)",
	"fromCompVec(vec, t = time)",
	"toWorldVec(vec, t = time)",
	"fromWorldVec(vec, t = time)",
	"fromCompToSurface(point, t = time)"
],
	Camera:[
	"pointOfInterest",
	"zoom",
	"depthOfField",
	"focusDistance",
	"aperture",
	"blurLevel",
	"active"
],
	Light:[
	"pointOfInterest",
	"intensity",
	"color",
	"coneAngle",
	"coneFeather",
	"shadowDarkness",
	"shadowDiffusion"
],
	Effect:[
	"active",
	"param(name)",
	"param(index)",
	"name"
],
	Mask:[
	"maskOpacity",
	"maskFeather",
	"maskExpansion",
	"invert",
	"name"
],
	Property:[
	"value",
	"valueAtTime(t)",
	"velocity",
	"velocityAtTime(t)",
	"speed",
	"speedAtTime(t)",
	"wiggle(freq, amp, octaves = 1, amp_mult = .5, t = time)",
	"temporalWiggle(freq, amp, octaves = 1, amp_mult = .5, t = time)",
	"smooth(width = .2, samples = 5, t = time)",
	"loopIn(type = \"cycle\", numKeyframes = 0)",
	"loopOut(type = \"cycle\", numKeyframes = 0)",
	"loopInDuration(type = \"cycle\", duration = 0)",
	"loopOutDuration(type = \"cycle\", duration = 0)",
	"key(index)",
	"key(markerName)",
	"nearestKey(t)",
	"numKeys",
	"active",
	"enabled",
	"propertyGroup(countUp = 1)",
	"propertyIndex"
],
	Key:[
	"value",
	"time",
	"index"
],
	MarkerKey:[
	"comment",
	"chapter",
	"url",
	"frameTarget",
	"eventCuePoint",
	"cuePointName",
	"parameters"
]
}
,
labels:[
	["ユーザエクスプレッション登録可能"],
	[
	"comp(name)",
	"footage(name)",
	"thisComp",
	"thisLayer",
	"thisProperty",
	"time",
	"colorDepth",
	"posterizeTime(framesPerSecond)",
	"timeToFrames(t = time + thisComp.displayStartTime, fps = 1.0 / thisComp.frameDuration, isDuration = false)",
	"framesToTime(frames, fps = 1.0 / thisComp.frameDuration)",
	"timeToTimecode(t = time + thisComp.displayStartTime, timecodeBase = 30, isDuration = false)",
	"timeToNTSCTimecode(t = time + thisComp.displayStartTime, ntscDropFrame = false, isDuration = false)",
	"timeToFeetAndFrames(t = time + thisComp.displayStartTime, fps = 1.0 / thisComp.frameDuration, framesPerFoot = 16, isDuration = false)",
	"timeToCurrentFormat(t = time + thisComp.displayStartTime, fps = 1.0 / thisComp.frameDuration, isDuration = false)"
],
	[
	"add(vec1, vec2)",
	"sub(vec1, vec2)",
	"mul(vec, amount)",
	"div(vec, amount)",
	"clamp(value, limit1, limit2)",
	"dot(vec1, vec2)",
	"cross(vec1, vec2)",
	"normalize(vec)",
	"length(vec)",
	"length(point1, point2)",
	"lookAt(fromPoint, atPoint)"
],
	 [
	"seedRandom(seed, timeless = false)",
	"random()",
	"random(maxValOrArray)",
	"random(minValOrArray, maxValOrArray)",
	"gaussRandom()",
	"gaussRandom(maxValOrArray)",
	"gaussRandom(minValOrArray, maxValOrArray)",
	"noise(valOrArray)"
],
	[
	"linear(t, value1, value2)",
	"linear(t, tMin, tMax, value1, value2)",
	"ease(t, value1, value2)",
	"ease(t, tMin, tMax, value1, value2)",
	"easeIn(t, value1, value2)",
	"easeIn(t, tMin, tMax, value1, value2)",
	"easeOut(t, value1, value2)",
	"easeOut(t, tMin, tMax, value1, value2)"
],
	 [
	"rgbToHsl(rgbaArray)",
	"hslToRgb(hslaArray)"
],
	[
	"degreesToRadians(degrees)",
	"radiansToDegrees(radians)"
],
	 [
	"Math.cos(value)",
	"Math.acos(value)",
	"Math.tan(value)",
	"Math.atan2(y, x)",
	"Math.sqrt(value)",
	"Math.exp(value)",
	"Math.pow(value, exponent)",
	"Math.log(value)",
	"Math.abs(value)",
	"Math.round(value)",
	"Math.ceil(value)",
	"Math.floor(value)",
	"Math.min(value1, value2)",
	"Math.max(value1, value2)",
	"Math.PI",
	"Math.E",
	"Math.LOG2E",
	"Math.LOG10E",
	"Math.LN2",
	"Math.LN10",
	"Math.SQRT2",
	"Math.SQRT1_2"
],
	[
	"layer(index)",
	"layer(name)",
	"layer(otherLayer, relIndex)",
	"marker",
	"numLayers",
	"activeCamera",
	"width",
	"height",
	"duration",
	"displayStartTime",
	"frameDuration",
	"shutterAngle",
	"shutterPhase",
	"bgColor",
	"pixelAspect",
	"name"
],
	[
	"width",
	"height",
	"duration",
	"frameDuration",
	"pixelAspect",
	"name"
],
	[
	"source",
	"effect(name)",
	"effect(index)",
	"mask(name)",
	"mask(index)"
],
	[
	"width",
	"height",
	"index",
	"parent",
	"hasParent",
	"inPoint",
	"outPoint",
	"startTime",
	"hasVideo",
	"hasAudio",
	"enabled",
	"active",
	"audioActive",
	"sampleImage(point, radius = [.5, .5], postEffect = true, t = time)"
],
	[
	"anchorPoint",
	"position",
	"scale",
	"rotation",
	"opacity",
	"audioLevels",
	"timeRemap",
	"marker",
	"name"
],
	[
	"orientation",
	"rotationX",
	"rotationY",
	"rotationZ",
	"lightTransmission",
	"castsShadows",
	"acceptsShadows",
	"acceptsLights",
	"ambient",
	"diffuse",
	"specular",
	"shininess",
	"metal"
],
	 [
	"toComp(point, t = time)",
	"fromComp(point, t = time)",
	"toWorld(point, t = time)",
	"fromWorld(point, t = time)",
	"toCompVec(vec, t = time)",
	"fromCompVec(vec, t = time)",
	"toWorldVec(vec, t = time)",
	"fromWorldVec(vec, t = time)",
	"fromCompToSurface(point, t = time)"
],
	[
	"pointOfInterest",
	"zoom",
	"depthOfField",
	"focusDistance",
	"aperture",
	"blurLevel",
	"active"
],
	[
	"pointOfInterest",
	"intensity",
	"color",
	"coneAngle",
	"coneFeather",
	"shadowDarkness",
	"shadowDiffusion"
],
	
	[
	"active",
	"param(name)",
	"param(index)",
	"name"
],
	[
	"maskOpacity",
	"maskFeather",
	"maskExpansion",
	"invert",
	"name"
],
	[
	"value",
	"valueAtTime(t)",
	"velocity",
	"velocityAtTime(t)",
	"speed",
	"speedAtTime(t)",
	"wiggle(freq, amp, octaves = 1, amp_mult = .5, t = time)",
	"temporalWiggle(freq, amp, octaves = 1, amp_mult = .5, t = time)",
	"smooth(width = .2, samples = 5, t = time)",
	"loopIn(type = \"cycle\", numKeyframes = 0)",
	"loopOut(type = \"cycle\", numKeyframes = 0)",
	"loopInDuration(type = \"cycle\", duration = 0)",
	"loopOutDuration(type = \"cycle\", duration = 0)",
	"key(index)",
	"key(markerName)",
	"nearestKey(t)",
	"numKeys",
	"active",
	"enabled",
	"propertyGroup(countUp = 1)",
	"propertyIndex"
],
	[
	"value",
	"time",
	"index"
],
	[
	"comment",
	"chapter",
	"url",
	"frameTarget",
	"eventCuePoint",
	"cuePointName",
	"parameters"
]]});
}
//=========================================================================== エクスプレッションポケット間近
if(! exFlag){
//有効なオブジェクトを選択していない場合は、警告だけ出す
var msg="エクスプレッション設定可能プロパティが選択されていません。\nプロパティを選択して実行してください。"
alert(msg);
}else{
//	if(!(myTargetProp.expressionEnabled)){myTargetProp.expressionEnabled=true;}
//-------------------------------------------------------------build UI
	var w=nas.GUI.newWindow("dialog","edit expression for [ "+myTargetProp.name+" ]",9,13,320,240);
	w.editBox=nas.GUI.addEditText(w,myTargetProp.expression,0,0,6,10);
	w.saveBt=nas.GUI.addButton(w,"SAVE",6,0,3,1);
	w.loadBt=nas.GUI.addButton(w,"LOAD",6,1,3,1);
		w.ctSelect=nas.GUI.addSelectButton(w,nas.expressions.names,0,	6,2,3,1);
		w.stSelect=nas.GUI.addListBox(w,nas.expressions.labels[0],null,	6,2.7,3,5.5);
	w.insBt=nas.GUI.addButton(w,"←append",6,9,3,1);
	w.stkBt=nas.GUI.addButton(w,"→stack",6,10,3,1);
	
	w.eduBt=nas.GUI.addButton(w,"↑",6,11,1,1);
	w.eddBt=nas.GUI.addButton(w,"↓",7,11,1,1);
	w.delBt=nas.GUI.addButton(w,"del",8,11,1,1);
	
	w.retBt=nas.GUI.addButton(w,"[RETURN]",0,10,3,1);
	w.clsBt=nas.GUI.addButton(w,"clear",3,10,3,1);

	w.prpBt=nas.GUI.addButton(w,"<DOM>",0,11,6,1);
	

	w.rstBt=nas.GUI.addButton(w,"reset",0,12,2,1);
	w.udtBt=nas.GUI.addButton(w,"update",2,12,2,1);
	w.eblCb=nas.GUI.addCheckBox(w,"enabled",4,12,2,1,);
	w.eblCb.value=myTargetProp.expressionEnabled;
	w.closeBt=nas.GUI.addButton(w,"close",6,12,3,1);
//-------------------------------------------------コントロールメソッド
	w.saveBt.onClick=function(){
		var goOutput=confirm("現在のエクスプレッションを保存します。"+nas.GUI.LineFeed+"file　は　nas/lib/etc/nas.expressions.json です。")
//		if(goOutput){this.parent.editBox.text=nas.expressions.toSource();}
		if(goOutput){nas.otome.writePreference("nas.expressions");}
	};
	w.loadBt.onClick=function(){
		var goRestore=confirm("保存データを読み込みます。現在のデータはクリアされます");
			if(goRestore)
			{
				nas.otome.readPreference("nas.expressions");
				this.parent.ctSelect.options=nas.expressions.names;
				this.parent.ctSelect.select(0);
				this.parent.stSelect.setOptions(nas.expressions.labels[0],[false]);
			}
		return;
		//=================================以下は試験コード
		var newDatas={};
		eval("newDatas=("+this.parent.editBox.text+")");		
		if((newDatas.names)&&(newDatas.labels)&&(newDatas.bodys))
		{
			var msg="";
			var myCount=0;
			if(false){
			for(var idx=0;idx<newDatas.labels.length;idx++){myCount += newDatas.labels[idx].length}
			msg+="カテゴリ数	:"+　newDatas.names.length +nas.GUI.LineFeed;
			msg+="データ総数	:"+myCount +nas.GUI.LineFeed;
			msg+="上記のデータをインポートします　よろしいですか？";
			var goRestore=confirm(msg);
			}else{var goRestore=true}
			if(goRestore)
			{
				nas.expressions=newDatas;
				this.parent.ctSelect.options=nas.expressions.names;
				this.parent.ctSelect.select(0);
				this.parent.stSelect.setOptions(nas.expressions.labels[0],[false]);
			}
		}
	};

	w.ctSelect.onChange=function()
	{
		var newSelected=[];
		for(var idx=0;idx<nas.expressions.bodys[this.value].length;idx++){newSelected.push(false)}
		this.parent.stSelect.setOptions(nas.expressions.labels[this.selected],newSelected);
	}
	w.stSelect.listBox.onDoubleClick=function(){this.parent.parent.addCodeTip();}
	
	w.stkBt.onClick=function()
	{
		var myIndex=this.parent.ctSelect.selected;
		nas.expressions.bodys[nas.expressions.names[myIndex]].push(this.parent.editBox.text);
		nas.expressions.labels[myIndex].push(this.parent.editBox.text.split("\n")[0]);
		this.parent.stSelect.setOptions(nas.expressions.labels[myIndex],[false]);
//		this.stSelect.select(newIndex);//セレクトメソッドは書き直すべきだねぇ		
	}
	w.insBt.onClick=function()
	{
		this.parent.addCodeTip();
	};
	w.eduBt.onClick=function(){if(this.parent.stSelect.selected){this.parent.moveSelect(-1)}};
	w.eddBt.onClick=function(){if(this.parent.stSelect.selected){this.parent.moveSelect(1)}};
	w.delBt.onClick=function(){if(this.parent.stSelect.selected){this.parent.removeSelect()}};
	
	w.retBt.onClick=function(){this.parent.editBox.text+=nas.GUI.LineFeed};
	w.clsBt.onClick=function(){this.parent.editBox.text=""};
	w.prpBt.onClick=function()
	{
		var myText=nas.otome.selectProperty(myTargetProp.parentProperty,"asExp");
		if(myText){this.parent.editBox.text+=myText}
	};
	
	w.rstBt.onClick=function(){this.parent.editBox.text=myTargetProp.expression};
	w.udtBt.onClick=function(){this.parent.update()};
	w.eblCb.onClick =function(){myTargetProp.expressionEnabled=this.value};
	w.closeBt.onClick=function(){this.parent.close()};
//　一般メソッド
	w.removeSelect=function()
	{
		var myTargets=nas.expressions.bodys[nas.expressions.names[this.ctSelect.selected]];//参照
		var myIndex=this.stSelect.selected;
			if(myIndex==null) return false;//選択無ければfalse;
		var newIdxs=new Array();
		for(var idx=0;idx<myTargets.length;idx++)
		{
			if(idx!=myIndex){newIdxs.push(idx)};
		}
		var newBodys=new Array();	var newLabels=new Array();
		for(var idx=0;idx<newIdxs.length;idx++)
		{
			newBodys.push(myTargets[newIdxs[idx]]);
			newLabels.push(myTargets[newIdxs[idx]].split("\n")[0]);
		}
		nas.expressions.bodys[nas.expressions.names[this.ctSelect.selected]]=newBodys;
		nas.expressions.labels[this.ctSelect.selected]=newLabels;
		this.stSelect.setOptions(newLabels,[false]);
	}
	w.moveSelect=function(step)
	{
		//ステップがプラスなら下方向へステップ数移動　マイナスなら上　ループ動作
		if(! step){step=0};
		var myTargets=nas.expressions.bodys[nas.expressions.names[this.ctSelect.selected]];//参照
		var myIndex=this.stSelect.selected;
			if(myIndex==null) return false;//選択無ければfalse;
			if(step==0) return myIndex;//移動無ければｍｙIndex;
		var newIndex=(myTargets.length+myIndex+step)%myTargets.length;//
		var newIdxs=new Array();
		for(var idx=0;idx<myTargets.length;idx++)
		{
			if(idx==newIndex){newIdxs.push(myIndex)};
			if(idx!=myIndex){newIdxs.push(idx)};
		}
		var newBodys=new Array();var newLabels=new Array();
		for(var idx=0;idx<newIdxs.length;idx++)
		{
			newBodys.push(myTargets[newIdxs[idx]]);
			newLabels.push(myTargets[newIdxs[idx]].split("\n")[0]);
		}
		nas.expressions.bodys[nas.expressions.names[this.ctSelect.selected]]=newBodys;
		nas.expressions.labels[this.ctSelect.selected]=newLabels;
		this.stSelect.setOptions(newLabels,[false]);
		this.stSelect.select(newIndex);//セレクトメソッドは書き直すべきだねぇ		
	}
	w.update=function(){
		var newExpression=this.editBox.text;
		if((newExpression)&&(newExpression!=myTargetProp.expression))
		{
			myTargetProp.expression=newExpression
		}else{
			if(newExpression==""){myTargetProp.expression="";myTargetProp.expressionEnabled=false;}
		}
	}
	w.addCodeTip=function(){
		var myText=nas.expressions.bodys[nas.expressions.names[this.ctSelect.selected]][this.stSelect.selected];
		if(myText){this.editBox.text=this.editBox.text+myText};
	}

	

//終了処理　アップデートしないで破棄のほうが良いかな？
	w.onClose=function(){
		this.update();
	}

w.show();
}
