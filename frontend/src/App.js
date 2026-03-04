import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuotationBuilder from "./pages/QuotationBuilder";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuotationBuilder />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
