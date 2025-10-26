'use client';

import { useMemo, useState } from 'react';

export default function PrettyJson({ value }: { value: any }) {
  const [expanded, setExpanded] = useState(true);

  const text = useMemo(() => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return String(value ?? '');
    }
  }, [value]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch {
      alert('Copy failed');
    }
  };

  return (
    <div className="border rounded bg-gray-50">
      <div className="flex items-center justify-between px-2 py-1 border-b bg-white">
        <div className="text-sm font-semibold">JSON</div>
        <div className="flex items-center gap-2">
          <button
            className="text-sm underline"
            onClick={() => setExpanded((x) => !x)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button className="text-sm underline" onClick={copy}>Copy</button>
        </div>
      </div>
      {expanded ? (
        <pre className="p-2 overflow-auto text-xs leading-5">{text}</pre>
      ) : (
        <div className="p-2 text-xs text-gray-600">Collapsed</div>
      )}
    </div>
  );
}
