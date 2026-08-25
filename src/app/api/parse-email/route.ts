import { NextRequest, NextResponse } from "next/server";
import { placementStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, sender, body: emailBody, receivedAt, gmailMessageId } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: "Subject and email body are required" },
        { status: 400 }
      );
    }

    const result = await placementStore.ingestRawEmail({
      subject,
      sender: sender || "placement@pes.edu",
      body: emailBody,
      receivedAt: receivedAt || new Date().toISOString(),
      gmailMessageId,
    });

    return NextResponse.json({
      success: true,
      data: {
        drive: result.drive,
        event: result.event,
        log: result.log,
        allDrives: placementStore.getDrives(),
      },
    });
  } catch (error) {
    console.error("Email parsing error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
