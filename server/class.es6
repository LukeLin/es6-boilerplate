class Hello {
    constructor(name) {
        this.name = name;
    }

    hello() {
        return 'Hello ' + this.name + '!';
    }

    static sayHelloAll() {
        return 'Hello everyone!';
    }
}

class HelloWorld extends Hello {
    constructor() {
        super('World');
    }

    echo() {
        alert(super.hello());
    }
}

var hw = new HelloWorld();
hw.echo();

alert(Hello.sayHelloAll());