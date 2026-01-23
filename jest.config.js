// Jest config using Next.js preset to support TS/TSX and module aliases
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "<rootDir>/tests/**/*.(spec|test).{ts,tsx,js,jsx}",
    "<rootDir>/**/__tests__/**/*.(spec|test).{ts,tsx,js,jsx}",
  ],
};

module.exports = createJestConfig(customJestConfig);
