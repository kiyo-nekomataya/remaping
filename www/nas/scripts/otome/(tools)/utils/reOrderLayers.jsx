/*(下から順)
<stack>
若い番号順に下から積む
*/
var myTargetComp=(this instanceof CompItem)? this:app.project.activeItem;

if(myTargetComp instanceof CompItem)
{
	nas.otome.reOrderCell(myTargetComp);
}
