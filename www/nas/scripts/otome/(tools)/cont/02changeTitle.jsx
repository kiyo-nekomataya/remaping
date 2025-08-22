/*(タイトル変更)
<jsx_02>
	応急版
	タイトル設定UI UIというにはあまりにもやっつけだけど仕事にはなる。

 */

var newTitle=prompt("題名を入力しましょう",nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.valueAtTime(0,false));

if((newTitle)&&(newTitle != nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.valueAtTime(0,false))){
	nas.eStoryBoard.targetPS.layer("TITLE").text.sourceText.setValueAtTime(0,newTitle);
}

