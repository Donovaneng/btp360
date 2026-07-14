import React from 'react';

const SkeletonCard = ({ type = 'partner' }) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 p-8 space-y-6 relative">
      {/* Shimmer Overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
      </div>

      {type === 'partner' ? (
        <>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-slate-100 rounded-full w-full"></div>
            <div className="h-3 bg-slate-100 rounded-full w-[90%]"></div>
          </div>
          <div className="h-12 bg-slate-50 rounded-2xl w-full"></div>
        </>
      ) : (
        <>
          <div className="h-48 bg-slate-100 rounded-[2rem] w-full"></div>
          <div className="space-y-3">
            <div className="h-5 bg-slate-100 rounded-full w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded-full w-full"></div>
            <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <div className="h-4 bg-slate-50 rounded-full w-24"></div>
            <div className="h-4 bg-slate-50 rounded-full w-16"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkeletonCard;
