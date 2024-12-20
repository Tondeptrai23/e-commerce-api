# E-Commerce API

This repository contains a monolithic e-commerce API built with Node.js, Express, and MySQL.

## Table of Contents

-   [E-Commerce API](#e-commerce-api)
    -   [Table of Contents](#table-of-contents)
    -   [Features](#features)
    -   [Tech Stack](#tech-stack)
    -   [Database Schema](#database-schema)
    -   [Setup](#setup)
        -   [Prerequisites](#prerequisites)
        -   [Installations](#installations)
        -   [Database Setup](#database-setup)
        -   [Testing](#testing)
        -   [Continuous Integration](#continuous-integration)
    -   [API Documentation](#api-documentation)
    -   [Other Documentation](#other-documentation)

## Features

The API provides a comprehensive set of features. Some of the key functionalities include:

-   **Flexible Product Management**: Supports diverse product variations with a customizable attribute system, allowing for robust inventory management and dynamic pricing strategies.

-   **Order Fulfillment**: Comprehensive order processing and tracking, ensuring seamless user experience and operational efficiency.

-   **Coupon and Promotion Management**: Implements flexible discount and coupon systems, helping to drive dynamically business sales.

-   **Admin Interface**: Provides advanced search and sorting capabilities for statistical analysis and efficient management of products and orders.

For a detailed overview of the features, refer to the [Feature Documentation](./src/v2/document/docs/feature.md).

## Tech Stack

-   **Backend**: Node.js with Express.js
-   **Database**: MySQL
-   **ORM**: Sequelize
-   **Authentication**: JWT
-   **Testing**: Jest and Supertest
-   **API Documentation**: Swagger
-   **Containerization**: Docker, Docker Compose
-   **CI**: GitHub Actions
-   **Third-party Integrations**:
    -   AWS S3 for image storage
    -   AWS CloudFront for content delivery
    -   Mailgun for email notifications
    -   Google OAuth 2.0 for user authentication
    -   Momo API and Stripe API for payments

## Database Schema

For a detailed overview of the database schema, refer to the [Database Schema](./src/v2/document/docs/database.md).

![Database Schema](./db_diagram.png)

## Setup

### Prerequisites

-   Docker and Docker-Compose installed

-   Node.js installed

-   Node Package Manager (npm) installed

-   MySQL running (alternatively, can be set up in Docker)

### Installations

1. Clone the repository

```bash
git clone https://github.com/Tondeptrai23/e-commerce-api.git
cd e-commerce-api
```

2. Install dependencies

```bash
npm install
```

3. Set up the environment variables. Create a `.env.development` file in the root directory based on the `.env.sample` file:

```bash
cp .env.sample .env.development
```

4. Run the application in development mode

```bash
docker-compose up --build
```

Or, if not using Docker:

```bash
npm start
```

5. Access the API at `http://localhost:3000`

### Database Setup

Ensure you have MySQL running locally or in a Docker container. Run the following migrations to set up your database schema:

```bash
npm run migrate
```

### Testing

Firstly, you have to create an `.env.test` file just the same to `.env.development` file you created before.

Then, run the following command to run the tests:

```bash
docker-compose -f docker-compose.test.yml --env-file .env.test run test
```

Or, if not using Docker:

```bash
npm test
```

For more information on testing, refer to the [Testing](./src/v2/document/docs/testing.md) documentation.

### Continuous Integration

GitHub Actions is configured to run tests and checks automatically for every push and pull request on branch `main`. You can view the status of your builds in the GitHub Actions tab of the repository.

## API Documentation

The API documentation can be accessed through Swagger UI at: `http://localhost:3000/docs` when running the application locally.

Alternatively, the OpenAPI specification is available in the `openapi.yaml` file located in the root directory. You can quickly view it by copying the contents into [Swagger Editor](https://editor.swagger.io/).

## Other Documentation

-   [Feature Documentation](./src/v2/document/docs/feature.md): Detailed descriptions of all features available in the API.
-   [Database Schema](./src/v2/document/docs/database.md): An overview of the database structure, including tables and relationships.
-   [User Authentication](./src/v2/document/docs/auth.md): Information on the authentication process, including methods and protocols used.
-   [Payment Integration](./src/v2/document/docs/payment.md): Details on integrating payment gateways and handling transactions.
-   [Query Parameters](./src/v2/document/docs/query.md): Explanation of query parameters used in API endpoints (should read if you want to use complex queries).
-   [Testing](./src/v2/document/docs/testing.md): Information on testing strategies and tools used in the project.
