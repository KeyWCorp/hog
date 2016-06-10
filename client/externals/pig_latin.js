ace.define("ace/snippets/pig_latin",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText = "
snippet loadpigstorage
  A = LOAD '${1:what}' USING PigStorage() AS (
    ${2:var_name}:${3:var_type}
  );
snippet loadhcat
  A = LOAD '${1:table}' USING org.apache.hcatalog.pig.HCatLoader();
snippet loadhbase
  A = LOAD 'hbase://${1:table}' USING org.apache.pig.backend.hadoop.hbase.HBaseStorage('${2:columnlist}');
";

exports.scope = "pig_latin";

});
