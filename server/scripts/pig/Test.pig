A = LOAD 'file:/home/xadmin/Downloads/work/hog/datatest/test.data' AS (one:int,two:int,three:int);
B = FILTER A BY one > 55;
DUMP B;