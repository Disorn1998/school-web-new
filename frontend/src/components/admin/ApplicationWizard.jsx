import React, { useState } from 'react';
import { X, Upload, ChevronRight, ChevronLeft, CheckCircle, Printer, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';
import { CLASS_LEVELS, getClassName } from '../../utils/constants';

const ApplicationWizard = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fatherImagePreview, setFatherImagePreview] = useState(null);
  const [motherImagePreview, setMotherImagePreview] = useState(null);
  
  // Master State
  const [formData, setFormData] = useState({
    // Step 1: Student
    fullname: '', nickname: '', date_of_birth: '', gender: '', nationality: '', 
    enrollment_year: new Date().getFullYear(), year_id: 1,
    food_limitations: '', health_limitations: '', profile_image: '',
    
    // Step 2: Parent
    father_firstname: '', father_lastname: '', father_phone: '', father_image: '',
    mother_firstname: '', mother_lastname: '', mother_phone: '', mother_image: '',
    address_line1: '', address_line2: '', city: 'Bangkok', province: 'Bangkok', postcode: '', country: 'Thailand',
    invoice_target: 'Father',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, fieldType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      if (fieldType === 'student') setImagePreview(reader.result);
      if (fieldType === 'father') setFatherImagePreview(reader.result);
      if (fieldType === 'mother') setMotherImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server using fetch to avoid Axios boundary issues
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      if (fieldType === 'student') setFormData(prev => ({ ...prev, profile_image: data.url }));
      if (fieldType === 'father') setFormData(prev => ({ ...prev, father_image: data.url }));
      if (fieldType === 'mother') setFormData(prev => ({ ...prev, mother_image: data.url }));
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Parent First
      const parentPayload = {
        password: 'password123',
        status: 'active',
        father_firstname: formData.father_firstname,
        father_lastname: formData.father_lastname,
        father_phone: formData.father_phone,
        father_image: formData.father_image || 'default.png',
        mother_firstname: formData.mother_firstname,
        mother_lastname: formData.mother_lastname,
        mother_phone: formData.mother_phone,
        mother_image: formData.mother_image || 'default.png',
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        province: formData.province,
        postcode: formData.postcode,
        country: formData.country,
        invoice_target: formData.invoice_target
      };
      
      const parentResponse = await api.post('/admin/parents', parentPayload);
      const newParentId = parentResponse.data.id;

      // 2. Create Student
      const studentPayload = {
        parent_id: newParentId,
        year_id: parseInt(formData.year_id),
        fullname: formData.fullname,
        nickname: formData.nickname,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        nationality: formData.nationality,
        enrollment_year: parseInt(formData.enrollment_year),
        food_limitations: formData.food_limitations,
        health_limitations: formData.health_limitations,
        profile_image: formData.profile_image || 'default.png',
        status: 'active'
      };

      await api.post('/admin/students', studentPayload);
      
      alert('Student registered successfully!');
      onSuccess();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ----------------------------------------------------
  // STEP 1: Student Information
  // ----------------------------------------------------
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Student Information</h3>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Upload Area */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-start">
          <label className="w-48 h-64 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all overflow-hidden relative group">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <ImageIcon size={48} className="mb-2 text-slate-300" />
                <span className="text-sm font-medium">Upload Photo</span>
                <span className="text-xs mt-1">2" x 2" Ratio</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white" size={32} />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'student')} />
          </label>
        </div>

        {/* Text Fields Area */}
        <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
            <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="First Last" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nickname</label>
            <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth *</label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm">
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nationality</label>
            <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Enrollment Year</label>
            <input type="number" name="enrollment_year" value={formData.enrollment_year} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Class Level (Year)</label>
            <select name="year_id" value={formData.year_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm">
              {CLASS_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 mt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Medical & Dietary</h4>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Health Limitations / Conditions</label>
            <input type="text" name="health_limitations" value={formData.health_limitations} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Asthma, Allergies (Leave blank if none)" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Food Limitations</label>
            <input type="text" name="food_limitations" value={formData.food_limitations} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Halal, Vegetarian, No Peanuts" />
          </div>
        </div>
      </div>
    </div>
  );

  // ----------------------------------------------------
  // STEP 2: Parent Information
  // ----------------------------------------------------
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Family & Contact Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Father */}
        <div className="col-span-2 md:col-span-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
          <label className="w-24 h-32 shrink-0 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 overflow-hidden relative group bg-white">
            {fatherImagePreview ? (
              <img src={fatherImagePreview} alt="Father" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <ImageIcon size={24} className="mb-1 text-slate-300" />
                <span className="text-[10px] font-medium text-center leading-tight">Father<br/>Photo</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'father')} />
          </label>
          <div className="flex-1 space-y-3">
            <h4 className="font-bold text-slate-700 text-sm border-b pb-1">Father Details</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">First Name *</label>
              <input type="text" name="father_firstname" value={formData.father_firstname} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name *</label>
              <input type="text" name="father_lastname" value={formData.father_lastname} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input type="text" name="father_phone" value={formData.father_phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* Mother */}
        <div className="col-span-2 md:col-span-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
          <label className="w-24 h-32 shrink-0 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 overflow-hidden relative group bg-white">
            {motherImagePreview ? (
              <img src={motherImagePreview} alt="Mother" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <ImageIcon size={24} className="mb-1 text-slate-300" />
                <span className="text-[10px] font-medium text-center leading-tight">Mother<br/>Photo</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'mother')} />
          </label>
          <div className="flex-1 space-y-3">
            <h4 className="font-bold text-slate-700 text-sm border-b pb-1">Mother Details</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
              <input type="text" name="mother_firstname" value={formData.mother_firstname} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
              <input type="text" name="mother_lastname" value={formData.mother_lastname} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
              <input type="text" name="mother_phone" value={formData.mother_phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="col-span-2 mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-700 mb-3 text-sm">Registered Address</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Address Line 1 *</label>
              <input type="text" name="address_line1" value={formData.address_line1} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Address Line 2 (Optional)</label>
              <input type="text" name="address_line2" value={formData.address_line2} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Province</label>
              <input type="text" name="province" value={formData.province} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Postcode</label>
              <input type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Invoice Target</label>
              <select name="invoice_target" value={formData.invoice_target} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm">
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ----------------------------------------------------
  // STEP 3: Print / Preview 
  // ----------------------------------------------------
  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Printable Area */}
      <div id="printable-application" className="bg-white border border-slate-200 p-10 max-w-[210mm] mx-auto min-h-[297mm] shadow-[0_0_15px_rgba(0,0,0,0.1)] print:shadow-none print:border-none print:p-0">
        
        {/* Letterhead */}
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-center">
          <div className="w-32 h-32 border-2 border-slate-300 flex items-center justify-center text-slate-400 text-xs text-center bg-slate-50 overflow-hidden">
            {imagePreview ? <img src={imagePreview} alt="Student" className="w-full h-full object-cover" /> : "Attach 2x2 Photo Here"}
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Application Form</h1>
            <h2 className="text-lg font-semibold text-slate-600 mt-1">Simple School System (SSS)</h2>
            <p className="text-sm mt-2 text-slate-500">Academic Year: {formData.enrollment_year} • Class: {getClassName(formData.year_id)}</p>
          </div>
        </div>

        {/* Section 1 */}
        <h3 className="bg-slate-800 text-white font-bold py-1 px-3 uppercase text-sm mb-4 print:bg-slate-200 print:text-black">1. Student Details</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-8">
          <div className="col-span-2 text-base font-bold"><span className="text-slate-500 font-normal mr-2">Full Name:</span> {formData.fullname || '-'}</div>
          <div><span className="text-slate-500 font-normal mr-2">Nickname:</span> {formData.nickname || '-'}</div>
          <div><span className="text-slate-500 font-normal mr-2">Gender:</span> {formData.gender || '-'}</div>
          <div><span className="text-slate-500 font-normal mr-2">Date of Birth:</span> {formData.date_of_birth || '-'}</div>
          <div><span className="text-slate-500 font-normal mr-2">Nationality:</span> {formData.nationality || '-'}</div>
        </div>

        {/* Section 2 */}
        <h3 className="bg-slate-800 text-white font-bold py-1 px-3 uppercase text-sm mb-4 print:bg-slate-200 print:text-black">2. Medical Information</h3>
        <div className="grid grid-cols-1 gap-y-4 text-sm mb-8">
          <div><span className="text-slate-500 font-normal mr-2">Health Limitations:</span> {formData.health_limitations || 'None'}</div>
          <div><span className="text-slate-500 font-normal mr-2">Dietary / Food Limitations:</span> {formData.food_limitations || 'None'}</div>
        </div>

        {/* Section 3 */}
        <h3 className="bg-slate-800 text-white font-bold py-1 px-3 uppercase text-sm mb-4 print:bg-slate-200 print:text-black">3. Parent / Guardian Details</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-8">
          <div className="col-span-1 border p-3 flex gap-4">
             <div className="w-16 h-20 border shrink-0 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
               {fatherImagePreview ? <img src={fatherImagePreview} alt="Father" className="w-full h-full object-cover" /> : "Photo"}
             </div>
             <div>
                <div className="font-bold border-b pb-1 mb-1">Father Information</div>
                <div><span className="text-slate-500 font-normal mr-2">Name:</span> {formData.father_firstname} {formData.father_lastname}</div>
                <div><span className="text-slate-500 font-normal mr-2">Phone:</span> {formData.father_phone || '-'}</div>
             </div>
          </div>
          
          <div className="col-span-1 border p-3 flex gap-4">
             <div className="w-16 h-20 border shrink-0 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
               {motherImagePreview ? <img src={motherImagePreview} alt="Mother" className="w-full h-full object-cover" /> : "Photo"}
             </div>
             <div>
                <div className="font-bold border-b pb-1 mb-1">Mother Information</div>
                <div><span className="text-slate-500 font-normal mr-2">Name:</span> {formData.mother_firstname} {formData.mother_lastname}</div>
                <div><span className="text-slate-500 font-normal mr-2">Phone:</span> {formData.mother_phone || '-'}</div>
             </div>
          </div>
        </div>

        {/* Section 4 */}
        <h3 className="bg-slate-800 text-white font-bold py-1 px-3 uppercase text-sm mb-4 print:bg-slate-200 print:text-black">4. Registered Address</h3>
        <div className="text-sm leading-relaxed mb-12">
          {formData.address_line1} {formData.address_line2}<br/>
          {formData.city}, {formData.province} {formData.postcode}<br/>
          {formData.country}
        </div>

      </div>

      <div className="flex justify-center mt-6 print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">
          <Printer size={18} /> Print Application Form
        </button>
      </div>

    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:bg-white print:p-0">
      
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] print:max-w-full print:shadow-none print:m-0 print:rounded-none">
        
        {/* Header / Wizard Nav (Hidden in Print) */}
        <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">New Student Registration</h2>
            <div className="flex items-center gap-2 mt-2 text-sm font-medium">
              <span className={`${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>1. Student</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className={`${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>2. Family</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className={`${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>3. Review & Print</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Form Content Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="bg-slate-50 px-8 py-5 border-t flex justify-between items-center print:hidden">
          <button 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:bg-slate-200 bg-slate-100'}`}
          >
            <ChevronLeft size={18} /> Back
          </button>

          {step < 3 ? (
            <button 
              onClick={() => {
                if(step === 1 && (!formData.fullname || !formData.date_of_birth)) {
                  alert("Please fill in required fields (*)");
                  return;
                }
                if(step === 2 && (!formData.father_firstname || !formData.address_line1)) {
                  alert("Please fill in required fields (*)");
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-sm transition-all"
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? <span className="animate-spin border-2 border-white/30 border-t-white w-5 h-5 rounded-full" /> : <CheckCircle size={18} />}
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ApplicationWizard;
