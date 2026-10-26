(() => {
  const dom = ace.require("ace/lib/dom");
  const importCss = dom.importCssString;
  dom.importCssString = (css, id, target) => {
    const own = id && `cfb-${id}`;
    const result = importCss.call(dom, css, own, target);
    const style = own && document.getElementById(own);
    if (style && style.parentNode === document.head && style !== document.head.lastElementChild) document.head.append(style);
    return result;
  };
  const editorCss = ace.require("ace/css/editor-css");
  dom.importCssString(typeof editorCss === "string" ? editorCss : editorCss.default, "ace_editor.css");
})();
