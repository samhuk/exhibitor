# Development

This document describes the process for setting up and running this package on your local computer.

## Prerequisites

This app uses Node.js.

You can get Node.js [here](https://nodejs.org/en/). If you are using Chocolatey, run `choco install nodejs`.

It runs on MacOS, Windows, and Linux environments.

It runs on many versions of Node.js, tested back to version 14.x.

## Structure

This section details the basic structure of the repository.

This repository is split into three main parts - the **Javascript API**, the **CLI**, and the **Site**.

### Javascript API

The Typescript for the Javascript API is at `/src/api`.

This defines what the use will consume in their code in order to use the package.

### CLI

The Typescript for the CLI is at `/src/cli`.

This is the Command Line Interface application that the user runs to do things like start the exhibitor site.

The CLI uses Node.js.

### Site

The Typescript for the Site is at `/src/site`.

This contains all of the code for the Exhibitor website that the user uses. It is split into three main parts - **Client**, **Server**, and **Common**.

#### Client

The Typescript for the client is at `/src/site/client`.

The SCSS for the client is at `/src/site/client/assets/styles`.

The client uses React and Redux.

#### Server

The Typescript for the server is at `/src/site/server`.

The server uses express.js.

#### Common

The common directory holds all of the Typescript code that is shared by the client and server. This is particularly useful for sharing types between client and server.

## Linting

ESLint is used for Typescript linting. To lint the Typescript code, run `npm run lint`. To only lint for errors (excluding warnings), run `npm run lint-errors-only`.

## Building

To build all three parts of the package, run `npm run build`. This will output many build artifacts to `/build`, separated by package area, i.e. `/build/api`, `/build/cli`, etc.

## Development Deployment

For a development deployment, run `npm start`.

This starts a hot-reloading build of the site client, server, and test component library (within `/test/componentLibrary`), and serves the client by default at http://localhost:4001.

## Releasing

From the repo root dir:

Run `npm run build`

Run `sh ./scripts/dist.sh` (if bash-like is available), or `"scripts/dist.bat"` (if on Windows)

`/dist/npm/exhibitor/lib` will now be populated and is ready for puiblishing to npm.

## Debugging

TODO. Tentative content:

> ### Server
> 
> For VSCode, to attach the debugger to the running server, run the **Attach Server** launch configuration.
> 
> For VSCode, to debug the server from start (to debug the initialization of the server), run the **Run Server** launch configuration.
> 
> ### Unit Tests
> 
> For VSCode, to debug the unit tests, run the **Run Unit Tests** launch configuration.
> 
> ## Testing
> 
> ### Unit Tests
> 
> Jest is used for unit testing. To build and run the unit tests, run `npm run unit-tests`.
> 
> The unit tests can be debugged with Visual Studio Code by running the **Run Unit Tests** debug task.
> 
> ## Miscellaneous Scripts
> 
> `npm run check` - Useful to run before committing to check the full validity of a change. This runs linting, Typescript build, unit tests.

## Pull Requests

TODO. Tentative content:

> Pull requests automatically run a CI pipeline that checks various criteria:
> 
> * Linting
> * Typescript build
> * Unit tests
> 
> These must pass for a pull request to be approved and merged.
