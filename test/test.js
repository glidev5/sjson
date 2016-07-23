
var assert=require("assert");
var sjson=require(__dirname+"/../sjson.js").sjson;

it("should be able to run normally",function(done){
  done();
})

it("should be able to parse a normal json",function(done){
  var target={a:1,b:2,c:3};
  var result=JSON.stringify(sjson.parseJSON(target));
  console.log(result)
  assert.equal(result,'{"a":1,"b":2,"c":3,"recursion":1,"globalSpace":{"sjson":{}}}')
  done();
})

it("should be able to parse a normal json",function(done){
  var target={a:1,b:2,c:3};
  var result=JSON.stringify(sjson.cleanJSON(sjson.parseJSON(target)));
  console.log(result)
  assert.equal(result,'{"a":1,"b":2,"c":3}')
  done();
})

it("should be able to parse function",function(done){
  var target={
    a:1,
    b:2,
    theplusfunction:"#!function \
    return o.a+o.b;"
  }
  var result1=sjson.parseJSON({sjson:target}).sjson;
  console.log(result1)
  var result2=result1.theplusfunction(target); 
  console.log(result2)
  assert.equal(result2,3);
  done();
})
