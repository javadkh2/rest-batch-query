import "./App.css";
import Profile from "./Profile";
import React, { Suspense } from "react";

function App() {
  return (
    <div className="App">
      <Suspense fallback="Loading profile page">
        <Profile id={1} />
      </Suspense>
    </div>
  );
}

export default App;
