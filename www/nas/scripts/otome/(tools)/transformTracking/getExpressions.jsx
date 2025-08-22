//no launch
//getExpression.jsx
/*
指定されたレイヤ (AVLayer)のすべてのプロパティのエクスプレッションをダンプして返す関数
試験用
*/

//var myTargetLayer=(app.project.activeItem.selectedLayers.length)?app.project.activeItem.selectedLayers[0]:app.project.activeItem.layer(1);



function exprTr(propTree,exprBody){
//仮オブジェクトエクスプレッショントレーラ
    this.propTree=propTree;
    this.expressionBody=exprBody;
    this.toString=function(){return this.propTree+":¥r¥n"+this.expressionBody+"¥r¥n";};
}


/*
	与えられたプロパティの情報を返す関数
プロパティタイプを判別、プロパティトレーラなら中身を再帰的に検索して情報の配列を返す。
現在は単独のプロパティに対して要素数1の配列を返す
プロパティツリー構造は返さない
*/

//与えられたプロパティのタイプを判定して、エクスプレッションがあればプロパティツリーとエクスプレッションを返す関数
function getExpressions(myProp,treePrefix){
	var myResponse=new Array();
	if(! treePrefix){treePrefix="";};
    if((myProp.propertyType==PropertyType.PROPERTY)&&(myProp.expressionEnabled)){
//末端プロパティなのでエクスプレッションがあれば、要素数１の配列で返す
        return [new exprTr(treePrefix+"/[ "+myProp.name+" ]: "+myProp.matchName,"---(\r\n"+myProp.expression+"\r\n---)")];
    };
//PROPERTY以外(ナンバプロパティかネームプロパティだった場合)
//保持しているプロパティの数だけ再帰をかけてレスポンスを積む
    for(var prpId=1;prpId<=myProp.numProperties;prpId++){
//        var trName=myTargetLayer.property(prp).matchName.toString();//トレーラ名
        myResponse=myResponse.concat(getExpressions(myProp.property(prpId),treePrefix+"/"+myProp.name));
    }
return myResponse;
}

//レイヤはプロパティトレーラとしてとらえ、再帰的にプロパティのtoString()をコールする。(未実装 08・09・28)
//リザルトは配列、配列要素はオブジェクト　要素名がプロパティのmatchNameで、内容はエクスプレッション本文
	var myTargetComp=app.project.activeItem;
	var myResult=new Array();

	myResult.push("*"+myTargetComp.name);
for(var tgtLyId=1;tgtLyId<=myTargetComp.layers.length;tgtLyId++){
	myTargetLayer=myTargetComp.layer(tgtLyId);
	myResult.push("**"+myTargetLayer.name);
	for(var prpTgId=1;prpTgId<=myTargetLayer.numProperties;prpTgId++){
		myResult.push("\t"+myTargetLayer.property(prpTgId).name);
		myResult=myResult.concat(getExpressions(myTargetLayer.property(prpTgId),"***"+myTargetLayer.name));
	}
//どうもプロパティトレーラとしてアクセスすると基本ジオメトリにアクセスできないので
//別にジオメトリーは取得すること
	var geometries=["anchorPoint","position","scale","rotation","opacity"];

	    for (var idx=0;idx<geometries.length;idx++) {
	        myResult=myResult.concat(getExpressions(myTargetLayer[geometries[idx]],"***"+myTargetLayer.name));
    	}
}
myResult.join("\r\n");

