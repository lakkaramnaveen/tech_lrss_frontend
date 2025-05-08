import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskPage from "./TaskPage";
import NotFound from "./NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TaskPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
