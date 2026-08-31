import { NextRequest, NextResponse } from "next/server";
import { placementStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "clear_all") {
      placementStore.clearAllDrives();
    }

    return NextResponse.json({
      success: true,
      data: {
        syncedCount: placementStore.getDrives().length,
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
