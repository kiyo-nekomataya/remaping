/**
 *	@fileOverview
 *	<pre> トランザクション管理部
 *	データ通信セッションのトランザクション管理を行う
 *	（ワークセッションとは異なる概念なので要注意）
 *	通信セッションの初期化と同時にセッションが開始する
 *	セッションは成功・失敗に関わらず終了時に消滅する
 *	セッションの失敗終了時はセッション内のデータ変更をリジェクトし、セッション開始時の状態にロールバックする
 *	セッションの記録はリポジトリ内にクライアントIDごとのログとして保存する
 *	セッションオブジェクト自身が、自分をコントロールしつつセッションを管理するように作る
 *	
 *
 *
 *	</pre>
 */
'usr strict';
/*
nas.Transaction = function(){
	tid		:{Number}	整数  TransactionID アプリケーションセッションごとにユニークであれば良いので整数　管理モジュールに変数を設置してカウントする,
	targat	:{Object}	トランザクションターゲット　xUI.Document|xMap|Xps|nas.Pm.PmDomain|nas.StoryBoard いずれか,
		引数としては識別子を受け付ける　与えられた識別子はオブジェクト化される？
	product :ターゲットの所属するプロダクトへの参照　または　オブジェクトまたは文字列
	backup	:{Object}	ロールバックデータ　ターゲットが null の場合 undefined
	command	:{String|Function}	Sessionの主体コマンド Stirng 処理キーワード（後述）|callback関数
	queue	:[Array of Transaction]	トランザクションキュー配列　自身のトランジションが終了時にキュー内のトランザクションをすべて開始する。
	ターゲットがxUI.Documentの場合は、本体トランザクションがないので初期化終了後にすべて開始,
	parent	:{Object}	参照親トランジション　存在しない場合は独立で実行可能　親にターゲットが存在する場合は親トランザクションの終了が自身のスタート条件となる　親のターゲットがｘUI.Documentの場合は、依存条件なしでセッション開始
	status	:{String}	トランザクションの状態 ready|send|success|failed|compleated
		ready	未処理・処理待ち
		send	送信済みレスポンス待ち
		success	成功終了
		failed	失敗終了
		compleated	包含サブトランザクションエオ含めた完了
	
トランザクションからターゲットの所属するプロダクトを得る手続き
Document	必ず documentDepot.currentProductに参照がある
xMap|Xpst(has pmu)	pmuからたどる　PmUnit.opusが所属プロダクト	存在しない場合は処理自体が不要
stbd	
}
*/
nas.Transaction = function(target,command,parent,callback,callback2){
	this.tid				;
	this.idf    = ''		;
	this.target = target	;
	this.produt             ;
	this.backup  			;
	this.rollbackQueue  	;//ロールバック用のデータスタック

	this.command = (command )? command:"pull";//コマンド文字列のみ
	this.callback  = callback ;//成功時callback コールバック関数にはトランザクション自身が第一引数で渡される　存在すれば実行
	this.callback2 = callback2;//失敗時callback コールバック関数にはトランザクション自身が第一引数で渡される　存在すれば実行
	this.queue  = [];
	this.status = 'ready';
	this.parent ;
	if(parent) this.parent = parent;

	this.tid 	= documentDepot.transactions.length;
	documentDepot.transactions.add(this);//トランザクションストアに登録
	if((this.parent)&&(this.parent.queue)) this.parent.queue.add(this);//親がトランザクションならば親のキューに登録
	if(this.target instanceof xUI.Document) {
//ログにのせるための文字列　ログに書き出す際にdecode
		this.idf = nas.Pm.getIdentifier(this.target.parent[0].content);
	}else{
		this.idf = nas.Pm.getIdentifier(this.target);
	}

	this.init();
}
/*TEST
	var tr = new nas.Transaction(xUI.documents[0],"float");
	var tr = new nas.Transaction(xUI.documents[0],"sink");
	var tr = new nas.Transaction(xUI.documents[0],"activate");
	var tr = new nas.Transaction(xUI.documents[0],"deactivate");
	var tr = new nas.Transaction(xUI.documents[1],"checkin");
	var tr = new nas.Transaction(xUI.documents[0],"checkout");
	var tr = new nas.Transaction(xUI.documents[0],"abort");
	var tr = new nas.Transaction(xUI.documents[0],"destroy");
	var tr = new nas.Transaction(xUI.documents[0],"reseipt");
	var tr = new nas.Transaction(xUI.documents[0],"pull");
	var tr = new nas.Transaction(xUI.documents[0],"push");

	var tr = new nas.Transaction(xUI.documents[0],"pull",xUI.resetReceipt);
	var tr = new nas.Transaction(xUI.XPS,"pull",xUI.resetSheet);

*/
/*
	トランザクション初期化　ロールバックデータを取得してトランザクションを開始する
	開始されたトランザクションは開始条件が整っていれば開始
	コールバックチェーンを設定する
	トランザクションの開始条件として先行トランザクションの成功終了が必要
	リジェクトの場合は、チェーン全体がキャンセルされてロールバックが発生する
	1:1チェーンでなく　1:多チェーンを作る
	queueにトランザクションを置く
	トランザクションが成功終了したときqueue内のトランザクションをすべて実行
	キュー内のトランザクションがすべてコミットされたとき親がコミットされる
	queue内にトランザクションがない場合はその場でコミット
	トランザクションが終了
*/
nas.Transaction.prototype.init = function(){
//バックアップを初期化
	if((this.target instanceof xMap)||(this.target instanceof Xps)){
		this.backup = this.target.toString();
	}else if(this.target instanceof nas.StoryBoard){
		this.backup = this.target.toString('full');
	}else if(this.target instanceof nas.Pm.PmDomain){
		this.backup = this.target.dump('JSON');
	}else if(this.target instanceof xUI.Document){
//現在のドキュメントに含まれるデータを処理する
		this.backup = this.target.content.toString();//xMap,Xps問わず
//ターゲットがxMap(代表オブジェクト)だった場合
		if(this.target.content instanceof xMap){
// コマンド及びデータの編集状態によって分岐 
// command
// activate|checkin|branch|float|pull|push	サブトランザクション不用
// deactivate|checkout						変更のあるタイムシートをサブトランザクションとして登録
// abort|sink								関連タイムシート(カット)をすべてサブトランザクションとして登録
// destroy									関連タイムシートのうち、代表オブジェクトとステータスの一致するショットを
//											すべてのコマンドで関連するstbdのエントリを更新
			if((this.command == 'deactivate')||(this.command == 'checkout')){
//サブトランザクションとして、配下の編集済みかつアクティブのXpsをcontentに持つDocumentをトランザクションに加える
				for (var i = 1 ; i < this.target.parent.length ; i++){
					if(
						(this.target.parent[i].content.pmu.checkinNode)&&
						(this.target.parent[i].content.pmu.checkinNode.jobStatus.content = "Active")&&
						(this.target.parent[i].undoBuffer.storePt != 0 && this.target.parent[i].undoBuffer.undoPt !=0)
					)
					new nas.Transaction(this.target.parent[i],this.command,this);
				}
			}else if((this.command == 'abort')||(this.command == 'sink')){
//サブトランザクションとして、配下のXpsをcontentに持つDocumentを無条件で全部トランザクションに加える
				for (var i = 1 ; i < this.target.parent.length ; i++){
					new nas.Transaction(this.target.parent[i],this.command,this);
				}
			}else if(this.command == 'destroy'){
//内包カットの最終ジョブがカレントと一致している場合のみサブトランザクションを登録する
				for (var i = 1 ; i < this.target.parent.length ; i++){
					if(this.target.parent[i].content.pmu.nodeManager.getNode().getPath()==this.target.content.pmu.currentNode.getPath()){
						if(this.target.parent[i].content.pmu.activate(this.target.content.pmu.currentNode.updateUser))
						new nas.Transaction(this.target.parent[i],'destroy',this);
					}
				}
			}
//所属するstbdの更新トランザクション
			if(this.target.content.pmu.opus.stbd)
			new nas.Transaction(this.target.content.pmu.opus.stbd,'pull',this);
		}else if(this.target.content instanceof xMap){
//所属するstbdの更新トランザクション
			new nas.Transaction(this.target.pmu.opus.stbd,'pull',this);
		}
	}
//親トランザクションがない場合　自分自身をスタートする
	if(! this.parent) this.start()
}
/**
 *	
 */
