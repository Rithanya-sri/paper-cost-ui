// Database utility functions and calculation helpers

/**
 * Safe division that returns 0 if denominator is 0
 * Rounds to 2 decimal places
 */
export function safeDivide(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 100) / 100;
}

/**
 * Round to 2 decimal places
 */
export function roundTo2Decimals(num: number): number {
    return Math.round(num * 100) / 100;
}

/**
 * Calculate all costs and per-tube values for a production record
 */
export interface ProductionInputs {
    date: string;
    production: number;
    outdone: number;

    // Paper
    paper_quantity_kg: number;
    paper_rate: number;

    // Paste
    paste_quantity: number;
    paste_rate: number;

    // Outer Paste
    outer_paste_quantity: number;
    outer_paste_rate: number;

    // Packing
    packing_quantity: number;
    packing_rate: number;

    // Labour
    labour_count: number;
    labour_wage: number;

    // EB
    eb_units: number;
    eb_amount: number;

    // Overheads
    overheads_amount: number;

    // Food
    food_amount: number;
}

export interface CalculatedRecord extends ProductionInputs {
    // Calculated values
    paper_cost: number;
    paper_cost_per_tube: number;

    paste_cost: number;
    paste_cost_per_tube: number;

    outer_paste_cost: number;
    outer_paste_cost_per_tube: number;

    packing_cost: number;
    packing_cost_per_tube: number;

    labour_cost: number;
    labour_cost_per_tube: number;

    eb_cost_per_tube: number;
    overheads_cost_per_tube: number;
    food_cost_per_tube: number;

    grand_total_cost_per_tube: number;
}

/**
 * Calculate all derived values for a production record
 */
export function calculateProductionRecord(inputs: ProductionInputs): CalculatedRecord {
    const { production, outdone } = inputs;

    // 1. Paper Cost
    const paper_cost = roundTo2Decimals(inputs.paper_quantity_kg * inputs.paper_rate);
    const paper_cost_per_tube = safeDivide(paper_cost, production);

    // 2. Paste Cost
    const paste_cost = roundTo2Decimals(inputs.paste_quantity * inputs.paste_rate);
    const paste_cost_per_tube = safeDivide(paste_cost, production);

    // 3. Outer Paste Cost
    const outer_paste_cost = roundTo2Decimals(inputs.outer_paste_quantity * inputs.outer_paste_rate);
    const outer_paste_cost_per_tube = safeDivide(outer_paste_cost, production);

    // 4. Packing Cost
    const packing_cost = roundTo2Decimals(inputs.packing_quantity * inputs.packing_rate);
    const packing_cost_per_tube = safeDivide(packing_cost, production);

    // 5. Labour Cost
    const labour_cost = roundTo2Decimals(inputs.labour_count * inputs.labour_wage);
    const labour_cost_per_tube = safeDivide(labour_cost, production);

    // 6. EB Cost
    const eb_cost_per_tube = safeDivide(inputs.eb_amount, production);

    // 7. Overheads
    const overheads_cost_per_tube = safeDivide(inputs.overheads_amount, production);

    // 8. Food Cost
    const food_cost_per_tube = safeDivide(inputs.food_amount, production);

    // Grand Total Cost Per Tube
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
        ...inputs,
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

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
