export const supabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue({ data: [{ id: 1, file_name: "mock.pdf", file_url: "https://test.pdf" }] }),
  insert: jest.fn().mockResolvedValue({}),
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn().mockResolvedValue({}),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://test.pdf" } }),
  },
};
