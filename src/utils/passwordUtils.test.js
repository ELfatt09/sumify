import { describe, it, expect } from "vitest";

import { isPasswordValid } from "./passwordUtils";

describe("passwordUtils", () => {
    it("should validate password format", () => {
        expect(isPasswordValid("password123")).toBe(true);
        expect(isPasswordValid("password")).toBe(false);
        expect(isPasswordValid("pass")).toBe(false);
    });
});