import { useState } from 'react'
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'
import { currentUser } from '@/data/mockData'
import { formatDate } from '@/lib/utils'

export function ProfilPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
  })

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun Anda"
      />

      {/* Profile header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-5 transition-colors">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/80 flex items-center justify-center text-2xl font-bold text-green-700 dark:text-green-300 shrink-0">
          {currentUser.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Bergabung sejak {formatDate(currentUser.createdAt)}
          </p>
        </div>
      </div>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Nama Lengkap" htmlFor="profile-name" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="profile-name"
                className="pl-9"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Alamat Email" htmlFor="profile-email" required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="profile-email"
                type="email"
                className="pl-9"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Nomor HP" htmlFor="profile-phone" required>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="profile-phone"
                type="tel"
                className="pl-9"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </FormField>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Password Saat Ini" htmlFor="current-pw">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="current-pw" type="password" placeholder="••••••••" className="pl-9" />
            </div>
          </FormField>
          <FormField label="Password Baru" htmlFor="new-pw">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="new-pw" type="password" placeholder="Minimal 8 karakter" className="pl-9" />
            </div>
          </FormField>
          <FormField label="Konfirmasi Password Baru" htmlFor="confirm-pw">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="confirm-pw" type="password" placeholder="Ulangi password baru" className="pl-9" />
            </div>
          </FormField>
          <Button variant="outline">
            <Lock className="w-4 h-4 mr-2" />
            Ubah Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
