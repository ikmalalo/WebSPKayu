import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Loader2, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { mockKriteria, mockSubKriteria } from '@/data/mockData'
import { cn } from '@/lib/utils'
import type { SubKriteria } from '@/types'

export function KuesionerPage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSelect = (kriteriaId: string, subKriteriaId: string) => {
    setAnswers({ ...answers, [kriteriaId]: subKriteriaId })
  }

  const totalQuestions = mockKriteria.length
  const answered = Object.keys(answers).length
  const progress = Math.round((answered / totalQuestions) * 100)

  const handleSubmit = () => {
    if (answered < totalQuestions) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/pantau-hasil')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuesioner Penilaian"
        description="Jawab seluruh pertanyaan berikut sesuai kondisi Anda yang sebenarnya"
      />

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Progress Pengisian</span>
          <span className="text-sm font-bold text-green-600">{answered}/{totalQuestions}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Pilih satu jawaban yang paling sesuai dengan kondisi Anda saat ini. Jawaban jujur akan membantu proses penilaian yang adil.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {mockKriteria.map((kriteria, idx) => {
          const subItems = mockSubKriteria.filter(sk => sk.kriteriaId === kriteria.id)
          const selected = answers[kriteria.id]

          return (
            <Card key={kriteria.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {kriteria.nama}
                      <span className={cn(
                        'ml-2 text-xs font-normal px-2 py-0.5 rounded-full',
                        kriteria.tipe === 'benefit'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      )}>
                        {kriteria.tipe === 'benefit' ? 'Benefit' : 'Cost'}
                      </span>
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">{kriteria.deskripsi}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subItems.map((sk: SubKriteria) => (
                    <label
                      key={sk.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                        selected === sk.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                          selected === sk.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-slate-300'
                        )}
                      >
                        {selected === sk.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name={kriteria.id}
                        value={sk.id}
                        className="sr-only"
                        onChange={() => handleSelect(kriteria.id, sk.id)}
                      />
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-sm text-slate-700">{sk.keterangan}</span>
                        <span className="text-xs font-bold text-slate-400 ml-2">Nilai: {sk.nilai}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={answered < totalQuestions || loading}
          className="min-w-[160px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {answered < totalQuestions
                ? `Isi ${totalQuestions - answered} pertanyaan lagi`
                : 'Kirim Jawaban'
              }
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
