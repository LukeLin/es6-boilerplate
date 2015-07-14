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