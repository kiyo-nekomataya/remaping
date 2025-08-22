//ターゲットURLを作るカット情報本体を取得





//console.log(result);
/*cut result-format
res:200,
data:
    current_membership:
        email:"kiyo@nekomataya.info"
        membership_name:"Nekomataya-STG1"
        membership_token:"fdrbMhBVZy3BfnvG3UeZPFX6"
        organization_name:"nishimiyaさんのチーム"
        organization_token:"6kT3SX2Mg8Er1w63RhzgVfzH"
        role:"invited"
    permitted_memberships:(3) [{…}, {…}, {…}]
    cut:
        token:"vmHVi7Kd7ioNFYkMvVzWDnAD"
        content:null
        updated_at:"2018-05-21T14:49:38.000+09:00"
        last_user_name:"nishimiya"
        last_user_token:"hr9nnpw62m8wd4KDKGTKjV7u"
        name:"113"
        property:{
            setting_layer: "Organization", sections: Array(0), duties: Array(0), users: Array(0)
        }
        stage_id:null
        line_id:null
        job_id:null
        status:"Startup"
    versions:[]

*/
/*  
    productsData=[{
        token:$('#backend_variables').attr('data-product_token'),
        name:myProductTitle,
        description:ProductDescription,
        updated-at:UPDATEED-DATE,
        episodes:[{
            token:$('#backend_variables').attr('data-episode_token'),
            name:EpisodeName,
            description:Episode-SUBTITLE,
            created-at:CREATED-DATE,
            updated-at:UPDATED-DATE,
            cuts:[[{
                token:$('#backend_variables').attr('data-cut_token'),
                name:(CUTNo),
                description:(Cut-Identifier),
                created-at:(CREATED-DATE),
                updated-at:(UPDATED-DATE),
                versions:[
                    description:(full format description or null),
                    updated_at:(UPDATED-DATE),
                    version_token:(version token)
                ]
            }]]
        }]            
    }]
*/
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: function(result) {

/*
    カットの情報から、単一プロダクト、単一エピソード、単一カットのエントリをビルドして、productsData をセットする
     
*/
    serviceAgent.currentRepository.productsData[0].episodes[0].cuts[0]=[{
        token:  result.data.cut.token,
        name:   result.data.cut.name,
        description: (result.data.cut.description)? result.data.cut.description:Xps.getIdentifier(currentXps),
        created-at:currentXps.created_time,
        updated-at:currentXps.updated_time,
        versions:result.data.versions
    }];



//エラーではなく初期化時点の初期状態のXpsのままで処理を継続する
            //xUI.userPermissions=result.data.cut.permissions;
//読み込んだXPSが識別子と異なっていた場合識別子優先で同期する
	            xUI.resetSheet(currentXps);
	            var durationChange=xUI.XPS.duration();
//console.log(xUI.XPS);
//console.log(myIssue.identifier);
                xUI.XPS.syncIdentifier(myIssue.identifier,false);
                durationChange = (durationChange == xUI.XPS.duration())? false:true;
	            if(myEntry.issues.length>1){
                    documentDepot.currentReference = new Xps(5,144);//空オブジェクトをあらかじめ新規作成
                    //自動設定されるリファレンスはあるか？
                    //指定管理部分からissueを特定する 文字列化して比較
                    if ( cx > 0 ){
                        if(parseInt(decodeURIComponent(myIssue[2]).split(':')[0]) > 0 ){
                    //ジョブIDが１以上なので 単純に一つ前のissueを選択する
                    //必ず先行jobがある  =  通常処理の場合は先行JOBが存在するが、単データをエントリした場合そうではないケースがあるので対処が必要2016 12 29
                        refIssue = myEntry.issues[cx-1];
                        }else if(decodeURIComponent(myIssue[1]).split(':')[0] > 0 ){
                    //第2ステージ以降前方に向かって検索
                    //最初にステージIDが先行IDになった要素が参照すべき要素
                            for(var xcx = cx-1 ;xcx >= 0 ; xcx --){
                                if (parseInt(decodeURIComponent(myEntry.issues[xcx][1]).split(':')[0]) == (parseInt(decodeURIComponent(myIssue[1]).split(':')[0])-1)){
                                    refIssue = myEntry.issues[xcx];
                                    break;
                                }
                            }
                        };//cx==0 のケースでは、デフォルトで参照すべき先行ジョブは無い
	                }
	                if(refIssue) serviceAgent.currentRepository.getEntry(refIssue.identifier,true);
	            }
	            //xUI.resetSheet(XPS);
                xUI.sessionRetrace = myEntry.issues.length-cx-1;
                xUI.setUImode('browsing');sync("productStatus");
                xUI.flushUndoBuf();sync('undo');sync('redo');
                if(durationChange) xUI.resetSheet();
                if(callback instanceof Function) callback();
        },
        error:function(result){
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
        },
        beforeSend: this.service.setHeader
    });

/*最小の情報をトークンベースで取得*/
                        var myProductToken = $('#backend_variables').attr('data-product_token');
                        var myEpisodeToken = $('#backend_variables').attr('data-episode_token');
                        var myCutToken = $('#backend_variables').attr('data-cut_token');

