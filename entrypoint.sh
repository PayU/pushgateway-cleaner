#!/bin/bash
# set -e

# version=$(cat package.json \
# | grep version \
# | head -1 \
# | awk -F: '{ print $2 }' \
# | sed 's/[",]//g')

# echo "::set-output name=version::$version"

exec npm run start