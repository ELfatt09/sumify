import { describe, it, expect, vi } from "vitest";



// __mocks__/supabase.js


vi.mock("../lib/supabase", () => {
  const singleMock = vi.fn();
  const eqMock = vi.fn(() => ({ single: singleMock, eq: eqMock}));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const insertMock = vi.fn();
  const updateEqMock = vi.fn();
  const updateMock = vi.fn(() => ({ eq: updateEqMock }));
  return {
    supabase: {
      from: vi.fn(() => ({
        select: selectMock,
        insert: insertMock,
        update: updateMock,
      })),
    },
    __mocks: { selectMock, eqMock, singleMock, insertMock, updateMock, updateEqMock },
  }
});
import { supabase, __mocks } from "../lib/supabase";
import { createOrUpdateResponseInDatabase, getResponseFromDatabase } from "./storedAiResponseService";



describe("createOrUpdateResponseInDatabase()", () => {
    beforeEach(() => vi.clearAllMocks());

  it("queries Supabase correctly", async () => {
    __mocks.singleMock.mockResolvedValue({ data: null });

    await createOrUpdateResponseInDatabase("summary", 1);

    // ✅ Verifikasi chain dipanggil dengan benar
    expect(__mocks.selectMock).toHaveBeenCalled();
    expect(__mocks.eqMock).toHaveBeenCalledWith("feature_id", 1);
    expect(__mocks.singleMock).toHaveBeenCalled();
  });

    it("inserts new data when none exists", async () => {
      __mocks.singleMock.mockResolvedValue({ data: null });
      await createOrUpdateResponseInDatabase("summary", 1);

      expect(__mocks.insertMock).toHaveBeenCalledWith({ feature_id: 1, response: "summary" });
    });

    it("updates existing data when found", async () => {
      __mocks.singleMock.mockResolvedValue({ data: { id: 1 } });
      await createOrUpdateResponseInDatabase("summary", 1);

      expect(__mocks.updateMock).toHaveBeenCalledWith({ response: "summary" });
      expect(__mocks.updateEqMock).toHaveBeenCalledWith("id", 1);
    });
});
  
describe("getResponseFromDatabase()", () => {
  it("queries Supabase correctly", async () => {
      const responseMock = { response: "summary" };
      __mocks.singleMock.mockResolvedValue({ data: responseMock  });
      const response = await getResponseFromDatabase(1, 1);
  
      expect(__mocks.selectMock).toHaveBeenCalled();

      expect(__mocks.singleMock).toHaveBeenCalled();
      expect(response).toBe(responseMock.response);
    });
});

