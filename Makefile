SRC_DIR	 ?= src
REL_DIR	 ?= rel

.PHONY: deps dev mock rel build_mock build_dev build_prod doc clean test test_xunit_output pull_onedata_gui_common push_onedata_gui_common

all: dev

dev: deps build_dev

mock: deps build_mock

rel: deps build_prod

test: deps run_tests

test_xunit_output: deps run_tests_xunit

deps:
	cd $(SRC_DIR) && npm install --no-package-lock
	cd $(SRC_DIR) && bower install --allow-root

build_mock:
	cd $(SRC_DIR) && ember build --environment=development --output-path=../$(REL_DIR)

build_dev:
	cd $(SRC_DIR) && ember build --environment=development-backend --output-path=../$(REL_DIR)

build_prod:
	cd $(SRC_DIR) && ember build --environment=production --output-path=../$(REL_DIR)

doc:
	jsdoc -c $(SRC_DIR)/.jsdoc.conf $(SRC_DIR)/app

clean:
	cd $(SRC_DIR) && rm -rf node_modules bower_components dist tmp ../$(REL_DIR)/*

run_tests: deps
	cd $(SRC_DIR) && xvfb-run ember test

run_tests_xunit: deps
	cd $(SRC_DIR) && xvfb-run ember test -r xunit

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

