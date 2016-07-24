var _=require("lodash");
var jp = require('jsonpath');

// in: o  option
// in: o: [recursion] default to 1
// in: o: sjson object containing sjson function in text format
// in: o: globalSpace   the environment where the functions are realized
// out: o output
// out: o: o.sjson[index]  function
// out: o: o.sjson[index_bak] backup of function in text format
// out: o: o.recrusion  recursion level

var sjson = {};
var that=this;
sjson.parseJSON = function(o) {
  try{
    // recursion is default to 1. It tracks how many recursion is nested
    if (!o.recursion) {
        o.recursion = 1;
    }

    if(!o.depth){
      o.depth=32;
    }

    // attach global space to o, remove if not needed
    // you can replace globalSpace with another scope,
    // global space is used in eval function below
    if(!o.globalSpace){
      o.globalSpace=that;
    }

    _.each(o.sjson, function(value, index) {
      try{
        // if value contains #!function
        if (_.isString(value) && value.indexOf("#!function") !== -1) {
          o.sjson[index+"_bak"]=value;
          value = value.replace("#!function", "");
          // this line converts function from text to actual function.
          // function have o,cb where o is option and cb is callback
          o.sjson[index] = eval("(function(o,cb){" + value + "})", o.globalSpace);
        }

        // if value contains #!reference
        if (_.isString(value) && value.indexOf("#!reference") !== -1&&o.recursion<=o.depth) {  // this is limit for cyclic redundancy depth
          value = value.replace("#!reference", "").trim();
          // this following script is subject to change. It allows cyclic reference being realized using jsonpath pathing algorithm
          o.sjson[index] = sjson.parseJSON({
              sjson: jp.query(o.sjson, value),  // see jsonpath module for clues
              recurson: o.recurson + 1
          }).sjson;
        }

        // if recursion is bigger than 4, skip further recursion
        if (_.isObject(value) && o.recursion <= o.depth) {  // this is limit for json depth
            o.sjson[index] = sjson.parseJSON({
                sjson: value,
                recurson: o.recurson + 1
            }).sjson;
        }
      }catch(e){
        console.log(e);
      }
    })
    return o;
  }
  catch(e){
    console.log(e);
  }
}

sjson.cleanJSON=function(o){
  delete o.recursion;
  delete o.globalSpace;
  return o;
}

exports.sjson = sjson;
