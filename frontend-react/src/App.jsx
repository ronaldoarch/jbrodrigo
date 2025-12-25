import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apostar from './pages/Apostar';
import MinhasApostas from './pages/MinhasApostas';
import Carteira from './pages/Carteira';
import Resultados from './pages/Resultados';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route
              path="dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="apostar"
              element={
                <PrivateRoute>
                  <Apostar />
                </PrivateRoute>
              }
            />
            <Route
              path="minhas-apostas"
              element={
                <PrivateRoute>
                  <MinhasApostas />
                </PrivateRoute>
              }
            />
            <Route
              path="carteira"
              element={
                <PrivateRoute>
                  <Carteira />
                </PrivateRoute>
              }
            />
            <Route path="resultados" element={<Resultados />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

