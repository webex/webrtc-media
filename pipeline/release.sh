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
git remote set-url origin https://webex-jenkins.gen:$GITHUB_TOKEN@sqbu-github.cisco.com/WebExSquared/webrtc-media-core.git
git fetch origin
git add docs
git commit -a -m "docs: update docs [skip ci]"
git push origin HEAD:master
git remote set-url origin https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core.git
echo "Docs pushed to master"