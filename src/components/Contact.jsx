import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Using Formspree - update with your form ID
      const formspreeEndpoint = 'https://formspree.io/f/mjgblvkr';
      
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSubmitMessage('Message sent successfully! I will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitMessage(''), 5000);
      } else {
        setSubmitMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-secondary-light dark:bg-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Get In Touch</h2>
          <div className="h-1 w-20 bg-accent mb-12"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-text-primary-light dark:text-white mb-6">Let's Connect</h3>
              <p className="text-text-secondary-light dark:text-slate-300 mb-8">
                I'm always interested in hearing about new opportunities and projects. Feel free to reach out!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="text-accent mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="text-text-primary-light dark:text-white font-semibold mb-1">Email</h4>
                  <a href={`mailto:${portfolioData.socials.email}`} 
                  className="text-text-secondary-light dark:text-slate-400 hover:text-accent-light dark:hover:text-accent transition-colors"
                  target='_blank'>
                    {portfolioData.socials.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-accent mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="text-text-primary-light dark:text-white font-semibold mb-1">Phone</h4>
                  <p className="text-text-secondary-light dark:text-slate-400">{portfolioData.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="text-accent mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="text-text-primary-light dark:text-white font-semibold mb-1">Location</h4>
                  <p className="text-text-secondary-light dark:text-slate-400">{portfolioData.location}</p>
                </div>
              </div>
            </div>

            {/* Resume Download */}
            <motion.a
              whileHover={{ scale: 1.05 }}
              href={portfolioData.resume.url}
              download
              className="inline-block px-8 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-colors"
            >
              📄 {portfolioData.resume.downloadText}
            </motion.a>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-text-secondary-light dark:text-slate-300 font-semibold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-primary-light dark:bg-primary border border-slate-300 dark:border-slate-700 rounded-lg text-text-primary-light dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-accent-light dark:focus:border-accent transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-text-secondary-light dark:text-slate-300 font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-primary-light dark:bg-primary border border-slate-300 dark:border-slate-700 rounded-lg text-text-primary-light dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-accent-light dark:focus:border-accent transition-colors"
                placeholder="Your email"
              />
            </div>

            <div>
              <label className="block text-text-secondary-light dark:text-slate-300 font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-primary-light dark:bg-primary border border-slate-300 dark:border-slate-700 rounded-lg text-text-primary-light dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-accent-light dark:focus:border-accent transition-colors"
                placeholder="Subject"
              />
            </div>

            <div>
              <label className="block text-text-secondary-light dark:text-slate-300 font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 bg-primary-light dark:bg-primary border border-slate-300 dark:border-slate-700 rounded-lg text-text-primary-light dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-accent-light dark:focus:border-accent transition-colors resize-none"
                placeholder="Your message"
              ></textarea>
            </div>

            {submitMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  submitMessage.includes('success')
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {submitMessage}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
