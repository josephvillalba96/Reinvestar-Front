import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './view/Login'
import Layout from './view/Layout'
import RegistrarCliente from './view/RegisterClient'
import DetalleSolicitud from './view/RequestDeatils'
import RecoverPassword from './view/RecoverPassword'
import RecoverConfirmation from './view/RecoverConfirmation'
import Clients from './view/Menu/Clients'

const Productos = () => <h1>Producto</h1>
const Solicitudes= () => <h1>Solicitudes</h1>
const Dashboard = () => <h1>DashBoard</h1>
const Parameters = () => <h1>Parameters</h1>



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="register-client" element={<RegistrarCliente />} />
          <Route path="request-details" element={<DetalleSolicitud />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="requests" element={<Solicitudes />} />
          <Route path="products" element={<Productos />} />
          <Route path="clients" element={<Clients />} />
          <Route path="parameters" element={<Parameters/>} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/recover-password" element={<RecoverPassword/>} />
        <Route path="/recover-confirmation" element={<RecoverConfirmation/>} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
