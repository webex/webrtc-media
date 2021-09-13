import {esbuildPlugin} from '@web/dev-server-esbuild';
import {defaultReporter} from '@web/test-runner';
import {junitReporter} from '@web/test-runner-junit-reporter';
import {createSauceLabsLauncher} from '@web/test-runner-saucelabs';

const useSauceConnect = process.env.SAUCE === 'true';
const timeout = process.env.TEST_TIMEOUT || '10000';
let browsers = null;

if (useSauceConnect) {
  const sauceLabsLauncher = createSauceLabsLauncher({
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
  }, {
    name: 'unit tests',
    build: `webrtc-media-core ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
  });

  browsers = [
    sauceLabsLauncher({
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),

    sauceLabsLauncher({
      browserName: 'firefox',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),

    sauceLabsLauncher({
      browserName: 'safari',
      browserVersion: 'latest',
      platformName: 'macOS 11',
    }),

  ];
}

export default {
  nodeResolve: true,
  target: 'auto-always',
  files: [
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
  ],
  plugins: [
    esbuildPlugin({
      ts: true,
      json: true,
    })],
  reporters: [
    defaultReporter({reportTestResults: false, reportTestProgress: true}),
    junitReporter({
      outputPath: './coverage/junit.xml',
      reportLogs: true,
    }),
  ],
  browsers,
  testFramework: {
    config: {
      timeout,
    },
  },
};
