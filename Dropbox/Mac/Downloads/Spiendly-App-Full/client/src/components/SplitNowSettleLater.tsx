
import React, { useState } from 'react';

const SplitNowSettleLater = () => {
  const [participants, setParticipants] = useState([
    { name: 'Tia', amount: 20, due: '2025-05-20' },
    { name: 'Chris', amount: 30, due: '2025-05-22' },
  ]);

  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const addSplit = () => {
    if (!newName || !newAmount || !newDueDate) return;
    setParticipants([
      ...participants,
      { name: newName, amount: parseFloat(newAmount), due: newDueDate },
    ]);
    setNewName('');
    setNewAmount('');
    setNewDueDate('');
  };

  return (
    <div className="bg-spiendly-card p-6 rounded-lg shadow-md text-spiendly-text space-y-4">
      <h2 className="text-lg font-semibold">Split Now, Settle Later</h2>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name"
          className="border border-spiendly-accent p-2 rounded-md"
        />
        <input
          type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          placeholder="$"
          className="border border-spiendly-accent p-2 rounded-md"
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="border border-spiendly-accent p-2 rounded-md"
        />
      </div>
      <button
        onClick={addSplit}
        className="bg-spiendly-accent text-white px-4 py-2 rounded hover:opacity-90 transition"
      >
        Add Split
      </button>
      <ul className="mt-4 space-y-2 text-sm">
        {participants.map((p, i) => (
          <li key={i} className="border border-spiendly-background bg-white/30 rounded-md px-4 py-2 flex justify-between">
            <span>{p.name} owes ${p.amount}</span>
            <span className="text-xs text-spiendly-text/70">Due by {p.due}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SplitNowSettleLater;
