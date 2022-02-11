#!/bin/bash -e
source ~/.nvm/nvm.sh
nvm use

HUSKY=0 # Skip Husky in CI

echo '_auth = ${ARTIFACTORY_TOKEN}
email = webex-jenkins.gen@cisco.com
always-auth = true' >> .npmrc

source ./pipeline/set-npmrc-path.sh

echo "--------------------------------------------------"
echo "Releasing code..."
yarn release
echo "--------------------------------------------------"
echo "Code has been released"

echo "--------------------------------------------------"
echo "Building docs..."
yarn docs && yarn docs:publish
