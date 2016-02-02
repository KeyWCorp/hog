A = LOAD 'file:///root/Downloads/workIrad/data/test.data' USING PigStorage(',') AS (one:int,two:int,three:int);
B = FILTER A BY one > 4;
DUMP B;