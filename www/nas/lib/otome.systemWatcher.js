﻿/**
 * @overview object nas.otome.systemWatcher(myCommand)
 * 
 * systemWatcherオブジェクトはシステムのクリップボードと特定のフォルダを監視するシステムを提供する。
 * 設定されたインターバルで指定フォルダおよびクリップボードの監視を行うことができる。
 * 外部プログラムをエージェントとしてAE（乙女）に変更を通知することも可能。
 * これらをトリガーにしてコマンドキューに登録したアクションを実行することができる
 * 
 * アクションにはFunction またはFileオブジェクトを指定する。
 * アクションはキューに複数登録しておくことが可能
 * 
 * 引数:myComamnd にはコマンド文字列としてステータスを表す文字列または設定するインターバルを与える
 * [整数]	監視インターバルをミリ秒で指定。デフォルトは　60000 (1分間隔)
 * start	監視を開始する。初期化手順が終了するとこのステータスは自動消滅する。
 * stop	ステータスフラグを停止にする。AEは呼び出されてもアクションを行なわない。このフラグを認識したエージェントは動作を停止することが望まれる（　停止しなくても良い　）AEの動作はsleepとほぼ同じ
 * sleep	ステータスフラグを休止にする。監視継続中だがAEは呼び出されてもアクションを行なわない。エージェントはAEを呼び出さないことが望まれる。外部から呼び出しを行う前にステータスを確認して必要なら変更をトライすること。トライした変更は保証されない。
 * wakeup	ステータスフラグを活動中にする。エージェントはターゲットを監視してクリップボードやファイルが更新されたらAEを呼び出す。AEは呼び出しを受けるとキューのコマンドを逐次実行する。
 * 
 * 監視プロセス実行中は、ステータス遷移コマンドは、以下のように働く
 * start	監視プロセスを初期化する。初期化終了後は自身のステータスを動作設定にしたがってsleep/wakeupのいずれかに変更する。
 * stop	監視プロセスを終了ステータスへ遷移する。監視インターバルは停止する。外部からの呼び出しは無視する。startupコマンドのみがこの状態を稼動状態へ遷移させる
 * sleep	wakeup状態の監視プロセスがこのコマンドを受け取ると、sleep状態に遷移する。インターバル監視は停止。外部からの呼び出しはwakup/stop以外のコマンドを受け取らない
 * wakeup	sleep状態の監視プロセスはこのコマンドを受け取ると、wakeup状態に遷移する。監視インターバルは設定された間隔でクリップボードとフォルダの監視を行う。外部呼出しはすべてのコマンドを受信する。
 * 
 * 
 * 監視エージェントの起動は別プロセスにゆだねる。ステータスと一元管理をしない
 * 手作業でエージェントを起動しても良い。
 * 
 * エージェント監視フォルダにあるコマンドフォルダを参照されたし。このフォルダの名前をトリガーにしてエージェントは動作をコントロールすることを期待されている。
 * 指定できるコマンド（フォルダ名）は以下の三つのうちいずれか。
 * 上から順に優先でそのフォルダが存在すればＡＥ側のステータスがその状態である
 * stop.cmd 	エージェント終了
 * sleep.cmd	通知停止
 * wakeup.cmd	通知開始
 * 
 * エージェントは自己の希望する動作状態をotomeに通知する。　この通知を受けたAEは、可能な限りステータスを変更してコマンドフォルダを名称変更する。
 * フォルダの名前を外部から手作業で変更することでエージェントの動作をコントロールすることも可能だが、エージェントはAEに対して変更リクエストを出すことを望まれる。
 * エージェントはAEに問い合わせを行なって現在の監視フォルダのロケーションを得ることが出来るようにする（固定コーディングしない）
 * 
 * @param myStatus
 * @returns {*}
 */
