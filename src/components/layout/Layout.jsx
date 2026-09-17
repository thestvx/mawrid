import { Outlet } from 'react-router-dom';
import PillNav from './PillNav';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <PillNav />
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
