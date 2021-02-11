import "./App.css";
import Profile from "./Profile";
import React, { Suspense, useState } from "react";

function App() {
  const [started, setStarted] = useState(false);
  return (
    <div className="App">
      {started ? (
        <Suspense fallback="Loading profile page">
          <Profile id={2} />
        </Suspense>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            setStarted(true);
          }}
        >
          Start
        </button>
      )}
    </div>
  );
}

export default App;
