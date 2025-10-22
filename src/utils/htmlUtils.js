export function cleanGeminiHTML(html) {

  const cleanedHtml = html.replace(/```html/g, "").replace(/```/g, "").trim();
  if (!isHtmlValid(cleanedHtml)) return "";
  return cleanedHtml;
}

export function isHtmlValid(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (doc.body.childNodes.length === 0 || !doc.body.firstChild.tagName) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
