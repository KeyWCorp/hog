load1 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' USING PigStorage(' ') AS (x:int, y:int);
sum2group = GROUP load1 BY x;
sum2 = FOREACH sum2group GENERATE SUM(load1.x) AS x;
DUMP sum2;
