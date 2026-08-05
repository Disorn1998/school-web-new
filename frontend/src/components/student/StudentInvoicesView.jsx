import React, { useState, useEffect } from 'react';
import { financeAPI } from '../../services/financeAPI';
import { useAuth } from '../../contexts/AuthContext';
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

const StudentInvoicesView = ({ activeStudentId }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const PROMPTPAY_NUMBER = '0904982968';

  useEffect(() => {
    if (activeStudentId || user?.id) {
      fetchInvoices();
    }
  }, [activeStudentId, user?.id]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const targetId = activeStudentId || user.id;
      // student_id passed here for mockup (in real app backend extracts from JWT)
      // but now our API supports ?student_id= query param for parent switching!
      const res = await api.get(`/finance/my-invoices?student_id=${targetId}`);
      setInvoices(res.data || []);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    }
    setLoading(false);
  };

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setSlipFile(null);
    setShowModal(true);
  };

  const handleReceiptClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  const handleUploadSlip = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      alert("Please select a slip image to upload.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('invoice_id', selectedInvoice.id);
    formData.append('amount', selectedInvoice.total);
    formData.append('student_id', activeStudentId || user.id);
    formData.append('slip_image', slipFile);

    try {
      await api.post('/finance/upload-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Payment slip uploaded successfully! It is now pending verification.');
      setShowModal(false);
      fetchInvoices(); // Refresh status
    } catch (error) {
      console.error(error);
      alert('Failed to upload slip.');
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="p-8 text-center">Loading invoices...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">My Invoices & Receipts</h2>
        <p className="text-slate-500 mb-8">View and pay your school tuition fees securely via PromptPay.</p>

        {invoices.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="text-lg font-bold text-slate-700">No Invoices Found</h3>
            <p className="text-slate-500 mt-2">You don't have any pending invoices at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {invoices.map(inv => (
              <div key={inv.id} className="border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow bg-white">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-slate-400">{inv.header?.invoice_no}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{inv.header?.invoice_type} - {inv.header?.semester?.semester_name}</h3>
                  <p className="text-slate-500 text-sm mt-1">Due Date: {inv.header?.due_date?.substring(0, 10) || 'N/A'}</p>
                </div>
                
                <div className="text-center md:text-right flex flex-col md:items-end gap-3 w-full md:w-auto">
                  <span className="text-3xl font-extrabold text-slate-900">฿{inv.total.toLocaleString()}</span>
                  
                  {inv.status === 'UNPAID' && (
                    <button 
                      onClick={() => handlePayClick(inv)}
                      className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand-500/30 transition-all"
                    >
                      Pay via PromptPay
                    </button>
                  )}
                  {inv.status === 'PENDING' && (
                    <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold">
                      Slip uploaded. Waiting for admin approval.
                    </div>
                  )}
                  {inv.status === 'PAID' && (
                    <button onClick={() => handleReceiptClick(inv)} className="text-brand-600 font-bold hover:underline text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      Download Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Side: QR Code */}
            <div className="bg-[#113566] text-white p-8 md:w-1/2 flex flex-col items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/PromptPay-logo.png/500px-PromptPay-logo.png" alt="PromptPay" className="h-12 bg-white px-4 py-2 rounded-xl mb-6" />
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <QRCodeSVG 
                  value={generatePayload(PROMPTPAY_NUMBER, { amount: selectedInvoice.total })} 
                  size={220} 
                />
              </div>
              <p className="mt-6 text-xl font-bold">฿{selectedInvoice.total.toLocaleString()}</p>
              <p className="text-slate-300 text-sm mt-2 font-medium tracking-wider">Number: {PROMPTPAY_NUMBER.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</p>
            </div>

            {/* Right Side: Upload Form */}
            <div className="p-8 md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Confirm Payment</h3>
                    <p className="text-slate-500 text-sm mt-1">Invoice {selectedInvoice.header?.invoice_no}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-slate-500">Item</span>
                    <span className="font-bold">{selectedInvoice.header?.invoice_type}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-slate-500">Student ID</span>
                    <span className="font-bold">{selectedInvoice.student_id}</span>
                  </div>
                </div>

                <form onSubmit={handleUploadSlip}>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Upload Transfer Slip</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setSlipFile(e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      <span className="text-sm font-medium text-slate-600">
                        {slipFile ? slipFile.name : 'Click or drag image to upload'}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!slipFile || isSubmitting}
                    className="w-full mt-6 bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? 'Uploading...' : 'Confirm & Submit Slip'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-bold">Tax Invoice / Receipt</h2>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-extrabold text-brand-900">RECEIPT</h1>
                  <p className="text-slate-500 font-medium mt-1">No: {selectedInvoice.header?.invoice_no}</p>
                </div>
                <div className="text-right">
                  <span className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-800 border-2 border-emerald-500 transform -rotate-6 inline-block">
                    PAID
                  </span>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Paid on: {selectedInvoice.paid_at ? selectedInvoice.paid_at.substring(0, 10) : new Date().toISOString().substring(0, 10)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b py-6">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Billed To</p>
                  <p className="font-bold text-lg">{user.fullname}</p>
                  <p className="text-slate-600">Student ID: {selectedInvoice.student_id}</p>
                  <p className="text-slate-600">Year Level: {selectedInvoice.header?.year?.year_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Invoice Info</p>
                  <p className="text-slate-600"><span className="font-medium">Type:</span> {selectedInvoice.header?.invoice_type}</p>
                  <p className="text-slate-600"><span className="font-medium">Term:</span> {selectedInvoice.header?.semester?.semester_name}</p>
                  <p className="text-slate-600"><span className="font-medium">Issue Date:</span> {selectedInvoice.header?.issue_date?.substring(0, 10)}</p>
                  <p className="text-slate-600"><span className="font-medium">Payment Method:</span> PromptPay</p>
                </div>
              </div>

              <table className="w-full text-left mb-8">
                <thead className="border-b-2 border-slate-200">
                  <tr>
                    <th className="py-3 text-slate-500 font-bold uppercase text-sm">Description</th>
                    <th className="py-3 text-right text-slate-500 font-bold uppercase text-sm">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map(item => (
                    <tr key={item.id}>
                      <td className="py-4 font-medium">{item.item_name}</td>
                      <td className="py-4 text-right">฿{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {selectedInvoice.header?.late_fee > 0 && (
                    <tr>
                      <td className="py-4 font-medium text-red-600">Late Fee</td>
                      <td className="py-4 text-right text-red-600">฿{selectedInvoice.header.late_fee.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-end border-t pt-6">
                <div className="w-64">
                  <div className="flex justify-between mb-3 text-slate-500">
                    <span>Subtotal</span>
                    <span>฿{selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-extrabold text-slate-900 border-t-2 border-slate-900 pt-3">
                    <span>Total Paid</span>
                    <span className="text-brand-600">฿{(selectedInvoice.total + (selectedInvoice.header?.late_fee || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t flex justify-end gap-4">
              <button onClick={() => window.print()} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 flex items-center gap-2 shadow-lg shadow-brand-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInvoicesView;
