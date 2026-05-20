"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, CheckCircle2, PlusCircle, Trash2, BookOpen, Paperclip, FileText,
} from "lucide-react";
import { getMasterResume, createMasterResume, updateMasterResume, TEST_USER_ID } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";

interface ReferenceFile {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

/* ── Underline Tab Button ────────────────────────────────────── */
function TabButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean; onClick: () => void; icon: React.ElementType; label: string; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150"
      style={{ color: active ? "#FAFAFA" : "#71717A" }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {count != null && count > 0 && (
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: active ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)",
            color: active ? "#10B981" : "#52525B",
          }}
        >
          {count}
        </span>
      )}
      {active && (
        <span
          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
          style={{ background: "#10B981" }}
        />
      )}
    </button>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function ResumePage() {
  const { masterResume, setMasterResume } = useAppStore();
  const [content, setContent] = useState(masterResume?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"master" | "references">("master");
  const [focusedEditor, setFocusedEditor] = useState(false);

  const [references, setReferences] = useState<ReferenceFile[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rf-references");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [refName, setRefName] = useState("");
  const [refContent, setRefContent] = useState("");

  useEffect(() => {
    if (masterResume) { setContent(masterResume.content); setLoading(false); return; }
    getMasterResume(TEST_USER_ID)
      .then((data) => { setMasterResume(data); setContent(data?.content ?? ""); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [masterResume, setMasterResume]);

  const saveRefs = (refs: ReferenceFile[]) => {
    setReferences(refs);
    localStorage.setItem("rf-references", JSON.stringify(refs));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = masterResume
        ? await updateMasterResume(TEST_USER_ID, content)
        : await createMasterResume(TEST_USER_ID, content);
      setMasterResume(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const addReference = () => {
    if (!refName.trim() || !refContent.trim()) return;
    saveRefs([
      ...references,
      { id: Date.now().toString(), name: refName, content: refContent, createdAt: new Date().toISOString() },
    ]);
    setRefName(""); setRefContent("");
  };

  const removeReference = (id: string) => saveRefs(references.filter((r) => r.id !== id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
          My Resume
        </h1>
        <p className="text-sm text-[#71717A] mt-0.5">
          Your master resume powers every tailored application.
        </p>
      </div>

      {/* Underline Tabs */}
      <div
        className="flex items-center gap-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <TabButton active={activeTab === "master"} onClick={() => setActiveTab("master")} icon={BookOpen} label="Master resume" />
        <TabButton active={activeTab === "references"} onClick={() => setActiveTab("references")} icon={Paperclip} label="Reference files" count={references.length} />
      </div>

      <AnimatePresence mode="wait">
        {/* ── Master Resume Tab ── */}
        {activeTab === "master" && (
          <motion.div
            key="master"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#131316",
                border: `1px solid ${focusedEditor ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                transition: "border-color 0.15s ease",
              }}
            >
              {/* Card header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div>
                  <p className="text-sm font-semibold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
                    Base resume
                  </p>
                  <p className="text-xs text-[#52525B] mt-0.5">
                    Paste your full resume — the AI uses this for every tailored version.
                  </p>
                </div>
                {masterResume?.updatedAt && (
                  <span className="text-[11px] text-[#3F3F46] flex-shrink-0 ml-4">
                    Last saved {formatDate(masterResume.updatedAt)}
                  </span>
                )}
              </div>

              {/* Editor */}
              <div className="p-4">
                {loading ? (
                  <div className="skeleton h-72 rounded-lg" />
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setSaved(false); }}
                    onFocus={() => setFocusedEditor(true)}
                    onBlur={() => setFocusedEditor(false)}
                    placeholder={"Paste your full resume here...\n\nInclude:\n• Name, email, phone, location, LinkedIn\n• Professional summary\n• Work experience with achievements\n• Skills\n• Education\n• Projects, certifications\n\nThe more detail you provide, the better your tailored resumes."}
                    className="w-full outline-none resize-none rounded-lg px-3.5 py-3 transition-all duration-150 placeholder:text-[#27272A]"
                    style={{
                      minHeight: 380,
                      background: "#0C0C0E",
                      color: "#D4D4D8",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12.5px",
                      lineHeight: 1.75,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  />
                )}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-[11px] font-mono text-[#3F3F46]">
                  {content.length.toLocaleString()} chars
                </span>
                <button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                  style={{
                    background: content.trim() ? "#10B981" : "#1C1C1F",
                    color: content.trim() ? "#0C0C0E" : "#52525B",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                   saved  ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                            <Save className="h-3.5 w-3.5" />}
                  {saved ? "Saved!" : "Save resume"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── References Tab ── */}
        {activeTab === "references" && (
          <motion.div
            key="references"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Add form */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-sm font-semibold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
                  Add reference file
                </p>
                <p className="text-xs text-[#52525B] mt-0.5">
                  Old resumes, achievements, projects — extra context for the AI.
                </p>
              </div>
              <input
                type="text"
                value={refName}
                onChange={(e) => setRefName(e.target.value)}
                placeholder="File name (e.g. Projects 2023)"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none placeholder:text-[#27272A]"
                style={{
                  background: "#0C0C0E",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#FAFAFA",
                }}
              />
              <textarea
                value={refContent}
                onChange={(e) => setRefContent(e.target.value)}
                placeholder="Paste the content here..."
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none placeholder:text-[#27272A]"
                style={{
                  minHeight: 100,
                  background: "#0C0C0E",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#D4D4D8",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12.5px",
                }}
              />
              <button
                onClick={addReference}
                disabled={!refName.trim() || !refContent.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  color: "#10B981",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add file
              </button>
            </div>

            {/* Files list */}
            {references.length === 0 ? (
              <div
                className="flex flex-col items-center py-12 rounded-xl"
                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}
              >
                <Paperclip className="h-8 w-8 mb-3" style={{ color: "#27272A" }} />
                <p className="text-sm text-[#52525B] text-center max-w-xs">
                  No reference files yet. Add old resumes or project lists to enrich the AI context.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {references.map((ref) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex items-start gap-3 p-3.5 rounded-lg"
                    style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <FileText className="h-3.5 w-3.5" style={{ color: "#71717A" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#FAFAFA] truncate" style={{ fontFamily: "var(--font-heading)" }}>
                        {ref.name}
                      </p>
                      <p className="text-[11px] text-[#3F3F46] mt-0.5">
                        {formatDate(ref.createdAt)} · {ref.content.length.toLocaleString()} chars
                      </p>
                    </div>
                    <button
                      onClick={() => removeReference(ref.id)}
                      className="p-1.5 rounded-lg transition-colors duration-150 hover:bg-red-500/10 flex-shrink-0"
                      style={{ color: "#52525B" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#52525B"; }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