//最短時間で情報を構築するためにAPIを直接コール
//get product information
$.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/products/'+myProductToken+'.json',
        type:'GET',
        dataType: 'json',
        success: function(productResult) {
            serviseAgent.currentRepository.productsData=[productResult.data];
//get episode information
    $.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/episodes/'+myEpisodeToken+'.json',
        type:'GET',
        dataType: 'json',
        success: function(episodeResult) {
            serviseAgent.currentRepository.productsData[0].episodes=[episodeResult.data];
//get cut information
        $.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/cuts/'+myCutToken+'.json',
        type:'GET',
        dataType: 'json',
        success: function(cutResult) {
//データ請求に成功したので、本体情報からエントリを作成して要素一つだけのリストを作る
            serviseAgent.currentRepository.productsData[0].episodes[0].cuts=[[{
                cutResult.data.cut
                token:cutResult.data.cut.token,
                name:cutResult.data.cut.name,
                description:cutResult.data.cut.description,
                created-at:cutResult.data.cut.created-at,
                updated-at:cutResult.data.cut.updated-at,
                versions:cutResult.data.versions
            }]];

        	var myContent=cutResult.data.cut.content;//XPSソーステキストをセット
        	var currentXps = new Xps(5,144);
	        if(myContent){
	            currentXps.parseXps(myContent);
	        }else if(myContent == null){
	            var myParseData = Xps.parseSCi((cutResult.data.cut.description)?cutResult.data.cut.description:cutResult.data.cut.name);
	            currentXps.cut = myParseData.cut;
	            currentXps.setDuration(nas.FCT2Frm(String(myParseData.time)));
	        };
//myContent==nullのケースは、サーバに空コンテンツが登録されている場合なので単純にエラー排除してはならない
//currentXpsのプロパティをリザルトに同期させる
                    var myIdentifier=serviceAgent.currentRepository.getIdentifierByToken(myCutToken);
                    if((myIdentifier)&&(Xps.compareIdentifier(Xps.getIdentifier(XPS),myIdentifier) < 5)){
//console.log('syncIdentifier:');console.log(decodeURIComponent(myIdentifier));console.log(startupXPS.length);
                        xUI.XPS.syncIdentifier(myIdentifier,(startupXPS.length > 0));
                        //時間調整の有無をスタートアップXPSの存在で調整する
                    }
                    if( startupXPS.length==0 ){
//console.log('detect first open no content');//初回起動を検出コンテント未設定
                        xUI.XPS.line     = new XpsLine(nas.pmdb.pmTemplate.members[0]);
                        xUI.XPS.stage    = new XpsStage(nas.pmdb.pmTemplate.members[0].stages.getStage());
                        xUI.XPS.job      = new XpsStage(nas.pmdb.jobNames.getTemplate(nas.pmdb.pmTemplate.members[0].stages.getStage(),"init")[0]);
                        xUI.XPS.currentStatus   = new JobStatus("Startup");     
                        xUI.XPS.create_user=xUI.currentUser;
                        xUI.XPS.update_user=xUI.currentUser;
//syncIdentifierでカット尺は調整されているはずだが、念のためここで変数を取得して再度調整をおこなう
//data-scale を廃止した場合は、不用
                        var myCutTime = nas.FCT2Frm($('#backend_variables').attr('data-scale'));
                        if(!(isNaN(myCutTime)) && (myCutTime != xUI.XPS.time())){xUI.XPS.setDuration(myCutTime)}
                    }
//ここで無条件でproductionへ移行せずに、チェックが組み込まれているactivateEntryメソッドを使用する
                        xUI.setRetrace();
                        xUI.setUImode('browsing');//初期値設定
		                if (startupWait) xUI.sWitchPanel('Prog');//ウェイト表示消去
                        switch(xUI.XPS.currentStatus.content){
                            case "Active":
                        // チェックイン直後の処理の際はactivate処理が余分なのでケースわけが必要
                        // jobIDがフラグになるスタートアップ直後の自動チェックインの場合のみ処理をスキップしてモード変更
                                if(xUI.XPS.job.id==1){
                                    xUI.setUImode('production');
                                }else{
                                    serviceAgent.activateEntry();
                                }
                            break;
                            case "Hold":
                        // 常にactivate
                                serviceAgent.activateEntry();
                            break;
                            case "Fixed":
                        //ユーザが一致しているケースでもactivateとは限らないので、Fixedに関してはスキップ 
                            break;
                            case "Startup":
                                serviceAgent.checkinEntry();
                            case "Aborted":
                            default:
                        //NOP
                        }
                        sync('info_');
                        xUI.setUImode(xUI.setUImode());//現モードで再設定
//console.log('初期化終了');
                },
        error : function(result){console.log(result)},
        beforeSend: serviseAgent.currentRepository.service.setHeader
        );//get cut information
        },
        error : function(result){console.log(result)},
        beforeSend: serviseAgent.currentRepository.service.setHeader
    );//get episode information
        },
        error : function(result){console.log(result)},
        beforeSend: serviseAgent.currentRepository.service.setHeader
);//get product information
/* ========= シンクルドキュメントバインド時の初期化 ========= */


