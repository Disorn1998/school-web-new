import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Book, Search, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StudentLibrary = ({ currentStudent }) => {
  const [books, setBooks] = useState([]);
  const [myBorrowings, setMyBorrowings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    if (currentStudent) fetchData();
  }, [currentStudent]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [booksRes, borrowRes] = await Promise.all([
        api.get('/student/library/books'),
        api.get(`/student/library/borrowings/${currentStudent.id}`)
      ]);
      setBooks(booksRes.data || []);
      setMyBorrowings(borrowRes.data || []);
    } catch (error) {
      console.error('Failed to fetch library data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (!window.confirm('Do you want to borrow this book?')) return;
    setIsBorrowing(true);
    try {
      await api.post('/admin/library/borrow', {
        book_id: bookId,
        student_id: currentStudent.id,
        days: 7
      });
      alert('Book borrowed successfully! Pick it up at the library counter.');
      fetchData();
      setActiveTab('history');
    } catch (error) {
      console.error('Failed to borrow', error);
      alert(error.response?.data?.error || 'Failed to borrow book');
    } finally {
      setIsBorrowing(false);
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'BORROWED') return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock size={14}/> Borrowed</span>;
    if (status === 'RETURNED') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={14}/> Returned</span>;
    return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle size={14}/> Overdue</span>;
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-brand-500" /> E-Library
          </h2>
          <p className="text-slate-500 text-sm mt-1">Browse and borrow books</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 rounded-xl p-1 w-full md:w-auto">
            <button onClick={() => setActiveTab('catalog')} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'catalog' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Browse Catalog
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              My Books
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium">Loading Library...</div>
      ) : activeTab === 'catalog' ? (
        <div className="space-y-6">
          <div className="relative w-full bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text" placeholder="Search for books by title or author..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:outline-none text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col group">
                <div className="aspect-[3/4] bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-300 overflow-hidden relative">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Book size={48} />
                  )}
                  {book.available_copies <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-lg text-sm shadow-lg transform -rotate-12">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">{book.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-md">
                      {book.category?.name || 'Book'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{book.year_published}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-xs font-semibold text-slate-500">
                    <span className={book.available_copies > 0 ? 'text-emerald-600 font-bold' : 'text-red-500'}>{book.available_copies}</span> / {book.total_copies} Left
                  </div>
                  <button 
                    onClick={() => handleBorrow(book.id)}
                    disabled={isBorrowing || book.available_copies <= 0}
                    className="bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:hover:bg-brand-50 disabled:hover:text-brand-600"
                  >
                    Borrow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-2">
          {myBorrowings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myBorrowings.map(b => (
                <div key={b.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-300">
                      {b.book?.cover_image ? (
                        <img src={b.book.cover_image} alt={b.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <Book size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{b.book?.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">{b.book?.author}</p>
                      {getStatusBadge(b.status)}
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-1 md:w-48 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between w-full text-xs font-semibold text-slate-500">
                      <span>Borrowed:</span>
                      <span className="text-slate-700">{b.borrow_date}</span>
                    </div>
                    <div className="flex justify-between w-full text-xs font-semibold text-slate-500">
                      <span>Due Date:</span>
                      <span className={`font-bold ${b.status === 'OVERDUE' ? 'text-red-500' : 'text-slate-700'}`}>{b.due_date}</span>
                    </div>
                    {b.fine_amount > 0 && (
                      <div className="flex justify-between w-full text-xs font-bold text-red-500 mt-1 pt-1 border-t border-red-100">
                        <span>Late Fine:</span>
                        <span>฿{b.fine_amount}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Borrowing History</h3>
              <p className="text-slate-500 mt-1">You haven't borrowed any books yet. Check out the catalog!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentLibrary;
