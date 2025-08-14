var idPreFix=["pM","ibM"];
var idBDys=[
"00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f",
"10 11 12 13 14 15 16 17 18 19 1a 1b 1c 1d 1e 1f 1g 1h 1i 1j 1k",
"20 21 22 23 24 25",
"30 31 32 33 34", 
"40 41",
"50 51 52 53",
"60 61 62 63 64 65 66 67 68 69 6a 6b"
];
/**/
	nas.LangPack={};
	nas.LangPack.ja=[]

//var elements = document.getElementsByTagName("*");
var targetItems=[
"prefBtapply",
"prefBtReset",
"prefBtClose",
"prefBtSave",
"prefBtDelete",
"prefLbMode",
"prefModeWP",
"prefModeCP",
"prefLbAE",
"prefLbFpsF",
"prefLbTimeshift",
"prefLbSheetInfo",
"prefLbSheetLength",
"prefLbSec",
"prefLbColums",
"prefLbDiff",
"prefLbFCT",
"prefLbLoop",
"prefLbCloop",
"prefLbSloop",
"prefLbAscroll",
"prefLbTABspin",
"prefLbNoSync",
"prefLbUtilBar",
"prefLbExportopt"
];

var elements=[];
for (var ix=0;ix<targetItems.length;ix++){
	elements.push(document.getElementById(targetItems[ix]));
}

for (var idx=0 ;idx < elements.length;idx++){
	if (! elements[idx]) continue;
//	if ((! elements[idx].id) ||(elements[idx].childElementCount))continue;
	if (! elements[idx].id) continue;
	var myID = elements[idx].id;
	if((elements[idx].innerHTML)&&(elements[idx].innerHTML.match(/^[^\s]+$/)))
	nas.LangPack.ja.push([myID,"innerHTML",document.getElementById(myID).innerHTML]);
	if((elements[idx].title)&&(elements[idx].title.match(/^[^\s]+$/)))
	nas.LangPack.ja.push([myID,"title",document.getElementById(myID).title]);
	if((elements[idx].value)&&(elements[idx].value.match(/^[^\s]+$/)))
	nas.LangPack.ja.push([myID,"value",document.getElementById(myID).value]);
} 

JSON.stringify(nas.LangPack.ja);
//.toSource();
/*プルダウンメニュー及びボタンバーのコマンドアイテム群*/
var menuItems = [
document,
browse,
checkin,
save,
checkout,
activate,
deactivate,
discard,
newEntry,
receipt,
checkoutF,
abort,
branch,
merge,
importDatas,
openFS,
saveFS,
exportFS,
openFSps,
saveFSps,
exportFSps,
callEcho,
importexport,
docInfo,
exportHTMLair,
exportEPSair,
exportHTMLps,
exportEPSps,
exportHTML,
exportEPS,
authPnl,
signInOut,
menuBack,

edit,
selectAll,
cut,
copy,
paste,
renameTL,
clearTL,
clearSheet,
insertBlank,
brockRemove,
addSoundTrack,
addStilTL,
addReplacementTL,
addCameraTL,
addSfxTL,
insertTL,
deleteTL,
formatTL,
formatSheet,
simplifyTL,
simplifySheet,
pushBackup,
restoreBackup,
clearBackup,

reference,
importReference,
importReferenceAir,
copyToReference,
copyFromReference,
clearReference,
buildActionSheet,

stage,
stageList,

tools,
about,
pref,
memoEdit,
reload,
previousVer,
stb,

show,
editMode,
columns,
zoom,
unZoom,
loginPnl,
soundPnl,
filePnl,
logo,
pMenu,
skb,
toolbar,
airMenu,
sheetHeader,
commandbar,
memoArea,
dbgCons,
dbgMode,
introspector,
viewSource
    ,commandbar
    ,toolbox
    ,addCircle
    ,addAangles
    ,addBlackets
    ,incrementNUl
    ,decrementNum
    ,vBar
    ,wBar
    ,interpSign
    ,camera
    ,transition
    ,fadein
    ,fadeout
];

