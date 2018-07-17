SRC=$(shell find src/ -type f -name '*.ts')
BIN=dist/background.js
NODE_MODULES=node_modules/.makets

.PHONY: build
build: $(BIN)

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: cleanall
cleanall: clean
	rm -rf NODE_MODULES

.PHONY: test
test: $(NODE_MODULES)
	npm run test

# Other tasks

$(BIN): $(SRC) $(NODE_MODULES) webpack.config.js
	npm run build

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)
