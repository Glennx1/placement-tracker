import { NextRequest, NextResponse } from "next/server";
import { placementStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionId } = body;

    if (!actionId) {
      return NextResponse.json(
        { success: false, error: "Action ID is required" },
        { status: 400 }
      );
    }

    const updated = placementStore.toggleActionItem(actionId);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      allDrives: placementStore.getDrives(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
