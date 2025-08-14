/**
    ローカルリポジトリ
    作業データをストックする
    カットのデータを履歴付きで保持できる
    複数カットを扱うか？
    可能だが扱わないほうが良いような気がする
    （それだけで済ませようとするユーザはキケン）
    xUIから見るとサーバの一種として働く
    ローカルストレージを利用して稼働する

保存形式
info.nekomataya.remaping.dataStore
内部にオブジェクト保存
*/
/*
    履歴構造の実装には、XPSのデータを簡易パースする機能が必要
    プロパティを取得するのみ？
    
    サーバは自身でXPSをパースして（データ全送りはしない）識別データを送る
    又はアプリケーションがパースした情報を名前等の識別情報とともに送り返す
    
(タイトル)[#＃№](番号)[(サブタイトル)]//S##C####(##+##)/S##C####(##+##)/S##C####(##+##)/不定数…//lineID//stageID//jobID//
    例:
ももたろう#SP-1[鬼ヶ島の休日]//SC123 ( 3 + 12 .)//0//0//1

 XPSオブジェクトから識別テキストを組む関数が必要
 
タイトル/話数/サブタイトル/カット番号等の文字列は、少なくともリポジトリ内/そのデータ階層でユニークであることが要求される
例えば現存のタイトルと同じと判別されるタイトルが指定された場合は、新規作品ではなく同作品として扱う
似ていても、別のタイトルと判別された場合は別作品として扱われるので注意

＊判定時に

    タイトル内のすべての空白を消去
    半角範囲内の文字列を全角から半角へ変換
    連続した数字はparseInt

等の処置をして人間の感覚に近づける操作を行う（比較関数必要）


ラインID　ステージID　及びジョブIDはカット（管理単位）毎の通番　同じIDが必ずしも同種のステージやジョブを示さない。
管理工程の連続性のみが担保される
識別子に管理アイテム識別文字列を加えても良い
    例:
0//0//0
0:本線//1:レイアウト//2:演出検査
 
    エントリの識別子自体にドキュメントの情報を埋め込めばサーバ側のパースの必要がない。
    ネットワークストレージをリポジトリとして使う場合はそのほうが都合が良い
    管理DBの支援は受けられないが、作業の管理情報が独立性を持てる
    
 //現状
 var myXps= XPS;
    [encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
 //将来は以下で置き換え予定CSオブジェクト未実装
    myXps.sci.getIdentifier();
*/

//比較関数　3要素の管理情報配列　issuesを比較して先行の管理ノード順位を評価する関数

issuesSorter =function(val1,val2){
    return (parseInt(val1[0].split(':')[0]) * 100 + parseInt(val1[1].split(':')[0]) * 10 + parseInt(val1[2].split(':')[0])) - ( parseInt(val2[0].split(':')[0]) * 10000 + parseInt(val2[1].split(':')[0]) * 100 + parseInt(val2[2].split(':')[0]));
};

/**
初期化引数:カット識別子[タイトルID,話数ID,カットID]

    ドキュメントリストにエントリされるオブジェクト
    product には作品と話数
    sci     にはカット番号（兼用含む）情報が格納される
    issues  には管理情報が一次元配列で格納される
    実際のデータファイルはissueごとに記録される
    いずれも　URIエンコードされた状態で格納されているので画面表示の際は、デコードが必要

    ネットワークリポジトリに接続する場合は以下のプロパティが追加される
    listEntry.titleID   /int
    listEntry.episodeID /int
    listEntry.iassues[#].cutID  /int
    
*/
listEntry=function(myIdentifier){
    var dataArray=myIdentifier.split("//");
    this.product = dataArray[0];
    this.sci     = dataArray[1];
    this.issues  = [dataArray.slice(2)];
if(arguments.length>1) {
        this.titleID    = arguments[1];
        this.episodeID  = arguments[2];
        this.issues[0].cutID = arguments[3];
    }
}
/**
    エントリは引数が指定されない場合、管理情報を除いたSCI情報分のみを返す
    引数があれば引数分の管理履歴をさかのぼって識別子を戻す
*/
listEntry.prototype.toString=function(myIndex){
    if(typeof myIndex == "undefined"){myIndex = -1;}
    if(myIndex < 0){
        return [this.product,this.sci].join("//");
    }else{
        if(myIndex<this.issues.length){
            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1 - myIndex].join("//");
        }else{
            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1].join("//");
        }
    }
}
/**
    識別子を引数にして管理情報をサブリストにプッシュする
    管理情報のみが与えられた場合は無条件で追加
    フルサイズの識別子が与えられた場合は　SCI部分が一致しなければ操作失敗
    追加成功時は管理情報部分を配列で返す
    
    
    SCI部分のみでなく　ラインとステージが一致しないケースも考慮すること（今回の実装では不用）
    
    ネットワークリポジトリ・DB接続用にIDを増設
    
    
*/
listEntry.push=function(myIdentifier){
    var dataArray=myIdentifier.split("//");
    if(dataArray.length > 5){
        if((dataArray[0]!=this.product)||(dataArray[1]!=this.sci)){return false;}
        issueArray = dataArray.slice(2);
    } else {
        issueArray = dataArray;
    }
    if(arguments.length>1) {
        this.titleID     = arguments[1];
        this.episodeID   = arguments[2];
        issueArray.cutID = arguments[3];
    }
        this.issues.push(issueArray);
}
/**
A=new listEntry("%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97[%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%AB%E3%83%83%E3%83%88]//S-C10(72)//0//0//1");
A
*/


