import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Github,
  Linkedin,
  Phone,
  Send,
} from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { profile as portfolioData } from '../data/portfolioData';

const FORM_ENDPOINT = 'https://formspree.io/f/mjgblvkr';

const formCopy = {
  en: {
    title: 'Leave me a message',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    subject: 'Subject',
    subjectPlaceholder: 'What would you like to talk about?',
    message: 'Message',
    messagePlaceholder: 'Tell me a little about your idea or opportunity…',
    submit: 'Send message',
    sending: 'Sending…',
    note: 'All fields are required. Your message goes straight to my inbox.',
    success: 'Thanks for reaching out! Your message has been sent. I’ll get back to you soon.',
    serviceError: 'Your message couldn’t be sent. Please try again, or email me directly.',
    networkError: 'The connection was interrupted. Your message is still here. Please try again, or email me directly.',
    phone: 'Phone',
  },
  ar: {
    title: 'اترك لي رسالة',
    name: 'الاسم',
    namePlaceholder: 'اسمك',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'you@example.com',
    subject: 'الموضوع',
    subjectPlaceholder: 'ما الذي تود التحدث عنه؟',
    message: 'الرسالة',
    messagePlaceholder: 'أخبرني قليلاً عن فكرتك أو الفرصة التي تود مناقشتها…',
    submit: 'إرسال الرسالة',
    sending: 'جارٍ الإرسال…',
    note: 'جميع الحقول مطلوبة. تصل رسالتك مباشرةً إلى بريدي.',
    success: 'شكراً لتواصلك! تم إرسال رسالتك، وسأرد عليك قريباً.',
    serviceError: 'تعذّر إرسال رسالتك. حاول مجدداً أو تواصل معي عبر البريد الإلكتروني مباشرةً.',
    networkError: 'انقطع الاتصال. لا تزال رسالتك محفوظة هنا. حاول مجدداً أو تواصل معي عبر البريد الإلكتروني مباشرةً.',
    phone: 'الهاتف',
  },
};

export default function Contact() {
  const { t, isArabic } = useLocale();
  const copy = formCopy[isArabic ? 'ar' : 'en'];
  const [copyStatus, setCopyStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!copyStatus) return undefined;
    const timeout = window.setTimeout(() => setCopyStatus(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolioData.email);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (submitting.current || !form.reportValidity()) return;

    submitting.current = true;
    setIsSubmitting(true);
    setSubmission(null);

    try {
      const values = Object.fromEntries(new FormData(form));
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        form.reset();
        setSubmission({ status: 'success', message: 'success' });
      } else {
        const result = await response.json().catch(() => null);
        const details = Array.isArray(result?.errors)
          ? result.errors.map((error) => error.message).filter(Boolean).join(' ')
          : typeof result?.error === 'string' ? result.error : '';
        setSubmission({ status: 'error', message: 'serviceError', details });
      }
    } catch {
      setSubmission({ status: 'error', message: 'networkError' });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact-top">
          <p className="eyebrow">
            <span className="section-number">06</span>
            {t.contact.eyebrow}
          </p>
          <span className="contact-availability">
            <span className="status-dot" aria-hidden="true" />
            {t.contact.availability}
          </span>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h2 id="contact-title">{t.contact.title}</h2>
            <p className="contact-description">{t.contact.description}</p>
            <div className="email-row">
              <a
                className="contact-email"
                href={`mailto:${portfolioData.email}`}
                aria-label={`${t.contact.emailLabel}: ${portfolioData.email}`}
              >
                <span dir="ltr">{portfolioData.email}</span>
                <ArrowUpRight size={25} aria-hidden="true" />
              </a>
              <button
                type="button"
                className="icon-button copy-button"
                data-copy-email
                onClick={copyEmail}
                aria-label={copyStatus === 'success' ? t.contact.copied : t.contact.copy}
                title={copyStatus === 'success' ? t.contact.copied : t.contact.copy}
              >
                {copyStatus === 'success'
                  ? <Check size={18} aria-hidden="true" />
                  : <Copy size={18} aria-hidden="true" />}
              </button>
            </div>
            <p
              className={`copy-status ${copyStatus === 'error' ? 'copy-error' : ''}`}
              role="status"
              aria-live="polite"
            >
              {copyStatus === 'success'
                ? t.contact.copied
                : copyStatus === 'error' ? t.contact.copyError : '\u00a0'}
            </p>

            <div className="contact-links">
              <a href={portfolioData.socials.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin size={18} aria-hidden="true" />
                {t.contact.linkedin}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href={portfolioData.socials.github} target="_blank" rel="noopener noreferrer">
                <Github size={18} aria-hidden="true" />
                {t.contact.github}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href={`${import.meta.env.BASE_URL}Mohamad%20Moallem_CV_2026.pdf`} download>
                <Download size={18} aria-hidden="true" />
                {t.contact.resume}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a
                href={`tel:${portfolioData.phone.replaceAll(' ', '')}`}
                aria-label={`${copy.phone}: ${portfolioData.phone}`}
              >
                <Phone size={17} aria-hidden="true" />
                <span dir="ltr">{portfolioData.phone}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <form
            id="contact-form"
            className="contact-form"
            action={FORM_ENDPOINT}
            method="POST"
            onSubmit={handleSubmit}
            aria-labelledby="contact-form-title"
            aria-busy={isSubmitting}
          >
            <h3 id="contact-form-title" className="contact-form-heading">{copy.title}</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="contact-name">{copy.name}</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={copy.namePlaceholder}
                  dir="auto"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="contact-email">{copy.email}</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={copy.emailPlaceholder}
                  dir="ltr"
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="contact-subject">{copy.subject}</label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                placeholder={copy.subjectPlaceholder}
                dir="auto"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="contact-message">{copy.message}</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder={copy.messagePlaceholder}
                rows={5}
                dir="auto"
                required
              />
            </div>
            <p className="contact-form-note">{copy.note}</p>
            <p
              className="form-status"
              data-contact-status
              data-status={submission?.status || undefined}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {submission && (
                <>
                  {copy[submission.message]}
                  {submission.details && <span> {submission.details}</span>}
                </>
              )}
            </p>
            <button
              className="button button-primary contact-submit"
              type="submit"
              disabled={isSubmitting}
            >
              <Send size={17} aria-hidden="true" />
              {isSubmitting ? copy.sending : copy.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
