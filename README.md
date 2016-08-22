# Hog
[![Generated with](https://img.shields.io/badge/generated%20with-bangular-blue.svg?style=flat-square)](https://github.com/42Zavattas/generator-bangular)

Hog is an interactive development environment that was created to assist
analysts and developers with Apache Pig script creation requiring minimal
knowledge of the language. The web application that was constructed provides a
resource for script generation, analyzing output as well as archiving scripts.
Using the Simple environment, users have drag and drop capabilities to generate
scripts. The Complex side of the application provides a development environment
that lets developers create, save and analyze output of their scripts.


# To begin the progam:

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
# Clone Hog from the Gitlab repository
```
git clone hog
cd hog
```

# Installing files
You will need to install node_modules and bower_conponents
(If prompted to choose a version choose the option that coorisponds to hog)
```
npm install
bower install
```

# Copying extra files
```
cp client/externals/mode-pig_latin.js client/bower_components/ace-builds/src-min-noconflict/.
```
# If you have an older version of hog run the DB migrate
```
gulp migrate
mv /path/to/hog/server/api/pig/pig.data.db.mig /path/to/hog/server/api/pig/pig.data.db
mv /path/to/hog/server/api/settings/settings.data.db.mig /path/to/hog/server/api/settings/settings.data.db
```
Move others as needed.


# Running Hog
Open a second terminal
```
cd /path/to/hog
gulp
```
A tab in your browser will automatically open to 'localhost:9000' with the script
running. We find the program runs best using a Chrome web browser.

