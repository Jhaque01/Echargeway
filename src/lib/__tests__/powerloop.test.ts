import { describe, it, expect, beforeEach } from "vitest";
import { callApi, DB } from "../powerloop";

describe("callApi", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("/auth/send-otp", () => {
    it("generates and returns an OTP and saves it to DB", async () => {
      const phone = "1234567890";
      const response = await callApi("/auth/send-otp", "POST", { phone });

      expect(response).toHaveProperty("dev_otp");
      expect(response).toHaveProperty("message", "OTP sent");

      const otps = DB.otps.get();
      expect(otps[phone]).toBeDefined();
      expect(otps[phone].otp).toBe(response.dev_otp);
    }, 20000);
  });

  describe("/auth/verify-otp", () => {
    it("returns NEW_USER status for a new phone number with valid OTP", async () => {
      const phone = "1234567890";
      const sendRes = await callApi("/auth/send-otp", "POST", { phone });

      const verifyRes = await callApi("/auth/verify-otp", "POST", { phone, otp: sendRes.dev_otp });
      expect(verifyRes.status).toBe("NEW_USER");
      expect(verifyRes).toHaveProperty("verify_token");

      // OTP should be deleted after use
      const otps = DB.otps.get();
      expect(otps[phone]).toBeUndefined();
    }, 20000);

    it("returns LOGIN status for an existing user with valid OTP", async () => {
      const phone = "1234567890";

      // Setup existing user
      const users = DB.users.get();
      users.push({ id: "u123", phone, name: "Test User" });
      DB.users.save(users);

      const sendRes = await callApi("/auth/send-otp", "POST", { phone });

      const verifyRes = await callApi("/auth/verify-otp", "POST", { phone, otp: sendRes.dev_otp });
      expect(verifyRes.status).toBe("LOGIN");
      expect(verifyRes).toHaveProperty("token");
      expect(verifyRes.user.phone).toBe(phone);
    }, 20000);

    it("throws error for invalid OTP", async () => {
      const phone = "1234567890";
      await callApi("/auth/send-otp", "POST", { phone });

      await expect(callApi("/auth/verify-otp", "POST", { phone, otp: "000000" })).rejects.toThrow("Invalid OTP — please try again");
    }, 20000);

    it("throws error for expired OTP", async () => {
      const phone = "1234567890";
      await callApi("/auth/send-otp", "POST", { phone });

      // Artificially expire the OTP
      const otps = DB.otps.get();
      otps[phone].exp = Date.now() - 1000;
      DB.otps.save(otps);

      await expect(callApi("/auth/verify-otp", "POST", { phone, otp: otps[phone].otp })).rejects.toThrow("OTP expired — request a new one");

      // Ensure expired OTP is cleaned up
      expect(DB.otps.get()[phone]).toBeUndefined();
    }, 20000);
  });

  describe("/auth/register", () => {
    it("registers a new user given a valid verify_token", async () => {
      const phone = "1234567890";
      const sendRes = await callApi("/auth/send-otp", "POST", { phone });
      const verifyRes = await callApi("/auth/verify-otp", "POST", { phone, otp: sendRes.dev_otp });

      const regRes = await callApi("/auth/register", "POST", {
        verify_token: verifyRes.verify_token,
        name: "New User",
        email: "new@example.com"
      }, 20000);

      expect(regRes).toHaveProperty("token");
      expect(regRes.user.name).toBe("New User");
      expect(regRes.user.phone).toBe(phone);

      const users = DB.users.get();
      expect(users.length).toBe(1);
      expect(users[0].id).toBe(regRes.user.id);
    }, 20000);

    it("throws error for invalid token", async () => {
      await expect(callApi("/auth/register", "POST", { verify_token: "invalid" })).rejects.toThrow("Invalid token");
    }, 20000);

    it("throws error for expired token", async () => {
       const vt = btoa(JSON.stringify({ phone: "1234567890", exp: Date.now() - 1000 }));
       await expect(callApi("/auth/register", "POST", { verify_token: vt })).rejects.toThrow("Session expired");
    }, 20000);
  });

  describe("/auth/google", () => {
    it("throws offline mode error", async () => {
      await expect(callApi("/auth/google")).rejects.toThrow("Google Sign-In is not available in offline mode — please use Mobile OTP.");
    }, 20000);
  });

  describe("/profile", () => {
    it("GET /profile returns the user profile", async () => {
      // Register a user
      const phone = "1234567890";
      const sendRes = await callApi("/auth/send-otp", "POST", { phone });
      const verifyRes = await callApi("/auth/verify-otp", "POST", { phone, otp: sendRes.dev_otp });
      const regRes = await callApi("/auth/register", "POST", { verify_token: verifyRes.verify_token, name: "User" });

      const profile = await callApi("/profile", "GET", null, regRes.token);
      expect(profile.id).toBe(regRes.user.id);
    }, 20000);

    it("PUT /profile updates the user profile", async () => {
      const phone = "1234567890";
      const sendRes = await callApi("/auth/send-otp", "POST", { phone });
      const verifyRes = await callApi("/auth/verify-otp", "POST", { phone, otp: sendRes.dev_otp });
      const regRes = await callApi("/auth/register", "POST", { verify_token: verifyRes.verify_token, name: "User" });

      const updatedProfile = await callApi("/profile", "PUT", { name: "Updated Name" }, regRes.token);
      expect(updatedProfile.name).toBe("Updated Name");

      const users = DB.users.get();
      expect(users[0].name).toBe("Updated Name");
    }, 20000);

    it("throws error if user not found", async () => {
      // create a token for a non-existent user
      const token = btoa(JSON.stringify({ uid: "nonexistent", exp: Date.now() + 100000 }));
      await expect(callApi("/profile", "GET", null, token)).rejects.toThrow("User not found");
      await expect(callApi("/profile", "PUT", { name: "test" }, token)).rejects.toThrow("User not found");
    }, 20000);
  });

  describe("/history", () => {
    it("GET /history returns the user history", async () => {
      const token = btoa(JSON.stringify({ uid: "user1", exp: Date.now() + 100000 }));
      const history = await callApi("/history", "GET", null, token);
      expect(history).toEqual([]);
    }, 20000);

    it("POST /history adds an entry and respects 50 item limit", async () => {
      const token = btoa(JSON.stringify({ uid: "user1", exp: Date.now() + 100000 }));

      const entry = await callApi("/history", "POST", { amount: 100 }, token);
      expect(entry).toHaveProperty("id");
      expect(entry.amount).toBe(100);
      expect(entry.status).toBe("paid");

      const history = await callApi("/history", "GET", null, token);
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(entry.id);

      // Add 50 more items
      for (let i = 0; i < 50; i++) {
        await callApi("/history", "POST", { amount: i }, token);
      }

      const limitedHistory = await callApi("/history", "GET", null, token);
      expect(limitedHistory.length).toBe(50);
      expect(limitedHistory[0].amount).toBe(49); // the last added item
    }, 20000);
  });

  describe("unknown endpoints", () => {
    it("throws Unknown endpoint error", async () => {
      await expect(callApi("/unknown")).rejects.toThrow("Unknown endpoint: /unknown");
    }, 20000);
  });
});
