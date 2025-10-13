import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUp, signIn, signOut, GoogleSignIn } from "./supabaseAuthService";

vi.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            signInWithOAuth: vi.fn(),
        },
    },
}));

import { supabase } from "../lib/supabase";

describe("supabaseAuthService Sign Up test", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("signUp should call supabase.auth.signUp", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        await supabase.auth.signUp.mockResolvedValue({ error: null });

        await signUp(email, password);

        expect(supabase.auth.signUp).toHaveBeenCalledWith({ email, password });
    });

    it("signUp should return null when supabase.auth.signUp succeeds", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        await supabase.auth.signUp.mockResolvedValue({ error: null });
        const error = await signUp(email, password);
        expect(error).toBe(null);
    });


        it("signUp should return error when supabase.auth.signUp fails", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        const errorMessage = "Sign-up failed";

        await supabase.auth.signUp.mockResolvedValue({ error: errorMessage });

        const error = await signUp(email, password);

        expect(error).toBe(errorMessage);
    });

});

describe("supabaseAuthService Sign In test", () => { 
     beforeEach(() => {
        vi.resetAllMocks();
    });
    it("signIn should call supabase.auth.signInWithPassword", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        await supabase.auth.signInWithPassword.mockResolvedValue({ error: null });

        await signIn(email, password);

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
    });

        it("signIn should return error when supabase.auth.signInWithPassword fails", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        const errorMessage = "Sign-in failed";

        await supabase.auth.signInWithPassword.mockResolvedValue({ error: errorMessage });

        const error = await signIn(email, password);

        expect(error).toBe(errorMessage);
    });
});
describe("supabaseAuthService Sign In With Google test", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })
    it("GoogleSignIn should call supabase.auth.signInWithOAuth", async () => {
        await supabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
        await GoogleSignIn();

        expect(supabase.auth.signInWithOAuth).toHaveBeenCalled();
    });

    it("GoogleSignIn should return null when supabase.auth.signInWithOAuth succeeds", async () => {
        await supabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
        const error = await GoogleSignIn();
        expect(error).toBe(null);
    });

    it("GoogleSignIn should return error when supabase.auth.signInWithOAuth fails", async () => {
        const errorMessage = "Sign-in with Google failed";

        await supabase.auth.signInWithOAuth.mockResolvedValue({ error: errorMessage });

        const error = await GoogleSignIn();

        expect(error).toBe(errorMessage);
    });

 });
describe("supabaseAuthService Sign Out test", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })
    it("signInOut should call supabase.auth.signOut", async () => {
        await supabase.auth.signOut.mockResolvedValue({ error: null });
        await signOut();

        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("signInOut should return error when supabase.auth.signOut fails", async () => {
        const errorMessage = "Sign-out failed";

        await supabase.auth.signOut.mockResolvedValue({ error: errorMessage });

        const error = await signOut();

        expect(error).toBe(errorMessage);
    });

    it("signInOut should return null when supabase.auth.signOut succeeds", async () => {
        await supabase.auth.signOut.mockResolvedValue({ error: null });
        const error = await signOut();
        expect(error).toBe(null);
    });

 });