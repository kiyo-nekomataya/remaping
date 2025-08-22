//no launch
/*(スタートアップ)
 *	nas StartUp Script 初期化手順を設定すること
 *		2022.02.04
 * このスクリプトは スタートアップフォルダまたはnasフォルダに設置してください
 */
// alert(Folder.current.fsName);
// レンダー乙女初期化

	var nas     = {};
	nas.Version = {};

	if($.fileName){
//		nas.baseLocation=new Folder(new File($.fileName).parent.path+("/nas"));
		nas.baseLocation=new Folder(Folder.userData.fullName+ "/nas");
	}else{
		nas.baseLocation=(Folder.current.name=="Startup")? new Folder("../nas/"):Folder.current;
	};
	var nasLibFolderPath= nas.baseLocation.fullName+"/lib/";

//==================== ライブラリを登録して事前に読み込む
/*
	includeLibs配列に登録されたファイルを順次読み込む。
	登録はパスで行う。(Fileオブジェクトではない)
	$.evalFile メソッドが存在する場合はそれを使用するがCS2以前の環境ではglobal の eval関数で読み込む
＝＝＝　ライブラリリスト（以下は読み込み順位に一定の依存性があるので注意）
  config.jsx		一般設定ファイル（デフォルト値書込）このルーチン外では参照不能
  nas_common.js		AE・HTML共用一般アニメライブラリ
  nas_GUIlib.js		Adobe環境共用GUIライブラリ
  nas_otomeLib.js	AE用環境ライブラリ?
		nas_psAxeLib.js	PS用環境ライブラリ
  nas_preferenceLib.js	Adobe環境共用データ保存ライブラリ
		nas.XpsStore.js	PSほかAdobe汎用XpsStoreライブラリ(AE用は特殊)
  xpsio.js		汎用Xpsライブラリ
  mapio.js		汎用xMapライブラリ
  lib_STS.js		Adobe環境共用STSライブラリ
  lib_ARD.js		Adobe環境共用STSライブラリ
  lib_ARDJ.js		Adobe環境共用STSライブラリ
  lib_TST.js		Adobe環境共用STSライブラリ
  dataio.js		Xpsオブジェクト入出力ライブラリ（コンバータ部）
  fakeAE.js		中間環境ライブラリ
  io.js			りまぴん入出力ライブラリ
		  psAnimationFrameClass.js	PS用フレームアニメーション操作ライブラリ
		  xpsQueue.js		PS用Xps-FrameAnimation連携ライブラリ
*/
includeLibs=[
	nas.baseLocation.fullName+"/ext-lib/JSON/json2.js",
	nas.baseLocation.fullName+"/ext-lib/MDN/adobeex.js",
	nasLibFolderPath+"config.jsx",
	nasLibFolderPath+"nas_common.js",
	nasLibFolderPath+"nas_AnimationValues.js",
	nasLibFolderPath+"cameraworkDescriptionDB.js",
	nasLibFolderPath+"storyboard.js",
	nasLibFolderPath+"pmio.js",
	nasLibFolderPath+"etc/pmdb/configPMDB_mini.js",
	nasLibFolderPath+"nas_GUIlib.js",
	nasLibFolderPath+"nas_preferenceLib.js",
	nasLibFolderPath+"nas_version.js",
	nasLibFolderPath+"mapio.js",
	nasLibFolderPath+"xpsio.js",
	nasLibFolderPath+"dataio.js",
	nasLibFolderPath+"lib_STS.js",
	nasLibFolderPath+"lib_ARD.js",
	nasLibFolderPath+"lib_ARDJ.js",
	nasLibFolderPath+"lib_TSH.js",
	nasLibFolderPath+"lib_TSX.js",
	nasLibFolderPath+"lib_TVP.js",

	nasLibFolderPath+"nas_Otome_config.jsx",
	nasLibFolderPath+"nas_OtomeLib.js",
	nasLibFolderPath+"otome.systemWatcher.js",
	nasLibFolderPath+"nas_locale.js",
	nasLibFolderPath+"messages.js"
];
/*	ライブラリ読み込み
ここで必要なライブラリをリストに加えてから読み込みを行う
includeLibs.push(nasLibFolderPath+"psAnimationFrameClass.js");
*/
	for(var fi = 0; fi < includeLibs.length ; fi ++){
		var myScriptFileName=includeLibs[fi];
//$.evalFile ファンクションで実行する
		if(new File(myScriptFileName).exists){
			$.evalFile(myScriptFileName);
		}else{
			writeLn("cannot read file :" + myScriptFileName);
		};
	};
//+++++++++++++++++++++++++++++++++初期化終了//@include "../nas/lib/config.jsx"

	var myFilename      = "nasStartup.jsx";
	var myFilerevision  = "2.0.0";

	nas.Version["tool"] = "Startup : "+myFilename+" : "+myFilerevision;

	nas.StartUp         = {};

/*	nas.StartUp.execute(myScriptFileName)
引数　ファイルをフルパスまたは相対パスで
実行時のディレクトリが判明している場合は相対パスも可
スクリプト自体はカレントをスクリプトのあるフォルダに移動してStartupオブジェクトのメソッドとして実行されるので、
スクリプト内のカレントは自スクリプトの位置と期待できる　…はず　eval()で実行できないコードを食わせた時の面倒は見てない
*/
	nas.StartUp.execute = function(myScriptFileName){
		nas.GUI.prevCurrentFolder = Folder.current;
		var scriptFile = new File(myScriptFileName);
		Folder.current = scriptFile.path ;
		if(scriptFile.exists){
			scriptFile.open();
			eval(scriptFile.read());
			scriptFile.close();
		}else{
			alert(myScriptFileName +" is not Exists!"+nas.GUI.LineFeed+"current :"+Folder.current.parent.name+"/"+Folder.current.name);
		};
		Folder.current = nas.GUI.prevCurrentFolder;
	};
//起動時に保存された設定が存在すれば読み込む
//=====================================保存してあるカスタマイズ情報を取得
	nas.readPreference();nas.workTitles.select();
//=====================================startup
/*	立ち上げ時に起動したいツールを以下に設定。
ファイルの配置には注意
 */
//nas.StartUp.execute("../nas/nasAbout.jsx");//アルファ用スプラッシュ
//nas.StartUp.execute("../nas/easyXPSLink.jsx");//シートリンカ
//nas.StartUp.execute("../nas/test_console.jsx");//簡易コンソール
//nas.StartUp.execute("../nas/nasConsole.jsx");//簡易コンソール
//nas.StartUp.execute("../nas/NasMenu.jsx");//nasToolランチャ
