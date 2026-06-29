import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Header } from "@/components/layout/Header";
import { NavigationTabs } from "@/components/layout/NavigationTabs";
import { TradeForm } from "@/components/trades/TradeForm";
import { TradeDetail } from "@/components/trades/TradeDetail";
import { ReviewForm } from "@/components/review/ReviewForm";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { AnalyticsView } from "@/views/AnalyticsView";
import { TradesView } from "@/views/TradesView";
import { ReviewView } from "@/views/ReviewView";
import { MissedTradesView } from "@/views/MissedTradesView";
import { MilestonesView } from "@/views/MilestonesView";
import { useTrades, saveTrade, deleteTrade } from "@/hooks/useTrades";
import { useReviews, saveReview, deleteReview } from "@/hooks/useReviews";
import { useSettings, saveSettings } from "@/hooks/useSettings";
import { useAnalytics } from "@/hooks/useAnalytics";
import { newReview, newTrade } from "@/lib/factories";
import { seedDemoData } from "@/data/demoData";
import { getSettings } from "@/lib/db";
import type { DailyReview, TabKey, Trade } from "@/types";

export default function App() {
  const [tab, setTab] = useState<TabKey>("analytics");

  const trades = useTrades();
  const reviews = useReviews();
  const settings = useSettings();
  const analytics = useAnalytics(trades, settings.startingBalance);

  // Modal state
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  const [editingReview, setEditingReview] = useState<DailyReview | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Seed demo data once on first ever launch.
  useEffect(() => {
    (async () => {
      const s = await getSettings();
      if (!s.demoSeeded) {
        await seedDemoData();
        await saveSettings({ demoSeeded: true });
      }
    })();
  }, []);

  function openNewTrade() {
    setViewingTrade(null);
    setEditingTrade(newTrade());
  }
  function openNewReview() {
    setEditingReview(newReview());
  }

  return (
    <PageShell>
      <Header onNewTrade={openNewTrade} onNewReview={openNewReview} onOpenSettings={() => setSettingsOpen(true)} />
      <NavigationTabs active={tab} onChange={setTab} />

      {tab === "analytics" && (
        <AnalyticsView
          trades={trades}
          analytics={analytics}
          onNewTrade={openNewTrade}
          onNewReview={openNewReview}
          onOpenTrade={(t) => setViewingTrade(t)}
        />
      )}

      {tab === "trades" && (
        <TradesView
          trades={trades}
          onNewTrade={openNewTrade}
          onOpenTrade={(t) => setViewingTrade(t)}
          onEditTrade={(t) => { setViewingTrade(null); setEditingTrade(t); }}
          onDeleteTrade={async (t) => { if (confirm(`Delete trade ${t.pair || ""} on ${t.date}?`)) await deleteTrade(t.id); }}
        />
      )}

      {tab === "review" && (
        <ReviewView
          reviews={reviews}
          onNew={openNewReview}
          onEdit={(r) => setEditingReview(r)}
          onDelete={async (r) => { if (confirm("Delete this review?")) await deleteReview(r.id); }}
        />
      )}

      {tab === "missed" && <MissedTradesView />}
      {tab === "milestones" && <MilestonesView />}

      {/* Global modals */}
      {editingTrade && (
        <TradeForm
          open
          initial={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSave={async (t) => { await saveTrade(t); setEditingTrade(null); }}
        />
      )}

      <TradeDetail
        trade={viewingTrade}
        onClose={() => setViewingTrade(null)}
        onEdit={(t) => { setViewingTrade(null); setEditingTrade(t); }}
      />

      {editingReview && (
        <ReviewForm
          open
          initial={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={async (r) => { await saveReview(r); setEditingReview(null); }}
        />
      )}

      <SettingsPanel open={settingsOpen} settings={settings} onClose={() => setSettingsOpen(false)} />
    </PageShell>
  );
}
