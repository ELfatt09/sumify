import "@testing-library/jest-dom";

vi.mock("pdfjs-dist", () => ({
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: async () => ({
        getTextContent: async () => ({
          items: [{ str: "Mocked PDF content" }],
        }),
      }),
    }),
  }),
  GlobalWorkerOptions: { workerSrc: "" },
}));
