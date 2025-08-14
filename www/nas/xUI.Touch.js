/*参考データ


    */
public class TouchTestActivity extends Activity {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

	}

	//簡単なタッチイベント処理
	@Override
	public boolean onTouchEvent(MotionEvent event) {
		switch ( event.getAction() ) {

		case MotionEvent.ACTION_DOWN:
			//画面がタッチされたときの動作
			break;

		case MotionEvent.ACTION_MOVE:
			//タッチしたまま移動したときの動作
			break;

		case MotionEvent.ACTION_UP:
			//タッチが離されたときの動作
			break;

		case MotionEvent.ACTION_CANCEL:
			//他の要因によってタッチがキャンセルされたときの動作
			break;

	    	}

		return super.onTouchEvent(event); 
	}

}
/*    xUI.Touch(e)
引数:    e    タッチイベント
戻値:        UI制御用
    タッチ動作
タッチ処理を集中的にコントロールするファンクション

関連プロパティ
    xUI.touchStart
    xUI.touchEnd
    xUI.touchEnd
    xUI.edmode
0 : 通常編集
1 : ブロック編集
2 : セクション編集
3 : セクション編集フローティング
モード変更はxUI.mdChg関数を介してい行う

モード別テーブルセル編集操作一覧



 */
xUI.Touch=function(e){
    xUI.touchStart
    xUI.touchEnd
    
    
    console.log(e.target.id);
    if(e.target.id=='dialogEdit'){return false};
    if((this.edmode==3)&&(e.target.id=='sheet_body')&&(e.type=='mouseout')){
        xUI.sectionUpdate();
        this.mdChg(2);
        this.Touch.action=false;
        return false;
    };
if(dbg) dbgPut(e.target.id+":"+e.type.toString());
//document.getElementById("iNputbOx").focus();

if(this.edchg){ this.eddt= document.getElementById("iNputbOx").value };
//IEのとき event.button event.srcElement
//    if(MSIE){TargeT = event.srcElement ;Bt = event.button ;}else{};

        var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
// dbgPut(TargeT.id);
//IDの無いエレメントは処理スキップ
    if(! TargeT.id){
        xUI.Touch.action = false;
//         if (this.edmode==3){this.Touch()}
        return false;
    }
//カラム移動処理の前にヘッダ処理を追加 2010/08
    if(TargeT.id.match(/^L([0-9]+)_(-?[0-9]+)_([0-9]+)$/)) {
        var tln=1*RegExp.$1;var pgn=1*RegExp.$2;var cbn=1*RegExp.$3;//timeline(column)ID/pageID/columnBlockID
switch(e.type){
case    "dblclick":
        reNameLabel((tln).toString());
break;
case    "mousedown":
    if(this.edmode==0)xUI.changeColumn(tln,2*pgn+cbn);
break;
}
    xUI.Touch.action = false;
    return ;
    }
//-------------------ヘッダ処理解決

//    if(TargeT.id.split("_").length>2){return false};//判定を変更
//ページヘッダ処理終了
//=============================================モード別処理
if(this.edmode==3){
/*
    セクション編集フローティング

    フローティング移動中

*/

    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
switch (e.type){
case    "dblclick"    :
case    "mousedown"    :    
	document.getElementById("iNputbOx").focus();
break;
case    "click"    :
case    "mouseup"    ://終了位置で解決
//[ctrl][shift]同時押しでオプション動作
    xUI.sectionUpdate();
    this.mdChg(2);
    this.Touch.action=false;

//    this.floatTextHi();
break;
case    "mouseover"    :
    if((hottrack!=xUI.Select[0])||(! xUI.Touch.action)) {
        if(TargeT.id && TargeT.id.match(/r?L\d/)){
            xUI.sectionUpdate();
            this.mdChg(2);
            this.Touch.action=false;
        }
        return false
    };
if(! this.Touch.action){
    return false;

    if(this.Touch.action){
        if (TargeT.id && xUI.Touch.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
        this.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(this.edmode==2){
	document.getElementById("iNputbOx").focus();
    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
/*
    モード遷移は他の状態からコール
    セクション編集モード
    トラック内限定で区間編集を行う。
    モード変更コマンドの発行はemode==0の際のみ有効
    モード変更のトリガは、ダブルクリック
基本操作
３種のターゲットがある
        body
セクション全体がトラック内を前後に移動する
フローティングムーブに準ずる処理  ホットポイントオフセットが存在する
        head
        tail
トラック内でセクションが伸縮
他のノードを固定してヘッドまたはテールノードが移動することでセクションを伸縮する  

edmode==3  中は、タッチオーバーでセクション body||head||tail 移動
リリースで移動（＝編集）を解決  1回毎に更新回数を記録
ダブルクリックまたは対象トラック外をクリックで解決してモード解除
エスケープまたは対象トラック外右クリックで変更を廃棄して編集前に戻す

キーボード操作(1フレームづつ移動なので要注意)
    モード遷移・確定 [ctrl]+[shift]+[ENTER]
    ボディ移動       [↑]/[↓]
    ヘッド移動       [ctrl]+[↑]/[↓]
    テール移動       [shift]+[↑]/[↓]
                     [shift]+[ctrl]+[↑]/[↓]
     編集破棄＋モード解除
                     [esc]
                     
    セクション操作オフセットをxUIのプロパティで設定する
    値が０なら前方伸長  値が末尾なら後方伸長それ以外は移動
    継続時間が1の場合は末尾として扱う
    解決順が  末尾＞先頭＞以外になれば操作種別を１種にできる
    すべてsectionMove(start,duration)に集約できそう
    
*/
switch (e.type){
case    "dblclick"    :
//セクション操作モードを抜けて確定処理を行う
//確定処理はmdChg メソッド内で実行
              this.mdChg("normal");
break;            
case    "mousedown"    :
    //サブモードを設定
    if((
        Math.abs(hotpoint -(xUI.Select[1]+(xUI.Selection[1]/2))) >
        Math.abs(xUI.Selection[1]/2)
        )&&(hottrack == xUI.Select[0])
    ){
//レンジ外
        if (e.shiftKey){
//近接端で移動
            xUI.sectionManipulateOffset[1] = (hotpoint<xUI.Select[1])? 0:this.Selection[1];
            xUI.sectionManipulateOffset[0] = 'body';
        }else if((e.ctrlKey)||(e.metaKey)){
//近接端で延伸
            xUI.sectionManipulateOffset[1] = (hotpoint<xUI.Select[1])? 0:this.Selection[1];
            xUI.sectionManipulateOffset[0] = (hotpoint<xUI.Select[1])? 'head':'tail'; 
        }else{
            return xUI.mdChg(0);//モード解除
        }
        this.sectionPreview(hotpoint);
        this.sectionUpdate();
    }else{
//フロートモードへ遷移
        xUI.sectionManipulateOffset[1] = hotpoint-this.Select[1];
        xUI.sectionManipulateOffset[0] = 'body';
        if(xUI.sectionManipulateOffset[1]==xUI.Selection[1]){
            xUI.sectionManipulateOffset[0] = 'tail';
        } else if(xUI.sectionManipulateOffset[1]==0){
            xUI.sectionManipulateOffset[0] = 'head';
        }
    }
    xUI.mdChg(3);    
    xUI.Touch.action=true;
//    console.log([xUI.edmode,hotpoint,xUI.sectionManipulateOffset,xUI.Touch.action]);
break;
case    "click"    :;//クリックしたセルで解決  (any):body/+[ctrl]:head/+[shift]:tail 
    if(hottrack!=xUI.Select[0]) {
        //対象トラック外なら確定して解除
        this.mdChg("normal");        
    }
break;

case    "mouseup"    ://終了位置で解決
//[ctrl]同時押しで複製処理
    //  this.mdChg(0,(e.ctrlKey));
    this.Touch.action=false;
    this.floatTextHi();
break;
case    "mouseover"    :
    
//トラックが異なる場合 NOP return
//    var sectionRegex=new RegExp('^'+String(xUI.Select[0])+'_([0-9]+)$');
//    if((!(TargeT.id.match(sectionRegex)))||(! xUI.Touch.action)){return false};//ターゲットトラック以外を排除
    if((hottrack!=xUI.Select[0])||(! xUI.Touch.action)) {return false};
if(! this.Touch.action){
    return false;

    if(this.Touch.action){
        if (TargeT.id && xUI.Touch.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
            this.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(this.edmode==1){
//return false;
//ブロックムーブ（フローティングモード）
/*
    基本動作:
タッチオーバーでセクションを移動
リリースで移動を解決してモード解除
ダブルクリック・クリック等は基本的に発生しないので無視
*/
switch (e.type){
case    "dblclick"    :
//              this.mdChg("section");
//              this.floatTextHi();//導入処理
//            this.selectCell(TargeT.id);
//    this.floatDestAddress=this.Select.slice();
            
case    "mousedown"    :
case    "click"    :
case    "mouseup"    ://終了位置で解決
//    console.log("<<<<<<")
//[ctrl]同時押しで複製処理
      this.mdChg(0,((e.ctrlKey)||(e.metaKey)));
      this.floatTextHi();
break;
case    "mouseover"    ://可能な限り現在位置で変数を更新
    if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除
//オフセットを参照して  .Select .Selection を操作する
/*
    
*/
if(false){
    if(this.Touch.action){
        if (TargeT.id && xUI.Touch.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
            this.selectCell(TargeT.id);
    this.floatDestAddress=this.Select.slice();
}
    break;
default    :    return true;
};
    return false;
}
//=============================================カラム移動処理
    if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除

switch (e.type){
case    "dblclick"    :
            //ダブルクリック時はモード保留して（解除か？）タイムラインセクション編集モードに入る
            this.mdChg("section",TargeT.id);
            this.Touch.action=false;
            return false;
break;
case    "mousedown"    :
//document.getElementById("iNputbOx").value=("mouseDown")
    if (this.edchg){this.put(this.eddt);}//更新

    this.Touch.rID=this.getid("Select");//
    this.Touch.sID=TargeT.id;
    this.Touch.action=true;

//    if(TargeT.id==this.getid("Select"))
//    {    }else{    };

        if(this.Selection[0]!=0||this.Selection[1]!=0){
//選択範囲が存在した場合
//if(dbg) dbgPut(this.edmode+":"+this.getid("Select")+"=="+TargeT.id);
//        var CurrentSelect=TargeT.id.split("_");
/*
        var CurrentAction=this.actionRange();
        if(
        (CurrentAction[0][0]<=CurrentSelect[0] && CurrentAction[1][0]>=CurrentSelect[0])&&
        (CurrentAction[0][1]<=CurrentSelect[1] && CurrentAction[1][1]>=CurrentSelect[1])
        ){}
*/
        if(TargeT.id==this.getid("Select")){
              //フォーカスセルにタッチダウンしてブロック移動へモード遷移
            //クリック時とダブルクリック時の判定をしてスキップしたほうが良い
//            if(TargeT.id!=this.floatDestAddress.join("_")){}
            this.mdChg('block');
            this.floatTextHi();
            this.selectCell(TargeT.id);
            this.floatDestAddress=this.Select.slice();

            this.Touch.action=false;
            return false;
          }else{
        if(e.shiftKey){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            this.selection();//セレクション解除
            this.Touch.action=false;
            this.selectCell(TargeT.id);//セレクト移動
        }
            return false;
          }
        }else{
//選択範囲が存在しない場合
            this.selection();//セレクション解除
        };

        if(e.shiftKey){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            if ((! e.ctrlKey)&&(! e.metaKey)){this.selection()};//コントロールなければ選択範囲の解除

            //this.Touch.action=false;
            this.selectCell(TargeT.id);
        };
    break;
case    "mouseup"    :
//document.getElementById("iNputbOx").value=("mouseUp")
        this.Touch.action=false;
    if( this.Touch.sID!=TargeT.id){
        if(e.shiftKey){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            return false;//セレクトしたまま移動
        };
    };
    break;
case    "click"    :

    break;
case    "mouseover"    :
    if(this.Touch.action){
        if (TargeT.id && xUI.Touch.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
default    :    return true;
};
    return false;
};
