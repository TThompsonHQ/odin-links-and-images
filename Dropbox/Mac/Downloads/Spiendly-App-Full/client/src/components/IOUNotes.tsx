
import React, { useState } from 'react';

const IOUNotes = () => {
  const [notes, setNotes] = useState([
    { from: 'Tia', to: 'Chris', message: 'I got you this time.', time: '2h ago' },
    { from: 'Erin', to: 'Tia', message: 'Thanks for covering brunch.', time: '1d ago' },
  ]);
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    if (note.trim() !== '') {
      setNotes([{ from: 'You', to: 'Group', message: note, time: 'now' }, ...notes]);
      setNote('');
    }
  };

  return (
    <div className="bg-spiendly-card p-6 rounded-lg shadow-md text-spiendly-text space-y-4">
      <h2 className="text-lg font-semibold">IOU Notes</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write something like ‘I got you this time’..."
        className="w-full p-2 border border-spiendly-accent rounded-md resize-none bg-white"
        rows={3}
      />
      <button
        onClick={handleAddNote}
        className="bg-spiendly-accent text-white px-4 py-2 rounded hover:opacity-90 transition"
      >
        Add Note
      </button>
      <ul className="space-y-2 text-sm">
        {notes.map((n, i) => (
          <li key={i} className="border border-spiendly-background bg-white/30 rounded-md p-3">
            <strong>{n.from}</strong> to <strong>{n.to}</strong>: “{n.message}”
            <div className="text-xs text-spiendly-text/70 mt-1">{n.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IOUNotes;
