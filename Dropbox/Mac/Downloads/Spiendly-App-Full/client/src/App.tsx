import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { NewExpensePage } from '@/pages/NewExpensePage';
import { ExpenseDetailPage } from '@/pages/ExpenseDetailPage';
import { InvitePage } from '@/pages/InvitePage';
import { Toaster } from '@/components/Toaster';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/expenses/new" element={<NewExpensePage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="/invite/:code" element={<InvitePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
