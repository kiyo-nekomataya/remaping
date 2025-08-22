'use strict';
/*=======================================*/
// load order:2
/*=======================================*/
if ((typeof config != 'object')||(config.on_cjs)){
    var config    = require( './nas_common' ).config;
    var appHost   = require( './nas_common' ).appHost;
    var nas       = require( './nas_common' ).nas;
}

/*=======================================*/
if(typeof nas == 'undefined') var nas = {};

/* ***  実行環境の判定オブジェクト  ****
appHost オブジェクト
	appHost.Nodejs   ;Bool
	appHost.ESTK     ;Bool
	appHost.Cordoba  ;Bool
	appHost.Electron ;String renderer|sandbox|browser
	appHost.platform ;String UXP|CEP|CSX|AIR|Electron|Chrome|Safari|Opera|MSIE|Netscape|Mozilla|unknown
	appHost.version  ;String platform-version
	appHost.os       ;String Win|Mac|iOS|Android|Linux|Other
*/
//nas.Image
/**
 *    画像ハンドルオブジェクト
 *    WEB|WEB以外の環境で統一して画像を扱うためのオブジェクト
 *    HTMLImageオブジェクトと互換プロパティを持つ
 *  各種画像デコーダを通して pngに変換した画像をキャッシュする
 *  pngをBASE64エンコードする
 *  BASE64ストリームをデコードしてpngで保持する
 */
nas.Image = function Image(width,height){
    this.width  = width;
    this.height = height;
    this.src    = "";
}
nas.Image.allowImgExtensions = new RegExp("\.(jpg|jpeg|jfif|pjpeg|pje|png|svg|gif|tga|targa|tiff?|psd|psb|webp)$",'i');
/**
 *	@params    {Object HTMLImageElement|Object HTMLCanvsElement} img 変換する画像エレメント
 *	@params    {String} type 
 *	@returns   {String}
 *	Canvas||画像エレメントをdataURLにコンバートして返す
 */
nas.Image.convert2dataURL = function(img,type,param){
	if(typeof type  == 'undefined') type  = 'image/webp';
	if(typeof param == 'undefined') param = .5;

	if(img instanceof HTMLCanvasElement){
		var canvas = img;
	}else{
		var canvas = document.createElement("canvas");
		canvas.width  = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img,0,0,img.width,img.height);
	};
	return canvas.toDataURL(type,param);
}
/**
 *	@params {String|Object HTMLImageElement|Object nas.NoteImage} img
	@params {Function} callback
 *	汎用画像操作メソッド
 *	引数としてFile|画像オブジェクト｜パス|URL等を与えてblobで戻す
 *	callback関数を与えて処理の引き継ぎが可能
 *	HTMLIMageElement|nas.Image|File|filepath|url
 file://****.png
 http://****.png
 blob:http://localhost/6d532e7e-e6fc-497e-bc90-b32e2c7f784e
 data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==
 *	いずれも文字列形式
 HTMLIMageElement ｜nas.Image | File
 直接参照
 */

nas.Image.convert2Blob = function(src,callback){
	if(typeof src == 'undefined') return false;
	var img    = new Image();//document.createElement('img') 等価
	var resulr = '';
	if(src instanceof HTMLImageElement){
//HTML画像エレメント
		img = src;
	}else if(src instanceof nas.Image){
		img = src;
	}else if(src instanceof File){
		img = src
	}else if(typeof src == 'string'){
		if(src.match(/^https?:\/\/.+/)){
			
		}else if(src.match(/^file:\/\/.+/)){
		}else if(src.match(/^blob:http\/\/.+/)){
		}else if(src.match(/^data:image\/(gif|jpeg|png)\;base64\,\/\/.+/)){
		};
	};
	if(callback instanceof Function) img.addEventListener('load',function(){callback(blb);},{once:true});
	return blb;
}
//if(typeof HTMLImageElement == 'function') nas.Image.prototype = Image.prototype;
//nas.NoteImage
//nas.nTable

