
import React, { useState } from 'react';

const GroupPayPot = () => {
  const [goal] = useState(200); // Example goal amount
  const [contributions, setContributions] = useState([
    { user: 'Tia', amount: 50 },
    { user: 'Chris', amount: 25 },
  ]);

  const total = contributions.reduce((sum, c) => sum + c.amount, 0);
  const percent = Math.min(100, (total / goal) * 100).toFixed(0);

  const handleAddContribution = () => {
    const amount = parseFloat(prompt("Enter amount to contribute:") || "0");
    if (!isNaN(amount) && amount > 0) {
      setContributions([...contributions, { user: 'You', amount }]);
    }
  };

  return (
    <div className="bg-spiendly-card p-6 rounded-lg shadow-md text-spiendly-text space-y-4">
      <h2 className="text-lg font-semibold">Group Pay Pot</h2>
      <div className="text-sm">Goal: ${goal} | Collected: ${total}</div>
      <div className="w-full h-4 bg-spiendly-background rounded-full overflow-hidden">
        <div
          className="h-full bg-spiendly-badge transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-right text-spiendly-text/70">{percent}% full</div>
      <ul className="text-sm list-disc pl-5 space-y-1">
        {contributions.map((c, i) => (
          <li key={i}>
            {c.user}: ${c.amount}
          </li>
        ))}
      </ul>
      <button
        onClick={handleAddContribution}
        className="mt-3 bg-spiendly-accent text-white px-4 py-2 rounded hover:opacity-90 transition"
      >
        Add Contribution
      </button>
      {total >= goal && (
        <div className="text-center text-spiendly-alert font-semibold mt-3">Goal reached! Ready to pay.</div>
      )}
    </div>
  );
};

export default GroupPayPot;
