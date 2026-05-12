"use client";

import { bugPageStyles } from "@/styles/BugPageStyles";
import { BugWorkspace } from "@/store/bug/BugWorkspace";

export default function BugPageUI() {
  return (
    <div className={bugPageStyles.root}>
      <BugWorkspace />
    </div>
  );
}
