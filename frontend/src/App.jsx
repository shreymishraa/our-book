import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Books from "./pages/Books";
import ReadBook from "./pages/ReadBook";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<ReadBook />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;