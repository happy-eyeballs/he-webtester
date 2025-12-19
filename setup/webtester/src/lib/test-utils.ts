const generateRandomId = (): number => {
  const max = 100000;
  const min = 0;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
