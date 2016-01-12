A = LOAD 'file://root/Downloads/workIrad/data/test.txt' AS (one:int,two:int,three:int);
B = FILTER A BY one > 1;
DUMP B;