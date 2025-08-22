/*
 *	uat_message_handler.js
 *	UATools のメッセージ機能を統括するモジュール
 *	require nas-lib
 */
'use strict';

if(typeof electronIpc == 'undefined') var electronIpc = null;
//{Object electronIpc}の存在をチェックして存在しない場合否判定の発生する値を設定しておく
/**
* 以下は uat共用モジュール
* メッセージサービスを使用するmoduleは、初期化手続き内で uat.MH.init();を呼び出し、自身のメッセージハンドラを初期化する
* 終了手続き内で、通信管理のためのメッセージ uat.MH.exit();を引数無しで実行する
* メッセージは、各モジュールで 一旦uat.MH.messageDdistributor に渡し宛先を解決する
*/

var uat = {
	isParent:true,
	modules:{
		uat:          {url:"./console.html",type:"applilcation",width:1280,height:720},
		console:      {url:"./console.html",type:"application",width:1280,height:720},
		calculator:   {url:"./calculator.html",type:"gadget",width:576,height:512},
		stopwatch:    {url:"http://www.nekomataya.info/tools/nasSTW/StopWatch.html",type:"gadget",width:360,height:420},
		fieldTable:   {url:"http://www.nekomataya.info/tools/documents/frame_exch.html",type:"gadget",width:720,height:540},
		productManger:{url:"./index_uaf.html",type:"application",width:512,height:460},
		pman_reName:  {url:"./index.html",type:"application",width:1280,height:720},
		stbe:         {url:"./stbConvert.html",type:"application",width:720,height:800},
		xpsedit:      {url:"./xpsedit.html",type:"application",width:512,height:460}
	},
	apiTable:{
		'exit':       {func:xUI.exitApplication},
		'menuResolve':{func:xUI.menuResolver},
		'menu':       {func:function(){}},
		'b':          {func:function(){}},
		'c':          {func:function(){}}
	},
	MH:{}
};
uat.modules.get = function get(prop){
	if(typeof prop != 'undefined'){
	if(this[prop]) return this[prop];
	for(var prp in this) if(this[prp].url == prop) return this[prp];
	};
	return null;
}
/**
 	Object uat.MH 配下に属性と機能を収集する
 	外部からはメーッセージイベントを送り合うことで通信を行う
 	基本はすべて非同期
 	handlerは hub|spoke いずれかのタイプに分類される
 	指定がない場合はspokeとして初期化される
 	ハブはウインドウテーブルを管理する
 	スポークはハブとウインドウテーブルのコピーを同期してもつ（ハブの移譲がありうる）
 	メインモジュールが存在する場合は、ウインドウテーブルの親データはメインモジュール側で同期保持する
 	ハブはブラウザ側からメインモジュールに対する通信を引き受ける
 	スポークはハブに対してメインモジュールへの通信を委託する
 	ハブは自身が消失する際に、一つ以上の管理下のスポークが存在すれば、ハブ機能の譲渡を配下のスポークプロセスに順次呼びかける
 	最初にレスポンスのあったスポークにハブ機能を移動してから消失する？
 	＊＊...再考
 	ハブが閉じられる前にこのウインドウを閉じるとアプリケーションがすべて閉じられる旨をconfirmしてCancelの機会をユーザに与えるほうが早い

	objectIdf       : uuidで得られるセッションユニークID
	type            : main|hub|spoke|gadget
	parentModule    : null|Window
	parentModuleIdf : ''|string module idf,
	appMembers      : array of appMember

 */
uat.MH = {
	objectIdf       : null,
	type            : '',
	parentModule    : null,
	parentModuleIdf : '',
	appMembers     :[],
};
/**
 *   @params {Object|String|Number} key
 *   @returns {Object uat.AppMember}
 *	キーを与えてメンバテーブルから特定のメンバーを抽出する
 */
uat.MH.getMember = function getMember(key){
	return uat.MH.appMembers.find((e)=>((e.window == key)||(e.idf == String(key))||(e.name == String(key))||(e.app == String(key))));
}
/**
 *   メンバテーブルの同期を行う
 *   同期をコントロールするのはハブモジュール
 *   メインモージュール及びスポークモジュールは
 	自身のテーブルが直接変更された場合にハブモジュールに対して通知を行う
 	ハブモジュールは、受信通知による変更及び自身のテーブルの変更をテーブル上のすべてのモジュールに対して通知・同期を行う
 	ハブモジュールからの通知を受け取ったモジュールは自身のテーブルと照合変更を行う
 */
