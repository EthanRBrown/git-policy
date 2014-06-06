@echo off
git-policy %*
IF ERRORLEVEL 1 EXIT 1
git %*
