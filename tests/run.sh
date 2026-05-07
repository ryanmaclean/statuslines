#!/usr/bin/env sh
# Run the statuslines test suite.
# Usage: sh tests/run.sh  OR  npm test
set -e
node --test tests/statuslines.test.js
