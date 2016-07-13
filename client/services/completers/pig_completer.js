/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')
.service('PigCompleter',
    function ()
    {
      var staticWordCompleter = {
        /**
         * Description
         * @method getCompletions
         * @param {} editor
         * @param {} session
         * @param {} pos
         * @param {} prefix
         * @param {} callback
         */
        getCompletions: function(editor, session, pos, prefix, callback) {
          var wordList = [
          {data: "AS", type: "keyword"},
          {data: "BY", type: "keyword"},
          {data: "USING", type: "keyword"},

          {data: "COGROUP", type: "Relational Operator"},
          {data: "CROSS", type: "Relational Operator"},
          {data: "DISTINCT", type: "Relational Operator"},
          {data: "FILTER", type: "Relational Operator"},
          {data: "FOREACH", type: "Relational Operator"},
          {data: "GROUP", type: "Relational Operator"},
          {data: "JOIN", type: "Relational Operator"},
          {data: "LIMIT", type: "Relational Operator"},
          {data: "LOAD", type: "Relational Operator"},
          {data: "MAPREDUCE", type: "Relational Operator"},
          {data: "ORDER", type: "Relational Operator"},
          {data: "SAMPLE", type: "Relational Operator"},
          {data: "SPLIT", type: "Relational Operator"},
          {data: "STORE", type: "Relational Operator"},
          {data: "STREAM", type: "Relational Operator"},
          {data: "UNION", type: "Relational Operator"},

          {data: "DESCRIBE", type: "Diagnostic Operator"},
          {data: "DUMP", type: "Diagnostic Operator"},
          {data: "EXPLAIN", type: "Diagnostic Operator"},
          {data: "ILLUSTRATE", type: "Diagnostic Operator"},

          {data: "AVG", type: "Eval Functions"},
          {data: "CONCAT", type: "Eval Functions"},
          {data: "Example", type: "Eval Functions"},
          {data: "COUNT", type: "Eval Functions"},
          {data: "COUNT_STAR", type: "Eval Functions"},
          {data: "DIFF", type: "Eval Functions"},
          {data: "IsEmpty", type: "Eval Functions"},
          {data: "MAX", type: "Eval Functions"},
          {data: "MIN", type: "Eval Functions"},
          {data: "SIZE", type: "Eval Functions"},
          {data: "SUM", type: "Eval Functions"},
          {data: "TOKENIZE", type: "Eval Functions"},

          {data: "ABS", type: "Math Functions"},
          {data: "ACOS", type: "Math Fnctions"},
          {data: "ASIN", type: "Math Fnctions"},
          {data: "ATAN", type: "Math Fnctions"},
          {data: "CBRT", type: "Math Fnctions"},
          {data: "CEIL", type: "Math Fnctions"},
          {data: "COSH", type: "Math Fnctions"},
          {data: "COS", type: "Math Functions"},
          {data: "EXP", type: "Math Functions"},
          {data: "FLOOR", type: "Math Functions"},
          {data: "LOG", type: "Math Functions"},
          {data: "LOG10", type: "Math Functions"},
          {data: "RANDOM", type: "Math Fnctions"},
          {data: "ROUND", type: "Math Functions"},
          {data: "SIN", type: "Math Functions"},
          {data: "SINH", type: "Math Fnctions"},
          {data: "SQRT", type: "Math Fnctions"},
          {data: "TAN", type: "Math Functions"},
          {data: "TANH", type: "Math Fnctions"},

          {data: "TOBAG", type: "Bag and Tuple Functions"},
          {data: "TOP", type: "Bag and Tuple Functions"},
          {data: "TOTUPLE", type: "Bag and Tuple Functions"},

          {data: "INDEXOF", type: "String Functions"},
          {data: "LAST_INDEX_OF", type: "String Functions"},
          {data: "LCFIRST", type: "String Functions"},
          {data: "LOWER", type: "String Functions"},
          {data: "REGEX_EXTRACT", type: "String Functions"},
          {data: "REGEX_EXTRACT_ALL", type: "String Functions"},
          {data: "REPLACE", type: "String Functions"},
          {data: "STRSPLIT", type: "String Functions"},
          {data: "SUBSTRING", type: "String Functions"},
          {data: "TRIM", type: "String Functions"},
          {data: "UCFIRST", type: "String Functions"},
          {data: "UPPER", type: "String Functions"},

          {data: "Handling Compression", type: "Load/Storage Functions"},
          {data: "BinStorage", type: "Load/Storage Functions"},
          {data: "PigStorage", type: "Load/Storage Functions"},
          {data: "PigDump", type: "Load/Storage Functions"},
          {data: "TextLoader", type: "Load/Storage Functions"},

          {data: "DEFINE", type: "UDF Statements"},
          {data: "REGISTER", type: "UDF Statements"},
          ];
          callback(null, wordList.map(function(word) {
            return {
              caption: word.data,
              value: word.data,
              meta: word.type
            };
          }));
        }
      }

      return staticWordCompleter;
    });
