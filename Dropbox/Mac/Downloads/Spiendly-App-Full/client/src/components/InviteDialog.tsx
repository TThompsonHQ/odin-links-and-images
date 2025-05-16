
import React, { useState } from 'react';

const InviteDialog = () => {
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://spiendly.app/invite/group123';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSMS = () => {
    window.open(`sms:?&body=Join our Spiendly group! ${inviteLink}`, '_blank');
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=Join our Spiendly group&body=Let’s split smarter with Spiendly! ${inviteLink}`, '_blank');
  };

  return (
    <div className="bg-spiendly-card p-6 rounded-lg shadow-md text-spiendly-text space-y-4">
      <h2 className="text-lg font-semibold">Invite Your Friends</h2>
      <div className="bg-white rounded-md px-4 py-2 border border-spiendly-accent text-sm">{inviteLink}</div>
      <div className="flex space-x-3">
        <button
          onClick={handleCopy}
          className="bg-spiendly-accent text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          onClick={handleSMS}
          className="bg-spiendly-badge text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Send SMS
        </button>
        <button
          onClick={handleEmail}
          className="bg-spiendly-alert text-white px-4 py-2 rounded hover:opacity-90 transition"
        >
          Send Email
        </button>
      </div>
    </div>
  );
};

export default InviteDialog;
