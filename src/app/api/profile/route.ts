import { NextRequest, NextResponse } from "next/server";
import { placementStore } from "@/lib/store";

export async function GET() {
  try {
    const profile = placementStore.getProfile();
    return NextResponse.json({ success: true, data: profile });
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
    const { cgpa, branch, usn, name, activeBacklogs } = body;

    const updates: Record<string, unknown> = {};
    if (cgpa !== undefined) updates.cgpa = parseFloat(cgpa);
    if (branch !== undefined) updates.branch = branch;
    if (usn !== undefined) updates.usn = usn;
    if (name !== undefined) updates.name = name;
    if (activeBacklogs !== undefined) updates.activeBacklogs = parseInt(activeBacklogs);

    const updatedProfile = placementStore.updateProfile(updates);

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedProfile,
        allDrives: placementStore.getDrives(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
