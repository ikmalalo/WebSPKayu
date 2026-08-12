import { useState } from 'react'
import { Save, Settings, Shield, Bell, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'

export function PengaturanPage() {
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Sistem" description="Konfigurasi parameter aplikasi SPK Mustahik" />

      {/* General config */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-green-600" />
            <CardTitle>Pengaturan Umum</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Nama Lembaga / Pengelola Zakat">
            <Input defaultValue="BAZNAS Samarinda" />
          </FormField>
          <FormField label="Threshold Cutoff TOPSIS (Nilai Minimum Layak)">
            <Input type="number" step="0.05" defaultValue="0.60" />
            <p className="text-xs text-slate-400 mt-1">Calon mustahik dengan nilai preferensi ≥ 0.60 dianggap Layak Didanai.</p>
          </FormField>
          <FormField label="Kuota Penerima Zakat per Periode">
            <Input type="number" defaultValue="50" />
          </FormField>
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="w-4 h-4 mr-2" /> Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <CardTitle>Keamanan & Akses</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Verifikasi 2 Langkah (2FA) Admin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Meningkatkan keamanan akun administrator</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-green-600" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Notifikasi Email Otomatis</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kirim status pengajuan ke email user</p>
            </div>
            <input type="checkbox" className="w-4 h-4 accent-green-600" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
