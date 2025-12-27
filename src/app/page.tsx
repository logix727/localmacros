'use client';

import { useState, useEffect } from 'react';
import { Camera as CameraIcon, Plus, ChevronRight, Activity, Check, X, RefreshCw } from 'lucide-react';
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
    // Init Flow
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

      const cals = todaysLogs.reduce((acc, curr) => acc + curr.calories, 0);
      const prot = todaysLogs.reduce((acc, curr) => acc + curr.protein, 0);
      setTodayCalories(cals);
      setTodayProtein(prot);
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
        // Uses Zod-validated AI function now
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

    // Background Sync
    syncLogsToHealthConnect().then(refreshLogs);
  };

  return (
    <main className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen relative">
      {/* Top App Bar */}
      <header className="mb-6 pt-8">
        <h1 className="text-4xl font-normal text-on-background tracking-tight">LocalMacros</h1>
        <p className="text-on-surface-variant text-lg mt-1">Track your nutrition locally.</p>
      </header>

      {/* Daily Summary */}
      <section className="mb-8">
        <div className="bg-secondary-container text-on-secondary-container rounded-[28px] p-6 elevation-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-title-medium font-medium">Today's Summary</h2>
              <p className="text-sm opacity-80">Target: 2000 kcal</p>
            </div>
            <Activity className="w-6 h-6 opacity-80" />
          </div>

          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              <div className="text-4xl font-normal mb-1">{todayCalories}</div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-70">Calories</div>
            </div>
            <div className="w-[1px] bg-on-secondary-container/10"></div>
            <div className="flex-1">
              <div className="text-4xl font-normal mb-1">{todayProtein}<span className="text-sm ml-1">g</span></div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-70">Protein</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Logs & Sync UI */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl text-on-surface font-medium">Recent Logs</h2>
          <button onClick={() => syncLogsToHealthConnect().then(refreshLogs)} className="text-primary font-medium text-sm flex items-center gap-1 active:opacity-50 transition-opacity">
            <RefreshCw className="w-4 h-4" /> Sync Now
          </button>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="bg-surface-variant/30 border border-outline-variant/20 rounded-[16px] p-8 text-center">
              <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-3">
                <CameraIcon className="w-6 h-6 text-on-surface-variant" />
              </div>
              <p className="text-on-surface-variant font-medium">No meals logged today</p>
              <p className="text-on-surface-variant/60 text-sm mt-1">Tap the + button to add your first meal</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="bg-surface border border-outline-variant/20 rounded-[16px] p-4 flex justify-between items-center elevation-1">
                <div>
                  <h3 className="text-lg font-medium text-on-surface">{log.foodName}</h3>
                  <p className="text-sm text-on-surface-variant">{log.calories} kcal • {log.protein}g protein</p>
                </div>
                <div className="flex items-center gap-1">
                  {log.synced ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Analysis & Edit Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-on-surface font-medium text-lg">Analyzing Food...</p>
            <p className="text-on-surface-variant text-sm">Identifying via Gemini Nano</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 top-10 bg-surface rounded-t-[32px] p-6 shadow-2xl z-40 flex flex-col border border-outline/10 overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-on-surface">Edit Analysis</h2>
              <div className="text-xs font-medium px-2 py-1 bg-tertiary-container text-on-tertiary-container rounded-full">
                {Math.round(result.confidence * 100)}% Confidence
              </div>
            </div>

            {/* Editable Form */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-wide">Food Name</label>
                <input
                  type="text"
                  value={result.foodName}
                  onChange={(e) => setResult({ ...result, foodName: e.target.value })}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl px-4 py-3 text-lg text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-wide">Portion</label>
                <input
                  type="text"
                  value={result.portion}
                  onChange={(e) => setResult({ ...result, portion: e.target.value })}
                  className="w-full bg-surface-variant/50 border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-variant/30 p-2 rounded-xl">
                  <label className="block text-[10px] text-on-surface-variant font-bold uppercase mb-1">Calories</label>
                  <input
                    type="number"
                    value={result.calories}
                    onChange={(e) => setResult({ ...result, calories: Number(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-medium text-on-surface focus:outline-none"
                  />
                </div>
                <div className="bg-surface-variant/30 p-2 rounded-xl">
                  <label className="block text-[10px] text-on-surface-variant font-bold uppercase mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={result.protein}
                    onChange={(e) => setResult({ ...result, protein: Number(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-medium text-on-surface focus:outline-none"
                  />
                </div>
                <div className="bg-surface-variant/30 p-2 rounded-xl">
                  <label className="block text-[10px] text-on-surface-variant font-bold uppercase mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={result.carbs}
                    onChange={(e) => setResult({ ...result, carbs: Number(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-medium text-on-surface focus:outline-none"
                  />
                </div>
                <div className="bg-surface-variant/30 p-2 rounded-xl">
                  <label className="block text-[10px] text-on-surface-variant font-bold uppercase mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={result.fat}
                    onChange={(e) => setResult({ ...result, fat: Number(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-medium text-on-surface focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto flex gap-4 pt-4 mb-safe">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-4 text-on-surface font-medium rounded-full hover:bg-surface-variant/50 transition-colors"
                aria-label="Discard Scan"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-4 bg-primary text-on-primary font-medium rounded-full shadow-lg flex items-center justify-center gap-2 mb-4"
                aria-label="Save Log"
              >
                <Check className="w-5 h-5" />
                Save Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className="fixed bottom-8 right-6 z-30">
        <motion.button
          onClick={handleCapture}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="bg-primary-container text-on-primary-container w-16 h-16 rounded-[20px] flex items-center justify-center elevation-3 shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Log Food"
        >
          <CameraIcon className="w-7 h-7" />
        </motion.button>
      </div>
    </main>
  );
}
