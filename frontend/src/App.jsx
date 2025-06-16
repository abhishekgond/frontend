import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EditPage from "./components/EditPage";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster
        position="top-right
      "
      ></Toaster>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditPage />} />
      </Routes>
    </>
  );
}

export default App;
