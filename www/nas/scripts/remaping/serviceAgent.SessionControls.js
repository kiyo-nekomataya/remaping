/*
	リポジトリに対するタイムスタンプ照合請求
	タイムスタンプを照合
	不整合の場合最新データを請求してマージ後に自身を再呼び出し
*/
xUI.checkTimeStamp = function(callback){
	
}



/**
 *	タイムスタンプ照合メソッド
 *	@params {Object nas.Transaction}    transaction
 *	トランザクションオブジェクトを引数
 *	各データの所属リポジトリの照合メソッドへ振り分けを行う
 *
 *	タイムスタンプ照合メソッドは、サービスエージェント及び各リポジトリに実装
 *	サービスエージェントがデータのリポジトリを見てリポジトリのメソッドに振り分け
 *	フローティングデータの場合はサービスエージェントのメソッドが処理を代行する
 *
 *	コマンドの種別は以下
 *	activate:deactivate:checkin:checkout(=commit):destroy:abort:receipt:branch:pull:push:flash:
 *
 */
serviceAgent.checkTimestamp = function(transaction){
//リポジトリ内データか否かを判別 リポジトリ外のデータの場合はチェックが省略される
//チェック通過後はコマンドにデータ渡し
	var contentData = (transaction.target instanceof xUI.Document)? transaction.target.content:transaction.target;

	if(
		((transaction.target instanceof xUI.Document)&&(!(contentData.dataNode)))||
		(!(contentData.dataNode))
	){
//リポジトリ非所属データなのでサービスエージェントがコマンドを実行する（チェックは無条件で通過）
//トランザクションターゲットがxUI.Document
//var abrt = confirm('skip timestamp check');
//if(abrt){}else{transaction.fail();}
console.log('call xUI.manipulateDocument:::')
		xUI.manipulateDocument(transaction);

	}else if(contentData.dataNode == this.currentRepository.toString()){
//リポジトリ所属データなのでトランザクションごと各リポジトリへの引き渡しのみを行う
console.log('send timestamp check to: '+ serviceAgent.currentRepository.name);
		serviceAgent.currentRepository.checkTimestamp(transaction);
	}else{
//エラー　現在アクセス不能なリポジトリのデータ　トランザクションは失敗
console.log(['no match repository :',transaction]);
		transaction.fail();
	}
}

