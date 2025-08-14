/**
 *	mapio.js
 *	MapオブジェクトはECMAScript6の標準案でグローバルオブジェクトなので  名前を変更します
 *	従来MapとしてアクセスしていたオブジェクトはxMapとなります  8.4 2016 kiyo
 *	一般名称はMAPのままです - ManegementAnimationProducts というくらいの気分で
 *	
 *xMap はカット袋に相当する制作管理基本単位で、同時にアセットトレーラーである
 *初期化の際にタイトル文字列と、管理対象記述を与えて初期化を行う
 *引数はなくとも良い
 */


/**
 *otome/psAxeのworkTitleDBはタイトル  略称  IM/OM のクラスタオブジェクトなのでやや情報量不足  かつ  IM/OMは  この場合不要情報  なので別のアプローチをとること
 *IM/OMは別テーブルで管理
 *
 *識別文字列  ユニークID
 *タイトル	フルネーム
 *短縮表記	ショートネーム
 *ファイル名挿入用コード（4文字まで）コード
 *IM	PEG情報を含める
 *OM	PEG情報を含める（pegを使用するケースはほぼ無いが、同じオブジェクトを使用するため）
 *  //	初期化手順として
 *new xMap(作品識別子,カット又は作業識別子);？
 *
 *Mapデータ内部では、テキストとして保存できなくなるので作品／カットデータ等は全て文字列として処理する
 *オブジェクト処理はアプリケーション側で担当する
 *タイトル等は識別子を使用して連結する  不明のデータは文字列のまま保存
 *カット識別は  シーンをまたがった兼用を行う可能性があるので  それを阻害しないように  S-Cの組み合わせで識別子を作成する
 *列挙可能にする
 *
 */
function xMap(titleString,targetDecription){
	this.parent;//親ｘMapへのアクセス ? ステージ内に限る 複製継承をしないほうが良い…？
/**
 *	========== 以下のプロパティはグローバルの参照でなく順次DB接続からの参照に置きかえ
 *	カット番号情報直接でなくオブジェクト化する  ｘMap.prodUnit=new ProductionManagementUnit();
 *	作品・兼用を含むカット番号情報等の集合データ  以下のプロパティはそのオブジェクトへの参照を入れる
 *	MAP標準プロパティ設定
 *	作品情報 workTitel-DBの値  nas.workTitles[myTitle]=
 *	this.workTitle = new nas.workTitle();//マスタライブラリ側で作成  カレントの作品はそちらで処理
 */
	this.opus	=	'';//myOpus;//SCi
	this.title	=	'';//myTitle;//
	this.subtitle	=	'';//mySubTitle;
	this.framerate	=	(!nas)? nas.newFramerate("24FPS"):nas.newFramerate(nas.FRATE);//作品情報として追加

	this.rate	=	(!nas)? "24FPS":nas.RATE;//作品情報として追加

	this.standerdFrame = new nas.AnimationField();
	this.standerdPeg = this.standerdFrame.peg;
	this.baseResolution = new nas.UnitResolution(nas.RESOLUTION,"dpc");

// 兼用カットトレーラー
	this.scene	= "";//シーン所属を記録・空白でも可  この情報は死に体だが、互換のため残置
	this.cut	= "";//S-C形式代表カットを指定する  外部アセットの場合予約語"_EXTRA_"を使用

	this.inherit	= "";//S-C形式で兼用カットを列挙  代表カットは記述してもしなくても良い  重複は別に整理する  兼用がなければ省略可

	this.inheritParent	= "";//参照（継承）する外部の単独ｘMapをファイルパスで記述  (継承の詳細は未定  2016.04)

	this.extraAsset	;//cutが"_EXTRA_"である場合に記述・最終目的のアセットを保持する


//------- 作業内容登録 --------//
// 内部変数scene-cutを整理して格納する配列
		this.scenes = new Array();//extraアセットの場合配列要素数は0のままである  そういうケースが多い
// 代表名称
	this.name	="" ;//再初期化で名前を生成する  [myScene,myCut].join("-");//-で接合して名前にする（カットの場合）
		var Now =new Date();

//以下の情報は  xMap.manager = new ManegementNode(); への参照に更新予定
	this.create_time	=	Now.toNASString();//オブジェクトを初期化したタイミング
	this.create_user	=	myName;//
	this.update_time	=	"";//
	this.update_user	=	myName;//

//デフォルトの値はトレーラー内のグループの標準値を参照するので、ここでは設定しない  8-4 2016


//========= 進捗管理情報 分離可能に
		this.currentJob;//	=	"";//job  フォーカスのあるオブジェクトへの参照
//	ジョブがリンクしているのでステージとラインは特定可能  オブジェクト化を検討　現在は配列
		this.lines	=[];
		this.stages	=[];
		this.jobs	=[];
//
		this.lines.add	= xAdd;
		this.stages.add	= xAdd;
		this.jobs.add	= xAdd;
		
//現在のMapが制御下に置くライン情報
//	this.currentLine=0;//##LINE_ID から抽出

	this.lineIssues=	new nas.Pm.LineIssues(new nas.Pm.Issue("trunc",0),this);

//ライン発行記録  ライン情報の転記（自動更新）素材の変更権限は各ラインごとの記録
/*
	この部分は独立オブジェクトにするのが良さそう
	nas.PmlineIssuesのメンバーは  nas.Pm.Issue 
	Issue 一件毎に  発行ID:名称:発行日時/ユーザ:終了（合流）日時/ユーザ ラインステータス  で構成される
	記録上はテキストに展開されてファイルに埋め込まれる
	
*/
//========= データ保持構造をオブジェクト化したほうが良さそう？

		this.currentIndex = 0;//フォーカスのあるエレメントID

//エレメントには  Job/Groupの参照があり  GroupからStageへの参照がある
//ステージ内の同名（同グループ）エレメントであっても、Jobが異なる場合は双方を維持する
//通常のリクエストには最後発のエレメントを戻す
//
		this.elementGroups   = [];
		this.elementStore    = [];
//memo
		this.memo="";
}
/* コレクション汎用メソッド
 * 配列をコレクションとして使用する場合の標準メソッド
 */
/*
    暫定メソッド　配列をトレーラの代用として利用する際にこのファンクションを利用
	全要素を検査して同管理パスの要素があればそれをもどして終了
	カブりがない場合は、コレクションに新規メンバーとして追加
*/
function xAdd(mEmber){
	for (var ix=0;ix<this.length;ix++){	if(mEmber.getPath()==this[ix].getPath()) return this[ix]	};
	this.push(mEmber);
	 if(mEmber instanceof nas.Pm.ProductionJob) this.currentJob=mEmber;
	return mEmber; 
}
/*	getPath  メソッド
 *	当該要素の管理パスを戻す
 *	管理パスは以下の型式で管理ツリーのノードを"."でつないだ文字列
 *	上方のパスは省略可能  その場合はトップノード(右端=文字列終端)の"."は付かない
 *	job.stage.line.sci.opus.title.
 *	job.stage.line.sci.opus
 *	job.stage.line.sci
 *	job.stage.line
 *	job.stage
 *	job

ラインID	二次元配列化整数
    0:(本線)
    0-1:(作画-B)
    1:(背景)
    2:(3D-CGI)
    2-1:(モデリング)
    2-2:(リギング)
    2-2-1:(フェイスリギング)
    2-3:(アニメーション)
    2-4:(マテリアル)
    
ステージID	全ライン通しの整数ID
    0:SCi.0:(本線)
ジョブID	ステージ内通しの整数ID
各IDの規則変更に留意

getPathメソッドは、Pm.ProductionLine,Pm.ProductionStage,Pm.ProductonJob,xMapGroup,xMapElementに実装 ?

XpsXXXとProductionXXX の統合　
 */



/*	xRemove
 *	メンバーを削除
 */


//xMap.のメソッドを定義
/**
 *  エレメントストアからidでエレメントを抽出する
 * @params {Integer} idx
 *  捜索するエレメントid 整数
 * @returns {Object nas.xMapElement or null}
 *  条件に合致するオブジェクトを戻す
 *  ノーヒットの場合は null
 */
xMap.prototype.getElementById =function(idx){
 for (var id=0;id<this.elementStore.length;id++){
    if(this.elementStore[id].id==idx) return this.elementStore[id];
 }
 return false;
};
/**
 *  エレメントストアから名称でエレメントを検索する
 * @params {String} myName
 *  捜索するエレメント名,グループ名,グループ名-エレメント名　のいずれか
 * @returns {Object nas.xMapElement or null}
 *  最初に条件にヒットしたオブジェクトを戻す
 *  ノーヒットの場合は null
 */
