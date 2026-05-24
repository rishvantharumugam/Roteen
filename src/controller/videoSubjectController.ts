import {
  formatVideoPageHeading,
  type VideoSubjectFilter,
} from "@/service/videoSubjectService";
import {
  hasActiveVideoSubjectFilter,
  parseVideoSubjectFilter,
} from "@/navigation/videoSubjectNavigation";
import type { ReadonlyURLSearchParams } from "next/navigation";

export type VideoSubjectViewState = {
  filter: VideoSubjectFilter;
  isFiltered: boolean;
  pageHeading: string | null;
};

export function getVideoSubjectViewState(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): VideoSubjectViewState {
  const filter = parseVideoSubjectFilter(searchParams);
  const isFiltered = hasActiveVideoSubjectFilter(filter);

  return {
    filter,
    isFiltered,
    pageHeading: isFiltered ? null : null,
  };
}

export function resolveVideoPageHeading(subjectName: string, isFiltered: boolean): string | null {
  if (!isFiltered) {
    return null;
  }

  return formatVideoPageHeading(subjectName);
}
