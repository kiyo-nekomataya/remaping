/**
 * @fileoverview
 *
 *	nas.Pm.pmdbのデータを取り込むコード片
 *  
 *
 *
 */
'use strict';

//pmdb初期化
    $.ajax({
        url: "nas/lib/etc/nas.Pm.pmdb.json",
        dataType: 'text',
        success: function(result){
            nas.Pm.pmdb.parseConfig(result);
//            console.log(nas.Pm.pmdb.dump('text'));
        },
    });//*/
