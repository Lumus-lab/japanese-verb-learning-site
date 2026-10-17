import {
  CLASSIFICATION_STEPS,
  FORM_RULE_EXAMPLES,
  GODAN_CHANGE_ROWS,
  GROUP_RULES,
  GUIDE_SECTIONS,
  ICHIDAN_CHANGE_ROWS,
  IRREGULAR_CHANGE_ROWS,
  TE_TA_RULES,
} from '../data/guideSections'
import { VERBS } from '../data/verbs'

export function GuidePage() {
  const exceptionVerbs = VERBS.filter((verb) => verb.isException)

  return (
    <>
      <header className="page-heading">
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
        <h2>判斷動詞分類的步驟</h2>
        <ol className="step-list">
          {CLASSIFICATION_STEPS.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
              <small>{step.example}</small>
            </li>
          ))}
        </ol>
      </section>
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
        <h2>五段動詞變化表</h2>
        <p>五段動詞先看辭書形最後一個假名，再把字尾換到需要的段。</p>
        <p className="table-scroll-hint">左右捲動表格，查看完整內容。</p>
        <div className="guide-table-wrapper" tabIndex={0} role="region" aria-label="可左右捲動的動詞變化表">
          <table className="guide-table">
            <thead>
              <tr>
                <th>字尾</th>
                <th>あ段</th>
                <th>い段</th>
                <th>え段</th>
                <th>お段</th>
                <th>て形</th>
                <th>た形</th>
                <th>例子</th>
              </tr>
            </thead>
            <tbody>
              {GODAN_CHANGE_ROWS.map((row) => (
                <tr key={row.tail}>
                  <th>{row.tail}</th>
                  <td>{row.a}</td>
                  <td>{row.i}</td>
                  <td>{row.e}</td>
                  <td>{row.o}</td>
                  <td>{row.te}</td>
                  <td>{row.ta}</td>
                  <td>{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="guide-card">
        <h2>一段動詞變化表</h2>
        <p>一段動詞的核心動作是去掉最後的「る」。</p>
        <p className="table-scroll-hint">左右捲動表格，查看完整內容。</p>
        <div className="guide-table-wrapper" tabIndex={0} role="region" aria-label="可左右捲動的動詞變化表">
          <table className="guide-table">
            <thead>
              <tr>
                <th>形式</th>
                <th>公式</th>
                <th>例子</th>
              </tr>
            </thead>
            <tbody>
              {ICHIDAN_CHANGE_ROWS.map((row) => (
                <tr key={row.form}>
                  <th>{row.form}</th>
                  <td>{row.rule}</td>
                  <td>{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="guide-card">
        <h2>不規則動詞變化表</h2>
        <p>する與来る的讀音會跟著形式改變，初學時建議整組記。</p>
        <p className="table-scroll-hint">左右捲動表格，查看完整內容。</p>
        <div className="guide-table-wrapper" tabIndex={0} role="region" aria-label="可左右捲動的動詞變化表">
          <table className="guide-table">
            <thead>
              <tr>
                <th>形式</th>
                <th>する</th>
                <th>来る</th>
              </tr>
            </thead>
            <tbody>
              {IRREGULAR_CHANGE_ROWS.map((row) => (
                <tr key={row.form}>
                  <th>{row.form}</th>
                  <td>{row.suru}</td>
                  <td>{row.kuru}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <h2>每一種形態的公式與例句</h2>
        <p className="table-scroll-hint">左右捲動表格，查看完整內容。</p>
        <div className="guide-table-wrapper" tabIndex={0} role="region" aria-label="可左右捲動的動詞變化表">
          <table className="guide-table">
            <thead>
              <tr>
                <th>形式</th>
                <th>五段動詞</th>
                <th>一段動詞</th>
                <th>不規則動詞</th>
              </tr>
            </thead>
            <tbody>
              {FORM_RULE_EXAMPLES.map((row) => (
                <tr key={row.form}>
                  <th>{row.form}</th>
                  <td>{row.godan}</td>
                  <td>{row.ichidan}</td>
                  <td>{row.irregular}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="guide-card" id="common-exceptions" aria-labelledby="common-exceptions-title">
        <h2 id="common-exceptions-title">常見例外與特殊變化</h2>
        <p>以下動詞容易誤判分類，或有需要特別記憶的變化。</p>
        <ul className="exception-list">
          {exceptionVerbs.map((verb) => (
            <li key={verb.id}>
              <strong lang="ja">
                {verb.dictionaryForm}（{verb.reading}）
              </strong>
              ：{verb.meanings.join('、')}。{verb.notes.join('')}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
