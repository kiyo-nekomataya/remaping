/**
	タイムシートドキュメント 書式管理オブジェクト draft Xpst
	初期化の際に
		フレームレートは nas.Framerate にコンバートする
		高さ、幅等の数値は nas.UnitValue にコンバートする 標準Unitは'mm'
		not constractor
		
 */
var documentFormat = {
//active {Boolean}	書式データ編集中のフラグ
	active       : false,
//backup {String Xpst}	書式編集開始前データ
	backup       : "",
//bkupSelection {Array Xpst.selection}	書式編集開始選択状態データ
	bkupSelection: [],
//backupRef {String Xpst}	書式編集開始前参照データ
	backupRef    : "",
	modeBackup   : "",

	headerinf    : null,
	signatures   : null,
	notetext     : null,
	orderbox     : null,
//moveBox {Stirng element-id}
	moveBox      : '',
//resize {Boolean}
	onResize     : false,

	modified     : false,
	baseFormatName : "",

	img          : null,
	tga          : null,
	dragItem     : null,
	dragAction   : null,
	columnOptions     :[
		"timecode","dialog","sound","cell","camera","geometry","composite"
	],
	headerItemWidthClass   :{
		"ep"          : ".opusHeader",
		"title"       : ".titleHeader",
		"sci"         : ".scenecutHeader",
		"time"        : ".timeHeader",
		"user"        : ".nameHeader",
		"page"        : ".pageHeader"
	},
	itemWidth         :{
		"dialog"      : "DialogWidth",
		"sound"       : "SoundWidth",
		"cell"        : "SheetCellWidth",
		"timing"      : "SheetCellWidth",
		"replacement" : "SheetCellWidth",
		"still"       : "StillCellWidth",
		"camerawork"  : "CameraCellWidth",
		"camera"      : "CameraCellWidth",
		"geometry"    : "GeometryCellWidth",
		"stage"       : "GeometryCellWidth",
		"stagework"   : "GeometryCellWidth",
		"effect"      : "SfxCellWidth",
		"sfx"         : "SfxCellWidth",
		"composite"   : "SfxCellWidth",
		"comment"     : "CommentWidth",
		"tracknote"   : "TrackNoteWidth",
		"timecode"    : "TimeGuideWidth",
		"reference"   : "ActionWidth"
	},
	itemClass         :{
		"DialogWidth"       :"th.dialogSpan",
		"SoundWidth"        :"th.soundSpan",
		"SheetCellWidth"    :"th.timingSpan",
		"CameraCellWidth"   :"th.cameraSpan",
		"GeometryCellWidth" :"th.geometrySpan",
		"SfxCellWidth"      :"th.sfxSpan",
		"CommentWidth"      :"th.framenoteSpan",
		"TrackNoteWidth"    :"th.tracknoteSpan",
		"TimeGuideWidth"    :"th.tcSpan",
		"ActionWidth"       :"th.referenceSpan"
	},
	columnOptionCode  :{
		"dialog"      :"dlg.",
		"sound"       :"snd.",
		"cell"        :"cell",
		"timing"      :"cell",
		"replacement" :"cell",
		"still"       :"book",
		"camerawork"  :"cam.",
		"camera"      :"cam.",
		"geometry"    :"stg.",
		"stage"       :"stg.",
		"stagework"   :"stg.",
		"effect"      :"cmp.",
		"sfx"         :"cmp.",
		"composite"   :"cmp.",
		"comment"     :"memo",
		"tracknote"   :"note",
		"timecode"    :"tc.",
		"reference"   :"ref."
	},
	colorTable:{
		"docColorpickBG"     :"SheetBaseColor",
		"docColorpickTXT"    :"SheetTextColor",
		"docColorpickAP"     :"AppBaseColor",

		"docColorpickSLCT"   :"SelectedColor",
		"docColorpickSLCN"   :"SelectionColor",

		"docColorpickRapid"  :"RapidModeColor",
		"docColorpickFloat"  :"FloatModeColor",
		"docColorpickSect"   :"SectionModeColor",

		"docColorpickHi"     :"FootStampColor",
		"docColorpickEdt"    :"EditingColor"
	},
	colorPreview:{
		'focus-cell'          :"NORMAL",
		'focus-spin'          :"NORMALspin",
		'focus-cell-selected' :"NORMALselection",
		'spin-selected'       :"NORMALspinselected",
		'selected'            :"NORMALselection",
		'rapid'               :"EXTEND",
		'rapid-spin'          :"EXTENDselection",
		'rapid-selected'      :"EXTENDselection",
		'focus-range-selected':"FLOAT",
		'range-spin-selected' :"FLOATspinselected",
		'range-selected'      :"FLOATselection",
		'section-head'        :"SECTION",
		'section-body'        :"SECTIONselection",
		'section-tail'        :"SECTIONtail"
	},
	FormatName        :"remaping",
	TemplateImage     :"/remaping/template/timeSheet_default.png",
	HeaderMarginTop    : 36,
	HeaderMarginLeft   : 50,
	HeaderBoxHeight    : 65,
	headerItemOrder :[
		["title" , 350,"hide"],
		["ep"    , 110,""],
		["sci"   , 160,""],
		["time"  , 160,""],
		["user"  , 130,""],
		["page"  , 120,""]
	],
	HeaderSign         : [28,100,1000,140],
	HeaderNote         : [28,140,1000,256],
	WorkTitleLogo     :"",
	SheetTextColor    :"#111111",
	SheetBaseColor    :"#ffffef",
	AppBaseColor      :"#ffffef",
	SelectedColor     :"#9999ff",

	RapidModeColor    :"#ffff44",
	FloatModeColor    :"#88eeee",
	SectionModeColor  :"#ff44ff",

	SelectionColor    :"#f8f8dd",
	FootStampColor    :"#ffffff",
	EditingColor      :"#eebbbb",
	SelectingColor    :"#ccccaa",
	Restriction          :false,
	ViewMode             :"page",
	PageLength           :"6+0",
	FrameRate            :"24fps(24)",
	SheetColumn          :2,
	CellWidthUnit       :"px",
	SheetHeadMargin     :344,
	SheetLeftMargin     :57,
	SheetLabelHeight    :16,
	SheetCellHeight     :17,
	SheetColHeight      :1224,
	TimeGuideWidth	    :15,
	ActionWidth         :16,
	DialogWidth	        :36,
	SoundWidth          :36,
	SheetCellWidth	    :25,
	SheetCellNarrow	    :2,
	StillCellWidth	    :12,
	GeometryCellWidth   :52,
	SfxCellWidth	        :46,
	CameraCellWidth     :30,
	CommentWidth        :30,
	TrackNoteWidth      :30,
	ColumnSeparatorWidth:19,
	trackSpec :[
		["reference"   ,  7, "fix"],
		["dialog"      ,  1, "fix"],
		["timecode"    ,  1, "fix"],
		["replacement" ,  7, ""],
		["camera"      ,  3, ""],
		["comment"     ,  1, ""]
	]
};
/* テンプレートリスト 
	<datalist id=format_list >
		<option value ="横浜アニメーションラボ" label='format_list_YAL'>
		<option value =東映動画 >
		<option value =TDTS >
		<option value =日本アニメーション>
		<option value =プロダクションIG>
		<option value =WITスタジオ>
		<option value =BONES>
		<option value =ねこまたや>
		
	</datalist>
	データ形式 [key,description,file-url]
	配列からdatalistを更新する手続き(一方通行)
	documentFormat.updateFormatList()
*/
documentFormat.formatList = [
	['YAL',"横浜アニメーションラボ",'/remaping/documentFormat/timesheet/YAL.json'],
	['TDTS',"東映アニメーションデジタルタイムシート",'/remaping/documentFormat/timesheet/TDTS.json'],
	['remaping-old',"旧りまぴん",'/remaping/documentFormat/timesheet/remaping-old.json'],
	['remaping',"UAT",'/remaping/documentFormat/timesheet/UAT.json'],
	['nekomataya',"ねこまたや",'/remaping/documentFormat/timesheet/nekomataya.json']
];
/**
 *	選択リスト内容を更新
 *	 現在保持しているリストをUIに反映
 */
documentFormat.updateFormatList = function(){
	var datalist   = document.getElementById("docFormatSelect");
	if(! datalist) return false;//印刷モードの場合同期処理無し
//'= CUSTOM ='以外の値をいったん削除
	Array.from(datalist.children).forEach(function(e){
		if(e.value.match(/^\=.*\=$/)){
			if(this.modified) e.selected = true;
		}else{
			datalist.removeChild(e);console.log('removed :'+e.value);
		};
	});
//現在保持している値をリストに追加
	documentFormat.formatList.forEach(function(e){
//リストを設定
		var opt = document.createElement('option');
		opt.value = e[0];opt.innerHTML = e[1];
		datalist.appendChild(opt); console.log('append :'+opt.value);
		if((!(this.modified))&&((opt.value == documentFormat.FormatName)||(opt.innerHTML == documentFormat.FormatName))){
			opt.selected = true;
		};
	});
}
/**
 *    @params {Object} sheetLooks
 *			判定する書式情報 省略時はdocumentFormatの保持情報
 *    @params {Object} compareTarget
 *			比較対象 省略時はxUIが保持する現在の書式情報
 *    @returns {Boolean}
 *			一致の際に true 不一致で fasle
 *
 *    現在のドキュメント書式と引数オブジェクトを比較する
 *    数値は下２桁まで一致していたら同じデータとみなす
 */
documentFormat.compareSheetLooks = function(sheetLooks,compareTarget){
	if(typeof sheetLooks == 'undefined')    sheetLooks = this.toJSON();//現在保持している情報
	if(typeof compareTarget == 'undefined') compareTarget = xUI.sheetLooks;//参照
console.log(sheetLooks);
console.log(compareTarget);
	for (var prp in compareTarget){
		if(typeof sheetLooks[prp] == 'undefined'){
console.log('no exsist :' + prp);
			return false;
		}else{
			if(typeof compareTarget[prp] == 'number'){
				if(Math.round(compareTarget[prp]*100) != Math.round(sheetLooks[prp]*100)){
console.log('unmatch :' + [prp, compareTarget[prp], sheetLooks[prp]].join('\t:'));
					return false;
				};
			}else{
				if(compareTarget[prp].toString() != xUI.sheetLooks[prp].toString()){
console.log('unmatch :' + [prp, compareTarget[prp], sheetLooks[prp]].join('\t:'));
					return false;//false;
				};
			};
		};
	};
	return true;
}
/*TEST
	documentFormat.compareSheetLooks(xUI.XPS.sheetLooks);//true (同オブジェクト)
	documentFormat.compareSheetLooks(SheetLooks);//false (たぶん)
*/
/*
	選択状態を更新（リストの更新は行われない）
	現在の情報をリスト内容と比較して一致していた場合セレクタを選択する
 */