xMap.prototype.getElementByName =function(myName){
    myName=Xps.normalizeCell(myName);
 for (var id=0;id<this.elementStore.length;id++){

    var groupName = (this.elementStore[id] instanceof nas.xMapGroup)?
    this.elementStore[id].name : this.elementStore[id].parent.name;
    groupName = Xps.normalizeCell(groupName)
    if(this.elementStore[id] instanceof nas.xMapGroup){
        checkString = groupName;
    }else{
        checkString = Xps.normalizeCell(this.elementStore[id].name);
        if(checkString.indexOf(groupName) != 0)
        checkString = [groupName,checkString].join('-');
    }

 	//var checkString=Xps.normalize(this.elementStore[id].name);
 	//(this.elementStore[id].parent)? this.elementStore[id].parent.name:"";
// 	([this.elementStore[id].name,parentName].join('-')).
// 	if((parentName + this.elementStore[id].name)==myName) return this.elementStore[id];
 	if(checkString == myName) return this.elementStore[id];
 }
 return null;
//暫定的に  グループ名+セル名の完全一致で動作中
//これは検索規則に合わせて調整要

/**
エントリ毎にlinkJobが登録されている
Jobが異なるとグループを新たに登録可能

xMapElementは、所属するJobへの参照(linkJob)
xMapGroupは、初登録時のJobへの参照(linkJob)で管理されるがステージ内でunique


group   "B"
name    "B-1"
        "001"
        "B001"
        "1"     //これらは同一セルとして許される表記

        "B-2a"
        "B_3_カブセ"
*/
};

/**
	Class xMapElement
	エレメントクラス 各合成素材（情報）の共通部分
	エレメントの所属するJobが未指定の場合は、登録時のカレントJobとなる
*/
nas.xMapElement =function xMapElement(myName,myParentGroup,myLinkJob,contentSource){
	if(typeof myName == "undefined" )			return false;
	if(typeof myParentGroup == "undefined" ) 	return false;
	if(typeof myLinkJob == "undefined" ) 		return false;
//以上省略不可
	if(typeof contentSource == "undefined" )	contentSource = "";
//省略可

//	this.contentText="";//xMapコンテンツトレーラ
	this.id;//セッション内ユニークインデックス(自動設定)
	this.parent	= myParentGroup;//xMapGroup/Object
	this.link	= myLinkJob;//linkPmJob/Object
	this.type	= this.parent.type;//親グループのtype以外は受け付けないので参照を記録
	this.name	= myName;// nas.AnimationReplacementの場合に限り 再初期化(this.content.parseContent())時に CellDescription/完全 に置換される

	this.content = Object.create(this.parent.content);//継承  親グループが正常に初期化されているのが条件 nas.AnimationXXX シリーズ
//	this.content.extended=false;//出力時に全プロパティを出力する必要があるか否かのフラグ
	if((this.type=="cell")||(this.type=="replacement")) this.content.overlay=null;
//	if(this.content.type=="replacement"){this.content.overlay=null;}
	this.comment="";

	if(contentSource) this.content.parseContent(contentSource);

//if(this.type == 'cell'){
//console.log(this);
//this.toString();
//}
};
nas.xMapElement.prototype.toString=function(){
console.log([this.parent.name,this.name].join('\t'))
	var myResult='';
	if(this.content.extended){
		myResult+=[this.parent.name,this.name].join('\t');
		myResult+='\n';
		myResult+=this.content.toString('extend');
	}else{
		myResult+=this.content.toString('basic');
	}
    return myResult;
};

nas.xMapElement.prototype.setData=function(dataStream){
//	this.text = dataStream;
	this.content.parseContent(dataStream);
	
}


/*
 *	Class xMapGroup
 *	合成素材をグルーピングするクラス  グループラベル等グループのプロパティを保持する
 *	グループに属するelementのデフォルト値を持つ
 *	グループ登録時に親のプロパティの複製をとってエレメントに設定する
 contentプロパティには、グループのデフォルト値となる値を持ったインスタンスを置く
 インスタンス内部にはcontentText(=xMapの記述)がそのまま格納される
 groupのタイプはgroup登録時にユーザによって指定される （手書きのｘMAPでは第二フィールドに記載）
 タイプ文字列は同タイプの値に対して複数の表記が許容されるので要注意
 パーサ上は、タイプ指定のないgroupは、自動的にcontentType-cellとなる


	option		typeString   defaulut value
____________________________________________
    dialog
    sound       :sound       :nas.AnimatiopnSound("blank")  
    cell
    replacement 
    timing      :replacement :nas.AnimationReplacement("blank")
    still       :picture グループ代表スチル画像をオブジェクトで＝何も記述しなくとも値ができる
    appearance　:appearance  :nas.AnimationAppearance("off")
    camara
    camarawork  :camerawork  :nas.AnimationCmaerawork(null)  標準カメラワークシンボル
    geometry    :geometry    :nas.AnimationGeometry(standerd frame animationField)  標準カメラジオメトリ
    sfx
    composite
    effect      :composite   :nas.AnimationComposite('normal') normal composit 100%   ノーマルコンポジット100%
	xps			:xps         :nas.XpsAgent(null)	タイムシートデータへのパス
	text		:text        :nas.StoryboardDescription("") ヌルストリング
	system		:system      :nas.AnimationReplacement("") ヌルストリング

	グループに対する標準でない（pmdbの記載と異なる）デフォルト値が指定された場合は、
	ｘMap内に追加プロパティとして記載が行われる。
	contentプロパティのサブプロパティadditionalにフラグを置く
	グループのコメントはグループのものであり　値につけないこと
 *
 * groupのタイプストリングは、ステージごとに対照マップが必要か？
 * アセット単位でなく
 */
nas.xMapGroup =function xMapGroup(myName,myTypeString,myLinkJob,contentText){
	if(typeof myName == "undefined" ) return false;//
	if(typeof myLinkJob == "undefined" ) return false;//
//以上省略不可
	if(typeof myTypeString == "undefined" ) myTypeString = "";
	if(typeof contentText == "undefined" ) contentText = "";
//省略可

//	this.text=contentText;
	this.id;//セッション内ユニークインデックス
	this.parent = this;// Object xMapGroup itself
	this.link   = myLinkJob;//linked PmJob/Object
	this.type   = String(myTypeString).toLowerCase();//system,sound,replacement,camerawork,composite,geometry,effect,text/String
	this.name   = myName;//
	this.content=xMap.getDefaultContent(this,contentText);//タイプストリング毎の初期化を行うことが必要
	this.content.additional = false;
	this.comment="";
	this.elements = [];//要素トレーラー配列

	this.content.parseContent(contentText);
	if(this.content.comment){
		this.comment=String(this.content.comment);
		this.content.comment=undefined;
	}
};
nas.xMapGroup.prototype.toString=function(jobFilter){
	var myContentBody = [];
	myContentBody.push(this.name);
	myContentBody.push(this.type);

	if(this.content.additional){
		var contentResult=this.content.toString('basic').split('\t').slice(2);
		if(this.comment) contentResult.push(this.comment);
		var myResult='['+([this.name,this.type]).concat( contentResult ).join('\t')+']\n';
	}else{
		var myResult='['+([this.name,this.type]).join('\t')+']\n';
	}
/* これらの書式は許されるしパースも行うが、今季の出力ではサポートしない
	[this.name,this.type,this.content.toString()];
	[this.name,this.type,this.content.toString(),this.comment];
	var myResult="["+this.name+"\t"+this.type +"\t"+this.content.toString()+"\t"+this.comment+"]\n";
*/
//	var myResult = [this.name,this.type,this.content.toString(),this.comment];
//	var myResult = [this.name,this.type,this.content.toString()];
	if(this.content.extended){
//グループの持つ.contentに拡張パラメータフラグが立っている場合に限りグループのパラメータを追加
		var addResult=this.content.toString('extend');
		if(addResult) myResult += addResult+'\n';
	}
	myResult += '#------------------------------------------------------------\n';
//ここから各エレメントの出力
	for (var eIdx=0;eIdx<this.elements.length;eIdx++){
		if((typeof jobFilter == "undefined")||(jobFilter===this.elements[eIdx].link)) myResult += this.elements[eIdx].toString(true) +'\n';
	}
	myResult += '#------------------------------------------------------------\n';

	return myResult;
};

/** タイプ別のデフォルトコンテンツオブジェクトを戻す
正確にはタイプのみでなくgroupの所属するステージにも関連するのでそれらを引数として受け取る

	type		defaulut value	
    dialog
    sound       :blank  
    cell
    replacement :blank
    still       :picture グループ代表スチル画像をオブジェクトで＝何も記述しなくとも値ができる
    camarawork  :standerd frame animationField  標準カメラジオメトリ
    effect      :normal composit 100%   ノーマルコンポジット100%
	xps			:null	タイムシートデータへのパス
	text		:"" ヌルストリング
*/
xMap.getDefaultContent=function(targetGroup,contentString){
	var result='';
	
	switch (targetGroup.type){
	case	'dialog':
	case	'sound':
		result=new nas.AnimationDialog(targetGroup,"");
	break;
	case	'cell':
	case	'replacement':
	case	'still':
		result=new nas.AnimationReplacement(targetGroup,contentString);
	break;
	case	'camera':
	case	'camerawork':
		result=new nas.AnimationCamerawork(targetGroup,"");
	break;
	case	'geometry':
		result=new nas.AnimationGeometry(targetGroup,contentString);
	break;
	case	'composite':
	case	'effect':
		result=new nas.AnimationComposite(targetGroup,contentString);
	break;
	case	'xps':
		result=new nas.XpsAgent(targetGroup,contentString);
	break;
	case	'text':
	default:
		result= new nas.StoryboardDescription(targetGroup,contentString);
	}
	return result;
}


