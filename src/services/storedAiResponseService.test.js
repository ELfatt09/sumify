import { createOrUpdateResponseInDatabase } from "./storedAiResponseService";

const mocks = {
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  updateEq: vi.fn(),
};

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mocks.select.mockReturnValue({ eq: mocks.eq.mockReturnValue({ single: mocks.single }) }),
      insert: mocks.insert,
      update: mocks.update.mockReturnValue({ eq: mocks.updateEq }),
    })),
  },
}));

describe("createOrUpdateResponseInDatabase()", () => {
    it("queries Supabase correctly", async () => {
      mocks.single.mockResolvedValue({ data: null });
      await createOrUpdateResponseInDatabase("summary", 1);

      expect(mocks.select).toHaveBeenCalled();
      expect(mocks.eq).toHaveBeenCalledWith("feature_id", 1);
      expect(mocks.single).toHaveBeenCalled();
    });

    it("inserts new data when none exists", async () => {
      mocks.single.mockResolvedValue({ data: null });
      await createOrUpdateResponseInDatabase("summary", 1);

      expect(mocks.insert).toHaveBeenCalledWith({ feature_id: 1, response: "summary" });
    });

    it("updates existing data when found", async () => {
      mocks.single.mockResolvedValue({ data: { id: 1 } });
      await createOrUpdateResponseInDatabase("summary", 1);

      expect(mocks.update).toHaveBeenCalledWith({ response: "summary" });
      expect(mocks.updateEq).toHaveBeenCalledWith("id", 1);
    });
  });
