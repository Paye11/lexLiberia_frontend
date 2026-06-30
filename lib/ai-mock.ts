import type { ChatCitation } from '@/types'

interface MockAnswer {
  content: string
  citations: ChatCitation[]
  webSearchUsed?: boolean
  webSources?: { title: string; url: string }[]
}

/**
 * Generates a deterministic, demo-quality answer for the AI research UI.
 *
 * Replace this with a real call to your backend / the Vercel AI SDK by
 * swapping the implementation here and streaming the response into the chat
 * component.
 */
export function generateMockAnswer(question: string): MockAnswer {
  const q = question.toLowerCase()

  // Always simulate web search for Liberia-related queries
  const webSources = [
    { title: 'Liberia Ministry of Justice', url: 'https://www.moj.gov.lr' },
    { title: 'Supreme Court of Liberia', url: 'https://www.supremecourt.gov.lr' },
    { title: 'Liberia Legal Information Institute', url: 'https://www.liberlii.org' }
  ]

  if (q.includes('divorce') || q.includes('marriage')) {
    return {
      content:
        'Under Liberian domestic relations law, the recognized grounds for divorce include adultery, desertion for a continuous period, and incompatibility of temperament where reconciliation is not reasonably possible. A petition is filed in the Circuit Court with jurisdiction over the parties, and the court may address custody, alimony, and the division of marital property. Note that customary marriages may be treated differently from statutory marriages, and the applicable procedure depends on how the marriage was contracted.\n\n**Legal Opinion/Recommendation:** Based on the facts, the best approach would be to file a divorce petition in the appropriate Circuit Court, supported by evidence of the alleged grounds. Consider mediation first as an alternative dispute resolution mechanism as encouraged by Liberian law.',
      citations: [
        {
          title: 'Domestic Relations Law',
          citation: 'Title 9, Liberian Code of Laws Revised',
          href: '/laws/civil-procedure-title-1',
        },
        {
          title: 'Cooper v. Cooper',
          citation: '[2022] LRSC 14',
          href: '/opinions/op-2022-cooper-v-cooper',
        },
      ],
      webSearchUsed: true,
      webSources
    }
  }

  if (q.includes('theft') || q.includes('penal') || q.includes('crime')) {
    return {
      content:
        'The Penal Law classifies theft according to the value of the property taken and the circumstances of the offense. Petty theft is generally treated as a misdemeanor, while grand theft and theft involving force or a weapon are felonies carrying longer terms of imprisonment. Sentencing also considers aggravating factors such as breach of trust. Prosecutors must prove the unlawful taking and the intent to permanently deprive the owner of the property.\n\n**Citation Example in Judgment:** "The defendant is found guilty of theft contrary to Section 15.1 of the Penal Law, Title 26 of the Liberian Code of Laws Revised, and is hereby sentenced to imprisonment for a term of 2 years."',
      citations: [
        {
          title: 'Penal Law',
          citation: 'Title 26, Chapter 15, Liberian Code of Laws Revised',
          href: '/laws/penal-law-cap-14',
        },
        {
          title: 'Republic v. Kollie',
          citation: '[2020] LRSC 7',
          href: '/opinions/op-2020-republic-v-kollie',
        },
      ],
      webSearchUsed: true,
      webSources
    }
  }

  if (q.includes('constitution') || q.includes('rights')) {
    return {
      content:
        'The 1986 Constitution of Liberia guarantees a broad set of fundamental rights in Chapter III, including the right to life, liberty, and security of the person; freedom of expression, assembly, and religion; equal protection under the law; and due process. These rights are enforceable against the State, and the Supreme Court has the power of judicial review to strike down legislation or executive action that violates them. Certain rights may be limited only as expressly permitted by the Constitution itself.\n\n**Legal Judgment Format:** This Court holds that the petitioner\'s right to due process under Article 20 of the Constitution was violated. Pursuant to Article 21 of the Constitution, the petitioner is entitled to immediate release and compensation.',
      citations: [
        {
          title: 'Constitution of the Republic of Liberia',
          citation: 'Chapter III, 1986',
          href: '/laws/constitution-1986',
        },
        {
          title: 'Tubman v. Republic',
          citation: '[2023] LRSC 3',
          href: '/opinions/op-2023-tubman-v-republic',
        },
      ],
      webSearchUsed: true,
      webSources
    }
  }

  if (q.includes('contract') || q.includes('commercial') || q.includes('business')) {
    return {
      content:
        'Commercial contracts in Liberia are governed by the Commercial Code together with general principles of contract law. A valid contract requires offer, acceptance, consideration, and the intention to create legal relations. Enforcement actions are brought in the Commercial Court, which can award damages, specific performance, or other equitable relief. Parties frequently include arbitration clauses, and Liberian courts will generally give effect to a valid agreement to arbitrate.\n\n**Citation for Contract Dispute:** "The contract was validly formed in accordance with Title 7 of the Liberian Code of Laws Revised. The defendant is in breach and shall pay damages in the amount of $10,000 Liberian Dollars plus costs."',
      citations: [
        {
          title: 'Commercial Code',
          citation: 'Title 7, Liberian Code of Laws Revised',
          href: '/laws/commercial-code-title-7',
        },
        {
          title: 'Bestman v. National Investment Board',
          citation: '[2021] LRSC 11',
          href: '/opinions/op-2021-bestman-v-board',
        },
      ],
      webSearchUsed: true,
      webSources
    }
  }

  return {
    content:
      'Based on the available Liberian statutes, Supreme Court opinions, and my search of legal resources on the web, the answer depends on the specific facts of your situation. In general, you should identify the governing statute, review how the Supreme Court has interpreted it, and consider any subsidiary regulations that apply. I have linked the most relevant primary sources below so you can review the exact language. For a definitive position, consult a licensed Liberian attorney.',
    citations: [
      {
        title: 'Constitution of the Republic of Liberia',
        citation: '1986',
        href: '/laws/constitution-1986',
      },
      {
        title: 'Liberian Code of Laws Revised',
        citation: 'General provisions',
        href: '/laws',
      },
    ],
    webSearchUsed: true,
    webSources
  }
}
