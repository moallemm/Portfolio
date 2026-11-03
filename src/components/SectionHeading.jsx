export default function SectionHeading({ number, eyebrow, title, children }) {
  return <div className="section-heading"><div><p className="eyebrow"><span className="section-number">{number}</span>{eyebrow}</p><h2>{title}</h2></div>{children && <div className="section-heading-aside">{children}</div>}</div>;
}
