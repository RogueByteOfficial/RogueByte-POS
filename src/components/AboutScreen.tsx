import React from 'react';
import {
  Award,
  Coffee,
  ExternalLink,
  Github,
  Globe,
  Heart,
  HelpCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const AboutScreen: React.FC = () => {
  const { t, language } = usePOS();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{t.developerInfo}</h2>
            <p className="text-xs text-slate-400">
              Project Attribution, Provenance & Direct Communications
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Hero Card */}
        <div className="p-8 rounded-3xl bg-linear-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <span>{t.systemName}</span>
              <span>•</span>
              <span>Version 1.0.0 Production</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.systemSubtitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t.provenanceDesc}
            </p>
          </div>
        </div>

        {/* Provenance & Developer Attribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Developer Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
                FS
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Original Developer
                </span>
                <h3 className="font-bold text-white text-base">
                  Fares Sid Ahmed (Sido)
                </h3>
                <p className="text-xs text-slate-400 font-mono">@RogueByteOfficial</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
              <p className="italic text-slate-400">
                &ldquo;أؤمن أن كل نظام يخبئ قصة تحت طبقته الأولى — ومهمتي قراءتها.&rdquo;
              </p>
            </div>
          </div>

          {/* Marketing Director Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-lg">
                MA
              </div>
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  Marketing Director
                </span>
                <h3 className="font-bold text-white text-base">
                  Mouahdi Adel
                </h3>
                <p className="text-xs text-slate-400">مهدي عادل — إدارة التسويق والشراكات</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
              <p className="text-slate-400">
                إدارة نمو العلامة التجارية والشراكات الاستراتيجية لـ RogueByte في الشرق الأوسط.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Communications & Inquiries */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>📬 Direct Communications & Inquiries / قنوات التواصل والاستفسارات</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* General */}
            <a
              href="mailto:contact@roguebyte.online"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
            >
              <span className="text-[11px] text-slate-400 block font-medium">
                {t.contactEmail}
              </span>
              <span className="text-xs font-mono font-bold text-white group-hover:text-amber-400 transition-colors">
                contact@roguebyte.online
              </span>
            </a>

            {/* Support */}
            <a
              href="mailto:help@roguebyte.online"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
            >
              <span className="text-[11px] text-slate-400 block font-medium">
                {t.supportEmail}
              </span>
              <span className="text-xs font-mono font-bold text-white group-hover:text-amber-400 transition-colors">
                help@roguebyte.online
              </span>
            </a>

            {/* Business */}
            <a
              href="mailto:business@roguebyte.online"
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
            >
              <span className="text-[11px] text-slate-400 block font-medium">
                {t.businessEmail}
              </span>
              <span className="text-xs font-mono font-bold text-white group-hover:text-amber-400 transition-colors">
                business@roguebyte.online
              </span>
            </a>
          </div>
        </div>

        {/* Links & Brand Assets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://roguebyte.online/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white group-hover:text-amber-400 block">
                  Official Website
                </span>
                <span className="text-[10px] text-slate-400 font-mono">roguebyte.online</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          </a>

          <a
            href="https://github.com/RogueByteOfficial"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-slate-300" />
              <div>
                <span className="text-xs font-bold text-white group-hover:text-amber-400 block">
                  GitHub Organization
                </span>
                <span className="text-[10px] text-slate-400 font-mono">@RogueByteOfficial</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          </a>

          <a
            href="https://ko-fi.com/roguebyte"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Coffee className="w-5 h-5 text-rose-400" />
              <div>
                <span className="text-xs font-bold text-white group-hover:text-rose-400 block">
                  Donations & Support
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ko-fi.com/roguebyte</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
