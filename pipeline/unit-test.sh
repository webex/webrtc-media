#!/bin/bash -e
source ~/.nvm/nvm.sh
nvm use

echo "--------------------------------------------------"
echo "Running linter..."
yarn lint

echo "--------------------------------------------------"
echo "Running unit tests..."
yarn test