/**
 *  @params {String|Object HTMLImageElement|Object nas.NoteImage} img
 *	@params {String} address
 *	@params {Object nas.Size|String} size
 *	@params {Object nas.NoteImageCollection} parent
 *   引数は String url|HTMLImageElement|nas.NoteImageまたはnas.NoteImageのプロパティを持つ互換オブジェクト
 *  注釈画像クラス
 * 注釈画像は、データ入力参照&&代用ドキュメント|ドキュメント注釈|手書き記述として機能する
 * データはドキュメントの本体の画像コレクションに格納
 * 1ページあたり1点の画像または任意のシートセルに付属する任意のサイズの画像を、インデックス付きで保持することが可能
 * 比較参照のために画像の 解像度|サイズ ,表示オフセット,スケールなどの補助情報を保持する
 * UI上のキャッシュとしてHTMLImageを持つ
 *  **HTML関連コードは、依存環境を確認して代用オブジェクトを設定することでエラー回避を行う
 
 type|linkプロパティは、画像の用途をあらわすアドレスで初期化される
 page:
 	タイムシートを含むドキュメント画像 アドレスIDは整数文字列
 cell|note:
 	特定のドキュメントセルに対する注釈画像 アドレスIDはアンダーバーで連結した２要素の整数
 description|memo:
 	ドキュメントに1点のみ与えられるdescription欄ための画像 アドレスIDはなし
 RenameItemと異なりすべてのtypeで編集が可能
 
 asset
 	pman｜pman.reNameで扱うアセットに付属する画像 アドレスIDは、ブラウズアイテムの持つid(uuid)
コレクションはアプリ本体が持ち、同時にブラウズアイテムにプロパティとして接続する
 
  new nas.NoteImage('./timesheet.png','page:1');
  new nas.NoteImage('./anotation.png','cell:1_12');
  new nas.NoteImage('./description.png','description:');
  
  初期化の際に必ずしも画像データは必要ない その場合キャッシュ画像はnull設定される
  画像の専有サイズは、都度sheetLooksから計算される

  new nas.NoteImage(null,'page:1');
  new nas.NoteImage(null,'cell:1_12');
  new nas.NoteImage(null,'description:');
  
  page:に対してはページサイズ
  cell:に対しては指定情報がなければ規定サイズ
  description:に対しては、フォーマットにもとづいてページ幅でヘッドマージンから
 */
nas.NoteImage = function NoteImage(img,address,size,parent){
	this.parent     = null      ;//parentCollection
    this.type       = "cell"    ;//description|page|cell|asset|note(予)|memo(予)
    this.link       = ""        ;//アタッチ座標 (座標タイプcell:String eg.0_0 |page:Number eg.1 | description:nullSrtring eg.""
    this.content    = ""        ;//画像パス,URL URI dataURL
    this.size       = new nas.Size("0mm","0mm")          ;//画像サイズ
    this.resolution = new nas.UnitResolution("96ppi");//オブジェクト解像度　ファイル解像度より優先
    this.offset     = new nas.Offset()               ;//nas.Ofset
    this.scale      = new nas.Scale("100%","100%")   ;//nas.Scale

//以下のプロパティは保存されない
	this.img = (typeof HTMLImageElement == 'function')? new Image():new nas.Image();//画像キャッシュ 保存対象外 HTMLImageElement|nas.Image 

	this.name                = ''              ;//存在する場合はファイル名を抽出・拡張子含む フルパス・空文字列のケースあり
	this.id                  = nas.uuid()      ;//キャッシュ検索用セッション内ID
//svgプロパティは画像にオーバーレイ表示される画像キャッシュエレメントへの参照/保存対象外
	this.svg                 = ''          ;//新規編集用 Element svg
//	this.canvas              = null        ;//新規編集用 Element canvas
	this.canvasStream        = []          ;//fabricCanvasシリアライズjson|SVGデータ（編集データの本体）|historyStack兼用 .canvasが存在する場合は<保存対象>
	this.canvasUndoPt        = -1           ;//history管理UndoPointer<保存対象>-1で初期化しておく
//	this.worksession         = false       ;//作業セッション情報{Object pman.WorkSessionStatus}
	nas.NoteImageCash.push(this)           ;//キャッシュに参照を設定
    if(arguments.length > 0) this.parse(img,address,size,parent);
}
/*TEST
	var 
*/
/*
	NoteImageCash配列
	メンバーはNoteImage
	コレクションに関わらずこの内部で参照を保持する
*/
nas.NoteImageCash = [];

