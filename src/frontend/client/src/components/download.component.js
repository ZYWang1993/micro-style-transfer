import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import { AwesomeButton } from "react-awesome-button";
import 'react-awesome-button/dist/themes/theme-c137.css';


export default class download extends Component {
  constructor(props) {
    super(props);
    this.onDownload = this.onDownload.bind(this);
    this.getImage = this.getImage.bind(this);
    this.handleUidChange = this.handleUidChange.bind(this);
    this.arrayBufferToBase64 = this.arrayBufferToBase64.bind(this);
    this.redirHome = this.redirHome.bind(this);
    this.state = {
      uid: '',
      url: '',
      ready: false,
      outputImage: '',
      errorMessage: ''
    }
  }

  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  getImage(id) {
    if (id.length < 8) {
      this.setState({
        errorMessage: "Please input a valid key!"
      });
    } else {
      axios.get('http://54.164.44.43:8888'+'/image/' + this.state.uid)
        .then((res) => {
          if (typeof res.data.message !== 'undefined') {
            this.setState({
              errorMessage: res.data.message
            });
          } else {
            let base64Flag = 'data:image/jpg;base64,';
            let imageStr = this.arrayBufferToBase64(res.data.file.Body.data);
            this.setState({
              outputImage: base64Flag + imageStr
            });
          }
        })
        .catch((err) => {
          this.setState({
            errorMessage: "Sorry, we are not fullfill your request due to broken pipeline."
          });
        });
    }
  }

  onDownload(e) {
    this.setState({
      ready: true
    });
    this.getImage(this.state.uid);
  }

  handleUidChange(e) {
    this.setState({
      uid: e.target.value
    });
   };

  redirHome() {
   this.setState({
     ready: false,
     outputImage: '',
     errorMessage: ''
   });
  }

  render() {
    if (this.state.ready) {
      if (this.state.errorMessage !== '') {
        return (
          <div className="div-center">
            <h3>{this.state.errorMessage}</h3>
            <br/>
            <AwesomeButton type="primary" size="large" onPress={this.redirHome}>Return</AwesomeButton>
          </div>
        );
      }
      return (
        <div>
          <div className="div-center">
            <h3> Here is Your Image </h3>
            <br/>
            <img className="div-center-img" src={this.state.outputImage} alt=""/>
            <br/>
            <AwesomeButton type="primary" size="large" onPress={this.redirHome}>Return</AwesomeButton>
          </div>
        </div>
      );
    } else {
      return (
        <div className="App">
          <h3>Please input your unique id</h3>
          <br/>
          <div className="downloadcontainer App-imageUpload">
            <input className="form-control" required type="text" placeholder="input your uid" value={this.state.uid}
            onChange={this.handleUidChange}
            />
          </div>
          <AwesomeButton type="primary" size="large" onPress={this.onDownload}>Download</AwesomeButton>
        </div>
      );
    }
  }
}
