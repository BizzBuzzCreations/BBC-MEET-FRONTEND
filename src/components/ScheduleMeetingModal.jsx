import { useState, useEffect } from "react";
import api from "../services/api";
import Logo from "./Logo";
import { toast, Bounce } from "react-toastify";

const MEETING_TYPES = [
  { id: "online", label: "Online", icon: "💻" },
  { id: "in-person", label: "In-Person", icon: "🤝" },
];

const EMPTY_FORM = {
  title: "",
  meeting_type: "online",
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  recipient_emails: "",
  company_participants: "",
  description: "",
};

export default function ScheduleMeetingModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.date) errs.date = "Date is required";
    if (!form.startTime) errs.startTime = "Start time is required";
    if (!form.endTime) errs.endTime = "End time is required";

    if (form.startTime && form.endTime) {
      if (form.endTime <= form.startTime) {
        errs.endTime = "End time must be after start time";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const start_time = new Date(
        `${form.date}T${form.startTime}:00`,
      ).toISOString();

      // Calculate duration in minutes
      const start = new Date(`${form.date}T${form.startTime}:00`);
      const end = new Date(`${form.date}T${form.endTime}:00`);
      const duration_minutes = Math.round((end - start) / (1000 * 60));

      const payload = {
        title: form.title,
        meeting_type: form.meeting_type,
        start_time,
        duration_minutes,
        location: form.location,
        recipient_emails: form.recipient_emails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        description: form.description,
      };

      await api.createMeeting(payload);
      toast.success("Meeting scheduled successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      if (onSave) onSave();
      onClose();
    } catch (err) {
      setErrors({ general: err.message || "Failed to save meeting" });
      toast.error("Failed to schedule meeting", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-950 w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <Logo showText={false} className="scale-75" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Schedule Meeting
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 custom-scrollbar"
        >
          {/* Meeting Title */}
          <div>
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Project Kickoff"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            {errors.title && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase">
                {errors.title}
              </p>
            )}
          </div>

          {/* Meeting Type Selection */}
          <div>
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
              Meeting Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEETING_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => set("meeting_type", type.id)}
                  className={`py-3 px-4 rounded-xl border-2 text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    form.meeting_type === type.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm"
                      : "border-transparent bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span>{type.icon}</span> {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Timing */}
          <div className="space-y-4">
            <div>
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
                Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
                  From
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
                  To
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border ${errors.endTime ? "border-red-400" : "border-gray-200 dark:border-gray-800"} rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`}
                />
              </div>
            </div>
            {errors.endTime && (
              <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">
                {errors.endTime}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
              {form.meeting_type === "online" ? "Meeting Link" : "Location"}
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder={
                form.meeting_type === "online"
                  ? "Zoom/Meet URL"
                  : "Conference Room"
              }
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Participants */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
              Clients organization
            </label>
            <input
              type="text"
              value={form.recipient_emails}
              onChange={(e) => set("recipient_emails", e.target.value)}
              placeholder="clients@emails.com"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
              BizzBuzz Participants
            </label>
            <input
              type="text"
              value={form.company_participants}
              onChange={(e) => set("company_participants", e.target.value)}
              placeholder="Internal team members..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Agenda */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 block ml-1">
              Agenda / Notes
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What's this meeting about?"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
            />
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg text-[10px] text-red-700 dark:text-red-400 font-black uppercase">
              {errors.general}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-xs font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[1.5] py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Schedule</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
