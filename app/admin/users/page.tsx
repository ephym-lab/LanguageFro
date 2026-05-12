'use client'

import { useState } from 'react'
import {
  useAdminUsers,
  useSuspendUser,
  useActivateUser,
} from '@/lib/queries/admin'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Loader2, UserX, UserCheck } from 'lucide-react'
import { User } from '@/lib/types'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const pageSize = 20

  const usersQuery = useAdminUsers(page, pageSize)
  const suspendMutation = useSuspendUser()
  const activateMutation = useActivateUser()

  const handleSuspend = async (userId: string) => {
    try {
      await suspendMutation.mutateAsync(userId)
      usersQuery.refetch()
    } catch (error) {
      console.error('Failed to suspend user:', error)
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      await activateMutation.mutateAsync(userId)
      usersQuery.refetch()
    } catch (error) {
      console.error('Failed to activate user:', error)
    }
  }

  const columns = [
    {
      key: 'full_name' as const,
      label: 'Name',
    },
    {
      key: 'email' as const,
      label: 'Email',
    },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: string) => (
        <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'is_active' as const,
      label: 'Status',
      render: (value: boolean) => (
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            value
              ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100'
          }`}
        >
          {value ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      key: 'created_at' as const,
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'user_id' as const,
      label: 'Actions',
      render: (value: string, row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.is_active ? (
              <DropdownMenuItem
                onClick={() => handleSuspend(value)}
                className="text-destructive cursor-pointer"
              >
                <UserX className="w-4 h-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleActivate(value)}
                className="text-green-600 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Activate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const users = usersQuery.data?.users || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </Card>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={usersQuery.isLoading}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {usersQuery.data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {usersQuery.data.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={true}
              className="cursor-default"
            >
              Page {page}
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={
                !usersQuery.data ||
                page >= usersQuery.data.total_pages
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
