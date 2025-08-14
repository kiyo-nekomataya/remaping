/**
 * nas_axeEventHandler.js
 * axe watch agent
 *
 * @fileoverview psAxe要イベント受信エージェント
 * photoshop専用
 * 全イベント受信して必要な処理を行うオブジェクト
 */


/**
 * @param e
 */
nas.axeCMC.eventHandler = function (e) {
    if (!e) {
        alert("noArguments")
    } else {
        alert(e.toString())
    }
};
//受信スタート

//nas.eventHandler=app.notifiers.add('All ',File(Folder.nas.fullName+"/lib/_event.js"),"Dcmn");
//if(! app.notifiersEnabled){app.notifiersEnabled=true};
