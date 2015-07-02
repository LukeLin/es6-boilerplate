const RED = Symbol();
const BLUE = Symbol();
const BLACK = Symbol();

function getComplement(color){
    switch(color){
        case RED:
            return BLUE;
        case BLUE:
            return BLACK;
        case BLACK:
            return RED;
        default:
            throw new Error('unknown color: ' + color);
    }
}
getComplement(RED);
//getComplement('red');