import {describe, it, expect} from "vitest";
import { isHtmlValid, cleanGeminiHTML } from "./htmlUtils";

describe("htmlUtils", () => {
    it("should validate HTML format", () => {
        expect(isHtmlValid("<p>Hello, world!</p>")).toBe(true);
        expect(isHtmlValid("invalid-html")).toBe(false);
    });
});

describe("htmlUtils", () => {
    it("should clean Gemini HTML", async () => {
        expect(cleanGeminiHTML("```html<p>Hello, world!</p>```")).toBe("<p>Hello, world!</p>");
        expect(cleanGeminiHTML("```html\ninvalid-html\n```")).toBe("");
    });
});