documentFormat.syncFormatSelect = function(){
	var datalist = document.getElementById("docFormatSelect");
	if(! datalist) return false;//印刷モードの場合 セレクタがないので同期処理無し
	if(documentFormat.modified){
		 datalist.children[0].selected = true;
	}else{
		var fmt = documentFormat.formatList.find(function(e){return ((e[0]==documentFormat.FormatName)||(e[1]==documentFormat.FormatName));});
		if(fmt){
//リストに候補エントリーがあれば内容を取得して比較
			$.ajax({
				url:fmt[2],
				type:'GET',
				dataType:'json',
				success:function(result){
					if(documentFormat.compareSheetLooks(result)){
						documentFormat.modified = false;
						var opt = Array.from(datalist.children).find(function(e){
							return ((e.value == documentFormat.FormatName)||(e.innerHTML == documentFormat.FormatName));
						});
						if(opt) opt.selected = true;
					}else{
						documentFormat.modified = true;
						documentFormat.FormatName = 
						datalist.children[0].selected = true;
					};
				}
			});
		}else{
			documentFormat.modified = true;
			datalist.children[0].selected = true;
		};
	};
	if(
		(documentFormat.modified)&&
		(document.getElementById('docFormatName').value == documentFormat.baseFormatName)
	){
		documentFormat.FormatName = (documentFormat.FormatName.match(/\d$/))?
		nas.incrStr(documentFormat.FormatName):documentFormat.FormatName + '_1';
		document.getElementById('docFormatName').value = documentFormat.FormatName;
//alert('change name :' + documentFormat.FormatName);
	};
}
/**
	@parms   {Object} looks
	@returns {Object}
	Sheetlooks形式の正規化された無名オブジェクトを戻す
	
	documentFormatオブジェクトのクラスメソッドとしてsheetLooksを正規化する
	default値の設定もここで行う
*/
documentFormat.normalizeSheetlooks = function(looks){
	var sheetLooks = JSON.parse(JSON.stringify(documentFormat));//
	var trackSpec  = [];
	if ((typeof looks == 'object')&&(looks.trackSpec)&&(looks.trackSpec instanceof Array)){
//トラックスペック配列を持ったオブジェクトが渡された場合
		for(var prp in looks){
			if(prp == 'trackSpec'){
				trackSpec = Array.from(looks[prp]);//後ほど検査
				continue;
			}else if(sheetLooks[prp]){
				sheetLooks[prp] = looks[prp];
			};
		};
	}else{
//オブジェクト渡しでなくスカラ引数または配列を渡された場合はトラックスペックのみを設定する
		if(! (looks instanceof Array)) looks = [looks];//配列化
		if(! (looks[0] instanceof Array)){
//第一要素が配列ではないのでスカラ要素の配列とみなす
			switch (looks.length){
				case 0:trackSpec=[
					["timecode" ,1,"fix"],
					["reference",4,"fix"],
					["dialog"   ,1,"fix"],
					["timing"   ,4,""]
				];
				break;
				case 1:trackSpec=[
					["timecode" ,1,"fix"],
					["reference",4,"fix"],
					["dialog"   ,1,"fix"],
					["timing"   ,parseInt(looks[0]),""]
				];
				break;
				case 2:trackSpec=[
					["timecode" ,1,"fix"],
					["reference",4,"fix"],
					["dialog"   ,parseInt(looks[0]),"fix"],
					["timing"   ,parseInt(looks[1]),""]
				];
				break;
				case 3:trackSpec=[
					["timecode" ,1,"fix"],
					["reference",4,"fix"],
					["dialog"   ,parseInt(looks[0]),"fix"],
					["timing"   ,parseInt(looks[1]),""],
					["camera"   ,parseInt(looks[2]),""]
				];
				break;
				case 4:trackSpec=[
					["timecode" ,1,"fix"],
					["reference",4,"fix"],
					["dialog"   ,parseInt(looks[0]),"fix"],
					["timing"   ,parseInt(looks[1]),""],
					["camera"   ,parseInt(looks[2]),""],
					["geometry" ,parseInt(looks[3]),""],
				];
				break;
				case 5:;
				default:trackSpec=[
					["timecode" ,1,"fix"],
					["reference",4,"fix"],
					["dialog"   ,parseInt(looks[0]),"fix"],
					["timing"   ,parseInt(looks[1]),""],
					["camera"   ,parseInt(looks[2]),""],
					["geometry" ,parseInt(looks[3]),""],
					["effect"   ,parseInt(looks[4]),""]
				];
			}
console.log(trackSpec);
		}else{
//配列要素が配列なのでtrackSpecデータとみなす
			trackSpec = Array.from(looks);
		};
	};
//トラックスペックの簡易検査
	var checkTS = true;
	trackSpec.forEach(function(e){
		if(
			(! String(e[0]).match(Xps.TrackPropRegex))||
			( isNaN(e[1]))||
			(! String(e[2]).match(/fix|hide|^$/))
		){
//不正引数が含まれているためフラグをたててブレーク
			checkTS = false;
console.log('不正引数検出のためトラック仕様をデフォルト値にリセット');
		}
	});
	if(checkTS) sheetLooks.trackSpec = trackSpec;
	return sheetLooks;
}
//normalizeSheetlooks
/**
	@params  {String} kwd
	保持している書式リスト内のキー値を引数にしてsheetLooksを設定する
	エディタ有効時にはdocumntFormatの編集状態に反映
	それ以外ではフロントのドキュメントに反映（UNDOあり)
	引数はフォーマットを指定する文字列 コード 名称 ファイルパスのいずれでも良い
	eg.
	documentFormat.applyFormat('YAL');
	documentFormat.applyFormat('横浜アニメーションラボ');
	documentFormat.applyFormat('/remaping/documentFormat/timesheet/YAL.json');
	
 */
documentFormat.applyFormat =function(kwd){
	var fmt = documentFormat.formatList.find(function(e){return ((e[1]==kwd)||(e[0]==kwd)||(e[2]==kwd));});
console.log(fmt);
	if(fmt){
//リストに該当エントリーがあれば内容を取得して適用
		$.ajax({
			url:fmt[2],
			type:'GET',
			dataType:'json',
			success:function(result){
				console.log(result);//データチェックをしたほうが良いかも？
				if(documentFormat.active){
					documentFormat.apply(result);
				}else{
//undoが可能なようにトラックスペックを維持して新たな書式データを適用したXpsをput
					documentFormat.parse(result,function(){
						var newData = new Xps();
						newData.parseXps(xUI.XPS.toString(false));
						newData.parseSheetLooks(documentFormat.toJSON());
						xUI.put(newData);
						xUI.applySheetlooks();
					});
				};
			}
		});
	};
	return fmt;
}
/*
 *	JSON出力用フィルタ
 */
documentFormat.stringifyArray = function(arr){
	var result = [];
	arr.forEach(function(e){
		if(e instanceof nas.UnitValue){
			result.push(Math.round(e.as(documentFormat.CellWidthUnit)*100)/100);
		}else if(e instanceof Array){
			result.push(documentFormat.stringifyArray(e));
		}else{
			result.push(e);
		};
	});
	return result;
}
documentFormat.toJSON = function(){
//console.log('DFtoJSON');
	return {
		"FormatName"       :this.FormatName,
		"TemplateImage"    :this.TemplateImage,
		"WorkTitleLogo"    :this.WorkTitleLogo,
		"HeaderMarginTop"  :Math.round(this.HeaderMarginTop.as(this.CellWidthUnit)*100)/100,
		"HeaderMarginLeft" :Math.round(this.HeaderMarginLeft.as(this.CellWidthUnit)*100)/100,
		"HeaderBoxHeight"  :Math.round(this.HeaderBoxHeight.as(this.CellWidthUnit)*100)/100,
		"headerItemOrder"  :documentFormat.stringifyArray(this.headerItemOrder),

		"HeaderSign"       :documentFormat.stringifyArray(this.HeaderSign),
		"HeaderNote"       :documentFormat.stringifyArray(this.HeaderNote),

		"SheetTextColor"   :this.SheetTextColor,
		"SheetBaseColor"   :this.SheetBaseColor,
		"AppBaseColor"     :this.AppBaseColor,
		"SelectedColor"    :this.SelectedColor,
		"RapidModeColor"   :this.RapidModeColor,
		"FloatModeColor"   :this.FloatModeColor,
		"SectionModeColor" :this.SectionModeColor,
		"SelectionColor"   :this.SelectionColor,
		"FootStampColor"   :this.FootStampColor,
		"EditingColor"     :this.EditingColor,
		"SelectingColor"   :this.SelectingColor,
		"Restriction"      :this.Restriction,
		"ViewMode"         :this.ViewMode,
		"PageLength"       :this.PageLength,
		"FrameRate"        :this.FrameRate.toString(),
		"SheetColumn"      :this.SheetColumn,
		"CellWidthUnit"        :this.CellWidthUnit,
		"SheetHeadMargin"      :Math.round(this.SheetHeadMargin.as(this.CellWidthUnit)*100)/100,
		"SheetLeftMargin"      :Math.round(this.SheetLeftMargin.as(this.CellWidthUnit)*100)/100,
		"SheetCellHeight"      :Math.round(this.SheetCellHeight.as(this.CellWidthUnit)*100)/100,
		"SheetColHeight"       :Math.round(this.SheetColHeight.as(this.CellWidthUnit)*100)/100,
		"TimeGuideWidth"       :Math.round(this.TimeGuideWidth.as(this.CellWidthUnit)*100)/100,
		"ActionWidth"          :Math.round(this.ActionWidth.as(this.CellWidthUnit)*100)/100,
		"DialogWidth"          :Math.round(this.DialogWidth.as(this.CellWidthUnit)*100)/100,
		"SoundWidth"           :Math.round(this.SoundWidth.as(this.CellWidthUnit)*100)/100,
		"SheetCellWidth"       :Math.round(this.SheetCellWidth.as(this.CellWidthUnit)*100)/100,
		"SheetCellNarrow"      :Math.round(this.SheetCellNarrow.as(this.CellWidthUnit)*100)/100,
		"StillCellWidth"       :Math.round(this.StillCellWidth.as(this.CellWidthUnit)*100)/100,
		"GeometryCellWidth"    :Math.round(this.GeometryCellWidth.as(this.CellWidthUnit)*100)/100,
		"SfxCellWidth"         :Math.round(this.SfxCellWidth.as(this.CellWidthUnit)*100)/100,
		"CameraCellWidth"      :Math.round(this.CameraCellWidth.as(this.CellWidthUnit)*100)/100,
		"CommentWidth"         :Math.round(this.CommentWidth.as(this.CellWidthUnit)*100)/100,
		"TrackNoteWidth"       :Math.round(this.TrackNoteWidth.as(this.CellWidthUnit)*100)/100,
		"ColumnSeparatorWidth" :Math.round(this.ColumnSeparatorWidth.as(this.CellWidthUnit)*100)/100,
		"trackSpec"            :Array.from(this.trackSpec)
	};
}
/*
	出力
*/
documentFormat.toString = function toString(){
	var result = JSON.stringify(this,null,2);
	result = result.replace(/\n\s{6}/g,'').replace(/\n\s{4}\]/g,"\]");
	return result;
}
/**
 *	フォーマットエディタデータ初期化
 *	呼び出しを受けた際に初期化を行う
 *	アクティブフラグが下がっていたら上げる
 *	documentFormat.startupから呼ばれることが前提のエディタUI初期化手続き
 *	外部からのsheetLooksで入れ替えの際は 以下のように操作する
 *		documentFormat.parse(sheetLooks,documentFormat.initEditor);
 *	現在のXPSと同期する場合は以下
 *		documentFormat.parse(xUI.XPS.sheetLooks,documentFormat.initEditor); 
 */
	documentFormat.initEditor = function initFormatEdit(){
console.log('initEditor');
//パラメータ再初期化
		documentFormat.active       = true;
		documentFormat.moveBox      = '';
		documentFormat.onResize     = false;
		documentFormat.tga          = null;
		documentFormat.dragItem     = null;
		documentFormat.dragAction   = null;

//参照が切れていた場合復帰しておく
		if(! documentFormat.img) documentFormat.img = document.getElementById('pageImage-1');//要素自体を参照用に設定
		if(
			(documentFormat.TemplateImage.match(/^data:image\/(gif|jpeg|png|webp)\;base64\,[0-9a-zA-Z+/]*={0,2}$/))||
			(documentFormat.TemplateImage.match(nas.Image.allowImgExtensions))
		){
//data-URL | path url
			documentFormat.importData(documentFormat.TemplateImage);
		};
//フレームレートコンバート
		documentFormat.FrameRate = new nas.Framerate(documentFormat.FrameRate);
//documentFormatのデータからUIに初期値を引き写し
		document.getElementById("docFormatName").value      = documentFormat.FormatName;
		document.getElementById("docPageLength").value      = nas.Frm2FCT(nas.FCT2Frm(documentFormat.PageLength),3);
		document.getElementById("docFrameRate").value       = documentFormat.FrameRate.rate;
		document.getElementById("docColumn").checked        = (documentFormat.SheetColumn == 2)? true:false;
		document.getElementById("docMarginLeft").value      = Math.round(100 * documentFormat.SheetLeftMargin.as("mm"))/100;
		document.getElementById("docMarginTop").value       = Math.round(100 * documentFormat.SheetHeadMargin.as("mm"))/100;
		document.getElementById("docSheetColHeight").value  = Math.round(100 * documentFormat.SheetColHeight.as("mm"))/100;
//選択リストを更新
		documentFormat.updateFormatList();

//UI上はカラム幅を指定するので加算して表示
		var colSpan = 0;
		documentFormat.trackSpec.forEach(function(e){ console.log(e);colSpan += (e[2] != 'hide')? documentFormat[documentFormat.itemWidth[e[0]]].as("mm") * e[1]:0;});
		colSpan += documentFormat.ColumnSeparatorWidth.as("mm");
		document.getElementById("docColumnSpan").value       = Math.round(100 * colSpan)/100;
//テキスト要素・値が URL|ローカルパスの場合はそのまま表示する dataURLの場合は画像が登録されている旨を表示
//クリックでの指定時は、隠し状態のFile要素を呼び出す
		document.getElementById("docFormatTemplateImage").value = (String(documentFormat.TemplateImage).match(/^data:image\/(gif|jpeg|png|webp)\;base64\,[0-9a-zA-Z+/]*={0,2}$/))?
		"[画像データが登録されています]":documentFormat.TemplateImage;

//カラーをUIに転記
		for(var prp in documentFormat.colorTable){
			var elm = document.getElementById(prp);
			if(elm) elm.value = documentFormat[documentFormat.colorTable[prp]];
		};
//resetSheet trackSpecに従った空シートを表示
		xUI.resetSheet(
			new Xps(
				documentFormat.trackSpec,
				documentFormat.PageLength
			),
			new Xps(
				documentFormat.trackSpec.find(function(e){return((e[0]=='reference')||(e[0]=='replacement'))})[1],
				documentFormat.PageLength
			)
		);
//append headerinf
		document.getElementById('sheet_body').append(documentFormat.headerinf);
		document.getElementById('sheet_body').append(documentFormat.signatures);
		document.getElementById('sheet_body').append(documentFormat.notetext);
//append orderbox
		document.getElementById('sheet_body').append(documentFormat.orderbox);
		documentFormat.drawArea();
		$(documentFormat.orderbox).show();
		$(documentFormat.headerinf).show();
		$(documentFormat.signatures).show();
		$(documentFormat.notetext).show();

		documentFormat.syncArea();
		$('#orderbox').css({'z-index':3,'mix-blend-mode':'difference'});
		documentFormat.active = true;
	xUI.XPS.parseSheetLooks(documentFormat.toJSON());
//		xUI.XPS.init();
//		xUI.applySheetlooks(documentFormat.toJSON(documentFormat));
		xUI.applySheetCellHeight();
		xUI.applySheetTrackWidth();

//		xUI.setAppearance();
		xUI.applySheetMargin(true);
	xUI.applySheetHeader(documentFormat.toJSON(documentFormat))
		documentFormat.adjustBoxWidth();
		documentFormat.adjustBoxHeight();
		documentFormat.adjustBoxPos();

//		xUI.apply

		xUI.applySheetlooks(JSON.stringify(documentFormat));
		documentFormat.previewSheetColor();
console.log('endStartup')
	};
