A = LOAD 'file:///home/xadmin/Downloads/work/datatest/test.data' USING PigStorage(',') AS (one:int,two:int,three:int);
B = FILTER A BY one > 1;
DUMP B;