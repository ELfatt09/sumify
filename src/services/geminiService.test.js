import { describe, it, expect, vi } from "vitest";
import { generateSummaryFromPDF } from "./geminiService";

vi.mock("../lib/gemini", () => ({
  gemini: {
    models: {
      generateContent: vi.fn(),
    },
  },
}));

import { gemini } from "../lib/gemini";

describe("generateSummaryFromPDF", () => {
  it("should return formatted HTML summary", async () => {
    // Mocked response from Gemini API
    gemini.models.generateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              {
                text: "<p><strong>Ringkasan:</strong> Dokumen ini membahas...</p>",
              },
            ],
          },
        },
      ],
    });

    const fakePDF = "JVBERi0xLjMKJc..." // fake base64 data

    const result = await generateSummaryFromPDF(fakePDF);

    expect(gemini.models.generateContent).toHaveBeenCalledOnce();
    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
  });

  it("should return empty string if no content returned", async () => {
    gemini.models.generateContent.mockResolvedValue({});

    const result = await generateSummaryFromPDF("fakepdfdata");
    expect(result).toBe("");
  });
});