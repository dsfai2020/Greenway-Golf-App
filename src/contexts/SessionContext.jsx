import React, { createContext, useContext, useEffect, useState } from 'react'
import { publishSession, subscribeSession } from '../adapters/supabase'

const SessionContext = createContext(null)

// Session shape:
// { id, name, holes, players: [{id, name, email?, scores: [{hole, strokes, swings: []}]}], createdAt }

export function SessionProvider({ children }){
  const [session, setSession] = useState(() => ({ id: null, name: '', holes: 18, players: [], createdAt: null }))

  function createSession({ name='Round', holes=18 }){
    const s = { id: `sess_${Date.now()}`, name, holes, players: [], createdAt: Date.now() }
    setSession(s)
    // publish to remote if supabase available
    try{ publishSession(s) }catch(e){}
    return s
  }

  function addPlayer({ id, name, email }){
    setSession(s => {
      if(!s) return s
      if(s.players.find(p=> p.id === id)) return s
      const player = { id, name, email, scores: Array.from({length: s.holes}, (_,i)=> ({ hole: i+1, strokes: 0, swings: [] })) }
      return {...s, players: [...s.players, player] }
    })
  }

  function removePlayer(id){ setSession(s => ({...s, players: s.players.filter(p=> p.id !== id)})) }

  function updatePlayerScore(playerId, holeIndex, scoreObj){
    setSession(s => {
      if(!s) return s
      const players = s.players.map(p => {
        if(p.id !== playerId) return p
        const scores = p.scores.map((sc, idx) => idx === holeIndex ? {...sc, ...scoreObj} : sc)
        return {...p, scores}
      })
      const next = {...s, players}
      try{ publishSession(next) }catch(e){}
      return next
    })
  }

  function exportSession(){ return session }

  const value = { session, createSession, addPlayer, removePlayer, updatePlayerScore, exportSession, setSession }
  // subscribe to remote updates when session.id changes
  useEffect(()=>{
    let unsub = null
    if(session && session.id){
      (async ()=>{
        try{
          unsub = await subscribeSession(session.id, (remote) => {
            if(remote && remote.id !== session.id) return
            // merge remote session state - simple replace for now
            setSession(remote)
          })
        }catch(e){ console.warn(e) }
      })()
    }
    return () => { try{ if(typeof unsub === 'function') unsub(); }catch(e){} }
  }, [session && session.id])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(){ return useContext(SessionContext) }

export default SessionContext
