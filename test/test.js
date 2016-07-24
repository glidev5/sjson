var assert = require("assert");
var sjson = require(__dirname + "/../sjson.js").sjson;

it("should be able to run normally", function(done) {
    done();
})

it("should be able to parse a normal json", function(done) {
    var target = {
        a: 1,
        b: 2,
        c: 3
    };
    var result = JSON.stringify(sjson.parseJSON({
        sjson: target
    }).sjson);
    console.log(result)
    assert.equal(result, '{"a":1,"b":2,"c":3}')
    done();
})

it("should be able to parse function", function(done) {
    var target = {
        a: 1,
        b: 2,
        theplusfunction: "#!function \
    return o.a+o.b;"
    }
    var result1 = sjson.parseJSON({
        sjson: target
    }).sjson;
    console.log(result1)
    var result2 = result1.theplusfunction(target);
    console.log(result2)
    assert.equal(result2, 3);
    done();
})

it("should be able to parse nested function", function(done) {
    var target = {
        a: 1,
        b: 2,
        theplusfunction: "#!function return o.a+o.b",
        c: "#!reference theplusfunction", // c reference target.a
        d: "#!reference e",
        e: {
            f: {
                g: 123
            }
        }
    }
    var result1 = sjson.parseJSON({
        sjson: target
    }).sjson;
    console.log(result1)
    console.log(result1.d[0].f.g)
    var result2 = result1.c[0](target);
    console.log(result2)
    assert.equal(result2, 3);
    assert.equal(result1.d[0].f.g, 123);
    done();
})

it("should be able to reference sjson file", function(done) {
    var target = {
        a: 1,
        b: 2,
        c: "#!file test/data.sjson"
    };
    var result = sjson.parseJSON({
        sjson: target
    }).sjson;
    var result2=result.c(target)
    console.log(result)
    console.log(result2)
    assert.equal(result2, 5)
    done();
})
