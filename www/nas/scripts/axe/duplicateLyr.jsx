/*	duplicateLyr.jsx
選択レイヤーを複製　後方にコピーポストフックスを付けない
選択状態は新規作成レイヤーへ
*/
//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   var myLibLoader=new File(Folder.userData.fullName+"/nas/lib/Photoshop_Startup.jsx");
   $.evalFile(myLibLoader);
}else{
   nas=app.nas;
}
// ================ 選択したレイヤ及びレイヤセットの複製
    var dscDp = new ActionDescriptor();
        var refDp = new ActionReference();
        refDp.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
    dscDp.putReference( charIDToTypeID( "null" ), refDp );
    dscDp.putInteger( charIDToTypeID( "Vrsn" ), 5 );
executeAction( charIDToTypeID( "Dplc" ), dscDp, DialogModes.NO );
// ======= 複製後の被選択レイヤを逐次処理して名前を元に戻す
	var mySelection=nas.axeCMC.getSelectedItemId();
	  var myLayers=nas.axeCMC.getItemsById(mySelection);
	  for (var ix=0;ix<myLayers.length;ix++){
	     myLayers[ix].name=myLayers[ix].name.replace(/\sコピー(\s\d?)?$/,"");
	   }
         nas.axeCMC.selectItemsById(mySelection);
/*	*/
