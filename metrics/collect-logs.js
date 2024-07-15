import fs from "node:fs";
import path from "node:path";

const logDir = "/var/log/academy";
const mosquittoLog = "/var/log/mosquitto/mosquitto.log";
const lastLogFile = path.join(logDir, "lastLog");

const getLogEntries = () => {
  let lastLog = undefined;
  try {
    lastLog = fs.readFileSync(lastLogFile, "utf8").trim();
  } catch {
    // No lastLog file
  }

  try {
    return fs
      .readFileSync(mosquittoLog, "utf8")
      .trim()
      .split("\n")
      .map((s) => [s.slice(0, 19), s.slice(21)])
      .filter((s) => lastLog === undefined || s[0].localeCompare(lastLog) > 0);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const collectMetrics = () => {
  const nowString = new Date().toISOString().slice(0, 19).replace(/:/g, "");
  const metricsLogFile = path.join(logDir, `mqtt-${nowString}.log`);

  const logEntries = getLogEntries();

  fs.writeFileSync(
    lastLogFile,
    logEntries[logEntries.length - 1]?.[0] ?? nowString,
    "utf-8",
  );

  const metrics = [];
  for (const [timestamp, message] of logEntries) {
    if (message.includes("CONNACK")) {
      metrics.push(`${timestamp},mqtt,connect`);
    }
    if (message.includes("Received PUBLISH")) {
      metrics.push(`${timestamp},mqtt,publish`);
    }
  }
  if (metrics.length > 0)
    fs.writeFileSync(metricsLogFile, metrics.join("\n") + "\n", "utf-8");
};

setInterval(collectMetrics, 5 * 1000);
