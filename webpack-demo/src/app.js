import React from 'react';
import ReactDOM from 'react-dom'
import './assets/css/global.less'
import logo from './assets/images/react.png';

class App extends React.Component{
    render(){
        return<div className="common-text"> hello 您好!!!
            <CustomImage />
        </div> 
    }
}

class CustomImage extends React.Component{
    render(){
        return <img src={logo}/>
    }
}

ReactDOM.render(
   <App />,
    document.getElementById('root')
  );