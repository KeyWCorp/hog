# Pig Parser

A node module that runs and parses pig scripts


## Usage

clone repo inside your project
```
cd /path/to/your/project
git clone https://gitlab.com/ccis-irad/pig-parser.git
```

Install PigParser
```
npm install pig-parser
```

Add to node project
```
var pigParser = require("pig-parser");
```

Run pig scripts and parse output
```
pigParser.run("/path/to/pig/script", stdOutFunction, stdErrorFuncton, stdLogFunction);
```
