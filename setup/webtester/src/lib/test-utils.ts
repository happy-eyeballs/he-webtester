import { HTTPSRecord } from "@/lib/test-run.ts";
import { getHappyEyeballsTestDomain } from "@/lib/he-configuration.ts";

export const generateRandomId = (): number => {
  const max = 100000;
  const min = 0;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateHEv3TestUrl = async (
  randomizeDomain: boolean,
  ipv4Delay: number,
  ipv6Delay: number,
  quicDelay: number,
  tlsDelay: number,
  httpsRecord: HTTPSRecord,
): Promise<string> => {
  const happyEyeballsTestDomain = await getHappyEyeballsTestDomain();

  const id = randomizeDomain ? generateRandomId() : 0;

  const httpsRR: string = {
    [HTTPSRecord.H3H2]: "h3h2",
    [HTTPSRecord.H2H3]: "h2h3",
    [HTTPSRecord.H3]: "h3",
    [HTTPSRecord.H2]: "h2",
    [HTTPSRecord.None]: "none",
  }[httpsRecord];

  return `https://https-${httpsRR}_ipv4-${ipv4Delay}_ipv6-${ipv6Delay}_quic-${quicDelay}_tls-${tlsDelay}_id-${id}.v3-quic.${happyEyeballsTestDomain}/ping`;
};
