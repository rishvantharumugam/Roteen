import { videoStyles } from "@/styles/video";

interface NotesProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Notes({ value, onChange }: NotesProps) {
  return (
    <section className={`${videoStyles.card} p-4`}>
      <div className={videoStyles.style_16afda27964379}>
        {["B", "I", "U", "-", "=", "T", "</>"].map((item) => (
          <button key={item} type="button" className={videoStyles.style_c9d86d01ecbd2}>{item}</button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your notes here..."
        className={videoStyles.style_1d6f3ccd68f353}
      />
    </section>
  );
}
