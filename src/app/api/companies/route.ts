import { NextRequest, NextResponse } from "next/server";
import { placementStore } from "@/lib/store";

export async function GET() {
  try {
    const drives = placementStore.getDrives();
    const profile = placementStore.getProfile();
    return NextResponse.json({
      success: true,
      data: {
        drives,
        profile,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, driveId, status } = body;

    if (action === "update_status" && driveId && status) {
      const updated = placementStore.updateDriveStatus(driveId, status);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "clear_all" || action === "reset_demo") {
      placementStore.clearAllDrives();
      return NextResponse.json({
        success: true,
        data: {
          drives: placementStore.getDrives(),
          profile: placementStore.getProfile(),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
