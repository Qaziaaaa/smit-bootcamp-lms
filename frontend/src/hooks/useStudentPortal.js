import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import studentPortalService from '../services/studentPortalService.js';

export const useProfile = () =>
  useQuery({
    queryKey: ['student', 'profile'],
    queryFn: studentPortalService.getProfile,
  });

export const useAttendance = () =>
  useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: studentPortalService.getAttendance,
  });

export const useTeam = () =>
  useQuery({
    queryKey: ['student', 'team'],
    queryFn: studentPortalService.getTeam,
  });

export const useTasks = () =>
  useQuery({
    queryKey: ['student', 'tasks'],
    queryFn: studentPortalService.getTasks,
  });

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentPortalService.updateTaskProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tasks'] });
    },
  });
};
