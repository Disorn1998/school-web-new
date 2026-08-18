import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { Save, ArrowLeft, Check, AlertCircle } from 'lucide-react';

const ConductScoreEntry = ({ headerId, onBack }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Local state for scores: key = `${studentId}_${categoryId}`, value = score
  const [scores, setScores] = useState({});
  // Local state for comments: key = studentId, value = comment string
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/admin/conduct/details/${headerId}`);
        setData(res.data);
        
        // Populate existing scores
        const newScores = {};
        res.data.details.forEach(d => {
          newScores[`${d.student_id}_${d.category_id}`] = d.score;
        });
        setScores(newScores);

        // Populate existing comments
        const newComments = {};
        res.data.comments.forEach(c => {
          newComments[c.student_id] = c.general_comment;
        });
        setComments(newComments);

      } catch (err) {
        console.error(err);
        alert('Failed to load conduct details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [headerId]);

  // Group categories by type
  const groupedCategories = useMemo(() => {
    if (!data?.categories) return {};
    const grouped = {};
    data.categories.forEach(c => {
      if (!grouped[c.type]) grouped[c.type] = [];
      grouped[c.type].push(c);
    });
    return grouped;
  }, [data]);

  const handleScoreChange = (studentId, categoryId, value) => {
    let val = parseInt(value);
    if (isNaN(val)) val = '';
    else if (val < 1) val = 1;
    else if (val > 4) val = 4; // Assuming 1-4 scale based on legacy system 1-4 or 1-5. Let's allow up to 5 just in case.

    setScores(prev => ({
      ...prev,
      [`${studentId}_${categoryId}`]: val
    }));
  };

  const handleCommentChange = (studentId, value) => {
    setComments(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    try {
      const scorePayload = [];
      Object.keys(scores).forEach(key => {
        if (scores[key] !== '') {
          const [studentId, categoryId] = key.split('_');
          scorePayload.push({
            student_id: parseInt(studentId),
            category_id: parseInt(categoryId),
            score: parseInt(scores[key])
          });
        }
      });

      const commentPayload = [];
      Object.keys(comments).forEach(studentId => {
        commentPayload.push({
          student_id: parseInt(studentId),
          comment: comments[studentId]
        });
      });

      await api.post(`/admin/conduct/bulk/${headerId}`, {
        scores: scorePayload,
        comments: commentPayload
      });

      setSuccessMsg('Conduct scores saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save scores');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center py-10 font-medium text-slate-500">Loading Matrix...</div>;
  if (!data) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-slide-up">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Evaluating: {data.header?.year?.year_name}
            </h2>
            <p className="text-sm text-slate-500">
              Semester {data.header?.semester?.semester_name} | Date: {data.header?.evaluation_date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-green-600 font-bold flex items-center gap-1 text-sm bg-green-50 px-3 py-1 rounded-lg"><Check size={16}/> {successMsg}</span>}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 transition disabled:opacity-50"
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="mb-4 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl flex items-center gap-2 font-medium text-sm">
          <AlertCircle size={18} /> Enter scores from 1 to 4 (or 5) for each category.
        </div>
        
        {Object.keys(groupedCategories).map(type => (
          <div key={type} className="mb-8">
            <h3 className="font-bold text-lg text-brand-700 mb-3 uppercase tracking-wide border-b pb-2">{type}</h3>
            <table className="w-full text-sm border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr>
                  <th className="w-64 bg-slate-50 border border-slate-200 p-2 text-left text-slate-600">Category</th>
                  {data.students.map(s => (
                    <th key={s.id} className="w-24 bg-slate-50 border border-slate-200 p-2 text-center text-slate-800 font-bold">
                      <div className="truncate text-xs" title={s.fullname}>{s.first_name || s.fullname.split(' ')[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedCategories[type].map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/50">
                    <td className="border border-slate-200 p-2 text-slate-700 font-medium truncate" title={cat.category}>
                      {cat.category}
                    </td>
                    {data.students.map(s => (
                      <td key={s.id} className="border border-slate-200 p-1 text-center">
                        <input 
                          type="number"
                          min="1" max="5"
                          value={scores[`${s.id}_${cat.id}`] || ''}
                          onChange={e => handleScoreChange(s.id, cat.id, e.target.value)}
                          className="w-12 text-center border border-slate-300 rounded-md py-1 focus:ring-2 focus:ring-brand-500 font-bold text-brand-700"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* General Comments Section */}
        <div className="mb-4 mt-8">
          <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2">General Comments</h3>
          <table className="w-full text-sm border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr>
                <th className="w-64 bg-slate-50 border border-slate-200 p-2 text-left text-slate-600">Student Name</th>
                <th className="bg-slate-50 border border-slate-200 p-2 text-left text-slate-600">Homeroom Teacher's Comment</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map(s => (
                <tr key={s.id}>
                  <td className="border border-slate-200 p-2 font-bold text-slate-700">{s.fullname}</td>
                  <td className="border border-slate-200 p-2">
                    <textarea 
                      value={comments[s.id] || ''}
                      onChange={e => handleCommentChange(s.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 min-h-[60px]"
                      placeholder="Write comment..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConductScoreEntry;
