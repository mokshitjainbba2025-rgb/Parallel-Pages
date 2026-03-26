import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | Parallel Pages</title>
        <meta name="description" content="Privacy policy for Parallel Pages. Learn how we handle your data." />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          <h1 className="text-5xl font-serif font-bold mb-12">Privacy Policy</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-black/60 leading-relaxed">
              We collect information you provide directly to us, such as when you subscribe to our newsletter, contact us through our contact form, or create an account. This information may include your name, email address, and any other information you choose to provide.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <div className="text-black/60 leading-relaxed">
              We use the information we collect to:
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Provide, maintain, and improve our services.</li>
                <li>Send you newsletters and other communications you have requested.</li>
                <li>Respond to your comments, questions, and requests.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
            <p className="text-black/60 leading-relaxed">
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
            <p className="text-black/60 leading-relaxed">
              We may use third-party services, such as analytics providers and email marketing platforms, that collect information about your use of our services. These third-party services have their own privacy policies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
            <p className="text-black/60 leading-relaxed">
              We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
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
