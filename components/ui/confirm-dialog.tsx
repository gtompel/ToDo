"use client"

import { useState, useCallback } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    description?: string
    resolve?: (v: boolean) => void
    confirmText?: string
    cancelText?: string
  }>({ open: false, title: "" })

  const confirm = useCallback(
    (options: {
      title: string
      description?: string
      confirmText?: string
      cancelText?: string
    }) =>
      new Promise<boolean>((resolve) => {
        setState({ open: true, title: options.title, description: options.description, resolve, confirmText: options.confirmText, cancelText: options.cancelText })
      }),
    []
  )

  const onClose = (result: boolean) => {
    state.resolve?.(result)
    setState((s) => ({ ...s, open: false, resolve: undefined }))
  }

  const dialog = (
    <AlertDialog open={state.open} onOpenChange={(o) => !o && onClose(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          {state.description ? (
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          ) : (
            <AlertDialogDescription>
              <VisuallyHidden>
                Подтверждение действия. Выберите «Да» для подтверждения или «Отмена» для отмены.
              </VisuallyHidden>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>
            {state.cancelText || "Отмена"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose(true)} autoFocus>
            {state.confirmText || "Да"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, dialog }
}


