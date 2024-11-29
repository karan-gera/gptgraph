import React from "react";
import UploadComponent from "./UploadComponent";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Interactive Hashtag StreamGraph</h1>
      </header>
      <main>
        <UploadComponent />
      </main>
    </div>
  );
}

export default App;
