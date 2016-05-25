
load0 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' USING PigStorage(' ') AS (x:int, y:int);
group1 = GROUP load0 BY x;
DUMP group1;