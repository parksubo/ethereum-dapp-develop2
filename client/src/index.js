import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import CoinFlip from './CoinFlip';

ReactDOM.render(<App />, document.getElementById('root'));

// index.html에 div 태그로 만들어 놓음
ReactDOM.render(<CoinFlip />, document.getElementById('content'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
