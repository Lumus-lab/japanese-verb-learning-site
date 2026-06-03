import { FORM_DEFINITIONS } from '../data/forms'
import { GROUP_RULES, GUIDE_SECTIONS, TE_TA_RULES } from '../data/guideSections'

export function GuidePage() {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">GUIDE</p>
        <h1>規則整理</h1>
        <p>先掌握可靠的骨架，再用動詞字典核對例外。</p>
      </header>
      <div className="guide-stack">
        {GUIDE_SECTIONS.map((section) => (
          <section className="guide-card" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      <section className="guide-card">
        <h2>三類動詞公式</h2>
        {GROUP_RULES.map((rule) => (
          <article key={rule.title}>
            <h3>{rule.title}</h3>
            <p>{rule.body}</p>
          </article>
        ))}
      </section>
      <section className="guide-card">
        <h2>て形與た形對照表</h2>
        {TE_TA_RULES.map((rule) => (
          <p key={rule.tails}>
            <strong>{rule.tails}</strong>：{rule.te}／{rule.ta}，
            {rule.example}
          </p>
        ))}
        <p className="warning">重要例外：行く → 行って／行った。</p>
      </section>
      <section className="guide-card">
        <h2>14 種形式一覽</h2>
        {FORM_DEFINITIONS.map((form) => (
          <p key={form.id}>
            <strong>{form.label}</strong>：{form.description}
          </p>
        ))}
      </section>
    </>
  )
}