/*
 *エレメント及びグループの編集用メソッド
 *	基本的には、xUIで実装するが、対応するデータ設計のみは行っておく
 *EG.remove()	,オブジェクトの削除	グループを削除すると配下のエレメントを全削除
 *削除は、配列要素のdeleteではなく、removed属性のセットで行う  クリアするまではやり直し可能になる（逆処理をスタックに詰める）
 *EG.dupuricate(to),オブジェクトの複製	複製先アドレスが必用  (element.group.job.stage.line.)  指定がなければ同ロケーションで自動リネームして作成
 *EG.rename(newName)	,オブジェクトのリネーム  新しい名前はアドレス指定が可能	(element.group.job.stage.line.)  指定がなければ自分自身の名前を使用（==NOP）
 *E.moveTo(G)	,エレメントを他のグループに移動（ラベルが変わる）上の機能のエイリアス
 *
 *G.sort()	,（全体エレメントでなく）グループ内のエレメントをネームソート
 *G.add(E)	,グループにエレメントを追加	引数なければ増番で新規作成
 *EG.setValue	,値オブジェクトのセット  実際の値の処理は値オブジェクトごとの別処理
 *EG.getValue	,値オブジェクトの取得
 */

/**
 *	@summary
 * xMapオブジェクト総合エレメントコレクションにエレメントを登録する
 *
 * @params {String} myName
 * @params {String or Object nas.xMapGroup} myOption
 * @params {Object nas.Pm.ProductionJob} myLink
 * @returns {Object nas.xMapGroup or nas.xMapElement}
 *
 *	@description
 *<pre>
 *	エレメント作成メソッド
 *		継承セットアップ・コレクション登録処理を同時に設定
 *  グループ作成
 *	new_xMapElement(name,type,Object nas.Pm.ProductionJob);//名前,タイプ文字列,リンクするジョブを引数にする
 * 戻り値：グループオブジェクト
 *	インデックスナンバを生成してxMapのコレクションにメンバーグループを登録
 *
 * エレメント作成
 *	new_MapElement(name,Object xMapGroup,Object Job);//名前,継承する親グループ,リンクするジョブを引数にする
 * 戻り値：エレメントオブジェクト
 *	インデックスナンバを生成してxMapのコレクションにメンバーエレメントを登録
 *　更に引数のxMapElementGroupにメンバーエレメントを登録する
 *
 *　@example
 * var myMap=new xMap();
 * 	var myLine	=	myMap.new_ProductionLine("trunk");//ライン初期化
 * 	var myStage	=	myMap.new_ProductionStage("layout",myLine)//ステージを初期化
 * 	var myJob	=	myMap.new_Job("",myStage)//第一ジョブを初期化
 * 	
 *  var groupA	=	myMap.new_xMapElement("A"	,"cell"	,myJob);//グループ作成-連結するジョブが必要
 * 
 *  var A1		=	myMap.new_xMapElement("A-1"	,groupA	,myJob);//B.name;
 *  myMap.getElementByName("A");
 *</pre>
 */
 /* TEST :
 var myMap=new xMap();
 	var myLine	=	myMap.new_ProductionLine("trunk");//ライン初期化
 	var myStage	=	myMap.new_ProductionStage("layout",myLine)//ステージを初期化
 	var myJob	=	myMap.new_Job("",myStage)//第一ジョブを初期化
 	
 var groupA	=	myMap.new_xMapElement("A"	,"cell"	,myJob);//グループ作成-連結するジョブが必要
 
 var A1		=	myMap.new_xMapElement("A-1"	,groupA	,myJob);//B.name;
 myMap.getElementByName("A");
 */
xMap.prototype.new_xMapElement = function (myName,myOption,myLink,contentSource){
	if(! (myLink instanceof nas.Pm.ProductionJob)) return false;
	if(myOption instanceof nas.xMapGroup){
//親グループが指定されたらエレメント作成
//console.log(arguments);
		var newElement=new nas.xMapElement(myName,myOption,myLink,contentSource);
//console.log([myName,myOption,myLink,contentSource])
//console.log(newElement);
//console.log(myOption);
		if(myOption.elements) myOption.elements.push(newElement);
 	}else{
//タイプ文字列指定の場合、エレメントグループ作成・デフォルトパラメータを設定する
/*
	default params
	xps     :xpsAgent       :Xpsの参照先パスを保持して  カット番号、時間等を返すエージェント
	text    :StoryboardDescription  :
    system  :
        
    エレメントの作成には必ずこのルーチンを通してエレメントストアの管理を行うこと
    エレメントの削除は個々のエレメントのremoveメソッドで行う
    ガベージコレクションはストアオブジェクトのメソッドにする
*/
//		if(!(String(myOption).match( /(timing|replacement|cell|camera(work)?|geometry|sfx|composite|effect|sound|system|text|xps|still)/i ))) myOption = "cell";
		var newElement=new nas.xMapGroup(myName,myOption,myLink);
		this.elementGroups.push(newElement);
	
		switch(newElement.type){
		case "xps":
			newElement.content=new nas.XpsAgent(newElement,contentSource);
		break;
		case "text":
			newElement.content=new nas.StoryboardDescription(newElement,contentSource);
		break;
		case "system":
	        newElement.content=new nas.AnimationReplacement(newElement,contentSource);
/*
	newElement.content.source=new nas.File();//ファイル  空
	newElement.content.resolution=this.baseResolution;//作品DBの解像度
	newElement.content.size=this.standerdFrame;//以下デフォルト値
	newElement.content.position=new nas.Position();
	newElement.content.rotation=new nas.Rotation();
	newElement.content.offset=new nas.Offset();
	newElement.content.offsetRotation=new nas.OffsetRotation();
	newElement.content.pegOffset=new nas.Offset();
	newElement.content.pegRotation=new nas.OffsetRotation();
	newElement.content.comments=new String("");
*/
		break;
		case "sound":
		case "dialog":
    			newElement.content=new nas.AnimationDialog(newElement,contentSource);
/*			if( contentSource instanceof nas.AnimationDialog ){
			    newElement.content=contentSource;
			}else{
    			newElement.content=new nas.AnimationDialog(newElement,contentSource);			    
			}*/
		break;
		case "composite":
		case "effect":
		case "sfx":
//    		newElement.content=new nas.AnimationComposite(newElement,contentSource);
			if( contentSource instanceof nas.AnimationComposite ){
    			newElement.content=contentSource;
    		}else{
    			newElement.content=new nas.AnimationComposite(newElement,contentSource);
			}
		break;
		case "camera":
		case "camerawork":
    			newElement.content=new nas.AnimationCamerawork(newElement,contentSource);
/*			if( contentSource instanceof nas.AnimationCamerawork ){
    			newElement.content=contentSource;
    		}else{
    			newElement.content=new nas.AnimationCamerawork(newElement,contentSource);
    		}*/
		break;
		case "geometry":
			if( contentSource instanceof nas.AnimationGeometry ){
    			newElement.content=contentSource;
    		}else{
    			newElement.content=new nas.AnimationGeometry(newElement,contentSource);
    		}
		break;
		case "cell":
		case "replacement":
		case "still":
		default:
			if( contentSource instanceof nas.AnimationReplacement ){
    			newElement.content=contentSource;
    		}else{
    			newElement.content=new nas.AnimationReplacement(newElement,contentSource);
    		}
		}	
 	};
	this.elementStore.push(newElement);//エレメントとグループを総合ストアに格納
	newElement.id=this.currentIndex;
	this.currentIndex++;//削除してもSession内でidが不変
	return newElement;
}

/*  
 *nas.xManagementUnit
 *	xMap,Xpsを包含するｘManagementUnitの継承手順
 *外部メソッドで手続きする
 *var myMAP=new_xMAP（オブション）
 *ステージ
 *ジョブ
 *親アセット
 *依存アセット
 *マネジメントノードは、xMap,Xps外に置く？
 *初期化の手順ーー
 *
 *  マネジメントノードは全てJob
 *  JobがプロパティとしてStageとLineの値を持つ
 *Stage と  Lineは同じコンストラクタの別オブジェクトにする？
 *
 *
 *
 *nas.xMap.ManagementNode("(本線)","line","/");//本線の初期化
 *nas.xMap.ManagementNode("レイアウト","stage",Object);//レイアウトステージの初期化
 *nas.xMap.ManagementNode("美術","line","/");//美術ラインの初期化
 *nas.xMap.ManagementNode("美術","stage",Object);//原図整理の初期化
 *nas.xMap.ManagementNode("原画","stage",Object);// 原画ステージの初期化
 *nas.xMap.ManagementNode("色指定","stage",Object);//美術ラインの初期化
 *
 */