/*  UI上の翻訳が必要なリソースのエレメントid */
    textItems =[
index.html(947): 	id=activeLvl
index.html(955): 	id=fct0
index.html(962): 	id=fct1
index.html(975): 	id=spin_V
index.html(985): 	id=v_up
index.html(991): 	id=v_dn
index.html(998): 	id=spinCkLb
index.html(1005): 	id=spinCk
index.html(1013): 	id=iNputbOx
index.html(1024): 	id=ok
index.html(1034): 	id=ng
index.html(1048): 	id=pmcui-checkin
index.html(1055): 	id=pmcui-checkout
index.html(1061): 	id=pmcui-checkout
index.html(1067): 	id=pmcui-deactivate
index.html(1073): 	id=pmcui-activate
index.html(1079):  :  <span id=pmcui_line class=pmcui_> 0:(本線) </span>
index.html(1080): // <span id=pmcui_stage class=pmcui_> 2:原画 </span> 
index.html(1081): // <span id=pmcui_job class=pmcui_> 1:(原画) </span>
index.html(1082): // <span id=pmcui_status class=pmcui_> Active </span>
index.html(1083): // <span id=pmcui_documentWriteable class=pmcui_> [保存不可] </span>
index.html(1087): class=optionPanel id=optionPanelProductManagement
index.html(1089):     <div id=pmaui>
index.html(1091): 	id=pmaui-new
index.html(1098): 	id=pmaui-receipt
index.html(1103): 	id=pmaui-checkout
index.html(1108): 	id=pmaui-abort
index.html(1115): 	id=pmaui-branch
index.html(1120): 	id=pmaui-merge
index.html(1134): <select class='pmControl' id=linSelect>
index.html(1144): <datalist id=line_list>
index.html(1160): <select class='pmControl' id=stageSelect>
index.html(1171): <datalist id=stage_list>
index.html(1185): <select class='pmControl' id=stageSelect>
index.html(1196): <datalist id=job_list>
index.html(1249):     <div id=messages-pmaui>
index.html(1271): <div id=sheetHeaderTable>
index.html(1275):      <td id=edchg>
index.html(1277):      </td><th class=opusLabel id="opusL">
index.html(1279):      </th><th class=titleLabel id="titleL">
index.html(1281):      </th><th class=subtitleLabel id="subtitleL">
index.html(1287):      </th><th class=nameLabel id="nameL">
index.html(1294): <select name=stageSelect id=stageSelect onChange='xUI.switchStage(this.value);'  style="width:100%;margin:0;padding:0;text-align:center;">
index.html(1300): </td><td id=opus lock="yes" >
index.html(1302): </td><td id=title lock="yes" >
index.html(1304): </td><td id=subtitle lock="yes" >
index.html(1306): </td><td id=scene_cut lock="yes">
index.html(1308): </td><td id=time >
index.html(1310): </td><td id=trin >
index.html(1312): </td><td id=trout >
index.html(1314): </td><td id=update_user lock="yes">
index.html(1322): <div class=optionPanel id=optionPanelUtl >
index.html(1325): 	id=tbLock
index.html(1330):     id=ibMcopyToReference
index.html(1336):     id=ibMcopyFromReference
index.html(1343):     id=ibMpushBackup
index.html(1349):     id=ibMrestoreBackup
index.html(1355):     id=ibMclearTL
index.html(1361):     id=ibMformatTL
index.html(1367):     id=ibMsimplifyTL
index.html(1373):     id=ibMclearFS
index.html(1379):     id=ibMrenameTL
index.html(1385):     id=ibMaddSoundTrack
index.html(1391):     id=ibMaddStilTL
index.html(1397):     id=ibMaddReplacementTL
index.html(1403):     id=ibMaddCameraTL
index.html(1409):     id=ibMaddSfxTL
index.html(1415):     id=ibMinsertTL
index.html(1421):     id=ibMseleteTL
index.html(1427):     id=ibMinsertBlank
index.html(1433):     id=ibMblockRemove
index.html(1440):     id=ibMaddCircle
index.html(1446):     id=ibMaddAangles
index.html(1452):     id=ibMaddBlackets
index.html(1458):     id=ibMincrementNUl
index.html(1464):     id=ibMdecrementNum
index.html(1470):     id=ibMvBar
index.html(1476):     id=ibMwBar
index.html(1482):     id=ibMinterpSign
index.html(1488):     id=ibMcamera
index.html(1494):     id=ibMtransition
index.html(1500):     id=ibMfadein
index.html(1506):     id=ibMfadeout
index.html(1516): <div class=optionPanel id=optionPanelTrackLabel >
index.html(1520):     <input id="currentLabel" type=text size=6 value="(currentValue)">
index.html(1523): <div id=ModalUIStore>
index.html(1524): <div id=CWLabelTemplate>
index.html(1536): <div id=FXLabelTemplate>
index.html(1559): <div id=CLLabelTemplate>
index.html(1591): <div id=DSLabelTemplate>
index.html(1599): <div id=BGLabelTemplate>
index.html(1610): <div id=TCIFTemplate >
index.html(1626): <input id=editTC size=12 value="-(00+00)">
index.html(1645): <div class=optionPanelModal id=optionPanelProg >
index.html(1662): <div class=optionPanel id=optionPanelAEK >
index.html(1666): <textarea name=AEKrEsult id=AEKrEsult cols=60 rows=6>
index.html(1682): 		id=blmtd
index.html(1693): 		id=blpos
index.html(1704): 		id=aeVersion
index.html(1714): 		id=keyMethod
index.html(1728): <div class=optionPanel id=optionPanelData>
index.html(1731): <div><form name=cgiSample id=cgiSample><a href="javascript:void(0);" onclick="return writeXPS(XPS)" title="保存用に書き出し"
index.html(1733): >別ウィンドウにHTMLで書き出し</a> <span id=TSXUi></span>
index.html(1735): <select name=sampleSelect id=sampleSelect　>
index.html(1748): <!-- <a href="javascript:void(0);" onClick="getSample(1)" id=sample1 title="xps">XPS-1</a> |
index.html(1749):  <a href="javascript:void(0);" onClick="getSample(2)" id=sample2 title="xps(修飾メモ付き)">XPS-2</a> |
index.html(1750):  <a href="javascript:void(0);" onClick="getSample(3)" id=sample3 title="AE-Key">AE-Key</a> |
index.html(1751):  <a href="javascript:void(0);" onClick="getSample(4)" id=sample4 title="AE-Remap">AERemap</a> |
index.html(1752):  <a href="javascript:void(0);" onClick="getSample(7)" id=sample7 title="cell-Remap">cellRemap</a> |
index.html(1753):  <a href="javascript:void(0);" onClick="getSample(5)" id=sample5 title="T-Sheet">TSheet</a> |
index.html(1754):  <a href="javascript:void(0);" onClick="getSample(6)" id=sample6 title="RETAS-Stylos-csv">Stylos-csv</a>
index.html(1772): <input type=hidden id=loadShortcut value=false>
index.html(1774): <div id=localFileLoader><form id="dataLoader" name="dataLoader" method="post" action="javascript:void(0);" enctype="multipart/form-data">
index.html(1775): <input type=file id=myCurrentFile name=XPSBody size=100
index.html(1780): <strong> (Import) </strong><input type=button id=localFileLoaderSelect value="読込＋取込" style="width:10%"
index.html(1782): ><input type=button id=select value="参照取込" style="width:10%"
index.html(1784): ><input type=button id=select value="取込" style="width:10%"
index.html(1786): ><input type=button id=select value="全選択" style="width:10%"
index.html(1789): 	type=reset id=reset value="リセット" style="width:10%"
index.html(1791): 	id=select value="消去" style="width:10%"
index.html(1794): 	type=button id=option value="閉じる" style="width:10%"
index.html(1796): ><br /><textarea nema=XPSBody id=data_well style="width:80%;height:128px"
index.html(1798): <input type=button id=select value="XPS" style="width:10%"
index.html(1800): ><input type=button id=select value="EPS" style="width:10%"
index.html(1802): ><input type=button id=select value="ARD" style="width:10%"
index.html(1804): ><input type=button id=select value="TSheet" style="width:10%"
index.html(1806): ><input type=button id=select value="ARDJ" style="width:10%"
index.html(1808): ><input type=button id=select value="Stylos-csv" style="width:10%"
index.html(1810): > <a href="javascript:void(0);" onClick='return chkValue("exportCheck");'>ダウンロード</a>: <input type=checkbox id=exportCheck name=exCk >
index.html(1813): <div id=receivers style="display:none;">
index.html(1828): <div class=optionPanelModal id=optionPanelScn>
index.html(1830): <table id=uiTable>
index.html(1834): 	id="scnNewSheet"
index.html(1853): 	<input type=text id=scnMapfile style="width:100%" value="---" onChange="myScenePref.rewrite(this.id)"/>
index.html(1859): 		id=scnTitle
index.html(1868): 		id=scnSubtitle
index.html(1880): 			id=scnOpus
index.html(1890): 			id=scnScene
index.html(1897): 			id=scnCut
index.html(1907): 			id=scnLayers
index.html(1914): 			id=scnLayersLbls
index.html(1921): 			id=scnLayerUpdate
index.html(1928): 			id=scnDel_layer
index.html(1938): 			id=scnTime
index.html(1944): 			id=scnFramerate
index.html(1950): 			id=scnSetFps
index.html(1969): 		<input type=text id=scnTrin style="width:5em" value="tr-in" onChange="myScenePref.rewrite(this.id)"/>
index.html(1970): 		<input type=text id=scnTrinT style="width:5em" value="---" onChange="myScenePref.rewrite(this.id)"/>
index.html(1974): 		<input type=text id=scnTrot style="width:5em" value="tr-out" onChange="myScenePref.rewrite(this.id)"/>
index.html(1975): 		<input type=text id=scnTrotT style="width:5em" value="---" onChange="myScenePref.rewrite(this.id)"/>
index.html(1979): 		<input	type=hidden id=scnCreate_time value=""/>
index.html(1980): 		<input	type=hidden id=scnCreate_user value=""/>
index.html(1981): 		<input	type=hidden id=scnUpdate_time value=""/>
index.html(1982): 	</th><td id=scnCreate_timeTD >	日付(自動)
index.html(1983): 	</td><td id=scnCreate_userTD >	名前(自動)
index.html(1987): 	</th><td id=scnUpdate_timeTD >	日付(自動)
index.html(1990): 			id=scnUpdate_user
index.html(1998): 		<textarea id=scnMemo rows=4 style="width:100%" onChange="myScenePref.rewrite(this.id)">
index.html(2009): 	<div id=scnCellTable style="display:none"> 
index.html(2010): 	<span id=scnLayerBrouser ></span>
index.html(2020): <div class=optionPanel id=optionPanelTimeUI>
index.html(2045): <div class=optionPanelModal id=optionPanelFile >
index.html(2069): 	id=cutInput
index.html(2076): 	id=timeInput
index.html(2082): 	id=statusInput
index.html(2110): <div id=current_identifier></div>
index.html(2115):  id='ddp-reference'
index.html(2120):  id='ddp-readout'
index.html(2125):  id='ddp-checkin'
index.html(2130):  id='ddp-activate'
index.html(2135): <input type='text' id='ddp-searchtext' size=20 ><button
index.html(2136):  id='ddp-search'
index.html(2141):  id='ddp-close'
index.html(2167): 	id="repositorySelector-f"
index.html(2181): 	id="opusSelect"
index.html(2191): 	id="cutList"
index.html(2204):  id='ddp-refresh'
index.html(2256): <div class=optionPanelModal id=optionPanelPref>
index.html(2260): 		<th class=menu colspan=3> name. / <span id=myName onClick="myPref.chgMyName()"></span></th>
index.html(2270): 	<tr id=cgiMenu>
index.html(2276): 	<tr id=airMenu>
index.html(2292): 		<input type="radio" name="viewMode" id=vMWordProp value="WordProp" onClick='myPref.chgVM(this.value)' checked onChange="alert(this.value)">
index.html(2294): 		<input type="radio" name="viewMode" id=vMCompact value="Compact" onClick='myPref.chgVM(this.value)'>
index.html(2301): 		blank method. <SELECT NAME=blmtd id=prefBlmtd onChange="myPref.chgblk(this.id)">
index.html(2307): 		</SELECT><SELECT NAME=blpos id=prefBlpos onChange="myPref.chgblk(this.id)">
index.html(2314): 		AE Version<SELECT NAME=AEver id=prefAeVersion>
index.html(2320): 		<SELECT NAME=keyMethod id=prefKeyMethod>
index.html(2324): 		フーテージのフレームレート:<INPUT TYPE=text SIZE=6 NAME=fpsF id=prefFpsF VALUE=--
index.html(2325): 			onChange="myPref.chgfpsF(this.id)"> fps<SELECT NAME=SetFpsF id=SetFpsF
index.html(2341): 			TYPE=CheckBox NAME=timeShift id=timeShift><br />
index.html(2342): 		省略時サイズ:<input type=text SIZE=4 NAME=dfX id=prefDfX VALUE="---"
index.html(2345): id=prefDfY VALUE="---" onChange="myPref.chgdfSIZE(this.id)">:<input type=text
index.html(2346): 			SIZE=3 NAME=dfA id=prefDfA VALUE="---" onChange="myPref.chgdfSIZE(this.id)"><SELECT
index.html(2347): 			NAME=dfSizeSet id=prefDfSizeSet onChange="myPref.chgdfSIZE(this.id)">
index.html(2369): 				1枚の秒数<INPUT TYPE=TEXT NAME=SheetLength id=prefSheetLength VALUE=6 SIZE=2>秒<br />
index.html(2371): 					TYPE=CheckBox NAME=PageCol id=prefPageCol checked><br />
index.html(2373): 					TYPE=CheckBox NAME=footMark id=prefFootMark checked><br />
index.html(2377): 				0.<SELECT NAME=FCTo0 id=FCTo0>
index.html(2391): 				1.<SELECT NAME=FCTo1 id=FCTo1>
index.html(2409): 					TYPE=checkbox NAME=cLoop id=cLoop checked><br />
index.html(2411): 					TYPE=checkbox NAME=sLoop id=sLoop><br />
index.html(2413): 					TYPE=CheckBox NAME=autoScroll id=autoScroll checked><br />
index.html(2415): 					TYPE=CheckBox NAME=tabSpin id=tabSpin checked><br />
index.html(2417): 					TYPE=CheckBox NAME=noSync id=noSync checked><br />
index.html(2419): 					TYPE=CheckBox NAME=UtilBar id=prefUtilBar checked><br />
index.html(2429): 		export size. <SELECT NAME=expSize id=prefEpsS onChange="myPref.chgSize(this.id)">
index.html(2444): <div class=optionPanelModal id=optionPanelVer >
index.html(2455): <span style="font-size:small" id=versionString>
index.html(2457): <span id=myVer0></span> <span id=myServer0>[no-server]</span><br />
index.html(2472): <div class=optionPanel id=optionPanelDbg>
index.html(2483): 	id=msg_well
index.html(2486): 	id=clearMsg
index.html(2491): 	id=action
index.html(2496): 	id=select
index.html(2501): 	id=switchPmenu
index.html(2506): 	id=doInit
index.html(2512): 	id=doLock
index.html(2518): 	id=reset
index.html(2522): 	id=clsCommand
index.html(2528): 	id=insDgebi
index.html(2533): 	id=insJquery
index.html(2538): 	id=insForProp
index.html(2543): 	id=insXui
index.html(2548): 	id=insXui
index.html(2553): 	id=closeDbg
index.html(2559):  id='test001'
index.html(2562):  id='test002'
index.html(2565):  id='test003'
index.html(2569):  id='test004'
index.html(2575): 	id=select
index.html(2584): 	id=cmd
index.html(2590): <div class=optionPanelFloat id=optionPanelTbx >
index.html(2592): <div id=formTbx>
index.html(2597): 	id=uiTable
index.html(2607): 			id=single
index.html(2612): 	id=home
index.html(2619): 	id=end
index.html(2629): <td	id=l_select
index.html(2633): 	id="layer"
index.html(2648): <td	id=c_select
index.html(2652): 	id="cell"
index.html(2663): <td	id=u_select
index.html(2667): 	id="fav"
index.html(2686): 	id=clearFS
index.html(2697): 	id=skb12
index.html(2704): 	id=skb13
index.html(2711): 	id=skb14
index.html(2718): 	id=skb15
index.html(2726): 	id=skb07
index.html(2733): 	id=skb08
index.html(2740): 	id=skb09
index.html(2747): 	id=skb
index.html(2755): 	id=skb04
index.html(2762): 	id=skb05
index.html(2769): 	id=skb06
index.html(2776): 	id=skb
index.html(2784): 	id=skb01
index.html(2791): 	id=skb02
index.html(2798): 	id=skb03
index.html(2805): 	id=skb
index.html(2813): 	id=skb00
index.html(2820): 	id=skb10
index.html(2827): 	id=skb11
index.html(2834): 	id=skb
index.html(2845): 	id=pgup
index.html(2852): 	id=pgdn
index.html(2862): 	id=up
index.html(2868): 	id=left
index.html(2874): 	id=right
index.html(2880): 	id=down
index.html(2888): 	id=back
index.html(2894): 	id=fwd
index.html(2906): <div class=optionPanel id=optionPanelSnd>
index.html(2911): <select name=soundLabelSelector id=saundLabelSelect　>
index.html(2922): <select name=soundLabelSelector id=saundLabelSelect　>
index.html(2952): <input type=test id=soundIP value="00:00:00" style="width:96px"
index.html(2955): ><input type=button id=select value="▼" style="width:32px"
index.html(2958): <br><textarea nema=SndBody id=snd_body style="width:80%;height:72px"
index.html(2963): <input type=test id=soundIP value="00:00:00" style="width:96px"
index.html(2966): ><input type=button id=select value="▼" style="width:20px"
index.html(2972): <input type=test id=soundIP value="00:00:00" style="width:96px"
index.html(2975): ><input type=button id=select value="▼" style="width:20px"
index.html(2978): <input type=button id=localFileLoaderSelect value="↑：取込" style="width:10%"
index.html(2980): ><input type=button id=select value="↓：適用" style="width:10%"
index.html(2982): ><input type=button id=select value="取込" style="width:10%"
index.html(2984): ><input type=button id=select value="全選択" style="width:10%"
index.html(2987): 	type=reset id=reset value="リセット" style="width:10%"
index.html(2989): 	id=select value="消去" style="width:10%"
index.html(2992): 	type=button id=option value="閉じる" style="width:10%"
index.html(2998): <div id=memoArea>
index.html(2999):    <div id=memo_header >
index.html(3005): >MEMO : </a> <span id="transit_data"></span>
index.html(3008): <div class=optionPanel id=optionPanelMemo >
index.html(3028): <textarea name=rEsult id=rEsult cols=96 rows=8 >
index.html(3032): <span id=myWords
index.html(3040):    <div id=memo></div>
index.html(3043): <div class=application_status id=app_status><br></div>
index.html(3045): <div id=sheet_view>
index.html(3047):   <div id="scrollSpaceHd" class="screenSpace"></div>
index.html(3052):     <div id=sheet_body
index.html(3063): <span id=myVer1></span> <span id=myServer1>[no-server]</span>
index.html(3067): <!--	<input id=startupXPS value=false>	-->
index.html(3068): <textarea id="startupXPS" style='width:75%;'></textarea>
index.html(3069): <textarea id="referenceXPS" style='width:75%;'></textarea>
index.html(3072): <div id="scrollSpaceFt" class=\"screenSpace\"><br></div>
index.html(3075): <span id="backend_variables"
index.html(3080):     data-episode_id="17"
index.html(3081):     data-cut_id="24"　
index.html(3084):     data-line_id="0:(本線)"
index.html(3085):     data-stage_id="0:ライカ"
index.html(3086):     data-job_id="1:"

    ];
    
    /*[    "skbHome"
,     "skbEnd"
,   "tBtrackID"
,    "tBtrackEL"
,     "tBitems"

,    "skbPgup"
,    "skbPgdn"
,      "skbUp"
,   " skbLeft"
,   "skbRight"
,    "skbDown"
,    "skbBack"
,     "skbFwd"
]*/