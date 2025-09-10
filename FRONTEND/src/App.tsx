import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetail from './pages/ModelDetail';
import ContentDetail from './pages/ContentDetail';
import Premium from './pages/Premium';
import DMCA from './pages/DMCA';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-dark-300">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<Models />} />
            <Route path="/model/:slug" element={<ModelDetail />} />
            <Route path="/content/:id" element={<ContentDetail />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/success" element={<PaymentSuccess />} />
            <Route path="/cancel" element={<PaymentCancel />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;