

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-zinc-800 px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`pb-2 pt-3 text-sm font-medium ${activeTab === tab.id ? "border-b-2 border-purple-500 text-purple-400" : "border-b-2 border-transparent text-zinc-300"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
