import { NextRequest, NextResponse } from "next/server";
import { placementStore } from "@/lib/store";
import { SAMPLE_PES_EMAILS } from "@/lib/sampleEmails";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mode = "sample_batch" } = body;

    const processedEvents = [];
    
    // Ingest all sample emails that might not be in the store yet
    if (mode === "sample_batch" || mode === "full_sync") {
      for (const email of SAMPLE_PES_EMAILS) {
        const result = await placementStore.ingestRawEmail({
          subject: email.subject,
          sender: email.sender,
          body: email.body,
          receivedAt: email.receivedAt,
          gmailMessageId: email.id,
        });
        processedEvents.push(result);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        syncedCount: processedEvents.length,
        drives: placementStore.getDrives(),
        logs: placementStore.getLogs(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
