import { ipv4, ipv6 } from "./ip.ts";
import { it, describe } from "node:test";
import assert from "node:assert/strict";

void describe("ip()", async (t) => {
  void it(`should resolve an IPv4 address`, async () =>
    assert.deepEqual(await ipv4("localhost"), ["127.0.0.1"]));
  void it(`should resolve an IPv6 address`, async () =>
    assert.deepEqual(await ipv6("localhost"), ["::1"]));
});
