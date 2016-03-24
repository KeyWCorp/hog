A = LOAD 'file:///Users/rick/Desktop/HOG/hog2/hog/test.data' AS (one:int,two:int,three:int);
B = FILTER A BY one > 1;
DUMP B;