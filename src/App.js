import logo from "./logo.png";
import "./App.css";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

const appName = () => {
  return "Application 1";
};

function ChatLogItem({ chatDetails }) {
  return (
    <div
      className={
        chatDetails?.messageType === appName()
          ? "chat-log_item chat-log_item"
          : "chat-log_item chat-log_item-own"
      }
    >
      <div className="row justify-content-end mx-1 d-flex">
        <span className="chat-log_author">{chatDetails.user}</span>
      </div>
      <div className="chat-log_message">
        <p>{chatDetails.message}</p>
      </div>
    </div>
  );
}
function MessageBox({ data }) {
  return (
    <div className="card  msgcard">
      <div className="card-body">
        <div>
          <div id="messages_container" className="chat-log">
            {data &&
              data?.map((item) => {
                return <ChatLogItem chatDetails={item} />;
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
function App() {
  const [msg, setMsg] = useState();
  const [inputMsg, setInputMsg] = useState();
  const [connection, setConnection] = useState(null);
  const [chat, setChat] = useState([]);
  const latestChat = useRef(null);
  latestChat.current = chat;

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/hubs/chat")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then((result) => {
          console.log("Connected!");

          connection.on("ReceiveMessage", (message) => {
            const updatedChat = [...latestChat.current];
            updatedChat.push(message);

            setChat(updatedChat);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);
  const sendMessage = async ({ user, message }) => {
    const chatMessage = {
      user: user,
      message,
    };

    if (connection._connectionStarted) {
      try {
        let res = await connection.send("SendMessage", chatMessage);
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("No connection to server yet.");
    }
  };
  return (
    <div className="App">
      <div class="row">
        <div class="column" style={{ backgroundColor: "#aaa;" }}>
          <div className="left-container">
            <img src={logo} className="App-logo" alt="logo" />
            <header className="App-welcome">
              Welcome to ISA<span className="App-welcome-span">AC</span>
            </header>
            <p className="app-identifier">{appName()}</p>
            {/*  <div className="message-box">Message: {msg}</div>*/}
            <div className="send-box">
              <input
                type="text"
                className="send-box-input"
                placeholder="Send something..."
                onChange={(e) => setInputMsg(e.target.value)}
              />
              <button
                className="send-box-button"
                onClick={() =>
                  sendMessage({ user: appName(), message: inputMsg })
                }
              >
                <span className="send-box-span">Send</span>{" "}
              </button>
            </div>
          </div>
        </div>
        <div class="column-two" style={{ backgroundColor: "#bbb;" }}>
          <h1>Messages</h1>
          <MessageBox data={chat} />
        </div>
      </div>
    </div>
  );
}

export default App;
