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
