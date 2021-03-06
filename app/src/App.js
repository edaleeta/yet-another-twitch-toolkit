import React, { Component } from "react";
// import logo from './logo.svg';
import { Panel } from "react-bootstrap";
import { Switch, Route } from "react-router-dom";
import { MainNavBar } from "./MainNavBar";
import { MadeWithLove } from "./MadeWithLove";
import { Landing } from "./Landing";
import { Home } from "./Home";
import { Log } from "./Log";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: null,
      twitchDisplayName: null,
      tweetInterval: null
    };
    this.onClickTwitterAccessRevoked = this.onClickTwitterAccessRevoked.bind(
      this
    );
  }

  componentDidMount(nextProps, nextState) {
    fetch("/api/current-user.json", { credentials: "same-origin" })
      .then(response => response.json())
      .then(data => {
        let userId = data.userId;
        let twitchDisplayName = data.twitchDisplayName;
        let isTwitterAuth = data.isTwitterAuth;
        let tweetInterval = data.tweetInterval;
        let isTweeting = data.isTweeting;

        this.setState({
          userId: userId,
          twitchDisplayName: twitchDisplayName,
          isTwitterAuth: isTwitterAuth,
          tweetInterval: tweetInterval,
          isTweeting: isTweeting,
          fetched: true
        });
      });
  }

  onClickTwitterAccessRevoked() {
    this.setState({
      isTwitterAuth: false
    });
  }

  render() {
    if (this.state.fetched && this.state.userId) {
      // When the initial data has been fetched, and we receive the logged in user...
      return (
        <div>
          <MainNavBar />
          <Panel className="main-content">
            <Panel.Body>
              {/* <PageHeader>Stream Tweeter <br /><small>A social media automation tool for Twitch streamers.</small></PageHeader> */}
              <Switch>
                <Route
                  exact
                  path="/"
                  render={props => {
                    return (
                      <div>
                        <Home
                          {...props}
                          isTwitterAuth={this.state.isTwitterAuth}
                          userId={this.state.userId}
                          tweetInterval={this.state.tweetInterval}
                          isTweeting={this.state.isTweeting}
                          onClick={this.onClickTwitterAccessRevoked}
                          twitchDisplayName={this.state.twitchDisplayName}
                        />
                      </div>
                    );
                  }}
                />
                <Route
                  exact
                  path="/log"
                  render={props => {
                    return <Log {...props} userId={this.state.userId} />;
                  }}
                />
              </Switch>
            </Panel.Body>
          </Panel>
          <MadeWithLove />
        </div>
      );
    } else if (this.state.fetched) {
      // If we don't have a logged in user, show this...
      return <Landing />;
    } else {
      // If our fetch hasn't completed, do not render anything.
      return <div />;
    }
  }
}

// Connect Twitter Account

export default App;
