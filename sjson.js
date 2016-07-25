var _ = require("lodash");
var jp = require('jsonpath-plus');
var fs = require("fs");


// in: o  option
// in: o: [recursion] default to 1
// in: o: sjson object containing sjson function in text format
// in: o: globalSpace   the environment where the functions are realized
// out: o output
// out: o: o.sjson[index]  function
// out: o: o.sjson[index_bak] backup of function in text format
// out: o: o.recrusion  recursion level


var that = this;
var sjson = (function() {
  // convert string sjson to object sjson
    function parseJSON(o) {
        try {
            // recursion is default to 1. It tracks how many recursion is nested
            if (!o.recursion) {
                o.recursion = 1;
            }

            if (!o.depth) {
                o.depth = 512;
            }

            // attach global space to o, remove if not needed
            // you can replace globalSpace with another scope,
            // global space is used in eval function below
            if (!o.globalSpace) {
                o.globalSpace = that;
            }

            _.each(o.sjson, function(value, index) {
                try {
                  // handles #!file   see test/data.sjson for example
                    if (_.isString(value) && value.indexOf("#!file") !== -1) {
                        value = value.replace("#!file", "").trim();
                        var file = fs.readFileSync(value).toString().replace("#!function","").trim();
                        value = "#!function  " + file;
                    }

                    // if value contains #!function
                    if (_.isString(value) && value.indexOf("#!function") !== -1) {
                        o.sjson[index + "_bak"] = value;
                        value = value.replace("#!function", "").trim();
                        // this line converts function from text to actual function.
                        // function have o,cb where o is option and cb is callback
                        value = o.sjson[index] = eval("(function(o,cb){" + value + "})", o.globalSpace);
                        try{
                          value = o.sjson[index]=value();
                        }catch(e){
                          //console.log(e)
                        }
                        try{
                          value = o.sjson[index]=JSON.parse(value);
                        }catch(e){
                          //console.log(e)
                        }
                    }

                    // if value contains #!reference
                    if (_.isString(value) && value.indexOf("#!reference") !== -1 && o.recursion <= o.depth) { // this is limit for cyclic redundancy depth
                        value = value.replace("#!reference", "").trim();
                        // this following script is subject to change. It allows cyclic reference being realized using jsonpath pathing algorithm
                        value = o.sjson[index] = sjson.parseJSON({
                            sjson: jp({
                                json: o.sjson,
                                path: value
                            }), // see jsonpath module for clues
                            recurson: o.recurson + 1
                        }).sjson;
                    }

                    // iterate through sub properties
                    // if recursion is bigger than 4, skip further recursion
                    if (_.isObject(value) && o.recursion <= o.depth) { // this is limit for json depth
                        value = o.sjson[index] = sjson.parseJSON({
                            sjson: value,
                            recurson: o.recurson + 1
                        }).sjson;
                    }
                } catch (e) {
                    console.log(e);
                }
            })
            return o;
        } catch (e) {
            console.log(e);
        }
    }

    function remake(o){
      // remake function using function_bak
      // in: [globalSpace]
      // in: o.value    content of the function in string
      // in: o.index    name of the output function
      // in: o.sjson    object to attach the o.index o.value pair
      // output: o.sjson[index]  actual function in function format
      // output: o.sjson[index_bak]  bak function in string
      // output: o.sjson
      // output: o
      try{
        o.sjson=o.sjson||{};
        o.globalSpace=o.globalSpace||that;
        o.index=o.index||"function";
        o.value=o.sjson[o.index].replace("#!function","").trim()||"return null";
        o.sjson[o.index] = eval("(function(o,cb){" + o.value + "})", o.globalSpace);
        o.sjson[o.index+"_bak"]="#!function "+o.value;
      }catch(e){
        console.log(e);
      }
      return o;
    }

    function parse(o){
      // cleans up the #!function into clean normal source code
      // in: o.value    #!function
      // out: o.function   normal function in string
      o.value=o.value||"return null";
      o.function=o.value.replace("#!function","").trim();
      o.function="(function(o,cb){" + o.function + "})";
      return o;
    }

    return {
        parseJSON: parseJSON,
        remake:remake,
        parse:parse
    };
}())

exports.sjson = sjson;
