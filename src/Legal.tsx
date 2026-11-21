import { useEffect } from 'react'

// Set the operator's registered details and approved cancellation window before taking payments.
const business = '[LEGAL BUSINESS NAME]'
const address = '[REGISTERED ADDRESS]'
const email = '[CONTACT EMAIL]'
const refundWindow = '[REFUND WINDOW DAYS]'

type Policy = {
  title: string
  intro: string
  sections: [string, string][]
}

const policies: Record<string, Policy> = {
  '/terms': {
    title: 'Terms & Conditions',
    intro: `These terms govern enrolment in Amrit Astro Technical courses and webinars offered by ${business}, whose registered address is ${address}.`,
    sections: [
      ['Enrolment', 'You must be at least 18 to place an order. Provide current contact details so we can identify your payment and contact you about access. Review the duration, topics, quantity and total before paying.'],
      ['Prices and payment', 'Checkout shows the price in Indian rupees, applicable GST and any convenience fee. Razorpay handles live payments. Keep your order and payment references for access queries. A simulated payment creates a demonstration receipt and does not enrol a learner.'],
      ['Learning materials and access', 'Use course materials for your own learning. Please ask for written permission before distributing recordings, publishing lesson materials or sharing access with others. Contact us about schedules, access arrangements or accessibility needs before enrolling.'],
      ['Participation', 'Treat fellow learners respectfully, protect their personal information and obtain consent before recording a session. The course description sets out the learning offered. A completion certificate reflects participation in the programme.'],
      ['Cancellations and disputes', 'The Refund & Cancellation Policy explains how to request a cancellation or report a payment issue. Contact us first so we can investigate using your order reference. Applicable consumer protections and remedies in India continue to apply.'],
      ['Questions', `Write to ${email} or reach Amrit Astro Technical on WhatsApp at +91 82290 17643. Send written correspondence to ${address}.`],
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    intro: `${business} operates Amrit Astro Technical from ${address}. This notice explains the information used when you browse, enquire or enrol, and how to contact us about it.`,
    sections: [
      ['Information and purpose', 'Checkout asks for your name, email, phone and city. We use enrolment details and transaction references to process payment, respond to access questions, communicate about your course and handle refunds. When you send an enquiry, we use the contact details and message you choose to provide to answer it.'],
      ['Your browser', 'The cart uses browser storage to remember selected products and quantities. Your browser may also hold a receipt for the current visit. You can clear this information through your browser’s site-data settings. This application includes no advertising or analytics trackers.'],
      ['Service providers', 'During live checkout, Razorpay receives order and contact information to process your payment. Enter payment credentials only in the payment provider’s checkout. Opening WhatsApp or Google Forms takes you to that provider, whose privacy notice governs its service. Hosting providers may process technical request data to deliver the site.'],
      ['Retention and security', 'We retain enquiry information while responding and transaction records for fulfilment, disputes and legally required accounting periods. We restrict access to people and providers involved in those tasks and delete or anonymise records when their purpose and required retention periods end.'],
      ['Choices and requests', `Contact ${email} to request access, correction, completion, updating or erasure of your information, to withdraw consent, or to nominate someone to exercise applicable rights. Include enough information to identify your enquiry or order. We may ask for proportionate identity verification before responding. Withdrawal may affect services that need that information. Legal retention duties may still apply.`],
      ['Privacy grievances', `Send a privacy grievance to ${email} or write to ${address}. Describe the issue and the resolution you seek. We will respond within the applicable statutory period. After using our grievance process, you may approach the Data Protection Board of India where the applicable provisions of the Digital Personal Data Protection Act, 2023 provide that remedy.`],
      ['Children', 'Checkout is for adults aged 18 and above. If a child has submitted personal information, a parent or guardian can contact us to request review and removal, subject to applicable legal requirements.'],
    ],
  },
  '/refund-policy': {
    title: 'Refund & Cancellation Policy',
    intro: 'If a course is cancelled, a payment appears twice or you wish to withdraw, contact us with the order reference so we can locate the transaction.',
    sections: [
      ['Learner cancellations', `Submit your cancellation request within ${refundWindow} days of purchase. Include the programme name, order ID, payment ID and purchase date. We will review the request against the terms communicated at purchase, taking into account sessions delivered and materials accessed.`],
      ['Provider cancellations', 'If we cancel a paid programme before it starts, you may choose a refund or an alternative date if one is available. For an interrupted programme, we will explain the options for the undelivered part and confirm your preference.'],
      ['Duplicate or incomplete payments', 'If money leaves your account without a confirmed order, contact us before paying again. We will reconcile the transaction with the payment provider and confirm its status. We will arrange a return of any confirmed duplicate charge.'],
      ['Receiving a refund', 'We will communicate the decision and its basis using your order contact details. Approved refunds go back to the original payment method. Bank processing times vary. Ask us for the refund reference if you need to trace it. Simulated orders involve no transfer of money.'],
      ['Requests and follow-up', `Email ${email} or contact +91 82290 17643 on WhatsApp. Provide transaction references only. Keep PINs, passwords, complete card numbers and one-time codes private. This policy preserves applicable statutory consumer rights.`],
    ],
  },
  '/disclaimer': {
    title: 'Disclaimer',
    intro: 'Our programmes support financial education, self-development and general well-being. Consider your personal circumstances when applying ideas from a class.',
    sections: [
      ['Financial education', 'Market examples, chart exercises and discussions illustrate concepts. They do not provide personalised investment advice, research reports, recommendations, buy or sell calls, or trading signals. Investing in securities involves risk, including loss of capital. No returns are promised. Seek advice from a suitably registered professional for individual investment decisions.'],
      ['Health and well-being', 'Lifestyle and stress-awareness activities are educational. Consult a licensed healthcare professional about symptoms, health conditions or changes to medical care. Face Yoga and Age Is Just a Number focus on daily routines. General well-being and confidence; not medical or cosmetic treatment.'],
      ['Traditional practices', 'Astrology, Vastu, palmistry and Swar Vigyan are discussed in their cultural context. Traditional knowledge for self-reflection; not scientific or medical advice; no guaranteed outcomes.'],
      ['Course outcomes', 'Individual learning experiences vary with participation, background and practice. Course completion does not guarantee employment, financial performance or a particular wellness outcome.'],
      ['Contact', `For questions about a course or these disclosures, write to ${business} at ${email}, ${address}.`],
    ],
  },
}

export default function Legal() {
  const path = window.location.pathname.replace(/\/$/, '')
  const policy = policies[path] ?? policies['/terms']
  useEffect(() => {
    document.title = `${policy.title} | Amrit Astro Technical`
  }, [policy])
  return (
    <article aria-labelledby="policy-heading" style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(4rem, 7vw, 7rem) 1.5rem' }}>
      <a href="/" style={{ color: '#e6be7a' }}>← Back to home</a>
      <h1 id="policy-heading" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.7rem)', lineHeight: 1.05, margin: '2.2rem 0 1rem' }}>{policy.title}</h1>
      <p style={{ color: '#ded8cc', fontSize: '1.1rem', lineHeight: 1.75 }}>{policy.intro}</p>
      {policy.sections.map(([heading, body]) => (
        <section key={heading} style={{ padding: '1.6rem 0', borderBottom: '1px solid #383749' }}>
          <h2 style={{ color: '#e6be7a', fontSize: '1.6rem', margin: '0 0 .6rem' }}>{heading}</h2>
          <p style={{ color: '#d3d1cc', lineHeight: 1.8, margin: 0 }}>{body}</p>
        </section>
      ))}
      <nav aria-label="Other policies" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginTop: '2rem', color: '#e6be7a' }}>
        {Object.entries(policies).filter(([url]) => url !== path).map(([url, item]) => <a key={url} href={url}>{item.title}</a>)}
      </nav>
    </article>
  )
}
