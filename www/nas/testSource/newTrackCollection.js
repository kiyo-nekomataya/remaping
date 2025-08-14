/**
 * xpsTracks Object
 * Array based Class
 * トラックコレクション内部にはカット情報を保存する必要なし
 * それは、親のXpsが保持している
 * jobへの参照のみをプロパティとして持つ
 * 上流の工程情報はJobに内包される
 * 管理情報（user/date）関連はこのオブジェクトが保持する
 * 別のプロパティを保持する必要はない
 * 管理情報DBを利用しない場合もデフォルトのJobオブジェクトはユーザ及び日付情報を持つ
 * このオブジェクトに記録される情報はJob本体ではなく参照情報Job-ID(Int)
 * コレクションの初期化は、ライン、ステージ、ジョブの新規発行の際にシステムにより行なわれる
 IDは初期化時に外部情報で指定
 DB接続の無いケースでは、
    ドキュメント記載のIDを与える
    初期化時にセッション限定のユニークIDを作成して与える
 等のケースとなる
  
 durationの扱いに注意
 メソッドからプロパティへ変わるので関連した関数の調整が必要
 メソッド Xps.duration() を　Xps.xpsTracks.duration　へ切り替えのこと
 ＞＞ひとまず　duration()  メソッドを書き換えて対処
 xpsTracks[0].length は有効だが、順次xpsTracks.duration の参照に切り替えのこと
 */
XpsTrackCollection = function(parent,index,tracks,duration){
	this.parentXps=parent;//固定情報
	this.jobIndex=index;//固定情報 
	this.duration=duration;
	this.noteText="";//property dopesheet note-text
	//
	this.length=tracks;//メンバーをundefinedで初期化する。
//	
		this[0]=new XpsTimelineTrack("N","dialog",this,this.duration);

	for (var ix=1;ix < this.length-1;ix++){
	    var  myLabel=("ABCDEFGHIJKLMNOPQRSTUVWXYZ").charAt((ix-1) % 26);
		this[ix]=new XpsTimelineTrack(myLabel,"timing",this,this.duration);
	}
		this[tracks-1]=new XpsTimelineTrack("","memo",this,this.duration);
}
XpsTrackCollection.prototype = Array.prototype;
XpsTrackCollection.prototype.constractor = XpsTrackCollection;

/**
 * XpsTrackCollection にタイムラインを挿入

 * XpsTrackCollection.insertTrack(id,XpsTimelineTrack)
 * Timeline(XpsTimelineTrack object オブジェクト渡し)
 * idの前方に引数のタイムラインを挿入
 * idが未指定・範囲外の場合、後方へ挿入
 * 0番タイムラインの前方へは挿入不能(固定のデフォルトタイムライン)
 * @param myId
 * @param myTimeline
 */
XpsTrackCollection.prototype.insertTrack = function(myId,myTrack){
    var insertCount=0;
    if (myTrack.id) { myTrack=[myTrack] }
    //挿入位置を確定
    if ((!myId ) || (myId < 1) || ( myId >= this.length - 2)) {myId = this.length - 1;}
    //挿入
    for(var tc=0;tc<myTrack.length;tc++){
        if(myTrack[tc] instanceof XpsTimelineTrack) {
            this.splice(myId+tc, 0, myTrack[tc]);
            insertCount++;
        }
    }
    this.renumber();
    return insertCount;
};
/**
 * XpsTrackCollection.removeTrack([id])
 * 指定idのタイムラインを削除する
 * デフォルトの音声トラックとフレームコメントトラック及び最後のタイミングトラックの削除はできない
 * IDを単独又は配列渡しで
 * @param args
 */

XpsTrackCollection.prototype.removeTrack = function(args){
    var removeCount=0;
    if (!(args instanceof Array)) {
        args = [args]
    }
    args.sort().reverse();//ソートして反転　後方から順次削除しないと不整合が起きる
    for (var idx = 0; idx < args.length; idx++) {
        //操作範囲外の値は無視
        var targetIndex = args[idx];
        if (isNaN(targetIndex)) {
            continue;
        }
        if ((targetIndex > 0) && (targetIndex < this.length - 1)&&(this.length >3)) {
            this.splice(targetIndex, 1);
            removeCount ++;
        }
    }
    if(removeCount){this.renumber();}
    return removeCount;//削除カウントを返す
};


/**
 * トラックコレクションのindexをチェックして揃える
 * タイムライントラックのindexは親配列のindexそのもの
 */
XpsTrackCollection.prototype.renumber = function(args){
	for (var idx=0;idx<this.length;idx++){
		if(this[idx].xParent !== this) { this[idx].xParent=this; }
		if(this[idx].index != idx)     { this[idx].index  =idx ; }
	}
}
/**
 *	
 */