nas.Transaction.prototype.start = function(){
console.log("start :" + this.toString());
	if(
		(this.status == 'ready')&&
		((! this.parent)||(this.parent.target instanceof xUI.Document))||
		((this.parent)&&(this.parent.status == 'success'))
	){
		this.status = 'send';
		var logmsg = [this.tid,"start",this.idf,"("+this.status+")",new Date().toNASString()].join('\t');
		documentDepot.transactions.log.push(logmsg);
		serviceAgent.checkTimestamp(this);
	}
}
/**
 *	
 */
nas.Transaction.prototype.success = function(){
console.log("success :" + this.toString());
	var logmsg = [this.tid,'success',this.idf,"("+this.status+")",new Date().toNASString()].join('\t');
	documentDepot.transactions.log.push(logmsg);
	if(this.queue.length){
		this.status = 'success';
		for (var tx = 0;tx < this.queue.length; tx ++){
			logmsg = [this.queue[tx].tid,"send",this.queue[tx].idf,"("+this.status+")",new Date().toNASString()].join('\t');
			documentDepot.transactions.log.push(logmsg);
			this.queue[tx].start();
		}
	}else{
		this.status = 'compleated';
		this.commit();
	}
	if((this.parent)&&(this.parent.queue)&&(this.parent.queue.length)){
		var cc = 0;
		for(var qix=0;qix < this.parent.queue.length;qix ++){
			if(this.parent.queue[qix].status == 'compleated') cc ++;
		}
		if(this.parent.queue.length == cc){
//自分自身を含むサブトランザクションのステータスがすべてcompleated
			this.parent.status ='compleated';
			this.parent.commit();
		}
	}
}
/**
 *	
 */
