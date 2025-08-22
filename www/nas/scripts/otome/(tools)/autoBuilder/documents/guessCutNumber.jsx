/*	guessCutNumber(String,myScene,myOpus,myTitle)
引数	文字列
戻値	識別パス

与えられた文字列を分解してカット情報を推測する
文字列から推定したデータを部分的に置き換える指定が可能

通常はファイル名をフルパスで与える

想定される文字列の例

/c/Workshop/制作集団/ワークグループ/タイトル01/シーン12/カット123/C-123-0000.tst
c:¥Workshop¥制作集団¥ワークグループ¥タイトル01¥シーン12¥カット123¥C-123-0000.tst
デスクトップ:myDrive:制作集団:ワークグループ:タイトル/01:シーン/12:カット/123:C-123-0000.tst
この際古いMacのパスは考慮の外にしたい感じだけど…要チェック


レタス互換のカット番号記載方式
セパレータは"-"
表記は	(カット番号プレフィックス="C")-SceneNo-CutNo
	C-124-0023
nas表記
セパレータは"-"
表記は	タイトル-[(情報プレフィックス="[Op]/[#]")Opus-][(情報プレフィックス="[S#]")SceneNo-](情報プレフィックス="[C#]")CutNo
カット番号は兼用セパレータで兼用を表記可能
タイトルはタイトルセパレータで制作番号の併記可能

	poco-Pilot--C023 / ssy-c#0021 / 金太郎#02-旅立ちの章-c#012_014_030

4要素以上なら後ろから順に カット表記/シーン表記/制作番号/タイトル
3要素なら後ろから順に カット表記/シーン表記/タイトル
3要素以上なら後ろから順に カット表記/シーン表記/制作番号/タイトル


 */

nas.otome.guessCutNumber=function(myString,myScene,myOpus,myTitle)
{
//第一引数がなければ処理中断
	if((! myString)||(myString.length)){return false};//これは文字列"000"がエラーになるのでよくないかも
	if(! myScene){myScene="S#--"};
	if(! myOpus ){myOpus ="Op--"};
	if(! myTitle){myTitle="未設定"};

//ファイルパスを想定してパス区切り文字で配列に格納する (降順で)
	var myPathArray=new Array();
var mySep="/"//unixタイプ
//	if(myString.match(/^(¥/[^¥/]+)+/g)){mySep="/"};
	if(myString.match(/^[a-z]:(¥¥[^¥¥]+)+/g)){mySep="¥¥"};//dos
	if(myString.match(/^(:[^:]+)+/g)){mySep=":"};//oldMac
	myPathArray=myString.split(mySep).reverse();
	
//要素検査して末尾に空オブジェクトがあれば捨てる
	if((myPathArray.length>2)&&(myPathArray[myPathArray.length-1]=="")){myPathArray.pop()}
//第一要素が分解可能ならば分解して、判定
	if(myPathArray[0].match(/^C¥-[^-]+¥-[^-]+$/))
	{
//		レタスの互換構成と推測されるのでチェックして分解
	}
return myPathArray.join("_");
}
St="c:¥Workshop¥制作集団¥ワークグループ¥タイトル01¥シーン12¥カット123¥C-123-0000.tst"
nas.otome.guessCutNumber(St);
