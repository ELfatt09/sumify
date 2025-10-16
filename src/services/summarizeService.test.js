import { describe, it, expect, vi, beforeEach } from "vitest";
import { gemini } from "../lib/gemini";
import { generateSummaryFromPDF } from "./summarizeService";


// --- Mock Gemini ---
vi.mock("../lib/gemini", () => ({
  gemini: { models: { generateContent: vi.fn() } },
}));

vi.mock("./storedAiResponseService", () => ({
  createOrUpdateResponseInDatabase: vi.fn(),
}))

import { createOrUpdateResponseInDatabase } from "./storedAiResponseService";






// ----------------------------
// 🧠 TESTS
// ----------------------------
describe("summarizeService", () => {
  beforeEach(() => vi.clearAllMocks());

  // --- generateSummaryFromPDF ---
  describe("generateSummaryFromPDF()", () => {
    it("returns formatted HTML summary when content exists", async () => {
      gemini.models.generateContent.mockResolvedValue({
        candidates: [{ content: { parts: [{ text: "<p><strong>Ringkasan:</strong> Dokumen ini membahas...</p>" }] } }],
      });

      const result = await generateSummaryFromPDF("fakePDF", "prompt", 1);

      expect(gemini.models.generateContent).toHaveBeenCalledOnce();
      expect(result).toContain("<p>");
      expect(result).toContain("<strong>");
    });

    it("returns empty string if no content returned", async () => {
      gemini.models.generateContent.mockResolvedValue({});
      const result = await generateSummaryFromPDF("fakePDF");
      expect(result).toBe("");
    });

    it("returns error message if PDF is invalid", async () => {
      gemini.models.generateContent.mockRejectedValue(new Error("Invalid PDF"));
      const result = await generateSummaryFromPDF("invalidPDF");
      expect(result).toBe("Gagal membuat ringkasan. Invalid PDF");
    })

    it("should run createOrUpdateResponseInDatabase if base64PDF is not null", async () => {
      
      gemini.models.generateContent.mockResolvedValue({
        candidates: [{ content: { parts: [{ text: "<p><strong>Ringkasan:</strong> Dokumen ini membahas...</p>" }] } }],
      });
      await generateSummaryFromPDF("fakePDF", "prompt", 1, 2);
      expect(createOrUpdateResponseInDatabase).toHaveBeenCalledWith(
        "<p><strong>Ringkasan:</strong> Dokumen ini membahas...</p>",
        1, 2
      );
    });
  });

  
});
