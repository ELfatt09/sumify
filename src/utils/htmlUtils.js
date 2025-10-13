export function cleanGeminiHTML(html) {
  return html.replace(/```html/g, "").replace(/```/g, "").trim();
}