//ラインオブジェクト登録
/*
 *	ライン名は登録されたキーワード
 *	cell,backgroundArt,cast3D,characterDesign,propDesign,BGDesign,colorDesign,colorCoordiante,composite,ALL
 *	nas.Pm.lines[キーワード]  から複製をとってプロパティを追加する
 */
xMap.prototype.new_ProductionLine=function(myName){
	var newLine=nas.pmdb.lines.entry(myName);//名前からラインのテンプレートを取得する。失敗のケースあり
	if(!(newLine instanceof nas.Pm.ProductionLine)){
		newLine=Object.create(nas.pmdb.lines.entry('null'));//未定義テンプレートを取得
		newLine.name=myName;//名前のみ設定
	}else{
		newLine=Object.create(newLine);//名前からラインのテンプレートを取得する
	}
		newLine.stages=new Array();//ステージコレクション要るか？
		newLine.id=[new Number(this.lines.length)];//親コレクション内のID(ラインコレクション登録前=Origin:0)　配列
		newLine.parent=this;//親xMapへの参照
		if(this.lines.add(newLine)){
			return newLine;
		}else{
			return false;//追加失敗
		}
}
//新規ステージオブジェクト登録
/*
	ステージ名は登録されたキーワード
	ライン種別によって登録可能なステージが異なるのでフィルタリングが必要
	ステージオブジェクトに親をもたせたほうが良いかもしれない
*/
xMap.prototype.new_ProductionStage=function(myName,myLine){
	var newStage=nas.pmdb.stages.entry(myName);
	if(!(newStage instanceof nas.Pm.ProductionStage )){
//取得に失敗した際はundefinedステージから複製した一時ステージを使用する
//		newStage=Object.create(nas.pmdb.stages.entry('undefined'));
//		newStage.name=myName;
		newStage = nas.Pm.newStage(myName,myLine);
	}else{
        newStage=Object.create(newStage);
	}
		newStage.jobs=new Array();
		newStage.line=myLine;//parentLineObject
		newStage.id=new Number(myLine.stages.length);//親コレクション内のID(Origin:0)
		if(this.stages.add(newStage)){
			;//Map内のステージコレクションへ追加成功したら以下の処理
			myLine.stages.push(newStage);//親ラインのコレクションに登録
			return newStage;
		}else{
			return false;//コレクションの追加に失敗
		}
}
//新規ジョブオブジェクト登録
/*
ジョブは新規に作成
*/
xMap.prototype.new_Job=function(myName,myStage){
//console.log([myName,myStage]);
	var Now=new Date();
	var newJob = new nas.Pm.ProductionJob(myName,myStage);

//	newJob.stage=myStage;//ステージ参照 オブジェクト
//	newJob.line=myStage.line;//ライン参照  オブジェクト//これはたどれるので不要？
	newJob.currentStatus=0;//
	newJob.createUser=this.currentUser;//
	newJob.createDate=Now.toNASString();//
	newJob.updateUser=this.currentUser;//
	newJob.updateDate=Now.toNASString();//
	if(this.jobs.add(newJob)){
		newJob.type=new Number(myStage.jobs.length);//	 /0:init/1:primary/2~:check/
		myStage.jobs.push(newJob);
		newJob.id =new Number(this.jobs.length);//	インデックスは内部アクセス用のID
		this.currentJob=newJob;//カレントを記録
//	this.trailer=new xMapArray();//	コレクションオブジェクト（配列）
//ステージ内IDで全て処理が可能か
		return newJob;
	}else{
		return false;
	}
}
/*
 ManagementNodeオブジェクトは、Mapデータの内部で進捗情報を受け持つ
ｘMap.manager=new nas.xMap.ManagementNode()
	マネジメントノードの役割は
ライン・ステージ・ジョブの情報を持つ
各オブジェクトは「ジョブ」に対応する（type は不要）  管理ノードは  ステージ／ラインプロパティを持ったJOBのみ
ステージは  アセットにリレーション

ステージスターター（アセット）ステージを開始するアセットがある  特定ステージの出力
ステージアウトプット  ステージはアウトプットで終了する
ステージのアウトプットは、ジョブのアウトプットである
最終ジョブのアウトプットが常にステージのアウトプットとなる
ジョブのアウトプットがステージアウトプットの条件を満たすか否かの判定は、判定権限者が行う。
実質上  次の工程の開始を持って判定が行なわれたものとみなす。

ラインに関して
（本線）以外のラインは、命名時に最終想定目的アセットの名前を持ってライン名にすることを推奨
例えば  3DAnimationアセットを期待されるラインは「3DAnimation」
背景美術上がりを期待されるラインは「背景美術」となる
ラインの名前はプリセットの他はライン立ち上げ時に新しく定義が行なわれ、DBの更新がなされるものとする
（本線）は「CELL」ラインでもある
  ラインの初期化に当たってライブラリ内部では、エイリアスでの初期化を許す
その仕組を作りこむ必要あり

 */
 /*
 	アセットオブジェクト
 	管理上のアセット
 	アセットは複数のステージを呼び出すことが出来る
 	実際の起動はユーザが行い、起動される度にPMUのラインが増える
	実運用上は外部DBから供給されるデータで初期化する
	アセットのアクセスは以下のように
	nas.Pm.assets["キーワード"]  又は	nas.Pm.assets("アセット名")
	
	アセットが呼び出し可能なステージの一覧は
	配列  asset.callStage に識別文字列で格納（オブジェクトでない）
	アセットのプロパティは
	name	表記名
	shortName	短縮名
	code	コード
	description  概要
	hasXPS/bool	タイムシートを持つか否か
	endNode/bool	ラインを終了することが出来るか否かのフラグ
	callStage/array	呼び出し可能ステージ種別

	コンストラクタ他のメンテナンス系コードは保留

 */
nas.new_ManagementAsset=function(assetTypeName,assetProps,myStages){
	var newAsset=Object.create(nas.Pm.assets[assetTypeName]);//=assetProps;
	newAsset.callStage=myStages;
	//ステージオブジェクトコレクション選択可能なステージキーワードを列記したものを与える
	return nas.Pm.assets[assetTypeName];
}
//アセットの初期値  nas.PM.assetsに格納
/*
nas.Pm.lines["キーワード"]  でアクセス

nas.Pm.PmU.prototype.addNewManagementLine=function(lineKey,myStage){
	newLine=Object.create(nas.Pm.lines[lineKey]);
	newLine.stages=[myStage];//ステージコレクション 開始ステージで初期化
	this.lines.push(newLine);//コレクションに登録
	return newLine;
}
*/
//ステージの初期値
/*
nas.Pm.stages["キーワード"]  でアクセス
*/
nas.ManagementStage=function(stageName,iniAsset,startJob){
	this.name=stageName;
	this.jobs=[startJob];//stratJobはもれなくinit
	this.outputAsset=nas.PM.assets[stageName];//アセットを出力１つだけ出力する  ステージ自体を外部のDBから供給する
};
nas.ManagementStage.prototype.toString=function(){
	var myResilt="";
	myResult+="##["+this.name+"]\n";
	for (var jID=0;jID<this.jobs.length;jID++){myResult+=this.jobs[jID].toString();}
	myResult+="##["+this.name+"]/\n";
	return myResult;
};

/*	test
myMap=new xMap();
var myLine=myMap.new_ProductionLine("trunk");//ライン初期化
var myStage=myMap.new_ProductionStage("layout",myLine)//ステージを初期化
var myJob=myMap.new_Job("",myStage)//第一ジョブを入れる
A=myMap.new_xMapElement("A","cell",myMap.currentJob.stage);//グループ作成
B=myMap.new_xMapElement("A-1",A,myJob);//B.name;
myMap.getElementByName("A");
*/

/*
xMap.parent.parent.parent 等とたどって目的のデータまで遡ることができる。
データの外側からステージをサブステージを確認しながらたどれば問題ない?

-キャリアをペアレントだけでなく外部にも持つ
-識別情報を各オブジェクトに与えてどちらからもアクセス可能にする
-継承にはこだわらない あまり有効に働いていない（データ量が画期的には減らない  弊害が多い）

外側にジョブツリーを持つのが良い
基点オブジェクトからの相対アドレス解決する  無理？  二分木ツリーじゃ無かった
  ＞NO  ステージツリーとジョブコレクションが良い

アドレス  ライン/ステージ/ジョブ  この形式はOK
全検索でこのアドレスを探すほうが手っ取りはやそう

ペアレントの直線継承が意味を持つのはステージ内だけ
ラインが別れた際の継承はあまり意味を持たないので、更新制限の機能も考えあわせて別の方式をとったほうが良さそう

ラインが切れたら再初期化  ＞参照可能
ステージが切れたら再初期化

作品管理情報
	カット情報をオブジェクト化
	進捗情報をオブジェクト化
	ライン
	ステージ
	ジョブ
ステージ(ライン上の特定点)を指定する書式が必要

  (lineName)stageName:jobID
  
  例えば
  (本線),彩色,0:打合せ	実質上打合せにはアセットデータが無い
  (背景美術),原図整理,1:素上がり
等で、この書式でデータを引き出せるように設定する

XPS.setStage("(本線),彩色,3:作監修正")  的な設定
データを持たないポイントがあるのでその際のデータ状態に注意

ステージの開始時にデータがリセットされる
イニシャライズジョブ時点では常にカラ（参照だけがある）になる
これはが基本状態

タイムシートはジョブごとに変更を記録＝ジョブ毎にエレメント数が変更される
エレメントグループは  ステージごとに構成が一新される＝ステージが変われば同名のグループがある

エレメントグループのプロパティとしてステージを連結

一度フィックスしたエレメントには、改名及び内容の変更は無い  これは許されない
エレメントは所属するジョブをプロパティに持つ

ラインは複数のエレメントグループを持つ
ライン開始に先行するグループはラインに準ずるが表示を変更する

*/
/*
 *	xMap.branch(newLine)
 *	現在のラインからブランチを行う
 */
