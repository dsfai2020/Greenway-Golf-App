import React, { createContext, useContext, useEffect, useState } from 'react'

const USERS_KEY = 'golf-users'
const SESSION_KEY = 'golf-session'

const AuthContext = createContext(null)

function loadUsers(){ try{ const raw = localStorage.getItem(USERS_KEY); return raw ? JSON.parse(raw) : {} }catch(e){ return {} } }
function saveUsers(u){ try{ localStorage.setItem(USERS_KEY, JSON.stringify(u)) }catch(e){} }

export function AuthProvider({ children }){
  const [users, setUsers] = useState(() => loadUsers())
  const [current, setCurrent] = useState(() => {
    try{ const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null }catch(e){ return null }
  })

  useEffect(()=>{ saveUsers(users) }, [users])

  useEffect(()=>{
    try{ if(current) localStorage.setItem(SESSION_KEY, JSON.stringify(current)); else localStorage.removeItem(SESSION_KEY) }catch(e){}
  }, [current])

  function simpleHash(p){ try{ return btoa(p || '') }catch(e){ return p } }

  function register({ email, name, password }){
    if(!email || !name || !password) throw new Error('Missing fields')
    const existing = users[email]
    if(existing) throw new Error('User exists')
    const next = {...users, [email]: { name, email, pw: simpleHash(password) }}
    setUsers(next)
    const u = { name, email }
    setCurrent(u)
    return u
  }

  function signIn({ email, password }){
    const found = users[email]
    if(!found || found.pw !== simpleHash(password)) throw new Error('Invalid credentials')
    const u = { name: found.name, email }
    setCurrent(u)
    return u
  }

  function signOut(){ setCurrent(null) }

  function editProfile({ email, name, password }){
    const found = users[email]
    if(!found) throw new Error('User not found')
    const updated = {...found, name: name || found.name}
    if(password) updated.pw = simpleHash(password)
    const next = {...users, [email]: updated}
    setUsers(next)
    if(current && current.email === email) setCurrent({ name: updated.name, email })
    return updated
  }

  // per-user rounds storage: key golf-rounds-<email>
  function saveRound(email, id, data){
    try{
      const k = `golf-rounds-${email}`
      const raw = localStorage.getItem(k)
      const list = raw ? JSON.parse(raw) : {}
      list[id] = data
      localStorage.setItem(k, JSON.stringify(list))
    }catch(e){}
  }

  function loadRounds(email){
    try{ const raw = localStorage.getItem(`golf-rounds-${email}`); return raw ? JSON.parse(raw) : {} }catch(e){ return {} }
  }

  const value = { users, current, register, signIn, signOut, editProfile, saveRound, loadRounds }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }

export default AuthContext
