# Hog
[![Generated with](https://img.shields.io/badge/generated%20with-bangular-blue.svg?style=flat-square)](https://github.com/42Zavattas/generator-bangular)

Hog is an interactive development environment that was created to assist
analysts and developers with Apache Pig script creation requiring minimal
knowledge of the language. The web application that was constructed provides a
resource for script generation, analyzing output as well as archiving scripts.
Using the Simple environment, users have drag and drop capabilities to generate
scripts. The Complex side of the application provides a development environment
that lets developers create, save and analyze output of their scripts.

# Prerequisites
## Install Java

- Mac OS

  ```
  brew cask install java
  ```

- CentOS

  ```
  yum install -y java-1.8.0-openjdk OR yum install -y java-1.7.0-openjdk
  ```

- Ubuntu

  ```
  apt-get install default-jdk
  ```

## Install [Apache Pig](https://pig.apache.org/) Client

- Mac OS

  ```
  brew install pig
  ```

- CentOS or Ubuntu
  ```
  mkdir -p /etc/pig/0.15.0 &&\
  cd /etc/pig/0.15.0 &&\
  wget -q -P /etc/pig/0.15.0 'http://apache.cs.utah.edu/pig/pig-0.15.0/pig-0.15.0.tar.gz' &&\
  tar xf pig-0.15.0.tar.gz &&\
  rm pig-0.15.0.tar.gz &&\
  chown root:root -R pig-0.15.0 &&\
  mv pig-0.15.0/* . &&\
  rm -rf pig-0.15.0 
  ```

## Install [Apache Hadoop](http://hadoop.apache.org/) Client

- Mac OS

  ```
  brew install hadoop
  ```

- CentOS or Ubuntu

  ```
  mkdir -p /etc/hadoop/2.7.1 &&\
  cd /etc/hadoop/2.7.1 &&\
  wget -q -P /etc/hadoop/2.7.1 'http://apache.cs.utah.edu/hadoop/common/hadoop-2.7.1/hadoop-2.7.1.tar.gz' &&\
  tar xf hadoop-2.7.1.tar.gz &&\
  rm hadoop-2.7.1.tar.gz &&\
  chown root:root -R hadoop-2.7.1 &&\
  mv hadoop-2.7.1/* . &&\
  rm -rf hadoop-2.7.1 
  ```

## Configure Hadoop and Pig Client to run locally or with an Exisiting Hadoop Cluster

To configure your Pig client to run locally edit the pig.properties file with this parameter:

  ```
  exectype=local
  ```
 
To configure your Hadoop and Pig clients to work with an exisiting Hadoop cluster, please follow the steps below.

Either by updating your .bashrc or be exporting enviroment variables:

- Configure Hadoop Client

  ```
  export HADOOP_HOME=/etc/hadoop/2.7.1
  export HADOOP_PREFIX=$HADOOP_HOME
  export PATH=$HADOOP_HOME/bin:$PATH 
  ```

From an exisiting Hadoop cluster, add your existing hadoop/conf/*.xml to your $HADOOP_HOME/etc/hadoop/

- Configure Pig Client

  ```
  export PIG_HOME=/etc/pig/0.15.0
  export PATH=$PIG_HOME/bin:$PATH 
  ```

To test your Hadoop client run:
	hadoop fs -ls /
This should display any files or subdirectories in HDFS from your / directory

To test your Pig client run:
	pig -x mapreduce
This will connect to HDFS and your YARN Resource Manager within the Pig grunt shell


## Install node and npm
- [Node.js](https://nodejs.org/en/) >= v6.5.0

Recommended way to install node is [NVM](https://github.com/creationix/nvm)

```
nvm install 6
```

# Clone Hog from the Github repository
```
git clone https://github.com/KeyWCorp/hog.git
cd hog
```

# Installing files
You will need to install node_modules and bower_components
(If prompted to choose a version choose the option that corresponds to hog)

```
npm run build
```
If running as root use this option

```
npm run build:root
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
npm start
```
A tab in your browser will automatically open to 'localhost:9000' with the script
running. We find the program runs best using a Chrome web browser.

