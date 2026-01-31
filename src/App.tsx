import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import {
  Dashboard,
  ContextualInsights,
  AppInsights,
  ConnectedClients,
  AccessPoints,
} from './pages';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contextual-insights" element={<ContextualInsights />} />
          <Route path="/app-insights" element={<AppInsights />} />
          <Route path="/connected-clients" element={<ConnectedClients />} />
          <Route path="/access-points" element={<AccessPoints />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
