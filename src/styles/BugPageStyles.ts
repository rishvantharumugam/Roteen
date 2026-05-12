export const bugPageStyles = {
  root: "dark",
  shell: "flex h-screen w-full flex-col !bg-[#0f0f0e] transition-colors duration-300",
  headerWrap:
    "[&>header]:!bg-[#11100f] [&>header]:!border-[#26221f] [&_a]:!text-slate-300 [&_svg]:!fill-slate-300 [&_.border-blue-600]:!border-orange-500 [&_.text-blue-700]:!text-orange-500 transition-colors duration-300",
} as const;
