import https from "https";
import tls from "tls";

const getCertificateExpiryDate = (hostname: string) =>
  new Promise<Date>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout.`)), 10 * 1000);
    const req = https.request({
      hostname,
      port: 443,
      method: "GET",
      agent: new https.Agent({
        // bypass actual verification but capture the certificate
        checkServerIdentity: () => undefined,
      }),
    });

    req.on("socket", (socket: tls.TLSSocket) => {
      socket.on("secureConnect", () => {
        const cert = socket.getPeerCertificate();
        clearTimeout(t);
        resolve(new Date(cert.valid_to));
      });
    });

    req.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });

    req.end();
  });

const hostname = "mqtt.nordicsemi.academy";
const expiryDate = await getCertificateExpiryDate(hostname);

const expiryInDays = (expiryDate.getTime() - Date.now()) / 1000 / 60 / 60 / 24;

if (expiryInDays < 1)
  throw new Error(
    `The certificate for ${hostname} expires in less than 24 hours!`,
  );

console.log(
  `The certificate for ${hostname} expires in ${Math.floor(expiryInDays)} days.`,
);
