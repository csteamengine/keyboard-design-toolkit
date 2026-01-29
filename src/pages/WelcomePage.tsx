import type React from "react"
import { useNavigate } from "react-router-dom"
import { Keyboard, ArrowRight } from "lucide-react"

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    void navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-indigo-500/10 rounded-2xl">
            <Keyboard className="w-16 h-16 text-indigo-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Keyboard Design Toolkit
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed">
          Craft custom keyboard layouts, export designs, and bring your ideas to
          life.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Footer hint */}
        <p className="mt-12 text-sm text-slate-400">
          Free to use • No account required to explore
        </p>
      </div>
    </div>
  )
}

export default WelcomePage
