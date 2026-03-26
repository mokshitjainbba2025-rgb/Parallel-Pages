import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { motion } from 'motion/react';

export default function Terms() {
  return (
    <Layout>
      <Helmet>
        <title>Terms and Conditions | Parallel Pages</title>
        <meta name="description" content="Terms and conditions for using the Parallel Pages platform." />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          <h1 className="text-5xl font-serif font-bold mb-12">Terms and Conditions</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-black/60 leading-relaxed">
              By accessing and using Parallel Pages, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Use of Content</h2>
            <p className="text-black/60 leading-relaxed">
              All content provided on Parallel Pages is for informational purposes only. The owner of this blog makes no representations as to the accuracy or completeness of any information on this site or found by following any link on this site.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. User Conduct</h2>
            <p className="text-black/60 leading-relaxed">
              Users are prohibited from using the site to post or transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
            <p className="text-black/60 leading-relaxed">
              The content, design, and logo of Parallel Pages are the intellectual property of Mokshit Jain and are protected by copyright laws. You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Modifications</h2>
            <p className="text-black/60 leading-relaxed">
              We reserve the right to modify these terms at any time. Your continued use of the site following any changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <p className="text-sm text-black/40 mt-20">
            Last updated: March 26, 2026
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
