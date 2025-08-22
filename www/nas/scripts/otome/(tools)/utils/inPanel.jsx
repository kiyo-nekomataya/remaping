/*(inPointSelector)
<test>

イン点セレクタ
*/
var myTargetComp=(this instanceof CompItem)? this:app.project.activeItem;
var myIndex=myTargetComp.layers.length;

var w=nas.GUI.newWindow("palete","inPoint");
w.bt1=nas.GUI.addButton(w,"in 0",0,1,1,1);
w.bt2=nas.GUI.addButton(w,"in 5",1,1,1,1);
w.bt3=nas.GUI.addButton(w,"in 6",2,1,1,1);
w.bt4=nas.GUI.addButton(w,"in 8",3,1,1,1);
w.bt5=nas.GUI.addButton(w,"BACK",4,1,2,1);
w.bt6=nas.GUI.addButton(w,"FWD",6,1,2,1);

function setInPoint(f){
	myTargetComp.layers[myIndex].inPoint=myTargetComp.layers[myIndex].startTime+(f*myTargetComp.frameDuration);
	myTargetComp.time=myTargetComp.layers[myIndex].inPoint;
}
w.bt1.onClick=function(){setInPoint(0)};
w.bt2.onClick=function(){setInPoint(5)};
w.bt3.onClick=function(){setInPoint(6)};
w.bt4.onClick=function(){setInPoint(8)};
w.bt5.onClick=function(){
	myIndex=1+(myIndex%myTargetComp.layers.length);
	myTargetComp.time=myTargetComp.layers[myIndex].inPoint;
}
w.bt6.onClick=function(){
	myIndex=(myIndex-1+myTargetComp.layers.length)%myTargetComp.layers.length;
	myTargetComp.time=myTargetComp.layers[myIndex].inPoint;
}

w.show();