nas.otome.systemWatcher = function (myStatus) {
    this.systemWatcher.checkStatus();
    if (false) {
        /**
         * @desc コマンドステータスが存在しない場合は{stop}（初回込み）
         */
        if (this.systemWatcher.commandStatus instanceof Folder) {
            if (!this.systemWatcher.commandStatus.exists) {
                this.systemWatcher.status = "stop";
                this.systemWatcher.commandStatus = null;
                if ((this.systemWatcher.watchID)) {
                    app.cancelTask(this.systemWatcher.watchID);
                    this.systemWatcher.watchID = 0;
                }
            } else {
                switch (this.systemWatcher.commandStatus.name) {
                    case "stop.cmd" :
                        this.systemWatcher.status = "stop";
                        if (this.systemWatcher.watchID) {
                            this.app.cancelTask(this.systemWatcher.watchID);
                            this.systemWatcher.watchID = 0;
                        }
                        break;
                    case "sleep.cmd" :
                        this.systemWatcher.status = "sleep";
                        if (!this.systemWatcher.watchID) {
                            systemWatcher.watchID = app.scheduleTask("nas.otome.systemWatcher.notice(\"all\");", this.systemWatcher.watchInterval, true)
                        }
                        break;
                    case "wakeup.cmd":
                        this.systemWatcher.status = "wakeup";
                        if (!this.systemWatcher.watchID) {
                            systemWatcher.watchID = app.scheduleTask("nas.otome.systemWatcher.notice(\"all\");", this.systemWatcher.watchInterval, true)
                        }
                        break;
                }
            }
        } else {
            /**
             * @desc commandStatusが無いので作成
             * コマンド指定フォルダがあるかどうか確認する。すでに存在した場合は優先順位に従ってステータスを設定　存在しない場合は新規作成
             */
            var folderContent = this.systemWatcher.watchFolder.getFiles("*.cmd");
            if (folderContent.length) {
                for (var idf = 0; idf < folderContent.length; idf++) {

                    if ((folderContent[idf] instanceof Folder) && (folderContent[idf].name.match(/(stop|sleep|wakeup)\.cmd/i))) {
                        this.systemWatcher.status = RegExp.$1;
                        this.systemWatcher.commandStatus = new Folder(folderContent[idf].fsName);
                        break;
                    }
                }
            }
        }
        if (!this.systemWatcher.commandStatus) {
            this.systemWatcher.commandStatus = new Folder([this.systemWatcher.watchFolder.path, this.systemWatcher.watchFolder.name, this.systemWatcher.status + ".cmd"].join("/"));
            try {
                if (!(this.systemWatcher.commandStatus.exists)) {
                    this.systemWatcher.commandStatus.create()
                }
            } catch (er) {
                alert(er);
                return false;
            }
        }
    }


    if (!myStatus) {
        return this.systemWatcher.status
    }//指定がなければ現状をリターン

    if (myStatus.match(/(stop|sleep|wakeup)/i)) {
        this.systemWatcher.status = myStatus;
        this.systemWatcher.commandStatus.rename(myStatus + ".cmd");
    }

    if (!(isNaN(myStatus))) {
        this.systemWatcher.watchInterval = myStatus;
        if (this.systemWatcher.watchID) {
            app.cancelTask(this.systemWatcher.watchID);//タスクがあれば更新
            this.systemWatcher.watchID = app.scheduleTask("nas.otome.systemWatcher.notice(\"all\");", this.systemWatcher.watchInterval, true);
        }
    }

    if ((this.systemWatcher.status.match(/stop/i)) && (this.systemWatcher.watchID)) {
        this.app.cancelTask(this.systemWatcher.watchID);
        this.systemWatcher.watchID = 0;
    }

    if ((this.systemWatcher.status.match(/(sleep|wakeup)/i)) && (this.systemWatcher.watchID == 0)) {
        this.systemWatcher.watchID = app.scheduleTask("nas.otome.systemWatcher.notice(\"all\");", this.systemWatcher.watchInterval, true);
    }

    return this.systemWatcher.status;

    if (myStatus != this.systemWatcher.status) {
        switch (myStatus) {
            case "sleep":
            case "wakeup":
                if (this.systemWatcher.status == "stop") {
                    return this.systemWatcher.status
                }
                this.systemWatcher.commandStatus.rename(myStatus + ".cmd");
                break;
            case "stop":
                if (this.systemWatcher.commandStatus != null) {
                    this.systemWatcher.commandStatus.rename(myStatus + ".cmd");
                } else {
                    this.systemWatcher.commandStatus = null;
                }
                break;
            case "start":
                if (this.systemWatcher.status != "stop") {
                    return this.systemWatcher.status
                }

                /**
                 * @desc 起動失敗した場合はステータスファイルがそのままで残る。　ステータスも変更なし
                 * 呼び出されてオブジェクトがなければ作成（イニシエーション）
                 */
                if (!this.commandStatus) {
                    this.systemWatcher.commandStatus = new Folder([this.systemWatcher.watchFolder.path, this.systemWatcher.watchFolder.name, "start.cmd"].join("/"));
                    try {
                        if (!(this.systemWatcher.commandStatus.exists)) {
                            this.systemWatcher.commandStatus.create()
                        }
                    } catch (er) {
                        alert(er);
                        return false;
                    }
                }
                /**
                 * @desc agent呼び出し　
                 * エージェントがステータスファイル名を変更してステータスを更新する
                 */
                this.systemWatcher.startup();
                break;
            default :
                return this.systemWatcher.status;
        }
    }
    return myStatus;
};


