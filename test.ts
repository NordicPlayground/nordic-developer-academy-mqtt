import mqtt from "mqtt";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { randomWords } from "@nordicsemiconductor/random-words";
import { ipv4, ipv6 } from "./ip.ts";
import fs from "node:fs/promises";

const hostname = process.env.HOSTNAME ?? "localhost";
const ipv = process.env.IPV ?? "ipv4";
const rejectUnauthorized = process.env.VALIDATE_TLS_CERT !== "0";
const mqttPort = process.env.MQTT_PORT ?? "1883";
const mqttsPort = process.env.MQTTS_PORT ?? "8883";
const certPath = process.env.CERT_PATH;

console.log(`hostname:`, JSON.stringify(hostname));
console.log(`ipv:`, JSON.stringify(ipv));
console.log(`rejectUnauthorized:`, JSON.stringify(rejectUnauthorized));

const addr =
  ipv === "ipv6" ? `[${await ipv6(hostname)}]` : await ipv4(hostname);

describe("MQTT server", async () => {
  await Promise.all(
    [`mqtt://${addr}:${mqttPort}`, `mqtts://${addr}:${mqttsPort}`].map(
      (endpoint) =>
        describe(endpoint, async () => {
          test("the MQTT server should allow to publish and subscribe", async () => {
            const msg = `Hello World (${Date.now()})!`;
            const topic = randomWords().join("-");

            const client = mqtt.connect(endpoint, {
              rejectUnauthorized,
              servername: hostname,
              // Use the server certificate as the CA so the client can validate the server
              ca:
                certPath === undefined
                  ? undefined
                  : await fs.readFile(certPath, "utf-8"),
            });

            const received = await new Promise<string>((resolve, reject) => {
              const t = setTimeout(() => {
                reject(new Error(`Timeout!`));
                client.end();
              }, 5000);
              client.on("message", (topic, message) => {
                clearTimeout(t);
                console.log(`<`, topic);
                console.log(`<`, message.toString());
                resolve(message.toString());
                client.end();
              });

              console.log(`>`, topic);
              console.log(`>`, msg);
              client.on("connect", () => {
                client.subscribe(topic, (err) => {
                  if (!err) {
                    client.publish(topic, msg);
                  }
                });
              });

              client.on("error", (err) => {
                clearTimeout(t);
                console.error(err);
                reject(err);
              });
            });

            assert.equal(received, msg);
          });
        })
    )
  );
});
