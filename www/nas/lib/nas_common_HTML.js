/* 
	nas_tools.js お道具箱汎用データ操作・サービス 関数
イロイロ、共通でつかえる奴
基本的にWWWブラウザに依存するので、Javascript(ECMA-262)汎用系と切り分けます。
ただし。呼び出しの便宜のため、nasオブジェクトのメソッドであることは変わらず。
このスクリプトをロードする前にnasオブジェクトの初期化は行うこと。

順次 jquery + jquery-ui とリプレースするよー 2013.04.06

jquery + jquery-uiもすでに古くなってきたので新規コードは なるべく最新のECMAで記述する方針に変更 2023

nas.updateBk() {
	エレメントの値をすべてバックアップ(正常な処理の最後に呼ぶ)
nas.Push_Log(str) {Log = Log.concat([str])}
	ログファイルへのプッシュ
nas.HTML.sliderVALUE(chnk)
	マウスドラグによるインプット値の編集開始
nas.HTML.sliderOFF()
	マウスドラグによるインプット値の編集終了
nas.HTML.SliderSelect(elemennt,options,direction)
	スライドメニューUI
nas.HTML.MVSlider_NS(event)
nas.HTML.MVSlider_IE()
	マウススライダが呼び出すメソッド

nas.HTML.editTableCell(myObj,inputType,myContent,myFunction)
	htmlテーブルの内容をダイナミックに書き換えるメソッド

nas.HTML.sizeToContent()
	ウィンドウサイズをあわせる一応汎用品(あやしい)

===================メッセージ (現在未使用）
フレームレートがロックされているので、リンクは解除できません。
解像度がロックされているので、リンクは解除できません。
ゼロは設定しないでください。
負の値は設定できません。
メッセージは不要かも
フラグを付けてプリファレンスで選択させるか?
*/
'use strict';
/*=======================================*/
if(typeof nas == 'undefined') var nas = {};

/* ***  実行環境の判定オブジェクト  ****
appHost オブジェクト
	appHost.Nodejs   ;Bool
	appHost.ESTK     ;Bool
	appHost.platform ;CEP|CSX|AIR|Chrome|Safari|Opera|MSIE|Netscape|Mozilla|unknown
	appHost.version  ;platform-version
	appHost.os       ;Win|Mac|Other
*/
/*
 *    nas.HTMLトレーラーオブジェクト
 */
nas.HTML={};

/** html環境下で働くコンソール・複数設定可能
 *	console オブジェクトを設定するコンストラクタ
 *	コンソールを初期化するにはHTMテキストエリアをコンストラクタに渡す
 *	コマンドを実行するコールバックとコンソールプロンプトを指定可能
 *	@params {Object}	element
 *			HTMLHTMLTextAreaElement
 *	@params	{Function}	callback
 *			command eval engine
 *	@params	{String}	prpmpt
 *			console.promp String
 *	
 *	commandStore	
 *	
 *	
 *	
 *	
 *	
 */
nas.HTML.Console = function(element,callback,prompt){
		this.commandStore  = [];
		this.commandPath   = [];
		this.commandBackup  = {text:"",offset:0};
		this.commandOffset = 0;
		this.textLength    = 0;
		this.screen        = null;
		this.callhost      = false;
		this.callback      = null;
		this.prompt        = '>';
		this.init(element,callback,prompt);
	}
/*
 * コンソールの補助コマンド群
 *	.help        簡易ヘルプ　コマンドリストを返す
 *	.clear,_cls  コンソールのクリア
 *	.chghost     host|app を切り替える
 *  .list        
 *  .reset       コンソールを初期状態にリセットする
 */
nas.HTML.Console.comlist = {
	".help":{
	    description:"show this massage.",
	    command:function(egn){
	        var result = "";
	        for (var prp in nas.HTML.Console.comlist){
	            var name = prp ; var desc = "";
	            if(nas.HTML.Console.comlist[prp].description){
	                desc = nas.HTML.Console.comlist[prp].description;
	            }
	            result+=["",name,desc].join("\t")+"\n";
	        };
	        egn.putResult(result);
	    }
	},
	".clear":".cls",
	".cls":{
	    description:"clear console window.",
	    command:function(egn){
	        egn.clear();
	    }
	},
	".chghost":{
	    description:"change command engine host|app.",
	    command:function(egn){ egn.changeHost(); }
	},
	".reset":{
	    description:"reset console.",
	    command:function(egn){
	        egn.clearHistory();
	        egn.clear();
	    }
	}
};
/**
    コマンドバックアップの操作
    @params {Boolean}   flush
        クリアスイッチ
*/
	nas.HTML.Console.prototype.commandBackupSet=function(flush){
		if(flush){
		    this.commandBackup.text   = "";
		    this.commandBackup.offset = 0 ;
		}else{
			this.commandBackup.text   = this.screen.value.slice(this.textLength).trim();
			this.commandBackup.offset = this.screen.selectionStart - this.textLength;
		}
	}
/**
 *	@params {Object}	element
 *			HTMLHTMLTextAreaElement
 *	@params	{Function}	callback
 *			command eval engine
 *	@params	{String}	prpmpt
 *			console.promp String
 *	コンソールオブジェクトを再初期化する
 */
	nas.HTML.Console.prototype.init = function(element,callback,prompt){
		if(! element instanceof HTMLTextAreaElement) return false;
		if((console)&&(console.log)) console.log('setup :' +element.id);
		this.screen        = element;
		this.screen.engine = this;//エレメントにコンソール自体をアタッチする
		if(callback instanceof Function){
		    this.callback = callback;
		    this.callhost = true;
		}
		if(prompt) this.prompt = String(prompt).trim() +'>';
		this.clear();
		element.addEventListener("keydown",this.cct);
		element.addEventListener("keyup",this.blockresult);
//		$(element).keydown(this.cct);
//		$(element).keyup(this.blockresult);
	}
/*
 *	コンソールオブジェクトのコマンドヒストリをクリアする（履歴の保存は未コーディング）
 */
	nas.HTML.Console.prototype.clearHistory  = function(){
		this.commandStore  = [];
		this.commandBackupSet(true);	
		this.commandOffset = 0;
	};
/*
 *	基礎機能・コンソールにテキストを配置するショートカット
 */
	nas.HTML.Console.prototype.put   = function(string){
		this.screen.value += string;
	};
/*
 *	基礎機能・コンソールまたは任意のテキストエリアにリザルトテキストを配置するショートカット
 *  @params {String}    result
 *      result text
 *  @params {Object}    target
 *      nas.HTML.Console|HTMLTextAreaElement
 */
	nas.HTML.Console.prototype.putResult = function(result,target){
	    if(! target) target = this.screen;
        if(target instanceof HTMLTextAreaElement) target = target.engine;
		target.screen.value += '\n';
		target.screen.value += result;
		target.screen.value += "\n"+((target.callhost)? target.prompt:'>')+" ";//
		target.textLength = target.screen.value.length;
		target.screen.setSelectionRange(
			target.textLength,
			target.textLength
		);
		target.screen.scrollTop = target.screen.scrollHeight;
	};
/*
 *	基礎機能・コマンドを実行するエンジンを切り替える(eval|callback)
 */
	nas.HTML.Console.prototype.changeHost = function(tgt){
	    if(typeof tgt == 'undefined'){
	       this.callhost = !(this.callhost);
	    }else{
	       this.callhost = (tgt)? true:false;
	    }
//画面上の最後のプロンプトのみを置換更新
        this.screen.value = this.screen.value.slice(0,this.textLength).trim().replace(/.*$/,"") + ((this.callhost)? this.prompt:'>')+ ' ';
        this.textLength = this.screen.value.length;
        this.screen.value += this.commandBackup.text;
    }
/*
 *	基礎機能・コンソール上のコマンドを指定のコールバックに渡してリザルトを配置するメソッドへのショートカット
 *  params  {String}    cmd
 *  params  {Object}    callback
    callbackの仕様は 引数としてコマンドリザルトを受け取る関数を与える
 */
	nas.HTML.Console.prototype.doCommand   = function(cmd){
		if(! cmd) cmd = this.screen.value.slice(this.textLength).trim();
		if(cmd.length ){
//プロンプト後方の編集行クリア
			this.screen.value = this.screen.value.slice(0,this.textLength) + cmd;
            var resultText = '';
			try{
				resultText = eval(cmd);
			}catch(err){
				resultText = err;
			}
            this.putResult(resultText,this);
            return false;
		};
	};
/*
 *	基礎機能・テキストエリアのキー入力を前方に固定して既存出力の編集を抑制
 */
	nas.HTML.Console.prototype.blockresult   = function(eVt){
		if(eVt.keyCode == 18){this.engine.changeHost();return false;}
		if(this.selectionStart < this.engine.textLength){
			this.selectionStart = this.engine.textLength;
			return false;
		}
		return true;
	};
/*
 *	基礎機能・テキストエリア内容をクリア
 */
	nas.HTML.Console.prototype.clear  = function(){
		this.screen.value = ((this.callhost)? this.prompt:'>') + ' ';
		this.textLength   = new Number(this.screen.value.length);
	}
/*
 *	基礎機能・イベントを受け取り必要に従ってコマンドを実行してコンソールを書き換える
 */
	nas.HTML.Console.prototype.cct = function(eVt){
		if((this.engine.textLength == this.value.length) && (eVt.keyCode == 8))return false;
//console.log(eVt);
/*コンソールにヒストリをもたせる*/
        if(eVt.keyCode == 18){
			this.engine.commandBackupSet();
            this.engine.changeHost();
            return false;
        }
		 if((eVt.keyCode == 38)||(eVt.keyCode == 40)){
			if(
				(this.engine.commandOffset == 0)&&
				(this.value.length > this.engine.textLength)
			){
//オフセットなしでヒストリコールの際はバックアップに現在編集中のコマンドを一時控え
				this.engine.commandBackupSet();
			}
//プロンプト後方の編集行クリア
			this.value = this.value.slice(0,this.engine.textLength);
//ヒストリバッファの内容をオフセットにしたがって呼び出し
			if (this.engine.commandStore.length){
				if (eVt.keyCode == 38){
					this.engine.commandOffset ++;
				}else if (eVt.keyCode == 40){
					this.engine.commandOffset --;
				}
				if(this.engine.commandOffset < 0){
					this.engine.commandOffset = 0;
					//return false;
				}else if(this.engine.commandOffset >= this.engine.commandStore.length){
					this.engine.commandOffset = this.engine.commandStore.length;
					//return false;
				}
				if(this.engine.commandOffset == 0){
//console.log('オフセット==ゼロ・編集中バッファに復帰')
					this.value += this.engine.commandBackup.text;
					var ofst = this.engine.textLength + this.engine.commandBackup.offset
					this.setSelectionRange(ofst,ofst);
				} else {
/*
	ヒストリオフセットからヒストリ内のコマンドを呼び出し
	[0:6,1:5,2:4,3:3,4:2,5:1]
	length:6
	5 - ((offset - 1) % 6)
*/
					var shift = (this.engine.commandStore.length - 1) - ((this.engine.commandOffset - 1) % this.engine.commandStore.length);
					this.value += this.engine.commandStore[ shift ];
					this.engine.commandOffset = this.engine.commandStore.length - shift;
				}
			}
			return false;
		} else if(eVt.keyCode == 13){
			if((eVt.metaKey)||(eVt.ctrlKey)){
				this.value += "\n";
				return true;
			}
//編集行バッファ廃棄
			this.engine.commandBackup.text  = "";
			this.engine.commandBackup.offset= 0 ;
//ここでコマンドを取得して実行
			var cmd = this.value.slice(this.engine.textLength).trim().split(' ');
			if(cmd[0].indexOf(".") == 0){
//ドット導入の内部コマンド
                var func;//
                if(nas.HTML.Console.comlist[cmd[0]]){
                    if(nas.HTML.Console.comlist[cmd[0]].command){
                        func = nas.HTML.Console.comlist[cmd[0]].command;
                    }else{
                        func = nas.HTML.Console.comlist[nas.HTML.Console.comlist[cmd[0]]].command;
                    };
                };
                if(func instanceof Function)(func)(this.engine);//引数にエンジン渡し
			}else{
				if(nas.HTML.Console.comlist[cmd[0]]){
//登録済みコマンド
					if(
						(cmd[1])&&(cmd[1].indexOf('-') == 0)&&
						(((typeof global != 'undefined')&&(global[cmd[0]][cmd[1]]))||
						((typeof window != 'undefined')&&(window[cmd[0]][cmd[1]])))
					){
// help|usage

//						this.engine.putResult("\t:"+global[cmd[0]][cmd[1]]);
						this.engine.putResult("\t:"+window[cmd[0]][cmd[1]]);
						return false;
					}else{
//引数展開して実行
						cmd = (
							[nas.HTML.Console.comlist[cmd[0]].command+'(',
							...Array.from(cmd.slice(1),function(elm){return '"'+String(elm)+'"';}),
							')']
						);
					};
				};
//通常エンジンにコード文字列を渡して実行する
				this.engine.commandStore.add(cmd.join(' '));
				this.engine.commandOffset = 0;//リセット
                if((this.engine.callhost)&&(this.engine.callback instanceof Function)){
				    this.engine.callback(cmd.join(' '),this.engine.putResult);
                } else {
		    		this.engine.doCommand(cmd.join(' '));
			    };
			};
            return false;
		}
	}
