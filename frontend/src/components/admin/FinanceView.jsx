import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/financeAPI';
import { academicAPI } from '../../services/academicAPI';
import api from '../../utils/api';

const FinanceView = () => {
  const [activeTab, setActiveTab] = useState('invoices'); // invoices, generate, generate_custom, discounts, payments, reports, reminders
  const [invoices, setInvoices] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportFilter, setReportFilter] = useState({ date_start: '', date_end: '', search: '', payment_method: '' });
  
  const [messages, setMessages] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [msgForm, setMsgForm] = useState({ id: null, message_text: '' });
  const [schForm, setSchForm] = useState({ id: null, message_ids: [], schedule_type: 'once', frequency_days: 7 });

  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  // Generate Bulk form
  const [genForm, setGenForm] = useState({
    semester_id: '',
    year_id: '',
    invoice_type: 'TUITION',
    issue_date: new Date().toISOString().substring(0, 10),
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
    commencement_date: '',
    end_date: '',
    late_fee: 0,
  });

  // Custom Invoice form
  const [customForm, setCustomForm] = useState({
    semester_id: '',
    year_id: '',
    invoice_type: 'GENERAL',
    issue_date: new Date().toISOString().substring(0, 10),
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
    commencement_date: '',
    end_date: '',
    late_fee: 0,
    items: [{ item_name: 'Tuition Fee', amount: 0 }]
  });

  // Discount form
  const [discountForm, setDiscountForm] = useState({
    year_id: '',
    student_id: '',
    discount_amount: '',
    remark: ''
  });

  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if ((activeTab === 'generate_custom' || activeTab === 'discounts') && (customForm.year_id || discountForm.year_id)) {
      const yearId = activeTab === 'discounts' ? discountForm.year_id : customForm.year_id;
      if (yearId) fetchStudents(yearId);
    }
  }, [customForm.year_id, discountForm.year_id, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'invoices' || activeTab === 'payments') {
        const res = await financeAPI.getAllInvoices();
        setInvoices(res.data || []);
      }
      
      if (activeTab === 'generate' || activeTab === 'generate_custom' || activeTab === 'discounts') {
        const [yearsRes, semRes] = await Promise.all([
          academicAPI.getYears(),
          academicAPI.getSemesters()
        ]);
        setYears(yearsRes.data || []);
        setSemesters(semRes.data || []);
      }

      if (activeTab === 'discounts') {
        fetchDiscounts();
      }
      if (activeTab === 'reports') {
        fetchReports();
      }
      if (activeTab === 'reminders') {
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
    setLoading(false);
  };

  const fetchDiscounts = async () => {
    try {
      const res = await financeAPI.getDiscounts();
      setDiscounts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch discounts', error);
    }
  };

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const [msgRes, schRes] = await Promise.all([
        financeAPI.getReminderMessages(),
        financeAPI.getReminderSchedules()
      ]);
      setMessages(msgRes.data || []);
      setSchedules(schRes.data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await financeAPI.getPaymentReports(reportFilter);
      setReports(res.data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchStudents = async (yearId) => {
    try {
      const res = await api.get('/admin/students');
      const filtered = (res.data || []).filter(s => s.year_id === parseInt(yearId) && s.status === 'active');
      setStudents(filtered);
      setSelectedStudents([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateBulk = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to generate invoices for this year level? Any pending discounts for these students will be consumed automatically.')) return;
    try {
      setLoading(true);
      await financeAPI.generateInvoices({
        semester_id: parseInt(genForm.semester_id),
        year_id: parseInt(genForm.year_id),
        invoice_type: genForm.invoice_type,
        issue_date: genForm.issue_date,
        due_date: genForm.due_date,
        commencement_date: genForm.commencement_date,
        end_date: genForm.end_date,
        late_fee: parseFloat(genForm.late_fee)
      });
      alert('Invoices generated successfully!');
      setActiveTab('invoices');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to generate invoices');
    }
    setLoading(false);
  };

  const handleGenerateCustom = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) return alert('Please select at least one student.');
    if (customForm.items.length === 0) return alert('Please add at least one line item.');
    if (!window.confirm(`Are you sure you want to generate these custom invoices for ${selectedStudents.length} student(s)? Pending discounts will be consumed.`)) return;
    
    try {
      setLoading(true);
      await financeAPI.generateCustomInvoices({
        semester_id: parseInt(customForm.semester_id),
        year_id: parseInt(customForm.year_id),
        invoice_type: customForm.invoice_type,
        issue_date: customForm.issue_date,
        due_date: customForm.due_date,
        commencement_date: customForm.commencement_date,
        end_date: customForm.end_date,
        late_fee: parseFloat(customForm.late_fee),
        student_ids: selectedStudents,
        items: customForm.items.map(i => ({ item_name: i.item_name, amount: parseFloat(i.amount) }))
      });
      alert('Custom invoices generated successfully!');
      setActiveTab('invoices');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to generate custom invoices');
    }
    setLoading(false);
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) return;
    try {
      await financeAPI.approvePayment(paymentId);
      alert('Payment approved successfully');
      fetchData(); // reload
    } catch (error) {
      alert('Failed to approve payment');
    }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await financeAPI.addDiscount({
        student_id: parseInt(discountForm.student_id),
        discount_amount: parseFloat(discountForm.discount_amount),
        remark: discountForm.remark
      });
      alert('Discount added successfully');
      setDiscountForm({ ...discountForm, student_id: '', discount_amount: '', remark: '' });
      fetchDiscounts();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add discount');
    }
    setLoading(false);
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Remove this discount?')) return;
    try {
      await financeAPI.deleteDiscount(id);
      fetchDiscounts();
    } catch (error) {
      alert('Failed to delete discount');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    try {
      await financeAPI.deleteInvoice(id);
      alert('Invoice deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete invoice');
    }
  };

  const handleEditInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await financeAPI.editInvoice(editingInvoice.id, {
        issue_date: editingInvoice.header.issue_date.substring(0,10),
        due_date: editingInvoice.header.due_date.substring(0,10),
        commencement_date: editingInvoice.header.commencement_date?.substring(0,10) || '',
        end_date: editingInvoice.header.end_date?.substring(0,10) || '',
        late_fee: parseFloat(editingInvoice.header.late_fee),
        items: editingInvoice.items.map(i => ({ item_name: i.item_name, amount: parseFloat(i.amount) }))
      });
      alert('Invoice updated successfully');
      setEditingInvoice(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update invoice');
    }
    setLoading(false);
  };

  // Reminders Actions
  const handleSaveMessage = async (e) => {
    e.preventDefault();
    try {
      if (msgForm.id) {
        await financeAPI.updateReminderMessage(msgForm.id, { message_text: msgForm.message_text });
      } else {
        await financeAPI.addReminderMessage({ message_text: msgForm.message_text });
      }
      setMsgForm({ id: null, message_text: '' });
      fetchReminders();
    } catch (error) {
      alert('Failed to save message');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message template?')) return;
    try {
      await financeAPI.deleteReminderMessage(id);
      fetchReminders();
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        message_ids: JSON.stringify(schForm.message_ids),
        schedule_type: schForm.schedule_type,
        frequency_days: parseInt(schForm.frequency_days)
      };
      if (schForm.id) {
        await financeAPI.updateReminderSchedule(schForm.id, payload);
      } else {
        await financeAPI.saveReminderSchedule(payload);
      }
      setSchForm({ id: null, message_ids: [], schedule_type: 'once', frequency_days: 7 });
      fetchReminders();
    } catch (error) {
      alert('Failed to save schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await financeAPI.deleteReminderSchedule(id);
      fetchReminders();
    } catch (error) {
      alert('Failed to delete schedule');
    }
  };

  const handleTriggerReminders = async () => {
    if (!window.confirm('Are you sure you want to scan and send reminders now?')) return;
    setLoading(true);
    try {
      const res = await financeAPI.triggerReminders();
      alert(res.data.message);
    } catch (error) {
      alert('Failed to trigger reminders');
    }
    setLoading(false);
  };

  // Custom Item Handlers
  const addCustomItem = () => {
    setCustomForm({ ...customForm, items: [...customForm.items, { item_name: '', amount: 0 }] });
  };
  const removeCustomItem = (index) => {
    const newItems = [...customForm.items];
    newItems.splice(index, 1);
    setCustomForm({ ...customForm, items: newItems });
  };
  const updateCustomItem = (index, field, value) => {
    const newItems = [...customForm.items];
    newItems[index][field] = value;
    setCustomForm({ ...customForm, items: newItems });
  };

  const toggleStudentSelection = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const toggleAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]); // deselect all
    } else {
      setSelectedStudents(students.map(s => s.id)); // select all
    }
  };

  const renderInvoices = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold">All Student Invoices</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4">Invoice No</th>
            <th className="p-4">Type</th>
            <th className="p-4">Student</th>
            <th className="p-4">Term</th>
            <th className="p-4">Issue/Due Date</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} className="border-b hover:bg-slate-50">
              <td className="p-4 font-medium text-slate-700">{inv.header?.invoice_no || `INV-${inv.id}`}</td>
              <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{inv.header?.invoice_type}</span></td>
              <td className="p-4">{inv.student?.fullname || `Student ID: ${inv.student_id}`}</td>
              <td className="p-4">{inv.header?.semester?.semester_name}</td>
              <td className="p-4 text-sm text-slate-500">
                {inv.header?.issue_date?.substring(0,10)}<br/>
                <span className="text-red-500">{inv.header?.due_date?.substring(0,10)}</span>
              </td>
              <td className="p-4 font-bold text-slate-800">฿{inv.total.toLocaleString()}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                  inv.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {inv.status}
                </span>
              </td>
              <td className="p-4">
                <button onClick={() => setSelectedInvoice(inv)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer font-medium me-3">View</button>
                {inv.status === 'UNPAID' && (
                  <>
                    <button onClick={() => setEditingInvoice(JSON.parse(JSON.stringify(inv)))} className="text-orange-500 hover:text-orange-700 font-medium me-3">Edit</button>
                    <button onClick={() => handleDeleteInvoice(inv.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && !loading && (
             <tr><td colSpan="6" className="p-8 text-center text-slate-500">No invoices found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderGenerateBulk = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl border border-slate-100">
      <h3 className="text-xl font-bold mb-2">Auto-Generate Invoices</h3>
      <p className="text-slate-500 mb-6 text-sm">Create bulk TUITION invoices for an entire year level.</p>
      
      <form onSubmit={handleGenerateBulk} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Semester</label>
          <select required value={genForm.semester_id} onChange={e => setGenForm({...genForm, semester_id: e.target.value})} className="w-full border p-2 rounded-lg">
            <option value="">-- Select Semester --</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Year Level</label>
          <select required value={genForm.year_id} onChange={e => setGenForm({...genForm, year_id: e.target.value})} className="w-full border p-2 rounded-lg">
            <option value="">-- Select Year --</option>
            {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
          </select>
          <p className="text-xs text-slate-500 mt-1">This will generate an invoice for every active student in this year level using the base tuition fee.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Invoice Type</label>
          <select required value={genForm.invoice_type} onChange={e => setGenForm({...genForm, invoice_type: e.target.value})} className="w-full border p-2 rounded-lg">
            <option value="GENERAL">GENERAL</option>
            <option value="TUITION">TUITION</option>
            <option value="ECAs">ECAs</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Issue Date</label>
            <input type="date" required value={genForm.issue_date} onChange={e => setGenForm({...genForm, issue_date: e.target.value})} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" required value={genForm.due_date} onChange={e => setGenForm({...genForm, due_date: e.target.value})} className="w-full border p-2 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Term Commencement Date</label>
            <input type="date" value={genForm.commencement_date} onChange={e => setGenForm({...genForm, commencement_date: e.target.value})} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Term End Date</label>
            <input type="date" value={genForm.end_date} onChange={e => setGenForm({...genForm, end_date: e.target.value})} className="w-full border p-2 rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Late Fee (฿)</label>
          <input type="number" min="0" step="0.01" value={genForm.late_fee} onChange={e => setGenForm({...genForm, late_fee: e.target.value})} className="w-full border p-2 rounded-lg" />
        </div>
        <button type="submit" disabled={loading} className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Bulk Invoices'}
        </button>
      </form>
    </div>
  );

  const renderGenerateCustom = () => (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Form & Items */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex-1 border border-slate-100">
        <h3 className="text-xl font-bold mb-2">Create Custom Invoices</h3>
        <p className="text-slate-500 mb-6 text-sm">Select specific students and add customized line items (ECAs, Summer, School Bus, etc).</p>
        
        <form onSubmit={handleGenerateCustom} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Semester</label>
              <select required value={customForm.semester_id} onChange={e => setCustomForm({...customForm, semester_id: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 focus:bg-white transition-colors">
                <option value="">-- Select Semester --</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Year Level</label>
              <select required value={customForm.year_id} onChange={e => setCustomForm({...customForm, year_id: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 focus:bg-white transition-colors">
                <option value="">-- Select Year --</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Type</label>
              <select required value={customForm.invoice_type} onChange={e => setCustomForm({...customForm, invoice_type: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 focus:bg-white transition-colors">
                <option value="GENERAL">GENERAL</option>
                <option value="TUITION">TUITION</option>
                <option value="ECAs">ECAs</option>
                <option value="SUMMER">SUMMER</option>
                <option value="SCHOOL_BUS">SCHOOL_BUS</option>
                <option value="DEPOSIT">DEPOSIT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Late Fee (฿)</label>
              <input type="number" min="0" step="0.01" value={customForm.late_fee} onChange={e => setCustomForm({...customForm, late_fee: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <input type="date" required value={customForm.issue_date} onChange={e => setCustomForm({...customForm, issue_date: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" required value={customForm.due_date} onChange={e => setCustomForm({...customForm, due_date: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800">Line Items</h4>
              <button type="button" onClick={addCustomItem} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 transition-colors">
                + Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {customForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Item Name (e.g. Piano Class)"
                      required
                      value={item.item_name}
                      onChange={(e) => updateCustomItem(idx, 'item_name', e.target.value)}
                      className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-32">
                    <input 
                      type="number" 
                      placeholder="Amount ฿"
                      min="0" step="0.01"
                      required
                      value={item.amount}
                      onChange={(e) => updateCustomItem(idx, 'amount', e.target.value)}
                      className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  {customForm.items.length > 1 && (
                    <button type="button" onClick={() => removeCustomItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-600">Total Per Student:</span>
              <span className="text-2xl font-extrabold text-indigo-700">
                ฿{customForm.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-transform active:scale-[0.98] shadow-lg shadow-indigo-200">
            {loading ? 'Generating...' : `Generate ${selectedStudents.length} Invoice(s)`}
          </button>
        </form>
      </div>

      {/* Right Column: Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 w-full lg:w-96 flex flex-col h-[750px]">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center rounded-t-xl">
          <h3 className="font-bold">Select Students</h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
            {selectedStudents.length} Selected
          </span>
        </div>
        
        {!customForm.year_id ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <p>Please select a Year Level first to view students.</p>
          </div>
        ) : (
          <>
            <div className="p-3 border-b">
              <label className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  checked={students.length > 0 && selectedStudents.length === students.length}
                  onChange={toggleAllStudents}
                />
                <span className="font-bold text-slate-700">Select All Students</span>
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {students.length === 0 ? (
                <p className="text-center text-slate-500 mt-8">No active students found in this year.</p>
              ) : (
                <div className="space-y-1">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center justify-between p-3 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                        <div>
                          <p className="font-medium text-slate-800 group-hover:text-indigo-900">{student.fullname}</p>
                          <p className="text-xs text-slate-500">{student.student_id}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );

  const renderDiscounts = () => (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6 flex-[1] border border-slate-100 h-fit">
        <h3 className="text-xl font-bold mb-2">Issue New Discount / Scholarship</h3>
        <p className="text-slate-500 mb-6 text-sm">This credit will be automatically applied and consumed on the student's NEXT generated invoice.</p>
        
        <form onSubmit={handleAddDiscount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Year Level</label>
            <select required value={discountForm.year_id} onChange={e => setDiscountForm({...discountForm, year_id: e.target.value, student_id: ''})} className="w-full border p-2 rounded-lg bg-slate-50">
              <option value="">-- Select Year --</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Student</label>
            <select required value={discountForm.student_id} onChange={e => setDiscountForm({...discountForm, student_id: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50" disabled={!discountForm.year_id}>
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullname} ({s.student_id})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount Amount (฿)</label>
            <input type="number" min="0.01" step="0.01" required value={discountForm.discount_amount} onChange={e => setDiscountForm({...discountForm, discount_amount: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50" placeholder="e.g. 500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Remark (e.g., Sibling Discount, Scholarship)</label>
            <input type="text" required value={discountForm.remark} onChange={e => setDiscountForm({...discountForm, remark: e.target.value})} className="w-full border p-2 rounded-lg bg-slate-50" placeholder="e.g. Scholarship 50%" />
          </div>
          <button type="submit" disabled={loading || !discountForm.student_id} className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Discount Credit'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex-[2]">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-bold">Pending Student Discounts</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Year Level</th>
              <th className="p-4">Remark</th>
              <th className="p-4">Credit Amount</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{d.student?.fullname}</td>
                <td className="p-4 text-sm text-slate-500">{d.student?.year?.year_name}</td>
                <td className="p-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded">{d.remark}</span></td>
                <td className="p-4 font-bold text-emerald-600">฿{d.discount_amount.toLocaleString()}</td>
                <td className="p-4">
                  <button onClick={() => handleDeleteDiscount(d.id)} className="text-red-500 hover:text-red-700 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && !loading && (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">No pending discounts.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-4">Invoice No</th>
            <th className="p-4">Student</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Slip Image</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.filter(inv => inv.payment).map(inv => (
            <tr key={inv.id} className="border-b hover:bg-slate-50">
              <td className="p-4 font-medium">{inv.header?.invoice_no}</td>
              <td className="p-4">{inv.student?.fullname}</td>
              <td className="p-4 font-bold">฿{inv.payment?.amount?.toLocaleString()}</td>
              <td className="p-4">
                <a href={`http://localhost:3000${inv.payment?.slip_image}`} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium hover:text-indigo-800">
                  View Slip
                </a>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  inv.payment?.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {inv.payment?.status}
                </span>
              </td>
              <td className="p-4">
                {inv.payment?.status === 'PENDING' && (
                  <button onClick={() => handleApprove(inv.payment.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600 font-bold shadow-sm shadow-emerald-200 transition-transform active:scale-95">
                    Approve
                  </button>
                )}
                {inv.payment?.status === 'APPROVED' && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Approved</span>
                )}
              </td>
            </tr>
          ))}
          {invoices.filter(inv => inv.payment).length === 0 && !loading && (
            <tr><td colSpan="6" className="p-8 text-center text-slate-500">No payment slips uploaded yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold">Payment Reports</h3>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700">Print Report</button>
      </div>
      <div className="p-4 border-b flex gap-4 bg-white">
        <input type="date" className="border p-2 rounded-lg text-sm" value={reportFilter.date_start} onChange={e => setReportFilter({...reportFilter, date_start: e.target.value})} placeholder="Start Date" />
        <input type="date" className="border p-2 rounded-lg text-sm" value={reportFilter.date_end} onChange={e => setReportFilter({...reportFilter, date_end: e.target.value})} placeholder="End Date" />
        <input type="text" className="border p-2 rounded-lg text-sm flex-1" value={reportFilter.search} onChange={e => setReportFilter({...reportFilter, search: e.target.value})} placeholder="Search Name or Invoice No..." />
        <button onClick={fetchReports} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm">Filter</button>
      </div>
      <div className="p-4 flex justify-between items-center bg-slate-50 border-b">
        <div>
          <span className="text-sm text-slate-500">Total Collected Amount</span>
          <div className="text-2xl font-extrabold text-emerald-600">฿{reports.reduce((sum, inv) => sum + (inv.total || 0) + (inv.header?.late_fee || 0), 0).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <span className="text-sm text-slate-500">Total Invoices</span>
          <div className="text-xl font-bold">{reports.length}</div>
        </div>
      </div>
      <table className="w-full text-left">
        <thead className="bg-white border-b text-sm">
          <tr>
            <th className="p-4">Paid Date</th>
            <th className="p-4">Student</th>
            <th className="p-4">Invoice No</th>
            <th className="p-4">Payment Method</th>
            <th className="p-4 text-right">Total (Inc. Late)</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(inv => (
            <tr key={inv.id} className="border-b hover:bg-slate-50">
              <td className="p-4">{inv.paid_at?.substring(0,10)}</td>
              <td className="p-4 font-bold text-indigo-700">{inv.student?.fullname}</td>
              <td className="p-4 text-slate-600">#{inv.header?.invoice_no}</td>
              <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{inv.payment_method || '-'}</span></td>
              <td className="p-4 text-right font-bold text-emerald-600">฿{(inv.total + (inv.header?.late_fee || 0)).toLocaleString()}</td>
            </tr>
          ))}
          {reports.length === 0 && !loading && (
            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No payment records found for this period.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderReminders = () => (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Automated Reminders</h2>
          <p className="text-sm text-slate-500">Manage reminder templates and schedules for unpaid invoices.</p>
        </div>
        <button onClick={handleTriggerReminders} disabled={loading} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-transform active:scale-95">
          {loading ? 'Processing...' : '▶ Trigger Reminders Now'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Messages Form */}
        <div className="flex-1 bg-white rounded-xl shadow-sm p-6 border border-slate-100 h-fit">
          <h3 className="font-bold text-lg mb-4">1. Message Templates</h3>
          <form onSubmit={handleSaveMessage} className="mb-6">
            <textarea
              required
              className="w-full border p-3 rounded-xl mb-3 focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              rows="3"
              placeholder="E.g., Dear Parent, please settle the outstanding tuition fee..."
              value={msgForm.message_text}
              onChange={e => setMsgForm({...msgForm, message_text: e.target.value})}
            />
            <div className="flex justify-end gap-2">
              {msgForm.id && <button type="button" onClick={() => setMsgForm({ id: null, message_text: '' })} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>}
              <button type="submit" className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-900">{msgForm.id ? 'Update Message' : 'Add Message'}</button>
            </div>
          </form>

          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className="p-3 border rounded-xl bg-white shadow-sm flex justify-between items-start gap-3">
                <p className="text-sm text-slate-700 flex-1 whitespace-pre-wrap">{msg.message_text}</p>
                <div className="flex gap-2">
                  <button onClick={() => setMsgForm({ id: msg.id, message_text: msg.message_text })} className="text-indigo-600 font-bold text-sm">Edit</button>
                  <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-500 font-bold text-sm">Del</button>
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-center text-slate-500 text-sm">No messages created.</p>}
          </div>
        </div>

        {/* Schedules Form */}
        <div className="flex-[1.5] bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h3 className="font-bold text-lg mb-4">2. Reminder Schedules</h3>
          
          <form onSubmit={handleSaveSchedule} className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Select Messages to Send</label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-white border rounded-lg">
                {messages.map(msg => (
                  <label key={msg.id} className="flex gap-2 items-start text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      className="mt-1"
                      checked={schForm.message_ids.includes(msg.id)} 
                      onChange={e => {
                        const newIds = e.target.checked 
                          ? [...schForm.message_ids, msg.id]
                          : schForm.message_ids.filter(id => id !== msg.id);
                        setSchForm({...schForm, message_ids: newIds});
                      }} 
                    />
                    <span className="line-clamp-2">{msg.message_text}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 items-end mb-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Schedule Type</label>
                <select value={schForm.schedule_type} onChange={e => setSchForm({...schForm, schedule_type: e.target.value})} className="w-full border p-2 rounded-lg bg-white">
                  <option value="once">Send Once (After due date)</option>
                  <option value="recurring">Recurring (Every X days)</option>
                </select>
              </div>
              {schForm.schedule_type === 'recurring' && (
                <div className="w-32">
                  <label className="block text-sm font-bold mb-1">Every (Days)</label>
                  <input type="number" min="1" value={schForm.frequency_days} onChange={e => setSchForm({...schForm, frequency_days: e.target.value})} className="w-full border p-2 rounded-lg bg-white" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {schForm.id && <button type="button" onClick={() => setSchForm({ id: null, message_ids: [], schedule_type: 'once', frequency_days: 7 })} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>}
              <button type="submit" disabled={schForm.message_ids.length === 0} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {schForm.id ? 'Update Schedule' : 'Save Schedule'}
              </button>
            </div>
          </form>

          <table className="w-full text-left text-sm">
            <thead className="border-b">
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Messages</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(sch => {
                const mIds = JSON.parse(sch.message_ids || '[]');
                return (
                  <tr key={sch.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 font-bold"><span className="bg-slate-100 px-2 py-1 rounded">{sch.schedule_type}</span></td>
                    <td className="py-3">{sch.schedule_type === 'recurring' ? `Every ${sch.frequency_days} Days` : '-'}</td>
                    <td className="py-3 text-slate-500">{mIds.length} Selected</td>
                    <td className="py-3 flex gap-2">
                      <button onClick={() => setSchForm({ id: sch.id, message_ids: mIds, schedule_type: sch.schedule_type, frequency_days: sch.frequency_days })} className="text-indigo-600 font-bold">Edit</button>
                      <button onClick={() => handleDeleteSchedule(sch.id)} className="text-red-500 font-bold">Del</button>
                    </td>
                  </tr>
                )
              })}
              {schedules.length === 0 && (
                <tr><td colSpan="4" className="py-4 text-center text-slate-500">No schedules active.</td></tr>
              )}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finance & Invoices</h1>
          <p className="text-slate-500 mt-2">Manage school tuition fees, generate custom invoices, and approve slip payments.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all ${activeTab === 'invoices' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('invoices')}
        >
          All Invoices
        </button>
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all ${activeTab === 'generate' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Batch
        </button>
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === 'generate_custom' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('generate_custom')}
        >
          Custom Invoice
        </button>
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all ${activeTab === 'discounts' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('discounts')}
        >
          Discounts & Credits
        </button>
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all ${activeTab === 'payments' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('payments')}
        >
          Verify Slips
        </button>
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all ${activeTab === 'reports' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button 
          className={`px-5 py-2.5 font-bold rounded-lg text-sm transition-all ${activeTab === 'reminders' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          onClick={() => setActiveTab('reminders')}
        >
          Reminders
        </button>
      </div>

      {activeTab === 'invoices' && renderInvoices()}
      {activeTab === 'generate' && renderGenerateBulk()}
      {activeTab === 'generate_custom' && renderGenerateCustom()}
      {activeTab === 'discounts' && renderDiscounts()}
      {activeTab === 'payments' && renderPayments()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'reminders' && renderReminders()}

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Edit Invoice ({editingInvoice.header?.invoice_no})</h2>
              <button onClick={() => setEditingInvoice(null)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="editInvoiceForm" onSubmit={handleEditInvoiceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Issue Date</label>
                    <input type="date" required value={editingInvoice.header?.issue_date?.substring(0,10) || ''} onChange={e => setEditingInvoice({...editingInvoice, header: {...editingInvoice.header, issue_date: e.target.value}})} className="w-full border p-2 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input type="date" required value={editingInvoice.header?.due_date?.substring(0,10) || ''} onChange={e => setEditingInvoice({...editingInvoice, header: {...editingInvoice.header, due_date: e.target.value}})} className="w-full border p-2 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Late Fee (฿)</label>
                  <input type="number" min="0" step="0.01" value={editingInvoice.header?.late_fee || 0} onChange={e => setEditingInvoice({...editingInvoice, header: {...editingInvoice.header, late_fee: e.target.value}})} className="w-full border p-2 rounded-lg" />
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <h4 className="font-bold text-slate-800 mb-2">Line Items</h4>
                  {editingInvoice.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" required value={item.item_name} onChange={e => {
                        const newItems = [...editingInvoice.items];
                        newItems[idx].item_name = e.target.value;
                        setEditingInvoice({...editingInvoice, items: newItems});
                      }} className="w-full border p-2 rounded-lg" placeholder="Item Name" />
                      <input type="number" required min="0" step="0.01" value={item.amount} onChange={e => {
                        const newItems = [...editingInvoice.items];
                        newItems[idx].amount = e.target.value;
                        setEditingInvoice({...editingInvoice, items: newItems});
                      }} className="w-32 border p-2 rounded-lg" placeholder="Amount" />
                      {editingInvoice.items.length > 1 && (
                        <button type="button" onClick={() => {
                          const newItems = [...editingInvoice.items];
                          newItems.splice(idx, 1);
                          setEditingInvoice({...editingInvoice, items: newItems});
                        }} className="text-red-500 px-2 font-bold hover:bg-red-50 rounded">X</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditingInvoice({...editingInvoice, items: [...editingInvoice.items, {item_name: '', amount: 0}]})} className="text-sm font-bold text-indigo-600 mt-2">+ Add Item</button>
                </div>
              </form>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditingInvoice(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button type="submit" form="editInvoiceForm" disabled={loading} className="px-4 py-2 font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-800">Invoice Details</h2>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">INVOICE</h1>
                  <p className="text-slate-500 font-medium mt-1">No: {selectedInvoice.header?.invoice_no}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                    selectedInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                    selectedInvoice.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b py-6 bg-slate-50/50 px-4 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Billed To</p>
                  <p className="font-bold text-lg text-slate-800">{selectedInvoice.student?.fullname}</p>
                  <p className="text-slate-600 text-sm mt-1">Student ID: {selectedInvoice.student?.student_id}</p>
                  <p className="text-slate-600 text-sm">Year Level: {selectedInvoice.header?.year?.year_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Invoice Info</p>
                  <p className="text-slate-600 text-sm"><span className="font-medium text-slate-400">Type:</span> {selectedInvoice.header?.invoice_type}</p>
                  <p className="text-slate-600 text-sm"><span className="font-medium text-slate-400">Term:</span> {selectedInvoice.header?.semester?.semester_name}</p>
                  <p className="text-slate-600 text-sm"><span className="font-medium text-slate-400">Issue Date:</span> {selectedInvoice.header?.issue_date?.substring(0, 10)}</p>
                  <p className="text-slate-800 font-bold text-sm"><span className="font-medium text-slate-400">Due Date:</span> {selectedInvoice.header?.due_date?.substring(0, 10)}</p>
                </div>
              </div>

              <table className="w-full text-left mb-8">
                <thead className="border-b-2 border-slate-200">
                  <tr>
                    <th className="py-3 text-slate-400 font-bold uppercase text-xs tracking-wider">Description</th>
                    <th className="py-3 text-right text-slate-400 font-bold uppercase text-xs tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-medium text-slate-700">{item.item_name}</td>
                      <td className="py-4 text-right text-slate-700 font-medium">฿{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {selectedInvoice.header?.late_fee > 0 && (
                    <tr className="bg-red-50/50">
                      <td className="py-4 font-bold text-red-600 px-2 rounded-l-lg">Late Fee</td>
                      <td className="py-4 text-right text-red-600 font-bold px-2 rounded-r-lg">฿{selectedInvoice.header.late_fee.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-end border-t border-slate-200 pt-6">
                <div className="w-72 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between mb-3 text-slate-500 text-sm font-medium">
                    <span>Subtotal</span>
                    <span>฿{selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-extrabold text-indigo-700 border-t-2 border-indigo-100 pt-3">
                    <span>Total</span>
                    <span>฿{(selectedInvoice.total + (selectedInvoice.header?.late_fee || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 border-t flex justify-end gap-4 rounded-b-2xl">
              <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 flex items-center gap-2 shadow-lg shadow-slate-300 transition-transform active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;
