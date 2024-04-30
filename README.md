# Node assignment - 1.4.3

## Introduction

There are over 9 million farms in the European Union. Two passionate farmers-turned-software-engineers have noticed that a lot of their farmer peers aren't really taking advantage of the technological leaps that humanity has made in the last decades. So they got together and decided to develop a farm management system. They've calculated that if they can capture even 1% of this huge market, it will all be well worth their while. Their investors said that even a solid 0.2% would give them enough confidence to continue funding the project.

You are a software engineer who has just joined their startup. These founding engineers developed the scaffolding for the app, and implemented some smaller functionality already. However, the harvest season started today. And unfortunately (for you, anyway), your colleagues/bosses turned out to be more passionate farmers than software developers, and they took sabbaticals to attend to their farms. So now it is up to you to develop some functionality that they really need. The app has not been used by real users yet. It will be deployed to production and start getting traffic right after you are done with this task.

We expect to have at least 1’000 users signing up the first week with every user having 1-3 farms.
For the first month we expect to have 4’000 users. Afterwards, we expect to have continuous stable monthly growth of 10-20% of the total amount of users.

## General notes

This assignment requires you to implement a feature within the context of the existing setup. The objective isn't merely to impress us but to produce a robust piece of work.<br/>
We believe in the saying: 'If it's worth doing, it's worth doing right.' We expect you to approach this task with diligence, aiming to create something that you'd proudly reference or use even a year from now.

We'll be evaluating the entirety of your code and how effectively you've utilised the existing setup, rather than just checking for functionality. <br/>
If you have reservations about the conventions or frameworks used in the setup, kindly annotate your concerns instead of altering the provided framework.

⚠️ Please make sure to provide all data needed to start the app.

## Final note

Part of the challenge of this assignment is to interpret the requirements and make decisions just like you would when working on a real project. For the parts of the assignment that are not specifically mentioned in the requirements, consider what you think is the most effective, efficient, and scalable solution. There is no single right answer; we are interested in seeing how you tackle problems and devise your solutions. Your decision-making process and the rationale behind your choices are as important as the final code itself.

Good luck!

## Installation