/**
	画像ベイク
	@params {Object HTMLImageElement} baseImg
	@returns 

	現在のfabric.Canvasの内容を焼き付けする

	主用途は、現在のsvg-canvasの画像をフラッシュしてcontentプロパティを更新
	imgプロパティにcontentを反映させ、描画関連のプロパティをクリアする
	svgプロパティに値のない場合は、何も行わない
	imgのみ       NOP content・imgを保持 
	svgのみ       svgを contentにして imgに反映
	img+svg      imgとsvgをfabricで合成してcontentを更新・imgに反映
	焼き付け後のcontentは、基本的にsvgの内容
	
	UNDOが必要な場合は、オブジェクト全体のダンプを事前に保存しておく必要がある
*/
nas.NoteImage.prototype.bakeCnavas = function bakeCanvas(){
	if(!(this.svg)) return;
	
//	if((this.img.width == '0')||(!(this.img))){
//		this.img = new Image();
//	}
/*
*/
//ベイク用の一時canvasを作成
	var stage = document.createElement("canvas");
	stage.width  = Math.floor(this.size.x.as('in')*this.resolution.as('ppi'));
	stage.height = Math.floor(this.size.y.as('in')*this.resolution.as('ppi'));
	var ctx   = stage.getContext("2d");
//テンプレート（ベース）画像・保持画像・編集中のsvgの順にレンダリング
    var src = [baseImg,this.img];
    for(var i = 0 ; i < src.length ; i++ ){
        if(src[i]){
alert(i)
console.log(src[i])
            var dx = 0; var dy = 0;//仮に原点配置
            var dw = src[i].clientWidth;
            var dh = src[i].clientHeight;
            if(src[i] instanceof HTMLImageElement){
                dw = Math.floor(src[i].naturalWidth  * ( 96 / this.resolution.as('ppi')));
                dh = Math.floor(src[i].naturalHeight * ( 96 / this.resolution.as('ppi')));
            };
            
            ctx.drawImage(src[i],dx,dy,dw,dh);
        };
    };
//svgデータがあればそれをcavasに描画
    if(this.svg){
        var noteimage = this;
        var svgStr = "data:image/svg+xml;base64,"+ btoa(this.svg.innerHTML);
console.log(svgStr);
        var svgimg = new Image();
        svgimg.src = svgStr;
console.log(svgimg);
        ctx.drawImage(svgimg,dx,dy,dw,dh);
        
        svgimg.onload = function(){
console.log(svgimg)
            ctx.drawImage(svgimg, dx, dy,dw,dh);
//ベイクした画像を設定
console.log(noteimage);
            if(!(noteimage.img instanceof HTMLImageElement)) noteimage.img = new Image();
            noteimage.content = ctx.canvas.toDataURL('image/webp',0.5);
            noteimage.img.src = noteimage.content;
console.log(noteimage.img.src);
//関連プロパティを削除
            noteimage.svg = null;
            noteimage.canvasStream =   [];
            noteimage.canvasUndoPt = null;
        };
        svgimg.src = svgStr;
    }else{
//ベイクした画像をthis.imgに設定
        if(!(this.img instanceof HTMLImageElement)) this.img = new Image();
        this.content = ctx.canvas.toDataURL('image/webp',0.5);
        this.img.src = this.content;
console.log(this.img.src);
//関連プロパティを削除
        this.svg = null;
        this.canvasStream =   [];
        this.canvasUndoPt = null;
    };
}
/*TEST
    ｘUI.XPS.noteImages.members[0].bakeCanvas();
*/
/**
	オブジェクトメソッド
	オフセット値をドキュメント画像に適用
	@params {Object nas.Offset|String} offset
	@returns {Object nsa.Offset}
	returns current offset
*/
nas.NoteImage.prototype.applyOffset = function applyOffset(offset){
	if(arguments.length > 0) this.offset.setValue(Array.from(arguments));
	if(this.img instanceof HTMLImageElement){
		this.img.style.transform = 'translateX('+this.offset.x.as('mm')+'mm) ' +
		'translateY('+ this.offset.y.as('mm')+'mm) ' +
		'rotate('+this.offset.r.as('degrees')+'deg)';
	};
	return this.offset;
}
/**
	オブジェクトメソッド
	自身の削除
	画像にparentNodeがあれば自身をDOMツリーから削除
	コレクションから自身を削除
	キャッシュの開放はない
	オブジェクト自身を返すのでそれを控えて操作が可能
 */
nas.NoteImage.prototype.remove = function remove(){
	if((this.img)&&(this.img.parentNode)) this.img.parentNode.removeChild(this.img);
	if((this.svg)&&(this.svg.parentNode)) this.svg.parentNode.removeChild(this.svg);
	if(this.parent instanceof nas.NoteImageCollection) this.parent.members.splice(this.parent.members.indexOf(this),1);
	return this;
}
/**			クラスメソッド
 *  @params {Object HTMLImageElement} img
 *		判定する画像エレメント
 *	@params {String |Object nas.UnitValue}	siz
 *		画像の横幅を与える
 *		指定サイズキーワード A3|A4|A5|B3|B4|B5|tabloid|letter|11in|16in 省略可
 *		または 寸法文字列 "12in","120mm","13.5cm" 等 UnitValueの扱える単位
 *	@returns {Number}
 *		数値 ppi
 *	画像データの解像度（ピクセル密度）を推定するメソッド
 *	処理エラーでサイズ0の画像が与えられた場合
 */
