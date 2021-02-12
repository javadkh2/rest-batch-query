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
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              window.useQuery = true;
              setStarted(true);
            }}
          >
            use query
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              window.useQuery = false;
              setStarted(true);
            }}
          >
            normal fetch
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