nas.Transaction.prototype.commit = function(){
console.log("commit :" + this.toString());
	var logmsg = [this.tid,'commit',this.idf,"("+this.status+")",new Date().toNASString()].join('\t');
	documentDepot.transactions.log.push(logmsg);
	if(this.callback instanceof Function) this.callback(this);
	if(this.target instanceof xUI.Document){
		serviceAgent.currentRepository.updatePMDB();
		xUI.sync('productStatus');
	}
}
/**
 *	
 */

nas.Transaction.prototype.fail = function(){
console.log("fail :" + this.toString());
	this.status = 'failed';
	var logmsg = [this.tid,'fail',this.idf,"("+this.status+")",new Date().toNASString()].join('\t');
	documentDepot.transactions.log.push(logmsg);
	if(this.parent instanceof nas.Transaction){
//親トランザクションがあれば親のfailを呼ぶ
		this.parent.fail();
	}else{
//親がなければ　子供すべてをロールバックして終了
		for (var qx = 0 ;qx < this.queue.length;qx ++){
			if(this.queue[qx].status == 'success') this.queue[qx].rollback();
		}
		this.rollback();
	}
	if(this.callback2 instanceof  Function) this.callback2(this);
}
/**
 *	識別行を返す
 */
nas.Transaction.prototype.toString = function(){
	var name = '';
	if (this.target instanceof xUI.Document){
		name = 'document-'+ this.target.id + ":"+decodeURIComponent(this.idf);
	}else{
		name = decodeURIComponent(this.idf);
	}
	return [this.tid,this.command,name].join(':');
}
/**
 *	ロールバックを実行
 *
 *
 *
 *
 */
nas.Transaction.prototype.rollback = function(){
console.log("rollback :" + this.toString());
  if(
  	(this.status == 'saccess')&&
  	(this.command.match(/pull|checkin|checkout|activate|deactivate|/))
  ){
//ロールバック
	if(this.target instanceof xMap){
		this.taget.parsexMap(this.backup);
	}else if(this.target instanceof Xps){
		this.taget.parseXps(this.backup);
	}else if(this.target instanceof nas.StoryBoard){
		this.taget.parseScript(this.backup);
	}else if(this.target instanceof nas.Pm.PmDomain){
		this.taget.parseConfig(this.backup);
	}else if(this.target instanceof xUI.Document){
		if(this.content instanceof xMap) this.target.content.parsexMap(this.backup);
		if(this.content instanceof Xps)  this.target.content.parseXps(this.backup);
	}
  }
}

/*トランザクショントレーラー　全トランザクションとログ情報を保持する配列*/
documentDepot.transactions = [];
documentDepot.transactions.log = [];

documentDepot.transactions.log.dump = function(){
	var result = "";
	for (var i = 0;i< this.length;i ++){
		result += decodeURIComponent(this[i])+'\n';
	}
	return result;
}
/**
 *    現在のドキュメントにチェックインする
 *	ターゲットドキュメントがXpsの場合は、xMapのチェックイン状態を先に確認する
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.checkin = function(callback,callback2){
	if(
		(!xUI.activeDocument.content.pmu.checkinNode)&&(
			((xUI.activeDocumentId > 0)&&(xUI.documents[0].content.pmu.checkinNode))||
			(xUI.activeDocumentId == 0)
		)
	){
console.log(((xUI.activeDocumentId > 0)&&(xUI.documents[0].content.pmu.checkinNode)));
console.log(xUI.activeDocument)
		var tr = new nas.Transaction(xUI.activeDocument,"checkin",callback,callback2);
	}else {
console.log('checkin failed');
		if(callback2 instanceof Function) callback2();		
	}
}
/**
 *    現在のドキュメントをチェックアウトする
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 *    戻値なし
 *    アクティブドキュメントがxMapの場合はすべてのチェックイン中のデータからチェックアウトする
 */
