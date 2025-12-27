'use client';

import { useState, useEffect } from 'react';
import { Camera as CameraIcon, ChevronRight, Activity, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraResultType } from '@capacitor/camera';
import { analyzeFoodImage, FoodAnalysis } from '@/lib/ai';
import { saveLog, getAllLogs, initDB } from '@/lib/db';
import { syncLogsToHealthConnect, initializeHealthConnect } from '@/lib/health';

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);

  useEffect(() => {
    const init = async () => {
      await initDB();
      await initializeHealthConnect();
      refreshLogs();
    };
    init();
  }, []);

  const refreshLogs = async () => {
    try {
      const all = await getAllLogs();
      const today = new Date();
      const todaysLogs = all.filter(l =>
        new Date(l.date).getDate() === today.getDate() &&
        new Date(l.date).getMonth() === today.getMonth()
      );
      setLogs(todaysLogs.reverse());
      setTodayCalories(todaysLogs.reduce((acc, curr) => acc + curr.calories, 0));
      setTodayProtein(todaysLogs.reduce((acc, curr) => acc + curr.protein, 0));
    } catch (e) {
      console.error("Error refreshing logs:", e);
    }
  };

  const handleCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });

      if (image.base64String) {
        setAnalyzing(true);
        const analysis = await analyzeFoodImage(image.base64String);
        setResult(analysis);
        setAnalyzing(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    await saveLog({
      id: crypto.randomUUID(),
      foodName: result.foodName,
      calories: result.calories,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      portion: result.portion,
      date: new Date()
    });
    setResult(null);
    await refreshLogs();
    syncLogsToHealthConnect().then(refreshLogs);
  };

  return (
    <main className="pb-32 pt-6 px-4 max-w-md mx-auto min-h-screen relative bg-background text-on-background overflow-x-hidden">
      {/* Expressive Header */}
      <header className="mb-8 pt-8 px-2">
        <h1 className="text-[57px] leading-[64px] font-normal tracking-[-0.25px] text-on-background">Local<br />Macros</h1>
        <p className="text-xl text-on-surface-variant mt-2 font-light">Your Pixel 10 Nutritionist</p>
      </header>

      {/* Summary Card - Expressive Shape & Color */}
      <section className="mb-10">
        <div className="bg-primary-container text-on-primary-container rounded-[32px] p-8 elevation-2 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-normal">Today</h2>
              <p className="text-sm opacity-70 font-medium tracking-wide uppercase mt-1">Goal: 2000 kcal</p>
            </div>
            <div className="bg-on-primary-container/10 p-3 rounded-full">
              <Activity className="w-8 h-8" />
            </div>
          </div>

          <div className="flex gap-8 relative z-10">
            <div>
              <div className="text-[45px] leading-[52px] font-normal">{todayCalories}</div>
              <div className="text-sm font-medium opacity-80 mt-1">Calories</div>
            </div>
            <div className="w-[1px] bg-on-primary-container/20"></div>
            <div>
              <div className="text-[45px] leading-[52px] font-normal flex items-baseline">
                {todayProtein}<span className="text-xl ml-1">g</span>
              </div>
              <div className="text-sm font-medium opacity-80 mt-1">Protein</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Logs - Surface Container High */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-[28px] leading-[36px] font-normal text-on-surface">Recent</h2>
          <button
            onClick={() => syncLogsToHealthConnect().then(refreshLogs)}
            className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:elevation-1"
          >
            <RefreshCw className="w-4 h-4" /> Sync
          </button>
        </div>

        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="bg-surface-container rounded-[24px] p-10 text-center border border-outline-variant/30 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center">
                <CameraIcon className="w-8 h-8 text-outline" />
              </div>
              <div>
                <p className="text-lg font-medium text-on-surface">No meals yet</p>
                <p className="text-on-surface-variant">Tap the camera to start logging</p>
              </div>
            </div>
          ) : (
            logs.map((log) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={log.id}
                className="bg-surface-container-high rounded-[24px] p-5 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-normal text-on-surface mb-1">{log.foodName}</h3>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="font-medium bg-surface-container rounded-md px-2 py-0.5">{log.calories} kcal</span>
                    <span>•</span>
                    <span>{log.protein}g protein</span>
                  </div>
                </div>
                {log.synced ? (
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-tertiary margin-r-2" title="Local Only" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Analysis Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-scrim/60 backdrop-blur-md z-50 flex items-center justify-center flex-col"
          >
            <div className="w-20 h-20 border-[6px] border-primary-container border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-surface-container-lowest font-medium text-2xl tracking-tight">Identifying...</p>
            <p className="text-surface-container-lowest/70 text-base mt-2">Gemini Nano is thinking</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 top-[10vh] bg-surface-container-lowest rounded-t-[44px] p-8 shadow-2xl z-40 flex flex-col overflow-y-auto"
          >
            <div className="w-16 h-2 bg-outline-variant/40 rounded-full mx-auto mb-8" />

            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-bold text-tertiary uppercase tracking-wider mb-2">Edit Details</p>
                <h2 className="text-3xl font-medium text-on-surface">Analysis Results</h2>
              </div>
              <div className="px-4 py-2 bg-tertiary-container text-on-tertiary-container rounded-[16px] text-sm font-bold">
                {Math.round(result.confidence * 100)}% Match
              </div>
            </div>

            {/* Huge Editable Inputs */}
            <div className="space-y-6 mb-8">
              <div className="bg-surface-container p-4 rounded-[24px]">
                <label className="block text-xs text-on-surface-variant font-bold uppercase mb-2 ml-1">Food Name</label>
                <input
                  type="text"
                  value={result.foodName}
                  onChange={(e) => setResult({ ...result, foodName: e.target.value })}
                  className="w-full bg-transparent text-[28px] leading-[34px] text-on-surface font-normal border-b border-outline-variant focus:border-primary focus:outline-none pb-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container p-5 rounded-[24px] flex flex-col">
                  <label className="text-xs text-on-surface-variant font-bold uppercase mb-1">Calories</label>
                  <input
                    type="number"
                    value={result.calories}
                    onChange={(e) => setResult({ ...result, calories: Number(e.target.value) })}
                    className="w-full bg-transparent text-4xl font-normal text-on-surface focus:outline-none"
                  />
                </div>
                <div className="bg-surface-container p-5 rounded-[24px] flex flex-col">
                  <label className="text-xs text-on-surface-variant font-bold uppercase mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={result.protein}
                    onChange={(e) => setResult({ ...result, protein: Number(e.target.value) })}
                    className="w-full bg-transparent text-4xl font-normal text-on-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
              <button
                onClick={() => setResult(null)}
                className="py-5 text-on-surface font-medium rounded-full hover:bg-surface-container-high transition-colors text-lg"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="py-5 bg-primary text-on-primary font-medium rounded-[24px] shadow-lg flex items-center justify-center gap-2 text-lg hover:elevation-2 transition-shadow"
              >
                <Check className="w-6 h-6" />
                Save Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expressive FAB (Rectangular) */}
      <div className="fixed bottom-8 right-6 z-30">
        <motion.button
          onClick={handleCapture}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05, rotate: -5 }}
          className="bg-tertiary-container text-on-tertiary-container w-[72px] h-[72px] rounded-[24px] flex items-center justify-center shadow-xl border border-white/20"
          aria-label="Log Food"
        >
          <CameraIcon className="w-8 h-8" />
        </motion.button>
      </div>
    </main>
  );
}
