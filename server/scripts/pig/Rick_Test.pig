A = LOAD 'file:///opt/kevins/new/hog/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;