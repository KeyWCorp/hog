load1 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' USING PigStorage(' ') AS (x:int, y:int);
DUMP load1;
