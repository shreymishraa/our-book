import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("contacts"); // "contacts" | "users"

  // Data states
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  // Search filter
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [contactsRes, usersRes] = await Promise.all([
        api.get("/contact/admin"),
        api.get("/auth/users"),
      ]);

      setContacts(contactsRes.data.contacts || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.response?.status === 401) {
        setError("Session expired or token missing. Please register/verify.");
        navigate("/register", { state: { from: "/admin" } });
      } else {
        setError(err.response?.data?.message || "Failed to load admin data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) return;

    try {
      setDeleteId(id);
      await api.delete(`/contact/admin/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete contact: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleteId(null);
    }
  };

  // Filtered lists
  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.mobile.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🛡️</span>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Manage registered users and user contact inquiries in one centralized console.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <Link
              to="/books"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Go to Books
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Total Registered Users</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{users.length}</div>
            <div className="text-xs text-gray-400 mt-1">
              Verified: {users.filter((u) => u.is_verified === 1).length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Contact Inquiries</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{contacts.length}</div>
            <div className="text-xs text-gray-400 mt-1">Total messages submitted</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500">Admin Privileges</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">Active</div>
            <div className="text-xs text-gray-400 mt-1">Authenticated via JWT Role</div>
          </div>
        </div>

        {/* Tab Controls + Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 p-1 bg-gray-200 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("contacts")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "contacts"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📬 Contact Messages ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "users"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              👥 Registered Users ({users.length})
            </button>
          </div>

          <input
            type="text"
            placeholder={`Search ${activeTab === "contacts" ? "inquiries..." : "users..."}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-600 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm text-gray-500">
            <div className="inline-block animate-spin text-4xl mb-3">⏳</div>
            <p className="font-medium">Loading administrative data...</p>
          </div>
        )}

        {/* TAB 1: CONTACT INQUIRIES */}
        {!loading && activeTab === "contacts" && (
          <div className="space-y-4">
            {filteredContacts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-gray-800">No Contact Inquiries</h3>
                <p className="text-sm mt-1">
                  {search ? "No inquiries matched your search." : "No messages have been submitted yet."}
                </p>
              </div>
            ) : (
              filteredContacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {c.name}
                        </span>
                        <a
                          href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                          className="text-blue-600 text-sm hover:underline font-medium"
                        >
                          ✉️ {c.email}
                        </a>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                          {c.created_at}
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-800 text-base mb-2">
                        Subject: <span className="text-blue-700">{c.subject}</span>
                      </h4>

                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 text-gray-700 text-sm whitespace-pre-wrap">
                        {c.message}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                      <a
                        href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                        className="text-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold transition"
                      >
                        Reply by Email
                      </a>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        disabled={deleteId === c.id}
                        className="text-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                      >
                        {deleteId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: REGISTERED USERS */}
        {!loading && activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-lg font-bold text-gray-800">No Users Found</h3>
                <p className="text-sm mt-1">
                  {search ? "No registered users match your search." : "No registered users exist."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-xs">
                    <tr>
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Mobile Number</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Verification</th>
                      <th className="py-4 px-6">Verified At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-4 px-6 font-mono text-xs text-gray-500">#{u.id}</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">{u.name}</td>
                        <td className="py-4 px-6 text-blue-600">{u.email}</td>
                        <td className="py-4 px-6 font-mono">
                          {u.country_code} {u.mobile}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {u.is_verified === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending OTP
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">
                          {u.verified_at || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
