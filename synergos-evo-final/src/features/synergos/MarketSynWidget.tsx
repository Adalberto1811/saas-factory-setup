'use client';

import { Calendar, Video, Eye, Heart, BarChart3, TrendingUp, Download, Share2 } from 'lucide-react';
import { useState } from 'react';

interface CampaignPlan {
    strategy: string;
    plan: Array<{
        day: string;
        type: string;
        script: string;
        visualNotes: string;
        neuroMetrics: {
            gazeDirection: string;
            editBPM: number;
            emotionalTone: string;
        };
    }>;
}

export default function MarketSynWidget({ data }: { data: CampaignPlan }) {
    const [activeDay, setActiveDay] = useState(0);

    if (!data || !data.plan) return (
        <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl animate-pulse">
            <span className="text-fuchsia-300 font-mono text-sm">Initializing MarketSyn Neural Engine...</span>
        </div>
    );

    return (
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-fuchsia-900/50 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-fuchsia-400" />
                        <h3 className="font-bold text-white tracking-wide">MarketSyn Strategy</h3>
                    </div>
                    <span className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 text-xs rounded-full border border-fuchsia-500/30 font-mono">
                        7-DAY VIRAL LAUNCH
                    </span>
                </div>
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">{data.strategy}</p>
            </div>

            {/* Days Scroller */}
            <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide bg-black/20">
                {data.plan.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveDay(idx)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeDay === idx
                                ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/50 scale-105'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {item.day}
                    </button>
                ))}
            </div>

            {/* Active Day Content */}
            <div className="p-6 bg-gradient-to-b from-transparent to-black/40">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        {data.plan[activeDay].type}
                    </h4>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
                            <Eye className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] text-blue-300 uppercase">{data.plan[activeDay].neuroMetrics.gazeDirection}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-md border border-red-500/20">
                            <TrendingUp className="w-3 h-3 text-red-400" />
                            <span className="text-[10px] text-red-300">{data.plan[activeDay].neuroMetrics.editBPM} BPM</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 block">Visual Notes</label>
                        <div className="flex gap-2 items-start text-sm text-gray-300 italic">
                            <Video className="w-4 h-4 mt-1 text-purple-400 shrink-0" />
                            {data.plan[activeDay].visualNotes}
                        </div>
                    </div>

                    <div className="bg-fuchsia-900/10 p-4 rounded-xl border border-fuchsia-500/20 relative group">
                        <label className="text-[10px] text-fuchsia-400/70 uppercase tracking-wider font-bold mb-1 block">Script (Kinetic Typography)</label>
                        <p className="text-md text-white font-medium leading-relaxed">
                            "{data.plan[activeDay].script}"
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-xs bg-fuchsia-600 px-2 py-1 rounded text-white">Copy</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-black/60 border-t border-white/5 flex gap-2">
                <button className="flex-1 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition text-sm flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export PDF
                </button>
                <button className="flex-1 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition text-sm flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> Publish to Meta
                </button>
            </div>
        </div>
    );
}
