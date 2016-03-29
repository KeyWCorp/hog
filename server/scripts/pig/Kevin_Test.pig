A = LOAD 'file:///Users/kmcoxe/Projects/hog/test.data' AS (one:int,two:int,three:int);
B = FILTER A BY one > 1;
DUMP B;