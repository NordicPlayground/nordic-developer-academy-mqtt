import mqtt from "mqtt";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { randomWords } from "@nordicsemiconductor/random-words";

describe("MQTT server", async () => {
  await Promise.all(
    ["mqtt://localhost:1883", "mqtts://localhost:8883"].map((endpoint) =>
      describe(endpoint, async () => {
        test("the MQTT server should allow to publish and subscribe", async () => {
          const msg = `Hello World (${Date.now()})!`;
          const topic = randomWords().join("-");

          const client = mqtt.connect(endpoint, {
            rejectUnauthorized: false,
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
      }),
    ),
  );
});
