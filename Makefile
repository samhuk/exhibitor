VERSION = $(shell cat version.txt)

# -- JS/TS linting

lint:
	npx eslint -c .eslintrc.json ./src --ext .ts,.tsx

lint-errors-only:
	npx eslint -c .eslintrc.json ./src --ext .ts,.tsx --quiet

# -- JS/TS unit tests

clean-ts-unit-tests:
	rm -rf ./build-test

build-ts-unit-tests:
	npx tsc -p ./src/tsconfig.test.json

run-ts-unit-tests:
	npx jest

ts-unit-tests:
	@$(MAKE) --no-print-directory \
		clean-ts-unit-tests \
		build-ts-unit-tests \
		run-ts-unit-tests

# -- Site TS build
build-site-client-ts:
	npx tsc -p ./src/site/client/tsconfig.json
	
build-site-server-ts:
	npx tsc -p ./src/site/server/tsconfig.json

build-site-ts:
	@$(MAKE) --no-print-directory \
		build-site-client-ts \
		build-site-server-ts

# -- Site builder TS build

clean-site-build:
	rm -rf ./build/site/build

_build-site-build:
	npx tsc -p ./src/site/build/tsconfig.json

build-site-build:
	@$(MAKE) --no-print-directory \
		clean-site-build \
		_build-site-build

# -- Site build

clean-site:
	rm -rf ./build/site/client && rm -rf ./build/site/server

_build-site-client-dev:
	npx env-cmd -e dev node ./build/site/build/site/build/bin/buildClient.js

_build-site-server-dev:
	npx env-cmd -e dev node ./build/site/build/site/build/bin/buildServer.js

build-site-dev:
	@$(MAKE) --no-print-directory \
		build-site-build \
		clean-site \
		_build-site-client-dev \
		_build-site-server-dev

_build-site-client-rel:
	npx env-cmd -e rel node ./build/site/build/site/build/bin/buildClient.js

_build-site-server-rel:
	npx env-cmd -e rel node ./build/site/build/site/build/bin/buildServer.js

_build-site-rel:
	@$(MAKE) --no-print-directory \
		build-site-build \
		_build-site-client-rel \
		_build-site-server-rel

build-site-rel:
	@$(MAKE) --no-print-directory \
		build-site-build \
		clean-site \
		_build-site-client-rel \
		_build-site-server-rel

# -- API TS build
clean-api:
	rm -rf ./build/api

_build-api:
	npx tsc -p ./src/api/tsconfig.json

build-api:
	@$(MAKE) --no-print-directory \
		clean-api \
		_build-api

# -- CLI builder TS build
clean-cli-build:
	rm -rf ./build/cli/build

_build-cli-build:
	npx tsc -p ./src/cli/build/tsconfig.json

build-cli-build:
	@$(MAKE) --no-print-directory \
		clean-cli-build \
		_build-cli-build

# -- CLI build

clean-cli:
	rm -rf ./build/cli/cli

_build-cli-dev:
	npx npx env-cmd -e dev node ./build/cli/build/cli/build/bin/buildCli.js

_build-cli-rel:
	npx npx env-cmd -e rel node ./build/cli/build/cli/build/bin/buildCli.js

build-cli-dev:
	@$(MAKE) --no-print-directory \
		build-cli-build \
		clean-cli \
		_build-cli-dev

build-cli-rel:
	@$(MAKE) --no-print-directory \
		build-cli-build \
		clean-cli \
		_build-cli-rel

# clean-build-comp-site-react-build:
# 	rm -rf ./build/comp-site/react/build

# _build-comp-site-react-build:
# 	npx tsc -p ./src/comp-site/react/build/tsconfig.json

# build-comp-site-react-build:
# 	@$(MAKE) --no-print-directory \
# 		clean-build-comp-site-react-build \
# 		_build-comp-site-react-build

clean-build-comp-site-react-build-build:
	rm -rf ./build/comp-site/react/build-build

_build-comp-site-react-build-build:
	npx tsc -p ./src/comp-site/react/build-build/tsconfig.json

build-comp-site-react-build-build:
	@$(MAKE) --no-print-directory \
		clean-build-comp-site-react-build-build \
		_build-comp-site-react-build-build

clean-build-comp-site-react-build:
	rm -rf ./build/comp-site/react/build

_build-comp-site-react-build:
	npx env-cmd -e rel node ./build/comp-site/react/build-build/comp-site/react/build-build/bin/build.js

build-comp-site-react-build:
	@$(MAKE) --no-print-directory \
		clean-build-comp-site-react-build \
		_build-comp-site-react-build

clean-prebuild-comp-site-react:
	rm -rf ./build/comp-site/react/site-prebuild

_prebuild-comp-site-react:
	npx tsc -p ./src/comp-site/react/site/tsconfig.json

prebuild-comp-site-react:
	@$(MAKE) --no-print-directory \
		clean-prebuild-comp-site-react \
		_prebuild-comp-site-react
	cp ./src/comp-site/react/site/index.html ./build/comp-site/react/site-prebuild/index.html

build-comp-site-react-dev:
	npx env-cmd -e dev node ./build/comp-site/react/build/index.js

# -- Complete build
clean-all:
	rm -rf ./.exh && rm -rf ./build && rm -rf ./build-test

build-all:
	@$(MAKE) --no-print-directory \
		build-site-rel \
		build-api \
		build-cli-rel \
		prebuild-comp-site-react \
		build-comp-site-react-build-build \
		build-comp-site-react-build

# -- Distribution
populate-dist:
	rm -rf ./dist/npm/exhibitor/lib/

	mkdir -p dist/npm/exhibitor/lib/site/server
	cp -r ./build/site/server/ ./dist/npm/exhibitor/lib/site/server

	mkdir -p dist/npm/exhibitor/lib/site/client
	cp -r build/site/client/ dist/npm/exhibitor/lib/site/client

	mkdir -p dist/npm/exhibitor/lib/api
	cp -r build/api/ dist/npm/exhibitor/lib/api

	mkdir -p dist/npm/exhibitor/lib/cli
	cp -r build/cli/cli/ dist/npm/exhibitor/lib/cli

	mkdir -p dist/npm/exhibitor/lib/comp-site/react/build
	cp -r build/comp-site/react/build/ dist/npm/exhibitor/lib/comp-site/react/build

	mkdir -p dist/npm/exhibitor/lib/comp-site/react/site-prebuild
	cp -r build/comp-site/react/site-prebuild/ dist/npm/exhibitor/lib/comp-site/react/site-prebuild

prepublish:
	npm install
	@$(MAKE) --no-print-directory \
		lint-errors-only \
		ts-unit-tests \
		build-site-ts \
		build-all \
		populate-dist

npm-publish-dry:
	npm publish dist/npm/exhibitor --dry-run

npm-publish:
	npm publish dist/npm/exhibitor

npm-publish-beta:
	npm publish dist/npm/exhibitor --tag beta

# -- Test component library watch [dev only] TODO: concurrently needs to be used here.

build-watch-component-library:
	npx tsc -p ./src/cli/componentLibrary/bin/tsconfig.json

complib:
	npx env-cmd -e dev node ./build/component-library-bin/cli/componentLibrary/bin/watch.js

client:
	npx env-cmd -e dev node ./build/site/build/site/build/bin/watchClient.js

server:
	npx env-cmd -e dev node ./build/site/build/site/build/bin/watchServer.js

start-dev:
	@$(MAKE) --no-print-directory \
		build-site-build \
		build-watch-component-library
	npx concurrently 