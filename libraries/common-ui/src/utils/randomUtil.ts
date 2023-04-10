import { clamp } from "./commonUtil";

const MIN_SAFE_INT = Number.MIN_SAFE_INTEGER;
const MAX_SAFE_INT = Number.MAX_SAFE_INTEGER;

const fixme = (val: any, min: number, max: number, isMin: boolean) => {
  if (typeof val !== "number") {
    val = +val;
  }

  if (isNaN(val) || !isFinite(val)) {
    return isMin ? min : max;
  }

  return clamp(val, min, max);
};

const rendomIntegral = (options?: any) => {
  if (options) {
    // for speed up
    if (!options.inspected) {
      options.min = fixme(options.min, MIN_SAFE_INT, MAX_SAFE_INT, true);
      options.max = fixme(options.max, MIN_SAFE_INT, MAX_SAFE_INT, false);
    }
  } else {
    options = {
      min: MIN_SAFE_INT,
      max: MAX_SAFE_INT,
    };
  }

  let min = options.min;
  let max = options.max;

  // swap to variables
  // ref: http://stackoverflow.com/a/16201688
  if (min > max) {
    min = min ^ max;
    max = min ^ max;
    min = min ^ max;
  }

  return Math.round(Math.random() * (max - min)) + min;
};

const randomNatural = (options?: any) => {
  if (options) {
    if (!options.inspected) {
      options.min = fixme(options.min, 0, MAX_SAFE_INT, true);
      options.max = fixme(options.max, 0, MAX_SAFE_INT, false);
    }
  } else {
    options = {
      min: 0,
      max: MAX_SAFE_INT,
    };
  }

  options.inspected = true;

  return rendomIntegral(options);
};

const pools = {
  alpha: "",
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "~!@#$%^&()*_+-={}[]",
  all: "",
};

pools.alpha = pools.lower + pools.upper;
pools.all = pools.lower + pools.upper + pools.number + pools.symbol;

const randomChar = (options?: any) => {
  if (!options) {
    options = { pool: pools.all };
  } else {
    if (typeof options === "string") {
      options = { pool: (pools as any)[options] || options };
    }
  }

  let pool: string;

  if (options.pool) {
    pool = options.pool;
  } else if (options.lower) {
    pool = pools.lower;
  } else if (options.upper) {
    pool = pools.upper;
  } else if (options.alpha) {
    pool = pools.alpha;
  } else if (options.number) {
    pool = pools.number;
  } else if (options.symbol) {
    pool = pools.symbol;
  } else {
    pool = pools.all;
  }

  return pool.charAt(
    randomNatural({
      min: 0,
      max: pool.length - 1,
      inspected: true,
    }),
  );
};

const randomSyllable = (options?: any) => {
  let length = options && options.length ? options.length : options;

  if (length) {
    length = +length;
    length = clamp(length, 2, 3);
  } else {
    length = randomNatural({ min: 2, max: 3 });
  }

  const consonants = "bcdfghjklmnprstvwz"; // consonants except hard to speak ones
  const vowels = "aeiou"; // vowels
  const all = consonants + vowels; // all

  let text = "";
  let char: string = "";

  for (let i = 0; i < length; i++) {
    if (i === 0) {
      // First character can be anything
      char = randomChar({ pool: all });
    } else if (consonants.indexOf(char) === -1) {
      // Last character was a vowel, now we want a consonant
      char = randomChar({ pool: consonants });
    } else {
      // Last character was a consonant, now we want a vowel
      char = randomChar({ pool: vowels });
    }

    text += char;
  }

  return text;
};

const MIN_LEN = 2;
const MAX_LEN = 18;

export const randomLorem = (options?: any) => {
  options = options || {
    syllables: randomNatural({
      min: 1,
      max: 3,
      inspected: true,
    }),
  };

  let length = options.length;
  const syllables = options.syllables;

  let result = "";

  if (syllables) {
    for (let i = 0; i < syllables; i++) {
      result += randomSyllable();
    }

    return result.substring(0, MAX_LEN);
  }

  if (!length && (options.min || options.max)) {
    length = randomNatural({
      min: options.min || MIN_LEN,
      max: options.max || MAX_LEN,
    });
  }

  length =
    length ||
    randomNatural({
      min: MIN_LEN,
      max: MAX_LEN,
      inspected: true,
    });

  length = clamp(length, MIN_LEN, MAX_LEN);

  while (result.length < length) {
    result += randomSyllable();
  }

  return result.substring(0, length);
};

export const randomSentence = (options: any) => {
  options = options || {
    words: randomNatural({
      min: 12,
      max: 18,
      inspected: true,
    }),
  };

  let length = options.words;

  if (!length && (options.min || options.max)) {
    length = randomNatural({
      min: options.min || MIN_LEN,
      max: options.max || MAX_LEN,
    });
  }

  length =
    length ||
    randomNatural({
      min: MIN_LEN,
      max: MAX_LEN,
      inspected: true,
    });

  length = clamp(length, MIN_LEN, MAX_LEN);

  const words: string[] = [];

  while (length--) {
    words.push(randomLorem());
  }

  const firstWorld = words[0];

  words[0] = firstWorld[0].toUpperCase() + firstWorld.substr(1);

  return words.join(" ") + ".";
};
