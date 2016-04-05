A = LOAD 'file:///Users/rick/Desktop/HOG/hog2/hog/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;