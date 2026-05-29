import { useState } from 'react';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';

export default function App() {
  const [revenue, setRevenue] = useState<number | null>(null);

  const handleSubmit = (value: number) => {
    setRevenue(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setRevenue(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (revenue !== null) {
    return <Dashboard revenue={revenue} onReset={handleReset} />;
  }

  return <InputSection onSubmit={handleSubmit} />;
}
