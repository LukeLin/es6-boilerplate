import { createReadStream } from 'fs';


/**
 * Returns a function that, when called,
 * returns a generator object that is immediately
 * ready for input via `next()`
 */
function coroutine(generatorFunction){
    return function(...args){
        let generatorObject = generatorFunction(...args);
        generatorObject.next();
        return generatorObject;
    };
}

const wrapped = coroutine(function* (){
    console.log(`First input: ${ yield }`);
    return 'DONE';
});
const normal = function* (){
    console.log(`First input: ${ yield }`);
    return 'DONE';
};

wrapped().next('hello!');
let genObj = normal();
console.log(genObj.next());
console.log(genObj.next('hello!'));


/**
 * Create an asynchronous ReadStream for the file whose name
 * is `fileName` and feed it to the generator object `target`.
 *
 * @see ReadStream https://nodejs.org/api/fs.html#fs_class_fs_readstream
 */
function readFile(fileName, target) {
    let readStream = createReadStream(fileName,
        { encoding: 'utf8', bufferSize: 1024 });
    readStream.on('data', buffer => {
        let str = buffer.toString('utf8');
        target.next(str);
    });
    readStream.on('end', () => {
        // Signal end of output sequence
        target.return();
    });
}

/**
 * Turns a sequence of text chunks into a sequence of lines
 * (where lines are separated by newlines)
 */
const splitLines = coroutine(function* (target) {
    let previous = '';
    try {
        while (true) {
            previous += yield;
            let eolIndex;
            while ((eolIndex = previous.indexOf('\n')) >= 0) {
                let line = previous.slice(0, eolIndex);
                target.next(line);
                previous = previous.slice(eolIndex+1);
            }
        }
    } finally {
        // Handle the end of the input sequence
        // (signaled via `return()`)
        if (previous.length > 0) {
            target.next(previous);
        }
        // Signal end of output sequence
        target.return();
    }
});

const numberLines = coroutine(function* (target) {
    try {
        for (let lineNo = 0; ; lineNo++) {
            let line = yield;
            target.next(`${lineNo}: ${line}`);
        }
    } finally {
        // Signal end of output sequence
        target.return();
    }
});

/**
 * Receives a sequence of lines (without newlines)
 * and logs them (adding newlines).
 */
const printLines = coroutine(function* () {
    while (true) {
        let line = yield;
        console.log(line);
    }
});

readFile(__dirname + '/../../server/app.es6', splitLines(numberLines(printLines())));


import 'isomorphic-fetch';

function getFile(url){
    return fetch(url)
        .then(request => request.text())
}

function co(genFunc){
    let genObj = genFunc();
    run();

    function run(promiseResult){
        let {value, done} = genObj.next(promiseResult);
        if(!done) {
            value
                .then(result => run(result))
                .catch(error => {
                    genObj.throw(error);
                });
        }
    }
}

co(function* (){
    try {
        let [croStr, bondStr] = yield Promise.all([
            getFile('http://localhost:8000/app.js'),
            getFile('http://localhost:8000/arrow-function.js')
        ]);
        console.log(croStr);
        console.log(bondStr);
    } catch(e){
        console.log('Failure to read: ' + e);
    }
});


function* take(n, iterable){
    for(let x of iterable){
        if(n <= 0) return;
        --n;
        yield x;
    }
}

/**
 function take(n, iterable) {
    let iter = iterable[Symbol.iterator]();
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (n > 0) {
                n--;
                return iter.next();
            } else {
                maybeCloseIterator(iter);
                return { done: true };
            }
        },
        return() {
            n = 0;
            maybeCloseIterator(iter);
        }
    };
}
 function maybeCloseIterator(iterator) {
    if (typeof iterator.return === 'function') {
        iterator.return();
    }
}
 */

let arr = ['a', 'b', 'c', 'd'];
for(let x of take(2, arr)){
    console.log(x);
}