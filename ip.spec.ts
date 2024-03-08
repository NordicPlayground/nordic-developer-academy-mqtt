import { ipv4, ipv6 } from "./ip.ts";
import { it, describe } from "node:test";
import assert from "node:assert/strict";

void describe("ip()", async (t) => {
  void it(`should resolve an IPv4 address`, async () => {
    const ips = await ipv4("one.one.one.one");
    assert.equal(ips.includes("1.1.1.1"), true);
  });
  void it(`should resolve an IPv6 address`, async () => {
    const ips = await ipv6("one.one.one.one");
    assert.equal(ips.includes("2606:4700:4700::1111"), true);
  });
});
