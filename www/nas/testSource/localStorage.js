/**
 *	localStorage,sessionStarge
 *代用オブジェクト
 *ブラウザーのlocalStorage,sessionStorageとある程度の互換性あり
 *AIRまたはCSX CEP環境のファイルオブジェクトを利用して可能ならローカルディスク上に保存を行う
 *
 *現在のコードでは、Web Storageで許可されている直接プロパティの追加は禁止
 *操作メソッドのみ互換
 *setItem/getItemメソッド経由のみで正常な動作となる
 *
 *値の保存は内容変更の都度、可能ならばローカルファイルへの保存で行なわれる
 *ファイルシステムの利用ができない場合は、セッションストレージの動作を行う。
 *重いので多用は控えるべき
 *
 *既にローカルストレージが実装されている環境では実行されない。
 *
 *eventProp
 *.key		
 *.length		
 *.oldValue
 *.url		
 *.storageArea	
 *
 *	properties
 *.length …… 保存されているデータの数を返す
 *.key(n) …… 保存されているn番目のkeyを返す
 *.getItem(key) …… keyに対応するvalueを取得する
 *.setItem(key, value) …… keyとvalueのペアでデータを保存する
 *.removeItem(key) …… keyに対応するvalueを削除する
 *.clear() …… データをすべてクリアする
 *
 *
 */
//	--------- grobalにlocalStorageオブジェクトがある場合はコード全体をスキップ
if(typeof localStorage=="undefined"){
//	alert("loading alt localStorage");
 function nasWebStorage(){
	this.length=0;
	this.isLocalStorage=false;
	this.keys=new Array;
	this.keys.set=function(myKey){
		for (var ix=0;ix<this.length;ix++){if(this[ix]==myKey){return ix;}}
		this.push(myKey);return this.length;
	}
	this.key=function(myIndex){return this.keys[myIndex]}
	this.setItem=function(myKey,myValue){
		var ix=this.keys.set(myKey);
		this[myKey]=myValue;		
		this.length=this.keys.length;
		//値のセットに成功したらディスクに保存 戻り値は不明
		if(this.isLocalStorage){
			this.isLocalStorage=false;
 			this.autoSave();
 			this.isLocalStorage=true;
 		}
 		return true;
	}
	this.removeItem=function(myKey){
		for(var ix=0;ix<this.keys.length;ix++){
			if(this.keys[ix]==myKey){
				this.keys.splice(ix,1);
				this.length=this.keys.length;
				delete this[myKey];
		//値の削除に成功したらディスクに上書き保存
		if(this.isLocalStorage){
			this.isLocalStorage=false;
 			this.autoSave();
 			this.isLocalStorage=true;
 		}
				return true;
			}
		}
		return false;
	};
	this.getItem=function(myIndex){return this[myIndex]};
	this.clear=function(){
		for(var ix=0;ix<this.keys.length;ix++){
			delete(this[this.keys[ix]]);
		}
		this.keys.splice(0,this.length);this.length=0;
		//値の削除に成功したら上のデータクリア
		if(this.isLocalStorage){
		 this.isLocalStorage=false;
		 this.autoSave();
		 this.isLocalStorage=true;
		 }
		return true;
	}
	/** localStorageの場合に呼び出される自動保存　fileBox環境のない場合は何もしない
		短時間に連続して非同期／同期IOを呼び出す可能性があるのでこのメソッドを呼ぶ前にisLocalStorageプロパティを一時的にfalseにすること
	*/
	this.autoSave =function(){
		if(fileBox){
			var myContent=[];
			for (var ix=0;ix<this.keys.length;ix++){myContent.push('"'+this.keys[ix]+'":"'+encodeURI(this.getItem(this.keys[ix]))+'"');};
			myContent="{"+myContent.join(",")+"}";
			var contentBackup=fileBox.contentText;var fileBackup=fileBox.currentFile;
if(appHost.platform=="AIR"){
//AIRの場合はair.Fileオブジェクト
			fileBox.currentFile=new air.File(Folder.nas.url+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json");
}else{
//CSX,CEP環境の場合はフルパス(url)を文字列で与える
			fileBox.currentFile=Folder.nas+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json";
}
			fileBox.contentText=myContent;
			var myResult=fileBox.saveContent();
			fileBox.contentText=contentBackup;fileBox.currentFile=fileBackup;
			return myResult;
		}
			return false;
	}
	/** ローカルディスク上からデータを読みだす。
		localStorageフラグがない場合は、全体をスキップ
	*/
	this.restore=function(){
		if((fileBox)&&(this.isLocalStorage)){
			var contentBackup=fileBox.contentText;var fileBackup=fileBox.currentFile;
			//fileBox.contentText="";
if(appHost.platform=="AIR"){
			fileBox.currentFile=new air.File(Folder.nas.url+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json");
}else{
			fileBox.currentFile=Folder.nas+"/lib/etc/"+appHost.platform+"/info.nas.rempiang.localStorage.json";
}
			var myContent=fileBox.readContent();
			fileBox.contentText=contentBackup;fileBox.currentFile=fileBackup;
			if(myContent){
//現在の内容をクリア
				if(this.length){for(var ix=0;ix<this.keys.length;ix++){delete(this[this.keys[ix]])}};
				var myObj=JSON.parse(myContent);
				this.isLocalStorage=false;
				for(prp in myObj){
					this.setItem(prp,decodeURI(myObj[prp]))
				};
		 		this.isLocalStorage=true;
			}
			return true;
		}else{
			return false;
		}
	}
 }
sessionStorage=new nasWebStorage();
localStorage=new nasWebStorage();
localStorage.isLocalStorage=true;
localStorage.restore();
}
/*test
Ax=new webStorage();
set Ax(){alert(123)}'
Ax.length;
Ax["V"]="1234";
*/
/*
 *書き込みの手順
 *
 *FileBoxのコンテンツを書き込み内容にする
 *ファイルを設定する
 *fileBox.contentText/fileBox.currentFileの内容をバックアップ
 *fileBox.contentText/fileBox.currentFileに内容とターゲットファイルをセット
 *	fileBox.saveContent()を呼ぶ
 *fileBox.contentText/fileBox.currentFileの内容をバックアップで復帰
 *
 *読み出しは同様の手順で
 *	fileBox.readContent();の戻り値を取得する
 *	
 *現在の問題点
 *	remaping-AIRで複数のウインドウを開いた場合はlocalStorage保存ファイルがバッティングするので注意
 *	複数ドキュメントの同時編集をサポートの際には解決しておくこと
 *	というか　AIRでローカルストレージをサポートしてほしい
 */
