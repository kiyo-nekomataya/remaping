/*(ファイル名成形)
<jsx_0B>

	コンテ分解プロジェクトのサブスクリプト
レンダリング済の画像ファイルのフレームナンバーを削除します。

ターゲットフォルダはレンダリング先のフォルダを参照?

ファイル命名規則は、当然コンテ分解プロジェクトに準ずる。

regString_cutID_subColumnID-frameNumber.ext

フレームナンバーは削除(レンダリング時に捨てる方が望ましい)

*/
//ベースオブジェクトがなければなにもしません
		if(nas.eStoryBoard){
	var myFolder=nas.eStoryBoard.renderLocation;//現在のカレントフォルダをとりあえず指定
	myFolder=Folder.selectDialog("名前調整するフォルダを指定してください",myFolder);
if(myFolder){
	//フォルダが存在するので レンダリングロケーションを更新
	nas.eStoryBoard.renderLocation=myFolder;
	var myFiles=myFolder.getFiles();
//	var myTargets=new Array;
//	全ファイルから処理対象を選択
	var regString = '_0000(\.[a-z]+)$,$1'
//	nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.valueAtTime(0,true).toString();
	
	var msg = "引数を指定してください\n -- RegExp,replacement \n";
	var tgtList = []; var tgt = [];
	var dstList = [];
	for (var idx=0;idx<myFiles.length;idx++){
		if(myFiles[idx].name.match(/\.(png|jpg|jpeg|tiff|tif|psd|tga)$/)){
			tgtList.push(myFiles[idx]);
			tgt.push(myFiles[idx].name);
		}
	}
	regString = prompt(msg + tgt.join('\n') ,regString);
	if(regString){
		var myRG        = new RegExp(regString.split(',')[0]);
		var replacement = regString.split(',')[1];
		for (var idx=0;idx<tgtList.length;idx++){
			var dst = tgtList[idx].name.replace(myRG,replacement);
//変更結果が異なる場合のみ処理対象
			if(dst != tgtList[idx].name){
				dstList.push( [idx,tgtList[idx].name,dst] );
			}
		}
		msg = "以下の変換が実行されますよろしいですか\n\n";
		var doAction = confirm(msg + dstList.join('\n'));
		if((doAction)||(dstList.length)){
			var myCount=0;
			for (var idx=0;idx<dstList.length;idx++){
				var myTarget = new File(tgtList[dstList[idx][0]].fullName);
				var newName  = dstList[idx][2];
				myTarget.rename(newName);
				myCount++;
			}
alert("renamed :"+myCount);
		}
	}else{
		alert(regString)
	}
}
		}else{alert("NONONO")}
