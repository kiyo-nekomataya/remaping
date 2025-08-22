/*
 *	HTMLへ埋め込みを考慮
 */
// for  HTML Document function what converted from StoryBoardEditor data
var currentPageIndex=0;
var pageCount=0;
var columnCount=0;
//	フレーム指定ジャンプ
function tcJump(myTC){
	if((! myTC)||(! document.getElementById("pageCount"))){return false;}//;指定がない/未コンバート
	if (! pageCount){pageCount=document.getElementById("pageCount").innerHTML*1-1};
	var targetFrames=nas.FCT2Frm(myTC);//フレームで換算
	var currentFrames=0;//初期化

	if((targetFrames==myTC)&&(isNaN(targetFrames))){return false;};
	if(targetFrames%1){targetFrames=Math.floor(myTC*mySB.frameRate);};
	for (var pIdx=0;pIdx<pageCount;pIdx++){
		for (var cIdx=0;cIdx<5;cIdx++){
			var cutId=nas.Zf(pIdx,3)+"_"+cIdx.toString();
			if(document.getElementById(cutId)){
				currentFrames+= document.getElementById(cutId).getAttribute("frames")*1;
				if(targetFrames<currentFrames){
					goScroll(document.getElementById(nas.Zf(pIdx,3)).offsetTop+document.getElementById(cutId).offsetTop);
					return;
				}
			}
		}
	}
	return;
}
//	キー検索ジャンプ
function keyJump(myKey){
//alert(myKey);
	if((! myKey)||(! document.getElementById("pageCount"))){return false;}//;指定がない/未コンバート
	if (! pageCount){	pageCount=document.getElementById("pageCount").innerHTML*1-1};
/* ========================idの計算方法変更
ページインデックス(3桁)_カラム番号_サブカラム識別子
*/
	for (var pIdx=0;pIdx<pageCount;pIdx++){
	//ページ
		for (var cIdx=0;cIdx<5;cIdx++){
		//カラム
			var cutId=nas.Zf(pIdx,3)+"_"+cIdx.toString()+"_cl";
			//
			if(document.getElementById(cutId)){
				if(myKey==document.getElementById(cutId).getAttribute("key")){
					goScroll(document.getElementById(nas.Zf(pIdx,3)).offsetTop+document.getElementById(cutId).offsetTop);
					return;
				}
			};//完全一致
		}
	}
	return cutId;
}
//	カットナンバー(名前)指定ジャンプ
function cutJump(cutName){
	if((! cutName)||(! document.getElementById("pageCount"))){return false;}//;指定がない/未コンバート
	if (! pageCount){ pageCount=document.getElementById("pageCount").innerHTML*1-1};
for (var pIdx=0;pIdx<pageCount;pIdx++){
	for (cIdx=0;cIdx<5;cIdx++){
var cutId=nas.Zf(pIdx,3)+"_"+cIdx.toString();
		if(document.getElementById(cutId)){
			if(document.getElementById(cutId).innerHTML.match(/\>([^\<\>\/]+)\</))
			{
				var myCutNo=RegExp.$1;
				if(myCutNo==cutName){;//完全一致
					goScroll(document.getElementById(nas.Zf(pIdx,3)).offsetTop+document.getElementById(cutId).offsetTop);
					return;
				}
			}
		}
	}
}
	return;
}

//	ページ指定ジャンプ
function pageJump(currentIndex,act)
{
	if(!document.getElementById("pageCount")){return};//未コンバート
	if(! pageCount){
		 pageCount=document.getElementById("pageCount").innerHTML*1-1
	};

	var myIndex=0;
if(currentIndex.match){
	if(currentIndex.match(/^p([0-9]+)$/i)){
		currentIndex=RegExp.$1*1;//ページ指定なら数値化する
		act=3;//アクションを3(ページ指定ジャンプ)に変更する
	}else{
		//TCだったらTCジャンプへまわす
		if(currentIndex.match(/[:+]/)){tcJump(currentIndex);return;}
	};
}
	if(currentIndex){
		currentPageIndex=currentIndex*1;
	}else{
		currentPageIndex=currentPageIndex*1;
	}
	switch(act){
case	0:;//start Page
	myIndex=0;
break;
case	1:;//prev 10
	myIndex=(currentPageIndex-10+(pageCount*5))%pageCount;
break;
case	2:;//prev
	myIndex=(currentPageIndex-1+pageCount)%pageCount;
break;
case	3:;//hear
	myIndex=currentIndex%pageCount;
break;
case	4:;//nxt
	myIndex=(currentPageIndex+1+pageCount)%pageCount;
break;
case	5:;//nxt 10
	myIndex=(currentPageIndex+10+(pageCount*1))%pageCount;
break;
case	6:;//end
	myIndex=pageCount;
break;
default:
	cutJump(currentIndex);return;
	}
currentPageIndex=myIndex;

myIndex=(myIndex.toString().length<3)?("000"+myIndex.toString()).substr(myIndex.toString().length,3):myIndex.toString();

   goScroll(document.getElementById(myIndex).offsetTop-36);

   document.getElementById("pgCounter").value="p"+nas.Zf(myIndex*1,3);

};
function goScroll(y){
	if(appHost.platform=='MSIE'){
		document.body.scrollTop =y;
	}else{
		scrollTo(0,y);
	}
}
 

/*	パネル表示切り替え	*/
function chgPanel(pName){
	if(!pName){return false;}
  switch(pName){
case "navigationPost":
	var myElements=[".toolHeader","table.playerArea","table"];//ターゲットリストid
	if($("#navigationPost").is(':visible')){
		$("#navigationPost").hide();
//隠したのでマージンを減らす
		for(var idx=0;idx<myElements.length;idx++){$(myElements[idx]).css("margin-left","16px");};
//document.getElementById("wrokArea").style.left="24px";
document.getElementById("leftmark").style.left="24px";
document.getElementById("rightmark").style.left=(512-24+16)+"px";
	}else{
		$("#navigationPost").show();
//表示したので各エレメントにマージン追加
		for(var idx=0;idx<myElements.length;idx++){$(myElements[idx]).css("margin-left","72px");};
//document.getElementById("wrokArea").style.left="72px";
document.getElementById("leftmark").style.left="80px";
document.getElementById("rightmark").style.left=(512-24+72)+"px";
	}
	timeSlider.init();
break;
default:
return false;
  }
return true;

}