uat.MH.syncMemberTable = async function syncMemberTable(){
}
/**
	アプリケーションの変更をハブモジュールを経由してメインプロセスへ通知する
	コマンドリゾルバは通さない
 */
uat.MH.appchange = function(){
	var hubWindow = (window.opener)? window.opener:window;
	hubWindow.postMessage({
				channel : 'system',
				to      : {name:'mainprocess',id:0},
				from    : {name:xUI.app,id:this.objectIdf},
				command : 'app_change',
				content : ''
			},window.location.origin);
//('app-change',xUI.app)
}

/**
 *	メンバーを走査してウインドウが閉じらているアイテムを削除する
 */
uat.MH.sweepMembers = function(){
	for (var i = uat.MH.appMembers.length-1 ; i >= 0; i--) if(! uat.MH.appMembers[i].window.window) uat.MH.appMembers[i].remove();
	return uat.MH.appMembers.length;
}
/* @constractor
 *	appMembers Element
 *	uatアプリケーションMember WEB,Electron間でデータ内容を共有する
 */
uat.AppMember = function(win,name,app,idf){
	this.window = win;
	this.name   = name;
	this.app    = app;
	this.idf    = idf;
}
/**
 *	appMemberの削除
 */
uat.AppMember.prototype.remove = function(){
	var idx = uat.MH.appMembers.indexOf(this);
	if(idx > -1) uat.MH.appMembers.splice(idx,1);
}
/*
 *	handlerモジュールを初期化する
 *	ペアレント（ハブ）モジュールは明示的に初期化する
 *	それ以外のケースではクライアント（スポーク）モジュールとして初期化される
 *	初期化の終了時にハブとなるペアレント側のモジュールに接続要求メーッセージを送出
 *	それを受けて発行される再初期化メッセージを受けてアクティベートが実施される
 */
uat.MH.init = function(){
	if(this.objectIdf){
		let msg = ['メッセージハンドラはすでに初期化されています'];
		msg.push('objectIdf : ' + this.objectIdf);
		msg.push('appMembers : ');
		msg = msg.concat(Array.from(this.appMembers,(e)=>{return [e.id,e.name].join(':')}));
		console.log(msg.join('\n'));
	}else{
		this.type = (window.opener == null)? 'hub':'spoke;'
		this.objectIdf = nas.uuid();
		this.appMembers.length = 0;
		this.appMembers.push(new uat.AppMember(window,window.name,xUI.app,this.objectIdf));
/*
			'window': window,
			'name'  : window.name,
			'app'   : xUI.app,
			'idf'   : 
 */
		if(this.type == 'hub'){
//ハブモジュールは自分自身をペアレントに設定する
			this.parentModule    = window;
			this.parentModuleIdf = this.objectIdf;
			uat.MH.appchange();
		}else{
//スポークモジュールはwindow.opennerをペアレント設定してアクティベーションを行う
			this.parentModule    = window.opener;
			this.parentModuleIdf = '';
			this.parentModule.postMessage({
				command         : 'spoke_activation',
				name            : window.name,
				parentModuleIdf : '',
				objectIdf       : this.objectIdf,
				app             : xUI.app,
				from            :{name:xUI.app,id:this.objectIdf},
				to              :{name:'',id:0},
			},window.location.origin);
		};
		window.addEventListener('message',uat.MH.messageDistributor);
	};
	return this;
};
/**
	@params	{string}	url
		自身をハブとして初期化するsporkのurl
	@params	{string}	type
		spoke-type :"unique"
	@params	{string}	query
	@params	{string}	hash

	urlを与えて新規spokeを開く
	スポークは、ハブに連結されたアプリケーション要素を指す
	各スポークには識別用のIDを与えて管理する
	識別IDはモジュール初期化の際に自動生成されるものを親に当たるハブに向けて送信される
	識別IDを受信するまではスポークの初期化は完了しない

	Window初期化の際にsearch,hashを独立で送信可能 それぞれencodeURIComopnentでurlに追加される
 */
