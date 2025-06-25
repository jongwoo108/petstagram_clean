import { BrowserRouter } from "react-router-dom";
import './App.css';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}

export default App;