import React, { Component } from 'react';
// import logo from './logo.svg';
import { PageHeader } from 'react-bootstrap';
import './App.css';
import { NavBar } from './NavBar'
import { WelcomeUser } from './WelcomeUser'
import { TweetTemplates } from './TweetTemplates'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: null,
      twitchDisplayName: null,
    }
  }

  componentDidMount(nextProps, nextState) {
      fetch("/api/current-user.json",
      {credentials: 'same-origin'})
      .then((response)=> response.json())
      .then((data) => {
          let userId = data.userId;
          let twitchDisplayName = data.twitchDisplayName;
          let isTwitterAuth = data.isTwitterAuth;

          this.setState({
              userId: userId,
              twitchDisplayName: twitchDisplayName,
              isTwitterAuth: isTwitterAuth,
              fetched: true});
      })
  }
  render() {
    if (this.state.fetched && this.state.userId) {
      // When the initial data has been fetched, and we receive the logged in user...
      return (
        <div>
            <PageHeader>Stream Tweeter <small>A Social media automation tool for Twitch streamers.</small></PageHeader>
            <NavBar />
            <WelcomeUser twitchDisplayName={this.state.twitchDisplayName} />
            <ConnectTwitter isTwitterAuth={this.state.isTwitterAuth} />
            <TweetTemplates isTwitterAuth={this.state.isTwitterAuth} />
          </div>
      );
    } else if (this.state.fetched) {
      // If we don't have a logged in user, show this...
      return (
        <div>
        <NavBar />
        <WelcomeUser twitchDisplayName={this.state.twitchDisplayName} />
        {/* Perhaps include some other info we'll want to a show a non-logged in user. */}
        </div>
      );
    } else {
      // If our fetch hasn't completed, do not render anything.
      return <div></div>
    }
  }
}

// Connect Twitter Account
class ConnectTwitter extends Component {

  render() {
      if (this.props.isTwitterAuth) {
          return (
              <p>
                  Your Twitter is account is connected! <br />
                  Let's make some Tweets!
              </p>
          );
      }
      return (
          <p>
              To get started, please connect your Twitter account:<br />
              <a href="http://localhost:7000/auth-twitter">Connect Twitter</a>
          </p>
      )
  }
}

export default App;