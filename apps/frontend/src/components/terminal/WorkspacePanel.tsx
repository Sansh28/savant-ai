type WorkspacePanelProps = {
  folder: string;
  pinned: boolean;
  sessionId: string | null;
  workspaceName: string;
  onFolderChange: (value: string) => void;
  onPinnedChange: (value: boolean) => void;
  onWorkspaceNameChange: (value: string) => void;
};

const FOLDERS = ["Inbox", "Literature Review", "Methods", "Results", "Follow Up"];

export function WorkspacePanel({
  folder,
  pinned,
  sessionId,
  workspaceName,
  onFolderChange,
  onPinnedChange,
  onWorkspaceNameChange,
}: WorkspacePanelProps) {
  return (
    <section className="rounded-2xl border border-[#cfb999] bg-[#fffaf2]/80 p-4 shadow-[0_10px_24px_rgba(66,46,20,0.08)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex-1">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8a6344]">Workspace</div>
          <div className="mt-2 grid gap-3 md:grid-cols-[1.4fr_0.9fr_auto]">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8f7456]">Workspace Name</span>
              <input
                value={workspaceName}
                onChange={(event) => onWorkspaceNameChange(event.target.value)}
                placeholder="Name this paper workspace"
                className="rounded-xl border border-[#cfb999] bg-[#fffdf8] px-3 py-2 text-sm text-[#261d17] focus:outline-none focus:border-[#8a6344]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8f7456]">Folder</span>
              <select
                value={folder}
                onChange={(event) => onFolderChange(event.target.value)}
                className="rounded-xl border border-[#cfb999] bg-[#fffdf8] px-3 py-2 text-sm text-[#261d17] focus:outline-none focus:border-[#8a6344]"
              >
                {FOLDERS.map((folderOption) => (
                  <option key={folderOption} value={folderOption}>
                    {folderOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-[#d8c7ab] bg-[#fffdf8] px-3 py-2 self-end">
              <input type="checkbox" checked={pinned} onChange={(event) => onPinnedChange(event.target.checked)} />
              <span className="text-xs font-mono text-[#5f4734]">Pin session</span>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-[#d8c7ab] bg-[#fffdf8] px-3 py-2 text-xs text-[#6d5742]">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#8f7456]">Session</div>
          <div className="mt-1 font-mono">{sessionId ? `${sessionId.slice(0, 10)}...` : "Created after upload"}</div>
        </div>
      </div>
    </section>
  );
}

