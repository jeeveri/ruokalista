import { useEffect, useState } from 'react'
import { storage } from './storage'

export function useTallennettu<T>(avain: string, oletus: T): [T, (arvo: T) => void] {
  const [arvo, setArvo] = useState<T>(oletus)
  const [ladattu, setLadattu] = useState(false)

  useEffect(() => {
    storage.get<T>(avain, oletus).then((a) => {
      setArvo(a)
      setLadattu(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avain])

  function aseta(uusi: T) {
    setArvo(uusi)
    if (ladattu) storage.set(avain, uusi)
  }

  return [arvo, aseta]
}