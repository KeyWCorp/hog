# Hog
[![Generated with](https://img.shields.io/badge/generated%20with-bangular-blue.svg?style=flat-square)](https://github.com/42Zavattas/generator-bangular)
[![build status](https://gitlab.com/ccis-irad/hog/badges/development/build.svg?style=flat-square)](https://gitlab.com/ccis-irad/hog/commits/development)
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
git clone https://gitlab.com/ccis-irad/hog.git
cd hog
```
# Optional: Install hog from an RPM
```
rpm -Uvh hog-<VERSION>.x86_64.rpm
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

# Building Hog RPM
Make any desired changes in your package.json (rpm builds from there).
Make sure that you are compiling on a Linux environment, or modify the gulpfile
rpm task to ensure that you compile the RPM on the right architecture.
Gulp Brass currently only supports x86_64 architectures.
```
gulp rpm
```
A new RPM will be located in /path/to/hog/brass_build/RPMS/
