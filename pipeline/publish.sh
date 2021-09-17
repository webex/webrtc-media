#!/bin/bash -e
source ~/.nvm/nvm.sh
nvm use

if [ -f $HOME/.npmrc ]; then
    rm $HOME/.npmrc
fi

cat >$HOME/.npmrc <<EOL
@webex:registry=https://engci-maven.cisco.com/artifactory/api/npm/webex-npm-group/
//engci-maven.cisco.com/artifactory/api/npm/webex-release-npm/:_password=${ARTIFACTORY_TOKEN}
//engci-maven.cisco.com/artifactory/api/npm/webex-release-npm/:username=webex-jenkins.gen
//engci-maven.cisco.com/artifactory/api/npm/webex-release-npm/:email=webex-jenkins.gen@cisco.com
//engci-maven.cisco.com/artifactory/api/npm/webex-release-npm/:always-auth=true
EOL

echo "--------------------------------------------------"
echo "Publishing code..."

npm publish

echo "--------------------------------------------------"
echo "Code has been published"
