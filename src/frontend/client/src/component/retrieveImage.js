import React from 'react';
import axios from 'axios';

class RetrieveImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { output: null,
                   u_id: null,
                   statusMessage: ''};
    this.getImage = this.getImage.bind(this);
    this.arrayBufferToBase64 = this.arrayBufferToBase64.bind(this);
  }

  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  getImage(id) {
    axios.get('http://54.164.44.43:8888/image/' + 'gAFeEhqu')
      .then((res) => {
        console.log(res.data.message);
        let base64Flag = 'data:image/jpg;base64,';
        let imageStr = this.arrayBufferToBase64(res.data.file.Body.data);
        this.setState({
          output: base64Flag + imageStr
        });
      })
      .catch((err) => {
        window.alert(err);
      });
  }

  render() {
    return (
      <div>
        <button onClick={this.getImage} className="btn btn-dark btn-mid">Get Image</button>
        <img src={this.state.output} />
      </div>
    );
  }
}

export default RetrieveImage;
