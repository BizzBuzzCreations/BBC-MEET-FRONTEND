import { useState, useEffect } from "react";
import api from "../services/api";

export default function MeetingDetailsModal({
  meeting,
  onClose,
  onStatusUpdate,
  onVerify,
}) {
  const [localFlowStep, setLocalFlowStep] = useState("initial");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const baseURL = "https://r885rw6c-8000.inc1.devtunnels.ms";
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    try {
      const res = await api.uploadPhoto(meeting.uid, image);
      window.location.reload();
      onClose();
    } catch (err) {
      console.error("Failed to upload photo:", err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (meeting?.status === "in_progress") {
      setLocalFlowStep("completed_choice");
    } else if (meeting?.status === "scheduled") {
      setLocalFlowStep("initial");
    }
  }, [meeting?.status]);

  if (!meeting) return null;

  const handleMarkInProgress = async () => {
    setLocalFlowStep("completed_choice");

    if (meeting.status === "scheduled") {
      setLoading(true);
      try {
        await api.markInProgress(meeting.uid);
        if (onStatusUpdate) onStatusUpdate(meeting.id, "in_progress");
      } catch (error) {
        console.error("Failed to start meeting (proceeding anyway):", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMeetingCompletion = async (uid) => {
    try {
      const res = await api.markCompleted(uid);
      const data = await res.json();
      if (onStatusUpdate) onStatusUpdate(meeting.id, "completed");
      if (!data.status) {
        throw new Error(
          data.message || data.detail || "Failed to mark meeting as completed",
        );
        setMessage(data?.Message);
      }
    } catch (error) {
      console.error("Failed to mark meeting as completed:", error);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this meeting?"))
      return;

    onClose();
    try {
      await api.markCancelled(meeting.uid);
      if (onStatusUpdate) onStatusUpdate(meeting.id, "cancelled");
    } catch (error) {
      console.error("Failed to cancel meeting (silent)", error);
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const renderFooter = () => {
    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return (
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 text-center">
          <span
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${meeting.status === "completed" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
          >
            Meeting is {meeting.status}
          </span>
        </div>
      );
    }

    return (
      <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
        <div className="flex flex-col gap-3">
          {localFlowStep === "initial" && (
            <button
              onClick={() => setLocalFlowStep("in_progress_choice")}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-500/30 uppercase tracking-widest text-sm"
            >
              📅 Scheduled
            </button>
          )}

          {localFlowStep === "in_progress_choice" && (
            <div className="flex gap-3">
              <button
                onClick={handleMarkInProgress}
                disabled={loading}
                className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-blue-500/30 uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {loading ? "..." : "▶ In Progress"}
              </button>
              <button
                onClick={() => onClose()}
                disabled={loading}
                className="px-8 py-5 bg-red-50 text-red-600 font-black rounded-3xl hover:bg-red-100 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
              >
                ✖ Cancel
              </button>
            </div>
          )}

          {localFlowStep === "completed_choice" && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleMeetingCompletion(meeting.uid);
                  if (onVerify) onVerify(meeting);
                  onClose();
                }}
                className="flex-1 py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-green-500/30 uppercase tracking-widest text-sm"
              >
                ✅ Completed
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-8 py-5 bg-red-50 text-red-600 font-black rounded-3xl hover:bg-red-100 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
              >
                ✖ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-950 w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest leading-none flex items-center justify-center h-6">
                {meeting.meeting_type === "online"
                  ? "💻 Online"
                  : `🤝 ${meeting.meeting_type?.replace(/[-_]/g, " ")}`}
              </span>
              {meeting.status === "completed" && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {meeting.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-all"
          >
            <svg
              className="w-6 h-6"
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

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
          {/* Time & Location Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                When
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                {formatDate(meeting.start_time)}
              </p>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                {formatTime(meeting.start_time)} ({meeting.duration_minutes}{" "}
                min)
              </p>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Location
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {meeting.location || "Not Specified"}
              </p>
              {meeting.meeting_type === "online" &&
                meeting.location?.startsWith("http") && (
                  <a
                    href={meeting.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                )}
            </div>
          </div>

          {/* People Section */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
              Client's mail
            </p>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {meeting.recipient_emails?.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                      {email[0]}
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {email}
                    </span>
                  </div>
                ))}
                {meeting.company_participants && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white uppercase">
                      B
                    </div>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      {meeting.company_participants}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agenda Section */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Agenda / Notes
            </p>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {meeting.description || "No agenda provided for this meeting."}
              </p>
            </div>
          </div>

          {/* Image */}

          {meeting.status === "completed" &&
            (meeting.photos.length > 0 ? (
              <>
                <img
                  src={baseURL + meeting.photos[0].file}
                  className="w-full h-[300px] object-cover rounded-lg mt-2"
                  alt="Meeting"
                />
              </>
            ) : (
              <div
                style={{
                  maxWidth: "400px",
                  margin: "20px auto",
                  textAlign: "center",
                }}
              >
                <input
                  type="file"
                  id="photo"
                  accept="image/*"
                  onChange={handleChange}
                  style={{
                    maxWidth: "250px",
                    width: "100%",
                    padding: "10px",
                    border: "2px dashed #6c63ff",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9ff",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={handleUpload}
                  style={{
                    display: "block",
                    margin: "20px auto 0",
                    padding: "12px 20px",
                    backgroundColor: "#6c63ff",
                    color: "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Upload Photo
                </button>
                {preview && (
                  <div>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: "40%",
                        margin: "0 auto",
                        height: "auto",
                        borderRadius: "10px",
                        marginTop: "10px",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>

        {renderFooter()}
      </div>
    </div>
  );
}
