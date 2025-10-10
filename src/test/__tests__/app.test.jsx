import { render, screen } from "@testing-library/react";
import App from "../../App";

test("renders App without blank page", () => {
    const { container } = render(<App />);
    expect(container).not.toBeEmptyDOMElement();
});