/*
anyRepository.checkTimestamp(transaction)

照合成功で次処理 > methodによって分岐処理
	float		:
	sink		:
	activate	:
	deactivate	:
	checkin		:
	checkout	:
	destroy		:
	abort		:
	reseipt		:
	branch		:
	flash		:引数データの更新　自動処理がコールする　現状のステータス等を変更せずデータの更新のみを行う
照合失敗でマージメソッドにデータ渡し
	マージメソッドは、タイムスタンプ照合メソッドに処理を戻す


引数データを最新データとマージしてアップデートする
アップデート後にコールバックを実行
コールバックがメソッド文字列であれば、定形処理を行う
コールバックが関数なら関数を実行
*/
/**
	 引数データを当該リポジトリにプッシュしてコールバックを実行する
	 引数がxUI.Documentの場合は、dosuments内のデータをすべて処理して代表xMapに対してコールバックを実行する
	 リポジトリに所属しないデータが引き渡された場合は、該当データを現リポジトリに新規に登録する
*/
serviceAgent.pushContent = function(transaction){
console.log('svApushContent :'+ decodeURIComponent(transaction.idf));
//リポジトリ内データか否かを判別 リポジトリ外のデータの場合はチェックが省略される
//チェック通過後はコマンドにデータ渡し
	var contentData = (transaction.target instanceof xUI.Document)? transaction.target.content:transaction.target;
	if(
		((transaction.target instanceof xUI.Document)&&(!(contentData.dataNode)))||
		(!(contentData.dataNode))
	){
//Floationg(リポジトリのない)データなのでサービスエージェント本体がコマンドを実行する（チェックは無条件で通過する）
console.log('skip pushContent');
			transaction.success();
	}else if(contentData.dataNode == this.currentRepository.toString()){
//リポジトリ所属データなのでトランザクションごと各リポジトリへの引き渡しのみを行う
console.log('send data push');
		serviceAgent.currentRepository.pushContent(transaction);
	}else{
//エラー　現在アクセス不能なリポジトリのデータ　トランザクションは失敗
console.log(['no match repository :',transaction]);
		transaction.fail();
	}
}
/*
	pullContent
	引数データを最新状態にアップデートしてコールバックを実行する
	params	{String|Object|Object Transaction}
	引数がxUI.Documentの場合は、dosuments内のデータをすべて処理して代表xMapに対してコールバックを実行する
	コールバックが関数の場合は第一引数に引数データを渡す
	リポジトリに所属しない引数データが与えられた場合は、データプルを行わず、コールバックのみを実行する
*/
serviceAgent.pullContent = function(transaction){
//リポジトリ内データか否かを判別 リポジトリ外のデータの場合はチェックが省略される
//チェック通過後はコマンドにデータ渡し
	var contentData = (transaction.target instanceof xUI.Document)? transaction.target.content:transaction.target;
	if(
		((transaction.target instanceof xUI.Document)&&(!(contentData.dataNode)))||
		(!(contentData.dataNode))
	){
//所属リポジトリのない浮動データなのでサービスエージェント本体がコマンドを実行する（チェックは無条件で通過する）
console.log('skip pullContent');
		if(transaction.command == 'pull'){
			transaction.success();
		}else{
			xUI.manipulateDocument(transaction);
		}
	}else if(contentData.dataNode == this.currentRepository.toString()){
//リポジトリ所属データなのでトランザクションごと各リポジトリへの引き渡しのみを行う
console.log('send data pull');
		serviceAgent.currentRepository.pullContent(transaction);
	}else{
//エラー　現在アクセス不能なリポジトリのデータ　トランザクションは失敗
console.log(['no match repository :',transaction]);
		transaction.fail();
	}
}
/*
　ローカルリポジトリ　タイムスタンプ照合メソッド

	引数データとしてトランザクションオブジェクトを渡す
	対応するエントリのタイムスタンプを取得して照合
	（データ更新を同時に行っても良い？）
	照合内容に従ってコールバックを実行する
	コールバックが文字列引数の場合は定形処理に振り分けを行う

activate:deactivate:checkin:checkout(=commit):destroy:abort:receipt:branch:pull:push:flash:

*/
localRepository.checkTimestamp = function(transaction){
console.log('loRcktimestamp :'+ decodeURIComponent(transaction.idf));
console.log(transaction);
	var idf         = transaction.idf;
	if(transaction.queue.length > 1){
		transaction.status = 'send';
	}else{
		var contentData = transaction.target;
		var callback    = transaction.command;
		var targetData = contentData;
//		var entry = this.baseStorage.entryList.getByIdf(idf);
		var entry = this.entry(idf);//stbd.cutでリザルトが戻る
		if(entry){
console.log([entry.timestamp,targetData.timestamp]);
			if(entry.timestamp > targetData.timestamp){
//リポジトリ側のtimestampが新しいのでデータ更新してから処理
console.log('data pull');
				localRepository.pullContent(transaction);
			}else{
//最新データと考えられるので、直接メソッドを実行
console.log('document manipulate');
				xUI.manipulateDocument(transaction);
			}
		}else{
//データ取得に失敗
console.log('transaction.fail');
			transaction.fail();
		}
	}
}
/**<pre>
 *	ローカルリポジトリに格納されたデータで引数データを更新の上、コールバックを実行する
 *	pullContent(トランザクション)
 *	引数データを最新状態にアップデートしてコールバックを実行する
 *	引数がxUI.Documentの場合は、dosuments内のデータをすべて処理して代表xMapに対してコールバックを実行する
 *	コールバックが関数の場合は第一引数に引数データをすべて渡す
 *	リポジトリに所属しない引数データが与えられた場合は、不正引数としてトランザクションを失敗させる
 *	</pre>
 *	@params	{Object xUI.Docuemnt|Object}	 contentData
 *	@params	{Function | String}	callback
 *	
 */