nas.otome.systemWatcher.commandStatus = new Folder();//空フォルダ　で初期化する
/**
 * nas.otome.systemWatcher.commandStatus
 * null または　Folder オブジェクト　ケースによっては認識できない場合があるので注意
 */

/**
 * nas.otome.systemWatcher.status
 * 
 * @desc エージェントの動作を表す内部変数
 * プログラムによる更新は禁止される（変更した場合の動作は保証されない）
 * エージェントが外部から自分の状態をセットする　参照可能
 */
nas.otome.systemWatcher.status = "stop";//"stop"で初期化（必ず）

/*nas.otome.systemWatcher.watchFolder
 watchFolder 　には、システム監視オブジェクトの受信ステータスファイルが置かれる。任意の位置に設定可能だが、規定位置を推奨。
 規定位置は　レンダー乙女のライブラリ内の　/nas/(temp)/
 サイトによってはこの場所の変更に対して管理権限が必要な場合があるので、その場合は設定を変更することも出来る。
 エージェントはこの場所にある管理ステータスを参照する必要があるのでエージェントの設定に注意されたし。
 変更先の候補
 Folder.userData.path+"/"+Folder.userData.name+"/nas/lib/(temp)"
 */
nas.otome.systemWatcher.watchFolder = Folder(Folder.userData.path + "/" + Folder.userData.name + "/nas/lib/(temp)");
if (!nas.otome.systemWatcher.watchFolder.exists) {
    nas.otome.systemWatcher.watchFolder.create();
}
/**
 * nas.otome.sysyemWatcher.commandQueue
 * 
 * コマンドキュー
 * 監視オブジェクトのコマンドコレクション
 * コマンドコレクションに登録するのはコマンドオブジェクト
 * コマンドの比較メソッドが必要かも。重複したコマンドを削除する必要がありそう　何しろ同じ操作をみなおこないがち。
 * ボタン二回クリックとか
 * 基本的には、システムとしては完全に重複したものだけを削除する機能を提供する。
 * それ以外はユーザ判断で処理
 * 比較メソッドはコマンドオブジェクトのメンバ関数
 *
 * @param myTarget
 * @param watchFile
 * @param isEnabled
 * @param myFunc
 */
