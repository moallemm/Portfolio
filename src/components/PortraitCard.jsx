import { useEffect, useId, useRef, useState } from 'react';
import { useLocale } from '../context/LocaleContext';

export default function PortraitCard() {
  const { t, isArabic } = useLocale();
  const [flipped, setFlipped] = useState(false);
  const stage = useRef(null);
  const card = useRef(null);
  const allowTilt = useRef(false);
  const hintId = useId();
  const resetTilt = () => {
    card.current?.style.setProperty('--tilt-x', '0deg');
    card.current?.style.setProperty('--tilt-y', '0deg');
    card.current?.classList.remove('is-tilting');
  };

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => {
      allowTilt.current = !motion.matches && pointer.matches;
      if (!allowTilt.current) resetTilt();
    };
    sync();
    motion.addEventListener('change', sync);
    pointer.addEventListener('change', sync);
    return () => {
      motion.removeEventListener('change', sync);
      pointer.removeEventListener('change', sync);
    };
  }, []);

  const tilt = (event) => {
    if (!allowTilt.current || event.pointerType === 'touch') return;
    const bounds = stage.current.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    // Positive Y rotation moves the card's right edge away from the viewer.
    card.current.style.setProperty('--tilt-x', `${(-y * 9).toFixed(2)}deg`);
    card.current.style.setProperty('--tilt-y', `${(x * 9).toFixed(2)}deg`);
    card.current.classList.add('is-tilting');
  };

  const action = flipped
    ? (isArabic ? 'العودة إلى صورتي الأصلية' : 'Show my original portrait')
    : (isArabic ? 'شاهد صورتي المرسومة بالذكاء الاصطناعي' : 'Meet my illustrated self');
  const hint = flipped
    ? (isArabic ? 'اضغط للعودة إلى صورتي الأصلية' : 'Click to return to my original portrait')
    : (isArabic ? 'اضغط لمشاهدة وجهي الآخر' : 'Click to see another side of me');

  return (
    <div className="portrait-interactive">
      <div ref={stage} className="portrait-stage" data-portrait-stage onPointerMove={tilt} onPointerLeave={resetTilt}>
        <button
          ref={card} type="button" className="portrait-card" data-portrait-card
          aria-pressed={flipped} aria-label={action} aria-describedby={hintId}
          onBlur={resetTilt} onClick={() => setFlipped((current) => !current)}
        >
          <span className={`portrait-card-rotator${flipped ? ' is-flipped' : ''}`}>
            <span className="portrait-face portrait-front" aria-hidden={flipped}>
              <img src={`${import.meta.env.BASE_URL}profile.jpg`} alt={t.hero.portraitAlt} width="500" height="350" fetchPriority="high" decoding="async" />
            </span>
            <span className="portrait-face portrait-back" aria-hidden={!flipped}>
              <img src={`${import.meta.env.BASE_URL}profile-illustrated.jpg`} alt={isArabic ? 'رسم لمحمد معلم بالذكاء الاصطناعي' : 'AI-illustrated portrait of Mohamad Moallem'} width="1254" height="1254" loading="lazy" decoding="async" />
            </span>
          </span>
        </button>
      </div>
      <p id={hintId} className="portrait-hint" aria-live="polite">{hint}</p>
    </div>
  );
}
