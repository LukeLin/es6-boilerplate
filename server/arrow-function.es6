var evens = [2, 4, 6, 8, 10];

// Expression bodies
var odds = evens.map(v => v + 1);
var nums = evens.map((v, i) => v + i);

console.log(odds);
// -> [3, 5, 7, 9, 11]

console.log(nums);
// -> [2, 5, 8, 11, 14]

// Statement bodies
var fives = [];
nums = [1, 2, 5, 15, 25, 32];
nums.forEach(v => {
    if (v % 5 === 0)
        fives.push(v);
});

console.log(fives);
// -> [5, 15, 25]

// Lexical this
var bob = {
    _name: 'Bob',
    _friends: [],
    printFriends() {
        this._friends.forEach(f =>
            console.log(this._name + ' knows ' + f));
    }
}