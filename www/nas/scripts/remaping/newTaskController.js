/**
    ｘUIにタスクコントローラを設けてバックグラウンド処理をコントロールする
    以下のプロパティを新設

 ■□◀▶◇◆①
 countAnimation
 hh:mm:ss:ff_|.
 00:00:00:00.
 -----#-----.
*/
'use strict';
var startupTaskController=function(){
        xUI.player = {};
    xUI.player.startClick   = (new Date()).getTime();//計測開始点
    xUI.player.stopClick    = xUI.player.startClick ;//計測停止点
    xUI.player.runMode      = 'receipt'             ;//計測モード 0|1...　計測を開始したモードを記録する
    xUI.player.status       = 'stop'                ;//ステータス run|lap|stop
    xUI.player.loop         = false                 ;//タイムシートをループするか
    xUI.player.standbyStart = true                  ;//開始フレーム待機フラグ(開始フレーム自動復帰フラグ)
    xUI.player.wait         = 0                     ;//計測開始前ウエイト(ミリ秒)
    xUI.player.keyboard     = false                 ;//キーボード操作有効フラグ（202005現在常時オン）
    xUI.player.markSwap     = false                 ;//マーク動作切り替えスイッチ
    xUI.player.getCount     = false                 ;//計測動作中のマーク取得フラグ
    xUI.player.waitCount    = 0                     ;//ウエイト動作中の残カウンタ
    xUI.player.countStack   = []                    ;//マーク|ラップ兼用スタック配列
    xUI.player.countAnimation=[
        '□□□□□#□□□□□',
        '□□□□□#□□□□■',
        '□□□□□#□□□■■',
        '□□□□□#□□■■■',
        '□□□□□#□■■■■',
        '□□□□□#■■■■■',
        '□□□□■#■■■■■',
        '□□□■■#■■■■■',
        '□□■■■#■■■■■',
        '□■■■■#■■■■■',
        '=====③=====',
        '=====②=====',
        '- ◆ -'
    ]//
/*
 *  タイマー機能のモードを拡張
 *  通常及びタイムシートモード
 *  通常モードは標準的なストップウオッチとしての機能 スタート・ストップ・ラップ（ラップメモリ 1）
 *  タイムシートモードではシート状へのマーキング機能をもつ
 */
/*  start
 *  @params {Boolean}   withMark
 *      スタート時にマークフラグを伴うスイッチ 省略時false
 *  @params {Number}    clickClock
 *      計測開始時間を指定可能 引数があれば xUI.player.startClickに代入する
 */
    xUI.player.start = function(withMark,clickClock){
        var clock = (new Date()).getTime();
        if(xUI.player.runMode > 0){
//タイムシートモード
            xUI.player.startClick = clock;
            if(clickClock) xUI.player.startClick = clickClock;
            xUI.selectBackup      = xUI.Select.slice();
            xUI.selectionBackup   = xUI.Selection.slice();
            xUI.selection();//バックアップとってクリア
            xUI.player.waitCount     = parseInt(xUI.player.wait);
            xUI.player.currentFrame  = 0 ;//処理中のフレーム
            if(withMark){
                xUI.player.markFrame(xUI.Select);
                xUI.player.getCount      = true  ;//フレーム取得フラグセット
            }else{
                xUI.player.getCount      = false ;//フレーム取得フラグリセット
            }
        }else{
//通常モード
            if(xUI.player.status == 'stop')
            xUI.player.startClick = clock - (xUI.player.stopClick - xUI.player.startClick);
            if(clickClock) xUI.player.startClick = clickClock;
        }
//        xUI.player.countStack    = [];//スタート時点の自動クリアを行わない　明示的なクリアまでマークと共に保持する
        xUI.player.runMode       = xUI.activeDocumentId;
        xUI.player.status        = 'run';
    };
/**stop
 *  @params {Number}    clickClock
 *      計測終了時間を指定可能 引数があれば xUI.player.stopClickに代入する
 *      呼び出しに遅延が想定される場合は指定を推奨
 */
    xUI.player.stop      = function(clickClock){
        xUI.player.stopClick = (new Date()).getTime();
        xUI.player.status   = 'stop';
        if(clickClock) xUI.player.stopClick = clickClock;
        if(xUI.player.runMode > 0){
            xUI.selection(add(xUI.Select,xUI.selectionBackup));
        }else{
            
        }
        if(this.waitCount !=0 ) this.waitCount=0;
        document.getElementById("timerDisplay").value = nas.ms2FCT(this.stopClick-this.startClick,8,0,nas.FRATE);
    };
/** timer reset
 *  
 */
    xUI.player.reset = function(){
//        var rate = (xUI.XPS)? xUI.XPS.framerate : nas.FRATE;
        if(xUI.player.status != 'stop') return false;
        xUI.player.stopClick = (new Date()).getTime();
        xUI.player.startClick = xUI.player.stopClick;
        if(xUI.player.runMode > 0){
            xUI.selection(add(xUI.Select,xUI.selectionBackup));
            xUI.selectBackup      = xUI.Select.slice();
            xUI.selectionBackup   = xUI.Selection.slice();
        }else{
            xUI.player.countStack.length = 0;//ラップリセット
        }
        if(this.waitCount !=0 ) this.waitCount=0;
       if(document.getElementById("timerDisplay")) document.getElementById("timerDisplay").value = nas.ms2FCT(0,8,0,nas.FRATE);
        return xUI.player.startClick;
    };

/* ストップウオッチ機能のための補助機能

*/
/** timer lap
 *  
 */
    xUI.player.lap = function(){
        var clock = (new Date()).getTime();
        if(xUI.player.runMode > 0) return ;
        if(xUI.player.status == 'stop') return false;
        var elapsedTime = clock - xUI.player.startClick;//経過時間
        xUI.player.countStack.push(elapsedTime);//経過時間をスタックにプッシュ
        xUI.player.status = 'lap';
        var tc = nas.ms2FCT(elapsedTime,8,0,nas.FRATE)
        if(document.getElementById("timerDisplay").value != tc) document.getElementById("timerDisplay").value = tc;
        return tc;
    };
/**
 *    セルにマーカーを配置してマークをスタックする
 *  @params  {Array|String} element
 *      シートセルアドレス配列またはID文字列
 */
xUI.player.markFrame=function(element){
    if(element instanceof Array){
        this.countStack.push(element);
        element=document.getElementById(element.join('_'))
    }else{
        this.countStack.push(element.id.split('_'));
    }
    nas.HTML.addClass(element,"trackMarker");
}
/**
 *    セルマーカー|ラップ及びスタックをクリア
 */
xUI.player.clearMark=function(){
    if(xUI.activeDocument.type=='xpst'){
    (function(){
        for (var trk = 0 ;trk < xUI.XPS.xpsTracks.length ; trk++){
            for (var frm = 0 ;frm < xUI.XPS.xpsTracks[0].length ; frm++){
                var cell = document.getElementById([trk,frm].join('_'));
                nas.HTML.removeClass(cell,"trackMarker");
//                if(cell.classList.contains('trackMarker')) cell.classList.remove('trackMarker');
            }
        }
    })();
    }
    xUI.player.countStack=[];
}
/**
 *    マーク状態を参照してトラック内のフォーカスされたセルを含むセクションを選択状態にする
 *  @params {Array|String}    element
 *      ターゲットのシートセルアドレス配列またはID
 *      省略時は現在フォーカスのあるシートセルセル
 */
xUI.player.buildCount=function(element){
    if((xUI.activeDocument.type != 'xpst')||(!xUI.player.countStack.length)) return ;
    if(element) xUI.selectCell(element);
    var currentFrame = xUI.Select[1];
    var targetTrack = xUI.XPS.xpsTracks[xUI.Select[0]];
    var buidTarget=new Array(xUI.XPS.xpsTracks.length);
    for (var idx=0;idx < buidTarget.length;idx++){buidTarget[idx]=[];}    
//マークをソート
    xUI.player.countStack.sort(function(a,b){
        if (a[0] < b[0]) return -1
        else if (a[0] > b[0]) return 1
        else if (a[1] < b[1]) return -1
        else if (a[1] > b[1]) return 1
        return 0;
    });
//重複マークを削除してトラック別にソート
    var currentMark=[null,null];
    for (var cix = 0 ; cix < xUI.player.countStack.length ;cix ++){
        if((xUI.player.countStack[cix][0]==currentMark[0])&&(xUI.player.countStack[cix][1]==currentMark[1])) continue;
         buidTarget[xUI.player.countStack[cix][0]].push(xUI.player.countStack[cix][1]);
         currentMark=xUI.player.countStack[cix];
    }
//ターゲットトラックを区間パース
    var buildSections=[{
        startFrame:0,
        duration:0,
        value:false
    }];
    var currentSection = buildSections[0];
    if(buidTarget[xUI.Select[0]].length==0){
        currentSection.duration=targetTrack.length;
    }else{
        if (buidTarget[xUI.Select[0]][0] != 0){
            currentSection.value = false;
            currentSection.duration = buidTarget[xUI.Select[0]][0];
            currentSection = buildSections[ buildSections.push({
                startFrame:buidTarget[xUI.Select[0]][0],
                duration:1,
                value:true
            })-1];
        }else{
            currentSection.value = true;
            currentSection.duration = 1;            
        }
        for(var ix = 1; ix < buidTarget[xUI.Select[0]].length; ix++){
            if(buidTarget[xUI.Select[0]][ix]==(buidTarget[xUI.Select[0]][ix-1]+1)){
                currentSection.duration ++;
            }else{
                buildSections.push({
                    startFrame:buidTarget[xUI.Select[0]][ix-1]+1,
                    duration:buidTarget[xUI.Select[0]][ix]-buidTarget[xUI.Select[0]][ix-1]-1,
                    value:false
                });
                currentSection = buildSections[buildSections.push({
                    startFrame:buidTarget[xUI.Select[0]][ix],
                    duration:1,
                    value:true
                })-1];
            }
        }
        if((currentSection.startFrame + currentSection.duration) < targetTrack.length){
            buildSections.push({
                startFrame:currentSection.startFrame+currentSection.duration,
                duration:targetTrack.length-currentSection.startFrame-currentSection.duration,
                value:false
            });        }
    }
    if (targetTrack.option.match(/dialog|camera|camerawork|geometry|effect|sfx|composite/)){
        var backup=[xUI.Select.slice(),xUI.Selection.slice()];
        for(var sx=0;sx < buildSections.length; sx ++){
            if (buildSections[sx].value){
                xUI.selection();
                if(targetTrack.option=='dialog'){
                    xUI.selectCell([xUI.Select[0],buildSections[sx].startFrame-2]);
                    var extCount = (buildSections[sx].duration <= 4)? 0 : buildSections[sx].duration-4;
                    xUI.sheetPut('名前,----,セ,リ,フ, ~,'+(new Array(extCount).join(','))+',----')
                }else{
                    xUI.selectCell([xUI.Select[0],buildSections[sx].startFrame]);
                    var writeContent=["▽"];
                    for(var cc=0;cc<(buildSections[sx].duration-2);cc++) writeContent.push('|');
                    writeContent.push("△");
                    xUI.sheetPut(writeContent.join(','));
                }
            }
        }
        xUI.selectCell(backup[0]);
        xUI.selection(add(backup[0],backup[1]));
    }else{
        for(var sx=0;sx < buildSections.length; sx ++){
            if (
                (buildSections[sx].startFrame<=xUI.Select[1])&&
                ((buildSections[sx].startFrame+buildSections[sx].duration)>xUI.Select[1])
            ){
                xUI.selectCell([xUI.Select[0],buildSections[sx].startFrame]);
                xUI.selection([xUI.Select[0],buildSections[sx].startFrame+buildSections[sx].duration-1]);
                return;
            }
        }
        
    }  

console.log(buildSections);    
}

      xUI.taskQueue     = [];//タスク待ち配列
      xUI.taskQueue.pc  = 0 ;//プロセスカウンタ
/*
    配列メソッドのpush/popは使用可能
    編集も基本的には配列メソッドを使用
    add(task)
    タスク優先度の編集が可能なようにする?
    繰り返しタスクの実行間隔はタスク自身で制御可能なようにする
    タスクにcounterプロパティを置いて実行一回ごとに減算　0になった時点で自身を消去する
    -1で無限に実行　-2以下でタスクを実行しない（pause）状態になる
    delayプロパティにインターバル間隔をミリ秒で設定する  実行間隔０のタスクは毎スキャン毎に実行される
    delayプロパティはタスク自身が１タスク終了時に次のタスク実行時限を設定することで実行間隔の調整が可能
    タスク実行時限に達しないタスクは実行されない

    タスク実行時限により実行されたタスクのdeleyプロパティは、実行コントローラにより０に設定される。
    このタスクはタスク自身がwaitプロパティを適切に変更しない限りコントローラの次回巡回時に削除される
    
    タスクの初期化をコンストラクタ関数一回で行うようにしたい
ex:
    A= new UItask(
        function(){ヘゲへげ},
        interval,
        wait,
        status
    )
     タスク自身を関数として実行すると自身のプロパティをコントロールした後procを実行するように設定する
     コントローラは、直接はproxを実行しない。
 */
        xUI.taskQueue.list=function(){
            var result =[];
            for (var i = 0 ; i < xUI.taskQueue.length ; i ++ )
                result.push(xUI.taskQueue[i].toString());
//            console.log( result.join('\n'));
            return result.join('\n');
        }
/**
 *    UATサーバにリクエストを自動で送信する　単純プロシジャ
 *	@params	{Object UATRequest}	req
 *		サーバに送信する通信カプセルオブジェクト
 
 */
        xUI.taskQueue.sendUATRequest = function(req){
          if(req.content){
console.log('send data request :');//console.log(req);
            $.ajax({
                url: req.url,
                type: req.method,
                dataType: req.dataType,
                data:req.content,
                success: function(result){req.request(result,req.callback,req.errorCallback,req.transaction)},
                error: req.errorCallback,
                beforeSend:function(xhr){
                    xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
                    xhr.setRequestHeader('Authorization', ( "Bearer " + req.Authorization));
                    xhr.setRequestHeader('OrganizationToken', req.OrganizationToken );
                    xhr.setRequestHeader('SessionToken', req.SessionToken );
                    return true;
                }
            });
          }else{
console.log('send get request :');//console.log(req);
            $.ajax({
                url: req.url,
                type: req.method,
                dataType: req.dataType,
                success: function(result){req.request(result,req.callback,req.errorCallback,req.transaction)},
                error: req.errorCallback,
                beforeSend:function(xhr){
                    xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
                    xhr.setRequestHeader('Authorization', ( "Bearer " + req.Authorization));
                    xhr.setRequestHeader('OrganizationToken', req.OrganizationToken );
                    xhr.setRequestHeader('SessionToken', req.SessionToken );
                    return true;
                }
            });
        }
    }
/**
 *  タスクにidを与えてキューに追加する
 *  @params {Object UItask} tsk
 *  @returns {Number}
 *       タスクid
 */
    xUI.taskQueue.addTask = function(tsk){
        if( tsk.deley < 0 ) tsk.deley = (300 * xUI.taskQueue.length);// deley auto setting
        tsk.id = xUI.taskQueue.pc;
        xUI.taskQueue.add(tsk)
        xUI.taskQueue.pc++;
        return tsk.id;
    }
/**
    xUIタスク監視手続
    タスクウオッチャーは、一定時間でコールされてタスクキューを処理する
    xUI.taskQueueコレクションにタスクを積む
    少数のリアルタイム性を要するタスクに関しては、キューの機能をコントローラ自身で監理する
    キューに格納されるオブジェクトは、基本的には実行可能な関数を引数として持つ
    それぞれのオブジェクトは以下のステータスを持つ
    ステータスは実行状態により変化する
    UItask.status = "waiting";

    waiting/実行待ち  コントローラはこのタスクを実行してステータスをrunningに変更する
    running/実行中 既にファイアしているので何も処理しない
    holding/実行がホールドされている。既にファイアしているので何も処理しない
    closed/実行が終了している。コントローラは、このタスクを消去する
    UItask.proc  
        実際に実行されるプロシジャ
     タスク自身のオブジェクトメソッドにはしないでコントロール関数を置く
     タスク実行用のインターバルプロシジャはなるべく小さくする。
*/
    xUI.tskWatcher = function(){
	    var ClockClicks = (new Date()).getTime();
        var frms = Math.floor((ClockClicks - (xUI.player.startClick+xUI.player.wait)) / (1000 / nas.FRATE));
//play head move
        if(xUI.player.status  !=  'stop'){
            if(xUI.activeDocumentId){}
            if(xUI.player.runMode > 0){
                if(xUI.player.waitCount > 0){
//waiting
                    var count = xUI.player.wait-(ClockClicks-xUI.player.startClick);//スタート後の経過時間をウエイトから減算して残ウエイトを出す
                    if(xUI.player.waitCount) {
                        var waitCountSecond = Math.ceil(xUI.player.waitCount / 1000);//(Math.floor(xUI.player.waitCount%1000/100) < 10)? "":waitCountSecond;//?
                        if(xUI.player.waitCount < 1001){
                            var countString = (xUI.player.waitCount < 916)?'':xUI.player.countAnimation[12];
                        }else if(xUI.player.waitCount < 3001){	
                            var countString = ((xUI.player.waitCount%1000) < 750)?'':(xUI.player.countAnimation[13-waitCountSecond]);
                        }else{
                            var countString = xUI.player.countAnimation[Math.floor((xUI.player.waitCount%1000)/100)].replace(/\#/,String(waitCountSecond));	
                        }
                        if(document.getElementById("timerDisplay").value != countString)document.getElementById("timerDisplay").value=countString;
                        xUI.player.waitCount = count;
                    }else{
                        if(document.getElementById("timerDisplay").value.length) document.getElementById("timerDisplay").value='';
                    }
                }else{
//runninng
                    var currentOffset = (xUI.selectBackup[1]+frms);//再生開始後の経過フレーム
                    var counterString = nas.Frm2FCT(currentOffset,8,0,nas.FRATE);
                    if(document.getElementById("timerDisplay").value !=counterString )
                        document.getElementById("timerDisplay").value = counterString;
                    if((! xUI.player.loop)&&(currentOffset >= xUI.XPS.xpsTracks.duration)){
                        var standbyFrame=(xUI.player.standbyStart)? 0:xUI.XPS.xpsTracks.duration-1;
                        xUI.player.stop();xUI.selectCell([xUI.Select[0],standbyFrame]);//終了フレーム
                    }else{
                        var currentFrame = currentOffset % xUI.XPS.xpsTracks.duration;
                        var currentTrack = (! xUI.player.loop)? xUI.Select[0]:Math.floor(currentOffset/xUI.XPS.xpsTracks.duration);
                        if((xUI.Select[0] != currentTrack) || (xUI.Select[1] != currentFrame))
                            xUI.selectCell([currentTrack,currentFrame]);
                        if(currentFrame != xUI.player.currentFrame){
                        xUI.player.currentFrame = currentFrame;
                            if(xUI.player.getCount){
                                xUI.player.markFrame([currentTrack,currentFrame]);
                            }
                        }
                    }
                }
            }else{
//通常ストップウオッチ
                var counterString = (xUI.player.status == 'lap')?
                    nas.ms2FCT(xUI.player.countStack[xUI.player.countStack.length-1],8,0,nas.FRATE):
                nas.ms2FCT(ClockClicks-xUI.player.startClick,8,0,nas.FRATE);
                if(ClockClicks % 500 < 250) counterString = counterString.slice(0,-1)+" ";
                if(document.getElementById("timerDisplay").value !=counterString ) document.getElementById("timerDisplay").value=counterString;
            }
        }else{
            if(xUI.player.runMode != xUI.activeDocumentId) xUI.player.reset();
        }
/*   タスク列処理  */
        for(var tid = xUI.taskQueue.length -1 ;tid >= 0; tid --){
            if(xUI.taskQueue[tid].counter < -1) continue;//実行停止ならばスキップ
            if((xUI.taskQueue[tid].timer + xUI.taskQueue[tid].deley) >= ClockClicks) continue ;
            if(xUI.taskQueue[tid].proc instanceof UATRequest){
                xUI.taskQueue.sendUATRequest(xUI.taskQueue[tid].proc);
            }else{
                setTimeout(xUI.taskQueue[tid].proc,0);
            }
            xUI.taskQueue[tid].timer = ClockClicks;
            if( xUI.taskQueue[tid].counter == -1 ) continue;
            xUI.taskQueue[tid].counter --;
            if(xUI.taskQueue[tid].counter == 0) xUI.taskQueue.splice(tid,1);
        }
    }
/*  バックグラウンドタスク稼働試験 */
    xUI.taskQueue.addTask(new UItask("taskTEST",function(){console.log('test :'+(new Date()).getTime());},1000,1));
/*  バックグラウンドタスク
 *    プロジェクト管理データが何らかのリポジトリに所属していた場合、
 *    一定時間ごとにpullトランザクションを実行する
 */
    xUI.taskQueue.addTask(new UItask("documentPull",function(){
console.log('...')
        if((xUI.XMAP)&&(xUI.XMAP.dataNode)){
            var trxMap = xUI.XMAP;
console.log("documentPull :"+ trxMap.getIdentifier())
            var trxmap = new nas.Transaction(
                trxMap,
                "pull",
                xUI.resetReceipt
            );
            if(trxMap.contents.length){
                for (var c = 0 ; c < trxMap.contents.length ; c++){
                    if(trxMap.contents[c]===xUI.XPS){
                        var trxpst = new nas.Transaction(
                            trxMap.contents[c],
                            "pull",
                            xUI.resetSheet
                        );
                    }else{
                        var trxpst = new nas.Transaction(
                            trxMap.contents[c],
                            "pull"
                        );
                    }
                }
            }
        }
    },60000,-1));
    setInterval(xUI.tskWatcher,10);
}
/*
    キューに置かれるタスクコンテナ
    proc        実行するプロシジャ
    delay       実行ディレイ　intervalと同義　実行間隔は正確には保証されない ミリ秒
    counter     タスクの寿命カウンタ　1実行ごとに減算
                -1で無限に実行　−2以下で停止　ステータスを兼ねる
    timer       最終の実行時間を置く


    execute タスクの実行
    abort   カウンタを -2 に設定するとエントリをキューに残したまま動作を停止する
    remove  タスクを削除する
*/
var UItask = function UItask(name,proc,deley,counter){
         this.name      = (name)? name : new Date();
         this.proc      = proc;
         this.deley     = deley;
         this.counter   = counter;
         this.timer     = (new Date()).getTime();
         this.id;
      };
UItask.prototype.toString = function(){
    return [this.id,this.name,this.deley,this.counter,this.timer].join(':');
}
UItask.prototype.abort = function(){
    this.counter = -2;
}
UItask.prototype.remove = function(){
    var ix = xUI.taskQueue.indexOf(this);
    if(ix >= 0) xUI.taskQueue.splice(ix,1);
}

/**
 *  <pre>
 *  UATサーバに対する通信リクエスト用オブジェクト
 *  自動実行のキュー列に置く
 *  起動はタスク管理から行われる
 *  オブジェクト単体でタスクキューに投入することが可能
 *	タスクマネージャーはリクエストを直接送信プロシジャに渡す
 *  UATリクエストオブジェクト
 *  </pre>
 *      @params    {String}    url
 *          url-string全体（省略なし）
 *      @params    {Function}    request
 *          requestFunction
 *      @params    {Function| Object nas.Transaction}    callback
 *          callbackFunction| nas.Transaction
 *      @params    {Function}    callback2
 *          errorCallbackFunction
 *      @params    {String}    OrganizationToken
 *          organization_token
 *      @params    {String}    method
 *          method_type(GET|POST|PUT...)
 *      @params    {String}    dataType
 *          request dataType(json|palin-text...)
 *      @params    {Object}    contentData
 *          content data capsuled object for post|put method 
 *      @params    {Object}    parentObject
 *          リクエスト関数内で参照可能な親オブジェクト
 *
 */
var UATRequest = function (url,request,callback,callback2,organizationToken,method,dataType,authorizationToken,sessionToken,contentData,parentObject){
    this.url                = (url)?url:'';
    this.request            = request;
    if(callback instanceof nas.Transaction){
        this.tarnsaction        = callback;//トランザクション処理の場合のみ存在
        this.callback           = undefined;
    }else{
        this.tarnsaction        = undefined;
        this.callback           = callback;
    }
    this.errorCallback      = callback2;
    this.OrganizationToken  = organizationToken;
    this.method             = (method)?method:'GET';
    this.dataType           = (dataType)?dataType:'json';
    this.Authorization      = (authorizationToken)?authorizationToken:'';
    this.SessionToken       = (sessionToken)?sessionToken:'';
    if(contentData)  this.content = contentData;
    if(parentObject) this.parent  = parentObject;
}
/*TEST
    var REQ = new UATRequest(
        'https://remaping.scivone-dev.com/api/v2/episodes/he4mzMCw4VWfqAgUiDaoko8Y.json',
        function(result){console.log(result);if(this.parent.callback instanceof Function){this.parent.callback();}},
        function(result){console.log('callback function');},
        function(result){console.log('erroe :');console.log(result)},
        "1xW4FYYQnmt73z7b7cMPGVx8",
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
    var TSK = new UItask(REQ,100,1);
    xUI.taskQueue.addTask(TSK);
*/
/*
    UATサーバ向けのリクエストタスクオブジェクト作成テンプレート
    URL    {String} url-string全体（省略なし）
    タスク{Function} 引数は無名関数でラップされて 通信リザルト,コールバック関数,エラーコールバック関数　３つが引数として渡される


    var req = new UATRequest(
        this.url+'/api/v2/products/'+myToken[ix]+'.json',
        function(result,callback,callback2){
console.log(result.data)
//母体リポジトリをスコープに関わらず取得する
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
//タイトル取得
            var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
//以下処理
            try{


                if(callback instanceof Function) callback();
            }catch(err){
                console.log(err);
                if(callback2 instanceof Function) callback2();
            }
        },
        callback,
        callback2,
        this.token,
        "GET",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token')
    );
//リクエストをタスクとして初期化　100ミリ秒ウエイトで１回実行
    var TSK = new UItask(req,100,1);
    xUI.taskQueue.addTask(TSK);
// */
/*
    UATサーバ向けのリクエストタスクオブジェクト作成テンプレート(データ書き込み)
    URL    {String} url-string全体（省略なし）
    タスク{Function} 引数は無名関数でラップされて 通信リザルト,コールバック関数,エラーコールバック関数　３つが引数として渡される
    内容データ {Object} 書き込みデータをオブジェクトで渡す Objectの構成は書き込み先ごとに変化する

    var req = new UATRequest(
        this.url+'/api/v2/cut_bags/'+myToken[ix]+'.json',
        function(result,callback,callback2){
console.log(result.data)
//母体リポジトリをスコープに関わらず取得する
            var myRepository = serviceAgent.repositories.find(function(element){
                return ((element instanceof NetworkRepository)&&(element.token == result.data.current_membership.organization_token))
            });
//タイトル取得
            var myTitle = myRepository.pmdb.workTitles.entry(result.data.product.token);
//以下処理
            try{


                if(callback instanceof Function) callback();
            }catch(err){
                console.log(err);
                if(callback2 instanceof Function) callback2();
            }
        },
        callback,
        callback2,
        this.token,
        "PUT",
        'json',
        (xUI.onSite)? $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token'),
        (xUI.onSite)? $('#backend_variables').attr('data-session_token'):$('#server-info').attr('session_token'),
        {
            name:,
            description:,
            :,
            
        }
    );
//リクエストをタスクとして初期化　100ミリ秒ウエイトで１回実行
    var TSK = new UItask(req,100,1);
    xUI.taskQueue.addTask(TSK);
// */
//  タスク監視スタートアップはこのプロシジャ全体をxUIの再初期化あとに実行する必要あり  2018 08 29
// test
