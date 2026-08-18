import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Book, Search, Plus, BookOpen, Clock, AlertCircle, CheckCircle, Upload } from 'lucide-react';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, borrowings
  
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [bookForm, setBookForm] = useState({
    title: '', author: '', isbn: '', publisher: '', year_published: new Date().getFullYear(),
    category_id: '', total_copies: 1, location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [booksRes, borrowRes, catRes] = await Promise.all([
        api.get('/admin/library/books'),
        api.get('/admin/library/borrowings'),
        api.get('/admin/library/categories')
      ]);
      setBooks(booksRes.data || []);
      setBorrowings(borrowRes.data || []);
      setCategories(catRes.data || []);
      
      if (catRes.data && catRes.data.length > 0 && !bookForm.category_id) {
        setBookForm(prev => ({ ...prev, category_id: catRes.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch library data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        category_id: parseInt(bookForm.category_id),
        year_published: parseInt(bookForm.year_published),
        total_copies: parseInt(bookForm.total_copies)
      };
      await api.post('/admin/library/books', payload);
      setIsBookModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add book', error);
      alert('Failed to add book');
    }
  };

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Confirm returning this book?')) return;
    try {
      const res = await api.put(`/admin/library/return/${borrowId}`);
      if (res.data.borrowing?.fine_amount > 0) {
        alert(`Book returned! Late fine incurred: ฿${res.data.borrowing.fine_amount}`);
      }
      fetchData();
    } catch (error) {
      console.error('Failed to return book', error);
      alert('Failed to return book');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'BORROWED') return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Clock size={12}/> Borrowed</span>;
    if (status === 'RETURNED') return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Returned</span>;
    return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> Overdue</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-brand-500" /> Library Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage catalog, loans, and returns</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1">
            <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'catalog' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
              Book Catalog
            </button>
            <button onClick={() => setActiveTab('borrowings')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'borrowings' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}>
              Borrowings
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button 
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={18} /> Add Book
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium">Loading Library Data...</div>
      ) : activeTab === 'catalog' ? (
        <div className="space-y-6">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text" placeholder="Search title or author..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-300 overflow-hidden">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <Book size={48} />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{book.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{book.author}</p>
                  <p className="text-xs text-brand-600 font-semibold mt-1 bg-brand-50 inline-block px-2 py-0.5 rounded-md">
                    {book.category?.name || 'Uncategorized'}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">Available:</span>
                  <span className={`font-bold ${book.available_copies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {book.available_copies} / {book.total_copies}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">Book</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Borrower</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Borrow Date</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Due Date</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Fine</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {borrowings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 line-clamp-1">{b.book?.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{b.book?.author}</p>
                  </td>
                  <td className="p-4">
                    {b.student ? (
                      <p className="font-semibold text-slate-700">{b.student.fullname} <span className="text-xs text-slate-400 block">(Student)</span></p>
                    ) : (
                      <p className="font-semibold text-brand-700">{b.teacher?.fullname} <span className="text-xs text-brand-400 block">(Teacher)</span></p>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{b.borrow_date}</td>
                  <td className="p-4 text-sm text-slate-600">{b.due_date}</td>
                  <td className="p-4">{getStatusBadge(b.status)}</td>
                  <td className="p-4 text-sm font-bold text-red-500">
                    {b.fine_amount > 0 ? `฿${b.fine_amount}` : '-'}
                  </td>
                  <td className="p-4">
                    {b.status === 'BORROWED' && (
                      <button onClick={() => handleReturn(b.id)} className="text-sm font-bold text-brand-600 hover:text-brand-700 border border-brand-200 hover:bg-brand-50 px-3 py-1 rounded-lg transition-colors">
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Book size={20}/> Add New Book</h3>
            </div>
            
            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input type="text" required value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
                  <input type="text" required value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select required value={bookForm.category_id} onChange={e => setBookForm({...bookForm, category_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ISBN</label>
                  <input type="text" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Publisher</label>
                  <input type="text" value={bookForm.publisher} onChange={e => setBookForm({...bookForm, publisher: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Year Published</label>
                  <input type="number" required value={bookForm.year_published} onChange={e => setBookForm({...bookForm, year_published: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Copies</label>
                    <input type="number" min="1" required value={bookForm.total_copies} onChange={e => setBookForm({...bookForm, total_copies: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                    <input type="text" value={bookForm.location} onChange={e => setBookForm({...bookForm, location: e.target.value})} placeholder="Shelf A1" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsBookModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;
