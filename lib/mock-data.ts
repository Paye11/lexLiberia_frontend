import type {
  Category,
  FaqItem,
  Law,
  LegalUpdate,
  Opinion,
  Plan,
  Testimonial,
} from '@/types'

export const categories: Category[] = [
  {
    slug: 'constitution',
    title: 'Constitution',
    description: 'The supreme law of the Republic of Liberia and its amendments.',
    icon: 'Landmark',
    documentCount: 14,
  },
  {
    slug: 'civil-procedure',
    title: 'Civil Procedure Law',
    description: 'Rules governing civil litigation and court processes.',
    icon: 'Scale',
    documentCount: 86,
  },
  {
    slug: 'criminal-procedure',
    title: 'Criminal Procedure Law',
    description: 'Procedures for the investigation and prosecution of crimes.',
    icon: 'Gavel',
    documentCount: 74,
  },
  {
    slug: 'penal-law',
    title: 'Penal Law',
    description: 'Defines criminal offenses and their corresponding penalties.',
    icon: 'ShieldAlert',
    documentCount: 112,
  },
  {
    slug: 'judiciary-law',
    title: 'Judiciary Law',
    description: 'Organization, jurisdiction, and administration of the courts.',
    icon: 'Building2',
    documentCount: 53,
  },
  {
    slug: 'property-law',
    title: 'Property Law',
    description: 'Ownership, transfer, and rights related to real and personal property.',
    icon: 'Home',
    documentCount: 68,
  },
  {
    slug: 'labor-law',
    title: 'Labor Law',
    description: 'Employment standards, workplace rights, and labor relations.',
    icon: 'Briefcase',
    documentCount: 41,
  },
  {
    slug: 'revenue-code',
    title: 'Revenue Code',
    description: 'Taxation, duties, and government revenue administration.',
    icon: 'Receipt',
    documentCount: 97,
  },
  {
    slug: 'commercial-law',
    title: 'Commercial Law',
    description: 'Business associations, contracts, and commercial transactions.',
    icon: 'TrendingUp',
    documentCount: 79,
  },
  {
    slug: 'election-law',
    title: 'Election Law',
    description: 'Electoral processes, voter rights, and campaign regulations.',
    icon: 'Vote',
    documentCount: 23,
  },
  {
    slug: 'environmental-law',
    title: 'Environmental Law',
    description: 'Conservation, pollution control, and natural resource management.',
    icon: 'Leaf',
    documentCount: 36,
  },
  {
    slug: 'supreme-court-opinions',
    title: 'Supreme Court Opinions',
    description: 'Landmark and recent rulings from the Supreme Court of Liberia.',
    icon: 'BookMarked',
    documentCount: 1240,
  },
  {
    slug: 'regulations',
    title: 'Regulations',
    description: 'Administrative rules issued by government agencies and ministries.',
    icon: 'FileText',
    documentCount: 318,
  },
  {
    slug: 'executive-orders',
    title: 'Executive Orders',
    description: 'Directives issued by the President of Liberia.',
    icon: 'FileSignature',
    documentCount: 64,
  },
]

