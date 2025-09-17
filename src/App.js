import './App.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import AnalyzeFile from './Components/AnalyzeFile';
import AnalyzeURL from './Components/AnalyzeURL';
import Report from './Components/Report';
import About from './Components/About';
import Contact from './Components/Contact';
import Signup from './Components/signup';
import ProtectedRoute from './Components/ProtectedRoute';
import Login from './Components/login';
import Profile from './Components/profile'
import { AuthProvider } from './Components/context/AuthContext';

import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";

function App() {
  return (
    <>
    <AuthProvider>
      <HashRouter>
       <Navbar />
        <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/AnalyzeFile" element={<ProtectedRoute><AnalyzeFile /></ProtectedRoute>} />
          <Route path="/AnalyzeURL" element={<ProtectedRoute><AnalyzeURL /></ProtectedRoute>} />
          <Route path="/Report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} /> 
        </Routes>
        </div>
      </HashRouter>
      </AuthProvider>
    </>
  );
}

export default App;
