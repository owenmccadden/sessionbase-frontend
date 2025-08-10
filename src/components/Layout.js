import Header from './Header';
import MobileBanner from './MobileBanner';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <MobileBanner />
      <Header />
      <main>{children}</main>
    </div>
  );
}
