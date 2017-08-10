rm -rf dist || true
mkdir dist || true

alias babel="npm-exec babel-cli"

$(npm bin)/babel tle.js --out-file dist/tle.js
$(npm bin)/uglifyjs -ecma=5 -o dist/tle-min.js dist/tle.js