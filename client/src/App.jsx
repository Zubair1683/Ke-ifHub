import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import UserPage from './pages/UserPage.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import ItemsList from './pages/ItemsList.jsx';
import ItemShow from './pages/ItemShow.jsx';
import ItemForm from './pages/ItemForm.jsx';
import Search from './pages/Search.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app">
      <a href="#main" className="skip">Skip to content</a>
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/profile" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="/users/:id" element={<UserPage />} />

          {/* :kind is campgrounds, products or projects (anything else shows "not found") */}
          <Route path="/:kind" element={<ItemsList />} />
          <Route path="/:kind/new" element={<ProtectedRoute><ItemForm mode="new" /></ProtectedRoute>} />
          <Route path="/:kind/:id" element={<ItemShow />} />
          <Route path="/:kind/:id/edit" element={<ProtectedRoute><ItemForm mode="edit" /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
