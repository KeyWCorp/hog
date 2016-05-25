load0 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' USING PigStorage(' ') AS (x:int, y:int);
sum1group = GROUP load0 BY x;
sum1 = FOREACH sum1group GENERATE SUM(load0.x) AS x;
DUMP sum1;
