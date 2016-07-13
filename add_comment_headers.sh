#!/bin/bash

####################
#
# parameters:
#   --ignore-dir=directory_to_ignore
#   --comment-file=file_with_comments
#   --file-type=js
#
#######

FILE_TYPE="js";

#
# look at input parameters
#
for i in "$@"; do
  case $i in
    --ignore-dir=*)
      if [[ $i =~ --ignore-dir=(.*) ]];
      then
        IGNORE_DIR=${BASH_REMATCH[1]};
      fi
    ;;
    --comment-file=*)
      if [[ $i =~ --comment-file=(.*) ]];
      then
        COMMENT_FILE=${BASH_REMATCH[1]};
      fi
    ;;
    --file-type=*)
      if [[ $i =~ --file-type=(.*) ]];
      then
        FILE_TYPE=${BASH_REMATCH[1]};
      fi
    ;;
  esac
done


#
# check to see if IGNORE_DIR exists
#
if [[ $IGNORE_DIR ]];
then
  files=($(find -E . -type f -regex "^.*[^${IGNORE_DIR}]\.${FILE_TYPE}$"))
else
  files=($(find -E . -type f -regex "^.*\.${FILE_TYPE}$"))
fi

#
# add comment to files
#
for item in ${files[*]}
do
  if [[ $COMMENT_FILE ]];
  then
    printf "adding comment header to %s\n" $item
    cat $COMMENT_FILE | cat - $item > temp && mv temp $item;
  else
    printf "adding comment header to %s\n" $item
    cat comments.txt | cat - $item > temp && mv temp $item;
  fi
done

unset IGNORE_DIR