export const laws: Law[] = [
  {
    id: 'constitution-1986',
    title: 'Constitution of the Republic of Liberia (1986)',
    category: 'Constitution',
    categorySlug: 'constitution',
    type: 'Constitution',
    summary:
      'The fundamental law establishing the structure of government, fundamental rights, and the separation of powers in Liberia.',
    publishedDate: '1986-01-06',
    year: 1986,
    views: 48210,
    chapter: 'Chapter III — Fundamental Rights',
    sections: [
      {
        number: 'Article 11',
        heading: 'Fundamental Rights and Freedoms',
        body: 'All persons are born equally free and independent and have certain natural, inherent and inalienable rights, including the right to life, liberty, security of the person and the right to own property.',
      },
      {
        number: 'Article 20',
        heading: 'Due Process of Law',
        body: 'No person shall be deprived of life, liberty, security of the person, property, privilege or any other right except as the outcome of a hearing judgment consistent with the provisions laid down in this Constitution.',
      },
    ],
    content:
      'We the People of the Republic of Liberia, acknowledging our devotion to the cause of liberty and justice; appreciating our suffering under repressive regimes and determined to live in harmony, do hereby solemnly make, establish and publish this Constitution for the governance of the Republic of Liberia.',
  },
  {
    id: 'penal-law-cap-14',
    title: 'Penal Law — Title 26, Liberian Code of Laws Revised',
    category: 'Penal Law',
    categorySlug: 'penal-law',
    type: 'Statute',
    summary:
      'Codifies criminal offenses, classifications of crimes, defenses, and sentencing in the Republic of Liberia.',
    publishedDate: '1978-07-19',
    year: 1978,
    views: 21934,
    chapter: 'Chapter 14 — Offenses Against the Person',
    sections: [
      {
        number: 'Section 14.1',
        heading: 'Murder',
        body: 'A person is guilty of murder if he purposely or knowingly causes the death of another human being, or causes the death of another under circumstances manifesting extreme indifference to the value of human life.',
      },
    ],
    content:
      'This Title shall govern the definition, classification, and punishment of offenses committed within the territorial jurisdiction of the Republic of Liberia.',
  },
  {
    id: 'civil-procedure-title-1',
    title: 'Civil Procedure Law — Title 1, Liberian Code of Laws Revised',
    category: 'Civil Procedure Law',
    categorySlug: 'civil-procedure',
    type: 'Statute',
    summary:
      'Governs the commencement of civil actions, pleadings, motions, trials, judgments, and appeals.',
    publishedDate: '1973-02-15',
    year: 1973,
    views: 18420,
  },
  {
    id: 'revenue-code-2000',
    title: 'Liberia Revenue Code of 2000 (as amended)',
    category: 'Revenue Code',
    categorySlug: 'revenue-code',
    type: 'Statute',
    summary:
      'Establishes the framework for income tax, goods and services tax, customs duties, and revenue administration.',
    publishedDate: '2011-09-08',
    year: 2011,
    views: 30115,
  },
  {
    id: 'labor-law-2015',
    title: 'Decent Work Act of 2015',
    category: 'Labor Law',
    categorySlug: 'labor-law',
    type: 'Statute',
    summary:
      'Comprehensive labor legislation covering employment contracts, minimum wage, occupational safety, and trade unions.',
    publishedDate: '2015-06-16',
    year: 2015,
    views: 15903,
  },
  {
    id: 'executive-order-126',
    title: 'Executive Order No. 126 — Suspension of Customs Duties on Rice',
    category: 'Executive Orders',
    categorySlug: 'executive-orders',
    type: 'Executive Order',
    summary:
      'Temporarily suspends import duties on the staple commodity to stabilize market prices.',
    publishedDate: '2023-11-02',
    year: 2023,
    views: 7421,
  },
  {
    id: 'environmental-protection-2003',
    title: 'Environment Protection and Management Law of 2003',
    category: 'Environmental Law',
    categorySlug: 'environmental-law',
    type: 'Statute',
    summary:
      'Provides for the sustainable management of the environment and natural resources of Liberia.',
    publishedDate: '2003-11-26',
    year: 2003,
    views: 9210,
  },
  {
    id: 'commercial-code-title-7',
    title: 'Commercial Code — Title 7, Liberian Code of Laws Revised',
    category: 'Commercial Law',
    categorySlug: 'commercial-law',
    type: 'Statute',
    summary:
      'Regulates business associations, negotiable instruments, secured transactions, and sales of goods.',
    publishedDate: '1976-04-21',
    year: 1976,
    views: 12678,
  },
]

export const opinions: Opinion[] = [
  {
    id: 'op-2023-tubman-v-republic',
    caseName: 'Tubman v. Republic of Liberia',
    citation: 'LRSC 14 (2023)',
    justice: 'Chief Justice Sie-A-Nyene Yuoh',
    topic: 'Constitutional Law',
    year: 2023,
    date: '2023-05-18',
    summary:
      'The Court addressed the constitutionality of pre-trial detention periods exceeding statutory limits.',
    facts:
      'The appellant was held in pre-trial detention for eighteen months without indictment, exceeding the statutory limit prescribed by the Criminal Procedure Law.',
    issues:
      'Whether prolonged pre-trial detention beyond the statutory period violates the due process guarantees of Article 21 of the Constitution.',
    holding:
      'The Court held that detention beyond the statutory period without indictment violates the appellant\u2019s constitutional right to due process and ordered immediate release.',
    opinion:
      'The right to a speedy trial is not merely procedural but a substantive guarantee anchored in the dignity of the person. Where the State fails to act within the time prescribed by law, the remedy must be meaningful.',
  },
  {
    id: 'op-2022-cooper-v-cooper',
    caseName: 'Cooper v. Cooper',
    citation: 'LRSC 8 (2022)',
    justice: 'Justice Joseph N. Nagbe',
    topic: 'Property Law',
    year: 2022,
    date: '2022-08-30',
    summary:
      'Dispute over the partition of inherited tribal land and the application of customary land tenure.',
    facts:
      'The parties disputed ownership of family land governed partly by statutory deeds and partly by customary tenure.',
    issues:
      'Whether customary land tenure can override a duly registered statutory deed in cases of inheritance.',
    holding:
      'The Court held that registered statutory title prevails, but customary occupants are entitled to compensation for improvements.',
  },
  {
    id: 'op-2021-bestman-v-board',
    caseName: 'Bestman v. National Elections Commission',
    citation: 'LRSC 3 (2021)',
    justice: 'Justice Yussif D. Kaba',
    topic: 'Election Law',
    year: 2021,
    date: '2021-02-11',
    summary:
      'Challenge to the certification of legislative election results on grounds of procedural irregularity.',
    facts:
      'The petitioner alleged irregularities in the tallying of votes in a senatorial by-election.',
    issues:
      'Whether procedural irregularities materially affected the outcome of the election.',
    holding:
      'The Court found that the irregularities did not affect the outcome and upheld the certification.',
  },
  {
    id: 'op-2020-republic-v-kollie',
    caseName: 'Republic of Liberia v. Kollie',
    citation: 'LRSC 21 (2020)',
    justice: 'Chief Justice Francis S. Korkpor',
    topic: 'Criminal Law',
    year: 2020,
    date: '2020-12-04',
    summary:
      'Appeal concerning the admissibility of a confession obtained without counsel present.',
    facts:
      'The defendant\u2019s confession was admitted at trial despite his request for legal representation.',
    issues:
      'Whether a confession obtained in the absence of requested counsel is admissible.',
    holding:
      'The Court held the confession inadmissible and remanded the case for a new trial.',
  },
]

