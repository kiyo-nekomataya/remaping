/*(ツールについて)
<infomation>
 *	nas about & splash Panel
 *
 *	スプラッシュパネルにしようとおもったが、
 *	タイマーもインターバルも無いので、自動で消せない…
 *		そんな、スプラッシュはキライなので、現在はただのアバウトパネル
 */
// /@include "../nas/lib/config.jsx"
// /@include "../nas/lib/nas_common.js"
// /@include "../nas/lib/nas_GUIlib.js"

	var myVersions="";
		var myVersioncount=0;
	for (item in nas.Version)
	{myVersions +=nas.Version[item]+nas.GUI.LineFeed;myVersioncount++;}
myVersions +=" …スクリプトの使い方、イロイロ探索中 (ね)"+nas.GUI.LineFeed;
	var msg	="AdobeAE用 ねこまたや「お道具箱」"+nas.GUI.LineFeed+nas.GUI.LineFeed;
	msg += "=== ver "+nas.otomeVersion+" ==="+nas.GUI.LineFeed;
	msg += "現在オンメモリのモジュール一覧 :"+nas.GUI.LineFeed;
	msg += "============================="+nas.GUI.LineFeed;
	msg += myVersions.toString()
	msg += "============================="+nas.GUI.LineFeed;
	msg += "この、ツールはそれなりに役に立つかも知れませんが"+nas.GUI.LineFeed;
	msg += "現在のところ「本開発前のアルファ版」です。"+nas.GUI.LineFeed;
	msg += "ご使用なさる方は、何らかの形で開発にフィードバックをお願いします。"+nas.GUI.LineFeed;
	msg += ""+nas.GUI.LineFeed;
	msg += "動作仕様はそのうち変わります。ええ、きっと"+nas.GUI.LineFeed;
	msg += "連絡先　http://www.nekomataya.info/bbs2/"+nas.GUI.LineFeed;
	msg += "			mailto:support@nekomataya.info"+nas.GUI.LineFeed;
	msg += "============================="+nas.GUI.LineFeed;
//	alert(msg);


nas.Splash=nas.GUI.newWindow("dialog","レンダー乙女は成長途中！"+nas.otomeVersion,7,myVersioncount+11);
//nas.Version.length
	nas.Splash.Message=nas.GUI.addStaticText(nas.Splash,welcomeMsg,0,0,7,1);
		nas.Splash.Message.justify="center";;
	nas.Splash.Versions=nas.GUI.addStaticText(nas.Splash,"--",0,1,7,myVersioncount+9);
	nas.Splash.Versions.multiline=(true);
	nas.Splash.Versions.scrolling=(true);
	nas.Splash.Versions.justify="center";
//	nas.Splash.Versions.addBuf=nas.GUI.addBuf_;
	nas.Splash.Versions.text=msg;

	nas.Splash.closeButton=nas.GUI.addButton(nas.Splash,"ハイな承知だ",1,myVersioncount+10,5,1)
	nas.Splash.closeButton.onClick=function(){this.parent.close();};


//	nas.Splash.okButton=nas.GUI.addButton(nas.Splash,"O K",1,myVersioncount,1,1);
//	nas.Splash.ngButton=nas.GUI.addButton(nas.Splash,"cancel",2,myVersioncount,1,1);
//	nas.Splash.closeButton=nas.GUI.addButton(nas.Splash,"close",3,myVersioncount,1,1);	
	nas.Splash.show();