nas.NoteImage.guessDocumentResolution = function(im,siz){
	if(!(im instanceof HTMLImageElement)) return false;
	if(!siz) siz = "A3";
	var resolutionset = [72,75,96,144,150,192,200,288,300,350,384,400];
	var wide = {
		"A3":"297mm","A4":"210mm","A5":"148.5mm",
		"B3":"364mm","B4":"257mm","B5":"182mm",
		"tabloid":"272mm","letter":"215.9mm",
		"11in":"11in","16in":"16in"
	};
	var docWidth = (wide[siz])? new nas.UnitValue(wide[siz]):new nas.UnitValue(siz);
	var res = im.naturalWidth/docWidth.as('in');
	for(var e = 0; e < resolutionset.length ; e++){
		if(
			(resolutionset[e] > res*0.98) && (resolutionset[e] < res*1.02)
		) return resolutionset[e];
	};
	return (res > 0)? parseInt(res):96;//適正解像度がない場合は、計算値をそのまま戻す
}
/*
	クラスメソッド
	キャッシュからIDを参照して当該のNoteImageを返す
	id以外にname,content(blob-url)でも検索可能
 */
	nas.NoteImage.get = function get(kwd){
		var result = nas.NoteImageCash.find(function(e){return ((e.id == kwd)||(e.content == kwd)||(e.name == kwd))}	);
		if(result) return result;
		return null;
	}
/**
	オブジェクトメソッド
 *	@params {String}	siz
 *		画像の横幅を指定サイズキーワード A3|A4|A5|B3|B4|B5|tabloid|letter|11in|16in または"8mm","1in" 等の文字列で与える
 *		省略可 省略時は、現時点での解像度（06ppi）でのピクセル数によるサイズを与える
 *	@returns {Number}
 *		数値 ppi
 *	同時に推定解像度にマッチさせオブジェクトのサイズプロパティを更新する
 */
