/*
	UI同期テーブル

panelTabel 及び syncTable

syncTableマージ手続き
	xUI.syncTableMergeItems(syncTable)

panelTableマージ手続き
	xUI.panelTableMergeItems(panelTable)
*/
'use strict';
// paneltable_//
/*

*/
var panelTable_= {
};
//-----------syncTable_//
// synctable_//
/*

*/
var syncTable_ = {
};
//-----------syncTable_//
/* TEST
    var conflictItem = [];
    for( var f in syncTable_remaping ){
        if(xUI.syncTable[f]){
            conflictItem.push(f);
        }else{
            xUI.syncTable[f] = syncTable_remaping[f];
        }
    };
if(conflictItem.length) console.log(conflictItem);
*/

// synctable//