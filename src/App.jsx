import { Routes, Route } from "react-router-dom";
 
import Navbar       from "./components/Navbar";
import Home         from "./pages/Home";
import FindFlatmate from "./pages/FindFlatmate";
import About        from "./pages/About";
 
function App() {
  return (
    <div>
 
      {/* Navbar will stay on every page */}
      <Navbar />
 
      {/* Only the page content changes */}
      <Routes>
        <Route path="/"      element={<Home />} />
        <Route path="/find"  element={<FindFlatmate />} />
        <Route path="/about" element={<About />} />
      </Routes>
 
    </div>
  );
}
 
export default App;