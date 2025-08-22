// ユーザカスタマイズ用設定ファイル
/*
	このファイルはsbdファイルコンバータのデフォルトターゲットを書き込みます。
	ねこら絵コンテエディタのファイルでないと何がおきるか保証できませんのでそのあたりはよしなに
	自動で読み込みを開始する場合はオートスイッチを"true"にしといてください。
	2008/03/23
	"file:///C:/Users/kiyo/Desktop/sample-sbd/loadTest.sbd"
,	"MSA_YN_OVA.sbd"
*/
var targetURL	=[
			"./notes/storyBoardData/readme.sbd"
,			"./notes/storyBoardData/paperDesign.sbd"
,			"./notes/storyBoardData/playerTest.sbd"
,			"./notes/storyBoardData/speedTest.sbd"
];
/*
	URLを配列または、単独で設定できます。
	複数のURLを指定した場合は、一つづつ順次切り替わります。
	切り替え後に load > convert (queue) を行ってください。(現在はそういう仕様です。)

	URL(http://～)で記述された絵コンテデータは、内部の画像もURLである必要があります。
	ウィンドウズの環境下では、ローカルパスが記録されるケースが多いのでご注意
	prototype.js のAjaxオブジェクトでデータを取得する関係から別のサーバのURLを指定しても
	レスポンスは得られません
*/
var autoSwitch	=true;// false or true

/*
	この値は絵コンテの基準画像サイズです。
	ブラウザの解像度判定はあやしいので自前で計算します。
	作画幅のピクセルを記述してください。
	使用する画像は、そのピクセル数を標準的な画面幅として配置されます。
*/

var baseDrawingWidth=640;//作画するデータの横幅pixel

/*
罫線付き用紙に印刷する場合、はみ出しをさける為にマージンをとります。
初期値で95%です。
白紙に罫線ごと印刷する場合は100%でもOKでしょう。
私は、それじゃ困るので95%
1 (100%)以上にすると表示がくずれる場合があります。
*/

var baseDrawingMargin=0.98;//占有率 0.95
/*
	ファイル保存用おうむ返しCGI
保存の手間が煩わしいので、以下のURLに内容を投げて リザルトをダウンロード保存することにしました。
「りまぴん」と同じです。(アドレスも同じ)
自サーバで運用する方は、同梱のcgiをセットアップしてお好きなアドレスに置き替えてください。
アドレスの末尾はクエリがあるので"?"で終わるようにしてください。
ちなみにデフォルトのアドレスではアクセスログをとってます。
*/

var ServiceUrl="http://www.nekomataya.info/cgi-bin/remaping/rmpEcho.cgi?";
// var ServiceUrl="http://localhost/~<your address>/rmpEcho.cgi?";//参考1
// var ServiceUrl="http://localhost/cgi-bin/rmpEcho.cgi?";//参考2
/*
	hideNumberは印刷時にカット番号を非表示にするか否かの選択です
	業務納品時に、修正の余地を残す為にカット番号欄を空白にする習慣の
	ある方のための機能です。
	データ納品の場合はfalseのままでよいでしょう
 */
var hideNumber=false;