uat.MH.openURL = function openURL(url,type,query,hash){
//オープンを機会にしてガベージ
	uat.MH.sweepMembers();
	if(! url) return null;
	if(! type) type = "gadget";
	var mod = uat.modules.get(url);
	if((mod)&&(mod.type)){
		type = mod.type;
		url  = mod.url;
	};
	var winName = String(parseInt(new Date().getTime()));
	var exists = uat.MH.appMembers.find((e) =>((e.window)&&(e.window.location.href == url)));

	if(query) url += "?" + encodeURIComponent(String(query));
	if(hash)  url += "#" + encodeURIComponent(String(hash));
//gadgetはセッション間で共通のウインドウを使用する
//指定されたmoduleがgadgetの場合でかつ既存アイテムであればそのウインドウにフォーカスを移動する
//それ以外は新規にウインドウを初期化する
	if((type == 'gadget')&&(exists)){
		exists.window.focus();//ウインドウ前面に
	}else if(mod){
		var newSpoke = window.open(url,winName,"width ="+mod.width+",height="+mod.height);
	}else{
		var newSpoke = window.open(url,winName);
	};
	var ix = uat.MH.appMembers.add(new uat.AppMember(newSpoke,winName,'',null),function(e,f){return (e.window === f.window)});
	return uat.MH.appMembers[ix];
//	{window:newSpoke,name:winName,app:"",idf:null}
};
/*
 *	message distributor 中継配信機能 メッセージハブ
 *	メッセージデータ形式
 *	data:{
 *		channel:<配信先チャンネル>,
 *		to:<宛先情報>
 *		from:<発信元情報>,
 *		command:<コマンド識別文字列>,
 *		content:<引数文字列>または<引数配列>
 *	}
 *	channel: 'system'|'message'|'menu'....
 *	メッセージ内の宛先情報から配信先を特定して与えられたメッセージを転送する
 */
uat.MH.messageDistributor = function messageDistributor(msg){
console.log(msg);
	if(uat.MH.objectIdf == null) return null;//handlerが初期化されていないのでメッセージは受け取らない
	if(
		(msg.data.command == 'spoke_activation_response')||
		(uat.MH.parentModule)&&(uat.MH.parentModuleIdf == '')
	){
//スポーク側でHUBをアクティベーション
		if(msg.data.from) uat.MH.parentModuleIdf = msg.data.from.id;
	}else if(
		(msg.data.command == 'spoke_activation')
	){
//ハブ側でspokeアクティベーション要求を受信
		var member = uat.MH.getMember(msg.data.name);
		if(member){
			member.idf = msg.data.from.id;
			member.app = msg.data.from.name;
			member.window.postMessage({
				command:"spoke_activation_response",
				objectIdf:uat.MH.objectIdf,
				app:xUI.app,
				from:{name:xUI.app,id:uat.MH.objectIdf},
				to:{name:xUI.app,id:uat.MH.objectIdf},
			},window.location.origin);
		};
	}else if(
		(msg.data.command == 'hub_transfer')
	){
//スポーク側・ハブ委譲メッセージ受信
	}else if(
		(msg.data.command == 'hub_transfer_responce')
	){
//ハブ側・委譲完了処理
	}else if(
		(msg.data.command == 'spoke_activation')
	){
//
	};
// cannel:system|messgae|menu|command , to:window
	if((uat.MH.type == 'hub')&&(msg.data.channel == 'system')){
//自身がhubで宛先チャンネルがsystemの場合API経由でメインプロセスへメッセージ送出
		if((appHost.platform == 'Electron')&&(electronIpc)){
//Electron
			switch (msg.data.command){
			case 'app_change'    : electronIpc.changeApplication(msg.data.from); break;
			case 'radio-check'   : 
			case 'show-hide'     : 
			case 'menu-value'    : 
			case 'menu-check'    : 
			case 'menu-enable'   : electronIpc.send(msg.data.command,...msg.data.content);break;
			case 'exit_uat'      : electronIpc.app_quit(); break;
			case 'openDialogSync': electronIpc.uat_openDialogSync(...msg.data.content);break;
			case 'openDialog'    : electronIpc.uat_openDialog(msg.data.channel,...msg.data.content);break;
			case 'sendSync'      : electronIpc.sendSync(...msg.data.content); break;
			case 'readPreference': electronIpc.readPreference(...msg.data.content);break;
			case 'putReference'  : electronIpc.readPreference(...msg.data.content);break;
			case 'send'          :
			default              : electronIpc.send(msg.data.channel,...msg.data.content);
			};
		}else{
//WEB環境なのでメインプロセスが存在しない
console.log('not electronIpc ignore uat system message :');
console.log( msg.data);
		};
	}else if(
		(uat.MH.type == 'hub')&&
		(msg.data.to)&&
		(msg.data.to.id == uat.MH.objectIdf)&&
		(msg.data.channel == 'callback')
	){
console.log( msg.data);
//書き戻しコール スポークモジュールへAPIを経て、得られたリザルトを戻すチャンネル
//ハブモジュールでコマンドを実行してpostMessageを使って得られた値をcontentに積んでcommandチャンネルで返す
		var callbackModule = uat.MH.getMember(msg.data.from.id);//戻し先を保存
		if(!(msg.data.content instanceof Array)) msg.data.content = [msg.data.content];
console.log(...msg.data.content);
		var returnValue = Function(msg.data.command)(...msg.data.content);
console.log(returnValue);
console.log(returnValue instanceof Promise);
		if(returnValue instanceof Promise){
			returnValue.then((rv)=>{
				callbackModule.window.postMessage({
					channel:'command',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					to:msg.data.from,
					command:msg.data.callback,
					content:[rv],
					note:'test'
				});
			});
		}else{
			callbackModule.window.postMessage({
				channel:'command',
				from:{name:xUI.app,id:uat.MH.objectIdf},
				to:msg.data.from,
				command:msg.data.callback,
				content:returnValue,
				note:'test'
			});
		};
/*スポーク側の送信メッセージ
		uat.MH.parentModule.window.postMessage({
			channel:'callback',
			from:{name:xUI.app,id:uat.MH.objectIdf},
			to:{name:'hub',id:uat.MH.parentModuleIdf},
			command:'return electronIpc.openDialogSync(...argument)',
			content:[],
			callback:"console.log(...argument)"
		});
*/
	}else if(msg.data.to){
//宛先はメインワールドのアプリケーションモジュール
		var targetModule = uat.MH.getMember(msg.data.to.id);
		if((targetModule)&&(targetModule.window)){
			if(targetModule.idf==uat.MH.objectIdf){
/*	自分自身に宛てられたメッセージ（ハブ・スポークを問わない）
 *	コマンドをxUI.commandResolverへ渡す
 *	data:{
 *		channel :<配信先チャンネル>,
 *		to      :<宛先情報>
 *		from    :<発信元情報>,
 *		command :<コマンド識別文字列>,
 *		content :<引数文字列>または<引数配列>
 *		callback:<関数コード片>またはコールバック関数 オプショナル
 *	}
 * → (msg.data.command,msg.data.content)
 */
				if(msg.data.channel == 'menu'){
					xUI.menuResolver(msg.data.command,msg.data.content);
				}else if(msg.data.channel == 'command'){
					if((typeof msg.data.callback == 'string')) msg.data.callback= Function(msg.data.callback);
					xUI.commandResolver(msg.data.command,msg.data.content,msg.data.callback);
				}
			}else{
//他のモジュール宛のメッセージは単純に転送
				targetModule.window.postMessage(msg.data);
			};
		}else{
//不正メッセージ受信
console.log('不正メッセージ');
console.log(msg);
		};
	};
}

