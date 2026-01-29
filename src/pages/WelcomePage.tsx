import type React from "react"
import { useNavigate } from "react-router-dom"
import { Keyboard, ArrowRight } from "lucide-react"

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    void navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Gradient orbs for background effect */}
      <div
        className="orb-violet"
        style={{ top: "-10%", left: "20%", opacity: 0.6 }}
      />
      <div
        className="orb-blue"
        style={{ bottom: "10%", right: "15%", opacity: 0.5 }}
      />
      <div
        className="orb-indigo"
        style={{ top: "40%", left: "60%", opacity: 0.4 }}
      />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Icon with glass effect */}
        <div className="mb-8 flex justify-center">
          <div className="p-5 glass rounded-2xl glow-primary">
            <Keyboard className="w-16 h-16 text-indigo-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading with gradient text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight gradient-text">
          Keyboard Design Toolkit
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#a1a1aa] mb-10 max-w-lg mx-auto leading-relaxed">
          Craft custom keyboard layouts, export designs, and bring your ideas to
          life.
        </p>

        {/* CTA Button with gradient and glow */}
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-2 px-8 py-4 btn-gradient text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Footer hint */}
        <p className="mt-12 text-sm text-[#71717a]">
          Free to use &bull; No account required to explore
        </p>
      </div>
    </div>
  )
}

export default WelcomePage
