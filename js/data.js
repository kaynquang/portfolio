// Content source of truth: CV_Nguyen_Minh_Quang.pdf. Add new papers at the end of `publications`.

export const bongStats = { languages: 20, visitors: '15,000+', note: 'team figures' };

export const ventureLogos = {
  springer: { name: 'Springer', file: 'assets/logos/springer.png', fallbackText: 'Springer' },
  acm: { name: 'ACM', file: 'assets/logos/acm.svg', fallbackText: 'ACM' },
  ueh: { name: 'UEH College of Business and Institute of Business Research', file: 'assets/logos/ueh.png', fallbackText: 'UEH' },
  bk: { name: 'Ho Chi Minh City University of Technology (Bach Khoa)', file: 'assets/logos/bk.png', fallbackText: 'Bach Khoa' },
  yzu: { name: 'Yuan Ze University', file: 'assets/logos/yzu.png', fallbackText: 'YZU' },
  ctu: { name: 'Can Tho University', file: 'assets/logos/ctu.jpg', fallbackText: 'CTU' },
  iuh: { name: 'Industrial University of Ho Chi Minh City', file: 'assets/logos/iuh.svg', fallbackText: 'IUH' },
  eiu: { name: 'Eastern International University', file: 'assets/logos/eiu.png', fallbackText: 'EIU' },
};

export const publications = [
  {
    id: 'ic-peak-shifts',
    title: 'Discharge incremental-capacity peak shifts as non-invasive proxies for effective resistance heterogeneity and imbalance diagnostics in parallel lithium-ion modules',
    venue: 'ISDS 2026, Springer CCIS',
    role: 'first', status: 'accepted', year: 2026, logos: ['springer', 'ctu', 'yzu'],
  },
  {
    id: 'onnx-backdoor',
    title: 'Graph-Integrity Risks in Deployed ONNX Models: A Weight-Free Backdoor via Topology Injection',
    venue: 'CSoNet 2026, Springer LNCS',
    role: 'corresponding', status: 'accepted', year: 2026, logos: ['springer', 'bk'],
  },
  {
    id: 'traffic-sign-nms-free',
    title: 'Real-Time Traffic Sign Detection for Edge Devices: A Mixed-Precision NMS-Free Approach',
    venue: 'ATAC 2026',
    role: 'co-author', status: 'accepted', year: 2026, award: 'Best Paper Award', logos: ['eiu'],
  },
  {
    id: 'vital',
    title: 'VITAL: Vietnamese Text-Image Alignment Learning for Weakly Grounded Multimodal Clickbait Detection',
    venue: 'ISDS 2026, Springer CCIS',
    role: 'co-author', status: 'accepted', year: 2026, logos: ['springer', 'ctu', 'yzu'],
  },
  {
    id: 'legal-edge-retrieval',
    title: 'Sustainable legal information access through edge AI: a hybrid vector-hypergraph retrieval system for Vietnamese traffic law consultation',
    venue: 'ICBS 2026, UEH',
    role: 'co-author', status: 'accepted', year: 2026, logos: ['ueh'],
  },
  {
    id: 'hydrogen-thermal',
    title: 'A Multi-Modal Approach for Hydrogen Leakage Monitoring based on Thermal Vision',
    venue: 'MLCI, ACM ICPS',
    role: 'co-author', status: 'published', year: 2026, doi: '10.1145/3815970.3815978', logos: ['acm', 'iuh'],
  },
  {
    id: 'footwear-android',
    title: 'An Android-Based Edge Device for Footwear Defect Inspection Toward a Portable yet Powerful Approach',
    venue: 'MLCI, ACM ICPS',
    role: 'co-author', status: 'published', year: 2026, doi: '10.1145/3815970.3815972', logos: ['acm', 'iuh'],
  },
];