/**
 *	フォーマット編集状態を再初期化(バックアップの状態に戻す)
 *	編集状態の遷移なし
 *	UNDOなし
 */
	documentFormat.reset = function resetFormatEditor(){
		if(! documentFormat.active) return;
		var xpsBackup = new Xps();
		xpsBackup.parseXps(documentFormat.backup);
		this.parse(JSON.stringify(xpsBackup.sheetLooks),documentFormat.initEditor);

//		xUI.applySheetCellHeight();
//		xUI.applySheetTrackWidth();
//		xUI.setAppearance();
	}
/**
	現在編集中の書式をドキュメントに適用する
	バックアップの復帰は行われない
	必要があれば事前バックアップを復帰後にこの手順をコール
	その場合アプリのUNDOは機能しない
*/
documentFormat.apply = function(sheetlooks){
	if(typeof sheetlooks != 'undefined'){
		documentFormat.parse(sheetlooks);
	};
	if(documentFormat.active){
//書式適用
//あらかじめxUI.XPSに現在のsheetLooksを適用してエディタを再初期化
		xUI.XPS.parseSheetLooks(documentFormat.toJSON());//
		xUI.resetSheet(undefined,undefined,function(){
			xUI.applySheetlooks();
//以下はapplySheetlooksに含まれる
//			xUI.applySheetCellHeight();
//			xUI.applySheetTrackWidth();
			documentFormat.adjustBoxWidth();
			documentFormat.adjustBoxHeight();
			documentFormat.adjustBoxPos();
			documentFormat.restoreOrderbox();
//			documentFormat.initEditor();//再初期化
		});

//		xUI.applySheetlooks(JSON.stringify(documentFormat));
//		documentFormat.previewSheetColor();

	}else{
//undoが可能なように新たな書式データを適用したXpsをput
		var newData = new Xps();
		newData.parseXps(xUI.XPS.toString(false));
		newData.parseSheetLooks(documentFormat.toJSON());
console.log(newData);
alert(newData.sheetLooks.FormatName);
		xUI.put(newData,undefined,xUI.applySheetlooks());
	};
}
/**
 *	バックアップを復帰してフォーマット編集状態を終了
 *	その後書式適用を行う
 */
	documentFormat.close = function exitFormatEdit(apply){
		documentFormat.active = false;
		$('#orderbox').hide();
//restore backup data
		xUI.XPS.parseXps(documentFormat.backup);
		xUI.setDocumentMode(xUI.XPS.documentMode);
		xUI.referenceXPS.parseXps(documentFormat.backupRef);
		if(apply){
//undoが可能な様に新たな書式データを適用したXpsをput
			var newData = new Xps(documentFormat.trackSpec);
			newData.parseXps(xUI.XPS.toString(false));
			newData.parseSheetLooks(documentFormat.toJSON());
			xUI.put(newData);
//			xUI.applySheetlooks(newData.sheetLooks);
//			xUI.resetSheet();
		}else{
			xUI.resetSheet()
		}
		return;
	};
/**
 *	バックアップを復帰してフォーマット編集状態を終了
 *	書式の適用は行われない
 *	適用は別処理でレストア後に行う
 */
	documentFormat.restore = function exit_FormatEdit(){
		documentFormat.active = false;
		$('#orderbox').hide();

		xUI.XPS.parseXps(documentFormat.backup);
		xUI.setDocumentMode(xUI.XPS.documentMode);
		xUI.referenceXPS.parseXps(documentFormat.backupRef);
		xUI.resetSheet
		xUI.selectCell(documentFormat.bkupSelection[0]);
		xUI.selection(add(documentFormat.bkupSelection[0],documentFormat.bkupSelection[1]));
//		documentFormat.apply();
		return ;
	};
/* orderbox キー入力ハンドラ
			case 37://left
			case 38://up
			case 39://right
			case 40://down
*/
	documentFormat.kbHandle = function kbHandle(e){
console.log('kbHandle');
console.log(documentFormat.moveBox,documentFormat.onResize);
		if(!(documentFormat.active)) return false;
		if(e.target instanceof HTMLInputElement) return true;
		var trackItem = null;
		if(documentFormat.moveBox) trackItem = document.getElementById(documentFormat.moveBox);
		if(e.type == 'keydown'){
			if((documentFormat.moveBox)){e.preventDefault();e.stopPropagation();}
		}else if(e.type == 'keyup'){
			var shiftX = 0;var shiftY = 0;
			if((e.keyCode==37)||(e.keyCode==39)){
				shiftX = e.keyCode - 38;
			};
			if((e.keyCode==38)||(e.keyCode==40)){
				shiftY = e.keyCode - 39;
			};
			if(documentFormat.onResize){
//リサイズ・テキストボックスの値を 0.2646mm(約1px/96ppi)単位で増減
				if((e.keyCode==37)||(e.keyCode==39)){
//左右キー
					if(documentFormat.moveBox == 'orderbox' ){
//ボックス全体
						document.getElementById('docColumnSpan').value = parseFloat(document.getElementById('docColumnSpan').value)+(shiftX * 0.2646);
						document.getElementById('docColumnSpan').onchange({target:document.getElementById('docColumnSpan')});
						return;
					}else if(documentFormat.moveBox.indexOf('orderbox_') == 0 ){
//トラックエリアの幅を増減
//						documentFormat.onResize.style.width = 
						trackItem.style.width = (parseFloat(trackItem.offsetWidth) + shiftX)+ 'px';//X
						documentFormat.boxWidthResize({target:trackItem});
					};
				}else if((e.keyCode==38)||(e.keyCode==40)){
//全体高さ
					document.getElementById('docSheetColHeight').value = parseFloat(document.getElementById('docSheetColHeight').value)+(shiftY * 0.2646);
					document.getElementById('docSheetColHeight').onchange({target:document.getElementById('docSheetColHeight')});
					return;
				};
			}else{
//移動
				if(documentFormat.moveBox == 'orderbox' ){
					if((e.keyCode==37)||(e.keyCode==39)){
						document.getElementById('docMarginLeft').value = parseFloat(document.getElementById('docMarginLeft').value)+(shiftX * 0.2646);
						document.getElementById('docMarginLeft').onchange({target:document.getElementById('docMarginLeft')});
					}else if((e.keyCode==38)||(e.keyCode==40)){
						document.getElementById('docMarginTop').value = parseFloat(document.getElementById('docMarginTop').value)+(shiftY * 0.2646);
						document.getElementById('docMarginTop').onchange({target:document.getElementById('docMarginTop')});
					};
				};
				documentFormat.adjustBoxPos();
			};
		};
	}
/**
	@params {String} controllTarget
	@params {String} action
	編集ステータス(フォーカス)を設定
		controllTarget orderbox|headerinf|signatures|notetext
		action : resize|move
*/
	documentFormat.setStatus = function(controllTarget,action){
		if(typeof controllTarget == 'undefined'){
			controllTarget = documentFormat.moveBox;
		};
		if(typeof action == 'undefined'){
			action = (documentFormat.onResize)? 'resize':'move';
		};
		documentFormat.moveBox  = controllTarget;
		documentFormat.onResize = (action == 'resize')?true:false;
		if(documentFormat.onResize){
//リサイズモード
			$('#docFormatStatas').removeClass('iconButton-move').addClass('iconButton-resize');
			document.getElementsByClassName('sheet')[0].style.cursor = '';
		}else{
//ボックスムーブ
			$('#docFormatStatas').removeClass('iconButton-resize').addClass('iconButton-move');
			document.getElementsByClassName('sheet')[0].style.cursor = 'move';
		};
	}
