import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SketchGenerator from "./components/SketchGenerator";

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SketchGenerator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;