localRepository.pullContent = function(transaction){
	var contentData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
	var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);
	var entry;//対応エントリをローカルリポジトリから引き出す（存在しない｜トークンのないケースも有る）
	if(idfInfo.type == 'xpst'){
//xpstは最新データのみが処理対象なので限定してショットエントリのみを呼び出す
		entry = this.entry(transaction.idf,'shot');
	}else{ ;//other
		entry = this.entry(transaction.idf);
	};//*/
	if(! entry){
//データエントリ取得失敗
console.log(['no data in localRepository.entry :',transaction]);
		transaction.fail();
	}
//エントリ既存&トークンなしの条件下ではpull可能なデータが存在しないので処理をスキップしてつぎの処理へ移行OK
	if(!entry.token){
			if(transaction.command == 'push'){
				localRepository.pushContent(transaction);
			}else if(transaction.command == 'pull'){
				transaction.success();
			}else{
				xUI.manipulateDocument(transaction);
			}
	} else if(contentData.pmu){
//ここでタイムスタンプ比較を行う　タイムスタンプが一致していたら更新操作自体が不要
	  if(entry.timestamp > contentData.timestamp){
//pmuを持つデータ　xMap|Xpst 
		var currentContent = localStorage.getItem(entry.token);//最新データ取得となる
		if (idfInfo.type == 'xmap'){
//既存xMap 編集可能性のある場合はマージ|ない場合は読込|
			switch(transaction.command){
			case "activate"  :;//pull
			case "checkin"   :;//pull
			case "receipt"   :;//pull
			case "branch"    :;//pull
			case "flash"     :;//pull
				contentData.parsexMap(currentContent);
			break;
			case "deactivate":;//merge
			case "checkout"  :;//merge
			case "pull"      :;//merge
			case "push"      :;//merge
				var newxMap = new xMap();
				newxMap.parsexMap(currentContent);
				contentData.merge(newXmap);
			break;
			case "destroy"   :;//NOP
			case "abort"     :;//NOP
			default:;
				;//NOP
			}
		}else{
//既存　Xpst
			if(currentContent) contentData.parseXps(currentContent);
		}
	  }else{
//データタイムスタンプが一致または古いので更新をスキップ
console.log(['match or older data detect',entry]);
	  }
		if(transaction.command=='pull'){
			transaction.success();
		}else{
			xUI.manipulateDocument(transaction);
		}
	}else{
//pmdb|stbd
		var currentContent = localStorage.getItem(entry.token);//
		if(idfInfo.type == 'pmdb'){
//PMDB 単純なデータのパースでなく、このタイミングでデータのマージ更新を行う　アップデートモジュールを作成する
			contentData.parseConfig(currentContent);
		}else{
//STBD 単純なデータのパースでなく、このタイミングでデータのマージ更新を行う　アップデートモジュールを作成する
			contentData.parseScript(currentContent);
		}
		if(transaction.command=='pull'){
			transaction.success();
		}else{
//push以外の選択肢がないので渡す
			this.pushContent(transaction);
		}
	}
}

