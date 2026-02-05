// API route handler with parameter support for Cloudflare Workers

interface Env {
    DB: any;
}

export async function onRequest(context: { env: Env; params: any; request: Request }) {
    const { id } = context.params;
    const { request, env } = context;
    const method = request.method;

    // Helper to calculate all values
    function calculateRecord(data: any) {
        const { production, outdone } = data;

        const safeDivide = (num: number, den: number) => {
            if (den === 0) return 0;
            return Math.round((num / den) * 100) / 100;
        };

        const round = (num: number) => Math.round(num * 100) / 100;

        // Calculate costs
        const paper_cost = round(data.paper_quantity_kg * data.paper_rate);
        const paper_cost_per_tube = safeDivide(paper_cost, outdone);

        const paste_cost = round(data.paste_quantity * data.paste_rate);
        const paste_cost_per_tube = safeDivide(paste_cost, outdone);

        const outer_paste_cost = round(data.outer_paste_quantity * data.outer_paste_rate);
        const outer_paste_cost_per_tube = safeDivide(outer_paste_cost, outdone);

        const packing_cost = round(data.packing_quantity * data.packing_rate);
        const packing_cost_per_tube = safeDivide(packing_cost, production);

        const labour_cost = round(data.labour_count * data.labour_wage);
        const labour_cost_per_tube = safeDivide(labour_cost, production);

        const eb_cost_per_tube = safeDivide(data.eb_amount, production);
        const overheads_cost_per_tube = safeDivide(data.overheads_amount, production);
        const food_cost_per_tube = safeDivide(data.food_amount, production);

        const grand_total_cost_per_tube = round(
            paper_cost_per_tube +
            paste_cost_per_tube +
            outer_paste_cost_per_tube +
            packing_cost_per_tube +
            labour_cost_per_tube +
            eb_cost_per_tube +
            overheads_cost_per_tube +
            food_cost_per_tube
        );

        return {
            ...data,
            paper_cost,
            paper_cost_per_tube,
            paste_cost,
            paste_cost_per_tube,
            outer_paste_cost,
            outer_paste_cost_per_tube,
            packing_cost,
            packing_cost_per_tube,
            labour_cost,
            labour_cost_per_tube,
            eb_cost_per_tube,
            overheads_cost_per_tube,
            food_cost_per_tube,
            grand_total_cost_per_tube,
        };
    }

    try {
        if (method === 'GET') {
            if (id) {
                // Get single record
                const result = await env.DB.prepare(
                    'SELECT * FROM daily_production_records WHERE id = ?'
                ).bind(id).first();

                if (!result) {
                    return new Response(JSON.stringify({ error: 'Record not found' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                return new Response(JSON.stringify(result), {
                    headers: { 'Content-Type': 'application/json' },
                });
            } else {
                // Get all records
                const result = await env.DB.prepare(
                    'SELECT * FROM daily_production_records ORDER BY date DESC'
                ).all();

                return new Response(JSON.stringify(result.results), {
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        if (method === 'POST') {
            const data = await request.json();
            const calculated = calculateRecord(data);

            const result = await env.DB.prepare(`
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
      `).bind(
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
            ).run();

            return new Response(JSON.stringify({
                success: true,
                id: result.meta.last_row_id,
                ...calculated
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (method === 'PUT' && id) {
            const data = await request.json();
            const calculated = calculateRecord(data);

            await env.DB.prepare(`
        UPDATE daily_production_records SET
          date = ?, production = ?, outdone = ?,
          paper_quantity_kg = ?, paper_rate = ?, paper_cost = ?, paper_cost_per_tube = ?,
          paste_quantity = ?, paste_rate = ?, paste_cost = ?, paste_cost_per_tube = ?,
          outer_paste_quantity = ?, outer_paste_rate = ?, outer_paste_cost = ?, outer_paste_cost_per_tube = ?,
          packing_quantity = ?, packing_rate = ?, packing_cost = ?, packing_cost_per_tube = ?,
          labour_count = ?, labour_wage = ?, labour_cost = ?, labour_cost_per_tube = ?,
          eb_units = ?, eb_amount = ?, eb_cost_per_tube = ?,
          overheads_amount = ?, overheads_cost_per_tube = ?,
          food_amount = ?, food_cost_per_tube = ?,
          grand_total_cost_per_tube = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
                calculated.date, calculated.production, calculated.outdone,
                calculated.paper_quantity_kg, calculated.paper_rate, calculated.paper_cost, calculated.paper_cost_per_tube,
                calculated.paste_quantity, calculated.paste_rate, calculated.paste_cost, calculated.paste_cost_per_tube,
                calculated.outer_paste_quantity, calculated.outer_paste_rate, calculated.outer_paste_cost, calculated.outer_paste_cost_per_tube,
                calculated.packing_quantity, calculated.packing_rate, calculated.packing_cost, calculated.packing_cost_per_tube,
                calculated.labour_count, calculated.labour_wage, calculated.labour_cost, calculated.labour_cost_per_tube,
                calculated.eb_units, calculated.eb_amount, calculated.eb_cost_per_tube,
                calculated.overheads_amount, calculated.overheads_cost_per_tube,
                calculated.food_amount, calculated.food_cost_per_tube,
                calculated.grand_total_cost_per_tube,
                id
            ).run();

            return new Response(JSON.stringify({ success: true, ...calculated }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (method === 'DELETE' && id) {
            await env.DB.prepare(
                'DELETE FROM daily_production_records WHERE id = ?'
            ).bind(id).run();

            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
