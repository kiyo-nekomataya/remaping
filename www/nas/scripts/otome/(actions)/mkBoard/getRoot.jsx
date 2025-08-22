/*	CompItem.getRootXps()
引数	なし
戻値	発見時はXpsオブジェクト それ以外はチェック用オブジェクト またはfalse

	nas オートビルド環境下で、親コンポをたぐって元ステージのXpsオブジェクトを返すメソッド
*/
 CompItem.prototype.getRootXps=function()
{
	if(! nas.XPSStore.getLength()){return false}

//コンポ自身がステージならばシートマッチを確認して返す
//手作業でプロジェクトの変更が行われたり、シートの読み直し・削除等があった場合は該当のXpsがない場合がある。
//その場合は、チェック用無名オブジェクトを返すので、必要にしたがって処理
if(this.name.match(new RegExp("^\\("+nas.itmFootStamps.stage[0]+"\\)")))
{
	var myRecordCheck=eval("("+this.comment.split("\n")[0].replace(/^\/\/[^;]*;/,"")+")");
	//チェックレコードを現在のシートと総当りで比較マッチしたら返して終了
	for(var idx=0;idx<nas.XPSStore.getLength();idx++)
	{
		var xpsRecord=nas.XPSStore.getInfo(idx+1);
		if(
			(myRecordCheck.name==xpsRecord.name)&&
			(myRecordCheck.modified==xpsRecord.modified)&&
			(myRecordCheck.length==xpsRecord.length)
		){return nas.XPSStore.get(idx+1)}
	}
//総当りではずれ
	return myRecordCheck
}
//コンポがステージではない場合はレイヤを総当りでさかのぼる
	for(var idx=0;idx<this.layers.length;idx++)
	{
		if(this.layers[idx+1].source instanceof CompItem)
		{
			if(this.layers[idx+1].source.comment.match(new RegExp("^\\("+nas.itmFootStamps.stage[0]+"\\)")))
			{
				var myRoot=this.layers[idx+1].source.getMyRootXps();
				if(myRoot instanceof Xps){return myRoot}else{continue}
			}
			
		}else{
			continue;//そもそもコンポじゃないのでスキップする
		}
	}
	return false;//コンポ内ではステージ未発見
}