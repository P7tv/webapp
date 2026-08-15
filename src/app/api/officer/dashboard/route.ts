import { NextResponse } from 'next/server';
import dashboardData from '@/data/dashboard.json';

export async function GET() {
  return NextResponse.json(dashboardData);
}
