import { useState, useEffect } from 'react';
import { academicAPI } from '../../services/academicAPI';

const AcademicSettingsView = () => {
  const [activeTab, setActiveTab] = useState('semesters'); // semesters, years, fees
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [fees, setFees] = useState([]);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'semester', 'year', 'fee'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'semesters') {
        const res = await academicAPI.getSemesters();
        setSemesters(res.data);
      } else if (activeTab === 'years') {
        const res = await academicAPI.getYears();
        setYears(res.data);
      } else if (activeTab === 'fees') {
        const [feesRes, yearsRes] = await Promise.all([
          academicAPI.getTuitionFees(),
          academicAPI.getYears()
        ]);
        setFees(feesRes.data);
        setYears(yearsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'semester') {
        if (formData.id) await academicAPI.updateSemester(formData.id, formData);
        else await academicAPI.createSemester(formData);
      } else if (modalType === 'year') {
        if (formData.id) await academicAPI.updateYear(formData.id, formData);
        else await academicAPI.createYear(formData);
      } else if (modalType === 'fee') {
        await academicAPI.setTuitionFee({
          year_id: parseInt(formData.year_id),
          tuition_fee: parseFloat(formData.tuition_fee)
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save data. Please check your inputs.');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      if (type === 'semester') await academicAPI.deleteSemester(id);
      else if (type === 'year') await academicAPI.deleteYear(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete. It might be in use.');
    }
  };

  const renderSemesters = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Academic Semesters</h3>
        <button onClick={() => handleOpenModal('semester')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          + Add Semester
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Semester Name</th>
              <th className="p-4">Academic Year</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map(sem => (
              <tr key={sem.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{sem.semester_name}</td>
                <td className="p-4">{sem.academic_year}</td>
                <td className="p-4 text-sm text-gray-500">
                  {sem.start_date ? sem.start_date.substring(0, 10) : '-'} to {sem.end_date ? sem.end_date.substring(0, 10) : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sem.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {sem.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleOpenModal('semester', sem)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(sem.id, 'semester')} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderYears = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Year Levels</h3>
        <button onClick={() => handleOpenModal('year')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          + Add Year Level
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Year Name</th>
              <th className="p-4">Level Type</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.map(year => (
              <tr key={year.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{year.year_name}</td>
                <td className="p-4">{year.level}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleOpenModal('year', year)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(year.id, 'year')} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFees = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Base Tuition Fees</h3>
        <button onClick={() => handleOpenModal('fee')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Update Tuition Fee
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Year Level</th>
              <th className="p-4">Base Tuition Fee (THB)</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(fee => (
              <tr key={fee.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{fee.year?.year_name || `Year ID: ${fee.year_id}`}</td>
                <td className="p-4 text-green-700 font-bold">{parseFloat(fee.tuition_fee).toLocaleString()} ฿</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Academic Settings</h1>
        <p className="text-gray-500 mt-1">Manage Semesters, Year Levels, and Base Tuition Fees</p>
      </div>

      <div className="flex gap-4 mb-6 border-b pb-4">
        <button 
          className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'semesters' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('semesters')}
        >
          Semesters & Terms
        </button>
        <button 
          className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'years' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('years')}
        >
          Year Levels
        </button>
        <button 
          className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'fees' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('fees')}
        >
          Tuition Fees
        </button>
      </div>

      {activeTab === 'semesters' && renderSemesters()}
      {activeTab === 'years' && renderYears()}
      {activeTab === 'fees' && renderFees()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              {modalType === 'semester' ? 'Semester Details' : modalType === 'year' ? 'Year Level Details' : 'Set Tuition Fee'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              {modalType === 'semester' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Semester Name</label>
                    <select required value={formData.semester_name || ''} onChange={e => setFormData({...formData, semester_name: e.target.value})} className="w-full border p-2 rounded-lg">
                      <option value="">-- Select Semester --</option>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <select required value={formData.academic_year || ''} onChange={e => setFormData({...formData, academic_year: e.target.value})} className="w-full border p-2 rounded-lg">
                      <option value="">-- Select Year --</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input type="date" value={formData.start_date ? formData.start_date.substring(0,10) : ''} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border p-2 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input type="date" value={formData.end_date ? formData.end_date.substring(0,10) : ''} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border p-2 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select value={formData.status || 'INACTIVE'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded-lg">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </>
              )}

              {modalType === 'year' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Year Name</label>
                    <select required value={formData.year_name || ''} onChange={e => setFormData({...formData, year_name: e.target.value})} className="w-full border p-2 rounded-lg">
                      <option value="">-- Select Year Level --</option>
                      <option value="Nursery">Nursery</option>
                      <option value="Early Years 1">Early Years 1</option>
                      <option value="Early Years 2">Early Years 2</option>
                      <option value="Early Years 3">Early Years 3</option>
                      {[...Array(13)].map((_, i) => (
                        <option key={i+1} value={`Year ${i+1}`}>Year {i+1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Level Type</label>
                    <select required value={formData.level || 'Primary'} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full border p-2 rounded-lg">
                      <option value="Early Years">Early Years</option>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                    </select>
                  </div>
                </>
              )}

              {modalType === 'fee' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Year Level</label>
                    <select required value={formData.year_id || ''} onChange={e => setFormData({...formData, year_id: e.target.value})} className="w-full border p-2 rounded-lg">
                      <option value="">-- Select Year --</option>
                      {years.map(y => (
                        <option key={y.id} value={y.id}>{y.year_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Tuition Fee (THB)</label>
                    <input type="number" required min="0" step="any" value={formData.tuition_fee || ''} onChange={e => setFormData({...formData, tuition_fee: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="e.g. 203000" />
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSettingsView;
