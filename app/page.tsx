"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { formatCurrency } from "@/lib/db-utils";

interface ProductionRecord {
  id?: number;
  date: string;
  production: number;
  outdone: number;

  paper_quantity_kg: number;
  paper_rate: number;
  paper_cost: number;
  paper_cost_per_tube: number;

  paste_quantity: number;
  paste_rate: number;
  paste_cost: number;
  paste_cost_per_tube: number;

  outer_paste_quantity: number;
  outer_paste_rate: number;
  outer_paste_cost: number;
  outer_paste_cost_per_tube: number;

  packing_quantity: number;
  packing_rate: number;
  packing_cost: number;
  packing_cost_per_tube: number;

  labour_count: number;
  labour_wage: number;
  labour_cost: number;
  labour_cost_per_tube: number;

  eb_units: number;
  eb_amount: number;
  eb_cost_per_tube: number;

  overheads_amount: number;
  overheads_cost_per_tube: number;

  food_amount: number;
  food_cost_per_tube: number;

  grand_total_cost_per_tube: number;
}

export default function Home() {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    production: 0,
    outdone: 0,
    paper_quantity_kg: 0,
    paper_rate: 0,
    paste_quantity: 0,
    paste_rate: 0,
    outer_paste_quantity: 0,
    outer_paste_rate: 0,
    packing_quantity: 0,
    packing_rate: 0,
    labour_count: 0,
    labour_wage: 0,
    eb_units: 0,
    eb_amount: 0,
    overheads_amount: 0,
    food_amount: 0,
  });

  const [calculated, setCalculated] = useState({
    paper_cost: 0,
    paper_cost_per_tube: 0,
    paste_cost: 0,
    paste_cost_per_tube: 0,
    outer_paste_cost: 0,
    outer_paste_cost_per_tube: 0,
    packing_cost: 0,
    packing_cost_per_tube: 0,
    labour_cost: 0,
    labour_cost_per_tube: 0,
    eb_cost_per_tube: 0,
    overheads_cost_per_tube: 0,
    food_cost_per_tube: 0,
    grand_total_cost_per_tube: 0,
    rejection: 0,
  });

  // Real-time calculation - ORIGINAL LOGIC
  useEffect(() => {
    const safeDivide = (num: number, den: number) => (den === 0 ? 0 : Math.round((num / den) * 100) / 100);
    const round = (num: number) => Math.round(num * 100) / 100;

    const paper_cost = round(formData.paper_quantity_kg * formData.paper_rate);
    const paper_cost_per_tube = safeDivide(paper_cost, formData.outdone);

    const paste_cost = round(formData.paste_quantity * formData.paste_rate);
    const paste_cost_per_tube = safeDivide(paste_cost, formData.outdone);

    const outer_paste_cost = round(formData.outer_paste_quantity * formData.outer_paste_rate);
    const outer_paste_cost_per_tube = safeDivide(outer_paste_cost, formData.outdone);

    const packing_cost = round(formData.packing_quantity * formData.packing_rate);
    const packing_cost_per_tube = safeDivide(packing_cost, formData.production);

    const labour_cost = round(formData.labour_count * formData.labour_wage);
    const labour_cost_per_tube = safeDivide(labour_cost, formData.production);

    const eb_cost_per_tube = safeDivide(formData.eb_amount, formData.production);
    const overheads_cost_per_tube = safeDivide(formData.overheads_amount, formData.production);
    const food_cost_per_tube = safeDivide(formData.food_amount, formData.production);

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

    const rejection = formData.production - formData.outdone;

    setCalculated({
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
      rejection,
    });
  }, [formData]);

  // Load records
  const loadRecords = async () => {
    try {
      const res = await fetch('/api/production');
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue >= 0 ? numValue : 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      ...calculated,
    };

    try {
      if (editingRecord) {
        await fetch(`/api/production/${editingRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/production', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      loadRecords();
      resetForm();
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('Failed to save record');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      production: 0,
      outdone: 0,
      paper_quantity_kg: 0,
      paper_rate: 0,
      paste_quantity: 0,
      paste_rate: 0,
      outer_paste_quantity: 0,
      outer_paste_rate: 0,
      packing_quantity: 0,
      packing_rate: 0,
      labour_count: 0,
      labour_wage: 0,
      eb_units: 0,
      eb_amount: 0,
      overheads_amount: 0,
      food_amount: 0,
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: ProductionRecord) => {
    setFormData({
      date: record.date,
      production: record.production,
      outdone: record.outdone,
      paper_quantity_kg: record.paper_quantity_kg,
      paper_rate: record.paper_rate,
      paste_quantity: record.paste_quantity,
      paste_rate: record.paste_rate,
      outer_paste_quantity: record.outer_paste_quantity,
      outer_paste_rate: record.outer_paste_rate,
      packing_quantity: record.packing_quantity,
      packing_rate: record.packing_rate,
      labour_count: record.labour_count,
      labour_wage: record.labour_wage,
      eb_units: record.eb_units,
      eb_amount: record.eb_amount,
      overheads_amount: record.overheads_amount,
      food_amount: record.food_amount,
    });
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await fetch(`/api/production/${id}`, { method: 'DELETE' });
      loadRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('Failed to delete record');
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper" style={{ paddingBottom: '180px' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
          }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#1e293b',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              Daily Cost & Production Management
            </h1>
            <p style={{
              color: '#475569',
              fontSize: '0.9rem',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Enter daily production and costs to calculate per-tube cost and total cost
            </p>
          </div>

          {/* Data Entry Form */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <form onSubmit={handleSubmit}>
              {/* Date Only at Top */}
              <div style={{
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
              }}>
                <div className="form-group" style={{ marginBottom: 0, maxWidth: '250px' }}>
                  <label className="form-label" style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                    📅 Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Cost Sections Together */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '1rem',
                }}>
                  💰 Cost Details
                </h3>

                {/* Paper Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    📄 Paper Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Quantity (kg)</label>
                      <input type="number" name="paper_quantity_kg" className="form-input" value={formData.paper_quantity_kg || ''} onChange={handleChange} step="0.01" min="0" placeholder="250" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Rate (₹/kg)</label>
                      <input type="number" name="paper_rate" className="form-input" value={formData.paper_rate || ''} onChange={handleChange} step="0.01" min="0" placeholder="45.50" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Total Cost</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.paper_cost)} readOnly style={{ background: 'rgba(102, 126, 234, 0.08)', fontWeight: 500 }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.paper_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Paste Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    🧪 Paste Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Quantity (kg)</label>
                      <input type="number" name="paste_quantity" className="form-input" value={formData.paste_quantity || ''} onChange={handleChange} step="0.01" min="0" placeholder="50" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Rate (₹/kg)</label>
                      <input type="number" name="paste_rate" className="form-input" value={formData.paste_rate || ''} onChange={handleChange} step="0.01" min="0" placeholder="30.00" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Total Cost</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.paste_cost)} readOnly style={{ background: 'rgba(102, 126, 234, 0.08)', fontWeight: 500 }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.paste_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Outer Paste Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    🎨 Outer Paste Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Quantity (kg)</label>
                      <input type="number" name="outer_paste_quantity" className="form-input" value={formData.outer_paste_quantity || ''} onChange={handleChange} step="0.01" min="0" placeholder="30" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Rate (₹/kg)</label>
                      <input type="number" name="outer_paste_rate" className="form-input" value={formData.outer_paste_rate || ''} onChange={handleChange} step="0.01" min="0" placeholder="35.00" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Total Cost</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.outer_paste_cost)} readOnly style={{ background: 'rgba(102, 126, 234, 0.08)', fontWeight: 500 }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.outer_paste_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Packing Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    📦 Packing Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Quantity</label>
                      <input type="number" name="packing_quantity" className="form-input" value={formData.packing_quantity || ''} onChange={handleChange} step="0.01" min="0" placeholder="100" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Rate (₹)</label>
                      <input type="number" name="packing_rate" className="form-input" value={formData.packing_rate || ''} onChange={handleChange} step="0.01" min="0" placeholder="5.00" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Total Cost</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.packing_cost)} readOnly style={{ background: 'rgba(102, 126, 234, 0.08)', fontWeight: 500 }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.packing_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Labour Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    👷 Labour Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>No. of Workers</label>
                      <input type="number" name="labour_count" className="form-input" value={formData.labour_count || ''} onChange={handleChange} step="0.01" min="0" placeholder="10" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Avg Wage/Day (₹)</label>
                      <input type="number" name="labour_wage" className="form-input" value={formData.labour_wage || ''} onChange={handleChange} step="0.01" min="0" placeholder="500" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Total Labour Cost</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.labour_cost)} readOnly style={{ background: 'rgba(102, 126, 234, 0.08)', fontWeight: 500 }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.labour_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Electricity Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    ⚡ Electricity (EB) Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Units Used</label>
                      <input type="number" name="eb_units" className="form-input" value={formData.eb_units || ''} onChange={handleChange} step="0.01" min="0" placeholder="150" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Amount (₹)</label>
                      <input type="number" name="eb_amount" className="form-input" value={formData.eb_amount || ''} onChange={handleChange} step="0.01" min="0" placeholder="1200" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}></div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.eb_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Overheads Cost */}
                <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    🏢 Overheads
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Amount (₹)</label>
                      <input type="number" name="overheads_amount" className="form-input" value={formData.overheads_amount || ''} onChange={handleChange} step="0.01" min="0" placeholder="2000" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}></div>
                    <div className="form-group" style={{ marginBottom: 0 }}></div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.overheads_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>

                {/* Food Cost */}
                <div style={{
                  marginBottom: '0',
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.03)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
                    🍽️ Food Cost
                  </div>
                  <div className="grid grid-4" style={{ gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155' }}>Amount (₹)</label>
                      <input type="number" name="food_amount" className="form-input" value={formData.food_amount || ''} onChange={handleChange} step="0.01" min="0" placeholder="800" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}></div>
                    <div className="form-group" style={{ marginBottom: 0 }}></div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>Cost/Tube</label>
                      <input type="text" className="form-input" value={formatCurrency(calculated.food_cost_per_tube)} readOnly style={{ background: 'rgba(102, 126, 234, 0.15)', fontWeight: 700, color: '#667eea' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Production Section - After Cost Section */}
              <div style={{
                marginBottom: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(102, 126, 234, 0.1)',
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '1rem',
                }}>
                  🏭 Production Details
                </h3>

                <div className="grid grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                      Production (tubes) *
                    </label>
                    <input
                      type="number"
                      name="production"
                      className="form-input"
                      value={formData.production || ''}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="10000"
                      required
                    />
                    <small style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      Total tubes manufactured
                    </small>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
                      Outdone (tubes) *
                    </label>
                    <input
                      type="number"
                      name="outdone"
                      className="form-input"
                      value={formData.outdone || ''}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="9500"
                      required
                    />
                    <small style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                      Good tubes only
                    </small>
                  </div>
                </div>

                {calculated.rejection > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderLeft: '3px solid #f59e0b',
                    borderRadius: '0.25rem',
                    fontSize: '0.85rem',
                    color: '#d97706',
                    fontWeight: 600,
                  }}>
                    ⚠️ Rejection: {calculated.rejection.toFixed(2)} tubes ({((calculated.rejection / formData.production) * 100).toFixed(1)}%)
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                  {editingRecord ? '💾 Update Record' : '💾 Save Record'}
                </button>
                {editingRecord && (
                  <button type="button" onClick={resetForm} className="btn btn-secondary btn-lg">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Records Table */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0,
              }}>
                📊 Production Records
              </h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Production</th>
                    <th>Outdone</th>
                    <th>Rejection</th>
                    <th>Grand Total (₹/tube)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                        No records found. Add your first production record above.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString('en-IN')}</td>
                        <td>{record.production.toFixed(2)}</td>
                        <td>{record.outdone.toFixed(2)}</td>
                        <td style={{ color: record.production - record.outdone > 0 ? '#f59e0b' : '#10b981' }}>
                          {(record.production - record.outdone).toFixed(2)}
                        </td>
                        <td style={{ fontWeight: 700, color: '#667eea', fontSize: '1.05rem' }}>
                          {formatCurrency(record.grand_total_cost_per_tube)}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="btn btn-sm btn-secondary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record.id!)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Summary Card at Bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid rgba(102, 126, 234, 0.2)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        zIndex: 999,
        padding: '1rem 0',
      }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
            {/* Cost Breakdown */}
            <div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#475569',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Cost Breakdown (Per Tube)
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
              }}>
                {[
                  { label: '📄 Paper', value: calculated.paper_cost_per_tube },
                  { label: '🧪 Paste', value: calculated.paste_cost_per_tube },
                  { label: '🎨 Outer Paste', value: calculated.outer_paste_cost_per_tube },
                  { label: '📦 Packing', value: calculated.packing_cost_per_tube },
                  { label: '👷 Labour', value: calculated.labour_cost_per_tube },
                  { label: '⚡ EB', value: calculated.eb_cost_per_tube },
                  { label: '🏢 Overheads', value: calculated.overheads_cost_per_tube },
                  { label: '🍽️ Food', value: calculated.food_cost_per_tube },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(102, 126, 234, 0.06)',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.5rem',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
            }}>
              <div style={{
                fontSize: '0.75rem',
                opacity: 0.95,
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}>
                Final Cost Per Tube
              </div>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.85,
                marginBottom: '0.5rem',
              }}>
                (All Costs Included)
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}>
                {formatCurrency(calculated.grand_total_cost_per_tube)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
