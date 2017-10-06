mkdir dist || true

alias babel="npm-exec babel-cli"

$(npm bin)/babel tle.js --out-file dist/tle.js
$(npm bin)/babel tle-utils.js --out-file dist/tle-utils.js
$(npm bin)/uglifyjs dist/tle.js dist/tle-utils.js -ecma=5 -o dist/tle-min.js