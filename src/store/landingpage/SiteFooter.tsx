type SiteFooterProps = {
  links: string[];
};

export function SiteFooter({ links }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <p className="font-heading text-xl font-semibold text-blue-700">Roteen</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            © 2024 Roteen. Journey through the cosmos of knowledge.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
          {links.map((link) => (
            <a key={link} href="#" className="transition hover:text-slate-950">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