serviceAgent.currentRepository.getProducts(function(){
        serviceAgent.currentRepository.getEpisodes(function(){
                serviceAgent.currentRepository.getSCi(function(){
                    var myIdentifier=serviceAgent.currentRepository.getIdentifierByToken(myCutToken);
                    if((myIdentifier)&&(Xps.compareIdentifier(Xps.getIdentifier(XPS),myIdentifier) < 5)){
console.log('syncIdentifier:');
console.log(decodeURIComponent(myIdentifier));
console.log(startupXPS.length);
                        xUI.XPS.syncIdentifier(myIdentifier,(startupXPS.length > 0));
                        //時間調整の有無をスタートアップXPSの存在で調整する
                    }
                    if( startupXPS.length==0 ){
//console.log('detect first open no content');//初回起動を検出コンテント未設定
//console.log('new Entry init');
                        xUI.XPS.line     = new XpsLine(nas.pmdb.pmTemplate.members[0]);
                        xUI.XPS.stage    = new XpsStage(nas.pmdb.pmTemplate.members[0].stages.getStage());
                        xUI.XPS.job      = new XpsStage(nas.pmdb.jobNames.getTemplate(nas.pmdb.pmTemplate.members[0].stages.getStage(),"init")[0]);
                        xUI.XPS.currentStatus   = new JobStatus("Startup");     
                        xUI.XPS.create_user=xUI.currentUser;
                        xUI.XPS.update_user=xUI.currentUser;

//console.log(xUI.XPS.title);
//syncIdentifierでカット尺は調整されているはずだが、念のためここで変数を取得して再度調整をおこなう
//data-scale を廃止した場合は、不用
                        var myCutTime = nas.FCT2Frm($('#backend_variables').attr('data-scale'));
                        if(!(isNaN(myCutTime)) && (myCutTime != xUI.XPS.time())){xUI.XPS.setDuration(myCutTime)}
                    }
//ここで無条件でproductionへ移行せずに、チェックが組み込まれているactivateEntryメソッドを使用する
                        xUI.setRetrace();
                        xUI.setUImode('browsing');//初期値設定
		                if (startupWait) xUI.sWitchPanel('Prog');//ウェイト表示消去
                        switch(xUI.XPS.currentStatus.content){
                            case "Active":
                        // チェックイン直後の処理の際はactivate処理が余分なのでケースわけが必要
                        // jobIDがフラグになるスタートアップ直後の自動チェックインの場合のみ処理をスキップしてモード変更
                                if(xUI.XPS.job.id==1){
                                    xUI.setUImode('production');
                                }else{
                                    serviceAgent.activateEntry();
                                }
                            break;
                            case "Hold":
                        // 常にactivate
                                serviceAgent.activateEntry();
                            break;
                            case "Fixed":
                        //ユーザが一致しているケースでもactivateとは限らないので、Fixedに関してはスキップ 
                            break;
                            case "Startup":
                                serviceAgent.checkinEntry();
                            case "Aborted":
                            default:
                        //NOP
                        }
                        sync('info_');
                        xUI.setUImode(xUI.setUImode());//現モードで再設定
//console.log('初期化終了');
//console.log(serviceAgent.currentRepository);                      
                },false,myEpisodeToken);//getSCi
//                {},false,myCutToken);//getSCi
        },false,myProductToken,myEpisodeToken);//getEpisodes
},false,myProductToken);//getProduct
                   });
               });
           }else{
//console.log('has no cut token');
//ドキュメント新規作成
/*    旧タイプの処理この状態には入らないはずなので順次削除      */
if(dbg) console.log('old style new document');
               serviceAgent.currentServer.getRepositories(function(){
                   serviceAgent.switchRepository(1,function(){
                       var myIdentifier = serviceAgent.currentRepository.getIdentifierByToken($("#backend_variables").attr("data-episode_token"));
                          myIdentifier = myIdentifier+'('+xUI.XPS.time()+')';
                          var tarceValue = Xps.compareIdentifier(Xps.getIdentifier(xUI.XPS),myIdentifier);
                         if( traceValue < 0){
console.log('syncIdentifier new Entry');
console.log(Xps.getIdentifier(xUI.XPS));
console.log(myIdentifier);
console.log(Xps.compareIdentifier(Xps.getIdentifier(xUI.XPS),myIdentifier));
    
                           xUI.XPS.syncIdentifier(myIdentifier,false);
        xUI.XPS.line     = new XpsLine(nas.pm.pmTemplate[0].line);
        xUI.XPS.stage    = new XpsStage(nas.pm.pmTemplate[0].stages[0]);
        xUI.XPS.job      = new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        xUI.XPS.currentStatus   = new JobStatus("Startup");     
        xUI.XPS.create_user=xUI.currentUser;
        xUI.XPS.update_user=xUI.currentUser;
                           //var msg='新規カットです。カット番号を入力してください';
                           //var newCutName=prompt(msg);
                           //if()
                            xUI.setRetrace();
                            xUI.setUImode('browsing');
                            serviceAgent.activateEntry();
//                            xUI.setUImode('production');
                            sync('info_');
                       }

