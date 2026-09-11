import { describe, it, expect } from "vitest";
import { makeQrUrl, makeDeepLink, UPI_ID, UPI_NAME } from "./powerloop";

describe("Payment Link Generation", () => {
  describe("makeDeepLink", () => {
    it("should generate a correctly formatted UPI deep link", () => {
      const amount = "100.50";
      const stName = "Test Station";
      const deepLink = makeDeepLink(amount, stName);

      expect(deepLink).toBe(
        `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('EV Charging – ' + stName)}`
      );

      expect(deepLink.startsWith("upi://pay?")).toBe(true);
      expect(deepLink).toContain(`pa=${UPI_ID}`);
      expect(deepLink).toContain(`am=${amount}`);
      expect(deepLink).toContain("cu=INR");
    });

    it("should properly URL encode special characters in the station name", () => {
      const deepLink = makeDeepLink("50", "Station & Co.");
      expect(deepLink).toContain(`tn=${encodeURIComponent('EV Charging – Station & Co.')}`);
    });
  });

  describe("makeQrUrl", () => {
    it("should generate a valid QR code API URL containing the UPI deep link", () => {
      const amount = "500";
      const stName = "Koramangala Station";
      const qrUrl = makeQrUrl(amount, stName);

      const expectedUpi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('EV Charging – ' + stName)}`;
      const expectedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(expectedUpi)}&bgcolor=ffffff&color=000000&margin=14&format=png`;

      expect(qrUrl).toBe(expectedUrl);
      expect(qrUrl.startsWith("https://api.qrserver.com/v1/create-qr-code/")).toBe(true);
      expect(qrUrl).toContain(`data=${encodeURIComponent(expectedUpi)}`);
    });
  });
});
