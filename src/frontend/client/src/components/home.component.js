import React, { Component } from 'react';
import '../App.css';
import { AwesomeButton } from "react-awesome-button";
import 'react-awesome-button/dist/themes/theme-c137.css';

import beijing from '../imgs/beijing.jpg';
import starrynight from '../imgs/starrynight.jpg';
import output from '../imgs/output.jpg';

export default class home extends Component {
    constructor(props) {
        super(props);
        this.toupload = this.toupload.bind(this);
        this.todownload = this.todownload.bind(this);
    }
    toupload(e) {
        this.props.history.push('/upload');
    }
    todownload(e) {
        this.props.history.push('/download');
    }
    render() {
        return (
            <div className="container home">

            <p>You can upload two images -- one is content image, another is style image. We can transfer
               your content image to the style of your style image. The following is an example. The "beijing"
               is the content image and "starrynight" is style image. And the output is the result of apply the style
               of style image to the content image. </p>
            <p>The algorithm we are using is credited to
            Authors of the <a href="https://arxiv.org/abs/1705.06830"> arbitrary style transfer paper </a>
            and The Magenta repository for <a href="https://github.com/tensorflow/magenta"> arbitrary style transfer</a></p>

              <div className="beijing">
                <div className="row">
                    <div className="col-lg-4">
                        <img className="" src={beijing} alt=""/>
                        <div>beijing</div>
                    </div>
                    <div className="col-lg-4">
                        <img className="" src={starrynight} alt=""/>
                        <div>starrynight</div>
                    </div>
                    <div className="col-lg-4">
                        <img className="" src={output} alt=""/>
                        <div>output</div>
                    </div>
                </div>
              </div>

              <div className="buttons">
                <div className="row">
                  <div className="col-lg-6 onebutton">
                  <AwesomeButton type="primary" size="large" onPress={this.toupload}>Try it now</AwesomeButton>
                  </div>
                  <div className="col-lg-6 onebutton">
                    <AwesomeButton type="primary" size="large" onPress={this.todownload}>Download image</AwesomeButton>
                  </div>
                </div>
              </div>

            </div>
        )
    }
}
