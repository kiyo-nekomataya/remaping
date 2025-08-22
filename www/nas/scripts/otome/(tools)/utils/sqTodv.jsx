/*(正方ピクセルをDV比率へ)



*/
var myItems=app.project.selection;
for(var itemId=0;itemId<myItems.length;itemId++)
{
	myItem=myItems[itemId];
	if((myItem instanceof FootageItem)&&(myItem.pixelAspect!=1.2))
	{
		myItem.pixelAspect=1.2;
	}
}