nas.NoteImage.prototype.guessDocumentResolution = function(siz){
/*	if(typeof siz == 'undefined'){
		if(this.type.indexOf('description:' == 0){
			siz = 
		}else if(this.type.indexOf('page:') == 0){
			siz = 
		};
	};//*/
	if(typeof siz != 'undefined'){
		this.resolution.setValue(nas.NoteImage.guessDocumentResolution(this.img,siz)+" ppi");
	}else if(this.size.x.value > 0){
		this.resolution.setValue(nas.NoteImage.guessDocumentResolution(this.img,this.size.x.toString())+" ppi");		
	};
	if((this.img)&&(this.img.parentNode)){
		this.img.style.width = (this.img.naturalWidth * ( 96 / this.resolution.as('ppi')))+'px';//"1122px = 297mm 96ppi;A3 width 96ppi 推定処理
		this.applyOffset();
		xUI.setAppearance();
	};
	this.size.setValue((this.img.naturalWidth / this.resolution.as('ppc'))*10+'mm',(this.img.naturalHeight / this.resolution.as('ppc'))*10 +'mm');
	return this.resolution.as('ppi');
}
/**
    画像設定 
    @params {Object File |Object nas.Image|Object nas.NoteImage |String} img
    ファイルオブジェクト、画像パス、画像オブジェクト またはファイルパス｜URL文字列
    @returns {Object}
    tga|psd|tiffを拡張
            (img.match(/\.(png|jpg|jpeg|gif|webp|tga|tif|tiff|psd|psb)$/))
	戻り値:オブジェクトの画像プロパティ
	引数がない場合は、現在のコンテントの再ロードをトライする

	＊＊contentプロパティを、イメージキャッシュsrc としてblob:http://~ に設定する
	callback関数を与えた場合はロード終了のタイミングで本体オブジェクトを引数にしてcallbackを実行する
*/
nas.NoteImage.prototype.setImage = function(img,callback){
console.log(img);
	if(! this.img){
		this.img = document.createElement('img');
	};
	if((this.img)&&(this.img.parentNode)){
//画像のDOM状態を記録し親子関係をクリア?
		var parent_node = this.img.parentNode;
		var img_node = parent_node.removeChild(this.img);
	}else{
		var parent_node = null;
	};
//引数の画像を処理
console.log("content:>"+ this.content);
	if(! img) img = this.content;
	if(img instanceof nas.NoteImage){
console.log('noteImage detect');
console.log(img);
		var itm = this;
		itm.content = itm.img.src;
		itm.name    = img.name;
		itm.img.src = img.img.src;
		//blob-URL(のはず) src複製でキャッシュを引き継ぐ
		itm.img.addEventListener('load',function(){itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
	}else if(typeof img == 'string'){
console.log('stringData detect');
//シリアライズされたソースデータ
			if((img.match(/^(https?|file):\/\/.+/))&&(img.match(nas.Image.allowImgExtensions))){
// file-path|url
				if(img.match(/\.(png|jpg|jpeg|pjpeg|gif|webp|svg)$/i)){
console.log('load HTML Image form URL :' + img);
					var itm = this;
					itm.img.src = img;
					itm.name    = img;
					itm.img.addEventListener('load',function(){itm.content=itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
				}else if(
					(TgaLoader)&&(img.match(/\.(tga|targa)$/i))
				){
console.log('load TGA form URL :' + img);
					var itm = this;
					itm.content = String(img);
					itm.name = itm.content;
					var tga = new TgaLoader();
					try{
						tga.load(img);
						itm.img.src = tga.getDataURL('image/png');
						itm.name    = img;
						itm.img.addEventListener('load',function(){ itm.content = itm.img.src;itm.guessDocumentResolution();if(callback instanceof Function) callback(itm);},{once:true});//set blob
					}catch (err){
						console.log(err);
//標準の読出失敗画像を設定してここで設定したほうがユーザにわかりやすい
					};
				}else if(
					(Tiff)&&(img.match(/\.(tiff?)$/i))
				){
console.log('load TIFF form URL :' + img);
					var itm = this;
					itm.content = String(img);
					itm.name = itm.content;

					var xhr = new XMLHttpRequest();
					xhr.responseType = 'arraybuffer';
					xhr.open('GET', img.replace(/\#/g,'%23'));
					xhr.onload = function (e) {
						var tiff = new Tiff({buffer: xhr.response});
						itm.img.src  = tiff.toDataURL('image/png');
						itm.name = img;
						itm.img.addEventListener('load',function(){ itm.content = itm.img.src;itm.guessDocumentResolution();if(callback instanceof Function) callback(itm);},{once:true});//set blob
					};
					xhr.send();
/*
					try{
					var tiff = new Tiff()
						tga.load(img);
						itm.img.src = tiff.toDataURL({});
						itm.name    = img;
						itm.img.addEventListener('load',function(){ itm.content = itm.img.src;itm.guessDocumentResolution();if(callback instanceof Function) callback(itm);},{once:true});//set blob
					}catch (err){
						console.log(err);
//標準の読出失敗画像を設定してここで設定したほうがユーザにわかりやすい
					};
*/
				}else if(
					(PSD)&&(img.match(/\.(psd|psb)$/i))
				){
console.log('load PSD from URL : ' +img)
					var itm = this;
					var imgurl = img;//(itm.url)? itm.url.href:itm.path.replace(/\#/g,'%23');
					itm.name = imgurl;
console.log('get psd fromURL:'+imgurl);
					itm.content = itm.name;
					try{
						if(PSD.fromURL){
							PSD.fromURL(imgurl).then(function(psd) {
								itm.img = psd.image.toPng();
							}).catch(function(err){
								console.log(err);
//標準の読出失敗画像を設定してここで設定したほうがユーザにわかりやすい
							});
						}else{
							var psd = PSD.fromFile(imgurl);
							if(psd){
								itm.img = psd.image.toPng();
							};
						};
						itm.img.addEventListener('load',function(){itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
					}catch (err){
						console.log(err);
//標準の読出失敗画像を設定してここで設定したほうがユーザにわかりやすい
					};
				}else if(
					(Tiff)&&(img.match(/\.(tif|tiff)$/i))
				){
console.log('tiff not supported.');
				};
			} else if(img.match(/^blob:http\/\/.+/)){
console.log('BLOB');
				var itm = this;
				this.img.src = img;
				itm.img.addEventListener('load',function(){itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
			}else if(img.match(/^data:image\/(gif|jpeg|png|webp)\;base64\,[0-9a-zA-Z+/]*={0,2}$/)){
console.log('DATA-URL');
				var itm = this;
				this.img.src = img;
				itm.img.addEventListener('load',function(){itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
			}else{
console.log('string NOT IMAGE');
			};
	}else if(img instanceof File){
//as File
console.log('File detect')
console.log(img);
		if(img.name.match(/\.(gif|jpg|jpeg|jfif|pjpeg|pje|png|svg|webp)$/i)){
console.log('detect File HTML image handle : '+  img.name);
			var itm = this;
			itm.name = img.name;
			var imgSrc = URL.createObjectURL(img);
			itm.img.src = imgSrc;
			itm.img.addEventListener('load',function(){itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
console.log (itm.img);
		}else if(img.name.match(/\.(tga|targa)$/i)){
console.log('detect File TGA');
			var itm = this;
			itm.name = img.name;
			img.arrayBuffer().then(function(result){
				var tga = new TgaLoader();
				tga.load(new Uint8Array(result));
				itm.img.src = tga.getDataURL('image/png');
//				itm.img.src = tga.getDataURL('image/webp',.5);
			itm.img.addEventListener('load',function(){itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
				}).catch(function(err){
					console.log(err);
				});
		}else if(img.name.match(/\.(psd|psb)$/i)){
console.log('detect File Photoshop');
			var itm = this;
			itm.name = img.name;
			img.arrayBuffer().then(function(result){
				var psd = new PSD(new Uint8Array(result));
				psd.parse();
				var psdimg = psd.image.toPng();
				 
			psdimg.addEventListener('load',function(){itm.img.src = psdimg.src;itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
				},function(err){
					console.log(err);
				}).catch(function(err){
					console.log(err);
				});
		}else if(img.name.match(/\.(tiff|tif)$/i)){
console.log('detect TIFF');
			var itm = this;
			itm.name = img.name;
			img.arrayBuffer().then(function(result){
				var tiff = new Tiff({buffer:new Uint8Array(result)});
				itm.img.src = tiff.toDataURL('image/png');
			itm.img.addEventListener('load',function(){itm.content = itm.img.src;itm.guessDocumentResolution(); if(callback instanceof Function) callback(itm);},{once:true});
				}).catch(function(err){
					console.log(err);
				});
//			if(appHost.platform != 'Electron')console.log('but TIFF not suported');
		};
	}else if((typeof HTMLImageElement == 'function')&&(img instanceof HTMLImageElement)){
//画像を設定
		this.img.src = img.src;
		this.guessDocumentResolution('A3');
	}else if(img instanceof nas.Image){
		this.img = img;
	};
//すべてblob-urlに変換してブラウザ側の画像キャッシュに管理を委ねる
//	this.content = this.img.src;
	return this;
}

/** 記録データまたは初期化引数をパースしてオブジェクトを整える
    @params {Object nas.Image|Object nas.NoteImage |HTMLCavasElement|String|File|null} img
    画像パス、画像オブジェクト、Canvas要素、ダンプ文字列 | null
    @params {String} address
    画像のリンクアドレス
    @params {Object nas.NoteImageCollection} parent
    親コレクション 省略可
	@params {Object nas.Size|String} size
	サイズオブジェクトまたはサイズを表す文字列

    @returns {Object}
	画像の設定自体はsetImageメソッドに引き渡しをするのでここでの判定は最低限にする
	
	img引数にnullが与えられた場合は、引数から初期サイズを割り出してcanvasを初期化するために使用する
	canvasは、基本的に96ppi 

	size 引数は以下のいずれか
		Object nas.Size
		Object nas.Size互換文字列
		UnitValue(widthとして扱う)
		ドキュメントサイズキーワード A3 A3L等
	いずれも全てObject nas.Sizeに変換してプロパティとして保持する
 */
nas.NoteImage.prototype.parse = function(img,address,size,parent){
	if(
		((typeof img == 'object')&&(
			(!(img instanceof File))&&
			(!(img instanceof HTMLCanvasElement))&&
			(!(img instanceof HTMLImageElement))&&
			(!(img instanceof nas.NoteImage))&&
			(img != null)
		))||(
			(typeof img == 'string')&&(img.match(/^\s*\{.+\}\s*$/))
		)
	){
//第一引数が無名オブジェクトでかつFile|nas.NoteImage|HTMLCanvasElement|Image 等の画像インスタンスではない
//または第一引数が文字列でかつJSON記録データ(JSON形式ダンプ文字列)
//第一引数のみ有効
console.log('JSON | Object noname' );
console.log(img);
		if(typeof img == 'string') img = JSON.parse(img);
		for(var prp in img){
console.log(prp);
			if((prp == 'content')||(typeof this[prp] == 'undefined')||(this[prp] == null)) continue;
			if(this[prp].setValue instanceof Function){
				this[prp].setValue(img[prp]);
			}else if(this[prp].parse instanceof Function){
				this[prp].parse(img[prp]);
			}else{
				this[prp] = img[prp];
			};
		};
//他のプロパティをすべて処理後に画像を設定
console.log(img.content);
		if(img.content) this.setImage(img.content);
		if(img.canvasStream) this.initCanvas();
		return this;
    }else if(
    	(typeof img == 'object')&&(img instanceof nas.NoteImage)
    ){
//第一引数は nas.NoteImage => 内容を複製 他の引数は無視
//第一引数のみ有効
console.log('NOTE-IMG');
console.log(img);
console.log('parse NoteImage 	Object');
		for(var prp in img){
			switch (prp){
			case "type":
			case "link":
			case "parent":
				this[prp] = img[prp];
			break;
			case "size":
			case "resolution":
			case "offset":
			case "scale":
				this[prp].setValue(img[prp]);
			break;
			};
		};
//他のプロパティをすべて処理後に画像を設定
console.log(img.img);
		if(img.img) this.setImage(img.img);
		return this;
	}else if((typeof img == 'object')&&(img == null)){
//画像データにnullが指定された
console.log(img);
		if(size) this.size.setValue(size);
		this.img = null;//
	}else{
//前3ケース以外では、直接setImage
console.log(img);
		if(img instanceof File) this.name = nas.File.basename(img.name)
		if(size) this.size.setValue(size);
		this.setImage(img);
	};
/*引数アドレスは リンク先とタイプ文字列を同時もつ文字列
	String address
	page:0 ...
	cell:0_0 ...
	description:|direction:|memo:
 typeプロパティは':'を含まない
*/
	if(address){
		address = address.split(':');
		this.type = address[0];
		this.link = (address[1])? address[1]:"";
		if(! parent){
			parent = (type == 'page')? xUI.XPS.timesheetImages:xUI.XPS.noteImages;
		};
	};
	if(parent) this.parent = parent;
	if((parent)&&(parent.addMember)){
		parent.addMember(this);
	};
	if(this.svg) return this.initSVGCash();
	return this;
}
/**
    読み込み時にすでにcanvasデータが存在する場合、キャッシュを初期化する（要fabricCanvas）
*/
nas.NoteImage.prototype.initCanvas = function initCanvas(callback){
    //NOP cavasaddon で拡張されるまでの間のダミー関数
};
/**
 *	@params {Function} callback
 *	@params {Array}    pxSize
 *	を初期化
 *	画像の解像度に従ったサイズで空の画像キャッシュSVGを初期化する
 */
nas.NoteImage.prototype.initSVGCash = function initCanvasSVG(callback,pxSize){
	if(!(this.svg)) this.svg = document.createElement('svg');
	if(pxSize){
		this.size.setValue(
			pxSize[0]/this.resolution.as('ppc')*10 +'mm',
			pxSize[1]/this.resolution.as('ppc')*10 +'mm'
		);
	};
	this.svg.style.width  = parseInt(this.size.x.as('in') * this.resolution.as('ppi'))+'px';
	this.svg.style.height = parseInt(this.size.y.as('in') * this.resolution.as('ppi'))+'px';
	this.svg.id = this.type+["CanvasBuffer",this.link].join('-');

	if(callback instanceof Function) callback(this);
	return this;
}
/**
 *	オブジェクトの持つ画像を単一画像にベイクして imgプロパティに設定
 *	canvas関連の情報をクリアする
 */
nas.NoteImage.prototype.bake = function(){
	this.svg = null;
	this.canvasStream =   [];
	this.canvasUndoPt = null;
}
/**
 *     保存用にシリアライズ
 *  canvasオブジェクトが存在する場合は、canvasの内容を出力対象とする
 *  ベイクを行うことでsvg-canvasの内容はimgと合成されてsvg-canvasにnullが設定される
 *     @params {String} form
 *      JSON|text|dump|export
 *      キャッシュ用に
 *	@params {Array of Number|String} replacer
 *		stringify params
 *	@params {String|Number} space
 *		stringify params
 */
nas.NoteImage.prototype.toString = function toString(form, replacer, space){
    if (form){
        return JSON.stringify(this, replacer, space);
    }else{
    	return this.id;//キャッシュ検索用IDを返す
    };
}
/**
	JSON出力時のフィルタ
	canvasが存在する場合は、canvasの内容を出力に加える
*/
nas.NoteImage.prototype.toJSON = function toJSON(){
		var result ={
			"type"      :this.type,
			"link"      :this.link,
			"content"   :(this.img instanceof HTMLImageElement)?
			nas.Image.convert2dataURL(this.img,"image/webp",0.5):this.content,
			"size"      :this.size.toString(),
			"resolution":this.resolution.toString(),
			"offset"    :this.offset.toString(),
			"scale"     :this.scale.toString()
		};
		if(this.svg){
			result.canvasStream = this.canvasStream;
			result.canvasUndoPt = this.canvasUndoPt;
			result.svg = this.svg.innerHTML;
		};
		return result;
}
/*TEST
var A = new nas.NoteImage('{"type":"page","link":"1","content":"http://localhost/~kiyo/images/image1.png","resolution":"300ppi","offset":{"x":0 ,"y":0},"scale":{"x":1,"y":1},"size":{"x":120,"y":240}}}');

var B = new nas.NoteImage('http://localhost/~kiyo/images/image1.png');//url単体
var C = new nas.NoteImage(document.getElementById('imgPreview'));//
*/
/*
    注釈画像コレクション
*/
nas.NoteImageCollection = function NoteImageCollection(){

	this.type              = 'page';//page | note
	this.members           = []    ;//array of collection menbers
	this.imageAppearance   = 0.0   ;//0.0 ~ 1.0
	this.imageBlendMode    = 'auto';//'auto'ほか通常のブレンドモードを指定可能
}
/**
 *	@params {Boolean}	expt
 *	出力オプション false 外部出力|true 内部コンバート出力
 *	@returns {Object for JSON.stringify}
 */
nas.NoteImageCollection.prototype.toJSON = function toJSON(conv){
	var result = {
		type:            this.type,
		imageAppearance: this.imageAppearance,
		imageBlendMode:  this.imageBlendMode
	};
	if(conv){
//内部コンバート用
		result.members = Array.from(this.members,function(e){return e.id});
	}else{
//JSON only
		result.members = Array.from(this.members,function(e){
			if(e.size.x * e.size.y == 0){
				return e.id;
			}else{
				return JSON.parse(JSON.stringify(e));
			};
		});
	};
	return result;
}
/**
 *	@params {Boolean}	expt
 *	出力オプション true 外部出力|false 内部コンバート出力
 *	@params {Array of Number|String} replacer
 *		stringify params
 *	@params {String|Number} space
 *		stringify params
 */
nas.NoteImageCollection.prototype.dump = function(expt, replacer, space){
	return JSON.stringify(this.toJSON(! expt),replacer, space);
}
/**
 *	@params {Object|String JSON|Object Array} stream
 *	記録文字列からコレクションオブジェクトを更新
 *  配列のみを渡すことも可能（初期コード互換）
 */
nas.NoteImageCollection.prototype.parse = function(stream){
console.log(stream)
	var temp = (typeof stream == 'string')? JSON.parse(stream):stream;
	if(temp instanceof Array) temp = {members:temp};
	if(temp.type)            this.type            = String(temp.type);
	if(temp.imageAppearance) this.imageAppearance = parseFloat(temp.imageAppearance);
	if(temp.imageBlendMode)  this.imageBlendMode  = String(temp.imageBlendMode);
	if(temp.members instanceof Array){
		this.members.length = 0;
		temp.members.forEach(function(e){
		if(
				(typeof e == 'string')&&
				(e.match(/^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/))
			){
//エレメントがuuidなのでキャッシュからサルベージする
			this.addMember(nas.NoteImage.get(e));
		}else{
			console.log(this.addMember(new nas.NoteImage(e)));
		};},this);
		
	};
}
/*
 特定のリンクアドレスを指定してコレクションからメンバーを呼び出す
 アドレス形式 type:link
 */
nas.NoteImageCollection.prototype.getByLinkAddress = function(address){
	if(address){
		address = address.split(':');
		return this.members.find(function(e){
			return ((address[0] == e.type)&&(address[1] == e.link));
		});
	}else{
		return undefined;
	};
}
/*
 特定のタイプのメンバー配列で得る
  
 */
nas.NoteImageCollection.prototype.getMembersByType = function(type){
	var result = [];
	if(type){
		result = Array.from(this.members,function(e){
			if(type == e.type) return e;
		});
	};
	return result;
}
/*
 メンバを加える
 */
nas.NoteImageCollection.prototype.addMember = function(member){
	var lngt = this.members.length;
	var ix = this.members.add(member);
	if(lngt < this.members.length){
		member.parent = this;
		return member;
	}else{
		return this[ix];
	};
}
/**
	@params {Object nas.NoteImage|Number|String} member
	
	オブジェクトのremoveメソッドをコールしてメンバを削除する
	引数は メンバ自身、数値：メンバID,文字列:メンバアドレス
	
 */
nas.NoteImageCollection.prototype.remove = function(member){
	if(typeof member == 'string') member = this.getByLinkAddress(member);
	var ix = (member instanceof nas.NoteImage)? this.members.indexOf(member):member;
	if((ix >= 0)&&( ix < this.length)){
		return this.members[ix].remove();
	}else{
		return null;
	};
}
/*コレクションの初期化 メンバーオブジェクトのremoveメソッドを順次コールしてオブジェクト内の参照をクリアする*/
nas.NoteImageCollection.prototype.clearMember = function(){
	this.members.forEach(function(e){e.remove();});
}

// nas.NoteImageCollection.prototype = Array.prototype;

/*TEST
var imgs = `[
{
	"type":"page",
	"link":"1",
	"content": "./kt#Otameshi__s-c010.jpeg",
	"size": "",
	"resolution": "300ppi",
	"offset": {"x":0 ,"y":0},
	"scale": {"x":1 ,"y":1}
},
{
	"type":"page",
	"link":"2",
	"content":"file://C:\sheet\kt#Otameshi__s-c010.jpeg",
	"resolution": "200ppi",
	"offset": {"x":0 ,"y":0},
	"scale": {"x":1 ,"y":1}
},
{
	"type":"page",
	"link":"3",
	"content":"http://www.nekomataya.info/sample/sheet\kt#Otameshi__s-c010.jpeg",
	"size":"",
	"resolution": "200ppi",
	"offset": {"x":0 ,"y":0},
	"scale": {"x":1 ,"y":1}
}
]`;
var testImages = new nas.NoteImageCollection();
testImages.parse(imgs)
*/
/*=======================================*/
if ((typeof config == 'object')&&(config.on_cjs)){
    exports.nas = nas;
}
