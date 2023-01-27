# Development

This document describes the process for setting up and running Exhibitor on your local computer.

## Prerequisites

Exhibitor uses Node.js.

You can get Node.js [here](https://nodejs.org/en/).

If on Windows and are using Chocolatey, run `choco install nodejs`.

It runs on MacOS, Windows, and Linux environments.

One exception is the **release process** because it uses `make` which is unavailable on Windows. One must use a UNIX-like OS or WSL. `make` can be installed via `sudo apt install make`.

Exhibitor is tested to Node.js versions back to 16.

## Development Deployment

For a development deployment, run `npm start`.

This starts a hot-reloading build of the Exhibitor Site Client, Server, and test component library (within `/test/componentLibrary`), and serves the Site by default at http://localhost:4001.

## Structure

This section details the basic structure of the repository.

Exhibitor is split into four main parts - **api**, **cli**, **site**, and **comp-site**.

### API

The Typescript for the API is at `/src/api`.

This is the Javascript API that the user consumes in their code in order to use the package, for example `exhibit(MyReactComponent, 'MyReactComponent')`.

### CLI

The Typescript for the CLI is at `/src/cli`.

This is the Command Line Interface application that the user runs to do things like start Exhibitor, for example `npx exhibitor start`.

The CLI uses Node.js.

### Site

The Typescript for the Site is at `/src/site`.

This contains all of the code for the Exhibitor Site that the user uses. It is one of the largest parts of Exhibitor. It is split into three main parts - **Client**, **Server**, and **Common**:

#### Client

The Typescript for the client is at `/src/site/client`.

The SCSS for the client is at `/src/site/client/assets/styles`.

The client uses React and Redux.

#### Server

The Typescript for the server is at `/src/site/server`.

The server uses express.js.

#### Common

The common directory contains Typescript that is shared by the Site Client and Server. This is particularly useful for sharing response types, DTOs, etc.

### Comp-site

The Typescript for the Component Site is at `/src/comp-site`.

The Component Site is a small React app that renders the users components. It enables the user to render their components with a React version of *their* chosing. It is rendered inside an iframe element inside Exhibitor Site (a react app inside a react app, basically). For distribution, it is prebuilt (*not* bundled) into Javascript code with tsc. On the user's side, the CLI `start` command completes the build with esbuild, bundling in *their* version of `react` and `react-dom`.

## Linting

ESLint and tsc is used for Typescript linting.

To ESLint the Typescript code, run `make lint`. To only check for errors (excluding warnings), run `make lint-errors-only`.

To run a tsc check (no code emission) of all the code, run `make build-all-ts`.

## Building

To build all three parts of the package, run `make build-all`. This will output build artifacts to `/build`, separated by package area, i.e. `/build/api`, `/build/cli`, `/build/site/client`, `/build/site/server`, etc.

To perform a full check and build of all of the code of Exhibitor, run `make prepublish` if using a unix-like OS or `make prepublish-wsl` if using WSL. This currently runs:

* NPM dependency check for dist
* ESLint check
* tsc check
* Build Site Client
* Build Site Server
* Build API
* Build CLI
* Prebuild Component Site
* Copy over all build outputs to /dist/npm/exhibitor 

## Releasing

A unix-like OS or WSL is required for this.

From the repo root dir:

Run `make patch` to patch the package version. `make minor` and `make major` are also available, but these should be very rarely used.

Run `make prepublish` if using a unix-like OS or `make prepublish-wsl` if using WSL.

Note: `/dist/npm/exhibitor/lib` will now be populated and is ready for puiblishing to npm.

Run `make npm-publish-dry` to test the NPM publishing process without actually publishing.

Run `make npm-publish` to publish to NPM

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
