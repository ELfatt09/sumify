import { describe, it, expect } from "vitest";
import { isEmailValid } from "./emailUtils";

describe("emailUtils", () => {
    it("should validate email format", () => {
        expect(isEmailValid("a4bYh@example.com")).toBe(true);
        expect(isEmailValid("invalid-email")).toBe(false);
    });
});