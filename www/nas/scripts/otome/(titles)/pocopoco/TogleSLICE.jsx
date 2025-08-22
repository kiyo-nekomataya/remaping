/*(スライス切り替え)
<grobe>
*/
//スライスをプレビューと本番モードで切り替える　トグル
var targetComp=(this instanceof CompItem)?this:app.project.activeItem;

if (targetComp instanceof CompItem)
{
	nas.otome.writeConsole(targetComp.name);
	for(var Lidx=1;Lidx<=targetComp.layers.length;Lidx++)
	{
		if(targetComp.layers[Lidx].name.match(/SLICE\s([1-9]?[0-9])/))
		{if((RegExp.$1*1)%40!=0){targetComp.layers[Lidx].enabled=(targetComp.layers[Lidx].enabled)?false:true;}}

}
}