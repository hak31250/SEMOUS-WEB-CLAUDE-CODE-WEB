import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/utils/format'
import { ScrollText, AlertTriangle, Info, Loader2 } from 'lucide-react'

export default function Logs() {
  const [adminLogs, setAdminLogs] = useState([])
  const [systemLogs, setSystemLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('admin')

  useEffect(() => {
    Promise.all([
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ]).then(([{ data: al }, { data: sl }]) => {
      setAdminLogs(al || [])
      setSystemLogs(sl || [])
      setLoading(false)
    })
  }, [])

  const levelIcon = { info: Info, warning: AlertTriangle, error: AlertTriangle }
  const levelColor = { info: 'text-blue-600', warning: 'text-orange-600', error: 'text-red-600' }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Logs</h1>

      <div className="flex rounded-xl overflow-hidden border border-semous-gray-mid mb-6 w-fit">
        {[{ key: 'admin', label: 'Logs admin' }, { key: 'system', label: 'Logs système' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-semous-black text-white' : 'text-semous-gray-text hover:text-semous-black'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'admin' ? (
        <div className="flex flex-col gap-2">
          {adminLogs.map(log => (
            <div key={log.id} className="card p-4 flex items-start gap-3">
              <ScrollText size={14} className="text-semous-gray-text mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-semous-gray-text">{log.entite} {log.entite_id ? `· ID: ${log.entite_id.slice(0, 8)}...` : ''}</p>
                {log.details && <pre className="text-xs text-semous-gray-text mt-1 overflow-hidden truncate">{JSON.stringify(log.details)}</pre>}
              </div>
              <p className="text-xs text-semous-gray-text shrink-0">{formatDate(log.created_at)}</p>
            </div>
          ))}
          {adminLogs.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucun log admin</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {systemLogs.map(log => {
            const Icon = levelIcon[log.niveau] || Info
            return (
              <div key={log.id} className="card p-4 flex items-start gap-3">
                <Icon size={14} className={`mt-0.5 shrink-0 ${levelColor[log.niveau] || 'text-semous-gray-text'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.message}</p>
                  {log.details && <pre className="text-xs text-semous-gray-text mt-1 overflow-hidden truncate">{JSON.stringify(log.details)}</pre>}
                </div>
                <p className="text-xs text-semous-gray-text shrink-0">{formatDate(log.created_at)}</p>
              </div>
            )
          })}
          {systemLogs.length === 0 && <p className="text-center py-12 text-semous-gray-text">Aucun log système</p>}
        </div>
      )}
    </div>
  )
}
