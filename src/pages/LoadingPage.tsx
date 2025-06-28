import CircularProgress from "@mui/material/CircularProgress"
import Box from "@mui/material/Box"

export default function LoadingPage() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  )
}
