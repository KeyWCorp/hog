REGISTER /home/maparco/jars/datafu.jar
REGISTER /home/maparco/jars/parquet-pig-bundle-1.6.0.jar
DEFINE PageRank datafu.pig.linkanalysis.PageRank('alpha','0.87','dangling_nodes','true');

--Load tcpdump sensor data with geo enrichment
data = LOAD 'hdfs://10.1.10.26:8020/test/netflow_parquet/*.parquet' USING parquet.pig.ParquetLoader();
data = FILTER data BY direction MATCHES 'INBOUND';
data = FOREACH data GENERATE '0' AS topic, srcIP AS source, destIP AS dest, 1.0 AS weight:double;
data = FILTER data BY (source IS NOT NULL) OR (dest IS NOT NULL);
topic_edges = DISTINCT data;

source = FOREACH topic_edges GENERATE source;
dest = FOREACH topic_edges GENERATE dest;
source = DISTINCT source;
dest = DISTINCT dest;
source = RANK source;
dest = RANK dest;

topic_edges_source = JOIN topic_edges BY source, source BY source;
topic_edges_source = FOREACH topic_edges_source GENERATE topic_edges::topic AS topic, source::rank_source AS source, topic_edges::weight AS weight, topic_edges::source AS ipSrc, topic_edges::dest AS ipDest;
topic_edges_dest = JOIN topic_edges_source BY ipDest, dest BY dest;
topic_edges_dest = FOREACH topic_edges_dest GENERATE topic_edges_source::topic AS topic, topic_edges_source::source AS source, dest::rank_dest AS dest, topic_edges_source::weight AS weight, topic_edges_source::ipSrc AS ipSrc, dest::dest AS ipDest;

topic_edges = FOREACH topic_edges_dest GENERATE (chararray)topic,(int)source,(int)dest,(double)weight,(chararray)ipSrc,(chararray)ipDest;
topic_edges_grouped = FOREACH (GROUP topic_edges BY (topic,source)) GENERATE group.topic AS topic, group.source AS source, topic_edges.(dest,weight) AS edges;

topic_ranks = FOREACH (GROUP topic_edges_grouped BY topic) GENERATE group AS topic,FLATTEN(PageRank(topic_edges_grouped.(source,edges))) AS (source,rank);

topic_ranks = FOREACH topic_ranks GENERATE topic, source, (rank*100) AS rank;
topic_ranks = JOIN topic_ranks BY source, source BY rank_source;
topic_ranks = FOREACH topic_ranks GENERATE source::source AS ipSrc, topic_ranks::rank AS rank;
topic_ranks = ORDER topic_ranks BY rank DESC;
DUMP topic_ranks;