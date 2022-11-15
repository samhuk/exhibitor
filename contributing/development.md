# Development

This document describes the process for setting up and running this app on your local computer.

## Prerequisites

This app uses Node.js and Docker (Docker only for production deployment).v

You can get Node.js [here](https://nodejs.org/en/), or if you are using Chocolatey run `choco install nodejs`.

You can get Docker [here](https://docs.docker.com/get-docker/).

It runs on MacOS, Windows, and Linux environments.

It runs on many versions of Node.js, tested back to version 14.x.

## Structure

This section details the basic structure of the repository.

This repository is split into three main parts - the **client**, **server**, and **common**.

### Client

The client uses React and Redux.

The Typescript for the client is at `/src/client`.

The SCSS for the client is at `/src/client/assets/styles`

### Server

The server uses express.js.

The Typescript for the server is at `/src/server`.

### Common

The common directory holds all of the Typescript code that is shared by the client and server. This is particularly useful for sharing types between client and server.

## Linting

ESLint is used for Typescript linting. To lint the Typescript code, run `npm run lint`. To only lint for errors (excluding warnings), run `npm run lint-errors-only`.

## Building

To build the app's Typescript, run `npm run build-ts`

## Deploying

### Development

To deploy the app for development, run `npm start`. This starts a hot-reloading server and client.

### Production

To deploy the app for production, first build the app:
  * If on Windows, run `build-prod` from a cmd prompt.
  * If on a Unix-based OS, run `sh build-prod.sh`.

Then, run `docker-compose up -d` (likely will need `sudo` for Unix-based OSes).

## Debugging

### Server

For VSCode, to attach the debugger to the running server, run the **Attach Server** launch configuration.

For VSCode, to debug the server from start (to debug the initialization of the server), run the **Run Server** launch configuration.

### Unit Tests

For VSCode, to debug the unit tests, run the **Run Unit Tests** launch configuration.

## Testing

### Unit Tests

Jest is used for unit testing. To build and run the unit tests, run `npm run unit-tests`.

The unit tests can be debugged with Visual Studio Code by running the **Run Unit Tests** debug task.

## Miscellaneous Scripts

`npm run check` - Useful to run before committing to check the full validity of a change. This runs linting, Typescript build, unit tests.

## Pull Requests

Pull requests automatically run a CI pipeline that checks various criteria:

* Linting
* Typescript build
* Unit tests

These must pass for a pull request to be approved and merged.
