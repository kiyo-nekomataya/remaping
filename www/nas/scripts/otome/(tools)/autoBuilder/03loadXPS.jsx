/*(03-シート読込)
	
	loadXPS.jsx
	試験用コード
	コンポ内にタイムシートを読み込み、同時にXPSバッファを更新します。
	複数ファイルも指定できます。
*/

//ファイルからXPSバッファに　シート読み込み
function test_getSheet(sheetFile)
{
	if(sheetFile){
		var myOpenfile = new File(sheetFile.fsName);
		myOpenfile.encoding="UTF8";
	//	alert(myOpenfile.encoding);
		myOpenfile.open("r");
		myContent = myOpenfile.read();
		myOpenfile.close();
		XPS.readIN(myContent);
		var myIndex=nas.XPSStore.push();//バッファの内容をストアにプッシュする
	//	if(myIndex){nas.XPSStore.setInfo(myIndex,myOpenfile)};
		return;
	}else{
		//指定がない場合はダイアログを出して、読み込み　（複数可）
		if(isWindows)
		{
			var mySheetFiles = File.openDialog("読み込むタイムシートを選んでください","nasXPSheet(*.xps):*.XPS",true);
		}else{
			var mySheetFiles = File.openDialog("読み込むタイムシートを選んでください","*",true);
		}
if(mySheetFiles instanceof Array){
		if (mySheetFiles.length){
			for (var idx=0;idx<mySheetFiles.length;idx++)
			{
				var mySheetFile=mySheetFiles[idx];
				if (mySheetFile.name.match(/^[a-z_¥-¥#0-9]+¥.xps$/i))
				{
					nas.otome.loadXPS(mySheetFile);
				}
			}
		nas.otome.writeConsole(mySheetFiles.length +" timesheets loaded");
			return true;
		}else {
			alert("タイムシートファイルを選択してください。")
			return false;
		};
}
		if(mySheetFiles instanceof File){
				var mySheetFile=mySheetFiles;
				if (mySheetFile.name.match(/^[a-z_¥-¥#0-9]+¥.xps$/i))
				{
					nas.otome.loadXPS(mySheetFile);
				}
			return true;
		}else {
			alert("タイムシートファイルを選択してください。")
			return false;
		}
	}
}

test_getSheet();//バッファに読み込む
//
/*
	これとは別に指定フォルダの再帰検索でタイムシートファイルが存在する場合は全て取り込むメソッドもあります。
	
	タイムシートは、タイムシート格納用コンポジションをフッテージ格納フォルダアイテム配下に格納用コンポを作ってこれにテキストレイヤの値として取り込みます
	ファイル名・ファイル更新日時・ファイルサイズ　をファイル識別情報としてレイヤコメントに記録してあります。
	
*/