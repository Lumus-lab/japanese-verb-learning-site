import React, { useState, useEffect } from 'react';
import { BookOpen, Beaker, GitBranch, CheckCircle, ArrowRight, Activity, AlertTriangle, RotateCcw, Check, X, ChevronRight } from 'lucide-react';

// ==========================================
// 核心資料庫與演算法 (The Brain)
// ==========================================

// 動詞分類與變形規則引擎
const conjugator = {
  // 第一類：五段動詞 (Godan) - 語尾切換
  group1: {
    name: '第一類 (五段)',
    rules: {
      'う': { a: 'わ', i: 'い', u: 'う', e: 'え', o: 'お', te: 'って', ta: 'った', type: '促音便' },
      'く': { a: 'か', i: 'き', u: 'く', e: 'け', o: 'こ', te: 'いて', ta: 'いた', type: 'イ音便' },
      'ぐ': { a: 'が', i: 'ぎ', u: 'ぐ', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ', type: 'イ音便' },
      'す': { a: 'さ', i: 'し', u: 'す', e: 'せ', o: 'そ', te: 'して', ta: 'した', type: '無音便' },
      'つ': { a: 'た', i: 'ち', u: 'つ', e: 'て', o: 'と', te: 'って', ta: 'った', type: '促音便' },
      'ぬ': { a: 'な', i: 'に', u: 'ぬ', e: 'ね', o: 'の', te: 'んで', ta: 'んだ', type: '撥音便' },
      'ぶ': { a: 'ば', i: 'び', u: 'ぶ', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ', type: '撥音便' },
      'む': { a: 'ま', i: 'み', u: 'む', e: 'め', o: 'も', te: 'んで', ta: 'んだ', type: '撥音便' },
      'る': { a: 'ら', i: 'り', u: 'る', e: 'れ', o: 'ろ', te: 'って', ta: 'った', type: '促音便' },
    }
  },
  // 第二類：上一段/下一段動詞 (Ichidan) - 拔除「る」接後綴
  group2: {
    name: '第二類 (一段)',
    rules: {
      all: { a: '', i: '', u: 'る', e: 'れ', o: 'よう', te: 'て', ta: 'た' }
    }
  },
  // 第三類：不規則動詞 (Irregular) - 僅有兩個，需個別記憶
  group3: {
    name: '第三類 (不規則)',
    rules: {
      'する': { a: 'し', i: 'し', u: 'する', e: 'すれ', o: 'しよう', te: 'して', ta: 'した' },
      'くる': { a: 'こ', i: 'き', u: 'くる', e: 'くれ', o: 'こよう', te: 'きて', ta: 'きた' }
    }
  }
};

// 接續型態與後綴定義
const formTypes = [
  { id: 'nai', slot: 'a', suffix: 'ない', name: '否定形', desc: '不做某事', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'masu', slot: 'i', suffix: 'ます', name: '丁寧形', desc: '禮貌語氣', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'dict', slot: 'u', suffix: '', name: '辭書形', desc: '字典上的原形', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'ba', slot: 'e', suffix: 'ば', name: '條件形', desc: '如果...', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'vol', slot: 'o', suffix: 'う', name: '意向形', desc: '我們...吧', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'te', slot: 'te', suffix: '', name: 'て形', desc: '接續、請求', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
];

// 大容量實例題庫 (包含三大類與常見例外)
const verbBank = [
  // Group 1
  { kanji: '書', tail: 'く', reading: 'か', group: 1, meaning: '寫 (Write)' },
  { kanji: '買', tail: 'う', reading: 'か', group: 1, meaning: '買 (Buy)' },
  { kanji: '話', tail: 'す', reading: 'はな', group: 1, meaning: '說 (Speak)' },
  { kanji: '待', tail: 'つ', reading: 'ま', group: 1, meaning: '等 (Wait)' },
  { kanji: '飲', tail: 'む', reading: 'の', group: 1, meaning: '喝 (Drink)' },
  { kanji: '遊', tail: 'ぶ', reading: 'あそ', group: 1, meaning: '玩 (Play)' },
  { kanji: '死', tail: 'ぬ', reading: 'し', group: 1, meaning: '死 (Die)' },
  { kanji: '作', tail: 'る', reading: 'つく', group: 1, meaning: '做 (Make)', hint: 'る前面是 u 段的 ku，所以是第一類' },
  { kanji: '帰', tail: 'る', reading: 'かえ', group: 1, meaning: '回家 (Return)', exception: true, hint: '⚠️例外！る前面是 e 段，但它是第一類！' },
  { kanji: '行', tail: 'く', reading: 'い', group: 1, meaning: '去 (Go)', te_exception: true, hint: '⚠️て形例外！行く變成行って' },
  
  // Group 2
  { kanji: '食', tail: 'べる', reading: 'た', group: 2, meaning: '吃 (Eat)' },
  { kanji: '見', tail: 'る', reading: 'み', group: 2, meaning: '看 (See)' },
  { kanji: '起', tail: 'きる', reading: 'お', group: 2, meaning: '起床 (Wake up)' },
  { kanji: '寝', tail: 'る', reading: 'ね', group: 2, meaning: '睡覺 (Sleep)' },
  { kanji: '教', tail: 'える', reading: 'おし', group: 2, meaning: '教導 (Teach)' },

  // Group 3
  { kanji: '勉', tail: '強する', reading: 'べんきょう', group: 3, meaning: '讀書 (Study)' },
  { kanji: '来', tail: 'る', reading: 'く', group: 3, meaning: '來 (Come)' },
];

// ==========================================
// 主應用程式元件
// ==========================================
export default function VerbMasterLab() {
  const [activeTab, setActiveTab] = useState('triage');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200">
      <header className="bg-slate-900 text-white p-6 shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight">
              <Activity className="text-indigo-400" size={32} />
              日文動詞全解析系統
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">從分類診斷到變形演算的世界級標準教科書</p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs font-mono text-indigo-300">
            System.Version 2.0 // Godan + Ichidan + Irregular
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex overflow-x-auto hide-scrollbar">
          {[
            { id: 'triage', icon: GitBranch, label: '第一步：分類診斷' },
            { id: 'reactor', icon: Beaker, label: '第二步：變形反應爐' },
            { id: 'teform', icon: AlertTriangle, label: '第三步：て形特診' },
            { id: 'exam', icon: CheckCircle, label: '最終驗證' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none flex items-center justify-center gap-2 py-4 px-6 border-b-4 transition-all whitespace-nowrap font-bold ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-indigo-500'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === 'triage' && <TriageSection />}
        {activeTab === 'reactor' && <ReactorSection />}
        {activeTab === 'teform' && <TeFormSection />}
        {activeTab === 'exam' && <ExamSection />}
      </main>
    </div>
  );
}

// ==========================================
// 分頁 1: 分類診斷 (Triage)
// ==========================================
function TriageSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-indigo-500 pl-4">
          動詞的檢傷分類 (Triage)
        </h2>
        <p className="text-slate-600 leading-relaxed mb-8 text-lg">
          遇到任何一個日文動詞，你的大腦必須在 0.5 秒內完成以下流程圖的判斷。
          只要分類正確，變形就絕對不會出錯。這就像醫學上的鑑別診斷，我們從最明顯的特徵開始排除。
        </p>

        {/* 診斷流程圖 */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 relative">
          <div className="flex flex-col items-center gap-6">
            
            {/* Step 1 */}
            <LogicNode title="1. 檢查字尾是否為「る」(ru)？" />
            
            <div className="flex w-full max-w-2xl justify-between relative px-8">
              <PathLabel text="不是 る" align="left" />
              <PathLabel text="是 る" align="right" />
            </div>

            <div className="flex w-full max-w-3xl justify-between gap-4">
              <ResultCard group="1" name="第一類動詞" desc="字尾為 う,く,ぐ,す,つ,ぬ,ぶ,む" bg="bg-blue-100" border="border-blue-300" text="text-blue-800" />
              <div className="flex flex-col items-center gap-6 flex-1">
                {/* Step 2 */}
                <LogicNode title="2. 檢查「る」前面的發音段落" />
                
                <div className="flex w-full justify-between relative px-4">
                  <PathLabel text="a, u, o 段" align="left" />
                  <PathLabel text="i, e 段" align="right" />
                </div>

                <div className="flex w-full gap-4">
                   <ResultCard group="1" name="第一類動詞" desc="例如：終わる (owa-ru)" bg="bg-blue-100" border="border-blue-300" text="text-blue-800" />
                   <div className="flex flex-col items-center gap-6 flex-1">
                      {/* Step 3 */}
                      <ResultCard group="2" name="第二類動詞" desc="例如：食べる (tabe-ru) / 見る (mi-ru)" bg="bg-emerald-100" border="border-emerald-300" text="text-emerald-800" badge="90% 的情況" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 特例區 */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
            <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
              <AlertTriangle size={18} /> 第三類 (不規則動詞)
            </h3>
            <p className="text-amber-700 text-sm mb-2">完全跳脫規則，只有兩個本體，必須直接記憶。</p>
            <ul className="list-disc list-inside text-amber-900 font-medium">
              <li>来る (くる) - 來</li>
              <li>する (suru) - 做</li>
              <li className="text-xs mt-1 text-amber-700 opacity-80">包含所有名詞+する，如：勉強する、結婚する</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
              <Activity size={18} /> 偽裝成第二類的「第一類動詞」
            </h3>
            <p className="text-red-700 text-sm mb-2">長得像第二類 (る前面是 i/e 段)，但骨子裡是第一類。</p>
            <div className="flex flex-wrap gap-2">
              {['帰る (回家)', '入る (進入)', '切る (切)', '知る (知道)', '走る (跑)'].map(w => (
                <span key={w} className="bg-white px-3 py-1 rounded shadow-sm text-sm font-bold text-red-700 border border-red-100">{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogicNode({ title }) {
  return (
    <div className="bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-md z-10 text-center">
      {title}
    </div>
  );
}

function PathLabel({ text, align }) {
  return (
    <div className={`text-sm font-bold text-slate-500 absolute top-[-10px] ${align === 'left' ? 'left-0' : 'right-0'}`}>
      {align === 'left' && '↙ '}
      {text}
      {align === 'right' && ' ↘'}
    </div>
  );
}

function ResultCard({ group, name, desc, bg, border, text, badge }) {
  return (
    <div className={`${bg} ${border} ${text} border-2 rounded-xl p-4 flex-1 text-center shadow-sm relative flex flex-col justify-center`}>
      {badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap">{badge}</span>}
      <div className="text-2xl font-black mb-1 opacity-20 absolute top-2 right-2">G{group}</div>
      <div className="font-bold text-lg">{name}</div>
      <div className="text-xs opacity-80 mt-1">{desc}</div>
    </div>
  );
}

// ==========================================
// 分頁 2: 變形反應爐 (Reactor)
// ==========================================
function ReactorSection() {
  const [selectedVerb, setSelectedVerb] = useState(verbBank[0]);
  const [activeForm, setActiveForm] = useState(formTypes[2]); // Default to Dict form

  // 取得變形結果邏輯
  const getConjugation = (verb, form) => {
    if (verb.group === 1) {
      if (verb.kanji === '行' && form.slot === 'te') return { stem: '行', suffix: 'って' };
      if (verb.tail === 'う' && form.slot === 'a') return { stem: verb.kanji, suffix: 'わ' + form.suffix };
      const changedTail = conjugator.group1.rules[verb.tail][form.slot];
      return { stem: verb.kanji, suffix: changedTail + form.suffix };
    } 
    else if (verb.group === 2) {
      // 拔掉る
      const stem = verb.kanji + verb.tail.replace('る', '');
      return { stem: stem, suffix: conjugator.group2.rules.all[form.slot] + form.suffix };
    } 
    else if (verb.group === 3) {
      if (verb.kanji === '来') {
        const rules = conjugator.group3.rules['くる'];
        const changed = rules[form.slot];
        // くる比較特別，漢字發音會變
        const readings = { a: 'こ', i: 'き', u: 'く', e: 'くれ', o: 'こ', te: 'き' };
        return { stem: '来', suffix: changed.replace(readings[form.slot], '') + form.suffix, specialReading: readings[form.slot] };
      } else {
        // する 或 勉強する
        const stemKanji = verb.kanji;
        const changed = conjugator.group3.rules['する'][form.slot];
        return { stem: stemKanji, suffix: changed + form.suffix };
      }
    }
  };

  const result = getConjugation(selectedVerb, activeForm);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* 左側：控制面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 動詞選擇 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Target Verb</h3>
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {verbBank.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVerb(v)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                    selectedVerb === v 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-lg">{v.kanji}{v.tail}</span>
                    <span className="text-xs ml-2 opacity-70">{v.meaning.split(' ')[0]}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                    selectedVerb === v ? 'bg-slate-700' : 'bg-slate-200'
                  }`}>G{v.group}</span>
                </button>
              ))}
            </div>
            {selectedVerb.hint && (
               <div className="mt-3 p-2 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200 flex gap-2 items-start">
                 <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                 <span>{selectedVerb.hint}</span>
               </div>
            )}
          </div>

          {/* 型態選擇 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Target Form</h3>
             <div className="grid grid-cols-2 gap-2">
               {formTypes.map(form => (
                 <button
                   key={form.id}
                   onClick={() => setActiveForm(form)}
                   className={`p-3 rounded-xl border-2 text-left transition-all ${
                     activeForm.id === form.id 
                       ? `${form.bg} ${form.border} ${form.color} font-bold shadow-sm scale-105` 
                       : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                   }`}
                 >
                   <div className="text-sm">{form.name}</div>
                   <div className="text-[10px] opacity-70 mt-1">{form.desc}</div>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* 右側：視覺化反應爐 */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl shadow-xl border-8 border-slate-800 p-8 flex flex-col relative overflow-hidden">
          {/* 背景格線與動畫 */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
            {Array.from({length: 36}).map((_, i) => <div key={i} className="border border-indigo-500/30"></div>)}
          </div>
          
          <div className="flex justify-between items-start mb-12 z-10">
            <div>
              <div className="text-indigo-400 font-mono text-xs mb-1">CONJUGATION ENGINE // ACTIVE</div>
              <div className="text-white text-2xl font-bold flex items-center gap-2">
                {selectedVerb.group === 1 ? '五段變化模式' : selectedVerb.group === 2 ? '拔除接續模式' : '不規則變化模式'}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${activeForm.color.replace('text-', 'border-').replace('600', '400')} ${activeForm.color.replace('text-', 'bg-').replace('600', '900/30')} text-white`}>
              {activeForm.name}
            </div>
          </div>

          {/* 核心變形展示區 */}
          <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
             
             {/* 原形提示 */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-8 text-slate-500 font-mono text-sm flex flex-col items-center">
                <span className="text-xs tracking-widest uppercase mb-1">Base</span>
                <span className="line-through decoration-red-500 decoration-2">{selectedVerb.kanji}{selectedVerb.tail}</span>
             </div>

             <div className="flex items-end justify-center min-h-[120px]">
                {/* 字幹 */}
                <div className="flex flex-col items-center">
                  <span className="text-indigo-300 text-sm font-bold mb-2">
                    {result.specialReading || selectedVerb.reading}
                  </span>
                  <span className="text-7xl md:text-8xl font-black text-white transition-all">
                    {result.stem}
                  </span>
                </div>
                
                {/* 變形後綴 (加上動態進場效果) */}
                <div key={`${selectedVerb.kanji}-${activeForm.id}`} className="flex items-baseline animate-slide-up-fade ml-1">
                  <span className={`text-6xl md:text-7xl font-bold ${activeForm.color.replace('600', '400')}`}>
                    {result.suffix}
                  </span>
                </div>
             </div>
          </div>

          {/* 變化原理解說板 */}
          <div className="mt-12 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 z-10">
             <h4 className="text-slate-300 font-mono text-xs mb-2">MECHANISM EXPLANATION</h4>
             <p className="text-white text-lg">
                {selectedVerb.group === 1 && (
                  <>因為是第一類，字尾「{selectedVerb.tail}」滑動到 <strong>{activeForm.slot.toUpperCase()} 段</strong> 變成「{result.suffix.replace(activeForm.suffix, '') || (activeForm.slot === 'te' ? '音便' : '')}」，再接上「{activeForm.suffix}」。</>
                )}
                {selectedVerb.group === 2 && (
                  <>因為是第二類，直接拔除字尾「る」，直接接上後綴「{activeForm.suffix || conjugator.group2.rules.all[activeForm.slot]}」。</>
                )}
                {selectedVerb.group === 3 && (
                  <>第三類不規則變化，直接記憶整組變形。</>
                )}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 分頁 3: て形特診 (Te-form Clinic)
// ==========================================
function TeFormSection() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4">
          <AlertTriangle size={300} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 text-amber-400">て形 / た形 音便特診室</h2>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            這是初學者最容易陣亡的關卡。請記住：**音便只發生在「第一類動詞」！** 第二、第三類完全不發生音便，直接接上て/た即可。
            為了發音順暢（符合口腔肌肉的最小阻力路徑），第一類動詞原本該變到 i 段的字尾會發生突變。
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeCard 
          icon="⚡"
          title="促音便" 
          desc="變成小 っ"
          rule="う、つ、る ➡️ って" 
          examples={['買う → 買って', '待つ → 待って', '作る → 作って']}
          color="bg-red-50" border="border-red-200" text="text-red-700" highlight="bg-red-500 text-white"
        />
        <TeCard 
          icon="👃"
          title="撥音便" 
          desc="帶鼻音，且需濁音"
          rule="ぬ、ぶ、む ➡️ んで" 
          examples={['死ぬ → 死んで', '遊ぶ → 遊んで', '飲む → 飲んで']}
          color="bg-blue-50" border="border-blue-200" text="text-blue-700" highlight="bg-blue-500 text-white"
        />
        <TeCard 
          icon="✨"
          title="イ音便" 
          desc="變成 い (ぐ需濁音)"
          rule="く ➡️ いて / ぐ ➡️ いで" 
          examples={['書く → 書いて', '泳ぐ → 泳いで', '⚠️行く → 行って(例外)']}
          color="bg-emerald-50" border="border-emerald-200" text="text-emerald-700" highlight="bg-emerald-500 text-white"
        />
        <TeCard 
          icon="🛑"
          title="無音便" 
          desc="不發生突變，乖乖依規則"
          rule="す ➡️ して" 
          examples={['話す → 話して', '直す → 直して']}
          color="bg-purple-50" border="border-purple-200" text="text-purple-700" highlight="bg-purple-500 text-white"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
         <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">第二、第三類怎麼辦？</h3>
            <p className="text-slate-600">直接把「ます」去掉，換成「て」就好啦！完全不需要音便口訣。</p>
         </div>
         <div className="flex gap-4">
            <div className="bg-slate-100 px-4 py-2 rounded-lg font-bold text-slate-700">食べる → 食べて</div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg font-bold text-slate-700">する → して</div>
         </div>
      </div>
    </div>
  );
}

function TeCard({ icon, title, desc, rule, examples, color, border, text, highlight }) {
  return (
    <div className={`${color} ${border} border-2 rounded-2xl p-6 flex flex-col relative`}>
      <div className="text-4xl absolute -top-5 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-100">{icon}</div>
      <h3 className={`text-xl font-black ${text} mb-1`}>{title}</h3>
      <p className="text-sm opacity-70 mb-4">{desc}</p>
      
      <div className={`text-center py-3 rounded-xl font-bold text-lg mb-6 shadow-inner ${highlight}`}>
        {rule}
      </div>
      
      <div className="mt-auto">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-black/10 pb-1">實例</div>
        <ul className="space-y-2">
          {examples.map((ex, i) => (
            <li key={i} className={`font-medium ${ex.includes('⚠️') ? 'text-red-600' : 'text-slate-700'}`}>
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ==========================================
// 分頁 4: 最終驗證 (Exam)
// ==========================================
const examBank = [
  { verb: '飲む (nomu)', type: '可能形 (能喝)', options: ['飲める', '飲みられる', '飲まれる', '飲むれる'], answer: 0, explanation: '第一類動詞的可能形：移到 e 段加上る。飲む -> 飲め + る。' },
  { verb: '見る (miru)', type: 'ない形 (不看)', options: ['見らない', '見ない', '見わない', '見てない'], answer: 1, explanation: '第二類動詞：拔掉る，直接加上ない。' },
  { verb: '来る (kuru)', type: 'ない形 (不來)', options: ['きない', 'くらない', 'こない', 'こらない'], answer: 2, explanation: '第三類不規則：来る的ない形固定是「こない (konai)」。' },
  { verb: '帰る (kaeru)', type: 'て形', options: ['帰て', '帰って', '帰いて', '帰りで'], answer: 1, explanation: '⚠️陷阱題！帰る是偽裝成第二類的「第一類動詞」，字尾是る，套用促音便變為「帰って」。' },
  { verb: '行く (iku)', type: 'て形', options: ['行いて', '行って', '行んで', '行して'], answer: 1, explanation: '⚠️陷阱題！雖然字尾是く，但行く的て形是特例，固定為「行って」。' },
  { verb: '買う (kau)', type: 'ない形 (不買)', options: ['買あない', '買わない', '買いない', '買てない'], answer: 1, explanation: '第一類字尾是「う」時，a段要變成「わ」而不是「あ」，所以是買わない。' },
];

function ExamSection() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === examBank[currentQ].answer) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < examBank.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetExam = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (showResult) {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl text-center animate-fade-in border-4 border-indigo-50">
        <div className="w-24 h-24 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">臨床驗證完成</h2>
        <p className="text-lg text-slate-600 mb-8">
          精準度分析：<span className="text-indigo-600 text-3xl font-black ml-2">{score} / {examBank.length}</span>
        </p>
        
        {score === examBank.length ? (
          <p className="text-emerald-600 font-bold mb-10 text-lg bg-emerald-50 py-3 rounded-lg">完美！你已經完全掌握了這套日文動詞的「大統一理論」。</p>
        ) : (
          <p className="text-amber-600 font-bold mb-10 text-lg bg-amber-50 py-3 rounded-lg">遇到例外陷阱題了嗎？語言的代謝途徑總有幾條特別的支線，回去實驗室再看看吧！</p>
        )}

        <button onClick={resetExam} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 mx-auto transition-all w-full md:w-auto">
          <RotateCcw size={20} /> 重新執行驗證
        </button>
      </div>
    );
  }

  const q = examBank[currentQ];
  const isAnswered = selectedAnswer !== null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-6 border-b-2 border-slate-200 pb-4">
        <div>
          <div className="text-sm font-bold text-indigo-500 mb-1">CASE {currentQ + 1} OF {examBank.length}</div>
          <h3 className="text-2xl font-black text-slate-800">變形測驗</h3>
        </div>
        <div className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
          Score: {score}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
        <div className="text-center mb-10">
          <div className="text-5xl font-black text-slate-800 mb-4">{q.verb}</div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full font-bold">
            <ArrowRight size={18} /> 轉換為「{q.type}」
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {q.options.map((opt, idx) => {
            let btnState = "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-md";
            if (isAnswered) {
              if (idx === q.answer) btnState = "bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500 z-10";
              else if (idx === selectedAnswer) btnState = "bg-red-50 border-red-300 text-red-500 opacity-80";
              else btnState = "bg-slate-50 border-slate-200 text-slate-300 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`p-5 rounded-2xl border-2 text-2xl font-bold transition-all relative ${btnState}`}
              >
                {opt}
                {isAnswered && idx === q.answer && <Check className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600" size={28} />}
                {isAnswered && idx === selectedAnswer && idx !== q.answer && <X className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500" size={28} />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 p-6 bg-slate-800 text-white rounded-2xl animate-slide-up-fade flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <strong className="text-indigo-400 text-sm tracking-wider uppercase flex items-center gap-2 mb-2">
                <Activity size={16} /> 解析 (Analysis)
              </strong>
              <p className="text-slate-200 leading-relaxed">{q.explanation}</p>
            </div>
            <button onClick={nextQuestion} className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all w-full md:w-auto justify-center">
              下一個病例 <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Add CSS keyframes for custom animations
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slide-up-fade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
  .animate-slide-up-fade { animation: slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;
document.head.appendChild(style);