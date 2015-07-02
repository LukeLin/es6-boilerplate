//import obj from './data.json';

import React from 'react';

export default class App extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>test</div>
        );
    }
}

React.render(<App/>, document.body);