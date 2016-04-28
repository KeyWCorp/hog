A = LOAD 'file:///Users/kmcoxe/Documents/IPI/hog/node_modules/pig-parser/src/test.data' AS (numbers:int);
B = GROUP A ALL;
C = FOREACH B GENERATE SUM(A.numbers) AS count, MIN(A.numbers) as minimum;
D = FOREACH B GENERATE MIN(A.numbers) as count, MAX(A.numbers) AS minimum;
E = FOREACH B GENERATE SUM(A.numbers) AS count, AVG(A.numbers) AS minimum;

EXPLAIN C;
EXPLAIN D;

DESCRIBE C;
DESCRIBE D;
DESCRIBE E;

DUMP C;
DUMP D;
DUMP E;