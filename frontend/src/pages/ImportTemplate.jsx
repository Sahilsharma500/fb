import React, { useState } from 'react';
import { Copy, Check, Download, AlertCircle, FileCode } from 'lucide-react';

const ImportTemplate = () => {
  const [copied, setCopied] = useState(false);

  const sampleJSON = {
    "version": "1.0",
    "quizName": "Ancient Indian History Practice Quiz",
    "description": "Comprehensive review questions covering Mauryan, Gupta, and Vedic civilizations.",
    "duration": 60,
    "positiveMarking": 2,
    "negativeMarking": 0.5,
    "tags": ["History", "Ancient", "Tier-1"],
    "syllabus": {
      "generalIntelligenceReasoning": ["Syllogism"],
      "generalAwareness": ["Mauryan Empire", "Buddhism", "Vedic Age"],
      "quantitativeAptitude": ["Number System"],
      "englishComprehension": ["Noun"]
    },
    "questions": [
      {
        "questionNumber": 1,
        "section": "General Intelligence & Reasoning",
        "topic": "Syllogism",
        "difficulty": "Easy",
        "question": "Statements: All poets are writers. All writers are readers.\nConclusions:\nI. All poets are readers.\nII. Some readers are poets.",
        "options": {
          "A": "Only conclusion I follows",
          "B": "Only conclusion II follows",
          "C": "Both conclusions I and II follow",
          "D": "Neither conclusion I nor II follows"
        },
        "correctOption": "C",
        "explanation": "Since all poets are writers and all writers are readers, all poets are readers (Conclusion I follows). Since all poets are readers, some readers are definitely poets (Conclusion II follows).",
        "source": "SSC CGL PYQ"
      },
      {
        "questionNumber": 2,
        "section": "General Awareness",
        "topic": "Mauryan Empire",
        "difficulty": "Medium",
        "question": "Which Mauryan ruler abdicated his throne and wandered into Southern India with Bhadrabahu, embracing Jainism?",
        "options": {
          "A": "Chandragupta Maurya",
          "B": "Bindusara",
          "C": "Ashoka",
          "D": "Dasaratha"
        },
        "correctOption": "A",
        "explanation": "Chandragupta Maurya, the founder of the Mauryan Empire, abdicated the throne, became a disciple of Jain monk Bhadrabahu, and fasted to death (Sallekhana) at Shravanabelagola in Karnataka.",
        "source": "SSC CGL 2021 PYQ"
      },
      {
        "questionNumber": 3,
        "section": "Quantitative Aptitude",
        "topic": "Number System",
        "difficulty": "Hard",
        "question": "What is the unit digit of the product (2467)^153 * (341)^72?",
        "options": {
          "A": "7",
          "B": "9",
          "C": "1",
          "D": "3"
        },
        "correctOption": "A",
        "explanation": "For (2467)^153, unit digit cycle of 7 is 7, 9, 3, 1 (length 4). 153 mod 4 = 1. So unit digit of (2467)^153 is 7^1 = 7. Unit digit of (341)^72 is 1. Product unit digit = 7 * 1 = 7.",
        "source": "SSC Style Mock"
      },
      {
        "questionNumber": 4,
        "section": "English Comprehension",
        "topic": "Noun",
        "difficulty": "Easy",
        "question": "Identify the incorrect usage of the plural noun in the following sentence: 'The sheeps were grazing in the valley while the wolves watched from the hills.'",
        "options": {
          "A": "sheeps",
          "B": "grazing",
          "C": "wolves",
          "D": "hills"
        },
        "correctOption": "A",
        "explanation": "The plural form of 'sheep' is 'sheep', not 'sheeps'.",
        "source": "SSC CGL Grammar"
      }
    ]
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleJSON, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleJSON, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ssc_cgl_quiz_template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Import JSON Specification</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review schema rules, check required keys, and download or copy the valid template payload to start.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rules & Requirements (1/3 width) */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Required Root Fields</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between">
                <code className="text-brand-500 font-semibold font-mono">quizName</code>
                <span className="text-slate-400">String</span>
              </li>
              <li className="flex justify-between">
                <code className="text-brand-500 font-semibold font-mono">duration</code>
                <span className="text-slate-400">Number (min)</span>
              </li>
              <li className="flex justify-between">
                <code className="text-brand-500 font-semibold font-mono">positiveMarking</code>
                <span className="text-slate-400">Number (e.g. 2)</span>
              </li>
              <li className="flex justify-between">
                <code className="text-brand-500 font-semibold font-mono">negativeMarking</code>
                <span className="text-slate-400">Number (e.g. 0.5)</span>
              </li>
              <li className="flex justify-between">
                <code className="text-brand-500 font-semibold font-mono">questions</code>
                <span className="text-slate-400">Array of objects</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3">Question Parameters</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">questionNumber</code>
                <span className="text-slate-400">Number</span>
              </li>
               <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">section</code>
                <span className="text-slate-400">GI & Reasoning / GA / Quant / English Comp</span>
              </li>
              <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">topic</code>
                <span className="text-slate-400">String (e.g. Buddhism)</span>
              </li>
              <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">difficulty</code>
                <span className="text-slate-400">Easy / Medium / Hard</span>
              </li>
              <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">question</code>
                <span className="text-slate-400">String</span>
              </li>
              <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">options</code>
                <span className="text-slate-400">Object {'{A,B,C,D}'}</span>
              </li>
              <li className="flex justify-between">
                <code className="text-indigo-500 font-semibold font-mono">correctOption</code>
                <span className="text-slate-400">A / B / C / D</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-brand-50/50 dark:bg-brand-950/20 p-5 border border-brand-100 dark:border-brand-900/30 flex gap-2">
            <AlertCircle className="text-brand-500 shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-brand-800 dark:text-brand-300">
              <p className="font-bold mb-1">CBT Palette Binding</p>
              <p>Standard sections must match spelling: "General Intelligence & Reasoning", "General Awareness", "Quantitative Aptitude", "English Comprehension" for palette filtering to work correctly.</p>
            </div>
          </div>
        </div>

        {/* Code Preview (2/3 width) */}
        <div className="md:col-span-2 flex flex-col rounded-3xl bg-slate-900 shadow-xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between bg-slate-950 px-5 py-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="text-slate-400" size={16} />
              <span className="text-xs font-bold text-slate-300 font-mono">template_schema.json</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-[0.98] transition-all"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 active:scale-[0.98] transition-all"
              >
                <Download size={13} />
                Download
              </button>
            </div>
          </div>
          
          <pre className="p-5 overflow-auto text-xs text-emerald-400 font-mono max-h-[460px] leading-5">
            <code>{JSON.stringify(sampleJSON, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ImportTemplate;
