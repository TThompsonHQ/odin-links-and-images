
import React, { useEffect, useState } from 'react';

const overdueMembers = [
  { name: 'Chris', amount: 20, overdueSince: '2024-12-01T12:00:00Z' },
  { name: 'Erin', amount: 15, overdueSince: '2025-05-01T10:30:00Z' },
];

const getTimeElapsed = (dateString: string) => {
  const now = new Date();
  const overdueDate = new Date(dateString);
  const diffMs = now.getTime() - overdueDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${diffDays}d ${diffHours}h overdue`;
};

const AccountabilityTimer = () => {
  const [elapsed, setElapsed] = useState<string[]>([]);

  useEffect(() => {
    const updateElapsed = () => {
      const times = overdueMembers.map((m) => getTimeElapsed(m.overdueSince));
      setElapsed(times);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 60 * 1000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-spiendly-card p-6 rounded-lg shadow-md text-spiendly-text space-y-4">
      <h2 className="text-lg font-semibold">Accountability Timers</h2>
      <ul className="space-y-2 text-sm">
        {overdueMembers.map((m, i) => (
          <li key={i} className="flex justify-between items-center border border-spiendly-background bg-white/30 rounded-md px-4 py-2">
            <span><strong>{m.name}</strong> owes ${m.amount}</span>
            <span className="text-xs text-spiendly-alert font-medium">{elapsed[i]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountabilityTimer;
