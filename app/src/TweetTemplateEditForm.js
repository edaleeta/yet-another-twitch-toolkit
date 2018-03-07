import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup,
         ControlLabel,
         FormControl,
         Button,
         ButtonToolbar,
        Collapse} from 'react-bootstrap';

export class TweetTemplateEditForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: this.props.contents,
      originalContents: this.props.contents
    };
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSaveClick(e) {
    e.preventDefault();
    console.log(this.props.templateId);
    console.log(this.state.contents.trim());

    let url = "/api/edit-tweet-template"
    let payload = JSON.stringify({
      templateId: this.props.templateId,
      contents: this.state.contents.trim()
    });

    console.log(payload);

    fetch(url, {
      credentials: 'same-origin',
      method: 'POST',
      body: payload, 
      headers: new Headers({
      'Content-Type': 'application/json'
      })
    })
    .then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
      console.log('Success:', response);
      // Tells Tweet Templates that we saved a new Template!
      this.props.onClick();
      // Clear contents of textbox after submitting.
      this.setState({
        contents: this.state.originalContents
      });
    })
  }

  handleResetClick(e) {
    this.setState({
      contents: this.state.originalContents
    });
  }

  handleChange(e) {
    this.setState({
      contents: e.target.value
    });
  }

  render() {

    return (
      <Collapse in={!this.props.hidden}>
        <div>
          <form>
            <FormGroup>
              <ControlLabel><h4>Update Tweet Template</h4></ControlLabel>
              <FormControl
                onChange={this.handleChange}
                componentClass="textarea"
                value={this.state.contents}
                rows={3}>
              </FormControl>
              <ButtonToolbar style={{marginTop: "0.5rem"}}>
                <Button type="submit" onClick={this.handleSaveClick}>Save Changes</Button>
                <Button onClick={this.handleResetClick}>Reset Changes</Button>
              </ButtonToolbar>
            </FormGroup>
          </form>
        </div>
      </Collapse>
    )
  }
}

TweetTemplateEditForm.propTypes = {
  hidden: PropTypes.bool.isRequired,
  contents: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}