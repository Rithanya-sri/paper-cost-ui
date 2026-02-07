
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { calculateRecordBackend } from '@/lib/calculations';

// Use Edge Runtime for Cloudflare compatibility
// export const runtime = 'edge'; // Disabled for local dev with better-sqlite3

export async function GET() {
    try {
        const db = await getDB();
        const records = await db.query('SELECT * FROM daily_production_records ORDER BY date DESC');
        return NextResponse.json(records);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const calculated = calculateRecordBackend(data);
        const db = await getDB();

        const result = await db.execute(`
            INSERT INTO daily_production_records (
                date, production, outdone,
                paper_quantity_kg, paper_rate, paper_cost, paper_cost_per_tube,
                paste_quantity, paste_rate, paste_cost, paste_cost_per_tube,
                outer_paste_quantity, outer_paste_rate, outer_paste_cost, outer_paste_cost_per_tube,
                packing_quantity, packing_rate, packing_cost, packing_cost_per_tube,
                labour_count, labour_wage, labour_cost, labour_cost_per_tube,
                eb_units, eb_amount, eb_cost_per_tube,
                overheads_amount, overheads_cost_per_tube,
                food_amount, food_cost_per_tube,
                grand_total_cost_per_tube
            ) VALUES (
                ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?,
                ?
            )
        `, [
            calculated.date, calculated.production, calculated.outdone,
            calculated.paper_quantity_kg, calculated.paper_rate, calculated.paper_cost, calculated.paper_cost_per_tube,
            calculated.paste_quantity, calculated.paste_rate, calculated.paste_cost, calculated.paste_cost_per_tube,
            calculated.outer_paste_quantity, calculated.outer_paste_rate, calculated.outer_paste_cost, calculated.outer_paste_cost_per_tube,
            calculated.packing_quantity, calculated.packing_rate, calculated.packing_cost, calculated.packing_cost_per_tube,
            calculated.labour_count, calculated.labour_wage, calculated.labour_cost, calculated.labour_cost_per_tube,
            calculated.eb_units, calculated.eb_amount, calculated.eb_cost_per_tube,
            calculated.overheads_amount, calculated.overheads_cost_per_tube,
            calculated.food_amount, calculated.food_cost_per_tube,
            calculated.grand_total_cost_per_tube
        ]);

        return NextResponse.json({ success: true, id: result.lastInsertRowid, ...calculated }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
