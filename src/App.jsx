import React, {Component} from 'react';
import MessageList from './MessageList.jsx';
import ChatBar from './ChatBar.jsx';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: {name: 'Anonymous'}, 
      messages: [],
      usersOnline: 0
    };
    this.addMessage = this.addMessage.bind(this);
  }

  addMessage (newPost) {
    const newMessage = {
      type: 'postMessage',
      username: this.state.currentUser.name,
      content: newPost
    };
    this.socket.send(JSON.stringify(newMessage));
  }

  onUserChanged = (username) => {
    const oldUser = this.state.currentUser.name;
    if (username === '') {
      username = 'Anonymous';
    }
    const nameChange = {
      type: 'postNotification',
      content: `${oldUser} has changed their name to ${username}`
    };
    this.socket.send(JSON.stringify(nameChange));
    this.setState({ currentUser: { name: username }});
  }
  
  componentDidMount() {
    this.socket = new WebSocket(`ws://${location.hostname}:3001`);
    this.socket.onopen = () => { 
      // SET NAME COLOR CHANGE HERE?
    };
    this.socket.onmessage = event => {
      // Promise.resolve(JSON.parse('{"key":"value"}')).then(json => {
        // console.log(json);
      try {
        const data = JSON.parse(event.data); // ADD TRY CATCH TO PREVENT SERVER CRASH
        if (Number.isInteger(data)) {     //receiving userSet.size from server, which will be an integer 
          this.setState ({
            usersOnline: data
          });
        } 
        else if (!Number.isInteger(data)) {
          const updatedMessages = this.state.messages.concat(data);
          this.setState({
            messages: updatedMessages  
          });
        }
      }
      catch(ex) {
        console.error(ex);
      }
    };
  }

  render() {
    return (
      <div>
        <nav className='navbar'>
          <a href='/' className='navbar-brand'>Chatty</a>
          <span className='navbar-online-users'>{this.state.usersOnline} users online</span>
        </nav>           
        <MessageList messages= { this.state.messages } />
        <ChatBar username= { this.state.currentUser.name }
                 addMessage= { this.addMessage }
                 onUserChanged={ this.onUserChanged } />  
      </div>
    );                  
  }
}