/**
 *	uat アプリケーションウィンドウ間メッセージ送出
 *	@params {Number|Object Window}	to
 *	@params {Object}	msg
 * メッセージは宛先のmessageResolverが受ける
 * 
 */
uat.MH.sendMsg = function(to,msg){
console.log('send to :'+ to);
console.log(typeof to.postMessage);
console.log(msg);
	var targetWindow = this.parentModule;
	if((typeof to == 'object')&&(typeof to.postMessage == 'function')){
		targetWindow = to;
	}else if((this.appMembers[parseInt(to)])){
		targetWindow = this.appMembers[parseInt(to)].window;
	}else{
//idf またはアプリケーション名で検索 findIndexなので複数候補がある場合は最初にヒットしたもの
		var ix = this.appMembers.findIndex(function(e){return ((e.idf == to)||(e.app == to))});
console.log([to,ix]);
		if(ix > -1) targetWindow = this.appMembers[parseInt(ix)].window;
	};
	if(targetWindow){
		msg.objectIdf = this.objectIdf;
		msg.app = xUI.app;
		targetWindow.postMessage(msg,window.location.origin);
	};
}
/**
 *	ハブ・スポーク モジュール終了手続き
 *	基本的にレスポンスは待たずに手続きを終了
 *	処理失敗のケースではガベージコレクションに後を委ねる
 * 自身がハブの場合は、以下の判定を行う
	管理テーブルにスポークが残っていれば、最初のエントリーに向かってハブを移譲する通信を行う
	移譲が完了したら管理テーブルからエントリを抜く
	残りのスポークに向かってハブ移行のコマンドを送りエントリを抜く
	エントリが０になるまで繰り返す
 */
uat.MH.exit = function(){
	if(uat.MH.parentModule !== window){
//スポーク ハブに対して自身の削除を求める 
		uat.MH.sendMsg(
			uat.MH.parentModule,
			{
				
			}
		);
	}else{
//ハブ テーブル上のモジュールに対して終了処理を求める
		while(uat.MH.appTable.length){
			uat.MH.sendMsg(
				
			);
		};
	};
}
