VERSION = $(shell cat version.txt)

#region Dist and outer npm dependency comparison check
check-dist-outer-npm-deps:
	npx ts-node ./scripts/checkDistOuterNpmDeps.ts
#endregion

#region JS/TS linting
lint:
	npx eslint -c .eslintrc.json ./src --ext .ts,.tsx

lint-errors-only:
	npx eslint -c .eslintrc.json ./src --ext .ts,.tsx --quiet
#endregion

#region JS/TS unit tests
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
#endregion

#region Site TS Build
build-site-client-ts:
	npx tsc -p ./src/site/client/tsconfig.json
	
build-site-server-ts:
	npx tsc -p ./src/site/server/tsconfig.json

build-site-ts:
	@$(MAKE) --no-print-directory \
		build-site-client-ts \
		build-site-server-ts
#endregion

#region Site Builder TS Build
clean-site-build:
	rm -rf ./build/site/build

_build-site-build:
	npx tsc -p ./src/site/build/tsconfig.json

build-site-build:
	@$(MAKE) --no-print-directory \
		clean-site-build \
		_build-site-build
#endregion

#region Site Build
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
#endregion

#region API TS Build
clean-api:
	rm -rf ./build/api

_build-api:
	npx tsc -p ./src/api/tsconfig-dist.json

build-api:
	@$(MAKE) --no-print-directory \
		clean-api \
		_build-api
#endregion

#region CLI Builder TS Build
clean-cli-build:
	rm -rf ./build/cli/build

_build-cli-build:
	npx tsc -p ./src/cli/build/bin/tsconfig-dist.json

build-cli-build:
	@$(MAKE) --no-print-directory \
		clean-cli-build \
		_build-cli-build
#endregion

#region CLI build

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
#endregion

#region Comp-Site Build-Build
clean-build-comp-site-react-build-build:
	rm -rf ./build/comp-site/react/build-build

_build-comp-site-react-build-build:
	npx tsc -p ./src/comp-site/react/build-build/tsconfig.json

build-comp-site-react-build-build:
	@$(MAKE) --no-print-directory \
		clean-build-comp-site-react-build-build \
		_build-comp-site-react-build-build
#endregion

#region Comp-Sites Prebuild
clean-prebuild-comp-sites:
	rm -rf ./build/comp-site/react/site-prebuild

_prebuild-comp-sites:
	npx tsc -p ./src/comp-site/tsconfig-prebuilds.json

prebuild-comp-sites:
	@$(MAKE) --no-print-directory \
		clean-prebuild-comp-sites \
		_prebuild-comp-sites
	cp ./src/comp-site/react/index.html ./build/comp-site-prebuilds/react-index.html

build-comp-site-react-dev:
	npx env-cmd -e dev node ./build/comp-site/react/build/index.js
#endregion

#region Complete build
clean-all:
	rm -rf ./.exh && rm -rf ./build && rm -rf ./build-test

build-all:
	@$(MAKE) --no-print-directory \
		build-site-rel \
		build-api \
		build-cli-rel \
		prebuild-comp-site-react \
		prebuild-comp-site-react-sub18 \
		build-comp-site-react-build-build \
		build-comp-site-react-build
#endregion

#region Distribution
populate-dist:
	rm -rf ./dist/npm/exhibitor/lib/

	mkdir -p dist/npm/exhibitor/lib/site/server
	cp -r ./build/site/server/ ./dist/npm/exhibitor/lib/site

	mkdir -p dist/npm/exhibitor/lib/site/client
	cp -r build/site/client/ dist/npm/exhibitor/lib/site

	mkdir -p dist/npm/exhibitor/lib/api
	cp -r build/api/ dist/npm/exhibitor/lib

	mkdir -p dist/npm/exhibitor/lib/cli
	cp -r build/cli/cli/ dist/npm/exhibitor/lib

	mkdir -p dist/npm/exhibitor/lib/comp-site/react/build
	cp -r build/comp-site/react/build/ dist/npm/exhibitor/lib/comp-site/react

	mkdir -p dist/npm/exhibitor/lib/comp-site/react/site-prebuild
	cp -r build/comp-site/react/site-prebuild/ dist/npm/exhibitor/lib/comp-site/react

	mkdir -p dist/npm/exhibitor/lib/comp-site/react/site-sub18-prebuild
	cp -r build/comp-site/react/site-sub18-prebuild/ dist/npm/exhibitor/lib/comp-site/react

prepublish:
	@date +%s > _time_$@.txt
	npm install
	@$(MAKE) --no-print-directory \
		check-dist-outer-npm-deps \
		lint-errors-only \
		ts-unit-tests \
		build-site-ts \
		build-all \
		populate-dist
	@printf "\n-- Total dt: $$(($$(date +%s)-$$(cat  _time_$@.txt)))\n"
	@rm _time_$@.txt
#endregion

#region Version incrementers
patch:
	@echo ${VERSION}
	@cd dist/npm/exhibitor && npm version patch > ../../../version.txt
	@cat version.txt

minor:
	@echo ${VERSION}
	@cd dist/npm/exhibitor && npm version minor > ../../../version.txt
	@cat version.txt

major:
	@echo ${VERSION}
	@cd dist/npm/exhibitor && npm version major > ../../../version.txt
	@cat version.txt
#endregion

#region NPM Publishing
npm-publish-dry:
	npm publish dist/npm/exhibitor --dry-run

npm-publish:
	npm publish dist/npm/exhibitor

npm-publish-beta:
	npm publish dist/npm/exhibitor --tag beta
#endregion

# -- Test component library watch [dev only] TODO: concurrently needs to be used here.
# build-watch-component-library:
# 	npx tsc -p ./src/cli/componentLibrary/bin/tsconfig.json

# complib:
# 	npx env-cmd -e dev node ./build/component-library-bin/cli/componentLibrary/bin/watch.js

# client:
# 	npx env-cmd -e dev node ./build/site/build/site/build/bin/watchClient.js

# server:
# 	npx env-cmd -e dev node ./build/site/build/site/build/bin/watchServer.js

# start-dev:
# 	@$(MAKE) --no-print-directory \
# 		build-site-build \
# 		build-watch-component-library
# 	npx concurrently 