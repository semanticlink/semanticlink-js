/**
 * Create a manual mock for axios
 *
 * @see https://jestjs.io/docs/en/es6-class-mocks#manual-mock
 *
 * @returns what axios was called with
 */

export default <T>(config: T): Promise<T> => Promise.resolve(config);
