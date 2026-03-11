import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StoresMap from './pages/StoresMap';
import ProductsList from './pages/ProductsList';
import StoreDetails from './pages/StoreDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-container">
          <aside className="sidebar">
            <h1 style={{ marginBottom: '2rem' }}>📦 Tiny Inventory</h1>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/stores" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Stores</a>
              <a href="/products" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>All Products</a>
            </nav>
          </aside>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/stores" replace />} />
              <Route path="/stores" element={<StoresMap />} />
              <Route path="/stores/:id" element={<StoreDetails />} />
              <Route path="/products" element={<ProductsList />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
