import "@testing-library/jest-dom";

// jsdom の innerText は実装が不完全で、ブロック要素間に空白だけの行
// ("\n \n")を挟むなど実ブラウザと挙動が異なる。innerText に依存する
// パーサー(parseGeneric)が実ブラウザと同じ結果になるよう、ブロック要素の
// 境界に改行を入れて空白を正規化する近似ポリフィルで常に上書きする。
// (住所抽出など「ラベル行の次の行」を取り出すロジックの再現に必要)
if (typeof HTMLElement !== "undefined") {
  const BLOCK =
    /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|DD|DIV|DL|DT|FIGCAPTION|FIGURE|FOOTER|H1|H2|H3|H4|H5|H6|HEADER|LI|MAIN|NAV|OL|P|SECTION|TABLE|TBODY|THEAD|TR|UL)$/;

  function innerTextOf(el: Node): string {
    let text = "";
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        text += node.textContent ?? "";
      } else if (node.nodeType === 1) {
        const tag = (node as Element).tagName;
        if (tag === "BR") {
          text += "\n";
        } else if (BLOCK.test(tag)) {
          text += "\n" + innerTextOf(node) + "\n";
        } else {
          text += innerTextOf(node);
        }
      }
    });
    return text;
  }

  Object.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    get() {
      return innerTextOf(this)
        .split("\n")
        .map((line) => line.replace(/[ \t]+/g, " ").trim())
        .filter((line) => line.length > 0)
        .join("\n");
    },
  });
}
