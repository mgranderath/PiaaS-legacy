import React from 'react';
import '../styles/app.css';
import axios from 'axios';

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.api = 'http://127.0.0.1:8080/api';
        this.state = {
            data: []
        }
    }

    componentDidMount(){
        // Make HTTP reques with Axios
        axios.get(this.api)
            .then((res) => {
                // Set state with result
                this.setState({data: res.data.apps});
            });
    }

    render(){
        return (
            <div>
                <table>
                    <tbody>
                    {[...this.state.data].map((x, i) =>
                        <tr key={i}><td>{x}</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        )
    }
}
