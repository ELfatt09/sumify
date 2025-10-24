import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateSummaryFromPDF } from "./summarizeService";
import { supabase } from "../lib/supabase";
import * as storedAiResponseService from "./storedAiResponseService";

vi.mock("../lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock("../storedAiResponseService", () => ({
  createOrUpdateResponseInDatabase: vi.fn(),
}));

vi.mock("../services/storedAiResponseService", () => ({
  createOrUpdateResponseInDatabase: vi.fn(),
}));


describe("generateSummaryFromPDF", () => {
  const mockPrompt = "Buat ringkasan singkat tentang isi PDF ini.";
  const mockFeatureId = 1;
  const mockUploadId = "upload-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call supabase function with correct arguments", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { text: "<p>Ringkasan AI</p>" },
      error: null,
    });

    const result = await generateSummaryFromPDF(
      mockPrompt,
      mockFeatureId,
      mockUploadId
    );

    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "smart-function/gemini-summariser",
      {
        body: {
          prompt: mockPrompt,
          featureId: mockFeatureId,
          uploadId: mockUploadId,
        },
      }
    );

    expect(result).toContain("Ringkasan AI");
  });

  it("should handle Supabase error gracefully", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: new Error("Edge function failed"),
    });

    const result = await generateSummaryFromPDF(
      mockPrompt,
      mockFeatureId,
      mockUploadId
    );

    expect(result).toContain("Gagal membuat ringkasan");
  });

  it("should save response to database", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { text: "<p>Output AI</p>" },
      error: null,
    });

    await generateSummaryFromPDF(mockPrompt, mockFeatureId, mockUploadId);

    expect(storedAiResponseService.createOrUpdateResponseInDatabase).toHaveBeenCalledWith(
      "<p>Output AI</p>",
      mockFeatureId,
      mockUploadId
    );
  });
});
