// admin-web/src/app/slack/page.tsx
'use client';

import { useState } from 'react';

export default function SlackPage() {
  const [status, setStatus] = useState<string>('');

  async function send() {
    setStatus('Sending…');
    const res = await fetch('/api/slack-test', { method: 'POST' });
    const json = await res.json();
    setStatus(`${json.status}: ${json.message}`);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">Slack test</h1>
        <p className="text-sm text-slate-600">Uses your SLACK_WEBHOOK_URL env.</p>
        <button
          onClick={send}
          className="mt-4 px-4 py-2 rounded bg-sky-600 text-white font-semibold"
        >
          Send sample message
        </button>
        {status && <p className="mt-3 text-sm">{status}</p>}
      </div>
    </main>
  );
}
