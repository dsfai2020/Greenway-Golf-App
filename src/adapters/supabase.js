let supabase = null
let channel = null

export async function initSupabase(){
  if(supabase) return supabase
  try{
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_KEY
    if(!url || !key) return null
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(url, key)
    return supabase
  }catch(e){
    console.warn('Supabase init failed', e)
    return null
  }
}

export async function publishSession(session){
  try{
    const sb = await initSupabase()
    if(!sb) return
    // Upsert into 'sessions' table - requires corresponding table in Supabase
    await sb.from('sessions').upsert(session)
  }catch(e){ console.warn('publishSession failed', e) }
}

export async function subscribeSession(sessionId, onUpdate){
  try{
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_KEY
    if(!url || !key) return () => {}
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(url, key)
    // Subscribe to changes on sessions table for the given id
    const ch = sb.channel(`public:sessions:id=eq.${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` }, (payload) => {
        if(onUpdate) onUpdate(payload.new)
      })
      .subscribe()
    channel = ch
    return () => { try{ ch.unsubscribe() }catch(e){} }
  }catch(err){ console.warn('subscribeSession failed', err); return () => {} }
}
