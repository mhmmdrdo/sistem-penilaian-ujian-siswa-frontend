"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { api, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  Trash2,
  Pencil,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type User = {
  id: string;
  nama: string;
  email: string;
  role: string;
  bidang?: string;
  nip?: string;
  status: string;
};

const ITEMS_PER_PAGE = 5;

export default function ManajemenUserPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, admin: 0, guru: 0, siswa: 0 });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addForm, setAddForm] = useState({ nama: "", email: "", password: "", role: "guru", bidang: "", nip: "", status: "aktif" });
  const [editForm, setEditForm] = useState<User | null>(null);

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) { router.push("/auth/login"); return; }

    try {
      const res = await api.get<{
        data: User[];
        meta: { total: number; page: number; limit: number; totalPages: number };
        stats: { total: number; admin: number; guru: number; siswa: number };
      }>(`/admin/users?role=${roleFilter}&search=${searchQuery}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      
      setUsers(res.data);
      setTotal(res.meta.total);
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const handleAdd = async () => {
    if (!addForm.nama || !addForm.email || !addForm.password) return;
    try {
      await api.post("/admin/users", addForm);
      setShowAddModal(false);
      setAddForm({ nama: "", email: "", password: "", role: "guru", bidang: "", nip: "", status: "aktif" });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah user");
    }
  };

  const handleEdit = async () => {
    if (!editForm || !selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}`, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      setEditForm(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah user");
    }
  };

  const roleBadge: Record<string, string> = {
    admin: "bg-violet-100 text-violet-700 border border-violet-200",
    guru: "bg-blue-100 text-blue-700 border border-blue-200",
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 fixed md:relative z-50`}>
        <Sidebar role="admin" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Manajemen User" showHamburger onHamburgerClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 mb-6">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total User", val: stats.total, icon: <GraduationCap className="w-4 h-4" /> },
              { label: "Admin", val: stats.admin, icon: <Shield className="w-4 h-4" /> },
              { label: "Guru", val: stats.guru, icon: <GraduationCap className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
                <p className="text-2xl font-bold text-gray-900">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Filter & Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                {["all", "admin", "guru"].map((r) => (
                  <button key={r} onClick={() => { setRoleFilter(r); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === r ? "bg-zinc-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {r === "all" ? "Semua" : r === "admin" ? "Admin" : "Guru"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Bidang</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                          {u.nama.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{u.nama}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge[u.role] || ""}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{u.bidang || "-"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${u.status === "aktif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                        {u.status === "aktif" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {u.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedUser(u); setEditForm(u); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Menampilkan {users.length} dari {total} user</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah User Baru</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nama lengkap" value={addForm.nama} onChange={e => setAddForm({...addForm, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
              <input type="email" placeholder="Email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required />
              <input type="password" placeholder="Password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required minLength={6} />
              <select value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
              <input type="text" placeholder="NIP" value={addForm.nip} onChange={e => setAddForm({...addForm, nip: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" placeholder="Bidang/Sekolah" value={addForm.bidang} onChange={e => setAddForm({...addForm, bidang: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Batal</button>
              <button onClick={handleAdd} className="flex-1 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nama lengkap" value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="email" placeholder="Email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="guru">Guru</option>
                <option value="admin">Admin</option>
              </select>
              <input type="text" placeholder="NIP" value={editForm.nip || ""} onChange={e => setEditForm({...editForm, nip: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" placeholder="Bidang/Sekolah" value={editForm.bidang || ""} onChange={e => setEditForm({...editForm, bidang: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Batal</button>
              <button onClick={handleEdit} className="flex-1 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus User</h3>
            <p className="text-sm text-gray-500 mb-6">Yakin ingin menghapus user <span className="font-medium">{selectedUser.nama}</span>?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
