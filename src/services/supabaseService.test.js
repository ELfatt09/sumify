import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAllUploads, uploadPDFToSupabase, deletePDFFromSupabase } from "./supabaseService";

// 🧠 Mock supabase client dengan semua fungsi dideklarasikan di dalam factory agar tidak hoisting error
vi.mock("../lib/supabase", () => {
  const uploadMock = vi.fn();
  const getPublicUrlMock = vi.fn();
  const insertMock = vi.fn();
  const orderMock = vi.fn();
  const selectMock = vi.fn(() => ({ order: orderMock }));
  const removeMock = vi.fn();
  const invokeMock = vi.fn();

  const fromMock = vi.fn((tableName) => {
    if (tableName === "uploads") {
      return { select: selectMock, insert: insertMock };
    }
    return {};
  });

  const storageFromMock = vi.fn(() => ({
    upload: uploadMock,
    remove: removeMock,
    getPublicUrl: getPublicUrlMock,
  }));

  return {
    supabase: {
      from: fromMock,
      storage: { from: storageFromMock },
      functions: { invoke: invokeMock },
    },
  };
});

import { supabase } from "../lib/supabase";

describe("uploadPDFToSupabase", () => {
  let file, uploadMock, getPublicUrlMock, insertMock;

  beforeEach(() => {
    file = new File(["dummy content"], "testfile.pdf", {
      type: "application/pdf",
    });

    // Ambil reference dari mock yang sudah didefinisikan di atas
    uploadMock = supabase.storage.from().upload;
    getPublicUrlMock = supabase.storage.from().getPublicUrl;
    insertMock = supabase.from("uploads").insert;

    vi.clearAllMocks();
  });

  it("uploads a file, stores metadata, and returns public URL", async () => {
    uploadMock.mockResolvedValue({ data: {}, error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: "https://fake-url/testfile.pdf" },
    });
    insertMock.mockResolvedValue({ data: {}, error: null });

    const result = await uploadPDFToSupabase(file);

    expect(uploadMock).toHaveBeenCalledWith(expect.stringMatching(/testfile\.pdf/), file);
    expect(getPublicUrlMock).toHaveBeenCalledWith(expect.stringMatching(/testfile\.pdf/));
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        file_name: expect.stringMatching(/testfile\.pdf/),
        file_url: "https://fake-url/testfile.pdf",
        title: "testfile",
      })
    );
    expect(result).toBe("https://fake-url/testfile.pdf");
  });

  it("throws an error if upload fails", async () => {
    uploadMock.mockResolvedValue({ data: null, error: new Error("Upload failed") });
    await expect(uploadPDFToSupabase(file)).rejects.toThrow("Upload failed");
  });
});

describe("getAllUploads", () => {
  let selectMock, orderMock;

  beforeEach(() => {
    selectMock = supabase.from("uploads").select;
    orderMock = selectMock().order;
    vi.clearAllMocks();
  });

  it("should return data when query succeeds", async () => {
    const mockData = [{ id: 1, file_name: "test.pdf" }];
    orderMock.mockResolvedValue({ data: mockData, error: null });
    selectMock.mockReturnValue({ order: orderMock });

    const result = await getAllUploads();
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual(mockData);
  });

  it("should throw error when query fails", async () => {
    const mockError = new Error("Database error");
    orderMock.mockResolvedValue({ data: null, error: mockError });
    selectMock.mockReturnValue({ order: orderMock });

    await expect(getAllUploads()).rejects.toThrow("Database error");
  });
});

describe("deletePDFFromSupabase", () => {
  let invokeMock;

  beforeEach(() => {
    invokeMock = supabase.functions.invoke;
    vi.clearAllMocks();
  });

  it("should call supabase.functions.invoke with correct params", async () => {
    const uploadIdMock = 1;
    invokeMock.mockResolvedValue({ data: null, error: null });

    await deletePDFFromSupabase(uploadIdMock);

    expect(invokeMock).toHaveBeenCalledWith("delete-upload", {
      body: { uploadId: uploadIdMock },
    });
  });

  it("should throw error if supabase.functions.invoke fails", async () => {
    const uploadIdMock = 1;
    invokeMock.mockResolvedValue({
      data: null,
      error: { message: "Error deleting PDF" }, // gunakan field message
    });

    await expect(deletePDFFromSupabase(uploadIdMock)).rejects.toThrow(
      "Error deleting PDF"
    );
  });

  it("should return null if supabase.functions.invoke succeeds", async () => {
    const uploadIdMock = 1;
    invokeMock.mockResolvedValue({ data: null, error: null });

    const result = await deletePDFFromSupabase(uploadIdMock);
    expect(result).toBeNull();
  });
});