/*	データファイルインポートハンドラ	
	@params {Object HTMLInputElement|dataTransfer} ipt
	FileReaderを初期化するためのFilesプロパティを持ったオブジェクトを与える
	画像とJSONの切り分けはこのメソッドで行う

	画像の場合はTemplateImageのみを設定する

TemplateImageプロパティ自体は、url|ローカルパス|dataURL

fileの読出し・登録の時点でdataURLに変換が行われる

テキストは
dataURLの場合、パス表示なし"[画像データが登録されています]"
有効なurlの場合、（/^(https?|file)\:\/\/.*\.(png|webp|gif|jpeg)$/) のみ、文字列のままソースパスとして扱う

*/
	documentFormat.importData = function importData(ipt){
		if((ipt.files)&&(ipt.files.length)){
			if(ipt.files[0].name.match(/\.json$/i)){
console.log('JSON.load ' + ipt.files[0].name);
				var reader = new FileReader();
				reader.addEventListener('load',function(e){
					documentFormat.parse(reader.result);
				});
				reader.readAsText(ipt.files[0],"utf8");
			}else if(ipt.files[0].name.match(nas.Image.allowImgExtensions)){
console.log('image load ' + ipt.files[0].name);
				if((TgaLoader)&&(ipt.files[0].name.match(/\.tga$/i))){
//TGA HTMLFileあり
					ipt.files[0].arrayBuffer().then(function(result){
						let tga = new TgaLoader();
						tga.load(new Uint8Array(result));
						let imgsrc  = tga.getDataURL('image/png');
						documentFormat.img.src = imgsrc;
						documentFormat.img.id  = 'pageImage-1';
						documentFormat.TemplateImage = imgsrc;
						documentFormat.img.addEventListener('load',()=> documentFormat.guessImageResolution(),{once:true});
					});
				}else if((sharp)&&(ipt.files[0].name.match(/\.(tif|tiff)$/i))){
				}else if((PSD)&&(ipt.files[0].name.match(/\.(psd|pdb)$/i))){
// load from File
					ipt.files[0].arrayBuffer().then(function(result){
						var psd = new PSD(new Uint8Array(result));
						psd.parse();
						let imgsrc = psd.image.toPng().src;
						documentFormat.img.src = imgsrc;
						documentFormat.img.id  = 'pageImage-1';
						documentFormat.TemplateImage = imgsrc;
						documentFormat.img.addEventListener('load',()=> documentFormat.guessImageResolution(),{once:true});
					},function(err){
						console.log(err);
					}).catch(function(err){
						console.log(err);
					});
				}else{
					var reader = new FileReader();
					reader.addEventListener('load',function(e){
						documentFormat.img.src = reader.result;
						documentFormat.img.id  = 'pageImage-1';
						documentFormat.TemplateImage = reader.result;
						documentFormat.img.addEventListener('load',()=> documentFormat.guessImageResolution(),{once:true});
					});
					reader.readAsDataURL(ipt.files[0]);
				};
			};
		}else if((typeof ipt == 'string')&&(ipt.match(nas.Image.allowImgExtensions))){
console.log('image path :'+ ipt);
			documentFormat.TemplateImage = ipt;
			if(ipt.match(/\.(png|jpg|jpeg|pjpeg|gif|webp|svg)$/i)){
				documentFormat.img.src = ipt;
				documentFormat.img.id  = 'pageImage-1';
				documentFormat.TemplateImage = ipt;
				documentFormat.img.addEventListener('load',()=> documentFormat.guessImageResolution(),{once:true});
			}else if(ipt.match(/\.(tga|targa)$/i)){
console.log('TGA fined');
			}else if(ipt.match(/\.(psd|psb)$/i)){
console.log('PSD find');
			}else if(ipt.match(/\.(tif|tiff)$/i)){
console.log('TIFF not suported');
				
			}
		}else if((typeof ipt == 'string')&&(ipt.match(/^data:image\/(gif|jpeg|png|webp)\;base64\,[0-9a-zA-Z+/]*={0,2}$/))){
console.log('DATA-URL find');
				documentFormat.img.src = ipt;
				documentFormat.img.id  = 'pageImage-1';
				documentFormat.TemplateImage = ipt;
				documentFormat.img.addEventListener('load',()=> documentFormat.guessImageResolution(),{once:true});
		};
	}
/*	画像データの解像度を推定して調整を行う nas.NoteImage のクラスメソッドを使用*/
	documentFormat.guessImageResolution = function(){
		var resolution = nas.NoteImage.guessDocumentResolution(this.img,'297mm');
		if(documentFormat.orderbox.parentNode){
			document.getElementById('docResolution').value = resolution;
//			document.getElementById('docResolution').onchange({target:document.getElementById('docResolution')});
			document.getElementById('docFormatTemplateImage').value = (String(documentFormat.TemplateImage).match(/^data:image\/(gif|jpeg|png|webp)\;base64\,[0-9a-zA-Z+/]*={0,2}$/))?
		"[画像データが登録されています]":documentFormat.TemplateImage;

		};
		return resolution;
	}
/**
 *	@params  {String|Object sheetLooks} sheetlooks
 *	@params  {Function}	callback
 *	外部からデータを与えて設定する 通常は再初期化が必要だがここでは再初期化の自動実行はされない
 *	引数はJSON文字列でもオブジェクトでも良い
 */
	documentFormat.parse = function parse(sheetlooks,callback){
		try{
			if((typeof sheetlooks == 'string')&&(sheetlooks.match(/.*(\{[\s\S]*?\})/)))
				sheetlooks = JSON.parse(RegExp.$1);
			var unit = (sheetlooks["CellWidthUnit"])? sheetlooks["CellWidthUnit"]:'px';
			for(var prp in sheetlooks){
				if(prp == 'trackSpec'){
					this[prp] = Array.from(sheetlooks[prp]);
				}else if(prp == 'headerItemOrder'){
//page header items 要素数固定なので上書き
					for (var ix = 0;ix < this[prp].length ;ix ++){
						this[prp][ix][0] = sheetlooks[prp][ix][0];
						this[prp][ix][1].setValue(sheetlooks[prp][ix][1]+unit,'mm'); 
						this[prp][ix][2] = sheetlooks[prp][ix][2];
					};
				}else if(this[prp] instanceof Array){
//boundingbox array
					for (var ix = 0;ix < this[prp].length ;ix ++){
						this[prp][ix].setValue(sheetlooks[prp][ix]+unit,'mm'); 
					};
				}else if(prp == 'TemplateImage'){
					documentFormat.importData(sheetlooks[prp]);
				}else if(this[prp]){
					if(this[prp] instanceof nas.UnitValue){
						this[prp].setValue(sheetlooks[prp]+unit,'mm');
					}else if(this[prp].setValue instanceof Function){
						this[prp].setValue(sheetlooks[prp]);
					}else if(this[prp].parse instanceof Function){
						this[prp].parse(sheetlooks[prp]);
					}else{
						this[prp] = sheetlooks[prp];
					};
				};//本体に存在しないプロパティはスキップ
			};
console.log(JSON.stringify(this,null,2));
			documentFormat.modified = false;//読み出し直後のリセット
			documentFormat.baseFormatName = documentFormat.FormatName;//複製
			if(documentFormat.active) documentFormat.initEditor();//非アクテイブの場合エディタの立ち上げ操作は行わない
			if(callback instanceof Function) callback();
			return true;
		} catch(err){
			console.log(err);
			return false;
		};
	}
/**
 * 現在のsheetLooksからUIを初期化（再描画）
 *	仮のtrackSpecを持ったXPSを与えて再描画を行う　
 */
	documentFormat.drawArea = function drawArea(){
//pageheader+sheetheader
		var headerinf = document.getElementById('header_item_list');
		var headerbox = document.getElementById('headerinf');
		headerinf.innerHTML = '' ;//UIクリア
		headerbox.innerHTML  = '' ;//
		var itmindex = 0
		documentFormat.headerItemOrder.forEach(function(e){
			var item       = e[0];
			var itemWidth  = e[1];
			var hide       = (e[2]=='')? false:true;
			var itemCode   = item.toUpperCase();
			var boxSource  = '.';//itemCode+'.';
//			boxSource += "<br><input id=header_itm_ipt_"+itmindex+" class=orderbox-input type=text size=2 onchange='documentFormat.checkUIValue(event)'>";
			var htmlSource = "";
			htmlSource += "<label for=header_itm_ckb_"+ itmindex +"> "+itemCode+": </label><input type = checkbox id=header_itm_ckb_"+itmindex+((hide)?" ":" checked")+" onchange='documentFormat.checkUIValue(event);'> <input type=text id=header_itm_ipt_"+itmindex+" size=5 class=itminfo_ipt onchange='documentFormat.checkUIValue(event)'> mm ";//value="+itemWidth+"
// panel item
			var itminfo = headerinf.appendChild(document.createElement('span'));
			itminfo.id          = 'header_itm_'+item;//text. not number
			itminfo.className   = 'iteminfo';
			itminfo.innerHTML   = htmlSource;
			itminfo.draggable   = true;
			itminfo.addEventListener('dragstart',function(e){
				documentFormat.dragAction = 'reorder-headerItem';//moveアクションはremoveを含む　ターゲットidが負数の場合は削除を行う
				documentFormat.dragItem = event.target.id;//移動ターゲットIDを設定する
				event.dataTransfer.setData('text/plain', item);
			},false);
			itminfo.addEventListener('dragover',function(e){
				nas.HTML.addClass(this,'iteminfo_dragover');
			},false);
			itminfo.addEventListener('dragleave',function(e){
				nas.HTML.removeClass(this,'iteminfo_dragover');
				event.preventDefault();
			},false);
// headerinf overlay UI
			var itmbox = documentFormat.headerinf.appendChild(document.createElement('div'));
			itmbox.id          = 'headerbox_'+item;
			itmbox.className   = 'guide-'+item+" orderbox";
			itmbox.innerHTML   = boxSource;
			itmbox.addEventListener('mouseup',function(e){
//				documentFormat.onResize  = false;//documentFormat.orderbox;
				documentFormat.moveBox   = (documentFormat.onResize)? e.target.id:'headerbox';
				documentFormat.setStatus();
			});
			itmindex ++;
		});
//orderbox
		var orderinfo = document.getElementById('orderinfo');
		var orderbox  = document.getElementById('orderbox');
		orderinfo.innerHTML = '' ;//UIクリア
		orderbox.innerHTML  = '' ;//
		var itmindex = 0;
		documentFormat.trackSpec.forEach(function(e){
			var areaOption = e[0];
			var areaCount  = parseInt(e[1]);
			var areaChecked  = (e[2]=='')? false:true;
			var areaCode   = documentFormat.columnOptionCode[areaOption];
			var boxSource  = areaCode;
			var htmlSource = "";
			if(areaOption.match(/comment/)){
				htmlSource += "<label for=itminfo_ckb_"+ itmindex +"> "+areaCode+" </label><input type = checkbox id=itminfo_ckb_"+itmindex+((areaChecked)?" ":" checked")+" onchange='documentFormat.checkUIValue(event);'> <input type=text id=itminfo_ipt_"+itmindex+" size=5 class=itminfo_ipt onmousedown=\"nas.sliderVALUE([event,this.id,'16','2','2']);\" onchange='documentFormat.checkUIValue(event)'> mm ";//value="+trackWidth+"
			}else{
				htmlSource += "<label for=itminfo_lkb_"+ itmindex +"> "+areaCode+" </label><input type = button id=itminfo_lkb_"+itmindex+((areaChecked)?" checked":" ")+" onclick='documentFormat.checkUIValue(event);' value = 'lock'> <input type = text id=itminfo_ipt_"+itmindex+" size=5 class=itminfo_ipt onmousedown=\"nas.sliderVALUE([event,this.id,'16','2','2']);\" onchange='documentFormat.checkUIValue(event)'> mm";
//value="+trackWidth+" 
				if(areaOption != 'timecode')
				boxSource += "<br><input id=orderbox_ipt_"+itmindex+" class=orderbox-input type=text size=2 onchange='documentFormat.checkUIValue(event)'>";
//value=" + areaCount + "
			};
			var itminfo = orderinfo.appendChild(document.createElement('span'));
			itminfo.id          = 'itminfo_'+itmindex;
			itminfo.className   = 'info-'+areaOption+" iteminfo";
			itminfo.innerHTML   = htmlSource;
			itminfo.draggable   = true;
			itminfo.addEventListener('dragstart',function(e){
				documentFormat.dragAction = 'move';//moveアクションはremoveを含む　ターゲットidが負数の場合は削除を行う
				documentFormat.dragItem = event.target.id.split('_').reverse()[0];//移動ターゲットIDを設定する
				event.dataTransfer.setData('text/plain', documentFormat.trackSpec[event.target.id.split('_').reverse()[0]][0]);
			},false);
			itminfo.addEventListener('dragover',function(e){
				nas.HTML.addClass(this,'iteminfo_dragover');
			},false);
			itminfo.addEventListener('dragleave',function(e){
				nas.HTML.removeClass(this,'iteminfo_dragover');
				event.preventDefault();
			},false);
			var itmbox  = orderbox.appendChild(document.createElement('div'));
			itmbox.id          = 'orderbox_'+itmindex;
			itmbox.className   = 'guide-'+areaOption+" orderbox";
			itmbox.innerHTML   = boxSource;
			itmbox.addEventListener('pointerup',function(e){
//				documentFormat.onResize  = false;//documentFormat.orderbox;
				documentFormat.moveBox   = (documentFormat.onResize)?e.target.id:'orderbox';
				documentFormat.setStatus();
			});
			itmindex ++;
		});
	}
