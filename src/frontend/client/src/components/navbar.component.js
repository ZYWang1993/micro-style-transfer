import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
export default class Navbar extends Component {
  render() {
    return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark navbar-width">
        <Link to="/" className="navbar-brand">Style Transfer</Link>
        <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="navbar-item">
          <Link to="/upload" className="nav-link">Upload</Link>
          </li>
          <li className="navbar-item">
          <Link to="/download" className="nav-link">Download</Link>
          </li>
        </ul>
        </div>
      </nav>
      <header className="App-header">
            <p>
              Neural Style Transfer
            </p>
          </header>
          </div>
    );
  }
}