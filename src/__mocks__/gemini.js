export const gemini = {
  models: {
    generateContent: jest.fn().mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [{ text: "<p>Mock summary</p>" }],
          },
        },
      ],
    }),
  },
};
