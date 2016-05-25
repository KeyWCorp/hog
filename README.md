# Hog [![Generated with](https://img.shields.io/badge/generated%20with-bangular-blue.svg?style=flat-square)](https://github.com/42Zavattas/generator-bangular)

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

# Running Hog
Open a second terminal
```
cd /path/to/hog
gulp
```
A tab in your browser will automatically open to 'localhost:9000' with the script
running. We find the program runs best using a Chrome web browser.

# Hog in docker
Install docker, service docker start, copy this dockerfile and label it Dockerfile.
```
FROM jouster/nummies
ARG cred
RUN git clone https://$cred@gitlab.com/ccis-irad/hog.git
WORKDIR /hog
RUN npm install
RUN bower install --allow-root
CMD npm prune && gulp
```
Run 'docker build --build-arg cred='GitLabUser:GitLabPass' -t DockerImageName path/to/Dockerfile' to build the container and then 'docker run -d -p=127.0.0.1:9000:9000 DockerImageName'
The image will build itself from an image that offloads some of the public dependencies during the build. Each time the container is ran, the container will 
update removing any un-needed dependencies before begining as so to work with development a little better. The image will take around 8 minutes to build but to update should simply take 
a simple command.
