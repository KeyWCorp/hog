A = LOAD 'file:///opt/kevins/hogDemo/hog/test.data' USING PigStorage(',') AS (one:chararray,two:float);
DUMP A;