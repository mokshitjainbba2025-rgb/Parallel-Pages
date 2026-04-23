import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { UserProfile } from '../../types';
import { User, Shield, ShieldCheck, UserX, Search, Mail, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (uid: string, newRole: 'admin' | 'writer' | 'reader') => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.updateUserRole(uid, newRole);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-400 mt-1">Manage system access roles for readers, writers, and admins.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-blue-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((u, i) => (
              <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{u.displayName}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar size={10} /> Joined {formatDate(u.createdAt)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} /> {u.email}
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    u.role === 'admin' ? 'bg-red-50 text-red-600' :
                    u.role === 'writer' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => handleUpdateRole(u.uid, 'admin')}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                        title="Promote to Admin"
                      >
                        <ShieldCheck size={18} />
                      </button>
                    )}
                    {u.role !== 'writer' && (
                      <button 
                        onClick={() => handleUpdateRole(u.uid, 'writer')}
                        className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"
                        title="Promote to Writer"
                      >
                        <Shield size={18} />
                      </button>
                    )}
                    {u.role !== 'reader' && (
                      <button 
                        onClick={() => handleUpdateRole(u.uid, 'reader')}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                        title="Reset to Reader"
                      >
                        <UserX size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
