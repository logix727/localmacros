'use client';

import { useState } from 'react';
import { Camera as CameraIcon, Plus, ChevronRight, Activity, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraResultType } from '@capacitor/camera';
import { analyzeFoodImage, FoodAnalysis } from '@/lib/ai';

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);

  const handleCapture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });

      if (image.base64String) {
        setAnalyzing(true);
        // Simulate analysis
        const analysis = await analyzeFoodImage(image.base64String);
        setResult(analysis);
        setAnalyzing(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    // TODO: Connect to Health Connect
    setResult(null);
  };

  return (
    <main className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen relative">
      {/* Top App Bar - Large */}
      <header className="mb-6 pt-8">
        <h1 className="text-4xl font-normal text-on-background tracking-tight">LocalMacros</h1>
        <p className="text-on-surface-variant text-lg mt-1">Track your nutrition locally.</p>
      </header>

      {/* Daily Summary Card */}
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
              <div className="text-4xl font-normal mb-1">0</div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-70">Calories</div>
            </div>
            <div className="w-[1px] bg-on-secondary-container/10"></div>
            <div className="flex-1">
              <div className="text-4xl font-normal mb-1">0<span className="text-sm ml-1">g</span></div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-70">Protein</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Logs Section */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl text-on-surface font-medium">Recent Logs</h2>
          <button className="text-primary font-medium text-sm flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Empty State / List */}
        <div className="space-y-3">
          {/* Placeholder for "No logs yet" */}
          <div className="bg-surface-variant/30 border border-outline-variant/20 rounded-[16px] p-8 text-center">
            <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-3">
              <CameraIcon className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-on-surface-variant font-medium">No meals logged today</p>
            <p className="text-on-surface-variant/60 text-sm mt-1">Tap the + button to add your first meal</p>
          </div>
        </div>
      </section>

      {/* Analysis Overlay */}
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
            className="fixed inset-x-0 bottom-0 top-20 bg-surface rounded-t-[32px] p-6 shadow-2xl z-40 flex flex-col border border-outline/10"
          >
            <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto mb-6" />

            <h2 className="text-3xl font-medium text-on-surface mb-2">{result.foodName}</h2>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-sm font-medium">
                {result.portion}
              </span>
              <span className="text-on-surface-variant text-sm">Confidence: {Math.round(result.confidence * 100)}%</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-variant p-4 rounded-2xl">
                <div className="text-xs text-on-surface-variant uppercase tracking-wide font-medium">Calories</div>
                <div className="text-3xl text-on-surface font-medium">{result.calories}</div>
              </div>
              <div className="bg-surface-variant p-4 rounded-2xl">
                <div className="text-xs text-on-surface-variant uppercase tracking-wide font-medium">Protein</div>
                <div className="text-3xl text-on-surface font-medium">{result.protein}g</div>
              </div>
              <div className="bg-surface-variant p-4 rounded-2xl">
                <div className="text-xs text-on-surface-variant uppercase tracking-wide font-medium">Carbs</div>
                <div className="text-3xl text-on-surface font-medium">{result.carbs}g</div>
              </div>
              <div className="bg-surface-variant p-4 rounded-2xl">
                <div className="text-xs text-on-surface-variant uppercase tracking-wide font-medium">Fat</div>
                <div className="text-3xl text-on-surface font-medium">{result.fat}g</div>
              </div>
            </div>

            <div className="mt-auto flex gap-4">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-4 text-on-surface font-medium rounded-full hover:bg-surface-variant/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-4 bg-primary text-on-primary font-medium rounded-full shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Log Scan
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
