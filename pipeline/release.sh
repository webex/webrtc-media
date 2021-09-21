#!/bin/bash -e
source ~/.nvm/nvm.sh
nvm use

echo "--------------------------------------------------"
echo "Releasing code..."
yarn release
echo "--------------------------------------------------"
echo "Code has been released"

echo "--------------------------------------------------"
echo "Building docs..."
yarn docs && yarn docs:publish
