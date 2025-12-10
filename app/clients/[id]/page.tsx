import ClientHeader from "./components/ClientHeader";
import SummaryPanel from "./components/SummaryPanel";
import SearchPanel from "./components/SearchPanel";
import TimelinePanel from "./components/TimelinePanel";
import InsightsPanel from "./components/InsightsPanel";

export default async function ClientPage({ params }: { params: { id: string } }) {
  const clientId = params.id;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto space-y-10">
      <ClientHeader clientId={clientId} />
      <SummaryPanel clientId={clientId} />
      <SearchPanel clientId={clientId} />
      <InsightsPanel clientId={clientId} />
      <TimelinePanel clientId={clientId} />
    </div>
  );
}
