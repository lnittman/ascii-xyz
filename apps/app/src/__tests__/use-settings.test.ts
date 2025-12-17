import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock convex/react before importing hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}))

// Mock the api
vi.mock('@repo/backend/convex/_generated/api', () => ({
  api: {
    functions: {
      settings: {
        get: 'settings.get',
        update: 'settings.update',
        toggleModel: 'settings.toggleModel',
        verifyApiKey: 'settings.verifyApiKey',
      },
    },
  },
}))

import { useQuery, useMutation } from 'convex/react'
import { useUserSettings } from '../hooks/use-settings'

const mockUseQuery = vi.mocked(useQuery)
const mockUseMutation = vi.mocked(useMutation)

describe('useUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('settings state', () => {
    it('returns loading status when query is undefined', () => {
      mockUseQuery.mockReturnValue(undefined)
      mockUseMutation.mockReturnValue(vi.fn())

      const { result } = renderHook(() => useUserSettings())

      expect(result.current.settingsState.status).toBe('loading')
      expect(result.current.settingsState.data).toBeUndefined()
    })

    it('returns ready status with settings data', () => {
      const mockSettings = {
        theme: 'dark',
        defaultVisibility: 'private',
        emailNotifications: true,
        defaultModelId: 'gpt-4',
      }
      mockUseQuery.mockReturnValue(mockSettings)
      mockUseMutation.mockReturnValue(vi.fn())

      const { result } = renderHook(() => useUserSettings())

      expect(result.current.settingsState.status).toBe('ready')
      expect(result.current.settingsState.data).toEqual(mockSettings)
    })

    it('returns empty status when settings is null (new user)', () => {
      mockUseQuery.mockReturnValue(null)
      mockUseMutation.mockReturnValue(vi.fn())

      const { result } = renderHook(() => useUserSettings())

      expect(result.current.settingsState.status).toBe('empty')
      expect(result.current.settingsState.data).toBeNull()
    })
  })

  describe('mutation functions', () => {
    it('exposes updateSettings function', () => {
      mockUseQuery.mockReturnValue(null)
      mockUseMutation.mockReturnValue(vi.fn())

      const { result } = renderHook(() => useUserSettings())

      expect(typeof result.current.updateSettings).toBe('function')
    })

    it('exposes toggleModel function', () => {
      mockUseQuery.mockReturnValue(null)
      mockUseMutation.mockReturnValue(vi.fn())

      const { result } = renderHook(() => useUserSettings())

      expect(typeof result.current.toggleModel).toBe('function')
    })

    it('exposes verifyApiKey function', () => {
      mockUseQuery.mockReturnValue(null)
      mockUseMutation.mockReturnValue(vi.fn())

      const { result } = renderHook(() => useUserSettings())

      expect(typeof result.current.verifyApiKey).toBe('function')
    })

    it('calls updateSettings mutation with correct arguments', async () => {
      const mockMutation = vi.fn()
      mockUseQuery.mockReturnValue({ theme: 'light' })
      mockUseMutation.mockReturnValue(mockMutation)

      const { result } = renderHook(() => useUserSettings())

      await act(async () => {
        await result.current.updateSettings({ theme: 'dark' })
      })

      expect(mockMutation).toHaveBeenCalledWith({ theme: 'dark' })
    })

    it('calls toggleModel mutation with correct arguments', async () => {
      const mockMutation = vi.fn()
      mockUseQuery.mockReturnValue({})
      mockUseMutation.mockReturnValue(mockMutation)

      const { result } = renderHook(() => useUserSettings())

      await act(async () => {
        await result.current.toggleModel('openai', 'gpt-4', true)
      })

      expect(mockMutation).toHaveBeenCalledWith({
        provider: 'openai',
        modelId: 'gpt-4',
        enabled: true,
      })
    })

    it('calls verifyApiKey mutation and returns result', async () => {
      const mockMutation = vi.fn().mockResolvedValue({ valid: true })
      mockUseQuery.mockReturnValue({})
      mockUseMutation.mockReturnValue(mockMutation)

      const { result } = renderHook(() => useUserSettings())

      let verifyResult
      await act(async () => {
        verifyResult = await result.current.verifyApiKey('openai', 'sk-test-key')
      })

      expect(mockMutation).toHaveBeenCalledWith({
        provider: 'openai',
        apiKey: 'sk-test-key',
      })
      expect(verifyResult).toEqual({ valid: true })
    })
  })
})