/*現在のtrackspecからUIの状態を更新*/
	documentFormat.syncArea = function syncArea(){
//pageheader 更新
		documentFormat.headerinf.style.left   = documentFormat.HeaderMarginLeft.as('px') + 'px';
		documentFormat.headerinf.style.top    = documentFormat.HeaderMarginTop.as('px')  + 'px';
		documentFormat.headerinf.style.height = documentFormat.HeaderBoxHeight.as('px')  + 'px';
		var boxWidth = 0;
		documentFormat.headerItemOrder.forEach(function(e){
			boxWidth += (e[2])? 0 : e[1].as('px');
			document.getElementById('headerbox_'+e[0]).style.width = (e[1].as('px')-1) + 'px';
		});
		documentFormat.headerinf.style.width  = (parseInt(boxWidth)+1) + 'px';
//input-value
		var pgHeader = {
			'headerMarginLeft':'HeaderMarginLeft',
			'headerMarginTop' :'HeaderMarginTop',
			'headerBoxHeight': 'HeaderBoxHeight'
		};
		for (var prp in pgHeader){
			if(document.getElementById(prp))
			document.getElementById(prp).value = Math.round(100 * documentFormat[pgHeader[prp]].as('mm'))/100;
		};
//signatures
		documentFormat.signatures.style.left   = documentFormat.HeaderSign[0].as('px') + 'px';
		documentFormat.signatures.style.top    = documentFormat.HeaderSign[1].as('px') + 'px';
		documentFormat.signatures.style.height = (documentFormat.HeaderSign[3].as('px') - documentFormat.HeaderSign[1].as('px')) + 'px';
		documentFormat.signatures.style.width  = (documentFormat.HeaderSign[2].as('px') - documentFormat.HeaderSign[0].as('px')) + 'px';

		var ids = ["signBoxLeft","signBoxTop","signBoxRight","signBoxBottom"];
		for (var i = 0 ; i < ids.length ; i++){
			document.getElementById(ids[i]).value = Math.round(100 * documentFormat.HeaderSign[i].as('mm'))/100;
		};
//notetext
		documentFormat.notetext.style.left   = documentFormat.HeaderNote[0].as('px') + 'px';
		documentFormat.notetext.style.top    = documentFormat.HeaderNote[1].as('px') + 'px';
		documentFormat.notetext.style.height = (documentFormat.HeaderNote[3].as('px') - documentFormat.HeaderNote[1].as('px')) + 'px';
		documentFormat.notetext.style.width  = (documentFormat.HeaderNote[2].as('px') - documentFormat.HeaderNote[0].as('px')) + 'px';

		var ids = ["noteAreaLeft","noteAreaTop","noteAreaRight","noteAreaBottom"];
		for (var i = 0 ; i < ids.length ; i++){
			document.getElementById(ids[i]).value = Math.round(100 * documentFormat.HeaderNote[i].as('mm'))/100;
		};
//
		var itmindex = 0
		documentFormat.headerItemOrder.forEach(function(e){
			var item = e[0];
			var itemWidth = Math.round(100 * e[1].as('mm'))/100;//px e[1];//UnitValue
			var hide = (e[2]=='hide')? true:false;
			if(document.getElementById('header_itm_ckb_'+itmindex)){
				if(hide){
					document.getElementById('header_itm_ckb_'+itmindex).checked = false ;
					$('#headerbox_'+item).hide();
				}else{
					document.getElementById('header_itm_ckb_'+itmindex).checked = true ;
					$('#headerbox_'+item).show();
				};
			};
			document.getElementById('header_itm_ipt_'+itmindex).value = itemWidth;//テキストボックス更新
			document.getElementById('headerbox_'+item).style.width = (e[1].as('px') - 1) + 'px';//headeritem幅再設定
//			if(document.getElementById('header_itm_'+itmindex)) document.getElementById('header_itm_'+itmindex).value = areaCount;//テキスト更新
			itmindex ++;
		});

//orderbox配置更新
		documentFormat.orderbox.style.left   = documentFormat.SheetLeftMargin.as('px') + 1 +'px';
		documentFormat.orderbox.style.top    = documentFormat.SheetHeadMargin.as('px') + 1 +'px';
		documentFormat.orderbox.style.height = documentFormat.SheetColHeight.as('px')  - 2 +'px';

		itmindex = 0;
//トラックアエリアのUI更新・数値と幅
		var span = documentFormat.ColumnSeparatorWidth.as('px'); // セパレータ間隔//ボックス全幅(px)

		documentFormat.trackSpec.forEach(function(e){
			var areaOption = e[0];
			var areaCount  = parseInt(e[1]);
			var areaChecked = ((e[2])&&(e[2]=='hide'))? true:false;
			var areaFixed   = ((e[2])&&(e[2]=='fix'))?  true:false;
			var areaCode   = documentFormat.columnOptionCode[areaOption];
			var areaWidth  = areaCount * documentFormat[documentFormat.itemWidth[areaOption]].as('px');//as px
			span += (! areaChecked)? areaWidth:0;

			var trackWidth = Math.round(100 * documentFormat[documentFormat.itemWidth[areaOption]].as('mm'))/100;//as mm
			if(document.getElementById('itminfo_ckb_'+itmindex)){
				if(areaChecked){
					document.getElementById('itminfo_ckb_'+itmindex).checked = false ;
					$('#orderbox_'+itmindex).hide();
				}else{
					document.getElementById('itminfo_ckb_'+itmindex).checked = true ;
					$('#orderbox_'+itmindex).show();
				};
			};
			if(areaFixed){
				nas.HTML.addClass(document.getElementById('orderbox_'+itmindex),'orderbox-fixed');
			}else{
				nas.HTML.removeClass(document.getElementById('orderbox_'+itmindex),'orderbox-fixed');
			};

			document.getElementById('itminfo_ipt_'+itmindex).value    = trackWidth;//テキストボックス更新
			document.getElementById('orderbox_'+itmindex).style.width = (areaWidth - 1) + 'px';//orderbox幅再設定
			if(document.getElementById('orderbox_ipt_'+itmindex)) document.getElementById('orderbox_ipt_'+itmindex).value = areaCount;//テキスト更新
			itmindex ++;
		});
//ボックス全幅の更新
		documentFormat.orderbox.style.width  = span - 2 +'px';
	}
/*
	Area トラックエリアの定義
	同種のタイムライントラックを合わせた範囲を「トラックエリア」とする
	かっこで囲まれたエリアは予約エリアで位置と数に制限がある
	timecode
		可読性向上のために表示されるTCを表示するエリア
		1エリア1トラックに限定
		xpsTracks上にエントリはない（trackspec上のみにある）
		シートに1エリア以上を任意位置に設定可能
	reference
		以前の作業を参照するための表示エリア
		トラック数は表示するデータに依存
		trackspec上はデフォルト値が設定される
		xps上には記載されない（trackspec上のみにある）
		シートに1エリアのみ設定可
		削除不可
	comment
		注釈テキストを兼ねたレコード終端フィールド
		1エリア1トラックに限定
		xps|tracksepc上に記載されなくても良い
		シートのレコード終端に1エリアのみ設定可
		削除不能（不足時は補われる）
	tracknote (＊新)
		任意位置に設定可能な注釈テキストエリア
		エリア内のトラック数は任意
	cell
		任意位置に設定可能な置換え情報トラックのためのエリア
		エリア内のトラック数は１以上任意
		（最後のエリアは削除できない）
	dialog
		任意位置に設定可能な台詞情報トラックのためのエリア
		エリア内のトラック数は１以上任意
		（最後のエリアは削除できない）
		xps上の配置が第２レコードに予約されているのでこの配置は変更できない
	sound
		任意位置に設定可能な音響情報トラックのためのエリア
		エリア内のトラック数は任意
		ダイアログエリアと交換することが可能
		その場合はダイアログエリアの制限を受ける
	camera
		任意位置に設定可能な撮影指定情報トラックのためのエリア
		エリア内のトラック数は任意
	composite
		任意位置に設定可能な合成情報トラックのためのエリア
		エリア内のトラック数は任意
	stagework
		任意位置に設定可能なステージワーク情報トラックのためのエリア
		エリア内のトラック数は任意
*/
	
	
/**
	@params	{Number Int}	idx
	@params {Number Int}	idd
 エリア移動
	指定idのトラックアエリアを、指定の位置へ移動する
	位置指定は新規の整数id
	移動前と移動後のidが同一の場合は処理されない
	リファレンスアリア・トラックコレクション冒頭のダイアログエリア及び末尾のコメントエリアは移動できない
 */
	documentFormat.moveArea = function moveArea(idx,idd){
console.log('====== MOVE')
		if(
			(idx >= (documentFormat.trackSpec.length-1))||
			(idx == idd)||
			(idd - idx == 1)
		) return false;
		if(idd < 0) documentFormat.removeArea(idx);
		if(idx < idd) idd --;
		var mvitm = documentFormat.trackSpec.splice(idx,1)[0];
		documentFormat.trackSpec.splice(idd,0,mvitm);
		documentFormat.drawArea();documentFormat.syncArea();
		return idd;
	}
/* エリア削除
	指定idのトラックアエリアを削除する
	
	.リファレンスアリア
	.トラックコレクション冒頭のダイアログエリア
	.末尾のコメントエリア
	.セルエリア
	.ページヘッダーアイテム
	は削除できない
 */
	documentFormat.removeArea = function removeArea(idx){
		var result = null;
		if(
			(idx.indexOf('header_itm_') == 0)||
			(documentFormat.trackSpec[idx][0].match(/reference|comment/))||
			(
				(documentFormat.trackSpec[idx][0].match(/dialog|cell|replacement|timing/))&&
				(documentFormat.trackSpec.filter(function(e){return (documentFormat.columnOptionCode[e[0]] == documentFormat.columnOptionCode[documentFormat.trackSpec[idx][0]]);}).length == 1)
			)
		) return result;
		if(documentFormat.trackSpec[idx]) result = documentFormat.trackSpec.splice(idx,1);
		documentFormat.drawArea();documentFormat.syncArea();
		return result;
	}
/* エリア挿入 
	指定idに指定の種別のトラックアエリアをカウント１で挿入する(既存ID前方挿入)
	不正指定の場合は 0番に挿入
	隣接エリアは同種似できない
 */
	documentFormat.insertArea = function insertArea(idx,kwd){
console.log('====== INSERT')
		if((!kwd)||(typeof idx == 'undefined')) return -1;
		if((idx < 0)||(idx > documentFormat.trackSpec.length)) idx = 0
		if(!(kwd instanceof Array)) kwd = [kwd ,1];
//NG条件
		if(
			(kwd[0] == 'comment')||
			((documentFormat.trackSpec[idx]  )&&(documentFormat.columnOptionCode[documentFormat.trackSpec[idx][0]] == documentFormat.columnOptionCode[kwd[0]]))||
			((documentFormat.trackSpec[idx-1])&&(documentFormat.columnOptionCode[documentFormat.trackSpec[idx-1][0]] == documentFormat.columnOptionCode[kwd[0]]))
		){
			return false;
		};
		documentFormat.trackSpec.splice(idx,0,kwd);
		documentFormat.drawArea();documentFormat.syncArea();
		return idx;
	}
/*
	ページヘッダアイテムの並び替え
 */
documentFormat.reorderHeaderItem = function(item,target){
	itmIdx = String(item).split('_').reverse()[0];
	tgtIdx = String(target).split('_').reverse()[0];
	var idx = documentFormat.headerItemOrder.findIndex(function(e){return (e[0]==itmIdx)});
	var idd = documentFormat.headerItemOrder.findIndex(function(e){return (e[0]==tgtIdx)});
	if(
		(idx == idd)||
		(idd - idx == 1)||
		(idd < 0)||(idx < 0)
	) return false;
	if(idx < idd) idd --;
	var mvitm = documentFormat.headerItemOrder.splice(idx,1)[0];
	documentFormat.headerItemOrder.splice(idd,0,mvitm);
	documentFormat.drawArea();documentFormat.syncArea();
	documentFormat.syncFormatSelect();
	xUI.XPS.parseSheetLooks(documentFormat.toJSON());
	xUI.rewritePageHeaderItemOrder();
//	xUI.resetSheet();
	return idd;
}
/*
	エリア高さを変更
 */
	documentFormat.boxHeightResize = function boxHeightResize(e){
		if(e.target.id.indexOf('orderbox')==0){
		var boxRect = documentFormat.orderbox.getBoundingClientRect();
//フレーム高さからパラメータ取得
			documentFormat.SheetColHeight.setValue(boxRect.height + 'px','mm');
			documentFormat.col2cellHeight();
			document.getElementById('docSheetColHeight').value = Math.round(100 * documentFormat.SheetColHeight.as('mm'))/100;
			xUI.applySheetCellHeight(boxRect.height);
		}else if(e.target.id.indexOf('header')==0){
			var boxRect = documentFormat.headerinf.getBoundingClientRect();
			documentFormat.HeaderBoxHeight.setValue(boxRect.height + 'px','mm');
			document.getElementById('headerBoxHeight').value = Math.round(100 * documentFormat.HeaderBoxHeight.as('mm'))/100;
			document.getElementById('headerBoxHeight').onchange({target:document.getElementById('headerBoxHeight')});
		}else if(
			(e.target.id.indexOf('signatures')==0)||(e.target.id.indexOf('notetext')==0)
		){
			var boxRect    = documentFormat[documentFormat.moveBox].getBoundingClientRect();
			var parentRect = documentFormat[documentFormat.moveBox].parentNode.getBoundingClientRect();
			documentFormat[((documentFormat.moveBox == 'signatures')?'HeaderSign':'HeaderNote')][3].setValue((boxRect.top - parentRect.top + boxRect.height)+'px','mm');
		};
		documentFormat.syncArea();//全体を再描画(ギャップエリア再計算を含む)
		xUI.XPS.parseSheetLooks(JSON.stringify(documentFormat));
		xUI.XPS.init();
		xUI.applySheetTrackWidth(documentFormat.toJSON(documentFormat));
		xUI.applySheetHeader(documentFormat.toJSON(documentFormat));
		documentFormat.syncFormatSelect();
	}
