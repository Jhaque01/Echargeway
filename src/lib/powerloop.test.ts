import { describe, it, expect } from "vitest";
import { makeQrUrl, makeDeepLink } from "./powerloop";

describe("UPI URL generation", () => {
  it("makeDeepLink should format correctly", () => {
    const amount = "150.50";
    const stName = "Central Station";
    const expected = "upi://pay?pa=9832667682@upi&pn=eChargeWay&am=150.50&cu=INR&tn=EV%20Charging%20%E2%80%93%20Central%20Station";

    const result = makeDeepLink(amount, stName);
    expect(result).toBe(expected);
  });

  it("makeQrUrl should format correctly", () => {
    const amount = "200";
    const stName = "North Hub";
    const expected = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi%3A%2F%2Fpay%3Fpa%3D9832667682%40upi%26pn%3DeChargeWay%26am%3D200%26cu%3DINR%26tn%3DEV%2520Charging%2520%25E2%2580%2593%2520North%2520Hub&bgcolor=ffffff&color=000000&margin=14&format=png";

    const result = makeQrUrl(amount, stName);
    expect(result).toBe(expected);
  });
});
