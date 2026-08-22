export default function SkeletonCard(){
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900">
      <div className="w-full aspect-[3/4] bg-slate-800 rounded-t-2xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
      </div>
    </div>
  )
}
