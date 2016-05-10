# Hog [![Generated with](https://img.shields.io/badge/generated%20with-bangular-blue.svg?style=flat-square)](https://github.com/42Zavattas/generator-bangular)
'''
# To begin the progam:

Clone Hog from the Gitlab repository
```
cd into the 'hog' directory
npm install - if asked to make a selection, choose the version that is 'required by hog'
bower install - if asked to make a selection, choose the verion that is 'required by hog'
cp -p client/externals/ace.js client/bower_components/ace_builds/src-min-noconflicts/
cp -p client/externals/mode-pig_latin.js client/bower_components/ace_builds/src-min-noconflicts/
```
# Install Pig, (if you have a mac)
```
brew install pig
brew install apache piglatin
```

# Save your git credentials
[Saving email](https://help.github.com/articles/set-up-git/) and [caching your
password](https://help.github.com/articles/caching-your-github-password-in-git/).
```
git config --global user.name "YOUR NAME"
git config --global user.email "YOUR EMAIL ADDRESS"

git credential-osxkeychain
git credential-osxkeychain
brew install git
git config --global credential.helper osxkeychain
```


#	There are 2 files in the externals/ directory (ace.js and mode-pi_latin.js). Those need to be copied
#	into bower_components/ace_builds/src-min-noconflicts/ directory
#   Open a second terminal, navigate to the hog/ directory and run 'gulp'


# A tab in your browser will automatically open to 'localhost:9000' with the script
# running. We find the program runs best using a Chrome web browser.
