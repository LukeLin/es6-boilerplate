let set = new Set();
set.add('red');

set.has('red');
set.delete('red');
set.has('red');

set = new Set();
set.add('red');
set.add('green');

console.log(set.size);
set.clear();
console.log(set.size);

// union
let a = new Set([1,2,3]);
let b = new Set([4,3,2]);
let union = new Set([...a, ...b]);
// {1,2,3,4}

// Intersection
a = new Set([1,2,3]);
b = new Set([4,3,2]);
let intersection = new Set(
    [...a].filter(x => b.has(x)));
// {2,3}

// Difference
a = new Set([1,2,3]);
b = new Set([4,3,2]);
let difference = new Set(
    [...a].filter(x => !b.has(x)));
// {1}