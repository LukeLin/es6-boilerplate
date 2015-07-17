import { createReadStream, readFile } from 'fs';
import 'isomorphic-fetch';


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


(function(){
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
})();


(function(){
    /**
     * Pushes the items of `iterable` into `sink`, a generator.
     * It uses the generator method `next()` to do so.
     */
    function send(iterable, sink) {
        for (let x of iterable) {
            sink.next(x);
        }
        sink.return(); // signal end of stream
    }

    /**
     * This generator logs everything that it receives via `next()`.
     */
    const logItem = coroutine(function* (){
        try {
            while(true){
                let item = yield;
                console.log(item);
            }
        } finally {
            console.log('DONE');
        }
    });

    console.log('Lazy push');
    send('abc', logItem());


    /**
     * Returns an iterable that transforms the input sequence
     * of characters into an output sequence of words.
     */
    function* tokenize(chars){
        let iterator = chars[Symbol.iterator]();
        let ch;

        do {
            ch = getNextItem(iterator);
            if(isWordChar(ch)) {
                let word = '';
                do {
                    word += ch;
                    ch = getNextItem(iterator);
                } while(isWordChar(ch));

                yield word;
            }
        } while(ch != END_OF_SEQUENCE);
    }

    const END_OF_SEQUENCE = Symbol();

    function getNextItem(iterator){
        let {value ,done} = iterator.next();
        return done ? END_OF_SEQUENCE : value;
    }

    function isWordChar(ch){
        return typeof ch === 'string' && /^[A-Za-z0-9]$/.test(ch);
    }

    console.log([...tokenize('2 apples and 5 oranges.')]);


    function* extractNumbers(words){
        for(let word of words){
            if(/^[0-9]+$/.test(word))
                yield Number(word);
        }
    }

    console.log([...extractNumbers(['hello', '123', 'world', '45'])]);


    /**
     * Returns an iterable that contains, for each number in
     * `numbers`, the total sum of numbers encountered so far.
     * For example: 7, 4, -1 --> 7, 11, 10
     */
    function* addNumbers(number){
        let result = 0;
        for(let n of number){
            result += n;
            yield result;
        }
    }
    console.log([...addNumbers([5, -2, 12])]);

    const CHARS = '2 apples and 5 oranges.';
    const CHAIN = addNumbers(extractNumbers(tokenize(CHARS)));
    console.log([...CHAIN]);

    function* logAndYield(iterable, prefix = ''){
        for(let item of iterable){
            console.log(prefix + item);
            yield item;
        }
    }
    const CHAIN2 = logAndYield(addNumbers(extractNumbers(tokenize(logAndYield(CHARS)
    ))), '-> ');
    console.log([...CHAIN2]);


    console.log('Lazy push (generators as observables)');

    /**
     * Receives a sequence of characters (via the generator object
     * method `next()`), groups them into words and pushes them
     * into the generator `sink`.
     */
    const tokenize2 = coroutine(function* (sink){
        try {
            while (true) { // (A)
                let ch = yield; // (B)
                if (isWordChar(ch)) {
                    // A word has started
                    let word = '';
                    try {
                        do {
                            word += ch;
                            ch = yield; // (C)
                        } while (isWordChar(ch));
                    } finally {
                        // The word is finished.
                        // We get here if
                        // - the loop terminates normally
                        // - the loop is terminated via `return()` in line C
                        sink.next(word); // (D)
                    }
                }
                // Ignore all other characters
            }
        } finally {
            // We only get here if the infinite loop is terminated
            // via `return()` (in line B or C).
            // Forward `return()` to `sink` so that it is also
            // aware of the end of stream.
            sink.return();
        }
    });

    send('2 apples and 5 oranges.', tokenize2(logItem()));

    /**
     * Receives a sequence of strings (via the generator object
     * method `next()`) and pushes only those strings to the generator
     * `sink` that are “numbers” (consist only of decimal digits).
     */
    const extractNumbers2 = coroutine(function* (sink){
        try {
            while(true){
                let word = yield;
                if(/^\d+$/.test(word)) sink.next(Number(word));
            }
        } finally {
            // Only reached via `return()`, forward.
            sink.return();
        }
    });

    send(['hello', '123', 'world', '45'], extractNumbers2(logItem()));

    const addNumbers2 = coroutine(function* (sink) {
        let sum = 0;
        try {
            while (true) {
                sum += yield;
                sink.next(sum);
            }
        } finally {
            // We received an end-of-stream
            sink.return(); // signal end of stream
        }
    });
    send([5, -2, 12], addNumbers2(logItem()));

    const INPUT = '2 apples and 5 oranges.';
    const CHAIN10 = tokenize2(extractNumbers2(addNumbers2(logItem())));
    send(INPUT, CHAIN10);

    const CHAIN11 = tokenize2(extractNumbers2(addNumbers2(logItem({ prefix: '-> ' }))));
    send(INPUT, CHAIN11, { log: true });

})();


(function(){
    console.log('Cooperative multitasking with generators and Node.js-style callbacks');

    let fileNames = [`${ __dirname }/app.js`, `${ __dirname }/Set.js`];

    run(function* (){
        let next = yield;
        for(let f of fileNames){
            let contents  = yield readFile(f, { encoding: 'utf8' }, next);
            console.log('#### ' + f);
            console.log(contents);
        }
    });

    function run(generatorFunction){
        let generatorObject = generatorFunction();

        generatorObject.next();

        function nextFunction(err, result){
            if(err) generatorObject.throw(error);
            else generatorObject.next(result);
        }

        generatorObject.next(nextFunction);
    }

})();