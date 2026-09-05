// AppLayout — wraps all authenticated pages with TopNav + page content area + floating AI chat widget.
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { NlpChatWidget } from '../components';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col relative">
      <TopNav />
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <NlpChatWidget />
    </div>
  );
}
