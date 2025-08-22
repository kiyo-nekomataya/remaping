/**
 *	@fileOverview
 *		日本語ポストスクリプトデータの為のコンバート関数
 *
 *	日本語文字列をファイル内に埋め込むためのエンコード関数等
 *	使用はecl|iconv-liteライブラリに依存
 *	@requires ecl.js
 *	node.js環境下で iconv-liteが存在すればそちらを優先して利用
 */
'use strict';
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
	var ecl = require('./ecl-mod');
    var nas = require('./nas_common');
};

/**
 *	@function
 *		入力文字列をepsファイルで使用可能なように<br />
 *		JIS7 16進エンコードして返す
 *
 *	@params {String} Str
 *		入力文字列
 *	@returns {String}
 *		JIS7 16進　エンコードされた文字列
 *	@example
 *	var myString = "たぬきの宝くじ";
 *	var encoded = EncodePS(myString);//"<243F2442422444752422438>"
 *	console.log(encoded);
 */
nas.EncodePS = function EncodePS(Str){
	var jStr=EscapeJIS7(Str);var eStr="";
//この関数注意 **コントロールコードとASCII排除がまだ 05/11/27 kiyo
	for(idx=0;idx<jStr.length;idx++){
		if(jStr.charAt(idx)=="%"){
			eStr+=jStr.charAt(idx);
			eStr+=jStr.charAt(idx+1);
			eStr+=jStr.charAt(idx+2);
			idx = idx+2 ;
			continue;
		}else{
			eStr+="%"+nas.Zf(jStr.charCodeAt(idx).toString(16));
		}
	};
	eStr=eStr.replace(/\%1B\%2[48]\%42/g,'');
	return "<"+eStr.replace(/\%/g,'')+">";
};
/**
 *	@function
 *		入力JIS7-16進コードをデコード
 *
 *	@params {String} eStr
 *		エンコードされた文字列
 *	@returns {String}
 *		デコード文字列
 *	@example
 *	var myString = "<243F2442422444752422438>";
 *	var decoded = DecodePS(myString);//"たぬきの宝くじ"
 *	console.log(decoded)
 */
nas.DecodePS = function DecodePS(eStr){
	if(eStr.match(/^\<[0-9a-fA-F]+\>$/)){
		var dStr="";
		for(idx=1;idx<(eStr.length-1);idx++){
			if(idx%2==1){
				dStr+="%"+eStr.charAt(idx);
			}else{
				dStr+=eStr.charAt(idx);
			}
		};
		return UnescapeJIS7(dStr);
		return UnescapeJIS7("%1B%24%42"+dStr.slice(1,-2)+"%1B%28B");
	}else{
		return false;
	};
};
/**
 *	半角全角混在文字列をコード切替を含めて\エスケープ JIS8-8進エンコード
 *	@params {String} Str
 *		入力文字列
 *	@returns {String}
 *		\エスケープで JIS8-8進エンコードされた文字列
 *	@example
 *	var myString = "たぬきの宝くじ";
 *	var encoded = EncodePS(myString);
 * //"\377\001\044\077\044\114\044\055\044\116\112\165\044\057\044\070"
 *  console.log(encoded);
 */
