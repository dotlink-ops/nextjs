// Runtime: Node.js (default)
// Justification: Uses process/env/IO
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Load the user token stored in Supabase or your session storage
    auth.setCredentials(JSON.parse(process.env.GOOGLE_USER_TOKEN!));

    const calendar = google.calendar({ version: "v3", auth });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const events = await calendar.events.list({
      calendarId: process.env.GCAL_TARGET_CALENDAR || "primary",
      timeMin: todayStart.toISOString(),
      timeMax: todayEnd.toISOString(),
      singleEvents: true,
      orderBy: "startTime"
    });

    return NextResponse.json({
      events: events.data.items || []
    });

  } catch (err: any) {
    console.error("Google Calendar error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
