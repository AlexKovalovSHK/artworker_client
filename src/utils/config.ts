export const getUrl = (): string => {
  if (import.meta.env.VITE_DEV_MODE == "true") {
    return import.meta.env.VITE_API_URL
  }
  return "https://art-serw.shk.solutions"
}