/*
 *	xMap.branch(newLine)
 *
 */

/*
 *	読み込みメソッド
 *	戻り値として、parsexMap の戻り値を返す
*/
xMap.prototype.readIN=function(datastream){	return this.parsexMap(datastream) };
/*	parsexMap(datastream)
 *	xMap  perser
 *	パーサの時点では、引数のストリームを全てパースする
 *  ここにブランチやマージの機能を求めない（別のメソッドとする）
 */
xMap.prototype.parsexMap=function(datastream){
	if(! datastream.match){return false};
//ラインで分割して配列に取り込み
	var SrcData=new Array();
	if(datastream.match(/\r/)){datastream=datastream.replace(/\r\n?/g,("\n"))};
	SrcData=datastream.split("\n");
//データストリーム判別プロパティ
	SrcData.startLine	=0;//データ開始行
	SrcData.endLine	=0;//データ終了行（[END]の前行）
//ソースデータのプロパティ
/*
	これらをオブジェクトコレクションに展開する
*/
	SrcData.lines	=new Array();//
	SrcData.stages	=new Array();//
	SrcData.jobs	=new Array();//
	SrcData.groups	=new Array();//
	SrcData.elemnts	=new Array();//
//アクティブなグループを保持する一時プロパティ
	SrcData.activeGroup=new Array();//	undefinedで初期化？
	SrcData.activeGroup.name;//	undefinedで初期化？
//第二パス中に再初期化とソースのスタックを繰り返すバッファになるのでその構造を持たせる  またはソーススタックとして配列でも良い？

	
	
/*
	第一パス
	データ冒頭の空白行を無視して、データ開始行を取得
	識別行の確認
	^nasMAP-FILE\ 1\.9x$
	冒頭ラインが識別コードまたは空行でなかった場合は、さようなら御免ね
		**IEのデータの検証もここで
*/
	for (l=0;l<SrcData.length;l++)
	{
		if(SrcData[l].match(/^\s*$/))
		{
			continue;
		}else{

if(SrcData[l].match(/^nasMAP-FILE\ 1\.9x$/))
{
	SrcData.startLine =l;//データ開始行
	break;
}else{
//	alert("no map data");
	return false;
//	この部分要整備
}
		}
	};
//第一パス終了

//第二パスのデータ設定する検証用のxMAPを作る
//	var newMap = new xMap();
	var newMap = this;
//データ開始行が無かった場合その時点で終了
	if(SrcData.startLine==0 && SrcData.length==l){ xUI.errorCode=3;return false;}
//##変数名とプロパティ名の対照テーブル//
//	var props =new Array(varNames.length);
var props ={
	CREATE_USER:"create_user",
	UPDATE_USER:"update_user",
	CREATE_TIME:"create_time",
	UPDATE_TIME:"update_time",
		TITLE:"title",
		SUB_TITLE:"subtitle",
		OPUS:"opus",
		RATE:"rate",
		FRAME_RATE:"framerate",
	STANDERD_FRAME:"standerdFrame",
	STANDERD_PEG:"standerdPeg",
	BASE_RESOLUTION:"baseResolution",
		SCENE:"scene",
		CUT:"cut",
		INHERIT:"inherit",
		INHERIT_PARENT:"inheritParent",
	LINE_ID:"lineID",
	CHECK_OUT:"checkOut",
	CHECK_IN:"checkIn",
	currentStatus:"currentStatus",
		created:"created",
		updated:"updated",
		manager:"manager",
		worker:"worker",
		currentStatus:"currentStatus",
		slipNumber:"slipNumber",
	END:"end"
};
/**
	データ走査第二パス
	エレメントの取得に先行して管理データのみを構築する
	必要時にここで切り離しが可能  管理オブジェクトの独立化を行う

	ライン・ステージ・ジョブの記述開始  及び終了を検査する
	それぞれのステータス
		
		line

	宣言前は"LineUndefined"  この状態での記述は
	##による全体記述以外は全て無効
	（記述を捨てる）
	宣言後は明示的に閉じられるか、又は他のラインが宣言されるまでは宣言されたライン
	宣言ラインが閉じられたあと他のラインが開かれていない場合は、宣言前の状態に戻る

		stage

	各ライン内でステージ宣言前は、"StageUndefined"この状態での記述は
	##による全体記述以外は全て無効
	（記述を捨てる）
	宣言後は明示的に閉じられるか、又は他のラインが宣言されるまでは宣言されたステージ
	宣言ステージが閉じた後は宣言前の状態に戻る

		job	

	各ステージ内でジョブ宣言前は、"JobUndefined"
	この状態での記述は##による全体記述以外は全て無効
	（記述を捨てる）
	宣言後は明示的に閉じられるか、又は他のラインが宣言されるまでは宣言されたステージ
	宣言ステージが閉じた後は宣言前の状態に戻る

	第二パスで遷移状態を見て、開始終了状況を記録する

	第三パスでエレメントテーブルを読み込む際にこの情報を使用する? 第二パスで同時処理可能　そのほうが処理がはやい
	

	それぞれの区間は同型のオブジェクトでテーブルに記録する？

*/
var issueDescription   =false;//分岐情報フラグ
var issueStream        =""   ;//分離処理用一時変数
var currentLine        		 ;//ライン
var currentStage       		 ;//ステージ
var currentJob         		 ;//ジョブ
var currentGroup       		 ;//エレメントグループ
var currentElement     		 ;//個別エントリー
var elementDescription =[]   ;//個別エントリの記述バッファ　行ごとの配列

	elementDescription.flush=function(){
console.log('called : '+this.length);
		if(this.length){
			currentElement.setData(this.join('\n'));
			newMap.elementStore.add(currentElement);
			currentGroup.elements.add(currentElement);
console.log(this.join('\n'));
		}
		this.length = 0;
	}
/*
	各データは、分岐状態により複合されたモード状態を持つ
	このフラグが立っている間はストリームを分離して別にパースする
*/
	for(line=SrcData.startLine;line<SrcData.length;line++){
			//前置部分を読み込みつつ、本体情報の確認
//テキストディスクリプション取得時以外の　#コメントと空行をスキップに変更
		if(((currentGroup)&&(! currentGroup.type.match(/dialog|sound|text|camera|camerawork/)))&&(SrcData[line].match(/(^#[^#]|^\s*$)/))) continue;
//			シートプロパティにマッチ
//			ライン記述を先行評価
		if(SrcData[line].match(/^##([^=]+)=?(.*)$/)){
			var nAme=RegExp.$1;var vAlue=RegExp.$2;
//			if(line%10==0){alert(nAme+":"+vAlue)};

/*================================================================*/

//			分岐状況フラグが立っている場合は別ストリームに取り出す
			if(issueDescription){
				if(! nAme.match(/CHECK_IN|CHECK_OUT|currentStatus/)){
console.log(line +": exit IssueStreamMode:\n"+issueStream+"<<<end");
					issueDescription=false;
				//ここでストリームを処理する
					newMap.lineIssues=nas.Pm.parseIssue(issueStream+"\n");
//ストリームの処理後に判定行はプロセスに工程に流す
				}else{
// console.log(line+": add property :"+SrcData[line]+":");
					issueStream += SrcData[line]+"\n";
					continue;
				}
			}

/*================================================================*/
//	カレントラインの取得  = ドキュメントに一つ(二つ目以降はあっても無視)
//	モードを変更して分岐情報を別のストリームにまとめる
	if (nAme=="LINE_ID")
console.log(line +": detect LINE_ID start setup issueStream for :"+SrcData[line]);
	  if((issueStream.length==0)&&(nAme=="LINE_ID")){
	  	issueDescription=true;
	  	issueStream+=SrcData[line]+"\n";
	  	continue;
	  }
/*================================================================*/
//	ライン記述モード遷移
	  if(nAme.match(/^<\(([^\)]+)\)>(.*)$/)){
console.log(line +": detect productionLine : "+nAme +":"+RegExp.$1+":"+RegExp.$2);
	  	if(RegExp.$2.length){
	  	//記述終了
//console.log(line+": ライン設定解除 :"+currentLine.getPath())
			elementDescription.flush();
console.log(line+": ライン設定解除 :"+SrcData[line]);
			currentLine=undefined;
				currentStage	   = undefined;
				currentJob		   = undefined;
				currentGroup       = undefined;
				currentElement     = undefined;
				elementDescription.length = 0;
	  	}else{
			currentLine=newMap.new_ProductionLine(RegExp.$1);//xMapにメソッドで登録
//既に存在するラインを送った場合は追加されない  その場合はcorrentLineがfalse
		  	if(currentLine instanceof nas.Pm.ProductionLine){
				elementDescription.flush();
console.log(line+": line setup:"+RegExp.$1+":"+currentLine.getPath());
				currentStage       = undefined;
				currentJob	       = undefined;
				currentGroup       = undefined;
				currentElement     = undefined;
				elementDescription.length = 0;
		  	}else{
console.log(line+": line setup [[FAULT]]:"+RegExp.$1+":"+currentLine);
		  	}
	  	}
	  		continue;
	  }
//	ステージ記述モード遷移
	  if(nAme.match(/^\[([^\[\]]+)\](\/?)$/)){
	  	//alert("detect Stage : "+nAme);
	  	if(RegExp.$2.length){
  		//ステージ解除
			elementDescription.flush();
//			console.log(line+":\tステージ設定解除 :"+currentStage.getPath())
console.log(line+":\tステージ設定解除 :"+SrcData[line]);
			currentStage = undefined;
				currentJob		   = undefined;
				currentGroup       = undefined;
				currentElement     = undefined;
				elementDescription.length = 0;
	  	}else{
	  	//ステージ設定
	  		if(currentLine instanceof nas.Pm.ProductionLine)
			elementDescription.flush();
			currentStage=newMap.new_ProductionStage(RegExp.$1,currentLine);//xMapにメソッドで登録トライ
			if(currentStage instanceof nas.Pm.ProductionStage){
console.log(line+': change Current Stage :'+ currentStage.name);
				currentJob		   = undefined;
				currentGroup       = undefined;
				currentElement     = undefined;
				elementDescription.length = 0;
		  	}else{
console.log(line+":\tstage setup [[FAULT]]:"+RegExp.$1+":"+currentStage+":"+currentLine);
		  	}
		}
	  	continue;
	  }
//	ジョブ記述モード遷移
	  if(nAme.match(/^\[\[([^\[\]]+)\]([^\[\]]*)\](\/?)$/)){
console.log("detect Job : "+nAme);
	  	if(RegExp.$3.length){
	  		//記述終了
 			elementDescription.flush();
//			console.log(line+":\t\tジョブ設定解除 :"+currentJob.getPath())
console.log(line+":\t\tジョブ設定解除 :"+SrcData[line]);
			currentJob=undefined;
				currentGroup       = undefined;
				currentElement     = undefined;
				elementDescription.length = 0;
	  	}else{
	  		if(currentStage instanceof nas.Pm.ProductionStage)
	  		currentJob=newMap.new_Job(RegExp.$1,currentStage);
	  		
		  	if(currentJob instanceof nas.Pm.ProductionJob){
				//グループとエレメントをリセットする前に現状データの解決が必要
			elementDescription.flush();
console.log(line+":\t\tjob setup:"+RegExp.$1+":"+currentJob.getPath()+":");
console.log(currentJob);
				currentGroup       = undefined;
				currentElement     = undefined;
				elementDescription.length = 0;
		  	}else{
console.log(line+":\t\tjob setup [[FAULT]]:"+RegExp.$1+":"+currentJob+":");
		  	}
	  	}
	  	continue;
	  }

//	プロパティ同士が直結していないものを先行して評価。
switch (nAme){
case	"INHERIT":			;//兼用は","で分離してオブジェクト配列へ（あとで良いか？）
			newMap[props[nAme]]=vAlue;
			break	;
case	"INHERIT_PARENT":			;//参照する既存MAP
			newMap[props[nAme]]=vAlue;
			break	;
case	"RATE":
			newMap.framerate=nas.newFramerate(vAlue);
			break;
case	"FRAME_RATE":
			newMap.framerate=nas.newFramerate(newMap.framerate.name,vAlue);
			break;
case	"STANDERD_FRAME":			;//標準フレーム（入力メディア）を設定
			newMap[props[nAme]]=new nas.AnimationField(vAlue);
			break	;
case	"STANDERD_PEG":			;//標準タップ（入力メディア）を設定
			newMap[props[nAme]]=new nas.AnimationPegForm(vAlue);
			break	;
case	"BASE_RESOLUTION":			;//標準解像度を設定
			newMap[props[nAme]]=new nas.UnitResolution(vAlue);
			break	;
//以下は、カレントのJobプロパティ
case	"created":
console.log(line+":\t\t\t\tjob:"+nAme+" checkout:"+vAlue);
		var myContent=vAlue.split(";")[0].split("/");
		if(currentJob instanceof nas.Pm.ProductionJob){
			currentJob.createUser=new nas.UserInfo(myContent.reverse()[0]);
			currentJob.createDate=new Date(myContent.slice(1,myContent.length).reverse().join("/"));
		};
			break;
case	"updated":
console.log(line+":\t\t\t\tjob:"+nAme+" checkin:"+vAlue);
		var myContent=vAlue.split(";")[0].split("/");
		if(currentJob instanceof nas.Pm.ProductionJob){
			currentJob.updateUser=new nas.UserInfo(myContent.reverse()[0]);
			currentJob.updateDate=new Date(myContent.slice(1,myContent.length).reverse().join("/"));
		};
			break;
case	"manager":
case	"worker":
case	"slipNumber":
console.log(line+":\t\t\t\tjob-set:"+nAme+":"+vAlue);
		if(currentJob instanceof nas.Pm.ProductionJob){
			currentJob[props[nAme]]=vAlue.split(";")[0];
		};
			break;
case	"CREATE_USER":
case	"UPDATE_USER":
			newMap[props[nAme]]=new nas.UserInfo(vAlue);
if(nAme=="UPDATE_USER"){console.log(nAme)};
			break	;
default:				;//直接結合プロパティ
			newMap[props[nAme]]=vAlue;
//					判定した値をプロパティで控える
	continue;
}
			continue;
		}

//			エレメントグループまたは終了識別にマッチ
		if(SrcData[line].match(/^\[([^\[]+)\]$/)){
			var	innerContent = RegExp.$1;
//データ記述が終わっていたらメモを取り込んで終了
			if(SrcData[line].indexOf("[END]")==0){
//データ記述終了ライン控え
				SrcData.descriptionEnd=line;
				newMap["memo"]='';
				for(li=line+1;li<SrcData.length;li++)
				{
					newMap["memo"]+=SrcData[li];
					if((li+1) < SrcData.length){newMap["memo"]+="\n"};//最終行以外は改行を追加
				}
					break ;
			}else{
/*	終了識別ではないのでelement-group記述
	エレメントグループを新規登録
	グループはいずれかのジョブに所属する必要があるので、JobUndefinedの場合は拾った値を捨てる
	グループ自体の終了記述はない。
	つぎのグループが定義されるか、またはグループの所属するジョブが終了するまでの間有効
	グループの定義時にはcurrentElement.elementDescriptionが初期化される
*/
console.log(innerContent);
//console.log("X--:\t"+RegExp.$1+" :"+currentJob+"/"+currentStage+"/"+currentLine)
				if(currentJob instanceof nas.Pm.ProductionJob){
					elementDescription.flush();
					var groupDescription= innerContent.split('\t');
console.log(line+":detect elementGroup :"+ groupDescription.slice(0,2)+"\tjob as: "+currentJob.getPath()+"<<<end");
console.log(SrcData[line]);
/* 管理メソッドを使用してidを保持できるようにすること
					currentGroup = new nas.xMapGroup(
						groupDescription[0],
						(groupDescription[1])?groupDescription[1]:'cell',
						currentJob,
						SrcData[line]
					);
*/
					currentGroup = newMap.new_xMapElement(
						groupDescription[0],
						(groupDescription[1])?groupDescription[1]:'cell',
						currentJob,
						SrcData[line]
					);
					
					//currentGroup.text=SrcData[line];
console.log(currentGroup);
					newMap.elementGroups.add(currentGroup);
					currentElement=undefined;
					elementDescription.length=0;
					if(groupDescription.length>2){
						var additionalProperties = groupDescription.slice(2);
console.log('追加属性 :' + groupDescription.slice(2) );
						currentGroup.content.additional=true;
					//グループのタイプに従って追加属性のセットアップを同時に行う
					//グループ内のデフォルト値保持用のテンプレートコンテンツの属性として追加
					//これ以降の追加属性の設定は、現行のエレメントがnullの場合グループの属性　エレメントが宣言された後は現行エレメントの追加属性となるXX
					}
				} 
				continue;
/*else{
	//currentJob undefined or otherObject(不正状態なのでエントリ行は捨てる) 
			alert(currentLine+":"+currentStage+":"+currentJob+":"+"--"+":"+RegExp.$1);
		}
*/
			}
		}else{
//　通常記述または、無効記述
/*	記述は以下の分類
'#'で開始する注釈行
content-type=text 以外の空白行　*要注意* 空白行を認めるContent-typeを切り分けて処理
^<グループ名>\t<エレメント名>[\t+プロパティ記述] 　エレメント定義行　エレメント登録を行いプロパティ待機状態に入る
^\s+<propName>=<propValue>　待機状態のエレメントにプロパティを与える
*/
			if((SrcData[line].indexOf("#") == 0)||((SrcData[line].match( /^\s+$/ ))&&(! currentGroup.type.match(/text/i)))){
// console.log(line+": commentLine :"+SrcData[line]);
	 			continue;
			};//commentSkip
console.log(SrcData[line]);
//	マップエントリパーサ
//この場では振り分けのみを行い、実際のパースは値オブジェクトのメソッドに委ねる
 			if(currentJob instanceof nas.Pm.ProductionJob){
				if (
					(SrcData[line].indexOf(currentGroup.name+'\t')==0)&&
					(SrcData[line].match(/^(\S+)\t(\S+)(\t([^\t]+)(\t([^\t]+))?)?$/))
				){
				// xMapエレメント エントリー行 /^(<groupId>)\t(<elementId>)(\t(<elementProp>)(\t(commentString))?)?$/
					var groupName = RegExp.$1; var entryName = RegExp.$2;
					var props     = RegExp.$4; var comment   = RegExp.$6;
//console.log([groupName ,currentGroup.name]);
					if(groupName == currentGroup.name){
						elementDescription.flush();
						currentElement = new nas.xMapElement(entryName,currentGroup,currentJob,SrcData[line]);
console.log(line + ': detect xMapElement :'+groupName +' : '+entryName );
						elementDescription.push(SrcData[line]);
					}
				}else{
				// グループ/エレメント プロパティ定義行
console.log(line + ' :detect element properties :' + SrcData[line])
					if(currentElement){
						elementDescription.push(SrcData[line]);
					}else{
						currentGroup.text+='\n'+SrcData[line];
					}
				}
 			}
		}
	}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
//	第二パス終了・読み取った情報でxMAPオブジェクトを再初期化(共通)

/*
	データ操作第三パス 2パスで問題無さそう？  複雑なテーブルが無い
	ライン・ステージ・ジョブを切り替えながらエレメントテーブルを作成
*/
return newMap;
}
/*
 *	書き出しメソッド
 *	書き出しの際は  保持しているLine/Stage/Jobは全て書き出す
 *	ブランチは、オブジェクト自体をブランチオブジェクトに設定してそのオブジェクトの書き出しを行うこと
 */
xMap.prototype.toString= function(){
	var Now=new Date();
//セパレータ文字列
	var	bold_sep='\n#';
		for(n=8;n>0;n--) bold_sep+='========';
	var	thin_sep='\n#';
		for(n=8;n>0;n--) thin_sep+='--------';
//	ヘッダで初期化
	var result='nasMAP-FILE 1.9x';//出力変数初期化
//	##共通プロパティ変数設定
	result+='\n##CREATE_USER='	+ this.create_user	;
	result+='\n##UPDATE_USER='	+ this.update_user	;
	result+='\n##CREATE_TIME='	+ this.create_time	;
	result+='\n##UPDATE_TIME='	+ this.update_time	;

	result+='\n##TITLE='		+ this.title	;
	result+='\n##SUB_TITLE='	+ this.subtitle	;
	result+='\n##OPUS='			+ this.opus	;
//xMap.framerate
	result+='\n##RATE='			+ this.framerate.name;
	result+='\n##FRAME_RATE='	+ this.framerate.rate;
//xMap.
	result+='\n##STANDERD_FRAME='	+ this.standerdFrame.name;
	result+='\n##STANDERD_PEG='	+ this.standerdFrame.peg.name;
	result+='\n##BASE_RESOLUTION='	+ this.baseResolution.as("dpi")+"dpi";

	
	result+='\n##SCENE='	+ this.scene	;
	result+='\n##CUT='	+ this.cut	;
	result+='\n##NAME='	+ this.name	;
	result+='\n##INHERIT='	+ this.inherit	;
	result+='\n##INHERIT_PARENT='	+ this.inheritParent	;

	result+='\n#';
	result+=bold_sep;//セパレータ####################################
/*	カレントのライン・ステージの状況を書き出す  本線・支線の管理を行う必要があるが、
	ここでの変更は行なわない  別の管理メソッドで切り替え
	管理オブエジェクトからの出力を埋め込む設計にする
 */
	result+='\n#';
 	result+=this.lineIssues.toString();
// 	result+=this.LineManger.toString(); //LineManager 未コーディング  21-04 2016
 	result+='\n#';
	result+=bold_sep;//セパレータ####################################
	result+='\n#';
	result+=bold_sep;//セパレータ####################################
	result+='\n#';
//lineLoop
for (var lidx=0;lidx<this.lines.length;lidx++){
	var currentLine=this.lines[lidx];
	result+="<("+currentLine.name+")>\n";
	result+="<("+currentLine.name+"):"+currentLine.id.join('-')+">\n";
//StageLoop
	for (var sidx=0;sidx<this.lines[lidx].stages.length;sidx++){
		var currentStage=this.lines[lidx].stages[sidx];
		result+="["+currentStage.name+"]\n";
//JobLoop
		for (var jidx=0;jidx<this.lines[lidx].stages[sidx].jobs.length;jidx++){
			var currentJob = this.lines[lidx].stages[sidx].jobs[jidx];
console.log([lidx,sidx,jidx].join(':') +" >> "+ currentJob.name)
			result+=currentJob.toString();
			
				for(var gidx=0;gidx<this.elementGroups.length;gidx++){
					if(this.elementGroups[gidx].link!==currentJob){
						continue;
					}else{
console.log(this.elementGroups[gidx]);
						var currentGroup=this.elementGroups[gidx];
						result+=currentGroup.toString();//groupがエレメントの出力を内包しているのでここで最終出力
					}
				}
			result+="##[["+currentJob.name+"]]/\n";//ジョブ閉じる
		}
		result+="##["+currentStage.name+"]/\n";//ステージ閉じる
	}
	result+="##<("+currentLine.name+")>/\n";//ライン閉じる
}

//
//ENDマーク
	result+='\n[END]\n';
//メモ
	result+=this.memo;

// // // // //返す(とりあえず)
//引数を認識していくつかの形式で返すように拡張予定
//セパレータを空白に変換したものは必要
//変更前(開始時点)のバックアップを返すモード必要/ゼロスクラッチの場合は、カラシートを返す。
	if(xUI.errorCode){xUI.errorCode=0};return result;
}

/**
xMapを暫定的にXPSに同期　（テスト用）

SCi情報を転記
test
    var parentData = Xps.getIdentifier(xUI.XPS);//バルクダンプ
    var result = xMap.syncProperties(Idf);一括適用
    
本番用に転用可能
Xpstを単独でオープンした際には、xMapデータが空のじょうたいになるので、その際はこの手順が実行される。

ｘMapを先に開きそこからXpstを開いた際、最初は　xMap > Xpst の初期化が行われ同期更新が続く
Xpstを単独でオープンした場合は、テンポラリのxMapが初期化され情報の転記が行われる。
テンポラリのxMapは、ｘMapドキュメントとして保存しない限り、作業終了時には失われるものとする


*/
xMap.prototype.syncProperties = function(myXps){
console.log(decodeURIComponent(Xps.getIdentifier(myXps,'full')));
    var values = Xps.parseIdentifier(Xps.getIdentifier(myXps,"full"));
console.log(values); 
    this.title = values.title;
    this.opus  = values.opus;
    this.subtitle = (values.subtitle == 'undefined')? undefined :values.subtitle;
    this.scene = values.scene;
    this.cut = values.cut;
    this.framerate = new nas.Framerate();

    var myLine  = this.new_ProductionLine(values.line.name);
        myLine.id = values.line.id;
console.log(myLine);
    var myStage = this.new_ProductionStage(values.stage.name,myLine);
        myStage.id = values.stage.id; 
console.log(myStage);
    var myJob   = this.new_Job(values.job.name,myStage);
        myJob.id = values.job.id;
console.log(this);
}

//比較関数
/*
英数大文字小文字	不一致

英数全角半角	一致
数値	冒頭のゼロを払う
小数点以下はポストフィックスに編入
半角カナ	＞  全角カナ
実現するためには

>文字列のAlphaNumeric部分を1bite化
>ｶﾅ文字を全角化(…微妙)放置したほうが良さそう
ラベル・数値・後置部分を切り分ける
先行する数字以外をラベル
数字の連続部分を数字部
それ以降を後置部と定義する
＞小数点以下は後置部となる
*/

/**
Xps 初期化引数にSCIを使う

    1.Mapがあらかじめ初期化されてMapに含まれるSCIを利用して初期化する
    2.DB情報相当のSCIを初期化してそれを利用する
    3.SCI相当の文字列で初期化する（XPS初期化ルーチン内でSCIを作る）
    
    
Xps 初期化に先立ってMapオブジェクトを初期化して、そのMapを引数にして初期化する（Xps内部的でMapをそのまま利用）

Xps 初期化時にMapが無い場合は、初期化時にSCI情報でMapを初期化してエントリにする（この場合は自動的にテンポラリMapになる）

dataChack関数は、現状のままで互換のためだけに整備する

相当する新機能は、xMap.requestEntry(elementName,groupName,targetJob)で
xMapに対してxMapエレメントを請求するメソッドを作成する

リクエストされたエントリが存在すれば当該エントリを返す
存在しない場合は、そのエントリを「新規」に「空の値」で作成して返す
エントリは、順次作成されてセッションユニークなIDが与えられる（恒常性は無い）

セッション中はエントリにIDでアクセスすることも可能

エントリは、タイミングを調整してXPS側からクリンアップを行うことが可能
保存前処理として終了前には必ずクリンアップが行なわれる。

シート上に一度も使用されないエントリを抽出して、値が空のままのエントリは自動削除され、記録には残らない。
値が与えられたエントリは記録される
ユーザ判断によるクリンアップのルートは作成する



*/
/**
=============== 以下は、古いスタイルのデータパーサのための後方互換関数  新規の使用は禁止
                  古いスタイルのパーサが無くなったら削除予定 2016 - 12.24

 * NAS(U) りまぴん専用データチェック関数
 * マップ処理ができるようになったら汎用関数に
 * マップオブジェクトのメソッドに切り換え予定
 * 2005/12/19 mapサイドに移動
 *
 * 2015/10/05 判定対象を拡張
 * timing        :null/"blank"/"interp"/Number Init
 * effect        :null/"fixed"/"interp"/Label String
 * camerawork    :null/"fixed"/"interp"/Label String
 * dialog        :null/"blank"/"sound"/"nodeOpen"/"nodeClose"/Label String
 * still        :null/"blank"/("interp")/Number Init
 *
 * 各トークンの意味
 * timing
 * null    不定記述基本的に先行値の複製＝変化なしのサイン
 * blank    カラ
 * interp    補間サイン  前後の値を持つキーから計算されるためこれ自身は直接値を持たない
 *
 * effect
 * fixed
 * null    不定記述 基本的に先行値の複製＝変化なしのサイン
 * blank    カラ
 * interp    補間サイン  前後の値を持つキーから計算されるためこれ自身は直接値を持たない
 * dataCheck = function (str,label,bflag)
 *
 * @param str
 * @param label
 * @param bflag
 * @returns {*}
 */
function dataCheck(str, label, bflag) {

    /**
     * 準備的にPSのみで動作するデータチェック部分を追加
     */

//	if(str.length){alert([str,label,bflag].join()+":"+[label,str].join("-")+":"+_getIdx([label,str].join("-")))};

    /**
     * 与えられたトークンを有効データか否か検査して有効な場合に数値もしくは、
     * キーワード"blank"/"interp"/"fixed" を返す。それ以外はnullを返す。
     * 今のところりまぴん専用05/03/05
     *    すっかり忘れていた、
     *    ブランクメソッドがファイルでかつカラセルなしの場合は、
     *    ブランク自体が無効データになるように修正 05/05/02
     * 汎用関数になる場合は、有効データに対して
     * 「MAP上の正しいエントリに対応するエントリID」で返すこと。
     *
     * エントリIDよりも、オブジェクトを返すのが望ましい。
     * このシステム内ではオブジェクトは大きなデータにはならない
     * 大容量のデータを必要とする素材は全て外部へのリンク情報である
     *
     * オブジェクトが自律的に自身のリンク解決ができる方が良いか？
     * この関数を利用しているポイント自体を xMap.getElementByName()に置き換える方向で
     */
    if (!label) {
        label = null
    }
    /**
     * ラベルなしの場合、ヌルで
     */
    if (xUI) {
        if (!bflag) {
            bflag = (xUI.blpos == "none") ? false : true
        }
    } else {
        if (!bflag) {
            Blank = (BlankPosition == "none") ? false : true
        }
    }
    /**
     * カラセルフラグなしの場合はデフォルト位置から取得
     */
    if (!str) {
        return null
    }
    /**
     * ブランクキーワードならば、ブランクを返す。
     * @type {RegExp}
     */
//    var blankRegex = new RegExp("^(" + label + ")?\[?[\-_\]?[(\<]?\s?[ｘＸxX×〆0０]{1}\s?[\)\>]?\]?$");
    var blankRegex = nas.CellDescription.blankRegex;
    if (str.toString().match(blankRegex)) {
        if (bflag) {
            return "blank"
        } else {
            return null
        }
    }
    /**
     * 中間値生成記号の場合"interp"を返す.
     * @type {RegExp}
     */
//    var interpRegex = new RegExp("^[\-\+=○●*・]$");
    var interpRegex = nas.CellDescription.interpRegex;
    if (str.toString().match(interpRegex)) {
        return "interp"
    }
    /**
     * 全角英数字記号類を半角に変換
     */
    str = nas.normalizeStr(str);
    /**
     * 数値のみの場合は、数値化して返す。ゼロ捨てなくても良いみたい?
     * @todo 記述指定による有効記述はXPS側での解釈に変更する  このルーチンは近い将来  配置を移動してこのメソッドからは消失させる  20160101
     */
    if (!isNaN(str)) {

        /**
         * ホストアプリケーションがPSでかつLayerSetにgetIdxが拡張されている場合のみ数値を更に確認
         * エラーが出たらヌル扱い
         */
        if (appHost.ESTK){
        if (app.name.indexOf("Photoshop") > 0) {
            str = _getIdx([label, str].join("-"));
            if (!str) return null;
        }
        }
        return parseInt(str);
    } else {
        /**
         * レベルを判別してラベル文字列を取得。ラベル付き数値ならば、数値化して返す。
         * @type {RegExp}
         */
        var labelRegex = new RegExp("^(" + label + ")?[\-_\]?\[?[\(\<]?\s?([0-9]+)\s?[\)\>]?$");
        //↑ラベル付きおよび付いてないセル名にヒットする正規表現
        //…のつもりだけど大丈夫かしら?
        if (str.toString().match(labelRegex)) {
            str = RegExp.$2 * 1; //部分ヒットを数値化
            /**
             * ホストアプリケーションがPSでかつLayerSetにgetIdxが拡張されている場合のみ数値を更に確認
             * エラーが出たらヌル扱い
             */
             
        if (appHost.ESTK){
            if ((app) && (app.name.indexOf("Photoshop") > 0)) {
                str = _getIdx([label, str].join("-"));
                if (!str) return null;
            }
        }
            return str;
        }
    }
    /**
     * あとは無効データなのでヌルを返す。
     */
    return null;
}

/**
 * 一時利用メソッドPS環境のみで実行
 * レイヤ名／トレーラーを引数にその名前のレイヤーのレイヤセット内での順位（タイミング）を戻す
 * @param Lname
 * @param targetTrailer
 * @returns {*}
 * @private
 トレーラーは
 ps > activeDocumentのレイヤセット  未指定の場合はrootならapp.activeDocument.layers
 ae > 
 */
_getIdx = function (Lname, targetTrailer) {
    /**
     * レイヤ全あたりでチェック
     */
    if (typeof targetTrailer == "undefined") targetTrailer = app.activeDocument.layers;
    for (var lix = targetTrailer.length - 1; lix >= 0; lix--) {
        if (targetTrailer[lix].name == Lname)  return (targetTrailer.length - lix);
    }
    /**
     * 該当レイヤがないのでサブレイヤを掘る
     */
    var result;
    for (var lix = targetTrailer.length - 1; lix >= 0; lix--) {
        if (targetTrailer[lix] instanceof LayerSet) result = _getIdx(Lname, targetTrailer[lix].layers);
        if (result) return result;
    }
    return null
};

/**
 * xMap.dataCheck(myStr,tlLabel[,blFlag])
 *
 * 引数    : セルエントリ,タイムラインラベル,ブランクフラグ
 * 戻り値    : 有効エントリID  /"blank"/ null
 *
 * セルエントリを  文字列  タイムラインラベル  [カラセルフラグ]で与えて有効エントリの検査を行う
 * MAP内部を走査して有効エントリにマッチした場合は有効エントリを示す固有のIDを返す
 * （AE版では  グループ相当のコンポオブジェクトおよびフレームIDで返す）
 * カラセルフラグが与えられた場合は、本来のカラセルメソッドを上書きして強制的にカラセルメソッドを切り替える
 * AE版の旧版タイムシートリンカとの互換機能
 
 この関数は後方互換のために存在するので新規の利用は禁止
 
 調整的には、dataChaeck関数はこのまま残置してxMapに順次移行
 xMap.dataChaeck は設定しない（他のスタイルで実装）
 
 */