localRepository={
//    currentProduct:"",
//    currentSC:"",
//    currentLine:"",
//    currentStage:"",
//    currentJob:"",
    entryList:[],
    keyPrefix:"info.nekomataya.remaping.dataStore.",
    maxEntry:5
};

/**
    getListメソッドは、ストアリストをクリア
    ローカルストレージ内のデータをすべて走査してストアリストに格納
    エントリリストの更新を行う

    戻り値はストアされたエントリの数
    実際のデータ・エントリリストが必要な場合は、localRepository.entryList を参照すること
    
*/
/**
    フィルタ引数　myFilter,isRegex
    if(typeof myFilter == "undefined") {myFilter=".+";};
    var myFilterRegex =(isRegex)? new RegExp(myFilter):new RegExp(".*"+myFilter+".*");
//エントリ数を少なく制限するのでここでは実際はフィルタは意味をなさない　フィルタのフォーマットは一考


*/

localRepository.getList=function(){
    var keyCount=localStorage.length;//ローカルストレージのキー数を取得
    this.entryList.length=0;//配列初期化
    var currentEntryID;
    for (var kid=0;kid<keyCount;kid++){
        if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
            var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
            var entryArray=currentIdentifier.split( "//" );//分離して配列化
            var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
            var hasEntry = false;
            for (var eid=0 ; eid < this.entryList.length; eid ++){
                //エントリリストにすでに登録されているか検査
                if(myEntry == this.entryList[eid]){ currentEntryID = eid; hasEntry=true; break; }
            }
            if(hasEntry){
                //登録済みプロダクトなのでエントリに管理情報を追加
                //this.entryList[currentEntryID].issues.push(entryArray.slice(2).join("//"))
                this.entryList[currentEntryID].push(entryArray.slice(2).join("//"))
            }else{
                //未登録新規プロダクトなのでエントリ追加
                this.entryList.push(new listEntry(currentIdentifier));
            }
        }
    }
    return this.entryList.length;
}
/**
    与えられたXpsオブジェクトから識別子を自動生成
    識別子にkeyPrefixを追加してこれをキーにしてデータを格納する
    後日識別子の正式なフォーマットを出してメソッドに変更予定
    キーが同名の場合は自動で上書きされるのでクリアは行わない
    エントリ数の制限を行う
    エントリ数は、キーの総数でなく識別子の第一、第二要素を結合してエントリとして認識する
*/
localRepository.pushEntry=function(myXps){
//この識別子作成は実験コードです　近々にXps.getIdentifier() メソッドと置換されます。2016.11.14
    var myIdentifier=[encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",0,0,0].join("//");
    if(this.entryList.length>this.maxEntry){
    　//設定制限値をオーバーしたら、ローカルストレージから最も古いエントリを削除して　新しいエントリを追加する
        for (var iid=0;iid<this.entryList[0].issues.length;iid++){ localStorage.removeItem(this.keyPrefix+this.entryList[0].this.entryList[0].issues[iid]);};
        this.entryList=this.entryList.slice(1);
    }
    localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
}

/**
    識別子を引数にしてリスト内を検索
    一致したデータをローカルストレージから取得してXpsオブジェクトで戻す
    識別子に管理情報があればそれをポイントして、なければ最も最新のデータを返す
    コールバックを渡す
*/
localRepository.getEntry=function(myIdentifier){
    if(String(myIdentifier).split("//").length>4){
        myXpsSource=localStorage.getItem(this.keyPrefix+myIdentifier);
    }else{
        for(var ix=0;ix<this.entryList.length;ix++){if (myIdentifier==this.entryList[ix]) break;}
        myXpsSource=localStorage.getItem(this.keyPrefix+myIdentifier+"//"+this.entryList[ix].issues[this.entryList[ix].issues.length-1].join("//"));        
// alert(this.keyPrefix+myIdentifier+"//"+this.entryList[ix].issues[this.entryList[ix].issues.length-1].join("//"));
    }
    if(myXpsSource){
        var myXps=new Xps();
        myXps.readIN(myXpsSource);
        return myXps;
    }else{
        return false;
    }
}

/*  test data 
    localRepository.currentProduct = "ももたろう#12[キジ参戦！ももたろう地獄模様！！]";
    localRepository.currentSC      = "S-C005 (12+00)/011(3+00)/014(3+00)";
    localRepository.currentLine    = 0;
    localRepository.currentStage   = 0;
    localRepository.currentJob     = 0;

JSON.stringify(localRepository);
*/
/**
localRepository.pushStore(XPS);
localRepository.getList();
//localRepository.entryList[0];
localRepository.getEntry(localRepository.entryList[0]);
*/