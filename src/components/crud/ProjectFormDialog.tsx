import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (project: any) => void
  agents: any[]
}

export default function ProjectFormDialog({ open, onOpenChange, onSubmit, agents }: ProjectFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('planning')
  const [deadline, setDeadline] = useState('')
  const [lead, setLead] = useState('')
  const [department, setDepartment] = useState('技术部')
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = '请输入项目名称'
    if (!description.trim()) newErrors.description = '请输入项目描述'
    if (!deadline.trim()) newErrors.deadline = '请输入截止日期'
    if (!lead) newErrors.lead = '请选择负责人'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const leadAgent = agents.find((a) => a.name === lead)
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      involvedDepartments: [department, '管理'],
      status,
      progress,
      lead,
      leadAvatar: leadAgent?.avatar || '',
      leadRole: leadAgent?.role || '',
      deadline,
      startDate: '今天',
      taskCount: 0,
      completedTasks: 0,
      cycles: [],
      workflow: [],
    })
    setName('')
    setDescription('')
    setStatus('planning')
    setDeadline('')
    setLead('')
    setDepartment('技术部')
    setProgress(0)
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141418] border border-[#1E1E24] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">新建项目</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-gray-300">项目名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入项目名称" className="bg-[#1E1E24] border-[#2A2A32] text-white" />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">项目描述</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="输入项目描述" rows={2} className="bg-[#1E1E24] border-[#2A2A32] text-white" />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">状态</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  <SelectItem value="planning">规划中</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">负责部门</Label>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">负责人</Label>
              <Select value={lead} onValueChange={setLead}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue placeholder="选择负责人" /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.name}>{agent.name} ({agent.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lead && <p className="text-xs text-red-400">{errors.lead}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">截止日期</Label>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="如：6月30日" className="bg-[#1E1E24] border-[#2A2A32] text-white" />
              {errors.deadline && <p className="text-xs text-red-400">{errors.deadline}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">当前进度 ({progress}%)</Label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="flex-1 accent-[#0A84FF]" />
              <span className="text-sm text-[#0A84FF] w-10 text-right">{progress}%</span>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2A2A32] bg-[#1E1E24] text-gray-300">取消</Button>
          <Button onClick={handleSubmit} className="bg-[#0A84FF] hover:bg-[#0051D5] text-white">创建项目</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
