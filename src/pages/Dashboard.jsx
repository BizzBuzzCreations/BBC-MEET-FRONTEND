import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScheduleMeetingModal from "../components/ScheduleMeetingModal";
import MeetingDetailsModal from "../components/MeetingDetailsModal";
import MeetingVerificationModal from "../components/MeetingVerificationModal";
import MeetingCompletionModal from "../components/MeetingCompletionModal";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import api from "../services/api";
const baseURL = "https://r885rw6c-8000.inc1.devtunnels.ms";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Plan Meeting",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
];

const ADMIN_NAV = {
  id: "admin",
  label: "Admin Panel",
  icon: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const PRIORITY_BADGE = {
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  Medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

function formatMeetingDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatMeetingTime(dateStr) {
  if (!dateStr) return "";
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
}

export default function Dashboard() {
  const { currentUser, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [verifyingMeeting, setVerifyingMeeting] = useState(null);
  const [completingMeeting, setCompletingMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const fetchMeetings = async () => {
    try {
      setFetching(true);
      const data = await api.getMeetings();
      // Backend returns array of meetings. Ensure they have IDs for UI tracking.
      const processed = (Array.isArray(data) ? data : []).map((m, idx) => ({
        ...m,
        id: m.id || `temp-${idx}-${Date.now()}`,
      }));
      setMeetings(processed);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveMeeting = async () => {
    await fetchMeetings();
    setShowSchedule(false);
  };

  const handleDeleteMeeting = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting?"))
      return;
    try {
      await api.deleteMeeting(id);
      fetchMeetings();
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  const handleMarkInProgress = async (id) => {
    try {
      await api.markInProgress(id);
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "in_progress" } : m)),
      );
    } catch (error) {
      console.error("Failed to mark meeting in progress:", error);
    }
  };

  const handleMarkCancelled = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this meeting?"))
      return;
    try {
      await api.markCancelled(id);
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "cancelled" } : m)),
      );
    } catch (error) {
      console.error("Failed to cancel meeting:", error);
      // Non-blocking failure
    }
  };

  const handleMarkCompleted = (id) => {
    if (!id) return;
    // Update local state: transition to completed
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "completed" } : m)),
    );
  };

  const handleVerified = (id) => {
    if (!id) return;
    // Finalize state: both verified and completed
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, is_verified: true, status: "completed" } : m,
      ),
    );
  };

  const navItems = [
    ...NAV_ITEMS,
    ...(currentUser?.role === "admin" ? [ADMIN_NAV] : []),
  ];

  // Filter logic
  const filteredMeetings = meetings.filter((m) => {
    const matchSearch =
      !search ||
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      (m.meeting_type &&
        m.meeting_type.toLowerCase().includes(search.toLowerCase()));
    if (!matchSearch) return false;

    if (filter === "thisWeek") {
      const mDate = new Date(m.start_time);
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      return mDate >= startOfWeek && mDate <= endOfWeek;
    }
    return true;
  });

  const now = new Date();
  const todayCount = meetings.filter((m) => {
    const d = new Date(m.start_time);
    return d.toDateString() === now.toDateString();
  }).length;

  const upcomingCount = meetings.filter(
    (m) => new Date(m.start_time) > now,
  ).length;
  const completedCount = meetings.filter(
    (m) => new Date(m.start_time) < now,
  ).length;

  const STAT_CARDS = [
    {
      label: "Total Meetings",
      value: meetings.length,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    {
      label: "Today",
      value: todayCount,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/40",
    },
    {
      label: "Completed",
      value: completedCount,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/40",
    },
  ];

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden ${darkMode ? "dark" : ""}`}
    >
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
                transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                flex flex-col shadow-2xl lg:shadow-none
            `}
      >
        <Logo className="px-6 py-8 border-b border-gray-100 dark:border-gray-800" />

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === "plan") setShowSchedule(true);
                setSidebarOpen(false);
              }}
              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                                ${
                                  activeNav === item.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                }
                            `}
            >
              <span
                className={
                  activeNav === item.id
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-600"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
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
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
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
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white truncate">
                Hello,{" "}
                {currentUser?.full_name?.split(" ")[0] ||
                  currentUser?.username ||
                  "User"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:relative sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 w-40 lg:w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-sm font-extrabold rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="sm:inline uppercase tracking-widest sm:normal-case sm:tracking-normal">
                Schedule
              </span>
            </button>
          </div>
        </header>

        {/* Dashboard Scroll Area */}
        <div className="flex-1 overflow-y-auto pt-4 px-4 sm:pt-8 sm:px-8 pb-0 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STAT_CARDS.map((card) => (
              <div
                key={card.label}
                className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.02]"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${card.bg} flex items-center justify-center mb-3 sm:mb-4 text-lg sm:text-xl`}
                >
                  {card.label === "Total Meetings"
                    ? "🗓️"
                    : card.label === "Upcoming"
                      ? "🚀"
                      : card.label === "Today"
                        ? "🎯"
                        : "✅"}
                </div>
                <p className="text-[10px] sm:text-sm font-bold text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className={`text-2xl sm:text-4xl font-black ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Meetings List */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Planned Meetings
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] font-black rounded-lg">
                  {filteredMeetings.length}
                </span>
              </h2>
              <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                {["all", "thisWeek"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 sm:flex-none whitespace-nowrap px-6 py-2.5 text-[10px] sm:text-xs font-black rounded-xl transition-all uppercase tracking-widest ${filter === f ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {f === "all" ? "All Time" : "This Week"}
                  </button>
                ))}
              </div>
            </div>

            {fetching ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 font-bold animate-pulse">
                  Syncing with backend...
                </p>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className="py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center text-center px-4">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  No meetings found
                </h3>
                <p className="text-gray-500 max-w-xs text-sm mb-6 font-medium">
                  Clear your filters or create a new meeting to populate your
                  schedule.
                </p>
                <button
                  onClick={() => setShowSchedule(true)}
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  + Add New Meeting
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeeting(m)}
                    className="group bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:p-5 rounded-[2rem] border border-transparent hover:border-blue-500/30 hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col sm:flex-row gap-5 items-start cursor-pointer active:scale-[0.98]"
                  >
                    <div className="w-full sm:w-20 h-16 sm:h-20 bg-white dark:bg-gray-800 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center p-4 sm:p-2 text-center shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                        {new Date(m.start_time).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {new Date(m.start_time).getDate()}
                      </span>
                      <span className="sm:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(m.start_time).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-lg font-black text-gray-900 dark:text-white truncate">
                          {m.title}
                        </h4>
                        {m.status === "completed" && (
                          <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={4}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                        {m.status === "cancelled" && (
                          <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={4}
                                d="M6 6L18 18M6 18L18 6"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-base grayscale opacity-70">
                            🕒
                          </span>{" "}
                          {formatMeetingTime(m.start_time)}
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-base grayscale opacity-70">
                            📍
                          </span>{" "}
                          {m.location || "Remote"}
                        </div>
                      </div>

                      {m.company_participants && (
                        <div className="text-[9px] font-black text-blue-600/70 dark:text-blue-400/70 uppercase tracking-[0.2em] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                          {m.company_participants} Team Members
                        </div>
                      )}

                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex -space-x-2 mr-2">
                          {m.recipient_emails?.slice(0, 3).map((email, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center border-2 border-white dark:border-gray-800 text-[10px] font-black text-indigo-600 uppercase"
                            >
                              {email[0]}
                            </div>
                          ))}
                        </div>
                        {m.recipient_emails?.length > 3 && (
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            +{m.recipient_emails.length - 3} More
                          </span>
                        )}
                      </div>
                      {m.photos.length > 0 && (
                        <img
                          src={baseURL + m.photos[0].file}
                          className="w-full h-24 object-cover rounded-lg mt-2"
                          alt="Meeting"
                        />
                      )}
                    </div>

                    <div className="flex flex-row items-center justify-between gap-3 w-full sm:w-auto self-stretch pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                      <span className="sm:hidden px-3 py-1 bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-500 rounded-lg uppercase tracking-[0.2em]">
                        {m.meeting_type?.replace(/[-_]/g, " ")}
                      </span>

                      {/* Action buttons removed as per user request. Actions moved to Details Modal. */}
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="h-10 w-10 bg-white dark:bg-gray-800 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-blue-900/10 transition-all active:scale-95 shadow-sm group-hover:border-blue-500/20">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>

      {/* Modals */}
      {showSchedule && (
        <ScheduleMeetingModal
          onClose={() => setShowSchedule(false)}
          onSave={handleSaveMeeting}
        />
      )}

      {selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onStatusUpdate={(id, status) => {
            setMeetings((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status } : m)),
            );
            if (selectedMeeting.id === id) {
              setSelectedMeeting((prev) => ({ ...prev, status }));
            }
          }}
          onVerify={(m) => setVerifyingMeeting(m)}
        />
      )}

      {verifyingMeeting && (
        <MeetingVerificationModal
          meeting={verifyingMeeting}
          onClose={() => setVerifyingMeeting(null)}
          onVerified={handleVerified}
        />
      )}

      {completingMeeting && (
        <MeetingCompletionModal
          meeting={completingMeeting}
          onClose={() => setCompletingMeeting(null)}
          onCompleted={handleMarkCompleted}
        />
      )}
    </div>
  );
}
