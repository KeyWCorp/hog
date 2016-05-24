
load0 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' USING PigStorage(' ') AS (x:int, y:int);
size2 = FOREACH load0 GENERATE SIZE(y);
DUMP size2;
DUMP load0;