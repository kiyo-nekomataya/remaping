# nas

__JSDocコメント書きましょう！__

## クラス
### BlurFilter
BlurFilterクラスを使用すると、表示オブジェクトにぼかし効果を適用できます。ぼかし効果とは、曇りガラスのようにぼやっとぼけている効果です。結果として得られるイメージが最大サイズを超えると、フィルターは適用されません。
```js
SampleJS.BlurFilter.add(target, 4, 4);
```

### Loader
Loaderクラスは、外部にあるファイルを読み込むために使用します。読み込みを開始するにはload()メソッドを使用します。
```js
var loader = new SampleJS.Loader();
loader.load("sample.json", { id: "test1" }
```

## License

MIT License.