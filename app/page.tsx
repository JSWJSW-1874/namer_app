// Marketing landing page — jonweaver.by
// Speaks directly to the CIS learner who understands English but freezes when speaking.
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-sm text-slate-500 uppercase tracking-widest mb-6">jonweaver.by</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
          You know English.
          <br />
          <span className="text-slate-400">You just freeze when it&apos;s your turn.</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto">
          The Speaking KickStart is a 28-day intensive for B1/B2 English learners from CIS countries.
          Daily recordings. Real data. The freeze goes away.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/day0"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Find your baseline — free
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Sign up
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">No credit card needed. 10 minutes.</p>
      </section>

      {/* The problem */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">The problem has a name.</h2>
          <p className="text-slate-600 leading-relaxed">
            You have studied English for years. You understand films, read articles, know the grammar.
            But when it is your turn to speak — in a meeting, on a call, with a native speaker —
            the words do not come.
          </p>
          <p className="text-slate-600 leading-relaxed">
            This is called <strong>the freeze</strong>. It is not a vocabulary gap. It is not a grammar gap.
            English grammar is still running as a conscious foreground process instead of an automatic background one.
            The course trains automaticity. That is it. That is the whole thing.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-6 space-y-10">
          <h2 className="text-2xl font-bold text-slate-900">How it works.</h2>
          <div className="space-y-8">
            {[
              {
                day: 'Day 0',
                title: 'Find your baseline.',
                desc: 'Record 60 seconds. Get your MLR score — the average number of syllables you speak between pauses. Free. Ungated. Ten minutes.',
              },
              {
                day: 'Days 1–7',
                title: 'The 3/2/1 drill.',
                desc: 'You record the same content three times under decreasing time pressure. By the third take you will hear the difference yourself. That is automaticity becoming visible.',
              },
              {
                day: 'Days 8–14',
                title: 'Clause completion.',
                desc: 'You train the habit of committing to a clause and finishing it — the neurological pattern that separates B2 speakers from B1.',
              },
              {
                day: 'Days 15–21',
                title: 'Cold opinions.',
                desc: 'Unfamiliar topics. Five seconds before you record. Your MLR will drop. That is designed. That is the hard test.',
              },
              {
                day: 'Day 28',
                title: 'The moment.',
                desc: 'You record something you genuinely care about. Listen back. For the first time: that sounds like me. In English.',
              },
            ].map((step) => (
              <div key={step.day} className="flex gap-4">
                <div className="flex-shrink-0">
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded px-2 py-0.5">
                    {step.day}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{step.title}</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">Start with your baseline.</h2>
          <p className="text-slate-400">
            Ten minutes. One recording. One number that tells you exactly where you start.
          </p>
          <Link
            href="/day0"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Find your baseline — free
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} jonweaver.by &mdash; The Speaking KickStart
        </p>
      </footer>
    </main>
  );
}
