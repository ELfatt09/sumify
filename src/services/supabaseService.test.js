import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllUploads, uploadPDFToSupabase } from "./supabaseService";

// 🧠 Mock supabase client
vi.mock("../lib/supabase", () => {
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const uploadMock = vi.fn();
  const getPublicUrlMock = vi.fn();

  const fromMock = vi.fn((tableName) => {
    if (tableName === "uploads") {
      return {
        select: selectMock,
        insert: insertMock,
      };
    }
    return {};
  });

  const storageFromMock = vi.fn(() => ({
    upload: uploadMock,
    getPublicUrl: getPublicUrlMock,
  }));

  return {
    supabase: {
      from: fromMock,
      storage: {
        from: storageFromMock,
      },
    },
  };
});


import { supabase } from "../lib/supabase";

describe("getAllUploads", () => {
  it("should return data when query succeeds", async () => {
    const mockData = [{ id: 1, file_name: "test.pdf" }];

    // Directly reference selectMock through supabase.from("uploads").select
    supabase.from("uploads").select.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await getAllUploads();
    expect(result).toEqual(mockData);
  });

  it("should throw error when query fails", async () => {
    const mockError = new Error("Database error");

    supabase.from("uploads").select.mockResolvedValue({
      data: null,
      error: mockError,
    });

    await expect(getAllUploads()).rejects.toThrow("Database error");
  });
});

