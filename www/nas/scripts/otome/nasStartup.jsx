//no launch
/*(スタートアップ)
 *	nas StartUp Script 初期化手順を設定すること
 *		2006.02.17
 * このスクリプトは スタートアップフォルダまたはnasフォルダに設置してください
 */
//alert(Folder.current.fsName);
// レンダー乙女初期化
//	try {this.parent.close();}catch(err){writeLn("otome Startup!");}
//nas : object : root of nas Tools
	var nas = new Object();
		nas.Version=new Object();
		
		if($.fileName){
			nas.baseLocation=new Folder(new File($.fileName).parent.path+("/nas"));
		}else{
			nas.baseLocation=(Folder.current.name=="Startup")? new Folder("../nas/"):Folder.current;
		}
//		nas.= Folder.userData.fullName + "/"+ localize("$$$/nas=nas/");


//@include "../nas/lib/config.js"

//@include "../nas/lib/nas_common.js"
//@include "../nas/lib/nas_GUIlib.js"
//@include "../nas/lib/nas_Otome_config.js"
//@include "../nas/lib/nas_OtomeLib.js"
//@include "../nas/lib/nas_preferenceLib.js"
//@include "../nas/lib/otome.systemWatcher.js"

//@include "../nas/lib/nas_version.js"


//@include "../nas/lib/mapio.js"
//@include "../nas/lib/xpsio.js"
//@include "../nas/lib/dataio.js"
//@include "../nas/lib/fakeAE.js"
//@include "../nas/lib/io.js"

//@include "../nas/lib/lib_STS.js"
//@include "../nas/lib/lib_AER.js"

// /@include "../ecl/ecl.js"
//		nas.baseLocation=Folder.nas;

var myFilename=("$RCSfile: nasStartup.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.4.10 $").split(":")[1].split("$")[0];

	nas.Version["tool"]= "Startup : "+myFilename+" : "+myFilerevision;

	nas.StartUp=new Object();
/*	nas.StartUp.execute(myScriptFileName)
引数　ファイルをフルパスまたは相対パスで
実行時のディレクトリが判明している場合は相対パスも可
スクリプト自体はカレントをスクリプトのあるフォルダに移動してStartupオブジェクトのメソッドとして実行されるので、
スクリプト内のカレントは自スクリプトの位置と期待できる　…はず　eval()で実行できないコードを食わせた時の面倒は見てない
*/
	nas.StartUp.execute = function(myScriptFileName)
{
	nas.GUI.prevCurrentFolder = Folder.current;
	var scriptFile = new File(myScriptFileName);
	Folder.current = scriptFile.path ;
if(scriptFile.exists){
	scriptFile.open();
	eval(scriptFile.read());
	scriptFile.close();
}else{
	alert(myScriptFileName +" is not Exists!"+nas.GUI.LineFeed+"current :"+Folder.current.parent.name+"/"+Folder.current.name);
}
	Folder.current = nas.GUI.prevCurrentFolder;
};
//起動時に保存された設定が存在すれば読み込む
	if(true){nas.readPreference();}
/*	立ち上げ時に起動したいツールを設定してください。
 */
//nas.StartUp.execute("../nas/nasAbout.jsx");//アルファ用スプラッシュ


//nas.StartUp.execute("../nas/easyXPSLink.jsx");//シートリンカ
//nas.StartUp.execute("../nas/test_console.jsx");//簡易コンソール
//nas.StartUp.execute("../nas/nasConsole.jsx");//簡易コンソール
//nas.StartUp.execute("../nas/NasMenu.jsx");//nasToolランチャ

