import { describe, it, expect } from "vitest";
import { chkToken } from "./powerloop";

describe("chkToken", () => {
  it("should return the parsed payload for a valid token", () => {
    const futureExp = Date.now() + 10000;
    const payload = { uid: "test-user", exp: futureExp };
    const validToken = btoa(JSON.stringify(payload));

    const result = chkToken(validToken);
    expect(result).toEqual(payload);
  });

  it("should throw an error for an expired token", () => {
    const pastExp = Date.now() - 10000;
    const payload = { uid: "test-user", exp: pastExp };
    const expiredToken = btoa(JSON.stringify(payload));

    expect(() => chkToken(expiredToken)).toThrow('Session expired — please log in again');
  });

  it("should throw an error for a malformed base64 string", () => {
    const malformedToken = "invalid-base64-string-%$#@";
    expect(() => chkToken(malformedToken)).toThrow('Session expired — please log in again');
  });

  it("should throw an error for invalid JSON payload", () => {
    const invalidJsonToken = btoa("not-a-json-string");
    expect(() => chkToken(invalidJsonToken)).toThrow('Session expired — please log in again');
  });
});
