A = LOAD 'file:///Users/kmcoxe/Documents/IPI/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;