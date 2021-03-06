# sjson

## Description:

### sjson means serializable json. It is a rudimentry module for serializable json initiatives.

```javascript
sjson means serializable json. It is a rudimentry module for serializable json initiatives.
```

### sjson is built on top of json resolving 2 dead lock features: function in objects and cyclic redundancy.

### sjson allows you to put function source code in the object and parseJSON will convert string function to function in runtime.

#### e.g.:

```javascript
  var target={
    a:1,
    b:2,
    theplusfunction:"#!function \
    return o.a+o.b;"
  }
  var result1=sjson.parseJSON({sjson:target}).sjson;
```

### sjson allows you to reference cyclic redundancy references as functions above at runtime.

#### e.g.

```javascript
var target={
  a:1,
  b:2,
  theplusfunction:"#!function return o.a+o.b",
  c:"#!reference theplusfunction"   // c reference target.a
}
var result1=sjson.parseJSON({sjson:target}).sjson;
console.log(result1)
var result2=result1.c(target);
console.log(result2)
assert.equal(result2,3);
```

## versions

### 0.0.7 allow deep nested reference with #!file
###         sjson.remake
###         sjson.parser
###         switching to GNU License

### 0.0.6 allow #!file reference

### 0.0.5 sjson is now in private space

### 0.0.4 #!reference now use jsonpath-plus module, more awesome!

### 0.0.3 #!reference now use jsonpath module, awesome!

### 0.0.2 #!reference working

### 0.0.1 init #!function working
