import { NextRequest, NextResponse } from 'next/server';
import usersData from '@/data/users.json';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = (usersData as Record<string, any>)[id];

  if (!user) {
    return NextResponse.json(
      { error: "Account not found in loan dataset" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}
