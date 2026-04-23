import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { NewsletterSubscriber } from '../../types';
import { Mail, Calendar, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const data = await api.getSubscribers();
        setSubscribers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-gray-400 mt-1">Manage your audience and growing community.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <UserCheck size={20} className="text-green-500" />
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Audience</p>
            <p className="text-xl font-bold leading-none mt-1">{subscribers.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Subscriber Email</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Join Date</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-md w-48"></div></td>
                  <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-md w-32"></div></td>
                  <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-md w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : subscribers.length > 0 ? (
              subscribers.map((sub, index) => (
                <motion.tr 
                  key={sub.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Mail size={14} />
                      </div>
                      <span className="font-medium">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar size={14} />
                      {formatDate(sub.subscribedAt)}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest">Active</span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center text-gray-400 italic">
                  No subscribers found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
