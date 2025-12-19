let happyEyeballsTestsDomain: string | null = null;

export const getHappyEyeballsTestDomain = async (): Promise<string> => {
  if (happyEyeballsTestsDomain) {
    return happyEyeballsTestsDomain;
  }

  const response = await fetch("/he-test-domain", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch the Happy Eyeballs test domain");
  }

  const domain = (await response.text()).trim();
  happyEyeballsTestsDomain = domain;
  return domain;
};

export const fetchAvailableDelays = async (): Promise<number[]> => {
  const response = await fetch("/delays.csv", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch the available delays");
  }

  const responseBody = await response.text();

  return responseBody
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => Number(line.trim()));

  // TODO: pop last two delays in if not v2 test
};
