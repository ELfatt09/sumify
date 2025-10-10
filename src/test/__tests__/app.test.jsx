import { render, screen } from "@testing-library/react";
import App from "../../App";

test("renders upload PDF heading", () => {
    render(<App />);
    const headingElement = screen.getByText(/Upload your PDF/i);
    expect(headingElement).toBeInTheDocument();
});