/*
	エリア幅を変更
 */
	documentFormat.boxWidthResize = function boxWidthResize(e){
console.log(e.target.id)
console.log((e.target.id == documentFormat.moveBox))
		if(e.target.id == 'orderbox'){
//ギャップエリア算出 UI上はボックス全体の幅を表示
			var boxRect   = documentFormat[documentFormat.moveBox].getBoundingClientRect();
			var gapWidth  = boxRect.width;
			Array.from(document.getElementById('orderbox').children).forEach((e)=>{
				gapWidth -= e.offsetWidth;
			});//as px */
//カラム間隔変更
			documentFormat.ColumnSeparatorWidth.setValue(gapWidth + 'px','mm');
//テキストボックス更新
			document.getElementById("docColumnSpan").value = Math.round(100 * new nas.UnitValue(boxRect.width+'px','mm').as('mm'))/100;
		}else if(e.target.id.indexOf('orderbox_') == 0){
//オーダーボックス個別エリア
			var idx = parseInt(e.target.id.split('_').reverse()[0]);
			if(!(document.getElementById("orderbox_" + idx))){onResize = false; return;};
			var areaWidth  = document.getElementById("orderbox_" + idx).clientWidth;//as px
			var itemKwd    = documentFormat.trackSpec[idx][0];
			var trackWidth = (areaWidth)/ documentFormat.trackSpec[idx][1];
//幅変更
			documentFormat[documentFormat.itemWidth[itemKwd]].setValue(trackWidth + 'px','mm');//更新
		}else if(e.target.id == 'headerinf'){
			onResize = false; return;
		}else if(e.target.id.indexOf('headerbox_') == 0){
//ページヘッダ個別エリア
			var idx = (e.target.id.split('_').reverse()[0]).trim();
			if(!(document.getElementById("headerbox_" + idx))){onResize = null; return;};
			var areaWidth  = document.getElementById("headerbox_" + idx).clientWidth;//as px
//幅変更
			var ix = documentFormat.headerItemOrder.findIndex(function(e){return (e[0]==idx)});
			documentFormat.headerItemOrder[ix][1].setValue(areaWidth + 'px','mm');//更新
		}else if(
			(e.target.id == 'signatures')||(e.target.id =='notetext')
		){
			var boxRect   = documentFormat[documentFormat.moveBox].getBoundingClientRect();
			var parentRect = documentFormat[documentFormat.moveBox].parentNode.getBoundingClientRect();
			documentFormat[((documentFormat.moveBox == 'signatures')?'HeaderSign':'HeaderNote')][2].setValue((boxRect.left - parentRect.left + boxRect.width)+'px','mm');
//			documentFormat[((documentFormat.moveBox == 'signatures')?'HeaderSign':'HeaderNote')][3].setValue((boxRect.top + boxRect.height)+'px','mm');
		};
		documentFormat.syncArea();//全体を再描画(ギャップエリア再計算を含む)
		//documentFormat.adjustBoxWidth();
		xUI.XPS.parseSheetLooks(JSON.stringify(documentFormat));
		xUI.XPS.init();
		xUI.applySheetTrackWidth(documentFormat.toJSON(documentFormat));
		xUI.applySheetHeader(documentFormat.toJSON(documentFormat));
		documentFormat.syncFormatSelect();
//		xUI.setAppearance();
	}
/* カラム高さからセル高さを算出*/
	documentFormat.col2cellHeight = function(){
		var fpc = nas.FCT2Frm(documentFormat.PageLength,nas.FRATE.rate)/documentFormat.SheetColumn;
		var offset = (document.getElementById('page_1').getBoundingClientRect().bottom - document.getElementById('0_0').getBoundingClientRect().top) - ( documentFormat.SheetCellHeight.as('px') * fpc);
		documentFormat.SheetCellHeight.setValue(((documentFormat.SheetColHeight.as('px') - offset) / fpc) + 'px','mm');
		return documentFormat.SheetCellHeight;
	}
/*
table 幅リサイズ・移動時に望まない変形が発生する原因は、tableセルの自動調整機能が働くため
テーブル全体の幅を、トラックの合計幅よりも小さく設定することで抑止できる
プレビュー時に要チェック
*/
/* リサイズプレビュー  xUIのメソッドを直接呼び出す形に変更　このメソッドはエイリアス*/
	documentFormat.adjustBoxHeight = function(tgt){
//高さ適用
		xUI.applySheetCellHeight(documentFormat.orderbox.clientHeight);
	}
/* リサイズプレビュー  xUIのメソッドを直接呼び出す形に変更　このメソッドは廃棄*/
	documentFormat.adjustBoxWidth = function(){
		nas.setCssRule(
			'td.colSep',
			'width:'+this.ColumnSeparatorWidth.as('px')+'px',
			'both'
		);
		documentFormat.trackSpec.forEach(function(e){
			nas.setCssRule(
				documentFormat.itemClass[documentFormat.itemWidth[e[0]]],
				'width:'+documentFormat[documentFormat.itemWidth[e[0]]].as('px') + 'px',
				'both'
			);
		});
	}
/* ボックスを移動 */
	documentFormat.boxMove = function boxMove(e){
console.log(e.target.id);
		var left = documentFormat.SheetLeftMargin;var leftInput = 'docMarginLeft';
		var top  = documentFormat.SheetHeadMargin;var topInput  = 'docMarginTop';
		var right = null ;var bottom = null;
		var rightInput = null ;var bottomInput = null;
		var boxRect    = false ;
		if(e.target.id == 'headerinf'){
			left = documentFormat.HeaderMarginLeft; leftInput = 'headerMarginLeft';
			top  = documentFormat.HeaderMarginTop ; topInput  = 'headerMarginTop';
		}else if(e.target.id == 'signatures'){
			boxRect = true;
			left = documentFormat.HeaderSign[0]; leftInput = 'signBoxLeft';
			top  = documentFormat.HeaderSign[1]; topInput  = 'signBoxTop';
			right  = documentFormat.HeaderSign[2]; rightInput  = 'signBoxRight';
			bottom = documentFormat.HeaderSign[3]; bottomInput = 'signBoxBottom';
		}else if(e.target.id == 'notetext'){
			boxRect    = true;
			left = documentFormat.HeaderNote[0]; leftInput = 'noteAreaLeft';
			top  = documentFormat.HeaderNote[1]; topInput  = 'noteAreaTop';
			right  = documentFormat.HeaderNote[2]; rightInput  = 'noteAreaRight' ;
			bottom = documentFormat.HeaderNote[3]; bottomInput = 'noteAreaBottom';
		};

		left.setValue(e.target.offsetLeft + "px",'mm');
		top.setValue (e.target.offsetTop  + "px",'mm');
		document.getElementById(leftInput).value = Math.round(100 * left.as("mm"))/100;
		document.getElementById(topInput).value  = Math.round(100 * top.as("mm"))/100;
		if(boxRect){
			right.setValue ((e.target.offsetLeft + e.target.clientWidth ) + "px",'mm');
			bottom.setValue((e.target.offsetTop  + e.target.clientHeight) + "px",'mm');
			document.getElementById(rightInput).value  = Math.round(100 * right.as("mm"))/100;
			document.getElementById(bottomInput).value = Math.round(100 * bottom.as("mm"))/100;
		};
		documentFormat.modified = true;
		documentFormat.adjustBoxPos(e.target.id);
		documentFormat.syncFormatSelect();
	}
/**
 *	@params {String} tgt
 *		移動プレビュー
 *		引数がない場合はすべてのボックス位置を合わせる
 */
	documentFormat.adjustBoxPos = function(tgt){
		if(!(tgt instanceof Array)) tgt = [tgt];
		tgt.forEach(function(e){
			if(e == 'orderbox'){
				nas.setCssRule('table.sheet',
					'margin-left:'+ documentFormat.SheetLeftMargin.as('px') + 'px ;'+
					'margin-top: '+ (documentFormat.SheetHeadMargin.as('px')
					- (
						document.getElementById('0_0').offsetTop
						- document.getElementsByClassName('sheetArea')[0].offsetTop
						+ document.getElementsByClassName('pgNm')[0].offsetHeight
					)
					- 4 )+ 'px'
					,"both"
				);
			}else{
				var cssselector = '';
				var leftValue   = '';
				var topValue    = '';
				if(e == 'headerinf'){
					cssselector = 'div.sheetHeader';
					leftValue   = documentFormat.HeaderMarginLeft ;
					topValue    = documentFormat.HeaderMarginTop;
				}else if(e == 'signatures'){
					cssselector = '.signArea';
					leftValue   = documentFormat.HeaderSign[0];
					topValue    = documentFormat.HeaderSign[1];
				}else if(e == 'notetext'){
					cssselector = '.noteArea'
					leftValue   = documentFormat.HeaderNote[0];
					topValue    = documentFormat.HeaderNote[1];
				};
				if(cssselector) nas.setCssRule(
					cssselector,
					'left:'+leftValue.as('px')+'px;top:'+topValue.as('px')+'px;',
					'both'
				);
			};
		});
	}
/*
 *	xUI.resetSheetによって失われるorderbox等画面UIの復帰
*/
	documentFormat.restoreOrderbox =function(){
		if(!(documentFormat.active)) return;
console.log('restore document formet editor');
		xUI.resetSheet(undefined,undefined,function(){
			(['orderbox','headerinf','signatures','notetext']).forEach(function(tgt){
				document.getElementById('sheet_body').appendChild(documentFormat[tgt]);
				documentFormat.boxMove({"target":documentFormat[tgt]});
			});
		});
		return;
	}
