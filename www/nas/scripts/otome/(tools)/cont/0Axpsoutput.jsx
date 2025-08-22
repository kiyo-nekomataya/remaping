/*(XPS出力)
<xps>
ダイアログ出して保存フォルダを尋ねる(暫定)
そこにまとめで書き出し
本来はmakeAllの一部
2018.04.01

*/

nas.eStoryBoard.makeAllXPS=function(){
	var mySaveFolder=new Folder(Folder.current.path);
	mySaveFolder=Folder.selectDialog("出力するフォルダを指定してください",mySaveFolder);

	if(mySaveFolder){
		var previewCutNo="";//初期値ヌル
		for (var idx=0;idx<this.columnPosition.numKeys;idx++){
			var myColumn=this.getColumnInformation(idx);
			if(myColumn.cutNo!==previewCutNo){
			//カット切り替え点で出力
//		var storeFilename = ["MSA#YN_OVA[七夕炎姫]__s-c",myColumn.cutNo].join('');
		var storeFilename = myColumn.cutNo;
		var mySaveFile=new File(mySaveFolder.path+"/"+mySaveFolder.name+"/"+storeFilename+".xps");
		
			//ファイルオープン(面倒なので今日は判定しない)
		mySaveFile.encoding="UTF8";
		mySaveFile.open("w");
		mySaveFile.write(this.toString(myColumn.cutNo));
		mySaveFile.close();
			};
			previewCutNo=myColumn.cutNo;//更新
		};

	}
}
//即席 あとで色々手がかかる…とほほ 
nas.eStoryBoard.makeAllXPS();