localRepository.checkTimestamp =　localRepository.pullContent;//直行
/*
	pushContent
	引数データを最新状態としてリポジトリに保存の後コールバックを実行する
	引数がxUI.Documentの場合は、dosuments内のデータをすべて処理して代表xMapに対してコールバックを実行する
	コールバックが関数の場合は第一引数として引数データを渡す
	リポジトリに所属しない引数データが与えられた場合は、データをリポジトリに保存して、コールバックを実行する
	保存データがタイムスタンプをもたない場合、保存時のタイムスタンプを印加する？（できるようにして様子を見る）

	getxMap|getXpstからpushContentをコールする場合はトランザクションでなくオブジェクトを直接か？
	>>こちら方向のコールは行なわないことにする

	putEntryとの統合は様子見の見送り
	基本的な考えとしてすべての保存をトランザクションに移行が望ましい
	putEntryはデバッグのためだけに残すが将来的には廃止

	>>pushContentをtransaction処理専用メソッドにする　2020.04.22
	
*/
/*
	xMapとXpsのローカルリポジトリ上のデータ扱いの差
	xMap	常時マスターデータ１つ
			新規データは必ずキーが異なる(最小の変更であってもタイムスタンプが変わる)
			push成功時は元のデータが存在すればそれを消去する
			コマンドが'destroy'の場合でも動作は同じ（前データは必ず消去）

	Xps		マスターデータはジョブごとに１つ
			新規データは必ずキーが異なる(最小の変更であってもタイムスタンプが変わる)
			ジョブが変わった場合前データの消去は行わない（前データのジョブが現データと一致している場合のみ消去）
			コマンドが'destroy'の場合はプッシュするデータに関わらず保存を行わず、最終データの消去のみを行う

	基本動作として、ストアに成功 > 前データを消去
	例外条件は　前データが無い場合（バックアップもない）｜Xpsで前データと現データのJobが異なる場合（ロールバックは）
*/
//既存データ消去(すべてのケースで消去対象のデータが有れば消去)
//　データ保存の成功時にトランザクションの成功処理で消去を行うのが構成が単純化するか？
// 行った場合
//	ロールバックが基本的に不要となる
//	成功処理内でエラーが発生する可能性が高くなる
//　ここで消去を行う場合
//	消去記録を必要とする
//	処理失敗ロールバック時に消去手順を遡る必要がある
//	手順ごとに復帰メソッドをエラーコールバックのためにキューに積む

localRepository.pushContent = function(transaction){
console.log('push content to loalRepositiry : '+ decodeURIComponent(transaction.idf));

	var contentData = (transaction.target instanceof xUI.Document)? transaction.target.content:transaction.target;
	if(! contentData.timestamp) contentData.timestamp = new Date().getTime();//タイムスタンプがアタッチされないデータの場合このタイミンイグで印加
	var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);	
	var entry;//対応エントリをpmdb|stbdから引き出す（存在しないケースも有る）
	if(idfInfo.type == 'xpst'){;//xpst
		entry = this.entry(transaction.idf,'shot');
	}else{ ;//other
		entry = this.entry(transaction.idf);
	}
