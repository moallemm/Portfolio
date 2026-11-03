import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github, X } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import ProjectVisual from './ProjectVisual';
import SectionHeading from './SectionHeading';
import TechBadge from './TechBadge';

const tabs = ['completed', 'ongoing'];
const filters = ['all', 'vision', 'nlp', 'web', 'data'];
const formatCount = (count) => count.toString().padStart(2, '0');

function ProjectTools({ technologies, label }) {
  return <ul className="technology-list" aria-label={label}>
    {technologies.map((tool) => <li key={tool} dir="ltr"><TechBadge name={tool} compact /></li>)}
  </ul>;
}

export default function Projects() {
  const { t, isArabic } = useLocale();
  const [activeTab, setActiveTab] = useState('completed');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const dialog = useRef(null);
  const tabButtons = useRef({});
  const selected = t.projects.items.find((item) => item.id === selectedId);
  const items = filter === 'all' ? t.projects.items : t.projects.items.filter((item) => item.category === filter);
  const ongoingItems = t.projects.ongoingItems;
  const visibleCount = activeTab === 'completed' ? items.length : ongoingItems.length;

  useEffect(() => {
    const element = dialog.current;
    if (!selectedId || !element) return;
    if (!element.open) element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, [selectedId]);

  function handleTabKeyDown(event) {
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else if (event.key === 'ArrowRight') nextIndex = (currentIndex + (isArabic ? -1 : 1) + tabs.length) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex + (isArabic ? 1 : -1) + tabs.length) % tabs.length;
    else return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab);
    tabButtons.current[nextTab]?.focus();
  }

  return <section id="projects" className="section projects-section" aria-labelledby="projects-title">
    <div className="container">
      <SectionHeading number="03" eyebrow={t.projects.eyebrow} title={<span id="projects-title">{t.projects.title}</span>}>
        <p>{t.projects.intro}</p>
        <a className="text-link" href="https://github.com/moallemm?tab=repositories" target="_blank" rel="noopener noreferrer">{t.projects.github}<ArrowUpRight size={15} aria-hidden="true" /></a>
      </SectionHeading>

      <div className="project-tabs" role="tablist" aria-label={t.projects.tabLabel} onKeyDown={handleTabKeyDown}>
        {tabs.map((tab) => <button
          key={tab}
          ref={(element) => { tabButtons.current[tab] = element; }}
          id={`projects-tab-${tab}`}
          type="button"
          role="tab"
          className={`project-tab${activeTab === tab ? ' selected' : ''}`}
          aria-selected={activeTab === tab}
          aria-controls="projects-panel"
          tabIndex={activeTab === tab ? 0 : -1}
          onClick={() => setActiveTab(tab)}
        >
          {t.projects[`${tab}Tab`]}
          <span className="filter-count">{formatCount(tab === 'completed' ? t.projects.items.length : ongoingItems.length)}</span>
        </button>)}
      </div>

      <div id="projects-panel" className="project-panel" role="tabpanel" aria-labelledby={`projects-tab-${activeTab}`} tabIndex={0}>
        <div className="project-toolbar">
          {activeTab === 'completed' ? <div className="project-filters" role="group" aria-label={t.projects.filterLabel}>
            {filters.map((key) => <button key={key} type="button" data-project-filter={key} className={filter === key ? 'selected' : ''} aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {t.projects[key]}{key === 'all' && <span className="filter-count">{formatCount(t.projects.items.length)}</span>}
            </button>)}
          </div> : <p className="ongoing-intro">{t.projects.ongoingIntro}</p>}
          <span className="project-count mono" role="status" aria-live="polite">{formatCount(visibleCount)} {t.projects.countLabel}</span>
        </div>

        {activeTab === 'completed' ? <div className={`projects-grid${items.length > 5 ? ' projects-grid-expanded' : ''}`}>
          {items.map((project) => <article key={project.id} id={`project-${project.id}`} className={`project-card project-${project.visual}`}>
            <button type="button" className="project-image-button" data-project-details={project.id} aria-label={`${t.projects.details}: ${project.title}`} onClick={() => setSelectedId(project.id)}>
              <ProjectVisual type={project.visual} isArabic={isArabic} />
              <span className="project-image-action"><ArrowUpRight size={20} aria-hidden="true" /></span>
              {project.id === 'safewalk' && <span className="project-featured-tag">{t.projects.featured}</span>}
            </button>
            <div className="project-content">
              <div className="project-meta"><span className="eyebrow">{project.categoryLabel}</span><span className="mono">{formatCount(t.projects.items.findIndex((p) => p.id === project.id) + 1)}</span></div>
              <h3><button type="button" onClick={() => setSelectedId(project.id)}>{project.title}</button></h3>
              <p className="project-description">{project.description}</p>
              <ProjectTools technologies={project.technologies.slice(0, 4)} label={t.projects.tools} />
              <div className="project-links">
                <button type="button" className="text-link" onClick={() => setSelectedId(project.id)}>{t.projects.details}<ArrowUpRight size={15} aria-hidden="true" /></button>
                <a className="source-link" href={project.link} target="_blank" rel="noopener noreferrer"><Github size={15} aria-hidden="true" /><span>{t.projects.viewProject}</span></a>
              </div>
            </div>
          </article>)}
        </div> : <div className="ongoing-projects-grid">
          {ongoingItems.map((project, index) => <article key={project.id} id={`project-${project.id}`} className="ongoing-card">
            <div className="ongoing-card-top"><span className="ongoing-status"><span className="status-dot" aria-hidden="true" />{project.status}</span><span className="mono">{formatCount(index + 1)}</span></div>
            <h3>{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <ul className="ongoing-highlights">{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            <ProjectTools technologies={project.technologies} label={t.projects.tools} />
            {project.link && <a className="text-link" href={project.link} target="_blank" rel="noopener noreferrer"><Github size={15} aria-hidden="true" />{t.projects.viewSource}<ArrowUpRight size={15} aria-hidden="true" /></a>}
          </article>)}
        </div>}
      </div>
    </div>

    <dialog ref={dialog} className="project-dialog" aria-labelledby="dialog-title" onCancel={() => setSelectedId(null)} onClose={() => setSelectedId(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
      {selected && <div className="dialog-content">
        <div className="dialog-top"><span className="eyebrow">{selected.categoryLabel}</span><button type="button" className="icon-button" data-dialog-close onClick={() => setSelectedId(null)} aria-label={t.projects.close} autoFocus><X size={22} aria-hidden="true" /></button></div>
        <h2 id="dialog-title">{selected.title}</h2>
        <p className="dialog-description">{selected.description}</p>
        <div className="dialog-section"><h3>{t.projects.problem}</h3><p>{selected.problem || selected.detail}</p></div>
        <div className="dialog-section"><h3>{t.projects.approach}</h3><p>{selected.approach || selected.detail}</p><ul className="detail-highlights">{selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>
        <div className="dialog-section"><h3>{t.projects.tools}</h3><ProjectTools technologies={selected.technologies} label={t.projects.tools} /></div>
        <a className="button button-primary" href={selected.link} target="_blank" rel="noopener noreferrer"><Github size={17} aria-hidden="true" />{t.projects.viewProject}<ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>}
    </dialog>
  </section>;
}
