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
import { useState, useEffect } from 'react'

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: any) => void
  projects: any[]
  agents: any[]
  initialStatus?: string
}

export default function TaskFormDialog({ open, onOpenChange, onSubmit, projects, agents, initialStatus = 'todo' }: TaskFormDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState(initialStatus)
  const [projectId, setProjectId] = useState('')
  const [department, setDepartment] = useState('技术部')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [type, setType] = useState('开发')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setStatus(initialStatus)
      setProjectId(projects[0]?.id || '')
    }
  }, [open, initialStatus, projects])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = '请输入任务标题'
    if (!projectId) newErrors.projectId = '请选择所属项目'
    if (!assignee) newErrors.assignee = '请选择负责人'
    if (!dueDate.trim()) newErrors.dueDate = '请输入截止日期'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const project = projects.find((p) => p.id === projectId)
    const agent = agents.find((a) => a.name === assignee)
    const deptColor = department === '设计部' ? 'gold' : 'blue'
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      projectId,
      projectName: project?.name || '',
      department,
      departmentColor: deptColor,
      type,
      assignee,
      assigneeAvatar: agent?.avatar || '',
      assigneeRole: agent?.role || '',
      dueDate,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setStatus('todo')
    setProjectId(projects[0]?.id || '')
    setDepartment('技术部')
    setAssignee('')
    setDueDate('')
    setType('开发')
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141418] border border-[#1E1E24] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">新建任务</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-gray-300">任务标题</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入任务标题" className="bg-[#1E1E24] border-[#2A2A32] text-white" />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-300">任务描述</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="输入任务描述（可选）" rows={2} className="bg-[#1E1E24] border-[#2A2A32] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">所属项目</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue placeholder="选择项目" /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && <p className="text-xs text-red-400">{errors.projectId}</p>}
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
              <Label className="text-gray-300">优先级</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">任务类型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  <SelectItem value="开发">开发</SelectItem>
                  <SelectItem value="设计">设计</SelectItem>
                  <SelectItem value="文档">文档</SelectItem>
                  <SelectItem value="测试">测试</SelectItem>
                  <SelectItem value="评审">评审</SelectItem>
                  <SelectItem value="分析">分析</SelectItem>
                  <SelectItem value="运维">运维</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300">负责人</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="bg-[#1E1E24] border-[#2A2A32] text-white"><SelectValue placeholder="选择负责人" /></SelectTrigger>
                <SelectContent className="bg-[#1E1E24] border-[#2A2A32]">
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.name}>{agent.name} ({agent.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignee && <p className="text-xs text-red-400">{errors.assignee}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300">截止日期</Label>
              <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="如：6月30日" className="bg-[#1E1E24] border-[#2A2A32] text-white" />
              {errors.dueDate && <p className="text-xs text-red-400">{errors.dueDate}</p>}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#2A2A32] bg-[#1E1E24] text-gray-300">取消</Button>
          <Button onClick={handleSubmit} className="bg-[#0A84FF] hover:bg-[#0051D5] text-white">创建任务</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
