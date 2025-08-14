/**
 *	@params {String} idx
 *	トランジションシンボルを描画する
 *	描画トラックを指定可能
 *		トラック指定がない場合は、コメントトラックまたは最後尾のトラックに対して描画する
 トラック幅を一つ専有してXPSの記録どおりにSVG描画を行う
 syncテーブルで呼び出されるものとする
 */
xUI.drawTranstion = function async drawTranstion(idx){
//すでにシンボルがあれば一旦削除
	var symbols = Array.from(document.getElementsByClassName('transitionSymbol'));
	symbols.forEach(function(e){e.remove();});
	
}
xUI.placeMarginMarker = async function placeMarginMarker(){
	var markCell  = null;
	var markRight = null;
	var markWidth = 0;
	['trin','trout'].forEach(function(sym){
		if(xUI.XPS[mgn]>0){
			var eid = (mgn == 'headMargin' )? 'headMarker':'tailMarker';
			var mgnPoint = (mgn == 'headMargin' )?
				xUI.XPS.headMargin:xUI.XPS.xpsTracks.duration-xUI.XPS.tailMargin;//head|tail
			markCell  = document.getElementById('le' + mgnPoint);//トラック左端
			markRight = document.getElementById([xUI.XPS.xpsTracks.length-1,mgnPoint].join('_')).getBoundingClientRect();
			markWidth = markRight.right - markCell.getBoundingClientRect().left;
			var mrk = document.createElement('span');
			mrk.id = eid;
			mrk.className = 'marginMarker';
			markCell.append(mrk);
		};
	});
	if(markWidth) nas.setCssRule('.marginMarker','width:'+markWidth+'px;');
}


/*
	ローレベル関数
	開始フレームと、継続時間を指定してトランジションシンボルを描画する
	xUI.drawTransition(1,24,24);
*/
	xUI.drawTransition = async function drawTransition(track,frame,duration){
		if(
			(typeof track == 'undefined')||(track < 0)||(track >= xUI.XPS.xpsTracks.length)||
			(typeof frame == 'undefined')||(frame < 0)||(frame >= xUI.XPS.xpsTracks.duration)||
			(typeof duration == 'undefined')||(duration <= 0)|| (duration > xUI.XPS.xpsTracks.duration)
		) return false;
//	[track,frame],duration;
		var startCell = document.getElementById([track,frame].join('_')).getBoundingClientRect();
		var stopCell   = document.getElementById([track,frame+duration].join('_')).getBoundingClientRect();
		var documentColor = xUI.sheetborderColor;//'rgb(0.5,0.5,0.5)'
		var symbol = {
			x      : startCell.x,
			y      : startCell.y,
			width  : startCell.width,
			height : stopCell.top-startCell.top,
			left   : startCell.left,
			top    : startCell.top,
			right  : stopCell.right,
			bottom : stopCell.top,
			fill   : documentColor,
		stroke : documentColor
		};
		var itemId = nas.localize("transition_%1_%2_%3",tarck,frame,duration);//
		var svg = document.createElement('svg');
		svg.id = 'testSymbol';
		svg.className = 'testSymbol';
		svg.width = symbol.width;
		svg.height = symbol.height;

		var src = '<svg width="'+symbol.width+'" height="'+symbol.height+'" xmlns="http://www.w3.org/2000/svg" version="1.1">'
		src += '<path d = "M 0 0 L '+symbol.width+' 0 L 0 '+symbol.height+' L '+symbol.width+' '+symbol.height+' Z" fill = "'+symbol.fill+'" stroke = "'+symbol.stroke+'" />';
		src += '</svg>'
		var sym = document.getElementById('le'+frame);

		sym.append(svg);
		svg.innerHTML = src;
		nas.HTML.setCssRule('.testSymbol','left:'+(symbol.x - sym.getBoundingClientRect().x)+'px;');
	}
//TEST
	xUI.drawTransition(1,24,24);
	