documentDepot.checkout = function(callback,callback2){
	if(!(xUI.activeDocument.content.pmu.checkinNode)){
consoel.log ('cannot checkout no checkin')
		return ;
	};//チェックインしていない（チェックアウトできない）
	var tr = new nas.Transaction(xUI.activeDocument,"checkout",callback,callback2);
}
/**
 *    現在のドキュメントをアクティベートする
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.activate = function(callback,callback2){
	if((
		(xUI.activeDocument.content.pmu.currentNode.jobStatus.content == 'Hold')||
		(xUI.activeDocument.content.pmu.currentNode.jobStatus.content == 'Fixed')
	)&&(
		(xUI.currentUser.sameAs(xUI.activeDocument.content.pmu.currentNode.updateUser))
	)){
		var tr = new nas.Transaction(xUI.activeDocument,"activate",callback,callback2);
	}
	 return;
}
/**
 *    現在のドキュメントをディアクティベートする
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 *    アクティブドキュメントがxMapの場合はすべてのアクティブなドキュメントをそれぞれディアクティベートして終了時にリザルトを返す
 *    Xpsの場合は
 */
documentDepot.deactivate = function(callback,callback2){
	if(xUI.activeDocument.content.pmu.checkinNode.jobStatus.content == 'Active')
	var tr = new nas.Transaction(xUI.activeDocument,"deactivate",callback,callback2);
}
/**
 *    エントリを破棄する
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.destroy = function(callback,callback2){
console.log("destroy");
	if(xUI.activeDocument.content.pmu.checkinNode.jobStatus.content == 'Active')
	var tr = new nas.Transaction(xUI.activeDocument,"destroy",callback,callback2);
}
/**
 *    エントリを中断する
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.abort = function(callback,callback2){

console.log("abort");
}
/**
 *    エントリを引き上げる
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.salvage = function(callback,callback2){


console.log("salvage");
}
/**
 *    エントリを検収する
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.receipt = function(callback,callback2){

console.log("receipt");
}
/**
 *    エントリを分岐する
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.brunch = function(callback,callback2){

console.log("brunch");
}
/**
 *    エントリをライン検収する
 *    @params	{Function}	callback    成功時コールバック関数
 *    @params	{Function}	callback2   失敗時コールバック関数
 */
documentDepot.mergeLine = function(callback,callback2){
console.log("mergeLine");
}

/*
チェックイン操作のレイヤー化

アプリケーションレベルのチェックイン

	xUI.uiMode	browsing|production|management

	◎管理バーUIの色で状況を表示する	緑|青|赤 GBR もう１色加えるなら黄色
	ミドリは専有状態が発生していない

ドキュメント（カット袋）レベルのチェックイン
	documents[0].content.checkinNode	　ノードが存在すればチェックイン中
	ライン、ステージ、ジョブの専有（排他状態）
	内包するカット全てにチェックインした状態

データ（タイムシート）レベルのチェックイン
カット
	◎管理バーUIのボタン状態とアイコンできれば加えてカラーで状態表示
	xMap	ドキュメント群の代表データ
	Xps		代表データにチェックインが行われていない場合はチェックインできない（チェックイン条件）
			代表データにチェックイン済みの場合は自動選択が働く
			チェックアウト時の変更のみが有効
	チェックイン条件は親のカット袋にチェックインが行われていること
	チェックインが行われると親のドキュメントのノードへのチェックインが発生する（間が空いてもそこは飛ばす）

	たとえば、カット袋が　[動画].動画.(本線).　に対してチェックインされている場合
	先行データ（Xps）のステータス　[原画].原画.(本線).に対して　[動画].動画.(本線).のチェックインが自動で発生する。
	中間にあったかもしれない　[作監].原画.(本線). [演出].原画.(本線). [監督].原画.(本線). 等のノードのタイムシートがなくともOK
	ステージのイニシエーションジョブである　[初期化].動画.(本線).　もタイムシートを持つ必要はない（あっても良い）
	
	中間ノードのタイムシートは　あれば読む
	なければ適切にスキップ
	
	documents.checkin｜documents.checkoutがコントローラーメソッドになる
*/