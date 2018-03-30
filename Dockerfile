#Set node version
FROM node:6-alpine
LABEL maintainer="KEYW Corporation" 

# JAVA JDK ______
RUN apk update \
    && apk add \
       bash \
       git \
       openjdk8 \
       wget 
      
ENV JAVA_HOME /usr/lib/jvm/default-jvm/jre
ENV PATH $PATH:$JAVA_HOME/bin 

# PIG ______
ENV PIG_VERSION 0.17.0
WORKDIR /etc/pig
RUN wget -q -P /etc/pig http://apache.cs.utah.edu/pig/pig-$PIG_VERSION/pig-$PIG_VERSION.tar.gz \
    && tar xf pig-$PIG_VERSION.tar.gz \
    && rm pig-$PIG_VERSION.tar.gz \
    && chown root:root -R pig-$PIG_VERSION \
    && mv pig-$PIG_VERSION/* . \
    && rm -rf pig-$PIG_VERSION

ENV PIG_HOME /etc/pig
ENV PATH $PATH:$PIG_HOME/bin

#HADOOP _____
ENV HADOOP_VERSION 2.7.5
WORKDIR /etc/hadoop/$HADOOP_VERSION
RUN wget -q -P . http://apache.cs.utah.edu/hadoop/common/hadoop-$HADOOP_VERSION/hadoop-$HADOOP_VERSION.tar.gz \
    && tar xf hadoop-$HADOOP_VERSION.tar.gz \
    && rm hadoop-$HADOOP_VERSION.tar.gz \
    && chown root:root -R hadoop-$HADOOP_VERSION \
    && mv hadoop-$HADOOP_VERSION/* . \
    && rm -rf hadoop-$HADOOP_VERSION

ENV HADOOP_HOME /etc/hadoop/$HADOOP_VERSION
ENV HADOOP_PREFIX $HADOOP_HOME
ENV PATH $PATH:$HADOOP_HOME/bin 
# HOG ______
WORKDIR /opt/hog

#Copy Sources
COPY package.json ./
COPY bower.json ./
COPY gulpfile.js ./
COPY tasks ./tasks
COPY server ./server
COPY client ./client

#BUILD HOG
RUN npm install -g bower gulp-cli

RUN npm run build:root

#Expose Hogs port
EXPOSE 9000

#Start HOG
CMD ["npm", "start"]
