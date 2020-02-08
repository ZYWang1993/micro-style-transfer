import React, { Component } from 'react';
import '../App.css';
import ImageUploader from './imageUpload';
import axios from 'axios';
import { AwesomeButton } from "react-awesome-button";
import 'react-awesome-button/dist/themes/theme-c137.css';
export default class upload extends Component {

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
    data.append('image', this.state.target);
    data.append('image', this.state.style);

    axios.post('http://54.164.44.43:8888' + '/transfer', data)
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
          <div className="div-center">
            <p/>
              We've received your requests
            <p/>
              Your requests ID : {this.state.u_id}
            <p/>
              Message from server : {this.state.uploadStatusMessage}
          </div>
          <AwesomeButton type="primary" size="large" onPress={this.redirHome}>Try Another</AwesomeButton>
        </div>
        );
    } else {
      return (
        <form onSubmit={this.onFormSubmit}>
          <div className="App">
            <div className="App-imageUpload">
              <div className = "App-column">
                <h2/>Upload Photo
                <ImageUploader
                      withPreview={true}
                      onChange={this.onDropTarget}
                      label = 'Max file size: 5mb, accepted: .jpg, .png, .jpeg'
                      imgExtension={['.jpg', '.jpeg', '.png']}
                      maxFileSize={5242880}
                      withIcon = {true}
                      buttonText = 'Browse File'
                      singleImage = {true}
                  />
                </div>
                <div className = "App-column">
                  <h2/>Upload Style
                  <ImageUploader
                        withPreview={true}
                        onChange={this.onDropStyle}
                        label = 'Max file size: 5mb, accepted: .jpg, .png, .jpeg'
                        imgExtension={['.jpg', '.jpeg', '.png']}
                        maxFileSize={5242880}
                        withIcon = {true}
                        buttonText = 'Browse File'
                        singleImage = {true}
                    />
                </div>
            </div>
            <AwesomeButton type="primary" size="large" >Upload</AwesomeButton>
          </div>
        </form>
      );
    }
  }
}