/* input|ckeckbox 一括処理*/
	documentFormat.checkUIValue = function checkUIvalue(e){
console.log(e);
		if(! documentFormat.active) return false;
		var idx = parseInt(e.target.id.split('_').reverse()[0]);
		if(e.target.id == "docFormatSelect"){
//書式変更 書式名指定して切り替え
//			documentFormat.syncArea();
//			documentFormat.modified = false;
//			documentFormat.baseFormatName = documentFormat.FormatName;
//			documentFormat.syncFormatSelect();
			if(confirm(localize('change format : %1 to %2 \n OK?', documentFormat.baseFormatName ,e.target.value))){
				var find = documentFormat.applyFormat(e.target.value);//リストの値を返す
console.log(find);
				//documentFormat.adjustTrack();
			}else{
				e.target.value = documentFormat.baseFormatName;
			}
			return;
		}else if(e.target.id.indexOf("itminfo_ipt") == 0){
//トラック幅の設定
			documentFormat[documentFormat.itemWidth[documentFormat.trackSpec[idx][0]]].setValue(e.target.value + 'mm','mm');//更新
		}else if(e.target.id.indexOf("itminfo_ckb") == 0){
//トラック隠蔽スイッチ
			documentFormat.trackSpec[idx][2] = (e.target.checked)? "":"hide";//文字列で設定
		}else if(e.target.id.indexOf("itminfo_lkb") == 0){
//スクロールロックトラック
			for(var ix = 0;ix <= (documentFormat.trackSpec.length - 1) ;ix ++){
				documentFormat.trackSpec[ix][2] = (ix <= idx)? "fix":"";//文字列で設定
			};
//			documentFormat.trackSpec[idx][2] = (e.target.checked)? "":"fix";//文字列で設定
		}else if(e.target.id.indexOf("orderbox_ipt") == 0){
//トラックカウント
			documentFormat.trackSpec[idx][1] = parseInt(e.target.value);
			documentFormat.adjustTrack(idx);
		}else if(e.target.id == "docFormatName"){
//書式名変更 現在のデータの書式名を変更する切り替えは廃止
			documentFormat.FormatName = e.target.value;
		}else if(e.target.id == "docFormatTemplateImageFile"){
console.log(e);
			documentFormat.importData(e.target);
		}else if(e.target.id == "docResolution"){
//解像度(基準解像度変更は無し・この解像度はシート画像の解像度)
			documentFormat.img.style.width = Math.floor((documentFormat.img.naturalWidth/e.target.value)*96)+'px';
		}else if(e.target.id == "docPageLength"){
//シート秒数
			documentFormat.PageLength = nas.FCT2Frm(e.target.value);
		}else if(e.target.id == "docFrameRate"){
//フレームレート
			documentFormat.FrameRate.setValu(e.target.value);
			nas.FRATE.setValu(e.target.value);
		}else if(e.target.id == "docColumn"){
//段組
			documentFormat.SheetColumn = (e.target.checked)? 2:1;
		}else if(e.target.id == "docMarginLeft"){
//左
			documentFormat.SheetLeftMargin.setValue(e.target.value + 'mm');
			documentFormat.adjustBoxPos();
		}else if(e.target.id == "docMarginTop"){
//上
			documentFormat.SheetHeadMargin.setValue(e.target.value + 'mm');
			documentFormat.adjustBoxPos();
		}else if(e.target.id == "docSheetColHeight"){
//シート列高 1カラム分
			documentFormat.SheetColHeight.setValue(e.target.value + 'mm');
//			documentFormat.col2cellHeight();
			documentFormat.orderbox.style.height = documentFormat.SheetColHeight.as('px')+'px';
			documentFormat.SheetCellHeight.setValue(xUI.applySheetCellHeight(documentFormat.SheetColHeight.as('px'))+'px','mm');
		}else if(e.target.id == "docColumnSpan"){
console.log('set columnSpan '+e.target.value + 'mm');
//カラム間隔
			var gap = new nas.UnitValue(e.target.value + 'mm').as('px');
			documentFormat.trackSpec.forEach(function(e){
				gap -=(e[2] == 'hide')? 0:documentFormat[documentFormat.itemWidth[e[0]]].as('px') * e[1];
			});
			documentFormat.ColumnSeparatorWidth.setValue(gap + 'px','mm');
			//documentFormat.adjustBoxWidth();
			xUI.XPS.parseSheetLooks(JSON.stringify(documentFormat));
			xUI.applySheetTrackWidth();
//			documentFormat.boxWidthResize({target:documentFormat.onResize});
		}else if(e.target.id.indexOf('docColorpick')==0){
//色彩値変更
			documentFormat[documentFormat.colorTable[e.target.id]] = e.target.value;
			xUI.applySheetlooks(JSON.stringify(documentFormat));
			documentFormat.previewSheetColor();
		}else if(e.target.id.indexOf("header_itm_ipt_") == 0){
//ページヘッダアイテム幅の設定
			var ix = parseInt(e.target.id.split('_').reverse()[0]);
			documentFormat.headerItemOrder[ix][1].setValue(e.target.value +'mm');
		}else if(e.target.id.indexOf("header_itm_ckb_") == 0){
//ページヘッダhide設定
			var ix = parseInt(e.target.id.split('_').reverse()[0]);
			documentFormat.headerItemOrder[ix][2]= (e.target.checked)?"":"hide";
		}else if(e.target.id.indexOf("header") == 0){
//ページヘッダ領域位置調整
			var prop ={
				'headerMarginTop' :'HeaderMarginTop',
				'headerMarginLeft':'HeaderMarginLeft',
				'headerBoxHeight' :'HeaderBoxHeight'
			}[e.target.id];
			documentFormat[prop].setValue(e.target.value +'mm');
		}else if(e.target.id.indexOf("signBox") == 0){
//署名アイテム欄の設定
			var ix =(["signBoxLeft","signBoxTop","signBoxRight","signBoxBottom"]).indexOf(e.target.id);
			documentFormat.HeaderSign[ix].setValue(e.target.value +'mm');
		}else if(e.target.id.indexOf("noteArea") == 0){
//メモ欄の設定
			var ix =(["noteAreaLeft","noteAreaTop","noteAreaRight","noteAreaBottom"]).indexOf(e.target.id);
			documentFormat.HeaderNote[ix].setValue(e.target.value +'mm');
		};
		documentFormat.syncArea();
		documentFormat.modified = true;
		documentFormat.syncFormatSelect();
	}
/**
	タイムシートUIカラーのプレビュー previewSheetColor
*/
	documentFormat.previewSheetColor = function(){
		for (var prp in documentFormat.colorPreview){
console.log(prp)
			Array.from(document.getElementsByClassName(prp)).forEach(function(e){
				e.style = "background-color:" + xUI.inputModeColor[documentFormat.colorPreview[prp]] + ';';
			});
		};
	}
/**
	@params {Boolean}	status
	詳細編集UIの切り替え
	true   960 x 360|100% bottom :0
	false  460 x 96 |100% 
PC時は960x360 <> 360x96
touchDevice時は 
*/
	documentFormat.expand = function(status){
		if(typeof status == 'undefined') status = !($('#docFormatDetail').isVisible());
		if(status){
			$('#docFormatDetail').show();
			if(appHost.touchDevice){
//				nas.HTML.setCssRule('.optionPanelDocFormat','width:100%;');
			}else{
				nas.HTML.setCssRule('.optionPanelDocFormat','width:960px;height:360px');
			};
//			$('#optionPanelDocFormat').width('960px');
//			$('#optionPanelDocFormat').height('360px');
			document.getElementById('docFormatExpand').innerHTML = '▲';
		}else{
			$('#docFormatDetail').hide();
			if(appHost.touchDevice){
//				nas.HTML.setCssRule('.optionPanelDocFormat','width:100%;');
			}else{
				nas.HTML.setCssRule('.optionPanelDocFormat','width:360px;height:96px');
			};
//			nas.HTML.setCssRule('#optionPanelDocFormat','width:100%;height:128px;');
//			$('#optionPanelDocFormat').width('360px');
//			$('#optionPanelDocFormat').height('96px');
			document.getElementById('docFormatExpand').innerHTML = '▼';
		};
		xUI.adjustSpacer();
	}
