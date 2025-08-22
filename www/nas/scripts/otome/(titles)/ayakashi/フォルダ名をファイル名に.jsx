/*(フォルダ名をファイル名に)
インポートしたpsdファイルのフォルダアイテムを選択した状態で実行

アイテムフォルダのメンバーアイテムがすべて同じpsdファイルのレイヤだった場合に
フォルダ名をpsdファイル名と一致させる

ついでにスイッチで同階層の同名コンポを複製して指定名に変更
	kiyo/Nekomataya	2007/05/19
*/
if((app.project.activeItem instanceof FolderItem)&&(app.project.activeItem.items.length)){
//すべてのアイテムがフッテージアイテムでかつメインソース.ファイルソースが存在すること
//いずれかの条件が満たされない場合処理中止
	var refName="";	//	初期値ヌル
	var refFlag=false;	//	処理継続フラグ
	for (var idx=1;idx<=app.project.activeItem.items.length;idx++){
		var myItem=app.project.activeItem.items[idx];
		if(myItem.mainSource instanceof FileSource){
			if(refName==""){
				refName=myItem.mainSource.file.name
			}else{
				if(myItem.mainSource.file.name!=refName){break;}
			}
		// alert(myItem.mainSource.file.name);
		}else{
			break;
		}
		refFlag=true;
	}
	if((refFlag)&&(app.project.activeItem.name!=refName)){
		var oldName=app.project.activeItem.name;
		app.project.activeItem.name=refName;
//既成のコンポを"_"でセパレートして複製する（メソッドが変わったらそもそも不要である 2007/05/19）
	if(true){
		myTargetTr=app.project.activeItem.parentFolder.items;
			for (var idx=0;idx<myTargetTr.length;idx++){
				if(myTargetTr[idx+1].name==oldName){
					newNumbers=oldName.split(" ")[0].split("_");
					for(var idn=0;idn<newNumbers.length;idn++){
						var newItem=myTargetTr[idx+1].duplicate();
						newItem.name=newNumbers[idn];//+"_LO";
					}
						myTargetTr[idx+1].remove();break;
				}
			}
	}
	}
}
