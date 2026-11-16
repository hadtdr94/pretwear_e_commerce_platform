import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AnnouncementBar />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
