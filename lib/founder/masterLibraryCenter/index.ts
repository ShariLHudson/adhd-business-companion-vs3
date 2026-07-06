import { composeMasterLibraryView } from "@/lib/sparkMasterLibrary";

export { composeMasterLibraryView };

export function getMasterLibraryBootstrap() {
  return composeMasterLibraryView();
}