nas.EncodePS2 = function EncodePS2(Str){
 var jStr=EscapeJIS8(Str);
 var eStr=new Array();
 var kMode=false
 var tStr="";
	for(idx=0;idx<jStr.length;idx++){
	  if(kMode){
		if(jStr.charAt(idx)=="%"){
			tStr= "0x"+ jStr.charAt(idx+1)+jStr.charAt(idx+2);
			if(tStr=="0x1B"){
				//エスケープシーケンス判定
				var nextCode="0x"+ jStr.charAt(idx+4)+jStr.charAt(idx+5)+jStr.charAt(idx+6);
				if(nextCode=="0x28B"){
//２バイトモード終了文字列終端以外は１バイトモード開始
					if(idx+7==jStr.length){
					 break;
					}else{
//１バイトモードに切り替えて続行
					 kMode=false;
					 eStr.push("\\377");eStr.push("\\000");
					 idx+=6;continue;
					}
				}else{
//何らかのエラーなので終了
					return false;
				}
			}else{
			eStr.push("\\"+(("000"+(eval(tStr)).toString(8)).slice(-3)));
			idx+=2 ;
			}
			
		}else{
			eStr.push("\\"+("000"+(jStr.charCodeAt(idx).toString(8))).slice(-3));//エスケープ８進化
		}
		continue;
	  }else{
		if(jStr.charAt(idx)=="%"){
			tStr= "0x"+ jStr.charAt(idx+1)+jStr.charAt(idx+2);
			if(tStr=="0x1B"){
				//エスケープシーケンス判定
				var nextCode="0x"+ jStr.charAt(idx+4)+jStr.charAt(idx+5)+jStr.charAt(idx+6);
				if(nextCode=="0x24B"){
					kMode=true;
					eStr.push("\\377");eStr.push("\\001");
					idx+=6;continue;
				}else{
					return false;
				}
			}else{
				if(tStr.match(/0x2[89]/)){
				  eStr.push("\\"+String.fromCharCode(parseInt(tStr)));//カッコはエスケープ
				}else{
				  eStr.push(String.fromCharCode(parseInt(tStr)));//エスケープ８進化してデコード
				}
				idx+=2;continue;
			}
		}else{
			eStr.push(jStr.charAt(idx));//そのまま
//　１バイト文字のカッコはエスケープする必要あり
		}
	  }
	};
//	eStr=eStr.replace(/\%1B\%2[48]\%42/g,'');
//	return "<"+eStr.replace(/\%/g,'\\')+">";
//	return jStr +" : "+eStr.join("");
	return eStr.join("");
}
/**
 *	8進デコード
 *	@params {String} eStr
 *		エンコードされた文字列
 *	@returns {String}
 *		デコードされたJIS8文字列
 *	@example
 *	var myString = "\377\001\044\077\044\114\044\055\044\116\112\165\044\057\044\070";
 *	var decoded = DecodePS2(myString);//"たぬきの宝くじ"
 *	
 */
nas.DecodePS2 = function DecodePS2(eStr){
//デコードすべき文字列が含まれている
	if(eStr.match(/\\[0-7][0-7][0-7]/))
	{
		//導入コードを0x1B0x24B 解除コードを0x1B0x28Bに変換
		eStr=eStr.replace(/\\377\\000/g,"%1B%28B");
		eStr=eStr.replace(/\\377\\001/g,"%1B%24B");
		eStr=eStr.replace(/\\([\(\)])/g,"$1");
		var dStr="";
		for(idx=0;idx<eStr.length;idx++)
		{
			if(eStr.charAt(idx)=="\\"){
				//２バイト文字確定なので一文字デコードして次へ
				dStr+="%"+(parseInt(eStr.charAt(idx+1)+eStr.charAt(idx+2)+eStr.charAt(idx+3),8)).toString(16);
				idx+=3;
			}else{
				dStr+=eStr.charAt(idx)
			}
		};

		return UnescapeJIS8(dStr);
	}else{
		return eStr;
	};
};
/*TEST
	var myString = "たぬきの宝くじ";
	var encoded = EncodePS(myString);
	console.log("JIS7 Encode :" + encoded);
	var decoded = DecodePS(encoded);//"たぬきの宝くじ"
	console.log("Decoded :" + decoded)

	var myString = "たぬきの宝くじ";
	var encoded = EncodePS2(myString);
	console.log("JIS8 Encode :" + encoded);
	var decoded = DecodePS2(encoded);//"たぬきの宝くじ"
	console.log("Decoded :" + decoded)
*/
/*=======================================*/
if((typeof window == 'undefined')&&(typeof app == 'undefined')){
    module.exports.EncodePS = EncodePS;
    module.exports.DecodePS = DecodePS;
    module.exports.EncodePS2 = EncodePS2;
    module.exports.DecodePS2 = DecodePS2;
}