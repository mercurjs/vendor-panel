import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export const Home = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate("/dashboard", { replace: true })
  }, [navigate])

  return <div />
}
