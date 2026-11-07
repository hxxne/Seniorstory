import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

const box = { width: 80, height: 80, borderRadius: 12, background: "#6366f1" }

export default function App() {
  const [show, setShow] = useState(true)
  const [wide, setWide] = useState(false)

  return (
    <main style={{ display: "grid", gap: 48, padding: 48, justifyItems: "center" }}>
      <h1>Motion for React</h1>

      {/* First animation */}
      <motion.div style={box} animate={{ rotate: 360 }} transition={{ duration: 2 }} />

      {/* Enter + hover & tap */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        Hover / Tap me
      </motion.button>

      {/* Layout animation */}
      <div
        onClick={() => setWide(!wide)}
        style={{ width: 300, display: "flex", justifyContent: wide ? "flex-end" : "flex-start", cursor: "pointer" }}
      >
        <motion.div layout style={box} />
      </div>

      {/* Exit animation */}
      <button onClick={() => setShow(!show)}>Toggle</button>
      <AnimatePresence>
        {show ? (
          <motion.div key="box" style={box} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        ) : null}
      </AnimatePresence>

      {/* Scroll animation */}
      <div style={{ height: "80vh" }} />
      <motion.div style={box} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} />
    </main>
  )
}
