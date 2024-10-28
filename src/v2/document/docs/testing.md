# Testing

The API has been rigorously tested to ensure reliability, scalability, and performance. The following testing strategies and tools have been implemented:

## Unit Testing

Unit tests focus on verifying that individual components function as expected.

-   **Scope**: Testing classes, functions, services.
    However, in the current setup, many service test suites interact directly with the database, which aligns more closely with integration testing. Ideally, these tests would mock database interactions to isolate the unit under test.

-   **Tools**: [Jest](https://jestjs.io/).

**Note**: These tests are being run against a live database connection, which may introduce dependencies not typical of unit tests. Refactoring plans include separating true unit tests from database-dependent tests to improve test isolation and performance.

To run the unit tests, execute the following command:

```bash
npm test:unit
```

## Integration Testing

Integration tests verify the interactions between different modules to ensure they work together as intended.

-   **Scope**: Testing API endpoints.

-   **Tools**: [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest).

To run the integration tests, execute the following command:

```bash
npm test:integration
```

## Test Environment

Tests are executed in a controlled environment with mock data to ensure test isolation. Key points include:

-   **Database**: A separate test database instance is used.
-   **Environment Variables**: Ensure `.env.test` is configured with test-specific values.

## Continuous Integration

The project is set up with GitHub Actions to run tests automatically on each push to the repository. The workflow can be found in `.github/workflows/node.js.yml`.
