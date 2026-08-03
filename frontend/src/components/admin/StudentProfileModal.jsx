import React from 'react';
import { X, User, MapPin, Activity, Calendar, Shield, Phone, Mail } from 'lucide-react';
import { getClassName } from '../../utils/constants';

const StudentProfileModal = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-6 flex justify-between items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
              {student.profile_image && student.profile_image !== 'default.png' ? (
                <img src={`http://localhost:3000${student.profile_image}`} alt={student.fullname} className="w-full h-full object-cover" />
              ) : (
                student.fullname ? student.fullname.charAt(0) : 'S'
              )}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold tracking-tight">{student.fullname}</h2>
              <div className="flex items-center gap-4 mt-2 text-brand-100 font-medium">
                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-lg text-sm">
                  <User size={14} /> ID: {student.student_id}
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-lg text-sm">
                  Class: {getClassName(student.year_id)}
                </span>
                {student.nickname && <span>Nickname: {student.nickname}</span>}
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all z-10">
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50">
          
          {/* Left Column: Personal & Medical */}
          <div className="space-y-6">
            {/* Personal Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="text-brand-500" size={20} /> Personal Details
              </h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-slate-500 font-medium">Date of Birth</p>
                  <p className="font-bold text-slate-700">{student.date_of_birth || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Gender</p>
                  <p className="font-bold text-slate-700">{student.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Nationality</p>
                  <p className="font-bold text-slate-700">{student.nationality || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Enrollment Year</p>
                  <p className="font-bold text-slate-700">{student.enrollment_year || '-'}</p>
                </div>
              </div>
            </div>

            {/* Medical & Dietary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="text-red-500" size={20} /> Medical & Dietary
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <p className="text-red-600 font-semibold mb-1">Health Limitations</p>
                  <p className="font-medium text-slate-700">{student.health_limitations || 'None reported'}</p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                  <p className="text-orange-600 font-semibold mb-1">Food Limitations / Allergies</p>
                  <p className="font-medium text-slate-700">{student.food_limitations || 'None reported'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Family & Contact */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="text-brand-500" size={20} /> Family & Contact
              </h3>
              
              {!student.parent ? (
                <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-sm text-center">
                  No family information linked.
                </div>
              ) : (
                <div className="space-y-6 text-sm">
                  {/* Parents */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-blue-100">
                        {student.parent.father_image && student.parent.father_image !== 'default.png' ? (
                          <img src={`http://localhost:3000${student.parent.father_image}`} alt="Father" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Father</p>
                        <p className="font-bold text-slate-700">{student.parent.father_firstname || '-'} {student.parent.father_lastname || '-'}</p>
                        <p className="text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={12}/> {student.parent.father_phone || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-14 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-pink-100">
                        {student.parent.mother_image && student.parent.mother_image !== 'default.png' ? (
                          <img src={`http://localhost:3000${student.parent.mother_image}`} alt="Mother" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Mother</p>
                        <p className="font-bold text-slate-700">{student.parent.mother_firstname || '-'} {student.parent.mother_lastname || '-'}</p>
                        <p className="text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={12}/> {student.parent.mother_phone || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Address */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><MapPin size={14}/> Registered Address</p>
                    <p className="font-medium text-slate-700 leading-relaxed">
                      {student.parent.address_line1 ? (
                        <>
                          {student.parent.address_line1} {student.parent.address_line2}<br/>
                          {student.parent.city}, {student.parent.province} {student.parent.postcode}<br/>
                          {student.parent.country}
                        </>
                      ) : (
                        <span className="text-slate-400">Address not provided</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Billing */}
                  <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                    <p className="text-brand-700 font-semibold mb-1">Invoice Target</p>
                    <p className="font-bold text-slate-800">{student.parent.invoice_target || 'Father'}</p>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentProfileModal;
