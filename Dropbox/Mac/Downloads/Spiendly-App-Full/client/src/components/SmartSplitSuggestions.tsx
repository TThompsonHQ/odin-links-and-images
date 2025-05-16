
import React, { useState } from 'react';

const SmartSplitSuggestions = () => {
  const [expenseType, setExpenseType] = useState('Dinner');
  const [suggestion, setSuggestion] = useState('');

  const suggestionsMap: Record<string, string> = {
    'Dinner': 'Split by itemized shares or uneven amounts',
    'Rent': 'Split evenly among roommates',
    'Trip': 'Split by custom percentages or who attended which event',
    'Groceries': 'Split by who added what to the cart',
    'Bills': 'Split based on usage or evenly',
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setExpenseType(type);
    setSuggestion(suggestionsMap[type] || 'Split evenly');
  };

  return (
    <div className="bg-spiendly-card p-6 rounded-lg shadow-md text-spiendly-text space-y-4">
      <h2 className="text-lg font-semibold">Smart Split Suggestion</h2>
      <label htmlFor="expense-type" className="text-sm">Select expense type:</label>
      <select
        id="expense-type"
        value={expenseType}
        onChange={handleSelectChange}
        className="w-full px-3 py-2 border border-spiendly-accent rounded-md bg-white"
      >
        {Object.keys(suggestionsMap).map((type, index) => (
          <option key={index} value={type}>{type}</option>
        ))}
      </select>
      {suggestion && (
        <div className="mt-2 text-sm italic text-spiendly-text">
          Recommended: {suggestion}
        </div>
      )}
    </div>
  );
};

export default SmartSplitSuggestions;