console.log([entry,contentData]);
	if(!entry){
//データエントリ取得失敗リジェクト
		transaction.fail();
	}
		if(contentData.pmu){
//pmuを持つデータ　xMap|Xpst 
			transaction.rollbackQueue = [];//リポジトリのバックアップ
			if( entry.token ){
				transaction.rollbackQueue.push(
					{
						key     : entry.token,
						content : localStorage.getItem(entry.token)
					}
				);
			}
//コマンドにより必要あれば書き込み
			if((transaction.command == 'destroy')&&(idfInfo.type == xps)){
				var stored = true;//書き込むデータは無いのでスキップして　フラグのみ立てる
			}else{
				var pushKey     = localRepository.baseStorage.keyPrefix+nas.Pm.getIdentifier(contentData,'full');
				var pushContent = contentData.toString();
				localStorage.setItem(pushKey,pushContent);
				var stored = (localStorage.getItem(pushKey)==pushContent)? true:false;
			}
console.log(stored ? "保存成功":"保存失敗");
console.log(localStorage.getItem(pushKey))
			if(! stored){
//保存失敗想定外エラー
console.log(['想定外エラー :',transaction]);
				transaction.fail();
			}else if(
				(transaction.rollbackQueue.length)&&(
					(idfInfo.type == 'xmap')||
					(
						(idfInfo.type == 'xpst')&&
						(idfInfo.status.content==entry.currentStatus.content)
					)
				)
			){
//書込み成功時は不要になった旧データを削除　xmap|では常に xpsではステータスが一致している場合
				localStorage.removeItem(transaction.rollbackQueue[0].key);
				var removed = (localStorage.getItem(transaction.rollbackQueue[0].key) == null)? true:false;
				if(removed){
					transaction.success();
				}else{
					transaction.fail();
				}
			}
//ストアが行われて消去データが存在しない場合 基本的にトランザクションは成功
			if(stored){
				transaction.success();
			}else{
console.log(['command pull : deteected error :',transaction]);
				return;
			}
	}else{
//pmdb|stbd
		if(entry){
			transaction.rollbackQueue = [];//ロールバックリスト初期化
			transaction.rollbackQueue.push({
				key     : entry.token,
				content : localStorage.getItem(transaction.rollbackQueue.key)
			})
		}
//console.log(transaction.rollbackQueue)
//このタイミングでタイムスタンプは印加済み
		var pushKey     = localRepository.baseStorage.keyPrefix+nas.Pm.getIdentifier(contentData,'full');
		var pushContent = (idfInfo.type == 'pmdb' )?
			contentData.dump('plain-text'):contentData.toString('dataChash');//pmdb|stbd
		localStorage.setItem(pushKey,pushContent);
		var stored = localStorage.getItem(pushKey);
//既存データ消去(すべてのコマンドケースで消去対象のデータが有れば消去)
		if ((stored)&&(transaction.rollbackQueue.length)){
			localStorage.removeItem(transaction.rollbackQueue[0].key);
			var removed = (localStorage.getItem(transaction.rollbackQueue[0].key) == null)? true:false;
			if(removed){
				transaction.success();
			}else{
				transaction.fail();
			}
		} else if(stored){
				transaction.success();
		} else {
				transaction.fail();
		}
	}
}
/*
	test
*/
/*
　ネットワークリポジトリ　タイムスタンプ照合｜データ取得メソッド

	引数データとしてトランザクションオブジェクトを渡す
	対応するエントリのタイムスタンプを取得して照合
	（データ更新を同時に行っても良い？）
	照合内容に従ってコールバックを実行する
	コールバックが文字列引数の場合は定形処理に振り分けを行う

現時点ではcheckとpullが等価処理となることに注意(チェック専用のAPIがない+たいして効率の上昇が見込めない)
command list
activate:deactivate:checkin:checkout(=commit):destroy:abort:receipt:branch:pull:push:flash:

タイムスタンプのチェック対象は、ドキュメントの場合は以下の順序で解決する
ドキュメントのタイムスタンプチェック
	アンマッチ	再取得　pull 成功で再処理
	マッチ		各トランザクションの処理に移行
タイムスタンプ専用のAPIでない場合は、チェック時に現コンテンツが得られるので、check工程はpull処理に含まれる
*/
/*	ネットワークリポジトリに格納されたデータで引数データを更新の上、コールバックを実行する
	pullContent
	引数データを最新状態にアップデートしてコールバックを実行する
	タイムスタンプの比較を行い、最新データである場合は不要処理をスキップして次の処理を実行する
	引数がxUI.Documentの場合は、dosuments内のデータをすべて処理して代表xMapに対してコールバックを実行する
	コールバックが関数の場合は第一引数に引数データを渡す
	リポジトリに所属しない引数データが与えられた場合は、データプルを行わず、コールバックのみを実行する ＊＊この部分は割愛してもよい
	@params	{Object xUI.Docuemnt|Object}	 contentData
	@params	{Function | String}	callback
	
*/
NetworkRepository.prototype.pullContent = function(transaction){
console.log('pullContent :' +  decodeURIComponent(transaction.idf));
console.log(transaction);
	var contentData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
	var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);

	var targetAddress  ;//リクエスト先アドレス
	var receiveMethod  ;//受信メソッド
	var receiverFn     ;//データ処理メソッド
//対応エントリを リポジトリから取得（存在しないケースも有る）
	var entry       = this.entry(transaction.idf,1);
	var currentOpus = this.pmdb.products.entry(transaction.idf,0);
