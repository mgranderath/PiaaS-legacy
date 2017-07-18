import React from 'react';
import '../styles/textBlock.css';

export default class TextBlock extends React.Component {
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            content: props.content,
            display: true
        }
    }

    componentWillReceiveProps (props){
        console.log(props);
        this.setState({content: props.content}) // This will update your component
    }

    render(){
        return (
            <div className="textbox" id="textbox" style={{display:  (this.state.display ? '' : 'none') }}>
                {this.state.content}
            </div>
        );
    }
};