export const legalUpdates: LegalUpdate[] = [
  {
    id: 'update-1',
    title: 'New Land Rights Regulations Take Effect Nationwide',
    category: 'Property Law',
    publishedDate: '2026-06-12',
    description:
      'The Liberia Land Authority publishes implementing regulations for the Land Rights Act, clarifying community land registration.',
  },
  {
    id: 'update-2',
    title: 'Supreme Court Issues Landmark Ruling on Digital Evidence',
    category: 'Criminal Procedure',
    publishedDate: '2026-05-28',
    description:
      'The Court establishes a framework for the admissibility of electronic and digital evidence in criminal proceedings.',
  },
  {
    id: 'update-3',
    title: 'Amendments to the Revenue Code Signed into Law',
    category: 'Revenue Code',
    publishedDate: '2026-05-09',
    description:
      'The Legislature passes amendments adjusting goods and services tax thresholds for small businesses.',
  },
  {
    id: 'update-4',
    title: 'Executive Order Establishes Anti-Corruption Task Force',
    category: 'Executive Orders',
    publishedDate: '2026-04-21',
    description:
      'A new executive order creates an inter-agency task force to investigate public sector corruption.',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Bill P. Alex',
    role: 'Clerk',
    institution: 'Nimba County',
    quote:
      'The strength of the law is measured not by the severity of its punishment, but by the confidence it gives every person that justice will be heard before judgment is passed',
  },
  {
    id: 't2',
    name: 'Her Honor Serena F. Garlawolu',
    role: 'Resident Judge',
    institution: 'Criminal Court "E", Montserrado County, Liberia',
    quote:
      'A nation prospers when its laws are easy to find, understood by its people, and applied equally by its courts; hidden laws serve power, but accessible laws serve justice.',
  },
]

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For curious citizens exploring Liberian law.',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      'Browse public laws & the Constitution',
      'Basic keyword search',
      '2 document views per day',
      'Community support',
    ],
  },
  {
    id: 'student',
    name: 'Student',
    description: 'For law students and academic researchers.',
    priceMonthly: 5,
    priceAnnual: Math.round(5 * 12 * 0.95),
    features: [
      'Everything in Free',
      'Unlimited document views',
      'Supreme Court opinions access',
      'Bookmarks & downloads',
      '50 AI research queries / month',
    ],
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    description: 'For practicing attorneys and firms.',
    priceMonthly: 25,
    priceAnnual: Math.round(25 * 12 * 0.95),
    recommended: true,
    features: [
      'Everything in Student',
      'Advanced filters & citations',
      'Unlimited AI legal research',
      'Related cases & cross-references',
      'PDF export & print',
      'Priority support',
    ],
  },
  {
    id: 'court',
    name: 'Court',
    description: 'For courts, ministries, and institutions.',
    priceMonthly: 35,
    priceAnnual: Math.round(35 * 12 * 0.95),
    features: [
      'Everything in Lawyer',
      'Multi-seat institutional access',
      'Internal annotations & sharing',
      'Dedicated account manager',
      'Custom onboarding & training',
    ],
  },
]

export const faqs: FaqItem[] = [
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes. You can cancel from your account settings at any time, and you will retain access until the end of your billing period.',
  },
  {
    question: 'Is the legal content official and up to date?',
    answer:
      'Our library is compiled from official gazettes, the Liberian Code of Laws Revised, and Supreme Court records, and is updated regularly as new materials are published.',
  },
  {
    question: 'How accurate is the AI legal research assistant?',
    answer:
      'The assistant uses retrieval-augmented generation grounded in our verified legal library and always cites primary sources so you can verify every answer.',
  },
  {
    question: 'Do you offer discounts for institutions?',
    answer:
      'Yes. We offer volume and institutional pricing for courts, ministries, universities, and law firms. Contact our team for a custom quote.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit and debit cards, mobile money, and bank transfers for institutional accounts.',
  },
]
