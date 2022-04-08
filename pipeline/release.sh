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
yarn docs
echo "Docs have been built"

echo "Pushing updated docs to master"
git fetch upstream
git checkout master
git add docs
git commit -a -m "docs: update docs [skip ci]"
git push upstream master
echo "Docs pushed to master"