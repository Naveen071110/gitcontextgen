'use client';

import React from 'react';
import RepoWorkspaceView, { RepoWorkspaceViewProps } from './RepoWorkspaceView';
import { RepositoryAnalysisResult } from '@/lib/types';

export interface RepoDashboardProps {
  result: RepositoryAnalysisResult;
  onReSync?: () => void;
  isGuest?: boolean;
  isSaved?: boolean;
  onSave?: () => Promise<void> | void;
  showBackToDashboard?: boolean;
  className?: string;
}

export default function RepoDashboard({
  result,
  onReSync,
  isGuest = false,
  isSaved = true,
  onSave,
  showBackToDashboard = false,
  className = '',
}: RepoDashboardProps) {
  return (
    <RepoWorkspaceView
      result={result}
      onReSync={onReSync}
      isGuest={isGuest}
      isSaved={isSaved}
      onSave={onSave}
      showBackToDashboard={showBackToDashboard}
      className={className}
    />
  );
}

export { RepoWorkspaceView };
