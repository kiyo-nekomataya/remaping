/*(08-出力コンポ作成)
	
	出力コンポを作る
	クリップコンポに対してCompItem.mkOutput()メソッドをコールすると、出力用のコンポが
	ボールド付きで生成されます。
	生成時に定形処理を行うことができます。

出力メディアDBは　nas.outputMedias　オブジェクトです。
	選択を切り替えるにはnasPref.jsxスクリプトを使用するか、
	またはnas/lib/nas_Otome_config.jsx　を直接書き換えてください。

*/


/* CompItem.mkOutputMedia(compName,omIndex,myOption)
引数
	compName	作成するコンポの名前　省略時は 現在のコンポ名+"(output)"
	OMIndex	使用するアウトプットメディアDBのID　省略時は現在選択されているメディア
	myOption	オプション文字列各種
			boardOFF	標準のボールド(スレート)を作成しない.別に作成したボールドをつける際などに指定

指定のコンポをスケーリングして出力メディアののコンポにセットする
縦横比が合わない場合は、
戻り値は作成したコンポまたはfalse
*/


app.project.activeItem.mkOutputMedia();