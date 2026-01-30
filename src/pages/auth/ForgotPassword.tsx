import type * as React from "react"
import { Button, Input, Dialog, DialogTitle, DialogContent, DialogActions } from "../../components/ui"

type ForgotPasswordProps = {
  open: boolean
  handleClose: () => void
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm">
            Enter your account&apos;s email address, and we&apos;ll send you a
            link to reset your password.
          </p>
          <Input
            type="email"
            name="email"
            placeholder="Email address"
            required
            autoFocus
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Continue
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