- Install [NodeJS](https://nodejs.org/en/) lts or latest version
- Install [Docker](https://www.docker.com/get-started/)

- In root dir run `npm install`
- In root dir run `docker compose up -d` to run Postgres and PgAdmin docker images for local development
- Create a .env file with the content from .env.dev

## Database

Postgres database will be available on http://localhost:5440

PgAdmin UI will be available on http://localhost:80

Connect to PgAdmin UI using:

- login in the UI (username: `postgres@gmail.com`, password: `postgres`)
- host: `host.docker.internal`
- port: `5440`
- username/password/maintenance database:`postgres`

## Running the app

Make sure to run the migrations before running the app (see Migrations section below)

### Development:

- To start the project in dev mode, run `npm run start:dev`

### Production:

- To build the project, run `npm run build`
- To start the project in prod mode, run `npm run start:prod`

### Testing:

- Please note the tests setup will use env vars from `.env.test`

- To run all tests once, run `npm run test`
- To run all tests and watch for changes `npm run test:watch`
- To run single test file and watch for changes `npm run test:watch -- src/modules/auth/tests/auth.service.spec.ts`

### Lint:

- To run the lint, run `npm run lint`

Application runs on [localhost:3000](http://localhost:3000) by default.

## Migrations

Migration scripts:

- `npm run migration:generate --path=moduleName --name=InitialMigration` - automatically generates migration files with
  schema changes made
- `npm run migration:create --path=moduleName --name=CreateTableUsers` - creates new empty migration file
- `npm run migration:run` - runs migration
- `npm run migration:revert` - reverts last migration
- `npm run migration:show` - shows the list of migrations
- you can also use `npm run test:migration:run`, `npm run test:migration:show` and `npm run test:migration:revert` to
  manage testing database

## Swagger

Swagger will be available on http://localhost:3000/docs by default

You can find swagger documentation [here](https://swagger.io/docs/specification/about/)

# Farms Task - API

## Setup

- Use created app
- Free to add additional packages
- Use existing user authentication. Make sure all added endpoints are only accessible for authenticated users

## Requirements

### General

The application needs to have tests.

### Model

Every user and every farm should have an address and the coordinates corresponding to that address stored in the database. Addresses and coordinates of users and farms can be stored in the same tables as other user and farm data.

Every farm should have an owner.

### API

_Add API that supports following requirements:_

- As a user I want to be able to retrieve a list of all farms **of all users** (max 100 records a time).

  - The list should contain following properties:

    - `name`
    - `address`
    - `owner` (email)
    - `size`
    - `yield`
    - `driving distance` (travel distance from farm to requesting user's address)<br/>
      For **driving distance** you can use Distance-Matrix API of
      _Google_ https://developers.google.com/maps/documentation/javascript/examples/distance-matrix (token provided
      in email)
      - Please ignore rate limitations, as they should be explained later (See "One more thing" at the bottom of the document) and don't need to be coded.

  - The user should be able to get list **sorted** by

    - **name** (a to z)
    - **date** (newest first)
    - **driving distance** (closest first)

  - The user should be able to get list **filtered** by
    - **outliers** (Boolean) (outliers = the yield of a farm is 30% below or above of the average yield of all
      farms).
      - undefined: Show all (no filtering)
      - false: Show all except outliers
      - true: Show only outliers

- As a system administrator, I want the users to be logged in when performing operations with farms. The users should also only create farms for themselves, not other users.

### One more thing

Please explain in the Readme how to handle rate limitations for fetching driving distances from a third party. Write it as if you are making a PoC and you want to explain it to the rest of your team.

- Max 25 results per request
- Max 10 requests per second

### Rate limiting the Google getDistanceMatrix() request
#### Problem statement 
The approach suggested in this document tries to ensure that the third party rate limitations are not exceeded while also ensuring that we provide the fastest and most reliable service to our users. The third party API we are using to calculate distance to farms is the Google API, and this one imposes the following limitations  
- Max 25 results per request
- Max 10 requests per second

Meanwhile we have to make sure that we can satisfy our customer base, which should be at the very least include 18,000 farms and at most 9 million. 

#### Project definition 
This PoC seeks to demonstrate how using a combination of splittling requests into batches and simple rate limiting, for example using a module like [limiter](https://github.com/jhurliman/node-rate-limiter) can be facilitate the integration of our software with the google maps api and make fetching driving distances for a large customer base a feasable endeavor. Using a package is interesing for the PoC because it abstracts away some of the details of the rate limiting while exposing some useful parameters for fine tuning how throttling will work, simplifying the creation of a basic prototype. Some of the additional functionalities that packages will offer include in-memory caching, optimized data structures, concurrent operations and take algorithmic efficiency into account. In particular, we should consider caching with a mechanism like redis a tool that can help us run this type of calculation much faster while completely avoiding more request to the api for the same distances.

#### Project goals 
We would baiscally like to demonstrate that our approach is sufficient to serve a userbase consisting of a number of farms that allows us to test how breaking down requests into batches and adding delays in between requests keeps us within the rate limits imposed by the third party api. To do this I've created a test inside farms.controller.integration.spec file. The test is called "it should calculate the distances to 1001 farms". Running this test is time consuming, so it is set to be skipped for the time being. Unskip the test and watch it pass. This should demonstrate that splitting the request into batches of 25 and using the limiter package and setting it to send requests every 100 ms should suffice for this ~1000 farm dataset. Since we are creating 1000 farms on the fly, and this takes approximately 87646 ms we need to subtract this value from the total of the test run(118 s or 118,000ms) to get about 30,354 ms or about 30 seconds for calculating the distance to 1000 farms.  

#### Required resources 
For this project to be implemented we will need a rate limiting module that will provide us the ability to insert a delay between requests, like the npm limiter package. We will also need tools to benchmark the performance of our requests, like javascript's performance.now() function and large and valid address data sets to test with (the included addresses.json file only contains 1000 farms).


