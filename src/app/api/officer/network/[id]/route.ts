import { NextRequest, NextResponse } from 'next/server';
import dashboardData from '@/data/dashboard.json';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const accountId = id;
  const allAccounts = dashboardData.accounts || [];

  const nodes = [
    {
      id: String(accountId),
      group: 1,
      val: 15,
      status: "Selected",
      name: `Account ${accountId}`,
    },
  ];
  const links: { source: string; target: string; value: number }[] = [];

  const candidates = allAccounts.filter((acc: any) => String(acc.account_id) !== String(accountId));

  if (candidates.length > 0) {
    // Deterministic pseudo-random selection based on accountId
    let seed = parseInt(accountId) || 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const numPartners = Math.min(Math.floor(random() * 10) + 5, candidates.length);
    const shuffled = [...candidates].sort(() => 0.5 - random());
    const partners = shuffled.slice(0, numPartners);

    for (const partner of partners) {
      const partnerId = String(partner.account_id);
      const isRisky = partner.status === "High Risk";
      nodes.push({
        id: partnerId,
        group: isRisky ? 1 : 2,
        val: isRisky ? 5 : 3,
        status: partner.status,
        name: `Account ${partnerId}`,
      });

      if (random() > 0.5) {
        links.push({
          source: String(accountId),
          target: partnerId,
          value: Math.floor(random() * 49000) + 1000,
        });
      } else {
        links.push({
          source: partnerId,
          target: String(accountId),
          value: Math.floor(random() * 49000) + 1000,
        });
      }
    }
  }

  return NextResponse.json({ nodes, links });
}
