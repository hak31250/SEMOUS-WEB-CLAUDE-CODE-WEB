export function playNotificationBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime

    function beep(start, freq = 880, duration = 0.12, gain = 0.3) {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      gainNode.gain.setValueAtTime(0, start)
      gainNode.gain.linearRampToValueAtTime(gain, start + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration)
      osc.start(start)
      osc.stop(start + duration)
    }

    beep(now, 880, 0.12)
    beep(now + 0.15, 1100, 0.12)

    setTimeout(() => ctx.close(), 500)
  } catch {
    // Audio not available
  }
}
