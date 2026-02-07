
import { safeDivide, roundTo2Decimals } from './db-utils';

export function calculateRecordBackend(data: any) {
    const production = parseFloat(data.production);
    const outdone = parseFloat(data.outdone);

    // Calculate costs
    const paper_cost = roundTo2Decimals(data.paper_quantity_kg * data.paper_rate);
    const paper_cost_per_tube = safeDivide(paper_cost, production);

    const paste_cost = roundTo2Decimals(data.paste_quantity * data.paste_rate);
    const paste_cost_per_tube = safeDivide(paste_cost, production);

    const outer_paste_cost = roundTo2Decimals(data.outer_paste_quantity * data.outer_paste_rate);
    const outer_paste_cost_per_tube = safeDivide(outer_paste_cost, production);

    const packing_cost = roundTo2Decimals(data.packing_quantity * data.packing_rate);
    const packing_cost_per_tube = safeDivide(packing_cost, production);

    const labour_cost = roundTo2Decimals(data.labour_count * data.labour_wage);
    const labour_cost_per_tube = safeDivide(labour_cost, production);

    const eb_cost_per_tube = safeDivide(data.eb_amount, production);
    const overheads_cost_per_tube = safeDivide(data.overheads_amount, production);
    const food_cost_per_tube = safeDivide(data.food_amount, production);

    const grand_total_cost_per_tube = roundTo2Decimals(
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
