export const SOURCE_REFS = {
  "irodori-about": {
    label: "IRODORI: Japanese for Life in Japan",
    url: "https://www.irodori.jpf.go.jp/en/about.html",
  },
  "marugoto-a1": {
    label: "Marugoto Starter (A1) Rikai vocabulary index",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/starter_c/",
  },
  "marugoto-a2-1": {
    label: "Marugoto Elementary 1 (A2) Rikai vocabulary index",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/elementary1_c/",
  },
  "marugoto-a2-2": {
    label: "Marugoto Elementary 2 (A2) Rikai vocabulary index",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/elementary2_c/",
  },
  bccwj: {
    label: "NINJAL BCCWJ Word List",
    url: "https://clrd.ninjal.ac.jp/bccwj/en/freq-list.html",
  },
  "jlpt-guide": {
    label: "JLPT N1-N5 level summary",
    url: "https://www.jlpt.jp/tw/about/levelsummary.html",
  },
  "jpf-conjugation": {
    label: "The Japan Foundation: 動詞の活用 (1)",
    url: "https://www.kyozai.jpf.go.jp/kyozai/material/BTS00014/ja/render.do",
  },
  "jpf-te-form": {
    label: "The Japan Foundation: て形與常見例外",
    url: "https://ba.jpf.go.jp/wp-content/uploads/2022/03/Akiko3_bunpoo382002.pdf",
  },
  "jpf-honorific": {
    label: "The Japan Foundation: 尊敬の意味を持つ動詞",
    url: "https://www.kyozai.jpf.go.jp/kyozai/material/BMA00088/ja/render.do",
  },
  jmdict: {
    label: "EDRDG JMdictDB part-of-speech tags",
    url: "https://www.edrdg.org/jmwsgi/edhelp.py?svc=jmdict",
  },
} as const;

export type SourceRefId = keyof typeof SOURCE_REFS;
