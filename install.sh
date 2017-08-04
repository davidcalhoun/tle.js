rm -rf dist || true
mkdir dist || true

../babel-cli/bin/babel.js tle.js --out-file dist/tle.js
../uglify-es/bin/uglifyjs -ecma=5 -o dist/tle-min.js dist/tle.js