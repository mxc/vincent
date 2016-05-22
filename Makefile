REPORTER =  spec
MOCHA_OPTS = --compilers js:babel-core/register

current:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/current/*.js

cliui:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/cliui/*.js

main:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/*.js

.ALL: main cliui current