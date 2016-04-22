A = LOAD 'file:///Users/rick/Desktop/HOG/hog3/hog/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;