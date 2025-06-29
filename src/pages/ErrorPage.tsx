import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"

export default function ErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        We encountered an unexpected error. Please try again.
      </Typography>
      {onRetry && (
        <Button variant="contained" color="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  )
}
