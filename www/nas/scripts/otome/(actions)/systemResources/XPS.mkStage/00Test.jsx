/*(00-TEST)
	このファイルは自動実行スクリプトのサンプルです
	オートビルダの自動実行ファイルは、コンポアイテムのメソッドして実行されます
	スクリプト内でthisプロパティはコンポアイテムを指します。
	
	実行時にコンポアイテムの判定を行なうと
	ナンバリングされていないファイルは自動実行の対象にはなりません。
	同じフォルダにあるリソースを使用する場合は
	カレントがスクリプトのあるフォルダに移動しているのでご利用ください
*/
var msg="ステージコンポを作成しました";
msg+=	nas.GUI.LineFeed;
msg+=	nas.GUI.LineFeed;
msg+=	"このコンポの名前は  ["+this.name+"]  です。";
msg+=	nas.GUI.LineFeed;
msg+=	"カレントフォルダは";
msg+=	nas.GUI.LineFeed;
msg+=	Folder.current.fsName;
msg+=	nas.GUI.LineFeed;
msg+=	" です。";

nas.otome.writeConsole(msg);

//ステージを作成したのでシート適用してカメラを加える
/*
	カメラのないステージは考えにくいけれど、
	素材を3D配置してAEのカメラを使ったりすることもあるはずなので一応分離してます
*/
		this.applyXPS(XPS);//前のメソッドの実行でカレントシートが切り替わっているので引数不用になる予定だけどいまは要指定

		var myCameraLayer= this.addClipTarget();//カメラを加える

		if(myCameraLayer){

			var myClip=this.mkClipWindow();//さらにカメラコンポを加える
			if(myClip)
			{
				var myOPM=myClip.mkOutputMedia();//出力コンポも加える

			}
				nas.otome.writeConsole(idx+ ": build " + this.name );
		}
