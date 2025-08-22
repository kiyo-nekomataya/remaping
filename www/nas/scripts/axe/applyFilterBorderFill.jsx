//BorderFill実行　(IG-borderfill版)
// =======================================================
var idFltr = charIDToTypeID( "Fltr" );
    var desc8 = new ActionDescriptor();
    var idUsng = charIDToTypeID( "Usng" );
    desc8.putString( idUsng, "Border Fill" );
executeAction( idFltr, desc8, DialogModes.NO );

