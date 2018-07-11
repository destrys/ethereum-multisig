#
# == Paths & Directories ==
#

ROOT_DIR  := $(shell pwd)
NODE_DIR  := $(ROOT_DIR)/node_modules
VENV_DIR := .virtualenv

#
# == Configuration ==
#

TESTRPC_PORT ?= 8545
DAPP_PORT    ?= 8435

#
# == Commands ==
#

MKDIR      := mkdir -p
LN         := ln
FIND       := find
NPM        := npm
NODE       := node
TRUFFLE    := $(NODE_DIR)/truffle/build/cli.bundled.js
TESTRPC    := $(NODE_DIR)/ethereumjs-testrpc/build/cli.node.js
BROWSERIFY := $(NODE_DIR)/browserify/bin/cmd.js
SERVE      := $(NODE_DIR)/serve/bin/serve.js
PIP        := $(VENV_DIR)/bin/pip
MYTH       := $(VENV_DIR)/bin/myth
SOLIUM     := $(NODE_DIR)/solium/bin/solium.js
PYTHON3    := $(shell command -v python3 2> /dev/null)

#
# == DAPP ==
#

FONTS := $(NODE_DIR)/font-awesome/fonts/*

CSS := $(NODE_DIR)/bootstrap/dist/css/bootstrap.min.css $(NODE_DIR)/tether/dist/css/tether.min.css $(NODE_DIR)/font-awesome/css/font-awesome.min.css $(NODE_DIR)/highlightjs/styles/default.css
CSS += dapp/css/cards.css

JS := $(NODE_DIR)/jquery/dist/jquery.js $(NODE_DIR)/bootstrap/dist/js/bootstrap.js $(NODE_DIR)/tether/dist/js/tether.js $(NODE_DIR)/highlightjs/highlight.pack.js
JS += dapp/js/requires.js dapp/js/utils.js dapp/js/connection.js dapp/js/bip32.js dapp/js/create.js dapp/js/spend.js

JS_BROWSERIFY := -r web3 -r highlightjs-solidity -r sha.js -r @ledgerhq/hw-app-eth -r @ledgerhq/hw-transport-u2f

#
# == Top-Level Targets ==
#

default: contract dapp

dependencies: js-dependencies-prod

dependencies-all: js-dependencies-all python-dependencies

contract: build/contracts/MultiSig2of3.json

dapp: images fonts css js html

clean:
	rm -rf public/*
	rm -rf tmp/*

purge: clean
	rm -rf $(NODE_DIR)

testrpc:
	$(TESTRPC) --port $(TESTRPC_PORT)

server:
	cd public && $(SERVE) -T -p $(DAPP_PORT)

freeze:
	$(NPM) shrinkwrap
	$(PIP) freeze > requirements.frozen.txt

#
# == Contract ==
#

build/contracts/MultiSig2of3.json: contracts/MultiSig2of3.sol
	$(TRUFFLE) compile

#
# == DAPP ==
#

images:
	mkdir -p public/images
	cp -R dapp/images/* public/images

fonts:
	mkdir -p public/fonts
	cp $(FONTS) public/fonts

css:
	mkdir -p public/css
	cat $(CSS) > public/css/dapp.css

js: tmp/MultiSig2of3.js tmp/bundle.js $(JS)
	mkdir -p public/js
	cat tmp/MultiSig2of3.js tmp/bundle.js $(JS) > public/js/dapp.js

tmp/MultiSig2of3.js: build/contracts/MultiSig2of3.json
	printf "var MultiSig2of3Compiled = " > tmp/MultiSig2of3.js
	cat build/contracts/MultiSig2of3.json >> tmp/MultiSig2of3.js
	echo "" >> tmp/MultiSig2of3.js

tmp/bundle.js:
	$(BROWSERIFY) $(JS_BROWSERIFY) > tmp/bundle.js

html:
	$(NODE) scripts/build.js

#
# == Dependencies ==
#

js-dependencies-all:
	npm install

js-dependencies-prod:
	npm install --only=production

$(VENV_DIR):
	$(PYTHON3) -m venv $(VENV_DIR)

python-dependencies: $(VENV_DIR)
	 $(PIP) install -r requirements.frozen.txt

#
# == Testing ==
#

test:
	./scripts/test

myth:
	$(MYTH) -g tmp/myth.json -t -x contracts/MultiSig2of3.sol

solium:
	$(SOLIUM) -d contracts/


.PHONY: test compile
