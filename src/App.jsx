import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './view/Login'
import Layout from './view/Layout'
import DetalleSolicitud from './view/RequestDeatils'
import RecoverPassword from './view/RecoverPassword'
import RecoverConfirmation from './view/RecoverConfirmation'
import Clients from './view/Menu/Clients'
import CreateClient from './view/Menu/Clients/CreateClient'
import RequestLoan from './view/Menu/RequestLoan'
import CreateRequest from './view/Menu/RequestLoan/CreateRequest'
import ClientDetails from './view/Menu/Clients/DetailClient'
import Productos from './view/Menu/Products'
import CreateSeller from './view/Menu/Users/Sellers/CreateSeller'
import Sellers from './view/Menu/Users/Sellers'
import Coordinators from './view/Menu/Users/Coordinator'
import CreateCoordinators from './view/Menu/Users/Coordinator/CreateCoordinantor'
import Procesors from './view/Menu/Users/Procesors'
import CreateProcesor from './view/Menu/Users/Procesors/CreateProcesor'
import System from './view/Menu/Users/System'
import CreateUserSystem from './view/Menu/Users/System/CreateUserSystem'
import PrivateRoute from './components/PrivateRouter'

const Dashboard = () => <h1>DashBoard</h1>
const Parameters = () => <h1>Parameters</h1>

// function PrivateRoute() {
//   const token = localStorage.getItem('token');
//   return token ? <Outlet /> : <Navigate to="/login" replace />;
// }

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recover-password" element={<RecoverPassword/>} />
        <Route path="/recover-confirmation" element={<RecoverConfirmation/>} />
        {/* Rutas privadas */}
        <Route element={<PrivateRoute />}> 
          <Route path="/" element={<Layout />} >
            <Route path="request-details" element={<DetalleSolicitud />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<RequestLoan />} />
            <Route path="products" element={<Productos />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id/details" element={<ClientDetails />} />
            <Route path="clients/new-client" element={<CreateClient />} />
            <Route path="parameters" element={<Parameters/>} />
            <Route path="requests/new-request" element={<CreateRequest/>} />
            <Route path="sellers" element={<Sellers/>}/>
            <Route path="sellers/new-seller" element={<CreateSeller/>}/>
            <Route path='coordinators' element={<Coordinators/>} />
            <Route path='coordinators/new-coordinator' element={<CreateCoordinators/>} />
            <Route path='process' element={<Procesors/>}/>
            <Route path='process/new-process' element={<CreateProcesor/>}/>
            <Route path='users' element={<System/>}/>
            <Route path='users/new-admin' element={<CreateUserSystem/>}/>
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Route>
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
