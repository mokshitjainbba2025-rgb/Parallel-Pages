import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold leading-tight mb-12">
            The vision behind <span className="italic text-blue-600">Parallel Pages.</span>
          </h1>
          <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 mb-16">
            <img
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000"
              alt="Workspace"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-2 space-y-8 text-xl text-black/70 leading-relaxed">
            <p>
              Parallel Pages was born out of a simple observation: the most interesting journeys aren't linear. They are a collection of parallel pursuits, curiosities, and experiments that eventually converge into something meaningful.
            </p>
            <p>
              Our mission is to provide a minimalist, editorial-grade platform where young builders, students, and entrepreneurs can document their "in-between" moments. Not just the big wins, but the failures, the pivots, and the raw learning curves.
            </p>
            <h2 className="text-3xl font-serif font-bold text-black pt-8">Storytelling Philosophy</h2>
            <p>
              We believe in high-signal, low-noise content. In a world of infinite scrolling, we advocate for the slow read. For the article that makes you pause, reflect, and perhaps start something of your own.
            </p>
          </div>
          <div className="space-y-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">Founder</h3>
              <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden mb-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mokshit" alt="Founder" />
              </div>
              <p className="font-bold">Mokshit Jain</p>
              <p className="text-sm text-black/40">Entrepreneur & Writer</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-4">Values</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Radical Transparency</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Intellectual Curiosity</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Minimalist Design</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Community First</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
