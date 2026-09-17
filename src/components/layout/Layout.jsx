import { Outlet } from 'react-router-dom';
import GooeyNavBar from './GooeyNavBar';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <GooeyNavBar />
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
