
import React, { useState, useEffect, useCallback } from 'react';
import { CalcMode, HistoryItem } from './types';
import Button from './components/Button';
import { solveMathProblem } from './services/geminiService';

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [mode, setMode] = useState<CalcMode>(CalcMode.STANDARD);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ result: string, explanation: string, steps: string[] } | null>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('calc_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = useCallback((exp: string, res: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression: exp,
      result: res,
      timestamp: Date.now()
    };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('calc_history', JSON.stringify(updated));
  }, [history]);

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleDigit = (digit: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleCalculate = () => {
    try {
      const fullExp = expression + display;
      // Simple evaluator - in a production app we'd use a parser, 
      // but for this UI demo we'll use a controlled Function constructor
      // We replace common symbols for standard eval
      const cleanExp = fullExp.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function(`return ${cleanExp}`)();
      const resultStr = String(Number(result).toLocaleString(undefined, { maximumFractionDigits: 8 }));
      setDisplay(resultStr);
      saveHistory(fullExp, resultStr);
      setExpression('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleScientific = (func: string) => {
    try {
      let val = parseFloat(display);
      let result = 0;
      switch(func) {
        case 'sin': result = Math.sin(val); break;
        case 'cos': result = Math.cos(val); break;
        case 'tan': result = Math.tan(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'exp': result = Math.exp(val); break;
        case 'square': result = val * val; break;
        default: result = val;
      }
      const resStr = String(result.toLocaleString(undefined, { maximumFractionDigits: 8 }));
      setDisplay(resStr);
      saveHistory(`${func}(${display})`, resStr);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleAiSolve = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await solveMathProblem(aiInput);
      setAiResult(result);
      saveHistory(`AI: ${aiInput}`, result.result);
    } catch (error) {
      setAiResult({ result: 'Error', explanation: 'Failed to connect to AI', steps: [] });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* App Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation / Header (Mobile/Small Desktop) */}
        <div className="lg:col-span-12 flex flex-wrap gap-2 mb-2">
          <button 
            onClick={() => setMode(CalcMode.STANDARD)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${mode === CalcMode.STANDARD ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            Standard
          </button>
          <button 
            onClick={() => setMode(CalcMode.SCIENTIFIC)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${mode === CalcMode.SCIENTIFIC ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            Scientific
          </button>
          <button 
            onClick={() => setMode(CalcMode.AI_ASSISTANT)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${mode === CalcMode.AI_ASSISTANT ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            AI Assistant
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto px-4 py-2 bg-white rounded-full text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {isSidebarOpen ? 'Close History' : 'View History'}
          </button>
        </div>

        {/* Main Calculator Area */}
        <div className={`lg:col-span-${isSidebarOpen ? '8' : '12'} bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500`}>
          
          {/* Display Area */}
          <div className="bg-slate-900 p-8 text-right min-h-[160px] flex flex-col justify-end space-y-2">
            <div className="text-slate-400 text-lg mono truncate h-7">
              {expression}
            </div>
            <div className="text-white text-5xl md:text-6xl font-light mono truncate">
              {display}
            </div>
          </div>

          {/* Pads Area */}
          <div className="p-6">
            {mode === CalcMode.AI_ASSISTANT ? (
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask me anything: 'What is 25% of 1500?' or 'Solve for x: 2x + 5 = 15'"
                    className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-slate-700"
                  />
                  <button
                    onClick={handleAiSolve}
                    disabled={isAiLoading}
                    className="absolute bottom-4 right-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Thinking...
                      </>
                    ) : 'Solve with AI'}
                  </button>
                </div>

                {aiResult && (
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-indigo-900 font-bold text-xl mb-2">AI Result: {aiResult.result}</h3>
                    <p className="text-indigo-700 mb-4">{aiResult.explanation}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Solution Steps</p>
                      {aiResult.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 text-slate-700 bg-white/50 p-3 rounded-lg">
                          <span className="font-bold text-indigo-500">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {/* Scientific Row (Conditional) */}
                {mode === CalcMode.SCIENTIFIC && (
                  <div className="col-span-4 grid grid-cols-4 gap-3 mb-3">
                    <Button label="sin" onClick={() => handleScientific('sin')} variant="scientific" />
                    <Button label="cos" onClick={() => handleScientific('cos')} variant="scientific" />
                    <Button label="tan" onClick={() => handleScientific('tan')} variant="scientific" />
                    <Button label="√" onClick={() => handleScientific('sqrt')} variant="scientific" />
                    <Button label="log" onClick={() => handleScientific('log')} variant="scientific" />
                    <Button label="ln" onClick={() => handleScientific('ln')} variant="scientific" />
                    <Button label="e^x" onClick={() => handleScientific('exp')} variant="scientific" />
                    <Button label="x²" onClick={() => handleScientific('square')} variant="scientific" />
                  </div>
                )}

                {/* Standard Layout */}
                <Button label="C" onClick={handleClear} variant="action" />
                <Button label="±" onClick={() => setDisplay(String(-parseFloat(display)))} variant="action" />
                <Button label="%" onClick={() => setDisplay(String(parseFloat(display) / 100))} variant="action" />
                <Button label="÷" onClick={() => handleOperator('/')} variant="operator" />

                <Button label="7" onClick={() => handleDigit('7')} />
                <Button label="8" onClick={() => handleDigit('8')} />
                <Button label="9" onClick={() => handleDigit('9')} />
                <Button label="×" onClick={() => handleOperator('*')} variant="operator" />

                <Button label="4" onClick={() => handleDigit('4')} />
                <Button label="5" onClick={() => handleDigit('5')} />
                <Button label="6" onClick={() => handleDigit('6')} />
                <Button label="-" onClick={() => handleOperator('-')} variant="operator" />

                <Button label="1" onClick={() => handleDigit('1')} />
                <Button label="2" onClick={() => handleDigit('2')} />
                <Button label="3" onClick={() => handleDigit('3')} />
                <Button label="+" onClick={() => handleOperator('+')} variant="operator" />

                <Button label="0" onClick={() => handleDigit('0')} span={2} />
                <Button label="." onClick={() => handleDigit('.')} />
                <Button label="=" onClick={handleCalculate} variant="operator" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar History */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-xl p-6 h-[600px] overflow-y-auto animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
              Calculation History
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('calc_history');
                }}
                className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            </h2>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">No history yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group"
                    onClick={() => {
                      setDisplay(item.result);
                      setExpression(item.expression);
                    }}
                  >
                    <p className="text-xs text-slate-400 mb-1 flex justify-between">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span className="group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">Recall ↺</span>
                    </p>
                    <p className="text-slate-500 truncate text-sm mb-1">{item.expression}</p>
                    <p className="text-slate-900 font-bold text-lg mono">{item.result}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-6 text-slate-400 text-sm flex items-center gap-2">
        <span className="font-medium">OmniCalc AI</span>
        <span className="opacity-50">|</span>
        <span>Powered by Gemini 3</span>
      </div>
    </div>
  );
};

export default App;
