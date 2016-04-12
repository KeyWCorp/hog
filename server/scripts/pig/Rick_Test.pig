A = LOAD '/Users/kmcoxe/Documents/IPI/pig-parser/src/test.data' AS (numbers:int);                                                    
B = GROUP A ALL;                                                                                                                     
C = FOREACH B GENERATE SUM(A.numbers) AS count, MIN(A.numbers) as minimum, MAX(A.numbers) AS maximum, AVG(A.numbers) AS average;     
D = FOREACH B GENERATE MIN(A.numbers) as minimum, MAX(A.numbers) AS maximum;                                                         
E = FOREACH B GENERATE SUM(A.numbers) AS count, AVG(A.numbers) AS average;                                                           
                                                                                                                                     
EXPLAIN C;                                                                                                                           
EXPLAIN D;                                                                                                                           
                                                                                                                                     
DESCRIBE C;                                                                                                                          
DESCRIBE D;                                                                                                                          
DESCRIBE E;                                                                                                                          
                                                                                                                                     
DUMP C;                                                                                                                              
DUMP D;                                                                                                                              
DUMP E;