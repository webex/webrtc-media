#!/bin/bash -e
if [ -f ./.npmrc ]; then
    rm ./.npmrc
fi
unset NPM_CONFIG_USERCONFIG
