import React, { Component } from 'react';

const navLinks = {
  home: "/",
  login: "/login/twitch",
  logout: "/logout"
}

// Navigation 
export class NavBar extends Component {
  render() {
    return (
      <ul>
      <li><a href={navLinks.home}>Home</a></li>
      <li><a href={navLinks.login}>Login</a></li>
      <li><a href={navLinks.logout}>Logout</a></li>
    </ul>
    );
  }
}