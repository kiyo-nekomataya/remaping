/*(ファイル振り分け)
<jsx_0C>

	コンテ分解プロジェクトのサブスクリプト
レンダリング済のコンテチップをフォルダに振り分ける

ターゲットフォルダはレンダリング先のフォルダを参照?
ユーザ指定かも

ファイル命名規則は、当然コンテ分解プロジェクトに準ずる。
titleString_cutID_columnID-frameNumber.ext

移動時にフレームナンバーは削除(レンダリング時に捨てる方が望ましい)

 */
//ベースオブジェクトがなければなにもしません
		if(nas.eStoryBoard){
	var myFolder=nas.eStoryBoard.renderLocation;//現在のレンダーフォルダを指定
	myFolder=Folder.selectDialog("振り分けるフォルダを指定してください",myFolder);
if(myFolder){
	//フォルダが存在するので レンダリングロケーションを更新
	nas.eStoryBoard.renderLocation=myFolder;
	var myFiles=myFolder.getFiles();
    alert(myFiles.length);
	var myTargets=new Array;
//	全ファイルから処理対象を選択
	var titleString = (nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.valueAtTime(0,true).toString());
	titleString = prompt("タイトルプレフィクスを確認してください",titleString);
	if(titleString){
		myRG= new RegExp(titleString+"_([^_\\ -]+)([_\\ -][1-9][0-9]?)?([abAB][abAB])?([_\\ -]0+)?\.(psd|PSD)");

		var myCount=0;
        
		for (var idx=0;idx<myFiles.length;idx++){
			if (myFiles[idx].name.match(myRG)){
				myTarget=myFiles[idx];
				var myCutNo=RegExp.$1;
				var myColID=RegExp.$2;
				var myColForm=RegExp.$3;
				var myTargetFolder=new Folder(myTarget.path+"/"+titleString+"_"+myCutNo);
				if(! myTargetFolder.exists){
				     myTargetFolder.create();//フォルダ作成の成功不成功を判定してない。
                       nas.otome.writeConsole("mv "+ myTargetFolder.name+"*.psd ./"+myTargetFolder.name+"/");
		//作成時にxpsがあればついでに移動か?
					myXpsFile=new File(myTarget.path+"/"+myCutNo+"\.xps");
					if(myXpsFile.exists){
//						myXpsFile.changePath(myTargetFolder.fullName);
                       nas.otome.writeConsole("mv "+ myXpsFile.name+" ./"+myTargetFolder.name+"/");
					}
				}
				myTarget.rename(titleString+"_"+myCutNo+myColID+myColForm+"\.psd");
//				myTarget.changePath(myTargetFolder.fullName);
              //    myMove+="mv "+ myTargetFolder.name+"*.psd ./"+myTargetFolder.name+"/\n";

				myCount++;
			}
			var myInfo = myFiles[idx].name.split("_");
			if(myInfo.length==6)
			{
				myTarget=myFiles[idx];
				var myCutNo=myInfo[2];
				var myColID=myInfo[4];
				var myTargetFolder=new Folder(myTarget.path+"/"+titleString+"_"+myCutNo);
				if(! myTargetFolder.exists){
				    myTargetFolder.create();//フォルダ作成の成功不成功を判定してない。
                   nas.otome.writeConsole("mv "+ myTargetFolder.name+"*.psd ./"+myTargetFolder.name+"/");
		//作成時にxpsがあればついでに移動か?
					myXpsFile=new File(myTarget.path+"/"+myCutNo+"\.xps");
					if(myXpsFile.exists){
//						myXpsFile.changePath(myTargetFolder.fullName);
                       nas.otome.writeConsole("mv "+ myXpsFile.name+" ./"+myTargetFolder.name+"/");
					}
				}
				myTarget.rename(myTargetFolder.name+"/"+titleString+"_"+myCutNo+"_"+myColID+"\.psd");
//				myTarget.changePath(myTargetFolder.fullName);
				myCount++;
				
			}
		}
	}
}
		}
