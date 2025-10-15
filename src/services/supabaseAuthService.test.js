import { describe, it, expect, vi, beforeEach } from "vitest";
import { signUp, signIn, signOut, GoogleSignIn, getSessionData, getUserData } from "./supabaseAuthService";

vi.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            signInWithOAuth: vi.fn(),
            getSession: vi.fn(),
            getUser: vi.fn(),
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
        expect(error).toStrictEqual(null);
    });


        it("signUp should return error when supabase.auth.signUp fails", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        const errorMock = new Error( "Sign-up failed");

        await supabase.auth.signUp.mockResolvedValue({ error: errorMock });

        const error = await signUp(email, password);

        expect(error).toStrictEqual(errorMock);
        });
    it("signUp should return error when email format is not right", async () => {
        const email = "invalid-email";
        const password = "password123";

        const errorMock = new Error("Invalid email format");

        await supabase.auth.signUp.mockResolvedValue({ error: null });
        const error = await signUp(email, password);
        expect(error).toStrictEqual(errorMock);
    })

    it("signUp should return error when password is less than 6 characters, and contain at least one number", async () => {
        const email = "a4bYh@example.com";
        const password = "pass";

        const errorMock = new Error("Password must be at least 6 characters, and contain at least one number");

        await supabase.auth.signUp.mockResolvedValue({ error: null });
        const error = await signUp(email, password);
        expect(error).toStrictEqual(errorMock);
    })

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

    it("signIn should return error when email format is not right", async () => {
        const email = "invalid-email";
        const password = "password123";

        const errorMock = new Error("Invalid email format");

        console.log(errorMock);

        await supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
        const error = await signIn(email, password);
        expect(error).toStrictEqual(errorMock);
    })

    

        it("signIn should return error when supabase.auth.signInWithPassword fails", async () => {
        const email = "a4bYh@example.com";
        const password = "password123";

        const errorMock = new Error("Sign-in failed");

        await supabase.auth.signInWithPassword.mockResolvedValue({ error: errorMock });

        const error = await signIn(email, password);

        expect(error).toBe(errorMock);
        });
    
    it("signIn should return error when password is less than 6 characters or there is no number", async () => {
        const email = "a4bYh@example.com";
        const password = "pass";

        const errorMock = new Error("Password must be at least 6 characters, and contain at least one number");

        await supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
        const error = await signIn(email, password);
        expect(error).toStrictEqual(errorMock);
    })
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
        const errorMock = new Error("Sign-in with Google failed");

        await supabase.auth.signInWithOAuth.mockResolvedValue({ error: errorMock });

        const error = await GoogleSignIn();

        expect(error).toStrictEqual(errorMock);
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
        const errorMock = new Error("Sign-out failed");

        await supabase.auth.signOut.mockResolvedValue({ error: errorMock });

        const error = await signOut();

        expect(error).toBe(errorMock);
    });

    it("signInOut should return null when supabase.auth.signOut succeeds", async () => {
        await supabase.auth.signOut.mockResolvedValue({ error: null });
        const error = await signOut();
        expect(error).toBe(null);
    });

});
 
describe("supabaseAuthService get session test", async () => {
    it("getSessionData should call supabase.auth.getSession", async () => {
        await supabase.auth.getSession.mockResolvedValue({ data: null });

        await getSessionData();

        expect(supabase.auth.getSession).toHaveBeenCalled();
    })
    it("getSessionData should return session data when supabase.auth.getSession return data", async () => {
        const sessionMock = { session: { token: "abcdefghijk", expires_in: "3600", provider: "ABC" } }

        await supabase.auth.getSession.mockResolvedValue({ data: sessionMock })

        const sessionData = await getSessionData();

        expect(sessionData).toStrictEqual(sessionMock.session)
    })
        it("getSessionData should return null when supabase.auth.getSession return null", async () => {
        const sessionMock = { session: null }

        await supabase.auth.getSession.mockResolvedValue({ data: sessionMock })

        const sessionData = await getSessionData();

        expect(sessionData).toStrictEqual(sessionMock.session)
    })
})
 
describe("supabaseAuthService get user test", async () => {
    it("getUsernData should call supabase.auth.getSession", async () => {
        await supabase.auth.getUser.mockResolvedValue({ data: null });

        await getUserData();

        expect(supabase.auth.getUser).toHaveBeenCalled();
    })
    it("getSessionData should return session data when supabase.auth.getSession return data", async () => {
        const userMock = { user:{ id: "abcdefghijk-lmnopqrstu-vwxyz", email: "test@test.test", name: "John Doe"} }

        await supabase.auth.getUser.mockResolvedValue({ data: userMock })

        const userData = await getUserData();

        expect(userData).toStrictEqual(userMock.user)
    })
        it("getSessionData should return null when supabase.auth.getSession return null", async () => {
        const userMock = { user: null }

        await supabase.auth.getUser.mockResolvedValue({ data: userMock })

        const userData = await getSessionData();

        expect(userData).toStrictEqual(userMock.user)
    })
 })