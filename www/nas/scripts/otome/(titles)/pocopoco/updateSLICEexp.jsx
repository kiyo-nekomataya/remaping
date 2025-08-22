/*(スライスエクスプレッション操作)
<bomb>
*/
var targetComp=(this instanceof CompItem)?this:app.project.activeItem;
var myExpression="thisComp.layer\(\"VIEW_PARAM\"\).effect\(\"SOFTNESS\"\)\(\"スライダ\"\)";
if (targetComp instanceof CompItem)
{
	nas.otome.writeConsole(targetComp.name);
	for(var Lidx=1;Lidx<=targetComp.layers.length;Lidx++)
	{
		if(targetComp.layers[Lidx].name.match(/SLICE\s([1-9]?[0-9])/))
		{
			var myTarget=targetComp.layers[Lidx].effect("円")("エッジの外側をぼかす");//
			if(myTarget.expression!=myExpression){	myTarget.expression=myExpression };
		}

}
}