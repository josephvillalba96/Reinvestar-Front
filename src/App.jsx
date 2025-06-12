import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './view/Login'
import Layout from './view/Layout'
import RegistrarCliente from './view/RegisterClient'
import DetalleSolicitud from './view/RequestDeatils'

const Clients = () => <h1>Clients</h1>

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />} />
        <Route path="/register-client" element={<RegistrarCliente />} />
        <Route path="/request-details" element={<DetalleSolicitud />} />
        <Route path="/clients" element={<Clients />} />
      </Routes>
    </Router>
  )
}

export default App