/*TEST
    
*/
/**
	@params {Object|String} content
	コンソールに引数文字列を出力後入力待ち状態に遷移
 */
	nas.HTML.Console.prototype.log = function(content){
//		if(content instanceof Object) content = JSON.stringify(content);
		this.put('\n'+content);
	}
/**
 *	HTML色名テーブル
 */
nas.HTML.ColorName = {black:"#000000",silver:"#c0c0c0",gray:"#808080",white:"#ffffff",maroon:"#800000",red:"#ff0000",purple:"#800080",fuchsia:"#ff00ff",green:"#008000",lime:"#00ff00",olive:"#808000",yellow:"#ffff00",navy:"#000080",blue:"#0000ff",teal:"#008080",aqua:"#00ffff",orange:"#ffa500",aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",blanchedalmond:"#ffebcd",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",oldlace:"#fdf5e6",olivedrab:"#6b8e23",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",whitesmoke:"#f5f5f5",yellowgreen:"#9acd32",rebeccapurple:"#663399"};
// ==========
/*
 *	combobox extension
 *	要 JQuery-ui
 */
 $( function() {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
 
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            classes: {
              "ui-tooltip": "ui-state-highlight"
            }
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Show All Items" )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .on( "mousedown", function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .on( "click", function() {
            input.trigger( "focus" );
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
        // Remove invalid value
        this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
 
    $( "#combobox" ).combobox();
    $( "#toggle" ).on( "click", function() {
      $( "#combobox" ).toggle();
    });
  } );
//エレメントの値をすべてバックアップ(正常な処理の最後に呼ぶ)
function updateBk() {
	for (n = 1 ; n< BkValue.length ; n++) {
	elName = ElementName[n];
	BkValue[n] = document.nasExchg.elements[elName].value }
};

/*
	ログ関連
あまりつかってない
*/
//	ログ配列を初期化（）

nas.Log = new Array() ;
nas.Push_Log = function (str){this.Log = this.Log.concat([str]);}

//	ログ 初期化してみる
nas.Push_Log( "Program Started " + nas.VER);
nas.Push_Log( Date() );
nas.Push_Log( "  FrameRate" + nas.FRATE.toString() );
//nas_Push_Log( "  Start Mode  [" + MODE + "]" );
//

/*
	マウスバリスライダ
書いてはみたが
これは ひょっとしてなんかのパテントにふれる様な気がしてならない。
要調査
これを使うinputオブジェクトは、以下の書式でsliderVALUEを呼ぶ
sliderVALUE([event,エレメント名,上限,下限,小数点桁数(,初期値,方向,ステップ数)]);

初期値の挿入とロック時の動作を追加TC関連の拡張まだ(04.06.06)
formオブジェクトの参照からinputElementに変更
コード見直しで動作可能に
以前との互換は終了(10.09.20)
nas.HTML配下に本体関数を移動
旧コード互換エイリアスを作成
*/

nas.HTML.sliderVALUE = function(chnk) {
//配列で受け渡し [イベント,エレメントID,上限,下限,小数点桁数(,デフォルト値,スライド方向,step)]
	var startX = chnk[0].screenX;
	var startY = chnk[0].screenY;
	var slfocus = document.getElementById(chnk[1]);
	var slmax = 1*chnk[2];
	var slmin = 1*chnk[3];
	var sldig = 1*chnk[4];
	var baseValue = slmin;
	var sldir  = (chnk[6])? chnk[6]:"y";
	var slstep = (chnk[7])? chnk[7]:1;
//タイプが、input以外だったりロックされていたらモード変更なしでリターン
if (slfocus.disabled == true || (!(slfocus instanceof HTMLInputElement)) ) {return false}
//基準値取得
var currentValue = parseInt(slfocus.value)
if (isNaN(currentValue)) {
	if (chnk.length >= 6){baseValue = parseInt(chnk[5])}
} else {
	baseValue = currentValue;
};
//該当するエレメントのオンチェンジを保留してスライダモードに入る

	slfocus.blur();//	document.nasExch.elements[slfocus].onchange = '';
	document.body.sliderTarget = slfocus;
	document.body.sliderTarget.startX    = startX;
	document.body.sliderTarget.startY    = startY;
	document.body.sliderTarget.slmax     = slmax;
	document.body.sliderTarget.slmin     = slmin;
	document.body.sliderTarget.sldig     = sldig;
	document.body.sliderTarget.baseValue = baseValue;
	document.body.sliderTarget.sldir     = sldir;
	document.body.sliderTarget.slstep    = slstep;

switch (navigator.appName) {
case "Opera":
case "Microsoft Internet Explorer":
	document.body.onmousemove = nas.HTML.MVSlider_IE_;break;
case "Netscape":
	document.body.onmousemove = nas.HTML.MVSlider_NS_;break;
default:
	return;
}
	document.body.onmouseup = function(){
		this.onmousemove = null;
		this.onmouseup   = null;

//スライダの値が前の値と異なっていた場合のみ更新
		if (this.sliderTarget.value != this.sliderTarget.baseValue) {this.sliderTarget.onchange(event);}
		
		delete this.sliderTarget.startX;
		delete this.sliderTarget.slmax;
		delete this.sliderTarget.slmin;
		delete this.sliderTarget.sldig;
		delete this.sliderTarget.baseValue;
		delete this.sliderTarget;
		return;
	}

}
//
nas.HTML.MVSlider_NS_ = function MVSlider_NS_(event) {
	var diffValue = event.screenX - this.sliderTarget.startX;
	var Flgl = 1;
	if (diffValue < 0) Flgl= -1;
//ガンマかけて値をとる
	var newValue = this.sliderTarget.baseValue + (Flgl * (Math.pow(diffValue/100,2)*100));
//上限下限でおさえる
	if (newValue > this.sliderTarget.slmax) {newValue = this.sliderTarget.slmax} {
		if (newValue < this.sliderTarget.slmin) {newValue = this.sliderTarget.slmin}
	};
//sldigで小数点以下の桁だしを行い、ステップで丸める
	var exN = Math.pow(10,this.sliderTarget.sldig);
	newValue = Math.floor(newValue * exN)/exN;
	if(this.sliderTarget.slstep != 1)
	newValue = Math.floor(newValue / this.sliderTarget.slstep) * this.sliderTarget.slstep;
	if(this.sliderTarget.value != newValue) {
		this.sliderTarget.value = newValue ;
		if(this.sliderTarget.onchanging) this.sliderTarget.onchanging();
	};
}
//	nas.MVSlider_NS	=	MVSlider_NS_ ;


nas.HTML.MVSlider_IE_ = function MVSlider_IE_() {
	var diffValue = event.screenX - this.sliderTarget.startX;
	var Flgl = 1;
	if (diffValue < 0) Flgl= -1;
//ガンマかけて値をとる
	newValue = this.sliderTarget.baseValue + (Flgl * (Math.pow(this.diffValue/100,2)*100));
//上限下限でおさえる
	if (newValue > this.sliderTarget.slmax) {newValue = this.sliderTarget.slmax} {
		if (newValue < this.sliderTarget.slmin) {newValue = this.sliderTarget.slmin}
	}
//ステップで桁だし
	var exN = Math.pow(10,this.sliderTarget.sldig);
	newValue = Math.floor(newValue * exN)/exN;
	if(this.sliderTarget.value != newValue) {
		this.sliderTarget.value = newValue;
		if(this.sliderTarget.onchanging)this.sliderTarget.onchanging();
	}
}
//	nas.MVSlider_IE	=	MVSlider_IE_	;//
//マウスバリスライダ関連終了
/*
 * テーブルセルに対してサイズを一致させたINPUT/TEXTAREAを作成して入力値でそのテーブルの内容を置き換える
 * 機能オブジェクト
 * 
 * inputTypeフラグでINPUT/TEXTAREAを切り換える
 * "input" | "textarea" で指定 デフォルトは"input"
 * 
 * 同時に作成する入力コントロールはひとつのみ
 * 切替時に先の入力は消失する
 * 
 * あまり複雑なテーブル内容を書き換える際(特にタグやクォートがある内容)は注意
 * 変更時に内容をフィルタする必要あり
 * 
 * 	nas.HTML.editTabelCell.edit(セルオブジェクト[,初期値[,オンチェンジ関数]])
 * 
 * 指定するテーブルセルにはユニークなIDが必要である。
 * IDをもたないセルは編集対象にならない。
 * 
 * また ユニークID+"_ipt"を一時生成するInputのIDとして使用するため、
 * このIDがユニークになることも期待されている。
 * 
 * editTableCellを使用して変数等の編集をする場合は、
 * 使用時にeditTableCell.onChange()メソッドに使用する関数を登録すること。
 * 例
 * 
 * myOnChange=function(){VAR1=this.newContent;}
 * editTabelCell(document.getElementById("x0_0"),VAR1,myOnChange);
 * 
 * この操作関数がなければこのメソッドはテーブルの内容のみを書き換える
 * 関数中では以下のサブプロパティが参照可能
 * 
 * this.target     = null ;//対象セル HTMLTableCellElement
 * this.inputArea  = null ;//現在ホールドしている HTMLInputElement
 * this.orgContent = ""   ;//変更前のプロパティ(セル)の値
 * this.newContent = ""   ;//変更後の値
 * this.onChange   = null ;//変更時の実行関数
 * 実行後はクリアされるので参照不能
 * 
 * デフォーカス(ブラー)がかかった場合は、ステータスにfalseをセットして終了する戻り値はnullに置き換える。
 * 最終の値はnas.HTML.editTableCell.newContentで参照可能
 * 
 * optionでテーブル内にキャンセルボタンを表示可能にする。ボタン動作はエスケープと同じ ヤメる ボタンは邪魔
 * ただしこれを利用したダイアログボックスは作る
 */
nas.HTML.editTableCell = {
	inputType : "input",// input|textarea
	target    : null   ,//対象セル HTMLTableCellElement
	inputArea : null   ,//現在ホールドしている HTMLInputElement
	status    : false  ,//データステータス＞キャンセル基本
	orgContent: ""     ,//変更前のプロパティ(セル)の値
	newContent: ""     ,//変更後の値
	updCount  : 0      ,//なぜか２回連続でイベントが発生する際のイベントカウンタ AIR用
	onChange  : null   ,//function||null
}
nas.HTML.editTableCell.clear = function(){
//まとめてクリア
	this.target     = null;
	this.status     = false;
	this.inputArea  = 'input';
	this.onChange   = null;
	this.orgContent = "";
	this.newContent = "";
	this.updCount   = 0;
}
/**
 *	@params {Object HTMLTABLECell} myObj
 *	@params {String} inputType
 *	@params {String} myContent
 *	@params {String} myFunction
 * nas.HTML.editTableCell.edit(セルオブジェクト[,inputType[,初期値[,変更時関数]]])
 
 */
nas.HTML.editTableCell.edit = function(myObj,inputType,myContent,myFunction){
console.log(myObj);
	if((myObj==null)||(myObj === this.inputArea)){
//引数オブジェクトが編集バッファエレメントだった場合は、インプットの内容でセルを置き換えてonChangeを実行して、本体オブジェクトをリセットする
//なぜかAIR環境の際にchangeイベントが二回連続で発生するので二度目の動作を捨てるためのトラップ(要精査 2010・0913)
		if(this.updCount > 0) return false;
		this.updCount++;
//this.status は主にonChange内で処理する
		if(myObj == null){
			this.status = false;
			if(this.target) this.target.innerHTML = this.orgContent;//先に書き換える、onChangeで参照可能かつ変更可能に
		}else{
//	valueオブジェクトが存在する場合はオブジェクトを取得
			this.newContent = (myObj.value != undefined)? myObj.value:myObj.innerText;
			this.status = true;
			if(this.target) this.target.innerHTML = this.newContent;//先に書き換える、onChangeで参照可能かつ変更可能に
		};
		if(this.onChange instanceof Function){this.onChange(event)};
		if(this.target.innerHTML=="") this.target.innerHTML+="<br />";//空文字列の時 改行ひとつと置換
		var myResult = (this.status)? this.newContent:null;
		this.clear();//クリア
		return myResult;//
	}else if(
		!((myObj instanceof HTMLTableCellElement)||(myObj instanceof HTMLDivElement)||(myObj instanceof HTMLSpanElement))
	){
//オブジェクトなしでコールされた場合
//現在のターゲットがなければスキップ あればターゲットをリセットクリア
		if(! this.target){console.log(this.target);return false};//先の入力エリアが存在するか?
		this.target.innerHTML=this.orgContent;//復帰
		this.clear();
	}else if(this.target){
//セルあり 既存ターゲットセルと同じセルか
		if(myObj==this.target){
			return false;//スキップ
		}else{
//違うセルなのでいったん終了
			nas.HTML.editTableCell.edit(this.inputArea);
		};
	};
//機能初期化
	if(inputType) this.inputType = inputType;
	if(myFunction instanceof Function) this.onChange = myFunction;
	this.target     = myObj;
	this.updCount   = 0;
	this.orgContent = (!(myContent==undefined))? myContent:myObj.innerText;//控える
//ここでテーブルから取得される内容はタグを払った状態になる。タグを編集する必要がある場合はあらかじめ引数で内容を与えること
	this.newContent = this.orgContent;
	if(! this.inputArea) this.inputArea = null;
	var myWidth=myObj.clientWidth;var myHeight=myObj.clientHeight;
	if(inputType=="textarea"){
		myObj.innerHTML="<textArea id=\""+myObj.id+"_ipt\">"+this.orgContent+"</textArea>";
	}else{
		myObj.innerHTML="<input type=\"text\" id=\""+myObj.id+"_ipt\" value=\""+this.orgContent+"\">";
	}
//入力を設定
	this.inputArea = document.getElementById(myObj.id+"_ipt");
	this.inputArea.style.width  = myWidth+"px";
	this.inputArea.style.height = myHeight+"px";
	this.inputArea.parentCell   = myObj;
	this.inputArea.onchange =function(e){nas.HTML.editTableCell.edit(this);}
	this.inputArea.onblur   =function(e){nas.HTML.editTableCell.edit(null);};//no button
	this.inputArea.onkeyup	=function(e){
		if(e.keyCode==27){nas.HTML.editTableCell.edit(null);};
		return true;
	};
	this.inputArea.focus();
/*	事前処理終了
初期化が行われたので必要なあたらしいターゲットを設定
ターゲットと同サイズのインプットを開く
初期値は、引数で与えられた場合はそちら、なければテーブルの内容
*/
}
/*=====================================*/
//モーダルダイアログパネル
/*
alert/confirm/propmpt 等の代替モーダルダイアログパネルを表示させる。
機能的にはブラウザ本来のものとほぼ同等だったけど もうだいぶ変わった
AIRにはそもそも"showModalDialog"メソッドがなかったでのAIRでは不使用! とほほ
nas.showModalDialog(type[,msg[,title[,startValue[,myFunction]]]])

    @params {String}	type
    dialog type	alert|confirm|confirm2|prompt|prompt2
    タイプ2のconfirm|promptは選択肢が(yes/no/cancel)になる。
    @params {String | Array of String}    msg
    メッセージテキスト メッセージはタグ使用可能
    msgが配列であった場合は、0番要素をプロンプトに１番以降の要素を文字列として連結してプロンプトの下側に表示させる
    ボタンUI等は第二メッセージ以降に配置したほうが作業性が高い
    @params {String}    title
    ウインドウタイトル
    @params {String}    startValue
    textプロンプト初期値
    @params {Function}  callback
    ネイティブなモーダルパネルではなくなるので終了関数が必要 終了関数自体は自分自身を呼び出してその中で実行している
    prompt|prompt2 を使用するとデータ入力用テキストボックスを使用できる
    終了関数内部で参照する一般プロパティは

	this.status=0;//状態初期値 0:yes 1:no 2:cancel
	this.startValue=startValue;//プロンプト初期値
	this.value=this.startValue;//プロンプトの終了値
例：
nas.HTML.showModalDialog("prompt",["msg",document.getElementById("TCIFTemplate").innerHTML],"TCtest","12+0",function(){alert(this.status+": "+this.value)});

*/
nas.HTML.showModalDialog = function(type,msg,title,startValue,callback,fullscreen){
//    if(typeof fullscreen == 'undefined') fullscreen = [0,0] ;
//"alert","confirm","confirm2","prompt","prompt2","result"
	if(type !="result"){
		if(! type)       type = "alert" ;
		if(! msg)        msg  = ""      ;
		if(! (msg instanceof Array)){
			msg = [msg]      ;
			msg.push("")     ;
			console.log(msg) ;
		}
		if(! title)      title      = type;
		if(! startValue) startValue = ""  ;
		if(! callback){
			callback = function(result){
				console.log([result,this.value,this.startValue]);
			}
		};
	nas.HTML.type       = type;
	nas.HTML.msg01      = msg[0].replace(/\r?\n/g,"<br>");
	nas.HTML.msg02      = msg.splice(1).join('');//UIのリターン置きかえは無し
	nas.HTML.title      = title
	nas.HTML.startValue = startValue;
	nas.HTML.status     = 0;//状態初期値 0:yes 1:no 2:cancel
	nas.HTML.value      = startValue;
	nas.HTML.exFunction = callback;

//初回実行時にモーダルパネルオブジェクトを生成しておく(旧形式モーダルバリヤー)
	if (!this.modalLayer){
		var mdlPnl=document.createElement("div");
		mdlPnl.id="nas_modalLayer";
		var mdlLyr=document.body.appendChild(mdlPnl);
//		mdlLyr.style.position="fixed";
//		mdlLyr.style.left="0px";
//		mdlLyr.style.top="0px";
//		mdlLyr.style.width="100%";
//		mdlLyr.style.height="100%";
//		mdlLyr.style.background="#222222";

//var myContent="<span id='nas_modalDialog' style='padding:6px;background:#EEEEEE;position:fixed;top:192px;left:240px;border-style:double'>";
var myContent="<div id='nas_modalDialog'>";
myContent+="<span id='nas_modalMsg'>Message</span><br>";
myContent+="<input id='nas_modalInput'></input><br>";
myContent+="<div id='nas_modalUI'> </div>";
myContent+="<div style='text-align:right;'>";
myContent+="<button id='nas_modalBt0' class='modalBt'>OK</button>";
myContent+="<button id='nas_modalBt1' class='modalBt'>NO</button>";
myContent+="<button id='nas_modalBt2' class='modalBt'>CANCEL</button>";
myContent+="</div>";
myContent+="</div>";
mdlLyr.innerHTML=myContent;
		document.getElementById("nas_modalInput").style.width="90%";
//		document.getElementById("nas_modalInput").onchange=function(){nas.HTML.showModalDialog("result",0)};
		document.getElementById("nas_modalBt0").onclick=function(){nas.HTML.showModalDialog("result",0)};
		document.getElementById("nas_modalBt1").onclick=function(){nas.HTML.showModalDialog("result",1)};
		document.getElementById("nas_modalBt2").onclick=function(){nas.HTML.showModalDialog("result",2)};
		mdlLyr.style.display="none";
		this.modalLayer=mdlLyr;
/*            $("#nas_modalDialog").dialog({
                dialogClass:"wideDialog",
                autoOpen:false,
                modal:true,
                closeOnEscape:true,
                minWidth:Math.floor(0.6*document.body.clientWidth),
                draggable:false,
                resizable:false
            });//*/
            $("#nas_modalDialog").dialog({
                dialogClass:"nasModalDialog",
                autoOpen:false,
                modal:true,
                closeOnEscape:true,
                minWidth:Math.floor(0.25*document.body.clientWidth),
                draggable:true,
                resizable:true
            });
	};// */
//パネルサイズ初期化
        if(fullscreen){
        if(! (fullscreen instanceof Array)) fullscreen = [0,0];
var w = parseInt(window.innerWidth)  - fullscreen[0];
var h = parseInt(window.innerHeight) - fullscreen[1];
var a = 'left top';
var m = "left+"+fullscreen[0]+" top+"+fullscreen[1];
//console.log([w,h,a,m]);
            $("#nas_modalDialog").dialog({
                width:w,
                height:h,
                position:{at:a,my:m}
            });
        }else{
            $("#nas_modalDialog").dialog({
                width:"auto",
                height:"auto"
            });
        }
        $("#nas_modalDialog").dialog("option","title",nas.HTML.title);
        document.getElementById("nas_modalMsg").innerHTML=nas.HTML.msg01;
        document.getElementById("nas_modalUI").innerHTML =nas.HTML.msg02;
	nas.HTML.UIwell  = document.getElementById("nas_modalUI");
	nas.HTML.UIStore = document.getElementById("ModalUIStore");
	if(nas.HTML.UIwell.children.length) nas.HTML.UIStore.appendChild(nas.HTML.UIwell.childNodes[0]);
	if(nas.HTML.msg02 instanceof HTMLElement) nas.HTML.UIwell.appendChild(nas.HTML.msg02);
	document.getElementById("nas_modalInput").value = nas.HTML.value;
	switch(nas.HTML.type){
	case	"alert":;
		document.getElementById("nas_modalBt0").style.display="inline";
		document.getElementById("nas_modalBt1").style.display="none";
		document.getElementById("nas_modalBt2").style.display="none";
	break;
	case	"confirm2":;
	case	"prompt2" :;
		document.getElementById("nas_modalBt0").style.display="inline";
		document.getElementById("nas_modalBt1").style.display="inline";
		document.getElementById("nas_modalBt2").style.display="inline";
	break;
	case	"prompt":;
	case	"confirm":;
		document.getElementById("nas_modalBt0").style.display="inline";
		document.getElementById("nas_modalBt1").style.display="none";
		document.getElementById("nas_modalBt2").style.display="inline";
	}
	switch(nas.HTML.type){
	case	"alert":;
	case	"confirm2":;
	case	"confirm":;
		document.getElementById("nas_modalInput").style.display="none";
	break;
	case	"prompt2" :;
	case	"prompt":;
		document.getElementById("nas_modalInput").style.display="inline";
	break;
	}
//スクロールロック
			nas.HTML.addClass(document.body,'scroll-lock');
//パネルを開く
	$("#nas_modalDialog").dialog("open");
  }else{
//	return;
  if(false){
	window.showModalDialog(
		"./template/nasDialog.html",
		this,
		"dialogWidth:320px;dialogHeight:192px;center:yes;status:off"
	);
  }
  nas.HTML.status = msg;//処置前なので配列化の影響を受けない
  nas.HTML.value  = document.getElementById("nas_modalInput").value;
  var myResult;//ync以外はjavaScript互換の値を返す
	switch(nas.HTML.type){
	case    "alert":
	case  "confirm":
		myResult =(nas.HTML.status==0)? true:false;
		break;
	case "prompt":
		myResult =(nas.HTML.status==0)? nas.HTML.value:null;
		break;
	case "prompt2":
	case "confirm2":
		myResult =[nas.HTML.status,nas.HTML.value]
		break;

	}
//	========================================= alert("modlLayr : "+myResult+ " : status: "+this.status);
//	this.modalLayer.style.display="none";
	if(nas.HTML.exFunction) nas.HTML.exFunction(myResult);//ファンクション内では各種プロパティ参照可能

	$("#nas_modalDialog").dialog("close");
	nas.HTML.removeClass(document.body,'scroll-lock');
//	alert(myResult);
  }
}

//=====================HTMLInput汎用CT増減メソッド
/*nas.HTML.incrFCTonHTMLInput(targetElemetn,FCT)
	HTMLInputエレメントを指定してその値をTCとして増減させるメソッド
	引数
	myTarget	HTMLInputElement
	myValue	FCT
例：
	onclick='nas.HTML.incrFCTonHTMLInput(document.getElementById("nas_modalInput"),"-(1+0)")'
第二引数はFCT文字列 リザルトから空白と０オリジンマーカーを取り除く処理あり
元関数の調整が必要かも

	nas.HTML.incrFCTonHTMLInput(document.getElementById("iNputbOx"),"1+0");
*/
nas.HTML.incrFCTonHTMLInput = function(myTarget,myValue){
	if((!myTarget)||(!(myTarget instanceof HTMLInputElement))) return false;
	if(! myValue) return true;
	myTarget.value=nas.Frm2FCT(nas.FCT2Frm(myTarget.value)+nas.FCT2Frm(myValue),3,0).replace(/[\s\.]/g,"");
};
//=====================ウインドウをコンテンツにフィットさせる関数、引数は特になし

nas.HTML.sizeToContent = function(){
    if (appHost.paltform == "MSIE"){
//IE系の場合は大雑把にマッチ
//このプロパティはinnerWidth/Height と等価
		try{
	        var WinW=document.getElementById("uiTable").clientWidth+60;
	        var WinH=document.getElementById("uiTable").clientHeight+120;
	        window.resizeTo(WinW,WinH);
		}catch(e){
	        return e;
		}
	}else{
//他系列の場合は、sizeToContent()を呼ぶ
	    try{sizeToContent();}catch(e){return;};
	};
}

var nas_sizeToContent = nas.HTML.sizeToContent;

/*	cssルールセットから値を取得する関数
		nasメソッド
	nas.HTML.getCssRule( セレクタ, プロパティ, シートインデックス )
selector cssのセレクタを指定　CSSに記述したままの指定が必要
property cssプロパティ
sheetindex	"screen"=0 "print"=1
一致するプロパティがない場合は nullが戻る

0番にスクリーン用スタイルシート・1番にプリント用スタイルシートを設定することが多いがシートのIDで指定のこと
指定のない場合は、0番スタイルシートから順次検索して最初のヒットを戻す
eg.
nas.HTML.getCssRule('th.dialogSpan','width',0)

*/
nas.HTML.getCssRule = function( selector, property, sheetindex ) {
	if(arguments.length < 2) return null;
	selector = String(selector).toLowerCase();
	if( property.indexOf( "-" ) != -1 ) property = property.camelize( );
	var target = [];
	if( sheetindex == undefined ){
		for (var idx = 0; idx < document.styleSheets.length;idx ++){
			target.push(idx);
		};
	}else{
		target = [sheetindex];
	};
	for (var ix = 0;ix < target.length ; ix++){
		if(! document.styleSheets[target[ix]]) continue;
		try{
			var rules = document.styleSheets[target[ix]].cssRules;
			for(var i =(rules.length - 1); i >= 0; i-- ) {
				var rule = rules[i];
				if(
					((rule.selectorText)&&
					(rule.selectorText.toLowerCase() == selector))&&
					((rule.style)&&(rule.style[property] != "" ))
				) return rule.style[ property ];
				continue;
			};
		}catch(er){console.log(er);continue;};
	};
	return null;
}
/**
    cssスタイルシートセットからセレクタで指定したルールセットを検索して戻す
    sheetindexの指定がない場合は、0から順次検索
    @params {String}  selector
    @params {String}  sheetindex
    @returns {CSSStyleRule|null}
eg
    nas.HTML.findCSSRule('th.dialogSpan');
*/
nas.HTML.findCssRule = function(selector,sheetindex){
	if( selector == undefined ) return null;
	var target = [];
	if( sheetindex == undefined ){
		for (var idx = 0; idx < document.styleSheets.length;idx ++){
			target.push(idx);
		};
	}else{
		target = [sheetindex];
	};
	for (var ix = 0;ix < target.length ; ix++){
		if(! document.styleSheets[target[ix]]) continue;
		try{
			var rules = document.styleSheets[target[ix]].cssRules;
			for(var i =(rules.length - 1); i >= 0; i-- ) {
				if(
					((rules[i].selectorText)&&
					(rules[i].selectorText == selector))
				) return rules[i];
				continue;
			};
		}catch(er){console.log(er);continue;};
	};
	return null;
}
/**
    cssスタイルシートセットからセレクタで指定したルールセットをすべて削除する
    sheetindexの指定がない場合はアクセス可能なすべてのスタイルシートの情報を削除
    @params {String}  selector
    @params {String}  sheetindex
    @returns {CSSStyleRule|null}
eg
    nas.HTML.findCSSRule('th.dialogSpan');
*/
nas.HTML.deleteCssRule = function(selector,sheetindex){
	if( selector == undefined ) return null;
	selector = String(selector).trim();
	var target = [];
	if( sheetindex == undefined ){
		for (var idx = 0; idx < document.styleSheets.length;idx ++){
			target.push(idx);
		};
	}else{
		target = [sheetindex];
	};
	for (var itx = 0;itx < target.length ; itx++){
		if(! document.styleSheets[target[itx]]) continue;
		try{
			var rules = document.styleSheets[target[itx]].cssRules;
			for (var ix = rules.length - 1 ;ix >=0; ix --){
				if(
					(rules[ix].selectorText)&&
					(rules[ix].selectorText == selector)
				){
					document.styleSheets[target[itx]].deleteRule(ix);
				};
			};
		}catch(er){console.log(er);continue;};
	};
	return ;
}
/*
    @params {String}  selector
    @params {String}  property
    @params {Array|String}  region
    @returns {undefined|false}

		nasメソッド
	cssにルールセットを追加する関数
	nas.HTML.addCssRule( セレクタ, プロパティ, 適用範囲 )
セレクタ	cssのセレクタを指定
プロパティ	設定するプロパティをcssの書式で置く "{}"は補われるので不要
適用範囲	スタイルシートID、またはその配列もしくはキーワード"screen""print"または"both"(0,1 or both)
*** 	このメソッドは 0番にスクリーン用スタイルシート・1番にプリント用スタイルシートが
	ロード済みであることが前提条件 注意！！ IDの方が良いかも
	適用範囲をmedia文字列 (all|screen|tv|print...等)に変更
eg.
nas.HTML.addCssRule('th.dialogSpan','width:6em','both')
 */
nas.HTML.addCssRule= function( selector, property, region ) {

	if(region instanceof Array){
		var target = region;
	}else{
		var target = [];
		switch(region){
		case "screen":target = [0]  ;break;
		case "print" :target = [1]  ;break;
		case "both"  :
		default	  :target = [0,1];
		};
	};
	if( document.styleSheets[0].insertRule ){
		target.forEach(function(e){
			var targetSheet = document.styleSheets[e];
			if(targetSheet){
				targetSheet.insertRule(selector+" {"+property+"}",targetSheet.cssRules.length);
			};
		});
		return;
	}else{
		return false;
	};

//	if(( document.styleSheets[0].addRule)&&(! Safari) ){}
//Safari３は、addRuleとinsertRule両方のメソッドを持っているが、Mozilla互換っぽいので判定変更
	if(appHost.platform == "MSIE"){
//IE
switch(region){
case	"both":
	document.styleSheets[0].addRule( selector, "{" + property + "}" );
	document.styleSheets[1].addRule( selector, "{" + property + "}" );
	break;
case	"screen":
	document.styleSheets[0].addRule( selector, "{" + property + "}" );
	break;
case	"print":
	document.styleSheets[1].addRule( selector, "{" + property + "}" );
	break;
default:
}
	return;
	}else{
		if( document.styleSheets[0].insertRule ){
if(document.styleSheets[0].cssRules){
//Mozilla
switch(region){
case	"both":
	document.styleSheets[0].insertRule( selector + "{" + property + "}", document.styleSheets[0].cssRules.length );
	document.styleSheets[1].insertRule( selector + "{" + property + "}", document.styleSheets[1].cssRules.length );
	break;
case	"screen":
	document.styleSheets[0].insertRule( selector + "{" + property + "}", document.styleSheets[0].cssRules.length );
	break;
case	"print":
	document.styleSheets[1].insertRule( selector + "{" + property + "}", document.styleSheets[1].cssRules.length );
	break;
default:
}
}else{
//Chrome document.styleSheets[0].cssRules が常に null ?
var myCount=0;
switch(region){
case	"both":
	document.styleSheets[0].insertRule( selector + "{" + property + "}", myCount );
	document.styleSheets[1].insertRule( selector + "{" + property + "}", myCount );
	break;
case	"screen":
	document.styleSheets[0].insertRule( selector + "{" + property + "}", myCount );
	break;
case	"print":
	document.styleSheets[1].insertRule( selector + "{" + property + "}", myCount );
	break;
default:
}
}
	return;
		}else{	return false;}
}}
/*
    @params {String}  selector
    @params {String}  property
    @params {String}  region
    @returns {undefined|false}

		nasメソッド
	cssルール設定を上書きする関数
	nas.HTML.setCssRule( セレクタ, プロパティ, 適用範囲 )
セレクタ	cssのセレクタを指定
セレクタがそのCSSに存在しない場合、新規ルールセットを追加して適用する

プロパティ	設定するプロパティをJSでなくcssの書式で置く "{}"は補われるので不要
適用範囲	"screen""print"または"both|all"(0,1 or both)
*** 	このメソッドは 0番にスクリーン用・1番にプリント用、2番にnas_HTMLが
	ロード済みであることが前提条件 注意！！ IDの方が良いかも
	region引数をmedia文字列に変更する
eg.
nas.HTML.setCssRule('th.dialogSpan','width:6em','both')
nas.HTML.setCssRule('th.dialogBox','border-width:2px;height:2cm','both')
//2023 追加分の関数なのでIEは完全に対象外	
 */

nas.HTML.setCssRule = function( selector, property, region ) {
	if(region instanceof Array){
		var target = region;
	}else{
		var target = [];
		switch(region){
		case "screen":target = [0]  ;break;
		case "print" :target = [1]  ;break;
		case "lib"   :target = [2]  ;break;
		case "both"  :target = [0,1];break;
		case "all"   :
		default	  :target = [0,1,2];
		};
	};
console.log(document.styleSheets[0]);
	if( document.styleSheets[0].insertRule ){
		target.forEach(function(e){
			var targetRule = nas.HTML.findCssRule(selector,e);
			if(targetRule){
				property.split(';').forEach(function(rv){
					targetRule.style[(rv.split(':')[0]).camelize()] = [rv.split(':')[1]];
				});
			}else{
				nas.HTML.addCssRule(selector,property,e);
			};
		});
		return;
	}else{
		return false;
	};
}
/*
	htmlオブジェクトのテキストの選択状態を返すメソッド
	nas.HTML.getAreaRange(htmlObject)
	返値はオブジェクト
	result.start	整数
	result.end	整数
*/
nas.HTML.getAreaRange = function(obj) {
	var pos = new Object();

	if (appHost.platform == "MSIE") {
		obj.focus();
		var range = document.selection.createRange();
		var clone = range.duplicate();

		clone.moveToElementText(obj);
		clone.setEndPoint( 'EndToEnd', range );

		pos.start = clone.text.length - range.text.length;
		pos.end = clone.text.length - range.text.length + range.text.length;
	} else if(window.getSelection()) {
		pos.start = obj.selectionStart;
		pos.end = obj.selectionEnd;
	}
return pos;
// alert(pos.start + "," + pos.end);
}
/*
	テキストカレットを設定

//テキストエリアに挿入メソッド追加
//カレット位置は挿入点の後方へ
HTMLTextAreaElement.prototype.insert=function(insertText){
	//自分自身のカレット位置を出す
	var myPos= nas.HTML.getAreaRange(this);
	var range = this.value.slice(myPos.start, myPos.end);
	var beforeNode = this.value.slice(0, myPos.start);
	var afterNode = this.value.slice(myPos.end);
	this.value=beforeNode+insertText+afterNode;

}
*/
nas.HTML.getTextRange = function(obj) {
// textarea の文字が選択されてない場合はフォーカスが必要
        obj.focus();
        return document.selection.createRange();
    }

nas.HTML.textAreaInsert = function(myText) {
      if ((window.getSelection)&&(myText)) {
        // 古いIE 以外の場合
        // 選択部分の先頭の index と長さを取得
        var index = this.selectionStart;
        var length = this.selectionEnd - index;

        // 文字列を挿入
        this.value = this.value.substr(0, index) + myText + this.value.substr(index + length);
        // キャレット位置を挿入した文字列の最後尾に移動
        this.focus();
        var newCaretPosition = index + myText.length;
        this.setSelectionRange(
          newCaretPosition, newCaretPosition);
      }
    }
/**
    nas.HTML.timeIncrement(target,step,type)
引数
    target  ターゲットエレメント
    step    インクリメントステップをFCTまたはミリ秒で指定　自動判定
    type  　書き戻しの際のFCTtype 指定が無い場合は　type3(秒+コマ形式)
    ターゲットエレメントに　value プロパティが存在すればその値を　なければ　innerHTMLプロパティを取得して
    その値にstep値の値を加えて書き戻すメソッド
    ターゲットにonChange メソッドがあれば値変更時にコールする
    値制限は、ターゲット側で行う
*/
nas.HTML.timeIncrement = function(target,step,type){
    if ((! target)||(target.disabled)) return false;
    if (! type)     type = 3;
    var origValue  = (target instanceof HTMLInputElement)? nas.FCT2Frm(target.value):nas.FCT2Frm(target.innerHTML);//フレームに変換
    var stepFrames = (typeof step =='number')? nas.ms2fr(step):nas.FCT2Frm(step);
    var newValue   = origValue + stepFrames;//フレームで加算
    if ((origValue == 1)||(origValue != newValue)){
        if (target instanceof HTMLInputElement){
            target.value     = nas.Frm2FCT(newValue,type);
        }else{
            target.innerHTML = nas.Frm2FCT(newValue,type);
        };
        if(target.onchange){target.onchange(event);}
    };
    return newValue;
};

//お道具箱汎用データ操作関数群オワリ
/*
    タッチスクロール・ホイルスクロールの停止
    document.addEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
    document.addEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });

    一時停止解除
    document.removeEventListener('mousedown',nas.HTML.disableScroll,{ passive: false });
    document.removeEventListener('touchmove',nas.HTML.disableScroll,{ passive: false });
// */
// スクロールを禁止にする関数
nas.HTML.disableScroll = function disableScroll(evt){ evt.preventDefault();}
/*
    クラスリストにアイテムを追加
    classListのない古い環境のためのコードを含む
ex: nas.HTML.addClass(document.body,'scroll-lock');
*/
nas.HTML.addClass = function (element,className){
    if(element.classList){
        element.classList.add(className);
    }else{
        var classList = (element.className).split(' ');
        classList.add(className);
        element.className = classList.join(' ');
    }
}
/*
    クラスリストからアイテムを削除
    classListのない古い環境のためのコードを含む
ex: nas.HTML.removeClass(document.body,'scroll-lock');
*/
nas.HTML.removeClass = function (element,className){
    if(! element) return ;//誤指定のケース分岐
    if(element.classList){
        if(element.classList.contains(className)) element.classList.remove(className);
    }else{
        var classList = (element.className).split(' ');
        var ix = classList.indexOf(className);
        if(ix >= 0) classList.splice(ix,1);
        element.className = classList.join(' ');
    };
}
/**
 * 汎用引数内容テキストを指定のエンコードでファイルとして保存
 *
 *	@params {String}	contentText
 *	@params {String}	encoding
 *	@params {String}	path
 *	@params {Boolean}	noconfirm
 * ここでのencodingはnodeの形式で
 * ファイルアクセス環境が無い場合はダウンロードへ移行する（未実装）
 エンコード変換未実装 220621
 */
nas.HTML.writeTextFile = function (contentText,encoding,path,noconfirm){
	if(typeof contentText == 'undefined') return false;//
	if(typeof path        == 'undefined') path = new Date().getTime();//timestamp
	if(typeof encoding    == 'undefined') encoding = 'utf-8';//

/*書き出しをトライ appHost.platform=='Electron'のケースは、書き出しをサンドボックスへ依頼する*/
	if((contentText.length)&&((appHost.platform=='Electron')||(appHost.Nodejs))) {
		var savedir  = nas.File.dirname(path);
		if(! savedir) savedir = ((pman.reName)&&(pman.reName.baseFolder))?
			pman.reName.baseFolder :'/';//得られなかった場合はルートに設定する（アプリの位置は良くない）暫定値
		var savename = nas.File.basename(path);
			nas.showModalDialog(
				'prompt',
				nas.localize('フォルダ\n%1\nに、ファイル\n%2\nを保存します。\nファイル名を変更することができます。\n変更する場合はボックスの値を書き換えてください。\n同名のファイルは上書きされます。\n保存してよろしいですか？',savedir,savename),
				'保存',
				nas.File.basename(path),
				function(result){
					if(result){
						var savefile = nas.File.join(savedir,result);
						if(fs){
console.log(savefile + " : fs.writefileSync");
							fs.writeFileSync(savefile,contentText,{encoding:'utf-8'});
						}else{
console.log(savefile + " : parentModule.postMassage!");
							uat.MH.parentModule.window.postMessage({
								channel:'callback',
								from:{name:xUI.app,id:uat.MH.objectIdf},
								to:{name:'hub',id:uat.MH.parentModuleIdf},
								command:'electronIpc.writeFileSync(...arguments);',
								content:[savefile,contentText,{encoding:"utf-8"}],
								callback:''
							});//electronIpc.writeFileSync(savefile,content,{encoding:'utf-8'});
						};
					};
				},
				false
			);
	}else{
		nas.HTML.downloadData(contentText,encoding,nas.File.basename(path));
	}
}
/*TEST
	nas.HTML.fileWrite('ぶんぶく茶釜','./bukubuku.txt','utf8');
*/

//汎用のクリップボードテキスト書込
nas.HTML.sendText2Clipboard = function sendText2Clipboard(contentText){
	if(contentText){
//クリップボード転送
		var i = document.body.appendChild(document.createElement('textarea'));
		i.value = contentText;
		i.select();
		document.execCommand("Copy");
		document.body.removeChild(i);
		console.log('クリップボードに転送しました');
	};
}
/*TEST
	nas.HTML.sendText2Clipboard('ぶんぶく茶釜');
*/
/**
 *    @params {Blob}    blob
 *    @params {String}  filename
 *    ダウンロード
 *    プログラム内で生成したデータをダウンロードする
 *    ファイル名が与えられない場合はtimestampを渡す
 */
nas.HTML.download = function download(blob, filename) {
  const objectURL = window.URL.createObjectURL(blob),
      a = document.createElement('a'),
      e = document.createEvent('MouseEvent');
//a要素のdownload属性にファイル名を設定 ファイル名指定がない場合はtimestamp
    a.setAttribute('download', filename||new Date().getTime());
    a.href = objectURL;
//clickイベントを着火
    e.initEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
    return false;
}
/*TEST
nas.HTML.download(new Blob([xUI.XPS.toString()], {type : 'application/xps'}), 'test');
*/
/**
 *	@params	{Blob|String|Array|Blob}    content
 *		Blob,Blob化するテキスト文字列または配列
 *	@params	{String}	filename
 *		保存のためのファイル名
 *	引数の内容をBlob化してダウンロード encodingを与えるかまたはファイル名からエンコーディングを得る
 *	ファイル名の指定がない場合はダウンロード関数でシリアルタイムスタンプが与えられる
 *  
 */
nas.HTML.downloadData = function download(content,encoding,filename){
	if(typeof content == 'undefined') return false;//
	if(typeof encoding == 'undefined') encoding = '';//
	if(typeof filename == 'undefined') filename = '';//timestamp

	const encode = {
		sjis:'SJIS',
		utf8:'UTF8',
		eucjp:'EUCJP',
		ascii:'ASCII',
		bin:'BINARY',
		jis:'JIS',
		utf16:'UTF16',
		utf16bd:'UTF16BE',
		utf16le:'UTF16LE',
		utf32:'UTF32'
	};
	if(filename){
//拡張子を含み上位ディレクトリを含めない保存ファイル名
		filename = nas.File.basename(filename);
//拡張子を抽出
		var myExt = nas.File.extname(filename);
//		if(! myExt) myExt="txt";//?
		if(myExt){
//登録拡張子はエンコーディングを強制
			switch (myExt){
			case ".tdts":
			case ".xdts":
				content = content.replace(/\r?\n/g,"\n");
				encoding="utf8";
			break;
			case ".tsh":
				content = content.replace(/\r?\n/g,"\r")+"\n";
			case ".eps":
			case ".csv":
			case ".ard":
				encoding="sjis";
			break;
			};
		};
	};
	if(! encoding) encoding = 'binary';//
	if(!(content instanceof Blob)){
//ファイルとしてmimeTypeを設定して保存
//Blob化・
		if(encoding.match(/binary|utf32|ascii/)){
//タイプ指定なし・必要な場合はあらかじめblob化して渡すか、直接downloadを呼ぶ
			var blob = new Blob([content]);
		}else if( encoding == 'utf8'){
//utf-8には無条件でbomを付加
			let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
			var blob = new Blob([bom,content], {type: nas.File.contentType(filename)});
		}else{
//encodingにあわせてコンバート
			let array = Array.from(content,e => e.charCodeAt(0));
			let convertedArray = Encoding.convert(array, encode[encoding], 'UNICODE');
			let binArray       = new Uint8Array(convertedArray);
			var blob           = new Blob([binArray], {type: nas.File.contentType(filename)});
		}
	}else{
//blob直接
		var blob = content;
	};
	return nas.HTML.download(blob,filename);
}
/*TEST
	nas.HTML.downloadData("狸の泥舟1234\n","euc","test.text")
	nas.HTML.downloadData(new Blob(["狸の泥舟1234\n"], {type : 'application/xps'}),'', 'test.xps');
*/
//------簡易テキストエディタ 2022 06 21
/**
	簡易型のテキストエディタ
	結果をアプリケーション内で利用する際はコールバック関数を渡す
*/
nas.HTML.miniTextEdit = {
	msg:"汎用ミニテキストエディタです",
	title:"汎用ミニテキストエディタ",
	content:"",
	filename:""
};
/**
 *	@params {String}	content
 *	@params {String|Array}	msg
 *	@params {String}	title
 *	@params {Function}	callback
 *	簡易テキストエディタ を立ち上げる
 *	引数を表示して編集を促す
 *	ファイル保存｜ダウンロード｜クリップボード転送をサポート
 *	callback関数は保留テキストの内容を引き渡すことが可能に20240626
 */
nas.HTML.miniTextEdit.init = function(content,msg,title,filename,callback){
	if(!(msg instanceof Array)) msg = [msg]
	if(typeof content == 'undefined') content = this.content;
	if(typeof msg[0] == 'undefined')     msg[0]     = this.msg;
	if(typeof title == 'undefined')   title   = this.title;
	if(typeof filename == 'undefined')   filename = this.filename;
	this.content = content;
	this.msg     = msg[0];
	this.title   = title;
	this.filename = filename;
	msg.push('<br><hr>');
	if(appHost.platform == 'Electron')
		msg.push('<button class=modalBt onclick="nas.HTML.miniTextEdit.writeContent()">Save</button>');
	msg.push('<button class=modalBt onclick="nas.HTML.miniTextEdit.downloadContent()">Download</button><button class=modalBt onclick="nas.HTML.miniTextEdit.sendClipboard()">Copy</button><button class=modalBt onclick="nas.HTML.miniTextEdit.clear()">Clear</button><button class=modalBt onclick="nas.HTML.miniTextEdit.reset()">Reset</button><br>filename:<input id=miniTextFilename type=text size = 42><br><textarea id="miniTextContent" style="height:320px;width:480px;">QQX</textarea>');
	nas.showModalDialog(
		"alert",
		msg,
		title,
		'',
		function(){
			nas.HTML.miniTextEdit.content = document.getElementById("miniTextContent").value;
		}
	);
	$("#nas_modalDialog").keyup(function(e) {
		if ((e.keyCode == 13)&&(e.target == document.getElementById("miniTextContent"))){
			document.getElementById("miniTextContent").insert("\n");
		};
	});//*/
	this.reset();
}
//編集位置に単語を挿入
nas.HTML.miniTextEdit.insert = function(str){
	document.getElementById("miniTextContent").insert(str);
	document.getElementById("miniTextContent").focus();
}

//ミニテキストエディタをクリア
nas.HTML.miniTextEdit.clear = function(){
	document.getElementById("miniTextContent").value = '';
	document.getElementById("miniTextFilename").value = this.filename;
}
//ミニテキストエディタを最後の状態にリセット
nas.HTML.miniTextEdit.reset = function(){
	document.getElementById("miniTextContent").value = this.content;
	document.getElementById("miniTextFilename").value = this.filename;
}
//編集内容をダウンロードして保存(WEB|Electron兼用)
nas.HTML.miniTextEdit.downloadContent = function(){
	if (document.getElementById('miniTextContent')){
		nas.HTML.miniTextEdit.content  = document.getElementById('miniTextContent').value;
		nas.HTML.miniTextEdit.filename = document.getElementById('miniTextFilename').value;
		nas.HTML.downloadData(nas.HTML.miniTextEdit.content,'',nas.HTML.miniTextEdit.filename);
	};
}
//編集内容をローカルファイルへ保存(Electron専用)
nas.HTML.miniTextEdit.writeContent = function(){
	if (document.getElementById('miniTextContent')){
		nas.HTML.miniTextEdit.content  = document.getElementById('miniTextContent').value;
		nas.HTML.miniTextEdit.filename = document.getElementById('miniTextFilename').value;
		nas.HTML.writeTextFile(nas.HTML.miniTextEdit.content,'utf-8',nas.HTML.miniTextEdit.filename);
	};
}
//現在の内容をクリップボードへ転送してオブジェクトを更新
nas.HTML.miniTextEdit.sendClipboard = function(){
//クリップボード転送 / clipboard copy * 冗長だが、ユーザが操作中の要素を選択状態にして操作を目視できるようにここでは重複コードを書く
	if (document.getElementById('miniTextContent')){
		document.getElementById('miniTextContent').select();
		document.execCommand("Copy");
		xUI.printStatus('クリップボードに転送しました');
	};
	this.content  = document.getElementById('miniTextContent').value;
	this.filename = document.getElementById('miniTextFilename').value;
//	nas.HTML.sendText2Clipboard(this.content);
}
/*TEST
	nas.HTML.miniTextEdit.init(
		JSON.stringify(config.extApps.members,0,2),
		"外部アプリケーションデータの編集をします\nOKボタンでデータが更新されます",
		"外部アプリケーションテーブル",
		"config.extApp.members.json",
		function(content){config.extApps.members = JSON.parse(content);}
	);
*/
//------簡易テキストエディタ 2022 06 21//
/**
 *	スクロールドラッガブル要素設定
 *		右クリックを通す
 *		リリースの際にフットマークを残す
 *	キャンセルフラグが立っていればスキップ
 * このメソッドは、引数で指定されたエレメントをドラグスクロール可能にする
 * スターター要素は親要素からイベントを引き継ぐ
 * Vanila,pointerイベントに書き換え 2023 11 25
 * mouse|touch　両イベント対応で再調整 11 30
 */
nas.HTML.mousedragscrollable = function mousedragscrollable(elements){
	if(elements instanceof HTMLCollection){
		elements = Array.from(elements)
	}else if(typeof elements == 'string'){
		if(elements.match(/^\.(.*)$/)){
			elements = Array.from(document.getElementsByClassName(RegExp.$1));//クラス
		}else if(elements.match(/^\#?(.*)$/)){
			elements = [document.getElementById(RegExp.$1)];//id
		};
	};
	if(!(elements instanceof Array)) elements = Array.from(document.getElementsByClassName('mousedragscrollable'));
	elements.forEach(function(e){
//エレメントにマウスモーダルバリヤを設定
		e.style.transform = 'scale(1, 1)';
		var ovl = document.createElement('div');
		ovl.className = 'mousedragscrollable_overlay';
		ovl.addEventListener('mousedown',function(evt){evt.preventDefault();evt.stopPropagation();return false;})
		ovl.style.height = e.scrollHeight + 'px';
		ovl.style.width  = e.scrollWidth  + 'px';
		e.appendChild(ovl);
//  nas.HTML.setCssRule('.mousedragscrollable_overlay','display:none;')        ;//解除 (デフォルト)
//  nas.HTML.setCssRule('.mousedragscrollable_overlay','display:inline-block;');//ブロック

//		e.addEventListener('click',function(evt){console.log('click : '+evt.target.id);evt.stopImmediatePropagation();evt.stopPropagation();evt.preventDefault();return true;});
//		e.addEventListener('mousedown' , nas.HTML.mousedragscrollable.ptHandle);
//		e.addEventListener('touchstart', nas.HTML.mousedragscrollable.ptHandle);
		e.addEventListener('mousedown',function ptHandle(evt){
//console.log(evt.target.id);
//console.log(evt.target.type);
			if(nas.HTML.mousedragscrollable.movecancel) return true;
			if(!(nas.HTML.mousedragscrollable.down)){
				evt.preventDefault();
				nas.HTML.mousedragscrollable.target = e; // 動かす対象をピックアップ
				nas.HTML.mousedragscrollable.target.style.cursor = "grabbing";
				nas.HTML.mousedragscrollable.ptHandle(evt);
			}
		});
		e.addEventListener('touchstart',function ptHandle(evt){
console.log(evt.target.id);
//console.log(evt.target.type);
			if(nas.HTML.mousedragscrollable.movecancel) return true;
			if(!(nas.HTML.mousedragscrollable.down)){
				evt.preventDefault();
				nas.HTML.mousedragscrollable.target = e; // 動かす対象をピックアップ
				nas.HTML.mousedragscrollable.ptHandle(evt);
				if(evt.target.click){
console.log(evt.target)
					nas.HTML.addClass(evt.target,'mousedragscrollable_select');//e.style.opacity = 0.86 // 透明度でハイライト
					evt.target.addEventListener('pointerleave',function(evnt){nas.HTML.removeClass(evnt.target,'mousedragscrollable_select');},{once:true});
				};
			}
		});
/*
		e.addEventListener('pointerdown',function nas.HTML.mousedragscrollable.ptHandle(evt){
console.log(evt.target.id);
console.log(evt.target.type);

			if(nas.HTML.mousedragscrollable.movecancel) return true;
			event.preventDefault();
			nas.HTML.mousedragscrollable.target = e; // 動かす対象をピックアップ
			nas.HTML.mousedragscrollable.target.style.cursor = "grabbing";

			nas.HTML.mousedragscrollable.down = true;//ポインタダウン時に更新
			nas.HTML.mousedragscrollable.move = false;//ポインタムーブ時に更新
			nas.HTML.mousedragscrollable.x = evt.clientX;
			nas.HTML.mousedragscrollable.y = evt.clientY;
			nas.HTML.mousedragscrollable.scrollleft = nas.HTML.mousedragscrollable.target.scrollLeft;
			nas.HTML.mousedragscrollable.scrolltop  = nas.HTML.mousedragscrollable.target.scrollTop;

//ドラグストローク停止
//			document.addEventListener('mouseover'  ,nas.HTML.disableScroll,{ passive: false });
			document.addEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
			document.addEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
			document.addEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
//			document.addEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
//ポインタ処理イベントリスナ設定
			document.addEventListener('pointermove',nas.HTML.mousedragscrollable.slHandle);

			document.addEventListener('mouseup'    ,nas.HTML.mousedragscrollable.rvHandle);
			document.addEventListener('pointerup'  ,nas.HTML.mousedragscrollable.rvHandle);
			document.addEventListener('touchend'   ,nas.HTML.mousedragscrollable.rvHandle);
//ポインタ離脱に対して
			nas.HTML.mousedragscrollable.target.addEventListener('pointerleave',nas.HTML.mousedragscrollable.rvHandle);
			return false;
		});// */
	});
}
//移動フットマーク
nas.HTML.mousedragscrollable.footmark  = false;
nas.HTML.mousedragscrollable.down      = false;//ポインタダウン時に更新
nas.HTML.mousedragscrollable.move      = false;//ポインタムーブ時に更新
//マウスドラグ移動キャンセルフラグ
nas.HTML.mousedragscrollable.movecancel = false;
/*	ポインタハンドラ
*/
//開始ハンドラ
nas.HTML.mousedragscrollable.ptHandle = function(event){
//console.log(event);
//	if(nas.HTML.mousedragscrollable.movecancel) return true;
//	event.preventDefault();
//	nas.HTML.mousedragscrollable.target = e; // 動かす対象
//	nas.HTML.mousedragscrollable.target.style.cursor = "grabbing";

	nas.HTML.mousedragscrollable.down = true;//ポインタダウン時に更新
	nas.HTML.mousedragscrollable.move = false;//ポインタムーブ時に更新
	nas.HTML.mousedragscrollable.x = (event.type != 'touchstart')?
		event.clientX:event.touches[0].clientX;
	nas.HTML.mousedragscrollable.y = (event.type != 'touchstart')?
		event.clientY:event.touches[0].clientY;
	nas.HTML.mousedragscrollable.scrollleft = nas.HTML.mousedragscrollable.target.scrollLeft;
	nas.HTML.mousedragscrollable.scrolltop  = nas.HTML.mousedragscrollable.target.scrollTop;
	if(event.type != 'touchstart'){
//ドラグスクロール停止
		document.addEventListener('mousedown'  , nas.HTML.disableScroll,{ passive: false });
//ポインタ処理イベントリスナ設定
//		document.addEventListener('mousemove'  , nas.HTML.mousedragscrollable.slHandle);
//終了処理
		document.addEventListener('mouseup'    , nas.HTML.mousedragscrollable.rvHandle);
	}else{
//ドラグスクロール停止
		document.addEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
//ポインタ処理イベントリスナ設定
//		document.addEventListener('touchmove'  ,nas.HTML.mousedragscrollable.slHandle);
//終了処理
		document.addEventListener('touchend'   ,nas.HTML.mousedragscrollable.rvHandle);
	};
//			document.addEventListener('mouseover'  ,nas.HTML.disableScroll,{ passive: false });
//			document.addEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//			document.addEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
			document.addEventListener('pointermove',nas.HTML.mousedragscrollable.slHandle);
//			document.addEventListener('pointerup'  ,nas.HTML.mousedragscrollable.rvHandle);
//ポインタ離脱に対して
	nas.HTML.mousedragscrollable.target.addEventListener('pointerleave',nas.HTML.mousedragscrollable.rvHandle);
	return false;
};

//ドラグ移動終了ハンドラ 
nas.HTML.mousedragscrollable.rvHandle = function(event){
console.log(event.type);
console.log(nas.HTML.mousedragscrollable.move);
    if(!(nas.HTML.mousedragscrollable.move)){
console.log(event.target.click instanceof Function)
		if((event.type == 'touchend')&&(event.target.click instanceof Function)){
//強制クリック
			event.target.click();
		};
	}else{
		nas.HTML.mousedragscrollable.move = false;
console.log('mouseup set click cancel')
//クリックキャンセル
//		nas.HTML.setCssRule('.mousedragscrollable_overlay','display:inline-block;','lib');//ブロック
	};
	if((nas.HTML.mousedragscrollable.down)||(nas.HTML.mousedragscrollable.move)){
	};
//	if(nas.HTML.mousedragscrollable.down) event.stopImmediatePropagation();
//	if(nas.HTML.mousedragscrollable.down) event.stopPropagation();
//	if(nas.HTML.mousedragscrollable.move) event.preventDefault();
	nas.HTML.mousedragscrollable.down = false;
	document.removeEventListener('pointermove',nas.HTML.mousedragscrollable.slHandle);
//	document.removeEventListener('mousemove',nas.HTML.mousedragscrollable.slHandle);
//	document.removeEventListener('touchmove',nas.HTML.mousedragscrollable.slHandle);
	if((event.type != 'pointerup')&&(nas.HTML.mousedragscrollable.target)){
		nas.HTML.mousedragscrollable.target.removeEventListener('pointerleave',nas.HTML.mousedragscrollable.rvHandle);
	}else{
console.log('remove')

//		document.removeEventListener('pointerup',nas.HTML.mousedragscrollable.rvHandle);
		document.removeEventListener(((event.type=='mouseup')?'mouseup':'touchend'),nas.HTML.mousedragscrollable.rvHandle);
	};
//タッチスクロール・ホイルスクロール再開
	if(event.type != 'touchend'){
		document.removeEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
	}else{
		document.removeEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
	};

//	document.removeEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//	document.removeEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });

	if(nas.HTML.mousedragscrollable.target){
		nas.HTML.mousedragscrollable.target.style.cursor = '';
		nas.HTML.mousedragscrollable.target = null;
	};
	nas.HTML.setCssRule('.mousedragscrollable_overlay','display:none;','lib')        ;//解除 (デフォルト)
}
//ドラグ移動ハンドラ pointermove
nas.HTML.mousedragscrollable.slHandle = function(evt){
// list要素内/外でのevent
	if (nas.HTML.mousedragscrollable.down){
//		evt.preventDefault();
//		evt.stopPropagation();
		let move_x = nas.HTML.mousedragscrollable.x - evt.clientX;
		let move_y = nas.HTML.mousedragscrollable.y - evt.clientY;
		if (Math.abs(move_x) > 3 || Math.abs(move_y) > 3) {
//detect move
			nas.HTML.mousedragscrollable.move = true;
//click block
			nas.HTML.setCssRule('.mousedragscrollable_overlay','display:inline-block;','lib');//ブロック
		}else{
//detect non move//リリース実行
			return;
		};
//		evt.preventDefault();
//		evt.stopPropagation();
		nas.HTML.mousedragscrollable.target.scrollTo(
			nas.HTML.mousedragscrollable.scrollleft + move_x,
			nas.HTML.mousedragscrollable.scrolltop  + move_y
		);
		return false;
	};
	return (((evt.button == 2)||(evt.metaKey))? true:false);
}
/*TEST
nas.HTML.mousedragscrollable('.mousedragscrollable');
*/

/*
	Progress表示Textを生成して app_status の内容を更新する


nas.HTML.showProgress = function showProgress(value,all,form){
	var statusText = "<br>";
	if(value < all) statusText = [value,all].join("/");
	if((document.getElementById("app_status"))&&(document.getElementById("app_status").innerHTML != statusText))
		document.getElementById("app_status").innerHTML = statusText;
	return statusText;
};// */
/* TEST
	nas.HTML.showProgress(15,100,"")
*/
/**
    スライダセレクタUI
    

	@params {Object HTMLDivElement} element
	@params {Array of String|Array of Object}       options
	@direction {String}       direction
	スライダセレクタ
	
	縦,横方向を引数で指定
	ボタンパレードを自動で作る
	既存のボタンがあればその値をオプションとして初期化
	onclickメソッドでvalueを更新
	onchangeメソッドを呼ぶ
	selectメソッドで選択
	複数選択可
eg.
    new nas.HTML.SliderSelect(
        document.getElementById(id),
        null,
        'vertical'
    )
*/
nas.HTML.SliderSelect = function(element,options,direction){
	this.element = document.createElement('div');
	this.element.className = 'nasHTMLSliderSelect';
	this.element.link      = this;
	this.element.focusItm  = null;//selectedOption
	this.element.selectedIndex = null;//selectedIndex
	this.element.direction     = 'vertical';//horizontal | vertical
	this.element.options       = [];
	this.element.multiple      = false;
	if(arguments.length) this.parse(element,options,direction);
}
nas.HTML.SliderSelect.prototype.parse = function(element,options,direction){
	if(element instanceof HTMLDivElement){
		this.element = element;
	}else if(typeof element == 'string'){
		if(
			(document.getElementById(element))&&
			(document.getElementById(element) instanceof HTMLDivElement)
		){
			this.element = document.getElementById(element);
		}else{
			this.element.id = element;
		};
	};
	nas.HTML.addClass(this.element,'nasHTMLSliderSelect');
	this.element.link       = this;
	this.element.focusItm   = null;
	this.element.value      = '';//トレーラーにvalueをアタッチ
	this.element.direction  = (direction != 'vertical')? 'hrizontal':'vertical';//トレーラーにdirectionをアタッチ
//
	if(!(this.element.onchange instanceof Function)) this.element.onchange = function(){console.log(this.value);};//既存の関数があれば残す
//options : [string1,string2,string3...]; [{value:'12',text:'12番',}]
	if((!(options instanceof Array))&&(this.element.children.length)){
		options = Array.from(this.element.children,function(e){return e.innerHTML});
	};
	this.setOptions(options);
	if(direction != 'vertical'){
		nas.HTML.removeClass(this.element,'nasHTMLSliderSelect-v');
		nas.HTML.addClass   (this.element,'nasHTMLSliderSelect-h');
	}else{
		nas.HTML.removeClass(this.element,'nasHTMLSliderSelect-h');
		nas.HTML.addClass   (this.element,'nasHTMLSliderSelect-v');
	};
}
/*セレクタを初期化する*/
nas.HTML.SliderSelect.prototype.init = function(){
//	this.element.addEventListener('mousedown' ,nas.HTML.SliderSelect.ptHandle);
//	this.element.addEventListener('touchstart',nas.HTML.SliderSelect.ptHandle);
	this.element.addEventListener('wheel',nas.HTML.SliderSelect.slHandle);
	this.element.addEventListener('pointerdown',nas.HTML.SliderSelect.ptHandle);
	Array.from(this.element.children).forEach(function(e){
//		e.addEventListener('mousedown' ,nas.HTML.SliderSelect.ptHandle);
//		e.addEventListener('touchstart',nas.HTML.SliderSelect.ptHandle);
		e.addEventListener('pointerdown',nas.HTML.SliderSelect.ptHandle);
		e.addEventListener('pointerenter',nas.HTML.SliderSelect.ptEnter);
		e.addEventListener('pointerout'  ,nas.HTML.SliderSelect.ptOut);
	});
	this.element.addEventListener('keydown',nas.HTML.SliderSelect.kbHandle);
	this.element.addEventListener('keyup'  ,nas.HTML.SliderSelect.kbHandle);
}
/*
    @parames {Array of String|Array of Object|HTMLCollection} options
セレクタのオプションリストを更新する
オプションは、ボタンエレメントに変換される
引数要素がボタンオブジェクトであった場合はそのまま利用
それ以外のオブジェクトなら以下の一定のプロパティを引き継ぐ
'value','innerText','selected','id','title','onclick','className','style'

eg. [{innerText:"s-c123(72)[active]",className:"document-selector-option-left",value:"ABC#1//c-s123",selected:true}]
*/
nas.HTML.SliderSelect.prototype.setOptions = function(options){
	if(options instanceof HTMLCollection) options = Array.from(oprions);
	if(!(options instanceof Array)) return this;
	this.element.innerHTML  = '';//クリア
	this.element.options    = [];//クリア
	options.forEach(function(e){
	    var opt = {value:'',text:'',selected:false};
		if(typeof e == 'string'){
//as text
			var bt = document.createElement('button');
			bt.innerHTML = e;
			opt.value = e;
			opt.text  = e;
		}else{
//as object HTMLButtonElement || other Object
			if(e instanceof HTMLButtonElement){
				var bt = e;
			}else{
				var bt = document.createElement('button');
				(['innerText','id','title','onclick','className','value','selected','style']).forEach(function(prp){if(e[prp]) bt[prp] = e[prp];});
			};
			opt.value    = (e.value)? e.value:e.innerText;
			opt.text     = e.innerText;
			opt.selected = e.selected;
		};
		bt.parent = this.element;
		if(!(bt.onclick)) bt.onclick = nas.HTML.SliderSelect.selectItem;
		nas.HTML.addClass(bt,'sliderSelectOption');
		nas.HTML.addClass(bt,'sliderSelectOption-mobile');
		nas.HTML.addClass(bt,((this.element.direction == 'vertical')?'sliderSelectOption-v':'sliderSelectOption-h'));
		this.element.appendChild(bt);
		this.element.options.push(opt);
	},this);
	this.element.selectedIndex = 0;
	this.element.focusItm	  = this.element.children[0];
	if(this.element.children[0]){
		this.element.value = this.element.children[0].value;
		this.select();
	}else{
		this.element.value = '';
	};
}
/*
 *	@params  {Object HTMLButtonElement|String|Number}  itm
 *	ボタンオブジェクトまたはキーワード up|down または Number option id
 *	リストアイテムを選択状態にする
 */
nas.HTML.SliderSelect.prototype.select = function(itm){
	if(this.element.children.length == 0) return this.element.focusItm;
	if((typeof itm == 'string')&&(itm.match(/up|down/i))){
		var idx = Array.from(this.element.children).findIndex(function(e){return (e===this.element.focusItm)},this);
		if(itm =='up'){idx--;}else{idx++};
		if(idx < 0) idx = 0;
		if(idx >= this.element.children.length) idx = this.element.children.length - 1;
		itm = this.element.children[idx];
	}else if (typeof itm == 'number'){
		itm = this.element.children[parseInt(itm)];
	};
	if(typeof itm == 'string'){
		itm = Array.from(this.element.children).find(function(e){return ((e.value == itm)||(e.innerText == itm))});
	};
	if(!(itm instanceof HTMLButtonElement)) itm = this.element.focusItm;
	for (var ix = 0 ;ix < this.element.children.length; ix ++){
		var e = this.element.children[ix];
//	Array.from(this.element.children).forEach(function(e){},this);
		if(e === itm){
			this.element.focusItm = itm;
			this.element.selectedIndex = ix;
			this.element.focusItm.focus();
			this.element.value = itm.value;
			nas.HTML.addClass(e,'sliderSelectOption-focus');
		}else{
			nas.HTML.removeClass(e,'sliderSelectOption-focus');
		};
	};
/*選択要素が画面に表示されているか否かを判定して表示されていない場合スクロールを行う*/
	if(
		(((this.element.focusItm.offsetTop - this.element.offsetTop) + this.element.focusItm.clientHeight) < (this.element.scrollTop))||
		(((this.element.focusItm.offsetTop - this.element.offsetTop) - this.element.scrollTop) > (this.element.clientHeight))||
		(((this.element.focusItm.offsetLeft - this.element.offsetLeft) + this.element.focusItm.clientWidth) < (this.element.scrollLeft))||
		(((this.element.focusItm.offsetLeft - this.element.offsetLeft) - this.element.scrollLeft) > (this.element.clientWidth))
	){
console.log('RANGE-OUT!');
console.log([		
        [(this.element.focusItm.offsetTop - this.element.offsetTop ), (this.element.focusItm.clientHeight) ,(this.element.scrollTop)],
		[(this.element.focusItm.offsetTop - this.element.offsetTop ), (this.element.scrollTop) , (this.element.clientHeight)],
		[(this.element.focusItm.offsetLeft - this.element.offsetLeft ),( this.element.focusItm.clientWidth) , (this.element.scrollLeft)],
		[(this.element.focusItm.offsetLeft - this.element.offsetLeft ),( this.element.scrollLeft) , (this.element.clientWidth)]
		])
console.log(this.element);
console.log(this.element.focusItm);
		var left = ((this.element.focusItm.offsetLeft - this.element.offsetLeft ) < this.element.scrollLeft)?
			(this.element.focusItm.offsetLeft - this.element.offsetLeft - this.element.clientWidth/2):
			(this.element.focusItm.offsetLeft - this.element.offsetLeft + this.element.clientWidth/2);
		var top  = ((this.element.focusItm.offsetTop - this.element.offsetTop ) < this.element.scrollTop)?
			(this.element.focusItm.offsetTop - this.element.offsetTop  - this.element.clientHeight/2):
			(this.element.focusItm.offsetTop - this.element.offsetTop  + this.element.clientHeight/2);
		this.element.scrollTo(left,top);
	};
	return this.element.focusItm;
}
/*TEST
    document.getElementById('sliderSelect').link.select('up')
    document.getElementById('sliderSelect').link.select(document.getElementById('sliderSelect').children[4])
		document.addEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
*/
/*
    @params  {String}  itm
	リストアイテムはボタンクリックで親のvalueを変更してonchangeを叩く
	thisはOptionのボタンアイテムを指す
 */
nas.HTML.SliderSelect.selectItem = function(){
console.log("click :"+nas.HTML.SliderSelect.move)
	if(nas.HTML.SliderSelect.move) return false;
	this.parentNode.value = this.value;
	this.parentNode.link.select(this);
	this.parentNode.onchange();
}
/*リストのイベントリスナ*/
/*	キーボードハンドラ
		有効なリストが存在した場合のみキーボードイベントを処理する
*/
nas.HTML.SliderSelect.kbHandle = function(evt){
	if(!(nas.HTML.SliderSelect.target)) return;
	evt.stopPropagation();evt.preventDefault();
console.log(this);
console.log(evt.target);
//	nas.HTML.SliderSelect.down = false;
	nas.HTML.SliderSelect.move = false;
	switch(evt.keyCode){
	case	13	:	//Enter 標準 現在のセレクションをclick()↲
		if(evt.type == 'keyup') this.focusItm.click();
	break;
	case	37	:		//左[←]
	case	38	:		//カーソル上
		if(evt.type == 'keydown') this.link.select('up');
	break;
	case	39	:		//右[→]
	case	40	:		//カーソル下
		if(evt.type == 'keydown') this.link.select('down');
	break;
	default :	return true;
	};
	return false;
}
nas.HTML.SliderSelect.ptEnter = function(evt){
console.log('pointer-ENTER',evt.target.id)
	evt.target.style.backgroundColor='green';
}
nas.HTML.SliderSelect.ptOut = function(evt){
console.log('pointer-OUT',evt.target.id)
	evt.target.style.backgroundColor='';
}
/*	ポインタハンドラ
		div全体とbutton 双方に適用されるので注意
*/
nas.HTML.SliderSelect.ptHandle = function(evt){
console.log(evt.type);
//マウスドラッグスクロールの停止
//	nas.HTML.mousedragscrollable.movecancel = true;
//タッチスクロール・ホイルスクロールの停止
//	document.addEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
	document.addEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
//	document.addEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
	document.addEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
	var target = (evt.target instanceof HTMLButtonElement)? evt.target.parentNode:evt.target;
	if(nas.HTML.SliderSelect.down) evt.stopImmediatePropagation();
	evt.stopPropagation();
	evt.preventDefault();
	nas.HTML.SliderSelect.target = target;
//console.log('change target :' + target.id)
	nas.HTML.SliderSelect.down = true;//ポインタダウン時に更新
	nas.HTML.SliderSelect.move = false;//ポインタムーブ時に更新
	nas.HTML.SliderSelect.x = evt.clientX;
	nas.HTML.SliderSelect.y = evt.clientY;
	nas.HTML.SliderSelect.scrollleft = nas.HTML.SliderSelect.target.scrollLeft;
	nas.HTML.SliderSelect.scrolltop  = nas.HTML.SliderSelect.target.scrollTop;
	evt.target.style.cursor = 'grabbing';
	document.addEventListener('pointermove',nas.HTML.SliderSelect.slHandle);
	document.addEventListener('pointerup'  ,nas.HTML.SliderSelect.rvHandle);
//ポインタ離脱に対して
//	nas.HTML.SliderSelect.target.addEventListener('pointerleave',nas.HTML.SliderSelect.rvHandle);
    return false;
}
//ドラグ移動終了ハンドラ 
nas.HTML.SliderSelect.rvHandle = function(event){
	if((nas.HTML.SliderSelect.down)||(nas.HTML.SliderSelect.move)){
	};
	if(nas.HTML.SliderSelect.down) event.stopImmediatePropagation();
	if(nas.HTML.SliderSelect.down) event.stopPropagation();
	if(nas.HTML.SliderSelect.move) event.preventDefault();
	nas.HTML.SliderSelect.down = false;
	nas.HTML.SliderSelect.target.style.cursor = '';
	document.removeEventListener('pointermove',nas.HTML.SliderSelect.slHandle);
	if(event.type == 'pointerup'){
		nas.HTML.SliderSelect.target.removeEventListener('pointerleave',nas.HTML.SliderSelect.rvHandle);
	}else{
		document.removeEventListener('pointerup',nas.HTML.SliderSelect.rvHandle);
	};
//マウスドラッグスクロール再開
	nas.HTML.mousedragscrollable.movecancel = ((xUI.canvas)&&(xUI.canvasPaint.active
)&&(xUI.canvasPaint.currentTool == 'hand'))? true:false;
//タッチスクロール・ホイルスクロール再開
//	document.removeEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
	document.removeEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
//	document.removeEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
	document.removeEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
}
//ドラグ移動ハンドラ pointermove
nas.HTML.SliderSelect.slHandle = function(evt){
// list要素内/外でのevent
	if ((nas.HTML.SliderSelect.down)||(evt.type == 'wheel')){
//		evt.preventDefault();
//		evt.stopPropagation();
		let move_x = nas.HTML.SliderSelect.x - ((evt.type != 'touchmove')? evt.clientX:evt.touches[0].clientX);
		let move_y = nas.HTML.SliderSelect.y - ((evt.type != 'touchmove')? evt.clientY:evt.touches[0].clientY);
		if (Math.abs(move_x) > 3 || Math.abs(move_y) > 3) {
//detect move
			nas.HTML.SliderSelect.move = true;
		}else{
//detect non move//リリース実行
			return;
		};
		evt.preventDefault();
		evt.stopPropagation();
		nas.HTML.SliderSelect.target.scrollTo(
			nas.HTML.SliderSelect.scrollleft + move_x,
			nas.HTML.SliderSelect.scrolltop  + move_y
		);
		return false;
	};
	return (((evt.button == 2)||(evt.metaKey))? true:false);
}
/*TEST
Array.from(document.getElementsByClassName('nasHTMLSliderSelect')).forEach(function(e){var SSel = new nas.HTML.SliderSelect(e,null,'vertical');e.link.init();});
*/
/*
	登録済みのアイコンデータ
	mime type 一点につき アイコンのURLを１点登録が可能
	mime type は、nasシステムとして拡張されたtypeStringで
	先行のディレクトリとして システムで使用するデータリジョンが追加されているケースがある
	現在のデータリジョンは timesheet|uaf
	application/pdf				一般のpdf
	timesheet/application/pdf	timesheetリジョン内のpdfデータに与えられる一時的なmime-type

	urlには、iconとして利用される画像のurlが格納される
	url:"" の エントリはシステムで準備された画像のurlと置換される
	nas.File.join("css/images/pman-ui",<type-string>)
*/
nas.HTML.typeIcons = {
"application/ard":{type:"application/ard",url:""},
"application/pdf":{type:"application/pdf",url:""},
"application/tsh":{type:"application/tsh",url:""},
"application/ardj":{type:"application/ardj",url:""},
"application/postscript":{type:"application/postscript",url:""},
"application/vnd.adobe.aftereffects":{type:"application/vnd.adobe.aftereffects",url:""},
"application/eps":{type:"application/eps",url:""},
"application/sts":{type:"application/sts",url:""},
"application/vnd.audiograph":{type:"application/vnd.audiograph",url:""},
"application/json":{type:"application/json",url:""},
"application/tdts":{type:"application/tdts",url:""},
"application/xdts":{type:"application/xdts",url:""},
"application/zip":{type:"application/zip",url:""},
"application/vnd.google-apps.document":{type:"application/vnd.google-apps.document",url:""},
"application/vnd.google-apps.drawing":{type:"application/vnd.google-apps.drawing",url:""},
"application/vnd.google-apps.form":{type:"application/vnd.google-apps.form",url:""},
"application/vnd.google-apps.jam":{type:"application/vnd.google-apps.jam",url:""},
"application/vnd.google-apps.map":{type:"application/vnd.google-apps.map",url:""},
"application/vnd.google-apps.presentation":{type:"application/vnd.google-apps.presentation",url:""},
"application/vnd.google-apps.script":{type:"application/vnd.google-apps.script",url:""},
"application/vnd.google-apps.site":{type:"application/vnd.google-apps.site",url:""},
"application/vnd.google-apps.spreadsheet":{type:"application/vnd.google-apps.spreadsheet",url:""},
"image/bmp":{type:"image/bmp",url:""},
"image/gif":{type:"image/gif",url:""},
"image/jpeg":{type:"image/jpeg",url:""},
"image/svg+xml":{type:"image/svg+xml",url:""},
"image/tvpp":{type:"image/tvpp",url:""},
"image/clip":{type:"image/clip",url:""},
"image/iff":{type:"image/iff",url:""},
"image/png":{type:"image/png",url:""},
"image/tga":{type:"image/tga",url:""},
"image/vnd.adobe.photoshop":{type:"image/vnd.adobe.photoshop",url:""},
"image/dga":{type:"image/dga",url:""},
"image/jp2":{type:"image/jp2",url:""},
"image/sgi":{type:"image/sgi",url:""},
"image/tiff":{type:"image/tiff",url:""},
"image/x-tga":{type:"image/x-tga",url:""},
"text/csv":{type:"text/csv",url:""},
"text/plain":{type:"text/plain",url:""},
"text/stbd":{type:"text/stbd",url:""},
"text/xmap":{type:"text/xmap",url:""},
"text/xpst":{type:"text/xpst",url:""},
"timesheet/json":{type:"timesheet/json",url:""},
"timesheet/timesheet":{type:"timesheet/timesheet",url:""},
"timesheet/application/ard":{type:"timesheet/application/ard",url:""},
"timesheet/application/eps":{type:"timesheet/application/eps",url:""},
"timesheet/application/postscript":{type:"timesheet/application/postscript",url:""},
"timesheet/application/tdts":{type:"timesheet/application/tdts",url:""},
"timesheet/application/xdts":{type:"timesheet/application/xdts",url:""},
"timesheet/application/ardj":{type:"timesheet/application/ardj",url:""},
"timesheet/application/pdf":{type:"timesheet/application/pdf",url:""},
"timesheet/application/sts":{type:"timesheet/application/sts",url:""},
"timesheet/application/tsh":{type:"timesheet/application/tsh",url:""},
"timesheet/image/bmp":{type:"timesheet/image/bmp",url:""},
"timesheet/image/gif":{type:"timesheet/image/gif",url:""},
"timesheet/image/jpeg":{type:"timesheet/image/jpeg",url:""},
"timesheet/image/svg+xml":{type:"timesheet/image/svg+xml",url:""},
"timesheet/image/tvpp":{type:"timesheet/image/tvpp",url:""},
"timesheet/image/clip":{type:"timesheet/image/clip",url:""},
"timesheet/image/iff":{type:"timesheet/image/iff",url:""},
"timesheet/image/png":{type:"timesheet/image/png",url:""},
"timesheet/image/tga":{type:"timesheet/image/tga",url:""},
"timesheet/image/vnd.adobe.photoshop":{type:"timesheet/image/vnd.adobe.photoshop",url:""},
"timesheet/image/dga":{type:"timesheet/image/dga",url:""},
"timesheet/image/jp2":{type:"timesheet/image/jp2",url:""},
"timesheet/image/sgi":{type:"timesheet/image/sgi",url:""},
"timesheet/image/tiff":{type:"timesheet/image/tiff",url:""},
"timesheet/image/x-tga":{type:"timesheet/image/x-tga",url:""},
"timesheet/text/csv":{type:"timesheet/text/csv",url:""},
"timesheet/text/plain":{type:"timesheet/text/plain",url:""},
"timesheet/text/xpst":{type:"timesheet/text/xpst",url:""},
"video/movie":{type:"video/movie",url:""},
"video/mp4":{type:"video/mp4",url:""},
"video/quicktime":{type:"video/quicktime",url:""},
"video/x-m4v":{type:"video/x-m4v",url:""},
};//
/**
	@params {}
	mimetypeを与えてtype別のアイコンurlを返す
	icon不登録のtype判定を兼ねる?
	未登録タイプに対して false を返す?
 */	
nas.HTML.getTypeIcon = function getTypeIcon(mimetype,asTimesheet){
	if(! mimetype) mimetype  = "";
	mimetype = mimetype.replace(/^(timesheet|storyboard|pmdb)\//i,"");
	if(asTimesheet) mimetype = nas.File.join("timesheet",mimetype);
//console.log(mimetype);
//console.log(nas.HTML.typeIcons[mimetype]);
	if(nas.HTML.typeIcons[mimetype]){
//データあり
		if(nas.HTML.typeIcons[mimetype].url == "" ){
//ファイルとして存在
			return nas.File.join("css/images/pman-ui/documenticons",mimetype) + ".png";
		}else{
//一時データとして存在
			return nas.HTML.typeIcons[mimetype].url;
		};
	}else{
//一時データを生成
		nas.HTML.typeIcons[mimetype] = {
			type : mimetype,
			url  : "css/images/pman-ui/documenticons/default.png"
		};
		return nas.HTML.typeIcons[mimetype].url;
/*
		var baseImg = new Image();
		baseImg.src = "css/images/pman-ui/documenticons/default.png"
		return nas.HTML.mkIcon(
			128,128,
			mimetype,
			baseImg,
			true
		);//*/
	};
}
nas.HTML.mkIcon = function mkIcon(width,height,mimetype,baseImg,cash){
	if(typeof width   == 'undefined') width  = 128  ;//px
	if(typeof height  == 'undefined') height = width;//same as width
	if(typeof mimetype    == 'undefined') text   = ''   ;//
	if(typeof baseImg == 'undefined'){
		var baseImg   = new Image();
		baseImg.width  = width ;
		baseImg.height = height;
	};
	var icnCanvas =  document.createElement('canvas');
	icnCanvas.width  = width;
	icnCanvas.height = height;
	var context = icnCanvas.getContext('2d');
	if(baseImg instanceof HTMLImageElement){
// ベース画像が指定されているならフィットして配置
		context.drawImage(baseImg, 0, 0, width, height);
//		if(baseImg.naturalWidth > baseImg.naturalHeight){
//		}else{
//		};
	}else{
// (角丸?)アイコン背景ボックスを描画
		context.fillStyle = "#D88";
		context.fillRect(0, 0, width, height);
	};
//テキストがあればハイライト色で描画
	if(mimetype.length){
	var text = mimetype.replace(/\.|\-/g,"/").split("/").reverse[0];
	console.log(text);
//		contenxt.
	};
// toBlob は非同期操作
	icnCanvas.toBlob(function(blob) {
		nas.HTML.typeIcons[mimetype] = {
			type:mimetype,
			url :URL.createObjectURL(blob)
		};
	}, 'image/png');
	return nas.HTML.typeIcons[mimetype];
}

/**
 * @params {String} url
 * @params {Function} callback
 * 	指定されたURLからJSONデータを取得してコールバック関数に渡す
 */
nas.HTML.fetchJSON = async function fetchAndDisplayJSON(url,callback) {
    try {
        // URLからJSONデータを取得
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
// callback渡し 
		if(callback instanceof Function){
			callback(jsonData);
		}else{
			console.log(jsonData);
		};
    } catch (error) {
        console.error('Error fetching or displaying JSON data:', error);
    }
}
//TEST nas.HTML.fetchJSON("./package.json",console.log);


/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    module.exports = nas.HTML;
}else{
    nas.Console            = nas.HTML.Console;
    nas.sliderVALUE        = nas.HTML.sliderVALUE;
    nas.editTableCell      = nas.HTML.editTableCell.edit;
    nas.showModalDialog    = nas.HTML.showModalDialog;
    nas.incrFCTonHTMLInput = nas.HTML.incrFCTonHTMLInput;
    nas.getCssRule         = nas.HTML.getCssRule;
    nas.addCssRule         = nas.HTML.addCssRule;
    nas.setCssRule         = nas.HTML.setCssRule;
    nas.findCssRule        = nas.HTML.findCssRule;
    nas.getAreaRange       = nas.HTML.getAreaRange;
    var getTextRange       = nas.HTML.getTextRange

    nas.timeIncrement      = nas.HTML.timeIncrement;

    HTMLTextAreaElement.prototype.insert = nas.HTML.textAreaInsert;

//代用別名関数 Javascript 置換用
/*
	NAS.showModalDialog() をラップしてJavascript（書式）互換の機能を提供します。置き換え可能なのはalertのみ
*/
    nas.alert  =function(msg){nas.HTML.showModalDialog("alert",msg,"",0,null,false)};//代用alert
//  nas.confirm=function(msg){return nas.HTML.showModalDialog("confirm",msg)};//代用confirm
//  nas.prompt =function(msg,value){return nas.HTML.showModalDialog("prompt",msg,false,value)};//代用prompt
}
