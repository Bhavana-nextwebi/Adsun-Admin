import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/assets/css/icons.min.css';
import '../src/assets/css/app.min.css';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from '../src/redux/store/store';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //this needs to be commented during the production phase of the project to avoid calling the same api twice and also to avoid invoking some of the functions twice
    <Provider store={store}>
      <App />
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
