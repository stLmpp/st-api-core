import { getEnvironmentVariables } from './get-environment-variables.js';

describe('get-environment-variables', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should throw error if type is invalid', () => {
    process.env.AD_TIMEOUT_SECONDS = 'ABC';
    expect(() => getEnvironmentVariables()).toThrowError(
      new Error(
        `Invalid environment variables. Error: AD_TIMEOUT_SECONDS: Must be an integer`,
      ),
    );
  });

  it('should return default values', () => {
    const environment = getEnvironmentVariables();
    expect(environment).toBeTypeOf('object');
    expect(Object.keys(environment).length).toBeGreaterThan(1);
  });
});
