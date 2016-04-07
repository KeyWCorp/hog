A = LOAD 'file:///Users/kmcoxe/Documents/IPI/new/hog/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;