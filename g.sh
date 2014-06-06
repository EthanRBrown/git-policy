#!/bin/bash
git-policy "$@" || exit $?
git "$@"
