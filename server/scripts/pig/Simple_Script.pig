
load0 = LOAD '/Users/kmcoxe/Documents/IPI/test/test.data' USING PigStorage(' ') AS (x:int, y:int, ip:chararray);
DUMP load0;
