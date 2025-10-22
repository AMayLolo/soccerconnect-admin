// admin-web/src/app/api/slack-test/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const hook = process.env.SLACK_WEBHOOK_URL;
  if (!hook) {
    return NextResponse.json({ status: 500, message: 'Missing SLACK_WEBHOOK_URL' }, { status: 500 });
  }

  const payload = {
    text: 'Soccer Connect • Admin test',
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Soccer Connect • Admin test' } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*Environment:*\nVercel' },
          { type: 'mrkdwn', text: '*Status:*\nOK ✅' },
        ],
      },
    ],
  };

  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`Slack responded ${r.status}`);
    return NextResponse.json({ status: 200, message: 'Sent to Slack' });
  } catch (e: any) {
    return NextResponse.json({ status: 500, message: e?.message ?? 'Error' }, { status: 500 });
  }
}
