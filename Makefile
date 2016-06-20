REPORTER =  spec
MOCHA_OPTS = --compilers js:babel-core/register

current:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/current/*.js

api:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/api/*.js

save:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/save/*.js

cliui:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/cliui/*.js

main:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/*.js

import-export:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/import-export/*.js

userauth-security:
	clear
	./node_modules/.bin/mocha  --reporter $(REPORTER) $(MOCHA_OPTS) test/userauth-security/*.js


.ALL: api save cliui main import-export userauth-security