nas.watchCommand = function (myTarget, watchFile, isEnabled, myFunc) {
    if (!myTarget) {
        myTarget = "none"
    }
    //"folder""clipboard""both"or"none"　任意の文字列でも可
    if (!watchFile) {
        watchFile = false
    }
    //FilePath(url) or File ?コマンド実行時のスキップ用
    if (!isEnabled) {
        isEnabled = false
    }
    //実行保留フラグ
    if (!myFunc) {
        myFunc = function () {
            alert(this.parent.watchFile)
        }
    }
    //コマンド
    this.watchFile = watchFile;
    this.watchTarget = myTarget;
    this.enabled = isEnabled;
    this.targetCommand = myFunc;
    this.isSame = function (myCommand) {
        //コマンド同士の比較　完全一致の場合のみtrue enabledは一時変数の性格が強いので比較対象外に
        if (this.watchFile.fsName != myCommand.watchFile.fsName) {
            return false
        }
        if (this.watchTarget != myCommand.watchTarget) {
            return false
        }
        if (this.targetCommand.toSource() != myCommand.targetCommand.toSource()) {
            return false
        }
        return true;
    }
};

nas.otome.systemWatcher.commandQueue = [];//トレーラー配列
/**
 * キュー追加 重複コマンドチェックあり　追加に失敗した場合はfalse
 * @param myTarget
 * @param watchFile
 * @param isEnabled
 * @param myFunc
 * @returns {*}
 */
nas.otome.systemWatcher.addCommand = function (myTarget, watchFile, isEnabled, myFunc) {
    if (!myTarget) {
        myTarget = "none"
    }
    //"folder""clipboard""both"
    if (!watchFile) {
        watchFile = false
    }
    //FilePath(url) or sigText ?コマンド実行時のスキップ用
    if (!isEnabled) {
        isEnabled = true
    }
    //待機(実行保留)フラグ(bool) true / false　フラグが立っている間はキューされても当該コマンドを実行しない　削除は削除メソッドを使用のこと
    if (!myFunc) {
        myFunc = false
    }
    //コマンド
    var newCommand = new nas.watchCommand(myTarget, watchFile, isEnabled, myFunc);
    //現状のコマンド列と比較して同一内容のコマンドがあればエントリーしない
    for (var ix = 0; ix < this.commandQueue.length; ix++) {
        if (this.commandQueue[ix].isSame(newCommand)) {
            return false
        }
    }
    this.commandQueue.push(newCommand);
    return this.commandQueue.length - 1;
};
//キューの削除
nas.otome.systemWatcher.removeCommand = function (index) {
    var newQueue = [];
    for (var idx = 0; idx < this.commandQueue.length; idx++) {
        if (idx != index) {
            newQueue.push(this.commandQueue[idx])
        }
    }
    this.commandQueue = newQueue;
    return this.commandQueue.length;
};


/**
 * @desc 監視対象フォルダのステータスフラグをチェックしてstatusプロパティを更新する
 * @returns {boolean}
 */
nas.otome.systemWatcher.checkStatus = function () {
    /**
     * @desc コマンド指定フォルダがあるかどうか確認する。
     * すでに存在した場合は優先順位に従ってステータスを設定　存在しない場合は新規作成
     */
    var folderContent = this.watchFolder.getFiles("*.cmd");
    if (folderContent.length) {
        var count = 0;
        for (var idf = 0; idf < folderContent.length; idf++) {

            if ((folderContent[idf] instanceof Folder) && (folderContent[idf].name.match(/(stop|sleep|wakeup)\.cmd/i))) {
                if (count) {
                    folderContent[idf].remove();
                } else {
                    this.commandStatus = new Folder(folderContent[idf].fsName);
                    count++;
                }
            }
        }
    }
    /**
     * @desc コマンドステータスが存在しない場合は{stop}（初回込み）
     */
    if (!this.commandStatus.exists) {
        this.status = "stop";
        this.commandStatus = null;
    } else {
        switch (this.commandStatus.name) {
            case "stop.cmd" :
                this.status = "stop";
                break;
            case "sleep.cmd" :
                this.status = "sleep";
                break;
            case "wakeup.cmd":
                this.status = "wakeup";
                break;
        }
    }
    if (this.commandStatus == null) {
        alert("commandStatusFolder create! ");
        this.commandStatus = new Folder([this.watchFolder.path, this.watchFolder.name, this.status + ".cmd"].join("/"));
        alert(this.commandStatus.name);
        try {
            if (!(this.commandStatus.exists)) {
                this.commandStatus.create()
            }
        } catch (er) {
            alert(er);
            return false;
        }
    }
};
/**
 * @desc nas.otome.systemWatcher.watchFolder.onChange()
 * 
 * メソッドは標準状態では 空の配列である。
 * クリップボードが更新された場合にこの配列内にあるfunctionが順次実行されるのでフォルダ監視を行ないたいプログラムがこの配列に必要な関数を加えること
 * nas.otome.systemWatcher.watchClipboard=new Object();
 * nas.otome.systemWatcher.watchClipboard.value="";
 * nas.otome.systemWatcher.watchClipboard.onChange=new Array();
 * nas.otome.systemWatcher.watchClipboard.change=function(){
 * for (var idx=0;idx<this.onChange.length;idx++ ){if( this.onChange[idx] instanceof Function) {this.onChange[idx](this.value)}}
 * }
 * クリップボードはサービスしない
 */

