/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Search, 
  User as UserIcon, 
  Lock, 
  Mail, 
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { storage } from './lib/storage';
import { User, DepartmentRecord } from './types';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [records, setRecords] = useState<DepartmentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Dashboard Form State
  const [deptName, setDeptName] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptPassword, setDeptPassword] = useState('');

  useEffect(() => {
    const session = storage.getSession();
    if (session) {
      setUser(session);
      setView('dashboard');
      setRecords(storage.getRecords());
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    const users = storage.getUsers();
    if (users.find(u => u.email === authEmail)) {
      setError('User already exists');
      return;
    }

    storage.saveUser({ email: authEmail, password: authPassword });
    setError('');
    setView('login');
    alert('Registration successful! Please login.');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setError('Please fill in all fields');
      return;
    }

    const users = storage.getUsers();
    const foundUser = users.find(u => u.email === authEmail && u.password === authPassword);

    if (foundUser) {
      storage.setSession(authEmail);
      setUser(authEmail);
      setView('dashboard');
      setRecords(storage.getRecords());
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    storage.setSession(null);
    setUser(null);
    setView('login');
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptEmail || !deptPassword) {
      alert('Please fill in all fields');
      return;
    }

    const newRecord: DepartmentRecord = {
      id: crypto.randomUUID(),
      department: deptName,
      email: deptEmail,
      password: deptPassword,
      createdAt: Date.now()
    };

    storage.saveRecord(newRecord);
    setRecords(storage.getRecords());
    setDeptName('');
    setDeptEmail('');
    setDeptPassword('');
    alert('Record saved successfully!');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.department.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [records, searchQuery]);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      {user && (
        <nav className="mx-6 mt-6 glass-panel px-6 py-4 flex justify-between items-center sticky top-6 z-50 rounded-[15px]">
          <div className="flex items-center gap-2">
            <div className="bg-[var(--accent)] p-2 rounded-lg">
              <ShieldCheck className="text-[#1a1a2e] w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tighter text-[var(--accent)]">PassManager</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-[var(--text-dim)] hidden sm:block">
              Logged in as: <strong className="text-white ml-1">{user}</strong>
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-[var(--error)] bg-[rgba(255,82,82,0.1)] border border-[rgba(255,82,82,0.2)] px-4 py-2 rounded-lg hover:bg-[rgba(255,82,82,0.2)] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div 
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-20"
            >
              <div className="glass-panel p-10 rounded-[25px]">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[rgba(79,195,247,0.1)] rounded-3xl mb-6 border border-[rgba(79,195,247,0.2)]">
                    <UserIcon className="w-10 h-10 text-[var(--accent)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
                    {view === 'login' ? 'Login' : 'Register'}
                  </h2>
                  <p className="text-[var(--text-dim)] text-sm mt-3">
                    {view === 'login' 
                      ? 'Enter your credentials to manage your passwords' 
                      : 'Create a new account to start saving passwords'}
                  </p>
                </div>

                <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-6">
                  {error && (
                    <div className="bg-[rgba(255,82,82,0.1)] text-[var(--error)] p-4 rounded-xl text-xs font-bold border border-[rgba(255,82,82,0.2)] text-center uppercase tracking-wider">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dim)]" />
                      <input 
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 glass-input rounded-xl outline-none transition-all text-sm"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-dim)]" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 glass-input rounded-xl outline-none transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[var(--accent)] hover:brightness-110 text-[#1a1a2e] font-black py-4 rounded-xl shadow-[0_0_20px_rgba(79,195,247,0.3)] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-sm"
                  >
                    {view === 'login' ? 'Login' : 'Register'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-10 pt-8 border-t border-[rgba(255,255,255,0.1)] text-center">
                  <p className="text-[var(--text-dim)] text-xs font-medium uppercase tracking-wider">
                    {view === 'login' ? "New User?" : "Already have an account?"}{' '}
                    <button 
                      onClick={() => {
                        setView(view === 'login' ? 'register' : 'login');
                        setError('');
                      }}
                      className="text-[var(--accent)] font-bold hover:underline ml-1"
                    >
                      {view === 'login' ? 'Register Now' : 'Login Now'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 mt-6"
            >
              {/* Left Column: Form */}
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[20px]">
                  <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-sm font-black text-[var(--accent)] uppercase tracking-[0.2em]">Add New Account</h2>
                  </div>

                  <form onSubmit={handleSaveRecord} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest ml-1">Department / Service Name</label>
                      <input 
                        type="text"
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-lg outline-none text-sm transition-all"
                        placeholder="e.g. Google, Office, HR"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest ml-1">Email / ID</label>
                      <input 
                        type="text"
                        value={deptEmail}
                        onChange={(e) => setDeptEmail(e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-lg outline-none text-sm transition-all"
                        placeholder="username or email"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest ml-1">Password</label>
                      <input 
                        type="text"
                        value={deptPassword}
                        onChange={(e) => setDeptPassword(e.target.value)}
                        className="w-full px-4 py-3 glass-input rounded-lg outline-none text-sm transition-all"
                        placeholder="Enter password"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[var(--accent)] hover:brightness-110 text-[#1a1a2e] font-black py-3.5 rounded-lg transition-all shadow-[0_0_15px_rgba(79,195,247,0.2)] uppercase tracking-widest text-xs"
                    >
                      Save Account
                    </button>
                  </form>
                </div>

                <div className="glass-panel p-6 rounded-[20px] relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-black text-[var(--accent)] text-xs uppercase tracking-widest mb-2">Local Storage</h3>
                    <p className="text-[var(--text-dim)] text-[11px] leading-relaxed uppercase tracking-wider">
                      Your passwords are saved locally in this browser.
                    </p>
                  </div>
                  <ShieldCheck className="absolute -right-6 -bottom-6 w-24 h-24 text-[var(--accent)] opacity-10" />
                </div>
              </div>

              {/* Right Column: Data View */}
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[20px] flex flex-col h-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <h2 className="text-sm font-black text-[var(--accent)] uppercase tracking-[0.2em]">Saved Accounts</h2>
                    <div className="flex items-center gap-4 flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search accounts..."
                          className="w-full pl-11 pr-4 py-2.5 glass-input rounded-xl outline-none text-sm transition-all bg-[rgba(0,0,0,0.2)]"
                        />
                      </div>
                      <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 border-[rgba(255,255,255,0.1)]">
                        <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">{filteredRecords.length} RECORDS</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest p-4 border-b border-[var(--glass-border)]">Service</th>
                          <th className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest p-4 border-b border-[var(--glass-border)]">Email / ID</th>
                          <th className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest p-4 border-b border-[var(--glass-border)]">Password</th>
                          <th className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest p-4 border-b border-[var(--glass-border)] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <motion.tr 
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                          >
                            <td className="p-4 border-b border-[rgba(255,255,255,0.05)]">
                              <span className="inline-block px-3 py-1 rounded bg-[rgba(79,195,247,0.1)] text-[var(--accent)] text-[10px] font-black uppercase tracking-widest">
                                {record.department}
                              </span>
                            </td>
                            <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-sm text-white font-medium">
                              {record.email}
                            </td>
                            <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-sm font-mono">
                              <div className="flex items-center gap-2">
                                <span className={visiblePasswords[record.id] ? "text-white" : "text-[var(--text-dim)]"}>
                                  {visiblePasswords[record.id] ? record.password : "••••••••"}
                                </span>
                                <button 
                                  onClick={() => togglePasswordVisibility(record.id)}
                                  className="text-[var(--text-dim)] hover:text-white transition-colors"
                                >
                                  {visiblePasswords[record.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-right">
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this account?')) {
                                    const records = storage.getRecords().filter(r => r.id !== record.id);
                                    localStorage.setItem('deptflow_records', JSON.stringify(records));
                                    setRecords(records);
                                  }
                                }}
                                className="text-[10px] font-black text-[var(--error)] opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
                              >
                                Delete
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredRecords.length === 0 && (
                      <div className="py-20 text-center">
                        <Search className="w-12 h-12 text-[var(--text-dim)] opacity-20 mx-auto mb-4" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">No Accounts Found</h3>
                        <p className="text-[var(--text-dim)] text-xs mt-2 uppercase tracking-wider">Search again or add a new account</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
