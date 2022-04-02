/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	testRegex: "/spec/.*\\.(test|spec)\\.(tsx?)$",
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: "coverage",
	coveragePathIgnorePatterns: ["/node_modules/", "/spec/"],
	globalSetup: "<rootDir>/spec/config/global-setup.ts",
	globalTeardown: "<rootDir>/spec/config/global-teardown.ts",
	setupFilesAfterEnv: ["<rootDir>/spec/config/setup-database.ts"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
