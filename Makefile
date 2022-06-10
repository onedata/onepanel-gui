SRC_DIR	 ?= src
REL_DIR	 ?= rel

.PHONY: build_mock build_dev build_prod clean run_tests run_tests_xunit_output lint dev mock rel test test_xunit_output

all: dev

src/node_modules: src/package.json
	cd $(SRC_DIR) && npm run deps

deps: src/node_modules

build_mock:
	cd $(SRC_DIR) && ember build --environment=development --output-path=../$(REL_DIR)

build_dev:
	cd $(SRC_DIR) && ember build --environment=development-backend --output-path=../$(REL_DIR)

build_prod:
	cd $(SRC_DIR) && ember build --environment=production --output-path=../$(REL_DIR)

clean:
	cd $(SRC_DIR) && rm -rf node_modules dist tmp ../$(REL_DIR)/*

run_tests:
	cd $(SRC_DIR) && xvfb-run ember test

run_tests_xunit_output:
	cd $(SRC_DIR) && xvfb-run ember test -r xunit

lint: src/node_modules
	cd $(SRC_DIR) && npm run-script lint

dev: src/node_modules build_dev

mock: src/node_modules build_mock

rel: src/node_modules build_prod

test: src/node_modules run_tests

test_xunit_output: src/node_modules run_tests_xunit_output

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

