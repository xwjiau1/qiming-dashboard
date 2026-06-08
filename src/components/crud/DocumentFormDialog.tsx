import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

interface DocumentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (doc: any) => void
  agents: any[]
}

export default function DocumentFormDialog({ open, onOpenChange, onSubmit, agents }: DocumentFormDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('technical')
  const [department, setDepartment] = useState('技术部')
  const [updatedBy, setUpdatedBy] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = '请输入文档名称'
    if (!updatedBy) newErrors.updatedBy = '请选择更新者'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const agent = agents.find((a) => a.name === updatedBy)
    const deptColor = department === '设计部' ? 'gold' : 'blue'
    onSubmit({
      name: name.trim(),
      type,
      department,
      departmentColor: deptColor,
      updatedBy,
      updatedByAvatar: agent?.avatar || '',
      updatedAt: '刚刚',
      status: 'latest',
    })
    setName('')
    setType('technical')
    setDepartment('技术部')
    setUpdatedBy('')
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141418] border border-[#1E1E24] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">新建文档</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-gray-300">文档名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入文档名称" className="bg-[#1E1E24] border-[#2A2A32] text-white" />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">文档类型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  <SelectItem value="technical">技术文档</SelectItem>
                  <SelectItem value="design">设计文档</SelectItem>
                  <SelectItem value="product">产品文档</SelectItem>
                  <SelectItem value="meeting">会议记录</SelectItem>
                  <SelectItem value="architecture">架构文档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">所属部门</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  <SelectItem value="技术部">技术部</SelectItem>
                  <SelectItem value="设计部">设计部</SelectItem>
                  <SelectItem value="管理">管理</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">更新者</Label>
            <Select value={updatedBy} onValueChange={setUpdatedBy}>
              <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue placeholder="选择更新者" /></SelectTrigger>
              <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.name}>{agent.name} ({agent.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.updatedBy && <p className="text-xs text-red-400">{errors.updatedBy}</p>}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2A2A32] bg-[#1E1E24] text-gray-300">取消</Button>
          <Button onClick={handleSubmit} className="bg-[#0A84FF] hover:bg-[#0051D5] text-white">创建文档</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