/**
 * @desc nas.otome.systemWatcher.watchClipboard.onChange
 * 
 * メソッドは標準状態では 空の配列である。
 * クリップボードが更新された場合にこの配列内にあるfunctionが順次実行されるのでフォルダ監視を行ないたいプログラムがこの配列に必要な関数を加えること
 * 変更後のクリップボードの内容は関数に引数として渡される
 * watchTargetを引数に与えることが出来る　watchTargetは文字列　"folder" "clip[board]"またはそれ以外の任意の文字列
 * コマンドのもつwatchTargetと一致した場合のみコマンドが実行される。
 * コマンドのwatchTargetが　予約語"all"の場合はターゲットがいかなる状態でも実行される。通常はfolder またはclipboardまたは””が渡される。
 */

/**
 * @param myTarget
 */
nas.otome.systemWatcher.notice = function (myTarget) {

//notice 受信タイミングでフォルダのステータスを更新
    this.checkStatus();
    //ターゲット指定フォルダがあるかどうか確認する。
    var folderContent = this.watchFolder.getFiles("*.notice");
    var myTargetOrder = false;
    if (folderContent.length) {
        myTargetOrder = folderContent[0].name.replace(/\.notice$/, "");
        for (var idf = 0; idf < folderContent.length; idf++) {
            folderContent[idf].remove()
        }
    }
    if (this.status.match(/stop|sleep/i)) {
        return
    }
    //notice を受信してもstatusがstop sleepならば無条件で処理中止
    if (!myTarget) {
        if (myTargetOrder) {
            myTarget = myTargetOrder
        } else {
            myTarget = ""
        }
    }
    //ターゲットオーダーファイルがあればターゲット未指定のターゲットを置き換え
    nas.otome.writeConsole(myTarget + " notice!");
    
//コマンドキューを逐次処理。相関はなし
//呼び出された
    for (var xidx = 0; xidx < this.commandQueue.length; xidx++) {
        if (!this.commandQueue[xidx].enabled) {
            continue
        }
        /**
         * 有効で無い場合は動作スキップ
         * @type {boolean}
         */
        var exF = false;
        /**
         * 監視ターゲットを比較　一致または"all"
         */
        if ((myTarget == this.commandQueue[xidx].watchTarget) || (this.commandQueue[xidx].watchTarget == "all")) {
            exF = true
        }
        /**
         * 監視対象ファイルが登録されていてファイルが存在しない場合は動作をスキップ
         */
        if (this.commandQueue[xidx].watchFile) {

            if (this.commandQueue[xidx].watchFile instanceof File) {
                var tempFile = this.commandQueue[xidx].watchFile;
            } else {
                var tempFile = new File(this.commandQueue[xidx].watchFile);
            }
            if (!tempFile.exists) {
                exF = false;
            }
        }
        if (exF) {
            this.commandQueue[xidx].targetCommand()
        }
        //コマンド実行
    }
};
/** nas.otome.systemWatcher.watchInterval インターバル間隔をミリ秒で
 * 
 * デフォルト値は1分(60000)
 * 監視プロセスIDは整数で現在監視プロセスを行っているタスクID 0は不稼動
 * @type {number}
 */
