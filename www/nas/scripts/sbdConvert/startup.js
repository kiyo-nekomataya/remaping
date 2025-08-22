//startup
/*
	sbdConvert startup
*/

//
function windowInit(){
	xUI = new_xUI();
	xUI.init('','','sbde');
	uat.MH.init();

//	document.getElementById('targetURL').value=url;
	if(autoSwitch){
//		showMsg(url + ' 自動読み込み中');
//		convertData();
console.log(targetURL);
        setURL(targetURL[0]);
	}else{
		showMsg('コンバートファイルを確認してロードしてください。')
	};
	document.getElementById('toolHeader').style.display='none';//'inline'
    document.getElementById('hideBt').value=(document.getElementById('toolHeader').style.display=='none')?'□':'＿';
	document.getElementById('playerArea').style.display='none';
	document.getElementById('sbdBody').style.display='block';
//	showMsg("startup : "+ startupQueue());
/*
//ブラウザ用ドロップダウンメニュー表示
		$("#oMenu").show();
//ドロップダウンメニューの初期化
		$("#oMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
	// */
}

/*
	ナビゲーションバーをjQueryでフローティングウインドウに
*/

jQuery(function(){
    jQuery("a.openTbx").click(function(){
        jQuery("#optionPanelNaBar").show();
        return false;
    })
    
    jQuery("#optionPanelNaBar a.close").click(function(){
        jQuery("#optionPanelNaBar").hide();
        return false;
    })
    jQuery("#optionPanelNaBar a.minimize").click(function(){
        if(jQuery("#optionPanelNaBar").height()>100){
           jQuery("#formTbx").hide();
           jQuery("#optionPanelNaBar").height(24);
	}else{
           jQuery("#formTbx").show();
           jQuery("#optionPanelNaBar").height(165);
	}
        return false;
    })
    jQuery("#optionPanelNaBar dl dt").mousedown(function(e){
        
        jQuery("#optionPanelNaBar")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelNaBar").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelNaBar").offset().top);
        
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelNaBar").css({
//                top:e.pageY  - jQuery("#optionPanelNaBar").data("clickPointY")-document.getElementById("fixedHeader").clientHeight+myOffset.top+"px",
                top:e.pageY  - jQuery("#optionPanelNaBar").data("clickPointY")+myOffset.top+"px",
                left:e.pageX - jQuery("#optionPanelNaBar").data("clickPointX")+myOffset.left+"px"
            })
        })
        
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
        
    })
});

function downloadSTDB() {
	var content = mySB.toString('storyboard');
	var blob = new Blob([ content ], { "type" : "text/stbd" });
	const dllink = document.createElement('a');
	dllink.href = window.URL.createObjectURL(blob);
	dllink.download = mySB.title+'\.stdb';
	dllink.style.diaplay = 'none';
	dllink.click();
}
