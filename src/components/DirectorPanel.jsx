import React, { useState } from 'react';

export default function DirectorPanel({ notes, onNotesChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`director-panel ${open ? 'director-panel--open' : ''}`}>
      <button
        className="director-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle Director's Notes"
      >
        Director ✎
      </button>

      {open && (
        <div className="director-body">
          <textarea
            className="director-textarea"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={
              'Live simulation instructions. Changes take effect on the next message.\n\n' +
              'Examples:\n' +
              '• "Speak only in questions"\n' +
              '• "This character just received devastating news"\n' +
              '• "Shift to formal register"'
            }
            rows={6}
          />
        </div>
      )}
    </div>
  );
}
