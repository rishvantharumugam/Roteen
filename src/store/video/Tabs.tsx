import { videoStyles } from "@/styles/video";

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
    <div className={videoStyles.style_18c5d41ef748c4}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`pb-2 pt-3 text-sm font-medium ${activeTab === tab.id ? videoStyles.activeTab : videoStyles.inactiveTab}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
