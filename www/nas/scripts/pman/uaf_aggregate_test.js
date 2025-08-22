/*
	暫定集計
	uafリストを採取
	進行状況を取得
	本線:stage		startup CT 3DLO LO GEN
	step(job-step)
		0	未着手〜UP
		1	演出チェック済み OKまたはNG
		2	第二チェック済み
	status
			ステータスなし		状況不定
		s	スタートアップ		未着手
		a	アクティブ		作業中（チェック中）
		h	ホールド			作業保留中 *解決が必要
		f	済				作業済み
		c	工程完了			次工程へ進行済
		r	差し戻し			差戻
(aborted)	作業中断			欠番を含む作業中断(中途終了)

履歴をたどると進行状態が採取できる
現在の集計ではUAFバンドル単位でのみ集計

// 暫定集計フォーマット
検出エントリ
有効エントリ（欠番等を引いたもの）
検出カット数
有効カット数（欠番等を引いたもの）

00_CT   あがり R 完了
01_3DLO 0:発注 1:あがり 2:検査 ... R 完了
02_LO   0:発注 1:あがり 2:演出 3:監督 4:作監 5:総作監 R 完了
03_原画  あがり 演出 作監 総作監 R 前検 完了
04_動画  あがり

タイトル別に集計

欠番エントリ   :



*/
pman.uaf_aggregation = function uaf_aggregation (){
//uafエントリを抽出
//	var uafEntries = pman.reName.items.filter(e => ((!(e.hidden))&&(e.type == '-bundle-')&&(e.bundleInf.type = 'uaf')));
	var uafEntries = [];
	pman.reName.items.forEach(function(e){
		if((!(e.hidden))&&(e.type == '-bundle-')&&(e.bundleInf.type = 'uaf')) uafEntries.push(e.bundleInf.bundleData)
	});
	var cutEntries = [];

//LOステージ集計
var checkList ={
	uaf:[],
//全カットカウント
	cut:[],
//欠番リスト
	//ショットリスト
	//欠番
	abortedCount:0,
	//未あがりカット CT || startup
	noWork:0,
	//LO作業上がり
	upCount:0,
	//LO演出チェック済み LO.step > 0
	ckCount:0
};
	uafEntries.forEach(e =>{
		checkList.uaf.push(e.uniquekey);
		e.inherit.forEach(c =>{
			if(typeof c.status == 'undefined') c.status = e.status.toString();
			cutEntries.push(c);
			checkList.cut.push(c.cut);
		});


		if((e.auditTrail.length)&&(e.auditTrail[0].status == "(aborted)")){
			checkList.abortedCount ++;
		}else if((e.stage=='CT')||(e.stage=='startup')){
			checkList.noWork ++;
		}else{
			checkList.upCount ++;
			if(
				((e.stage=='LO')&&(e.step > 0))||(e.stage!='LO')
			) checkList.ckCount ++;
		};
	});
	console.log(checkList);
	return ({uafEntries,cutEntries,checkList});
};

pman.reName.show_uaf_aggregation = function(){
//miniTextEditorへ構成変更
	nas.HTML.miniTextEdit.init(
		pman.uaf_aggregation(),
		'現在プレビュー中のカット進行表　簡易集計です (全タイトル)',
		'簡易集計',
		nas.File.join(pman.reName.baseFolder,"__progression_table.txt"),
		nas.HTML.sendText2Clipboard
	);
}