nas.otome.systemWatcher.watchInterval = 60000;
nas.otome.systemWatcher.watchID = 0;

/**
 * 監視自体は無名関数
 * 表示のリフレッシュ
 * 
 * @param prop
 * @param oldval
 * @param newval
 */
nas.otome.systemWatcher.reflesh = function (prop, oldval, newval) {
    if (nas.Pref) {
        nas.Pref.SaWtUpdate(newval);
    }
};
/**
 * statusにwatch　貼り付け
 */
nas.otome.systemWatcher.watch("status", nas.otome.systemWatcher.reflesh);

/**
 * @desc sysyemWatcherに待機オブジェクトを追加する一般メソッド
 * コマンドキュー
 * sysyemWatcher.commandQueue
 * systemWatcher.addCommand()
 * systemWatcher.removeCommand()
 * 
 * コマンドキューがコマンドの待機条件を確認して
 * 実行・スキップ・消去を行なう
 * コマンドオブジェクトのプロパティ
 * watchFile=ターゲットファイルのローカルパスまたはクリップボードシグネチャ(第一行目の文字列)
 * watchTarget=フォルダ監視かクリップボード監視かまたは両方かまたはなし"folder":"clip":"both":"none" 指定がなければ"none" コレが指定された場合は実質なにもしない
 * watchMethod=待機条件 "once"実行後に削除,"ever"保持,"stop"実行停止,"remove"実行せずに削除　省略時は"stop"
 * targetCommand=Function or keyword
 * 
 * 実行条件
 * 
 * noticeを受信するとコマンドキューを逐次実行
 * 各キューはまず
 * 待機ターゲットで分岐
 * 一時オブジェクトでターゲットファイルを作成
 * 呼び出し時点でファイルが喪失していたらなにもしない？またはコマンド削除？
 * コマンド待機条件を確認
 * 必要に従ってコマンドを実行
 * 必要に従って事後処理（キューを削除等）
 * ボディに比較テキストを持つと比較自体は楽になるが、なんだか嫌な感じ（後で困りそう）なので何か別の方法を考える
 * 更新比較はクリップボードシグネチャにタイムスタンプ？
 * コンペアはメソッドまかせにする…ファイルアクセスが減るかも？
 * クリップボードは、比較内容をどこかでもたないと無理だし、文字列のみの比較では誤判定の可能性があるので
 * やはりメソッドまかせか…
 * 
 * システム監視仕様
 * noticeを受信したら
 * 監視フォルダ内の　*.cmd　を検索する
 * stop.cmd sleep.cmd wakup.cmd があればステータスを更新して逐次処理する
 * 監視フォルダ内に *.notice　が存在しかつターゲットが空文字列だった場合は、その文字列をターゲットに設定する。
 * 同ファイルは消去する
 * 
 * 
 * nas.otome.systemWatcher.notice=function(myTarget){
 * if (! myTarget) myTarget="folder";
 * switch (myTarget){
 * case	"clip":
 * nas.otome.writeConsole("Clipboard Updated");
 * this.watchClipboard.value=nas.otome.getClipboardText();
 * this.watchClipboard.change();
 * break;
 * default :
 * nas.otome.writeConsole("FolderUpdated");
 * this.watchFolder.change();
 * }
 * for(var idx=0;idx<this.commandQueue.length;idx++){
 * var currentCmd=this.commandQueue[idx];
 * currentCmd.watchTarget
 * }
 * }
 */

/**
 * {osascript -e 'tell application "Adobe AfterEffects CS3" DoScript "nas.otome.noticeWatch(%kwd%)" end tell' }
 * tell application "Adobe After Effects CS3" DoScript "alert(\"You just sent an alert to After Effects\")" end tell
 */
//nas.otome.systemWatcher("start");