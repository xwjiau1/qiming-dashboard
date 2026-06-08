import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
}

export default function DeleteConfirmDialog({ open, onOpenChange, title, description, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141418] border border-[#1E1E24] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <p className="text-sm text-gray-400">{description}</p>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2A2A32] bg-[#1E1E24] text-gray-300">取消</Button>
          <Button onClick={() => { onConfirm(); onOpenChange(false); }} className="bg-red-500 hover:bg-red-600 text-white">确认删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
