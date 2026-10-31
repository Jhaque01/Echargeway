import { describe, it, expect, beforeEach } from "vitest";
import { store } from "./powerloop";

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("get", () => {
    it("should return parsed JSON when valid JSON is in localStorage", () => {
      localStorage.setItem("valid_key", JSON.stringify({ a: 1 }));
      expect(store.get("valid_key")).toEqual({ a: 1 });
    });

    it("should return null when key is not in localStorage", () => {
      expect(store.get("missing_key")).toBeNull();
    });

    it("should return null and handle JSON parse error when malformed JSON is in localStorage", () => {
      localStorage.setItem("malformed_key", "{ malformed json");
      expect(store.get("malformed_key")).toBeNull();
    });
  });
});