/** 書式オブジェクトの初期化手続き
アプリケーションのロードごとに1回だけ実行
*/
	documentFormat.init = function(){
		if(this.orderbox) console.log('初期化済み');
		console.log('timesheet document format manager init');

			if(appHost.touchDevice){
				nas.HTML.deleteCssRule('.optionPanelDocFormat',0);
				nas.HTML.addCssRule('.optionPanelDocFormat-mobile',0);
//			}else{
//				nas.HTML.setCssRule('.optionPanelDocFormat','');
			};
		documentFormat.updateFormatList();//現在保持しているフォーマットリストをUIに反映

		documentFormat.baseFormatName = documentFormat.FormatName;//複製
		documentFormat.img = new Image();//テンプレート画像キャリアを初期化
		documentFormat.img.src = '';
		documentFormat.img.id  = 'pageImage-1';
//ピクセルコンバートのための解像度を設定(WEB 96ppi固定)
		nas.RESOLUTION.setValue('96ppi');
//sheetLooks各値をUnitValueに初期化
		([
			"HeaderMarginTop",
			"HeaderMarginLeft",
			"HeaderBoxHeight",
			"SheetHeadMargin",
			"SheetLeftMargin",
			"SheetCellHeight",
			"SheetColHeight",
			"TimeGuideWidth",
			"ActionWidth",
			"DialogWidth",
			"SoundWidth",
			"SheetCellWidth",
			"SheetCellNarrow",
			"StillCellWidth",
			"GeometryCellWidth",
			"SfxCellWidth",
			"CameraCellWidth",
			"CommentWidth",
			"TrackNoteWidth",
			"ColumnSeparatorWidth"
		]).forEach(function(e){
			documentFormat[e] = new nas.UnitValue(documentFormat[e] + documentFormat.CellWidthUnit,"mm");
		});//pxは基準単位として使用不能 すべてmm単位で保持する
//ページヘッダアイテムをUnitValueに初期化
		documentFormat.headerItemOrder.forEach(function(e){
			e[1] = new nas.UnitValue(e[1] + documentFormat.CellWidthUnit,"mm");
		});
//sign.note バウンディングボックス left,top,right,bottom をUnitValueに初期化
		(["HeaderSign","HeaderNote"]).forEach(function(e){
			for (var ix = 0;ix < documentFormat[e].length;ix ++){
				documentFormat[e][ix] = new nas.UnitValue(documentFormat[e][ix] + documentFormat.CellWidthUnit,"mm");
			};
		});
//フレームレートをオブジェクト化
		documentFormat.FrameRate = new nas.Framerate(documentFormat.FrameRate);
//シート秒数をフレームに換算
		documentFormat.PageLength = nas.FCT2Frm(documentFormat.PageLength);
//ドキュメントがエディタUIを含んでいる場合のみエディタUIを初期化（印刷時はUIがない）
		if(document.getElementById('formDocFormat')){
//hederinfを初期化・参照設定
			if(! documentFormat.headerinf){
				documentFormat.headerinf           = document.createElement("div");
				documentFormat.headerinf.id        = 'headerinf';
				documentFormat.headerinf.className = 'orderbox-layout';
			};
			document.getElementById('sheet_body').append(documentFormat.headerinf);
//signaturesを初期化・参照設定
			if(! documentFormat.signatures){
				documentFormat.signatures           = document.createElement("div");
				documentFormat.signatures.id        = 'signatures';
				documentFormat.signatures.className = 'orderbox-layout';
			};
			document.getElementById('sheet_body').append(documentFormat.signatures);
//notetextを初期化・参照設定
			if(! documentFormat.notetext){
				documentFormat.notetext           = document.createElement("div");
				documentFormat.notetext.id        = 'notetext';
				documentFormat.notetext.className = 'orderbox-layout';
			};
			document.getElementById('sheet_body').append(documentFormat.notetext);
//orderboxを初期化・参照を作成
			if(! documentFormat.orderbox){
				documentFormat.orderbox           = document.createElement("div");
				documentFormat.orderbox.id        = 'orderbox';
				documentFormat.orderbox.className = 'track_orderbox';
			};
			document.getElementById('sheet_body').append(documentFormat.orderbox);

			(['orderbox','headerinf','signatures','notetext']).forEach(function(tgt){
//orderboxにイベントリスナを設定
console.log(tgt)
				document.getElementById(tgt).addEventListener('pointermove',function(e){
					if((e.target.clientHeight-e.offsetY) < 16){
//縦
						document.getElementById(tgt).style.cursor = 'ns-resize';
						documentFormat.setStatus(e.target.id,'resize');
					} else if((e.target.clientWidth-e.offsetX) < 16){
//横
						document.getElementById(tgt).style.cursor = 'ew-resize';
						documentFormat.setStatus(e.target.id,'resize');
					}else{
//それ以外の場合は移動
						document.getElementById(tgt).style.cursor = 'move';
						documentFormat.setStatus(tgt,'move');
					};
				});
				document.getElementById(tgt).addEventListener('pointerleave',function(e){
					document.getElementById(tgt).style.cursor = 'auto';
				});
			});

			document.getElementById('formDocFormat').addEventListener('dragenter',function(e){
				e.preventDefault();
				nas.HTML.addClass(this,"formatEdit-dragover");
			});
			document.getElementById('formDocFormat').addEventListener('dragover',function(e){
				e.preventDefault();
				nas.HTML.addClass(this,"formatEdit-dragover");
			});
			document.getElementById('formDocFormat').addEventListener('dragleave',function(e){
				nas.HTML.removeClass(this,"formatEdit-dragover");
			});
			document.getElementById('formDocFormat').addEventListener('drop',function(e){
//編集UI全体のアイテムドロップを初期化
				e.preventDefault();
console.log(documentFormat.dragAction);
console.log(documentFormat.dragItem);
console.log(e.target.id);

				if(e.dataTransfer.files.length){
					documentFormat.importData(e.dataTransfer);
				}else if(documentFormat.dragItem != null){
					if (
						(documentFormat.dragAction == 'reorder-headerItem')&&
						(e.target.id.indexOf('header_itm_') == 0)
					){
console.log('reorder PHITM');
						documentFormat.reorderHeaderItem(documentFormat.dragItem,e.target.id);
						documentFormat.dragAction = null;
						documentFormat.dragItem   = null;
						e.dataTransfer.clearData();
					}else if(e.composedPath().indexOf(document.getElementById('orderinfo')) >= 0){
						if(documentFormat.dragAction == 'insert'){
							documentFormat.insertArea(event.target.id.split('_').reverse()[0],documentFormat.dragItem);
						}else if (documentFormat.dragAction == 'move'){
							documentFormat.moveArea(documentFormat.dragItem,e.target.id.split('_').reverse()[0]);
						}else{
							documentFormat.removeArea(documentFormat.dragItem);
						};
						documentFormat.dragAction = null;
						documentFormat.dragItem   = null;
						e.dataTransfer.clearData();
					}else{
//remove;
console.log('REMOVE AREA');
						documentFormat.removeArea(documentFormat.dragItem);
					};
				}else if(event.dataTransfer.getData('text/plain')){
					documentFormat.insertArea(event.target.id.split('_').reverse()[0],event.dataTransfer.getData('text/plain'));
				}else{
					console.log(e);
				};
			},false);
//キー入力初期化
//			document.addEventListener('keydown',documentFormat.kbHandle);
//			document.addEventListener('keyup'  ,documentFormat.kbHandle);

			(['orderbox','headerinf','signatures','notetext']).forEach(function(tgt){
//ボックス移動/リサイズ初期化
				$(documentFormat[tgt]).on('pointerdown',function(e){
//マウスドラッグスクロールの停止
				nas.HTML.mousedragscrollable.movecancel = true;
//タッチスクロール・ホイルスクロールの停止
				document.addEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
				document.addEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });
/*
headerinf
headerbox_$$$
signbox
notetext
orderbox
orderbox_#
orderbox_ipt_#
*/
					var target = e.target;
					if(target instanceof HTMLInputElement){
console.log(e);
//インプットエレメントはスキップ
						target.focus();target.select();
						return true;
					}else{
//テキストボックスではないので
//ターゲットはキャリアオブジェクト(インプット系をスキップ)
						if(
							((e.target.clientWidth  - e.offsetX)<16)&&
							((e.target.clientHeight - e.offsetY)>16)
						){
//マウスポインタが右エリアで下エリア以外の場合は横リサイズ リサイズターゲットを設定 移動キャンセル
							documentFormat.setStatus(e.target.id,'resize');
						}else if((e.target.clientHeight - e.offsetY)<16){
//それ以外の場合は移動スイッチON
							documentFormat.setStatus(tgt,'resize');
						}else{
							documentFormat.setStatus(tgt,'move');
						};
//リサイズ判定の場合は処理をスキップ
console.log(documentFormat.onResize);
						if((documentFormat.moveBox)){
//移動モードに遷移
							target = document.getElementById(documentFormat.moveBox);
							if(!(documentFormat.onResize)){
								$(target)
									.data("clickPointX" , e.pageX - $(documentFormat[tgt]).offset().left)
									.data("clickPointY" , e.pageY - $(documentFormat[tgt]).offset().top);
								$(document).on('pointermove',function(e){
									if(xUI.XPS.timesheetImages.imageAppearance > 0){
										var pgOffset = document.getElementById('pageImage-1').getBoundingClientRect();
									}else{
										var heightOffset = document.getElementById('printPg1').getBoundingClientRect().y;
										var pgOffset = {
											bottom:1584+heightOffset,
											height:1584,
											left: 0,
											right: 1120,
											top: heightOffset,
											width: 1120,
											x: 0,
											y: heightOffset
										};
									};
									$(target).css({ 
										top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
										left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
									});
									documentFormat.boxMove({"target":target});
								});
							}else{
//リサイズモード
console.log(target.id);
								var targetRect = target.getBoundingClientRect();
								$(target)
									.data("clickOffsetX" , targetRect.right  - e.pageX )
									.data("clickOffsetY" , targetRect.bottom - e.pageY );
								var resizeDir = ( $(target).data('clickOffsetY') < 16 )?'Y':'X'; //縦判定を優先
								if(resizeDir=='X'){
//リサイズ横
console.log('resize X :'+target.id)
									$(document).on('pointermove',function(e){
										var newWidth = e.pageX - targetRect.left + $(target).data("clickOffsetX"); 
										target.style.width = newWidth +"px";
//										documentFormat.boxWidthResize({"target":target});
										documentFormat.boxWidthResize(e);
									});
								}else{
//リサイズ縦 targetがorderbox 系ならばorderbox|を調整
console.log('resize Y')
									$(document).on('pointermove',function(e){
										var newHeight = e.pageY - targetRect.top + $(target).data("clickOffsetY");

										if(e.target.id.indexOf('orderbox')==0) documentFormat.orderbox.style.height  = newHeight +"px";
										if(e.target.id.indexOf('header')==0)   documentFormat.headerinf.style.height = newHeight +"px";
										if(e.target.id == 'signatures') documentFormat.signatures.style.height = newHeight +"px";
										if(e.target.id == 'notetext'  ) documentFormat.notetext.style.height   = newHeight +"px";
										documentFormat.boxHeightResize(e);
									});
								};
							};
						};
					};
				}).on('pointerup',function(e){
//マウスドラッグスクロール再開
				nas.HTML.mousedragscrollable.movecancel = (xUI.canvasPaint.currentTool == 'hand')? false:true;
//タッチスクロール・ホイルスクロール再開
					document.removeEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
					document.removeEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });
					$(document).unbind("pointermove");
				}).on('pointerleave',function(e){
//マウスドラッグスクロール再開
				nas.HTML.mousedragscrollable.movecancel = (xUI.canvasPaint.currentTool == 'hand')? false:true;
//タッチスクロール・ホイルスクロール再開
					document.removeEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
					document.removeEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });
					$(document).unbind("pointermove");
				});
			});
//トラックアイテム初期化（要素描画）
			var sourceItemList = document.getElementById('track_item_list');
			sourceItemList.innerHTML = '';//クリア
			documentFormat.columnOptions.forEach(function(e){
				var itm = sourceItemList.appendChild(document.createElement('span'));
				itm.className = 'track_item';
				itm.id  = 'item_' + e;
				itm.innerText = e;
				itm.draggable = true;
//drag start
				itm.addEventListener('dragstart',function () {
					documentFormat.dragAction = 'insert';
					documentFormat.dragItem = [event.target.innerText,1];
					event.dataTransfer.setData('text/plain', event.target.innerText);
				},false);
			});
//ページヘッダアイテムのドラグドロップUIを初期化
			var sourceItemList = document.getElementById('header_item_list');
			sourceItemList.innerHTML = '';//クリア
			Array.from(document.getElementById('header_item_list').children).forEach(function(e){
//drag start
				e.addEventListener('dragstart',function () {
					documentFormat.dragAction = 'reorder-headerItem';
					documentFormat.dragItem = event.target.id;
					event.dataTransfer.setData('text/plain', event.target.id);
				},false);
			});
		};//エディタUI初期化
	}
/**
	初期化を含む開始手続き
	パネル呼び出し（エディタ立ち上げ）ごとに実行
	初期化引数は、オブジェクトでなくJSON文字列で与える
	引数がない場合は、現在のドキュメントのSheetLooksを同期して編集対象とする
	現在のドキュメントの保持している書式情報のみを受け継ぐ（具体的なデータや・トラック構造は無視）
*/
	documentFormat.startup = function startup(sheetlooks){
		console.log('timesheet document editor startup');
		documentFormat.updateFormatList();
//引数データ（JSON）があれば編集バッファに設定
//それ以外の場合は現在のsheetLooksを保持しているはずなのでそのまま立ち上げ
		if(sheetlooks){
			this.parse(sheetlooks);
		}else{
			this.parse(xUI.XPS.sheetLooks);
		};
//現在のドキュメントがテンプレート画像を持っている場合は、この値はスタートアップのparseで上書きされる
/*		if(xUI.XPS.timesheetImages.members.length > 0){
console.log('XPS has documentImage');//基本的に現在のタイムシート画像は使用しない
			documentFormat.TemplateImage = xUI.XPS.timesheetImages.members[0].img.src;
		}else{
console.log('XPS has no Image keep TempalteImage');
			documentFormat.TemplateImage = '/remaping/template/timeSheet_default.png';
		};//*/

//		if(xUI.XPS.SheetLooks)
console.log(documentFormat.img);
console.log(documentFormat.TemplateImage);


//現在の表示状態のバックアップを取得
		documentFormat.bkupSelection = [Array.from(xUI.Select),Array.from(xUI.Selection)];
		documentFormat.backup        = xUI.XPS.toString(false);//ここで現在のXPSをバックアップ
		documentFormat.backupRef     = xUI.referenceXPS.toString(false);//ここで現在の参照XPSをバックアップ

//表示モードを編集のために強制的にpageImageへ変更（復帰はバックアップ内のデータを利用）
		xUI.setDocumentMode('pageImage');

//セレクションを解除 フォーカスを左上へ
		xUI.selection();
		xUI.selectCell('0_0');

//orderboxのparentNodeがない場合は参照を作成
		if(! documentFormat.orderbox.paretNode){
			document.getElementById('sheet_body').append(documentFormat.orderbox);
		};
//各値初期化
/*		if(sheetlooks){
			documentFormat.parse(sheetlooks);
		}else{
		};// */
		documentFormat.parse(xUI.XPS.sheetLooks,documentFormat.initEditor);
	}
/*
	書式編集の手続き
	起動
	現在の編集を退避
	画像のバックアップは行わない（timesheetImage内にデータがあるのでそれで復帰が行われる）
		エディタ初期化（init）時に、
			タイムシート画像が登録されていた場合、第一ベージをテンプレートとして使用
			画層登録がない場合はタイムシート内のsheetLooksにテンプレートがあればそれを使用
			それ以外では、エディタが使用中のテンプレート画像を継続使用する
		テンプレート画像は、変数 sheetLooks.TemplateImage
		テンプレート画像は、随時任意の画像を読み込み可能 読み込み操作のUNDOは不可だが、アクセス可能な画像ならば入れ替え可能
		読み込みの際に編集データのテンプレートは入れ替わる　これが基礎データの編集にあたる
*/
/*
	
	現在編集中のドキュメントのトラック情報を書式に一致させる
	 不足トラックは追加
	 超過トラックは削除
	使用時は注意
	
	xUI.refereceXPS,xUI.XPSの双方を処理
	XPSに対してはputメソッドを使用してUNDOを有効化させる
*/
documentFormat.adjustTrack = function(){
//リファレンス欄
//trackSpecを直接編集して適用
	xUI.referenceXPS.sheetLooks.trackSpec.find(function(e){return(e[0]=='replacement');})[1] = documentFormat.trackSpec.find(function(e){return(e[0]=='reference');})[1];
	xUI.referenceXPS.xpsTracks.setTrackSpec();
//本体
	if(
		(documentFormat.active)||(xUI.viewOnly)
	){
//書式エディタ実行中||書き込み禁止時は、強制動作
		xUI.XPS.xpsTracks.setTrackSpec();
		xUI.XPS.xpsTracks.initAreaOrder();
		xUI.XPS.xpsTracks.assignAreaOrderMember();
		xUI.resetSheet();
	}else{
//書式エディタ不活性時はUNDO有効
//        xUI.applyDocumentFormat(true);

		var newData = new Xps();
//		var newData = new Xps(xUI.XPS.sheetLooks.trackSpec,xUI.XPS.sheetLooks.pageLength);
		newData.parseXps(xUI.XPS.toString(false));
//		newData.parseSheetlooks(documentFormat.toJSON());
		newData.xpsTracks.setTrackSpec();
		xUI.put(newData);
	};
//書式エディタ実行中は、画面リセットに伴って参照が切れるアイテムを復帰
	if(documentFormat.active){
		documentFormat.restoreOrderbox();
	};
};
