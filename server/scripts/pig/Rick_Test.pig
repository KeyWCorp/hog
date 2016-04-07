A = LOAD 'file:///opt/kevins/hog/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;