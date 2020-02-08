import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-awesome-button/dist/styles.css";


import Navbar from "./components/navbar.component"
import upload from "./components/upload.component"
import download from "./components/download.component"
import home from "./components/home.component"


function App() {
  return (
    <Router>
      <Navbar />
      <br/>
      <Route path="/" exact component={home} />
      <Route path="/upload" exact component={upload} />
      <Route path="/download" component={download} />
    </Router>
  );
}


export default App;
