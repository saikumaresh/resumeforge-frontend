"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Pencil } from "lucide-react";

const SECTIONS = [
  { key: "summary",    label: "Professional Summary" },
  { key: "experience", label: "Work Experience" },
  { key: "skills",     label: "Skills" },
  { key: "education",  label: "Education" },
  { key: "projects",   label: "Projects" },
];

interface Props {
  sections: Record<string, string>;
  onChange: (key: string, value: string) => void;
  readOnly?: boolean;
}

function SectionBlock({
  sectionKey, label, value, onChange, readOnly,
}: {
  sectionKey: string; label: string; value: string;
  onChange: (v: string) => void; readOnly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external changes (from AI apply)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const startEdit = () => {
    if (readOnly) return;
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const finishEdit = () => {
    setEditing(false);
    onChange(localValue);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [editing, localValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="print-resume-section rounded-lg overflow-hidden"
      style={{
        background: "#131316",
        border: `1px solid ${editing ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
        transition: "border-color 0.15s ease",
      }}
    >
      {/* Section header */}
      <div
        className="no-print flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span
          className="section-label text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: editing ? "#10B981" : "#71717A", transition: "color 0.15s ease" }}
        >
          {label}
        </span>
        {!readOnly && (
          editing ? (
            <button
              onClick={finishEdit}
              className="flex items-center gap-1 text-[11px] font-medium transition-colors duration-150 hover:opacity-80"
              style={{ color: "#10B981" }}
            >
              <Check className="h-3 w-3" />
              Done
            </button>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1 text-[11px] font-medium transition-colors duration-150 hover:text-[#A1A1AA]"
              style={{ color: "#3F3F46" }}
            >
              <Pencil className="h-2.5 w-2.5" />
              Edit
            </button>
          )
        )}
      </div>

      {/* Print-only section label */}
      <div className="print-label px-4 pt-2" style={{ display: "none" }}>
        <span className="section-label text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6b7280" }}>
          {label}
        </span>
        <div style={{ borderBottom: "1px solid #e5e7eb", marginTop: 3, marginBottom: 6 }} />
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          {editing && !readOnly ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <textarea
                ref={textareaRef}
                value={localValue}
                onChange={e => {
                  setLocalValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onBlur={finishEdit}
                className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
                style={{
                  color: "#E4E4E7",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12.5px",
                  lineHeight: 1.75,
                  minHeight: 80,
                }}
              />
              <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-[11px] font-mono" style={{ color: "#3F3F46" }}>
                  {localValue.length} chars
                </span>
                <button
                  onMouseDown={e => { e.preventDefault(); finishEdit(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 hover:opacity-80"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <Check className="h-3 w-3" /> Save section
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              onClick={readOnly ? undefined : startEdit}
              className={readOnly ? "" : "cursor-text group"}
            >
              <p
                className="section-content text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  color: value ? "#D4D4D8" : "#3F3F46",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12.5px",
                  lineHeight: 1.75,
                  minHeight: 40,
                }}
              >
                {value || (
                  <span style={{ color: "#3F3F46" }}>Click to add content…</span>
                )}
              </p>
              {!readOnly && value && (
                <p className="no-print text-[10px] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: "#3F3F46" }}>
                  Click anywhere to edit
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function ResumeEditor({ sections, onChange, readOnly = false }: Props) {
  const visible = SECTIONS.filter(({ key }) => sections[key]);

  return (
    <div className="print-resume-container space-y-2">
      {visible.map((section) => (
        <SectionBlock
          key={section.key}
          sectionKey={section.key}
          label={section.label}
          value={sections[section.key]}
          onChange={(v) => onChange(section.key, v)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
