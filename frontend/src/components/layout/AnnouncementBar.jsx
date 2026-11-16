export default function AnnouncementBar() {
  return (
    <div className="w-full border-b border-white/10 bg-primary text-white">
      <div className="container-shell flex h-9 items-center justify-between gap-4 overflow-hidden text-[11px] font-label uppercase tracking-[0.12em]">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="inline-block h-1.5 w-1.5 bg-tertiary-fixed" />
          <span>Livraison 58 Wilayas (configurable)</span>
          <span className="text-white/40">•</span>
          <span>Nouvelle collection SS25 (sample)</span>
          <span className="text-white/40">•</span>
          <span className="text-tertiary-fixed">Personnalisation DTF & broderie</span>
        </div>
        <div className="hidden items-center gap-3 text-white/80 md:flex">
          <span>Paiement à la livraison (COD)</span>
          <span className="text-white/40">|</span>
          <span>Bordj El Kiffan, Alger</span>
        </div>
      </div>
    </div>
  );
}
