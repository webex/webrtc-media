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
git config --global user.name "jenkins-docs-publisher"
git config --global user.email "webex-jenkins.gen"
git remote set-url origin https://webex-jenkins.gen:$GITHUB_TOKEN@sqbu-github.cisco.com/WebExSquared/webrtc-media-core.git
git fetch origin
git checkout -b documentation
git add ./docs ./samples/bundle.js -f
FILE_COUNT=$(git status -s | wc -l | xargs)
if [[ $FILE_COUNT != '0' ]]
then
echo "Found $FILE_COUNT changed docs and samples bundle files."
git commit -m "docs: update docs [skip ci]"
git push origin documentation -f
else
echo "Docs and samples bundle files have not changed."
echo "Docs will not be published."
fi
git remote set-url origin https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core.git
echo "Docs pushed to master"