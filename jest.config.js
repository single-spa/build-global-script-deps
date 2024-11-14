export default {
  moduleNameMapper: {
    "node\\:fs$": "<rootDir>/__mocks__/fs.cjs",
    "node\\:fs\\/promises": "<rootDir>/__mocks__/fs/promises.cjs",
  },
};
