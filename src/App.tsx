import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; /* Para criar o link entre páginas */
import './App.css'
import Homepage from './pages/Home/Homepage'
import Login from './pages/Login/Login'
import Init from './pages/Chooseavatar/Init'
import Phase from './pages/Phasespage/Phase'
import About from './pages/Aboutproject/About'
import Mercadinho from './pages/Mercadinho/mercadinho'
import Battle from './pages/Battle/Battle';




function App() {

  return (
   <div className="App">
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/init" element={<Init />} />
        <Route path="/phase" element={<Phase />} />
        <Route path="/about" element={<About />} />
        <Route path="/game1" element={<Mercadinho />} />
        <Route path="/game2" element={<Battle />} />

      </Routes>
    </Router>
   </div>
  )
}

export default App
