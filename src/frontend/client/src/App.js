import React from 'react';
import { Redirect } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import ImageUploader from 'react-images-upload';
import axios from 'axios';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { target: null,
                   style: null,
                   uploadStatus: false,
                   u_id: null,
                   uploadStatusMessage: ''};
    this.onDropTarget = this.onDropTarget.bind(this);
    this.onDropStyle = this.onDropStyle.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.redirHome = this.redirHome.bind(this);
  }

  onFormSubmit(e) {
    e.preventDefault();
    if (!this.state.target || !this.state.style) {
      alert('please upload your photo and a style image');
      return;
    }
    var data = new FormData();
    const config = {
      headers: {
          'content-type': 'multipart/form-data'
      }
    };
    data.append('image', this.state.target);
    data.append('image', this.state.style);

    axios.post('http://localhost:8888/transfer', data)
      .then((res) => {
        this.setState({
            uploadStatusMessage: res.data.message,
            uploadStatus: true,
            u_id: res.data.u_id,
            target: null,
            style: null
        });
      })
      .catch((err) => {
        window.alert(err);
      });
  }

  onDropTarget(picture) {
    this.setState({
        target: picture[0]
    });
  }

  onDropStyle(picture) {
    this.setState({
        style: picture[0]
    });
  }

  redirHome() {
    this.setState({
        uploadStatus: false
    });
  }

  render() {
    if (this.state.uploadStatus) {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Neural Style Transfer
            </p>
          </header>
          <div>
            <p/>
              We've received your requests
            <p/>
              Your requests ID : {this.state.u_id}
            <p/>
              Message from server : {this.state.uploadStatusMessage}
          </div>
          <button onClick={this.redirHome} className="btn btn-dark btn-mid">Try Another</button>
        </div>
        );
    } else {
      return (
        <form onSubmit={this.onFormSubmit}>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Neural Style Transfer
              </p>
            </header>
            <div className="App-imageUpload">
              <div className = "App-column">
                <h2/>Upload Photo
                <ImageUploader
                      withIcon={true}
                      withPreview={true}
                      onChange={this.onDropTarget}
                      label = 'Max file size: 5mb, accepted: .jpg, .png, .jpeg'
                      imgExtension={['.jpg', '.jpeg', '.png']}
                      maxFileSize={5242880}
                      withIcon = {false}
                      buttonText = 'Browse File'
                      singleImage = {true}
                  />
                </div>
                <div className = "App-column">
                  <h2/>Upload Style
                  <ImageUploader
                        withIcon={true}
                        withPreview={true}
                        onChange={this.onDropStyle}
                        label = 'Max file size: 5mb, accepted: .jpg, .png, .jpeg'
                        imgExtension={['.jpg', '.jpeg', '.png']}
                        maxFileSize={5242880}
                        withIcon = {false}
                        buttonText = 'Browse File'
                        singleImage = {true}
                    />
                </div>
            </div>
            <button type="submit" className="btn btn-dark btn-mid">Upload</button>
          </div>
        </form>
      );
    }
  }
}

export default App;