//エントリが存在しないケース　新規作成エントリ|キャッシュ時未成エントリ
//共通処理
//リポジトリ状態の更新
//	エントリ発見	:エントリにたいして更新
//	エントリ不明	:エントリ新規作成　新規作成後にリポジトリ再更新
//URLを特定して処理を振り分ける
//xMap|Xpstのビルドは処理内に組み込む
	if(idfInfo.type == 'pmdb'){
		var targetDomain;
//
		if(contentData.token){
			targetAddress = "/api/v2/properties/" + contentData.token + ".json";//Repository
		}else if(dataInfo.opus){
//エピソードpmdb
			targetAddress = "/api/v2/episodes/"   + currentOpus.token + "/property.json";//Episode
		}else if(dataInfo.title){
//タイトルpmdb
			targetAddress = "/api/v2/products/"   + currentOpus.title.tokne   + "/property.json";//Title
		}else{
//リポジトリpmdb
			targetAddress = "/api/v2/properties/" + repositoryPropertyToken + ".json";//Repository
		}

		receiveMethod = NetworkRepository.receivePmdb;

	}else if(idfInfo.type == 'stbd'){
		targetAddress = "/api/v2/storyboards.json?episode_token="+dataInfo.opus.token;
		receiveMethod = NetworkRepository.receiveStbd;
	}else{
//xpst|xmap
//エントリが存在しない場合は再取得
		if((entry)&&(entry.token)){
			if(idfInfo.type == 'xmap'){
				targetAddress = "/api/v2/cut_bags/"+entry.token+".json";
				receiveMethod = NetworkRepository.receivexMap;
			}else if(idfInfo.type == 'xpst'){
				targetAddress = "/api/v2/cuts/"+entry.token+".json";
				receiveMethod = NetworkRepository.receiveXpst;
			}
		}else{
//			this.updateRepository(transaction);
//			this.updatePMDB(transaction);
console.log(entry);
			return false;
		}
	}
		var req = new UATRequest(
			targetAddress,
			receiveMethod,
			transaction,
			null,
			this.token,
			"GET",
			'json',
			(xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
			(xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
		);
console.log(req);
		var TSK = new UItask(req,100,1);
		xUI.taskQueue.addTask(TSK);
};//NetworkRepository.prototype.pullContent
/*
	タイムスタンプチェックを行う独立メソッドは不要（pullメソッドがチェックを行う）
	参照を作成
*/
NetworkRepository.prototype.checkTimestamp = NetworkRepository.prototype.pullContent;
/*
	pushContent
	引数データを最新状態としてリポジトリに保存の後コールバックを実行する
	引数がxUI.Documentの場合は、dosuments内のデータをすべて処理して代表xMapに対してコールバックを実行する
	コールバックが関数の場合は第一引数として引数データを渡す
	リポジトリに所属しない引数データが与えられた場合は、データをリポジトリに保存して、コールバックを実行する
	保存データがタイムスタンプをもたない場合、保存時のタイムスタンプを印加する
*/
NetworkRepository.prototype.pushContent = function(transaction){
	var contentData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
	if(! contentData.timestamp) contentData.timestamp = new Date().getTime();//(timestamp == 0のケースを含む)
	var idfInfo     = nas.Pm.parseIdentifier(transaction.idf);	

	var targetAddress  ;//リクエスト先アドレス
	var dataMethod     ;//リクエスト通信メソッド
	var sendData       ;//送信データオブジェクト
	var receiverFn     ;//データ処理メソッド

//対応エントリを リポジトリから取得（存在しないケースも有る）
	var entry = (contentData.pmu)? this.entry(transaction.idf,1):null;
	var currentOpus = this.pmdb.products.entry(transaction.idf,0);

//エントリが存在しないケースは　新規作成エントリ|キャッシュ時未成エントリ
//共通処理
//	リポジトリ状態の更新
//		エントリ発見	:エントリにたいして更新
//		エントリ不明	:エントリ新規作成　新規作成後にリポジトリ再更新
//URLを特定して処理を振り分ける
//xMap|Xpstのビルドは処理内に組み込む
//エントリが存在する場合は　トークンの有無で処理が分かれるが無トークンのエントリは基本的には存在しない
//新規エントリは		エントリなしの状態で認識されるのでその場合は新規作成
	if(idfInfo.type == "pmdb"){
		sendData = {
			property: {}
		};
//pmdbのドメインによってアドレス分岐 コーディング保留
//		if()
//		targetAddress = "/api/v2/properties/.json//Repository
//		targetAddress = "/api/v2/cut_bags.json?episode_token=";//WorkTitle
//		targetAddress = "/api/v2/cut_bags.json?episode_token=";//Opus
//		targetAddress = "/api/v2/cut_bags.json?episode_token=";

	}else if(idfInfo.type == "stbd"){
		sendData = {
			storyboard: {
				name: 	storyboardName,
				description: storyboardDescription,
				content: storyboardContent
			}
		};
		if(currentOpus.stbd.token){
//既存エントリの更新
			targetAddress = "/api/v2/storyboards/"+currentOpus.stbd.token+".json";
			dataMethod    = "PUT";
		}else{
			targetAddress = "/api/v2/storyboards.json";
			dataMethod    = "POST";
			sendData.episode_token = currentOpus.token;//<<<
		}
	}else if(idfInfo.type == "xpst"){
		sendData   = {
			cut: {
				name:        contentData.pmu.inherit[0].toString(),
				description: transaction.idf,
				line_id:     contentData.line.toString(true),
				stage_id:    contentData.stage.toString(true),
				job_id:      contentData.job.toString(true),
				status:      contentData.currentStatus.toString(),
				content:     contentData.toString()
			}
		};
		if(entry.token){
//データ更新　エントリ＋トークンあり
			targetAddress = "/api/v2/cuts/"+entry.token+".json";
			detaMethod    = "PUT";
			sendData.cut_token = entry.token;
		}else{
			targetAddress = "/api/v2/cuts.json";//新規作成　トークンなし
			detaMethod    = "POST";//新規作成　エントリなし
//追加プロパティ
			sendData.episode_token = currentOpus.token;//<<<
		}
	}else if(idfInfo.type == 'xmap'){
		sendData = {
//エントリ名は sシーン番号-cカット番号(継続時間)[/兼用カット記述]
			cut_bag: {
				name:	contentData.pmu.toString(),
				description:	nas.Pm.getIdentifier(contentData),
				line_id:     contentData.currentNode.stage.parentLine.toString(true),
				stage_id:    contentData.currentNode.stage.toString(true),
				job_id:      contentData.currentNode.toString(true),
				status:      contentData.currentNode.jobStatus.toString(),
				x_map: contentData.toString(),
				thumbnail_url: xMapThumbnailUrl
			}
		};
		if(entry.token){
			targetAddress = "/api/v2/cut_bags"+entry.token+".json";//更新　トークンあり
			detaMethod    = "PUT";//更新　エントリ（トークン）あり
		}else{
			targetAddress = "/api/v2/cut_bags.json";//新規作成　トークンなし
			detaMethod    = "POST";//更新　エントリ（トークン）あり
//追加プロパティ
			sendData.episode_token = currentOpus.token;//<<<
		}
	};
		receiverFn = function(result,transtaction,callback,callback2){
			if(result.res == 200){
//保存に成功したので、関連stbdの更新を行い、トランザクションを発行
			var contentData = (transaction.target instanceof xUI.Document)?transaction.target.content:transaction.target;
				contentData.timastamp = result.data.cut_bag.updated_at;//タイムスタンプを更新
			if(! contentData.timestamp) contentData.timestamp = new Date().getTime();//(timestamp == 0のケースを含む)
			var entry = Repository.entry(transaction.idf)

			var idfInfo     = nas.Pm.parseIdentifier(contentData);	
			
			idfInfo.opus.stbd
			var tr = new nas.Transaction(
				STBD,
				'push',
				parent,
				callback,
				callback2
			)

				if(callback instanceof Function) callback();
				if(transaction instanceof nas.Transacion) transatction.success();
			}else{
				if(callback2 instanceof Function) callback2();
				if(transaction instanceof nas.Transacion) transatction.fail();
			}
		};
		var req = new UATRequest(
			targetAddress,
			receiverFn,
			callback,callback2,
			this.token,
			dataMethod,
			'json',
			(xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
			(xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
			sendData
		);
		var TSK = new UItask(req,100,1);
		xUI.taskQueue.addTask(TSK);
};// NetworkRepository.prototype.pushContent

/*TEST
var testTR=new nas.Transaction(
	
)


*/
// anyRepository.updateContent(contentData,callback)
