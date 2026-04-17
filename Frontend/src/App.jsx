// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar       from "./components/Navbar";
import Home         from "./pages/Home";
import FindFlatmate from "./pages/FindFlatmate";
import About        from "./pages/About";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Messages     from "./pages/Messages";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/find"     element={<FindFlatmate />} />
        <Route path="/about"    element={<About />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </div>
  );
}

export default App;