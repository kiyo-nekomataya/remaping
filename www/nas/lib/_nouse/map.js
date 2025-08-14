/**
 * @fileoverview 簡易マップオブジェクト
 
このコードはすでに使用されていないので　削除予定　2016 09
 */

/**
 * psMapElement
 * マップ要素の親クラス
 * このファイルの上方の記述はps専用なので注意
 *
 * @param myParentGroup
 * @param myName
 * @param myLayer
 */
psMapElement = function (myParentGroup, myName, myLayer) {
    this.parent = myParentGroup;
    this.name = myName;
    this.body = myLayer;
    this.index = this.parent.elements.length;
};

/**
 psMapGroup = function (myMap, nameLabel, lot, myLayer) {
    this.parent = myMap;
    this.body = myLayer;
    if (!nameLabel) {
        nameLabel = "";
    }
    ;//明示的に
    this.name = nameLabel;
    if (!lot) {
        lot = 0;
    }
    ;//最低0枚
    this.elements = new Array();//エレメントトレーラ
    if (lot) {
        for (var idx = lot - 1; idx >= 0; idx--) {
            this.elements.push(new psMapElement(this, this.body.layers[idx].name, this.body.layers[idx]))
        }
    }
}

 var myPsMap = new Object();
 myPsMap.body = app.activeDocument;
 myPsMap.groups = new Array;//mapトレーラ
 //トレーラにグループを登録　グループ自身がエレメントを登録する
 for (var gIdx = myPsMap.body.layers.length - 1; gIdx >= 0; gIdx--) {
    myPsMap.groups.push(new psMapGroup(myPsMap, myPsMap.body.layers[gIdx].name, myPsMap.body.layers[gIdx].layers.length, myPsMap.body.layers[gIdx]));
}


 //myPsMap.groups[2].elements[0].body.visible=true;

 for (var gidx = 0; gidx < myPsMap.body.layers.length; gidx++) {
    for (var eidx = 0; eidx < myPsMap.groups[gidx].elements.length; eidx++) {
        var myLayer = myPsMap.groups[gidx].elements[eidx].body;
        var myName = [myPsMap.groups[gidx].body.name, eidx + 1].join("-")
        if (myLayer.name != myName) {
            myLayer.name = myName
        }
    }
}
 //メンバーに設定　メンバー自身のレイヤ内順位を戻すメソッド
 ArtLayer.prototype.getIdx = function () {
    for (var id = 0; id < this.parent.layers.length; id++) {
        if (this.parent.layers[id].name == this.name) {
            return this.parent.layers.length - id - 1
        }
        ;
    }
};
 //    app.activeDocument.activeLayer.getIdx();
 //レイヤーセットに設定　セット内を名前でアクセスしてセット内順位を返す
 LayerSet.prototype.getIdx = function (Lname) {
    for (var id = 0; id < this.layers.length; id++) {
        if (this.layers[id].name == Lname) {
            return this.layers.length - id
        }
        ;
    }
};
 //    app.activeDocument.activeLayer.parent.getIdx("B-1");





 /**
 * マップオブジェクト
 * Mapオブジェクト及びXpsオブジェクト内部で利用されるオブジェクト
 * 或る程度の独立性を持って、戻しデータをコントロールするための中間オブジェクト
 */

/**
 * MapElement
 * マップ要素の親クラス
 * グループID
 * ラベル
 * ポイントするオブジェクト
 * @param myParentGroup
 * @param myName
 * @param myObject
 * @constructor
 */
nas.MapElement = function (myParentGroup, myName, myObject) {
    this.parent = myParentGroup;//
    this.name = myName;
    this.value = myObject;
    this.index = this.parent.elements.length;
};

/**
 * MapGroup
 * マップグループ
 * デフォルトのグループを含み各グループの情報を保持するオブジェクト
 * グループトレーラーに格納される
 * （ps環境ではグループに相当するレイヤセットを参照する）
 * ジオメトリックプロパティは、valueプロパティで保持する
 * @param myType
 * @param myMap
 * @param nameLabel
 * @constructor
 */
nas.MapGroup = function (myType, myMap, nameLabel) {
    this.type = (myType == undefined) ? myType : "cell";//cell/camerawork/system/sound/effect/composit/
    this.parent = myMap;
//	this.body=myLayer;
    switch (this.type) {
        case "system":
            this.value = nas.defaultValues.system;
            break;
        case"camerawork":
            this.value = nas.dafaultValues.camerawork;
            break;
        case "sound":
            this.value = nas.defaultValues.soundtrack;
            break;
        case"effect":
        case"composit":
            this.value = nas.defaultValue.composit;
            break;
        case "cell":
        default:
            this.value = nas.defaultValue.cell;
    }
    this.scale;

    this.if(!nameLabel);
    {
        nameLabel = "";
    }//明示的に

    this.name = nameLabel;
    if (!lot) {
        lot = 0;
    }//最低0枚

//	this.elements=new Array();//エレメントトレーラはない グループごとに参照を保持はしない
    if (lot) {
        for (var idx = lot - 1; idx >= 0; idx--) {
            this.elements.push(new psMapElement(this, this.body.layers[idx].name, this.body.layers[idx]))
        }
    }
};

var Map = {};
myPsMap.body = app.activeDocument;
/**
 * mapトレーラ
 * @type {Array}
 */
myPsMap.groups = [];

/**
 * トレーラにグループを登録　グループ自身がエレメントを登録する
 */
for (var gIdx = myPsMap.body.layers.length - 1; gIdx >= 0; gIdx--) {
    myPsMap.groups.push(new psMapGroup(myPsMap, myPsMap.body.layers[gIdx].name, myPsMap.body.layers[gIdx].layers.length, myPsMap.body.layers[gIdx]));
}


//myPsMap.groups[2].elements[0].body.visible=true;
for (var gidx = 0; gidx < myPsMap.body.layers.length; gidx++) {
    for (var eidx = 0; eidx < myPsMap.groups[gidx].elements.length; eidx++) {
        var myLayer = myPsMap.groups[gidx].elements[eidx].body;
        var myName = [myPsMap.groups[gidx].body.name, eidx + 1].join("-");
        if (myLayer.name != myName) {
            myLayer.name = myName
        }
    }
}