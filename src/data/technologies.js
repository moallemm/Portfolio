// Local assets only: see public/technologies/SOURCES.md for provenance and licenses.
const mark = (file, plate = false) => ({ file: `technologies/${file}.svg`, plate });
const normalize = (name) => String(name).normalize('NFKC').toLowerCase().replace(/[\s._/()\-]/g, '');

const technologies = [
  { names: ['Python'], icons: [mark('python')] },
  { names: ['PyTorch'], icons: [mark('pytorch')] },
  { names: ['TensorFlow', 'TensorFlow.js'], icons: [mark('tensorflow')] },
  { names: ['Scikit-learn', 'sklearn'], icons: [mark('scikitlearn')] },
  { names: ['YOLO', 'YOLOv8', 'YOLOv8n', 'Ultralytics'], icons: [mark('ultralytics', true)] },
  { names: ['OpenCV', 'OpenCV.js'], icons: [mark('opencv')] },
  { names: ['spaCy'], icons: [mark('spacy', true)] },
  { names: ['Unsloth'], icons: [{ file: 'technologies/unsloth.png', plate: false }] },
  { names: ['Pandas'], icons: [mark('pandas', true)] },
  { names: ['NumPy'], icons: [mark('numpy')] },
  { names: ['Matplotlib'], icons: [mark('matplotlib')] },
  { names: ['Seaborn'], icons: [mark('seaborn')] },
  { names: ['Tableau'], icons: [mark('tableau', true)] },
  { names: ['Power BI'], icons: [mark('powerbi')] },
  { names: ['Excel', 'Microsoft Excel'], icons: [mark('microsoftexcel', true)] },
  { names: ['React', 'React.js'], icons: [mark('react')] },
  { names: ['JavaScript'], icons: [mark('javascript')] },
  { names: ['TypeScript'], icons: [mark('typescript')] },
  { names: ['HTML', 'HTML5'], icons: [mark('html5')] },
  { names: ['CSS', 'CSS3'], icons: [mark('css3')] },
  { names: ['HTML / CSS'], icons: [mark('html5'), mark('css3')] },
  { names: ['Node.js', 'Node'], icons: [mark('nodejs')] },
  { names: ['Flask'], icons: [mark('flask', true)] },
  { names: ['MySQL'], icons: [mark('mysql', true)] },
  { names: ['PostgreSQL', 'Postgres'], icons: [mark('postgresql')] },
  { names: ['Flutter'], icons: [mark('flutter')] },
  { names: ['Kotlin'], icons: [mark('kotlin')] },
  { names: ['Java'], icons: [mark('java')] },
  { names: ['Git'], icons: [mark('git')] },
  { names: ['Docker'], icons: [mark('docker')] },
  // Firestore is part of Firebase; use the suite's official mark.
  { names: ['Firebase', 'Firestore'], icons: [mark('firebase')] },
  { names: ['Linux (Ubuntu)', 'Ubuntu'], icons: [mark('ubuntu')] },
  { names: ['Jupyter', 'Jupyter Notebook'], icons: [mark('jupyter')] },
  { names: ['Google Colab', 'Colab'], icons: [mark('googlecolab')] },
  { names: ['AWS', 'Amazon Web Services'], icons: [mark('amazonwebservices', true)] },
  { names: ['Hugging Face', 'Transformers'], icons: [mark('huggingface')] },
  { names: ['Supabase'], icons: [mark('supabase')] },
  { names: ['Vite'], icons: [mark('vitejs')] },
  { names: ['WordPress'], icons: [mark('wordpress', true)] },
  { names: ['Express', 'Express.js'], icons: [mark('express', true)] },
  { names: ['MongoDB'], icons: [mark('mongodb')] },
  { names: ['Bootstrap'], icons: [mark('bootstrap')] },
];

const symbols = [
  { names: ['SQL'], symbol: 'database' },
  { names: ['NLP', 'معالجة اللغة الطبيعية'], symbol: 'language' },
  { names: ['LLM fine-tuning', 'ضبط النماذج اللغوية الكبيرة'], symbol: 'brain' },
  { names: ['Statistical modeling', 'النمذجة الإحصائية'], symbol: 'chart' },
  { names: ['REST APIs'], symbol: 'network' },
  { names: ['MobileNetV3', 'MobileNetV2', 'MobileNet', 'MiDaS'], symbol: 'layers' },
  { names: ['EasyOCR', 'MediaPipe', 'cvzone'], symbol: 'scan' },
];

const technologyMap = new Map(
  [...technologies, ...symbols].flatMap(({ names, ...technology }) => names.map((name) => [normalize(name), technology])),
);

export function getTechnology(name) {
  const key = normalize(name);
  if (/^yolov?\d+[nslmx]?$/.test(key)) return technologyMap.get('yolo');
  return technologyMap.get(key) || { symbol: 'code' };
}
